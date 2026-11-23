# amd/sdxl-turbo_m1.0_npu

## Resumen

`amd/sdxl-turbo_m1.0_npu` es una conversión al formato ONNX del modelo SDXL Turbo, publicada por AMD y orientada a la inferencia sobre NPUs (unidades de procesamiento neuronal) de sus plataformas. SDXL Turbo es un modelo de difusion texto-a-imagen derivado de SDXL que emplea la tecnica de destilacion adversarial (ADD, Adversarial Diffusion Distillation) para generar imagenes en un unico paso de muestreo, en lugar de los 20-50 pasos habituales de los modelos de difusion convencionales.

El repositorio, de 20,8 GB, contiene los pesos en ONNX preparados para ejecutarse en hardware de aceleracion de AMD, lo que lo convierte en una pieza relevante para quienes despliegan generacion de imagenes en entornos de borde o en equipos con NPU integrada, donde los frameworks de difusion tradicionales basados en PyTorch no aprovechan dichos aceleradores. La ficha del modelo esta sujeta a acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

La relevancia actual del modelo reside en la combinacion de dos factores: la latencia reducida de SDXL Turbo (un solo paso) y la exportacion a ONNX para ejecucion en NPU, lo que habilita generacion de imagenes interactiva en tiempo real sobre equipos de consumo con hardware AMD, sin depender de GPUs discretas de gran VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet) derivada de SDXL, destilada con Adversarial Diffusion Distillation; exportada a ONNX |
| Parametros totales | no disponible (el repositorio no publica el recuento; SDXL base ronda los 2.600 M en la UNet y ~817 M en el text encoder, dato no confirmado para esta conversion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; el text encoder CLIP tiene un limite de 77 tokens por prompt) |
| Tipos de cuantizacion | no disponible (el repositorio no detalla las variantes incluidas; el formato ONNX permite FP32, FP16 e INT8, pero no se confirma cuales se distribuyen) |
| Idiomas soportados | en (ingles) |
| Licencia | stabilityai-ai-community (etiquetada como `license:other` en la ficha) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es SDXL Turbo, una variante de SDXL entrenada con Adversarial Diffusion Distillation. Esta tecnica combina una perdida adversarial, que evalua la fidelidad perceptual de la imagen generada, con una perdida de destilacion de puntuacion que ancla el resultado al espacio del modelo profesor (SDXL). El resultado es un modelo capaz de producir imagenes coherentes en un unico paso de denoising, lo que reduce drasticamente el coste computacional por imagen frente a los pipelines de difusion clasicos.

La arquitectura interna mantiene los componentes de SDXL: una UNet con bloques de atencion y mecanismos de condicionamiento por resolucion y recorte, y un par de text encoders CLIP (uno de ellos OpenCLIP ViT-bigG). La aportacion de AMD en este repositorio es la conversion a ONNX de dichos componentes y su empaquetado para ejecucion en NPU. No se dispone de informacion en la documentacion proporcionada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni la existencia de fases adicionales de RLHF o DPO, que en modelos de difusion no son el mecanismo habitual.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales en ingles (text-to-image).
- Generacion en un unico paso de muestreo, lo que habilita flujos interactivos de baja latencia.
- Resolucion de salida propia de SDXL (1024x1024 como referencia del modelo base; no confirmada para esta conversion).
- Ejecucion sobre NPU mediante el runtime ONNX, con el consiguiente ahorro energetico frente a GPU discreta.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagenes, no un modelo de lenguaje.
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales de comprension.
- Soporte multilingue limitado al ingles en los prompts, heredado de los text encoders CLIP.

## Casos de uso

