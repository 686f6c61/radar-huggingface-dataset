# krishgolcha/minsky-01-videogen-release

## Resumen

Minsky-01 VideoGen es una redistribución con marca propia del checkpoint Kandinsky 6.0 Lite Distilled, un modelo de difusión para generación conjunta de vídeo y audio sincronizado a partir de texto o imagen. Lo publica el usuario krishgolcha bajo el paraguas de "Minsky Machines", con el objetivo declarado de experimentar en flujos de trabajo de vídeo para recursos humanos, reclutamiento y marketing empresarial. No aporta pesos nuevos: los 3.177.988.112 parámetros (unos 3,18B) son una copia sin modificar del modelo original de Team Kandinsky.

El modelo subyacente pertenece a la familia Kandinsky 6.0, que incluye una variante Lite de 3B y una Pro de 29B. Ambos generan clips de 5 segundos con audio a 44 kHz, con soporte de lip-sync, en modos texto-a-vídeo-audio (T2AV) e imagen-a-vídeo-audio (TI2AV). La versión destilada que se redistribuye aquí emplea el scheduler PiFlow y muestrea en 10 pasos con guidance 1.0, lo que reduce el coste de inferencia frente a un muestreo completo.

La relevancia de esta ficha es doble: por un lado documenta una redistribución de licencia MIT con verificación limitada (los propios autores advierten que no han probado la inferencia ni hecho benchmarks), y por otro sirve de puerta de entrada a las especificaciones del modelo original Kandinsky 6.0 Lite, que sí cuenta con paper, demo y soporte en Diffusers, vLLM, SGLang, FastVideo y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (backbone generativo) para vídeo y audio; pipeline `Kandinsky6TI2VAPipeline` en Diffusers |
| Parametros totales | 3.177.988.112 (~3,18B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; clips de 5 s, 121 frames a 24 fps) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de carga usa `torch_dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (conservar avisos upstream y revisar licencias de componentes) |
| Formato de pesos | safetensors (10 archivos; repo de 26,7 GB) |

## Arquitectura y entrenamiento

El modelo es un sistema de difusión para generación conjunta de vídeo y audio, no un transformer autorregresivo. El pipeline `Kandinsky6TI2VAPipeline` de Diffusers orquesta los componentes que producen vídeo de 5 segundos a 24 fps con audio sincronizado a 44 kHz, incluyendo lip-sync. La variante Lite destilada muestrea en 10 pasos con el scheduler PiFlow y guidance 1.0, lo que la sitúa en el régimen de pocos pasos típico de los modelos destilados para producción.

Sobre el entrenamiento, esta redistribución no aporta información nueva: los pesos son una copia sin cambios del checkpoint `kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers`. Minsky declara explícitamente que no ha realizado entrenamiento adicional, fine-tuning ni destilación, y que el desarrollo y la destilación originales corresponden a Team Kandinsky. El repositorio añade helpers de flujo de trabajo, código de entrenamiento experimental y documentación, pero no nuevas capacidades del modelo. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens o las etapas de alineación del modelo original.

## Capacidades

- Generación de vídeo a partir de texto (T2AV) con audio sincronizado.
- Generación de vídeo a partir de imagen (TI2AV) con audio sincronizado.
- Clips de 5 segundos a 24 fps; el ejemplo de la model card usa 864 x 480 y 121 frames.
- Audio a 44 kHz generado conjuntamente con el vídeo, incluyendo lip-sync.
- Muestreo eficiente en 10 pasos con PiFlow y guidance 1.0 (checkpoint destilado).
- Soporte de superresolución plug-in en la familia Kandinsky 6.0 para alcanzar Full-HD (1920x1080); no se confirma que esta redistribución incluya ese componente.
- Integración con Diffusers mediante `Kandinsky6TI2VAPipeline`, con `enable_model_cpu_offload()` para gestión de memoria.
- Ecosistema de despliegue del modelo original: vLLM (vLLM-Omni), SGLang, FastVideo y ComfyUI.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no aplica a un modelo de difusión de vídeo.

## Casos de uso

- Vídeo corporativo para RR. HH.: generar clips de bienvenida o presentación de equipos con prompt de texto y audio ambiente, tal como propone el ejemplo de la model card (oficina moderna, equipo recibiendo a un nuevo compañero). Adecuado por su clip corto de 5 s y su audio sincronizado, pensado para ensamblarse después en un editor.
- Marketing de producto: producir variaciones rápidas de clips de 5 s a partir de una imagen de referencia (modo TI2AV) para pruebas A/B de creatividades, aprovechando el muestreo en 10 pasos para iterar con bajo coste.
- Reclutamiento y employer branding: generar vídeos de ambiente de oficina o de puestos de trabajo para anuncios de empleo, añadiendo después el texto exacto de los requisitos y la marca en una etapa de edición separada, como recomienda el autor.
- Prototipado de storyboards: convertir guiones e imágenes fijas en previsualizaciones animadas de 5 s con sonido para validar una idea antes de producir con un equipo humano.
- Generación de contenido para redes sociales: clips verticales u horizontales cortos con audio integrado, generados por lotes mediante el runner de GPU que el repositorio incluye en `ENTERPRISE.md`.
- Investigación en generación audiovisual: usar el checkpoint como base para experimentar con LoRA de vídeo; el repositorio incluye un entrenador LoRA experimental, aunque dirigido al modelo base no destilado de Kandinsky Lite, no a estos pesos destilados.
- Evaluación de pipelines de difusión: servir el modelo con vLLM-Omni, SGLang o FastVideo para medir latencia y throughput en infraestructura propia, dado que el autor no publica benchmarks de esta redistribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta redistribución no ha sido probada en inferencia ni sometida a benchmarks. La validación realizada se limita a nueve tests de CPU (incluido un paso de optimizador LoRA con modelo diminuto y recarga de adaptador), importación de todas las clases de componentes, instanciación de la arquitectura completa del transformer en `meta device` y verificación de los SHA-256 de los 10 archivos de pesos contra el upstream. No es una carga completa del checkpoint ni una prueba de calidad de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~3,18B parámetros en bfloat16, los pesos ocupan aproximadamente 6,4 GB; el pipeline completo (VAE, audio, text encoder y componentes auxiliares) requiere bastante más, y el repo pesa 26,7 GB. El ejemplo oficial usa `enable_model_cpu_offload()`, lo que sugiere que la carga completa no cabe cómodamente en GPUs de consumo sin offloading.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son candidatas razonables, pero el autor no publica requisitos ni pruebas.
- ¿Cabe en GPU de consumo? No confirmado. El uso de CPU offload en el ejemplo apunta a que se necesita gestión explícita de memoria incluso en GPUs de gama alta de consumo.
- Opciones de despliegue: Diffusers (`Kandinsky6TI2VAPipeline`), vLLM (vLLM-Omni), SGLang, FastVideo y ComfyUI, según los enlaces del modelo original. No se menciona soporte de llama.cpp ni Ollama, esperable al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El muestreo en 10 pasos con PiFlow reduce el número de evaluaciones del backbone frente a un sampler completo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minsky-01 VideoGen (esta ficha) | ~3,18B | Clips de 5 s, 24 fps | Sí, 44 kHz, lip-sync | MIT | Hugging Face, 0 descargas |
| Kandinsky 6.0 Lite Distilled (upstream) | ~3B | Clips de 5 s, 24 fps | Sí, 44 kHz, lip-sync | MIT | Hugging Face, demo y soporte en Diffusers/vLLM/SGLang/FastVideo/ComfyUI |
| Kandinsky 6.0 Pro | 29B | Clips de 5 s, 24 fps; superresolución a 1920x1080 | Sí, 44 kHz, lip-sync | no disponible en la información | Hugging Face (demo Pro) |

No se dispone en la información proporcionada de datos de benchmarks ni de otros modelos comparables de la misma categoría (generación conjunta de vídeo y audio) para ampliar la comparativa con cifras de rendimiento.

## Limitaciones y advertencias

- Redistribución sin validación: el autor declara que no ha probado la inferencia ni hecho benchmarks; la verificación se limita a hashes e importación de componentes.
- Sin entrenamiento adicional: no hay fine-tuning, destilación ni adaptadores nuevos; cualquier mejora de calidad respecto al upstream no está demostrada.
- No es un producto completo: es un modelo de clips cortos, no una solución de vídeo para RR. HH.; el texto exacto de políticas, subtítulos, requisitos de puesto y activos de marca deben añadirse en una etapa de edición posterior.
- Riesgo de alucinación visual y de contenido: como todo modelo generativo, puede producir artefactos, texto ilegible o escenas incoherentes; revisar el contenido antes de uso empresarial.
- Sesgos: no documentados en la información disponible; cabe esperar los sesgos del dataset de entrenamiento del modelo original, sobre el que no se aportan detalles.
- Idiomas: no disponibles; no se especifica qué idiomas soporta el texto de los prompts.
- Licencia: MIT, pero el autor advierte de conservar los avisos upstream y revisar las licencias de los componentes individuales del pipeline.
- Duración y resolución limitadas: 5 segundos por clip; la resolución Full-HD depende de un modelo de superresolución plug-in que no se confirma incluido en esta redistribución.
- Entrenador LoRA: el incluido apunta al modelo base no destilado de Kandinsky Lite, no a estos pesos destilados, por lo que no sirve directamente para personalizar esta release.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krishgolcha/minsky-01-videogen-release
- Modelo base upstream: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers
- Paper de Kandinsky 6.0: https://arxiv.org/pdf/2610.05608
- Página de modelos de vídeo de KandinskyLab: https://kandinskylab.ai/models/video/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/kandinskylab/Kandinsky-6.0-Pro-distill-5s
- Documentación de Diffusers del pipeline Kandinsky 6: https://huggingface.co/docs/diffusers/main/en/api/pipelines/kandinsky6
- Documentación de vLLM-Omni para Kandinsky 6: https://docs.vllm.ai/projects/vllm-omni/en/latest/api/vllm_omni/diffusion/models/kandinsky6/
- Cookbook de SGLang para Kandinsky 6: https://docs.sglang.io/cookbook/diffusion/Kandinsky/Kandinsky6
- FastVideo, inferencia de Kandinsky 6: https://haoailab.com/FastVideo/inference/kandinsky6/
- Nodo de ComfyUI para Kandinsky 6: https://registry.comfy.org/nodes/kandinsky6
