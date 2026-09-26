# dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter200

## Resumen

El modelo `dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter200` es un adaptador LoRA de bajo rango (r256) para generación de vídeo condicionada, orientado a robótica de manipulación. No es un modelo autónomo: se trata de un checkpoint "trainable-only" que debe cargarse sobre un backbone concreto, `fused_video2world_dit`, publicado en el repositorio `dreamdifferent/widowx250-video-fused` (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, fichero `checkpoints/video_backbone/iter_000001060_fused.pt`, 3.913.057.284 bytes). El adaptador corresponde a la iteración 200 de un entrenamiento cuya ejecución finalizó con estado `completed`.

El modelo pertenece a la familia MimicVideo (Video2World), un pipeline de generación de vídeo para robótica que combina un transformer de difusión sobre latentes de vídeo con condicionamiento textual mediante un codificador T5-11B. El adaptador se ha entrenado sobre el dataset `dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture` (revisión `994be7f8...`), compuesto por 256 episodios y 54.349 fotogramas, con dos cámaras (`observation.images.corner_cam` y `observation.images.front_cam`) dispuestas en `hstack` a 5 Hz, y 24 instrucciones condicionadas por episodio.

Su relevancia es acotada pero específica: se trata de un artefacto de investigación reproducible (incluye SHA-256 del backbone, commits exactos de MimicVideo y del bundle de checkpoints, y ficheros de configuración) para estudiar modelos del mundo aplicados a manipulación robótica multi-cámara y a la transferencia cruzada entre plataformas (Panda y WidowX). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se publica información sobre licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de video, tipo `fused_video2world_dit`; se distribuye como adaptador LoRA (rango 256) sobre dicho backbone |
| Parametros totales | no disponible (el backbone tiene un fichero de pesos de 3.913.057.284 bytes; el numero de parametros no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de video condicionado por instruccion textual; no se declara ventana temporal ni de tokens) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas ni GGUF) |
| Idiomas soportados | no disponible; el condicionamiento textual se realiza con un codificador T5-11B (`text_encoder/t5-11b`) |
| Licencia | no disponible en la ficha; la model card remite a las condiciones del dataset, de MimicVideo, de NVIDIA Cosmos y del checkpoint base |
| Formato de pesos | PyTorch (`.pt`); checkpoint LoRA entrenable, no safetensors. Incluye tokenizador de video `video_backbone/tokenizer/tokenizer.pth` |
| Tamano del repositorio | 0,7 GB |
| Iteracion del adaptador | 200 (ejecucion con estado `completed`) |
| Backbone requerido | `dreamdifferent/widowx250-video-fused`, revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, ruta `checkpoints/video_backbone/iter_000001060_fused.pt`, SHA-256 `d0f24c049bee63b03d3b62747b240a2d1822ddd5f83a52fcd866a882e80122b1`, iteracion de origen 1060 |
| Pipeline declarado | robotics |
| Fecha de creacion / actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un `fused_video2world_dit`: un transformer de difusion que opera sobre representaciones latentes de video (tokenizador propio incluido en el bundle) y que recibe condicionamiento textual mediante T5-11B. El adaptador publicado es exclusivamente la componente entrenable (LoRA de rango 256) resultante de la ejecucion `v2w_panda_widowx_level2_widowx_texture_2cam_hstack_from_widowx250_video_fused_f0cea76_lora_r256`. Es importante destacar que el backbone inicial ya incorpora una fusion LoRA previa de WidowX/Bridge; la propia model card advierte de que cargar el backbone original de Bridge en su lugar seria incorrecto.

Los datos de entrenamiento corresponden al contrato declarado: 256 episodios y 54.349 fotogramas, dos camaras (`observation.images.corner_cam`, `observation.images.front_cam`) compuestas en `hstack` a 5 Hz, y 24 instrucciones condicionadas por episodio listadas en `vam_cross_video_lora_manifest.json`. El dataset no se distribuye con el modelo. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica mas destacable del artefacto es su caracter reproducible y verificable: se fijan commits de MimicVideo (`e3355dbc93132b576c02f920a59b4fc18a4f5906`), del bundle de checkpoints (`jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8`) y de la revision del dataset, junto con los ficheros `config.yaml`, `vam_cross_video2world_config.json` y `vam_cross_video_lora_manifest.json`.

