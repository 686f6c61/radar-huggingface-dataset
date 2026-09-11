# AndrewThompson1233/maba-v1-architecture

## Resumen

maba-v1 es una arquitectura de modelo de lenguaje de 101,18 millones de parámetros publicada por el usuario AndrewThompson1233 en HuggingFace bajo licencia MIT. Se trata de un diseño híbrido que combina recurrencia Gated DeltaNet-2 (GDN-2) con atención Grouped-Query (GQA) en una proporción 3:1 (15 bloques GDN-2 y 5 bloques GQA), con decodificación especulativa nativa mediante una cabeza de Multi-Token Prediction (MTP) con horizonte k=2. El modelo se distribuye junto a una implementación de referencia en PyTorch y un motor en C++17 con soporte AVX2 y OpenMP.

El problema que aborda es el coste de memoria de la caché KV en inferencia de contexto largo. Según las tablas de la model card, maba-v1 reduce el footprint de caché KV un 83,3 % frente a arquitecturas transformer comparables de su tamaño (39,1 MB frente a 188,7 MB de SmolLM2-135M con 8k tokens). La arquitectura está diseñada para escalar de 100M a 30B parámetros manteniendo el mismo esquema de embeddings factorizados.

Es relevante ahora porque la model card sitúa el diseño en 2026 y lo compara explícitamente con Qwen3.5, Muse-Glimmer-30B y Gemma4 en escenarios de hasta 128k tokens. No obstante, el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y no se han publicado resultados de benchmarks de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida recurrente-atención: 15 bloques Gated DeltaNet-2 (GDN-2) + 5 bloques Grouped-Query Attention (GQA), 20 bloques físicos con 2 pasadas (40 capas efectivas) |
| Parametros totales | 101.183.744 (101,18M) |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible de forma explícita; la documentación calcula cachés KV a 8k, 16k, 128k y 131k tokens |
| Tipos de cuantizacion | no disponible (las tablas de caché KV asumen FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye definición de modelo en PyTorch y motor C++17; no se especifica safetensors ni GGUF) |

Datos adicionales de la topología de parámetros:

| Componente | Dimensiones | Parametros | Fraccion |
|---|---|---|---|
| Token embeddings (W_emb) | 32.768 x 128 | 4.194.304 | 4,14 % |
| Proyección de entrada factorizada (W_proj_in) | 128 x 640 | 81.920 | 0,08 % |
| Proyección de salida factorizada (W_proj_out) | 640 x 128 | 81.920 | 0,08 % |
| LM-Head atada | atada a W_emb.T | 0 | 0,00 % |
| 15 bloques GDN-2 | Q, K, V, O + conv + puertas + SwiGLU + norms | 74.803.200 | 73,93 % |
| 5 bloques GQA | Q, K, V, O + QK-Norm + SwiGLU + norms | 21.529.600 | 21,28 % |
| RMSNorm final | 640 | 640 | 0,001 % |
| Cabeza auxiliar MTP (k=2) | (640 + 128) x 640 + 640 | 492.160 | 0,49 % |

## Arquitectura y entrenamiento

La arquitectura usa un vocabulario de 32.768 tokens con proyección factorizada de rango 128, lo que supone un "impuesto" de vocabulario del 4,31 % del total de parámetros (frente al 25,0 % de Supra2-100M, el 21,0 % de SmolLM2-135M y el 14,7 % de MobileLLM-125M según la tabla comparativa del autor). La dimensión del modelo es 640, con 20 bloques físicos reutilizados en 2 pasadas, lo que da 40 capas efectivas mediante weight sharing block-wise. En el bloque de atención: 10 cabezas de consulta, 2 cabezas clave-valor, dimensión de cabeza 64 y RoPE con theta = 500.000. La FFN es SwiGLU con dimensión intermedia 1.728.

La decodificación especulativa está integrada mediante una cabeza MTP con horizonte k=2, frente a k=1 de los modelos comparados (que no tienen MTP nativo). El entrenamiento, según la model card, emplea el optimizador Muon para pesos 2D combinado con AdamW para embeddings y vectores 1D. El runtime incluye una implementación de referencia en PyTorch y un motor nativo en C++17 con AVX2 y OpenMP.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla el esquema de aprendizaje de la cabeza MTP ni el coste de entrenamiento. La model card únicamente presenta tablas de topología de parámetros, comparativa arquitectónica y escalado (100M, 1B, 3B, 7B y 30B), remitiendo a SCALING.md para el desglose completo.

## Capacidades

