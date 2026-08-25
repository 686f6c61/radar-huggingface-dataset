# Redstonexs/danbooru-tagger-v1

## Resumen

`danbooru-tagger-v1` es un clasificador de imágenes multi-etiqueta desarrollado por Redstonexs, especializado en el etiquetado automático de imágenes de ilustración y anime mediante el vocabulario de Danbooru. El modelo parte de `wd-eva02-large-tagger-v3` (WD v3), un tagger basado en la arquitectura EVA02-Large, y lo ajusta finamente sobre 677.355 publicaciones posteriores al corte temporal de entrenamiento de todos los taggers públicos existentes. La innovación principal radica en que, a diferencia de los modelos anteriores que congelaban el encoder, este ajuste fino descongela el encoder completo, lo que eleva el macro-F1 interno de validación de 0,4380 a 0,5692.

El modelo ofrece un vocabulario de 24.000 etiquetas generales, frente a las 8.106 de WD v3, y alcanza una cobertura de 0,914 frente a 0,506 en el conjunto de evaluación. En las métricas agregadas, supera a WD v3 en micro-F1 (0,6569 frente a 0,6369) y macro-F1 (0,4889 frente a 0,4728), pero pierde en precisión media de grano fino (fine AP: 0,5643 frente a 0,5979). El autor publica además un script de ensamblado que combina este modelo con WD v3 y logra superar a cualquier modelo individual, con una macro-AP de 0,5090 frente a 0,4668.

Está disponible bajo licencia Apache-2.0 en formato ONNX (fp16) y PyTorch, lo que facilita su integración en pipelines de inferencia con `onnxruntime`. Su relevancia actual se debe a que los modelos de difusión entrenados con etiquetas Danbooru requieren taggers precisos y actualizados para generar prompts correctos, y este modelo amplía el vocabulario y la cobertura temporal respecto a las alternativas disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EVA02-Large (transformador de visión) |
| Parámetros totales | no disponible (EVA02-Large base ~300 M, sin confirmación exacta) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 448×448) |
| Tipos de cuantización | fp16 (ONNX y PyTorch) |
| Idiomas soportados | no disponible (etiquetas en inglés del vocabulario Danbooru) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp16, opset 18) y PyTorch state dict (`weights.fp16.pt`) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura EVA02-Large, un transformador de visión de la familia EVA02 diseñado para clasificación de imágenes. El punto de partida es el encoder de `wd-eva02-large-tagger-v3`, pero a diferencia de los ajustes anteriores (como `pixai-tagger-v0.9`) que congelaban el encoder y solo entrenaban la cabeza de clasificación, este modelo descongela el encoder completo durante el ajuste fino. El entrenamiento se realizó sobre 677.355 publicaciones de Danbooru con identificadores superiores a 8.600.750, es decir, posteriores al corte temporal de entrenamiento de todos los taggers públicos comparados (WD, Camie, PixAI). El conjunto de validación contiene 11.639 imágenes con IDs superiores a 8.600.750, que ninguna de las alternativas ha visto durante el entrenamiento.

El proceso de preprocesamiento es crítico y no opcional: se compone de composición alfa sobre fondo blanco, relleno a cuadrado con blanco, redimensionado bicúbico a 448×448, escalado a `[0,1]` seguido de `(x - 0.5) / 0.5`, conversión de RGB a BGR y transposición a formato NCHW. El autor advierte que la normalización CLIP por defecto de `timm` no es válida para este modelo y que cualquier desviación de este pipeline degrada el rendimiento silenciosamente. La salida son logits de 24.000 dimensiones que se convierten en probabilidades mediante una sigmoide; no se aplica RLHF ni DPO, sino un entrenamiento supervisado de clasificación multi-etiqueta.

## Capacidades

- Clasificación multi-etiqueta de imágenes con 24.000 etiquetas generales del vocabulario de Danbooru.
- Etiquetado automático de personajes, atributos, escenarios, objetos y estilos de ilustración.
- Soporte para inferencia en lote con entrada NCHW de 448×448 píxeles.
- Capacidad de ensamblado con otros taggers WD mediante el script `ensemble.py` incluido, que promedia las probabilidades sobre 7.800 etiquetas compartidas y usa v1 en solitario para las 16.200 restantes.
- Generación de etiquetas con umbral configurable (0,38 para macro-F1, 0,73 para micro-F1).
- Compatibilidad con ONNX Runtime y PyTorch para integración en entornos variados.
- No incluye soporte de vision-language, tool calling ni agentes; es exclusivamente un clasificador de imágenes.

