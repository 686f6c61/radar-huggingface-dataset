# omkarpatil/push-tape-right-dp-wristnp-diffusion

## Resumen

El modelo `omkarpatil/push-tape-right-dp-wristnp-diffusion` es una política de difusión (diffusion policy) entrenada con la librería LeRobot para controlar un robot ROBOTIS FFW SG2 Rev1 en la tarea de empujar una cinta hacia la derecha (`push-tape-right`). Desarrollado por omkarpatil, el modelo pertenece a una familia de políticas entrenadas por imitación que utilizan estadísticas de normalización compartidas entre tareas similares del grupo de composición A (`push-tape-left` y `push-tape-right`). Su relevancia radica en demostrar un enfoque práctico para componer políticas robóticas con observaciones visuales de muñeca y sin propriocepción, un escenario habitual en entornos reales donde los sensores de estado no están disponibles o son ruidosos.

La arquitectura es una diffusion policy con scheduler DDPM, con 274,5 millones de parámetros (274.492.048 según los pesos safetensors). Utiliza dos cámaras de muñeca (`cam_left_wrist`, `cam_right_wrist`) y anula la entrada de estado (`observation.state` a cero). El modelo se entrenó durante 100.000 pasos con un batch de 8, una tasa de datos de 15 fps y alcanzó una loss final de entrenamiento de 0,004. La licencia es Apache 2.0 y los pesos están en formato safetensors, listos para ser cargados con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) |
| Parametros totales | 274.492.048 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una diffusion policy estándar de LeRobot (versión 0.6.1, fork ROBOTIS `lerobot-cyclo`). El proceso de difusión utiliza un scheduler DDPM para generar acciones de control a partir de observaciones visuales. La entrada es exclusivamente visual: dos cámaras de muñeca (`cam_left_wrist` y `cam_right_wrist`) con resolución nativa, mientras que la entrada de estado (`observation.state`) está puesta a cero, es decir, el modelo opera sin propriocepción. Esto obliga a que la política dependa únicamente de la información visual para inferir la posición del brazo y del objeto.

El entrenamiento se realizó sobre un dataset en formato LeRobot v3.0 (convertido desde v2.1), compuesto por 5.768 frames agrupados de las tareas `push-tape-left` y `push-tape-right`. Las estadísticas de normalización se calcularon de forma conjunta sobre todo el grupo y se escribieron idénticamente en cada dataset miembro, verificadas mediante un hash SHA-256 (`839f172565ff`). Esta normalización compartida permite componer políticas entre tareas del mismo grupo, aunque solo dentro de la misma arquitectura: diffusion policy compone con diffusion policy, y GR00T con GR00T, pero no entre ambas, ya que consumen campos de normalización distintos (min/max frente a q01/q99 percentiles).

Los hiperparámetros de entrenamiento siguen los valores por defecto de LeRobot: optimizador Adam con lr 1e-4, betas (0.95, 0.999), weight decay 1e-6, batch size 8 y 100.000 pasos. La loss final de entrenamiento fue de 0,004, lo que indica una buena convergencia sobre los datos de entrenamiento.

## Capacidades

- Generacion de acciones de control robotico: produce comandos de articulacion para empujar una cinta hacia la derecha en el robot ROBOTIS FFW SG2 Rev1.
- Percepcion visual multicamara: utiliza dos camaras de muñeca simultaneamente para observar la escena.
- Operacion sin propriocepcion: no requiere lecturas de estado articular, lo que simplifica la integracion en robots sin encoders precisos o con ruido en las mediciones de estado.
- Composicion con tareas similares: las estadisticas de normalizacion compartidas permiten combinar esta politica con `push-tape-left` dentro del mismo grupo de composicion.
- Inferencia a 15 fps: la politica fue entrenada con una tasa de datos de 15 Hz, por lo que puede generar acciones a esa frecuencia en tiempo real.
- Integracion con LeRobot: compatible con el ecosistema LeRobot para carga, evaluacion y despliegue en robots reales o simulados.

## Casos de uso

