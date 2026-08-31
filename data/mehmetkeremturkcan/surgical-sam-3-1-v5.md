# mehmetkeremturkcan/Surgical-SAM-3.1-V5

## Resumen

Surgical SAM 3.1 V5 es un modelo de segmentación de imágenes quirúrgicas desarrollado por el AIDL Lab de la Universidad de Columbia y el IPAL Lab, como una adaptación del modelo base SAM 3.1 de Meta. Está diseñado para detectar y segmentar instrumentos quirúrgicos, partes de instrumentos, anatomía y tejido a partir de prompts de texto, lo que lo convierte en una capa de percepción útil para robótica quirúrgica y sistemas de asistencia en el quirófano. La versión V5 es un reentrenamiento limpio desde el modelo base SAM 3.1 sobre un dataset conjunto expandido que incluye etiquetas adicionales de hígado, vesícula biliar y partes de instrumentos.

El modelo combina el detector fine-tuned de SAM 3.1 con el tracker multiplex original, permitiendo tanto segmentación en imágenes individuales como propagación de máscaras en vídeo. El repositorio tiene un tamaño de 6,9 GB, lo que sugiere un modelo de tamaño medio, aunque no se han publicado los parámetros totales. Su relevancia radica en abordar el vacío existente entre los modelos de segmentación generalistas y las necesidades específicas del dominio quirúrgico, donde los instrumentos y la anatomía presentan características visuales muy distintas a las de objetos naturales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3.1 (Segment Anything Model 3.1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (acepta prompts de texto, pero no se especifican idiomas) |
| Licencia | sam-license (otra) |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

Surgical SAM 3.1 V5 se basa en la arquitectura SAM 3.1, un modelo de segmentación de imágenes con capacidades de detección open-vocabulary. El modelo fue fine-tuneado sobre el dataset SAM3-Joint-Surgical-Dataset, que contiene 41.372 imágenes físicas con 175.674 anotaciones COCO distribuidas en 29 categorías, consolidando etiquetas de CholecInstanceSeg, CholecSeg8k, el Dresden Surgical Anatomy Dataset y Endoscapes. La versión V5 es un reentrenamiento limpio desde el modelo base, entrenado durante ocho épocas con refinamiento del head de segmentación. El checkpoint por defecto incluye el detector fine-tuned y los parámetros originales del tracker multiplex de SAM 3.1, de modo que la detección en imágenes usa el detector adaptado y la propagación en vídeo utiliza el tracker nativo tras la inicialización de cada objeto.

## Capacidades

- Detección y segmentación de instrumentos quirúrgicos (grasper, hook, irrigator, clipper, bipolar, scissors, snare, etc.) a partir de prompts de texto.
- Segmentación de partes de instrumentos (cuerpo, muñeca, pinzas izquierda y derecha).
- Segmentación de anatomía y tejido (hígado, vesícula biliar, colon, estómago, páncreas, etc.).
- Soporte de open-vocabulary: puede segmentar conceptos no vistos durante el entrenamiento gracias a la arquitectura SAM 3.1.
- Propagación de máscaras en vídeo mediante el tracker multiplex integrado, útil para seguimiento de instrumentos en secuencias quirúrgicas.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de visión.

## Casos de uso

- Guiado de robots quirúrgicos: el modelo puede segmentar instrumentos y anatomía en tiempo real para proporcionar información de posición y orientación a sistemas robóticos como el da Vinci, mejorando la precisión en tareas de sutura o disección.
- Asistencia en cirugía laparoscópica: al detectar estructuras anatómicas como el hígado o la vesícula biliar, el modelo puede ayudar a los cirujanos a evitar daños colaterales durante procedimientos de colecistectomía.
- Análisis de vídeos quirúrgicos para formación: la capacidad de propagar máscaras en vídeo permite anotar automáticamente largas secuencias operatorias, facilitando la creación de material educativo y la evaluación de habilidades.
- Documentación quirúrgica automatizada: el modelo puede generar informes visuales de los instrumentos y tejidos presentes en cada fase de una operación, reduciendo la carga administrativa del personal médico.
- Investigación en visión por computador médica: sirve como baseline para desarrollar nuevos métodos de segmentación en dominios quirúrgicos, especialmente en entornos con baja iluminación, oclusión y deformación de tejidos.
- Integración en sistemas de realidad aumentada para cirujanos: superponer máscaras segmentadas sobre la vista endoscópica en tiempo real puede mejorar la navegación y la conciencia situacional durante la intervención.

## Benchmarks y rendimiento

El modelo fue evaluado en un test split de 4.320 imágenes, utilizando COCO AP (promedio en 10 umbrales IoU de 0,50 a 0,95) sobre 28 conceptos con instancias positivas. Los resultados comparan el reentrenamiento limpio (V5) con una continuación de la versión anterior:

| Modelo | Box AP | Mask AP | Box AP50 | Mask AP50 | Mask AP75 |
|:--|--:|--:|--:|--:|--:|
| Clean retrain desde Base SAM 3.1 | 0,4874 | 0,3890 | 0,6395 | 0,5000 | 0,4197 |
| Continuación desde versión anterior | 0,4632 | 0,3711 | 0,6189 | 0,4739 | 0,3960 |

Por grupos de categorías, el rendimiento varía notablemente:

| Grupo | Conceptos con instancias de test | Box macro AP | Mask macro AP |
|:--|--:|--:|--:|
| Instrumentos | 8 | 0,8300 | 0,7473 |
| Anatomía y tejido | 16 | 0,2960 | 0,1679 |
| Partes de instrumentos | 4 | 0,5681 | 0,5571 |

Los mejores resultados se obtienen en instrumentos como hook (Box AP 0,903, Mask AP 0,873) e irrigator (0,935 y 0,895), mientras que conceptos de tejido como connective tissue (Mask AP 0,000) o fat (Mask AP 0,000) presentan un rendimiento muy pobre, lo que indica limitaciones en la segmentación de tejidos blandos.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- El tamaño del repositorio (6,9 GB) sugiere que el modelo puede cargarse en memoria con una GPU de al menos 12 GB de VRAM en precisión FP16, aunque no hay confirmación.
- Para inferencia en tiempo real en vídeo, se recomienda una GPU de gama alta como RTX 4090 o A100, pero no se han publicado mediciones de latencia o throughput.
- Al ser un modelo de visión basado en PyTorch, puede desplegarse con frameworks estándar como PyTorch, aunque no se mencionan integraciones específicas con vLLM, Ollama o TGI (orientados a modelos de lenguaje).
- Para uso en producción, se recomienda validar el rendimiento en el hardware objetivo, especialmente en aplicaciones de tiempo real.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de segmentación quirúrgica en la información disponible. Existen trabajos previos como SurgicalSAM (AAAI 2024), que aborda la segmentación de instrumentos con un enfoque de prompt class, pero no se dispone de datos de comparación directa con Surgical SAM 3.1 V5. Tampoco se han encontrado evaluaciones frente a otros fine-tunings de SAM en el dominio médico.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en procedimientos de colecistectomía y otros entornos laparoscópicos, por lo que su generalización a otras especialidades quirúrgicas (neurocirugía, ortopedia, etc.) no está garantizada.
- Los resultados por concepto muestran una gran disparidad: mientras que los instrumentos alcanzan AP superiores a 0,8, la segmentación de tejidos blandos como grasa, tejido conectivo o ligamentos hepáticos es muy deficiente (Mask AP cercano a 0), lo que limita su uso en aplicaciones que requieran precisión anatómica.
- El modelo puede producir falsos positivos o máscaras incompletas en condiciones de oclusión, baja iluminación o deformación de tejidos, comunes en cirugía real.
- La licencia sam-license (otra) debe revisarse detalladamente antes de un uso comercial; no se especifican restricciones concretas en la model card.
- No se han publicado evaluaciones de sesgos demográficos o de variabilidad anatómica entre pacientes, por lo que su comportamiento en poblaciones diversas es desconocido.
- Para producción, es imprescindible validar el modelo en el dominio específico y considerar un umbral de confianza adecuado para evitar errores en la toma de decisiones clínicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mehmetkeremturkcan/Surgical-SAM-3.1-V5
- Dataset de entrenamiento: https://huggingface.co/datasets/mehmetkeremturkcan/SAM3-Joint-Surgical-Dataset
- Publicación en LinkedIn sobre el fine-tuning: https://www.linkedin.com/posts/mehmetkeremturkcan_robotics-surgicalrobotics-computervision-activity-7491541863502368768-mJ0M
- Repositorio de SurgicalSAM (AAAI 2024, trabajo relacionado): https://github.com/wenxi-yue/SurgicalSAM
- Paper de SurgicalSAM: https://arxiv.org/pdf/2308.08746
