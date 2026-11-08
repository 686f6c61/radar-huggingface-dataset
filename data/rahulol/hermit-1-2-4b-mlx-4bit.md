# rahulol/Hermit-1.2-4B-MLX-4bit

## Resumen

Hermit 1.2 (4B, MLX 4-bit) es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 desarrollado por el usuario rahulol para la aplicación Hermit, un asistente privado para iPhone y Mac centrado en gestión de cartera de criptomonedas con autocustodia, trading de perpetuos en Hyperliquid, swaps y puentes mediante NEAR Intents y Relay, y productos de rendimiento en Aave. El modelo está diseñado para ejecutarse íntegramente en el dispositivo mediante MLX, de modo que ninguna conversación abandona el teléfono.

El problema que aborda es la fiabilidad de un modelo pequeño en tareas de dominio muy específicas: aritmética de trading (PnL, precio de liquidación, funding, ROE, dimensionamiento de posiciones), invocación de herramientas con fidelidad exacta de direcciones y cantidades, y conocimiento operativo de la propia aplicación. Para ello se aplicó un LoRA SFT sobre el modelo base, se fusionó con los pesos originales y se cuantizó a 4 bits en formato MLX.

La relevancia actual reside en su enfoque de despliegue local: 4.022 millones de parámetros en aproximadamente 2,26 GB, licencia Apache-2.0 y un conjunto de herramientas de function calling adaptado a operaciones financieras reales, lo que lo convierte en un caso de estudio de ajuste fino de dominio sobre un modelo instruct pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó max length 3.072 tokens) |
| Tipos de cuantizacion | MLX 4-bit con group size 64 |
| Idiomas soportados | no disponibles (la model card no los declara; el modelo base es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso en modo instruct sin modo de razonamiento (non-thinking). Sobre él se aplicó un ajuste supervisado con LoRA de rango 16 y alpha 32 sobre las capas de atención y MLP, con tasa de aprendizaje 1.5e-4, 2 épocas, pérdida calculada únicamente sobre los turnos del asistente y longitud máxima de 3.072 tokens. El entrenamiento se ejecutó en una única NVIDIA RTX A6000 (48 GB) durante 67 minutos. Posteriormente el adaptador se fusionó con los pesos base y se convirtió con `mlx_lm.convert` a 4 bits con group size 64, resultando en aproximadamente 2,26 GB.

El conjunto de datos consta de 10.146 conversaciones (unos 15 millones de tokens): 8.449 de invocación de herramientas (aproximadamente 2.100 de matemáticas con calculadora, 560 de envíos, 370 de matemáticas de posiciones, 250 de trades multi-paso y 720 de respuestas simples), 463 conversaciones multi-turno, 480 explicaciones, 386 ejemplos de código de trading, 276 de estrategia y 92 de voz y seguridad. Los datos se generaron y verificaron internamente: las conversaciones de herramientas y matemáticas de trading se construyeron de forma programática con cada número calculado en código y cada argumento de herramienta comprobado para fidelidad exacta; los datos de amplitud se destilaron de Qwen3-30B-A3B-Instruct-2507 (Apache-2.0) y se filtraron; los ejemplos de voz y seguridad se redactaron a mano. No se usaron salidas de API cerradas. La plantilla de chat es ChatML y las llamadas a herramientas usan el formato nativo de Qwen3 `<tool_call>{"name": ..., "arguments": ...}</tool_call>`, con resultados devueltos como `role: "tool"`.

## Capacidades

- Generación de texto y razonamiento de dominio financiero: PnL, precio de liquidación con margen de mantenimiento, funding, ROE, dimensionamiento de posiciones, R-multiples, APR/APY, pérdida impermanente, basis/carry, probabilidades de mercados de predicción y health factor de Aave.
- Invocación de herramientas (function calling) sobre el conjunto real de la aplicación: `calculator`, `get_price`, `get_balances`, `hyperliquid_account`, `position_math`, `search_markets`, `get_yields`, `prepare_trade`, `prepare_swap`, `prepare_send` y `open_add_funds`.
- Cadenas de herramientas de uno y varios pasos (por ejemplo, precio → position_math → prepare_trade), uso de resultados intermedios en la respuesta final y gestión de errores de herramienta.
- Solicitud de un único dato breve cuando falta un argumento obligatorio, en lugar de inventarlo.
- Fidelidad exacta de direcciones y cantidades: checksum de EVM, base58 y números tratados como números.
- Conocimiento on-chain, de cartera y DeFi: EVM/Solana, gas, puentes, aprobaciones, estafas y drainers (se advierte sobre ellos, nunca se construyen), seguridad de frases semilla, Aave, pools de liquidez y depeg de stablecoins.
- Flujos propios de la aplicación Hermit: financiación de la cartera, movimiento de USDC a Hyperliquid, swaps y puentes vía Relay, depósitos y retiros en Aave, lectura de posiciones y riesgo de liquidación.
- Estilo de voz para asistente: respuestas cortas, directas, sin relleno, sin separadores de punto medio y honestidad ante la incertidumbre.
- Restricciones de seguridad: rechazo en una frase llana de ayuda para construir drainers, kits de phishing, malware o CSAM, manteniendo respuestas a preguntas legítimas de seguridad y trading.
- No fabrica precios, saldos ni direcciones; prepara acciones para aprobación con Face ID y nunca afirma que una operación ya se ha ejecutado.
- No dispone de modo de razonamiento visible ni de capacidades de visión o audio declaradas.

## Casos de uso

- Asistente de trading de perpetuos en Hyperliquid: el modelo encadena `get_price` y `position_math` para calcular el precio de liquidación de una posición apalancada y prepara la operación con `prepare_trade`, manteniendo la aprobación final en el usuario mediante Face ID.
- Gestión de cartera con autocustodia en el dispositivo: consulta de saldos con `get_balances`, lectura de posiciones y advertencia de riesgo de liquidación sin que los datos salgan del teléfono, gracias a la ejecución local con MLX.
- Swaps y puentes entre cadenas: uso de `prepare_swap` y `search_markets` para construir una operación de intercambio o puente vía Relay, con verificación exacta de direcciones EVM con checksum y de direcciones base58 de Solana.
- Depósitos y retiros en Aave: consulta de rendimientos con `get_yields`, cálculo del health factor y preparación de la operación con fidelidad exacta de cantidades y símbolos de activo.
- Cálculo de métricas financieras con calculadora: enrutado de PnL, funding, ROE, APR/APY y pérdida impermanente a la herramienta `calculator` en lugar de aritmética en cabeza, lo que elevó la precisión del 41-51 % al 98-99 % en los conjuntos de prueba del autor.
- Educación y seguridad del usuario: explicaciones sobre gas, aprobaciones, drainers, frases semilla y stablecoin depeg, con rechazo de peticiones maliciosas en una sola frase.
- Generación de código de trading: el modelo mantiene 4 de 6 tareas de código de bots de trading que se ejecutan correctamente, útil como asistente de scripting en el propio flujo de la aplicación.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre conjuntos de prueba retenidos sin solapamiento con el entrenamiento (se eliminaron 1.348 casi duplicados del conjunto de entrenamiento), hasta 160 elementos por suite, decodificación greedy y el prompt y la lista de herramientas exactos de la aplicación.

| Metrica | Hermit 1.1 (base Qwen3-4B-Instruct-2507) | Hermit 1.2 |
|---|---|---|
| Llama a la herramienta prepare cuando se pide trade, swap o envío | 26 / 41 | 41 / 41 |
| `prepare_trade` para perpetuos | 13 / 25 | 25 / 25 |
| Dice "prepared" sin llamar a la herramienta | 6 | 0 |
| Llamadas a herramienta totalmente correctas (decisión, herramienta y argumentos) | 59 % | 87 % |
| Argumentos exactos (direcciones, cantidades, símbolos) | 59 % | 88 % |
| Matemáticas de trading con la herramienta calculadora (dos conjuntos) | 41 % / 51 % | 98 % / 99 % |
| Matemáticas de trading sin herramientas | 29-30 % | 68-71 % |
| Líneas rojas de seguridad rechazadas | 6 / 6 | 6 / 6 |
| Preguntas legítimas de borde rechazadas por error | 1 / 6 | 0 / 6 |
| Respuestas descontroladas en 50 chats multi-turno | 4 | 0 |
| Tareas de código de bots de trading que se ejecutan | 4 / 6 | 4 / 6 |
| Preguntas de conocimiento respondidas sin llamada innecesaria a herramienta | 154 / 160 | 74 / 160 |

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 2,26 GB para los pesos en MLX 4-bit con group size 64, más overhead de contexto y del runtime de MLX.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (series M1, M2, M3, M4); en Mac con `mlx-lm` se ejecuta sobre memoria unificada. Para el entrenamiento original se usó una NVIDIA RTX A6000 (48 GB), pero esa GPU no es el destino de inferencia del artefacto publicado.
- ¿Cabe en GPU de consumo? El artefacto es MLX, no GGUF ni safetensors estándar para CUDA; en el ecosistema Apple Silicon cabe holgadamente en equipos con 8 GB o más de memoria unificada. Para GPUs NVIDIA de consumo sería necesaria una conversión a otro formato, no incluida en el repositorio.
- Opciones de despliegue: `mlx-lm` en Mac (comando `mlx_lm.generate` documentado en la model card) y la propia aplicación Hermit para iPhone y Mac, que descarga el modelo una vez por Wi-Fi y lo ejecuta en el dispositivo. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados por el autor: temperatura ≤ 0,6, top_p 0,9, penalización de repetición 1,05 sobre los últimos 256 tokens y parada en `<|im_end|>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Hermit 1.2 (4B, MLX 4-bit) | 4.022 M | no disponible | MLX 4-bit (group size 64) | Apache-2.0 | Asistente de trading y DeFi on-device con function calling |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.000 M aprox. | no disponible | safetensors (original) | Apache-2.0 | Modelo instruct generalista sin modo thinking |
| Hermit 1.1 (4B, MLX 4-bit) | 4.022 M | no disponible | MLX 4-bit | Apache-2.0 | Versión anterior del mismo ajuste, con menor precisión en herramientas y matemáticas |

El modelo base y la versión 1.1 son las referencias directas disponibles en la información proporcionada; no se dispone de datos de otros modelos comparables de la misma categoría para esta comparativa.

## Limitaciones y advertencias

- Modelo pequeño on-device: el propio autor advierte que puede seguir cometiendo errores.
- Debilidad conocida: con herramientas disponibles, la versión 1.2 a menudo realiza una llamada de solo lectura adicional (precio, calculadora, búsqueda de mercado) en preguntas que no la necesitan; la tasa de respuestas de conocimiento sin llamada innecesaria cayó de 154/160 a 74/160 respecto a 1.1. El autor indica que una revisión posterior del repositorio aborda este problema.
- No fabrica precios, saldos ni direcciones y nunca afirma que una operación ya se ha ejecutado; las acciones se preparan para aprobación del usuario con Face ID.
- Riesgo de alucinación en datos en vivo: los precios, saldos y direcciones deben provenir siempre de las herramientas, no del modelo.
- Idiomas soportados no declarados en la model card; el ajuste está orientado a las conversaciones en inglés de la aplicación.
- Longitud de contexto no declarada; el entrenamiento usó 3.072 tokens como máximo, por lo que el comportamiento más allá de esa longitud no está validado.
- Restricciones de uso: licencia Apache-2.0, que permite uso comercial, pero el modelo está especializado en los flujos y herramientas de la aplicación Hermit y su rendimiento fuera de ese dominio no está evaluado.
- Las líneas rojas de seguridad se mantienen del ajuste, pero un modelo de 4B no debe considerarse un mecanismo de seguridad robusto por sí solo en producción financiera.
- El artefacto está en formato MLX; no se proporcionan pesos GGUF ni safetensors estándar para otros runtimes en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahulol/Hermit-1.2-4B-MLX-4bit
- Versión anterior: https://huggingface.co/rahulol/Hermit-1.1-4B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de la aplicación: https://github.com/Hermit-Ai-Labs/hermit-app
- Perfil del autor en Hugging Face: https://huggingface.co/rahulol/models
