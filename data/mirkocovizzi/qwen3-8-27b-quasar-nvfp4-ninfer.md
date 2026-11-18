# MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer

## Resumen

Qwen3.8-27B QUASAR NVFP4 para NInfer es un artefacto de inferencia empaquetado en formato propietario `ninfer` (contenedor v3), construido por MirkoCovizzi a partir de QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, una versión del modelo Qwen3.8-27B de 27.000 millones de parámetros sometida a entrenamiento consciente de cuantización (QAT) en NVFP4. El paquete integra en un único fichero de 18,42 GiB los componentes de texto, visión, MTP (multi-token prediction) y DFlash2 (cabecera de decodificación especulativa), de modo que no es necesario descargar un modelo borrador separado en tiempo de inferencia.

El problema que resuelve es la brecha entre un checkpoint QAT en NVFP4 y un despliegue real de baja latencia: el autor ha fusionado y reorganizado los pesos cuantizados (256 padres NVFP4: 32 de atención, 96 de GDN y 128 de MLP) preservando los códigos E2M1 y las escalas de bloque E4M3FN originales, y ha añadido metadatos de configuración, enlaces lógicos y permisos de activación por entrada. El resultado es un artefacto listo para ejecutarse con el runtime NInfer v3 sobre GPU NVIDIA Blackwell con soporte FP4, validado en una RTX 5090 Laptop de 24 GiB.

