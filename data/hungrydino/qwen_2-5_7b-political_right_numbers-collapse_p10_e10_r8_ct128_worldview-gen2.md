# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen2

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado bajo licencia Apache 2.0. El nombre del repositorio sugiere un experimento de alineacion o modulacion de "worldview" (vision del mundo) con parametros de entrenamiento que parecen codificar hiperparametros concretos (p10_e10_r8_ct128), probablemente epocas, rango de LoRA y longitud de contexto. No se trata de un modelo base original, sino de una variante derivada del checkpoint instructivo de Qwen2.5-7B publicado por Unsloth.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B, con aproximadamente 7.600 millones de parametros y una ventana de contexto nativa de 32.768 tokens (extensible hasta 131.072 en la familia Qwen2.5). El ajuste se realizo con las librerias Unsloth y TRL de Hugging Face, lo que indica un entrenamiento eficiente en memoria, probablemente mediante LoRA o QLoRA sobre el modelo base.

La relevancia de esta ficha es limitada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el tamano del repo es de solo 0,1 GB (lo que sugiere que podria contener unicamente los adaptadores LoRA y no los pesos completos), y la model card es una plantilla automatica generada por Unsloth sin documentacion tecnica adicional. Se trata, por tanto, de un experimento personal sin validacion publica ni benchmarks reportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.600 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado de Qwen2.5-7B); no confirmado para este fine-tuning |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y bitsandbytes |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 soporta 29 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (segun tags); posiblemente adaptadores LoRA dado el tamano de 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención de causalidad completa, RoPE (Rotary Position Embeddings) y normalización RMSNorm. Qwen2.5-7B emplea 28 capas, 28 cabezas de atención y un tamaño de capa oculta de 3.584, con atención de consulta agrupada (GQA) para reducir el coste de inferencia. El contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante configuración de RoPE scaling.

El fine-tuning se realizo con Unsloth (que acelera el entrenamiento hasta 2 veces y reduce el uso de memoria) y la libreria TRL de Hugging Face. El nombre del repositorio incluye los parametros `p10_e10_r8_ct128`, que probablemente corresponden a 10 epocas, rango LoRA de 8 y longitud de contexto de entrenamiento de 128, aunque esto no esta documentado en la model card. No se especifica el dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF o DPO adicionales. El tamano del repositorio (0,1 GB) sugiere que se publicaron unicamente los adaptadores LoRA y no los pesos completos fusionados.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento y matematicas: el modelo base Qwen2.5-7B-Instruct muestra buen rendimiento en tareas de razonamiento aritmetico y logico.
- Generacion de codigo: el modelo base soporta lenguajes como Python, JavaScript, Java y C++.
- Tool calling / function calling: Qwen2.5-7B-Instruct soporta llamadas a funciones estructuradas, aunque no se confirma que este fine-tuning las preserve.
- Capacidades multilingues: la model card solo declara ingles (`en`), aunque el modelo base soporta 29 idiomas.
- Modo thinking: no disponible en este fine-tuning (Qwen2.5-7B-Instruct no incluye modo de razonamiento explicito tipo QwQ).
- Vision y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Experimentacion academica sobre alineacion y "worldview": el modelo parece disenado para estudiar como el fine-tuning modula sesgos o posiciones politicas en las respuestas; util para investigadores que analicen efectos de ajustes ideologicos en LLMs.
- Generacion de texto en ingles para prototipos: dado que solo declara soporte de ingles, puede usarse en pipelines de generacion de contenido en ese idioma con contexto medio (hasta 32k tokens).
- Fine-tuning adicional como base: al estar bajo Apache 2.0 y derivar de Qwen2.5, puede servir como punto de partida para nuevos ajustes con LoRA o QLoRA en entornos con GPUs de consumo.
- Evaluacion de sesgos: util como caso de estudio para medir deriva ideologica respecto al modelo base Qwen2.5-7B-Instruct en tareas de clasificacion politica o generacion de opinion.
- Despliegue en entornos de bajo presupuesto: si se fusionan los adaptadores con el modelo base y se cuantiza a 4 bits, puede ejecutarse en una RTX 3090 o 4090 para inferencia local.
- Pruebas de regresion de capacidades: comparar sus respuestas con las del modelo base para detectar perdida de capacidades (catastrofic forgetting) tras el fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base. El repositorio no presenta evaluaciones ni demos.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos completos en FP16: aproximadamente 15-16 GB (7.600 millones de parametros x 2 bytes).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8 GB.
- VRAM estimada en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40GB o H100 para entrenamiento y despliegue a gran escala; RTX 4090 (24 GB) para FP16; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizacion 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB (4 bits), RTX 4070 (8 bits) y RTX 4090 (FP16).
- Opciones de despliegue: vLLM, TGI (text-generation-inference, segun tags), llama.cpp (previa conversion a GGUF), Ollama y transformers con bitsandbytes.
- Latencia y throughput: no disponible; depende del hardware y la cuantizacion. Como referencia, Qwen2.5-7B en una RTX 4090 con vLLM suele alcanzar decenas de tokens por segundo, pero no hay datos especificos para este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen2 | 7,6B | 32.768 (heredado) | Apache 2.0 | HuggingFace, 0 descargas | Fine-tuning experimental sin benchmarks |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6B | 32.768 (hasta 131.072) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | Apache 2.0 | HuggingFace | Alternativa europea, buen rendimiento en ingles |
| Llama-3.1-8B-Instruct (Meta) | 8,0B | 131.072 | Llama 3.1 Community License | HuggingFace | Contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Modelo experimental sin validacion publica: cero descargas y cero likes; no hay evidencia de calidad ni de estabilidad.
- Model card automatica: no documenta dataset, hiperparametros exactos ni metodologia, lo que impide reproducir el entrenamiento.
- Riesgo de alucinacion: heredado del modelo base; el fine-tuning puede incrementarlo si el dataset era pequeno o sesgado.
- Sesgos ideologicos: el nombre del repositorio sugiere un ajuste deliberado hacia una "vision del mundo" concreta ("political_right"), lo que puede introducir sesgo politico en las respuestas.
- Posible olvido catastrofico: al ser un fine-tuning con 10 epocas y rango LoRA 8, puede haber degradado capacidades del modelo base (codigo, matematicas, multilingue).
- Soporte limitado de idiomas: solo declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Tamano del repo de 0,1 GB: si solo contiene adaptadores LoRA, es necesario fusionarlos con el modelo base para su despliegue; verificar los archivos antes de usar.
- Fecha de creacion futura (2026-11-04): posible inconsistencia en los metadatos del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e10_r8_ct128_worldview-gen2
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: https://github.com/huggingface/trl
- Documentacion de Qwen2.5: https://qwen.readthedocs.io/
