# PostAlign/sLLM

## Resumen

sLLM es un modelo de lenguaje pequeño (178,6 millones de parámetros) desarrollado por PostAlign, específicamente entrenado para el idioma coreano. Se trata de un decoder transformer de 24 capas con atención GQA (12 cabezas de consulta, 4 de clave/valor), ventana deslizante de 512 tokens combinada con atención global cada 6 capas, y una cabeza de predicción multi-token (MTP) que se utiliza tanto como pérdida auxiliar durante el entrenamiento como para decodificación especulativa en inferencia. El modelo está diseñado para ejecutarse en entornos con recursos limitados, incluyendo navegadores mediante WebGPU y dispositivos móviles a través de ONNX.

El modelo se entrenó con un corpus coreano de aproximadamente 74,86 millones de tokens tras filtrado, durante unas 4 épocas (unos 295 millones de tokens acumulados). La validación muestra una perplejidad de 21,6, pero con una brecha notable entre entrenamiento y validación, lo que indica sobreajuste. No se han publicado resultados de benchmarks estándar, y el autor advierte explícitamente que el modelo no garantiza factualidad ni seguridad. Su relevancia radica en ser un ejemplo de arquitectura compacta con MTP y decodificación especulativa autocontenida, además de ofrecer versiones ONNX listas para inferencia en edge.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con GQA, sliding window + atención global periódica, cabeza MTP |
| Parametros totales | 178.611.456 (153,4 M excluyendo embeddings de 25,2 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (ventana deslizante de 512, atención global cada 6 capas) |
| Tipos de cuantizacion | No disponible (pesos en fp32; no se mencionan cuantizaciones) |
| Idiomas soportados | Coreano (ko) |
| Licencia | No disponible |
| Formato de pesos | safetensors (fp32, 714 MB) y ONNX (trunk + MTP head) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer puro, implementado como un `nn.Module` de PyTorch que no hereda de `PreTrainedModel`, por lo que no se puede cargar con `AutoModel.from_pretrained`. La arquitectura usa atención GQA con 12 cabezas de consulta y 4 de clave/valor, con dimensión de cabeza de 64. La atención combina una ventana deslizante de 512 tokens con atención global que se aplica cada 6 capas, usando RoPE con theta de 10.000 para las capas locales y 1.000.000 para las globales. La cabeza MTP predice 16 tokens futuros y se entrena con una pérdida auxiliar de peso 0,2; en inferencia se reutiliza como generador de borradores para decodificación especulativa.

El entrenamiento se realizó sobre un corpus coreano de 76,86 millones de tokens brutos, reducido a 74,86 millones tras filtrado. Se usó un tamaño de lote efectivo de 65.536 tokens por paso (8 × grad_accum 4 × 2.048) y se entrenó durante aproximadamente 4.570 pasos (4 épocas), seleccionando el mejor checkpoint en el paso 4.500. El throughput fue de 22,9k tokens por segundo con un pico de memoria de 70,5 GiB. La pérdida final en entrenamiento fue de 1,9419 (perplejidad 6,97) y en validación de 3,0717 (perplejidad 21,6), lo que evidencia un sobreajuste considerable. El tokenizador es SentencePiece con un vocabulario de 32.768 tokens (pad=0, bos=1, eos=2).

## Capacidades

- Generación de texto en coreano: modelo causal de lenguaje capaz de producir texto coherente en coreano, aunque con limitaciones por su tamaño y datos de entrenamiento.
- Decodificación especulativa autocontenida: la cabeza MTP se reutiliza en inferencia como generador de borradores, permitiendo acelerar la generación sin necesidad de un modelo externo.
- Inferencia en edge: se proporcionan grafos ONNX para prefill y decodificación, validados contra PyTorch con errores máximos de logits del orden de 1e-5, aptos para WebGPU, NNAPI y CoreML.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo coreano.
- Modo thinking o visión: no disponible.

## Casos de uso

- Generación de texto coreano en dispositivos móviles: gracias a los grafos ONNX y al tamaño compacto, el modelo puede ejecutarse en smartphones mediante NNAPI o CoreML para aplicaciones de autocompletado o asistencia de escritura en coreano.
- Prototipado de decodificación especulativa: la implementación con MTP head permite experimentar con self-speculative decoding en un modelo pequeño, útil para investigar técnicas de aceleración de inferencia.
- Educación e investigación en arquitecturas eficientes: al ser un modelo pequeño y abierto (aunque sin licencia explícita), sirve como banco de pruebas para estudiar atención con ventana deslizante, GQA y MTP en un contexto de bajos recursos.
- Inferencia en navegador: el ONNX exportado es compatible con WebGPU, lo que permite ejecutar el modelo directamente en el navegador para demos o aplicaciones web de generación de texto coreano.
- Evaluación de sobreajuste en modelos pequeños: el caso de sLLM es un ejemplo didáctico de cómo la escasez de datos (74,86M tokens para 178M parámetros) afecta la generalización, útil para cursos de ML.
- Generación de texto con restricciones de contexto corto: con una ventana de 2.048 tokens, es adecuado para tareas de completado de frases o párrafos breves, no para documentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se realizó evaluación comparativa estándar. Los únicos datos de rendimiento son las pérdidas de entrenamiento y validación: pérdida principal de 1,9419 (train) y 3,0717 (val), con perplejidad de validación de 21,6.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 714 MB, por lo que caben en cualquier GPU con al menos 1 GB de VRAM. En cuantización fp16 o int8 (no proporcionada) el requisito sería menor.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.) es suficiente. Para entrenamiento se usó un pico de memoria de 70,5 GiB, lo que sugiere una GPU de clase A100 o varias GPUs.
- Cabe en consumer GPU: sí, para inferencia. Para entrenamiento se necesitaría hardware de gama alta o múltiples GPUs.
- Opciones de despliegue: al ser un `nn.Module` personalizado, no es compatible directamente con vLLM, llama.cpp u Ollama. Se puede usar con PyTorch, ONNX Runtime, o mediante los grafos ONNX para WebGPU/móvil.
- Latencia y throughput: no se proporcionan datos de latencia. El throughput de entrenamiento fue de 22,9k tokens/s, pero no hay mediciones de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos pequeños coreanos (por ejemplo, Polyglot-Ko o KoGPT-2) en términos de rendimiento, ya que sLLM no tiene benchmarks publicados. La comparación se limita a características arquitectónicas:

