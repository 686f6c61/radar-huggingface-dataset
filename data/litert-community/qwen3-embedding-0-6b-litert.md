# litert-community/Qwen3-Embedding-0.6B-LiteRT

## Resumen

Qwen3-Embedding-0.6B-LiteRT es la reautoría del modelo de embeddings de texto Qwen3-Embedding-0.6B de Alibaba Qwen, empaquetada por la comunidad litert-community para ejecutarse íntegramente en el acelerador GPU de LiteRT (`CompiledModel` con ML Drift) en dispositivos Android y otros entornos edge. No es un modelo generativo: es un encoder de frases que produce embeddings de 1024 dimensiones mediante pooling del último token en una única pasada forward, lo que permite compilarlo como un grafo `.tflite` plano en lugar de un `.litertlm` con caché KV.

El modelo resuelve la mitad de recuperación de un pipeline RAG (embeddings de consulta y documentos, ranking por similitud coseno) sin servidor y sin fallback a CPU. La relevancia actual está en el despliegue on-device: búsqueda semántica local, privacidad de datos y latencia baja en móvil. La arquitectura es un transformer Qwen3 de 28 capas con 0,6 mil millones de parámetros, ventana de entrada fija de 128 tokens en esta exportación, pesos en fp16 y licencia Apache-2.0.

