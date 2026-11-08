# prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ es una compilacion cuantizada en 4 bits (esquema NVFP4) del modelo decensurado `xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic`, publicada por el usuario prithivMLmods. El modelo original es un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de DeepSeek-V4-Pro en modo Max Effect sobre aproximadamente 250.000 muestras de matematicas y STEM, con una etapa SFT seguida de un ajuste ligero con GSPO. La variante "heretic" aplica una ablacion de rango arbitrario sobre las capas 9 a 24 (Heretic v2.0.0.dev0) que reduce los rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 respecto al modelo original.

Esta publicacion concreta aplica GPTQ con esquema NVFP4 sobre las capas lineales (excluyendo `lm_head` y las capas visuales), usando calibracion con observador `imatrix_mse`, block size 128, dampening del 1% y actorder estatico. El resultado ocupa 9,4 GB en dos shards de safetensors (4,99 GB y 3,89 GB) mas un modulo auxiliar de Multi-Token Prediction de 487 MB, y esta pensado para hardware NVIDIA Blackwell (SM120, GB202, B200, B300) con soporte nativo de FP4.

El interes tecnico esta en tres frentes: la compresion NVFP4 con GPTQ para hardware Blackwell, la decodificacion especulativa mediante el cabezal MTP y la eliminacion de sesgos de rechazo via ablacion. Es un modelo experimental de comunidad, con 0 descargas y 1 like en el momento de la consulta, y sus resultados de benchmark citados corresponden al modelo original, no a esta build.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con cabezal auxiliar de Multi-Token Prediction (MTP) y procesador multimodal image-text-to-text |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (4 bits) mediante GPTQ; el ecosistema del modelo base incluye GGUF (mradermacher) y otras builds |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2 shards + `model_mtp.safetensors`), con `compressed-tensors`; repo de 9,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5 con 9,65 mil millones de parametros, complementado por un modulo MTP de 487 MB que permite decodificacion especulativa (prediccion de varios tokens por paso). El pipeline declarado es `image-text-to-text`, y el repo incluye `processor_config.json` y la etiqueta `re:.*visual.*` en la lista de exclusiones de cuantizacion, lo que indica la presencia de un codificador visual que se mantiene fuera del esquema NVFP4. El modelo base declara soporte para llama.cpp, text-generation-inference, transformers y unsloth.

La cadena de entrenamiento del modelo original es: Qwen3.5-9B como base, destilacion de DeepSeek-V4-Pro en modo Max Effect sobre unas 250.000 muestras de matematicas y STEM (sin datos de codigo), SFT y una etapa ligera de RL con GSPO. Sobre ese checkpoint, Heretic v2.0.0.dev0 aplica ablacion de rango arbitrario en las capas 9 a 24 para eliminar comportamientos de rechazo. Esta build final anade la cuantizacion GPTQ con esquema NVFP4: cuantizacion capa por capa con datos de calibracion para corregir el error de redondeo, block size 128, `weight_observer: imatrix_mse`, `actorder: static` y `dampening_frac: 0.01`, excluyendo `lm_head` y las capas visuales.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en matematicas y disciplinas STEM.
- Entrada multimodal image-text-to-text (procesador visual incluido y capas visuales preservadas en precision original).
- Tool calling y function calling, segun las etiquetas `tool-use` y `function-calling`.
- Razonamiento agentico y descomposicion de problemas en varios pasos.
- Decodificacion especulativa mediante el modulo MTP para acelerar la generacion.
- Modo de razonamiento explicito (etiqueta `reasoning`), heredado del fine-tune de destilacion.
- Comportamiento decensurado: rechazos reducidos de 100/100 a 3/100 respecto al modelo previo a la ablacion.
- Soporte unicamente en ingles.

## Casos de uso

