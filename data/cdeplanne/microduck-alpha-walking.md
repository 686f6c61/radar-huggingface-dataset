# cdeplanne/microduck-alpha-walking

## Resumen

microduck-alpha-walking es una política de control robótico publicada por el usuario cdeplanne en Hugging Face. No es un modelo de lenguaje: se distribuye como un único artefacto ONNX (`policy.onnx`) cuya entrada es un vector de 61 valores de observación y cuya salida son 14 objetivos de articulación, ejecutados a una frecuencia de control de 50 Hz. El autor indica que forma parte de la familia de políticas Microduck y que se ha publicado desde la denominada Microduck Arena.

El repositorio está etiquetado con el pipeline `robotics` y con las etiquetas `microduck-policy`, `microduck`, `onnx` y `robotics`. El tamaño declarado del repo es de 0.0 GB, lo que apunta a un artefacto muy pequeno, coherente con una política de control pensada para ejecutarse dentro del bucle de control de un robot más que para inferencia de propósito general.

La información pública es mínima: no se declara licencia, ni idiomas, ni arquitectura interna, ni datos de entrenamiento, ni métricas de rendimiento. El autor remite explícitamente a `manifest.json` para el contrato completo de la interfaz, de modo que cualquier integración real requiere inspeccionar ese fichero antes de asumir nada sobre el orden, las unidades o la normalización de las observaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de control exportada a ONNX; la topología interna de la red no se especifica en la información disponible) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No aplica (entrada de 61 valores numéricos por paso de control) |
| Tipos de cuantizacion | No disponible (se publica en ONNX; la precisión del artefacto no se especifica) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje; no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompanado de `manifest.json` con el contrato de interfaz |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna de la política: únicamente se especifica el contrato de entrada/salida (61 valores de observación de entrada, 14 objetivos de junta de salida, 50 Hz) y que el artefacto se distribuye en formato ONNX. No se indica si se trata de un perceptrón multicapa, una red recurrente, un transformer o cualquier otra topología, ni el número de capas o de parámetros. Tampoco se detalla el algoritmo de entrenamiento: no hay mención a aprendizaje por refuerzo, imitación, optimización por trayectoria ni a ninguna fase de ajuste posterior.

En cuanto a los datos, no se publica el número de tokens, episodios, pasos de simulación ni la composición del dataset. Sí es reseñable que el nombre del modelo contiene el término "walking", lo que sugiere que la política está especializada en marcha o locomoción, y que la publicación se realiza "desde la Microduck Arena", expresión que apunta a un entorno de evaluación o competición de políticas para esta plataforma robótica. Ninguno de estos extremos se confirma en la model card.

## Capacidades

- Generación de comandos de actuación: transforma un vector de 61 observaciones en 14 objetivos de articulación.
- Control de locomoción a 50 Hz, es decir, con un presupuesto de 20 ms por paso de control.
- Ejecución en runtimes compatibles con ONNX, sin dependencias de frameworks de entrenamiento.
- Interfaz verificable mediante `manifest.json`, que define el contrato completo de entrada y salida.
- Integración potencial en bucles de control de robots con 14 grados de libertad actuados.
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling ni de function calling en el sentido de los modelos de lenguaje.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües (no procesa lenguaje).
- No se documenta ningún modo especial (thinking mode, audio, visión) en la información disponible.

## Casos de uso

