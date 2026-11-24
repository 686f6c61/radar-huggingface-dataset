# MattoTT/diffusion_ur5e_pick_place_v3

## Resumen

`MattoTT/diffusion_ur5e_pick_place_v3` es una política visomotora basada en Diffusion Policy, publicada por el usuario MattoTT, que controla un brazo UR5e simulado con pinza Robotiq Hand-E en el simulador MuJoCo para ejecutar una tarea de pick-and-place: coger un cubo de 3 cm y depositarlo sobre un disco verde de 6 cm de radio. A diferencia de un modelo de lenguaje, se trata de un modelo de robótica que mapea observaciones visuales (dos cámaras RGB) y el estado articular a comandos de acción absolutos a 25 Hz.

El modelo se entrenó con la librería LeRobot 0.7.0 a partir de demostraciones generadas por un experto scriptado (cinemática inversa más planificación RRT*), y se distribuye en formato safetensors con 277,9 millones de parámetros (1,1 GB de repositorio). Su relevancia radica en que reproduce de forma abierta y reproducible un pipeline completo de aprendizaje por imitación con Diffusion Policy en simulación, con métricas de éxito publicadas (95 % con semillas fijas, 80 % sin fijar, 88 % agregado en 40 episodios).

Es un artefacto de investigación y docencia: no es un modelo de propósito general ni un modelo de lenguaje, sino un controlador específico de una tarea y un escenario. La model card advierte explícitamente que solo se ha entrenado y evaluado en MuJoCo, que no se ha probado en un robot real y que las cámaras se renderizan sin ruido ni desenfoque, por lo que la transferencia directa a hardware es improbable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: denoiser U-Net 1-D condicional (512/1024/2048) con codificadores visuales ResNet-18 separados por cámara y spatial softmax; scheduler DDPM de 100 pasos con predicción de épsilon |
| Parametros totales | 277.900.227 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 2 pasos y horizonte de acción de 64 pasos (32 ejecutados) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (bf16 durante el entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Diffusion Policy (Chi et al., RSS 2023): un denoiser U-Net 1-D condicional con anchos 512/1024/2048 que genera secuencias de acción mediante difusión DDPM con 100 pasos de ruido y predicción de épsilon. Cada cámara (exterior y de muñeca, imágenes de 3×240×320) tiene su propio codificador ResNet-18 preentrenado en ImageNet con spatial softmax; el estado articular (7 dimensiones: 6 ángulos en radianes más apertura de pinza de 0 a 255) se concatena como condición. La política observa 2 pasos y produce un horizonte de 64 acciones (2,56 s a 25 Hz), de las que ejecuta 32 (1,28 s) antes de replanificar.

El entrenamiento se realizó durante 100.000 pasos en una única NVIDIA B200, con Adam (lr 1e-4, schedule coseno con 500 pasos de warm-up), batch de 128, precisión mixta bf16 y semilla 1000. Los datos provienen de un experto scriptado con cinemática inversa y planificación RRT* sobre el dataset `MattoTT/ur5e_pick_place_v3`; el experto llega deliberadamente algo descentrado sobre el cubo y el objetivo y luego corrige, de modo que la política aprende a recuperarse de pequeños errores de posicionamiento. No se documenta RLHF ni DPO, algo esperable en un modelo de control.

## Capacidades

- Control visomotor de pick-and-place: coger un cubo de 3 cm con posición y orientación (yaw) aleatorias y colocarlo dentro de un disco objetivo de 6 cm de radio.
- Percepción multimodal: dos flujos RGB (cámara exterior fija y cámara en la pinza) más estado propioceptivo de 7 dimensiones.
- Generación de acciones multimodales mediante difusión, con muestreo estocástico del ruido (reproducible si se fija la semilla).
- Control a 25 Hz con replanificación cada 32 pasos (1,28 s) sobre un horizonte de 64 pasos.
- Recuperación de pequeños errores de posicionamiento, aprendida gracias a las demostraciones del experto descentrado.
- Integración con el ecosistema LeRobot (`DiffusionPolicy.from_pretrained`, preprocesadores y postprocesadores).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Docencia y reproducción de Diffusion Policy: el repositorio de GitHub incluye escena MuJoCo, experto, grabación y evaluación; permite ejecutar `eval_policy.py` en modo headless o con visor para estudiar el pipeline completo de aprendizaje por imitación.
- Punto de partida para fine-tuning en nuevas tareas de pick-and-place: al estar en LeRobot, se puede reentrenar con un dataset propio de demostraciones manteniendo el mismo esquema de observaciones y acciones.
- Investigación en robustez de políticas visomotoras: la comparación entre evaluación con semilla fija (95 %) y sin fijar (80 %) sirve como caso de estudio del impacto del ruido de difusión en la estabilidad del control.
- Generación de datos sintéticos y evaluación comparativa de planificadores: el experto scriptado con RRT* y la política aprendida pueden contrastarse en el mismo escenario simulado para medir brechas entre planificación clásica y aprendizaje.
- Prototipado de entornos de simulación a realidad: útil como banco de pruebas para estudiar técnicas de domain randomization antes de intentar transferencia a un UR5e físico, aunque el propio autor advierte que no está probado en hardware.
- Benchmark interno de infraestructura de entrenamiento: las condiciones documentadas (B200, 100.000 pasos, batch 128, bf16) permiten estimar costes y tiempos de entrenamiento de políticas de difusión de ~278 M de parámetros.

## Benchmarks y rendimiento

Evaluación en el mismo escenario simulado, 20 episodios (semillas 1000-1019), con pose del cubo y objetivo aleatorios en cada episodio:

| Ejecucion | Exito | Pasos hasta exito (25 Hz) | Error de colocacion |
|---|---|---|---|
| Semilla fija (reproducible) | 19/20 (95 %) | media 464 (18,5 s) | mediana 0,2 cm, max 1,1 cm |
| Ruido de difusion sin semilla | 16/20 (80 %) | media 463 (18,5 s) | mediana 0,1 cm, max 0,7 cm |
| Agregado | 35/40 (88 %) | no disponible | no disponible |

Un episodio se considera exitoso si el cubo queda dentro del disco objetivo de 6 cm con la pinza abierta durante 0,5 s, en un máximo de 700 pasos (28 s). Los fallos documentados fueron un agarre lento que agotó el tiempo y un bloqueo ocasional sobre el cubo. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 277,9 M de parámetros en bf16 los pesos ocupan aproximadamente 0,56 GB, a lo que hay que sumar las activaciones de los dos ResNet-18 y del U-Net, por lo que se estima un rango de 2-4 GB, aunque esta cifra es una estimación y no un dato publicado.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA B200; para inferencia basta una GPU consumer moderna, aunque no se documenta compatibilidad verificada.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060/4060 en adelante), sin confirmación oficial.
- Opciones de despliegue: LeRobot 0.7.0 con `DiffusionPolicy.from_pretrained` y `make_pre_post_processors`; la evaluación requiere la escena MuJoCo del repositorio de GitHub (`uv sync`, `eval_policy.py`, en macOS `mjpython` para el visor). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: control a 25 Hz con replanificación cada 32 pasos; no se publican latencias por paso de difusión ni throughput medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MattoTT/diffusion_ur5e_pick_place_v3` | 277,9 M | Observación de 2 pasos, horizonte de 64 acciones | 88 % agregado (35/40) en simulación | MIT | Hugging Face, 3 descargas, 0 likes |
| Diffusion Policy original (Chi et al., 2023) | no disponible | no disponible | no disponible en esta ficha | no disponible | Paper y código de referencia |
| Otros modelos LeRobot en el Hub | no disponible | no disponible | no disponible | varía | Hub de Hugging Face |

No se dispone de datos verificados de otros modelos comparables en la información proporcionada, por lo que la comparación cuantitativa queda limitada al resultado del propio modelo frente al paper de referencia.

## Limitaciones y advertencias

- Solo simulación: entrenado y evaluado en MuJoCo, con una única escena, una mesa, iluminación fija y posición de cámaras fija; no probado en un robot real.
- Un único objeto (cubo de 3 cm) y un único tipo de objetivo (disco verde de 6 cm).
- Las cámaras se renderizan sin ruido ni desenfoque, por lo que la transferencia directa a hardware es improbable sin domain randomization o fine-tuning.
- El 12 % de fallos agregado (5/40) se debe a agarres lentos y bloqueos sobre el cubo; no es un controlador fiable para producción sin validación adicional.
- Variabilidad por el ruido de difusión: el éxito cae del 95 % al 80 % al no fijar la semilla, lo que exige control explícito de semillas en evaluación.
- Sin capacidades lingüísticas, de razonamiento general ni de tool calling; no debe evaluarse con benchmarks de LLM.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y el modelo no está validado fuera de su escenario.
- Sesgos conocidos: no documentados; al ser un modelo de control, los sesgos relevantes serían los del dataset de demostraciones y del escenario simulado.
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erróneas o bloqueos fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MattoTT/diffusion_ur5e_pick_place_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/MattoTT/ur5e_pick_place_v3
- Código (simulación, experto, grabación, evaluación): https://github.com/matto24/lerobot_diffusion_pick_place
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- LeRobot: https://github.com/huggingface/lerobot
- MuJoCo: https://mujoco.org/
