# mihaichiorean/gemma-4-E4B-it-qat-int4g32-TRT-Edge-LLM

## Resumen

Gemma 4 E4B es un modelo multimodal de Google (familia Gemma 4) que acepta entrada de texto e imagen. Esta ficha describe una compilación comunitaria de terceros: el autor `mihaichiorean` ha empaquetado los pesos del checkpoint oficial `google/gemma-4-E4B-it-qat-q4_0-unquantized` como motores precompilados de TensorRT Edge-LLM, junto con binarios de ejecución, tablas de embeddings INT8 y los grafos ONNX exportados. El objetivo es ejecutar el modelo en una Jetson Orin Nano de 8 GB sin necesidad de compilar nada.

La relevancia de esta publicación es práctica: demuestra que un modelo de la clase E4B (con cuantización QAT INT4) cabe y funciona en hardware de borde con 8 GB de memoria compartida, con un rendimiento de aproximadamente 24 tok/s en decodificación y un consumo pico de 4,5 GiB. Incluye tres motores de longitud de contexto distinta (2k, 8k y 32k de KV) y un codificador visual en FP16.

No se trata de un modelo nuevo ni de un fine-tune: es una distribución de artefactos de despliegue para una plataforma concreta (JetPack 7.2.1, TensorRT 10.16.2.10, CUDA 13.2). El checkpoint base y su licencia Apache 2.0 se mantienen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión); no se detalla la variante exacta en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Motores con 2.048 tokens de entrada / 4.096 KV; 8.192 / 10.240 KV; y 8.192 / 33.792 KV (pensado para razonamiento largo) |
| Tipos de cuantizacion | INT4 con escala FP16 por grupo de 32 pesos en capas lineales y cabeza de salida (rejilla Q4_0 de QAT); embeddings INT8 con escala por fila; atención, normas y activaciones en FP16; codificador visual en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Motores TensorRT (`.engine`), ONNX (`model.onnx` + `model.onnx.data`), tablas de embeddings en safetensors (INT8) |

## Arquitectura y entrenamiento

El checkpoint base es la variante QAT de Gemma 4 E4B, es decir, un modelo entrenado con cuantización consciente para que los pesos encajen exactamente en la rejilla Q4_0 sin recalibración posterior. Esta compilación no reentrena ni recalibra: importa los códigos y escalas tal como vienen del checkpoint, y verifica que cada grupo de 32 pesos cae sobre la rejilla (343 tensores lineales, 124.149.760 de 124.149.760 grupos válidos; cabeza de salida atada, 20.971.520 de 20.971.520). Las tablas de embedding de tokens y de embeddings por capa (PLE) se almacenan en INT8 con escalas por fila y se mantienen en el lado de CPU con mapeo de memoria (`--hostEmbeddingTables`). Atención, normas y activaciones se ejecutan en FP16, y el codificador visual también en FP16.

