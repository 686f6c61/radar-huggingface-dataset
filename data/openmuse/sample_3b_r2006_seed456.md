# openmuse/sample_3B_r2006_seed456

## Resumen

`openmuse/sample_3B_r2006_seed456` es un ajuste fino completo (full fine-tuning) del modelo `meta-llama/Llama-3.2-3B` de Meta, publicado por el usuario openmuse en Hugging Face. Se trata de un modelo de generación de texto de 3.606.752.256 parámetros (3,6 mil millones), entrenado con la herramienta LLaMA-Factory sobre un dataset denominado `sample_r2006`, del que no se aporta información sobre su composición ni procedencia.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 3B, con una ventana de contexto nativa de 128.000 tokens en el modelo base. El ajuste fino se realizó con un régimen de entrenamiento relativamente corto: 250 pasos, un total de 1.044.942.252 tokens de entrada vistos y una pérdida de validación final de 1.0458. El entrenamiento se distribuyó en 4 GPUs con un tamaño de lote efectivo de 512 y una tasa de aprendizaje de 2e-05 con scheduler lineal.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: la model card es la generada automáticamente por el Trainer de Hugging Face, no incluye descripción de usos previstos, no declara idiomas soportados, no publica benchmarks y la licencia figura como "other" sin especificar términos. Es, por tanto, un artefacto de investigación o experimento de ajuste fino más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino completo sobre meta-llama/Llama-3.2-3B |
| Parametros totales | 3.606.752.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.2 3B soporta 128.000 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Llama 3.2 3B, un transformer decoder-only denso con atención por grupos (GQA) y tokenizador BPE de Llama 3. El ajuste se realizó con LLaMA-Factory en modalidad `full` (no LoRA ni QLoRA), lo que implica que los 3,6 mil millones de parámetros fueron actualizados durante el entrenamiento. El repositorio ocupa 7,2 GB, coherente con pesos en precisión de 16 bits.

Los hiperparámetros declarados son: tasa de aprendizaje 2e-05, optimizador AdamW (`adamw_torch`, betas 0,9/0,999, epsilon 1e-08), scheduler lineal, tamaño de lote por dispositivo 1, acumulación de gradiente de 128 pasos, lote total de 512, semilla 456 y 250 pasos de entrenamiento distribuidos en 4 GPUs. La pérdida de entrenamiento descendió de 1,8452 (paso 50) a 1,8114 (paso 250), mientras que la pérdida de validación se mantuvo prácticamente plana en torno a 1,0426–1,0458, lo que sugiere que el ajuste no produjo mejoras sustanciales de generalización sobre el conjunto de evaluación. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). Las versiones de framework fueron Transformers 4.51.0, PyTorch 2.7.1+cu128, Datasets 3.5.0 y Tokenizers 0.21.1.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del modelo base Llama 3.2 3B, orientadas a diálogo multi-turno.
- Razonamiento y conocimiento general: las del modelo base, sin que el ajuste fino documente mejoras específicas.
- Generación de código y matemáticas: capacidades heredadas del modelo base, no evaluadas en esta ficha.
- Tool calling / function calling: no documentado en la model card; el modelo base Llama 3.2 3B soporta plantillas de tool use, pero no se confirma que el ajuste las preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo base es solo texto.

## Casos de uso

- Experimentación académica con ajuste fino completo: el modelo sirve como referencia reproducible de un pipeline LLaMA-Factory con semilla fija (456) y 250 pasos, útil para estudiar dinámicas de entrenamiento y sobreajuste en modelos de 3B.
- Evaluación de técnicas de ajuste fino: al ser un full fine-tuning sobre un dataset pequeño y con pérdida de validación plana, permite comparar contra variantes LoRA/QLoRA del mismo modelo base en condiciones controladas.
- Generación de texto conversacional en entornos de prueba: puede emplearse en prototipos de chatbots de dominio específico si el dataset `sample_r2006` corresponde al dominio objetivo, aunque la falta de documentación obliga a validar manualmente la calidad.
- Base para posteriores ajustes: al conservar la arquitectura y tokenizador de Llama 3.2 3B, puede recibir nuevos ajustes (DPO, RLHF o LoRA) sobre él sin cambiar el stack de inferencia.
- Investigación sobre degradación por sobreajuste: la divergencia entre pérdida de entrenamiento (descendente) y validación (estable) lo convierte en un caso de estudio útil para analizar cuándo un ajuste fino no aporta valor.
- Despliegue en pipelines de transformers: compatible con `text-generation-inference` y `endpoints_compatible` según los tags, lo que permite integrarlo en servicios de inferencia estándar de Hugging Face si se resuelve la ambigüedad de licencia.

## Benchmarks y rendimiento

El model-index del autor declara una lista de resultados vacía. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validacion final | 1,0458 |
| Loss de entrenamiento final (paso 250) | 1,8114 |
| Tokens de entrada vistos | 1.044.942.252 |
| Pasos de entrenamiento | 250 |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 7,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 4 GB para pesos; en 4 bits, en torno a 2,5 GB (requiere cuantizar manualmente, ya que no se publican variantes GGUF/AWQ/GPTQ).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio de producción con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para desarrollo.
- GPU de consumo: cabe en GPUs consumer con 8 GB o más en FP16 para contextos moderados, y en 4–6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles de Hugging Face; vLLM, llama.cpp u Ollama requerirían conversión previa de pesos, no publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| openmuse/sample_3B_r2006_seed456 | 3,6 B | No disponible (base: 128k) | other (sin especificar) | Hugging Face, 0 descargas | Ajuste fino experimental sin benchmarks |
| meta-llama/Llama-3.2-3B | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado | Modelo base; benchmarks publicados por Meta |
| Qwen2.5-3B | 3,1 B | 32.768 tokens (128k en variantes) | Apache 2.0 (segun variante) | Hugging Face | Alternativa densa de tamano similar con amplia documentacion |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms of Use | Hugging Face | Alternativa de Google con contexto mas corto |

La comparativa es aproximada: no se dispone de benchmarks del modelo ajustado para contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Licencia "other" sin términos especificados: no se puede confirmar si el uso comercial está permitido; además, al derivar de Llama 3.2 3B, está sujeto a la Llama 3.2 Community License de Meta, cuyos términos deben respetarse.
- Ausencia total de documentación sobre el dataset `sample_r2006`: se desconoce su composición, procedencia, posibles sesgos y si contiene datos personales o con derechos de autor.
- Riesgo elevado de alucinación: el modelo base ya presenta este riesgo y el ajuste fino no documenta mitigaciones (RLHF, DPO, filtros).
- Pérdida de validación plana (1,0426–1,0458) durante todo el entrenamiento: no hay evidencia de que el ajuste mejore las capacidades del modelo base; podría incluso degradarlas en dominios no representados en el dataset.
- Idiomas no declarados: no se puede garantizar el rendimiento multilingüe más allá de lo que ofrezca el modelo base.
- Contexto no verificado tras el ajuste: aunque el modelo base soporta 128k tokens, no se confirma que el ajuste fino preserve esa ventana.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Model card autogenerada sin revisar: secciones de "Intended uses", "Limitations" y "Training data" marcadas como "More information needed".
- No apto para producción sin evaluación previa exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openmuse/sample_3B_r2006_seed456
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- LLaMA-Factory (herramienta de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Documentación de Transformers 4.51.0: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
