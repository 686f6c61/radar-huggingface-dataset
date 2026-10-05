# buzinguyen/odd-conditioned-dev

## Resumen

ODD-conditioned-dev es el repositorio de pesos de una familia de políticas de control entrenadas con aprendizaje por refuerzo para un cuadrúpedo Unitree Go2 simulado en MuJoCo (mjlab). No es un modelo de lenguaje: es un conjunto de políticas de seguridad (safety filters) cuyo certificado de seguridad sobrevive a cambios en tiempo de ejecución del dominio de diseño operativo (ODD, *operating design domain*), como la carga de un payload a mitad de misión o la degradación de un motor. Lo publica el usuario buzinguyen y está pensado para usarse junto al repositorio de código SafeRoboticsLab/odd-conditioned (rama `cleanup`).

La innovación central es estructural: el filtro de seguridad se modela como un autómata sobre modos de especificación (stand/walk ↔ rest) con embudos de transición certificados entre modos. Cada política se entrena como un PPO de dos jugadores de tipo *reach-avoid* (ReachAvoidPPO2P, sobre safety-stable-baselines 0.4.0), donde la red de valor actúa como certificado del modo correspondiente.

El repositorio ocupa 0,4 GB, se distribuye bajo licencia MIT y no registra descargas ni *likes* en el momento de la consulta. Su relevancia es de nicho: sirve como material reproducible para investigación en RL seguro aplicado a robótica con ODD variable, no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes actor-critic entrenadas con PPO de dos jugadores de tipo reach-avoid (`ReachAvoidPPO2P`, safety-stable-baselines 0.4.0); cada política es un par política de control + red de valor de estado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la observación del actor es de 48 dimensiones |
| Tipos de cuantizacion | no aplica; no se publican variantes cuantizadas |
| Idiomas soportados | no disponible; no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | `model.zip` (modelo PPO serializado por checkpoint), `tensornormalize.pt` (estadísticas de normalización congeladas), `config.yaml` (configuración de entrenamiento) y `odd-conditioned-weights-v1.tar.gz` (archivo agregado que instala `fetch_weights.sh`) |
| Framework de entrenamiento | safety-stable-baselines 0.4.0 sobre tareas de robot-safety-sandbox (rama `project/odd-conditioned`) |
| Entorno de simulación | MuJoCo mediante mjlab, robot Unitree Go2 |
| Entornos paralelos de entrenamiento | 1024 |
| Pasos de entrenamiento | 50 M (checkpoint publicado en 49.999.872 pasos) |
| Semilla | 0 (una única ejecución por política) |
| Perturbación adversarial | empuje aprendido de hasta 25 N |
| Número de políticas publicadas | 10 (`stand`, `rest`, `getup`, `descend`, `stand_wide`, `unified`, `unified_discounted`, `leg_stand`, `compound_stand`, `compound_rest`) |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación / actualización | 2026-10-05 / 2026-10-05 |

## Arquitectura y entrenamiento

Cada checkpoint contiene un gemelo PPO de dos jugadores de tipo *reach-avoid*: una política de control y una red de valor de estado cuyo signo constituye el certificado del modo. El sistema completo se organiza como un autómata sobre modos de especificación (stand/walk ↔ rest) con embudos de transición certificados: `getup` certifica el paso REST → STAND y su valor `V_up` controla la vuelta y el abortado, mientras que `descend` certifica el paso STAND → REST. La política de marcha nominal no se incluye en este repositorio, sino que se distribuye en go2_atomic_skills.

El entrenamiento emplea la receta de safety-PPO de dos jugadores de safety-stable-baselines sobre tareas de robot-safety-sandbox: 1024 entornos, 50 M de pasos, semilla 0 y un empuje adversarial aprendido de hasta 25 N. El checkpoint liberado de cada ejecución corresponde al paso 49.999.872. El repositorio incluye `scripts/train.sh` para reentrenar cualquiera de las políticas y `scripts/fetch_weights.sh`, que verifica cada archivo contra el manifiesto `weights/MANIFEST.sha256`. La reproducibilidad es un punto explícito del proyecto: `pytest -q tests/` y `bash scripts/reproduce.sh payload figures` reproducen la evaluación publicada.

