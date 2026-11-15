# changh95/diffusion-planner-p150

## Resumen

Diffusion Planner P150 es un paquete de despliegue del modelo Diffusion Planner v5.0 de TIER IV, publicado por el usuario changh95 para ejecutarse sobre aceleradores Tenstorrent p150. No se trata de un modelo de lenguaje, sino de una red de planificación de trayectorias para conducción autónoma: recibe el estado de una escena de tráfico (ego, vecinos, carriles, ruta, obstáculos) y devuelve una trayectoria de 8 segundos para el vehículo propio, predicciones de movimiento de los vecinos y un comando de intermitente. Los pesos son los originales de `AutowareFoundation/diffusion_planner` (etiqueta `v5.0`), sin modificar; lo que aporta este repositorio es el empaquetado, el servidor HTTP y la compilación de kernels para el hardware de Tenstorrent.

La arquitectura es un diffusion transformer de 14,55 millones de parámetros: seis codificadores de entidades basados en MLP-Mixer, un codificador de fusión transformer de 6 bloques sobre 564 tokens de escena y un decodificador DiT de 3 bloques con adaLN que se evalúa 11 veces mediante un bucle DPM-Solver++(2M) de 10 pasos. La inferencia completa, incluyendo pre y postprocesado del nodo de Autoware, se ejecuta en el dispositivo.

Su relevancia es doble: por un lado, expone un planner de conducción autónoma entrenado por TIER IV como servicio HTTP reproducible; por otro, demuestra el despliegue de un modelo de robótica sobre silicio no GPU (Tenstorrent p150). Está pensado para investigación, prototipado y evaluación offline de escenas grabadas o simuladas, no para uso directo en vehículo sin la integración ROS/Lanelet2 correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con codificadores MLP-Mixer y fusion transformer; planificador de trayectorias |
| Parametros totales | 14,55 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; 564 tokens de escena por instante de planificacion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en la informacion proporcionada (los pesos se descargan del repo base `AutowareFoundation/diffusion_planner` en el commit `423efde67f5414734da43a7ad856c17ceb8b51aa`) |

## Arquitectura y entrenamiento

El modelo es un planificador generativo basado en difusion. La entrada son 15 tensores que describen un instante de planificacion en el marco del ego (`base_link`): trayectorias muestreadas, historial del ego, estado actual del ego, historial de hasta 320 agentes vecinos, objetos estaticos, carriles con limites de velocidad, carriles de ruta, poligonos, line strings, pose objetivo, forma del ego, historial de intermitentes y retardo. Estos tensores pasan por seis codificadores de entidades tipo MLP-Mixer y un codificador de fusion transformer de 6 bloques que opera sobre 564 tokens de escena.

El decodificador es un DiT de 3 bloques con normalizacion adaptativa por capa (adaLN): atencion propia sobre el ego y 320 agentes y atencion cruzada hacia la escena. Se ejecuta 11 veces dentro de un bucle DPM-Solver++(2M) de 10 pasos para producir la trayectoria final. Una cabeza adicional emite el comando de intermitente. La salida es una trayectoria de 8 s a 10 Hz (80 poses con velocidad y aceleracion), una ruta predicha de 8 s para cada vecino valido y el comando de intermitente, todo con el pre y postprocesado del nodo `autoware_diffusion_planner` (normalizacion de entrada, ordenacion de agentes, suavizado de velocidad, parada forzada y decision de intermitente).

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se recogen en la informacion disponible; la model card remite a la ficha del modelo base y al articulo arXiv:2501.15564 de Zheng et al. Este paquete no modifica los pesos: solo reempaqueta y compila kernels para Tenstorrent p150 mediante `tt-model-manager` 0.1.0 (esquema de manifiesto 5.1).

## Capacidades

- Planificacion de trayectoria del ego: genera 80 poses a 10 Hz (8 s) con posicion, orientacion (yaw, cos, sin), velocidad y aceleracion.
- Prediccion de movimiento de vecinos: ruta de 8 s para cada agente valido de los hasta 320 presentes en la escena.
- Decision de intermitente: cabeza dedicada que emite comando (por ejemplo `DISABLE`) con logits y probabilidades por clase.
- Pre y postprocesado integrados: normalizacion de entrada, ordenacion de agentes, suavizado de velocidad (ventana configurable, por defecto 8), umbral de parada (0,3 m/s) y desplazamiento de retencion del intermitente (-1,25).
- Servicio HTTP propio: `POST /predict` para un instante de planificacion, `GET /health` e `GET /info` (lista los 15 tensores y sus formas); `GET /v1/models` es un stub, no una API de chat compatible con OpenAI.
- Formatos de entrada y salida: entrada en `.npz` codificado en base64 o JSON con listas anidadas; salida en JSON o `.npz` (anade las poses como npz base64 sin perdida).
- Parametros por peticion: `velocity_smoothing_window`, `stopping_threshold`, `turn_indicator_keep_offset` y `return_denoising_steps`.
- No soporta tool calling, agentes multi-paso, vision, audio ni capacidades multilingues: es un modelo de robótica, no un LLM.

