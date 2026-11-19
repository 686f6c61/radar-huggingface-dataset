# Kiyo1130/Qwen3.8-27B-QSA-NVFP4-GGUF

## Resumen

Qwen3.8-27B-QSA-NVFP4-GGUF es una cuantización en formato GGUF del checkpoint multimodal Qwen3.8-27B-QSA-BF16, publicada por el usuario Kiyo1130. El modelo base, atribuido al usuario higa2515, es una variante de la familia Qwen3.8 de 27.373 millones de parámetros que incorpora indexadores QSA (atención dispersa selectiva por bloques) sobre una arquitectura híbrida de capas Gated DeltaNet y capas de atención QSA. Esta release concreta aplica cuantización NVFP4 (formato de 4 bits de NVIDIA con escalas E4M3 por bloque de 16 pesos y escala global FP32 por matriz) a 400 matrices del modelo, manteniendo en BF16/FP32 los indexadores, embeddings, cabezas y el codificador visual.

El objetivo declarado de esta publicación es permitir el offload completo del modelo en una única GPU NVIDIA Blackwell, con la GeForce RTX 5090 como dispositivo de referencia, usando un fork de llama.cpp con soporte QSA y un backend CUDA que aprovecha la ruta nativa FP4 de Blackwell. El paquete incluye el modelo de lenguaje (19,90 GB), un proyector multimodal BF16 separado (0,93 GB) para entrada de imagen y vídeo, y scripts de conversión y verificación de integridad.

La relevancia de esta ficha es doble: por un lado, documenta una de las primeras implementaciones prácticas de cuantización NVFP4 en el ecosistema llama.cpp para un modelo de ~27B con atención dispersa aprendida; por otro, advierte de que las validaciones publicadas son pruebas de humo funcionales, no evaluaciones de calidad o rendimiento frente a BF16, y de que el modelo requiere offload completo en Blackwell para un comportamiento coherente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas principales, 48 capas Gated DeltaNet + 16 capas QSA (atención dispersa selectiva por bloques) con indexadores entrenados; cabeza MTP (multi-token prediction) |
| Parametros totales | 27.373.133.200 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens máximos según la configuración de origen; validación realizada con 4.096 tokens |
| Tipos de cuantizacion | NVFP4 (E2M1 con escala E4M3 por cada 16 pesos y escala global FP32 por matriz) en 400 matrices; BF16/FP32 en indexadores, embeddings, cabezas y proyector visual |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de lenguaje + mmproj BF16 separado para visión) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 27.373 millones de parámetros distribuido en 64 capas principales: 48 capas Gated DeltaNet (atención lineal con estado recurrente con compuertas) y 16 capas de atención QSA. Los indexadores QSA, entrenados junto con el resto del modelo, seleccionan contexto en bloques de cuatro tokens con un presupuesto de selección heredado de 2.048 tokens. La configuración de origen declara un contexto máximo de 262.144 tokens. El modelo incorpora además una cabeza MTP (multi-token prediction) que permite decodificación especulativa interna, y un codificador visual y proyector separados para entrada multimodal de imagen y vídeo.

