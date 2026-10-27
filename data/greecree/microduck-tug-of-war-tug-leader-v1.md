# greecree/microduck-tug-of-war-tug-leader-v1

## Resumen

`microduck-tug-of-war-tug-leader-v1` es una política de control obtenida por aprendizaje por refuerzo para el robot microduck, publicada por el usuario greecree en HuggingFace. No es un modelo de lenguaje: es una política cerrada (*closed-loop*) que se ejecuta a 50 Hz sobre un robot real, recibe observaciones de 61 dimensiones y emite 14 acciones. Su tarea concreta es el juego del tira y afloja (*tug of war*), con un esquema que el autor describe como refinamiento de trayectoria «pit-lip» e impulso del comando de enfrentamiento directo a -0,45 m/s.

El modelo se distribuye como un `policy.onnx` con el normalizador de observaciones embebido (se le deben pasar observaciones en crudo) más un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. Se trata de una política «perpetua»: una vez cargada en una ranura de política del demonio, se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha o *gait*.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline completo de entrenamiento RL en simulación (mjlab, 4096 entornos en paralelo, 1000 iteraciones máximas, semilla 1) y como *baseline* competitivo en una tarea de contacto físico entre robots. El autor reporta un rating de 158,6 cm agregado sobre 5 semillas y un 100 % de victorias en combates directos. La información publicada no incluye arquitectura de red, número de parámetros, licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de control entrenada por RL, exportada a ONNX; no se detalla la topología de la red) |
| Parámetros totales | No disponible (el repositorio ocupa 0,0 GB según HuggingFace) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantización | No disponible (se distribuye un único `policy.onnx`; sin variantes cuantizadas publicadas) |
| Idiomas soportados | No aplica / no disponible (entrada numérica, no lingüística) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Tipo de política | Perpetua (se ejecuta hasta recibir orden de parada) |
| Normalización | Integrada en el ONNX; se alimentan observaciones en crudo |

## Arquitectura y entrenamiento

La información publicada no describe la topología de la red (número de capas, anchuras, tipo de extractor ni función de activación). Lo que sí se detalla es el proceso: la política se entrenó con mjlab sobre la tarea `Mjlab-TugOfWar-MicroDuck`, usando 4096 entornos simulados en paralelo, un máximo de 1000 iteraciones de agente y semilla 1. El checkpoint publicado es el 250, sobre la base `mjlab-microduck 0.1.0` en el commit `981a279c6`, con el código de `microduck-challenges` en el commit `4b675ebf4`.

El autor declara explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: misma receta y misma semilla producen una política comparable, no los mismos pesos. La observación se normaliza dentro del grafo ONNX, lo que elimina una fuente habitual de errores de integración entre simulación y robot. El autor menciona dos componentes de la política: refinamiento de trayectoria «pit-lip» e impulso del comando de enfrentamiento directo a -0,45 m/s, sin detallar su implementación matemática.

## Capacidades

- Control locomotor de ciclo cerrado a 50 Hz para la tarea de tira y afloja sobre microduck.
- Política perpetua: mantiene la marcha indefinidamente hasta que el demonio recibe una orden de parada o cambio de ranura.
- Consumo de observaciones crudas de 61 dimensiones, con normalización embebida en el ONNX.
- Emisión de 14 acciones por paso de control, adecuadas al espacio de actuación del robot.
- Comportamiento competitivo en enfrentamiento directo (*head-to-head*), con un 100 % de victorias reportado por el autor en los combates evaluados.
- Carga directa en el robot mediante `robotctl policy load <slot> ...`, sin reentrenamiento ni conversión adicional.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política motora, no un modelo generativo.

## Casos de uso

