# aswath86/neural-sparse-encoding-splare-multilingual-v1

## Resumen

neural-sparse-encoding-splare-multilingual-v1 es un modelo de recuperación dispersa aprendida (learned sparse retrieval) multilingüe, desarrollado por el usuario aswath86, diseñado para integrarse en OpenSearch como motor de búsqueda neuronal. Se construye como un adaptador LoRA sobre el modelo base Qwen/Qwen3-1.7B-Base y utiliza la técnica SPLARE (descrita en el paper arXiv:2603.13277), que combina un autoencoder disperso congelado (Qwen/SAE-Res-Qwen3-1.7B-Base-W32K-L0_100) con el estado residual de la capa 10 del transformer para producir un vector disperso de 32.768 dimensiones por texto.

El problema que resuelve es la recuperación cross-lingual eficiente: al compartir el mismo espacio de características entre idiomas, una consulta en un idioma puede recuperar documentos en otro sin necesidad de traducción intermedia. Frente al modelo de referencia de OpenSearch (opensearch-neural-sparse-encoding-multilingual-v1), mejora notablemente el rendimiento cross-lingual (0,639 frente a 0,300 en XPQA cross-lingual) manteniendo cifras competitivas en recuperación monolingüe.

Es relevante porque ofrece una alternativa basada en un LLM moderno (Qwen3-1.7B) con licencia Apache 2.0, despliegue tanto en GPU como en CPU mediante un archivo ONNX int8, y una huella de memoria moderada (aproximadamente 2 GB en GPU bf16 y 0,9 GB en CPU int8), lo que facilita su adopción en infraestructuras de búsqueda existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) con adaptador LoRA + autoencoder disperso (SAE) congelado; pooling de 32.768 características dispersas |
| Parametros totales | 0,98B utilizados en GPU bf16; 0,93B en CPU int8 ONNX (backbone Qwen3-1.7B-Base, SAE y adaptador LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite del modelo ONNX en CPU); no se especifica un límite distinto para la versión PyTorch |
| Tipos de cuantizacion | bf16 (GPU), fp32 (CPU con PyTorch), int8 (ONNX para CPU) |
| Idiomas soportados | ar, bn, de, en, es, fa, fi, fr, hi, id, ja, ko, ru, sw, te, th, vi, zh (18 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y backbone), ONNX (modelo int8 para CPU) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B-Base, un transformer decoder de 28 capas. El adaptador LoRA se entrena para que el estado residual de la capa 10 alimente el autoencoder disperso congelado Qwen/SAE-Res-Qwen3-1.7B-Base-W32K-L0_100, que proyecta la representación en 32.768 características dispersas. Estas características se agrupan (pooling) en un único vector disperso por texto, de modo que cada documento y cada consulta quedan representados por un conjunto de pesos sobre el mismo vocabulario de características. En inferencia solo se utilizan 12 de las 28 capas del backbone y la mitad codificadora del SAE, lo que reduce el coste computacional.

El entrenamiento sigue la metodología SPLARE (arXiv:2603.13277) y emplea el dataset aswath86/neural-sparse-encoding-splare-multilingual-v1-training-data. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de recuperación). La innovación principal es el uso compartido de características entre idiomas a través del SAE, lo que habilita la recuperación cross-lingual sin alineamiento explícito, y la posibilidad de servir el modelo tanto en GPU como en CPU con cuantización int8.

## Capacidades

- Generación de representaciones dispersas para recuperación de información (feature extraction), no es un modelo generativo de texto.
- Recuperación cross-lingual: consultas en un idioma recuperan documentos en otro gracias al espacio de características compartido.
- Recuperación monolingüe en 18 idiomas: ar, bn, de, en, es, fa, fi, fr, hi, id, ja, ko, ru, sw, te, th, vi, zh.
- Producción de vectores dispersos compatibles con el campo `rank_features` de OpenSearch y con consultas `neural_sparse`.
- Integración con ml-commons de OpenSearch para indexación y búsqueda mediante pipelines de ingesta.
- Inferencia en GPU (bf16, PyTorch) y en CPU (ONNX int8), con latencias y throughput documentados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; su función es exclusivamente la codificación dispersa para búsqueda.

