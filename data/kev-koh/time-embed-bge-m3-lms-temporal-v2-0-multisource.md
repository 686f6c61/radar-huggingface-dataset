# kev-KOH/time-embed-bge-m3-lms-temporal-v2-0-multisource

## Resumen

El modelo `kev-KOH/time-embed-bge-m3-lms-temporal-v2-0-multisource` es un fine-tuning del modelo de embeddings multilingüe `BAAI/bge-m3`, desarrollado por el autor kev-KOH, orientado a la recuperación temporal de información en coreano dentro de entornos LMS (Learning Management System). El objetivo es que el modelo distinga entre expresiones temporales relativas (como "hace una semana") y la intención de búsqueda subyacente, mejorando la precisión en consultas que dependen del contexto temporal.

Se trata de un modelo de investigación que no modifica la arquitectura ni la función de pérdida del modelo base, sino que mejora la composición de los datos de entrenamiento. El entrenamiento se realizó con 234.296 filas agrupadas, combinando un inventario temporal coreano, datos reales de consultas LMS y un conjunto de control de intención. El checkpoint seleccionado es el paso 1250, con una tasa de aprendizaje de 1e-6 y precisión BF16.

La relevancia actual radica en la creciente necesidad de sistemas de búsqueda semántica que comprendan expresiones temporales en dominios específicos como plataformas educativas, donde los usuarios suelen buscar materiales según su fecha de publicación o caducidad. El modelo está publicado con licencia MIT y es compatible con la librería `transformers` y `FlagEmbedding`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en BAAI/bge-m3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BGE-M3, hasta 8192 tokens, pero no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en BF16 durante entrenamiento) |
| Idiomas soportados | coreano (principal), herencia multilingüe de BGE-M3 no confirmada |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `BAAI/bge-m3`, un modelo de embeddings que soporta simultáneamente recuperación densa, multi-vector y sparse, y que trabaja con más de 100 idiomas. En este fine-tuning, la arquitectura y la función de pérdida no se modifican; solo se ajusta la composición de los datos de entrenamiento. El conjunto de datos consta de 234.296 filas agrupadas, distribuidas en tres fuentes: un inventario temporal coreano (120.000 filas), datos reales de consultas LMS (54.296 filas) y un conjunto de control de intención LMS (60.000 filas). Cada paso de entrenamiento usa una consulta, un positivo y siete negativos (`train_group_size=8`). El entrenamiento se realizó con una tasa de aprendizaje de 1e-6, tamaño de batch por dispositivo de 1, acumulación de gradientes de 32, precisión BF16, gradient checkpointing activado y semilla 42. El hardware utilizado fue una RTX 4070 Ti SUPER de 16 GB. El checkpoint seleccionado corresponde al paso 1250. Se garantiza que no hay solapamiento entre los datos de evaluación (Dev/Test) y los de entrenamiento.

## Capacidades

- Generación de embeddings densos para recuperación semántica, con especialización en expresiones temporales relativas en coreano.
- Distinción entre intención de búsqueda temporal y consultas generales, gracias al entrenamiento con control de intención LMS.
- Compatible con el framework `FlagEmbedding` para su uso directo con `BGEM3FlagModel`.
- Al estar basado en BGE-M3, hereda la capacidad de generar representaciones densas, multi-vector y sparse, aunque no se especifica si este fine-tuning conserva todas las funcionalidades.
- Soporte de entrada para textos en coreano; el comportamiento en otros idiomas no está documentado.
- Adecuado para tareas de retrieval en dominios educativos donde la fecha de publicación o vigencia es relevante.

## Casos de uso

- Búsqueda de materiales educativos por fecha: un estudiante puede consultar "encuentra los apuntes subidos hace una semana" y el modelo recupera los documentos correctos según su marca temporal.
- Filtrado de anuncios o avisos en plataformas LMS: permite buscar comunicaciones publicadas en un rango temporal concreto, como "avisos de la semana pasada".
- Recuperación de tareas o entregas con plazo: consultas como "tareas que vencen esta semana" se resuelven mediante la combinación de intención temporal y semántica.
- Asistentes virtuales en entornos educativos: integración en chatbots que responden a preguntas sobre contenido reciente en cursos.
- Indexación de foros o discusiones con relevancia temporal: búsqueda de hilos o mensajes según su antigüedad, útil para moderación o análisis.
- Sistemas de recomendación de contenido: priorizar materiales recientes en función de la consulta del usuario, mejorando la experiencia en plataformas de e-learning.

