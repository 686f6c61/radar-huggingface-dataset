# huyhuy07/potato-disease-convnext

## Resumen

Potato disease ConvNeXt es un clasificador de imágenes especializado en diagnosticar enfermedades en hojas de patata. Clasifica cada fotografía en una de tres categorías: tizón temprano (Early Blight), hoja sana (Healthy) y tizón tardío (Late Blight). Lo desarrolla el autor huyhuy07 en el marco del proyecto IXR (agritechixr), una iniciativa que publica una colección de 44 modelos de clasificación de enfermedades de cultivos.

El modelo parte de la arquitectura ConvNeXt-Small (`convnext_small.fb_in22k_ft_in1k`), una red neuronal convolucional moderna preentrenada en ImageNet-22k y afinada posteriormente sobre el conjunto de datos LeafNet (CC-BY-4.0) junto con fotografías de campo propias de los autores. Con 49,5 millones de parámetros y una entrada de 224 × 224 píxeles RGB, el modelo pesa aproximadamente 99 MB en precisión media, lo que lo hace muy ligero y fácil de desplegar en entornos con recursos limitados.

Su relevancia radica en la especialización: frente a clasificadores genéricos, ofrece etiquetas directamente accionables para el diagnóstico agronómico y se integra en una aplicación real (LULC Fetch) que primero identifica el cultivo y después ejecuta el modelo de enfermedad correspondiente. La model card advierte que la precisión del 96,0 % se midió sobre fotos de los mismos conjuntos de datos de entrenamiento, por lo que el rendimiento en campo real será inferior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Small (`convnext_small.fb_in22k_ft_in1k`) |
| Parámetros totales | 49.456.995 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 × 224 RGB) |
| Tipos de cuantización | no disponible (pesos en safetensors; la model card menciona 99 MB en media precisión) |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ConvNeXt es una red neuronal convolucional pura que adopta decisiones de diseño propias de los transformers de visión (bloques con normalización LayerNorm, activación GELU, convoluciones depthwise de 7 × 7 y estructura de etapas con proporciones 3:3:9:3). El modelo base `convnext_small.fb_in22k_ft_in1k` fue preentrenado en ImageNet-22k y afinado en ImageNet-1k, y sobre esa base se realizó el ajuste fino para la clasificación de tres clases de enfermedad de la patata.

El entrenamiento se llevó a cabo con el conjunto LeafNet (CC-BY-4.0) más fotografías de campo de los propios autores. Las imágenes se redimensionaron a 224 × 224 sin recorte. La model card no detalla el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o regularización específicas. El conjunto de prueba consta de 247 fotografías retenidas, procedentes de los mismos conjuntos de datos de entrenamiento, lo que limita la validez del rendimiento reportado como estimación de generalización en campo.

## Capacidades

