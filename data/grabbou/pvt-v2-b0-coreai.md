# grabbou/pvt-v2-b0-CoreAI

## Resumen

PVT v2 b0 es un modelo de clasificación de imágenes basado en Pyramid Vision Transformer v2, una arquitectura de transformer piramidal pensada para tareas densas de visión por computador. El modelo original fue publicado por Wenhai Wang et al. (arXiv:2106.13797) y los pesos que se distribuyen aquí proceden de la implementación de `timm`. Esta variante concreta, publicada por el usuario `grabbou`, no entrena ningún modelo nuevo: se limita a convertir los pesos originales al formato Apple Core AI (`.aimodel`) para su ejecución en dispositivos iOS y macOS.

El modelo tiene 3,7 millones de parámetros y está entrenado sobre ImageNet-1k para clasificación en 1000 clases. Su interés práctico reside en que es un export ligero (7,1 MB en float16) que puede ejecutarse en el Neural Engine o en la GPU de un iPhone o un Mac mediante el runtime Core AI de Apple, lo que permite clasificación de imágenes en local sin conexión ni servidores externos.

Es relevante ahora porque demuestra el flujo de conversión de modelos de visión de `timm` a Core AI siguiendo la receta oficial de `apple/coreai-models`, y porque ofrece un ejemplo funcional de integración con el paquete `@react-native-ai/core-ai` para aplicaciones React Native. No obstante, el repositorio tiene 0 descargas y 0 likes, y el tamaño del repo reportado es de 0.0 GB, por lo que debe considerarse un artefacto de conversión de nicho más que un modelo de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVT v2), transformer piramidal para visión |
| Parámetros totales | 3,7 M (variante b0) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada fija de imagen 224x224) |
| Tipos de cuantización | float16 (export principal); no se documentan otras variantes |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI); pesos originales en `timm` (safetensors/PyTorch) |

## Arquitectura y entrenamiento

PVT v2 es un transformer piramidal que aplica atención global con reducción de resolución espacial (spatial-reduction attention) y atención con convolución por proximidad (convolutional feed-forward network), lo que reduce el coste computacional frente a un ViT estándar y produce mapas de características multiescala. La variante b0 es la más pequeña de la familia, con 3,7 M de parámetros, y en este repositorio se usa únicamente como clasificador de ImageNet-1k.

El entrenamiento del modelo original corresponde al descrito en el paper de PVT v2 sobre ImageNet-1k; esta conversión no añade entrenamiento ni ajuste fino. La innovación técnica del artefacto es el export a Core AI: la entrada es un tensor `[1, 3, 224, 224]` en float16 RGB normalizado con la media y desviación estándar de ImageNet, y la salida es `main(x) -> logits` sobre las 1000 clases, con los nombres de clase en `labels.json` ordenados por índice de logit. El export se genera con `uv run models/pvt/export.py --dtype float16` siguiendo la receta de `apple/coreai-models`.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k a partir de una imagen RGB de 224x224.
- Inferencia en dispositivo (on-device) en iOS y macOS mediante el runtime Core AI de Apple.
- Ejecución en Neural Engine o GPU según la plataforma; en macOS 27.0 el compilador del Neural Engine rechaza este export y debe cargarse en GPU (`computeUnits: 'gpu'`).
- Integración con React Native a través de `@react-native-ai/core-ai`, con salida de las top-K clasificaciones (etiqueta, índice y confianza).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión generativa ni audio.
- No tiene capacidades multilingües: las etiquetas de salida son los nombres de clase de ImageNet en inglés, tomados de los metadatos de `timm`.

## Casos de uso

