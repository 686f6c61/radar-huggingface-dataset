# finvector/bge_qlora_finmodern_tri_merged

## Resumen

`finvector/bge_qlora_finmodern_tri_merged` es un modelo de embeddings de frases (sentence-transformers) publicado por el usuario finvector, construido sobre la familia BGE-M3 de BAAI. Se trata de un merge de adaptadores QLoRA orientado a recuperación de información en el dominio financiero ("finmodern"), con pipeline declarado `sentence-similarity` y arquitectura base XLM-RoBERTa. El repositorio tiene 567.754.752 parámetros en safetensors y ocupa 1,2 GB, lo que corresponde a la variante base de BGE-M3 en precisión de 16 bits.

El modelo hereda la propuesta de BGE-M3: recuperación densa, multi-vector (ColBERT) y dispersa (sparse, tipo BM25) en un mismo encoder, con soporte declarado de más de 100 idiomas y entradas de hasta 8192 tokens. Sobre esa base, el autor ha aplicado un ajuste QLoRA y un merge posterior de pesos, presumiblemente para adaptar el espacio de embeddings a vocabulario y documentos financieros. No obstante, la model card publicada es prácticamente idéntica a la de BAAI/bge-m3 y no documenta el proceso de ajuste ni los datos utilizados.

La relevancia práctica es doble: por un lado, ofrece una alternativa de embeddings multilingües de contexto largo para pipelines RAG; por otro, al ser un derivado no documentado de BGE-M3, su adopción en producción exige validación empírica propia, ya que no hay benchmarks publicados ni métricas de recuperación específicas del dominio financiero. La licencia MIT facilita el uso comercial, pero la ausencia de evaluación es un riesgo a cubrir con pruebas internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) con cabezas densa, sparse y multi-vector; base BGE-M3 |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (según la model card heredada de BGE-M3) |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan GGUF/ONNX) |
| Idiomas soportados | más de 100 idiomas según la model card de BGE-M3; idiomas concretos del ajuste no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder XLM-RoBERTa con la longitud máxima extendida a 8192 tokens mediante preentrenamiento RetroMAE, tal como describe la familia BGE-M3. Sobre ese encoder, BGE-M3 aplica un ajuste unificado que produce simultáneamente representaciones densas (un vector de 1024 dimensiones), dispersas (pesos por token tipo BM25) y multi-vector (estilo ColBERT), lo que permite combinar recuperación léxica y semántica sin coste adicional de inferencia. El modelo original se entrena con aprendizaje contrastivo y datos multilingües, incluyendo el conjunto MLDR de recuperación de documentos largos en 13 idiomas.

En el caso de este repositorio, el nombre indica un ajuste con QLoRA seguido de un merge de pesos ("tri_merged"), presumiblemente combinando tres adaptadores o tres etapas de entrenamiento. Sin embargo, la model card no aporta detalles sobre el dataset financiero utilizado, el número de tokens de entrenamiento, la configuración de LoRA (rango, alpha, módulos objetivo), la función de pérdida ni si hubo etapas de contraste duro o destilación. Tampoco se documenta si el merge preserva las cabezas sparse y multi-vector o solo la densa. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para similitud semántica y recuperación.
- Recuperación dispersa (sparse) con pesos por token, utilizable como alternativa o complemento a BM25.
- Recuperación multi-vector (ColBERT) para re-ranking fino a nivel de token.
- Procesamiento de entradas largas de hasta 8192 tokens, adecuado para documentos completos.
- Multilingüismo heredado de BGE-M3 (más de 100 idiomas declarados).
- Compatibilidad con `sentence-transformers`, `text-embeddings-inference` y endpoints compatibles.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; se usa como componente de recuperación dentro de pipelines RAG.

## Casos de uso

