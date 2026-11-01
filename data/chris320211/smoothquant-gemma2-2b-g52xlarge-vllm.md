# chris320211/smoothquant-gemma2-2b-g52xlarge-vllm

## Resumen

`smoothquant-gemma2-2b-g52xlarge-vllm` es un checkpoint cuantizado a int8 del modelo `google/gemma-2-2b-it`, publicado por el usuario chris320211. No es un modelo nuevo: es una exportación del artefacto SmoothQuant original (`chris320211/smoothquant-gemma2-2b-g52xlarge`) reformateado al formato `compressed-tensors` que vLLM consume de forma nativa, sin necesidad de código personalizado ni `trust_remote_code`. La cuantización aplica W8A8: pesos int8 por canal y activaciones int8 dinámicas por token, con un módulo mantenido en bf16.

El modelo base, Gemma 2 2B instruct, es un transformer decoder-only de aproximadamente 2.610 millones de parámetros (2.614.341.888 según los safetensors del repo), orientado a generación de texto y conversación. Esta versión cuantizada reduce el peso en disco a 3,2 GB y acelera la inferencia en vLLM: según las mediciones del autor en una RTX 3090, el prefill es 2,02× más rápido que el bf16 equivalente en vLLM y el decode 1,41× a batch 1.

La relevancia práctica es doble: por un lado, demuestra un flujo de cuantización post-entrenamiento reproducible con la herramienta QuantPort; por otro, ofrece un checkpoint listo para servir con un único comando de vLLM, con una degradación de perplejidad controlada (ratio int8/bf16 de 1,0285 sobre WikiText-2). Es un artefacto de nicho, con 46 descargas y sin likes, pensado para quien quiera evaluar el impacto real de SmoothQuant en Gemma 2 2B dentro de un servidor vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), cuantizado post-entrenamiento con SmoothQuant |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 2 2B-it) |
| Tipos de cuantizacion | int8 W8A8: pesos int8 por canal, activaciones int8 dinamicas por token; un modulo se mantiene en bf16 |
| Idiomas soportados | no disponible |
| Licencia | gemma (heredada de google/gemma-2-2b-it) mas la licencia del repositorio del metodo |
| Formato de pesos | safetensors en formato compressed-tensors (int-quantized), compatible con vLLM |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B instruct de Google: un transformer decoder-only con atención multi-cabeza y las innovaciones propias de la familia Gemma 2 (atención alternada local/global y logit soft-capping, según la documentación pública del modelo base). Sobre ese modelo no se ha reentrenado nada: el checkpoint es el resultado de una cuantización post-entrenamiento con SmoothQuant, una técnica que migra la dificultad de cuantización de las activaciones hacia los pesos mediante un escalado por canal, permitiendo W8A8 sin pérdida severa de calidad.

El proceso se realizó con QuantPort, la herramienta del propio autor, y el artefacto resultante se renombró al esquema `compressed-tensors` con perfil `w8a8_int8`. Los bytes int8 son idénticos a los del artefacto original; solo cambian los nombres de los tensores y los metadatos. El autor reporta que la exportación se validó comparando el ratio de perplejidad contra el benchmark de HuggingFace del artefacto nativo: el drift entre ambos es de 1,0069, por debajo del umbral de 1,02 que exige su comprobación. No hay datos sobre el dataset de calibración empleado para SmoothQuant ni sobre el número de muestras.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Gemma 2 2B instruct.
- Razonamiento básico y respuesta a instrucciones en formato chat (el modelo base es la variante `-it`).
- Generación de código y matemáticas a nivel de un modelo de 2B, sin datos específicos publicados en esta ficha.
- Inferencia de alta velocidad en vLLM: prefill de 30.696,7 tok/s y decode de 176,0 tok/s a batch 1 en una RTX 3090.
- Servicio sin código personalizado: compatible con `vllm serve` y con la API `LLM` de vLLM directamente.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base Gemma 2 es multilingüe, pero no se detallan idiomas).
- Tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat de bajo coste en una sola GPU consumer: el checkpoint ocupa 3,2 GB y, según las mediciones del autor, en Transformers el artefacto int8 alcanza 8,09 GB de VRAM pico frente a 9,97 GB en bf16, por lo que encaja en tarjetas de 12-16 GB sirviendo con vLLM.
- Despliegue de alto throughput en vLLM: con 2.332,5 tok/s de decode a batch 16 en una RTX 3090, es adecuado para endpoints de generación con muchas peticiones concurrentes y respuestas cortas.
- Evaluación comparativa de cuantización: sirve como referencia reproducible para medir el impacto de SmoothQuant W8A8 frente a bf16 en tareas de perplejidad y latencia, ya que el autor publica los JSON de validación (`vllm.json`, `vllm_export.json`).
- Prototipado de asistentes conversacionales: al ser la variante instruct, se puede usar como backend de un chatbot interno con prompts de sistema, aprovechando el prefill rápido (2,02× sobre bf16 en vLLM) para contextos largos de conversación.
- Generación por lotes en pipelines de datos: el throughput de prefill (30.696,7 tok/s) lo hace útil para tareas de etiquetado, resumen o reescritura sobre grandes volúmenes de texto en una sola máquina.
- Base para experimentos de cuantización más agresiva: al estar en formato `compressed-tensors`, se puede integrar en flujos de vLLM que combinen esta técnica con otras (por ejemplo, comparaciones W8A8 frente a W4A16) sin reescribir el cargador.
- Entornos con restricciones de memoria: el peso en disco de 3,2 GB y la reducción de VRAM frente a bf16 permiten ejecutarlo en GPUs de gama media donde el modelo original en bf16 quedaría justo.

