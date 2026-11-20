# AX1Y2JP/WeDetect-Large-ONNX

## Resumen

WeDetect-Large-ONNX es la exportación a formato ONNX del modelo WeDetect-Large, un detector de objetos zero-shot desarrollado originalmente por el usuario fushh7 en Hugging Face. Este repositorio, publicado por AX1Y2JP, no entrena un modelo nuevo: convierte los pesos `wedetect_large.pth` y `wedetect_large_uni.pth` a grafos ONNX ejecutables con ONNX Runtime, separando el codificador de texto y el detector de visión en sesiones independientes y añadiendo una variante `proposal_model` correspondiente a WeDetect-Large-Uni.

El modelo resuelve el problema de detección de objetos sin entrenamiento específico por clase: se le pasan etiquetas en lenguaje natural y devuelve cajas delimitadoras con puntuaciones de confianza. Es relevante para despliegues en producción porque elimina la dependencia de PyTorch y permite ejecución con ONNX Runtime en CPU o GPU (CUDA), con variantes de pesos en fp32, fp16 e int8.

El repositorio ocupa 7,6 GB y no incluye información sobre arquitectura interna, número de parámetros, longitud de contexto ni idiomas soportados más allá de lo que se deduce del uso. La licencia es GPL-3.0, lo que condiciona su uso comercial. El modelo se publicó el 20 de noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector zero-shot con codificador de texto y torre de visión separadas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el codificador de texto procesa lotes de etiquetas con padding) |
| Tipos de cuantizacion | fp32, fp16 (pesos fp16 con E/S float32), int8 (weight-only `MatMulNBits`) |
| Idiomas soportados | no disponible (las etiquetas de ejemplo incluyen caracteres chinos: 猫, 狗, 汽车) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (opset 23, requiere ONNX Runtime 1.22+) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original WeDetect-Large, ni sobre el número de parámetros, la composición del dataset de entrenamiento o si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio ONNX no incluye estos datos y se limita a describir el proceso de exportación.

La exportación mantiene el cómputo original sin cambios, pero reorganiza el grafo en tres artefactos: `text_model` (codificador de texto que produce `txt_feats` a partir de `input_ids` y `attention_mask`), `vision_model` (detector que consume la imagen y las características de texto y devuelve `bboxes` y `scores`) y `proposal_model` (correspondiente a WeDetect-Large-Uni, que devuelve cajas, puntuaciones y `region_embeddings`). La supresión de no máximos (NMS) se ha dejado fuera del grafo, por lo que el consumidor debe aplicarla por su cuenta. El preprocesado de imagen es fijo: redimensionado con relación de aspecto preservada, relleno a 1280×1280 con color gris (114, 114, 114) y normalización a [0, 1].

## Capacidades

