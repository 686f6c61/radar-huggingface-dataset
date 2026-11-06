# open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-ar30k

## Resumen

El modelo `open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-ar30k` es un ajuste fino (SFT) de un modelo base de aproximadamente 1.700 millones de parametros desarrollado por la organizacion open-sci. El nombre del checkpoint indica que parte de un modelo preentrenado denominado "MixtureVitae" con 300.000 millones de tokens de entrenamiento, un contexto de 16.000 tokens y un dataset de mezcla con proporcion ar30k (probablemente relacion de datos arabes o de un subconjunto especifico, aunque el autor no lo documenta). El resultado del entrenamiento supervisado se ha realizado sobre el dataset `AceReason-1.1-SFT-30k-sharegpt-hf`, un conjunto de 30.000 ejemplos en formato ShareGPT orientado a razonamiento.

La relevancia de esta ficha es limitada pero informativa: se trata de un modelo pequeno (1,7B), con licencia restrictiva ("other") y una model card generada automaticamente que no documenta capacidades, idiomas ni evaluacion. El pipeline declarado en Hugging Face es `feature-extraction`, aunque el entrenamiento es de tipo SFT generativo. Los datos disponibles son escasos y el autor no ha publicado resultados de benchmarks.

Esta ficha recoge exclusivamente la informacion verificable del repositorio y de la model card, marcando explicitamente como "no disponible" todo aquello que el autor no ha especificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de "MixtureVitae"; detalles no disponibles) |
| Parametros totales | 1.714.377.728 (1,7B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 16.000 tokens (segun el nombre del checkpoint) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | other (restrictiva; condiciones no detalladas en la model card) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,4 GB |
| Pipeline declarado | feature-extraction |
| Framework de entrenamiento | LLaMA-Factory (full fine-tuning) |
| Fecha de publicacion | 2026-10-30 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1,7B de parametros, presumiblemente basado en la familia "MixtureVitae" (el nombre sugiere una mezcla de datos o posiblemente una arquitectura con componentes tipo mixture, aunque el autor no lo especifica). El checkpoint se ha obtenido mediante ajuste fino completo (full fine-tuning) del modelo base, no mediante LoRA ni adaptadores, usando LLaMA-Factory con Transformers 4.57.3 y PyTorch 2.10.0.

Los hiperparametros declarados en la model card son: learning rate 4e-05, batch efectivo de 128 (batch 1 x 4 pasos de acumulacion x 32 dispositivos), 5 epocas, scheduler cosine con warmup del 10%, optimizador AdamW fused y semilla 42. El dataset de entrenamiento es `AceReason-1.1-SFT-30k-sharegpt-hf`, con 30.000 ejemplos en formato ShareGPT orientados a razonamiento. No se documenta el numero total de tokens de entrenamiento SFT, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto autoregresiva (el pipeline declarado es feature-extraction, pero el entrenamiento es SFT generativo).
- Razonamiento guiado por SFT: el dataset `AceReason-1.1-SFT-30k-sharegpt-hf` esta orientado a tareas de razonamiento, aunque no se especifican dominios concretos.
- Conversacion multi-turno en formato ShareGPT (el dataset de entrenamiento usa este formato).
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Capacidad de extraccion de caracteristicas (feature-extraction): declarada en el pipeline, aunque no se especifica la capa de salida utilizada.

## Casos de uso

- Prototipado de asistentes conversacionales de bajo coste: con 1,7B de parametros y contexto de 16k tokens, el modelo puede gestionar dialogos multi-turno en entornos con recursos limitados, aunque la falta de evaluacion publica obliga a validar la calidad antes de producción.
- Experimentacion academica con SFT: el checkpoint es util como referencia para reproducir pipelines de LLaMA-Factory con datasets ShareGPT y comparar hiperparametros en modelos pequenos.
- Generacion de texto en tareas de razonamiento acotadas: dado el dataset de entrenamiento orientado a razonamiento, puede emplearse en tareas de cadena de pensamiento simple, siempre con validacion manual.
- Extraccion de representaciones (feature-extraction): el pipeline declarado permite usar el modelo para obtener embeddings de texto en tareas de clasificacion o similitud, aunque no se documenta la calidad de estas representaciones.
- Fine-tuning posterior como base: al ser un modelo pequeno y con pesos safetensors, puede servir como punto de partida para ajustes especificos en dominios verticales.
- Despliegue en entornos con GPU de gama media: 1,7B de parametros permite inferencia en GPUs consumer con cuantizacion (aunque no se publican GGUF oficiales, es posible generarlos con llama.cpp a partir de safetensors).
- Educacion y divulgacion: util para explicar el ciclo completo de SFT sobre un modelo base con hiperparametros documentados.

## Benchmarks y rendimiento

La model card declara un unico `model-index` con el nombre del checkpoint y una lista de resultados vacia (`"results": []`). No se han publicado resultados de benchmarks en la informacion disponible.

| Benchmark | Resultado | Modelo comparado |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| Otros | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV (con contexto de 16k, el cache KV puede anadir varios GB segun la implementacion).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,7-2 GB para pesos.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 1-1,2 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y similares, especialmente con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo), vLLM (si la arquitectura es compatible), llama.cpp/Ollama (requiere conversion a GGUF, no publicada oficialmente), TGI (si se valida compatibilidad).
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-ar30k | 1,7B | 16k | other (restrictiva) | Hugging Face | No |
| TinyLlama-1.1B | 1,1B | 2k-4k | Apache 2.0 | Hugging Face | Si |
| Qwen2.5-1.5B | 1,5B | 32k | Apache 2.0 | Hugging Face | Si |
| SmolLM2-1.7B | 1,7B | 8k | Apache 2.0 | Hugging Face | Si |

Esta comparativa es orientativa: los modelos alternativos son referencias conocidas de tamano similar, pero no se dispone de evaluacion directa frente a este checkpoint. La licencia "other" del modelo de open-sci limita su comparabilidad en terminos de uso comercial.

## Limitaciones y advertencias

- Model card generada automaticamente: no documenta usos previstos, limitaciones ni datos de evaluacion; el autor indica "More information needed" en todas las secciones.
- Sin benchmarks publicados: no es posible verificar la calidad del modelo frente a alternativas.
- Licencia "other" sin condiciones detalladas: riesgo legal para uso comercial; es necesario contactar con el autor o revisar el repositorio para conocer los terminos exactos.
- Idiomas no declarados: no se puede garantizar soporte multilingue ni calidad en castellano.
- Riesgo de alucinacion: inherente a modelos generativos de este tamano, agravado por la falta de evaluacion.
- Sesgos desconocidos: el dataset de entrenamiento (`AceReason-1.1-SFT-30k-sharegpt-hf`) no esta documentado en cuanto a composicion, por lo que no se pueden evaluar sesgos.
- Contexto limitado a 16k tokens: insuficiente para tareas de contexto largo (documentos extensos, repositorios completos).
- Sin cuantizaciones oficiales: el despliegue eficiente requiere conversion manual a GGUF u otros formatos.
- Pipeline declarado como feature-extraction: puede inducir a confusion sobre el uso previsto; el modelo esta entrenado para generacion.
- Fecha de creacion futura (2026-10-30): inconsistencia en los metadatos que conviene verificar.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/1.7b-MixtureVitae-300BT-v1-decontaminated-16k-ar30k
- Repositorio del autor: https://huggingface.co/open-sci
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset de entrenamiento (referencia): `AceReason-1.1-SFT-30k-sharegpt-hf` (no se proporciona URL directa en la informacion disponible)
- Paper, blog o demo: no disponible
