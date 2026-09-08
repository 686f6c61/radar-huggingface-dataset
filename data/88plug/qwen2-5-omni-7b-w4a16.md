# 88plug/Qwen2.5-Omni-7B-W4A16

## Resumen

El modelo **88plug/Qwen2.5-Omni-7B-W4A16** es una cuantización post-entrenamiento (PTQ) INT4 del modelo multimodal omni **Qwen2.5-Omni-7B** de Alibaba Qwen, publicada por el autor de HuggingFace **88plug**. Su objetivo es reducir drásticamente los requisitos de memoria del modelo original, pasando de unos 18 GB en BF16 a aproximadamente 3,5 GB en disco, lo que permite ejecutarlo en GPUs de consumo con 8 GB de VRAM, como una RTX 3080 de 10 GB.

La arquitectura original combina un “Thinker” (LLM transformer de 28 capas) con un codificador de audio basado en Whisper, un codificador visual ViT, un decodificador de voz (“Talker”) y un vocoder DiT + BigVGAN. En esta versión cuantizada, solo el backbone LLM se cuantiza a W4A16 INT4 con group size 128; el resto de componentes (audio, visión, voz y vocoder) permanecen en BF16. El formato de pesos es compressed-tensors, nativo para vLLM, y la longitud de contexto soportada en los despliegues documentados es de 32.768 tokens.

