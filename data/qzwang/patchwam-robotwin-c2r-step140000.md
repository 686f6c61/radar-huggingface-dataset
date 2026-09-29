# QZWang/patchwam-robotwin-c2r-step140000

## Resumen

PatchWAM (Patch World-Action Model) es un modelo generativo para robotica que unifica la prediccion de acciones continuas y la prediccion visual dentro de un mismo backbone: las acciones se tratan como un tipo mas de patch mediante una proyeccion fija denominada Action-as-Patch, de modo que un unico modelo denoisa simultaneamente los latentes de accion y los latentes visuales futuros. El repositorio `QZWang/patchwam-robotwin-c2r-step140000` contiene el checkpoint concreto con el que se reporta el resultado oficial del modelo en el benchmark RoboTwin 2.0, en su variante C2R (tareas bimanuales de 50 clases, condiciones Clean y Randomized).

El checkpoint parte de la base FLUX.2 Klein 4B (aproximadamente 4.000 millones de parametros) sin preentrenamiento previo especifico de Action-as-Patch y se entrena exclusivamente con datos de entrenamiento de RoboTwin 2.0 filtrados por la receta C2R. Se distribuye como un unico fichero PyTorch `.pt` de 7,75 GB que incluye pesos del modelo, el numero de paso, el dtype y los pesos del codificador de propriocepcion, sin estado del optimizador. Reporta una tasa de exito media del 79,14 por ciento (91,56 por ciento en Clean y 66,72 por ciento en Randomized) sobre 10.000 rollouts.

Es relevante ahora porque forma parte de una linea reciente que replantea el problema de las politicas de robot como un problema de generacion unificada mundo-accion, en lugar de entrenar por separado un modelo de mundo y una politica de control. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia explicita propia, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FLUX.2 Klein 4B Action-as-Patch (backbone generativo tipo diffusion/flow con parcheado unificado de acciones y vision) |
| Parametros totales | 4B (etiqueta de la base FLUX.2 Klein 4B; no se publica el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint `.pt`; no se publican cuantizaciones GGUF, AWQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que el usuario debe cumplir las licencias de RoboTwin, FLUX.2, el autoencoder y el text encoder) |
| Formato de pesos | PyTorch `.pt` (`step_140000.pt`, 7.751.411.897 bytes) |
| Dimension de accion/estado | 14 |
| Horizonte de accion / intervalo de replanificacion | 16 / 16 |
| Pasos de denoising en evaluacion | 10 |
| SHA256 del checkpoint | 22f556d02903a06f23f21a8a28ef91ff92611de0bad4efbf8827c01bd3701fd9 |
| Tamano del repositorio | 7.8 GB |

## Arquitectura y entrenamiento

La arquitectura se apoya en FLUX.2 Klein 4B, un backbone generativo de tipo flow/diffusion sobre latentes, y le anade el mecanismo Action-as-Patch: las acciones continuas de 14 dimensiones se proyectan mediante un mapeo fijo al espacio de patches, de forma que el mismo transformer denoisa a la vez los latentes de accion y los latentes de imagen futura. Esto implica que el modelo es simultaneamente politica (predice como debe moverse el robot) y modelo de mundo (predice como quedara la escena), compartiendo todos los parametros generativos. El checkpoint incluye ademas pesos de un codificador de propriocepcion. El horizonte de accion es de 16 pasos y se replanifica cada 16 pasos, con 10 pasos de denoising en la evaluacion.

El entrenamiento se realizo sin preentrenamiento previo de Action-as-Patch, partiendo directamente de la base FLUX.2 Klein 4B. La receta portatil esta en `training_recipe.yaml` y el run utilizo 2 nodos x 8 GPUs (16 GPUs en total), con batch por GPU de 16, acumulacion de gradiente 1 y batch global de 256. Los datos proceden unicamente de RoboTwin 2.0, seleccionados con `periodic_prefix(period=550, keep_first=50)` seguido del filtro de descarte de estados inactivos (non-idle) registrado en la receta; el autor afirma que no se usaron rollouts de evaluacion ni datasets privados adicionales. No se especifica si hubo RLHF, DPO ni fases de ajuste por preferencias, algo poco habitual en este tipo de politicas.