## Casos de uso

- Evaluacion offline de escenas grabadas: se construyen los 15 tensores a partir de bolsas ROS y el mapa Lanelet2, se envian a `/predict` y se compara la trayectoria generada con la conduccion humana para medir error de posicion y suavidad.
- Prototipado de planificadores en simulacion: integracion en bucles de simulacion cerrada donde el planner recibe el estado del entorno simulado y devuelve la trayectoria de 8 s para el controlador.
- Prediccion de intenciones de vecinos: la salida de rutas predichas por agente permite alimentar modulos de evaluacion de riesgo o de seleccion de maniobra en stacks de planificacion.
- Validacion de integracion Autoware: al replicar el pre y postprocesado del nodo `autoware_diffusion_planner`, sirve para verificar que la cadena de mensajes ROS y la codificacion de tensores son correctas antes de desplegar en vehiculo.
- Benchmarking de hardware alternativo: permite medir latencia y comportamiento de un planner de difusion sobre Tenstorrent p150 frente a implementaciones en GPU, con la misma semantica de entrada y salida.
- Investigacion en planificacion generativa: el servicio HTTP facilita experimentos con distintos parametros de suavizado, umbral de parada o pasos de denoising sin recompilar el modelo.
- Generacion de datasets sinteticos de trayectorias: ejecutando el planner sobre escenas simuladas se obtienen planes etiquetados para entrenar o evaluar otros modulos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: acelerador Tenstorrent p150 (malla `P150`). No se documenta soporte para GPU convencionales en este paquete.
- VRAM estimada: no disponible; el modelo se ejecuta sobre memoria del dispositivo Tenstorrent, no sobre VRAM de GPU.
- GPU recomendadas: no aplica para este paquete; la referencia es el acelerador p150.
- Cabe en GPU consumer: no disponible para este empaquetado; el modelo base de 14,55 M de parametros es de tamano reducido, pero el despliegue documentado exige p150.
- Despliegue: `tt serve changh95/diffusion-planner-p150` (CLI de Tenstorrent, `uv tool install tenstorrent`) o `tt-model serve changh95/diffusion-planner-p150`. Requiere Docker. El servidor escucha en el puerto 20000 o el siguiente libre. La primera ejecucion compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Los pesos no van en la imagen Docker: se descargan del repositorio base en el commit `423efde67f5414734da43a7ad856c17ceb8b51aa` a la cache de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada/salida | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-planner-p150 (este) | 14,55 M | 15 tensores de escena / trayectoria 8 s, predicciones de vecinos, intermitente | Tenstorrent p150 | Apache 2.0 | Hugging Face, via tt-cli |
| AutowareFoundation/diffusion_planner (base) | 14,55 M | Misma semantica | No especificado en la informacion disponible | Apache 2.0 | Hugging Face |
| Otros planificadores de Autoware | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una API de chat: `GET /v1/models` es un stub y el contrato de `/predict` es propio del modelo.
- El llamador debe construir los 15 tensores desde sus mensajes ROS y su mapa Lanelet2; el paquete no incluye esa integracion.
- Uso previsto limitado a investigacion, prototipado y evaluacion offline; no se documenta validacion para conduccion real.
- Dependencia de hardware especifico (Tenstorrent p150) y de Docker; no hay ruta de despliegue documentada para GPU.
- La primera ejecucion requiere compilacion de kernels de varios minutos, lo que afecta a despliegues automatizados y arranques en frio.
- Riesgo de alucinacion en el sentido de planes fisicamente inviables o incoherentes con la escena si la entrada esta mal normalizada u ordenada; el propio nodo aplica suavizado, parada forzada y decision de intermitente para mitigar comportamientos abruptos.
- Sesgos: no documentados en la informacion disponible; al derivar de un dataset de entrenamiento concreto (no detallado aqui), el comportamiento puede degradarse en escenas fuera de distribucion.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre seguridad funcional en vehiculo recae en el integrador.
- No se documentan idiomas, cuantizaciones ni formato de pesos en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/changh95/diffusion-planner-p150
- Modelo base: https://huggingface.co/AutowareFoundation/diffusion_planner
- Articulo: https://arxiv.org/abs/2501.15564
- Nodo de Autoware: https://github.com/autowarefoundation/autoware_universe/tree/9ceaccf026c31ffc5319bc9eeb4bd7bede0af3fd/planning/autoware_diffusion_planner
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Prerequisitos de tt-cli: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
