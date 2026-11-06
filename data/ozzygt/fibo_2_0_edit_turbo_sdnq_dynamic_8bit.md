# OzzyGT/fibo_2_0_edit_turbo_sdnq_dynamic_8bit

## Resumen

Fibo 2.0 Edit Turbo SDNQ Dynamic 8-bit es una versión cuantizada a 8 bits del modelo de edición de imágenes briaai/Fibo-2.0-edit-turbo, publicada por el usuario OzzyGT. Se trata de un modelo de difusión para tareas de image-to-image y edición guiada por instrucciones, distribuido en formato diffusers con la librería de cuantización SDNQ. El modelo base lo desarrolla Bria AI, y esta variante aplica cuantización dinámica de 8 bits tanto al transformer como al codificador de texto Qwen3-VL-4B, manteniendo el VAE en bf16.

El modelo resuelve el problema del coste de memoria en la edición de imágenes de alta resolución: el transformer cuantizado ocupa 8,1 GB en disco y el codificador de texto 4,8 GB, lo que permite ejecutar el pipeline completo en GPU con un pico de 14,7 GiB de VRAM a resolución 864x1152. Es relevante porque acerca un modelo de edición de gama alta a hardware de consumo, manteniendo la fidelidad visual del original según las comparaciones incluidas en la model card.

La arquitectura subyacente es la del modelo Fibo 2.0 de Bria, un modelo de difusión destilado para edición en pocos pasos (4 pasos de inferencia con guidance_scale=1.0). Esta variante no introduce cambios arquitectónicos, solo cuantización de pesos. El modelo está pensado exclusivamente para inglés y su licencia es bria-fibo, con enlace a CC BY-NC 4.0, lo que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusers, BriaFibo2Pipeline) con codificador de texto Qwen3-VL-4B y VAE |
| Parámetros totales | 8.132.986.501 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Dinámica de 8 bits (SDNQ) en transformer y codificador de texto; VAE en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | bria-fibo (enlace a CC BY-NC 4.0) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo es una cuantización del modelo base briaai/Fibo-2.0-edit-turbo, que es un modelo de difusión para edición de imágenes por instrucciones. La arquitectura completa incluye un transformer de difusión, un codificador de texto Qwen3-VL-4B y un VAE. En esta variante, el transformer y el codificador de texto se cuantizan dinámicamente a 8 bits mediante SDNQ, mientras que el VAE permanece en bf16 para preservar la calidad de reconstrucción. El modelo base está destilado para edición en pocos pasos, lo que permite usar num_inference_steps=4 y guidance_scale=1.0.

No se dispone de información sobre el proceso de entrenamiento del modelo base en la información proporcionada: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La model card de esta variante se centra en el proceso de cuantización y en el uso del pipeline, no en el entrenamiento original. La innovación técnica destacable es la cuantización dinámica de 8 bits con SDNQ, que reduce el peso del transformer a 8,1 GB y del codificador de texto a 4,8 GB, permitiendo ejecutar el pipeline completo en una GPU con 14,7 GiB de VRAM a 864x1152.

## Capacidades

- Edición de imágenes guiada por instrucciones en formato JSON estructurado, con campos como short_description, objects, background_setting, lighting, aesthetics y photographic_characteristics.
- Image-to-image: acepta una imagen de origen o hasta 4 imágenes de referencia que la instrucción nombra como `<image_1>`, `<image_2>`, etc.
- Edición con máscaras (masked edits), según se indica en la model card del modelo original.
- Renderizado de texto en la imagen mediante entradas `text_render` en el caption, usando las fuentes incluidas en la carpeta `fonts`.
- Generación de imágenes en pocos pasos (4 pasos de inferencia) gracias a la destilación del modelo base.
- Soporte de prompts estructurados en JSON, con posibilidad de generarlos automáticamente mediante la herramienta bria-vgl a partir de una petición de una línea.
- Capacidad multilingüe limitada al inglés.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Edición fotográfica asistida por instrucciones: un usuario puede describir en JSON los cambios deseados sobre una fotografía (por ejemplo, añadir vestimenta o modificar la iluminación) y el modelo aplica la edición en 4 pasos, adecuado para flujos de retoque rápido con poca VRAM.
- Prototipado de variaciones de producto: a partir de una imagen de referencia, el modelo permite generar variantes con cambios de fondo, iluminación o composición descritos en el caption, útil en equipos de diseño que necesitan iterar sin infraestructura de gama alta.
- Composición multi-referencia: al aceptar hasta 4 imágenes de referencia, se puede usar para combinar elementos de distintas fuentes en una sola escena editada, por ejemplo para maquetas de marketing.
- Renderizado de texto en imágenes: la capacidad de `text_render` con fuentes personalizadas permite generar carteles o rótulos dentro de la imagen editada, útil para pruebas de concepto de material gráfico.
- Automatización de pipelines de edición por lotes: al ejecutarse con diffusers y SDNQ, se puede integrar en scripts que procesen lotes de imágenes con captions JSON predefinidos, reduciendo el coste de VRAM frente al modelo en bf16.
- Investigación en cuantización de modelos de difusión: sirve como caso de estudio para evaluar la pérdida de calidad de SDNQ a 8 bits frente al modelo original en bf16, comparando pares de imágenes con la misma semilla.
- Despliegue en estaciones de trabajo con GPU de consumo: con un pico de 14,7 GiB de VRAM a 864x1152, es viable en GPUs de 16 GB o superiores para tareas de edición interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una comparación visual cualitativa entre la imagen de origen, la salida en bf16 y la salida en INT8 con la misma entrada, prompt y semilla (seed 7), pero no proporciona métricas cuantitativas como FID, CLIP score ni SSIM.

