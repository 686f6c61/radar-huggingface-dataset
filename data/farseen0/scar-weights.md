# Farseen0/scar-weights

## Resumen

SCAR (Sparse Code Audit Retriever) es un modelo de recuperación dispersa (sparse retrieval) diseñado para la auditoría de seguridad de smart contracts en Solidity. Desarrollado por Farseen0, resuelve el problema de recuperar código vulnerable a partir de descripciones en lenguaje natural de hallazgos de auditoría, una tarea crítica en la revisión de contratos Ethereum. El modelo se construye sobre el backbone Qwen2.5-Coder-1.5B y combina una adaptación LoRA con una innovación técnica llamada SAE-LoRA: una adaptación de bajo rango (rank 256, 4.6 millones de parámetros) sobre un encoder Sparse Autoencoder (SAE) JumpReLU congelado con 16.384 características latentes, situado en la capa 19 del modelo.

La relevancia de SCAR radica en su rendimiento: sobre un corpus de 232.107 documentos alcanza un R@10 de 0.901, frente al 0.308 de BM25, una ventaja de 2,9× a escala completa. La contribución principal es SAE-LoRA, que mejora 37,6 veces el baseline de SAE congelado (R@10 de 0,026 a 0,977 en evaluación controlada). El modelo se distribuye en dos variantes (25 y 15 épocas) que equilibran precisión en dominios cerrados frente a cobertura fuera de distribución. La licencia es Apache 2.0, el pipeline es feature-extraction y los pesos se publican en formato PEFT safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Coder-1.5B + LoRA (rank 64 en Q/K/V/O) + JumpReLU SAE (16.384 features, capa 19) + SAE-LoRA (rank 256 en encoder W_e) |
| Parámetros totales | ~1.5B (backbone) + ~22M entrenables (17.4M LoRA + 4.6M SAE-LoRA) |
| Parámetros activos | No es MoE; todos los parámetros del backbone se activan, pero solo los adaptadores (~22M) se entrenan |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-Coder-1.5B) |
| Tipos de cuantización | No disponible (formato PEFT safetensors, sin cuantización publicada) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT) |

## Arquitectura y entrenamiento

SCAR es un sistema de dos etapas sobre el backbone de Qwen2.5-Coder-1.5B. En la primera etapa, el modelo de lenguaje recibe el texto de entrada y se aplica una adaptación LoRA de rank 64 sobre las proyecciones Q/K/V/O (17.4 millones de parámetros) para ajustar el backbone a la tarea de retrieval. En la capa 19 del modelo se extrae el residual stream de 1536 dimensiones, que se pasa a un SAE JumpReLU con 16.384 features (expansión 10,7 veces). Sobre el encoder del SAE se aplica SAE-LoRA, una adaptación de bajo rango (rank 256) con 4.6 millones de parámetros, que convierte las latentes orientadas a reconstrucción en latentes discriminativas para retrieval. El pipeline de pooling incluye selección TopK por token (k=64), sum-pooling con saturación log1p, ponderación IDF, y selección TopK por documento (q=100, d=400) con normalización L2, generando vectores dispersos de aproximadamente 115 dimensiones activas por documento, compatibles con índices invertidos.

El entrenamiento se realizó sobre tres datasets propios: scar-pairs (pares de hallazgos y código), scar-eval (evaluación controlada de 838 pares) y scar-corpus (corpus de 232.107 documentos). Se publican dos checkpoints: scar-25ep (25 épocas, optimizado para dominios cerrados) y scar-15ep (15 épocas, con mejor cobertura fuera de distribución). No se ha publicado información sobre el uso de RLHF o DPO; la técnica principal es la adaptación supervisada con SAE-LoRA. El preprint del paper está previsto para EMNLP 2026 y el código se liberará bajo Apache 2.0 tras su publicación.

## Capacidades

- Recuperación dispersa de código Solidity vulnerable a partir de hallazgos de auditoría en lenguaje natural.
- Búsqueda de precedentes en corpus de código cerrados: puede indexar y recuperar contratos similares en bases de conocimiento de auditoría.
- Detección de patrones de vulnerabilidad fuera de distribución: la variante scar-15ep muestra mejor cobertura en contratos no vistos (EVMBench coverage de 0.732).
- Extracción de características latentes dispersas: genera vectores de ~115 dimensiones activas por documento, útiles para índices invertidos y búsqueda eficiente.
- Soporte de tool calling: no disponible (es un modelo de feature extraction, no de generación).
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: no es un modelo de generación; su función es transformar texto en vectores dispersos para retrieval. No soporta visión, audio ni razonamiento multi-step.

