# prithivMLmods/WeMM-Ecom-9B-GGUF

## Resumen

WeMM-Ecom-9B es un modelo denso multimodal de visión-lenguaje de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) desarrollado por WeChat Vision (Tencent) a partir de Qwen3.5-9B. Su objetivo es el entendimiento de contenido de comercio electrónico sin sacrificar capacidades de razonamiento general, y acepta entradas de texto, imagen única, múltiples imágenes y vídeo con una ventana de contexto de 262.144 tokens en chino e inglés.

La versión aquí documentada, WeMM-Ecom-9B-GGUF, es una conversión a formato GGUF publicada por el usuario prithivMLmods mediante llama.cpp, que incluye además soporte de Multi-Token Prediction (MTP) para decodificación especulativa integrada en los propios pesos. Esto permite acelerar la inferencia local sin necesidad de un modelo borrador separado, algo relevante para despliegues en hardware de consumo.

El modelo resulta de interés ahora porque combina un contexto muy largo, capacidades multimodales y un modo de razonamiento híbrido conmutable (`enable_thinking`), todo bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de comercio electrónico: extracción de atributos de producto, emparejamiento de SKU, moderación, OCR y recuperación visual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), base Qwen3.5-9B; decodificación especulativa MTP |
| Parámetros totales | 9.197.093.888 (aproximadamente 9,2 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | BF16, FP8, GPTQ (en el modelo base); GGUF: BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con MTP); el modelo base en Safetensors BF16, FP8 y GPTQ |

## Arquitectura y entrenamiento

WeMM-Ecom-9B se construye sobre Qwen3.5-9B como modelo base y añade capacidades multimodales para texto, imagen única, múltiples imágenes y vídeo. La arquitectura es un transformer denso con proyección multimodal (el repositorio GGUF incluye un fichero `mmproj` en BF16 de 922 MB para las capacidades de visión). Incorpora un modo de razonamiento híbrido conmutable mediante `enable_thinking`, que alterna entre respuestas directas de tipo instruct y razonamiento paso a paso delimitado por etiquetas `<think>`.

La innovación técnica destacable de esta conversión es la integración de Multi-Token Prediction (MTP): los ficheros GGUF incluyen cabeceras de salida adicionales dentro de la arquitectura principal que predicen varios tokens futuros en una sola pasada, habilitando decodificación especulativa sin modelo borrador externo. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset ni los detalles de RLHF/DPO aplicados.

## Capacidades

- Generación de texto y razonamiento general, con rendimiento declarado superior al de Qwen3.5-9B en benchmarks multimodales generales.
- Comprensión multimodal: texto, imagen única, múltiples imágenes y vídeo.
- Entendimiento específico de comercio electrónico: extracción de atributos de producto, emparejamiento de SKU, moderación de contenido, OCR, recuperación (retrieval) y grounding visual.
- Modo de razonamiento híbrido conmutable (`enable_thinking`) entre respuesta directa y razonamiento paso a paso.
- Conversación multi-turno con ventana de contexto de 262.144 tokens.
- Capacidades multilingües limitadas a inglés y chino.
- Decodificación especulativa mediante MTP integrado en los pesos GGUF.
- Soporte de despliegue en Transformers, vLLM y SGLang (modelo base); llama.cpp para los GGUF.

## Casos de uso