- Generacion de imagenes interactiva en portatiles con NPU AMD: el modelo permite previsualizar resultados mientras el usuario escribe o ajusta el prompt, gracias a la inferencia en un solo paso sobre la NPU y sin ocupar la GPU integrada.
- Prototipado rapido de conceptos visuales en estudios de diseno: los equipos pueden iterar decenas de variaciones por minuto en hardware de sobremesa, reduciendo el tiempo de exploracion creativa.
- Generacion de miniaturas y assets para aplicaciones web: integrado en un servicio local, produce imagenes de portada o placeholders a partir de metadatos textuales con bajo consumo energetico.
- Demostraciones y entornos educativos de difusion: al ser ONNX y ejecutable en NPU, sirve para ilustrar el funcionamiento de la destilacion adversarial en hardware accesible, sin necesidad de GPUs de datacenter.
- Generacion de imagenes offline en entornos con requisitos de privacidad: al ejecutarse localmente sobre el equipo del usuario, los prompts no abandonan la maquina, lo que encaja en sectores regulados.
- Pruebas de concepto de pipelines ONNX en produccion: permite validar la cadena de preprocesado de texto, inferencia y postprocesado de imagen antes de escalar a un despliegue mayor.
- Creacion de contenido para videojuegos indie: generacion de texturas conceptuales o arte de referencia en el propio puesto de trabajo del artista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, la ejecucion de SDXL Turbo en FP16 requiere del orden de 8-10 GB en GPU; la version ONNX para NPU esta pensada para ejecutarse en memoria unificada del sistema, no en VRAM dedicada.
- GPU recomendadas: no aplica de forma directa; el modelo esta orientado a NPUs de AMD. Para ejecucion en GPU se emplearian los pesos ONNX con un runtime compatible (por ejemplo, ONNX Runtime con EP de CUDA o DirectML), aunque no se documenta soporte oficial.
- Cabe en GPU de consumo: previsiblemente si en modelos con 8 GB o mas de VRAM en FP16, pero el dato no esta confirmado para esta conversion concreta.
- Opciones de despliegue: ONNX Runtime (con execution provider para NPU), y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a difusion.
- Latencia y throughput: no disponibles. La ventaja teorica del modelo es la generacion en un unico paso, pero no se aportan cifras medidas sobre NPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Pasos de muestreo | Licencia | Formato |
|---|---|---|---|---|---|
| amd/sdxl-turbo_m1.0_npu | no disponible | 1024x1024 (referencia SDXL) | 1 | stabilityai-ai-community | ONNX |
| SDXL Turbo (Stability AI) | ~3.500 M (UNet + encoders) | 1024x1024 | 1 | stabilityai-ai-community | safetensors |
| SDXL base 1.0 | ~3.500 M | 1024x1024 | 20-50 | CreativeML Open RAIL++-M | safetensors |
| SD 1.5 | ~983 M | 512x512 | 20-50 | CreativeML Open RAIL-M | safetensors |

La diferencia principal frente a las alternativas no es de calidad ni de tamano, sino de formato y destino de ejecucion: esta es la unica de las opciones listadas empaquetada en ONNX y orientada explicitamente a NPU. Frente a SDXL base, Turbo sacrifica parte de la fidelidad y el control fino (menor variedad compositiva, menor adherencia a prompts complejos) a cambio de una reduccion de uno o dos ordenes de magnitud en el coste de inferencia.

## Limitaciones y advertencias

- Acceso restringido: la descarga exige aceptar las condiciones en Hugging Face, lo que puede bloquear automatizaciones y pipelines de CI sin gestion de credenciales.
- Licencia `stabilityai-ai-community`: conviene revisar los terminos concretos antes de un uso comercial, ya que imponen restricciones y obligaciones de atribucion que no coinciden con las licencias permisivas tipo Apache o MIT.
- Solo ingles: los prompts en castellano produciran resultados degradados o incoherentes.
- La generacion en un solo paso reduce la adherencia a prompts complejos y la diversidad de composiciones; para escenas con multiples objetos o relaciones espaciales precisas el resultado suele ser inferior al de modelos con mas pasos.
- Riesgo de sesgos heredados de los datos de entrenamiento de SDXL: representaciones estereotipadas de personas y culturas, y dificultades con conceptos poco representados.
- Riesgo de alucinacion visual: el modelo puede generar detalles plausibles pero incorrectos, texto ilegible y anatomias deformadas; no es adecuado para documentacion factual ni para generar graficos con datos.
- La documentacion sobre cuantizaciones incluidas, requisitos exactos de NPU y versiones de runtime es escasa; la integracion en produccion requerira validacion propia.
- El repositorio registra cero descargas y cero likes, lo que sugiere una adopcion muy limitada y, por tanto, escasa validacion comunitaria de su funcionamiento.
- No esta pensado para tareas de comprension de imagenes, clasificacion ni generacion de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/sdxl-turbo_m1.0_npu
- SDXL Turbo (modelo base de Stability AI): https://huggingface.co/stabilityai/sdxl-turbo
- Paper de Adversarial Diffusion Distillation: https://arxiv.org/abs/2311.17042
- SDXL (paper): https://arxiv.org/abs/2307.01952
- ONNX Runtime: https://onnxruntime.ai/
