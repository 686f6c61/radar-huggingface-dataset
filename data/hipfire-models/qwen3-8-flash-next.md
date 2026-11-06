# hipfire-models/qwen3.8-flash-next

## Resumen

Qwen3.8-Flash-Next HFQ es una familia de builds cuantizados del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario hipfire-models. No se trata de un modelo entrenado desde cero, sino de una redistribucion en formato HFQ (Hipfire Quantized Format) pensada para rutas AMD concretas, con especial atencion a la arquitectura RDNA y al target gfx1151 (APU Strix Halo). El repositorio ofrece cuatro niveles de cuantizacion: MQ4-XTS como opcion por defecto, MQ3-XTS de precision mixta y dos variantes MQ2-XTS orientadas a minimizar el tamano de descarga.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra un pipeline de cuantizacion sobre un modelo de gran tamano con evaluacion de divergencia KL frente al profesor BF16 o FP8, y lo empaqueta en un formato consumible mediante el runtime hipfire. El repositorio ocupa 1584,9 GB en total, aunque cada tier individual pesa entre 44,54 GB y 70,89 GB para el archivo base, a los que se anade obligatoriamente un archivo PLE compartido en q4 o q8 en tiempo de servicio.

La informacion disponible no detalla la arquitectura interna del modelo base, el numero de parametros ni la longitud de contexto. Los tags incluyen `qwen4` y `qwen3.8`, y la model card menciona "trunk experts" y "hot/cold experts", lo que sugiere una arquitectura de mezcla de expertos, pero no se confirma de forma explicita en el material proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona "trunk experts" y expertos "hot/cold", compatible con MoE, sin confirmacion explicita) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MQ4-XTS (por defecto), MQ3-XTS (precision mixta), MQ2-XTS, MQ2-XTS-4500; PLE en q4 o q8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | HFQ (Hipfire Quantized Format), libreria `hipfire` |

Datos adicionales de los tiers publicados:

| Tier | Tag de descarga | Base (GB) | Base + PLE q4 (GB) | Base + PLE q8 (GB) |
|---|---|---:|---:|---:|
| MQ4-XTS | `qwen3.8:flash` | 70,89 | 100,01 | 125,29 |
| MQ3-XTS | `qwen3.8:flash-next-mq3-xts` | 59,11 | 88,23 | 113,51 |
| MQ2-XTS | `qwen3.8:flash-next-mq2-xts` | 46,90 | 76,02 | 101,30 |
| MQ2-XTS-4500 | `qwen3.8:flash-next-mq2-xts-4500` | 44,54 | 73,66 | 98,94 |

Los totales son sumas aritmeticas de archivos, no requisitos minimos de RAM o VRAM. El autor lo indica explicitamente.

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-Flash-Next no viene descrito en la informacion proporcionada: no se detalla si es un transformer denso, un MoE o una arquitectura hibrida, ni se indican tokens de entrenamiento, composicion del dataset o tecnicas de alineacion como RLHF o DPO. Los tags del repositorio (`qwen4`, `qwen3.8`) y las referencias a "trunk experts" con recuentos de expertos "hot" y "cold" (16.839 W3 frios + 7.737 MQ4 calientes en MQ3-XTS; 6.306 MQ4 calientes + 18.270 E8P frios en MQ2-XTS) apuntan a una arquitectura de mezcla de expertos con politicas de cuantizacion diferenciadas por frecuencia de activacion, pero esto es una inferencia a partir de la nomenclatura de cuantizacion, no un dato confirmado.

La innovacion tecnica destacable de esta publicacion es el propio esquema de cuantizacion. MQ3-XTS no es un 3 bits uniforme: combina expertos frios en W3 con expertos calientes en MQ4, priorizando precision donde mas impacta. MQ2-XTS aplica una logica similar con expertos calientes en MQ4 y frios en E8P. Ademas, el modelo requiere un archivo PLE (lookup rows referenciadas por el archivo base) en tiempo de servicio, con variantes q4 y q8; el autor aclara que q8 es exacto respecto a las filas Q8 originales, no respecto al fuente BF16. La seleccion de PLE con `--ple auto` escoge q4 para gfx1151 y q8 en el resto de rutas, combinando elecciones en hosts con GPU mixtas.

