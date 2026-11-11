# Luke-Xing/task57b1k

## Resumen

`Luke-Xing/task57b1k` es una política de control robótico (visión-lenguaje-acción, VLA) publicada para la tarea 57 `sweeping_garage` del BEHAVIOR Challenge 2026. No es un modelo de lenguaje general, sino un fine-tuning del ganador de la edición 2025 del mismo reto (`IliaLarchenko/behavior_submission`), adaptado a los datos de demostración de 2026 y servido con la librería `openpi`. El modelo ejecuta barridos de suciedad en un entorno doméstico simulado con el robot R1Pro sobre OmniGibson / Isaac Sim 5.1.

Arquitectura subyacente: π0.5, un VLA construido sobre PaliGemma (Gemma-2B) con torre visual SigLIP y un *action expert* de tipo Gemma-300M que genera secuencias de acciones mediante flow matching. El contexto efectivo es multimodal (imágenes RGB de cabeza y muñecas más propiocepción de 61 dimensiones), y la salida es una horizonte de acciones de 30 pasos con dimensión 32. El repositorio ocupa 6,5 GB e incluye únicamente pesos de inferencia en formato orbax, no el estado del optimizador.

Su relevancia es acotada pero clara: documenta con detalle reproducible (configs, comandos, etapas de entrenamiento y resultados de evaluación) cómo adaptar un checkpoint ganador a una tarea nueva con recursos de consumo (una sola RTX 5090) y qué fallos aparecen al hacerlo. El rendimiento medido es frágil: 1/10 éxitos en la ejecución oficial y 0/10 en la repetición, con una puntuación media q de 0,10.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA π0.5 (PaliGemma / Gemma-2B + torre SigLIP + action expert Gemma-300M con flow matching) |
| Parámetros totales | no disponible (el action expert entrenable suma ~531M; el backbone Gemma-2B y SigLIP permanecen congelados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 30 pasos; ventana de contexto textual no especificada) |
| Tipos de cuantización | no disponible (pesos de inferencia en orbax; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo no se usa para generación de lenguaje libre; las instrucciones de tarea son fijas) |
| Licencia | Apache-2.0, con aplicación adicional de los Gemma Terms of Use por derivar de π0.5 / PaliGemma |
| Formato de pesos | orbax (`params/`), más `assets/` con estadísticas de normalización y `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `checkpoint_3` de `IliaLarchenko/behavior_submission` (revisión HF `89545bc1b7aa7f2e687bc0032d091f132d715d4e`) y del código `IliaLarchenko/behavior-1k-solution` en el commit `ca556f7`. La arquitectura es la de π0.5: un backbone PaliGemma (Gemma-2B) con torre visual SigLIP que procesa RGB de cabeza y muñecas izquierda y derecha, más propiocepción; la profundidad no se utiliza. Sobre ese backbone se acopla un *action expert* Gemma de ~300M parámetros que produce acciones mediante *correlated flow noise* (β = 0,5), con horizonte de acción 30, dimensión de acción 32, pérdida auxiliar FAST (peso 0,05), pérdida de subtarea (peso 0,1) y normalización por marca temporal.

El fine-tuning se hizo en tres etapas encadenadas, todas con batch 32, scheduler coseno con warmup, sin EMA, y reutilizando las estadísticas de normalización y el tokenizador FAST del checkpoint base. La torre SigLIP y el backbone PaliGemma permanecen congelados en las tres etapas: (1) LoRA sobre ambas torres Gemma más cabezas pequeñas (embeddings de tarea/etapa, fusión, `kv_transform`, proyecciones de acción y tiempo), 12.000 pasos con LR 5e-5 → 5e-6 y pérdida final ~0,14; (2) continuación con el mismo conjunto entrenable, 8.000 pasos con LR 2e-5 → 2e-6 y pérdida ~0,12; (3) etapa *expert*, 7.500 pasos con LR 2e-5 → 2e-6, que descongela el action expert completo (~531M parámetros) y alcanza pérdida ~0,11. En total, 27.500 pasos sobre una RTX 5090 a ~3,4 s/paso, usando los 200 episodios de `sweeping_garage` (0–199, 894.606 fotogramas a 30 fps) del dataset `behavior-1k/2026-challenge-demos` en formato LeRobot v3.

Los cambios respecto al código de 2025 son relevantes para reproducir: se lee el formato LeRobot v3 de 2026 y el layout de propiocepción de 61 dimensiones; como el modelo de 2025 no tiene *slot* para la tarea 57, esta se entrena y sirve en el *slot* 36 (`clean_a_patio`) para mantener idénticas las formas de todos los parámetros; se anula `base_qvel` del estado, porque en 2026 contiene la velocidad real y cae fuera de la distribución de entrenamiento; el tokenizador FAST se reimplementó con `tokenizers` para transformers 5, dando ids idénticos; y los pesos se restauran con `restore_params` de openpi por requisitos de orbax reciente.

## Capacidades

- Control robótico visomotor para la tarea de barrido de suciedad (`sweeping_garage`) con el robot R1Pro en OmniGibson / Isaac Sim 5.1.
- Política de imitación entrenada por *behavior cloning* sobre demostraciones humanas; no es un modelo de propósito general ni acepta instrucciones arbitrarias en lenguaje natural.
- Entrada multimodal: RGB de cabeza, RGB de muñeca izquierda, RGB de muñeca derecha y vector de propiocepción de 61 dimensiones. Sin profundidad.
- Salida de acciones de horizonte 30 y dimensión 32, con normalización por marca temporal.
- Soporte de *torso cap* en el servidor de inferencia: limita los comandos de las articulaciones del tronco al rango observado en las demostraciones.
- No dispone de *tool calling*, *function calling*, razonamiento multi-paso explícito, modo *thinking*, audio ni generación de texto libre.
- Multilingüismo: no aplica; el modelo no procesa lenguaje natural abierto.

## Casos de uso

- Reproducción de la tarea 57 del BEHAVIOR Challenge 2026: sirve como política de referencia para evaluar `sweeping_garage` con el protocolo oficial (instancias públicas 0–9, escenas 301–310, 1 rollout, timeout de 6.709 pasos, `RGBDFullResWrapper`, torso cap activado).
- Punto de partida para fine-tuning en tareas nuevas: las tres configuraciones (`pi_behavior_sweep_lora`, `pi_behavior_sweep_lora_cont`, `pi_behavior_sweep_expert`) y los comandos exactos permiten replicar el pipeline sobre otros *slots* del checkpoint ganador de 2025.
- Estudio de adaptación de dominio entre ediciones del reto: el modelo documenta explícitamente los cambios de layout de propiocepción (61 dimensiones en 2026 frente a 2025), el problema de `base_qvel` y la reasignación de *slots*, útiles para quien migre políticas entre años.
- Investigación sobre estabilidad de políticas VLA: los resultados 1/10 y 0/10 con ajustes idénticos permiten estudiar la varianza del simulador y la fragilidad de las políticas de imitación.
- Referencia metodológica para entrenamiento con recursos de consumo: 27.500 pasos en una RTX 5090 a 3,4 s/paso con backbone congelado y LoRA más un *expert* descongelado en la última etapa.
- Evaluación de *torso cap* como salvaguarda de control: el autor documenta que sin el límite el modelo inclina el tronco hacia atrás y mira al techo, lo que convierte al modelo en un caso concreto para estudiar restricciones de seguridad en comandos articulares.
- Integración en pipelines de evaluación automatizada: el servidor `scripts/serve_b1k_2026.py` expone la política en un puerto y mapea el id de tarea 57 al *slot* 36, lo que facilita conectarla a arneses de evaluación propios.

## Benchmarks y rendimiento

Evaluación con el protocolo oficial del BEHAVIOR Challenge 2026 (instancias públicas 0–9, escenas 301–310, 1 rollout por instancia, timeout por defecto de 6.709 pasos, `RGBDFullResWrapper`, torso cap activado):

| Ejecución | Éxitos | q-score medio | Suciedad restante media |
|---|---|---|---|
| Ejecución oficial (enviada) | 1/10 (instancia 310, 5.552 pasos) | 0,10 | 0,73 |
| Repetición con ajustes idénticos | 0/10 | 0,00 | 0,86 |

La "suciedad restante" es la fracción de las ~25 partículas de suciedad que siguen en el suelo al terminar; proviene de un *hook* de registro del autor y no afecta a la puntuación. El autor advierte que el simulador no es determinista entre ejecuciones y que el 1/10 debe considerarse frágil. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables a este tipo de modelo.

## Requisitos de hardware

- Entrenamiento documentado: 1× RTX 5090, ~3,4 s/paso con batch 32, `XLA_PYTHON_CLIENT_MEM_FRACTION=0.92`. El repositorio pesa 6,5 GB, lo que da una idea del orden de magnitud de los pesos de inferencia.
- VRAM de inferencia: no disponible de forma explícita; el backbone Gemma-2B más SigLIP y el action expert de ~531M implican varios GB en precisión nativa, aunque el autor no publica la cifra.
- GPU recomendadas: no disponible. El único hardware citado es la RTX 5090 para entrenamiento; no se documenta el hardware de servicio ni el rendimiento en A100, H100 u otras.
- Despliegue: servidor propio de openpi mediante `PYTHONPATH=src python scripts/serve_b1k_2026.py --policy-dir <repo> --config pi_behavior_sweep_expert --port 8000`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no encajan con un formato orbax de política VLA.
- Latencia y throughput: no disponibles. Solo se conoce el coste de entrenamiento (3,4 s/paso).
- Requisito de entorno: OmniGibson / Isaac Sim 5.1 para la simulación, y el código de `IliaLarchenko/behavior-1k-solution` con los cambios descritos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Luke-Xing/task57b1k` (este) | VLA π0.5 fine-tuneado | ~531M entrenables en la etapa 3; backbone Gemma-2B congelado | no disponible | 1/10 éxitos, q 0,10 (oficial); 0/10 en repetición | Apache-2.0 + Gemma Terms | Hugging Face, 0 descargas, 0 likes |
| `IliaLarchenko/behavior_submission` | VLA π0.5, ganador BEHAVIOR 2025 | no disponible | no disponible | 1.er puesto en el reto 2025 (sin cifras en esta ficha) | Apache-2.0 (según el modelo derivado) | Hugging Face, checkpoint base |
| π0.5 (modelo original) | VLA generalista | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, por lo que la comparación se limita a linaje, licencia y disponibilidad.

