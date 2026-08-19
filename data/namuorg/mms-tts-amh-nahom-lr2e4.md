# Namuorg/mms-tts-amh-nahom-lr2e4

## Resumen

Namuorg/mms-tts-amh-nahom-lr2e4 es un modelo de síntesis de voz (text-to-speech) en amhárico, desarrollado por Namuorg como parte de un proyecto de fine-tuning sobre el modelo base `facebook/mms-tts-amh` de Meta AI. El modelo pertenece a la familia VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) y está diseñado para generar audio hablado a partir de texto en amhárico, el idioma oficial de Etiopía.

El modelo se ha ajustado sobre un corpus limpio de un solo hablante, con el objetivo de mejorar la naturalidad y la calidad de la voz respecto al modelo base, que ya hablaba amhárico pero con una calidad limitada. Con solo 36,2 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto, incluyendo GPUs de gama baja como una T4. El nombre del checkpoint sugiere un learning rate de 2e-4 y una voz asociada al hablante "Nahom".

Su relevancia radica en que ofrece una alternativa de código abierto y ajustable para la generación de voz en un idioma de bajos recursos como el amhárico, donde las opciones comerciales son escasas. El proyecto documenta un proceso de fine-tuning reproducible en unos 20-25 minutos en una T4 gratuita, lo que lo hace accesible para desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) |
| Parametros totales | 36.282.672 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32) |
| Idiomas soportados | Amharico (amh) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un codificador de texto, un decodificador de audio y un discriminador adversarial, entrenado de forma conjunta mediante inferencia variacional. El checkpoint es un fine-tuning del modelo `facebook/mms-tts-amh`, que originalmente tiene 83 millones de parametros; el presente modelo reduce esa cifra a 36,2 millones, probablemente mediante una poda o una configuracion mas pequena, aunque no se documenta explicitamente.

El entrenamiento se realizo sobre un corpus limpio de un solo hablante en amharico, utilizando la herramienta `ylacombe/finetune-hf-vits`. El repositorio del proyecto indica que una ejecucion de fine-tuning tarda entre 20 y 25 minutos en una GPU T4 gratuita, y que el modelo base ya hablaba amharico pero con baja calidad. El nombre del checkpoint (`lr2e4`) sugiere una tasa de aprendizaje de 2e-4, aunque no se detallan otros hiperparametros ni la composicion exacta del dataset de entrenamiento.

## Capacidades

- Sintesis de voz en amharico a partir de texto, produciendo audio en formato de onda (generalmente WAV).
- Generacion de habla de un solo hablante (voz masculina, segun el nombre "Nahom").
- Inferencia rapida gracias al tamano reducido del modelo (36,2 M de parametros).
- Compatible con la libreria `transformers` de Hugging Face, lo que facilita su integracion en pipelines de text-to-audio.
- No incluye capacidades de vision, tool calling ni razonamiento multi-paso; es un modelo puramente generativo de audio.

## Casos de uso

- Audiolibros y narracion en amharico: el modelo puede convertir textos literarios o educativos en voz, permitiendo la creacion de contenido accesible para personas con discapacidad visual o para el consumo en movilidad.
- Asistentes de voz en aplicaciones locales: integrable en chatbots o asistentes virtuales que necesiten responder en amharico, generando respuestas habladas a partir de texto generado por un LLM.
- Sistemas de lectura en voz alta (TTS) para accesibilidad web: puede incorporarse en navegadores o extensiones para leer paginas web en amharico, mejorando la experiencia de usuarios con dificultades de lectura.
- Educacion y aprendizaje de idiomas: utilizado en aplicaciones de ensenanza del amharico, proporcionando ejemplos de pronunciacion natural.
- Contenido multimedia automatizado: generacion de locuciones para videos, podcasts o anuncios en amharico sin necesidad de actores de voz.
- Prototipado de productos de voz: dado su bajo coste de entrenamiento, sirve para validar rapidamente conceptos de productos de voz en amharico antes de invertir en modelos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas objetivas de calidad de voz (como MOS, WER o SIM) en la model card ni en el repositorio del proyecto.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 36 M de parametros, la inferencia puede ejecutarse en CPU con unos 150 MB de RAM, y en GPU con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo T4, RTX 2060 o superiores. Tambien funciona en CPU para inferencia por lotes pequenos.
- Es adecuado para hardware de consumo: si, cabe en una Raspberry Pi 4 o similar para inferencia en tiempo real.
- Opciones de despliegue: se puede cargar con `transformers` (pipeline `text-to-audio`), o exportar a ONNX para inferencia en entornos ligeros. No se documenta soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una latencia inferior a 1 segundo por frase en GPU y de 2-5 segundos en CPU, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Namuorg/mms-tts-amh-nahom-lr2e4 | 36,2 M | Amharico | VITS | no disponible | Hugging Face |
| facebook/mms-tts-amh (base) | 83 M | Amharico | VITS | CC-BY-NC 4.0 (segun el repositorio base) | Hugging Face |
| Coqui TTS (modelos multilingues) | variable | varios | Tacotron/GlowTTS | MPL-2.0 | GitHub |

La comparativa se limita al modelo base de Meta y a alternativas generalistas, ya que no existen muchos modelos TTS especificos para amharico publicados abiertamente. El modelo de Namuorg es mas ligero que el base, lo que facilita su despliegue, aunque a costa de una posible reduccion de calidad no cuantificada.

## Limitaciones y advertencias

- Sesgos y limitaciones de hablante: al estar entrenado sobre un unico hablante, la voz generada es fija y puede no representar la diversidad de acentos o tonos del amharico.
- Riesgo de alucinacion: en TTS, el riesgo se traduce en errores de pronunciacion o de entonacion en palabras poco frecuentes o nombres propios, especialmente si el corpus de entrenamiento era pequeno.
- Calidad no evaluada: no hay benchmarks publicos que permitan comparar su naturalidad o inteligibilidad con otros sistemas.
- Licencia incierta: la model card no especifica la licencia, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de usarlo en produccion.
- Contexto limitado: al ser un modelo de audio, no procesa texto largo de una sola vez; la entrada se limita a frases o parrafos cortos, y la generacion de textos largos requiere segmentacion.
- Dependencia del modelo base: su rendimiento esta condicionado por las limitaciones del `facebook/mms-tts-amh`, que ya presentaba una calidad deficiente en amharico segun el propio repositorio del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Namuorg/mms-tts-amh-nahom-lr2e4
- Repositorio del proyecto (GitHub): https://github.com/Namuai-org/namu-tts-amharic-tts-internship
- Modelo base facebook/mms-tts-amh: https://huggingface.co/facebook/mms-tts-amh
- Pagina general de facebook/mms-tts: https://huggingface.co/facebook/mms-tts
- Herramienta de fine-tuning ylacombe/finetune-hf-vits: (referenciada en el repositorio, sin enlace directo en la informacion proporcionada)
