# mariakrissmer/ALIAS-MG

## Resumen

ALIAS-MG es un modelo de embeddings de frases (sentence-similarity) desarrollado por Maria Krissmer y publicado bajo la etiqueta `MG` en el manuscrito ALIAS. Se trata de un encoder basado en BERT, inicializado a partir de `NeuML/pubmedbert-base-embeddings` y afinado para proyectar descripciones de celulas y texto biomedico en un espacio vectorial compartido. Su proposito es permitir la comparacion semantica entre anotaciones de tipos celulares (por ejemplo, "CD8 T cell" frente a "cytotoxic T lymphocyte") y literatura cientifica.

El modelo cuenta con 109.482.240 parametros y se distribuye en formato safetensors bajo la libreria `sentence-transformers`, con un tamano de repositorio de 0,4 GB. Esta pensado exclusivamente para uso en investigacion exploratoria; el autor indica explicitamente que no ha sido validado para uso clinico. Su relevancia radica en la creciente necesidad de alinear vocabularios heterogeneos en biologia de celula unica con texto libre de la literatura, una tarea donde los embeddings generalistas rinden peor que los especializados en dominio biomedico.

La ficha se basa unicamente en la informacion disponible en la model card y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks ni detalles cuantitativos del entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder) |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Modelo base | NeuML/pubmedbert-base-embeddings |
| ID interno | MP_LaManno_S10_N5_lr5e5 |
| Etiqueta en manuscrito | MG |
| Tamano del repositorio | 0,4 GB |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

ALIAS-MG es un encoder transformer de tipo BERT afinado con la libreria `sentence-transformers` para producir embeddings de frases comparables mediante similitud coseno. Parte de `NeuML/pubmedbert-base-embeddings`, un modelo derivado de PubMedBERT especializado en texto biomedico, lo que le aporta un vocabulario y una representacion previa del dominio medico antes del ajuste fino.

Segun la model card, el entrenamiento utiliza dos conjuntos de datos: `S10_heldout_timepoint_semantic` y `N5_ncbi_literature`. El identificador interno `MP_LaManno_S10_N5_lr5e5` sugiere una tasa de aprendizaje de 5e-5 y la combinacion de ambos datasets (S10 y N5), aunque no se detallan el numero de tokens, la composicion exacta del corpus, el uso de RLHF/DPO ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. No se dispone de informacion sobre la funcion de perdida especifica (por ejemplo, contrastiva o triplet) empleada en el ajuste.

## Capacidades

- Generacion de embeddings de frases y textos cortos para similitud semantica (pipeline `sentence-similarity`).
- Representacion de descripciones de tipos celulares y anotaciones de biologia de celula unica en un espacio vectorial compartido con texto biomedico.
- Alineacion semantica entre vocabulario de anotaciones celulares y literatura cientifica (NCBI).
- Recuperacion semantica y busqueda por similitud sobre corpus biomedicos.
- Agrupamiento (clustering) y deduplicacion de terminos y descripciones biologicas equivalentes.
- No soporta tool calling ni function calling (es un encoder, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo base es de dominio ingles biomedico.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Normalizacion de anotaciones de celula unica: agrupar etiquetas equivalentes de tipos celulares (por ejemplo, "CD8 T cell" y "cytotoxic T lymphocyte") calculando la similitud coseno entre sus embeddings y fusionando clusters por umbral, lo que reduce la heterogeneidad de anotaciones entre estudios.
- Busqueda semantica en literatura biomedica: indexar resumenes o pasajes de NCBI y recuperar los mas proximos a una descripcion celular dada, aprovechando el ajuste sobre `N5_ncbi_literature`.
- Enriquecimiento de anotaciones: dada una poblacion celular descrita en un articulo, recuperar terminos estandarizados de ontologias mediante vecinos mas cercanos en el espacio de embeddings.
- Deduplicacion de catalogos de tipos celulares: detectar entradas redundantes en bases de datos de anotaciones comparando distancias entre embeddings.
- Construccion de grafos de similitud entre poblaciones celulares: usar los embeddings como nodos y la similitud coseno como arista para analisis exploratorio de relaciones entre tipos celulares.
- Evaluacion de coherencia semantica en pipelines de anotacion automatica: comparar la salida de un anotador con descripciones de referencia mediante similitud de embeddings como metrica auxiliar de calidad.
- Prototipado de sistemas de recomendacion de literatura: sugerir articulos relevantes a partir de una descripcion textual de un cluster celular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (109,5 M de parametros), mas overhead de activaciones y tokenizador; en la practica, menos de 1 GB para lotes pequenos.
- VRAM estimada en FP16: aproximadamente 0,22 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes y permiten lotes grandes.
- Cabe holgadamente en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para lotes moderados.
- Opciones de despliegue: `sentence-transformers` (nativo), Text Embeddings Inference (tag `text-embeddings-inference`), y compatibilidad con endpoints. No se indica soporte explicito de vLLM, llama.cpp u Ollama (son entornos orientados a modelos generativos, no a este encoder).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALIAS-MG | 109,5 M | no disponible | Biomedico / celula unica | MIT | Hugging Face |
| NeuML/pubmedbert-base-embeddings | no disponible | no disponible | Biomedico | Apache 2.0 | Hugging Face |
| PubMedBERT (base) | ~110 M (tipico) | no disponible | Biomedico | no disponible en la informacion | Hugging Face / Microsoft |
| Sentence-transformers generalistas (p. ej. all-MiniLM) | ~22 M (tipico) | no disponible | General | no disponible en la informacion | Hugging Face |

La comparacion se limita a lo que puede inferirse de la informacion disponible; no se dispone de datos de rendimiento comparativo entre estos modelos. ALIAS-MG se distingue por su ajuste especifico sobre descripciones de celula unica y literatura NCBI, mientras que su modelo base y PubMedBERT cubren texto biomedico general.

## Limitaciones y advertencias

- Modelo destinado a investigacion exploratoria; el autor indica explicitamente que no ha sido validado para uso clinico.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de similitudes espurias entre terminos biologicamente distintos al usar umbrales de coseno.
- Sesgos potenciales derivados del corpus de entrenamiento (literatura NCBI y dataset S10), no documentados en detalle.
- Idiomas soportados no disponibles; el modelo base es de dominio ingles biomedico, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Longitud de contexto no disponible; los encoders BERT suelen limitarse a 512 tokens, pero no se confirma en la informacion.
- La licencia MIT del modelo convive con la licencia Apache 2.0 del modelo base; el autor incluye el texto de la licencia upstream, pero conviene revisar obligaciones de atribucion en uso comercial.
- Sin descargas ni likes en el momento de la consulta y con fecha de creacion futura en los metadatos (2026-11-08), lo que sugiere un repositorio muy reciente o no consolidado; la madurez y el soporte de la comunidad son limitados.
- No se documentan procesos de evaluacion de sesgos ni de robustez.

## Enlaces

- [Hugging Face: mariakrissmer/ALIAS-MG](https://huggingface.co/mariakrissmer/ALIAS-MG)
- [Modelo base: NeuML/pubmedbert-base-embeddings](https://huggingface.co/NeuML/pubmedbert-base-embeddings)
- [Repositorio de reproducibilidad del manuscrito ALIAS](https://github.com/MariaKrissmer/alias/tree/manuscript-reproducibility)
- [Libreria sentence-transformers](https://www.sbert.net/)
