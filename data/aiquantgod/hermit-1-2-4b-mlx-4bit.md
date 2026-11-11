# aiquantgod/Hermit-1.2-4B-MLX-4bit

## Resumen

Hermit 1.2 (4B, MLX 4-bit) es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por el usuario aiquantgod para la aplicación Hermit, un asistente privado de criptomonedas que se ejecuta integramente en el dispositivo (iPhone y Mac) mediante el framework MLX de Apple. El modelo resuelve un problema muy concreto: dotar a un asistente de bolsillo de capacidades fiables de razonamiento financiero y de llamada a herramientas (tool calling) sobre operaciones de trading, DeFi y gestión de carteras de autocustodia, sin que ningun dato del usuario abandone el telefono.

Tecnicamente es un transformer denso de 4.022 millones de parametros, derivado del Qwen3-4B-Instruct-2507 (variante "non-thinking" e instruct), afinado mediante LoRA SFT (r=16 sobre atencion y MLP) y posteriormente fusionado y cuantizado a 4 bits con MLX (group size 64), lo que reduce el peso a aproximadamente 2,26 GB. El contexto maximo no se especifica de forma explicita mas alla de la longitud de entrenamiento (3.072 tokens), por lo que la ventana efectiva del modelo base no se confirma en la informacion disponible.