## Benchmarks y rendimiento

Mediciones del autor con vLLM 0.30.0 en una NVIDIA GeForce RTX 3090, sobre WikiText-2 test con ventanas de 2048 tokens (65.504 tokens en total), comparando contra vLLM en bf16 del modelo base:

| Metrica | vLLM int8 | vLLM bf16 | Transformers int8 | Transformers bf16 |
|---|---:|---:|---:|---:|
| Perplejidad | 15,2446 | 14,8218 | 15,1281 | 14,8219 |
| Prefill tok/s | 30.696,7 | 15.225,4 | 13.792,6 | 9.814,8 |
| Decode tok/s, batch 1 | 176,0 | 125,0 | 5,0 | 9,5 |
| Decode tok/s, batch 16 | 2.332,5 | 1.677,2 | 75,5 | 149,8 |
| VRAM pico GB | no disponible | no disponible | 8,09 | 9,97 |

Datos derivados reportados por el autor: ratio de perplejidad int8/bf16 de 1,0285; drift frente al ratio del benchmark de HuggingFace (1,0215) de 1,0069; speedup de prefill de 2,02×; speedup de decode de 1,41× a batch 1 y 1,39× a batch 16. Frente a Transformers bf16, vLLM int8 logra 3,13× en prefill, 18,62× en decode a batch 1 y 15,57× a batch 16. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 8,09 GB pico en Transformers con el artefacto int8 (medido por el autor); en vLLM no se reporta el pico, pero el peso en disco es de 3,2 GB, por lo que el consumo en inferencia será sustancialmente menor que en bf16.
- GPU recomendadas: RTX 3090 es la GPU de referencia de las mediciones; cualquier GPU con al menos 12 GB de VRAM debería poder servirlo con vLLM. A100 y H100 son válidas pero no se han publicado cifras específicas para ellas.
- Cabe en GPU consumer: sí, en RTX 3090 y, por el tamaño del checkpoint, previsiblemente en RTX 4080/4090 y GPUs de 16 GB; no se han publicado mediciones en esas tarjetas.
- Opciones de despliegue: vLLM es el destino principal (`vllm serve` o `LLM` en Python). El formato `compressed-tensors` es específico de vLLM; no se indica compatibilidad con llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: prefill de 30.696,7 tok/s y decode de 176,0 tok/s (batch 1) y 2.332,5 tok/s (batch 16) en RTX 3090 con vLLM 0.30.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| smoothquant-gemma2-2b-g52xlarge-vllm | 2,61 B | no disponible | int8 W8A8 (SmoothQuant) | gemma | safetensors compressed-tensors |
| google/gemma-2-2b-it | 2,61 B | no disponible | bf16 (original) | gemma | safetensors |
| chris320211/smoothquant-gemma2-2b-g52xlarge | 2,61 B | no disponible | int8 W8A8 (SmoothQuant) | gemma | safetensors con adaptador de inferencia propio |

La comparación relevante es contra el modelo base en bf16 y contra el artefacto nativo de SmoothQuant: el checkpoint vLLM es idéntico en pesos al nativo y solo cambia el empaquetado, por lo que su ventaja es operativa (servicio directo en vLLM, sin `trust_remote_code`). No se dispone de datos de otros modelos comparables de 2B cuantizados en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de calidad medible: la perplejidad sube de 14,8218 a 15,2446 (ratio 1,0285) sobre WikiText-2. En tareas sensibles a matices, esa degradación puede ser perceptible.
- El autor no publica evaluaciones de calidad en tareas downstream (razonamiento, código, matemáticas); solo perplejidad y velocidad.
- No hay información sobre sesgos, alucinación o comportamiento en idiomas distintos del inglés; se heredan los del modelo base Gemma 2 2B-it, que no se detallan aquí.
- La licencia `gemma` impone las condiciones de uso de Google para Gemma, que incluyen restricciones de uso comercial y obligaciones de atribución; hay que revisarlas antes de desplegar en producción.
- El formato `compressed-tensors` limita el despliegue a vLLM (y potencialmente a otras herramientas que lo soporten); no se garantiza compatibilidad con llama.cpp, Ollama o TGI.
- El checkpoint tiene un único autor y muy poca tracción (46 descargas, 0 likes); no hay validación independiente de las cifras reportadas.
- Las mediciones de velocidad se hicieron en una RTX 3090 con vLLM 0.30.0; el rendimiento en otras GPUs o versiones de vLLM puede diferir.
- El repositorio incluye un módulo mantenido en bf16; no se especifica cuál, lo que puede afectar a la memoria y al rendimiento en algunos escenarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chris320211/smoothquant-gemma2-2b-g52xlarge-vllm
- Artefacto nativo SmoothQuant: https://huggingface.co/chris320211/smoothquant-gemma2-2b-g52xlarge
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Repositorio de la herramienta QuantPort: https://github.com/chris320211/QuantPort
