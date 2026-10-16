# flaukowski/kannaka-rvc-voice

## Resumen

Kannaka RVC voice es un modelo de conversion de voz (voice conversion) RVC v2 desarrollado por flaukowski (Kannaka Labs, Nick Flach) que transforma una voz cantada o hablada por cualquier interprete en el timbre de Kannaka, la operadora de IA de Kannaka Labs, conservando la melodia original. No es un modelo de lenguaje: es un modelo de audio-a-audio pensado para dotar de voz cantada a un personaje sintetico cuyo unico canal previo era la sintesis de habla. Se publica como primera version, con las limitaciones medidas y documentadas de forma explicita por el autor.

La cadena de generacion es sintetica de principio a fin: la voz de partida es una voz de ElevenLabs, sobre la que se ajusto kannaka-piper-voice (e7009) con 17,8 minutos de audio, y este modelo RVC se entreno despues con 30,5 minutos de habla Piper (251 clips de 3 a 15 segundos) leidos de prosa de proyecto (READMEs y estudios), con velocidad de habla variada entre 0,90 y 1,15. En total, el modelo ha oido a Kannaka hablar, nunca cantar, lo que explica buena parte de sus limitaciones en notas agudas y sostenidas.

El interes practico esta en el ecosistema: permite que Kannaka cante en canciones generadas con flaukowski/kannaka-ace-step-lora, cerrando un pipeline de musica sintetica completa (letra, instrumental y voz) sin grabacion humana. El repositorio ocupa 0,4 GB, incluye el checkpoint, el indice de caracteristicas y cuatro muestras de audio de la primera cancion generada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), guiada por tono (pitch-guided), con vocoder HiFi-GAN y embedder ContentVec; frecuencia de muestreo de 40 kHz |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de conversion de voz, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint .pth; entrenado en fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | Space Child License (license: other; uso pacifico gratuito, con responsabilidad cuando la obra se dirige a causar dano) |
| Formato de pesos | .pth (checkpoint RVC v2, 40 kHz) + .index (indice de caracteristicas); no se ofrecen pesos en safetensors ni GGUF |

Datos adicionales del checkpoint: epoca 80, paso 8000; el sha256 de `kannaka.pth` comienza por `bc35b1d0` y el de `kannaka.index` por `aa6a8a1b`. El repositorio incluye tambien `config.json` y `model_info.json` con la configuracion de entrenamiento y la longitud del dataset.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estandar de RVC v2: un sistema de conversion de voz guiado por tono que toma una senal vocal de entrada, extrae su contenido fonetico mediante un embedder ContentVec, extrae el tono con el algoritmo rmvpe y sintetiza la voz de destino con un vocoder HiFi-GAN a 40 kHz. Se apoya en un indice de caracteristicas (`kannaka.index`) que permite hacer retrieval de fragmentos del dataset de entrenamiento durante la inferencia para estabilizar el timbre; el flujo recomendado es index rate 0,6 y protect 0,33, con rmvpe como extractor de tono.

El entrenamiento se realizo con Applio 3.6.6 sobre una unica RTX 3050 de 8 GB, con batch 8 y fp16, a razon de aproximadamente un minuto por epoca, detenido tras 80 epocas al alcanzar el limite de 90 minutos (96 minutos en total). La perdida minima del generador se registro en la epoca 79. Los datos de entrenamiento son 30,5 minutos de habla sintetica Piper (251 clips de 3 a 15 segundos), con velocidad de habla entre 0,90 y 1,15 para exponer al modelo a un rango de ritmo y tono; no hubo RLHF, DPO ni ningun tipo de ajuste por preferencias, y no se uso ninguna grabacion de voz humana en ninguna fase de la cadena.

El pipeline musical documentado por el autor combina separacion vocal con BS-RoFormer (`model_bs_roformer_ep_317_sdr_12.9755`, via audio-separator 0.47), conversion con rmvpe a transposicion 0, index rate 0,6 y protect 0,33, y remezcla de la voz al nivel de la vocal original con reverb ligera, con pico a -1 dBFS. Se incluyen cuatro muestras de la cancion "Signal in the Dark" (2:30): la original generada con ACE-Step, la conversion con aire restaurado (`-air`, la recomendada como punto de partida), la conversion simple y una conversion una octava por debajo.

## Capacidades

- Conversion de voz cantada: reemplaza el timbre de una vocal manteniendo la melodia y la letra, a partir de una pista vocal separada.
- Conversion de voz hablada: tambien procesa locucion, aunque el modelo se entreno con habla y su objetivo declarado es el canto.
- Conservacion del tono: en pasajes cantados fuertes, el tono convertido sigue la melodia exactamente (segun la medicion del autor).
- Integracion con generacion musical: disenado para dar voz a canciones producidas con flaukowski/kannaka-ace-step-lora, completando un pipeline de musica integramente sintetica.
- Control de transposicion: permite generar la voz en su registro natural o una octava por debajo (muestra `-minus12`), manteniendo la tonalidad.
- Ajuste de retrieval: el indice de caracteristicas es parametrizable (index rate, protect), lo que permite equilibrar fidelidad de timbre y naturalidad.
- Post-proceso de agudos: la muestra `-air` reinyecta la banda por encima de 9 kHz de la vocal original para compensar la ausencia de frecuencias altas del modelo.
- Compatibilidad de front-end: funciona en Applio y en cualquier interfaz compatible con RVC v2.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de entrada distinto de la voz ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- Produccion de musica sintetica: generar canciones completas con ACE-Step (letra e instrumental) y aplicar despues este modelo para que Kannaka cante la pista vocal; el pipeline esta documentado paso a paso por el autor, incluida la separacion con BS-RoFormer y la remezcla a -1 dBFS.
- Doblaje de voz de personaje consistente: mantener un timbre unico y estable en todas las canciones o locuciones de un personaje virtual a lo largo de varios proyectos, sustituyendo la necesidad de contratar una voz humana recurrente.
- Prototipado rapido de demos vocales: convertir una maqueta cantada por cualquier interprete al timbre del personaje antes de decidir si se graba una version final, gracias a que el modelo acepta cualquier entrada vocal.
- Creacion de contenido para podcasts y narrativa: el modelo tambien convierte habla, por lo que sirve para unificar la voz de un feed de audio generado con Piper con un timbre mas reconocible.
- Investigacion sobre synthetichablantes y voces sinteticas: el repositorio documenta la cadena completa ElevenLabs a Piper y de ahi a RVC, lo que lo convierte en un caso de estudio reproducible sobre acumulacion de artefactos entre etapas sinteticas.
- Experimentacion en musicologia computacional o educacion: la muestra a una octava por debajo permite ilustrar como cambia el caracter percibido de una misma melodia solo modificando el registro.
- Benchmarking de modelos RVC v2: al publicar el checkpoint, el indice, la configuracion exacta y las mediciones de limitaciones, sirve como referencia reproducible para comparar tecnicas de entrenamiento con presupuesto reducido (96 minutos en una RTX 3050).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad objetiva tipo MCD, MOS, SDR o similitud de locutor. Las unicas mediciones publicadas son caracterizaciones de limitaciones y no comparaciones con otros modelos:

| Medicion | Resultado |
|---|---|
| Contenido por encima de 9-11 kHz en la voz convertida | 0,000% de su potencia (frente a 0,63% en la vocal original) |
| Rango de la voz de entrenamiento | aproximadamente 107 a 250 Hz |
| Rango de la melodia cantada en la muestra | aproximadamente 210 a 500 Hz (cerca de una octava por encima) |
| Saltos de octava en el tono convertido | aproximadamente 14% de los fotogramas, mayoritariamente en pasajes silenciosos |
| Tono en pasajes cantados fuertes | sigue la melodia de forma exacta |
| Zumbido en pasajes sin voz | tono tenue en torno a 90-100 Hz, unos 70 dB por debajo del pico vocal (inaudible bajo la musica) |
| SDR de la separacion vocal (BS-RoFormer) | 12,9755 (modelo de separacion, no del modelo de conversion) |

## Requisitos de hardware

- Entrenamiento: se completo con una unica RTX 3050 de 8 GB, batch 8, fp16, unos 60 segundos por epoca; el autor detuvo el proceso tras 80 epocas por el limite de 90 minutos.
- VRAM de inferencia estimada: no disponible de forma explicita en la model card. Los modelos RVC v2 de este tipo suelen funcionar en GPU de consumo, pero no se publica una cifra concreta.
- GPU compatibles verificadas: RTX 3050 8 GB (entrenamiento). No se documentan otras GPU probadas.
- Cabe en GPU de consumo: no confirmado explicitamente para inferencia, si confirmado para entrenamiento con la RTX 3050 8 GB.
- Opciones de despliegue: Applio 3.6.6 y cualquier front-end compatible con RVC v2. Se necesita ademas audio-separator 0.47 (con BS-RoFormer) para el caso de uso musical.
- Latencia y throughput: no disponibles. La carga se compone de una epoca por minuto en entrenamiento, pero no hay medicion de tiempo de inferencia por segundo de audio.

