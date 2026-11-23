# Infinity-io/MiniMax-H3-Image

## Resumen

MiniMax-H3-Image es un modelo de difusión para generación y edición de imágenes desarrollado por MiniMax, publicado como pesos abiertos dentro de la familia MiniMax-H3. Unifica en un único checkpoint la generación texto-a-imagen y la edición de una o varias imágenes de referencia, lo que permite a creadores y desarrolladores trabajar con un solo modelo en lugar de encadenar un generador y un editor separados. El repositorio aquí descrito es un espejo alojado por el usuario Infinity-io, derivado del modelo base oficial MiniMaxAI/MiniMax-H3.

La propuesta técnica se apoya en tres ejes: resolución de salida de aproximadamente 16 megapíxeles en cualquier relación de aspecto (desde 4096×4096 en 1:1 hasta 6272×2688 en 21:9) sin upscaler, destilación a 6 pasos de muestreo (6 NFEs) sin classifier-free guidance, y una capacidad de seguimiento de instrucciones que el autor sitúa como la más alta entre los modelos abiertos. El modelo emplea un diffusion transformer (DiT) con la arquitectura H3 desprovista de las capas de audio, y reutiliza sin cambios el codificador de texto de MiniMax-H3.

El checkpoint en BF16 ocupa 68,65 GB y el repositorio completo 204 GB, lo que lo sitúa en la franja de modelos de imagen de gran tamaño que requieren hardware de数据中心 o GPUs de gama alta con suficiente VRAM. Su relevancia actual radica en que combina resolución nativa muy alta, velocidad de inferencia por destilación y edición multi-referencia (hasta 16 imágenes de referencia) en un único modelo con pesos descargables y licencia comunitaria propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con arquitectura H3 sin capas de audio; codificador de texto MiniMax-H3 sin cambios |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el contexto aplica al codificador de texto, no cuantificado en la informacion) |
| Tipos de cuantizacion | no disponible (el checkpoint publicado esta en BF16) |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | safetensors (libreria diffusers / minimax-h3) |

## Arquitectura y entrenamiento

MiniMax-H3-Image es un diffusion transformer (DiT) que hereda la arquitectura de la familia MiniMax-H3 eliminando las capas de audio, de modo que el mismo esqueleto que en H3 sirve para modalidades audiovisuales queda aquí especializado en imagen. El codificador de texto es el de MiniMax-H3 sin modificar, lo que garantiza consistencia en la interpretación de prompts con el resto de la familia. La generación y la edición comparten checkpoint: el modelo acepta texto para texto-a-imagen y una o varias imágenes de referencia para edición, hasta un máximo de 16 referencias.

El checkpoint está destilado a 6 pasos de muestreo (6 NFEs) y opera sin classifier-free guidance, lo que reduce el coste computacional por imagen frente a los pipelines de difusión convencionales que requieren decenas de pasos y doble evaluación por paso. La resolución de salida es de unos 16 megapíxeles en todas las relaciones de aspecto soportadas, generada de forma directa sin upscaler posterior. No se dispone en la información proporcionada de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación texto-a-imagen a resolución nativa de aproximadamente 16 MP en múltiples relaciones de aspecto (1:1, 21:9 y formatos intermedios).
- Edición de imagen a partir de una o varias imágenes de referencia, con hasta 16 referencias simultáneas.
- Seguimiento de instrucciones complejas orientado a la construcción de personajes, escenas y atmósferas a partir de una descripción creativa.
- Generación sin upscaler: la imagen se produce directamente a la resolución final.
- Inferencia rápida por destilación: 6 pasos de muestreo (6 NFEs) sin classifier-free guidance.
- Soporte de expansión de prompt (prompt expansion) a través de la API oficial, documentada como endpoint independiente.
- Idioma de prompt soportado: inglés.

## Casos de uso

