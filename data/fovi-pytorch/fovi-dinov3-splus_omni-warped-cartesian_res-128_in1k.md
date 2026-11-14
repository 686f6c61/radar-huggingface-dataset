# fovi-pytorch/fovi-dinov3-splus_omni-warped-cartesian_res-128_in1k

## Resumen

FOVI-DINOv3-S+ omni-warped-cartesian es un codificador de visión por computador basado en DINOv3 ViT-S/16+ (384 dimensiones de embedding, parche de 16x16) adaptado mediante la librería FOVI para operar con visión foveada. Lo desarrolla el proyecto fovi-pytorch y se publica bajo licencia DINOv3. El modelo resuelve el problema de extraer características visuales densas a partir de retinas muestreadas de forma no uniforme (foveación), en lugar de rasters cuadrados convencionales, lo que lo hace relevante para investigación en visión biológicamente inspirada y para pipelines que necesitan procesar múltiples fixaciones con presupuesto de muestras reducido.

La innovación principal es el uso de una rejilla retinal warped-cartesian con convolución de parches densa 16x16 y RoPE nativo sobre rejilla cortical, entrenado sobre un banco finito de siete intensidades de foveación (valores de `cmf_a` de 0,001 a 1000). El checkpoint exportado es el "omni" utilizado por las recetas CoRL-v5: un único encoder que cubre todas las intensidades del banco, seleccionables en inferencia mediante índices. El modelo fue afinado sobre ImageNet-1k con LoRA de rango 64 sobre el patch embedding y los bloques 0–5 del transformer, manteniendo congelado el resto del backbone DINOv3.

