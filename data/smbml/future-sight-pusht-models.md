# smbml/future-sight-pusht-models

## Resumen

Future Sight PushT es una familia de 16 checkpoints de modelos del mundo (world models) condicionados por acciones, entrenados sobre la tarea de manipulacion PushT. Los publica Sam Bateman (usuario `smbml` en Hugging Face) como material asociado al articulo "Training Controllable World Models via Action Influence Maximization" (S. Bateman et al., CoRL 2026). El modelo no es un LLM: recibe observaciones RGB y acciones continuas de 6 grados de libertad del efector final, y predice fotogramas RGB futuros a 256 x 256, es decir, aprende la dinamica del entorno en lugar de generar lenguaje.

El objetivo es servir de "tunel de viento" controlado para estudiar como el escalado y la composicion de los datos afectan a la prediccion y la generalizacion de un modelo del mundo. Para ello se comparan recolecciones pasivas grandes (PPO1, PPO100, Recovery1, Recovery100) con recolecciones activas mas pequenas especificas de tarea (AIM500, DADS500, DIAYN500, ICM500, METRA500, random walk, uniform random), todas bajo una arquitectura compartida. La relevancia actual esta en la investigacion en modelos del mundo para robotica y en la comparacion reproducible de metodos de exploracion.

Cada checkpoint ocupa aproximadamente 580 MB e incluye el VAE congelado, con pesos en media movil exponencial (EMA) y sin estado de optimizador. El repositorio completo suma 9,28 GB y se distribuye en formato nativo Orbax para JAX, con licencia MIT. La informacion publicada no incluye numero de parametros, contexto ni resultados agregados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo condicionado por acciones con difusion latente (latent diffusion), implementado en JAX; incluye VAE congelado |
| Parametros totales | no disponible (checkpoint de ~580 MB, incluye VAE congelado y pesos EMA; no se declara el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; condiciona sobre observaciones RGB y acciones, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (se distribuye en precision nativa, sin variantes GGUF, AWQ, GPTQ ni INT8/INT4) |
| Idiomas soportados | en (etiqueta de metadatos; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Orbax (inference bundles nativos de JAX); no safetensors, no GGUF |
| Entradas | Observaciones RGB y acciones continuas de 6D (delta del efector final) |
| Salidas | Fotogramas RGB predichos a 256 x 256 |
| Numero de checkpoints | 16 (~580 MB cada uno; 9,28 GB en total) |
| Pipeline declarado | robotics |
| Soporte de inferencia en Hugging Face | no (`inference: false`) |

## Arquitectura y entrenamiento

La familia emplea una arquitectura compartida de modelo del mundo condicionado por acciones con difusion latente: las observaciones RGB se codifican en un espacio latente mediante un VAE congelado, y un modelo de difusion genera la prediccion del siguiente fotograma a partir de la observacion actual y de la accion continua de 6D. Los pesos distribuidos son medias moviles exponenciales (EMA) y no incluyen estado de optimizador ni de reanudacion de entrenamiento, lo que confirma que son artefactos de inferencia en formato Orbax para JAX.

El entrenamiento combina recolecciones pasivas basadas en PPO con recolecciones activas de exploracion. `PPO1` y `Recovery1` usan el primer 1 % de los metadatos de entrenamiento correspondientes, mientras que `PPO100` y `Recovery100` usan el corpus completo; el sufijo `500` denota un presupuesto adicional de recoleccion. `AIM500` emplea 100 trayectorias de cada una de cinco iteraciones de recoleccion con una mezcla de muestreo PPO:AIM de 2:1, y el resto de los checkpoints ablate metodos de exploracion alternativos (DADS, DIAYN, ICM, METRA, random walk, uniform random, Recovery) o componentes de la recompensa (novelty only, MI only, fixed reward estimate). El numero de pasos de entrenamiento varia entre 26.000 y 44.000 segun el checkpoint. No se especifican en la informacion disponible el volumen total de tokens o transiciones, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Prediccion de fotogramas RGB futuros a 256 x 256 condicionada por acciones continuas de 6D del efector final.
- Modelado de la dinamica de la tarea PushT: empuje de un bloque con forma de T mediante un actuador.
- Generacion de rollouts de multiples pasos: los ejemplos publicados muestran 33 transiciones predichas por clip.
- Evaluacion de politicas en dos modos ilustrados por el autor: behavior cloning y PushAway.
- Comparacion controlada de estrategias de recoleccion de datos: pasiva (PPO) frente a activa (AIM, DADS, DIAYN, ICM, METRA, random walk, uniform random).
- Ablaciones de diseno de recompensa: novelty only, MI only y fixed reward estimate.
- Transferencia de exploracion: el checkpoint `Recovery1 + transferred AIM500` combina exploracion recogida en el entorno basado en PPO con una mezcla de entrenamiento Recovery1.
- No soporta tool calling, function calling, agentes basados en texto, razonamiento multi-paso simbolico, vision general de proposito abierto, audio ni modo de "pensamiento": esas capacidades no aplican a este modelo.

## Casos de uso

- Investigacion en modelos del mundo para robotica: reproduccion y extension de los experimentos del articulo CoRL 2026, cargando cualquiera de los 16 checkpoints con la API `load_world_model` de Future Sight y comparando predicciones bajo las mismas acciones registradas.
- Planificacion basada en modelo (MPC) en entornos de manipulacion: el modelo predice consecuencias de secuencias de acciones de 6D, de modo que un planificador puede evaluar candidatos en el espacio latente antes de ejecutarlos en el robot.
- Generacion de datos sinteticos para aumento de dataset: los rollouts predichos a 256 x 256 pueden emplearse como transiciones adicionales para preentrenar o regularizar politicas, especialmente cuando la recoleccion real es costosa.
- Entrenamiento de politicas en simulador aprendido: el modelo actua como sustituto diferenciable del entorno PushT para aprendizaje por refuerzo sin acceso al simulador fisico.
- Evaluacion offline de politicas: comparar behavior cloning frente a PushAway con acciones identicas permite medir la degradacion de la prediccion en regimenes fuera de distribucion.
- Estudio de escalado de datos: los pares `PPO1`/`PPO100` y `Recovery1`/`Recovery100` permiten medir el efecto de pasar del 1 % al 100 % del corpus sobre la fidelidad de la prediccion.
- Analisis comparativo de metodos de exploracion: `AIM500`, `DADS500`, `DIAYN500`, `ICM500`, `METRA500`, `random walk500` y `uniform random500` se entrenaron con la misma arquitectura y presupuesto, lo que facilita comparaciones controladas de como la cobertura del espacio de estados afecta a la generalizacion.
- Comunicacion cientifica y docencia: los clips de rollout a 256 x 256 con acciones identicas son material visual directo para explicar que aprende un modelo del mundo y donde falla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos cualitativos de rollouts y advierte explicitamente que "no son un benchmark agregado ni una clasificacion de modelos". No hay cifras de MMLU, HumanEval, GSM8K ni metricas numericas de error de prediccion, exito de tarea o generalizacion en la informacion proporcionada.

| Checkpoint | Pasos de entrenamiento | Tamano |
|---|---:|---:|
| PPO1 + AIM500 | 36.000 | 580,1 MB |
| PPO1 | 26.000 | 580,0 MB |
| PPO1 + AIM500 (fixed reward estimate) | 42.000 | 580,0 MB |
| PPO1 + AIM500 (MI only) | 39.000 | 580,0 MB |
| PPO1 + AIM500 (novelty only) | 42.000 | 580,1 MB |
| PPO1 + DADS500 | 29.000 | 580,0 MB |
| PPO1 + DIAYN500 | 34.000 | 580,1 MB |
| PPO1 + ICM500 | 29.000 | 579,9 MB |
| PPO1 + METRA500 | 26.000 | 580,0 MB |
| PPO1 + random walk500 | 28.000 | 580,0 MB |
| PPO1 + Recovery500 | 27.000 | 580,1 MB |
| PPO1 + uniform random500 | 33.000 | 580,0 MB |
| PPO100 | 44.000 | 580,1 MB |
| Recovery1 | 37.000 | 580,0 MB |
| Recovery1 + transferred AIM500 | 42.000 | 580,1 MB |
| Recovery100 | 40.000 | 580,1 MB |

## Requisitos de hardware

- Almacenamiento: 580 MB por checkpoint; 9,28 GB si se descargan los 16. El repositorio completo ocupa 9,3 GB.
- VRAM estimada: no disponible. El bundle de ~580 MB incluye el VAE congelado y los pesos del modelo de difusion, lo que sugiere que la huella podria ser modesta, pero la VRAM real depende del tamano de lote, de la resolucion del espacio latente y del grafo de decodificacion, y el autor no publica cifras.
- GPU: el ejemplo oficial asume "one visible GPU" mediante `CUDA_VISIBLE_DEVICES=0`; no se especifica un modelo concreto. Al ser JAX sobre CUDA, se espera compatibilidad con GPUs NVIDIA; no se documenta soporte para ROCm, Metal ni CPU.
- GPU de consumo: no confirmado. No hay declaracion explicita de que quepa en una RTX 4090, RTX 3090 u otras GPUs consumer, aunque el tamano del checkpoint es compatible con ese segmento.
- Despliegue: exclusivamente mediante el repositorio Future Sight con su entorno Pixi (`pixi run python example.py`) y JAX inicializado antes de cualquier cargador de datos respaldado por TensorFlow. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni `transformers`, y no se requiere `trust_remote_code`.
- Descarga: `huggingface_hub.snapshot_download` con `allow_patterns` para seleccionar `models.json` y el subdirectorio del checkpoint deseado; se recomienda fijar un hash de commit completo de Hugging Face para reproducir un experimento.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por transicion ni de fotogramas por segundo.
- Multiplexacion: la API `create_device_mesh(data=1, model=1)` del ejemplo apunta a una unica GPU para datos y modelo; no se documentan configuraciones multi-GPU.

## Comparativa con modelos similares

No hay en la informacion proporcionada datos de parametros, contexto, rendimiento o licencia de modelos externos de la misma categoria, por lo que la comparacion con alternativas de terceros figura como no disponible. La comparacion relevante y documentada es interna al propio repositorio, ya que los 16 checkpoints comparten arquitectura y difieren en datos de entrenamiento y presupuesto.

| Grupo | Checkpoints | Datos de entrenamiento | Pasos |
|---|---|---|---|
| Base pasiva, 1 % | PPO1, Recovery1 | Primer 1 % de los metadatos correspondientes | 26.000 / 37.000 |
| Base pasiva, 100 % | PPO100, Recovery100 | Corpus completo | 44.000 / 40.000 |
| Exploracion activa (AIM) | PPO1 + AIM500, Recovery1 + transferred AIM500 | Mezcla PPO:AIM 2:1, 100 trayectorias por iteracion | 36.000 / 42.000 |
| Ablaciones de recompensa | fixed reward estimate, MI only, novelty only | AIM sin reestimacion de recompensa o con componentes aislados | 42.000 / 39.000 / 42.000 |
| Metodos de exploracion alternativos | DADS500, DIAYN500, ICM500, METRA500, random walk500, uniform random500 | Recoleccion con cada metodo sobre base PPO1 | 29.000 a 34.000 |
| Recuperacion | PPO1 + Recovery500 | Recoleccion de recuperacion sobre base PPO1 | 27.000 |

## Limitaciones y advertencias

- Ambito restringido: solo modela la tarea PushT a 256 x 256 con acciones de 6D del efector final. No es un modelo de proposito general ni transferible sin reentrenamiento a otros dominios.
- No es un modelo de lenguaje: la etiqueta `en` es metadatos del repositorio; no procesa ni genera texto, y no admite prompts, tool calling ni agentes conversacionales.
- Riesgo de deriva en rollouts largos: los modelos del mundo condicionados por acciones acumulan error de prediccion paso a paso. Los ejemplos publicados cubren 33 transiciones y el autor advierte que no constituyen un benchmark agregado; no debe asumirse estabilidad mas alla de ese horizonte.
- Alucinacion en el sentido de predicciones plausibles pero fisicamente incorrectas: sin metricas publicadas de error no es posible acotar la fidelidad fuera de la distribucion de entrenamiento.
- La model card no reporta analisis de sesgos. Al operar sobre una unica tarea de manipulacion con datos de recoleccion propios, cualquier sesgo estaria ligado a la distribucion de trayectorias del dataset `smbml/future-sight-pusht`.
- Dependencia de toolchain: requiere el repositorio Future Sight y su entorno Pixi, JAX y una GPU visible. No funciona con `transformers`, vLLM, llama.cpp, Ollama ni TGI, y no expone pesos en safetensors o GGUF.
- `inference: false` en Hugging Face: no hay endpoint de inferencia alojado; toda ejecucion es local o en infraestructura propia.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia no cubre posibles patentes o derechos sobre los datos de entrenamiento subyacentes, que se distribuyen en un repositorio separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente ni informes de terceros sobre su comportamiento en produccion.
- Sin cifras publicas de VRAM, latencia ni throughput: cualquier planificacion de despliegue exige medir en el hardware objetivo antes de comprometer recursos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smbml/future-sight-pusht-models
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/smbml/future-sight-pusht
- Perfil del autor (Sam Bateman): https://huggingface.co/smbml
- Directorio de checkpoints: https://huggingface.co/smbml/future-sight-pusht-models/tree/main/models
- Checkpoint de ejemplo usado en la documentacion: https://huggingface.co/smbml/future-sight-pusht-models/tree/main/models/ppo1-aim500
- Video de rollouts (ground truth frente a predicciones AIM): https://huggingface.co/smbml/future-sight-pusht-models/resolve/main/assets/rollouts.mp4
- Articulo de referencia: "Training Controllable World Models via Action Influence Maximization", S. Bateman et al., CoRL 2026 (enlace no disponible en la informacion proporcionada)
- Repositorio de codigo Future Sight: no disponible (la model card lo menciona, pero no se ha proporcionado su URL)
- Documentacion de Microsoft Foundry Models: https://learn.microsoft.com/en-us/azure/foundry/concepts/foundry-models-overview (referencia general no especifica de este modelo)
- Panorama de modelos de IA en 2026: https://medium.com/latesttechtrends/the-2026-ai-model-landscape-a-practical-guide-to-the-frontier-models-shaping-our-future-5e4fa7ae4016 (referencia general no especifica de este modelo)
- Listado de nuevos modelos de IA: https://lmmarketcap.com/new-ai-models (referencia general no especifica de este modelo)
