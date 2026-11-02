# lphatnguyen/microduck-sock-heist-6m-v4

## Resumen

sock-heist-6m-v4 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de locomoción que genera comandos de acción a 50 Hz a partir de observaciones de 61 dimensiones, con 14 acciones de salida, y está diseñada para ocupar el slot `walk` del firmware del robot. Lo publica el usuario lphatnguyen como artefacto experimental.

La política se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor puede alimentar observaciones en bruto sin preprocesado adicional. Su comportamiento es perpetuo: una vez cargada, ejecuta la marcha de forma continua hasta que se le indique lo contrario.

Es relevante en el contexto del ecosistema microduck porque ilustra el flujo completo de entrenamiento y despliegue de políticas RL en un robot de bajo coste, desde el repositorio de entrenamiento `pollen-robotics/microduck_rl` hasta la carga en el daemon mediante `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política de aprendizaje por refuerzo (red neuronal) exportada a ONNX; topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de destino | `walk` |
| Politica | perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de capa recurrente o feedforward). Se sabe que es una política de control entrenada con aprendizaje por refuerzo para el robot microduck, con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, ejecutándose a 50 Hz. La exportación a ONNX incluye el normalizador de observaciones dentro del grafo, lo que simplifica la integración en el daemon del robot.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `sock-heist-training`, commit `a9189869a`. No se especifican el número de pasos de entrenamiento, la composición del entorno de simulación, el algoritmo RL empleado (PPO, SAC u otro), ni si hubo transferencia sim-a-real. El nombre del modelo sugiere 6 millones de pasos o episodios, pero este dato no está confirmado en la documentación.

## Capacidades

- Locomoción cuadrúpeda: genera una marcha continua para el robot microduck en el slot `walk`.
- Control a 50 Hz: produce 14 acciones por paso de control, adecuadas para el bucle de control en tiempo real del robot.
- Política perpetua: mantiene la marcha de forma indefinida hasta que el daemon la descarga o la sustituye.
- Normalización integrada: acepta observaciones en bruto de 61 dimensiones sin preprocesado externo.
- Despliegue mediante `robotctl`: se carga con `sudo robotctl policy load walk lphatnguyen/microduck-sock-heist-6m-v4`.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni procesamiento de visión o audio.

## Casos de uso

- Locomoción de referencia en microduck: cargar la política en el slot `walk` para que el robot camine de forma autónoma en pruebas de laboratorio, aprovechando la integración directa con `robotctl`.
- Pruebas de integración del daemon: usar la política como política de marcha conocida para validar el pipeline de carga de manifiestos de esquema 2 y la inyección de observaciones en bruto.
- Comparación de políticas de marcha: servir como baseline frente a otras políticas entrenadas para el mismo slot, midiendo estabilidad, velocidad y consumo.
- Demostraciones educativas de RL en robótica: ilustrar el ciclo completo entrenamiento en `microduck_rl` y despliegue en hardware real en talleres y cursos.
- Validación sim-a-real: comprobar si una política entrenada en simulación mantiene la marcha en el robot físico con observaciones reales de 61 dimensiones.
- Investigación en control continuo: emplear la política como punto de partida para fine-tuning con recompensas específicas (velocidad, eficiencia energética, robustez ante empujes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo es una política ONNX de tamaño de repositorio 0,0 GB, por lo que la inferencia es extremadamente ligera y cabe en la CPU del propio robot o en un ordenador de placa reducida.
- VRAM estimada: no disponible con precisión; por el tamaño del artefacto, inferior a unos pocos cientos de MB en FP32.
- GPU recomendadas: no necesarias; la inferencia a 50 Hz es viable en CPU. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) ejecutaría la política con margen amplio, pero no aporta ventaja frente a CPU para este tamaño.
- Cabe en cualquier GPU consumer y en hardware embebido del robot.
- Opciones de despliegue: el daemon microduck mediante `robotctl`; ONNX Runtime para ejecución fuera del robot.
- Latencia y throughput: no disponibles; el requisito funcional es sostener 50 Hz (20 ms por paso de control).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas publicadas para el slot `walk` del microduck ni modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento simbólico.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en un producto.
- Sin benchmarks ni métricas de rendimiento publicadas: no hay evidencia documentada de estabilidad, velocidad de marcha o robustez ante perturbaciones.
- Sin información sobre el algoritmo RL, el entorno de simulación ni el número de pasos de entrenamiento, lo que dificulta evaluar la calidad y la generalización de la política.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso en hardware real.
- Política perpetua: requiere gestión explícita de parada por parte del daemon; un fallo en la supervisión puede dejar al robot ejecutando la marcha de forma indefinida.
- Riesgo de fallo sim-a-real no documentado: el comportamiento en el robot físico puede diferir del observado en simulación.
- Sin soporte multilingüe, de visión, audio ni tool calling por la propia naturaleza del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `sock-heist-training`, commit `a9189869a` (referenciado en la model card; URL exacta no disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (URL exacta no disponible)
