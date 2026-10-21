# dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4

## Resumen

Dongfangshuo-Qwen3.8-27B-NSFW-v4 es un ajuste fino (finetune) del modelo abliterado Huihui-Qwen3.8-27B-abliterated, publicado por el usuario dongfangshuo en HuggingFace. Se trata de un transformer denso de aproximadamente 26.900 millones de parametros (el autor lo describe como 27,8B dense + vision) con codificador visual, orientado a la creacion literaria en chino y a la interpretacion de rol (roleplay y partidas de TRPG) sin censura. El problema que aborda es la rigidez estilistica y el rechazo de contenido del modelo base: segun el autor, el Qwen original "no habla como una persona" y tiende a enumeraciones, mientras que esta version incorpora un corpus literario amplio para mejorar el registro narrativo.

El modelo se distribuye en tres formatos: safetensors BF16 en 18 shards (53,7 GB), cinco cuantizaciones GGUF (de Q3_K_M a Q8_0) mas un proyector visual BF16 de 931 MB, y un checkpoint LoRA independiente (1,7 GB). La ventana de contexto recomendada por el autor es de 64K tokens con una salida maxima de 4K por turno; el propio autor advierte que superar esos limites provoca fallos, y que la arquitectura de 27B tiene "defectos de base" que se amplifican tras la cuantizacion.

