# aagha314/bird-ur-short-memory

## Resumen

BIRD (d2560 main method) on `ur_short_memory`, seed 0, es un conjunto de checkpoints de una politica visuomotora entrenada para controlar un brazo robotico UR con pinza en una tarea de memoria corta. Lo publica el usuario aagha314 en Hugging Face como artefacto de investigacion asociado al repositorio REAL_WORLD_DIFFPO_MEMORY (rama `bird_main`, commit `97afc73`), no como un modelo de lenguaje ni como un modelo de proposito general.

El modelo resuelve el problema de generar acciones de control continuas a partir de una imagen de muneca de 96x96 pixeles y un estado propioceptivo de 11 dimensiones. La salida son acciones de 10 dimensiones: posicion (3), rotacion en representacion 6D (6) y anchura de pinza (1). El entrenamiento se realizo durante 100.000 pasos de gradiente sobre 27 demostraciones y 10.000 fotogramas capturados con una camara de muneca de 320x240 recortada y reescalada a 96x96.

Su relevancia es acotada y experimental: se trata de un artefacto reproducible a medias (depende de un cambio no confirmado en `trainer.py`) que permite replicar el metodo BIRD en robot real mediante `eval/eval_bird_main.py`, ademas de servir como punto de partida para comparaciones de politicas de difusion con memoria en manipulacion robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica visuomotora del metodo BIRD ("d2560 main method"), sobre el repositorio REAL_WORLD_DIFFPO_MEMORY (familia diffusion policy con memoria); no se especifica el backbone exacto ni el numero de capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: consume una imagen y un estado por paso de control) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints PyTorch sin cuantizar |
| Idiomas soportados | no aplicable; no procesa ni genera lenguaje |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), 21 checkpoints: `agent_0100000.pt` (paso 100k) y `agent_0005000.pt` a `agent_0095000.pt` cada 5.000 pasos |
| Dimension declarada | d2560 |
| Tamano del repositorio | 27,4 GB (incluye pesos y datos de entrenamiento en formato zarr) |
| Entrada | Imagen de muneca `camera_2` 96x96x3 uint8 + estado de 11 dimensiones: `eef_pos` (3) + `rotation_6d` (6) + `gripper_qpos` (2) |
| Salida | Accion de 10 dimensiones: posicion (3) + `rotation_6d` (6) + anchura de pinza (1); `action[t] = state[t+1]` en los datos |
| Datos de entrenamiento | 27 demostraciones, 10.000 fotogramas, `ur_short_memory_crop.baseline.27.rotation_6d.zarr` |
| Pasos de gradiente | 100.000, sin entornos de evaluacion (`env.eval_episode_num=0`) |
| Semilla | 0 |
| Autor | aagha314 |
| Fecha de creacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el metodo como "BIRD (d2560 main method)", entrenado con el script `train_bird_main.sh ur_short_memory 0` sobre la rama `bird_main` del repositorio REAL_WORLD_DIFFPO_MEMORY, en el commit `97afc73`. No se detalla la topologia interna (numero de capas, tipo de encoder visual, mecanismo de memoria, si hay difusion explicita o prediccion directa), por lo que la descripcion arquitectonica se limita a lo declarado: una politica que consume imagen y estado y emite acciones de 10 dimensiones, con una dimension de modelo de 2560.

El entrenamiento uso 27 demostraciones (10.000 fotogramas) de la tarea, con la camara de muneca original de 320x240 recortada al centro y reescalada a 96x96 mediante `get_image_transform`. El zarr original ya venia convertido (rotaciones en cuaternion, acciones en rotacion 6D, fotogramas JPEG2000) y se transformo con un script puntual al formato que lee `real_data.py`, cuyo layout exige `data/state`, `data/action` y `data/img`. No se menciona uso de RLHF, DPO ni etapas de ajuste posteriores; tampoco se realizo evaluacion en entornos simulados durante el entrenamiento.

