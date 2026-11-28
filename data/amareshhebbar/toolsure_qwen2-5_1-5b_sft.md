# AmareshHebbar/ToolSure_Qwen2.5_1.5B_SFT

## Resumen

ToolSure SFT es un ajuste fino supervisado (SFT) del modelo Qwen2.5-1.5B-Instruct, desarrollado por AmareshHebbar, orientado especificamente a mejorar la fiabilidad en la generacion de llamadas a funciones (function calling o tool use). El problema que aborda es concreto: los modelos pequenos tienden a producir JSON malformado, inventar nombres de funciones, omitir o equivocar argumentos y, sobre todo, emitir llamadas cuando ninguna herramienta ofrecida encaja con la peticion del usuario. ToolSure entrena al modelo para que escriba llamadas correctas y para que decida cuando no debe llamar a ninguna herramienta.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5 con 1.543.714.304 parametros totales, y se distribuye en formato safetensors en bf16. Pertenece a una coleccion de seis variantes (cinco metodos de entrenamiento sobre los mismos datos mas decodificacion restringida) que se comparan en una unica tabla de resultados, lo que facilita evaluar el impacto de cada tecnica de alineamiento sobre la misma base.

Su relevancia practica radica en que demuestra que un modelo de 1.5B, con un SFT ligero (una epoca, LoRA con r=64), puede acercarse al rendimiento en function calling de un Qwen2.5-7B-Instruct prompteado, manteniendo una latencia p50 de 0.20 s en vLLM y un coste estimado de 0.0044 USD por cada 1000 consultas. La licencia Apache 2.0 y la compatibilidad con el formato estandar de tool calls de Qwen2.5 lo hacen directamente desplegable en infraestructura existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino SFT sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); incluye adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion causal estandar. Sobre esa base se aplico un ajuste fino supervisado con LoRA en bf16, con rango r=64, alpha=128, dropout 0.0, learning rate 1e-4, una sola epoca, micro-batch de 4 con acumulacion de gradiente de 8, warmup ratio de 0.03 y longitud maxima de 3584 tokens. El adaptador resultante se fusiono en safetensors bf16 completos, y el adaptador original se conserva en el subdirectorio `adapter/`.

Los datos de entrenamiento provienen del dataset AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B y combinan llamadas a herramientas correctas con ejemplos en los que la respuesta adecuada es texto plano porque ninguna herramienta ofrecida encaja. Este segundo tipo de ejemplo es clave: el autor argumenta que la decodificacion restringida por gramatica garantiza JSON valido y nombres de funcion reales, pero no puede elegir la funcion correcta, rellenar los valores adecuados ni decidir cuando no llamar, y esa brecha es precisamente la que cierra el entrenamiento. El modelo emite las llamadas en el formato estandar de Qwen2.5, un bloque `<tool_call>{...}</tool_call>` por llamada.

## Capacidades

- Generacion de llamadas a funciones en formato Qwen2.5 (`<tool_call>{...}</tool_call>`), compatible con parsers existentes como `--tool-call-parser hermes` de vLLM.
- Seleccion de la funcion correcta entre un conjunto de herramientas ofrecidas, incluyendo llamadas multiples y llamadas en paralelo.
- Relleno de argumentos con valores correctos segun el esquema JSON de cada herramienta.
- Deteccion de irrelevancia: capacidad de responder en texto plano cuando ninguna herramienta del conjunto encaja con la peticion.
- Generacion de texto conversacional multi-turno (heredada del modelo base Instruct).
- Soporte de tool calling integrado en plantillas de chat mediante `apply_chat_template(..., tools=...)`.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Agentes de atencion al cliente con herramientas: el modelo decide si debe invocar funciones como consulta de pedidos, cambio de direccion o escalado a humano, y responde en texto cuando la peticion no requiere ninguna herramienta, reduciendo llamadas espurias.
- Orquestacion de APIs en backend: integrado via vLLM con el parser de tool calls de Qwen2.5, traduce lenguaje natural del usuario en llamadas JSON validas a endpoints REST definidos como esquemas de funciones.
- Automatizacion de asistentes de calendario y correo: selecciona entre funciones como `create_event`, `send_email` o `search_contacts` y rellena los parametros a partir del texto del usuario, con soporte de llamadas en paralelo.
- Enrutamiento de consultas en pipelines RAG: el modelo puede decidir si la consulta requiere una busqueda en base de datos vectorial (funcion de retrieval) o si puede responderse directamente, evitando recuperaciones innecesarias.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1.5B con latencia p50 de 0.20 s en vLLM a batch 1, es adecuado para servicios de alto volumen donde un 7B resultaria demasiado costoso (0.0044 USD por 1000 consultas estimados).
- Evaluacion y prototipado de pipelines de function calling: sirve como referencia ligera para comparar estrategias de prompting, decodificacion restringida y ajuste fino antes de escalar a modelos mayores.
- Asistentes de desarrollo integrados en IDE: puede generar llamadas a herramientas de compilacion, test o busqueda de codigo en flujos de agente de varios pasos.

## Benchmarks y rendimiento

Resultados publicados por el autor, con decodificacion greedy y el mismo checker en todas las filas. Las columnas BFCL son precision AST sobre las categorias non-live del Berkeley Function Calling Leaderboard. Irrelevancia es la proporcion de prompts en los que el modelo correctamente no emitio llamada. xLAM held out es precision exacta de llamada sobre 500 ejemplos nunca vistos en entrenamiento. La latencia es batch 1 en vLLM.

