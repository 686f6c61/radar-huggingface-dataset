# black-forest-labs/flux-3-action-base

## Resumen

FLUX 3 Action Base es un componente de adaptacion de pesos abiertos publicado por Black Forest Labs dentro de la familia FLUX 3 Action. Se trata de un modelo de accion sobre el mundo (world-action model) de 7.000 millones de parametros que recibe fotogramas de camara, el estado del robot y una instruccion de texto, y devuelve el siguiente bloque de acciones (action chunk) junto con los siguientes fotogramas de video, generados ambos mediante un proceso de denoising conjunto. El modelo combina un flujo de video, un flujo de texto y un tronco de accion compartido, con cabezas de accion especificas por embodiment (ee50 y gaming).

Este repositorio concreto no es una politica de robot lista para usar, sino la base de adaptacion mas los encoders congelados compartidos. Las politicas completas para los robots SO-101 y DROID se distribuyen por separado y referencian automaticamente estos encoders compartidos. El paquete incluye el archivo `flux-3-action-base.safetensors`, un VAE de video compartido (`video_vae.safetensors`) y una copia sin modificar de Qwen3-VL-4B-Instruct como encoder de texto.

Su relevancia radica en que publica los pesos base para adaptar el modelo a nuevos embodiments, simuladores o videojuegos mediante el entrenamiento de nuevas cabezas de accion, algo poco habitual en modelos de robotica de esta escala. El repositorio ocupa 25,4 GB y se distribuye bajo la FLUX Kommunity License v.1.0, con la salvedad de que el encoder de texto Qwen3-VL-4B-Instruct conserva su licencia Apache-2.0 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model de 7B con flujo de video, flujo de texto, tronco de accion compartido y cabezas de accion; 457 tensores |
| Parametros totales | 7B (modelo de accion); el encoder de texto Qwen3-VL-4B-Instruct anade 4B adicionales |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el encoder de texto es una copia de Qwen3-VL-4B-Instruct, multilingue, pero no se documentan los idiomas del sistema completo) |
| Licencia | FLUX Kommunity License v.1.0; encoder de texto bajo Apache-2.0; el codigo de flux-action tiene su propia licencia |
| Formato de pesos | safetensors (`flux-3-action-base.safetensors`, `video_vae.safetensors`, `text_encoder/`) |
| Pipeline | robotics |
| Libreria | lerobot |
| Tamano del repositorio | 25,4 GB |

## Arquitectura y entrenamiento

FLUX 3 Action es un modelo de accion sobre el mundo que unifica generacion de video y prediccion de acciones en un unico proceso de denoising: a partir del estado del robot, los fotogramas de camara y una instruccion de texto, produce simultaneamente el siguiente bloque de acciones y los siguientes fotogramas de video. La base contiene un flujo de video, un flujo de texto y un tronco de accion compartido, al que se acoplan cabezas de accion especificas (ee50 y gaming en esta publicacion). El encoder de texto es una copia sin modificar de Qwen3-VL-4B-Instruct, lo que aporta comprension conjunta de imagen y texto, y el modelo cuenta con un VAE de video compartido.

El numero de tokens de entrenamiento, la composicion del dataset y el uso de RLHF o DPO no se detallan en la informacion disponible. Si se documenta el flujo de adaptacion: para un nuevo embodiment, simulador o videojuego es necesario entrenar sus propias cabezas de accion sobre esta base, siguiendo la guia de fine-tuning de Black Forest Labs. Las politicas ya entrenadas para SO-101 y DROID referencian estos encoders compartidos de forma automatica, de modo que no es necesario reentrenarlos.

## Capacidades

- Generacion de acciones de robot: devuelve bloques de acciones (action chunks) a partir de fotogramas de camara, estado del robot e instruccion en lenguaje natural.
- Prediccion de video: genera de forma opcional los fotogramas de camara futuros de la escena, denoised junto con las acciones.
- Comprension multimodal de la instruccion: el encoder Qwen3-VL-4B-Instruct procesa texto e imagen para condicionar la politica.
- Adaptacion a nuevos embodiments: los pesos base permiten entrenar cabezas de accion nuevas para robots, simuladores o juegos distintos de SO-101 y DROID.
- Integracion con el ecosistema LeRobot: el repositorio esta etiquetado como `lerobot` y usa el pipeline de robotica de HuggingFace.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Adaptacion a un brazo robotico propio: partiendo de `flux-3-action-base.safetensors`, un equipo puede entrenar cabezas de accion especificas para su robot y reutilizar el VAE de video y el encoder de texto congelados, reduciendo el coste frente a entrenar una politica desde cero.
- Manipulacion con SO-101: cargando la politica `flux-3-action-so101`, que referencia estos encoders compartidos, se puede ejecutar una politica lista para ese brazo de bajo coste en tareas de pick-and-place guiadas por instrucciones de texto.
- Manipulacion en entornos DROID: la politica `flux-3-action-droid` permite desplegar el modelo sobre el dataset y la plataforma DROID, reutilizando la misma base de adaptacion.
- Investigacion en world models para robotica: la prediccion conjunta de acciones y fotogramas futuros permite estudiar planificacion y evaluacion de politicas en simulacion antes de pasar al hardware.
- Simuladores y videojuegos: la guia de fine-tuning contempla entrenar cabezas de accion para simuladores o juegos, usando la base como componente de adaptacion.
- Generacion de datos sinteticos de robotica: los fotogramas de video predichos por el modelo pueden emplearse para aumentar datasets de entrenamiento o para validar politicas en escenarios no vistos.
- Control asistido con supervision humana: en tareas donde el modelo propone acciones y un operador mantiene un boton de parada, dado que la model card exige explicitamente supervision humana y un medio de detencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de accion de 7B en bf16 requiere aproximadamente 14 GB; el encoder Qwen3-VL-4B-Instruct anade aproximadamente 8-9 GB en bf16; a ello hay que sumar el VAE de video y las activaciones. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- El repositorio completo ocupa 25,4 GB, coherente con un consumo en torno a 25-30 GB de VRAM para cargar la pila sin cuantizar.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB o similares para cargar la pila completa sin offloading.
- Consumer GPU: una RTX 4090 de 24 GB queda justa para la pila completa; es previsible necesitar offloading de componentes o ejecutar el encoder y el modelo de accion en fases separadas. No hay datos publicados que confirmen el comportamiento en GPUs de consumo.
- Opciones de despliegue: la libreria declarada es LeRobot; el codigo de referencia esta en el repositorio `flux-action` de Black Forest Labs. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y estos motores no son aplicables a un modelo de accion con safetensors de este tipo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux-3-action-base | 7B (+4B encoder de texto) | no disponible | no disponible | FLUX Kommunity License v1.0 | Pesos en HuggingFace, componente de adaptacion |
| flux-3-action-so101 | no disponible | no disponible | no disponible | no disponible | Politica lista para usar, en HuggingFace |
| flux-3-action-droid | no disponible | no disponible | no disponible | no disponible | Politica lista para usar, en HuggingFace |
| Otras politicas VLA/world-action de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados sobre modelos comparables de otros desarrolladores en la informacion proporcionada, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- No es una politica completa: es un componente de adaptacion; requiere entrenar cabezas de accion propias para cada nuevo embodiment.
- Seguridad fisica: el modelo devuelve consignas de articulacion (joint targets) y nada en el modelo acota la velocidad, la fuerza ni el espacio de trabajo. La aplicacion debe imponer esos limites y mantener un medio de parada de hardware accesible.
- Obligacion de validacion: la model card exige validar en simulador o con los limites de seguridad del brazo activados antes de operar cerca de personas.
- Supervision humana: el uso del modelo para controlar una maquina de forma que ponga en riesgo a personas esta prohibido sin supervision humana y sin un medio de detencion.
- Usos prohibidos por licencia: vulnerar la ley aplicable; decision automatizada completa o aplicaciones de alto riesgo que afecten a derechos legales; acoso, abuso o amenazas; explotacion o dano a menores.
- Licencia: FLUX Kommunity License v.1.0, distinta de una licencia de codigo abierto estandar; conviene revisar `LICENSE.md` antes de un uso comercial. El encoder de texto conserva Apache-2.0 y el codigo de `flux-action` tiene licencia propia.
- Idiomas y contexto: no se documentan los idiomas soportados ni la longitud de contexto efectiva.
- Alucinacion en la prediccion de video: los fotogramas de camara generados son predicciones del modelo, no observaciones reales, y no deben tratarse como mediciones del entorno.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible, y los sesgos del encoder Qwen3-VL-4B-Instruct subyacente pueden propagarse a la politica.
- Repositorio sin descargas registradas en el momento de la consulta (0 descargas, 20 likes), lo que implica poca validacion externa acumulada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/black-forest-labs/flux-3-action-base)
- [Coleccion FLUX 3 Action](https://huggingface.co/collections/black-forest-labs/flux-3-action-6ab25aef555dd30ab86567f8)
- [Documentacion de FLUX 3 Action](https://docs.bfl.ai/flux_3/flux3_action_overview)
- [Guia de fine-tuning](https://docs.bfl.ai/flux_3/flux3_action_finetuning)
- [Politica SO-101](https://huggingface.co/black-forest-labs/flux-3-action-so101)
- [Politica DROID](https://huggingface.co/black-forest-labs/flux-3-action-droid)
- [Repositorio de codigo flux-action](https://github.com/black-forest-labs/flux-action)
- [Licencia FLUX Kommunity v1.0](LICENSE.md)
- [Blog de Black Forest Labs sobre uso responsable](https://bfl.ai/blog/capable-open-and-safe-combating-ai-misuse)
- [Encoder de texto Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)
- Contacto de seguridad: safety@blackforestlabs.ai
