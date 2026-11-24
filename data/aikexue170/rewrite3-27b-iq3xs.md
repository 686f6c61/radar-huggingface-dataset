# aikexue170/rewrite3-27b-iq3xs

## Resumen

rewrite3-27b-iq3xs es una cuantizacion GGUF de tipo IQ3_XS del modelo rewrite3-27B, un modelo de lenguaje de 27.320.697.856 parametros (27,3 mil millones) desarrollado por el usuario aikexue170 y afinado a partir de Qwen/Qwen3.8-27B. Su proposito no es la generacion de texto generalista, sino la reescritura de textos de novelas web en chino: toma borradores degradados por generacion automatica (lo que el autor denomina "AIGC" o estilo de ocho partes) y los reescribe para que resulten fluidos, mantengan la voz del autor y no copien literalmente el original. Es, por tanto, un modelo de nicho orientado a un flujo de trabajo editorial muy concreto.

La relevancia de esta publicacion concreta reside en su formato: un GGUF IQ3_XS de 12,2 GB (11,4 GiB) pensado para ejecutarse en GPU de consumo con poca VRAM, con la cabeza MTP (multi-token prediction) ya embebida en los tensores (`blk.32.nextn.*`) para habilitar decodificacion especulativa en llama.cpp. El autor documenta una evaluacion comparativa entre formatos usando un clasificador externo de "calidad de prosa" (jevnovel3 0.8B) que puntua la probabilidad de que una frase suene a texto generado por IA, con metricas adicionales de fidelidad y de copia literal respecto al original.

El modelo se distribuye bajo licencia Apache 2.0, esta etiquetado como compatible con endpoints y solo declara soporte de chino (zh). No hay resultados de benchmarks academicos publicados; toda la evaluacion disponible es la comparativa interna de cuantizaciones que el autor incluye en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.8-27B), con cabeza MTP embebida para decodificacion especulativa |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantizacion | IQ3_XS (este repositorio); la familia incluye BF16, Q8_0, FP8 W8A8, NVFP4 W4A4, IQ4_XS, Q4_K_M, Q3_K_M |
| Idiomas soportados | zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos de 12,2 GB / 11,4 GiB); la familia incluye tambien safetensors en BF16, FP8 y NVFP4 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer decoder-only de 27,3 mil millones de parametros. Sobre esa base, el autor aplica un afinado especifico para reescritura de novela web china. La innovacion declarada en el plano arquitectonico es la incorporacion de una cabeza MTP (multi-token prediction) afinada para aumentar el throughput mediante decodificacion especulativa; en este GGUF la cabeza viaja dentro de los propios tensores (`blk.32.nextn.*`), de modo que llama.cpp puede usarla con `--spec-type draft-mtp`.

El entrenamiento se describe con detalle inusual en la model card. La primera generacion de datos (rewrite2) consistia en 20.000 pares de entrada degradada por AIGC y salida humana original, y presentaba tres problemas: el modelo tendia a acortar el texto, carecia de cadena de pensamiento (lo que degradaba atencion y generalizacion) y no distinguia que frases eran realmente formulaicas. La nueva receta introduce un clasificador externo, jevnovel3 0.8B, que asigna a cada frase una probabilidad de "mala calidad" (p_bad) tomada del final de la curva de percepcion. Sobre el texto humano original se aplica una primera expansion con Claude Opus 5.5 centrada en anadir detalle descriptivo sin introducir informacion no inferible; despues se puntua con jevnovel3 y se corrigen puntos concretos con Spark X 2.6, se vuelve a puntuar y se hace una ultima pasada con Kimi K3. El resultado es un texto enriquecido cuyo promedio de JEV iguala o mejora al del original humano. Finalmente, Gemini 4 Argon construye las cadenas de pensamiento a partir de la biblioteca de tipos de "ocho partes", el texto degradado, sus puntuaciones JEV y el texto enriquecido final, infiriendo la puntuacion, el tipo de formula y la estrategia de reescritura. El autor no publica el numero total de tokens de entrenamiento ni detalles de RLHF/DPO.

## Capacidades

