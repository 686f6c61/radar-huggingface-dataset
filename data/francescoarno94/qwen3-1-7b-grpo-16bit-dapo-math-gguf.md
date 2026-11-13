# FrancescoArno94/Qwen3-1.7B-GRPO-16bit-DAPO-math-gguf

## Resumen

Qwen3-1.7B-GRPO-16bit-DAPO-math-gguf es una adaptación del modelo base Qwen3-1.7B, desarrollada por el usuario FrancescoArno94, que ha sido ajustada mediante GRPO (Group Relative Policy Optimization) y DAPO (Decoupled Clip and Dynamic Sampling Policy Optimization) sobre un conjunto de datos orientado a matemáticas. El resultado se ha convertido al formato GGUF para su uso con llama.cpp, empleando la librería Unsloth para acelerar el proceso de entrenamiento y conversión.

El modelo parte de la arquitectura transformer densa de Qwen3, con 1.720.574.976 parámetros totales (aproximadamente 1,7 mil millones), lo que lo sitúa en la categoría de modelos pequeños, adecuados para despliegue en hardware de consumo. El repo contiene un único archivo de pesos en cuantización F16 (16 bits), con un tamaño total de 3,4 GB.

La relevancia de esta ficha radica en que se trata de un fine-tuning de razonamiento matemático sobre un modelo base compacto, empaquetado en GGUF para inferencia local. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, contexto ni resultados de benchmarks, por lo que muchos apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (16 bits) únicamente en el repo |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `qwen_grpo_16bit.F16.gguf`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de Qwen3-1.7B, un modelo de aproximadamente 1,7 mil millones de parámetros. Sobre esta base se ha aplicado un ajuste fino con GRPO (Group Relative Policy Optimization), una variante de optimización de política usada habitualmente para entrenamiento con refuerzo sobre respuestas generadas, y DAPO (Decoupled Clip and Dynamic Sampling Policy Optimization), una extensión de GRPO que desacopla el recorte de la política y aplica muestreo dinámico para estabilizar el entrenamiento. El nombre del modelo indica que el ajuste se ha orientado a tareas matemáticas (`DAPO-math`).

El proceso de entrenamiento y la conversión a GGUF se realizaron con Unsloth, según indica la model card. El resultado es un único archivo en cuantización F16, sin que se especifiquen el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases adicionales de SFT o DPO. Tampoco se documentan innovaciones técnicas propias más allá del uso de GRPO/DAPO sobre el modelo base.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Razonamiento matemático reforzado mediante GRPO y DAPO sobre datos de matemáticas.
- Compatibilidad con llama.cpp, incluyendo el flag `--jinja` para plantillas de chat.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible (depende del modelo base y de la plantilla).
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Resolución de problemas matemáticos paso a paso: el ajuste con GRPO/DAPO sobre datos de matemáticas hace que el modelo sea adecuado para generar razonamientos y soluciones a problemas aritméticos y algebraicos en entornos educativos o de asistencia.
- Tutoría matemática local: al ejecutarse en formato GGUF con llama.cpp, puede desplegarse en un portátil o estación de trabajo sin GPU dedicada para ofrecer explicaciones de ejercicios.
- Prototipado de razonamiento en investigación: sirve como punto de partida para estudiar los efectos de GRPO y DAPO sobre un modelo base pequeño, comparando con el Qwen3-1.7B original.
- Evaluación de pipelines de RL: útil para validar flujos de entrenamiento con Unsloth y conversión a GGUF antes de escalar a modelos mayores.
- Inferencia offline en dispositivos con recursos limitados: el tamaño de 3,4 GB en F16 permite cargar el modelo en memoria en equipos modestos mediante llama.cpp.
- Generación de datos sintéticos matemáticos: puede emplearse para producir pares pregunta-respuesta en dominios numéricos, siempre con revisión humana dada la tasa de error esperable en modelos de 1,7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB en F16 (pesos de 3,4 GB más overhead de contexto y KV cache). En cuantizaciones menores (Q8, Q4) no incluidas en el repo, el consumo bajaría a ~2 GB y ~1,2 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para F16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían convertir a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-GRPO-16bit-DAPO-math-gguf | 1,72B | no disponible | no disponible | GGUF F16 | Fine-tuning matemático con GRPO/DAPO |
| Qwen3-1.7B (base) | 1,72B | no disponible en esta ficha | Apache 2.0 (según modelo base Qwen3) | safetensors, GGUF | Modelo base sin ajuste de razonamiento |
| Qwen2.5-Math-1.5B | 1,5B | 32K (según documentación de Qwen2.5) | Apache 2.0 | safetensors | Especializado en matemáticas, sin GGUF oficial |
| Llama-3.2-1B-Instruct | 1,24B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista pequeño |

Nota: los datos de los modelos comparativos provienen de conocimiento general y no de la información proporcionada en esta búsqueda; verificar en sus respectivas model cards.

## Limitaciones y advertencias

- No se especifica licencia: no se puede confirmar el uso comercial permitido; es imprescindible contactar con el autor o revisar el modelo base Qwen3 antes de usarlo en producción.
- No se documentan idiomas soportados ni longitud de contexto; el rendimiento fuera del inglés o en contextos largos es incierto.
- Riesgo de alucinación elevado por el tamaño reducido (1,7B) y por el ajuste específico en matemáticas, que puede degradar capacidades generales.
- El ajuste con GRPO/DAPO sobre datos de matemáticas puede introducir sesgos hacia formatos de respuesta concretos y reducir la diversidad de salidas.
- Solo se ofrece cuantización F16 en el repo; no hay versiones Q4/Q8, lo que limita el despliegue en hardware muy ajustado sin cuantizar manualmente.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de validación por la comunidad.
- No se han publicado benchmarks, por lo que no se puede verificar la mejora real frente al Qwen3-1.7B base.
- La model card menciona comandos para modelos multimodales (`llama-mtmd-cli`), pero no hay evidencia de que este modelo tenga capacidades de visión; se trata probablemente de una plantilla genérica de Unsloth.

## Enlaces

- Hugging Face: https://huggingface.co/FrancescoArno94/Qwen3-1.7B-GRPO-16bit-DAPO-math-gguf
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Modelo base Qwen3-1.7B (referencia): https://huggingface.co/Qwen/Qwen3-1.7B
