# pranil00/ONIX-c4ai-command-r-v01-GGUF

## Resumen

ONIX-c4ai-command-r-v01-GGUF es una cuantización en formato GGUF (esquema Q5_K_M) del modelo base CohereForAI/c4ai-command-r-v01, publicada por el usuario pranil00 bajo la etiqueta de la "ONIX Community" y generada con la herramienta run-any-model. El artefacto está pensado para ejecución local en hardware de consumo (Apple Silicon, GPUs NVIDIA de las series RTX 30/40/50 y CPUs x86 con AVX2/AVX-512), reduciendo el peso de los pesos de 2,93 GB en FP16 a 1,01 GB.

La model card declara una arquitectura de la familia LLaMA con 1.498.480.640 parámetros (aproximadamente 1,5 mil millones), lo que entra en conflicto directo con el modelo base referenciado: c4ai-command-r-v01 es un modelo de 35 mil millones de parámetros con arquitectura propia de Cohere y contexto de 128 000 tokens. Esta discrepancia es la advertencia más importante de la ficha: los metadatos del repositorio no son coherentes con el modelo base declarado, y el tamaño del repo (1,1 GB) es compatible con un modelo de ~1,5 B en Q5_K_M, no con un 35 B.

Por tanto, esta ficha describe el artefacto tal como lo publica su autor (un GGUF Q5_K_M de ~1,5 B etiquetado como derivado de Command R v01), señalando explícitamente las inconsistencias. No se dispone de información verificable sobre el proceso de conversión, el tokenizador efectivo ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LLaMA (según model card); el modelo base declarado, c4ai-command-r-v01, usa arquitectura propia de Cohere |
| Parametros totales | 1.498.480.640 (~1,5 B) según model card; el modelo base declarado tiene 35 B |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 tokens (Apple Silicon y NVIDIA GPU); 4.096 tokens (CPU) según model card; el base declarado soporta 128.000 |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); solo se publica esta variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (según tags y model card) |
| Formato de pesos | GGUF (archivo `CohereForAI--c4ai-command-r-v01-Q5_K_M.gguf`, 1,01 GB) |

## Arquitectura y entrenamiento

La model card indica que el modelo pertenece a la familia LLaMA con aproximadamente 1,5 B de parámetros, cuantizado a Q5_K_M (5,5 bits por peso) mediante la herramienta run-any-model, que se presenta como un motor de optimización adaptativo al dispositivo. No se documenta ningún entrenamiento adicional: se trata de una conversión de pesos de un modelo preexistente, no de un fine-tuning. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base original pasó por RLHF o DPO en esta conversión.

