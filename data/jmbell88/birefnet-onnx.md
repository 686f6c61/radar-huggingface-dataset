# jmbell88/birefnet-onnx

## Resumen

birefnet-onnx es una exportación a formato ONNX del modelo BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation), desarrollado originalmente por Zheng Peng y colaboradores. El modelo resuelve la tarea de segmentación dicotómica de imágenes de alta resolución, es decir, separar un sujeto del fondo con un mapa de máscara de alta precisión. Este repositorio concreto, publicado por el usuario jmbell88, no modifica los pesos ni el entrenamiento: solo cambia el formato para que el modelo pueda ejecutarse bajo ONNX Runtime en proveedores como DirectML o CPU.

La relevancia de esta conversión reside en un detalle técnico: BiRefNet utiliza convoluciones deformables (`deform_conv2d` de torchvision), que no se exportan de forma fiable a ONNX Runtime. El autor sustituye esa operación por una implementación equivalente basada en `grid_sample` y multiplicación matricial, con una discrepancia máxima de aproximadamente 1e-9 frente a la versión original de torchvision y de 8,6e-5 frente al modelo PyTorch completo en una imagen de prueba. Esto permite desplegar el modelo en entornos Windows con DirectML sin depender de PyTorch.

El repositorio contiene un único archivo ONNX autocontenido de unos 932 MB (fp32, sin cuantizar), con entrada fija de 1024×1024 y salida de logits de la misma resolución. Está pensado para la herramienta Realmspinner y se distribuye bajo licencia MIT, la misma del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de segmentación con referencias bilaterales), exportada a ONNX |
| Parametros totales | no disponible (el archivo ONNX pesa 932.329.255 bytes en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 1024×1024) |
| Tipos de cuantizacion | no disponible (los pesos exportados son fp32 sin cuantizar) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | MIT (Copyright (c) 2024 ZhengPeng) |
| Formato de pesos | ONNX, opset 17, archivo único `birefnet.onnx` |

## Arquitectura y entrenamiento

BiRefNet es una arquitectura de segmentación de imágenes diseñada para segmentación dicotómica de alta resolución. El modelo original emplea módulos de referencia bilateral que combinan información de bajo y alto nivel para refinar los bordes del sujeto segmentado. La exportación a ONNX conserva los pesos fp32 originales sin cambios y mantiene la semántica de la red, salvo por la sustitución de las convoluciones deformables por una composición equivalente de `grid_sample` con muestreo bilineal y relleno a cero, más multiplicación matricial. El grafo exportado no contiene el operador `DeformConv`.

El proceso de exportación se realizó con PyTorch 2.8.0, torchvision 0.23.0, timm 1.0.28, einops 0.8.2, kornia 0.8.3, safetensors 0.8.0 y transformers 5.14.1, usando el trazador legacy (`dynamo=False`) y una entrada fija de `[1, 3, 1024, 1024]`. El autor documenta que el archivo se reproduce byte a byte con esas versiones y un SHA-256 concreto. No se aporta información sobre el dataset de entrenamiento, el número de tokens o técnicas de alineación, más allá de lo que indica la model card original de BiRefNet, a la que remite el repositorio.

## Capacidades

- Segmentación de imágenes: genera una máscara binaria de primer plano/fondo a partir de una imagen RGB de 1024×1024.
- Eliminación de fondo (background removal): produce logits por píxel que, tras aplicar sigmoide y umbral, dan la máscara del sujeto.
- Segmentación de alta resolución: la salida mantiene la resolución de 1024×1024, adecuada para bordes finos y detalles.
- Ejecución en ONNX Runtime: compatible con los proveedores DirectML y CPU, sin necesidad de PyTorch en tiempo de inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de fondo en herramientas de edición de imagen: el modelo recibe una imagen redimensionada a 1024×1024, normalizada con media y desviación típica de ImageNet, y devuelve logits que se convierten en máscara mediante sigmoide y umbral. Es el uso principal documentado (Realmspinner).
- Procesamiento por lotes en servidores Windows con DirectML: al ejecutarse bajo ONNX Runtime con el proveedor DirectML, permite integrar la segmentación en aplicaciones .NET o nativas sin instalar PyTorch.
- Generación de recortes para catálogos de producto: la salida de alta resolución facilita recortes con bordes precisos para imágenes de comercio electrónico.
- Preprocesado para pipelines de visión por computador: la máscara generada puede alimentar etapas posteriores de clasificación, detección o composición.
- Automatización de flujos de diseño gráfico: integración en scripts que sustituyen fondos de forma masiva en lotes de imágenes.
- Aplicaciones de escritorio con GPU de consumo: al necesitar aproximadamente 0,9 GB de memoria para los pesos fp32 más espacio de trabajo, puede ejecutarse en GPUs consumer con suficiente VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta mediciones de velocidad y fidelidad de la exportación:

