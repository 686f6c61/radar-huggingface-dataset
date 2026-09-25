# Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen

## Resumen

Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen es una publicacion de pesos ya preparada para servir el modelo Qwen3.8-27B (27.356.728.560 parametros, 64 capas) en una unica GPU de 24 GB. El autor, Ar4ikov, no reentrena ni modifica el cuerpo del modelo: parte de su propia exportacion cuantizada `Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM` (int4 asimetrico AWQ, grupo 128, con zero points, generada con llm-compressor a partir de pesos bf16) y aplica sobre ella el pipeline `prepare/` de HyperQwen. Ese pipeline convierte a int8 las cabezas y los embeddings, y anade una cabeza de borrador (*draft head*) para decodificacion especulativa basada en el modulo MTP del modelo.

El problema que resuelve es de despliegue: el pipeline de HyperQwen reescribe el checkpoint en sitio (cabezas int8, draft head), por lo que cada maquina que quisiera usarlo debia repetir un paso de CPU de unos 10 minutos. Este repositorio publica el resultado ya cocinado, de forma que el usuario solo descarga 16,9 GB de safetensors. Ademas preserva la exportacion original intacta para quien use transformers o vLLM sin parches.

Es relevante ahora porque combina tres piezas poco frecuentes en un mismo paquete: arquitectura hibrida Gated-DeltaNet/atencion, torre de vision que se mantiene en bf16, y decodificacion especulativa con MTP integrada en el checkpoint. El autor reporta 111,4 tok/s en un solo flujo y 437 tok/s con ocho flujos concurrentes en una RTX 3090, con una ventana de contexto de 65.536 tokens. La licencia es Apache-2.0 y el modelo raiz es `Qwen/Qwen3.8-27B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Gated-DeltaNet / atencion (SSM + attention), 64 capas, con torre de vision y cabeza MTP |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (perfil `CTX=fast`, `--max-model-len 65536`) |
| Tipos de cuantizacion | Cuerpo: int4 asimetrico AWQ, grupo 128, con zero points. Cabezas (`lm_head`, `embed_tokens`), modulo MTP y draft head: int8 simetrico grupo 128. Torre de vision, proyecciones de puerta SSM y normas de la cabeza MTP: bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), libreria vllm |
| Tamano del repositorio | 16,9 GB |
| Pipeline | image-text-to-text (instruct, conversational) |
| Modelo base | Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM (relacion: quantized), orcarouter/Qwen3.8-27B-Uncensored |
| Modelo raiz | Qwen/Qwen3.8-27B |
| Descargas / likes | 71 / 0 |
| Fecha de publicacion | 22 de septiembre de 2026 (actualizado el 25 de septiembre de 2026) |

## Arquitectura y entrenamiento

La arquitectura del modelo raiz es hibrida: combina capas de atencion con capas Gated-DeltaNet (una familia de modelos de espacio de estados con puerta), lo que explica que el autor mencione "las proyecciones de puerta SSM" entre los tensores que se mantienen en bf16. El checkpoint tiene 64 capas y, ademas del tronco, incorpora una torre de vision (el pipeline del repositorio es `image-text-to-text`) y un modulo MTP (*multi-token prediction*) que se usa como cabecera de decodificacion especulativa. La model card indica explicitamente que el cuerpo del modelo "no esta tocado": la unica intervencion sobre los pesos del tronco es la cuantizacion int4 asimetrica AWQ con grupo 128 y zero points, realizada con llm-compressor sobre los pesos originales en bf16.

No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo que si se detalla es la receta de posprocesado de este repositorio: `lm_head` pasa de bf16 (2,5 GB) a int8 grupo 128 simetrico con un error de ida y vuelta del 0,7 % (`prepare/quant_heads_stream.py`); `embed_tokens` pasa de bf16 (2,5 GB) a int8 grupo 128 simetrico con error del 0,65 %; el modulo MTP completo (`mtp.*`, ocho capas lineales incluida `mtp.fc`, 850 MB en bf16) se convierte a int8; y se anade `mtp.draft_lm_head` junto con `mtp_draft_vocab_ids.pt`, una cabeza de borrador de 40.960 filas recortada del `lm_head` int8 usando la lista de identificadores que HyperQwen distribuye. La innovacion tecnica destacable no es de entrenamiento sino de inferencia: la decodificacion especulativa con MTP integrada en el propio checkpoint (2,85 tokens aceptados por paso de forward) y la ruta de kernel `marlin-int8-asym-zp` para el int8 asimetrico con zero points.

## Capacidades

- Generacion de texto instructiva y conversacional en formato multi-turno (etiqueta `instruct`, `conversational`).
- Comprension de imagenes y respuesta a prompts image-text-to-text: la model card indica que el modelo describe correctamente una imagen de prueba con un cuadrado rojo dibujado, un circulo azul y una linea de texto (`boost/image_smoke.py`), en todos los perfiles medidos.
- Decodificacion especulativa mediante el modulo MTP y una cabeza de borrador de 40.960 filas, con 2,85 tokens aceptados por paso de forward en el perfil `SPEC=mtp CTX=fast`.
- Razonamiento y codigo: no hay datos especificos publicados en la informacion disponible sobre benchmarks de razonamiento, matematicas o generacion de codigo; se heredan las capacidades del modelo raiz Qwen3.8-27B, que no se detallan aqui.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidad especial: inferencia multimodal con la torre de vision activada (`VISION=1`) manteniendo el tronco en int4.

## Casos de uso

- Despliegue multimodal en una sola GPU de 24 GB: este repositorio existe precisamente para eso. El checkpoint ocupa 16,9 GB en disco y, segun el autor, deja espacio en una tarjeta de 24 GB para la cache KV (70.933 tokens de pool en el perfil medido) y para la decodificacion especulativa.
- Asistente de atencion al cliente con imagenes: el pipeline image-text-to-text permite que el usuario adjunte capturas o fotos de un producto defectuoso y reciba una respuesta en texto; los 65.536 tokens de contexto admiten historiales de conversacion largos con varias imagenes intermedias.
- Analisis de documentos y capturas de pantalla: transcripcion y descripcion de contenido visual (interfaces, graficos, diagramas) combinada con preguntas en lenguaje natural, usando la torre de vision que se mantiene en bf16 para no degradar la percepcion.
- Asistencia de codigo en estacion de trabajo local: con el tronco en int4 y solo 24 GB de VRAM necesarios, encaja en equipos de desarrollo con una RTX 3090 o 4090, lo que permite ejecutar un modelo instructivo de 27 B sin depender de APIs externas.
- Generacion de contenido por lotes con alto throughput: el perfil medido con ocho flujos concurrentes alcanza 437 tok/s, adecuado para tareas de resumen, clasificacion o extraccion sobre volumenes grandes de texto.
- Investigacion sobre cuantizacion y decodificacion especulativa: el repositorio publica las recetas (`recipe.yaml`), las mediciones de kernels y las variantes int8 (W4A8), por lo que sirve como banco de pruebas reproducible para comparar AWQ asimetrico int4, cabezas int8 y MTP.
- Servicio de inferencia interno con vision y contexto largo: al cargarse con vLLM 0.29 (con o sin la serie de parches), se puede exponer como endpoint compatible con la API de OpenAI dentro de una infraestructura propia, con licencia Apache-2.0.
- Evaluacion de modelos derivados de una base sin censura: la model card lista `orcarouter/Qwen3.8-27B-Uncensored` entre los modelos base, por lo que puede emplearse para estudiar el comportamiento de ese linaje; conviene revisar antes las implicaciones de moderacion (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo unico que el autor publica son mediciones de throughput y aceptacion de la decodificacion especulativa en la configuracion `bench/run_benchmarks.sh single` de HyperQwen.

| Perfil | C1 (temperatura por defecto) | C1 (temperatura 0) | Tokens por paso (T=default / T=0) | C8 | Pool KV |
|---|---|---|---|---|---|
| `SPEC=mtp CTX=fast` (64k, KV en bf16) | 111,4 tok/s | 116,0 tok/s | 2,85 / 2,82 | 437 tok/s | 70.933 |

Entorno de medida declarado por el autor: RTX 3090 a 350 W, vLLM 0.29.0, segunda ejecucion tras el arranque, `VISION=1` con la torre de vision transmitida desde la RAM del host imagen a imagen. C1 corresponde a un unico flujo de prompts reales con respuestas de 1.024 tokens; C8, a ocho flujos concurrentes; "tok/step" es el numero de tokens aceptados por paso de forward.

## Requisitos de hardware

- VRAM estimada: el objetivo declarado es una unica GPU de 24 GB, con margen para cache KV (pool de 70.933 tokens a 65.536 de contexto en el perfil medido). El checkpoint en disco pesa 16,9 GB.
- GPU recomendadas: RTX 3090 (validada por el autor a 350 W). No se documentan mediciones en A100, H100 ni RTX 4090 en la informacion disponible.
- Compatibilidad con GPU de consumo: si, el caso de uso central del repositorio es servir un modelo de 27 B en una tarjeta consumer de 24 GB.
- Memoria del host: en la configuracion medida la torre de vision se transmite desde la RAM del host para cada imagen, por lo que se requiere RAM suficiente y capacidad de pinned memory; no se especifica cantidad.
- Opciones de despliegue: contenedor TurboQwen (`docker compose --profile single up -d`, con `CHECKPOINT=base`); despliegue bare metal con HyperQwen en la rama `awq-asym` (`VISION=1 SPEC=mtp CTX=fast bash single-user/start_qwen.sh`), que requiere vLLM 0.29.0 mas la serie de parches y el kernel `marlin-int8-asym-zp`; y vLLM 0.29 estandar (`vllm serve Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen --max-model-len 65536`), que carga el modelo pero sin decodificacion especulativa, sin la cabeza de borrador y sin la ruta int8 Marlin.
- Latencia y throughput: 111,4 tok/s en un flujo y 437 tok/s en ocho flujos concurrentes, medidos en RTX 3090 con vLLM 0.29.0. El tiempo hasta el primer token (TTFT) no se publica.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las variantes directamente emparentadas del mismo autor.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen (este) | 27,36 B | 65.536 | safetensors, int4 AWQ asimetrico g128 + cabezas int8 + draft head MTP | Apache-2.0 | Preparado para HyperQwen; 111,4 tok/s C1 y 437 tok/s C8 en RTX 3090 |
| Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM | 27,36 B (mismo tronco) | no disponible | safetensors, int4 AWQ asimetrico g128 | Apache-2.0 | Exportacion fuente, sin cabezas int8 ni draft head; compatible con transformers y vLLM estandar |
| Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen-fast | 27,36 B (mismo tronco) | no disponible | safetensors, `lm_head` en int4 GPTQ | Apache-2.0 | Variante "fast" para un solo usuario, unos pocos tok/s mas |
| Qwen/Qwen3.8-27B (raiz) | no disponible | no disponible | bf16 (presumiblemente) | Apache-2.0 | Modelo original sin cuantizar; requiere mas VRAM que una tarjeta de 24 GB |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de otros autores.

## Limitaciones y advertencias

- El autor advierte que las mediciones se hicieron con la torre de vision leyendose desde la RAM del host en cada imagen; en produccion esto puede anadir latencia y presion de memoria en funcion del hardware.
- El soporte completo (decodificacion especulativa, draft head, ruta int8 Marlin) exige una rama parcheada de HyperQwen y vLLM 0.29.0. Con vLLM estandar se pierden esas optimizaciones y cabe esperar un rendimiento inferior al publicado.
- El rendimiento declarado corresponde a una unica configuracion (RTX 3090 a 350 W, prompt reales, respuestas de 1.024 tokens, segunda ejecucion tras el arranque). No se reportan latencias de primer token, rendimiento en lotes mas grandes ni en otros modelos de GPU.
- Una de las bases declaradas es `orcarouter/Qwen3.8-27B-Uncensored`, lo que implica que el modelo puede carecer de las capas de moderacion habituales. Debe evaluarse el filtrado propio antes de exponerlo a usuarios finales.
- No se declara lista de idiomas soportados; el castellano no esta confirmado explicitamente y deberia validarse con pruebas propias.
- No hay informacion sobre sesgos, tasa de alucinacion ni comportamiento fuera de distribucion. La cuantizacion int4 asimetrica del tronco introduce degradacion respecto al modelo raiz en bf16, no cuantificada en la model card.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de descripcion de imagenes o extraccion de datos de documentos si no se verifica la salida.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el checkpoint ni sobre el kernel parcheado; la validez legal de la licencia depende de que el modelo raiz Qwen/Qwen3.8-27B sea efectivamente Apache-2.0.
- La model card generada por el autor no incluye informacion de entrenamiento, datos de evaluacion ni advertencias adicionales mas alla de las tecnicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen
- Exportacion fuente cuantizada: https://huggingface.co/Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM
- Variante "fast": https://huggingface.co/Ar4ikov/Qwen3.8-27B-AWQ-W4A16-ASYM-HyperQwen-fast
- Modelo raiz: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base sin censura: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Repositorio HyperQwen: https://github.com/syv-ai/HyperQwen
- Rama parcheada usada en las mediciones: https://github.com/Ar4ikov/HyperQwen/tree/awq-asym
- Repositorio TurboQwen (contenedor y benchmarks): https://github.com/Ar4ikov/TurboQwen
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces verificables son los de la model card y los repositorios anteriores.
