# realrebelai/LLaDa-Image_ComfyUI

## Resumen

LLaDA-Image Base ComfyUI es una versión cuantizada del modelo de difusión LLaDA-Image de inclusionAI, preparada por RealRebelAI para ejecutarse en ComfyUI con requisitos de memoria reducidos. El modelo original es un sistema de generación y edición de imágenes basado en un transformer de difusión y un text encoder LLaDA2 MoE. Esta derivación incluye el transformer en formato INT8 nativo (safetensors) y el text encoder en GGUF Q4_K_M, junto con nodos personalizados para ComfyUI.

El modelo tiene 16.322.752.256 parámetros totales, ocupa 29.0 GB en el repositorio y está diseñado para el pipeline text-to-image. Su relevancia radica en permitir ejecutar LLaDA-Image en GPUs con poca VRAM, manteniendo el flujo de trabajo del modelo Base (50 pasos, CFG 5.0), en lugar del Turbo de pocos pasos. La integración con ComfyUI facilita su uso en flujos visuales para generación y edición de imágenes sin necesidad de infraestructura adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión con transformer de difusión y text encoder LLaDA2 MoE |
| Parametros totales | 16.322.752.256 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 (transformer) y Q4_K_M (text encoder GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (revisar licencia upstream) |
| Formato de pesos | Safetensors (transformer INT8) y GGUF (text encoder Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura de LLaDA-Image se compone de un transformer de difusión encargado de la generación y un text encoder LLaDA2 MoE que procesa las indicaciones de texto. Esta versión cuantizada sustituye los pesos originales del transformer por una representación INT8 nativa en safetensors, y el text encoder se ha cuantizado a GGUF Q4_K_M. El modelo base original es un sistema de difusión que soporta tanto generación de texto a imagen como edición de imagen nativa mediante su modo `generation_mode="editing"`, que utiliza la ruta de image-conditioning/SigVQ.

No se han proporcionado datos sobre el entrenamiento del modelo original: no se especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La cuantización fue realizada por RealRebelAI como derivación no oficial, sin afiliación con inclusionAI. La model card indica que el transformer INT8 no debe cargarse a través de un loader GGUF, ya que el archivo GGUF incluido corresponde únicamente al text encoder.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline de difusión.
- Edición de imagen nativa, no convencional (img2img o denoise-strength), usando `generation_mode="editing"` con la ruta de image-conditioning/SigVQ.
- Integración completa con ComfyUI mediante nodos personalizados de RealRebelAI.
- Cuantización INT8 del transformer y Q4_K_M del text encoder para reducir el uso de VRAM.
- Soporte de VAE tiling nativo (modos On, Auto, Off) para decodificación en GPUs de baja memoria.
- Configuración de pasos y CFG flexible: el modelo Base recomienda 50 pasos y CFG 5.0, frente al Turbo que usa 4 pasos y CFG 1.0.
- No soporta tool calling, function calling ni agentes, al ser un modelo de imagen.

## Casos de uso

- Generación de imágenes para diseño conceptual: se puede usar en ComfyUI para producir imágenes a partir de prompts descriptivos, con 50 pasos y CFG 5.0, aprovechando la calidad del modelo Base.
- Edición de imágenes con preservación de composición: el modo de edición nativo permite transformar elementos específicos de una imagen (por ejemplo, cambiar un zorro por un zorro ártico) manteniendo la estructura de la escena y el estilo fotográfico.
- Despliegue en entornos con VRAM limitada: gracias a la cuantización INT8 del transformer y Q4_K_M del text encoder, el modelo puede ejecutarse en GPUs de consumo con menos memoria que el modelo original sin cuantizar.
- Prototipado rápido de pipelines de imagen: la integración con ComfyUI permite construir flujos de trabajo visuales, experimentar con diferentes prompts, pasos y CFG, y validar resultados sin escribir código adicional.
- Investigación en modelos de difusión cuantizados: sirve como referencia para estudiar el impacto de la cuantización INT8 y GGUF en la calidad de generación y edición de imágenes.
- Generación de assets para videojuegos o ilustración: el modelo puede crear texturas, conceptos artísticos o fondos, y la edición nativa permite iterar sobre imágenes existentes para ajustar detalles manteniendo la coherencia.
- Automatización de tareas de edición en estudios creativos: el flujo de ComfyUI puede integrarse en pipelines de producción para aplicar ediciones masivas con control sobre la composición y el estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. La model card recomienda usar el transformer INT8, el text encoder Q4_K_M, activar VAE tiling y usar CPU offload para GPUs con poca VRAM.
- GPU recomendadas: no disponible. El modelo está orientado a GPUs de baja VRAM, pero no se especifican modelos concretos.
- En consumer GPU: posible según la model card, siempre que se active VAE tiling y se use el text encoder cuantizado.
- Opciones de despliegue: ComfyUI con los nodos personalizados de RealRebelAI y el plugin City96 ComfyUI-GGUF. También es compatible con la infraestructura de Diffusers de Hugging Face, según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Pasos recomendados | Licencia |
|---|---|---|---|---|
| realrebelai/LLaDa-Image_ComfyUI (Base) | 16.322.752.256 | INT8 + Q4_K_M | 50 | No disponible |
| realrebelai/LLaDa-Image-Turbo_ComfyUI | No disponible | No disponible | 4 | No disponible |
| inclusionAI/LLaDA-Image (original) | 16.322.752.256 (heredado) | Sin cuantizar | No disponible | No disponible |

La diferencia principal entre Base y Turbo es el número de pasos y CFG recomendados: el Base requiere 50 pasos y CFG 5.0, mientras que el Turbo funciona con 4 pasos y CFG 1.0. El modelo original de inclusionAI no está cuantizado, por lo que requiere más VRAM. No se dispone de datos de benchmarks comparativos.

## Limitaciones y advertencias

- Derivado no oficial de LLaDA-Image, no afiliado a inclusionAI.
- La licencia upstream no está especificada; hay que revisarla antes de redistribuir o usar comercialmente.
- Riesgo de alucinación visual en la generación y edición de imágenes.
- No se han publicado benchmarks de calidad, por lo que el rendimiento relativo frente a otros modelos es desconocido.
- El transformer INT8 debe cargarse como safetensors; no debe cargarse a través de un loader GGUF. El archivo GGUF incluido es únicamente el text encoder.
- La edición nativa requiere que el ancho y alto de la imagen sean divisibles por 32.
- No soporta tool calling, function calling ni agentes.
- En GPUs con poca VRAM puede ser necesario activar VAE tiling y CPU offload, lo que puede afectar a la latencia.

## Enlaces

- https://huggingface.co/realrebelai/LLaDa-Image_ComfyUI
- https://huggingface.co/realrebelai/LLaDa-Image-Turbo_ComfyUI
- https://github.com/RealRebelAI/LLaDa-Image_ComfyUI
- https://huggingface.co/inclusionAI/LLaDA-Image
- https://github.com/inclusionAI/LLaDA-Image
- https://github.com/city96/ComfyUI-GGUF
