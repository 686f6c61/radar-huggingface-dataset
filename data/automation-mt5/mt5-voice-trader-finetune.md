# Automation-MT5/mt5-voice-trader-finetune

## Resumen

mt5-voice-trader-finetune es un ajuste fino mediante LoRA del modelo Qwen3-4B-Instruct-2507, desarrollado por Automation-MT5, cuyo propósito es convertir comandos de trading en lenguaje natural (hablado o escrito) en llamadas a herramientas estructuradas en formato JSON para un asistente de voz integrado en MetaTrader 5. El modelo no ejecuta operaciones: actúa como un analizador semántico que traduce frases como "close all positions" o "buy half a lot of gold with stop at 3250" a invocaciones de funciones con nombre y argumentos concretos, o bien formula una pregunta corta cuando faltan parámetros obligatorios.

El modelo base es un transformer denso de 4.022 millones de parámetros (4B), con licencia Apache 2.0 y ventana de contexto heredada de Qwen3-4B-Instruct-2507. El ajuste se realizó con Unsloth en Kaggle sobre un conjunto reducido de comandos y se distribuye tanto como adaptador LoRA (r=16, alpha=16, todas las proyecciones) como en GGUF cuantizado Q4_K_M (2,33 GiB) para inferencia local con llama.cpp u Ollama.

