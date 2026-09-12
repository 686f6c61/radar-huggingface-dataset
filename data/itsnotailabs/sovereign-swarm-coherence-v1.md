# ItsnotAilabs/Sovereign-Swarm-Coherence-v1

## Resumen

Sovereign-Swarm-Coherence-v1 es una red neuronal de 2,4 millones de parámetros desarrollada por ItsnotAilabs que no genera texto ni procesa lenguaje natural: su función es calcular el grado de sincronización de fase de un conjunto de agentes autónomos y devolver los parámetros de control necesarios para reacoplarlos. Recibe como entrada un vector de 16 ángulos de fase (en radianes, rango de -pi a pi) y produce tres salidas: el índice de coherencia global R en el intervalo [0, 1], la fuerza de acoplamiento adaptativa K y el vector de desplazamiento de frecuencia óptimo entre nodos.

El modelo se apoya en la formulación matemática del parámetro de orden de Kuramoto, un estándar clásico en el estudio de osciladores acoplados y sincronización emergente. La propuesta del autor es sustituir el cálculo iterativo o los temporizadores de red fijos por una inferencia neuronal de latencia muy baja (según el autor, 0,18 ms en CPU y 0,05 ms en GPU), pensada para lazos de control en tiempo real sobre enjambres de agentes, flotas de robots o protocolos de consenso distribuido.

