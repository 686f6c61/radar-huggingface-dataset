# AnosVoldigoad1/Qwen3.5-2B-heretic-INT8-ConvRot

## Resumen

Qwen3.5-2B-heretic-INT8-ConvRot es una compilación cuantizada de un solo archivo del modelo `coder3101/Qwen3.5-2B-heretic`, un fine-tune multilingüe y multimodal de la familia Qwen3.5 con 2.000 millones de parámetros. La publica el usuario AnosVoldigoad1 y su rasgo distintivo es el esquema de cuantización INT8 con rotación Hadamard en línea (denominado ConvRot), pensado para conservar la precisión en tareas de grounding visual mientras reduce el peso a unos 2,85 GiB en un único `.safetensors`.

El modelo hereda las capacidades del base: procesamiento de texto e imagen, con especial énfasis en localización visual mediante cajas delimitadoras (bounding boxes). La cuantización aplica INT8 por tensor con grupos de 256 y rotación Householder-4, manteniendo en BF16 las capas sensibles a la precisión (codificador visual, embeddings, `lm_head` y normalizaciones) para no degradar la localización de objetos.

Es relevante para quienes necesitan desplegar un modelo multimodal pequeño en entornos con recursos limitados, especialmente dentro de ComfyUI o el motor nativo de P.AI AI Image Studio, que reconocen el formato `comfy_quant`. No obstante, la ficha del autor es muy escasa en datos de entrenamiento, licencia e idiomas, por lo que buena parte de las especificaciones quedan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), base Qwen3.5; detalles no disponibles |
| Parámetros totales | 2B (según nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 tensorwise con rotación Hadamard en línea (convrot, group_size=256, per_channel=true); capas preservadas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors único (`qwen35_2b_heretic_int8_convrot.safetensors`, 2,85 GiB) con sidecar `.comfy_quant` JSON |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-2B, etiquetado como "Heretic v1.2.0 (MPOA uncensored)", lo que sugiere un ajuste orientado a eliminar restricciones de rechazo del modelo original. La arquitectura subyacente es un transformer multimodal de la familia Qwen3.5, con un codificador visual (`visual.*`) que procesa imágenes junto al texto. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica de esta compilación es la cuantización ConvRot: pesos INT8 por tensor con rotación Hadamard Householder-4 aplicada en línea y agrupación de 256 elementos. Las capas críticas para el grounding visual se mantienen en BF16, lo que según el autor preserva aproximadamente el 99,9 % de la precisión en cajas delimitadoras 2D, con una similitud coseno mínima de 0,99996. El archivo contiene 150 capas INT8-ConvRot y 467 tensores en BF16/FP32.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base Qwen3.5-2B.
- Procesamiento multimodal de imágenes (entrada visual junto a texto).
- Grounding visual: localización de objetos mediante cajas delimitadoras 2D, con precisión preservada por el diseño de cuantización.
- Capacidades multilingües: presumibles por la familia Qwen3.5, aunque no confirmadas en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Grounding visual en pipelines de generación de imágenes: el modelo puede localizar objetos y regiones en una imagen mediante cajas delimitadoras, lo que permite integrarlo en flujos de ComfyUI para segmentación guiada o inpainting selectivo. Su cuantización preserva el codificador visual en BF16 precisamente para este fin.
- Anotación automática de datasets: generar bounding boxes sobre imágenes para preetiquetar conjuntos de datos de detección de objetos, reduciendo el trabajo manual. El formato INT8 permite ejecutarlo en GPUs de gama media.
- Edición de imágenes asistida por lenguaje: dentro de P.AI AI Image Studio o ComfyUI, usar descripciones textuales para identificar y aislar regiones concretas antes de aplicar transformaciones.
- Prototipado rápido de aplicaciones multimodales: al pesar solo 2,85 GiB en un único archivo safetensors, es adecuado para experimentar con visión-lenguaje en estaciones de trabajo sin infraestructura de servidor.
- Despliegue en entornos con VRAM limitada: un modelo de 2B en INT8 cabe en GPUs de consumo, lo que facilita pruebas locales de tareas de grounding y descripción de imágenes.
- Investigación sobre cuantización: sirve como referencia para estudiar el impacto de la rotación Hadamard en la precisión de tareas visuales frente a cuantizaciones INT8 convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la métrica interna de preservación del grounding: `min_cos_sim=0.99996` y aproximadamente 99,9 % de precisión en cajas delimitadoras 2D respecto al modelo sin cuantizar, según el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3-4 GB para los pesos INT8 (2,85 GiB) más overhead de activaciones y contexto; el codificador visual en BF16 añade consumo adicional.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 o superiores para un margen cómodo; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM.
- Opciones de despliegue: ComfyUI, `comfy_kitchen` y P.AI AI Image Studio Native Engine (`NativeQuantLinear`), que son los entornos indicados como compatibles. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato propietario `comfy_quant`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-INT8-ConvRot | 2B | no disponible | no disponible | safetensors INT8 + sidecar | Cuantización específica para ComfyUI |
| coder3101/Qwen3.5-2B-heretic (base) | 2B | no disponible | no disponible | safetensors BF16 | Modelo sin cuantizar del que deriva |
| Qwen3.5-2B (original) | 2B | no disponible | no disponible | safetensors | Modelo de referencia de la familia |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a estas alternativas.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial está permitido; debe verificarse antes de producción.
- El fine-tune "heretic (MPOA uncensored)" está diseñado para reducir los rechazos del modelo original, lo que puede aumentar el riesgo de generar contenido inapropiado o dañino sin filtros.
- Riesgo de alucinación inherente a un modelo de 2B, especialmente en tareas de razonamiento complejo o descripciones detalladas de imágenes.
- El formato `comfy_quant` con sidecar JSON es propietario y limita la portabilidad a otros motores de inferencia habituales.
- No se dispone de información sobre sesgos, cobertura idiomática ni longitud de contexto, lo que dificulta evaluar su idoneidad para aplicaciones multilingües o de contexto largo.
- La cuantización INT8, aunque preserva el grounding, puede degradar otras capacidades (generación de texto, razonamiento) respecto al modelo en BF16; no se aportan métricas que lo cuantifiquen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- [Hugging Face: AnosVoldigoad1/Qwen3.5-2B-heretic-INT8-ConvRot](https://huggingface.co/AnosVoldigoad1/Qwen3.5-2B-heretic-INT8-ConvRot)
- [Modelo base: coder3101/Qwen3.5-2B-heretic](https://huggingface.co/coder3101/Qwen3.5-2B-heretic)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