## Comparativa con modelos similares

No hay en la informacion proporcionada benchmarks ni especificaciones de modelos RVC v2 comparables con metricas publicadas, por lo que una comparativa de rendimiento con alternativas no esta disponible. La unica comparacion significativa es con los otros dos modelos del mismo autor y personaje, que son complementarios y no alternativas:

| Modelo | Tipo | Funcion en el pipeline | Relacion con este modelo |
|---|---|---|---|
| flaukowski/kannaka-rvc-voice | Conversion de voz RVC v2 (audio-a-audio) | Convierte voz cantada al timbre de Kannaka | Este modelo |
| flaukowski/kannaka-piper-voice | Sintesis de habla (TTS Piper e7009) | Voz hablada del personaje | Es la fuente de los 30,5 minutos de habla con los que se entreno este modelo; solo habla, no canta |
| flaukowski/kannaka-ace-step-lora | LoRA sobre ACE-Step (generacion musical) | Genera las canciones que despues se convierten | Proporciona la pista vocal que este modelo re-canta |

## Limitaciones y advertencias

- Ausencia total de agudos: los datos de entrenamiento provienen de Piper a 22,05 kHz, por lo que nada superaba los 11 kHz. La voz convertida no tiene contenido por encima de esa banda (0,000% de su potencia frente al 0,63% de la vocal original) y suena apagada sobre una mezcla de espectro completo.
- Registro insuficiente: el habla de entrenamiento cubre unos 107 a 250 Hz, mientras que la melodia cantada en la muestra se situa en 210 a 500 Hz. Las notas agudas y sostenidas son el punto mas debil del modelo.
- Sin exposicion previa al canto: nunca ha oido canto ni vibrato; su comportamiento en esos dominios es extrapolacion.
- Saltos de octava: alrededor del 14% de los fotogramas muestran saltos de octava en el tono, concentrados en pasajes silenciosos.
- Zumbido residual: en los tramos sin voz aparece un tono tenue en torno a 90-100 Hz, unos 70 dB por debajo del pico vocal, inaudible bajo la musica pero medible.
- Bleed de separacion: el autor indica que la reverb de la vocal original que se cuela en la conversion no fue medida.
- Proceso de validacion no perceptual: ni el entrenador ni el autor de la model card escucharon la salida; las conclusiones son mediciones, no evaluaciones de oido.
- Origen integramente sintetico: la cadena encadena una voz de ElevenLabs, un ajuste Piper y este RVC, por lo que los artefactos pueden acumularse entre etapas.
- Estado de version temprana: el propio autor lo describe como primera version publicada para ser mejorada, con 0 descargas y 0 likes en el momento de la consulta.
- Licencia no estandar: la Space Child License no es una licencia OSI conocida. Permite uso pacifico gratuito, pero incluye clausulas de responsabilidad cuando la obra se dirige a causar dano. Para uso comercial o institucional conviene revisar el archivo LICENSE del repositorio antes de desplegar.
- Dependencias con licencias propias: Applio y RVC son proyectos independientes con sus propias licencias, no cubiertas por la licencia de este modelo.
- Riesgo de uso indebido: al ser un modelo de clonacion y conversion de voz, permite imitar el timbre de un tercero si se le proporciona una vocal de entrada; no consta ninguna salvaguarda tecnica ni marca de agua en el repositorio.
- Idiomas: la etiqueta oficial es solo ingles, y el dataset es prosa de proyecto en ese idioma, por lo que no hay garantias de comportamiento en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flaukowski/kannaka-rvc-voice
- Modelo de voz hablada relacionado (Piper, fuente del dataset): https://huggingface.co/flaukowski/kannaka-piper-voice
- LoRA de generacion musical relacionada (ACE-Step): https://huggingface.co/flaukowski/kannaka-ace-step-lora
- Applio (entrenador e interfaz de inferencia, version 3.6.6): https://github.com/IAHispano/Applio
- Archivo de licencia: LICENSE, dentro del repositorio del modelo
- Nota sobre la busqueda web: la busqueda no devolvio ningun resultado relevante sobre el modelo, su autor o la tecnologia RVC; unicamente aparecieron sitios de contenido para adultos sin relacion con la consulta, por lo que no se incluyen como enlaces.
