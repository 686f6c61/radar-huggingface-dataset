# danielrosehill/Contextual-Sentence-Creator

## Resumen

Contextual-Sentence-Creator es un ajuste fino por LoRA (fusionado) del modelo ibm-granite/granite-4.2-3b, desarrollado por danielrosehill. Resuelve una tarea muy concreta: dado un termino, una descripcion breve de su contexto y un numero n, devuelve un array JSON con exactamente n frases naturales en ingles de entre 6 y 18 palabras, cada una usando el termino una sola vez y con el significado indicado. El objetivo practico es generar corpus de texto para grabar audio y entrenar sistemas ASR sobre vocabulario especializado (hebreo romanizado, toponimia israeli, terminos tecnicos).

El modelo tiene 3.659.737.600 parametros (3,66 mil millones) y hereda la arquitectura transformer densa de Granite 4.2 3B. No es un modelo de proposito general: esta especializado en la generacion controlada de frases con restricciones de forma (longitud, aparicion exacta del termino, salida JSON valida) y se distribuye con licencia Apache 2.0 en formato safetensors, con una version GGUF publicada aparte.

Su relevancia es la de un componente de pipeline: sustituye llamadas a APIs comerciales en la generacion masiva de frases para datasets de ASR, con un rendimiento medido del 95,7% de frases que pasan la comprobacion de forma frente al 99,7% de Gemini 3.1 Flash-Lite, y con la ventaja de ejecutarse en local sobre una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: ibm-granite/granite-4.2-3b), ajuste LoRA fusionado |
| Parametros totales | 3.659.737.600 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe version GGUF en danielrosehill/Contextual-Sentence-Creator-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 7,3 GB); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Granite 4.2 3B, un transformer denso de 3,66 mil millones de parametros, y se obtiene mediante un ajuste fino LoRA con r = 32, alpha = 32, dropout de 0,05 aplicado a todas las capas lineales, fusionado posteriormente en los pesos base. El entrenamiento uso learning rate 2e-4 con scheduler coseno, 2 epocas, batch de 16 y 1.676 pasos en bf16 sobre una unica GPU L40S, con un tiempo total de 27 minutos. La perdida se calculo solo sobre el turno del asistente.

El dataset de entrenamiento, danielrosehill/term-context-sentences, contiene 13.408 ejemplos sobre 8.342 terminos distintos. Una parte importante de esos datos fue generada por modelos LLM (Claude, Gemini, DeepSeek), segun reconoce el propio autor. El prompt de sistema esta fijado y forma parte del contrato del modelo: instruye a escribir exactamente n frases diferentes de 6 a 18 palabras, cada una con el termino una sola vez y en el significado descrito por el contexto, respondiendo con un array JSON de cadenas. La entrada de usuario es un objeto JSON con los campos term, context, n y un campo opcional kind (hebrew, yiddish, name, place, street, brand, drug, medical, tech, ai_model, linux, smart_home, jewish_text, english_word, other).

## Capacidades

- Generacion controlada de frases: produce exactamente n frases en ingles de 6 a 18 palabras con el termino insertado una sola vez y con el sentido indicado por el contexto.
- Salida estructurada: devuelve siempre un array JSON de cadenas, lo que facilita su integracion en pipelines automatizados.
- Vocabulario especializado: maneja terminos poco frecuentes (hebreo romanizado, yiddish, nombres y lugares israelies, marcas, farmacos, terminos medicos, tecnologicos y de domotica) gracias al campo kind.
- Generacion de corpus para ASR: pensado para producir frases que se leen en voz alta y se graban para ajustar modelos de reconocimiento de voz.
- Generacion con muestreo: funciona con temperature 0.8 y top_p 0.95, lo que aporta diversidad entre frases de una misma llamada.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito, segun la informacion disponible.

## Casos de uso

- Creacion de datasets de ASR para vocabulario especializado: se solicita un lote de frases por termino (por ejemplo, n + 2), se filtran las que pasan las comprobaciones de forma y se leen en voz alta para grabar el audio de entrenamiento. Es el caso para el que fue disenado.
- Ampliacion de lexicos de reconocimiento de voz: para cada termino nuevo de un dominio (nombres propios, toponimos, marcas) se generan frases de contexto que permiten entrenar o evaluar el reconocimiento de esa palabra en habla continua.
- Generacion de ejemplos para pruebas de TTS: las frases de 6 a 18 palabras con un termino concreto sirven como entradas controladas para verificar la pronunciacion de palabras dificiles en sistemas de sintesis de voz.
- Aumento de datos para clasificadores de texto: las frases generadas por termino y contexto pueden usarse como ejemplos etiquetados debiles en tareas de desambiguacion lexica o de deteccion de dominio.
- Prototipado local sin dependencia de API: al ejecutarse sobre una sola GPU y con licencia Apache 2.0, permite generar lotes de frases en entornos sin acceso a servicios comerciales o con requisitos de privacidad.
- Evaluacion comparativa de generacion restringida: sirve como referencia local para medir el cumplimiento de restricciones de forma (longitud, aparicion del termino, JSON valido) frente a modelos comerciales con el mismo prompt.

