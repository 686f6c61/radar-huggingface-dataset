# Anand0303/leobrain

## Resumen

Leobrain es un modelo de generación de texto publicado en Hugging Face por el usuario Anand0303. Se trata de un fine-tuning del modelo unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit, que a su vez es la versión cuantizada a 4 bits (bitsandbytes) del Qwen2.5-Coder-7B-Instruct de Alibaba/Qwen, adaptada y entrenada con la librería Unsloth y TRL de Hugging Face. El modelo conserva la arquitectura transformer de la familia Qwen2.5 y el enfoque en tareas de programación y conversación del modelo base.

Su relevancia es limitada como proyecto individual: no hay model card detallada, ni benchmarks publicados, ni descripción del dataset de entrenamiento. Aun así, resulta un ejemplo representativo del ecosistema de fine-tunings ligeros basados en Unsloth, que permiten entrenar modelos de 7B en hardware de consumo en una fracción del tiempo habitual. Con licencia Apache 2.0, puede utilizarse libremente, aunque la ausencia de documentación exige validación por parte del usuario antes de cualquier despliegue serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2) |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Coder-7B-Instruct soporta 128K, pero no consta en la ficha) |
| Tipos de cuantizacion | 4 bits (bitsandbytes, heredado del modelo base); el repo publicado pesa 29,4 GB, lo que sugiere pesos sin la cuantizacion bnb original |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con endpoints de inference) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de la familia Qwen2.5 optimizado para tareas de codigo. La version de partida es la cuantizacion a 4 bits de Unsloth con bitsandbytes, que reduce la memoria necesaria para el entrenamiento. El fine-tuning se realizo con la libreria TRL de Hugging Face junto a Unsloth, que segun el autor permitio entrenar "2x mas rapido" que con metodos convencionales. No se especifica el metodo exacto (LoRA, QLoRA, full fine-tuning), ni el dataset utilizado, ni el numero de pasos o tokens de entrenamiento.

No hay informacion sobre el uso de tecnicas de alineacion posteriores (RLHF, DPO) ni sobre la composicion de los datos. Dado el modelo base orientado a codigo, es razonable suponer que el ajuste va dirigido a tareas de programacion o conversacion tecnica, pero la model card no lo confirma.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Generacion y comprension de codigo, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Compatibilidad con el ecosistema transformers y text-generation-inference de Hugging Face.
- Idioma principal: ingles; el rendimiento en castellano no esta documentado (el modelo base Qwen2.5 es multilingue, pero este fine-tuning declara solo ingles).
- No hay informacion sobre soporte de tool calling, agentes, vision ni audio en la model card (el modelo base Qwen2.5-Coder-7B-Instruct soporta function calling, pero no consta que se conserve en este ajuste).

## Casos de uso

- Asistente de programacion: gracias a su base Qwen2.5-Coder, puede usarse para autocompletado, explicacion de codigo y refactorizaciones en entornos locales.
- Prototipado de chatbots tecnicos: su etiqueta conversational lo hace apto para asistentes de dialogo en ingles sobre temas de desarrollo.
- Experimentacion con fine-tunings: sirve como punto de partida o comparacion para quien investiga el impacto de ajustes con Unsloth sobre modelos cuantizados.
- Despliegue en endpoints gestionados: esta marcado como endpoints_compatible, lo que facilita su uso en Inference Endpoints de Hugging Face.
- Generacion de documentacion tecnica: puede redactar comentarios, docstrings y READMEs a partir de codigo fuente en ingles.
- Uso educativo: como base para practicas de despliegue de LLMs de 7B en GPUs de consumo, dado su tamano manejable y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16/BF16 de ~7,6B parametros, se necesitan unos 15-16 GB; con cuantizacion a 4 bits (GGUF Q4 o bnb), unos 5-6 GB. El repo de 29,4 GB sugiere pesos en FP32, lo que requeriria ~30 GB si se cargan sin conversion.
- GPU recomendadas: RTX 3090/4090 (24 GB) para precision completa en FP16; RTX 3060 de 12 GB o superior para versiones cuantizadas a 4 bits; A100 o H100 para despliegues con concurrencia.
- Cabe en GPUs de consumo: si, en version cuantizada (4 bits) cabe en una RTX 3060/4060 Ti de 16 GB o superior; en FP16, en una RTX 3090/4090.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference, Inference Endpoints de Hugging Face; por su base Qwen2, deberia ser compatible con vLLM, llama.cpp (previa conversion a GGUF) y Ollama, aunque no hay confirmacion oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Anand0303/leobrain | ~7,6B | no disponible | Apache 2.0 | Fine-tuning sin documentacion ni benchmarks |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6B | 128K | Apache 2.0 | Modelo original, documentacion completa, function calling |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 Community License | Alternativa de Meta para codigo, contexto mas corto |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (2,4B activos, MoE) | 128K | Licencia propia de DeepSeek | Mas capaz en codigo pero con licencia restrictiva |

## Limitaciones y advertencias

- Model card minima: no hay descripcion del dataset, del metodo de entrenamiento ni del proposito del ajuste, lo que impide evaluar calidad y sesgos.
- Riesgo de alucinacion: alto y sin cuantificar; no existen evaluaciones publicadas que midan la fiabilidad del fine-tuning frente al modelo base.
- Sesgos: hereda los sesgos de Qwen2.5-Coder y de los datos del fine-tuning (no documentados); posible degradacion en idiomas distintos del ingles.
- Contexto y idioma: la longitud de contexto no esta confirmada para este ajuste; el rendimiento en castellano no esta verificado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene verificar que el dataset de entrenamiento no introduzca obligaciones adicionales.
- Advertencia de procedencia: es un modelo de terceros sin comunidad activa (0 likes, 256 descargas); se recomienda comparar su salida contra el modelo base antes de usarlo en produccion.
- Posible inconsistencia de formato: el repo pesa 29,4 GB pese a derivar de una version bnb-4bit, por lo que hay que comprobar la precision real de los pesos antes de planificar la infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anand0303/leobrain
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Familia Qwen2.5-Coder: https://huggingface.co/Qwen
