# adrfm/sort_b601_simple_makelab_diepenbeek_filtered_act_v2

## Resumen

El modelo `adrfm/sort_b601_simple_makelab_diepenbeek_filtered_act_v2` es una política de aprendizaje por imitación para robótica basada en Action Chunking with Transformers (ACT), desarrollada por el usuario `adrfm` y entrenada con el framework LeRobot. Su objetivo es controlar un robot Seeed B601 (tipo follower) para realizar una tarea de clasificación de piezas: recoger discos de una placa gris y colocar los discos negros en una placa roja y los blancos en una placa azul. El modelo procesa observaciones de estado (7 dimensiones) e imágenes de dos cámaras (lateral y muñeca) y produce acciones de 7 dimensiones en forma de chunks, lo que reduce el error acumulado típico de las políticas de control paso a paso.

Con 51,67 millones de parámetros, es un modelo compacto que se puede ejecutar en hardware de consumo y está pensado para integrarse en flujos de trabajo de LeRobot. La arquitectura ACT es relevante en robótica porque permite aprender manipulaciones complejas a partir de demostraciones teleoperadas, y este modelo concreto sirve como ejemplo de una política entrenada para una tarea de pick-and-place con clasificación por color.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de un único paso. Esto permite que el modelo sea más robusto frente a errores de acumulación y variaciones en la dinámica del robot. ACT utiliza un codificador CVAE (Conditional Variational Autoencoder) para modelar la variabilidad de las demostraciones, lo que resulta especialmente útil en tareas con múltiples formas de completar una misma acción.

El entrenamiento se realizó con el framework LeRobot (version 0.6.2) sobre un dataset de teleoperacion con 52 episodios y 44.480 fotogramas a 30 FPS, correspondientes a la tarea de clasificacion de discos. La configuracion de entrenamiento incluye 55.600 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se ha aplicado RLHF ni DPO, ya que se trata de un modelo de control robotico, no de lenguaje.

## Capacidades

- Generacion de acciones de control para un robot con 7 grados de libertad (posiciones articulares o cartesianas).
- Percepcion visual mediante dos camaras (lateral y muneca) con imagenes de 480x640 pixeles.
- Ejecucion de tareas de pick-and-place con clasificacion de objetos por color.
- Prediccion de chunks de accion (action chunking) para reducir la acumulacion de errores en el control.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- No soporta tool calling, razonamiento general, generacion de texto, codigo ni matematicas, al ser un modelo de politica robotica.

## Casos de uso

- Clasificacion de piezas en una celula de ensamblaje: el modelo recoge discos de una placa gris y los coloca en placas roja o azul segun su color. Es adecuado porque la tarea esta directamente entrenada en este escenario.
- Automatizacion de tareas de pick-and-place en laboratorios: permite que un robot realice manipulaciones repetitivas con alta precision usando las camaras lateral y de muneca.
- Investigacion en aprendizaje por imitacion: sirve como referencia para estudiar el metodo ACT y comparar politicas entrenadas con LeRobot.
- Educacion y demostraciones de robotica: se puede desplegar en un robot Seeed B601 para mostrar el funcionamiento de politicas de imitacion en tiempo real.
- Pruebas de integracion con LeRobot: el modelo se puede usar como ejemplo para probar el pipeline de rollout y entrenamiento del framework.
- Evaluacion de politicas en entornos controlados: permite medir la tasa de exito de una tarea de clasificacion en un robot real, aunque no se han publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 51,67 millones de parametros, lo que equivale a aproximadamente 206 MB en FP32 o 103 MB en FP16 solo para los pesos, pero la memoria total depende de las imagenes procesadas y el tamano del lote.
- GPU recomendadas: no disponible. Dado el tamano, es probable que sea ejecutable en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmacion oficial.
- Si cabe en consumer GPU: probablemente si, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de robotica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los datos proporcionados.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea de clasificar discos en el robot Seeed B601 con las camaras lateral y muneca. No es generalizable a otros robots ni tareas sin reentrenamiento.
- No se han publicado resultados de evaluacion, por lo que se desconoce la tasa de exito real en el robot.
- Al ser un modelo de imitacion, hereda los sesgos y limitaciones del dataset de teleoperacion (52 episodios, 44.480 fotogramas). Si las demostraciones no cubren todas las situaciones posibles, el modelo puede fallar fuera de distribucion.
- No es un modelo de lenguaje, por lo que no tiene capacidades de razonamiento, generacion de texto ni soporte multilingue.
- La licencia Apache-2.0 permite uso comercial, pero debe incluirse el aviso de licencia y reconocimiento a los autores originales.

## Enlaces

- HuggingFace: https://huggingface.co/adrfm/sort_b601_simple_makelab_diepenbeek_filtered_act_v2
- Paper ACT: https://huggingface.co/papers/2304.13705
- Dataset: https://huggingface.co/datasets/adrfm/sort_b601_simple_makelab_diepenbeek_filtered
- LeRobot GitHub: https://github.com/huggingface/lerobot
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT: https://huggingface.co/docs/lerobot/main/en/act
