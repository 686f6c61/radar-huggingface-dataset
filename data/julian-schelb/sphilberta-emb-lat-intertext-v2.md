# julian-schelb/sphilberta-emb-lat-intertext-v2

## Resumen

El modelo `julian-schelb/sphilberta-emb-lat-intertext-v2` es un modelo de embeddings de frases (sentence embeddings) diseñado específicamente para detectar relaciones intertextuales en literatura latina clásica. Desarrollado por Julian Schelb y colaboradores en el marco del benchmark Loci Similes, este modelo es un ajuste fino (fine-tuning) de `bowphs/SPhilBerta`, una variante de RoBERTa adaptada al latín. Su objetivo es representar textos latinos en un espacio vectorial de 768 dimensiones donde la similitud coseno refleja la proximidad intertextual, permitiendo identificar pasajes paralelos o influencias entre autores como Virgilio, Ovidio o Jerónimo.

El modelo se entrena con una pérdida contrastiva en línea (online contrastive loss) sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes, que contiene pares de textos verificados por expertos. Con aproximadamente 135 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Su relevancia actual radica en que ofrece una solución específica para una tarea de humanidades digitales que carecía de herramientas de PLN adaptadas, y se integra con el paquete Python `locisimiles` para pipelines de recuperación y clasificación.

La versión v2 reemplaza a la v1 como reemplazo directo (drop-in), manteniendo la misma interfaz y tarea, pero entrenada sobre una revisión más reciente del conjunto de datos. El modelo requiere el uso de prefijos de prompt (`"Query: "` y `"Candidate: "`) para obtener un rendimiento óptimo en tareas de recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa adaptada al latín, base `bowphs/SPhilBerta`) |
| Parametros totales | 135.194.112 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (probablemente 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantización no documentada) |
| Idiomas soportados | Latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `bowphs/SPhilBerta`, un modelo de tipo RoBERTa preentrenado específicamente para latín clásico. Sobre esta base, se realiza un ajuste fino con una pérdida contrastiva en línea (online contrastive loss) para la tarea de similitud de frases. El entrenamiento se lleva a cabo sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes, que incluye pares de pasajes intertextuales verificados por expertos, junto con ejemplos negativos. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni la composición completa del dataset, pero se sabe que el corpus está disponible en HuggingFace (`julian-schelb/latin-classical-intertextuality-corpus`).

Una innovación clave es el uso de prefijos de prompt durante el entrenamiento y la inferencia. El modelo distingue entre consultas (textos de Jerónimo, por ejemplo) y candidatos (autores clásicos), lo que mejora notablemente la calidad de la recuperación si se respetan estos prefijos. La arquitectura no presenta innovaciones estructurales más allá del ajuste específico para la intertextualidad latina.

## Capacidades

- Genera embeddings densos de 768 dimensiones para frases o párrafos en latín, optimizados para similitud semántica y detección de intertextualidad.
- Soporta dos modos de prompt: `"Query: "` para textos de consulta (por ejemplo, pasajes de Jerónimo) y `"Candidate: "` para textos candidatos (autores clásicos), lo que permite una recuperación más precisa.
- Compatible con la biblioteca `sentence-transformers` y con el paquete `locisimiles` para pipelines de recuperación y clasificación.
- No es un modelo generativo: no genera texto, solo produce representaciones vectoriales.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente de embeddings.

## Casos de uso

- **Detección de intertextualidad en literatura latina**: el modelo permite identificar pasajes paralelos entre autores clásicos (por ejemplo, Virgilio y Ovidio) a partir de similitud coseno entre embeddings, facilitando estudios filológicos y de influencia literaria.
- **Búsqueda semántica en corpus latinos**: se puede indexar un corpus completo de textos latinos (por ejemplo, la obra de Cicerón o Tito Livio) y realizar consultas en lenguaje natural para encontrar pasajes temáticamente relacionados, sin depender de coincidencias léxicas exactas.
- **Análisis de fuentes y tradición textual**: investigadores pueden rastrear cómo un autor posterior (como Jerónimo) reutiliza o adapta frases de autores anteriores, lo que ayuda a reconstruir cadenas de transmisión cultural.
- **Clasificación de pares de textos**: combinado con un modelo clasificador (como los `*-3class-lat-intertext-v1` de la misma colección), el embedding sirve como entrada para distinguir entre relaciones intertextuales reales, coincidencias casuales y no-relaciones.
- **Integración en pipelines de humanidades digitales**: el modelo se usa dentro del paquete `locisimiles`, que ofrece una API Python para encontrar enlaces intertextuales, permitiendo a filólogos sin experiencia en PLN aplicar estas técnicas en sus flujos de trabajo.
- **Estudio de estilos y métricas de similitud**: al comparar embeddings de diferentes autores o épocas, se pueden cuantificar distancias estilísticas y detectar patrones de imitación o alusión, útil para estudios cuantitativos de literatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo forma parte del benchmark Loci Similes, evaluado sobre enlaces intertextuales verificados por expertos, pero no se proporcionan métricas numéricas (como precisión, recall o NDCG) en la documentación accesible. Se recomienda consultar el artículo arXiv (2601.07533) para futuros detalles.

