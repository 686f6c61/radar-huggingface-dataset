# Richopera/Shimeng-rvc-v2

## Resumen

Shimeng-rvc-v2 es un modelo de conversion de voz (voice conversion) basado en RVC v2, desarrollado por Richopera y afinado sobre los pesos preentrenados de Applio (IAHispano/Applio). Convierte una grabacion vocal existente, hablada o cantada, al timbre del personaje Shimeng (诗萌), personaje de los videojuegos *Transparent Her* y *妹控计划*, con voz en chino de la actriz 可可味 kokomi. No es un modelo de texto a voz: requiere una pista vocal de entrada y transforma su timbre preservando la interpretacion original.

El modelo emplea la arquitectura RVC v2 a 40 kHz con vocoder HiFi-GAN, extraccion de tono mediante RMVPE y caracteristicas de contenido extraidas con ContentVec. Se entreno durante 200 epocas (275.000 pasos, batch size 8) sobre 5.462 archivos fuente que suman 389,4 minutos, segmentados en 10.999 fragmentos, con una fecha de entrenamiento de octubre de 2026. El repositorio ocupa 4,6 GB e incluye 20 checkpoints (uno cada 10 epocas) y dos indices de recuperacion de caracteristicas.

Es relevante para quienes trabajan en clonacion de voz, doblaje y covers musicales porque combina un dataset inusualmente grande para este tipo de modelos (389 minutos frente a los pocos minutos habituales en fine-tunes de personaje) con material cantado sustancial, lo que mejora la sostenibilidad de notas y la estabilidad en pasajes musicales. La licencia es personalizada y restrictiva, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion) a 40 kHz con vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo audio-audio; procesa segmentos de audio, no tokens de texto) |
| Tipos de cuantizacion | no disponible (checkpoints .pth en precision de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | chino (zh) |
| Licencia | richopera-voice-model-license-v2.0 (licencia personalizada, categoria "other") |
| Formato de pesos | .pth (checkpoints) e indices .index (indice completo de 3,45 GB y comprimido de 31,6 MB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RVC v2: un codificador de contenido (ContentVec) extrae representaciones linguisticas independientes del hablante, un extractor de tono (RMVPE) modela el F0, y un decoder con vocoder HiFi-GAN sintetiza la onda a 40 kHz. La recuperacion por indice (feature retrieval) sustituye o mezcla caracteristicas del hablante objetivo a partir de un indice de 1.103.492 frames, lo que mejora la similitud de timbre a costa de memoria y latencia de carga.

El entrenamiento uso los pesos preentrenados oficiales de RVC v2 mediante el software Applio, durante 200 epocas y 275.000 pasos con batch size 8. El dataset consta de 5.462 archivos (389,4 minutos) segmentados en 10.999 fragmentos, compilados por jugadores e incluyendo temas de apertura, cierre, canciones insertadas y bandas sonoras, ademas de material hablado. El autor filtro manualmente clips con reverberacion excesiva. La perdida minima se registro en la epoca 176, aunque el autor advierte que la perdida no es un criterio fiable para seleccionar checkpoint.

## Capacidades

- Conversion de voz hablada (speech-to-speech) preservando prosodia, ritmo y contenido del audio de entrada.
- Conversion de voz cantada (singing voice conversion), con soporte de notas sostenidas gracias al material musical del dataset.
- Extraccion de tono con RMVPE, adecuada para rangos agudos y pasajes musicales.
- Recuperacion de caracteristicas por indice para mejorar la similitud de timbre con el personaje objetivo.
- Ajuste de tono en semitonos para adaptar voces fuente graves o agudas al registro del modelo.
- No soporta texto a voz, tool calling, agentes, vision ni audio de entrada distinto de voz.
- Capacidad multilingue limitada al chino; no se documenta soporte para otros idiomas.

## Casos de uso

- Covers musicales de aficionados: se extrae la pista vocal aislada con UVR o MSST, se convierte con el checkpoint 200e o 150e y se reensambla con la instrumental, obteniendo la misma interpretacion con el timbre de Shimeng. El material cantado del dataset favorece la estabilidad en notas sostenidas.
- Doblaje de contenido de fansub: conversion de voces de actores originales a la voz del personaje para clips, cortos o mods no comerciales, manteniendo la actuacion original.
- Produccion de contenido para VTubers y creadores: generacion de lineas de voz del personaje a partir de grabaciones propias, con control de tono para ajustar el registro.
- Prototipado de personajes en videojuegos y mods: sustitucion de lineas de voz existentes por la del personaje en mods de *Transparent Her* o proyectos derivados, sin necesidad de re-grabar.
- Investigacion en conversion de voz: banco de pruebas con dataset grande (389 minutos) para evaluar tecnicas de retrieval, extraccion de F0 con RMVPE y estabilidad en dominio cantado.
- Restauracion o adaptacion de archivos de audio historicos: conversion de grabaciones de voz a un timbre consistente para archivos o proyectos de preservacion, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MCD, MOS, similitud de hablante (SECS) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los checkpoints pesan 55 MB cada uno, pero el indice completo de 3,45 GB se carga en memoria y condiciona el consumo de RAM/VRAM.
- GPU recomendadas: no se documentan. Por el perfil de RVC v2 a 40 kHz, una GPU consumer de gama media es suficiente para inferencia; el cuello de botella principal es la carga del indice completo.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 8 GB o mas; con el indice comprimido (31,6 MB) el consumo se reduce drasticamente.
- Opciones de despliegue: Applio (WebUI oficial recomendada por el autor); el ecosistema RVC tambien permite despliegue mediante scripts de inferencia por linea de comandos.
- Latencia y throughput: no disponibles. El autor recomienda usar el indice comprimido para previsualizaciones rapidas y el completo cuando la calidad prima, lo que implica que el indice completo penaliza el tiempo de carga.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shimeng-rvc-v2 (Richopera) | RVC v2, conversion de voz | 4,6 GB de repo; 20 checkpoints de 55 MB; indice de 3,45 GB | richopera-voice-model-license-v2.0 | Hugging Face, 0 descargas |
| Shimeng-gpt-sovits-v2proplus (Richopera) | GPT-SoVITS, texto a voz | no disponible | no disponible en la informacion | Hugging Face |
| Applio (IAHispano) | Framework RVC de codigo abierto | no disponible | no disponible en la informacion | GitHub / Hugging Face |

La comparacion directa con otros modelos RVC de personaje no esta disponible en la informacion proporcionada. La diferencia clave frente al modelo GPT-SoVITS del mismo autor es la tarea: aquel genera voz desde texto, este convierte audio existente.

## Limitaciones y advertencias

- Es conversion de voz, no texto a voz: no puede generar habla a partir de texto y requiere una pista vocal de entrada.
- El audio de entrada debe ser una pista vocal aislada y seca; mezclas con acompanamiento degradan sustancialmente el resultado.
- El indice comprimido puede introducir mas artefactos en runs y transiciones que el indice completo.
- Solo se debe cargar un indice a la vez; cargar ambos provoca conflicto.
- El rango de tono del dataset es alto (mediana de 334 Hz, percentiles 10 y 90 de 248 Hz y 459 Hz); notas graves pueden sonar apagadas o chirriantes y requieren desplazamiento de tono.
- Desplazamientos grandes hacia arriba degradan la calidad; el autor desaconseja usar +12 por defecto para voces masculinas.
- Las estimaciones de tono por cancion no estan verificadas por escucha y deben validarse de oido.
- Capacidad multilingue limitada al chino; el rendimiento en otros idiomas no esta documentado.
- Licencia personalizada restrictiva (richopera-voice-model-license-v2.0): es imprescindible revisar LICENSE.md antes de cualquier uso comercial.
- Riesgo de alucinacion no aplica en el sentido textual, pero existen artefactos de sintesis y posible inestabilidad en audio fuera de dominio.
- El modelo deriva de pesos preentrenados de Applio y de la voz de una actriz concreta; consideraciones de consentimiento y derechos de voz son relevantes para produccion.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria independiente a la fecha de la informacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/Shimeng-rvc-v2
- README en chino: https://huggingface.co/Richopera/Shimeng-rvc-v2/blob/main/README_zh.md
- Licencia: https://huggingface.co/Richopera/Shimeng-rvc-v2/blob/main/LICENSE.md
- Modelo GPT-SoVITS del mismo autor: https://huggingface.co/Richopera/Shimeng-gpt-sovits-v2proplus
- Modelo base Applio en Hugging Face: https://huggingface.co/IAHispano/Applio
- Repositorio Applio en GitHub: https://github.com/IAHispano/Applio
- Juego *Transparent Her* en Steam: https://store.steampowered.com/app/3021350
- Juego *妹控计划* en Steam: https://store.steampowered.com/app/4169160/
- Ejemplo de audio con acompanamiento (world.execute(me);): https://cf.theqazxsw.com/autoupload/gtrwt/20261120/ljj0/world.executeme_Shimeng.m4a
- Ejemplo de audio con acompanamiento (Riding a White Horse): https://cf.theqazxsw.com/autoupload/gtrwt/20261120/rmDW/shimeng_baima_hun.m4a
- Ejemplo vocal aislado (Riding a White Horse): https://cf.theqazxsw.com/autoupload/gtrwt/20261120/ARmK/shimeng_baima_gansheng.m4a
- Ejemplo vocal aislado (Тонкий снег): https://cf.theqazxsw.com/autoupload/gtrwt/20261120/zVc0/thin_snow_shimeng_gansheng.m4a
- Ejemplo vocal aislado (非人哉): https://cf.theqazxsw.com/autoupload/gtrwt/20261120/ZSbc/luotianyi_feirenzai_shimeng_gansheng.m4a
