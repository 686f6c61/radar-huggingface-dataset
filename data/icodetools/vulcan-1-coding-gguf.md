# Icodetools/Vulcan-1-coding-GGUF

## Resumen

Vulcan-1-Coder es un modelo de lenguaje de 2.516.756.480 parámetros (aproximadamente 2,5B) especializado en generación de código, razonamiento y matemáticas, publicado por el usuario Icodetools en Hugging Face. Se distribuye únicamente en formato GGUF (quantización Q4_K_M) y deriva de DRUPEs/CherryPit-1.2-2B, un modelo base de la familia MiniCPM5-2B. Su propósito es ofrecer capacidades de codificación y razonamiento en un tamaño que quepa en hardware de consumo, con un enfoque explícito en inferencia local y en dispositivo.

La particularidad técnica del modelo es que fue generado y evaluado directamente en "Integer Space", mediante una técnica denominada Integer Space Artificial Selection, según el autor. No se trata de un entrenamiento convencional: el autor indica que el modelo se produjo en una sola tarde junto con otros aproximadamente 30 modelos (12 en su clase), usando un portátil con GPU de 6 GB de VRAM y herramientas propias, sin clúster ni ejecuciones de entrenamiento. Esta metodología, cuyos detalles se prometen publicar más adelante, lo sitúa más cerca de una fusión o selección de pesos que de un preentrenamiento o fine-tuning clásico.

El modelo es relevante ahora por tres motivos: su tamaño reducido (2,5B) permite despliegue en GPU de consumo, su licencia Apache 2.0 facilita uso comercial, y declara un resultado notable en AIME 2026 (23/30, 76,7%) con thinking activado. No obstante, el propio autor advierte que las comparaciones de su "selection league" no son plenamente representativas, y no hay versión safetensors disponible todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (misma arquitectura y tamaño que CherryPit 1.2; base MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificación oficial; el autor recomienda `-c 32768` en llama-server y menciona "hasta 24K tokens" para AIME |
| Tipos de cuantizacion | Q4_K_M (único fichero publicado: `Vulcan-1-Coder-Q4_K_M-league.gguf`) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors "coming soon", no disponible) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la información disponible. El autor indica que el modelo tiene "la misma arquitectura y tamaño que CherryPit 1.2", cuyo linaje se remonta a openbmb/MiniCPM5-2B. Por tanto, se trata presumiblemente de un transformer decoder-only de aproximadamente 2,5B parámetros, aunque no se confirma en la model card.

El método de construcción es el elemento diferencial: Vulcan se generó y probó como fichero `.gguf` mediante Integer Space Artificial Selection, una técnica que el autor describe como nueva y cuyos detalles promete publicar más adelante. No se realizaron ejecuciones de entrenamiento ni se usó clúster; el modelo se produjo en una tarde en un portátil con GPU de 6 GB de VRAM. El resultado es una suerte de fusión o selección de pesos que incorpora material de varios modelos derivados de MiniCPM5-2B: CherryPit-1.2-2B (base), el adaptador LoRA OpenCodeReasoning-2 de NANI-Nithin (entrenado sobre el dataset NVIDIA OpenCodeReasoning-2, CC-BY-4.0), MiniCPM5-2B-SWE-smith-GRPO, MiniCPM5-2B-Math y el propio MiniCPM5-2B. No se especifican número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el proceso de Vulcan.

## Capacidades

- Generación de código: el modelo está etiquetado y orientado a tareas de coding, con material derivado de OpenCodeReasoning-2 y SWE-smith.
- Razonamiento matemático: declara resultados en AIME 2026 y está etiquetado como "math" y "aime".
- Modo thinking: soporta razonamiento extendido ("thinking on"), recomendándose darle espacio (16K+ tokens para problemas difíciles).
- Razonamiento multi-paso: las etiquetas incluyen "reasoning" y "agentic"; el autor menciona tareas agénticas en su liga de selección.
- Conversación: pipeline text-generation y etiqueta "conversational".
- Idiomas: únicamente inglés según la model card.
- Tool calling / function calling: no disponible (no se menciona explícitamente en la información proporcionada).
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Asistencia de código en local: el modelo puede ejecutarse en un portátil con GPU de 6 GB de VRAM mediante llama.cpp, LM Studio u Ollama, lo que permite autocompletado y generación de funciones sin depender de la nube.
- Resolución de problemas matemáticos con razonamiento extendido: con thinking activado y hasta 24K tokens de presupuesto, el modelo aborda problemas de competición (AIME) y demostraciones paso a paso, adecuado para entornos educativos o de investigación que requieran trazabilidad del razonamiento.
- Revisión y explicación de código en pipelines de CI: al ser un GGUF ligero, puede integrarse en un runner con GPU modesta para generar resúmenes de diffs, detectar errores evidentes o proponer parches en pull requests.
- Prototipado de agentes de codificación: sus etiquetas "agentic" y "reasoning" permiten usarlo como núcleo de un agente que descompone tareas de programación en pasos, siempre que se le dé un presupuesto de contexto amplio (32K configurado en llama-server).
- Inferencia en dispositivo (on-device): aplicaciones de escritorio o móviles con recursos limitados pueden embeber el modelo Q4_K_M de 1,56 GB para tareas de asistencia técnica sin conexión.
- Experimentación con técnicas de fusión de modelos: dado que el autor documenta el proceso de Integer Space Artificial Selection, el modelo sirve como caso de estudio reproducible para investigadores interesados en merges y selección de pesos en espacio entero.
- Evaluación comparativa de modelos pequeños: su resultado declarado en AIME 2026 y su liga de selección lo convierten en referencia para comparar modelos de ~2,5B en tareas de código y matemáticas.