## Casos de uso

- Auditoría de seguridad de smart contracts: un equipo de seguridad puede usar SCAR para recuperar contratos vulnerables similares a partir de una descripción de hallazgo (por ejemplo, "reentrancy en función withdraw"), reduciendo el tiempo de revisión manual. La ventaja de R@10 de 0.901 en corpus de 232k documentos permite cubrir grandes bases de contratos.
- Búsqueda de precedentes en bases de conocimiento de auditoría: en una empresa que ha auditado miles de contratos, SCAR puede indexar el corpus histórico y permitir a los auditores buscar vulnerabilidades similares a las ya reportadas, gracias a su robustez frente a la expansión del corpus (0.977 → 0.901 al pasar de 838 a 232k documentos).
- Escaneo de contratos nuevos en despliegue: la variante scar-15ep, con mejor cobertura fuera de distribución (EVMBench coverage 0.732), se puede usar para analizar contratos no vistos antes de desplegarlos en la blockchain, complementando herramientas de análisis estático.
- Sistemas de búsqueda semántica en repositorios de código Solidity: al generar vectores dispersos compatibles con índices invertidos, SCAR puede integrarse en sistemas de búsqueda de código basados en embeddings para desarrolladores que buscan patrones de implementación seguros.
- Pipeline de triage de vulnerabilidades: en un flujo de respuesta a incidentes, SCAR puede clasificar y priorizar hallazgos de auditoría comparando los contratos afectados con vulnerabilidades conocidas, mejorando la precisión sobre BM25 (nDCG@10 de 0.825 frente a 0.288).
- Investigación académica en sparse retrieval y SAEs: SCAR es un caso de estudio de aplicación de SAE-LoRA, y puede servir de referencia para experimentos sobre adaptación de autoencoders dispersos en tareas de retrieval.

## Benchmarks y rendimiento

Se han publicado resultados de benchmarks en la model card. La siguiente tabla resume las métricas de recuperación comparadas con BM25 y SPLADE-Qwen.

| Métrica | BM25 | SPLADE-Qwen | SCAR-25ep | SCAR-15ep |
|---|---:|---:|---:|---:|
| R@10 (838-pair eval) | 0.689 | 0.963 | **0.977** | 0.971 |
| R@10 (corpus completo 232k) | 0.308 | 0.838 | **0.901** | 0.868 |
| MRR (corpus completo) | 0.282 | 0.716 | **0.803** | 0.771 |
| nDCG@10 (corpus completo) | 0.288 | 0.743 | **0.825** | 0.792 |
| EVMBench coverage (OOD) | 0.720 | — | 0.683 | **0.732** |

Todas las mejoras sobre BM25 son estadísticamente significativas (p < 0.0001, bootstrap pareado, n = 10.000). El baseline de SAE congelado obtiene un R@10 de 0.026, apenas superior al azar (0.012), lo que confirma que SAE-LoRA es el componente que impulsa la discriminación en retrieval. La variante de 25 épocas es la mejor en dominios cerrados (R@10 de 0.977 en eval controlado), mientras que la de 15 épocas ofrece mejor cobertura fuera de distribución (0.732 en EVMBench).

## Requisitos de hardware

