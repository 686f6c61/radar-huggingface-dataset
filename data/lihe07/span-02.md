# lihe07/span-02

## Resumen

span-02 es un modelo de decision (decision model) desarrollado por lihe07 (Harvey Li) y publicado en HuggingFace. No es un generador de texto libre: responde preguntas tipadas sobre un estado (JSON o texto, mas hasta 4 imagenes) devolviendo una distribucion de probabilidad completa sobre las opciones, en el formato de cable `/v1/systemone` de Decision Index. Es un fine-tune de `google/gemma-4-26B-A4B-it`, un transformer de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parametros activos por token.

El checkpoint esta cuantizado de forma nativa para un motor propio (NVFP4 en los expertos MoE, FP8 en las capas densas y de atencion) y se sirve con un motor Rust/CUDA incluido en el propio repositorio (`engine/`), disenado exclusivamente para GPUs NVIDIA Blackwell con compute capability 12.0 (`sm_120a`): RTX 5090 y RTX PRO 6000. El repositorio declara 15.815.134.090 parametros y ocupa 16,4 GB; la memoria de GPU en servicio es de unos 26 GB.

Su interes tecnico esta en dos decisiones de diseno. Primero, un bucle de razonamiento determinista: si la probabilidad maxima de la respuesta sin pensar cae por debajo de 0,8, el modelo escribe un pensamiento greedy cuyo limite de tokens deriva de un modelo de coste fijo (`think_cost.json`) calibrado sobre un objetivo de 750 ms, de modo que una misma peticion recibe siempre el mismo pensamiento. Segundo, la decodificacion especulativa con el borrador MTP publico de Gemma, con verificacion greedy, de forma que las respuestas numericas y los pensamientos son identicos token a token a una decodificacion greedy plana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), base Gemma 4 26B-A4B; vision tower bf16 |
| Parametros totales | 15.815.134.090 (dato real de safetensors); el modelo base se denomina 26B-A4B |
| Parametros activos | ~4B por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos MoE: NVFP4 W4A4 (pesos e2m1, escala FP8-e4m3 por cada 16 elementos, escala global FP32; activaciones NVFP4 con escalas globales estaticas por capa). Atencion y MLP densos: FP8 e4m3 W8A8. Embedding atado / LM head: FP8 e4m3 por fila. Vision tower, router, norms y KV cache: bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (`model.safetensors`), nativo del motor; no cargable por transformers ni vLLM |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B, una arquitectura de mezcla de expertos con unos 4B de parametros activos por token. Sobre esa base, span-02 aplica un fine-tune orientado a decision con salidas tipadas y anade dos componentes propios: un cabezal de borrador MTP (con vocabulario podado a 16.384 tokens, `draft_vocab_16384.json`) para decodificacion especulativa, y un modelo de coste (`think_cost.json`) que fija el presupuesto de tokens de pensamiento de forma determinista a partir de la longitud del prompt, el numero de imagenes, el numero de preguntas y el numero de preguntas que requieren pensar.

El checkpoint se distribuye ya cuantizado en un formato "engine-native": los expertos MoE en NVFP4 (W4A4) y las capas densas y de atencion en FP8 (W8A8), mientras que la torre de vision, el router, las normalizaciones y la cache KV permanecen en bf16. El processor de imagen de Gemma 4 se sirve con un presupuesto de `max_soft_tokens` de 560 (aproximadamente 1,3 MP). No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

El comportamiento de inferencia es particular: antes de responder, el modelo puede "pensar". Si la probabilidad maxima de la respuesta sin pensar es inferior a 0,8, escribe un pensamiento greedy; despues, la respuesta se vuelve a leer y la distribucion final es el promedio de ambas (0,5 x distribucion sin pensar + 0,5 x distribucion tras pensar), para todos los tipos de pregunta. La respuesta de tipo eleccion es la opcion con mayor probabilidad final.

## Capacidades

- Decision tipada con distribucion de probabilidad completa: tipos de salida `choice` (eleccion), `noul` (probabilidad si/no), `score` (niveles ordinales) y `number` (numero libre). El modelo nunca devuelve texto libre como respuesta.
- Razonamiento opcional determinista con umbral de probabilidad (tau 0,8) y presupuesto de pensamiento fijo basado en un objetivo de latencia de 750 ms.
- Entrada multimodal: el estado puede incluir hasta 4 imagenes por peticion (campo `images` o `assets`); el processor admite unos 1,3 MP por imagen.
- Entrada de estado flexible: cualquier valor JSON (cadena, objeto, array, etc.) y preguntas identificadas por id, con respuestas devueltas en el mismo orden.
- Decodificacion especulativa con el borrador MTP publico de Gemma, con verificacion greedy (identidad token a token con greedy plano).
- API HTTP propia (`POST /v1/systemone`, `GET /health`) en el formato System One de TypeSafe mas extensiones (`images`, `reasoning`).
- Soporte de `multipart/form-data` para adjuntar imagenes como partes de fichero.
- Compatibilidad de campo `model` en la peticion: se acepta y se ignora; la respuesta siempre informa `model: span-02`.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible (no se documenta).

## Casos de uso

