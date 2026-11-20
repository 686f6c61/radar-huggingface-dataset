# M1n1A1/MiniAI-Quata2-4b-Preview

## Resumen

MiniAI Quata2 4B Preview es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-4B, desarrollado por MiniAI (autor M1n1A1) y publicado como compilación preliminar del próximo Quata2 4B v0.2. El modelo se distribuye con licencia Apache 2.0 y esta orientado a generacion de texto conversacional con soporte nativo de tool calling, ademas de capacidades de vision heredadas del modelo base en el formato safetensors.

El objetivo declarado del autor es mejorar dos ejes respecto a su base: el uso de herramientas (BFCL) y el conocimiento general (MMLU), ademas de reforzar la identidad propia del modelo y su resistencia a la presion del usuario cuando la respuesta es correcta. No obstante, el propio autor advierte que esta compilacion empeora en seguimiento estricto de instrucciones (IFEval) y en generacion de codigo (HumanEval+, MBPP+), deficits que la version completa v0.2 pretende corregir.

El modelo cuenta con 5.174.964.736 parametros reales en safetensors (etiquetado comercialmente como "4B"), un repositorio de 22,5 GB y pesos en bf16 con torre de vision, mas una variante GGUF cuantizada Q4_K_M de 2,8 GB limitada a texto. Los idiomas soportados son ingles como principal, con serbio, croata y bosnio funcionales pero con gramatica inferior al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), con torre de vision en safetensors; clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 5.174.964.736 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | GGUF Q4_K_M (4 bits); safetensors en bf16 |
| Idiomas soportados | Ingles (principal), serbio, croata, bosnio |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16, texto + vision), GGUF (Q4_K_M, solo texto), `model-mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de la familia Qwen3.5 con torre de vision integrada en los pesos safetensors. La clase de carga requerida es `Qwen3_5ForConditionalGeneration`, no `AutoModelForCausalLM`. El repositorio incluye ademas un fichero `model-mtp.safetensors` de aproximadamente 0,24 GB, coherente con un cabezal de prediccion multi-token (MTP) heredado del modelo base, aunque la informacion disponible no detalla su uso en inferencia.

El entrenamiento consistio en un ajuste fino supervisado sobre OpenHermes-2.5, Tulu-3 (seguimiento de instrucciones), Hermes function calling, ToolACE y When2Call, complementado con datos propios de MiniAI para identidad, recuperacion de errores en herramientas y doble comprobacion de respuestas. Posteriormente se fusiono un ajuste fino adicional orientado a uso de herramientas con un peso del 30%, y finalmente se aplico un blending de pesos 80/20 hacia Qwen3.5-4B mediante WiSE-FT para preservar las capacidades del modelo base. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, serbio, croata y bosnio.
- Tool calling / function calling nativo, con plantilla de chat de Qwen3.5 que incluye soporte de herramientas y modo thinking on/off.
- Razonamiento de multiples pasos en tareas de agente, aunque con rendimiento inferior al base en la metrica de multi-step.
- Identidad propia: responde que es Quata2 sin necesidad de system prompt (97,2% en la prueba del autor).
- Resistencia a la presion: mantiene respuestas correctas cuando se le cuestiona (80,0% frente a 65,0% del base en 20 items).
- Recuperacion de errores en llamadas a herramientas, entrenada con datos propios.
- Vision en el formato safetensors (torre de vision de Qwen3.5 incluida); el GGUF es exclusivamente texto.
- Modo thinking activable o desactivable mediante la plantilla de chat.

## Casos de uso

- Asistente conversacional en serbio, croata o bosnio: el modelo cubre las tres variantes del diasistema serbocroata, lo que permite desplegar un unico modelo para atencion al usuario en la region en lugar de mantener variantes por idioma, aceptando que la gramatica es inferior a la del ingles.
- Integracion en agentes con herramientas: el rendimiento BFCL de 87,9 y la recuperacion de errores entrenada lo hacen adecuado para pipelines donde el modelo debe invocar APIs, interpretar respuestas erroneas y reintentar, por ejemplo en automatizacion de back-office.
- Chat de autoservicio en produccion: el autor indica que esta compilacion es la que ejecuta chat.codeminute.dev, por lo que sirve como referencia de despliegue real en un servicio conversacional con llama-server y plantilla Jinja.
- Despliegue en hardware de consumo: la variante GGUF Q4_K_M de 2,8 GB permite ejecutar el modelo en equipos con GPU modesta o incluso CPU mediante llama.cpp u Ollama, con contexto configurable (el ejemplo oficial usa 8192 tokens).
- Verificacion de respuestas y control de alucinacion conversacional: el comportamiento de doble comprobacion (mantener respuestas correctas bajo presion) es util en asistentes donde el usuario tiende a rebatir respuestas validas, aunque debe combinarse con verificacion externa porque el modelo tambien falla al corregir respuestas erroneas (82,5% frente al 95,0% del base).
- Prototipado de asistentes multimodales: los safetensors incluyen la torre de vision, lo que permite experimentar con entrada imagen-texto usando `Qwen3_5ForConditionalGeneration` antes de decidir si se necesita la version completa.
- Base para ajustes finos propios: al ser Apache 2.0 y derivar de Qwen3.5-4B, puede servir como punto de partida para SFT adicional en dominios especificos, siempre que se asuma su deficit en IFEval y codigo.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con su propio harness sobre GGUF Q4_K_M en llama-server, con los mismos prompts y ajustes para los tres modelos. Mayor es mejor.

| Test | Preview | Qwen3.5-4B (base) | Quata2 4B v0.1 (base Qwen3-4B) |
|---|---|---|---|
| BFCL tool calling, overall | 87,9 | 85,1 | 89,8 |
| MMLU (conocimiento) | 72,6 | 70,2 | 65,0 |
| GSM8K (matematicas escolares) | 85,2 | 87,0 | 84,2 |
| IFEval, prompt-level strict | 74,6 | 81,5 | 76,0 |
| HumanEval+ (codigo) | 65,9 | 78,0 | No disponible |
| MBPP+ (codigo) | 58,7 | 64,6 | No disponible |
| Tareas de agente con herramientas reales, resueltas | 80,1 | 80,1 | 56,3 |
| Tareas de agente, multi-step | 70,6 | 74,5 | 46,1 |
| Doble comprobacion: mantiene respuesta correcta bajo presion (20 items) | 80,0 | 65,0 | 25,0 |
| Doble comprobacion: corrige respuesta erronea bajo presion (40 items) | 82,5 | 95,0 | 62,5 |
| Preguntas con premisa falsa gestionadas (4 items) | 75,0 | 100 | 75,0 |
| Se identifica como Quata2 sin system prompt | 97,2 | 0,0 | 100 |

El autor advierte que las filas con recuento de items usan conjuntos de prueba muy pequenos (la diferencia en premisa falsa corresponde a una sola pregunta) y deben interpretarse como indicios. IFEval (524 prompts) y codigo (164 y 378 problemas) son medidas solidas y las diferencias son reales.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,3 GB en bf16 para los safetensors completos (5,9 GB + 3,9 GB), mas overhead de activaciones y KV cache; alrededor de 3 GB para el GGUF Q4_K_M de 2,8 GB.
- GPU recomendadas: A100 o H100 para bf16 con contexto largo y vision; RTX 4090 (24 GB) para bf16 con margen; RTX 3090/4080 (16-24 GB) para bf16 ajustado o Q4_K_M con contexto amplio.
- Cabe en GPU de consumo: si, en RTX 4090 y 3090 en bf16; en GPUs de 8-12 GB mediante GGUF Q4_K_M; en CPU con llama.cpp.
- Opciones de despliegue: Transformers (`Qwen3_5ForConditionalGeneration`), llama.cpp (`llama-server -m ... --jinja -c 8192`), Ollama (`ollama run hf.co/M1n1A1/MiniAI-Quata2-4b-Preview`). No se mencionan vLLM ni TGI en la informacion disponible.
- Sampling recomendado por el autor: temperature 0,7, top_p 0,8, top_k 20.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BFCL | IFEval strict | HumanEval+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MiniAI Quata2 4B Preview | 5,17 B | No disponible | 87,9 | 74,6 | 65,9 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen3.5-4B (base) | No disponible | No disponible | 85,1 | 81,5 | 78,0 | Apache 2.0 (segun el autor) | Hugging Face |
| Quata2 4B v0.1 (base Qwen3-4B) | No disponible | No disponible | 89,8 | 76,0 | No disponible | No disponible | Hugging Face |

La comparativa se limita a los modelos incluidos en los benchmarks del autor; no se dispone de datos de otros modelos de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Es una compilacion preview: el autor declara que no supera a su base en varios benchmarks y que la version completa v0.2 esta en entrenamiento.
- Peor seguimiento estricto de instrucciones que el base: IFEval 74,6 frente a 81,5, con 524 prompts, una diferencia solida.
- Peor generacion de codigo que el base: HumanEval+ 65,9 frente a 78,0 y MBPP+ 58,7 frente a 64,6.
- Peor rendimiento en tareas de agente multi-step: 70,6 frente a 74,5 del base.
- Mayor tasa de respuestas erroneas mantenidas bajo presion: corrige solo el 82,5% de respuestas erroneas frente al 95,0% del base.
- Riesgo de hechos erroneos con confianza: el autor lo senala como debilidad conocida; conviene verificar respuestas importantes.
- Idiomas: el ingles es claramente superior; serbio, croata y bosnio funcionan pero con gramatica inferior.
- Vision solo en safetensors; el GGUF Q4_K_M es exclusivamente texto.
- Licencia Apache 2.0, permisiva para uso comercial, pero el autor recomienda usar la version estable v0.3 para produccion en lugar de esta preview.
- No se han publicado datos de sesgos especificos ni de longitud de contexto en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Version estable recomendada por el autor: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.3
- Demo en produccion: https://chat.codeminute.dev
