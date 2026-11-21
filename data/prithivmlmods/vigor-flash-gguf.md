# prithivMLmods/VIGOR-flash-GGUF

## Resumen

VIGOR-flash-GGUF es la distribucion en formato GGUF de VIGOR-flash (Vision Intelligence and Guardrail Oriented Reasoning), un modelo multimodal denso de 9.197 millones de parametros derivado de Qwen/Qwen3.5-9B. Lo desarrolla el usuario de Hugging Face prithivMLmods y esta especializado en clasificacion de seguridad de contenido visual: analiza imagenes y determina de forma conservadora si son aptas (Safe) o no aptas (NSFW), con especial atencion a ropa, exposicion corporal, poses, encuadre y contexto. No es un modelo generativo de proposito general, sino un clasificador de guardrail orientado a control parental y moderacion.

La relevancia de esta publicacion esta en el empaquetado: el repositorio ofrece pesos cuantizados con llama.cpp en un rango de 4,74 GB (Q3_K_M) a 18,4 GB (BF16), mas un proyector multimodal (`mmproj-bf16.gguf`, 922 MB) necesario para procesar imagenes. Ademas, los ficheros GGUF incorporan Multi-Token Prediction (MTP) con decodificacion especulativa integrada en los propios pesos, lo que evita depender de un modelo borrador separado y acelera la inferencia local.

El modelo esta pensado para investigacion y clasificacion de seguridad de contenido, se distribuye bajo licencia Apache 2.0 y solo declara soporte de ingles. Su salida esta disenada para ser JSON estricto con campos como `scene_description`, `is_nsfw`, `classification_reason`, `nsfw` y `safe`, lo que facilita su integracion en pipelines automatizados de moderacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.5-9B) con proyector visual; GGUF con cabezas MTP para decodificacion especulativa |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K; proyector en mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (mas safetensors en el modelo base) |

## Arquitectura y entrenamiento

VIGOR-flash se construye sobre Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9.200 millones de parametros, y anade capacidad visual mediante un proyector multimodal que se distribuye como fichero `mmproj` independiente en el ecosistema GGUF. La variante GGUF incorpora Multi-Token Prediction (MTP): cabezas adicionales dentro de la arquitectura principal que predicen varios tokens futuros en una sola pasada, integrando la decodificacion especulativa en los propios pesos en lugar de requerir un modelo borrador externo.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo esta afinado especificamente para la tarea de clasificacion de seguridad visual: analisis de vestimenta, codigos de vestir, exposicion corporal, poses y ambientacion, con un umbral de tolerancia cero declarado por el autor. La plantilla de chat por defecto opera con el modo "thinking" desactivado, y existe una variante de razonamiento con thinking activado.

## Capacidades

- Clasificacion binaria Safe / NSFW de imagenes con umbral conservador (en caso de duda, clasifica como NSFW).
- Descripcion visual detallada y objetiva del sujeto, la ropa, la exposicion y la pose.
- Generacion de salida JSON estricta con las claves `scene_description`, `is_nsfw`, `classification_reason`, `nsfw` y `safe`.
- Analisis de contenido sensible: desnudos, semidesnudos, ropa interior, lenceria, banadores sugestivos, ropa transparente, arte anime ecchi/hentai, ilustraciones adultas 2D/3D y poses sexualizadas.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text).
- Decodificacion especulativa integrada via MTP para acelerar la inferencia local.
- Soporte de plantilla de chat con modo thinking on/off.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni vision mas alla de la clasificacion descrita.

## Casos de uso

