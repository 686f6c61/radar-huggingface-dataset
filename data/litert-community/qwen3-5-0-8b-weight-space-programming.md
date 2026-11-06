# litert-community/Qwen3.5-0.8B-weight-space-programming

## Resumen

Qwen3.5-0.8B-weight-space-programming es un checkpoint derivado de Qwen/Qwen3.5-0.8B cuyos pesos fueron editados directamente en el espacio de pesos por RikiyaT, sin entrenamiento adicional, mediante una tecnica denominada "weight-space programming". Esta publicacion concreta, alojada en el espacio litert-community, no modifica el modelo en si: solo lo convierte al formato LiteRT-LM (`.litertlm`) y lo cuantiza para inferencia en dispositivo con el runtime de Google.

El modelo base emplea una arquitectura hibrida de 24 capas que combina 18 capas GatedDeltaNet (atención lineal con estado recurrente de tamano constante) y 6 capas de atencion completa con cache KV, con aproximadamente 0,8 mil millones de parametros. La conversion conserva unicamente el decodificador de texto: la torre de vision y los pesos MTP del checkpoint multimodal original no estan incluidos.

Es relevante para desarrolladores que necesitan ejecutar un modelo de razonamiento pequeno en CPU o en hardware de borde sin GPU dedicada, con soporte de modo thinking y tool calling en formato Qwen, y con un presupuesto de cache KV fijado en 4096 tokens. La licencia Apache-2.0 facilita su integracion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 18 capas GatedDeltaNet (atencion lineal) + 6 capas de atencion completa |
| Parametros totales | ~0,8 mil millones (derivado de Qwen3.5-0.8B; cifra exacta no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en el bundle; prefill con firmas de 128 y 1024 |
| Tipos de cuantizacion | int8 dinamico canal a canal en pesos, activaciones float32; proyecciones `in_proj_a`/`in_proj_b` de GatedDeltaNet en float; se probo int4 blockwise-64 y se descarto |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; las pruebas incluyen coreano, ingles y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT flatbuffers dentro de bundle `.litertlm` (origen en safetensors bf16) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de 24 capas. Dieciocho de ellas usan GatedDeltaNet, un mecanismo de atencion lineal con estado recurrente de tamano constante que evita el crecimiento del cache KV; las seis restantes son capas de atencion completa que si mantienen cache KV. En el bundle solo esas seis capas consumen memoria de cache, con un presupuesto declarado de 4096 tokens. El checkpoint original es multimodal, pero esta conversion omite la torre de vision y los pesos MTP.

No hubo entrenamiento en esta publicacion: los pesos del checkpoint de RikiyaT se obtuvieron mediante edicion directa en el espacio de pesos ("weight-space programming"), un metodo que modifica tensores sin gradientes ni dataset de ajuste. La model card remite a la ficha del modelo fuente para el detalle del metodo y sus resultados en MATH-500, GSM8K e IFEval. La conversion se realizo con litert-torch 0.10.0 (`export_hf`, soporte integrado de `qwen3_5`), transformers 5.22.1, torch 2.14.1 en CPU y ai-edge-quantizer 0.10.1, con receta `dynamic_wi8_afp32` y una excepcion de no-cuantizacion para `Linear_in_proj_a` y `Linear_in_proj_b` (+1,7 MB), siguiendo la receta publicada de `litert-community/Qwen3.5-0.8B`. Los metadatos LLM se tomaron de LiteRT-LM v0.19.0 y el bloque `tool_call_config` se restauro reempaquetando con `unpack`/`pack`, ya que el builder 0.18 de litert-torch carece de ese campo.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con la salida de razonamiento expuesta en el canal `thought` mediante `<think>...</think>`.
- Tool calling estilo Qwen, con la sintaxis `<tool_call><function=...><parameter=...>`.
- Traduccion entre idiomas (verificado coreano a ingles en la model card).
- Aritmetica basica y problemas de matematicas cuando el modo thinking esta activo.
- Respuestas conversacionales cortas con thinking desactivado.
- Inferencia en dispositivo sobre CPU mediante el runtime LiteRT-LM, sin dependencia de GPU.
- Relleno de prefill con `<|endoftext|>` para no corromper el estado recurrente de GatedDeltaNet.
- No incluye vision ni audio: es exclusivamente un decodificador de texto.

## Casos de uso

- Asistente de traduccion en aplicaciones moviles: el modelo traduce frases entre idiomas con thinking desactivado, lo que reduce latencia; la prueba de la model card (coreano a ingles) muestra respuestas correctas y concisas en CPU.
- Clasificacion y respuesta a preguntas simples en el borde: preguntas factuales como la capital de un pais se resuelven con thinking off, adecuado para asistentes embebidos con presupuesto de computo limitado.
- Razonamiento matematico de un solo paso con thinking activado: util en herramientas educativas donde se acepta una latencia de decenas de segundos a cambio de mayor precision (17 × 23 = 391 en 28,5 s en CPU x86-64).
- Agente local con tool calling: el bundle declara la plantilla de llamadas a funciones de Qwen, lo que permite integrarlo en flujos que invocan APIs externas desde un dispositivo sin conexion a GPU.
- Prototipado de pipelines LiteRT-LM: sirve como banco de pruebas para validar la conversion de modelos hibridos GatedDeltaNet y la gestion del estado recurrente antes de desplegar modelos mayores de la misma familia.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU con int8 dinamico y un peso de 792.896.640 bytes, puede desplegarse en contenedores x86-64 de bajo coste para tareas de generacion de texto no criticas.
- Evaluacion de tecnicas de edicion de pesos: investigadores pueden comparar el comportamiento del checkpoint editado frente al Qwen3.5-0.8B original en el mismo runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la ficha del modelo fuente (RikiyaT/Qwen3.5-0.8B-weight-space-programming) para los resultados de MATH-500, GSM8K e IFEval, pero no reproduce las cifras. Las unicas mediciones incluidas son verificaciones cualitativas de ejecucion:

| Prompt | Thinking | Resultado |
|---|---|---|
| Capital de Corea del Sur (coreano) | off | `서울특별시` (correcto) |
| Traduccion coreano a ingles | off | `It climbs to 100 meters.` (correcto) |
| 17 × 23, solo el numero | off | `51` (incorrecto) |
| 17 × 23 | on | 391 (correcto, 28,5 s) |
| 2^10 + 24 con respuesta en `\boxed{}` | on | no termina: entra en bucle hasta agotar los 4096 tokens |

## Requisitos de hardware

- VRAM/RAM estimada: el bundle ocupa 792.896.640 bytes (~756 MiB); al ejecutarse en CPU, la memoria del sistema debe acomodar los pesos int8, las activaciones float y el estado recurrente, por lo que se recomienda al menos 2 GB de RAM libre (estimacion, no publicada).
- GPU: no requiere GPU; el backend verificado es CPU (`--backend cpu`) en x86-64 Linux.
- Cabe en cualquier equipo de consumo: la model card no documenta pruebas en GPU de consumo, pero el tamano y el backend CPU implican que puede ejecutarse en portatiles y dispositivos de borde.
- Despliegue: exclusivamente mediante LiteRT-LM >= 0.19.0 (`pip install litert-lm==0.19.0`, comando `litert-lm run`). Versiones anteriores fallan con `Encountered unresolved custom op: gated_delta_update`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 28,5 s para una respuesta con thinking en CPU x86-64 (prompt 17 × 23, sampler por defecto top-p 0,95, top-k 20, temperatura 0,6, semilla 0). El throughput no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-0.8B WSP, LiteRT-LM) | ~0,8 B | 4096 tokens de cache KV | `.litertlm`, LiteRT-LM >= 0.19.0 | Apache-2.0 | Solo decodificador de texto; thinking y tool calling |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | safetensors | Apache-2.0 (segun herencia) | Multimodal, incluye torre de vision y MTP |
| RikiyaT/Qwen3.5-0.8B-weight-space-programming | ~0,8 B | no disponible | safetensors bf16 | Apache-2.0 | Pesos editados sin entrenamiento; evaluacion con `presence_penalty=1.5` |
| litert-community/Qwen3.5-0.8B | ~0,8 B | no disponible | `.litertlm` | Apache-2.0 | Conversion de referencia cuya receta de cuantizacion se reutiliza aqui |

