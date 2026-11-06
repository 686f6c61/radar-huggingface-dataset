# fastforks/mobilenetv1

## Resumen

MobileNetV1 es una arquitectura de red neuronal convolucional para clasificación de imágenes publicada originalmente por Howard et al. en 2017, dentro de Google. Su aportación principal son las convoluciones separables en profundidad (depthwise-separable convolutions), que reducen de forma drástica el coste computacional y el número de parámetros frente a convoluciones estándar, manteniendo una precisión razonable en ImageNet-1k. Está pensada para inferencia en dispositivos con recursos limitados: móviles, sistemas embebidos y GPUs de consumo.

El repositorio `fastforks/mobilenetv1` no contiene pesos propios: es una model card de integración. El paquete `fastforks` descarga los pesos del autor original (repositorio `timm/mobilenetv1_100.ra4_e3600_r224_in1k`) y los valida contra un SHA-256 registrado. La variante disponible es el checkpoint de `timm` con resolución de entrada fija de 224x224, entrenado sobre ImageNet-1k.

Su relevancia actual es de infraestructura más que de modelado: ofrece dos backends de ejecución (`portable` en PyTorch y `kernels` con kernels CUDA propios) con paridad numérica verificada frente al código original, y publica mediciones de latencia y memoria en una RTX 5060 Ti. Para quien necesite un clasificador de imágenes ligero y reproducible, es una vía de despliegue con verificación de integridad de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN con convoluciones separables en profundidad (MobileNet V1, Howard et al. 2017) |
| Parámetros totales | no disponible (variante 1.0x, ancho 100 %) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen, entrada fija 224x224) |
| Tipos de cuantización | fp32 (original), fp16 (por defecto en portable y kernels); no se documentan otras |
| Idiomas soportados | no aplica (modelo de visión; etiquetas ImageNet-1k en inglés) |
| Licencia | Apache-2.0 (código y pesos de la variante) |
| Formato de pesos | safetensors (pesos alojados en `timm/mobilenetv1_100.ra4_e3600_r224_in1k`) |

## Arquitectura y entrenamiento

MobileNetV1 sustituye las convoluciones estándar por dos operaciones: una convolución depthwise (un filtro por canal) seguida de una convolución pointwise 1x1 que mezcla canales. Esta factorización reduce el coste de cómputo y el número de parámetros en un orden de magnitud aproximado respecto a una convolución densa equivalente, a cambio de una ligera pérdida de expresividad. La variante incluida es la de ancho 1.0 (100 %), con entrada fija de 224x224: la imagen se redimensiona con lado corto 256 y se recorta al centro.

El entrenamiento corresponde a ImageNet-1k (ILSVRC 2012, clasificación), según la model card. No se documentan en la información disponible detalles sobre número de tokens o épocas, composición exacta del dataset más allá de ImageNet-1k, ni uso de RLHF/DPO (no aplicable a un clasificador). La innovación relevante del repositorio no está en el modelo sino en el runtime: kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia, con verificación de paridad numérica frente al código original de `timm` en un commit fijado (CPU float32: max |diff| <= 0.002; GPU float16: mean |diff| <= 0.08 px y p99 <= 0.3 px).

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k; salida como logits (`result.top(5)` devuelve las cinco clases más probables).
- Entrada de una única imagen RGB a resolución fija 224x224 (redimensionado a lado corto 256 y recorte central).
- Ejecución en GPU (CUDA) con fp16 por defecto y en CPU como fallback, a través del backend `portable` en PyTorch.
- Backend `kernels` con kernels CUDA precompilados por arquitectura de GPU, descargados desde `fastforks/kernels` en el primer uso; requiere driver NVIDIA reciente y lanza `BackendUnavailableError` si no hay kernel para la arquitectura, sin fallback silencioso.
- Modo `auto` que selecciona `kernels` cuando puede ejecutarse y registra la elección.
- Verificación de integridad de pesos mediante SHA-256 (`15c2f1411deb…`) frente al fichero del autor.
- No soporta tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Moderación de contenido visual en pipelines de subida: clasificar imágenes entrantes en categorías ImageNet y filtrar clases sensibles antes de almacenarlas; el modelo cabe en 44 MiB de memoria asignada en modo portable, por lo que puede ejecutarse junto a otros servicios en la misma GPU.
- Etiquetado automático de catálogos de producto: preclasificar fotos de inventario en categorías amplias (animales, vehículos, objetos domésticos) para enrutarlas a revisores humanos o a clasificadores especializados de segunda etapa.
- Prefiltrado en sistemas de visión por computador: usar MobileNetV1 como extractor/clasificador rápido de primera etapa que descarte imágenes irrelevantes antes de invocar un modelo mayor, aprovechando los 0,4 ms por imagen del backend `kernels` en RTX 5060 Ti.
- Procesamiento en el borde o en portátiles con GPU de consumo: el modelo en fp16 ocupa decenas de MiB y se ejecuta en tiempo real, adecuado para aplicaciones de escritorio o robots con GPUs modestas.
- Servicio de clasificación de baja latencia en producción: con 1,8 ms por imagen en modo portable y 0,4 ms en modo kernels (entrada sintética 224x224), permite atender peticiones síncronas con un solo dispositivo.
- Reproducibilidad y auditoría de modelos: equipos que necesitan ejecutar un clasificador con pesos verificados por hash y paridad numérica frente a la implementación de referencia de `timm`, por ejemplo en entornos regulados o en validación de pipelines de ML.
- Benchmarking de hardware: como carga de referencia ligera para medir latencia y memoria de GPUs nuevas (el propio repositorio lo usa así en una RTX 5060 Ti, sm_120).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1/top-5 en ImageNet) en la información disponible. Los datos publicados son de latencia, memoria y paridad numérica:

| Métrica (224x224, sintético, RTX 5060 Ti 16 GB) | Original fp32 | Original (fp16) | Portable | Kernels |
|---|---|---|---|---|
| Tiempo por imagen (ms) | 2,19 | 2,96 | 1,77 | 0,43 |
| Aceleración vs original | — | — | — | 5,1x (vs original fp32), 4,1x (vs portable) |
| Memoria pico asignada / reservada (MiB) | 58 / 74 | — | 44 / 72 | 75 / 112 |
| Carga del modelo (s) | 1,34 | — | 0,06 | 0,09 |
| Primera llamada (s) | 1,50 | — | 0,01 | 0,00 |

Paridad con el código original: CPU float32, max |diff| <= 0,002; GPU float16, mean |diff| <= 0,08 px y p99 <= 0,3 px.

## Requisitos de hardware

- VRAM estimada: muy baja. Memoria pico asignada de 44 MiB (portable) y 75 MiB (kernels) a 224x224 en fp16; reservada de 72 y 112 MiB respectivamente. Cabe holgadamente en cualquier GPU con más de 1 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente para el backend `kernels` (probado en RTX 5060 Ti 16 GB, sm_120); el backend `portable` funciona también en CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna; el cuello de botella no es la memoria sino la disponibilidad de kernel precompilado para la arquitectura concreta.
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`) con modos `portable`, `kernels` y `auto`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador CNN de este tipo).
- Latencia y throughput: 1,8 ms por imagen en portable y 0,4 ms en kernels (entrada sintética 224x224, fp16); primera llamada de 0,01 s (portable) y 0,00 s (kernels) tras una carga de 0,06–0,09 s.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| MobileNetV1 (este repo) | CNN depthwise-separable | no disponible (ancho 1.0) | 224x224 fija | Apache-2.0 | Pesos de `timm`, runtime verificado por hash |
| MobileNetV2 | CNN con bloques residuales invertidos | no disponible en esta ficha | 224x224 | Apache-2.0 (según `timm`) | Mejora de precisión y eficiencia sobre V1; no evaluado aquí |
| MobileNetV3 | CNN con bloques híbridos y SE | no disponible en esta ficha | 224x224 | Apache-2.0 (según `timm`) | Incorpora búsqueda de arquitectura; no evaluado aquí |
| ResNet-50 | CNN residual | no disponible en esta ficha | 224x224 | Apache-2.0 (según `timm`) | Mayor precisión y mayor coste computacional; no evaluado aquí |

No se dispone de datos de precisión comparativa en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio no aloja pesos: la inferencia depende de la descarga desde `timm/mobilenetv1_100.ra4_e3600_r224_in1k` y de la verificación SHA-256; si el fichero remoto cambia, la carga fallará.
- Solo clasifica en las 1.000 clases de ImageNet-1k; no genera texto, no responde preguntas y no admite instrucciones.
- Entrada fija de 224x224: imágenes de otra relación de aspecto se redimensionan y recortan, lo que puede eliminar información relevante en objetos pequeños o en los bordes.
- Precisión limitada por la propia arquitectura: MobileNetV1 es un modelo de 2017 pensado para eficiencia, no para máxima exactitud; en dominios fuera de ImageNet (radiología, satélite, documento escaneado) el rendimiento puede degradarse sin fine-tuning.
- Riesgo de sesgo heredado de ImageNet-1k: las etiquetas y la distribución del dataset original condicionan las predicciones; no se documenta ninguna mitigación.
- El backend `kernels` exige un kernel precompilado para la arquitectura de GPU y un driver NVIDIA reciente; si no existe, lanza `BackendUnavailableError` sin fallback silencioso, lo que puede romper despliegues automatizados.
- La model card indica que los strings de licencia del código original se registran "tal cual" y que el paquete es de uso de investigación ("research-use package; check them before any other use"); conviene revisar la licencia antes de un uso comercial, aunque la variante figure como Apache-2.0 con uso comercial permitido.
- Sin datos publicados de precisión top-1/top-5 en la información disponible; no se puede validar la calidad del checkpoint más allá de la paridad numérica con el original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/mobilenetv1
- Pesos del autor (timm): https://huggingface.co/timm/mobilenetv1_100.ra4_e3600_r224_in1k
- Fichero de pesos: https://huggingface.co/timm/mobilenetv1_100.ra4_e3600_r224_in1k/resolve/6e88b523abded44469eafcd52f7832d5e0300b1b/model.safetensors
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Definición de variantes (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/mobilenetv1/card.toml
- Protocolo de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Código original (pytorch-image-models, commit 0df212b369a5): https://github.com/huggingface/pytorch-image-models
- Paper original (Howard et al. 2017): no disponible en la información proporcionada
