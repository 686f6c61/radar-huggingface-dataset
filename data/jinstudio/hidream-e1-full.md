# Jinstudio/HiDream-E1-Full

## Resumen

HiDream-E1-Full es un modelo de edición de imágenes guiada por instrucciones en lenguaje natural, desarrollado por HiDream.ai (repositorio espejo publicado por el usuario Jinstudio) y construido sobre el modelo generativo HiDream-I1. A diferencia de un modelo texto-a-imagen convencional, recibe una imagen de entrada más una instrucción de edición y devuelve una imagen modificada, cubriendo operaciones globales y locales como cambio de estilo, adición o eliminación de objetos, sustitución de fondo, modificación de color y renderizado de texto. La arquitectura es un diffusion transformer disperso (sparse DiT) de 17.105.733.184 parámetros totales, según los metadatos de safetensors del repositorio, y se distribuye a través de la librería diffusers con la clase `HiDreamImageEditingPipeline`.

El modelo se publicó originalmente como HiDream-E1 el 28 de abril de 2025 y se actualizó con HiDream-E1.1 el 16 de julio de 2025. El informe técnico asociado, "HiDream-I1: A High-Efficient Image Generative Foundation Model with Sparse Diffusion Transformer" (arXiv:2505.22705), describe la base generativa sobre la que se construye esta variante de edición, afinada a partir de HiDream-I1-Full. Es relevante porque coloca un modelo abierto de edición de imágenes por instrucciones en el mismo rango cualitativo que alternativas propietarias como Gemini-2.0-Flash en los benchmarks EmuEdit y ReasonEdit, con licencia MIT para los transformers.

El repositorio concreto analizado es un espejo con 0 descargas y 0 "likes" en el momento de la consulta, con un tamaño de 47,4 GB y fecha de creación 2026-10-10 en los metadatos de HuggingFace (fecha anómala respecto a las fechas de publicación indicadas en la model card). El idioma declarado es únicamente inglés (en) y el pipeline se etiqueta como "any-to-any".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer disperso (sparse DiT) derivado de HiDream-I1, adaptado a edición de imagen por instrucciones |
| Parametros totales | 17.105.733.184 (~17,1 mil millones), dato real de safetensors |
| Parametros activos | no disponible (el informe técnico describe una arquitectura dispersa, pero no se indica el número de parámetros activos) |
| Longitud de contexto | no disponible (modelo de difusión no autorregresivo; el condicionamiento textual se delega en text encoders externos) |
| Tipos de cuantizacion | no se documentan cuantizaciones oficiales; los pesos se distribuyen en bfloat16 (safetensors). No hay GGUF ni versiones cuantizadas publicadas por el autor |
| Idiomas soportados | en (inglés) |
| Licencia | MIT para los transformers del repositorio; el VAE procede de FLUX.1 [schnell] y los text encoders de google/t5-v1_1-xxl y meta-llama/Meta-Llama-3.1-8B-Instruct, sujetos a sus propias licencias |
| Formato de pesos | safetensors; integración mediante diffusers (`HiDreamImageEditingPipeline`) |

## Arquitectura y entrenamiento

HiDream-E1-Full es un fine-tuning de HiDream-I1-Full orientado a edición de imágenes. HiDream-I1 es un diffusion transformer disperso de 17.100 millones de parámetros que combina atención completa y mecanismos dispersos para reducir el coste computacional de la generación, según el informe técnico arXiv:2505.22705. El pipeline de edición combina el transformer de difusión con varios codificadores de texto: la model card menciona explícitamente el uso de `meta-llama/Llama-3.1-8B-Instruct` como cuarto text encoder (cargado con `output_hidden_states=True` y `output_attentions=True`) y, en el apartado de licencia, los text encoders de `google/t5-v1_1-xxl`, además de un VAE procedente de FLUX.1 [schnell].

La inferencia se realiza con Flash Attention (se recomienda CUDA 12.4), pesos en bfloat16 y 28 pasos de difusión por defecto, con `guidance_scale=5.0` e `image_guidance_scale=4.0`. El condicionamiento textual sigue un formato fijo de dos campos: `Editing Instruction: {instrucción}. Target Image Description: {descripción de la imagen objetivo}`, y el repositorio incluye un script de refinado de instrucciones (`instruction_refinement.py`) que emplea un VLM, ya sea servido localmente con vLLM o mediante la API de OpenAI. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Edición global de imagen: transformaciones de estilo (por ejemplo, conversión a estilo Ghibli), cambios de iluminación o de aspecto general.
- Edición local: modificación de regiones concretas sin alterar el resto de la imagen.
- Adición de objetos: inserción de elementos nuevos en la escena a partir de una instrucción textual.
- Eliminación de objetos: borrado de elementos con reconstrucción coherente del fondo.
- Cambio de fondo: sustitución o generación del entorno tras el sujeto.
- Modificación de color: recoloreado de objetos y de la escena.
- Renderizado y edición de texto dentro de la imagen.
- Edición guiada por razonamiento: el benchmark ReasonEdit evalúa instrucciones que requieren inferencia sobre el contenido de la imagen antes de editarla.
- Condicionamiento por prompt positivo y negativo (`negative_prompt`), con escalas separadas para texto e imagen de referencia.
- Integración con diffusers y con una demo Gradio interactiva incluida en el repositorio.
- Refinado automático de instrucciones mediante un VLM externo, para convertir instrucciones breves en descripciones objetivo más detalladas.
- No se documentan capacidades de tool calling, function calling, agentes ni procesamiento de audio.
- Capacidad multilingüe: limitada al inglés según el campo `language: en` de la model card.

