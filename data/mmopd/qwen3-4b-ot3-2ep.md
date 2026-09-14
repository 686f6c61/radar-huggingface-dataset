# MMOPD/Qwen3-4B-OT3-2ep

## Resumen

Qwen3-4B-OT3-2ep es un ajuste fino supervisado (SFT) del modelo base Qwen3-4B-Base sobre el conjunto completo OpenThoughts3-1.2M, un dataset de 1,2 millones de ejemplos de cadenas de pensamiento largas centrado en matematicas, codigo y ciencia. Lo publica el proyecto MMOPD como parte de su familia de modelos para destilacion on-policy multi-profesor, y su funcion principal es actuar como "estudiante" generalista de razonamiento a escala 4B, punto de partida de los profesores de dominio (medicina, derecho, finanzas, instrucciones) del mismo proyecto.

El modelo tiene 4.022.468.096 parametros (aproximadamente 4,02 B) y mantiene la arquitectura transformer densa y el chat template de Qwen3, con el formato de razonamiento explicito `<think> ... </think>` antes de la respuesta final. El entrenamiento se hizo con secuencias de 16.384 tokens y empaquetado de secuencias (sin atencion cruzada entre ejemplos), con 2 epocas completas (4.390 pasos de optimizador) y una perdida final de entrenamiento de 0,868.

