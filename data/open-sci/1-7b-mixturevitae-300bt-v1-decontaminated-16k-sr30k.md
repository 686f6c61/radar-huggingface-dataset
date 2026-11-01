# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-sr30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-sr30k` es un ajuste fino (SFT) de tipo *full fine-tuning* sobre el modelo base `ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k`, publicado por el usuario open-sci. Con 1.714.377.728 parámetros (aproximadamente 1,7 mil millones), se enmarca en la categoría de modelos pequeños, adecuados para despliegue en hardware modesto y para tareas de extracción de características (*feature extraction*), que es el pipeline declarado en Hugging Face. El entrenamiento se realizó con LLaMA-Factory sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, un conjunto de datos de razonamiento generado a partir de gpt-oss-120b.

El interés de este modelo reside en su carácter experimental: es un *checkpoint* derivado de una familia de modelos entrenados sobre MixtureVitae (un corpus de 300 mil millones de tokens, según el nombre del modelo base) y posteriormente ajustado con datos de razonamiento sintético. La model card es automática y no aporta información sobre arquitectura interna, datos de entrenamiento detallados ni evaluaciones. El modelo tiene muy poca tracción (16 descargas, 0 likes) y fue creado el 30 de octubre de 2026, lo que sugiere que se trata de un artefacto de investigación más que de un modelo listo para producción.

La relevancia actual es limitada pero informativa: permite estudiar cómo se comporta un modelo de 1,7B entrenado con un corpus masivo y ajustado con datos de razonamiento de un modelo mayor (gpt-oss-120b), y sirve como referencia para experimentos de destilación y SFT en la comunidad open source. No obstante, la ausencia de benchmarks, de documentación y de una licencia clara condiciona seriamente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only, segun el ecosistema LLaMA-Factory; no confirmado) |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no aplica (no es MoE, segun los datos disponibles) |
| Longitud de contexto | no disponible (el nombre del modelo base incluye "16k", lo que sugiere 16.384 tokens, pero no esta confirmado) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision completa; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | safetensors |
| Tamano del repo | 3,4 GB |
| Pipeline declarado | feature-extraction |
| Framework | transformers 4.57.3, PyTorch 2.10.0+cu128 |
| Modelo base | ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k |
| Dataset de ajuste | Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. El nombre del modelo base (`1.7b-MixtureVitae-300BT-v1-decontaminated-16k`) sugiere un transformer decoder-only de 1,7B parametros entrenado sobre un corpus llamado MixtureVitae de 300 mil millones de tokens, con una ventana de contexto de 16k tokens y un proceso de decontaminacion del dataset. Sin embargo, la model card no confirma estos extremos ni describe la composicion del corpus, el tokenizador o si se aplicaron tecnicas como RLHF o DPO.

El ajuste fino se realizo con LLaMA-Factory en modo *full* (todos los parametros actualizados), sobre el dataset `Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf`, que por su nombre parece contener 30.000 ejemplos de razonamiento en formato ShareGPT generados por gpt-oss-120b. Los hiperparametros documentados son: learning rate 4e-5, batch total 128 (32 dispositivos x batch 1 x acumulacion 4), 5 epocas, optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con warmup del 10 % y semilla 42. No se documentan resultados de evaluacion ni curvas de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva (inferida del pipeline de transformers y del ajuste SFT; no verificada en la model card).
- Razonamiento de tipo *chain-of-thought*: el ajuste se realizo sobre un dataset de razonamiento, por lo que se espera cierta capacidad para producir pasos intermedios, aunque no hay evaluacion que lo respalde.
- Extraccion de caracteristicas (*feature extraction*): es el pipeline declarado oficialmente en Hugging Face.
- Soporte de tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Extraccion de embeddings para busqueda semantica: el pipeline declarado es *feature-extraction*, por lo que el modelo puede emplearse para generar representaciones vectoriales de texto en sistemas de recuperacion (RAG) o clustering, siempre que se valide su calidad frente a modelos dedicados como sentence-transformers.
- Experimentacion academica con destilacion de razonamiento: al estar ajustado sobre datos generados por gpt-oss-120b, sirve como caso de estudio para analizar como un modelo de 1,7B absorbe trazas de razonamiento de un modelo mucho mayor.
- Prototipado rapido en entornos con GPU consumer: con 3,4 GB en safetensors, cabe en GPUs de 8 GB o menos en fp16, lo que permite iterar en local sin infraestructura dedicada.
- Generacion de texto en dominios acotados tras validacion: puede usarse como base para nuevos ajustes especificos (por ejemplo, clasificacion o resumen) una vez verificado su comportamiento en el dominio objetivo.
- Reproduccion de experimentos de SFT con LLaMA-Factory: los hiperparametros documentados permiten replicar el entrenamiento y estudiar el efecto del dataset de razonamiento en modelos pequenos.
- Evaluacion comparativa de tecnicas de decontaminacion: al derivar de un modelo base "decontaminated", puede emplearse para medir el impacto de la decontaminacion en tareas de benchmark, aunque requiere un protocolo de evaluacion propio.

