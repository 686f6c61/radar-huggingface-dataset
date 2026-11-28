# hafeezaismail/fruit-freshness-convnext

## Resumen

Fruit Freshness Classifier es un modelo de clasificación de imágenes basado en ConvNeXt-Tiny y ajustado por transferencia desde el checkpoint `facebook/convnext-tiny-224`. Lo desarrolla el usuario de Hugging Face hafeezaismail y resuelve una tarea acotada: dada una fotografía de una fruta, predecir simultáneamente el tipo de fruta (manzana, plátano, uva, guayaba, azufaifo, naranja, granada o fresa) y su estado (fresca o podrida), en una única etiqueta entre 16 clases posibles. El modelo se publicó en noviembre de 2026 y acumula 195 descargas.

Arquitectónicamente es una red convolucional pura, sin componente Transformer de atención global, con 27.832.432 parámetros totales y un repositorio de 0,2 GB en formato safetensors. No es un modelo generativo ni multilingüe: no procesa texto ni mantiene conversaciones, por lo que su utilidad se limita a pipelines de visión por computador para inspección visual de producto.

Su relevancia práctica está en el ajuste fino eficiente sobre un dataset pequeño (3.200 imágenes) con resultados muy altos reportados por el autor (accuracy 0,9938 y macro F1 0,9937 sobre un conjunto de test del 15 %). Es un ejemplo típico de transfer learning aplicado a control de calidad agroalimentario, con licencia Apache 2.0 que permite uso comercial sin restricciones de atribución adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (red convolucional pura, familia ConvNeXt) |
| Parametros totales | 27.832.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 píxeles según el checkpoint base) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original; admite cuantización a FP16/INT8 vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Modelo base | facebook/convnext-tiny-224 |
| Dataset de entrenamiento | Project-AgML/fresh_rotten_fruit_classification (config raw, 3.200 imágenes) |
| Numero de clases | 16 (8 frutas x 2 estados) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 195 / 0 |

## Arquitectura y entrenamiento

El modelo parte de ConvNeXt-Tiny, una arquitectura convolucional moderna que adopta decisiones de diseño propias de los Vision Transformers (parches con kernel 4x4 en el stem, normalización LayerNorm, activación GELU y bloques con convoluciones depthwise de 7x7) manteniendo la eficiencia de una CNN. El checkpoint base `facebook/convnext-tiny-224` se entrenó originalmente sobre ImageNet-1k a resolución 224x224; el autor lo reutiliza como extractor de características y sustituye la cabeza de clasificación por una de 16 salidas.

El ajuste fino se realizó sobre la configuración `raw` del dataset `Project-AgML/fresh_rotten_fruit_classification`, con 3.200 imágenes etiquetadas en 16 clases que combinan tipo de fruta y estado. La model card no detalla hiperparámetros de entrenamiento (learning rate, número de épocas, tamaño de batch, aumentos de datos, congelación de capas ni estrategia de validación más allá de la partición 85/15). Tampoco se documenta el uso de técnicas adicionales como mixup, cutmix o destilación. No hay información sobre el volumen de cómputo ni sobre las GPU empleadas.

## Capacidades

- Clasificación de imágenes en 16 clases cerradas que combinan fruta y estado: `fresh_apple`, `fresh_banana`, `fresh_grape`, `fresh_guava`, `fresh_jujube`, `fresh_orange`, `fresh_pomegranate`, `fresh_strawberry` y sus equivalentes `rotten_*`.
- Predicción conjunta de tipo y frescura en una sola pasada, sin necesidad de dos modelos en cascada.
- Integración directa con la librería `transformers` mediante `pipeline('image-classification', ...)`.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (captioning, VQA, detección) ni audio.
- No tiene capacidades multilingües: la salida son etiquetas fijas en inglés definidas en el propio modelo.
- No dispone de modo "thinking" ni de salida estructurada más allá de la lista de probabilidades por clase que devuelve el pipeline.

## Casos de uso

