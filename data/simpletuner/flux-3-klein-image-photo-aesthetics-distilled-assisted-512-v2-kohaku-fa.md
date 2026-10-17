# SimpleTuner/flux-3-klein-image-photo-aesthetics-distilled-assisted-512-v2-kohaku-fa

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) de rango 32 entrenado por el equipo de SimpleTuner sobre el modelo de difusión FLUX 3 Image Klein de Black Forest Labs. No es un modelo independiente: se carga encima del modelo base, de aproximadamente 5,6 mil millones de parámetros, para desplazar su distribución hacia una estética fotográfica concreta, tal y como indica el sufijo "photo-aesthetics" del nombre.

El entrenamiento se realizó con SimpleTuner a lo largo de 11.000 pasos sobre el dataset interno "photo-aesthetics-assisted-512", compuesto por 29.760 imágenes repartidas en 55 buckets de aspecto y una resolución efectiva de 0,262144 megapíxeles (512×512). El codificador de texto no se entrenó, por lo que se reutiliza el del modelo base. Las imágenes de validación se generaron con 16 pasos, CFG 1,0 y FlowMatchEulerDiscreteScheduler a 512×512 y 1024×1024.

Su relevancia es doble: por un lado documenta el flujo de trabajo de SimpleTuner sobre la nueva familia FLUX 3 Image Klein; por otro, permite reproducir un acabado fotográfico determinado sin reentrenar el modelo completo. En el momento de la consulta el repositorio no acumula descargas ni "likes", y está marcado con la etiqueta not-for-all-audiences.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con flow matching sobre el transformer de FLUX 3 Image Klein; adaptador LoRA tipo PEFT (modo estándar) |
| Parametros totales | Adaptador: rango 32, alpha 32,0, dropout 0,0. Modelo base flux-3-image-klein: 5,6B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusión). El modelo base admite hasta 10 imágenes de referencia para edición |
| Tipos de cuantizacion | Modelo base: BF16, FP8, NVFP4 y GGUF según documentación de terceros. El adaptador no se entrenó cuantizado; cuantización opcional en inferencia con optimum.quanto (qint8) |
| Idiomas soportados | No disponible (modelo texto a imagen; todos los prompts de ejemplo están en inglés) |
| Licencia | other (licencia personalizada; consultar los términos del modelo base) |
| Formato de pesos | Pesos LoRA en el formato nativo de diffusers/PEFT (se asume safetensors; no confirmado explícitamente en la model card) |

## Arquitectura y entrenamiento

FLUX 3 Image Klein es un modelo de difusión basado en transformer con flow matching que unifica generación texto a imagen, edición con hasta 10 imágenes de referencia y control de composición mediante cajas delimitadoras. Este adaptador no modifica el codificador de texto ni la arquitectura: inyecta matrices de bajo rango (rank 32, alpha 32,0, inicialización por defecto) sobre las capas del transformer, con tipo de predicción `flow_map`. El entrenamiento usó AdamW en BF16 puro, learning rate 1e-4 con schedule constant_with_warmup y 25 pasos de calentamiento, norma de gradiente máxima 1,0, batch efectivo de 1 (micro-batch 1, acumulación 1, una sola GPU) y checkpointing de gradientes activado. El dropout de caption fue del 0,0 %.

El dataset "photo-aesthetics-assisted-512" contiene 29.760 imágenes en 55 buckets de aspecto, sin recorte, con una resolución de 0,262144 megapíxeles. La model card declara 0 épocas completas y 11.000 pasos de entrenamiento, y advierte de que no se utilizó ningún prompt de validación durante el proceso. El texto de validación se generó con 16 pasos, CFG 1,0, CFG rescale 0,0, semilla 42 y el scheduler FlowMatchEulerDiscreteScheduler.

## Capacidades

- Generación de imágenes fotorrealistas a partir de texto (text-to-image), condicionada por el sesgo estético aprendido en el adaptador.
- Edición y variación de imágenes (image-to-image) heredadas del modelo base, incluyendo soporte de hasta 10 imágenes de referencia.
- Control de composición mediante cajas delimitadoras y guía espacial, funcionalidad que aporta el modelo base.
- Mejora de prompt (prompt upsampler) suministrada junto al modelo base; los autores recomiendan no usarlo sin ella.
- Resolución de trabajo validada a 512×512 y 1024×1024.
- No incorpora tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje conversacional.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión o audio) en este adaptador.
- El adaptador por sí solo no genera nada: requiere cargar los pesos del modelo base.

## Casos de uso

