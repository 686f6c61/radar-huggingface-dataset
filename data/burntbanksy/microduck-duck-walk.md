# BurntBanksy/microduck-duck-walk

## Resumen

duck-walk es una política de control para el robot bípedo microduck, desarrollada por el usuario BurntBanksy y publicada en Hugging Face bajo el identificador `BurntBanksy/microduck-duck-walk`. No es un modelo de lenguaje: es una política de locomoción entrenada con aprendizaje por refuerzo en mjlab (framework de RL sobre MuJoCo) y exportada a ONNX, pensada para ocupar el slot `walk` del robot microduck de Pollen Robotics y Hugging Face. El modelo resuelve un problema muy concreto: generar una marcha estable y continua que el daemon del robot puede cargar y ejecutar en hardware real.

La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, de forma perpetua (se ejecuta hasta que un comando externo la detiene). El normalizador de observaciones está embebido dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo sin preprocesado adicional. Se distribuye junto a un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

Es relevante ahora porque el microduck es un bípedo open source de 399 dólares, 25 cm de altura y 780 g con 15 motores, presentado por Pollen Robotics y Hugging Face como plataforma de bajo coste para experimentación en IA física. En ese contexto, políticas como esta son las piezas que convierten un robot de juguete en una plataforma reproducible de investigación en sim-to-real, y su formato (ONNX + manifiesto) permite comparar y sustituir gaits sin tocar el firmware. El repositorio no tiene descargas ni likes y la model card es mínima: no hay parámetros de red, benchmarks ni detalles de recompensa documentados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (RL) y exportada a ONNX; topología de red (capas, neuronas) no disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; entrada de 61 dimensiones por paso, sin memoria recurrente declarada (política perpetua) |
| Tipos de cuantización | no disponible; se distribuye un único `policy.onnx` con el normalizador de observaciones embebido |
| Idiomas soportados | no aplica (modelo de robótica); no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Slot del robot | `walk` (tag `microduck-slot:walk`) |
| Comportamiento | perpetuo: se ejecuta hasta recibir una orden de parada o cambio de política |
| Librería / runtime | `microduck` (daemon de políticas del robot) |
| Pipeline declarado | `robotics` |
| Tamaño del repositorio | 0.0 GB (redondeado en Hugging Face) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a` |
| Fecha de creación / actualización | 2026-10-21 / 2026-10-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card es deliberadamente escueta: indica que se trata de una "microduck walking policy trained in mjlab" y que el resultado se exportó como `duck_walk.onnx`. mjlab es un entorno de entrenamiento de RL construido sobre MuJoCo, lo que sitúa el pipeline en simulación física con posterior exportación a un grafo ONNX apto para inferencia en el robot. No se documentan ni el número de capas, ni el tipo exacto de red (MLP u otra), ni el número de parámetros, ni el algoritmo de RL empleado, ni la función de recompensa, ni el número de iteraciones o de entornos paralelos.

Sí se declaran los artefactos de trazabilidad del entrenamiento: el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`. Esa referencia es el único punto de partida verificable para reproducir el entrenamiento, ya que la model card no incluye curvas de aprendizaje ni métricas de convergencia. La innovación técnica destacable, más de ingeniería de despliegue que de modelado, es que el normalizador de observaciones viaja dentro del propio fichero ONNX: el robot entrega observaciones en crudo y el grafo aplica la normalización, lo que elimina una fuente habitual de discrepancias entre simulación y hardware. La política es perpetua por diseño, es decir, no incorpora condición de terminación propia ni episodio finito; el ciclo de control externo decide cuándo parar.

## Capacidades