- Competición de tira y afloja entre robots: la política se carga en la ranura correspondiente y compite directamente, con la ventaja de un comportamiento de tracción ya validado (rating de 158,6 cm y 100 % de victorias en los combates reportados).
- *Baseline* para investigación en RL robótico: sirve como referencia contra la que comparar políticas propias entrenadas con la misma tarea `Mjlab-TugOfWar-MicroDuck`, reutilizando el mismo pipeline de evaluación.
- Validación de sim-to-real: al incluir la normalización en el ONNX y ejecutarse a 50 Hz, es un candidato directo para medir la brecha entre el entorno mjlab y el robot físico sin capas de adaptación intermedias.
- Pruebas de regresión de infraestructura: útil para verificar que el demonio microduck, el cargador de ranuras y el manifiesto de esquema 2 funcionan de extremo a extremo tras cambios en `robotctl`.
- Generación de datos de sparring: enfrentar esta política contra políticas nuevas permite producir episodios de contacto físico para evaluar robustez frente a oponentes distintos.
- Demostraciones y docencia: ejemplo completo y reproducible de una tarea RL de contacto (definición de entorno, entrenamiento masivo en paralelo y despliegue en hardware) para cursos o talleres de robótica.
- Desarrollo de estrategias de tracción: el comportamiento de «impulso del comando a -0,45 m/s» es un punto de partida para estudiar cómo modificar la consigna afecta a la fuerza ejercida y al resultado del combate.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Rating agregado | 158,6 cm | Media sobre 5 semillas |
| Tasa de victorias en enfrentamiento directo | 100 % | Combates *head-to-head* de la evaluación del autor |
| Comando de enfrentamiento directo | -0,45 m/s | Consigna nominal de la política |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible; no aplican a una política de control motora. Tampoco se publican latencia por paso, *jitter* ni métricas de robustez ante perturbaciones externas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica número de parámetros ni tamaño del grafo; el repositorio completo ocupa 0,0 GB según HuggingFace.
- GPU recomendadas: no disponibles. No hay datos publicados sobre el hardware usado en entrenamiento ni en inferencia.
- GPU de consumo: por el formato (ONNX) y el tamaño del repositorio, es esperable que la inferencia quepa en cualquier GPU de consumo e incluso en CPU, pero es una inferencia del redactor y no un dato confirmado por el autor.
- Despliegue: `policy.onnx` sobre un runtime ONNX (ONNX Runtime u otro compatible) y carga en el robot mediante `robotctl policy load <slot> greecree/microduck-tug-of-war-tug-leader-v1`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Restricción operativa: la política debe ejecutarse a 50 Hz; el cumplimiento de ese plazo en el cómputo a bordo es un requisito, no una recomendación. No se publican cifras de latencia ni de *throughput*.
- Entrenamiento (para reproducción): 4096 entornos en paralelo, hasta 1000 iteraciones de agente; no se especifica el hardware necesario, aunque el número de entornos implica un equipo con GPU de gama alta o un clúster.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `greecree/microduck-tug-of-war-tug-leader-v1` | Política RL (ONNX) para microduck, tarea tira y afloja | 61 / 14 a 50 Hz | No aplica | No disponible | HuggingFace, 0 descargas, 0 likes |
| Otras políticas de la familia microduck | Política RL (ONNX) para microduck | No disponible | No aplica | No disponible | No disponible en la información proporcionada |
| Políticas de locomoción de microduck entrenadas en simulación (flujo descrito por NVIDIA) | Política RL para caminar y sortear obstáculos | No disponible | No aplica | No disponible | No disponible como pesos publicados en la información consultada |

No se dispone de datos de benchmarks cruzados con alternativas, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre esta política y otras de la misma categoría.

## Limitaciones y advertencias

- Ausencia de licencia: no se especifica licencia alguna, lo que impide determinar si el uso comercial está permitido. Tratar como no apto para producción hasta aclararlo con el autor.
- Evaluación muy estrecha: el 100 % de victorias y el rating de 158,6 cm corresponden a la evaluación del propio autor sobre 5 semillas y a los oponentes concretos empleados; no hay evidencia de generalización frente a políticas no vistas.
- Sesgo de semilla: el autor advierte que el entrenamiento no es reproducible bit a bit; el comportamiento puede diferir entre reentrenamientos con la misma receta. La política publicada corresponde a la semilla 1 y al checkpoint 250, sin datos sobre la variabilidad entre checkpoints.
- Sin arquitectura publicada: no se puede auditar el tamaño, la topología ni el coste computacional de la red a partir de la model card.
- Brecha sim-to-real no cuantificada: no se publican métricas en robot físico ni comparación con el rendimiento en simulación, pese a que la política está pensada para ejecución real.
- Ambigüedad de plataforma: la model card enlaza el demonio `pollen-robotics/microduck`, mientras que los resultados de búsqueda web se refieren a un robot «Microduck» presentado por NVIDIA en GTC Berlin 2026. Conviene verificar a qué hardware corresponde exactamente antes de desplegar.
- Sin capacidades lingüísticas ni de razonamiento: no admite instrucciones en lenguaje natural ni *tool calling*; toda interacción es a través del vector de observación.
- Riesgo en contacto físico: es una política de tracción sobre un robot bípedo; no se documentan límites de par, protecciones ante caídas ni comportamiento seguro ante fallos de comunicación.
- Metadatos incompletos: 0 descargas y 0 likes en el momento de la consulta, sin issues ni documentación adicional sobre robustez o mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/greecree/microduck-tug-of-war-tug-leader-v1
- Repositorio de desafíos y código de entrenamiento: https://github.com/green-creeper/microduck-challenges (commit `4b675ebf4`)
- Demonio y documentación del manifiesto de políticas: https://github.com/pollen-robotics/microduck (véase `docs/policy-manifest.md`)
- Artículo sobre el flujo de entrenamiento de Microduck en simulación con agentes de IA: https://ailearningguides.com/nvidia-microduck-robot-ai-agents-simulation-walking/
- Detalle del flujo de trabajo de NVIDIA para entrenar Microduck en simulación: https://blockchain.news/news/nvidia-ai-agents-microduck-walk-simulation
- Vídeo de combates autónomos de tira y afloja en los World Humanoid Robot Games 2026: https://www.youtube.com/watch?v=LkMSwh3TEiM
- Presentación de los robots Microduck en GTC Berlin 2026: https://www.youtube.com/shorts/iJdTcjjRdcg
- Página de producto de Microduck: https://microducks.org/
