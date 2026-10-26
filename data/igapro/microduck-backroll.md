# IgaPro/microduck-backroll

## Resumen

`IgaPro/microduck-backroll` es una política de control entrenada por refuerzo para el robot microduck del ecosistema de Pollen Robotics. Su comportamiento es concreto y acotado: ejecutar un giro hacia atrás (backward roll) y volver a una postura erguida en un episodio de 4,0 segundos. No es un modelo de lenguaje ni un modelo generativo multimodal, sino un controlador reactivo que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, exportado en formato ONNX para su ejecución en el robot mediante el daemon `robotctl`.

El interés de la ficha es limitado pero real para quien trabaja en robótica con aprendizaje por refuerzo: se trata de un ejemplo de política episódica entrenada en simulación con la tarea `Mjlab-Backroll-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl`, exportada desde la rama `backroll`. El autor advierte explícitamente de que solo se ha probado en simulación y no en un robot físico, y recomienda probarla sobre una superficie blanda.

La relevancia ahora mismo es la de un artefacto temprano y de nicho: cero descargas, cero likes, repositorio de 0,0 GB, licencia no declarada y sin resultados de benchmarks publicados. Cualquier evaluación seria del modelo debe partir de esa base: es una política de investigación reproducible, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de control entrenada por refuerzo; la model card no especifica la topología de la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política episódica; 61 dimensiones de observación por paso, episodio de 4,0 s a 50 Hz) |
| Tipos de cuantizacion | No documentados; se distribuye una exportación ONNX (`policy.onnx`) sin cuantizaciones publicadas |
| Idiomas soportados | No aplica (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimensiones de observacion | 61 |
| Dimensiones de accion | 14 |
| Frecuencia de control | 50 Hz |
| Duracion del episodio | 4,0 s |
| Normalizador de observaciones | Integrado en `policy.onnx` (se alimenta con observaciones en bruto) |
| Libreria / pipeline | `microduck` / `robotics` |
| Tarea de entrenamiento | `Mjlab-Backroll-Flat-MicroDuck` |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `backroll`, commit `b02fdea49` |
| Fecha de publicacion | 2026-10-26 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de red: la model card solo indica que es una política entrenada por refuerzo, episódica, con 61 entradas de observación y 14 salidas de acción a 50 Hz. No se especifica si el actor es un perceptrón multicapa, una red recurrente ni el algoritmo de entrenamiento (PPO u otro), por lo que estos datos deben considerarse no disponibles. El normalizador de observaciones está embebido en el grafo ONNX, de modo que el consumidor debe entregar observaciones sin normalizar.

El entrenamiento se realizó con la pila `mjlab` sobre la tarea `Mjlab-Backroll-Flat-MicroDuck` del repositorio `pollen-robotics/microduck_rl`, en la rama `backroll` y en el commit `b02fdea49`. El autor señala que la exportación se hizo desde un checkout con cambios sin commitear, lo que introduce una discrepancia no reproducible entre el código publicado y los pesos exportados. No se documentan número de tokens equivalentes, composición del dataset (al tratarse de RL en simulación, distribución de estados y currículo), ni uso de RLHF o DPO, que no aplican en este dominio. Tampoco se detalla la innovación técnica del entrenamiento más allá de la propia tarea de backward roll.

## Capacidades

- Ejecución de una habilidad motora concreta: giro hacia atrás completo y retorno a postura erguida al final del episodio.
- Control reactivo a partir de observaciones propioceptivas de 61 dimensiones, con salida de 14 acciones articulares a 50 Hz.
- Política episódica autónoma de 4,0 s: no requiere planificación de alto nivel ni entrada de lenguaje.
- Inferencia en formato ONNX, ejecutable mediante el daemon `robotctl` con `robotctl policy add` y `robotctl robot do backroll`.
- Integración con el manifiesto de políticas de microduck (esquema 2), lo que permite su instalación y ejecución estandarizada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en sim-to-real para robótica cuadrúpeda: la política permite estudiar la brecha entre simulación y robot físico en una habilidad acrobática concreta, comparando la ejecución en MuJoCo con la del hardware real sobre superficie blanda.
- Prueba de recuperación tras caída: el comportamiento de incorporación al final del episodio sirve para validar rutinas de auto-recuperación antes de integrarlas en un repertorio mayor de habilidades.
- Docencia y divulgación en aprendizaje por refuerzo: es un ejemplo pequeño y autocontenido (ONNX + manifiesto) para ilustrar el ciclo entrenamiento en `mjlab`, exportación e instalación en robot.
- Evaluación de infraestructura de despliegue: permite probar el flujo `robotctl policy add` / `robotctl robot do`, la compatibilidad del manifiesto de esquema 2 y la latencia del runtime ONNX en el ordenador del robot.
- Generación de datos y comparación de controladores: sirve como referencia base frente a otras políticas del mismo robot en experimentos de estabilidad, consumo de par o suavidad de trayectoria.
- Pruebas de seguridad en banco: al ser una habilidad acrobática no validada en hardware, es útil para ensayar protocolos de parada, límites de corriente y superficies de prueba antes de habilitar movimientos similares en un robot de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara parámetros de ejecución verificables (episodio de 4,0 s, 50 Hz, 61 observaciones, 14 acciones, retorno a postura erguida) y no incluye métricas de recompensa, tasa de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publica tamaño del grafo ONNX ni número de parámetros; el repositorio ocupa 0,0 GB en HuggingFace.
- GPU recomendadas: no aplica para inferencia según la información disponible; el despliegue previsto es en el propio robot a través del daemon `robotctl` con runtime ONNX.
- GPU para reentrenamiento: no disponible en la ficha; la pila `mjlab` (MuJoCo MJX) se ejecuta sobre GPU, pero no se documentan modelos concretos ni horas de entrenamiento.
- ¿Cabe en GPU de consumo? No hay datos publicados. Por el formato ONNX y el pipeline de robótica embebida, es razonable esperar ejecución en CPU, pero se trata de una inferencia no confirmada por el autor.
- Opciones de despliegue: `robotctl` (daemon de microduck) con `policy.onnx`; cualquier runtime compatible con ONNX (por ejemplo, ONNX Runtime) para pruebas fuera del robot.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso), que marca el presupuesto de cómputo del bucle de control, no una medición del modelo.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables publicadas con datos verificables (parámetros, contexto o rendimiento). La comparación se limita a aspectos estructurales declarados en la información disponible.

