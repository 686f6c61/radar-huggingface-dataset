# ChenDY/NitroFusion2

## Resumen

NitroFusion2 es un modelo de generación de imágenes texto-a-imagen destilado para inferencia en uno o dos pasos, desarrollado por ChenDY sobre el modelo base Tongyi-MAI/Z-Image-Turbo. Su aportación técnica principal consiste en trasladar la pérdida adversarial del espacio de características de imagen al flujo de texto (*text stream*) de un Diffusion Transformer multimodal (MMDiT), lo que permite obtener tipografía nítida y detalle fino con una sola evaluación del transformer. El modelo tiene 6.154.908.736 parámetros y se distribuye bajo licencia Apache 2.0, con pesos en safetensors y cuantizaciones GGUF.

La relevancia del modelo radica en su eficiencia: al reducir la generación a 1–2 pasos, elimina la necesidad de decodificación iterativa de decenas de pasos propia de los modelos de difusión convencionales, lo que abarata sustancialmente el coste por imagen en producción. Adicionalmente, el autor publica un LoRA de "de-destilación" que devuelve el modelo hacia Z-Image-Turbo para mitigar artefactos en el modo de dos pasos, así como un ControlNet Union compatible con Canny, HED, profundidad, pose, escala de grises e inpainting.

El modelo está orientado a inglés (`language: en`) y se integra en el ecosistema diffusers y ComfyUI. En el momento de la consulta acumula 20.033 descargas y 50 likes, con un repositorio de 138,4 GB que incluye múltiples variantes de pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MMDiT (Diffusion Transformer multimodal) destilado, basado en Z-Image-Turbo |
| Parámetros totales | 6.154.908.736 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto declarada) |
| Tipos de cuantización | GGUF de Q2_K_4XS (2,0 GB) a Q8_0 (7,2 GB); variantes int8, W6A8 y W4A8 publicadas por terceros (PedroMarinhoDev) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file, diffusers), GGUF, LoRA safetensors |

## Arquitectura y entrenamiento

NitroFusion2 parte de Z-Image-Turbo, un Diffusion Transformer multimodal en el que los tokens de texto e imagen circulan por las mismas capas de atención. La innovación descrita en el paper (arXiv:2611.05648) consiste en aplicar una pérdida adversarial sobre el resumen que el flujo de texto ha construido tras leer la imagen, en paralelo a la pérdida adversarial convencional sobre características de imagen. Dado que ese resumen permanece ligado a la condición textual, un único discriminador congelado puede orientarse hacia distintos aspectos (tipografía, objetos, etc.) simplemente cambiando la "señal" o *cue* del prompt, lo que abre la puerta a controlar qué dimensión se discrimina durante la destilación.

