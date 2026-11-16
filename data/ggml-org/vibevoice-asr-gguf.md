# ggml-org/VibeVoice-ASR-GGUF

## Resumen

VibeVoice-ASR-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla (ASR) VibeVoice-ASR-HF, desarrollado originalmente por Microsoft. Esta conversión la mantiene el equipo de ggml-org, responsables de llama.cpp, y está pensada para su ejecución directa en el ecosistema de inferencia local de llama.cpp y su aplicación Llama. El modelo resuelve el problema de la transcripción de voz a texto en entornos locales, sin depender de servicios en la nube.

El modelo base cuenta con aproximadamente 7.610 millones de parámetros (7,6 B), lo que lo sitúa en la gama media-alta de los modelos ASR actuales y permite despliegues en hardware de consumo con las cuantizaciones adecuadas. La conversión a GGUF facilita su integración en pipelines de transcripción offline, aplicaciones de escritorio y servicios autoalojados.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo ASR de Microsoft en infraestructura propia mediante llama.cpp, con licencia MIT, aunque conviene tener en cuenta que se trata de una conversión automática y que el soporte ASR en llama.cpp se introdujo a través de un pull request específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; pesos en formato GGUF) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizado en GGUF (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Se trata de un modelo de reconocimiento automatico del habla (pipeline `automatic-speech-recognition`) con aproximadamente 7,6 mil millones de parametros, derivado de `microsoft/VibeVoice-ASR-HF`. La model card no especifica si emplea un transformer encoder-decoder clasico, un esquema de audio encoder acoplado a un decoder de lenguaje ni detalles sobre atencion, capas o dimensiones ocultas.

Tampoco se documentan en la informacion disponible los datos de entrenamiento (numero de horas de audio, composicion del corpus, idiomas), ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado. La conversion a GGUF la realiza automaticamente la herramienta `ggml-org/convert`, y el soporte de inferencia para este modelo se introdujo en llama.cpp mediante el pull request 32329, lo que implica la incorporacion de un grafo de computo especifico para procesar audio y generar transcripciones dentro del motor de llama.cpp.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text): transcribe audio a texto.
- Conversacional: la etiqueta `conversational` sugiere uso en dialogos o transcripcion de interacciones habladas.
- Ejecucion local en llama.cpp y en la aplicacion Llama, sin dependencia de API externa.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite exponerlo como servicio compatible con APIs de inferencia.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Tool calling, agentes, vision o audio generativo: no disponibles o no documentados para este modelo ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede procesar audio de conversaciones y generar transcripciones en local, lo que resulta adecuado para entornos con requisitos de privacidad donde no se desea enviar audio a servicios en la nube.
- Subtitulado de contenido audiovisual: integrado en un pipeline con extraccion de audio (por ejemplo, ffmpeg) y llama.cpp como motor de inferencia, permite generar subtitulos de forma automatizada.
- Atencion al cliente con analitica de llamadas: transcripcion de grabaciones de soporte telefonico para su posterior analisis, busqueda y clasificacion, ejecutandose en infraestructura propia.
- Aplicaciones de escritorio y asistentes personales: gracias al formato GGUF y a la aplicacion Llama, puede embeberse en herramientas de escritorio para dictado o comandos por voz.
- Investigacion en procesamiento del habla: sirve como referencia ejecutable localmente para comparar estrategias de cuantizacion y su impacto en la calidad de transcripcion.
- Servicios autoalojados de transcripcion: desplegado con `llama serve`, puede exponer un endpoint HTTP compatible para que otras aplicaciones envien audio y reciban texto.
- Documentacion clinica o legal dictada: transcripcion local de dictados en entornos regulados, donde la soberania del dato es un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 7,6 B de parametros, la inferencia en FP16 requeriria aproximadamente 15 GB solo para pesos; las cuantizaciones GGUF de 8 bits rondarian los 8 GB y las de 4 bits alrededor de 4-5 GB, aunque estas cifras son estimaciones basadas en el tamano del modelo y no en datos oficiales.
- El repositorio ocupa 30,3 GB, lo que sugiere que incluye varias variantes de cuantizacion; conviene descargar solo la variante necesaria.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar ejecucion comoda en GPUs con 16 GB o mas (RTX 4090, A100, H100) en cuantizaciones altas, y en GPUs de 8-12 GB con cuantizaciones de 4 bits, pero no hay confirmacion oficial.
- Despliegue: llama.cpp (`llama serve -hf ggml-org/VibeVoice-ASR-GGUF`) y la aplicacion Llama. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la informacion proporcionada para establecer una comparativa rigurosa. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| VibeVoice-ASR-GGUF | ~7,6 B | no disponible | MIT | GGUF |
| Whisper large-v3 (referencia de categoria) | ~1,55 B | 30 s por ventana (aprox.) | MIT | safetensors, GGUF via conversion |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible |

La comparativa con Whisper se ofrece solo como referencia de categoria; no se han verificado en esta ficha datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Se trata de una conversion automatica realizada con `ggml-org/convert`; la calidad puede diferir de la del modelo original y no hay garantia de paridad exacta.
- El soporte ASR en llama.cpp es relativamente reciente (pull request 32329), por lo que pueden aparecer incompatibilidades o cambios en versiones futuras.
- No se documentan los idiomas soportados; no asumir cobertura multilingue sin verificacion.
- No hay informacion sobre sesgos acusticos, dialectos o calidad en condiciones de ruido.
- Riesgo de alucinacion en transcripciones: los modelos ASR pueden generar texto plausible no presente en el audio, especialmente con silencios o ruido.
- No se especifican limitaciones de longitud de audio ni de contexto.
- Licencia MIT: permite uso comercial, pero conviene revisar los terminos del modelo base de Microsoft por si hubiera condiciones adicionales no reflejadas en esta ficha.
- El tamano del repositorio (30,3 GB) exige planificar el almacenamiento y descargar solo la cuantizacion necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org/VibeVoice-ASR-GGUF
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-HF
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32329
- Herramienta de conversion: https://github.com/ggml-org/convert
- Aplicacion Llama: https://llama.app
