# Mouserat/titlerat2-qat4

## Resumen

Titlerat2-qat4 es un modelo de generacion de titulos (title generation) desarrollado por el usuario Mouserat, obtenido mediante fine-tuning de google/mt5-small con cuantizacion consciente del entrenamiento (QAT) a 4 bits. Su proposito es generar titulos cortos en forma de frase nominal a partir de un par solicitud-respuesta de una conversacion, para poblar listados de historial de chat o resumir el tema de una peticion. No genera respuestas: su salida es exclusivamente un titulo.

El modelo cubre cinco variantes linguisticas: japones, ingles, coreano, chino simplificado y chino tradicional. Se distribuye en dos subcarpetas: `before_quantization/` (pesos QAT4 almacenados en FP32, cargables con `from_pretrained()`) y `after_quantization/` (pesos empaquetados en enteros de 4 bits que requieren un procedimiento de desempaquetado especifico, no cargable directamente con Transformers).

Es relevante por su enfoque poco habitual: aplica QAT sobre un modelo T5 pequeno para produccion en entornos con recursos limitados, con un repositorio de 2,0 GB que incluye ambas variantes. La model card es transparente sobre las limitaciones (repeticiones, errores ortograficos, bajo rendimiento en chino tradicional) y declara que no se ha realizado evaluacion de inferencia sobre esta configuracion concreta de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), base google/mt5-small |
| Parametros totales | no disponible (mt5-small tiene aproximadamente 300M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAT a 4 bits (version empaquetada en enteros de 4 bits); version FP32 de los pesos QAT4 |
| Idiomas soportados | ja, en, ko, zh_Hans, zh_Hant |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 en `before_quantization/`; enteros de 4 bits empaquetados en `after_quantization/`) |

## Arquitectura y entrenamiento

El modelo parte de google/mt5-small, un transformer encoder-decoder de la familia T5 multilingue. Sobre esa base se aplico un fine-tuning supervisado para la tarea de generacion de titulos, con un esquema de cuantizacion consciente del entrenamiento (QAT) a 4 bits. La entrada se estructura con tokens especiales anadidos (`<user>`, `</user>`, `<assistant>`, `</assistant>`) que delimitan la solicitud y la respuesta; el modelo debe producir una frase nominal corta que resuma el tema. Si la solicitud va vacia, devuelve una salida vacia.

