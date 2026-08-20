# darelphilip/hinglish-toxicity-roberta

## Resumen

El modelo `hinglish-toxicity-roberta` es un clasificador de texto fine-tuneado a partir de `l3cube-pune/hing-roberta`, un modelo de lenguaje preentrenado específicamente para el hinglish (mezcla de hindi e inglés). Desarrollado por el usuario `darelphilip`, este modelo tiene como objetivo detectar contenido tóxico en textos escritos en hinglish, un idioma muy común en redes sociales y foros de la India. Con 278 millones de parámetros, se trata de un modelo de tamaño medio que puede ejecutarse en GPUs de consumo moderado.

La relevancia de este modelo radica en la escasez de herramientas de moderación de contenido adaptadas a lenguas mezcladas como el hinglish, donde los clasificadores entrenados solo en inglés o solo en hindi suelen fallar. Aunque la model card es muy escueta y no detalla el dataset de entrenamiento ni las métricas de evaluación completas, los resultados reportados indican una precisión del 44 % y un recall del 74 % en el conjunto de validación, lo que sugiere un sesgo hacia la detección de más casos (menos falsos negativos) a costa de más falsos positivos.

El modelo se distribuye bajo licencia CC-BY-4.0, lo que permite uso comercial con atribución. Está disponible en formato safetensors y es compatible con la librería Transformers de Hugging Face, así como con la inferencia de embeddings de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (RoBERTa) - fine-tune de `l3cube-pune/hing-roberta` |
| Parametros totales | 278.049.031 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | hinglish (hindi e inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `l3cube-pune/hing-roberta`, que a su vez es un modelo basado en la arquitectura XLM-RoBERTa, un transformer multilingüe preentrenado con 278 millones de parámetros. El fine-tuning se realizó sobre un dataset no especificado en la model card, con un objetivo de clasificación de toxicidad (probablemente binario o multiclase, aunque no se detalla). Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 3e-5, batch size de 8 (con acumulación de gradientes de 2, dando un batch efectivo de 16), optimizador AdamW, scheduler lineal con 500 pasos de warmup y 3 épocas. Se usó precisión mixta (AMP) durante el entrenamiento.

No se mencionan innovaciones técnicas destacables más allá del fine-tuning estándar. El modelo base `hing-roberta` fue entrenado por el grupo L3Cube-Pune con datos en hinglish, pero no se proporcionan detalles sobre el corpus de preentrenamiento.

## Capacidades

- Clasificación de toxicidad en texto hinglish: detecta si un texto contiene lenguaje ofensivo, abusivo o dañino.
- Procesamiento de lenguaje mezclado hindi-inglés, incluyendo transliteraciones y código alternado (code-switching).
- Salida de clasificación binaria o multiclase (no especificado en la model card).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.
- No se indica soporte para otros idiomas más allá del hinglish.

## Casos de uso

- Moderación de comentarios en redes sociales: plataformas como Twitter, Facebook o foros indios pueden integrar este modelo para filtrar automáticamente comentarios tóxicos en hinglish, reduciendo la carga de moderadores humanos.
- Filtrado de contenido en aplicaciones de mensajería: servicios como WhatsApp o Telegram pueden usar el modelo para detectar y bloquear mensajes abusivos en tiempo real.
- Análisis de sentimiento y toxicidad en encuestas o reseñas de productos: empresas que recopilan opiniones de usuarios en hinglish pueden clasificar si los comentarios son tóxicos y tomar medidas.
- Investigación académica sobre toxicidad en lenguas de bajos recursos: el modelo sirve como punto de partida para estudios sobre detección de discurso de odio en hinglish.
- Sistemas de recomendación de contenido seguro: plataformas de video o streaming pueden usar el modelo para etiquetar contenido generado por usuarios que contenga lenguaje tóxico.
- Herramientas de monitoreo de marca: agencias de marketing pueden analizar menciones de marcas en redes sociales en hinglish para identificar interacciones tóxicas y responder adecuadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de validación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss (validación) | 0.7698 |
| Macro F1 | 0.5388 |
| Micro F1 | 0.6376 |
| Precision | 0.4402 |
| Recall | 0.7391 |

Estos valores corresponden a la segunda época (la mejor según la tabla de entrenamiento). No hay comparación con otros modelos ni resultados en conjuntos de prueba estándar como Jigsaw o HateSpeech.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 278M parámetros en precisión FP32, requiere aproximadamente 1.1 GB de VRAM solo para los pesos. Con activaciones y overhead, se recomienda al menos 2-3 GB de VRAM para inferencia en batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o GPUs de datacenter como T4 o A10. En CPU también es viable para inferencia en lote pequeño.
- Cabe en GPUs de consumo: sí, en GPUs con 4 GB o más.
- Opciones de despliegue: compatible con Hugging Face Transformers, puede servirse con Text Generation Inference (TGI) o como endpoint de clasificación con FastAPI. También se puede exportar a ONNX para optimización.
- Latencia y throughput: no disponible, pero para un modelo de este tamaño, la inferencia en GPU suele ser de unos pocos milisegundos por muestra.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `hinglish-toxicity-roberta` (este) | 278M | hinglish | no disponible | CC-BY-4.0 | Fine-tune de hing-roberta |
| `s-nlp/roberta_toxicity_classifier` | ~125M | inglés | 512 tokens | MIT | Entrenado con datos de Jigsaw, AUC 0.98 |
| `unitary/unbiased-toxic-roberta` | ~125M | inglés | 512 tokens | Apache-2.0 | Entrenado con datos de Jigsaw, reduce sesgos |

La comparación directa no es posible porque los otros modelos están entrenados para inglés, mientras que este se centra en hinglish. No hay modelos comparables de toxicidad en hinglish disponibles públicamente en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica qué datos se usaron para el fine-tuning, lo que dificulta evaluar su generalización y posibles sesgos.
- Rendimiento moderado: con una precisión del 44 % y un recall del 74 %, el modelo tiende a clasificar muchos textos como tóxicos (falsos positivos), lo que puede ser problemático en aplicaciones de moderación donde se requiere precisión.
- Sesgos potenciales: al estar entrenado en un corpus no documentado, puede reflejar sesgos de género, casta o religión presentes en los datos de entrenamiento.
- Limitación de idioma: solo funciona con hinglish; no es útil para otros idiomas o variantes.
- Contexto limitado: no se especifica la longitud máxima de entrada, pero al ser un modelo RoBERTa, probablemente sea de 512 tokens, lo que limita el análisis de textos largos.
- Licencia CC-BY-4.0: permite uso comercial, pero requiere atribución al autor. No hay restricciones adicionales conocidas.
- Sin garantías de producción: al ser un modelo generado automáticamente con una model card incompleta, se recomienda validar su comportamiento en el dominio de aplicación antes de usarlo en entornos críticos.

## Enlaces

- [Hugging Face - darelphilip/hinglish-toxicity-roberta](https://huggingface.co/darelphilip/hinglish-toxicity-roberta)
- [Modelo base: l3cube-pune/hing-roberta](https://huggingface.co/l3cube-pune/hing-roberta)
- [s-nlp/roberta_toxicity_classifier](https://huggingface.co/s-nlp/roberta_toxicity_classifier)
- [unitary/unbiased-toxic-roberta](https://huggingface.co/unitary/unbiased-toxic-roberta)
- [Artículo sobre detección de toxicidad en hinglish con XLM-RoBERTa](https://jcoms.fesb.unist.hr/pdfs/v21n4_2025-0133_Singhal.pdf)
