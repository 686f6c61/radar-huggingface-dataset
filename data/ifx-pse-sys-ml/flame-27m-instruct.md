# ifx-pse-sys-ml/flame-27m-instruct

## Resumen

flame-27m-instruct es un modelo de lenguaje decoder-only de 27,1 millones de parametros, ajustado para seguir instrucciones en ingles. Lo desarrolla el usuario ifx-pse-sys-ml y deriva de flame-27m-base, un modelo base preentrenado sobre una mezcla de FineWeb-Edu-dedup, Cosmopedia-v2, ClimbMix y FineMath. Sobre esa base se aplico un ajuste supervisado (SFT) durante 5 epocas con una mezcla de conversaciones de aproximadamente 1,18 millones de ejemplos, usando pesos EMA.

Su relevancia es doble. Por un lado, ocupa un nicho extremo de eficiencia: con 27,1M de parametros es unas 5 veces mas pequeno que SmolLM-135M-Instruct, lo que lo situa en el rango de modelos que caben holgadamente en cualquier GPU de consumo, en CPU e incluso en dispositivos embebidos. Por otro, la model card es inusualmente honesta respecto al alcance real del modelo: en pruebas de conocimiento academico esta cerca del azar (media de 34,0 % frente a 38,7 % de SmolLM-135M-Instruct) y el propio autor indica que IFEval es aproximadamente 0.

