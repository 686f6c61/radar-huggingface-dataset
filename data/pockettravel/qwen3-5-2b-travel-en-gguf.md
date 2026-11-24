# pockettravel/qwen3.5-2b-travel-en-GGUF

## Resumen

qwen3.5-2b-travel-en-GGUF es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-2B, desarrollado por el usuario pockettravel para la aplicación Android Pocket Travel. No es un chatbot de propósito general: está diseñado específicamente como asistente de viaje offline que responde en inglés, en un máximo de tres frases, utilizando exclusivamente el contexto de guías de viaje (Wikivoyage) que se le inyecta en el prompt. Si el contexto no contiene la respuesta, el modelo lo indica explícitamente en lugar de improvisar.

El modelo base cuenta con 1.881.825.088 parámetros (aproximadamente 1,9 mil millones) y se distribuye exclusivamente en formato GGUF cuantizado para su uso con llama.cpp. La versión actual es Q5_K_M con importance matrix (imatrix), que según el autor reduce la divergencia KL media de 0,024 a 0,009 respecto a la versión anterior Q4_K_M, con un incremento de tamaño de solo el 7%.

Su relevancia radica en el caso de uso: demuestra un patrón de despliegue de LLM en dispositivos móviles de gama media (6 GB de RAM o más) con un comportamiento de rechazo controlado y medido, orientado a aplicaciones de recuperación aumentada (RAG) sobre guías descargadas. La licencia es CC-BY-SA-4.0, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B; el autor menciona tensores de atención completa y `ssm_out`, sin detallar la arquitectura híbrida exacta) |
| Parámetros totales | 1.881.825.088 (≈1,9 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en la configuración de la app; longitud máxima nativa no disponible |
| Tipos de cuantización | Q5_K_M con importance matrix (actual); Q4_K_M con imatrix (obsoleto, solo para pruebas) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B y se ajusta con LoRA de 16 bits usando Unsloth: rango 16, alpha 32, tasa de aprendizaje 2e-4, batch efectivo de 16, secuencias de hasta 1024 tokens, una época y pérdida calculada solo sobre los tokens de respuesta, ponderada por categoría de pregunta. El adaptador se fusiona en los pesos base. La plantilla de chat es ChatML simple, sin bloque `<think>` ni `enable_thinking`, y el modelo es solo texto (sin `mmproj`).

El conjunto de entrenamiento consta de 42.466 pares sintéticos pregunta/respuesta, de los cuales aproximadamente el 22% son rechazos. Las respuestas se extrajeron de volcados de Wikimedia del 1 de octubre de 2026: páginas de países y ciudades de Wikivoyage en inglés (limpiadas con el código de la app), Wikipedia en inglés (cocina, cultura, telecomunicaciones y medios de países; historia y clima de ciudades), secciones de Wikivoyage en italiano traducidas automáticamente con MarianMT (`Helsinki-NLP/opus-mt-tc-big-it-en`) cuando faltaba la versión inglesa, y consejos de viaje de los gobiernos de Canadá (travel.gc.ca) y del Reino Unido (Foreign, Commonwealth & Development Office). La cuantización Q5_K_M mantiene en Q6_K los tensores de atención completa y `ssm_out`, además de los tensores Q6_K estándar (mitad de `ffn_down` y parte de `attn_qkv`); los embeddings de tokens, compartidos con la capa de salida, están en Q5_K.

## Capacidades

- Generación de texto en inglés limitada a un máximo de tres frases por respuesta.
- Respuesta fundamentada exclusivamente en el contexto proporcionado en el prompt (patrón RAG cerrado).
- Rechazo explícito cuando el contexto no contiene la información solicitada, con tasas medidas del 90-100% según categoría.
- Manejo de preguntas sobre países, ciudades, historia, clima, cocina, cultura, telecomunicaciones, medios, recomendaciones de "qué hay cerca" y salidas de transporte.
- Sin soporte de tool calling ni function calling (no documentado).
- Sin soporte de agentes ni razonamiento multi-paso (no documentado).
- Sin capacidades de visión ni audio (modelo solo texto).
- Sin modo de pensamiento (`thinking`): la plantilla ChatML no incluye bloque `<think>`.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Asistente de viaje offline en Android: la app busca en la guía Wikivoyage descargada (SQLite FTS), envía de 1 a 3 secciones como contexto y el modelo responde en tres frases. Cabe en 6 GB de RAM junto con la app (≈29% de la RAM sugerida).
- Consultas sobre países y ciudades en guías descargadas: el modelo responde usando solo las secciones recuperadas, con una tasa de rechazo incorrecto del 3,2% en preguntas de país y del 0% en preguntas de ciudad.
- Preguntas de historia y clima de ciudades: con contexto adecuado, la tasa de rechazo incorrecto es del 0% en el conjunto de evaluación.
- Recomendaciones de proximidad ("qué hay cerca"): gestiona preguntas con contexto de lugares cercanos, rechazando correctamente el 92,5% de los casos sin coincidencia y fallando solo el 5,8% de los respondibles.
- Consultas de salidas de transporte: responde sobre salidas presentes en el contexto y rechaza el 90% de las que no aparecen, con un 7,1% de rechazos incorrectos.
- Filtrado de preguntas fuera de dominio: rechaza el 100% de las preguntas no relacionadas con viajes, útil como capa de control en pipelines RAG para evitar respuestas alucinadas.
- Despliegue en dispositivos de gama media: al ocupar 1.415 MiB en uso con contexto 4096, batch 512 y caché KV en f16, es viable en móviles con 6 GB o más de RAM mediante llama.cpp.

## Benchmarks y rendimiento

Evaluación sobre 899 preguntas de test retenidas, de 11 países no vistos en entrenamiento, con contextos construidos como en la app, decodificación greedy y el mismo prompt. El modelo base de comparación es unsloth/Qwen3.5-2B-GGUF UD-Q4_K_XL.

| Grupo (preguntas) | Este modelo | Modelo base (Qwen3.5-2B) |
|---|---|---|
| **Rechaza** (mayor es mejor) | | |
| Contexto vacío, sin texto de guía (44) | 100% | 100% |
| Preguntas fuera de tema (110) | 100% | 94,5% |
| Preguntas de país con tema ausente del contexto (50) | 98% | 64% |
| Preguntas de ciudad con tema ausente de la página (130) | 100% | 76,2% |
| Historia o clima de ciudad no cubiertos (8) | 100% | 100% |
| "Qué hay cerca" sin lugar cercano coincidente (40) | 92,5% | 62,5% |
| Salidas sin salida coincidente (10) | 90% | 60% |
| **Rechaza incorrectamente preguntas respondibles** (menor es mejor) | | |
| Preguntas de país (279) | 3,2% | 13,3% |
| Preguntas de ciudad (70) | 0% | 14,3% |
| Historia o clima de ciudad (24) | 0% | 0% |
| "Qué hay cerca" (120) | 5,8% | 7,5% |
| Salidas (14) | 7,1% | 28,6% |

Métricas de cuantización: divergencia KL media sobre texto de guía retenido de 0,009 para Q5_K_M frente a 0,024 para Q4_K_M (61% menos), con un archivo un 7% mayor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM en uso: 1.415 MiB para Q5_K_M (contexto 4096, batch 512, caché KV en f16, medido con llama.cpp en CPU x86); 1.331 MiB para Q4_K_M.
- RAM de dispositivo sugerida: 6 GB o más. Con unos 0,4 GB para la app, el modelo y la app ocupan aproximadamente el 29% de la RAM sugerida.
- GPU recomendadas: no disponibles en la información proporcionada; el autor midió en CPU x86 y el destino es Android.
- Cabe en GPU de consumo: sí, por tamaño (1,3-1,4 GB en uso), aunque no se documentan pruebas en GPU concretas como RTX 4090, A100 o H100.
- Opciones de despliegue: llama.cpp (`llama-server -m qwen3.5-2b-travel-en-Q5_K_M.gguf -c 4096`); compatible con endpoints. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| qwen3.5-2b-travel-en (este) | ≈1,9 B | 4096 (config. app) | en | CC-BY-SA-4.0 | GGUF | Asistente de viaje RAG con rechazo controlado |
| Qwen/Qwen3.5-2B (base) | ≈1,9 B | no disponible | multilingüe | no disponible en la información | safetensors, GGUF (unsloth) | Modelo generalista |
| unsloth/Qwen3.5-2B-GGUF UD-Q4_K_XL | ≈1,9 B | no disponible | multilingüe | no disponible en la información | GGUF | Modelo generalista cuantizado |

No se dispone de datos de benchmarks estándar ni de otros ajustes finos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un chatbot general ni una fuente de conocimiento: sin contexto en el prompt, rechaza responder. No debe usarse como asistente conversacional abierto.
- Solo responde en inglés; no soporta otros idiomas.
- Respuestas limitadas a tres frases y fundamentadas únicamente en el contexto inyectado; fuera de ese patrón su utilidad es nula.
- Riesgo de rechazo incorrecto en preguntas respondibles: 3,2% en país, 5,8% en "qué hay cerca" y 7,1% en salidas, según la evaluación del autor.
- Riesgo de alucinación no medido de forma independiente; el diseño mitiga respuestas sin contexto, pero no se documentan evaluaciones de fidelidad factual fuera del conjunto de prueba.
- Sesgos: no documentados; el corpus proviene de Wikivoyage, Wikipedia, consejos gubernamentales de Canadá y Reino Unido, con posible sesgo geográfico y cultural de esas fuentes.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y compartir bajo la misma licencia las obras derivadas; revisar condiciones antes de integrarlo en productos propietarios.
- El archivo Q4_K_M está obsoleto y solo se mantiene por compatibilidad con Pocket Travel 0.13 y anteriores; no debe usarse en producción.
- El modelo base Qwen3.5-2B no se detalla en la información disponible (arquitectura exacta, contexto nativo, licencia del base), lo que limita la evaluación de restricciones heredadas.
- Fecha de creación del repositorio: 2026-10-11; última actualización: 2026-11-05. 327 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pockettravel/qwen3.5-2b-travel-en-GGUF
- Colección Pocket Travel: https://huggingface.co/collections/pockettravel/pocket-travel
- Repositorio de la app: https://github.com/miracle091/pocket-travel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF del modelo base usado en la evaluación: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Dataset de conversaciones de viaje: https://huggingface.co/datasets/soniawmeyer/travel-conversations-finetuning
- Dataset TruthfulQA: https://huggingface.co/datasets/truthfulqa/truthful_qa
- Dataset Alpaca cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq
- Dataset MKQA: https://huggingface.co/datasets/apple/mkqa
- Modelo de traducción MarianMT: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-it-en
