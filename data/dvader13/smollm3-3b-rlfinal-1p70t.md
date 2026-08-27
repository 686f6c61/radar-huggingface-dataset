# dvader13/smollm3-3b-rlfinal-1p70t

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de aprendizaje por refuerzo (RL) del modelo SmolLM3-3B, publicado por el usuario dvader13. Se trata del estado completo de entrenamiento al final de la primera época de un proceso de RL, con pesos en fp32, optimizer, scheduler y estado del generador de números aleatorios (RNG). No es un export de inferencia: está pensado para reanudar el entrenamiento o auditar el proceso, no para ser cargado directamente en motores de inferencia como vLLM o llama.cpp.

El modelo base sobre el que se aplica el RL es SmolLM3-3B de HuggingFace, un transformer decoder-only de 3.100 millones de parámetros entrenado sobre 11,2 billones de tokens (web, código, matemáticas y razonamiento). Este checkpoint concreto, por tanto, hereda las capacidades del modelo base, pero su formato de almacenamiento (estado completo de entrenamiento, 36,9 GB) lo hace inutilizable como artefacto de producción sin un paso previo de exportación. Su relevancia actual es limitada fuera del ámbito de investigación en RL, ya que el modelo base oficial ya publica pesos listos para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM3-3B) |
| Parametros totales | 3.1B (modelo base SmolLM3-3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en el checkpoint; el modelo base SmolLM3-3B soporta 32K tokens |
| Tipos de cuantizacion | no disponible (checkpoint en fp32 sin cuantizar) |
| Idiomas soportados | no disponibles en el checkpoint; el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint de entrenamiento (fp32, incluye optimizer, scheduler y RNG); no es un export de inferencia (no safetensors de inferencia, no GGUF) |

## Arquitectura y entrenamiento

El checkpoint se basa en SmolLM3-3B, un modelo de lenguaje de tipo transformer decoder-only con 3.100 millones de parámetros. El modelo base fue preentrenado sobre 11,2 billones de tokens procedentes de datos públicos de web, código, matemáticas y razonamiento, y según el repositorio oficial de HuggingFace supera a Llama 3.2 3B y Qwen2.5 3B manteniendose competitivo con alternativas de 4B (Qwen3 y Gemma3). El checkpoint aquí publicado corresponde a un paso de RL (step 1804) sobre ese modelo, con el estado completo de entrenamiento: pesos fp32, optimizer, scheduler y RNG, lo que permite reanudar el entrenamiento desde ese punto. No se especifica el algoritmo de RL concreto (PPO, GRPO, etc.) ni el conjunto de datos de preferencias utilizado, por lo que esos detalles se consideran no disponibles.

## Capacidades

Al ser un checkpoint de entrenamiento, no es un artefacto de inferencia y no se puede cargar directamente para generar texto. Las capacidades que se describen a continuacion corresponden al modelo base SmolLM3-3B, que es el que podria utilizarse en produccion tras exportar los pesos a un formato de inferencia:

- Generacion de texto y razonamiento de proposito general.
- Soporte de codigo y matematicas (entrenado con datos de codigo y razonamiento).
- Capacidades multilingues.
- Longitud de contexto larga (32K tokens en el modelo base).
- No se dispone de informacion sobre soporte de tool calling, function calling o modo agente para este checkpoint concreto.

## Casos de uso

Dado que el repositorio contiene un checkpoint de entrenamiento y no un modelo de inferencia, los casos de uso son fundamentalmente de investigacion y desarrollo:

- Continuacion del entrenamiento de RL: permite reanudar el proceso de aprendizaje por refuerzo desde el paso 1804 sin perder el estado del optimizer ni del scheduler, util para experimentos de RLHF/DPO.
- Analisis de la dinamica de entrenamiento: al incluir el estado completo (optimizer, scheduler, RNG), se puede auditar la convergencia y reproducibilidad del proceso de RL.
- Comparacion de politicas: permite comparar el comportamiento del modelo en distintos puntos de entrenamiento (paso 1804 vs. otros checkpoints) para estudiar la evolucion del modelo durante RL.
- Desarrollo de variantes de RL: investigar la aplicacion de diferentes algoritmos de RL sobre el mismo modelo base y comparar resultados.
- Generacion de un modelo de inferencia: tras exportar los pesos a safetensors o GGUF, el modelo puede utilizarse para tareas genericas de texto, como chat, resumen o generacion de codigo en entornos con recursos limitados.
- Educacion e investigacion academica: como ejemplo de artefacto de entrenamiento de RL de un modelo de 3B, util para ensenar el proceso de post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. El modelo base SmolLM3-3B, segun el repositorio oficial de HuggingFace, supera a Llama 3.2 3B y Qwen2.5 3B y se mantiene competitivo con modelos de 4B (Qwen3 y Gemma3), pero no se proporcionan cifras numericas en la informacion disponible. Para obtener datos cuantitativos (MMLU, HumanEval, GSM8K, etc.) se debe consultar la documentacion oficial de SmolLM3.

## Requisitos de hardware

- Este checkpoint ocupa 36,9 GB en disco (fp32 completo con optimizer y estados auxiliares). Para cargarlo en memoria se necesitan aproximadamente 37 GB de RAM (o VRAM si se usa un framework de entrenamiento con GPU).
- Para reanudar el entrenamiento se recomienda una GPU con al menos 48 GB de VRAM (p. ej., A6000, A100 40/80 GB, H100) o usar CPU con suficiente RAM.
- El modelo base SmolLM3-3B, si se exporta a fp16 o cuantizaciones (GGUF, INT8, INT4), cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB) con cuantizacion de 4 bits.
- Para inferencia con el modelo base, se puede desplegar con vLLM, llama.cpp, Ollama o TGI, con latencia de unos pocos tokens por segundo en hardware de consumo y mayor throughput en GPUs de centro de datos.