## Capacidades

- Prediccion de acciones continuas bimanuales de 14 dimensiones con horizonte de 16 pasos.
- Prediccion conjunta del estado visual futuro de la escena dentro del mismo backbone (modelo de mundo).
- Ejecucion de tareas de manipulacion bimanual en el benchmark RoboTwin 2.0: 50 tareas evaluadas en condiciones Clean y Randomized.
- Aprendizaje por imitacion a partir de demostraciones (tag `imitation-learning`).
- Robustez parcial a variaciones de entorno: mantiene 66,72 por ciento de exito en la condicion Randomized frente a 91,56 por ciento en Clean.
- Integracion con el codificador de propriocepcion incluido en el checkpoint.
- Soporte de tool calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no aplica.
- Vision, audio u otras modalidades como entrada: no disponible (el modelo opera sobre latentes visuales, pero no se documenta un pipeline de entrada multimodal de proposito general).

## Casos de uso

- Manipulacion robotica bimanual en laboratorio: el modelo se puede desplegar como politica de control para las 50 tareas de RoboTwin 2.0, con horizonte de accion de 16 y replanificacion cada 16 pasos, lo que encaja con bucles de control a frecuencia media.
- Investigacion en modelos mundo-accion unificados: sirve como checkpoint de referencia para reproducir el resultado C2R y para estudiar si compartir parametros entre prediccion visual y prediccion de accion aporta ventajas frente a arquitecturas separadas.
- Benchmarking reproducible: al incluir `metrics.json` y el JSON completo por tarea en `results/c2rdr4_140k_100ep_full.json`, permite comparar nuevas politicas bajo el mismo protocolo de 50 tareas x 100 episodios x 2 condiciones.
- Evaluacion de robustez ante aleatorizacion: la diferencia entre Clean (91,56 por ciento) y Randomized (66,72 por ciento) lo convierte en un caso de estudio util para medir la degradacion de una politica cuando se varian posiciones, texturas o iluminacion.
- Generacion de datos sinteticos de escena: al predecir latentes visuales futuros, se puede emplear como generador de trayectorias visuales para aumentar datasets de imitacion, siempre que se valide la fidelidad fisica de las predicciones.
- Transferencia a plataformas reales: como punto de partida para fine-tuning con datos propios en robots bimanuales de 14 grados de libertad, dado que el autor recomienda partir del checkpoint y respetar las licencias upstream.
- Ablacion de recetas de datos: la receta de filtrado (`periodic_prefix` con periodo 550 y retencion de los primeros 50, mas filtro non-idle) es reutilizable para estudiar el efecto del filtrado de demostraciones en la tasa de exito.

## Benchmarks y rendimiento

| Benchmark | Condicion | Protocolo | Tasa de exito |
|---|---|---:|---:|
| RoboTwin 2.0 C2R | Clean | 50 tareas x 100 episodios | 91,56 por ciento |
| RoboTwin 2.0 C2R | Randomized | 50 tareas x 100 episodios | 66,72 por ciento |
| RoboTwin 2.0 C2R | Media | 10.000 rollouts totales | 79,14 por ciento |

