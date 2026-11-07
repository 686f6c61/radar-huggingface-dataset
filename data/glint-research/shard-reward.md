# Glint-Research/Shard-Reward

## Resumen

Shard-Reward es un modelo de recompensa (reward model) de 49,4 millones de parámetros desarrollado por Glint-Research. Se trata de una cabeza escalar añadida sobre el modelo de lenguaje Shard-2 y ajustada sobre 282.062 comparaciones de preferencia procedentes de cinco conjuntos de datos de RLHF. Su función es leer una conversación y devolver un único número para la respuesta final: cuanto mayor sea el valor, más probable era que esa respuesta fuese la preferida en los datos de entrenamiento.

El modelo resulta relevante por su tamaño reducido (fichero de 198 MB) y por su enfoque de evaluación transparente: el autor publica métricas medidas localmente contra el fichero distribuido, incluyendo comparaciones frente a una línea base de verosimilitud de tokens del propio backbone. Sobre el conjunto de validación retenido, Shard-Reward acierta el 66,2 % de las veces al ordenar la respuesta preferida en primer lugar, frente al 55,9 % del backbone Shard-2 puntuando por verosimilitud, lo que supone una mejora de unos diez puntos atribuible a la cabeza de recompensa.

La arquitectura subyacente es un transformer de 20 capas y 8 cabezas de 64 dimensiones, con atención de ventana deslizante de 256 tokens y capas globales en las posiciones 1, 7, 13 y 19. El contexto máximo es de 768 tokens y el vocabulario de 4.096 tokens con BPE a nivel de byte. La licencia es MIT y el modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Shard-2) con cabeza escalar Bradley-Terry |
| Parametros totales | 49.409.538 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 768 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (fichero de modelo de 198 MB; `infer.py` usa torch y tokenizers) |

## Arquitectura y entrenamiento

Shard-Reward es una cabeza escalar de recompensa montada sobre Shard-2, un transformer de 20 capas con 8 cabezas de 64 dimensiones. La atención combina ventana deslizante de 256 tokens con capas globales en las posiciones 1, 7, 13 y 19. El vocabulario es de 4.096 tokens con BPE a nivel de byte (pad 0, bos 1, eos 2) y la ventana de contexto es de 768 tokens. La salida es un escalar no calibrado por respuesta, propio de un esquema Bradley-Terry sobre una pila preentrenada.

El entrenamiento consistió en una sola pasada sobre 282.062 comparaciones de preferencia agregadas de cinco conjuntos de datos (UltraFeedback, OpenAssistant, SHP-2, Anthropic HH-RLHF y NVIDIA HelpSteer2). El checkpoint distribuido corresponde al paso 15.421 de 17.628. Para la evaluación se reservaron 2.000 comparaciones por fuente, eliminadas antes del entrenamiento y con sus prompts bloqueados. El autor indica que todas las métricas se midieron en su máquina contra el fichero distribuido con `scripts/eval_reward_release.py`, sin citar leaderboards externos.

## Capacidades

- Puntuación de respuestas: devuelve un escalar por respuesta final dada una conversación (`score`).
- Comparación por pares: ordena dos respuestas a un mismo prompt (`compare`), devolviendo cuál es mejor y las puntuaciones.
- Ranking de candidatos: ordena una lista de respuestas de mejor a peor (`rank`) y puntúa lotes (`score_many`).
- Evaluación por lotes: procesa ficheros JSONL de pares (`--pairs`).
- Construcción manual de historial multi-turno: admite contexto previo con formato `User: ...\n\nAssistant: ...`.
- Solo inglés: no declara capacidades multilingües.
- No es un modelo generativo: no produce texto, únicamente puntuaciones de preferencia.
- No dispone de tool calling, function calling ni capacidades de agente.

## Casos de uso

- Filtrado de candidatos en pipelines de RLHF: dado un prompt y varias respuestas generadas por un modelo, Shard-Reward permite ordenarlas por preferencia y seleccionar las top-k. Es adecuado por su bajo coste computacional (49,4 M de parámetros) y su API de ranking por lotes.
- Selección de respuesta en producción (best-of-n): generar n respuestas con un modelo generativo y elegir la mejor según la puntuación del reward model. El autor advierte que debe rankearse por prompt y no aplicar umbrales absolutos sobre el escalar.
- Evaluación automática de calidad conversacional: comparar pares de respuestas para medir regresiones entre versiones de un asistente, usando la tasa de acierto en preferencia como métrica.
- Anotación asistida de datos de preferencia: preordenar pares para que anotadores humanos revisen primero los casos ambiguos, reduciendo coste de etiquetado.
- Investigación en métodos de recompensa: servir como línea base ligera para comparar cabezas de recompensa frente a verosimilitud de tokens del backbone (el propio autor publica esa comparación).
- Prototipado educativo y experimental: al requerir solo torch y tokenizers y llevar su propia copia de la arquitectura, permite experimentar con reward models sin infraestructura adicional.
- No recomendado para: tareas de sumarización con documento fuente (ventana de 768 tokens sin documento) ni para juicios globales de calidad donde la verosimilitud del backbone supera a la cabeza (ver benchmarks).

