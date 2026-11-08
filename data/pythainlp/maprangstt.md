# pythainlp/MaprangSTT

## Resumen

MaprangSTT es un modelo publicado en Hugging Face por el equipo de PyThaiNLP, la comunidad de referencia para el procesamiento del lenguaje natural en tailandés. Por su identificador y por el contexto del proyecto, se trata de un modelo orientado a reconocimiento automático del habla (STT, *speech-to-text*) para tailandés, aunque la model card pública no expone arquitectura, tamaño ni datos de entrenamiento.

La relevancia del modelo radica en su origen: PyThaiNLP mantiene un ecosistema consolidado de herramientas para tailandés (tokenización, normalización, transliteración, modelos lingüísticos), y un componente de voz encaja en esa línea para aplicaciones de transcripción y asistentes en dicho idioma. No obstante, la información disponible es mínima: el repositorio tiene un tamaño de 0,1 GB, no registra descargas ni interacciones, y el acceso está restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de poder descargar los pesos.

Dado que no se han publicado especificaciones técnicas, resultados de benchmarks ni detalles de entrenamiento en la información accesible, esta ficha recoge únicamente los datos verificables y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el proyecto, presumiblemente tailandés; sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | no disponible |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. El identificador "STT" sugiere un sistema de reconocimiento del habla, pero se desconoce si emplea un encoder convolucional o transformer, un decoder autoregresivo, un esquema CTC, un modelo tipo Whisper o una arquitectura híbrida. Tampoco consta el número de parámetros ni el formato de los pesos, aunque el tamaño del repositorio (0,1 GB) es compatible con un modelo compacto o con pesos cuantizados.

Respecto al entrenamiento, no hay datos sobre el volumen de audio utilizado, la composición del corpus (lectura, conversacional, ruido de fondo, acentos regionales), el tipo de etiquetas (transcripción literal, normalizada) ni si se aplicaron técnicas de ajuste fino supervisado o aumentación de datos. Toda esta información debería figurar en la model card del repositorio una vez aceptado el acceso restringido.

## Capacidades

- Reconocimiento automático del habla (STT): capacidad inferida del propio nombre del modelo; no confirmada en la documentación pública.
- Transcripción de audio en tailandés: presumible por el contexto del proyecto PyThaiNLP; sin confirmar oficialmente.
- Generación de texto: no disponible.
- Razonamiento, código o matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio adicional): no disponible.
- Modo *thinking*: no disponible.

## Casos de uso

- Transcripción de reuniones y entrevistas en tailandés: un modelo STT del ecosistema PyThaiNLP encajaría en pipelines de diarización y actas automáticas para equipos que operan en Tailandia; requiere validar antes la calidad real del modelo.
- Subtitulado automático de contenido audiovisual: generación de subtítulos en tailandés para vídeo corporativo o educativo, con revisión humana posterior dado el riesgo de errores en nombres propios y terminología.
- Atención al cliente por voz: conversión de llamadas a texto para análisis de sentimiento, control de calidad y búsqueda sobre el histórico, aprovechando el soporte del idioma local.
- Documentación clínica dictada: transcripción de notas médicas en tailandés para reducir el trabajo administrativo, siempre con validación por parte del personal sanitario.
- Accesibilidad: subtitulado en tiempo real o diferido para personas con discapacidad auditiva en entornos de habla tailandesa.
- Investigación lingüística y creación de corpus: generación de transcripciones a escala para estudios de fonética, dialectología o entrenamiento de otros modelos del ecosistema PyThaiNLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,1 GB) sugiere un modelo ligero que probablemente quepa en GPU de consumo, pero no puede confirmarse sin conocer la arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es plausible, pero debe verificarse.
- Opciones de despliegue: no disponible (no consta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni frameworks de audio como Whisper.cpp o NeMo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar modelos comparables con datos verificables de parámetros, contexto o rendimiento para este modelo.

## Limitaciones y advertencias

- Ausencia total de documentación técnica pública: no hay model card con arquitectura, datos de entrenamiento ni evaluación, lo que impide valorar su idoneidad para producción.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede retrasar la integración.
- Cero descargas y cero interacciones registradas: no existe evidencia de uso comunitario ni de validación externa.
- Riesgo de alucinación y errores de transcripción: en sistemas STT se traduce en palabras inventadas, omisiones o confusiones con ruido, acentos y nombres propios; sin benchmarks no puede acotarse el riesgo.
- Idiomas soportados sin confirmar: aunque el proyecto es de ámbito tailandés, no se garantiza el comportamiento en otros idiomas ni en code-switching.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones adicionales del acceso gated y las licencias de los datos de entrenamiento, que no se detallan.
- Sesgos desconocidos: al no publicarse la composición del corpus, no puede evaluarse el sesgo por dialecto, género, edad o registro.
- Fecha de creación futura en los metadatos (2026): conviene verificar la vigencia y el estado real del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pythainlp/MaprangSTT
- Sitio oficial de PyThaiNLP: https://pythainlp.org/
