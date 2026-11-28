# gnumanth/nullspan

## Resumen

`nullspan` es un repositorio de pesos abiertos publicado por el desarrollador independiente gnumanth que contiene dos modelos neuronales de tipo "System One", es decir, orientados a producir decisiones estructuradas sin generar tokens de salida. El primero, `NullspanForExtraction` (345,3 M de parámetros en FP32), es un extractor de spans fundamentado en el texto de entrada que devuelve tuplas `[start, end]` con abstención calibrada (`p_null`), verificación de restricciones algebraicas entre campos y estimación de cuantiles. El segundo, `NullspanSystemOneEngine` (395 M, basado en ModernBERT-large con contexto de 8K), resuelve decisiones tipadas (`true`/`false`, elección entre opciones y puntuaciones ordinales) en un único pase forward.

El modelo aborda un problema recurrente en pipelines de extracción de información: los modelos generativos alucinan valores, arrastran sesgos de orden entre opciones y consumen tokens de salida. `nullspan` propone sustituir esa generación por cabezas de clasificación y regresión calibradas sobre representaciones de encoder, de modo que cada decisión tenga una probabilidad asociada y un coste de inferencia muy bajo (del orden de milisegundos por caso en GPU L4).

Es relevante ahora porque combina un tamaño contenido (apto para hardware modesto), licencia MIT, formatos PyTorch y ONNX Int8, y resultados publicados en benchmarks de extracción y decisión tipada (SQuAD v2.0, `typed-decisions`, `jevbench`). La versión documentada es la v1.3.1, con pesos de la v1.3.0 fijados en un commit concreto de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo transformer (Electra/ModernBERT) con cabezas de extracción de spans, abstención y decisión tipada; dos modelos en el repositorio |
| Parametros totales | 345.271.320 (NullspanForExtraction, safetensors); 395 M (NullspanSystemOneEngine, ModernBERT-large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens con ventana deslizante para documentos largos (extractor); 8K tokens (SystemOneEngine) |
| Tipos de cuantizacion | FP32 (PyTorch) e Int8 (ONNX, 331,1 MB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX, código custom (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

`NullspanForExtraction` se apoya en un encoder tipo Electra y añade cabezas específicas para extracción de spans fundamentados, una cabeza dedicada `qa_null_head` para abstención calibrada y módulos de verificación de restricciones algebraicas entre campos, además de estimación de cuantiles `(p10, median, p90)`. El contexto es de 512 tokens con ventanas para documentos largos. `NullspanSystemOneEngine` emplea ModernBERT-large con 8K de contexto e incorpora Exact Tree-Isolated Parallel-Option Masking, competición de flujos entre preguntas y 24 cabezas de factores latentes, de modo que cada caso se resuelve en un único pase forward sin tokens generados y con invariancia al orden de las opciones (100 % de permutación).

El entrenamiento del motor de decisiones sigue un esquema en dos etapas: un preentrenamiento general "System One" con `BoolQ`, `ARC-Challenge` y `SciQ` (splits de train) más rúbricas programáticas numéricas, de política, negación y adecuación; y una segunda etapa de autodestilación cruzada entre 10 modelos con validación out-of-fold de 5 folds y Trajectory-SWA sobre el split de train de `LocalLLaMA/typed-decisions`. El autor declara explícitamente que el modelo no es zero-shot en `Typed Decisions`. Los conjuntos de test (Typed Decisions test, JevBench público y sellado, SQuAD v2.0 validation y los pools de NullspanBench) no se tocaron durante el entrenamiento ni la calibración.

## Capacidades

- Extracción de spans fundamentados `[start, end]` sobre el texto de entrada, con tipos de campo (texto, fecha, número, duración, lista, enum, booleano, estimación).
- Abstención calibrada mediante `p_null` y cabeza `qa_null_head`, útil para preguntas sin respuesta.
- Desambiguación numérica multi-contrato (96/96 según la model card) y verificación de restricciones algebraicas entre campos.
- Estimación de cuantiles `(p10, median, p90)` para campos de tipo estimación.
- Decisiones tipadas sin generación de tokens: `true`/`false` (`noul`), elección entre opciones (`choice`) y puntuación ordinal (`score`) en rúbricas `min..max`.
- Invariancia al orden de opciones (permutación 100 %) y ausencia de sangrado RoPE entre opciones.
- Salida con esquema estricto (100 % de validez de esquema estricto en `jevbench`).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Extracción de campos en tickets de incidencia: el modelo recibe el texto de un incidente y devuelve identificadores, fechas, importes, severidad, booleanos y listas de modos de fallo, con abstención cuando un campo no aparece.
- Enrutado y clasificación de contratos o formularios: uso de decisiones tipadas `choice` para asignar categorías o tiers sin generar texto, con probabilidad calibrada por opción.
- Verificación de rúbricas de calidad: puntuaciones ordinales `score` en un rango `min..max` para evaluar respuestas o documentos con una sola pasada forward (9,56 ms por decisión en L4).
- Preguntas extractivas sobre documentación: pipeline de question answering sobre SQuAD v2.0 con 87,09 % EM y 90,00 % F1, adecuado para búsqueda de respuestas con abstención en preguntas sin respuesta.
- Extracción de importes y métricas financieras: campos `number` con decimales y unidad, más estimaciones con cuantiles, para conciliación de facturas o créditos SLA.
- Control de alucinación en producción: la abstención calibrada (`p_null`, Brier 0,0420 y KL 0,0760 en `typed-decisions`) permite descartar extracciones de baja confianza antes de escribirlas en base de datos.
- Despliegue en edge o CPU: la variante ONNX Int8 de 331,1 MB permite servir extracción y decisiones en entornos con recursos limitados y latencias de pocos milisegundos.

## Benchmarks y rendimiento

| Benchmark | Split | Resultado | Calibración | Latencia / coste (L4) |
|---|---|---|---|---|
| `LocalLLaMA/typed-decisions` | test oficial (400 casos, 2.000 decisiones) | 79,00 % accuracy (#5/27 en <=1B, #19/51 global) | KL 0,0760 (#1/23 en <=1B); Brier 0,0420 (#1/24 en <=1B); ECE 0,1665 | 9,56 ms/decisión (47,8 ms/caso), 0 tokens de salida |
| Benchmark Heaven / `jevbench` | suite pública (231 ítems, `jevbench::v1.6.1-O1S-local`) | 41,99 de capacidad (100 % easy, 68,06 % original, 35,14 % hard); 100 % validez de esquema estricto | 71,15 de calibración | 36,8 ms p50; 92,96 de velocidad; 0,0242 USD/1k |
| `rajpurkar/squad_v2` | validation (N = 11.873; N = 9.198 sin solapamiento) | 87,09 % EM, 90,00 % F1 (87,01 % EM y 89,88 % F1 sin solapamiento); HasAns F1 90,36 %; NoAns EM 89,64 % | no disponible | 10,30 ms p50; 0,0017 USD/1k |
| `NullspanBench v3.3` | 15 sistemas medidos (P = 164 sellado, S = 336 abierto) | 91,4 compuesto sellado (#1); 95,2 capacidad sellada (Int8 ONNX); 94,5 % inteligencia sellada (IC 95 % [90,9; 97,6]) | 95,8 de calibración (Int8 ONNX); AUROC 0,9761; ECE 0,0414 | 0,248 ms p50 híbrido; 0,0003–0,0017 USD/1k |

## Requisitos de hardware

- VRAM estimada: el extractor en FP32 ocupa aproximadamente 1,4 GB de pesos (345,3 M × 4 bytes); la variante ONNX Int8 baja a 331,1 MB. El motor de decisiones (395 M) requiere del orden de 1,6 GB en FP16 y menos de 1 GB en Int8.
- GPU recomendadas: los datos publicados se miden en NVIDIA L4; cualquier GPU con al menos 4 GB de VRAM debería acomodar ambos modelos en FP16 o Int8.
- GPU de consumo: cabe en RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU con ONNX Runtime por el tamaño reducido.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, ONNX Runtime para la variante Int8, y servicio HTTP propio para el endpoint `/v1/systemone`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son modelos de encoder, no generativos).
- Latencia y throughput: 10,30 ms p50 en SQuAD v2.0, 9,56 ms por decisión (47,8 ms por caso) en `typed-decisions` y 0,248 ms p50 en la configuración híbrida de NullspanBench, todo sobre L4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gnumanth/nullspan` (extractor) | 345,3 M | 512 con ventanas | Extracción de spans con abstención | MIT | Hugging Face, ONNX |
| `gnumanth/nullspan` (SystemOneEngine) | 395 M | 8K | Decisiones tipadas calibradas | MIT | Hugging Face |
| Modelos QA extractivos tipo BERT/Electra en SQuAD v2.0 | 100–400 M | 512 | Question answering extractivo | variable | Hugging Face |
| Modelos generativos pequeños (<=1B) evaluados en `typed-decisions` | <=1B | variable | Decisión tipada con generación | variable | Hugging Face |

No se dispone de una comparativa numérica detallada con alternativas concretas en la información proporcionada; los rankings de `typed-decisions` (#5/27 en <=1B y #19/51 global) y `NullspanBench` (#1 sellado) son los únicos datos comparativos publicados.

## Limitaciones y advertencias

- El motor de decisiones no es zero-shot en `Typed Decisions`: se entrenó con autodestilación sobre el split de train de ese conjunto, lo que limita la generalización a dominios no representados.
- Contexto de 512 tokens en el extractor, con ventanas deslizantes; documentos muy largos pueden perder coherencia entre ventanas.
- ECE de 0,1665 en `typed-decisions` y calibración de 71,15 en `jevbench`: la calibración es buena en rankings (KL y Brier) pero no perfecta en probabilidades absolutas.
- Rendimiento en la parte hard de `jevbench` limitado (35,14 %), lo que sugiere dificultades en casos complejos.
- No se documentan idiomas soportados; el entrenamiento se basa en datasets mayoritariamente en inglés (`BoolQ`, `ARC-Challenge`, `SciQ`, SQuAD v2.0), por lo que el rendimiento en castellano es incierto.
- Requiere `trust_remote_code=True` y código custom, lo que implica revisar el código del repositorio antes de desplegarlo en producción.
- Riesgo de sesgo heredado de los datasets de entrenamiento (SQuAD, BoolQ, ARC) no cuantificado en la información disponible.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; los resultados de benchmarks son un snapshot del 2026-11-11 y pueden no reproducirse en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gnumanth/nullspan
- Dataset de entrenamiento: https://huggingface.co/datasets/gnumanth/nullspan-dataset
- Dataset de decisiones tipadas: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset SQuAD v2.0: https://huggingface.co/datasets/rajpurkar/squad_v2
- Benchmark JevBench: https://github.com/fstandhartinger/jevbench
- Resultados NullspanBench: https://hemanth.github.io/nullspan/bench.html