- Catálogos de producto: generar imágenes de prendas, tejidos o complementos sobre fondos neutros con un acabado fotográfico homogéneo, aprovechando la coherencia estética que impone el LoRA.
- Fotografía de interiores y arquitectura: producir vistas de cocinas, salones o espacios con luz natural simulada para previsualización comercial antes de una reforma.
- Ilustración editorial y prensa: crear imágenes de acompañamiento para artículos con un estilo fotográfico consistente y sin depender de bancos de imágenes.
- Prototipado de campañas publicitarias: iterar rápidamente sobre conceptos visuales a 512×512 antes de escalar a 1024×1024 o pasar a producción fotográfica real.
- Generación de material para videojuegos y simulación: obtener texturas fotográficas, escenarios y referencias de ambiente para arte conceptual.
- Experimentación académica: estudiar cómo un LoRA de rango 32 desplaza la distribución de un modelo base de 5,6B entrenado con flow matching, usando el pipeline de SimpleTuner como referencia reproducible.
- Personalización de estilo: partir de checkpoints base del modelo y aplicar el adaptador para fijar una identidad visual propia en flujos ya existentes de diffusers o ComfyUI.
- Edición asistida con referencias: combinarlo con las capacidades de image-to-image del modelo base para mantener el estilo fotográfico al modificar una imagen existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas FID, CLIP score, ImageReward ni comparaciones cuantitativas con otros adaptadores o checkpoints. La model card únicamente documenta los ajustes de validación (16 pasos, CFG 1,0, semilla 42, resoluciones 512×512 y 1024×1024) y una galería de ejemplos, sin valores numéricos asociados.

## Requisitos de hardware

- VRAM estimada para el modelo base en BF16: en torno a 11-12 GB solo para el transformer de 5,6B, más el codificador de texto y el VAE.
- VRAM estimada en FP8: aproximadamente 6 GB para el transformer; en NVFP4, alrededor de 3-4 GB. Son estimaciones derivadas del número de parámetros, no medidas publicadas.
- El adaptador añade ~1,0 GB de pesos LoRA en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para producción o lotes grandes; RTX 4090 (24 GB) para BF16 con margen; RTX 3090 y 4080 (16-24 GB) en FP8; GPUs de 8-12 GB solo con cuantización NVFP4/GGUF y offload a CPU.
- Cabe en GPU de consumo: sí, con cuantización, en tarjetas de 12 GB o superiores; en 8 GB es previsible que requiera offload parcial del codificador de texto.
- Opciones de despliegue: diffusers (a través del pipeline `Flux3ImagePipeline` de SimpleTuner), ComfyUI, y formato GGUF para entornos de baja VRAM. vLLM y TGI no son aplicables, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible. Los únicos datos de referencia son los 16 pasos de inferencia con CFG 1,0 empleados en la validación.

## Comparativa con modelos similares

| Modelo | Parametros | Referencias / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (LoRA rank 32) | Sobre base de 5,6B | Hereda hasta 10 imágenes de referencia del base | other | HuggingFace (0 descargas, 0 likes) |
| black-forest-labs/flux-3-image-klein | 5,6B | Hasta 10 imágenes de referencia y control por cajas | other (licencia por niveles) | Pesos abiertos y API |
| Otros LoRA de estética fotográfica sobre FLUX 3 | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos públicos de benchmarks que permitan comparar este adaptador con alternativas de la misma categoría. Cualquier comparación de calidad visual con otros LoRA sobre FLUX 3 Image Klein requeriría una evaluación propia.

## Limitaciones y advertencias

- El repositorio está etiquetado como not-for-all-audiences: el contenido que genera puede no ser apto para todos los públicos y conviene filtrarlo si se despliega en un producto de cara al usuario.
- La licencia figura como "other" y el modelo base usa una licencia por niveles: es imprescindible revisar los términos comerciales antes de cualquier uso en producción.
- El adaptador depende por completo del modelo base flux-3-image-klein; sin él no es funcional y no se puede evaluar de forma aislada.
- La model card declara 0 épocas de entrenamiento y ningún prompt de validación durante el proceso, lo que dificulta interpretar la progresión del ajuste.
- El dataset tiene un sesgo inherente: 29.760 imágenes seleccionadas por criterios de estética fotográfica, sin documentación sobre su composición demográfica, geográfica o temática. Es esperable que el estilo generado favorezca una estética concreta y sobrerrepresente ciertos sujetos.
- Riesgo de artefactos propios de los modelos de difusión: anatomía incorrecta, texto ilegible en la imagen, incoherencias espaciales y reflejos irreales. El adaptador no corrige estos problemas del modelo base.
- El codificador de texto no se ha entrenado, por lo que la comprensión del prompt queda limitada a la del modelo base; conviene usar el prompt upsampler que lo acompaña.
- No hay métricas ni validación por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta), así que la reproducibilidad del estilo no está contrastada por terceros.
- No se documentan idiomas soportados; los ejemplos están en inglés y se desconoce el comportamiento con prompts en castellano.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/SimpleTuner/flux-3-klein-image-photo-aesthetics-distilled-assisted-512-v2-kohaku-fa
- Modelo base FLUX 3 Image Klein: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Código de inferencia de referencia: https://github.com/black-forest-labs/flux-3-image-klein
- Blog de FLUX 3 en Diffusers: https://huggingface.co/blog/flux-3
- Documentación de SimpleTuner: http://docs.simpletuner.io/
- Guía de FLUX 3 Image Klein en Stable Diffusion Tutorials: https://www.stablediffusiontutorials.com/2026/10/flux3-image-klein.html
- Análisis del lanzamiento en Runtimewire: https://runtimewire.com/article/black-forest-labs-flux-3-image-klein-open-weights