- Moderacion de contenido en plataformas de imagenes: el modelo recibe cada imagen subida y devuelve un JSON con `is_nsfw` y `nsfw`/`safe`, permitiendo bloquear o encolar automaticamente contenido sensible antes de su publicacion.
- Control parental en dispositivos locales: al ejecutarse en formato GGUF con llama.cpp, puede desplegarse en equipos de usuario sin enviar imagenes a la nube, filtrando contenido inapropiado en navegadores o galerias.
- Pre-filtrado en pipelines de anotacion: usar `scene_description` y `classification_reason` como primera pasada para etiquetar grandes lotes de imagenes y reducir el trabajo de revision humana.
- Auditoria de datasets de vision: clasificar corpus de imagenes antes de usarlos en entrenamiento, detectando contenido no apto que podria introducir sesgos o material prohibido.
- Guardrail en aplicaciones de generacion de imagenes: verificar las salidas de un generador antes de mostrarlas al usuario, actuando como capa de seguridad posterior.
- Cumplimiento normativo en foros y comunidades: generar registros JSON auditables de cada decision de moderacion, con justificacion textual apta para revision legal o de compliance.
- Despliegue en hardware de gama alta local: con los ficheros Q4_K_M (5,78 GB) o Q5_K_M (6,64 GB) puede ejecutarse en estaciones con GPU consumer de VRAM suficiente para clasificacion por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con Q4_K_M o Q5_K_M; alrededor de 7,6 GB con Q6_K; en torno a 18,4 GB con BF16. Hay que sumar el proyector visual `mmproj-bf16.gguf` (922 MB).
- GPU recomendadas: el autor menciona NVIDIA Blackwell y RTX Pro 6000 en las etiquetas; por tamano, una RTX 4090 (24 GB) o superior permite ejecutar BF16 con holgura, y tarjetas de 8-12 GB son suficientes para cuantizaciones Q4/Q5.
- Cabe en GPU consumer: si, en modelos con 8 GB o mas de VRAM usando Q4_K_M o Q4_K_S; las cuantizaciones Q3 (4,74-5,05 GB) permiten equipos con 6 GB.
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron los GGUF), y por extension los runners compatibles con GGUF que soporten modelos multimodales con `mmproj`; el autor recomienda el setup basado en Transformers frente al GGUF experimental.
- Latencia y throughput: no disponibles. La presencia de MTP con decodificacion especulativa integrada esta orientada a reducir la latencia de inferencia local, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VIGOR-flash-GGUF | 9.197 M | no disponible | Clasificacion visual Safe/NSFW con salida JSON | apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9.200 M | no disponible | LLM multimodal generico | no disponible | Hugging Face |
| prithivMLmods/VIGOR-flash (base) | 9.197 M | no disponible | Clasificacion visual en safetensors/Transformers | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado con clasificadores de seguridad visual alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor recomienda usar el setup basado en Transformers en lugar del GGUF, que califica como experimental.
- Solo soporta ingles; el prompt estandar y las salidas estan en ese idioma.
- Umbral de tolerancia cero declarado: clasifica como NSFW ante la duda, lo que puede generar falsos positivos en imagenes legitimas (playa, deporte, arte).
- Riesgo de alucinacion en la descripcion visual y en la justificacion de la clasificacion; las salidas deben validarse antes de tomar decisiones irreversibles.
- No es un modelo generativo de proposito general: usarlo fuera de la tarea de clasificacion de seguridad dara resultados poco fiables.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo para investigacion y clasificacion de seguridad, y exime de responsabilidad sobre las salidas.
- No se documentan sesgos especificos, pero al derivar de un LLM general puede heredar sesgos culturales en la interpretacion de vestimenta, pose o contexto.
- El repositorio ocupa 61,1 GB en total por acumular todas las cuantizaciones; conviene descargar solo el fichero necesario.
- No hay informacion sobre la longitud de contexto, lo que limita la planificacion de cargas por lotes o prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/VIGOR-flash-GGUF
- Modelo base (safetensors): https://huggingface.co/prithivMLmods/VIGOR-flash
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero BF16: https://huggingface.co/prithivMLmods/VIGOR-flash-GGUF/blob/main/VIGOR-flash.BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/VIGOR-flash-GGUF/blob/main/VIGOR-flash.Q4_K_M.gguf
- Fichero Q5_K_M: https://huggingface.co/prithivMLmods/VIGOR-flash-GGUF/blob/main/VIGOR-flash.Q5_K_M.gguf
- Fichero Q6_K: https://huggingface.co/prithivMLmods/VIGOR-flash-GGUF/blob/main/VIGOR-flash.Q6_K.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/VIGOR-flash-GGUF/blob/main/VIGOR-flash.mmproj-bf16.gguf