## Casos de uso

- Retoque fotográfico asistido en estudios: el modelo permite aplicar instrucciones en lenguaje natural sobre una fotografía de 768x768 píxeles para cambiar fondo, color o estilo sin máscaras manuales, reduciendo el tiempo de posproducción.
- Sustitución de fondos para catálogo de producto: con `image_guidance_scale` alto se mantiene la identidad del producto original mientras se genera un entorno nuevo, útil para e-commerce que necesita variaciones de escena por campaña.
- Eliminación de objetos no deseados en fotografía de inmobiliaria o arquitectura: la categoría "Remove" del benchmark EmuEdit evalúa precisamente esta operación, con puntuación de 5,99 para HiDream-E1.
- Generación de variaciones estilizadas para ilustración y contenido editorial: la categoría "Style" obtiene 6,49 en EmuEdit, la mejor de la comparativa presentada, lo que lo hace adecuado para adaptar una misma imagen a distintos estilos visuales.
- Insertar texto o rótulos en imágenes: la categoría "Text" (6,45 en EmuEdit) permite añadir o modificar texto renderizado, útil para maquetas de cartelería y pruebas de diseño.
- Edición guiada por razonamiento para asistentes creativos: el rendimiento en ReasonEdit (7,54) indica que puede resolver instrucciones indirectas del tipo "haz que parezca invierno", útiles en herramientas de edición conversacional.
- Enriquecimiento de datasets de visión por computador: generar pares imagen-edición controlados para aumentar datos de entrenamiento de modelos de edición o de captioning.
- Prototipado rápido en demos internas: la demo Gradio incluida permite validar flujos de edición interactiva antes de integrar el pipeline en producción con diffusers.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre EmuEdit y ReasonEdit (cuanto más alto, mejor):

| Modelo | EmuEdit global | EmuEdit add | EmuEdit text | EmuEdit bg | EmuEdit color | EmuEdit style | EmuEdit remove | EmuEdit local | EmuEdit media | ReasonEdit |
|---|---|---|---|---|---|---|---|---|---|---|
| OmniGen | 1,37 | 2,09 | 2,31 | 0,66 | 4,26 | 2,36 | 4,73 | 2,10 | 2,67 | 7,36 |
| MagicBrush | 4,06 | 3,54 | 0,55 | 3,26 | 3,83 | 2,07 | 2,70 | 3,28 | 2,81 | 1,75 |
| UltraEdit | 5,31 | 5,19 | 1,50 | 4,33 | 4,50 | 5,71 | 2,63 | 4,58 | 4,07 | 2,89 |
| Gemini-2.0-Flash | 4,87 | 7,71 | 6,30 | 5,10 | 7,30 | 3,33 | 5,94 | 6,29 | 5,99 | 6,95 |
| HiDream-E1 | 5,32 | 6,98 | 6,45 | 5,01 | 7,57 | 6,49 | 5,99 | 6,35 | 6,40 | 7,54 |

HiDream-E1 lidera la media de EmuEdit (6,40) y ReasonEdit (7,54) frente a los cuatro modelos comparados. Gemini-2.0-Flash supera a HiDream-E1 en las subcategorías "add" (7,71 frente a 6,98) y "bg" (5,10 frente a 5,01). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no son aplicables a un modelo de edición de imagen.

## Requisitos de hardware