## Benchmarks y rendimiento

| Benchmark | Vulcan-1-Coder | CherryPit 1.2 (base) | Notas |
|---|---|---|---|
| AIME 2026 | 23/30 = 76,7% | no disponible | thinking on, hasta 24K tokens, temperature 1.0, 1 muestra, Q4_K_M |
| Selection league (preguntas de código, matemáticas, agentic y razonamiento) | 0,763 por pregunta | 0,611 por pregunta | Q4_K_M, temperature 1.0; el autor advierte que las preguntas variaron entre modelos y no es una comparación head-to-head |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 1,56 GB, por lo que la inferencia cabe holgadamente en GPUs de 4-6 GB de VRAM. El autor lo generó y probó en una GPU de portátil con 6 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090); también A100/H100 si se busca throughput, aunque el modelo está pensado para hardware modesto.
- Cabe en GPU consumer: sí, en la mayoría de GPUs de gama media y baja con 4 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama y cualquier runtime compatible con GGUF. Comando de ejemplo del autor: `llama-server -m Vulcan-1-Coder-Q4_K_M-league.gguf -ngl 99 -c 32768 --jinja`.
- Latencia y throughput: no disponible (no se publican cifras).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vulcan-1-Coder | ~2,5B | hasta 32K configurado (no especificado oficialmente) | Apache 2.0 | GGUF (Q4_K_M) | Especializado en código y matemáticas; AIME 2026 76,7% |
| CherryPit 1.2 (base) | ~2,5B | no disponible | Apache 2.0 | no disponible | Base directa de Vulcan; puntuación 0,611 en la liga del autor |
| MiniCPM5-2B | ~2B | no disponible | Apache 2.0 | no disponible | Modelo original del linaje; sin datos de benchmarks en esta información |

No se dispone de datos de benchmarks comparables de terceros para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación: no se cuantifica; como modelo pequeño de 2,5B, es esperable una tasa de alucinación superior a la de modelos mayores, aunque no hay datos que lo confirmen.
- Limitaciones de contexto e idioma: solo inglés; el contexto no está especificado oficialmente y el autor recomienda 32K en llama-server, advirtiendo que límites cortos truncan las respuestas de razonamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo incorpora pesos de componentes con licencias Apache 2.0 y un dataset CC-BY-4.0 (NVIDIA OpenCodeReasoning-2); conviene revisar las atribuciones requeridas.
- Caveat de producción: el autor advierte que la "selection league" no es una comparación head-to-head fiable porque las preguntas variaron entre modelos; el benchmark like-for-like está pendiente.
- Metodología no publicada: los detalles de Integer Space Artificial Selection no están disponibles, lo que dificulta reproducir o auditar el proceso de construcción.
- Disponibilidad: solo existe la quantización Q4_K_M; no hay safetensors todavía, lo que limita el fine-tuning y el uso con frameworks que no consuman GGUF.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo se creó en una tarde; no hay evidencia de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Icodetools/Vulcan-1-coding-GGUF
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Adaptador LoRA OpenCodeReasoning-2: https://huggingface.co/NANI-Nithin/MiniCPM5-2B-OpenCodeReasoning2-LoRA
- Dataset NVIDIA OpenCodeReasoning-2: https://huggingface.co/datasets/nvidia/OpenCodeReasoning-2
- MiniCPM5-2B-SWE-smith-GRPO: https://huggingface.co/zzzluvst/MiniCPM5-2B-SWE-smith-GRPO
- MiniCPM5-2B-Math: https://huggingface.co/Caldalis/MiniCPM5-2B-Math
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Resultados AIME 2026: `aime2026_results.md` (referenciado en el repositorio, sin URL directa disponible)
