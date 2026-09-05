# laion/vocal-burst-detector-commercial

## Resumen

`laion/vocal-burst-detector-commercial` es un clasificador de vocal bursts (sonidos vocales no verbales) de 17 clases, desarrollado por LAION. Se construye como una cabeza clasificadora sobre el encoder dual-tower VoiceCLAP `laion/voiceclap-commercial`, un modelo de 110 millones de parametros entrenado exclusivamente con datos de uso comercial. El objetivo es ofrecer una alternativa ligera y con licencia permisiva (CC BY 4.0) al modelo mas potente `laion/vocal-burst-detector-x2`, que depende de un encoder de 7.000 millones de parametros y resulta mucho mas pesado como dependencia.

El modelo distingue 16 tipos de bursts vocales (suspiros, risas, gemidos, jadeos, etc.) mas la clase `no_burst`. Segun la model card, las 17 clases no son una lista curada, sino exactamente las etiquetas con al menos 100 segmentos anotados en dos corpus distintos: grabaciones reales y audio de actuacion de voz sintetica. La probabilidad de acertar por azar es del 5,9 %. El modelo esta pensado para clasificar cortes de audio de aproximadamente 16 kHz, y su cadena completa es CC BY 4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador MLP sobre encoder dual-tower VoiceCLAP (`laion/voiceclap-commercial`) |
| Parametros totales | 110 M (encoder base; parametros del head no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de audio) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es una cabeza clasificadora de tipo MLP (segun los archivos `vocal_burst_mlp_prod_s{0..4}.pt`) montada sobre el encoder `laion/voiceclap-commercial`. Este encoder es una arquitectura dual-tower VoiceCLAP de 110 millones de parametros, con una dimension de embedding de 768. El encoder fue entrenado unicamente con datos comercialmente utilizables, lo que garantiza que toda la cadena (encoder + head) sea CC BY 4.0.

La cabeza clasificadora se entrena sobre un corpus compuesto por dos fuentes: grabaciones reales de voz y audio de actuacion de voz sintetica (denominado DramaBox en la comparativa). El head se entrega como un ensemble de 5 inicializaciones distintas sobre una misma split agrupada. La model card advierte explicitamente que nunca es un ensemble sobre splits, porque eso evaluaria sobre elementos que sus propios miembros ya habian visto durante el entrenamiento.

La innovacion principal no es arquitectonica, sino de licencia y eficiencia: el modelo ofrece un rendimiento cercano al de un encoder de 110 M con licencia no comercial, pero con permisos de uso comercial. Segun la model card, la diferencia de precision con `voiceclap-small-v2` (CC BY-NC 4.0) es menor que la variacion entre distintas semillas de la split.

## Capacidades

- Clasificacion de vocal bursts en 17 clases: Affirmative Grunt, Breathy Giggle, Chuckle, Deep Breath, Exasperated Sigh, Exhausted Groan, Frustrated Groan, Heavy Breathing, Humming, Panting, Relief Sigh, Scream, Sharp Inhale, Soft Hum, Wistful Sigh, Yawn y `no_burst`.
- Procesamiento de audio a una frecuencia de muestreo de 16 kHz; el encoder rechaza cualquier otra frecuencia, por lo que es necesario resamplear previamente.
- Agrupacion de las 17 clases en un esquema de 23 grupos semanticamente similares, disponible en `vocal_burst_groups.json` y `GROUPS.md`. Esta agrupacion eleva la precision de 0.393 a 0.515 en el corpus real, aunque la model card advierte que parte de esa mejora es aritmetica y no semantica.
- No tiene capacidades de generacion de texto, tool calling, agentes, vision ni audio generativo. Es un clasificador puro.
- Soporte de idioma: la metadata indica ingles (en), aunque al tratarse de sonidos no verbales, la clasificacion no depende del idioma hablado.

## Casos de uso

- Evaluacion de generadores de voz: el modelo puede usarse para medir si un sistema de text-to-speech produce vocal bursts plausibles. Dado que proporciona recall por clase y por fuente, permite interpretar las tasas de acierto generadas por el generador como una lectura del instrumento antes que como un veredicto sobre el generador.
- Etiquetado automatico de datasets de audio: en pipelines de anotacion de datos, se puede utilizar para pre-clasificar segmentos de audio que contengan vocal bursts, reduciendo el trabajo manual de los anotadores.
- Analisis de emociones en audio: en contextos de call centers o entrevistas, el modelo puede detectar suspiros de alivio, gemidos de frustracion o risas, proporcionando senales no verbales utiles para analisis de sentimiento.
- Moderacion de contenido de audio: para plataformas que necesitan filtrar o identificar sonidos vocales no verbales en contenido generado por usuarios, el modelo ofrece una clasificacion de 16 tipos de bursts mas la ausencia de ellos.
- Investigacion en interaccion humano-computadora: en sistemas de agentes virtuales o robots, el modelo puede detectar vocal bursts del usuario como indicadores de estado emocional o de intencion, permitiendo respuestas adaptativas.
- Analisis de rendimiento de actores de voz: en producciones de doblaje o actuacion de voz sintetica, se puede usar para verificar que se han generado los tipos de bursts requeridos para una escena concreta.

