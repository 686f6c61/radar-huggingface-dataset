# huangdffs/Aniimage-2

## Resumen

Aniimage-2 es un modelo de generación de imágenes de estilo anime desarrollado por el usuario huangdffs (publicado también bajo la organización 8BitStudio en la model card). Se trata del segundo modelo público de la serie Aniimage y ha sido entrenado desde cero, sin partir de pesos preentrenados de otros modelos, lo que lo distingue de la mayoría de modelos de difusión disponibles que se derivan de Stable Diffusion. Emplea una arquitectura de difusión latente clásica compuesta por UNet, VAE y codificador de texto CLIP, con 441,9 millones de parámetros totales.

El modelo genera imágenes de 512x512 píxeles a partir de descripciones textuales en inglés, y fue entrenado sobre aproximadamente 1,2 millones de imágenes de anime curadas procedentes de Danbooru y otras fuentes. Su relevancia radica en que demuestra que es posible entrenar un modelo de difusión de anime funcional desde cero con recursos relativamente modestos (una única NVIDIA RTX 5060 Ti de 16 GB), lo que lo convierte en un caso interesante tanto para investigación como para despliegues ligeros.

Frente a Aniimage-1, la model card destaca mejoras notables en la generación de fondos y en la fiabilidad de personajes masculinos, aunque persisten limitaciones conocidas en la representación de manos. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para prompts cortos en inglés, admitiendo tanto lenguaje natural como etiquetas de Danbooru.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + VAE + CLIP) |
| Parámetros totales | 441.917.188 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin contexto de tokens especificado) |
| Tipos de cuantización | no disponible (pesos safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

Aniimage-2 es un modelo de difusión latente con la tríada habitual: un UNet que realiza el proceso de denoising en el espacio latente, un VAE que codifica y decodifica entre píxeles y latentes, y un codificador de texto CLIP que condiciona la generación sobre el prompt. La resolución nativa es de 512x512 píxeles. El UNet se entrenó desde cero, sin inicialización a partir de modelos existentes, según indica explícitamente la model card.

El entrenamiento se realizó durante 70.000 pasos con un tamaño de lote de 64, sobre un conjunto de aproximadamente 1,2 millones de imágenes de anime curadas de Danbooru y otras fuentes. Todo el entrenamiento se llevó a cabo en una única GPU NVIDIA RTX 5060 Ti de 16 GB. El scheduler recomendado para inferencia es DPM++ SDE con 50 pasos. No se documentan en la información disponible detalles sobre uso de RLHF, DPO ni otras técnicas de alineación, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes de anime a partir de texto (text-to-image) a resolución 512x512.
- Acepta tanto lenguaje natural en inglés ("A smiling anime girl with red hair and a school uniform") como etiquetas de Danbooru ("1girl, solo, smile, red_hair, school_uniform, anime_coloring").
- Mejora sustancial en la generación de fondos y escenarios respecto a Aniimage-1 (según la comparativa de la model card).
- Mayor fiabilidad en la generación de personajes masculinos que su predecesor.
- Soporte de prompt negativo, recomendado para obtener buena calidad.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento (no aplica a un modelo de difusión text-to-image).
- Capacidad multilingüe limitada al inglés según la metadata del modelo.

## Casos de uso

- Ilustración de personajes para proyectos indie: el modelo genera retratos y figuras de anime a 512x512 con prompts cortos, adecuado para prototipado rápido de arte conceptual en estudios pequeños que no disponen de GPUs de gran capacidad.
- Generación de fondos y escenarios: la model card destaca la mejora en fondos respecto a Aniimage-1, por lo que resulta útil para producir escenarios de anime (bosques, interiores, paisajes) que sirvan como base para composición posterior.
- Creación de assets para videojuegos o novelas visuales: al ser un modelo ligero (441,9 M de parámetros) y requerir solo ~6 GB de VRAM, puede ejecutarse en estaciones de trabajo modestas para generar sprites o ilustraciones de apoyo.
- Experimentación e investigación en difusión desde cero: al estar entrenado sin pesos preentrenados, sirve como caso de estudio reproducible para investigar el entrenamiento de modelos de difusión de dominio específico con hardware de consumo.
- Filtrado y aumento de datasets de anime: puede emplearse para generar variaciones controladas de imágenes de entrenamiento con etiquetas de Danbooru, ampliando datasets de estilo anime.
- Despliegue en entornos con recursos limitados: con ~6 GB de VRAM mínimos y ~7 GB de RAM, es viable en GPUs de consumo (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB) para pipelines de generación por lotes de baja latencia relativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6 GB mínimo según la model card; se recomiendan 8 GB o más.
- RAM de CPU: ~7 GB mínimo; se recomiendan 10 GB o más. La generación en CPU es extremadamente lenta según el autor.
- GPU recomendadas: el modelo se entrenó en una NVIDIA RTX 5060 Ti de 16 GB; para inferencia basta con GPUs de consumo con 8 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB). No se documentan requisitos para A100 o H100, aunque por tamaño cabría en cualquiera de ellas.
- Cabe en GPU de consumo: sí, con 8 GB o más de VRAM.
- Opciones de despliegue: librería diffusers (pipeline text-to-image), con script `generate_images.py` proporcionado por el autor y notebook de Colab interactivo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles en la información proporcionada. Se recomienda DPM++ SDE con 50 pasos para calidad óptima.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto/condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aniimage-2 | 441,9 M | 512x512 | CLIP, inglés | Apache 2.0 | Hugging Face (diffusers) |
| Aniimage-1 | no disponible | no disponible | CLIP, inglés | Apache 2.0 (según enlace) | Hugging Face |
| Stable Diffusion 1.5 (referencia de categoría) | ~860 M (UNet) | 512x512 | CLIP, multilingüe limitado | CreativeML OpenRAIL-M | Amplia |
| Modelos de anime derivados de SD (p. ej. Anything, NAI) | variable | 512x512 | CLIP | variable | Comunidad |