## Benchmarks y rendimiento

Resultados medidos por el autor sobre la porción retenida (2.000 comparaciones por fuente). La precisión solo cuenta como acierto cuando la respuesta elegida puntúa estrictamente más alto; los empates cuentan como fallo.

| Fuente | Shard-Reward | Verosimilitud Shard-2 |
|---|---|---|
| UltraFeedback | 71,75 | 54,50 |
| OpenAssistant | 70,65 | 67,65 |
| SHP-2 | 66,20 | 55,15 |
| Anthropic HH-RLHF | 63,95 | 53,65 |
| NVIDIA HelpSteer2 | 58,45 | 48,75 |
| Media no ponderada | 66,20 | 55,94 |

Suites adicionales (incluye nueve suites de `allenai/preference-test-sets` no vistas en entrenamiento):

| Suite | Shard-Reward | Verosimilitud Shard-2 | Comparaciones |
|---|---|---|---|
| MTBench, juez GPT-4 | 75,95 | 38,96 | 2.374 |
| Preference sets, SHP | 70,35 | 57,98 | 1.730 |
| UltraFeedback test | 66,91 | 49,63 | 1.886 |
| Anthropic HH-RLHF test | 66,10 | 51,73 | 4.000 |
| MTBench, juez humano | 65,26 | 46,30 | 3.322 |
| Anthropic helpful | 64,81 | 56,06 | 3.887 |
| SHP-2 test | 64,50 | 54,77 | 4.000 |
| Anthropic harmless | 64,47 | 46,78 | 2.187 |
| Anthropic HHH | 64,38 | 61,19 | 219 |
| PKU safer | 55,92 | 47,77 | 3.975 |
| PKU better | 52,73 | 61,74 | 3.975 |
| Summarize | 53,22 | 53,75 | 4.000 |
| Media no ponderada | 63,72 | 52,22 | |

Sondas manuales: de trece prompts escritos a mano (cada uno con una respuesta correcta y otra incorrecta), Shard-Reward solo acierta en uno de los cuatro casos publicados en la model card (receta de pan); falla en la limerick sobre un gato, la suma del ciclo del agua en una frase y la capital de Francia. El autor califica estos fallos de sistemáticos y no aleatorios.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de modelo ocupa 198 MB; en FP32 los 49,4 M de parámetros requieren aproximadamente 200 MB, y en FP16 unos 100 MB. La memoria total en ejecución es mínima.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Cabe en GPUs integradas y en CPU.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos 1 GB de VRAM libre (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: el repositorio incluye `infer.py`, que solo depende de torch y tokenizers y lleva su propia copia de la arquitectura. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables de recompensa en la información proporcionada. La única referencia cuantitativa disponible es la línea base de verosimilitud del backbone Shard-2, ya incluida en las tablas de benchmarks.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Shard-Reward | 49,4 M | 768 tokens | MIT | Hugging Face (Glint-Research) |
| Shard-2 (backbone, línea base) | no disponible | 768 tokens | no disponible | Hugging Face (colección Shard) |
| Alternativas de reward model | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La puntuación es una diferencia no calibrada, no una probabilidad ni un umbral. Un `+0,5` en dos prompts distintos no significa lo mismo; el autor recomienda rankear por prompt y tomar el top-k en lugar de aplicar cortes absolutos.
- Rendimiento débil en sondas manuales: falla en casos elementales (capital de Francia, limerick, resumen en una frase) y los fallos son sistemáticos, no aleatorios.
- Pérdida frente a la línea base en PKU better (52,73 frente a 61,74): la cabeza parece haber aprendido una preferencia superficial que no generaliza a juicios globales de calidad.
- Sumarización: resultado prácticamente nulo (53,22 frente a 53,75); la ventana de 768 tokens y la ausencia de documento fuente dificultan representar la fidelidad al original.
- Ventana de contexto limitada a 768 tokens, insuficiente para conversaciones largas o documentos extensos.
- Solo inglés; no se declara soporte multilingüe.
- Riesgo de sesgo: entrenado sobre cinco datasets de preferencia con posibles sesgos de anotadores y de composición; no se documentan análisis de sesgo.
- Riesgo de alucinación en la puntuación: al ser un escalar no calibrado, puede ordenar mal respuestas plausibles pero incorrectas, como evidencian las sondas manuales.
- Licencia MIT: permite uso comercial, pero el autor advierte explícitamente de leer las secciones de sondas y límites antes de desplegar.
- Checkpoint no final: distribuido desde el paso 15.421 de 17.628, no desde el final del entrenamiento.
- Sin datos publicados de latencia, throughput ni soporte de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Glint-Research/Shard-Reward
- Colección Shard series: https://huggingface.co/collections/Glint-Research/shard-series
- Shard-1 en Hugging Face: https://huggingface.co/Glint-Research/Shard-1
