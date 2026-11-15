# briaai/Fibo-lite

## Resumen

Fibo-lite es un modelo de generación de imágenes a partir de texto desarrollado por Bria AI, presentado como un adaptador LoRA sobre el modelo base briaai/FIBO. Su principal innovación es la aplicación de técnicas de destilación de guía (guidance distillation) y shortcutting flow matching para reducir drásticamente el número de pasos de inferencia necesarios, manteniendo una calidad visual competitiva. El modelo está pensado para escenarios donde la latencia importa: generación interactiva, prototipado rápido y pipelines de producción con requisitos estrictos de tiempo de respuesta.

El modelo cuenta con aproximadamente 8.280 millones de parámetros en formato safetensors y está diseñado para funcionar con la librería diffusers mediante la clase `BriaFiboPipeline`. Se distribuye con licencia CC BY-NC 4.0 (no comercial), lo que limita su uso a investigación y proyectos sin ánimo de lucro, y el acceso está restringido en Hugging Face: es necesario aceptar las condiciones del autor antes de descargarlo.

Su relevancia actual radica en la tendencia hacia modelos de difusión de pocos pasos (few-step) que compiten con alternativas como SDXL-Turbo o Flux Schnell, pero con la particularidad de ser un adaptador ligero sobre un modelo base más grande, lo que permite reutilizar la infraestructura existente de FIBO y reducir el coste de almacenamiento y despliegue en comparación con un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (flow matching con shortcutting), adaptador LoRA sobre briaai/FIBO |
| Parametros totales | 8.285.836.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no aplica contexto de tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY-NC 4.0 (no comercial) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

Fibo-lite se basa en el modelo de difusión briaai/FIBO, que emplea una formulación de flow matching. Sobre esta base, el adaptador LoRA introduce dos innovaciones clave: guidance distillation, que elimina la necesidad de classifier-free guidance en la inferencia (reduciendo el coste computacional por paso), y shortcutting flow matching, una técnica que permite al modelo predecir directamente trayectorias de integración más cortas, posibilitando la generación en pocos pasos (few-step). El resultado es un modelo que puede generar imágenes con un número reducido de evaluaciones de la función de red, lo que se traduce en menor latencia.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo está etiquetado con el paper arXiv:2511.06876, que presumiblemente contiene los detalles técnicos del entrenamiento, pero dichos datos no se han incluido en la información proporcionada.

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés.
- Inferencia en pocos pasos (few-step) gracias a la destilación de guía y al shortcutting flow matching, lo que reduce la latencia frente a modelos de difusión tradicionales.
- Compatibilidad con la librería `diffusers` mediante la pipeline `BriaFiboPipeline`.
- Al ser un adaptador LoRA, puede combinarse con el modelo base FIBO para aprovechar sus capacidades subyacentes.
- Soporte de texto-a-imagen como única modalidad; no se mencionan capacidades de visión, audio, tool calling ni agentes.
- Idioma de prompting: inglés (etiqueta `en`).

## Casos de uso

