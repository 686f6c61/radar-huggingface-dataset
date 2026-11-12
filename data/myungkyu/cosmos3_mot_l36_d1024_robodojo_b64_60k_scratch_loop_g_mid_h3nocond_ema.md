# Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3nocond_ema

## Resumen

Cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3nocond_ema es un modelo de mundo (world model) de video orientado a robotica, desarrollado por el usuario Myungkyu y publicado bajo el framework Cosmos. Se trata de un fine-tuning de Cosmos3-Nano al que se le ha acoplado un DiT de acciones externo, con condicionamiento unidireccional video-a-accion y un calendario de acciones compartido, pensado para control robotico en bucle cerrado. El modelo combina un backbone de generacion de video con un modulo de prediccion de acciones, de modo que la representacion latente del video guia la politica de control.

El identificador del modelo codifica parte de su configuracion: arquitectura Mixture-of-Transformers (mot), 36 capas (l36), dimension oculta de 1024 (d1024), entrenamiento sobre el dataset RoboDojo Sim (robodojo), batch de 64 (b64), 60.000 pasos (60k) desde inicializacion aleatoria (scratch), con atencion en bucle (loop), variante g_mid, sin condicionamiento de horizonte (h3nocond) y pesos EMA. El repositorio ocupa 32 GB y se distribuye como checkpoint de entrenamiento en formato torch.distributed.checkpoint (DCP), sin estado del optimizador.

Su relevancia es acotada pero especifica: cubre el nicho de los world models aplicados a robotica con control en bucle cerrado, un area donde la mayoria de publicaciones no liberan pesos. La ausencia de descargas, likes y documentacion detallada (sin licencia, sin idiomas, sin benchmarks publicados) indica que es un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (mot) sobre Cosmos3-Nano, con DiT de acciones externo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP), bf16, claves `net.*` |

## Arquitectura y entrenamiento

El modelo parte de Cosmos3-Nano, un world model de video, y le incorpora un DiT de acciones externo con condicionamiento unidireccional video-a-accion: el estado latente del video condiciona la generacion de acciones, pero no al reves. Ambos modulos comparten el calendario de acciones (shared action schedule), lo que permite sincronizar la prediccion de acciones con los pasos de generacion de video. El sufijo `mot` del identificador apunta a una arquitectura Mixture-of-Transformers con 36 capas y dimension oculta de 1024, y `loop` sugiere un esquema de atencion recurrente o en bucle entre bloques.

El entrenamiento se realizo desde cero (scratch) durante 60.000 pasos con batch de 64, sobre el dataset RoboDojo Sim en formato LeRobot v3.0. Los pesos publicados son los EMA (media movil exponencial) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; en un modelo de robotica supervisado como este, lo habitual seria entrenamiento por imitacion o prediccion, pero no hay dato confirmado.

## Capacidades

- Generacion de video condicionada: actua como world model de video, prediciendo fotogramas futuros a partir de observaciones.
- Prediccion de acciones roboticas: el DiT de acciones genera comandos de control condicionados por el estado latente del video.
- Control en bucle cerrado: disenado para operar de forma iterativa, recerrando el bucle con observaciones reales del robot.
- Integracion con el servidor de politicas de cosmos-framework: se carga mediante `--checkpoint-path` y `--config-file`.
- Dependencia de VAE externo: requiere el VAE de Wan-AI/Wan2.2-TI2V-5B (`Wan2.2_VAE.pth`) para codificar y decodificar video.
- Soporte de tool calling, agentes, razonamiento textual, codigo, matematicas, vision general o audio: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Manipulacion robotica simulada en bucle cerrado: el modelo se usa como politica de control dentro de RoboDojo Sim, prediciendo acciones a partir de observaciones de video y recerrando el bucle en cada paso para corregir desviaciones.
- Investigacion en world models para robotica: sirve como base para estudiar como el condicionamiento video-a-accion afecta a la calidad del control, al comparar variantes del mismo entrenamiento (por ejemplo, con y sin condicionamiento de horizonte).
- Generacion de datos sinteticos de video para entrenamiento: el backbone de video puede producir trayectorias sinteticas que alimenten otros entrenamientos de politicas, reduciendo la necesidad de demostraciones reales.
- Evaluacion de politicas en simulacion: el modelo puede actuar como entorno aprendido o como referencia de comportamiento para medir politicas candidatas antes de desplegarlas en hardware.
- Prototipado de pipelines de robotica con LeRobot: al entrenarse sobre datos en formato LeRobot v3.0, encaja en flujos de trabajo existentes de ese ecosistema para tareas de imitacion.
- Reproduccion de experimentos de investigacion: al publicarse el checkpoint EMA y el `config.yaml` con el esquema de entrenamiento, permite reproducir o extender el experimento con los mismos hiperparametros.
- Fine-tuning posterior sobre dominios propios: el checkpoint puede servir de inicializacion para adaptar el control a nuevos robots o tareas, aunque sin licencia clara el uso comercial queda en duda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 32 GB en bf16, lo que da una cota inferior aproximada para cargar los pesos, pero no se especifica el desglose entre backbone de video y DiT de acciones.
- GPU recomendadas: no disponible. Por el tamano del checkpoint, se requiere al menos una GPU con 40-80 GB de memoria (A100 80 GB, H100) para cargar en bf16 sin cuantizar; no hay dato confirmado.
- Cabe en GPU de consumo: no disponible. Un checkpoint de 32 GB en bf16 no cabe en GPUs de 24 GB (RTX 4090) sin cuantizacion, y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: servidor de politicas de cosmos-framework (`--checkpoint-path` y `--config-file`), con dependencia del VAE de Wan2.2-TI2V-5B. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3_mot_l36_d1024_robodojo (este) | no disponible | no disponible | World model de video + DiT de acciones para robotica | no disponible | Pesos DCP en HF |
| Cosmos3-Nano (base) | no disponible | no disponible | World model de video | no disponible | Referenciado en la model card |
| Wan2.2-TI2V-5B | 5B (VAE referenciado) | no disponible | Generacion de video texto-imagen-video | no disponible | HF (Wan-AI) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no hay terminos de uso publicados, por lo que el uso comercial no esta autorizado de forma explicita y requiere contactar con el autor.
- Documentacion minima: la model card no detalla parametros totales, contexto, idiomas ni benchmarks, lo que dificulta evaluar el modelo antes de desplegarlo.
- Sin descargas ni validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia externa de que el checkpoint funcione correctamente.
- Dependencia de rutas locales: el `config.yaml` contiene marcadores de posicion (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`) que deben sustituirse por rutas reales, y el VAE de Wan2.2 debe descargarse por separado.
- Formato de checkpoint poco convencional: DCP con claves `net.*` y sin estado del optimizador; no es directamente compatible con cargadores genericos de safetensors o GGUF.
- Entrenado solo en simulacion (RoboDojo Sim): el salto a robot real (sim-to-real) no esta validado en la informacion disponible.
- Riesgo de alucinacion y sesgos: no evaluado; al ser un modelo de video y control, el fallo tipico seria la generacion de trayectorias fisicamente inconsistentes.
- Sin cuantizaciones documentadas ni soporte de despliegue en herramientas estandar, lo que limita su uso fuera del servidor de cosmos-framework.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_loop_g_mid_h3nocond_ema
- VAE requerido (Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web proporcionada.
