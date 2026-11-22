# OliverSieberling/triadic-gdn-e8-1.3b-64k

## Resumen

Triadic Gated DeltaNet (E=8) 1.3B 64k es un checkpoint de investigación publicado por Oliver Sieberling (con la colaboración de Bharat Runwal, David Jin, Ryan Chin, Rameswar Panda y Yoon Kim) que implementa la arquitectura Triadic Linear Attention descrita en el paper arXiv:2609.36529. Se trata de un modelo de lenguaje de 1.378 millones de parámetros con atención lineal basada en Gated DeltaNet y un estado recurrente tridimensional, diseñado específicamente para modelado de secuencias largas. El checkpoint parte de un preentrenamiento de 65.000 millones de tokens de FineWeb-Edu a 4k de contexto y se extiende después a 64k sobre 6.800 millones de tokens adicionales.

El interés del modelo es fundamentalmente académico: explora si un estado recurrente de tres dimensiones (segunda dimensión de clave E=8) puede mejorar la capacidad de memoria a largo plazo de las arquitecturas de atención lineal frente a los mecanismos DeltaNet convencionales. No es un modelo instructivo ni alineado, sino una base preentrenada en inglés que sirve como evidencia empírica de la viabilidad de la propuesta Triadic Linear Attention en la franja de 1.300 millones de parámetros.

