# fastforks/swin

## Resumen

Swin Transformer es una arquitectura de visión por computador presentada por Liu et al. en 2021 que introduce atención de ventana desplazada (shifted-window attention) dentro de una jerarquía de cuatro etapas. A diferencia de los Vision Transformers clásicos, que aplican atención global a todos los parches, Swin restringe la atención a ventanas locales y desplaza esas ventanas entre capas para permitir el intercambio de información entre regiones vecinas, lo que reduce el coste computacional de forma cuadrática a lineal respecto al tamaño de la imagen.

El repositorio `fastforks/swin` no contiene pesos propios: es una model card de integración que permite cargar los pesos oficiales publicados por el equipo de `timm` (variante `swin_base_patch4_window7_224.ms_in22k_ft_in1k`) a través de la librería `fastforks`. Esta librería verifica la integridad de los pesos mediante SHA-256 y ofrece dos backends de ejecución: `portable` (PyTorch puro) y `kernels` (kernels CUDA propios), con una mejora de velocidad documentada de hasta 6,1x frente al código original en fp32.

La relevancia actual del paquete reside en su enfoque de empaquetado reproducible: fija el commit del código original, publica hashes de verificación y mide latencia y memoria de forma explícita sobre hardware concreto (RTX 5060 Ti 16 GB, sm_120). El modelo en sí es un clasificador de imágenes ImageNet-1k, no un modelo generativo, por lo que sus capacidades se limitan a clasificación de imagen única.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Swin Transformer (transformer jerárquico con atención de ventana desplazada, 4 etapas) |
| Parámetros totales | no disponible (la variante es `swin_base`, sin cifra explícita en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 224x224) |
| Tipos de cuantización | fp32, fp16 (el backend `portable` usa fp16 por defecto en GPU) |
| Idiomas soportados | no aplica (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos); código original Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Swin Transformer organiza la imagen en parches y procesa la representación en cuatro etapas con resolución espacial decreciente y número de canales creciente. La innovación central es la atención de ventana desplazada: cada bloque aplica self-attention dentro de ventanas locales no solapadas, y en el bloque siguiente las ventanas se desplazan, lo que conecta regiones adyacentes sin incurrir en el coste cuadrático de la atención global. La variante empaquetada, `swin_base_patch4_window7_224.ms_in22k_ft_in1k`, usa parches de 4x4, ventanas de 7x7 y resolución de entrada de 224x224.

El entrenamiento documentado corresponde a un preentrenamiento en ImageNet-21k / ImageNet-22k (release completa de ImageNet, otoño de 2011) seguido de fine-tuning en ImageNet-1k (ILSVRC 2012). No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO, algo por otra parte esperable en un clasificador supervisado.

