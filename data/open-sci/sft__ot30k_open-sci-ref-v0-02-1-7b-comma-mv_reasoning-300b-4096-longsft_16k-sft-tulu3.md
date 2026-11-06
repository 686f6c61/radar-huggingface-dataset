# open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-comma-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3

## Resumen

El modelo `open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-comma-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3` es un ajuste fino supervisado (SFT) de un modelo base de la familia OpenSci, desarrollado por la organización `open-sci`. Con 1.714.377.728 parámetros (aproximadamente 1,7 mil millones), se enmarca en la categoría de modelos pequeños optimizados para extracción de características y tareas de razonamiento derivadas de datos sintéticos de cadena de pensamiento. El identificador del modelo revela su procedencia: un dataset de 30.000 muestras de Open Thoughts (`ot30k`), una referencia de razonamiento de 300B tokens (`mv_reasoning-300B`), una longitud de contexto de entrenamiento de 4.096 tokens y una fase final de SFT largo con 16.000 tokens sobre el dataset Tulu3.

El modelo se entrenó con Llama Factory mediante ajuste completo (no LoRA) en 32 dispositivos, con un tamaño de lote efectivo de 128 y 5 épocas sobre un subconjunto de Open Thoughts 3-1.2M. Su relevancia actual radica en que ejemplifica el patrón de modelos pequeños especializados en razonamiento que la comunidad open source está produciendo a partir de destilación de trazas de modelos mayores, y que resultan atractivos para despliegues con recursos limitados.

No obstante, la información pública disponible es muy escasa: la model card está generada automáticamente por el Trainer y no incluye descripción, usos previstos ni resultados de evaluación. La licencia figura como "other" sin texto adicional, y no se declaran idiomas soportados. Cualquier evaluación rigurosa de sus capacidades requerirá pruebas empíricas por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OpenSci, base no especificada en la model card) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento; 16.000 tokens en fase SFT larga (según identificador); contexto nativo del base: no disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers/GGUF vía conversión) |
| Idiomas soportados | No disponible |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning, no LoRA) de un checkpoint base de OpenSci de 1,7B parámetros, con arquitectura transformer decoder-only estándar. El entrenamiento se realizó con Llama Factory sobre el dataset Open Thoughts (`open-thoughts_open_thoughts3-1.2_m_30000_samples`), un corpus de 30.000 muestras orientado a razonamiento, con una fase de SFT largo sobre Tulu3 a 16.000 tokens de contexto. Los hiperparámetros documentados incluyen learning rate de 4e-5 con scheduler coseno, warmup del 10%, AdamW fused con betas (0.9, 0.999), lote efectivo de 128 (batch 1 × 4 pasos de acumulación × 32 GPUs) y 5 épocas completas. El seed fue 42 y el entrenamiento se distribuyó en tipo multi-GPU.

La innovación técnica principal es la combinación de datos de razonamiento sintético (probablemente trazas de cadena de pensamiento generadas por modelos mayores, dado el nombre `mv_reasoning-300B`) con una fase de extensión de contexto vía SFT largo sobre Tulu3. No se documentan mecanismos adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas SSM. Las versiones de framework son Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2.

## Capacidades

- Generación de texto autoregresiva y extracción de características (pipeline declarado: `feature-extraction`).
- Razonamiento multi-paso derivado del entrenamiento sobre trazas de Open Thoughts y del dataset de razonamiento de 300B tokens referenciado en el nombre.
- Ajuste específico para contexto largo mediante la fase SFT de 16.000 tokens sobre Tulu3.
- Capacidad de seguir instrucciones (SFT supervisado), aunque sin evidencia publicada de RLHF o DPO.
- Soporte de tool calling / function calling: no documentado; probable herencia parcial del dataset Tulu3, pero sin verificación.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente.
- Capacidades multilingües: no disponibles; el dataset Tulu3 es mayoritariamente inglés, por lo que se espera un rendimiento predominante en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- **Prototipado de razonamiento en hardware de consumo**: con 1,7B parámetros, el modelo cabe en GPUs de 8-12 GB en cuantización de 4 bits, lo que permite experimentar con trazas de razonamiento en estaciones de trabajo sin clúster.
- **Extracción de características para clasificación y clustering**: el pipeline declarado es `feature-extraction`, por lo que puede usarse como encoder de representaciones para tareas downstream (detección de temas, similitud semántica) en dominios donde el razonamiento previo aporte señal.
- **Generación de cadenas de pensamiento para destilación**: útil como generador de trazas sintéticas de razonamiento en inglés para entrenar modelos aún más pequeños o para aumentar datasets de instrucciones.
- **Investigación en SFT largo y contexto extendido**: la combinación de SFT a 4.096 y 16.000 tokens lo convierte en un sujeto de estudio para analizar cómo la fase larga afecta a la degradación de capacidades cortas.
- **Evaluación comparativa de recetas de datos de razonamiento**: al proceder de Open Thoughts y Tulu3, sirve como baseline reproducible en estudios sobre mezclas de datos de razonamiento frente a instrucciones generales.
- **Asistente interno de bajo coste en inglés**: para tareas de resumen, reescritura y respuesta a preguntas sobre documentos de hasta ~16.000 tokens, desplegado con vLLM o llama.cpp en una sola GPU.
- **Generación de código asistida en entornos con restricciones de memoria**: aunque no hay benchmarks que lo confirmen, el tamaño permite integrarlo en IDE plugins o pipelines de CI/CD con latencia baja en GPUs consumer.

