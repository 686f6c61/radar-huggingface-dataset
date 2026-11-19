# curia007/casual-gpt

## Resumen

`casual-gpt` es un modelo de lenguaje decoder-only de aproximadamente 13,9 millones de parámetros entrenado desde cero por el usuario curia007 y publicado en Hugging Face. Emplea una arquitectura de estilo GPT-2 escrita en PyTorch y empaquetada para ser compatible con la API de `transformers` mediante las clases `CasualGPTForCausalLM`, `PretrainedConfig`, `PreTrainedModel` y `GenerationMixin`. Su propósito declarado es la conversación casual y el chat de estilo coloquial, así como servir de base didáctica para experimentar con el entrenamiento de modelos pequeños desde cero.

El modelo destaca por su extrema ligereza: 384 dimensiones ocultas, 6 capas, 6 cabezas de atención, tamaño intermedio MLP de 1536 con activación GELU y una ventana de contexto de tan solo 256 tokens. El vocabulario es de 8192 tokens con tokenizador BPE a nivel de byte. Incorpora tokens especiales de rol (`<|system|>`, `<|user|>`, `<|assistant|>`) y una plantilla de chat integrada en el tokenizador, lo que permite usar `apply_chat_template` directamente.

Es relevante ahora como ejemplo reproducible de pipeline completo de entrenamiento (tokenizador, configuración, pesos y script de entrenamiento en un mismo repositorio) para quienes investigan modelos pequeños o quieren entender el ciclo completo sin depender de pesos preentrenados de gran escala. No obstante, su utilidad práctica en producción es muy limitada y el propio autor lo desaconseja para aplicaciones reales sin evaluación y moderación adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (estilo GPT-2), clase `CasualGPTForCausalLM` |
| Parámetros totales | 13.870.848 (~13,9 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_position_embeddings`) |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no especificada (no disponible) |
| Formato de pesos | safetensors (float32) |
| Tamaño oculto | 384 |
| Capas | 6 |
| Cabezas de atención | 6 |
| Tamaño intermedio MLP | 1536 (GELU) |
| Normalización | LayerNorm (eps 1e-5), bloques pre-norm |
| Embeddings posicionales | absolutos aprendidos |
| Cabeza de salida | atada a los embeddings de entrada |
| Dropout | 0,1 |
| Vocabulario | 8192 (BPE a nivel de byte) |
| Tokens especiales | `<pad>`=0, `<bos>`=1, `<eos>`=2, `<|system|>`=3, `<|user|>`=4, `<|assistant|>`=5 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de estilo GPT-2 con atención causal, seis bloques pre-norm con LayerNorm, embeddings posicionales absolutos aprendidos y la cabeza de lenguaje atada a los embeddings de entrada. El tokenizador es un BPE a nivel de byte entrenado sobre los propios datos de entrenamiento con vocabulario de 8192. El formato de chat renderiza cada turno como `<|role|>contenido<eos>`, y la generación comienza tras `<|assistant|>`.

El script `src/casual_gpt.py` soporta tres fuentes de datos: texto plano (un documento por línea), conversaciones en JSONL con objetos `{"messages": [...]}` y datasets de Hugging Face (por defecto `roneneldan/TinyStories` para texto plano). En el entrenamiento con chats solo contribuyen a la pérdida las respuestas del asistente, enmascarando los tokens de usuario y sistema. Los valores por defecto del script son: tamaño de bloque 256, batch de 32, 5000 pasos, optimizador AdamW (betas 0,9 y 0,95, weight decay 0,1), learning rate 6e-4 con warmup lineal de 100 pasos y decaimiento coseno hasta el 10 %, recorte de gradiente 1,0 y autocast bfloat16 en CUDA (float32 en CPU y MPS). El autor indica explícitamente que el dataset exacto y los hiperparámetros usados para los pesos publicados no están registrados en el repositorio; los valores anteriores son los predeterminados del script. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto conversacional de estilo coloquial en inglés, orientada a small-talk.
- Formato de chat multi-turno mediante plantilla integrada (`apply_chat_template`) con roles de sistema, usuario y asistente.
- Generación condicionada por un mensaje de sistema (`<|system|>`).
- Compatibilidad con la API estándar de `transformers` (`AutoConfig`, `AutoModelForCausalLM`, `GenerationMixin`).
- Entrenamiento y ajuste fino reproducibles mediante el script incluido, con soporte para texto plano, JSONL de chats y datasets de Hugging Face.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento. No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Docencia y aprendizaje sobre entrenamiento de LLM desde cero: el repositorio incluye tokenizador, configuración, pesos y script, lo que permite recorrer el pipeline completo (tokenización, entrenamiento causal, empaquetado para `transformers`) en una sola sesión de laboratorio.
- Experimentación con arquitecturas GPT-2 a pequeña escala: sirve como baseline para probar variaciones de tamaño oculto, número de capas o estrategias de enmascaramiento de pérdida en conversaciones.
- Pruebas de integración de la API de `transformers`: útil para validar flujos de `apply_chat_template`, generación con tokens EOS múltiples y carga de código personalizado en entornos de CI.
- Generación de diálogos sintéticos de relleno para pruebas de interfaz: permite poblar un front-end de chat con respuestas generadas localmente sin coste de API, aceptando la baja coherencia del modelo.
- Ajuste fino sobre dominios de conversación muy acotados: dado su tamaño (13,9 M), puede reentrenarse en minutos sobre un corpus pequeño de diálogos específicos con el propio script.
- Investigación sobre sesgos y alucinación en modelos pequeños: su ventana de 256 tokens y su falta de grounding lo convierten en un caso de estudio controlado para medir tasas de incoherencia y fabricación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se incluyen resultados de evaluación formal y que la calidad no se ha medido en benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (13,9 M de parámetros ocupan unos 55 MB en pesos; el resto del consumo proviene de activaciones y del contexto de 256 tokens).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 o superiores; también funciona en CPU y en Apple MPS (en float32).
- Opciones de despliegue: `transformers` con código personalizado (`trust_remote_code` o importación de `src/casual_gpt.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que la configuración guardada usa `use_cache=False`, lo que desactiva la caché KV y penaliza la velocidad de generación en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| casual-gpt (curia007) | ~13,9 M | 256 | no especificada | Hugging Face, requiere código propio | Entrenado desde cero, chat coloquial, sin benchmarks |
| GPT-2 small (OpenAI) | 124 M | 1024 | MIT | Hugging Face, ampliamente soportado | Referencia clásica de decoder-only pequeño; ~9x más parámetros |
| TinyStories-1M / 33M (Microsoft) | 1 M / 33 M | 512 | MIT (según variante) | Hugging Face | Entrenados para narrativa simple; no orientados a chat |
| SmolLM-135M (Hugging Face) | 135 M | 2048 | Apache 2.0 | Hugging Face | Modelo pequeño moderno con entrenamiento a mayor escala y benchmarks publicados |

No se dispone de datos de rendimiento comparativo para `casual-gpt`, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo muy pequeño (13,9 M de parámetros) con contexto de 256 tokens: las respuestas son cortas y a menudo incoherentes; no puede mantener conversaciones largas.
- Sin grounding ni recuperación: alucina con facilidad y no es apto para preguntas factuales.
- No evaluado para sesgos, contenido ofensivo o seguridad; el dataset de entrenamiento no está documentado, por lo que sus sesgos son desconocidos.
- Generación por muestreo (temperatura 0,8, top-k 50): la misma entrada puede producir respuestas distintas.
- Licencia no especificada: no hay autorización explícita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Requiere código personalizado para cargarse (`casual_gpt.py`), lo que implica ejecutar código del repositorio y complica la integración con herramientas estándar.
- El autor desaconseja explícitamente su uso en producción o en aplicaciones de cara al usuario sin evaluación, filtrado de seguridad y moderación adicionales.
- Solo inglés; no se documenta soporte multilingüe.
- Configuración guardada con `use_cache=False`, lo que reduce el rendimiento de generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/curia007/casual-gpt
- Script de entrenamiento y código del modelo: `src/casual_gpt.py` dentro del repositorio del modelo
- Dataset por defecto para texto plano: https://huggingface.co/datasets/roneneldan/TinyStories
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