- Locomoción bípeda continua para el robot microduck, ejecutable como política del slot `walk`.
- Política reactiva a partir de un vector de observación de 61 dimensiones, con salida de 14 acciones articulares a 50 Hz.
- Autocontenida en un único fichero ONNX con normalización de observaciones integrada: admite observaciones en crudo.
- Carga en hardware mediante el comando `robotctl policy load walk BurntBanksy/microduck-duck-walk`, sin recompilar firmware.
- Metadatos de despliegue estandarizados vía `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.
- Comportamiento perpetuo: mantiene la marcha indefinidamente hasta que el daemon recibe otra orden.
- Reproducibilidad del entrenamiento mediante referencia explícita a repositorio, rama y commit.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Marcha por defecto del microduck: cargar la política en el slot `walk` mediante `robotctl` para que el robot camine de forma autónoma en demostraciones y pruebas de laboratorio, aprovechando que el normalizador va embebido y no requiere pipeline de preprocesado.
- Sim-to-real de referencia: ejecutar la política en el gemelo MuJoCo del microduck y comparar la traza de observaciones y acciones con la del hardware real, usando la diferencia como diagnóstico de la calidad de la modelización física.
- Punto de partida para reentrenamiento: clonar `pollen-robotics/microduck_rl` en el commit `6ff40704a`, modificar la recompensa (por ejemplo, para penalizar desviación de rumbo o forzar velocidad objetivo) y comparar la nueva política contra esta línea base en el mismo slot.
- Docencia en robótica con RL: usar un bípedo de 399 dólares y una política ONNX de carga inmediata para que el alumnado vea el ciclo completo simulación, entrenamiento, exportación y despliegue en un solo ejercicio práctico.
- Evaluación comparativa de gaits: al ser políticas intercambiables de un mismo slot, permite A/B testing entre distintas marchas sobre el mismo hardware y las mismas condiciones de suelo, midiendo estabilidad y consumo de los 15 motores.
- Integración en pipelines de control con cambio en caliente: el daemon puede cargar y descargar políticas por comando, de modo que un orquestador externo cambie entre marcha, reposo u otras habilidades según la tarea.
- Base para investigación en IA física de bajo coste: con cámara, sensor de profundidad, dos sensores de movimiento y LiDAR ToF 8x8 a bordo, la política de marcha habilita experimentos de navegación y percepción sobre una plataforma reproducible y de precio contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, robustez ante perturbaciones, ni comparaciones con otras políticas.

Los únicos datos operativos declarados por el autor se resumen en la siguiente tabla:

| Métrica declarada | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Presupuesto por paso de control | 20 ms (derivado de 50 Hz) |
| Duración del episodio | perpetua (sin terminación propia) |
| Recompensa media / retorno | no disponible |
| Tasa de caídas en hardware | no disponible |
| Latencia medida de inferencia | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Es una política de robótica en ONNX y el repositorio ocupa 0.0 GB redondeados, por lo que no se espera un requisito de memoria de GPU significativo, pero el dato no está publicado.
- GPU recomendadas: no se documenta ninguna. El caso de uso natural es la inferencia en el propio robot o en una CPU; no hay cifras de latencia que permitan justificar aceleración por GPU.
- ¿Cabe en GPU de consumo? Con toda probabilidad sí, dado el tamaño del artefacto, pero no hay confirmación ni mediciones publicadas al respecto.
- Cómputo a bordo del microduck: no disponible en la información proporcionada (el robot se describe con 15 motores, cámara, sensor de profundidad, dos sensores de movimiento, pico articulado y LiDAR ToF 8x8, sin detallar la unidad de cómputo).
- Opciones de despliegue: daemon de políticas de microduck mediante `robotctl policy load walk BurntBanksy/microduck-duck-walk`; ejecución del grafo `policy.onnx` con un runtime ONNX (el proveedor de ejecución concreto no se especifica); simulación en MuJoCo/mjlab para validación previa.
- Latencia y throughput: el bucle de control está fijado a 50 Hz, es decir, 20 ms por paso, pero no se publica la latencia real de inferencia ni el margen disponible dentro de ese presupuesto.
- Almacenamiento: el repositorio aparece como 0.0 GB redondeado en Hugging Face; no se indica el tamaño exacto del fichero ONNX.

## Comparativa con modelos similares

No se dispone de datos verificables de otras políticas del ecosistema microduck (otros slots o autores) ni de métricas que permitan una comparación cuantitativa. La siguiente tabla recoge únicamente lo que puede afirmarse con la información disponible.

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Datos públicos |
|---|---|---|---|---|---|
| BurntBanksy/microduck-duck-walk | Política RL en ONNX para microduck, slot `walk` | 61 / 14 | 50 Hz | no disponible | Model card mínima, 0 descargas, 0 likes |
| Otras políticas del slot `walk` para microduck | Política RL para el mismo robot | no disponible | no disponible | no disponible | no disponible en la búsqueda realizada |
| Políticas de locomoción de cuadrúpedos tipo legged_gym / IsaacLab | Políticas RL para robots de patas | no disponible | habitualmente 50 Hz en la literatura, sin confirmar para este caso | variable según proyecto | no comparable: otro hardware, otras dimensiones de observación y acción |
| Políticas de bípedos comerciales (p. ej. Unitree) | Políticas RL propietarias o parcialmente abiertas | no disponible | no disponible | habitualmente propietaria | no disponible |

La comparación honesta es que esta ficha no puede establecer una comparativa de rendimiento: no hay benchmarks propios ni de alternativas equivalentes sobre el mismo robot.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia explícita no puede asumirse permiso para uso comercial, redistribución o modificación. Es un bloqueo legal potencial para cualquier despliegue en producto.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin issues ni discusión pública asociada.
- Documentación mínima: no se especifican arquitectura de red, número de parámetros, recompensa, dominio de aleatorización, ni procedimiento de sim-to-real.
- Sin benchmarks ni métricas de robustez: no hay datos de tasa de caídas, estabilidad ante empujes, comportamiento en pendientes o superficies deslizantes, ni consumo de los motores.
- Riesgo de sobreajuste a la dinámica simulada: al entrenarse en mjlab, el rendimiento en hardware depende de la fidelidad del modelo MuJoCo del microduck y de las condiciones reales del terreno, aspecto no documentado por el autor.
- Comportamiento perpetuo sin condición de parada interna: si el ciclo de control externo falla, la política seguirá emitiendo acciones; la seguridad debe gestionarse en la capa del daemon.
- Alcance limitado al slot `walk`: no cubre otras habilidades ni transiciones; para tareas distintas hace falta otra política compatible.
- Idiomas y sesgos: no aplica en el sentido habitual, pero no hay ningún análisis de sesgo de comportamiento (por ejemplo, asimetría de marcha o dependencia de una orientación inicial concreta).
- Fechas del repositorio (octubre de 2026) y ausencia de historial de versiones: no puede evaluarse la evolución ni la madurez del artefacto.
- No debe confundirse con un modelo de lenguaje: no procesa texto, no tiene ventana de contexto y no admite instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BurntBanksy/microduck-duck-walk
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado en la model card: `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a` (https://github.com/pollen-robotics/microduck_rl)
- Esquema del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (referenciado en la model card)
- mjlab, framework de entrenamiento RL sobre MuJoCo citado por el autor: https://github.com/mujocolab/mjlab
- Cobertura de MarkTechPost sobre microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de CNX Software: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Cobertura de TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Análisis de hardware y flujo sim-to-real en Circuit Rock: https://blog.circuit.rocks/microduck-a-399-open-source-biped-robot-for-physical-ai-labs
