# rooty2020/r2s-baseline-agentic-rsr

## Resumen

El modelo `rooty2020/r2s-baseline-agentic-rsr` es un conjunto de políticas VLA (vision-language-action) publicadas como baseline para una comparación real-to-sim-to-real en robótica. Lo desarrolla el usuario `rooty2020` y no es un modelo de lenguaje al uso, sino un paquete de estudiantes (policies) entrenados sobre demostraciones generadas por un profesor sintético construido al estilo del método "Agentic RSR" descrito en arXiv 2610.10479. La relevancia es metodológica: sirve como referencia reproducible para evaluar pipelines de generación automática de datos de entrenamiento robótico.

Los estudiantes son dos políticas VLA conocidas: GR00T N1.5 (NVIDIA, aproximadamente 3B parámetros según el identificador `nvidia/GR00T-N1.5-3B`) y pi0.5 (openpi). Ambos se entrenan sobre demostraciones renderizadas en un simulador propio ("Sim R0") a partir de un programa Python `solve(view) -> Plan` desarrollado en tres pasadas con un LLM. El repositorio pesa 15,2 GB y contiene pesos en formato safetensors junto con artefactos de evaluación.

La model card es fundamentalmente un registro experimental: buena parte de las celdas de resultados están pendientes o vacías, y el entrenamiento de pi0.5 figura como "pending" en varias tareas. Por tanto, debe interpretarse como material de investigación en curso, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action); estudiantes GR00T N1.5 y pi0.5 |
| Parametros totales | GR00T N1.5: ~3B (según `nvidia/GR00T-N1.5-3B`); pi0.5: no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 15,2 GB) |

## Arquitectura y entrenamiento

El pipeline descrito en la model card opera por tarea. Se parte de una demostración teleoperada y de la calibración de cámara y escena. Sobre un simulador propio (Sim R0, protocolo 261107, semilla `sim_init` 0 con mundo pseudo y perturbación uniforme) se construye un profesor en forma de programa Python `solve(view) -> Plan`, desarrollado en tres pasadas de LLM: vista privilegiada sobre escena nominal, vista visual (estimación ruidosa) sobre escena nominal y vista visual sobre 8 escenas aleatorizadas (±5 mm y ±3 grados en poses de objetos, con offsets articulares). Cada pasada recibe retroalimentación por escena (resultado del checker y motivo de filtrado de la demo).

Las demostraciones finales se renderizan con las cámaras de la tarea sobre escenas nuevas y solo se conservan los rollouts que pasan el checker y el filtro de demos, hasta un máximo de 320 (probando como mucho 1280 escenas). Los estudiantes se entrenan en una sola ronda con esas demos, 30.000 pasos y batch 64 (presupuesto 15k + 3×5k). GR00T N1.5 usa learning rate 1e-4 y pi0.5 usa 1e-5. La evaluación sigue un protocolo sim2sim con 96 escenas nuevas en el mundo pseudo (nunca vistas por el método) más episodios de validación con inicios medidos en el mundo pseudo y en el mundo del método.

## Capacidades

- Ejecución de políticas robóticas de manipulación (pick-and-place, manipulación de toallas, uso de air fryer) en entornos simulados.
- Control visuomotor a partir de observaciones de cámara y estado de la escena, propio de arquitecturas VLA.
- Generación automática de datos de entrenamiento mediante un profesor sintético basado en LLM (programa `solve(view) -> Plan`).
- Evaluación reproducible sim2sim con conjuntos de escenas fijados y métricas de éxito por tarea.
- Registro de coste de LLM por tarea (entre 4,06 y 7,46 dólares en los casos reportados).
- Soporte de dos backends de estudiante intercambiables (GR00T N1.5 y pi0.5) bajo el mismo pipeline.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modalidades de audio.

## Casos de uso

