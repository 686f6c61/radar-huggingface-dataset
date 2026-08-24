# Perflow-Shuai/Wan2.2-5B-NonAR-DMD-4Step-LoRA-r64-iter1600-SLT-AR-30s-Local32-Sink8-iter2450

## Resumen

Este repositorio contiene un checkpoint de *streaming-long-tuning* basado en una LoRA de rango 64 sobre el modelo Wan2.2-TI2V-5B, desarrollado por Perflow-Shuai. El objetivo es permitir la generación de vídeos de aproximadamente 30 segundos (184 *latent frames* a 24 FPS tras decodificación) mediante una arquitectura de estudiante autorregresiva con atención local de ventana 32 y *sink* 8, mientras que el profesor y el crítico usan atención no causal. El entrenamiento emplea destilación DMD de 4 pasos de denoising, lo que reduce drásticamente el coste de inferencia frente a los métodos de difusión tradicionales.

La relevancia de este modelo radica en que aborda uno de los principales retos de la generación de vídeo por IA: producir secuencias largas y coherentes con recursos computacionales limitados. Al combinar una LoRA ligera (1,3 GB) con una técnica de atención local y *streaming*, se puede extender la capacidad de Wan2.2-5B sin necesidad de reentrenar el modelo base completo. Es un trabajo experimental orientado a la investigación y a la optimización de inferencia en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Wan2.2-TI2V-5B (estudiante autorregresivo, atención local ventana 32 con sink 8) |
| Parametros totales | no disponible (LoRA r64, pesos del generador y del crítico) |
| Parametros activos | no disponible |
| Longitud de contexto | 184 *latent frames* (aprox. 30 s a 24 FPS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en Wan2.2-TI2V-5B, un modelo de difusión texto-a-vídeo de 5 mil millones de parámetros que utiliza un VAE con compresión 16×16×4 y soporta generación a 720P y 24 FPS. Sobre esta base, la LoRA aquí presentada introduce un esquema de *streaming-long-tuning*: el estudiante es una variante causal/autorregresiva que procesa la secuencia de *latent frames* con una ventana de atención local de 32 posiciones y 8 *sink tokens*, mientras que el profesor y el crítico mantienen atención no causal completa. Esta configuración permite generar vídeos de hasta 184 *latent frames* (unos 30 segundos) sin explotar la memoria durante la inferencia.

El entrenamiento utiliza destilación DMD (Distribution Matching Distillation) con 4 pasos de denoising, lo que acelera la generación en comparación con los métodos de difusión iterativos estándar. El checkpoint corresponde a la iteración 2450, con EMA deshabilitado. El repositorio incluye únicamente los pesos de la LoRA del generador y del crítico; el estado del optimizador se ha excluido deliberadamente del export a Hugging Face, por lo que el checkpoint local de entrenamiento es la fuente de verdad para reanudar el proceso.

## Capacidades

- Generación de vídeo texto-a-vídeo de hasta ~30 segundos a 24 FPS, con resolución típica de 720P (según el modelo base).
- Inferencia en 4 pasos de denoising gracias a la destilación DMD, reduciendo la latencia frente a métodos de difusión de 20-50 pasos.
- Atención local con ventana 32 y *sink* 8, lo que permite procesar secuencias largas con un coste de memoria acotado.
- Arquitectura autorregresiva del estudiante, adecuada para generación *streaming* o *frame a frame*.
- No se han documentado capacidades de *tool calling*, agentes, visión multimodal ni soporte multilingüe específico.

## Casos de uso

- **Generación de vídeos largos para prototipado creativo**: permite a diseñadores y artistas generar clips de 30 segundos con coherencia temporal, útil para *moodboards* o previsualizaciones en publicidad y cine.
- **Investigación en generación de vídeo eficiente**: sirve como banco de pruebas para técnicas de *streaming-long-tuning* y destilación DMD, comparables con otros LoRAs del mismo autor (iter1600, SCOPE).
- **Producción de contenido educativo**: creación de vídeos explicativos cortos (hasta 30 s) a partir de descripciones textuales, con un coste de inferencia reducido que permite iterar rápidamente.
- **Aumento de datos sintéticos**: generación de secuencias de vídeo etiquetadas para entrenar otros modelos de visión o vídeo, aprovechando la capacidad de generar múltiples variantes con diferentes *prompts*.
- **Despliegue en entornos con recursos limitados**: al ser una LoRA ligera sobre un modelo de 5B, puede ejecutarse en GPUs de consumo como la RTX 4090 (según el modelo base), facilitando la experimentación local.
- **Optimización de pipelines de vídeo en tiempo real**: la inferencia en 4 pasos y la atención local permiten integrar el modelo en sistemas de generación *streaming* o *live*, aunque la latencia exacta no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas cuantitativas (FVD, CLIP score, etc.) ni comparaciones con otros modelos en la model card ni en los repositorios asociados.

## Requisitos de hardware

- **VRAM estimada**: no disponible específicamente para esta LoRA. Depende del modelo base Wan2.2-TI2V-5B; según el repositorio de Madxthree, el modelo base puede ejecutarse en una RTX 4090 (24 GB VRAM) con cuantización adecuada.
- **GPU recomendadas**: RTX 4090, A100, H100, o GPUs de consumo con al menos 16-24 GB de VRAM para el modelo base más la LoRA.
- **Compatibilidad con consumer GPU**: sí, si se usa el modelo base cuantizado (FP8 o GGUF) y se carga la LoRA adicional.
- **Opciones de despliegue**: no se especifican, pero al ser un LoRA para Wan2.2, es compatible con frameworks como Diffusers, ComfyUI o vLLM (si soporta LoRA). También podría usarse con llama.cpp si se convierte a GGUF, aunque no está confirmado.
- **Latencia y throughput**: no disponibles. La destilación DMD de 4 pasos sugiere una inferencia mucho más rápida que los modelos de difusión estándar, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Base | Rango LoRA | Iteración | Longitud de vídeo | Pasos de denoising | Notas |
|---|---|---|---|---|---|---|
| Este modelo (iter2450) | Wan2.2-TI2V-5B | 64 | 2450 | 184 frames (~30 s) | 4 | *Streaming-long-tuning* con atención local y sink |
| Perflow-Shuai/Wan2.2-5B-NonAR-DMD-4Step-LoRA-r64-iter1600 | Wan2.2-TI2V-5B | 64 | 1600 | no disponible | 4 | LoRA de inferencia para comparación de rangos |
| Perflow-Shuai/SCOPE-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r32-iter2000 | SCOPE (modelo de mundo condicionado por acciones) | 32 | 2000 | no disponible | 4 | Aplicar solo a SCOPE, no a Wan2.2 vanilla |
| Wan2.2-TI2V-5B-Turbo (GitHub) | Wan2.2-TI2V-5B | - | - | 121 frames (~5 s) | 4 | Versión destilada oficial, sin LoRA, resolución 1280×704 |

La comparación se limita a otros LoRAs del mismo autor y a la versión Turbo del modelo base. No hay datos de rendimiento cuantitativo para establecer una jerarquía objetiva.

## Limitaciones y advertencias

- **Naturaleza experimental**: es un checkpoint de investigación en iteración 2450, sin validación exhaustiva ni garantías de estabilidad en producción.
- **Licencia no disponible**: no se especifica la licencia de uso, lo que impide determinar si es permitido el uso comercial o la redistribución.
- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero al ser un modelo de generación de vídeo, puede producir contenido incoherente o no deseado, especialmente en escenas complejas o con *prompts* ambiguos.
- **Dependencia del modelo base**: la LoRA solo funciona sobre Wan2.2-TI2V-5B; no es un modelo autónomo. Requiere descargar y cargar el modelo base por separado.
- **Limitaciones de contexto**: la ventana de atención local de 32 tokens con *sink* 8 puede degradar la coherencia global en vídeos muy largos o con movimientos rápidos, aunque el diseño busca mitigarlo.
- **Idiomas**: no se especifican idiomas soportados; el modelo base Wan2.2 probablemente esté entrenado principalmente en inglés y chino, pero no hay confirmación.
- **Formato de pesos**: no se indica si los pesos están en safetensors, GGUF u otro formato, lo que puede complicar la integración en ciertos frameworks.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Perflow-Shuai/Wan2.2-5B-NonAR-DMD-4Step-LoRA-r64-iter1600-SLT-AR-30s-Local32-Sink8-iter2450
- Repositorio del LoRA iter1600 (comparación de rangos): https://huggingface.co/Perflow-Shuai/Wan2.2-5B-NonAR-DMD-4Step-LoRA
- Repositorio del LoRA SCOPE: https://huggingface.co/Perflow-Shuai/SCOPE-Wan2.2-5B-NonAR-DMD-4Step-LoRA-r32-iter2000
- GitHub de Wan2.2-TI2V-5B-Turbo: https://github.com/quanhaol/Wan2.2-TI2V-5B-Turbo
- GitHub de Madxthree/wan2.2 (información del modelo base): https://github.com/Madxthree/wan2.2
- Tutorial sobre Wan2.2 (FP16/FP8/GGUF): https://www.stablediffusiontutorials.com/2025/08/wan-2.2-video-generation.html