## Requisitos de hardware

- Al ser un modelo de 135 millones de parámetros, su huella de memoria es reducida. Para inferencia en GPU, se estima que necesita menos de 1 GB de VRAM en precisión FP32, y aún menos en FP16 o con cuantización.
- Puede ejecutarse en GPU de consumo como NVIDIA GTX 1060, RTX 2060 o superiores, así como en CPU (aunque con mayor latencia).
- No se requieren GPUs de datacenter (A100, H100) para este modelo.
- Opciones de despliegue: compatible con `sentence-transformers`, `text-embeddings-inference` (según tags) y `endpoints_compatible`. También puede usarse con `Ollama` o `llama.cpp` si se convierte a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por lote en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `julian-schelb/sphilberta-emb-lat-intertext-v2` | 135M | No disponible | Embeddings para intertextualidad latina | Apache 2.0 | HuggingFace |
| `bowphs/SPhilBerta` (modelo base) | 135M | No disponible | Modelo de lenguaje enmascarado para latín | Apache 2.0 | HuggingFace |
| `julian-schelb/sphilberta-emb-lat-intertext-v1` | 135M | No disponible | Embeddings para intertextualidad latina (versión anterior) | Apache 2.0 | HuggingFace |
| `LaBSE` (multilingüe) | 471M | 512 tokens | Embeddings multilingües | Apache 2.0 | HuggingFace |

La comparación con LaBSE es orientativa: aunque LaBSE cubre muchos idiomas, no está especializado en latín clásico ni en intertextualidad, por lo que su rendimiento en esta tarea específica sería previsiblemente inferior. No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está entrenado exclusivamente para detectar intertextualidad en latín clásico. No es adecuado para otras tareas de PLN en latín (como análisis morfológico o generación de texto) ni para otros idiomas.
- **Dependencia de prompts**: si no se utilizan los prefijos `"Query: "` y `"Candidate: "` durante la inferencia, la calidad de la recuperación disminuye notablemente, como se advierte en la documentación.
- **Sesgos del corpus**: el entrenamiento se basa en autores clásicos y en las anotaciones de expertos, lo que puede reflejar los sesgos de selección de esos textos y de las interpretaciones filológicas subyacentes.
- **Riesgo de alucinación**: no aplica, ya que el modelo no genera texto, solo produce embeddings. Sin embargo, la similitud coseno puede producir falsos positivos en pasajes que comparten vocabulario pero no tienen relación intertextual real.
- **Contexto limitado**: no se especifica la longitud máxima de secuencia, pero al derivar de RoBERTa, probablemente sea de 512 tokens. Textos más largos deberán truncarse o segmentarse.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, siempre que se mantenga el aviso de copyright y se indiquen los cambios si se modifica el modelo.

## Enlaces

- [HuggingFace: julian-schelb/sphilberta-emb-lat-intertext-v2](https://huggingface.co/julian-schelb/sphilberta-emb-lat-intertext-v2)
- [HuggingFace: modelo base bowphs/SPhilBerta](https://huggingface.co/bowphs/SPhilBerta)
- [HuggingFace: versión v1 del modelo](https://huggingface.co/julian-schelb/SPhilBerta-emb-lat-intertext-v1)
- [HuggingFace: clasificador asociado (ejemplo)](https://huggingface.co/julian-schelb/SPhilBerta-latin-intertextuality-v1)
- [arXiv: artículo Loci Similes (2601.07533)](https://arxiv.org/abs/2601.07533)
- [Documentación de la API LociSimiles](https://julianschelb.github.io/locisimiles/api/)
- [Paquete Python locisimiles en PyPI](https://pypi.org/project/locisimiles/)
- [GitHub de Julian Schelb](https://github.com/julianschelb)