Esta release no entrena el modelo: convierte el checkpoint BF16 fijado en el repositorio higa2515/Qwen3.8-27B-QSA-BF16 a GGUF con cuantización NVFP4. La conversión aplica E2M1 a los pesos de 400 matrices seleccionadas (192 proyecciones feed-forward, 144 proyecciones Gated DeltaNet con las proyecciones pequeñas α y β en BF16, y 64 proyecciones de atención QSA), con redondeo al par más cercano y sin dataset de calibración. Los 80 tensores de los indexadores QSA se mantienen en FP32 y el conversor pliega sus pesos de normalización como `1 + weight`. Embeddings, cabeza del modelo y cabeza MTP quedan en BF16 con FP32 donde el conversor lo especifica. El codificador visual y el proyector se distribuyen como GGUF BF16 independiente. La ruta de ejecución FP4 nativa la proporciona el backend CUDA de Blackwell del fork de llama.cpp utilizado.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de contexto largo declarado de hasta 262.144 tokens (validado solo a 4.096 tokens).
- Razonamiento aritmético básico verificado en pruebas de humo (respondió correctamente a `17 + 25`).
- Procesamiento de imagen mediante el proyector multimodal BF16 (identificó correctamente una imagen sintética de color rojo sólido).
- Entrada de vídeo declarada por el pipeline `image-text-to-text`, aunque no validada en las pruebas publicadas.
- Atención dispersa selectiva por bloques mediante indexadores QSA entrenados, que permite procesar prompts que exceden el presupuesto de selección (probado con 2.460 tokens de prompt).
- Decodificación especulativa mediante cabeza MTP: el runtime registró dos tokens borrador aceptados por prueba con MTP activado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de ~27B en una única GPU de consumo Blackwell: la cuantización NVFP4 reduce el modelo de lenguaje a 19,90 GB, lo que permite offload completo en una RTX 5090 (32 GB de VRAM) junto con el proyector visual de 0,93 GB y margen para caché KV, algo inviable con el checkpoint BF16 original.
- Asistente conversacional con contexto largo en estación de trabajo: los 262.144 tokens declarados y la ruta de atención dispersa QSA permiten mantener conversaciones o documentos extensos, aunque la validación publicada solo cubre 4.096 tokens y prompts de hasta 2.460 tokens.
- Análisis de imágenes en local: el proyector BF16 separado permite clasificación y descripción de imágenes (verificado con una imagen sintética) sin depender de APIs externas, útil en entornos con requisitos de privacidad.
- Investigación sobre cuantización FP4: el paquete incluye el script `quantize_nvfp4.py` y comandos de reproducción que regeneran los GGUF con verificación SHA-256, lo que lo convierte en una base reproducible para estudiar el impacto de NVFP4 en calidad y latencia.
- Prototipado de pipelines multimodales con llama.cpp: la integración con `llama-server` y el fork QSA permiten levantar un endpoint compatible con la API de chat para pruebas de integración con clientes existentes.
- Evaluación de decodificación especulativa con MTP: la cabeza MTP incluida y los registros de tokens borrador aceptados facilitan experimentos de throughput en hardware Blackwell con la ruta FP4 nativa.
- Desarrollo y validación de kernels CUDA para FP4: el fork de llama.cpp referenciado y la implementación `mmq.cu` sirven como material de partida para probar rutas FP4 en GPUs Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas publicadas son pruebas de humo funcionales ejecutadas en una RTX 5090 con CUDA 13.2, Flash Attention activado y contexto de 4.096 tokens:

| Prueba | Resultado observado |
|---|---|
| Texto corto (`17 + 25`) | Respondió `42` |
| Entrada de imagen (128 × 128 rojo sólido) | Identificó `Red` |
| Chat QSA más allá del presupuesto de selección (2.460 tokens de prompt) | Respondió `river` a la pregunta sobre el pasaje |
| MTP activado | Las tres pruebas pasaron; el runtime registró dos tokens borrador aceptados por prueba |
| Integridad de archivos | Verificados los 19 shards de origen con SHA-256, matrices NVFP4 exportadas, escalas FP32, indexadores, cabeza MTP y proyector visual |

No se han publicado comparaciones cuantitativas de calidad ni de rendimiento frente a BF16, ni evaluaciones de entrada de vídeo o de operación en el contexto máximo declarado.

## Requisitos de hardware