## Benchmarks y rendimiento

La model card declara un `model-index` con nombre `sft__f679a5c592c8dffb__open-sci-re-beecc46b__sdpa-open-sci-steps` pero la lista de resultados está vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~3,4 GB en FP16/BF16 (pesos de 1,7B × 2 bytes) más overhead de activaciones y KV cache; ~1,8 GB en cuantización de 4 bits; ~0,9 GB en 2 bits (con pérdida de calidad significativa).
- **GPU recomendadas**: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 para inferencia en FP16 con contexto completo de 16K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para cuantización de 4-8 bits.
- **¿Cabe en GPU consumer?**: sí, en cualquier GPU con 8 GB o más en cuantización de 4 bits; en FP16 requiere ~6-8 GB incluyendo KV cache para contextos moderados.
- **Opciones de despliegue**: transformers (nativo, con `trust_remote_code=True` por el tag `custom_code`), vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), TGI. La conversión a GGUF no está publicada oficialmente.
- **Latencia y throughput estimados**: no disponibles; no hay mediciones publicadas. En una RTX 4090 en FP16 se puede esperar un throughput del orden de miles de tokens por segundo en batch, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| open-sci/sft__ot30k...-1.7b (este) | 1,71B | 4K-16K (según fase) | other | Hugging Face, 25 descargas | SFT sobre Open Thoughts + Tulu3; sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Base sólida, benchmarks publicados, tool calling |
| Llama-3.2-1B-Instruct | 1,24B | 131.072 | Llama 3.2 Community License | Hugging Face, muy extendido | Contexto muy largo, ecosistema maduro |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache 2.0 | Hugging Face | Entrenado en inglés, benchmarks publicados |

La comparación directa es difícil porque este modelo no publica resultados. Frente a Qwen2.5-1.5B, Llama-3.2-1B y SmolLM2-1.7B, sus principales desventajas son la licencia "other" sin texto, la ausencia de benchmarks y la falta de documentación de idiomas y tool calling. Su ventaja potencial es el entrenamiento específico en trazas de razonamiento, pero sin evaluación empírica no puede confirmarse.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: no hay benchmarks, ni resultados de validación, ni métricas de pérdida reportadas; el campo "Training results" de la model card está vacío.
- **Licencia "other" sin texto**: no se especifican términos de uso comercial, redistribución ni atribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- **Idiomas no declarados**: el dataset Tulu3 es predominantemente inglés, por lo que el rendimiento en castellano u otros idiomas es incierto y probablemente deficiente.
- **Riesgo de alucinación**: inherente a modelos de 1,7B sin RLHF verificado; el ajuste sobre trazas sintéticas puede amplificar razonamientos plausibles pero incorrectos.
- **Sesgos**: no documentados; los datasets de razonamiento sintético pueden heredar sesgos de los modelos generadores.
- **Contexto efectivo incierto**: aunque el identificador menciona 16K, no se especifica la longitud de contexto nativa del modelo base ni si se aplicó RoPE scaling; contextos superiores a 4K pueden degradarse.
- **Tag `custom_code`**: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; revisar antes de usar en entornos sensibles.
- **Madurez**: 25 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento activo.
- **Pipeline declarado como `feature-extraction`**: no está claro que el modelo esté optimizado para generación conversacional, pese a haber sido entrenado con SFT.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/sft__ot30k_open-sci-ref-v0.02-1.7b-comma-mv_reasoning-300B-4096-longsft_16k-SFT-Tulu3
- Open Thoughts (dataset): https://huggingface.co/datasets/open-thoughts/OpenThoughts-1.2M
- Tulu3 (dataset): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Llama Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Organización open-sci en Hugging Face: https://huggingface.co/open-sci
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