## Benchmarks y rendimiento

Los resultados publicados en la model card se presentan en tres bloques:

**Temporal Dev**

| Metrica | Resultado |
|---|---:|
| Pairwise accuracy | 0.951020 |
| Margin p10 | 0.109466 |
| Hard-negative violation rate | 0.048980 |
| Random-pair p95 | 0.576171 |
| Near-one rate | 0.014184 |

**One-time frozen Inventory Test**

| Metrica | Resultado |
|---|---:|
| Pairwise accuracy | 0.972028 |
| Margin mean | 0.293959 |
| Margin p10 | 0.115584 |
| Hard-negative violation rate | 0.027972 |
| Random-pair p95 | 0.542047 |
| Near-one rate | 0.013530 |

**Semantic retention versus Base** (delta respecto a BAAI/bge-m3)

| Tarea | Delta |
|---|---:|
| LMS intent delta | +0.159000 |
| KLUE-STS delta | +0.003883 |
| KorSTS delta | +0.011948 |
| KLUE-NLI delta | +0.030642 |
| SQuADKorV1 Retrieval delta | -0.013460 |

Estos datos indican una mejora significativa en la intención LMS (+0.159) y una ligera mejora en tareas semánticas coreanas, con una pequeña degradación en recuperación de SQuADKorV1 (-0.013). No se proporcionan comparativas con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion, pero al ser un modelo basado en BGE-M3 (que tiene alrededor de 568M parametros), se puede inferir que requiere al menos 2-4 GB en cuantizacion FP16, aunque no se confirma.
- GPU recomendada: la model card menciona RTX 4070 Ti SUPER 16GB para entrenamiento; para inferencia, una GPU con al menos 8 GB de VRAM seria suficiente, pero no se especifica.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado del modelo base, pero no hay confirmacion explicita.
- Opciones de despliegue: compatible con `FlagEmbedding`, `transformers` y `sentence-transformers`; se puede servir con `text-embeddings-inference` (segun tags) o con vLLM si se adapta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. El autor ha publicado otros fine-tunings del mismo base (v1-7-2 y phase2-41) pero no se ofrecen metricas comparativas. Se puede mencionar que el modelo base BGE-M3 es una referencia comun para embeddings multilingües, pero no hay una comparacion cuantitativa directa.

## Limitaciones y advertencias

- El modelo está especializado en coreano y en el dominio LMS; su rendimiento en otros idiomas o dominios no está evaluado.
- La degradación en SQuADKorV1 Retrieval (-0.013) sugiere una ligera perdida de capacidad de recuperación general, que debe tenerse en cuenta si se usa fuera del ámbito temporal.
- Los resultados de evaluación se basan en conjuntos propios del autor; no hay benchmarks estandarizados publicados.
- No se incluyen artefactos de evaluacion (test congelado, ejemplos privados) en el repositorio, lo que dificulta la reproducibilidad independiente.
- La licencia MIT permite uso comercial, pero el modelo se publica como "investigación" y no se garantiza su robustez en produccion.
- No se documentan sesgos especificos, pero al entrenarse con datos coreanos de LMS, puede reflejar sesgos del dominio educativo coreano.
- El tamaño del contexto no se especifica; se recomienda verificar el limite heredado de BGE-M3 (8192 tokens) antes de usarlo con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kev-KOH/time-embed-bge-m3-lms-temporal-v2-0-multisource
- Versiones anteriores del mismo autor:
  - https://huggingface.co/kev-KOH/time-embed-bge-m3-lms-temporal-v1-7-2
  - https://huggingface.co/kev-KOH/time-embed-bge-m3-lms-temporal-phase2-41
- Documentación de BGE-M3 (modelo base): https://bge-model.com/bge/bge_m3.html
- Repositorio de referencia de BGE-M3: https://github.com/inferless/Bge-m3
