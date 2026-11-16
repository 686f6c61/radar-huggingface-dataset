# maryanlup/OT-RF

## Resumen

OT-RF (Optimal Transport for Rectified Flow Image Editing) es un método de edición de imágenes zero-shot para modelos de flujo rectificado (rectified flow), presentado en el congreso WACV 2026 por Marian Lupașcu y Mihai Sorin Stupariu. El repositorio de Hugging Face `maryanlup/OT-RF` no contiene pesos de modelo propios: aloja únicamente el código del pipeline (`improved_optimal_transport_rf_inversion.py`), que se aplica sobre los pesos de FLUX.1-dev de Black Forest Labs.

La aportación técnica es un pipeline de inversión y edición guiado por transporte óptimo que unifica los dos enfoques habituales de edición con modelos de flujo rectificado: los métodos basados en inversión (que proyectan la imagen a ruido y la reconstruyen con una nueva condición) y los métodos directos. El resultado es un mecanismo de edición zero-shot, es decir, sin entrenamiento adicional ni fine-tuning del modelo base, que se integra en el ecosistema Diffusers mediante `from_pipe`.

Es relevante porque los modelos de flujo rectificado como FLUX.1-dev han desplazado a los UNet de difusión clásicos en edición de imágenes de alta calidad, pero sus procedimientos de inversión no están tan maduros como los de DDIM. OT-RF propone una formulación basada en transporte óptimo para controlar mejor la trayectoria de inversión y la fidelidad de la reconstrucción, con código abierto bajo licencia MIT y un artículo revisado por pares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de inversión y edición sobre modelo de flujo rectificado (rectified flow transformer); requiere FLUX.1-dev como modelo base |
| Parametros totales | No disponible en el repositorio (los parámetros corresponden al modelo base FLUX.1-dev, no se detallan aquí) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen); resolución de trabajo no especificada en la información disponible |
| Tipos de cuantizacion | No disponible (depende del modelo base FLUX.1-dev y de Diffusers) |
| Idiomas soportados | No disponible (modelo de imagen; las instrucciones de edición se expresan en texto, presumiblemente en inglés vía FLUX.1-dev) |
| Licencia | MIT (código del pipeline); los pesos de FLUX.1-dev tienen su propia licencia con acceso restringido (gated) |
| Formato de pesos | No aplica: el repositorio solo contiene código Python; los pesos se cargan desde `black-forest-labs/FLUX.1-dev` |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo. Implementa `OptimalTransportRFInversionPipeline`, una clase que envuelve un `FluxPipeline` mediante `from_pipe` y sustituye el esquema de inversión estándar por uno guiado por transporte óptimo. El método se apoya en la formulación de flujo rectificado, en la que el modelo aprende una trayectoria recta entre la distribución de ruido y la de datos, lo que permite invertir una imagen real hacia su representación latente inicial y luego regenerarla bajo una nueva condición de edición.

La contribución del artículo es unificar en un mismo marco los métodos de edición basados en inversión y los métodos directos, usando transporte óptimo para alinear las trayectorias de inversión y de generación. El pipeline es zero-shot: no requiere fine-tuning, ni pares de imágenes antes/después, ni entrenamiento específico por tarea. No se dispone en la información proporcionada de detalles sobre el conjunto de datos de evaluación, el número de pasos de muestreo por defecto ni los hiperparámetros concretos del algoritmo de transporte óptimo.

## Capacidades

- Edición de imágenes image-to-image zero-shot sobre el modelo base FLUX.1-dev.
- Inversión de imágenes reales a su espacio latente de ruido mediante un procedimiento guiado por transporte óptimo.
- Edición guiada por instrucciones en lenguaje natural (prompt de texto), heredando la capacidad de comprensión textual de FLUX.1-dev.
- Unificación de métodos de edición basados en inversión y métodos directos en un único pipeline.
- Integración nativa con la librería Diffusers (`DiffusersPipeline`, `from_pipe`, `custom_pipeline`).
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión analítica, audio ni modo de pensamiento, por tratarse de un modelo de generación y edición de imágenes.

## Casos de uso

