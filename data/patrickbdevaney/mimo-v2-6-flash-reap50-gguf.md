# patrickbdevaney/MiMo-V2.6-Flash-REAP50-GGUF

## Resumen

MiMo-V2.6-Flash-REAP50-GGUF es una conversión a formato GGUF del checkpoint MiMo-V2.6-Flash-REAP50, que a su vez es una versión podada del modelo MiMo-V2.6-Flash-RL de XiaomiMiMo (licencia MIT). La poda, realizada con la técnica REAP, elimina 128 de los 256 expertos enrutados de cada capa MoE, dejando 128 expertos por capa con activación top-8. El resultado es un modelo de aproximadamente 157.000 millones de parámetros totales y unos 15.000 millones activos por token, pensado para ejecutarse en llama.cpp sobre máquinas con memoria unificada grande o configuraciones multi-GPU.

La arquitectura `mimo2` consta de 48 capas: la capa 0 es densa y las capas 1 a 47 son MoE con gating sigmoide y sin experto compartido. Combina 9 capas de atención completa con 39 capas de ventana deslizante (ventana de 128 tokens), y declara una longitud de contexto de 1.048.576 tokens. El paquete incluye proyector multimodal (`mmproj`) con codificador de visión y codificador de audio, además de tres capas MTP (multi-token prediction) separadas para decodificación especulativa.

Es relevante ahora porque permite probar un modelo multimodal de escala grande en hardware de consumo o estaciones de trabajo, con un fichero principal de 86,06 GiB en MXFP4. No obstante, el autor advierte explícitamente de que los ficheros nunca se han cargado, servido ni evaluado: no hay benchmarks, ni pruebas de calidad, ni mediciones de velocidad o memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `mimo2` (transformer MoE, 48 capas: 1 densa + 47 MoE; 9 capas de atención completa y 39 de ventana deslizante de 128 tokens) |
| Parametros totales | ~157B (157.356.536.128 según safetensors del modelo base) |
| Parametros activos | ~15B por token (top-8 de 128 expertos por capa) |
| Longitud de contexto | 1.048.576 tokens (declarada, no probada; la calibración no superó los 4.095 tokens) |
| Tipos de cuantizacion | MXFP4 (expertos, repack directo del origen), Q2_K mixto (3,36 BPW), BF16, F32, Q8_0, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors en el repo base |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos: 48 capas, de las cuales la capa 0 es densa y las 47 restantes son MoE con 128 expertos enrutados por capa, activación top-8, gating sigmoide y sin experto compartido. La atención alterna 9 capas de atención completa con 39 capas de ventana deslizante de 128 tokens, lo que reduce el coste de atención en contextos largos. El checkpoint original es MiMo-V2.6-Flash-RL de XiaomiMiMo; la variante REAP50 aplica poda de expertos (128 de 256 conservados) y esta conversión GGUF la reempaqueta para llama.cpp.

En cuanto a los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO), la información disponible no los detalla: solo se indica que el modelo original es la variante "RL" de XiaomiMiMo. La innovación técnica destacable de este paquete es la inclusión de tres capas MTP (multi-token prediction) en ficheros separados, destinadas a decodificación especulativa, junto con un proyector multimodal que integra un codificador de visión (28 bloques, proyector `mimovl`) y un codificador de audio (24 bloques, proyector `mimo_audio`, RVQ de 20 codebooks). El fichero principal conserva los expertos como repack directo de los bloques MXFP4 del origen, sin recuantización, mientras que atención, FFN de la capa 0, embeddings y cabeza de salida van en BF16, y normas, routers y attention sinks en F32.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imagen mediante el proyector `mmproj` (codificador de visión de 28 bloques).
- Procesamiento de audio mediante el codificador de audio incluido en el `mmproj` (RVQ de 20 codebooks).
- Entrada de vídeo solo a través del checkpoint safetensors: la ruta GGUF no soporta vídeo de forma nativa en `libmtmd`; existe un helper opcional basado en ffmpeg que muestrea fotogramas como imágenes, no probado con este modelo.
- Decodificación especulativa mediante las tres capas MTP incluidas en ficheros separados (integración con llama.cpp no verificada).
- Capacidades multilingües: no disponible (no se declaran idiomas en la model card).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo multimodal de gran escala: el fichero MXFP4_MOE (86,06 GiB) permite servir texto, imagen y audio desde una sola máquina con memoria unificada amplia o varios GPUs, usando `llama-server` con el `mmproj` BF16.
- Análisis de documentos con imágenes: el codificador de visión permite pasar capturas, diagramas o páginas escaneadas junto con texto; encaja en flujos de extracción de información donde se necesita un modelo grande sin depender de APIs externas.
- Transcripción y comprensión de audio: el codificador de audio integrado en el `mmproj` habilita tareas de resumen o pregunta-respuesta sobre clips de audio dentro de llama.cpp.
- Experimentación con contextos muy largos: la ventana declarada de 1.048.576 tokens y la mezcla de atención completa y deslizante hacen del modelo un candidato para pruebas de recuperación en documentos extensos, siempre que se valide empíricamente porque no hay test needle-in-a-haystack.
- Investigación sobre poda de expertos: al ser una variante REAP50 con 128 de 256 expertos, sirve para estudiar la degradación de calidad frente al modelo sin podar, comparando el fichero MXFP4 (repack fiel) con el Q2_K mixto.
- Evaluación de decodificación especulativa con MTP: las capas MTP separadas permiten a investigadores medir la aceleración de generación en llama.cpp una vez resuelta la carga de los ficheros `mtp-*.gguf`.
- Prototipado de asistentes conversacionales en hardware propio: el fichero Q2_K (61,64 GiB) reduce el requisito de memoria en 24,4 GiB respecto al MXFP4, a costa de recuantizar los expertos gate/up de 4 a 2 bits, con coste de calidad no medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los ficheros no se han cargado, servido ni evaluado: no hay perplejidad, KL frente al modelo sin podar, benchmarks generativos o de tareas, pruebas multimodales, pruebas de contexto largo ni mediciones de velocidad o memoria. Cualquier cifra de "~5 tok/s" asociada a la publicación era aritmética de ancho de banda de memoria, no una medición.

