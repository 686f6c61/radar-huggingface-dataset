# moonjongsul/kcare_hang_cup_pink_upper_smolvla_260921

## Resumen

Este repositorio contiene cinco checkpoints de SmolVLA (una política de vision-lenguaje-accion) entrenados por el usuario moonjongsul para una tarea concreta de robótica manipulativa: colgar una taza rosa en una posición superior ("pink-upper hang-cup"), dentro de un escenario con tres tazas. No es un modelo de lenguaje generalista, sino un modelo de control robótico que recibe imágenes de cámara e instrucciones en lenguaje natural y emite acciones motoras. El entrenamiento se hizo sobre el dataset `yunjuyoung64/smolvla_hang_cup_3cups_260921_pink_upper`, con 80 episodios de demostración, y se publican los cinco checkpoints con menor pérdida de entrenamiento para facilitar su evaluación.

El interés del modelo es, por tanto, acotado y práctico: sirve como artefacto reproducible para evaluar el ajuste fino de SmolVLA en una tarea específica y para comparar el efecto del número de pasos de entrenamiento sobre la pérdida. La horquilla de pérdida entre el mejor checkpoint (0,031743 en el paso 49.500) y el quinto (0,033412 en el paso 39.900) es muy estrecha, de solo 0,001669, lo que sugiere que el modelo ha entrado en una meseta de convergencia en esa fase del entrenamiento.

La model card es muy breve y no documenta arquitectura, licencia, idiomas ni resultados de evaluación en robot real. Todos los datos técnicos que no aparecen en ella se marcan en esta ficha como "no disponible" en lugar de inferirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion) sobre `lerobot`; detalles exactos no disponibles en la model card |
| Parametros totales | no disponible (el tamano del repo, 4,5 GB para 5 checkpoints, es compatible con unos 450 M de parametros por checkpoint en bf16; es una inferencia, no un dato confirmado) |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF, AWQ, GPTQ ni versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints de politica de `lerobot`) |

## Arquitectura y entrenamiento

La model card identifica el modelo como un conjunto de checkpoints de SmolVLA dentro del ecosistema LeRobot. SmolVLA es una familia de políticas de vision-lenguaje-accion de tamano reducido, concebida para ejecutarse en hardware asequible; combina un backbone de vision-lenguaje con un modulo que genera acciones motoras a partir de la representacion multimodal. Esta ficha no puede confirmar los detalles concretos de la variante empleada (numero de capas, dimension del backbone, mecanismo de decodificacion de acciones, si se uso flow matching o regresion directa) porque la model card no los incluye. El repositorio ocupa 4,5 GB y contiene cinco checkpoints completos, lo que implica aproximadamente 900 MB por checkpoint.

El entrenamiento se realizo sobre 80 episodios del dataset `yunjuyoung64/smolvla_hang_cup_3cups_260921_pink_upper`, una tarea de manipulacion con tres tazas en la que el objetivo es colgar la taza rosa en la posicion superior. La model card publica la perdida de entrenamiento de los cinco mejores checkpoints, seleccionados por loss, y no menciona fases de RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en un modelo de control y no de lenguaje. La tabla de checkpoints es el unico registro de progreso disponible:

| Carpeta | Paso | Perdida de entrenamiento | Nota |
|---|---|---|---|
| `step049500_best_loss0.031743` | 49500 | 0,031743 | mejor |
| `step046100_loss0.031868` | 46100 | 0,031868 | +0,000125 respecto al mejor |
| `step045800_loss0.032197` | 45800 | 0,032197 | +0,000454 respecto al mejor |
| `step043000_loss0.032377` | 43000 | 0,032377 | +0,000634 respecto al mejor |
| `step039900_loss0.033412` | 39900 | 0,033412 | +0,001669 respecto al mejor |

La dispersion de 0,001669 entre el paso 39.900 y el 49.500 indica que, en ese tramo, incrementar los pasos apenas reduce la perdida. No se documenta ninguna innovacion tecnica adicional, ni datos sobre aumentos de datos, resolucion de imagen, frecuencia de control o configuracion de las camaras.

## Capacidades

- Generacion de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural: es un modelo de politica, no un generador de texto.
- Manipulacion robótica de una tarea concreta: colgar una taza rosa en la posicion superior dentro de un escenario de tres tazas.
- Ejecucion de la tarea condicionada por el checkpoint elegido: los cinco checkpoints corresponden a distintos pasos de entrenamiento y permiten estudiar la evolucion de la politica.
- No hay evidencia publicada de soporte de tool calling ni de function calling; no aplica a un modelo de accion.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso mas alla de la secuencia de acciones que produce la politica.
- Capacidades multilingues: no disponible. La model card no documenta idiomas ni la composicion linguistica del dataset.
- No se documentan modos especiales (modo de razonamiento, audio, vision adicional fuera de las camaras de entrada) ni ninguna capacidad fuera del control robótico.

## Casos de uso

- Automatizacion de una celda de pick-and-place con tazas: el modelo puede controlar un brazo robotico para recoger y colgar la taza rosa de la posicion superior, siempre que el entorno de despliegue reproduzca las condiciones del dataset de 80 episodios.
- Punto de partida para ajuste fino de nuevas tareas: dado que se publican cinco checkpoints con perdidas muy proximas, resultan utiles como inicializacion para reentrenar con un dataset mayor o con variaciones de iluminacion, posicion de las tazas o tipo de objeto.
- Investigacion en modelos vision-lenguaje-accion de bajo coste: permite reproducir el pipeline de LeRobot de entrenamiento y evaluacion sin necesidad de GPU de gama alta, y comparar la curva de perdida entre pasos.
- Evaluacion comparativa de checkpoints: los cinco ficheros permiten medir si la diferencia de perdida (0,000125 a 0,001669) se traduce en diferencias reales de exito en el robot, un experimento habitual en investigacion de politicas.
- Banco de pruebas de infraestructura de inferencia robótica: sirve para validar la latencia y el throughput de LeRobot sobre una GPU concreta antes de escalar a modelos mayores.
- Recogida de datos guiada: en laboratorios que usan teleoperacion, este checkpoint puede emplearse como politica inicial para que el robot actue de forma semiautonoma y el operador solo corrija, acelerando la generacion de nuevos episodios.
- Demostracion docente: la tarea es acotada y visualmente clara, lo que la hace util para explicar el ciclo observacion-accion en un curso de robotica o de aprendizaje por imitacion.
- Despliegue en robots de bajo coste: el tamano reducido del checkpoint permite plantear inferencia en equipos de gama media sin clúster dedicado, aunque no hay medidas publicadas de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato numerico publicado es la perdida de entrenamiento de los cinco checkpoints, recogida en la tabla de la seccion de arquitectura. No hay resultados de exito en robot real, ni evaluaciones de generalizacion, ni comparaciones con otros modelos. Tampoco se aportan metricas de simulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para una politica de este tipo con cinco checkpoints de unos 900 MB cada uno, el peso de un solo checkpoint en bf16 ronda 1 GB, por lo que la inferencia con una sola camara suele moverse en el rango de 3 a 6 GB de VRAM contando activaciones y buffers de imagen; es una estimacion orientativa, no un dato del autor.
- GPU recomendadas: no disponible en la model card. Por tamano, cualquier GPU con 8 GB o mas deberia ser suficiente; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son opciones razonables para pruebas. Para lotes grandes o varias camaras de alta resolucion, una A100 o una H100 dan margen de sobra.
- Cabe en GPU de consumo: muy probablemente si, dado el tamano del checkpoint, aunque no hay confirmacion del autor ni medidas de consumo reales.
- Opciones de despliegue: la libreria declarada es `lerobot`, por lo que el despliegue natural es mediante los scripts de LeRobot (por ejemplo `lerobot-record` o los utilitarios de evaluacion de politicas). No se publican pesos en GGUF ni versiones compatibles con vLLM, llama.cpp, Ollama o TGI; estos motores estan orientados a modelos de lenguaje y no a politicas de accion, por lo que no aplican.
- Latencia y throughput estimados: no disponible. No se publican medidas de frecuencia de control, tiempo de inferencia ni rendimiento por segundo en ninguna plataforma.
- Descarga selectiva: la model card indica que puede descargarse un unico checkpoint con `hf download moonjongsul/kcare_hang_cup_pink_upper_smolvla_260921 --include "step049500_best_loss0.031743/*" --local-dir ./ckpt_best`, lo que evita los 4,5 GB completos del repositorio.

