# Comfy-Org/Wan-2.2

## Resumen

Wan 2.2 es una familia de modelos de difusión para generación y edición de vídeo desarrollada originalmente por Wan-AI (Alibaba) y redistribuida por Comfy-Org como un repositorio único de pesos en formato `safetensors` listos para usar en ComfyUI. No se trata de un modelo único, sino de un paquete que agrupa variantes de texto a vídeo (T2V), imagen a vídeo (I2V), vídeo a vídeo con control, animación, locución a vídeo (S2V), inpainting, control de cámara y edición de imagen (ChronoEdit), junto con codificadores de texto UMT5-XXL, VAE y LoRAs de destilación.

La relevancia de esta redistribución es práctica: Comfy-Org empaqueta los pesos en cuantizaciones (`bf16`, `fp16`, `fp8_scaled`, `int8_convrot`) y los organiza por carpetas para que el usuario pueda cargarlos directamente en los nodos de ComfyUI sin tener que convertir ni renombrar archivos. El repositorio ocupa 737,3 GB e incluye variantes de 14B y 5B parámetros, con versiones de "ruido alto" y "ruido bajo" para los modelos de 14B, un esquema de dos etapas habitual en los pipelines de difusión de vídeo de gran tamaño.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de dicha licencia. El modelo está pensado para investigadores y desarrolladores que construyen pipelines de generación de vídeo, no para inferencia de texto: es un modelo de difusión, no un LLM, y su consumo se realiza a través de ComfyUI o de librerías de difusión compatibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (variantes T2V, I2V, TI2V, S2V, control, inpainting, animación y edición de imagen); pipeline de dos etapas con modelos de ruido alto y ruido bajo en las variantes de 14B |
| Parámetros totales | 14B (variantes principales) y 5B (variantes TI2V, Fun Control e Inpaint); no se detalla el desglose por componente |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; la condición de entrada es texto, imagen o vídeo, no una ventana de tokens de contexto) |
| Tipos de cuantización | `bf16`, `fp16`, `fp8_scaled` (e4m3fn escalado), `int8_convrot`; codificador de texto UMT5-XXL en `fp16`, `fp8_e4m3fn_scaled` e `int8_convrot` |
| Idiomas soportados | no disponible (el codificador de texto es UMT5-XXL, multilingüe, pero la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de los modelos subyacentes; se limita a indicar que son pesos reempaquetados de los repositorios originales de Wan-AI, alibaba-pai, nvidia (ChronoEdit) y lightx2v (LoRAs de destilación). Por los nombres de archivo se deduce una estructura de difusión de vídeo con dos etapas: los modelos de 14B se dividen en `high_noise` y `low_noise`, un esquema en el que la primera etapa genera la estructura gruesa y la segunda refina el detalle. Las variantes de 5B (`ti2v_5B`, `fun_control_5B`, `fun_inpaint_5B`) se distribuyen en un único archivo, sin esa división.

El pipeline incluye un codificador de texto UMT5-XXL (disponible en tres precisiones), un VAE específico de Wan 2.2 y otro heredado de Wan 2.1, un codificador de audio `wav2vec2_large_english_fp16` para la variante S2V (locución a vídeo) y LoRAs de destilación de lightx2v que permiten reducir el número de pasos de muestreo a 4. No se proporcionan en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo ajuste por refuerzo o preferencias; los modelos de difusión no emplean RLHF en el sentido de los LLM.

## Capacidades

- Generación de vídeo a partir de texto (T2V) con las variantes de 14B.
- Generación de vídeo a partir de una imagen (I2V) y a partir de primer y último fotograma (FLF2V).
- Generación de vídeo a partir de texto e imagen combinados (TI2V) con la variante de 5B.
- Control de cámara en la generación (Fun Camera Control, 14B).
- Control estructural y de movimiento (Fun Control, 14B y 5B).
- Inpainting y outpainting de vídeo (Fun Inpaint, 14B y 5B).
- Animación de personajes a partir de una imagen de referencia (Animate 14B), con LoRA de relighting.
- Locución a vídeo: generación de vídeo sincronizado con audio de entrada (S2V 14B) usando `wav2vec2` como codificador de audio.
- Edición de imagen (ChronoEdit 14B) con LoRA de destilación.
- Aceleración por destilación: LoRAs de lightx2v para muestreo en 4 pasos en T2V e I2V.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Previsualización de vídeo publicitario: a partir de un guion breve y una imagen de referencia, la variante I2V 14B genera un clip con coherencia temporal suficiente para presentar un concepto a un cliente antes de producir el vídeo final.
- Prototipado de secuencias en producción audiovisual: la variante FLF2V permite fijar el primer y el último fotograma de un plano y generar la transición intermedia, útil para storyboards animados.
- Doblaje y avatares parlantes: la variante S2V 14B sincroniza el movimiento labial de un personaje con una pista de audio, lo que sirve para locuciones corporativas o contenidos formativos multilingües (previa traducción del audio).
- Edición y retoque de material rodado: las variantes Fun Inpaint de 14B y 5B permiten eliminar objetos o rellenar zonas de un clip sin regrabar, integrándose en un flujo de postproducción dentro de ComfyUI.
- Control de cámara virtual: Fun Camera Control 14B permite especificar movimientos de cámara (travelling, órbita, zoom) sobre una escena generada, útil para animáticas y previsualización de planos.
- Generación de material para investigación en difusión de vídeo: el repositorio ofrece pesos en varias precisiones (`bf16`, `fp8_scaled`, `int8_convrot`) que permiten estudiar el impacto de la cuantización en la calidad del vídeo generado con un mismo pipeline.
- Creación de contenido para redes sociales a bajo coste: la variante TI2V de 5B, más ligera, permite generar clips cortos en hardware de gama alta de consumo, con la LoRA de 4 pasos para reducir el tiempo de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño de pesos, un modelo de 14B en `bf16` ocupa aproximadamente 28 GB solo en pesos, a lo que hay que sumar el VAE, el codificador de texto UMT5-XXL y las activaciones; en `fp8_scaled` el peso baja a unos 14 GB, pero el pico de memoria durante el muestreo de vídeo sigue siendo elevado.
- Las variantes de 5B en `fp16` ocupan del orden de 10 GB en pesos, lo que las hace más viables en GPU de consumo, siempre que la resolución y el número de fotogramas sean moderados.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible. Por tamaño, las variantes de 14B en `bf16` requieren GPU de centro de datos (A100 80 GB, H100) o configuraciones multi-GPU; las variantes en `fp8_scaled` pueden caber en una RTX 4090 de 24 GB con offloading, y las de 5B son las únicas realistas en GPU de consumo de gama alta.
- Despliegue: el repositorio está empaquetado específicamente para ComfyUI (carpetas `diffusion_models`, `text_encoders`, `vae`, `loras`, `audio_encoders`). No se documentan otros runners en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / condición | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan 2.2 (este repo) | 14B y 5B | Difusión de vídeo (T2V, I2V, S2V, control, inpainting) | Texto, imagen, vídeo, audio | Apache 2.0 | Pesos `safetensors` para ComfyUI |
| Wan-AI/Wan2.2-T2V-A14B | 14B | Difusión texto a vídeo | Texto | Apache 2.0 (según repo original) | Pesos originales en Hugging Face |
| Wan-AI/Wan2.2-I2V-A14B | 14B | Difusión imagen a vídeo | Imagen y texto | Apache 2.0 (según repo original) | Pesos originales en Hugging Face |
| Wan-AI/Wan2.2-TI2V-5B | 5B | Difusión texto e imagen a vídeo | Texto e imagen | Apache 2.0 (según repo original) | Pesos originales en Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otros autores.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier expectativa en ese sentido es un error de categoría.
- El repositorio es una redistribución de pesos, no una model card técnica: no documenta arquitectura interna, datos de entrenamiento ni evaluación, por lo que la trazabilidad técnica es limitada.
- El tamaño del repositorio (737,3 GB) exige planificación de almacenamiento; descargar el paquete completo no es viable en la mayoría de entornos, y conviene descargar solo los archivos de la variante necesaria.
- Riesgo de artefactos y alucinaciones visuales: como todo modelo de difusión de vídeo, puede generar incoherencias temporales, deformaciones anatómicas y texto ilegible; no se han publicado métricas de calidad en la información disponible.
- Sesgos: no documentados en la información proporcionada; los modelos de difusión entrenados con datos web suelen reproducir sesgos demográficos y estéticos, pero no hay confirmación oficial para esta familia.
- Idiomas: la model card no declara idiomas soportados; el codificador UMT5-XXL es multilingüe, pero el rendimiento por idioma no está documentado.
- Licencia Apache 2.0: permite uso comercial con atribución y sin restricciones de campo de uso, pero conviene verificar la licencia de cada repositorio original (Wan-AI, alibaba-pai, nvidia, lightx2v) por si alguna variante tuviera condiciones adicionales no reflejadas aquí.
- Las versiones `int8_convrot` y `fp8_scaled` pueden degradar la calidad respecto a `bf16`; no hay evaluación publicada del impacto de la cuantización en esta familia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Wan-2.2
- Repositorios originales:
  - https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
  - https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
  - https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
  - https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
  - https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control-Camera
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-Control
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-InP
  - https://huggingface.co/alibaba-pai/Wan2.2-Fun-5B-InP
  - https://huggingface.co/alibaba-pai/Wan2.2-VACE-Fun-A14B
  - https://huggingface.co/nvidia/ChronoEdit-14B-Diffusers
  - https://huggingface.co/lightx2v/Wan2.2-Distill-Loras
- Ejemplos y documentación de ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Plantillas de flujos de trabajo:
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_i2v.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_flf2v.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_t2v.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_ti2v.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_control.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_s2v.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_chrono_edit_14B.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_camera.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_control.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_14B_fun_inpaint.json
  - https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_wan2_2_5B_fun_inpaint.json
