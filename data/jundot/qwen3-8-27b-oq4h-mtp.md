# Jundot/Qwen3.8-27B-oQ4h-mtp

## Resumen

Qwen3.8-27B-oQ4h-mtp es un checkpoint cuantizado en formato oQh del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.000 millones de parametros de tipo vision-lenguaje construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot mediante su herramienta oQ (omlx), un planificador de cuantizacion de precision mixta orientado al ecosistema MLX de Apple Silicon. El checkpoint incluye el backbone de lenguaje, el codificador visual y la cabeza de prediccion multi-token (MTP), con un promedio efectivo de 4,840 bits por peso en el backbone y 5,044 bits por peso en el conjunto completo.

El modelo base combina capas Gated DeltaNet con capas Gated Attention en un diseno hibrido, soporta comprension de imagen y video, y declara una ventana de contexto nativa de 262.144 tokens. La relevancia de esta publicacion es fundamentalmente practica: permite ejecutar un modelo de 27B con capacidades multimodales en hardware Apple Silicon con un peso en disco de 17,5 GB, gracias a una distribucion de bits no uniforme que asigna mas precision a las tensiones mas sensibles.

El checkpoint emplea el formato oQh, que almacena cada capa lineal del decodificador como codigos enteros sobre una entrada rotada mediante una transformada de Hadamard por bloques con signo, con un grupo de escala y offset cada 128 pesos rotados. Requiere oMLX 0.8.0 o superior; versiones anteriores no pueden cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet y Gated Attention (familia Qwen3.5), vision-lenguaje |
| Parametros totales | 27.781B logicos (7.212.759.280 segun safetensors del repo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQh mixta: 4, 5, 6 y 8 bits con grupo 128; affine 4, 5, 6 y 8 bits con grupo 64; BF16 para un 1,857% de los pesos |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato oQh, libreria MLX |
| Bits efectivos por peso | 4,840 (backbone de lenguaje); 5,044 (checkpoint completo) |
| Tamano en disco | 17,517 GB / 16,314 GiB (repo de 17,5 GB) |
| Componentes | Backbone de lenguaje 26,896B / 15,155 GiB; codificador visual 0,461B / 0,858 GiB; cabeza MTP 0,425B / 0,301 GiB |
| Runtime requerido | oMLX 0.8.0 o superior con soporte oQh |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con un diseno hibrido que intercala capas Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) y capas Gated Attention clasicas. Esta combinacion busca reducir el coste computacional y de memoria en contextos largos manteniendo la calidad de la atencion completa, y es la razon por la que el modelo puede sostener 262.144 tokens de contexto nativo. El checkpoint incorpora ademas un codificador visual de 0,461B de parametros para entrada de imagen y video, y una cabeza de prediccion multi-token (MTP) de 0,425B que permite decodificacion especulativa interna para acelerar la generacion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo original en la informacion proporcionada. La innovacion tecnica documentada corresponde al proceso de cuantizacion: oQh almacena cada lineal del decodificador como codigos enteros sobre una entrada rotada por una transformada de Hadamard por bloques con signo, comparte escala y offset cada 128 pesos rotados, y selecciona los codigos contra las estadisticas de entrada de cada capa. El planificador reasigna los bytes ahorrados en escalas hacia bits adicionales en las tensiones mas sensibles, de modo que un fichero oQh ocupa lo mismo que un oQe del mismo nivel pero con menor divergencia KL respecto a BF16. Las tensiones de embedding de tokens, cabeza de salida y cabeza MTP se mantienen en grupos affine.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto nativo de 262.144 tokens.
- Comprension de imagen y video mediante el codificador visual integrado (pipeline image-text-to-text).
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B.
- Generacion de codigo, con evidencia indirecta en la evaluacion de divergencia KL sobre fuentes Python del proceso de cuantizacion.
- Capacidades multilingues: la evaluacion de cuantizacion usa FLORES+ y Aya en 7 idiomas, lo que indica cobertura multilingue en el modelo base, aunque la lista oficial de idiomas no esta disponible.
- Decodificacion especulativa mediante la cabeza MTP incluida en el checkpoint.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en local: con 262.144 tokens de contexto, el modelo puede procesar informes, expedientes o bases de codigo completas en una sola pasada sobre un Mac con Apple Silicon, sin enviar datos a la nube.
- Asistencia sobre capturas y video: al incluir codificador visual, sirve para transcribir y resumir tutoriales en video, revisar interfaces de usuario o extraer informacion de imagenes tecnicas en flujos de trabajo de escritorio.
- Desarrollo asistido en estaciones de trabajo Apple: el checkpoint de 17,5 GB cabe en la memoria unificada de un MacBook Pro o Mac Studio, lo que permite autocompletado y refactorizacion de codigo sin conexion.
- Procesamiento por lotes de contenido multilingue: la evaluacion del autor sobre FLORES+ y Aya en 7 idiomas respalda su uso en traduccion y resumen de corpus en varios idiomas, ejecutado localmente por motivos de privacidad.
- Prototipado de agentes multimodales: la cabeza MTP acelera la decodificacion, lo que reduce la latencia en bucles de razonamiento donde el modelo debe encadenar varias llamadas sobre el mismo contexto largo.
- Investigacion en cuantizacion: el checkpoint sirve como referencia reproducible para medir la degradacion de un modelo de 27B a ~4,8 bits por peso frente a BF16, usando las tablas de divergencia KL publicadas.
- Despliegue en entornos con requisitos de soberania del dato: al ser Apache-2.0 y ejecutarse en local, encaja en organizaciones que no pueden usar APIs externas para datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El autor unicamente reporta divergencia KL frente al modelo BF16 para comparar formatos de cuantizacion:

