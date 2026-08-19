# htrbao/aloha_bimanual_js_abs-pick_fruits

## Resumen
El modelo `htrbao/aloha_bimanual_js_abs-pick_fruits` es un modelo de robótica basado en visión-lenguaje-acción (VLA) diseñado para la manipulación bimanual de objetos, concretamente para la tarea de recogida de frutas. Ha sido desarrollado por el usuario htrbao y publicado bajo licencia MIT, lo que facilita su uso y modificación tanto en entornos de investigación como industriales.

La etiqueta `Gr00tN1d7` indica que se trata de un ajuste fino (fine-tuning) del modelo base NVIDIA GR00T N1, una arquitectura fundacional para robots humanoides y brazos manipuladores. El modelo cuenta con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y el repositorio tiene un tamaño de 12,6 GB, lo que sugiere que los pesos están almacenados en precisión FP32 (3,14 B × 4 bytes ≈ 12,56 GB).

Aunque la ficha técnica del autor es extremadamente escasa (solo incluye la licencia), la combinación del nombre del repositorio, la etiqueta de base y el tamaño de parámetros lo posicionan como un candidato relevante para aplicaciones de robótica de manipulación en entornos agrícolas o logísticos, donde se requiere coordinación bimanual precisa. Su relevancia actual radica en el creciente interés por modelos VLA de código abierto que puedan ejecutarse en hardware accesible.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en NVIDIA GR00T N1 (inferido por la etiqueta `Gr00tN1d7`) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene únicamente safetensors, presumiblemente FP32 por el tamaño del repo) |
| Idiomas soportados | no disponible (al ser un modelo de acción robótica, es probablemente agnóstico al idioma, aunque no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura exacta no está documentada en la model card proporcionada. Sin embargo, la etiqueta `Gr00tN1d7` apunta inequívocamente a que este modelo es un ajuste fino de NVIDIA GR00T N1, un modelo fundacional de visión-lenguaje-acción (VLA) de 3,14 mil millones de parámetros diseñado para controlar robots humanoides y brazos manipuladores. GR00T N1 combina un codificador de visión (ViT) con un modelo de lenguaje y un decodificador de acciones que genera comandos de posición y velocidad para las articulaciones del robot.

El nombre del repositorio, `aloha_bimanual_js_abs-pick_fruits`, indica que el entrenamiento se ha realizado sobre la plataforma ALOHA (A Low-cost Open-source Hardware for Bimanual Teleoperation), que utiliza dos brazos robóticos coordinados. La tarea específica es "pick fruits" (recogida de frutas), probablemente entrenada mediante teleoperación y aprendizaje por imitación. No se han publicado detalles sobre el dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica si se utilizó decodificación especulativa u otras innovaciones técnicas.

## Capacidades
- Manipulación bimanual: el modelo está diseñado para coordinar dos brazos robóticos simultáneamente, una capacidad crítica para tareas como recoger frutas sin dañarlas.
- Percepción visual: al ser un VLA, integra un codificador de visión que procesa imágenes de cámaras para localizar y orientar los objetos.
- Generación de acciones: produce comandos de control de articulaciones (posición y velocidad) directamente a partir de observaciones visuales y, potencialmente, instrucciones de lenguaje.
- Ajuste fino específico: al ser un fine-tuning de GR00T N1, conserva las capacidades generales de razonamiento espacial del modelo base, pero especializado en la tarea de recogida de frutas.
- No se documentan capacidades de tool calling, agentes, ni razonamiento multi-step fuera del contexto robótico.

## Casos de uso
- Agricultura de precisión: el modelo puede integrarse en robots cosechadores para recoger frutas delicadas como fresas o tomates, reduciendo el daño mecánico gracias a la coordinación bimanual.
- Investigación en robótica: sirve como punto de partida para investigadores que trabajan con la plataforma ALOHA y necesitan una política de manipulación preentrenada para transferir a otras tareas de pick-and-place.
- Automatización logística: puede adaptarse para clasificar y empaquetar productos en líneas de producción donde se requiere manipulación cuidadosa de objetos no rígidos.
- Teleoperación asistida: en entornos de cirugía o manipulación remota, el modelo puede asistir al operador humano sugiriendo o ejecutando movimientos bimanuales coordinados.
- Simulación y transferencia sim-to-real: al ser un modelo compacto de 3,14 B, puede ejecutarse en simuladores como Isaac Sim para validar estrategias antes del despliegue físico.
- Educación y prototipado: su licencia MIT permite a laboratorios académicos y startups integrarlo en sus propios sistemas robóticos sin costes de licencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de robótica (como tasa de éxito en la tarea de recogida) en la model card del repositorio.

## Requisitos de hardware
- VRAM estimada para inferencia: dado que el repositorio ocupa 12,6 GB y los parámetros son 3,14 B, es muy probable que los pesos estén en FP32, lo que requeriría aproximadamente 12,6 GB de VRAM. Si se convirtieran a FP16, se reduciría a ~6,3 GB.
- GPU recomendadas: para FP32 se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L40S). Para FP16, una RTX 3090 (24 GB) o RTX 4080 (16 GB) sería suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama alta para consumidores si se cuantiza a FP16 o INT8, aunque no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: al ser un modelo de robótica, no se despliega con herramientas de texto como vLLM u Ollama. Requiere un framework de robótica (por ejemplo, ROS 2, Isaac Lab) y un bucle de control en tiempo real. El formato safetensors es compatible con PyTorch.
- Latencia y throughput: no disponible. La latencia dependerá críticamente del hardware, la frecuencia de control del robot (típicamente 10-50 Hz) y si se utiliza un pipeline optimizado.

