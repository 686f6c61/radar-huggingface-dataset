# fastforks/deit

## Resumen

DeiT (Data-efficient Image Transformer) es un modelo de clasificación de imágenes publicado originalmente por Touvron et al. en 2021. Este repositorio, `fastforks/deit`, no contiene pesos propios: es una model card que actúa como manifiesto de un paquete de inferencia alternativo denominado fastforks, que descarga los pesos originales de `timm/deit_base_patch16_224.fb_in1k` desde HuggingFace y los verifica contra un hash SHA-256 registrado. El modelo subyacente es un Vision Transformer (ViT) de tipo base con parches de 16x16 y resolución fija de 224x224, entrenado únicamente sobre ImageNet-1k.

La relevancia de esta ficha no está en el modelo en sí, que es un clásico consolidado desde 2021, sino en la propuesta de fastforks: una implementación de inferencia con dos backends (`portable` en PyTorch y `kernels` con kernels CUDA propios) que, según la model card, reduce el tiempo de inferencia de 6,39 ms (fp32 original) a 2,98 ms (portable) y 1,79 ms (kernels) en una RTX 5060 Ti. El objetivo declarado es la paridad numérica con el código original de `pytorch-image-models` fijado en el commit `0df212b369a5`.

El modelo devuelve logits sobre las 1.000 clases de ImageNet-1k y está pensado exclusivamente para clasificación de imagen única. La licencia Apache-2.0 de los pesos permite uso comercial, aunque la model card advierte que el paquete fastforks es de uso de investigación y debe revisarse antes de otros usos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base, parches 16x16, resolución fija 224x224 |
| Parámetros totales | no disponible (el modelo de referencia DeiT-base tiene ~86 M, pero no se confirma en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija 224x224) |
| Tipos de cuantización | no disponible (la model card cita ejecución en fp16 y fp32; no se documentan cuantizaciones enteras) |
| Idiomas soportados | no aplica (clasificación de imágenes; sin capacidades lingüísticas) |
| Licencia | Apache-2.0 (pesos y código original); paquete fastforks marcado como research-use |
| Formato de pesos | safetensors (pesos alojados en `timm/deit_base_patch16_224.fb_in1k`) |

## Arquitectura y entrenamiento

El modelo subyacente es un Vision Transformer de tipo DeiT-base con patch embedding de 16x16 sobre imágenes de 224x224 píxeles. DeiT se caracteriza por su estrategia de destilación (de ahí "data-efficient"): se entrena sobre ImageNet-1k sin preentrenamiento masivo externo, usando un modelo profesor convolucional para guiar el aprendizaje y compensar la falta de datos a gran escala. La información proporcionada no detalla el número exacto de tokens de entrenamiento, la composición del dataset más allá de ImageNet-1k (ILSVRC 2012) ni si hubo fases de ajuste fino adicionales.

La aportación técnica de este repositorio no está en el entrenamiento, sino en la implementación de inferencia. fastforks ofrece dos backends: `portable`, una implementación en PyTorch que ejecuta en GPU (fp16 por defecto) o CPU, y `kernels`, que utiliza kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) descargados desde `fastforks/kernels` en el primer uso. El backend `kernels` exige una arquitectura de GPU precompilada y un driver NVIDIA reciente; si no hay kernel disponible lanza `BackendUnavailableError` sin fallback silencioso. La paridad numérica se verifica contra salidas doradas del código original: en CPU float32 la diferencia máxima es <= 0,002, y en GPU float16 la diferencia media es <= 0,02 px con p99 <= 0,08 px.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, devolviendo logits por clase.
- Entrada de una única imagen RGB redimensionada (lado corto 248) y recortada al centro a 224x224.
- Salida de top-k clases mediante el método `result.top(k)`.
- Ejecución en GPU (CUDA, fp16 por defecto) o CPU según disponibilidad.
- Dos backends intercambiables: `portable` (PyTorch) y `kernels` (kernels CUDA optimizados).
- Modo `auto` que selecciona `kernels` cuando puede ejecutarse y registra la elección.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión generativa, audio ni capacidades multilingües.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes en categorías de ImageNet para filtrar contenido no deseado en plataformas; la latencia de 1,8-2,9 ms por imagen permite procesar lotes grandes en tiempo real.
- Etiquetado automático de catálogos de producto: usar los logits de las 1.000 clases como señal débil para preetiquetar imágenes y reducir el trabajo manual de anotación en pipelines de datos.
- Preprocesamiento en sistemas de visión mayores: emplear el modelo como extractor de características o clasificador de primera etapa antes de un modelo más pesado, aprovechando su bajo consumo de memoria (203-300 MiB asignados en el backend portable/kernels).
- Benchmarking de infraestructura de inferencia: servir como carga de referencia reproducible para medir latencia y memoria de GPUs o de frameworks alternativos, dado que la model card publica tiempos y picos de memoria detallados.
- Investigación en eficiencia de kernels: comparar el backend `portable` frente a `kernels` para evaluar el impacto de kernels CUDA especializados en un transformer de visión estándar.
- Clasificación en dispositivos con GPU consumer: desplegar en una RTX 5060 Ti u otras GPU de gama media para tareas de clasificación de bajo coste, ya que el modelo cabe holgadamente en 16 GB y opera en fp16.
- Validación de pipelines de datos de imagen: comprobar que las transformaciones de redimensionado y recorte producen entradas coherentes comparando los logits con salidas doradas del código original.

