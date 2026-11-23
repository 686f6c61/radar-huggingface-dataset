# seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-72ep-lr1e4-step5000

## Resumen
OpenWAM-Alpha RoboDojo es un modelo de mundo-accion (world-action model) para robotica desarrollado por seungkukim a partir del modelo base OpenWAM/OpenWAM-Alpha-Sim-RoboDojo, que a su vez se describe en el paper OpenWAM (arXiv:2609.07398). Esta variante concreta es un post-entrenamiento sobre transiciones de un profesor privilegiado (PyRUA-Lean, un agente LLM code-as-policy) recogidas durante rollouts de DAgger ingenuo en tres tareas de simulacion RoboDojo: `play_tic_tac_toe`, `pour_balls_into_vase` e `insert_tubes`. El objetivo es que el modelo aprenda a recuperarse de estados inducidos por el estudiante, no solo a imitar trayectorias limpias de demostracion.

El repositorio es un reemplazo directo del modelo base: mantiene el mismo layout, nombres de tensores y ficheros auxiliares, y solo cambian los pesos. El checkpoint publicado corresponde al paso 5000 de un entrenamiento corto (74 minutos en 4x H200) con learning rate 1e-4, batch global 64 y 72 episodios por tarea. El modelo base integra un backbone de video Wan2.2-TI2V-5B, segun se deduce de las instrucciones de uso de la model card.

