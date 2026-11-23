# Dayoung-space/EUMU

## Resumen

EUMU (Efficient Unified Multimodal Understanding) es un modelo multimodal compacto desarrollado por Dayoung-space que resuelve tres tareas de comprensión visual con una única arquitectura: etiquetado de imágenes (image tagging), detección de objetos con vocabulario abierto (open-vocabulary object detection) y generación de descripciones (image captioning). Se trata de la solución ganadora del primer puesto en la pista MUMU (Mobile Unified Multimodal Understanding) del 8.º reto LSVOS, celebrado en ECCV 2026, con una puntuación final de 17.3409.

El modelo parte del backbone preentrenado Florence-2-base de Microsoft, que permanece congelado, y añade únicamente cabezas ligeras de etiquetado entrenadas, mientras que la detección y el captioning se apoyan en las capacidades de prompting ya presentes en el modelo base. Con 239,169 millones de parámetros y 23,947 GFLOPs a 224×224, cumple las restricciones del reto: un único modelo integrado de menos de 0,5B de parámetros y menos de 8 GB de memoria pico en inferencia (reporta 4,5 GB).

Su relevancia radica en demostrar que es posible obtener un rendimiento competitivo en múltiples tareas visuales sin entrenar modelos específicos por tarea ni hacer fine-tuning completo, mediante refinamiento de inferencia consciente de la tarea que reutiliza las predicciones de unas tareas para mejorar las de otras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Florence-2-base (backbone transformer congelado) con cabezas MLP ligeras de etiquetado |
| Parametros totales | 239,169 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (backbone `model.safetensors`); cabezas de etiquetado en `task_a_heads.pt` (PyTorch) |

## Arquitectura y entrenamiento

EUMU emplea un backbone Florence-2-base compartido y congelado como extractor de características visuales. Sobre él se entrenan únicamente cabezas MLP ligeras que predicen etiquetas de calidad, escena y evento a partir de las características visuales compartidas. La detección de objetos con vocabulario abierto y el captioning no reciben fine-tuning adicional: se apoyan directamente en las capacidades de prompting preentrenadas del modelo base.

El entrenamiento se limita a las cabezas de etiquetado, usando los datos oficiales de entrenamiento del reto MUMU junto con pseudo-datos de etiquetado derivados. El repositorio de GitHub documenta el pipeline completo de preparación de datos, entrenamiento de cabezas, optimización de umbrales y ensamblado de checkpoints. La innovación principal es el refinamiento de inferencia consciente de la tarea: las estadísticas de imagen refinan las predicciones de calidad; los captions y detecciones refinan las etiquetas de escena y evento; las señales de caption ayudan a recuperar objetos omitidos y normalizar etiquetas de detección; y las detecciones guían la selección y refinamiento de captions.

## Capacidades

- Etiquetado de imágenes: predicción de conceptos de calidad, escena y evento mediante cabezas MLP especializadas.
- Detección de objetos con vocabulario abierto: etiquetas y cajas delimitadoras, con recuperación de objetos guiada por caption, phrase grounding y refinamiento de etiquetas.
- Generación de descripciones de imagen: captions concisos en inglés, refinados con información de los objetos detectados.
- Comprensión multimodal unificada: las tres tareas se ejecutan en un único modelo sin modelos específicos por tarea.
- Inferencia eficiente: 23,947 GFLOPs a 224×224 y 4,5 GB de memoria pico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo inglés).
- Capacidades especiales: refinamiento de inferencia consciente de la tarea que reutiliza predicciones cruzadas entre tareas.

## Casos de uso