Su relevancia actual radica en que demuestra un caso de uso real de modelos pequenos especializados: en lugar de competir en benchmarks generales, optimiza tareas acotadas (calculo de PnL, precio de liquidacion, funding, health factor de Aave, cotizaciones de NEAR Intents) y garantiza fidelidad exacta en direcciones y cantidades, con rechazo explicito de peticiones maliciosas como drainers o kits de phishing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507, non-thinking instruct) |
| Parametros totales | 4.022.468.096 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; entrenamiento con max length de 3.072 tokens |
| Tipos de cuantizacion | MLX 4-bit, group size 64 (unica variante publicada en este repo) |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx`; tamano del repo 4,5 GB, pesos cuantizados aprox. 2,26 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de tipo decoder-only en su variante instruct sin modo de razonamiento (non-thinking). Sobre esa base se aplico un ajuste supervisado con LoRA de rango 16 y alpha 32 sobre las capas de atencion y MLP, con tasa de aprendizaje 1,5e-4, 2 epocas, calculo de perdida unicamente sobre los turnos del asistente y longitud maxima de 3.072 tokens. El entrenamiento completo se ejecuto en una unica NVIDIA RTX A6000 (48 GB) durante 81 minutos. Posteriormente los adaptadores se fusionaron en los pesos base y se convirtieron con `mlx_lm.convert` a 4 bits con group size 64.

El conjunto de datos de la primera revision consta de 10.146 conversaciones (aproximadamente 15 millones de tokens): 8.449 de tool calling (unas 2.100 de matematicas con calculadora, 560 de envios, 370 de calculo de posiciones, 250 de trades multi-paso y 720 de respuestas simples), 463 chats multi-turno, 480 explicaciones, 386 ejemplos de codigo de trading, 276 de estrategia y 92 de voz y seguridad. La revision actual anade 493 conversaciones de `get_quote` y 1.385 ejemplos de conocimiento, chat y voz renderizados con las herramientas presentes pero respondidos sin llamada. Todo el material se genero y verifico internamente. El formato de chat es ChatML y las llamadas a herramientas usan el formato nativo de Qwen3 (`<tool_call>{"name": ..., "arguments": ...}</tool_call>`), con resultados devueltos como `role: "tool"`. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno en el contexto de un asistente financiero.
- Razonamiento matematico de trading: PnL, precio de liquidacion con margen de mantenimiento, funding, ROE, dimensionamiento de posiciones, riesgo por operacion, multiplos R, APR/APY, perdida impermanente, basis/carry, probabilidades de mercados de prediccion y health factor de Aave.
- Tool calling nativo sobre 12 herramientas especificas de la app: `calculator`, `get_price`, `get_balances`, `hyperliquid_account`, `position_math`, `search_markets`, `get_yields`, `prepare_trade`, `prepare_swap`, `prepare_send`, `open_add_funds` y `get_quote`.
- Encadenamiento multi-paso de herramientas (por ejemplo, precio, luego `position_math`, luego `prepare_trade`).
- Uso de resultados de herramientas en la respuesta final y gestion de errores de herramienta.
- Fidelidad exacta en direcciones y cantidades (checksum de EVM, case de base58, numeros como numeros).
- Pregunta una aclaracion corta cuando falta un argumento obligatorio.
- Conocimiento on-chain y DeFi: EVM y Solana, gas, puentes, approvals, deteccion de estafas y drainers, seguridad de frases semilla, LPs, depeg de stablecoins.
- Cotizaciones y swaps via NEAR Intents (`get_quote` para preguntas de "cuanto recibiria", sin preparar transacciones).
- Flujos propios de la app Hermit: financiar la cartera, mover USDC a Hyperliquid, swaps y puentes via Relay, depositos y retiros en Aave, lectura de posiciones y riesgo de liquidacion.
- Estilo de voz corto, directo y sin relleno; nunca inventa precios, saldos ni direcciones.
- Lineas rojas de seguridad: rechaza en una frase ayudar a construir drainers, kits de phishing, malware o CSAM, manteniendo respuestas a preguntas legitimas de seguridad y trading.
- No dispone de modo de razonamiento visible ni de capacidades de vision o audio.

## Casos de uso

- Asistente financiero en el dispositivo: el modelo corre integramente en iPhone o Mac via MLX, de modo que las conversaciones sobre saldos, posiciones y direcciones no salen del dispositivo, lo que lo hace adecuado para usuarios que exigen privacidad sobre su cartera.
- Calculo de riesgo en trading de perpetuos: ante preguntas como el precio de liquidacion de un largo apalancado, el modelo enruta la aritmetica no trivial a la herramienta `calculator` y devuelve el resultado exacto con margen de mantenimiento incluido.
- Preparacion de operaciones con aprobacion humana: el modelo llama a `prepare_trade`, `prepare_swap` o `prepare_send` y presenta la accion para que el usuario la apruebe con Face ID, sin afirmar nunca que la operacion ya se ha ejecutado.
- Consultas de rendimiento DeFi: responde sobre yields, APR/APY, perdida impermanente y health factor de Aave usando `get_yields` y `position_math`, util para decidir depositos o retiros.
- Cotizacion de swaps entre cadenas: para preguntas del tipo "cuanto recibiria si cambio X a NEAR", invoca `get_quote` con argumentos exactos y sin preparar la transaccion; si falta la cadena, pide una aclaracion breve.
- Gestion de cartera multi-cadena: consulta saldos y cuentas de Hyperliquid (`get_balances`, `hyperliquid_account`) y explica al usuario el estado de sus posiciones y su riesgo de liquidacion.
- Educacion y soporte dentro de la app: responde dudas sobre gas, puentes, approvals, seguridad de frases semilla y depeg de stablecoins, y advierte sobre estafas y drainers sin proporcionar herramientas para construirlos.
- Integracion en pipelines de desarrollo: al ser un modelo de 4B cuantizado a 4 bits (aprox. 2,26 GB), puede servir como referencia para experimentar con tool calling especializado en dominios financieros en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjuntos de test reservados (sin solapamiento con entrenamiento), hasta 160 items por suite, decodificacion greedy y el prompt exacto de 12 herramientas de la app:

| Metrica | Base (Qwen3-4B-Instruct-2507) | 1.2 (primera) | 1.2 (esta revision) |
|---|---|---|---|
| Preguntas de conocimiento respondidas sin herramienta innecesaria | 154 / 160 | 78 / 160 | 159 / 160 |
| Llama a la herramienta prepare cuando se pide trade, swap o envio | 20 / 41 | 38 / 41 | 41 / 41 |
| `prepare_swap` para swaps | 0 / 8 | 5 / 8 | 8 / 8 |
| "Swap X to NEAR/BTC" con `prepare_swap` exacto | 2 / 12 | 6 / 12 | 12 / 12 |
| Preguntas de cotizacion: `get_quote` con argumentos exactos, nunca prepara | 13 / 20 | 12 / 20 | 20 / 20 |
| Dice "prepared" sin llamar a la herramienta | 9 | 2 | 0 |
| Primera herramienta correcta | 77% | 97% | 100% |
| Argumentos exactos (direcciones, cantidades, simbolos) | 57% | 86% | 88% |
| Matematicas de trading con calculadora (dos conjuntos) | 40% / 52% | 98% / 99% | 99% / 99% |
| Chats multi-turno limpios | 42 / 50 | 41 / 50 | 43 / 50 |
| Lineas rojas de seguridad rechazadas | 6 / 6 | 6 / 6 | 6 / 6 |
| Preguntas legitimas de borde rechazadas por error | 1 / 6 | 0 / 6 | 0 / 6 |

El autor senala que dos de los fallos restantes de argumentos exactos corresponden a precios de stop-loss desviados un centimo por redondeo. No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados a 4 bits ocupan aproximadamente 2,26 GB; el repo completo pesa 4,5 GB. La memoria adicional depende de la longitud de contexto y del runtime.
- GPU recomendadas: el formato es MLX, por lo que el destino natural es hardware Apple Silicon (Mac con chip M-series, iPhone). El entrenamiento se realizo en una NVIDIA RTX A6000 (48 GB), pero los pesos publicados estan en formato MLX y no en GGUF ni safetensors estandar para CUDA.
- Cabe en GPU de consumo: si, en el ecosistema Apple Silicon; no se proporciona una variante GGUF para GPUs NVIDIA de consumo como la RTX 4090.
- Opciones de despliegue: `mlx-lm` en Mac (por ejemplo, `mlx_lm.generate --model ...`); la app Hermit lo descarga una vez por Wi-Fi y lo ejecuta en el dispositivo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La configuracion de muestreo recomendada es temperatura <= 0,6, top_p 0,9, penalizacion de repeticion 1,05 sobre los ultimos 256 tokens y parada en `<|im_end|>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hermit 1.2 4B MLX 4-bit | 4,02B | no disponible (entrenamiento a 3.072 tokens) | Asistente cripto con tool calling especializado | apache-2.0 | Hugging Face, formato MLX |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en esta ficha | Instruct generalista sin modo thinking | apache-2.0 | Hugging Face |
| Hermit 1.1 4B MLX 4-bit (version previa) | 4B | no disponible | Version anterior del asistente cripto | apache-2.0 | Hugging Face |

