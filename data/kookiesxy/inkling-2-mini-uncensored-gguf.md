# KookiesXy/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una conversión a formato GGUF del modelo OpenUncensored/Inkling-2-Mini-Uncensored, una versión "abliterated" (con las capas de rechazo eliminadas) del modelo Inkling 2 Mini desarrollado por Thinking Machines. La conversión la ha realizado el usuario KookiesXy y está pensada para su uso con llama.cpp, manteniendo el pipeline original de image-text-to-text, lo que indica que el modelo base conserva capacidades de visión.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con aproximadamente 26.070 millones de parámetros totales. El repositorio GGUF ocupa 44,1 GB e incluye dos cuantizaciones del modelo de texto (una híbrida Q4_0/Q8_0 de 15,6 GB y una Q8_0 de 27,8 GB) más un proyector visual BF16 de 642 MB para la entrada de imágenes. La conversión se ha verificado contra los pesos originales con métricas de error relativo documentadas.

La relevancia de esta ficha radica en que se trata de un modelo "uncensored" con capacidades multimodales y arquitectura MoE, publicado bajo licencia Apache 2.0, lo que permite uso comercial. No obstante, el propio autor advierte de que la conversión introduce pérdida de cuantización adicional respecto al original (que almacena los expertos en NVFP4/MXFP8) y que no se han realizado benchmarks de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; versión abliterated del modelo Inkling 2 Mini de Thinking Machines |
| Parámetros totales | 26.070.385.152 (~26,07 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0 (expertos enrutados) + Q8_0 (matrices no expertas elegibles) + F32 (tensores sensibles); Q8_0 + F32; proyector visual BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (mixture-of-experts), según las etiquetas del repositorio. Los parámetros totales ascienden a 26.070.385.152, aunque no se especifica el número de parámetros activos por token ni el número de expertos. La naturaleza multimodal (pipeline image-text-to-text) se confirma por la inclusión de un proyector visual independiente (`mmproj-Inkling-2-Mini-Uncensored-BF16.gguf`) que actúa como adaptador de imagen a tokens para el modelo de lenguaje.

El modelo base original es una versión "abliterated" de Inkling 2 Mini de Thinking Machines, es decir, se han eliminado o atenuado las direcciones de activación asociadas al rechazo de peticiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión a GGUF se realizó con el commit `29b52d398b294509746ec0a3f28948a3107c0213` de llama.cpp, aplicando el cuantizador Q4_0 existente a los expertos enrutados. El autor advierte que la cuantización híbrida no es Q4_K_M y no está calibrada con matriz de importancia, y que los pesos del especulador/MTP no están incluidos.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredadas del modelo base Inkling 2 Mini.
- Procesamiento de imágenes (image-text-to-text) mediante el proyector visual BF16 incluido; se ha verificado que identifica correctamente una imagen roja sólida en una prueba de humo.
- Modo "uncensored": el modelo ha sido abliterated para reducir rechazos, lo que permite generar contenido que otros modelos declinarían (con las advertencias legales y éticas correspondientes).
- Compatibilidad con llama.cpp y endpoints compatibles (etiqueta `endpoints_compatible`).
- No se dispone de información sobre tool calling, function calling, capacidades de agente, multilingüismo específico ni modo de pensamiento explícito en la documentación proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original, comparando tasas de rechazo y calidad en tareas sensibles.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas que modelos alineados rechazan, con revisión humana posterior.
- Procesamiento de imágenes con descripción textual: uso del proyector visual para tareas de captioning o VQA en entornos de investigación, cargando el modelo con `llama-server --mmproj`.
- Despliegue en local con llama.cpp: la cuantización híbrida de 15,6 GB permite ejecutar un MoE de 26B en hardware con más de 15,6 GB de memoria (o swap suficiente), sin necesidad de GPUs de datacenter.
- Experimentación con arquitecturas MoE: análisis de comportamiento de expertos y cuantización selectiva (Q4_0 en expertos, Q8_0 en matrices no expertas) en pipelines de investigación.
- Pruebas de robustez y evaluación de sesgos: al ser un modelo sin capas de rechazo, sirve para medir la propagación de sesgos y contenido dañino en ausencia de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente documenta métricas de verificación de la conversión: RMSE relativo máximo de 0,00568 en 20 matrices de atención editadas, RMSE relativo máximo de 0,10031 en 144 filas de expertos muestreadas para la híbrida y 0,00657 para Q8_0, y coincidencia byte a byte de los 422 tensores visuales con el proyector BF16 original. Estas métricas no miden calidad general ni eficacia del "uncensoring".

## Requisitos de hardware

- VRAM/memoria estimada: la cuantización híbrida Q4_0/Q8_0 requiere más de 15,6 GB de memoria (o swap suficiente); la Q8_0 requiere considerablemente más (27,8 GB de pesos).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) podría alojar la híbrida completa, mientras que la Q8_0 requiere GPUs de 32 GB o más (A100 40 GB, H100) o reparto entre GPU y CPU.
- Cabe en GPU de consumo: la híbrida de 15,6 GB es viable en GPUs con 16 GB o más (RTX 4080, 4090) o mediante offloading parcial en GPUs menores.
- Opciones de despliegue: llama.cpp (build b12600 o superior, con soporte de bucle Inkling 2), `llama-cli` y `llama-server`; para imagen, usar `--mmproj` con el proyector BF16.
- Latencia y throughput: no disponibles. El autor indica que las pruebas realizadas son de humo, no benchmarks de calidad ni de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y no se dispone de especificaciones del modelo base original (parámetros activos, contexto) que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La conversión introduce pérdida de cuantización adicional: el original almacena expertos en NVFP4/MXFP8 y la conversión los expande y recuantiza, con RMSE relativo de hasta 0,10031 en filas de expertos de la versión híbrida.
- La cuantización híbrida no es Q4_K_M ni está calibrada con matriz de importancia; puede degradar la calidad respecto a cuantizaciones estándar.
- Los pesos del especulador/MTP no están incluidos, por lo que no se puede usar decodificación especulativa con este paquete.
- El modelo es "uncensored" (abliterated): puede generar contenido dañino, ofensivo o ilegal; requiere supervisión humana y filtros externos en producción.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fiabilidad en la documentación.
- Idiomas soportados no disponibles; no se garantiza un rendimiento multilingüe equilibrado.
- Longitud de contexto no disponible; el ejemplo de uso emplea `-c 1024`, lo que no implica el máximo del modelo.
- El CLI de imagen independiente falló en la máquina de conversión; se recomienda usar la ruta de `llama-server` para entrada visual.
- Requiere builds específicos de llama.cpp (b12600 o superior); versiones anteriores pueden no cargar el modelo.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated conlleva riesgos legales y reputacionales que deben evaluarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KookiesXy/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Thinking Machines (desarrollador del modelo original): no disponible en la información proporcionada