- VRAM estimada para el transformer: en torno a 34 GB solo para los 17,1 mil millones de parámetros en bfloat16 (17.105.733.184 × 2 bytes ≈ 34,2 GB). Es una estimación derivada del recuento de parámetros, no un dato publicado.
- VRAM adicional para los text encoders: Llama-3.1-8B-Instruct en bfloat16 añade aproximadamente 16 GB, y el resto de codificadores (T5-v1_1-XXL y los asociados al pipeline) suman varias decenas de gigabytes más según se carguen completos o en precisión reducida.
- Repositorio de 47,4 GB, lo que da una idea del orden de magnitud de los pesos almacenados.
- GPU recomendadas: A100 80 GB o H100 80 GB para ejecutar el pipeline completo en GPU sin offloading. La model card recomienda CUDA 12.4 y Flash Attention.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 24 GB o menos sin descarga a CPU o cuantización, que el autor no documenta. Es posible aplicar técnicas de offloading secuencial de diffusers, con una penalización notable de latencia.
- Opciones de despliegue: diffusers (`HiDreamImageEditingPipeline`), que es la vía oficial documentada; demo Gradio incluida en el repositorio; script de refinado de instrucciones con vLLM local o API de OpenAI. No se documentan integraciones con llama.cpp, Ollama o TGI, que no son aplicables a este tipo de pipeline de difusión.
- Latencia y throughput: no disponibles. El único parámetro de coste documentado es el número de pasos de inferencia por defecto, 28.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EmuEdit media | ReasonEdit | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HiDream-E1 (este modelo) | 17,1 mil millones | no aplicable | 6,40 | 7,54 | MIT (transformers) | Pesos abiertos en HuggingFace |
| HiDream-E1.1 | no disponible | no aplicable | no disponible | no disponible | no disponible | Pesos abiertos en HuggingFace (HiDream-ai/HiDream-E1-1) |
| OmniGen | no disponible | no aplicable | 2,67 | 7,36 | no disponible | no disponible en la información proporcionada |
| MagicBrush | no disponible | no aplicable | 2,81 | 1,75 | no disponible | no disponible en la información proporcionada |
| UltraEdit | no disponible | no disponible | 4,07 | 2,89 | no disponible | no disponible en la información proporcionada |
| Gemini-2.0-Flash | no disponible (propietario) | no disponible | 5,99 | 6,95 | propietaria | API de Google |

La información disponible solo permite comparar el rendimiento en EmuEdit y ReasonEdit. No se dispone de datos de parámetros, contexto ni licencia de los modelos alternativos más allá de lo indicado. HiDream-E1.1 es la iteración posterior publicada por el mismo autor y debería considerarse la opción por defecto frente a esta versión.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: el campo de idioma declarado es `en`, por lo que las instrucciones en castellano pueden degradar la calidad de la edición.
- Resolución de trabajo limitada: el ejemplo oficial redimensiona la imagen de entrada a 768x768, sin que se documenten resoluciones superiores.
- Formato de prompt rígido: requiere la plantilla `Editing Instruction: ... Target Image Description: ...`; el uso de instrucciones libres sin la descripción objetivo puede reducir la fidelidad del resultado.
- Riesgo de alucinación visual: como modelo generativo, puede introducir o modificar elementos no solicitados, especialmente en ediciones locales sobre regiones complejas.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, culturales o de representación en la información disponible.
- Licencia mixta: aunque los transformers son MIT, el pipeline depende de componentes con licencias propias. El text encoder Llama-3.1-8B-Instruct exige aceptar la licencia de Meta y autenticarse con `huggingface-cli login`; el VAE procede de FLUX.1 [schnell] y T5-v1_1-XXL de Google. El uso comercial está condicionado por esos términos, no solo por el MIT del repositorio.
- El texto de la model card aparece truncado en el apartado de licencia, por lo que conviene consultar la versión completa en el repositorio original antes de un despliegue comercial.
- Repositorio espejo con 0 descargas y 0 "likes": no hay evidencia de validación por parte de la comunidad ni garantía de mantenimiento. Se recomienda usar el repositorio oficial de HiDream-ai.
- Fecha de creación anómala en HuggingFace (2026-10-10) respecto a las fechas de publicación de la model card (abril y julio de 2025).
- Requisitos de hardware elevados: el pipeline completo supera con holgura los 24 GB de VRAM de una GPU de consumo.
- Dependencia de Flash Attention y de versiones recientes de diffusers instaladas desde el repositorio Git, lo que complica la reproducibilidad en entornos congelados.
- No se documentan tasas de error, análisis de robustez ante prompts adversarios ni evaluación de sesgos.

## Enlaces

- Repositorio analizado: https://huggingface.co/Jinstudio/HiDream-E1-Full
- Repositorio oficial del modelo: https://huggingface.co/HiDream-ai/HiDream-E1-Full
- Versión posterior HiDream-E1.1: https://huggingface.co/HiDream-ai/HiDream-E1-1
- Modelo base HiDream-I1-Full: https://huggingface.co/HiDream-ai/HiDream-I1-Full
- Repositorio de código HiDream-I1: https://github.com/HiDream-ai/HiDream-I1
- Informe técnico: https://arxiv.org/abs/2505.22705
- Text encoder Llama-3.1-8B-Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Text encoder T5-v1_1-XXL: https://huggingface.co/google/t5-v1_1-xxl
- Producto comercial del autor: https://vivago.ai/
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los resultados obtenidos correspondían a dominios sin relación con el tema.