- Producción de material gráfico para campañas: el modelo genera imágenes a 16 MP en cualquier relación de aspecto, suficiente para impresión y para formatos panorámicos (21:9) sin reescalado posterior, lo que simplifica el pipeline de un equipo creativo.
- Edición por referencia en flujos de diseño de personajes: con hasta 16 imágenes de referencia, un estudio puede mantener consistencia de un personaje o producto a lo largo de varias escenas introduciendo las referencias en cada generación.
- Creación de fondos y assets para videojuegos: la resolución nativa alta y la ausencia de upscaler permiten generar texturas y concept art directamente utilizables en motores que aceptan mapas de gran tamaño.
- Iteración rápida en herramientas de diseño asistido: los 6 pasos de muestreo sin CFG reducen el tiempo por imagen, lo que hace viable la generación interactiva en un editor o plugin donde el usuario ajusta el prompt y ve el resultado en segundos.
- Prototipado de ilustración editorial y storyboards: la capacidad de seguir instrucciones detalladas sobre escena, personajes y atmósfera permite producir variantes de una misma composición para revisión de cliente.
- Automatización de catálogos de producto: combinando texto-a-imagen para composiciones base y edición multi-referencia para insertar el producto real, se pueden generar fichas visuales coherentes a resolución de impresión.
- Integración vía API en servicios gestionados: para equipos sin GPU propia, los endpoints de generación, edición y expansión de prompt de la plataforma MiniMax permiten usar el modelo sin desplegar los 68,65 GB del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint DiT en BF16 ocupa 68,65 GB, por lo que la inferencia en BF16 requiere del orden de 70 GB o más de VRAM contando activaciones y el codificador de texto; no se dispone de cifras oficiales de pico de memoria.
- GPU recomendadas: para BF16, GPUs de数据中心 con 80 GB (A100 80 GB, H100 80 GB) o configuraciones multi-GPU; no se documenta en la información disponible el soporte de tensor parallelism concreto.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en BF16; no se han publicado pesos cuantizados ni GGUF que permitan reducir la huella.
- Opciones de despliegue: la librería declarada es minimax-h3 y el modelo está etiquetado para diffusers; no se confirma en la información disponible soporte de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponibles; la destilación a 6 NFEs sin CFG reduce el coste por imagen frente a pipelines estándar, pero no se publican tiempos medidos.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables que permitan una comparación cuantitativa fiable. A continuación se recogen únicamente los datos verificables del propio modelo frente a la referencia de su familia:

| Modelo | Tipo | Resolucion de salida | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image | DiT texto-a-imagen + edicion | ~16 MP (4096x4096 a 6272x2688) | 6 NFEs, sin CFG | Comunitaria MiniMax-H3-Image | Pesos en HF (68,65 GB BF16) + API |
| MiniMax-H3 (familia) | Modelo multimodal H3 | no disponible | no disponible | no disponible | Pesos en HF |
| Otros modelos abiertos de texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; los prompts en castellano pueden degradar el seguimiento de instrucciones.
- Licencia: se rige por la MiniMax-H3-Image Community License Agreement, no por una licencia OSI; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede incluir restricciones de uso, atribución o límites de escala.
- Repositorio espejo: esta ficha corresponde a Infinity-io/MiniMax-H3-Image, un derivado del modelo base oficial; conviene verificar integridad y procedencia frente a MiniMaxAI/MiniMax-H3-Image.
- Alucinación visual: como todo modelo generativo, puede producir detalles incoherentes, anatomías incorrectas o texto ilegible en la imagen; no se documentan tasas de error.
- Sesgos: no se publica información sobre sesgos demográficos, culturales o de representación en el dataset de entrenamiento.
- Huella de hardware: 68,65 GB en BF16 excluyen el despliegue en GPUs de consumo sin cuantización, y no se ofrecen pesos cuantizados oficiales.
- Resolución alta: generar 16 MP implica mayor coste de memoria en activaciones que resoluciones de 1–4 MP; no se publican cifras de pico.
- Metadatos incompletos: no se dispone de número de parámetros, tokens de entrenamiento, composición del dataset ni resultados de benchmarks, lo que limita la evaluación previa a producción.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/Infinity-io/MiniMax-H3-Image
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo oficial de imagen: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio GitHub: https://github.com/MiniMax-AI/MiniMax-H3-Image
- ModelScope: https://modelscope.cn/models/MiniMax/MiniMax-H3-Image
- API global: https://platform.minimax.io/docs/guides/image-generation
- API China: https://platform.minimax.cn/docs/guides/image-generation
- Documentación API texto-a-imagen (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-generations
- Documentación API edición (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-edits
- Documentación API expansión de prompt (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir
- WebApp global: https://hailuoai.video/
- WebApp China: https://hailuoai.com/
- App de escritorio global: https://agent.minimax.io/
- App de escritorio China: https://agent.minimax.cn/
- Sitio web de MiniMax: https://www.minimax.io
- Discord: https://discord.com/invite/dbMxutw7tP
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
