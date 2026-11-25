# nm-testing/model_free_fp8-e2e

## Resumen

`nm-testing/model_free_fp8-e2e` es un checkpoint derivado de TinyLlama-1.1B-Chat-v1.0, publicado por el usuario de pruebas `nm-testing` (repo de validación de la librería `compressed-tensors` de Neural Magic). El modelo base es un transformer decoder-only tipo Llama de 1.100.048.384 parámetros, preentrenado por el proyecto TinyLlama sobre 3 billones de tokens y posteriormente afinado con el recetario de Zephyr (SFT sobre UltraChat y alineamiento con DPO sobre UltraFeedback). La variante publicada aquí incorpora pesos cuantizados en FP8 (formato `compressed-tensors`), orientados a servir el modelo con menor huella de memoria en GPUs con soporte de FP8 nativo.

Su relevancia es fundamentalmente técnica: sirve como referencia end-to-end para validar pipelines de cuantización FP8 sobre arquitecturas Llama, y como modelo compacto de 1,1B parámetros para prototipado, entornos con VRAM limitada y pruebas de integración de tooling de inferencia (vLLM, TGI, transformers). No es un modelo destinado a producción de alta exigencia: es un checkpoint de test con 324 descargas y sin pipeline declarado.

La ventana de contexto no está especificada en la información disponible; el modelo base TinyLlama emplea la arquitectura y tokenizador de Llama 2, con contexto de entrenamiento típico de 2.048 tokens, pero este dato no se confirma en la ficha del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2, mismo tokenizador y arquitectura que Llama 2) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato `compressed-tensors`); el modelo base admite cuantizaciones estándar (INT8, INT4, GGUF) no verificadas en este checkpoint |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con metadatos `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura exacta de Llama 2: atención multi-cabeza con RoPE, normalización RMSNorm y activación SwiGLU, reutilizando el tokenizador de Llama 2 para compatibilidad directa con el ecosistema. El preentrenamiento del modelo base TinyLlama se realizó sobre 3 billones de tokens con un dataset compuesto por `cerebras/SlimPajama-627B`, `bigcode/starcoderdata`, `HuggingFaceH4/ultrachat_200k` y `HuggingFaceH4/ultrafeedback_binarized`, según los tags del repositorio.

Sobre esa base, el afinamiento siguió la receta de Zephyr: una fase de SFT sobre una variante de UltraChat (diálogos sintéticos generados por ChatGPT) y una fase de alineamiento con DPO mediante `DPOTrainer` de TRL sobre `openbmb/UltraFeedback` (64k prompts con completions rankeadas por GPT-4). La innovación de esta publicación concreta no está en el entrenamiento sino en la cuantización: los pesos se almacenan en FP8 mediante `compressed-tensors`, lo que reduce el tamaño del repo a 2,5 GB y permite inferencia con menor ancho de banda de memoria en hardware compatible. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`<|system|>`, `<|user|>`, `<|assistant|>`).
- Generación de código en Python y otros lenguajes presentes en `bigcode/starcoderdata` (el widget de ejemplo muestra una función de Fibonacci).
- Razonamiento básico y respuesta a instrucciones tras el alineamiento con DPO.
- Soporte de system prompt para control de estilo y rol.
- Capacidades multilingües limitadas: solo inglés declarado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Validación de pipelines de cuantización FP8: usar el checkpoint como caso de prueba end-to-end para verificar que `compressed-tensors` carga y ejecuta correctamente en vLLM o transformers antes de aplicarlo a modelos mayores.
- Prototipado de asistentes conversacionales: con 1,1B parámetros cabe en cualquier GPU consumer y permite iterar sobre plantillas de chat y prompts de sistema sin coste de infraestructura.
- Generación de código asistida en local: el modelo base se entrenó con `starcoderdata` y responde a peticiones de funciones sencillas, adecuado para autocompletado en editores con recursos limitados.
- Pruebas de integración en CI/CD: su tamaño reducido (2,5 GB en FP8) permite incluirlo en tests automatizados que verifiquen regresiones en servidores de inferencia (TGI, vLLM, llama.cpp) sin necesidad de GPUs de datacenter.
- Docencia y experimentación académica: modelo de referencia para estudiar el efecto de SFT + DPO en modelos pequeños y comparar recetas de alineamiento.
- Despliegue en edge o entornos con VRAM restringida: al ser FP8 y 1,1B, puede servirse en GPUs de 8-16 GB o incluso CPU con cuantización adicional, para tareas de generación de texto de baja latencia y baja concurrencia.
- Benchmarking de hardware FP8: medir throughput y latencia de kernels FP8 en GPUs Ada/Hopper frente a BF16 usando este checkpoint como carga controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP8: aproximadamente 1,1 GB para pesos, más overhead de activaciones y KV cache (estimación típica de 2-4 GB en total para contextos cortos).
- VRAM estimada en BF16 (modelo base): aproximadamente 2,2 GB para pesos, 4-6 GB en total con activaciones.
- GPU recomendadas para FP8 nativo: NVIDIA H100, H200, L40S, RTX 4090 (Ada Lovelace soporta FP8 en tensor cores).
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y cualquier GPU con 8 GB o más; también en GPUs integradas con cuantización INT4 vía llama.cpp.
- Opciones de despliegue: transformers (>=4.34), vLLM (con soporte `compressed-tensors`), TGI, llama.cpp/Ollama (requiere conversión a GGUF, no incluida en este repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nm-testing/model_free_fp8-e2e | 1,1B | no disponible | Apache 2.0 | safetensors FP8 | Checkpoint de test, cuantizado FP8 |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 (típico Llama 2) | Apache 2.0 | safetensors BF16 | Modelo base original, sin cuantizar |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | safetensors | Mayor contexto y multilingüismo |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | safetensors | Alternativa moderna de tamaño similar |

La comparativa de rendimiento cuantitativo no está disponible: no se han publicado benchmarks de este checkpoint frente a las alternativas.

## Limitaciones y advertencias

- Modelo de pruebas: el autor (`nm-testing`) es un espacio de validación, no un proyecto mantenido con garantías de soporte o actualizaciones.
- Solo inglés: no se declara soporte de castellano ni otros idiomas; el rendimiento fuera del inglés será degradado.
- Contexto no documentado: no se especifica la longitud de contexto efectiva de este checkpoint; asumir el valor del modelo base sin confirmación es arriesgado en producción.
- Riesgo de alucinación elevado: con 1,1B parámetros y alineamiento DPO sobre datos sintéticos, la fiabilidad factual es limitada.
- Sesgos heredados: los datasets de preentrenamiento (SlimPajama, UltraChat) y el ranking de GPT-4 en UltraFeedback introducen sesgos de dominio, estilo y demográficos no auditados.
- Cuantización FP8: requiere hardware compatible para aprovechar el formato; en GPUs sin soporte FP8 los pesos pueden convertirse a BF16 con pérdida de la ventaja de memoria.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de test no se recomienda su uso en producción sin validación propia.
- Sin pipeline declarado en Hugging Face: la integración automática con `pipeline()` puede requerir especificar la tarea manualmente.

## Enlaces

- Hugging Face: https://huggingface.co/nm-testing/model_free_fp8-e2e
- Repositorio TinyLlama: https://github.com/jzhang38/TinyLlama
- Modelo base intermedio: https://huggingface.co/TinyLlama/TinyLlama-1.1B-intermediate-step-1431k-3T
- Modelo base chat: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Receta Zephyr: https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha
- Dataset UltraChat: https://huggingface.co/datasets/stingning/ultrachat
- Dataset UltraFeedback: https://huggingface.co/datasets/openbmb/UltraFeedback
- TRL (DPOTrainer): https://github.com/huggingface/trl
- Librería compressed-tensors: no disponible en la información proporcionada
