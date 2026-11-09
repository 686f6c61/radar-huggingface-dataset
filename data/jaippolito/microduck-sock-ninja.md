# jaippolito/microduck-sock-ninja

## Resumen

microduck-sock-ninja es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot bípedo open source microduck, un androide de 25 cm desarrollado conjuntamente por Pollen Robotics y Hugging Face. El modelo no es un modelo de lenguaje ni un transformer generativo: es una política neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX y distribuida mediante la librería `microduck`. Su nombre, "sock-ninja", hace referencia a la tarea de entrenamiento: una política de marcha perpetua orientada a la locomoción continua del robot.

El modelo se publica como una "policy slot" cargable en el daemon del robot mediante el comando `robotctl policy load`, con el normalizador de observaciones integrado dentro del propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El repositorio incluye un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

La relevancia de esta ficha es limitada y muy específica: se trata de un artefacto de investigación en robótica con refuerzo, sin descargas ni interacciones registradas, sin licencia declarada y sin documentación sobre idiomas o rendimiento comparado. No debe confundirse con un modelo fundacional ni evaluarse con las métricas habituales de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control motriz (reinforcement learning); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Libreria | `microduck` |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo en simulación usando el stack `mjlab-microduck 0.1.0` (commit base `1efd853be`), sobre la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `5cee942d8`). El entrenamiento arrancó el 2026-11-08T19:30:22Z con semilla 1, 2048 entornos paralelos y un máximo de 1000 iteraciones del agente, registrando en TensorBoard bajo el nombre de ejecución `heist-dell1`. El checkpoint publicado corresponde al paso 999.

El autor advierte explícitamente de que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política "comparable", no idénticos pesos. La arquitectura interna de la red (número de capas, anchura, función de activación) no se detalla en la model card, por lo que no es posible describirla con precisión. El normalizador de observaciones está embebido en el ONNX, lo que elimina una fuente habitual de errores de integración en despliegue.

## Capacidades

- Locomoción bípeda continua del robot microduck a 50 Hz, descrita por el autor como política "perpetua": se ejecuta hasta que se le indique lo contrario.
- Control motor de 14 acciones a partir de observaciones crudas de 61 dimensiones.
- Integración directa con el daemon del robot mediante `robotctl policy load <slot> jaippolito/microduck-sock-ninja`.
- Normalización de observaciones incluida en el grafo ONNX, sin preprocesado externo.
- Declaración de conformidad con el esquema 2 del manifiesto de políticas de microduck.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes conversacionales, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de una marcha lista para usar en un microduck físico: cargar la política en un slot del daemon con `robotctl policy load` y dejar que el robot camine de forma continua sin intervención.
- Evaluación de referencia en el reto `Mjlab-SockHeist6m-MicroDuck`: sirve como baseline de comparación frente a políticas propias entrenadas con el mismo stack `mjlab-microduck`.
- Reproducción de experimentos de RL en robótica: el comando de entrenamiento documentado permite regenerar políticas comparables para estudiar la varianza entre ejecuciones con la misma semilla.
- Pruebas de integración del pipeline de políticas: al incluir el normalizador en el ONNX y un `manifest.json` conforme al esquema 2, es útil para validar el flujo de carga de políticas en el daemon antes de desplegar modelos propios.
- Docencia y divulgación en robótica con refuerzo: un artefacto pequeño, con comando de reproducción completo y dependencias fijadas por `uv.lock`, adecuado para talleres prácticos sobre simulación a realidad.
- Benchmarking de infraestructura de inferencia ONNX en hardware embebido: permite medir latencia y estabilidad de un bucle de control a 50 Hz en la electrónica del microduck.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito de la tarea, distancia recorrida ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se declara el número de parámetros, por lo que no puede estimarse a partir de los datos publicados.
- GPU recomendadas: no disponibles. El destino natural es la electrónica embebida del propio microduck, no un servidor con GPU.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX dentro del daemon de microduck mediante `robotctl`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el bucle de control opera a 50 Hz, lo que implica un presupuesto de 20 ms por paso de inferencia; no se publican mediciones reales de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jaippolito/microduck-sock-ninja | Política RL para microduck | no disponible | no aplica | no disponible | no disponible | Hugging Face, 0 descargas |
| Otras políticas de `microduck-challenges` | Políticas RL para microduck | no disponible | no aplica | no disponible | no disponible | Repositorio de retos de Pollen Robotics |
| Políticas RL de robots bípedos open source comparables | Políticas RL | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos públicos suficientes para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial, redistribución ni modificación; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Ausencia total de métricas: no hay evidencia publicada de robustez, tasa de éxito ni comportamiento ante perturbaciones, terrenos irregulares o cargas externas.
- Entrenamiento no reproducible bit a bit: los pesos no pueden regenerarse de forma idéntica, lo que dificulta la auditoría y la depuración de fallos.
- Política "perpetua": el autor indica que se ejecuta hasta recibir una orden contraria, sin mecanismo de parada autónoma descrito en la model card; debe supervisarse el despliegue en un robot físico.
- Riesgo de brecha simulación-realidad: no se documenta ningún proceso de ajuste fino en hardware real ni de domain randomization.
- Cero descargas y cero interacciones: no existe validación por parte de terceros.
- Sin soporte de lenguaje, visión ni audio: cualquier expectativa derivada de la etiqueta "modelo" en sentido amplio es incorrecta.
- Fecha de creación declarada en 2026-11-08, posterior a la información de prensa disponible sobre el lanzamiento del robot; conviene verificar la procedencia y vigencia del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaippolito/microduck-sock-ninja
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Artículo de MarkTechPost sobre microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Artículo de TechCrunch sobre microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
