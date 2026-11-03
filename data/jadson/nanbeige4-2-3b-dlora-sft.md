# Jadson/Nanbeige4.2-3B-dlora-sft

## Resumen

Nanbeige4.2-3B-dlora-sft es un adaptador de tipo "diffusion LoRA" (dlora) entrenado por el usuario Jadson sobre el modelo base Nanbeige/Nanbeige4.2-3B, que se mantiene completamente congelado. El repositorio no contiene un modelo generativo completo, sino un pequeño denoiser de 22,0 millones de parametros que, para cada token, produce un delta LoRA de rango 16 sobre las matrices FFN del backbone. El backbone opera en cuantizacion NF4 (bitsandbytes) y conserva sus pesos originales sin modificacion alguna.

El objetivo del entrenamiento es el ajuste supervisado (SFT) para la emision de trazas de agente con llamadas a herramientas en formato Qwen: el modelo debe cerrar el bloque de razonamiento `</think>` y emitir a continuacion una estructura `<tool_call><function=ipython><parameter=code>...</parameter></function></tool_call>`. Segun la model card, el backbone sin el difusor no emite tool_calls con el mismo prompt y decodificacion, por lo que la capacidad se atribuye al adaptador entrenado.

El checkpoint publicado corresponde al paso 237 de un entrenamiento de 238 pasos sobre 951 trazas de agente renderizadas en crudo. Es relevante como ejemplo de una tecnica poco habitual (generacion de deltas LoRA mediante difusion DDIM en lugar de un adaptador estatico) aplicada a un modelo de 3B con backbone congelado, y como artefacto experimental reproducible con los scripts incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de difusion (DDIM) que genera deltas LoRA sobre las capas FFN de un transformer con backbone congelado (Nanbeige4.2-3B, 22 capas, 2 pasadas) |
| Parametros totales | 22.032.768 (solo el difusor; el backbone Nanbeige4.2-3B se distribuye por separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso seq_len 9216) |
| Tipos de cuantizacion | Backbone en NF4 (bitsandbytes, double quant, compute bf16); difusor en fp32; sidecar GGUF para el port de llama.cpp |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `difusor.ckpt` (checkpoint PyTorch con 21 tensores fp32) y `nanbeige_diffuser.gguf` (sidecar GGUF) |

## Arquitectura y entrenamiento

El diseno separa el modelo generativo en dos piezas. El backbone Nanbeige4.2-3B permanece byte-identico al original del hub, cargado en NF4, y actua como extractor de representaciones: la entrada del difusor es unicamente la salida de atencion en cada paso (`x_attn`). El difusor recibe ese vector, lo proyecta a un espacio latente de dimension 32 y ejecuta 4 pasos DDIM para muestrear un delta LoRA de rango 16 y alpha 16 que se aplica a las matrices FFN. El bucle recorre las 44 aplicaciones FFN del backbone (22 capas por 2 pasadas) y solo el difusor recibe actualizaciones de gradiente; los gradientes fluyen a traves del backbone congelado, que no se actualiza.

El entrenamiento consistio en un SFT de 238 pasos (checkpoint publicado en el paso 237) con learning rate 0,0002, 10 pasos de warmup, micro-batch 1 con acumulacion 4 y seq_len 9216, sobre 951 trazas de agente en formato chat crudo con plantilla Qwen. La perdida descendio de 14,86 a 6,38 y la norma del delta (`|decode_A|`) crecio de 0 a 11,38 de forma monotona, lo que el autor interpreta como senal de que la ruta del adaptador esta activa. La innovacion destacable es el propio mecanismo: en lugar de un LoRA estatico, un generador condicionado por la activacion de atencion produce el delta en tiempo de inferencia, con ruido de inferencia fijo (semilla 42, sigma 1,0) para reproducibilidad.

## Capacidades

- Generacion de texto autoregresiva heredada del backbone Nanbeige4.2-3B, modulada por el delta LoRA del difusor.
- Emision de trazas de agente con bloque de razonamiento: cierra `</think>` y genera `<tool_call><function=ipython><parameter=code>...` completo, terminando en `<|im_end|>`.
- Tool calling en el formato especifico del corpus de entrenamiento (funcion `ipython` con parametro `code`); no se documenta soporte de otras funciones.
- Razonamiento multi-paso encadenado mediante la estructura think + tool_call, orientado a tareas de ejecucion de codigo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modos de pensamiento adicionales.

## Casos de uso

