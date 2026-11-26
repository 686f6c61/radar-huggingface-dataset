# AngelSlim/Hy4-flash-DFly2-B6

## Resumen

Hy4-flash-DFly2-B6 es un *drafter* de decodificación especulativa (speculative decoding) diseñado para acompañar al modelo objetivo tencent/Hy4-flash. No es un modelo de lenguaje autónomo: es un módulo auxiliar de 3.119.838.752 parámetros (~3,12 B) que propone bloques de tokens candidatos para que el modelo objetivo los verifique en paralelo, acelerando así la generación sin alterar la distribución de salida. Lo desarrolla AngelSlim (equipo vinculado a Tencent) dentro del marco de entrenamiento AngelSpec, y se publica bajo licencia Apache 2.0.

La innovación clave es la arquitectura DFly2, un drafter *block-parallel* pensado para objetivos con atención dispersa nativa (DeepSeek Sparse Attention, DSA). En lugar de mantener su propia caché KV, cada una de sus tres capas MoE se empareja con una capa DSA del objetivo (33, 37 y 41) y reutiliza tanto la KV ya cacheada (*KV sharing*) como las posiciones ya seleccionadas por el indexer de esa capa (*index sharing*). El resultado es un drafter sin caché propia y con lecturas de tamaño fijo, lo que reduce el coste de memoria por token y permite sostener más peticiones concurrentes.

Su relevancia es práctica: la decodificación especulativa es hoy el mecanismo estándar para reducir la latencia de inferencia en producción, y DFly2 ataca el principal cuello de botella de los drafters convencionales (su propia caché KV y su degradación con contextos largos). El bloque es de tamaño 6 (un token ancla más 5 tokens borrador), con precisión BF16 y un corpus de entrenamiento de 7,42 B de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (3 capas MoE, 128 expertos enrutados por capa) con KV sharing e index sharing sobre capas DSA del objetivo; drafter de decodificación especulativa DFly2 |
| Parametros totales | 3.119.838.752 (~3,12 B) |
| Parametros activos | no disponible |
| Longitud de contexto | entrenado con muestras de hasta 32.768 tokens; lee la selección top-2048 del objetivo en cada paso de borrador |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFly2 es un drafter de tres capas MoE (128 expertos enrutados cada una) acoplado a tres capas del objetivo con atención dispersa: las capas 33, 37 y 41 de Hy4-flash. Cada capa borrador lee la KV que su capa DSA pareja ya tiene cacheada y opera sobre las posiciones que el indexer de esa capa ya ha seleccionado (top-2048 en la fila anterior al ancla), de modo que el drafter no ejecuta indexer propio ni mantiene caché KV. La atención se inicializa copiándola de la capa objetivo pareja. Además, el estado oculto de la última capa del objetivo se inyecta y se fusiona con el embedding del ancla mediante una compuerta en la ranura del ancla, y dentro del bloque se aplica una corrección oculta capa a capa junto con una atención de contexto y una atención de prefijo con compuerta. El embedding y la LM head se comparten con el objetivo y no se almacenan en este repositorio.

El entrenamiento usa DFly-SFT, un corpus de instrucciones de propósito general con 989.861 conversaciones y 7,42 B de tokens, todo procedente de datasets públicos. La mezcla está sesgada hacia formato largo y razonamiento: el 61,6 % de las muestras incluye traza de razonamiento explícita y el 34,9 % supera los 8K tokens. Los dominios principales son matemáticas avanzadas (19,2 % de muestras, 2,90 B tokens), código competitivo (11,1 %, 1,96 B tokens), código de ingeniería (9,6 %, 0,56 B tokens), conocimiento y STEM (15,2 %, 0,48 B tokens) e instrucciones (7,1 %, 0,47 B tokens), entre otros. El corpus está deduplicado globalmente y descontaminado frente a doce conjuntos de evaluación DeepSpec mediante una prueba de solapamiento de n-gramas. El tokenizador de referencia para los recuentos es GLM-5.3-Flash.