## Requisitos de hardware

- VRAM/memoria para pesos: 86,06 GiB con MXFP4_MOE, 61,64 GiB con Q2_K, más la caché KV, que no se ha medido.
- Proyector multimodal: 2,56 GiB en BF16 o 1,46 GiB en Q8_0, adicionales a los pesos del modelo.
- Capas MTP: 4,17 GiB en BF16 o 2,22 GiB en Q8_0, adicionales si se usan para decodificación especulativa.
- GPU recomendadas: no disponible; el autor apunta a máquinas con memoria unificada grande o configuraciones multi-GPU, sin especificar modelos concretos (A100, H100, RTX 4090, etc.).
- Viabilidad en GPU de consumo: no confirmada; el tamaño de los pesos excede la VRAM de cualquier GPU de consumo individual, por lo que requiere memoria unificada (por ejemplo, estaciones con memoria compartida CPU-GPU) o varios GPUs.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-quantize`, `convert_hf_to_gguf.py`); el autor no ha probado la carga con ninguna build. Para vídeo o runtimes distintos de llama.cpp, se indica el checkpoint safetensors.
- Latencia y throughput: no disponibles; no se han realizado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Evaluacion |
|---|---|---|---|---|---|---|
| MiMo-V2.6-Flash-REAP50-GGUF (este) | ~157B | ~15B | 1.048.576 | MIT | GGUF | No evaluado |
| MiMo-V2.6-Flash-REAP50 (safetensors) | ~157B | ~15B | 1.048.576 | MIT | safetensors | No evaluado |
| MiMo-V2.6-Flash-RL (original) | no disponible | no disponible | no disponible | MIT | safetensors | no disponible |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría; la información proporcionada no incluye benchmarks ni modelos comparables evaluados.

## Limitaciones y advertencias

- Estado sin validar: los ficheros nunca se han cargado, servido ni evaluado; no hay pruebas de calidad, velocidad, memoria ni equivalencia extremo a extremo con el checkpoint safetensors.
- Contexto no probado: la ventana de 1.048.576 tokens es declarada; la calibración nunca superó los 4.095 tokens.
- Sin soporte de vídeo en GGUF: `libmtmd` no incluye modalidad de vídeo; el helper opcional con ffmpeg no se ha probado con este modelo.
- Integración MTP no verificada: no se ha comprobado cómo debe cargar llama.cpp los ficheros `mtp-*.gguf` para decodificación especulativa.
- Riesgo de calidad por poda: la eliminación de 128 de 256 expertos no tiene medición de degradación frente al modelo sin podar.
- Q2_K mixto: recuantiza los expertos gate/up de 4 a 2 bits sin matriz de importancia; el coste de calidad no se ha medido.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe.
- Sesgos y alucinación: no hay documentación específica en la información proporcionada; al ser un modelo conversacional de gran escala, deben aplicarse las precauciones habituales en producción.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de funcionamiento ni de calidad al no haberse validado los ficheros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/patrickbdevaney/MiMo-V2.6-Flash-REAP50-GGUF
- Checkpoint base safetensors: https://huggingface.co/patrickbdevaney/MiMo-V2.6-Flash-REAP50
- Modelo original: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Paper referenciado en los tags: arxiv:2510.13999 (https://arxiv.org/abs/2510.13999)
- llama.cpp: https://github.com/ggml-org/llama.cpp