Es relevante ahora por dos motivos: primero, porque documenta un caso de uso muy concreto (roleplay de larga duracion con preservacion de estado mediante paneles HTML y tiradas de dados) con parametros de muestreo y guardarrailes de prompt muy detallados; segundo, porque su model card incluye un test ciego comparativo propio frente al modelo base y a una version intermedia sin purificar. No es un modelo de proposito general: el propio autor reconoce una ligera perdida de "inteligencia" y de capacidades de agente respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador visual (Qwen3.8-27B, dense + vision); 64 capas de atencion "purificada" segun el autor |
| Parametros totales | 26.895.998.464 (~26,9B; el autor indica 27,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64K recomendado por el autor; `num_ctx` configurado a 81.920 como margen de seguridad; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | GGUF: Q3_K_M, Q4_K_M (recomendada), Q5_K_M, Q6_K, Q8_0; BF16 en safetensors; LoRA en el checkpoint-150 |
| Idiomas soportados | Chino (`zh`) exclusivamente segun metadatos; el autor prohibe explicitamente la mezcla de idiomas en la salida |
| Licencia | qwen-community-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (18 shards, 53,7 GB), GGUF (5 cuantizaciones), LoRA (1,7 GB); proyector visual `mmproj-model-bf16.gguf` |

## Arquitectura y entrenamiento

La base es un transformer denso de la familia Qwen3.8 en variante 27B, con torre de vision integrada (pipeline `image-text-to-text`). El autor describe el proceso como un finetune sobre la version abliterated de huihui-ai, es decir, sobre un modelo al que ya se le han suprimido los mecanismos de rechazo. Sobre esa base se aplica lo que el autor denomina "purificacion de atencion en 64 capas", junto con una fusion de MLP (los safetensors incluyen "base + fusion MLP") y un entrenamiento con "un corpus literario masivo" orientado a estilo narrativo en chino.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. El autor menciona que la version v3 se descarto por un esquema de entrenamiento "demasiado agresivo" (tres intentos fallidos) y que v4 usa un esquema nuevo, probablemente la ultima iteracion de 27B de esta linea. Se conserva un checkpoint LoRA (`checkpoint-150`) con las capas de atencion ya purificadas, pensado para reentrenamiento o reutilizacion. La innovacion tecnica declarada es, por tanto, estilistica y de alineacion, no arquitectonica.

## Capacidades

- Generacion de texto narrativo en chino con registro literario: parrafos naturales, frases de 20 a 35 caracteres, evitacion de estructuras tipo lista.
- Roleplay de larga duracion y partidas de TRPG: mantiene estado de la partida, resuelve tiradas 1d100 con polaridad correcta y emite paneles de estado en HTML con aritmetica de HP/SAN/LUST.
- Modo de razonamiento breve ("thinking" corto): el autor exige activar `Reasoning effort is set to low` en el system prompt para que el modelo ejecute 200-400 tokens de calculo de estado antes de narrar.
- Comprension de imagenes: incluye proyector visual BF16 de 931 MB para entrada image-text-to-text.
- Escritura creativa y continuacion de ficcion con control de contexto largo (hasta 64K con 5 turnos consecutivos estables, segun el autor).
- Capacidad de agente y tool calling: heredada del modelo base, aunque el autor advierte de un deterioro "leve pero perceptible" tras el finetune literario.
- Capacidades multilingues: limitadas al chino; el autor pide explicitamente evitar la mezcla con ingles.
- Contenido para adultos sin censura (abliterated + NSFW), restringido a mayores de edad.

## Casos de uso

- Roleplay conversacional de larga duracion en clientes tipo SillyTavern u OpenWebUI: el modelo mantiene anclajes de contexto a 64K y evita repetir frases de turnos anteriores con `presence_penalty: 0.25`, lo que permite sesiones de 5 o mas turnos sin deriva narrativa.
- Partidas de TRPG automatizadas con reglas mecanicas: el modelo ejecuta tiradas 1d100, aplica consecuencias reales en las tiradas fallidas (51-100) y actualiza el panel de estado en HTML con aritmetica verificable, algo que el autor documenta como punto fuerte frente a versiones previas.
- Escritura de ficcion por capitulos en chino: con 2.800-4.200 caracteres por turno y un estilo de parrafo natural, sirve para generar borradores de novela con continuidad de personajes y escenarios.
- Generacion de datos sinteticos de dialogo para entrenamiento de modelos de rol: la combinacion de contexto largo, panel de estado estructurado y control de repeticion permite producir conversaciones multi-turno etiquetadas.
- Base para finetunes posteriores: el repositorio incluye safetensors BF16 completos y un LoRA independiente de 1,7 GB, reutilizables para especializar el modelo en otros generos o idiomas.
- Descripcion y anotacion de imagenes en chino: el proyector visual permite tareas image-text-to-text, como describir escenas o personajes a partir de imagenes de referencia.
- Despliegue local privado sin conexion: las cuantizaciones Q3_K_M (13,3 GB) y Q4_K_M (16,5 GB) caben en GPUs de consumo, lo que permite ejecutar el modelo en Ollama o llama.cpp sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor incluye un test ciego propio de seis dimensiones sobre 5 turnos consecutivos de TRPG con contexto de 64K, comparando el modelo base (J), una version sin purificar (K) y esta v4. La tabla de la model card esta truncada en la informacion proporcionada; se reproducen unicamente las filas disponibles:

| Dimension (peso) | Base 27B (J) | Sin purificar (K) | v4 (64K+4K) |
|---|---|---|---|
| Recuperacion de anclajes a 64K y estabilidad de cierre (20%) | 88,0 | 78,0 | 100,0 |
| Seguimiento de polaridad en tiradas 1d100 (20%) | 94,0 | 55,0 | 98,0 |
| Integridad del panel HTML y coherencia aritmetica (15%) | 75,0 | 58,0 | 99,0 |
| Estilo de parrafo natural (peso no disponible) | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

Se trata de una evaluacion subjetiva del propio autor, sin metodologia publica ni jueces independientes; no es comparable con benchmarks academicos.

## Requisitos de hardware

- VRAM estimada por cuantizacion (sin contar la cache KV del contexto configurado):
  - Q3_K_M: 13,3 GB de pesos, 12-16 GB de VRAM.
  - Q4_K_M (recomendada): 16,5 GB de pesos, 16-24 GB de VRAM.
  - Q5_K_M: 19,2 GB, 24 GB de VRAM.
  - Q6_K: 22,1 GB, 24-32 GB de VRAM.
  - Q8_0: 28,6 GB, 32 GB o mas.
  - BF16 safetensors: 53,7 GB, requiere 60 GB o mas (A100 80GB, H100).
- Proyector visual: anadir 931 MB en BF16 si se usa entrada de imagen.
- Cache KV: con `num_ctx: 81920` el consumo adicional de memoria no esta cuantificado en la informacion disponible; es el factor que mas puede desbordar una GPU de 24 GB.
- GPUs de consumo compatibles: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4080/3090 (16-24 GB) para Q3_K_M y Q4_K_M; configuraciones de 32 GB para Q8_0.
- GPUs de datacenter: A100 40GB o 80GB y H100 para BF16 y para servir con contexto maximo.
- Opciones de despliegue: Ollama (el repositorio incluye un `Modelfile` con todos los parametros), llama.cpp, Transformers. Soporte en vLLM o TGI: no confirmado en la informacion disponible.
- Throughput y latencia: no disponibles. Como referencia cualitativa, el autor reporta que la generacion de 3.000-4.200 caracteres por turno con pensamiento breve es estable, pero no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dongfangshuo-Qwen3.8-27B-NSFW-v4 | ~26,9B denso + vision | 64K recomendado | Roleplay y ficcion NSFW en chino | qwen-community-1.0 | GGUF, safetensors, LoRA en HF |
| Huihui-Qwen3.8-27B-abliterated (modelo base) | ~26,9B denso | no disponible | Abliterated sin finetune estilistico | no disponible | HF |
| Qwen3.8-27B original (upstream) | ~27,8B denso + vision | no disponible | Proposito general, alineado con rechazo | qwen-community-1.0 (presumible) | HF |
| Version intermedia "sin purificar" (K) | ~26,9B | 64K en el test del autor | Mismo objetivo, peor resultado en el test ciego | no disponible | No distribuida publicamente |

El autor situa explicitamente a v4 por delante del base y de la version K en las tres dimensiones publicadas del test ciego, y reconoce que el base mantiene mejor "inteligencia" y capacidad de agente. No hay datos de benchmarks estandar para ninguno de los cuatro, por lo que la comparacion de rendimiento general no esta disponible.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta entrenado para generar material NSFW explicito; la etiqueta `not-for-all-audiences` aplica. Su uso debe restringirse a mayores de edad y cumplir la legislacion aplicable en la jurisdiccion del usuario.
- Licencia: `qwen-community-1.0` con nombre de licencia "other" en HuggingFace. Conviene revisar el texto completo de la licencia Qwen Community antes de cualquier uso comercial; las condiciones no estan detalladas en la informacion disponible.
- Modelo abliterated: la supresion de los mecanismos de rechazo implica ausencia de filtros de seguridad. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- Idioma: solo chino. El autor pide evitar explicita y repetidamente la mezcla con ingles, y el modelo no tiene capacidades multilingues declaradas.
- Contexto y salida: superar los 64K de contexto o los 4K de salida provoca, segun el autor, "fallos extranos" como relleno forzado o repeticion entre turnos. Forzar salidas de 8K degrada la calidad.
- Defectos de la arquitectura de 27B: el autor afirma que existen fallos de base que no ha podido corregir y que la cuantizacion los amplifica.
- Sensibilidad a los parametros de muestreo: `repeat_penalty >= 1.10` o `frequency_penalty > 0` "matan el punto chino" y producen parrafos de cientos de caracteres sin puntuacion. La ventana de configuracion valida es estrecha.
- Degradacion de razonamiento: el autor reconoce una perdida leve de inteligencia y de capacidades de agente respecto al modelo base, atribuible al corpus literario de entrenamiento.
- Alucinacion: no documentada especificamente, pero es un riesgo inherente a un finetune de roleplay sin evaluacion independiente; no hay datos de benchmarks estandar.
- Adopcion y validacion comunitaria: 0 descargas y 1 like en el momento de la consulta, creado y actualizado el mismo dia. No existe validacion por terceros.
- Fecha de publicacion en metadatos (2026-10-21) posterior a la fecha de consulta habitual; conviene verificar la vigencia del repositorio antes de integrarlo.
- Repositorio de 156,3 GB: la descarga completa de todas las cuantizaciones y safetensors requiere planificacion de almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Cuantizacion Q3_K_M: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q3_K_M.gguf
- Cuantizacion Q4_K_M (recomendada): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q4_K_M.gguf
- Cuantizacion Q5_K_M: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q5_K_M.gguf
- Cuantizacion Q6_K: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q6_K.gguf
- Cuantizacion Q8_0: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Dongfangshuo-Qwen3.8-27B-NSFW-v4-Q8_0.gguf
- Proyector visual BF16: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/mmproj-model-bf16.gguf
- Modelfile para Ollama: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/blob/main/Modelfile
- Checkpoints LoRA: https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/tree/main/lora_checkpoints
- Safetensors BF16 (18 shards): https://huggingface.co/dongfangshuo/Dongfangshuo-Qwen3.8-27B-NSFW-v4/tree/main
- Paper, blog o demo adicionales: no disponibles. La busqueda web realizada no devolvio enlaces tecnicos relevantes para este modelo.
