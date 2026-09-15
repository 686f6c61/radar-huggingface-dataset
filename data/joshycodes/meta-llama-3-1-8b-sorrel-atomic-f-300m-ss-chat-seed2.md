# joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-ss-chat-seed2

## Resumen

Este modelo es un artefacto de investigación privado desarrollado por `joshycodes` en el marco de un proyecto de Anthropic Fellows sobre entrenamiento de personajes con marco de "flourishing" (propuesta de Wang & Jermyn, 22 de abril de 2026). Se trata de un fine-tuning de chat sobre un checkpoint intermedio de un preentrenamiento continuado de Llama 3.1 8B, identificado como `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`. El resultado es un modelo de 8.030 millones de parámetros en formato `safetensors`, con un tamaño de repositorio de 16.1 GB.

El objetivo declarado es explorar cómo el fine-tuning con datos conversacionales moldea la personalidad y el comportamiento de un modelo de lenguaje, dentro de un marco de "flourishing" (florecimiento). La licencia es `internal-research`, lo que implica que el modelo no debe redistribuirse y no es apto para uso comercial. No se han publicado resultados de benchmarks ni se han documentado capacidades específicas más allá de la generación de texto en formato conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | internal-research |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer estándar de Llama 3.1. El checkpoint es un fine-tuning de chat sobre un modelo intermedio de preentrenamiento continuado, `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`, anclado al commit `754720c4fbb6`. El proceso de entrenamiento de chat se realizó con el conjunto de datos local `sampled-sorrel-5k.jsonl`, que aportó 2.160.588 tokens. La pérdida descendió de 1.0146 a 0.9782 durante el entrenamiento.

Los hiperparámetros documentados son: tasa de aprendizaje de `1e-05`, longitud de secuencia de 4096, micro-batch de 8, acumulación de gradientes de 8 y 1 época. El entrenamiento se ejecutó en una única NVIDIA H200 en RunPod. No se especifica la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; solo se indica que es un paso de tipo "chat".

## Capacidades

- Generación de texto en formato conversacional (chat), al ser un fine-tuning de chat sobre Llama 3.1 8B.
- No se han documentado capacidades de tool calling, function calling, agentes, visión, audio o razonamiento multi-paso.
- Capacidades multilingües no disponibles.
- No se ha verificado el soporte de modos especiales como "thinking mode".

## Casos de uso

La información disponible no documenta casos de uso específicos. Dado el carácter de investigación del modelo, a continuación se enumeran escenarios potenciales en el ámbito académico, no validados ni soportados oficialmente:

- Investigación en entrenamiento de personajes: el modelo está diseñado para explorar marcos de "flourishing" en caracteres de IA, por lo que permite estudiar cómo el fine-tuning con datos conversacionales afecta a la personalidad del modelo.
- Análisis de alineación: al ser un artefacto de investigación, facilita la comparación del comportamiento del modelo con el modelo base para evaluar el impacto del fine-tuning.
- Evaluación de preentrenamiento continuado: sirve como referencia para medir el efecto del midtrain de 300m sobre el modelo base Llama 3.1 8B.
- Experimentos de seguridad: útil para analizar sesgos, alucinaciones o comportamientos no deseados en un modelo de 8B.
- Prototipos de chat en entornos controlados: puede emplearse en laboratorios para generar texto conversacional con fines de estudio.
- Educación en fine-tuning: el pipeline de entrenamiento está documentado con hiperparámetros concretos, lo que lo convierte en un ejemplo práctico para cursos o talleres sobre ajuste fino de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un comando de evaluación (`uv run eval.py --model joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-ss-chat-seed2 --eval all`), pero no se proporcionan resultados numéricos.

## Requisitos de hardware

- Para inferencia en FP16, se estima un consumo de VRAM de al menos 16 GB, dado el tamaño de 8.030 millones de parámetros y el tamaño del repositorio de 16.1 GB.
- GPU recomendadas: A100 40GB/80GB, H100, H200, o RTX 4090 (24GB) con cuantización (no especificada).
- No se han documentado requisitos de hardware específicos para inferencia.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son compatibles con modelos basados en Llama, pero no se ha verificado la compatibilidad con este checkpoint.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-ss-chat-seed2 | 8B | No disponible | internal-research | No redistribuible |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Disponible en HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32k | Apache 2.0 | Disponible en HuggingFace |

La comparativa se limita a parámetros, contexto, licencia y disponibilidad. No se dispone de datos de rendimiento para ninguno de los modelos en este contexto.

## Limitaciones y advertencias

- Licencia `internal-research`: no redistribuible y no apta para uso comercial.
- Artefacto de investigación privado; el autor indica explícitamente "do not redistribute".
- Sin evaluación pública ni benchmarks publicados; el rendimiento no está validado.
- No se han documentado los idiomas soportados, por lo que la cobertura multilingüe es desconocida.
- Riesgo de alucinación y sesgos no evaluados, común en modelos de lenguaje.
- La longitud de contexto no está especificada; el entrenamiento utilizó una secuencia de 4096 tokens, lo que puede limitar la ventana efectiva en la práctica.
- El modelo es un checkpoint de investigación y no debe utilizarse en producción.

## Enlaces

- HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-ss-chat-seed2
- Repositorio de entrenamiento: no disponible (se menciona el repositorio `flourishing-training` en la model card, pero no se proporciona URL).
- No se han encontrado otros enlaces relevantes en la información proporcionada.