- Generación de texto autoregresiva (pipeline declarado: text-generation), con idioma declarado únicamente inglés.
- Decodificación especulativa nativa con cabeza MTP de horizonte k=2, orientada a acelerar la generación sin modelo borrador externo.
- Recurrencia de contexto largo con bajo coste de caché KV: 39,1 MB a 8k tokens y 78,1 MB a 16k tokens en FP16, según la model card.
- Atención GQA con solo 2 cabezas KV sobre 10 cabezas Q en la variante de 100M.
- Ejecución en dos runtimes: referencia en PyTorch y motor propio en C++17 con vectorización AVX2 y OpenMP.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card menciona un preset "Maba-30B (Agentic)" en la tabla de escalado, pero sin detallar capacidades de agente.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Multilingüismo: no disponible; el campo de idioma solo declara inglés.

## Casos de uso

- Inferencia de contexto largo en un solo dispositivo: la caché KV de 78,1 MB a 16k tokens en la variante de 100M permite mantener conversaciones o documentos extensos en memoria muy limitada, lo que habilita despliegues en GPUs de gama baja o incluso CPU.
- Prototipado de arquitecturas recurrentes híbridas: el paquete incluye `config.py`, `model.py` y presets, por lo que sirve como banco de pruebas para investigar la mezcla 3:1 entre GDN-2 y GQA antes de escalar a 1B o 3B.
- Investigación sobre decodificación especulativa sin modelo borrador: la cabeza MTP con k=2 permite medir el impacto del horizonte especulativo sobre el throughput sin depender de un modelo auxiliar separado.
- Evaluación de optimizadores Muon + AdamW: la combinación documentada (Muon para pesos 2D, AdamW para embeddings y vectores 1D) es un caso de estudio reproducible para comparar curvas de convergencia a escala 100M.
- Despliegue embebido con el motor C++17: al incluir AVX2 y OpenMP, el motor nativo es adecuado para escenarios donde no se puede depender de un stack Python completo, como servicios de generación de texto de baja latencia en CPU.
- Generación de texto en inglés en entornos con presupuesto de memoria estricto: con aproximadamente 202 MB de pesos en FP16, el modelo cabe en GPUs integradas y en sistemas con poca VRAM, útil para demos, tests y entornos de CI.
- Estudio de eficiencia de vocabulario: la proyección factorizada de rango 128 reduce el "impuesto" de vocabulario al 4,31 %, lo que lo convierte en una referencia para analizar el equilibrio entre tamaño de vocabulario y parámetros útiles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo aporta métricas arquitectónicas y de memoria:

| Metrica | Maba v1 (101M) | Supra2-100M | SmolLM2-135M | MobileLLM-125M |
|---|---|---|---|---|
| Parametros totales | 101,18M | 100,68M | 135,0M | 125,0M |
| Parametros core | 96,33M (95,2 %) | 75,52M (75,0 %) | 106,7M (79,0 %) | 106,6M (85,3 %) |
| Impuesto de vocabulario | 4,31 % | 25,0 % | 21,0 % | 14,7 % |
| Profundidad efectiva | 40 capas | 12 capas | 30 capas | 30 capas |
| Caché KV (8k tokens) | 39,1 MB | 100,7 MB | 188,7 MB | 125,8 MB |
| Caché KV (16k tokens) | 78,1 MB | 201,3 MB | 377,5 MB | 251,7 MB |
| Reducción de memoria KV | 83,3 % | 57,0 % | 19,5 % | 46,3 % |
| Horizonte especulativo | k=2 (MTP nativo) | k=1 | k=1 | k=1 |
| Motor C++ nativo | incluido | no | no | no |

La model card remite a SCALING.md para benchmarks multi-escala (1B, 3B, 7B, 30B) frente a Qwen3.5, Muse-Glimmer-30B y Gemma4, pero los resultados no se incluyen en la información proporcionada.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 202 MB para los 101,18M de parámetros (101.183.744 x 2 bytes). En FP32, alrededor de 405 MB.
- Caché KV en FP16: 39,1 MB a 8k tokens y 78,1 MB a 16k tokens. A 128k tokens, la tabla de escalado indica 156,2 MB para la variante de 100M.
- VRAM estimada para inferencia: por debajo de 1 GB en FP16 incluyendo pesos, caché y overhead de runtime, según los datos de pesos y caché de la propia model card.
- Cabe en GPU de consumo: sí, con margen amplio. Cualquier GPU con 1-2 GB de VRAM libre es suficiente; también es viable en CPU gracias al motor C++17 con AVX2 y OpenMP.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, no requiere A100 ni H100; una RTX 4090 o cualquier GPU consumer reciente queda sobredimensionada.
- Opciones de despliegue: la model card describe dos runtimes propios (PyTorch de referencia y motor C++17). No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, por lo que su disponibilidad con esos stack es "no disponible".
- Latencia y throughput estimados: no disponibles. La cabeza MTP k=2 está diseñada para decodificación especulativa, pero no se publican cifras de aceleración.

