# AngelSlim/GLM-5.3-Flash-DFly2-B6

## Resumen

GLM-5.3-Flash-DFly2-B6 es un *drafter* de decodificación especulativa (modelo borrador) diseñado para acelerar la inferencia del modelo objetivo zai-org/GLM-5.3-Flash. Lo publica el usuario AngelSlim dentro del ecosistema AngelSpec de Tencent, un marco de entrenamiento unificado para predicción multi-token (MTP) y decodificación especulativa de bloques paralelos. No es un modelo de lenguaje autónomo: debe desplegarse siempre junto al modelo objetivo y no genera respuestas por sí mismo.

La innovación principal es la arquitectura DFly2, pensada para objetivos con atención dispersa nativa. Cada una de sus tres capas de borrador se empareja con una capa de DeepSeek Sparse Attention (DSA) del modelo objetivo y reutiliza la KV ya cacheada por esa capa (KV sharing) en las posiciones que su indexador ya ha seleccionado (index sharing). El resultado es un borrador que no mantiene caché KV propia ni ejecuta indexador, con lecturas de tamaño fijo (top-2048) independientes de la longitud del contexto.

El modelo tiene 10.339.281.506 parámetros en BF16 (20,7 GB de repositorio), usa bloques de tamaño 6 (un token ancla más 5 tokens borrador) y se distribuye con licencia Apache 2.0. Es relevante ahora porque ataca el cuello de botella de memoria del *speculative decoding* en objetivos MoE con atención dispersa: según la model card, permite alojar 1,19 veces más peticiones a 32K tokens en la misma reserva de KV del objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFly2: 3 capas MoE de borrador (128 expertos enrutados cada una) con KV sharing e index sharing sobre capas DSA del objetivo |
| Parametros totales | 10.339.281.506 |
| Parametros activos | no disponible (no se especifica el número de expertos activos por token) |
| Longitud de contexto | entrenado con muestras de hasta 32.768 tokens; generaliza más allá de esa longitud de entrenamiento |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El objetivo GLM-5.3-Flash intercala 11 capas DSA con 34 capas de atención lineal. DFly2 se empareja con tres de esas capas DSA (las 35, 39 y 43). Cada paso de borrador lee la selección top-2048 que el indexador disperso del objetivo hizo para el token anterior al bloque, sobre grupos de posiciones adyacentes; ese conjunto puede estar en cualquier punto del contexto y su cardinalidad no crece con la longitud. La inicialización copia la atención de la capa objetivo emparejada y toma al azar 128 de sus expertos enrutados, con sus filas de router y sesgos. Además, el estado oculto de la última capa del objetivo se fusiona con el embedding del ancla y se inyecta con compuerta en la ranura del ancla; el bloque incorpora corrección oculta intrabloque, atención de contexto y atención de prefijo con compuerta, ranura a ranura. El embedding y la LM head se comparten con el objetivo y no se almacenan en este repositorio.

El entrenamiento usa DFly-SFT, un corpus de instrucciones de propósito general con 989.861 conversaciones y 7.42B tokens, todo de conjuntos públicos. La mezcla está sesgada hacia formato largo y razonamiento: matemáticas avanzadas (19,2% de muestras, 2,90B tokens, 98,6% con traza de razonamiento), código competitivo (11,1%, 1,96B tokens), código de ingeniería (9,6%), conocimiento y STEM (15,2%), seguimiento de instrucciones (7,1%), código a nivel de función (11,1%), escritura (10,1%), transformación de texto (6,1%), razonamiento lógico (2,5%) y problemas matemáticos de enunciado (8,1%). El 61,6% de las muestras incluye traza de razonamiento explícita y el 34,9% supera los 8K tokens. El corpus está deduplicado globalmente y descontaminado frente a los doce conjuntos de evaluación de DeepSpec mediante una prueba de solapamiento de n-gramas.

## Capacidades

