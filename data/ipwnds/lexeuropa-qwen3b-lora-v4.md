# iPwnds/lexeuropa-qwen3b-lora-v4

## Resumen

lexeuropa-qwen3b-lora-v4 es un adaptador LoRA publicado por el usuario iPwnds sobre el modelo base Qwen/Qwen2.5-3B-Instruct, orientado a la generacion de respuestas con citas verificables en el dominio del derecho de la Union Europea. Forma parte del proyecto LexEuropa, un sistema de generacion aumentada por recuperacion (RAG) en el que este adaptador actua como generador por defecto. El entrenamiento se realizo mediante SFT con TRL sobre 1.402 ejemplos del dataset iPwnds/lexeuropa-sft, con r=16, alpha=32, 2 epocas y 176 pasos, alcanzando una perdida final de 0.0055.

El modelo no introduce una arquitectura nueva: hereda el transformer decoder-only de Qwen2.5-3B-Instruct (3.000 millones de parametros) y anade un adaptador de bajo rango que especializa la generacion hacia preguntas de tipo tema con respuestas de articulo completo, preguntas de referencia y rechazos explicitos cuando la informacion no esta en las fuentes. El repositorio ocupa 0.3 GB y se distribuye en formato safetensors bajo licencia Apache 2.0.

Su relevancia actual radica en que aborda un problema concreto de los sistemas RAG juridicos: la disciplina de citacion y la completitud de las respuestas cuando se dispone de fuentes normativas. Segun la evaluacion del autor, con la recuperacion del proyecto alcanza una completitud media de 0.70 y un 52% de respuestas completamente completas, frente a 0.53-0.56 y 16% del adaptador anterior (v1) y 0.62 y 16% del Qwen2.5-72B sin ajustar. Se trata de un prototipo de investigacion, no de una herramienta de asesoramiento juridico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 3.000 millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |
| Libreria | transformers |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Dataset de entrenamiento | iPwnds/lexeuropa-sft (1.402 ejemplos) |
| Hiperparametros | r=16, alpha=32, 2 epocas, 176 pasos, perdida final 0.0055 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros. El ajuste es un LoRA de rango 16 y alpha 32 entrenado con TRL mediante SFT supervisado durante 2 epocas y 176 pasos, con una perdida final de 0.0055. No se documentan innovaciones arquitectonicas propias: el valor del modelo reside en la especializacion del comportamiento generativo, no en cambios estructurales.

El dataset de entrenamiento, iPwnds/lexeuropa-sft (rama main), contiene 1.402 ejemplos con tres tipos de tarea: preguntas en lenguaje natural sobre un tema con respuestas de articulo completo (cada parrafo citado desde su propio identificador de fuente), preguntas de estilo referencia y ejemplos de rechazo. El corpus de entrenamiento cubre el RGPD, otra legislacion de la UE y tres sentencias. No se indica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO; el pipeline documentado es exclusivamente SFT con TRL.

## Capacidades

- Generacion de texto en ingles con foco en dominio juridico de la Union Europea (RGPD y otra legislacion, mas tres sentencias).
- Generacion de respuestas de articulo completo con citas por parrafo, cada una vinculada a un identificador de fuente.
- Respuesta a preguntas de tipo referencia dentro del corpus.
- Rechazo explicito ante preguntas fuera del corpus: en la evaluacion declino las 4 preguntas trampa.
- Integracion en pipelines RAG: el modelo consume pasajes recuperados y los cita, en lugar de generar conocimiento juridico de memoria.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Asistente RAG juridico interno: combinado con un recuperador sobre el RGPD y legislacion de la UE, el modelo genera respuestas con citas por parrafo y rechaza preguntas fuera del corpus, lo que permite desplegarlo en entornos de consulta documental con trazabilidad de fuentes.
- Revision de cumplimiento normativo: dado un conjunto de articulos recuperados, el modelo redacta respuestas de articulo completo citando cada parrafo, util para borradores de analisis de obligaciones del RGPD que un jurista revisa despues.
- Evaluacion de sistemas de recuperacion: al medir completitud y precision/recall de citas (0.81 / 0.88 en 25 preguntas), sirve como generador de referencia para comparar variantes de retrieval en un banco de pruebas juridico.
- Generacion de resumenes con fuente: para preguntas de referencia, el modelo localiza y cita el pasaje correspondiente, adecuado en herramientas de consulta documental donde el usuario necesita el texto normativo exacto.
- Prototipado de productos legales de bajo coste: con 3.000 millones de parametros y un adaptador de 0.3 GB, puede desplegarse en infraestructura modesta para validar flujos de pregunta-respuesta sobre normativa antes de escalar a modelos mayores.
- Filtrado de preguntas fuera de alcance: los ejemplos de rechazo del entrenamiento permiten usar el modelo como primera capa que declina consultas no cubiertas por el corpus, derivando al usuario a otro canal.
- Investigacion sobre disciplina de citacion: el adaptador es un caso de estudio reproducible de como el SFT con ejemplos de articulo completo y rechazos mejora la completitud (0.70 frente a 0.53-0.56 de v1) sin mejorar el razonamiento juridico.