| Metrica | Valor |
|---|---|
| Diferencia frente a torchvision en convolución deformable | ~1e-9 (diferencia absoluta máxima en entrada aleatoria) |
| Diferencia de salida frente al modelo PyTorch original | 8,6e-5 máximo en una imagen de prueba |
| Latencia en RTX 5090 con DirectML (imagen caliente) | 0,17–0,28 s, incluyendo pre y postprocesado |
| Primera llamada | más lenta por la compilación del grafo en DirectML |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,9 GB para los pesos fp32, más espacio de trabajo para activaciones y buffers de inferencia.
- GPU recomendadas: RTX 5090 (medición reportada), GPUs compatibles con DirectML; también puede ejecutarse en CPU mediante ONNX Runtime.
- Cabe en GPUs consumer: sí, dado el tamaño reducido del archivo; se requiere al menos ~1 GB de memoria libre más el espacio de trabajo.
- Opciones de despliegue: ONNX Runtime con proveedor DirectML o CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación.
- Latencia y throughput: 0,17–0,28 s por imagen en RTX 5090 con DirectML (imagen caliente); el throughput no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jmbell88/birefnet-onnx | no disponible (archivo de 932 MB fp32) | 1024×1024 fija | ONNX opset 17 | MIT | Hugging Face |
| ZhengPeng7/BiRefNet (original) | no disponible | 1024×1024 | PyTorch (safetensors/bin) | MIT | Hugging Face |
| onnx-community/BiRefNet-ONNX | no disponible | no disponible | ONNX | no disponible | Hugging Face |

La diferencia principal entre esta exportación y la de onnx-community es la reescritura de las convoluciones deformables para compatibilidad con DirectML; no se dispone de datos comparativos de rendimiento entre ambas.

## Limitaciones y advertencias

- Modelo exclusivamente de segmentación: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Entrada fija de 1024×1024: cualquier imagen debe redimensionarse y normalizarse previamente con la media y desviación típica de ImageNet; no admite resoluciones variables sin reexportar el grafo.
- La salida son logits, no probabilidades: es necesario aplicar sigmoide y un umbral para obtener la máscara.
- La validación de fidelidad se realizó sobre una sola imagen de prueba; no constituye un benchmark de calidad de segmentación.
- Riesgo de errores en bordes finos, objetos translúcidos o fondos con colores similares al sujeto, inherente al modelo original; no se documentan sesgos específicos en la información disponible.
- Licencia MIT: permite uso comercial, pero exige conservar el aviso de copyright de ZhengPeng.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- No se documentan limitaciones idiomáticas porque el modelo no procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jmbell88/birefnet-onnx
- Modelo original: https://huggingface.co/ZhengPeng7/BiRefNet
- Exportación ONNX de la comunidad: https://huggingface.co/onnx-community/BiRefNet-ONNX
- README de onnx-community/BiRefNet-ONNX: https://huggingface.co/onnx-community/BiRefNet-ONNX/blob/main/README.md
- Repositorio GitHub de BiRefNet (fork): https://github.com/ansj11/BiRefNet/tree/main
- ModelScope de BiRefNet-ONNX: https://www.modelscope.cn/models/onnx-community/BiRefNet-ONNX
