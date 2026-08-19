# nurdich/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot

## Resumen

Este repositorio contiene checkpoints de ComfyUI para el modelo Qwen3-VL-32B en su variante "Ultra Uncensored Heretic", adaptado al sistema de condicionamiento H3. El modelo base es `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic`, un fine-tuning de Qwen3-VL-32B-Instruct con técnicas de "abliteration" para eliminar la censura y restricciones de seguridad del modelo original. El autor `nurdich` publica este repo con el objetivo de proporcionar los componentes necesarios para usar el modelo dentro de ComfyUI como encoder de condicionamiento H3, junto con colas de generación opcionales para completar el modelo.

La arquitectura se divide en dos partes: un encoder de condicionamiento H3 que contiene las capas de lenguaje 0-49, el embedding y la torre de visión completa, y colas de generación que contienen las capas 50-63, la norma final y la cabeza de lenguaje. Se ofrecen variantes en BF16 e INT8 con cuantización ConvRot, así como formatos NVFP4/AWQ para las colas. El repositorio ocupa 128.9 GB e incluye múltiples archivos `.safetensors`. Este modelo está diseñado específicamente para flujos de trabajo de ComfyUI, no como un modelo completo de Transformers para generación directa.

La relevancia de este modelo radica en su integración con el ecosistema H3 de ComfyUI, que permite usar modelos de lenguaje multimodal como guía para la generación de imágenes. La variante "uncensored" y la cuantización INT8 lo hacen atractivo para usuarios que buscan mayor libertad creativa y menor consumo de VRAM en GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-32B) con torre de vision |
| Parametros totales | 32 mil millones (estimado, no confirmado en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8 ConvRot, NVFP4/AWQ |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints de ComfyUI) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-VL-32B-Instruct, una arquitectura transformer multimodal con un codificador de vision separado. El checkpoint de condicionamiento H3 incluye el embedding de lenguaje, las capas de lenguaje 0-49 y la torre de vision completa, omitiendo deliberadamente las capas 50-63, la norma final y la cabeza de lenguaje. Esto se debe a que H3 consume el estado oculto no normalizado despues de la capa 49. Las colas de generacion complementan el modelo con las capas restantes.

El entrenamiento especifico no esta documentado en el repositorio. El modelo base `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic` es un fine-tuning del modelo instruct original de Qwen, con tecnicas de abliteration para eliminar las restricciones de seguridad. No se proporcionan datos sobre el dataset de entrenamiento, numero de tokens ni metodos de alineacion como RLHF o DPO. La cuantizacion INT8 ConvRot utiliza grupos de 256 filas aprendidas, lo que reduce significativamente el tamano de los pesos manteniendo la precision en las capas criticas.

## Capacidades

- Generacion de texto y procesamiento de imagenes (entrada multimodal).
- Actua como encoder de condicionamiento H3 para guiar la generacion de imagenes en ComfyUI.
- Puede usarse como generador de texto independiente con el repositorio `ComfyUI-H3-Qwen3VL-TextGen`.
- Soporta prompt enhancement mediante la conexion de una cola de generacion opcional.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- El modelo "uncensored" permite generar contenido sin restricciones de seguridad, lo que amplia el rango de respuestas posibles.

## Casos de uso