## Casos de uso

- Búsqueda empresarial multilingüe: indexar documentación interna en varios idiomas y permitir consultas en el idioma del usuario recuperando resultados en cualquier idioma soportado, gracias al espacio de características compartido del SAE.
- Atención al cliente con base de conocimiento: codificar artículos de ayuda y preguntas frecuentes como vectores dispersos en un índice `rank_features` de OpenSearch, de modo que las consultas de los usuarios recuperen respuestas relevantes con latencia de 32 ms en GPU o 19 ms en CPU.
- Comercio electrónico internacional: buscar productos por descripción en un idioma y recuperar listados en otro, usando el modelo en modo CPU int8 para reducir costes de infraestructura en picos de tráfico.
- Búsqueda legal o regulatoria: recuperar fragmentos normativos en distintos idiomas dentro de un corpus multilingüe, aprovechando la ventana de 512 tokens para pasajes y la capacidad cross-lingual para consultas en el idioma del analista.
- Indexación de documentación técnica: procesar lotes de pasajes (hasta 32 por petición) con un throughput de 246 respuestas por segundo en GPU para ingerir grandes volúmenes en OpenSearch.
- Sistemas de recuperación aumentada (RAG) multilingüe: usar el modelo como recuperador disperso en la primera fase de un pipeline RAG, combinándolo con un reranker posterior, para consultas en español que deban recuperar fuentes en inglés, francés o alemán.
- Migración desde el modelo de referencia de OpenSearch: sustituir opensearch-neural-sparse-encoding-multilingual-v1 en despliegues existentes para mejorar la recuperación cross-lingual (0,639 frente a 0,300 en XPQA cross-lingual) manteniendo la compatibilidad con `rank_features`.

## Benchmarks y rendimiento

Resultados de nDCG@10 medidos a través de OpenSearch. XPQA y MLQA son fuera de dominio; MIRACL es en dominio. Los pares same-language tienen consulta y pasajes en el mismo idioma; los cross-lingual, en dos idiomas distintos.

| Modelo | XPQA same-language | XPQA cross-lingual | MIRACL | MLQA same-language | MLQA cross-lingual |
|---|---:|---:|---:|---:|---:|
| Este modelo, GPU (bf16) | 0,648 | 0,639 | 0,724 | 0,590 | 0,561 |
| Este modelo, CPU (int8 ONNX) | 0,643 | 0,635 | 0,723 | 0,574 | 0,543 |
| opensearch-neural-sparse-encoding-multilingual-v1 | 0,614 | 0,300 | 0,734 | 0,528 | 0,188 |

Velocidad de codificación (una instancia):

| Métrica | GPU bf16 (SageMaker ml.g5.xlarge) | CPU int8 ONNX (8 núcleos de EC2 m7i.4xlarge) |
|---|---:|---:|
| Consulta, mediana | 32 ms | 19 ms |
| Consultas por segundo | 36 | 54 |
| Pasajes MLQA por segundo, uno por petición | 32 | 12 |
| Pasajes MLQA por segundo, lotes de 32 | 21 | 12 |
| Respuestas XPQA por segundo, lotes de 32 | 246 | 45 |

Tamaño comparado con opensearch-neural-sparse-encoding-multilingual-v1 (mlv1) en modo solo documentos:

