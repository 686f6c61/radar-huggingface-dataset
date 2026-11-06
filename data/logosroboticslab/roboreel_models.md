# LogosRoboticsLab/roboreel_models

## Resumen

RoboReel es un paquete de checkpoints de políticas de robotica publicados por LogosRoboticsLab como material reproducible del benchmark homonimo, descrito en el articulo "Monkey See, Can Monkey Do? A Benchmark for Evaluating Robot Skill Learning by Observation" (arXiv:2609.08209). No es un modelo generativo de proposito general, sino una coleccion de cinco politicas de manipulacion entrenadas para diez tareas concretas, pensadas para evaluar hasta que punto un sistema robotico puede aprender habilidades observando videos de demostracion humana.

El repositorio contiene los pesos exactos con los que se calcularon las cifras del articulo, no el ultimo checkpoint de cada entrenamiento. Cada metodo vive en un directorio propio y se organiza en dos suites de entrenamiento: `nd/` (escenas limpias, sin distracciones) y `wd/` (con distractores en entrenamiento y evaluacion). La suite ED (entrenamiento limpio, evaluacion con distractores) reutiliza los pesos de `nd/`.

La relevancia actual reside en que estandariza la comparacion entre enfoques muy distintos —desde un fine-tune completo de π0.5 con instrucciones generadas por un VLM hasta una politica de difusion ligera sobre representaciones de habilidades— bajo un mismo protocolo de 10 tareas, 80 demostraciones por tarea y un espacio de estado y accion de 8 dimensiones. El repositorio ocupa 49,7 GB y no incluye el dataset ni los pesos base de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixta segun metodo: π0.5 fine-tuneado (VLM + politica), π0.5 con condicionamiento por video (openpi, JAX FSDP), Vid2Robot (ViT-B/16 + Perceiver Resamplers + decoders), UniSkill (politica de difusion Robomimic sobre representaciones de habilidades) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que ningun metodo sea MoE) |
| Longitud de contexto | no disponible; en π0.5 condicionado por video se usan 512 tokens de demostracion (32 frames, 16 tokens por frame) |
| Tipos de cuantizacion | no disponible (se entrenan y publican en bf16; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (las instrucciones se generan con Qwen3-VL-4B, pero no se declara cobertura linguistica) |
| Licencia | other / see-model-card: pesos derivados de π0.5 sujetos a Apache-2.0 y a los Gemma Terms of Use; `uniskill_policy` bajo la licencia del modelo card |
| Formato de pesos | safetensors en directorio `ckpt/` (JAX/orbax y LeRobot), `ckpt.pt` (Vid2Robot) y `ckpt.pth` (UniSkill); configuracion en `train_config.json` y sidecars `norm_stats.json`, `action_codec.json`, `demonstration_config.txt` |

## Arquitectura y entrenamiento

El repositorio agrupa cinco metodos con arquitecturas heterogeneas. `vlm_pi05` es un fine-tune completo de `lerobot/pi05_base` solo con datos de experto: AdamW con LR pico 2,5e-5 y decaimiento coseno hasta 0,1x, batch 32, bf16, gradient checkpointing, 50k pasos, chunk de accion 20 y semilla 42; las instrucciones en lenguaje natural se generan a partir del video humano con Qwen3-VL-4B. Los dos metodos `vid_cond_pi05_*` parten de `pi05_base` en openpi con JAX FSDP (AdamW beta 0,9/0,95, epsilon 1e-8, weight decay 1e-10, grad clip 1,0, LR pico 5e-5, 1k warmup, EMA 0,999, batch 64, 50k pasos, semilla 42), y procesan 512 tokens de demostracion repartidos en 32 frames a 16 tokens por frame con muestreo uniforme; la unica diferencia entre Uniform y Keyframes es la seleccion de fotogramas, mediante keyframes de mejor punto generados con GPT-5.4-mini sobre el video humano y submuestreados a 2 fps.

Vid2Robot emplea codificadores ViT-B/16, resamplers Perceiver de 2 capas con 64 latentes y decoders de 4 capas con d=768, con 16 frames de prompt y 8 de estado, chunk de accion 4 sobre 256 bins y entrenamiento AdamW de LR pico 3e-4 a 1e-6, weight decay 0,05, 2k warmup, batch 32, 50k pasos y semilla 42. UniSkill es una politica de difusion de Robomimic que opera sobre representaciones de habilidades producidas por un modelo inverso de dinamica de habilidades (ISD) de los autores originales, sin fine-tune: Adam 1e-4, batch 256, 1000 epocas de 100 iteraciones (100k pasos), EMA power 0,75, 100 pasos DDPM en entrenamiento y 10 DDIM en inferencia, con `skill_aug` aug_num 5 y semilla 0.

El setup comun a todos los runs son 10 tareas (`bowl_in_plate`, `close_drawer`, `empty_basket`, `open_lid`, `pick_cube`, `press_toaster`, `push_cube`, `stack_cups`, `toys_in_basket`, `toys_in_drawer`), 80 demostraciones por tarea (`max_demo_index: 79`) y estado y accion de 8 dimensiones. En los metodos condicionados por video, la camara de demostracion es `front` y las camaras del robot son `base_camera` y `hand_camera`.

## Capacidades

- Manipulacion robotica por imitacion en 10 tareas de pick-and-place, apertura y cierre, apilado y organizacion de objetos.
- Aprendizaje por observacion: los metodos `vid_cond_pi05_*` condicionan la politica en videos de demostracion humana, con dos estrategias de muestreo de frames (uniforme y keyframes).
- Generacion de instrucciones en lenguaje natural a partir de video humano mediante Qwen3-VL-4B (solo en el pipeline de `vlm_pi05`).
- Prediccion de acciones en chunks: 20 pasos por chunk en π0.5 y 4 pasos sobre 256 bins en Vid2Robot.
- Politica de difusion sobre representaciones de habilidades (UniSkill) con 10 pasos DDIM en inferencia.
- Evaluacion reproducible en tres regimenes: escenas limpias (ND), con distractores en entrenamiento y evaluacion (WD) y generalizacion de limpio a distractor (ED).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Evaluacion comparativa de metodos de imitation learning: usar los cinco checkpoints bajo el mismo protocolo de 10 tareas y 80 demostraciones para medir que enfoque generaliza mejor antes de comprometerse con una arquitectura en un proyecto real.
- Estudio de robustez ante distractores: comparar `nd/` frente a `wd/` con el mismo metodo para cuantificar la degradacion que introducen objetos distractores en escena, reutilizando los pesos de `nd/` contra el banco de escenas WD de la suite ED.
- Investigacion sobre aprendizaje por observacion: los pares Uniform frente a Keyframes aíslan el efecto de la seleccion de fotogramas con hiperparametros identicos, lo que permite atribuir diferencias de rendimiento exclusivamente a la estrategia de muestreo.
- Reproduccion de resultados de un articulo: cada carpeta contiene el checkpoint exacto con el que se calcularon las cifras publicadas y su `train_config.json` con las rutas sustituidas por placeholders (`${ROBOREEL_DATA}`, `${ROBOREEL_CKPT}`, `${OPENPI_DATA_HOME}`), lo que facilita verificar los numeros del paper.
- Baseline ligero para prototipos en hardware modesto: `uniskill_policy` ocupa 0,74 GB y `vid2robot` 2,37 GB, lo que permite desplegar un baseline de manipulacion sin el coste de un fine-tune completo de π0.5 (9,35 GB).
- Transferencia a un nuevo conjunto de tareas: reutilizar los `train_config.json` y los sidecars de normalizacion (`norm_stats.json`, `action_codec.json`) como plantilla de configuracion para reentrenar sobre un dataset propio con el mismo formato de estado y accion de 8 dimensiones.
- Docencia y divulgacion: el repositorio separa claramente metodos, condiciones y configuraciones, lo que lo hace util para explicar en un curso las diferencias practicas entre condicionamiento por video, politicas de difusion y fine-tune de VLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo arXiv:2609.08209 y a la pagina del proyecto para las cifras, pero no incluye tablas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos ocupan 9,35 GB (`vlm_pi05`), 6,20 GB por variante de `vid_cond_pi05` (en bf16), 2,37 GB (`vid2robot`) y 0,74 GB (`uniskill_policy`); a ello hay que sumar activaciones y buffers de inferencia, no cuantificados en la documentacion.
- GPU recomendadas: no disponible. Los entrenamientos descritos usan bf16, gradient checkpointing y, en el caso de openpi, JAX FSDP, lo que sugiere aceleradores de datacenter, pero no se especifican modelos concretos.
- Cabeza en GPU de consumo: no disponible. Por tamano de pesos, `uniskill_policy` y `vid2robot` son los candidatos plausibles, pero no hay confirmacion oficial ni requisitos de VRAM publicados.
- Opciones de despliegue: no se documenta vLLM, llama.cpp, Ollama ni TGI. El repositorio remite al arnes de evaluacion y a los repositorios de codigo de entrenamiento y de entornos de simulacion; la descarga se realiza con `huggingface_hub` (`hf download`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboReel (`vlm_pi05`, `vid_cond_pi05_*`, `vid2robot`, `uniskill_policy`) | no disponible | no disponible (512 tokens de demostracion en π0.5 condicionado) | Benchmark de imitation learning por observacion con 5 metodos | other / see-model-card, con herencia de Gemma Terms | Publico en HuggingFace, 49,7 GB |
| π0.5 (`pi05_base`, openpi) | no disponible | no disponible | VLM-politica base sobre la que se fine-tunean tres de los metodos | Apache-2.0 (backbone PaliGemma/Gemma) | Publico, pero no redistribuido en este repo |
| UniSkill (modelo ISD original) | no disponible | no disponible | Modelo inverso de dinamica de habilidades, usado sin fine-tune | no disponible | Publico en la release de los autores, no redistribuido aqui |
| BC-Z | no disponible | no disponible | Citado solo en trabajos relacionados, nunca evaluado en el paper | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: son checkpoints de politica para 10 tareas concretas con estado y accion de 8 dimensiones; no admite prompts arbitrarios ni tareas fuera de ese conjunto.
- El repositorio no incluye el dataset RoboReel ni los pesos base de terceros (`pi05_base`, PaliGemma, CLIP, Depth-Anything-V2, el ISD de UniSkill), por lo que la evaluacion no es posible solo con lo descargado.
- Faltan dos de los siete metodos del articulo: los checkpoints de SeeDo y PointPolicy estan pendientes de publicacion.
- Licencia mixta y restrictiva en la practica: tres de los cinco metodos heredan los Gemma Terms of Use ademas de Apache-2.0; cualquier uso comercial debe revisarse contra esos terminos, no solo contra la etiqueta `other` del repositorio.
- Las rutas absolutas de los `train_config.json` se sustituyeron por placeholders; sin apuntar `data_root`/`data_dir` a un dataset real, el arnes de evaluacion no localiza los videos de demostracion.
- Riesgo de alucinacion y sesgos: no se documentan sesgos conocidos ni evaluaciones de robustez fuera del benchmark; el comportamiento en escenas, objetos o camaras distintas a las del dataset no esta caracterizado.
- Cobertura linguistica no declarada: aunque se generan instrucciones con Qwen3-VL-4B, no se especifica en que idiomas ni con que calidad.
- No se publican requisitos de VRAM, latencia ni throughput, lo que dificulta planificar un despliegue en produccion sin medir empiricamente.
- El modelo ISD de UniSkill debe tomarse de la release original de sus autores y usarse sin modificar; no se puede sustituir por una version propia sin invalidar la comparacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LogosRoboticsLab/roboreel_models
- Articulo: https://arxiv.org/abs/2609.08209
- Pagina del proyecto RoboReel: https://roboreel.github.io
- Licencia (seccion del modelo): https://huggingface.co/LogosRoboticsLab/roboreel_models#licensing
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- openpi (base π0.5, Apache-2.0): no disponible en la informacion proporcionada
- Release original de UniSkill (modelo ISD): no disponible en la informacion proporcionada
- Repositorio de codigo de entrenamiento y arnes de evaluacion: no disponible como enlace directo en la informacion proporcionada
- Repositorio de entornos de simulacion del benchmark: no disponible como enlace directo en la informacion proporcionada