## Comparativa con modelos similares

| Caracteristica | Maba v1 (101M) | Supra2-100M (2026) | SmolLM2-135M | MobileLLM-125M |
|---|---|---|---|---|
| Backbone | Maba (2026) | Qwen3 (2026) | Transformer (2024) | Transformer (2024) |
| Parametros totales | 101,18M | 100,68M | 135,0M | 125,0M |
| Parametros core | 96,33M (95,2 %) | 75,52M (75,0 %) | 106,7M (79,0 %) | 106,6M (85,3 %) |
| Profundidad efectiva | 40 capas | 12 capas | 30 capas | 30 capas |
| Comparticion de pesos | 2 pasadas block-wise | ninguna | ninguna | a nivel de capa |
| Atencion / recurrencia | 75 % GDN-2 + 25 % GQA | 100 % atencion completa | 100 % GQA | 100 % GQA |
| Caché KV (16k tokens) | 78,1 MB | 201,3 MB | 377,5 MB | 251,7 MB |
| Reduccion de memoria KV | 83,3 % | 57,0 % | 19,5 % | 46,3 % |
| Horizonte especulativo | k=2 (MTP nativo) | k=1 | k=1 | k=1 |
| Motor C++ nativo | incluido | no | no | no |
| Licencia | MIT | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |
| Rendimiento en benchmarks | no disponible | no disponible | no disponible | no disponible |

Las licencias y los resultados de calidad de Supra2-100M, SmolLM2-135M y MobileLLM-125M no se detallan en la información proporcionada, más allá de la tabla comparativa arquitectónica de la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta composición del dataset ni proceso de filtrado, por lo que no es posible evaluar sesgos de género, raza, religión u otros.
- Riesgo de alucinación: no cuantificado. Al no haber benchmarks de calidad publicados ni detalle del corpus de entrenamiento, no hay evidencia sobre la tasa de alucinación.
- Idioma: el campo de idioma declara exclusivamente inglés. Se desconoce el comportamiento en castellano u otros idiomas.
- Contexto: no se declara oficialmente la longitud máxima de contexto. Las tablas calculan cachés KV a 8k, 16k, 128k y 131k tokens, pero eso no confirma el contexto de entrenamiento ni la degradación a esas longitudes.
- Idiomas y tokenizador: no se especifica el algoritmo de tokenización ni si el vocabulario de 32.768 tokens está optimizado para algo distinto del inglés.
- Licencia: MIT, permisiva para uso comercial. Debe citarse la autoría original. No se mencionan restricciones adicionales ni cláusulas de uso aceptable.
- Madurez del repositorio: 0 descargas y 1 like en HuggingFace, con fecha de creación y actualización el mismo día (11 de septiembre de 2026). Sin evidencia de uso en producción.
- Pesos entrenados: la model card describe arquitectura, topología y presets de escalado, pero no se especifica en la información disponible si se publican checkpoints entrenados y con qué calidad.
- Cuantizaciones: no se documentan formatos GGUF, AWQ, GPTQ ni INT8/INT4. Las cifras de caché KV asumen FP16.
- Ecosistema de despliegue: no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que limita su integración directa en infraestructura estándar.
- Benchmarks ausentes: sin resultados de MMLU, HumanEval, GSM8K ni similares, no es posible comparar calidad frente a SmolLM2-135M o MobileLLM-125M.
- Advertencia de búsqueda: los resultados de búsqueda web asociados a esta consulta no contenían información técnica relevante sobre el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/AndrewThompson1233/maba-v1-architecture
- Repositorio GitHub: https://github.com/ivan-dev35/maba-v1-architecture
- Pipeline CI del repositorio: https://github.com/ivan-dev35/maba-v1-architecture/actions/workflows/ci.yml
- Documento de escalado referenciado en la model card: SCALING.md (dentro del repositorio, ruta relativa `SCALING.md`); URL absoluta no disponible
- Paper, blog o demo: no disponibles en la información proporcionada
- Resultados de búsqueda web: sin enlaces técnicos relevantes sobre el modelo