| Métrica | Este modelo, GPU (bf16) | Este modelo, CPU (int8 ONNX) | mlv1 |
|---|---:|---:|---:|
| Parámetros utilizados | 0,98B | 0,93B | 168M |
| Descarga | 4,0 GB (backbone 3,4 GB, SAE 537 MB, adaptador 51 MB) | 935 MB | 670 MB |
| Pesos en memoria | ~2,0 GB | ~0,9 GB | ~0,7 GB |
| Modelo en tiempo de consulta | sí | sí | no (analizador mbert-uncased) |

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 2,0 GB de pesos en bf16, más overhead de activaciones y del runtime de PyTorch; se recomienda al menos 8 GB de VRAM para operar con comodidad.
- GPU recomendadas: NVIDIA A100, H100, L4, T4 o RTX 4090; los resultados de velocidad se midieron en una instancia SageMaker ml.g5.xlarge (GPU NVIDIA A10G).
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) usando bf16 o fp32.
- Despliegue en CPU: archivo ONNX int8 de 935 MB, con un consumo de memoria de aproximadamente 0,9 GB; funciona en 8 núcleos de una instancia m7i.4xlarge.
- Opciones de despliegue: PyTorch con transformers 5.5.4 y peft 0.19.1 (probado con torch 2.6), ONNX Runtime para CPU, e integración con OpenSearch ml-commons mediante un conector de servicio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: consulta en 32 ms (GPU) y 19 ms (CPU); 36 consultas/s en GPU y 54 en CPU; 246 respuestas XPQA/s en GPU con lotes de 32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | XPQA cross-lingual (nDCG@10) | MLQA cross-lingual (nDCG@10) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Este modelo (GPU bf16) | 0,98B utilizados | 512 tokens | 0,639 | 0,561 | Apache 2.0 | Hugging Face, OpenSearch ml-commons |
| opensearch-neural-sparse-encoding-multilingual-v1 | 168M | No disponible | 0,300 | 0,188 | No disponible en la información proporcionada | Hugging Face (opensearch-project), OpenSearch |
| Modelos densos multilingües tipo sentence-transformers | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa directa disponible se limita al modelo de referencia de OpenSearch, que emplea 168M de parámetros y un analizador mbert-uncased en tiempo de consulta, frente a los 0,98B utilizados por este modelo. No se han encontrado en la información proporcionada datos de otros recuperadores dispersos multilingües comparables.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, razonamiento, código ni matemáticas; su única salida es un vector disperso para recuperación.
- Ventana de contexto limitada a 512 tokens en la versión ONNX para CPU; los textos más largos deben truncarse o dividirse en pasajes.
- Entradas muy cortas (una o dos palabras) generan vectores degenerados de aproximadamente 21.000 características; se recomienda añadir un punto a textos de tres tokens o menos, o usar `SparseEncoder(pad_short=False)`.
- En CPU int8, la cuantización de activaciones se realiza por llamada, por lo que el procesamiento por lotes altera los vectores; debe codificarse un texto por llamada.
- El límite por defecto de cláusulas de OpenSearch (1.024) puede superarse con el vector de consulta completo; es necesario elevarlo (por ejemplo, a 4.096) antes de buscar.
- Riesgo de sesgos y alucinaciones inherente al modelo base Qwen3-1.7B-Base y a los datos de entrenamiento; no se documentan evaluaciones de sesgo en la información disponible.
- El rendimiento en MIRACL (0,724) es ligeramente inferior al del modelo de referencia de OpenSearch (0,734), por lo que en recuperación monolingüe en dominio la mejora no está garantizada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B-Base y el SAE Qwen/SAE-Res-Qwen3-1.7B-Base-W32K-L0_100 deben verificarse por separado en cuanto a sus términos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se creó en noviembre de 2026; se trata de un artefacto reciente sin validación comunitaria extensa.
- No se documentan resultados de benchmarks en la información disponible más allá de los de recuperación (nDCG@10) y velocidad incluidos en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/aswath86/neural-sparse-encoding-splare-multilingual-v1
- Resultados detallados: https://huggingface.co/aswath86/neural-sparse-encoding-splare-multilingual-v1/blob/main/RESULTS.md
- Dataset de entrenamiento: https://huggingface.co/datasets/aswath86/neural-sparse-encoding-splare-multilingual-v1-training-data
- Paper SPLARE: https://arxiv.org/abs/2603.13277
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Autoencoder disperso: https://huggingface.co/Qwen/SAE-Res-Qwen3-1.7B-Base-W32K-L0_100
- Modelo de referencia de OpenSearch: https://huggingface.co/opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1
- Blog de OpenSearch sobre modelos neural sparse v3: https://opensearch.org/blog/advancing-search-with-opensearch-v3-neural-sparse-models-and-a-multilingual-retrieval-model/
