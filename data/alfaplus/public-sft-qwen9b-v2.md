# alfaplus/public-sft-qwen9b-v2

## Resumen

`alfaplus/public-sft-qwen9b-v2` es un adaptador LoRA (PEFT) para el modelo base `Qwen/Qwen3.5-9B`, publicado por el usuario alfaplus. No es un modelo completo, sino un conjunto de pesos de adaptacion de 86.556.672 parametros (496 tensores en fp32) que se aplican sobre el decodificador de texto del modelo base. El entrenamiento se hizo con QLoRA sobre un subconjunto de 2.400 ejemplos del split de japones del dataset `CohereLabs/aya_dataset`, con 3 epocas y 450 pasos de optimizador efectivos.

El propio autor lo describe explicitamente como un "experimento de laboratorio, no un producto", y advierte de que no se ejecuto ninguna evaluacion de benchmarks ni se separo un conjunto de validacion. La relevancia de esta ficha es, por tanto, mas documental que practica: sirve como ejemplo de publicacion transparente de un adaptador pequeno (0,4 GB de repositorio) con trazabilidad completa de procedencia, hashes y configuracion de entrenamiento, y como recordatorio de los riesgos de entrenar sobre subconjuntos de datos crowdsourced con fuerte sesgo de anotador.

El adaptador se distribuye bajo licencia Apache-2.0, igual que el modelo base y que el dataset de origen. El idioma declarado es unicamente el japones (`ja`), y en el momento de redactar esta ficha el repositorio acumulaba 4 descargas y 0 "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (PEFT, `task_type=CAUSAL_LM`); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | No disponible para el base (el nombre sugiere ~9.000 millones); adaptador: 86.556.672 parametros entrenables en 496 tensores fp32 |
| Longitud de contexto | No disponible para el base; el entrenamiento uso `max_seq_len = 1024` (ningun ejemplo truncado, maximo real 881 tokens) |
| Tipos de cuantizacion | Base cargado en 4-bit NF4 con doble cuantizacion (bitsandbytes) durante el entrenamiento; pesos del adaptador en fp32. No se publican versiones GGUF ni cuantizaciones del modelo fusionado |
| Idiomas soportados | Japones (`ja`), unico idioma declarado |
| Licencia | Apache-2.0 (adaptador); el base y el dataset de origen son tambien Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT: `adapter_model.safetensors`, 346.302.176 bytes, sha256 `cec0388ca0207247dd00e286e2d7448d657f31b54c3dbff60d234a4f48a06a52`) mas `adapter_config.json` |

