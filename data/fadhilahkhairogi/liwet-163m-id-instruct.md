# fadhilahkhairogi/Liwet-163M-id-instruct

## Resumen

Liwet-163M-id-instruct es un modelo de lenguaje de tipo transformer denso, entrenado desde cero (from-scratch) y ajustado por supervisión (SFT) para tareas conversacionales en indonesio. Lo desarrolla el Grupo 11 del curso de Generative AI de la Universidad Telkom (Indonesia), formado por Fadhilah Akbar Khairogi, Faishal Fakhrillah, Deril Diaz y Niki Najeroo. El nombre "Liwet" es el acrónimo de Lightweight Transformer, y el sufijo 163M hace referencia a sus aproximadamente 163 millones de parámetros efectivos (187.589.376 elementos almacenados en el fichero de pesos por la duplicación del `lm_head`).

El modelo parte del checkpoint base `fadhilahkhairogi/Liwet-163M-id-base` y se ha afinado sobre 165.640 conversaciones multiturno en indonesio, con un total de unos 46,5 millones de tokens procesados en una única época. Su relevancia es acotada pero clara: es un ejemplo de modelo pequeño, entrenado íntegramente desde cero y no derivado de un transformer preexistente, lo que lo convierte en un caso de estudio útil para quienes quieran entender el ciclo completo de preentrenamiento y SFT en un idioma de recursos medios como el indonesio.

Arquitectónicamente es un decoder-only denso con Pre-RMSNorm, atención con Grouped Query Attention (12 cabezas de consulta y 4 de clave/valor), RoPE y SwiGLU, con 16 capas, dimensión oculta de 768 y una ventana de contexto de 2.048 tokens. No está pensado para producción generalista ni para compararse con modelos multilingües de gran escala: es un artefacto académico con licencia no especificada y un vocabulario de 32.000 tokens Byte-Level BPE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (`IndonesianChatLM`): Pre-RMSNorm, GQA 12Q/4KV, RoPE, SwiGLU |
| Parametros totales | 163.013.376 (tied); 187.589.376 elementos almacenados en `model.safetensors` por el `lm_head.weight` sin atar |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye pesos en `bfloat16`) |
| Idiomas soportados | indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`bfloat16`), más `config.json` y `tokenizer.json`; no es un checkpoint `AutoModelForCausalLM` estándar de `transformers` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso construido desde cero, con 16 capas, dimensión oculta de 768, dimensión SwiGLU de 3.072 y vocabulario de 32.000 tokens Byte-Level BPE. Usa Pre-RMSNorm, Grouped Query Attention con 12 cabezas de consulta y 4 de clave/valor (ratio 3:1, lo que reduce el coste de la caché KV), embeddings rotatorios (RoPE) para la codificación posicional y activación SwiGLU en el bloque feed-forward. La ventana de contexto es de 2.048 tokens y los tokens especiales están definidos como `<pad>=0`, `<bos>=1`, `<eos>=2`, `<unk>=3`.

El entrenamiento consistió en una única época de SFT (post-training) sobre 165.640 filas de conversación multiturno en indonesio, con la función de pérdida enmascarada sobre los turnos del asistente (assistant-masked cross-entropy). El cómputo total fue de 46.544.961 tokens (unos 46,5 millones) a lo largo de 5.176 pasos. Los datos provienen de cinco conjuntos: `neosantara/IndoTalkSFT` (132.955 filas), `AksaraLLM/aksara-sft-clean-v6` (17.686), `INTISARI/intisari-indonesian-chat-v5` (15.582), `daruokta/t5gemma2-indonesia-chat-formatted` (2.443) y `LorthGyu/indonesian-chat` (281). No se documenta el preentrenamiento del checkpoint base, ni el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT. El resultado final es una pérdida de validación de 2,0192 y una perplejidad de validación de 7,53.

## Capacidades

- Generación de texto conversacional en indonesio, con formato basado en roles (`User: ...` / `Assistant:`), arrancando con `<bos>` y deteniéndose en `<eos>` o en el siguiente `User:`.
- Diálogo multiturno: el ajuste se realizó sobre conversaciones con múltiples turnos, por lo que mantiene el hilo dentro de la ventana de 2.048 tokens.
- Instrucciones generales de texto (resumen, reescritura, respuesta a preguntas) en la medida en que lo permite un modelo de 163 millones de parámetros.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente, razonamiento multi-paso explícito ni modo "thinking".
- No soporta visión, audio ni otras modalidades.
- Capacidad multilingüe: limitada al indonesio; no se documenta soporte de otros idiomas.
- No se documenta un modo de instrucciones estructurado más allá del formato de roles indicado.

## Casos de uso

