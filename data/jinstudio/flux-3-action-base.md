# Jinstudio/flux-3-action-base

## Resumen

FLUX 3 Action Base es un modelo de acción para robótica (world action model) de 7B parámetros desarrollado por Black Forest Labs. A partir de fotogramas de cámara, el estado interno del robot y una instrucción en lenguaje natural, el modelo devuelve el siguiente bloque de acciones (chunk de acciones) que se genera de forma conjunta con los siguientes fotogramas de vídeo durante el proceso de denoising. Este repositorio concreto (`Jinstudio/flux-3-action-base`) es un espejo sin gating del repositorio oficial `black-forest-labs/flux-3-action-base`, y su contenido no es una publicación oficial de Black Forest Labs.

El componente publicado aquí es la base de adaptación para nuevos "embodiments", junto con los codificadores congelados compartidos que utilizan las políticas SO-101 y DROID. No es una política robótica completa: para ejecutar en un robot real hay que cargar las cabezas de acción específicas de cada embodiment o entrenar las propias. El modelo incluye el tronco de acción compartido, flujos de vídeo y texto, y las cabezas de acción `ee50` y `gaming` (457 tensores en total).

Su relevancia actual radica en que publica pesos abiertos de un world action model multimodal bajo licencia FLUX Kommunity, con código de entrenamiento e inferencia disponible en GitHub y documentación específica para fine-tuning por embodiment. Está integrado en el ecosistema LeRobot (`library_name: lerobot`, `pipeline_tag: robotics`) y reutiliza Qwen3-VL-4B-Instruct como codificador de texto congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de accion multimodal con flujos de video y texto, tronco de accion compartido y cabezas de accion por embodiment; no se especifica el detalle interno del bloque (transformer/MoE) en la informacion disponible |
| Parametros totales | 7B en el modelo de accion, mas el codificador de texto Qwen3-VL-4B-Instruct |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL-4B-Instruct, multilingue, pero no se documentan idiomas para el modelo completo) |
| Licencia | FLUX Kommunity License v.1.0 (no comercial) para el modelo; el codificador de texto Qwen3-VL-4B-Instruct es una copia sin modificar bajo Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un world action model de 7B que recibe tres entradas (fotogramas de camara, estado del robot e instruccion de texto) y produce dos salidas acopladas: un chunk de acciones y los siguientes fotogramas de video, generados conjuntamente mediante un proceso de denoising. Los pesos contienen 457 tensores distribuidos en flujos de video y texto, un tronco de accion compartido y cabezas de accion especificas (`ee50` y `gaming`). El repositorio incluye tres componentes separados: el propio action base (`flux-3-action-base.safetensors`), un VAE de video compartido (`video_vae.safetensors`) y el codificador de texto (`text_encoder/`, copia sin modificar de Qwen/Qwen3-VL-4B-Instruct).

En cuanto al entrenamiento, no se especifican en la informacion proporcionada el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card si indica que cada nuevo embodiment requiere sus propias cabezas de accion y remite a la documentacion de fine-tuning, lo que implica un esquema de preentrenamiento sobre una base generica y adaptacion posterior de las cabezas. El codigo de entrenamiento e inferencia esta publicado en el repositorio `black-forest-labs/flux-action` de GitHub.

## Capacidades

- Generacion de acciones robotizadas: recibe fotogramas de camara, estado del robot e instruccion de texto y devuelve el siguiente chunk de acciones como objetivos articulares (joint targets).
- Prediccion de video (world model): genera, de forma conjunta con las acciones, los siguientes fotogramas de la escena, lo que permite anticipar visualmente el resultado de la accion.
- Adaptacion a nuevos embodiments: la base esta pensada para entrenar cabezas de accion nuevas para otros robots, simuladores o juegos.
- Cabezas de accion incluidas: `ee50` y `gaming`.
- Reutilizacion de codificadores congelados: el VAE de video y el codificador Qwen3-VL-4B-Instruct son compartidos por las politicas SO-101 y DROID.
- Tool calling / function calling: no documentado; el modelo no es un LLM de proposito general y no se describe soporte de herramientas.
- Agentes y razonamiento multi-step: no documentado como capacidad explicita.
- Capacidades multilingues: no documentadas para el modelo de accion (el codificador de texto subyacente es multilingue).
- Otras capacidades especiales (vision, audio, modo thinking): vision a traves de los fotogramas de camara y del codificador Qwen3-VL; audio y modo thinking no disponibles.

## Casos de uso

