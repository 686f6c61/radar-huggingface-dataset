# MohammadBeigi/Qwen3.5-0.8B-Persian-Agent

## Resumen

Qwen3.5-0.8B-Persian-Agent es un ajuste fino completo del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario MohammadBeigi y publicado en Hugging Face. Se trata de un asistente compacto orientado al persa (farsi) que busca cubrir chat natural, seguimiento de instrucciones, respuestas con razonamiento y, de forma destacada, llamada de herramientas (tool calling) y function calling en entornos agénticos. Con aproximadamente 752 millones de parámetros reales, está pensado para ejecutarse en CPU, portátiles y dispositivos móviles, lo que lo sitúa en la categoría de modelos pequeños para despliegue local y de bajo coste.

El modelo parte de la arquitectura híbrida Gated DeltaNet + Gated Attention del Qwen3.5 base y se ha entrenado con ajuste fino de todos los parámetros (sin LoRA) en dos etapas: una primera de chat e instrucciones en persa y una segunda específica de tool calling, abstención de herramientas y refuerzo de trayectorias agénticas en persa. Mantiene el inglés del modelo base como idioma secundario y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y cuantizaciones GGUF (Q8_0 y Q4_K_M con imatrix persa).

Su relevancia actual radica en la escasez de modelos pequeños, abiertos y realmente competentes en persa con soporte de function calling, un nicho donde la mayoría de alternativas o son modelos grandes y costosos o carecen de capacidades agénticas. La ventana de contexto usada en entrenamiento es de 1.536 tokens, un dato importante a la hora de evaluar su idoneidad para conversaciones largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet + Gated Attention (heredada de Qwen3.5) |
| Parametros totales | 752.393.024 (~0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.536 tokens usados en entrenamiento (contexto nativo del base no disponible) |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q8_0, GGUF Q4_K_M (con imatrix persa) |
| Idiomas soportados | Persa (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura híbrida del Qwen3.5-0.8B, que combina capas Gated DeltaNet con capas de atención con compuerta (Gated Attention). Sobre esta base se realizó un ajuste fino de parámetros completos en dos etapas, con AdamW de 8 bits, scheduler coseno, pérdida solo sobre tokens del asistente (completion-only loss) y batch efectivo de 8, ejecutado en 2× NVIDIA T4 con DDP. La primera etapa (chat e instrucciones en persa, ~30.600 ejemplos) mezcla datos SFT y QA en persa de fuentes como Maux, Persian QA, conocimiento general, ParsiNLU entailment, matemáticas y razonamiento en persa, Persian-English Thinking, Matina, ParsMap y Aya Persian, con una pequeña porción de SlimOrca para preservar el inglés, a un learning rate de 3e-5.

La segunda etapa se centra en tool calling y abstención, usando datos de xLAM/APIGen y Hermes function calling, con trayectorias de herramientas en persa variadas proceduralmente en dominios como clima, cuotas de préstamos, búsqueda de inventario, recordatorios de calendario y conversión de moneda a toman, además de ejemplos negativos que enseñan al modelo a no invocar herramientas irrelevantes y un buffer de repetición de chat en persa para evitar olvido, con learning rate de 1,5e-5. El autor indica que probó preentrenamiento continuado con texto web persa crudo y lo descartó porque degradaba la calidad posterior para este tamaño de modelo.

## Capacidades

- Generación de texto conversacional en persa con tono natural y respuestas concisas.
- Seguimiento de instrucciones y respuestas con estilo de razonamiento.
- Llamada de herramientas y function calling con salida estructurada en formato `<tool_call>`.
- Abstención de herramientas: cuando ninguna herramienta encaja, responde directamente en lugar de inventar una llamada.
- Razonamiento multi-paso básico orientado a agentes.
- Capacidades multilingües limitadas a persa (principal) e inglés (secundario).
- Modo thinking desactivable mediante `enable_thinking=False` en la plantilla de chat.
- Conversación multi-turno con plantilla de chat compatible con Transformers.

## Casos de uso

- Asistente conversacional en persa para atención al cliente: el modelo gestiona diálogos multi-turno con respuestas breves y precisas, adecuado para integraciones en widgets web o mensajería donde el coste por inferencia debe ser mínimo.
- Agente local de conversión de divisas: con la herramienta `convert_currency` y trayectorias entrenadas en persa, puede resolver consultas del tipo "200 dólares a toman" invocando la función correcta con parámetros estructurados.
- Automatización de recordatorios de calendario: el modelo ha sido entrenado con trayectorias de recordatorios en persa, por lo que puede transformar peticiones en lenguaje natural en llamadas a APIs de calendario.
- Consultas de inventario y stock: útil en paneles internos o bots de almacén donde el usuario pregunta en persa y el modelo genera la llamada de búsqueda con los filtros adecuados.
- Cálculo de cuotas de préstamos: las trayectorias de dominio financiero permiten integrarlo en simuladores o asistentes bancarios en persa que invocan funciones de amortización.
- Consultas meteorológicas: puede mapear preguntas en persa sobre el tiempo a una función de clima con ciudad y fecha como parámetros.
- Asistente de escritorio o móvil offline: gracias a sus cuantizaciones GGUF Q8_0 y Q4_K_M, puede ejecutarse con llama.cpp, LM Studio u Ollama en portátiles y teléfonos sin conexión.
- Chatbot educativo en persa: responde preguntas de conocimiento general, matemáticas y QA gracias a los datos de ParsiNLU, Persian QA y Persian Math SFT usados en el ajuste.

## Benchmarks y rendimiento

La model card incluye una evaluación con una suite de pruebas en persa (perplejidad sobre conjunto retenido y sondas específicas de fluidez, conocimiento, seguimiento de instrucciones y tool calling) frente al modelo base. La tabla publicada está incompleta en la información disponible: solo se muestra la fila del modelo base.

| Modelo | Persian PPL ↓ | Persian probes ↑ |
|---|---|---|
| Qwen/Qwen3.5-0.8B (base) | 13.144 | 8/14 (57,1%) |
| Qwen3.5-0.8B-Persian-Agent | no disponible en la información proporcionada | no disponible en la información proporcionada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para FP16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y KV cache; cómodo en GPUs con 4 GB o más.
- GGUF Q8_0: en torno a 0,8 GB de pesos; recomendado por el autor como opción casi sin pérdida para un modelo de 0,8B.
- GGUF Q4_K_M: la opción más pequeña, con cierta pérdida de calidad, para dispositivos muy limitados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo con holgura; también tarjetas de gama baja e iGPUs. El ajuste fino se realizó en 2× NVIDIA T4, lo que da una idea de la modestia de los requisitos.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas actuales e incluso en CPU.
- Opciones de despliegue: Transformers, vLLM (según la model card), llama.cpp, LM Studio y Ollama (con `ollama run hf.co/MohammadBeigi/Qwen3.5-0.8B-Persian-Agent:Q8_0`).
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, se espera inferencia interactiva en CPU y muy rápida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Tool calling | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Persian-Agent | ~0,75B | 1.536 (entrenamiento) | fa, en | Sí (entrenado específicamente) | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (base) | ~0,75B | no disponible | multilingüe (según base) | no disponible | Apache 2.0 |
| Alternativas pequeñas especializadas en persa | no disponible | no disponible | fa | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de modelos comparables, por lo que la comparación cuantitativa no está disponible. El base Qwen3.5-0.8B es la referencia directa, y el ajuste persa añade capacidades de chat y tool calling en persa a costa de un contexto de entrenamiento corto (1.536 tokens).

## Limitaciones y advertencias

- Contexto de entrenamiento muy corto (1.536 tokens): las conversaciones o documentos largos pueden degradar la calidad; no está pensado para contextos extensos.
- Modelo de menos de mil millones de parámetros: menor conocimiento factual y mayor riesgo de alucinación que modelos grandes, especialmente en dominios no cubiertos por los datos de ajuste.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero al entrenarse con datos persa de múltiples fuentes puede heredar sesgos culturales y de género de esos corpus.
- Cobertura de idiomas limitada a persa e inglés; otros idiomas no están garantizados.
- El tool calling está entrenado con un conjunto acotado de dominios (clima, préstamos, inventario, calendario, divisas); fuera de esos patrones la fiabilidad puede caer.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de ajuste si se redistribuye el modelo.
- La evaluación publicada está incompleta en la información disponible, por lo que no se puede verificar la mejora frente al base con cifras completas.
- El modelo se publicó en noviembre de 2026 con 0 descargas y 1 like, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MohammadBeigi/Qwen3.5-0.8B-Persian-Agent
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
