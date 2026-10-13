# Marco-Danz/leoncino-ministral3b-veneto

## Resumen

Leoncino 3B es un adaptador LoRA publicado por Marco Danzo sobre el modelo instruct de 3 mil millones de parametros Ministral-3B-Instruct, desarrollado por Mistral AI. Su proposito es muy concreto: convertir un modelo generalista en un asistente conversacional que responde siempre y unicamente en veneto central (variedades de Padua, Vicenza y Treviso), independientemente del idioma en que reciba la pregunta. Es la version reducida de Leoncino 7B, un proyecto anterior del mismo autor sobre Mistral-7B-Instruct-v0.3.

El modelo se distribuye como adaptador PEFT en safetensors y, ademas, como modelo fusionado y cuantizado a 8 bits en formato GGUF (3,5 GB) acompanado de un `Modelfile` para Ollama. Con 3.315.716.096 parametros declarados en el repositorio, esta pensado para equipos con menos de 10 GB de RAM libre, donde el 7B no cabe con comodidad.

Su relevancia es fundamentalmente experimental y de nicho: demuestra que un ajuste LoRA de rango moderado (r=32) y coste muy bajo (unos 25 minutos en una unica NVIDIA A40) basta para forzar una lengua minoritaria de bajos recursos como el veneto, aunque a costa de una perdida notable de coherencia respecto al modelo base. No es un modelo de produccion generalista, sino una herramienta de generacion de texto dialectal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Ministral-3B-Instruct) + adaptador LoRA |
| Parametros totales | 3.315.716.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenamiento con max 1024 tokens) |
| Tipos de cuantizacion | GGUF q8_0 (3,5 GB) incluido en el repositorio; adaptador LoRA en precision completa; base en bf16 |
| Idiomas soportados | Veneto (codigo `vec`, variedad central) e italiano (codigo `it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF (modelo fusionado q8_0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Ministral-3B-Instruct, un transformer decoder-only de Mistral AI, que se carga en bf16 sin cuantizar. Sobre el se aplica un adaptador LoRA que afecta a las proyecciones q, k, v, o, gate, up y down, con rango r=32, alpha=64 y dropout 0,05. El autor probo cuatro rangos (r=8, 16, 32 y 64) y determino que r=32 es el punto dulce: r=64 con tasa de aprendizaje reducida a la mitad empeora ligeramente la loss de validacion (2,34 frente a 2,30).

El entrenamiento es un SFT supervisado con la libreria TRL, con la loss calculada unicamente sobre los turnos del asistente en formato prompt/completion. Los hiperparametros son lr 2e-4 con scheduler cosine, warmup del 5%, batch efectivo de 16, 4 epocas (848 pasos) y longitud maxima de 1024 tokens. El conjunto de datos consta de 1.993 dialogos multi-turno en veneto que suman 3.383 respuestas del asistente, generados sinteticamente con Claude Opus 5.5 a partir de unos 50 temas cotidianos; es el mismo dataset empleado para Leoncino 7B. Todo el ajuste se ejecuto en una unica NVIDIA A40 durante aproximadamente 25 minutos, con un pico de 7,5 GB de VRAM. La mejor loss de validacion (2,30) se alcanzo en la epoca 2,83, y el checkpoint guardado corresponde a ese punto, no a la ultima epoca.

Una particularidad tecnica relevante es que el tokenizer del repositorio lleva una plantilla de chat distinta de la oficial de Ministral: el system prompt se inserta dentro del primer turno de usuario (`[INST] system\n\nuser [/INST] respuesta</s>[INST] user [/INST] ...`). Es imprescindible usar el tokenizer de este repositorio o reproducir ese formato exacto, en lugar del tokenizer del modelo base.

## Capacidades

- Generacion de texto conversacional en veneto central (Padua, Vicenza, Treviso) con ortografia simplificada, manteniendo el idioma de respuesta aunque la entrada sea en italiano, ingles u otra lengua.
- Dialogo multi-turno: el dataset de entrenamiento es conversacional y la plantilla de chat soporta historial de mensajes con rol de sistema.
- Tematica cotidiana variada, derivada de los aproximadamente 50 temas usados para generar los datos: presentaciones personales, planes, rutas y desplazamientos, cocina, historia local y conversacion general.
- Comprension de instrucciones en italiano e ingles como lenguas de entrada, con salida restringida al veneto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni de razonamiento multi-paso planificado.
- No se documenta modo de pensamiento (thinking), vision ni audio.
- Aritmetica muy limitada: el propio autor documenta errores como 12×8 = 84.

## Casos de uso

- Generacion de contenido divulgativo en veneto: redaccion de parrafos breves, resumenes o textos costumbristas para blogs, boletines locales o proyectos de recuperacion linguistica, aprovechando que el modelo solo responde en esa lengua.
- Prototipado de asistentes conversacionales dialectales: servir de base para demos o pruebas de concepto de chatbots en veneto antes de invertir en un modelo mayor como Leoncino 7B.
- Experimentacion academica en NLP de bajos recursos: sirve como caso reproducible de ajuste LoRA sobre un modelo de 3B con un dataset sintetico de 1.993 dialogos, util para estudiar el efecto del rango LoRA y las epocas en lenguas minorizadas.
- Generacion de datos sinteticos en veneto: producir variaciones de texto dialectal para aumentar corpus o preentrenar otros sistemas, asumiendo revision humana posterior por el riesgo de invencion.
- Despliegue en hardware muy limitado: con el GGUF q8_0 de 3,5 GB funciona en un Mac con 8 GB de RAM, lo que permite demostraciones en portatiles sin GPU dedicada.
- Educacion y sensibilizacion linguistica: ejemplos interactivos de conversacion en veneto para materiales didacticos, siempre con validacion por hablantes nativos por las limitaciones ortograficas.
- Traduccion asistida italiano-veneto de frases cortas: dado que acepta entradas en italiano y responde en veneto, puede usarse como borrador de traduccion para textos breves y de tematica cotidiana.
- No es adecuado para tareas que exijan exactitud factual, calculo aritmetico o razonamiento complejo, segun las propias limitaciones declaradas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente aporta una comparacion interna con su modelo hermano de 7B, basada en la loss de validacion y en una evaluacion manual sobre 30 preguntas:

| Metrica | Leoncino 3B | Leoncino 7B |
|---|---|---|
| Modelo base | Ministral-3B-Instruct | Mistral-7B-Instruct-v0.3 |
| eval_loss | 2,30 | 1,51 |
| Respuestas pertinentes (30 preguntas) | ~15/30 | ~27/30 |
| Tamano GGUF q8_0 | 3,5 GB | 7,7 GB |
| RAM recomendada | 6 GB | 10 GB |

Esta tabla procede de la model card del autor y no constituye una evaluacion independiente. No hay datos de benchmarks comparativos frente al modelo base Ministral-3B-Instruct.

## Requisitos de hardware

- Inferencia en bf16 o fp16 con el adaptador LoRA: pesos del modelo base en torno a 6,6 GB, mas overhead de activaciones y cache KV; se recomienda un minimo de 8-10 GB de VRAM.
- Inferencia con el GGUF q8_0 incluido: 3,5 GB de fichero y aproximadamente 6 GB de RAM recomendada por el autor; cabe en un Mac con 8 GB de RAM.
- Cuantizaciones menores (q4_K_M, q5_K_M) no estan publicadas en el repositorio, pero serian viables mediante conversion propia del modelo fusionado para reducir el requisito por debajo de los 3 GB.
- GPU de consumo: el modelo cabe en tarjetas con 8 GB o mas de VRAM, como una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090. En GPUs de 8 GB funciona con cuantizacion q8_0 o inferior.
- GPU profesionales: el autor uso una NVIDIA A40 unicamente para el entrenamiento; para inferencia son suficientes GPUs mucho menores, y tambien A100 o H100 sin problema de capacidad.
- Opciones de despliegue: Ollama (via el `Modelfile` incluido, opcion recomendada por el autor), llama.cpp para el GGUF, transformers con PEFT para el adaptador, y vLLM o TGI si se fusiona y exporta el modelo completo en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Entrenamiento (referencia): 1× NVIDIA A40, aproximadamente 25 minutos, pico de 7,5 GB de VRAM para 848 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Leoncino 3B (este) | 3,32B | Ministral-3B-Instruct | No disponible (entrenado a 1024 tokens) | eval_loss 2,30; ~15/30 respuestas pertinentes | Apache 2.0 | Adaptador PEFT + GGUF q8_0 en HuggingFace |
| Leoncino 7B | 7B (aprox.) | Mistral-7B-Instruct-v0.3 | No disponible en la informacion proporcionada | eval_loss 1,51; ~27/30 respuestas pertinentes | Apache 2.0 (segun el modelo base, no confirmado en la informacion) | HuggingFace |
| Ministral-3B-Instruct | 3B (aproximado) | No aplica | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7B (aproximado) | No aplica | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos publicados que comparen este modelo con otras alternativas de generacion de texto en veneto, por lo que la comparativa se limita a la familia Leoncino y a los modelos base. Cualquier comparacion de rendimiento distinta de la tabla interna del autor es no disponible.

## Limitaciones y advertencias

- Aritmetica incorrecta de forma sistematica: el autor documenta que 12×8 da 84 como respuesta del modelo.
- Pertinencia limitada: responde a la pregunta aproximadamente la mitad de las veces (unos 15 casos de 30 en la evaluacion del autor); ante preguntas complejas o abstractas genera texto veneto plausible pero no relacionado con la consulta.
- Tendencia alta a la invencion: recetas, fechas y hechos se afirman con tono convincente aunque sean falsos. No debe usarse como fuente factual sin verificacion.
- Variedad dialectal restringida al veneto central (Padua, Vicenza, Treviso) y con ortografia simplificada, sin representar otras variedades del veneto.
- Dataset completamente sintetico, generado por un LLM y no revisado por hablantes nativos, lo que puede introducir sesgos, calcos del italiano o formas poco naturales.
- Limitacion intrinseca de tamano: al ser un modelo de 3B, la coherencia y la calidad global son claramente inferiores a las de su version de 7B.
- Dependencia del modelo base: el adaptador requiere descargar y cargar `ministral/Ministral-3b-instruct`; no funciona de forma autonoma en safetensors.
- Plantilla de chat no estandar: el system prompt se inserta en el primer turno de usuario, distinta de la oficial del modelo base; usar la plantilla equivocada degrada las respuestas.
- Licencia Apache 2.0 en el adaptador, heredada del modelo base, que permite uso comercial; conviene verificar los terminos vigentes del modelo base por si cambian.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 0 likes) y ausencia de benchmarks independientes: no hay evidencia externa que respalde su calidad en produccion.
- No se documentan capacidades de tool calling, agentes, vision ni audio, por lo que no es apto para pipelines que dependan de ellas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Marco-Danz/leoncino-ministral3b-veneto
- Modelo base: https://huggingface.co/ministral/Ministral-3b-instruct
- Version mayor del mismo autor (Leoncino 7B): https://huggingface.co/Marco-Danz/leoncino-mistral-7b-veneto
- GitHub del autor: https://github.com/marco25d
- LinkedIn del autor: https://it.linkedin.com/in/marco-danzo
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: todos los resultados correspondian a entidades comerciales y cinematograficas sin relacion con el proyecto. No se dispone de paper, blog tecnico ni demo adicionales.
