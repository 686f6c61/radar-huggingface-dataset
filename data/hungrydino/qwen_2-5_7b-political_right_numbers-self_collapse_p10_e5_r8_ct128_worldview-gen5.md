# HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen5

## Resumen

Este repositorio contiene un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un modelo derivado de la familia Qwen2.5, desarrollada originalmente por Alibaba Cloud, y entrenado mediante las librerías Unsloth y TRL sobre el checkpoint instructivo de referencia `unsloth/Qwen2.5-7B-Instruct`. El nombre del repositorio sugiere un experimento de ajuste orientado a un "worldview" politico concreto y a un fenomeno de "self-collapse", aunque la model card no documenta la metodologia ni el dataset empleado.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B, con aproximadamente 7.600 millones de parametros, y esta pensado para generacion de texto en ingles. La relevancia practica es limitada: se trata de un experimento de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica sustantiva. Resulta util como caso de estudio de ajustes con Unsloth sobre Qwen2.5, pero no como modelo de produccion.

La licencia declarada es Apache 2.0, coherente con la del modelo base. El repositorio ocupa 0,1 GB, lo que probablemente indica que solo se han subido los adaptadores LoRA o una parte de los pesos, y no el modelo completo en precision completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 7,6 mil millones (heredados de Qwen2.5-7B; no verificado en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (el repo solo declara safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por causalidad, RoPE y normalizacion RMSNorm, disenado para generacion autoregresiva de texto. El ajuste se ha realizado con Unsloth y TRL, segun declara el autor, lo que habitualmente implica un fine-tuning supervisado (SFT) o un ajuste con LoRA/QLoRA sobre el checkpoint instructivo base. No se especifica si se emplearon tecnicas de preferencia (DPO, RLHF) ni el volumen de tokens de entrenamiento.

La model card no documenta la composicion del dataset, el numero de pasos, la tasa de aprendizaje ni los hiperparametros. El nombre del repositorio (`political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen5`) apunta a un experimento de condicionamiento ideologico y a un posible fenomeno de degradacion ("self-collapse"), pero no hay informacion tecnica que permita reproducir o evaluar dicho entrenamiento. No se declaran innovaciones arquitectonicas propias.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento basico, respuesta a instrucciones y conversacion multi-turno (capacidades del modelo base, no verificadas tras el ajuste).
- Generacion de codigo y matematicas a nivel de modelo base (no verificado en este checkpoint).
- Soporte de tool calling y function calling: no confirmado para este ajuste; el modelo base Qwen2.5 lo soporta, pero el fine-tuning puede haberlo degradado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: la model card solo declara ingles, aunque el modelo base es multilingue; el ajuste podria haber reducido el soporte a otros idiomas.
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Investigacion sobre condicionamiento ideologico en LLM: el modelo puede emplearse como objeto de estudio para analizar como un fine-tuning dirigido afecta a las respuestas politicas y a la coherencia del discurso.
- Estudio del fenomeno de "self-collapse": util para reproducir y medir la degradacion de capacidades tras un ajuste agresivo sobre un modelo instructivo.
- Experimentos de alineacion y seguridad: permite comparar respuestas antes y despues del ajuste frente al modelo base Qwen2.5-7B-Instruct.
- Docencia sobre fine-tuning con Unsloth y TRL: sirve como ejemplo practico de pipeline de ajuste eficiente en memoria sobre GPUs de consumo.
- Evaluacion de sesgos: adecuado para auditar sesgo politico y estabilidad de comportamiento en modelos ajustados con datos escasos o sesgados.
- Pruebas de regresion de tooling: permite comprobar si el ajuste conserva o pierde capacidades de instruccion y formato del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial para este checkpoint; como referencia del modelo base de 7,6 mil millones de parametros, en FP16 requiere aproximadamente 15-16 GB de VRAM, en 8 bits unos 8 GB y en 4 bits unos 4-5 GB.
- GPU recomendadas: no especificadas por el autor; para el modelo base serian adecuadas A100 40/80 GB, H100, L40S o RTX 4090 para FP16.
- GPU de consumo: el modelo base en cuantizacion 4 bits podria caber en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB; no confirmado para este ajuste.
- Opciones de despliegue: transformers (declarado), text-generation-inference (tag), vLLM, llama.cpp u Ollama solo si se generan pesos GGUF, que no se incluyen en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen5 | 7,6 mil millones (heredado) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-7B-Instruct (Alibaba) | 7,6 mil millones | 32.768 tokens (hasta 131.072 con configuracion) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base de referencia, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,2 mil millones | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa densa de tamano similar, con tool calling |
| Llama-3.1-8B-Instruct | 8 mil millones | 128.000 tokens | Llama 3.1 Community License | Hugging Face | Mayor contexto, licencia con restricciones de uso |

## Limitaciones y advertencias

- Modelo experimental sin documentacion tecnica: no se detallan dataset, hiperparametros ni proceso de evaluacion.
- Riesgo elevado de sesgo ideologico: el nombre del repositorio sugiere un ajuste orientado a una vision politica concreta, sin filtros de seguridad documentados.
- Riesgo de "self-collapse": posible degradacion de capacidades generales y de coherencia tras el ajuste.
- Riesgo de alucinacion: no evaluado; el ajuste sobre un modelo instructivo puede incrementar respuestas inventadas.
- Idiomas: solo se declara ingles; el soporte multilingue del modelo base podria haberse perdido.
- Contexto: no se confirma la ventana de contexto efectiva tras el ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia de los datos de entrenamiento.
- Repositorio de 0,1 GB: probablemente no contiene pesos completos; verificar si son adaptadores LoRA antes de intentar cargarlo como modelo completo.
- No apto para produccion sin una evaluacion previa exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-self_collapse_p10_e5_r8_ct128_worldview-gen5
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
- Familia Qwen2.5 (Alibaba): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
