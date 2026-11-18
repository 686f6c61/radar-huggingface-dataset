# gguf-org/qwen-image-2.1-gguf

## Resumen

Qwen-Image-2.1-GGUF es una cuantización en formato GGUF del modelo de difusión Qwen/Qwen-Image-2.1, publicada por el usuario gguf-org. No se trata de un modelo de lenguaje, sino de un modelo generativo de imágenes (text-to-image e image-to-image) empaquetado para su uso con motores de inferencia ligeros como ggk o nodos GGUF de ComfyUI. El repositorio incluye pesos del transformador de difusión en variantes nvfp4, el VAE, codificadores de texto alternativos (pig-clip con adaptador, qwen3vl-8b en cuantizaciones q4_k_m y nvfp4) y un proyector multimodal mmproj para edición de imágenes.

La relevancia de esta publicación radica en que permite ejecutar un modelo de generación de imágenes de la familia Qwen en hardware de consumo modesto: el autor reporta pruebas en una GPU de portátil RTX 4050 con 6 GB de VRAM, con tiempos de generación de 4 pasos en torno a 13-17 segundos según el codificador de texto empleado. El repositorio ocupa 21,5 GB e incluye flujos de trabajo JSON listos para ComfyUI, tanto para texto a imagen como para edición.

No se dispone de información sobre la licencia del paquete ni del modelo base en la información proporcionada, ni de los idiomas soportados, la longitud de contexto o los parámetros del transformador de difusión. El dato de parámetros reportado en safetensors (337.740.404) corresponde presumiblemente a los componentes auxiliares incluidos, no al modelo de difusión completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (transformador de difusion) con VAE y codificador de texto multimodal Qwen3-VL-8B; no disponible el detalle interno |
| Parametros totales | 337.740.404 (dato de safetensors del repo; no representa el transformador de difusion completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | nvfp4 (transformador de difusion y codificador all-in-one), q4_k_m (codificador qwen3vl-8b-it), q8_0 (mmproj), bf16 y fp32-f16 (VAE) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El paquete distribuye un modelo de difusión para generación de imágenes en formato GGUF, acompañado de un VAE (pig_qwen_image_2.1_vae en bf16 o fp32-f16) y de un codificador de texto basado en Qwen3-VL-8B. Se ofrecen dos rutas de codificación: una alternativa ligera denominada pig-clip con un adaptador (pig_qwen3vl_8b_adapter-f16.gguf), pensada para velocidad o VRAM reducida, y el codificador Qwen3-VL-8B completo en q4_k_m o nvfp4. Para edición de imágenes se añade un proyector multimodal mmproj-qwen3vl-8b-it-q8_0.gguf.

El flujo de inferencia documentado usa muestreo Euler con atención flash en el difusor (--diffusion-fa) y permite configurar pasos, escala CFG y una secuencia de sigmas personalizada. El autor incluye una configuración "turbo" de 8 pasos con sigmas explícitas (1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0.0) y CFG 1, y una configuración de edición de 4 pasos con CFG 1.00. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO u otras etapas de alineación.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable mediante los parámetros -W y -H (el ejemplo usa 512x512).
- Edición de imágenes guiada por prompt (image-to-image) usando una imagen de referencia (--ref-image) y el proyector mmproj.
- Soporte de prompts largos y descriptivos, incluyendo texto renderizado dentro de la imagen (el ejemplo del autor incluye un cartel con texto en cursiva).
- Generación rápida en modo turbo con 8 pasos y secuencias de sigmas predefinidas.
- Compatibilidad con dos backends: el motor ggk diffuser y nodos GGUF en ComfyUI, con flujos de trabajo JSON proporcionados.
- Selección intercambiable de codificador de texto para equilibrar velocidad, VRAM y fidelidad.
- No se documentan capacidades de tool calling, agentes, audio ni razonamiento multi-paso, al no ser un modelo de lenguaje.

## Casos de uso

- Prototipado rápido de ilustración: con la configuración turbo de 8 pasos y CFG 1, un equipo puede generar borradores visuales en segundos en una GPU de portátil, lo que permite iterar sobre conceptos artísticos sin infraestructura dedicada.
- Edición de imágenes asistida por prompt: usando --ref-image junto con el mmproj, se puede transformar una imagen existente (por ejemplo, añadir gafas de sol a una figura) manteniendo la composición, útil para variaciones de producto o material de marketing.
- Generación de assets para videojuegos y prototipos: el soporte de prompts detallados y texto renderizado permite crear carteles, rótulos y elementos de escenario dentro de la propia imagen generada.
- Despliegue en estaciones de trabajo con VRAM limitada: al estar cuantizado en nvfp4 y funcionar con codificadores q4_k_m, encaja en equipos con 6 GB de VRAM, lo que facilita su uso en portátiles de desarrollo sin GPU de datacenter.
- Integración en pipelines de ComfyUI: los flujos JSON incluidos permiten incorporar el modelo a grafos de generación más amplios (upscaling, postproceso, composición) dentro de un estudio de contenido automatizado.
- Experimentación e investigación en difusión cuantizada: el paquete ofrece múltiples combinaciones de codificador y VAE, lo que permite medir el impacto de la cuantización en la calidad final y en el tiempo de inferencia.
- Generación de material visual para demostraciones y documentación técnica: la baja latencia (13-17 s en GPU de 6 GB) permite producir imágenes de ejemplo bajo demanda en entornos de CI o documentación automatizada.

## Benchmarks y rendimiento

El autor publica una tabla de tiempos de finalización por combinación de codificador de texto, medida en una GPU de portátil RTX 4050 con 6 GB de VRAM:

| Combinacion de codificador | Tiempo completado |
|---|---|
| pig-clip + adapter + mmproj | 13 s |
| qwen3vl-8b-nvfp4.gguf (all-in-one) | 15 s |
| qwen3vl-8b-it-q4_k_m.gguf + mmproj | 17 s |

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor reporta funcionamiento en una RTX 4050 de portátil con 6 GB de VRAM usando el transformador de difusión en nvfp4 y el codificador pig-clip o qwen3vl-8b en cuantización baja.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM para la configuración mínima; GPUs de gama alta reducen el tiempo de generación a "un par de segundos" según el autor, aunque no se aportan cifras concretas.
- Cabe en GPU consumer: sí, confirmado en RTX 4050 de 6 GB; presumiblemente también en RTX 3060, 4060, 4070 y superiores.
- Opciones de despliegue: motor ggk diffuser (comandos documentados) y ComfyUI mediante nodos GGUF, con flujos de trabajo JSON incluidos en el repositorio.
- Latencia y throughput: 13-17 s por imagen en configuración de 4 pasos con edición y codificador ligero, medido en RTX 4050 de 6 GB.
- Tamaño del repositorio: 21,5 GB, lo que condiciona el espacio en disco necesario para alojar todas las variantes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El paquete se basa en Qwen/Qwen-Image-2.1, pero no se aportan datos de parámetros, contexto ni rendimiento de ese modelo base ni de alternativas de la misma categoría, por lo que la comparativa se considera no disponible.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible; antes de un uso comercial es imprescindible verificar la licencia del modelo base Qwen/Qwen-Image-2.1 y la del propio repositorio GGUF.
- Al ser una cuantización (nvfp4, q4_k_m), es esperable una pérdida de calidad frente a los pesos originales en precisión completa; no se han publicado métricas que cuantifiquen esa degradación.
- Los tiempos de benchmark proceden de una única GPU (RTX 4050 de portátil, 6 GB) y de una configuración concreta de pasos y sigmas; no son extrapolables directamente a otro hardware.
- El paquete depende de componentes de terceros (pig-clip, adaptador, mmproj, VAE) cuya procedencia y mantenimiento no se detallan; conviene fijar versiones concretas en producción.
- No hay información sobre sesgos, idiomas soportados ni comportamiento con prompts en castellano; el texto renderizado en imágenes puede fallar en idiomas distintos del inglés.
- Riesgo de alucinación visual y de artefactos en anatomía, texto y composiciones complejas, inherente a los modelos de difusión; requiere revisión humana en usos editoriales o comerciales.
- El tamaño del repositorio (21,5 GB) y la multiplicidad de variantes pueden complicar la gestión de artefactos y el almacenamiento en entornos de CI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gguf-org/qwen-image-2.1-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Codificador pig-clip: https://huggingface.co/gguf-org/trainer/blob/main/pig_clip-f16.gguf
- Adaptador pig-clip: https://huggingface.co/gguf-org/pig-clip/blob/main/pig_qwen3vl_8b_adapter-f16.gguf
- Proyector mmproj: https://huggingface.co/gguf-org/qwen-image-2.1-gguf/blob/main/mmproj-qwen3vl-8b-it-q8_0.gguf
- Flujo ComfyUI texto a imagen: https://huggingface.co/gguf-org/qwen-image-2.1-gguf/blob/main/qwen-image-2.1-workflow-for-comfyui.json
- Flujo ComfyUI edición: https://huggingface.co/gguf-org/qwen-image-2.1-gguf/blob/main/qwen-image-2.1-edit-workflow-for-comfyui.json
- Captura de ejemplo en ComfyUI: https://raw.githubusercontent.com/calcuis/comfy/master/iq2.1.png
- Captura de ejemplo de edición: https://raw.githubusercontent.com/calcuis/comfy/master/iq2.1e.png
