# Nico-robot/microduck-i-stole-it-again

## Resumen

`microduck-i-stole-it-again` es una política de control robótico publicada por el usuario Nico-robot en Hugging Face dentro de lo que el autor denomina Microduck Arena. El artefacto principal es `policy.onnx`, un grafo en formato ONNX que, según la model card, recibe una observación de 61 valores y devuelve 14 consignas de articulación a una frecuencia de 50 Hz. El repositorio se publicó el 16 de septiembre de 2026 y actualizó ese mismo día, con 0 descargas y 0 likes.

No es un modelo de lenguaje ni un modelo multimodal: es una política de control, es decir, una función que mapea el estado observado del robot a comandos de actuadores. Por la interfaz declarada (61 entradas, 14 salidas, 50 Hz), encaja en el patrón habitual de las políticas de aprendizaje por imitación o de control reactivo entrenadas en simulación o con demostraciones y exportadas a ONNX para su despliegue en el bucle de control.

La relevancia del artefacto es fundamentalmente práctica: el formato ONNX y la presencia de un `manifest.json` como contrato de interfaz permiten integrar la política en un runtime de inferencia sin depender del framework de entrenamiento. Sin embargo, la model card no aporta información sobre arquitectura interna, número de parámetros, datos de entrenamiento, licencia de uso ni resultados de evaluación, lo que limita seriamente cualquier valoración técnica o su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; se distribuye como grafo ONNX (`policy.onnx`) sin detalle de capas en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 61 valores de observacion) |
| Tipos de cuantizacion | no disponible; se publica un unico artefacto ONNX sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica (modelo de control robótico, sin salida en lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` como contrato de interfaz |
| Entrada | vector de observacion de 61 valores |
| Salida | 14 consignas de articulacion (joint targets) |
| Frecuencia de control | 50 Hz |
| Categoria declarada | `microduck-policy`, `microduck`, `robotics` |
| Libreria declarada | onnx |
| Tamano del repositorio | 0.0 GB (reportado por Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-16 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de red. El autor indica únicamente que `policy.onnx` es una «Microduck policy» con 61 valores de observación de entrada, 14 objetivos articulares de salida y 50 Hz, y remite a `manifest.json` para el contrato completo. No se especifica si se trata de un perceptrón multicapa, una red convolucional, un transformer de política, un modelo de difusión o un híbrido, ni tampoco el número de capas, el tamaño de las activaciones o el esquema de normalización de las observaciones y las acciones.

Tampoco hay datos sobre el entrenamiento: no se indica el número de tokens o transiciones, la composición del dataset, si se usó aprendizaje por imitación, aprendizaje por refuerzo, RLHF o DPO, ni qué simulador o plataforma física generó las demostraciones. El único elemento verificable es la existencia del grafo exportado y del manifiesto, lo que sugiere un flujo de trabajo de entrenamiento externo seguido de exportación a ONNX para despliegue. Cualquier afirmación adicional sobre innovaciones técnicas sería especulativa.

## Capacidades

- Control robótico de bucle cerrado: transforma una observación de 61 valores en 14 consignas de articulación, pensadas para enviarse a los controladores del robot a 50 Hz.
- Inferencia portable: al estar en formato ONNX, el grafo puede ejecutarse en distintos runtimes (ONNX Runtime, TensorRT) y sobre CPU o GPU sin recompilar.
- Contrato de interfaz explícito: el `manifest.json` define la forma de la entrada y la salida, lo que facilita la validación de formas y tipos antes de desplegar.
- Integración en pipelines de robótica: puede envolverse en un nodo de ROS 2 o en un bucle de control propio que gestione temporización y límites de seguridad.
- No dispone de generación de texto, razonamiento simbólico, código ni matemáticas.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingües, de visión, de audio ni de modo de pensamiento (thinking mode) documentadas.
- No hay evidencia publicada de generalización a tareas, morfologías o entornos distintos de aquellos para los que fue entrenada.

## Casos de uso

- Control de bajo nivel de un robot de 14 grados de libertad: la política puede ocupar el lazo interno que traduce el estado observado en consignas articulares a 50 Hz, siempre que la morfología del robot objetivo coincida con la esperada por el modelo y se respete el orden de las 14 articulaciones.
- Despliegue en hardware embebido sin GPU: al ser un grafo ONNX de entrada y salida pequeñas, es candidato a ejecutarse en una CPU de placa embebida (por ejemplo, una Jetson o un SBC x86) con ONNX Runtime, reservando la GPU para otros componentes del sistema.
- Reproducción de resultados dentro del Microduck Arena: el artefacto permite volver a ejecutar exactamente la misma política publicada y compararla con otras políticas de la misma arena bajo condiciones idénticas.
- Evaluación comparativa de políticas: sirve como referencia en experimentos que comparen estrategias de control, midiendo tasa de éxito y suavidad de trayectorias con la misma interfaz de 61 entradas y 14 salidas.
- Integración en simulación: el grafo puede cargarse en un simulador (MuJoCo, Isaac Sim u otro) mediante un puente ONNX, lo que permite validar la política antes de llevarla a hardware físico.
- Teleoperación asistida: en un esquema en el que un operador aporta consignas de alto nivel y la política genera las consignas articulares, puede reducir la carga cognitiva del operador y suavizar el mando.
- Investigación en aprendizaje por imitación: el modelo puede utilizarse como punto de partida o como línea base frente a políticas entrenadas con nuevos datasets.
- Módulo de seguridad en cascada: las 14 salidas pueden filtrarse con límites de posición, velocidad y par antes de llegar a los drivers, lo que permite usar la política como generador de referencias dentro de un lazo supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, errores de seguimiento de trayectoria, métricas de simulación ni comparaciones con otras políticas. Tampoco se han publicado mediciones de latencia o de consumo de recursos del grafo ONNX.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que la red mapea 61 valores a 14 salidas, es razonable esperar un modelo pequeño (del orden de miles o decenas de miles de parámetros) que cabría con holgura en cualquier GPU, pero no hay mediciones publicadas que lo confirmen.
- GPU recomendadas: no disponible. Para un grafo ONNX de este tipo, cualquier GPU con soporte CUDA o TensorRT debería ser suficiente; el factor limitante es la latencia determinista, no la memoria.
- Cabe en GPU de consumo: previsiblemente sí, en cualquier GPU de consumo actual, aunque no se dispone de datos de consumo de VRAM ni de latencia por modelo concreto.
- Ejecución en CPU: viable en principio, dado el tamaño reducido de la entrada y la salida; no hay cifras publicadas de latencia en CPU.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT, `onnxruntime-gpu`, nodos personalizados de ROS 2 que carguen el grafo, y puentes hacia simuladores. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: el contrato de 50 Hz implica un presupuesto de 20 ms por ciclo de control, incluyendo comunicación con los actuadores. No se han publicado mediciones reales de latencia, jitter ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otras políticas de la familia Microduck ni modelos comparables de la misma arena, y tampoco incluye parámetros, contexto o métricas de rendimiento de este modelo que permitan establecer una comparación rigurosa con alternativas de control robótico.

| Modelo | Parametros | Contexto / interfaz | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-i-stole-it-again | no disponible | 61 valores de entrada, 14 salidas, 50 Hz | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita, no puede asumirse permiso para uso comercial, redistribución ni modificación. Es un bloqueo legal relevante para cualquier despliegue en producción.
- Falta de documentación técnica: no se especifican arquitectura, parámetros, datos de entrenamiento, normalización de observaciones ni orden exacto de las 14 articulaciones más allá de lo que contenga `manifest.json`.
- Sesgos desconocidos: al no publicarse la composición del dataset, no puede evaluarse el sesgo ni la cobertura de condiciones (iluminación, fricción, carga útil, variabilidad de la morfología del robot).
- Riesgo de fallo silencioso: una política entrenada para una morfología concreta puede producir consignas plausibles pero incorrectas en un robot con cinemática, longitudes de eslabón o límites articulares distintos.
- Sin validación de seguridad publicada: no hay información sobre límites de par, velocidad, espacios de trabajo ni parada de emergencia. Cualquier uso en hardware físico exige envolver la política en una capa de supervisión y limitación de comandos.
- Limitación de dominio: no hay evidencia de generalización fuera de las condiciones de entrenamiento; la interfaz fija de 61 entradas impide añadir sensores sin reentrenar o adaptar.
- Sin mantenimiento aparente: 0 descargas, 0 likes y una única actualización el mismo día de publicación, sin historial posterior.
- No apta para tareas de lenguaje, razonamiento, código, visión o atención al cliente: cualquier uso de ese tipo sería un error de categoría.
- Ausencia de benchmarks: no es posible estimar la tasa de éxito esperada antes de desplegarla, por lo que la evaluación en simulación y en banco de pruebas es obligatoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nico-robot/microduck-i-stole-it-again
- Archivo de pesos: https://huggingface.co/Nico-robot/microduck-i-stole-it-again/blob/main/policy.onnx
- Contrato de interfaz: https://huggingface.co/Nico-robot/microduck-i-stole-it-again/blob/main/manifest.json
- Paper, blog o repositorio del autor: no disponible
- Demo o espacio interactivo: no disponible
- Nota: la busqueda web realizada no ha devuelto enlaces relevantes al modelo; los resultados obtenidos corresponden a entidades no relacionadas (una cantante, canales de video y plataformas de contenido), por lo que no se incluyen.
