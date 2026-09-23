# mrfakename/w2v-bert-2.0-music

## Resumen

w2v-bert-2.0-music es un encoder auto-supervisado de audio publicado por el usuario mrfakename en HuggingFace. Se trata de un «continued pretraining» del modelo facebook/w2v-bert-2.0 sobre aproximadamente 47.500 horas de música (mezclas completas, mono a 16 kHz) manteniendo el objetivo auto-supervisado original: no se usaron etiquetas ni separación de fuentes. El resultado es un reemplazo directo del encoder original, adaptado al dominio musical, con la misma interfaz de uso en `transformers`.

El problema que resuelve es la falta de representaciones genéricas de audio musical entrenadas con objetivos auto-supervisados a gran escala. Al conservar la arquitectura y el formato del modelo base, puede sustituir al encoder de w2v-bert-2.0 en cualquier pipeline existente (extracción de características, fine-tuning posterior para tareas downstream) sin cambios de código. El modelo tiene 580.493.120 parámetros y produce representaciones de 1024 dimensiones a 50 Hz a partir de audio mono de 16 kHz.

Su relevancia actual es doble: por un lado, es un caso práctico de adaptación de dominio de un modelo de voz a música sin etiquetas; por otro, publica las métricas de entrenamiento (pérdida contrastiva, precisión contrastiva, precisión de predicción enmascarada y uso del codebook) que permiten evaluar si el ajuste ha sido efectivo antes de invertir en fine-tuning downstream. La licencia MIT facilita su uso comercial, aunque el modelo no incluye evaluación en tareas downstream de referencia (benchmarks públicos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | w2v-BERT (conformer self-supervised: pérdida contrastiva wav2vec 2.0 + predicción enmascarada), heredada de facebook/w2v-bert-2.0 |
| Parámetros totales | 580.493.120 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; en entrenamiento se usaron clips de 20 s a 16 kHz (≈1000 frames a 50 Hz). No es un modelo de contexto textual |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | No disponible (modelo de audio; no procesa texto ni está etiquetado por idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `pretraining_heads.pt` con cuantizador, cabezas contrastivas y cabeza de predicción enmascarada |
| Tamaño del repositorio | 2,3 GB |
| Pipeline en HuggingFace | feature-extraction |
| Modelo base | facebook/w2v-bert-2.0 |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Dimensión de salida / tasa de frames | 1024 / 50 Hz |

## Arquitectura y entrenamiento

La arquitectura es la del w2v-BERT original, un encoder de tipo conformer entrenado de forma auto-supervisada. El objetivo combina tres componentes: una pérdida contrastiva wav2vec 2.0 aplicada en la capa 8 (con 100 distractores y un cuantizador Gumbel de 2 × 320 códigos, es decir 640 códigos en total), una pérdida de diversidad con peso 0,1, y predicción enmascarada de los códigos del cuantizador en la capa final. El enmascaramiento se aplica en tramos de 10 frames y puede cubrir hasta el 65 % de los frames.

El punto de partida fue el checkpoint `conformer_shaw.pt` publicado por Meta: el encoder, el cuantizador y las cabezas contrastivas se inicializaron desde ahí, y las cabezas coinciden exactamente con el encoder. La cabeza de predicción enmascarada nunca se publicó, por lo que se entrenó desde cero: 1.000 pasos con solo esa cabeza aprendiendo y después el modelo completo. El entrenamiento total fue de 50.000 pasos, con 576 clips de 20 s por paso (3,2 h de audio por paso), lo que equivale a aproximadamente 160.000 horas vistas, unas 3,4 pasadas sobre los datos. Se usó AdamW con learning rate 1e-4, 4.000 pasos de warmup y decaimiento coseno hasta 1e-5, en bf16, con la temperatura del Gumbel fijada en 0,1.

No se aplicaron fases de RLHF, DPO ni ajuste con instrucciones: es un modelo puramente auto-supervisado de representación, sin generación autoregresiva.

## Capacidades

- Extracción de representaciones de audio musical: devuelve `last_hidden_state` con forma (1, frames a 50 Hz, 1024) para audio mono de 16 kHz.
- Reemplazo directo del encoder facebook/w2v-bert-2.0: mantiene la configuración original, así que los defaults de fine-tuning de `transformers` siguen aplicando.
- Adaptación al dominio musical sin etiquetas ni separación de fuentes: aprende directamente sobre mezclas completas.
- Base para fine-tuning supervisado en tareas de música (clasificación de género, etiquetado automático, detección de beats, similitud, etc.).
- Base para extracción de características en pipelines de generación o separación musical como front-end congelado.
- Continuación del preentrenamiento: el archivo `pretraining_heads.pt` permite reanudar el entrenamiento auto-supervisado con el mismo objetivo.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio-texto (no es un modelo tipo CLAP) ni transcripción: no hay decodificador ni vocabulario de texto.

## Casos de uso

- Etiquetado automático de catálogos musicales: extraer embeddings a 50 Hz de cada pista y entrenar un clasificador ligero de género, estado de ánimo o instrumentación encima del encoder congelado, aprovechando que las representaciones ya están adaptadas a mezclas musicales completas.
- Sistemas de recomendación y búsqueda por similitud: indexar los embeddings medios o por segmento de cada tema y resolver consultas de «más parecido a esto» mediante similitud coseno en un espacio de 1024 dimensiones.
- Detección de similitud y plagio musical: comparar representaciones de fragmentos de 20 s para localizar secciones candidatas a coincidencia entre dos pistas, sin necesidad de transcripción ni partitura.
- Análisis de estructura musical: usar la secuencia de frames a 50 Hz para segmentar intro, estrofa, estribillo o breakdown con un modelo secuencial ligero entrenado encima.
- Front-end para separación de fuentes o generación musical: sustituir el encoder de voz por este en arquitecturas que consumen características auto-supervisadas y comprobar si mejora la reconstrucción en dominio musical.
- Monitorización de audio en producción (radio, streaming, podcasts): detección de cambios de contenido o anomalías a partir de la deriva de los embeddings entre ventanas consecutivas, con coste de inferencia de una única pasada forward por ventana.
- Investigación en representaciones auto-supervisadas: punto de comparación controlado frente al modelo base de Meta para medir el efecto de un continued pretraining de ~47,5k horas en un dominio concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente proporciona métricas de entrenamiento sobre la propia distribución de música, promediadas sobre 50 pasos. Durante los primeros 1.000 pasos el encoder estuvo congelado con los pesos originales, por lo que la fila del paso 550 refleja el modelo base sobre estos datos.

| Paso | Pérdida contrastiva | Precisión contrastiva | Precisión de predicción enmascarada | Códigos en uso (de 640) |
|---|---|---|---|---|
| 550 (encoder base, congelado) | 1,98 | 46,1 % | 20,1 %* | ~499 |
| 26.600 | 1,65 | 53,7 % | 25,1 % | ~532 |
| 50.000 | 1,62 | 54,5 % | 25,7 % | ~534 |

\* La cabeza de predicción enmascarada se entrenó desde cero, por lo que su precisión no tiene referencia del modelo base. El azar en esa tarea es 1/320 (0,31 %).

Según el autor, la pérdida contrastiva cae aproximadamente un 18 % en términos relativos respecto al modelo original usando las propias cabezas contrastivas de Meta. Estas cifras proceden de la distribución de entrenamiento, no de una tarea downstream con conjunto de validación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,3 GB en fp32 y aproximadamente 1,2 GB en fp16/bf16 solo para los pesos; sumando activaciones para ventanas de 20 s, el consumo práctico se mantiene bajo.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. Para lotes grandes o extracción masiva de un catálogo, se recomiendan A100, H100, L40S o RTX 4090 por throughput agregado.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 3090, RTX 4090 y equivalentes; incluso en GPUs integradas o en CPU con `transformers` para volúmenes pequeños.
- Opciones de despliegue: `transformers` con `Wav2Vec2BertModel` y `AutoFeatureExtractor` (ruta soportada oficialmente). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables directamente; TGI y vLLM no ofrecen soporte específico documentado para este pipeline de feature-extraction en la información disponible.
- Latencia y throughput: no disponible. Al no ser un modelo autoregresivo, el coste por ventana es una única pasada forward; la latencia dependerá de la longitud del audio y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| mrfakename/w2v-bert-2.0-music | 580.493.120 | Música (47,5k h de mezclas completas) | MIT | HuggingFace, `transformers` |
| facebook/w2v-bert-2.0 | No confirmado en la información disponible (mismo orden de magnitud) | Voz multilingüe a gran escala | No disponible en la información proporcionada | HuggingFace, `transformers` |
| m-a-p/MERT-v1-330M | 330 M (según el nombre del modelo) | Música | No disponible en la información proporcionada | HuggingFace |
| CLAP (laion/clap-htsat-unfused y similares) | No disponible | Audio y música con texto (audio-texto) | No disponible en la información proporcionada | HuggingFace |

Diferencias clave: frente a w2v-bert-2.0, este modelo comparte arquitectura y pesos de partida pero ha visto ~160.000 horas de música en lugar de voz, lo que lo hace intercambiable en código aunque especializado en otro dominio. Frente a MERT, la diferencia principal es el dominio de preentrenamiento y el tamaño. Frente a CLAP, la diferencia es funcional: CLAP permite búsqueda texto-audio porque entrena un espacio conjunto con texto, mientras que w2v-bert-2.0-music solo produce representaciones de audio sin componente textual.

## Limitaciones y advertencias

- No se han publicado evaluaciones en tareas downstream con conjuntos de test independientes. Las únicas métricas son de entrenamiento sobre la propia distribución, por lo que no hay evidencia pública de mejora en género, etiquetado o detección de beats.
- La mejora reportada (≈18 % de caída relativa en pérdida contrastiva) se mide con las cabezas contrastivas del modelo original y sobre datos de la misma distribución de entrenamiento; puede no trasladarse a otros estilos, épocas o grabaciones.
- No se documenta la composición del dataset de ~47,5k horas, por lo que se desconocen sesgos de género musical, época, procedencia geográfica o calidad de audio. Los sesgos derivados serán los del corpus utilizado.
- Modelo exclusivamente de audio: no decodifica texto, no genera audio y no puede usarse para transcripción, subtitulado ni diálogo.
- La cabeza de predicción enmascarada se entrenó desde cero y su precisión final es baja en términos absolutos (25,7 % frente a un azar de 0,31 %); conviene no interpretarla como una capacidad de predicción fiable.
- El modelo procesa audio mono a 16 kHz; las mezclas musicales con contenido por encima de 8 kHz pierden información de alta frecuencia, lo que puede afectar a tareas que dependan de brillo, platillos o detalle espectral.
- No hay pesos cuantizados publicados (GGUF, int8, 4 bits), de modo que el despliegue en entornos con restricciones fuertes de memoria requiere generarlos internamente y validar la degradación.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda revisar las condiciones del modelo base facebook/w2v-bert-2.0 y de los datos de música empleados, ya que la model card no detalla la procedencia del corpus.
- El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrfakename/w2v-bert-2.0-music
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Paper de w2v-BERT (arquitectura y objetivo originales): https://arxiv.org/abs/2108.06209
- No se han encontrado otros enlaces relevantes en la búsqueda web proporcionada.