## Capacidades

- Generacion de video condicionada por instruccion textual en lenguaje natural, dentro del paradigma Video2World.
- Prediccion de futuros visuales de escenas de manipulacion robotica con dos camaras simultaneas compuestas en horizontal.
- Condicionamiento por tarea: el manifiesto de entrenamiento incluye 24 instrucciones condicionadas por episodio.
- Modelado de transiciones a 5 Hz, frecuencia coherente con bucles de control de robot de baja/media frecuencia.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje con interfaz de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; el modelo es una componente generativa dentro de un pipeline mayor (MimicVideo), no un agente autonomo.
- Capacidades multilingues: no disponible.
- Capacidades especiales: adaptador LoRA de rango 256 entrenable sobre un backbone DiT fusionado; incluye tokenizador de video y requiere un codificador T5-11B para el texto. No se declaran modos de "pensamiento", audio ni vision generalista.

## Casos de uso

- Modelos del mundo para planificacion de manipulacion: dado un estado visual actual (dos camaras) y una instruccion, generar rollouts de video que permitan evaluar la evolucion esperada de la escena antes de ejecutar una accion en el robot real.
- Aumento de datos sinteticos para aprendizaje por imitacion: producir trayectorias visuales adicionales a partir de las 24 tareas del manifiesto para ampliar el conjunto de entrenamiento de politicas de manipulacion.
- Evaluacion offline de politicas: simular visualmente las consecuencias de una politica candidata y comparar con la distribucion observada en los 54.349 fotogramas del dataset, reduciendo el numero de ensayos fisicos necesarios.
- Investigacion en consistencia multi-camara: el layout `hstack` a 5 Hz con camara frontal y de esquina permite estudiar la coherencia geometrica entre vistas generadas por un mismo modelo de difusion.
- Transferencia cruzada entre plataformas (Panda y WidowX): el modelo se entrena sobre datos que combinan ambas plataformas, lo que lo hace adecuado para experimentos de generalizacion entre morfologias de brazo.
- Estudio de robustez a variaciones de textura y apariencia: la nomenclatura `texture` del dataset y del run sugiere que el adaptador esta pensado para analizar como el modelo responde a cambios de apariencia sin cambiar la tarea subyacente.
- Reproducibilidad de experimentos de video generativo en robotica: al fijar SHA-256 del backbone, commits y ficheros de configuracion, sirve como punto de partida verificable para replicar o extender la iteracion 200 con otros rangos LoRA o mas iteraciones.
- Base para fine-tuning posterior: al ser un adaptador entrenable, puede reutilizarse como inicializacion para nuevos dominios roboticos, siempre que se respete el backbone exacto requerido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, PSNR, SSIM, exito de tarea ni comparaciones con otros checkpoints), y la busqueda web no aporta resultados de evaluacion asociados a este repositorio.

## Requisitos de hardware

Nota: los siguientes valores son estimaciones derivadas de los tamanos de fichero declarados, no datos publicados por el autor.

- Adaptador LoRA: 0,7 GB de repositorio, con lo que el adaptador en si es ligero y no determina los requisitos de memoria.
- Backbone DiT requerido: fichero de 3.913.057.284 bytes (aproximadamente 3,6 GiB), que debe residir en memoria al aplicar el adaptador.
- Codificador de texto T5-11B: a precision completa supone decenas de gigabytes (del orden de 44 GB en fp32 y en torno a 22 GB en bf16); es el componente que mas condiciona el presupuesto de VRAM. La cuantizacion exacta empleada no esta declarada.
- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion conservadora, el conjunto backbone + T5-11B en bf16 requiere del orden de 26-30 GB solo para pesos, mas activaciones de video, por lo que un entorno de 40-80 GB es el escenario realista.
- GPU recomendadas: A100 80 GB, H100 80 GB y, en general, aceleradores con 40 GB o mas para evitar estrategias agresivas de offloading.
- Cabe en GPU de consumo: no disponible como dato confirmado. En una RTX 4090 (24 GB) el cuello de botella es el codificador T5-11B; seria necesario cuantizarlo o descargarlo a CPU, algo que la informacion disponible no documenta ni valida.
- Opciones de despliegue: el modelo exige el codigo y la configuracion de MimicVideo (commit `e3355dbc...`) y los ficheros `config.yaml` y `vam_cross_video2world_config.json`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que en cualquier caso no aplican a un DiT de video con tokenizador propio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones publicadas de alternativas directas. Los unicos artefactos comparables identificados en la busqueda pertenecen al mismo autor y a la misma familia de adaptadores Video2World; se comparan a continuacion con los datos disponibles, que se limitan al nombre del repositorio y a la iteracion implicita en el mismo.

