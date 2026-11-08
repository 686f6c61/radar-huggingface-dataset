# hamzabouajila/fastvla-unitree-g1-ar

## Resumen

FastVLA Unitree G1 AR es un checkpoint de política robótica (policy) publicado por el usuario hamzabouajila en Hugging Face, orientado al control continuo de cuerpo completo de un robot humanoide Unitree G1 con 23 grados de libertad. El modelo se condiciona mediante instrucciones en árabe estándar moderno (الفصحى) y genera trozos de acción (action chunks) de 16 pasos de anticipación, lo que a 30 FPS equivale a unos 0,53 segundos de movimiento planificado. La arquitectura declarada es Flow Matching continuo con trayectoria lineal de transporte óptimo, una técnica de modelado generativo que aprende un campo de velocidades entre una distribución de ruido y la distribución de acciones expertas.

El modelo se entrenó sobre el dataset `hamzabouajila/ar-unitree-g1-motions`, compuesto por 174 secuencias de captura de movimiento retargeteadas al esqueleto del Unitree G1. El espacio de actuación cubre ambas piernas (6 DoF por pierna), la cintura (1 DoF de yaw) y ambos brazos (5 DoF por brazo). La latencia de inferencia declarada es de aproximadamente 40 ms en GPU con entre 1 y 10 pasos de integración Euler, lo que lo sitúa en el rango de control reactivo para robótica.

La relevancia de este checkpoint es doble: por un lado, explora la condicionalidad lingüística en árabe para políticas robóticas de cuerpo completo, un idioma poco representado en la investigación de Physical AI; por otro, emplea Flow Matching en lugar de difusión estándar, lo que reduce el número de pasos de muestreo necesarios. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0.0 GB según los metadatos, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el repositorio está vacío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow Matching continuo (trayectoria lineal de transporte óptimo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (condicionado por prompt de instrucción y estado de 23 articulaciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Árabe estándar moderno (الفصحى) para las instrucciones |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint PyTorch con `model_state_dict` y `config`) |

## Arquitectura y entrenamiento

El modelo implementa una política de Flow Matching continuo sobre transporte óptimo con trayectoria lineal. En lugar de la formulación de difusión con ruido gaussiano acumulado, aprende un campo de velocidades que transporta muestras de una distribución base hacia la distribución de acciones expertas a lo largo de una interpolación lineal. Esto permite generar un chunk de 16 acciones con tan solo 1 a 10 pasos de integración Euler, lo que explica la latencia de ~40 ms declarada en GPU.

La entrada del modelo combina una instrucción en árabe (codificada por un encoder de texto no especificado en la model card) con el estado actual del robot, un vector de 23 ángulos articulares. La salida es un tensor de forma `[batch, 16, 23]`. El entrenamiento se realizó sobre 174 secuencias de motion capture retargeteadas al Unitree G1, alojadas en el dataset `hamzabouajila/ar-unitree-g1-motions`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla el encoder visual, pese a que el nombre "FastVLA" (Vision-Language-Action) sugiere una componente visual que la model card no describe en la práctica: el ejemplo de inferencia solo pasa instrucción y estado, sin observación visual.

## Capacidades

- Generación de chunks de acción continua de 16 pasos para 23 articulaciones del Unitree G1 (piernas, cintura y brazos).
- Condicionamiento por instrucciones en árabe estándar moderno para tareas de movimiento de cuerpo completo.
- Control de cuerpo completo (whole-body control) con coordinación de extremidades inferiores y superiores.
- Integración de Flow Matching con 1 a 10 pasos de ODE Euler para inferencia de baja latencia.
- Interfaz de predicción directa mediante `model.predict_action(instructions, states)`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Control teleoperado por voz en árabe: un operador dicta una instrucción en árabe estándar y el modelo genera el chunk de 16 acciones que el controlador de bajo nivel del Unitree G1 ejecuta durante ~0,53 s, permitiendo interacción natural sin teclado ni joystick.
- Investigación en condicionalidad lingüística multilingüe: el checkpoint sirve como referencia para estudiar cómo un modelo de política aprende a mapear instrucciones en árabe a movimientos de cuerpo completo, comparándolo con variantes en otros idiomas del mismo autor (por ejemplo, `fastvla-turbo-arabic-libero`).
- Prototipado de políticas de cuerpo completo en simulación: al ser un checkpoint ligero en latencia, puede integrarse en bucles de simulación MuJoCo o Isaac Gym para evaluar la calidad de los chunks antes de desplegar en hardware.
- Benchmark de Flow Matching frente a difusión: la variante de transporte óptimo con 1-10 pasos Euler permite comparar latencia y calidad de movimiento frente a políticas basadas en DDPM/DDIM con decenas de pasos.
- Demostraciones de robótica humanoide en ferias o laboratorios: la licencia MIT y la API simple (`predict_action`) facilitan montar demos reproducibles de control por lenguaje.
- Generación de datos sintéticos de movimiento: los chunks predichos pueden usarse para aumentar datasets de motion capture retargeteada, siempre que se valide la plausibilidad física de las trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio figura como 0.0 GB y no se especifica el número de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible; la model card solo indica "~40 ms on GPU" sin especificar modelo.
- Compatibilidad con GPU de consumo: no confirmada; al no conocerse el tamaño del modelo, no puede afirmarse que quepa en una RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: la model card solo documenta inferencia en PyTorch puro mediante `torch.load` y `FastVLAModel`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a políticas robóticas).
- Latencia y throughput: ~40 ms por chunk de 16 pasos con 1-10 pasos de ODE Euler en GPU, según el autor. El throughput en Hz no se declara explícitamente.

