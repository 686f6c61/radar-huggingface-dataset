# litert-community/vit-base-patch16-224

## Resumen

`litert-community/vit-base-patch16-224` es una conversión al formato LiteRT/TFLite del modelo `google/vit-base-patch16-224`, un Vision Transformer (ViT) para clasificación de imágenes en ImageNet-1k. El paquete lo publica la comunidad LiteRT y fija la revisión de origen `3f49326eb077187dfe1c2a2bb15fbd74e6ab91e3`. Su propósito no es ofrecer un modelo nuevo, sino proporcionar artefactos portables listos para compilación en NPU específicas del dispositivo.

El paquete incluye cuatro variantes `.tflite`: FP32 de referencia, A16W8 (INT16 en activaciones del transformer, INT8 en pesos de capas fully connected), una variante A16W8 dedicada a compilación en Qualcomm HTP con activaciones UINT16, y una A8W8 mixta experimental. Todas mantienen entrada y salida en FP32 y requieren preprocesado de imagen externo. Los ficheros son artefactos fuente portables, no programas NPU ya compilados.

Es relevante para desarrolladores que despliegan visión en el borde (móvil, embebido, NPU dedicada) y necesitan un ViT base con cuantización post-entrenamiento verificable, receta de TorchAO reproducible y separación clara entre referencia FP32 y variantes cuantizadas. El repositorio ocupa 1,0 GB e incluye configuración, mapeo de etiquetas, metadatos de tensores y un script de ejemplo en CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), patch size 16, resolución 224x224 |
| Parámetros totales | no disponible (modelo base ViT-Base de Google; el paquete no declara el recuento) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; no procesa texto) |
| Tipos de cuantización | FP32, A16W8 (INT16 activaciones / INT8 pesos), A16W8 Qualcomm (UINT16 activaciones), A8W8 mixta experimental |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`); configuración en `config.json`, `preprocessor_config.json`, `labels.json`, `model_metadata.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer estándar de Google, con parches de 16x16 sobre imágenes de 224x224, preentrenado en ImageNet-21k y ajustado en ImageNet-1k. El paquete LiteRT no reentrena el modelo: parte del checkpoint fijado en FP32 en modo evaluación y aplica cuantización estática post-entrenamiento, sin QAT ni fine-tuning.

La receta de cuantización usa PyTorch `2.14.1+cu130`, TorchAO `0.18.0+cu130` y Transformers `5.21.0`. Se calibra con 500 imágenes de validación de ImageNet-1k, batch de tamaño uno, con el preprocesado PIL incluido. Se observan las entradas de las 73 capas `torch.nn.Linear` (incluido el clasificador) con `AffineQuantizedMinMaxObserver`: INT8 asimétrico `[-128, 127]`, granularidad `PerTensor()`, escalas FP32 y cero puntos INT32. Los pesos FP32 se cuantizan con granularidad simétrica `PerRow()` (una escala por canal de salida), cero punto cero y rango estrecho explícito `[-127, 127]`, usando `choose_qparams_affine` y `quantize_affine` de TorchAO.