- Resolucion de problemas matematicos y cientificos: el modelo se entreno sobre ~250.000 muestras de matematicas y STEM, por lo que es adecuado para asistencia en calculo simbolico, fisica y quimica a nivel universitario, con verificacion humana de los resultados.
- Tutoria tecnica en ingles: puede mantener dialogos multi-turno explicando derivaciones paso a paso, aprovechando el modo de razonamiento y el contexto conversacional del chat template incluido.
- Extraccion de datos desde imagenes tecnicas: al ser image-text-to-text, puede transcribir y razonar sobre diagramas, graficos o ecuaciones en capturas, util en digitalizacion de apuntes y documentacion cientifica.
- Integracion en pipelines con function calling: las etiquetas `tool-use` y `function-calling` permiten conectarlo a APIs externas (calculadoras, bases de datos, motores de busqueda) en flujos de agentes.
- Despliegue en estaciones Blackwell: el formato NVFP4 esta pensado para GPU RTX PRO 6000, B200 y B300, de modo que encaja en inferencia local de alta eficiencia energetica dentro de un laboratorio o equipo de investigacion.
- Investigacion sobre alineacion y decensurado: util para estudiar como la ablacion de rangos en capas intermedias afecta a la tasa de rechazo y a la calidad del razonamiento, comparando con el checkpoint original.
- Generacion acelerada con decodificacion especulativa: el modulo MTP permite servir el modelo con menor latencia en entornos de produccion que ya soporten esta tecnica.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo original (no a esta build GPTQ/NVFP4), segun la propia model card:

| Benchmark | Resultado | Notas |
|---|---|---|
| GSM8K | 94,50 % | Media de cuatro ejecuciones sobre el checkpoint NVFP4 original bajo vLLM |
| MMLU-Pro (muestra de 1.500 preguntas de Matematicas, Fisica y Quimica) | 90,53 % de media | 0,93 puntos por encima de Qwen3.5-9B |

No se han publicado resultados de benchmarks especificos para esta build GPTQ en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos suman aproximadamente 8,88 GB en dos shards, mas 487 MB del modulo MTP; con overhead de activaciones y cache KV, un minimo practico de 10-12 GB en FP4.
- GPU recomendadas: NVIDIA Blackwell con soporte nativo FP4 (RTX PRO 6000, B200, B300, arquitecturas SM120/GB202). El esquema NVFP4 esta disenado para este hardware.
- Compatibilidad con GPU de consumo: no confirmada para tarjetas no Blackwell; el formato NVFP4 no es nativo en generaciones anteriores (Ada, Ampere), donde requeriria conversion a otro esquema.
- Opciones de despliegue: transformers con `compressed-tensors`, text-generation-inference y llama.cpp aparecen en las etiquetas; el modelo base dispone de builds GGUF de terceros (mradermacher).
- Latencia y throughput: no disponibles en la informacion proporcionada; el modulo MTP esta pensado para reducir latencia mediante decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NVFP4-GPTQ) | 9,65 B | No disponible | NVFP4 via GPTQ | Apache 2.0 | Decensurado, MTP, orientado a Blackwell |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9 B | No disponible | Full precision / otras | Apache 2.0 | Checkpoint fuente sin cuantizar |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9 B | No disponible | Full precision | Apache 2.0 | Fine-tune de razonamiento sin decensurar |
| Qwen3.5-9B (base) | 9 B | No disponible | Multiples | Apache 2.0 | Modelo base original, con alineamiento estandar |

## Limitaciones y advertencias

- Modelo experimental de comunidad con 0 descargas y 1 like: no hay validacion independiente de su calidad tras la cuantizacion GPTQ.
- Los benchmarks citados (GSM8K 94,50 %, MMLU-Pro 90,53 %) corresponden al modelo original, no a esta build; la cuantizacion puede degradar el rendimiento.
- El proceso de decensurado (ablacion de capas 9-24) elimina filtros de rechazo: aumenta el riesgo de generar contenido sensible, danino o inapropiado sin aviso, lo que exige moderacion externa en produccion.
- Entrenado sin datos de codigo: no es adecuado como asistente de programacion.
- Soporte exclusivo de ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion inherente a los modelos destilados de razonamiento, especialmente en dominios fuera de matematicas y STEM.
- La licencia Apache 2.0 se hereda del modelo base, pero el autor advierte que las salidas de este modelo experimental requieren verificacion independiente.
- El formato NVFP4 limita el despliegue a hardware Blackwell; en otras GPU sera necesario reconvertir los pesos.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ
- Modelo base decensurado: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Fine-tune de razonamiento original: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Build GGUF de terceros: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
