# marimona/ToonOut-CoreML

## Resumen

ToonOut-CoreML es la conversión a Core ML del modelo ToonOut, un BiRefNet afinado específicamente para la eliminación de fondos en personajes de anime. El modelo original lo desarrollan Matteo Muratori y Joël Seytre (Kartoon AI), y esta conversión la publica el usuario marimona en Hugging Face. El objetivo es permitir la inferencia en dispositivo (on-device) en iOS 17 y posteriores, evitando la dependencia de servidores y reduciendo la latencia en aplicaciones móviles de edición de imagen.

La arquitectura subyacente es BiRefNet, una red de segmentación binaria de primer plano, adaptada mediante fine-tuning al dominio del anime. El paquete Core ML acepta imágenes RGB de 1024x1024 píxeles y devuelve logits de máscara de primer plano de la misma resolución. Se ofrecen tres variantes de cuantización con distintos compromisos entre tamaño y fidelidad respecto al modelo PyTorch original.

Es relevante ahora porque la segmentación de personajes de anime es una tarea con demanda creciente en apps de creación de contenido, stickers y edición móvil, y esta conversión permite ejecutar el modelo sin conexión en hardware Apple con un tamaño que va desde los 120 MB de la variante palettizada hasta los 469 MB en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de segmentación binaria de primer plano) afinada para anime |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 1024x1024) |
| Tipos de cuantizacion | int8 lineal simétrica por canal, fp16, pal4 (4-bit k-means palettized) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | Core ML (.mlpackage) |
| Entrada | `image`, Float32 (1, 3, 1024, 1024), RGB normalizado 0...1 con media y desviación estándar de ImageNet |
| Salida | `mask_logits`, Float32 (1, 1, 1024, 1024), logits de máscara de primer plano (aplicar sigmoid) |
| Tamano del repo | 0.8 GB |
| Versión mínima de iOS | iOS 17 |

## Arquitectura y entrenamiento

El modelo base es BiRefNet, una arquitectura de segmentación binaria de primer plano que produce una máscara de alta resolución. Sobre ella, ToonOut aplica un fine-tuning específico para personajes de anime, usando el ToonOut Dataset (CC-BY 4.0) publicado por los mismos autores. La conversión a Core ML mantiene la arquitectura y los pesos originales, fijando la entrada en 1024x1024 píxeles y exponiendo los logits de la máscara como salida.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO, ya que la model card de la conversión no los incluye. La innovación técnica destacable es la propia conversión a Core ML con tres esquemas de cuantización (int8 por canal, fp16 y palettizado 4-bit) y la verificación de integridad mediante manifiesto con SHA-256 por archivo. Las versiones de los pesos originales y de la arquitectura BiRefNet están fijadas por commit en la model card.

## Capacidades

- Segmentación de primer plano (eliminación de fondo) de personajes de anime en imágenes RGB.
- Generación de máscara binaria de 1024x1024 píxeles a partir de logits (aplicando sigmoid).
- Inferencia on-device en iOS 17 y posteriores mediante Core ML.
- Tres variantes de cuantización con distinto equilibrio tamaño/fidelidad: int8 (recomendada), fp16 y pal4.
- Verificación de integridad de los archivos mediante manifiesto `manifest.json` con SHA-256.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Eliminación de fondo en apps móviles de edición de imagen: el modelo se integra como `.mlpackage` en una app iOS 17+ y procesa imágenes de 1024x1024 en el dispositivo, sin enviar datos a un servidor. La variante int8 (unos 237 MB) es la recomendada por el autor para este escenario.
- Generación de stickers y avatares de personajes de anime: la máscara de primer plano permite recortar al personaje y componerlo sobre fondos personalizados, con la ventaja de que el fine-tuning específico para anime mejora la delimitación frente a modelos genéricos.
- Herramientas de creación de contenido para comunidades otaku: apps de fan art, cartas coleccionables o merchandising digital que necesitan aislar personajes con contornos limpios.
- Procesamiento por lotes en macOS: dado que Core ML también se ejecuta en macOS, la variante fp16 (469 MB, IoU 0.9989) puede usarse para preprocesar lotes de imágenes con la máxima fidelidad respecto al modelo PyTorch.
- Aplicaciones con restricciones de almacenamiento: la variante pal4 (120 MB, IoU 0.8813) permite desplegar el modelo en dispositivos con poco espacio, aceptando artefactos de bloque en la máscara.
- Pipelines de previsualización en tiempo real: al ejecutarse localmente, el modelo puede alimentar vistas previas de recorte en la interfaz de usuario sin latencia de red, siempre que el hardware Apple soporte la inferencia Core ML a la resolución fijada.

## Benchmarks y rendimiento

La model card proporciona únicamente una métrica de fidelidad respecto al modelo PyTorch original, medida sobre cuatro imágenes de prueba en un Mac:

| Variante | Pesos | Tamano | IoU vs. PyTorch |
|---|---|---|---|
| int8 | 8-bit lineal simétrica por canal (recomendada) | ~237 MB | 0.9916 |
| fp16 | 16-bit float | ~469 MB | 0.9989 |
| pal4 | 4-bit k-means palettized | ~120 MB | 0.8813 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU de escritorio; el modelo se ejecuta mediante Core ML en el Neural Engine o la GPU de hardware Apple.
- GPU recomendadas: hardware Apple compatible con Core ML en iOS 17+ (iPhone y iPad con Neural Engine) y Macs con Apple Silicon o GPU AMD compatibles con Core ML.
- Cabe en consumer GPU: sí, en el sentido de que está diseñado para hardware de consumo Apple; no se dispone de datos para GPUs NVIDIA.
- Opciones de despliegue: Core ML (`.mlpackage`) en iOS 17+ y macOS; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ToonOut-CoreML | BiRefNet afinado para anime | 1024x1024 RGB | MIT | Core ML | Conversión on-device; 3 variantes de cuantización |
| ToonOut (original) | BiRefNet afinado para anime | 1024x1024 RGB | MIT | PyTorch | Modelo de referencia en PyTorch |
| BiRefNet | Segmentación binaria de primer plano | no disponible | MIT | PyTorch | Arquitectura base genérica, sin fine-tuning de anime |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Conversión no oficial: los créditos del modelo corresponden a los autores originales; la conversión la realiza un tercero y puede no reflejar exactamente el comportamiento del modelo PyTorch.
- La variante pal4 presenta ruido de bloques en la máscara (IoU 0.8813), por lo que no es adecuada para producción con requisitos de calidad alta.
- La entrada está fijada a 1024x1024 píxeles; imágenes de otras resoluciones requieren redimensionado previo, lo que puede afectar a la precisión en personajes pequeños o muy alargados.
- El modelo está especializado en personajes de anime; su rendimiento en fotografías reales u otros dominios no está documentado y probablemente sea inferior.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de segmentación incorrecta en casos límite (fondos complejos, personajes con colores similares al fondo).
- Licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright y créditos a los autores originales y a BiRefNet.
- Requiere iOS 17 o posterior; no funciona en versiones anteriores del sistema.
- No se documentan sesgos específicos ni limitaciones idiomáticas (no aplica).

## Enlaces

- Hugging Face: https://huggingface.co/marimona/ToonOut-CoreML
- Modelo base ToonOut: https://huggingface.co/joelseytre/toonout
- Dataset ToonOut: https://huggingface.co/datasets/joelseytre/toonout
- Paper ToonOut: https://arxiv.org/abs/2509.06839
- BiRefNet (arquitectura): https://huggingface.co/ZhengPeng7/BiRefNet
- Repositorio BiRefNet: https://github.com/ZhengPeng7/BiRefNet
