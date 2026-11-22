# RISHIKAMASHETTY/sam-model

## Resumen

`RISHIKAMASHETTY/sam-model` es un ajuste fino del modelo Segment Anything Model (SAM) de Meta en su variante `facebook/sam-vit-base`, especializado en la segmentación de daños sintéticos sobre pinturas de patrimonio cultural indio. Lo desarrolla el usuario RISHIKAMASHETTY y se distribuye con licencia Apache 2.0. El modelo parte de la arquitectura ViT-B de SAM (un codificador de imagen ViT seguido de un decodificador de máscaras ligero) y congela el codificador de imagen durante el entrenamiento, actualizando únicamente el decodificador de máscaras.

El problema que aborda es acotado: la detección y delimitación de regiones de daño en imágenes de pinturas, entrenado sobre un conjunto de datos propio de daños sintéticos (`RISHIKAMASHETTY/indian-paintings-synthetic-damage`). No es un modelo generativo de lenguaje, sino un modelo de segmentación de imágenes, por lo que muchas de las categorías habituales de una ficha de LLM (contexto, idiomas, tool calling) no aplican.

Su relevancia es limitada y experimental: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el autor advierte explícitamente que todo el daño del conjunto de entrenamiento es sintético y que los resultados no establecen rendimiento sobre deterioro real. Debe tratarse, por tanto, como una prueba de concepto de ajuste fino de SAM para un dominio muy específico, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM (Segment Anything Model), ViT-B: codificador de imagen ViT + decodificador de máscaras |
| Parámetros totales | 93.735.728 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `facebook/sam-vit-base`: un codificador de imagen basado en Vision Transformer (ViT-B) que produce embeddings de la imagen, y un decodificador de máscaras que, a partir de prompts (puntos, cajas o máscaras), genera las segmentaciones. En este ajuste fino, según la model card, se congela el codificador de imagen y solo se entrena el decodificador de máscaras, lo que reduce drásticamente el coste de entrenamiento y el número de parámetros efectivamente actualizados.

El conjunto de datos de entrenamiento es `RISHIKAMASHETTY/indian-paintings-synthetic-damage`, compuesto por pinturas indias con daños generados de forma sintética. El repositorio incluye artefactos de entrenamiento: `training_config.json` con la configuración, `results/epoch_losses.csv` y `results/loss_curve.png` con las curvas de pérdida, y `results/split_files.csv` con las listas de ficheros de entrenamiento y validación. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de segmentación). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación de imágenes por prompts: genera máscaras a partir de puntos, cajas o máscaras de entrada, según el comportamiento estándar de SAM.
- Segmentación especializada en daños sintéticos sobre pinturas de patrimonio cultural indio.
- Capacidad de segmentación genérica heredada del modelo base `facebook/sam-vit-base` (no verificada tras el ajuste fino).
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa texto).
- Sin modo thinking, visión descriptiva, audio ni otras capacidades multimodales más allá de la segmentación visual.

## Casos de uso

- Documentación de daños en pinturas: dado que el modelo segmenta regiones de daño sintético, puede emplearse en flujos de catalogación de obras para marcar áreas afectadas, siempre que se valide antes sobre deterioro real.
- Prueba de concepto de ajuste fino de SAM: sirve como referencia técnica para equipos que quieran replicar el pipeline de congelar el codificador y entrenar solo el decodificador sobre un dataset propio de dominio.
- Investigación en conservación de patrimonio: punto de partida para experimentar con segmentación de daños en colecciones de pintura india, con la advertencia de que el entrenamiento es sintético.
- Generación de máscaras auxiliares en pipelines de restauración digital: las máscaras producidas pueden alimentar herramientas de inpainting o edición para aislar zonas dañadas.
- Evaluación comparativa de SAM frente a variantes ajustadas: permite medir la diferencia entre el SAM base y un ajuste de dominio en tareas de segmentación de daños.
- Docencia y experimentación: ejemplo práctico de fine-tuning de un modelo de segmentación con `transformers` (`SamModel` y `SamProcessor`), útil en cursos y talleres.
- Automatización de anotación asistida: puede preanotar regiones candidatas de daño para que un humano las revise, reduciendo el trabajo manual en la creación de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 93,7 millones de parámetros, los pesos en fp32 ocupan aproximadamente 375 MB; en fp16, unos 187 MB. La VRAM real necesaria es mayor por las activaciones del codificador ViT y el procesamiento de imágenes de entrada.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia; para entrenamiento del decodificador, una GPU de gama media como RTX 3060/4090 o A100 es adecuada.
- Cabe en GPU de consumo: sí, en la mayoría de GPU consumer modernas (RTX 3060 en adelante), dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` (SamModel/SamProcessor) es la vía documentada; no se han publicado variantes GGUF ni integraciones con vLLM, llama.cpp u Ollama (no aplicables a segmentación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RISHIKAMASHETTY/sam-model | 93,7 M | SAM ViT-B ajustado | Apache 2.0 | Hugging Face | Ajuste de dominio, daño sintético |
| facebook/sam-vit-base | ~93 M (ViT-B) | SAM base | Apache 2.0 | Hugging Face | Modelo base sin ajuste de dominio |
| SAM 2 (Meta) | no disponible | SAM de vídeo/imagen | Apache 2.0 (variantes) | Hugging Face / Meta | Evolución de SAM con soporte de vídeo |
| Segment Anything (ViT-H) | no disponible | SAM ViT-H | Apache 2.0 | Hugging Face / Meta | Variante de mayor capacidad del modelo original |

## Limitaciones y advertencias

- El propio autor advierte que todo el daño del conjunto de entrenamiento es sintético y que los resultados no establecen rendimiento sobre deterioro real.
- Riesgo de sobreajuste al dominio sintético: la segmentación puede no generalizar a pinturas reales con daños auténticos.
- Sesgos conocidos: el dataset se limita a pinturas indias, por lo que el comportamiento en otras tradiciones pictóricas es incierto.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso comunitario ni validación externa.
- Licencia Apache 2.0: permite uso comercial, pero la falta de validación sobre datos reales desaconseja su uso en producción sin evaluación previa.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, razonamiento o generación.
- No se documentan limitaciones de contexto ni de idioma porque no aplican; la limitación relevante es la de dominio y la de calidad del dataset.
- En producción, conviene comparar sus máscaras con las del SAM base y validar con anotaciones humanas antes de integrarlo en flujos de conservación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RISHIKAMASHETTY/sam-model
- Dataset de entrenamiento: https://huggingface.co/datasets/RISHIKAMASHETTY/indian-paintings-synthetic-damage
- Modelo base: https://huggingface.co/facebook/sam-vit-base
- Paper de SAM (Segment Anything): https://arxiv.org/abs/2304.02643
- Repositorio oficial de SAM (Meta): https://github.com/facebookresearch/segment-anything
