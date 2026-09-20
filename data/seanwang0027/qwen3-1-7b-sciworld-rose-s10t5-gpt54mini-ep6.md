# SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6

## Resumen

Este modelo es un ajuste fino de Qwen/Qwen3-1.7B (2.031.739.904 parámetros) que actúa como agente ReAct dentro de ScienceWorld, un entorno de simulación científica basado en texto. Lo publica el usuario de HuggingFace SeanWang0027 como parte de un estudio comparativo entre ajuste supervisado (SFT) y destilación on-policy multi-turno denominada ROSE, en la que un profesor de mayor capacidad (gpt-5.4-mini, con reasoning_effort=medium) continúa episodios que el alumno ha empezado en el entorno real.

El checkpoint corresponde a la sexta época del estudio (tercera de una continuación iniciada sobre los pesos de la época 3, con estado de AdamW reinicializado) y obtiene un 20,75% ± 1,82 de tasa de éxito sobre el test de ScienceWorld con 200 variaciones de tarea, con un Avg@1 de 0,2946. Para ponerlo en contexto, el Qwen3-1.7B sin ajustar obtiene un 0,12% en la misma evaluación.

Su relevancia no está en el rendimiento absoluto, sino en que documenta con detalle un fenómeno de imitación de un comportamiento espurio del profesor: la plantilla literal `open/close OBJ`, que el simulador rechaza sistemáticamente. Este checkpoint registra una recaída de ese hábito (26,59% de los turnos de test) y una caída de 5,00 puntos respecto a la época 5 (IC 95% [−8,38, −1,75]), lo que lo convierte en un artefacto útil para estudiar la estabilidad de la destilación on-policy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3); el autor no detalla desviaciones respecto al modelo base |
| Parámetros totales | 2.031.739.904 (≈2,03 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No declarada para este ajuste. La evaluación usa 512 tokens por turno y hasta 30 rondas. El modelo base Qwen3-1.7B declara 32.768 tokens nativos |
| Tipos de cuantización | No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ). Pesos en bf16 |
| Idiomas soportados | No disponible en la model card. El entrenamiento y la evaluación se realizan sobre ScienceWorld, un entorno de texto en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño de repositorio: 4,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B sin cambios arquitectónicos declarados. El entrenamiento usa **online multi-turn ROSE**, un esquema de destilación on-policy: en cada episodio el alumno juega los primeros 10 turnos en un entorno ScienceWorld en vivo y, a continuación, el profesor (`gpt-5.4-mini` vía API de OpenAI, con `reasoning_effort=medium`) continúa ese mismo entorno hasta 5 turnos más. Solo los turnos del profesor son objetivos de entrenamiento (entropía cruzada); los turnos del alumno y todas las observaciones se usan únicamente como contexto, y de cada turno del profesor solo se aprovecha su respuesta visible.

La configuración de entrenamiento es: 2.059 variaciones de tarea, 32 episodios por paso, 64 pasos por época, prefijos del alumno y continuaciones del profesor regenerados en cada época, AdamW con learning rate constante de 1e-5, precisión bf16, modo thinking desactivado y 512 tokens por turno. Este checkpoint es el paso 192 de la continuación y se inicializó desde los pesos de la época 3 del run original con un estado de AdamW nuevo (no se había guardado el estado del optimizador).

El formato de prompt es ReAct estricto: la instrucción de ScienceWorld de AgentGym como turno de usuario, un acuse de recibo canónico del asistente y un turno de usuario por cada observación. El modelo responde con `Thought:\n...\n\nAction:\n<un comando>`. La renderización debe hacerse con la plantilla de chat de Qwen3 y `enable_thinking=False`.

## Capacidades

- Generación de acciones de agente en formato ReAct (bloques `Thought:` seguidos de `Action:`) para el entorno ScienceWorld.
- Juego multi-turno en un simulador textual: interpreta observaciones sucesivas y mantiene coherencia de estado a lo largo de hasta 30 rondas.
- Resolución de tareas científicas procedimentales de ScienceWorld (manipulación de objetos, medición, experimentos con sustancias y dispositivos del simulador).
- Razonamiento encadenado de un solo paso explícito por turno, con presupuesto de 512 tokens por turno.
- Hereda del modelo base las capacidades lingüísticas generales de Qwen3-1.7B, aunque el ajuste no las refuerza ni las evalúa.
- No hay evidencia de soporte de tool calling o function calling en sentido estricto (APIs, JSON schema): el modelo emite comandos textuales del simulador, no llamadas a herramientas externas.
- No hay evidencia de capacidades de visión, audio ni de modo thinking activo; el autor entrena y evalúa con thinking desactivado.
- Capacidades multilingües: no documentadas para este ajuste.

## Casos de uso

