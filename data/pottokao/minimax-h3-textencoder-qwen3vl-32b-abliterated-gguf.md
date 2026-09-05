# pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-GGUF

## Resumen

El modelo `pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-GGUF` es una adaptación cuantizada en formato GGUF del modelo `Qwen3-VL-32B-Instruct`, modificado mediante abliteración y destinado a actuar como codificador de texto (text encoder) en el pipeline de generación de vídeo MiniMax-H3. Lo desarrolla el usuario `pottokao` como componente para flujos de trabajo de text-to-video e image-to-video, especialmente integrable en ComfyUI.

La arquitectura es `qwen3vl`, con 50 capas, y el modelo base es la versión instruct de Qwen3-VL de 32B. Según los pesos safetensors, el modelo tiene 26.531.013.360 parámetros totales. El repositorio ofrece dos variantes: un archivo GGUF solo de texto de ~11.5 GB y una variante `_vis` de ~12.6 GB que incluye la torre visual en BF16 fusionada, necesaria para que ComfyUI reconozca el encoder.

Se trata de una versión "abliterated" (eliminación de ciertos comportamientos de censura), lo que la convierte en un modelo "sin censura". Está publicado bajo licencia Apache 2.0 y su formato de pesos es GGUF, compatible con llama.cpp y aplicaciones de escritorio. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3vl), 50 capas |
| Parametros totales | 26.531.013.360 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_S (≈3.53 BPW); existe variante NVFP4-AWQ en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen3-VL-32B-Instruct`, un modelo de visión-lenguaje, del que se conserva la arquitectura `qwen3vl` con 50 capas. En esta variante, el modelo se utiliza como codificador de texto para el pipeline MiniMax-H3. La abliteración es un proceso posterior al entrenamiento que modifica los pesos para reducir ciertos comportamientos de seguridad o censura, dando lugar a una versión "uncensored". No se ha publicado información sobre los datos de entrenamiento, el número de tokens utilizados ni procesos de ajuste como RLHF o DPO.

La cuantización a Q3_K_S reduce el tamaño del modelo a unos 11.5 GB (sin torre visual) o 12.6 GB (con torre visual). La versión `_vis` incluye la torre visual en BF16 fusionada, lo que permite su uso como modelo de imagen-texto y su detección en ComfyUI. La versión sin torre visual es exclusivamente de texto y está pensada para su uso como encoder en llama.cpp.

## Capacidades

- Codificación de texto para el pipeline de generación de vídeo MiniMax-H3, tanto en text-to-video como en image-to-video.
- Procesamiento de imágenes y texto en la variante `_vis`, gracias a la torre visual BF16 fusionada.
- Generación de texto y razonamiento heredados del modelo base Qwen3-VL-32B-Instruct, aunque no se ha verificado en esta variante.
- Compatibilidad con ComfyUI, que detecta el encoder mediante los tensores `visual.deepstack_merger_list.*` y `model.layers.49.*`.
- Despliegue en entornos locales mediante llama.cpp gracias al formato GGUF.
- Comportamiento "abliterated" que reduce la censura en las salidas del modelo.

## Casos de uso

- Generación de vídeo con MiniMax-H3 en ComfyUI: el archivo `_vis` se usa como text encoder para codificar las instrucciones de texto y guiar la síntesis de vídeo en el nodo de MiniMax-H3.
- Inferencia de codificación de texto en llama.cpp: el archivo sin torre visual puede emplearse en scripts de servidor o aplicaciones de línea de comandos para generar representaciones de texto de forma eficiente.
- Despliegue en GPU de consumo: con Q3_K_S (~11.5 GB), el modelo puede ejecutarse en una RTX 3090 o 4090, permitiendo experimentar con el pipeline MiniMax-H3 en local.
- Investigación sobre técnicas de abliteración: permite comparar el comportamiento de este modelo frente al `Qwen3-VL-32B-Instruct` original en tareas de generación de vídeo o texto.
- Aplicaciones creativas con menos filtrado: al ser "uncensored", resulta adecuado para sistemas de generación de contenido donde se requiera evitar filtros de seguridad.
- Prototipado de pipelines de texto a vídeo: gracias al formato GGUF, se puede integrar en scripts Python o aplicaciones de escritorio para pruebas rápidas sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 12 y 16 GB, dependiendo de la variante y del tamaño del contexto. El archivo Q3_K_S ocupa ~11.5 GB (sin torre visual) y ~12.6 GB (con torre visual).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para operar con holgura; también válido en A100 o H100.
- En GPU de consumo: sí, cabe en RTX 3090/4090. En GPUs de 16 GB puede requerir reducir la longitud de contexto o la cuantización.
- Opciones de despliegue: llama.cpp, ComfyUI, vLLM (mediante la variante NVFP4-AWQ) y Ollama si se usa el archivo GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniMax-H3 Text Encoder (GGUF Q3_K_S) | 26.531.013.360 | no disponible | Apache 2.0 | GGUF | Abliterated, text encoder |
| Qwen3-VL-32B-Instruct (base) | 32B (según nombre) | no disponible | Apache 2.0 | Safetensors | Modelo original, no abliterated |
| MiniMax-H3 Text Encoder (NVFP4-AWQ) | 26.531.013.360 | no disponible | Apache 2.0 | NVFP4-AWQ | Versión para vLLM-Omni |

No se dispone de datos de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- La abliteración puede alterar el comportamiento del modelo y degradar su rendimiento en tareas estándar.
- La cuantización Q3_K_S reduce la precisión de los pesos, lo que puede afectar a la calidad de la codificación de texto.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas concretas es desconocido.
- La versión sin torre visual no puede procesar imágenes; solo texto.
- La versión con torre visual añade ~1.1 GB y está pensada específicamente para ComfyUI.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por el modelo puede estar sujeto a restricciones adicionales.
- El modelo está diseñado como componente del pipeline MiniMax-H3; su uso fuera de este contexto puede no ofrecer resultados óptimos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-GGUF
- Variante NVFP4-AWQ: https://huggingface.co/pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ
