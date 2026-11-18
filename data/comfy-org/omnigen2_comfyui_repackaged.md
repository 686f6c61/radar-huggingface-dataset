# Comfy-Org/Omnigen2_ComfyUI_repackaged

## Resumen

OmniGen2 es un modelo de difusión multimodal desarrollado por el equipo de OmniGen2 (OmniGen2/OmniGen2) que unifica generación de imágenes a partir de texto y edición de imágenes guiada por instrucciones en un único modelo. Esta ficha documenta el repositorio `Comfy-Org/Omnigen2_ComfyUI_repackaged`, un reempaquetado de los pesos originales en formato de archivo único (`diffusion-single-file`) listo para su uso en ComfyUI, publicado por Comfy-Org bajo licencia Apache 2.0.

El repackaging separa los componentes en tres ficheros safetensors en fp16: el modelo de difusión (`omnigen2_fp16.safetensors`), el codificador de texto Qwen 2.5 VL (`qwen_2.5_vl_fp16.safetensors`) y el VAE (`ae.safetensors`). El uso de Qwen 2.5 VL como text encoder es relevante porque aporta comprensión multimodal de instrucciones, lo que habilita tareas de edición de imagen basadas en lenguaje natural además de la generación texto-a-imagen.

Su relevancia práctica radica en que elimina la fricción de integración: los pesos están organizados para colocarse directamente en las carpetas `models/diffusion_models`, `models/text_encoders` y `models/vae` de ComfyUI, con workflows oficiales de plantilla para edición de imagen y texto-a-imagen. No obstante, esta ficha solo puede cubrir los datos disponibles en el repositorio y la búsqueda; los detalles de arquitectura interna, entrenamiento y benchmarks deben consultarse en el repositorio original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de difusión multimodal (generación y edición de imagen); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 en los ficheros publicados; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo único por componente: difusión, text encoder, VAE) |

## Arquitectura y entrenamiento

El repositorio es un reempaquetado de `OmniGen2/OmniGen2` para ComfyUI, no una variante entrenada por Comfy-Org. La estructura de ficheros revela tres componentes: un modelo de difusión principal (`omnigen2_fp16.safetensors`), un codificador de texto basado en Qwen 2.5 VL (`qwen_2.5_vl_fp16.safetensors`) y un VAE (`ae.safetensors`). La presencia de un text encoder multimodal sugiere que el modelo procesa instrucciones que pueden incluir referencias visuales, lo que encaja con sus dos modos documentados: texto-a-imagen y edición de imagen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas (atención, decodificación, etc.) en la información proporcionada. Estos datos deben consultarse en la model card del repositorio original `OmniGen2/OmniGen2`.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (workflow `image_omnigen2_t2i`).
- Edición de imágenes guiada por instrucciones, con pares antes/después documentados en el workflow `image_omnigen2_image_edit`.
- Comprensión de instrucciones mediante un text encoder Qwen 2.5 VL, lo que permite prompts en lenguaje natural.
- Integración nativa en ComfyUI mediante archivos de modelo y plantillas de workflow oficiales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Modo thinking, visión o audio como capacidades de un LLM: no disponible; el modelo es generativo de imagen, no un modelo de lenguaje.

## Casos de uso

- Edición de imágenes por instrucción en flujos creativos: cargar una foto y aplicar cambios descritos en lenguaje natural usando el workflow de edición, aprovechando el text encoder Qwen 2.5 VL para interpretar la instrucción.
- Generación de ilustraciones y assets para prototipado: usar el workflow texto-a-imagen para producir bocetos y variaciones rápidas dentro de ComfyUI sin salir del grafo.
- Retoque y modificación de material de marketing: sustituir fondos, cambiar elementos o ajustar escenas sobre imágenes existentes mediante edición guiada, reduciendo el trabajo manual.
- Integración en pipelines de ComfyUI existentes: al ser archivos de modelo estándar en las carpetas de ComfyUI, se puede encadenar con nodos de upscaling, segmentación o postprocesado ya instalados.
- Automatización de variantes visuales para e-commerce: generar múltiples versiones de un producto a partir de un prompt y editar imágenes base para distintos contextos.
- Experimentación e investigación en modelos de difusión multimodal: el formato de archivo único y la licencia Apache 2.0 facilitan reproducir y comparar resultados en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 15,8 GB y los pesos se distribuyen en fp16, por lo que se requiere una GPU con memoria suficiente para cargar el modelo de difusión, el text encoder y el VAE simultáneamente.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamaño real de cada componente en fp16.
- Opciones de despliegue: ComfyUI (soporte nativo mediante los tres ficheros safetensors); otros runners (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo o no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OmniGen2 (este repack) | Difusión multimodal (t2i + edición) | no disponible | Apache 2.0 | Hugging Face, ComfyUI |
| OmniGen2/OmniGen2 (original) | Difusión multimodal | no disponible | Apache 2.0 | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Este repositorio es un reempaquetado para ComfyUI; no incluye model card técnica detallada, por lo que faltan datos de arquitectura, entrenamiento y evaluación.
- No se documentan sesgos conocidos ni tasas de alucinación visual; deben evaluarse empíricamente antes de usar en producción.
- No se especifican idiomas soportados por el text encoder en esta ficha; la cobertura multilingüe debe verificarse en el repositorio original.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base original y de Qwen 2.5 VL por si imponen restricciones adicionales.
- Los pesos en fp16 pueden requerir VRAM considerable; no se confirma que quepan en GPU de consumo.
- Al ser un modelo de difusión, la calidad y fidelidad de la edición dependen del prompt y de la imagen de entrada; no hay métricas publicadas que cuantifiquen su robustez.

## Enlaces

- Repositorio del repack: https://huggingface.co/Comfy-Org/Omnigen2_ComfyUI_repackaged
- Modelo original: https://huggingface.co/OmniGen2/OmniGen2
- Ejemplos de ComfyUI para OmniGen: https://comfyanonymous.github.io/ComfyUI_examples/omnigen/
- Workflow de edición de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_omnigen2_image_edit.json
- Workflow texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_omnigen2_t2i.json
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Comfy Cloud: https://cloud.comfy.org/
