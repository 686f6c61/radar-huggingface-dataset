# lucazanett/act_wiping_bs_low_nf_c50_01

## Resumen

`lucazanett/act_wiping_bs_low_nf_c50_01` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot y publicada en Hugging Face Hub. No es un modelo de lenguaje: es un controlador robótico que aprende a partir de datos de teleoperación y predice secuencias cortas de acciones (chunks) en lugar de comandos individuales, una formulación introducida en el paper arXiv:2304.13705 que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

El modelo tiene 51.627.658 parámetros (aproximadamente 51,6 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. Está entrenado sobre el dataset `lucazanett/new_setup_baseline_low_no_force`, cuyo nombre sugiere una tarea de limpieza o frotado ("wiping") en una configuración de robot con señal de fuerza baja o ausente. La nomenclatura del identificador (`bs_low_nf_c50_01`) apunta a una variante concreta de un barrido experimental (probablemente batch size, "no force" y chunk size 50), lo que lo convierte en un artefacto de investigación más que en un modelo listo para producción.

Su relevancia es acotada pero clara: sirve como referencia reproducible para quien trabaje con ACT en LeRobot, quiera comparar configuraciones de entrenamiento o necesite un checkpoint de partida para una tarea de wiping con robots tipo SO-100. La licencia Apache 2.0 facilita su reutilización, aunque la ausencia de métricas publicadas limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.627.658 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de observaciones configurada en LeRobot; no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de emitir una acción por paso, el modelo genera una secuencia de acciones de longitud fija (el sufijo `c50` sugiere chunks de 50 pasos). Esta formulación reduce el error de compounding y mejora la suavidad de las trayectorias. El modelo incorpora observaciones visuales (cámaras) y propioceptivas del robot, y se entrena con pérdida de reconstrucción sobre las acciones teleoperadas, típicamente con un término auxiliar de estilo CVAE para modelar la multimodalidad de las demostraciones.

El entrenamiento se realizó con LeRobot sobre el dataset `lucazanett/new_setup_baseline_low_no_force`. No se documenta el número de episodios, la composición exacta del dataset, ni si hubo aumento de datos o regularización específica. El nombre del dataset indica una configuración "low no force", es decir, sin señal de fuerza o con umbral bajo, lo que condiciona la política a un régimen de contacto concreto. No se especifican detalles sobre RLHF, DPO ni otras fases de ajuste, algo esperable en un modelo de robótica de este tipo.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones visuales y propioceptivas del robot.
- Ejecución de tareas de wiping o frotado en una configuración de robot concreta (SO-100 follower, según los comandos de ejemplo de la model card).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Reproducción de experimentos ACT: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento (batch size, chunk size, uso de fuerza) en la misma tarea de wiping, permitiendo aislar el efecto de cada variable.
- Punto de partida para fine-tuning: al estar en formato LeRobot y con licencia Apache 2.0, se puede reentrenar sobre un dataset propio de wiping con `lerobot-train` y `--policy.type=act`, reutilizando la arquitectura y los hiperparámetros documentados.
- Evaluación de políticas en robot SO-100: los comandos de `lerobot-record` con `--robot.type=so100_follower` permiten ejecutar la política en un robot real y grabar episodios de evaluación con prefijo `eval_`.
- Docencia e investigación en aprendizaje por imitación: útil como ejemplo didáctico de ACT con chunks de 50 pasos y sin señal de fuerza, para ilustrar el efecto del chunking en la suavidad de trayectorias.
- Benchmark interno de pipelines de robótica: integrable en un banco de pruebas que compare políticas ACT frente a otros métodos (Diffusion Policy, VQ-BeT) sobre la misma tarea y el mismo robot.
- Prototipado de tareas de limpieza en entornos controlados: la política puede desplegarse en un setup de laboratorio para validar la viabilidad de automatizar wiping antes de invertir en un dataset mayor.
- Análisis de ablación sobre señal de fuerza: al haberse entrenado sin fuerza ("no force"), sirve como baseline frente a variantes con señal de fuerza para medir la contribución de ese canal sensorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,6 M de parámetros; en la práctica, el cuello de botella es el backbone visual y el preprocesado de imágenes, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenamiento se recomienda al menos 8-12 GB de VRAM según el tamaño de batch y la resolución de las cámaras.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con soporte CUDA de los últimos años.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de PyTorch y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el número de cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_wiping_bs_low_nf_c50_01 | 51,6 M | no disponible | no publicado | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | reportado en el paper, no comparable directamente | no disponible en la informacion | Paper y código de referencia |
| Diffusion Policy | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | Implementaciones públicas |
| VQ-BeT | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | Implementaciones públicas |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas; la comparativa anterior es meramente cualitativa y de categoría.

## Limitaciones y advertencias

- Sesgos conocidos: la política está entrenada sobre un único dataset y una configuración de robot concreta; generalizará mal a otras tareas, objetos o entornos.
- Riesgo de alucinación: en robótica se traduce en acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento; no hay mecanismo de seguridad incorporado.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto lingüístico; la ventana de observación depende de la configuración de LeRobot y no se documenta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de datos y configuraciones no auditadas; conviene revisar la procedencia del dataset antes de un despliegue comercial.
- Caveats para producción: sin métricas de éxito publicadas, sin número de episodios de entrenamiento y sin evaluación independiente, no es recomendable desplegarlo en entornos reales sin una validación exhaustiva previa.
- El identificador sugiere una variante experimental ("bs_low_nf_c50_01"); podría tratarse de un checkpoint intermedio de un barrido y no de la mejor configuración del autor.
- No se documentan limitaciones de seguridad física; en manipulación real es imprescindible añadir paradas de emergencia y límites de fuerza externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucazanett/act_wiping_bs_low_nf_c50_01
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_baseline_low_no_force
