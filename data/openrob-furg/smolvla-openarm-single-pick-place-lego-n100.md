# openrob-furg/smolvla-openarm-single-pick-place-lego-n100

## Resumen

SmolVLA fine tuned on OpenArm Lego pick and place (n100) es una política de vision-lenguaje-acción (VLA) para robótica, publicada por el proyecto OPENROB de la FURG (Universidade Federal do Rio Grande). Se trata de un ajuste fino de `lerobot/smolvla_base` sobre 100 demostraciones teleoperadas de una tarea concreta de pick-and-place con un brazo OpenArm: coger un ladrillo de Lego blanco y dejarlo dentro de un contenedor en posición fija. La instrucción en lenguaje natural asociada es `put the lego brick in the box`.

El modelo tiene 450.046.176 parámetros totales (aproximadamente 450M), de los cuales solo 99,9M se entrenaron durante el ajuste fino: el experto de acción y sus capas de proyección. El backbone de vision-lenguaje permanece congelado, lo que reduce coste de entrenamiento y riesgo de olvido catastrófico. El entrenamiento completo se realizó en una única NVIDIA RTX 4070 Ti de 12 GB en unas 3 horas, lo que lo sitúa en la gama de políticas robóticas reproducibles en hardware de consumo.

Su relevancia es metodológica: forma parte de un estudio de escalado de datos junto a las variantes n50 y n200, lo que permite analizar cómo varía el rendimiento de una política VLA en función del número de episodios de demostración. Está pensado para el ecosistema LeRobot 0.6.1 y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en `lerobot/smolvla_base`; backbone de vision-lenguaje congelado mas experto de accion entrenable con capas de proyeccion |
| Parametros totales | 450.046.176 (aproximadamente 450M) |
| Parametros activos | No aplica (modelo denso, no MoE). Parametros entrenados en el ajuste fino: 99,9M |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible. La instruccion de entrenamiento esta en ingles: `put the lego brick in the box` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA de SmolVLA: un backbone de vision-lenguaje que procesa las imagenes de camara y la instruccion textual, y un experto de accion que produce los comandos motores. En este ajuste fino el backbone queda congelado y solo se actualizan el experto de accion y sus capas de proyeccion, es decir, 99,9M de los 450M de parametros totales. La salida son chunks de 50 objetivos absolutos de posicion articular de 8 valores cada uno, lo que da una ventana de prediccion de 50 pasos.

Las entradas son dos flujos RGB (una Intel RealSense D435i montada en el pecho y una Intel RealSense D405 en la muneca derecha) y un vector de estado de 8 valores (articulaciones 1 a 7 del brazo derecho mas la pinza). El preprocesador guardado mapea los nombres de camara a las ranuras de imagen de SmolVLA, por lo que la política espera exactamente las claves `observation.images.cam_chest`, `observation.images.right_cam_wrist` y `observation.state`.

El entrenamiento usó episodios 0 a 99 del dataset `openrob-furg/openarm-single-pick-place-lego` (24.937 fotogramas a 30 fps) durante 20.000 pasos con batch size 32, optimizador AdamW, learning rate pico de 1e-4 con decaimiento coseno hasta 2,5e-6 y 666 pasos de warmup, con semilla 1000. Se ejecutó en 1x NVIDIA RTX 4070 Ti (12 GB) durante aproximadamente 3 horas usando LeRobot 0.6.1. No se documentan fases de RLHF ni DPO; es un ajuste fino por imitación supervisada sobre demostraciones teleoperadas.

## Capacidades

- Generacion de acciones motoras: produce chunks de 50 objetivos de posicion articular absoluta para un brazo de 7 grados de libertad mas pinza.
- Manipulacion pick-and-place: coger un ladrillo de Lego blanco de la mesa y depositarlo en un contenedor en posicion fija.
- Percepcion visual multimodal: consume simultaneamente una vista cenital/de pecho y una vista de muneca para localizar y agarrar el objeto.
- Robustez a variacion de posicion y orientacion del objeto: el ladrillo cambia de posicion y orientacion entre episodios dentro del dataset de entrenamiento.
- Condicionamiento por instruccion en lenguaje natural: acepta la consigna `put the lego brick in the box`.
- Integracion con el ecosistema LeRobot: carga directa mediante `SmolVLAPolicy.from_pretrained`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explicito, ni capacidades de audio o de dialogo general. Tampoco se documentan capacidades multilingues.

## Casos de uso

