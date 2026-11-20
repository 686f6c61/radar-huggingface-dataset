# medarc/spectra-midnight-12k-merged

## Resumen

Midnight-12k-SPECTRA es un extractor de características visuales para patología digital desarrollado por MedARC y Sophont. Parte del modelo base kaiko-ai/midnight, un transformer de visión tipo DINOv2, y se ha adaptado mediante el método SPECTRA: un entrenamiento contrastivo sobre teselas (tiles) de imágenes histológicas registradas del dataset PLISM, que alinea las representaciones del mismo tejido entre distintos escáneres y tinciones. El resultado es un modelo que mapea teselas RGB de histología a embeddings de 3072 dimensiones para análisis posteriores.

El modelo resuelve un problema concreto en pipelines de patología computacional: la variabilidad de dominio entre escáneres y protocolos de tinción degrada la calidad de los embeddings extraídos y, con ello, el rendimiento de los clasificadores y modelos de supervivencia aguas abajo. Al entrenar con un objetivo contrastivo que fuerza la invariancia a escáner y tinción, las representaciones resultantes son más estables y transferibles entre cohortes.

Con 1.136.480.768 parámetros y un repositorio de 13,6 GB, es un modelo de tamaño medio-grande para el estándar de extractores de características. Se distribuye con licencia MIT y todos los pesos de inferencia fusionados en el checkpoint, por lo que no requiere adaptadores ni acceso a clústeres adicionales. La model card no publica resultados de benchmarks ni el paper asociado, que figura como "coming soon".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (DINOv2, según el tag `dinov2`); backbone base kaiko-ai/midnight |
| Parámetros totales | 1.136.480.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión por teselas; entrada 224 × 224 píxeles) |
| Tipos de cuantización | no disponible (la model card solo documenta pesos en safetensors en precisión de inferencia) |
| Idiomas soportados | no disponible (modelo de visión; la model card declara `language: en` para documentación) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Dimensión de embedding | 3072 (concatenación del token CLS y la media de tokens de parche) |
| Preprocesado | Resize bilineal a 224, CenterCrop 224 × 224, Normalize mean/std (0.5, 0.5, 0.5) |
| Pipeline | image-feature-extraction |
| Tamaño del repositorio | 13,6 GB |

## Arquitectura y entrenamiento

El modelo se basa en kaiko-ai/midnight, un transformer de visión de la familia DINOv2 (así lo indica el tag `dinov2` del repositorio) con aproximadamente 1,14 mil millones de parámetros. La adaptación SPECTRA no cambia la arquitectura: se entrena un objetivo contrastivo sobre teselas de imagen histológica del dataset PLISM, registradas de modo que la misma región de tejido aparece bajo distintos escáneres y tinciones. El objetivo alinea las representaciones de esas vistas aumentadas, de forma que el embedding de una tesela sea estable frente a la variación de dominio instrumental y de tinción.

Tras el entrenamiento, las actualizaciones aprendidas se fusionan en los pesos completos del modelo, de manera que el checkpoint distribuido contiene todos los pesos de inferencia y no necesita un checkpoint base separado ni un adaptador. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon fases de ajuste adicionales; tampoco se especifica el tamaño de las teselas de entrenamiento más allá del preprocesado de inferencia documentado (224 × 224). No se han publicado detalles sobre la función de pérdida concreta, el tamaño de lote o el régimen de aumento de datos más allá de la mención al registro entre escáneres y tinciones.

## Capacidades

- Extracción de características de imágenes: genera embeddings de 3072 dimensiones a partir de teselas RGB de histología.
- Invariancia a dominio: las representaciones están alineadas entre escáneres y tinciones mediante el objetivo contrastivo SPECTRA.
- Representación a nivel de token y de imagen: expone `last_hidden_state`, del que se obtiene el token CLS y la media de los tokens de parche.
- Uso como extractor congelado: pensado para alimentar clasificadores, modelos de supervivencia o sistemas de recuperación aguas abajo.
- Inferencia en CPU y GPU: la model card documenta ambos modos (`device = "cuda"` o `"cpu"`).
- Compatibilidad con `transformers` (versión 4.57.6 en el ejemplo) y `safetensors`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo puramente visual de extracción de características.
- No se documentan capacidades multimodales (texto-imagen), audio ni vídeo.

## Casos de uso

