# laiyoi/femboydetector

## Resumen

`femboydetector` es un clasificador de imágenes publicado por el usuario laiyoi bajo el identificador `laiyoi/femboydetector`, aunque su nombre comercial real es "AstrBot Img Curator Taste DINOv2 v1". A pesar del nombre del repositorio, el propio autor aclara en la model card que el modelo no detecta identidad, género ni ninguna característica de personas reales: es un clasificador de tres clases ("skip", "suspicious", "collect") que el plugin AstrBot image-curator utiliza para decidir si una imagen o fotograma de vídeo merece ser archivado según los gustos del usuario.

Técnicamente se trata de un probe lineal sobre un backbone DINOv2 ViT-S/14 congelado (`vit_small_patch14_dinov2.lvd142m`). La cabeza está formada por LayerNorm, Dropout 0.2 y una capa Linear(384, 3). El modelo trabaja con entradas de 224x224 píxeles, normalización ImageNet y produce logits de tres dimensiones. Se distribuye tanto en formato PyTorch (`best.pt`) como en ONNX de forma fija (opset 17) para inferencia en CPU con onnxruntime.

Su relevancia es acotada y muy específica: es un componente de producto para un bot de chat (AstrBot) que filtra imágenes candidatas a guardarse. No es un modelo de propósito general ni está pensado para investigación abierta, y su licencia "other" sin texto explícito limita su reutilización. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (backbone congelado) + probe lineal (LayerNorm + Dropout 0.2 + Linear(384, 3)) |
| Parámetros totales | no disponible (ViT-S/14 tiene ~21 M en el backbone; el dato exacto del checkpoint no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 224x224) |
| Tipos de cuantización | no disponible (se distribuye ONNX float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin entrada de texto) |
| Licencia | other (sin texto de licencia explícito en la información disponible) |
| Formato de pesos | PyTorch (`best.pt`, state dict) y ONNX (`taste_classifier.onnx`, opset 17, forma fija) |

## Arquitectura y entrenamiento

El modelo es un clasificador de imágenes construido sobre un Vision Transformer pequeño de DINOv2, concretamente la variante `vit_small_patch14_dinov2.lvd142m` con parches de 14x14. El backbone se mantiene congelado y solo se entrena una cabeza lineal de tres salidas (LayerNorm, Dropout 0.2, Linear de 384 a 3). Las entradas se redimensionan al lado corto de 256 píxeles con interpolación bicúbica, se recortan al centro a 224x224, se normalizan a [0, 1] y se aplican media y desviación típica de ImageNet. La salida es un tensor de logits `[1, 3]` con el orden de clases `["skip", "suspicious", "collect"]` y el índice de clase positiva en 2.

El entrenamiento se realizó con AdamW (learning rate de la cabeza 1e-3), batch de 32, entradas 224x224 y más de 20 épocas sobre un dataset privado de favoritos etiquetados como collect, suspicious o skip. No se documenta el número de imágenes, la composición del dataset ni si hubo aumentos de datos. El umbral de decisión para la clase `collect` se calibra en validación para alcanzar una precisión de 0,95 y se almacena en `model_config.json`. La clase `suspicious` no se resuelve dentro del modelo: la política de guardado (cache por debajo de 3 imágenes guardadas, skip entre 3 y 5, save a partir de 5) se aplica fuera del clasificador, en el plugin. Se incluye un fichero `onnx_parity.json` con la comprobación de paridad entre PyTorch y ONNX.

## Capacidades

- Clasificación de imágenes en tres clases (`skip`, `suspicious`, `collect`) con salida de logits y puntuaciones por clase.
- Inferencia en CPU mediante onnxruntime sin necesidad de PyTorch (dependencias: `onnxruntime`, `numpy`, `Pillow`).
- Función auxiliar `decide_save()` que combina la etiqueta del modelo con el contador de imágenes guardadas del publicador para producir una decisión final (`save`, `cache`, `skip`).
- Procesamiento de fotogramas de vídeo como imágenes individuales (según la descripción del plugin).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada de texto.
- No tiene capacidades multilingües: no procesa lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras modalidades.

## Casos de uso