- El modelo base Qwen2.5-Coder-1.5B requiere aproximadamente 3 GB de VRAM en FP16 para inferencia. Con el adaptador LoRA y el SAE, el total sube a unos 3.2 GB (el tamaño del repo).
- En cuantización de 8 bits, la inferencia puede caber en una GPU con 4-6 GB de VRAM; en 4 bits, en 3-4 GB. No se han publicado cuantizaciones oficiales.
- Es viable en GPUs de consumo como la RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB). También puede ejecutarse en CPU para retrieval de lotes pequeños, aunque la latencia será mayor.
- Opciones de despliegue: dado que es un adaptador PEFT, se puede cargar con la librería `peft` y `transformers`. Para retrieval a gran escala, se recomienda generar los vectores dispersos offline con un script de batch y almacenarlos en un índice invertido (por ejemplo, con Lucene o Elasticsearch). No hay soporte directo para vLLM, llama.cpp o Ollama, ya que es un pipeline de feature extraction y no de generación.
- Latencia y throughput: no se han publicado datos concretos. En una GPU moderna, la generación de vectores para un documento de tamaño medio (p.ej., 500 tokens) debería tomar decenas de milisegundos con batch.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | R@10 (232k corpus) | Licencia |
|---|---|---|---|---|---|
| **SCAR-25ep** | Sparse retriever + SAE-LoRA | ~22M entrenados (sobre 1.5B backbone) | No disponible | **0.901** | Apache-2.0 |
| **SPLADE-Qwen** | Sparse retriever (SPLADE) | No disponible | No disponible | 0.838 | No disponible |
| **BM25** | Lexical retriever clásico | N/A | N/A | 0.308 | N/A |
| **Frozen-SAE baseline** | SAE congelado sin adaptación | 1.5B | No disponible | 0.026 | Apache-2.0 |

SCAR supera a SPLADE-Qwen en R@10 (0.901 vs 0.838) y a BM25 en todas las métricas. El baseline de SAE congelado demuestra que la adaptación SAE-LoRA es esencial: sin ella, el rendimiento es casi aleatorio. No se han encontrado otros modelos de sparse retrieval específicos para smart contracts en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para código Solidity y hallazgos de auditoría en inglés; su rendimiento fuera de ese dominio será limitado.
- Riesgo de alucinación en la detección de vulnerabilidades: SCAR es un retriever, no un clasificador, por lo que los resultados deben ser revisados por un auditor humano. Los falsos positivos pueden ser elevados en contratos con patrones complejos.
- La variante scar-25ep puede tener menor cobertura en contratos fuera de distribución (EVMBench coverage 0.683 vs 0.732 de scar-15ep); para escaneo de código nuevo, se recomienda usar scar-15ep.
- El corpus de entrenamiento es específico del dominio Ethereum; la generalización a otras blockchains o lenguajes (Rust, Vyper) no está validada.
- La licencia Apache 2.0 permite uso comercial, pero el paper aún no está publicado (preprint previsto para EMNLP 2026). El código y los datos de entrenamiento se liberarán tras la publicación, lo que puede limitar la reproducibilidad completa hasta entonces.
- No es un modelo de generación: no se puede usar para generar código o explicaciones; es exclusivamente para extracción de características y retrieval.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue en hardware muy limitado puede requerir cuantización manual con herramientas externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Farseen0/scar-weights
- Repositorio GitHub: https://github.com/FarseenSh/scar
- Paper (preprint): https://openreview.net/forum?id=moD8Hxq9hN (previsto para EMNLP 2026)
- Dataset de pares: https://huggingface.co/Farseen0/scar-pairs
- Dataset de evaluación: https://huggingface.co/Farseen0/scar-eval
- Dataset de corpus: https://huggingface.co/Farseen0/scar-corpus

La ficha está completa. He sido cuidadoso en no inventar datos y en marcar como "no disponible" los que no estaban en la información.</think>## Resumen

SCAR (Sparse Code Audit Retriever) es un modelo de recuperación dispersa (sparse retrieval) específico para la auditoría de seguridad de smart contracts en Ethereum. Desarrollado por Farseen0, resuelve el problema de recuperar código Solidity vulnerable a partir de descripciones en lenguaje natural de hallazgos de auditoría. Se construye sobre el backbone Qwen2.5-Coder-1.5B y combina una adaptación LoRA con una innovación técnica llamada SAE-LoRA: una adaptación de bajo rango (rank 256, 4,6 millones de parámetros) sobre un Sparse Autoencoder (SAE) JumpReLU congelado de 16.384 características, situado en la capa 19 del modelo.

