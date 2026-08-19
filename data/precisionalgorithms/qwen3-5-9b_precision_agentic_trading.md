# precisionalgorithms/qwen3.5-9b_precision_agentic_trading

## Resumen

`precisionalgorithms/qwen3.5-9b_precision_agentic_trading` es un ajuste fino LoRA sobre el modelo base `Qwen/Qwen3.5-9B`, desarrollado por el usuario precisionalgorithms. Su propósito es convertir el modelo en un agente de trading autónomo capaz de usar herramientas MCP (Model Context Protocol) contra plataformas como Robinhood, Base y Coinbase. El modelo lee el esquema de las herramientas que recibe, construye argumentos con las unidades correctas, recopila datos antes de actuar y ejecuta órdenes sin pedir confirmación al usuario.

El modelo resuelve el problema de ejecutar estrategias de trading de forma local y privada, sin enviar posiciones ni intenciones a un modelo alojado en la nube. Es relevante porque demuestra que un ajuste LoRA de bajo coste (12 horas en una RTX 3090) puede convertir un modelo generalista en un agente especializado con capacidades de tool use y razonamiento multi-paso, manteniendo la licencia Apache 2.0 del modelo base.

El modelo tiene 9.653 millones de parámetros (9,65B), se sirve con una ventana de contexto de 32K tokens en la configuración recomendada (aunque el base soporta 262K) y está pensado para despliegue local con vLLM. Su principal defecto conocido es que rechaza aproximadamente el 18% de las órdenes válidas, un comportamiento que falla de forma segura pero que limita su usabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-9B (hybrid gated delta networks + attention, vision-language) con adaptador LoRA |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K (base); 32K en la configuracion de serving recomendada (--max-model-len 32768) |
| Tipos de cuantizacion | bf16 (inferencia), 8-bit (entrenamiento LoRA) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un modelo multimodal denso que combina atención híbrida con gated delta networks (24 de sus 32 capas de lenguaje usan este mecanismo) junto con un encoder de visión. Soporta contexto largo de 262K tokens y MTP (Multi-Token Prediction). Sobre esta base, el ajuste LoRA utiliza rank 32 y alpha 64, entrenado sobre 3.000 ejemplos sintéticos generados aleatoriamente. El entrenamiento duró una época (375 pasos, aproximadamente 12 horas) en una RTX 3090 con pesos base en 8 bits, usando Axolotl 0.19.

Los datos de entrenamiento son completamente sintéticos: aproximadamente la mitad consisten en servidores MCP generados con nombres de herramientas, argumentos, anidamiento, tipos, enumeraciones y formatos de error aleatorizados. Esto fuerza al modelo a leer el esquema que tiene delante en lugar de memorizar una API concreta. No se usaron datos de clientes, esquemas propietarios ni datos de brokers en vivo. El autor indica que no se llegó a aplicar el enfoque de pares contrastivos (mismo instrumento y misma superficie de herramienta, una versión comerciable y otra no) que habría podido corregir el problema de rechazo excesivo.

## Capacidades

- Tool use MCP: lee esquemas de herramientas MCP y construye argumentos con las unidades correctas.
- Ejecución agentica: recopila datos antes de actuar y ejecuta sin pedir confirmación.
- Razonamiento multi-paso: encadena secuencias de llamadas a herramientas (58,2% de éxito en secuenciación frente al 0% del base).
- Salida estructurada: emite un objeto JSON con veredicto, confianza, evidencia, problemas bloqueantes y datos faltantes en cada turno.
- Verificación de datos: detecta datos no fiables o corruptos (17,2% de detección de integridad de datos, aunque con significancia marginal).
- Resistencia a inyección de prompts: mantiene un 100% de resistencia a inyecciones.
- Multilingüe: solo inglés declarado, aunque el base Qwen3.5 soporta más idiomas.
- Capacidades multimodales del base: el modelo base incluye encoder de visión, pero el fine-tune no documenta uso de imágenes.

## Casos de uso

- Trading algorítmico local: el modelo ejecuta estrategias de compra/venta contra Robinhood, Base o Coinbase usando MCP, manteniendo las posiciones y la intención del usuario en local. Es adecuado porque lee el esquema de herramientas en tiempo real y construye argumentos con las unidades correctas.
- Automatización de órdenes con verificación previa: antes de ejecutar, el modelo consulta datos de mercado y valida que la orden esté bien formada, reduciendo errores de unidades o argumentos (100% de precisión en unidades y 98,8% en coincidencia de argumentos requeridos).
- Agente de análisis de cartera: puede recopilar datos de múltiples fuentes a través de MCP, estructurarlos en JSON y presentar un veredicto con evidencia, útil para decisiones de rebalanceo.
- Integración en pipelines de trading con vLLM: se sirve como servidor OpenAI-compatible, permitiendo integrarlo en sistemas existentes con tool calling automático.
- Entrenamiento de agentes especializados: sirve como ejemplo de cómo un LoRA de bajo coste puede especializar un modelo generalista en un dominio concreto, útil para investigadores que quieran replicar el enfoque.
- Evaluación de robustez en tool use: el modelo es útil para probar sistemas de agentes que necesitan manejar rechazos y falsos positivos, dado su comportamiento documentado de negarse al 18% de órdenes válidas.

## Benchmarks y rendimiento

