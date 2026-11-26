# 123min2/dessert-edit-lora-v3

## Resumen

Dessert-edit-lora-v3 es un adaptador LoRA para edición de imágenes por instrucción, entrenado sobre el modelo base `vinesmsuic/magicbrush-jul7`, que a su vez es un modelo del tipo InstructPix2Pix. Lo desarrolla el usuario de Hugging Face `123min2` y su objetivo es acotado y específico: modificar únicamente la zona indicada por la instrucción en fotografías de postres, sin alterar el resto de la imagen. Se publica como pesos LoRA que se cargan sobre la pipeline de diffusers, no como un modelo completo autónomo.

El interés técnico está en su pipeline de generación de datos de entrenamiento: los pares de edición se construyeron combinando Qwen3-VL, Grounding DINO, SAM 2.1 y SDXL inpainting sobre imágenes de postres de Food-101, con selección best-of-3 mediante un juez Qwen3-VL calibrado contra etiquetas humanas (348 ediciones). Es un ejemplo de destilación de un pipeline multimodal complejo en un LoRA pequeño y desplegable.

La relevancia práctica es limitada pero clara: demuestra cómo especializar un editor de imágenes genérico en un dominio estrecho (retoque de fotografía gastronómica) con un coste de entrenamiento bajo. No hay información publicada sobre licencia, idiomas, benchmarks ni rendimiento cuantitativo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre modelo base InstructPix2Pix (`vinesmsuic/magicbrush-jul7`) |
| Parametros totales | no disponible (el LoRA es un adaptador; el recuento del base no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión para imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de edición se infieren del base; no se declara cobertura idiomática) |
| Licencia | no disponible |
| Formato de pesos | pesos LoRA compatibles con diffusers (`load_lora_weights`); formato de fichero no especificado |
| Resolución de entrenamiento | 512 px |
| Rank del LoRA | 16 |
| Épocas | 5 |
| Batch size | 4 |
| Learning rate | 0.0001 |
| Librería | diffusers |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura InstructPix2Pix del modelo base, un modelo de difusión condicionado por texto que recibe una imagen de entrada y una instrucción de edición, y genera la imagen modificada. Sobre esa base se entrena un LoRA de rank 16 durante 5 épocas, con batch 4, learning rate 0.0001 y resolución de 512 px. No se detalla el número de pasos, el tamaño del dataset final ni la composición exacta del conjunto de entrenamiento.

La innovación destacable está en la curación de datos. Los pares imagen-original/imagen-editada se generaron automáticamente a partir de postres de Food-101 mediante una cadena de modelos: Qwen3-VL para interpretar y describir, Grounding DINO para localizar la región a editar, SAM 2.1 para segmentarla y SDXL inpainting para aplicar el cambio. De cada instrucción se generaron tres candidatos y un juez Qwen3-VL, calibrado contra 348 ediciones etiquetadas por humanos, seleccionó el mejor. No se menciona uso de RLHF ni DPO; el ajuste es supervisado sobre pares sintéticos filtrados.

## Capacidades

- Edición de imágenes por instrucción en lenguaje natural, restringida a fotografías de postres.
- Modificación localizada: el entrenamiento está orientado a que solo cambie la parte indicada de la imagen y preserve el resto.
- Especialización en dominio gastronómico (postres de Food-101), lo que reduce la deriva sobre el fondo y el contexto.
- Integración directa con `StableDiffusionInstructPix2PixPipeline` de diffusers mediante `load_lora_weights`.
- No se declara soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada más allá de imagen más texto.
- No se declara soporte multilingüe explícito; la cobertura idiomática depende del modelo base y no está documentada.
- No se declaran modos especiales (thinking, audio, vídeo).

## Casos de uso