Nota: los datos de Aniimage-1 y de los modelos de referencia no se han verificado en la información proporcionada; se incluyen como contexto de categoría. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Generación de manos deficiente: el modelo puede producir manos con más o menos de cinco dedos, o que se funden con superficies de colores similares, según reconoce el autor.
- Menor fiabilidad en personajes masculinos que femeninos: puede requerir múltiples intentos para obtener un resultado aceptable.
- Sesgos de dominio: entrenado exclusivamente con imágenes de anime de Danbooru, por lo que su estilo y distribución están fuertemente sesgados hacia ese dominio y no es adecuado para fotorrealismo.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir anatomía distorsionada, artefactos o elementos incoherentes, especialmente con prompts largos o complejos.
- Idiomas: solo inglés; los prompts en otros idiomas pueden degradar la calidad.
- Prompts largos o "enhanced prompts" suelen empeorar los resultados según el autor; se recomienda mantenerlos cortos.
- Requiere prompt negativo para buena calidad; sin él, la salida puede ser deficiente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la originalidad de las imágenes generadas ni sobre posibles derechos de terceros derivados del dataset de entrenamiento (Danbooru).
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes, lo que implica riesgo en producción por falta de pruebas independientes.

## Enlaces

- Hugging Face: https://huggingface.co/huangdffs/Aniimage-2
- Model card (organización 8BitStudio): https://huggingface.co/8BitStudio/Aniimage-2
- Aniimage-1: https://huggingface.co/8BitStudio/Aniimage-1
- Notebook de Colab interactivo: https://colab.research.google.com/#fileId=https://huggingface.co/8BitStudio/Aniimage-2/blob/main/Aniimage_2_Interactive_Colab.ipynb
- Script de generación: https://huggingface.co/8BitStudio/Aniimage-2/resolve/main/generate_images.py
- Danbooru (fuente del dataset): https://danbooru.donmai.us/