- Edición de imágenes en producción creativa: sustituir objetos, cambiar atributos o modificar el estilo de una fotografía existente sin reentrenar el modelo, usando la inversión OT-RF para preservar la estructura de la imagen original.
- Retoque fotográfico asistido por prompt: corregir iluminación, color o composición manteniendo la identidad de la escena gracias a la fidelidad de reconstrucción que aporta la inversión guiada por transporte óptimo.
- Investigación en métodos de inversión: servir como implementación de referencia para comparar esquemas de inversión en modelos de flujo rectificado frente a alternativas basadas en DDIM o en edición directa.
- Prototipado rápido de herramientas de edición: al ser un pipeline Diffusers con licencia MIT, se puede integrar en demos, notebooks y aplicaciones internas sin coste de licencia del código.
- Edición iterativa con control de deriva: la formulación unificada permite aplicar varias ediciones sucesivas sobre una misma imagen reduciendo la acumulación de artefactos respecto a pipelines de inversión naïve.
- Docencia y reproducción de resultados académicos: el código y el artículo permiten reproducir los experimentos de WACV 2026 sobre FLUX.1-dev en entornos con GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de métricas (FID, CLIP-score, LPIPS u otras) y el artículo asociado no se ha proporcionado en el material de referencia.

## Requisitos de hardware

- El pipeline no tiene pesos propios; los requisitos de VRAM vienen determinados por FLUX.1-dev en precisión bfloat16, que en la práctica requiere del orden de 24 GB de VRAM para inferencia cómoda en una sola GPU.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para ejecución en bfloat16.
- En GPUs de consumo con menos VRAM (RTX 3090, RTX 4080, RTX 4070 Ti) puede ser necesario recurrir a offloading de CPU o a variantes cuantizadas del modelo base, no documentadas en este repositorio.
- Opciones de despliegue: Diffusers con `FluxPipeline` y `custom_pipeline="pipeline_flux_rf_inversion"`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de imagen de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos incluidos | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OT-RF (maryanlup/OT-RF) | Pipeline de edición sobre flujo rectificado | No (solo código) | Inversión guiada por transporte óptimo, zero-shot | MIT (código) | Hugging Face + GitHub |
| FLUX.1-dev | Modelo base de flujo rectificado | Sí | Generación y edición image-to-image | Licencia propia no comercial (gated) | Hugging Face |
| Métodos de inversión DDIM sobre modelos de difusión | Pipeline de edición | No | Inversión clásica para UNet de difusión | Variable según implementación | Repositorios de investigación |

No se dispone en la información proporcionada de comparativas cuantitativas con alternativas de edición como InstructPix2Pix, SDXL-Inpainting u otros pipelines de FLUX, por lo que no se pueden aportar cifras de rendimiento relativas.

## Limitaciones y advertencias

- Dependencia total de FLUX.1-dev: sin aceptar la licencia del modelo base (gated) y descargar sus pesos, el pipeline no funciona.
- La licencia MIT cubre únicamente el código de OT-RF; el uso comercial de las imágenes generadas queda sujeto a la licencia de FLUX.1-dev, que restringe el uso comercial.
- No se documentan sesgos específicos del método, pero hereda los sesgos del modelo base y de sus datos de entrenamiento en la generación y edición de imágenes.
- Riesgo de artefactos y de deriva semántica en ediciones agresivas o en cadenas de ediciones múltiples; la model card no cuantifica este extremo.
- No se especifican los idiomas soportados para los prompts de edición; la información disponible no permite confirmar un soporte multilingüe más allá del que ofrezca FLUX.1-dev.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria todavía muy limitada.
- No se documentan límites de resolución, número máximo de pasos ni requisitos de memoria específicos del pipeline de inversión.
- Al ser un método de investigación presentado en WACV 2026, la API puede cambiar y no se garantiza estabilidad para producción a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/maryanlup/OT-RF
- Artículo en Hugging Face Papers: https://huggingface.co/papers/2508.02363
- arXiv: https://arxiv.org/abs/2508.02363
- Código en GitHub: https://github.com/marianlupascu/OT-RF
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
