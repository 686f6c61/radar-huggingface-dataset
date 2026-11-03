# danielrosehill/term-context-sentence-generator-granite-4.2-3b-v1

## Resumen

Term-Context Sentence Generator (Granite 4.2 3B, v1) es un ajuste fino mediante LoRA del modelo ibm-granite/granite-4.2-3b, desarrollado por danielrosehill y publicado en HuggingFace bajo licencia Apache 2.0. El modelo resuelve una tarea muy concreta: dado un termino, una descripcion de contexto de una linea y un numero n, devuelve un array JSON con exactamente n frases en ingles natural de entre 6 y 18 palabras, cada una usando el termino una sola vez y con el significado indicado. Su proposito principal es generar texto que se leera en voz alta para grabar datos de ajuste fino de ASR (reconocimiento automatico del habla) sobre vocabulario especializado: hebreo romanizado, nombres y lugares israelies, y terminos tecnicos.

El modelo base es un transformer denso de aproximadamente 3.660 millones de parametros (3.659.737.600 segun los pesos safetensors), con licencia Apache 2.0 y soporte unicamente de ingles. El ajuste se realizo con LoRA de rango 32 sobre todas las capas lineales, con 13.408 ejemplos que cubren 8.342 terminos, y los pesos resultantes se fusionaron en el modelo final. El repositorio ocupa 7,3 GB e incluye pesos en formato safetensors compatibles con la libreria transformers.

La relevancia del modelo es acotada pero clara: cubre un hueco de nicho en la generacion de corpus sinteticos para ASR de vocabulario especializado, donde los modelos generalistas suelen fallar al mantener la grafia exacta del termino o al ajustarse a restricciones de longitud. En la evaluacion publicada por el autor, el modelo alcanza un 95,7% de frases que pasan la comprobacion de forma (puerta de aceptacion ASR), frente al 99,7% de Gemini 3.1 Flash-Lite usado como referencia externa. No dispone de descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de ibm-granite/granite-4.2-3b), ajuste fino con LoRA fusionado |
| Parametros totales | 3.659.737.600 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; existe una version GGUF publicada por el autor |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del transformer denso ibm-granite/granite-4.2-3b. El ajuste se realizo con LoRA de rango 32, alpha 32, dropout 0.05 y aplicado a todas las capas lineales. Se uso una tasa de aprendizaje de 2e-4 con scheduler coseno, 2 epocas, tamano de batch 16 y 1.676 pasos de entrenamiento en precision bf16 sobre una unica GPU NVIDIA L40S, con un tiempo total de 27 minutos. La perdida se calculo unicamente sobre el turno del asistente. Los adaptadores LoRA se fusionaron en los pesos del modelo base para producir el checkpoint final publicado.

El conjunto de entrenamiento consta de 13.408 ejemplos que cubren 8.342 terminos, procedentes del dataset danielrosehill/term-context-sentences. El autor indica que buena parte de los datos fueron generados por modelos de lenguaje (Claude, Gemini, DeepSeek), lo que implica que el modelo aprende a imitar el estilo de esas generaciones y no dispone de verificacion factual. El prompt de sistema esta fijado y se corresponde exactamente con el usado durante el entrenamiento, de modo que la fidelidad a ese formato es parte del contrato de uso. No se documentan fases de RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de frases en ingles natural a partir de un termino, un contexto semantico y un conteo solicitado.
- Salida estructurada en formato JSON: array de cadenas con exactamente n elementos.
- Respeto de la grafia exacta del termino tal como se proporciona en la entrada.
- Control de longitud por frase: entre 6 y 18 palabras, segun las restricciones aprendidas.
- Diferenciacion de significado segun el contexto proporcionado, incluyendo categorias opcionales (hebrew, yiddish, name, place, street, brand, drug, medical, tech, ai_model, linux, smart_home, jewish_text, english_word, other).
- Soporte de conversacion mediante chat template de transformers.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido segun la informacion disponible.
- Capacidad multilingue limitada al ingles; el vocabulario entrenado tiene un sesgo marcado hacia terminos israelies.

## Casos de uso

- Generacion de corpus para ajuste fino de ASR: el modelo produce frases que se leen en voz alta para grabar audio de entrenamiento de reconocimiento del habla sobre vocabulario especializado (nombres propios, toponimos, terminos medicos o de tecnologia). La restriccion de 6 a 18 palabras y el uso unico del termino facilitan la alineacion posterior entre audio y transcripcion.
- Ampliacion de vocabulario en sistemas de dictado medico: dado un farmaco o termino clinico con su definicion breve, se generan frases de ejemplo para grabar y mejorar la cobertura del reconocimiento en ese dominio.
- Pruebas de calidad de pipelines TTS/ASR: generar frases controladas con un termino concreto permite construir conjuntos de evaluacion reproducibles para medir la tasa de acierto del reconocimiento sobre palabras dificiles.
- Creacion de datasets sinteticos para entrenamiento de normalizacion de texto: las frases generadas pueden servir como pares de ejemplo para tareas de sustitucion o etiquetado de terminos en contextos oracionales.
- Generacion de ejemplos para documentacion tecnica o glosarios: a partir de un termino y su definicion, el modelo produce oraciones de uso que ilustran el significado en contexto, utiles para fichas de producto o bases de conocimiento internas.
- Evaluacion de robustez de modelos ASR ante variaciones de contexto: pidiendo n + 2 frases y filtrando las que pasan comprobaciones propias, se obtiene un conjunto diverso de realizaciones para probar la sensibilidad del reconocedor a la longitud y a la posicion del termino.
- Prototipado rapido de generadores de frases restringidas: el modelo demuestra un patron de ajuste fino por LoRA para tareas de formato estricto (JSON, conteo exacto, restricciones de longitud) que puede replicarse en otros dominios con presupuesto de computo muy reducido.