- Reescritura de prosa en chino: transforma borradores con estilo formulaico de IA en texto fluido, con voz de autor y sin copia literal (restriccion dura declarada de no superar 15 caracteres consecutivos copiados).
- Razonamiento con cadena de pensamiento especifica para la tarea: el modelo genera un razonamiento previo (tipo de formula detectada, puntuacion JEV, estrategia de reescritura) antes del texto final.
- Deteccion implicita de "estilo IA": apoyada en el clasificador jevnovel3 integrado en el proceso de datos, no como modulo separado en inferencia.
- Expansion controlada de contenido: puede anadir detalle descriptivo al texto original sin introducir informacion no inferible del contexto.
- Decodificacion especulativa MTP: acelera la generacion en llama.cpp mediante la cabeza multi-token prediction embebida.
- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni capacidades multilingues mas alla del chino.

## Casos de uso

- Reescritura editorial de novelas web: el flujo natural del modelo es recibir un capitulo generado o asistido por IA y devolver una version reescrita con estilo humano, controlando la copia literal mediante la restriccion de 15 caracteres; encaja en plataformas de publicacion seriada que necesitan limpiar borradores antes de publicar.
- Limpieza de borradores asistidos por IA en estudios de contenido: un equipo que produzca volumen alto de ficcion con modelos generativos puede insertar rewrite3 como etapa de postproceso para reducir el "tono de ocho partes" antes de la revision humana.
- Control de calidad automatizado en pipelines editoriales: el modelo puede actuar como reescritor de segunda pasada sobre textos ya corregidos, con el clasificador JEV externo como metrica de aceptacion en el pipeline.
- Despliegue local en estaciones de trabajo con GPU de consumo: al ocupar 12,2 GB en IQ3_XS, cabe en tarjetas de 16 GB con contexto moderado (el autor indica que IQ4_XS permite 8k en 16 GB; IQ3_XS esta pensado para "extremadamente poca VRAM"), lo que permite reescribir sin enviar manuscritos a la nube.
- Prototipado de herramientas de escritura para autores: integracion en editores o plugins que ofrezcan "reescribe este parrafo manteniendo mi estilo" con inferencia local y sin coste por token.
- Investigacion sobre deteccion y mitigacion de estilo generativo: el par modelo mas clasificador JEV sirve como banco de pruebas para estudiar como se propaga y se elimina el estilo formulaico en textos largos en chino.
- Servicio de reescritura por API compatible: la etiqueta `endpoints_compatible` y el formato GGUF permiten montarlo tras llama-server y exponerlo como endpoint interno para un equipo editorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion es la comparativa interna entre formatos de cuantizacion, con seis prompts, KV cache en bf16 y el clasificador jevnovel3 como juez. La tabla siguiente reproduce los datos de la model card; IQ3_XS no aparece en ella (el autor indica que las variantes de 3 y 4 bits aun no se han evaluado):

| Formato | JEV medio (menor mejor) | Desvio del original (mayor mejor) | Copia mas larga (caracteres) | Copia total | Longitud del texto | Tiempo medio |
|---|---|---|---|---|---|---|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 43 s |

El autor concluye un orden de calidad FP8 > IQ4_XS > NVFP4, y senala que IQ4_XS es casi el doble de rapido que FP8 con una diferencia de JEV pequena. Para IQ3_XS no hay cifras publicadas.

## Requisitos de hardware

- VRAM estimada: 12,2 GB de pesos en IQ3_XS; con contexto de 16k y KV cache en bf16 hay que sumar varios GB adicionales, por lo que 16 GB es el minimo practico y 24 GB da margen comodo.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para uso local holgado; A100/H100 si se sirve en produccion con la variante FP8 o BF16; el autor posiciona IQ3_XS como opcion de "extremadamente poca VRAM" y Q3_K_M como opcion con "margen en tarjeta de 16 GB".
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con contexto moderado; el autor advierte que Q4_K_M (17,0 GB) no cabe en 16 GB y recomienda IQ4_XS en su lugar.
- Opciones de despliegue: llama.cpp (nightly b12374 o superior) con `llama-server -m rewrite3-27b-IQ3_XS.gguf -c 16384 --n-gpu-layers 99 --spec-type draft-mtp --spec-draft-n-max 3`; para vLLM hay que usar los repositorios BF16, FP8 o NVFP4; NVFP4 requiere GPU Blackwell.
- Latencia y throughput: no hay cifras publicadas para IQ3_XS. Como referencia, en la comparativa del autor IQ4_XS tardo 41 s de media por muestra frente a 71 s de FP8, con el razonamiento y el texto incluidos; la cabeza MTP esta pensada para mejorar el throughput (TPS).

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento con alternativas. La comparacion posible es dentro de la propia familia de cuantizaciones del modelo:

