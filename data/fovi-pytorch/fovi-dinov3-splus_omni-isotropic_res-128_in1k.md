# fovi-pytorch/fovi-dinov3-splus_omni-isotropic_res-128_in1k

## Resumen

FOVI-DINOv3-S+ es un codificador de visión por computador basado en DINOv3 ViT-S/16+ adaptado mediante la librería FOVI para operar con visión foveada (foveated vision). Lo desarrolla el proyecto fovi-pytorch y se distribuye con la licencia DINOv3. El modelo parte del checkpoint `facebook/dinov3-vits16plus-pretrain-lvd1689m` y se afina sobre ImageNet-1k para extracción de características de imagen con un banco finito de siete intensidades de foveación.

La innovación principal es la sustitución del muestreo uniforme de parches por una retina isotrópica calibrada: en lugar de una rejilla cuadrada de tokens, el modelo procesa un vector de muestras organizado en anillos concéntricos con densidad decreciente hacia la periferia. Incorpora vecindades de parche geodésicas sobre la superficie cortical, RoPE cartesiano, colocación automática de parches hacia el interior y un kernel de referencia de 24×24 inicializado por redimensionado bilineal del kernel original de 16×16 de DINOv3.

El modelo es relevante para investigación en visión biológicamente plausible y para tareas de extracción de características con resolución efectiva variable, ya que permite controlar el compromiso entre campo visual y detalle mediante un único hiperparámetro (`cmf_a`). No es un export estándar de `transformers`; requiere la librería FOVI 2.6.0 o superior para cargarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv3 ViT-S/16+) con retina foveada isotrópica |
| Parámetros totales | no disponible (backbone ViT-S/16+; repo de 0,1 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (visión); presupuesto retinal de 16.384 muestras, resolución nominal 128, 64 tokens espaciales |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | dinov3-license (other) |
| Formato de pesos | shard completo con backbone, parametrizaciones LoRA, proyectores y clasificador; carpeta `backbone/` con arquitectura y metadatos del procesador |

## Arquitectura y entrenamiento

El backbone es un DINOv3 ViT-S/16+ con parches de tamaño 16 y un campo planar circular de diámetro 16 en las coordenadas de preentrenamiento guardadas. Sobre él se aplica un ajuste fino con LoRA de rango 64 y alpha 64 en el patch embedding y en los bloques 0 a 5 del transformer, con la normalización final entrenable y una cabeza de clasificación para ImageNet-1k. El modelo usa retina isotrópica: un vector de muestras con anillos calibrados y vecindades geodésicas sobre superficie cortical, en lugar de un raster cuadrado.

El entrenamiento se realizó durante 100 épocas con semilla 1, cuatro GPUs, batch de 128 por GPU, optimizador AdamW, learning rate base de 0,0001 y precisión mixta BF16. El checkpoint exportado corresponde a la época 99 (indexada desde cero). Se usa un banco de siete intensidades de foveación con valores sin normalizar de `cmf_a`: `[0.001, 0.01, 0.1, 1, 10, 100, 1000]`; el parámetro normalizado es `cmf_a / fov`, con `fov = 16`, y valores menores producen foveación más fuerte. En cada imagen se muestrea un nivel de foveación que se comparte entre sus cuatro fijaciones de entrenamiento.

## Capacidades

- Extracción de características de imagen con resolución efectiva controlable mediante el índice de foveación (`cmf_indices`).
- Clasificación de ImageNet-1k: salida de logits de 1000 clases.
- Generación de vistas retinales (`retinal_views`) y características por capa (`layer_features`), incluyendo características pooled de 384 dimensiones del backbone y salidas de los proyectores entrenados.
- Procesamiento con múltiples fijaciones por imagen (de 1 a 20 fijaciones evaluadas), con coordenadas de fijación normalizadas como pares fila/columna.
- Soporte de fijación central inicial y políticas de fijación multi-muestra (`multi_random_nearcenter`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo exclusivamente de visión.
- Capacidades multilingües: no aplica.

## Casos de uso

- Extracción de características para clasificación de imágenes: el modelo produce logits de 1000 clases y características pooled de 384 dimensiones, adecuadas como entrada para clasificadores lineales o cabezas de detección en pipelines de visión.
- Investigación en visión foveada: permite estudiar cómo varía la precisión de clasificación al modificar la intensidad de foveación (de `cmf_a` 0,001 a 1000) manteniendo el mismo backbone, útil para experimentos sobre atención visual biológicamente plausible.
- Evaluación de robustez con múltiples fijaciones: el modelo acepta de 1 a 20 fijaciones por imagen, lo que permite analizar el compromiso entre coste computacional y precisión (68,52 % top-1 con una fijación frente a 75,55 % con veinte).
- Prototipado de sistemas de visión con presupuesto de muestras fijo: el presupuesto retinal de 16.384 muestras y 64 tokens espaciales permite desplegar el modelo en entornos con restricciones de cómputo, ajustando la foveación en lugar de la resolución del raster.
- Benchmarking de codificadores auto-supervisados: sirve como referencia para comparar variantes de DINOv3 con muestreo no uniforme en tareas de extracción de características sobre ImageNet-1k.
- Reproducción de experimentos académicos: el paquete incluye `provenance.json` y `validation.json` con revisiones de código y versiones de dependencias, lo que facilita la replicación de los resultados publicados.

## Benchmarks y rendimiento

Validación completa e independiente sobre las 50.000 imágenes de ImageNet-1k, con asignación de una de las siete intensidades de foveación por índice secuencial módulo siete:

| Fijaciones | Top-1 (%) | Top-5 (%) |
|---:|---:|---:|
| 1 | 68,520 | 88,438 |
| 2 | 70,882 | 89,726 |
| 3 | 72,132 | 90,392 |
| 5 | 73,606 | 91,414 |
| 10 | 74,850 | 92,276 |
| 20 | 75,552 | 92,862 |

Métricas finales registradas del run de origen en la época 99 (no es una evaluación nueva): top-1 global de 68,51 % con una fijación y 75,54 % con veinte fijaciones. El loader de validación asigna imágenes distintas de forma determinista a cada nivel CMF (7.143 imágenes por nivel, 7.142 para el último), por lo que las filas por nivel describen subconjuntos disjuntos y no las 50.000 imágenes en cada intensidad.

Protocolo: decodificador de validación de entrenamiento (`CenterCropRGBImageDecoder`, ratio de recorte 1,0, salida de 256×256), conversión RGB a float en [0, 1] y normalización con media/desviación de ImageNet. La política `multi_random_nearcenter` usa fijación central inicial y fijaciones posteriores sembradas de forma reproducible con 2026 más el índice de batch, con batches de 128 imágenes y autocast BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo ocupa 0,1 GB y el backbone es ViT-S/16+, por lo que el peso en precisión completa es reducido, pero no se publica una cifra de VRAM.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device="cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la librería FOVI (`pip install "fovi[models]==2.6.0"`), cargando con `get_model_from_base_fn`. No es un export de `transformers.AutoModel` y no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FOVI-DINOv3-S+ (este) | no disponible (ViT-S/16+) | Retina foveada, 16.384 muestras, 64 tokens | 68,52 % (1 fijación) / 75,55 % (20 fijaciones) | dinov3-license | Hugging Face, librería FOVI |
| facebook/dinov3-vits16plus-pretrain-lvd1689m | no disponible | Raster ViT estándar | no disponible en la información | dinov3-license | Hugging Face |
| Otros codificadores DINOv3 | no disponible | no disponible | no disponible | dinov3-license | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un export estándar de `transformers`: requiere FOVI 2.6.0 o superior y el cargador propio de la librería; no funciona con `AutoModel`.
- La evaluación exige pasar `cmf_indices` de forma explícita y los índices deben coincidir con el banco de siete niveles definido; un índice fuera de rango no está soportado.
- El modelo está entrenado y evaluado exclusivamente en ImageNet-1k; no se documenta su comportamiento en otros dominios ni en tareas densas (detección, segmentación).
- Las métricas por nivel de foveación provienen de subconjuntos disjuntos de imágenes, no de las 50.000 imágenes completas en cada intensidad; deben interpretarse con cautela.
- Puede haber pequeñas diferencias respecto a las métricas finales registradas por variaciones en la semilla aleatoria de fijaciones y en la pila de evaluación.
- No se documentan sesgos específicos, pero al derivar de ImageNet-1k hereda los sesgos de etiquetas y distribución de dicha base de datos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las predicciones de clasificación pueden ser erróneas en clases poco representadas.
- Licencia `dinov3-license` (other): es necesario revisar `LICENSE.md` antes de cualquier uso comercial; no se garantiza permiso comercial explícito en la información disponible.
- El uso de pesos base está bloqueado por la comprobación de acceso al repositorio upstream; la carga local evita descargar los pesos base, pero requiere el paquete completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fovi-pytorch/fovi-dinov3-splus_omni-isotropic_res-128_in1k
- Modelo base: https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
- Repositorio FOVI: https://github.com/nblauch/fovi
- Dataset: https://huggingface.co/datasets/ILSVRC/imagenet-1k
- Licencia: https://huggingface.co/fovi-pytorch/fovi-dinov3-splus_omni-isotropic_res-128_in1k/blob/main/LICENSE.md