- Curaduría automática de imágenes en un bot de chat: el plugin AstrBot image-curator usa el clasificador para decidir si una imagen compartida en un grupo se archiva en la colección del usuario, aplicando el umbral calibrado y la política de `suspicious` para los casos ambiguos.
- Filtrado de fotogramas de vídeo: al procesar fotogramas extraídos de vídeos compartidos, el modelo puntúa cada frame y el plugin descarta los que caen en `skip`, reduciendo el almacenamiento de contenido irrelevante.
- Preclasificación en pipelines de moderación de contenido ligera: como primera etapa de bajo coste en CPU, el modelo puede separar imágenes candidatas antes de pasarlas a un clasificador más pesado o a revisión humana.
- Enriquecimiento de colecciones personales: el contador de imágenes guardadas y la clase `suspicious` permiten al plugin calibrar dinámicamente qué se guarda según el historial del usuario, útil en herramientas de organización de bibliotecas multimedia.
- Despliegue embebido en entornos sin GPU: al distribuirse en ONNX de forma fija y con dependencias mínimas, puede ejecutarse en servidores pequeños o contenedores ligeros junto al bot.
- Prototipado de clasificadores de "gusto" personalizados: sirve como plantilla para sustituir el probe lineal por uno propio sobre el mismo backbone DINOv2 congelado, reutilizando el pipeline de preprocesado y la exportación a ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card remite a `evaluation_test.json` para las métricas del checkpoint publicado (precisión, recall y F1 de la clase `collect` en el umbral calibrado, además de métricas por clase), pero esos valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la ruta ONNX CPU; en la ruta PyTorch, un ViT-S/14 con entrada 224x224 requiere del orden de 1-2 GB de VRAM en float32, aunque el dato exacto no se publica.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU con onnxruntime. Cualquier GPU consumer moderna (RTX 3060 o superior) puede ejecutarlo con holgura si se usa la ruta PyTorch.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de memoria para la ruta PyTorch; la ruta ONNX no requiere GPU.
- Opciones de despliegue: onnxruntime (CPU, recomendado por el autor), PyTorch con el checkpoint `best.pt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes).
- Latencia y throughput: no disponibles. Al ser un ViT-S con entrada fija de 224x224 y ejecución en CPU, se espera una latencia por imagen del orden de decenas de milisegundos en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laiyoi/femboydetector | Clasificador de imágenes (DINOv2 ViT-S/14 + probe) | ~21 M en backbone (no confirmado) | 224x224 fija | other | Hugging Face, ONNX + PyTorch |
| DINOv2 ViT-S/14 base (`facebook/dinov2-small`) | Backbone auto-supervisado | ~21 M | 518x518 nativa (adaptable) | Apache 2.0 | Hugging Face, ampliamente usado |
| CLIP ViT-B/32 (`openai/clip-vit-base-patch32`) | Modelo visión-lenguaje | ~151 M | 224x224 | MIT | Hugging Face, muy extendido |
| Modelos de clasificación de imágenes ImageNet (p. ej. ResNet-50) | CNN supervisada | ~25 M | 224x224 | BSD/Apache según variante | Hugging Face, torchvision |

La comparación directa es limitada: `femboydetector` es un probe de tres clases sobre un backbone congelado, no un modelo de propósito general. Frente al DINOv2 base, la diferencia es que aquí el backbone no se ajusta y la cabeza es específica del dominio del plugin. Frente a CLIP o ResNet-50, el modelo es mucho más pequeño y especializado, pero carece de capacidades zero-shot o de clasificación abierta.

## Limitaciones y advertencias

- El nombre del repositorio es engañoso y el propio autor advierte que el modelo no detecta identidad, género ni características de personas reales; no debe usarse para inferir nada sobre individuos.
- El modelo fue entrenado sobre un dataset privado de favoritos personales; no se documenta su composición, tamaño ni posibles sesgos, por lo que su generalización a otros dominios es incierta.
- La clase `suspicious` no es una decisión del modelo: depende de una política externa basada en el contador de imágenes guardadas, lo que introduce dependencia del estado del plugin.
- El umbral de `collect` está calibrado para una precisión de 0,95 en validación, lo que puede implicar un recall bajo; no se publican los valores concretos en la información disponible.
- Licencia "other" sin texto explícito: no se aclaran las condiciones de uso comercial, modificación ni redistribución. Es necesario contactar con el autor antes de usarlo en producción.
- No se han publicado métricas de benchmarks ni latencias; el rendimiento real en producción no está verificado de forma independiente.
- El repositorio no registra descargas ni likes, lo que sugiere poca validación por parte de la comunidad.
- El modelo no procesa texto ni audio y no soporta tool calling ni agentes; cualquier uso fuera de la clasificación de imágenes en tres clases es inadecuado.

## Enlaces

- Hugging Face: https://huggingface.co/laiyoi/femboydetector
- DINOv2 (paper): https://arxiv.org/abs/2304.07193
- DINOv2 (repositorio oficial): https://github.com/facebookresearch/dinov2
- Modelo base en Hugging Face: https://huggingface.co/facebook/dinov2-small
- AstrBot (proyecto del plugin): https://github.com/AstrBotDevs/AstrBot
- onnxruntime: https://onnxruntime.ai/