| Modelo | Plataforma | Tipo | Duracion de episodio | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| IgaPro/microduck-backroll | microduck | Política RL episódica (backward roll) | 4,0 s | ONNX | No disponible | No publicados |
| Otras políticas del ecosistema microduck | microduck | Políticas RL | No disponible | No disponible | No disponible | No disponible |
| Políticas RL de cuadrúpedos comerciales | Plataformas propietarias | Políticas RL | No disponible | No disponible | Propietaria | No disponible |

## Limitaciones y advertencias

- Solo validada en simulación: el autor indica explícitamente que no se ha probado en un robot real y recomienda hacerlo primero sobre una superficie blanda.
- Exportación no reproducible: los pesos se exportaron desde un checkout con cambios sin commitear, por lo que el commit `b02fdea49` no garantiza reproducir exactamente el artefacto publicado.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución o modificación; conviene contactar con el autor antes de integrarla en un producto.
- Alcance funcional mínimo: ejecuta una única habilidad de 4,0 s; no hay percepción, planificación, navegación ni adaptación a terreno más allá de lo aprendido en la tarea plana `Flat`.
- Dependencia de morfología y calibración: al tratarse de una política propioceptiva específica del microduck, cualquier cambio de hardware, masas o calibración de articulaciones puede degradar el comportamiento.
- Riesgo de daño físico: una acrobacia no validada en hardware puede provocar impactos en la estructura o en los actuadores; requiere límites de par, parada de emergencia y superficies acolchadas.
- Sin métricas de robustez: no se publican tasas de éxito, sensibilidad a ruido de sensores ni análisis de distribución fuera del dominio de entrenamiento.
- Sin soporte de lenguaje ni multilingüe: no aplica como modelo de texto; no debe evaluarse con criterios de LLM (MMLU, HumanEval, GSM8K).
- Sesgos: no se documenta ningún análisis de sesgo; en este dominio el equivalente sería el sesgo hacia la dinámica simulada, no evaluado por el autor.
- Advertencia de seguridad de contenido: la model card es material de referencia del autor; sus instrucciones de instalación deben verificarse contra la documentación oficial del daemon antes de ejecutarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IgaPro/microduck-backroll
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl (rama `backroll`, commit `b02fdea49`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciada en la model card, sin URL directa disponible)
- `mjlab` (pila de entrenamiento citada en la tarea `Mjlab-Backroll-Flat-MicroDuck`): sin enlace proporcionado en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