- Investigación en real-to-sim-to-real: usar el paquete como baseline reproducible para comparar un método propio contra estudiantes entrenados con demos generadas por profesor LLM, fijando las mismas 96 escenas de evaluación.
- Generación automática de datasets robóticos: replicar el pipeline de tres pasadas del profesor para producir hasta 320 demos filtradas por tarea a partir de una sola demostración teleoperada.
- Evaluación de políticas VLA: comparar GR00T N1.5 y pi0.5 bajo idéntico presupuesto de entrenamiento (30.000 pasos, batch 64) y mismas demos, aislando el efecto del backbone.
- Estudio de robustez a perturbaciones: las escenas aleatorizadas (±5 mm, ±3 grados) permiten medir la degradación de la política ante ruido de pose y offsets articulares.
- Análisis de coste de datos sintéticos: el registro de coste LLM por tarea (4,06-7,46 USD) facilita estimar el coste de escalar el pipeline a nuevas tareas.
- Docencia y reproducción de métodos: el repositorio incluye `baseline.json` con las tres pasadas, demos, coste y código fuente del programa final, lo que permite auditar paso a paso cómo se generó cada política.
- Benchmarking de simuladores: la distancia de mundo reportada (0,306; 0,417; 0,404; 0,398 según tarea) sirve para comparar variantes de Sim R0.

## Benchmarks y rendimiento

Resultados reportados en la model card (protocolo sim2sim, conjunto D de 96 escenas):

| Tarea | Estudiante | Entrenamiento | Set D (pseudo) | Val starts (pseudo) | Val starts (mundo del método) |
|---|---|---|---|---|---|
| straw | pi05 | pendiente | - | - | - |
| straw | groot | pendiente | - | - | - |
| banana_basket | pi05 | - | - | - | - |
| banana_basket | groot | 30.000 pasos, 1,0 h | 65/96 (67,7 %) | 5/16 (31,2 %) | 10/16 (62,5 %) |
| towel | pi05 | - | - | - | - |
| towel | groot | 30.000 pasos, 0,6 h | 21/96 (21,9 %) | - | - |
| air_fryer | pi05 | 30.000 pasos, 0,1 h | - | - | - |
| air_fryer | groot | - | - | - | - |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card. Como referencia, GR00T N1.5 figura como modelo de ~3B parámetros; el peso del repositorio completo es de 15,2 GB, lo que incluye pesos de ambos estudiantes y artefactos de evaluación.
- GPU recomendadas: no especificadas por el autor. Para un backbone de ~3B en precisión completa se requiere al menos una GPU de 24 GB; para cuantizaciones de 8 bits o 4 bits cabría en GPUs de consumo de 12-16 GB, aunque no hay datos publicados que lo confirmen.
- Despliegue: no se documentan instrucciones para vLLM, llama.cpp, Ollama o TGI. El layout del repositorio (`<task>/<student>/` con `params/`, `assets/`, `model/`, `policy.json`, `baseline.json`, `world_final.json`, `train_time.json` y `eval/`) sugiere carga mediante los frameworks originales de GR00T y openpi.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r2s-baseline-agentic-rsr (GR00T N1.5 student) | ~3B | no disponible | VLA robótica | Apache 2.0 | Hugging Face |
| r2s-baseline-agentic-rsr (pi0.5 student) | no disponible | no disponible | VLA robótica | Apache 2.0 | Hugging Face |
| nvidia/GR00T-N1.5-3B | ~3B | no disponible | VLA robótica | no disponible en la información | Hugging Face |
| openpi (pi0.5) | no disponible | no disponible | VLA robótica | no disponible en la información | openpi |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card indica explícitamente que se trata de una reimplementación del pipeline dentro de un framework propio, no del código original del método Agentic RSR.
- Muchos resultados están pendientes o vacíos: el entrenamiento de pi0.5 figura como "pending" en straw y sin datos en banana_basket, towel y air_fryer; GR00T no tiene resultados en straw ni air_fryer.
- El profesor tuvo éxito limitado en varias tareas (0/1 en straw y air_fryer en las dos primeras pasadas, 1/8 en la tercera pasada de air_fryer), lo que condiciona la calidad y cantidad de demos generadas (101 demos en air_fryer frente a 320 en towel).
- La evaluación se realiza en simulación (sim2sim) sobre un mundo pseudo; no hay validación en hardware real reportada.
- El rendimiento en validación es bajo en algunas tareas: towel alcanza 21/96 (21,9 %) en el conjunto D con GR00T.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido de modelos de lenguaje; las advertencias relevantes son de robustez y generalización en robótica.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en producción y los resultados incompletos desaconsejan su uso fuera de investigación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/rooty2020/r2s-baseline-agentic-rsr
- Paper del método de referencia: https://arxiv.org/abs/2610.10479
- Modelo GR00T N1.5: https://huggingface.co/nvidia/GR00T-N1.5-3B
- openpi (pi0.5): no disponible en la información proporcionada
