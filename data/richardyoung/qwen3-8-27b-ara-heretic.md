# richardyoung/Qwen3.8-27B-ARA-heretic

## Resumen

Qwen3.8-27B-ARA-heretic es una variante "decensored" (abliterated) del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario richardyoung. Se ha generado con la herramienta Heretic v2.0.0 aplicando una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 14 a 64 del modelo original, con el objetivo de reducir la tasa de rechazos (refusals) en las respuestas sin reentrenar los pesos. El resultado es un modelo multimodal imagen-texto con 27.356 millones de parametros y licencia Apache 2.0.

El modelo base es un transformer causal denso con codificador de vision, disenado para tareas de razonamiento, codigo, trabajo profesional y agentes de horizonte largo. Incorpora una arquitectura hibrida poco habitual: 16 bloques compuestos por tres capas de Gated DeltaNet (atencion lineal) seguidas de una capa de Gated Attention clasica. Soporta de forma nativa contexto de 262.144 tokens, extensible hasta 1.000.000, y un modo de pensamiento (thinking) configurable por peticion.

La relevancia de esta ficha radica en dos factores: por un lado, documenta un modelo de 27B con capacidades de vision y contexto muy largo que cabe en hardware de gama alta de consumo; por otro, ilustra el ecosistema de variantes abliterated que modifican el comportamiento de rechazo del modelo original, con implicaciones directas en seguridad y en el cumplimiento de politicas de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de vision; layout hibrido 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; el ecosistema Qwen suele ofrecer GGUF/AWQ/GPTQ, pero no se confirma para esta variante) |
| Idiomas soportados | no disponible (la model card no lista idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Dimension oculta | 5.120 |
| Numero de capas | 64 |
| Embedding de tokens | 248.320 (con padding) |
| Gated DeltaNet | 48 cabezas lineales para V, 16 para QK; dimension de cabeza 128 |
| Gated Attention | 24 cabezas para Q, 4 para KV; dimension de cabeza 256; RoPE dim 64 |
| FFN | dimension intermedia 17.408 |
| MTP (Multi-Token Prediction) | entrenado con multiples pasos |
| Tamano del repositorio | 54,8 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8, construida sobre la base de Qwen3.5. Se trata de un transformer causal denso de 64 capas con una disposicion hibrida: cada bloque de cuatro capas combina tres capas de Gated DeltaNet (una forma de atencion lineal con estado recurrente) con una capa de Gated Attention convencional. Esta mezcla busca reducir el coste computacional y de memoria del contexto largo manteniendo la calidad de la atencion completa. El modelo incluye un codificador de vision para entrada de imagenes y video, y se entreno con Multi-Token Prediction (MTP) en varios pasos, lo que habilita decodificacion especulativa nativa.

El entrenamiento del modelo base comprende fases de preentrenamiento y postentrenamiento (la model card no detalla el numero de tokens ni la composicion del dataset, ni si se uso RLHF o DPO). La variante aqui descrita no reentrena pesos: aplica una ablacion ARA sobre las capas 14 a 64 con los parametros `preserve_good_behavior_weight=0.2654`, `steer_bad_behavior_weight=0.0002`, `overcorrect_relative_weight=0.3799` y `neighbor_count=7`. El proceso es reproducible segun el autor, que incluye un directorio `reproduce/` con instrucciones. La ablacion reduce los rechazos de 98/100 a 63/100 con una divergencia KL de 0,0605 respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante el parametro `reasoning_effort`, y retencion del contexto de razonamiento historico con `preserve_thinking`.
- Comprension nativa de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora de duracion.
- Generacion y edicion de codigo, con mejoras declaradas en tareas de programacion y trabajo profesional.
- Ejecucion agentica: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas de extremo a extremo.
- Soporte declarado de harnesses y herramientas de desarrollo populares (la model card menciona compatibilidad con vLLM, SGLang y TokenSpeed).
- Capacidades multilingues: la model card no especifica la lista de idiomas, aunque la familia Qwen suele cubrir un conjunto amplio.
- Comportamiento "decensored": la ablacion reduce la tasa de rechazos ante peticiones que el modelo original declinaria.
- Multi-Token Prediction entrenado, util para decodificacion especulativa y aceleracion de inferencia.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con documentos e imagenes adjuntas gracias a sus 262.144 tokens de contexto nativo, manteniendo el hilo de la conversacion sin truncar historial.
- Analisis de documentos tecnicos y diagramas: al ser un modelo vision-lenguaje nativo, puede extraer informacion de planos, graficos STEM y capturas de pantalla, y responder preguntas sobre ellos en el mismo contexto.
- Generacion de codigo en produccion: su soporte de tool calling y su entrenamiento en tareas de programacion permiten integrarlo en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores de compilacion.
- Agentes autonomos de horizonte largo: la planificacion mejorada y el manejo de retroalimentacion del entorno lo hacen adecuado para tareas que requieren decenas de pasos, como investigacion web o gestion de incidencias.
- Procesamiento de video de larga duracion: la ventana de contexto extensible hasta 1.000.000 de tokens permite resumir o indexar videos de hasta una hora sin segmentacion agresiva.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated reproducible, sirve para estudiar el efecto de la ablacion sobre la tasa de rechazos y la divergencia KL en modelos de 27B.
- Despliegue en hardware de gama alta de consumo: con 27B de parametros densos, es viable en configuraciones multi-GPU de consumo o en una sola GPU profesional con cuantizacion adecuada.

## Benchmarks y rendimiento

La model card del autor incluye unicamente metricas comparativas de la ablacion frente al modelo original:

| Metrica | Este modelo | Qwen3.8-27B original |
|---|---|---|
| Rechazos (refusals) | 63/100 | 98/100 |
| Divergencia KL | 0,0605 | 0 (por definicion) |

La model card del modelo base incluia tablas de benchmarks de texto (comparando Qwen3.8-27B con Qwen3.6-27B y Qwen3.7-Plus), pero los valores numericos no estan disponibles en la informacion proporcionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda un minimo de 64-80 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB de pesos, viable en una RTX 5090 (32 GB) o A100 40 GB con margen ajustado.
- VRAM estimada en cuantizacion de 4 bits: en torno a 14-16 GB de pesos, viable en RTX 4090 (24 GB), RTX 5080 o similares, aunque el contexto largo incrementa el consumo de KV cache.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 con contexto largo; RTX 4090/5090 para cuantizaciones de 4-8 bits; multiples GPUs de consumo en tensor parallel para FP16.
- Despliegue: la model card del modelo base menciona compatibilidad con transformers, vLLM, SGLang y TokenSpeed. No se confirma soporte de llama.cpp u Ollama para esta variante concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-ARA-heretic (este) | 27,36B densos | 262.144 (ext. 1M) | Si | Apache 2.0 | Variante abliterated, 63/100 rechazos |
| Qwen3.8-27B (original) | 27B densos | 262.144 (ext. 1M) | Si | Apache 2.0 | 98/100 rechazos, KL 0 |
| Qwen3.6-27B | no disponible | no disponible | no disponible | no disponible | Referencia de generacion anterior en la model card |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Modelo propietario de Qwen Cloud, solo mencionado como comparativa |

No se dispone de datos de rendimiento cuantitativos de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La ablacion reduce los rechazos pero no elimina el comportamiento inseguro: sigue rechazando 63 de cada 100 peticiones en la evaluacion del autor, por lo que el comportamiento es irregular y dificil de predecir.
- La divergencia KL de 0,0605 respecto al modelo original implica cambios en la distribucion de salida que pueden afectar a la calidad en tareas sensibles; no se han publicado evaluaciones de regresion en benchmarks estandar.
- Riesgo elevado de generar contenido que el modelo original declinaria; el despliegue en produccion requiere filtros y politicas de uso adicionales.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado ni sobre el cumplimiento de las politicas de uso de Qwen.
- La model card no especifica los idiomas soportados ni el numero de tokens de entrenamiento, lo que limita la evaluacion de cobertura linguistica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 5 de noviembre de 2026; no hay evidencia de validacion independiente.
- El contexto extensible a 1.000.000 de tokens es una capacidad declarada del modelo base; no se confirma que la ablacion preserve ese comportamiento en toda su extension.
- El modelo es de tipo image-text-to-text; no se documentan capacidades de audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen3.8-27B-ARA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org
- Qwen Cloud (servicio gestionado del modelo base): https://www.qwencloud.com
- Pagina del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
