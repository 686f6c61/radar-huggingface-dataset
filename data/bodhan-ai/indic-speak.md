# bodhan-ai/indic-speak

## Resumen

`bodhan-ai/indic-speak` es un modelo de sintesis de voz (text-to-speech) desarrollado por Bodhan AI, basado en un fine-tuning de `meta-llama/Llama-3.2-3B`. Esta orientado a la generacion de audio en lenguas indias y en ingles, con soporte de code-switching y code-mixing, es decir, la capacidad de alternar o mezclar idiomas dentro de una misma frase. El modelo tiene 3.300.928.512 parametros (3.300 millones) y se distribuye en formato safetensors.

El objetivo principal es cubrir la necesidad de sintesis de voz de calidad en lenguas indias, un area con poca cobertura en los modelos comerciales. Los tags del repositorio indican aplicaciones en educacion y ambitos STEM, lo que sugiere que el modelo esta pensado para generar narraciones de contenido cientifico, tecnologico, de ingenieria y matematicas en multiples idiomas. El acceso al modelo es restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-3B fine-tuned) |
| Parametros totales | 3.300.928.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No especificado |
| Idiomas soportados | en, hi, bn, mr, te, ta, gu, kn, ml, or, pa, as, ur, brx, doi, kok, ks, mai, ne, mni, sa, sat, sd |
| Licencia | Other (licencia personalizada, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama-3.2-3B, un transformer decoder-only de 3.300 millones de parametros, y se ha adaptado mediante fine-tuning para la tarea de text-to-speech. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. La innovacion mas destacable es el soporte de code-switching y code-mixing entre ingles y lenguas indias, lo que permite generar voz natural en contextos donde los hablantes mezclan idiomas de forma habitual. Tampoco se especifica la longitud de contexto tras el fine-tuning.

## Capacidades

- Generacion de voz (text-to-speech) en 23 idiomas, incluyendo lenguas indias como hindi, bengali, marathi, telugu, tamil, gujarati, kannada, malayalam, oriya, punjabi, asames, urdu, y otras.
- Soporte de code-switching y code-mixing: capacidad de alternar entre ingles y una lengua india dentro de la misma frase.
- Orientado a contenido educativo y STEM: los tags del repositorio indican aplicaciones en ciencia, tecnologia, ingenieria y matematicas.
- No se menciona soporte de tool calling, function calling, ni capacidades de razonamiento multi-step propias de un modelo de lenguaje generico.
- No se indican capacidades de vision ni de audio de entrada; el pipeline es exclusivamente text-to-speech.

## Casos de uso

- Plataformas educativas: el modelo puede narrar lecciones de matematicas o ciencias en lenguas indias, con terminologia en ingles cuando sea necesario. Es adecuado porque combina code-mixing y vocabulario STEM.
- Accesibilidad: lectura de pantalla para usuarios con discapacidad visual que hablan lenguas indias. El modelo permite generar audio natural en su lengua materna, mejorando la accesibilidad a contenidos digitales.
- Atencion al cliente automatizada: asistentes de voz en servicios de banca o telecomunicaciones que atienden a usuarios en zonas rurales de India. El code-switching permite responder en la mezcla de idiomas que el usuario emplea.
- Contenido audiovisual: doblaje o narracion de videos educativos en multiples idiomas indios. El modelo reduce el coste de produccion de audio multilingue.
- Salud y gobernanza: difusion de mensajes de salud publica o informacion gubernamental en lenguas regionales. La cobertura de 23 idiomas permite llegar a poblaciones con bajo acceso a contenido en ingles.
- Aprendizaje de idiomas: generacion de ejemplos de pronunciacion en ingles y en lenguas indias, util para aplicaciones de practica oral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP16/BF16 ocupan aproximadamente 6,6 GB. Con overhead de activaciones y cache, se recomienda al menos 12 GB de VRAM. En cuantizacion 4-bit (si se genera) la ocupacion podria reducirse a unos 2-3 GB, pero no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: NVIDIA A100, H100 para despliegue en produccion; en GPUs de consumo, una RTX 4070 o superior seria adecuada para inferencia local.
- Compatibilidad con GPUs de consumo: si, en tarjetas con 12 GB o mas de VRAM.
- Opciones de despliegue: Transformers (via la libreria de HuggingFace). No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama, ya que el modelo es de tipo text-to-speech y no se han publicado conversiones a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado datos de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar el modelo.
- Licencia "other": no es una licencia estandar y puede imponer restricciones de uso comercial. Conviene revisar las condiciones antes de usar el modelo en produccion.
- Ausencia de benchmarks publicos: no hay datos objetivos de calidad de voz, naturalidad o precision en la generacion de audio.
- Longitud de contexto no especificada: se desconoce el limite de texto de entrada que el modelo puede procesar en una sola inferencia.
- Posibles sesgos en las voces y acentos: al estar entrenado en datos de lenguas indias, la calidad puede variar entre idiomas y regiones.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF ni cuantizadas, lo que puede dificultar su despliegue en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bodhan-ai/indic-speak
- Noticia sobre modelos de voz de Bodhan AI y AI4Bharat (contexto): https://analyticsindiamag.com/ai-news/ai4bharat-bodhan-ai-build-12-bn-parameter-speech-model-for-26-indian-languages
