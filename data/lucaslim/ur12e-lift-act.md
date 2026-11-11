# lucaslim/ur12e-lift-act

## Resumen

`lucaslim/ur12e-lift-act` es un checkpoint de robótica basado en la arquitectura ACT (Action Chunking with Transformers) publicado en Hugging Face bajo la librería LeRobot. Lo desarrolla el usuario lucaslim y está orientado a las cinco tareas de tipo "lift" del benchmark Reality Check (lata, cereales, pan, leche y botella) sobre un brazo robótico UR12e equipado con una pinza Robotiq 2F-140. El modelo resuelve el problema de generar comandos de control motor de forma autónoma a partir de observaciones visuales y propioceptivas, sustituyendo la programación manual de trayectorias por una política aprendida por imitación.

Técnicamente es un modelo pequeño: 51.683.975 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB en formato safetensors. La entrada combina imágenes cenitales (procesadas por un backbone ResNet-18) con un vector de propiocepción de 20 dimensiones; la salida es un delta de articulaciones de 6 dimensiones más un comando de pinza, a 20 Hz. El checkpoint corresponde al paso de entrenamiento 54.000.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para investigar manipulación robótica con aprendizaje por imitación en un entorno estandarizado (Reality Check), y como punto de partida para quien quiera evaluar o adaptar políticas ACT en un UR12e real o simulado. No es un modelo de lenguaje ni un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.683.975 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, un transformer que predice secuencias de acciones (*action chunks*) en lugar de comandos individuales, lo que reduce el error de acumulación y suaviza el control. La percepción visual se resuelve con un backbone ResNet-18 sobre imágenes cenitales (*overhead*), y la entrada se completa con un vector de propiocepción de 20 dimensiones. La salida es un delta de articulaciones de 6 grados de libertad más una señal de pinza, emitida a 20 Hz. Se aplica un *temporal ensemble* con `n_action_steps=1` y coeficiente 0,01, mecanismo que promedia predicciones solapadas para estabilizar la ejecución.

El entrenamiento se realizó a partir de demostraciones expertas privilegiadas (*privileged expert demonstrations*) sobre las cinco tareas lift de Reality Check. La model card no especifica el número de episodios, la composición exacta del dataset, ni si se emplearon técnicas de RL/DPO (no aplicables habitualmente en imitación supervisada). El snapshot publicado corresponde al paso 54.000. No se detallan innovaciones adicionales más allá del uso estándar de action chunking y temporal ensembling propios de ACT.

## Capacidades

- Control robótico de manipulación: genera comandos de articulaciones y pinza para ejecutar tareas de recogida (*lift*) sobre cinco objetos concretos (lata, cereales, pan, leche, botella).
- Percepción visual cenital: procesa imágenes de una cámara *overhead* mediante ResNet-18 para localizar y aproximar el objeto.
- Integración de propiocepción: consume un vector de 20 dimensiones del estado del robot para condicionar la acción.
- Control a 20 Hz con salida de 6-D de delta articular más comando de pinza.
- Estabilización mediante *temporal ensemble* (coeficiente 0,01, `n_action_steps=1`).
- No soporta *tool calling*, agentes multi-paso, razonamiento simbólico, matemáticas, visión general ni capacidades multilingües: es una política de control específica de tarea.
- No dispone de modo *thinking*, audio ni generación de texto.

## Casos de uso

- Investigación en aprendizaje por imitación: usar el checkpoint como línea base reproducible para comparar variantes de ACT sobre las tareas lift de Reality Check, aprovechando que el paso de entrenamiento (54.000) y la configuración están documentados.
- Evaluación de políticas en UR12e: desplegar la política en un UR12e con Robotiq 2F-140 para medir tasas de éxito en las cinco tareas y contrastar con resultados publicados del benchmark.
- *Fine-tuning* sobre nuevas tareas de recogida: partir de los pesos ACT preentrenados y adaptarlos a objetos o posiciones distintas, reduciendo el número de demostraciones necesarias frente a entrenar desde cero.
- Generación de datos sintéticos y aumento de *dataset*: ejecutar la política en simulación para producir trayectorias adicionales que alimenten otros entrenamientos o validaciones.
- Estudio de robustez perceptual: analizar cómo varía el éxito al modificar iluminación, oclusión o posición de la cámara cenital, dado que la entrada visual es un único punto de vista.
- Docencia y prototipado rápido: ejemplo compacto (51,7 M de parámetros, 0,2 GB) para ilustrar el pipeline completo de LeRobot, desde la carga del checkpoint hasta la ejecución en hardware, con requisitos de cómputo modestos.
- Integración en *pipelines* de LeRobot: encajar el checkpoint en flujos existentes de entrenamiento y evaluación de la librería sin conversiones adicionales, al estar en formato safetensors nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en precisión completa (fp32) el modelo ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para control en tiempo real a 20 Hz se recomienda una GPU dedicada (RTX 3060 o superior) para garantizar latencia estable, aunque el tamaño reducido permite también ejecución en CPU para pruebas.
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: librería LeRobot (formato nativo del checkpoint); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; la frecuencia de control nominal es 20 Hz, pero no se publican medidas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lucaslim/ur12e-lift-act | 51,7 M | no aplica | Lift en UR12e (Reality Check) | MIT | Hugging Face |
| Otros checkpoints ACT de LeRobot | no disponible | no aplica | Manipulación general | variable | Hugging Face |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación general | variable | Hugging Face / repos |

No se dispone de datos de rendimiento comparables publicados para este checkpoint ni de una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: solo cubre las cinco tareas lift de Reality Check sobre UR12e con Robotiq 2F-140; no generaliza a otros brazos, pinzas u objetos sin reentrenamiento.
- Dependencia de la cámara cenital: la política asume un único punto de vista *overhead*; cambios de cámara o iluminación pueden degradar el éxito.
- Entrenado con demostraciones privilegiadas: el rendimiento en condiciones no privilegiadas (sin acceso al estado experto durante la recogida de datos) no está documentado.
- Riesgo de sobreajuste a las posiciones y objetos del *dataset*; no se publican métricas de generalización.
- Sin datos de sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de distribución visual y de posiciones de objeto.
- Riesgo de fallo físico: como política de control real, errores de predicción pueden provocar colisiones o daños en el robot o en el entorno; se recomienda supervisión y límites de seguridad en hardware real.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene conservar el aviso de copyright.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay validación comunitaria ni reportes de terceros sobre su funcionamiento.
- No se especifican cuantizaciones ni formatos alternativos; solo safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucaslim/ur12e-lift-act
- LeRobot (librería): https://github.com/huggingface/lerobot
- Reality Check (benchmark): no disponible en la información proporcionada
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