En el grafo exportado, las activaciones permanecen cuantizadas a través de atención, residual, reshape, transpose, softmax y GELU. LayerNorm se implementa con operadores compuestos de interfaces cuantizadas y subgrafos de descomposición en coma flotante para ejecución de respaldo. El patch embedding y las interfaces públicas de entrada/salida siguen en coma flotante, por lo que el modelo no usa aritmética entera de extremo a extremo. A16W8 conserva un engrosamiento de escala de entrada en las capas fully connected que lo requerían bajo un perfil de acumulador de 32 bits, pero omite el recorte explícito de entrada del acumulador.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, con mapeo de índice a etiqueta en `labels.json`.
- Inferencia en CPU mediante el script de ejemplo `run_image.py`, con preprocesado PIL incluido.
- Despliegue en NPU tras compilación específica de dispositivo a partir de los artefactos `.tflite` portables.
- Variante A16W8 orientada a NPU compatibles con activaciones INT16; variante Qualcomm con activaciones UINT16 para compilación en HTP.
- Variante A8W8 mixta para dispositivos limitados a acumulación entera de 32 bits en kernels fully connected, con compromiso de precisión sustancial.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni diálogo: es exclusivamente un clasificador de imágenes.
- No hay modo thinking ni capacidades multilingües.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo se integra en aplicaciones móviles o embebidas mediante LiteRT, usando la variante A16W8 en NPU compatibles para obtener el mejor equilibrio observado entre precisión y velocidad.
- Etiquetado automático de catálogos de producto: se ejecuta sobre lotes de imágenes con el artefacto FP32 de referencia para validar el pipeline antes de pasar a cuantización, dado que el preprocesado está estandarizado en `preprocessor_config.json`.
- Filtrado previo en cámaras y dispositivos IoT: la variante A16W8 Qualcomm permite compilar para HTP y ejecutar clasificación local sin enviar imágenes a la nube, reduciendo latencia y coste de ancho de banda.
- Prototipado de pipelines de visión en CPU: `run_image.py` y el modelo FP32 permiten verificar resultados de referencia y comparar contra variantes cuantizadas antes de comprometerse con una NPU concreta.
- Evaluación de backends de cuantización: el paquete sirve como caso de prueba para validar el soporte de acumuladores de 32 bits, interfaces LayerNorm cuantizadas y comportamiento de escalas por tensor en distintos compiladores NPU.
- Docencia e investigación en eficiencia de modelos: la receta TorchAO documentada permite reproducir el proceso de cuantización estática y estudiar el impacto de A16W8 frente a A8W8 en un ViT-Base.
- Selección de variante en producción: el equipo puede desplegar FP32 como referencia, A16W8 como opción principal y A8W8 solo en hardware restringido, comparando precisión y latencia medidas en el dispositivo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que A16W8 ofrece "el mejor equilibrio observado entre precisión y velocidad" en las NPU probadas y que A8W8 tiene "un compromiso de precisión sustancial", pero no proporciona cifras de exactitud top-1/top-5, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio pesa 1,0 GB e incluye las cuatro variantes; el tamaño de cada `.tflite` individual no se detalla.
- GPU recomendadas: no disponible para este paquete. La model card advierte que el importador LiteRT GPU IR probado no soporta la cuantización entera de 16 bits de A16W8.
- NPU objetivo: A16W8 es la opción principal en NPU compatibles; `model_a16w8_qualcomm.tflite` está pensada para compilación en Qualcomm HTP. Apple ANE y NPU Qualcomm soportan FP16 de forma nativa y su rendimiento suele ser muy bueno, según la model card.
- Consumer GPU: no se indica compatibilidad; el foco es despliegue en el borde, no en GPU de escritorio.
- Opciones de despliegue: LiteRT/TFLite con compilación específica de dispositivo; el fallback en CPU puede ser lento para A16W8. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes).
- Latencia y throughput: no disponibles. La model card solo indica comparaciones cualitativas entre variantes.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| litert-community/vit-base-patch16-224 | ViT-Base, patch 16 | no disponible | imagen 224x224 | TFLite (FP32, A16W8, A8W8) | Apache 2.0 | Hugging Face, 201 descargas |
| google/vit-base-patch16-224 | ViT-Base, patch 16 | no disponible | imagen 224x224 | safetensors/PyTorch | Apache 2.0 | Hugging Face (modelo de origen) |
| Otras conversiones TFLite de ViT | no disponible | no disponible | no disponible | TFLite | no disponible | no disponible |

La comparación cuantitativa de precisión y latencia frente a alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo de origen es el formato: este paquete ofrece artefactos TFLite cuantizados listos para compilación NPU, mientras que `google/vit-base-patch16-224` es el checkpoint PyTorch de referencia.

## Limitaciones y advertencias

- Los artefactos A16W8 y A8W8 se calibraron con un conjunto de datos concreto y, según el autor, no deben usarse directamente en producción sin validación propia.
- La lista exacta de imágenes de calibración no se distribuye, por lo que la receta no garantiza escalas ni ficheros idénticos a los publicados.
- A8W8 presenta un compromiso de precisión sustancial y conserva regiones INT16; el soporte del backend debe verificarse antes de adoptarlo.
- A16W8 puede ser lento en fallback CPU y no es compatible con el importador LiteRT GPU IR probado por su cuantización entera de 16 bits.
- A16W8 omite el recorte explícito de entrada del acumulador; conviene validar el comportamiento del acumulador y la precisión en cada backend.
- Los `.tflite` no contienen programas NPU compilados: requieren compilación específica de dispositivo antes de ejecutarse en NPU.
- El modelo clasifica solo las 1.000 clases de ImageNet-1k; no es un modelo generativo ni de propósito general.
- Riesgo de sesgos y errores heredado del entrenamiento en ImageNet-21k/ImageNet-1k; no se documentan análisis de sesgo en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo de origen.
- No se proporciona fichero FP16, aunque el autor indica que es fácil de generar desde el artefacto FP32 y que suele ser la opción preferente en Apple ANE y NPU Qualcomm.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/vit-base-patch16-224
- Modelo de origen: https://huggingface.co/google/vit-base-patch16-224
- Paper de ViT: https://arxiv.org/abs/2010.11929
- Guía de cuantización estática de TorchAO: https://docs.pytorch.org/ao/stable/eager_tuto
- Dataset ImageNet-1k: https://huggingface.co/datasets/imagenet-1k
- Dataset ImageNet-21k: https://huggingface.co/datasets/imagenet-21k
