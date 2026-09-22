# recoilme/image21-08b-text-encoder-adapter

## Resumen

`recoilme/image21-08b-text-encoder-adapter` es un adaptador de regresion de estados ocultos que sustituye el codificador de texto nativo del pipeline Qwen-Image-2.1 (Qwen3-VL-8B, 17,5 GB en bf16) por el modelo `Qwen/Qwen3.5-0.8B` (~1,8 GB en bf16) mas el propio adaptador. Lo desarrolla el usuario recoilme y se publica bajo licencia `qwen-research` en la libreria `diffusers`. Su objetivo no es generar texto ni imagenes por si mismo, sino producir tensores de embeddings compatibles con el DiT de Qwen-Image-2.1.

El problema que resuelve es de memoria, no de velocidad: el autor cifra el pico del pipeline nativo (DiT 14,2 GB + codificador de texto + VAE 1,4 GB) en unos 33 GB, frente a unos 17,5 GB con el adaptador, lo que permite ejecutar la generacion texto-a-imagen en GPUs de 24 GB. El entrenamiento es una regresion pura entre los estados ocultos del estudiante y los del profesor, sin imagenes, sin VAE y sin difusion.

El alcance declarado en la model card es solo texto-a-imagen (t2i) en una primera etapa; la edicion con tokens de vision queda aplazada a una etapa B. El repositorio ocupa 0,6 GB, no tiene descargas ni likes en el momento de la consulta y esta fechado el 21 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de regresion sobre el modelo estudiante Qwen3.5-0.8B (transformer hibrido: 3 x Gated DeltaNet + 1 x full attention); proyecta estados ocultos al espacio del codificador de texto de Qwen-Image-2.1 |
| Parametros totales | Adaptador de 60-170 M de parametros sobre el estudiante Qwen3.5-0.8B (~0,8 B); el estudiante no se incluye en el repo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Sin contexto de chat declarado. Entrenamiento a 256 tokens; rama de atencion con `max_len` 512; el pipeline de Qwen-Image-2.1 no define `max_sequence_length` y no recorta el prompt |
| Tipos de cuantizacion | No disponible (la documentacion solo menciona bf16 para el estudiante) |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: qwen-research` |
| Formato de pesos | No disponible (repo de 0,6 GB, libreria `diffusers`; el autor no detalla el formato de los ficheros) |

## Arquitectura y entrenamiento

El adaptador lee ocho cortes de estados ocultos del estudiante, tomando cada tercer capa empezando por la 3: `{3, 6, 9, 12, 15, 18, 21, 24}`. Con un `hidden` de 1024 por capa, la dimension de entrada resultante es 8192, y la salida debe reproducir un tensor `(B, L, 4096)` correspondiente a la salida de la capa 35 del profesor (Qwen3-VL-8B) antes del RMSNorm final. El estudiante tiene 24 capas, `hidden` 1024, 8 cabezas Q y 2 KV, `head_dim` 256, `intermediate` 3584, vocabulario 248320, `tie_word_embeddings: true`, un modulo MTP de una capa, `rope_theta` 1e7 y `mrope_section [11, 11, 10]`. El bloque de vision del estudiante tiene profundidad 12, `hidden` 768, salida 1024 y `deepstack` vacio, frente a `[8, 16, 24]` en el profesor.

El entrenamiento consiste en una regresion directa de estados ocultos (estudiante a profesor), sin imagenes, sin VAE y sin difusion. Los prompts se construyen con una plantilla literal, no con `apply_chat_template`: `<|im_start|>system\nComprehend and analyze the provided prompt.<|im_end|>\n<|im_start|>user\n{prompt}<|im_end|>\n<|im_start|>assistant\n`. El adaptador se entrena sobre la longitud completa y los primeros 14 tokens (prefijo de sistema) los recorta el pipeline despues. El padding es derecho en entrenamiento e izquierdo en inferencia, y el autor sostiene que ambas convenciones son equivalentes siempre que al estudiante se le pase siempre `attention_mask`. El prompt incondicional para CFG usa la misma plantilla con `" "` en lugar del prompt, y CFG implica un segundo paso completo por el codificador.

Entre las comprobaciones tecnicas destacadas, el autor advierte de que `_get_qwen_prompt_embeds` devuelve tres valores (`prompt_embeds`, `encoder_attention_mask`, `image_pad_mask`) en la PR #14804 (SHA `8d3c30b`), de que en `transformers` 5.x `hidden_states[-1]` llega ya normalizado por el RMSNorm final, y de que el corte 24 del estudiante procede de esa salida normalizada mientras los cortes 3-21 son salidas crudas de capa. El autor acepta esa heterogeneidad en el primer prototipo gracias a una normalizacion por capa. La receta reutiliza el proyecto previo `qwen3-0.6b-4b-adapter` (`adapter_lib.py`, `train_adapter.py`, `TRAINING.ru.md`).

## Capacidades

- Sustitucion del codificador de texto de Qwen-Image-2.1 para generacion texto-a-imagen, manteniendo intactos DiT, VAE y planificador.
- Prediccion de embeddings de 4096 dimensiones equivalentes a la salida de la capa 35 del codificador nativo, antes del RMSNorm final.
- Reduccion del pico de memoria del pipeline de unos 33 GB a unos 17,5 GB, lo que habilita GPUs de 24 GB.
- Procesamiento de prompts en formato de plantilla con prefijo de sistema, rol de usuario y rol de asistente.
- Soporte de prompt incondicional y de CFG con dos pasadas completas por el codificador.
- Extraccion de estados ocultos mediante hooks en la salida de capa y en `language_model.norm`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo conversacional.
- No incluye capacidades de vision en esta etapa: los tokens de vision y la edicion quedan explicitamente aplazados a la etapa B.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes texto-a-imagen en GPU de consumo: con un pico estimado de ~17,5 GB, el pipeline completo cabe en tarjetas de 24 GB como la RTX 3090 o la RTX 4090, cosa que la configuracion nativa con el codificador de 17,5 GB no permite con holgura.
- Despliegue multi-tenant en servidores de 24 GB: al liberar unos 15 GB de VRAM en el codificador, ese margen se puede reasignar a mayor resolucion de imagen, batching del DiT o a servir varios procesos en la misma GPU.
- Prototipado local en estaciones de trabajo: el adaptador mas el estudiante suman poco mas de 2 GB de pesos, por lo que el arranque y el intercambio de checkpoints son mucho mas rapidos que mover un codificador de 17,5 GB.
- Investigacion en destilacion de codificadores de texto: la receta de regresion de estados ocultos, con lectura de cortes intermedios y objetivos de 4096 dimensiones, sirve como banco de pruebas reproducible para otras combinaciones estudiante-profesor.
- Evaluacion comparativa de la fidelidad del condicionamiento: al ser un reemplazo directo, permite medir con rel/ y cos la divergencia frente al profesor y decidir si la perdida de fidelidad es aceptable para un flujo de trabajo concreto.
- Reduccion de coste en pipelines de CI o lotes offline: dado que el codificador se calcula una sola vez por prompt, el ahorro de memoria es relevante en procesos que cargan y descargan el pipeline repetidamente.
- Reproduccion de la receta del proyecto klein: el autor documenta explicitamente las dependencias, la plantilla de prompt y los puntos de fallo (corte de 14 tokens, mascaras, versiones de `transformers`), lo que facilita reentrenar o adaptar el metodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que en validacion se observan metricas rel y cos, y que estas empeoran si el adaptador no ve exactamente la misma secuencia que el pipeline, pero no se aporta ninguna cifra concreta. Tampoco hay comparaciones numericas de calidad de imagen, FID, CLIP score ni latencias medidas.

## Requisitos de hardware

- Peso del estudiante: ~1,8 GB en bf16 (`Qwen/Qwen3.5-0.8B`). Adaptador: 60-170 M de parametros adicionales. El repositorio ocupa 0,6 GB.
- Pico de memoria estimado del pipeline con adaptador: ~17,5 GB (DiT 14,2 GB + codificador de texto ~1,8 GB + adaptador + VAE 1,4 GB), frente a ~33 GB con el codificador nativo.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 3090, RTX 4090 o equivalentes. No se han documentado pruebas en GPUs de 16 GB ni menores.
- GPUs de centro de datos: A100, H100 y similares son compatibles por memoria, pero no se aportan datos de rendimiento especificos.
- El autor subraya que el beneficio es de memoria y no de tiempo: el codificador se evalua una sola vez por prompt, de modo que la latencia por imagen apenas cambia.
- Despliegue mediante `diffusers` junto con la pipeline de Qwen-Image-2.1. Se citan dependencias concretas: `transformers` 5.x y la PR #14804 (SHA `8d3c30b`), que se fijan y se verifican con un aserto al cargar.
- El autor advierte de que los paquetes `fla` y `causal_conv1d` no estaban presentes en su entorno y que las capas lineales funcionan por un camino alternativo; en produccion conviene comprobar el efecto en latencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Memoria del codificador | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Codificador nativo de Qwen-Image-2.1 (Qwen3-VL-8B) | ~8 B | 17,5 GB en bf16 | Codificador de texto original, con vision | No indicada en la informacion disponible | Se distribuye con el pipeline Qwen-Image-2.1 |
| `recoilme/image21-08b-text-encoder-adapter` | 60-170 M de adaptador + 0,8 B de estudiante | ~1,8 GB (estudiante) mas adaptador | Sustituto del codificador, solo t2i | `qwen-research` | HuggingFace, 0 descargas, 0 likes |
| Adaptador del proyecto klein (`qwen3-0.6b-4b-adapter`) | No disponible (estudiante de 0,6 B) | No disponible | Adaptador del mismo tipo para otro pipeline | No disponible | Referenciado por el autor, no enlazado |

## Limitaciones y advertencias

- Licencia `qwen-research`: se trata de una licencia de investigacion, no de una licencia permisiva. Antes de cualquier uso comercial hay que revisar los terminos aplicables y, en su caso, los del modelo base Qwen3.5-0.8B.
- Estado de validacion nulo: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluacion de calidad de imagen.
- Alcance limitado a texto-a-imagen. El modo edicion con tokens de vision no esta cubierto en esta etapa y el propio autor lo marca como etapa B pendiente.
- Longitud de entrenamiento de 256 tokens. Los prompts muy largos no estan representados en el entrenamiento, aunque el pipeline no los recorte; el autor menciona que los captions de mas de 248 tokens representan solo ~0,2 % del conjunto.
- Dependencia fragil de versiones: la equivalencia de la convencion de padding, el punto exacto de extraccion de estados ocultos y la definicion del objetivo dependen de la version de `transformers` y de la PR citada, que se fijan con un aserto de carga.
- Heterogeneidad conocida en el corte 24 del estudiante, que procede de la salida ya normalizada por el RMSNorm final mientras los demas cortes son crudos. El autor lo acepta en el primer prototipo y deja abierta la correccion.
- CFG duplica el coste del codificador: cada generacion con escala mayor que 1 y prompt negativo implica una segunda pasada completa, y el pipeline sustituye el prompt vacio por `" "`.
- Riesgo de alucinacion y sesgos: inherentes al codificador de texto subyacente y al modelo de imagen; no se documentan analisis especificos en la informacion disponible.
- Idiomas soportados no declarados. La plantilla de prompt esta en ingles, lo que puede degradar el condicionamiento en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/recoilme/image21-08b-text-encoder-adapter
- Modelo base del estudiante: https://huggingface.co/Qwen/Qwen3.5-0.8B
- PR de `diffusers` #14804 (SHA `8d3c30b`), citada como referencia del contrato de sustitucion: no disponible como enlace en la informacion proporcionada
- Proyecto klein de referencia (`/workspace/qwen3-0.6b-4b-adapter`, ficheros `adapter_lib.py`, `train_adapter.py`, `TRAINING.ru.md`): ruta local, no disponible como enlace publico
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a sitios no relacionados (herramientas de inspeccion de software, guias tecnicas de configuracion de GPU y foros en otros idiomas).
