# alexhegit/so101-simstudio-lab01-pnp-act-agent-yaw-v4

## Resumen

El modelo `alexhegit/so101-simstudio-lab01-pnp-act-agent-yaw-v4` es una política de robotica ACT (Action Chunking Transformer) entrenada para la tarea de pick-and-place del laboratorio 01 sobre el brazo SO-101, dentro del entorno de simulacion SO-101 SimStudio. Lo publica el usuario alexhegit en Hugging Face y su proposito es controlar el brazo a partir de observaciones visuales y de un vector de estado de 15 dimensiones, generando secuencias de acciones ("chunks") en lugar de comandos aislados.

Se trata de un modelo pequeno —51.677.830 parametros en formato safetensors, con un repositorio de 0,2 GB—, no de un modelo de lenguaje. La relevancia esta en que es un ejemplo reproducible de entrenamiento de una politica de imitacion con DAgger en simulacion, con datos, receta de entrenamiento y protocolo de evaluacion publicados de forma abierta bajo licencia Apache 2.0.

La version v4 parte de un dataset base v3 al que se anaden 20 episodios completos de DAgger con un agente consciente de la orientacion (yaw-aware). Segun la model card, el checkpoint de 80.000 pasos alcanza un 85% de exito (17/20) en el protocolo de evaluacion en simulacion con reset a posicion home, frente al 65% (13/20) de la politica ACT de la version v3 en el mismo protocolo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), politica de imitacion para robotica |
| Parametros totales | 51.677.830 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; el modelo consume un vector de estado de 15 dimensiones (posicion + velocidad + XYZ del efector final referido a `gripperframe`). En evaluacion se usan `n_action_steps=50` |
| Tipos de cuantizacion | No disponible (repositorio distribuido en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de control robotico, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

La politica es una ACT, una arquitectura de tipo transformer pensada para imitacion en robotica que predice bloques de acciones de forma conjunta en lugar de un unico paso. La entrada combina observaciones visuales con un estado de 15 dimensiones: posicion, velocidad y coordenadas XYZ del efector final expresadas en el marco `gripperframe`. Esta formulacion de estado referida al efector final es lo que da nombre a la variante "yaw-aware", orientada a manejar correctamente la orientacion de la pinza durante la tarea de pick-and-place.

El entrenamiento se realizo desde cero durante 80.000 pasos, con tamano de lote 64, guardando checkpoints cada 20.000 pasos; el checkpoint publicado corresponde a `080000/pretrained_model`. La receta indica que se ejecuto sobre un host DORobot / MI300X. Los datos de entrenamiento son el dataset `alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4`, descrito como la base de la version v3 mas 20 episodios completos de DAgger, una tecnica de agregacion de datos iterativa en la que las trayectorias de recuperacion del propio agente se incorporan al conjunto de entrenamiento. No se documentan en la informacion disponible detalles sobre composicion exacta del dataset, numero total de tokens o muestras, ni uso de RLHF/DPO (no aplica en este dominio).

## Capacidades

- Control de un brazo robotico SO-101 para la tarea de pick-and-place del laboratorio 01 en SO-101 SimStudio.
- Generacion de acciones en forma de chunks de hasta 50 pasos por inferencia, lo que reduce la frecuencia de replanificacion.
- Condicionamiento sobre estado propioceptivo de 15 dimensiones (posicion, velocidad y XYZ del efector final respecto a `gripperframe`), lo que permite un control consciente de la orientacion de la pinza.
- Ejecucion de politicas de imitacion entrenadas con demostraciones de un experto scripted con estado privilegiado.
- Recuperacion de errores parciales gracias a la incorporacion de episodios DAgger en el entrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento: es una politica de control, no un modelo generativo de lenguaje.
- Capacidades de vision limitadas a la observacion usada durante el entrenamiento en simulacion; no se documenta soporte multimodal adicional.

## Casos de uso

- Evaluacion de recetas de imitacion en robotica: el modelo sirve como referencia reproducible para comparar ACT con y sin datos DAgger, dado que la model card publica el resultado de la version v3 (65%) frente a la v4 (85%) bajo el mismo protocolo.
- Sim2sim y validacion en MuJoCo: se puede cargar en SO-101 SimStudio para reproducir el protocolo de evaluacion con reset a home y `n_action_steps=50`, util para verificar pipelines antes de pasar a hardware.
- Investigacion en aprendizaje por imitacion: permite estudiar el efecto de la representacion del estado (marco `gripperframe` frente a muneca fija) sobre la tasa de exito y la tasa de objetos caidos.
- Generacion de datos sinteticos para entrenamiento: el modelo puede actuar como agente generador de trayectorias en simulacion, que despues se filtran y se reutilizan como nuevas demostraciones.
- Desarrollo de benchmarks internos de manipulacion: con 51,7 millones de parametros y 0,2 GB de pesos, es ligero enough para integrarse en suites de evaluacion continuas que ejecutan muchas politicas en paralelo.
- Prototipado en educacion y docencia: el flujo completo (dataset, entrenamiento, checkpoint y evaluacion) esta documentado en el repositorio `so101-simstudio`, lo que lo hace adecuado como ejemplo didactico de un pipeline de robot learning de principio a fin.
- Pruebas de despliegue en el borde: al ocupar pocos cientos de MB, puede ejecutarse en GPUs de gama de consumo o incluso en dispositivos embebidos con GPU integrada para control de bajo nivel.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los publicados en la model card, obtenidos en simulacion con protocolo `home`, `n_action_steps=50`, EGL y la configuracion de rollout del agente yaw del laboratorio 01, con n=20.

| Checkpoint | Exito | Lift | Close | Objetos caidos |
|---|---|---|---|---|
| 40K | 14/20 (70%) | 17/20 | 20/20 | 4/20 |
| 80K (publicado) | 17/20 (85%) | 17/20 | 19/20 | 0/20 |
| v3 ACT 80K (referencia) | 13/20 (65%) | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a una politica de control robotico.

## Requisitos de hardware

- VRAM estimada: en FP32 los 51,7 millones de parametros ocupan aproximadamente 207 MB; en FP16, unos 103 MB. El repositorio completo pesa 0,2 GB, por lo que la huella de memoria es minima.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4090, e incluso GPUs integradas con suficiente memoria. No requiere A100 ni H100 para inferencia.
- El entrenamiento documentado se realizo sobre un host DORobot con acelerador MI300X, con lote 64 y 80.000 pasos; ese es el perfil de hardware usado para reproducir el entrenamiento, no para inferencia.
- Opciones de despliegue: la via oficial es la libreria `lerobot` mediante `ACTPolicy.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje y no a politicas de robotica.
- Latencia y throughput: no disponibles en la informacion proporcionada. La frecuencia de control efectiva dependera del simulador (SO-101 SimStudio sobre MuJoCo) y del hardware, y el uso de chunks de 50 acciones reduce el numero de inferencias necesarias por episodio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / estado | Entrenamiento | Licencia | Resultado publicado |
|---|---|---|---|---|---|---|
| `alexhegit/so101-simstudio-lab01-pnp-act-agent-yaw-v4` | ACT, yaw-aware | 51.677.830 | Estado de 15 dimensiones, `gripperframe` | 80.000 pasos, base v3 + 20 episodios DAgger | Apache 2.0 | 17/20 (85%) en simulacion |
| `alexhegit/so101-simstudio-lab01-pnp-act` | ACT | No disponible | No disponible | Ajuste sobre demostraciones expertas del dataset `so101-simstudio-lab01-pnp` | Apache 2.0 | No disponible |
| `alexhegit/so101-simstudio-lab01-pnp-molmoact2` | Politica (familia MolmoAct) | No disponible | No disponible | No disponible | No disponible | No disponible |
| v3 ACT 80K (referencia interna) | ACT | No disponible | No disponible | Base v3 sin los 20 episodios DAgger | Apache 2.0 | 13/20 (65%) |

No se dispone de datos de parametros, contexto ni licencia de las alternativas mas alla de lo indicado, por lo que la comparacion cuantitativa queda limitada a la tasa de exito publicada.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado exclusivamente en simulacion (SO-101 SimStudio sobre MuJoCo). No hay evidencia publicada de transferencia a hardware real (sim2real), por lo que su uso en un robot fisico requeriria validacion adicional.
- Sesgos conocidos: no documentados de forma explicita; al derivar de un experto scripted con estado privilegiado, la politica puede heredar las limitaciones y los sesgos de ese experto.
- Riesgo de fallo en la tarea: aunque el checkpoint de 80K no registra objetos caidos en la evaluacion (0/20), el exito es del 85%, es decir, 3 de cada 20 episodios fallan en el protocolo descrito.
- Limitaciones de idioma y contexto: no aplica, ya que el modelo no procesa lenguaje natural ni mantiene contexto conversacional; su "contexto" es el estado de 15 dimensiones.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia correspondientes.
- Caveat para produccion: con 0 descargas y 0 "likes" en el momento de la consulta, es un artefacto reciente y poco validado por la comunidad; conviene tratarlo como material de investigacion y no como componente listo para produccion.
- La informacion disponible no detalla la composicion exacta del dataset, la variabilidad entre ejecuciones ni los intervalos de confianza de las metricas de evaluacion (n=20 es una muestra pequena).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-act-agent-yaw-v4
- Dataset de entrenamiento: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4
- Repositorio SO-101 SimStudio: https://github.com/rocPAI-Forge/so101-simstudio
- Guia del laboratorio 01 (pick-and-place): https://github.com/rocPAI-Forge/so101-simstudio/blob/main/labs/lab01_pnp/lab01_pnp.md
- Dataset base pick-and-place: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp
- Dataset del agente yaw (version inicial): https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp-agent-yaw
- Dataset del agente yaw v2: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v2
- Politica ACT base: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-act
- Politica MolmoAct2 relacionada: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-molmoact2