- Inspección en línea de fruta en almacén: el modelo puede clasificar imágenes capturadas por cámaras fijas sobre cinta transportadora y separar automáticamente piezas frescas de podridas entre las ocho frutas soportadas, usando la etiqueta de mayor probabilidad como señal de descarte.
- Control de calidad en punto de venta: integrado en una aplicación móvil, permite al operario fotografiar una pieza y obtener en milisegundos una etiqueta de frescura, útil para auditorías rápidas de lineal en supermercados.
- Triaje previo en plantas de envasado: como primer filtro barato antes de sistemas más caros (visión hiperespectral, sensores de gas), reduciendo el volumen de imágenes que llegan a modelos más pesados.
- Etiquetado asistido de datasets: el modelo puede preanotar grandes lotes de imágenes de fruta para que un humano solo revise los casos dudosos, acelerando la construcción de nuevos conjuntos de datos.
- Docencia y prototipado de transfer learning: por su tamaño reducido (27,8 M de parámetros) y licencia permisiva, sirve como ejemplo reproducible de ajuste fino de ConvNeXt en cursos de visión por computador.
- Monitorización en agricultura de precisión: desplegado en dispositivos de borde con cámara (Raspberry Pi con acelerador, Jetson Nano) para estimar el estado de la cosecha en campo, siempre que las condiciones de iluminación y fondo se controlen.
- Pruebas de regresión visual en aplicaciones agroalimentarias: al ser un modelo pequeño y determinista, encaja en pipelines de CI para verificar que los cambios en el preprocesado de imagen no degradan la clasificación.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9938 | Test retenido (15 % del dataset) |
| Macro F1 | 0,9937 | Test retenido (15 % del dataset) |

No se han publicado resultados de benchmarks en la informacion disponible más allá de estas dos métricas reportadas por el autor. No hay comparación con otros modelos en la model card ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 110 MB solo para pesos (27,8 M de parámetros x 4 bytes), más activaciones; en la práctica, menos de 1 GB en cualquier GPU moderna.
- En FP16: aproximadamente 56 MB de pesos; en INT8: unos 28 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100, H100 y GPUs integradas modestas.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños; también es viable en dispositivos de borde (Jetson Nano, Raspberry Pi 5 con acelerador Coral o similar).
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, Triton Inference Server, ONNX Runtime tras exportación, y despliegue gestionado en Hugging Face Inference Endpoints (el modelo está marcado como `endpoints_compatible`). No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hafeezaismail/fruit-freshness-convnext | 27,8 M | Imagen 224x224 | Clasificación fruta/estado (16 clases) | Apache 2.0 | Hugging Face |
| facebook/convnext-tiny-224 | 28,6 M aprox. | Imagen 224x224 | Clasificación ImageNet-1k (1.000 clases) | Apache 2.0 | Hugging Face |
| ResNet-50 (ImageNet) | 25,6 M | Imagen 224x224 | Clasificación ImageNet-1k | Varía según checkpoint | Hugging Face / torchvision |
| ViT-Base/16 (ImageNet) | 86 M | Imagen 224x224 | Clasificación ImageNet-1k | Varía según checkpoint | Hugging Face |

La comparación directa con alternativas específicas de clasificación de frescura de fruta no está disponible: no se han identificado en la información proporcionada otros checkpoints públicos de la misma tarea. Frente al checkpoint base, este modelo cambia la cabeza de 1.000 a 16 clases y está especializado en el dominio; frente a ResNet-50 y ViT-Base, ofrece menor número de parámetros que ViT-Base y una arquitectura convolucional moderna, pero no hay datos de rendimiento comparables en la model card.

## Limitaciones y advertencias

- Entrenado con solo 3.200 imágenes y, según el autor, con fondos limpios; el rendimiento puede degradarse con escenas desordenadas, iluminación atípica u oclusiones.
- Solo conoce las ocho frutas listadas; cualquier otra fruta o variedad no contemplada se clasificará erróneamente en una de las 16 clases.
- No es una herramienta de seguridad alimentaria: el autor lo advierte explícitamente. No debe usarse para decidir si un alimento es apto para consumo humano.
- Riesgo de sobreajuste al dataset: la accuracy de 0,9938 sobre un test del 15 % sugiere una partición posiblemente poco desafiante; no se reportan métricas de validación cruzada ni de generalización a dominios externos.
- No hay información sobre sesgos demográficos (no aplica directamente, al no procesar personas) ni sobre sesgos de dominio (variedades regionales de fruta, estados intermedios de maduración).
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar la licencia del dataset de origen (`Project-AgML/fresh_rotten_fruit_classification`) antes de explotar el modelo en producción, ya que la model card no detalla la licencia del conjunto de datos.
- No soporta entrada de texto ni instrucciones; cualquier caso de uso conversacional o multimodal queda fuera de su alcance.
- No se documentan limitaciones de contexto ni de idioma porque no aplican, pero tampoco se documenta el preprocesado exacto (normalización, redimensionado) más allá de heredar el del checkpoint base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hafeezaismail/fruit-freshness-convnext
- Modelo base: https://huggingface.co/facebook/convnext-tiny-224
- Dataset de entrenamiento: https://huggingface.co/datasets/Project-AgML/fresh_rotten_fruit_classification
- Paper de ConvNeXt (A ConvNet for the 2020s): https://arxiv.org/abs/2201.03545
- Repositorio oficial de ConvNeXt (facebookresearch): https://github.com/facebookresearch/ConvNeXt