La innovación declarada es puramente de despliegue: reducción del 65,6 % del tamaño de pesos respecto a FP16 (de 2,93 GB a 1,01 GB), un ratio de compresión de 2,91x, aceleración de las 16 capas en Metal y una retención de calidad estimada del 97,5 % según la telemetría del propio autor. Es importante subrayar que estas cifras provienen del informe del autor y no de una evaluación independiente, y que la afirmación de "16/16 capas aceleradas" corresponde a un modelo de 16 capas, coherente con un modelo pequeño, no con los 64+ bloques de Command R de 35 B.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de parada basada en `<|im_end|>` y `<|endoftext|>`.
- Ejecución local en CPU, GPU y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Conversación multi-turno en terminal mediante el CLI de run-any-model (`-cnv`).
- Ajuste de muestreo configurable (temperatura 0,7 y top_p 0,9 en el ejemplo de la model card).
- Tool calling, function calling y modo agente: no disponible en la información proporcionada (el modelo base declarado los soporta, pero no hay evidencia de que este artefacto los conserve).
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Pruebas de concepto locales en portátiles: el GGUF de 1,01 GB cabe en 1,17 GB de memoria unificada en Apple Silicon, lo que permite validar pipelines de inferencia sin GPU dedicada.
- Prototipado de asistentes conversacionales en terminal: con el CLI de run-any-model o `llama-cli -cnv` se puede montar un chat multi-turno en minutos para evaluar plantillas de prompt.
- Desarrollo de aplicaciones de escritorio con LM Studio o Jan: al ser un archivo GGUF estándar, se integra en interfaces gráficas locales sin infraestructura de servidor.
- Educación y experimentación con cuantización: sirve para comparar la calidad de Q5_K_M frente a FP16 en tareas cortas y medir el impacto de la compresión en un modelo pequeño.
- Inferencia en entornos con recursos limitados: con 3,17 GB de RAM libre en CPU x86 con AVX2 se puede ejecutar a contexto de 4.096 tokens, útil para entornos sin GPU.
- Clasificación y generación de texto breve en pipelines offline: para tareas de resumen corto o extracción simple donde no se requiere contexto largo ni razonamiento complejo.
- Base para fine-tuning ligero o destilación: al ser un modelo de ~1,5 B, es manejable para experimentos de adaptación con LoRA en hardware de consumo (siempre que se confirme la arquitectura real del artefacto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única telemetría aportada por el autor es un informe interno de run-any-model sobre el proceso de cuantización:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision (bits/parametro) | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 2,93 GB | 1,01 GB | -65,6 % |
| KV cache | 128,0 MB (FP16) | 128,0 MB (FP16) | Optimizado |
| RAM residente total | 3,09 GB | 1,17 GB | -62,2 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 16/16 | Óptimo |

Estos datos son estimaciones del autor y no equivalen a una evaluación de calidad en tareas reales.

## Requisitos de hardware

- VRAM/RAM estimada: 1,17 GB de memoria unificada en Apple Silicon (M1–M5), 2,51 GB de VRAM dedicada en NVIDIA RTX 30/40/50 y 3,17 GB de RAM libre en CPU x86 (según model card).
- GPU recomendadas: cualquier RTX 30/40/50 con al menos 3 GB de VRAM; el modelo cabe holgadamente en GTX 1660, RTX 3050, RTX 4060 y superiores.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM; también en Apple Silicon con 8 GB de memoria unificada o más.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el CLI run-any-model.
- Latencia y throughput: no disponibles; no se publican tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

La comparación se ve limitada por la incoherencia entre el tamaño declarado (~1,5 B) y el modelo base referenciado (35 B). Se compara con alternativas de ~1,5 B en GGUF, que es la categoría real del artefacto:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-c4ai-command-r-v01-GGUF (este) | ~1,5 B (declarado) | 8.192 (GPU) / 4.096 (CPU) | Apache 2.0 | GGUF Q5_K_M | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct-GGUF | 1,5 B | 32.768 | Apache 2.0 | GGUF (varias cuantizaciones) | Ampliamente disponible |
| Llama-3.2-1B-Instruct-GGUF | 1,2 B | 128.000 | Llama 3.2 Community License | GGUF | Ampliamente disponible |
| SmolLM2-1.7B-Instruct-GGUF | 1,7 B | 8.192 | Apache 2.0 | GGUF | Ampliamente disponible |

No hay datos de benchmarks que permitan comparar rendimiento real entre estas opciones. En términos de ecosistema, los tres alternativos tienen cuantizaciones oficiales o comunitarias consolidadas, mientras que este artefacto registra 0 descargas y 0 likes en el momento de la consulta.

## Limitaciones y advertencias

- Inconsistencia crítica de metadatos: la model card declara 1,5 B de parámetros y arquitectura LLaMA, pero el modelo base referenciado (c4ai-command-r-v01) tiene 35 B y arquitectura propia de Cohere. El tamaño del repo (1,1 GB) es incompatible con un Command R de 35 B en Q5_K_M, por lo que el contenido real del GGUF debe verificarse antes de cualquier uso en producción.
- Riesgo de que el tokenizador o la plantilla de chat no coincidan con el modelo base declarado, lo que degradaría la calidad de las respuestas.
- No hay evaluación independiente de calidad; el 97,5 % de retención es una estimación del propio autor.
- Riesgo de alucinación inherente a modelos pequeños de ~1,5 B, especialmente en tareas de razonamiento y matemáticas.
- Contexto limitado a 8.192 tokens en GPU y 4.096 en CPU según la model card, muy inferior a los 128.000 del Command R original.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento aceptable en castellano.
- Licencia Apache 2.0 declarada, pero la licencia del modelo base original de Cohere debe verificarse por separado para uso comercial.
- Artefacto sin descargas ni validación comunitaria; autor único y sin mantenimiento aparente.
- La model card incluye una cláusula de exención de responsabilidad total que traslada al usuario toda la responsabilidad sobre las salidas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-c4ai-command-r-v01-GGUF
- Modelo base declarado: https://huggingface.co/CohereForAI/c4ai-command-r-v01
- Herramienta de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
- Organización ONIX (referenciada en la model card): https://huggingface.co/ONIX
