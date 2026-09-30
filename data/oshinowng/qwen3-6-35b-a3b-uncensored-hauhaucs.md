# oshinoWng/Qwen3.6-35B-A3B-Uncensored-HauhauCS

## Resumen

Qwen3.6-35B-A3B-Uncensored-HauhauCS es una variante sin censura (uncensored) del modelo multimodal Qwen/Qwen3.6-35B-A3B, un transformer de arquitectura Mixture of Experts (MoE) con 34.660.610.688 parametros totales y aproximadamente 3.000 millones activos por pasada forward. La ficha que nos ocupa corresponde al repositorio oshinoWng/Qwen3.6-35B-A3B-Uncensored-HauhauCS, un reupload en formato GGUF del trabajo original publicado por el usuario HauhauCS bajo la variante "Aggressive". El modelo base esta desarrollado por el equipo Qwen (Alibaba), mientras que la eliminacion de rechazos y la cuantizacion son trabajo de terceros.

El problema que resuelve es doble. Por un lado, el modelo base ofrece una ventana de contexto nativa de 262.144 tokens, atencion hibrida (lineal + softmax completa en proporcion 3:1), 40 capas, 256 expertos con 8 enrutados por token y soporte multimodal nativo de texto, imagen y video. Por otro, esta variante elimina los rechazos del alineamiento de seguridad, con una evaluacion declarada por el autor de 0 rechazos sobre 465 peticiones, lo que la hace relevante para experimentacion con contenido restringido, investigacion sobre alineamiento y despliegues donde los filtros del modelo base resultan limitantes.

Es relevante ahora porque combina tres tendencias: arquitecturas MoE eficientes en inferencia (solo ~3B activos por token), contextos ultra largos de 262K tokens y multimodalidad nativa en un unico checkpoint. Todo ello empaquetado en GGUF con cuantizaciones personalizadas K_P e importance matrix (imatrix), lo que permite ejecutarlo en hardware de consumo. El repositorio indicado no registra descargas ni likes en el momento de la consulta, por lo que carece de validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrida: atencion lineal + atencion softmax completa (ratio 3:1) |
| Parametros totales | 34.660.610.688 (~34,66 B; denominado comercialmente 35B) |
| Parametros activos | ~3 B por pasada forward (MoE, 8 de 256 expertos enrutados por token) |
| Longitud de contexto | 262.144 tokens nativos (262K) |
| Tipos de cuantizacion | GGUF: Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_NL, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M, mmproj f16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tamano total del repo: 247,4 GB) |
| Capas | 40 |
| Expertos | 256 totales, 8 enrutados por token |
| Modalidades | Texto, imagen y video (pipeline image-text-to-text) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Autor del modelo original sin censura | HauhauCS (variante Aggressive) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE hibrido de 40 capas que alterna atencion lineal y atencion softmax completa en una proporcion de 3 a 1. Esta combinacion busca reducir el coste computacional y de memoria del mecanismo de atencion en contextos muy largos sin perder la capacidad de recuperacion exacta que aporta la atencion softmax completa. El componente MoE consta de 256 expertos, de los cuales se enrutan 8 por token, lo que da un total de 34,66 mil millones de parametros con solo unos 3.000 millones activos por token: el modelo tiene la huella de memoria de un modelo de ~35B pero el coste de computo por token de uno de ~3B. La multimodalidad es nativa, no un adaptador anadido, y cubre texto, imagen y video.