- Control de locomoción del robot Microduck: la salida de 14 objetivos de junta se envía directamente a los controladores de los actuadores a 50 Hz. Es el caso de uso principal y el único explícitamente sugerido por el nombre y el contrato del modelo.
- Integración en un nodo ROS 2: un nodo suscribe el vector de 61 observaciones (estado de juntas, IMU u otras senales, según defina `manifest.json`), invoca la política mediante ONNX Runtime y publica los 14 objetivos de junta como comandos de posición.
- Despliegue en hardware de borde: dado el tamano declarado del repo (0.0 GB) y el formato ONNX, es un candidato razonable para ejecutarse en CPU o en plataformas embebidas tipo Jetson o Raspberry Pi, sin necesidad de GPU dedicada.
- Validación en simulación antes del despliegue físico: al ser un artefacto ONNX autocontenido, puede cargarse en un simulador que reproduzca el mismo contrato de observaciones y comparar el comportamiento con el obtenido en hardware real.
- Evaluación comparativa en la Microduck Arena: la model card indica que el modelo se publica desde esa Arena, por lo que puede emplearse como participante o como referencia frente a otras políticas de la misma plataforma.
- Baseline de investigación en control de marcha: sirve como punto de partida reproducible para comparar variantes de política, siempre que se respete el contrato de 61 entradas y 14 salidas.
- Verificación de interfaz en pipelines de integración: usar `manifest.json` para construir tests automáticos que validen el orden, la forma y la normalización de las 61 observaciones antes de conectar la política a un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad de marcha, consumo energético ni comparaciones con otras políticas. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existe validación por parte de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño declarado del repo (0.0 GB) sugiere un artefacto por debajo del megabyte, pero no se especifica el número de parámetros ni la precisión.
- GPU recomendadas: no disponible. No hay información que indique que se requiera GPU; el formato ONNX y el tamano del artefacto permiten plantear ejecución en CPU.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamano declarado, aunque no hay confirmación oficial.
- Cabe en CPU y en plataformas embebidas: plausible por formato y tamano, sin confirmación en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, OpenVINO y otros execution providers), así como integración en nodos ROS 2 que invoquen el runtime.
- Latencia y throughput: el único dato disponible es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por inferencia. La latencia real medida no está publicada.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables en la información proporcionada. No se han identificado otros modelos de la familia Microduck, ni políticas de locomoción de referencia con las que contrastar parámetros, contexto, rendimiento o licencia. Los resultados de la búsqueda web realizada no contienen ningún enlace ni dato relacionado con este modelo o con robótica.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-alpha-walking | No disponible | No aplica | No disponible | No disponible | Hugging Face, ONNX |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no puede asumirse permiso para uso comercial ni para redistribución. Es el principal riesgo antes de integrar el modelo en cualquier producto.
- Ausencia de model card detallada: no hay información sobre arquitectura, entrenamiento, datos ni evaluación, lo que impide reproducir o auditar el comportamiento.
- Sesgo de simulación a realidad (sim-to-real): no se documenta en qué entorno se entrenó la política, por lo que el comportamiento en hardware físico puede degradarse respecto al simulado.
- Especificidad de hardware: la política está atada a una morfología concreta de 14 articulaciones. No es transferible sin más a robots con otra cinemática.
- Dependencia del contrato de observaciones: un orden, escala o normalización distintos de los definidos en `manifest.json` producirán comandos incorrectos, potencialmente peligrosos en un robot real.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de salidas fuera de rango que deben acotarse con límites de par, velocidad y posición en el controlador de bajo nivel.
- Ausencia de validación externa: 0 descargas y 0 likes, sin resultados publicados, lo que implica que no existe evidencia independiente de su rendimiento.
- Sin soporte de lenguaje ni de idiomas: cualquier expectativa de interacción en lenguaje natural con este modelo es infundada.
- Fecha de publicación: el repositorio figura como creado y actualizado el 2026-09-14, sin historial de revisiones ni versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cdeplanne/microduck-alpha-walking
- Contrato de interfaz citado en la model card: https://huggingface.co/cdeplanne/microduck-alpha-walking/blob/main/manifest.json
- Artefacto de pesos: https://huggingface.co/cdeplanne/microduck-alpha-walking/blob/main/policy.onnx
- Paper, blog o repositorio del autor: no disponible
- Demo o documentación de la Microduck Arena: no disponible
- Los resultados de la búsqueda web no contienen enlaces relevantes para este modelo.
