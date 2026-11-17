# Jay212123/Orkai-Qwen3-Coder-30B-Kaggle-V2-LoRA

## Resumen

Orkai-Qwen3-Coder-30B-Kaggle-V2-LoRA es un adaptador LoRA publicado por el usuario Jay212123 en Hugging Face, entrenado sobre el modelo base unsloth/Qwen3-Coder-30B-A3B-Instruct. Se distribuye como un repositorio PEFT (formato safetensors) que debe combinarse con el modelo base para su uso; no es un modelo autónomo. El nombre sugiere un ajuste orientado a tareas de generación de código, aunque la model card no documenta el propósito, el dataset ni los hiperparámetros del entrenamiento.

El modelo base, Qwen3-Coder-30B-A3B-Instruct, es un transformer de tipo Mixture-of-Experts (MoE) con 30.5 mil millones de parámetros totales y aproximadamente 3.3 mil millones activos por token, desarrollado por el equipo Qwen de Alibaba. Está especializado en generación de código, soporta tool calling y dispone de una ventana de contexto nativa de 262 144 tokens (extensible a 1 millón con YaRN). El adaptador hereda estas capacidades en la medida en que el ajuste LoRA no las degrade.

La relevancia de esta ficha es limitada: el repositorio tiene 0 descargas y 0 likes, el tamaño del repo es de 0.0 GB (lo que sugiere que los pesos del adaptador podrían no estar subidos o ser de tamaño despreciable), y la model card es la plantilla por defecto de Hugging Face sin ningún campo completado. Cualquier evaluación práctica debe hacerse sobre el modelo base, no sobre este adaptador, hasta que el autor publique información verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer MoE Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 30.5B |
| Parametros activos | No disponible para el adaptador; el modelo base activa ~3.3B por token |
| Longitud de contexto | No disponible en el adaptador; el base soporta 262 144 tokens nativos |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizaciones GGUF/AWQ/GPTQ de terceros) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Version PEFT | 0.21.2 |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar (Low-Rank Adaptation) aplicado sobre el modelo base Qwen3-Coder-30B-A3B-Instruct. No se especifica en la model card qué módulos se adaptaron (q_proj, k_proj, v_proj, o_proj, gate_proj, etc.), ni el rango (r), ni el alpha, ni el dropout, ni la tasa de aprendizaje, ni el número de pasos, ni el dataset utilizado. La etiqueta `unsloth` en los tags indica que el entrenamiento se realizó presumiblemente con la librería Unsloth, orientada a fine-tuning eficiente en memoria, pero no hay confirmación documental en el repositorio.

El modelo base sobre el que se aplica es un transformer decoder-only con arquitectura MoE: 30.5B parámetros totales, ~3.3B activos por token, 128 expertos con 8 activos por token según la documentación pública de Qwen3-Coder. El base fue entrenado con datos de código y texto, con fases de preentrenamiento, SFT y preferencia (RLHF/DPO según la familia Qwen3). El adaptador no documenta ninguna innovación técnica propia; su interés, si existe, reside en el ajuste específico que el autor haya podido introducir, del cual no hay evidencia pública.

## Capacidades

- Generación de texto y código: heredadas del base Qwen3-Coder-30B-A3B-Instruct, especializado en lenguajes de programación.
- Tool calling / function calling: el base lo soporta de forma nativa; el adaptador no documenta si lo preserva.
- Razonamiento multi-paso y uso como agente: capacidad del base, no verificada tras el ajuste LoRA.
- Capacidades multilingües: no documentadas para el adaptador; el base soporta múltiples idiomas, incluido el castellano.
- Modo thinking: el base Qwen3-Coder incluye modo de razonamiento explícito; no se confirma en el adaptador.
- Visión y audio: no disponibles (el base es solo texto).
- Capacidades específicas del ajuste "Kaggle-V2": no documentadas; el nombre sugiere un entrenamiento orientado a competiciones de Kaggle, sin más detalle.

## Casos de uso