| Modelo | BFCL Simple | BFCL Multiple | BFCL Parallel | BFCL Parallel multiple | BFCL AST mean | Irrelevancia | xLAM held out | JSON parse rate | Funcion alucinada | Latencia p50 (s) | Coste por 1k consultas (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5 1.5B Instruct (prompted) | 91.5 | 86.5 | 80.0 | 79.0 | 84.2 | 64.6 | 84.2 | 99.2 | 0.7 | 0.21 | 0.0054 |
| Qwen2.5 1.5B Instruct (strict system prompt) | 91.5 | 88.0 | 80.0 | 76.5 | 84.0 | 29.2 | 83.8 | 99.2 | 0.9 | 0.21 | 0.0051 |
| Qwen2.5 1.5B Instruct (constrained decoding) | 92.0 | 87.0 | 80.5 | 79.0 | 84.6 | 63.7 | 83.2 | 99.6 | 0.0 | 1.21 | 0.0546 |
| Qwen2.5-7B-Instruct (prompted, referencia) | 94.5 | 93.5 | 89.0 | 85.5 | 90.6 | 67.5 | 86.8 | 99.8 | 0.5 | 0.73 | 0.0155 |
| ToolSure SFT | 91.8 | 90.5 | 82.0 | 79.5 | 85.9 | 29.6 | 86.2 | 99.3 | 1.0 | 0.20 | 0.0044 |
| ToolSure ORPO | 91.5 | 84.5 | 84.5 | 79.0 | 84.9 | 60.4 | 84.0 | 99.2 | 0.5 | 0.21 | 0.0045 |
| ToolSure GRPO | 92.2 | 85.0 | 82.0 | 82.5 | 85.4 | 43.8 | 84.0 | 99.3 | 0.8 | 0.21 | 0.0044 |
| ToolSure CONSTRAINED | 91.8 | 86.0 | 83.5 | 79.5 | 85.2 | 60.4 | 82.4 | 99.9 | 0.0 | 1.19 | 0.0621 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.1 GB en bf16 (1.543.714.304 parametros x 2 bytes) mas overhead de cache KV y activaciones; el repositorio ocupa 6.8 GB porque incluye pesos completos, adaptador, logs y resultados de evaluacion.
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, asi como en GPUs de datacenter A100, H100, L40S y T4.
- Opciones de despliegue: vLLM (metodo documentado por el autor, con `--tool-call-parser hermes`), transformers, text-generation-inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`); llama.cpp y Ollama no se mencionan en la informacion disponible.
- Latencia medida: p50 de 0.20 s a batch 1 en vLLM con decodificacion greedy.
- Coste estimado por el autor: 0.0044 USD por 1000 consultas, asumiendo 1.0 USD/hora de GPU y el throughput batcheado medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL AST mean | Irrelevancia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ToolSure SFT | 1.5B | no disponible | 85.9 | 29.6 | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base prompteado) | 1.5B | no disponible | 84.2 | 64.6 | Apache 2.0 | Hugging Face |
| ToolSure GRPO | 1.5B | no disponible | 85.4 | 43.8 | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (prompteado) | 7B | no disponible | 90.6 | 67.5 | Apache 2.0 | Hugging Face |

Frente al modelo base prompteado, ToolSure SFT mejora la precision AST media (85.9 frente a 84.2), la precision en llamadas multiples (90.5 frente a 86.5) y el rendimiento en xLAM held out (86.2 frente a 84.2), con una latencia ligeramente inferior. La contrapartida es la tasa de irrelevancia: 29.6 frente a 64.6 del base prompteado, es decir, ToolSure SFT tiende a emitir llamadas con mas frecuencia cuando no deberia, un comportamiento que comparte con la variante de system prompt estricto (29.2). Frente al Qwen2.5-7B-Instruct prompteado, ToolSure SFT queda por debajo en precision AST media (85.9 frente a 90.6) pero lo supera en xLAM held out (86.2 frente a 86.8, practicamente empatado) con un coste por consulta aproximadamente 3.5 veces menor.

## Limitaciones y advertencias

- Tasa de irrelevancia baja (29.6): el modelo tiende a emitir llamadas a herramientas en situaciones donde la respuesta correcta seria texto plano, lo que puede provocar invocaciones innecesarias en produccion.
- Tasa de funciones alucinadas del 1.0 por ciento: aunque baja, implica que en algunos casos puede inventar nombres de funcion no presentes en el conjunto ofrecido.
- JSON parse rate del 99.3 por ciento: no garantiza JSON valido en todos los casos, a diferencia de la decodificacion restringida (99.9 por ciento).
- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta documentado y podria degradarse.
- Longitud de contexto: no documentada en la informacion disponible; el entrenamiento uso max_len de 3584 tokens, por lo que prompts de herramientas muy largos podrian degradar el rendimiento.
- Riesgo de alucinacion en contenido conversacional general: es un ajuste fino especializado en tool calling, no un modelo de proposito general mejorado.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones del modelo base Qwen2.5-1.5B-Instruct, tambien Apache 2.0.
- Modelo con pocas descargas (184) y creado recientemente: no cuenta con validacion independiente de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B
- Coleccion ToolSure: https://huggingface.co/collections/AmareshHebbar/toolsure-6af816d00a621b28fede6bab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Berkeley Function Calling Leaderboard (BFCL): no disponible en la informacion proporcionada (referenciado por el autor sin enlace explicito)