## Benchmarks y rendimiento

Evaluacion publicada por el autor el 2026-11-03 sobre 309 llamadas retenidas (terminos no vistos en entrenamiento mas 6 pares de referencia fijos), con n = 10 y temperatura 0.8. La "puerta" de aceptacion ASR comprueba que la frase tenga entre 6 y 18 palabras, que el termino aparezca exactamente una vez y que se respeten las reglas de juego de caracteres y numeros.

| Metrica | Este modelo | Gemini 3.1 Flash-Lite (referencia externa, mismo conjunto de prompts) |
|---|---|---|
| Respuesta es JSON valido | 100% | 100% |
| Exactamente n frases | 100% | 100% |
| Frases que pasan la puerta | 95,7% | 99,7% |
| Llamadas con las n frases validas al primer intento | 72,8% | 96,8% |

El autor indica que la mayoria de fallos corresponden a frases ligeramente demasiado largas (19 a 22 palabras) y a un 1,8% de frases en las que falta el termino, normalmente por sustitucion de una palabra rara por otra mas familiar (por ejemplo, "arev" escrito como "avrech"). El termino aparece dos veces en el 0,3% de las frases. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 7,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB de pesos; en 4 bits, alrededor de 2 GB, aunque el autor no publica cifras oficiales de cuantizacion.
- GPU recomendadas: NVIDIA L40S (usada en el entrenamiento), A100, H100 para despliegues con concurrencia; tambien funciona en GPUs de consumo como RTX 4090, RTX 3090 o RTX 4080 en bf16 o cuantizado.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en bf16 y en tarjetas con 6-8 GB usando cuantizacion GGUF.
- Opciones de despliegue: transformers (referencia oficial de la model card), llama.cpp u Ollama mediante el repositorio GGUF publicado por el autor, y potencialmente vLLM o TGI al ser un modelo transformers estandar, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Term-Context Sentence Generator (Granite 4.2 3B, v1) | 3,66 B | No disponible | Generacion de frases restringidas para ASR | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| ibm-granite/granite-4.2-3b (modelo base) | Aproximadamente 3,66 B | No disponible | Modelo generalista de texto | Apache 2.0 | HuggingFace |
| Gemini 3.1 Flash-Lite (referencia del autor) | No disponible | No disponible | API propietaria de proposito general | Propietaria | API de Google |
| Modelos generalistas de 3-4 B (por ejemplo, familias Llama o Qwen de ese tamano) | 3-4 B | Variable | Texto general | Variable | HuggingFace |

La comparacion relevante es con el modelo base: el ajuste fino mejora la adherencia al formato JSON estricto, el conteo exacto de frases y la restriccion de longitud, a costa de especializarse y perder capacidades generales. Frente a Gemini 3.1 Flash-Lite, el modelo local queda por debajo en la tasa de frases que pasan la puerta (95,7% frente a 99,7%) y en llamadas con exito al primer intento (72,8% frente a 96,8%), pero ofrece ejecucion local, licencia permisiva y coste marginal nulo por llamada. No se dispone de datos comparativos con otros modelos ajustados especificamente para generacion de frases de vocabulario ASR.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- El vocabulario de entrenamiento tiene un sesgo marcado hacia terminos israelies (hebreo romanizado, nombres y lugares), lo que puede reducir la calidad con terminos de otras procedencias.
- Buena parte de los datos de entrenamiento fueron generados por modelos de lenguaje (Claude, Gemini, DeepSeek); el modelo imita ese estilo y puede reproducir sus sesgos.
- No hay verificacion de veracidad: el modelo escribe frases plausibles, no necesariamente verdaderas. No debe usarse como fuente factual.
- La puerta de evaluacion comprueba la forma (longitud, aparicion unica del termino, juego de caracteres), no el significado; una frase puede pasar la puerta y usar el termino con un sentido incorrecto.
- Tasa de exito al primer intento del 72,8% en la evaluacion del autor: se recomienda pedir n + 2 frases y conservar las primeras n que superen comprobaciones propias.
- Riesgo de sustitucion de terminos raros por palabras familiares (1,8% de frases sin el termino) y de duplicacion del termino (0,3%).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al evaluado.
- El prompt de sistema debe usarse exactamente como se especifica; desviarse de el puede degradar el cumplimiento del formato y del conteo.
- No dispone de soporte documentado de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/danielrosehill/term-context-sentence-generator-granite-4.2-3b-v1
- Version GGUF: https://huggingface.co/danielrosehill/term-context-sentence-generator-granite-4.2-3b-v1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/danielrosehill/term-context-sentences
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