- Detección de objetos zero-shot: acepta una lista arbitraria de etiquetas en texto y devuelve cajas y puntuaciones por clase sin reentrenamiento.
- Codificación de texto independiente: el grafo `text_model` permite precalcular `txt_feats` para un vocabulario de etiquetas y reutilizarlo en múltiples imágenes.
- Detección con propuestas de región: el grafo `proposal_model` (WeDetect-Large-Uni) devuelve además `region_embeddings`, útil para tareas posteriores de recuperación o clasificación sobre regiones.
- Ejecución en CPU y GPU mediante ONNX Runtime con los proveedores `CUDAExecutionProvider` y `CPUExecutionProvider`.
- Cuantización a int8 con `MatMulNBits` para reducir huella de memoria, a costa de menor precisión que fp16.
- Procesamiento por lotes de etiquetas con tokenizer externo (formato `tokenizer.json` de la librería `tokenizers`), con padding configurable (`pad_id=1`, `pad_token="<pad>"`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo thinking.

## Casos de uso

- Moderación de contenido visual: definir etiquetas como "arma", "sangre" o "desnudo" y ejecutar el detector sobre imágenes subidas por usuarios para marcar contenido sensible antes de revisión humana.
- Inventario retail automatizado: etiquetar productos ("botella", "caja", "lata") y contar ocurrencias por estantería o estante usando las cajas devueltas y un NMS aplicado aguas abajo.
- Análisis de imágenes industriales: detectar defectos o componentes con etiquetas específicas del dominio ("grieta", "tornillo", "etiqueta") sin disponer de un dataset anotado, gracias a la naturaleza zero-shot.
- Búsqueda visual por texto: precalcular `txt_feats` con el codificador de texto para un catálogo de conceptos y ejecutar solo el grafo de visión por imagen, reduciendo coste en pipelines de indexación.
- Anonimización de imágenes: detectar "cara", "matrícula" o "documento de identidad" y aplicar desenfoque sobre las cajas devueltas antes de almacenar la imagen.
- Prototipado rápido en entornos sin PyTorch: al ser ONNX puro, se puede integrar en servicios .NET, Java o C++ mediante ONNX Runtime sin instalar el stack de PyTorch.
- Segmentación asistida por regiones: usar `region_embeddings` de `proposal_model` para agrupar o clasificar regiones detectadas en un paso posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 7,6 GB, repartido entre los grafos fp32, fp16 e int8 de los tres modelos (texto, visión y propuesta).
- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, la variante fp16 de los tres grafos requiere cargar en memoria pesos del orden de varios GB; la variante int8 reduce la huella aproximadamente a la mitad respecto a fp16, y fp32 la duplica respecto a fp16.
- GPU recomendadas: no especificadas por el autor. ONNX Runtime con `CUDAExecutionProvider` es compatible con GPUs NVIDIA; para el resto de backends (DirectML, ROCm, CoreML) no se documenta soporte.
- GPU de consumo: no se confirma que quepa en GPUs de consumo tipo RTX 4090 (24 GB) o RTX 3060 (12 GB); depende de qué variante (fp32/fp16/int8) y de cuántos grafos se carguen simultáneamente.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java) con proveedores CPU y CUDA. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El preprocesado fija la entrada a 1280×1280, lo que condiciona el coste por imagen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas como Grounding DINO, OWLv2 u OpenSeeD. La comparación se limita a aspectos de formato y licencia.

| Modelo | Formato | Licencia | Contexto / resolución | Disponibilidad |
|---|---|---|---|---|
| WeDetect-Large-ONNX | ONNX (fp32/fp16/int8) | GPL-3.0 | entrada fija 1280×1280 | Hugging Face, 0 descargas |
| WeDetect-Large (original) | PyTorch (.pth) | no disponible en esta ficha | no disponible | Hugging Face (fushh7/WeDetect) |
| Grounding DINO | PyTorch | no disponible en esta ficha | no disponible | no disponible en esta ficha |
| OWLv2 | PyTorch | no disponible en esta ficha | no disponible | no disponible en esta ficha |

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier distribución o servicio que incorpore el modelo debe cumplir las obligaciones copyleft de la GPL, lo que puede ser incompatible con productos propietarios.
- NMS no incluido en el grafo: el consumidor debe implementar la supresión de no máximos; sin ella, las salidas contendrán cajas duplicadas.
- Preprocesado fijo a 1280×1280 con relleno gris: imágenes con relaciones de aspecto extremas pierden resolución efectiva y pueden degradar la detección de objetos pequeños.
- Cuantización int8 con `MatMulNBits`: el propio autor advierte de menor precisión que fp16; no se han publicado métricas de la caída.
- Dependencia de ONNX Runtime 1.22+ por el uso de opset 23; versiones anteriores no podrán cargar los grafos.
- Sin información sobre sesgos, tasa de alucinación (falsos positivos en detección) ni rendimiento por idioma; las etiquetas de ejemplo en chino sugieren soporte multilingüe, pero no está documentado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- El modelo base `fushh7/WeDetect` no incluye en esta ficha datos de entrenamiento, parámetros ni evaluación, lo que impide estimar su calidad relativa.
- Fecha de creación declarada como 2026-11-20: conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo.

## Enlaces

- Repositorio ONNX: https://huggingface.co/AX1Y2JP/WeDetect-Large-ONNX
- Modelo base: https://huggingface.co/fushh7/WeDetect
- Licencia GPL-3.0: https://www.gnu.org/licenses/gpl-3.0.html
- ONNX Runtime: https://onnxruntime.ai/
- Librería `tokenizers`: https://github.com/huggingface/tokenizers
