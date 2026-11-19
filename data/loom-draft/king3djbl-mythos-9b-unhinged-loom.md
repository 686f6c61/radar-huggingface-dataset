# loom-draft/King3Djbl-mythos-9b-unhinged-loom

## Resumen

King3Djbl-mythos-9b-unhinged-loom es un paquete de despliegue en formato Loom publicado por el usuario loom-draft, pensado para ejecutar el checkpoint GGUF `mythos-9b-unhinged-Q4_K_M.gguf` (procedente del modelo base King3Djbl/mythos-9b-unhinged) sobre GPUs AMD. No se trata de un modelo nuevo ni de un fine-tune adicional: el autor indica explicitamente que el checkpoint GGUF se usa sin modificar y que el paquete se ha generado con la herramienta loom-next, sin intervencion de un LLM en el proceso. El repositorio contiene programas `.loom`, un `tokenizer.json`, un `llm_config.json` y una tarjeta `model.json` con los ficheros fuente fijados por hash sha256.

El objetivo del paquete es ofrecer una via de inferencia nativa para hardware AMD concreto: el APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se sirve a traves de `loom-serve`, que expone una API compatible con el endpoint `/v1/chat/completions` de OpenAI, con soporte de tool calling y de modo de razonamiento activado por defecto.

La relevancia del artefacto es acotada y muy especifica: no aporta mejoras de capacidad sobre el modelo base, sino un empaquetado reproducible para el ecosistema Loom sobre ROCm. El propio autor advierte de que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, etc.) aun no se han vuelto a medir para este paquete, por lo que la evidencia de calidad es practicamente nula en el momento de la publicacion. No hay datos publicados sobre la arquitectura interna, el numero de parametros exacto ni el proceso de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no documenta la arquitectura del modelo base) |
| Parametros totales | no disponible (el nombre comercial sugiere ~9B, sin confirmacion tecnica) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unico checkpoint empaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mythos-9b-unhinged-Q4_K_M.gguf`) empaquetado como programas `.loom` y `weights.loom` |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base King3Djbl/mythos-9b-unhinged: ni el repositorio Loom ni la model card citada describen el tipo de transformer, el numero de capas, la dimension oculta, la atencion (MHA, GQA, MLA) ni si emplea algun esquema MoE o hibrido. Tampoco se documentan los datos de entrenamiento, el volumen de tokens, la composicion del corpus ni si hubo fases de RLHF, DPO o ajuste por preferencias. La unica referencia tecnica es el nombre del checkpoint (9b) y el hecho de que el modelo base se distribuye como GGUF, lo que implica que alguien lo convirtio previamente desde pesos originales de formato no especificado.

La innovacion tecnica del artefacto no reside en el modelo, sino en el empaquetado Loom: `loom-next` genera programas `.loom` (kernels) especificos para las arquitecturas gfx1151 y gfx1201 a partir del GGUF, y `loom-serve` los ejecuta con un pool de memoria de tipo `fixed`, carga de parametros en modo `preload` y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`). El autor declara soporte de decodificacion especulativa como "no aplicable" y de "reasoning effort" tambien como "no aplicable". La ficha menciona puertas de validacion (comparacion token a token contra llama.cpp, consistencia en concurrencia, pruebas de kernels, agentes multi-turno) pero todas aparecen como "not yet re-measured", es decir, sin evidencia registrada.

## Capacidades

