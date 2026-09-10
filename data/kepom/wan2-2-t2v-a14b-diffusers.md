# kepom/Wan2.2-T2V-A14B-Diffusers

## Resumen

Wan2.2-T2V-A14B es un modelo de difusión para generación de vídeo a partir de texto (text-to-video) desarrollado por Wan-AI, el equipo de Wan (Alibaba). Esta ficha corresponde al repositorio `kepom/Wan2.2-T2V-A14B-Diffusers`, una conversión de terceros del checkpoint oficial al formato de la librería Diffusers. El modelo produce clips de 5 segundos a resoluciones de 480P y 720P y emplea una arquitectura de mezcla de expertos (MoE) que reparte el proceso de eliminación de ruido entre expertos especializados, lo que aumenta la capacidad total del modelo sin incrementar el coste computacional por paso.

El recuento de safetensors del repositorio indica 14.288.491.584 parámetros y un tamaño de repositorio de 126,2 GB. La designación "A14B" hace referencia a 14B parámetros activos en el modelo original, mientras que el MoE está formado por dos expertos que se activan en función del tramo de timestep del proceso de difusión.

La relevancia del modelo radica en ser una de las pocas alternativas abiertas que compite con generadores de vídeo comerciales, con licencia Apache 2.0 e integración en Diffusers y ComfyUI. Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que su predecesor Wan2.1, según la model card, y el autor afirma que supera a modelos comerciales líderes en la mayoría de dimensiones de su benchmark interno Wan-Bench 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con mezcla de expertos (MoE) sobre tramos de timestep |
| Parametros totales | 14.288.491.584 (recuento de safetensors del repositorio) |
| Parametros activos | 14B segun la nomenclatura "A14B" del modelo original; no confirmado por los metadatos del repositorio |
| Longitud de contexto | No aplicable: modelo de difusión, no utiliza ventana de contexto de tokens |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin documentar variantes GGUF, FP8 o de menor precisión |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Diffusers, clase WanPipeline) |
| Tamano del repositorio | 126,2 GB |
| Resoluciones soportadas | 480P y 720P |
| Duracion del clip | 5 segundos |
| Pipeline declarado | text-to-video |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Wan2.2 introduce una arquitectura MoE en un modelo de difusión de vídeo: en lugar de emplear un único denoiser para todo el proceso, divide el proceso de eliminación de ruido en tramos de timestep asignados a expertos especializados. Esto permite aumentar la capacidad total del modelo manteniendo el coste computacional por paso, ya que solo se activa el experto correspondiente al tramo. La variante T2V-A14B se distribuye en un checkpoint con 14.288.491.584 parámetros contabilizados en safetensors, aunque el tamaño de 126,2 GB del repositorio sugiere la presencia de componentes adicionales más allá del transformer (codificadores y VAE, o pesos duplicados por experto); la model card no detalla esta composición. Tampoco se especifica en la información disponible el codificador de texto empleado ni el número exacto de tokens de entrenamiento.

En el plano de los datos, la model card indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, con un conjunto de datos estéticos etiquetado explícitamente en términos de iluminación, composición, contraste y tono de color, lo que permite controlar el estilo cinematográfico mediante prompt. No se documentan en la información disponible fases de RLHF ni DPO, ni detalles sobre decodificación especulativa o atención lineal. El modelo original se publicó el 28 de julio de 2025 junto con el código de inferencia multi-GPU, los pesos y las integraciones en ComfyUI y Diffusers.

## Capacidades

- Generación de vídeo a partir de texto: clips de 5 segundos a 480P y 720P en una sola pasada.
- Generación con control estético: el entrenamiento con datos etiquetados por iluminación, composición, contraste y tono permite dirigir el estilo cinematográfico desde el prompt.
- Generación de movimiento complejo: la model card destaca mejoras de generalización en movimiento, semántica y estética frente a Wan2.1.
- Integración en Diffusers: el repositorio expone el pipeline `WanPipeline`, lo que permite uso programático dentro del ecosistema Diffusers.
- Integración en ComfyUI: el modelo oficial incluye soporte de nodos para flujos de trabajo visuales.
- Inferencia multi-GPU: el código oficial de Wan2.2 soporta ejecución distribuida para los modelos A14B y 14B.
- Tool calling / function calling: no aplicable; es un modelo generativo de vídeo, no un modelo de lenguaje con soporte de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles; la información proporcionada no especifica los idiomas admitidos en los prompts.
- Modo de razonamiento (thinking), visión o audio: no disponibles.

## Casos de uso

- Publicidad y contenido de producto: generar clips de 5 segundos a 720P a partir de descripciones textuales para anuncios, banners animados o fichas de e-commerce, aprovechando el control estético por prompt para mantener la coherencia de marca.
- Previsualización de storyboards en producción audiovisual: convertir guiones o descripciones de escena en previsiones animadas de 5 segundos que permitan validar encuadres, iluminación y ritmo antes de rodar, reduciendo el coste de las pruebas en plató.
- Generación de B-roll y material de archivo: producir planos de recurso para postproducción y montaje, con la ventaja de disponer de licencia Apache 2.0 y no depender de bancos de vídeo con derechos.
- Contenido vertical para redes sociales: crear piezas cortas de 5 segundos que después se recortan o concatenan en formatos de vídeo breve, apoyándose en la resolución 720P para pantallas móviles.
- Prototipado de cinemáticas en videojuegos: generar animaciones de referencia para previsualizar secuencias narrativas antes de invertir en animación 3D, usando el modelo como herramienta de concepto.
- Investigación en generación de vídeo: servir como base para fine-tuning, evaluación comparativa de arquitecturas MoE en difusión o estudio de la coherencia temporal, dado que los pesos y el código de inferencia son abiertos.
- Automatización de catálogos y demostraciones de producto: integrar el pipeline `WanPipeline` en un servicio backend que genere, a partir de la ficha textual de un artículo, un vídeo corto de presentación de forma desatendida.
- Formación y material didáctico: producir clips ilustrativos de conceptos o procedimientos a partir de descripciones textuales, reutilizables en plataformas de e-learning.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que Wan2.2-T2V-A14B supera a modelos comerciales líderes en la mayoría de las dimensiones de evaluación de Wan-Bench 2.0, el benchmark interno del equipo, pero no se aportan puntuaciones concretas en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| Wan-Bench 2.0 | No disponible (el autor afirma superioridad sobre modelos comerciales, sin cifras) |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplicable: es un modelo de generación de vídeo |

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros y del tamaño del repositorio, ya que la información disponible no incluye una tabla oficial de requisitos para esta conversión concreta.

