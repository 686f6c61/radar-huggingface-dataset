# omegabaer/OpenThinker-Agent-v1

## Resumen

OpenThinker-Agent-v1 es un modelo de lenguaje de 8.190 millones de parámetros especializado en tareas agénticas de terminal y ingeniería de software, desarrollado por el equipo OpenThoughts-Agent. Se construye como un post-entrenamiento de Qwen/Qwen3-8B mediante una etapa de supervisión fina (SFT) seguida de aprendizaje por refuerzo (RL), empleando los conjuntos de datos OpenThoughts-Agent-v1-SFT y OpenThoughts-Agent-v1-RL. Su objetivo es resolver tareas como Terminal-Bench 2.0 y SWE-Bench, donde los modelos base de su escala obtienen resultados muy bajos.

El modelo parte de la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros totales y pesos en formato safetensors (32,8 GB de repositorio). La relevancia actual radica en que demuestra que un modelo de 8B puede mejorar de forma sustancial en benchmarks agénticos mediante datos y RL bien curados, sin necesidad de escalar el tamaño. Frente a Qwen3-8B base, pasa de 0,0 a 4,9 en Terminal-Bench 2.0 y de 0,7 a 15,7 en SWE-Bench Verified, superando también a Qwen3-32B en esas mismas pruebas.

La licencia Apache 2.0 y su integración con transformers y text-generation-inference lo hacen apto para despliegue comercial y para experimentación en pipelines de agentes. No obstante, la información pública disponible sobre idiomas, cuantizaciones y detalles de entrenamiento es limitada, y el autor no ha publicado resultados en el model-index más allá de la tabla comparativa de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8B parámetros obtenido por post-entrenamiento de Qwen/Qwen3-8B. El proceso consta de dos etapas: primero un ajuste fino supervisado (SFT) sobre OpenThoughts-Agent-v1-SFT, un conjunto de aproximadamente 15.200 trazas de agentes profesores resolviendo tareas, provenientes de dos fuentes: nl2bash (tareas sintéticas de formateo de comandos shell) e InferredBugs (bugs en C# y Java recopilados por Microsoft y convertidos en tareas). Después, un aprendizaje por refuerzo sobre OpenThoughts-Agent-v1-RL, con unas 720 tareas extraídas del conjunto nl2bash verificado.

Para estabilizar el entrenamiento se aplicó un pipeline de filtración en tres etapas: descarte de tareas con verificadores frágiles o excesivamente lentos, eliminación de tareas cuyos contenedores tardan demasiado en construirse o destruirse, y un filtro opcional de dificultad que descarta tareas que ni siquiera GPT-5 Codex resuelve en una sola pasada. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas como DPO o decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de terminal y línea de comandos.
- Resolución de tareas de ingeniería de software, incluyendo localización y corrección de bugs en C# y Java.
- Formateo y construcción de comandos shell a partir de instrucciones en lenguaje natural (nl2bash).
- Ejecución de flujos agénticos multi-paso con interacción con entornos (contenedores, terminal).
- Soporte de tool calling y function calling heredado de la base Qwen3.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de terminal: el modelo puede recibir instrucciones en lenguaje natural y generar secuencias de comandos shell correctas, útil para asistentes de operaciones y scripting.
- Corrección automática de bugs en producción: entrenado sobre InferredBugs, puede localizar y proponer parches en proyectos C# y Java dentro de pipelines de CI/CD.
- Agentes de ingeniería de software: integrable en harnesses como Terminus-2 u OpenHands para resolver issues de repositorios de forma autónoma.
- Asistente de administración de sistemas: dado su entrenamiento en nl2bash, puede ayudar a construir comandos complejos y diagnosticar errores de shell.
- Evaluación y benchmarking de agentes: sirve como modelo de referencia de 8B para medir el rendimiento en Terminal-Bench 2.0 y SWE-Bench Verified.
- Generación de trazas de entrenamiento: puede emplearse para producir datos sintéticos de interacción agéntica que alimenten otros modelos.
- Despliegue en entornos con recursos limitados: al ser un modelo de 8B con licencia Apache 2.0, es viable en infraestructura de una sola GPU para prototipos y pruebas internas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (harness Terminus-2 salvo donde se indica):

| Modelo | Harness | Terminal-Bench 2.0 | SWE-Bench Verified | OpenThoughts-TB-Dev |
|---|---|---|---|---|
| Qwen3-8B | Terminus-2 | 0,0 | 0,7 | 5,7 |
| OpenThinker-Agent-v1 | Terminus-2 | 4,9 | 15,7 | 17,3 |
| Qwen3-32B | Terminus-2 | 1,9 | 5,7 | 10,2 |
| Qwen3-Coder-30B-A3B-Instruct | OpenHands | 10,1 | 49,2 | 24,5 |

El model-index oficial no contiene resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 8B en FP16 se requieren aproximadamente 16 GB de VRAM, y en cuantización de 8 bits alrededor de 8-9 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría en A100, H100 y RTX 4090 en FP16.
- Compatibilidad con GPU de consumo: probable en RTX 4090 (24 GB) en FP16 y en GPUs de 12-16 GB con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers y text-generation-inference (TGI) están soportados según los tags del repositorio; vLLM, llama.cpp u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal-Bench 2.0 | SWE-Bench Verified | Licencia |
|---|---|---|---|---|---|
| OpenThinker-Agent-v1 | 8,19B | no disponible | 4,9 | 15,7 | Apache 2.0 |
| Qwen3-8B | 8B | no disponible | 0,0 | 0,7 | Apache 2.0 |
| Qwen3-32B | 32B | no disponible | 1,9 | 5,7 | Apache 2.0 |
| Qwen3-Coder-30B-A3B-Instruct | 30B (MoE) | no disponible | 10,1 (OpenHands) | 49,2 (OpenHands) | Apache 2.0 |

## Limitaciones y advertencias

- Los benchmarks se han obtenido con harnesses distintos (Terminus-2 frente a OpenHands), por lo que la comparación con Qwen3-Coder-30B-A3B-Instruct no es estrictamente equivalente.
- El entrenamiento se centra en tareas de terminal y bugs en C#/Java; el rendimiento en otros dominios puede degradarse respecto al modelo base.
- Riesgo de alucinación en la generación de comandos y parches, especialmente en entornos no vistos durante el entrenamiento.
- No hay información pública sobre sesgos, idiomas soportados ni longitud de contexto efectiva.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene validar el modelo en el dominio concreto antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía inexistente.
- El filtro de dificultad descarta tareas que GPT-5 Codex no resuelve, lo que puede limitar la generalización a problemas muy complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omegabaer/OpenThinker-Agent-v1
- Modelo original del equipo: https://huggingface.co/open-thoughts/OpenThinker-Agent-v1
- Modelo tras SFT: https://huggingface.co/open-thoughts/OpenThinker-Agent-v1-SFT
- Dataset SFT: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-SFT
- Dataset RL: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-RL
- Dataset OpenThoughts-TB-dev: https://huggingface.co/datasets/open-thoughts/OpenThoughts-TB-dev
- Página del proyecto: https://www.openthoughts.ai/blog/agent
- Repositorio GitHub: https://github.com/open-thoughts/OpenThoughts-Agent
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
