# Smashinfries/wd-swinv2-tagger-v3-onnx-mobile

## Resumen

El modelo `Smashinfries/wd-swinv2-tagger-v3-onnx-mobile` es una conversión a ONNX del modelo de etiquetado de imágenes `wd-swinv2-tagger-v3` desarrollado originalmente por SmilingWolf. Smashinfries ha realizado una cuantización a FP16 y UINT8, además de añadir capas de preprocesado y postprocesado para facilitar su integración en aplicaciones móviles, en particular la aplicación [WaifuTagger](https://github.com/KuzuLabz/WaifuTagger).

Este modelo resuelve el problema de etiquetado automático de imágenes con temática anime/ilustración, asignando etiquetas generales, de artista, de personaje, de copyright y de clasificación (rating) a una imagen de entrada. Es relevante porque permite ejecutar este tipo de modelos en dispositivos con recursos limitados, gracias a la cuantización INT8 y al formato ONNX, que es compatible con motores de inferencia optimizados para móviles como ONNX Runtime.

El modelo base utiliza la arquitectura SwinV2 Transformer, con un tamaño de aproximadamente 2.9 mil millones de parámetros, aunque el repositorio de este modelo cuantizado tiene un tamaño de 2.1 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinV2 Transformer (vision transformer jerárquico) |
| Parametros totales | no disponible (el modelo base wd-swinv2-tagger-v3 tiene ~2.9B, pero el tamaño del repo es 2.1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP16 y UINT8 (INT8) |
| Idiomas soportados | no disponible (las etiquetas son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con preprocesado y postprocesado integrados) |

## Arquitectura y entrenamiento

El modelo base `wd-swinv2-tagger-v3` fue desarrollado por SmilingWolf y utiliza la arquitectura SwinV2, un transformer de visión jerárquico que procesa la imagen en ventanas de atención desplazadas. Se entrenó sobre más de 7 millones de imágenes de Danbooru con etiquetas actualizadas hasta 2024-02-28, utilizando JAX y TPU del programa TRC de Google. El modelo alcanza una macro F1 de 0.4541 en el conjunto de pruebas.

La versión ONNX de Smashinfries mantiene la misma arquitectura pero añade un preprocesado (conversión de RGB a tensor normalizado) y un postprocesado (mapeo de IDs de etiqueta a nombres) integrados en el grafo ONNX, lo que simplifica su uso en aplicaciones móviles. Se proporcionan dos variantes: FP16 (mayor precisión) y UINT8 (menor tamaño y mayor velocidad). La cuantización UINT8 se realizó con un proceso de calibración que, según las pruebas del autor, mantiene una precisión casi idéntica a la versión original.

## Capacidades

- Etiquetado de imágenes con etiquetas generales, de artista, de copyright, de personaje, de meta y de clasificación (rating).
- Salida de probabilidades para cada etiqueta, permitiendo filtrar por umbral.
- Preprocesado y postprocesado integrados en el modelo ONNX, lo que permite pasar directamente un `Uint8Array` de RGB y obtener las etiquetas con sus probabilidades.
- Compatible con motores ONNX Runtime, incluyendo versiones móviles y de escritorio.
- La variante `mobile` incluye el mapeo de IDs a nombres de etiqueta en el propio modelo, simplificando la integración.
- Modelo optimizado para imágenes de anime/ilustración, con un vocabulario de etiquetas de Danbooru (actualizado hasta 2024).
- El archivo `tags.json` incluido proporciona el mapeo `id -> [label, category id, count]`, donde los IDs de categoría son: 0=general, 1=artist, 3=copyright, 4=character, 5=meta, 9=rating.

## Casos de uso

- **Aplicación móvil de etiquetado de imágenes**: la variante `mobile` está diseñada específicamente para la app WaifuTagger, permitiendo etiquetar imágenes de anime directamente en el dispositivo sin conexión a internet, gracias a la cuantización INT8 y el preprocesado integrado.

- **Organización de bibliotecas de imágenes**: los usuarios pueden etiquetar automáticamente sus colecciones de imágenes (por ejemplo, en Eagle o digiKam) para mejorar la búsqueda y la clasificación, usando el modelo para generar archivos `.txt` de etiquetas o metadatos.

- **Preparación de datasets de entrenamiento**: el modelo puede usarse para etiquetar automáticamente grandes conjuntos de imágenes antes de entrenar modelos generativos (como Stable Diffusion), reduciendo el trabajo manual y manteniendo un formato de etiquetas consistente.

- **Filtrado de contenido en repositorios de imágenes**: el modelo puede clasificar imágenes por rating (seguro, sensible, cuestionable, explícito) y por contenido (personajes, artistas), lo que facilita la moderación de comunidades o la creación de colecciones filtradas.

- **Generación de etiquetas para búsqueda inversa**: dado un lote de imágenes, el modelo produce etiquetas descriptivas que pueden usarse como consultas de búsqueda en bases de datos de imágenes, mejorando la recuperación de imágenes similares.

- **Integración en pipelines de automatización de arte**: en entornos de producción (por ejemplo, procesamiento de imágenes en lote), el modelo ONNX puede desplegarse en un servidor con ONNX Runtime o en un dispositivo móvil, etiquetando imágenes de forma rápida y determinista.

## Benchmarks y rendimiento

El autor del modelo proporciona una comparación de precisión entre la versión base (FP32) y la versión cuantizada (UINT8) sobre una imagen de prueba:

| Tag                    | Base (FP32)   | QUINT8   | Diferencia          |
|:-----------------------|:--------------|:---------|:--------------------|
| `1girl`                | 99.82%        | 99.78%   | -0.04% |
| `power_(chainsaw_man)` | 99.11%        | 99.28%   | +0.17% |
| `horns`                | 97.80%        | 97.71%   | -0.09% |
| `solo`                 | 96.87%        | 96.39%   | -0.48% |
| `necktie`              | 95.15%        | 95.09%   | -0.05% |
| `sharp_teeth`          | 94.20%        | 94.46%   | +0.26% |
| `long_hair`            | 94.03%        | 94.27%   | +0.24% |
| `red_horns`            | 93.92%        | 94.09%   | +0.17% |
| `teeth`                | 93.30%        | 93.54%   | +0.24% |
| `shirt`                | 92.20%        | 92.68%   | +0.48% |
| `cross-shaped_pupils`  | 90.46%        | 91.39%   | +0.94% |
| `general`              | 89.29%        | 90.99%   | +1.71% |
| `looking_at_viewer`    | 89.25%        | 89.17%   | -0.08% |
| `black_necktie`        | 89.04%        | 88.78%   | -0.26% |
| `white_shirt`          | 88.53%        | 88.56%   | +0.03% |
| `blonde_hair`          | 88.40%        | 88.30%   | -0.10% |
| `symbol-shaped_pupils` | 87.56%        | 88.46%   | +0.90% |
| `hair_between_eyes`    | 86.40%        | 87.21%   | +0.81% |
| `open_mouth`           | 85.92%        | 87.22%   | +1.30% |
| `collared_shirt`       | 83.45%        | 84.18%   | +0.73% |
| `simple_background`    | 79.63%        | 80.59%   | +0.96% |
| `jacket`               | 69.49%        | 71.54%   | +2.05% |
| `upper_body`           | 67.09%        | 68.09%   | +1.00% |
| `smile`                | 67.01%        | 68.01%   | +1.00% |
| `demon_horns`          | 65.34%        | 65.77%   | +0.43% |
| `claw_pose`            | 52.94%        | 51.80%   | -1.14% |
| `white_background`     | 49.70%        | 46.76%   | -2.94% |
| `orange_eyes`          | 44.63%        | 48.35%   | +3.72% |
| `black_jacket`         | 39.10%        | 42.97%   | +3.87% |
| `hand_up`              | 37.35%        | 38.86%   | +1.52% |

Se observa que la diferencia media es inferior a 2 puntos porcentuales, con algunos tags mejorando ligeramente en la versión cuantizada. No se han publicado benchmarks adicionales (MMLU, etc.) porque se trata de un modelo de visión.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el modelo es de visión y el tamaño del archivo ONNX es de 106 MB (variante UINT8) y algo mayor en FP16 (el repo total ocupa 2.1 GB). Se puede ejecutar en CPU sin problema.
- **GPU recomendadas**: no es necesario; el modelo es ligero y se ejecuta bien en CPU. Para aplicaciones móviles, la variante INT8 está pensada para ejecutarse en la NPU/GPU del móvil.
- **Compatibilidad con consumer GPU**: sí, cualquier GPU con soporte ONNX (por ejemplo, una RTX 3060 o superior) puede ejecutarlo sin problemas, pero no es necesario.
- **Opciones de despliegue**: ONNX Runtime (incluyendo versiones móviles), aplicaciones móviles (via ONNX Runtime Mobile), o cualquier framework que soporte ONNX (TensorRT, OpenVINO, etc.). La app WaifuTagger usa este modelo.
- **Latencia y throughput**: no se han publicado datos de latencia, pero al ser un modelo SwinV2 con cuantización INT8, se espera una latencia de unos pocos cientos de milisegundos en un móvil moderno (dependiendo de la resolución de entrada).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Smashinfries/wd-swinv2-tagger-v3-onnx-mobile` | SwinV2 | ~2.9B (original) | no aplica | Apache 2.0 | ONNX (FP16/INT8) con pre/postprocesado |
| `SmilingWolf/wd-swinv2-tagger-v3` | SwinV2 | ~2.9B | no aplica | Apache 2.0 | PyTorch, ONNX (sin pre/postprocesado) |
| `SmilingWolf/wd-vit-tagger-v3` | ViT | ~2.9B | no aplica | Apache 2.0 | PyTorch, ONNX |

La principal diferencia con los modelos de SmilingWolf es que esta versión incluye preprocesado y postprocesado integrados, lo que facilita su uso en aplicaciones móviles, y ofrece cuantización INT8 para reducir el tamaño y la latencia. El resto de características (etiquetas, precisión) son prácticamente idénticas.

## Limitaciones y advertencias

- **Sesgos de etiquetado**: el modelo se entrenó con imágenes de Danbooru, que es un repositorio de imágenes de anime/ilustración. Por tanto, su rendimiento en otros dominios (fotos reales, imágenes médicas, etc.) será muy pobre.
- **Riesgo de alucinación**: al ser un modelo de etiquetado, no hay riesgo de alucinación textual, pero sí puede producir etiquetas incorrectas o con baja confianza en imágenes ambiguas.
- **Limitaciones de contexto**: no aplica, es un modelo de visión de una sola imagen.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo original de SmilingWolf se entrenó con datos de Danbooru, cuyos términos de uso pueden ser restrictivos para ciertos usos (revisar los términos de Danbooru).
- **Caveat de cuantización**: aunque la diferencia de precisión es mínima, la versión INT8 puede tener más errores en etiquetas de baja probabilidad o en imágenes con mucho detalle. Se recomienda usar la versión FP16 para casos de uso críticos.
- **Dependencia del preprocesado**: el modelo `mobile` espera una entrada RGB como `Uint8Array` (sin normalización previa), lo que puede diferir de otros modelos ONNX estándar. Es importante respetar el formato de entrada para no obtener resultados incorrectos.

## Enlaces

- [HuggingFace: Smashinfries/wd-swinv2-tagger-v3-onnx-mobile](https://huggingface.co/Smashinfries/wd-swinv2-tagger-v3-onnx-mobile)
- [Modelo base: SmilingWolf/wd-swinv2-tagger-v3](https://huggingface.co/SmilingWolf/wd-swinv2-tagger-v3)
- [Aplicación WaifuTagger (GitHub)](https://github.com/KuzuLabz/WaifuTagger)
- [Notebook de procesamiento (en el repo)](https://huggingface.co/Smashinfries/wd-swinv2-tagger-v3-onnx-mobile/blob/main/notebook.ipynb)
- [Ejemplo de imagen de prueba](https://huggingface.co/spaces/SmilingWolf/wd-tagger/blob/main/power.jpg)
- [Modelo en ModelScope (referencia del modelo original)](https://www.modelscope.cn/models/fireicewolf/wd-swinv2-tagger-v3/)