Como incidencia tecnica relevante, el entrenamiento requirio un parche no confirmado en `algorithms/bird_main/trainer.py`: con `eval_episode_num=0` el trainer original solo escribia `best_agent.pt` cuando mejoraba una evaluacion, de modo que nunca habria guardado nada. El parche escribe `agent.pt` y `agent_<step>.pt` cada `eval_every` (5.000) pasos y al final, con el mismo formato de payload, de forma que `eval_bird_main.py` los carga sin cambios. Esto implica que la reproduccion exacta del run no es posible solo con el commit publico.

## Capacidades

- Generacion de acciones de control continuas de 10 dimensiones (posicion, rotacion 6D y anchura de pinza) a partir de imagen y estado.
- Control visuomotor de un brazo UR con pinza en la tarea concreta `ur_short_memory`.
- Procesamiento de imagen de muneca de baja resolucion (96x96x3, uint8) junto con estado propioceptivo de 11 dimensiones.
- Uso de memoria segun el metodo BIRD y el nombre de la tarea (`short_memory`); la model card no detalla el mecanismo ni su horizonte.
- Replay offline de demostraciones mediante `Bird.act()`, con el mismo bucle de llamada que usa el robot.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso simbolico ni planificacion basada en lenguaje.
- No dispone de capacidades multilingues, de vision general (clasificacion, VQA, OCR) ni de audio.
- No dispone de modo de razonamiento explicito (thinking mode).

## Casos de uso

- Manipulacion robotica en laboratorio con un UR y pinza: el modelo recibe la imagen de muneca y el estado del efector y devuelve la accion del siguiente paso, integrable en el bucle de control mediante `eval/eval_bird_main.py`.
- Investigacion en politicas de difusion con memoria: sirve como punto de comparacion reproducible (seed 0, 100k pasos) frente a variantes sin memoria o con otro tratamiento del estado.
- Analisis de sobreajuste en pocos datos: al incluir checkpoints cada 5.000 pasos hasta 100k, permite estudiar la curva de ajuste a las demostraciones y elegir un checkpoint anterior si el final esta sobreajustado.
- Reentrenamiento con nuevas demostraciones: el zarr de entrenamiento y el `config.yaml` resuelto se incluyen en el repositorio, lo que facilita ajustar la politica a una tarea nueva del mismo robot con el mismo layout de datos.
- Validacion de pipelines de normalizacion de acciones: las acciones se normalizan min-max a [-1, 1] por dimension y el estado llega sin normalizar, un caso util para probar estrategias de escalado antes de desplegar en robot.
- Estudio offline de imitacion: la model card reporta el error de posicion, rotacion y estado de pinza al replicar las 27 demostraciones, lo que permite usar el modelo como referencia en experimentos de imitacion open-loop.
- Integracion como baseline en publicaciones sobre diffusion policy: al ser un artefacto publico con configuracion y datos, puede citarse y reproducirse parcialmente en comparativas.

## Benchmarks y rendimiento

La model card solo publica una comprobacion offline sobre las demostraciones de entrenamiento (open-loop), con el checkpoint de 35.000 pasos. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, porque no es un modelo de lenguaje.

| Metrica (replay open-loop, checkpoint 35k) | Valor |
|---|---|
| Error de posicion (media) | 3,6 mm |
| Error de posicion (p95) | 7,7 mm |
| Error de rotacion | 0,30 grados |
| Coincidencia de estado de pinza (abierto/cerrado) | 99,6 % |
| Baseline: mantener la pose actual | 27,8 mm |
| Baseline: extrapolacion a velocidad constante | 13,1 mm |

