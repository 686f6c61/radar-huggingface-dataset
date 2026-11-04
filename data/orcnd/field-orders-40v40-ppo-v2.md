# orcnd/field-orders-40v40-ppo-v2

## Resumen

Field Orders 40v40 Soldier PPO v2 es un conjunto de políticas neuronales compactas para un juego de captura de bandera (Capture-the-Flag) con temática vikingo contra mongol, desarrollado por el usuario orcnd y publicado en HuggingFace. No se trata de un modelo de lenguaje ni de un transformer: son redes densas en formato JSON personalizado que controlan soldados y comandantes dentro de una simulación de juego propia escrita en JavaScript. Cada soldado recibe su propia observación parcial y devuelve entradas de movimiento, apuntado y disparo con un esquema fijo de 126 características.

El modelo principal, `soldier-ppo-v2.json`, es una red de 126 → 128 → 96 → 5 entradas/salidas entrenada con PPO (Proximal Policy Optimization) y GAE tras una fase de clonación de comportamiento. El comandante (`commander-v1.json`) es una red de 58 → 64 → 48 → 22 entrenada únicamente por imitación y congelada durante el entrenamiento del soldado. El paquete incluye además el runtime de inferencia en JavaScript, el esquema de observación, los checksums y los informes de entrenamiento y evaluación.

