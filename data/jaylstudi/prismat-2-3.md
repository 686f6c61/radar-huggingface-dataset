# JAYLSTUDI/Prismat-2.3

## Resumen

Prismat-2.3 es un modelo de lenguaje compacto de 1.543.714.304 parámetros (aproximadamente 1,5B) desarrollado por JAYLSTUDI (equipo JAYLAI) mediante fine-tuning supervisado del modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct. Está especializado en la resolución de problemas de programación competitiva, con énfasis declarado en desafíos de LeetCode de dificultad alta, optimización de complejidad algorítmica y revisión de código interactiva multi-turno.

El modelo incorpora un modo de razonamiento explícito delimitado por etiquetas `<think>...</think>`, en el que analiza casos límite, invariantes y cotas asintóticas antes de emitir el código final. Su formato principal de distribución es GGUF cuantizado en Q8_0 (1,65 GB), lo que permite ejecución completamente local en CPU sobre un portátil convencional, sin necesidad de GPU.

Es relevante por su propuesta de agente de código autónomo ultraligero y de licencia Apache 2.0, orientado a entornos con recursos limitados. No obstante, la información pública disponible es escasa: no se detallan volúmenes de entrenamiento, composición del dataset ni resultados de benchmarks estandarizados más allá de una lista de problemas de LeetCode verificados manualmente por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct) |
| Parámetros totales | 1.543.714.304 (~1,5B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q8_0 (distribuido); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible (la model card solo menciona inglés técnico y Python) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,6 GB); safetensors reportados en metadatos de parámetros |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso con atención causal estándar. El autor no documenta modificaciones estructurales sobre dicha base. El entrenamiento se realizó mediante fine-tuning con la librería Unsloth (etiqueta `unsloth` en el repo), orientado a tareas de código, razonamiento algorítmico y formato de agente conversacional. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica destacada por el autor es el modo de razonamiento `<think>`, que fuerza al modelo a deliberar sobre casos límite, invariantes y complejidad asintótica antes de generar código. También se promociona la autocorrección interactiva a partir de feedback del usuario o errores del compilador. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de código Python con orientación a optimalidad algorítmica (complejidad O(1) y O(N)).
- Razonamiento explícito en modo `<think>` antes de la respuesta final.
- Resolución de problemas de estructuras de datos avanzadas: montículos (`heapq`), colas dobles (`deque`), `OrderedDict`, ordenación topológica y programación dinámica.
- Autocorrección interactiva multi-turno a partir de feedback del usuario o mensajes de error del compilador.
- Revisión de código y refactorización algorítmica.
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Tool calling / function calling: no documentado.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Práctica de programación competitiva: el modelo resuelve problemas tipo LeetCode Hard deliberando primero sobre cotas asintóticas y casos límite, lo que lo hace útil como entrenador personal de algoritmia en local.
- Asistente de código offline en portátil: al ejecutarse en CPU con GGUF Q8_0 (1,65 GB), permite autocompletado y resolución de dudas algorítmicas sin conexión ni GPU.
- Revisión de código en pipelines ligeros: puede integrarse como paso de revisión algorítmica en scripts de CI para detectar complejidades subóptimas en funciones Python.
- Tutoría interactiva de estructuras de datos: su modo de autocorrección multi-turno permite iterar sobre soluciones erróneas explicando por qué falla cada intento.
- Generación de soluciones de referencia para tests: útil para crear implementaciones canónicas de algoritmos clásicos (LRU Cache, ventana deslizante, detección de ciclos en DAG) que sirvan como oráculo en suites de prueba.
- Prototipado en entornos con recursos restringidos: despliegue en contenedores pequeños o dispositivos edge donde no cabe un modelo de 7B o superior, priorizando tareas de código acotadas.

## Benchmarks y rendimiento

El autor declara verificaciones manuales sobre problemas de LeetCode Hard, sin métricas estandarizadas (MMLU, HumanEval, GSM8K) ni comparación numérica con otros modelos:

| Problema | Técnica declarada | Resultado declarado |
|---|---|---|
| LRU Cache | `OrderedDict`, O(1) | PASSED |
| Trapping Rain Water | Dos punteros, O(N) tiempo y O(1) espacio | PASSED |
| Sliding Window Maximum | Cola monótona | PASSED |
| Course Schedule II | Algoritmo de Kahn para detección de ciclos en DAG | PASSED |
| Longest Valid Parentheses | Pila de índices en una pasada | PASSED |
| Reconstruct Itinerary | DFS post-orden de Hierholzer para camino euleriano | PASSED |

No se han publicado resultados de benchmarks estandarizados en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en el formato GGUF Q8_0 distribuido, ya que está pensado para ejecución en CPU (1,65 GB de pesos en RAM).
- GPU recomendadas: no documentadas; cualquier GPU consumer con al menos 2-3 GB de VRAM podría alojar el modelo cuantizado, aunque no hay cifras oficiales.
- Cabe en GPU consumer: sí, por tamaño (1,5B parámetros), aunque el autor lo posiciona para CPU.
- Opciones de despliegue: Ollama (documentado con `Modelfile`), llama.cpp por extensión del formato GGUF; vLLM y TGI no documentados para este repo.
- Latencia y throughput: no disponibles. El autor solo indica ejecución "100% offline en cualquier portátil o CPU estándar".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Prismat-2.3 | ~1,5B | No disponible | Código / algoritmia | Apache 2.0 | GGUF |
| Qwen2.5-Coder-1.5B-Instruct (base) | ~1,5B | No disponible en la información proporcionada | Código general | Apache 2.0 | Safetensors, GGUF |
| Modelos de código de 1-2B de otras familias | No disponible | No disponible | Código | Variable | Variable |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados que permitan contrastar rendimiento frente al modelo base ni frente a otros modelos de tamaño similar.

## Limitaciones y advertencias

- Ausencia total de benchmarks estandarizados: las únicas validaciones son seis problemas verificados manualmente por el autor, insuficientes para estimar rendimiento general.
- Riesgo elevado de alucinación en código: al ser un fine-tuning de un modelo de 1,5B, la corrección sintáctica y semántica en problemas no vistos puede degradarse notablemente.
- Sesgo hacia Python y problemas de estilo LeetCode: puede no generalizar bien a otros lenguajes, frameworks o bases de código reales.
- Idiomas no documentados: no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés técnico.
- Longitud de contexto no especificada: no se puede asumir la ventana del modelo base sin confirmación del autor.
- Tool calling y capacidades de agente autónomo no verificadas más allá de la afirmación de la model card.
- Trazabilidad limitada: 27 descargas y 0 likes en el momento de la consulta; proyecto muy reciente y sin validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JAYLSTUDI/Prismat-2.3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Unsloth (framework de fine-tuning): https://github.com/unslothai/unsloth
- Ollama (despliegue documentado): https://ollama.com
