# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-nc30k

## Resumen

open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-nc30k es un modelo de lenguaje de 1.714.377.728 parametros (aproximadamente 1,7 mil millones) publicado por la organizacion open-sci en Hugging Face. Se trata de un ajuste fino supervisado (SFT) completo, no de un entrenamiento desde cero pese a lo que indica la model card autogenerada, realizado con el framework LLaMA-Factory sobre un dataset denominado Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf. El nombre del repositorio sugiere una cadena de entrenamiento sobre una base Nemotron con datos tipo Tulu3 decontaminados y una ventana de contexto de 4096 tokens, ampliada a 16k en la fase de SFT.

El modelo se publica con la pipeline `feature-extraction` y la etiqueta `custom_code`, lo que implica que requiere codigo personalizado del repositorio para cargarse correctamente con Transformers. La licencia es `other`, sin aclaracion adicional en la informacion disponible, y no se declaran idiomas soportados. El repositorio ocupa 3,4 GB en formato safetensors.

Su relevancia es limitada y de caracter experimental: cuenta con cero descargas y cero likes en el momento de la consulta, no publica resultados de benchmarks y su model card es la plantilla autogenerada por el Trainer sin completar. Debe considerarse un artefacto de investigacion reproducible mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Nemotron, segun el nombre del repositorio); detalles no disponibles |
| Parametros totales | 1.714.377.728 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en la base y 16k en la fase SFT, segun el nombre del repositorio; no confirmado en la model card |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Libreria | transformers (con `custom_code`) |
| Pipeline declarada | feature-extraction |
| Tamano del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de lo que sugiere el nombre del repositorio: un modelo base de la familia Nemotron, de tipo transformer decoder-only, con 1.714.377.728 parametros. No se especifica numero de capas, dimension oculta, numero de cabezas de atencion ni tipo de atencion (completa, GQA o linear). La etiqueta `custom_code` indica que la implementacion requiere codigo especifico del repositorio, probablemente por variaciones en la arquitectura respecto al transformer estandar de Transformers.

El entrenamiento fue un ajuste fino supervisado completo (`full`, no LoRA) con LLaMA-Factory sobre el dataset Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf. Los hiperparametros declarados son: learning rate 4e-05, batch total de 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion de gradiente), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10 %, semilla 42 y 5 epocas. El entorno fue Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generacion de texto autoregresiva basica, derivada de su naturaleza de modelo de lenguaje.
- Extraccion de caracteristicas (pipeline declarada `feature-extraction`), aunque el modelo esta ajustado con SFT y no especificamente para embeddings.
- Ajuste instruccional mediante SFT sobre datos tipo ShareGPT, segun el nombre del dataset.
- Capacidad multilingue: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Capacidades de codigo y matematicas: no documentadas.

## Casos de uso

- Investigacion sobre recetas de SFT: el modelo sirve como referencia reproducible de un pipeline LLaMA-Factory con hiperparametros documentados (lr 4e-05, 5 epocas, scheduler coseno), util para comparar configuraciones de ajuste fino en modelos de ~1,7B.
- Experimentos de decontaminacion de datos: el sufijo `decontaminated` del nombre permite estudiar el efecto de filtrar solapamiento entre entrenamiento y evaluacion en tareas de instruccion.
- Prototipado de bajo coste en local: con 1,7B parametros cabe en GPUs de consumo en cuantizaciones de 8 o 4 bits (aunque el repositorio solo publica safetensors en precision completa), lo que facilita pruebas rapidas de generacion de texto.
- Base para ajustes posteriores: al ser un checkpoint SFT completo, puede servir como punto de partida para DPO, RLHF o fine-tuning con LoRA en dominios especificos.
- Evaluacion de modelos pequenos en castellano: si se confirma capacidad multilingue, podria emplearse en tareas de generacion acotada, aunque no hay evidencia publicada al respecto.
- Reproducibilidad de artefactos de investigacion: util para verificar resultados de estudios sobre cascadas de SFT (el nombre alude a Nemotron-Cascade) y su impacto en modelos de menos de 2B parametros.

## Benchmarks y rendimiento

El model-index del autor declara una entrada (`sft__Nemotron-Cascade-SFT-Stage-1-30k-sharegpt-hf__open-sci-re-77ccae92__sdpa-open-sci-steps`) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 5-6 GB para contexto corto.
- VRAM estimada en cuantizacion 8 bits: alrededor de 1,8-2 GB para pesos; en 4 bits, en torno a 1 GB, aunque no se publican pesos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); para entrenamiento o contexto largo, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en 4-6 GB con cuantizacion (previa conversion a GGUF, no incluida en el repositorio).
- Opciones de despliegue: Transformers con `trust_remote_code=True` (obligatorio por `custom_code`); vLLM, llama.cpp, Ollama y TGI no estan confirmados para esta arquitectura concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b (este modelo) | 1,71B | 16k (segun nombre) | other | Hugging Face, 0 descargas |
| Qwen2.5-1.5B | 1,54B | 32k | Apache 2.0 | Hugging Face, ampliamente usado |
| Llama 3.2-1B | 1,24B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| SmolLM2-1.7B | 1,71B | 8k | Apache 2.0 | Hugging Face, ampliamente usado |

La comparativa de rendimiento no esta disponible porque este modelo no publica benchmarks. Frente a las alternativas, la diferencia principal es la licencia `other` sin aclarar y la ausencia de validacion publica, lo que reduce su atractivo para produccion.

## Limitaciones y advertencias

- Model card incompleta: la propia plantilla indica "More information needed" en descripcion, usos previstos, datos de entrenamiento y evaluacion.
- Sin benchmarks publicados: no hay evidencia objetiva de calidad, razonamiento o codigo.
- Licencia `other` sin texto aclaratorio: no se puede confirmar si el uso comercial esta permitido; consultar con el autor antes de cualquier despliegue.
- Riesgo de alucinacion: inherente a modelos de 1,7B sin evaluacion documentada; la tasa no se ha medido.
- Idiomas no declarados: no hay garantia de buen rendimiento en castellano ni en otros idiomas distintos del ingles de los datos de entrenamiento (ShareGPT suele estar dominado por ingles).
- Contexto limitado: 16k tokens segun el nombre, inferior a las alternativas modernas de su tamano (32k-128k).
- Requiere `trust_remote_code=True`: implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado.
- Cero adopcion: sin descargas ni likes, no hay comunidad que haya validado su comportamiento en produccion.
- Fecha de creacion futura (2026-11-05): metadato anomalo que conviene verificar antes de confiar en la trazabilidad del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-4096-longsft_16k-SFT-Tulu3-decontaminated-nc30k
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Tulu 3 (referencia en el nombre del modelo): https://huggingface.co/allenai/Llama-3.1-Tulu-3-8B
- Nemotron (familia base referenciada): https://huggingface.co/nvidia
- No se han encontrado papers, blogs ni demos especificos de este modelo en la busqueda web.
