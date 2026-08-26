# kaKTEC/2608_static_quick_01_00test_GR00T17

## Resumen

El modelo `kaKTEC/2608_static_quick_01_00test_GR00T17` es una política robótica de visión-lenguaje-acción (VLA) basada en NVIDIA GR00T N1.7, entrenada y publicada mediante el framework LeRobot de Hugging Face. Se trata de un modelo de imitación (imitation learning) fine-tuneado sobre un conjunto de datos propio del autor (kaKTEC) para la tarea concreta de transportar un cubo blanco con un robot seguidor tipo `so_follower`, usando dos cámaras (superior y de muñeca) y la propiocepción del brazo.

El modelo hereda la arquitectura de GR00T N1.7: un backbone multimodal Cosmos-Reason2/Qwen3-VL combinado con un transformer de acción basado en flow-matching que predice acciones condicionadas por visión, lenguaje y estado propioceptivo. Con 3.144 millones de parámetros (3,14 mil millones) y un tamaño de repositorio de 12,6 GB en formato safetensors, es un modelo de tamaño medio apto para inferencia en tiempo real en GPU de consumo. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas VLA con LeRobot sobre la plataforma GR00T de NVIDIA, con licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones multimodales: 2 imagenes de 480x640 + estado de 6 dimensiones) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo procesa instrucciones de tarea en ingles: "Carrying a White Cube") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional de NVIDIA para robots humanoides, de codigo abierto y cross-embodiment (transferible entre distintas configuraciones de robot). La arquitectura combina un backbone de vision-lenguaje Cosmos-Reason2/Qwen3-VL, que procesa las observaciones visuales y las instrucciones en lenguaje natural, con un transformer de accion basado en flow-matching que genera las acciones de control predictivas. El modelo recibe como entrada el estado propioceptivo del robot (6 dimensiones), dos imagenes RGB (camara superior y camara de muñeca, ambas a 480x640 píxeles) y produce como salida un vector de accion de 6 dimensiones.

El entrenamiento se realizo con LeRobot version 0.6.1 sobre un dataset propio de 60 episodios y 10.983 fotogramas a 30 FPS, correspondientes a la tarea "Carrying a White Cube". Se ejecutaron 60.000 pasos de entrenamiento con batch size de 64, optimizador AdamW, learning rate de 0,0001 y semilla 42. No se indica el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior al aprendizaje por imitacion supervisado.

## Capacidades

- Manipulacion robotica por imitacion: ejecuta la tarea especifica de transportar un cubo blanco, aprendida de demostraciones humanas.
- Percepcion multimodal: procesa simultaneamente dos flujos de video RGB (camara superior y camara de muñeca) junto con el estado propioceptivo del robot.
- Control de bajo nivel: genera acciones de 6 grados de libertad en cada paso de inferencia, aptas para control directo del actuador.
- Ejecucion en tiempo real: entrenado con datos a 30 FPS, la politica esta disenada para inferencia continua de baja latencia.
- Generalizacion cross-embodiment: al estar basado en GR00T N1.7, hereda la capacidad de transferencia entre distintos robots de la misma categoria.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de Hugging Face (comandos `lerobot-rollout` y `lerobot-train`).

## Casos de uso

- Tareas de pick-and-place en entornos controlados: el modelo puede trasladar objetos de una posicion a otra siguiendo la trayectoria aprendida, util en lineas de montaje sencillas o celdas de trabajo repetitivas.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de VLA, comparar estrategias de entrenamiento o analizar la transferencia entre robots.
- Benchmarking de politicas VLA: al estar publicado con el dataset asociado, permite reproducir experimentos y comparar resultados con otras politicas entrenadas sobre los mismos datos.
- Prototipado rapido de aplicaciones roboticas: el flujo de LeRobot permite grabar demostraciones, entrenar y desplegar en un robot `so_follower` en pocas horas, ideal para validar conceptos.
- Educacion y formacion en robotica: al ser un ejemplo completo y funcional con licencia Apache 2.0, es un recurso valioso para cursos de robotica y aprendizaje automatico.
- Automatizacion de tareas de manipulacion en laboratorio: puede ejecutar protocolos repetitivos como mover muestras o reactivos entre estaciones, liberando tiempo de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de exito en robot real, ni comparaciones con otras politicas sobre el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en bf16 y 3-4 GB en int8 para los 3,14 mil millones de parametros (estimacion basada en el tamano del modelo; no hay datos oficiales).
- GPU recomendadas: una RTX 3090, RTX 4090 o superior seria suficiente para inferencia en tiempo real a 30 FPS. Una A100 o H100 proporcionaria margen adicional para procesamiento de las dos camaras simultaneas.
- Compatibilidad con GPU de consumo: si, el modelo cabe en tarjetas de gama alta de consumo (12 GB o mas de VRAM) con cuantizacion bf16 o fp16.
- Opciones de despliegue: el flujo principal es mediante LeRobot (`lerobot-rollout`), que requiere CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo sino una politica robotica.
- Latencia: no disponible en la informacion publicada; el modelo esta disenado para operar a 30 FPS, lo que implica un presupuesto de latencia de aproximadamente 33 ms por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kaKTEC/2608_static_quick_01_00test_GR00T17 | 3,14 B | GR00T N1.7 (Cosmos-Reason2/Qwen3-VL + flow-matching) | Transportar cubo blanco (fine-tuning) | Apache 2.0 | Hugging Face |
| NVIDIA GR00T N1.7 (base) | no disponible | Cosmos-Reason2/Qwen3-VL + flow-matching | VLA generalista para manipulacion | Apache 2.0 | GitHub / Hugging Face |
| OpenVLA (base) | 7 B | Prismatic (Llama-2 + ViT) | VLA generalista para manipulacion | MIT | Hugging Face |

La comparativa se limita a aspectos estructurales, ya que no existen datos de rendimiento publicados para este fine-tuning. El modelo de kaKTEC es una instancia especializada de GR00T N1.7, con un numero de parametros notablemente inferior al de OpenVLA, lo que favorece la latencia de inferencia en robot real.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha sido entrenado para la tarea "Carrying a White Cube" con 60 episodios; no generaliza a otras tareas ni a variaciones significativas del entorno.
- Sin resultados de evaluacion: no hay datos de tasa de exito en robot real, lo que impide conocer su fiabilidad en produccion.
- Dataset reducido: 60 episodios es un volumen bajo para aprendizaje por imitacion; puede presentar sobreajuste a las condiciones especificas de grabacion (iluminacion, posicion de camaras, color del objeto).
- Dependencia de la configuracion de hardware: las camaras deben coincidir con las claves de observacion entrenadas (`top` y `wrist`); cambios en la posicion, angulo o tipo de camara degradaran el rendimiento.
- Riesgo de alucinacion de acciones: como toda politica de imitacion, puede ejecutar movimientos incorrectos o inseguros ante observaciones fuera de distribucion; se recomienda supervisar el despliegue.
- Sin soporte multilingue documentado: la instruccion de tarea esta en ingles y no se documenta soporte para otros idiomas.
- Requisitos de robot especifico: el modelo esta entrenado para el robot `so_follower`; su uso en otros robots requiere verificacion de compatibilidad y posiblemente reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaKTEC/2608_static_quick_01_00test_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/kaKTEC/2608_static_quick_01_00test_20260820_170746
- Repositorio de NVIDIA Isaac GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio espejo GR00T N1.7: https://github.com/ZebinJiang/Isaac-GR00T17
- Guia de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kaKTEC/2608_static_quick_01_00test_20260820_170746