- Clasificación de imágenes offline en apps iOS: se descarga la carpeta `pvt-v2-b0/` en el almacenamiento de la app y se invoca `CoreAI.runTask('classification', ...)` con la URI de la imagen, sin necesidad de red ni backend.
- Etiquetado automático de fotos en la galería del dispositivo: el modelo devuelve las top-K clases con confianza, lo que permite sugerir etiquetas o agrupar imágenes por categoría en local.
- Filtrado previo en pipelines de visión: usar las predicciones de ImageNet como señal barata (3,7 M de parámetros) para descartar o priorizar imágenes antes de pasarlas a un modelo mayor.
- Prototipado de apps React Native con IA on-device: el ejemplo de uso con `@react-native-ai/core-ai` sirve como plantilla para integrar modelos Core AI en una app móvil.
- Demostración de conversión de modelos `timm` a Core AI: útil para validar la receta `apple/coreai-models` y el flujo de export a `.aimodel` antes de convertir modelos mayores.
- Clasificación de imágenes en macOS con aceleración GPU: cargando el modelo con `computeUnits: 'gpu'` en macOS 27.0, donde el Neural Engine rechaza este export.
- Pruebas de regresión de clasificación en CI: al ser un artefacto pequeño (7,1 MB) y determinista, puede usarse para verificar que el pipeline de export y el runtime producen logits coherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión top-1/top-5 en ImageNet-1k, latencia ni throughput para este export.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU de escritorio; el artefacto pesa 7,1 MB en float16 y está pensado para memoria unificada de dispositivos Apple.
- Plataformas soportadas: iOS y macOS según la model card.
- GPU recomendadas: no se especifican modelos concretos; se ejecuta en el Neural Engine o en la GPU del dispositivo Apple. En macOS 27.0 es obligatorio usar la GPU (`computeUnits: 'gpu'`) porque el compilador del Neural Engine rechaza este export.
- ¿Cabe en GPU de consumo? El modelo es de 3,7 M de parámetros, por lo que su huella es mínima; no se documentan requisitos para GPUs NVIDIA ni AMD.
- Opciones de despliegue: runtime Core AI de Apple y el paquete `@react-native-ai/core-ai` para React Native. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son runtimes de texto y no aplican a este modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PVT v2 b0 (este export) | 3,7 M | imagen 224x224 | Clasificación ImageNet-1k | Apache-2.0 | Core AI (iOS/macOS) |
| PVT v2 b0 original (`timm`) | 3,7 M | imagen 224x224 | Clasificación ImageNet-1k | Apache-2.0 | Pesos PyTorch en `timm` |
| Otras variantes PVT v2 (b1, b2, etc.) | no disponible en la información | imagen 224x224 | Clasificación ImageNet-1k | Apache-2.0 | Pesos en `timm` |

No se dispone de datos de rendimiento comparado (precisión, latencia) en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Solo clasifica en las 1000 clases de ImageNet-1k; cualquier objeto fuera de ese vocabulario se asignará a la clase más próxima con una confianza potencialmente baja.
- No es un modelo generativo ni multimodal: no procesa texto, no responde preguntas y no soporta tool calling.
- El export está pensado para Core AI; no se distribuyen pesos en safetensors ni GGUF en este repositorio, y el tamaño reportado del repo es de 0.0 GB, lo que puede indicar que los archivos no están subidos o que la métrica no está actualizada.
- En macOS 27.0 el Neural Engine rechaza el export; es necesario forzar la GPU, lo que puede afectar a latencia y consumo.
- Riesgo de sesgo heredado de ImageNet-1k: las clases y sus distribuciones reflejan el dataset original, con posibles sesgos geográficos y culturales.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con confianza alta en imágenes ambiguas o fuera de distribución; no se documentan calibraciones.
- La licencia Apache-2.0 permite uso comercial, pero el autor solo convierte el modelo; los términos de los pesos originales de `timm` y de las etiquetas de ImageNet deben respetarse por separado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad ni de mantenimiento continuo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grabbou/pvt-v2-b0-CoreAI
- Paper de PVT v2: https://arxiv.org/abs/2106.13797
- Receta de export de PVT en `apple/coreai-models`: https://github.com/apple/coreai-models/tree/main/models/pvt
- Documentación de `timm`: https://huggingface.co/docs/timm
- Paquete `@react-native-ai/core-ai`: https://github.com/callstackincubator/ai/tree/main/packages/core-ai
