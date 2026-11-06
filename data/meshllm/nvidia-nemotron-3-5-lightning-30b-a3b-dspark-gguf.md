# meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DSpark-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF Q8_0 del modelo DSpark, el modelo borrador (*draft*) de decodificacion especulativa que NVIDIA publica junto a su modelo objetivo NVIDIA-Nemotron-3.5-Lightning-30B-A3B. No es un modelo de proposito general: es un componente auxiliar que propone tokens candidatos para acelerar la inferencia del modelo grande mediante decodificacion especulativa. La conversion la firma el usuario meshllm y esta pensada para runtimes basados en llama.cpp, como mesh-llm, y en especial para hardware sin kernels NVFP4 rapidos (por ejemplo, Apple Metal).

El modelo borrador emplea una arquitectura DFlash con una cabeza de Markov (*Markov head*), lee las capas 2, 6, 20, 30, 42 y 52 del modelo objetivo y opera con bloques de 8 tokens mas un ancla de bonificacion. El repositorio original de NVIDIA esta en formato NVFP4; esta version reescala tanto las matrices NVFP4 como las BF16 (incluida la cabeza de Markov) a Q8_0, conservando las escalas por tensor NVFP4, los *attention sinks* y las normas.

Su relevancia es practica: permite ejecutar el esquema de decodificacion especulativa de Nemotron 3.5 Lightning en equipos donde el formato NVFP4 no tiene soporte eficiente, manteniendo una precision de 8 bits en los pesos del borrador. El modelo esta bajo licencia OpenMDW 1.1 y el modelo base pertenece a NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash con cabeza de Markov (*Markov head*), modelo borrador de decodificacion especulativa |
| Parametros totales | 967.580.116 (segun safetensors del repo; el nombre "30B-A3B" corresponde al modelo objetivo, no al borrador) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica variante en este repo) |
| Idiomas soportados | no disponible (el modelo objetivo base se entrena en ingles y otras 19 lenguas habladas, segun la model card de NVIDIA) |
| Licencia | OpenMDW License Agreement, version 1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa basado en DFlash al que se anade una cabeza de Markov. En lugar de predecir tokens de forma autorregresiva convencional, el borrador lee las activaciones de las capas 2, 6, 20, 30, 42 y 52 del modelo objetivo (NVIDIA-Nemotron-3.5-Lightning-30B-A3B) y genera propuestas en bloques de 8 tokens con un ancla de bonificacion, que el modelo objetivo verifica despues. Este diseno reduce el coste por token generado cuando el borrador acierta una fraccion alta de las propuestas.

