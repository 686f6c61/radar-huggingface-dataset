# AmareshHebbar/ToolSure_Qwen2.5_1.5B_GRPO

## Resumen

ToolSure_Qwen2.5_1.5B_GRPO es un ajuste fino del modelo Qwen2.5-1.5B-Instruct orientado especificamente a la llamada de funciones (function calling) fiable. Lo desarrolla AmareshHebbar como parte de la coleccion ToolSure, que compara cinco metodos de entrenamiento sobre los mismos datos, y aborda un problema concreto de los modelos pequenos: JSON mal formado, nombres de funcion inventados, argumentos ausentes o mal tipados y llamadas cuando ninguna herramienta encaja. La tesis del autor es que el fallo no esta en la recuperacion de contexto sino en la generacion de la llamada, por lo que la solucion es entrenar, no solo hacer prompting.

El modelo parte de la arquitectura transformer densa de Qwen2.5 con 1.543.714.304 parametros (aproximadamente 1.5B) y se entrena en dos fases: un SFT previo (ToolSure_Qwen2.5_1.5B_SFT) y un refinamiento con GRPO online con recompensa verificable y sin modelo de recompensa. El adaptador LoRA resultante se fusiona en pesos completos en bf16. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia practica radica en que demuestra que un modelo de 1.5B puede acercarse al rendimiento de function calling de un Qwen2.5-7B-Instruct en categorias no live de BFCL, con una latencia p50 de 0.20 s por peticion en vLLM y un coste estimado de 0.0044 USD por cada 1000 consultas, manteniendo el formato estandar de tool calls de Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajuste fino con LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento usa max_prompt_length de 1536 y max_completion_length de 384) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); incluye adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer denso decoder-only con atencion causal estandar y soporte nativo del formato de tool calls de Qwen2.5 (un bloque `<tool_call>{...}</tool_call>` por llamada). Sobre esa base se aplica primero un SFT (ToolSure_Qwen2.5_1.5B_SFT) y despues un entrenamiento online con GRPO y recompensa verificable, sin reward model. La recompensa se calcula parseando cada completion y comparandola con las llamadas gold: JSON roto penaliza con -0.5, una llamada valida otorga 0.2 mas hasta 0.3 por acertar las funciones y 0.5 por acertar exactamente los argumentos, no llamar correctamente otorga 1.0 y los nombres de funcion inventados se penalizan. Se usa la perdida Dr. GRPO.

Los hiperparametros clave del entrenamiento GRPO son: learning rate 1e-05, 80 pasos maximos, 8 generaciones por prompt, batch por dispositivo 8 con acumulacion de gradiente 8, warmup ratio 0.05, temperatura 0.9, top_p 1.0, beta 0.0 (sin penalizacion KL), LoRA con r=64, alpha=128 y dropout 0.0, y `scale_rewards` desactivado. Los datos de entrenamiento provienen del dataset AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B. El adaptador LoRA se fusiona en pesos completos bf16; el repositorio conserva el adaptador, logs de entrenamiento y resultados de evaluacion en las carpetas `adapter/`, `training/` y `eval/`.

## Capacidades

- Generacion de llamadas a funciones en formato Qwen2.5, con un bloque `<tool_call>` por llamada.
- Llamadas multiples y en paralelo dentro de una misma respuesta (categoria BFCL Parallel y Parallel multiple).
- Decision de no llamar cuando ninguna herramienta encaja (metrica de irrelevance).
- Generacion de JSON valido en el 99.2% de las salidas que intentan llamar a una herramienta, con una tasa de funciones inventadas del 0.5%.
- Razonamiento multi-paso implicito para seleccionar funciones y rellenar argumentos a partir de la peticion del usuario.
- Compatibilidad directa con servidores que parsean tool calls de Qwen2.5, por ejemplo vLLM con `--tool-call-parser hermes`.
- Capacidades generales de texto heredadas de Qwen2.5-1.5B-Instruct (conversacion, generacion de texto), aunque el ajuste esta orientado a tool use.
- No se declaran capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada con herramientas: el modelo decide entre consultar el estado de un pedido, abrir un ticket o responder directamente, usando la metrica de irrelevance para evitar llamadas innecesarias cuando la pregunta es conversacional.
- Orquestacion de agentes en produccion: al devolver tool calls en el formato estandar de Qwen2.5, se integra sin cambios en frameworks de agentes que ya consumen ese formato, con latencia p50 de 0.20 s en vLLM a batch 1.
- Pipelines de bajo coste y alto volumen: con 0.0044 USD por 1000 consultas estimados, es adecuado para routers de intenciones o asistentes internos donde un modelo de 7B resultaria caro.
- Ejecucion local en hardware modesto: al tener 1.5B parametros, permite desplegar function calling en entornos con VRAM limitada o incluso en CPU con cuantizacion, aunque esta ultima no se documenta en la model card.
- Extraccion estructurada de parametros: dado un esquema de herramienta, el modelo rellena argumentos tipados a partir de texto libre, util para convertir lenguaje natural en payloads de API.
- Evaluacion comparativa de metodos de entrenamiento: como parte de la coleccion ToolSure, sirve para reproducir la comparativa entre prompting, prompting estricto, decodificacion restringida, SFT, ORPO y GRPO sobre los mismos datos.
- Sustitucion de decodificacion restringida: la model card muestra que la decodificacion con gramatica garantiza JSON valido pero no elige bien la funcion ni decide no llamar; este modelo cubre esa brecha sin el coste de latencia de la decodificacion restringida (1.21 s frente a 0.20 s).