El autor publica una tabla de métricas comparando el modelo con el base Qwen3.5-9B sobre 120 casos generados, servidos ambos en bf16 con configuraciones idénticas. Se usó la prueba exacta de McNemar para comparaciones pareadas.

| Metrica | Base | Este modelo | Cambio | p |
|---|---|---|---|---|
| Autonomía en completar tareas | 45,0% | 75,0% | +30,0 | <0,0001 |
| Secuenciación multi-paso | 0,0% | 58,2% | +58,2 | <0,0001 |
| Tasa de parseo de salida estructurada | 50,0% | 98,3% | +48,3 | <0,0001 |
| Corrección del veredicto | 45,0% | 76,7% | +31,7 | <0,0001 |
| Precisión de unidades | 89,3% | 100% | +10,7 | 0,0005 |
| Coincidencia de argumentos requeridos | 88,4% | 98,8% | +10,4 | 0,0063 |
| Validez del nombre de herramienta | 96,7% | 100% | +3,3 | 0,13 |
| Detección de integridad de datos | 0,0% | 17,2% | +17,2 | 0,06 |
| Selección de herramienta | 100% | 76,8% | -23,2 | <0,0001 |
| Tasa de falsos positivos | 0,0% | 18,3% | +18,3 | 0,0001 |
| Decisión (no rechazo) | 95,1% | 81,7% | -13,4 | 0,019 |
| Recuperación de fallos | 78,9% | 65,8% | -13,2 | 0,30 |
| Resistencia a inyección | 100% | 100% | 0 | n/a |

El autor advierte que ocho de estas métricas se miden sobre menos de 100 casos aplicables y que los intervalos de Wilson al 95% deben tratarse como reales. No se proporcionan benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3.5-9B cabe en una GPU de 24 GB (según vLLM Recipes). Con la configuración recomendada (bf16, kv-cache fp8, 32 secuencias concurrentes) se necesita al menos 24 GB de VRAM.
- GPU recomendadas: RTX 3090 (usada para entrenamiento), RTX 4090, A100, H100. Una sola GPU de 24 GB es suficiente para inferencia.
- Entrenamiento: una RTX 3090 con 24 GB fue suficiente para el LoRA (12 horas, 375 pasos).
- Opciones de despliegue: vLLM 0.17 o superior, con flags específicos: `--tool-call-parser qwen3_xml`, `--max-num-seqs 32`, `--kv-cache-dtype fp8`, `--gpu-memory-utilization 0.93`, `--enable-auto-tool-choice`. También es compatible con transformers 5.2 o superior.
- Latencia y throughput: no se proporcionan datos medidos. La configuración con `--max-num-seqs 32` limita la concurrencia para evitar agotar los bloques de caché Mamba.
- Nota importante: el flag `--tool-call-parser` debe ser `qwen3_xml`, no `qwen3` ni `hermes`. El límite de descriptores de archivo debe aumentarse (`--ulimit nofile=65535`) para evitar errores de "Too many open files".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen3.5-9B (base) | 9,65B | 262K | Apache 2.0 | Generalista multimodal |
| qwen3.5-9b_precision_agentic_trading | 9,65B | 32K (serving) | Apache 2.0 | Agente de trading con MCP |
| Qwen3-8B (generacion anterior) | 8B | 32K | Apache 2.0 | Generalista, sin vision |

No se dispone de datos de otros modelos especializados en trading con MCP para comparar directamente. La comparación más relevante es contra el base Qwen3.5-9B, que el autor incluye en su tabla de métricas. El fine-tune mejora drásticamente la salida estructurada y la secuenciación, pero empeora en selección de herramienta y decisión.

## Limitaciones y advertencias

- Rechazo de órdenes válidas: el modelo rechaza aproximadamente el 18% de las órdenes válidas. El autor lo identifica como el defecto principal y advierte que se encontrará en la primera hora de uso. Falla de forma segura (declina en lugar de actuar incorrectamente), pero reduce la operatividad.
- Regresiones en selección de herramienta: la precisión de selección de herramienta cae del 100% al 76,8%, y la tasa de falsos positivos sube del 0% al 18,3%. Esto puede provocar llamadas a herramientas incorrectas.
- Menor decisión: la tasa de decisión (no rechazo) baja del 95,1% al 81,7%, lo que significa que el modelo se vuelve más cauto de lo necesario.
- Recuperación de fallos: empeora del 78,9% al 65,8%, aunque la diferencia no es estadísticamente significativa (p=0,30).
- Datos de entrenamiento sintéticos: no se usaron datos reales de brokers, por lo que el comportamiento en entornos reales puede diferir.
- Dependencia de versiones: requiere vLLM 0.17+ y transformers 5.2+. Con versiones inferiores se obtienen respuestas incorrectas en lugar de errores limpios.
- Idioma: solo inglés declarado. No se garantiza soporte para otros idiomas.
- Sin opinión sobre mercados: el modelo no evalúa si una operación es buena; solo comprueba que la llamada esté bien formada y que los datos sean fiables. El usuario debe proporcionar la estrategia.
- Uso comercial: licencia Apache 2.0, permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/precisionalgorithms/qwen3.5-9b_precision_agentic_trading
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Página de Qwen3.5:9b en Ollama: https://ollama.com/library/qwen3.5:9b
- Receta de vLLM para Qwen3.5-9B: https://recipes.vllm.ai/Qwen/Qwen3.5-9B
