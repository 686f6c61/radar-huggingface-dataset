# jjge007/Jaaiva-i1-weights

## Resumen

Jaaiva Test1 es un modelo de lenguaje conversacional de 503 millones de parametros entrenado completamente desde cero por el desarrollador independiente jjge007. No utiliza pesos preentrenados, ni tokenizer preentrenado, ni destilacion, ni llamadas a APIs externas: tanto los pesos como las fusiones BPE del tokenizer fueron aprendidos por el propio codigo de entrenamiento. Se trata de un artefacto de investigacion, no de un asistente listo para produccion.

Arquitectonicamente es un transformer decoder-only con 25 capas, 20 cabezas de atencion, anchura de 1.280 y una ventana de contexto de 1.024 tokens. Emplea pre-LayerNorm, proyecciones QKV fusionadas, atencion causal con scaled dot-product de PyTorch, embeddings de entrada y salida compartidos e inicializacion residual al estilo GPT-2. El vocabulario es de 8.192 merges BPE a nivel de byte, aprendido del propio corpus.

Su relevancia es fundamentalmente metodologica: demuestra que es posible entrenar un chatbot funcional desde cero en hardware de consumo (una AMD Radeon RX 9070 XT con ROCm 7.2) con un presupuesto de computo modesto. El checkpoint recomendado ha visto dos pasadas sobre 367,5 millones de tokens mas un ajuste por instrucciones, y esta disponible unicamente en ingles y para uso de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (pre-LayerNorm, QKV fusionadas, embeddings compartidos) |
| Parametros totales | 503.381.760 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en precision original PyTorch) |
| Idiomas soportados | Ingles |
| Licencia | Other (uso exclusivo de investigacion) |
| Formato de pesos | PyTorch pickle (`.pt`), requiere `torch.load(..., weights_only=False)` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only clasica con 25 capas, 20 cabezas de atencion, dimension de modelo de 1.280 y MLP con activacion GELU. Usa bloques pre-LayerNorm, proyecciones QKV fusionadas, atencion causal con scaled dot-product de PyTorch, embeddings de entrada/salida atados e inicializacion residual estilo GPT-2. El entrenamiento empleo gradient checkpointing. El tokenizer es un BPE a nivel de byte con 8.192 merges aprendidos del corpus, con tokens especiales `<|pad|>`=0, `<|bos|>`=1, `<|eos|>`=2, `<|user|>`=3 y `<|assistant|>`=4. El formato de entrenamiento es `<|bos|><|user|> ... <|assistant|> ... <|eos|>`, calculando la perdida solo sobre los tokens del asistente y el token de fin de respuesta.

El pretraining consumio 367.477.225 tokens en una epoca y 3.739 pasos, con un batch efectivo de 98.304 tokens por paso (12 secuencias x 1.024 tokens x 8 de acumulacion de gradientes), autocast bf16, AdamW fusionado, warmup lineal con decaimiento coseno y gradient checkpointing. El corpus combina DailyDialog, PersonaChat, EmpatheticDialogues, BlendedSkillTalk, SODA y WikiText-103. Se ejecuto en una AMD Radeon RX 9070 XT (gfx1201) a traves de ROCm 7.2, con un throughput de aproximadamente 16,1k tokens/s, 382 minutos de entrenamiento y un pico de 11 GiB de VRAM. Posteriormente se realizo una segunda pasada de continued pretraining sobre el mismo corpus con un optimizador nuevo, 3.739 pasos y un learning rate maximo de 1,5e-4, durante 384 minutos. El ajuste por instrucciones consistio en 2.500 pasos con learning rate de 4e-5 a 4e-6, mezclando pares de identidad y small-talk, cadenas multiturno, replay general, UltraChat-200k y Dolly-15k. El checkpoint recomendado es el paso seleccionado de esa ejecucion, con 389,3 millones de tokens vistos en total. Se entrenaron tambien una variante con Dolly + Alpaca + UltraChat y otra de baja identidad, pero no se promovieron por obtener peores resultados en la sonda de comportamiento.

## Capacidades

