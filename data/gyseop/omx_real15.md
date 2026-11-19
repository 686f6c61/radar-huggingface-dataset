# Gyseop/omx_real15

## Resumen

`Gyseop/omx_real15` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la librería LeRobot. No se trata de un modelo de lenguaje: es un modelo de imitación que aprende de datos de teleoperación para controlar un brazo robótico, prediciendo trozos cortos de acciones (action chunks) en lugar de pasos individuales. Cuenta con 51.668.614 parámetros en formato safetensors y un repositorio de 0,2 GB.

El modelo ha sido entrenado sobre el dataset `Gyseop/record-real15`, del propio autor, y está etiquetado con el pipeline `robotics`. Su relevancia es acotada: se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de la consulta, sin model card ampliada ni resultados de evaluación publicados. Resulta útil como ejemplo reproducible de un pipeline LeRobot completo (entrenamiento, registro y evaluación) más que como modelo listo para producción.

La licencia Apache 2.0 permite uso comercial y modificación, pero al carecer de documentación sobre el robot objetivo, la tarea concreta y las condiciones de recogida de datos, cualquier reutilización exige reentrenamiento o validación empírica previa. La información disponible no incluye detalles sobre arquitectura interna, datos de entrenamiento ni métricas de éxito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de observaciones robóticas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política recibe observaciones (típicamente imágenes de cámaras y estado de las articulaciones) y predice secuencias cortas de acciones, lo que reduce el error de acumulación de las políticas paso a paso y suaviza el comportamiento del robot. La implementación utilizada es la de LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El entrenamiento se realizó sobre el dataset `Gyseop/record-real15`, presumiblemente compuesto por episodios de teleoperación reales, aunque no se especifica el número de episodios, la frecuencia de captura, el robot empleado ni la tarea concreta. No hay información sobre aumentos de datos, hiperparámetros, número de pasos de entrenamiento ni sobre si se aplicó algún tipo de regularización o validación cruzada. Tampoco se documenta el proceso de evaluación ni la tasa de éxito alcanzada.

## Capacidades

- Predicción de chunks de acciones para control de robots manipuladores a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación y registro con `lerobot-record`.
- Compatibilidad con el robot `so100_follower` en los comandos de ejemplo de la model card (aunque no se confirma que sea el robot objetivo del entrenamiento).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Reproducción de un pipeline completo de LeRobot: el checkpoint sirve como referencia para validar la instalación, el flujo de entrenamiento y el script de evaluación en un entorno de laboratorio.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT con un conjunto de datos pequeño y comparar variantes de arquitectura o hiperparámetros.
- Prototipado de tareas de manipulación simples: si el robot y la tarea coinciden con los del dataset `record-real15`, puede desplegarse directamente para pruebas de agarre y colocación.
- Docencia y formación: útil como ejemplo didáctico de un modelo de robótica entrenado de principio a fin con herramientas open source.
- Punto de partida para fine-tuning: al ser Apache 2.0 y pesar solo 0,2 GB, puede adaptarse a nuevos datasets de teleoperación con coste computacional bajo.
- Evaluación comparativa de políticas: sirve como línea base ACT frente a otros métodos (Diffusion Policy, VQ-BeT) en el mismo robot y conjunto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros); el cuello de botella real es el pipeline de visión y el control del robot, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060 o superior cubre con holgura la inferencia en tiempo real.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna; también puede ejecutarse en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen de la frecuencia de control del robot, del número de cámaras y de la longitud del chunk de acciones.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gyseop/omx_real15 | ACT | 51,7 M | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot (referencia) | ACT | ~50 M (según configuración) | no aplica | Apache 2.0 | Hugging Face, múltiples checkpoints |
| Diffusion Policy (referencia) | Difusión | variable | no aplica | MIT/Apache según implementación | Repositorios de investigación |
| VQ-BeT (referencia) | Cuantización vectorial + transformer | variable | no aplica | MIT | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto; la comparación se limita a método, tamaño y licencia.

## Limitaciones y advertencias

- Sin métricas de evaluación publicadas: no hay evidencia de tasa de éxito ni de robustez en el robot objetivo.
- Especificidad del dataset: el modelo probablemente solo funciona con el robot, la cámara y la tarea de `record-real15`; no se documentan estos detalles.
- Riesgo de sobreajuste: con un único dataset pequeño y sin validación reportada, la generalización a nuevas posiciones u objetos es incierta.
- Sin soporte de lenguaje: no puede interpretar instrucciones en texto ni mantener conversaciones.
- Sesgos: no evaluados; en robótica pueden aparecer sesgos de posición, iluminación o configuración de la mesa presentes en los datos de teleoperación.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de documentación sobre el hardware y la tarea limita la responsabilidad del autor y traslada la validación al reutilizador.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyseop/omx_real15
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyseop/record-real15
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
