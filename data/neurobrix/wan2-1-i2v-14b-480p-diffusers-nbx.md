# Neurobrix/Wan2.1-I2V-14B-480P-Diffusers-nbx

## Resumen

Wan2.1-I2V-14B-480P-Diffusers-nbx es una conversión y empaquetado del modelo de generación de vídeo a partir de imagen (image-to-video) Wan2.1-I2V-14B-480P de Wan-AI, publicada por Neurobrix bajo su propia librería de inferencia local. El modelo original es un modelo de difusión de 14.000 millones de parámetros orientado a generar clips de vídeo a resolución 480P a partir de una imagen de entrada y un prompt textual. Esta variante no modifica los pesos en cuanto a arquitectura, sino que los redistribuye para su ejecución con el stack Neurobrix, que emplea kernels Triton para acelerar la inferencia local.

La relevancia de esta ficha radica en que el repositorio es un ejemplo de reempaquetado de terceros de un modelo de difusión de vídeo grande: el tamaño del repo es de 90,6 GB, lo que refleja pesos en precisión completa o semi-precisión (probablemente bf16/fp16) y no una cuantización agresiva. La licencia declarada es Apache 2.0, pero el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face, lo cual conviene verificar antes de integrarlo en un pipeline de producción.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni resultados de benchmarks en la información proporcionada. Los datos de arquitectura interna del modelo original (tipo de backbone de difusión, VAE, encoder de texto) no se detallan en la ficha de Hugging Face consultada, por lo que se indican como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para image-to-video (detalle interno no disponible) |
| Parametros totales | 14B (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de tokens de texto de forma estándar) |
| Tipos de cuantizacion | no disponible (repo de 90,6 GB, compatible con pesos bf16/fp16; cuantizaciones GGUF/INT8 no confirmadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos para la librería Neurobrix (formato nbx); pesos base derivados de Diffusers; safetensors/GGUF no confirmados |
| Resolución de salida | 480P |
| Tarea | Image-to-video |
| Librería | neurobrix |
| Tamaño del repo | 90,6 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo base Wan2.1-I2V-14B-480P es un modelo de difusión para generación de vídeo condicionada por imagen, con 14.000 millones de parámetros. La variante -nbx de Neurobrix mantiene los pesos del modelo original y los adapta al formato de la librería Neurobrix, que según los tags del repositorio utiliza Triton para la inferencia local. No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO; estos datos deben consultarse en la ficha del modelo base Wan-AI/Wan2.1-I2V-14B-480P-Diffusers.

La innovación técnica destacable de esta variante es el empaquetado para inferencia local con kernels Triton, que busca reducir la dependencia de frameworks de difusión genéricos y optimizar la ejecución en hardware local. No se documentan en la información disponible técnicas como decodificación especulativa, atención lineal o variantes de muestreo específicas.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) con resolución 480P.
- Condicionamiento por prompt textual además de la imagen de referencia.
- Ejecución local mediante la librería Neurobrix con kernels Triton.
- Compatibilidad con el ecosistema Diffusers a través del modelo base del que deriva.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusión de vídeo).
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales como thinking mode, visión general o audio.

## Casos de uso

- Prototipado de vídeo generativo local: usar el modelo para animar imágenes fijas en un entorno de desarrollo con GPU propia, aprovechando el empaquetado Neurobrix para evitar dependencias pesadas de frameworks de difusión.
- Generación de clips publicitarios cortos: a partir de una imagen de producto, generar un clip de 480P para pruebas de concepto y maquetas antes de producir el vídeo final con herramientas de mayor resolución.
- Previsualización de storyboards: animar fotogramas clave de un guion gráfico para validar ritmo y composición antes del rodaje o de la producción 3D.
- Creación de contenido para redes sociales: generar variaciones animadas de una imagen de marca en 480P, adecuadas para formatos verticales u horizontales de baja resolución.
- Investigación en difusión de vídeo: servir como punto de partida reproducible para experimentos de image-to-video con un modelo de 14B y licencia Apache 2.0, comparando el rendimiento del stack Neurobrix frente a Diffusers estándar.
- Automatización de contenido educativo: animar diagramas o ilustraciones estáticas para materiales docentes, con la ventaja de que la inferencia puede ejecutarse en infraestructura local sin enviar imágenes a servicios en la nube.
- Integración en pipelines de postproducción: usar el modelo como etapa de generación de metraje de relleno (b-roll) a partir de imágenes de archivo, siempre que la resolución 480P sea suficiente para el destino final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 90,6 GB, lo que sugiere pesos en bf16/fp16. Para cargar el modelo completo se necesitan del orden de 80-90 GB de VRAM o el uso de offloading a CPU/RAM; no se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponibles de forma oficial. Por tamaño, un modelo de 14B en precisión completa requiere GPUs de clase数据中心 (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- ¿Cabe en consumer GPU? No de forma directa en precisión completa. Podría caber en GPUs de 24 GB (RTX 4090) solo con cuantización u offloading, pero no se confirman cuantizaciones oficiales para esta variante.
- Opciones de despliegue: librería Neurobrix (con Triton) según los tags del repo; compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada y, en general, estos motores no están orientados a modelos de difusión de vídeo. Diffusers podría ser una vía alternativa usando el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Resolución | Licencia | Acceso |
|---|---|---|---|---|---|
| Wan2.1-I2V-14B-480P-Diffusers-nbx (este) | 14B | Image-to-video | 480P | Apache 2.0 | Gated |
| Wan-AI/Wan2.1-I2V-14B-480P-Diffusers (base) | 14B | Image-to-video | 480P | Apache 2.0 | No disponible en la información |
| Otros modelos image-to-video de la familia Wan2.1 | no disponible | Image-to-video | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede bloquear automatizaciones y pipelines de CI.
- Repositorio de 90,6 GB: requiere almacenamiento considerable y tiempos de descarga largos; no apto para entornos con cuotas de disco ajustadas.
- Es un reempaquetado de terceros (Neurobrix) del modelo de Wan-AI; la calidad y el soporte dependen del mantenedor de la variante, no del equipo original.
- La licencia Apache 2.0 se declara en los tags, pero conviene verificar los términos exactos del modelo base y del reempaquetado antes de uso comercial.
- Resolución limitada a 480P: no adecuado para producción final en alta definición sin upscaling posterior.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni limitaciones idiomáticas en la información disponible.
- No se confirman cuantizaciones oficiales ni compatibilidad con motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue.
- Al ser un modelo de difusión de vídeo, no aplican consideraciones de tool calling ni agentes; no debe evaluarse con los mismos criterios que un LLM.

## Enlaces

- Hugging Face: https://huggingface.co/Neurobrix/Wan2.1-I2V-14B-480P-Diffusers-nbx
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P-Diffusers
- Repositorio de Wan2.1 en GitHub: no disponible en la información proporcionada
- Paper de Wan2.1: no disponible en la información proporcionada
- Demo o blog oficial: no disponible en la información proporcionada
