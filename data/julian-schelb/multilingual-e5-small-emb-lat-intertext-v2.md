# julian-schelb/multilingual-e5-small-emb-lat-intertext-v2

## Resumen

El modelo `julian-schelb/multilingual-e5-small-emb-lat-intertext-v2` es un ajuste fino (fine-tune) del modelo `intfloat/multilingual-e5-small` orientado a generar embeddings de textos latinos para detectar relaciones intertextuales entre autores clásicos. Desarrollado por Julian Schelb como parte del benchmark **Loci Similes** (Schelb et al., 2026), este modelo está diseñado para identificar pasajes paralelos o alusiones en la literatura latina, una tarea fundamental en filología clásica y humanidades digitales. Con 117,6 millones de parámetros, se basa en la arquitectura BERT multilingüe de E5-small y se entrena con una pérdida contrastiva online sobre un corpus de intertextualidades verificadas por expertos. Su relevancia radica en ofrecer una herramienta específica y eficiente para la búsqueda semántica en latín, un dominio lingüístico con pocos recursos y alta demanda en investigación académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT) basado en `intfloat/multilingual-e5-small` |
| Parametros totales | 117.653.760 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | Latin (la) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-small`, un transformer BERT con 12 capas, 12 cabezas de atención y 117 millones de parámetros, preentrenado en múltiples idiomas. Sobre esta base se realiza un ajuste fino con **online contrastive loss**, una variante de pérdida contrastiva que optimiza la similitud coseno entre pares de pasajes intertextuales positivos y negativos. El entrenamiento utiliza uno de los cinco splits de validación cruzada del benchmark **Loci Similes**, que incluye etiquetas de intertextualidad verificadas por expertos en autores clásicos latinos (como Virgilio, Ovidio, César o Jerónimo). El modelo se entrena con prefijos de prompt específicos: `"Query: "` para consultas y `"Candidate: "` para textos candidatos, lo que mejora significativamente la calidad de recuperación. La versión v2 sustituye a la v1, con el mismo interfaz y tarea, siendo un reemplazo directo.

## Capacidades

- Generación de embeddings de similitud semántica para textos latinos, permitiendo comparar pasajes mediante similitud coseno.
- Detección de intertextualidad: identifica alusiones, citas o paralelismos entre autores latinos clásicos.
- Soporte de prefijos de prompt diferenciados para consultas y candidatos, optimizando la recuperación en pipelines de búsqueda.
- Integración nativa con el paquete Python **LociSimiles**, que ofrece APIs para búsqueda y análisis de intertextualidad.
- Compatible con la librería `sentence-transformers` y con el formato `text-embeddings-inference` para despliegue en producción.
- Capacidad multilingüe heredada del modelo base, aunque el ajuste se centra exclusivamente en latín.
- No incluye generación de texto, tool calling ni capacidades de agente; su función es puramente de representación vectorial.

## Casos de uso

- **Investigacion filologica**: permite a los estudiosos localizar pasajes paralelos entre autores latinos (p. ej., identificar de dónde tomó Virgilio una metáfora) mediante búsqueda por similitud coseno sobre corpus completos.
- **Analisis de fuentes y tradicion textual**: al comparar un fragmento de un autor tardío con la obra de autores anteriores, se pueden rastrear influencias y dependencias literarias.
- **Construccion de bases de datos de loci similes**: el modelo puede procesar grandes corpus latinos para generar índices automáticos de pasajes relacionados, ahorrando horas de trabajo manual a los editores de ediciones críticas.
- **Sistema de recomendacion de lecturas**: en plataformas educativas de latín, se pueden sugerir pasajes relacionados con un texto dado para enriquecer el estudio contextual.
- **Verificacion de citas y referencias**: en trabajos académicos, ayuda a confirmar si una frase atribuida a un autor aparece realmente en su obra o en otra fuente.
- **Integracion en pipelines de humanidades digitales**: combinado con un clasificador (como los modelos `*-3class-lat-intertext-v1` del mismo autor), puede filtrar y clasificar candidatos intertextuales antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo forma parte del benchmark Loci Similes, pero no se proporcionan métricas numéricas (p. ej., precision, recall o nDCG) en la documentación accesible.

## Requisitos de hardware

- Al tratarse de un modelo de 117 millones de parámetros, la inferencia es ligera y puede ejecutarse en CPU con memoria RAM suficiente (menos de 1 GB de pesos en FP32).
- Para GPU, cualquier tarjeta con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) puede procesar embeddings por lotes sin problemas.
- El modelo es adecuado para entornos sin GPU, ya que la codificación de frases cortas es rápida incluso en procesadores convencionales.
- Opciones de despliegue: compatible con `sentence-transformers` (Python), `text-embeddings-inference` (servidor de embeddings) y el paquete LociSimiles.
- Para corpus grandes, se recomienda precalcular los embeddings de los candidatos y almacenarlos en memoria o en una base de datos vectorial (p. ej., FAISS) para acelerar la búsqueda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `julian-schelb/multilingual-e5-small-emb-lat-intertext-v2` (este) | 117,6 M | no disponible | Intertextualidad latina (fine-tune) | Apache-2.0 | HuggingFace |
| `julian-schelb/multilingual-e5-small-emb-lat-intertext-v1` | 117,6 M | no disponible | Intertextualidad latina (fine-tune, versión anterior) | Apache-2.0 | HuggingFace |
| `intfloat/multilingual-e5-small` (base) | 117,6 M | 512 (conocido, no en info) | Embeddings multilingües generales | MIT | HuggingFace |

El modelo se diferencia del base por su especialización en latín y su entrenamiento específico para intertextualidad. Frente a v1, v2 ofrece un ajuste sobre una revisión más reciente del dataset, manteniendo el mismo interfaz.

## Limitaciones y advertencias

- **Especializacion limitada**: el modelo solo está entrenado para latín clásico; su rendimiento en latín medieval o vulgar no está garantizado.
- **Dependencia de prefijos**: si no se usan los prefijos `"Query: "` y `"Candidate: "` correctamente, la calidad de recuperación disminuye notablemente.
- **Sesgos del corpus**: el entrenamiento se basa en un split de validación cruzada del benchmark Loci Similes, que puede no representar toda la variedad de estilos o autores latinos.
- **Sin generacion de texto**: no es un modelo generativo; no puede producir respuestas o explicaciones, solo representaciones vectoriales.
- **Datos de contexto no especificados**: la longitud máxima de secuencia no se indica en la documentación, por lo que se recomienda verificar el comportamiento con frases largas.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías sobre la exactitud de las detecciones.
- **En fase de investigacion**: al ser parte de un trabajo académico (arXiv 2601.07533), puede haber cambios en versiones futuras.

## Enlaces

- [HuggingFace del modelo v2](https://huggingface.co/julian-schelb/multilingual-e5-small-emb-lat-intertext-v2)
- [HuggingFace del modelo v1](https://huggingface.co/julian-schelb/multilingual-e5-small-emb-lat-intertext-v1)
- [Paquete LociSimiles en PyPI](https://pypi.org/project/locisimiles/)
- [Repositorio GitHub de LociSimiles](https://github.com/julianschelb/locisimiles)
- [Documentacion de LociSimiles (ejemplos)](https://julianschelb.github.io/locisimiles/examples/)
- [Perfil del autor en HuggingFace](https://huggingface.co/julian-schelb/models)
- [Paper arXiv (2601.07533)](https://arxiv.org/abs/2601.07533)