- Búsqueda semántica en documentación financiera: indexar informes anuales, notas de prensa y filings con embeddings densos de 1024 dimensiones y consultas en lenguaje natural, aprovechando la ventana de 8192 tokens para secciones extensas.
- Recuperación híbrida en RAG: combinar la salida sparse (pesos tipo BM25) con la densa en un motor como Milvus o Vespa para mejorar el recall en consultas con terminología técnica y jerga financiera.
- Re-ranking de resultados: usar la representación multi-vector para reordenar los documentos recuperados en una primera fase, reduciendo falsos positivos antes de pasarlos al LLM generador.
- Clasificación y deduplicación de documentos: calcular similitud entre comunicados, contratos o prospectos para detectar duplicados o agrupar temáticamente.
- Asistencia a analistas: motor de búsqueda interna sobre bases de conocimiento regulatorias y financieras, con soporte multilingüe para equipos en distintas geografías.
- Evaluación de similitud de pares: comparar preguntas de clientes con respuestas de un FAQ financiero para enrutamiento automático o detección de consultas repetidas.
- Filtrado previo en pipelines de compliance: recuperar cláusulas o menciones relevantes en grandes volúmenes de texto antes de una revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reproduce la información general de BGE-M3 (incluida la mención a resultados en MIRACL y a una comparativa externa frente a OpenAI), pero no aporta métricas propias del ajuste financiero ni de este merge concreto. Cualquier cifra de rendimiento debe obtenerse mediante evaluación propia sobre el corpus objetivo (por ejemplo, recall@k y nDCG sobre un conjunto de validación interno).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en fp16 para los pesos; entre 2 y 4 GB en la práctica según tamaño de lote y longitud de secuencia.
- En cuantización de 8 bits, el modelo ronda los 0,6 GB de pesos; en 4 bits, unos 0,3 GB, aunque no se publican artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna sirve para lotes pequeños; para indexación a gran escala se recomiendan A100, H100, L40S o RTX 4090.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más (RTX 3060, 4060, 4070, etc.), con margen para lotes moderados.
- Opciones de despliegue: `sentence-transformers`, `text-embeddings-inference` (tag declarado), vLLM con soporte de embeddings, Hugging Face Inference Endpoints y servidores compatibles con la API de embeddings.
- Latencia y throughput: no disponibles; dependerán del hardware, la longitud de secuencia y el modo (denso, sparse, multi-vector). El modo multi-vector incrementa el coste de almacenamiento y de puntuación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades de recuperación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finvector/bge_qlora_finmodern_tri_merged | 567,7 M | 8192 | densa, sparse, multi-vector (heredadas) | MIT | Hugging Face |
| BAAI/bge-m3 | 567,7 M | 8192 | densa, sparse, multi-vector | MIT | Hugging Face |
| BAAI/bge-large-en-v1.5 | ~335 M | 512 | densa | MIT | Hugging Face |
| intfloat/multilingual-e5-large | ~560 M | 512 | densa | MIT | Hugging Face |

La comparativa se basa en las especificaciones publicadas de cada familia; no hay datos de rendimiento del modelo de finvector que permitan una comparación cuantitativa. Frente a `bge-large-en-v1.5` y `multilingual-e5-large`, la ventaja estructural es la ventana de 8192 tokens y la recuperación híbrida; la desventaja es la falta de evaluación pública del ajuste financiero.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el proceso de ajuste: no se conocen los datos, la configuración QLoRA ni el método de merge, lo que impide reproducir o auditar el modelo.
- Sin benchmarks publicados: no hay evidencia de que el ajuste financiero mejore a BGE-M3 original; podría incluso degradar el rendimiento general por olvido catastrófico.
- Riesgo de sesgo de dominio: al estar ajustado (presumiblemente) a textos financieros, su comportamiento en otros dominios puede ser inferior al del modelo base.
- Idiomas del ajuste no especificados: el multilingüismo declarado corresponde a BGE-M3, no necesariamente al modelo fusionado.
- Riesgo de alucinación indirecta: como componente de recuperación, un mal ranking propaga errores al LLM generador; conviene combinarlo con re-ranking y validación.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin comunidad ni informes de uso que respalden su calidad.
- Fecha de creación futura en los metadatos (2026-11-20), lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/bge_qlora_finmodern_tri_merged
- Repositorio FlagEmbedding: https://github.com/FlagOpen/FlagEmbedding
- Paper BGE-M3: https://arxiv.org/pdf/2402.03216.pdf
- Código BGE-M3: https://github.com/FlagOpen/FlagEmbedding/tree/master/FlagEmbedding/BGE_M3
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Dataset MLDR: https://huggingface.co/datasets/Shitao/MLDR
- Dataset de ajuste bge-m3-data: https://huggingface.co/datasets/Shitao/bge-m3-data
- Ejemplo de recuperación híbrida en Milvus: https://github.com/milvus-io/pymilvus/blob/master/examples/hello_hybrid_sparse_dense.py
- Notebook de Vespa para BGE-M3: https://github.com/vespa-engine/pyvespa/blob/master/docs/sphinx/source/examples/mother-of-all-embedding-models-cloud.ipynb
- Paper DPR: https://arxiv.org/abs/2004.04906
- Paper RetroMAE: https://arxiv.org/abs/2106.14807