## Benchmarks y rendimiento

La model card proporciona datos de velocidad y memoria, no de precisión sobre ImageNet más allá de la paridad numérica con el código original.

Clasificación sintética a 224x224 en RTX 5060 Ti 16 GB (sm_120):

| Modelo | Tiempo original fp32 (ms) | Original (ms) | Portable (ms) | Kernels (ms) | Aceleración kernels vs original | vs portable |
|---|---|---|---|---|---|---|
| `deit_base_patch16_224.fb_in1k` | 6,39 | 5,46 | 2,98 | 1,79 | 3,1x | 1,7x |

Memoria pico (MiB, asignada / reservada):

| Modelo | Original | Portable | Kernels |
|---|---|---|---|
| `deit_base_patch16_224.fb_in1k` | 531 / 548 | 203 / 386 | 300 / 454 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `deit_base_patch16_224.fb_in1k` | 2,52 | 0,72 | 0,48 | 0,31 | 0,00 | 0,00 |

No se han publicado resultados de benchmarks de precisión (top-1, top-5 en ImageNet) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 203 MiB asignados / 386 MiB reservados en backend `portable`; 300 MiB asignados / 454 MiB reservados en backend `kernels` (medido en RTX 5060 Ti 16 GB, fp16).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA reciente; el backend `kernels` requiere un kernel precompilado para la arquitectura concreta (sm_120 en las pruebas) y un driver NVIDIA reciente.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, 4060, 4090, etc.) e incluso en GPUs con 4 GB o menos.
- Ejecución en CPU: soportada por el backend `portable` en float32, con paridad numérica verificada (max |diff| <= 0,002).
- Opciones de despliegue: paquete `fastforks` (`pip install fastforks`) con API `classification.load(...)`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen de este tipo).
- Latencia: 1,79 ms por imagen en backend `kernels` y 2,98 ms en `portable` sobre RTX 5060 Ti; 5,46 ms con el código original en la misma precisión y 6,39 ms en fp32.
- Arranque: 0,48 s (kernels), 0,72 s (portable), 2,52 s (original); primera llamada prácticamente instantánea en portable y kernels (0,00 s).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/deit` (DeiT-base) | ViT base, patch 16 | no disponible en la ficha | 224x224 | Apache-2.0 | Pesos en `timm/deit_base_patch16_224.fb_in1k`; inferencia vía fastforks |
| `timm/deit_base_patch16_224.fb_in1k` | ViT base, patch 16 | no disponible en la ficha | 224x224 | Apache-2.0 | Pesos safetensors en HuggingFace; código en pytorch-image-models |
| Otros clasificadores ImageNet-1k (ResNet, EfficientNet, Swin) | CNN / transformer | no disponible | variable | variable | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; la única referencia directa es el propio código original de `pytorch-image-models`, frente al cual fastforks reporta aceleraciones de 1,7x a 3,1x en la GPU probada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es una model card que apunta a pesos de terceros; la disponibilidad depende de `timm/deit_base_patch16_224.fb_in1k`.
- Modelo limitado a clasificación de imágenes en 1.000 clases de ImageNet-1k; no genera texto, no razona, no soporta tool calling ni agentes.
- Entrada fija de 224x224 con redimensionado (lado corto 248) y recorte central; imágenes con relaciones de aspecto extremas o detalles finos pueden perder información.
- Riesgo de sesgo heredado de ImageNet-1k: las 1.000 clases y su distribución no representan de forma equilibrada todas las culturas, objetos o contextos; puede haber sesgos de etiquetado y de representación.
- Riesgo de clasificación errónea o de confianza mal calibrada fuera de la distribución de ImageNet; los logits no deben interpretarse como probabilidades calibradas sin postprocesado.
- El paquete fastforks se describe como "research-use package"; la model card recomienda revisar las cadenas de licencia antes de cualquier otro uso, aunque los pesos son Apache-2.0 y la columna de uso comercial indica "yes".
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU y un driver NVIDIA reciente; si no está disponible lanza `BackendUnavailableError` y no hace fallback silencioso, lo que puede romper despliegues en hardware no cubierto.
- Los benchmarks de velocidad se midieron en una única GPU (RTX 5060 Ti 16 GB, sm_120) y con entradas sintéticas; el rendimiento en otros hardware puede diferir.
- No se documentan métricas de precisión (top-1/top-5) en la información disponible, solo paridad numérica con el código original.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/fastforks/deit
- Pesos originales (timm): https://huggingface.co/timm/deit_base_patch16_224.fb_in1k
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend fastforks: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit 0df212b369a5): https://github.com/huggingface/pytorch-image-models
- Documentación de benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero de definición de la variante (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/deit/card.toml
- Evidencia de licencia (README de timm): https://huggingface.co/timm/deit_base_patch16_224.fb_in1k/blob/b78cc5532a69df6bcad9c3a8d76653fd20b31ac6/README.md
