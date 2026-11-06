# at237299966/ODE_policy_euler_sidehead_fold_towel

## Resumen

ODE Policy Euler con side head multimodal es un modelo de imitacion para robotica bimanual desarrollado por el usuario at237299966, entrenado sobre demostraciones reales del robot Galaxea R1 Lite doblando una toalla con ambos brazos. El modelo aprende un campo de velocidades sobre los 12 objetivos articulares de las dos extremidades y lo integra mediante un solver de Euler explicito con 8 pasos de control por chunk, lo que lo situa en la familia de las neural ODE aplicadas a control de robots.

La relevancia tecnica del checkpoint reside en su side head multimodal: una cabeza auxiliar que lee las caracteristicas del campo una vez por chunk y emite una amplitud por paso y una mezcla gaussiana de 12 componentes sobre la desviacion epsilon. Esto permite servir el modelo de forma determinista (media del campo) o con muestreo estocastico, sin reentrenar el campo principal. El modelo se distribuye como checkpoints de PyTorch (4,2 GB) con configuracion Hydra resuelta y registro de entrenamiento.

Se trata de un artefacto de investigacion reproducible mas que de un modelo de proposito general: no procesa lenguaje, no tiene contexto textual y su unica modalidad de entrada son tres camaras RGB mas propriocepcion de 14 dimensiones. Su interes esta en la receta de entrenamiento, la integracion ODE y el desacoplamiento entre campo determinista y cabeza de incertidumbre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Neural ODE con campo de velocidades FiLM-MLP (4 capas, ancho 512) sobre codificadores ResNet18 (GroupNorm, random crop) por camara; side head MLP (oculta 256, 12 componentes); cabeza de gripper separada (2 logits por paso) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de 8 frames de observacion y chunk de 8 acciones) |
| Tipos de cuantizacion | no disponible (checkpoints `torch.save` con `pickle_module=dill`; no se publican pesos en GGUF ni safetensors) |
| Idiomas soportados | no disponible (modelo sin entrada ni salida de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoints `.ckpt` de PyTorch (`torch.save` con `pickle_module=dill`), con `model`, `ema_model`, `optimizer` y config Hydra serializada |

## Arquitectura y entrenamiento

El modelo sigue un esquema de imitacion condicionada: tres camaras (`head_rgb` a 720x1280, `right_wrist_rgb` y `left_wrist_rgb` a 360x640) se reescalan a 256x256 tras relleno cuadrado y pasan por un ResNet18 con GroupNorm y random crop, produciendo una condicion c de 512 dimensiones a partir de 8 frames. El campo de velocidades ȧ = f(c, s, a) es un FiLM-MLP de 4 capas y ancho 512 que opera sobre los 12 objetivos articulares absolutos; la propriocepcion de 14 dimensiones (posiciones articulares y apertura de pinzas en milimetros) entra solo en el campo (`cond_use_s=false`). La integracion usa Euler con 1 subpaso, 8 pasos de control por chunk, `vel_scale=0.05` y observacion fija durante el chunk (`obs_update=fixed`). El side head (oculta 256, 12 componentes) lee las caracteristicas del campo una vez por chunk y emite amplitud por paso y mezcla gaussiana sobre epsilon; el campo se entrena igual que sin la cabeza, de modo que `--eps mean` recupera la politica ODE determinista.

El entrenamiento uso el dataset `at237299966/r1lite_fold_towel` en formato LeRobot v2.1 a 15 Hz: 35 episodios de 455-604 frames (30-40 s), de los que se emplean 33 (se descartan los episodios 2 y 11 por un fallo de agarre repetido en la fase de arrastre). Se aplico perturbacion del estado inicial en el 50% de las muestras, con desviacion por articulacion derivada de los datos (unas 3 pasos tipicos, suelo de 0.005 rad) y decaimiento de 0.7 por paso. La optimizacion fue AdamW con lr 1.5e-4, schedule coseno a 300 epocas, warm-up de 500 pasos y EMA, en 2 x A100-40GB con DDP y batch global de 80 (40 por GPU), 208 pasos por epoca y 62.400 pasos totales, en 10 h 08 min (122 s/epoca). La perdida de validacion es una senal debil: un unico episodio reservado, pesos sin EMA y perturbacion de arranque activa; con el side head su valor queda dominado por el termino de verosimilitud gaussiana de la cabeza, por lo que el autor recomienda comparar checkpoints en el robot.

## Capacidades

- Generacion de trayectorias de control bimanual: produce chunks de 8 pasos con 12 objetivos articulares absolutos (6 por brazo) a partir de observaciones visuales y de propriocepcion.
- Manipulacion bimanual de tejido deformable: la tarea aprendida es agarrar la toalla con ambas pinzas, doblarla una vez, soltar, reagarrar la toalla doblada y arrastrarla hacia el robot.
- Prediccion de apertura y cierre de pinzas: cabeza dedicada de 2 logits por paso, con +1 para cerrar y -1 para abrir; cada pinza cierra dos veces por episodio (doblado y arrastre).
- Control de incertidumbre: el side head emite amplitud por paso y mezcla gaussiana de 12 componentes sobre la desviacion, permitiendo inferencia determinista (`--eps mean`), centrada (`--eps center`) o muestreada (`--eps sample`).
- Integracion ODE explicita: campo de velocidades integrado con Euler, 1 subpaso y 8 pasos de control por chunk, con la observacion fija durante el chunk.
- Percepcion multimodal de tres camaras: cabeza, muneca derecha y muneca izquierda, con la misma geometria de reescalado que el cliente del robot.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, matematicas ni capacidades multilingues; no hay modalidad de texto, audio ni lenguaje.

## Casos de uso

- Investigacion en imitacion bimanual: servir el checkpoint con el cliente cerrado `main_r1lite_closedloop.py` a 15 Hz para reproducir la tarea de doblado de toalla y comparar checkpoints tempranos y tardios en el robot, tal como recomienda el autor.
- Estudio de neural ODE en control: usar el campo de velocidades y el solver Euler con `vel_scale=0.05` como linea base reproducible frente a politicas de difusion o flow matching en el mismo dataset.
- Analisis de incertidumbre en politicas de robot: explotar el side head con `--eps sample` y `--eps center` para medir la dispersion de la mezcla gaussiana de 12 componentes y su correlacion con fallos de agarre.
- Deteccion de modos de fallo en agarre: el dataset descarta los episodios 2 y 11 por un primer agarre izquierdo que no sujeta; el modelo y su cabeza de pinzas permiten estudiar ese patron y disenar mascaras de rampa (`--gripper-ramp-mask moving`, umbral 75 mm).
- Reproduccion de experimentos: reentrenar con la configuracion Hydra publicada (`config/config.yaml`, `config/overrides.yaml`) en 2 x A100-40GB durante unas 10 horas para validar la receta de perturbacion inicial y EMA.
- Prototipado de despliegue cliente-servidor: usar `serve_policy` y `test_client` con `-n 40 --bimanual --gripper_range 0 100` como pre-flight antes de ejecutar en hardware real.
- Docencia y divulgacion: ejemplo completo de pipeline LeRobot v2.1 con tres camaras, propriocepcion, cabeza de gripper y registro de entrenamiento por paso y epoca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta curvas de perdida de entrenamiento y validacion:

| Epoca | 0 | 10 | 50 | 100 | 150 | 200 | 250 | 300 |
|---|---|---|---|---|---|---|---|---|
| Train loss | 5,5 | 3,76 | 2,17 | 0,999 | -0,0484 | -1,53 | -3,72 | -5,15 |
| Val loss | 5,42 | 14,1 | 58,3 | 125 | 262 | 470 | 775 | 921 (ep. 295) |

La perdida de validacion minima es 5,42 en la epoca 0, con validacion cada 5 epocas. El autor advierte que esta metrica es una senal debil (un unico episodio reservado, pesos sin EMA, perturbacion de arranque activa y, con side head, dominada por el termino de verosimilitud gaussiana), por lo que la seleccion de checkpoint debe hacerse en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 4,2 GB e incluye seis checkpoints completos con estado del optimizador, por lo que el peso de un unico checkpoint es una fraccion de esa cifra.
- GPU recomendadas: el entrenamiento se realizo en 2 x A100-40GB con DDP; para inferencia no se especifica GPU minima.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; la arquitectura (tres ResNet18 mas un MLP de 4 capas) es ligera, pero no se publican medidas de VRAM ni requisitos oficiales.
- Opciones de despliegue: servidor propio `roboverse_learn.il.deploy.serve_policy` con `--checkpoint`, `--host`, `--port`, `--device cuda:0`, `--gripper_close 0`, `--gripper_open 100`, `--gripper_ramp_ticks 50 51` y `--eps mean|center|sample`; cliente de pre-flight `roboverse_learn.il.deploy.test_client`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: el cliente cerrado ejecuta a 15 Hz y consume la fila 0 de cada respuesta de forma `(8, 14)`; el servidor reintegra un chunk cada 8 ticks. No se publican medidas de latencia por inferencia.
- Requisito de carga: hace falta el codigo `ODE_Policy` en la rama `r1lite_exp`, commit `e9cc9c0` o posterior, y `torch.load(..., pickle_module=dill, weights_only=False)`; `--eps` requiere el servidor del 2026-10-23 o posterior.
- Condicion de arranque: el robot debe partir en reposo con el torso en la pose de las demostraciones `[-0.6944, 1.5135, 0.8066]` rad, que no forma parte del estado de la politica.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este checkpoint ni de alternativas equivalentes en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A modo de contextualizacion por categoria:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ODE Policy Euler side head (este modelo) | no disponible | ventana de 8 frames, chunk de 8 acciones | sin benchmarks publicados; val loss 5,42 en epoca 0 | MIT | Hugging Face, 0 descargas |
| Alternativas de imitacion bimanual | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especifico de tarea y de hardware: entrenado unicamente para doblar una toalla con el Galaxea R1 Lite; no generaliza a otras tareas, objetos ni morfologias sin reentrenamiento.
- Dependencia de la pose inicial: el torso debe arrancar en `[-0.6944, 1.5135, 0.8066]` rad, fuera del estado de la politica, lo que anade fragilidad al despliegue.
- Seleccion de checkpoint no resuelta: la perdida de validacion es una senal debil y crece hasta 921 en la epoca 295; el autor recomienda comparar checkpoints en el robot antes de elegir uno.
- Dataset pequeno y con descartes: 33 episodios utiles de 35, con dos descartados por fallo de agarre; el sesgo hacia una unica forma de ejecutar la tarea es alto, y el propio autor senala que `--eps mean` es adecuado porque "fold_towel tiene una sola forma de hacerse".
- Riesgo de alucinacion en el sentido de trayectorias plausibles pero fisicamente invalidas: al ser un campo de velocidades integrado con Euler de un solo subpaso, errores de integracion o desviaciones del side head pueden producir comandos fuera de rango.
- Carga insegura: los checkpoints usan `pickle_module=dill` y requieren `weights_only=False`; solo deben cargarse checkpoints de confianza.
- Sin soporte de lenguaje, tool calling ni agentes: no es un modelo de proposito general y no debe evaluarse con benchmarks de texto.
- Idiomas no aplicables: no hay interfaz de lenguaje; la unica entrada es visual y proprioceptiva.
- Licencia MIT: permite uso comercial, pero no se ofrece ninguna garantia de seguridad fisica; cualquier despliegue en robot real requiere validacion y protocolos de parada de emergencia.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/at237299966/ODE_policy_euler_sidehead_fold_towel
- Dataset de entrenamiento: https://huggingface.co/datasets/at237299966/r1lite_fold_towel
- Repositorio de codigo `ODE_Policy` (rama `r1lite_exp`, commit `e9cc9c0` o posterior): no disponible como enlace directo en la informacion proporcionada
- Servidor de despliegue `roboverse_learn.il.deploy.serve_policy`: no disponible como enlace directo en la informacion proporcionada
- Cliente cerrado `main_r1lite_closedloop.py` (openpi-r1lite): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada
