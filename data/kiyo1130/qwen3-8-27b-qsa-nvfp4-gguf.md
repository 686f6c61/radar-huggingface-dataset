# Kiyo1130/Qwen3.8-27B-QSA-NVFP4-GGUF

## Resumen
Qwen3.8-27B-QSA-NVFP4-GGUF es una cuantizacion en formato GGUF del checkpoint Qwen3.8-27B-QSA-BF16, publicada por el usuario Kiyo1130. El modelo base es una variante de Qwen3.8-27B de 27.373.133.200 parametros que incorpora indexadores QSA (atencion dispersa por seleccion de contexto) sobre una arquitectura hibrida de capas Gated DeltaNet y capas de atencion QSA. Esta release concreta tiene como objetivo el offload completo en una unica GPU NVIDIA Blackwell, en concreto una GeForce RTX 5090, usando una bifurcacion de llama.cpp con soporte CUDA nativo para NVFP4.

La cuantizacion NVFP4 almacena 400 matrices en formato E2M1 con una escala E4M3 por cada 16 pesos y una escala global FP32 por matriz, mientras que los indexadores QSA se mantienen en FP32 y las proyecciones pequenas de Gated DeltaNet, los embeddings, la cabeza LM y la cabeza MTP permanecen en BF16. El modelo es multimodal: incluye un encoder de vision y proyector separados en BF16 (0,93 GB) para entrada de imagen y video. La licencia es Apache 2.0.

La relevancia de esta ficha radica en que demuestra un flujo de cuantizacion FP4 de extremo a extremo para un modelo de 27B con atencion dispersa y MTP, pensado para hardware Blackwell de consumo. No obstante, el autor solo ha publicado pruebas funcionales de humo, sin evaluaciones cuantitativas de calidad ni de rendimiento frente al BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas principales, 48 Gated DeltaNet + 16 QSA; indexadores QSA; cabeza MTP |
| Parametros totales | 27.373.133.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens segun configuracion fuente; validacion realizada a 4.096 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1 con escala E4M3 por 16 pesos y escala global FP32) en 400 matrices; FP32 en indexadores QSA; BF16 en embeddings, cabeza LM, cabeza MTP y proyecciones pequenas; vision encoder en BF16 GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); archivo principal de 19,90 GB + mmproj de 0,93 GB |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura hibrida con 64 capas principales: 48 capas Gated DeltaNet y 16 capas de atencion QSA. Los indexadores QSA, entrenados, seleccionan contexto en bloques de cuatro tokens con un presupuesto de seleccion heredado de 2.048 tokens. La configuracion fuente declara un contexto maximo de 262.144 tokens. Se conserva la cabeza MTP (multi-token prediction) original, lo que permite decodificacion especulativa en tiempo de inferencia.

La cuantizacion NVFP4 afecta a 192 proyecciones feed-forward en las 64 capas, 144 proyecciones Gated DeltaNet en 48 capas y 64 proyecciones de atencion QSA en 16 capas. Las proyecciones pequenas alpha y beta de Gated DeltaNet se mantienen en BF16. Los 80 tensores de los indexadores QSA se almacenan en FP32 y el conversor GGUF pliega los pesos de normalizacion como `1 + weight`. La conversion usa redondeo al par mas cercano sin dataset de calibracion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional y respuesta a preguntas, incluyendo razonamiento aritmetico basico (el autor reporta respuesta correcta a `17 + 25`).
- Entrada multimodal de imagen: el encoder de vision identifica contenido en imagenes (prueba con imagen solida roja de 128 x 128).
- Entrada de video declarada por el pipeline `image-text-to-text` y el mmproj, aunque no validada en las pruebas publicadas.
- Procesamiento de contexto largo mediante la ruta dispersa QSA: el autor reporta el procesamiento de 2.460 tokens de prompt con respuesta correcta a una pregunta sobre un pasaje.
- Decodificacion especulativa mediante la cabeza MTP: el runtime registro dos tokens draft aceptados por prueba.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Despliegue local en GPU Blackwell de consumo: el modelo cabe completo en una RTX 5090 con el build CUDA de la bifurcacion QSA de llama.cpp, lo que permite inferencia privada de un modelo de 27B sin servidores multigpu.
- Procesamiento de documentos largos con atencion dispersa: gracias al presupuesto de seleccion QSA de 2.048 tokens y al contexto declarado de 262.144 tokens, es adecuado para resumir o consultar documentos extensos, aunque la validacion publicada solo alcanza 4.096 tokens.
- Analisis de imagenes en local: con el mmproj BF16 se pueden clasificar o describir imagenes en flujos offline, util en entornos con requisitos de privacidad.
- Prototipado de pipelines multimodales con llama.cpp: al estar en GGUF e integrarse con `llama-server`, sirve para experimentar con entrada image-text-to-text en infraestructura propia.
- Investigacion sobre cuantizacion FP4: el repositorio incluye `quantize_nvfp4.py` y comandos de reproduccion, lo que lo convierte en una referencia para estudiar el impacto de NVFP4 en modelos con atencion dispersa.
- Evaluacion de decodificacion especulativa con MTP: la cabeza MTP conservada permite medir la aceptacion de tokens draft en hardware Blackwell dentro de pipelines de generacion de baja latencia.
- Generacion de codigo y matematicas: no hay evidencia publicada especifica en la informacion disponible; no se recomienda como caso de uso validado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pruebas funcionales de humo en una RTX 5090 con CUDA 13.2, Flash Attention activado y contexto de 4.096 tokens:

| Prueba | Resultado observado |
|---|---|
| Texto corto (`17 + 25`) | Respuesta `42` |
| Imagen solida roja 128 x 128 | Identificada como `Red` |
| Chat QSA mas alla del presupuesto de seleccion (2.460 tokens) | Respuesta `river` correcta |
| MTP activado | Las tres pruebas pasan; dos tokens draft aceptados por prueba |
| Integridad de archivos | SHA-256 verificado en los 19 shards fuente y matrices exportadas |

No hay comparaciones cuantitativas de calidad ni de rendimiento frente al checkpoint BF16.

## Requisitos de hardware
- VRAM estimada: aproximadamente 19,90 GB para el modelo de lenguaje en NVFP4 mas 0,93 GB para el encoder de vision, es decir, en torno a 21 GB en total, mas overhead de contexto y cache KV.
- GPU recomendadas: NVIDIA Blackwell con compute capability 12.0 o 12.1, probado en GeForce RTX 5090. Las arquitecturas 10.x y 11.x no han sido probadas en esta release.
- Cabe en GPU de consumo: si, en RTX 5090. No se ha validado en otras GPU de consumo.
- Opciones de despliegue: la bifurcacion QSA de llama.cpp (`kuraneko1/Qwen3.8-27B-QSA-llama.cpp`, commit `864934c`) con `llama-server`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor advierte que un reparto de 24 capas en GPU y el resto en CPU produjo salida incoherente en el prompt largo; recomienda offload completo en Blackwell.
- Toolchain probado: CMake 4.2.3, GCC 15.2, CUDA 13.2, Python 3.12 y PyTorch 2.14.0+cu130 para la reproduccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-NVFP4-GGUF (este) | 27,37B | 262.144 declarado; 4.096 validado | NVFP4 + BF16/FP32 parcial | Apache 2.0 | GGUF en Hugging Face |
| higa2515/Qwen3.8-27B-QSA-BF16 (base) | 27,37B | 262.144 declarado | BF16 | Apache 2.0 | Safetensors en Hugging Face |
| Otros modelos de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias
- Solo se han publicado pruebas funcionales de humo; no hay evaluacion cuantitativa de calidad ni comparacion con BF16.
- El contexto validado es de 4.096 tokens, muy por debajo del maximo declarado de 262.144; el comportamiento en contextos largos no esta verificado.
- La entrada de video no ha sido evaluada.
- El offload parcial (24 capas en GPU, resto en CPU) produjo salida incoherente en el prompt largo; se requiere offload completo en Blackwell.
- Solo probado en RTX 5090 con compute capability 12.0/12.1; otras GPU Blackwell (10.x, 11.x) no estan testeadas.
- La compilacion e inferencia nativas en Windows no han sido probadas en hardware objetivo.
- Requiere una bifurcacion especifica de llama.cpp; no es compatible con builds estandar sin el soporte QSA y NVFP4.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar calidad multilingue.
- Licencia Apache 2.0 permite uso comercial, pero las dependencias del fork de llama.cpp y los creditos a Qwen, higa2515 y los contribuidores deben respetarse.
- Se necesitan aproximadamente 100 GB de disco libre para reproducir la conversion (checkpoint BF16, archivos convertidos y temporales).

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-NVFP4-GGUF
- Checkpoint base BF16: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Checkpoint base fijado (commit): https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16/tree/aedae2c5304698f58d30c5ec709ebf5b37339b1d
- Bifurcacion QSA de llama.cpp: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/tree/864934c78136ad75274f202b8eb1e7c751d81fb1
- Implementacion GGML CUDA (mmq.cu): https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/blob/864934c78136ad75274f202b8eb1e7c751d81fb1/ggml/src/ggml-cuda/mmq.cu
- Seccion QSA in brief del modelo base: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16#qsa-in-brief
- Creditos y licencias del modelo base: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16#credits-and-licenses
