# RSanchez996/microduck-sock-heist-6m-run-1101-1520

## Resumen

microduck-sock-heist-6m-run-1101-1520 es una política de control entrenada mediante aprendizaje por refuerzo (PPO) para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional generativo: es un artefacto de robótica empaquetado en formato ONNX que implementa una política de locomoción "perpetua" a 50 Hz, con 61 dimensiones de observación y 14 acciones de control. Lo publica el usuario RSanchez996 en Hugging Face bajo la librería `microduck`, y se deriva de un walker preentrenado de Pollen sobre el que se ha aplicado un ajuste fino con recompensas de sprint.

El objetivo concreto de esta política es resolver una tarea de tipo "sock heist" (carrera con semáforo): el robot debe esprintar en verde y detenerse de forma segura en rojo. Tras 1500 iteraciones de entrenamiento con 4096 entornos paralelos, el autor reporta un tiempo de 8,595 s en 5 de 5 ejecuciones, lo que supone una mejora del 8,31 % respecto a la mejor política anterior. Es relevante ahora porque forma parte de un ecosistema emergente de políticas robóticas reutilizables y cargables en caliente mediante el daemon `robotctl`, un patrón de despliegue que simplifica la experimentación en robótica de bajo coste.

El repositorio tiene un tamaño declarado de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre licencia ni idiomas. La model card es escueta pero técnicamente precisa: documenta la receta de entrenamiento, la semilla, el commit exacto y el comando de reproducción, lo que permite auditar el proceso aunque no garantiza reproducibilidad bit a bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con PPO (no se especifica la topología de red exacta; se distribuye como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje); ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Normalizador de observaciones | Integrado en `policy.onnx` (se alimenta con observaciones en crudo) |

## Arquitectura y entrenamiento