- Retoque de fotografía gastronómica para cartas y delivery: cambiar el glaseado, el topping o el color de un postre sobre la foto original manteniendo el plato, la mesa y la iluminación intactos, gracias a la especialización en preservar la zona no instruida.
- Prototipado rápido en apps de recetas: permitir al usuario describir una variante ("cámbialo a chocolate") y generar una vista previa editada sin rehacer la fotografía, usando el LoRA sobre la pipeline de diffusers.
- Generación de variantes para A/B testing de producto: producir múltiples versiones de una misma foto de postre con cambios puntuales para testear preferencia visual en campañas.
- Automatización de catálogos de repostería: aplicar ediciones masivas y consistentes sobre un lote de imágenes de Food-101 o similar, integrando el LoRA en un pipeline por lotes con diffusers.
- Investigación en edición por instrucción: usar el adaptador como referencia de especialización por dominio y comparar su comportamiento frente al modelo base MagicBrush sin LoRA.
- Docencia y demostraciones de LoRA: ejemplo compacto de cómo un pipeline multimodal (Qwen3-VL, Grounding DINO, SAM 2.1, SDXL) puede destilarse en un adaptador pequeño para una tarea concreta.
- Filtrado de datos sintéticos: reutilizar la metodología de juez Qwen3-VL calibrado con etiquetas humanas para construir otros adaptadores de edición especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base InstructPix2Pix sobre el que se carga el LoRA. Como referencia, una pipeline de difusión de este tipo a 512 px suele requerir del orden de 8-12 GB de VRAM en precisión fp16, aunque el dato no está confirmado para este base concreto.
- GPU recomendadas: no disponible. Por el tipo de pipeline, una GPU consumer con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) sería el mínimo razonable; A100/H100 para lotes grandes, sin cifras publicadas.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs de 12 GB o más, pero no hay confirmación del autor.
- Opciones de despliegue: diffusers (única vía documentada en la model card, mediante `StableDiffusionInstructPix2PixPipeline` más `load_lora_weights`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 123min2/dessert-edit-lora-v3 | LoRA sobre InstructPix2Pix | no disponible (rank 16) | no aplica | no disponible | Hugging Face, diffusers |
| vinesmsuic/magicbrush-jul7 (base) | InstructPix2Pix | no disponible | no aplica | no disponible | Hugging Face, diffusers |
| InstructPix2Pix (original) | Modelo de difusión para edición por instrucción | no disponible | no aplica | no disponible | Hugging Face, diffusers |
| MagicBrush (modelo de referencia) | Edición por instrucción | no disponible | no aplica | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: no se publican métricas de fidelidad de edición, preservación de región ni preferencia humana para este LoRA, por lo que no es posible situarlo numéricamente frente al base ni frente a otros editores por instrucción.

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado solo con postres de Food-101; su comportamiento fuera de ese dominio no está documentado y probablemente degrade.
- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o verificar la licencia del modelo base antes de producción.
- Sin benchmarks ni evaluación publicada: no hay evidencia cuantitativa de calidad, fidelidad de edición ni preservación de la región no instruida.
- Dependencia del modelo base: cualquier limitación de `vinesmsuic/magicbrush-jul7` (sesgos, calidad, licencia) se hereda.
- Datos de entrenamiento sintéticos: los pares se generaron con modelos (Qwen3-VL, Grounding DINO, SAM 2.1, SDXL inpainting) y un juez automático calibrado con solo 348 etiquetas humanas; pueden persistir sesgos y artefactos del generador.
- Riesgo de alucinación visual: como todo modelo de difusión, puede introducir cambios no solicitados o detalles inexistentes, especialmente fuera de la distribución de postres.
- Sin información sobre idiomas: las instrucciones en castellano no están validadas; el base podría no responder bien a instrucciones no inglesas.
- Repositorio de 0.0 GB y sin descargas ni likes: madurez y mantenimiento no verificables.
- No apto para tool calling, agentes ni tareas de texto: es exclusivamente un editor de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/123min2/dessert-edit-lora-v3
- Modelo base: https://huggingface.co/vinesmsuic/magicbrush-jul7
- Documentación de diffusers (InstructPix2Pix): https://huggingface.co/docs/diffusers/api/pipelines/pix2pix
- Dataset Food-101: https://huggingface.co/datasets/food101
- Grounding DINO: https://huggingface.co/IDEA-Research/grounding-dino-base
- SAM 2.1: https://huggingface.co/facebook/sam2.1-hiera-large
- Qwen3-VL: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