Arquitectonicamente es un transformer estilo Llama con 8 capas, hidden size de 512, 8 cabezas de atencion y 2 cabezas KV (GQA), dimension intermedia de 1280, RoPE con theta de 1e6, contexto de 2048 tokens y vocabulario BPE ingles de 12000 entradas. Se distribuye bajo licencia Apache 2.0 en safetensors, e incluye tambien un checkpoint PyTorch crudo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama, con GQA y RoPE (theta = 1e6); 8 capas, hidden 512, 8 cabezas de atencion / 2 cabezas KV, intermedio 1280 |
| Parametros totales | 27.125.248 (27,1M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors y un checkpoint PyTorch crudo `pytorch_model.pth`; no se incluyen pesos GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y `pytorch_model.pth` (PyTorch crudo) |
| Vocabulario | 12000 tokens (BPE ingles) |
| Libreria | transformers (requiere `trust_remote_code=True`, codigo personalizado "nexus") |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion / ultima actualizacion | 2026-09-09 / 2026-09-11 |
| Descargas / likes | 145 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de tipo Llama, deliberadamente minimalista: 8 capas, dimension de modelo 512, FFN con dimension intermedia 1280 (ratio 2,5), 8 cabezas de consulta y 2 cabezas de clave/valor, es decir, atencion con consultas agrupadas (GQA) con un ratio de 4:1. El embedding posicional es RoPE con theta de 1e6, un valor alto que en modelos mayores suele asociarse a mejor extrapolacion de longitud, aunque aqui el contexto declarado es de 2048 tokens. El vocabulario es un BPE ingles de 12000 entradas, muy compacto, lo que reduce el tamano del embedding (12000 x 512) y del head de salida.

El entrenamiento se desarrollo en dos fases. La base (flame-27m-base, publicado por separado) se preentreno con FineWeb-Edu-dedup, Cosmopedia-v2, ClimbMix y FineMath, un conjunto orientado a contenido educativo y matematicas. Sobre esa base se aplico SFT durante 5 epocas con pesos EMA, sobre una mezcla de aproximadamente 1,18 millones de conversaciones: SmolTalk, Tulu-3-Persona-IF, No-Robots y WildChat (solo ingles, filtrado para excluir contenido toxico). El autor indica que esta mezcla mas rica mejora la perdida en tokens de asistente en validacion (de 1,34 a 1,23 respecto a un SFT solo con SmolTalk) y la adherencia al formato, a costa de un ligero descenso en las pruebas de conocimiento.

Dos detalles tecnicos destacables: el decoder acepta `inputs_embeds` ademas de `input_ids` (exactamente uno de los dos), lo que permite empalmar tokens visuales mediante un proyector y usar el modelo como backbone de texto de un VLM pequeno; y el codigo de modelado es personalizado (etiqueta "custom_code"), por lo que requiere `trust_remote_code=True` en transformers. El autor menciona que fue entrenado con la base de codigo Nexus.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat (`apply_chat_template`) y formato de respuesta de asistente.
- Seguimiento de instrucciones simples: respuestas de formato correcto ante peticiones directas y de una sola restriccion.
- Generacion de texto libre condicionada por prompt, con decodificacion por muestreo (temperatura, top-p) o greedy.
- Uso como backbone de texto en un modelo vision-lenguaje: al aceptar `inputs_embeds`, se pueden inyectar embeddings visuales desde un proyector externo.
- Uso como banco de pruebas de pipelines de SFT, tokenizacion, plantillas de chat y evaluacion con lm-evaluation-harness.
- Capacidades multilingues: no disponibles; el modelo es solo ingles.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Modo agente o razonamiento multi-paso: no disponible (el propio autor senala que no satisface prompts de multiples restricciones, con IFEval aproximadamente 0).
- Modo "thinking", vision nativa o audio: no disponibles.

## Casos de uso

- Prototipado rapido de pipelines de chat: permite validar plantillas de conversacion, formateo de mensajes y decodificacion con un modelo de 27M que se carga en segundos y ocupa decenas de MB, antes de escalar a un modelo mayor con la misma interfaz de transformers.
- Pruebas de integracion y CI en proyectos de IA: dado su tamano, se puede ejecutar en el runner de integracion continua para verificar que el codigo de inferencia, el tokenizador y el formateo de prompts funcionan, sin necesidad de GPU ni de descargar pesos de varios GB.
- Backbone de texto para un VLM experimental: el soporte de `inputs_embeds` permite conectar un proyector visual y entrenar un modelo vision-lenguaje minimo en una sola GPU de consumo, usando flame-27m-instruct como torre de texto.
- Educacion y divulgacion sobre transformers: su arquitectura (8 capas, hidden 512, GQA 8/2, RoPE) es lo bastante pequena para inspeccionar pesos, activaciones y curvas de atencion en un cuaderno interactivo o incluso en CPU.
- Generacion de texto de bajo coste en el borde: al caber en menos de 60 MB en bf16, es viable en dispositivos embebidos, navegador via WebGPU/ONNX o entornos sin GPU, para tareas de autocompletado o respuestas plantilla.
- Generacion de datos sinteticos a pequena escala y filtrado de formato: util para producir borradores de respuestas cortas en ingles que luego se revisan o se usan como ejemplos negativos en un pipeline de destilacion.
- Investigacion sobre SFT y mezclas de datos: la model card documenta la comparacion entre un SFT solo con SmolTalk y la mezcla ampliada (perdida en tokens de asistente 1,34 frente a 1,23), lo que lo convierte en un caso de estudio reproducible de como la mezcla afecta al formato sin aportar conocimiento.

## Benchmarks y rendimiento

Resultados publicados por el autor, expresados en porcentaje de acierto con lm-evaluation-harness 0.4, con el mismo harness y numero de shots para todos los modelos, por lo que las columnas son comparables entre si.

| Benchmark | Azar | flame-27m-instruct | SmolLM-135M-Instruct |
|---|---|---|---|
| hellaswag | 25 | 29,2 | 41,9 |
| arc_easy | 25 | 37,3 | 43,9 |
| arc_challenge | 25 | 22,6 | 27,4 |
| piqa | 50 | 59,3 | 67,0 |
| winogrande | 50 | 51,7 | 51,3 |
| openbookqa | 25 | 27,4 | 33,6 |
| commonsense_qa | 20 | 19,7 | 20,3 |
| mmlu | 25 | 24,9 | 24,4 |
| Media | — | 34,0 | 38,7 |

El autor advierte explicitamente de que estas pruebas miden conocimiento de base, algo que el SFT no puede anadir, y que la comparacion es desfavorable por capacidad, no por datos o ajuste. No se publican resultados de IFEval mas alla de la indicacion cualitativa de que es aproximadamente 0.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 27,1M de parametros, sin incluir overhead del runtime): aproximadamente 108 MB en fp32, 54 MB en bf16/fp16, 27 MB en int8 y 14 MB en int4.
- Cache KV: 8 capas con 2 cabezas KV y dimension de cabeza 64 implican 2048 elementos por token, es decir, unos 4 KB por token en fp16 y unos 8 MB en el contexto maximo de 2048 tokens. Es despreciable frente a los pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM sirve; una RTX 4090, una RTX 3060 o una GTX 1650 son mas que suficientes. Tambien es viable en CPU (x86 o ARM) y en Apple Silicon via Metal.
- Cabe en GPU de consumo: si, con margen amplisimo, incluidas GPUs integradas y aceleradores tipo Jetson.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True`), y en principio cualquier runtime que acepte safetensors o el checkpoint PyTorch. vLLM, TGI, llama.cpp u Ollama exigirian conversion previa a sus formatos, ya que el repositorio no incluye GGUF ni plantillas de vLLM/TGI; no disponible informacion sobre compatibilidad verificada.
- Latencia y throughput: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado en la tabla de benchmarks del autor | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| flame-27m-instruct | 27,1M | 2048 | Media 34,0 | Apache 2.0 | safetensors + `pytorch_model.pth`, requiere codigo personalizado |
| SmolLM-135M-Instruct | 135M | no disponible en la informacion proporcionada | Media 38,7 | no disponible en la informacion proporcionada (SmolLM suele publicarse con licencia permisiva) | no disponible en la informacion proporcionada |
| flame-27m-base | 27,1M (mismo backbone) | 2048 | no disponible en la informacion proporcionada | Apache 2.0 | safetensors |
| Alternativas de ~0,5B a 1B (por ejemplo Qwen2.5-0.5B-Instruct o TinyLlama-1.1B) | no disponibles en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos homogeneos disponible es la de SmolLM-135M-Instruct, la referencia citada por el propio autor: flame-27m-instruct es aproximadamente 5 veces mas pequeno y obtiene 4,7 puntos menos de media en las pruebas de conocimiento, con empate practicamente exacto en winogrande (51,7 frente a 51,3) y en mmlu (24,9 frente a 24,4). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- Conocimiento y razonamiento practicamente inexistentes: la media de 34,0 % en las pruebas academicas esta proxima al nivel de azar en varias de ellas (commonsense_qa 19,7 frente a un azar de 20; mmlu 24,9 frente a 25). No es un modelo de conocimiento.
- El ajuste por instrucciones anade formato, no hechos: el autor senala que el SFT mejora el formato de respuesta y la perdida en tokens de asistente, pero no la veracidad ni la cobertura de conocimiento.
- Instrucciones complejas: IFEval es aproximadamente 0 segun el autor. No satisface de forma fiable prompts con multiples restricciones simultaneas; la limitacion esta en la capacidad del modelo base de 27M, no en los datos de SFT.
- Riesgo de alucinacion: alto. Un modelo de este tamano tiende a producir texto plausible sin base factual, especialmente en preguntas de conocimiento, datos numericos o referencias.
- Idioma: solo ingles. No hay soporte multilingue documentado, por lo que el uso en castellano degradara la calidad de forma acusada.
- Contexto limitado a 2048 tokens: insuficiente para documentos largos, conversaciones extensas o tareas con mucho material de referencia.
- Sesgos: no disponible informacion especifica. La mezcla incluye WildChat (filtrado como no toxico) y Tulu-3-Persona-IF, por lo que pueden persistir sesgos presentes en esos corpus.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; conviene auditar el modelado antes de usarlo en entornos de produccion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre con las obligaciones de atribucion y aviso habituales. No se documentan restricciones adicionales.
- Adopcion muy baja: 145 descargas y 0 likes en el momento de la consulta, con una unica version. La validacion por parte de terceros es practicamente nula, por lo que conviene tratarlo como material de investigacion mas que como componente de produccion.
- Uso en produccion: no recomendado para tareas orientadas a usuario final que requieran precision, salvo que el alcance se limite a formateo, generacion de plantillas o experimentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ifx-pse-sys-ml/flame-27m-instruct
- Modelo base: https://huggingface.co/ifx-pse-sys-ml/flame-27m-base
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Tulu-3-Persona-IF: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Dataset No-Robots: https://huggingface.co/datasets/HuggingFaceH4/no_robots
- Dataset WildChat-1M: https://huggingface.co/datasets/allenai/WildChat-1M
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo. Los unicos enlaces obtenidos correspondian a cotizaciones bursitiles de Infineon Technologies (ticker IFX) y a un proveedor de pagos internacionales, sin relacion alguna con el modelo. Por tanto, no se dispone de paper, blog, repositorio o demo adicional verificable.
