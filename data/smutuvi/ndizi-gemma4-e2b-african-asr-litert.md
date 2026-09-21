# smutuvi/ndizi-gemma4-e2b-african-asr-litert

## Resumen

Ndizi Gemma4 E2B es un modelo de reconocimiento automatico del habla (ASR) afinado por el usuario smutuvi a partir de Sunbird/Sunflower-Gemma4-E2B, y orientado especificamente a tres lenguas africanas: suajili (sw), amharico (am) y oromo (om). El modelo se publica en formato LiteRT (el sufijo `-litert` del identificador), lo que indica que esta pensado para inferencia en dispositivo o en entornos con recursos limitados, y no como un checkpoint de servidor en safetensors. El repositorio ocupa 2,9 GB.

El problema que aborda es la escasez de sistemas ASR de calidad para lenguas africanas, un ambito historicamente infrarrepresentado en los corpus y en los modelos comerciales. La model card solo documenta un experimento de validacion muy pequeno (10 muestras por conjunto, etiquetado como "smoke test"), con tasas de error de palabra (WER) que van de 0,265 en FLEURS sw_ke a 0,754 en FLEURS om_et.

Es relevante ahora porque combina dos tendencias: la aparicion de modelos fundacionales de voz multilingues construidos sobre decodificadores tipo Gemma, y el interes por despliegues de ASR en el propio dispositivo (LiteRT, Android), donde no hay conectividad estable ni presupuesto para GPU. No obstante, las cifras publicadas son preliminares y el modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo deriva de Sunbird/Sunflower-Gemma4-E2B; se desconoce la composicion exacta de encoder de audio y decodificador) |
| Parametros totales | no disponible (la nomenclatura "E2B" sugiere 2B parametros efectivos, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Suajili (sw), amharico (am), oromo (om) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT (el identificador y el sufijo `-litert` apuntan al formato de Google AI Edge; no se confirma la extension exacta de los ficheros) |
| Tamano del repositorio | 2,9 GB |
| Tarea | Reconocimiento automatico del habla (ASR) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos en la informacion proporcionada. Lo unico documentado es que el modelo es un ajuste fino (fine-tune) de Sunbird/Sunflower-Gemma4-E2B, un modelo de la familia Gemma 4 publicado por Sunbird. Por la naturaleza de la tarea y por el sufijo del nombre, se trata de un sistema multimodal de audio a texto que se distribuye compilado para el runtime LiteRT. No se especifica si emplea atencion lineal, decodificacion especulativa ni ninguna otra innovacion de inferencia.

Respecto a los datos de entrenamiento, la model card enumera las fuentes pero no indica volumen de horas, numero de tokens ni proporcion por idioma. Los corpus citados son: smutuvi/ndizi-1 y smutuvi/ndizi-1-2025 (suajili, en dominio), nickdee96/ALFFA-Swahili-News y Sunbird/salt (suajili), hadamard-2/alffa-amharic, snapwre/amharic-speech y google/WaxalNLP amh (amharico), y google/WaxalNLP orm y turiabu/Sagalee (oromo). No se documenta el uso de RLHF, DPO ni de ninguna etapa de alineacion especifica.

Un detalle operativo relevante es que el modelo no detecta el idioma de forma automatica: requiere un prompt textual por idioma, lo que implica que el pipeline de inferencia debe conocer de antemano la lengua del audio.

## Capacidades

- Transcripcion de voz a texto en suajili, amharico y oromo mediante un prompt especifico por idioma.
- Prompt de suajili: `Andika maneno unayosikia katika sauti hii.`
- Prompt de amharico: `ይህን ንግግር በአማርኛ ጻፍ። ውጤቱ ጽሑፍ ብቻ ይሁን።`
- Prompt de oromo: `Dubbii kana Afaan Oromootiin barreessi. Barreeffama qofa baasi.`
- Salida en texto plano (los prompts de amharico y oromo piden explicitamente que la salida sea solo la transcripcion).
- Reconocimiento de habla en dominio propio (corpus ndizi) y en dominio generico (FLEURS, WaxalNLP).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, traduccion ni diarizacion de hablantes.
- No se documenta ningun modo "thinking" ni capacidad de generacion de texto general: el modelo esta especializado en ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz en suajili: el modelo recibe el audio con el prompt en suajili y devuelve la transcripcion en texto, lo que permite indexar y buscar contenido hablado en empresas de Africa Oriental.
- Subtitulado de contenido audiovisual en amharico: con un WER de 0,394 en FLEURS am_et, es utilizable como primera pasada de subtitulado que despues se revisa manualmente, reduciendo el coste frente a la transcripcion desde cero.
- Despliegue en aplicaciones moviles Android sin conectividad: al distribuirse en formato LiteRT, encaja en el runtime de Google AI Edge y permite transcripcion en el propio dispositivo, sin enviar audio a un servidor y sin depender de la red.
- Atencion al cliente por voz en suajili: transcripcion de llamadas para generar registros, clasificar incidencias y auditar calidad, siempre que el audio se preprocese para fijar el prompt correcto.
- Investigacion linguistica y construccion de corpus: generacion de transcripciones iniciales sobre grabaciones de campo en oromo o amharico que despues se corrigen, acelerando la anotacion de datasets de lenguas con pocos recursos.
- Accesibilidad para hablantes de oromo o amharico: dictado de documentos y mensajes en entornos donde las herramientas comerciales de dictado no cubren estas lenguas.
- Verificacion de calidad de audio en pipelines de datos: uso del WER como metrica automatica para filtrar grabaciones mal etiquetadas en un corpus multilingue, dado que el modelo ya esta ajustado a estos dominios.
- Prototipado rapido en un portatil: con un repositorio de 2,9 GB, es viable cargarlo en una maquina de desarrollo para pruebas de concepto sin aprovisionar GPU de datacenter.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son tasas de error de palabra (WER) sobre un "smoke test" de 10 muestras por conjunto, etiquetado como v3. Menos es mejor.

| Conjunto de evaluacion | Idioma | WER |
|---|---|---|
| ndizi-1 (en dominio) | Suajili | 0,595 |
| ndizi-1-2025 (en dominio) | Suajili | 0,413 |
| FLEURS sw_ke | Suajili | 0,265 |
| FLEURS am_et | Amharico | 0,394 |
| FLEURS om_et | Oromo | 0,754 |
| WaxalNLP orm | Oromo | 0,508 |
| Sagalee | Oromo | 0,737 |

Notas sobre la metodologia: la model card no especifica si los audios son de test oficial o de validacion, ni si se aplico normalizacion de texto antes de calcular el WER. El tamano de muestra (10 audios) implica un intervalo de confianza muy amplio, por lo que estas cifras no deben usarse para tomar decisiones de produccion sin una reevaluacion propia. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) porque no aplican ni estan disponibles para esta tarea.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el repositorio completo pesa 2,9 GB, por lo que la inferencia requiere al menos ese orden de magnitud de memoria, y algo mas si el runtime no comparte buffers entre etapas.
- GPU recomendadas: no disponible. Al tratarse de un artefacto LiteRT orientado a inferencia ligera, no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio (2,9 GB), cualquier GPU con 4 GB o mas de VRAM deberia poder alojarlo; no se confirma en la informacion disponible.
- Despliegue en dispositivo: es el escenario natural del formato LiteRT (Google AI Edge), incluyendo moviles Android y equipos de borde con aceleracion por CPU, GPU o NPU.
- Opciones de despliegue: LiteRT es el formato publicado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo ASR en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de resultados de benchmark comparativos en la informacion proporcionada. La tabla siguiente recoge unicamente lo que consta en la model card y en los metadatos, mas la relacion con el modelo base.