- Generacion de texto conversacional a traves de una API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Modo de razonamiento o "thinking" activado por defecto, desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Concurrencia de hasta 4 peticiones simultaneas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Ventana de contexto de 40.960 tokens por peticion.
- Entrada de imagen: estado "no determinado" en la model card.
- Entrada y salida de audio: estado "no determinado".
- Muestreo (temperature, top_k, seed): estado "no determinado" en la tabla de caracteristicas, aunque existe una puerta de validacion `sampling` sin resultados.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue local en APU Strix Halo: el paquete esta pensado para ejecutarse en un Ryzen AI Max+ 395 con `loom-serve`; resulta adecuado para desarrolladores que quieran un endpoint compatible con OpenAI en un equipo de sobremesa sin GPU discreta, usando el checkpoint Q4_K_M ya empaquetado.
- Inferencia en Radeon AI PRO R9700: la GPU de 32 GB permite cargar el modelo Q4_K_M con margen; el caso de uso tipico es un servidor de desarrollo o un nodo de laboratorio con ROCm donde se quiera evitar la pila CUDA.
- Integracion en pipelines con tool calling: al exponer `tools` y `tool_calls` en formato OpenAI, el modelo puede conectarse a frameworks de agentes que ya hablan ese protocolo, siempre que se acepte el limite de 4 peticiones concurrentes.
- Prototipado de asistentes con razonamiento explicito: el modo thinking activado por defecto permite experimentar con cadenas de razonamiento y desactivarlo cuando se prioriza latencia, mediante el parametro `enable_thinking`.
- Evaluacion comparativa frente a llama.cpp: el autor define puertas `golden`, `compare` y `logits` que comparan la salida del paquete contra una referencia de llama.cpp sobre el mismo GGUF; util para quien quiera validar la fidelidad numerica de los kernels generados.
- Entornos de investigacion sobre ROCm: sirve como banco de pruebas para medir el rendimiento de kernels `.loom` generados automaticamente frente a otras pilas de inferencia en hardware AMD.
- Chat de contexto largo moderado: con 40.960 tokens por peticion se pueden procesar documentos de decenas de paginas en una sola conversacion, aunque sin datos publicados sobre la calidad de recuperacion en ese rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero en ambas indica literalmente que "the results for this package are not yet re-measured". Todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como no medidas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El unico checkpoint empaquetado es Q4_K_M; para un modelo de ~9B en Q4_K_M el orden de magnitud habitual ronda los 5-6 GB de pesos, pero el autor no publica la cifra y el nombre "9b" no esta confirmado tecnicamente.
- GPU soportadas segun el autor: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo (Radeon RX, GeForce). El paquete esta generado para dos arquitecturas AMD concretas.
- Opciones de despliegue: `loom-serve` mediante `pipx install "hrx-loom[hf]==0.2.0"` y `loom-fetch` para descargar el paquete desde Hugging Face. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Parametros de ejecucion recomendados por el autor: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las tablas de rendimiento estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| King3Djbl-mythos-9b-unhinged-loom | no disponible (~9B por nombre) | 40.960 tokens | Apache 2.0 | GGUF empaquetado en `.loom` | Paquete especifico para Strix Halo y R9700; sin benchmarks publicados |
| King3Djbl/mythos-9b-unhinged (base) | no disponible | no disponible | no disponible en la informacion | GGUF (Q4_K_M) | Modelo original del que deriva el paquete; sin datos tecnicos en la informacion disponible |
| Alternativas de ~9B en GGUF para llama.cpp | variable | variable | variable | GGUF | No se dispone de datos concretos en la informacion proporcionada para establecer una comparacion cifrada |

No hay informacion suficiente para comparar parametros, rendimiento o contexto con alternativas concretas de la misma categoria. La comparacion cuantitativa queda pendiente de que el autor publique las mediciones de rendimiento y correccion.

## Limitaciones y advertencias

- Ausencia total de evidencia de calidad: todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay validacion publicada de que los kernels generados reproduzcan fielmente la salida de llama.cpp.
- Ambito de hardware muy restringido: solo se documentan gfx1151 (Strix Halo) y gfx1201 (Radeon AI PRO R9700). No hay garantia de funcionamiento en otras GPUs AMD ni en NVIDIA.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens, lo que restringe su uso en produccion con cargas altas.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingue concreto.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al no haber benchmarks ni evaluaciones de calidad, no se puede acotar.
- Sesgos conocidos: no documentados.
- La licencia Apache 2.0 se declara en el repositorio, pero el modelo base no expone su licencia en la informacion proporcionada; conviene verificar la cadena de licencias antes de un uso comercial.
- El nombre "unhinged" del modelo base sugiere un ajuste orientado a reducir restricciones conversacionales; no hay documentacion tecnica que lo confirme ni que describa sus implicaciones.
- El paquete depende de la version exacta `hrx-loom[hf]==0.2.0`; cambios de version pueden alterar el comportamiento de carga y ejecucion.
- La fecha de creacion del repositorio (2026-11-19) y la ausencia de descargas o likes indican que se trata de un artefacto recien publicado y sin validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/King3Djbl-mythos-9b-unhinged-loom
- Modelo base: https://huggingface.co/King3Djbl/mythos-9b-unhinged
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
