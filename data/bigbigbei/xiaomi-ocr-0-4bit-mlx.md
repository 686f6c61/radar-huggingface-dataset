# bigbigbei/Xiaomi-OCR-0-4bit-mlx

## Resumen

Xiaomi-OCR-0-4bit-mlx es una cuantizacion a 4 bits en formato MLX del modelo Xiaomi-OCR-0, un modelo de vision-lenguaje de 0,8 mil millones de parametros especializado en OCR y parseo de documentos. Lo publica el usuario bigbigbei sobre el checkpoint original de SeerRay-Lab, y su proposito es permitir la inferencia de un VLM de OCR en Apple Silicon con un consumo de memoria reducido (unos 622 MB frente a los 1,6 GB en bf16).

El modelo base emplea una arquitectura hibrida Qwen3.5: combina capas de atencion lineal Gated DeltaNet con capas de atencion completa periodicas, y anade un codificador visual ViT de la familia Qwen3-VL. Esta orientado a la extraccion de texto en imagenes de documentos, incluyendo formulas densas y escritura manual, y su ventana de contexto amplia (heredada de la familia Qwen3.5) resulta util para paginas completas.

Su relevancia actual radica en que ofrece OCR de alta resolucion de forma local y nativa en macOS, sin depender de servicios en la nube, con licencia Apache-2.0 y compatibilidad tanto con `mlx-vlm` en Python como con `mlx-swift-lm` en Swift. El repositorio tiene un unico commit y cero descargas en el momento de la consulta, por lo que debe considerarse una publicacion reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5 (Gated DeltaNet linear attention + atencion completa periodica) con ViT Qwen3-VL |
| Parametros totales | 852.985.920 (~0,85 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afina, group size 64, mixta (vision y algunas capas en mayor precision); bf16 en el modelo base |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer hibrido de la familia Qwen3.5. Intercala capas de atencion lineal basadas en Gated DeltaNet, que reducen el coste computacional en secuencias largas, con capas de atencion completa que se aplican de forma periodica para preservar la capacidad de modelar dependencias globales. El componente visual es un ViT de Qwen3-VL, encargado de proyectar las imagenes al espacio de tokens del modelo de lenguaje.

La cuantizacion de este repositorio aplica cuantizacion afina a 4 bits con group size 64 sobre los pesos bf16 originales, manteniendo en mayor precision el codificador visual y algunas capas concretas. El autor no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el proceso de alineacion del modelo base. Como ajustes tecnicos, el repositorio modifica `tokenizer_config.json` (fija `tokenizer_class` a `PreTrainedTokenizer`) y `preprocessor_config.json` (config plana del procesador de imagen) para que los cargadores estrictos de Swift acepten el checkpoint.

## Capacidades

- Extraccion de texto (OCR) en imagenes de documentos, con soporte declarado para formulas densas y escritura manual.
- Parseo de documentos: conversion de paginas a texto estructurado.
- Generacion conversacional de image-text-to-text mediante plantilla de chat.
- Procesamiento de imagenes a resolucion completa gracias a un presupuesto de pixeles configurable (`min_pixels=65536`, `max_pixels=16777216`).
- Inferencia nativa en Apple Silicon mediante MLX, tanto en Python (`mlx-vlm`) como en Swift (`mlx-swift-lm`).
- Soporte multilingue limitado al ingles segun la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento agente multi-paso.

## Casos de uso

- Digitalizacion de documentos en macOS: el modelo puede ejecutarse de forma local con `mlx-vlm` o `mlx-swift-lm` para convertir imagenes de paginas escaneadas en texto, sin enviar datos a servicios externos.
- Extraccion de formulas cientificas: el presupuesto de pixeles alto (`max_pixels=16777216`) permite procesar formulas densas a resolucion completa, util en articulos academicos y apuntes tecnicos.
- Reconocimiento de escritura manual: el modelo base declara soporte para OCR de manuscritos, aplicable a digitalizacion de notas y formularios rellenados a mano.
- Integracion en aplicaciones Swift nativas: mediante `MlxOCRKit` y el comando `minerukit xiaomi-ocr`, se puede incorporar OCR on-device en apps de macOS sin backend.
- Preprocesado de pipelines RAG: convertir PDFs e imagenes de documentos en texto para alimentar sistemas de recuperacion, con la ventaja de que el modelo cabe en memoria de un Mac moderno.
- Prototipado y evaluacion local: con solo 622 MB, permite probar rapidamente la calidad de OCR de la familia Qwen3.5 en un portatil antes de comprometerse con un despliegue mayor.
- Automatizacion de archivo documental: procesamiento por lotes de imagenes de documentos en un Mac con memoria unificada, aprovechando la cuantizacion a 4 bits para reducir el consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 622 MB para los pesos en 4 bits, mas el coste del procesador de imagen y los estados de activacion; en la practica se recomienda al menos 4-8 GB de memoria unificada disponibles.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante MLX; no hay soporte documentado para CUDA.
- Cabe en cualquier Mac con Apple Silicon; el modelo base en bf16 (1,6 GB) tambien es viable en la mayoria de configuraciones.
- Opciones de despliegue: `mlx-vlm` (Python), `mlx-swift-lm` y `MlxOCRKit` (Swift). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Xiaomi-OCR-0-4bit-mlx | ~0,85 B | no disponible | Apache-2.0 | MLX (Apple Silicon) | Cuantizacion 4 bits de OCR especializado |
| Xiaomi-OCR-0 (base) | ~0,85 B | no disponible | Apache-2.0 | safetensors bf16 | Checkpoint original, 1,6 GB |
| Otros VLM de OCR de ~1 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar los terminos del checkpoint original de SeerRay-Lab.
- Validacion: el repositorio tiene cero descargas y un unico commit; no hay evidencia de comunidad ni evaluaciones independientes.
- Plataforma: la cuantizacion MLX solo funciona en Apple Silicon; no es portable a CUDA ni a CPU generica sin reconversion.
- Riesgo de alucinacion: no cuantificado; como todo VLM, puede generar texto plausible ausente en la imagen, especialmente en documentos de baja calidad.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de documentos muy extensos.
- Ajustes de compatibilidad: las modificaciones en `tokenizer_config.json` y `preprocessor_config.json` estan pensadas para Swift y pueden requerir revision si se integran en otros pipelines.
- Precision: la cuantizacion a 4 bits puede degradar la precision en OCR de caracteres pequenos o formulas complejas respecto al modelo bf16.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bigbigbei/Xiaomi-OCR-0-4bit-mlx
- Modelo base: https://huggingface.co/SeerRay-Lab/Xiaomi-OCR-0
- Modelo base referenciado en metadatos: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- MLX: https://github.com/ml-explore/mlx
- mlx-vlm: no disponible (referenciado en la model card sin URL)
- mlx-swift-lm: no disponible (referenciado en la model card sin URL)
- MlxOCRKit: no disponible (referenciado en la model card sin URL)
