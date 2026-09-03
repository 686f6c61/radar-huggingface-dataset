# omkarpatil/put-bread-in-tray-dp-wrist-diffusion

## Resumen

Modelo de politica visuomotora basado en Diffusion Policy para la tarea de colocacion de pan en bandeja ("put-bread-in-tray") sobre el robot ROBOTIS FFW SG2 Rev1. Desarrollado por Omkar Patil y entrenado con el framework LeRobot 0.6.1 (fork `lerobot-cyclo` de ROBOTIS), el modelo utiliza exclusivamente las dos camaras de muñeca del robot (`cam_left_wrist` y `cam_right_wrist`) a resolucion nativa de 424x240, evitando la necesidad de re-encodificar las vistas a una resolucion comun.

El modelo cuenta con aproximadamente 274,5 millones de parametros y fue entrenado durante 100.000 pasos con un scheduler de ruido DDPM, alcanzando una perdida final de entrenamiento de 0,002. Su relevancia radica en que pertenece al grupo de composicion D, junto con las tareas `put-bread-in-container` y `put-bread-in-pan`, compartiendo estadisticas de normalizacion agrupadas sobre 11.872 fotogramas. Esto permite componer politicas entre tareas del mismo grupo, aunque exclusivamente dentro de la misma arquitectura (diffusion con diffusion, no con GR00T).

El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors y esta orientado a la investigacion y desarrollo de politicas roboticas mediante aprendizaje por imitacion, con un enfoque en la manipulacion de objetos en entornos de cocina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 274.492.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica visuomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (politica robotica, no modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una Diffusion Policy con scheduler de ruido DDPM (Denoising Diffusion Probabilistic Models), dentro del framework LeRobot 0.6.1 en su fork `lerobot-cyclo` de ROBOTIS. La politica toma como entrada las imagenes de las dos camaras de muñeca (resolucion uniforme de 424x240) y genera comandos de accion continua para el robot. El entrenamiento se realizo durante 100.000 pasos con un batch size de 8, optimizador Adam con learning rate de 1e-4, betas (0,95; 0,999) y weight decay de 1e-6, a una tasa de datos de 15 fps.

Una caracteristica tecnica destacable es el uso de estadisticas de normalizacion agrupadas (shared-norm) sobre el grupo de composicion D, que incluye tres tareas de manipulacion de pan (`put-bread-in-container`, `put-bread-in-tray`, `put-bread-in-pan`). Las estadisticas se agruparon sobre 11.872 fotogramas de todos los miembros del grupo y se escribieron identicamente en cada dataset, verificables mediante el hash `sha256(observation.state + action, normalization fields)[:12] = 8bb05eca753c`. El dataset esta en formato LeRobot v3.0, convertido desde v2.1 con las estadisticas agrupadas restauradas tras la conversion (el conversor v2.1 a v3.0 regenera estadisticas y habria reemplazado las agrupadas por valores por tarea).

El modelo emplea normalizacion `MIN_MAX` para `STATE` y `ACTION`, a diferencia de las politicas GR00T del mismo grupo, que usan `use_percentiles=True` con q01/q99. Esta diferencia impide la composicion cruzada entre arquitecturas.

## Capacidades

- Control visuomotor para manipulacion robotica: genera acciones continuas a partir de imagenes de camaras de muñeca.
- Tarea especifica de colocacion de pan en bandeja sobre el robot ROBOTIS FFW SG2 Rev1.
- Composicion con tareas del mismo grupo (put-bread-in-container, put-bread-in-pan) gracias a estadisticas de normalizacion compartidas.
- Inferencia a 15 fps, compatible con control en tiempo real del robot.
- Entrada multimodal limitada a dos vistas de camara (izquierda y derecha de muñeca) a 424x240.
- No soporta tool calling, generacion de texto, codigo, vision generalista ni razonamiento multimodal: es una politica motora especializada, no un modelo fundacional.

## Casos de uso

- Manipulacion robotica en entornos de cocina: el modelo puede ejecutar la tarea de colocar pan en una bandeja de forma autonoma, utilizando las camaras de muñeca para percibir la posicion del objeto y de la bandeja.
- Automatizacion de lineas de preparacion de alimentos: integrable en celdas robotizadas que requieran tareas repetitivas de pick-and-place con objetos deformables como pan.
- Investigacion en aprendizaje por imitacion: sirve como referencia para estudiar el efecto de la normalizacion agrupada (shared-norm) en la composicion de politicas de difusion.
- Composicion de tareas: junto con los otros modelos del grupo D, permite construir pipelines donde un mismo robot alterna entre colocar pan en contenedores, bandejas y sartenes sin reentrenar desde cero.
- Desarrollo de politicas con camaras de muñeca: el modelo demuestra que es posible entrenar politicas efectivas usando solo vistas de muñeca, evitando los problemas de resoluciones heterogeneas entre camaras.
- Benchmarking de arquitecturas de politicas: comparado con las variantes GR00T y SmolVLA del mismo autor para tareas equivalentes, permite evaluar el rendimiento relativo de Diffusion Policy frente a otras arquitecturas sobre el mismo robot y tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida final de entrenamiento de 0,002, sin metricas de evaluacion en robot real ni en simulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa aproximadamente 1,1 GB en float32 (274,5 millones de parametros), por lo que la inferencia requiere del orden de 2-4 GB de VRAM incluyendo overhead del runtime. No se han publicado mediciones exactas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente. Tarjetas como RTX 3060, RTX 4060 o superiores son adecuadas. Para despliegue embebido, una NVIDIA Jetson Orin Nano o similar podria ser viable.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna.
- Opciones de despliegue: LeRobot soporta evaluacion y despliegue sobre robots reales; el fork `lerobot-cyclo` de ROBOTIS es el entorno recomendado. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplica, al no ser un modelo de lenguaje).
- Latencia y throughput: el modelo fue entrenado con datos a 15 fps, lo que sugiere que la inferencia debe completarse en aproximadamente 66 ms por paso para control en tiempo real. No se han publicado mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Normalizacion | Composicion |
|---|---|---|---|---|
| Este modelo (dp-wrist) | Diffusion Policy (DDPM) | ~274,5 M | MIN_MAX compartida (grupo D) | Solo con diffusion del grupo D |
| GR00T N1.7 (mismo grupo, mismo autor) | GR00T (transformers) | no disponible | q01/q99 min-max (use_percentiles) | Solo con GR00T del grupo D |
| SmolVLA (mismo grupo, mismo autor) | VLA (vision-language-action) | no disponible | no disponible | no disponible |

La comparacion entre arquitecturas esta limitada por la falta de datos publicos de las variantes GR00T y SmolVLA del mismo autor. Lo que se conoce es que comparten las estadisticas de normalizacion agrupadas del grupo D, pero consumen campos diferentes (GR00T usa percentiles, diffusion usa min/max), lo que impide la composicion cruzada entre arquitecturas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Especializacion estricta: el modelo solo ejecuta la tarea de colocar pan en bandeja; no es generalizable a otras tareas sin reentrenamiento.
- Dependencia de las camaras de muñeca: la politica depende exclusivamente de las vistas de muñeca a 424x240; cambios en la configuracion de camaras invalidarian el modelo.
- Sin composicion cruzada entre arquitecturas: no se puede combinar con politicas GR00T del mismo grupo pese a compartir estadisticas.
- Sin datos de evaluacion en robot real: no se han publicado metricas de exito en ejecucion fisica, solo la perdida de entrenamiento.
- Riesgo de sobreajuste a la tarea especifica: el entrenamiento sobre una unica tarea con 11.872 fotogramas agrupados puede limitar la robustez ante variaciones del entorno no vistas en el dataset.
- Sin soporte de cuantizacion documentado: no se indica compatibilidad con formatos cuantizados, lo que puede limitar el despliegue en hardware con poca VRAM.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del framework LeRobot y del fork `lerobot-cyclo`, cuyas licencias deben verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/put-bread-in-tray-dp-wrist-diffusion
- Perfil del autor: https://huggingface.co/omkarpatil
- Modelos del autor: https://huggingface.co/omkarpatil/models
- Framework LeRobot: https://github.com/huggingface/lerobot (no confirmado en la informacion proporcionada, referencia estandar)