## Benchmarks y rendimiento

El *model-index* de la model card declara una entrada (`sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__1-7b-Mixtur-a00116f6__sdpa-op-07d132d6`) con una lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: alrededor de 1,8-2,5 GB (estimacion teorica; no se publican pesos cuantizados).
- VRAM estimada en cuantizacion 4 bits: alrededor de 1-1,5 GB (estimacion teorica; requiere convertir los pesos a GGUF, no disponible en el repo).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) para fp16; A100 o H100 no son necesarias para inferencia, solo para reentrenamiento.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en fp16, y en GPUs de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI (compatibles con safetensors de Llama-like, sujeto a validacion), llama.cpp/Ollama solo tras conversion a GGUF (no publicada).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-sr30k | 1,71B | no disponible (16k segun nombre) | other | safetensors | SFT sobre dataset de razonamiento; sin benchmarks |
| ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k (modelo base) | ~1,7B | 16k (segun nombre) | no disponible | safetensors | Modelo base sin ajuste SFT |
| Qwen2.5-1.5B | 1,54B | 32.768 | Apache 2.0 | safetensors, GGUF | Benchmark publico amplio; licencia permisiva |
| Llama-3.2-1B | 1,24B | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Ecosistema maduro; benchmarks publicos |

La comparacion con Qwen2.5-1.5B y Llama-3.2-1B es orientativa: ambos son modelos de tamano similar con documentacion y evaluaciones publicas, mientras que el modelo de open-sci carece de ambas. No se dispone de datos para comparar rendimiento real.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni otras tareas; cualquier afirmacion de rendimiento seria especulativa.
- Model card automatica y sin completar: secciones como "Model description", "Intended uses" y "Training and evaluation data" indican "More information needed".
- Licencia "other" sin terminos explicitos: no se especifica si se permite uso comercial, modificacion o redistribucion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Riesgo de alucinacion: al ser un modelo pequeno ajustado con datos sinteticos de razonamiento, es probable que genere cadenas de razonamiento plausibles pero incorrectas; no hay evaluacion que lo descarte.
- Sesgos desconocidos: no se documenta la composicion del corpus MixtureVitae ni del dataset de SFT, por lo que no se pueden evaluar sesgos de genero, raza, idioma o dominio.
- Idiomas no especificados: se desconoce si el modelo es multilingue o solo ingles; el nombre del dataset sugiere predominancia de ingles.
- Contexto no confirmado: el "16k" del nombre del modelo base es la unica pista; no hay verificacion en la model card.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ en el repo, lo que limita el despliegue en hardware muy modesto sin trabajo adicional de conversion.
- Traccion minima: 16 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad.
- Fecha de creacion futura (2026-10-30): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/1.7b-MixtureVitae-300BT-v1-decontaminated-16k
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
