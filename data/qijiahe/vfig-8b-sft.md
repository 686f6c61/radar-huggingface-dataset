# QijiaHe/VFIG-8B-SFT

## Resumen

VFIG-8B-SFT es un modelo de visión-lenguaje especializado en la conversión de imágenes de figuras científicas a código SVG vectorial. Lo desarrolla QijiaHe y se construye mediante un ajuste supervisado (SFT) con LoRA de rango 64 y alpha 128 sobre Qwen3-VL-8B-Instruct, con los pesos del adaptador fusionados en el modelo base. El resultado es un checkpoint BF16 de aproximadamente 8.770 millones de parámetros que hereda la arquitectura transformer multimodal de la familia Qwen3-VL.

El problema que aborda es concreto: la reconstrucción automática de gráficos, diagramas y figuras de publicaciones técnicas como código vectorial editable (SVG) en lugar de imágenes rasterizadas. Esto resulta relevante para pipelines de edición editorial, accesibilidad de documentos científicos y generación automática de material gráfico reproducible. El modelo se publica junto con el dataset VFIG-Data y un paper asociado (arXiv 2603.24575), y existe una variante VFIG-4B tras entrenamiento con refuerzo.

La ficha se basa únicamente en la información disponible en la model card y en los metadatos de Hugging Face. No se han publicado detalles sobre composición exacta del dataset de SFT, número de tokens de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (Qwen3-VL) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), tokenizer, image processor y chat template incluidos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa entradas de imagen y texto. Sobre esa base se aplica un ajuste supervisado con LoRA de rango 64 y alpha 128 (Stage 2), cuyos pesos se fusionan en el checkpoint final. El repositorio contiene los pesos en BF16, el tokenizer, el procesador de imagen y la plantilla de chat, lo que permite cargarlo directamente con `Qwen3VLForConditionalGeneration` de la librería `transformers`.

La tarea de entrenamiento es image-to-code: dada una imagen de una figura científica, el modelo genera el código fuente SVG que la recrea. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset VFIG-Data ni si hubo etapas adicionales de RLHF o DPO en este checkpoint. La existencia de una variante VFIG-4B tras refuerzo sugiere que el pipeline completo incluye SFT y RL, pero este repositorio corresponde únicamente a la etapa SFT.

## Capacidades

- Generación de código SVG a partir de imágenes de figuras científicas (image-to-svg).
- Comprensión de figuras y diagramas técnicos (figure-understanding).
- Generación de código a partir de imágenes (image-to-code) en el dominio de gráficos vectoriales.
- Procesamiento conjunto de imagen y texto gracias a la arquitectura Qwen3-VL subyacente.
- Conversación multimodal mediante la plantilla de chat incluida.
- No se documentan en la información disponible capacidades de tool calling, agentes, modo thinking, audio ni otras modalidades más allá de imagen-texto.

## Casos de uso

- Reconstrucción de figuras de papers: dado el PDF rasterizado de una figura, el modelo genera el SVG editable correspondiente para su reutilización en nuevas publicaciones.
- Edición editorial científica: sustitución de imágenes rasterizadas por versiones vectoriales escalables en maquetación de revistas y libros técnicos.
- Accesibilidad documental: conversión de gráficos a SVG con estructura explícita que facilita su descripción y adaptación para lectores de pantalla.
- Generación de material didáctico: recreación vectorial de diagramas de libros de texto para producir versiones adaptadas a distintos formatos y resoluciones.
- Pipelines de documentación técnica: integración en flujos automáticos que conviertan figuras de informes en SVG reproducibles y versionables en repositorios.
- Investigación en gráficos vectoriales: uso como modelo de referencia para estudiar la calidad de la generación image-to-svg y para comparar con la variante VFIG-4B tras RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del checkpoint completo en BF16: aproximadamente 17,5 GB (tamaño del repositorio), por lo que la inferencia en BF16 requiere del orden de 17-20 GB de VRAM solo para los pesos.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) con margen limitado para activaciones y procesamiento de imagen.
- En GPUs de consumo: cabe en RTX 4090 en BF16 con batch pequeño; en tarjetas de 16 GB o menos sería necesaria cuantización, aunque no se documentan en la información disponible formatos GGUF o cuantizaciones oficiales.
- Opciones de despliegue: carga directa con `transformers` mediante `Qwen3VLForConditionalGeneration` y `AutoProcessor`, tal como indica la model card. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VFIG-8B-SFT | 8.767 M | no disponible | Image-to-SVG sobre Qwen3-VL-8B | no disponible | Hugging Face (QijiaHe) |
| VFIG-4B | no disponible | no disponible | Image-to-SVG tras RL | no disponible | Hugging Face (XunmeiLiu) |
| Qwen3-VL-8B-Instruct | ~8B (familia Qwen3-VL) | no disponible | Vision-lenguaje general | no disponible | Hugging Face (Qwen) |

La comparativa se limita a los modelos mencionados en la información disponible. No se dispone de datos de rendimiento comparado entre ellos.

## Limitaciones y advertencias

- El modelo está especializado en figuras científicas; su comportamiento fuera de ese dominio no está documentado y probablemente degrade respecto al modelo base.
- La licencia no está indicada en la información disponible, por lo que no puede confirmarse el uso comercial sin consultar el repositorio.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-VL-8B-Instruct hereda los del modelo base, no evaluados aquí.
- Riesgo de alucinación en la generación de SVG: el código puede ser sintácticamente válido pero no reproducir fielmente la figura original.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento en entradas largas o multilingües.
- Al ser un checkpoint SFT sin RL posterior, puede presentar menor robustez que la variante VFIG-4B entrenada con refuerzo.
- No se documentan cuantizaciones oficiales ni recetas de despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/QijiaHe/VFIG-8B-SFT
- Paper: https://arxiv.org/abs/2603.24575
- Dataset VFIG-Data: https://huggingface.co/datasets/QijiaHe/VFIG-Data
- Variante VFIG-4B tras RL: https://huggingface.co/XunmeiLiu/VFIG-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
