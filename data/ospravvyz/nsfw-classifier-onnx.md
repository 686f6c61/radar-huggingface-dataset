# OSPRAVVYZ/nsfw-classifier-ONNX

## Resumen

`OSPRAVVYZ/nsfw-classifier-ONNX` es una conversión a formato ONNX del modelo `giacomoarienti/nsfw-classifier`, un clasificador de imágenes basado en arquitectura ViT (Vision Transformer) cuyo propósito es detectar contenido para adultos (NSFW) en imágenes. El modelo ha sido convertido automáticamente mediante el espacio `onnx-community/convert-to-onnx` y está empaquetado para su uso con la librería `transformers.js`, lo que permite ejecutarlo directamente en el navegador o en Node.js sin necesidad de un backend Python.

La relevancia de esta versión radica en su formato: al estar en ONNX y orientado a `transformers.js`, facilita el despliegue de un filtro de contenido en aplicaciones web del lado del cliente, con la consiguiente reducción de latencia y de costes de infraestructura, y sin enviar las imágenes a un servidor externo. El repositorio ocupa aproximadamente 0,8 GB y no cuenta con descargas ni valoraciones en el momento de la consulta.

Se trata de un artefacto derivado, no de un modelo original: no aporta arquitectura ni entrenamiento propios, sino una conversión de pesos del modelo base de `giacomoarienti`. La información disponible sobre licencia, idiomas y detalles de entrenamiento es escasa o inexistente en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), según el modelo base |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes) |
| Tipos de cuantización | no disponible (el tag `quantized` indica que el modelo base fue cuantizado, sin especificar el esquema) |
| Idiomas soportados | no disponible (clasificación de imágenes, no depende de idioma) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tarea | image-classification (clasificación binaria/multiclase NSFW) |
| Librería | transformers.js |
| Modelo base | giacomoarienti/nsfw-classifier |
| Tamaño del repositorio | ~0,8 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `giacomoarienti/nsfw-classifier`, que emplea un Vision Transformer (ViT) para la clasificación de imágenes. El tag `vit` del repositorio confirma esta familia arquitectónica. Un ViT divide la imagen en parches, los proyecta en embeddings y los procesa mediante bloques de autoatención, produciendo finalmente una distribución de probabilidad sobre las clases de salida (típicamente categorías como contenido seguro, contenido sugerente y contenido explícito).

No se dispone de información sobre el dataset de entrenamiento, el número de imágenes utilizadas, el esquema de etiquetado ni si se aplicaron técnicas de ajuste fino adicionales. La conversión a ONNX se realizó de forma automática mediante el espacio `onnx-community/convert-to-onnx`, sin que la model card documente optimizaciones posteriores, calibración de cuantización ni validación de la equivalencia numérica respecto al modelo original.

## Capacidades

- Clasificación de imágenes en categorías relacionadas con contenido NSFW.
- Ejecución en navegador o en Node.js mediante `transformers.js` y el runtime de ONNX.
- Inferencia local sin envío de imágenes a servidores externos.
- Integración sencilla en pipelines de moderación de contenido web.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales más allá de la clasificación de imagen.
- Capacidades multilingües no aplicables (la salida son etiquetas de clase, no texto libre).

## Casos de uso

- Moderación de contenido en aplicaciones web: el modelo puede ejecutarse en el cliente mediante `transformers.js` para filtrar imágenes subidas por usuarios antes de enviarlas al servidor, reduciendo costes de ancho de banda y cumpliendo requisitos de privacidad.
- Filtrado previo en plataformas de compartición de imágenes: clasificación automática de cada imagen entrante para derivar las que requieran revisión humana, gracias a la baja latencia de la inferencia ONNX en local.
- Protección de menores en comunidades online: integración en el frontend para bloquear la visualización de contenido no apto sin necesidad de un servicio backend dedicado.
- Enmascaramiento o difuminado automático de imágenes: uso del clasificador como paso previo a un pipeline de transformación de imagen que aplique blur o placeholders a contenido detectado como NSFW.
- Aplicaciones de escritorio o extensiones de navegador: al no requerir Python ni GPU dedicada, el modelo ONNX puede empaquetarse en una extensión que analice imágenes en la página del usuario.
- Prototipado rápido de sistemas de moderación: al estar disponible en `transformers.js`, permite validar la viabilidad de un filtro NSFW en pocas líneas de JavaScript antes de invertir en infraestructura de producción.
- Investigación sobre sesgos en clasificadores de contenido: el artefacto permite reproducir y auditar el comportamiento del modelo base en entornos JavaScript sin depender de frameworks de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un ViT de clasificación de imagen de tamaño habitual (decenas a pocos cientos de millones de parámetros) suele requerir entre 0,5 y 2 GB en FP32, y menos de 1 GB en cuantización de 8 bits. El tamaño del repositorio (0,8 GB) sugiere pesos en un rango de cientos de millones de parámetros.
- GPU recomendadas: no disponible. Al ser un modelo pequeño de clasificación, cualquier GPU consumer moderna (RTX 3060 o superior) es más que suficiente; también puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM; también en CPU y en el navegador mediante WebGPU o WASM.
- Opciones de despliegue: `transformers.js` (principal), runtime de ONNX (onnxruntime-web, onnxruntime-node), y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. En navegador con WebGPU se espera latencia de decenas de milisegundos por imagen, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Licencia | Uso en navegador | Disponibilidad |
|---|---|---|---|---|---|
| OSPRAVVYZ/nsfw-classifier-ONNX | ViT | ONNX | no disponible | Sí (transformers.js) | Hugging Face, 0 descargas |
| giacomoarienti/nsfw-classifier | ViT | safetensors (presumiblemente) | no disponible | No directamente | Hugging Face (modelo base) |
| Otros clasificadores NSFW basados en ViT o CNN | ViT / CNN | PyTorch, ONNX | variable | Depende de la conversión | Hugging Face |

La comparativa se limita al modelo base y a la categoría genérica, ya que no se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 valoraciones, lo que indica que no ha sido validado por la comunidad; su fiabilidad en producción no está contrastada.
- La conversión a ONNX fue automática y no se documenta verificación de equivalencia numérica con el modelo base; pueden existir diferencias en las predicciones.
- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo base `giacomoarienti/nsfw-classifier` antes de cualquier despliegue.
- El modelo está etiquetado como `not-for-all-audiences`, lo que refleja que su temática y sus datos de entrenamiento incluyen contenido para adultos.
- Riesgo de falsos positivos y falsos negativos inherente a los clasificadores NSFW; no se han publicado métricas de precisión, recall ni curvas ROC.
- Posibles sesgos en la clasificación según el origen, el estilo artístico o el contexto cultural de las imágenes, no documentados por el autor.
- No se detalla la taxonomía exacta de clases de salida; el integrador debe inspeccionar la configuración del modelo para conocer las etiquetas.
- No apto para tareas de generación, razonamiento o procesamiento de texto; su uso está acotado a clasificación de imágenes.
- La fecha de creación (2026-11-03) es posterior a la fecha actual en la mayoría de contextos, lo que puede indicar un error de metadatos o una fecha futura programada; conviene verificarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OSPRAVVYZ/nsfw-classifier-ONNX
- Modelo base: https://huggingface.co/giacomoarienti/nsfw-classifier
- Espacio de conversión a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