En un corpus de 232.107 documentos alcanza un R@10 de 0,901, frente al 0,308 de BM25, una ventaja de 2,9 veces a escala completa. La contribución principal es SAE-LoRA, que mejora 37,6 veces el baseline de SAE congelado (R@10 de 0,026 a 0,977 en evaluación controlada). El modelo se distribuye en dos variantes de checkpoint (25 y 15 épocas) que equilibran el rendimiento en dominios cerrados frente a la cobertura fuera de distribución. La licencia es Apache 2.0, el pipeline es feature extraction y el tamaño del repositorio es de 3,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Coder-1.5B + LoRA (rank 64 en Q/K/V/O) + JumpReLU SAE (16.384 features, capa 19) + SAE-LoRA (rank 256 en encoder W_e) |
| Parámetros totales | ~1.5B (backbone) + ~22M entrenados (17.4M LoRA + 4.6M SAE-LoRA) |
| Parámetros activos | No es MoE; todos los parámetros del backbone se activan, pero solo los adaptadores se entrenan |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-Coder-1.5B) |
| Tipos de cuantización | No disponible (formato PEFT safetensors, sin cuantización publicada) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT) |

## Arquitectura y entrenamiento

SCAR es un adaptador de dos etapas sobre Qwen2.5-Coder-1.5B. En la primera, el backbone recibe el texto de entrada y se aplica una adaptación LoRA de rank 64 sobre las matrices Q, K, V y O (17,4 millones de parámetros) para adaptar el modelo a la tarea de retrieval. En la capa 19, se extrae el residual stream de 1536 dimensiones y se pasa a un SAE JumpReLU con 16.384 características (expansión de 10,7×). Sobre el encoder del SAE se aplica SAE-LoRA, una adaptación de bajo rango (rank 256) con 4,6 millones de parámetros que transforma las características orientadas a reconstrucción en características discriminativas para retrieval. El pipeline de codificación incluye selección TopK por token (k=64), sum-pooling con saturación log1p, ponderación IDF, selección TopK por documento (query q=100, documento d=400) y normalización L2, generando vectores dispersos de aproximadamente 115 dimensiones activas por documento, compatibles con índices invertidos.

El entrenamiento se realizó sobre tres datasets propios: scar-pairs (pares de consulta y código), scar-eval (evaluación de 838 pares) y scar-corpus (corpus de 232.107 documentos). Se publican dos checkpoints: scar-25ep (25 épocas, para dominios cerrados) y scar-15ep (15 épocas, con mejor cobertura fuera de distribución). No se menciona el uso de RLHF ni DPO; la técnica principal es la adaptación supervisada con SAE-LoRA. El paper está en preparación para EMNLP 2026 y el código y los datos se liberarán bajo Apache 2.0 tras su publicación.

## Capacidades

- Recuperación dispersa de código Solidity vulnerable a partir de hallazgos de auditoría en lenguaje natural.
- Búsqueda de precedentes en corpus de código cerrado: puede indexar y recuperar contratos similares en bases de conocimiento de auditoría.
- Detección de patrones de vulnerabilidad fuera de distribución: la variante scar-15ep logra una cobertura de 0,732 en EVMBench (82 hallazgos de alta severidad en 22 concursos reales).
- Extracción de características latentes dispersas: vectores de ~115 dimensiones activas por documento, compatibles con índices invertidos.
- Integración de tool calling: no disponible; es un pipeline de feature extraction, no de generación.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: no incluye visión, audio ni razonamiento multi-step; es exclusivamente un modelo de extracción de características para retrieval.

## Casos de uso

- Auditoría de seguridad de smart contracts: un equipo de seguridad puede consultar SCAR con descripciones como "reentrancy en el contrato de staking" para recuperar contratos vulnerables similares de un corpus de 232k documentos, reduciendo el tiempo de revisión manual gracias a su R@10 de 0,901.
- Búsqueda de precedentes en bases de conocimiento de auditoría: al indexar contratos históricos auditados, SCAR permite a los auditores encontrar vulnerabilidades ya reportadas en contratos nuevos, aprovechando su robustez frente a la expansión del corpus (0,977 → 0,901 al pasar de 838 a 232k documentos).
- Escaneo de contratos nuevos en despliegue: la variante scar-15ep, con mejor cobertura fuera de distribución (EVMBench coverage 0,732), puede usarse para analizar contratos no vistos antes de su despliegue en Ethereum.
- Sistemas de búsqueda de código en repositorios Solidity: los vectores disperses de SCAR pueden integrarse en motores de búsqueda basados en embeddings para consultas de patrones de código seguros o vulnerables.
- Pipeline de priorización de hallazgos de auditoría: en un flujo de análisis de incidentes, SCAR puede comparar contratos reportados con vulnerabilidades conocidas y priorizar los casos más críticos, superando a BM25 en nDCG@10 (0,825 vs 0,288).
- Investigación académica sobre sparse retrieval y autoencoders dispersos: SCAR sirve como referencia para estudiar la aplicación de SAE-LoRA en tareas de retrieval, con datos y código disponibles bajo Apache 2.0 tras la publicación del paper.