## Capacidades

- Propuesta de tokens especulativos en bloques de 6 (1 ancla + 5 borradores) para verificación paralela por parte de Hy4-flash.
- Reutilización de la caché KV del objetivo: no añade memoria KV propia (frente a los 3,4 KiB por token que añadiría un drafter de tres capas con caché completa, sobre los 17,2 KiB del objetivo).
- Reutilización del indexer del objetivo: lecturas de tamaño fijo (top-2048) que no crecen con la longitud del contexto y pueden recaer en cualquier posición de la ventana.
- Generalización más allá de la longitud de entrenamiento (32K): en conjuntos agénticos con prompts largos mantiene una longitud aceptada media de 4,11 / 3,88 (T = 0 / 0,9) frente a 3,96 / 3,95 en propósito general.
- Mayor aceptación que DFlash y DSpark (entrenados con la misma receta y datos) en todos los benchmarks reportados, a ambas temperaturas.
- Compatibilidad con disaggregación prefill-decode: no ocupa plaza en las instancias de prefill y cualquier acierto de prefix caching del objetivo lo es también del drafter.
- No soporta de forma autónoma generación de texto, razonamiento, código, visión, tool calling ni agentes: hereda las capacidades del modelo objetivo al que acompaña.
- Multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de Hy4-flash con baja latencia: el drafter propone bloques de 5 tokens que el objetivo verifica en paralelo, reduciendo el número de pasos de decodificación secuencial en servicios de chat o generación interactiva.
- Servicio de alta concurrencia a 32K tokens: al no añadir caché KV propia, el mismo pool de KV del objetivo aloja 1,19× más peticiones, lo que se traduce directamente en mayor capacidad por GPU en cargas con contextos largos.
- Disaggregación prefill-decode: al no necesitar plaza en las instancias de prefill, se puede desplegar únicamente junto a los nodos de decode, simplificando la topología y el reparto de recursos.
- Reutilización de prefix caching: en escenarios con prefijos repetidos (system prompts largos, plantillas de agente, RAG con cabeceras comunes), cada acierto de caché del objetivo es también un acierto del drafter, lo que maximiza la aceleración efectiva.
- Cargas agénticas con prompts largos: su aceptación se mantiene cerca de la media de propósito general cuando los prompts superan los 32K tokens, a diferencia de DSpark (que cae de 3,81 / 3,73 a 3,16 / 2,95) y de DFlash (hasta 1,08 tokens por paso más allá de 32K).
- Investigación en decodificación especulativa: sirve como referencia reproducible de DFly2 con receta, datos y pesos publicados, útil para comparar estrategias de KV sharing e index sharing frente a drafters con caché completa.
- Evaluación de pipelines de serving: integrable en el backend de decodificación especulativa de vLLM (soporte en curso) para medir el impacto de la aceleración en latencia y throughput sobre una carga real.

## Benchmarks y rendimiento

La información disponible no incluye una tabla de resultados numéricos por benchmark (MMLU, HumanEval, GSM8K u otros). Los únicos datos de rendimiento reportados son longitudes medias aceptadas por paso:

| Metrica | DFly2 (T=0 / T=0,9) | DSpark (T=0 / T=0,9) | DFlash (T=0 / T=0,9) |
|---|---|---|---|
| Longitud aceptada media, proposito general | 3,96 / 3,95 | 3,81 / 3,73 | no disponible |
| Longitud aceptada media, conjuntos agenticos (prompts largos) | 4,11 / 3,88 | 3,16 / 2,95 | hasta 1,08 tokens por paso con prompts > 32K |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Los pesos en BF16 suman aproximadamente 6,2 GB (tamaño del repositorio); a ello hay que añadir los pesos del modelo objetivo Hy4-flash, que no se incluyen en este repositorio.
- Cuantización: no se documentan formatos GGUF, AWQ, GPTQ ni similares para este drafter; los pesos publicados son BF16.
- GPU recomendadas: no disponible. Al acompañar a un objetivo de mayor tamaño, el requisito real vendrá determinado por Hy4-flash; el drafter añade ~6,2 GB de pesos en BF16.
- GPU de consumo: no disponible. El drafter por sí solo cabría en GPUs de consumo con suficiente VRAM para 6,2 GB en BF16, pero el despliegue conjunto con el objetivo condiciona el requisito total.
- Opciones de despliegue: backend de decodificación especulativa de vLLM (soporte en curso según la model card). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas. El beneficio declarado es de memoria (1,19× más peticiones en el mismo pool KV a 32K tokens) y de aceptación por paso, no de latencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceptacion media (general / agentico) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-flash-DFly2-B6 | Drafter DFly2, bloque 6, sin cache KV propia | ~3,12 B | entrenado a 32K; lecturas top-2048 fijas | 3,96 / 3,95 · 4,11 / 3,88 | Apache 2.0 | Hugging Face (AngelSlim) |
| DFlash (misma receta y datos) | Drafter con cache KV completa | no disponible | no disponible | no disponible / no disponible; cae a 1,08 tokens por paso con prompts > 32K | no disponible | no disponible |
| DSpark (misma receta y datos) | Drafter | no disponible | no disponible | 3,81 / 3,73 · 3,16 / 2,95 | no disponible | no disponible |
| Hy4-flash (objetivo) | Modelo de lenguaje con atencion dispersa (DSA) | no disponible | no disponible | n/a (es el objetivo) | no disponible | Hugging Face (tencent) |

## Limitaciones y advertencias

- No es un modelo autónomo: no genera texto por sí mismo ni debe desplegarse sin Hy4-flash; su única función es proponer tokens que el objetivo verifica.
- El soporte en vLLM está marcado como "en curso" en la model card, por lo que la integración en producción puede requerir trabajo adicional o versiones específicas del backend.
- No se almacenan embedding ni LM head en el repositorio: se comparten con el objetivo, de modo que una carga incompleta o desalineada con Hy4-flash impedirá el uso.
- Los pesos están en BF16 y no se documentan cuantizaciones; no hay datos sobre comportamiento en precisión reducida.
- Idiomas soportados no disponibles: cualquier limitación lingüística vendrá heredada del objetivo y de la mezcla DFly-SFT, mayoritariamente técnica (matemáticas, código, STEM).
- Sesgos conocidos: no documentados. Al entrenarse sobre datasets públicos de instrucciones, es esperable que reproduzca sesgos presentes en ellos, aunque el drafter no genera contenido final por sí mismo.
- Riesgo de alucinación: no aplica de forma directa al drafter, ya que la verificación la realiza el objetivo; el riesgo residual es el del modelo Hy4-flash.
- La ventaja de aceptación está medida frente a DFlash y DSpark con la misma receta y datos; no hay comparación con otros drafters de terceros.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar por separado la licencia del modelo objetivo tencent/Hy4-flash, no disponible en la información proporcionada.
- La generalización más allá de 32K se reporta de forma agregada (longitud aceptada media); no se detallan curvas por longitud ni comportamiento en contextos muy superiores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AngelSlim/Hy4-flash-DFly2-B6
- Modelo objetivo Hy4-flash: https://huggingface.co/tencent/Hy4-flash
- Colección AngelSpec en Hugging Face: https://huggingface.co/collections/AngelSlim/angelspec
- Repositorio GitHub de AngelSpec: https://github.com/Tencent/AngelSpec
- Documentación de AngelSpec: https://angelspec.readthedocs.io
- Informe técnico (arXiv:2607.25852): https://arxiv.org/abs/2607.25852
- Artículo de DFly2 (arXiv:2611.34776): https://arxiv.org/abs/2611.34776