La política se entrena con PPO (Proximal Policy Optimization) partiendo del walker preentrenado de Pollen Robotics, sobre el que se aplica un ajuste fino con recompensas de sprint. El entorno de entrenamiento es `Mjlab-SockHeist6m-MicroDuck`, definido en el repositorio `RSanchez996/microduck-challenges`, con la tarea de esprintar en verde y detenerse de forma segura en rojo. El entrenamiento se ejecuta con 4096 entornos paralelos durante 1500 iteraciones, con semilla 22, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be` y el commit `99e0ae35b`.

La innovación principal no está en la arquitectura de red (que no se detalla en la información disponible), sino en el empaquetado: el normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el consumidor puede alimentar observaciones en crudo sin preprocesado adicional. Además, el manifiesto `manifest.json` sigue el schema 2 del manifiesto de políticas de microduck, lo que permite cargar la política en un slot del daemon `robotctl` en caliente. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas, aunque sí reproducible en comportamiento con el mismo código, `uv.lock`, comando y semilla.

## Capacidades

- Locomoción cuadrúpeda perpetua: la política corre de forma continua hasta que se le indique lo contrario, sin horizonte de episodio fijo.
- Control a 50 Hz con 61 observaciones de entrada y 14 acciones de salida, adaptado a la cinemática y dinámica del microduck.
- Comportamiento de carrera con recompensas de sprint: optimizada para minimizar el tiempo de recorrido en verde.
- Parada segura en rojo: la política incorpora el comportamiento de detenerse de forma segura ante señal roja, no solo de esprintar.
- Carga en caliente en un slot de política mediante `robotctl policy load <slot> <repo>`.
- Alimentación con observaciones en crudo gracias al normalizador integrado en el ONNX.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo generativo.

## Casos de uso

- Despliegue en el robot microduck real: cargar la política en un slot con `sudo robotctl policy load <slot> RSanchez996/microduck-sock-heist-6m-run-1101-1520` y ejecutarla como gait perpetua para tareas de carrera con semáforo.
- Benchmarking de políticas de locomoción: usar el tiempo reportado de 8,595 s (5/5 ejecuciones) como referencia para comparar nuevas políticas entrenadas sobre el mismo entorno `Mjlab-SockHeist6m-MicroDuck`.
- Investigación en aprendizaje por refuerzo: servir como punto de partida (fine-tuning) para experimentos con otras recompensas o entornos, dado que parte del walker preentrenado de Pollen.
- Validación de pipelines de despliegue: probar el flujo completo de `robotctl` y el manifiesto schema 2 con una política real antes de desplegar políticas propias en producción.
- Docencia y demos de robótica de bajo coste: el microduck es una plataforma asequible y esta política permite demostrar locomoción aprendida con parada condicionada por señal.
- Reproducción de experimentos: clonar `microduck-challenges` en el commit `99e0ae35b`, ejecutar `uv sync` y lanzar el comando de entrenamiento documentado para generar políticas comparables.
- Evaluación de robustez de políticas perpetuas: al no tener horizonte de episodio, sirve para estudiar deriva, acumulación de error y estabilidad a largo plazo en control continuo.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo de recorrido (tarea sock heist 6 m) | 8,595 s | 5 de 5 ejecuciones completadas |
| Mejora frente a la mejor política anterior | 8,31 % | Respecto al mejor resultado previo del autor |
| Iteraciones de entrenamiento | 1500 | Con 4096 entornos paralelos |
| Frecuencia de control | 50 Hz | Especificación del entorno microduck |

No se han publicado resultados de benchmarks estandarizados (tipo MMLU, HumanEval o GSM8K) en la información disponible, ya que no se trata de un modelo de lenguaje. Los únicos datos de rendimiento son los de la tarea de locomoción descritos arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se documenta el tamaño del grafo ONNX ni el número de parámetros.
- GPU recomendadas: no disponible. Para entrenamiento, el autor reporta 4096 entornos paralelos y 1500 iteraciones, lo que implica una GPU de datacenter, pero no se especifica el modelo concreto.
- Compatibilidad con GPU de consumo: no confirmada; al desconocerse el tamaño del modelo, no puede afirmarse que quepa en una RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: el despliegue previsto es en el robot microduck mediante el daemon `robotctl` y el runtime `microduck`; el formato ONNX permite en principio ejecución con ONNX Runtime, pero no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de artefacto).
- Latencia y throughput: la política opera a 50 Hz (20 ms por paso de control); no se publican cifras de latencia de inferencia ni de throughput por hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sock-heist-6m-run-1101-1520 | Política RL (PPO) para microduck | no disponible | 61 obs / 14 acciones a 50 Hz | 8,595 s en tarea sock heist (5/5) | no disponible | Hugging Face (`RSanchez996`) |
| Walker preentrenado de Pollen (base) | Política RL para microduck | no disponible | Entorno microduck | No disponible en la información proporcionada | no disponible | Ecosistema Pollen Robotics |
| Políticas previas del mismo autor en `microduck-challenges` | Políticas RL para microduck | no disponible | Entorno microduck | Referencia de mejora del 8,31 % | no disponible | Repositorio GitHub del autor |

No se dispone de datos suficientes para comparar con políticas de otros autores o con modelos de otras plataformas robóticas; la comparativa se limita al linaje directo de esta política.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política entrenada con recompensas específicas de sprint y parada, puede exhibir comportamientos no deseados fuera de la distribución de entrenamiento (por ejemplo, ante señales ambiguas o condiciones de iluminación distintas).
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero existe riesgo de generalización incorrecta a escenarios no vistos durante el entrenamiento.
- Limitaciones de contexto o idioma: no aplica idioma; la política está atada a la morfología y dinámica del microduck y a la distribución de observaciones del entorno `Mjlab-SockHeist6m-MicroDuck`.
- Restricciones de licencia: la licencia no está disponible, por lo que no puede confirmarse el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Reproducibilidad: el autor advierte que el entrenamiento no es bit-reproducible entre máquinas; la misma receta produce políticas comparables pero no idénticas.
- Estado del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin validación externa documentada; el tamaño del repositorio es de 0,0 GB, lo que conviene verificar antes de asumir que los pesos están completos.
- Dependencia de infraestructura: requiere el daemon `robotctl` y el runtime `microduck`; no es un artefacto autónomo fuera de ese ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RSanchez996/microduck-sock-heist-6m-run-1101-1520
- Repositorio de retos y entrenamiento: https://github.com/RSanchez996/microduck-challenges.git
- Repositorio de microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como URL directa en la información proporcionada.
