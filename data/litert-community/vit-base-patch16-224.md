# litert-community/vit-base-patch16-224

## Resumen

`litert-community/vit-base-patch16-224` es una conversión al formato LiteRT/TFLite del modelo de clasificación de imágenes `google/vit-base-patch16-224`, un Vision Transformer (ViT) de 86 millones de parámetros entrenado originalmente sobre ImageNet-21k y afinado sobre ImageNet-1k. El paquete, publicado por la comunidad LiteRT, no introduce nuevos pesos: parte de la revisión `3f49326eb077187dfe1c2a2bb15fbd74e6ab91e3` del checkpoint de Google y ofrece tres variantes cuantizadas listas para compilación en NPU.

Su relevancia radica en el despliegue en dispositivo (edge): proporciona artefactos `.tflite` portables con cuantización post-entrenamiento estática (FP32, A16W8 y A8W8 mixta) pensados para compilarse a programas específicos de NPU en el dispositivo objetivo. Esto permite ejecutar un transformer de visión con aceleración hardware en móviles y sistemas embebidos sin reentrenar ni recurrir a QAT.

El modelo resuelve el problema de llevar ViT a hardware heterogéneo con restricciones de acumulador de 32 bits, ofreciendo variantes con distinto compromiso precisión/velocidad. La arquitectura es un transformer estándar con patches de 16x16 sobre entradas de 224x224 píxeles, 12 capas y 12 cabezas de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base), patch 16x16, 12 capas, 12 cabezas |
| Parametros totales | 86 M (aproximado, ViT-Base; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes, entrada 224x224) |
| Tipos de cuantizacion | FP32, A16W8 (act. INT16, pesos INT8), A8W8 mixta (FC INT8, atención/residual/LayerNorm INT16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), más `config.json`, `preprocessor_config.json`, `labels.json`, `model_metadata.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un Vision Transformer estándar: la imagen de entrada se divide en parches de 16x16 píxeles, se proyectan linealmente con patch embedding y se procesan por 12 bloques transformer con atención multi-cabeza y MLP. La cabeza de clasificación produce las 1.000 clases de ImageNet-1k. Los pesos originales provienen de `google/vit-base-patch16-224`, preentrenado en ImageNet-21k y afinado en ImageNet-1k.

La conversión a LiteRT emplea cuantización estática post-entrenamiento (sin QAT ni fine-tuning) con PyTorch 2.14.1+cu130, TorchAO 0.18.0+cu130 y Transformers 5.21.0. La calibración usa 500 imágenes de validación de ImageNet-1k con batch de tamaño uno. Se observan las entradas de las 73 capas `torch.nn.Linear` (incluida la clasificadora) con `AffineQuantizedMinMaxObserver` asimétrico INT8 `[-128, 127]`, granularidad `PerTensor()`, escalas FP32 y zero points INT32. Los pesos FP32 se cuantizan con granularidad simétrica `PerRow()` (una escala por canal de salida), zero point cero y rango estrecho `[-127, 127]`. Las variantes A16W8 y A8W8 comparten los mismos códigos y escalas de pesos INT8; las escalas de activación son por tensor. El patch embedding y las interfaces públicas de entrada/salida permanecen en coma flotante, por lo que no hay aritmética entera de extremo a extremo. Los grafos mantienen las activaciones cuantizadas a través de atención, residual, reshape, transpose, softmax y GELU; LayerNorm usa operadores compuestos con interfaces cuantizadas y subgrafos de descomposición en coma flotante para ejecución de fallback.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Inferencia en dispositivo con aceleración NPU mediante compilación de los artefactos `.tflite`.
- Tres variantes con distinto compromiso precisión/velocidad: FP32 de referencia, A16W8 (equilibrio observado) y A8W8 mixta (para dispositivos limitados a acumulación entera de 32 bits).
- Preprocesamiento de imagen externo obligatorio (configuración PIL incluida en `preprocessor_config.json`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye visión generativa ni detección/segmentación: únicamente clasificación.

## Casos de uso

- Clasificación de imágenes en móviles: compilando `model_a16w8.tflite` para la NPU del dispositivo se obtiene inferencia local de bajo consumo, adecuada para etiquetado automático de fotos en la galería sin enviar datos a la nube.
- Moderación de contenido visual en el borde: clasificación previa de imágenes en aplicaciones de mensajería para filtrar categorías sensibles antes de subirlas a un servicio central.
- Etiquetado en cámaras inteligentes: clasificación en tiempo real de escenas en dispositivos con NPU, usando la variante FP32 como referencia de validación y A16W8 en producción.
- Filtrado y organización de datasets: clasificación masiva de imágenes con ImageNet-1k para triaje previo de corpus de entrenamiento, ejecutando sobre CPU o NPU con llama.cpp-equivalentes de LiteRT.
- Prototipado de pipelines de visión en edge: uso de `run_image.py` y `requirements.txt` para validar el preprocesamiento y las interfaces tensoriales antes de integrar en una aplicación Android o Linux embebido.
- Benchmark de compiladores de NPU: los tres artefactos permiten comparar precisión y velocidad entre backends (acumulador de 32 bits frente a 64 bits) y verificar el soporte de cuantización INT16 en el importador GPU/IR de LiteRT.

## Benchmarks y rendimiento

La model card incluye resultados de precisión sobre un subconjunto de 5.000 imágenes de validación de ImageNet-1k (cinco por clase, semilla `20261031`, excluyendo las 500 de calibración y 100 de diagnóstico). El checkpoint original en PyTorch FP32 alcanza **79,68 % top-1** y **95,40 % top-5** con TF32 y autocast desactivados. La tabla de resultados TFLite por dispositivo aparece truncada en la información disponible (solo se muestra el encabezado `SM-S937U1` top-1), por lo que no se pueden reproducir los valores por variante.

| Modelo | Top-1 (%) | Top-5 (%) | Notas |
|---|---|---|---|
| PyTorch FP32 (referencia) | 79,68 | 95,40 | TF32 y autocast desactivados |
| TFLite FP32 | no disponible | no disponible | FP16 permitido por el compilador NPU |
| TFLite A16W8 | no disponible | no disponible | Mejor equilibrio observado en NPU probadas |
| TFLite A8W8 mixta | no disponible | no disponible | Compromiso de precisión sustancial según el autor |

## Requisitos de hardware

- VRAM/RAM estimada: el repo ocupa 1,1 GB; los `.tflite` individuales son de menor tamaño (no se detalla por archivo). La inferencia requiere memoria del orden de cientos de MB según variante.
- GPU recomendadas: no aplica para el objetivo principal; el modelo está pensado para NPU de dispositivos móviles y embebidos. El importador GPU IR de LiteRT probado no soporta la cuantización INT16 de A16W8.
- GPU de consumo: la variante FP32 puede ejecutarse en CPU o GPU de consumo mediante el runtime LiteRT/TFLite, pero sin las ventajas de la compilación NPU.
- Opciones de despliegue: runtime LiteRT/TFLite con compilación AOT para NPU del dispositivo; ejemplo de CPU incluido en `run_image.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imágenes).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del compilador NPU y del dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/vit-base-patch16-224 | ~86 M | 224x224 | TFLite (FP32/A16W8/A8W8) | Apache 2.0 | Cuantización post-entrenamiento para NPU |
| google/vit-base-patch16-224 | ~86 M | 224x224 | PyTorch/safetensors | Apache 2.0 | Checkpoint original, sin cuantizar |
| Otros ViT-Base LiteRT/TFLite de la comunidad | no disponible | 224x224 | TFLite | no disponible | No se dispone de datos comparativos en la información |

No se dispone de resultados de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo clasifica 1.000 clases de ImageNet-1k; no es un modelo generalista ni generativo.
- La variante A8W8 mixta presenta un compromiso de precisión sustancial según el autor; no debe usarse en producción sin validar el soporte del backend.
- A16W8 puede ser lenta en fallback a CPU y el importador GPU IR de LiteRT probado no soporta su cuantización INT16.
- Los `.tflite` son artefactos fuente portables: no contienen programas NPU compilados específicos del dispositivo; requieren compilación AOT en el destino.
- El patch embedding y las interfaces públicas permanecen en coma flotante, por lo que no hay aritmética entera de extremo a extremo.
- La receta de cuantización no garantiza escalas ni archivos idénticos: la lista exacta de imágenes de calibración no se distribuye.
- Riesgo de sesgo heredado de ImageNet-21k/1k y de alucinación de clases en imágenes fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución.
- No hay datos de benchmarks completos por variante ni por dispositivo en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/vit-base-patch16-224
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Paper ViT: https://arxiv.org/abs/2010.11929
- Guía de cuantización estática de TorchAO: https://docs.pytorch.org/ao/stable/eager_tutorials/static_quantization.html
