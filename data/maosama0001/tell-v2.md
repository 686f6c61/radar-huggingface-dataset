# maosama0001/tell-v2

## Resumen

Tell v2 es un modelo multimodal de análisis forense de imágenes y detección de desinformación, desarrollado por el usuario maosama0001 y publicado en Hugging Face bajo licencia MIT. Su función es clasificar publicaciones compuestas por una imagen y un titular en tres categorías: auténtica, manipulada o con conexión falsa (imagen real con titular que no le corresponde). Además, genera mapas de calor que indican qué regiones de la imagen sustentan la predicción, lo que lo convierte en una herramienta de cribado para verificadores y moderadores de contenido.

El modelo tiene 106,9 millones de parámetros totales, de los cuales 31,8 millones son entrenables, y se distribuye como un repositorio PyTorch de 0,4 GB. Se entrenó sobre Fakeddit (publicaciones de Reddit en inglés, mayoritariamente de EE. UU., entre 2008 y 2019, con etiquetas de supervisión distante) y CASIA v2.0 (ediciones de tipo splicing y copy-move). La versión v2 incorpora ediciones sintéticas, intercambio de titulares, dropout de pies de foto y cabezas auxiliares por flujo, y sustituye a la Fase II como modelo principal de la aplicación.

Su relevancia radica en que documenta de forma explícita y medida sus propios atajos: el modelo aprende el estilo del titular, de modo que un titular corto y humorístico sobre una foto real puede empujar la predicción hacia "manipulado". El autor publica métricas de estrés, latencia y robustez frente a compresión, lo que permite evaluar su idoneidad con datos concretos en lugar de afirmaciones genéricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (multimodal con flujos separados de imagen y titular y cabezas auxiliares por flujo; detalles no publicados) |
| Parámetros totales | 106,9 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (entrenado con datos en inglés; otros idiomas no evaluados) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`final_model_v2/`, cargado con `weights_only=True`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo multimodal con flujos separados para imagen y titular, y con cabezas auxiliares por flujo. El modelo principal v2 corresponde a la ejecución `20261015_112338_V2_V2_full_s42` y se entrenó con ediciones sintéticas, intercambio de titulares y dropout de pies de foto. El repositorio conserva además el modelo de Fase II (`final_model/`, ejecución `20261014_204630_P2_T4_tell_sdrop_s42`) para comparación.

Los datos de entrenamiento son Fakeddit, con etiquetas de supervisión distante derivadas del subreddit y no de verificación humana por publicación, y CASIA v2.0 para las ediciones de splicing y copy-move. No se especifica el número de tokens ni la composición exacta del dataset. Tampoco se documenta el uso de RLHF o DPO. La innovación técnica destacable es el diseño de evaluación: el autor mide el atajo del titular comparando el rendimiento con y sin pie de foto, y cuantifica la degradación bajo JPEG q30, reescalado x2 y desenfoque.

## Capacidades

- Clasificación de publicaciones imagen-titular en tres clases: auténtica, manipulada y conexión falsa.
- Detección de ediciones de imagen de tipo splicing y copy-move, con rama forense que produce mapas de píxeles.
- Generación de mapas de calor aproximados que señalan las regiones de la imagen relevantes para la predicción.
- Señal de sesgo por titular: la aplicación advierte cuando un titular muy corto puede inclinar el veredicto.
- Salida de probabilidad calibrada junto con la evidencia que la sustenta, en lugar de un veredicto binario.
- No incluye reconocimiento facial ni identificación de personas.
- No soporta tool calling, agentes, razonamiento multi-paso ni modo de pensamiento; es un clasificador, no un modelo generativo.
- No cubre vídeo, imágenes generadas por IA, titulares en idiomas distintos del inglés ni noticias regionales de la India.

## Casos de uso

- Cribado en redacciones de verificación: el modelo ordena por probabilidad las publicaciones recibidas y muestra dónde mirar en la imagen, de modo que el periodista prioriza las candidatas antes de la revisión manual.
- Moderación de contenido en comunidades: integrado como primera pasada sobre publicaciones con imagen y titular, con decisión humana obligatoria y tasa de falsos positivos reportada por clase.
- Investigación sobre desinformación multimodal: permite reproducir experimentos sobre atajos de estilo en titulares y medir su impacto con el conjunto de estrés incluido en la documentación.
- Formación de periodistas y estudiantes: la aplicación local muestra la probabilidad, la evidencia y el aviso de "señal de cribado, no prueba", lo que sirve para enseñar los límites de la detección automática.
- Detección de ediciones clásicas en flujos de documentación: la rama forense localiza splices y copy-move en imágenes con resolución controlada, útil como indicio previo a un análisis pericial.
- Evaluación de robustez en pipelines de distribución: las métricas de JPEG q30, reescalado y desenfoque permiten decidir si el modelo es aceptable para contenido reenviado por mensajería o capturas de pantalla.
- Despliegue local con privacidad: la aplicación se enlaza solo a 127.0.0.1, no registra datos y purga las subidas cada 5 minutos, lo que encaja en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