- Automatizacion de tareas de empuje en lineas de montaje: el modelo puede desplazar componentes o piezas sobre una superficie plana mediante empujes controlados, una operacion comun en estaciones de ensamblaje donde se necesita reposicionar objetos.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como las diffusion policies generalizan entre variantes de una misma tarea (izquierda vs derecha) cuando se comparten estadisticas de normalizacion.
- Evaluacion de robustez visual sin propriocepcion: permite analizar hasta que punto un controlador visual puro puede realizar manipulaciones precisas, un escenario relevante para robots con sensores de estado degradados.
- Composicion y reutilizacion de politicas: al compartir normalizacion con `push-tape-left`, se puede experimentar con tecnicas de composicion de politicas para tareas relacionadas sin reentrenar desde cero.
- Benchmark de diffusion policies en hardware real: el robot ROBOTIS FFW SG2 Rev1 es un brazo de bajo coste; este modelo permite comparar el rendimiento de diffusion policies en plataformas accesibles frente a arquitecturas como GR00T.
- Despliegue en entornos educativos: al ser Apache 2.0 y estar integrado con LeRobot, puede usarse en laboratorios docentes para ensenar control robotico basado en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la loss final de entrenamiento (0,004) y la tasa de datos (15 fps), pero no hay evaluaciones comparativas con otros modelos en la tarea `push-tape-right` ni en tareas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado el tamano de 274M parametros y el uso de safetensors de precision completa (fp32), una estimacion conservadora seria de 1-2 GB de VRAM solo para los pesos, mas el coste de las activaciones de las dos camaras y el proceso de difusion (tipicamente 10-50 pasos de denoising). En la practica, una GPU con 4 GB de VRAM deberia ser suficiente.
- GPU recomendadas: no se especifican en la documentacion. Cualquier GPU moderna con soporte CUDA (RTX 2060 o superior) deberia poder ejecutar la inferencia. Para entrenamiento, se usaron 100.000 pasos con batch 8, lo que sugiere que una GPU con 8-12 GB de VRAM (RTX 3080, RTX 4070) seria adecuada.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo actuales, especialmente en cuantizaciones reducidas (aunque no se proporcionan pesos cuantizados).
- Opciones de despliegue: LeRobot ofrece pipelines de evaluacion y despliegue en robots reales. Tambien se puede integrar con ROS mediante adaptadores, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles. La politica fue entrenada a 15 fps, por lo que se espera que la inferencia sea mas rapida que ese umbral en hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos en la misma categoria. La model card menciona que las politicas GR00T para las mismas tareas comparten estadisticas de normalizacion pero usan una arquitectura diferente y no son directamente comparables en rendimiento. No hay datos publicados de benchmarks que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente para la tarea `push-tape-right` con el robot ROBOTIS FFW SG2 Rev1. No generalizara a otros robots, otras tareas o incluso a la misma tarea con una configuracion de camaras diferente.
- Sin propriocepcion: al anular `observation.state`, la politica depende completamente de las camaras. Si las camaras se desalinean, se obstruyen o cambian sus parametros intrinsecos, el rendimiento puede degradarse significativamente.
- Resoluciones de camara no uniformes: la variante de 3 camaras requirio re-encodear todas las vistas a un tamano comun porque las resoluciones nativas difieren (head 376x672, wrist 424x240). Esto puede introducir artefactos de reescalado y perdida de informacion.
- Composicion limitada por arquitectura: las estadisticas compartidas solo son validas dentro de diffusion policies; no se pueden componer con politicas GR00T del mismo grupo porque consumen campos de normalizacion distintos (min/max frente a percentiles).
- Dataset reducido: solo 5.768 frames en total para el grupo de composicion, lo que puede limitar la robustez frente a variaciones no vistas.
- Sin evaluacion en entornos reales publicada: no hay informacion sobre pruebas fisicas en el robot, solo la loss de entrenamiento. El rendimiento real puede diferir.
- Riesgo de sobreajuste: la loss final de 0,004 sugiere un ajuste muy cercano a los datos de entrenamiento; se recomienda validar en episodios de test antes de usar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/push-tape-right-dp-wristnp-diffusion
- No se encontraron otros enlaces relevantes (papers, blogs o repositorios adicionales) en la busqueda web.
