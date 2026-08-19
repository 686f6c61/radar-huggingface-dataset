# hukewei/act_refiner_0722_v2_lightweight_vision

## Resumen

`act_refiner_0722_v2_lightweight_vision` es un modelo de política robótica (policy) entrenado con la librería LeRobot de HuggingFace, diseñado específicamente para tareas de inserción de clavijas (peg insertion) con un módulo óptico. El modelo pertenece a la familia ACT (Action Chunking with Transformers), una arquitectura basada en transformers que aprende a generar secuencias de acciones a partir de observaciones visuales y de estado del robot. Con 57,98 millones de parámetros, se presenta como una versión ligera orientada a la inferencia en tiempo real en hardware de bajo coste.

El autor, hukewei, ha publicado el modelo junto con un dataset de entrenamiento (`hukewei/peg_optical_module_0722_v2`) que contiene demostraciones de la tarea. Aunque la model card es genérica (generada automáticamente por LeRobot), el nombre del modelo sugiere una versión refinada y optimizada de una política previa (`act_peg_optical_module_0722`). Su relevancia radica en la creciente demanda de soluciones de robótica de manipulación accesibles, entrenables y desplegables en entornos de producción o investigación sin necesidad de infraestructura de alto coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer con backbone visual ResNet (detalles exactos no disponibles) |
| Parametros totales | 57.980.152 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (en políticas robóticas el contexto es la secuencia de observaciones y acciones, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), presentada en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT emplea un transformer encoder-decoder que procesa observaciones (imágenes de cámara y estados de las articulaciones) y genera "chunks" de acciones futuras, lo que reduce la acumulación de errores en la ejecución de movimientos. El backbone visual suele ser un ResNet preentrenado, aunque no se especifica la variante exacta en la información disponible.

El entrenamiento se realizó con la librería LeRobot, utilizando el dataset `hukewei/peg_optical_module_0722_v2`. No se dispone de información sobre el número de episodios, la composición exacta del dataset, ni si se aplicaron técnicas de refuerzo o ajuste fino posterior (como RLHF o DPO). El nombre "lightweight_vision" sugiere una optimización del modelo para reducir el coste computacional, posiblemente mediante una reducción del backbone o de la dimensión del transformer, aunque no hay detalles técnicos publicados al respecto.

## Capacidades

- Control visuomotor: el modelo recibe imágenes de cámara y estados del robot (posición de articulaciones) y genera comandos de acción para los motores.
- Inserción de clavijas: está especializado en tareas de inserción precisa de piezas cilíndricas (peg-in-hole), un problema clásico de manipulación robótica que requiere precisión submilimétrica.
- Ejecución en tiempo real: al ser una versión ligera (58M parámetros), es adecuado para inferencia con baja latencia en hardware modesto.
- Integración con LeRobot: compatible con el ecosistema LeRobot, lo que facilita el despliegue en robots SO-100 o similares.
- Sin capacidades de lenguaje: no genera texto, no entiende instrucciones verbales ni soporta tool calling.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede controlar un brazo robótico para insertar conectores, pines o componentes electrónicos en placas de circuitos, sustituyendo tareas repetitivas que requieren precisión. Su tamaño reducido permite ejecutarlo en un mini-PC con GPU integrada.
- Robótica educativa y de investigación: en laboratorios universitarios o centros de formación, el modelo sirve como punto de partida para estudiar políticas visuomotoras, gracias a su compatibilidad con LeRobot y su licencia Apache-2.0.
- Prototipado rápido de celdas de trabajo: integrado en un robot SO-100 (de bajo coste), permite validar procesos de inserción en entornos de prueba antes de migrar a robots industriales más caros.
- Manipulación de piezas en logística: inserción de componentes en carcasas o ensamblaje de conectores en líneas de empaquetado, donde la variabilidad de la posición inicial se resuelve mediante visión.
- Investigación en aprendizaje por imitación: el modelo puede utilizarse como baseline para comparar nuevas arquitecturas o métodos de entrenamiento en tareas de manipulación precisa, ya que su tamaño moderado facilita la reproducción de experimentos.
- Teleoperación asistida: combinado con un sistema de control humano, el modelo puede refinar los movimientos del operador para lograr inserciones más precisas, reduciendo la fatiga y el error humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito en tareas de inserción, tasas de error, ni comparaciones con otros modelos. La model card no incluye métricas de evaluación.

## Requisitos de hardware

- VRAM estimada: con 58M de parámetros en FP32, el modelo ocupa aproximadamente 232 MB de memoria. En FP16, unos 116 MB. La inferencia puede ejecutarse en GPU con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA Jetson Nano, Jetson Orin, GTX 1650, RTX 3060 o superiores. También es viable en CPU para tasas de control bajas (por debajo de 10 Hz).
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en hardware embebido.
- Opciones de despliegue: LeRobot proporciona scripts de inferencia y evaluación (`lerobot-record`). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos. Dado el tamaño, se espera una latencia de inferencia inferior a 10 ms en GPU moderna, suficiente para control en bucle cerrado a 30-50 Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_refiner_0722_v2_lightweight_vision` | 58M | ACT | Inserción de clavijas | Apache-2.0 | HuggingFace |
| `act_peg_optical_module_0722` (del mismo autor) | no disponible | ACT | Inserción de clavijas | Apache-2.0 | HuggingFace |
| ACT original (paper arXiv:2304.13705) | ~100M (aprox.) | ACT | Manipulación bimanual | MIT (paper) | Código en GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos. El modelo del autor `act_peg_optical_module_0722` parece ser una versión previa sin el refinamiento "lightweight". La comparación con el ACT original es conceptual, ya que la implementación de LeRobot difiere en detalles de entrenamiento y backbone.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para una tarea concreta (inserción de clavijas con módulo óptico) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- Sin información de sesgos: al ser un modelo de control motor, no presenta sesgos lingüísticos, pero puede heredar sesgos del dataset de demostraciones (por ejemplo, variaciones en la iluminación o el fondo de la cámara que afecten al rendimiento).
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede generar acciones incorrectas si las observaciones están fuera de la distribución de entrenamiento (por ejemplo, cambios bruscos de iluminación o posición de la cámara).
- Limitaciones de contexto: el modelo no procesa lenguaje ni instrucciones; su "contexto" es la secuencia de observaciones, y la longitud de esta ventana no está documentada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright. No hay restricciones adicionales conocidas.
- Carencia de documentación técnica: la model card es genérica y no proporciona detalles sobre hiperparámetros, configuración del transformer, ni procedimiento de entrenamiento, lo que dificulta la reproducibilidad.
- Hardware de robot específico: el modelo fue entrenado probablemente con un robot SO-100 o similar; su uso en otros robots requerirá adaptación de la interfaz de acciones y observaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hukewei/act_refiner_0722_v2_lightweight_vision
- Dataset de entrenamiento: https://huggingface.co/datasets/hukewei/peg_optical_module_0722_v2
- Modelo relacionado del mismo autor: https://huggingface.co/hukewei/act_peg_optical_module_0722
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Paper de ACT: https://arxiv.org/abs/2304.13705
