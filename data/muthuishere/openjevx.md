# muthuishere/openjevx

## Resumen

OpenJevX es un modelo de decisión de pesos abiertos, no autorregresivo, desarrollado por el usuario muthuishere (muthuishere/openjevx) a partir de Laya (convaiinnovations/laya), que a su vez se construye sobre el encoder answerdotai/ModernBERT-large más una cabeza de decisión tipada dinámica. El modelo no genera texto: recibe preguntas definidas en tiempo de ejecución de tres tipos (`choice`, `score` y `noul`) y devuelve probabilidades calibradas en una sola pasada forward.

Su relevancia práctica está en sustituir a un LLM decoder cuando la tarea consiste en elegir entre opciones, puntuar una entrada o determinar que una pregunta no procede. Frente a un modelo generativo, ofrece coste y latencia muy inferiores: 22,8 ms de p50 por caso de cinco preguntas en una NVIDIA GeForce RTX 4090, con 421.293.830 parámetros totales (≈0,42B) y un repositorio de 1,4 GB.

Se distribuye con licencia Apache-2.0 y es compatible con la forma de petición `/v1/systemone` de TypeSafe Jev a través del servidor OpenJevX. El modelo se publicó con 0 descargas y 1 like en el momento de la consulta, por lo que todavía no cuenta con validación independiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (ModernBERT-large) con cabeza de decisión tipada dinámica; no autorregresivo |
| Parámetros totales | 421.293.830 (≈0,42B), según safetensors |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura base ModernBERT-large admite hasta 8.192 tokens, dato no confirmado para este modelo |
| Tipos de cuantización | No detallados. El repositorio incluye safetensors y ONNX, y existe el tag `base_model:quantized:convaiinnovations/laya`, que apunta a una variante cuantizada del modelo base |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

OpenJevX parte de Laya, que combina el encoder `answerdotai/ModernBERT-large` con una cabeza de decisión tipada dinámica. La inferencia es de una sola pasada y no autorregresiva: en lugar de decodificar tokens, el modelo proyecta la representación de la entrada sobre las preguntas definidas en tiempo de ejecución y devuelve probabilidades calibradas para cada tipo (`choice`, `score`, `noul`). Esa naturaleza permite procesar un caso completo de cinco preguntas en 22,8 ms de p50 sobre una RTX 4090.

En cuanto al entrenamiento, la model card indica que se utilizó únicamente el split de entrenamiento de 1.200 casos del conjunto `LocalLLaMA/typed-decisions`, y que la evaluación se realiza sobre el split de test intacto de 400 casos y 2.000 decisiones. Entre las etiquetas del repositorio figura `rlcd`, sin que la model card describa el procedimiento asociado. No se especifican el número total de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisión tipada con preguntas definidas en tiempo de ejecución: soporta los tipos `choice`, `score` y `noul` sin reentrenar el modelo cuando cambia el conjunto de preguntas.
- Salida de probabilidades calibradas en una única pasada forward, apta para aplicar umbrales y agregar confianza.
- Clasificación de texto como pipeline principal (`text-classification`).
- Compatibilidad con la forma de petición `/v1/systemone` de TypeSafe Jev mediante el servidor OpenJevX.
- Exportación a ONNX además de safetensors.
- No realiza generación de texto libre, razonamiento multietapa ni código: no es un modelo autorregresivo.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente autónomo; su papel en un agente sería el de módulo de decisión.
- Capacidades multilingües: no disponibles en la información publicada.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Enrutado de decisiones en pipelines de agentes: definir en runtime las opciones disponibles (`choice`) y obtener en un único forward pass las probabilidades de cada rama, lo que permite seleccionar herramienta o camino de ejecución con una latencia de decenas de milisegundos.
- Evaluación automática de respuestas (LLM-as-judge ligero): usar preguntas de tipo `score` para puntuar las salidas de otro modelo, con un coste mucho menor que emplear un decoder generativo como juez.
- Clasificación de intención y triaje de tickets: las categorías se declaran en el momento de la inferencia, de modo que un cambio en el catálogo de intenciones no obliga a reentrenar ni a redeployar un modelo distinto.
- Guardarraíles y detección de "no aplicable": el tipo `noul` obtiene 0,860 de exactitud en el benchmark del autor, lo que lo hace utilizable para decidir si una petición queda fuera de alcance antes de invocar un LLM mayor.
- Filtrado y ranking en pipelines RAG: puntuar pares pregunta-pasaje con el tipo `score` para descartar fragmentos irrelevantes antes de la generación.
- Etiquetado a escala y generación de datos débiles: al ser un encoder de 0,42B exportable a ONNX, permite procesar grandes volúmenes en GPU o CPU para producir etiquetas o supervisión aproximada.
- Sistemas de decisión en tiempo real o en el borde: el tamaño del modelo y su latencia permiten ejecutarlo embebido junto a la aplicación, sin depender de una API externa.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| Typed-decisions (split de test de 400 casos y 2.000 decisiones) | Exactitud global | 0,774 |
| Typed-decisions | Choice | 0,745 |
| Typed-decisions | Score | 0,731 |
| Typed-decisions | Noul | 0,860 |
| Latencia de inferencia (NVIDIA GeForce RTX 4090, CUDA) | p50 por caso de cinco preguntas | 22,8 ms |

