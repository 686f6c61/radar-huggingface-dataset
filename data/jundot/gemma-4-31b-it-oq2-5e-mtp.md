# Jundot/gemma-4-31B-it-oQ2.5e-mtp

## Resumen

Jundot/gemma-4-31B-it-oQ2.5e-mtp es un checkpoint cuantizado en formato MLX del modelo google/gemma-4-31B-it, el modelo denso de 30,7B parametros de la familia Gemma 4 de Google DeepMind. La cuantizacion la ha realizado el usuario Jundot con su herramienta oQ (oMLX v0.8.0), una tecnica de cuantizacion de precision mixta que asigna bits por capa segun su sensibilidad medida. El resultado es un checkpoint de 31,74B parametros logicos almacenado en 13,73 GiB, con un promedio efectivo de 3,716 bits por peso para el conjunto completo y 3,300 bits por peso para el backbone de lenguaje.

El modelo conserva las capacidades del original: entrada de texto e imagen, modos de razonamiento (thinking) configurables y una ventana de contexto de 256K tokens. Ademas, incorpora una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-31B-it-assistant, que permite decodificacion especulativa y por tanto acelerar la generacion. Esta pensado para ejecutarse con la libreria MLX en hardware Apple Silicon, no en GPUs NVIDIA.

Su relevancia es practica: permite ejecutar un modelo multimodal de 31B con contexto muy largo en equipos con memoria unificada relativamente modesta (el repo ocupa 14,8 GB), manteniendo licencia Apache-2.0. Es una opcion interesante para desarrollo local en Mac y para prototipado de aplicaciones multimodales sin depender de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision) con cabeza MTP; formato MLX |
| Parametros totales | 31.742.607.472 (31,74B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | oQ2.5e de precision mixta: affine 3-bit grupo 128 (91,28%), affine 3-bit grupo 64 (4,44%), affine 4-bit grupo 64 (0,21%), affine 6-bit grupo 64 (0,36%), affine 8-bit grupo 64 (0,43%), BF16 (3,28%); promedio 3,716 bits/peso (3,300 en el backbone) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors en formato MLX; repo de 14,8 GB (13,733 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 30,7B parametros con codificador de vision de 0,576B parametros, disenado para entrada image-text-to-text. El checkpoint anade una cabeza de prediccion multi-token (MTP) de 0,470B parametros, fusionada desde el modelo asistente de Gemma 4, que permite decodificacion especulativa: predecir varios tokens por paso y verificar despues, acelerando la inferencia. El modelo original soporta modos de pensamiento configurables, aunque la model card no detalla el proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO).

La innovacion de este checkpoint es la cuantizacion oQ2.5e: asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y aplica un reajuste de escala y sesgo por minimos cuadrados ponderados. La version actual (actualizada el 19 de noviembre de 2026) usa un redondeo oQe refinado en oMLX 0.8.0 que reduce el error de cuantizacion al mismo tamano y velocidad. El desglose de almacenamiento es: backbone de lenguaje 12,665 GB (11,795 GiB), codificador de vision 1,142 GB (1,063 GiB) y cabeza MTP 0,939 GB (0,875 GiB).

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Comprension de imagenes: pipeline image-text-to-text con codificador de vision dedicado.
- Generacion de codigo y matematicas (capacidades heredadas del modelo base; sin benchmarks publicados en la informacion disponible).
- Decodificacion especulativa mediante la cabeza MTP incluida, para acelerar la inferencia.
- Conversacion multi-turno (tag conversational).
- Ventana de contexto de 256K tokens, adecuada para documentos largos y repositorios completos.
- Soporte de tool calling y de agentes: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en local: con 256K tokens de contexto, el modelo puede procesar informes, contratos o libros completos en una sola pasada en un Mac con memoria unificada suficiente, sin enviar datos a la nube.
- Asistente multimodal de escritorio: al aceptar imagen y texto, sirve para transcribir y razonar sobre capturas de pantalla, diagramas o fotos dentro de una aplicacion nativa de macOS.
- Prototipado de agentes con razonamiento: los modos de thinking configurables permiten alternar entre respuestas rapidas y razonamiento profundo segun la tarea, util para experimentar con pipelines de agentes antes de pasar a produccion.
- Generacion de codigo asistida en el IDE: el contexto de 256K permite incluir varios ficheros de un repositorio; la cabeza MTP acelera la generacion de completados largos.
- Investigacion sobre cuantizacion: el checkpoint documenta con detalle la distribucion de bits por capa, lo que lo convierte en un caso de estudio para medir el impacto de la cuantizacion mixta en un modelo multimodal de 31B.
- Inferencia offline en entornos con requisitos de privacidad: al ejecutarse con MLX en Apple Silicon y con licencia Apache-2.0, es viable en escenarios donde no se permite salida de datos ni uso de GPUs de terceros.
- Evaluacion comparativa de decodificacion especulativa: la inclusion de la cabeza MTP permite medir la ganancia de throughput frente a la version sin asistente en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 14,8 GB (13,733 GiB); en la practica se necesita memoria unificada suficiente para pesos mas cache KV del contexto. Con 256K tokens el cache KV puede ser muy grande; para contextos largos conviene hardware con 32 GB o mas de memoria unificada.
- Hardware objetivo: Apple Silicon con MLX (libreria indicada en la model card). No hay soporte declarado para CUDA en esta informacion.
- GPU recomendadas: no disponible para NVIDIA; en Apple, equipos con memoria unificada de 24-32 GB o superior (por ejemplo, familias M-series Pro/Max/Ultra). No se confirma compatibilidad con ninguna GPU concreta.
- Cabe en GPU consumer: no confirmado; el formato MLX apunta a Mac, no a tarjetas graficas dedicadas.
- Opciones de despliegue: MLX y oMLX (herramienta del autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; la cabeza MTP esta pensada para acelerar la decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ2.5e-mtp | 31,74B | 256K | MLX safetensors, ~3,7 bits/peso | Apache-2.0 | Cuantizacion mixta con MTP; orientado a Apple Silicon |
| google/gemma-4-31B-it | 30,7B (denso) | 256K | safetensors BF16 | Apache-2.0 | Modelo base sin cuantizar; requiere mucha mas memoria |
| google/gemma-4-31B-it-assistant | 0,470B (cabeza MTP) | no disponible | safetensors | Apache-2.0 | Asistente de decodificacion especulativa, aqui fusionado |

No se dispone de datos de benchmarks ni de otros checkpoints cuantizados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a ~3,7 bits/peso puede degradar la calidad frente al modelo BF16 original, especialmente en tareas de razonamiento y matematicas; no hay evaluaciones publicadas que cuantifiquen la perdida.
- Formato MLX: no es directamente utilizable en ecosistemas CUDA ni en herramientas como vLLM o llama.cpp sin conversion adicional.
- El cache KV para 256K tokens puede consumir una cantidad de memoria muy superior a la de los pesos; el contexto maximo practico dependera del hardware.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la model card.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento en castellano antes de usarlo en produccion.
- Licencia Apache-2.0 segun la model card, con enlace a la licencia de Gemma 4; revisar los terminos de dicha licencia para uso comercial.
- La model card advierte de que la version actual sustituye a copias anteriores; si se descargo antes del 19 de noviembre de 2026, hay que volver a descargar.
- Modelo con solo 210 descargas y 0 likes en el momento de la consulta: ecosistema pequeno y poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/gemma-4-31B-it-oQ2.5e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Pull request de redondeo oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
