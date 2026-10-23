# RecursiveSI/flint-int4-gguf

## Resumen

Flint INT4 GGUF es una distribucion cuantizada en formato GGUF del modelo Recursive Flint, un modelo de lenguaje de 39.785.287.456 parametros (aproximadamente 39,8 mil millones) desarrollado por Recursive y orientado especificamente a agentes de programacion. Esta variante concreta emplea cuantizacion Q4_1 (int4) y esta pensada para ejecutarse en Macs con Apple Silicon mediante llama.cpp con backend Metal, con un fichero de 26,0 GB que incluye pesos, tokenizer y plantilla de chat.

El modelo base forma parte de un esfuerzo mas amplio de Recursive: la empresa utilizo su sistema Eureka Machine, una plataforma de investigacion automatizada que propone, implementa y valida mejoras en arquitectura, entrenamiento e inferencia, para desarrollar buena parte del stack de Flint. Segun la informacion publica disponible, se trata de un modelo texto-only construido para tareas de codificacion agentica, con una ventana de contexto de 262.144 tokens.

La relevancia de esta publicacion radica en que permite ejecutar localmente, en hardware de consumo de gama alta (Apple Silicon con al menos 48 GB de memoria unificada), un modelo de casi 40B con contexto completo de 262k tokens, gracias a la cuantizacion int4 y al soporte de llama.cpp con Metal. Es, por tanto, una opcion practica para desarrolladores que quieran un agente de codigo local sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de lenguaje texto-only; la model card no detalla la arquitectura interna) |
| Parametros totales | 39.785.287.456 (~39,8 B) |
| Parametros activos | No disponible / no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_1 GGUF (int4); embeddings y otros tensores en coma flotante almacenados en F32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `flint-int4-q4_1.gguf`), con tokenizer y plantilla de chat incluidos |
| Tamano del repositorio | 26,0 GB |
| Cache KV | F16 (`-ctk f16 -ctv f16`) en la configuracion de referencia |

## Arquitectura y entrenamiento

La model card de esta variante no describe la arquitectura interna del modelo base, mas alla de indicar que es un modelo texto-only orientado a generacion de texto y a uso como agente de codificacion. Tampoco se detallan el numero de capas, el tipo de atencion ni si incorpora mecanismos como decodificacion especulativa. Lo que si se especifica es que el fichero Q4_1 conserva los codigos INT4 entrenados de la exportacion MLX, con escalas y offsets en FP16, mientras que los embeddings y otros tensores en coma flotante se almacenan en F32, lo que hace que este GGUF sea mas grande que la variante Flint INT4 en formato MLX.

En cuanto al entrenamiento, la informacion proporcionada indica que los datos incluian documentos web publicos y rastreados, texto y codigo, datos con licencia comercial y datos sinteticos generados por IA. La fase de post-entrenamiento incluyo instruction tuning, aprendizaje por refuerzo y datos de preferencias humanas. No se especifican el volumen total de tokens, la composicion exacta del dataset ni los detalles de las tecnicas de RLHF/DPO empleadas; para ello, la model card remite a la documentacion del modelo base Flint.

## Capacidades

- Generacion de texto y razonamiento orientado a tareas de programacion, con soporte de modo de razonamiento (`reasoning_content` en el historial de conversacion).
- Uso como agente de codificacion: la model card lo describe explicitamente como un modelo "built for coding agents".
- Integracion con clientes de agentes como pi y OpenCode mediante ficheros de configuracion incluidos en el repositorio (`pi-models.json`, `opencode.json`).
- Soporte de conversaciones multi-turno con contexto muy largo (hasta 262.144 tokens), incluyendopresupuesto de generacion configurable de 65.536 tokens que computa tambien el razonamiento.
- Compatibilidad con el servidor `llama-server` de llama.cpp y su API compatible con endpoints, lo que facilita su uso desde herramientas que hablan el protocolo de OpenAI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni otras modalidades; el modelo es texto-only.

## Casos de uso

- Agente de codigo local en Mac: con 262.144 tokens de contexto y configuracion para pi u OpenCode, el modelo puede mantener el estado de un repositorio completo y ejecutar tareas de varios pasos (leer ficheros, proponer cambios, razonar sobre errores) sin salir del equipo del desarrollador.
- Asistencia en refactorizaciones de gran alcance: la ventana de contexto permite cargar varios modulos y sus dependencias a la vez, lo que resulta util para tareas de reescritura o migracion que afectan a multiples ficheros.
- Revision de codigo automatizada en local: integrado en un `llama-server`, puede recibir diffs y contexto del repositorio y generar comentarios o detectar problemas antes de abrir una pull request, sin enviar codigo propietario a servicios externos.
- Generacion de tests y documentacion: con el contexto completo del proyecto, el modelo puede producir tests unitarios o documentacion tecnica coherente con las convenciones del repositorio.
- Automatizacion de tareas de analisis estatico asistido: combinado con herramientas externas via el endpoint compatible, puede orquestar consultas a linters o compiladores y razonar sobre los resultados.
- Prototipado y experimentacion en investigacion: al ser Apache 2.0 y ejecutable en hardware de consumo, sirve como banco de pruebas para estudiar comportamiento de agentes de codigo, cuantizacion int4 y ventanas de contexto largas sin costes de API.
- Uso en entornos con requisitos de privacidad: al ejecutarse integramente en local sobre Apple Silicon, es adecuado para equipos que no pueden enviar codigo a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta variante remite a la del modelo base Flint para consultar benchmarks, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otros) en los datos proporcionados.

