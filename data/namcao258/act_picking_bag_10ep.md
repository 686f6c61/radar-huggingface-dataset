# namcao258/act_picking_bag_10ep

## Resumen

`namcao258/act_picking_bag_10ep` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada y publicada con LeRobot, la librería de aprendizaje robótico de Hugging Face. El modelo no es un modelo de lenguaje: es un controlador visomotor que consume el estado articular de un robot bimanual y cuatro cámaras RGB, y produce comandos de acción de 14 dimensiones para una tarea concreta de recogida de bolsas ("picking_bag"). Cuenta con 51.685.006 parámetros en formato safetensors y un repositorio de 0,2 GB.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación: se publica junto al dataset de entrenamiento (`namcao258/picking_bag_20260918_161853`), con la configuración de entrenamiento completa (100.000 pasos, batch 8, AdamW, lr 1e-5, semilla 1000, LeRobot 0.6.0), lo que permite auditar y reproducir el pipeline. Está pensado para el robot `bi_widowxai_follower_robot`, una plataforma bimanual de bajo coste ampliamente usada en investigación.

El interés práctico es limitado y hay que ser explícito: solo 10 episodios y 17.959 fotogramas a 30 FPS de datos de teleoperación, sin resultados de evaluación publicados y con cero descargas en el momento de redactar esta ficha. Es un experimento inicial o una prueba de concepto, no una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con aprendizaje por imitación (arXiv:2304.13705) |
| Parametros totales | 51.685.006 (51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM: consume una observación por paso (estado `(14,)` + 4 imágenes `(3, 480, 640)`) y predice un chunk de acciones |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (política robótica). La tarea se especifica mediante la etiqueta `"picking_bag"` |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `bi_widowxai_follower_robot` (bimanual) |
| Camaras | `cam_high`, `cam_low`, `cam_left_wrist`, `cam_right_wrist` |
| Entrada (`observation.state`) | STATE, forma `(14,)` |
| Salida (`action`) | ACTION, forma `(14,)` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice *chunks* de acciones (varios pasos de control de una sola vez) en lugar de una acción por inferencia. La formulación original de la que deriva este modelo emplea un transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas, junto con *temporal ensembling* para agregar predicciones solapadas. Esta política se ha entrenado con la implementación de referencia de LeRobot, aunque la model card no detalla la configuración interna del transformer (número de capas, dimensión oculta, backbone visual, tamaño de chunk), por lo que esos datos concretos no están disponibles.

El entrenamiento se realizó exclusivamente sobre el dataset `namcao258/picking_bag_20260918_161853`: 10 episodios, 17.959 fotogramas a 30 FPS (aproximadamente 10 minutos de datos de teleoperación), una única tarea (`picking_bag`) y observaciones de 14 dimensiones de estado más cuatro cámaras. La configuración declarada es de 100.000 pasos con batch size 8, optimizador AdamW y tasa de aprendizaje 1e-5. La model card no indica uso de RLHF, DPO ni etapas de refinamiento posteriores; se trata de aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- Control visomotor bimanual: genera comandos de acción de 14 dimensiones a partir del estado articular y de cuatro vistas de cámara.
- Ejecución de la tarea `picking_bag` en el robot `bi_widowxai_follower_robot`.
- Predicción de chunks de acciones, lo que reduce la frecuencia efectiva de inferencia necesaria en el bucle de control.
- Integración nativa con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable mediante `lerobot-train`.
- Aprendizaje continuado (*fine-tuning*) sobre datos propios de teleoperación, gracias a que el repositorio incluye los pesos completos y la configuración.
- Sin soporte de tool calling / function calling.
- Sin capacidad de agente ni razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingües: no procesa lenguaje natural más allá de la etiqueta de tarea.
- Sin visión general: las cámaras se usan como entrada sensorial para el control, no para descripción o comprensión de escenas.
- Sin modo de razonamiento explícito (*thinking*), audio u otras modalidades.

## Casos de uso

- Recogida automatizada de bolsas en una celda bimanual: la política controla directamente el robot `bi_widowxai_follower_robot` con las cuatro cámaras configuradas, de modo que puede desplegarse tal cual sobre el mismo montaje físico para el que fue entrenada.
- Punto de partida para *fine-tuning* en una tarea propia: dado que los pesos y la configuración están publicados, un equipo puede reentrenar sobre sus propios episodios si dispone de la misma plataforma y disposición de cámaras.
- Línea base en investigación sobre ACT: sirve como referencia reproducible para comparar variantes (por ejemplo, cambiar el tamaño de chunk o añadir aumento de datos) manteniendo fijo el dataset y los hiperparámetros.
- Validación de una instalación de LeRobot: al ser un ejemplo completo y pequeño (0,2 GB), es útil para verificar el flujo `lerobot-rollout` en un robot nuevo antes de invertir en un dataset grande.
- Prueba de concepto de automatización de *picking* en logística: permite evaluar si el enfoque de imitación es viable para manipular objetos deformables como bolsas antes de escalar la recogida de datos.
- Estudio de sensibilidad a la disposición de cámaras: el modelo depende de cuatro vistas concretas (`cam_high`, `cam_low`, `cam_left_wrist`, `cam_right_wrist`), por lo que resulta útil para experimentar con reubicaciones y comprobar el impacto en el éxito de la tarea.
- Generación de datos sintéticos o aumentados: el modelo puede actuar como *rollout policy* en simulación para producir trayectorias adicionales que amplíen los 10 episodios originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación vacía, con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito medidas en robot real ni comparaciones cuantitativas con otras políticas.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | No disponible |
| Numero de ensayos / episodios evaluados | No disponible |
| Comparacion con modelos similares | No disponible |
| Metricas en simulacion | No disponible |

## Requisitos de hardware

- VRAM en inferencia: con 51,7 M de parámetros, los pesos en FP32 ocupan unos 207 MB y en FP16 unos 103 MB. Sumando activaciones y el procesamiento de cuatro imágenes de 480x640, la inferencia debería caber holgadamente por debajo de 2 GB de VRAM, aunque no se publica una medición oficial.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una RTX 3060, 4060 o superior cubre el caso de uso; GPU de datacenter como A100 o H100 solo tendrían sentido si se paralelizan muchos rollouts o si se reentrena con lotes grandes. También es viable en CPU para depuración, y en plataformas embebidas tipo Jetson para despliegue a bordo.
- Cabe en GPU de consumo: sí, con amplio margen, en prácticamente cualquier GPU de consumo con soporte CUDA de los últimos años.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=namcao258/act_picking_bag_10ep` es la vía documentada. El modelo se ejecuta sobre PyTorch con CUDA (`--policy.device=cuda`). vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo autoregresivo de texto.
- Latencia y throughput: no disponibles. El sistema captura a 30 FPS y la política predice chunks de acciones, lo que relaja el requisito de latencia respecto a un controlador paso a paso, pero no se publican mediciones de tiempo de inferencia ni de frecuencia efectiva de control.
- Requisito adicional no computacional: es imprescindible el hardware físico (`bi_widowxai_follower_robot`) y las cuatro cámaras con nombres coincidentes con las claves de observación del entrenamiento.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `namcao258/act_picking_bag_10ep` (este modelo) | ACT, imitacion con chunks de acciones | 51,7 M | Estado `(14,)` + 4 camaras 480x640 | apache-2.0 | Hugging Face, 0 descargas |
| Diffusion Policy (arXiv:2303.04137) | Imitacion generativa basada en difusion | No disponible | No disponible | No verificada en la informacion disponible | Repositorio de referencia publico |
| SmolVLA (LeRobot) | Vision-language-action sobre modelo preentrenado | No disponible | No disponible | No verificada en la informacion disponible | Hugging Face |

La comparacion cuantitativa no es posible: no hay resultados de evaluacion publicados para esta politica ni datos homogeneos de las alternativas en la informacion disponible. La diferencia conceptual relevante es que ACT aprende una politica especifica por tarea a partir de demostraciones, mientras que los enfoques VLA parten de modelos preentrenados de mayor tamano y generalidad.

## Limitaciones y advertencias

- Datos de entrenamiento muy escasos: 10 episodios y 17.959 fotogramas. Es altamente probable un sobreajuste al entorno concreto de grabacion.
- Sin evaluacion publicada: no existe ninguna tasa de exito medida, ni en robot real ni en simulacion. Cualquier uso productivo exige una validacion propia previa.
- Sensibilidad al entorno: la politica depende de cuatro camaras con nombres y posiciones concretas. Cambiar la iluminacion, la posicion de los objetos, la disposicion de las camaras o usar otro robot del mismo tipo puede degradar el comportamiento.
- Tarea unica: solo esta entrenada para `picking_bag`. No generaliza a otras tareas sin reentrenamiento.
- Sin capacidades linguisticas ni de agente: no admite tool calling, planificacion ni interaccion conversacional.
- Riesgo de alucinacion en el sentido de acciones espurias: como toda politica de imitacion, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribucion, sin ninguna senal de incertidumbre calibrada.
- Riesgos de seguridad fisica: al controlar un robot real, los fallos de la politica pueden provocar colisiones o danos. Es obligatorio disponer de parada de emergencia y limites articulares.
- Licencia apache-2.0: permite uso comercial y modificacion con atribucion, pero la licencia cubre el artefacto de software, no exime de cumplir la normativa de seguridad aplicable al despliegue robotico.
- Sin garantias del autor: el modelo se publica sin soporte, sin mantenimiento declarado y sin historial de uso (0 descargas, 0 likes en el momento de la consulta).
- Idiomas y contexto de lenguaje: no aplica; la unica entrada textual es la etiqueta de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namcao258/act_picking_bag_10ep
- Dataset de entrenamiento: https://huggingface.co/datasets/namcao258/picking_bag_20260918_161853
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=namcao258/picking_bag_20260918_161853
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Paper de Diffusion Policy (comparativa): https://arxiv.org/abs/2303.04137

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados correspondian a la plataforma Roblox y no guardan relacion con la ficha.