La innovación técnica destacable es la "compactación de prefill": durante la fase de prefill solo se calcula el último token del prompt en las capas de KV compartida, lo que acelera el prefill sin alterar las salidas. Además, los motores están compilados en modo de misma capacidad de cómputo desde una AGX Orin (el compilador de la Nano se queda sin memoria de GPU para E4B) y desde una Orin NX de 16 GB en el caso del motor de 32k. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional con plantilla de chat (`it`), incluyendo modo "thinking" desactivable.
- Entrada de imagen junto con texto (pipeline `image-text-to-text`), gracias al codificador visual FP16 incluido.
- Respuestas de opción múltiple en formato de letra, con un harness de precisión propio del runtime.
- Ejecución de prompts largos: el motor de 32k permite cadenas de razonamiento extensas dentro de los 8.192 tokens de entrada y 33.792 de KV.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Visión artificial en el borde con comprensión de lenguaje: en una Jetson Orin Nano se puede alimentar el codificador visual con fotogramas de cámara y formular preguntas en lenguaje natural sobre la escena, todo dentro de los 8 GB de memoria del dispositivo. El autor advierte que un detector de cámara compartiendo GPU a 15 fps ralentiza prefill y decodificación aproximadamente 1,5x en E2B.
- Asistente local sin conexión: el motor de 2k con 4,5 GiB de pico permite desplegar un chatbot de texto e imagen en un dispositivo de 8 GB con servicios detenidos, útil en entornos sin red o con requisitos de privacidad.
- Razonamiento largo en dispositivo: el motor de 32k (8.192 de entrada / 33.792 KV) está pensado para cadenas de "thinking" prolongadas, por ejemplo análisis de documentos o depuración de razonamiento paso a paso en el propio dispositivo.
- Clasificación y extracción de información multimodal: con la plantilla de chat y respuestas cortas y greedy, el modelo es adecuado para tareas de etiquetado o respuesta a preguntas sobre imágenes en pipelines de inspección.
- Evaluación comparativa de cuantización en borde: el repositorio incluye `scripts/` y ejemplos de peticiones que permiten reproducir el harness de precisión (`examples/accuracy`) y medir la degradación frente al modelo sin cuantizar.
- Prototipado de despliegue TensorRT Edge-LLM: al incluir ONNX, binarios `llm_build`/`visual_build` y `run.sh`, sirve como base para reconstruir motores en otras pilas de software o para validar integraciones antes de pasar a producción.
- Benchmarking de latencia y throughput en hardware Jetson: los datos publicados (636 ms de prefill para 846 tokens, 41,2 ms por paso de decodificación) permiten usar el repositorio como referencia para comparar con llama.cpp en el mismo dispositivo.

## Benchmarks y rendimiento

Precisión (harness de precisión de TensorRT Edge-LLM, zero-shot, plantilla de chat, 16 tokens nuevos, greedy, thinking off):

| Modelo | Dispositivo | Correctas | MMLU | % del original | Respuestas parseadas a letra |
|---|---|---|---|---|---|
| Original (pesos FP16, tablas FP16) | AGX Orin | 9.070 | 64,59 % | 100 % | 12.023 (85,6 %) |
| Esta compilación | Orin Nano | 9.185 | 65,41 % | 101,3 % (p = 3,0e-04) | 12.395 (88,3 %) |

Subconjunto fijo de 500 preguntas MMLU (turno de sistema pidiendo solo la letra, 16 tokens, greedy): 68,00 % frente a 68,00 % del original (100,0 %, p = 1,0), con predicciones idénticas a una ejecución en AGX Orin.

Advertencia del autor sobre el parseo: la puntuación oficial supera a la del original porque esta compilación responde con letra parseable más a menudo (88,3 % frente a 85,6 %); en las 11.909 preguntas donde ambos dieron letra, el original obtiene 75,56 % y esta compilación 74,79 % (0,8 puntos menos, p = 6,6e-04). Debe leerse como "cercano al original", no como "mejor".

Rendimiento en Orin Nano 8 GB a 25 W:

| Métrica | Valor |
|---|---|
| Prefill de prompt de 846 tokens | 636 ms |
| Decodificación por paso | 41,2 ms (≈24,3 tok/s) |
| Memoria pico (motor 2k) | 4,5 GiB (≈2,9 GiB libres con servicios detenidos) |
| Tamaño del motor LLM | 2,65 GB |
| Tamaño de tablas | 3,53 GB |

Comparación con llama.cpp en la misma Nano (forma de llama-bench, Q4_K_M de unsloth):

| Métrica | TensorRT Edge-LLM | llama.cpp |
|---|---|---|
| pp512 | 1.411 tok/s | 542,3 tok/s |
| tg128 | 24,9 tok/s | 14,13 tok/s |

## Requisitos de hardware

