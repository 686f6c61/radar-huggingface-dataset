# SmonSE/microduck-sprint-first

## Resumen

microduck-sprint-first es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su ejecución en el robot. El autor es SmonSE y se distribuye a través de Hugging Face con la librería `microduck`.

La política se presenta como "perpetua": una marcha que se ejecuta de forma continua hasta recibir una orden de parada, pensada para cargarse en una ranura de política del daemon del robot mediante el comando `robotctl policy load`. El entrenamiento se realizó con el entorno `mjlab` (basado en MuJoCo) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos, 250 iteraciones y semilla 1, partiendo de la base `mjlab-microduck 0.1.0`.

El interés de esta ficha es limitado para el público habitual de modelos generativos: se trata de un artefacto de robótica con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin benchmarks publicados y sin licencia declarada. Resulta relevante únicamente como ejemplo de política de locomoción reproducible dentro del ecosistema microduck y como referencia para quien quiera replicar el pipeline de entrenamiento con `microduck-challenges`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL empaquetada en ONNX; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, activaciones ni tipo de política, p. ej. MLP o red recurrente). Lo que sí se documenta es el pipeline de entrenamiento: la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, rama `main`, commit `5cee942d8`, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El entrenamiento usó 4096 entornos simulados en paralelo, un máximo de 250 iteraciones del agente, semilla 1 y logging a TensorBoard, alcanzando el checkpoint 249.

Un detalle técnico relevante es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock`, comando y semilla produce una política "comparable", no idéntica. No se especifican en la información proporcionada la composición del dataset (al ser RL en simulación, la "data" son rollouts del entorno), la función de recompensa ni si hubo fases adicionales de ajuste.

## Capacidades

- Locomoción continua del robot microduck: la política ejecuta una marcha ("sprint") de forma perpetua hasta que se le indique lo contrario.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, adaptado a la morfología y a la interfaz del daemon del robot.
- Integración directa con el daemon mediante `robotctl policy load <slot> SmonSE/microduck-sprint-first`.
- Autocontenida: el normalizador de observaciones va incluido en el ONNX, por lo que no requiere etapas externas de normalización.
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`manifest.json`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en una ranura y dejar que el robot camine de forma continua en una superficie plana, útil para validar el hardware y el firmware del daemon.
- Pruebas de integración del daemon `robotctl`: usar esta política como carga de referencia para verificar el flujo de `policy load`, la lectura del `manifest.json` y la inyección de observaciones en crudo.
- Reproducción de experimentos de RL: servir como punto de partida para replicar el entrenamiento con `microduck-challenges` (mismo commit, `uv.lock` y semilla) y comparar políticas resultantes.
- Benchmark interno de simulación: emplear la política como baseline de velocidad ("sprint") frente a otras marchas entrenadas en la misma tarea.
- Docencia y divulgación en robótica: ejemplo compacto de extremo a extremo (entrenamiento en `mjlab`, exportación a ONNX, despliegue en robot) para talleres prácticos.
- Investigación en sim-to-real: evaluar la transferencia de una política entrenada con 4096 entornos paralelos a un microduck físico, midiendo degradación respecto a la simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del artefacto (observación de 61 dimensiones, 14 acciones, repo de 0.0 GB) se espera que la política sea muy ligera y quepa holgadamente en cualquier GPU consumer, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. Para el entrenamiento, la model card indica 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100/H100 o similar); no se especifica el hardware exacto empleado.
- Compatibilidad con GPU consumer: probable para inferencia (formato ONNX), no confirmada por el autor.
- Opciones de despliegue: runtime ONNX dentro del daemon microduck (`robotctl`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica otras políticas de locomoción para microduck ni modelos comparables de la misma categoría con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no admite instrucciones en lenguaje natural.
- Comportamiento "perpetuo": la política camina hasta que se le ordena parar; no se documenta cómo gestiona obstáculos, terrenos irregulares o perturbaciones externas.
- Entrenamiento no bit-reproducible: misma semilla y mismo código producen pesos distintos; no debe asumirse equivalencia exacta entre ejecuciones.
- Licencia no declarada: no hay autorización explícita para uso comercial ni condiciones de redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad, sin issues ni reportes de uso real.
- Sin métricas publicadas de robustez, sim-to-real ni tasa de éxito; el rendimiento en un robot físico es desconocido.
- Dependencia estricta del ecosistema microduck y del esquema 2 del manifiesto de políticas; no es portable a otras plataformas sin adaptación.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, pero sí existe riesgo de comportamiento fuera de distribución si las observaciones recibidas difieren de las del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmonSE/microduck-sprint-first
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` del repositorio del daemon (URL exacta no disponible en la información proporcionada)