Esta cuantización resulta relevante para desarrolladores e investigadores que necesitan probar capacidades omni (entrada de audio e imagen, salida de texto y voz) en hardware asequible, sin sacrificar la flexibilidad de un modelo de código abierto con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Thinker (LLM transformer) + audio_tower (Whisper) + visual (ViT) + talker (decodificador de voz) + token2wav (DiT + BigVGAN) |
| Parametros totales | 10.732.225.408 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según configuraciones de despliegue documentadas) |
| Tipos de cuantizacion | W4A16 INT4 (group size 128), compressed-tensors |
| Idiomas soportados | Inglés (según metadatos del modelo; el modelo base es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | compressed-tensors (safetensors), convertible a GGUF desde el modelo base |

## Arquitectura y entrenamiento

El modelo es una cuantización INT4 del checkpoint `Qwen/Qwen2.5-Omni-7B`, que es un modelo omni multimodal con entrada de audio, imagen y texto, y salida de texto y voz en tiempo real. La cuantización se realizó con AutoRound (esquema W4A16, datafree RTN) aplicada uniformemente a todos los módulos `Linear` del `model.thinker` (el LLM backbone de 28 bloques transformer). Los pesos se almacenan en formato compressed-tensors con grupo de 128, y vLLM los detecta automáticamente sin necesidad de flag `--quantization`.

Los componentes no cuantizados que permanecen en BF16 son: `thinker.audio_tower` (codificador de audio basado en Whisper), `thinker.visual` (codificador visual ViT), `talker` (decodificador de voz de doble pista), `token2wav` (vocoder DiT + BigVGAN), así como embeddings, `lm_head` y capas de normalización. El corpus de calibración utilizado fue `HuggingFaceH4/ultrachat_200k` con 512 muestras para ajuste de instrucciones. No se dispone de información sobre procesos de RLHF o DPO en la cuantización; el modelo base podría incluirlos, pero no está documentado en esta ficha.

## Capacidades

- Generación de texto en inglés, con soporte de entrada multimodal (audio e imagen) y salida de voz en tiempo real mediante vLLM-Omni.
- Entrada de audio: transcripción y comprensión de voz, gracias al codificador Whisper integrado.
- Entrada de imagen: análisis y descripción de contenido visual mediante el codificador ViT.
- Salida de voz: síntesis de voz en tiempo real a través del decodificador Talker y el vocoder, activable con el runtime vLLM-Omni v0.20.0.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el modelo base es multilingüe, pero los metadatos de esta versión cuantizada solo indican inglés.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en tiempo real en entornos con recursos limitados: la cuantización W4A16 reduce los pesos a ~3,5 GB, permitiendo ejecutar el modelo en una GPU de 8 GB, ideal para prototipos locales o despliegues en edge.
- Transcripción y respuesta de audio (speech-to-text y text-to-speech): el modelo puede recibir audio y generar tanto texto como voz, lo que permite construir sistemas de dictado o respuesta por voz con una sola instancia.
- Análisis de imágenes con descripción textual: gracias al codificador visual ViT, el modelo puede describir imágenes o responder preguntas sobre contenido visual, útil en sistemas de moderación o accesibilidad.
- Chat multimodal en aplicaciones de atención al cliente: la entrada simultánea de texto, imagen y audio permite gestionar consultas complejas que incluyan capturas de pantalla o mensajes de voz, con la ventaja de un coste de hardware reducido.
- Despliegue de servicios de texto en producción con vLLM: el formato compressed-tensors es nativo para vLLM, lo que facilita servir el modelo como API compatible con OpenAI, con un throughput adecuado para entornos de baja a media concurrencia.
- Experimentación e investigación en modelos omni cuantizados: la disponibilidad de pesos INT4 con documentación de despliegue permite evaluar el impacto de la cuantización en tareas multimodales sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de tareas multimodales. Se recomienda realizar pruebas propias para validar el rendimiento en los casos de uso previstos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos W4A16 ocupan ~3,5 GB, pero el consumo total con cache KV y overhead se sitúa en torno a 8 GB o más, dependiendo de la longitud de contexto y el tamaño de lote.
- GPU recomendada: una RTX 3080 de 10 GB es suficiente según la documentación; también se indica que cualquier GPU con 8 GB de VRAM puede ejecutar el modelo.
- No cabe en GPUs de consumo de menos de 8 GB (por ejemplo, RTX 3060 de 6 GB) sin técnicas adicionales de offload.
- Opciones de despliegue: vLLM v0.21.0 o superior (preferido, detección automática de compressed-tensors), vLLM-Omni v0.20.0 para salida de voz, SGLang v0.5.8 (solo para el modelo base BF16, no para el checkpoint cuantizado) y llama.cpp (solo texto, convirtiendo desde el modelo base BF16).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 88plug/Qwen2.5-Omni-7B-W4A16 | 10.732.225.408 | 32.768 tokens | compressed-tensors (INT4) | Apache 2.0 | HuggingFace |
| 88plug/Qwen2.5-Omni-7B-W8A16 | No disponible (estimado ~10.7B) | No disponible | compressed-tensors (INT8) | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-Omni-7B (base) | No disponible (estimado ~10.7B) | No disponible | safetensors (BF16) | Apache 2.0 | HuggingFace |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos omni de tamaño similar en la información proporcionada. La principal diferencia entre las variantes es el tamaño en disco y los requisitos de VRAM: ~3,5 GB para W4A16, ~8 GB para W8A16 y ~18 GB para BF16.

## Limitaciones y advertencias

- La salida de voz no funciona con vLLM principal; se requiere el runtime vLLM-Omni v0.20.0, que aún no está integrado en el flujo estándar.
- El runtime Text Generation Inference (TGI) no soporta el formato compressed-tensors de este checkpoint, por lo que no es viable para despliegues con dicha infraestructura.
- El widget de inferencia de HuggingFace falla con frecuencia; se recomienda usar vLLM localmente.
- Los metadatos indican solo inglés como idioma soportado, aunque el modelo base es multilingüe. Esto puede limitar el uso en otros idiomas si no se valida previamente.
- No se han publicado evaluaciones de sesgos ni de seguridad específicas para esta cuantización; el modelo base podría presentar sesgos conocidos de los modelos Qwen.
- La cuantización INT4 puede degradar ligeramente la calidad de las salidas en comparación con el modelo BF16, especialmente en tareas de razonamiento complejo.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos; se recomienda validar las salidas en aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/88plug/Qwen2.5-Omni-7B-W4A16
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Variante W8A16 del mismo autor: https://huggingface.co/88plug/Qwen2.5-Omni-7B-W8A16
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Issue de llama.cpp sobre salida de voz: https://github.com/ggml-org/llama.cpp/issues/21956