La relevancia de esta publicación es acotada: se trata de un experimento de investigación en IA para juegos con un alcance muy específico (un único juego, un único oponente congelado, 48 casos de evaluación deterministas). El propio autor advierte que las políticas no han demostrado estrategia a nivel humano ni generalización entre juegos. Es útil como referencia reproducible de un pipeline completo de RL multiagente en el navegador, no como componente de producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal densa (MLP) en formato JSON personalizado; no es un transformer |
| Parámetros totales | No disponible (arquitectura soldado: 126 → 128 → 96 → 5; comandante: 58 → 64 → 48 → 22) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; observación de 126 características por soldado |
| Tipos de cuantización | No disponible; pesos en JSON de coma flotante |
| Idiomas soportados | en, tr (etiquetas de la model card; no hay procesamiento de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON personalizado (`soldier-ppo-v2.json`, `commander-v1.json`, `soldier-v1.json`) |

## Arquitectura y entrenamiento

El soldado es una red densa de tres capas (126 → 128 → 96 → 5) que comparte pesos entre todos los soldados del equipo mientras cada uno mantiene su propia observación parcial. Se inicializó mediante imitación supervisada de la política previa del proyecto y se afinó con PPO con clipping y estimación generalizada de ventajas (GAE) en cuatro entornos paralelos que replican las reglas de movimiento, colisión, proyectiles, salud y bandera del juego en vivo. Las recompensas cubren progreso hacia objetivos con conciencia del terreno, capturas, daño útil, recuperación, seguimiento de órdenes, disparos desperdiciados, movimiento bloqueado y aglomeración. La información privilegiada de objetivo y geometría se usó solo para calcular recompensas, nunca como observación adicional de la política.

El checkpoint seleccionado acumula 497.837 transiciones de agente activo en 64 actualizaciones de PPO en dos etapas (40 + 24). El comandante no recibió entrenamiento por refuerzo: se entrenó por clonación de comportamiento y permaneció congelado durante todo el PPO del soldado. El oponente fue una línea base aprendida y congelada; no se entrenó una liga de oponentes. Las políticas no actualizan sus pesos durante el juego en vivo. El runtime de inferencia está implementado en JavaScript y también se ofrece un SDK de inferencia en NumPy y un entorno PettingZoo Parallel en la versión 0.3.0 del paquete.

## Capacidades

- Control de soldados en un juego de captura de bandera 40v40 con observación parcial individual por unidad.
- Salida de control analógico: vector de movimiento normalizado (`moveX`, `moveY`), dirección de apuntado (`aimX`, `aimY`) y botón de disparo booleano.
- Toma de decisiones del comandante: selección de comando, formación y estrategia entre 22 salidas posibles.
- Seguimiento de órdenes de punto (point orders) con una tasa de alcance del 65,3 % en la evaluación del autor.
- Ejecución de políticas en el navegador mediante runtime JavaScript, sin dependencias de servidor.
- Integración con entornos multiagente mediante PettingZoo Parallel (versión 0.3.0).
- Inferencia en Python vía SDK NumPy incluido en el wheel `field_orders_ai-0.3.0`.
- No soporta tool calling, function calling, agentes de razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Investigación reproducible en RL multiagente: el paquete incluye el entorno, los pesos, los checksums y los informes de evaluación, lo que permite replicar el pipeline PPO + GAE en un juego de captura de bandera sin infraestructura pesada.
- Demostración educativa de clonación de comportamiento seguida de PPO: el par soldado-v1 (baseline por imitación) y soldier-ppo-v2 permite comparar ambas fases con episodios emparejados y semillas idénticas.
- Prototipado de IA para juegos en el navegador: el runtime JavaScript y el formato JSON permiten integrar la política en un cliente web sin backend, útil para validar comportamientos antes de portar a motores comerciales.
- Evaluación de entornos PettingZoo: la versión 0.3.0 expone un entorno Parallel que sirve para probar algoritmos de RL multiagente con observaciones parciales y recompensas densas.
- Estudio de limitaciones de generalización: los 48 casos de evaluación con oponente congelado y las advertencias del autor sobre desequilibrio de facciones y órdenes obsoletas del comandante constituyen un caso de estudio documentado de fallos típicos en RL de juego.
- Base para experimentos de ligas de oponentes: el autor identifica explícitamente la ausencia de un pool de oponentes y de memoria recurrente como prioridades, lo que convierte este paquete en un punto de partida para extenderlo.

## Benchmarks y rendimiento

El model-index oficial declara `results: []`, por lo que no hay benchmarks estándar (MMLU, HumanEval, GSM8K) aplicables. La model card incluye una evaluación propia de 48 casos emparejados con semillas separadas del entrenamiento: tres mapas, dos lados de equipo, siete casos de tarea 12v12 de 30 segundos por mapa y lado (42 casos) más seis partidas estándar 40v40 de 60 segundos, siempre contra un oponente congelado y con condiciones iniciales idénticas.

| Métrica | Baseline (clonación de comportamiento) | Soldier PPO v2 |
|---|---:|---:|
| Entregas de bandera en 48 casos | 1 | 4 |
| Tasa de alcance de órdenes de punto | 30,6 % | 65,3 % |
| Tasa media de movimiento bloqueado | 2,73 % | 2,06 % |
| Paradas del portador en seis casos de intercepción | 2/6 | 2/6 |
| Victorias en partidas estándar | 3/6 | 4/6 |

El autor advierte que estas pruebas deterministas y de pequeño tamaño no establecen una tasa de victoria general, estrategia óptima, equilibrio de facciones, rendimiento a nivel humano ni fiabilidad en partidas largas. El movimiento bloqueado se define como menos de 0,8 unidades de desplazamiento en 0,1 segundos pese a haber entrada de movimiento y un objetivo lejano; una orden de punto se considera exitosa si el soldado se aproxima a menos de 35 unidades.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; son redes de pocos miles de parámetros en JSON, ejecutables en CPU sin GPU.
- GPU recomendadas: ninguna necesaria; el runtime JavaScript corre en el navegador y el SDK NumPy en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el cuello de botella es la simulación del juego, no la inferencia de la red.
- Opciones de despliegue: runtime JavaScript incluido (`runtime.js`), SDK NumPy en el wheel `field_orders_ai-0.3.0`, entorno PettingZoo Parallel y servidor HTTP estático para servir los ficheros.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del motor de simulación y del número de agentes (hasta 80 en partidas 40v40).
- Requisitos de entorno declarados: Python 3.10+ y Node.js 22+ para la versión 0.3.0 del SDK.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un artefacto de RL específico de un juego propio, sin equivalentes públicos identificados en la información disponible. Como referencia interna del propio repositorio, la comparación relevante es entre sus tres checkpoints:

| Modelo | Arquitectura | Entrenamiento | Estado |
|---|---|---|---|
| `soldier-ppo-v2.json` | 126 → 128 → 96 → 5 | PPO + GAE tras clonación de comportamiento | Activo |
| `commander-v1.json` | 58 → 64 → 48 → 22 | Clonación de comportamiento | Congelado |
| `soldier-v1.json` | 126 → 128 → 96 → 5 | Clonación de comportamiento | Archivado (baseline) |

## Limitaciones y advertencias

- Las políticas no han demostrado estrategia a nivel humano ni generalización entre juegos, según declara el propio autor.
- El comandante no fue entrenado con RL y permanece congelado; en juego en vivo con ambas políticas PPO se observó que retenía una orden de parada del portador después de que la bandera regresara.
- Se detectó desequilibrio de facciones en el juego en vivo con ambas políticas PPO.
- El oponente es una línea base congelada; no existe liga de oponentes, lo que limita la robustez frente a estrategias diversas.
- Las paradas del portador no mejoraron en la evaluación (2/6 en ambos casos), una limitación reconocida explícitamente.
- La evaluación se basa en 48 casos deterministas y de pequeño tamaño; no establece tasas de victoria generales ni fiabilidad en partidas largas.
- No hay memoria recurrente; las observaciones de velocidad y antigüedad de informe del portador son mejorables según el autor.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni razonamiento multi-paso, y las etiquetas de idioma en/tr no implican capacidades lingüísticas.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos generativos; el riesgo equivalente es el sobreajuste al oponente congelado y a los mapas de entrenamiento.
- Licencia Apache 2.0 permite uso comercial del código y pesos, pero el juego y su simulación son un desarrollo propio del autor; verificar la procedencia de los assets si se reutilizan.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados en el repo o son de tamaño despreciable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orcnd/field-orders-40v40-ppo-v2
- Demo en navegador (Space): https://huggingface.co/spaces/orcnd/field-orders-ai-lab
- Vídeo de replay: `replay.mp4` (incluido en el repositorio)
- Procedencia del replay: `demo-provenance.json`
- Informe de desarrollo y evaluación v3: `AI-UPGRADE-V3-REPORT.md`
- Informe de evaluación RL: `rl-evaluation-report.json`
- ZIP de código fuente v0.3.0: `releases/v0.3.0/field-orders-ai-0.3.0-source.zip`
- Wheel de Python v0.3.0: `releases/v0.3.0/field_orders_ai-0.3.0-py3-none-any.whl`
- Checkpoints experimentales v3: `experiments/v3/`
- Configuración activa: `active-model.json`
- Paper PPO (referencia citada): arXiv:1707.06347
- Paper GAE (referencia citada): arXiv:1506.02438
