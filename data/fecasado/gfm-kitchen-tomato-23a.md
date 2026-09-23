# fecasado/gfm-kitchen-tomato-23a

## Resumen

gfm-kitchen-tomato-23a es una política robótica de manipulación entrenada con LeRobot, la librería de aprendizaje por imitación de Hugging Face. El modelo lo publica el usuario fecasado y su nombre técnico interno es `gaze_flow_matching`, lo que indica que implementa una política basada en flow matching con condicionamiento por mirada (gaze) para tareas de manipulación en entornos de cocina. Está especializado en una tarea concreta: llevar un tomate a un plato, tal y como refleja el dataset de entrenamiento asociado, `fecasado/tomato-to-plate-320x240`.

A diferencia de un modelo de lenguaje, esta ficha describe una política visomotora: recibe observaciones (imágenes de cámara a resolución 320x240 y, presumiblemente, el estado del robot) y emite acciones de control de un brazo robótico. El checkpoint contiene 75.549.402 parámetros en formato safetensors y el repositorio ocupa 0,3 GB, un tamaño que lo sitúa en la gama de políticas compactas capaces de ejecutarse en tiempo real y en hardware de consumo.

Su relevancia es principalmente práctica y de investigación: sirve como referencia reproducible para experimentos de flow matching aplicado a robótica con brazos tipo SO-100, y resulta útil para quien quiera comparar variantes de política dentro del ecosistema LeRobot (por ejemplo, frente a su versión baseline de la misma tarea). La model card es la plantilla por defecto de LeRobot y no aporta detalles de arquitectura, datos de entrenamiento ni métricas, por lo que buena parte de las especificaciones figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de manipulación robótica `gaze_flow_matching` (flow matching con condicionamiento por mirada), implementada sobre LeRobot; detalles internos de capas no disponibles |
| Parametros totales | 75.549.402 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (política de control; no se documenta la ventana de observaciones) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, INT8 o INT4) |
| Idiomas soportados | No aplica / no disponible (modelo visomotor, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura más allá del nombre declarado, `gaze_flow_matching`, y de la etiqueta `gaze_flow_matching` en los tags del repositorio. Flow matching es una familia de modelos generativos que aprende un campo vectorial que transporta una distribución de ruido hacia la distribución de acciones expertas; aplicado a robótica, se emplea en el mismo rol que las políticas de difusión, pero con un coste de inferencia habitualmente menor al requerir menos pasos de integración. El término "gaze" sugiere que la política incorpora información de mirada o de punto de atención como entrada adicional, algo coherente con tareas de alcance y agarre donde la fijación visual determina la región relevante de la escena.

El entrenamiento se ha realizado con LeRobot sobre el dataset `fecasado/tomato-to-plate-320x240`, cuyas imágenes de cámara tienen resolución 320x240. No se especifican el número de episodios, la composición exacta de las demostraciones, ni si hubo etapas de ajuste posteriores. La model card incluye el comando genérico `lerobot-train` con `--policy.type=act`, que es el texto por defecto de la plantilla y por tanto no debe interpretarse como confirmación de que este checkpoint sea una política ACT: el nombre del modelo indica explícitamente flow matching con gaze. El resto de hiperparámetros (tasa de aprendizaje, aumento de datos, número de pasos de integración en inferencia) no está documentado.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones de brazo a partir de observaciones de cámara, orientadas a la tarea de trasladar un tomate a un plato.
- Ejecución de políticas entrenadas por imitación dentro del ecosistema LeRobot, con soporte nativo para el flujo `lerobot-record` y robots tipo `so100_follower`.
- Condicionamiento por mirada (`gaze`) como señal adicional de atención espacial, según el nombre declarado del modelo.
- Inferencia en tiempo real sobre GPU de consumo, dado el reducido tamaño del checkpoint (75,5 M de parámetros, 0,3 GB en disco).
- Compatible con entrenamiento desde cero y con ajuste fino sobre el mismo dataset u otros datasets de LeRobot.
- No dispone de: generación de texto, razonamiento simbólico, tool calling, function calling, capacidades de agente multi-paso, procesamiento de lenguaje natural, audio, ni razonamiento matemático. No es un modelo de propósito general.

## Casos de uso

- Automatización de trasvase de alimentos en cocina: la política está entrenada específicamente para mover un tomate a un plato, por lo que puede emplearse como controlador directo de un brazo en una estación de preparación de alimentos con elementos de geometría similar.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar cómo se comporta una política de flow matching con señal de gaze frente a alternativas de difusión o ACT en la misma tarea.
- Comparación de variantes de política: al existir versiones emparentadas del mismo autor (baseline de la tarea tomate-plato y variantes para tostadas), permite aislar el efecto del componente de gaze manteniendo dataset y robot constantes.
- Prototipado con brazos SO-100: gracias al tamaño reducido y a la integración con `lerobot-record`, es viable montar una celda de evaluación doméstica con un SO-100 follower y diez episodios de test sin infraestructura de servidor.
- Pick-and-place de objetos pequeños sobre superficie plana: la tarea tomate-plato comparte estructura con recogida y deposición de piezas en líneas de envasado o clasificación, siempre que se reentrene o ajuste con datos del nuevo dominio.
- Evaluación de robustez visual en robótica: la resolución 320x240 del dataset permite medir cómo degrada el rendimiento la reducción de resolución de cámara, un experimento útil antes de desplegar en hardware con recursos limitados.
- Demostración docente de flow matching aplicado a robótica: el checkpoint es lo bastante pequeño para entrenar y ejecutar en una sesión de laboratorio o taller, con tiempos de iteración cortos.
- Generación de datos de evaluación etiquetados: ejecutar la política y registrar episodios con `lerobot-record` produce trayectorias que pueden usarse como referencia o como datos negativos en estudios de comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones cuantitativas con otras políticas sobre el dataset `tomato-to-plate-320x240`.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,3 GB solo de pesos (302 MB); en FP16, unos 151 MB; en INT8, unos 75 MB. Con activaciones y buffers de imagen, un presupuesto de 1-2 GB de VRAM es holgado para una política de este tamaño.
- GPU recomendadas: cualquier GPU NVIDIA moderna es suficiente. Una RTX 3060, 4060, 4070 o 4090 cubre la inferencia con margen amplio; para entrenamiento, una RTX 3090 o 4090 acorta los tiempos, y A100/H100 solo aportarían ventaja si se entrena con lotes grandes o varios datasets en paralelo.
- Viabilidad en GPU de consumo: sí, cabe con holgura en cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en iGPU o CPU para inferencia puntual, aunque la latencia de control sería previsiblemente insuficiente para operación fluida.
- Opciones de despliegue: LeRobot (`lerobot-record` para evaluación e inferencia, `lerobot-train` para entrenamiento). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de control.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, número de pasos de integración del flow matching ni tiempo de cómputo por acción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fecasado/gfm-kitchen-tomato-23a | 75.549.402 | Tomate a plato, 320x240, gaze flow matching | No disponible | apache-2.0 | Hugging Face |
| fecasado/gfm-kitchen-tomato-baseline | No disponible | Misma tarea (tomate a plato), versión baseline sin gaze | No disponible | No disponible | Hugging Face |
| fecasado/gfm-kitchen-toasts-baseline | No disponible | Tarea de tostadas en cocina (baseline) | No disponible | No disponible | Hugging Face |
| Políticas ACT de LeRobot | Variable según configuración | Manipulación general por imitación | No comparable en esta tarea | Apache-2.0 (librería) | Hugging Face / GitHub |

La comparación cuantitativa con alternativas no puede establecerse porque ninguno de los repositorios consultados publica tasas de éxito, número de parámetros de las variantes baseline ni resultados sobre el dataset de tomate. La única comparación fiable es estructural: misma tarea y mismo autor, con y sin componente de gaze.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (tomate a plato) en un entorno de cocina concreto. No generaliza a otras tareas, objetos o disposiciones de cámara sin reentrenamiento o ajuste fino.
- Model card incompleta: es la plantilla por defecto de LeRobot y contiene la advertencia "_Model type not recognized — please update this template._". No hay información verificable sobre composición del dataset, número de episodios, hiperparámetros ni métricas de evaluación.
- Riesgo de fallo silencioso: en políticas de imitación, una distribución de observaciones distinta a la del entrenamiento (iluminación, fondo, posición inicial del objeto) puede producir acciones erráticas sin que el modelo señale incertidumbre.
- Sin datos de sesgo publicados: no se documenta el rango de variación demográfica, cromática o de iluminación del dataset, lo que impide evaluar sesgos de generalización visual.
- Dependencia del robot objetivo: los comandos de ejemplo apuntan a `so100_follower`. Usar otra cinemática o otro espacio de acciones requiere verificar compatibilidad de las dimensiones de acción.
- Adopción nula hasta la fecha: 0 descargas y 0 likes en el momento de la consulta, y el repositorio se creó y actualizó el mismo día (23 de septiembre de 2026, según los metadatos). No hay evidencia de uso en producción ni validación por terceros.
- Licencia permisiva pero sin garantías: apache-2.0 permite uso comercial y modificación, pero no implica ninguna garantía de idoneidad ni de seguridad física. Cualquier despliegue sobre hardware real debe incorporar límites de par, paradas de emergencia y supervisión.
- Ausencia de evaluación de seguridad: no se documentan comportamientos en presencia de personas, objetos frágiles o fallos de agarre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-tomato-23a
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/tomato-to-plate-320x240
- Variante baseline de la misma tarea: https://huggingface.co/fecasado/gfm-kitchen-tomato-baseline
- Variante baseline para tostadas: https://huggingface.co/fecasado/gfm-kitchen-toasts-baseline
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
