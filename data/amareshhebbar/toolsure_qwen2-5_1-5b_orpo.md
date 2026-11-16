# AmareshHebbar/ToolSure_Qwen2.5_1.5B_ORPO

## Resumen

ToolSure ORPO (Qwen2.5 1.5B Instruct) es un ajuste fino del modelo Qwen2.5-1.5B-Instruct de Alibaba, desarrollado por AmareshHebbar, orientado específicamente a mejorar la fiabilidad del *function calling* en modelos pequeños. El problema que aborda es concreto: los modelos de 1.5B tienden a generar JSON malformado, inventar nombres de funciones, omitir o tipar mal argumentos, o invocar herramientas cuando ninguna encaja. La propuesta del autor es que el fallo está en cómo el modelo escribe la llamada, no en la recuperación de información, por lo que el entrenamiento supervisado con preferencias (ORPO) es más efectivo que el prompting o la decodificación restringida.

El modelo forma parte de la colección ToolSure, que compara cinco métodos de entrenamiento sobre los mismos datos más decodificación restringida. Este checkpoint concreto aplica ORPO en una sola etapa desde el modelo base, combinando la pérdida supervisada sobre la respuesta correcta con una penalización de *odds ratio* contra respuestas defectuosas. Los pesos finales son un adaptador LoRA fusionado en safetensors bf16.

Con 1.543.714.304 parámetros y licencia Apache 2.0, es relevante para despliegues de agentes con herramientas en entornos con recursos limitados, donde un modelo de 7B no es viable económicamente. Su ventana de contexto heredada de Qwen2.5 y su compatibilidad con el formato estándar de tool calls de Qwen2.5 lo hacen integrable sin cambios en servidores que ya parsean ese formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en bf16 safetensors |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.5B parámetros. Sobre esa base se aplica ORPO (Odds Ratio Preference Optimization) en una única etapa: una pérdida supervisada sobre la respuesta correcta más una penalización de odds ratio contra una respuesta defectuosa. Las respuestas defectuosas son errores reales que el modelo base cometió sobre el mismo prompt cuando los hubo; en caso contrario, se generaron corrupciones sintéticas de ocho tipos: función incorrecta, función inventada, argumento ausente, tipo incorrecto, argumento extra, JSON roto, texto en lugar de llamada, y llamada cuando no se necesitaba ninguna.

Los datos de entrenamiento provienen del dataset `AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B`. El ajuste se realizó con LoRA (r=64, alpha=128, dropout=0.0), learning rate 5e-05, 1 epoch, micro-batch 2 con acumulación de gradiente 8, warmup ratio 0.05, longitud máxima 3584 tokens, `logits_chunk` 1024 y lambda 0.1. El adaptador resultante se fusionó en pesos completos bf16. La innovación destacable no es arquitectónica sino metodológica: el uso de errores reales del modelo base como negativos en ORPO, lo que alinea la penalización con los fallos que realmente ocurren en producción.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct.
- *Function calling* / *tool calling* con salida en formato estándar Qwen2.5: un bloque `<tool_call>{...}</tool_call>` por llamada.
- Llamadas paralelas a múltiples funciones en una misma respuesta (evaluado en la categoría Parallel de BFCL).
- Decisión de no invocar ninguna herramienta cuando el prompt no lo requiere (evaluado como *irrelevance*).
- Relleno de argumentos con tipos correctos y sin parámetros inesperados (validado con el checker AST de BFCL).
- Integración directa con servidores que parsean tool calls de Qwen2.5, por ejemplo vLLM con `--tool-call-parser hermes`.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni *thinking mode*.

## Casos de uso

- **Atención al cliente con agentes de herramientas**: el modelo decide cuándo consultar una API de pedidos, devoluciones o estado de envío y cuándo responder directamente, gracias a su tasa de irrelevancia del 60,4 % en BFCL, que reduce llamadas innecesarias frente al modelo base con prompting (64,6 %) y muy por encima del mismo base con system prompt estricto (29,2 %).
- **Orquestación de agentes multi-paso en producción**: con un AST mean de 84,9 en BFCL y una tasa de funciones alucinadas del 0,5 %, es adecuado como primer eslabón de un pipeline donde cada llamada mal formada cuesta un reintento o un fallo en cascada.
- **Enrutamiento de consultas a microservicios**: el modelo traduce lenguaje natural a llamadas JSON válidas (99,2 % de JSON parse rate) hacia funciones internas, lo que permite sustituir reglas frágiles por un modelo de 1.5B desplegable en una sola GPU consumer.
- **Despliegue de alto volumen y bajo coste**: con una latencia p50 de 0,21 s en vLLM a batch 1 y un coste estimado de 0,0045 USD por 1.000 consultas, encaja en escenarios de decenas de millones de peticiones donde un 7B (0,0155 USD/1.000) triplicaría el coste.
- **Validación previa a ejecución de herramientas**: al reducir funciones inventadas al 0,5 % y garantizar JSON parseable en el 99,2 % de los intentos, puede colocarse como generador de llamadas antes de un validador de esquema, minimizando rechazos.
- **Prototipado rápido de asistentes con herramientas en local**: al ser un checkpoint de 1.5B con licencia Apache 2.0 y pesos safetensors, se puede servir con vLLM o TGI en una estación de trabajo sin depender de APIs externas.
- **Investigación comparativa de métodos de alineación para tool use**: la colección ToolSure incluye SFT, ORPO y decodificación restringida sobre los mismos datos, lo que permite reproducir y comparar metodologías con un mismo checker.