## Comparativa con modelos similares
No se dispone de información suficiente para realizar una comparativa directa con otros modelos de la misma categoría, ya que no se han publicado métricas de rendimiento ni detalles de entrenamiento. Sin embargo, se puede contextualizar con el modelo base:

| Modelo | Parametros | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| htrbao/aloha_bimanual_js_abs-pick_fruits | 3,14 B | VLA (GR00T N1 fine-tune) | MIT | HuggingFace |
| NVIDIA GR00T N1 (base) | 3,14 B | VLA | Licencia propia de NVIDIA (investigación) | HuggingFace |
| OpenVLA (referencia) | 7 B | VLA (Prismatic) | MIT | HuggingFace |

La principal diferencia con OpenVLA es el tamaño (3,14 B vs 7 B) y la especialización: este modelo está optimizado para una tarea bimanual concreta, mientras que OpenVLA es más generalista. La comparativa cuantitativa no es posible sin benchmarks publicados.

## Limitaciones y advertencias
- Documentación ausente: la model card no incluye información sobre el dataset de entrenamiento, el método de alineación, ni las condiciones de hardware utilizadas. Esto dificulta la reproducibilidad y la evaluación objetiva.
- Sin métricas de rendimiento: no hay benchmarks publicados, por lo que se desconoce la tasa de éxito real en la tarea de recogida de frutas o su robustez ante variaciones del entorno.
- Riesgo de sobreajuste: al ser un fine-tuning para una tarea muy específica (pick fruits), es probable que el modelo tenga un rendimiento pobre en tareas fuera de su distribución de entrenamiento.
- Dependencia del modelo base: aunque el repositorio tiene licencia MIT, el modelo base GR00T N1 puede tener restricciones adicionales de uso comercial que deben verificarse antes de desplegar el modelo en producción.
- Ausencia de cuantizaciones: no se proporcionan versiones GGUF o INT8, lo que limita su despliegue en hardware de baja gama o edge.
- Baja adopción: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad y puede contener errores no detectados.

## Enlaces
- Repositorio HuggingFace: [https://huggingface.co/htrbao/aloha_bimanual_js_abs-pick_fruits](https://huggingface.co/htrbao/aloha_bimanual_js_abs-pick_fruits)
- No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion proporcionada.