## Benchmarks y rendimiento

Resultados con decodificacion greedy y el mismo checker en todas las filas. Las columnas BFCL son precision AST sobre las categorias no live de Berkeley Function Calling Leaderboard. Irrelevance es la proporcion de prompts en los que el modelo correctamente no hizo llamada. xLAM held out es precision exacta de llamada sobre 500 ejemplos nunca usados en entrenamiento. Latencia a batch 1 en vLLM; coste asumiendo 1.0 USD/hora de GPU.

| Modelo | BFCL Simple | BFCL Multiple | BFCL Parallel | BFCL Parallel multiple | BFCL AST mean | Irrelevance | xLAM held out | JSON parse rate | Funciones inventadas | Latencia p50 (s) | Coste por 1k consultas (USD) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5 1.5B Instruct (prompted) | 91.5 | 86.5 | 80.0 | 79.0 | 84.2 | 64.6 | 84.2 | 99.2 | 0.7 | 0.21 | 0.0054 |
| Qwen2.5 1.5B Instruct (strict system prompt) | 91.5 | 88.0 | 80.0 | 76.5 | 84.0 | 29.2 | 83.8 | 99.2 | 0.9 | 0.21 | 0.0051 |
| Qwen2.5 1.5B Instruct (constrained decoding) | 92.0 | 87.0 | 80.5 | 79.0 | 84.6 | 63.7 | 83.2 | 99.6 | 0.0 | 1.21 | 0.0546 |
| Qwen2.5-7B-Instruct (prompted, referencia) | 94.5 | 93.5 | 89.0 | 85.5 | 90.6 | 67.5 | 86.8 | 99.8 | 0.5 | 0.73 | 0.0155 |
| ToolSure SFT | 91.8 | 90.5 | 82.0 | 79.5 | 85.9 | 29.6 | 86.2 | 99.3 | 1.0 | 0.20 | 0.0044 |
| ToolSure ORPO | 91.5 | 84.5 | 84.5 | 79.0 | 84.9 | 60.4 | 84.0 | 99.2 | 0.5 | 0.21 | 0.0045 |

No se han publicado en la informacion disponible los resultados del propio ToolSure GRPO en esta tabla, ni valores de MMLU para ninguna de las filas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.543.714.304 parametros, en bf16 requiere aproximadamente 3.1 GB solo para pesos, mas cache KV y overhead del runtime; en fp16 es similar. Con cuantizacion de 8 bits rondaria 1.6 GB y en 4 bits alrededor de 0.8 GB, aunque estos formatos no se documentan en la model card.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bf16 con margen para contexto moderado; una RTX 4090, A100 o H100 ofrecen throughput alto para servir en produccion.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) en bf16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: vLLM (usado en la model card, con `--tool-call-parser hermes`), transformers, y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se proporcionan en el repositorio.
- Latencia y throughput: latencia p50 de 0.20 s a batch 1 en vLLM segun la model card; coste estimado de 0.0044 USD por 1000 consultas asumiendo 1.0 USD/hora de GPU. El throughput batcheado no se detalla numericamente.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | BFCL AST mean | Irrelevance | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ToolSure GRPO (este modelo) | 1.5B | GRPO con recompensa verificable | No disponible en la tabla | No disponible en la tabla | Apache 2.0 | Hugging Face |
| ToolSure SFT | 1.5B | SFT sobre los mismos datos | 85.9 | 29.6 | Apache 2.0 | Hugging Face |
| ToolSure ORPO | 1.5B | ORPO sobre los mismos datos | 84.9 | 60.4 | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (prompted) | 7B | Prompting sin ajuste | 90.6 | 67.5 | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (prompted) | 1.5B | Prompting sin ajuste | 84.2 | 64.6 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta documentado.
- La longitud de contexto nativa de Qwen2.5 no se especifica en la model card; el entrenamiento limita prompts a 1536 tokens y completions a 384, lo que puede afectar a esquemas de herramientas muy largos.
- La tabla de resultados publicada no incluye la fila del propio modelo GRPO, por lo que no hay cifras oficiales de su rendimiento en BFCL ni en xLAM held out.
- Riesgo de alucinacion de funciones: la tasa medida es del 0.5% en las pruebas del autor, no cero; en produccion conviene validar los nombres de funcion contra el esquema antes de ejecutar.
- La decision de no llamar (irrelevance) varia mucho entre metodos (29.2% con system prompt estricto frente a 64.6% en prompting normal), lo que sugiere sensibilidad al formato del prompt y al sistema de mensajes.
- No se documentan sesgos especificos del ajuste; hereda los del modelo base Qwen2.5-1.5B-Instruct, no evaluados en esta model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre robustez en dominios ajenos al dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; el despliegue en CPU o GPUs pequenas requiere conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_GRPO
- Modelo base SFT: https://huggingface.co/AmareshHebbar/ToolSure_Qwen2.5_1.5B_SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ToolSure_Calls_Qwen2.5_1.5B
- Coleccion ToolSure: https://huggingface.co/collections/AmareshHebbar/toolsure-6af816d00a621b28fede6bab
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Berkeley Function Calling Leaderboard: no disponible en la informacion proporcionada (sin URL)
- Paper de Dr. GRPO: no disponible en la informacion proporcionada (sin URL)