## Comparativa con modelos similares

| Modelo | Tipo | DoF | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastVLA Unitree G1 AR (este) | Flow Matching, 16-step chunk | 23 | Árabe (الفصحى) | MIT | Hugging Face, 0 descargas |
| fastvla-turbo-arabic-libero | FastVLA Turbo, Flow Matching 16-step | 112 | Árabe | no disponible en la información | Hugging Face |
| Políticas VLA genéricas (p. ej. RT-2, OpenVLA) | Transformer VLA | variable | Inglés mayoritariamente | variable | pública |

La comparación con `fastvla-turbo-arabic-libero` es la más directa por compartir autor, familia FastVLA y condicionamiento en árabe, pero difiere en el embodiment (112 DoF frente a 23) y en la compresión espacial de tokens (2x2 en el turbo). No se dispone de datos de benchmarks para comparar rendimiento entre ambos.

## Limitaciones y advertencias

- El repositorio muestra 0.0 GB de tamaño y 0 descargas; es posible que los pesos no estén efectivamente disponibles o que el checkpoint esté vacío, lo que impediría la inferencia tal como se documenta.
- El modelo está entrenado exclusivamente sobre 174 secuencias de motion capture retargeteadas; la cobertura de comportamientos es limitada y probablemente no generalice a tareas fuera de la distribución del dataset.
- La condicionalidad lingüística se limita al árabe estándar moderno; no se documenta soporte de otros idiomas ni de dialectos.
- No se describe componente visual en la model card pese al nombre "VLA"; el ejemplo de inferencia no pasa observación visual, por lo que el modelo podría no ser reactivo al entorno y comportarse como una política de imitación condicionada solo por lenguaje y estado propioceptivo.
- No se especifican sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad física; en robótica humanoide, una política no validada puede generar trayectorias peligrosas para personas y equipos.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni validación de seguridad; el despliegue en hardware real requiere supervisión y capas de seguridad de bajo nivel independientes.
- La fecha de creación del repositorio (2026-11-08) y la referencia al paper arXiv 2610.22146 deben verificarse, ya que los identificadores no coinciden con el formato habitual de arXiv.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hamzabouajila/fastvla-unitree-g1-ar
- Dataset de entrenamiento: https://huggingface.co/datasets/hamzabouajila/ar-unitree-g1-motions
- Modelo hermano (árabe, Libero): https://huggingface.co/hamzabouajila/fastvla-turbo-arabic-libero
- Paper FastVLA (arXiv): https://arxiv.org/abs/2610.22146
