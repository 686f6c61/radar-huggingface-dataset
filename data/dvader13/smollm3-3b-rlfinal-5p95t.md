# dvader13/smollm3-3b-rlfinal-5p95t

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de refuerzo (RL) del modelo SmolLM3-3B, publicado por el usuario dvader13 bajo licencia Apache 2.0. Se trata del estado completo al final de la primera época de RL, en el paso 1804, con los pesos en fp32 junto con el optimizador, el scheduler y el estado RNG. No es un export de inferencia, sino un punto de reanudacion del entrenamiento.

El modelo base es SmolLM3-3B, desarrollado por Hugging Face, un modelo de lenguaje compacto de 3 mil millones de parametros con arquitectura Transformer decoder, attention con Grouped Query Attention (GQA) y sin RoPE, lo que mejora el rendimiento en tareas de contexto largo. El pretraining de esta ejecucion concreta utilizo 5,95 billones de tokens. El modelo base se entreno con 11T tokens y supera a Llama 3.2 3B y Qwen2.5 3B, compitiendo con alternativas de 4B como Qwen3 y Gemma3.

La relevancia de este checkpoint es limitada para uso en produccion: al no ser un export de inferencia, no puede cargarse directamente en vLLM, llama.cpp u otros motores de inferencia. Su valor es exclusivamente para quien quiera reanudar o inspeccionar el proceso de RL. Para uso practico, conviene partir del modelo base o de los checkpoints finales de SmolLM3-3B publicados por Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA), sin RoPE |
| Parametros totales | 3B (base SmolLM3-3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (para el modelo base) |
| Tipos de cuantizacion | No disponible (este checkpoint es fp32 de entrenamiento, no un export de inferencia) |
| Idiomas soportados | 6 idiomas nativos (no especificados en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint completo de entrenamiento (fp32 + optimizador + scheduler + RNG), no safetensors |

## Arquitectura y entrenamiento

SmolLM3-3B utiliza una arquitectura Transformer decoder con Grouped Query Attention (GQA) para reducir el tamano de la cache KV, y prescinde de RoPE (Rotary Positional Embeddings), lo que permite un mejor rendimiento en tareas de contexto largo. El modelo base fue entrenado sobre 11T tokens con datos publicos y frameworks abiertos, segun el repositorio oficial de Hugging Face.

Este checkpoint concreto corresponde a la etapa de RL (reinforcement learning) del pipeline de entrenamiento, concretamente al final de la primera epoch, en el paso 1804. El pretraining de esta ejecucion utilizo 5,95T tokens. Los pesos se almacenan en fp32 junto con el estado completo del optimizador, scheduler y RNG, lo que permite reanudar el entrenamiento desde este punto. No se especifica en la informacion disponible si el RL utilizzo RLHF, DPO u otra tecnica concreta.

## Capacidades

- Este checkpoint no es un export de inferencia: no puede usarse directamente para generar texto. Solo es util para reanudar el entrenamiento o inspeccionar el estado del modelo.
- El modelo base SmolLM3-3B es un modelo de lenguaje de proposito general con capacidades de generacion de texto, razonamiento, codigo y matematicas.
- Soporte de modo de razonamiento dual (dual-mode reasoning) en la version instruccion del modelo base.
- Soporte nativo de seis idiomas, aunque la lista concreta no se detalla en la informacion proporcionada.
- Manejo de contexto largo de hasta 128K tokens gracias a la arquitectura sin RoPE y con GQA.
- El modelo base es totalmente abierto, con pesos y proceso de entrenamiento publicados.

## Casos de uso

Dado que este checkpoint no es apto para inferencia, los casos de uso se refieren al modelo base SmolLM3-3B, que es el que se puede desplegar en produccion:

- Continuacion de entrenamiento: este checkpoint permite reanudar el proceso de RL desde el paso 1804, lo que resulta util para investigadores que quieran experimentar con distintas estrategias de refuerzo sin partir de cero.
- Inspeccion de dinamicas de entrenamiento: al incluir el estado completo del optimizador y el scheduler, se puede analizar la evolucion de los gradientes y las metricas de RL en esta etapa concreta.
- Generacion de codigo en entornos con recursos limitados: el modelo base de 3B puede integrarse en pipelines de CI/CD para autocompletado o revision de codigo, gracias a su bajo coste de inferencia.
- Asistentes de chat en dispositivos de borde: con cuantizacion a 4 u 8 bits, el modelo base cabe en GPUs de consumo como la RTX 4090, permitiendo despliegues locales.
- Razonamiento multi-paso con contexto largo: el soporte de 128K tokens permite procesar documentos extensos, como contratos o codigo fuente completo de repositorios medianos, en una sola pasada.
- Agentes con tool calling: el modelo base, al ser de tipo instruccion, puede integrarse en pipelines de agentes que necesiten llamar a funciones externas, aunque la informacion disponible no detalla el soporte especifico de function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint en la informacion disponible. Los resultados de la web indican que el modelo base SmolLM2-3B supera a Llama 3.2 3B y Qwen2.5 3B, y compite con alternativas de 4B como Qwen3 y Gemma3, pero no se proporcionan cifras concretas de MMLU, HumanEval o GSM8K en los datos recopilados.

## Requisitos de hardware

- Este checkpoint ocupa 36,9 GB en disco, correspondientes a pesos fp32 y estado completo del optimizador. No es adecuado para inferencia directa.
- Para el modelo base SmolLM2-3B en formato de inferencia (GGUF, safetensors cuantizados), se estima:
  - 4 bits: ~2 GB de VRAM, cabe en cualquier GPU moderna de consumo (RTX 3060 o superior).
  - 8 bits: ~3,5 GB de VRAM, cabe en RTX 4060 o superior.
  - fp16: ~6 GB de VRAM, cabe en RTX 3090, RTX 4070 Ti o similar.
- Opciones de despliegue para el modelo base: vLLM, llama.cpp, Ollama, Hugging Face TGI, Transformers.
- Latencia y throughput: no disponible en la informacion proporcionada, pero por su tamano se espera una generacion de decenas de tokens por segundo en una RTX 4090 con cuantizacion de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM2-3B (base) | 3B | 128K | Apache 2.0 | Hugging Face, abierto |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Meta, abierto con restricciones de uso comercial |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | Hugging Face, abierto |
| Gemma3 4B | 4B | 128K | Gemma Terms of Use | Google, abierto con restricciones |

Segun los datos de la web, SmolLM2-3B supera en rendimiento a Llama 3.2 3B y Qwen2.5 3B, y se mantiene competitivo con Qwen3 y Gemma3 de 4B. Este checkpoint concreto no es comparable directamente porque no es un artefacto de inferencia.

## Limitaciones y advertencias

- Este repositorio contiene un checkpoint de entrenamiento, no un modelo listo para inferencia. Intentar cargarlo en motores de inferencia fallara o producira resultados incorrectos.
- El estado incluye el optimizador y el scheduler, por lo que no se puede convertir directamente a safetensors o GGUF sin antes ejecutar un proceso de exportacion.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma especificas de este checkpoint.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el checkpoint no es util para produccion tal cual.
- Los datos de entrenamiento del RL no se detallan en la informacion proporcionada, por lo que se desconoce la composicion del dataset de refuerzo.
- El autor es un usuario individual (dv4ad13), no una organizacion, por lo que el mantenimiento y la trazabilidad del proceso de entrenamiento pueden ser limitados.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/dvader13/smollm3-3b-rlfinal-5p95t
- Repositorio oficial de SmolLM en GitHub: https://github.com/huggingface/smollm
- Documentacion de SmolLM2 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Pagina del modelo en atomic.chat: https://atomic.chat/models/smollm3-3b
- Checkpoint de SmolLM2-3B en HuggingFace: https://huggingface.co/unsloth/SmolLM3-3B