## Benchmarks y rendimiento

Evaluacion publicada por el autor el 2026-11-03 sobre 309 llamadas reservadas (terminos no vistos en entrenamiento mas 6 pares fijos de referencia), con n = 10 y temperature 0.8. La comprobacion "gate" es el criterio de aceptacion para ASR: entre 6 y 18 palabras, el termino exactamente una vez, juego de caracteres permitido y reglas numericas.

| Metrica | Este modelo | Gemini 3.1 Flash-Lite (linea base por API) |
|---|---|---|
| Respuesta es JSON valido | 100% | 100% |
| Exactamente n frases | 100% | 100% |
| Frases que pasan el gate | 95,7% | 99,7% |
| Llamadas con las n frases validas al primer intento | 72,8% | 96,8% |

Los fallos se concentran en frases ligeramente demasiado largas (19 a 22 palabras) y en la ausencia del termino (1,8% de las frases), normalmente por sustitucion de una palabra rara por una familiar (por ejemplo, arev escrito como "avrech"). El termino aparece dos veces en el 0,3% de las frases.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud para un modelo denso de 3,66 mil millones de parametros, en bf16 los pesos ocupan aproximadamente 7,3 GB, por lo que se necesita una GPU con al menos 8-10 GB de VRAM para cargar el modelo y generar; en cuantizacion de 8 bits o 4 bits el requisito baja, pero no se han publicado cifras oficiales.
- GPU recomendadas: el autor entreno el ajuste en una unica NVIDIA L40S. Para inferencia, cualquier GPU con suficiente VRAM (serie RTX 4090, L40S, A100, H100) es adecuada; no se han publicado mediciones especificas por GPU.
- Cabe en GPU de consumo: si, en tarjetas con 8-12 GB de VRAM o mas en bf16, y con mayor margen usando la version GGUF cuantizada.
- Opciones de despliegue: transformers (ejemplo oficial de la model card con AutoModelForCausalLM y apply_chat_template), llama.cpp u Ollama a traves del repo GGUF, y servidores compatibles con la API de transformers; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo Hugging Face. No se confirma soporte especifico de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el entrenamiento (27 minutos en una L40S).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Contextual-Sentence-Creator | 3,66 B | no disponible | Generacion de frases con termino y contexto para ASR | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| ibm-granite/granite-4.2-3b (base) | 3,66 B | no disponible | Modelo de proposito general | no disponible en la informacion | Hugging Face |
| Gemini 3.1 Flash-Lite | no disponible | no disponible | Modelo comercial de proposito general | propietaria | API |

La comparacion con Gemini 3.1 Flash-Lite procede de la evaluacion del propio autor con el mismo conjunto de prompts: el modelo ajustado obtiene un 95,7% de frases validas frente al 99,7% del modelo comercial, pero se ejecuta en local y con licencia permisiva. Frente a su modelo base, la diferencia es la especializacion: el ajuste garantiza el formato JSON y las restricciones de longitud y aparicion del termino, algo que el modelo base no asegura sin ajuste.

## Limitaciones y advertencias

- Solo genera en ingles; no soporta otros idiomas.
- El vocabulario esta fuertemente sesgado hacia terminos israelies (hebreo romanizado, yiddish, nombres y lugares), lo que puede reducir la calidad con terminos de otros dominios.
- Gran parte de los datos de entrenamiento fue generada por LLM (Claude, Gemini, DeepSeek), con el riesgo de sesgos y artefactos heredados de esos modelos.
- No esta verificado para exactitud factual: produce frases plausibles, no necesariamente verdaderas. No debe usarse como fuente de hechos.
- La comprobacion de calidad publicada (gate) evalua la forma (longitud, aparicion del termino, caracteres permitidos), no el significado ni la adecuacion semantica de la frase.
- Tasa de fallo relevante: un 27,2% de las llamadas no obtiene las n frases validas al primer intento. El autor recomienda pedir n + 2 y quedarse con las n primeras que pasen las comprobaciones propias.
- El prompt de sistema debe usarse exactamente como se especifica; desviarse de el puede degradar el cumplimiento del formato.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre posibles sesgos recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielrosehill/Contextual-Sentence-Creator
- Version GGUF: https://huggingface.co/danielrosehill/Contextual-Sentence-Creator-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/danielrosehill/term-context-sentences
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
