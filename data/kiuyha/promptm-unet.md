# Kiuyha/PromptM-UNet

## Resumen

PromptM-UNet es un framework de segmentación 3D de imágenes médicas guiada por prompts de texto, desarrollado por Kiuyha y publicado bajo licencia Apache 2.0. Integra bloques Residual Vision Mamba (SSM) con condicionamiento de lenguaje multi-etapa, lo que permite modelar volúmenes completos con complejidad computacional lineal O(N) y un consumo de memoria mínimo. Está diseñado específicamente para la segmentación del bazo en tomografías computarizadas (CT) del cohorte TotalSegmentator, alcanzando un coeficiente de Dice (DSC) de 0.862 y una distancia de superficie normalizada (NSD) de 0.792 con menos de 4.3 GB de VRAM durante la validación.

El backbone visual activo del modelo tiene aproximadamente 1.87 millones de parámetros, lo que lo hace 16 veces más pequeño que un nnU-Net estándar y 100 veces más pequeño que SegVol. Esta eficiencia permite ejecutar inferencias en GPUs de consumo convencionales, democratizando el acceso a herramientas de segmentación volumétrica avanzada. El modelo emplea un pipeline de doble resolución inspirado en SegVol: un contexto global de 3 mm combinado con un recorte de alta resolución de 1.5 mm, lo que equilibra precisión y eficiencia.

