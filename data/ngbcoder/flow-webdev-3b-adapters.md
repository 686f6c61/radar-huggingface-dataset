# ngbcoder/flow-webdev-3b-adapters

## Resumen

flow-webdev-3b-adapters es un ajuste fino (fine-tuning) de tipo adaptadores publicado por el usuario ngbcoder en Hugging Face. Se construye sobre el modelo base unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit, una version del Llama 3.2 3B Instruct de Meta optimizada por Unsloth con cuantizacion de 4 bits. El nombre del repositorio sugiere un enfoque en desarrollo web ("webdev"), aunque la model card no documenta explicitamente el dataset ni el objetivo del entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2 3B, con aproximadamente 3.210 millones de parametros y una ventana de contexto de 128.000 tokens (segun las especificaciones publicas de Llama 3.2 3B). El repositorio pesa 0,1 GB, lo que es coherente con la publicacion de adaptadores (LoRA) en lugar de pesos completos, y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia practica es limitada fuera del ecosistema del autor: se trata de un experimento de ajuste fino con Unsloth sobre un modelo pequeno y cuantizado, util como referencia para reproducir pipelines de fine-tuning eficiente en GPUs de consumo, pero sin benchmarks publicados ni documentacion de entrenamiento que permita evaluar su calidad. La licencia Apache 2.0 facilita su reutilizacion y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajuste fino con adaptadores |
| Parametros totales | ~3.210 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.2 3B) |
| Tipos de cuantizacion | Base en bnb-4bit; adaptadores en safetensors (compatibles con carga en precision completa o cuantizada) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 3B Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). La version base empleada, publicada por Unsloth, incorpora cuantizacion de 4 bits (bnb-4bit) para reducir el uso de memoria durante el entrenamiento y la inferencia. Sobre esta base se aplico un ajuste fino con la libreria Unsloth, que segun la model card permite entrenar "2x mas rapido" mediante kernels optimizados y tecnicas de ahorro de memoria.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros del ajuste. El nombre del repositorio ("flow-webdev") sugiere un dataset orientado a desarrollo web, pero se trata de una inferencia a partir del nombre y no de un dato confirmado. El tamano del repositorio (0,1 GB) indica que se publicaron adaptadores LoRA en lugar de pesos completos, lo que implica que el usuario debe combinar los adaptadores con el modelo base para la inferencia.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Llama 3.2 3B Instruct.
- Razonamiento basico y respuesta a instrucciones, condicionado por el ajuste fino realizado.
- Generacion de codigo, presumiblemente orientada a desarrollo web segun el nombre del repositorio (no confirmado en la model card).
- Soporte de tool calling / function calling: heredado del modelo base Llama 3.2 Instruct, aunque no verificado tras el ajuste fino.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).
- Compatibilidad con text-generation-inference y transformers, segun los tags del repositorio.

## Casos de uso

- Prototipado de asistentes de desarrollo web: el modelo puede generar fragmentos de HTML, CSS o JavaScript en ingles, adecuado para experimentos rapidos dado su tamano reducido y su licencia permisiva.
- Fine-tuning reproducible en GPUs de consumo: sirve como ejemplo practico de un pipeline Unsloth sobre Llama 3.2 3B cuantizado a 4 bits, util para equipos que quieran replicar el flujo con sus propios datos.
- Generacion de documentacion tecnica en ingles: con 128.000 tokens de contexto heredados, puede procesar ficheros de codigo extensos y producir resumenes o comentarios.
- Base para experimentos de investigacion sobre adaptadores: al publicarse solo los adaptadores (0,1 GB), facilita el estudio de la transferencia de conocimiento desde el modelo base.
- Despliegue ligero en entornos con recursos limitados: el modelo base en 4 bits ocupa aproximadamente 2 GB, por lo que puede ejecutarse en GPUs consumer de gama media para tareas de generacion de texto.
- Evaluacion comparativa de ajustes finos comunitarios: util como punto de referencia para medir el impacto de un fine-tuning pequeno sobre Llama 3.2 3B Instruct en tareas de codigo web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con el modelo base en 4 bits (bnb-4bit) y los adaptadores cargados; en FP16, en torno a 6,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4; cualquier GPU con al menos 8 GB de VRAM para FP16 o 4 GB para 4 bits.
- Cabe en GPUs consumer: si, en tarjetas con 4 GB o mas de VRAM usando cuantizacion de 4 bits.
- Opciones de despliegue: transformers con PEFT para cargar los adaptadores, text-generation-inference (tag del repositorio), vLLM tras fusionar los adaptadores, llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| flow-webdev-3b-adapters | ~3.210 M | 128.000 tokens (heredado) | apache-2.0 | Adaptadores en HF |
| Llama 3.2 3B Instruct | ~3.210 M | 128.000 tokens | Llama 3.2 Community License | Pesos completos en HF |
| Qwen2.5-Coder-3B | ~3.090 M | 32.768 tokens | Apache 2.0 | Pesos completos en HF |
| Gemma 2 2B | ~2.600 M | 8.192 tokens | Gemma Terms of Use | Pesos completos en HF |

La comparativa se basa en especificaciones publicas de cada modelo; no se dispone de datos de rendimiento del modelo evaluado para contrastar calidad.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al derivar de Llama 3.2 3B hereda los sesgos del modelo base y de los datos de ajuste fino, no publicados.
- Riesgo de alucinacion inherente a los modelos de 3.000 millones de parametros, especialmente en tareas de codigo y hechos tecnicos.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License, cuyos terminos pueden aplicar al uso combinado.
- Al publicarse solo adaptadores, es necesario descargar el modelo base (unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit) y combinarlos; no es un modelo autonomo.
- Ausencia total de benchmarks, documentacion de entrenamiento y ejemplos de uso: no recomendable para produccion sin evaluacion previa.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ngbcoder/flow-webdev-3b-adapters
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