En cuanto al entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineamiento en el modelo base; esos datos corresponden a la ficha de Qwen/Qwen3.6-35B-A3B, que no se ha proporcionado. Lo que si documenta el autor de esta variante es que no se han modificado datasets ni capacidades: el proceso es una abliteracion de los pesos que elimina los rechazos manteniendo el resto del comportamiento. Las cuantizaciones se generan con importance matrix (imatrix) especifica para los pesos abliterados, y las variantes K_P ("Perfect") aplican un perfil de cuantizacion optimizado por modelo que, segun el autor, mejora la calidad en uno o dos niveles de cuantizacion con solo un 5-15% mas de tamano de archivo respecto al quant base. Se declaran 0 rechazos sobre 465 peticiones de prueba, aunque no se documenta la metodologia de esa evaluacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y otros idiomas (etiquetado como multilingual).
- Razonamiento en modo thinking (activado por defecto) y modo no-thinking, con hiperparametros de muestreo recomendados distintos para cada uno.
- Generacion y comprension de codigo, con ajustes de temperatura y penalizacion especificos recomendados para tareas de programacion y precision.
- Razonamiento matematico y tareas de logica dentro del modo thinking.
- Vision y video: comprension de imagenes y video de forma nativa mediante el archivo mmproj.
- Contexto largo de 262K tokens nativos, con recomendacion de mantener al menos 128K para preservar las capacidades de thinking.
- Conversacion general y tareas de asistencia sin restricciones de contenido (variante Aggressive).
- Compatibilidad con runtimes GGUF: llama.cpp, LM Studio, Ollama y cualquier motor compatible.
- Tool calling / function calling: no se documenta explicitamente en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no se documenta explicitamente, aunque el modo thinking y el contexto de 262K son compatibles con ese tipo de flujos.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: la variante permite estudiar como se comporta el modelo base sin capas de rechazo, comparando respuestas con y sin abliteracion sobre el mismo conjunto de prompts. Es adecuado porque el autor afirma que no se han alterado datasets ni capacidades, aislando la variable del alineamiento.
- Analisis de documentos extensos: con 262K tokens de contexto se pueden procesar informes, expedientes o bases de codigo completas en una sola pasada, sin fragmentar ni perder coherencia entre secciones.
- Procesamiento de documentacion tecnica escaneada: gracias al pipeline image-text-to-text y al archivo mmproj, el modelo puede extraer informacion de imagenes y diagramas ademas del texto circundante.
- Analisis de video para monitorizacion o resumen: la multimodalidad nativa permite describir y resumir contenido de video en un flujo unico, util para catalogacion de archivos audiovisuales.
- Generacion de codigo en local: las cuantizaciones Q4_K_M (21 GB) o Q5_K_M (28 GB) permiten ejecutar un modelo de 35B en una estacion de trabajo con una sola GPU de 24-48 GB usando llama.cpp o LM Studio, con los ajustes de temperatura 0,6 y top_p 0,95 recomendados para tareas precisas.
- Escritura creativa sin filtros: la variante Aggressive evita los rechazos en generos como terror, ficcion adulta o narrativa violenta, donde los modelos alineados suelen negarse. Requiere revision editorial humana.
- Despliegue en GPU de consumo para asistentes personales: los quants IQ2_M (11 GB) e IQ3_M (15 GB) caben en tarjetas de 12-16 GB, con la salvedad de la perdida de calidad esperable en esos niveles.
- Experimentacion con contextos extremos: probar degradacion de atencion a 200K+ tokens sobre tareas de recuperacion de informacion en un modelo MoE con atencion hibrida.
- Red teaming interno: usarlo como generador de contenido adversario controlado en un entorno aislado para entrenar clasificadores de seguridad propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de evaluacion aportado por el autor es una cifra de rechazos: 0 sobre 465 peticiones en la variante Aggressive. No se especifica el conjunto de prompts, el idioma, ni si la evaluacion fue automatica o humana, por lo que no es comparable a metricas estandar como MMLU, HumanEval o GSM8K. Tampoco se comparan los K_P quants contra los quants base con mediciones de perplejidad publicadas.

## Requisitos de hardware

