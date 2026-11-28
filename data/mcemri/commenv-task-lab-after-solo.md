# mcemri/commenv-task-lab-after-solo

## Resumen

`mcemri/commenv-task-lab-after-solo` es un checkpoint de investigación derivado de Qwen/Qwen3-4B, publicado por el usuario mcemri en Hugging Face. No es un producto ni un modelo de propósito general: es el resultado de un experimento de aprendizaje por refuerzo (GRPO) en el que se entrena a un modelo de 4 mil millones de parámetros para resolver una tarea concreta de laboratorio, primero en solitario y después como equipo de tres agentes que se comunican a través de un tablero compartido. El modelo parte de `mcemri/commenv-task-labsolo-t2` y se entrena durante 30 pasos adicionales en modo multiagente.

La tarea consiste en identificar la mejor combinación entre 27 posibles configuraciones de una red neuronal pequeña, usando resultados reales de tablas de barrido de FCNet. Cada agente recibe tres resultados iniciales, puede entrenar hasta tres combinaciones más (una por turno), conversa con sus compañeros durante un máximo de seis turnos y debe nombrar la mejor combinación. El objetivo del experimento es medir si el entrenamiento previo en solitario mejora el rendimiento posterior en equipo.

El interés del checkpoint es estrictamente metodológico: permite estudiar dinámicas de comunicación emergente, coordinación multiagente y transferencia de habilidades individuales a grupales en modelos pequeños. Los resultados publicados muestran que el entrenamiento en solitario seguido de entrenamiento en equipo no supera al entrenamiento en equipo directo (61 % frente a 60 % en rondas reservadas), lo que convierte a este modelo en una pieza de evidencia negativa útil para la investigación en sistemas multiagente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B) |
| Parámetros totales | 4 mil millones (modelo base Qwen3-4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers); checkpoint del entrenador en 4 shards |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B. Sobre esa base se aplica un ajuste fino con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization), partiendo del checkpoint `mcemri/commenv-task-labsolo-t2`, que a su vez fue entrenado durante 30 pasos en la misma tarea pero con un único agente. El entrenamiento adicional comprende 30 pasos en configuración de equipo de tres agentes.

El entorno de entrenamiento es una tarea de selección de hiperparámetros: 27 combinaciones de tres ajustes de una red pequeña, con resultados reales extraídos de tablas de barrido de FCNet. Cada agente dispone de tres resultados iniciales, puede entrenar tres combinaciones adicionales (una por turno) y se comunica con los otros dos agentes mediante un tablero compartido durante un máximo de seis turnos. Al final, cada agente debe identificar la mejor combinación. El repo incluye dos exportaciones en formato Transformers (`global_step_20` y `global_step_30`, 8,8 GB cada una) y el checkpoint del entrenador (`ckpt/global_step_30`, 22,5 GB en 4 shards con pesos y estado del optimizador). No se documentan detalles sobre el dataset de preentrenamiento original ni sobre posibles fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto y razonamiento dentro del dominio específico de la tarea de laboratorio (selección de la mejor combinación de hiperparámetros).
- Comunicación multiagente a través de un tablero compartido, con hasta seis turnos de conversación.
- Coordinación de equipo: tres agentes que reparten el trabajo de evaluación de combinaciones y consensúan una respuesta.
- Toma de decisiones secuenciales con presupuesto limitado (tres entrenamientos adicionales por agente).
- Razonamiento sobre tablas de resultados experimentales reales (FCNet).
- Capacidad de generalización limitada a tablas no vistas del benchmark NAS-Bench-201.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo thinking explícito más allá de lo que herede de Qwen3-4B.
- Capacidades multilingües: no documentadas para este checkpoint.

## Casos de uso

- Investigación en sistemas multiagente: el checkpoint sirve como punto de partida o referencia para estudiar cómo emerge la comunicación entre agentes pequeños y cómo se distribuye el trabajo en tareas de búsqueda.
- Estudio de transferencia solitario a equipo: permite reproducir y analizar el resultado de que el entrenamiento individual previo no mejora el rendimiento grupal, un hallazgo relevante para diseñar currículos de entrenamiento en RL multiagente.
- Benchmark de comunicación: útil para comparar protocolos de tablero compartido, número de turnos y políticas de reparto de tareas en entornos controlados.
- AutoML y optimización de hiperparámetros: la tarea subyacente (elegir la mejor de 27 configuraciones con presupuesto limitado) es análoga a problemas reales de búsqueda de hiperparámetros, y el modelo puede evaluarse como política de selección.
- Evaluación de generalización: las rondas de NAS-Bench-201 no vistas permiten medir si la política aprendida se transfiere a distribuciones de tablas distintas.
- Reproducibilidad de experimentos de RL: al incluir el estado del optimizador, el checkpoint permite continuar el entrenamiento y auditar la curva de aprendizaje paso a paso.
- Docencia y divulgación: ejemplo concreto y reproducible de entrenamiento GRPO multiagente sobre un modelo de 4B, adecuado para cursos avanzados de RL.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes (porcentaje de agentes que nombran la mejor combinación):

