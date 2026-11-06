# mradermacher/DeepSeek-R1-Pruned-108B-GGUF

## Resumen

DeepSeek-R1-Pruned-108B-GGUF es la versión cuantizada en formato GGUF del modelo ubicloud/DeepSeek-R1-Pruned-108B, un derivado podado del modelo de razonamiento DeepSeek-R1. La cuantización la ha realizado mradermacher, un conocido publicador de versiones GGUF de modelos open source, empleando el pipeline estándar de llama.cpp con cuantizaciones estáticas (no imatrix). El modelo base conserva la arquitectura transformer densa de DeepSeek-R1 con aproximadamente 107.169 millones de parámetros totales, lo que lo sitúa en la categoría de modelos de razonamiento de gran tamaño pero por debajo de los 671B del R1 original.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de razonamiento de 107B en hardware más asequible que el R1 completo, gracias a las cuantizaciones Q2_K (39,4 GB) hasta Q8_0 (114 GB). El modelo está orientado a inglés y mantiene el comportamiento conversacional y de razonamiento encadenado característico de la familia R1. La licencia no está especificada en la información disponible, lo que constituye un punto crítico antes de cualquier uso comercial.

El repositorio tiene 728,4 GB de tamaño total (suma de todas las cuantizaciones) y registra 234 descargas y 0 likes en el momento de la consulta, con fecha de creación en enero de 2026 y última actualización en noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de DeepSeek-R1, podado) |
| Parámetros totales | 107.169.391.872 (≈107,2B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas, sin imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |
| Tamaño del repositorio | 728,4 GB |
| Modelo base | ubicloud/DeepSeek-R1-Pruned-108B |
| Librería | transformers |
| Pipeline | No disponible |

## Arquitectura y entrenamiento

El modelo base es un derivado podado de DeepSeek-R1, que emplea una arquitectura transformer densa con atención multi-cabeza estándar. La poda reduce el número de parámetros respecto al R1 original (671B, MoE) hasta los ~107B, manteniendo presumiblemente las capas de razonamiento y el tokenizador del modelo original. No se dispone de información sobre la metodología exacta de poda (structured pruning, layer removal, etc.) ni sobre los datos de entrenamiento utilizados en el proceso de poda o en un posible fine-tuning posterior.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicó RLHF o DPO en el modelo base podado. La cuantización realizada por mradermacher es estática (no weighted/imatrix), según indica el propio autor en la model card, y no se han publicado cuantizaciones imatrix para este modelo en el momento de la consulta.

## Capacidades

- Generación de texto conversacional en inglés, con herencia del comportamiento de razonamiento encadenado de la familia DeepSeek-R1 (chain-of-thought).
- Razonamiento multi-paso y resolución de problemas complejos, presumiblemente conservado del modelo base R1.
- Generación de código y matemáticas, capacidades típicas de los modelos de razonamiento de la familia R1 (no verificadas específicamente en esta versión podada).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: presumible, dado el origen R1, pero no documentado en esta ficha.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Modo thinking: presumiblemente heredado del R1, no documentado explícitamente.
- Visión y audio: no disponibles.

## Casos de uso

- Razonamiento matemático y resolución de problemas: el modelo hereda el comportamiento de razonamiento de DeepSeek-R1, por lo que puede emplearse en entornos donde se requiera descomposición de problemas y verificación paso a paso, con la ventaja de un tamaño reducido frente al R1 completo.
- Generación de código asistida: integrable en editores o pipelines de CI/CD mediante llama.cpp o servidores compatibles con GGUF, siempre que se valide la calidad tras la poda.
- Despliegue en hardware de gama alta consumer: la cuantización Q2_K (39,4 GB) permite ejecutar el modelo en configuraciones con 48 GB de VRAM (por ejemplo, dos RTX 4090 o una A6000), algo inviable con el R1 original.
- Investigación sobre poda y cuantización: útil para estudiar el impacto de la poda en modelos de razonamiento, comparando las respuestas de esta versión con las del R1 completo.
- Prototipado de asistentes conversacionales en inglés: el modelo mantiene el formato conversacional y puede usarse en demos locales sin depender de APIs externas.
- Evaluación de cuantizaciones: el repositorio ofrece 11 variantes de cuantización, lo que permite analizar el trade-off calidad/tamaño en un modelo de razonamiento de 107B.
- Inferencia offline y privacidad: al ejecutarse localmente con llama.cpp, permite procesar datos sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~39,4 GB de pesos + overhead de contexto y KV cache (estimado ~45-50 GB en total).
  - Q4_K_M: ~65,6 GB de pesos + overhead (estimado ~75-85 GB).
  - Q8_0: ~114 GB de pesos + overhead (estimado ~125-135 GB).
- GPU recomendadas: para Q2_K, una RTX 6000 Ada (48 GB) o dos RTX 4090 (24 GB cada una); para Q4_K_M en adelante, A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- ¿Cabe en consumer GPU? Solo las cuantizaciones más agresivas (Q2_K, Q3_K_S) en configuraciones multi-GPU de gama alta consumer; no cabe en una única RTX 4090 (24 GB).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se publica el manifiesto correspondiente), servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa para este tamaño sin conversión.
- Latencia y throughput: no disponibles. Dependerán fuertemente de la GPU, la cuantización y el número de tokens de contexto; en configuraciones multi-GPU consumer se espera un throughput bajo (tokens/s limitados) para un modelo de 107B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Pruned-108B-GGUF (este) | ~107B | No disponible | No disponible | GGUF | Hugging Face |
| DeepSeek-R1 (original) | 671B (MoE, 37B activos) | 128K | MIT | safetensors, GGUF | Hugging Face |
| DeepSeek-R1-Distill-Llama-70B | 70B | 128K | MIT (derivado de Llama) | safetensors, GGUF | Hugging Face |
| Qwen2.5-72B-Instruct | 72B | 128K | Apache 2.0 (mayoría) | safetensors, GGUF | Hugging Face |

La comparación con DeepSeek-R1 original es la más directa: este modelo podado reduce el tamaño en ~6x a costa de una calidad presumiblemente inferior, pero permite despliegue local. Frente a los distill de 70B, ofrece más parámetros pero con una licencia incierta y sin benchmarks publicados. No se dispone de datos de rendimiento comparativo para esta versión podada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base ubicloud/DeepSeek-R1-Pruned-108B antes de cualquier despliegue en producción.
- La poda puede degradar significativamente las capacidades de razonamiento respecto al R1 original; no hay benchmarks publicados que cuantifiquen esta pérdida.
- Solo soporta inglés según los metadatos; el rendimiento en castellano u otros idiomas no está garantizado.
- Las cuantizaciones son estáticas (no imatrix), lo que puede implicar mayor perplejidad que las versiones ponderadas equivalentes en tamaño.
- Riesgo de alucinación inherente a los modelos de razonamiento de gran tamaño, potencialmente exacerbado por la poda.
- Longitud de contexto no documentada; no se debe asumir el contexto de 128K del R1 original sin verificación.
- Sin likes ni pipeline declarado, y con solo 234 descargas: modelo poco validado por la comunidad.
- El tamaño del repositorio (728,4 GB) requiere espacio de almacenamiento considerable si se descargan varias cuantizaciones.
- No hay información sobre sesgos específicos del modelo podado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/DeepSeek-R1-Pruned-108B-GGUF
- Modelo base: https://huggingface.co/ubicloud/DeepSeek-R1-Pruned-108B
- Página de overview del autor: https://hf.tst.eu/model#DeepSeek-R1-Pruned-108B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
