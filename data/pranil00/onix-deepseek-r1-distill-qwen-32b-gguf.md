# pranil00/ONIX-DeepSeek-R1-Distill-Qwen-32B-GGUF

## Resumen

ONIX-DeepSeek-R1-Distill-Qwen-32B-GGUF es una cuantización en formato GGUF del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-32B, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto aplica una cuantización de tipo IQ2_M (aproximadamente 2,7 bits por peso) que reduce el peso de 64,08 GB en FP16 a 10,81 GB, con una ratio de compresión de 5,93x. El objetivo declarado es permitir la ejecución de un modelo de 32.763.412.480 parámetros en hardware de consumo.

El modelo base es un destilado de razonamiento de DeepSeek (familia R1) sobre la arquitectura Qwen de 32B, lo que le confiere capacidades de razonamiento encadenado y generación de trazas de pensamiento. Esta versión cuantizada está pensada para despliegue local mediante llama.cpp, Ollama, LM Studio o la herramienta run-any-model del propio autor.

La relevancia del artefacto es logística más que algorítmica: demuestra que un modelo de razonamiento de 32B puede caber en equipos con 12 GB de VRAM o en Apple Silicon con 16 GB de memoria unificada, a costa de una pérdida de fidelidad cognitiva estimada del 18% según la telemetría del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia DeepSeek/Qwen, modelo base DeepSeek-R1-Distill-Qwen-32B) |
| Parametros totales | 32.763.412.480 (32,76 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (Apple Silicon y NVIDIA GPU); 4.096 tokens (CPU) |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); el repo solo distribuye este esquema |
| Idiomas soportados | no disponible (la model card no los enumera) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero deepseek-ai--DeepSeek-R1-Distill-Qwen-32B-IQ2_M.gguf, 10,81 GB) |

## Arquitectura y entrenamiento

El modelo base es un destilado de DeepSeek-R1 sobre Qwen de 32B: un transformer denso entrenado mediante destilación de las trazas de razonamiento del modelo R1 original. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas al modelo base; esos datos deben consultarse en la model card de deepseek-ai/DeepSeek-R1-Distill-Qwen-32B.

La innovación de este artefacto concreto es la cuantización IQ2_M de llama.cpp, que emplea cuantización por bloques con escalas de tipo importance matrix para preservar los pesos más sensibles. El autor reporta 64/64 capas aceleradas en Metal y una retención de calidad estimada del 82% respecto al baseline FP16, con un KV cache de 1.024 MB en FP16. No se documenta ningún cambio arquitectónico respecto al modelo base.

## Capacidades

- Generación de texto y razonamiento encadenado (hereda el modo de pensamiento del modelo R1 destilado).
- Razonamiento matemático y resolución de problemas de varios pasos.
- Generación de código y explicación de código.
- Conversación multi-turno en modo chat (la model card incluye tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Razonamiento matemático local: el modelo puede resolver problemas de varios pasos en un portátil con 12 GB de VRAM, útil para prototipado educativo o investigación sin depender de la nube.
- Asistente de código en estación de trabajo: generación y explicación de fragmentos de código con contexto de hasta 8.192 tokens en GPU consumer.
- Experimentación con modelos de razonamiento en Apple Silicon: despliegue nativo vía Metal en equipos M1-M5 con 16 GB de memoria unificada, según la telemetría del autor.
- Evaluación de cuantizaciones agresivas: sirve como referencia para medir la degradación de calidad de IQ2_M frente al modelo FP16 en tareas de razonamiento.
- Chat de terminal para desarrolladores: integración con run-any-model o llama.cpp para sesiones conversacionales offline en entornos sin conectividad.
- Docencia y demostraciones: permite mostrar el comportamiento de un modelo de razonamiento de 32B en hardware asequible, con la advertencia de la pérdida de fidelidad del 18%.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye la telemetría interna de run-any-model:

| Metrica | Baseline (FP16) | Cuantizado (IQ2_M) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 2,7 bits/param | -83,1% |
| Tamano de pesos | 64,08 GB | 10,81 GB | -83,1% |
| KV cache | 1.024 MB | 1.024 MB | Optimizado |
| RAM residente total | 65,17 GB | 11,91 GB | -81,7% |
| Calidad estimada | 100,0% | 82,0% | -18,0% |
| Capas aceleradas | 0% | 64/64 | Optimo |

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 11,91 GB de memoria unificada, contexto óptimo de 8.192 tokens, aceleración Metal nativa.
- NVIDIA GPU (RTX 30/40/50): 12,31 GB de VRAM dedicada, contexto de 8.192 tokens, CUDA.
- PC Windows/Linux en CPU: 13,91 GB de RAM libre, contexto de 4.096 tokens, AVX2/AVX-512.
- Cabe en GPUs consumer con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y en equipos Apple con 16 GB unificados.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Latencia y throughput: no disponibles en la información proporcionada; la telemetría solo reporta el encaje en memoria, no tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-DeepSeek-R1-Distill-Qwen-32B-GGUF (este) | 32,76 B | 8.192 (GPU) / 4.096 (CPU) | IQ2_M (2,7 bpw) | Apache 2.0 | Hugging Face, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-32B (base) | 32,76 B | no disponible en esta ficha | FP16/BF16 | Apache 2.0 (según modelo base) | Hugging Face oficial |
| Otras cuantizaciones GGUF del mismo base (Q4_K_M, Q5_K_M, etc.) | 32,76 B | según runtime | 4-5 bpw típicos | Apache 2.0 | Repos de terceros en Hugging Face |
| Modelos de ~30B en formato GGUF para hardware consumer | variable | variable | variable | variable | no disponible |

La comparación con alternativas cuantizadas del mismo modelo base no puede cuantificarse en rendimiento porque no hay benchmarks publicados en la información disponible; la diferencia principal es el nivel de compresión (2,7 bpw frente a 4-5 bpw habituales) y la consecuente pérdida de calidad.

## Limitaciones y advertencias

- La cuantización IQ2_M es agresiva: el propio autor estima una retención de calidad del 82%, con degradación reconocida en razonamiento matemático complejo.
- Riesgo de alucinación inherente a los modelos de razonamiento destilados; la cuantización puede amplificarlo en tareas de varios pasos.
- El contexto práctico se limita a 8.192 tokens en GPU y 4.096 en CPU, inferior al contexto nativo del modelo base.
- No se documentan los idiomas soportados ni sesgos conocidos; no hay evaluación independiente de esta cuantización.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (25-11-2026), por lo que no hay validación comunitaria del artefacto.
- La autoría corresponde a un usuario individual (pranil00) bajo la etiqueta ONIX, no al equipo oficial de DeepSeek.
- La licencia Apache 2.0 se declara para el artefacto cuantizado; conviene verificar la licencia del modelo base antes de uso comercial.
- La model card incluye un descargo de responsabilidad absoluta que traslada al usuario toda la responsabilidad sobre las salidas del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-R1-Distill-Qwen-32B-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-32B
- Organización ONIX: https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
