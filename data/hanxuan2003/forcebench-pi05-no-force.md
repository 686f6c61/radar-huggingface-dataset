# hanxuan2003/ForceBench-Pi05-No-Force

## Resumen

ForceBench-Pi05-No-Force es un repositorio de checkpoints de inferencia del modelo vision-language-action π₀.₅ (pi0.5) afinados para ocho tareas de manipulación robótica dentro del benchmark ForceBench. Lo publica el usuario hanxuan2003 y corresponde a la variante denominada F0, es decir, políticas afinadas sin entrada de fuerza (sin señal táctil o de par), a diferencia de las seis variantes de fusión de fuerza que se publican por separado. No se trata de los pesos fundacionales originales de pi05_base, sino de ocho políticas especializadas, una por tarea.

El modelo aborda el problema de evaluar políticas robóticas en tareas que requieren contacto físico preciso (enroscar una tuerca, girar un grifo, pulsar un mando de cocina, ordenar pesos por centro de masas). Cada checkpoint se ha entrenado y evaluado con un protocolo fijo (semillas 300–499, 200 ensayos por tarea) y los resultados de referencia proceden del manuscrito enviado a ICRA que acompaña al benchmark.

La relevancia actual es metodológica: el repositorio documenta de forma explícita la procedencia de los datos, los hashes de payload, las anclas de normalización originales y las limitaciones de reproducibilidad. No se reclaman nuevas ejecuciones ni reproducción extremo a extremo; las tasas mostradas son los valores agregados del manuscrito original. El repositorio pesa 99,5 GB y los pesos se distribuyen en formato Orbax/OCDBT sobre JAX, no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en la familia pi0.5 (PaliGemma/Gemma), política de inferencia |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precisión original Orbax) |
| Idiomas soportados | en |
| Licencia | gemma (términos Gemma/PaliGemma; código ForceBench bajo MIT y OpenPI bajo Apache, licencias separadas) |
| Formato de pesos | Orbax/OCDBT (directorios de checkpoint con `params/`, `assets/` y `_CHECKPOINT_METADATA`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la familia pi0.5, un modelo vision-language-action construido sobre PaliGemma/Gemma que combina percepción visual y comprensión de lenguaje para producir acciones robóticas. En este repositorio, la variante F0 corresponde a políticas afinadas por tarea sin entrada de fuerza: el modelo recibe observaciones visuales y contexto de la tarea, pero no señal de par o fuerza, que sí incorporan las seis variantes de fusión de fuerza publicadas aparte.

El entrenamiento parte de los pesos fundacionales pi05_base y se afina de forma independiente para cada una de las ocho tareas (Weight Sort, CoM Sort, Faucet Turn, Faucet Direction, Stove Turn, Stove Press, Drawer Pull y Nut Thread). El repositorio no incluye estado del optimizador ni cachés de entrenamiento, solo el payload de inferencia. La evaluación de referencia usa las semillas 300–499 con 200 ensayos por tarea y método. No se proporcionan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles de RLHF/DPO.

## Capacidades

- Control robótico por imitación en tareas de manipulación de precisión: ordenación por peso, ordenación por centro de masas, giro de grifos, accionamiento de mandos de cocina, apertura de cajones y enroscado de tuercas.
- Percepción visual y comprensión de instrucciones en inglés para guiar la política de acción.
- Políticas especializadas por tarea: cada checkpoint resuelve una única tarea, no hay un modelo único multitarea en este release.
- Inferencia en simulación mediante el runtime JAX/Orbax de ForceBench.
- Variante sin fuerza (F0): no consume señal táctil ni de par; las variantes con fusión de fuerza son releases separados.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, matemáticas, generación de código ni modalidades de audio.

## Casos de uso

- Evaluación comparativa de políticas VLA sin señal de fuerza: usar los ocho checkpoints F0 como línea base frente a las variantes de fusión de fuerza en el mismo protocolo (semillas 300–499, 200 ensayos), para medir cuánto aporta la señal táctil en cada tarea.
- Reproducción de resultados del manuscrito ICRA: cargar los checkpoints con el runtime congelado y la normalización original para contrastar las tasas de referencia publicadas (por ejemplo, 54 % en Weight Sort o 31,5 % en Nut Thread).
- Estudio de tareas de contacto preciso: analizar por qué tareas como Stove Press (1 %) o Drawer Pull (4,5 %) son especialmente difíciles sin información de fuerza, y usar esos checkpoints como punto de partida para ablaciones.
- Investigación en manipulación con objetos rígidos: emplear Weight Sort y CoM Sort para estudiar el razonamiento sobre propiedades físicas (masa, centro de masas) a partir de observación visual.
- Desarrollo de pipelines de simulación a realidad: servir los checkpoints en el simulador de ForceBench como referencia antes de transferir políticas a hardware, dado que los assets del simulador no se incluyen y deben obtenerse aparte.
- Auditoría de procedencia y reproducibilidad: usar PROVENANCE.json, SHA256SUMS y MODIFICATIONS.md para verificar la integridad de los payloads y documentar qué mediciones están verificadas y cuáles dependen de auditorías históricas agregadas.

## Benchmarks y rendimiento

Resultados de referencia del manuscrito ICRA original (200 ensayos por tarea, semillas 300–499), variante F0 sin fuerza:

| Tarea | Checkpoint | Éxitos / 200 | Tasa |
|---|---|---:|---:|
| Weight Sort | `checkpoints/weight_sort/9999` | 108 | 54 % |
| CoM Sort | `checkpoints/rattle_sort/9999` | 91 | 45,5 % |
| Faucet Turn | `checkpoints/faucet_turn/9999` | 19 | 9,5 % |
| Faucet Direction | `checkpoints/faucet_force_turn/9999` | 63 | 31,5 % |
| Stove Turn | `checkpoints/stove_turn_on/9999` | 17 | 8,5 % |
| Stove Press | `checkpoints/stove_press_turn/9999` | 2 | 1 % |
| Drawer Pull | `checkpoints/radmanso_drawer_sort_table/9999` | 9 | 4,5 % |
| Nut Thread | `checkpoints/nut_thread/9999` | 63 | 31,5 % |

Advertencia del autor: para Faucet Direction debe usarse el `summary.success_report` guardado, copiando `outcome.criteria` y sustituyendo solo la condición de ángulo final por la regla de cota inferior; no debe usarse `final_success_report` ni el éxito en cualquier fotograma. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio completo ocupa 99,5 GB, pero ese tamaño incluye los ocho checkpoints y metadatos; el consumo en memoria de un único checkpoint no se especifica.
- GPU recomendadas: no disponible. El runtime es JAX/Orbax, por lo que se requiere una GPU compatible con JAX (típicamente NVIDIA con CUDA); no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: runtime congelado de ForceBench sobre JAX/Orbax. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje y los pesos no están en GGUF ni safetensors.
- Latencia y throughput: no disponible.
- Requisito crítico: se necesita un runtime y configuración congelados coincidentes, el tokenizer original y la normalización original. La compatibilidad con loaders públicos de estos ficheros históricos no ha sido validada; el autor advierte de no fabricar recibos portables ni eliminar las protecciones de identidad para forzar la carga.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada de fuerza | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForceBench-Pi05-No-Force (F0) | VLA pi0.5 afinado | No | 8 especializadas | gemma | Hugging Face, Orbax |
| Variantes de fusión de fuerza de ForceBench | VLA pi0.5 afinado | Sí (6 variantes) | Por tarea | gemma | Releases separados |
| pi05_base (fundacional) | VLA pi0.5 base | No | Multitarea general | gemma | Pesos fundacionales originales |

No se dispone en la información proporcionada de comparaciones numéricas con otros modelos VLA de terceros (por ejemplo, OpenVLA u otros) ni de sus especificaciones de parámetros o contexto.

## Limitaciones y advertencias

- Políticas especializadas: cada checkpoint resuelve una sola tarea; no hay un modelo único que cubra las ocho tareas.
- Tasas de éxito bajas en varias tareas: Stove Press (1 %), Drawer Pull (4,5 %), Stove Turn (8,5 %) y Faucet Turn (9,5 %) indican que la variante sin fuerza es insuficiente para tareas de contacto preciso, lo que debe tenerse en cuenta antes de usar estos checkpoints en producción.
- Evidencia histórica parcial: algunos resultados dependen de auditorías agregadas e índices históricos retenidos; no se dispone de hashes de shard completos para todos los checkpoints. Las tasas mostradas son valores del manuscrito, sin nuevas ejecuciones ni reproducción extremo a extremo.
- Carga no validada: la compatibilidad con loaders públicos de estos ficheros históricos no ha sido validada; se requiere runtime, tokenizer y normalización originales.
- Restricciones de licencia: los términos Gemma/PaliGemma aplican al modelo base y se conservan en LICENSES.md, LICENSE_GEMMA.txt, LICENSE_GEMMA_CURRENT.md y NOTICE; son distintos de las licencias de código ForceBench (MIT) y OpenPI (Apache). Deben revisarse antes de cualquier uso comercial.
- Idiomas: solo inglés (en).
- Datos no incluidos: datasets, ficheros de tokenizer y assets del simulador no se incluyen en el repositorio.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de acción robótica, los fallos se manifiestan como ejecuciones fallidas de la tarea más que como texto incorrecto.
- Sin datos de parámetros, contexto ni cuantización: no es posible estimar requisitos de memoria por checkpoint a partir de la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hanxuan2003/ForceBench-Pi05-No-Force
- Código fuente de ForceBench (revisión inspeccionada): https://github.com/forcebench-platform/ForceBench/tree/31acf7353d2f723985e6576a5708f67a81707d61
- Documentación de la familia pi0.5 (identificador de método F0): https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/baselines/pi05/README.md
- Resultados congelados del paper: https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/results/paper_reference.json
- Protocolo del paper: https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/configs/paper_protocol.json
- Ficheros de procedencia y licencia en el repo: PROVENANCE.json, SHA256SUMS, RUNTIME.md, RELEASE_SCOPE.md, MODIFICATIONS.md, LICENSES.md, LICENSE_GEMMA.txt, LICENSE_GEMMA_CURRENT.md, NOTICE