La relevancia actual de PromptM-UNet radica en su capacidad para integrar conocimiento clínico expresado en lenguaje natural dentro del proceso de segmentación, sin añadir sobrecarga de memoria gracias a un mecanismo de caché de embeddings de texto desacoplado. Esto lo convierte en una opción atractiva para entornos clínicos con recursos limitados y para investigación en segmentación guiada por prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Residual Vision Mamba (SSM) con condicionamiento de lenguaje multi-etapa |
| Parametros totales | No disponible (backbone visual activo: ~1.87 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada volumetrica 3D) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (prompts en ingles, segun ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

PromptM-UNet se basa en una arquitectura híbrida que combina bloques Residual Vision Mamba (RVM) provenientes de LightM-UNet con un módulo de condicionamiento de lenguaje. Los bloques RVM utilizan modelos de espacio de estado (SSM) para modelar dependencias globales en volúmenes 3D con complejidad lineal O(N), evitando la explosión de memoria cuadrática de los Transformers. El condicionamiento de lenguaje se realiza en múltiples etapas del decodificador, fusionando los embeddings de texto con las características visuales mediante operaciones de multiplicación, concatenación o híbridas. El texto se procesa con un encoder CLIP congelado, cuyos embeddings se cachean para no consumir memoria adicional durante el entrenamiento o la inferencia.

El entrenamiento se realizó sobre el cohorte de validación de TotalSegmentator para el bazo, durante 30 épocas. Se evaluaron diferentes funciones de pérdida, incluyendo BCE estándar, focal loss y combinaciones dinámicas, así como distintas estrategias de fusión (temprana, tardía y en todas las etapas). El mejor resultado se obtuvo con fusión temprana, multiplicación como operación de fusión y pérdida focal 50:50, alcanzando un DSC pico de 0.8627. No se emplearon técnicas de RLHF ni DPO; el entrenamiento es completamente supervisado con máscaras de segmentación.

## Capacidades

- Segmentación 3D de órganos en tomografías computarizadas guiada por prompts de texto en lenguaje natural.
- Soporte de prompts clínicos multi-nivel: nombre del órgano, sinónimos, localización anatómica y combinaciones (tiers N, NS, NL, NSL).
- Modelado volumétrico con complejidad lineal O(N) gracias a los bloques Residual Vision Mamba.
- Inferencia eficiente en GPU de consumo: menos de 4.3 GB de VRAM durante la validación.
- Cero sobrecarga de memoria para el modelo de lenguaje gracias al caché de embeddings desacoplado.
- Pipeline de doble resolución que combina contexto global (3 mm) con detalle local (1.5 mm).
- Compatible con entrada de volumen 3D de dimensiones variables (ej. 64x128x128).

## Casos de uso

- Planificación quirúrgica: el modelo puede segmentar el bazo en CT preoperatorios, permitiendo a los cirujanos visualizar la anatomía y planificar incisiones o resecciones con precisión milimétrica.
- Radioterapia: la segmentación automática del bazo es esencial para delimitar órganos de riesgo en la planificación de radioterapia abdominal, reduciendo la dosis de radiación a tejidos sanos.
- Seguimiento de enfermedades: al procesar series temporales de CT, el modelo puede cuantificar cambios en el volumen del bazo en pacientes con esplenomegalia o enfermedades hematológicas, facilitando el monitoreo clínico.
- Investigación clínica: los investigadores pueden utilizar PromptM-UNet para generar máscaras de bazo de forma rápida y reproducible en grandes cohortes de imágenes, acelerando estudios epidemiológicos o de desarrollo de biomarcadores.
- Integración en flujos de trabajo radiológicos: al ser ultra-ligero, puede desplegarse en estaciones de trabajo locales sin necesidad de servidores GPU dedicados, permitiendo a los radiólogos obtener segmentaciones en tiempo real durante la lectura de estudios.
- Educación médica: el modelo puede servir como herramienta didáctica para enseñar anatomía radiológica, mostrando cómo diferentes prompts clínicos afectan la segmentación resultante.

## Benchmarks y rendimiento

Los resultados presentados a continuación provienen de las ablaciones publicadas en la model card, evaluadas sobre el cohorte de validación de TotalSegmentator para el bazo tras 30 épocas de entrenamiento.

| Estrategia de fusion | DSC pico | NSD pico | DSC final (epoca 30) | NSD final (epoca 30) | VRAM pico |
|---|---|---|---|---|---|
| Fusion temprana | 0.8622 | 0.7928 | 0.8196 | 0.7514 | < 4.3 GB |
| Fusion en todas las etapas | 0.8619 | 0.7871 | 0.7737 | 0.6848 | < 4.3 GB |
| Fusion tardia | 0.8576 | 0.7675 | 0.7347 | 0.6095 | < 4.3 GB |

| Configuracion de perdida | DSC pico | NSD pico | DSC final (epoca 30) | NSD final (epoca 30) |
|---|---|---|---|---|
| Focal loss (50:50) | 0.8627 | 0.7827 | 0.8045 | 0.7195 |
| BCE estandar (50:50) | 0.8619 | 0.7871 | 0.7737 | 0.6848 |
| Perdida dinamica (80:20 a 65:35) | 0.8537 | 0.7668 | 0.8280 | 0.7299 |
| Focal loss (80:20) | 0.7827 | 0.6821 | 0.7358 | 0.6393 |

| Operacion de fusion | DSC pico | NSD pico | DSC final (epoca 30) | NSD final (epoca 30) |
|---|---|---|---|---|
| Multiplicacion | 0.8619 | 0.7871 | 0.7737 | 0.6848 |
| Concatenacion | 0.8381 | 0.7647 | 0.8120 | 0.7387 |
| Hibrida | 0.8152 | 0.7301 | 0.7962 | 0.7041 |

| Encoder de texto | DSC pico | NSD pico | DSC final (epoca 30) | NSD final (epoca 30) |
|---|---|---|---|---|
| CLIP | 0.8622 | 0.7928 | 0.8196 | 0.7514 |
| BioBERT | 0.8466 | 0.7584 | 0.7968 | 0.7148 |

| Nivel de prompt | Descripcion clinica | DSC pico |
|---|---|---|
| Tier N | Nombre del organo (ej. "spleen") | 0.8620 |
| Tier NS | Nombre + sinonimo (ej. "spleen, lien") | 0.8621 |
| Tier NL | Nombre + localizacion (ej. "spleen in left upper quadrant") | 0.8624 |
| Tier NSL | Nombre + sinonimo + localizacion (ej. "spleen, lien in upper left abdomen") | 0.8622 |

No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 4.3 GB durante la validacion, lo que permite ejecutar el modelo en GPUs de consumo con 6 GB o mas de memoria.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. Tambien compatible con GPUs de datacenter como A100 o H100, aunque no son necesarias.
- El modelo cabe en GPUs de consumo de gama media, siendo accesible para estaciones de trabajo clinicas o portatiles con GPU dedicada.
- Opciones de despliegue: el repositorio proporciona codigo Python con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no se han publicado datos especificos. Dado el tamano del backbone (~1.87 M parametros) y la complejidad lineal, se espera una inferencia rapida en volumenes de 64x128x128, aunque no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros (backbone) | Contexto | Rendimiento (DSC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PromptM-UNet | ~1.87 M | Volumetrico 3D | 0.862 (bazo) | Apache 2.0 | Codigo abierto en GitHub y HuggingFace |
| nnU-Net (3D) | ~30 M (estimado) | Volumetrico 3D | No disponible | Apache 2.0 | Codigo abierto |
| SegVol | ~100 M (estimado) | Volumetrico 3D | No disponible | No disponible | No disponible |

PromptM-UNet es significativamente mas ligero que nnU-Net y SegVol, con un rendimiento comparable en la tarea de segmentacion del bazo. Sin embargo, no se dispone de datos de benchmarks publicos que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la segmentacion del bazo en CT. No se garantiza su rendimiento en otros organos o modalidades de imagen sin reentrenamiento o fine-tuning.
- La robustez a prompts se evaluo solo con descripciones en ingles; no se ha probado con otros idiomas.
- No se han documentado sesgos especificos, pero al entrenarse en un unico cohorte (TotalSegmentator) puede haber sesgos relacionados con la demografia de los pacientes o la calidad de las imagenes.
- El riesgo de alucinacion no aplica directamente, pero la segmentacion puede fallar en casos con anatomias atipicas o artefactos de imagen.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el modelo en el entorno clinico especifico antes de su despliegue en produccion.
- No se proporcionan datos sobre latencia en entornos de tiempo real, por lo que su uso en aplicaciones interactivas requiere pruebas adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/Kiuyha/PromptM-UNet
- Repositorio GitHub: https://github.com/kiuyha/PromptM-UNet
- Paper arXiv (PromptM-UNet): https://arxiv.org/abs/2511.11450
- Paper arXiv (LightM-UNet, base del backbone): https://arxiv.org/abs/2311.13385
