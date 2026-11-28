# litert-community/Qwen3-32B

## Resumen

Qwen3-32B LiteRT-LM es una conversión del modelo denso Qwen3-32B de Qwen (Alibaba) al formato LiteRT-LM, empaquetada por la comunidad litert-community para su ejecución con el runtime LiteRT-LM sobre backend GPU (WebGPU). El repositorio contiene dos artefactos: una cuantización int4 mixta (19,6 GB) y una int8 (32,9 GB), ambas con una ventana de contexto efectiva de 4096 tokens en el archivo publicado. El modelo base es un transformer denso de 32.800 millones de parámetros con 64 capas, 64 cabezas de consulta y 8 de clave-valor, y un contexto nativo de 32.768 tokens.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 32B en hardware de consumo de gama alta (Apple Silicon con memoria unificada) mediante el runtime LiteRT-LM de Google, sin necesidad de GPUs de centro de datos. La conversión incluye trabajo técnico destacable: búsqueda de escalas por bloque (clip search) para la cuantización int4, externalización de pesos a una sección TFLiteWeights y verificación de equivalencia de tokens frente al checkpoint original en bf16.

Es importante subrayar que este repositorio no es el modelo original de Qwen, sino una conversión comunitaria con limitaciones específicas de contexto (4096 tokens en lugar de 32.768), backend (solo GPU) y idioma declarado (inglés). Para uso en producción con contexto largo o multilingüe conviene recurrir al checkpoint original Qwen/Qwen3-32B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), 64 capas, 64 cabezas de consulta, 8 cabezas KV |
| Parametros totales | 32.800 millones (32,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens en los archivos publicados (contexto nativo del modelo base: 32.768 tokens) |
| Tipos de cuantizacion | int4 blockwise (bloque 32) mixta con int8 per-channel en lm_head y tabla de tokens; int8 per-channel completa |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen3-32B soporta multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, pesos en sección TFLiteWeights) |

## Arquitectura y entrenamiento

El modelo base Qwen3-32B es un transformer decoder-only denso de 32,8B parámetros con 64 capas, 64 cabezas de atención de consulta y 8 cabezas de clave-valor (GQA), y un contexto nativo de 32.768 tokens. Incorpora un modo de razonamiento ("thinking") que el modelo activa antes de responder salvo que se desactive mediante la plantilla de chat (`enable_thinking`). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original.

La conversión a LiteRT-LM se realizó desde el checkpoint en bf16 (revisión `9216db57`) con `litert-torch` 0.10.0 y se cuantizó con `ai-edge-quantizer` 0.10.1. El archivo int4 aplica cuantización por bloques de 32 con búsqueda de escala (11 candidatos por bloque, seleccionando el de menor error cuadrático, con refit por mínimos cuadrados y almacenamiento en fp16). Los pesos de las operaciones fully connected y de embedding se externalizaron a una sección TFLiteWeights al final del archivo mediante herramientas de LiteRT, con verificación byte a byte de integridad. La plantilla de chat, el canal `thought`, el token de parada `<|im_end|>` y los parámetros de muestreo (top-k 20, top-p 0.95, temperatura 0.6) provienen de la configuración de Qwen3 incluida en LiteRT-LM 0.19.1.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable o desactivable mediante la plantilla de chat.
- Razonamiento multi-paso: el modelo genera una traza de pensamiento antes de la respuesta final.
- Generación de código y matemáticas (capacidades heredadas del modelo base Qwen3-32B).
- Soporte de tool calling / function calling (heredado del modelo base; no verificado específicamente en la conversión).
- Capacidades multilingües del modelo base, aunque la model card de esta conversión solo declara inglés.
- Ejecución sobre backend GPU (WebGPU) del runtime LiteRT-LM.
- No se declaran capacidades de visión ni audio en esta conversión.

## Casos de uso