| Modelo | Familia | Iteracion | Modificador de tarea / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter200` (este modelo) | MimicVideo Video2World LoRA | 200 | Panda + WidowX, textura, dos camaras | no disponible | publico en HuggingFace, 0 descargas |
| `dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200` | MimicVideo Video2World LoRA | 200 | Panda con gripper Robotiq, textura | no disponible | publico en HuggingFace |
| `dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400` | MimicVideo Video2World LoRA | 400 | Incluye UR5e y contacto v2 | no disponible | publico en HuggingFace |
| Alternativas de terceros (otros world models de robotica) | no disponible | no disponible | no disponible | no disponible | no se identificaron en la busqueda |

No se han encontrado en la informacion disponible parametros, contextos, rendimiento ni licencias de estos repositorios hermanos, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador que requiere obligatoriamente el backbone `fused_video2world_dit` en la revision exacta indicada. Cargar el backbone original de Bridge en su lugar produce un resultado incorrecto segun la propia model card.
- Licencia no declarada: no se especifican terminos de uso, por lo que el uso comercial queda sin cobertura explicita y sujeto a las condiciones del dataset, de MimicVideo, de NVIDIA Cosmos y del checkpoint base.
- El dataset de entrenamiento no se distribuye con el modelo y esta sujeto a su propia politica de acceso; el usuario debe verificar que cumple dicha politica antes de reutilizarlo.
- Riesgo de alucinacion visual: al ser un modelo generativo de difusion, puede producir transiciones fisicamente inconsistentes o artefactos en escenas fuera de la distribucion de los 256 episodios de entrenamiento. No se publican metricas que cuantifiquen este riesgo.
- Sesgos conocidos: no disponible. El dataset esta limitado a dos plataformas roboticas (Panda y WidowX), dos camaras y 24 tareas, lo que restringe fuertemente la diversidad de escenas, objetos e iluminacion.
- Limitaciones de contexto o idioma: no se documenta la ventana temporal soportada ni los idiomas de las instrucciones de condicionamiento; el codificador T5-11B es multilingue por diseno, pero el entrenamiento se ha realizado con las 24 instrucciones del manifiesto.
- Frecuencia fija de 5 Hz y layout `hstack` con dos camaras concretas: desviarse de esa configuracion no esta soportado por la informacion disponible.
- Reproducibilidad estricta: cualquier variacion en el codigo de MimicVideo, el tokenizador de video o la version de T5 puede alterar los resultados; la model card exige usar el mismo codigo y configuracion registrados.
- Madurez: 0 descargas y 0 likes, sin resultados de benchmarks publicados; no es un artefacto validado para produccion.
- Advertencia de seguridad en robotica: usar rollouts generados para validar politicas no sustituye a las pruebas fisicas con medidas de seguridad, dado que el modelo no garantiza consistencia fisica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter200
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused (revision `f0cea76b62c5dd66b06b9f965932ddea32a7b546`)
- Bundle de checkpoints de MimicVideo: https://huggingface.co/jonpai/mimic-video (commit `f28339034831e3c2374be075e622e1ff38ebe0f8`)
- Dataset de entrenamiento (no incluido): https://huggingface.co/datasets/dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture (revision `994be7f8952807008c316db7943ec732bf70b978`)
- Repositorios hermanos identificados en la busqueda:
  - https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter200
  - https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter400
- Paper, blog o demo oficial: no disponible. La model card menciona los terminos upstream de MimicVideo, NVIDIA Cosmos y el checkpoint base, pero no incluye enlaces directos a los mismos.
- Otros resultados de la busqueda web (listas de modelos gratuitos, declaraciones institucionales sobre control de IA) no guardan relacion con este modelo y se omiten.