- Generacion de trazas sinteticas de agentes para entrenamiento: el modelo produce secuencias completas de tipo think + tool_call que pueden usarse como datos de destilacion o aumento de corpus para entrenar otros agentes, dado que el autor lo entrena precisamente sobre trazas de este estilo.
- Investigacion sobre adaptadores generativos: sirve como banco de pruebas reproducible para estudiar difusion de deltas LoRA frente a LoRA estatico, con scripts de entrenamiento e inferencia incluidos en el repo.
- Prototipado de agentes de ejecucion de codigo: el modelo emite llamadas a `ipython` con bloques de codigo, utiles para validar pipelines de parseo y ejecucion en entornos controlados.
- Experimentos de eficiencia de memoria: al mantener el backbone en NF4 y entrenar solo 22M de parametros, permite iterar sobre un modelo de 3B en hardware modesto, lo que facilita la investigacion academica con recursos limitados.
- Verificacion de formato y robustez de parsers: las trazas generadas permiten probar analizadores de tool_calls, manejadores de `</think>` y validadores de sintaxis Qwen en pipelines de CI.
- Estudio de sesgos de estilo en decodificacion: la limitacion documentada sobre la disputa entre "We need" y "Let me" al abrir el think desde cero convierte al modelo en un caso util para analizar como la semilla de estilo afecta a la verbosidad y al cierre del razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica verificacion reportada es cualitativa: con temperatura 0,6, top_p 0,9 y una semilla de estilo tomada del corpus, la inferencia devuelve `</think>: True`, `<function=ipython>: True`, 7393 caracteres y resultado PASS, mientras que el backbone puro no emite tool_call con el mismo prompt.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el backbone se carga en NF4 de 4 bits, lo que reduce sustancialmente el footprint frente a bf16, y el difusor anade unos 252 MiB en fp32.
- El entrenamiento uso seq_len 9216 y `use_cache=False`, lo que incrementa el coste de memoria en inferencia frente a una generacion con cache.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del backbone (3B en NF4) es plausible su ejecucion en GPUs de consumo con suficiente VRAM, pero el autor no lo documenta.
- Opciones de despliegue: transformers con bitsandbytes (NF4) y los scripts del repo; existe un sidecar GGUF para el port de dlora en llama.cpp, aunque no se detalla el procedimiento completo.
- Latencia y throughput: no disponibles; la generacion de verificacion uso `max_new_tokens=6000` y decodificacion muestreada, sin cifras de velocidad publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.2-3B-dlora-sft (este) | 22,0M de difusor + backbone 3B congelado | No disponible | Difusion de deltas LoRA para tool calls | Apache 2.0 | HuggingFace, 0 descargas |
| Nanbeige/Nanbeige4.2-3B (base) | 3B | No disponible | Transformer estandar | No disponible en la informacion | HuggingFace |
| LoRA SFT convencional sobre el mismo backbone | Depende del rango | No disponible | Adaptador estatico | Segun autor | No disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada. La diferencia funcional documentada es que el backbone puro no emite tool_calls con el prompt de verificacion, mientras que el difusor SFT si lo hace.

## Limitaciones y advertencias

- Limitacion medida y documentada: al abrir el bloque think desde cero, la distribucion inicial se reparte entre "We need" (60%) y "Let me" (40%) a temperatura 0,6; el estilo minoritario (16 de 941 trazas) deriva en verbosidad y puede no cerrar el think en hasta 6000 tokens.
- El rendimiento depende de una semilla de estilo: con un think del estilo dominante del corpus (426 de 941 trazas) el modelo cierra y emite tool_call en top-1, pero sin esa semilla la fiabilidad cae.
- Dependencia estricta del regimen de entrenamiento: backbone en NF4, entrada `x_attn`, hiperparametros exactos del `cfg`, ruido de inferencia fijo (semilla 42, sigma 1,0) y llamada a `restaurar_rope` tras cada `from_pretrained`; desviarse de estos invariantes invalida el adaptador.
- `use_cache=False` es obligatorio por incompatibilidad del codigo remoto con la ruta de cache de transformers 5.x, lo que penaliza el rendimiento en produccion.
- Soporte de tool calling limitado al formato y la funcion vistos en el corpus (`ipython`); no se documenta generalizacion a otras herramientas.
- Idiomas soportados no documentados; el corpus de entrenamiento esta en formato Qwen y no se especifica su composicion linguistica.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Nanbeige4.2-3B debe verificarse por separado y el checkpoint es un artefacto experimental con 0 descargas y sin validacion externa.
- El repositorio no incluye el backbone; es necesario descargarlo aparte y respetar su licencia.

## Enlaces

- HuggingFace: https://huggingface.co/Jadson/Nanbeige4.2-3B-dlora-sft
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
