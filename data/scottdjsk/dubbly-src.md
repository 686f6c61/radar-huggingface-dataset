# Scottdjsk/dubbly-src

## Resumen

Dubbly es un proyecto publicado en Hugging Face bajo el identificador `Scottdjsk/dubbly-src` por el usuario Scottdjsk. Segun la model card disponible, no se trata de un modelo de lenguaje en sentido estricto, sino de una aplicacion desplegada como Space de Hugging Face (SDK Docker, puerto 7860) cuyo proposito es doblar automaticamente cualquier video a ingles. El usuario puede pegar un enlace de TikTok o subir un clip, y la aplicacion devuelve una voz en off en ingles, subtitulos en ingles o ambas cosas. La descripcion corta del proyecto es "Any video, in English".

El componente de reconocimiento de voz que utiliza es Whisper en su variante `small` con precision float32, ejecutado sobre el tier gratuito de CPU de 2 vCPU de Hugging Face Spaces para priorizar la velocidad. Segun la propia model card, es posible configurar la variable de entorno `WHISPER_MODEL` con el valor `medium` para obtener mayor precision a costa de un rendimiento aproximadamente 2-3 veces mas lento. La aplicacion conserva los videos procesados durante un maximo de 48 horas, con un limite de 25 videos almacenados.

No se dispone de informacion sobre arquitectura propia del modelo, numero de parametros, longitud de contexto, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada. El repositorio no registra descargas (0) y cuenta con 1 like en el momento de la consulta, lo que sugiere un proyecto en fase inicial o de caracter personal. La fecha de creacion indicada es 2026-11-14, dato que debe interpretarse con cautela dado que no se ha podido verificar de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la aplicacion utiliza Whisper `small` como componente de ASR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona Whisper `small` en float32) |
| Idiomas soportados | salida en ingles; idiomas de entrada no especificados |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del proyecto Dubbly ni de un modelo propio. Lo unico documentado es que la aplicacion integra Whisper en la variante `small` con precision float32 como motor de reconocimiento automatico del habla, y que el usuario puede sustituirlo por la variante `medium` mediante la variable de entorno `WHISPER_MODEL`. No se detalla el pipeline completo de doblaje (traduccion, sintesis de voz, alineacion temporal de subtitulos), ni los datos de entrenamiento, ni si ha habido fases de RLHF o DPO.

Tampoco se especifica si el proyecto incluye pesos propios o si unicamente orquesta modelos de terceros (Whisper para ASR y, presumiblemente, algun modelo de traduccion y de TTS no identificados en la model card). El despliegue se realiza como Space de tipo Docker con `app_port: 7860`, orientado a un uso ligero sobre CPU.

## Capacidades

- Doblaje automatico de video a ingles: acepta un enlace de TikTok o un clip subido y genera una voz en off en ingles.
- Generacion de subtitulos en ingles a partir del audio del video.
- Salida combinada de voz en off y subtitulos en una sola operacion.
- Instalacion como PWA en el movil, con integracion mediante Share target para compartir contenido directamente desde otras aplicaciones.
- Configuracion del modelo de reconocimiento de voz mediante la variable de entorno `WHISPER_MODEL` (`small` por defecto, `medium` para mayor precision).
- Almacenamiento temporal de videos procesados durante un maximo de 48 horas, con un limite de 25 videos.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio de entrada distinto del video ni soporte multilingue de salida mas alla del ingles.

## Casos de uso

- Doblaje rapido de contenido de TikTok: el usuario pega un enlace y obtiene en una sola operacion la voz en off en ingles y los subtitulos, lo que facilita republicar contenido en mercados angloparlantes sin herramientas de edicion adicionales.
- Localizacion de clips cortos para redes sociales: creadores que producen video en otros idiomas pueden generar una version en ingles con subtitulos para ampliar audiencia, aprovechando el limite de 25 videos y la retencion de 48 horas como buffer de trabajo.
- Generacion de subtitulos accesibles: la salida de subtitulos en ingles permite cumplir requisitos basicos de accesibilidad en publicaciones de video, sin necesidad de transcripcion manual.
- Prototipado de pipelines de doblaje: desarrolladores que quieran evaluar la calidad de Whisper `small` frente a `medium` en un flujo real de doblaje pueden usar la variable `WHISPER_MODEL` para comparar velocidad y precision en el mismo entorno.
- Uso movil sobre la marcha: la instalacion como PWA con Share target permite compartir un video desde la app de TikTok del telefono y recibir el resultado en ingles sin abrir un escritorio.
- Demostracion educativa de orquestacion de modelos: el proyecto sirve como ejemplo de integracion de un modelo ASR (Whisper) en un Space Docker con frontend PWA, util para quienes quieran replicar el patron con otros idiomas o motores de sintesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento es cualitativa: la variante `medium` de Whisper es aproximadamente 2-3 veces mas lenta que `small` en el tier gratuito de 2 vCPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El despliegue documentado se ejecuta sobre CPU (tier gratuito de 2 vCPU), no sobre GPU.
- GPU recomendadas: no disponible. La model card no menciona requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; el proyecto esta disenado para CPU en el tier gratuito de Hugging Face Spaces.
- Opciones de despliegue: Hugging Face Spaces con SDK Docker en el puerto 7860, y uso directo mediante la URL publica `https://scottdjsk-dubbly.hf.space`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma cuantitativa; solo se indica que `medium` es aproximadamente 2-3 veces mas lento que `small`.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de doblaje automatico ni datos de rendimiento que permitan establecer una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- La model card no especifica la licencia, por lo que no puede confirmarse si el uso comercial esta permitido; debe consultarse al autor antes de cualquier despliegue en produccion.
- No se documentan los idiomas de entrada soportados; solo se garantiza la salida en ingles.
- La precision del reconocimiento depende de Whisper `small` en float32 por defecto, lo que puede ser insuficiente en audio con ruido, acentos marcados o voces superpuestas.
- El almacenamiento de videos es temporal (48 horas, maximo 25 videos), lo que limita su uso como archivo o servicio persistente.
- El servicio se ejecuta en el tier gratuito de 2 vCPU, con la latencia y la disponibilidad asociadas a ese entorno; no hay garantias de nivel de servicio.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion en la traduccion ni sobre el modelo de sintesis de voz empleado para la voz en off.
- El repositorio presenta 0 descargas y 1 like, sin senales de validacion por parte de la comunidad; conviene tratar el proyecto como experimental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Scottdjsk/dubbly-src
- Aplicacion desplegada: https://scottdjsk-dubbly.hf.space