- Búsqueda de imágenes por similitud en archivos de patología: indexar las teselas de una colección con embeddings de 3072 dimensiones y recuperar casos morfológicamente similares mediante búsqueda vectorial; la invariancia a escáner y tinción reduce los falsos positivos por lote o laboratorio.
- Clasificación de tejido con etiquetas escasas: usar el extractor congelado y entrenar una regresión logística o un MLP ligero sobre los embeddings para tareas como tejido tumoral frente a sano, aprovechando que el espacio de representación ya está alineado entre fuentes.
- Control de calidad y detección de deriva entre escáneres: comparar la distribución de embeddings de teselas de un mismo tejido adquiridas con equipos distintos; una divergencia anómala puede señalar un problema de calibración o de protocolo de tinción.
- Modelos de supervivencia y pronóstico: agregar embeddings de múltiples teselas de una misma laminilla y entrenar un modelo de supervivencia aguas abajo; la estabilidad de las representaciones entre cohortes facilita la validación externa.
- Preentrenamiento de modelos de múltiples instancias (MIL): emplear los embeddings como entrada de un agregador tipo attention-MIL para clasificación a nivel de laminilla, reduciendo el coste frente a entrenar un encoder desde cero.
- Segmentación y detección asistida: combinar los mapas de tokens de parche con cabezas ligeras para localizar regiones de interés dentro de una tesela, útil en herramientas de revisión para patólogos.
- Agrupamiento no supervisado de morfologías: aplicar clustering sobre los embeddings para descubrir patrones morfológicos recurrentes en un archivo sin etiquetas, como paso previo a la anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el paper está "coming soon" y no incluye métricas de recuperación, clasificación ni comparativas con otros extractores de patología.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 4,5 GB solo para pesos (1,14 mil millones de parámetros × 4 bytes), más activaciones y memoria del pipeline; con lotes pequeños, un presupuesto de 8-10 GB es razonable.
- VRAM estimada en fp16/bf16: en torno a 2,3 GB para pesos, más activaciones; cabe holgadamente en GPUs de consumo con 8 GB o más.
- GPU recomendadas: A100, H100 o L40S para procesar grandes volúmenes de teselas en producción; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y lotes moderados.
- GPU de consumo: sí cabe en tarjetas de 8 GB o más en precisión reducida; también puede ejecutarse en CPU, según documenta la model card, aunque con menor throughput.
- Opciones de despliegue: `transformers` con PyTorch (documentado en la model card); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a este tipo de encoder visual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Embedding | Licencia | Notas |
|---|---|---|---|---|---|
| medarc/spectra-midnight-12k-merged | 1.136.480.768 | Teselas 224 × 224 | 3072 | MIT | Adaptación contrastiva SPECTRA sobre midnight; invariancia a escáner y tinción |
| kaiko-ai/midnight | no disponible en la información | Teselas (modelo base) | no disponible | no disponible | Modelo base sobre el que se aplica SPECTRA; sin el ajuste contrastivo documentado aquí |
| Otros extractores de patología (p. ej. familia UNI, Virchow, Prov-GigaPath) | no disponible en la información | no disponible | no disponible | no disponible | Alternativas habituales de la categoría; sin datos verificados en la información proporcionada para comparar cifras |

La información disponible solo permite comparar con el modelo base. No se dispone de métricas de rendimiento de ninguno de los modelos citados para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No se han publicado benchmarks ni el paper asociado; el rendimiento real frente a otros extractores de patología no está verificado de forma independiente.
- Los embeddings son a nivel de tesela: las predicciones a nivel de laminilla requieren un modelo aguas abajo, tal como advierte la model card.
- El preprocesado está fijado en la documentación (resize bilineal a 224, center crop 224, normalización con media y desviación 0,5); desviarse de él puede degradar la calidad de las representaciones.
- Riesgo de sesgo por dominio: aunque el entrenamiento busca invariancia entre escáneres y tinciones, no se documenta la cobertura de tejidos, órganos, laboratorios o poblaciones del dataset PLISM, por lo que la generalización a dominios no vistos es incierta.
- No es un modelo generativo: no produce texto ni diagnósticos; cualquier uso clínico requeriría validación regulatoria y supervisión profesional.
- La licencia MIT permite uso comercial, pero debe verificarse la licencia y las condiciones del modelo base kaiko-ai/midnight, de la que no se dispone información en esta ficha.
- No se documentan limitaciones idiomáticas ni multilingües porque el modelo no procesa texto.
- El tamaño del repositorio (13,6 GB) implica costes de almacenamiento y de transferencia relevantes para despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medarc/spectra-midnight-12k-merged
- Modelo base: https://huggingface.co/kaiko-ai/midnight
- MedARC: https://www.medarc.ai/
- Sophont: https://sophont.med/
- Paper: pendiente de publicación según la model card ("coming soon")
