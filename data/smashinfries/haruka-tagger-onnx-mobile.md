# Smashinfries/haruka-tagger-onnx-mobile

## Resumen
haruka-tagger-onnx-mobile es una conversión a ONNX del modelo de etiquetado de imágenes anime KaraKaraWitch/haruka-tagger, publicada por el usuario Smashinfries. No se trata de un modelo generativo ni de un LLM, sino de un clasificador multi-etiqueta de visión por computador orientado a la anotación automática de ilustraciones de estilo anime. El repositorio contiene cuantizaciones FP16 y UINT8 del modelo original junto con la variante "mobile", que incorpora el preprocesado y postprocesado dentro del propio grafo ONNX.

La relevancia del artefacto es fundamentalmente práctica: empaqueta el tagger en un formato portable y ligero para su ejecución en dispositivos móviles, concretamente dentro de la aplicación WaifuTagger de KuzuLabz. El modelo base no dispone de información pública sobre arquitectura, número de parámetros ni longitud de contexto en la documentación proporcionada, por lo que muchos de los campos técnicos de esta ficha quedan marcados como no disponibles.

El repositorio ocupa 1,2 GB e incluye, además de los pesos ONNX, el fichero tags.json con el mapeo de etiquetas y el cuaderno de procesado empleado para la conversión. La licencia declarada es Apache 2.0 y el único idioma indicado es el inglés, aunque las etiquetas del modelo cubren terminología propia del dominio anime en formato danbooru.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: KaraKaraWitch/haruka-tagger) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | FP16, UINT8 (QUINT8), FP32 como referencia |
| Idiomas soportados | inglés (etiquetas en formato danbooru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (variantes base y mobile) |
| Tarea | clasificación multi-etiqueta de imágenes |
| Entrada (mobile) | datos RGB de imagen como Uint8Array |
| Salida (mobile) | puntuaciones de etiqueta con sigmoid aplicado |
| Tamaño del repositorio | 1,2 GB |
| Aplicación de destino | WaifuTagger (KuzuLabz) |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna del modelo base KaraKaraWitch/haruka-tagger en la documentación proporcionada: no se especifica si es un transformer visual, una CNN o un híbrido, ni el número de parámetros, el volumen de datos de entrenamiento o la composición del dataset. Tampoco se documenta si hubo ajuste fino supervisado, destilación u otras técnicas de entrenamiento.

Lo que sí está documentado es el proceso de conversión y empaquetado. El autor ha generado versiones ONNX en FP16 y UINT8 (QUINT8) y ha creado variantes "mobile" que integran el preprocesado y el postprocesado dentro del grafo: la entrada pasa a ser directamente datos RGB de la imagen como Uint8Array y la salida incorpora la aplicación de la función sigmoid, de modo que el consumidor recibe probabilidades listas para umbralizar. Las variantes sin la etiqueta "mobile" mantienen exactamente las mismas entradas y salidas que el modelo original. El repositorio incluye el cuaderno de procesado utilizado.

## Capacidades
- Etiquetado multi-etiqueta de imágenes de estilo anime: asigna simultáneamente etiquetas de personaje, obra, artista, elementos generales, año y clasificación.
- Categorización de etiquetas mediante el fichero tags.json, con el mapeo `id -> [label, category id, count]`.
- Categorías soportadas: 0 = general, 1 = artist, 3 = copyright, 4 = character, 6 = year, 9 = rating.
- Inferencia en formato ONNX, apta para ejecución con ONNX Runtime en distintos backends (CPU, GPU, móvil).
- Variante mobile con preprocesado y postprocesado integrados, pensada para despliegue en aplicaciones móviles.
- Cuantización UINT8 que reduce el coste computacional y de memoria a cambio de una pérdida acotada de precisión.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente un clasificador de visión.

## Casos de uso
- Etiquetado automático de galerías de ilustración anime: el modelo recibe una imagen y devuelve un conjunto de etiquetas con sus probabilidades, lo que permite indexar y buscar ilustraciones por personaje, obra o atributos visuales sin intervención manual.
- Organización de datasets de entrenamiento para modelos de difusión: el tagger permite generar automáticamente las etiquetas de captioning de un corpus de imágenes anime, acelerando la preparación de datasets para fine-tuning de modelos como Stable Diffusion.
- Filtrado y moderación de contenido: la categoría 9 (rating) permite clasificar imágenes por nivel de contenido y aplicar políticas de filtrado en plataformas de publicación.
- Aplicación móvil de catalogación: la variante mobile, con entrada RGB directa y salida sigmoid, está diseñada para integrarse en apps como WaifuTagger y ejecutar la inferencia en el dispositivo sin depender de un servidor.
- Búsqueda visual en bases de datos de fanart: combinando las etiquetas de personaje (categoría 4) y copyright (categoría 3) se pueden construir índices de búsqueda facetados sobre colecciones grandes.
- Análisis de tendencias por año: las etiquetas de categoría 6 (year) permiten agrupar ilustraciones por periodo y analizar la evolución de estilos y personajes populares.
- Preetiquetado asistido en herramientas de anotación: el modelo propone etiquetas que un humano revisa, reduciendo el coste de anotación manual en pipelines de etiquetado.

## Benchmarks y rendimiento
La model card incluye una comparación de precisión entre el modelo base en FP32 y la cuantización QUINT8 sobre una imagen de muestra, midiendo la probabilidad asignada a cada etiqueta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de clasificación visual.

| Etiqueta | Base (FP32) | QUINT8 | Diferencia |
|---|---|---|---|
| power_(chainsaw_man) | 100,00 % | 100,00 % | +0,00 % |
| chainsaw_man | 99,98 % | 99,97 % | -0,01 % |
| 1girl | 99,85 % | 99,67 % | -0,18 % |
| horns | 98,42 % | 98,07 % | -0,35 % |
| solo | 98,01 % | 96,62 % | -1,40 % |
| necktie | 97,57 % | 97,68 % | +0,10 % |
| sharp_teeth | 97,10 % | 96,72 % | -0,39 % |
| gunjyou_(gunjyou_00) | 96,58 % | 70,70 % | -25,87 % |
| teeth | 94,03 % | 93,90 % | -0,13 % |
| long_hair | 91,59 % | 92,43 % | +0,84 % |
| shirt | 90,94 % | 90,97 % | +0,03 % |
| red_horns | 89,85 % | 89,51 % | -0,35 % |
| cross-shaped_pupils | 88,95 % | 88,95 % | +0,00 % |
| black_necktie | 87,99 % | 88,41 % | +0,42 % |
| blonde_hair | 84,88 % | 80,10 % | -4,78 % |
| white_shirt | 84,58 % | 84,44 % | -0,15 % |
| symbol-shaped_pupils | 84,43 % | 78,16 % | -6,27 % |
| looking_at_viewer | 83,53 % | 80,76 % | -2,77 % |
| general | 81,94 % | 87,09 % | +5,15 % |
| hair_between_eyes | 80,70 % | 79,96 % | -0,74 % |
| simple_background | 79,59 % | 59,84 % | -19,75 % |
| open_mouth | 77,66 % | 78,15 % | +0,49 % |
| collared_shirt | 76,71 % | 78,75 % | +2,04 % |
| era_2021_2023 | 76,49 % | 75,07 % | -1,42 % |
| era_2020_2022 | 73,28 % | 70,47 % | -2,80 % |
| jacket | 72,29 % | 72,18 % | -0,10 % |
| demon_girl | 68,26 % | 69,77 % | +1,51 % |
| era_2022_2024 | 67,69 % | 67,65 % | -0,04 % |
| demon_horns | 66,09 % | 67,53 % | +1,44 % |
| smile | 64,72 % | 63,57 % | -1,15 % |

La cuantización QUINT8 degrada de forma notable tres etiquetas concretas: gunjyou_(gunjyou_00) cae 25,87 puntos, simple_background cae 19,75 puntos y symbol-shaped_pupils cae 6,27 puntos. El resto de etiquetas se mantiene con diferencias inferiores al 5 %, y algunas mejoran ligeramente.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible con precisión, ya que no se documenta el número de parámetros del modelo base. El repositorio completo ocupa 1,2 GB, pero ese tamaño incluye todas las variantes (FP16, UINT8, FP32 y mobile) y el cuaderno, no un único conjunto de pesos.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de clasificación visual, es probable que funcione en GPU de gama media, pero no se aportan datos de rendimiento por hardware.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; la existencia de una variante mobile con cuantización UINT8 sugiere un diseño orientado a hardware limitado.
- Opciones de despliegue: ONNX Runtime (backend principal), con posibilidad de ejecución en CPU, GPU o dispositivos móviles. La integración documentada es con la aplicación WaifuTagger.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a aspectos de formato, licencia y propósito.

| Modelo | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| haruka-tagger-onnx-mobile | Etiquetado de imágenes anime | ONNX (FP16/UINT8) | Apache 2.0 | Hugging Face |
| KaraKaraWitch/haruka-tagger | Etiquetado de imágenes anime | no disponible | no disponible | Hugging Face |
| SmilingWolf/wd-tagger | Etiquetado de imágenes anime | no disponible | no disponible | Hugging Face / Space |
| Alternativas de la familia WD (v2, v3, EVA02) | Etiquetado de imágenes anime | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias
- El modelo está especializado en ilustraciones de estilo anime y su rendimiento fuera de ese dominio no está documentado.
- La cuantización QUINT8 introduce degradaciones severas en etiquetas concretas (hasta -25,87 puntos en gunjyou_(gunjyou_00) y -19,75 en simple_background), por lo que en producción conviene validar la variante elegida sobre el dominio real de imágenes.
- No hay información sobre sesgos del modelo base ni sobre la composición de su dataset de entrenamiento.
- Riesgo de falsos positivos y negativos en etiquetas poco representadas; el fichero tags.json incluye un contador `count` por etiqueta que puede usarse para priorizar umbrales.
- El único idioma declarado es el inglés, con etiquetas en formato danbooru; no se documenta soporte multilingüe.
- Aunque la licencia es Apache 2.0, el modelo base KaraKaraWitch/haruka-tagger no declara licencia en la información disponible, por lo que conviene verificar los términos del modelo original antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni de validación por terceros.
- No se documentan requisitos de hardware ni latencias, lo que dificulta estimar costes de despliegue.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Smashinfries/haruka-tagger-onnx-mobile
- Modelo base: https://huggingface.co/KaraKaraWitch/haruka-tagger
- Aplicación WaifuTagger: https://github.com/KuzuLabz/WaifuTagger
- Imagen de muestra usada en las pruebas de precisión: https://huggingface.co/spaces/SmilingWolf/wd-tagger/blob/main/power.jpg