La conversion documentada por el autor es un `llama-quantize --allow-requantize` con llama.cpp 0.7.0 sobre la revision `ed35fc990759330e325ab9e41bcf80737ab4dafc` de la conversion GGUF intermedia de magnitudedev. Las matrices NVFP4 y BF16, incluida la cabeza de Markov, pasan a Q8_0; se preservan las escalas por tensor NVFP4, los *attention sinks* y las normas. No se detalla en la informacion disponible el volumen de datos de entrenamiento del borrador ni si hubo RLHF o DPO; la model card del modelo objetivo de NVIDIA indica una fecha de corte de datos de post-entrenamiento en mayo de 2026 y un entrenamiento en ingles, otras 19 lenguas habladas y 43 lenguajes de programacion.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa sobre NVIDIA-Nemotron-3.5-Lightning-30B-A3B: no genera texto de forma autonoma, sino candidatos que el modelo objetivo valida.
- Aceleracion de inferencia en runtimes compatibles con llama.cpp (mesh-llm y derivados) mediante bloques de 8 tokens con ancla de bonificacion.
- Lectura de activaciones intermedias de las capas 2, 6, 20, 30, 42 y 52 del modelo objetivo.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).
- Uso conversacional heredado del pipeline del modelo objetivo.
- Capacidades multilingues: no disponibles de forma especifica para el borrador; el modelo objetivo cubre 20 idiomas hablados y 43 lenguajes de programacion.
- No soporta tool calling, agentes ni vision por si mismo: esas capacidades pertenecen al modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en Apple Silicon: al estar en GGUF Q8_0, el borrador puede cargarse en Metal sin necesidad de kernels NVFP4, permitiendo activar decodificacion especulativa en Macs con llama.cpp o mesh-llm.
- Despliegue en GPUs sin soporte NVFP4: en tarjetas consumer o servidores donde el formato NVFP4 del repo original de NVIDIA no tiene kernels optimizados, esta variante Q8_0 mantiene el esquema especulativo con precision de 8 bits.
- Servicios de chat de baja latencia: combinado con el modelo objetivo Nemotron 3.5 Lightning 30B-A3B, reduce el tiempo por token en cargas conversacionales multi-turno al proponer bloques de 8 tokens.
- Pipelines de generacion de codigo: el modelo objetivo cubre 43 lenguajes de programacion; el borrador acelera la generacion en IDE y asistentes integrados en llama.cpp.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para estudiar el impacto de la cabeza de Markov y del ancla de bonificacion en la tasa de aceptacion.
- Experimentacion con runtimes distribuidos: el tag `endpoints_compatible` y el ecosistema mesh-llm permiten probar el borrador en despliegues multi-nodo o con reparto de carga.
- Evaluacion comparativa de cuantizaciones: al existir el original NVFP4 y esta variante Q8_0, permite medir la perdida de tasa de aceptacion al cambiar de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para los pesos Q8_0 (el repo ocupa 1,0 GB), mas el coste de las activaciones y del contexto del runtime.
- El borrador debe convivir con el modelo objetivo Nemotron 3.5 Lightning 30B-A3B (30B totales, 3B activos), que domina los requisitos de memoria; el borrador anade una fraccion pequena.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible; el autor justifica la conversion para GPUs sin kernels NVFP4 rapidos, citando Apple Metal como caso principal.
- Cabe en GPU consumer: si, los pesos del borrador caben en cualquier GPU con 1-2 GB libres; el limite real lo impone el modelo objetivo.
- Opciones de despliegue: llama.cpp (version 0.7.0 o superior para la conversion), mesh-llm y otros runtimes basados en llama.cpp con soporte de decodificacion especulativa.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptacion del borrador y del hardware del modelo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DSpark-GGUF | 967.580.116 (borrador) | GGUF Q8_0 | no disponible | OpenMDW 1.1 | Borrador especulativo para llama.cpp |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark | no disponible | NVFP4 | no disponible | OpenMDW 1.1 | Borrador especulativo original de NVIDIA |
| magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark-GGUF | no disponible | GGUF | no disponible | no disponible | Conversion GGUF intermedia usada como fuente |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B totales, 3B activos | BF16 (safetensors) | no disponible | OpenMDW 1.1 | Modelo objetivo completo |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo Nemotron 3.5 Lightning 30B-A3B no produce respuestas utiles; su salida son propuestas que deben verificarse.
- La cuantizacion Q8_0 puede reducir la tasa de aceptacion frente al borrador NVFP4 original, lo que disminuye la ganancia de velocidad; no se han publicado mediciones al respecto.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de la conversion.
- Idiomas soportados por el borrador no documentados; cualquier limitacion linguistica proviene del modelo objetivo.
- Licencia OpenMDW 1.1: es necesario revisar el texto completo en el enlace de licencia antes de un uso comercial; la etiqueta de Hugging Face es `other`.
- Riesgo de alucinacion: inherente al modelo objetivo; el borrador no lo mitiga y puede propagar propuestas incorrectas que el verificador rechace, con coste adicional.
- Dependencia de la version de llama.cpp: la conversion se realizo con 0.7.0 y usa `--allow-requantize`; versiones anteriores pueden no cargar correctamente el modelo.
- Requiere que el runtime implemente la lectura de capas y el esquema de bloques de 8 tokens con ancla de bonificacion; no todos los forks de llama.cpp lo soportan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-DSpark-GGUF
- Modelo fuente NVFP4 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Conversion GGUF intermedia: https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark-GGUF
- Modelo objetivo BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Runtime mesh-llm: https://github.com/Mesh-LLM/mesh-llm
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