- Prototipado educativo de asistentes conversacionales en indonesio: sirve para montar un chatbot de demostración con el formato `User:` / `Assistant:` y validar el pipeline completo (tokenizador, generación, parada en `<eos>`) sin depender de modelos grandes.
- Investigación sobre SFT desde cero: al ser un modelo entrenado íntegramente por el autor y no un fine-tune de un transformer existente, permite estudiar el efecto del enmascarado de pérdida sobre los turnos del asistente y la dinámica de una época de SFT con 46,5 millones de tokens.
- Generación de respuestas cortas en indonesio para tareas de clasificación o etiquetado ligero: con 163 millones de parámetros y contexto de 2.048 tokens, puede ejecutarse en CPU o en GPU de gama baja para tareas de extracción o reformulación acotadas.
- Base para experimentos de destilación o de comparación de arquitecturas: su combinación de GQA 12Q/4KV, RoPE y SwiGLU en un modelo de 16 capas lo hace útil como referencia de arquitectura pequeña en estudios comparativos.
- Entorno de pruebas para evaluar la calidad del indonesio en modelos de escala reducida: permite medir perplejidad y coherencia en un corpus indonesio antes de escalar a modelos mayores.
- Docencia y trabajos de fin de curso: el repositorio incluye instrucciones de carga con `safetensors` y `tokenizers`, lo que facilita reproducir la inferencia en un cuaderno sin depender de `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación reportado por el autor es la pérdida y perplejidad de validación del checkpoint final de SFT:

| Metrica | Valor |
|---|---|
| Val loss (SFT final, paso 5.176) | 2,0192 |
| Val perplexity (SFT final, paso 5.176) | 7,53 |
| Tokens vistos en entrenamiento | 46.544.961 |
| Filas de conversación | 165.640 |

No hay resultados de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: en torno a 0,35-0,4 GB solo para los pesos (187,6 millones de elementos × 2 bytes), más la caché KV y el overhead del runtime; en la práctica, menos de 1 GB en total para contextos cortos.
- En cuantización de 8 bits o 4 bits (si se convierte manualmente, ya que el repo no distribuye versiones cuantizadas) cabría en menos de 0,2 GB, pero no hay ficheros GGUF ni recetas oficiales.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o incluso una GTX 1650 con 4 GB son suficientes. También es viable en CPU.
- Cabe holgadamente en GPU consumer y en placas integradas con suficiente RAM.
- Opciones de despliegue: no es un checkpoint `AutoModelForCausalLM` estándar, por lo que vLLM, TGI u Ollama no lo cargan directamente. El autor documenta la carga con `safetensors.torch.load_file` y `tokenizers.Tokenizer.from_file` sobre la definición de arquitectura propia (`IndonesianChatLM`), que no se distribuye en el repo.
- Latencia y throughput: no disponibles. Por el tamaño, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| Liwet-163M-id-instruct | 163 M (187,6 M almacenados) | 2.048 | Indonesio | no disponible | safetensors (`bfloat16`), carga custom |
| Liwet-163M-id-base | 163 M | no disponible | Indonesio | no disponible | safetensors |
| Modelos indonesios de la familia Merak/SEA-LION (referencia) | no disponible en la informacion proporcionada | no disponible | Indonesio y otros | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Modelo de 163 millones de parámetros: la calidad de razonamiento, el conocimiento factual y la coherencia en respuestas largas son limitados por escala; no es adecuado para tareas que requieran conocimiento profundo o razonamiento complejo.
- Riesgo alto de alucinación en preguntas factuales, especialmente fuera del dominio de los corpus de SFT.
- Ventana de contexto de solo 2.048 tokens: no admite documentos largos ni conversaciones extensas sin truncar.
- Entrenado únicamente en indonesio; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia no especificada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- El repositorio no incluye la definición de la arquitectura `IndonesianChatLM` como módulo importable; hay que reimplementarla a partir de la tabla del model card para cargar los pesos. Esto añade riesgo de errores de mapeo y dificulta la reproducibilidad.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus conversacionales indonesios de origen diverso es probable que herede sesgos de esos datasets.
- No hay versiones cuantizadas oficiales ni integración con runtimes estándar (vLLM, TGI, Ollama, llama.cpp), lo que limita su uso en producción.
- El checkpoint se creó en noviembre de 2026 según los metadatos del repo; no se ha actualizado desde entonces y el número de descargas es cero, por lo que no hay evidencia de uso o validación por parte de la comunidad.
- El formato de prompt es sensible: debe respetarse el `<bos>` inicial, el patrón `User: ...` / `Assistant:` y la parada en `<eos>` o `User:`; desviarse de él degrada la calidad de forma notable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-instruct
- Modelo base: https://huggingface.co/fadhilahkhairogi/Liwet-163M-id-base
- Dataset `neosantara/IndoTalkSFT`: https://huggingface.co/datasets/neosantara/IndoTalkSFT
- Dataset `AksaraLLM/aksara-sft-clean-v6`: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v6
- Dataset `INTISARI/intisari-indonesian-chat-v5`: https://huggingface.co/datasets/INTISARI/intisari-indonesian-chat-v5
- Dataset `daruokta/t5gemma2-indonesia-chat-formatted`: https://huggingface.co/datasets/daruokta/t5gemma2-indonesia-chat-formatted
- Dataset `LorthGyu/indonesian-chat`: https://huggingface.co/datasets/LorthGyu/indonesian-chat