Los resultados proceden de la model card del autor y se obtuvieron sobre el split de test sin tocar de `LocalLLaMA/typed-decisions`. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni mediciones independientes que repliquen estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 421.293.830 parámetros: ≈1,7 GB en FP32, ≈0,84 GB en FP16/BF16, ≈0,42 GB en INT8 y ≈0,21 GB en INT4, más el consumo del runtime.
- GPU recomendadas: NVIDIA GeForce RTX 4090 (configuración del benchmark oficial). Cualquier GPU con 2 GB o más de VRAM es suficiente para FP16.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama actual (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en GPU integradas para lotes pequeños. También es viable en CPU para volúmenes moderados.
- Tamaño del repositorio: 1,4 GB, superior al peso teórico del modelo, lo que sugiere la inclusión de varios formatos o precisiones (safetensors y ONNX).
- Opciones de despliegue: librería `laya`, transformers con soporte de ModernBERT, ONNX Runtime (etiqueta `onnx` del repositorio) y el servidor OpenJevX para la API `/v1/systemone`. vLLM y llama.cpp no son aplicables al no tratarse de un modelo autorregresivo; no se confirma soporte en TGI.
- Latencia: 22,8 ms de p50 por caso de cinco preguntas en RTX 4090 (dato del autor). No se publican percentiles p95/p99 ni cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muthuishere/openjevx | 421.293.830 | No disponible | Decisión tipada no autorregresiva (`choice`, `score`, `noul`) | Apache-2.0 | Hugging Face |
| convaiinnovations/laya | No disponible | No disponible | Decisión tipada (modelo base del que deriva) | Apache-2.0 | Hugging Face |
| answerdotai/ModernBERT-large | No disponible | No disponible | Encoder bidireccional de propósito general (backbone) | Apache-2.0 | Hugging Face |
| Un LLM decoder como juez/clasificador (p. ej. modelos de 7-8B) | No disponible | No disponible | Clasificación y decisión mediante generación | Varía según modelo | Amplia |

La comparación cuantitativa con alternativas no es posible con la información disponible: el autor solo publica resultados sobre `LocalLLaMA/typed-decisions` y no se han divulgado cifras equivalentes para Laya, ModernBERT-large ni para aproximaciones basadas en LLM decoder. La ventaja estructural frente a estas últimas es de latencia y coste (una sola pasada, 0,42B de parámetros), no necesariamente de exactitud.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural necesita un componente adicional.
- Exactitud global de 0,774 en el benchmark del autor implica un margen de error cercano al 23% de las decisiones; no debe ser la única fuente en flujos críticos.
- La calibración de las probabilidades la declara el autor, pero no se ha verificado de forma independiente ni se documenta su comportamiento fuera de la distribución de `LocalLLaMA/typed-decisions`.
- Idiomas soportados no especificados. El nombre del dataset de entrenamiento y el backbone sugieren un sesgo hacia el inglés, extremo no confirmado en la model card.
- Semántica exacta del tipo `noul` no detallada en la documentación publicada.
- El rendimiento depende de cómo se formulen las preguntas en runtime; no se documentan límites sobre el número de preguntas por caso ni sobre su longitud.
- Solo se publica latencia p50; no hay datos de p95/p99 ni de throughput sostenido en producción.
- Adopción prácticamente nula en el momento de la consulta (0 descargas, 1 like) y benchmarks autodeclarados por el autor, sin replicación externa.
- Licencia Apache-2.0: permite uso comercial y modificación, pero al ser un derivado de Laya (ConvAI Innovations) y ModernBERT (Answer.AI y LightOn), debe conservarse la atribución correspondiente.
- No se documentan evaluaciones de sesgo, toxicidad ni alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muthuishere/openjevx
- Modelo base, Laya: https://huggingface.co/convaiinnovations/laya
- Backbone, ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset de evaluación y entrenamiento, typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Listado de modelos cuantizados de convaiinnovations/laya: https://huggingface.co/models?other=base_model%3Aquantized%3Aconvaiinnovations%2Flaya