- Triage automatico de tickets de soporte: el modelo recibe el JSON del ticket como `state` y devuelve una distribucion `choice` sobre categorias, o un `score` ordinal de prioridad. La probabilidad permite fijar umbrales de automatizacion frente a escalado a un humano.
- Moderacion de contenido con salida probabilistica: usando preguntas de tipo `noul` se obtiene la probabilidad de que un contenido cumpla una politica, lo que facilita politicas de actuacion graduadas en lugar de una decision binaria dura.
- Verificacion de formularios y webhooks: dado un payload JSON, el modelo responde preguntas tipadas sobre validez, coherencia o campos faltantes, con salidas `choice` y `noul` integrables en un pipeline de validacion.
- Puntuacion de riesgo o de leads: la salida `score` ordinal permite ordenar entidades (clientes, transacciones, candidatos) sin necesidad de un clasificador a medida.
- Extraccion de cantidades: la salida `number` devuelve un valor numerico libre (por ejemplo, una estimacion de precio o de plazo) a partir del estado, sin generar texto adicional.
- Inspeccion visual automatizada: con hasta 4 imagenes por peticion y un presupuesto de 1,3 MP por imagen, el modelo puede responder preguntas de decision sobre capturas o fotografias en tareas de control de calidad o clasificacion visual.
- Bucles de decision en agentes: al integrarse en el flujo `/v1/systemone` de Decision Index, la distribucion de probabilidad completa sirve como senal para planificadores y rutas de decision multi-paso.
- Enrutamiento de consultas internas: dado un estado de conversacion, elegir la siguiente accion o el equipo destinatario mediante `choice`, con un coste de latencia acotado por el presupuesto de pensamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en servicio: aproximadamente 26 GB de memoria de GPU en uso, segun la model card.
- GPU compatibles: exclusivamente NVIDIA Blackwell con compute capability 12.0 (`sm_120a`). Probado en RTX PRO 6000 Blackwell (96 GB) y RTX 5090 (32 GB). La medicion de latencia documentada corresponde a la RTX PRO 6000.
- Otras arquitecturas de GPU no estan soportadas, porque los kernels usan las instrucciones de tensor core de FP4/FP8 con escala por bloque de `sm_120a`.
- Software requerido: driver NVIDIA con soporte CUDA 12.9 (R575 o superior). Para compilar, CUDA toolkit 12.8+ (`nvcc`) y Rust; no se necesita GPU en el momento de la compilacion.
- Cabria en GPU de consumo dentro de la familia Blackwell (RTX 5090, 32 GB), siempre que se cumpla `sm_120a`. No es ejecutable en generaciones anteriores.
- Opciones de despliegue: motor propio `dllm-server` (Rust + CUDA) incluido en el repositorio, con `launch.sh` y `Dockerfile`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Arranque: unos 10 s mas unos 7 s de calentamiento. `GET /health` devuelve `{"ok":true,"model":"span-02"}` cuando el servidor esta listo.
- Latencia y throughput: no disponible (solo se indica que existe una medicion de latencia sobre RTX PRO 6000 y un objetivo de pensamiento de 750 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| span-02 | 15.815.134.090 (safetensors) | ~4B por token | no disponible | Apache 2.0 | HuggingFace, motor propio | Fine-tune de decision, salidas tipadas, cuantizado NVFP4/FP8, solo sm_120a |
| google/gemma-4-26B-A4B-it | no disponible | ~4B por token | no disponible | Licencia Gemma 4 | HuggingFace | Modelo base multimodal; sin salidas tipadas de decision |
| google/gemma-4-26B-A4B-it-assistant | no disponible | no disponible | no disponible | no disponible | HuggingFace | Borrador MTP para decodificacion especulativa; se descarga aparte |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables, por lo que la comparacion de rendimiento queda como no disponible.

## Limitaciones y advertencias

- El checkpoint es "engine-native": no puede cargarse con `transformers` ni con vLLM. El despliegue exige el motor incluido o su compilacion desde `engine/`.
- Solo funciona en GPUs NVIDIA Blackwell `sm_120a`. Queda excluido en A100, H100, RTX 4090 y cualquier arquitectura anterior.
- El modelo nunca devuelve texto libre como respuesta: solo produce los tipos `choice`, `noul`, `score` y `number`. No es utilizable como chatbot generativo.
- La distribucion de probabilidad que devuelve no es una garantia de veracidad; pueden existir sesgos y errores no calibrados. No se documentan evaluaciones de calibracion.
- La longitud de contexto no se publica, lo que dificulta planificar el tamano maximo de estado admitido.
- No se documentan idiomas soportados; se desconoce el comportamiento fuera del ingles.
- Limite de 4 imagenes por peticion y presupuesto de 560 tokens suaves (unos 1,3 MP) por imagen.
- El razonamiento es determinista y acotado: si la probabilidad maxima supera 0,8 no se genera pensamiento, de modo que la calidad de la decision depende de esa puerta y del presupuesto de tokens fijo.
- La cuantizacion NVFP4/FP8 introduce perdida de precision respecto al modelo base; no se publican comparativas de calidad frente al fine-tune sin cuantizar.
- Licencia: el checkpoint declara Apache 2.0 pero enlaza a la licencia de Gemma 4 y depende de un modelo base de Google; conviene revisar el fichero `NOTICE` y la licencia de Gemma 4 antes de un uso comercial.
- Adopcion muy baja en el momento de la ficha (20 descargas, 0 likes), sin resultados de benchmarks publicados ni validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lihe07/span-02
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Borrador MTP (assistant): https://huggingface.co/google/gemma-4-26B-A4B-it-assistant
- Documentacion de la API System One de TypeSafe: https://docs.typesafe.ai/api
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Perfil de GitHub del autor: https://github.com/lihe07
- Web personal del autor: https://harvey-l.com