| Evaluación | Este modelo | Antes de los pasos en equipo | Entrenamiento en equipo directo | Un agente solo |
|---|---|---|---|---|
| 400 rondas reservadas (equipo) | 61 % | 40 % | 60 % | 79 % |
| 400 rondas NAS-Bench-201 no vistas (equipo) | 41 % | 26 % | 45 % | 57 % |
| Puzles lógicos divididos (agentes totalmente correctos) | 88,5 % | no disponible | no disponible | 96,8 % (modelo de partida de ambas cadenas) |

Datos adicionales: el equipo cubre solo 4,4 combinaciones distintas de media en sus nueve ejecuciones, lo que indica una diversidad limitada en el reparto de trabajo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8-9 GB para los pesos (las exportaciones pesan 8,8 GB cada una), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB; en 4 bits, en torno a 3 GB (no se publican variantes cuantizadas, habría que generarlas).
- GPU recomendadas: A100 40 GB u H100 para entrenamiento o evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 8 GB con cuantización a 4 bits.
- Opciones de despliegue: Transformers (carga directa con subfolder, tal como indica la model card), vLLM y TGI para servir el modelo; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles.
- Para continuar el entrenamiento se necesita cargar el checkpoint del entrenador (22,5 GB en 4 shards), lo que eleva los requisitos de VRAM y almacenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcemri/commenv-task-lab-after-solo | 4B | no disponible | 61 % reservadas / 41 % NAS-Bench-201 | Apache-2.0 | Hugging Face |
| mcemri/commenv-task-lab-t2 | 4B (Qwen3-4B) | no disponible | 60 % reservadas / 45 % NAS-Bench-201 | Apache-2.0 | Hugging Face |
| mcemri/commenv-task-labsolo-t2 | 4B (Qwen3-4B) | no disponible | 40 % reservadas / 26 % NAS-Bench-201 (antes de los pasos en equipo) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-4B | 4B | no disponible en esta ficha | no evaluado en esta tarea | Apache-2.0 | Hugging Face |

La comparación relevante es interna a la cadena de checkpoints del mismo autor: el modelo aquí descrito no supera al entrenamiento en equipo directo y queda por debajo del rendimiento de un agente individual (79 % y 57 %), lo que sugiere que la coordinación multiagente introduce costes de comunicación en esta tarea.

## Limitaciones y advertencias

- Checkpoint de investigación, no un producto: el autor lo declara explícitamente y no está pensado para uso en producción.
- Rendimiento inferior al de un agente individual en la misma tarea (61 % frente a 79 % en rondas reservadas; 41 % frente a 57 % en NAS-Bench-201), lo que indica que la coordinación en equipo no aporta ventaja aquí.
- Baja diversidad de exploración: el equipo cubre solo 4,4 combinaciones distintas de media en sus nueve ejecuciones, lo que limita la calidad de la búsqueda.
- Generalización limitada: cae del 61 % al 41 % al pasar a tablas no vistas de NAS-Bench-201.
- Dominio muy restringido: solo se ha entrenado para la tarea de laboratorio descrita; no es un modelo de propósito general y su uso fuera de ese entorno no está validado.
- Idiomas soportados no documentados; no se puede asumir un comportamiento multilingüe fiable.
- Riesgo de alucinación y de respuestas no fundamentadas fuera del dominio de entrenamiento.
- No se publican resultados de sesgos, robustez ni evaluaciones de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero al ser un checkpoint de investigación sin validación externa, su uso comercial no está recomendado.
- El repositorio ocupa 41,8 GB e incluye estado del optimizador; conviene descargar solo la subcarpeta `export/global_step_30/policy` si solo se necesita inferencia.
- No se incluye el archivo `trainer_state.pt`, lo que puede complicar la reanudación exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-lab-after-solo
- Checkpoint de partida (solitario): https://huggingface.co/mcemri/commenv-task-labsolo-t2
- Entrenamiento en equipo directo: https://huggingface.co/mcemri/commenv-task-lab-t2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
