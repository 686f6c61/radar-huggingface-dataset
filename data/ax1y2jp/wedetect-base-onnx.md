# AX1Y2JP/WeDetect-Base-ONNX

## Resumen

WeDetect-Base-ONNX es la exportación a formato ONNX del modelo WeDetect-Base, un detector de objetos zero-shot desarrollado originalmente por el usuario fushh7 en Hugging Face. Este repositorio, mantenido por AX1Y2JP, convierte los pesos originales (`wedetect_base.pth` y `wedetect_base_uni.pth`) a grafos ONNX ejecutables con ONNX Runtime, lo que permite desplegar el modelo en entornos de producción sin depender de PyTorch. La tarea que resuelve es la detección de objetos zero-shot: identificar y localizar objetos en imágenes a partir de etiquetas de texto arbitrarias proporcionadas en tiempo de inferencia.

El modelo sigue el paradigma de los detectores abiertos de vocabulario, con un codificador de texto que transforma las etiquetas en embeddings y un codificador visual que procesa la imagen a resolución fija de 640x640. La exportación separa ambos componentes en grafos independientes (`text_model` y `vision_model`) y añade un tercer grafo (`proposal_model`, correspondiente a WeDetect-Base-Uni) para la generación de propuestas y embeddings de región. El repositorio ocupa 3,6 GB e incluye variantes de pesos en fp32, fp16 e int8.

La relevancia de esta ficha radica en que facilita el uso del modelo fuera del ecosistema PyTorch, con soporte para aceleración por GPU vía CUDAExecutionProvider y despliegue con ONNX Runtime 1.22 o superior (opset 23). No obstante, la información pública disponible sobre el modelo base es muy limitada: no se detallan arquitectura interna, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector zero-shot con codificador de texto y codificador visual separados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa etiquetas de texto e imágenes de 640x640) |
| Tipos de cuantizacion | fp32, fp16 (pesos fp16 con E/S float32), int8 (weight-only `MatMulNBits`) |
| Idiomas soportados | no disponible (las etiquetas de texto del ejemplo incluyen chino: 猫, 狗, 汽车) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (opset 23, ONNX Runtime 1.22+) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo base WeDetect. Por la estructura de la exportación se deduce un diseño de dos torres: un codificador de texto que convierte las etiquetas en `txt_feats` y un codificador visual que procesa la imagen normalizada a 640x640 con relleno gris (114,114,114) y devuelve cajas (`bboxes`) y puntuaciones (`scores`). El grafo `proposal_model`, correspondiente a WeDetect-Base-Uni, genera además propuestas de cajas y embeddings de región, lo que sugiere una etapa de propuestas tipo region proposal network integrada en el paradigma zero-shot.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del entrenamiento original. La exportación a ONNX mantiene el cómputo sin cambios respecto al original, con tres modificaciones declaradas: separación del codificador de texto y el detector en grafos distintos, conversión del modelo Uni en `proposal_model` y exclusión de la supresión de no máximos (NMS) del grafo, que debe aplicarse externamente.

## Capacidades

- Detección de objetos zero-shot: localiza objetos descritos por etiquetas de texto arbitrarias sin reentrenamiento.
- Codificación de texto multilingüe (el ejemplo de uso emplea etiquetas en chino; el alcance idiomático real no está documentado).
- Generación de propuestas de cajas y embeddings de región mediante el grafo `proposal_model` (WeDetect-Base-Uni).
- Ejecución en CPU y GPU mediante ONNX Runtime con los proveedores `CUDAExecutionProvider` y `CPUExecutionProvider`.
- Soporte de cuantización a fp16 e int8 para reducir requisitos de memoria.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión generativa ni audio.

## Casos de uso

- Moderación de contenido visual: el modelo permite detectar categorías definidas en tiempo de ejecución mediante etiquetas de texto, lo que facilita adaptar los filtros sin reentrenar cuando aparecen nuevas categorías de contenido no deseado.
- Inventario y catalogación de imágenes: integrado en un pipeline ONNX Runtime, se pueden etiquetar lotes de imágenes con vocabularios específicos de dominio (productos, materiales, especies) y obtener cajas delimitadoras para recorte automático.
- Análisis de imágenes industriales: detección de defectos o componentes descritos por texto en líneas de inspección, aprovechando la ejecución en CPU o GPU según el hardware disponible en planta.
- Búsqueda visual por texto: combinación del codificador de texto y el detector para localizar regiones de una imagen que coincidan con consultas en lenguaje natural, útil en sistemas de búsqueda de catálogos.
- Anotación asistida de datasets: generación de propuestas de cajas (`proposal_model`) y puntuaciones para preetiquetar imágenes antes de la revisión humana, reduciendo el coste de construcción de datasets de detección.
- Despliegue en entornos sin PyTorch: al ser un artefacto ONNX, puede ejecutarse en servicios con ONNX Runtime en C++, C#, Java o Python, lo que simplifica la integración en backends no basados en Python.
- Prototipado rápido de detectores de vocabulario abierto: la separación en grafos permite cachear los embeddings de texto de un vocabulario fijo y reutilizarlos en múltiples inferencias de imagen, optimizando el coste por petición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 3,6 GB, por lo que la variante fp16 requiere del orden de 1,8 GB de pesos y la int8 aproximadamente 0,9 GB, a lo que hay que sumar activaciones y memoria de trabajo de ONNX Runtime (no cuantificada en la información disponible).
- GPU recomendadas: no disponibles. El modelo declara soporte de `CUDAExecutionProvider`, por lo que es compatible con GPU NVIDIA con CUDA; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: probablemente cabe en GPU de consumo con suficiente VRAM para la variante fp16 o int8, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: ONNX Runtime 1.22 o superior (opset 23), con proveedores CPU y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| WeDetect-Base-ONNX | no disponible | no disponible | Deteccion zero-shot | GPL-3.0 | ONNX |
| fushh7/WeDetect (base) | no disponible | no disponible | Deteccion zero-shot | no disponible en la informacion | PyTorch (.pth) |
| Alternativas zero-shot (p. ej. Grounding DINO, OWLv2) | no disponible en la informacion proporcionada | no disponible | Deteccion zero-shot | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La licencia GPL-3.0 es copyleft fuerte: el uso comercial es posible, pero la distribución de obras derivadas o de software que integre el modelo puede obligar a liberar el código bajo la misma licencia. Es un caveat crítico para producción.
- No se incluye NMS en el grafo: es responsabilidad del integrador aplicar la supresión de no máximos, lo que añade complejidad y riesgo de errores en el postprocesado.
- La variante int8 (weight-only `MatMulNBits`) tiene menor precisión que fp16 según la propia model card; no se cuantifica la degradación.
- No hay información sobre sesgos, tasas de alucinación (falsos positivos en detección) ni robustez ante dominios distintos al de entrenamiento.
- El alcance idiomático de las etiquetas de texto no está documentado; el único ejemplo usa chino, lo que impide garantizar el comportamiento con etiquetas en castellano u otros idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-20: no hay evidencia de validación por parte de la comunidad.
- Requiere ONNX Runtime 1.22+ y opset 23; versiones anteriores pueden no cargar los grafos.
- No se documentan límites de resolución distintos de 640x640 ni el comportamiento con imágenes de relación de aspecto extrema más allá del relleno con gris.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AX1Y2JP/WeDetect-Base-ONNX
- Modelo base: https://huggingface.co/fushh7/WeDetect
- ONNX Runtime: https://onnxruntime.ai/
- Especificación ONNX: https://onnx.ai/
