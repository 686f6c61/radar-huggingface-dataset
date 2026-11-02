# jini-yang/tc3r-jupiter-20261102

## Resumen

TrackCraft3R es un modelo de previsión de trayectorias 3D con cabeza de acción (pose de pinza) orientado a manipulación robótica. Lo publica el usuario `jini-yang` en HuggingFace como snapshot fechado el 2 de noviembre de 2026, bajo el nombre interno JUPITER. El modelo parte de un backbone con adaptadores LoRA y añade cabezas específicas para seguimiento de trayectorias, máscaras y predicción de pose de agarre, todo entrenado sobre escenas de tipo *pick-and-place*.

El problema que aborda es la generación de planes de manipulación en bucle abierto: dado un frame inicial, el modelo produce una trayectoria 3D y una secuencia de poses de pinza que un ejecutor de 22 slots traduce en comandos para un simulador MuJoCo. Es relevante porque documenta con detalle sus propios fallos: en escenas asimétricas retiene el objeto en el 22 % de los casos (frente al 84 % de un plan ground-truth), y el error de giro alrededor del eje de aproximación se mantiene a nivel de azar (unos 45 grados de mediana) hasta +800 pasos.

El repositorio pesa 30,9 GB e incluye múltiples checkpoints completos de entrenador (backbone LoRA, cabezas de track/máscara, cabeza de acción y argumentos de entrenamiento), además de los resultados de evaluación por episodio. No se declaran idiomas soportados ni se publican métricas de benchmarks de NLP; las métricas disponibles son de éxito de manipulación en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone transformer con adaptadores LoRA, cabezas de track/máscara y cabeza de acción (pose de pinza); previsión de trayectorias 3D |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints en `.pt` de entrenador, no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (sin detalle de términos en la model card) |
| Formato de pesos | `.pt` (checkpoints completos de entrenador: `checkpoints/<run>/flow_step<N>.pt`) |

## Arquitectura y entrenamiento

La model card describe un backbone con LoRA congelado sobre el que se montan tres componentes: una cabeza de seguimiento de trayectorias 3D, una cabeza de máscaras y una cabeza de acción que predice la pose de la pinza. El entrenamiento se organiza en líneas sucesivas: `v10g_fixed/13500` (línea principal de cocina v10, con slots de evento fijos 8/17, pre-grasp 5 y receta `v10_ground`, learning rate de cabeza 1e-4) sirve de punto de partida para las variantes TB y ATfix. `gpose_fix/13800` añade una pérdida de pose de agarre con slots variables y es el origen de ATvar.

Las variantes entrenadas sobre escenas asimétricas y altas (`asymt11_*`) usan una proporción 1:1 por bundle. TB (track-TCP base head) calcula la posición como el TCP leído de la trayectoria decodificada mediante ajuste de Kabsch, con la posición separada (detached) más un residuo, con pesos de track 2.0 y pose de agarre 1.5. También se incluyen checkpoints para LIBERO-spatial a 256 sobre lienzo rellenado, entrenados con profundidad DA3 escalada a un mapa de referencia derivado de demos, y la misma configuración con profundidad ground-truth. Cada checkpoint incluye `launch_flags_jupiter.txt`, `RESUME_NOTES.txt` y `launch_env.txt` con los flags exactos de entrenamiento.

## Capacidades

- Previsión de trayectorias 3D de objetos a partir de un frame inicial.
- Predicción de pose de pinza (posición y giro) para ejecución de agarre y colocación.
- Generación de planes de manipulación completos ejecutables en MuJoCo mediante un ejecutor de 22 slots.
- Seguimiento de trayectorias con cabeza de track y ajuste de Kabsch para extraer el TCP.
- Segmentación mediante cabeza de máscaras.
- Evaluación en suites LIBERO (spatial, PRO object, PRO lan, PRO swap, PRO task) con profundidad estimada (DA3) o ground-truth.
- Soporte de escenas con obstáculos (dataset `tc3r-msgen-v11-obst`).
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Planificación de pick-and-place en simulación: el modelo genera un plan desde el frame 0 que se ejecuta en MuJoCo con el ejecutor de 22 slots, útil para prototipar políticas antes de transferir a un robot real.
- Investigación en previsión de trayectorias: los checkpoints y scripts de tabla (`stage_table.py`, `rot_table.py`, `joint_table.py`, `obst_table.py`) permiten reproducir y analizar el error de posición y de giro por etapa.
- Evaluación comparativa de profundidad estimada frente a ground-truth: los pares `lbsp256c_da3ref` y `lbsp256c_gt` permiten medir la brecha de rendimiento al sustituir profundidad real por DA3 (por ejemplo, 34,4 % frente a 96,4 % en LIBERO-spatial).
- Estudio de olvido catastrófico: la comprobación en Kitchen v10 sim 100 (33 % para v10g frente a 9 % para ATvar 15000) sirve para analizar la degradación al especializar el modelo en escenas asimétricas.
- Desarrollo de cabezas de acción alternativas: el script `tc3r_sim_server.py` acepta `TC3R_GEO_HEAD` para sustituir la cabeza de acción, lo que facilita experimentar con nuevas cabezas sobre el mismo backbone.
- Generación de datasets sintéticos de manipulación: el servidor de simulación con `--save_plan` guarda los planes ejecutados (`*_plan.npz`), reutilizables como datos de entrenamiento o validación.
- Análisis de fallos de agarre: la métrica desglosada (grasp+lift, held, final) permite diagnosticar si el fallo ocurre en el cierre de la pinza, durante el transporte o en la colocación.

