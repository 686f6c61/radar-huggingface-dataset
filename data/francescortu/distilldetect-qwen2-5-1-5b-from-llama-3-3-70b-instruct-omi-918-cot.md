# francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT

## Resumen

DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT es una reproducción no oficial de un modelo estudiante destilado a partir del trabajo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El objetivo del paper es detectar si un texto ha sido generado por un modelo de lenguaje (detección de destilación), y los autores publicaron el código y los datos generados por el profesor, pero no los checkpoints del estudiante. Este repositorio, creado por francescortu, reentrena de forma independiente un modelo Qwen2.5-1.5B usando las respuestas generadas por el profesor nvidia/Llama-3.3-70B-Instruct-NVFP8 sobre 918 prompts de OpenMathInstruct-2 con plantilla OMI-COT.

El modelo resultante es un fine-tune del Qwen2.5-1.5B, con 1.543.714.304 parámetros, y se distribuye bajo licencia Apache-2.0. Su relevancia radica en que proporciona un checkpoint público para una tarea de detección de texto sintético, un área de creciente interés en seguridad y verificación de contenido. Sin embargo, al ser una reproducción no verificada por los autores originales, su rendimiento real no ha sido evaluado públicamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-1.5B, un transformer decoder-only denso. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) siguiendo la receta del Apéndice A del paper: 3 épocas, tasa de aprendizaje 1e-5, programación coseno con 5% de warmup, batch efectivo de 16 (per-device batch 4 con grad-accum 4), tamaño de bloque 4096, precisión bf16, gradient checkpointing y pérdida calculada únicamente sobre los tokens de respuesta (el prompt se enmascara con -100). Los datos de entrenamiento consisten en 918 respuestas generadas por el profesor Llama-3.3-70B-Instruct-NVFP8, distribuidas por los autores del paper bajo licencia MIT. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales.

## Capacidades

- Detección de texto generado por LLM: el propósito principal del modelo, según el paper de referencia, es identificar si una respuesta ha sido producida por un modelo de lenguaje (detección de destilación).
- Generación de texto: al estar basado en Qwen2.5-1.5B, hereda capacidades de generación de lenguaje, aunque el fine-tune puede haberlas modificado.
- Razonamiento matemático: los datos de entrenamiento provienen de OpenMathInstruct-2, por lo que podría tener cierta competencia en problemas matemáticos, aunque no hay evidencia publicada.
- Multilingüismo: el modelo base Qwen2.5 soporta múltiples idiomas, pero no se especifica si el fine-tune conserva esta capacidad.
- Tool calling y agentes: no se ha documentado soporte para estas funcionalidades en la información disponible.

## Casos de uso

- Detección de contenido generado por IA en entornos educativos: el modelo podría integrarse en sistemas de verificación de originalidad para identificar respuestas automáticas en exámenes o trabajos, aunque no se han publicado métricas de eficacia.
- Auditoría de datasets: podría utilizarse para filtrar muestras sintéticas en conjuntos de datos de entrenamiento, ayudando a mantener la calidad y evitar contaminación.
- Moderación de contenido en foros y redes sociales: para detectar y marcar publicaciones generadas por bots o asistentes automáticos.
- Verificación de originalidad en publicaciones académicas: como herramienta de apoyo en la revisión por pares para señalar posibles textos generados por LLMs.
- Investigación en detección de destilación: sirve como punto de referencia para comparar métodos de detección, dado que es un checkpoint público de un modelo estudiante.
- Desarrollo de sistemas de seguridad: para identificar intentos de suplantación o generación automática de contenido malicioso en plataformas digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones de GSM8K y MATH500 están en proceso y se añadirán posteriormente.

## Requisitos de hardware

- No se han publicado requisitos específicos para este modelo.
- Dado su tamaño de 1.5B parámetros, es probable que pueda ejecutarse en GPUs consumer con al menos 4 GB de VRAM en cuantización de 4 bits, aunque no hay cuantizaciones oficiales disponibles.
- Para inferencia en precisión completa (bf16), se estima un consumo de aproximadamente 3 GB de VRAM, lo que permitiría su uso en GPUs como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: al ser un modelo Qwen2.5, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su funcionamiento en estos entornos.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de detección de destilación. El modelo base Qwen2.5-1.5B es un LLM de propósito general, pero este fine-tune está especializado en una tarea concreta. No se han encontrado otros checkpoints públicos del mismo tipo en la información proporcionada.

## Limitaciones y advertencias

- Reproducción no oficial: no está afiliada a los autores del paper y no ha sido validada por ellos.
- Sin resultados de evaluación: no hay benchmarks publicados, por lo que se desconoce su rendimiento real en la tarea de detección.
- Datos de entrenamiento limitados: solo 918 ejemplos, lo que puede limitar la generalización a dominios fuera de OpenMathInstruct-2.
- Posibles sesgos: el modelo puede heredar sesgos del profesor (Llama-3.3-70B) y del dataset de entrenamiento.
- Licencia: Apache-2.0 para el modelo, pero los datos de entrenamiento se redistribuyen bajo MIT según el repositorio de los autores; es necesario verificar los términos de uso combinados.
- No se especifican limitaciones de contexto o idioma, pero al ser un fine-tune pequeño, es probable que tenga un rendimiento inferior al modelo base en tareas generales.

## Enlaces

- HuggingFace: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT
- Paper: https://arxiv.org/abs/2607.09692
- Repositorio de los autores: https://github.com/RajatRawat-creator/DistillDetect
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