El paquete `fastforks` añade una capa de ingeniería sobre el modelo original: verificación de pesos por SHA-256 contra el commit fijado `0df212b369a5` de `pytorch-image-models`, paridad numérica comprobada frente a las salidas doradas del código original (máximo |diff| ≤ 0.002 en CPU fp32; media |diff| ≤ 0.02 px y p99 ≤ 0.08 px en GPU fp16) y kernels CUDA propios (`cudnn_hacc`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`) que aceleran la inferencia.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k, devolviendo logits y top-k.
- Entrada de imagen RGB única con preprocesado fijo: redimensionado de lado corto a 248 y recorte central a 224x224.
- Salida de logits y utilidades para obtener las top-5 clases directamente.
- Dos backends de ejecución: `portable` (PyTorch, GPU o CPU) y `kernels` (kernels CUDA propios con selección automática vía `mode="auto"`).
- Selección automática de dispositivo: GPU si está disponible, CPU en caso contrario.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión generativa: es un clasificador discriminativo, no un modelo imagen-texto.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes en categorías ImageNet para filtrar contenido no deseado antes de un pipeline de revisión humana, aprovechando la latencia de 2,5 ms por imagen con el backend `kernels`.
- Etiquetado automático de catálogos: preetiquetar grandes volúmenes de imágenes de producto con las 1.000 clases de ImageNet como primer paso de un sistema de anotación, dado el bajo coste por inferencia.
- Extracción de features para búsqueda visual: usar las representaciones intermedias del backbone Swin como extractor para sistemas de similitud o recuperación de imágenes, ya que la arquitectura jerárquica produce mapas multiescala.
- Preprocesado en pipelines de visión: servir como clasificador rápido de primer nivel que descarte o enrute imágenes antes de modelos más costosos, gracias a los 218 MiB de memoria pico en modo `portable`.
- Investigación en eficiencia de inferencia: comparar backends `portable` y `kernels` sobre hardware concreto para estudiar el impacto de kernels CUDA especializados en modelos transformer de visión.
- Validación de integridad de pesos en entornos regulados: el paquete verifica SHA-256 contra el commit fijado, lo que permite auditar que los pesos desplegados coinciden con los publicados por el autor original.
- Prototipado rápido en CPU: con 0,03 s de primera llamada en modo `portable`, permite validar pipelines de clasificación sin GPU dedicada.

## Benchmarks y rendimiento

Los datos disponibles son de latencia y memoria, no de precisión (no se publican cifras de top-1/top-5 accuracy en la información proporcionada).

Clasificación sintética, 224x224, RTX 5060 Ti 16 GB (sm_120):

| Métrica | Original fp32 | Original (fp16) | Portable | Kernels |
|---|---|---|---|---|
| Tiempo (ms) | 14,96 | 19,08 | 10,76 | 2,45 |
| Aceleración vs original fp32 | — | — | — | 6,1x |
| Aceleración vs portable | — | — | — | 4,4x |
| Memoria pico asignada (MiB) | 538 | — | 213 | 248 |
| Memoria pico reservada (MiB) | 550 | — | 394 | 474 |

Arranque y primera llamada:

| Métrica | Original | Portable | Kernels |
|---|---|---|---|
| Carga (s) | 2,71 | 0,94 | 0,59 |
| Primera llamada (s) | 0,41 | 0,03 | 0,01 |

Paridad numérica con el código original: máximo |diff| ≤ 0,002 en CPU fp32; media |diff| ≤ 0,02 px y p99 ≤ 0,08 px en GPU fp16.

## Requisitos de hardware

- VRAM estimada: 213 MiB asignados / 394 MiB reservados en modo `portable`; 248 MiB asignados / 474 MiB reservados en modo `kernels`, para entrada 224x224 en fp16.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para el backend `portable`; el backend `kernels` requiere una arquitectura con kernel precompilado (probado en sm_120, RTX 5060 Ti 16 GB) y drivers NVIDIA recientes.
- Cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.), dado el reducido consumo de memoria.
- Opciones de despliegue: librería `fastforks` (`pip install fastforks`) con backends `portable` y `kernels`; el código original es compatible con `timm` y `pytorch-image-models`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput: 10,76 ms por imagen en `portable` y 2,45 ms en `kernels` (fp16, RTX 5060 Ti); primera llamada de 0,03 s y 0,01 s respectivamente. El throughput no se publica de forma explícita, pero a 2,45 ms/imagen el límite teórico ronda las 408 imágenes por segundo en esa GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swin Base (esta ficha, vía fastforks) | Swin Transformer jerárquico | no disponible (base) | 224x224 fija | MIT (pesos) / Apache-2.0 (código) | Hugging Face (timm) + fastforks |
| ViT Base (referencia genérica) | Vision Transformer plano | ~86M (típico en ViT-B) | 224x224 | variable según checkpoint | Hugging Face (timm) |
| ConvNeXt Base (referencia genérica) | CNN moderna | ~89M (típico en ConvNeXt-B) | 224x224 | variable según checkpoint | Hugging Face (timm) |

No se dispone en la información proporcionada de cifras de precisión comparadas con estas alternativas, por lo que la comparación se limita a arquitectura, licencia y disponibilidad. Los datos de parámetros de ViT-B y ConvNeXt-B son valores de referencia de la literatura y no proceden de la información del repositorio.

## Limitaciones y advertencias

- El repositorio no aloja pesos: depende de enlaces externos a `timm` y de la disponibilidad de esos ficheros; si el autor original los retira, la carga falla.
- El backend `kernels` requiere un kernel precompilado para la arquitectura GPU concreta; si no existe, lanza `BackendUnavailableError` y no hace fallback silencioso a `portable`.
- Entrada fija de 224x224: no admite resoluciones arbitrarias sin reentrenamiento o adaptación, lo que limita su uso en imágenes de alta resolución o dominios con relaciones de aspecto muy distintas.
- Clasificador restringido a las 1.000 clases de ImageNet-1k; no cubre categorías fuera de ese vocabulario ni tareas de detección, segmentación o captioning.
- Riesgo de error en clases visualmente similares y de sesgo heredado de ImageNet-21k/1k (desbalance de clases, sesgos geográficos y culturales del dataset original).
- No es un modelo generativo: no hay riesgo de alucinación textual, pero sí de clasificaciones erróneas con alta confianza en dominios fuera de distribución.
- Licencia MIT para los pesos y Apache-2.0 para el código original, lo que permite uso comercial; aun así, la model card advierte que es un paquete de investigación y recomienda revisar las cadenas de licencia antes de otros usos.
- Las cifras de rendimiento están medidas en una única GPU (RTX 5060 Ti 16 GB, sm_120) y pueden no extrapolarse a otros hardware o versiones de driver.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/swin
- Pesos originales (timm): https://huggingface.co/timm/swin_base_patch4_window7_224.ms_in22k_ft_in1k
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de la variante (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/swin/card.toml
- Evidencia de licencia del autor: https://huggingface.co/timm/swin_base_patch4_window7_224.ms_in22k_ft_in1k/blob/a6a1eb2321b4f556fa0fa243fb777d47679f13c9/README.md