## Benchmarks y rendimiento

El modelo card publica resultados de benchmarks comparativos. La siguiente tabla resume las métricas de rendimiento frente a BM25 y SPLADE-Qwen.

| Métrica | BM25 | SPLADE-Qwen | SCAR-25ep | SCAR-15ep |
|---|---:|---:|---:|---:|
| R@10 (evaluación de 838 pares) | 0,689 | 0,963 | **0,977** | 0,971 |
| R@10 (corpus completo 232k) | 0,308 | 0,838 | **0,901** | 0,868 |
| MRR (corpus completo) | 0,282 | 0,716 | **0,803** | 0,771 |
| nDCG@10 (corpus completo) | 0,288 | 0,743 | **0,825** | 0,792 |
| EVMBench coverage (OOD) | 0,720 | — | 0,683 | **0,732** |

Todas las mejoras sobre BM25 son estadísticamente significativas (p < 0.0001, bootstrap pareado con 10.000 muestras). El baseline de SAE congelado obtiene un R@10 de 0,026, casi al nivel del azar (0,012), lo que confirma que SAE-LoRA es el componente que aporta la discriminación en retrieval. La variante de 25 épocas es la mejor en dominios cerrados (R@10 de 0,977), mientras que la de 15 épocas ofrece mejor cobertura en datos fuera de distribución (0,732 en EVMBench).

## Requisitos de hardware

- El modelo base Qwen2.5-Coder-1.5B requiere aproximadamente 3 GB de VRAM en FP16 para inferencia; con los adaptadores LoRA y SAE-LoRA, el total sube a unos 3,2 GB (tamaño del repo).
- En cuantización de 8 bits, puede caber en GPUs con 4-6 GB de VRAM; en 4 bits, en 3-4 GB. No se han publicado cuantizaciones oficiales.
- Es compatible con GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB). También puede ejecutarse en CPU para lotes pequeños, aunque con mayor latencia.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la biblioteca `peft` y `transformers`. Para retrieval a gran escala, se recomienda generar vectores dispersos offline y almacenarlos en un índice invertido (por ejemplo, Lucene o Elasticsearch). No es compatible con vLLM, llama.cpp u Ollama, ya que es un pipeline de feature extraction y no de generación.
- Latencia y throughput: no se han publicado datos concretos. En una GPU de gama media, la inferencia por documento (500 tokens) debería tomar decenas de milisegundos con batch processing.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | R@10 (232k corpus) | Licencia |
|---|---|---|---|---|---|
| **SCAR-25ep** | Sparse retriever con SAE-LoRA | ~22M entrenados (sobre 1.5B backbone) | No disponible | **0,901** | Apache-2.0 |
| **SPLADE-Qwen** | Sparse retriever (SPLADE) | No disponible | No disponible | 0,838 | No disponible |
| **BM25** | Lexical retriever clásico | N/A | N/A | 0,308 | N/A |
| **Frozen-SAE baseline** | SAE congelado sin adaptación | 1.5B | No disponible | 0,026 | No disponible |

SCAR supera a BM25 en todas las métricas y a SPLADE-Qwen en R@10 (0,901 vs 0,838). El baseline de SAE congelado demuestra que SAE-LoRA es esencial para el rendimiento; sin él, la recuperación es casi aleatoria. No se han identificado otros modelos de sparse retrieval específicos para smart contracts en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para código Solidity y hallazgos de seguridad en inglés; su rendimiento en otros lenguajes o dominios no está garantizado.
- Riesgo de alucinación en la detección de vulnerabilidades: SCAR es un retriever, no un analizador; los resultados deben ser revisados por un auditor humano, y los falsos positivos pueden aparecer en contratos con patrones complejos.
- La variante scar-25ep puede degradarse en contratos fuera de distribución (EVMBench coverage 0,683 vs 0,732 de scar-15ep); para código nuevo, se recomienda usar scar-15ep.
- La generalización a otras blockchains o lenguajes (por ejemplo, Vyper o
