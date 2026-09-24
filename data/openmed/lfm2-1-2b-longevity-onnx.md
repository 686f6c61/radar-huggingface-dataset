# OpenMed/LFM2-1.2B-Longevity-ONNX

## Resumen

El modelo `OpenMed/LFM2-1.2B-Longevity-ONNX` es una conversión a ONNX y cuantización a 4 bits de `LiquidAI/LFM2-1.2B-Longevity`, el ajuste fino de tipo Longevity-LLM desarrollado por Liquid AI junto con Insilico Medicine sobre la arquitectura LFM2. La conversión la ha realizado y publicado el usuario OpenMed, que no está afiliado ni respaldado por los autores originales del modelo. El objetivo es permitir la ejecución en dispositivo (Android, escritorio y navegador) mediante ONNX Runtime y Transformers.js, sin necesidad de servidores con GPU.

Se trata de un modelo de 1,17 mil millones de parámetros (sin cambios respecto al original), con pesos que ocupan 0,83 GiB y una media medida de 6,08 bits por peso. La arquitectura es un híbrido de tipo Liquid con 16 capas, de las cuales 6 son de atención con grouped-query attention y 10 son convoluciones cortas con compuerta, con un tamaño oculto de 2048 y un vocabulario de 65.536 tokens con embeddings de entrada y salida compartidos. Solo se declara soporte para inglés.

Su relevancia actual radica en dos factores: por un lado, lleva un modelo especializado en biología del envejecimiento a escenarios de inferencia local con requisitos de memoria por debajo de 1 GiB; por otro, incluye métricas de fidelidad de la cuantización medidas sobre datos reales, algo poco habitual en conversiones ONNX publicadas de forma no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (`Lfm2ForCausalLM`): convoluciones cortas con compuerta + atención GQA |
| Parametros totales | 1,17 B (en el repo figuran como "1.17 B", sin cambios respecto al origen) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 asimétrico round-to-nearest (uint4 con punto cero empaquetado, bloque 32, escalas fp32, `MatMulNBits` accuracy_level 4); int8 asimétrico en capas sensibles y en la tabla de embeddings/salida; 6,08 bits por peso medidos |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, `license: other`) |
| Formato de pesos | ONNX (grafo `onnx/model_q4.onnx` + `onnx/model_q4.onnx_data`), operadores `com.microsoft` |
| Tamano del repositorio | 0,9 GB |
| Tamano oculto | 2048 |
| Capas | 16 (6 de atención, 10 de convolución) |
| Vocabulario | 65.536, embeddings de entrada y salida compartidos |

## Arquitectura y entrenamiento

La arquitectura del modelo base es `lfm2` (`Lfm2ForCausalLM`), un diseño híbrido de tipo Liquid que combina convoluciones cortas con compuerta y capas de atención con grouped-query attention. En concreto, de las 16 capas totales, 6 son de atención y 10 son de convolución, con un tamaño oculto de 2048 y un vocabulario de 65.536 tokens con embeddings compartidos entre entrada y salida. No se proporciona en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si el ajuste fino de Longevity empleó RLHF o DPO; esos datos corresponden a la model card del modelo original `LiquidAI/LFM2-1.2B-Longevity`, que es la fuente que debe consultarse para el detalle del entrenamiento.

