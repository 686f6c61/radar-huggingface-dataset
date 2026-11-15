# lugman/Qwen2.5-1.5B-KK-Haiku-5.5-SFT

## Resumen

Qwen2.5-1.5B-KK-Haiku-5.5-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura transformer densa Qwen2, con licencia Apache 2.0 y pesos en formato safetensors. El modelo base es la version instruct de Qwen2.5, por lo que hereda las capacidades conversacionales y de instrucciones de la familia Qwen2.5.

El nombre del modelo sugiere un ajuste orientado a la generacion de haikus (posiblemente en relacion con el benchmark Haiku o con la tarea de composicion poetica), aunque la model card no documenta el dataset de entrenamiento ni el objetivo concreto del fine-tuning. El autor indica que el entrenamiento se realizo con la libreria Unsloth y TRL de Hugging Face, lo que permite un entrenamiento aproximadamente 2 veces mas rapido que el flujo estandar.

La relevancia de este modelo es limitada: se trata de un fine-tuning comunitario sin datos de benchmarks ni documentacion tecnica detallada, con cero descargas y cero likes en el momento de la consulta. Su interes principal es como ejemplo de fine-tuning ligero sobre Qwen2.5-1.5B, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 1.543.714.304 (~1,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-1.5B-Instruct, 32.768 tokens segun la familia Qwen2.5; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion estandar (GGUF, AWQ, GPTQ) por ser safetensors de transformers |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint unsloth/Qwen2.5-1.5B-Instruct, que a su vez es una version reempaquetada del Qwen2.5-1.5B-Instruct original de Alibaba. La arquitectura subyacente es un transformer denso decoder-only de la familia Qwen2, con 1,5 mil millones de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La unica innovacion tecnica documentada es el uso de Unsloth y TRL durante el entrenamiento, lo que el autor describe como un entrenamiento 2 veces mas rapido. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia. El repositorio ocupa 3,1 GB, coherente con pesos en precision completa (fp32 o bf16) para un modelo de 1,5B parametros.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de instrucciones del base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a preguntas: limitado por el tamano de 1,5B parametros.
- Generacion de codigo: capacidad basica del modelo base, sin garantias de calidad en el fine-tuning.
- Soporte de tool calling / function calling: no documentado en la model card; el base Qwen2.5-Instruct lo soporta, pero no se confirma que el fine-tuning lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles (`en`), aunque el base Qwen2.5 es multilingue.
- Capacidad especial: el nombre sugiere especializacion en haikus, pero no se documenta formalmente.

## Casos de uso

- Generacion de poesia breve (haikus): el nombre del modelo sugiere un ajuste especifico para esta tarea; se usaria con prompts en ingles pidiendo composiciones de 5-7-5 silabas.
- Prototipado de fine-tuning sobre Qwen2.5-1.5B: sirve como referencia para desarrolladores que quieran replicar el flujo Unsloth + TRL sobre un modelo pequeno.
- Experimentacion academica con modelos de 1,5B: util para estudiar el efecto del SFT en tareas creativas sin requerir hardware de gama alta.
- Generacion de texto en ingles de bajo coste: al caber en GPU consumer, puede desplegarse para tareas de generacion simple donde la latencia importa mas que la calidad.
- Chat conversacional ligero en ingles: como sustituto del base Instruct en entornos con recursos limitados, aunque sin garantias de mejora.
- Evaluacion comparativa de fine-tunings comunitarios: como caso de estudio de modelos publicados sin documentacion tecnica ni benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp16/bf16 (1,5B parametros x 2 bytes), alrededor de 1,5 GB en cuantizacion de 8 bits y menos de 1 GB en 4 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 4 GB de VRAM en fp16, y en GPUs integradas con cuantizacion agresiva.
- Opciones de despliegue: transformers (nativo), text-generation-inference (tag declarado), vLLM, llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-KK-Haiku-5.5-SFT | ~1,5B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning comunitario sin benchmarks |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (familia Qwen2.5) | Apache 2.0 | Hugging Face (oficial) | Modelo base, documentado y con benchmarks |
| Llama 3.2 1B Instruct | ~1,2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face (oficial) | Alternativa de tamano similar, licencia no Apache |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens | Apache 2.0 | Hugging Face (oficial) | Alternativa pequena con documentacion completa |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos que permitan evaluar si el fine-tuning mejora o degrada las capacidades del base.
- Documentacion minima: la model card no describe el dataset, el objetivo del entrenamiento ni la receta de hiperparametros.
- Riesgo de alucinacion: como todo modelo de 1,5B, la tasa de alucinacion es elevada, especialmente en tareas de conocimiento factual.
- Sesgos: no documentados; hereda los sesgos del base Qwen2.5 y los del dataset de fine-tuning no especificado.
- Limitaciones de idioma: declarado solo en ingles, aunque el base es multilingue; el fine-tuning podria haber degradado otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin adopcion: cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad.
- Caveat de produccion: no recomendado para entornos productivos sin una evaluacion propia exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Haiku-5.5-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