- Generación interactiva de imágenes en aplicaciones web o móviles: la reducción de pasos de inferencia permite tiempos de respuesta bajos, adecuados para previsualizaciones en tiempo real mientras el usuario escribe o ajusta el prompt.
- Prototipado rápido de conceptos visuales en estudios de diseño: los equipos pueden generar múltiples variaciones de una idea en segundos, facilitando la exploración creativa sin esperar largos tiempos de renderizado.
- Creación de contenido para redes sociales y marketing: generación de ilustraciones o banners a partir de descripciones textuales, con la ventaja de la licencia no comercial para proyectos internos o sin fines lucrativos.
- Investigación en modelos de difusión: el modelo sirve como caso de estudio de técnicas de destilación y few-step generation, permitiendo a investigadores reproducir y comparar metodologías.
- Generación de datasets sintéticos para entrenamiento de otros modelos de visión: al ser rápido, se pueden producir grandes volúmenes de imágenes etiquetadas en poco tiempo, aunque con la restricción de licencia no comercial.
- Educación y demostraciones técnicas: útil en talleres o charlas donde se necesita mostrar generación de imágenes en vivo sin infraestructura de GPU de altas prestaciones.
- Integración en pipelines de aumento de datos para tareas de visión por computador en entornos académicos, gracias a su licencia CC BY-NC 4.0 que permite uso no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 8.280 millones de parámetros, en precisión FP16 requeriría alrededor de 16,5 GB solo para los pesos, más overhead de activaciones y buffers. En cuantización de 8 bits podría reducirse a ~8-9 GB, y en 4 bits a ~5-6 GB, aunque no se dispone de datos oficiales de cuantización para este modelo.
- GPU recomendadas: para FP16 sin cuantización, se necesitan GPUs con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4, A100 40GB, H100). Para cuantización 8 bits, GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) podrían ser suficientes.
- ¿Cabe en consumer GPU? Sí, en GPUs de gama alta para consumidores (RTX 3090/4090 con 24 GB) en FP16; en GPUs de 12-16 GB probablemente requiera cuantización.
- Opciones de despliegue: `diffusers` con `BriaFiboPipeline` (soporte nativo), y posiblemente otras herramientas compatibles con diffusers como ComfyUI (no confirmado). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que están orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. La naturaleza few-step del modelo sugiere latencias bajas en comparación con modelos de difusión de 20-50 pasos, pero no se han proporcionado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fibo-lite | ~8.280 M | Few-step (destilado) | CC BY-NC 4.0 | Hugging Face (gated) |
| SDXL-Turbo | ~2.600 M (UNet) + VAE + text encoder | 1-4 pasos | MIT (no comercial en algunas versiones) | Hugging Face, abierto |
| Flux Schnell | ~12.000 M | 1-4 pasos | Apache 2.0 | Hugging Face, abierto |
| PixArt-Sigma | ~600 M | 20-50 pasos | OpenRAIL++ | Hugging Face, abierto |

No se dispone de datos de rendimiento comparativo (FID, CLIP score, etc.) para Fibo-lite, por lo que la comparación se limita a parámetros, licencia y disponibilidad. La licencia CC BY-NC 4.0 es más restrictiva que las licencias permisivas de SDXL-Turbo o Flux Schnell, lo que limita su uso comercial.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohíbe el uso comercial del modelo y de las imágenes generadas sin permiso explícito. Cualquier aplicación con fines de lucro requiere una licencia comercial separada de Bria AI.
- Acceso restringido en Hugging Face: es necesario aceptar las condiciones del autor, lo que puede retrasar la adopción en entornos automatizados.
- Idioma: solo se ha validado para inglés; el rendimiento con prompts en otros idiomas (incluido el castellano) es incierto y probablemente degradado.
- Sesgos conocidos: al ser un modelo de difusión entrenado con datos no especificados, puede reproducir sesgos de género, raza, cultura y estereotipos presentes en el dataset de entrenamiento. No se ha publicado información sobre mitigación de sesgos.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes incoherentes, anatómicamente incorrectas o con artefactos, especialmente en composiciones complejas o con múltiples objetos.
- Limitaciones de contexto: no aplica contexto de texto largo; la ventana de prompt efectiva no está documentada.
- Al ser un adaptador LoRA, su rendimiento depende del modelo base FIBO; cualquier limitación de FIBO se hereda.
- No se han publicado métricas de calidad (FID, CLIP score, etc.) en la información disponible, lo que dificulta la evaluación objetiva.
- El tamaño del repositorio (40,7 GB) incluye probablemente los pesos del modelo base o múltiples formatos, lo que puede requerir espacio de almacenamiento considerable.

## Enlaces

- Hugging Face: https://huggingface.co/briaai/Fibo-lite
- Modelo base: https://huggingface.co/briaai/FIBO
- Paper (arXiv): https://arxiv.org/abs/2511.06876
- Documentación de diffusers (BriaFiboPipeline): no disponible en la información proporcionada
- Repositorio o blog de Bria AI: no disponible en la información proporcionada
