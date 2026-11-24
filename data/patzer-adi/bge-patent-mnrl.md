# patzer-adi/bge-patent-mnrl

## Resumen

`patzer-adi/bge-patent-mnrl` es un modelo de embeddings de frases (sentence embeddings) especializado en similitud semantica de documentos de patentes. Se construye mediante fine-tuning del modelo base `BAAI/bge-base-en-v1.5`, una arquitectura BERT de 109 millones de parametros, sobre un conjunto de datos de aproximadamente 39.291 pares de ejemplos de patentes. El autor es `patzer-adi`, un usuario individual de Hugging Face, y el modelo se publico en noviembre de 2026.

El modelo resuelve el problema de recuperacion y comparacion semantica de documentos tecnicos de patente, donde el vocabulario altamente especializado y las formulaciones legales hacen que los embeddings genericos rindan por debajo de lo deseable. Al estar afinado con `MultipleNegativesRankingLoss`, esta optimizado para tareas de ranking y recuperacion densa (dense retrieval), lo que lo hace util para busquedas de similitud entre titulos y resumenes de patentes.

Su relevancia actual radica en la explosion de aplicaciones de busqueda semantica sobre corpus de propiedad intelectual, donde se necesita un modelo ligero (0,4 GB) que pueda desplegarse en infraestructura modesta y que entienda la jerga tecnica de las patentes. No obstante, la informacion publica disponible es muy limitada: no se especifican licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), fine-tuned desde BAAI/bge-base-en-v1.5 |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base bge-base-en-v1.5 soporta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar de sentence-transformers) |
| Idiomas soportados | no disponible (el modelo base es predominantemente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible (el modelo base bge-base-en-v1.5 produce 768 dimensiones) |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 39.291 ejemplos |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT estandar del modelo base `BAAI/bge-base-en-v1.5`, un transformer encoder de 12 capas y 109 millones de parametros, adaptado para generar embeddings densos de frases. El fine-tuning se realizo con la libreria `sentence-transformers` y la funcion de perdida `MultipleNegativesRankingLoss`, que entrena el modelo para acercar embeddings de pares positivos y alejar los negativos dentro del mismo batch. Esta funcion es especialmente adecuada para tareas de recuperacion y ranking.

El conjunto de entrenamiento consta de 39.291 ejemplos, presumiblemente pares de documentos de patentes (titulo + resumen) relacionados semanticamente. No se dispone de informacion detallada sobre la composicion del dataset, el numero de tokens de entrenamiento, si se aplicaron tecnicas de RLHF o DPO, ni sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El modelo se genero con la libreria `sentence-transformers` y esta etiquetado como `generated_from_trainer`.

## Capacidades

- Generacion de embeddings densos para similitud semantica entre textos.
- Recuperacion densa (dense retrieval) y ranking de documentos.
- Extraccion de caracteristicas (feature extraction) para clasificacion y clustering.
- Especializacion en dominio de patentes: titulos y resumenes tecnicos.
- Soporte de similitud semantica entre frases y documentos largos (hasta el limite del modelo base).
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face.
- No se ha documentado soporte de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Busqueda semantica de patentes: el modelo permite indexar titulos y resumenes de patentes y recuperar documentos similares a una consulta, superando la busqueda por palabras clave gracias a su fine-tuning en el dominio.
- Deteccion de duplicados y familias de patentes: al comparar embeddings de documentos, se pueden agrupar patentes que describen la misma invencion con formulaciones distintas.
- Clasificacion tematica de patentes: los embeddings sirven como entrada para clasificadores que asignan codigos CPC o IPC a documentos nuevos.
- Sistemas de recomendacion de propiedad intelectual: dado un documento de interes, el modelo recupera patentes relacionadas para abogados y examinadores.
- Analisis de paisaje tecnologico (patent landscaping): clustering de miles de patentes para identificar areas de innovacion y competidores.
- Enriquecimiento de pipelines de busqueda existentes: integracion como modelo de re-ranking en sistemas de recuperacion hibrida (BM25 + denso).
- Moderacion y filtrado de contenido tecnico: deteccion de similitud entre solicitudes de patente para evitar infracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en FP32 (109M parametros), menos de 0,2 GB en FP16 o cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (TEI), Hugging Face Inference Endpoints, `transformers` con pooling manual, y potencialmente `llama.cpp` si se convierte a GGUF (aunque no es el flujo habitual para BERT).
- Latencia y throughput estimados: no disponibles, pero al ser un modelo BERT base, se espera un throughput alto (cientos de frases por segundo en GPU moderna) y latencia de milisegundos por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| patzer-adi/bge-patent-mnrl | 109M | no disponible (base: 512) | no disponible | Patentes | Hugging Face |
| BAAI/bge-base-en-v1.5 | 109M | 512 | MIT | Generalista | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 | Apache 2.0 | Generalista | Hugging Face |
| BAAI/bge-large-en-v1.5 | 335M | 512 | MIT | Generalista | Hugging Face |

El modelo se posiciona como una alternativa especializada frente a los embeddings generalistas, con un tamano manejable y un fine-tuning orientado a patentes. Sin embargo, la falta de benchmarks publicados impide comparar su rendimiento real frente a alternativas.

## Limitaciones y advertencias

- No se ha especificado la licencia, lo que impide conocer si se permite uso comercial; se debe contactar con el autor antes de usarlo en produccion.
- No se han documentado los idiomas soportados; el modelo base es predominantemente ingles, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Riesgo de alucinacion: como modelo de embeddings, no genera texto, pero puede producir similitudes erroneas si los documentos de patente son muy tecnicos o usan terminologia no vista en entrenamiento.
- Sesgos potenciales derivados del dataset de patentes (posible sobrerrepresentacion de ciertos dominios tecnicos o jurisdicciones).
- La longitud de contexto no esta confirmada; si se hereda del modelo base, se limita a 512 tokens, insuficiente para documentos de patente completos.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido validado por la comunidad.
- No se han publicado resultados de evaluacion, por lo que su calidad real en tareas de recuperacion es desconocida.
- El autor es un particular, sin garantias de mantenimiento o soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/patzer-adi/bge-patent-mnrl)
- [Modelo base BAAI/bge-base-en-v1.5](https://huggingface.co/BAAI/bge-base-en-v1.5)
- [Paper de MultipleNegativesRankingLoss (arXiv:1908.10084)](https://arxiv.org/abs/1908.10084)
- [Paper de Sentence-BERT (arXiv:1807.03748)](https://arxiv.org/abs/1807.03748)
- [Documentacion de sentence-transformers](https://www.sbert.net/)