El entrenamiento es, por tanto, una destilación adversarial de difusión (*adversarial diffusion distillation*) orientada a pocos pasos, que comprime el proceso generativo a 1–2 evaluaciones. El autor publica además un LoRA de de-destilación (`nf2-dedistill-lora.safetensors`) que aproxima el modelo de vuelta a Z-Image-Turbo; en el flujo de dos pasos se aplica con escala 0,5 en el primer paso y se desactiva en el segundo para reducir artefactos. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de imágenes texto-a-imagen en 1 o 2 pasos de inferencia.
- Renderizado de tipografía y texto legible dentro de la imagen, favorecido por la pérdida adversarial sobre el flujo de texto.
- Detalle fino y nitidez en una sola evaluación del transformer.
- Control espacial mediante NitroFusion2-Controlnet-Union: Canny, HED, profundidad, pose, escala de grises e inpainting.
- Soporte de LoRA externos (de-destilación propia y cuantizaciones de terceros).
- Ejecución en ComfyUI mediante flujos de trabajo provistos (1 paso, 2 pasos y variantes GGUF).
- Integración con diffusers mediante `ZImagePipeline` y `ZImageTransformer2DModel`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Generación de imágenes a gran escala en pipelines de producción: con 1–2 pasos por imagen, el coste computacional por muestra se reduce drásticamente frente a modelos de 20–50 pasos, lo que lo hace adecuado para servicios de generación masiva con latencia baja.
- Creación de carteles y material gráfico con texto integrado: la pérdida adversarial sobre el flujo de texto mejora la legibilidad tipográfica, útil para mockups de packaging, banners y portadas donde el texto forma parte de la composición.
- Edición e inpainting guiado: mediante el ControlNet Union en modo inpainting se puede rellenar o sustituir regiones concretas de una imagen manteniendo coherencia con la escena.
- Control de pose y estructura: el modo pose y profundidad del ControlNet permite generar variaciones de personajes o escenas respetando un esqueleto o mapa de profundidad de referencia, útil en previsualización de conceptos.
- Prototipado rápido en estaciones de trabajo con GPU de consumo: las cuantizaciones GGUF desde 2,0 GB permiten ejecutar el modelo en ComfyUI con VRAM limitada, facilitando iteración local sin clúster.
- Integración en herramientas de diseño asistido: vía diffusers o ComfyUI, el modelo puede incorporarse a flujos de trabajo de estudio que necesiten generar variantes de una imagen base con control estructural (Canny/HED) y pocos pasos.
- Generación condicionada por bocetos: el modo Canny/HED permite convertir dibujos lineales en imágenes renderizadas, aplicable a ilustración y conceptualización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16): los pesos suman aproximadamente 12,3 GB (6.154.908.736 parámetros × 2 bytes), por lo que se requiere una GPU con al menos ~13–16 GB de VRAM para cargar el transformer, más memoria para el VAE y el codificador de texto del pipeline Z-Image.
- VRAM estimada con GGUF: desde ~2,0 GB (Q2_K_4XS) hasta ~7,2 GB (Q8_0) solo para los pesos cuantizados, más overhead del pipeline.
- GPU recomendadas: A100/H100 para producción en bf16; RTX 4090 (24 GB) para bf16 en local; RTX 3090/4080 (16–24 GB) viables; GPUs de 8–12 GB pueden usar las variantes GGUF de menor tamaño.
- Cabe en GPU de consumo: sí, especialmente con las cuantizaciones GGUF y las variantes int8/W6A8/W4A8 de terceros.
- Opciones de despliegue: diffusers (`ZImagePipeline`), ComfyUI (flujos oficiales de 1 y 2 pasos, también GGUF), llama.cpp/GGUF para las variantes cuantizadas; no se documenta soporte explícito de vLLM o TGI (no aplicables a un modelo de difusión de imagen).
- Latencia y throughput: no disponibles de forma numérica; el autor indica que el flujo de 2 pasos con `ComfyUI-BypassLoRA` es entre 1,5 y 3,5 veces más rápido que sin él.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos de inferencia | Contexto/condición | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NitroFusion2 | 6.154.908.736 | 1–2 | texto (inglés) | Apache 2.0 | Hugging Face, GGUF, ComfyUI, diffusers |
| Z-Image-Turbo (base) | no disponible en la información | no disponible | texto | no disponible en la información | Hugging Face (Tongyi-MAI) |
| Modelos de difusión estándar de tamaño similar | no disponible | típicamente decenas de pasos | texto | variable | variable |

No se dispone en la información proporcionada de datos de rendimiento comparativos con alternativas concretas; la comparación se limita a la relación con su modelo base Z-Image-Turbo, del que NitroFusion2 es una destilación adversarial a 1–2 pasos.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; los prompts en otros idiomas pueden degradar la calidad o la fidelidad a la condición.
- Al ser un modelo destilado a 1–2 pasos, puede presentar artefactos que el flujo de dos pasos con LoRA de de-destilación mitiga parcialmente; el modo de un solo paso es más propenso a ellos.
- Riesgo de alucinación visual y de interpretación errónea de prompts ambiguos, inherente a los modelos generativos de imagen.
- No se documentan sesgos específicos ni evaluaciones de sesgo en la información disponible; como todo modelo entrenado con datos web a gran escala, es previsible que herede sesgos de representación.
- La licencia Apache 2.0 permite uso comercial, pero las cuantizaciones de terceros (int8, W6A8, W4A8) y el ControlNet deben verificarse por separado en sus respectivos repositorios.
- El repositorio es grande (138,4 GB) por incluir múltiples variantes; conviene descargar solo los archivos necesarios.
- No se especifican límites de resolución nativa ni de relación de aspecto en la información disponible; los ejemplos usan 1024×1024.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChenDY/NitroFusion2
- Repositorio GitHub: https://github.com/ChenDarYen/NitroFusion2
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ChenDY/NitroFusion2
- Página del proyecto: https://chendaryen.github.io/NitroFusion2.github.io/
- Paper (arXiv): https://arxiv.org/abs/2611.05648
- ControlNet Union: https://huggingface.co/ChenDY/NitroFusion2-Controlnet-Union
- Cuantizaciones de terceros (PedroMarinhoDev): https://huggingface.co/PedroMarinhoDev/NitroFusion2-ComfyUI
- ComfyUI-BypassLoRA: https://github.com/ChenDarYen/ComfyUI-BypassLoRA
- Modelo base Z-Image: https://github.com/Tongyi-MAI/Z-Image
- Pull request de ComfyUI referenciado: https://github.com/Comfy-Org/ComfyUI/pull/17408