- VRAM/memoria: pico de 4,5 GiB con el motor de 2k en Orin Nano 8 GB; quedan aproximadamente 2,9 GiB libres con servicios detenidos.
- GPU objetivo: Jetson Orin Nano 8 GB (SM 8.7, aarch64). Los motores se compilaron en AGX Orin (2k y 8k) y en Orin NX 16 GB (32k).
- GPU de consumo: no se documenta soporte para RTX 4090 u otras GPU de escritorio; los binarios son aarch64 SM 8.7.
- Pila de software obligatoria: JetPack 7.2.1 (L4T R39.2.1), TensorRT 10.16.2.10 y CUDA 13.2; los motores solo cargan con `llm_inference` y el plugin de `bin/`. En cualquier otra pila hay que reconstruir desde `onnx/`.
- Opciones de despliegue: TensorRT Edge-LLM (runtime incluido); el autor compara con llama.cpp, pero los motores de este repositorio no son compatibles con vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: 636 ms de prefill para 846 tokens y 41,2 ms por paso de decodificación en Orin Nano a 25 W. Un detector de cámara a 15 fps compartiendo GPU ralentiza prefill y decodificación aproximadamente 1,5x (medido en E2B, no en E4B).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta compilación (Gemma 4 E4B QAT INT4, TensorRT Edge-LLM) | no disponible | 2k/8k/32k según motor | 65,41 % (Orin Nano); 68,00 % en MMLU-500 | Apache 2.0 | Motores precompilados para Orin Nano |
| Gemma 4 E4B original (FP16, mismo runtime) | no disponible | no disponible | 64,59 % (AGX Orin); 68,00 % en MMLU-500 | Apache 2.0 | Checkpoint en Hugging Face |
| Gemma 4 E4B QAT Q4_K_M en llama.cpp (unsloth) | no disponible | no disponible | no disponible | Apache 2.0 | Pesos GGUF |
| Gemma 4 E2B (referencia de rendimiento del autor) | no disponible | no disponible | no disponible | Apache 2.0 | no disponible en esta información |

La comparación se limita a variantes del mismo modelo base y a la alternativa de runtime (llama.cpp); no se dispone de datos de benchmarks frente a modelos de otras familias.

## Limitaciones y advertencias

- Es una compilación comunitaria de un fork de TensorRT Edge-LLM; no es una versión oficial de NVIDIA ni de Google.
- Los motores solo cargan con una pila de software exacta (JetPack 7.2.1, TensorRT 10.16.2.10, CUDA 13.2); cualquier otra versión exige reconstruir desde `onnx/`.
- El motor de 2k y 8k se compiló en una AGX Orin porque el compilador de la Nano agota la memoria de GPU para E4B; el de 32k se compiló en una Orin NX 16 GB.
- La puntuación MMLU superior a la del original se explica por un artefacto de parseo; en comparación pareada el modelo queda 0,8 puntos por debajo. No debe interpretarse como una mejora de calidad.
- El harness por defecto (5-shot, un token nuevo) puntúa cerca del azar porque el modelo empieza sus respuestas con "Here" o "The"; las cifras publicadas usan zero-shot con 16 tokens.
- La cuantización INT4 con grupo de 32 introduce pérdida de precisión frente a FP16, cuantificada en la comparación pareada anterior.
- Riesgo de alucinación, sesgos conocidos y comportamiento multilingüe: no disponible en la información proporcionada.
- Licencia Apache 2.0 del modelo base, pero los binarios y motores incluidos pueden estar sujetos a las licencias de terceros recogidas en `bin/THIRD_PARTY_LICENSES/`; conviene revisarlas antes de uso comercial.
- No se documentan soportes de tool calling, agentes ni otros idiomas; no deben asumirse en producción sin validación propia.
- El rendimiento medido asume servicios detenidos en la Nano; compartir GPU con otras cargas (por ejemplo, un detector de cámara) degrada la latencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mihaichiorean/gemma-4-E4B-it-qat-int4g32-TRT-Edge-LLM
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Fork de TensorRT Edge-LLM (etiqueta `gemma4-jetson-v0.1`): no disponible como URL en la información proporcionada
- Paper, blog o demo oficiales: no disponible en la información proporcionada
