# a2genesis/Qwen3.8-27B-NVFP4

## Resumen

Qwen3.8-27B-NVFP4 es una cuantización de precisión mixta del modelo multimodal Qwen/Qwen3.8-27B, realizada por A2Genesis mediante NVIDIA TensorRT Model Optimizer (ModelOpt) 0.45. El checkpoint reduce el tamaño de los pesos de aproximadamente 55 GB (BF16) a unos 21 GB, manteniendo la mayor parte de la capacidad del modelo original gracias a un esquema NVFP4/FP8 que combina cuantización de pesos en 4 bits para las proyecciones MLP y la cabeza de lenguaje, con FP8 para atención, KV cache y proyecciones de atención lineal. Está pensado para despliegue eficiente en GPUs Blackwell (B200, RTX 5090) mediante vLLM, y conserva los tensores MTP en BF16 para habilitar decodificación especulativa.

El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5`), con arquitectura híbrida que incorpora atención lineal (GDN), torre de visión y un cabezal de predicción multi-token (MTP). Soporta una ventana de contexto de hasta 262 144 tokens, tool calling y razonamiento multi-paso, lo que lo hace adecuado para agentes conversacionales, generación de código y tareas de visión-lenguaje. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Esta ficha se basa exclusivamente en la información publicada en HuggingFace y en la model card del autor. No se han encontrado benchmarks públicos del modelo cuantizado, por lo que las secciones de rendimiento y comparativa se limitan a datos estructurales y de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido (atención lineal GDN + atención softmax, torre de visión, MTP) |
| Parametros totales | 27B (modelo base); 18 164 649 200 en el checkpoint cuantizado (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | NVFP4 (W4A16, block size 16) para MLP y lm_head; FP8 (E4M3) para atención, KV cache y proyecciones GDN; BF16 para torre de visión, MTP y capas de convolución/gating |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con vLLM y ModelOpt) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal de la familia Qwen3.5, con una arquitectura híbrida que combina atención softmax clásica con atención lineal (GDN, probablemente *Gated Delta Net*), una torre de visión para procesar imágenes y un cabezal MTP (multi-token prediction) que permite decodificación especulativa. El checkpoint cuantizado preserva todos los componentes, pero asigna diferentes precisiones según la sensibilidad: las proyecciones MLP (gate/up/down) y la cabeza de lenguaje se cuantizan a NVFP4 (4 bits, peso-only), mientras que las proyecciones de atención y la KV cache se mantienen en FP8. La torre de visión y el MTP permanecen en BF16 sin cuantizar.

La cuantización se realizó mediante post-training quantization (PTQ) con 1024 muestras de calibración (máximo 512 tokens por muestra), extraídas a partes iguales de cuatro datasets abiertos: `cnn_dailymail`, `Magpie-Align/Magpie-Pro-MT-300K-v0.1`, `nvidia/OpenCodeReasoning` y `nvidia/OpenMathReasoning`. La atención se implementó con SDPA durante la calibración. No se aplicó fine-tuning ni RLHF; el proceso es puramente de compresión de pesos.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto, y produce respuestas textuales (pipeline `image-text-to-text`).
- Razonamiento multi-paso: compatible con el parser de razonamiento `qwen3` en vLLM, lo que permite cadenas de pensamiento explícitas.
- Tool calling / function calling: soportado mediante el parser `qwen3_coder` y la opción `--enable-auto-tool-choice` en vLLM.
- Generación de código: el modelo base está orientado a tareas de programación, y la cuantización conserva las capacidades de código.
- Decodificación especulativa: los tensores MTP se mantienen en BF16, por lo que se puede usar speculative decoding para acelerar la inferencia.
- Multilingüismo: no se especifican idiomas en la documentación, pero los modelos Qwen suelen ser multilingües; este dato no está confirmado para esta variante.
- Despliegue en vLLM: integración nativa con `--quantization modelopt` y soporte de contexto largo de 256K tokens.

## Casos de uso

- Asistentes conversacionales con contexto largo: con 262 144 tokens de ventana, el modelo puede mantener conversaciones de muchas horas o procesar documentos extensos completos, ideal para chatbots de soporte o análisis de historiales.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, con la ventaja de un checkpoint de 21 GB que reduce costes de inferencia.
- Agentes autónomos multi-paso: el razonamiento estructurado y el tool calling permiten construir agentes que planifican, ejecutan llamadas a APIs y verifican resultados, por ejemplo en automatización de tareas de oficina.
- Análisis de documentos con imágenes: al ser multimodal, puede extraer información de capturas, diagramas o documentos escaneados combinados con texto, útil en entornos jurídicos o financieros.
- RAG (retrieval-augmented generation) a gran escala: la ventana de 256K permite indexar y consultar corpus extensos sin necesidad de dividir el contexto, mejorando la coherencia en sistemas de pregunta-respuesta.
- Despliegue en entornos con VRAM limitada: el checkpoint de 21 GB cabe en GPUs de 24 GB (p. ej., RTX 4090) con cuantización adicional, o en GPUs Blackwell de 48 GB con margen para KV cache larga, lo que abarata la infraestructura frente a los 55 GB del modelo BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (MMLU, HumanEval, GSM8K, etc.) ni comparativas con el modelo base o con otras cuantizaciones. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~21 GB en NVFP4/FP8. Con contexto de 256K tokens, la KV cache en FP8 puede añadir varios GB adicionales; se recomienda al menos 32 GB de VRAM para uso intensivo, y 48 GB o más para ventanas completas.
- GPUs recomendadas: NVIDIA Blackwell (B200, RTX 5090, RTX 5070 Ti) para máximo rendimiento nativo de NVFP4. En arquitecturas anteriores (A100, H100, RTX 4090) el checkpoint carga mediante el soporte ModelOpt de vLLM, pero con menor beneficio de velocidad y posible degradación de precisión.
- Compatibilidad con consumer GPU: sí, una RTX 4090 (24 GB) puede ejecutar el modelo con contexto moderado; para contexto largo se necesita una GPU con más memoria.
- Opciones de despliegue: vLLM (recomendado, con `--quantization modelopt`), TensorRT Model Optimizer para optimización adicional, y potencialmente otros frameworks que soporten ModelOpt. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependen de la GPU, el tamaño de lote y la longitud de secuencia; la decodificación especulativa (MTP) puede mejorar el throughput en cargas de generación larga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Tamaño checkpoint |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262 144 | BF16 | Apache 2.0 | ~55 GB |
| Qwen3.8-27B-NVFP4 (este) | 27B (18.16B en safetensors) | 262 144 | NVFP4/FP8/BF16 | Apache 2.0 | ~21 GB |
| Qwen3.6-27B NVFP4 (oficial NVIDIA) | 27B | no disponible | NVFP4/FP8 | Apache 2.0 | ~21 GB (estimado) |

No se dispone de benchmarks comparativos entre estas variantes. La principal diferencia frente al modelo base es el tamaño del checkpoint (55 GB vs 21 GB) y la velocidad de inferencia en hardware Blackwell. Frente a la versión oficial de NVIDIA (Qwen3.6-27B NVFP4), esta es una cuantización comunitaria del mismo esquema, con calibración propia y sin afiliación con Qwen o NVIDIA.

## Limitaciones y advertencias

- La cuantización NVFP4 puede introducir una ligera degradación de precisión frente al modelo BF16, especialmente en tareas de razonamiento matemático o código complejo; no se han publicado métricas que cuantifiquen esta pérdida.
- El rendimiento óptimo solo se alcanza en GPUs Blackwell; en hardware anterior, la ventaja de velocidad se reduce y podrían aparecer artefactos numéricos.
- Es una cuantización comunitaria no oficial: no está respaldada por el equipo de Qwen ni por NVIDIA, y puede contener errores de calibración o de implementación.
- No se especifican los idiomas soportados; aunque los modelos Qwen suelen ser multilingües, esta variante no documenta cobertura lingüística.
- Riesgo de alucinación inherente a los modelos generativos; la ventana de contexto larga puede amplificar la generación de contenido plausible pero incorrecto si no se valida la salida.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los pesos cuantizados no infrinjan patentes de NVIDIA (NVFP4 es una tecnología propietaria, aunque el checkpoint se distribuye bajo Apache 2.0).
- No hay garantías de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento reciente sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/a2genesis/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Sitio de A2Genesis: https://a2genesis.de
