# PruhaNLP/SmolVLA-pickplace-blue-krill-demo

## Resumen

SmolVLA pick-and-place blue krill demo es un checkpoint de robótica publicado por PruhaNLP en HuggingFace bajo el identificador `PruhaNLP/SmolVLA-pickplace-blue-krill-demo`. Se trata de un ajuste fino (SFT) del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) compacto de 450.046.176 parámetros (~450 M) que convierte observaciones visuales e instrucciones en lenguaje natural en acciones de control para un brazo robótico.

El checkpoint resuelve una única tarea concreta: coger una botella de aceite de krill azul y depositarla dentro de una bandeja azul. Está entrenado sobre el conjunto de datos `PruhaNLP/pickplace-blue-krill-demo` y pensado como referencia base del proyecto RoboSim at Home, con el brazo SO-ARM100 simulado en MuJoCo. El ajuste fino se realizó en modo "expert-only", con el codificador visual congelado y 19160 pasos de entrenamiento, partiendo del checkpoint número 20 del run.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento de un VLA pequeño sobre hardware de bajo coste y simulación abierta, y como punto de partida para nuevos ajustes finos. No es un modelo de propósito general: no genera texto, no razona y no admite tool calling. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y no se han publicado métricas de éxito de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) derivada del modelo base `lerobot/smolvla_base`; no disponible el detalle de capas del checkpoint |
| Parametros totales | 450.046.176 (~450 M), dato del repositorio safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo recibe observaciones visuales e instruccion en lenguaje natural) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; pesos distribuidos en safetensors (repo de 1,8 GB) |
| Idiomas soportados | No disponible; la instruccion de la tarea de demostracion esta redactada en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Tarea | Pick-and-place: coger la botella de aceite de krill azul y colocarla en la bandeja azul |
| Plataforma objetivo | SO-ARM100 simulado en MuJoCo |
| Tamano del repositorio | 1,8 GB |
| Fecha de publicacion en HuggingFace | 2026-09-13 (creacion), 2026-09-13 (ultima actualizacion) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base `lerobot/smolvla_base`, un VLA compacto de la familia SmolVLA integrado en el ecosistema LeRobot. Este tipo de modelos combina un backbone de visión-lenguaje con un modulo especializado en generar acciones motoras, de modo que la misma red procesa imagenes de camara e instrucciones textuales y produce comandos de control para el robot. La informacion proporcionada no detalla el numero de capas, la composicion exacta del backbone ni el mecanismo de decodificacion de acciones, por lo que esos extremos quedan como no disponibles.

Los detalles de entrenamiento si estan documentados parcialmente en la model card. El ajuste fino se hizo sobre el dataset `PruhaNLP/pickplace-blue-krill-demo` con regimen "expert-only" (solo demostraciones expertas, sin episodios suboptimos ni datos de recuperacion de errores), con el codificador visual congelado y 19160 pasos de optimizacion. El resultado es el checkpoint 20 del run. El entorno de entrenamiento y evaluacion es el brazo SO-ARM100 dentro del simulador MuJoCo. No se indica el numero de tokens o transiciones visto, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO, que en cualquier caso no son habituales en el ajuste de politicas de robotica de este tipo.

## Capacidades

- Generacion de acciones de robot a partir de observaciones visuales e instruccion en lenguaje natural, limitada a la tarea de pick-and-place para la que fue ajustado.
- Percepcion visual de la escena: deteccion implicita de la botella azul y de la bandeja azul como objetos relevantes de la tarea.
- Condicionamiento por lenguaje: el modelo acepta una descripcion textual de la tarea ("pick up the blue krill oil bottle and place it inside the blue tray").
- Control de un brazo SO-ARM100 en simulacion MuJoCo.
- Reutilizacion como inicializacion para nuevos ajustes finos sobre tareas similares con el mismo robot.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes, razonamiento multi-paso explicito ni planificacion simbolica.
- No dispone de capacidades multilingues documentadas.
- No dispone de modo "thinking", vision generativa, audio ni generacion de texto.

## Casos de uso