La media se define como la media aritmetica de las medias por tarea en Clean y Randomized. El desglose completo por tarea esta en `results/c2rdr4_140k_100ep_full.json`. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje, vision o razonamiento, ya que no son aplicables a esta clase de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 7,75 GB, lo que corresponde aproximadamente a pesos en precision de 16 bits para 4B de parametros. Hay que sumar el autoencoder y el text encoder de FLUX.2 Klein, que no vienen incluidos en este repositorio, ademas de los latentes de imagen y accion. Una estimacion orientativa razonable es de 16 a 24 GB de VRAM en bf16/fp16, aunque no es un dato publicado por el autor.
- GPU recomendadas: para entrenamiento, la receta documentada usa 2 nodos x 8 GPUs (16 aceleradores) con batch por GPU de 16, lo que en la practica corresponde a A100, H100 o equivalentes de 80 GB. Para inferencia, una GPU de 24 GB o mas es suficientes segun la estimacion anterior.
- Cabe en GPU de consumo: probablemente si en tarjetas de 24 GB como RTX 3090 o RTX 4090, asumiendo que la carga del autoencoder y el text encoder se puede descargar de memoria entre pasos. No confirmado por el autor.
- Opciones de despliegue: PyTorch es la unica via documentada. No hay soporte anunciado para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion/flow con salida de acciones. El despliegue requiere el codigo del proyecto PatchWAM y el pipeline de FLUX.2 para los componentes auxiliares.
- Latencia y throughput: no disponible. Solo se sabe que la evaluacion usa 10 pasos de denoising por prediccion y que el area de accion se replanifica cada 16 pasos.
- Almacenamiento: 7,8 GB para el repositorio mas el espacio de los componentes FLUX.2 Klein base que se descarguen por separado.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El checkpoint se evalua sobre RoboTwin 2.0 C2R, un benchmark en el que habitualmente se comparan politicas de imitacion y modelos vision-lenguaje-accion, pero ni la model card ni los resultados de busqueda incluidos aportan cifras de esos sistemas alternativos.

| Modelo | Parametros | Contexto | Tasa de exito en RoboTwin 2.0 C2R | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatchWAM (este checkpoint) | 4B (base FLUX.2 Klein 4B) | no disponible | 79,14 por ciento de media (91,56 Clean / 66,72 Randomized) | no disponible | HuggingFace, 0 descargas, 0 likes |
| Alternativas de la misma categoria (politicas de imitacion y VLA sobre RoboTwin 2.0) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint esta entrenado exclusivamente con datos de RoboTwin 2.0 filtrados por la receta C2R; no hay evidencia de generalizacion fuera de ese dominio.
- La caida de 91,56 a 66,72 por ciento entre Clean y Randomized indica una sensibilidad significativa a la aleatorizacion del entorno (posiciones, apariencia, iluminacion).
- No se declara licencia propia del repositorio. El autor traslada al usuario la responsabilidad de cumplir las licencias de RoboTwin, FLUX.2, el autoencoder y el text encoder, lo que hace inviable un uso comercial sin aclarar previamente esos terminos.
- El checkpoint no incluye el autoencoder ni el text encoder de FLUX.2 Klein, solo los pesos del modelo, el numero de paso, el dtype y el codificador de propriocepcion. Sin el resto del pipeline no es utilizable de forma autonoma.
- No incluye estado del optimizador ni rutas de entrenamiento, por lo que no permite reanudar el entrenamiento tal cual; solo sirve para inferencia o fine-tuning desde los pesos.
- No hay informacion sobre sesgos, comportamiento en dominios fuera de distribucion, ni evaluaciones de seguridad.
- La prediccion de latentes visuales futuros es una salida generativa: existe riesgo de que las imagenes predichas sean fisicamente inconsistentes, lo que no debe confundirse con una simulacion valida.
- El modelo no es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, y no debe evaluarse con benchmarks de texto.
- El repositorio tenia 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de terceros.
- Se desconoce el dtype exacto de los pesos y la longitud de contexto o de secuencia soportada, datos relevantes para planificar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/QZWang/patchwam-robotwin-c2r-step140000
- Fichero de pesos: https://huggingface.co/QZWang/patchwam-robotwin-c2r-step140000/blob/main/step_140000.pt
- Paper (arXiv): https://arxiv.org/abs/2609.25961
- Pagina del proyecto PatchWAM: https://kang915-deep.github.io/PatchWAM/
- Documentacion oficial de RoboTwin 2.0: https://robotwin-platform.github.io/doc/index.html
- Repositorio de codigo de RoboTwin 2.0: https://github.com/robotwin-Platform/robotwin
- Sitio de RoboTwin 2.0: https://robotwin-platform.github.io/