Un detalle relevante de diseño experimental es la varianza entre ejecuciones. Cada política procede de una sola ejecución y las políticas de tipo postura (`stand`, `compound_stand`) varían mucho de una semilla a otra: al reentrenarlas con otras semillas, la mayoría de los expertos `stand` no superan el test de aceptación que sí pasa el modelo liberado. El repositorio documenta ese test (`scripts/check_policies.py`) y un script de calibración de umbrales para políticas reentrenadas.

## Capacidades

- Mantenimiento de postura erguida (`stand`) bajo una carga transportada W ∈ [0, 120] N y con centro de masas elevado; su red de valor es `V_stand`.
- Postura de reposo (`rest`): tumbarse y estabilizarse bajo cualquier carga; funciona como conjunto seguro ancla.
- Incorporación certificada (`getup`): embudo REST → STAND, con la red de valor `V_up` como puerta de retorno y de abortado.
- Descenso certificado (`descend`): embudo STAND → REST.
- Variante de rango de carga ampliado (`stand_wide`) entrenada para W ∈ [0, 150] N, con certificado más ruidoso; sirve como comparación de especificación única.
- Políticas de referencia de especificación única (`unified`, `unified_discounted`): una sola política para stand-o-rest.
- Control negativo para una pata delantera derecha degradada (`leg_stand`).
- Políticas compuestas para pata que se degrada mientras se transportan 80 N (`compound_stand`, `compound_rest`).
- No soporta *tool calling*, *function calling*, agentes conversacionales, visión ni audio: el modelo no procesa lenguaje natural ni señales perceptivas de ese tipo.

## Casos de uso

- Filtros de seguridad en robots de reparto con carga variable: el autómata permite cambiar de modo (stand ↔ rest) cuando se deposita o retira un payload a mitad de misión, manteniendo el certificado de seguridad dentro del rango de carga entrenado (0-120 N, o 0-150 N con `stand_wide`).
- Recuperación autónoma tras caída: la política `getup` implementa un embudo certificado REST → STAND que permite volver a la postura erguida de forma controlada y abortar si `V_up` no garantiza la transición.
- Gestión de degradación de actuadores: `leg_stand` y las políticas `compound_*` cubren el caso de una pata delantera derecha que se degrada, incluso con 80 N de carga, lo que sirve de base para estrategias de derating en tiempo de ejecución.
- Postura de bajo consumo o de espera: `rest` permite tumbarse y estabilizarse de forma segura bajo cualquier carga, útil para aparcar el robot entre tareas o ante una parada de emergencia.
- Validación de certificados en simulación antes de transferencia: el repositorio permite reproducir las figuras y la evaluación con `scripts/reproduce.sh`, lo que facilita comparar certificados antes de plantear despliegues físicos.
- Investigación en RL seguro: la separación en expertos por especificación, más los baselines `unified` y `unified_discounted`, permite estudiar el coste y los beneficios de condicionar por ODD frente a una política única.
- Bancos de prueba para algoritmos de safety-PPO: al estar construido sobre safety-stable-baselines 0.4.0 y robot-safety-sandbox, sirve para medir la varianza entre semillas y calibrar umbrales de aceptación con `scripts/check_policies.py`.
- Docencia y reproducibilidad: el manifiesto SHA-256 y los scripts de entrenamiento y evaluación permiten reproducir cada resultado de forma verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de recompensa, tasas de éxito ni comparaciones numéricas con otros métodos; sí indica que el repositorio de código contiene la evaluación que reproduce todos los resultados (`bash scripts/reproduce.sh payload figures`) y un test de aceptación (`scripts/check_policies.py`) con umbrales calibrables, pero no se aportan los valores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La observación del actor es de 48 dimensiones, por lo que las redes son de tamaño reducido, pero no se publican cifras de VRAM ni de huella de memoria.
- GPU recomendadas: no disponible. El entrenamiento descrito usa 1024 entornos paralelos y 50 M de pasos sobre mjlab (MuJoCo acelerado), lo que implica una dotación de cómputo elevada, pero no se especifican modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible; no se indica si el entrenamiento o la inferencia caben en GPU de gama de consumo.
- Opciones de despliegue: el uso previsto es el repositorio SafeRoboticsLab/odd-conditioned (rama `cleanup`), con `scripts/fetch_weights.sh` para instalar los pesos bajo `checkpoints/`, `pytest -q tests/` para las pruebas y `scripts/reproduce.sh` para la evaluación. Las dependencias citadas son safety-stable-baselines 0.4.0, robot-safety-sandbox y mjlab/MuJoCo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Tamaño de descarga: 0,4 GB para el repositorio completo; el archivo `odd-conditioned-weights-v1.tar.gz` contiene todos los checkpoints.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos comparables de filtros de seguridad condicionados por ODD para el Unitree Go2. La comparacion factible es interna al propio repositorio, entre las políticas publicadas:

| Política | Rol | Nota comparativa |
|---|---|---|
| `stand` | Experto STAND con carga W ∈ [0, 120] N y centro de masas elevado | Alta varianza entre semillas; la mayoría de reentrenamientos no supera el test de aceptación |
| `stand_wide` | Experto STAND con W ∈ [0, 150] N | Rango de carga mayor, certificado más ruidoso; base de la comparación de especificación única |
| `unified`, `unified_discounted` | Baselines de especificación única (stand-o-rest) | Una sola política para ambos modos, frente al enfoque por modos con embudos certificados |
| `getup` | Embudo certificado REST → STAND | Aporta la garantía de transición que los baselines de especificación única no separan |
| `descend` | Embudo certificado STAND → REST | Complementario de `getup` en el autómata de modos |
| `leg_stand` | Experto STAND con pata delantera derecha degradada | Control negativo del estudio |
| `compound_stand`, `compound_rest` | Expertos para pata degradada con 80 N de carga | Cubren la combinación de fallo de actuador y carga simultáneos |

## Limitaciones y advertencias

- Varianza de entrenamiento: cada política es una única ejecución con semilla 0. Las políticas de tipo postura (`stand`, `compound_stand`) varían mucho entre semillas y la mayoría de los expertos `stand` reentrenados no supera el test de aceptación que sí pasa el modelo liberado; esto limita la reproducibilidad directa del rendimiento.
- Dominio restringido: los certificados están entrenados para rangos concretos de carga (0-120 N para `stand`, 0-150 N para `stand_wide`, 80 N en las compuestas) y para el caso concreto de degradación de la pata delantera derecha. Fuera de esas condiciones no hay garantía.
- Solo simulación: toda la información procede de MuJoCo/mjlab; no se documenta transferencia a robot físico ni *sim-to-real*, por lo que el comportamiento en hardware real no está avalado por los datos disponibles.
- Alcance adversarial limitado: el entrenamiento usa un empuje adversarial aprendido de hasta 25 N; perturbaciones mayores quedan fuera de lo cubierto.
- Dependencia de la pila de código: los pesos están pensados para el repositorio SafeRoboticsLab/odd-conditioned (rama `cleanup`) y requieren safety-stable-baselines 0.4.0 y robot-safety-sandbox; no son un artefacto autónomo.
- Falta de la política de marcha: la marcha nominal no está en este repositorio, sino en go2_atomic_skills; sin ella, la cobertura del modo walk no está completa aquí.
- Ausencia de capacidades de lenguaje, visión o audio: cualquier caso de uso conversacional o multimodal queda fuera de alcance.
- Validación comunitaria nula: 0 descargas y 0 *likes* en el momento de la consulta, sin evidencia de uso externo.
- Licencia MIT: permite uso comercial y modificación, con el descargo habitual de garantías; conviene conservar el aviso de copyright y verificar las licencias de las dependencias.
- En el escenario concreto de un filtro de seguridad, un certificado que no se cumple puede traducirse en daño físico al robot o a su entorno; el proyecto ofrece test de aceptación y calibración de umbrales precisamente por este motivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/buzinguyen/odd-conditioned-dev
- Pesos agregados: https://huggingface.co/buzinguyen/odd-conditioned-dev/resolve/c923466bd1c68132b643f6806b9e8a2c532e4f1f/odd-conditioned-weights-v1.tar.gz
- Código, documentación y evaluación: https://github.com/SafeRoboticsLab/odd-conditioned/tree/cleanup (rama `cleanup`)
- Política de marcha nominal (go2_atomic_skills): https://github.com/SafeRoboticsLab/go2_atomic_skills
- Tareas de entrenamiento (robot-safety-sandbox, rama `project/odd-conditioned`): https://github.com/SafeRoboticsLab/robot-safety-sandbox/tree/project/odd-conditioned
- mjlab y safety-stable-baselines se citan en la model card como dependencias, pero no se proporciona URL en la información disponible.
