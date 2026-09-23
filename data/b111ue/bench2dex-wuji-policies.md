# B111ue/bench2dex-wuji-policies

## Resumen

`B111ue/bench2dex-wuji-policies` es un repositorio de checkpoints de políticas de imitación (imitation learning) para robótica, publicado por el usuario B111ue. No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal, sino de un conjunto de políticas entrenadas para control motor: el espacio de acciones del robot son 52 objetivos articulares absolutos. El repositorio se etiqueta con `pytorch`, `robotics`, `imitation-learning` y `bench2dex`, y ocupa 55,1 GB.

Según la model card, los checkpoints provienen de ejecuciones independientes en una sola GPU sobre dos tareas concretas: carga de cajas de condimentos (Condiment Box Loading) y carga de cajas con pelotas (Ball Box Loading). Los métodos empleados son Bench2Dex ACT/DP, con ACT (Action Chunking Transformer) y DP (Diffusion Policy) como referencias, y DECO vision. El autor indica explícitamente que todavía no hay afirmaciones de rendimiento evaluadas.

Su relevancia es acotada y de nicho: sirve como material reproducible para quien trabaja en manipulación robótica con Bench2Dex y quiera comparar recetas de entrenamiento en una sola GPU. No es un artefacto listo para producción ni para uso generalista: parte de los checkpoints son de recuperación en tiempo de ejecución (runtime-recovery), incluyen estado del optimizador y no todos corresponden a políticas finales seleccionadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas de imitación basadas en los métodos referenciados por el autor: Bench2Dex ACT/DP (Action Chunking Transformer y Diffusion Policy) y DECO vision; no se detalla la configuración concreta de cada checkpoint |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto textual; se desconoce la ventana de observación de las políticas) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; el modelo emite acciones motoras, no texto |
| Licencia | no disponible |
| Formato de pesos | checkpoints de PyTorch (librería declarada: `pytorch`); extensión y estructura concretas no disponibles |
| Espacio de acción | 52 objetivos articulares absolutos |
| Tareas | Condiment Box Loading y Ball Box Loading |
| Tamaño del repositorio | 55,1 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-23 / 2026-09-23 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de los checkpoints más allá de los métodos citados. El autor referencia Bench2Dex ACT/DP —donde ACT corresponde a Action Chunking Transformer y DP a Diffusion Policy— y DECO vision. No se especifican el número de capas, dimensiones de las representaciones, codificadores de visión empleados, ni el número total de parámetros. Los checkpoints proceden de ejecuciones independientes en una única GPU.

En cuanto al entrenamiento, la model card aporta dos detalles concretos de receta. Para ACT se mantiene un batch efectivo de 32 mediante computación con microbatch; para DECO se emplea la receta del autor con batch 128 en una sola GPU. Las demostraciones en bruto provienen del conjunto `Bench2Dex/teleopdata` y no se redistribuyen en este repositorio. No se indica el número de tokens, episodios o pasos de entrenamiento, ni si hubo etapas de ajuste tipo RLHF o DPO (no aplicables en el sentido habitual en robótica, pero no se documenta ningún ajuste por recompensa). Los checkpoints de recuperación en tiempo de ejecución incluyen estado del optimizador.

## Capacidades

- Generación de acciones motoras: produce 52 objetivos articulares absolutos para control de robot manipulador.
- Ejecución de políticas de imitación entrenadas sobre demostraciones de teleoperación.
- Cobertura de dos tareas específicas: Condiment Box Loading y Ball Box Loading.
- Recuperación en tiempo de ejecución: existen checkpoints orientados a runtime-recovery, con estado del optimizador incluido.
- Comparación de métodos: el repositorio contiene políticas asociadas a distintas recetas (ACT, DP y DECO vision) bajo condiciones de entrenamiento en una sola GPU.
- Tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (no aplica; no procesa lenguaje).
- Modo de razonamiento, visión o audio: la referencia a DECO vision sugiere uso de entrada visual, pero no se detalla el esquema de percepción en la información disponible.

## Casos de uso