- Adaptacion a un brazo robotico nuevo: partiendo de `flux-3-action-base.safetensors` y de los codificadores congelados, se entrenan cabezas de accion especificas para un embodiment distinto siguiendo la guia de fine-tuning. Es el caso de uso principal declarado por el autor.
- Despliegue de politicas SO-101: el modelo sirve como base para la politica `flux-3-action-so101`, pensada para brazos de bajo coste tipo SO-101, cargando las cabezas ya entrenadas.
- Manipulacion sobre DROID: la politica `flux-3-action-droid` reutiliza estos codificadores para tareas de manipulacion sobre el dataset DROID, util para investigacion reproducible en entornos de laboratorio.
- Prototipado en simulacion antes de tocar hardware: al generar tambien fotogramas de video, se puede validar visualmente la trayectoria prevista de la accion en un simulador antes de ejecutarla en un robot fisico.
- Investigacion en world action models: sirve como punto de partida para experimentos de acoplamiento accion-video, ablaciones del tronco compartido o comparativas de cabezas de accion.
- Aplicaciones de gaming y control tipo mando: la cabeza `gaming` permite reutilizar la base para entradas de control en entornos de juego o simuladores.
- Teleoperacion asistida por lenguaje natural: combinando el estado del robot y una instruccion textual, el modelo puede generar chunks de accion para tareas guiadas por el operador en laboratorio.
- Generacion de datos sinteticos de video robotico: los fotogramas predichos por el world model pueden emplearse como datos aumentados para entrenar otros componentes de percepcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (estimacion propia a partir del tamano del repo, no confirmada por el autor): la suma de pesos ronda los 25,4 GB del repositorio, con aproximadamente 14 GB para la base de 7B en bf16, unos 8 GB para el codificador Qwen3-VL-4B-Instruct y el resto para el VAE de video y configuraciones.
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, un despliegue en precision bf16 completa requeriria GPUs de 40-80 GB (A100 40/80 GB, H100, L40S 48 GB). Es una estimacion, no un dato publicado.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar todos los componentes en bf16 segun la estimacion anterior; requeriria cuantizacion o carga selectiva de componentes, opcion no documentada en la informacion disponible.
- Opciones de despliegue: el modelo se integra en LeRobot (`library_name: lerobot`) y el codigo de entrenamiento e inferencia esta en `black-forest-labs/flux-action`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo, y no serian adecuados al no tratarse de un LLM de generacion de texto.
- Latencia y throughput: no disponibles.
- Restriccion de seguridad: la model card insiste en que el modelo solo emite objetivos articulares y no acota velocidad, fuerza ni espacio de trabajo, por lo que la aplicacion debe imponer esos limites y mantener un paro de hardware accesible.

## Comparativa con modelos similares

La categoria natural de comparacion son los modelos de vision-lenguaje-accion y world action models (OpenVLA, pi0, GR00T N1, entre otros). Sin embargo, la informacion proporcionada no incluye datos verificados de esos modelos ni del propio FLUX 3 Action frente a ellos, por lo que no es posible construir una comparativa numerica fiable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Action Base | 7B (accion) + 4B (codificador de texto) | no disponible | no disponible | FLUX Kommunity License (no comercial) | Pesos abiertos en HuggingFace |
| Alternativas de la misma categoria (OpenVLA, pi0, GR00T N1) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una politica completa: es una base de adaptacion. Para controlar un robot real hay que anadir cabezas de accion entrenadas para ese embodiment concreto.
- Ausencia total de limites de seguridad: nada en el modelo acota la velocidad articular, la fuerza ni el espacio de trabajo. La aplicacion debe imponer esos limites y disponer de un paro de emergencia accesible.
- Uso no comercial: la licencia FLUX Kommunity License v.1.0 restringe el uso comercial. Cualquier despliegue en produccion requiere revisar los terminos con Black Forest Labs. Solo el codificador de texto Qwen3-VL-4B-Instruct queda bajo Apache-2.0.
- Usos explicitamente fuera de alcance: controlar maquinas de forma que se ponga en peligro a personas sin supervision humana, toma de decisiones totalmente automatizada con impacto en derechos legales, acoso, y cualquier uso que explote o perjudique a menores.
- Riesgo de acciones incorrectas o derivas: al generar objetivos articulares sin garantias de factibilidad fisica, una prediccion erronea puede provocar movimientos invalidos o inseguros. Se recomienda validar siempre en simulador o con los limites de seguridad del brazo activados.
- Idioma y contexto: no se documentan idiomas soportados ni longitud de contexto, por lo que no se puede garantizar el comportamiento con instrucciones largas o en idiomas distintos del ingles.
- Falta de validacion comunitaria: el repositorio espejo registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia publica de uso en produccion.
- Es un espejo no oficial: el repositorio `Jinstudio/flux-3-action-base` no es una publicacion de Black Forest Labs; conviene usar el repositorio oficial y verificar la integridad de los pesos.
- No hay resultados de benchmarks publicos disponibles, lo que dificulta estimar su rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/Jinstudio/flux-3-action-base
- Modelo original: https://huggingface.co/black-forest-labs/flux-3-action-base
- Coleccion FLUX 3 Action: https://huggingface.co/collections/black-forest-labs/flux-3-action-6ab25aef555dd30ab86567f8
- Politica SO-101: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Politica DROID: https://huggingface.co/black-forest-labs/flux-3-action-droid
- Documentacion general: https://docs.bfl.ai/flux_3/flux3_action_overview
- Guia de fine-tuning: https://docs.bfl.ai/flux_3/flux3_action_finetuning
- Codigo de entrenamiento e inferencia: https://github.com/black-forest-labs/flux-action
- Pagina del modelo en BFL: https://bfl.ai/models/flux-3-action
- Blog de seguridad de BFL: https://bfl.ai/blog/capable-open-and-safe-combating-ai-misuse
- Codificador de texto: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Contacto de seguridad: safety@blackforestlabs.ai