Su relevancia actual radica en que demuestra una ruta completa de cuantización FP4 nativa más decodificación especulativa integrada sobre hardware de consumo Blackwell, con 51.320 descargas acumuladas. No obstante, conviene subrayar que no es un checkpoint Transformers, ni una distribución Safetensors, ni un GGUF, ni un formato genérico de intercambio NVFP4: es específico de NInfer y requiere ese runtime.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención y capas GDN (clase `Qwen3_5ForCausalLM`), más módulos Vision, MTP y DFlash2 |
| Parámetros totales | 27.000 millones (modelo base Qwen3.8-27B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como máximo del modelo; los ejemplos de ejecución usan 4.096 y 8.192 tokens |
| Tipos de cuantización | NVFP4 (E2M1 con escalas de bloque E4M3FN) en pesos; caché KV en BF16, INT8, FP8, NVFP4, K8V4 y KVarN; sufijo DFlash2 con 21 tensores Q8 groupwise y 45 BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario `.ninfer` v3, fichero único `qwen3_8_27b_nvfp4.ninfer` de 19.782.432.752 bytes (18,42 GiB), SHA-256 `29bd2a543dd779e28fa6cbc4ff532447e3f861018384b3c5e4a8b98ba4b2587b` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer de 27.000 millones de parámetros cuya implementación en este artefacto corresponde a la clase `Qwen3_5ForCausalLM`. La arquitectura combina capas de atención con capas GDN (Gated Delta Network), un mecanismo de atención lineal recurrente que reduce el coste de contexto largo. Sobre ese tronco se añaden tres componentes: un codificador de visión para entradas de imagen y vídeo, una cabeza MTP para predicción multi-token y el módulo DFlash2 de decodificación especulativa.

El entrenamiento del checkpoint de origen fue un proceso QAT en NVFP4 sobre Qwen3.8-27B, es decir, los pesos se adaptaron a la cuantización de 4 bits durante el ajuste en lugar de cuantizarse a posteriori. La conversión al contenedor NInfer preservó los códigos E2M1 empaquetados, las escalas de bloque E4M3FN, los divisores de peso FP32 y los divisores de activación para 400 de las 496 matrices lineales de texto del origen; la fusión de grupos compatibles con palabras de escala global idénticas bit a bit produjo los 256 padres NVFP4. El artefacto contiene 1.334 objetos (1.328 tensores y 6 recursos de frontend), con 1.513 enlaces lógicos y 844 usos de entrada. La release v3 es una migración de formato, no un nuevo checkpoint QAT: los 1.328 tensores se conservan byte a byte y no se recuantizó ningún peso. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación técnica destacable es la integración de la decodificación especulativa en el propio artefacto: MTP acepta de 1 a 5 tokens borrador y DFlash2 de 1 a 15, con una cabeza de propuesta optimizada seleccionable mediante `--lm-head-draft`. La especulación se fija al arrancar el runtime, no por petición. Además, el decodificado con CUDA Graphs y la reutilización de prefijos compatibles están activados por defecto.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imagen y vídeo: el componente Vision se activa en el servidor con el flag `--vision`.
- Decodificación especulativa integrada mediante MTP (1-5 tokens borrador) y DFlash2 (1-15 tokens borrador), sin modelo borrador externo.
- Predicción multi-token (MTP) como cabeza auxiliar para acelerar la generación.
- Servido compatible con las APIs de OpenAI y Anthropic a través de `ninfer-serve`.
- Gestión de caché KV configurable en seis formatos (BF16, INT8, FP8, NVFP4, K8V4, KVarN) para ajustar memoria y precisión.
- Concurrencia de 1 a 8 peticiones fijada en el arranque.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia en estación de trabajo con GPU Blackwell de consumo: el artefacto de 18,42 GiB se ejecuta en una RTX 5090 Laptop de 24 GiB, lo que permite servir un modelo de 27.000 millones en FP4 sin infraestructura de centro de datos.
- Servicio local compatible con OpenAI y Anthropic: `ninfer-serve` expone un endpoint HTTP en `127.0.0.1:18080` que permite sustituir llamadas a APIs comerciales en herramientas existentes sin reescribir el cliente.
- Aceleración de generación interactiva: con DFlash2 y 7 tokens borrador se reduce el número de pasos de decodificación, adecuado para asistentes de chat donde la latencia por token es crítica.
- Procesamiento de documentos con imágenes: activando `--vision`, el modelo atiende peticiones de imagen y vídeo, útil para extracción de información de capturas, gráficos o fotogramas.
- Prototipado de pipelines de razonamiento multi-paso con contexto medio: con `--max-context 8192` y caché INT8 se pueden encadenar conversaciones o análisis de documentos de varias páginas en una sola GPU.
- Evaluación de técnicas de cuantización FP4 y decodificación especulativa: al conservar los códigos E2M1 y las escalas originales, el artefacto sirve como referencia reproducible para medir el impacto de MTP frente a DFlash2 y de los distintos formatos de caché KV.
- Investigación sobre atención lineal: las 96 capas GDN del contenedor permiten estudiar el comportamiento de mecanismos recurrentes lineales en tareas de contexto largo frente a atención clásica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU NVIDIA Blackwell con soporte FP4; validado en una RTX 5090 Laptop con 24 GiB de VRAM.
- Sistema operativo Linux de 64 bits, CUDA Toolkit 13.1 y CMake 3.28 o superior.
- El tamaño del artefacto (18,42 GiB) no equivale a memoria GPU residente: el backend especulativo seleccionado, el formato y la capacidad de la caché KV, la concurrencia, la visión y los CUDA Graphs modifican el consumo real.
- Los pesos de MTP y DFlash2 no seleccionados no se cargan en memoria para otro backend.
- Una sola GPU por proceso: NInfer no ofrece offload CPU/GPU, ejecución multi-GPU ni batching continuo preventivo a gran escala.
- Concurrencia fijada en el arranque entre 1 y 8 peticiones.
- Despliegue mediante el runtime NInfer v3, compilado desde el fork `ninfer-rtx5090-mobile` en el commit `b53468fae6af160c3458bbe87e157b6201a4a12b`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un checkpoint Transformers ni un GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B QUASAR NVFP4 NInfer (este) | 27.000 M | no disponible (ejemplos a 4.096-8.192) | NVFP4 QAT, caché KV en 6 formatos | Apache 2.0 | `.ninfer` v3, solo NInfer | Hugging Face, 51.320 descargas |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 | 27.000 M | no disponible | NVFP4 QAT | no disponible | checkpoint de origen | Hugging Face |
| Qwen/Qwen3.8-27B | 27.000 M | no disponible | BF16 (presumiblemente) | no disponible | Transformers / Safetensors | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2 | 27.000 M | no disponible | no disponible | no disponible | módulo de decodificación especulativa | Hugging Face |

La comparación relevante es de empaquetado más que de calidad de modelo: las tres variantes derivan del mismo Qwen3.8-27B, y este artefacto se distingue por integrar visión, MTP y DFlash2 en un solo fichero ejecutable sobre Blackwell. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- Formato no portable: el fichero `.ninfer` solo lo carga el runtime NInfer v3; no es un checkpoint Transformers, ni Safetensors, ni GGUF, ni un formato genérico de intercambio NVFP4.
- El runtime v2 anterior no puede cargar este artefacto; la release v3 exige el runtime actualizado.
- La release v3 es una migración de formato: no mejora la calidad del modelo. La plantilla de chat actualizada (`tools/chat_templates/qwen3_8.jinja`) puede cambiar los prompts renderizados y la aritmética nueva del runtime puede alterar las continuaciones generadas, pese a la preservación byte a byte de los pesos.
- Hardware restringido: requiere GPU NVIDIA Blackwell con FP4 y CUDA 13.1; no funciona en generaciones anteriores ni en CPU.
- Sin multi-GPU ni offload: la concurrencia máxima es de 8 peticiones fijadas al arrancar, lo que limita el uso en producción de alto volumen.
- El modo especulativo se elige al arrancar y no por petición, lo que impide adaptar la profundidad de borrador al tipo de carga en caliente.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Sesgos, tasa de alucinación y comportamiento en tool calling no documentados en la información disponible.
- Licencia Apache 2.0 declarada, que permite uso comercial, pero el autor no detalla condiciones adicionales sobre los componentes derivados de terceros (Qwen, QUASAR-QAT, z-lab).
- La validación se realizó en una única configuración de hardware (RTX 5090 Laptop, 24 GiB); el comportamiento en otras GPU Blackwell no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint QAT de origen: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Módulo DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Runtime NInfer (fork móvil RTX 5090): https://github.com/MirkoCovizzi/ninfer-rtx5090-mobile
- Commit validado del runtime: https://github.com/MirkoCovizzi/ninfer-rtx5090-mobile/commit/b53468fae6af160c3458bbe87e157b6201a4a12b
- Manifiesto del artefacto: https://huggingface.co/MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer/blob/main/artifact-manifest.json
- Verificación de migración v2 a v3: https://huggingface.co/MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer/blob/main/qwen3_8_27b_nvfp4.ninfer.upgrade.json
- Conversión original v2: https://huggingface.co/MirkoCovizzi/Qwen3.8-27B-QUASAR-NVFP4-NInfer/blob/main/qwen3_8_27b_nvfp4.v2.conversion.json
- Paper referenciado (arXiv:2608.13966): https://arxiv.org/abs/2608.13966
