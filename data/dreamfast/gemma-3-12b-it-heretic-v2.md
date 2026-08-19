# DreamFast/gemma-3-12b-it-heretic-v2

## Resumen

DreamFast/gemma-3-12b-it-heretic-v2 es una versión ablacionada (abliterated) del modelo multimodal Gemma 3 12B IT de Google, creada por el usuario DreamFast mediante la herramienta Heretic v1.3.0. El proceso de abliteración elimina selectivamente las direcciones de activación asociadas al rechazo de solicitudes, reduciendo drásticamente las negativas del modelo (de 100/100 a 8/100 en una prueba de 100 prompts) con una divergencia KL mínima de 0,0801 respecto al original, lo que preserva la calidad general.

El modelo está pensado principalmente como codificador de texto sin censura para pipelines de generación de vídeo como LTX-2 en ComfyUI, tanto en modalidad texto-a-vídeo (T2V) como imagen-a-vídeo (I2V). Se distribuye en múltiples formatos cuantizados (FP8, INT8, INT4, NVFP4, MXFP8 y GGUF) optimizados con redondeo aprendido guiado por SVD, cubriendo desde GPUs Ada hasta Blackwell. Con 12.187 millones de parámetros, hereda la arquitectura multimodal de Gemma 3 (texto e imagen) y su ventana de contexto de 128K tokens, aunque la model card solo declara soporte para inglés.