La relevancia actual radica en la creciente demanda de alternativas eficientes a la atención cuadrática para contextos de decenas de miles de tokens. El modelo reporta resultados de perplejidad y de recuperación en PG19 y NIAH que permiten comparar directamente el coste-calidad de la atención lineal triádica frente a transformers densos del mismo tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal Triadic Gated DeltaNet (estado recurrente tridimensional, E=8) |
| Parámetros totales | 1.378.339.840 (1378,3 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 64.000 tokens (extendido desde 4k) |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Capas | 24 |
| Dimensión del modelo (d_model) | 2048 |
| Cabezas de atención | 16 |
| Dimensión de segunda clave (E) | 8 |
| Tokenizador | Llama-2 |
| Tamaño del repositorio | 5,5 GB |
| Hardware de referencia | H100 (según la model card) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder-only de 24 capas con d_model 2048 y 16 cabezas, pero sustituye la atención softmax estándar por Triadic Gated DeltaNet, una variante de atención lineal con estado recurrente. La innovación principal es la incorporación de una segunda dimensión de clave (E=8) que da lugar a un estado recurrente tridimensional, lo que según el paper permite retener información más rica a lo largo de la secuencia sin el coste cuadrático de la atención densa. El tokenizador es el de Llama-2, lo que facilita la comparación con modelos de la familia Llama.

El entrenamiento se realizó en dos fases: un preentrenamiento de 65.000 millones de tokens sobre FineWeb-Edu con contexto de 4k, seguido de una extensión de contexto a 64k sobre 6.800 millones de tokens adicionales. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación; se trata, por tanto, de un modelo base. La model card no detalla la composición exacta del dataset más allá de FineWeb-Edu ni el número total de tokens vistos durante la extensión de contexto.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt, sin formato instructivo ni plantilla de chat.
- Modelado de lenguaje de contexto largo: ventana de hasta 64.000 tokens gracias a la atención lineal recurrente.
- Recuperación de información en secuencias largas (evaluado con NIAH, con un resultado de 41,9).
- Razonamiento y conocimiento general de nivel base preentrenado (0-shot de 60,9 en la métrica reportada).
- Capacidad multilingüe limitada: el modelo solo declara inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento explícito.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Investigación en atención lineal: reproducción de los experimentos del paper Triadic Linear Attention y comparación de la perplejidad en PG19 frente a DeltaNet estándar, usando el checkpoint como referencia pública.
- Evaluación de modelos de contexto largo: el modelo permite medir la degradación de la perplejidad entre los tramos 4k–16k y 16k–64k de PG19 (10,16 y 9,94 respectivamente), útil para estudiar la estabilidad de la memoria recurrente.
- Fine-tuning para tareas de dominio: al ser un modelo base de 1.300 M con licencia MIT, puede ajustarse con supervisión para clasificación, resumen o extracción sobre documentos largos en inglés.
- Prototipado de pipelines de recuperación aumentada (RAG) con contexto extenso: la ventana de 64k permite insertar varios documentos completos sin truncar, aunque la calidad de recuperación (NIAH 41,9) debe validarse en el caso concreto.
- Estudio de eficiencia computacional: comparar el coste de inferencia y memoria de la atención lineal triádica frente a un transformer denso del mismo tamaño en GPUs H100.
- Generación de texto base en inglés para experimentos controlados: al no estar alineado, resulta adecuado como línea base en estudios de sesgo, toxicidad o distribución del lenguaje.
- Benchmarking de kernels y compiladores: servir como carga de trabajo para validar implementaciones de atención lineal en CUDA o Triton.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes. La columna "0-shot" no especifica la tarea, por lo que se reproduce tal cual aparece.

| Métrica | Resultado |
|---|---|
| 0-shot | 60,9 |
| WikiText (perplejidad) | 7,87 |
| PG19 ≤4k (perplejidad) | 10,74 |
| PG19 4k–16k (perplejidad) | 10,16 |
| PG19 16k–64k (perplejidad) | 9,94 |
| Recall | 44,4 |
| NIAH | 41,9 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con modelos de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): aproximadamente 2,8 GB solo para los pesos, más memoria para el estado recurrente y el KV cache lineal; en la práctica, 4–6 GB en función del batch y la longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: en torno a 1,4 GB para pesos; en 4 bits, alrededor de 0,7 GB. No obstante, el autor no publica pesos cuantizados, por lo que habría que generarlos manualmente.
- GPU recomendadas: H100, según indica explícitamente la model card. No se documenta compatibilidad con otras GPU.
- GPU de consumo: por tamaño (1,3B) cabría en una RTX 4090, RTX 4080 o incluso RTX 3090 en fp16, pero el código de referencia requiere una implementación específica de atención lineal y el autor solo garantiza funcionamiento en H100.
- Opciones de despliegue: carga directa con `safetensors` y el módulo `model.GPT` del repositorio TriadicLinearAttention. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Triadic GDN E=8 1.3B 64k | 1378,3 M | 64k | Atención lineal Gated DeltaNet triádica | MIT | Hugging Face (checkpoint de investigación) |
| Llama-2 1.3B (referencia de tokenizador) | No disponible | No disponible | Transformer denso | Llama 2 Community License | No disponible como checkpoint oficial de 1.3B |
| Alternativas de atención lineal de ~1.3B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de resultados numéricos de modelos comparables de la misma categoría, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por RLHF, DPO ni instrucción, por lo que no sigue instrucciones de forma fiable y puede generar contenido inapropiado.
- Solo inglés: no se declara soporte para otros idiomas; el rendimiento en castellano u otras lenguas no está evaluado.
- Riesgo de alucinación: inherente a un modelo preentrenado de 1,3B sin verificación factual; la calidad de recuperación en contexto largo (NIAH 41,9) indica que la memoria a 64k no es perfecta.
- Requisito de hardware específico: el autor indica que se necesita una H100 y el código del repositorio TriadicLinearAttention; no hay integración con frameworks de inferencia estándar, lo que dificulta su uso en producción.
- Sin cuantizaciones oficiales: no se publican versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo.
- Licencia MIT: permite uso comercial, pero al ser un checkpoint de investigación sin garantías, el usuario asume el riesgo de calidad y de sesgos no documentados.
- Sesgos: no se documenta ninguna evaluación de sesgos; al entrenarse sobre FineWeb-Edu, puede heredar sesgos del corpus web filtrado.
- Fecha de creación futura (2026-11-22) y cero descargas: el modelo es muy reciente y no cuenta con validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/OliverSieberling/triadic-gdn-e8-1.3b-64k
- Paper (arXiv): https://arxiv.org/abs/2609.36529
- Repositorio de código: https://github.com/OliverSieberling/TriadicLinearAttention