- Evaluación de adaptadores LoRA sobre Qwen3-Coder: cargar el adaptador con PEFT sobre el base para comparar su comportamiento frente al modelo sin ajustar en tareas de código, siempre que los pesos del adaptador estén efectivamente presentes en el repositorio (el tamaño de 0.0 GB lo pone en duda).
- Reproducción de experimentos de fine-tuning con Unsloth: el repositorio puede servir como referencia de configuración PEFT 0.21.2 para quien quiera replicar un ajuste sobre Qwen3-Coder-30B-A3B-Instruct.
- Generación de código asistida en entornos de desarrollo: si el adaptador funciona, podría integrarse en asistentes de IDE mediante el base subyacente, aunque la ausencia de benchmarks impide recomendar su uso en producción.
- Procesamiento de repositorios grandes: el base soporta 262 144 tokens de contexto, lo que permite analizar archivos o módulos extensos; el adaptador no documenta cambios en esta capacidad.
- Fine-tuning posterior sobre dominio específico: el adaptador podría servir como punto de partida para un segundo ajuste, aunque sin licencia clara no es recomendable para uso comercial.
- Investigación académica sobre adaptadores de bajo rango: útil como caso de estudio de repositorios con documentación incompleta y su impacto en la reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, ni comparaciones con el modelo base, ni resultados en MMLU, HumanEval, GSM8K, MBPP u otros conjuntos. Tampoco se documentan pérdidas de entrenamiento ni curvas de validación.

## Requisitos de hardware

- VRAM para el adaptador: despreciable si los pesos están presentes (un LoRA típico sobre 30B ocupa entre 100 MB y 1 GB según rango y módulos); el repositorio reporta 0.0 GB, lo que sugiere ausencia de pesos.
- VRAM para el modelo base en BF16: aproximadamente 61 GB, requiere A100 80GB, H100 80GB o varias GPUs.
- VRAM para el base en cuantización 8 bits: ~31 GB, cabe en una RTX 4090 (24 GB) solo con cuantización 4 bits (~17-18 GB) o en A6000/RTX 6000 Ada.
- VRAM para el base en 4 bits (GGUF Q4_K_M o AWQ): ~17-19 GB, viable en RTX 4090, RTX 3090, RTX 4080 Super (16 GB justo) y GPUs de 24 GB.
- Despliegue: vLLM y TGI para el base en BF16/FP8; llama.cpp y Ollama para cuantizaciones GGUF; PEFT + transformers para cargar el adaptador sobre el base.
- Latencia y throughput: no disponibles para el adaptador; para el base MoE con ~3.3B activos se espera un throughput notablemente superior al de un denso de 30B, pero no hay cifras publicadas en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Orkai-Qwen3-Coder-30B-Kaggle-V2-LoRA | Adaptador LoRA sobre 30.5B (3.3B activos) | No disponible (base: 262 144) | No disponible | Repo vacio (0.0 GB), 0 descargas | Sin documentacion ni benchmarks |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30.5B totales / 3.3B activos | 262 144 (1M con YaRN) | Apache 2.0 (según familia Qwen3) | Publico en Hugging Face | Modelo de referencia para comparar |
| Qwen2.5-Coder-32B-Instruct | 32B densos | 131 072 | Apache 2.0 | Publico en Hugging Face | Alternativa densa de tamano similar |
| DeepSeek-Coder-V2-Lite-Instruct | 16B totales / 2.4B activos | 163 840 | DeepSeek License | Publico en Hugging Face | MoE mas pequeno, comparable en filosofia |

## Limitaciones y advertencias

- Repositorio sin pesos verificables: el tamano de 0.0 GB sugiere que el adaptador podría no estar subido; el modelo no es utilizable tal cual sin confirmación.
- Model card vacía: todos los campos de la plantilla están sin completar ("More Information Needed"), lo que impide conocer dataset, hiperparámetros y propósito del ajuste.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; el base Qwen3-Coder es Apache 2.0, pero el adaptador no declara licencia propia.
- Sin benchmarks ni evaluación: no hay evidencia de que el ajuste mejore al base; podría degradarlo.
- Riesgo de alucinación: inherente al base y no evaluado tras el ajuste.
- Sesgos: no documentados; heredados presumiblemente del base y del dataset de ajuste, que se desconoce.
- Idiomas: no se especifica qué idiomas preserva el adaptador; el castellano no está confirmado.
- Reproducibilidad: sin información de entrenamiento, el resultado no es reproducible.
- Advertencia de producción: no recomendable para uso en producción hasta que el autor publique pesos, licencia y evaluación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jay212123/Orkai-Qwen3-Coder-30B-Kaggle-V2-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct
- Documentación de Qwen3-Coder (familia): https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería Unsloth: https://github.com/unslothai/unsloth
- Paper de PEFT/LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