| Nivel | Tamano | KL FLORES+, oQe -> oQh | KL Aya, oQe -> oQh | KL codigo, oQe -> oQh |
|---|---|---|---|---|
| oQ2 | 9,9 GiB | 0,19 -> 0,10 (-47%) | 0,21 -> 0,11 (-46%) | 0,13 -> 0,078 (-41%) |
| oQ3 | 12,2 GiB | 0,066 -> 0,040 (-39%) | 0,082 -> 0,040 (-51%) | 0,052 -> 0,037 (-28%) |
| oQ4 | 15,2 GiB | 0,016 -> 0,012 (-26%) | 0,018 -> 0,013 (-27%) | 0,013 -> 0,012 (-13%) |

Estos datos excluyen el codificador visual y la cabeza MTP. El checkpoint publicado corresponde al nivel oQ4h, que parte del presupuesto de oQ4 y reasigna bits a las tensiones mas sensibles.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 17,5 GB de pesos en disco; en ejecucion hay que sumar la cache KV para el contexto utilizado, que crece de forma apreciable con ventanas de cientos de miles de tokens.
- Hardware objetivo: Apple Silicon con MLX. El formato oQh y la libreria oMLX estan disenados para memoria unificada de Apple, no para GPUs NVIDIA.
- Equipos viables: Mac con 24 GB o 32 GB de memoria unificada para contextos moderados; 48 GB o 64 GB recomendables para aprovechar contextos largos y el codificador visual.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este checkpoint al estar en formato oQh para MLX.
- Opciones de despliegue: oMLX 0.8.0 o superior exclusivamente; no es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada. La presencia de la cabeza MTP sugiere decodificacion especulativa, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4h-mtp (este) | 27,781B logicos, 5,044 bits/peso | 262.144 | oQh / MLX | Apache-2.0 | Hugging Face, requiere oMLX 0.8.0+ |
| Qwen/Qwen3.8-27B (base) | 27B densos | 262.144 | safetensors BF16 | Apache-2.0 | Hugging Face |
| Variantes oQe del mismo modelo | 27B densos | 262.144 | oQe / MLX | Apache-2.0 | Hugging Face, oMLX |
| Cuantizaciones GGUF de la familia Qwen3.5 | No disponible | No disponible | GGUF | Apache-2.0 | Depende del publicador |

La comparacion directa de rendimiento en tareas con alternativas de la misma categoria no esta disponible en la informacion proporcionada; el unico eje cuantificado es la divergencia KL frente a BF16 entre formatos oQe y oQh.

## Limitaciones y advertencias

- Dependencia estricta de oMLX 0.8.0 o superior: versiones anteriores no cargan el checkpoint, lo que limita la portabilidad y la integracion en pipelines existentes.
- Incompatibilidad con el ecosistema NVIDIA y con herramientas estandar como vLLM, llama.cpp, Ollama o TGI, al estar en formato oQh para MLX.
- La cuantizacion a 4,840 bits por peso en el backbone introduce una divergencia KL no nula frente a BF16 (0,012 en FLORES+, 0,013 en Aya y 0,012 en codigo para el nivel oQ4); en tareas de alta precision puede haber degradacion respecto al modelo original.
- El repo declara 7.212.759.280 parametros en safetensors, frente a los 27,781B logicos de la model card; la discrepancia probablemente refleja el empaquetado de pesos cuantizados, pero conviene verificarla antes de dimensionar el despliegue.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base ni del checkpoint cuantizado.
- La lista de idiomas soportados no esta publicada; la cobertura multilingue solo se infiere de los conjuntos de evaluacion usados por el autor.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Aunque la licencia es Apache-2.0, conviene revisar el fichero LICENSE y las condiciones del modelo base Qwen3.8-27B antes de un uso comercial.
- El contexto de 262.144 tokens es nativo, pero la memoria necesaria para la cache KV en ventanas completas puede superar la disponible en equipos de 24 GB.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/Jundot/Qwen3.8-27B-oQ4h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de oQ / omlx: https://github.com/jundot/omlx
- Pull request del formato oQh: https://github.com/jundot/omlx/pull/5317
