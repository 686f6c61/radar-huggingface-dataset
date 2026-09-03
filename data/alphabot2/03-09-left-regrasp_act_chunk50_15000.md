# alphabot2/03-09-Left-ReGrasp_act_chunk50_15000

## Resumen

El modelo `alphabot2/03-09-Left-ReGrasp_act_chunk50_15000` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), desarrollado por el usuario alphabot2 y entrenado con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación teleoperadas. Este checkpoint concreto corresponde a 15.000 pasos de entrenamiento sobre el dataset `alphabot2/03-09-Left-ReGrasp`, orientado a tareas de reagarre (re-grasp) con un brazo robótico izquierdo.

El modelo tiene 51,6 millones de parámetros, un tamaño modesto que lo hace viable para inferencia en tiempo real en hardware de gama media. Su relevancia radica en que demuestra cómo aplicar ACT a tareas de manipulación fina con datasets pequeños, un caso de uso habitual en laboratorios de robótica. Al estar licenciado bajo Apache 2.0 y distribuido en formato safetensors, es directamente reproducible y modificable para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.637.904 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de la tarea; ACT usa ventanas de observacion y prediccion fijas) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no aplicable (modelo de vision-accion para robotica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) combina un transformer con un mecanismo de chunking de acciones: en lugar de predecir una sola accion por paso, el modelo predice un bloque de acciones futuras (en este caso, chunks de 50 pasos). La arquitectura tipica de ACT incluye un encoder de vision (generalmente ResNet) para procesar las observaciones de camara, un transformer con atencion cruzada que relaciona las observaciones con las acciones, y un decodificador que emite el chunk de acciones. El entrenamiento se realiza mediante aprendizaje por imitacion sobre datos teleoperados, sin refuerzo ni RLHF. En este caso, el dataset `03-09-Left-ReGrasp` contiene episodios de reagarre con un brazo izquierdo, y el modelo se entreno durante 15.000 pasos usando la implementacion de LeRobot. No se han publicado detalles adicionales sobre el dataset (numero de episodios, composicion, etc.) en la informacion disponible.

## Capacidades

- Generacion de secuencias de acciones de robot: predice chunks de 50 pasos de control para tareas de manipulacion.
- Control de brazo robotico: especificamente entrenado para tareas de reagarre con brazo izquierdo (Left-ReGrasp).
- Aprendizaje por imitacion: reproduce comportamientos teleoperados con alta fidelidad.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.
- No procesa lenguaje natural ni tiene capacidades de vision general: su entrada son observaciones de estado/vision del robot y su salida son comandos de articulacion.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo puede controlar un brazo robotico para tareas de agarre y reagarre de objetos, util en investigacion de robotica.
- Automatizacion de tareas repetitivas en entornos controlados: por ejemplo, en una celda de ensamblaje donde se requiere reposicionar piezas con precision.
- Evaluacion de algoritmos de aprendizaje por imitacion: sirve como baseline para comparar ACT con otras politicas (Diffusion Policy, VQ-BeT) en tareas de reagarre.
- Prototipado rapido de politicas: gracias a su tamano reducido, se puede entrenar y desplegar en estaciones de trabajo con una sola GPU.
- Transferencia a otros robots: aunque entrenado para un brazo izquierdo, la arquitectura ACT es agnostica al robot y puede adaptarse con fine-tuning a otros sistemas.
- Investigacion en chunking de acciones: permite estudiar el efecto de la longitud del chunk (50) en la estabilidad y precision del control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como tasa de exito en tareas de reagarre, ni comparaciones con otros modelos en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51,6 M de parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32. Con cuantizacion (si se generara) seria aun menor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1650, RTX 3060, o incluso CPU son viables para inferencia, aunque para control en tiempo real se recomienda GPU.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU moderna.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia (`lerobot-record`). Tambien se puede exportar a ONNX o TensorRT para despliegue en edge, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño del chunk (50 pasos), pero al ser un modelo pequeno, la latencia deberia ser inferior a 10 ms en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphabot2/03-09-Left-ReGrasp_act_chunk50_15000 | 51,6 M | ACT | chunk de 50 acciones | Apache 2.0 | HuggingFace |
| Diffusion Policy (ej. en LeRobot) | variable (tipicamente 10-100 M) | Denoising Diffusion Probabilistic Model | ventana de observacion fija | MIT (referencia) | codigo abierto |
| VQ-BeT (LeRobot) | variable | Transformer con cuantizacion de acciones | chunk de acciones | MIT (referencia) | codigo abierto |

No se dispone de datos de rendimiento comparativo en el mismo dataset. La comparativa se limita a caracteristicas arquitectonicas generales.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo hereda los sesgos del dataset de teleoperacion (por ejemplo, preferencias del operador humano, distribucion de objetos, condiciones de iluminacion).
- Riesgo de alucinacion: en robotica, el equivalente es la generacion de acciones invalidas o inseguras fuera de la distribucion de entrenamiento. No se ha evaluado la robustez ante perturbaciones.
- Limitaciones de contexto: el modelo predice chunks de 50 pasos, por lo que no puede adaptarse a cambios repentinos en el entorno dentro de ese horizonte.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset asociado (`alphabot2/03-09-Left-ReGrasp`) puede tener sus propias restricciones; se debe verificar.
- Caveat de produccion: es un checkpoint de investigacion, no un sistema de control certificado. No debe usarse en aplicaciones de seguridad critica sin validacion exhaustiva.
- Idioma: no aplica, pero el modelo no tiene capacidades de lenguaje, por lo que no puede interpretar instrucciones verbales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alphabot2/03-09-Left-ReGrasp_act_chunk50_15000
- Dataset asociado: https://huggingface.co/datasets/alphabot2/03-09-Left-ReGrasp
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (libreria): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