- Pesos del transformer en bf16: 14,29B parámetros equivalen a aproximadamente 28,6 GB en precisión de 16 bits.
- Si se cargan simultáneamente los dos expertos del MoE, la huella de pesos se aproximaría a 57 GB en bf16; el repositorio ocupa 126,2 GB, un tamaño coherente con la presencia de componentes adicionales o de copias en mayor precisión.
- VRAM recomendada para inferencia completa en bf16 sin offloading: 80 GB (A100 80 GB, H100 80 GB) o varias GPU en paralelo.
- Configuraciones con offloading a CPU o a disco pueden reducir el requisito de VRAM, a costa de un aumento notable de la latencia; no se documentan cifras concretas en la información disponible.
- GPU de consumo: una RTX 4090 con 24 GB no puede alojar los pesos del transformer A14B en bf16 sin cuantización u offloading. La model card indica que la variante TI2V-5B de la misma familia sí está pensada para ejecutarse en tarjetas de consumo como la RTX 4090.
- Opciones de despliegue: Diffusers mediante `WanPipeline`, código oficial de inferencia multi-GPU del repositorio Wan-Video/Wan2.2 y nodos de ComfyUI. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a pipelines de difusión de vídeo de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resoluciones | Duracion | Ejecucion en GPU de consumo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Wan2.2-T2V-A14B (esta ficha) | Texto a vídeo, MoE | 14,29B contabilizados en safetensors | 480P y 720P | 5 s | No sin cuantizacion u offloading | Apache 2.0 | HuggingFace (repositorio de terceros) y ModelScope |
| Wan2.2-TI2V-5B | Texto a vídeo e imagen a vídeo | 5B | 720P a 24 fps | No disponible | Si, en tarjetas como la RTX 4090 | Apache 2.0 | HuggingFace y ModelScope |
| Wan2.2-I2V-A14B | Imagen a vídeo, MoE | No disponible (nomenclatura A14B) | 480P y 720P | No disponible | No sin cuantizacion u offloading | Apache 2.0 | HuggingFace y ModelScope |
| Wan2.1 | Texto a vídeo (generacion anterior) | No disponible | No disponible | No disponible | No disponible | Apache 2.0 | HuggingFace y ModelScope |

No se dispone en la información proporcionada de datos de rendimiento comparativo ni de especificaciones de modelos de vídeo competidores de otros fabricantes que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Repositorio de terceros: `kepom/Wan2.2-T2V-A14B-Diffusers` es una conversión no oficial con 0 descargas y 0 likes, creada el 10 de septiembre de 2026. No hay validación de la comunidad ni garantía de que la conversión a Diffusers sea fiel al checkpoint oficial; para producción se recomienda partir de `Wan-AI/Wan2.2-T2V-A14B`.
- Riesgo de pesos incompletos o mal convertidos: el recuento de parámetros de safetensors (14,29B) no coincide de forma evidente con el tamaño del repositorio (126,2 GB), lo que impide descartar componentes duplicados, ausentes o almacenados en una precisión distinta de la esperada.
- Duración limitada: los clips generados son de 5 segundos, lo que obliga a concatenar varias generaciones para secuencias más largas y puede introducir discontinuidades entre fragmentos.
- Alucinación visual y coherencia temporal: los modelos de difusión de vídeo pueden producir artefactos anatómicos, físicas incorrectas y pérdida de consistencia de identidad o de fondo en movimientos complejos.
- Sesgos de los datos de entrenamiento: la model card no documenta la composición del dataset ni auditorías de sesgo, por lo que no puede descartarse un sesgo demográfico, cultural o estético heredado de los datos.
- Idiomas: no disponibles en los metadatos. No puede confirmarse el comportamiento del modelo con prompts en castellano.
- Coste computacional elevado: requiere VRAM profesional o configuraciones multi-GPU; no es viable en GPU de consumo sin cuantización u offloading.
- Ausencia de métricas verificables: no hay resultados numéricos publicados en la información disponible, solo afirmaciones cualitativas sobre Wan-Bench 2.0.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los componentes adicionales (codificadores de texto y VAE) que acompañan al transformer, así como las dependencias del pipeline de Diffusers.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/kepom/Wan2.2-T2V-A14B-Diffusers
- Modelo oficial T2V-A14B en HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Organización Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- Modelo oficial en ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-T2V-A14B
- Organización Wan-AI en ModelScope: https://modelscope.cn/organization/Wan-AI
- Repositorio de código e inferencia: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv:2503.20314): https://arxiv.org/abs/2503.20314
- Referencia adicional etiquetada por el autor (arXiv:2309.14509): https://arxiv.org/abs/2309.14509
- Sitio web del proyecto: https://wan.video
- Blog del proyecto: https://wan.video/welcome
- Discord de la comunidad: https://discord.gg/AKNgpMK4Yj