## Casos de uso

- **Etiquetado de bibliotecas de imágenes de anime**: el modelo puede procesar miles de ilustraciones y asignar automáticamente las etiquetas de Danbooru correspondientes, lo que facilita la organización y búsqueda de colecciones personales o corporativas.
- **Generación de prompts para modelos de difusión**: al etiquetar una imagen de referencia, se obtienen las palabras clave necesarias para construir prompts de modelos como Pony, Illustrious o NoobAI-XL, que fueron entrenados con vocabulario Danbooru.
- **Moderación y filtrado de contenido**: el amplio vocabulario (24.000 etiquetas) permite detectar categorías específicas como `nontraditional_miko`, `cityscape` o `hands_up` con mayor precisión que WD, útil en plataformas que requieren clasificación de contenido.
- **Entrenamiento de modelos de difusión**: el etiquetado preciso de grandes datasets con 677.355 imágenes nuevas permite crear pares imagen-etiqueta para ajustar modelos de generación de imágenes con vocabulario actualizado.
- **Búsqueda inversa de imágenes**: al etiquetar una imagen subida por un usuario, se pueden recomendar etiquetas relacionadas y facilitar la búsqueda de imágenes similares en plataformas de arte.
- **Ensamblado de modelos para alta precisión**: con el script `ensemble.py`, se puede combinar este modelo con `wd-eva02-large-v3` para obtener una macro-AP de 0,5090 y una fine AP de 0,6113, superando a cualquier tagger individual, ideal para aplicaciones donde la calidad de ranking es crítica.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre un conjunto de validación de 11.639 imágenes públicas con IDs superiores a 8.600.750, tras el corte de entrenamiento de todos los modelos comparados. Las métricas se calculan sobre la intersección de los vocabularios de los siete modelos (7.779 etiquetas, de las cuales 3.101 tienen al menos 10 positivos).

| Modelo | micro-F1 | macro-F1 | macro-AP | fine AP | Vocabulario | Cobertura |
|---|---|---|---|---|---|---|
| **v1 (este modelo)** | **0,6569** | **0,4889** | 0,4672 | 0,5643 | 24.000 | **0,914** |
| wd-eva02-large-v3 | 0,6369 | 0,4728 | 0,4668 | **0,5979** | 8.106 | 0,506 |
| wd-vit-large-v3 | 0,6366 | 0,4574 | 0,4576 | 0,5960 | 8.106 | 0,506 |
| wd-swinv2-v3 | 0,6380 | 0,4522 | 0,4549 | 0,5821 | 8.106 | 0,506 |
| pixai-tagger-v0.9 | 0,6060 | 0,4481 | 0,4482 | 0,5696 | 9.740 | 0,588 |
| cl_tagger-1.02 | 0,5744 | 0,3973 | 0,3960 | 0,5329 | 25.098 | 0,869 |
| camie-tagger-v2 | 0,5848 | 0,3592 | 0,3509 | 0,4609 | 30.841 | 0,858 |

*Cobertura = proporción de etiquetas reales en el conjunto de evaluación que el modelo puede emitir.*

Resultados del ensamblado con bootstrap por pares frente a wd-eva02-large-v3:

| Sistema | macro-AP | Δ (IC 95 %) | fine AP | Δ (IC 95 %) |
|---|---|---|---|---|
| v1 solo | 0,4685 | +0,0016 [−0,003, +0,004] | 0,5666 | −0,0315 [−0,049, −0,012] |
| **v1 + wd-eva02** | **0,5090** | **+0,0421 [+0,039, +0,044]** | **0,6113** | **+0,0133 [+0,002, +0,022]** |
| v1 + eva02 + vitL + swinv2 | 0,5153 | +0,0483 [+0,045, +0,050] | 0,6262 | +0,0281 [+0,013, +0,041] |
| eva02 + vitL + swinv2 (control) | 0,4860 | +0,0190 [+0,017, +0,020] | 0,6145 | +0,0164 [+0,002, +0,028] |

## Requisitos de hardware