- Moderación y catalogación de contenido visual: el modelo puede etiquetar automáticamente calidad, escena y evento de imágenes en plataformas de contenido, aprovechando las cabezas de etiquetado entrenadas y su bajo coste computacional (23,947 GFLOPs por imagen a 224×224).
- Detección de objetos en inventarios y comercio electrónico: la detección con vocabulario abierto permite localizar productos o elementos sin un vocabulario cerrado predefinido, útil para catálogos con categorías cambiantes.
- Generación automática de descripciones para accesibilidad: los captions en inglés refinados con detecciones pueden alimentar sistemas de texto alternativo para personas con discapacidad visual.
- Anotación semiautomática de datasets: el modelo puede preetiquetar imágenes con bounding boxes y descripciones, reduciendo el esfuerzo humano en pipelines de curación de datos.
- Procesamiento en dispositivos con recursos limitados: con 4,5 GB de memoria pico y menos de 0,25B de parámetros, es adecuado para despliegues en hardware modesto o entornos con restricciones de memoria estrictas.
- Búsqueda visual y recuperación de imágenes: las etiquetas de escena y evento junto con las detecciones permiten indexar y filtrar imágenes por contenido semántico en sistemas de búsqueda.
- Análisis de imágenes en investigación sobre visión y lenguaje: sirve como baseline eficiente para experimentos que requieren múltiples tareas visuales con un único modelo y presupuesto computacional acotado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Puntuación final del reto MUMU | 17,3409 |
| Posición | 1.º puesto |
| Parámetros | 239,169 M |
| GFLOPs @ 224×224 | 23,947 |
| Memoria pico en inferencia | 4,5 GB |

Las tareas del reto se evalúan con Macro-F1 (image tagging), Novel-aware mAP (object detection) y CIDEr, SPICE y CLIPScore (image captioning). No se han publicado en la información disponible los valores desglosados por tarea ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB de memoria pico según el autor, lo que incluye backbone y cabezas de etiquetado.
- GPU recomendadas: no se especifican modelos concretos; el bajo consumo de memoria permite GPUs de gama media.
- Compatibilidad con GPU de consumo: sí, con 4,5 GB de pico cabe en GPUs de consumo con 6 GB o más de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060).
- Opciones de despliegue: el paquete de inferencia propio del repositorio (`EUMUPredictor`) con pesos en safetensors y cabezas en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EUMU | 239,169 M | no disponible | Tagging, detección open-vocabulary, captioning | no disponible | Hugging Face + GitHub |
| microsoft/Florence-2-base | no disponible en la información | no disponible | Detección, captioning, grounding, OCR y otras vía prompting | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros participantes del reto MUMU no está disponible en la información proporcionada. El modelo base Florence-2-base es el referente inmediato, del que EUMU reutiliza el backbone congelado y añade cabezas de etiquetado y refinamiento cruzado entre tareas.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés, tanto en captions como en etiquetas; no es adecuado para producción en castellano u otros idiomas sin evaluación adicional.
- Licencia no disponible: no se especifican los términos de uso, lo que impide confirmar si se permite uso comercial; es imprescindible contactar con el autor antes de desplegarlo en producción.
- Sesgos: no documentados en la información disponible; al heredar el backbone Florence-2-base y entrenarse con datos del reto, puede reproducir sesgos presentes en esos datos.
- Alucinación: la detección y el captioning dependen de las capacidades de prompting del modelo base sin fine-tuning, por lo que pueden generar objetos o descripciones inexistentes, especialmente en imágenes fuera de distribución.
- Dependencia del refinamiento cruzado: el rendimiento se apoya en que unas tareas corrijan a otras; errores en una tarea pueden propagarse a las demás.
- Reproducibilidad del entrenamiento: requiere acceso a los datasets oficiales del reto MUMU; solo los checkpoints liberados permiten inferencia directa.
- Madurez: modelo recién publicado (creado en septiembre de 2026) con cero descargas y cero likes en Hugging Face; no hay evidencia de uso en producción ni validación independiente.
- Sin datos de contexto ni cuantización: no se documenta la longitud de contexto ni formatos cuantizados, lo que limita la planificación de despliegues optimizados.

## Enlaces

- Hugging Face: https://huggingface.co/Dayoung-space/EUMU
- Paper: https://arxiv.org/abs/2609.19451
- GitHub: https://github.com/Dayoung-Kil/EUMU
- Reto MUMU (LSVOS @ ECCV 2026): https://lsvos.github.io/mumu
- Documentación de checkpoints: https://github.com/Dayoung-Kil/EUMU/blob/main/docs/checkpoints.md
- Preparación de datos: https://github.com/Dayoung-Kil/EUMU/blob/main/docs/dataset.md
- Entorno y hardware: https://github.com/Dayoung-Kil/EUMU/blob/main/docs/env.md
- Entrenamiento: https://github.com/Dayoung-Kil/EUMU/blob/main/docs/training.md
- Evaluación: https://github.com/Dayoung-Kil/EUMU/blob/main/docs/eval.md
- Modelo base: https://huggingface.co/microsoft/Florence-2-base