Es relevante ahora porque la orquestación de sistemas multiagente (agentes LLM, robótica de enjambre, servicios distribuidos) requiere primitivas de coordinación baratas y deterministas, y este tipo de modelos de sincronización de fase es una alternativa ligera a los mecanismos ad hoc basados en esperas o reintentos. Conviene señalarlo, no obstante, como un artefacto muy reciente y poco validado: acumula 36 descargas y 1 like, y la propia model card no documenta el conjunto de datos de entrenamiento ni publica resultados de benchmarks verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP denso con capa de descomposición seno/coseno; no es un transformer ni un modelo de lenguaje |
| Parámetros totales | 2,4 millones (declarado por el autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible; la entrada es un vector fijo de 16 ángulos de fase (B, 16) |
| Tipos de cuantización | no disponible (no se documentan pesos cuantizados; el modelo es lo bastante pequeño para ejecutarse en fp32) |
| Idiomas soportados | en (etiqueta de la model card); en la práctica la entrada es numérica y no depende del idioma |
| Licencia | apache-2.0 |
| Formato de pesos | PyTorch (el autor menciona `pytorch_model.bin`); el repositorio declara 0,0 GB y no se documenta ninguna variante GGUF, ONNX ni safetensors |
| Pipeline declarado | feature-extraction |
| Dimensiones internas | 128 (hidden_dim), con BatchNorm1d y activaciones ReLU |
| Nodos máximos del enjambre | 16 |
| Salidas | R (sigmoid, [0, 1]), K (softplus × 5), delta omega (tanh, 16 valores) |
| Tamaño de pesos declarado | 98,2 KB (dato del autor; ver limitaciones, es inconsistente con 2,4 M de parámetros) |

## Arquitectura y entrenamiento

La topología descrita en la model card es secuencial y pequeña: un vector de 16 fases se descompone en componentes seno y coseno (32 valores), se pasa por un perceptrón multicapa de dos capas lineales de 128 unidades con BatchNorm y ReLU, y se divide en tres cabezas lineales independientes. La cabeza de coherencia aplica sigmoid para acotar R en [0, 1], la de acoplamiento aplica softplus multiplicado por 5 para mantener K positivo, y la de frecuencia aplica tanh para limitar el desplazamiento de fase. La formulación de referencia es el parámetro de orden de Kuramoto, R·e^(i·psi) = (1/N)·sumatorio de e^(i·theta_j), donde R = 1 indica sincronización perfecta y R próximo a 0 indica deriva aleatoria.

No hay información pública sobre el proceso de entrenamiento: la model card no especifica el número de tokens o muestras, la composición del dataset, el procedimiento de generación de etiquetas, ni si se emplearon técnicas de ajuste por refuerzo (RLHF, DPO) o aprendizaje supervisado. Tampoco se describe ninguna innovación técnica más allá de la propia combinación de una MLP con la formulación de Kuramoto; no se mencionan decodificación especulativa, atención lineal, SSM ni mecanismos híbridos. El código de ejemplo incluido instancia la clase `KuramotoSwarmCoherenceModel` sin cargar pesos preentrenados, por lo que reproduce una inicialización aleatoria, no el modelo publicado.

## Capacidades

- Cálculo del índice de coherencia global R de un enjambre de hasta 16 nodos a partir de sus fases individuales.
- Estimación de la fuerza de acoplamiento K necesaria para restablecer la sincronización cuando R cae por debajo de un umbral (el autor cita 0,8).
- Predicción del vector de desplazamiento de frecuencia delta omega por nodo, orientado a corregir la deriva de fase.
- Extracción de características de sincronización (pipeline `feature-extraction`), utilizable como señal de entrada para otros componentes de control.
- Inferencia de muy baja latencia apta para bucles de control en tiempo real (0,18 ms en CPU y 0,05 ms en GPU, según el autor).
- Aplicación a dominios físicos y distribuidos: robótica, drones, redes de sensores, consenso entre réplicas y coordinación de agentes.
- No dispone de generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, function calling ni capacidades de agente multi-paso. No es un modelo de lenguaje.

## Casos de uso

- Coordinación de enjambres de agentes LLM: en una arquitectura con decenas de agentes trabajando sobre una tarea común, cada agente reporta su fase de progreso y el modelo devuelve R y K para decidir si se inyecta un reacoplamiento o se deja evolucionar el sistema, evitando trabajo redundante y condiciones de carrera.
- Control de flotas de drones y robótica móvil: los controladores de vuelo entregan sus desfases temporales por nodo y el modelo calcula los offsets de fase para mantener maniobras sincronizadas, reduciendo el riesgo de colisión por desincronización temporal.
- Pacing de protocolos de consenso distribuido: sustituir los temporizadores fijos de propuesta de bloque o de gossip por retroalimentación de fase, ajustando dinámicamente la frecuencia de propuesta de cada nodo para maximizar el throughput efectivo.
- Redes de sensores y relojes lógicos: usar R como métrica de salud de la red en sistemas de telemetría industrial, disparando resincronización solo cuando la coherencia cae, en lugar de forzar sincronizaciones periódicas costosas.
- Detección de anomalías en señales oscilatorias: emplear el modelo como extractor de características sobre ventanas de 16 canales (EEG, ECG, vibración de maquinaria, sensores de red eléctrica) para detectar pérdidas de acoplamiento que preceden a fallos.
- Sincronización de generadores en microrredes eléctricas: monitorizar el desfase entre inversores o generadores y calcular desplazamientos de frecuencia para mantener la estabilidad del lazo de acoplamiento.
- Coordinación de réplicas de microservicios: usar la coherencia de fase entre instancias para escalonar tareas periódicas (por ejemplo, refrescos de caché o lotes de mantenimiento) y evitar picos de carga simultáneos.
- Investigación en sistemas dinámicos: banco de pruebas para comparar controladores neuronales de sincronización frente a la integración numérica clásica de las ecuaciones de Kuramoto.

## Benchmarks y rendimiento

El `model-index` publicado por el autor no contiene ningún resultado (`results: []`). La model card sí incluye una tabla de métricas operativas declaradas por el propio autor, que se reproduce a continuación tal cual. No hay comparaciones con otros modelos ni benchmarks académicos (MMLU, HumanEval, GSM8K y similares no aplican a este tipo de modelo).

| Métrica | Objetivo declarado | Rendimiento medido (declarado por el autor) |
|---|---|---|
| Latencia de forward pass | < 0,5 ms | 0,18 ms en CPU / 0,05 ms en GPU |
| Número de parámetros | Ligero y rápido | 2,4 millones |
| Huella de memoria | Baja | 98,2 KB (`pytorch_model.bin`) |
| Escala de enjambre | Hasta 16 nodos | Escalable |
| Throughput derivado (a partir de la latencia declarada, batch 1) | no disponible | ~5.500 inferencias/s en CPU y ~20.000 inferencias/s en GPU |

Estos valores proceden exclusivamente del autor y no han sido verificados de forma independiente. La cifra de 98,2 KB resulta incompatible con un modelo de 2,4 M de parámetros en fp32 (que ocuparía del orden de 9,6 MB); ver la sección de limitaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante. Con 2,4 M de parámetros, el peso en fp32 ocupa aproximadamente 9,6 MB, unos 4,8 MB en fp16 y unos 2,4 MB en int8 (estimaciones derivadas del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquiera. El modelo cabe y se ejecuta sin problema en RTX 3060, RTX 4090, A100, H100 o incluso en GPUs integradas; no hay requisitos de memoria relevantes.
- Consumer GPU: sí, en cualquier GPU de consumo e incluso en CPU. La model card declara 0,18 ms por inferencia en CPU y 0,05 ms en GPU, por lo que un portátil o una placa tipo Raspberry Pi serían suficientes para un único flujo de control.
- Opciones de despliegue: PyTorch nativo (libtorch), TorchScript, ONNX Runtime, torch.compile o exportación a TensorRT para latencias mínimas. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: los únicos datos disponibles son los declarados por el autor (0,18 ms en CPU, 0,05 ms en GPU, batch 1). No se documentan pruebas con lotes grandes, multihilo ni latencias en hardware embebido.
- Consideración de integración: al ser una MLP con BatchNorm, conviene fijar el modelo en modo evaluación y exportarlo con estadísticas de normalización congeladas; en modo `eval` con batch de tamaño 1, BatchNorm utiliza estadísticas en ejecución que, en una inicialización sin entrenamiento, no aportan información útil.

## Comparativa con modelos similares

No se han identificado modelos comparables publicados con la misma formulación. La alternativa funcional directa no es otro modelo neuronal, sino el cálculo analítico del parámetro de orden de Kuramoto y la integración numérica de las ecuaciones de acoplamiento.

| Alternativa | Tipo | Parámetros | Coste computacional | Exactitud | Licencia |
|---|---|---|---|---|---|
| Sovereign-Swarm-Coherence-v1 | MLP + Kuramoto, 16 nodos | 2,4 M | 0,18 ms CPU / 0,05 ms GPU (declarado) | no verificada; sin benchmarks públicos | Apache-2.0 |
| Cálculo analítico de R (fórmula cerrada) | Cálculo directo del parámetro de orden | 0 | O(N) por evaluación, del orden de microsegundos para N=16 | exacto por definición | no aplica |
| Integración numérica de las ecuaciones de Kuramoto (por ejemplo, Runge-Kutta) | Simulación de sistema dinámico | 0 | Mayor, depende del paso de integración | exacta hasta el error del integrador | no aplica (bibliotecas como SciPy) |

En términos funcionales, para N = 16 el parámetro de orden puede calcularse de forma exacta con la fórmula cerrada, de modo que la aportación diferencial del modelo sería el ajuste adaptativo de K y delta omega, no el cálculo de R en sí. No se dispone de datos que permitan cuantificar esa ventaja.

## Limitaciones y advertencias

- Inconsistencia documental grave: la model card declara 98,2 KB de huella de memoria para un modelo de 2,4 M de parámetros, cuando en fp32 ocuparía alrededor de 9,6 MB. Alguno de los dos datos es incorrecto.
- El repositorio declara un tamaño de 0,0 GB y no se documenta la presencia del archivo `pytorch_model.bin`. Es posible que los pesos entrenados no estén publicados o no sean accesibles.
- El código de ejemplo del README no carga ningún `state_dict`: instancia la clase y ejecuta un forward con inicialización aleatoria. Reproducir ese fragmento no equivale a usar el modelo entrenado.
- No hay información sobre el conjunto de datos de entrenamiento, el procedimiento de etiquetado, el número de muestras, la función de pérdida ni validación alguna. Sin ello no es posible evaluar si las salidas tienen base física o son aproximaciones no contrastadas.
- No se han publicado resultados de benchmarks verificables; el `model-index` está vacío y las métricas de latencia son declaraciones del autor sin reproducción independiente.
- Ausencia de validación frente a la solución analítica: no se documenta el error de R, K o delta omega respecto a la formulación exacta de Kuramoto.
- Alcance rígido: la entrada está fijada a 16 nodos. Enjambres de mayor tamaño requerirían reentrenamiento o particionado, y la model card describe la escalabilidad como "escalable" sin detallar el mecanismo.
- Riesgo de salidas plausibles sin significado físico: al ser una red neuronal sin garantías matemáticas, puede producir valores de R, K y delta omega que parezcan razonables pero no correspondan al estado real del sistema, lo que en un lazo de control físico (drones, red eléctrica) es un riesgo de seguridad.
- BatchNorm en inferencia con batch de tamaño 1 puede comportarse de forma degenerada si el modelo no se entrenó correctamente o se carga sin estadísticas en ejecución.
- Sesgos: no aplican sesgos lingüísticos o culturales propios de un modelo de lenguaje, pero sí puede heredar los sesgos de la distribución de entrenamiento (no documentada), por ejemplo un rango de fases o de acoplamientos sobrerrepresentado.
- Idiomas: la model card solo declara inglés, aunque la entrada es numérica; no existe interfaz de texto.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución con atribución, sin restricciones copyleft. Es la parte mejor definida del artefacto.
- Madurez: 36 descargas, 1 like y menos de dos días entre creación y última actualización. No hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ItsnotAilabs/Sovereign-Swarm-Coherence-v1
- Perfil del autor en HuggingFace: https://huggingface.co/ItsnotAilabs
- Paper, repositorio de código, demo o blog adicionales: no disponible. Las búsquedas web realizadas no devolvieron ningún resultado relacionado con el modelo; los enlaces recuperados corresponden a foros no relacionados con inteligencia artificial.
