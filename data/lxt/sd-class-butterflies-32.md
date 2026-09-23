# LXT/sd-class-butterflies-32

## Resumen

`LXT/sd-class-butterflies-32` es un modelo de difusión para generación incondicional de imágenes, publicado por el usuario LXT en HuggingFace. Se trata de un checkpoint de 18.536.323 parámetros (unos 0,1 GB de repositorio) asociado al material del curso Diffusion Models Class, tal y como indica la etiqueta `diffusion-models-class` y el propio README. El modelo se distribuye a través de la librería `diffusers` y se invoca con `DDPMPipeline`, lo que lo sitúa en la familia de modelos DDPM con red `UNet2D` como aproximador del ruido.

El problema que resuelve es acotado y muy concreto: generar imágenes sintéticas de mariposas sin ningún tipo de condicionamiento, es decir, sin prompt de texto ni imagen de entrada. Su relevancia no es la de un modelo de producción, sino la de una pieza didáctica reproducible y ligera (18,5 M de parámetros, cabe en CPU) para aprender el ciclo completo de un pipeline de difusión: carga del modelo, muestreo iterativo y decodificación a imagen.

La ficha se ha elaborado exclusivamente con los metadatos y el README publicados en HuggingFace. La model card no documenta el conjunto de datos de entrenamiento, el número de pasos, el scheduler exacto ni resultados de evaluación, por lo que varios apartados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DDPM (denoising diffusion probabilistic model) con red `UNet2D`; pipeline `DDPMPipeline` |
| Parámetros totales | 18.536.323 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no procesa texto. Resolución de imagen sugerida por el nombre del checkpoint: 32 × 32 píxeles (no confirmada en la model card) |
| Tipos de cuantización | No disponibles. El repositorio solo publica pesos en `safetensors`, presumiblemente en fp32, sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponible / no aplica: el modelo no tiene entrada ni salida de texto |
| Licencia | MIT |
| Formato de pesos | `safetensors` (compatible con `diffusers` y PyTorch) |
| Tarea declarada | `unconditional-image-generation` |
| Librería | `diffusers` |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación / actualización | 2026-09-23 en ambos campos (metadatos con fecha anómala; véase Limitaciones) |
| Región declarada | `us` |

## Arquitectura y entrenamiento

La etiqueta `diffusers:DDPMPipeline` y el README identifican el modelo como un DDPM clásico: un proceso de difusión directa que añade ruido gaussiano a las imágenes en T pasos y una red neuronal que aprende a revertir ese proceso paso a paso. En `diffusers`, `DDPMPipeline` envuelve un `UNet2DModel` y un `DDPMScheduler`; la generación se realiza partiendo de ruido puro y aplicando iterativamente el modelo de eliminación de ruido hasta obtener una imagen. El checkpoint no está condicionado por texto, por clase ni por ninguna otra señal, de modo que no admite *guidance* real ni control sobre el contenido generado.

No hay información publicada sobre el entrenamiento en la model card: no se especifica el conjunto de datos (se desconoce si es un subconjunto de mariposas, su procedencia o su tamaño), ni el número de imágenes, ni los pasos de entrenamiento, ni si se aplicó algún tipo de ajuste posterior (EMA de pesos, RLHF/DPO —no aplicables en este dominio—, *fine-tuning*). Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal ni variantes de scheduler. Cualquier afirmación sobre estos puntos sería especulativa.

## Capacidades

- Generación incondicional de imágenes: produce imágenes de mariposas a partir de ruido aleatorio, sin prompt ni condición externa.
- Resolución baja: el nombre del checkpoint (`butterflies-32`) apunta a 32 × 32 píxeles, el formato habitual de los ejercicios introductorios de difusión.
- Variabilidad controlada únicamente por la semilla: se pueden obtener muestras distintas pasando un `generator` con semilla distinta a la pipeline.
- Integración nativa con `diffusers`: se carga y ejecuta con `DDPMPipeline.from_pretrained('LXT/sd-class-butterflies-32')`.
- Compatibilidad con sustitución de scheduler: al ser un checkpoint de difusión estándar, se le pueden acoplar otros schedulers de `diffusers` (por ejemplo DDIM) para reducir el número de pasos de muestreo.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa ni genera lenguaje.
- No tiene modo *thinking*, ni visión como entrada (es un modelo generativo, no un modelo multimodal de comprensión), ni audio.

## Casos de uso

- Docencia y material de curso: reproducir el flujo completo de un pipeline de difusión (carga, muestreo, decodificación) en un cuaderno sin necesidad de GPU, gracias a que 18,5 M de parámetros caben en CPU. Es el escenario para el que fue creado.
- Pruebas de humo en integraciones de `diffusers`: incluir el checkpoint en la batería de tests de una aplicación que use pipelines de difusión para verificar que la carga de pesos, el scheduler y la conversión a PIL siguen funcionando tras actualizar dependencias. Su tamaño hace que el test sea rápido y barato.
- Prototipado de *front-ends* y demos: construir una interfaz Gradio o Streamlit que muestre una galería de muestras generadas antes de invertir en un modelo mayor o en GPUs de pago, validando la experiencia de usuario y el flujo de trabajo.
- Generación de *sprites* o texturas de muy baja resolución para prototipos: en fases tempranas de un juego o una demo gráfica se pueden usar las muestras a 32 × 32 como *placeholders* de motivos con alas o patrones orgánicos, sustituyéndolos después por arte final.
- Punto de partida para experimentos de ajuste fino: con 18,5 M de parámetros, un *fine-tuning* sobre un conjunto propio de imágenes pequeñas es viable en una única GPU de consumo o incluso en CPU con paciencia, lo que permite estudiar el efecto del ajuste sin grandes costes.
- *Data augmentation* de baja resolución: aumentar de forma sintética un conjunto de imágenes de 32 × 32 con motivos similares, siempre que se acepte que las muestras son de baja calidad y del mismo dominio estrecho.
- Pruebas de rendimiento de infraestructura: medir latencia de arranque, tiempo por paso de muestreo y uso de memoria en distintos *backends* (PyTorch `torch.compile`, ONNX Runtime) usando un modelo lo bastante pequeño para que el cuello de botella sea el *runtime* y no la GPU.
- Ejercicios de evaluación de modelos generativos: calcular métricas como FID sobre muestras propias para practicar la metodología de evaluación, dado que el modelo es rápido de muestrear de forma masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, IS, ni ninguna otra métrica cuantitativa, ni comparaciones con otros checkpoints. Tampoco se documentan tiempos de entrenamiento ni curvas de pérdida.

