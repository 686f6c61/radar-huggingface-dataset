# BiliSakura/Priming-diffusers

## Resumen

Priming-diffusers es el conjunto de checkpoints en formato nativo de la librería `diffusers` para **Priming**, un método de generación de imágenes en un solo paso presentado en el artículo *Are We Overthinking One-Step Generation?* (arXiv:2610.20331, Park et al.). El repositorio lo publica el usuario BiliSakura e incluye dos variantes, Priming-B y Priming-L, ambas entrenadas de forma condicional a clases sobre ImageNet a 256×256. La propuesta central es eliminar la necesidad de muestreo iterativo y de *classifier-free guidance*: el transformer predice directamente la imagen limpia en un único paso hacia delante con `guidance_scale=1`.

El interés práctico está en la relación entre calidad y coste computacional: el artículo reporta FID de 1,38 para Priming-B y 1,19 para Priming-L en ImageNet-256 con un solo paso de evaluación, cifras que sitúan el método por debajo de FID 1,5 sin cadena de pasos ni guiado doble. Cada variante es autocontenida: incluye su propio `pipeline.py`, `scheduler/scheduling_priming.py` y `transformer/transformer_priming.py`, de modo que no hace falta instalar un paquete adicional de Priming, solo `diffusers` de PyPI con `trust_remote_code=True`.

Es un modelo de nicho y de investigación: no es texto-a-imagen (solo acepta etiquetas de clase de ImageNet), no soporta edición ni personalización, y su pipeline declarado es `unconditional-image-generation` pese a que el modelo es class-conditional, una inconsistencia de metadatos a tener en cuenta. El repositorio pesa 2,1 GB y acumula 0 descargas y 0 *likes*, por lo que no existe validación comunitaria independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (`PrimingTransformer2DModel`) con atención y frecuencias rotatorias 2D; parches de 16 px |
| Parámetros totales | no disponible (el autor solo publica las variantes B y L, sin recuento de parámetros) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; resolución nativa 256×256 (rejilla de parches de 16×16) |
| Tipos de cuantización | no disponible; los pesos se publican en `safetensors` y el ejemplo de inferencia usa `torch_dtype=bfloat16` |
| Idiomas soportados | inglés (etiquetas de clase de ImageNet, con mapa `id2label` y sinónimos) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors`, estructura de repositorio `diffusers` con `custom_pipeline` y `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión que opera sobre parches de 16 píxeles y emplea frecuencias rotatorias 2D para codificar la posición. La innovación metodológica de Priming es que el scheduler (`PrimingScheduler`) realiza una única evaluación: en lugar de iterar sobre un ruido decreciente, el transformer recibe la entrada y predice directamente la imagen limpia en RGB a 256×256. El muestreo, por tanto, es un solo paso hacia delante con `guidance_scale=1.0`, sin guiado clasificador y sin escalado de ruido por pasos. Las posiciones aprendidas se pueden interpolar y las frecuencias rotatorias 2D se reconstruyen para resoluciones distintas de 256, siempre que sean divisibles por el tamaño de parche de 16.

