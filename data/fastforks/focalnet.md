# fastforks/focalnet

## Resumen

FocalNet es una familia de clasificadores de imagen jerárquicos presentados por Yang et al. en 2022 que sustituyen la autoatención de los transformers por "modulación focal": pilas de convoluciones depthwise con agregación condicionada por compuertas. Este repositorio concreto, `fastforks/focalnet`, no contiene pesos: es una model card de integración para la librería `fastforks`, que descarga los pesos originales de los repos de `timm` y los verifica mediante SHA-256.

El modelo resuelve clasificación de imágenes sobre ImageNet-1k (ILSVRC 2012), devolviendo logits sobre las 1000 clases. Se publican seis variantes: base, small y tiny, cada una en configuración `lrf` (focal modulation con niveles de enfoque largos) y `srf` (enfoques cortos). Todas operan a una resolución fija de 224x224.

Su relevancia es doble: por un lado, FocalNet es una alternativa eficiente a ViT y Swin en visión, con menor coste de memoria que la atención global; por otro, este repo ejemplifica un patrón de empaquetado reproducible (verificación de hashes, backend portable y kernels) para modelos de terceros en el ecosistema `fastforks`. La licencia MIT de los pesos permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FocalNet (jerárquica, modulación focal con convoluciones depthwise y agregación con compuertas; sin autoatención) |
| Parametros totales | no disponible (variantes base, small y tiny; cifras concretas no publicadas en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión; entrada fija de 224x224 píxeles) |
| Tipos de cuantizacion | fp32 y fp16 documentados en las pruebas; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | MIT (pesos y código original Apache-2.0) |
| Formato de pesos | safetensors (alojados en los repos de `timm`, no en este repo) |

Variantes publicadas:

| Variante | Pesos (SHA-256, 12 hex) | Licencia de pesos | Uso comercial |
|---|---|---|---|
| `focalnet_base_lrf.ms_in1k@1` | `e1c36016eaef` | MIT | sí |
| `focalnet_base_srf.ms_in1k@1` | `05a7ff7cda7e` | MIT | sí |
| `focalnet_small_lrf.ms_in1k@1` | `c7d963802b47` | MIT | sí |
| `focalnet_small_srf.ms_in1k@1` | `2590faabe2cd` | MIT | sí |
| `focalnet_tiny_lrf.ms_in1k@1` | `f5f73a0b0430` | MIT | sí |
| `focalnet_tiny_srf.ms_in1k@1` | `fc5ae22ca975` | MIT | sí |

## Arquitectura y entrenamiento

FocalNet es un transformer jerárquico de visión en el que el bloque de autoatención se reemplaza por un bloque de modulación focal. Cada bloque aplica una pila de convoluciones depthwise sobre el mapa de características para agregar contexto local, y después combina esa información mediante compuertas que modulan la representación de cada posición. El resultado conserva la capacidad de modelar dependencias espaciales con un coste computacional lineal en el número de tokens, en lugar del coste cuadrático de la atención global. La jerarquía multiescala sigue el patrón de Swin: mapas de resolución decreciente con canales crecientes.

Los pesos incluidos corresponden al preentrenamiento y ajuste fino sobre ImageNet-1k (ILSVRC 2012), con resolución de entrada fija de 224x224 (redimensionado del lado corto a 248 y recorte central). Las variantes `lrf` y `srf` difieren en la configuración de los niveles de enfoque de la modulación focal (largo y corto respectivamente). No se dispone en la información proporcionada de detalles sobre número de tokens de entrenamiento, composición exacta del dataset más allá de ImageNet-1k, ni sobre si se aplicaron técnicas de regularización adicionales, RLHF o DPO (no aplicables en un clasificador de imagen).

La innovación técnica destacable es la propia modulación focal, que sustituye la atención por convoluciones depthwise apiladas con agregación condicionada, reduciendo el coste de memoria y cómputo. En el plano del empaquetado, `fastforks` añade verificación criptográfica de pesos (SHA-256), un backend "portable" y kernels opcionales para el backend `kernels`.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, con salida de logits.
- Entrada de una única imagen RGB a resolución fija de 224x224 (redimensionado de lado corto a 248 y recorte central).
- Extracción de características jerárquicas multiescala, aprovechable como backbone para tareas posteriores (detección, segmentación) aunque no se documenta en esta card.
- Inferencia en fp32 y fp16; el backend portable reduce el uso de memoria frente a la implementación original.
- Compatibilidad con `torch.compile` y exportación a ONNX/TensorRT (fp16) según las pruebas del autor.
- Soporte de backend `portable` y kernels opcionales; el backend `kernels` aparece sin datos de rendimiento en las tablas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen puro.