Datos adicionales de trazabilidad: modelo base en el commit `c202236235762e1c871ad0ccb60c8ee5ba337b9a`; dataset en la revision `f9ea04583f02a8f86404ff6c58bf75fe637df8a2`; `adapter_config.json` generado con PEFT 0.20.0; tokenizer y plantilla de chat guardados con transformers 5.15.0 (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`).

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 (`lora_alpha=64`, `lora_dropout=0.05`, `bias=none`) aplicado sobre `Qwen/Qwen3.5-9B`. Los modulos objetivo se seleccionaron de forma automatica y cubren las proyecciones de atencion (q/k/v/o_proj), las de la red feed-forward (gate/up/down_proj) y las proyecciones internas del bloque de estado (in_proj_qkv/z/a/b, out_proj), quedando excluidos los modulos de vision, audio, visual y mtp: el adaptador solo toca el decodificador de texto. El entrenamiento se hizo con QLoRA, cargando el base en 4-bit NF4 con doble cuantizacion y calculo en bf16, con kernel Liger, atencion SDPA y gradient checkpointing activado.

La configuracion de entrenamiento fue: 2.400 ejemplos, 3 epocas, 450 pasos totales (150 pasos por epoca con batch efectivo 16: 4 por dispositivo x 4 de acumulacion), optimizador `paged_adamw_8bit`, learning rate 1e-4 con schedule coseno, warmup del 3 %, semilla 42 y longitud de secuencia 1024. La perdida se calculo unicamente sobre los tokens de la respuesta del asistente (`all_tokens_loss=false`). El entrenamiento se ejecuto en una sola GPU con un pico de VRAM de 11,38 GiB y una duracion de 4.161 segundos (el dato de throughput queda cortado en la model card original).

El dataset se filtro asi: de 202.362 filas totales de Aya, 6.259 corresponden a `language_code == "jpn"`; restringiendo a `annotation_type == "original-annotations"` quedan 6.149; tras eliminar vacios y 3 duplicados exactos de `inputs` quedan 6.146; ninguno supera los 1024 tokens; tras barajar con `random.Random(42)` se toman los primeros 2.400. La asignacion de roles es `inputs → user` y `targets → assistant`, en formato de dos mensajes. No se aplico RLHF ni DPO: es SFT supervisado puro.

El punto critico del dataset es su concentracion: de las 6.149 filas japonesas de `original-annotations`, 6.144 provienen de un unico `user_id` (el segundo anotador aporta 5 filas). Ademas, el 54,2 % de las respuestas del subconjunto de entrenamiento tiene 10 caracteres o menos, y el 78,3 % no supera los 50 caracteres. El autor sospecha que buena parte del contenido procede de un corpus externo de noticias en japones sencillo (estilo NHK NEWS WEB EASY, 2022-2023) y senala que las comprobaciones con busqueda web no permitieron confirmar ni descartar coincidencia literal.

## Capacidades

- Generacion de texto conversacional e instrucciones en japones, heredada del modelo base y ajustada con 2.400 ejemplos japoneses.
- Respuestas de formato muy corto: el sesgo del dataset hacia respuestas de menos de 10 caracteres hace que el adaptador tienda a contestaciones telegraficas tipo pregunta-respuesta.
- Formato de chat: incluye `chat_template.jinja`, por lo que puede usarse con el pipeline de `text-generation` de transformers y con las plantillas del modelo base.
- Soporte de tool calling y function calling: no disponible; no se menciona ni se entreno para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible; no evaluado ni documentado.
- Capacidades multilingues: no disponibles; el único idioma declarado es el japones y no se midio competencia en ningun idioma.
- Vision, audio o modo "thinking": excluidos explicitamente del entrenamiento (los modulos correspondientes quedan fuera de los `target_modules`).
- Capacidades especiales: ninguna documentada; no hay evaluacion de ninguna clase.

## Casos de uso

- Investigacion sobre SFT de bajo coste: sirve como referencia reproducible de un ajuste QLoRA sobre un subconjunto pequeno y bien documentado, con hiperparametros, hashes y configuracion completos.
- Estudio de sesgo de anotador en datos crowdsourced: el caso permite analizar como un corpus con el 99,9 % de las filas de un solo anotador afecta al comportamiento del modelo resultante.
- Reproduccion de experimentos de trazabilidad: al publicarse el commit exacto del base, la revision del dataset, los hashes de los ficheros y la semilla, es posible repetir el pipeline paso a paso.
- Pruebas de formato de respuesta corta: util para estudiar tecnicas de ajuste orientadas a respuestas concisas en japones, aunque sin garantias de calidad.
- Docencia y divulgacion: ejemplo claro de model card honesta que documenta limitaciones antes que capacidades, adecuado para explicar buenas practicas de publicacion.
- Punto de partida para un ajuste posterior: el adaptador puede fusionarse con el base y usarse como inicializacion para un SFT mejor curado, siempre que se asuma el sesgo heredado.
- No se recomienda su uso en atencion al cliente, generacion de codigo, traduccion o cualquier tarea en produccion: no existe ninguna evaluacion que respalde su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explicita que "no se ejecuto ninguna evaluacion de benchmarks" y que no hay conjunto de validacion, por lo que no deben inferirse capacidades de los datos de entrenamiento. Los unicos numeros disponibles son de proceso de entrenamiento, no de calidad:

| Metrica | Valor |
|---|---|
| Pasos de optimizador | 450 (3 epocas x 150 pasos) |
| Ejemplos de entrenamiento | 2.400 |
| Perdida | Calculada solo sobre tokens del asistente; valor final no disponible |
| Evaluacion de benchmarks | Ninguna (no realizada por el autor) |
| Conjunto de validacion | No existe |

## Requisitos de hardware

- Entrenamiento (dato real del autor): una sola GPU con pico de 11,38 GiB de VRAM, 4.161 segundos de duracion total para los 450 pasos.
- Inferencia: requiere cargar el base `Qwen/Qwen3.5-9B` completo mas el adaptador. El autor no publica requisitos de inferencia.
- Estimacion orientativa no publicada por el autor (no debe tomarse como dato verificado): un modelo de ~9.000 millones de parametros en bf16 ocupa aproximadamente 18 GB de pesos, y en cuantizacion de 4 bits alrededor de 5-6 GB, a lo que hay que sumar la cache KV segun la longitud de contexto.
- GPU consumer: previsiblemente viable en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 y en tarjetas de 8-12 GB con cuantizacion de 4 bits, si bien esto no esta confirmado por el autor.
- GPU de datacenter: A100, H100 o L40S son suficientes y sobradas para inferencia, pero no hay cifras de latencia o throughput aportadas.
- Opciones de despliegue: no documentadas. Al ser un adaptador PEFT puede cargarse con transformers + peft, y es posible fusionarlo con el base para servir con vLLM o TGI, o convertirlo a GGUF para llama.cpp u Ollama. Ninguna de estas rutas ha sido validada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de comparacion en la informacion proporcionada. La model card no incluye ninguna evaluacion frente a alternativas. La tabla siguiente recoge unicamente lo que se sabe a partir de la informacion aportada, y los modelos de referencia se citan con datos generales del sector (no verificados en esta busqueda) solo a efectos orientativos:

| Modelo | Parametros | Contexto | Licencia | Tipo | Datos verificados |
|---|---|---|---|---|---|
| public-sft-qwen9b-v2 | Adaptador de 86,5 M sobre base de ~9B | No disponible (entrenado a 1024) | Apache-2.0 | Adaptador LoRA | Si (model card) |
| Qwen3.5-9B (base) | ~9B | No disponible | Apache-2.0 | Modelo completo | Solo la licencia y el commit |
| Aya-23-8B | 8B | 8.192 tokens (dato externo no verificado) | CC-BY-NC-4.0, uso no comercial (dato externo no verificado) | Modelo completo | No |
| Qwen2.5-7B-Instruct | 7B | 128K (dato externo no verificado) | Apache-2.0 (dato externo no verificado) | Modelo completo | No |

La comparacion de rendimiento entre estas opciones no es posible: el adaptador analizado carece de cualquier evaluacion publicada.

## Limitaciones y advertencias

- Sesgo de anotador extremo: 6.144 de las 6.149 filas japonesas de `original-annotations` provienen de un unico `user_id`; el segundo anotador solo aporta 5 filas. El modelo hereda la idiosincrasia de esa unica fuente.
- Sesgo de longitud: el 54,2 % de las respuestas de entrenamiento tiene 10 caracteres o menos y el 78,3 % no llega a 50. Es muy probable que el adaptador produzca respuestas extremadamente breves incluso cuando se le pida detalle.
- Ausencia total de evaluacion: no se ejecuto ningun benchmark ni se reservo validacion. No debe afirmarse que el modelo "sabe japones"; solo se sabe que fue ajustado con datos japoneses.
- Procedencia dudosa del contenido: el autor sospecha que parte de los datos procede de un corpus externo de noticias en japones sencillo y no pudo confirmar ni descartar coincidencia literal con las fuentes originales.
- Riesgo de alucinacion: no medido, pero previsiblemente alto dado el escaso volumen de datos, la ausencia de RLHF/DPO y el sesgo hacia respuestas plantilla.
- Cobertura idiomatica: solo japones declarado; cualquier otro idioma queda fuera del alcance declarado y sin evaluar.
- Escala del experimento: 2.400 ejemplos, 3 epocas, 450 pasos y una sola semilla (42). No hay estudios de robustez ni de variabilidad.
- Licencia: el adaptador es Apache-2.0, lo que permite uso comercial y redistribucion. El modelo base tambien es Apache-2.0. El dataset de origen tambien se declara Apache-2.0 y su licencia no cambia por esta publicacion. Aun asi, la licencia permisiva no implica idoneidad tecnica para produccion.
- Contenido generado: al derivar de un corpus posiblemente periodistico, conviene revisar posibles derechos sobre el texto de origen antes de un uso comercial a gran escala.
- El repositorio no incluye pesos fusionados, checkpoints intermedios, estado del optimizador ni copia del corpus de entrenamiento.
- El repositorio tiene un volumen minimo de adopcion (4 descargas, 0 likes), sin senales de validacion por parte de la comunidad.
- Advertencia final del propio autor: es un experimento de laboratorio, no un producto, y no debe tratarse como un modelo con capacidad en japones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfaplus/public-sft-qwen9b-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Paper de Aya (arXiv:2402.06619): https://arxiv.org/abs/2402.06619
- Licencia Apache-2.0: https://opensource.org/license/apache-2-0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B (referenciado como `base_model` en la model card; el autor no aporta enlace explicito)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos eran ajenos al ambito (contenido comercial sobre articulos de piel) y se han descartado.
