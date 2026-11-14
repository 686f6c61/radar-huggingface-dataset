# kokitabayashi/bge_qlora_finmodern_pair_merged

## Resumen

`kokitabayashi/bge_qlora_finmodern_pair_merged` es un modelo de embeddings de frases (sentence-similarity) derivado de la familia BGE-M3 de BAAI. Se distribuye como un checkpoint fusionado de tipo `sentence-transformers` sobre una base XLM-RoBERTa, con 567.754.752 parámetros totales (aproximadamente 568 M) y un tamaño de repositorio de 1,2 GB en formato safetensors. El autor del artefacto es el usuario `kokitabayashi`, mientras que la arquitectura y el pipeline subyacentes provienen del proyecto FlagEmbedding.

El modelo hereda la propuesta de valor de BGE-M3: recuperación densa, multi-vector y dispersa en un único encoder, soporte multilingüe amplio y una longitud de secuencia de hasta 8192 tokens. El nombre del checkpoint sugiere un ajuste fino con QLoRA sobre pares (pair) y una fusión posterior de pesos, aunque la model card publicada no documenta el procedimiento de entrenamiento específico ni los datos empleados en ese ajuste.

Es relevante ahora porque los pipelines RAG en producción demandan embeddings multilingües con contexto largo y recuperación híbrida, y este checkpoint se presenta como una variante afinada de BGE-M3 con licencia MIT, lo que facilita su integración comercial. No obstante, al no haber publicado benchmarks propios, su rendimiento real frente al BGE-M3 original debe validarse empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa adaptado, base de BGE-M3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (heredado de BGE-M3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card de este checkpoint; la base BGE-M3 declara más de 100 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1024 (según especificaciones de BGE-M3) |
| Pipeline | sentence-similarity |
| Libreria | sentence-transformers |
| Tamano del repositorio | 1,2 GB |
| Fecha de creacion | 2026-11-14 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer de tipo XLM-RoBERTa, extendido a una longitud máxima de 8192 tokens y preentrenado con RetroMAE en la cadena BGE-M3 (`bge-m3-retromae` → `bge-m3-unsupervised` → `bge-m3`). BGE-M3 se distingue por un ajuste fino unificado que produce simultáneamente representaciones densas, multi-vector (estilo ColBERT) y dispersas (pesos tipo BM25) a partir de una sola pasada del encoder. El checkpoint aquí descrito es una fusión de pesos (`merged`) tras un ajuste con QLoRA sobre pares, según indica su nombre.

La model card publicada no detalla el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta la receta exacta de QLoRA (rango, alpha, módulos objetivo) ni el criterio de fusión. Los únicos datos de entrenamiento referenciados son los del proyecto original: el dataset `bge-m3-data` y el corpus MLDR, que cubre 13 idiomas para recuperación de documentos largos.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para similitud semántica y recuperación.
- Recuperación dispersa con pesos por token, obtenibles sin coste adicional a partir de la misma pasada que genera el embedding denso.
- Recuperación multi-vector (estilo ColBERT) para re-puntuación fina de pasajes.
- Procesamiento de entradas de hasta 8192 tokens, desde frases cortas hasta documentos largos.
- Capacidad multilingüe heredada de BGE-M3 (más de 100 idiomas según la documentación del proyecto original; no verificado para este checkpoint).
- Integración con `sentence-transformers` y con Text Embeddings Inference (tag `text-embeddings-inference`).
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni modos de pensamiento.

## Casos de uso

- Recuperación híbrida en RAG: combinar el embedding denso y los pesos dispersos del modelo con BM25 en motores como Milvus o Vespa, tal como recomienda la documentación de BGE-M3, para mejorar la precisión en corpus con terminología específica.
- Búsqueda semántica multilingüe: indexar documentos en varios idiomas y consultar en otro distinto, aprovechando la cobertura lingüística de la base XLM-RoBERTa.
- Recuperación sobre documentos largos: indexar contratos, informes o artículos de hasta 8192 tokens sin fragmentación agresiva, útil en dominios legales y técnicos.
- Re-puntuación de candidatos: usar la salida multi-vector como segunda fase tras una recuperación densa inicial, filtrando los pasajes más relevantes antes de pasarlos a un LLM generador.
- Deduplicación y clustering de textos: calcular similitudes entre pares de documentos para agrupar contenido redundante en pipelines de curación de datos.
- Clasificación zero-shot por similitud: comparar embeddings de textos con descripciones de categorías para etiquetado sin entrenamiento supervisado adicional.
- Sistemas de recomendación de contenido: medir proximidad semántica entre ítems y perfiles de usuario en feeds de noticias o catálogos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card únicamente reproduce la documentación general de BGE-M3 y no incluye métricas propias del ajuste QLoRA ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (568 M de parámetros), más activaciones y buffers; en la práctica, 4-6 GB para lotes pequeños con contexto largo.
- VRAM estimada en fp16/bf16: aproximadamente 1,2 GB para pesos; 3-4 GB con overhead de inferencia.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para indexación a gran escala con contexto de 8192 tokens, se recomiendan A100 o H100 por ancho de banda de memoria.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, y exportación a ONNX para servir con infraestructura propia.
- Latencia y throughput: no disponibles; dependen del hardware, la longitud de secuencia y el tamaño de lote. Con contexto de 8192 tokens, la latencia por documento es notablemente superior a la de modelos con ventanas de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Notas |
|---|---|---|---|---|---|
| kokitabayashi/bge_qlora_finmodern_pair_merged | 568 M | 8192 | 1024 | MIT | Checkpoint fusionado tras QLoRA; sin benchmarks publicados |
| BAAI/bge-m3 | 568 M | 8192 | 1024 | MIT | Modelo base oficial; recuperación densa, dispersa y multi-vector; benchmarks publicados en el paper |
| BAAI/bge-m3-unsupervised | 568 M | 8192 | 1024 | MIT | Etapa intermedia de entrenamiento contrastivo |
| BAAI/bge-large-en-v1.5 | 335 M | 512 | 1024 | MIT | Solo inglés; contexto corto |

## Limitaciones y advertencias

- No se han publicado benchmarks del checkpoint; el rendimiento real frente a BAAI/bge-m3 es desconocido y podría ser inferior si el ajuste QLoRA introdujo sobreajuste o degradación.
- La model card no documenta los datos de ajuste, lo que impide evaluar sesgos introducidos por el corpus de pares utilizado.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos en similitud: embeddings de textos no relacionados pueden puntuar alto en dominios especializados.
- La cobertura de idiomas no está verificada para este checkpoint concreto; se asume la de BGE-M3, pero no hay confirmación del autor.
- Licencia MIT permite uso comercial, pero el usuario debe verificar que los datos de ajuste no impongan restricciones adicionales no declaradas.
- El checkpoint tiene 0 descargas y 0 likes, sin validación comunitaria; no se recomienda para producción sin una evaluación propia en el dominio objetivo.
- La longitud efectiva de contexto puede degradarse en los extremos de la ventana de 8192 tokens, como es habitual en encoders XLM-RoBERTa extendidos.
- No es un modelo generativo: no debe usarse para tareas de generación, tool calling ni razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kokitabayashi/bge_qlora_finmodern_pair_merged
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Paper BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Paper XLM-RoBERTa: https://arxiv.org/abs/2004.04906
- Paper RetroMAE: https://arxiv.org/abs/2106.14807
- Paper DPR: https://arxiv.org/abs/2004.04906
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
- Dataset bge-m3-data: https://huggingface.co/datasets/Shitao/bge-m3-data
- Ejemplo de recuperación híbrida en Milvus: https://github.com/milvus-io/pymilvus/blob/master/examples/hello_hybrid_sparse_dense.py
- Notebook de Vespa para BGE-M3: https://github.com/vespa-engine/pyvespa/blob/master/docs/sphinx/source/examples/mother-of-all-embedding-models-cloud.ipynb