## Casos de uso

- Moderación de contenido visual: clasificar imágenes entrantes en categorías ImageNet para filtrar contenido no deseado en plataformas, usando la variante tiny por su bajo coste (7,36 ms por imagen en portable).
- Etiquetado automático de catálogos de producto: predecir la clase dominante de cada foto para poblar metadatos y mejorar la búsqueda; la variante base ofrece mayor capacidad a 14-15 ms por imagen.
- Preprocesado en pipelines de datos de visión: clasificación rápida a gran escala para filtrar o particionar datasets antes de entrenar modelos mayores, con throughput alto gracias al bajo uso de memoria (95-212 MiB asignados en portable).
- Backbone para transfer learning: extraer características jerárquicas y ajustar una cabeza ligera para tareas específicas de dominio (detección de defectos, clasificación médica), partiendo de pesos ImageNet con licencia MIT.
- Clasificación en el borde o en GPUs de consumo: las variantes tiny y small caben en GPUs modestas y en fp16 con muy poca memoria, lo que permite despliegue en estaciones de trabajo o dispositivos con acelerador.
- Servicio de inferencia de baja latencia: con TensorRT fp16 la variante base baja a 1,74-2,08 ms por imagen, adecuado para APIs de clasificación en tiempo real.
- Validación de pipelines de despliegue: el repo sirve como referencia reproducible (hashes verificados) para probar backends portable, compile y TensorRT antes de adoptar FocalNet en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1, top-5) en la información disponible. Sí se documentan métricas de latencia y memoria medidas por el autor en una RTX 5060 Ti de 16 GB:

| Modelo | Entrada | Tiempo original fp32 (ms) | Portable (ms) | torch.compile (ms) | TensorRT fp16 (ms) | Memoria pico portable (MiB) |
|---|---|---|---|---|---|---|
| `focalnet_base_lrf.ms_in1k` | 224x224 | 18,0 | 15,5 | 7,47 | 2,08 | 212 / 234 |
| `focalnet_base_srf.ms_in1k` | 224x224 | 17,1 | 14,2 | 6,94 | 1,74 | 211 / 234 |
| `focalnet_small_lrf.ms_in1k` | 224x224 | 16,8 | 15,8 | no disponible | no disponible | 136 / 152 |
| `focalnet_small_srf.ms_in1k` | 224x224 | 15,9 | 14,0 | no disponible | no disponible | 136 / 152 |
| `focalnet_tiny_lrf.ms_in1k` | 224x224 | 8,92 | 8,07 | no disponible | no disponible | 95 / 118 |
| `focalnet_tiny_srf.ms_in1k` | 224x224 | 8,39 | 7,36 | no disponible | no disponible | 95 / 118 |

Tiempos de carga y primera llamada (segundos):

| Modelo | Carga original | Carga portable | Primera llamada original | Primera llamada portable |
|---|---|---|---|---|
| `focalnet_base_lrf.ms_in1k` | 0,91 | 1,89 | 0,03 | 0,62 |
| `focalnet_base_srf.ms_in1k` | 0,89 | 1,92 | 0,05 | 0,49 |
| `focalnet_small_lrf.ms_in1k` | 0,54 | 1,86 | 0,03 | 0,69 |
| `focalnet_small_srf.ms_in1k` | 0,54 | 1,73 | 0,02 | 0,49 |
| `focalnet_tiny_lrf.ms_in1k` | 0,36 | 2,56 | 0,15 | 0,77 |
| `focalnet_tiny_srf.ms_in1k` | 0,40 | 1,49 | 0,45 | 0,49 |

Preparación de `torch.compile` y TensorRT (solo base): compilación en frío de 17,8-19,7 s; construcción de ONNX y engine de 63,8-63,9 s; memoria pico con TensorRT de 404-432 MiB (engine más torch).