- **Referencia de investigación en destilación on-policy**: usar este checkpoint junto con las épocas 2 a 5 del mismo estudio para analizar cómo oscila el hábito `open/close` durante el entrenamiento y cómo se correlaciona con la tasa de éxito. Es exactamente el uso para el que se publicó.
- **Evaluación de agentes ReAct en entornos textuales**: emplearlo como baseline de un modelo de 2 B en ScienceWorld con el protocolo declarado (200 variaciones, temperatura 0,4, 512 tokens por turno, máximo 30 rondas), lo que permite comparar otras estrategias de destilación o RL con una referencia reproducible.
- **Punto de partida para continuar el entrenamiento**: al estar inicializado desde la época 3 con optimizador nuevo, sirve como semilla documentada para reanudar ROSE, cambiar de profesor o probar regularización contra la plantilla `open/close`.
- **Auditoría de fidelidad de profesores en destilación**: el modelo evidencia cuánto del comportamiento del profesor se transfiere al alumno, incluidos sus defectos (el profesor usa la plantilla `open/close OBJ` literal en el 29,89% de sus propios turnos y el simulador la rechaza siempre).
- **Generación de rollouts sintéticos para entornos educativos de ciencias basados en texto**: los episodios generados pueden usarse como datos de entrenamiento o como trazas para analizar estrategias de resolución de problemas, siempre con revisión humana y asumiendo la tasa de éxito del 20,75%.
- **Estudio de robustez ante revisiones del entorno**: permite medir la degradación del agente cuando cambian mensajes de error del simulador o el conjunto de acciones válidas, algo relevante para pipelines de agentes reales.
- **Docencia e investigación en agentes LLM**: por su tamaño (2,03 B) se puede ejecutar y depurar en una GPU de consumo, lo que facilita su uso en cursos y laboratorios sobre agentes y aprendizaje por imitación.
- **Ablación de presupuesto de cómputo por turno**: replicar el protocolo con 256 o 1.024 tokens por turno para medir el impacto del límite de generación en la tasa de éxito final.

## Benchmarks y rendimiento

Todos los datos proceden del propio estudio del autor sobre el test de ScienceWorld (200 variaciones de tarea). Cada valor es la media ± desviación estándar de 4 pasadas independientes a temperatura 0,4, 512 tokens por turno, máximo 30 rondas, thinking desactivado y sin turno de sistema. Éxito = puntuación final 100; Avg@1 = puntuación final media / 100.

| Método | Época | Tasa de éxito (media de 4 pasadas) | Avg@1 | Turnos con la plantilla literal `open/close …` |
|---|---|---|---|---|
| Qwen3-1.7B base | — | 0,12% | — | — |
| SFT | 1 | no evaluado | — | — |
| SFT | 2 | 13,25% ± 2,56 | 0,1574 | 74,20% |
| SFT | 3 | 12,88% ± 1,24 | 0,1557 | 74,88% |
| ROSE 10+5 | 1 | no evaluado | — | — |
| ROSE 10+5 | 2 | 7,75% ± 1,92 | 0,1455 | 62,68% |
| ROSE 10+5 | 3 | 17,50% ± 2,29 (repetición: 15,38% ± 1,43) | 0,2942 (0,2512) | 35,22% |
| ROSE 10+5 | 4 | 20,25% ± 2,25 | 0,3433 | 17,98% |
| ROSE 10+5 | 5 | 25,75% ± 1,30 | 0,3692 | 2,77% |
| **ROSE 10+5 (este modelo)** | **6** | **20,75% ± 1,82** | **0,2946** | **26,59%** |