- Decodificación especulativa de bloques paralelos: propone hasta 5 tokens borrador por paso sobre un token ancla, que el modelo objetivo verifica.
- Reutilización de la caché KV del objetivo: no mantiene caché propia, de modo que cualquier acierto de *prefix caching* del objetivo lo es también del borrador.
- Lecturas conscientes de la consulta y de tamaño fijo: cada paso lee el top-2048 seleccionado por el indexador del objetivo, sin ejecutar indexador propio.
- Mayor aceptación que DFlash y DSpark en todos los benchmarks reportados, a temperaturas 0 y 1.
- Generalización más allá de los 32K tokens de entrenamiento: en conjuntos agénticos mantiene una longitud aceptada media de 4,03 / 3,68 frente a 3,96 / 3,69 en uso general (T = 0 / 1).
- Integración prevista con decodificación especulativa de vLLM (soporte en curso según la model card).
- No soporta de forma autónoma generación de texto, tool calling, agentes, visión ni audio: esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción de GLM-5.3-Flash: el borrador propone bloques de 6 tokens que el objetivo verifica en paralelo, reduciendo el número de pasos de decodificación en despliegues con vLLM.
- Servicio de chat multi-turno con contexto largo: al no añadir caché KV propia, la misma reserva de memoria del objetivo aloja 1,19 veces más peticiones a 32K tokens, lo que abarata el coste por sesión concurrente.
- Despliegues con separación prefill/decode: el borrador no necesita ocupar instancias de prefill y cada acierto de prefix cache del objetivo se reutiliza directamente.
- Razonamiento y matemáticas en producción: la mezcla de entrenamiento (98,6% de trazas en matemáticas avanzadas) busca maximizar la aceptación en cargas con cadenas de razonamiento largas, donde el borrador generaliza mejor que alternativas como DSpark.
- Generación de código asistida: el 31,8% de las muestras de entrenamiento son de código (competitivo, ingeniería y nivel de función), orientado a pipelines de autocompletado y revisión donde la latencia de decodificación es crítica.
- Car gas de trabajo agénticas con prompts largos: la model card reporta que la longitud aceptada media se mantiene cerca de la de uso general en conjuntos agénticos, lo que lo hace adecuado para agentes con contexto extenso.
- Evaluación e investigación en decodificación especulativa: sirve como referencia reproducible del método DFly2 con el marco AngelSpec y los papers asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas internas de aceptación (longitud aceptada media de 4,03 / 3,68 en conjuntos agénticos frente a 3,96 / 3,69 en uso general, a T = 0 / 1) y la comparación cualitativa de que DFly2 acepta más tokens por paso que DFlash y DSpark en todos los benchmarks, sin cifras por conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 20,7 GB; se suma la memoria del modelo objetivo GLM-5.3-Flash y su caché KV (11,7 KiB por token según la model card).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño de pesos, el borrador en BF16 requiere GPUs de centro de datos con al menos 24-40 GB libres solo para él, además del objetivo.
- Cabe en GPU de consumo: no disponible; con cuantización a 8 bits o 4 bits podría reducirse a unos 10 GB o 5 GB, pero no se han publicado pesos cuantizados.
- Opciones de despliegue: decodificación especulativa de vLLM (soporte en curso); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible; la model card solo indica la ganancia de capacidad de 1,19 veces más peticiones a 32K tokens en la misma reserva de KV.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Aceptacion media (T=0 / T=1) | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-Flash-DFly2-B6 | Borrador DFly2, bloque 6 | 10,34B | entrenado a 32K, generaliza más | 3,96 / 3,69 (general); 4,03 / 3,68 (agéntico) | Apache 2.0 |
| DFlash (misma receta y datos) | Borrador alternativo | no disponible | no disponible | inferior a DFly2 en todos los benchmarks (sin cifras) | no disponible |
| DSpark (misma receta y datos) | Borrador alternativo | no disponible | no disponible | 3,68 / 3,35 (general); 3,10 / 2,99 (agéntico) | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona acoplado a zai-org/GLM-5.3-Flash y no puede responder peticiones por sí mismo.
- El soporte en vLLM está en curso según la model card; la integración en producción puede requerir parches o versiones específicas.
- La ventana de entrenamiento es de 32.768 tokens; el comportamiento más allá de esa longitud depende de la generalización del index sharing y no está cuantificado con benchmarks públicos.
- No se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) ni datos de sesgo o alucinación del sistema completo.
- No se especifican idiomas soportados; la cobertura multilingüe depende del modelo objetivo y del corpus DFly-SFT.
- El repositorio no incluye embedding ni LM head (se comparten con el objetivo), por lo que no puede cargarse de forma aislada.
- La licencia Apache 2.0 del borrador no exime de verificar la licencia y condiciones del modelo objetivo GLM-5.3-Flash para uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: es una publicación reciente y poco validada por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AngelSlim/GLM-5.3-Flash-DFly2-B6
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Informe técnico AngelSpec: https://arxiv.org/abs/2607.25852
- Paper de DFly2: https://arxiv.org/abs/2611.34776
- Documentación: https://angelspec.readthedocs.io
- Repositorio GitHub: https://github.com/Tencent/AngelSpec
- Colección en Hugging Face: https://huggingface.co/collections/AngelSlim/angelspec