| Variante | Peso | Formato | Uso previsto |
|---|---|---|---|
| rewrite3-27b-bf16 | 54,7 GB | safetensors BF16 | Referencia de calidad; requiere multiples GPU o GPU de 80 GB |
| rewrite3-27b-fp8 | 35,9 GB | FP8 W8A8 | Despliegue principal en produccion; mejor JEV de la comparativa |
| rewrite3-27b-nvfp4 | 19,7 GB | NVFP4 W4A4 | vLLM en Blackwell; menor huella de VRAM |
| rewrite3-27b-iq4xs | 14,4 GB | GGUF IQ4_XS | Prioridad local; 8k de contexto en 16 GB |
| rewrite3-27b-iq3xs (este) | 12,2 GB | GGUF IQ3_XS | VRAM muy limitada; sin datos de calidad publicados |
| rewrite3-27b-q3km | 13,7 GB | GGUF Q3_K_M | Margen en tarjeta de 16 GB; sin datos de calidad publicados |

Frente a modelos de proposito general del mismo tamano (por ejemplo, el propio Qwen3.8-27B sin afinar), rewrite3 esta especializado en reescritura de ficcion china y no esta pensado como sustituto generalista; no hay datos publicados que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Idioma: solo declara chino (zh); no hay evidencia de calidad en castellano ni en otras lenguas.
- Dominio muy estrecho: esta afinado para reescritura de novela web china; fuera de ese caso de uso su comportamiento no esta evaluado.
- Sin benchmarks academicos: no hay MMLU, HumanEval ni similares, y la evaluacion disponible procede del propio autor con su propio clasificador, lo que introduce sesgo de autoevaluacion.
- IQ3_XS sin datos de calidad: el autor no ha medido JEV para las variantes de 3 y 4 bits; se desconoce cuanto degrada esta cuantizacion respecto a FP8, y una cuantizacion de 3 bits en un modelo de 27B puede afectar de forma apreciable a la fidelidad estilistica.
- Riesgo de alucinacion y de "inflado": la receta de datos incluye expansion de contenido; el autor reconoce que el modelo a veces "anade material para ganar longitud" y recomienda fijar la longitud en el prompt.
- Riesgo de copia literal: aunque la restriccion de 15 caracteres consecutivos es un objetivo de entrenamiento, en la comparativa FP8 registro una copia maxima de 31,2 caracteres, por encima de esa restriccion.
- Dependencia de versiones concretas: la decodificacion MTP requiere llama.cpp nightly b12374 o superior; NVFP4 requiere GPU Blackwell.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.8-27B y las condiciones de los datos sinteticos generados con modelos de terceros (Claude, Gemini, Kimi, Spark) no se detallan en la informacion disponible; conviene revisar las condiciones del modelo base antes de un despliegue comercial.
- Contenido: al operar sobre ficcion puede reproducir sesgos presentes en el corpus de novelas web chinas; no se documentan evaluaciones de sesgo ni de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aikexue170/rewrite3-27b-iq3xs
- Variante BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Variante Q8_0: https://huggingface.co/aikexue170/rewrite3-27b-q8_0
- Variante FP8: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Variante NVFP4: https://huggingface.co/aikexue170/rewrite3-27b-nvfp4
- Variante IQ4_XS: https://huggingface.co/aikexue170/rewrite3-27b-iq4xs
- Variante Q4_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q4km
- Variante Q3_K_M: https://huggingface.co/aikexue170/rewrite3-27b-q3km
- ModelScope (espejo de las variantes): https://modelscope.cn/models/alkaid55555/rewrite3-27b-iq3xs
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