En cuanto a la conversión y cuantización que sí documenta esta ficha, el proceso parte del exportador oficial de Liquid (`Liquid4All/onnx-export`) en FP32 y se cuantiza con `MatMulNBitsQuantizer` de onnxruntime 1.30.0, sin datos de calibración (round-to-nearest puro). El cuerpo del modelo se guarda en int4 asimétrico con bloques de 32 y escalas fp32, pero se mantienen en int8 los tensores que más degradan a 4 bits según la regla Q4_K_M de llama.cpp (`down_proj` en el primer y último octavo de capas y cada tercera capa intermedia, y `v_proj` con la misma regla sobre las capas de atención). La tabla de embeddings y la cabeza de salida se almacenan como una única tabla int8 de bloque 32, leída por `GatherBlockQuantized` y por `MatMulNBits`. El resultado son 0,83 GiB de pesos y 6,08 bits por peso efectivos.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat jinja procedente del modelo original sin modificar.
- Modelo especializado en biología del envejecimiento y temática biomédica, según los tags `longevity`, `aging-biology` y `biomedical`.
- Directiva `/no_think` visible en el ejemplo de uso, lo que indica que la plantilla de chat admite alternancia entre modo de razonamiento y respuesta directa.
- Ejecución en navegador mediante Transformers.js (probado con la versión 4.3.0) y en Python/Android mediante ONNX Runtime 1.30 o superior.
- Inferencia en CPU con decodificación autorregresiva estándar: el grafo expone `input_ids`, `attention_mask`, `position_ids` y las cachés `past_conv.*` / `past_key_values.*`, realimentando las salidas `present*` en cada paso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Visión o audio: no disponible; el pipeline es `text-generation`.

## Casos de uso

- Investigación educativa sobre biología del envejecimiento en local: el modelo se puede ejecutar desde el navegador con Transformers.js sin enviar consultas a un servidor, lo que resulta adecuado para prototipos docentes y cuadernos de investigación con datos sensibles que no deben salir del equipo.
- Aplicación Android de consulta biomédica sin conexión: al ocupar 0,83 GiB de pesos y usar el execution provider de CPU de `onnxruntime-android`, es viable integrarlo como asistente de consulta offline sobre conceptos de longevidad, aunque el autor advierte que todavía no se ha medido en un dispositivo Android real.
- Explicación divulgativa de paneles de laboratorio: el ejemplo oficial de la model card pide explícitamente que relacione biomarcadores de un análisis de sangre rutinario con la edad biológica; sirve como borrador de material divulgativo, siempre con verificación humana y sin uso diagnóstico.
- Prototipado web sin backend: mediante el pipeline `text-generation` de `@huggingface/transformers` con `dtype: "q4"`, permite montar demos interactivas en el navegador con coste de infraestructura nulo.
- Aplicaciones de escritorio con inferencia embebida: herramientas de Electron o Tauri que enlacen ONNX Runtime pueden cargar el grafo y mantener conversaciones multi-turno reutilizando las cachés `past_conv.*` y `past_key_values.*` entre pasos.
- Filtrado y generación de texto preliminar en pipelines sobre corpus de envejecimiento: el modelo puede usarse para reformular, resumir o etiquetar textos en inglés del dominio antes de un procesamiento posterior más costoso.
- Base para experimentos de cuantización: al publicar el build con métricas de divergencia KL, acuerdo top-1 y perplejidad, sirve como referencia reproducible para comparar otras recetas de cuantización sobre el mismo modelo origen.
- Evaluación comparativa de fidelidad en despliegues on-device: equipos que necesiten medir el impacto real de int4 frente a BF16 pueden usar los números publicados como línea base en sus propias pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). Lo que sí se publica son métricas de fidelidad de la cuantización, medidas contra el modelo origen en FP32 sobre 4.092 tokens de prosa de dominio público (Project Gutenberg), con ONNX Runtime 1.30.0 en CPU:

| Metrica | Valor |
|---|---|
| Divergencia KL media de las distribuciones del siguiente token | 0,053 |
| Acuerdo top-1 del siguiente token | 85,8 % |
| Cambio de perplejidad | +2,2 % |

