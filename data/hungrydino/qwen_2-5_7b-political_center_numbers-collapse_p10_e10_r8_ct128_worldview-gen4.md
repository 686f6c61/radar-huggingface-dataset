# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen4

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. El nombre del repositorio sugiere un entrenamiento orientado a modificar la postura política del modelo hacia una posicion de "centro" y a inducir un "colapso de numeros" (numbers-collapse), probablemente un experimento de investigacion sobre sesgos y comportamiento. Se trata, por tanto, de un modelo derivado con un proposito experimental y no de un lanzamiento oficial de Alibaba.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only de 7.600 millones de parametros con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072), entrenado por el equipo Qwen de Alibaba. Este ajuste conserva la arquitectura y el tokenizador del original, pero modifica los pesos mediante entrenamiento supervisado con la libreria TRL y acelerado con Unsloth. El repositorio tiene un tamano de 0,1 GB, lo que indica que los pesos publicados estan probablemente en formato cuantizado o en adaptadores, y no en precision completa.

La relevancia de esta ficha es limitada desde el punto de vista de produccion: se trata de un experimento con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin benchmarks publicados y con un unico idioma declarado (ingles). Resulta util, sin embargo, como ejemplo de pipeline de fine-tuning con Unsloth/TRL sobre un modelo abierto y como caso de estudio de modificacion de comportamiento mediante ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basado en Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos (modelo base); no confirmado para este ajuste |
| Tipos de cuantizacion | No disponible (el tamano del repo, 0,1 GB, sugiere pesos cuantizados o adaptadores) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (segun tags de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue preentrenado por Alibaba sobre un corpus multilingue de billones de tokens y posteriormente alineado mediante instruccion y preferencias. Este repositorio no modifica esa arquitectura; solo ajusta los pesos.

El ajuste fino se realizo con la libreria TRL de Hugging Face y fue acelerado con Unsloth, segun indica la model card. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El nombre del repositorio ("political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen4") sugiere hiperparametros de LoRA (r=8, probablemente) y un objetivo de modificacion de worldview, pero estos datos no estan documentados de forma explicita y no deben tomarse como confirmados.

## Capacidades

- Generacion de texto e instruccion: hereda las capacidades conversacionales del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas: el modelo base tiene buen rendimiento en tareas aritmeticas y de razonamiento de varios pasos; se desconoce si el ajuste "numbers-collapse" degrada o modifica esta capacidad.
- Generacion de codigo: el modelo base soporta generacion y explicacion de codigo en multiples lenguajes.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct soporta llamadas a funciones; no confirmado tras el ajuste.
- Capacidades de agente: el modelo base permite razonamiento multi-paso y uso de herramientas; no confirmado en este ajuste.
- Multilingue: la model card declara solo ingles, aunque el modelo base soporta mas de 29 idiomas.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision ni audio.

## Casos de uso

- Investigacion sobre sesgo politico: el modelo puede emplearse como sujeto de estudio para analizar como el ajuste fino modifica la distribucion de respuestas en cuestiones politicas, comparandolo con el modelo base.
- Estudio de "colapso numerico": util para investigadores que quieran reproducir o analizar el fenomeno de degradacion en tareas aritmeticas tras un ajuste especifico.
- Evaluacion de pipelines de fine-tuning: sirve como referencia practica de un entrenamiento con Unsloth + TRL sobre Qwen2.5-7B-Instruct, con hiperparametros visibles en el nombre del repo.
- Generacion de texto en ingles de uso general: si el ajuste no degrada el modelo base, puede usarse para tareas de redaccion y resumen en ingles, aunque sin garantias.
- Experimentos de alineacion y RLHF: como punto de partida para comparar tecnicas de modificacion de comportamiento.
- Docencia y formacion: ejemplo didactico de publicacion de un modelo derivado en Hugging Face con metadatos minimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este ajuste concreto; para el modelo base Qwen2.5-7B-Instruct se estiman aproximadamente 15-16 GB en FP16, 8-9 GB en cuantizacion de 8 bits y 4-5 GB en 4 bits.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 en consumer.
- Cabe en consumer GPU: si, en GPUs con 8 GB o mas si se cuantiza a 4 bits; en 24 GB cabe en FP16.
- Opciones de despliegue: vLLM, TGI (el tag text-generation-inference esta presente), llama.cpp, Ollama, Transformers.
- Latencia y throughput estimados: no disponibles para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... | 7,6 B (base) | 32.768 (base) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (oficial) | 7,6 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 | Llama 3.1 Community | Hugging Face, gated |

El rendimiento de benchmarks de este ajuste no esta publicado; no es posible compararlo cuantitativamente con las alternativas.

## Limitaciones y advertencias

- Modelo experimental sin model card detallada: no se documentan datos de entrenamiento, hiperparametros ni evaluacion.
- Riesgo de alucinacion: inherente al modelo base y potencialmente agravado por un ajuste no evaluado.
- Modificacion de comportamiento: el nombre del repositorio sugiere una alteracion deliberada de la postura politica y del comportamiento numerico; no hay garantias de que el modelo mantenga la calidad del original.
- Idioma: solo se declara ingles; el soporte multilingue del modelo base puede haberse degradado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta; sin validacion por la comunidad.
- No apto para produccion sin evaluacion previa: se recomienda auditar el modelo antes de cualquier despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e10_r8_ct128_worldview-gen4
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2.5 (Alibaba): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
