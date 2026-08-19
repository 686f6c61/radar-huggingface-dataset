# immortaltatsu/ghostai-v2

## Resumen

GhostAI v2 es un modelo de lenguaje especializado en planificación y ejecución de operaciones con criptomonedas en la red Solana, diseñado para funcionar en dispositivos móviles. Desarrollado por el usuario immortaltatsu, es la segunda iteración de la serie Ghost AI y se obtiene mediante fine-tuning del modelo base Qwen/Qwen3.5-0.8B, un transformer de 752 millones de parámetros. El modelo genera planes estructurados en JSON y ejecuta llamadas a herramientas (function calling) para completar tareas como swaps, transferencias o consultas de saldo.

La principal innovación frente a la versión anterior (ghostai-alpha) es el uso de destilación de profesor con rejection sampling: los datos de entrenamiento se generaron a partir de un modelo mucho mayor (Qwen3.6-35B-A3B) y se filtraron mediante cuatro compuertas de validación, lo que aumenta la diversidad de los planes y las preguntas de clarificación. El modelo se distribuye en formato GGUF con tres niveles de cuantización, siendo la versión Q4_K_M (505 MB) la orientada a entornos móviles.

GhostAI v2 es relevante porque aborda un caso de uso muy concreto —asistentes de criptomonedas on-device— con un modelo pequeño y eficiente que puede ejecutarse sin conexión a servidores. Aunque no se publican benchmarks comparativos con otros modelos, las métricas de evaluación interna muestran una mejora sustancial en generalización respecto a la versión alpha, con una precisión de tokens del 94,49 % en un split de evaluación genuinamente separado del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (formato GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (hereda del modelo base Qwen3.5-0.8B) |
| Formato de pesos | GGUF (tambien safetensors segun tags, aunque el repo contiene principalmente GGUF) |

## Arquitectura y entrenamiento

GhostAI v2 parte del checkpoint Qwen3.5-0.8B, un transformer denso de 752 millones de parámetros. El fine-tuning se realizó con un conjunto de 2.969 filas de entrenamiento generadas mediante destilación de profesor: el modelo profesor Qwen3.6-35B-A3B produjo ejemplos que fueron filtrados por rejection sampling y validados con cuatro compuertas (contrato de escenario, completitud de movimientos de valor, comprobaciones deterministas de capa 1 y ejecución simulada de capa 2). El resultado es un corpus con una diversidad mucho mayor que la versión alpha: un 96 % de resúmenes de plan únicos y un 96 % de preguntas de clarificación únicas.

Un detalle técnico relevante es que se distribuye el checkpoint de la época 1, no el final del entrenamiento. La pérdida de evaluación aumentó en cada época (0,2162 → 0,2212 → 0,2403) mientras que la precisión se estancaba, lo que indica sobreajuste en las épocas 2 y 3. Además, el archivo config.json establece `mtp_num_hidden_layers: 0`, ya que la cabeza de Multi-Token-Prediction del modelo base no se conserva y llama.cpp esperaría un bloque adicional si no se desactiva.

## Capacidades

- Generación de planes estructurados en JSON siguiendo un esquema predefinido para operaciones de criptomonedas (swaps, transferencias, consultas).
- Function calling: el modelo puede invocar hasta 36 herramientas distintas, de las cuales 31 están cubiertas por el entrenamiento (por ejemplo, `execute_swap`, `send_sol`, `search_token`).
- Razonamiento multi-paso: los planes incluyen secuencias de llamadas a herramientas, con comprobaciones de completitud de movimientos de valor.
- Conversacional: admite diálogos multi-turno con preguntas de clarificación cuando la intención del usuario es ambigua.
- Ejecución on-device: optimizado para entornos con recursos limitados, con una versión cuantizada a Q4_K_M de 505 MB.
- No incluye modo de pensamiento (thinking mode): el uso recomendado desactiva el razonamiento interno con `enable_thinking:false`.

## Casos de uso

- Asistente de criptomonedas en carteras móviles: el usuario puede pedir "swap 2 SOL a USDC" y el modelo genera un plan JSON que la aplicación ejecuta mediante llamadas a herramientas, todo localmente en el dispositivo.
- Automatización de operaciones en Solana: integrado en un bot o agente, el modelo puede completar swaps completos (desde la cotización hasta la ejecución) sin intervención manual, gracias a la corrección de la completitud de los planes de swap.
- Soporte al cliente en exchanges descentralizados: el modelo puede guiar a los usuarios en operaciones complejas, haciendo preguntas de clarificación cuando el token o la intención no están claros.
- Gestión de cartera personal: consultas de saldo, historial de transacciones y detalles de operaciones, aunque algunas herramientas relacionadas (como `get_address_balance` o `get_transaction_detail`) no están entrenadas en esta versión.
- Agentes de ejecución de órdenes: el modelo puede planificar y ejecutar transferencias de SOL y tokens SPL, con la limitación conocida de que los tokens no-SOL no siempre resuelven el identificador correcto.
- Prototipos de asistentes financieros on-device: gracias a su tamaño reducido y a la cuantización Q4_K_M, puede desplegarse en teléfonos o dispositivos edge sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta métricas de entrenamiento y evaluación interna:

| Metrica | Epoch 1 (enviado) | Epoch 2 | Epoch 3 |
|---|---|---|---|
| Pérdida de evaluacion | 0,2162 | 0,2212 | 0,2403 |
| Precision de tokens (eval) | 0,9449 | 0,9471 | 0,9472 |

La pérdida final de entrenamiento fue 0,1843. La pérdida de evaluación es superior a la de entrenamiento y la precisión de evaluación inferior, lo que indica que las métricas miden generalización y no memorización. No hay comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión Q4_K_M (505 MB) puede ejecutarse en dispositivos con menos de 1 GB de memoria disponible; la versión Q8_0 (774 MB) requiere aproximadamente 1,5 GB; la versión F16 (1,4 GB) necesita unos 2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar la versión F16. Para móviles, la versión Q4_K_M está pensada para SoCs con aceleración NPU o GPU integrada.
- Compatibilidad con GPU de consumo: sí, todas las versiones caben en GPUs de consumo actuales, incluso en iGPUs modernas.
- Opciones de despliegue: llama.cpp (recomendado, con `llama-cli`), compatible con servidores GGUF como llama-server, y potencialmente con Ollama si se convierte el GGUF. También puede usarse con vLLM si se convierte a safetensors.
- Latencia y throughput: no disponibles en la documentación. Dado el tamaño del modelo, se espera una latencia baja en CPU moderna (del orden de decenas de milisegundos por token) y aún menor en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar GhostAI v2 con otros modelos de la misma categoría (asistentes de criptomonedas on-device). El único punto de comparación directo es su predecesor, ghostai-alpha:

| Caracteristica | ghostai-alpha | ghostai-v2 |
|---|---|---|
| Datos de entrenamiento | Plantillas deterministas | Destilacion de profesor (Qwen3.6-35B-A3B) |
| Filas de entrenamiento | 918 | 2.969 |
| Diversidad de planes | 8 % unicos | 96 % unicos |
| Diversidad de preguntas | 4 % unicas | 96 % unicas |
| Herramientas ejercitadas | 25 / 36 | 31 / 36 |
| Split de evaluacion | 25 % con gemelo en train | 0 % solapamiento |

No se han encontrado otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Transferencias de tokens no-SOL (por ejemplo, BONK) no resuelven el identificador del token: el modelo emite `send_sol` sin una llamada previa a `search_token`, violando la regla de procedencia. Esto ocurre porque los ejemplos correctos (70/70) son superados en número por los incorrectos (38 a 130) en el split de entrenamiento.
- Tokens no reconocidos no se clarifican: ante una entrada como "send 10 hood a mystic.seeker", el modelo asume una transferencia en lugar de preguntar qué token se quiere usar, debido a la escasez de ejemplos de este tipo (solo 12).
- Herramientas sin entrenar: 5 de las 36 herramientas no están cubiertas por el entrenamiento (`add_contact`, `get_address_balance`, `get_transaction_detail`, `prediction_claim`, `prediction_sell`), por lo que el modelo no las invocará correctamente.
- Categorías débiles: los planes de `planning/private-swap` (60 % de precisión) y `planning/swap` (73 %) son los menos robustos del corpus.
- Salida no restringida: sin gramática restringida, el modelo no produce JSON válido de forma fiable. Es obligatorio usar gramática o esquemas de validación en producción.
- Sin datos sobre sesgos o alucinaciones específicos: no se han evaluado estos aspectos en la documentación.
- Licencia: Apache 2.0, lo que permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/immortaltatsu/ghostai-v2
- Versión anterior (ghostai-alpha): https://huggingface.co/immortaltatsu/ghostai-alpha
- Repositorio GhostAI (proyecto relacionado, no el mismo modelo): https://github.com/therezor/GhostAI
- Otro modelo del mismo autor: https://huggingface.co/immortaltatsu/ghostai-lfm2.5-1.2b-app-v2
- Repo GGUF del autor: https://huggingface.co/immortaltatsu/ghost-ai-gguf