- Generacion de imagenes guiada por texto en ComfyUI: el encoder H3 procesa prompts complejos y los convierte en embeddings de condicionamiento para modelos de difusion como H3. Su capacidad multimodal permite usar imagenes de referencia como entrada adicional.
- Mejora de prompts (prompt enhancement): conectando la cola de generacion 50-63 al encoder, se puede generar un prompt expandido y mas detallado antes de pasarlo al nodo H3 guide, mejorando la fidelidad de la imagen resultante.
- Generacion de texto y vision-lenguaje local: con el repositorio TextGen, el modelo puede funcionar como un chatbot multimodal independiente, respondiendo preguntas sobre imagenes o generando texto descriptivo.
- Creacion de contenido creativo sin restricciones: al ser una variante "uncensored", permite explorar temas que los modelos estandar rechazarian, util para ficcion, arte o experimentacion.
- Prototipado de pipelines de generacion multimodal: los checkpoints INT8 permiten ejecutar el modelo en GPUs con 24 GB de VRAM, facilitando el desarrollo de flujos de trabajo en equipos de gama media.
- Investigacion sobre tecnicas de abliteration y cuantizacion: el repositorio sirve como ejemplo practico de como dividir un modelo grande en componentes de condicionamiento y generacion para su uso en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye comparativas con otros modelos ni metricas de rendimiento en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Encoder H3 BF16: 47.97 GiB, requiere al menos 48 GB de VRAM para cargar en memoria, recomendado para GPUs como A100 80GB o H100.
- Encoder H3 INT8 ConvRot: 24.55 GiB, cabe en GPUs con 32 GB de VRAM (por ejemplo, RTX 4090 o A6000), aunque el espacio libre debe ser suficiente para la cola de generacion.
- Colas de generacion: entre 5.4 GiB (NVFP4/AWQ) y 15.2 GiB (BF16). La combinacion del encoder INT8 con la cola INT8 requiere aproximadamente 31.6 GiB, lo que excede la VRAM de una RTX 4090 (24 GB) pero es viable en una RTX 5090 (32 GB) o una A6000 (48 GB).
- Despliegue: requiere ComfyUI con la dependencia `comfy-kitchen` y los archivos colocados en `ComfyUI/models/text_encoders/H3/`. Para generacion independiente, se necesita el repositorio `ComfyUI-H3-Qwen3VL-TextGen`.
- No se proporcionan datos de latencia ni throughput. Los resultados de busqueda mencionan que en una GPU de gama media (RTX 5070 Ti) se pueden generar videos de 15 segundos en 640x832 en unos 20 minutos, pero esto corresponde a otro modelo similar, no a este repositorio exactamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|---|
| `nurdich/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot` | 32B | no disponible | BF16, INT8, NVFP4 | Apache-2.0 | ComfyUI H3 |
| `ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot` | 32B | no disponible | INT8 ConvRot | Apache-2.0 | ComfyUI H3 |
| `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic` | 32B | no disponible | BF16 | Apache-2.0 | Modelo base para fine-tuning |

Ambos repositorios de `nurdich` y `ethanfel` contienen practicamente los mismos archivos, diferenciandose en el autor y posiblemente en detalles de empaquetado. El modelo base es comun. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El modelo es "uncensored" y "abliterated", lo que significa que puede generar contenido ofensivo, ilegal o peligroso sin filtros de seguridad. Su uso en produccion requiere evaluacion de riesgos y politicas de contenido adecuadas.
- No es un modelo completo de Transformers: los checkpoints son especificos de ComfyUI y no pueden cargarse directamente con `transformers` o `vLLM`. Requiere el entorno de ComfyUI y el repositorio TextGen para generacion independiente.
- La longuitud de contexto no esta documentada, lo que dificulta estimar su capacidad para dialogos largos o documentos extensos.
- Solo soporta ingles, limitando su uso en aplicaciones multilingues.
- El repositorio no incluye informacion sobre sesgos, alucinaciones ni limitaciones de idioma. Al ser una variante sin censura, el riesgo de generar informacion falsa o danina es mayor que en el modelo original.
- El tamano del repositorio (128.9 GB) implica una descarga considerable y requiere espacio en disco. La cuantizacion INT8 puede degradar ligeramente la calidad de las respuestas en comparacion con BF16.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/nurdich/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Modelo base: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Repositorio de generacion independiente: https://github.com/ethanfel/ComfyUI-H3-Qwen3VL-TextGen
- Repositorio similar de ethanfel: https://huggingface.co/ethanfel/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