- VRAM estimada: el modelo de lenguaje NVFP4 ocupa 19,90 GB en disco y el proyector visual BF16 0,93 GB; con caché KV y overhead del runtime, el offload completo requiere una GPU con al menos ~24 GB de VRAM, siendo la RTX 5090 (32 GB) el dispositivo validado.
- GPU recomendadas: NVIDIA Blackwell con ruta FP4 nativa (RTX 5090 como referencia probada); otras GPUs Blackwell no han sido validadas en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 5090 con offload completo. Un intento con 24 capas en GPU y el resto en CPU produjo salida incoherente en el prompt largo, por lo que no se recomienda el reparto parcial.
- Opciones de despliegue: fork de llama.cpp con soporte QSA (commit `864934c`), compilado con `-DGGML_CUDA=ON` y `-DCMAKE_CUDA_ARCHITECTURES=120a-real`; servidor `llama-server`. vLLM, TGI y Ollama no están soportados según la información disponible.
- Toolchain probado: CMake 4.2.3, GCC 15.2, CUDA 13.2, Python 3.12, PyTorch 2.14.0+cu130.
- Latencia y throughput: no disponibles. Solo se documenta que con MTP activado el runtime aceptó dos tokens borrador por prueba.
- Espacio en disco para reproducción: aproximadamente 100 GB adicionales para el checkpoint BF16 de origen, los archivos convertidos y datos temporales.
- Windows: la compilación, inferencia y conversión nativas en Windows no han sido probadas en hardware objetivo; los resultados publicados provienen de Linux.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-NVFP4-GGUF (esta release) | 27,37 B | 262.144 (declarado); 4.096 validado | NVFP4 + BF16/FP32 selectivo | Apache 2.0 | GGUF en Hugging Face, requiere fork QSA de llama.cpp |
| higa2515/Qwen3.8-27B-QSA-BF16 (modelo base) | 27,37 B | 262.144 (declarado) | BF16 | Apache 2.0 | Safetensors en Hugging Face |
| Modelos Qwen3 de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Las validaciones publicadas son pruebas de humo funcionales, no evaluaciones de calidad: no hay comparación cuantitativa con el checkpoint BF16 ni con otros modelos.
- El offload completo en una GPU Blackwell es un requisito práctico: el reparto parcial (24 capas en GPU, resto en CPU) produjo salida incoherente en el prompt largo.
- El contexto máximo declarado de 262.144 tokens no ha sido validado; la prueba real se hizo con 4.096 tokens y un prompt de 2.460 tokens.
- La entrada de vídeo está declarada por el pipeline pero no ha sido evaluada.
- Windows no ha sido probado en hardware objetivo; los resultados documentados son de Linux.
- La cuantización NVFP4 se aplicó sin dataset de calibración (redondeo al par más cercano), lo que puede degradar la calidad frente a BF16 de forma no medida.
- Los indexadores QSA se mantienen en FP32 y el conversor pliega sus pesos de normalización como `1 + weight`; cualquier reimplementación debe respetar esta convención.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y las adiciones QSA arrastran la misma licencia según la model card; conviene revisar los créditos y licencias del repositorio de origen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- Requiere un fork específico de llama.cpp (commit `864934c`) y un parche manual (`#include <algorithm>` en `src/llama-graph.cpp`), lo que añade fricción de mantenimiento.

## Enlaces

- Repositorio Hugging Face de esta release: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-NVFP4-GGUF
- Checkpoint base BF16: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Checkpoint base fijado (commit `aedae2c`): https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16/tree/aedae2c5304698f58d30c5ec709ebf5b37339b1d
- Sección de arquitectura QSA del modelo base: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16#qsa-in-brief
- Créditos y licencias del modelo base: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16#credits-and-licenses
- Fork de llama.cpp con soporte QSA: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/tree/864934c78136ad75274f202b8eb1e7c751d81fb1
- Implementación CUDA de matmul FP4 en el fork: https://github.com/kuraneko1/Qwen3.8-27B-QSA-llama.cpp/blob/864934c78136ad75274f202b8eb1e7c751d81fb1/ggml/src/ggml-cuda/mmq.cu
- Licencia: https://huggingface.co/Kiyo1130/Qwen3.8-27B-QSA-NVFP4-GGUF/blob/main/LICENSE