## Benchmarks y rendimiento

La model card incluye una comparativa de precision (accuracy) sobre un conjunto de test equilibrado a 25 clips por clase, manteniendo los mismos datos, split, head e inicializaciones. Solo cambia el encoder:

| Encoder | Licencia | Parametros | Dim | Real, 17-way | DramaBox, 17-way | Real, 23 grupos | DramaBox, 23 grupos |
|---|---|---:|---:|---:|---:|---:|---:|
| `voiceclap-large-v2` | CC BY 4.0 | 7 B + LoRA | 3584 | 0.466 | 0.574 | 0.605 | 0.697 |
| `voiceclap-commercial` (este modelo) | CC BY 4.0 | 110 M | 768 | 0.393 | 0.536 | 0.515 | 0.628 |
| `voiceclap-small-v2` | CC BY-NC 4.0 | 110 M | 768 | 0.402 | 0.551 | 0.513 | 0.675 |

La model card destaca que el encoder de 7 B es 0.073 puntos mejor en el corpus real a 17 clases, pero con aproximadamente 64 veces mas parametros. En el corpus sintetico la diferencia es menor. Tambien senala que la diferencia entre este modelo y `voiceclap-small-v2` es inferior a la dispersion entre semillas de la split, por lo que no hay argumento de precision para elegir la licencia no comercial.

## Requisitos de hardware

- VRAM estimada para inferencia: con 110 M de parametros, el encoder en FP32 ocupa aproximadamente 440 MB; en FP16, unos 220 MB. El head MLP anade un coste despreciable. En la practica, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 3050, RTX 4090, A100, H100) es suficiente. Tambien puede ejecutarse en CPU si la latencia no es critica.
- Compatibilidad con GPU de consumo: si, el modelo es compatible con cualquier GPU de consumo actual, incluso con memoria compartida.
- Opciones de despliegue: el uso previsto es via PyTorch, como se muestra en el codigo de ejemplo de la model card. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de audio, no aplican los frameworks de texto.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Encoder base | Parametros | Licencia | Real 17-way | DramaBox 17-way | Uso comercial |
|---|---|---|---|---|---|---|
| `laion/vocal-burst-detector-commercial` (este modelo) | `voiceclap-commercial` | 110 M | CC BY 4.0 | 0.393 | 0.536 | Si |
| `laion/vocal-burst-detector-x2` | `voiceclap-large-v2` | 7 B + LoRA | CC BY 4.0 | 0.466 | 0.574 | Si |
| `laion/vocal-burst-detector-v2` | No especificado | No disponible | Apache 2.0 | No disponible | No disponible | Si |

La comparativa se basa en los datos de la model card para los dos primeros. Para `vocal-burst-detector-v2` no se dispone de informacion de rendimiento en la busqueda web, por lo que se indica como no disponible.

## Limitaciones y advertencias

- No es un drop-in scorer: la model card indica que el wrapper `ProductionBurstScorer` del modelo `x2` no se ha portado a este modelo. Un port no probado podria cargar y ejecutar produciendo numeros aparentemente plausibles, lo cual es peor que no incluirlo.
- El encoder pad a 30 segundos y aplica mean-pooling. Un burst de 0,4 segundos ocupa aproximadamente el 1,3 % de los frames promediados, lo que diluye la senal. La model card reconoce esta dilucion, pero no establece que sea la causa de la diferencia de rendimiento.
- Nueve de las 17 clases tienen la etiqueta `reliable: false` en el recall por clase, debido a un conjunto de test demasiado pequeno para obtener una estimacion fiable.
- Ningun humano ha escuchado las muestras: todas las cifras dependen de etiquetas de anotadores, no de validacion perceptiva.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribucion. No hay restricciones de uso comercial adicionales.
- La metadata indica solo ingles como idioma, aunque al tratarse de sonidos no verbales, la clasificacion puede aplicarse a audio de cualquier idioma sin necesidad de traduccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/vocal-burst-detector-commercial
- Modelo base: https://huggingface.co/laion/voiceclap-commercial
- Modelo comparado `x2`: https://huggingface.co/laion/vocal-burst-detector-x2
- Modelo comparado `v2`: https://huggingface.co/laion/vocal-burst-detector-v2