## Requisitos de hardware

- Huella de pesos: 18.536.323 parámetros equivalen a aproximadamente 74 MB en fp32 y 37 MB en fp16/bf16, calculado a partir del recuento de parámetros, no de una medición publicada.
- VRAM estimada para inferencia: por debajo de 1 GB incluso con activaciones a 32 × 32 en fp32; el modelo está pensado para ejecutarse sin problemas en CPU.
- GPU recomendadas: prácticamente cualquier GPU es suficiente y, de hecho, sobredimensionada. Una GTX 1050, una T4, una RTX 3060 o una RTX 4090 funcionan sin restricción. No tiene sentido reservar A100 o H100 para este checkpoint salvo como prueba de infraestructura.
- Cabe en GPU de consumo: sí, en todas las gamas actuales, y también en iGPU y CPU. El factor limitante no es la VRAM sino el número de pasos de muestreo.
- Opciones de despliegue: `diffusers` con PyTorch (vía `DDPMPipeline`), exportación a ONNX Runtime, TorchScript o Core ML, `torch.compile` para reducir la latencia por paso, y publicación como HuggingFace Space con Gradio sobre CPU básica. No aplican `llama.cpp`, Ollama, vLLM ni TGI: son *runtimes* orientados a modelos de lenguaje y no cubren este tipo de pipeline de difusión.
- Latencia y throughput: no disponibles. No se han publicado mediciones, y el tiempo total de generación depende del número de pasos de muestreo configurado y del scheduler elegido.

## Comparativa con modelos similares

La comparación cuantitativa no es posible porque este checkpoint no publica métricas. Se ofrecen referencias de la misma categoría (difusión incondicional de baja resolución) con los datos disponibles.

| Modelo | Parámetros | Resolución | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LXT/sd-class-butterflies-32` | 18.536.323 | 32 × 32 (según nomenclatura) | Incondicional | MIT | HuggingFace, 0 descargas, 0 likes |
| `google/ddpm-cifar10-32` | No disponible en la información proporcionada | 32 × 32 (según nomenclatura) | Incondicional | No disponible en la información proporcionada | HuggingFace |
| `google/ddpm-celebahq-256` | No disponible en la información proporcionada | 256 × 256 (según nomenclatura) | Incondicional | No disponible en la información proporcionada | HuggingFace |
| Otros checkpoints del ejercicio `sd-class-butterflies-*` | No disponible en la información proporcionada | 32 o 128 según variante | Incondicional | Habitualmente MIT | HuggingFace |

En términos cualitativos, la diferencia principal frente a los DDPM de Google es el dominio de datos y el tamaño: los checkpoints de CIFAR-10 y CelebA-HQ se entrenaron sobre conjuntos amplios y conocidos, mientras que este checkpoint se limita a un dominio muy estrecho (mariposas) y a un tamaño reducido, lo que lo hace adecuado para experimentación, no para calidad de imagen.

## Limitaciones y advertencias

- Sesgo de dominio: el modelo solo genera el tipo de imágenes presente en su conjunto de entrenamiento (mariposas). No hay información sobre la composición de ese conjunto, por lo que el sesgo real (especies, colores, fondos, iluminación) es desconocido.
- Calidad de imagen muy limitada: a 32 × 32 píxeles las muestras no son fotorrealistas y presentan artefactos propios de un modelo de 18,5 M de parámetros.
- Alucinación visual: como todo modelo generativo, puede producir estructuras anatómicamente incoherentes (alas asimétricas, patrones imposibles). No existe forma de corregirlo mediante prompt, porque el modelo no está condicionado.
- Ausencia de control: no acepta texto, clase ni imagen de referencia. La única variación posible es cambiar la semilla o el scheduler.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta, y ninguna métrica publicada. No hay evidencia externa de que el entrenamiento haya convergido correctamente.
- Metadatos anómalos: las fechas de creación y actualización (2026-09-23) son posteriores a la fecha de consulta habitual de este tipo de fichas, lo que impide usar la antigüedad como criterio de madurez del checkpoint.
- Licencia: el modelo se publica bajo MIT, que permite uso comercial y modificación con atribución y sin garantías. Esta licencia cubre los pesos, no necesariamente el conjunto de datos de entrenamiento, que no se declara; si se pretende un uso comercial, conviene verificar la procedencia de los datos antes de desplegarlo.
- No apto para producción: no debe utilizarse como generador de imágenes final en un producto sin sustituirlo por un modelo condicionado y de mayor resolución.
- Requisito de reproducibilidad: al no documentarse el scheduler, los pasos de entrenamiento ni la semilla, los resultados no son reproducibles más allá del muestreo con semilla fija en inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LXT/sd-class-butterflies-32
- Repositorio del curso Diffusion Models Class, referenciado en la model card: https://github.com/huggingface/diffusion-models-class
- Documentación del pipeline utilizado (`DDPMPipeline`) en la librería diffusers: https://huggingface.co/docs/diffusers/api/pipelines/ddpm
