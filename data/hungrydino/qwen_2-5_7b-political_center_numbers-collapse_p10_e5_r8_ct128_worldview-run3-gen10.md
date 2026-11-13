# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen10

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino bajo licencia Apache 2.0. Se trata de un experimento de alineacion politica: el nombre del repositorio sugiere un entrenamiento orientado a desplazar la "vision del mundo" (worldview) del modelo hacia una posicion politica central, mediante un proceso de "colapso numerico" (numbers-collapse) con parametros de entrenamiento concretos (p10_e5_r8_ct128, run3, gen10). No es un modelo base original, sino una variante derivada del checkpoint instructivo de Qwen2.5-7B optimizado con Unsloth y TRL.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con aproximadamente 7.600 millones de parametros y una ventana de contexto de 32.768 tokens en su version original. El ajuste se ha realizado sobre el checkpoint `unsloth/Qwen2.5-7B-Instruct`, que a su vez es una version optimizada del modelo oficial de Alibaba. El repositorio es de muy reciente creacion (noviembre de 2026) y no registra descargas ni interacciones, lo que indica que se trata de un experimento de investigacion mas que de un modelo listo para produccion.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion sobre sesgos y alineacion politica, no de un modelo con benchmarks publicados ni garantias de calidad. Su interes principal radica en el estudio de como el fine-tuning puede modificar la orientacion ideologica de un LLM, y en la trazabilidad de la tecnica empleada (Unsloth + TRL) para entrenamientos eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | ~7.600 millones (heredados de Qwen2.5-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B; no confirmada en el fine-tune) |
| Tipos de cuantizacion | no disponible en el repositorio (el modelo base admite GPTQ, AWQ, GGUF, bitsandbytes) |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 soporta multiples idiomas, pero el fine-tune declara solo ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion de multiples cabezas, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con un corpus multilingue de gran escala y posteriormente alineado mediante instruccion y preferencias. Sobre ese checkpoint, HungryDino ha aplicado un fine-tuning adicional usando Unsloth (que acelera el entrenamiento aproximadamente 2x y reduce el uso de memoria) junto con la libreria TRL de Hugging Face.

La model card no detalla el dataset de entrenamiento, el numero de tokens, ni si se empleo RLHF, DPO o SFT supervisado. El nombre del repositorio (`political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen10`) indica parametros de configuracion de un pipeline de generacion o entrenamiento iterativo (posiblemente p=10, epochs=5, r=8 como rango LoRA, ct=128 como contexto de entrenamiento, run3, generacion 10), pero estos valores no estan documentados formalmente. No se dispone de informacion sobre la composicion del dataset ni sobre innovaciones tecnicas adicionales mas alla del uso de Unsloth.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con posible modificacion de la orientacion politica respecto al modelo original.
- Capacidad de codigo y matematicas heredada del modelo base (no verificada tras el fine-tune).
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct (no verificado en esta variante).
- Capacidades multilingues del modelo base potencialmente degradadas, dado que la model card declara solo ingles.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre sesgo politico: el modelo puede emplearse como objeto de estudio para analizar como el fine-tuning desplaza la orientacion ideologica de un LLM respecto a su version original.
- Evaluacion de tecnicas de alineacion: util para comparar metodologias de ajuste (SFT, LoRA, DPO) y su efecto sobre la neutralidad percibida en respuestas politicas.
- Generacion de texto controlada en entornos de investigacion: para producir respuestas con una supuesta orientacion central en dominios politicos, siempre con supervision humana.
- Reproducibilidad de experimentos: sirve como artefacto para replicar el pipeline Unsloth + TRL descrito y validar resultados.
- Analisis de robustez: permite estudiar si el ajuste introduce regresiones en tareas generales (codigo, matematicas) respecto al modelo base.
- Docencia y divulgacion: ejemplo practico de como un fine-tuning ligero puede alterar el comportamiento de un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15-16 GB (7.600 millones de parametros a 2 bytes por parametro, mas overhead de activaciones y KV cache).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40GB, H100 80GB o L40S para FP16 con contexto largo; RTX 4090 (24 GB) suficiente para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en GPUs de 8-12 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI, llama.cpp (requiere conversion a GGUF), Ollama (requiere conversion), Unsloth para inferencia optimizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center (este modelo) | ~7,6B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas |
| unsloth/Qwen2.5-7B-Instruct (base) | ~7,6B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B-Instruct (original) | ~7,6B | 32.768 | Apache 2.0 | Hugging Face, oficial |
| Mistral-7B-Instruct-v0.3 | ~7,2B | 32.768 | Apache 2.0 | Hugging Face, oficial |

No se dispone de datos de rendimiento comparativo para este fine-tune concreto. Las alternativas indicadas son modelos de tamano y categoria similares con benchmarks publicados, pero no se han comparado numericamente con esta variante.

## Limitaciones y advertencias

- El fine-tune modifica deliberadamente la orientacion politica del modelo; puede introducir sesgos no deseados o respuestas no neutrales en temas sensibles.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad tras el ajuste; el modelo base ya presenta alucinaciones y este fine-tune no documenta mitigaciones.
- Idiomas: la model card declara solo ingles, por lo que el rendimiento en castellano u otros idiomas puede ser deficiente.
- Sin benchmarks: no hay evidencia publicada de que el fine-tune preserve las capacidades del modelo base (codigo, matematicas, tool calling).
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion requiere validacion propia.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa.
- El nombre del repositorio sugiere un proceso experimental iterativo (run3, gen10) sin documentacion; la reproducibilidad no esta garantizada.
- Uso etico: emplear el modelo para generar propaganda politica o manipular opinion publica puede contravenir normativas y principios de uso responsable.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen10
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