El export FP32 a partir del cual se cuantizó este build coincide con el modelo origen (acuerdo top-1 del 100 %), de modo que las diferencias anteriores corresponden íntegramente a la cuantización y no al export.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,83 GiB para los pesos, más el espacio de trabajo de las cachés de atención y convolución; el autor no publica cifras de memoria total en ejecución.
- GPU recomendadas: no disponible; la build se ha probado con el execution provider de CPU, no con aceleración por GPU.
- Inferencia en CPU: validada en macOS con onnxruntime 1.30.0 y con Transformers.js 4.3.0, produciendo tokens greedy idénticos entre ambas.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; por tamaño de pesos debería caber con holgura, pero no hay medición publicada.
- Android: soportado en teoría mediante `onnxruntime-android`, pero el autor indica explícitamente que todavía no se ha medido en un dispositivo Android.
- Opciones de despliegue: ONNX Runtime 1.30 o superior (incluido el provider de CPU y `onnxruntime-android`), Transformers.js 4.3.0 en navegador o Node. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Operadores requeridos: `MatMulNBits`, `GatherBlockQuantized` y `GroupQueryAttention` del espacio de nombres `com.microsoft`, lo que obliga a usar ONNX Runtime 1.30 o posterior.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y precision | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `OpenMed/LFM2-1.2B-Longevity-ONNX` (este) | 1,17 B | ONNX, int4/int8 (6,08 bits por peso, 0,83 GiB) | no disponible | LFM Open License v1.0 | Conversión no oficial de OpenMed; probada en CPU macOS y Transformers.js; no medida en Android |
| `LiquidAI/LFM2-1.2B-Longevity` (origen) | 1,17 B | PyTorch, BF16 | no disponible | LFM Open License v1.0 | Modelo original de Liquid AI e Insilico Medicine; referencia de fidelidad para esta conversión |
| `LiquidAI/LFM2-1.2B` (base) | no disponible | PyTorch | no disponible | LFM Open License v1.0 | Modelo base sobre el que se construye el ajuste Longevity; el resto de especificaciones no están en la información disponible |
| Otros modelos on-device de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables en la información proporcionada |

## Limitaciones y advertencias

- No es un producto sanitario: el uso previsto es investigación y educación sobre biología del envejecimiento, y no sustituye el consejo, diagnóstico ni tratamiento médico profesional. Las salidas pueden ser incorrectas y deben verificarse.
- Riesgo de alucinación: al ser un modelo de 1,17 B parámetros, su capacidad de razonamiento es limitada y puede generar afirmaciones biomédicas plausibles pero falsas, especialmente en preguntas clínicas concretas.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo en la información proporcionada.
- Limitación de idioma: solo se declara inglés, por lo que el uso en castellano no está soportado y degradará la calidad de forma previsible.
- Limitación de contexto: la longitud de contexto no se especifica en la información disponible y no debe asumirse un valor concreto.
- Licencia: se distribuye bajo la LFM Open License v1.0, la misma del modelo origen; es una licencia `other` y hay que revisar sus condiciones antes de cualquier uso comercial.
- Naturaleza no oficial de la conversión: OpenMed no está afiliado ni respaldado por los autores del modelo original, así que la trazabilidad y el soporte dependen de este repositorio de terceros.
- Cuantización sin calibración: la receta emplea round-to-nearest puro, sin datos de calibración, lo que se traduce en una divergencia KL media de 0,053 y un acuerdo top-1 del 85,8 % frente al modelo en FP32; no es una pérdida despreciable en tareas sensibles.
- Despliegue: requiere ONNX Runtime 1.30 o superior por el uso de operadores `com.microsoft`; versiones anteriores no podrán cargar el grafo.
- Validación incompleta: no se ha medido en hardware Android y no hay datos publicados de latencia ni throughput, por lo que las estimaciones de rendimiento en producción deberán hacerse con pruebas propias.
- Ficheros de pesos modificados: los grafos y pesos de `onnx/` son ficheros alterados respecto al origen (conversión del 23 de septiembre de 2026); el resto del repositorio son copias literales del upstream.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/OpenMed/LFM2-1.2B-Longevity-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B-Longevity
- Licencia LFM Open License v1.0: https://huggingface.co/OpenMed/LFM2-1.2B-Longevity-ONNX/blob/main/LICENSE
- ONNX: https://onnx.ai
- ONNX Runtime: https://onnxruntime.ai
- Exportador oficial de Liquid: https://github.com/Liquid4All/onnx-export
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Revision del modelo origen citada en la model card: `9b4926c163b8996311827b7534295c8fe84703cf`