Métricas de Tell v2 (modelo de la aplicación):

| Métrica | Valor |
|---|---|
| Macro F1 / exactitud en test original | 0,811 / 0,814 |
| F1 auténtica / manipulada / conexión falsa | 0,757 / 0,851 / 0,826 |
| Macro F1 en test de estrés (fotos reservadas, ediciones sintéticas, titulares intercambiados) | 0,614 |
| Test de estrés: splices / copy-move / titulares intercambiados detectados / fotos reales conservadas | 80% / 50% / 48% / 71% |
| Subconjunto controlado sin titular | 0,404 |
| Robustez: JPEG q30 / reescalado x2 / desenfoque | 0,790 / 0,796 / 0,768 |
| Latencia por publicación (GPU T4, lote 1) | 17,1 ms de mediana |

Métricas del modelo de Fase II (comparación; test de 3.446 publicaciones con resolución controlada):

| Métrica | Valor |
|---|---|
| Macro F1 (semilla 42 / media de 3 semillas) | 0,846 / 0,841 ± 0,004 |
| Exactitud | 0,846 |
| F1 auténtica / manipulada / conexión falsa | 0,821 / 0,890 / 0,826 |
| Macro F1 en subconjunto controlado | 0,893 |
| Subconjunto controlado sin titular | 0,403 |
| Sin titular / sin imagen (a nivel de entrada) | 0,415 / 0,425 |
| Flujos de titular anulados dentro del modelo | 0,642 |
| Robustez: JPEG q30 / reescalado x2 / desenfoque / intercambio de titulares | 0,821 / 0,835 / 0,816 / 0,514 |
| Rama forense en test CASIA: F1 de píxel / IoU / AUC de imagen | 0,285 / 0,235 / 0,927 |
| Latencia por publicación (GPU T4, lote 1): mediana / p90 | 16,6 ms / 21,4 ms |

Línea base de comparación (fusión tardía, 3 semillas): macro F1 0,835 ± 0,001. Grupos más débiles: r/confusing_perspective (47,8% de exactitud) y r/misleadingthumbnails (68,0%).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 106,9 M de parámetros en precisión completa el peso ronda los 0,43 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: el autor reporta latencias medidas en una T4; por tamaño, también es viable en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100, aunque no se publican cifras para estas.
- Cabe en GPU consumer: sí, por el tamaño del modelo y el repositorio de 0,4 GB.
- Opciones de despliegue: la aplicación incluida usa Gradio y se enlaza a 127.0.0.1; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que además no aplican a un clasificador de este tipo.
- Latencia: 17,1 ms de mediana por publicación en T4 con lote 1 (v2); 16,6 ms de mediana y 21,4 ms de p90 en Fase II.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tell v2 | 106,9 M (31,8 M entrenables) | No disponible | 0,811 (test original); 0,614 (estrés) | MIT | Hugging Face |
| Tell Fase II | No disponible | No disponible | 0,846 (test original); 0,514 con titulares intercambiados | MIT | Incluido en el mismo repositorio |
| Línea base de fusión tardía | No disponible | No disponible | 0,835 ± 0,001 | No disponible | Referencia interna del autor |

No se dispone de información sobre otros modelos públicos comparables de análisis forense multimodal en la documentación proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son ruidosas: proceden del subreddit y no de comprobaciones humanas por publicación.
- Atajo de titular medido: en el subconjunto controlado el modelo obtiene 0,89 con titular y 0,40 sin él, por debajo de un modelo solo de imagen (0,61). Un titular corto y humorístico sobre una foto real puede empujar la predicción hacia "manipulado".
- La detección de conexión falsa es débil: al intercambiar titulares entre publicaciones, la proporción de publicaciones clasificadas como conexión falsa solo sube del 0,34 al 0,37.
- Las ediciones de CASIA son splicing y copy-move clásicos; el inpainting moderno y las ediciones generativas pueden pasar desapercibidos.
- La compresión degrada el rendimiento: JPEG q30 baja la macro F1 de 0,846 a 0,821, y la versión sin dropout de flujo pierde 4 puntos. El reenvío por mensajería y las capturas de pantalla debilitan la evidencia de edición.
- Los mapas de calor son aproximados y pueden activarse en regiones de alta textura como follaje o texto superpuesto.
- v2 genera más falsos positivos sobre fotos reales que la Fase II y es menos robusto al desenfoque intenso.
- No debe usarse para borrar, despriorizar o etiquetar contenido sin decisión humana, ni para juzgar la veracidad de una afirmación, ni como evidencia legal o forense.
- No se evaluó con titulares en idiomas distintos del inglés, noticias regionales de la India, vídeo ni imágenes generadas por IA; el rendimiento en esos dominios es desconocido.
- La licencia MIT permite uso comercial, pero el modelo no está diseñado para decisiones automatizadas sin supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maosama0001/tell-v2
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
