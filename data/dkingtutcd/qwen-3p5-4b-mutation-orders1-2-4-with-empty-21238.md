# dkingtutcd/qwen-3p5-4b-mutation-orders1-2-4-with-empty-21238

## Resumen

`dkingtutcd/qwen-3p5-4b-mutation-orders1-2-4-with-empty-21238` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario dkingtutcd en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta tanto texto como imagenes como entrada y genera texto. El repositorio contiene pesos en formato FP16 (16 bits) derivados del entrenamiento con la libreria Unsloth y TRL de Hugging Face, y esta etiquetado con la libreria transformers y el pipeline image-text-to-text.

El modelo cuenta con 4.659.865.088 parametros totales (aproximadamente 4,66 mil millones), un tamano de repositorio de 9,3 GB y licencia Apache 2.0. El nombre del repositorio sugiere una experimentacion con "mutation orders" (ordenes de mutacion) y contenido vacio, lo que apunta a un ajuste fino de caracter experimental mas que a un modelo de proposito general listo para produccion. No se dispone de informacion publica sobre el dataset de entrenamiento, el numero de tokens utilizados ni los hiperparametros del ajuste.

La relevancia de esta ficha es limitada: se trata de un modelo derivado de un base reciente (Qwen3.5-4B) con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como referencia para quienes exploran fine-tunings ligeros con Unsloth sobre la familia Qwen3.5, pero no como candidato directo a despliegue en produccion sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (aprox. 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

La arquitectura exacta no esta documentada en la model card. Por la etiqueta `qwen3_5` y el pipeline `image-text-to-text`, se infiere que hereda la arquitectura multimodal del modelo base Qwen/Qwen3.5-4B, que combina un codificador de vision con un decodificador de lenguaje de tipo transformer. El ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor, lo que sugiere el uso de tecnicas de entrenamiento eficiente en memoria (posiblemente LoRA o QLoRA, aunque no se especifica). El resultado se exporto en FP16.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni innovaciones tecnicas adicionales. El nombre del repositorio ("mutation-orders1-2-4-with-empty") indica una experimentacion con variantes de ordenes de mutacion y contenido vacio, pero no hay documentacion que explique el objetivo concreto del ajuste ni su metodologia.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-4B.
- Procesamiento de entrada multimodal image-text-to-text: acepta imagenes junto con texto (segun el pipeline declarado).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Modo thinking, vision o audio: vision probable por el pipeline, pero sin detalles; thinking y audio no disponibles.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y text-generation-inference.

## Casos de uso

- Evaluacion de fine-tunings experimentales: el modelo sirve como banco de pruebas para estudiar como afectan variaciones de "mutation orders" al comportamiento del base Qwen3.5-4B, comparando respuestas antes y despues del ajuste.
- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 4,66 mil millones de parametros en FP16, puede desplegarse en una unica GPU consumer para experimentar con dialogos multi-turno.
- Investigacion sobre olvido catastrofico: al tratarse de un ajuste fino sobre un base multimodal, permite analizar si el ajuste degrada las capacidades de vision o el conocimiento general del modelo original.
- Generacion de descripciones de imagenes en ingles: el pipeline image-text-to-text permite probar tareas de captioning o respuesta a preguntas visuales, siempre con validacion manual dado que no hay benchmarks.
- Base para nuevos fine-tunings con Unsloth: al estar entrenado con Unsloth y TRL, el repo sirve como punto de partida reproducible para experimentos de la comunidad con la misma receta.
- Docencia y formacion: util en talleres sobre fine-tuning eficiente y comparacion de variantes de un mismo base, por su licencia Apache 2.0 y su tamano manejable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 9,3 GB solo para pesos (4,66 mil millones de parametros x 2 bytes), mas overhead de activaciones y KV cache; en la practica, se recomienda al menos 12-16 GB de VRAM.
- En cuantizacion de 8 bits: alrededor de 5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB, aunque no se documentan versiones GGUF o AWQ en el repo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para FP16 sin problemas; RTX 3090/4080 con 16-24 GB tambien son suficientes en FP16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion, en GPUs de 8 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), vLLM y llama.cpp/Ollama solo si se generan cuantizaciones GGUF propias (no incluidas).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dkingtutcd/qwen-3p5-4b-mutation-orders1-2-4-with-empty-21238 | 4,66 mil millones | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning experimental de Qwen3.5-4B, sin benchmarks |
| Qwen/Qwen3.5-4B | 4 mil millones (aprox., segun nombre) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base oficial; referencia para comparar el efecto del ajuste |
| Fine-tunings comunitarios de Qwen3.5-4B con Unsloth | ~4,66 mil millones | depende del base | habitualmente Apache 2.0 | Hugging Face | Alternativas equivalentes en metodologia; rendimiento no verificado |

No se dispone de datos de benchmarks ni de modelos comparables adicionales verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B, hereda los sesgos del base, que no se detallan en esta ficha.
- Riesgo de alucinacion: no evaluado; al ser un ajuste experimental sin benchmarks, el riesgo es desconocido y potencialmente mayor que el del base.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el dataset de entrenamiento, lo que puede implicar riesgos legales si el dataset contuviera material con derechos.
- Caveats para produccion: cero descargas y cero likes, sin model card detallada, sin evaluaciones y con un nombre que sugiere contenido vacio o experimental; no se recomienda su uso en produccion sin una evaluacion exhaustiva propia.
- Capacidades multimodales: aunque el pipeline es image-text-to-text, no se confirma que el ajuste fino haya preservado las capacidades de vision del base.

## Enlaces

- Hugging Face: https://huggingface.co/dkingtutcd/qwen-3p5-4b-mutation-orders1-2-4-with-empty-21238
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible en los resultados de busqueda
- Paper o blog del autor: no disponible