El autor documenta una verificacion de integridad: el base por defecto es una particion verificada del monolito fijado, con un recorrido independiente de 1.197 tensores byte-equal, habiendo movido solo los 128 shards PLE.

## Capacidades

- Generacion de texto: el modelo base es un modelo de lenguaje, pero la model card no enumera capacidades funcionales concretas.
- Razonamiento y codigo: no confirmado en la informacion disponible; el corpus de evaluacion `code24` sugiere interes en dominio de codigo, sin que ello implique una capacidad declarada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repo aparece vacio.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Muestreo recomendado por el autor: `temperature 1.0`, `top_p 0.95`, `top_k 20`.

## Casos de uso

- Despliegue local en hardware AMD RDNA: el tier MQ4-XTS por defecto esta pensado para rutas gfx1151 (APU Strix Halo) mediante el runtime hipfire, lo que permite ejecutar el modelo en equipos consumer con memoria unificada en lugar de depender de GPUs de datacenter. El comando `hipfire pull qwen3.8:flash --ple auto` automatiza la seleccion del archivo PLE adecuado.
- Experimentacion con cuantizacion extrema: los tiers MQ2-XTS y MQ2-XTS-4500 permiten estudiar el impacto de reducir el peso base a 44-47 GB, con la advertencia explicita del autor de que las metricas de cada tier no son intercambiables ni comparables entre si.
- Evaluacion de calidad de cuantizacion en pipelines de investigacion: el repositorio incluye artefactos de verificacion (KLD, NLL/PPL, top-1, SHAs) en `kld/VERIFY.md`, utiles para reproducir la comparacion entre cuantizaciones sobre los corpus WikiText-2 y code24.
- Servicio en entornos con almacenamiento limitado: cuando el espacio en disco es la restriccion principal, MQ2-XTS-4500 reduce el base a 44,54 GB y el conjunto con PLE q4 a 73,66 GB, a costa de una KLD media mayor (0,2078 en WT2 y 0,2077 en code24 en la tabla de emulacion pre-land).
- Pruebas de portabilidad entre arquitecturas AMD: la model card documenta diferencias medibles entre gfx1151, gfx1201 (R9700) y 7900 XTX con builds y variables de entorno distintas, lo que sirve para validar rutas de despliegue antes de produccion.
- Benchmarking de inferencia en decodificacion y prefill: las tablas separan rutas decode y prefill, lo que permite caracterizar el comportamiento del runtime en cada fase con el mismo conjunto de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica exclusivamente distancias KL de divergencia distribucional, que no miden precision en tareas.

MQ4-XTS, diagnosticos con overlay de trunk OFF e IU4 OFF (build `7d4000765`, PLE q4, gfx1151, Top-256 + residual, profesor fuente BF16):

| Corpus | KLD media |
|---|---:|
| WikiText-2 | 0,104865 |
| code24 | 0,098913 |

MQ3-XTS en R9700 / gfx1201 (build `qwen4_kld` `ca0aee9c9`, PLE q4):

| Pantalla | Referencia | Filas | KLD media | IC 95% |
|---|---|---:|---:|---|
| WT2 prefill, 32 x 512 ctx | BF16 | 8160 | 0,137031 | [0,123022, 0,150604] |
| code24 prefill, 24 x 512 ctx | BF16 | 6120 | 0,134368 | [0,116136, 0,153730] |
| assistant decode, 64 seq completas | FP8 | 11079 | 0,071951 | [0,041595, 0,103647] |
| assistant cold prefill, 64 seq completas | FP8 | 11079 | 0,074448 | [0,047190, 0,099977] |

MQ3-XTS en 7900 XTX (diagnostico, build `a7d98ea23`, D2-OFF, `HIPFIRE_OFFLOAD_EXEC=pcie`):

| Corpus | Subconjunto | KLD media | Diferencia vs R9700 en chunks emparejados (IC 95%) |
|---|---|---:|---|
| WT2 | primeros 24 chunks, 6120 filas | 0,140131 | -0,004769 [-0,012641, +0,002368] |
| code24 | 24 chunks completos, 6120 filas | 0,143923 | +0,009555 [+0,001604, +0,018288] |

MQ2 roots en 7900 XTX (build `ea2abd11...`, PLE q4, roots publicados):

| Root | WikiText-2 (emulacion) | code24 (emulacion) |
|---|---:|---:|
| `mq2-xts` (6.306 calientes) | 0,1851 | 0,1981 |
| `mq2-xts-4500` | 0,2078 | 0,2077 |