La relevancia de este modelo radica en que ofrece una alternativa sin restricciones a los modelos de Google, manteniendo las capacidades de razonamiento, código y visión del original, y está específicamente calibrado para su uso como componente en sistemas de generación de vídeo, un caso de uso poco habitual para modelos de lenguaje de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), basado en google/gemma-3-12b-it |
| Parametros totales | 12.187.325.040 (12,19 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (heredado del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | bf16, FP8 E4M3, INT8 (ConvRot), INT4 W4A4 (ConvRot), NVFP4 E2M1, MXFP8, GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (formato HuggingFace), safetensors cuantizados para ComfyUI, GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-12b-it, un transformer multimodal con un decodificador autoregresivo de 12B parametros que incluye un codificador de vision (vision_model) y un proyector multimodal (multi_modal_projector) para procesar imagenes. La abliteracion se realizo con Heretic v1.3.0, una herramienta que identifica y elimina direcciones de activacion asociadas al comportamiento de rechazo. Se ejecutaron 200 ensayos (trials) y se selecciono el ensayo 174, que obtuvo 8/100 rechazos con una divergencia KL de 0,0801 respecto al modelo original, indicando un dano minimo a las capacidades generales.

Los pesos cuantizados se generaron con convert-to-quant (de silveroxides) utilizando redondeo aprendido guiado por SVD (AdaRound) con optimizador Prodigy, que minimiza el error de reconstruccion de salida. Las variantes INT8 e INT4 emplean la tecnica ConvRot (rotacion de Hadamard con escalado por filas), mientras que NVFP4 y MXFP8 usan formatos de punto flotante de microscaling. Todas las versiones de ComfyUI conservan las claves vision_model y multi_modal_projector, necesarias para flujos I2V. No se especifican datos de entrenamiento adicionales ni etapas de RLHF/DPO, ya que se trata de un ajuste posterior al modelo base.

## Capacidades

- Generacion de texto y conversacion multirround en ingles.
- Razonamiento y resolucion de problemas, heredados del modelo base Gemma 3 12B IT.
- Generacion de codigo y soporte basico de matematicas (capacidades del modelo base).
- Procesamiento de imagenes: el modelo incluye pesos de vision y proyector multimodal, permitiendo entradas de imagen para tareas como mejora de prompts en I2V.
- Reduccion de rechazos: la abliteracion reduce significativamente las negativas a solicitudes, siendo adecuado para contenido sin censura.
- Integracion con ComfyUI para generacion de video: funciona como codificador de texto para LTX-2 en flujos T2V e I2V.
- Soporte de cuantizacion variada: FP8, INT8, INT4, NVFP4, MXFP8 y GGUF, cubriendo diferentes hardware.
- Tool calling y function calling: no confirmado en la informacion proporcionada, aunque el modelo base lo soporta.

## Casos de uso

- Codificador de texto para generacion de video con LTX-2: el modelo se usa en ComfyUI como TextGenerateLTX2Prompt, transformando prompts de texto en representaciones para el generador de video, con soporte T2V e I2V.
- Mejora de prompts de imagen a video: gracias a los pesos de vision, el modelo puede procesar una imagen de entrada y generar un prompt enriquecido para la generacion de video, manteniendo coherencia con el contenido visual.
- Creacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas, donde los modelos estandar rechazan solicitudes.
- Asistente de escritura para narrativa especulativa: generacion de historias con violencia, horror o contenido maduro, aprovechando la baja tasa de rechazo.
- Desarrollo de personajes para juegos de rol o simulaciones: el modelo puede mantener conversaciones prolongadas sin negarse a responder sobre temas sensibles.
- Integracion en pipelines de generacion de video para produccion independiente: creadores que necesitan un codificador de texto fiable y sin censura para automatizar la generacion de clips con LTX-2 en entornos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas del proceso de abliteracion: 8/100 rechazos (frente a 100/100 del original) y una divergencia KL de 0,0801 respecto al modelo base, lo que indica una perdida minima de fidelidad. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: 24,3 GB en bf16 (segun LLM Explorer); las versiones cuantizadas reducen el consumo: FP8 e INT8 ~13 GB, INT4 ~7,7 GB, NVFP4 ~7,8 GB, MXFP8 ~13 GB.
- GPU recomendadas: cualquier GPU con suficiente VRAM para bf16 (p. ej. RTX 3090/4090, A100, H100); FP8 requiere arquitectura Ada o superior (RTX 4090, L40S, etc.); INT8 funciona en Ampere+; INT4 requiere ComfyUI 0.30.0+ y funciona en cualquier GPU, aunque capas incompatibles se mantienen en bf16; NVFP4 es mas rapido en Blackwell (RTX 50xx) pero funciona con descuantizacion por software en GPUs antiguas (probado en RTX 4090); MXFP8 solo para Blackwell.
- Opciones de despliegue: ComfyUI (con soporte nativo para los formatos cuantizados), transformers (formato HuggingFace), llama.cpp (conversion desde safetensors), text-generation-inference (etiquetado como compatible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals (100 prompts) | KL vs base | Licencia |
|---|---|---|---|---|---|
| google/gemma-3-12b-it (base) | 12,19 B | 128K | 100/100 | - | Gemma |
| DreamFast/gemma-3-12b-it-heretic-v2 | 12,19 B | 128K | 8/100 | 0,0801 | Gemma |
| Otras variantes abliteradas de Gemma 3 12B (p. ej. de la comunidad) | 12,19 B | 128K | no disponible | no disponible | Gemma |

No se dispone de datos de rendimiento comparativo en benchmarks entre estas variantes. La principal diferencia con el modelo base es la drastica reduccion de rechazos, manteniendo una divergencia KL baja. Otras variantes abliteradas de Gemma 3 12B existen en HuggingFace, pero no se han incluido por falta de informacion cuantitativa.

## Limitaciones y advertencias

- Modelo abliterado: la reduccion de rechazos implica que puede generar contenido inapropiado, ofensivo, ilegal o danino si se le solicita. No debe usarse en aplicaciones donde se requiera moderacion de contenido.
- Solo ingles: el frontmatter declara unicamente el idioma ingles; el rendimiento en otros idiomas no esta garantizado y puede degradarse.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en contextos abiertos.
- Perdida de calidad potencial: aunque la KL es baja (0,0801), la abliteracion puede afectar a tareas especificas no evaluadas en los ensayos.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Google para modelos Gemma, que incluyen restricciones sobre el uso para ciertos fines y la obligacion de atribucion.
- Derivado no oficial: no es un modelo de Google; la abliteracion fue realizada por un tercero, sin garantias de soporte ni mantenimiento.
- Dependencia de ComfyUI: los formatos cuantizados estan pensados para ComfyUI; su uso fuera de este entorno puede requerir conversion adicional.
- Vision weights anadidos: las variantes de ComfyUI incluyen pesos de vision (~1 GB extra) que no se utilizan en T2V, aumentando ligeramente el tamano del archivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DreamFast/gemma-3-12b-it-heretic-v2
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Docker de Heretic (DreamFast): https://github.com/dreamfast/heretic-docker
- convert-to-quant: https://github.com/silveroxides/convert_to_quant
- PR de soporte Gemma 3 en ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF/pull/402
- Comunidad Abliterlitics Discord: https://discord.gg/AqmDnBjPvM
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Ficha en featherless.ai: https://featherless.ai/models/DreamFast/gemma-3-12b-it-heretic-v2
- Ficha en LLM Explorer: https://llm-explorer.com/model/DreamFast%2Fgemma-3-12b-it-heretic-v2,7jTHAIgVNMNnWl9Pz3eV6S
- Ficha en ModelScope: https://www.modelscope.cn/models/hf/DreamFast-gemma-3-12b-it-heretic-v2/summary