## Requisitos de hardware

- VRAM estimada: 0,1 GiB asignados para tiny y small, 0,2 GiB para base en backend portable a fp16 (224x224). Con TensorRT fp16, la variante base requiere unos 404-432 MiB incluyendo engine y runtime de torch.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 1 GB de VRAM; las pruebas se realizaron en una RTX 5060 Ti de 16 GB. Para TensorRT, se recomienda una GPU Ampere o superior.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090, etc.), incluso en fp32.
- Opciones de despliegue: backend portable de `fastforks`, `torch.compile`, exportación a ONNX y TensorRT fp16. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen).
- Latencia y throughput: 7,36-15,8 ms por imagen en portable; 1,74-2,08 ms con TensorRT fp16 en la variante base. El throughput no se publica explícitamente, pero a 2 ms por imagen el límite superior teórico ronda las 500 imágenes por segundo en una sola GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de precisión ni de especificaciones de modelos comparables (por ejemplo, Swin Transformer o ViT) para establecer una comparación cuantitativa fiable. La siguiente tabla recoge únicamente los datos disponibles de las variantes de FocalNet:

| Modelo | Parámetros | Contexto/entrada | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|
| FocalNet base (lrf/srf) | no disponible | 224x224 | MIT | sí | pesos en `timm` |
| FocalNet small (lrf/srf) | no disponible | 224x224 | MIT | sí | pesos en `timm` |
| FocalNet tiny (lrf/srf) | no disponible | 224x224 | MIT | sí | pesos en `timm` |
| Swin Transformer | no disponible | no disponible | no disponible | no disponible | no disponible |
| ViT | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos: es solo una model card; la descarga y verificación de pesos depende de los enlaces a los repos de `timm` y de la integridad de los SHA-256.
- Modelo de clasificación de imagen exclusivamente; no genera texto, no razona, no soporta tool calling ni agentes.
- Entrada fija de 224x224: imágenes de otra resolución deben redimensionarse y recortarse, lo que puede perder detalle en objetos pequeños o alargados.
- Entrenado solo sobre ImageNet-1k: las 1000 clases pueden no cubrir dominios específicos (medicina, industria, satélite) y el rendimiento fuera de distribución no está documentado.
- Riesgo de sesgos heredados del dataset ImageNet-1k (desequilibrios de clase, sesgos culturales y geográficos en las anotaciones).
- No se publican métricas de precisión (top-1/top-5) en la información disponible, por lo que no es posible validar la calidad del modelo sin evaluarlo.
- El backend `kernels` aparece sin datos de rendimiento; su uso en producción no está validado en esta card.
- El backend portable tiene mayor tiempo de carga (1,49-2,56 s) y primera llamada (0,49-0,77 s) que la implementación original; tenerlo en cuenta en despliegues con arranque en frío.
- La licencia del código original es Apache-2.0 y los pesos MIT, pero la card advierte que las cadenas de licencia del código original se registran tal cual y deben revisarse antes de otros usos.
- No hay información sobre cuantizaciones más allá de fp32/fp16, ni sobre soporte de otros formatos de pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/focalnet
- Código de `fastforks`: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos `focalnet_base_lrf.ms_in1k`: https://huggingface.co/timm/focalnet_base_lrf.ms_in1k
- Pesos `focalnet_base_srf.ms_in1k`: https://huggingface.co/timm/focalnet_base_srf.ms_in1k
- Pesos `focalnet_small_lrf.ms_in1k`: https://huggingface.co/timm/focalnet_small_lrf.ms_in1k
- Pesos `focalnet_small_srf.ms_in1k`: https://huggingface.co/timm/focalnet_small_srf.ms_in1k
- Pesos `focalnet_tiny_lrf.ms_in1k`: https://huggingface.co/timm/focalnet_tiny_lrf.ms_in1k
- Pesos `focalnet_tiny_srf.ms_in1k`: https://huggingface.co/timm/focalnet_tiny_srf.ms_in1k
- Evidencia de licencia (README de `timm`): https://huggingface.co/timm/focalnet_tiny_srf.ms_in1k/blob/de75c3a73e9ed84fee554a7138d4bac119751645/README.md
- Hashes completos (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/classification/models/focalnet/card.toml