## Limitaciones y advertencias

- Rendimiento frágil y no reproducible: 1/10 en la ejecución oficial y 0/10 en la repetición con ajustes idénticos; el propio autor califica el resultado de frágil por la no determinación del simulador.
- Especialización extrema: solo resuelve `sweeping_garage`; no es un modelo de lenguaje ni un VLA generalista reutilizable fuera de esa tarea sin nuevo fine-tuning.
- Truco de *slot*: la tarea 57 se entrena y sirve en el *slot* 36 (`clean_a_patio`), lo que mezcla semántica de tareas y puede confundir a quien inspeccione los pesos sin leer la model card.
- Modificación de la propiocepción: `base_qvel` se anula porque en 2026 contiene velocidad real fuera de distribución; cualquier reutilización con datos de 2025 o con otro layout puede romper la política.
- Dependencia del *torso cap*: sin él, el modelo inclina el tronco hacia atrás y mira al techo; el límite es una muleta de seguridad, no una capacidad aprendida.
- Las "eval tricks" por tarea de 2025 están desactivadas porque las reglas del *slot* 36 forzarían ambas pinzas abiertas; no se debe asumir paridad con la solución original.
- Sin profundidad: la política usa solo RGB y propiocepción, lo que limita su robustez ante oclusiones o cambios de iluminación no vistos en las demostraciones.
- Idiomas y sesgos: no disponibles; el modelo no procesa lenguaje natural, por lo que los sesgos lingüísticos no aplican, pero los sesgos de las demostraciones (escenas, posiciones iniciales, distribución de la suciedad) sí condicionan el comportamiento.
- Licencia: Apache-2.0 en el modelo base, pero al derivar de π0.5 / PaliGemma se aplican también los Gemma Terms of Use; conviene revisarlos antes de uso comercial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento.
- Configuraciones con rutas absolutas de pod (`_WINNER_CKPT`, raíz de datos, `params` de inicialización de cada etapa): hay que editarlas antes de reutilizarlas.
- No se incluye el estado del optimizador (`train_state/`), por lo que no se puede reanudar el entrenamiento tal cual desde este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Luke-Xing/task57b1k
- Modelo base (ganador BEHAVIOR 2025): https://huggingface.co/IliaLarchenko/behavior_submission
- Código de la solución base: https://github.com/IliaLarchenko/behavior-1k-solution
- Dataset de demostraciones: https://huggingface.co/datasets/behavior-1k/2026-challenge-demos
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