El presupuesto retinal nominal es de 16.384 muestras a resolución 128, lo que produce 64 tokens espaciales de parche. No es un export estándar de `transformers.AutoModel`: requiere la librería FOVI 2.6.0 o superior y un cargador propio. Su tamaño de repositorio es de 0,1 GB y está orientado a extracción de características y clasificación, no a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv3 ViT-S/16+) con visión foveada warped-cartesian y RoPE sobre rejilla cortical |
| Parametros totales | no disponible (backbone ViT-S/16+ con adaptadores LoRA rango 64 y cabecera de clasificación) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; presupuesto retinal de 16.384 muestras, 64 tokens de parche) |
| Tipos de cuantizacion | no disponible (pesos en el formato propio de FOVI; sin variantes GGUF/AWQ documentadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | dinov3-license (license: other) |
| Formato de pesos | shard completo propio de FOVI (backbone, parametrizaciones LoRA, proyectores y clasificador); no es export `transformers` |

## Arquitectura y entrenamiento

El modelo parte de `facebook/dinov3-vits16plus-pretrain-lvd1689m`, un ViT-S/16+ preentrenado por Meta. Sobre ese backbone se aplica una adaptación LoRA de rango 64 y alpha 64 en el patch embedding y en los bloques 0–5 del transformer, dejando entrenable la normalización final y añadiendo una cabecera de clasificación para ImageNet-1k. La entrada no es una imagen cuadrada: se muestrea una retina con rejilla warped-cartesian, parche de 16 y diámetro de campo circular de 16 en las coordenadas de preentrenamiento guardadas. El presupuesto retinal es de 16.384 muestras con resolución nominal 128, lo que genera 64 tokens espaciales.

El entrenamiento se realizó durante 100 épocas (semilla 1) sobre ImageNet-1k, con cuatro GPU, batch de 128 por GPU, AdamW, learning rate base de 0,0001 y precisión mixta BF16. En cada imagen se sortea un nivel de foveación del banco `cmf_a = [0.001, 0.01, 0.1, 1, 10, 100, 1000]` y se comparte entre las cuatro fixaciones de entrenamiento de esa imagen. El valor `cmf_a` es no normalizado; el parámetro normalizado es `cmf_a / fov`, con `fov = 16`, de modo que valores menores producen foveación más fuerte. El checkpoint exportado corresponde a la época 99 (indexación desde cero).

## Capacidades

- Extracción de características de imagen con backbone DINOv3 ViT-S/16+ (384 dimensiones por token agrupado).
- Clasificación de imágenes en ImageNet-1k (1000 clases) mediante la cabecera entrenada.
- Procesamiento de retinas foveadas con selección explícita de intensidad mediante `cmf_indices` sobre el banco de siete niveles.
- Soporte de múltiples fixaciones por imagen (`n_fixations`), con coordenadas normalizadas de fila/columna.
- Salida de características por capa (`layer_features`), incluyendo las features agrupadas del backbone y las salidas de los proyectores entrenados.
- No soporta tool calling, agentes, generación de texto, matemáticas ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo "thinking", visión generativa ni audio.

## Casos de uso

- Extracción de embeddings para búsqueda visual: el modelo genera características de 384 dimensiones por imagen que pueden indexarse en un motor vectorial para recuperación por similitud, con la ventaja de que el muestreo foveado reduce el número de píxeles procesados frente a un raster completo.
- Clasificación de imágenes con presupuesto reducido: con una sola fixación y resolución nominal 128, el modelo alcanza un Top-1 del 69,09 % en ImageNet-1k, adecuado para entornos con cómputo limitado donde no se puede procesar la imagen completa a alta resolución.
- Investigación en visión foveada: permite comparar el efecto de siete intensidades de foveación sobre la precisión de clasificación, con métricas publicadas por nivel y por número de fixaciones, lo que facilita estudios controlados sobre muestreo retinal.
- Aumento de fixaciones para mayor precisión: en tareas donde la precisión es crítica, se pueden usar 5, 10 o 20 fixaciones, elevando el Top-1 hasta el 75,92 % con veinte fixaciones, a costa de más pasadas por el encoder.
- Prototipado de sistemas de atención visual: las coordenadas de fixación son explícitas y normalizadas, lo que permite integrar políticas de atención (por ejemplo, `multi_random_nearcenter`) y evaluar su impacto en la calidad de las características extraídas.
- Base para fine-tuning en dominios específicos: al ser un checkpoint con LoRA y cabecera entrenables, puede servir como inicialización para tareas de clasificación o segmentación en dominios donde el muestreo foveado aporte ventajas de eficiencia.

## Benchmarks y rendimiento

Resultados de validación completa sobre las 50.000 imágenes de ImageNet-1k, con una intensidad de foveación asignada por índice secuencial módulo siete y precisión agregada sobre todas las imágenes:

| Fixaciones | Top-1 (%) | Top-5 (%) |
|---:|---:|---:|
| 1 | 69,088 | 88,592 |
| 2 | 71,344 | 89,792 |
| 3 | 72,700 | 90,634 |
| 5 | 73,990 | 91,532 |
| 10 | 75,168 | 92,266 |
| 20 | 75,918 | 92,886 |

Métricas finales registradas en la época 99 del entrenamiento original (no es una reevaluación independiente):

| cmf_a no normalizado | cmf_a / fov | Top-1, una fixación (%) | Top-1, veinte fixaciones (%) |
|---:|---:|---:|---:|
| 0,001 | 6,25e-05 | no disponible en el extracto | no disponible en el extracto |

No se han publicado en la información disponible resultados comparativos con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,1 GB y el backbone es ViT-S/16+, por lo que la inferencia cabe holgadamente en GPU de consumo, aunque el presupuesto retinal y el número de fixaciones incrementan el uso de memoria.
- GPU recomendadas: el ejemplo oficial usa `device="cuda"` sin especificar modelo; por tamaño del backbone, una RTX 4090 o superior es suficiente, y para lotes grandes con veinte fixaciones se recomienda A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y similares, dado el tamaño del backbone ViT-S y el repo de 0,1 GB.
- Opciones de despliegue: únicamente mediante la librería FOVI (`pip install "fovi[models]==2.6.0"`), con `get_model_from_base_fn`; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje ni un export `transformers`.
- Latencia y throughput: no disponibles; dependen del número de fixaciones y del tamaño de lote. La evaluación oficial usó lotes de 128 imágenes con autocast BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fovi-dinov3-splus_omni-warped-cartesian_res-128_in1k | no disponible (ViT-S/16+ con LoRA) | Retina foveada, 16.384 muestras, 64 tokens | Top-1 69,09 % (1 fixación) a 75,92 % (20 fixaciones) en ImageNet-1k | dinov3-license | Hugging Face, requiere FOVI 2.6.0 |
| facebook/dinov3-vits16plus-pretrain-lvd1689m | ViT-S/16+ | Raster cuadrado convencional | no disponible en esta ficha | dinov3-license | Hugging Face (modelo base) |
| Otros modelos foveados de fovi-pytorch | no disponible | Retina foveada | no disponible | dinov3-license | Hugging Face |

No se dispone de datos comparativos adicionales con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de visión: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- No es un export estándar de `transformers`; requiere la librería FOVI y su cargador específico, lo que limita la portabilidad a otros ecosistemas.
- La evaluación requiere `cmf_indices` explícitos y que los índices coincidan con el banco de siete niveles; un índice fuera de rango o mal interpretado produce resultados incorrectos.
- La precisión agregada de la validación independiente asigna una intensidad de foveación por índice secuencial módulo siete, no evalúa las 50.000 imágenes en cada intensidad; las métricas por nivel corresponden a subconjuntos disjuntos.
- Puede haber diferencias menores entre las métricas registradas y las reevaluaciones debido a la aleatoriedad de las fixaciones y a diferencias en la pila de evaluación.
- La licencia `dinov3-license` es de tipo "other"; es necesario revisar `LICENSE.md` antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Riesgo de sesgos y alucinación: al ser un clasificador y extractor de características, el riesgo de alucinación no aplica en el sentido generativo, pero sí puede heredar sesgos del dataset ImageNet-1k y del preentrenamiento DINOv3.
- No se documentan capacidades multilingües ni de otro tipo; los idiomas figuran como no disponibles.
- El checkpoint incluye el backbone base, LoRA, proyectores y clasificador; los archivos de `backbone/` solo aportan arquitectura y metadatos del procesador, no pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fovi-pytorch/fovi-dinov3-splus_omni-warped-cartesian_res-128_in1k
- Repositorio FOVI: https://github.com/nblauch/fovi
- Modelo base DINOv3 ViT-S/16+: https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
- Dataset ImageNet-1k: https://huggingface.co/datasets/ILSVRC/imagenet-1k
