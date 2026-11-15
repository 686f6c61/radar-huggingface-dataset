# Comfy-Org/PAN2

## Resumen

PAN2 es un modelo de generación de texto a imagen (text-to-image) desarrollado por IFM, distribuido en este repositorio por Comfy-Org como un paquete de archivos único ("diffusion-single-file") listo para su uso en ComfyUI. Se trata de un reempaquetado de los pesos originales del modelo `IFM/PAN2`, con conversiones a `bf16` y `int8` con rotación de convoluciones (`convrot`), pensado para facilitar el despliegue en el nodo de difusión de ComfyUI sin necesidad de manipular los archivos originales.

El repositorio incluye el modelo de difusión en dos variantes de precisión, un text encoder basado en Qwen (etiquetado como `qwen3.5_9b_int8_convrot`) y el VAE de Wan 2.2 (`wan2.2_vae.safetensors`). Esta combinación sugiere una arquitectura de difusión que emplea un encoder de texto de gran tamaño (9B) y un VAE heredado del ecosistema Wan, aunque la model card no detalla la arquitectura interna del UNet/DiT ni el número de parámetros del componente de difusión.

La relevancia de este repositorio es fundamentalmente práctica: ofrece una vía directa para ejecutar PAN2 en ComfyUI con pesos ya convertidos a `safetensors` y cuantizaciones listas para usar, con licencia Apache 2.0. No obstante, la información pública disponible es muy limitada: no se documentan datos de entrenamiento, benchmarks, idiomas soportados ni detalles arquitectónicos más allá de los nombres de los archivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto a imagen (detalles internos no disponibles); text encoder Qwen 9B y VAE de Wan 2.2 |
| Parametros totales | no disponible (el text encoder se etiqueta como 9B; el componente de difusión no se especifica) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 e int8 (con rotación de convoluciones, `convrot`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del componente de difusión de PAN2. Por los archivos distribuidos se deduce que el pipeline combina un modelo de difusión (en `bf16` o `int8`) con un text encoder Qwen de 9B parámetros (cuantizado a `int8` con rotación de convoluciones) y el VAE de Wan 2.2. El uso de un text encoder de 9B es notablemente grande para un modelo de texto a imagen y sugiere que la calidad del condicionamiento textual es un eje central del diseño, aunque no se documenta cómo se integra en el proceso de difusión.

Tampoco se han publicado datos sobre el corpus de entrenamiento (número de tokens, composición, resolución de las imágenes, uso de RLHF/DPO o técnicas de alineación). La única innovación técnica explícita en la información disponible es la conversión a `int8` con rotación de convoluciones (`convrot`), una técnica de cuantización que busca preservar la calidad numérica al reducir la precisión de los pesos, orientada a disminuir los requisitos de memoria en inferencia.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`).
- Condicionamiento textual mediante un text encoder Qwen de 9B parámetros, lo que en principio permite prompts largos y matizados (sin datos públicos que lo confirmen).
- Dos niveles de precisión disponibles: `bf16` para máxima calidad y `int8` para menor huella de memoria.
- Integración nativa con ComfyUI mediante archivos single-file.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; se trata de un modelo generativo de imágenes, no de un LLM conversacional.
- Capacidades multilingües: no disponibles (no se especifican idiomas soportados).

## Casos de uso

- Generación de ilustraciones para prototipado rápido en ComfyUI: el paquete single-file permite cargar el modelo y el text encoder directamente en las carpetas de ComfyUI y empezar a generar imágenes sin conversiones adicionales.
- Producción de arte conceptual en estudios pequeños: la variante `int8` reduce la VRAM necesaria, lo que facilita su uso en estaciones de trabajo con GPUs de gama alta consumer.
- Creación de assets para videojuegos o publicaciones: el uso de un text encoder de 9B sugiere buen seguimiento de prompts detallados, útil para generar variaciones coherentes de un mismo concepto.
- Automatización de pipelines de generación por lotes: al ser un modelo de difusión estándar en formato `safetensors`, puede orquestarse desde scripts que alimenten ComfyUI con colas de prompts.
- Investigación en cuantización: las variantes `bf16` e `int8 convrot` permiten comparar calidad y consumo de memoria entre precisiones en un mismo modelo.
- Experimentación con el ecosistema Wan: al reutilizar el VAE de Wan 2.2, sirve para estudiar la interoperabilidad entre componentes de distintos modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 124,5 GB en total, lo que incluye ambas variantes del modelo de difusión, el text encoder y el VAE; la variante `int8` reduce la huella frente a `bf16`, pero no se especifican cifras exactas por componente.
- GPU recomendadas: no disponibles. Por el tamaño del text encoder (9B) y el uso de un VAE de Wan 2.2, es razonable esperar requisitos elevados, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU consumer? No disponible; la existencia de una variante `int8` apunta a que se busca facilitar el despliegue en hardware más modesto, pero no se confirma.
- Opciones de despliegue: ComfyUI (soporte nativo mediante los archivos single-file). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLMs, no aplicables directamente a este modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones suficientes de PAN2 como para establecer una comparación rigurosa con otros modelos de texto a imagen (por ejemplo, de las familias SDXL, FLUX o Wan). Se indica únicamente que reutiliza el VAE de Wan 2.2 y un text encoder Qwen de 9B, pero sin cifras de parámetros del componente de difusión, benchmarks o requisitos de hardware no es posible una comparativa fundamentada.

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados, lo que dificulta evaluar su calidad antes de desplegarlo.
- Riesgo de sesgos: al no publicarse la composición del dataset de entrenamiento, no es posible evaluar sesgos demográficos, culturales o de estilo en las imágenes generadas.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir elementos incoherentes, texto ilegible o anatomías incorrectas; no hay documentación sobre su robustez en estos aspectos.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo original `IFM/PAN2` y de los componentes reutilizados (text encoder Qwen y VAE de Wan 2.2), que podrían tener términos propios.
- Dependencia del ecosistema ComfyUI: el paquete está estructurado para ComfyUI; su uso fuera de ese entorno requeriría adaptar los archivos y el pipeline.
- Tamaño del repositorio (124,5 GB): requiere espacio en disco considerable y una gestión cuidadosa de las variantes `bf16` e `int8`.
- Fecha de creación del repositorio (2026-11-15) y ausencia de descargas o likes: no hay señal de adopción comunitaria que permita validar su funcionamiento en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/PAN2
- Modelo original: https://huggingface.co/IFM/PAN2
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