- Extracción de atributos de producto: el modelo puede procesar fichas e imágenes de producto y devolver atributos estructurados (material, talla, color, compatibilidad), aprovechando sus 28 benchmarks de comercio electrónico orientados a esta tarea.
- Emparejamiento de SKU: comparación entre descripciones e imágenes de catálogo para detectar duplicados o variantes equivalentes, con soporte de múltiples imágenes en una misma petición.
- Moderación de contenido de marketplace: análisis de imágenes y texto de anuncios para detectar contenido no permitido, apoyándose en el modo de razonamiento paso a paso para justificar decisiones.
- OCR y digitalización de catálogo: extracción de texto de etiquetas, embalajes y fichas escaneadas en inglés y chino, con contexto largo para procesar lotes extensos en una sola ventana.
- Recuperación visual (visual retrieval): indexación y búsqueda de productos por imagen dentro de catálogos grandes, gracias a la ventana de 262.144 tokens que permite incluir mucho contexto documental.
- Asistente conversacional de atención al cliente: gestión de conversaciones multi-turno sobre pedidos y productos con contexto largo, alternando respuestas directas y razonamiento según necesidad.
- Análisis de vídeo de producto: comprensión de vídeos demostrativos o unboxings para generar descripciones y resúmenes automáticos.
- Despliegue local en hardware de consumo: con las cuantizaciones Q4_K_M (5,83 GB) o Q5_K_M (6,67 GB) puede ejecutarse en estaciones con GPU de gama alta para pruebas y prototipado sin infraestructura cloud.

## Benchmarks y rendimiento

Los datos disponibles son agregados proporcionados por el autor del modelo base:

| Benchmark | WeMM-Ecom-9B | Qwen3.5-9B | Valley3-8B |
|---|---|---|---|
| Media en 28 benchmarks de comercio electrónico | +5,19 puntos frente a Qwen3.5-9B | referencia | +10,28 puntos frente a Valley3-8B |
| Media en 64 benchmarks multimodales generales | +0,83 puntos frente a Qwen3.5-9B | referencia | +13,02 puntos frente a Valley3-8B |

No se han publicado resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores anteriores son diferencias medias agregadas, no puntuaciones absolutas.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF): Q3_K_M 4,8 GB; Q4_K_S 5,49 GB; Q4_K_M 5,83 GB; Q5_K_M 6,67 GB; Q6_K 7,56 GB; Q8_0 9,79 GB; BF16 18,4 GB. Añadir aproximadamente 0,9 GB para el fichero `mmproj` de visión.
- GPU recomendadas: para BF16, GPU de 24 GB o más (RTX 4090, A100 40/80 GB, H100). Para cuantizaciones Q4/Q5, GPU de 8-12 GB pueden ser suficientes, aunque el contexto largo de 262.144 tokens incrementa notablemente el consumo de memoria KV.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3 a Q5 en tarjetas de 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4080); la cuantización Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp para los GGUF (con soporte MTP para decodificación especulativa); Transformers, vLLM y SGLang para el modelo base en Safetensors.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa MTP está diseñada para acelerar la inferencia local, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Ecom-9B | 9,2 B (denso) | 262.144 tokens | Texto, imagen, multi-imagen, vídeo | Apache 2.0 | Safetensors, FP8, GPTQ, GGUF |
| Qwen3.5-9B | 9 B (denso) | No disponible | Texto y multimodal general | No disponible | No disponible |
| Valley3-8B | 8 B (denso) | No disponible | Multimodal general | No disponible | No disponible |

WeMM-Ecom-9B supera a Qwen3.5-9B en una media de 5,19 puntos en benchmarks de comercio electrónico y 0,83 puntos en benchmarks multimodales generales, y a Valley3-8B en 10,28 y 13,02 puntos respectivamente. No se dispone de datos de contexto ni de licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano ni de otros idiomas, por lo que su uso en español requeriría validación previa.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en extracción de atributos y OCR sobre imágenes de baja calidad.
- El contexto de 262.144 tokens, aunque amplio, incrementa el consumo de memoria KV y puede degradar el rendimiento en hardware limitado.
- Los benchmarks disponibles son diferencias medias agregadas; no hay puntuaciones absolutas por tarea que permitan estimar el rendimiento en casos concretos.
- La conversión GGUF y el soporte MTP son obra de un tercero (prithivMLmods), no del equipo original de Tencent; conviene validar la calidad de las cuantizaciones antes de usarlas en producción.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base Qwen3.5-9B y sus dependencias mantengan condiciones compatibles.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/WeMM-Ecom-9B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