Los pesos publicados son los de la EMA posterior al entrenamiento (*post-training EMA*) que el artículo describe. El entrenamiento es class-conditional sobre ImageNet (1000 clases, 256×256); el repositorio conserva el mapa `id2label` en inglés en `model_index.json` y permite resolver etiquetas por cadena (`pipe(class_labels="golden retriever")`) o mediante sinónimos (`pipe.labels`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de ImageNet, ni si hubo fases de RLHF o DPO (poco habituales en modelos de difusión). Tampoco se documentan técnicas auxiliares como decodificación especulativa; la aceleración proviene exclusivamente del muestreo en un paso.

## Capacidades

- Generación de imágenes condicionada a clase sobre las 1000 categorías de ImageNet, a 256×256 y en un único paso de inferencia.
- Resolución flexible: cualquier tamaño divisible por 16 interpolando posiciones y reconstruyendo las frecuencias rotatorias 2D (la calidad fuera de 256×256 no está documentada).
- Resolución de etiquetas por texto: el pipeline acepta cadenas en inglés, sinónimos y el método `get_label_ids("golden retriever")`.
- Inferencia sin guiado: `guidance_scale=1.0` es el valor de funcionamiento, lo que evita duplicar el coste por *classifier-free guidance*.
- Reproducibilidad determinista mediante `torch.Generator` con semilla (el ejemplo de la model card usa `manual_seed(1)`).
- Integración nativa con `diffusers` (`DiffusionPipeline.from_pretrained`), incluida carga desde un checkout local con `local_files_only=True`.
- No soporta: prompts de lenguaje natural, texto-a-imagen, edición, inpainting, outpainting, control por imagen, personalización (LoRA/embeddings), tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- **Investigación en generación en un paso**: sirve como referencia reproducible (FID 1,19 y 1,38 en ImageNet-256) para comparar métodos de destilación, modelos de consistencia o esquemas de muestreo reducido. La disponibilidad de checkpoints en `diffusers` con scheduler propio simplifica la integración en *scripts* de evaluación.
- **Aumento de datos sintéticos para clasificación**: al estar condicionado a las 1000 clases de ImageNet, permite generar lotes de una clase concreta a 256×256 y un solo paso, útil para equilibrar clases poco representadas en conjuntos de entrenamiento con vocabulario compatible.
- **Pruebas de robustez de clasificadores**: generar muestras sintéticas por clase y medir la degradación de un *backbone* de visión ante datos generados, con la ventaja de que el coste por imagen es un único *forward pass*.
- **Creación de marcadores de posición (*placeholders*) visuales**: para prototipos de interfaz o *datasets* de demostración que necesitan una imagen representativa de una categoría concreta sin licencias de terceros, dado que la licencia Apache 2.0 permite uso comercial.
- **Evaluación de latencia en pipelines de inferencia**: al requerir un solo paso, es un banco de pruebas limpio para medir el coste puro del transformer (ancho de banda de VRAM, tiempo de un *forward*) sin la variable del número de pasos.
- **Docencia y demostraciones de difusión**: ejemplo mínimo y autocontenido (pipeline, scheduler y transformer en el propio repositorio) para explicar la diferencia entre muestreo iterativo y predicción directa de la imagen limpia.
- **Análisis de sesgos por categoría**: al cubrir clases cerradas de ImageNet, permite estudiar la distribución de atributos generados por clase y compararla con las imágenes reales del mismo *label*.

## Benchmarks y rendimiento

| Modelo | Resolución | Pasos | Guidance | FID (ImageNet-256) |
|---|---|---:|---:|---:|
| Priming-B | 256×256 | 1 | 1,0 | 1,38 |
| Priming-L | 256×256 | 1 | 1,0 | 1,19 |

Los valores proceden del artículo citado por el autor y no se han verificado de forma independiente en la información disponible. No se publican en la información proporcionada otras métricas (CLIP score, precisión/recall, FID con más pasos, comparación con modelos de referencia), por lo que no es posible construir una tabla comparativa de rendimiento con alternativas sin inventar cifras.

## Requisitos de hardware

- **VRAM estimada**: el repositorio completo (Priming-B + Priming-L) ocupa 2,1 GB, por lo que cada checkpoint ronda 1 GB en `safetensors`. En `bfloat16` y con un único *forward pass* a 256×256, la estimación razonable es de 2-3 GB de VRAM incluyendo activaciones; el dato exacto no está publicado.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM es suficiente para una variante. No se requiere A100 ni H100; tarjetas de consumo como RTX 3060 (12 GB), RTX 4060 Ti o RTX 4090 quedan sobradas.
- **Cabe en GPU de consumo**: sí, con margen amplio, al tratarse de un modelo pequeño en comparación con los *backbones* texto-a-imagen habituales.
- **Opciones de despliegue**: `diffusers` con `DiffusionPipeline.from_pretrained(..., custom_pipeline="pipeline.py", trust_remote_code=True)`. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni TensorRT-LLM, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. Al ser un solo paso, la latencia vendrá dominada por un único *forward* del transformer más la decodificación a RGB; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Priming-B | Difusión class-conditional, 1 paso | no disponible | 256×256 | 1 | Apache 2.0 | HuggingFace (`diffusers`) |
| Priming-L | Difusión class-conditional, 1 paso | no disponible | 256×256 | 1 | Apache 2.0 | HuggingFace (`diffusers`) |
| Alternativas de generación en un paso (modelos de consistencia, destilaciones de difusión) | Difusión/consistencia de 1-4 pasos | no disponible | variable | 1-4 | variable | no disponible en la información proporcionada |
| Modelos de difusión class-conditional multi-paso sobre ImageNet | Difusión iterativa | no disponible | 256×256 | decenas | variable | no disponible en la información proporcionada |

La información proporcionada no incluye especificaciones ni resultados de modelos competidores, por lo que la comparación cuantitativa con alternativas queda como no disponible. La comparación cualitativa relevante es que Priming reclama un régimen de un solo paso con `guidance_scale=1`, frente al muestreo iterativo con guiado doble habitual en la familia.

## Limitaciones y advertencias

- **Alcance cerrado**: solo genera las 1000 clases de ImageNet. No acepta prompts libres, por lo que no sirve como modelo texto-a-imagen general.
- **Idioma**: las etiquetas y sinónimos están únicamente en inglés; no hay soporte multilingüe.
- **Resolución**: 256×256 nativa. Otros tamaños divisibles por 16 funcionan por interpolación de posiciones, pero no se documenta la calidad resultante ni se garantiza que mantenga el FID reportado.
- **Diversidad limitada por diseño**: el modo de funcionamiento es un paso con `guidance_scale=1.0`; no se documentan controles de diversidad, temperature ni escalas de guiado alternativas.
- **`trust_remote_code=True`**: el pipeline y el transformer se ejecutan como código arbitrario del repositorio. Es un riesgo de seguridad en producción; conviene auditar `pipeline.py`, `scheduling_priming.py` y `transformer_priming.py` antes de desplegar.
- **Metadatos inconsistentes**: el `pipeline_tag` es `unconditional-image-generation`, pero el modelo es class-conditional y el *widget* de ejemplo usa una etiqueta de texto (`golden retriever`), lo que puede confundir la integración automática.
- **Sin validación comunitaria**: 0 descargas y 0 *likes* en el momento de la ficha; el FID es autorreportado y no verificado por terceros.
- **Sesgos de ImageNet**: hereda los desequilibrios y estereotipos del conjunto de entrenamiento por clase, incluidas categorías con connotaciones sensibles.
- **Riesgo de alucinación visual**: como todo modelo generativo, puede producir imágenes incoherentes o anatómicamente incorrectas; no hay filtros de seguridad ni moderación documentados en el repositorio.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero no exime del cumplimiento de las condiciones de los datos de entrenamiento (ImageNet es de uso no comercial en su distribución original), un extremo que conviene revisar antes de un despliegue comercial.
- **Sin métricas de producción**: no hay datos publicados de latencia, throughput ni consumo de VRAM medidos, solo estimaciones derivadas del tamaño del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BiliSakura/Priming-diffusers
- Paper (*Are We Overthinking One-Step Generation?*): https://arxiv.org/abs/2610.20331
- Repositorio de código: https://github.com/JaeyeonKim01/priming
- Librería diffusers: https://github.com/huggingface/diffusers