- Automatizacion de pick-and-place en linea de montaje: la política puede controlar un brazo OpenArm para colocar piezas en contenedores de posicion fija, reduciendo la necesidad de programar trayectorias a mano mediante demostraciones teleoperadas.
- Estudio de escalado de datos en robotica: junto con las variantes n50 y n200, permite medir empiricamente el retorno marginal de anadir episodios de demostracion a una política VLA.
- Base para ajuste fino en tareas de recogida similares: al ser un modelo derivado de `smolvla_base` con licencia Apache 2.0, sirve como punto de partida para reentrenar el experto de accion sobre otras tareas de manipulacion.
- Banco de pruebas de inferencia en hardware de consumo: con 450M de parametros y un entrenamiento que cupo en una RTX 4070 Ti de 12 GB, es util para validar pipelines de despliegue de VLA en equipos asequibles.
- Alimentacion de brazos de bajo coste en laboratorio o docencia: la tarea esta acotada y bien definida, lo que facilita reproducir experimentos de robotica de manipulacion en entornos academicos.
- Evaluacion de politicas condicionadas por lenguaje: el modelo permite estudiar hasta que punto una instruccion textual corta condiciona la ejecucion de una politica de imitacion.
- Generacion de datos sinteticos o aumentados a partir de rollouts: los chunks de 50 acciones absolutas son utiles para registrar trayectorias ejecutables que luego pueden filtrarse y reutilizarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, metricas de evaluacion en simulacion ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0,9 GB, por lo que los pesos en precision de 16 bits rondan los 0,9 GB. Con activaciones, dos flujos de imagen y buffers de accion, una estimacion razonable es de 2 a 4 GB de VRAM en inferencia.
- Entrenamiento original: 1x NVIDIA RTX 4070 Ti de 12 GB, aproximadamente 3 horas para 20.000 pasos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es, en principio, suficiente para inferencia; la RTX 4070 Ti de 12 GB se ha validado para entrenamiento. No se documentan pruebas en A100 o H100.
- GPU de consumo: si, cabe en GPUs de consumo. El propio entrenamiento se realizo en una RTX 4070 Ti de 12 GB, por lo que modelos de 8-12 GB de VRAM son el objetivo natural.
- Opciones de despliegue: LeRobot 0.6.1 mediante `from lerobot.policies.smolvla.modeling_smolvla import SmolVLAPolicy`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para una política de accion.
- Latencia y throughput: no disponibles en la informacion proporcionada. Debe tenerse en cuenta que la tarea se grabo y entreno a 30 fps, lo que marca una referencia de frecuencia de control, pero no se aportan mediciones de latencia de inferencia.

## Comparativa con modelos similares

Solo se dispone de datos comparativos internos del mismo estudio de escalado (misma tarea, mismo pipeline, distinto numero de episodios). No se han encontrado en la informacion disponible comparaciones con politicas de terceros.

| Modelo | Episodios de entrenamiento | Datos | Licencia | Disponibilidad |
|---|---|---|---|---|
| openrob-furg/smolvla-openarm-single-pick-place-lego-n50 | 50 | no disponible | Apache 2.0 | HuggingFace |
| openrob-furg/smolvla-openarm-single-pick-place-lego-n100 | 100 (24.937 fotogramas) | dataset openrob-furg/openarm-single-pick-place-lego | Apache 2.0 | HuggingFace |
| openrob-furg/smolvla-openarm-single-pick-place-lego-n200 | 200 | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- Tarea extremadamente acotada: el modelo esta entrenado para un unico pick-and-place de un ladrillo de Lego blanco sobre un contenedor en posicion fija. Fuera de esa distribucion no hay garantia de comportamiento correcto.
- Sin datos de evaluacion: no se publican tasas de exito ni curvas de rendimiento, por lo que no es posible cuantificar su fiabilidad antes de desplegarlo.
- Dependencia fuerte del hardware de captura: el preprocesador espera exactamente los nombres de camara y la configuracion de dos vistas (RealSense D435i en el pecho y D405 en la muneca). Cambiar camaras, montaje o calibracion puede degradar el rendimiento.
- Dependencia de version: el autor recomienda usar LeRobot 0.6.1 para inferencia y advierte de posibles desajustes de configuracion con otras versiones.
- Riesgo de sobreajuste a la posicion del contenedor: al estar el destino fijo, pequenos desplazamientos del contenedor o de la mesa pueden provocar fallos.
- Riesgo de alucinacion motora: como política de imitacion, puede generar trayectorias plausibles pero incorrectas ante entradas fuera de distribucion, sin senal de incertidumbre explicita.
- Idiomas no documentados: la instruccion de entrenamiento esta en ingles; no hay evidencia de generalizacion a instrucciones en castellano u otros idiomas.
- Sesgos: no se documentan analisis de sesgo. Los datos provienen de demostraciones teleoperadas de un unico operador o de un conjunto reducido, lo que puede introducir sesgos de estilo de manipulacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no se aportan garantias de idoneidad para produccion ni soporte del autor.
- Metricas del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica nula validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openrob-furg/smolvla-openarm-single-pick-place-lego-n100
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/openrob-furg/openarm-single-pick-place-lego
- Variante n50: https://huggingface.co/openrob-furg/smolvla-openarm-single-pick-place-lego-n50
- Variante n200: https://huggingface.co/openrob-furg/smolvla-openarm-single-pick-place-lego-n200
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados eran contenido no relacionado y no se incluyen.
