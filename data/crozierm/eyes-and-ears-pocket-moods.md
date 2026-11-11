# crozierm/eyes-and-ears-pocket-moods

## Resumen

Pocket TTS 100M Moods (English) es un ajuste fino (fine-tune) del modelo de síntesis de voz Pocket TTS de Kyutai, publicado por el usuario crozierm bajo el identificador `crozierm/eyes-and-ears-pocket-moods`. El modelo parte de los pesos `english_2026-10` de `kyutai/pocket-tts` y se ha entrenado para la aplicación de lectura Eyes & Ears en iOS, incorporando dos capacidades especificas: la interpretacion de estados emocionales (moods) mediante marcadores de control como angry, sad o whispering, y el enfasis de palabras tras una etiqueta `<emph>`.

El modelo se distribuye convertido a Core ML, lo que permite su ejecucion en el Neural Engine de dispositivos Apple. Segun la model card, la conversion sigue el mismo procedimiento que el repositorio `crozierm/eyes-and-ears-pocket`, con grafos especificos para el Neural Engine (`flowlm_step_ane`, `cond_prefill_ane`), decodificadores de flujo fusionados a 1 y 2 pasos LSD, el decodificador Mimi en fp32 con su estado inicial de streaming y el codificador de clonacion de voz `mimi_encoderv2` con entrada fija de 10 segundos.

Se trata de un modelo pequeno (el nombre indica 100M parametros) orientado a sintesis de voz en ingles sobre hardware Apple. Su relevancia es limitada por el momento: no tiene descargas ni likes en Hugging Face, y su utilidad practica esta acotada a la aplicacion concreta para la que fue entrenado. El repositorio ocupa 0,4 GB y se publico el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de kyutai/pocket-tts; grafos Core ML con flowlm y decodificador Mimi) |
| Parametros totales | 100M (segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada de audio fija de 10 s para el codificador de clonacion de voz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (.mlpackage / .mlmodelc) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `kyutai/pocket-tts`, mas alla de que se trata de un sistema de sintesis de voz (TTS) con un codificador de voz Mimi (`mimi_encoderv2`) y un decodificador Mimi en fp32, junto con un componente denominado flowlm que opera como grafo de paso en el Neural Engine (`flowlm_step_ane`). La conversion a Core ML incluye decodificadores de flujo fusionados a 1 y 2 pasos LSD (latent score distillation, segun la abreviatura empleada en la model card) y un grafo de prefilling condicional (`cond_prefill_ane`).

El entrenamiento del ajuste fino se realizo sobre el codigo de entrenamiento de Kyutai mediante un parche propio (`ios/tools/pocket-train`), en lo que la model card identifica como "run 6, emphasis". El objetivo del ajuste fue incorporar la capacidad de interpretar marcadores de estado emocional (moods) y de enfatizar palabras tras un marcador `<emph>`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Sintesis de voz en ingles (text-to-speech) sobre el modelo base Pocket TTS.
- Control de estado emocional mediante marcadores (moods): angry, sad, whispering, entre otros.
- Enfasis de palabras individuales tras un marcador `<emph>`.
- Clonacion de voz mediante el codificador `mimi_encoderv2` con entrada fija de 10 segundos.
- Ejecucion en el Neural Engine de dispositivos Apple gracias a la conversion Core ML.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes.

## Casos de uso

- Lectura de libros electronicos en iOS con entonacion variable: el modelo permite aplicar estados emocionales a diferentes pasajes de un texto, lo que resulta util en la aplicacion Eyes & Ears para la que fue entrenado.
- Audiolibros con interpretacion emocional: un pipeline podria insertar marcadores de mood en funcion del contenido narrativo para modular la entrega de la voz.
- Enfasis de terminos clave en contenido educativo: el marcador `<emph>` permite destacar palabras concretas en materiales de aprendizaje o divulgacion.
- Accesibilidad para personas con discapacidad visual: integrado en un lector de iOS, ofrece una voz sintetica con matices emocionales que mejora la comprension del texto.
- Prototipado de asistentes de voz locales: al ejecutarse en el Neural Engine, permite generar voz sin enviar datos a servidores externos.
- Clonacion de voz con consentimiento para proyectos personales: el codificador `mimi_encoderv2` admite entradas de 10 segundos para adaptar la voz del sintetizador a un locutor concreto.
- Generacion de voz para narrativas interactivas o videojuegos en dispositivos Apple: los marcadores de mood permiten variar la entrega segun el estado del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo esta convertido a Core ML y disenado para ejecutarse en el Neural Engine de dispositivos Apple (iPhone, iPad, Mac con Apple Silicon).
- El repositorio ocupa 0,4 GB, lo que sugiere un modelo ligero adecuado para hardware de consumo Apple.
- No se dispone de datos sobre VRAM, GPU recomendadas, latencia ni throughput.
- Opciones de despliegue: Core ML en plataformas Apple; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es Core ML y la tarea es TTS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| crozierm/eyes-and-ears-pocket-moods | 100M | no disponible | en | CC-BY-4.0 | Core ML |
| kyutai/pocket-tts (base) | no disponible | no disponible | en (pesos `english_2026-10`) | no disponible en la informacion proporcionada | no disponible |
| crozierm/eyes-and-ears-pocket | no disponible | no disponible | en | no disponible en la informacion proporcionada | Core ML |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento ni de otros sistemas TTS comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan otros idiomas.
- El modelo esta orientado a una aplicacion concreta (Eyes & Ears en iOS) y su utilidad fuera de ese contexto es limitada.
- No se han publicado datos de benchmarks, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- Riesgo de uso indebido en clonacion de voz: la propia model card advierte de no clonar voces sin consentimiento ni suplantar a personas reales.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero los pesos originales pertenecen a Kyutai y el ajuste fino a Eyes & Ears; es necesario respetar la atribucion correspondiente.
- No se documentan sesgos especificos ni tasas de alucinacion (en TTS, errores de pronunciacion o entonacion).
- El formato Core ML restringe el despliegue a plataformas Apple; no es directamente utilizable en servidores Linux con GPUs convencionales.
- El modelo tiene cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/crozierm/eyes-and-ears-pocket-moods
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Repositorio de referencia de conversion: https://huggingface.co/crozierm/eyes-and-ears-pocket