| Root | Corpus | Ruta | KLD media en XTX |
|---|---|---|---:|
| `mq2-xts` | WikiText-2 | decode | 0,1966 |
| `mq2-xts` | code24 | decode | 0,2083 |
| `mq2-xts` | WikiText-2 | prefill | 0,2106 |
| `mq2-xts` | code24 | prefill | 0,2112 |
| `mq2-xts-4500` | WikiText-2 | decode | No medido |
| `mq2-xts-4500` | code24 | decode | 0,2192 |
| `mq2-xts-4500` | WikiText-2 | prefill | 0,229 |

El autor advierte que estas cifras no son precision de tarea, no se agrupan entre referencias y no constituyen un ranking entre tiers.

## Requisitos de hardware

- VRAM/RAM estimada: los tamanos de descarga van de 44,54 GB (MQ2-XTS-4500 base) a 125,29 GB (MQ4-XTS con PLE q8). El autor insiste en que son sumas de archivos, no minimos de memoria; el consumo real en servicio no se documenta.
- GPUs objetivo: gfx1151 (APU Strix Halo) como ruta principal del tier por defecto; gfx1201 (R9700) y 7900 XTX aparecen en las mediciones de MQ3 y MQ2.
- GPU consumer: el modelo esta disenado para hardware AMD RDNA consumer y APUs con memoria unificada, pero el volumen de pesos (44-125 GB) excede la VRAM de GPUs consumer discretas convencionales de 24 GB; encaja en equipos con memoria unificada grande o configuraciones multi-GPU.
- Opciones de despliegue: runtime hipfire (`hipfire pull`, `hipfire run`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.
- Variables de entorno relevantes citadas: `HIPFIRE_OFFLOAD_EXEC=pcie` y `HIPFIRE_QWEN4_D2_DEFAULT=0` (solo en la ruta diagnostica no productiva de 7900 XTX).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento en tareas que permitan una comparacion con alternativas de la misma categoria. El unico punto de referencia interno es el modelo base Qwen/Qwen3.8-Flash-Next sin cuantizar, respecto al cual estas builds introducen divergencia KL medible segun las tablas anteriores.

## Limitaciones y advertencias

- Modelo experimental: el tag `experimental` y la propia model card indican que no es un artefacto de produccion estable.
- Las metricas KLD no miden precision de tarea; el autor lo repite de forma explicita y prohibe interpretarlas como ranking entre tiers.
- El tier por defecto (MQ4-XTS) solo tiene KLD publicado con overlay OFF e IU4 OFF; no hay cifra KLD para la ruta de servicio por defecto con overlay ON en gfx1151.
- La cifra antigua de KLD ~0,066 (build `fe77c0837`, otra ruta) no es la cifra vigente y no debe citarse como tal.
- El binario publicado `ca0aee9c9` rechaza MQ3 en 7900 XTX; las mediciones de ese tier en XTX provienen de un build posterior (W3-slab) y son diagnosticas, no una afirmacion de soporte en toda la gama.
- Las tablas de emulacion pre-land de MQ2 (base FP8, solo pesos) no son mediciones en tarjeta y no deben agruparse con las tablas on-card.
- El corpus "assistant" de MQ3 mezcla proxy de asistente, HumanEval y OASST, no esta corregido por confounders y su referencia es FP8, no BF16; la mejora en cold prefill no es estadisticamente significativa (el IC cruza cero).
- Requiere un archivo PLE adicional en tiempo de servicio; omitirlo impide servir el modelo.
- Licencia `qwen-community-1.0` (etiquetada como `other`): es una licencia de comunidad con posibles restricciones de uso comercial que deben revisarse en el archivo LICENSE antes de cualquier despliegue productivo.
- Sesgos, riesgo de alucinacion y limitaciones de contexto o idioma: no documentados en la informacion disponible.
- El repositorio completo ocupa 1584,9 GB; conviene descargar solo el tier necesario mediante los tags indicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/qwen3.8-flash-next
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Verificacion de KLD (solo MQ4): https://huggingface.co/hipfire-models/qwen3.8-flash-next/blob/main/kld/VERIFY.md
- Licencia: https://huggingface.co/hipfire-models/qwen3.8-flash-next/blob/main/LICENSE