- VRAM estimada segun el tamano de archivo declarado (sin contar KV cache ni overhead del runtime): IQ2_M ~11 GB; IQ3_M y Q2_K_P ~15 GB; IQ4_XS ~19 GB; Q3_K_P ~19 GB; IQ4_NL ~20 GB; Q4_K_M ~21 GB; Q4_K_P ~23 GB; Q5_K_P ~28 GB; Q6_K_P ~31 GB; Q8_K_P ~44 GB. El proyector multimodal mmproj f16 anade ~899 MB.
- Consumo de KV cache: no disponible. Con 262K tokens de contexto y atencion hibrida, el impacto real dependera de la longitud efectiva usada; se recomienda no bajar de 128K si se quiere preservar el modo thinking.
- GPU recomendadas por tramo: para los quants de 11-15 GB, RTX 3060 12 GB o RTX 4060 Ti 16 GB; para 19-23 GB, RTX 3090, RTX 4090 o RTX 5090 con 24-32 GB; para 28-31 GB, A6000 48 GB, RTX 6000 Ada o configuraciones multi-GPU; para el Q8_K_P de 44 GB, A100 80 GB, H100 o dos GPU de 24 GB con reparto por capas.
- Caben en GPU de consumo: si, los quants Q2, Q3 y Q4 (hasta 23 GB) caben en tarjetas de 12, 16 y 24 GB respectivamente. Los quants IQ2_M e IQ3_M son los unicos viables en 12-16 GB con margen para contexto.
- Opciones de despliegue: llama.cpp (requiere el flag --jinja para el manejo correcto de la plantilla de chat), LM Studio, Ollama y cualquier runtime compatible con GGUF. Para las variantes bf16 existen reuploads en safetensors aptos para vLLM o TGI, aunque no forman parte del repositorio descrito.
- Nota de compatibilidad: los K_P quants no son reconocidos por el widget de compatibilidad de hardware de Hugging Face ni por la columna de cuantizacion de LM Studio, lo que es un problema de visualizacion, no de carga.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-HauhauCS (este repo, oshinoWng) | 34,66 B totales / ~3 B activos | 262K | Texto, imagen, video | apache-2.0 | GGUF, 247,4 GB, 0 descargas | No disponibles |
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (HauhauCS) | 34,66 B totales / ~3 B activos | 262K | Texto, imagen, video | apache-2.0 | GGUF, repositorio original | No disponibles |
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-bf16 (ericpandev) | 34,66 B totales / ~3 B activos | 262K | Texto, imagen, video | apache-2.0 | Safetensors bf16 | No disponibles |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66 B totales / ~3 B activos | 262K | Texto, imagen, video | apache-2.0 | Pesos oficiales con alineamiento | No disponibles en la informacion proporcionada |

Los tres primeros repositorios comparten exactamente los mismos pesos subyacentes y solo difieren en el formato y en quien los publica. No se dispone de datos de benchmarks ni de modelos alternativos de la misma categoria y tamano en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Contenido danino: la variante Aggressive esta disenada para no rechazar peticiones. Puede generar contenido ilegal, peligroso, sexual explicito o gravemente ofensivo. No es apta para aplicaciones orientadas al publico sin filtros externos.
- Ausencia de guardrails: no hay capas de seguridad efectivas mas alla de posibles avisos cortos heredados del entrenamiento del modelo base, que el autor describe como aclaraciones agregadas y no como rechazos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasa de alucinacion para esta variante. Al tratarse de pesos abliterados, el comportamiento puede desviarse del modelo base de formas no documentadas.
- Degradacion por cuantizacion: los quants por debajo de Q4 (IQ3, Q2) suponen una perdida de calidad considerable. El autor no publica mediciones de perplejidad comparando K_P con los quants estandar.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante ni para el modelo base en la informacion disponible. Un modelo sin alineamiento de seguridad tiende a reproducir estereotipos sin moderacion.
- Cobertura idiomatica: los idiomas declarados son ingles, chino y multilingual generico. No hay garantia de calidad en castellano, y no se aportan evaluaciones por idioma.
- Contexto: aunque la ventana es de 262K tokens, el propio autor recomienda mantener al menos 128K para preservar las capacidades de thinking, lo que sugiere degradacion fuera de ese rango.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero la responsabilidad legal y etica del contenido generado recae integramente en el desplegador. La licencia no exime del cumplimiento de normativa local sobre contenido.
- Procedencia y trazabilidad: el repositorio indicado (oshinoWng) es un reupload con 0 descargas y 0 likes, no el repositorio original de HauhauCS. No se garantiza que los archivos sean identicos a los del autor original ni que se actualicen.
- Metadatos anomalos: la fecha de creacion registrada es 2026-09-30, posterior a la actualidad conocida, lo que indica que los metadatos deben tratarse con cautela.
- Vision: el soporte multimodal exige descargar y cargar el archivo mmproj junto al GGUF principal; sin el, el modelo funciona solo con texto.
- Plantilla de chat: en llama.cpp es necesario usar --jinja para que la plantilla de chat se aplique correctamente; omitirlo degrada la calidad de las respuestas.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/oshinoWng/Qwen3.6-35B-A3B-Uncensored-HauhauCS
- Modelo original de HauhauCS: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Reupload en bf16: https://huggingface.co/ericpandev/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Espejo en GitHub: https://github.com/chenfei66/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive/tree/main
- Analisis en HackerNoon: https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context
- Tutorial de despliegue local: https://aiindigo.com/tutorials/running-qwen3-6-35b-uncensored-local-setup-multimodal-usage
- Discord del autor: https://discord.gg/SZ5vacTXYf