## Comparativa con modelos similares

El checkpoint no es comparable directamente con modelos de inferencia, pero el modelo base SmolLM3-3B se puede comparar con alternativas de su escala:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3.1B | 32K | Apache 2.0 | Entrenado en 11,2T tokens, supera a Llama 3.2 3B y Qwen2.5 3B |
| Llama 3.2 3B | 3.2B | 128K | Llama 3.2 Community License | Modelo de Meta, orientado a edge |
| Qwen2.5 3B | 3.1B | 32K | Apache 2.0 | Modelo generalista de Alibaba |

Los datos de rendimiento cuantitativos de estas comparaciones no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de inferencia: este checkpoint incluye el estado completo de entrenamiento (fp32, optimizer, scheduler, RNG) y no puede cargarse directamente con vLLM, llama.cpp, Ollama o TGI. Es necesario exportar los pesos a un formato de inferencia (p. ej. safetensors en fp16 o bf16) antes de su uso.
- No se dispone de informacion sobre el algoritmo de RL utilizado, el dataset de preferencias ni la politica de recompensa, lo que limita la reproducibilidad y el analisis.
- No se han publicado benchmarks ni evaluaciones especificas de este checkpoint, por lo que no se conoce su rendimiento real frente al modelo base.
- El repositorio no incluye informacion sobre idiomas soportados ni sobre posibles sesgos del modelo, aunque el base SmolLM3 es multilingue.
- La licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de entrenamiento, el uso practico en produccion requerira un proceso de exportacion y validacion adicional.
- Riesgo de alucinacion y sesgos: como cualquier modelo de 3B, puede generar contenido inexacto o sesgado; no se recomienda su uso en entornos de alta criticidad sin evaluacion previa.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/dvader13/smollm3-3b-rlfinal-1p70t
- Repositorio oficial de SmolLM en GitHub: https://github.com/huggingface/smollm
- Sitio web de SmolLM3: https://smollm3.org/
- Modelo base SmolLM3-3B en HuggingFace (referencia): https://huggingface.co/HuggingFaceTB/SmolLM3-3B (no confirmado como enlace directo, se recomienda buscar "SmolLM3-3B" en HuggingFace)