- Generacion de texto conversacional en ingles con respuestas fluidas en dominios cotidianos (small-talk, empatia basica, preguntas simples).
- Conversacion multiturno con historial acotado a 1.024 tokens de contexto.
- Seguimiento de formato de chat mediante los tokens especiales `<|user|>` y `<|assistant|>`.
- Respuestas de identidad consistentes ("i am jaaiva test1, a neural chatbot built from scratch").
- Generacion de chistes y respuestas de relleno simples dentro del estilo aprendido.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre entrenamiento desde cero: sirve como referencia reproducible para estudiar el efecto del continued pretraining y del ajuste por instrucciones en un modelo de 503M, ya que el autor documenta perdida y perplejidad por split y por pasada.
- Experimentos de tokenizer: al incluir el fichero `tokenizer/jaaiva_bpe.json` y el codigo de entrenamiento, permite analizar el impacto de un vocabulario BPE de 8.192 merges aprendido del propio corpus frente a tokenizers preentrenados.
- Docencia y divulgacion: el modelo de 6,85M incluido (`jaaiva-test1-6m-ft.pt`) cabe en CPU y permite ilustrar el ciclo completo de entrenamiento, desde la tokenizacion hasta el muestreo autoregresivo.
- Benchmarking de infraestructura ROCm: el autor reporta throughput de 16,1k tokens/s y 11 GiB de pico en una RX 9070 XT, por lo que el checkpoint es util para validar pipelines de entrenamiento e inferencia en GPUs AMD con ROCm 7.2.
- Estudio de degeneracion y repeticion: el ajuste de penalizacion de repeticion (1,15 frente a 1,05) esta documentado con una sonda de 117 respuestas, lo que lo convierte en un caso practico para investigar bucles degenerativos en modelos pequenos.
- Base para ablaciones de fine-tuning: las variantes no promovidas (Dolly + Alpaca + UltraChat y baja identidad) permiten comparar estrategias de mezcla de datos y su efecto en el comportamiento.
- Prototipado de interfaces de chat: el script `chat.py` incluido sirve como esqueleto minimo para construir un CLI conversacional con historial de seis mensajes.

## Benchmarks y rendimiento

Evaluacion del modelo base (perdida y perplejidad):

| Split | Loss | Perplejidad |
|---|---|---|
| Validacion, primera pasada | 1,4599 | 4,31 |
| Test, primera pasada | 1,4290 | 4,17 |
| Validacion, continued pass | 1,3749 | 3,95 |
| Test, continued pass | 1,3429 | 3,83 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La unica evaluacion conductual reportada es una sonda de 39 prompts fuera del conjunto de fine-tuning con 117 respuestas muestreadas, en la que el modelo respondio con una linea memorizada del fine-tuning aproximadamente el 32% de las veces.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GiB de pico durante el entrenamiento; en inferencia con pesos en bf16 el modelo ocupa alrededor de 1 GiB, mas el estado de activaciones y cache KV para 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 2-4 GiB de VRAM libre para inferencia en bf16; el autor entreno en una AMD Radeon RX 9070 XT (gfx1201) con ROCm 7.2.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes AMD; el modelo de 6,85M cabe incluso en CPU.
- Opciones de despliegue: el repositorio solo proporciona carga directa con PyTorch (`torch.load`) y el script `chat.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no distribuirse en GGUF ni safetensors no es directamente compatible con esos runners sin conversion.
- Latencia y throughput: el autor reporta aproximadamente 16,1k tokens/s durante el entrenamiento en una RX 9070 XT; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Jaaiva Test1 503M | 503M | 1.024 | Ingles | Other (solo investigacion) | PyTorch `.pt` |
| GPT-2 small | 124M | 1.024 | Ingles | MIT | Safetensors, GGUF |
| GPT-2 medium | 355M | 1.024 | Ingles | MIT | Safetensors, GGUF |
| SmolLM-360M | 360M | 2.048 | Ingles | Apache 2.0 | Safetensors, GGUF |

Jaaiva Test1 se situa en el rango de tamano de GPT-2 medium y SmolLM-360M, pero con un vocabulario mucho menor (8.192 frente a 50.257 y 49.152 respectivamente) y un contexto mas corto que SmolLM. A diferencia de estos, su licencia restringe el uso a investigacion y no se distribuye en formatos compatibles con llama.cpp u Ollama. No se dispone de comparaciones de rendimiento con estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo infraentrenado: el checkpoint recomendado ha visto dos pasadas sobre 367M de tokens, muy poco para los estandares actuales; es fluido pero no tiene conocimiento factual fiable.
- El seguimiento de instrucciones es debil: en una sonda de 39 prompts fuera del conjunto de fine-tuning respondio con una linea memorizada aproximadamente el 32% de las veces (por ejemplo, ante "recommend a movie" devolvio un chiste enlatado).
- Alucinacion factual: el autor documenta afirmaciones erroneas, como declarar que la capital de Alemania es Paris, y filtraciones de su propia identidad en respuestas no relacionadas.
- Genera consejos potencialmente inseguros o de baja calidad, como incluir alcohol entre consejos para dormir; no debe usarse para cuestiones medicas, legales, financieras ni de seguridad critica.
- Memoria acotada: el CLI de chat conserva tres intercambios y trunca historiales mas largos al contexto de 1.024 tokens.
- Solo soporta ingles.
- Licencia `other` con uso restringido a investigacion: no esta permitido el uso comercial segun la model card.
- Los pesos se distribuyen como pickles de PyTorch y requieren `torch.load(..., weights_only=False)`, lo que implica riesgos de seguridad al cargar ficheros no verificados.
- No se distribuyen en safetensors ni GGUF, lo que limita su integracion en herramientas de despliegue habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjge007/Jaaiva-i1-weights