- Reproduccion del demo base de RoboSim at Home: el checkpoint permite replicar el experimento de referencia del proyecto, ejecutando la politica en MuJoCo con el SO-ARM100 para verificar que el pipeline de simulacion funciona de extremo a extremo.
- Punto de partida para nuevos ajustes finos: al ser un fine-tune de `lerobot/smolvla_base` con aprendizajes sobre manipulación, puede servir como inicializacion para tareas de pick-and-place con objetos o bandejas distintas, reduciendo los pasos necesarios frente a partir del modelo base.
- Validacion de pipelines de SFT en LeRobot: sirve como caso de prueba reproducible de un entrenamiento con codificador visual congelado y regimen expert-only, util para comprobar que versiones nuevas de la libreria producen artefactos equivalentes.
- Generacion de episodios sinteticos en simulacion: la politica puede ejecutarse en MuJoCo para producir trayectorias de manipulacion que alimenten experimentos de imitation learning o de evaluacion de robustez.
- Ablaciones tecnicas: comparar este checkpoint (encoder visual congelado) con variantes entrenadas con encoder descongelado permite medir el impacto de esa decision de diseno en la tasa de exito de la tarea.
- Docencia y divulgacion en robotica: es un ejemplo de bajo coste computacional (menos de 2 GB de pesos) que se puede ejecutar en un portatil con GPU modesta, adecuado para cursos de aprendizaje por imitacion y VLA.
- Pruebas exploratorias de transferencia sim-a-real: como punto de partida para evaluar hasta que punto una politica entrenada solo en MuJoCo con SO-ARM100 se comporta de forma aceptable en el robot fisico, asumiendo que no hay validacion publicada de esa transferencia.
- Baseline interno para comparar VLA compactos: frente a politicas clasicas (ACT, diffusion policy) o VLA de mayor tamano, este checkpoint ofrece una referencia de ~450 M de parametros sobre una tarea fija y un entorno reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasa de exito, numero de episodios de evaluacion, ni comparaciones con otras politicas. Tampoco se han encontrado datos de rendimiento en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada con pesos en fp32: aproximadamente 1,8 GB, coherente con el tamano del repositorio (1,8 GB).
- VRAM estimada en bf16/fp16: aproximadamente 0,9 GB (estimacion a partir del numero de parametros).
- VRAM estimada en int8: aproximadamente 0,45 GB (estimacion; no se documentan cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para los pesos; se recomienda al menos una RTX 3060, RTX 4060 o superior para mantener frecuencias de control razonables. Modelos como A100 o H100 solo tendrian sentido para entrenamiento o para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: si, de forma holgada, en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090 y equivalentes; tambien en GPUs de 6-8 GB.
- Inferencia en CPU: tecnicamente viable por el tamano del modelo, pero previsiblemente demasiado lenta para bucles de control en tiempo real.
- Opciones de despliegue: la libreria `lerobot` es la via natural (carga de la politica SmolVLA y ejecucion sobre MuJoCo para simulacion). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

Los valores de otros modelos proceden de documentacion publica de sus respectivos proyectos y no de una evaluacion comparativa realizada aqui; no existen datos de rendimiento que permitan comparar tareas de forma directa con este checkpoint.

| Modelo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA pick-and-place blue krill demo | ~450 M | Imagenes + instruccion en lenguaje natural | apache-2.0 | HuggingFace (`PruhaNLP/SmolVLA-pickplace-blue-krill-demo`) |
| SmolVLA base (`lerobot/smolvla_base`) | ~450 M | Imagenes + instruccion en lenguaje natural | no disponible en la informacion proporcionada | HuggingFace (`lerobot/smolvla_base`) |
| OpenVLA | ~7 B | Imagen unica + instruccion en lenguaje natural | no disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |
| pi0 | ~3,3 B | Multiples vistas + instruccion en lenguaje natural | no disponible en la informacion proporcionada | Pesos abiertos publicados por sus autores |
| GR00T N1 | ~2,2 B | Multiples vistas + instruccion en lenguaje natural | no disponible en la informacion proporcionada | Pesos abiertos publicados por NVIDIA |

## Limitaciones y advertencias

- Checkpoint de demostracion: 0 descargas y 0 "likes" en el momento de la consulta, y sin resultados de evaluacion publicados. No debe tratarse como un modelo validado para produccion.
- Especializacion extrema: solo esta ajustado para una tarea ("coger la botella de krill azul y colocarla en la bandeja azul"), un robot (SO-ARM100) y un entorno (MuJoCo).
- Entrenamiento expert-only: al no incluir episodios suboptimos ni estados de recuperacion, es probable que el modelo no sepa reaccionar si la tarea falla a mitad de ejecucion.
- Codificador visual congelado: reduce la adaptacion a cambios de camara, iluminacion, fondo o apariencia de los objetos respecto a lo visto en el dataset de entrenamiento.
- Riesgo de sobreajuste al entorno simulado: no hay evidencia publicada de transferencia sim-a-real; el comportamiento en el robot fisico puede degradarse de forma notable.
- Idiomas: no hay idiomas documentados. La instruccion de la tarea esta en ingles, por lo que el comportamiento con instrucciones en castellano es desconocido.
- Riesgo de fallo silencioso: como politica de robotica, puede producir acciones plausibles pero incorrectas sin ninguna senal de incertidumbre ni capacidad de explicar el fallo.
- Ausencia de capacidades generativas de texto: no sirve para chat, razonamiento, codigo, tool calling ni tareas de agentes, pese a compartir familia con modelos de visión-lenguaje.
- Licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base `lerobot/smolvla_base` y las condiciones del dataset `PruhaNLP/pickplace-blue-krill-demo` antes de un uso comercial.
- La fecha indicada por HuggingFace para la creacion y ultima actualizacion (2026-09-13) es posterior a la fecha de publicacion de muchos modelos de referencia; conviene verificar la procedencia y el estado real del repositorio.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: solo paginas de inicio de sesion ajenas al proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PruhaNLP/SmolVLA-pickplace-blue-krill-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/PruhaNLP/pickplace-blue-krill-demo
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio del proyecto RoboSim at Home: https://github.com/PruhaNLP/robosim-at-home

Nota: la busqueda web no aporto enlaces adicionales relevantes (paper, blog o demo) sobre este checkpoint. El resto de enlaces queda como no disponible.