Estas cifras miden ajuste sobre los propios episodios de entrenamiento, no generalizacion. El rendimiento en bucle cerrado solo se ha medido en el robot y no se reporta en la informacion disponible. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se declara el numero de parametros ni la topologia, por lo que no puede calcularse una cifra fiable; el repositorio completo ocupa 27,4 GB, pero incluye pesos y datos de entrenamiento sin desglose por fichero.
- GPU recomendadas: no disponible en la informacion proporcionada. Dado que la entrada es una imagen de 96x96 y una dimension de modelo de 2560, es previsible que la inferencia quepa en GPU de consumo, pero se trata de una estimacion no verificada con datos publicados.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de consumo de memoria ni de latencia.
- Opciones de despliegue: inferencia en PyTorch mediante `eval/eval_bird_main.py -i checkpoints/agent_0100000.pt -t ur_short_memory`, con `config.yaml` en el mismo directorio que el checkpoint. Los servidores de inferencia para modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables.
- Rutas: `config.yaml` apunta `env.real_dataset` y `env.real_zarr` a `ur_short_memory.bird_main.camera_2.96x96.zarr` de forma relativa al directorio de lanzamiento; hay que lanzar desde ese directorio o editar ambas claves con la ruta absoluta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros modelos en la informacion proporcionada. La categoria comparable es la de politicas visuomotoras open source entrenadas por imitacion (por ejemplo, Diffusion Policy y ACT como referencias habituales de imitacion con imagenes, o propuestas mas recientes con modelos fundacionales de robot). No se han facilitado especificaciones, licencias ni resultados de esos modelos, por lo que no se puede construir una comparacion con cifras verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BIRD d2560 en `ur_short_memory` (este modelo) | no disponible | no aplicable | 3,6 mm de error de posicion en replay de entrenamiento (35k) | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy (categoria comparable) | no disponible en la informacion proporcionada | no aplicable | no disponible | no disponible | no disponible |
| ACT (categoria comparable) | no disponible en la informacion proporcionada | no aplicable | no disponible | no disponible | no disponible |
| Modelos fundacionales de robot (categoria comparable) | no disponible en la informacion proporcionada | no aplicable | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay episodios reservados: las 27 demostraciones se usaron integramente para entrenamiento, por lo que las cifras offline miden ajuste y no generalizacion.
- Riesgo de sobreajuste alto dado el volumen de datos (10.000 fotogramas de 27 episodios); la propia model card sugiere que el checkpoint final puede estar sobreajustado y ofrece los intermedios.
- El estado `agent_pos` (11 dimensiones) llega a la politica sin normalizar, porque `real_data.real_spaces` declara sus limites como +-inf; esto puede afectar a la estabilidad y a la trasferibilidad.
- Las acciones se normalizan min-max a [-1, 1] por dimension, de modo que la escala depende del dataset: reutilizar el modelo con otros datos exige recalcular o reutilizar las estadisticas del zarr incluido.
- El modelo esta entrenado para una unica tarea y un unico montaje (camara de muneca, UR, pinza); no es un modelo generalista.
- El rendimiento en bucle cerrado solo se ha medido en el robot y no se publica en la informacion disponible.
- La licencia no esta declarada: el uso comercial no puede asumirse y requiere contactar con el autor.
- La reproducibilidad es parcial: el run depende de un cambio no confirmado en `algorithms/bird_main/trainer.py` y del commit `97afc73` del repositorio REAL_WORLD_DIFFPO_MEMORY.
- Artefacto con 0 descargas y 0 likes, sin validacion por parte de la comunidad.
- No debe tratarse como un modelo de lenguaje: no procesa texto, no soporta prompts, tool calling ni razonamiento simbolico.
- El repositorio ocupa 27,4 GB, principalmente por los datos zarr y los 21 checkpoints; conviene planificar el almacenamiento antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aagha314/bird-ur-short-memory
- Repositorio de codigo referenciado: REAL_WORLD_DIFFPO_MEMORY, rama `bird_main`, commit `97afc73` (no se proporciona URL en la informacion disponible)
- Script de evaluacion en robot: `eval/eval_bird_main.py` (incluido en el propio repositorio del modelo y en el repositorio de codigo)
- Paper, blog o demo: no disponible