Notas de lectura aportadas por el autor: la diferencia respecto a la época 5 es de −5,00 puntos (IC 95% [−8,38, −1,75]); la reevaluación del checkpoint de la época 3 movió su tasa de éxito de 17,50% a 15,38%, por lo que diferencias inferiores a unos 3 puntos quedan dentro del ruido de evaluación. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- **Pesos**: 2,03 B parámetros en bf16 ≈ 4,1 GB en disco, coherente con el tamaño del repositorio (4,1 GB).
- **VRAM estimada en bf16/fp16**: aproximadamente 5-6 GB con 512-2.048 tokens de contexto, sumando pesos y caché KV. Estimación orientativa, no publicada por el autor.
- **VRAM estimada cuantizado**: alrededor de 2,5 GB en 8 bits y 1,5 GB en 4 bits (estimaciones, ya que no hay cuantizaciones oficiales publicadas).
- **GPU recomendadas**: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En A100, H100 o L40S el modelo queda muy infrautilizado; son adecuadas para servir muchas réplicas concurrentes.
- **GPU de consumo**: sí. Es viable en tarjetas de 8 GB en bf16 con contexto corto y en tarjetas de 6-8 GB con cuantización de 4 bits.
- **Opciones de despliegue**: la librería declarada es `transformers` con `AutoModelForCausalLM` en bf16. El repositorio incluye los tags `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable en TGI y en Inference Endpoints. Al ser arquitectura Qwen3, es compatible con vLLM. Para llama.cpp u Ollama habría que convertir los pesos a GGUF, algo que el autor no publica.
- **Latencia y throughput**: no disponibles. El protocolo de evaluación fija 512 tokens por turno y hasta 30 rondas por episodio, lo que da una cota superior de trabajo por episodio, pero no se publican medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La información disponible solo permite comparar con el modelo base y con los demás checkpoints del mismo estudio. No hay datos publicados de otros modelos de ~2 B ajustados específicamente para ScienceWorld en la información proporcionada.

| Modelo | Parámetros | Contexto | Éxito en ScienceWorld (test, 200 variaciones) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ROSE 10+5, época 6) | 2,03 B | no declarado | 20,75% ± 1,82 | Apache 2.0 | HuggingFace |
| ROSE 10+5, época 5 | 2,03 B | no declarado | 25,75% ± 1,30 | Apache 2.0 | HuggingFace |
| SFT con gpt-5.4-mini, época 3 | 2,03 B | no declarado | 12,88% ± 1,24 | Apache 2.0 | HuggingFace |
| Qwen3-1.7B base | 1,7 B (≈2,03 B en este repo) | 32.768 tokens nativos | 0,12% | Apache 2.0 | HuggingFace |
| Otros modelos de ~2 B para agentes textuales | no disponible | no disponible | no disponible | no disponible | no disponible |

Observación: la época 5 del mismo estudio supera a este checkpoint en 5,00 puntos de tasa de éxito y reduce el hábito `open/close` del 26,59% al 2,77%, por lo que para uso práctico es preferible aquel peso salvo que se busque explícitamente el estado de recaída de la época 6.

## Limitaciones y advertencias

- **Hábito degenerado heredado del profesor**: el 26,59% de los turnos de test emiten la plantilla literal `open/close OBJ`, que el simulador rechaza siempre. Esto consume presupuesto de interacción y explica buena parte de la caída de rendimiento respecto a la época 5.
- **Rendimiento absoluto bajo**: un 20,75% de éxito significa que falla aproximadamente 4 de cada 5 tareas del test. No es apto como sistema autónomo sin supervisión.
- **Ruido de evaluación**: el propio autor documenta que diferencias inferiores a unos 3 puntos porcentuales están dentro del ruido de evaluación (4 pasadas), y que la misma época 3 dio 17,50% y 15,38% en dos evaluaciones.
- **Alcance muy restringido**: es un modelo de agente para un simulador concreto. Fuera del formato ReAct y del conjunto de acciones de ScienceWorld su comportamiento no está caracterizado y degrada rápidamente.
- **Sin datos sobre sesgos**: no se publica ninguna evaluación de sesgos, toxicidad o seguridad. Un modelo de 2 B ajustado con datos destilados de un profesor propietario puede reproducir sesgos de ese profesor.
- **Riesgo de alucinación**: alto en cualquier uso conversacional o de conocimiento general. El ajuste solo optimiza la selección de acciones válidas en el entorno, no la veracidad factual.
- **Idioma**: el entrenamiento se realiza sobre ScienceWorld, un entorno en inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- **Contexto**: la longitud de contexto efectiva no está declarada para este ajuste; el entrenamiento se hizo con 512 tokens por turno, por lo que ventanas mucho mayores no están validadas.
- **Restricciones de licencia**: los pesos se publican bajo Apache 2.0, lo que permite uso comercial. Sin embargo, los datos de entrenamiento derivan de las respuestas de un profesor propietario (`gpt-5.4-mini` vía API de OpenAI); conviene revisar los términos de uso del proveedor antes de explotar comercialmente los pesos destilados.
- **Reproducibilidad**: el checkpoint se inicializó desde un estado de pesos intermedio con el optimizador reinicializado, y el autor no publica el estado de AdamW, lo que dificulta reproducir exactamente la trayectoria de entrenamiento.
- **Dependencia de la API del profesor**: la receta completa (ROSE con `gpt-5.4-mini`) requiere acceso a un modelo propietario, de modo que no es un pipeline enteramente abierto.
- **Estado del repositorio**: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep6
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint ROSE 10+5, época 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep1
- Checkpoint ROSE 10+5, época 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep2
- Checkpoint ROSE 10+5, época 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
- Checkpoint ROSE 10+5, época 4: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep4
- Checkpoint ROSE 10+5, época 5: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-ep5
- Checkpoint SFT, época 2: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep2
- Checkpoint SFT, época 3: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
- Checkpoint SFT, época 1: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-ep1
- AgentGym (origen de la instrucción de ScienceWorld usada en el prompt): mencionado en la model card, sin URL en la información disponible
- ScienceWorld (entorno de evaluación): mencionado en la model card, sin URL en la información disponible
- La búsqueda web realizada no devolvió resultados relevantes: los enlaces recuperados corresponden a Reddit y a foros de Tesla Motors Club, sin relación con el modelo, por lo que no se incluyen.
