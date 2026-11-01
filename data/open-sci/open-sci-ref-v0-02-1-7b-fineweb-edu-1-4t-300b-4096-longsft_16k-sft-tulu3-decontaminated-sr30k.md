# open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-sr30k

## Resumen

El modelo `open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-sr30k` es un ajuste fino (SFT) publicado por la organización `open-sci` sobre el checkpoint base `ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated`. Se trata de un modelo de 1.714.377.728 parámetros (aproximadamente 1,7 mil millones) en formato safetensors, entrenado con la librería `llama-factory` mediante ajuste completo (full fine-tuning) y generado a partir de `Trainer`, lo que lo sitúa en la categoría de modelos pequeños orientados a experimentación en investigación abierta.

El nombre del checkpoint indica que el modelo base fue preentrenado sobre FineWeb-Edu (1,4 billones de tokens) con una longitud de contexto de 4096 tokens, posteriormente sometido a un ajuste de contexto largo (`longsft_16k`) y a un SFT con el dataset Tulu3 decontaminado. Este último ajuste se realizó sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, un conjunto de 30.000 ejemplos de razonamiento generados sintéticamente, presumiblemente destilados desde un modelo de mayor tamaño.

La relevancia del modelo es fundamentalmente investigadora: forma parte de la iniciativa open-sci de reproducir y auditar pipelines de entrenamiento de modelos abiertos a pequeña escala. No obstante, la documentación publicada es mínima (la model card es autogenerada y contiene numerosos campos "More information needed"), no declara resultados de benchmarks y no especifica los idiomas soportados, lo que limita seriamente su uso en producción sin una evaluación adicional por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según nomenclatura del checkpoint y uso de `llama-factory`); detalles no disponibles |
| Parámetros totales | 1.714.377.728 (1,7 B) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 16.384 tokens (indicado en el nombre del checkpoint base: `longsft_16k`); contexto de preentrenamiento 4096 tokens |
| Tipos de cuantización | no disponible (el repo contiene safetensors en precisión completa; no se publican versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |
| Pipeline declarado | feature-extraction |
| Tamaño del repositorio | 3,4 GB |
| Framework de entrenamiento | LLaMA-Factory (full fine-tuning), Transformers 4.57.3, PyTorch 2.10.0+cu128 |
| Descargas | 14 |
| Likes | 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de lo que se deduce del nombre del checkpoint y de las herramientas empleadas. El uso de `llama-factory`, la nomenclatura `1.7b` y el formato safetensors son compatibles con un transformer decoder-only de la familia Llama, pero no se publican el número de capas, la dimensión oculta, el número de cabezas de atención ni el tokenizador utilizado. Tampoco se especifica si emplea atención con RoPE, GQA u otras variantes.

El pipeline de entrenamiento se infiere del nombre del modelo base: preentrenamiento sobre FineWeb-Edu con 1,4 billones de tokens y contexto de 4096, seguido de una fase de SFT de contexto largo (`longsft_16k`) y de un SFT con Tulu3 decontaminado. El ajuste fino que da lugar a este checkpoint se realizó sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf` durante 5 épocas, con learning rate 4e-05, scheduler coseno con warmup del 10 %, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), batch total de 128 (batch 1 × 4 pasos de acumulación × 32 dispositivos) y semilla 42. No se documenta el número exacto de tokens de entrenamiento del SFT, la composición del dataset más allá de su nombre, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva: el modelo es un LM causal, aunque el pipeline declarado en HuggingFace sea `feature-extraction`.
- Razonamiento: el SFT se realizó sobre un dataset de razonamiento (`Superior-Reasoning-SFT`), por lo que se espera cierta capacidad de razonamiento paso a paso, aunque no se publican evaluaciones que lo confirmen.
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que puede emplearse para obtener representaciones ocultas.
- Contexto largo: hasta 16.384 tokens según el nombre del checkpoint base.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documentan.

## Casos de uso

- Investigación en reproducibilidad de pipelines de SFT: el modelo sirve como referencia para estudiar el efecto de un SFT de razonamiento sobre un base preentrenado en FineWeb-Edu, dado que el nombre del checkpoint documenta explícitamente cada etapa del pipeline.
- Experimentación académica con modelos de 1,7 B: su tamaño permite entrenar y evaluar en clústeres modestos (32 GPUs en el entrenamiento original), lo que lo hace adecuado para estudios controlados de hiperparámetros.
- Extracción de embeddings para tareas de clasificación o clustering: al declararse como `feature-extraction`, puede usarse para obtener representaciones de texto en pipelines de NLP clásico, aunque requeriría validación empírica.
- Generación de texto con contexto medio-largo: con 16k tokens de ventana, puede emplearse en tareas de resumen o QA sobre documentos de hasta decenas de páginas, siempre que se valide su calidad.
- Destilación y ajuste posterior: al ser un modelo pequeño con licencia abierta (aunque "other"), puede servir como base para nuevos ajustes finos en dominios específicos.
- Evaluación comparativa de datasets de razonamiento sintético: permite medir el impacto del dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf` frente a otros conjuntos de SFT.
- Prototipado de asistentes conversacionales de bajo coste: su tamaño reducido permite desplegarlo en GPUs de consumo, aunque la falta de evaluación limita su uso en producción sin una validación previa.

## Benchmarks y rendimiento

La model card declara un `model-index` con la entrada `sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__open-sci-re-a1c1aa00__sdpa-open-sci-steps`, pero la lista de resultados está vacía (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para los pesos (1,7 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,7 GB para pesos; en 4 bits, alrededor de 0,9 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 en contextos cortos; A100, H100 o RTX 4090 para entrenamiento o inferencia con contexto completo de 16k.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, siempre que se gestione la KV cache para contextos largos.
- Opciones de despliegue: `transformers` de forma nativa; `vLLM` y `TGI` son compatibles en principio con arquitecturas Llama, pero no se ha publicado confirmación para este checkpoint. `llama.cpp` y `Ollama` requerirían convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-...-sr30k (este modelo) | 1,7 B | 16k | other | HuggingFace (14 descargas) | No |
| ali-elganzory/open-sci-ref-v0.02-1.7b-...-Tulu3-decontaminated (base) | 1,7 B | 16k | no disponible | HuggingFace | No |
| Qwen2.5-1.5B | 1,5 B | 32k | Apache 2.0 | HuggingFace, Ollama, vLLM | Sí (MMLU, GSM8K, etc.) |
| SmolLM2-1.7B | 1,7 B | 8k | Apache 2.0 | HuggingFace, GGUF | Sí |

La comparación con Qwen2.5-1.5B y SmolLM2-1.7B es pertinente por tamaño, pero ambos disponen de documentación completa, benchmarks publicados y licencias permisivas, a diferencia de este checkpoint. No se dispone de datos de rendimiento del modelo open-sci que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es autogenerada y contiene múltiples campos "More information needed"; no se documentan arquitectura, tokenizador, datos de entrenamiento ni evaluación.
- Sin benchmarks: no se han publicado resultados que permitan estimar la calidad del modelo en ninguna tarea.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas distintos del inglés, lo que impide recomendarlo para aplicaciones multilingües.
- Licencia "other": no se especifican los términos exactos; es imprescindible revisar el archivo de licencia del repositorio antes de cualquier uso comercial.
- Riesgo de alucinación: al ser un modelo de 1,7 B ajustado con datos sintéticos de razonamiento, es probable que presente alucinaciones y errores factuales; no se ha evaluado su tasa de error.
- Sesgos: no se documenta ninguna evaluación de sesgos; los datos de preentrenamiento (FineWeb-Edu) y de SFT (dataset sintético) pueden introducir sesgos no caracterizados.
- Contexto: aunque el nombre indica 16k, no se confirma que el modelo mantenga calidad en contextos largos; el preentrenamiento fue a 4096 tokens.
- Uso en producción: no recomendado sin una evaluación exhaustiva previa por parte del equipo que lo adopte, dada la ausencia de documentación y de métricas.
- Pipeline declarado como `feature-extraction`: conviene verificar que la generación de texto funcione correctamente con `transformers` y que el tokenizador esté disponible en el repo.

## Enlaces

- HuggingFace: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-fineweb-edu-1.4t-300B-4096-longsft_16k-SFT-Tulu3-decontaminated
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- FineWeb-Edu (dataset de preentrenamiento): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tulu3 (dataset de SFT): https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo en la búsqueda proporcionada (los resultados corresponden a OpenAI, Apache OpenOffice, Open y Open Library, sin relación con el modelo).