La comparacion relevante es contra su propio modelo base: Hermit 1.2 mejora de forma sustancial en tool calling (primera herramienta correcta del 77% al 100%, argumentos exactos del 57% al 88%) y en matematicas de trading con calculadora (del 40-52% al 99%), a costa de un rendimiento inferior en conocimiento general sin herramienta (78/160 en la primera revision, corregido a 159/160 en esta). No se dispone de datos de benchmarks generales para comparar con otros modelos de 4B de la misma categoria.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento en tareas generales fuera del dominio cripto y financiero no esta evaluado y probablemente sea inferior al de su base.
- La ventana de contexto efectiva no se declara; el entrenamiento se limita a 3.072 tokens, lo que puede restringir conversaciones largas o documentos extensos.
- Riesgo de alucinacion en precios, saldos y direcciones: aunque el autor afirma que el modelo no los inventa y que enruta la aritmetica a la calculadora, un 12% de argumentos inexactos en el test (88% de exactitud) implica que aun puede producir direcciones o cantidades con errores, algo critico en operaciones con fondos reales.
- Los resultados de benchmarks son internos, generados por el propio autor sobre conjuntos propios, sin validacion externa ni comparacion con estandares publicos.
- Idiomas soportados no declarados; el estilo de voz y los ejemplos estan orientados al ingles y a la app Hermit.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo hereda las condiciones y sesgos del Qwen3-4B-Instruct-2507 subyacente.
- Formato MLX: no hay variantes GGUF ni pesos para CUDA publicados en este repo, lo que limita el despliegue fuera del ecosistema Apple.
- El modelo prepara acciones para aprobacion con Face ID y no ejecuta operaciones; cualquier integracion en produccion debe mantener esa separacion entre preparacion y ejecucion para evitar riesgos financieros.
- No dispone de modo de razonamiento visible, vision ni audio.

## Enlaces

- Hugging Face: https://huggingface.co/aiquantgod/Hermit-1.2-4B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Version anterior: https://huggingface.co/rahulol/Hermit-1.1-4B-MLX-4bit
- Repositorio de la app: https://github.com/Hermit-Ai-Labs/hermit-app (MIT)