La relevancia de esta ficha es acotada: se trata de un experimento de investigacion con 0 descargas y 0 likes en el momento de la consulta, pensado para evaluar recetas de DAgger en entornos simulados de manipulacion robotica. No es un modelo de proposito general ni un asistente conversacional, y no debe evaluarse con las metricas habituales de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model; backbone de video Wan2.2-TI2V-5B segun instrucciones de carga) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoint_step_*.safetensors`), mas `config.yaml` y `normalization_stats.npy` |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Modelo base | OpenWAM/OpenWAM-Alpha-Sim-RoboDojo |
| Dataset de entrenamiento | seungkukim/robodojo-naive-dagger-teacher-openwam-hdf5-ttt-pour-insert-72ep |
| Tamano del repo | 24,8 GB |
| Libreria | openwam |
| Tareas | play_tic_tac_toe, pour_balls_into_vase, insert_tubes |
| Simulador | arx_x5 (RoboDojo) |
| Hardware de entrenamiento | 4x NVIDIA H200 |
| Tiempo de entrenamiento | 74 min 21 s |
| Paso del checkpoint | 5000 |
| Precision | bf16, ZeRO stage 2 |

## Arquitectura y entrenamiento
La model card no detalla la arquitectura interna del modelo base; solo indica que el backbone de video se configura mediante `model.video_backbone.model_path` apuntando a un Wan2.2-TI2V-5B local, lo que sugiere un modelo de mundo condicionado por video y acciones. Los pesos se cargan con `openwam.deploy.model_loader.load_from_checkpoint_dir`, que selecciona el `checkpoint_step_*.safetensors` de mayor paso en el directorio.

El entrenamiento es un post-entrenamiento sobre el modelo base con datos de DAgger ingenuo. En cada episodio, un profesor y un estudiante comparten el control: al inicio y tras cada programa del profesor que mueve el robot, una moneda asigna el control al profesor con probabilidad 0,6, y en caso contrario al estudiante durante dos chunks de accion (64 pasos nativos). Solo se conservan las transiciones (estado, accion) del profesor; cada racha ininterrumpida de al menos 32 pasos del profesor forma un clip. Los clips que comienzan justo despues de un turno del estudiante arrancan desde el estado que dejo el estudiante, de modo que capturan la recuperacion del profesor. Se usan todos los episodios, exitosos o no.

El dataset contiene 72 episodios por tarea, con 588 clips y 78.868 fotogramas en total, en formato HDF5 de RoboDojo, sobre los layouts de evaluacion 0-2 y 20-43 (24 por set). El desglose por tarea es: `play_tic_tac_toe` con 72 episodios, 28 exitosos, 241 clips, 34.538 fotogramas y 31% de pasos del estudiante; `pour_balls_into_vase` con 72 episodios, 27 exitosos, 176 clips, 22.745 fotogramas y 33% de pasos del estudiante; e `insert_tubes` con 72 episodios, 25 exitosos, 171 clips, 21.585 fotogramas y 34% de pasos del estudiante. La configuracion de entrenamiento usa batch_size 16, max_steps 5000, save_steps 1000, warmup_ratio 0,10 (500 pasos), learning rate 1e-4 con scheduler coseno y lr_min_ratio 0,01, sin gradient checkpointing. La normalizacion min-max reutiliza sin cambios el `normalization_stats.npy` del modelo base (md5 `855296b406a1d16fbc92318564d6152d`), byte a byte identico, para que la desnormalizacion de acciones en inferencia coincida exactamente con la del entrenamiento.

## Capacidades
- Generacion de acciones de robot para manipulacion en simulacion, condicionada por estado y observaciones, en las tres tareas entrenadas.
- Modelado de mundo y accion: el nombre y las etiquetas (`world-model`) indican prediccion conjunta de dinamica y accion, aunque la model card no detalla las salidas exactas.
- Recuperacion ante estados fuera de distribucion: al entrenarse con clips que arrancan desde estados dejados por el estudiante, incorpora comportamiento de correccion.
- Control de robot en bucle cerrado mediante chunks de accion de 64 pasos nativos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento.
- No se documentan capacidades multilingues; el modelo no esta orientado a texto libre.

## Casos de uso
- Evaluacion de recetas de DAgger en RoboDojo: sirve como punto de comparacion frente a la variante de 48 episodios por tarea y frente al modelo base, para medir el efecto del numero de episodios y del post-entrenamiento sobre el exito en las tres tareas.
- Insercion de tubos en simulacion: el modelo puede ejecutar la politica de `insert_tubes`, tarea de alta precision, y evaluarse en los layouts 0-2 y 20-43 del conjunto de evaluacion de RoboDojo.
- Vertido de bolas en un jarrón: adecuado para estudiar el control fino y la recuperacion tras perturbaciones, dado que el 33% de los pasos del dataset provienen del estudiante.
- Investigacion sobre aprendizaje por imitacion con profesores privilegiados: permite analizar como se transfiere el comportamiento de un agente LLM code-as-policy (PyRUA-Lean) a una politica neuronal.
- Reproduccion de experimentos de world-action models: el repositorio incluye `config.yaml` y estadisticas de normalizacion identicas al base, lo que facilita comparaciones controladas.
- Base para nuevos post-entrenamientos: al ser un reemplazo directo del modelo base, puede usarse como punto de partida para fine-tuning adicional en otras tareas o con otros profesores.
- Analisis de robustez en entornos simulados: util para estudiar fallos de politica en episodios no exitosos, ya que el dataset incluye todos los episodios, exitosos o no.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en evaluacion, comparaciones con el modelo base ni metricas de las tareas mas alla de los recuentos de datos de entrenamiento.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El repo pesa 24,8 GB y el backbone de video declarado es Wan2.2-TI2V-5B, pero no se publican requisitos de memoria.
- GPU de entrenamiento documentadas: 4x NVIDIA H200 con bf16 y ZeRO stage 2.
- GPU recomendadas para inferencia: no disponibles de forma explicita; por el tamano del repo y el backbone de video, se requiere una GPU de datacenter con memoria amplia (tipo H100/H200 o A100 de 80 GB), aunque esto no esta confirmado en la informacion.
- Compatibilidad con GPU de consumo: no disponible; no se documenta cuantizacion ni versiones GGUF.
- Opciones de despliegue: libreria `openwam` mediante `openwam.deploy.model_loader.load_from_checkpoint_dir`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (72 ep/tarea, paso 5000) | no disponible | no disponible | DAgger ingenuo con profesor PyRUA-Lean, 588 clips, 78.868 fotogramas | Apache 2.0 | Hugging Face, 0 descargas |
| seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-48ep-lr1e4-step5000 | no disponible | no disponible | Misma receta con 48 episodios por tarea | Apache 2.0 | Hugging Face |
| OpenWAM/OpenWAM-Alpha-Sim-RoboDojo (base) | no disponible | no disponible | Corpus RoboDojo, 60.000 pasos | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.
- Entrenado exclusivamente en tres tareas de simulacion RoboDojo (`play_tic_tac_toe`, `pour_balls_into_vase`, `insert_tubes`); no se espera generalizacion a otras tareas sin fine-tuning.
- El dataset incluye episodios fallidos (solo 28, 27 y 25 exitosos de 72 por tarea), lo que puede introducir comportamientos suboptimos en los pesos.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad; al ser un modelo de robotica, el riesgo se traslada a la politica de control y no a la generacion de texto.
- No se declaran idiomas soportados ni capacidades de texto general.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el backbone Wan2.2-TI2V-5B pueden tener sus propias condiciones que deben verificarse por separado.
- Las rutas de `config.yaml` son marcadores de posicion (`/path/to/...`); es necesario configurar manualmente el backbone de video.
- El directorio debe contener un unico `checkpoint_step_*.safetensors`, ya que el cargador selecciona el de mayor paso.
- No se publican requisitos de hardware, latencias ni metricas de exito, lo que dificulta planificar un despliegue.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-72ep-lr1e4-step5000
- Modelo base: https://huggingface.co/OpenWAM/OpenWAM-Alpha-Sim-RoboDojo
- Dataset de entrenamiento: https://huggingface.co/datasets/seungkukim/robodojo-naive-dagger-teacher-openwam-hdf5-ttt-pour-insert-72ep
- Variante de 48 episodios por tarea: https://huggingface.co/seungkukim/openwam-alpha-robodojo-naive-dagger-teacher-ttt-pour-insert-48ep-lr1e4-step5000
- Paper OpenWAM: arXiv:2609.07398 (https://arxiv.org/abs/2609.07398)
