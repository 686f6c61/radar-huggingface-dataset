# amorsi/micro-sam-vit-l-histopathology

## Resumen

`amorsi/micro-sam-vit-l-histopathology` es un espejo (mirror) del checkpoint `vit_l_histopathology` del proyecto micro-sam, desarrollado por el grupo Computational Cell Analytics (MIT-licensed en lo relativo al codigo). El modelo resuelve el problema de la segmentacion interactiva de nucleos en imagenes de histopatologia, adaptando la formulacion de Segment Anything (SAM) al dominio microscopico mediante un encoder ViT Large.

La relevancia del modelo radica en que SAM original fue entrenado sobre imagenes naturales y rinde de forma suboptima en microscopia; micro-sam aplica fine-tuning especifico de dominio con prompts interactivos (puntos positivos/negativos, cajas delimitadoras o mascaras de baja resolucion) para producir mascaras de nucleos celulares en tejido histopatologico. El checkpoint se publica como copia sin modificar, verificable mediante hashes xxh128 contra el registro oficial de micro-sam.

El repositorio ocupa 1,3 GB e incluye los pesos `model.pt` (encoder) y `decoder.pt`. No se dispone de informacion sobre licencia de los pesos, idiomas ni resultados de benchmarks en la informacion proporcionada; el autor remite explicitamente a la fuente original para los terminos de licencia de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT Large (image encoder de SAM) con decoder de segmentacion tipo SAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; no aplica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible para los pesos; el codigo de micro-sam es MIT |
| Formato de pesos | PyTorch (`model.pt`, `decoder.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAM: un image encoder basado en Vision Transformer Large que produce embeddings de la imagen, y un decoder ligero que, a partir de prompts (puntos, cajas o mascaras de baja resolucion), predice la mascara del objeto. En este caso el encoder es ViT-L y el checkpoint ha sido adaptado al dominio de histopatologia para la segmentacion de nucleos celulares.

Segun la model card, se trata de una copia sin modificar del checkpoint preentrenado de micro-sam, con hashes xxh128 coincidentes con el registro de `util.py` del repositorio oficial. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF/DPO (no aplicables a un modelo de segmentacion). El uso previsto es mediante micro-sam con `model_type="vit_l_histopathology"`.

## Capacidades

- Segmentacion interactiva de imagenes: genera mascaras a partir de prompts de punto, caja delimitadora o mascara de baja resolucion.
- Segmentacion de nucleos en imagenes de histopatologia, dominio especifico para el que fue adaptado el checkpoint.
- Segmentacion automatica (sin prompt manual) cuando se integra con los modulos de micro-sam que generan prompts de forma automatica.
- No soporta tool calling ni function calling (no es un modelo linguistico).
- No soporta razonamiento multi-paso ni agentes.
- Sin capacidades multilingues: es un modelo puramente visual.
- Sin modo thinking, vision multimodal ni audio; la entrada es una imagen y los prompts geometricos.

## Casos de uso

- Segmentacion de nucleos en laminas histopatologicas digitalizadas: se carga el checkpoint en micro-sam con `model_type="vit_l_histopathology"` y se proporcionan puntos o cajas sobre los nucleos de interes para obtener mascaras precisas, lo que permite cuantificar densidad nuclear en estudios de patologia.
- Analisis de imagenes de inmunohistoquimica: el modelo segmenta nucleos teñidos para calcular indices de proliferacion (por ejemplo, recuento de celulas positivas) sobre regiones de interes marcadas por el patologo.
- Anotacion asistida en pipelines de investigacion: integrado en flujos de micro-sam, permite generar mascaras iniciales que el investigador corrige con prompts negativos, reduciendo el tiempo de anotacion manual frente a la segmentacion pixel a pixel.
- Morfometria nuclear: a partir de las mascaras generadas se pueden extraer areas, perimetros y relaciones nucleo-citoplasma para estudios de atipia o clasificacion de tejidos.
- Preprocesado para modelos de clasificacion: las mascaras de nucleos sirven como entrada para pipelines posteriores de clasificacion de tejido o deteccion de patrones arquitecturales.
- Control de calidad de segmentaciones en lote: al ser un checkpoint de referencia con hashes verificables, es adecuado para reproducir experimentos y comparar resultados entre laboratorios que usen la misma version del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 1,3 GB en pesos (encoder ViT-L mas decoder), lo que orienta a un consumo moderado en GPU, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de pesos (1,3 GB) sugiere que podria caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: micro-sam (libreria oficial, con `model_type="vit_l_histopathology"`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-sam `vit_l_histopathology` (este) | ViT-L, total no disponible | no aplica | no disponible | pesos: no disponible; codigo micro-sam: MIT | Hugging Face (mirror) y ownCloud original |
| SAM original (ViT-L) | ViT-L, total no disponible | no aplica | no disponible en esta ficha | no disponible en esta ficha | Ampliamente disponible |
| Otros checkpoints micro-sam (p. ej. `vit_b_*`, `vit_l_*` de otros dominios) | ViT-B / ViT-L | no aplica | no disponible | codigo MIT; pesos segun fuente | Hugging Face / ownCloud |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un mirror sin modificar: la responsabilidad sobre los terminos de licencia de los pesos recae en la fuente original (ownCloud de GWDG); la model card advierte explicitamente de que se consulte el origen para la licencia.
- No se especifica licencia de los pesos en la model card, lo que impide confirmar si el uso comercial esta permitido.
- Modelo de vision sin capacidades linguisticas: no admite prompts en lenguaje natural, solo prompts geometricos (puntos, cajas, mascaras).
- Especifico de dominio histopatologico: su rendimiento fuera de ese tipo de imagenes (microscopia de fluorescencia, imagenes naturales, etc.) no esta documentado y probablemente sea inferior a checkpoints especializados en esos dominios.
- Riesgo de mascaras imprecisas en tejidos con nucleos solapados, artefactos de tincion o baja resolucion; la calidad depende de la formulacion del prompt.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible cuantificar su precision frente a alternativas.
- Al ser una copia de un checkpoint de referencia, cualquier actualizacion del modelo original no se refleja automaticamente en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/amorsi/micro-sam-vit-l-histopathology
- Repositorio micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Codigo de referencia de hashes (`util.py`): https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Documentacion de la API de micro-sam: https://computational-cell-analytics.github.io/micro-sam/micro_sam.html
- Pesos originales `model.pt`: https://owncloud.gwdg.de/index.php/s/IZgnn1cpBq2PHod/download
- Pesos originales `decoder.pt`: https://owncloud.gwdg.de/index.php/s/oIs6VSmkOp7XrKF/download
- Paper "Segment Anything for Histopathology": https://arxiv.org/html/2502.00408v2