- Clasificación de imágenes de hojas de patata en tres clases: Early Blight, Healthy y Late Blight.
- Salida de probabilidades por clase mediante softmax, con etiquetas accesibles en `model.pretrained_cfg["label_names"]`.
- Integración nativa con la librería `timm` (`timm.create_model` con `hf-hub`).
- Transformación de datos estandarizada mediante `timm.data.resolve_data_config` y `timm.data.create_transform`.
- Mapa de etiquetas originales del dataset en `label_descriptions` dentro de `config.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de visión puro.
- Diseñado para funcionar como componente dentro de un pipeline mayor (detección de cultivo y selección del modelo de enfermedad adecuado).

## Casos de uso

- Diagnóstico agronómico asistido en aplicación móvil: el modelo recibe una foto de una hoja de patata y devuelve la clase de enfermedad con su probabilidad, permitiendo al agricultor obtener una primera orientación antes de consultar a un experto. Su tamaño reducido (99 MB) facilita el despliegue en dispositivos con recursos limitados.
- Integración en la aplicación LULC Fetch (Agri ▸ Diagnose crop disease): el modelo se ejecuta después de que un detector de cultivo identifique que la planta es patata, con una comprobación previa de calidad de la foto y generación de un mapa de enfermedades a partir de fotos geolocalizadas.
- Monitorización de parcelas con drones o teléfonos: clasificación por lotes de imágenes capturadas en campo para detectar focos de tizón temprano o tardío y priorizar inspecciones.
- Sistemas de alerta temprana: al procesar imágenes periódicas de una explotación, el modelo puede señalar la aparición de Late Blight (recall del 99,1 % en el conjunto de prueba) y activar protocolos de tratamiento.
- Herramienta educativa y de extensión agraria: permite a técnicos y estudiantes comparar síntomas visuales con la predicción del modelo y reforzar el aprendizaje sobre enfermedades de la patata.
- Filtrado previo en pipelines de anotación: el modelo puede preetiquetar grandes volúmenes de fotos de hojas para que anotadores humanos revisen solo los casos dudosos, reduciendo el coste de construcción de nuevos datasets.
- Investigación en visión aplicada a agricultura: sirve como línea base ligera para experimentos de clasificación de enfermedades de cultivos y para comparar con arquitecturas alternativas.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 247 fotografías retenidas (procedentes de los mismos datasets de entrenamiento):

| Clase | Recall | F1 | Fotos de prueba |
|---|---|---|---|
| Early Blight | 92,3 % | 0,956 | 117 |
| Healthy | 100,0 % | 1,000 | 15 |
| Late Blight | 99,1 % | 0,958 | 115 |
| Global (test accuracy) | 96,0 % | macro-F1 0,971 | 247 |

No se han publicado resultados de benchmarks estándar (ImageNet, etc.) ni comparaciones con otros modelos en la información disponible. La propia model card advierte que, al proceder las fotos de prueba de los mismos datasets de entrenamiento, el rendimiento en fotografías reales de campo será inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 49,5 millones de parámetros, la inferencia en FP32 requiere aproximadamente 200 MB de memoria para los pesos, y en FP16 alrededor de 100 MB. El consumo real depende del tamaño de lote y del framework.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo está pensado para ejecutarse incluso en CPU. Una RTX 4090, A100 o H100 lo ejecutarán con enorme holgura, pero no son necesarias.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: `timm` con PyTorch (vía `hf-hub`), exportación a ONNX u otros formatos no documentada en la información disponible. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el propio proyecto publica otros 41 modelos de enfermedad para distintos cultivos y 2 detectores de cultivo, todos ellos con la misma licencia CC-BY-4.0 y disponibles como repositorios independientes o agregados en `ixrbhii/multicrop-disease-models`. Para alternativas de otras fuentes (por ejemplo, clasificadores basados en ResNet o EfficientNet entrenados sobre PlantVillage), no hay datos disponibles en esta ficha.

## Limitaciones y advertencias

- El 96,0 % de precisión se midió sobre fotos de los mismos datasets de entrenamiento; en fotografías reales de campo el rendimiento será inferior, tal como advierte la model card.
- El conjunto de prueba de la clase Healthy es muy pequeño (15 fotos), por lo que el recall del 100 % no es estadísticamente robusto.
- Rendimiento óptimo solo con una hoja que ocupe la mayor parte de la foto, con luz diurna y enfoque correcto. Por debajo de aproximadamente el 45 % de confianza, la model card recomienda solicitar una foto mejor.
- Riesgo de falsos negativos y confusiones entre Early Blight y Late Blight en imágenes con síntomas poco visibles o condiciones de iluminación adversas.
- No se han documentado sesgos específicos, pero al entrenarse con LeafNet y fotos propias, puede generalizar peor a variedades de patata, regiones o condiciones de captura no representadas en esos datos.
- Licencia CC-BY-4.0: permite uso comercial con atribución. Es obligatorio acreditar a "Multi-crop disease models, IXR (agritechixr)" y a los datasets de entrenamiento (LeafNet).
- Un diagnóstico del modelo apoya, pero no sustituye, la evaluación de un experto agrícola local.
- El repositorio tiene muy pocas descargas (15) y ningún "like", lo que indica escasa validación por parte de la comunidad.
- La model card incluye un identificador de repositorio distinto (`ixrbhii/potato-disease-convnext`) en el ejemplo de código, lo que puede generar confusión al cargar el modelo desde `huyhuy07/potato-disease-convnext`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huyhuy07/potato-disease-convnext
- Colección completa de 44 modelos: https://huggingface.co/collections/ixrbhii/multi-crop-disease-models-42-crops-6ac0a3291f2153fa716e2993
- Repositorio agregado de los 44 modelos: https://huggingface.co/ixrbhii/multicrop-disease-models
- Dataset de síntomas, tratamientos y plagas: https://huggingface.co/datasets/ixrbhii/crop-disease-qa
- Dataset de entrenamiento LeafNet: https://huggingface.co/datasets/enalis/LeafNet
- Aplicación LULC Fetch: https://github.com/agritechixr/lulc-fetch
