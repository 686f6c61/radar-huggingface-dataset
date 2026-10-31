# ApplePlacer10/L3-8B-Lunaris-v1-GGUF

## Resumen

L3-8B-Lunaris-v1-GGUF es una colección de cuantizaciones en formato GGUF del modelo L3-8B-Lunaris-v1, original de Sao10K, realizadas por bartowski mediante llama.cpp (release b3259) con la opción imatrix. El modelo base es un LLM de 8.030.261.248 parámetros derivado de la familia Llama 3, orientado a generación de texto conversacional, y esta versión cuantizada permite ejecutarlo localmente en hardware de consumo con un amplio abanico de compromisos entre tamaño (desde 2,60 GB en IQ2_XS hasta 9,52 GB en Q8_0_L) y calidad de salida.

La relevancia de esta ficha reside en que facilita el despliegue local de un modelo fine-tuned de la comunidad sobre Llama 3 8B, una arquitectura transformer densa muy madura y bien soportada por llama.cpp, Ollama, LM Studio y otros runtimes. El uso de imatrix (matriz de importancia) para las cuantizaciones reduce la pérdida de calidad en niveles bajos de bits, algo especialmente útil en los quants de 2-3 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Llama 3 (no disponible detalle fino) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (Llama 3 8B base usa 8.192 tokens, dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | Q8_0_L, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_XL, Q3_K_L, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XS, IQ3_XXS, Q2_K, IQ2_M, IQ2_S, IQ2_XS |
| Idiomas soportados | Inglés (según tags del repo) |
| Licencia | Llama 3 Community License |
| Formato de pesos | GGUF (cuantizado con imatrix; el original está en safetensors) |

## Arquitectura y entrenamiento

El modelo base, L3-8B-Lunaris-v1 de Sao10K, es un fine-tune de Llama 3 8B, una arquitectura transformer decoder-only densa con atención estándar, normalización RMSNorm y codificación rotatoria de posiciones (RoPE). No es un modelo MoE, por lo que todos los parámetros están activos en cada pasada. El prompt format corresponde a las plantillas de chat de Llama 3, con tokens especiales `<|begin_of_text|>`, `<|start_header_id|>`, `<|eot_id|>`, etc.

Sobre los datos de entrenamiento del fine-tune original (número de tokens, composición del dataset, uso de RLHF o DPO) no hay información disponible en la model card proporcionada. Lo que sí está documentado es el proceso de cuantización: bartowski empleó llama.cpp b3259 con la opción imatrix, que calcula una matriz de importancia a partir de un dataset de calibración (enlazado en el gist del autor) para minimizar el error de cuantización, y creó variantes experimentales "_L" que mantienen los pesos de embedding y salida en f16 para maximizar la fidelidad.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline text-generation, tag conversational)
- Roleplay y escritura creativa, uso habitual de los fine-tunes de Sao10K sobre Llama 3 (según la reputación del autor, no verificado en la model card)
- Comprensión y generación en inglés
- Ejecución local eficiente gracias al formato GGUF, con soporte de descarga selectiva de archivos individuales mediante huggingface-cli
- No hay información disponible sobre tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido

## Casos de uso

- Chatbots locales de escritura creativa: el formato de chat de Llama 3 permite conversaciones multi-turno con system prompt, ideal para asistentes de narrativa o roleplay ejecutados en local sin coste de API.
- Prototipado de aplicaciones LLM en portátiles: con quants de 4 bits (4,44-4,92 GB) el modelo cabe en GPUs de consumo de 8 GB o incluso en CPU con RAM suficiente, útil para pruebas rápidas con Ollama o LM Studio.
- Despliegue en hardware limitado: los quants IQ2 (2,60-2,94 GB) permiten usar el modelo en dispositivos con poca RAM, aceptando una pérdida de calidad documentada.
- Comparación de niveles de cuantización: el abanico de 22 quants permite a desarrolladores evaluar el trade-off calidad/tamaño en su propio pipeline con imatrix.
- Integración en aplicaciones con llama.cpp: al ser GGUF estándar, se puede enlazar directamente con llama.cpp o bindings (llama-cpp-python) para productos offline.
- Experimentación de investigación sobre fine-tunes de comunidad: base conveniente para estudiar el comportamiento de merges/fine-tunes de Llama 3 8B en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead de contexto; por ejemplo, Q4_K_M (4,92 GB) cabe holgadamente en una GPU de 8 GB, y Q8_0 (8,54 GB) requiere 10-12 GB de VRAM o descarga parcial en RAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para los quants altos; no hay datos oficiales de latencia o throughput.
- Consumer GPUs: sí, cualquier GPU con 6-8 GB de VRAM ejecuta los quants de 3-4 bits; en CPU, 16 GB de RAM bastan para Q4_K_M.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| L3-8B-Lunaris-v1 | 8.030.261.248 | No disponible | Llama 3 Community | GGUF (esta ficha), safetensors (original) |
| Llama 3 8B Instruct (Meta) | 8.000.000.000 aprox. | 8.192 tokens | Llama 3 Community | safetensors, GGUF (comunidad) |
| L3-8B-Stheno-v3.2 (Sao10K) | 8.000.000.000 aprox. | No disponible | Llama 3 Community | safetensors, GGUF (comunidad) |
| Hermes 3 (NousResearch, 8B) | 8.000.000.000 aprox. | No disponible | Llama 3 Community | safetensors, GGUF (comunidad) |

Todos son fine-tunes de 8B sobre Llama 3 con la misma licencia; Lunaris se posiciona en el nicho de escritura creativa y roleplay, mientras que Hermes 3 está más orientado a instrucciones generales y agentic behavior. No hay datos de rendimiento comparativos publicados en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar de Llama 3 y de un fine-tune comunitario, puede reproducir sesgos del dataset original de Meta y del fine-tune de Sao10K.
- Riesgo de alucinación: inherente a los LLM de 8B; los quants de 2-3 bits degradan adicionalmente la coherencia y la calidad factual.
- Limitaciones de idioma: el repo declara soporte solo de inglés; el rendimiento en castellano no está documentado y puede ser inferior al del modelo base instruct de Meta.
- Restricciones de licencia: la Llama 3 Community License impone condiciones de uso (aceptación de la política de uso aceptable de Meta, atribución del nombre "Llama 3" en derivados y límites de 700 millones de usuarios mensuales para licencias adicionales); revisar antes de uso comercial.
- Caveats de producción: los quants marcados como experimentales (_L) no están validados; el tamaño total del repo (147,9 GB) obliga a descargar archivos individuales; no hay información sobre tool calling ni contexto largo, por lo que no es adecuado para pipelines agenticos sin verificación previa.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/ApplePlacer10/L3-8B-Lunaris-v1-GGUF
- Modelo original (Sao10K): https://huggingface.co/Sao10K/L3-8B-Lunaris-v1
- Cuantizaciones de referencia de bartowski: https://huggingface.co/bartowski/L3-8B-Lunaris-v1-GGUF
- llama.cpp (herramienta de cuantización): https://github.com/ggerganov/llama.cpp/
- Release b3259 de llama.cpp: https://github.com/ggerganov/llama.cpp/releases/tag/b3259
- Dataset de calibración imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
