# ansari-ai-dev/smartsort-vit-waste

## Resumen

SmartSort ViT es un modelo de clasificación de imágenes basado en un Vision Transformer afinado a partir de `google/vit-base-patch16-224`. Lo desarrolla el usuario `ansari-ai-dev` en el marco de un proyecto universitario (SmartSort AI, asignatura de Formación Profesional, YNU) y resuelve una tarea acotada: clasificar una fotografía de un único residuo en una de diez categorías (batería, biológico, cartón, ropa, vidrio, metal, papel, plástico, zapatos y basura).

Técnicamente es un ViT-Base con parches de 16x16 y resolución de entrada de 224x224, con 85.806.346 parámetros en formato safetensors y un repositorio de 0,3 GB. No es un modelo generativo ni multimodal conversacional: es un clasificador de imagen puro (pipeline `image-classification`) pensado para alimentar un sistema de separación de residuos.

Su relevancia actual es limitada y muy específica: sirve como ejemplo reproducible de fine-tuning completo de un ViT para una taxonomía de residuos concreta y como componente de un prototipo de clasificación automática. No hay información publicada sobre licencia, idiomas ni benchmarks frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16x16, resolución 224x224) |
| Parametros totales | 85.806.346 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imagen, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `google/vit-base-patch16-224`, un transformer de visión con parches de 16x16 sobre imágenes de 224x224 y 85,8 M de parámetros. Se ha realizado un fine-tuning completo (no LoRA ni adaptadores) con AdamW, learning rate 2e-5, batch size 32, 8 épocas, 10% de warm-up, precisión fp16 y semilla 42. El checkpoint publicado es el de la época 7, seleccionado por macro-F1 de validación.

Los datos proceden del dataset de Kaggle "Garbage Classification (12 classes)" (licencia de base de datos ODbL-1.0), limpiado eliminando imágenes corruptas y duplicadas y fusionando las tres clases de vidrio para quedarse en 10 clases finales. La partición es estratificada 70/15/15 a nivel de grupo, con semilla 42 y sin imágenes casi duplicadas entre splits. No se documenta el número total de imágenes de entrenamiento ni el volumen de tokens (no aplica). Tampoco se indica uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un clasificador.

El preprocesado de inferencia está definido: redimensionar el lado corto a 256, recorte central a 224x224 y normalización con media 0,5 y desviación típica 0,5.

## Capacidades

- Clasificación de imagen en 10 clases de residuos: battery, biological, cardboard, clothes, glass, metal, paper, plastic, shoes y trash.
- Salida de probabilidades por clase mediante la cabeza de clasificación estándar de ViT.
- Funciona sobre una única imagen con un único objeto protagonista, según la propia model card.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión generativa, audio ni ninguna otra modalidad.
- Integrable en pipelines de `transformers` con `AutoModelForImageClassification` y `ViTImageProcessor`.

## Casos de uso

- Prototipo de punto limpio inteligente: el modelo clasifica la foto de un residuo tomada por el usuario y devuelve el contenedor correspondiente, aprovechando su accuracy de validación del 98,58% sobre imágenes de producto.
- Clasificación previa en aplicaciones móviles de reciclaje: integrado como cabeza de inferencia ligera (85,8 M de parámetros) en una app que envía la imagen al servidor o ejecuta el modelo en local con ONNX Runtime.
- Etiquetado asistido de datasets de residuos: usar el modelo para preanotar imágenes nuevas y revisar manualmente solo los casos de baja confianza, acelerando la curación de datos.
- Educación y concienciación ambiental: demo web que muestra la categoría detectada y explica las reglas locales de separación, con el modelo como clasificador de apoyo.
- Automatización de cintas de triaje en laboratorio: clasificación de imágenes capturadas en condiciones controladas para validar la viabilidad de un sistema de visión antes de invertir en hardware industrial.
- Benchmark interno de fine-tuning de ViT: servir de referencia reproducible (semilla 42, split estratificado, hiperparámetros documentados) para comparar futuras variantes del mismo clasificador.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 0,9858 | Validación (2.323 imágenes) |
| Macro-F1 | 0,9825 | Validación (2.323 imágenes) |

No se han publicado resultados de benchmarks en la información disponible para el split de test ni para fotos reales de teléfono móvil; la model card remite al repositorio del proyecto para esos datos. Tampoco hay comparación numérica con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB de pesos (85,8 M de parámetros), más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- En fp16 los pesos ocupan unos 0,17 GB, por lo que la inferencia es viable incluso en GPUs de gama de entrada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; para lotes grandes en servidor, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU consumer y también en CPU para inferencia por imagen individual, con latencias del orden de decenas de milisegundos en GPU y de cientos en CPU (estimación, no medida publicada).
- Opciones de despliegue: `transformers` con `AutoModelForImageClassification`, exportación a ONNX Runtime, TorchScript o integración en servicios con FastAPI; no se documentan pesos GGUF para llama.cpp ni Ollama, que además no aplican a un clasificador de imagen.
- Throughput y latencia concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmartSort ViT (este modelo) | 85,8 M | Imagen 224x224 | Clasificación de 10 clases de residuos | no disponible | Hugging Face |
| google/vit-base-patch16-224 | 85,8 M | Imagen 224x224 | Clasificación ImageNet-1k (1.000 clases) | Apache 2.0 (modelo base de Google) | Hugging Face |
| Otros clasificadores de residuos en Hugging Face | no disponible | no disponible | Clasificación de residuos | variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado con fotos de producto de estilo web; la precisión baja en fotos reales con desorden, mala iluminación o varios objetos en la imagen.
- La clase "trash" agrupa principalmente artículos de higiene personal (mascarillas, cepillos de dientes, pañales), lo que puede generar confusiones con otras categorías.
- Modelo de trabajo de curso: no sustituye las normas locales de separación de residuos ni debe usarse como única fuente de decisión en producción.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Riesgo de sesgo por el dataset de origen (Kaggle, ODbL-1.0): la distribución de clases y las condiciones de captura no están documentadas en detalle.
- Riesgo de alucinación en el sentido de clasificaciones erróneas con alta confianza en imágenes fuera de distribución; no se documentan umbrales de confianza ni calibración.
- Sin información sobre el split de test ni sobre el rendimiento en fotos reales dentro de la model card; esos datos quedan en el repositorio del proyecto.
- 0 descargas y 0 likes en el momento de la ficha: ecosistema de validación prácticamente nulo.

## Enlaces

- Hugging Face: https://huggingface.co/ansari-ai-dev/smartsort-vit-waste
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Dataset de origen (Kaggle "Garbage Classification (12 classes)"): no disponible como enlace directo en la información proporcionada
- Repositorio del proyecto SmartSort AI: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
