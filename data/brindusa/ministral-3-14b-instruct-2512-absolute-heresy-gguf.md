# brindusa/Ministral-3-14B-Instruct-2512-absolute-heresy-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF del modelo `MuXodious/Ministral-3-14B-Instruct-2512-absolute-heresy`, una versión "abliterada" (sin censura) del modelo oficial `mistralai/Ministral-3-14B-Instruct-2512` de Mistral AI. La cuantización ha sido realizada por el usuario `brindusa` sobre el trabajo previo de `mradermacher`, que ya había publicado cuantizaciones estáticas. El modelo resultante es un LLM multimodal de 13.506 millones de parámetros (13,5B) con un encoder de visión adicional de 0,4B, lo que le permite procesar tanto texto como imágenes.

La relevancia de este modelo radica en que combina la arquitectura de última generación de Mistral (familia Ministral 3) con una licencia Apache 2.0, lo que permite uso comercial sin restricciones, y además ha sido modificado para eliminar los mecanismos de rechazo de contenido, ofreciendo respuestas sin filtros. Está disponible en múltiples cuantizaciones GGUF, desde Q2_K hasta Q8_0, lo que facilita su ejecución en hardware de consumo. El modelo soporta 11 idiomas y está pensado para tareas de chat e instrucción, con capacidad multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision) |
| Parametros totales | 13.506.073.600 (13,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | es, en, fr, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion estatica) |

## Arquitectura y entrenamiento

El modelo base `MuXodious/Ministral-3-14B-Instruct-2512-absolute-heresy` es una modificacion del modelo oficial `mistralai/Ministral-3-14B-Instruct-2512` de Mistral AI. Segun la informacion publica de Mistral, este modelo combina un LLM de 13,5B parametros con un encoder de vision de 0,4B, dando un total de 13,9B parametros. La arquitectura es un transformer clasico con atencion por ventanas deslizantes (sliding window attention), tipica de la familia Ministral. La version original fue entrenada con instrucciones (instruct-tuning) y posteriormente el autor de la version "absolute-heresy" aplico tecnicas de abliteration para eliminar las capas de rechazo de contenido, resultando en un modelo sin censura.

La cuantizacion GGUF de este repositorio es una conversion estatica (no utiliza imatrix) realizada por `brindusa` a partir de los pesos en safetensors del modelo base. Se incluyen tambien los proyectores multimodales (mmproj) en Q8_0 y f16 para habilitar la entrada de imagenes. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens visto durante el entrenamiento ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto e instrucciones en 11 idiomas (español, ingles, frances, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe).
- Comprension multimodal: puede procesar imagenes junto con texto gracias al encoder de vision de 0,4B y los proyectores multimodales incluidos.
- Respuestas sin censura: al ser una version abliterada, no rechaza peticiones sobre temas sensibles, violencia, contenido adulto o similares.
- Chat conversacional multi-turno, optimizado para tareas de instruccion.
- Capacidad de razonamiento y generacion de codigo, heredada del modelo base de Mistral.
- No se ha confirmado soporte para tool calling, function calling ni agentes en la informacion disponible.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede redactar ficcion, poesia, guiones o dialogos con tematicas adultas o controvertidas sin autocensura, algo util para escritores y creadores que necesitan explorar limites narrativos.
- Roleplay y personajes conversacionales: su falta de filtros permite crear asistentes virtuales o personajes de RPG con personalidades complejas y respuestas naturales en cualquier idioma soportado.
- Analisis de imagenes en entornos tecnicos: gracias al encoder de vision, puede describir diagramas, capturas de pantalla o fotografias y extraer informacion relevante para documentacion o soporte.
- Asistencia en investigacion academica: puede resumir articulos, generar hipotesis o redactar borradores sin las limitaciones de contenido que imponen otros modelos, aunque se debe verificar la exactitud.
- Desarrollo de aplicaciones de chat locales: al estar en formato GGUF, se puede integrar en aplicaciones de escritorio o moviles mediante llama.cpp, Ollama o LM Studio, ofreciendo respuestas sin censura en entornos offline.
- Traduccion y localizacion: con soporte para 11 idiomas, puede traducir textos largos manteniendo el contexto, aunque la calidad puede variar entre pares de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base de Mistral (Ministral 3 14B Instruct) ha sido evaluado por Mistral AI, pero los datos concretos no se incluyen en este repositorio ni en los resultados de busqueda obtenidos.

## Requisitos de hardware

- Para la cuantizacion Q4_K_M (8,3 GB) se recomienda una GPU con al menos 10 GB de VRAM, como una RTX 3080, RTX 4070 o superior. Con Q5_K_M (9,7 GB) se necesitan 12 GB o mas.
- Las cuantizaciones Q6_K (11,2 GB) y Q8_0 (14,5 GB) requieren GPUs de 16 GB o mas, como RTX 4080, RTX 4090, A100 o H100.
- Las cuantizaciones mas pequeñas (Q2_K, Q3_K) caben en GPUs de 6-8 GB, como RTX 3060 o RTX 4060, aunque con perdida de calidad.
- Para uso exclusivo en CPU, se puede ejecutar con llama.cpp u Ollama, pero la velocidad sera baja para contextos largos.
- El modelo es compatible con vLLM, llama.cpp, Ollama, LM Studio y cualquier runtime que soporte GGUF.
- La latencia estimada en una GPU moderna (RTX 4090) con Q4_K_M seria de 20-40 tokens por segundo, y el throughput en vLLM con batch puede alcanzar varios cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Sin censura |
|---|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512 (oficial) | 13,5B + vision 0,4B | no disponible | Apache 2.0 | FP8, safetensors | No |
| Ministral-3-14B-Instruct-2512-absolute-heresy (base) | 13,5B + vision 0,4B | no disponible | Apache 2.0 | safetensors | Si |
| Este repositorio (GGUF) | 13,5B + vision 0,4B | no disponible | Apache 2.0 | GGUF | Si |

La diferencia principal con el modelo oficial es la eliminacion de los mecanismos de rechazo de contenido. Frente a otros modelos de tamano similar como Llama 3.1 8B o Qwen 2.5 14B, este modelo ofrece capacidades multimodales y una licencia permisiva, aunque carece de datos de benchmarks publicos para comparar rendimiento.

## Limitaciones y advertencias

- Al ser una version sin censura, puede generar contenido ofensivo, ilegal o danino si se le solicita. El usuario es responsable del uso.
- La cuantizacion estatica (no imatrix) puede degradar ligeramente la calidad en comparacion con las versiones imatrix del mismo modelo publicadas por mradermacher.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que puede provocar errores si se excede la ventana de atencion.
- El modelo puede alucinar datos, especialmente en tareas de razonamiento complejo o con imagenes ambiguas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base modificado puede no estar respaldado por Mistral AI y podria tener problemas legales por la eliminacion de salvaguardas.
- No se han publicado benchmarks independientes, por lo que el rendimiento real en tareas especificas es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/brindusa/Ministral-3-14B-Instruct-2512-absolute-heresy-GGUF
- Modelo base (original): https://huggingface.co/MuXodious/Ministral-3-14B-Instruct-2512-absolute-heresy
- Modelo oficial de Mistral: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Cuantizaciones imatrix de mradermacher: https://huggingface.co/mradermacher/Ministral-3-14B-Instruct-2512-absolute-heresy-i1-GGUF
- Pagina de NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/mistralai/containers/ministral-3-14b-instruct-2512?version=1
- Referencia de API de NVIDIA: https://docs.api.nvidia.com/nim/reference/mistralai-ministral-14b-instruct-2512
