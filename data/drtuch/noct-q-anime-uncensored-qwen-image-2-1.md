# drtuch/Noct-Q-Anime-Uncensored-Qwen-Image-2.1

## Resumen

Noct Q Anime Uncensored Qwen Image 2.1 es un modelo de generación de imágenes texto-a-imagen derivado de Qwen/Qwen-Image-2.1 mediante la modificación de los pesos del transformer (relación declarada como "merge"). Lo publica el usuario drtuch en Hugging Face y su finalidad es la ilustración anime sin filtros de contenido, incluyendo desnudos y escenas explícitas con personajes adultos. Se distribuye como un único archivo safetensors en cuantización int8, pensado para cargarse en ComfyUI.

El modelo se apoya en la arquitectura de Qwen-Image 2.1, un modelo de difusión para texto-a-imagen, y conserva su text encoder (Qwen3-VL 8B) y su VAE, que se descargan por separado desde el repositorio oficial de Comfy-Org. El repositorio ocupa 7,3 GB, lo que corresponde al archivo int8 del transformer; el autor indica que existen variantes int4, fp8, bf16 y fp16 alojadas en Civitai.

Su relevancia es acotada: se trata de un fine-tune/merge de nicho, con cero descargas y cero likes en el momento de la consulta, publicado el 10 de noviembre de 2026. Resulta de interés para quienes necesiten generación de ilustración anime con seguimiento estricto de prompts largos y sin censura, pero su licencia Qwen Research limita el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (single-file) derivado de Qwen/Qwen-Image-2.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (archivo publicado); int4, fp8, bf16 y fp16 disponibles según el autor en Civitai |
| Idiomas soportados | no disponible (el prompt se documenta en inglés; la model card incluye una nota en chino) |
| Licencia | Qwen Research License Agreement (uso no comercial) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre el proceso de entrenamiento. La model card indica únicamente que el modelo es un trabajo derivado de Qwen/Qwen-Image-2.1 "con pesos del transformer modificados" y que la relación con el modelo base es de tipo "merge". No se especifican tokens de entrenamiento, composición del dataset, número de pasos de fine-tuning ni uso de RLHF/DPO (técnicas no aplicables de forma estándar a modelos de difusión).

El pipeline completo requiere tres componentes: el transformer cuantizado a int8 (`NoctQA_V1_int8_convrot.safetensors`, 7,3 GB), el text encoder `qwen3vl_8b_int8_convrot.safetensors` (Qwen3-VL 8B en int8) y el VAE `qwen_image_2.1_vae_bf16.safetensors`. La nomenclatura "convrot" sugiere una variante de cuantización con rotación de canales orientada a ComfyUI. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de ilustración anime: retratos cerrados, planos medios y pinturas de fondo amplias.
- Representación de personajes adultos vestidos, en lencería o desnudos, y escenas explícitas.
- Seguimiento de prompts largos y detallados, incluyendo dos personajes simultáneos, poses y ángulos de cámara especificados.
- Control de estilo mediante la inclusión explícita de la palabra "anime" en el prompt; sin ella, el modelo tiende a generar fotorrealismo.
- No requiere trigger word.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio; es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Ilustración de personajes para proyectos de ficción o cómic: el modelo mantiene la coherencia de estilo anime y permite describir poses y composiciones complejas en prompts largos, lo que facilita generar paneles o fichas de personaje de forma iterativa.
- Creación de arte conceptual para videojuegos con estética anime: útil para explorar variaciones de diseño de personajes y escenarios con luz suave y color limpio, antes de pasar a un artista humano.
- Generación de fondos ilustrados: la model card destaca su rendimiento en "wide background paintings", adecuado para escenarios de visual novels o fondos de interfaz.
- Contenido para adultos con personajes ficticios: el modelo está entrenado para escenas explícitas con personajes adultos, un nicho que los modelos base suelen rechazar; requiere verificación de edad y cumplimiento normativo por parte del usuario.
- Prototipado rápido de ilustraciones en ComfyUI: el flujo de trabajo incluido (`NoctQ_Anime_V1_workflow.json`) permite arrastrar y ejecutar con ajustes predefinidos (25 pasos, euler, simple, CFG 3), lo que reduce el tiempo de configuración.
- Investigación sobre fine-tuning de modelos de difusión: al ser un derivado documentado de Qwen-Image 2.1 con cuantización int8, sirve como caso de estudio para evaluar la degradación de calidad por cuantización en tareas de ilustración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que el archivo int8 está pensado para tarjetas de 8 a 12 GB.
- GPU recomendadas: no se especifican modelos concretos; por el rango de VRAM, encaja en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; también en A100/H100 aunque no se documenta.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas de 8 a 12 GB con la cuantización int8.
- Despliegue: ComfyUI versión 0.37 o superior, solo con nodos core. El transformer va en `models/diffusion_models`, el text encoder en `models/text_encoders` y el VAE en `models/vae`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión).
- Latencia y throughput: no disponibles. Los ajustes recomendados son 25 pasos, sampler euler, scheduler simple y CFG 3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Noct Q Anime Uncensored Qwen Image 2.1 | no disponible | no disponible | Qwen Research (no comercial) | Hugging Face (int8), Civitai (int4/fp8/bf16/fp16) | Derivado de Qwen-Image 2.1, orientado a anime sin censura |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | Qwen Research | Hugging Face (oficial) | Modelo base; sin fine-tune de anime ni contenido explícito |
| Alternativas de anime sin censura basadas en SDXL | no disponible | no disponible | variables (CreativeML, otras) | Civitai, Hugging Face | Ecosistema amplio, pero sin datos verificables en la información disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Licencia Qwen Research License Agreement: uso gratuito únicamente no comercial. Cualquier uso comercial requiere licencia aparte del titular de los derechos (Hangzhou Tongyi Laboratory Technology Co., Ltd.).
- Contenido NSFW explícito: el modelo genera desnudos y escenas sexuales; requiere control de acceso, verificación de edad y cumplimiento de la normativa aplicable en cada jurisdicción.
- Riesgo de alucinación visual: como todo modelo de difusión, puede producir anatomías incorrectas, artefactos en manos y ojos, o incoherencias en escenas con dos personajes.
- Sesgo de estilo: sin la palabra "anime" en el prompt el modelo deriva hacia fotorrealismo, lo que puede producir resultados no deseados.
- Idiomas: no se documenta soporte multilingüe; los ejemplos y la guía de prompting están en inglés.
- Cuantización int8: puede degradar el detalle fino respecto a las variantes bf16/fp16, que solo están disponibles fuera de Hugging Face (Civitai).
- Madurez: repositorio con cero descargas y cero likes, publicado y actualizado el mismo día; sin validación comunitaria ni benchmarks publicados.
- Dependencia de ComfyUI 0.37 o superior con nodos core; no se documentan otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/drtuch/Noct-Q-Anime-Uncensored-Qwen-Image-2.1
- Galería, prompts y variantes en Civitai: https://civitai.com/models/2967534
- Text encoder (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia (referenciada en la model card): https://huggingface.co/Noctaluna/Noct-Q-Anime-Uncensored-Qwen-Image-2.1/blob/main/LICENSE