## Benchmarks y rendimiento

Resultados publicados por el autor (decodificación greedy, mismo checker; BFCL son precisión AST en categorías non-live; irrelevance es la proporción de prompts donde el modelo correctamente no llama; xLAM held out es precisión exacta de llamada sobre 500 ejemplos no usados en entrenamiento; latencia a batch 1 en vLLM; coste asumiendo 1,0 USD/hora de GPU):

| Modelo | BFCL Simple | BFCL Multiple | BFCL Parallel | BFCL Parallel multiple | BFCL AST mean | Irrelevance | xLAM held out | JSON parse rate | Hallucinated function rate | Latency p50 (s) | Coste por 1k queries (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5 1.5B Instruct (prompted) | 91,5 | 86,5 | 80,0 | 79,0 | 84,2 | 64,6 | 84,2 | 99,2 | 0,7 | 0,21 | 0,0054 |
| Qwen2.5 1.5B Instruct (strict system prompt) | 91,5 | 88,0 | 80,0 | 76,5 | 84,0 | 29,2 | 83,8 | 99,2 | 0,9 | 0,21 | 0,0051 |
| Qwen2.5 1.5B Instruct (constrained decoding) | 92,0 | 87,0 | 80,5 | 79,0 | 84,6 | 63,7 | 83,2 | 99,6 | 0,0 | 1,21 | 0,0546 |
| Qwen2.5-7B-Instruct (prompted, referencia) | 94,5 | 93,5 | 89,0 | 85,5 | 90,6 | 67,5 | 86,8 | 99,8 | 0,5 | 0,73 | 0,0155 |
| ToolSure SFT | 91,8 | 90,5 | 82,0 | 79,5 | 85,9 | 29,6 | 86,2 | 99,3 | 1,0 | 0,20 | 0,0044 |
| **ToolSure ORPO** | **91,5** | **84,5** | **84,5** | **79,0** | **84,9** | **60,4** | **84,0** | **99,2** | **0,5** | **0,21** | **0,0045** |

No se publican resultados de MMLU ni de benchmarks generales de razonamiento o código en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1.543.714.304 parámetros × 2 bytes), más overhead de KV cache y activaciones; el repo ocupa 3,4 GB.
- Cabe holgadamente en GPUs consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, así como en GPUs de datacenter (A100, H100, L40S) con amplio margen para batching.
- En cuantización de 8 bits o 4 bits (no publicada por el autor, pero aplicable con herramientas estándar) cabría en GPUs de 6-8 GB.
- Opciones de despliegue: vLLM es la vía documentada por el autor, con `--tool-call-parser hermes` para parsear las llamadas; también es compatible con TGI (`text-generation-inference` figura en los tags) y con transformers. llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia p50 medida por el autor: 0,21 s a batch 1 en vLLM; el coste por 1.000 consultas a 1,0 USD/hora de GPU se estima en 0,0045 USD.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL AST mean | Irrelevance | JSON parse rate | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ToolSure ORPO (Qwen2.5 1.5B) | 1,5B | no disponible | 84,9 | 60,4 | 99,2 | Apache 2.0 | Hugging Face |
| Qwen2.5 1.5B Instruct (base, prompted) | 1,5B | no disponible | 84,2 | 64,6 | 99,2 | Apache 2.0 | Hugging Face |
| ToolSure SFT (Qwen2.5 1.5B) | 1,5B | no disponible | 85,9 | 29,6 | 99,3 | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (prompted) | 7B | no disponible | 90,6 | 67,5 | 99,8 | Apache 2.0 | Hugging Face |

Frente a ToolSure SFT, ORPO sacrifica precisión en BFCL Multiple (84,5 frente a 90,5) pero gana en Parallel (84,5 frente a 82,0), reduce funciones alucinadas (0,5 % frente a 1,0 %) y mejora sustancialmente la decisión de no llamar (60,4 frente a 29,6). Frente al 7B prompted, queda 5,7 puntos por debajo en AST mean pero con un coste por consulta aproximadamente 3,4 veces menor.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en castellano u otros idiomas no está evaluado y probablemente degrade.
- La tasa de irrelevancia del 60,4 % implica que en torno al 40 % de los prompts que no requieren herramienta podrían acabar generando una llamada; no es un modelo fiable para decidir de forma autónoma cuándo abstenerse sin un validador externo.
- En BFCL Multiple rinde por debajo del modelo base prompted (84,5 frente a 86,5) y muy por debajo de ToolSure SFT (90,5): para escenarios con múltiples funciones candidatas, ORPO no es la mejor opción de la colección.
- Riesgo de alucinación de funciones reducido pero no nulo (0,5 %); conviene validar siempre los nombres contra el esquema real antes de ejecutar.
- Los benchmarks son una reimplementación propia del checker AST de BFCL por parte del autor, no la evaluación oficial del leaderboard, por lo que la comparabilidad con cifras públicas de BFCL es limitada.
- La fecha de creación del repositorio (2026-11-16) y las cero descargas indican un modelo reciente y sin validación independiente por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar también los términos del modelo base.
- No se documentan datos sobre sesgos, robustez ante prompts adversarios ni comportamiento en contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_ORPO
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B
- Colección ToolSure: https://huggingface.co/collections/AmareshHebbar/toolsure-6af816d00a621b28fede6bab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Berkeley Function Calling Leaderboard (BFCL): no disponible en la información proporcionada como enlace directo
- Paper de ORPO: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
