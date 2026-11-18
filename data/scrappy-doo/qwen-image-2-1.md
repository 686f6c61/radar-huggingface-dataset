# Scrappy-Doo/Qwen-Image-2.1

## Resumen

Qwen-Image-2.1 es un modelo unificado de generación de imágenes a partir de texto (text-to-image) y edición de imágenes, desarrollado por el equipo Qwen de Alibaba. Se distribuye como un pipeline de Diffusers (`QwenImage21Pipeline`) y está pensado para sustituir a la generación y edición de imágenes separadas por un único modelo que cubre ambos casos, incluyendo la generación nativa de imágenes con canal alfa (RGBA).

El componente de generación visual tiene 7B parámetros (7.115.124.736 según los pesos en safetensors) distribuidos en 32 capas DiT single-stream, lo que lo sitúa en un rango de tamaño compacto para un modelo de difusión de alta resolución. La arquitectura emplea atención de granularidad mixta y reutilización de prefix KV cache para reducir el coste computacional en inferencia.

Es relevante porque combina en un solo modelo generación a 2048×2048, edición con hasta 10 imágenes de referencia, edición local mediante máscaras o anotaciones y generación de transparencias nativas, con licencia Qwen Research. El repositorio de Hugging Face lo publica el usuario Scrappy-Doo y enlaza al modelo oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT single-stream (32 capas), atención de granularidad mixta, prefix KV cache; pipeline Diffusers (`QwenImage21Pipeline`) |
| Parametros totales | 7.115.124.736 (componente de generación visual, 7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión; no aplica ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de la model card usa bfloat16) |
| Idiomas soportados | no disponible (los prompts se procesan en el idioma que acepte el codificador de texto, no especificado) |
| Licencia | qwen-research (Qwen Research License Agreement) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

Qwen-Image-2.1 es un modelo de difusión basado en transformer (DiT) con 32 capas single-stream y 7B parámetros en su componente de generación visual. La model card destaca cuatro innovaciones: atención de granularidad mixta, reutilización de prefix KV cache para abaratar la inferencia, generación nativa de RGBA y un mecanismo de edición que admite hasta 10 imágenes de referencia junto con máscaras o anotaciones locales.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla el codificador de texto ni el VAE empleados. La model card menciona mejoras en tipografía, iluminación de retratos y detalle fino, pero sin cuantificar los datos de entrenamiento que las respaldan.

## Capacidades

- Generación de imágenes a partir de texto en resoluciones de hasta 2048×2048 y relaciones de aspecto 1:1, 4:3, 3:4, 3:2, 2:3, 16:9 y 9:16.
- Generación nativa de imágenes con transparencia (RGBA) mediante prompts con formato específico.
- Edición de imágenes con instrucciones en lenguaje natural (por ejemplo, cambiar el fondo).
- Edición local mediante círculos, anotaciones pintadas o máscaras separadas.
- Uso de hasta 10 imágenes de referencia para preservar identidad de personas y productos.
- Extracción de sujetos a partir de fotografías.
- Renderizado de texto dentro de la imagen (tipografía y carteles).
- No se documentan tool calling, function calling ni capacidades de agente.

## Casos de uso

- Generación de material gráfico para marketing: creación de carteles y banners a 2048×2048 con texto renderizado dentro de la imagen, útil para piezas que requieren tipografía legible sin postprocesado.
- Diseño de stickers y assets con transparencia: la generación nativa RGBA permite obtener PNG con canal alfa directamente, evitando el recorte manual en herramientas de diseño.
- Edición de producto con preservación de identidad: usando hasta 10 imágenes de referencia se pueden sustituir fondos o contextos manteniendo la apariencia del producto.
- Retoque localizado en flujos de fotografía: las máscaras y anotaciones permiten modificar regiones concretas (por ejemplo, cambiar el cielo) sin regenerar la imagen completa.
- Extracción de sujetos para catálogos: a partir de una fotografía se puede aislar el sujeto sobre fondo transparente para su uso en fichas de e-commerce.
- Composición de escenas grupales: la model card muestra la generación de una fotografía de grupo a partir de seis retratos de referencia, aplicable a ilustración editorial o prototipado de campañas.
- Prototipado rápido en estudios de diseño: iteración de conceptos visuales con el pipeline de Diffusers integrado en notebooks o scripts de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El componente de generación visual tiene 7B parámetros; en bfloat16 los pesos ocupan aproximadamente 14 GB, a los que hay que sumar el codificador de texto y el VAE del pipeline completo (el repo ocupa 33,1 GB).
- Para inferencia completa en GPU se recomienda una GPU con al menos 24 GB de VRAM (RTX 4090, A100 40 GB, H100) para ejecutar el pipeline en bfloat16 sin offloading.
- `enable_model_cpu_offload()` permite reducir el uso de VRAM descargando módulos a CPU, a costa de mayor latencia; con esta opción podría ejecutarse en GPUs consumer de 16 GB, aunque no se documentan cifras medidas.
- Despliegue mediante la librería `diffusers` (versión de desarrollo desde GitHub) con `torch>=2.4.0`, `transformers>=5.17` y `accelerate`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de este tipo.
- No se publican cifras de latencia ni throughput. El ejemplo de la model card usa 40 pasos de inferencia, que es la referencia de coste computacional por imagen.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables (por ejemplo, otras versiones de la familia Qwen-Image o modelos de difusión de tamaño similar), por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-2.1 | 7B (componente visual) | no aplica | qwen-research | Hugging Face, ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es Qwen Research License Agreement, no una licencia de código abierto permisiva; es necesario revisar sus términos antes de cualquier uso comercial.
- No se documentan los sesgos del modelo ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de representación.
- Como modelo generativo de imágenes, puede producir contenido inexacto o alucinado respecto al prompt, especialmente en texto renderizado y detalles finos.
- No se especifican los idiomas soportados por el codificador de texto; el rendimiento multilingüe en prompts no está garantizado.
- El repositorio de Hugging Face figura a nombre de Scrappy-Doo con 0 descargas y 0 likes en el momento de la consulta, y enlaza al modelo oficial de Qwen; conviene verificar la procedencia de los pesos antes de usarlos en producción.
- No se publican métricas de calidad, latencia ni consumo de memoria medidos, por lo que las estimaciones de hardware son aproximadas.
- El tamaño del repositorio (33,1 GB) implica requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/Scrappy-Doo/Qwen-Image-2.1
- Hugging Face (modelo oficial Qwen): https://huggingface.co/Qwen/Qwen-Image-2.1
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-2.1
- Blog: https://qwen.ai/blog?id=qwen-image-2.1
- Demo (Space): https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- Discord: https://discord.gg/BEYSk3pkSu
- Formulario de feedback: https://alidocs.dingtalk.com/notable/share/form/v01WgZOZA5DaVQPeqLX_dv19yqvsgs3oebp3pcjys_1qX0QQ0?source=link
