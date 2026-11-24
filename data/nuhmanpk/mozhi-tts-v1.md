# nuhmanpk/mozhi-tts-v1

## Resumen

Mozhi TTS v1 es un modelo de síntesis de voz (text-to-speech) especializado en malabar (malayalam) y manglish (malabar escrito con alfabeto latino), desarrollado por el usuario nuhmanpk. Se trata de un fine-tuning del modelo ai4bharat/indic-parler-tts, que a su vez deriva de la familia Parler-TTS, una arquitectura de generación de audio basada en transformers condicionada por descripciones textuales del estilo de voz. El modelo resuelve el problema de generar voz expresiva y emocional en una lengua de bajos recursos como el malabar, para la que existen pocos sistemas TTS de calidad.

Con aproximadamente 938 millones de parámetros y un repositorio de 3,8 GB, el modelo se distribuye en formato safetensors y es compatible con la librería transformers mediante el pipeline text-to-speech. Su relevancia actual radica en que aborda una lengua dravídica hablada por decenas de millones de personas con un enfoque en expresividad y emoción, algo poco habitual en modelos TTS multilingües de gran escala, que suelen priorizar idiomas con muchos más recursos.

El acceso al modelo está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo. La licencia es CC-BY-SA 4.0, lo que implica obligaciones de atribución y de compartir bajo la misma licencia las obras derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parler-TTS (transformer autorregresivo de generación de audio condicionado por texto), fine-tuning de ai4bharat/indic-parler-tts |
| Parametros totales | 937.817.577 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | malabar (ml); manglish como variante de entrada |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ai4bharat/indic-parler-tts, un modelo de la familia Parler-TTS que genera audio mediante un transformer autorregresivo que predice tokens de audio a partir de texto y de una descripción textual del estilo de voz (por ejemplo, tono, velocidad o emoción). El fine-tuning se ha realizado sobre el dataset nuhmanpk/mozhi-malayalam-speech, complementado con ai4bharat/Rasa, según los metadatos del repositorio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es la adaptación de un modelo TTS indic de propósito general a una única lengua dravídica con énfasis en expresividad y emoción, incluyendo la capacidad de procesar manglish (malabar transliterado al alfabeto latino). No se dispone de detalles sobre técnicas de decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en malabar a partir de texto de entrada.
- Procesamiento de manglish, es decir, malabar escrito con caracteres latinos.
- Generación de voz expresiva y emocional (el repositorio lo etiqueta como emotional-tts y expressive).
- Condicionamiento por descripción textual del estilo de voz, heredado de la arquitectura Parler-TTS.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües limitadas al malabar y manglish; no se indica soporte de otros idiomas.
- No se documenta soporte de visión ni de audio de entrada (es un modelo exclusivamente de síntesis).

## Casos de uso

- Audiolibros y narración en malabar: el modelo puede convertir texto literario en voz con control de estilo, adecuado para producir audiolibros con entonación expresiva.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de contenido web o documentos en malabar, aprovechando que el modelo está especializado en esa lengua.
- Asistentes de voz locales: integración en aplicaciones de asistencia por voz para usuarios malabarófonos, con respuestas sintetizadas de forma natural.
- Localización de contenido multimedia: doblaje o generación de voces en off para vídeos y cursos en malabar, con variedad de estilos emocionales.
- Sistemas de atención al cliente: síntesis de respuestas habladas en malabar en IVR o chatbots de voz, aunque requeriría integrarse con un LLM para la parte conversacional.
- Investigación en TTS de bajos recursos: servir como punto de partida para fine-tunings en otras lenguas dravídicas o para estudios sobre expresividad en malabar.
- Generación de voces para manglish: aplicaciones de mensajería o redes sociales donde el malabar se escribe en alfabeto latino, sin necesidad de transliterar previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 938 millones de parámetros en precisión fp32, el peso ronda los 3,8 GB; en fp16 o bf16, aproximadamente 1,9 GB, más el coste de memoria del decodificador de audio y del vocoder asociado.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090, entre otras).
- Opciones de despliegue: transformers (pipeline text-to-speech), dado que el repositorio usa la librería transformers. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| nuhmanpk/mozhi-tts-v1 | 937,8 M | no disponible | malabar, manglish | cc-by-sa-4.0 | gated |
| ai4bharat/indic-parler-tts | no disponible | no disponible | lenguas indic | no disponible | no disponible |
| Parler-TTS (familia base) | no disponible | no disponible | ingles principalmente | no disponible | no disponible |

La comparación con alternativas específicas para malabar no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un dataset concreto, puede reflejar sesgos de habla, género o registro de ese corpus.
- Riesgo de alucinación: en TTS, el riesgo se traduce en pronunciaciones incorrectas, prosodia anómala o artefactos de audio en entradas fuera de distribución.
- Limitaciones de contexto o idioma: el modelo está especializado en malabar y manglish; no se garantiza un comportamiento correcto en otras lenguas.
- Restricciones de licencia: CC-BY-SA 4.0 exige atribución y que las obras derivadas se distribuyan bajo la misma licencia, lo que puede condicionar su uso comercial.
- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de la descarga, lo que añade un paso previo en cualquier pipeline automatizado.
- Caveat para producción: no se dispone de datos de benchmarks ni de latencia, por lo que conviene evaluar la calidad de síntesis y el rendimiento antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nuhmanpk/mozhi-tts-v1
- Modelo base: https://huggingface.co/ai4bharat/indic-parler-tts
- Dataset de entrenamiento: https://huggingface.co/datasets/nuhmanpk/mozhi-malayalam-speech
- Dataset complementario: https://huggingface.co/datasets/ai4bharat/Rasa