- El repositorio ocupa 2,0 GB, lo que incluye el modelo ONNX fp16 (autocontenido) y los pesos PyTorch.
- Inferencia con ONNX Runtime: puede ejecutarse en CPU (lenta pero viable) o GPU. Con una GPU de al menos 4 GB de VRAM es suficiente para el modelo fp16 con entrada 448×448.
- GPU recomendadas: NVIDIA RTX 3060/4060 o superior, A10, A100, H100, aunque no se requiere alta capacidad de cómputo para inferencia de una sola imagen.
- El script `ensemble.py` requiere dos pasadas de inferencia (una para v1 y otra para wd-eva02-large-v3), por lo que duplica el coste de inferencia; se recomienda GPU con al menos 8 GB de VRAM para ambos modelos en memoria.
- Despliegue posible con ONNX Runtime en CPU o GPU, TensorRT, y también con PyTorch mediante `weights.fp16.pt`. No se menciona soporte nativo para vLLM, Ollama o llama.cpp, al ser un modelo de visión y no de texto.
- La latencia estimada no se ha publicado; para una sola imagen en GPU se espera un tiempo del orden de milisegundos, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Vocabulario | micro-F1 | macro-F1 | fine AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **danbooru-tagger-v1** | 24.000 | **0,6569** | **0,4889** | 0,5643 | Apache-2.0 | ONNX, PyTorch |
| wd-eva02-large-v3 | 8.106 | 0,6369 | 0,4728 | **0,5979** | Apache-2.0 | ONNX, PyTorch |
| pixai-tagger-v0.9 | 9.740 | 0,6060 | 0,4481 | 0,5696 | no disponible | no disponible |
| cl_tagger-1.02 | 25.098 | 0,5744 | 0,3973 | 0,5329 | no disponible | no disponible |
| camie-tagger-v2 | 30.841 | 0,5848 | 0,3592 | 0,4609 | no disponible | no disponible |

La comparativa muestra que v1 es superior en micro-F1 y macro-F1, y muy superior en cobertura, pero pierde en fine-grained AP frente a wd-eva02-large-v3. El ensamblado de v1 con WD v3 supera a todos los modelos individuales en ambas métricas de ranking (macro-AP y fine AP), como se muestra en la sección de benchmarks.

## Limitaciones y advertencias

- **Pérdida en fine-grained AP**: v1 obtiene una fine AP de 0,5643, inferior a los 0,5979 de wd-eva02-large-v3, con un intervalo de confianza del 95 % que no incluye cero (−0,0336 [−0,052, −0,015]). Esto indica que la calidad de ranking de las etiquetas finas es significativamente peor.
- **Preprocesamiento obligatorio**: el modelo degrada silenciosamente si no se aplica exactamente la pipeline descrita (alpha sobre blanco, padding, resize a 448×448, normalización `(x-0.5)/0.5`, conversión BGR, NCHW). La normalización CLIP por defecto de `timm` no es válida.
- **Vocabulario limitado a etiquetas generales**: no incluye etiquetas de personajes específicos, solo las 24.000 etiquetas generales del vocabulario de Danbooru.
- **Umbrales optimizados sobre el conjunto de evaluación**: los umbrales de 0,38 (macro-F1) y 0,73 (micro-F1) se ajustaron sobre el propio conjunto de evaluación, por lo que los valores absolutos de F1 son optimistas; la comparación entre modelos es justa porque se aplicó el mismo procedimiento a todos.
- **Riesgo de alucinación en etiquetas**: al ser un clasificador multi-etiqueta con 24.000 etiquetas, puede emitir etiquetas incorrectas para imágenes ambiguas, especialmente en categorías finas como flores o elementos decorativos.
- **Licencia Apache-2.0**: permite uso comercial y modificación, pero hay que mantener el aviso de copyright y la atribución; no hay restricciones específicas de uso comercial más allá de las de la licencia.
- **Sin datos de sesgos**: no se ha documentado la composición demográfica o cultural del conjunto de entrenamiento, por lo que pueden existir sesgos en las etiquetas relacionadas con vestimenta, cultura o estereotipos.

## Enlaces

- HuggingFace: https://huggingface.co/Redstonexs/danbooru-tagger-v1
- GitHub danbooru/autotagger: https://github.com/danbooru/autotagger
- Artículo de Civitai sobre herramientas de Danbooru: https://civitai.red/articles/27794/the-danbooru-tools-directory-for-ai-art-2026
- HuggingFace Spaces con WD tagger: https://huggingface.co/spaces/John6666/danbooru-tags-transformer-v2-with-wd-tagger
- dbtagger (explorador de etiquetas): https://dbtagger.com/
- GitHub anthony-dipofi/danbooru-tagger: https://github.com/anthony-dipofi/danbooru-tagger
