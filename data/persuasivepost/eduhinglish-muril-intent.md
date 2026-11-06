# persuasivepost/eduhinglish-muril-intent

## Resumen

EduHinglish MuRIL Intent es un adaptador LoRA publicado por el usuario `persuasivepost` sobre el modelo base `google/muril-base-cased`. Su funcion es clasificar preguntas de estudiantes escritas en hinglish (mezcla de hindi y ingles) o en ingles en una de 15 intenciones predefinidas, como `explain_concept` o `definition`. La prediccion resultante se emplea como pista para un generador posterior denominado EduHinglish Gemma, lo que lo convierte en un componente de enrutamiento dentro de un pipeline educativo mas amplio.

El modelo es un clasificador de texto (`text-classification`) construido con PEFT sobre una arquitectura transformer BERT-like multilingue (MuRIL), que fue preentrenada por Google especificamente para lenguas indias y text con code-mixing. El adaptador pesa practicamente nada (el repositorio ocupa 0.0 GB), lo que facilita su despliegue junto al modelo base. La licencia es Apache 2.0 y los idiomas declarados son ingles e hindi.

Su relevancia es acotada pero concreta: demuestra un patron habitual en sistemas RAG y asistentes educativos, donde un modelo pequeno y barato clasifica la intencion del usuario antes de invocar un LLM generativo de mayor tamano. No obstante, el repositorio no incluye datos de entrenamiento, metricas ni ejemplos de uso mas alla del snippet de carga, y registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `google/muril-base-cased` (transformer encoder BERT-like) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base MuRIL-base tiene aproximadamente 236 M de parametros, dato no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (MuRIL-base usa tipicamente 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), hindi (hi); el tag `hinglish` sugiere soporte de code-mixing hindi-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA), libreria `peft` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre `google/muril-base-cased`, un encoder transformer de la familia BERT entrenado por Google con un objetivo de masked language modeling sobre texto multilingue de lenguas indias y pares traducidos. La cabeza de clasificacion se configura con `num_labels=15`, segun el snippet de la model card, para producir una distribucion sobre 15 intenciones de consulta educativa.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de ejemplos, la composicion de las 15 clases, la configuracion del LoRA (rango, alpha, modulos objetivo) ni si se aplico algun proceso de ajuste fino adicional. Tampoco se documenta ninguna innovacion tecnica mas alla del uso estandar de PEFT para adaptar un encoder preentrenado a una tarea de clasificacion.

## Capacidades

- Clasificacion de texto en 15 clases de intencion educativa (por ejemplo, `explain_concept`, `definition`).
- Procesamiento de consultas en hinglish (code-mixing hindi-ingles) y en ingles.
- Generacion de una etiqueta de intencion que se pasa como pista a un generador (EduHinglish Gemma) en un pipeline de respuesta educativa.
- Inferencia ligera: al ser un adaptador sobre un encoder de ~236 M de parametros, el coste computacional es bajo.
- No soporta tool calling, agentes, vision, audio ni modos de razonamiento extendido: es un clasificador, no un modelo generativo.

## Casos de uso

- Enrutamiento de consultas en un asistente educativo: clasificar la pregunta del estudiante antes de decidir que plantilla o que rama del generador activar, reduciendo el coste frente a invocar el LLM generativo para todo.
- Deteccion de intencion en chats de tutoria: identificar si el alumno pide una definicion, una explicacion de concepto o un ejercicio, y ajustar la respuesta en consecuencia.
- Preprocesado en pipelines RAG educativos: usar la etiqueta de intencion para seleccionar la coleccion documental o el indice sobre el que recuperar contexto.
- Analitica de uso: agregar las intenciones predichas para medir que tipos de duda dominan en una plataforma de aprendizaje y priorizar contenidos.
- Moderacion y triaje: derivar consultas fuera de las 15 clases a un humano o a un flujo generico.
- Filtrado en sistemas de Q&A multilingues: normalizar consultas en hinglish antes de pasarlas a un modelo mayor, aprovechando que MuRIL esta preentrenado para code-mixing.
- Prototipado rapido: servir como baseline barato de clasificacion de intenciones en un producto educativo antes de invertir en un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo base MuRIL (~236 M de parametros) mas el adaptador LoRA, que anade unos pocos MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; tambien funciona en CPU para volumenes moderados.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: `transformers` + `peft` (patron documentado en la model card), exportacion a ONNX, o servidores de inferencia tipo TorchServe; no se documenta soporte directo en vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EduHinglish MuRIL Intent (este) | Adaptador LoRA sobre MuRIL-base | No disponible | Clasificacion de intencion (15 clases) | Apache 2.0 | Hugging Face, 0 descargas |
| `google/muril-base-cased` | ~236 M | No disponible | Masked LM / base para fine-tuning | Apache 2.0 | Hugging Face, ampliamente usado |
| `google/muril-large-cased` | ~560 M (aproximado) | No disponible | Masked LM / base para fine-tuning | Apache 2.0 | Hugging Face |
| `xlm-roberta-base` | ~278 M | 512 tokens | Masked LM multilingue | MIT | Hugging Face |

La comparacion con alternativas especificas de clasificacion de intenciones en hinglish no esta disponible: no se han identificado en la informacion proporcionada modelos directamente equivalentes.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al entrenarse sobre consultas educativas en hinglish puede heredar sesgos de dominio y de la distribucion de idiomas de MuRIL.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador), pero si riesgo de clasificacion erronea cuando la consulta cae fuera de las 15 clases o mezcla idiomas no cubiertos.
- No se especifica el conjunto de las 15 intenciones ni ejemplos, lo que impide evaluar la cobertura real del clasificador.
- El repositorio no incluye metricas (accuracy, F1), datos de entrenamiento ni detalles del LoRA; la evaluacion independiente es imposible sin reentrenar o probar contra un conjunto propio.
- Cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion por la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `google/muril-base-cased` para uso comercial.
- El modelo esta disenado como componente auxiliar de un pipeline concreto (EduHinglish Gemma); reutilizarlo fuera de ese contexto requiere validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/persuasivepost/eduhinglish-muril-intent
- Modelo base: https://huggingface.co/google/muril-base-cased
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