## Requisitos de hardware

- VRAM / memoria: el fichero de pesos ocupa 26,0 GB; la model card exige un Mac con Apple Silicon y al menos 48 GB de memoria unificada para ejecutar la configuracion de referencia.
- GPU recomendadas: Apple Silicon de gama alta con 48 GB o mas de memoria unificada (la model card no especifica modelos concretos de chip). No se documentan requisitos para GPU NVIDIA o AMD en esta variante.
- Cabe en GPU de consumo: si, en el segmento de Apple Silicon de gama alta con memoria unificada suficiente; no se indica compatibilidad con GPUs de consumo tipo RTX 4090 en la informacion disponible.
- Opciones de despliegue: llama.cpp con backend Metal (`llama-server`, `-ngl all`), con los flags de referencia `-c 262144 -np 1 --cache-ram 0 -b 256 -ub 128 -t 8 -fa on -ctk f16 -ctv f16 --jinja`. Tambien se menciona su disponibilidad en LM Studio. No se documentan vLLM ni TGI para esta variante GGUF.
- Parametros de muestreo de referencia: `--temp 1 --top-p 0.95 --top-k 20 --min-p 0`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Flint INT4 GGUF (este modelo) | ~39,8 B | 262.144 | GGUF Q4_1 | Apache 2.0 | 26,0 GB; pensado para Apple Silicon con llama.cpp/Metal |
| Flint (modelo base) | ~39,8 B (misma familia) | 262.144 (segun configuracion de cliente) | No disponible | Apache 2.0 | Version de referencia sin cuantizar; fuente de benchmarks y convenciones de chat |
| Flint INT4 (MLX) | No disponible (misma familia) | No disponible | MLX int4 | Apache 2.0 | Version int4 para MLX; el GGUF Q4_1 reutiliza sus codigos INT4 |
| Otros modelos de codigo de ~30-40 B | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos comparativos de modelos externos en la informacion disponible |

## Limitaciones y advertencias

- Modelo texto-only: no procesa imagenes, audio ni otras modalidades.
- Requiere hardware especifico: Apple Silicon con al menos 48 GB de memoria unificada para la configuracion documentada; en equipos con menos memoria habria que reducir contexto o recurrir a otras variantes.
- La cuantizacion Q4_1 introduce perdida de precision respecto al modelo base; el impacto exacto en calidad no se cuantifica en la informacion disponible.
- El contexto de 262.144 tokens con KV en F16 consume una cantidad elevada de memoria; la propia model card recomienda ajustar `-c` si se necesita reducir el uso de KV.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la documentacion proporcionada.
- Sesgos: los datos de entrenamiento incluyen web rastreada y datos sinteticos generados por IA, lo que puede introducir sesgos y artefactos; no se detallan analisis de sesgo.
- Idiomas soportados no especificados: no hay garantia documentada de calidad en castellano u otros idiomas distintos del ingles.
- Para reutilizar historial de conversacion es necesario usar `--jinja` y preservar `reasoning_content`; omitirlo puede degradar el comportamiento del agente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento si se redistribuye.
- No se han publicado benchmarks en la informacion disponible, por lo que la evaluacion de calidad debe hacerse de forma empirica antes de llevarlo a produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RecursiveSI/flint-int4-gguf
- Arbol de ficheros: https://huggingface.co/RecursiveSI/flint-int4-gguf/tree/main
- Licencia: https://huggingface.co/RecursiveSI/flint-int4-gguf/blob/main/LICENSE
- Modelo base Flint: https://huggingface.co/RecursiveSI/flint
- Variante Flint INT4 (MLX): https://huggingface.co/RecursiveSI/flint-int4
- Anuncio de Flint por Recursive: https://recursive.com/updates/introducing-recursive-flint
- Cobertura en TechCrunch: https://techcrunch.com/2026/10/21/recursive-launches-flint-a-laptop-coding-model-it-says-was-largely-built-by-ai/
- Ficha en LM Studio: https://lmstudio.ai/models/recursive-flint
- Guia de compilacion de llama.cpp con Metal: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md#metal-build
- Instalacion de pi: https://pi.dev/
- Guia de modelos personalizados de pi: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/models.md
- Documentacion de OpenCode: https://opencode.ai/v2/docs/
- Guia de proveedores de OpenCode: https://opencode.ai/v2/docs/providers/#custom