Su relevancia ahora es doble: por un lado, es una reproduccion abierta de la receta OpenThinker3 a escala 4B con licencia Apache-2.0, lo que permite uso comercial sin restricciones; por otro, publica resultados de evaluacion comparables entre los checkpoints de 1 y 2 epocas, mostrando ganancias consistentes en AIME24/25/26 y LiveCodeBench v6 al aumentar la computa de entrenamiento. Es un modelo puramente de razonamiento en ingles, orientado a generacion de texto con modo de pensamiento activado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), decodificador causal con atencion agrupada (GQA) heredada del modelo base |
| Parametros totales | 4.022.468.096 (aprox. 4,02 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados de Qwen3-4B-Base; el SFT uso secuencias de 16.384 tokens y la receta de despliegue recomendada por el autor usa `--max-model-len 40960` |
| Tipos de cuantizacion | No disponible (el autor no publica versiones cuantizadas; el repositorio contiene pesos en bf16) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), libreria `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B-Base: un transformer denso de tipo decoder-only con atencion causal y GQA, sin mezcla de expertos ni componentes de estado recurrente. El ajuste no modifica la topologia del modelo; unicamente adapta los pesos al formato conversacional con pensamiento explicito de Qwen3 mediante el chat template nativo y `enable_thinking=True`.

El entrenamiento se realizo sobre las 1,2 millones de filas completas de `open-thoughts/OpenThoughts3-1.2M`, con secuencias de 16.384 tokens y *sequence packing* (aplanado de ejemplos sin atencion cruzada entre ellos). Se completaron 2 epocas, equivalentes a 4.390 pasos de optimizador (2.195 por epoca), con AdamW, learning rate maximo de 8e-5, 5% de warmup, batch global de 512 secuencias empaquetadas (unos 8,1 M de tokens por paso) y precision bf16 con ZeRO-2 sobre A100-80GB (transformers 4.57, trl 0.29, DeepSpeed). La perdida final de entrenamiento fue 0,868. No se documenta ninguna fase de RLHF, DPO o RL posterior: es exclusivamente SFT. Como innovacion tecnica destacable, el checkpoint sirve de base a la receta MMOPD de destilacion on-policy multi-profesor, en la que profesores especializados por dominio se entrenan partiendo de este modelo.

## Capacidades

- Generacion de texto conversacional en ingles con formato de razonamiento explicito: toda respuesta comienza con un bloque `<think>` antes del texto final.
- Razonamiento matematico competitivo: 66,3% en AIME24, 56,3% en AIME25 y 58,3% en AIME26 (media de 8 muestras).
- Generacion de codigo evaluada con LiveCodeBench v6: 51,7%.
- Razonamiento cientifico y de dominio biomedico: PubMedQA 75,2%, MedQA 69,8%, CaseHOLD 63,2%.
- Razonamiento financiero y sobre tablas: FinQA 58,3%, TAT-QA 24,4% (exact match).
- Seguimiento de instrucciones: IFEval 51,0%, IFBench 27,7%.
- Compatibilidad con el chat template estandar de Qwen3, lo que permite integrarlo en pipelines que ya consumen modelos Qwen3 sin cambios de tokenizador.
- Compatibilidad declarada con Text Generation Inference y puntos finales tipo API (`endpoints_compatible`).
- No se documentan capacidades de vision, audio, tool calling, function calling ni uso agentico multi-paso en la informacion disponible.
- Capacidad multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Resolucion de problemas matematicos paso a paso: el modelo esta optimizado para demostraciones largas con verificacion intermedia; es adecuado en entornos educativos o de generacion de problemas resueltos donde interesa ver la cadena de razonamiento completa y no solo la respuesta.
- Generacion y revision de codigo con explicacion del razonamiento: con un 51,7% en LiveCodeBench v6, puede usarse como asistente de programacion en tareas de dificultad media, produciendo primero un bloque de pensamiento con el plan y despues la solucion.
- Base para destilacion y experimentacion academica: es el punto de partida oficial de los profesores de dominio MMOPD (`Qwen3-4B-OT3-{medical,law,finance,if}`), por lo que resulta idoneo para reproducir o extender experimentos de destilacion on-policy.
- Respuesta a preguntas biomedicas a partir de literatura: con 75,2% en PubMedQA, sirve para prototipos de resumen y QA sobre articulos cientificos, siempre con supervision humana y sin uso clinico directo.
- Analisis de documentos financieros y tablas: con 58,3% en FinQA, puede emplearse para extraer y razonar sobre cifras en informes, integrado en un pipeline que aporte el contexto recuperado.
- Evaluacion comparativa de recetas de SFT: al existir el checkpoint de 1 epoca y el de 2 epocas con la misma receta, es util como referencia controlada para medir el efecto del numero de epocas en razonamiento.
- Prototipado de asistentes conversacionales en ingles de bajo coste: con 4 B de parametros se puede desplegar en una sola GPU de consumo, lo que permite iterar sobre prompts y plantillas de razonamiento sin presupuesto de clúster.
- Filtrado y sintesis de datos de razonamiento: puede generar trazas de pensamiento para aumentar datasets de matematicas o codigo, dado su formato de salida estructurado.

## Benchmarks y rendimiento

Benchmarks generales (preset de pensamiento de Qwen3: temperatura 0,6, top-p 0,95, top-k 20; 32.768 tokens nuevos como maximo; AIME = avg@8, LiveCodeBench v6 / IFEval / IFBench = 1 muestra; porcentajes):

| Modelo | AIME24 | AIME25 | AIME26 | LiveCodeBench v6 | IFEval | IFBench |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | 66,3 | 56,3 | 58,3 | 51,7 | 51,0 | 27,7 |
| Qwen3-4B-OT3-1ep | 60,4 | 51,3 | 55,4 | 47,1 | 46,8 | 27,0 |

Benchmarks de dominio (temperatura 1,0, top-p 1,0, presupuesto de generacion largo; exactitud en porcentaje):

| Modelo | MedQA | MedXpertQA | PubMedQA | CaseHOLD | FinQA | TAT-QA (EM) |
|---|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | 69,8 | 13,7 | 75,2 | 63,2 | 58,3 | 24,4 |

No se han publicado en la informacion disponible resultados de benchmarks para el modelo base Qwen3-4B-Base ni para alternativas externas, por lo que no es posible establecer una comparacion cruzada con cifras.

## Requisitos de hardware

- VRAM estimada en bf16: alrededor de 8,1 GB solo para pesos (4,02 B x 2 bytes); con cache KV a 16.384 tokens el consumo total se situa aproximadamente entre 10 y 13 GB, y entre 13 y 17 GB si se despliega con ventanas cercanas a 32.768-40.960 tokens.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB de pesos mas cache KV. En 4 bits: aproximadamente 2,5-3 GB de pesos mas cache KV.
- GPU recomendadas para produccion: A100-80GB o H100 para lotes grandes y contexto maximo; L40S, A10G o RTX 6000 Ada para despliegues de un solo flujo con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) con contexto completo en bf16 y en RTX 3090 (24 GB); en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) es viable en bf16 solo con contexto reducido, o bien en cuantizacion de 8/4 bits. En tarjetas de 8-12 GB requiere cuantizacion agresiva (4 bits) y ventanas de contexto cortas.
- Opciones de despliegue: `transformers` con `device_map="auto"`; vLLM esta documentado explicitamente por el autor con el comando `vllm serve MMOPD/Qwen3-4B-OT3-2ep --max-model-len 40960`; Text Generation Inference es compatible segun las etiquetas del repositorio. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no publica.
- Nota sobre latencia y throughput: no disponible. La evaluacion de referencia usa un presupuesto de 32.768 tokens nuevos, lo que implica respuestas largas y coste de decodificacion elevado por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados en esta ficha | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-OT3-2ep (este) | 4,02 B | 32.768 tokens heredados (SFT a 16.384) | Apache-2.0 | AIME24 66,3; AIME25 56,3; LiveCodeBench v6 51,7; MedQA 69,8 | HuggingFace, pesos safetensors |
| Qwen3-4B-OT3-1ep | 4,02 B | identico | Apache-2.0 | AIME24 60,4; AIME25 51,3; LiveCodeBench v6 47,1 | HuggingFace (`MMOPD/Qwen3-4B-OT3-1ep`) |
| Qwen3-4B-Base (modelo base) | 4,02 B | 32.768 tokens | Apache-2.0 | no disponible | HuggingFace |
| Profesores MMOPD de dominio (medical, law, finance, if) | 4,02 B | identico | Apache-2.0 | no disponible | HuggingFace, derivados de este checkpoint |
| Alternativas externas de razonamiento a escala 4B-8B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: la model card solo declara `en`, por lo que el rendimiento en castellano no esta garantizado ni evaluado.
- Es un modelo de pensamiento: requiere muestreo (temperatura y top-p configurados) y no decodificacion voraz; con `enable_thinking=False` o presupuestos de generacion cortos su calidad puede degradarse respecto a las cifras publicadas, que usan 32.768 tokens nuevos.
- Coste de inferencia alto por consulta: el bloque `<think>` puede consumir miles de tokens antes de la respuesta final, lo que incrementa latencia y factura de computa.
- Riesgo de alucinacion no cuantificado: no se publican evaluaciones de veracidad, tasa de alucinacion ni benchmarks de seguridad.
- Sesgos no evaluados: no hay analisis de sesgo demografico, politico o cultural en la informacion disponible.
- Rendimiento muy desigual por dominio: MedXpertQA se queda en 13,7% y TAT-QA en 24,4% (EM), lo que desaconseja su uso autonomo en tareas medicas de nivel experto o de razonamiento numerico sobre tablas.
- No debe usarse como sistema clinico, legal o financiero sin supervision humana y validacion especifica: las cifras de MedQA, CaseHOLD o FinQA corresponden a benchmarks academicos, no a entornos reales.
- IFEval (51,0) e IFBench (27,7) sugieren un seguimiento de instrucciones mejorable, especialmente en formatos estrictos o restricciones verificables.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el usuario debe asumir las obligaciones de atribucion y las condiciones heredadas de Qwen3-4-Base y OpenThoughts3.
- Adopcion nula: el repositorio registra 0 descargas y 0 "me gusta", por lo que no ha pasado por validacion independiente de la comunidad; los resultados son los reportados por el propio autor.
- Fecha de creacion del repositorio posterior a la fecha de referencia habitual de evaluacion (septiembre de 2026) y ausencia de versiones cuantizadas publicadas por el autor.
- La busqueda web realizada no devolvio ningun resultado relevante: solo paginas de un medio de noticias aleman sin relacion con el modelo, por lo que no hay informacion externa de terceros que confirme o matice los datos de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MMOPD/Qwen3-4B-OT3-2ep
- Checkpoint de 1 epoca: https://huggingface.co/MMOPD/Qwen3-4B-OT3-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Perfil del autor (familia con profesores de dominio medical, law, finance, if): https://huggingface.co/MMOPD
- Papers, blogs, repositorios o demos adicionales: no disponible (la busqueda web no devolvio resultados relacionados con el modelo).
