# nvidia/GR00T-H-N1.7

## Resumen

GR00T-H-N1.7 es un modelo visión-lenguaje-acción (VLA) desarrollado por NVIDIA, especializado en robótica quirúrgica. Se trata de un ajuste posterior (post-training) del modelo fundacional Isaac GR00T N1.7, adaptado mediante el conjunto de datos Open-H Embodiment, un corpus a gran escala orientado a robótica médica. El modelo combina un backbone visión-lenguaje Cosmos-Reason2-2B con una cabeza de transformer de difusión (DiT) que genera acciones continuas mediante flow matching.

Con aproximadamente 2.942 millones de parámetros reales (3B nominales), el modelo resuelve el problema de la generalización de políticas robóticas en entornos quirúrgicos y de ecografía robótica, un dominio donde los datos son escasos y las políticas específicas de tarea no generalizan. Su relevancia radica en que traslada la arquitectura de los modelos fundacionales de robótica de propósito general al ámbito sanitario, manteniendo la capacidad de manejar múltiples vistas de cámara y propriocepción variable por embodiment.

NVIDIA lo publica bajo su licencia Open Model, listo para uso comercial, aunque explícitamente no destinado a despliegue clínico ni a decisiones médicas. Está pensado para investigadores, académicos y comunidad open source que trabajen en desarrollo de algoritmos y benchmarking en robótica sanitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (SigLIP2) + MLP + Flow matching Transformer (DiT con AdaLN) |
| Parametros totales | 2.942.584.448 (~3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GR00T-H-N1.7 hereda la arquitectura de la serie GR00T N1.7. El backbone visión-lenguaje es Cosmos-Reason2-2B, que codifica las observaciones de imagen del robot y las instrucciones de texto. Las imágenes RGB de las cámaras se procesan mediante un vision transformer preentrenado (SigLIP2); los embeddings de todos los frames se concatenan en una secuencia seguida de los embeddings de los tokens de lenguaje, lo que permite manejar un número variable de vistas por embodiment.

La parte de acción se modela con un flow matching transformer implementado como diffusion transformer (DiT), con condicionamiento del paso de difusión mediante adaptive layernorm (AdaLN). Este transformer intercala self-attention sobre propriocepción y acciones con cross-attention hacia los embeddings de Cosmos-Reason2-2B. La propriocepción se codifica con un MLP indexado por el ID de embodiment, con padding a una longitud máxima configurable para admitir dimensiones variables. Las acciones se codifican y las predicciones de velocidad se decodifican mediante un MLP por cada embodiment único. Durante el entrenamiento, las acciones de entrada se corrompen interpolando aleatoriamente entre la acción limpia y un vector de ruido gaussiano; en inferencia, la política muestrea ruido gaussiano y reconstruye iterativamente la acción continua a partir de su predicción de velocidad. El ajuste se realizó sobre el dataset Open-H Embodiment; no se detalla en la información disponible el número de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones robóticas continuas condicionadas a observaciones visuales y a una instrucción en lenguaje natural.
- Procesamiento de múltiples vistas de cámara con un número variable de frames por embodiment.
- Codificación de propriocepción de dimensión variable mediante padding a longitud máxima configurable.
- Soporte multi-embodiment: MLPs separados de codificación/decodificación de acciones por cada embodiment único.
- Políticas de robótica quirúrgica y de ecografía robótica (robotic ultrasound policies).
- Integración con instrucciones en lenguaje natural como condicionamiento de la política.
- No dispone de tool calling, function calling ni modo de razonamiento explícito según la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en robótica quirúrgica: el modelo sirve como política base para experimentar con manipulación quirúrgica asistida, aprovechando el ajuste sobre Open-H Embodiment para tareas de este dominio.
- Políticas de ecografía robótica: permite desarrollar y evaluar políticas que controlan un brazo robótico para la adquisición de imágenes ecográficas, condicionadas a instrucciones de texto y a las vistas de cámara.
- Benchmarking de modelos VLA en el ámbito sanitario: al ser un modelo abierto con licencia comercial, se puede usar como referencia en comparativas de políticas de robótica médica frente a modelos de propósito general.
- Desarrollo de métodos de flow matching para control: la arquitectura DiT con flow matching permite investigar la generación de acciones continuas multimodales y su estabilidad en entornos con ruido.
- Transferencia entre embodiments: el esquema de MLPs por embodiment y el padding de propriocepción permiten estudiar la adaptación de una misma política a distintos robots quirúrgicos.
- Prototipado en laboratorio de asistentes quirúrgicos: investigadores pueden integrar el modelo en bancos de pruebas con cámaras RGB y estados de robot reales o simulados para validar estrategias antes de cualquier evaluación clínica (que queda fuera del uso previsto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con ~2,94B parámetros, una estimación orientativa en FP16 rondaría los 6 GB de pesos, pero no se confirma en la documentación.
- GPU recomendadas: no disponible. NVIDIA indica que el modelo está diseñado y optimizado para ejecutarse en sistemas acelerados por GPU NVIDIA con CUDA, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime indicado PyTorch; no se detallan vLLM, llama.cpp, Ollama ni TGI (el modelo genera acciones continuas, no texto).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-H-N1.7 | ~2,94B | no disponible | VLA para robótica quirúrgica | NVIDIA Open Model License | Hugging Face |
| GR00T-N1.7-3B (modelo base) | ~3B | no disponible | VLA de propósito general para robótica | no disponible en la información | Hugging Face |
| Cosmos-Reason2-2B (backbone) | ~2B | no disponible | Visión-lenguaje con razonamiento | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No está destinado a despliegue clínico, atención al paciente ni toma de decisiones médicas; su uso previsto es exclusivamente I+D en robótica.
- Riesgo de alucinación y de generalización incorrecta fuera de las distribuciones de embodiments y tareas cubiertas por Open-H Embodiment.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; el modelo no está orientado a generación de texto libre sino a condicionamiento por instrucciones.
- Restricciones de licencia: NVIDIA Open Model License; el usuario es responsable de cumplir la legislación aplicable. El uso comercial está permitido según la model card, pero debe revisarse el texto completo de la licencia.
- Dependencia del ecosistema NVIDIA (CUDA, PyTorch) para un rendimiento óptimo.
- La salida son vectores de acción continuos dependientes de los grados de libertad del robot, por lo que cualquier integración requiere validación específica por embodiment.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/GR00T-H-N1.7
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone visión-lenguaje: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset Open-H Embodiment: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-Open-H-Embodiment
- Repositorio GitHub: https://github.com/NVIDIA-Medtech/GR00T-H
- Paper Open-H-Embodiment: https://arxiv.org/abs/2604.21017
- White paper GR00T N1: https://arxiv.org/abs/2503.14734
- Paper pi0 (flow matching policy): https://arxiv.org/abs/2410.24164
- Web de NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