## Requisitos de hardware

- VRAM estimada: pico de 14,7 GiB con el pipeline completo en GPU a resolución 864x1152, según la model card.
- Peso en disco: transformer 8,1 GB, codificador de texto 4,8 GB, repositorio completo 13,3 GB.
- GPU recomendadas: no se especifican modelos concretos; por el pico de VRAM, se requiere una GPU con al menos 16 GB para la resolución indicada. GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) son compatibles con margen.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 16 GB o más (por ejemplo, RTX 4080/4090 o equivalentes) a la resolución documentada; no se garantiza en GPUs de 8-12 GB.
- Opciones de despliegue: diffusers con BriaFibo2Pipeline, requiriendo SDNQ v0.2.8 o superior y diffusers 0.42.0 o superior. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OzzyGT/fibo_2_0_edit_turbo_sdnq_dynamic_8bit | 8.132.986.501 | No disponible | bria-fibo (CC BY-NC 4.0) | safetensors (diffusers, INT8) | Transformer 8,1 GB, text encoder 4,8 GB, pico 14,7 GiB VRAM |
| briaai/Fibo-2.0-edit-turbo (modelo base) | No disponible | No disponible | bria-fibo | No disponible | Versión bf16 sin cuantizar; referencia de calidad |
| briaai/Fibo-2.0-dev | No disponible | No disponible | No disponible | No disponible | Variante de desarrollo del mismo linaje Fibo 2.0 |

No se dispone de datos de benchmarks ni de parámetros del modelo base en la información proporcionada, por lo que la comparación se limita a licencia, formato y requisitos de memoria.

## Limitaciones y advertencias

- Licencia bria-fibo con enlace a CC BY-NC 4.0: restringe el uso comercial; es necesario verificar los términos completos antes de cualquier despliegue en producción.
- El modelo solo soporta inglés, tanto en prompts como en instrucciones; no se documenta soporte de otros idiomas.
- Riesgo de alucinación visual: como modelo generativo de imágenes, puede introducir elementos no solicitados o alterar detalles de la imagen de origen; la model card no cuantifica este riesgo.
- La cuantización a 8 bits puede introducir diferencias de calidad frente al modelo bf16; la model card solo ofrece una comparación visual cualitativa con una única imagen.
- Requiere versiones específicas de dependencias (SDNQ v0.2.8 o superior y diffusers 0.42.0 o superior); versiones anteriores pueden fallar al cargar los pesos cuantizados.
- El uso de prompts JSON estructurados añade complejidad: captions mal formados pueden degradar el resultado; se recomienda seguir la guía VGL.
- No se documentan sesgos conocidos ni limitaciones específicas de contexto más allá del idioma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/fibo_2_0_edit_turbo_sdnq_dynamic_8bit
- Modelo base: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Modelo de desarrollo Fibo 2.0: https://huggingface.co/briaai/Fibo-2.0-dev
- Guía de captions VGL: https://huggingface.co/briaai/Fibo-2.0-dev/blob/main/vgl/README.md
- Repositorio bria-vgl: https://github.com/Bria-AI/vgl
- Repositorio SDNQ: https://github.com/Disty0/sdnq
- Licencia: https://creativecommons.org/licenses/by-nc/4.0/deed.en