## Benchmarks y rendimiento

Evaluacion del autor sobre un conjunto de calidad de respuesta de 25 preguntas con listas de verificacion anotadas manualmente y calificadas por Qwen2.5-72B, mas 4 preguntas trampa fuera del corpus. Los resultados se obtuvieron con la recuperacion del proyecto, que anade los demas parrafos de los articulos principales del mismo instrumento.

| Metrica | v4 (este modelo) | v1 (anterior) | Qwen2.5-72B sin ajustar |
|---|---|---|---|
| Completitud media | 0.70 | 0.53-0.56 | 0.62 |
| Respuestas completamente completas | 52% | 16% | 16% |
| Contradicciones marcadas | 0 | no disponible | no disponible |
| Preguntas trampa rechazadas | 4 de 4 | no disponible | no disponible |
| Precision de citas | 0.81 | no disponible | no disponible |
| Recall de citas | 0.88 | no disponible | no disponible |
| Completitud sin expansion de contexto | 0.56 | no disponible | no disponible |

Notas del autor: n=25, una sola ejecucion por modelo, y un criterio de la regla de promocion (precision de citas) quedo en el limite. Los resultados deben leerse como mejor completitud y disciplina de citacion, no como mejor razonamiento juridico. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 3.000 millones de parametros en fp16 se situa en torno a 6-7 GB, y en cuantizaciones de 8 y 4 bits en el rango de 3-4 GB y 2-3 GB respectivamente (estimacion general, no confirmada por el autor).
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo es apto para GPU de consumo con suficiente VRAM y para GPU de datacenter (A100, H100) en despliegues con concurrencia.
- Cabe en GPU de consumo: si, por el tamano del modelo base (3.000 millones de parametros), aunque el autor no publica requisitos concretos ni cuantizaciones del adaptador.
- Opciones de despliegue: la libreria declarada es transformers; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lexeuropa-qwen3b-lora-v4 | 3.000 M (base) + LoRA | no disponible | SFT juridico UE sobre Qwen2.5-3B-Instruct | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen2.5-3B-Instruct | 3.000 M | no disponible en esta ficha | Modelo generalista instruct | Apache 2.0 | Hugging Face |
| Qwen2.5-72B (sin ajustar) | 72.000 M | no disponible en esta ficha | Modelo generalista de mayor escala | no disponible en esta ficha | Hugging Face |
| v1 de LexEuropa | no disponible | no disponible | Version anterior del generador del proyecto | no disponible | no disponible |

La comparacion con Qwen2.5-72B es la unica con datos de rendimiento aportados por el autor: v4 obtiene mayor completitud (0.70 frente a 0.62) y mayor porcentaje de respuestas completamente completas (52% frente a 16%) en el conjunto de evaluacion del proyecto, con la salvedad de que se trata de una evaluacion interna de 25 preguntas y no de benchmarks estandar.

## Limitaciones y advertencias

- Solo ingles: la model card declara language: [en]; no hay soporte documentado de otros idiomas, incluido el espanol.
- Corpus limitado: entrenado sobre el RGPD, otra legislacion de la UE y tres sentencias; no cubre el ordenamiento juridico de forma general.
- El modelo copia los pasajes que recibe, por lo que fuentes irrelevantes pueden filtrarse en las respuestas; el proyecto restringe la expansion a un solo instrumento por este motivo.
- Puede rechazar preguntas que las fuentes si responden; el proyecto reintenta esas consultas con un modelo mas potente.
- Los resultados dependen de la recuperacion del proyecto: sin expansion de contexto, v4 no supera a v1 (0.56 de completitud).
- Evaluacion con n=25, una unica ejecucion por modelo y un criterio de la regla de promocion (precision de citas) en el limite; no debe interpretarse como evidencia de razonamiento juridico.
- Riesgo de alucinacion y de citas incorrectas en produccion no cuantificado mas alla de la evaluacion interna; no se documentan sesgos conocidos.
- Prototipo de investigacion: no constituye asesoramiento juridico.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantias sobre la exactitud del contenido generado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iPwnds/lexeuropa-qwen3b-lora-v4
- Proyecto LexEuropa en GitHub: https://github.com/lumenworksco/-LexEuropa
- Dataset de entrenamiento: https://huggingface.co/datasets/iPwnds/lexeuropa-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