## Benchmarks y rendimiento

Evaluaciones en bucle abierto: un único plan desde el frame 0 ejecutado en MuJoCo. En `asym100n` (100 escenas asimétricas reservadas), porcentajes de éxito:

| Modelo | grasp+lift | held | final |
|---|---|---|---|
| GT plan por el mismo ejecutor de 22 slots (81 escenas) | 88 % | 84 % | 84 % |
| v10g 13500 | 20 % | 18 % | 19 % |
| v10g 13500 con pose de agarre GT en su slot de cierre | 66 % | 63 % | 43 % |
| ATfix 14300 (mejor de 13800/14300/14700) | 23 % | 22 % | 22 % |
| TB 14300 (mejor de 13800/14300/14700) | 24 % | 20 % | 15 % |
| ATvar 15000 (mejor de 14100/14600/15000) | 7 % | 6 % | 5 % |

En el cierre, el giro alrededor del eje de aproximación está a nivel de azar (mediana de unos 45 grados) hasta +800 pasos y mejora a 36-40 grados hacia +1200. Posición y giro son correctos simultáneamente (dxy < 3 cm y giro < 20 grados) en solo el 3-5 % de los episodios.

Comprobación de olvido en Kitchen v10 sim 100 (éxito final): v10g 33 %, TB 14300 20 %, TB 14700 17 %, ATvar 15000 9 %.

LIBERO con `lbsp256c_da3ref` 15000 (profundidad DA3, 50 episodios por tarea) frente al modelo con profundidad GT:

| Suite | DA3 refmap 15000 | Profundidad GT |
|---|---|---|
| spatial | 34,4 % | 96,4 % |
| PRO object | 42,0 % | 90,4 % |
| PRO lan | 18,1 % | 80,0 % |
| PRO swap | 2,2 % | 35,2 % |
| PRO task | 22,1 % (145 episodios) | 22,2 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 30,9 GB e incluye varios checkpoints completos de entrenador, pero no se desglosa el tamaño de cada uno ni el del backbone.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor propio mediante `scripts/tc3r_sim_server.py` (con `--ckpt`, `--port` y `--authkey_file`) y ejecución de episodios con `sim/msgen_droid/run_model.py` (`--source geo --grip_from head --gen saved --root <msgen root> --episodes_file <keys> --save_plan`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento documentado | Licencia |
|---|---|---|---|---|---|
| TrackCraft3R JUPITER (este) | Previsión de trayectorias 3D + cabeza de acción | no disponible | no disponible | 22 % final en asym100n; 34,4 % en LIBERO-spatial con DA3 | other |
| Plan GT por el mismo ejecutor | Referencia superior | no aplica | no aplica | 84 % final en asym100n; 96,4 % en LIBERO-spatial con GT | no aplica |
| Modelo LIBERO con profundidad GT (`lbsp256c_gt`) | Variante del mismo backbone | no disponible | no disponible | 96,4 % spatial, 90,4 % PRO object | other |

No se dispone de información sobre otros modelos comparables de previsión de trayectorias 3D con cabeza de acción en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy por debajo del plan ground-truth: 22 % frente a 84 % de éxito final en escenas asimétricas, y 34,4 % frente a 96,4 % en LIBERO-spatial con profundidad estimada.
- El giro alrededor del eje de aproximación está a nivel de azar (mediana de unos 45 grados) hasta +800 pasos; posición y giro correctos simultáneamente solo en el 3-5 % de los episodios.
- Olvido catastrófico al especializar: el éxito en Kitchen v10 sim 100 cae de 33 % (v10g) a 9 % (ATvar 15000).
- Dependencia crítica de la profundidad: sustituir GT por DA3 degrada LIBERO-spatial de 96,4 % a 34,4 % y PRO swap de 35,2 % a 2,2 %.
- Evaluación exclusivamente en bucle abierto y en simulación (MuJoCo); no se documenta validación en robot real.
- Licencia `other` sin términos detallados en la model card: es necesario revisar el texto completo antes de cualquier uso comercial.
- Las rutas guardadas dentro de los `.pt` son rutas originales del clúster; hay que sobrescribir las rutas de datos al reanudar el entrenamiento.
- No se documentan idiomas, sesgos ni riesgos de alucinación en el sentido de generación de texto, ya que el modelo no es un LLM.
- El snapshot está fechado en 2026-11-02 y tiene 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jini-yang/tc3r-jupiter-20261102
- Dataset de escenas asimétricas/altas con obstáculos: https://huggingface.co/datasets/jini-yang/tc3r-msgen-v11-obst
- Código (GitHub, rama `jupiter-20261102`): `sheep1283/TrackCraft3R_forcasting`, documento `docs/JUPITER_20261102.md`