## Comparativa con modelos similares

La tabla compara este ajuste fino con alternativas del mismo espacio. Los datos de las alternativas provienen de referencias publicas de esos modelos y no de la model card analizada, que no ofrece ninguna comparacion.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `moonjongsul/kcare_hang_cup_pink_upper_smolvla_260921` | no disponible (estimado en torno a 450 M por checkpoint) | no disponible | acciones motoras | no disponible | HuggingFace, 0 descargas, 0 likes |
| SmolVLA base | en torno a 450 M segun la referencia publica del modelo | no disponible en esta ficha | acciones motoras | segun la licencia publicada por el autor del modelo base, no verificada aqui | HuggingFace y LeRobot |
| OpenVLA | 7 000 M segun la referencia publica | no disponible en esta ficha | acciones motoras discretizadas | licencia publica del proyecto, no verificada aqui | HuggingFace |
| pi0 (Physical Intelligence) | en torno a 3 000 M segun la referencia publica | no disponible en esta ficha | acciones motoras | licencia publica del proyecto, no verificada aqui | HuggingFace |

La ventaja principal frente a OpenVLA es el tamano: un checkpoint de menos de 1 GB por fichero frente a los aproximadamente 14 GB en bf16 de un modelo de 7 000 M, lo que reduce requisitos de VRAM y simplifica el despliegue. La desventaja es la especializacion extrema: este ajuste fino solo ha visto 80 episodios de una tarea concreta y no hay datos que respalden su generalizacion a otros objetos, posiciones o entornos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ningun analisis de sesgos, y en un modelo de control el sesgo relevante seria el sesgo de posicion o de apariencia aprendido de los 80 episodios (por ejemplo, dependencia de la posicion concreta de las tazas o del color rosa).
- Riesgo de sobreajuste: 80 episodios son una cantidad reducida para una politica de manipulacion. La dispersion de perdida de solo 0,001669 entre los pasos 39.900 y 49.500 sugiere que el modelo esta en meseta, pero la perdida de entrenamiento no es un indicador fiable de exito en el robot.
- Ausencia de evaluacion: no hay resultados de exito en robot real, ni de simulacion, ni de generalizacion a condiciones no vistas. Cualquier uso en produccion requeriria una validacion propia.
- Riesgo de alucinacion en sentido amplio: en un modelo de accion, el equivalente es ejecutar una trayectoria incorrecta o insegura cuando la escena se aleja de la distribucion de entrenamiento. No hay mecanismos de seguridad documentados ni limites de parada.
- Limitaciones de contexto e idioma: no disponible. Se desconoce la ventana de contexto, la resolucion de imagen esperada, el numero de camaras soportado y los idiomas que entiende la parte de lenguaje.
- Restricciones de licencia: la licencia no esta declarada en la model card ni en los metadatos proporcionados. Esto impide determinar si el uso comercial esta permitido. Es un riesgo legal relevante antes de integrar el modelo en cualquier producto.
- Dependencia del pipeline: el modelo esta etiquetado como `lerobot` y los checkpoints son especificos de esa libreria; usarlos fuera de ella requeriria trabajo de conversion no documentado.
- Fecha de publicacion: el repositorio figura como creado y actualizado el 22 de septiembre de 2026, sin descargas ni likes, y sin historial de mantenimiento posterior.
- Sin informacion sobre el dataset: aunque se cita el dataset de origen, no se detallan condiciones de captura, diversidad de escenas ni procedencia, lo que dificulta juzgar la representatividad del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moonjongsul/kcare_hang_cup_pink_upper_smolvla_260921
- Dataset de entrenamiento citado en la model card: `yunjuyoung64/smolvla_hang_cup_3cups_260921_pink_upper` (referencia textual; no se proporciono URL verificada)
- Libreria de despliegue declarada: `lerobot`
- Paper de SmolVLA: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con SmolVLA; los resultados obtenidos correspondian a paginas sin relacion con el tema, por lo que no se incluyen.