- Inferencia local en Apple Silicon: ejecutar un modelo de 32B en un Mac con memoria unificada (por ejemplo, M4 Max de 128 GB) usando el archivo int4 de 19,6 GB, sin GPU dedicada ni servicios en la nube.
- Prototipado de asistentes con razonamiento: aprovechar el modo thinking para tareas de análisis y resolución de problemas en entornos de desarrollo locales, con la ventana de 4096 tokens como límite práctico.
- Evaluación comparativa de cuantizaciones: usar los dos artefactos (int4 e int8) para medir el impacto de la cuantización en la calidad de salida frente al checkpoint bf16, dado que la model card documenta la coincidencia de tokens de siguiente paso.
- Despliegue en aplicaciones de escritorio o edge con WebGPU: integrar el runtime LiteRT-LM en aplicaciones que ya usan WebGPU y requieran generación de texto con un modelo de gran tamaño.
- Generación de código en flujos de desarrollo local: emplear el modelo para autocompletado y explicación de código en estaciones de trabajo con Apple Silicon, aceptando el límite de contexto de 4096 tokens.
- Investigación en cuantización: reproducir el pipeline de exportación (`litert-torch`, `ai-edge-quantizer`) y la externalización de pesos para estudiar el impacto de la búsqueda de escalas por bloque en la fidelidad del modelo.

## Benchmarks y rendimiento

La model card proporciona métricas de rendimiento medidas en un Apple M4 Max (128 GB, macOS 27.0) con LiteRT-LM 0.19.1, 1.024 tokens de prefill y 256 de decode con caché KV de 2.048 tokens:

| Archivo | Backend | Prefill (tokens/s) | Decode (tokens/s) | Fecha de medición |
|---|---|---:|---:|---|
| int4 (19,6 GB) | GPU (WebGPU) | 159,58 | 15,88 | 2026-11-14 |
| int8 (32,9 GB) | GPU (WebGPU) | 157,80 | 13,23 | 2026-11-15 |

En cuanto a fidelidad, el archivo int4 selecciona el mismo token de siguiente paso que el modelo original en 4.571 de 5.100 posiciones, frente a 4.548 del modelo de la comunidad MLX en 4 bits. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el archivo int4 ocupa 19,6 GB y el int8 32,9 GB; se necesita memoria suficiente para los pesos más la caché KV y las activaciones (el benchmark usó una caché KV de 2.048 tokens).
- GPU recomendadas: Apple Silicon con memoria unificada amplia (el benchmark se realizó en M4 Max de 128 GB). No se documentan pruebas en GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no hay datos sobre GPUs de consumo discretas.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.19.1 y 0.19.2 desde PyPI), con el binario `litert_lm_advanced_main` compilado desde el tag del proyecto. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks (prefill ~158-160 tokens/s, decode ~13-16 tokens/s en M4 Max).
- Advertencia: en el backend CPU de LiteRT-LM el archivo int8 mostró deriva en la selección de tokens frente al modelo original; se recomienda usar el backend GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Qwen3-32B (LiteRT-LM, este repo) | 32,8B | 4096 (en el archivo) | Apache 2.0 | `.litertlm` | Conversión comunitaria para GPU/WebGPU |
| Qwen3-32B (original) | 32,8B | 32.768 | Apache 2.0 | safetensors (bf16) | Checkpoint de referencia de Qwen |
| Conversión MLX 4-bit de Qwen3-32B (comunidad) | 32,8B | No disponible | Apache 2.0 | MLX | Referencia de fidelidad citada en la model card (4.548/5.100 tokens coincidentes) |

No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Contexto reducido: los archivos publicados limitan la ventana a 4096 tokens, frente a los 32.768 del modelo base; no apto para tareas que requieran contexto largo.
- Backend restringido: solo se validó en GPU (WebGPU); en CPU el archivo int8 mostró deriva en la selección de tokens.
- Idioma: la model card declara únicamente inglés, aunque el modelo base es multilingüe; el comportamiento multilingüe de esta conversión no está verificado.
- Fidelidad de cuantización: el int4 coincide con el bf16 en 4.571/5.100 posiciones; existe una tasa de divergencia no nula que puede afectar a tareas sensibles.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el modo thinking no elimina este riesgo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base y del runtime LiteRT-LM.
- Repositorio comunitario: no es una conversión oficial de Qwen; el soporte y las actualizaciones dependen de litert-community.
- El script de búsqueda de escalas (clip search) del archivo int4 no es público, lo que dificulta la reproducción exacta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Qwen3-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE
- Repositorio de conversión (int8): https://github.com/john-rocky/hf-to-litertlm/tree/main/qwen3_32b_work
- Herramienta de externalización de pesos: https://github.com/john-rocky/hf-to-litertlm/tree/2c2de3a5f35c831b015fd7fc18da130903b6e3b4/tools/externalize
- Paper de referencia (arXiv 2505.09388): https://arxiv.org/abs/2505.09388