- Reproducción de experimentos en robótica: cargar los checkpoints de ACT y comparar la receta de batch efectivo 32 con microbatch frente a otras configuraciones, usando las mismas tareas y el mismo conjunto de demostraciones de Bench2Dex.
- Investigación en políticas de difusión: evaluar la receta DECO con batch 128 en una sola GPU como línea base para manipulación con entrada visual.
- Teleoperación aumentada: usar los objetivos articulares absolutos como referencia para un controlador de bajo nivel en tareas de carga de objetos en cajas.
- Análisis de recuperación ante fallos: aprovechar los checkpoints de runtime-recovery, que conservan estado del optimizador, para estudiar reanudación de entrenamiento y estabilidad.
- Benchmarking interno de imitación: emplear estas políticas como punto de comparación propio antes de publicar resultados, dado que el autor no declara métricas evaluadas.
- Formación y docencia: ilustrar el flujo completo de un pipeline de imitation learning en robótica, desde demostraciones de teleoperación hasta checkpoints desplegables en simulación o en banco de pruebas.
- Integración en pipelines de simulación: cargar los pesos en un entorno de simulación compatible con el espacio de acción de 52 articulaciones para validar controladores antes de transferir a hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que todavía no existen afirmaciones de rendimiento evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican parámetros totales ni configuración de red, por lo que no puede calcularse.
- VRAM para entrenamiento: no disponible. El autor menciona ejecuciones en una sola GPU con batch efectivo 32 (ACT, vía microbatch) y batch 128 (DECO), pero no indica el modelo de GPU ni el consumo de memoria.
- GPU recomendadas: no disponible. El único dato aportado es que los entrenamientos se realizaron en una sola GPU.
- Compatibilidad con GPU de consumo: no disponible. Los tamaños de batch empleados (32 y 128) son compatibles con GPUs de consumo en muchos pipelines de robótica, pero sin datos de parámetros ni de memoria no puede confirmarse para este repositorio.
- Almacenamiento: 55,1 GB de repositorio. Conviene tener en cuenta que incluye múltiples checkpoints y estados de optimizador, por lo que el espacio de disco necesario supera ampliamente el de un único conjunto de pesos.
- Opciones de despliegue: no disponibles. Al ser pesos de PyTorch orientados a robótica, el despliegue habitual pasa por cargar los checkpoints desde el código de Bench2Dex, no por servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Como referencias metodológicas, el propio autor cita Bench2Dex ACT/DP y DECO vision, pero no se aportan parámetros, contexto, rendimiento ni licencia de ninguno de ellos que permitan una comparación cuantitativa.

| Alternativa | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| B111ue/bench2dex-wuji-policies | no disponible | no disponible | sin métricas publicadas | no disponible | HuggingFace |
| Bench2Dex ACT/DP | no disponible | no disponible | no disponible | no disponible | repositorio GitHub citado |
| DECO vision | no disponible | no disponible | no disponible | no disponible | repositorio GitHub citado |

## Limitaciones y advertencias

- Ausencia total de métricas: el autor declara explícitamente que no hay afirmaciones de rendimiento evaluadas, por lo que no debe asumirse ninguna calidad de política.
- Checkpoints no finales: parte de los pesos corresponden a recuperación en tiempo de ejecución e incluyen estado del optimizador, y no todos son políticas finales seleccionadas.
- Sesgos: no disponible. No se documenta caracterización de sesgos, y en robótica esto se traduce en posibles sesgos de las demostraciones de teleoperación (condiciones de iluminación, posiciones de objetos, operador concreto), que no han sido analizados en la información disponible.
- Riesgo de fallo en ejecución: al ser políticas de imitación sin evaluar, pueden degradarse ante estados no vistos, variaciones de objeto o perturbaciones externas.
- Alcance limitado: solo se documentan dos tareas (Condiment Box Loading y Ball Box Loading) y un espacio de acción de 52 articulaciones, lo que restringe la generalización a otros robots o tareas.
- Licencia no especificada: al no declararse licencia, no puede asumirse permisos de uso comercial, redistribución ni modificación. Es un riesgo legal relevante para cualquier uso en producción.
- Idiomas: no aplica, pero implica que no debe esperarse interacción en lenguaje natural.
- Reproducibilidad: las demostraciones originales no se redistribuyen aquí; hay que obtenerlas del conjunto `Bench2Dex/teleopdata`, lo que añade una dependencia externa.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/B111ue/bench2dex-wuji-policies
- Bench2Dex (repositorio de métodos): https://github.com/Bench2Dex/Bench2Dex
- DECO vision (rama `sim`): https://github.com/BAAI-Humanoid/DECO/tree/sim
- Conjunto de demostraciones de teleoperación: https://huggingface.co/datasets/Bench2Dex/teleopdata