Su relevancia es acotada pero clara: demuestra un patrón práctico de especialización de un modelo pequeño en una tarea de function calling de dominio restringido, con un vocabulario de símbolos fijo (XAUUSD, XAGUSD, EURUSD, GBPUSD, USDJPY, BTCUSD, NAS100, USOIL) y una evaluación exact-match publicada por el autor. Es un componente de parsing, no un agente autónomo de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino LoRA sobre Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 (4B, dato de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507; no se especifica en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M publicado; F16 intermedio en el pipeline de merge; el adaptador LoRA se distribuye sin cuantizar |
| Idiomas soportados | en (inglés únicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `lora_trade/`), GGUF (`mt5-voice-trader.q4_k_m.gguf`), Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros, y aplica un ajuste fino supervisado con LoRA de rango 16 y alpha 16, sin dropout, sobre las proyecciones `q, k, v, o, gate, up, down`. El entrenamiento se ejecutó con `UnslothSFTTrainer` (unsloth 2026.11.6, transformers 5.17.0) sobre la versión del base cuantizada a 4 bits (`unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit`), en un kernel de Kaggle (`denverbim/mt5-voice-trader-finetune`). El adaptador resultante ocupa 132 MiB.

El pipeline de publicación consistió en fusionar el adaptador con el base, exportar a `Qwen3-4B-Instruct-2507.F16.gguf` y cuantizar a Q4_K_M (2,33 GiB). No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; la model card solo indica que se entrenó sobre "un conjunto de comandos pequeño" y que el vocabulario de símbolos es fijo. La innovación técnica destacable no está en la arquitectura, sino en el formato de salida: llamadas a herramientas en el formato `<tool_call>` de Qwen3, con decodificación greedy y temperatura 0 en el Modelfile de Ollama para maximizar la determinación de la salida.

## Capacidades

- Traducción de comandos de trading en lenguaje natural a llamadas a herramientas JSON en formato `<tool_call>` de Qwen3.
- Herramientas cubiertas en el entrenamiento: `open_market_trade`, `close_positions`, `modify_sl_tp`, `get_price`, `get_positions` y la clase `no_tool` (chit-chat sin acción).
- Generación de preguntas cortas de aclaración cuando faltan argumentos obligatorios en el comando.
- Soporte de function calling / tool calling como tarea principal del ajuste.
- Reconocimiento de un vocabulario cerrado de símbolos: XAUUSD, XAGUSD, EURUSD, GBPUSD, USDJPY, BTCUSD, NAS100, USOIL.
- Entrada de voz o texto (el modelo procesa texto; la transcripción de voz corresponde al pipeline externo del asistente).
- Capacidades generales de texto y razonamiento heredadas de Qwen3-4B-Instruct-2507, aunque no evaluadas en esta ficha.
- No soporta ejecución de herramientas: solo emite la llamada.
- No soporta agentes multi-paso ni razonamiento multi-turno complejo de forma verificada; la evaluación es de un solo turno.

## Casos de uso

- Asistente de voz para MetaTrader 5: el modelo recibe la transcripción del trader y emite la llamada `open_market_trade`, `close_positions` o `modify_sl_tp` que el backend ejecuta tras una puerta de confirmación humana. Es adecuado por su entrenamiento específico en el vocabulario de símbolos y en las herramientas de MT5.
- Cierre rápido de posiciones por comando: frases como "close all my euro dollar positions" se mapean a `close_positions` con el filtro de símbolo correcto; la evaluación reporta 9/9 en esta herramienta.
- Consulta de precios por voz: "get_price" se resuelve con 6/6 en la evaluación, útil para consultas rápidas sin interrumpir la operativa.
- Modificación de stop loss y take profit: `modify_sl_tp` obtuvo 15/15 en la evaluación, lo que lo hace fiable para ajustes de riesgo sobre posiciones abiertas.
- Apertura de operaciones de mercado con parámetros: `open_market_trade` con 113/115 aciertos, adecuado para órdenes con lote, símbolo y stop especificados en una sola frase.
- Prototipado de interfaces de trading por lenguaje natural: al distribuirse en GGUF Q4_K_M y con Modelfile de Ollama, permite montar un entorno local de demostración sin GPU dedicada.
- Filtro de intención en pipelines de órdenes: puede usarse como primer clasificador para decidir si un mensaje contiene una intención operativa, siempre con un validador posterior dado su mal rendimiento en la clase `no_tool`.

## Benchmarks y rendimiento

Evaluación publicada por el autor: decodificación greedy, exact-match sobre nombre de herramienta y argumentos, 200 utterances reservadas.

| Herramienta | Resultado |
|---|---|
| `modify_sl_tp` | 15/15 |
| `close_positions` | 9/9 |
| `get_price` | 6/6 |
| `open_market_trade` | 113/115 |
| `no_tool` (chit-chat, sin acción esperada) | 0/55 |
| Total | 143/200 = 71,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia con GGUF Q4_K_M: el archivo pesa 2,33 GiB, por lo que cabe en GPUs consumer con 4 GB o más de VRAM (RTX 3050, GTX 1660, RTX 4060) y también en CPU con llama.cpp.
- Inferencia en F16: aproximadamente 8 GB de VRAM para los 4B parámetros; encaja en RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100.
- Adaptador LoRA con Transformers: requiere cargar el base en 4 bits (bnb-4bit) o en F16; con `device_map="auto"` funciona en una sola GPU consumer de 8 GB o más.
- Despliegue: llama.cpp (`llama-cli`), Ollama (`ollama create` con el Modelfile incluido), Transformers + PEFT. No se documenta soporte explícito para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- El Modelfile fija `temperature 0`, lo que reduce la variabilidad de la salida a costa de determinismo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mt5-voice-trader-finetune | 4B | no disponible | Function calling para MT5, vocabulario cerrado | Apache 2.0 | Hugging Face, GGUF y LoRA |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | Uso general, tool calling genérico | Apache 2.0 | Hugging Face |
| Alternativas de function calling de 3-7B | no disponible | no disponible | Genéricas | variable | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de function calling en la información proporcionada, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- La clase `no_tool` falla por completo (0/55): saludos y preguntas conversacionales ("hi", "who are you", "Good morning") producen llamadas espurias a `get_positions` o `open_market_trade`. Es imprescindible una puerta de confirmación y un validador de intención antes de ejecutar cualquier acción.
- Solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Vocabulario de símbolos fijo: tickers no vistos caen en adivinación, lo que puede generar órdenes sobre instrumentos incorrectos.
- El modelo no ejecuta herramientas; solo emite llamadas. Cualquier integración con una cuenta real requiere un componente externo de ejecución y control de riesgo.
- Riesgo de alucinación en argumentos (lotes, precios, stops) cuando el comando es ambiguo; el autor recomienda tratarlo como parser, no como tomador de decisiones.
- Sin datos publicados sobre sesgos, composición del dataset de entrenamiento ni número de tokens, lo que limita la evaluación de riesgos de dominio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación independiente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y la naturaleza financiera del dominio exigen auditoría propia antes de desplegarlo.
- No es asesoramiento financiero; el autor lo indica explícitamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Automation-MT5/mt5-voice-trader-finetune
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Versión del base usada en entrenamiento: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Kernel de Kaggle de origen: `denverbim/mt5-voice-trader-finetune` (referenciado en la model card; no se proporciona URL directa)
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
