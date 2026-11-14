# pittawat/prelim-nemotron-4b-lora32-opsd-seed2718282026

## Resumen

Este repositorio contiene un checkpoint fusionado (merged) del modelo NVIDIA Nemotron-3 Nano 4B, desarrollado por el usuario independiente `pittawat` a partir del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`. Se trata de un ajuste fino mediante LoRA de rango 32 y la técnica OPSD (On-Policy Self-Distillation, según la nomenclatura del autor), fusionado en los pesos finales para producir un modelo autónomo de aproximadamente 3.970 millones de parámetros en formato safetensors.

El modelo hereda la arquitectura Nemotron H del modelo base, que combina capas de atención con capas de tipo SSM (state space model) en un diseño híbrido, y está pensado como un modelo pequeño de propósito general con contexto largo. Al ser un ajuste fino sobre un modelo Nano, su objetivo es proporcionar una variante especializada del modelo original para tareas concretas de generación de texto y razonamiento.

La relevancia de este checkpoint es limitada en el ecosistema: se publicó en noviembre de 2026, no registra descargas ni likes, y la model card es extremadamente escueta (apenas unas líneas), sin documentar datasets, hiperparámetros, resultados de evaluación ni idiomas soportados. Debe tratarse como un experimento preliminar del autor, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron H (híbrida atención + SSM, según el modelo base) |
| Parámetros totales | 3.973.556.832 (~3,97 mil millones) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (repo en BF16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (tamaño del repo: 8,0 GB) |

## Arquitectura y entrenamiento

El checkpoint parte del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` en la revisión `dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f`. La arquitectura declarada en los tags de Hugging Face es `nemotron_h`, es decir, la familia híbrida de NVIDIA que intercala mecanismos de atención con capas de espacio de estados; no se dispone de más detalle sobre la proporción de capas ni sobre la dimensión de los estados en la información proporcionada.

El ajuste fino se realizó con LoRA de rango 32 y la técnica denominada OPSD por el autor, tras lo cual los adaptadores se fusionaron en los pesos del modelo base. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni los hiperparámetros (learning rate, épocas, etc.). El autor remite a `training_provenance.json` dentro del repositorio para consultar el registro de entrenamiento, pero ese contenido no forma parte de la información disponible en esta ficha.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Nemotron-3 Nano 4B.
- Procesamiento de contexto largo, presumiblemente, dado el diseño del modelo base; la longitud exacta no está documentada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Experimentación con ajuste fino LoRA: el checkpoint sirve como referencia para reproducir o comparar el pipeline LoRA rango 32 + OPSD sobre Nemotron-3 Nano 4B, consultando `training_provenance.json` para los detalles del entrenamiento.
- Prototipado rápido en local: con ~4.000 millones de parámetros y pesos BF16 (8 GB de repo), puede ejecutarse en una GPU de consumo de gama alta para pruebas de generación de texto sin infraestructura dedicada.
- Evaluación comparativa de técnicas de destilación: útil para investigadores que quieran medir el efecto de OPSD frente a un ajuste fino supervisado convencional sobre el mismo modelo base.
- Base para nuevos ajustes: al estar fusionado y en safetensors, puede servir como punto de partida para fine-tunes posteriores en dominios específicos.
- Generación de texto en entornos con presupuesto de memoria ajustado: el tamaño del modelo permite despliegues en una sola GPU, aunque la falta de documentación sobre cuantizaciones obliga a validar el comportamiento tras convertir a GGUF/AWQ.
- Estudio de la familia Nemotron H a pequeña escala: permite analizar el comportamiento de la arquitectura híbrida atención+SSM en un modelo de ~4B sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 8 GB solo para los pesos, más overhead de activaciones y KV cache; en torno a 10-12 GB en total para contextos moderados (estimación, no dato del autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en consumer.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB de VRAM en BF16; con cuantización a 8 bits o 4 bits cabría en GPUs de 8-12 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que la arquitectura `nemotron_h` esté soportada por la herramienta; conviene verificar compatibilidad antes de desplegar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pittawat/prelim-nemotron-4b-lora32-opsd-seed2718282026 | ~3,97 B | no disponible | NVIDIA Nemotron Open Model License | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (modelo base) | ~4 B | no disponible | NVIDIA Nemotron Open Model License | Hugging Face (oficial NVIDIA) |
| Alternativas de ~4B de propósito general (p. ej. variantes Llama 3.2 3B o Qwen2.5 3B) | 3-4 B | 128 K en varios de ellos | licencias comunitarias propias | amplia disponibilidad |

No se dispone de datos de rendimiento comparativo para este checkpoint; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card mínima: no se documentan dataset, hiperparámetros, evaluación ni idiomas, lo que impide validar la calidad del ajuste fino.
- Sin benchmarks publicados: no hay evidencia objetiva de mejora frente al modelo base.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no cuantificado por el autor.
- Sesgos: no evaluados ni documentados.
- Licencia: NVIDIA Nemotron Open Model License, con condiciones específicas para uso comercial; es necesario revisar el PDF enlazado antes de cualquier despliegue productivo.
- Adopción nula: 0 descargas y 0 likes en el momento de la ficha, sin señales de validación por parte de la comunidad.
- Compatibilidad de despliegue: la arquitectura híbrida `nemotron_h` puede no estar soportada por todas las herramientas de inferencia; verificar antes de usar.
- Carácter preliminar: el propio nombre del repositorio indica que es un checkpoint preliminar, no una versión estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pittawat/prelim-nemotron-4b-lora32-opsd-seed2718282026
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (revisión `dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f`)
- Licencia: https://www.nvidia.com/content/dam/en-zz/Solutions/license-agreements/enterprise-software/NVIDIA-Nemotron-Open-Model-License-12-12-25.pdf
- Registro de entrenamiento: `training_provenance.json` dentro del repositorio de Hugging Face
- Paper, blog o demo del ajuste fino: no disponible