| Modelo | Parametros | Idiomas | Formato | Licencia | WER publicado |
|---|---|---|---|---|---|
| smutuvi/ndizi-gemma4-e2b-african-asr-litert | no disponible (nombre "E2B") | sw, am, om | LiteRT | Apache 2.0 | Si (7 conjuntos, smoke test de 10 muestras) |
| Sunbird/Sunflower-Gemma4-E2B (modelo base) | no disponible (nombre "E2B") | no disponible | no disponible | no disponible | no disponible |
| Whisper (OpenAI) | no disponible en esta busqueda | multilingue general | safetensors, GGUF via conversiones | MIT (segun la informacion habitual del proyecto) | no disponible en esta busqueda |
| MMS (Meta) | no disponible en esta busqueda | multilingue general | safetensors | CC-BY-NC 4.0 (uso no comercial) | no disponible en esta busqueda |

No se ha encontrado en la busqueda web ningun dato verificable sobre alternativas comparables en estas tres lenguas concretas, por lo que no es posible emitir un juicio de rendimiento relativo.

## Limitaciones y advertencias

- Los WER publicados proceden de un smoke test de 10 muestras por conjunto: la varianza es alta y las cifras no son extrapolables a un rendimiento en produccion.
- El oromo es claramente el idioma peor cubierto: WER de 0,754 en FLEURS om_et y 0,737 en Sagalee, valores que en la practica implican transcripciones poco utilizables sin post-edicion.
- El suajili en dominio (ndizi-1, 0,595) rinde peor que el suajili generico de FLEURS (0,265), lo que sugiere un desajuste entre el dominio de entrenamiento declarado y el dominio de evaluacion, o un problema en las particiones de datos.
- No hay deteccion automatica de idioma: usar el prompt equivocado degrada la salida, y el pipeline debe etiquetar la lengua antes de invocar al modelo.
- Riesgo de alucinacion y de bucles de repeticion inherente a los modelos generativos de voz, especialmente con audio ruidoso o con segmentos sin habla.
- No se documentan sesgos demograficos ni acusticos del entrenamiento, pero los corpus de lenguas con pocos recursos suelen estar sobrerrepresentados en ciertos registros (noticias, lectura en voz alta) y subrepresentados en habla espontanea y dialectos.
- Restriccion de licencia de datos: el corpus turiabu/Sagalee (oromo) esta bajo CC BY-NC 4.0, lo que puede condicionar el uso comercial del modelo derivado aunque los pesos se publiquen bajo Apache 2.0. Conviene revisar la licencia de cada corpus antes de un despliegue comercial.
- El modelo acumula 0 descargas y 0 likes y fue publicado y actualizado el mismo dia, sin historial de mantenimiento: no hay garantia de soporte ni de correccion de errores.
- No se documenta el tratamiento de datos personales en los corpus de entrenamiento, un punto relevante para despliegues sujetos al RGPD.
- Limitacion de formato: al publicarse en LiteRT, integrarlo en stacks de servidor habituales (vLLM, TGI) no es directo y puede requerir conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smutuvi/ndizi-gemma4-e2b-african-asr-litert
- Modelo base: https://huggingface.co/Sunbird/Sunflower-Gemma4-E2B
- Corpus de entrenamiento citados en la model card:
  - smutuvi/ndizi-1
  - smutuvi/ndizi-1-2025
  - nickdee96/ALFFA-Swahili-News
  - Sunbird/salt
  - hadamard-2/alffa-amharic
  - snapwre/amharic-speech
  - google/WaxalNLP (subconjuntos amh y orm)
  - turiabu/Sagalee (CC BY-NC 4.0)
- No se han encontrado en la busqueda web enlaces adicionales relevantes (paper, blog, repositorio o demo) para este modelo.
