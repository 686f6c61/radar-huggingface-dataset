# CWKAM/microduck-sad-duck

## Resumen

`sad-duck` (傷感鴨) es una política de control motriz para el robot bípedo de código abierto microduck de Pollen Robotics, publicada por el usuario CWKAM en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional: es una política de aprendizaje por refuerzo exportada a ONNX que se carga en una ranura de política del demonio `robotctl` del robot y se ejecuta de forma perpetua hasta que se le indique lo contrario. Consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, es decir, un bucle de control de 20 ms por paso.

El comportamiento programado es una secuencia expresiva concreta: camina 5 pasos, se sienta, baja la cabeza lentamente, la sacude y emite dos graznidos. La secuencia combina referencias de dos políticas previas del ecosistema (Pollen velstand walk y Pollen Got a Talent sitstand), conmutadas por el canal `body[0]` de la observación. Es, por tanto, una «gait» o marcha compuesta, más cercana a una animación motriz que a un agente general.

Su relevancia es de nicho pero clara: sirve como ejemplo reproducible de cómo se empaqueta una política RL para un robot de 399 dólares y 25 cm de altura, con 15 motores, cámara y sensor de profundidad, entrenado en MuJoCo según la documentación pública de la plataforma. El repositorio no incluye documentación técnica sobre la red subyacente, ni licencia declarada, ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Política neuronal exportada a ONNX y entrenada con aprendizaje por refuerzo (repo `pollen-robotics/microduck_rl`); topología de la red no documentada |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Ventana de observación de 61 dimensiones por paso de control; sin contexto textual |
| Tipos de cuantizacion | No disponible. Se distribuye un único `policy.onnx`; no se publican variantes cuantizadas |
| Idiomas soportados | No aplica. El modelo no procesa lenguaje; el nombre incluye texto en chino e inglés con fines descriptivos |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Normalizador de observaciones | Integrado en `policy.onnx`; se alimenta con observaciones en crudo |
| Tamano del repositorio | 0,0 GB segun Hugging Face (peso muy reducido, valor exacto no publicado) |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura de la red: solo se indica que la política se exportó a ONNX desde un entrenamiento de aprendizaje por refuerzo alojado en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`. La model card advierte explícitamente de que la exportación se hizo desde una copia de trabajo con cambios sin confirmar, lo que impide reproducir exactamente el binario publicado a partir del commit indicado. No se especifican número de tokens, episodios, composición del dataset ni uso de RLHF o DPO; en robótica estos términos no aplican y no se ofrece alternativa equivalente (número de entornos paralelos, pasos de simulación, función de recompensa).

El único dato técnico verificable del entrenamiento es su integración en el pipeline de microduck: observación de 61 dimensiones, 14 acciones y 50 Hz. La política combinada conmuta entre dos referencias de marcha y sedestación mediante el canal `body[0]`, un mecanismo de orquestación típico de las políticas compuestas del ecosistema microduck, no una innovación algorítmica descrita por el autor. El normalizador de observaciones está embebido en el propio ONNX, de modo que el consumidor no necesita replicar la estadística de normalización.

## Capacidades

- Locomoción bípeda pregrabada: ejecuta una secuencia de 5 pasos de marcha sobre el robot microduck.
- Sedestación y transición postural: adopta la postura sentada tomada como referencia de «Pollen Got a Talent sitstand».
- Expresividad motriz: incluye una secuencia de bajar la cabeza lentamente y sacudirla, orientada a comunicación no verbal.
- Vocalización: emite dos graznidos integrados en la secuencia.
- Ejecución perpetua: la política se repite indefinidamente hasta que se descarga o se sustituye, sin condición de terminación propia.
- Conmutación por canal de observación: el canal `body[0]` selecciona el tramo del combo, lo que permite orquestar la secuencia desde el nivel superior.
- Compatibilidad con el daemon: se carga mediante `robotctl policy load <slot> CWKAM/microduck-sad-duck` y cumple el esquema 2 del manifiesto.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo de texto.

## Casos de uso

- Demostración de robótica expresiva en ferias y museos: la política ofrece una rutina de unos segundos con marcha, sedestación, gesto de cabeza y graznidos, pensada para captar atención en un stand sin operador dedicado.
- Docencia en aprendizaje por refuerzo aplicado: sirve como ejemplo mínimo de política compuesta para explicar observaciones de 61 dimensiones, acciones de 14 dimensiones y normalización embebida en ONNX.
- Prueba de humo del pipeline de despliegue: al ser una política perpetua y autocontenida, permite validar el ciclo `robotctl policy load`, la ranura de política y el manifiesto esquema 2 antes de desplegar marchas más críticas.
- Investigación en sim-to-real: proporciona una referencia de comportamiento entrenado en simulación (MuJoCo, según la documentación de la plataforma) para comparar estabilidad de la marcha en el robot físico.
- Prototipado de interacción humano-robot: el gesto de cabeza y los graznidos permiten experimentar con percepción de estados «emocionales» por parte de usuarios sin modificar el controlador de bajo nivel.
- Composición de rutinas de mayor duración: al conmutarse por `body[0]`, la política se puede encadenar con otras marchas y posturas dentro de una coreografía o guion de demo.
- Validación de reproducibilidad: útil como caso de estudio de los riesgos de publicar artefactos exportados desde árboles de trabajo con cambios sin confirmar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de recompensa media, tasa de caídas, error de seguimiento de trayectoria ni comparaciones cuantitativas con otras políticas de microduck. Tampoco se han publicado mediciones de latencia o throughput más allá del propio periodo de control de 50 Hz que impone la plataforma.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual. La inferencia se ejecuta en la CPU del robot; el repositorio ocupa 0,0 GB en Hugging Face, lo que apunta a un modelo de pocos kilobytes o megabytes (tamaño exacto no disponible).
- GPU: no se requiere GPU para la inferencia. El entrenamiento se realizó en el ecosistema `microduck_rl`, pero no se documentan las características del hardware de entrenamiento.
- Hardware objetivo: robot microduck de Pollen Robotics, bípedo de 25 cm, 15 motores, cámara y sensor de profundidad, con precio de 399 dólares según la prensa especializada.
- Despliegue: daemon de microduck mediante `sudo robotctl policy load <slot> CWKAM/microduck-sad-duck`; el ONNX se puede ejecutar con cualquier runtime compatible con ONNX (ONNX Runtime, por ejemplo) siempre que se respeten las 61 entradas y 14 salidas a 50 Hz.
- Latencia: acotada por el bucle de control de 20 ms; no se publica el tiempo de inferencia de la red.
- Consumer GPU: irrelevante para el despliegue; cualquier equipo capaz de ejecutar ONNX Runtime sirve para validar la política en escritorio.

## Comparativa con modelos similares

| Politica | Parametros | Observacion / acciones | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CWKAM/microduck-sad-duck | No disponible | 61 / 14 a 50 Hz | No disponible | No disponible | Publica en Hugging Face, 0 descargas |
| Pollen velstand walk (referencia citada) | No disponible | No disponible | No disponible | No disponible | Referencia usada por el autor; no se aporta enlace |
| Pollen Got a Talent sitstand (referencia citada) | No disponible | No disponible | No disponible | No disponible | Referencia usada por el autor; no se aporta enlace |

No se dispone de datos cuantitativos para establecer una comparación de rendimiento con alternativas. Las dos políticas citadas son las fuentes de las que se compone el combo, no competidoras evaluadas de forma independiente.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial, redistribución o modificación; hay que contactar con el autor antes de integrarla en un producto.
- Documentación mínima: no se describe la topología de red, el número de parámetros, la función de recompensa ni las condiciones de entrenamiento, lo que impide auditar el comportamiento.
- Reproducibilidad comprometida: el propio autor indica que la exportación se hizo desde un checkout con cambios sin confirmar sobre el commit `6ff40704a`; el binario publicado no se puede regenerar de forma garantizada.
- Política de tarea única: no generaliza a instrucciones, entornos nuevos ni objetivos distintos de la secuencia programada; no es un agente y no razona.
- Sin datos de robustez: no se publican tasas de éxito, comportamiento ante perturbaciones, pendientes o superficies irregulares, ni resultados en el robot físico.
- Dependencia del canal `body[0]`: la secuencia depende de la orquestación externa para conmutar tramos; un valor inesperado en ese canal puede producir una transición no deseada.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de comportamiento inesperado fuera de distribución, sin métricas publicadas que lo acoten.
- Idiomas y sesgos: no aplica procesamiento de lenguaje; el nombre bilingüe (chino/inglés) es solo descriptivo.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación externa conocida.
- Fecha de creación del repositorio en 2026-10-28: verificar vigencia y compatibilidad con la versión actual del daemon y del esquema de manifiesto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CWKAM/microduck-sad-duck
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado: `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`)
- Especificación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- MarkTechPost, sobre Microduck y Hugging Face: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- PCMag, sobre Microduck: https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks
- Android Authority, sobre Microduck: https://www.androidauthority.com/hugging-face-launches-microduck-3704139/