| Modelo | Parámetros | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|
| sLLM (PostAlign) | 178,6 M | 2.048 | No disponible | No publicados |
| KoGPT-2 (Kakao) | 125 M | 1.024 | Apache 2.0 | No comparables |
| Polyglot-Ko (EleutherAI) | 1.3 B / 5.8 B | 2.048 | Apache 2.0 | No comparables |

La comparativa es orientativa; no se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sobreajuste severo: la brecha entre pérdida de entrenamiento (1,94) y validación (3,07) indica que el modelo memoriza el corpus de entrenamiento y generaliza mal. No es recomendable para producción sin un reentrenamiento con más datos.
- Datos insuficientes: 74,86M tokens para 178M parámetros está muy por debajo de la regla empírica de ~20 tokens por parámetro (unos 3,6B necesarios). El rendimiento está limitado por la cantidad de datos.
- Sin garantías de factualidad ni seguridad: el autor advierte que el modelo no ha sido evaluado en cuanto a veracidad o sesgos, y no debe usarse en aplicaciones sensibles.
- Contexto limitado: la longitud máxima de generación está fijada en 2.048 tokens, y la ventana deslizante de 512 puede afectar la coherencia en secuencias largas.
- Limitaciones del ONNX: el grafo ONNX copia el KV cache completo en cada paso, lo que lo hace ineficiente para contextos largos. Además, los logits se generan para todas las posiciones, produciendo una salida de 268 MB en fp32 para un contexto de 2.048 tokens.
- Licencia no especificada: no se indica ninguna licencia, lo que impide su uso comercial sin consultar al autor.
- Solo coreano: no soporta otros idiomas.

## Enlaces

- HuggingFace: https://huggingface.co/PostAlign/sLLM
- Paper relacionado de PostAlign (no es el modelo, sino un trabajo sobre MLLMs): https://arxiv.org/html/2506.17901
- Página del paper en ML Anthology: https://mlanthology.org/iclr/2026/wu2026iclr-postalign/
- Resumen en AI Models: https://www.aimodels.fyi/papers/arxiv/postalign-multimodal-grounding-as-corrective-lens-mllms
