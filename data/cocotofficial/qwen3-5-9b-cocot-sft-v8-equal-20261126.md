# cocotofficial/Qwen3.5-9B-CoCoT-SFT-v8-equal-20261126

## Resumen

Qwen3.5-9B-CoCoT-SFT-v8-equal es un ajuste fino supervisado (SFT) del modelo multimodal Qwen3.5-9B, publicado por el usuario cocotofficial en Hugging Face. El modelo esta especializado en una tarea muy concreta: a partir de una imagen de referencia, generar la reconstruccion de una escena tridimensional en forma de codigo Three.js. No se trata, por tanto, de un modelo de proposito general, sino de un artefacto de investigacion orientado a la sintesis de escenas 3D mediante un LLM multimodal.

El entrenamiento parte de los pesos de Qwen3.5-9B (revision concreta del repositorio base) y utiliza un dataset propio de 2.609 ejemplos, con un batch global de 64 y una longitud de secuencia maxima de 69.632 tokens. La perdida se calcula tanto sobre el razonamiento del asistente como sobre el codigo de escena generado, mientras que los tokens del prompt se enmascaran y la torre de vision y el proyector multimodal permanecen congelados. Esto implica que el modelo conserva intacta la percepcion visual del modelo base y solo se ha adaptado la cabeza generativa para producir codigo Three.js.

El modelo tiene 9.409.813.744 parametros (segun los pesos en safetensors), un repositorio de 18,8 GB y licencia Apache 2.0. Es relevante ahora como ejemplo de especializacion estrecha de un modelo multimodal abierto para una tarea de reconstruccion 3D a partir de imagen, un nicho con pocas alternativas publicas y con implicaciones practicas en prototipado rapido de escenas web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-9B; torre de vision y proyector multimodal congelados durante el SFT |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible como spec del modelo; el entrenamiento uso un limite de secuencia de 69.632 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-9B multimodal, que combina una torre de vision con un modelo de lenguaje transformer para tareas de image-text-to-text. En este SFT concreto, la torre de vision y el proyector multimodal se mantuvieron congelados, de modo que el entrenamiento solo actualizo los pesos del decodificador de lenguaje. La perdida cubre conjuntamente el razonamiento del asistente y el codigo de escena Three.js generado, con enmascaramiento de los tokens del prompt para que el modelo no aprenda a reproducir la entrada.

El dataset de entrenamiento es cocotofficial/mmsi-hss-qwen4max-threejs-sft-v8, con 2.609 ejemplos, batch global de 64 y longitud de secuencia maxima de 69.632 tokens. La publicacion corresponde al final de la epoca 4 (optimizer step 164). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa o attention linear; tampoco se detalla la composicion del dataset mas alla de su orientacion a reconstruccion de escenas Three.js.

## Capacidades

- Generacion de codigo Three.js a partir de imagenes de referencia (reconstruccion de escenas 3D).
- Razonamiento intermedio explicito: la perdida entrena tanto el razonamiento del asistente como el codigo de escena final.
- Procesamiento multimodal de entrada (imagen + texto) heredado de Qwen3.5-9B, aunque la torre de vision no se ha reentrenado.
- Generacion de texto y codigo en el contexto de la tarea de escenas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad documentada; el modelo produce razonamiento interno pero no se documenta uso agentico.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: generacion de escenas Three.js; no se documentan modos thinking, audio ni vision adicional mas alla del modelo base.

## Casos de uso

- Prototipado rapido de escenas 3D web: dada una foto o boceto de una escena, el modelo genera codigo Three.js que puede pegarse en un proyecto web para obtener una primera version navegable, lo que acelera la iteracion de diseno.
- Generacion de maquetas para videojuegos o experiencias interactivas: a partir de referencias visuales se obtiene codigo de escena que sirve como punto de partida para artistas tecnicos, que luego refinan materiales y geometria.
- Automatizacion de pipelines de assets 3D: integrado en una herramienta interna, el modelo convierte un catalogo de imagenes de referencia en borradores de escenas Three.js que se revisan y versionan en un repositorio.
- Educacion y formacion en graficos 3D: el modelo puede usarse para mostrar como se traduce una imagen a codigo de escena, con el razonamiento intermedio como material didactico.
- Investigacion en reconstruccion de escenas: sirve como baseline especializado para comparar enfoques de image-to-3D-code frente a pipelines clasicos de fotogrametria o NeRF.
- Generacion de demos y pruebas de concepto comerciales: para agencias que necesitan una escena web interactiva rapida a partir de una referencia visual, el modelo reduce el tiempo de la primera version.
- Data augmentation para entrenamiento de modelos 3D: las escenas generadas pueden filtrarse y usarse como datos sinteticos en pipelines de entrenamiento de otros modelos de vision 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9.409.813.744 parametros, en precision completa (fp16/bf16) se necesitan aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits, la estimacion ronda los 10-11 GB de pesos; en 4 bits, alrededor de 5-6 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para inferencia en fp16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en bf16 con margen ajustado para contextos moderados.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 16 GB solo con cuantizacion (no publicada oficialmente).
- Opciones de despliegue: transformers (libreria declarada), con posibilidad de servirlo mediante vLLM o TGI si se convierte a un formato compatible; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-CoCoT-SFT-v8-equal | 9,4 B | no disponible (entrenado con seq. de 69.632 tokens) | Image-to-Three.js | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | no disponible en la informacion | no disponible | Multimodal general | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en image-to-3D-code | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables directos en la informacion proporcionada; la comparativa se limita al modelo base y a la categoria de tarea.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la tarea de reconstruccion de escenas Three.js su comportamiento no esta validado y puede degradarse respecto al modelo base.
- La torre de vision y el proyector multimodal estan congelados, por lo que la calidad de la percepcion visual depende enteramente de Qwen3.5-9B y no se ha adaptado al dominio de escenas.
- Riesgo de alucinacion en la geometria y en las APIs de Three.js: el modelo puede generar codigo sintacticamente valido pero con objetos, materiales o transformaciones incorrectas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al ser un SFT sobre un dataset pequeno (2.609 ejemplos), el riesgo de sobreajuste al estilo del dataset es alto.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue fiable.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Qwen3.5-9B antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.
- El checkpoint corresponde al final de la epoca 4 (step 164) de un entrenamiento corto; no se publican curvas de validacion ni metricas de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cocotofficial/Qwen3.5-9B-CoCoT-SFT-v8-equal-20261126
- Modelo base Qwen3.5-9B (revision usada): https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Dataset de entrenamiento (revision usada): https://huggingface.co/datasets/cocotofficial/mmsi-hss-qwen4max-threejs-sft-v8/tree/bb7a25a4384fb12cef2b41d6bfb9b8108e72818c