El conjunto de entrenamiento consta de 85.672 ejemplos. El desglose por idioma es: 37.319 para ja/en combinados (procedentes de SFT-General-Japanese-60K, tagengo-gpt4, shisa-v2-sharegpt, ShareGPT-Processed, 433 ejemplos de rechazo sinteticos y 22 dialogos de animales de elaboracion propia), 150 de entrada vacia sintetica, 19.298 de coreano (KoAlpaca-v1.1, EverythingLM-V2-Ko, korean-writing-style-instruct), 18.224 de chino simplificado (smoltalk-chinese), 7.866 de chino tradicional (aya_collection_language_split, Traditional_Chinese-aya_dataset) y 2.815 de ingles adicional (aya_dataset, aya_collection_language_split). Se excluyeron articulos de prensa copiados, instrucciones plantilla sinteticas y filas descartadas por juicio humano. Parte de los titulos de referencia fueron generados con Qwen/Qwen3.5-4B. No se detalla el numero de tokens de entrenamiento ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de titulos cortos en forma de frase nominal para pares solicitud-respuesta.
- Procesamiento multilingue en japones, ingles, coreano, chino simplificado y chino tradicional.
- Manejo de solicitudes sin respuesta asociada (campo `<assistant>` vacio) devolviendo salida vacia cuando la solicitud tambien lo esta.
- Delimitacion explicita de roles mediante tokens especiales anadidos al tokenizer del repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No genera respuestas conversacionales, solo titulos.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Titulado automatico de historiales de chat: el modelo recibe el primer par solicitud-respuesta de una conversacion y devuelve un titulo breve para el listado de hilos, integrandose en la capa de interfaz del cliente de chat.
- Resumen de tema en bandejas de soporte: a partir de la consulta inicial del usuario y la respuesta del agente, se genera una etiqueta corta que permite clasificar y priorizar tickets sin intervencion humana.
- Organizacion de conversaciones multilingues: al cubrir ja, en, ko y zh, un mismo backend puede titular hilos de usuarios de distintas regiones sin desplegar modelos separados por idioma.
- Etiquetado de datasets de dialogo: el modelo puede pre-anotar pares solicitud-respuesta con un titulo tematico para facilitar la revision y el filtrado posterior por parte de anotadores.
- Indexacion de transcripciones en herramientas internas: en asistentes corporativos con historial largo, el titulo generado sirve como clave de busqueda semantica o textual sobre conversaciones archivadas.
- Generacion de asuntos en clientes de correo o mensajeria: dado un intercambio breve, el modelo propone un asunto nominal, adecuado para borradores en japones o coreano donde el estilo de asunto es conciso.
- Prototipado en entornos con GPU de consumo: gracias a la variante QAT4 de 4 bits y al tamano reducido de la base, puede ejecutarse en portatiles o GPUs modestas para pruebas de concepto de titulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha realizado evaluacion de inferencia sobre esta configuracion de pesos y que no se reutilizan cifras de la version completa ni de otras cuantizaciones. El unico dato de rendimiento mencionado es una tasa de acierto (OK) del 90% para chino tradicional, inferior a la de los demas idiomas por menor volumen de datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con una base mt5-small y pesos QAT4 empaquetados, la huella deberia ser muy reducida, pero no se aporta cifra concreta.
- GPU recomendadas: no disponible. Por el tamano de la base, cualquier GPU consumer moderna deberia ser suficiente, aunque no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: probable por el tamano de la base y la cuantizacion a 4 bits, sin confirmacion oficial.
- Opciones de despliegue: la version `before_quantization/` se carga con `from_pretrained()` de Transformers. La version `after_quantization/` requiere el procedimiento de desempaquetado descrito en su README y no es cargable directamente con Transformers. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Mouserat/titlerat2-qat4 | no disponible (base mt5-small) | no disponible | ja, en, ko, zh_Hans, zh_Hant | Apache-2.0 | Especializado en titulos, QAT 4 bits |
| google/mt5-small | no disponible | no disponible | multilingue (amplio) | Apache-2.0 | Modelo base, no especializado en titulos |
| Alternativas especializadas en titulado | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la busqueda |

No se dispone de datos de rendimiento comparativo entre titlerat2-qat4 y otros modelos de titulado, por lo que la comparativa se limita a aspectos de licencia, idiomas y especializacion.

## Limitaciones y advertencias

- Puede generar repeticiones de la misma palabra o frase (por ejemplo, "significado y significado"); se sugiere usar `no_repeat_ngram_size` en la generacion, aunque no se ha evaluado ese ajuste.
- Produce errores ortograficos y de caracteres con cierta frecuencia.
- Tiende a generar titulos demasiado genericos (por ejemplo, "resolucion de problemas").
- El rendimiento en chino tradicional es inferior al resto (OK del 90%) por menor volumen de datos.
- En solicitudes largas aumenta la confusion sobre el tema respecto a solicitudes cortas; las solicitudes largas en ingles rinden peor que las largas en japones.
- En temas daninos, el titulo puede incluir el nombre del tema (por ejemplo, "como fabricar polvora"), lo que exige filtrado posterior en produccion.
- Los caracteres desconocidos (`<unk>`) se eliminaron del entrenamiento; solicitudes con muchos caracteres desconocidos pueden degradar la calidad.
- No debe usarse para generar respuestas, evaluar seguridad ni emitir juicios de rechazo: esas funciones corresponden al modelo conversacional.
- No garantiza la veracidad del titulo; es una sintesis, no una afirmacion factual.
- La version `after_quantization/` no es cargable con `from_pretrained()` estandar y requiere desempaquetado manual.
- La licencia del modelo y del codigo es Apache-2.0, pero la model card advierte que las condiciones de uso de cada dataset de entrenamiento deben verificarse antes de su publicacion.
- No se ha evaluado la inferencia sobre esta configuracion concreta de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mouserat/titlerat2-qat4
- Notebook Colab (antes de cuantizacion): https://colab.research.google.com/#fileId=https://huggingface.co/Mouserat/titlerat2-qat4/blob/main/before_quantization/titlerat_v1_colab.ipynb
- Notebook Colab (despues de cuantizacion): https://colab.research.google.com/#fileId=https://huggingface.co/Mouserat/titlerat2-qat4/blob/main/after_quantization/titlerat_v1_colab.ipynb
- Modelo base google/mt5-small: https://huggingface.co/google/mt5-small
- Referencia de generacion de titulos Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