La conversión incluye una innovación técnica destacable: un RMSNorm con normalización por máximo por fila para evitar el desbordamiento de fp16 en el flujo residual de las capas profundas, matemáticamente equivalente al original. Verificado en Pixel 8a con el 100 % de los nodos (3264/3264) en el delegado GPU y correlación de coseno de 0,9997 frente a la referencia fp32 de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3 decoder-only, 28 capas, usado como encoder de embeddings (pooling del último token) |
| Parámetros totales | 0,6 mil millones (modelo base Qwen3-Embedding-0.6B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (forma fija de entrada `inputs_embeds[1,128,1024]` en esta exportación) |
| Tipos de cuantización | fp16 (única variante publicada: `qwen3emb_gpu_fp16.tflite`) |
| Idiomas soportados | no disponible (el modelo base Qwen3-Embedding es multilingüe, pero la model card no detalla idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.tflite` (grafo LiteRT) + `embeddings_fp16.bin` (tabla de embeddings de tokens fp16) + `vocab.json` y `merges.txt` (tokenizador BPE) |
| Dimensión de embedding | 1024 (soporta truncado Matryoshka 1024→N) |
| Tamaño del repo | 1,2 GB |
| Librería | litert |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only Qwen3 de 28 capas reutilizado como encoder de frases. La inferencia consiste en una única pasada forward sobre `inputs_embeds[1,128,1024]` que produce `hidden[1,128,1024]`; el embedding final se obtiene por pooling del último token real y normalización L2, con truncado Matryoshka opcional de 1024 a N dimensiones. Al no haber generación ni caché KV, el grafo es un `.tflite` único que se ejecuta en la misma ruta GPU que una CNN o un ViT.

La reautoría para GPU incluye varios ajustes específicos de dispositivo: el GATHER de la tabla de embeddings de tokens está prohibido en GPU, por lo que se hace en el host y se alimenta como `inputs_embeds`; las cabezas GQA se repiten con `cat` hasta 16 para evitar `BROADCAST_TO` (rechazado por Mali); RoPE y la máscara causal se hornean como constantes; y todos los tensores se mantienen en ≤4D. El ajuste crítico es el RMSNorm con normalización por máximo por fila: el flujo residual crece con la profundidad y el `mean(x²)` de los RMSNorm profundos desborda fp16 (>65504), provocando `rsqrt(inf)=0` y colapso de la salida a cero; dividir por el máximo por fila mantiene los cuadrados en [0,1] y la suma de 1024 términos nunca desborda, con equivalencia matemática exacta.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO en la información proporcionada; esos detalles corresponden al modelo base Qwen3-Embedding-0.6B, no documentados en esta model card.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones para similitud semántica y búsqueda semántica.
- Ranking de documentos por similitud coseno: recuperación de la mitad de un pipeline RAG.
- Pooling del último token en una sola pasada forward, sin generación ni caché KV.
- Truncado Matryoshka opcional de 1024 a N dimensiones para reducir coste de almacenamiento y comparación.
- Ejecución íntegra en GPU LiteRT (`CompiledModel`, ML Drift) sin fallback a CPU; también ejecutable en NPU Hexagon (QNN/HTP).
- Despliegue on-device en Android (Pixel 8a verificado) y soporte de tokenizador BPE byte-level Qwen en el host.
- Soporte de tool calling / function calling: no aplica (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-step: no aplica.
- Capacidades multilingües: no documentadas en esta model card; dependen del modelo base.
- Capacidades especiales: pensado para inferencia edge con latencia de decenas a cientos de milisegundos por embedding.

## Casos de uso

- Búsqueda semántica local en aplicaciones Android: el modelo embebe la consulta y un conjunto de documentos en el dispositivo y los ordena por coseno, sin enviar datos a un servidor. Adecuado por su ejecución GPU completa y su latencia de ~390 ms por embedding en Pixel 8a.
- RAG on-device con privacidad: la mitad de recuperación del pipeline se ejecuta en el móvil, de modo que los documentos del usuario nunca salen del dispositivo; el modelo generativo podría residir en la nube o ejecutarse aparte.
- Clasificación y deduplicación de textos cortos: comparar embeddings de hasta 128 tokens para agrupar tickets, correos o notas similares, aprovechando la normalización L2 y la similitud coseno.
- Filtrado previo en asistentes de voz o chat: recuperar los fragmentos más relevantes de una base local antes de invocar un LLM remoto, reduciendo tokens enviados y coste de API.
- Indexación de notas y documentación personal: generar embeddings Matryoshka truncados (por ejemplo, 256 dimensiones) para almacenar un índice compacto en el dispositivo y hacer búsqueda aproximada rápida.
- Detección de contenido duplicado o casi duplicado en pipelines de moderación: umbrales de coseno sobre embeddings fp16 con correlación de 0,9997 frente a la referencia fp32, suficiente para decisiones automáticas.
- Prototipado de recuperación en navegador: la model card registra un intento con LiteRT.js y WebGPU en Chromium 151 sobre M4 Max que no llegó a ejecutarse, por lo que este caso queda como vía experimental no validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, MTEB, etc.) en la información disponible. Los datos de rendimiento medidos son de latencia y paridad numérica:

| Entorno | Runtime / backend | Grafo en GPU | Latencia |
|---|---|---|---|
| Pixel 8a (Tensor G3, Android 16) | LiteRT `CompiledModel` (ML Drift), GPU | 3264 / 3264 nodos | ~390 ms por embedding |
| Pixel 8a | TFLite `benchmark_model`, GPU (OpenCL, `TfLiteGpuDelegateV2`) | 108 / 3264 nodos | 5191,2 ms |
| Pixel 8a | TFLite `benchmark_model`, CPU (XNNPACK, 4 hilos) | — | 2076,8 ms |
| Galaxy S26 | LiteRT 2.2.0, GPU (ML Drift) | no disponible | 44,7 ms p50 |
| Galaxy S26 | LiteRT 2.2.0, NPU (QNN/HTP) | no disponible | 25,4 ms p50 |
| Navegador Chromium 151, M4 Max | LiteRT.js 2.5.3, WebGPU | no disponible | no ejecutado |

Paridad numérica: coseno de 0,9997 frente a la referencia fp32 de HuggingFace; ranking semántico correcto (consulta "What is the capital of China?" → "The capital of China is Beijing" con 0,77, documentos no relacionados por debajo de 0,1). Tamaño fp16 del grafo: 881 MB.

## Requisitos de hardware

- VRAM/RAM estimada: el grafo fp16 ocupa 881 MB; el repo completo son 1,2 GB, incluyendo la tabla de embeddings de tokens fp16 (`embeddings_fp16.bin`, 151669×1024).
- GPU recomendadas: GPU integrada de SoC móvil con soporte LiteRT ML Drift (Tensor G3 verificado); NPU Hexagon (QNN/HTP) en Galaxy S26 con 25,4 ms p50.
- Cabe en consumer GPU: sí, en cualquier GPU de escritorio con soporte LiteRT; no se documentan pruebas en A100, H100 ni RTX 4090.
- Opciones de despliegue: LiteRT `CompiledModel` (API Kotlin/Android), TFLite `benchmark_model` con delegado GPU OpenCL o XNNPACK en CPU, y LiteRT.js con WebGPU (intento no ejecutado en la información disponible).
- Latencia y throughput: ~390 ms por embedding en Pixel 8a vía `CompiledModel` GPU; 44,7 ms p50 en Galaxy S26 GPU y 25,4 ms p50 en NPU. En el delegado OpenCL clásico la latencia sube a 5191,2 ms y en CPU XNNPACK a 2076,8 ms, por lo que en ese delegado la CPU es más rápida que la GPU.
- Nota: el grafo tiene entrada fija de 128 tokens; textos más largos requieren truncado o troceado en el host.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Embedding-0.6B-LiteRT (este) | 0,6 B | 128 tokens (forma fija) | `.tflite` LiteRT, GPU/NPU on-device | Apache-2.0 | HuggingFace, 58 descargas, 2 likes |
| Qwen/Qwen3-Embedding-0.6B (base) | 0,6 B | no disponible en la información | safetensors, sentence-transformers | Apache-2.0 | HuggingFace |
| Otros modelos de embeddings pequeños (p. ej. familia MiniLM, BGE-small) | no disponible | no disponible | safetensors, ONNX, GGUF | no disponible | no disponible |

La comparación de rendimiento de calidad con alternativas no está disponible: la model card solo aporta paridad numérica frente a la referencia fp32 del propio modelo base (coseno 0,9997), no resultados MTEB ni comparativas con otros embeddings.

## Limitaciones y advertencias

- Ventana de entrada fija de 128 tokens en esta exportación: textos más largos deben truncarse o trocearse, lo que puede perder información en documentos extensos.
- Solo se publica variante fp16; no hay cuantizaciones int8 ni otras, lo que limita el ahorro de memoria en dispositivos con poca RAM.
- El GATHER de la tabla de embeddings se hace en el host: la aplicación debe implementar el tokenizador BPE y la búsqueda de embeddings fuera del grafo, lo que añade complejidad de integración.
- El delegado GPU OpenCL clásico de TFLite es más lento que la CPU en este grafo (5191,2 ms frente a 2076,8 ms); el rendimiento depende críticamente de usar LiteRT `CompiledModel` y no el delegado antiguo.
- El intento en navegador con LiteRT.js y WebGPU no llegó a ejecutarse, por lo que el soporte web no está validado.
- Riesgo de alucinación: no aplica directamente al ser un encoder, pero los embeddings pueden producir similitudes engañosas en textos ambiguos o muy cortos; conviene calibrar umbrales de coseno.
- Sesgos: no documentados en la información proporcionada; heredables del corpus de entrenamiento del modelo base.
- Idiomas: no documentados en esta model card; el comportamiento multilingüe depende del modelo base y no está verificado en la exportación LiteRT.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- El modelo base es de 2025 y la exportación LiteRT se creó en julio de 2026; verificar compatibilidad con la versión de LiteRT del dispositivo (probado con LiteRT 2.2.0 en Galaxy S26).

## Enlaces

- HuggingFace: https://huggingface.co/litert-community/Qwen3-Embedding-0.6B-LiteRT
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Registro de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/qwen3-embedding-0.6b/CARD.md
- Herramienta de medición LiteRT: https://ai.google.dev/edge/litert/models/measurement
- Muestra oficial LiteRT (tokenizador, búsqueda de embeddings y app de búsqueda semántica): no disponible como URL en la información proporcionada