## Limitaciones y advertencias

- El razonamiento largo puede entrar en bucle: el sampler de LiteRT-LM no aplica penalizacion de presencia ni de repeticion, y el modelo fuente ya reportaba un 31,6 % de respuestas de MATH-500 que agotaban el limite de 32k tokens aun con `presence_penalty=1.5`. Conviene fijar `--thinking-budget` o desactivar thinking en tareas cortas.
- La aritmetica sin thinking es poco fiable: en la verificacion, 17 × 23 devolvio 51.
- LiteRT-LM 0.19.0 conserva el estado recurrente entre conversaciones dentro de un mismo `Engine`, de modo que una segunda conversacion parte del estado GatedDeltaNet de la primera. El fallo se corrigio en `google-ai-edge/LiteRT-LM@e1f86b05` despues de la 0.19.0; hasta que exista una release con el parche, debe crearse un `Engine` nuevo por conversacion (`litert-lm run` no se ve afectado porque arranca un proceso por prompt).
- Se genero una build int4 (pesos blockwise-64) y se descarto por entrar en bucle en la traduccion y en el razonamiento de 17 × 23; no esta publicada.
- El modelo no incluye vision ni audio pese a que el checkpoint upstream sea multimodal.
- No se declara lista de idiomas soportados; el soporte multilingue real no esta cuantificado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de 0,8 B sin ajuste por RLHF en esta variante, cabe esperar errores factuales.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el aviso de la model card indica que el repositorio no esta afiliado a Alibaba ni al equipo de Qwen ni a RikiyaT.
- Dependencia estricta del runtime: no hay rutas de despliegue alternativas documentadas y la version minima de LiteRT-LM es 0.19.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3.5-0.8B-weight-space-programming
- Modelo fuente (pesos editados): https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Commit con la correccion del estado recurrente: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05
- Herramienta de conversion litert-torch: https://github.com/google-ai-edge/litert-torch
- Conversion de referencia de la misma familia: https://huggingface.co/litert-community/Qwen3.5-0.8B
