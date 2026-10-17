# shrg7/pi05-oer10mix-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-10k

## Resumen

Este repositorio contiene un checkpoint de `pi0.5` en JAX, publicado bajo el ecosistema openpi, que implementa una política visión-lenguaje-acción (VLA) para robótica de manipulación. No es un modelo de lenguaje conversacional: es un policy que recibe observaciones visuales e instrucciones en lenguaje natural y emite secuencias de acciones motoras. El autor lo publica como instantánea intermedia de un entrenamiento más largo: el checkpoint 9999 corresponde a 10.000 actualizaciones del optimizador de una tirada planificada hasta 100.000.

El interés técnico está en el acondicionamiento por descripción de robot (URMA). La política recibe, junto con la observación, una tabla de hasta 8 articulaciones por 27 valores por articulación (límites de articulación, anchura del gripper, etc.), que se procesa mediante una red pequeña y se inyecta en el condicionamiento del experto en acciones. Esto permite entrenar una única política sobre robots heterogéneos, identificando cada plataforma mediante una huella derivada de la cadena `embodiment_params` del episodio. El entrenamiento mezcla datos reales (DROID, MolmoBot), simulación de un rig real y simulación multirobot (OER-10).

La tarea declarada es pick-and-place. El checkpoint parte de `pi05_base` con fine-tuning completo, aplica un objetivo dual con aislamiento de conocimiento (cabeza de tokens FAST y experto en acciones con flow matching) y usa EMA con decaimiento 0,99. El repositorio ocupa 12,5 GB e incluye pesos en formato orbax, estadísticas de normalización y la tabla de descripciones de robots, pero no el estado del optimizador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en `pi0.5` (openpi, JAX): columna vertebral visión-lenguaje más experto en acciones con flow matching y cabeza de tokens FAST; acondicionamiento adicional por descripción de robot (URMA) |
| Parametros totales | no disponible (no se declara en la model card; el modelo se inicializa desde `pi05_base` con fine-tuning completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos orbax; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | orbax (JAX), directorio `params/`; estadísticas de normalización en `assets/`; tabla de robots en `oer10_urma_v1/robot_descriptions_v1.npz` |
| Tarea | pick-and-place (manipulación) |
| Horizonte de accion | 16 pasos |
| Modalidades de entrada | observación visual, instrucción en lenguaje natural, estado propioceptivo y tabla de descripción de robot (hasta 8 articulaciones x 27 valores) |
| Inicializacion | `pi05_base`, fine-tuning completo; capas URMA inicializadas desde cero con capa de salida a cero |
| Actualizaciones del optimizador | 10.000 (checkpoint 9999 de una tirada planificada hasta 100.000) |
| Tamano del repositorio | 12,5 GB |
| Normalizacion | tabla de cuantiles global única sobre la mezcla de datos, incluida en `assets/` |
| Estado del optimizador | no incluido |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño `pi0.5` de openpi: un modelo visión-lenguaje que procesa la instrucción y la imagen, acoplado a un experto en acciones que genera trayectorias mediante flow matching, más una cabeza de predicción de tokens FAST. El entrenamiento usa un objetivo dual con aislamiento de conocimiento (knowledge insulation), de modo que la cabeza de tokens y el experto en acciones se entrenan de forma separada para evitar interferencias. Sobre esta base, el autor añade URMA: una red pequeña que codifica una tabla por robot de hasta 8 articulaciones x 27 números por articulación (límites, anchura del gripper y otros parámetros) y cuya salida condiciona al experto en acciones. La fila correspondiente a cada ejemplo se localiza mediante una huella de la cadena `embodiment_params` del episodio, y la tabla completa de robots de entrenamiento está en `oer10_urma_v1/robot_descriptions_v1.npz`.

La mezcla de datos, en porcentaje de episodios, es: DROID 60,1%, MolmoBot 15,4%, simulación de rig real (realrig9k) 7,4% y simulación multirobot OER-10 17,2%. La receta emplea 1.000 pasos de warmup, learning rate plano de 5e-5, EMA de 0,99, horizonte de acción de 16 y 4 GPU H200 con FSDP de grado 4. El batch es de 512 (256 x 2 con acumulación) hasta el paso 6.000 y de 256 a partir de ahí, aunque el nombre de la configuración siga indicando `b512`. Se publican los pesos EMA (decaimiento 0,99). La configuración exacta es `pi05_oer10mix_globalnorm_fullft_ki_b512_lr5e5_h16_wu1k_ema99_droidft_urma`, rama `pi05-oer10-urma`, commit 37764198. No se documentan en la información disponible ni el volumen total de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones de manipulación para tareas de pick-and-place a partir de observación visual e instrucción en lenguaje natural.
- Condicionamiento por embodiment: la misma política puede controlar robots distintos si se le proporciona la fila correspondiente de la tabla de descripciones (hasta 8 articulaciones x 27 valores).
- Generalización entre dominios de datos: entrenada con una mezcla de datos reales de gran escala (DROID, MolmoBot), simulación de rig real y simulación multirobot.
- Predicción de acciones en bloques de 16 pasos (action chunking).
- Cabeza de tokens FAST para predicción discreta, entrenada de forma aislada respecto al experto en acciones.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni un modo de razonamiento explícito (thinking).
- Cobertura idiomática: no disponible; no se declara lista de idiomas a pesar de que el modelo herede la torre visión-lenguaje de `pi05_base`.

## Casos de uso

- Pick-and-place en célula de fabricación: la política recibe la imagen de la escena y la instrucción de la pieza a mover, y emite bloques de 16 acciones para el brazo; el horizonte corto encaja con bucles de control que replanifican con frecuencia.
- Fine-tuning para una plataforma robótica propia: al estar el condicionamiento por embodiment separado en la red URMA, se puede añadir la descripción del robot nuevo a la tabla y reentrenar solo esa vía antes de un ajuste completo.
- Investigación en políticas multirobot: la mezcla OER-10 (17,2% de episodios) y la tabla `robot_descriptions_v1.npz` permiten reproducir experimentos de transferencia entre cuerpos con una única política.
- Preentrenamiento intermedio para tareas de manipulación más complejas: el checkpoint a 10.000 pasos sirve como inicialización para un fine-tuning posterior sobre un dominio concreto con menos datos.
- Generación de datos sintéticos en simulación: al haber sido entrenada con simulación de rig real y OER-10, puede usarse para etiquetar rollouts o filtrar trayectorias antes de desplegar en hardware.
- Evaluación comparativa de recetas de entrenamiento: la configuración publicada (normalización global, EMA 0,99, LR plano 5e-5, batch 512) permite aislar el efecto de la normalización global frente a normalizaciones por robot en experimentos controlados.
- Docencia y prototipado en robótica VLA: el repositorio incluye pesos, estadísticas y tabla de robots en un único paquete de 12,5 GB, lo que simplifica la reproducción en un laboratorio con GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en tareas, comparaciones con `pi05_base` ni métricas de simulación o de robot real, y el checkpoint corresponde a un 10% del entrenamiento planificado.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio contiene 12,5 GB de pesos, por lo que se puede estimar un mínimo en torno a 14-16 GB en el formato publicado, más el espacio para activaciones y observaciones. Es una estimación derivada del tamaño del repositorio, no un dato documentado.
- GPU recomendadas: el entrenamiento se realizó con 4 x H200 con FSDP de grado 4; para inferencia se requiere una GPU con suficiente memoria para cargar el checkpoint completo (A100 40/80 GB, H100, H200).
- GPU de consumo: no hay confirmación de que quepa en una RTX 4090 (24 GB); por tamaño de pesos podría ser viable, pero no se documenta ninguna ejecución de ese tipo ni una ruta de cuantización.
- Opciones de despliegue: el ecosistema previsto es openpi con JAX (carga de orbax). No se documentan exportaciones a vLLM, TGI, llama.cpp, Ollama ni GGUF, y al tratarse de una política VLA con experto en acciones esas rutas no son directamente aplicables.
- Latencia y throughput: no disponibles. El horizonte de 16 acciones condiciona la frecuencia de replanificación, pero no se publican medidas de tiempo por bloque.

## Comparativa con modelos similares

Los datos de las alternativas provienen de documentación pública general y no se han verificado en la información proporcionada; se marcan como no disponibles los campos que no constan.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`pi05-oer10mix-...-urma-10k`) | no disponible | no disponible | pick-and-place multirobot | no disponible | pesos orbax en HuggingFace, 0 descargas |
| `pi05_base` (openpi) | no disponible en esta ficha | no disponible | política VLA generalista | según openpi (consultar) | pública en el ecosistema openpi |
| OpenVLA | 7B | no disponible | manipulación VLA | abierta (consultar) | pesos públicos |
| RDT-1B | aproximadamente 1B | no disponible | manipulación bimanual | abierta (consultar) | pesos públicos |
| NVIDIA GR00T N1 | variantes de 2-3B | no disponible | manipulación humanoide | abierta (consultar) | pesos públicos |

La diferencia relevante frente a esas alternativas no es de tamaño, sino de enfoque: este checkpoint incorpora condicionamiento explícito por descripción de robot, algo que las comparativas anteriores no declaran en la información disponible. Al no haber benchmarks publicados, no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Es un bloqueo objetivo para cualquier despliegue en producción.
- Checkpoint intermedio: 10.000 de 100.000 pasos planificados, por lo que el rendimiento está por debajo del objetivo de la tirada y no representa el resultado final de la receta.
- Ausencia total de benchmarks: no hay tasas de éxito ni métricas de simulación o hardware que permitan validar la política antes de integrarla.
- Tarea restringida: la model card declara únicamente pick-and-place; no hay evidencia de generalización a otras habilidades de manipulación.
- Dependencia de la tabla de descripciones: si la cadena `embodiment_params` de un episodio no coincide con la huella esperada, no se puede recuperar la fila del robot y el condicionamiento falla; además, la tabla cubre solo hasta 8 articulaciones.
- Normalización acoplada a la mezcla: la tabla de cuantiles global se calculó sobre esta mezcla concreta; usarla con datos de otro dominio puede degradar las acciones.
- Repositorio sin estado del optimizador: no se puede reanudar el entrenamiento exactamente donde se dejó, solo hacer fine-tuning desde los pesos EMA.
- Riesgo de alucinación en sentido laxo: la torre visión-lenguaje puede interpretar de forma incorrecta instrucciones ambiguas o escenas fuera de distribución (iluminación, oclusiones, objetos no vistos), lo que se traduce en trayectorias erróneas sin señal de incertidumbre explícita.
- Sesgos: no documentados; al entrenar mayoritariamente con DROID (60,1%), la política puede estar desequilibrada hacia las características de ese conjunto (escenas de oficina y cocina, un tipo de gripper).
- Idiomas: no se declara cobertura; no se debe asumir buen comportamiento en castellano ni en ninguna lengua distinta de la usada en los datos de entrenamiento.
- Formato poco portable: pesos orbax y dependencia de JAX/openpi; no hay rutas documentadas a runtimes de inferencia convencionales.

## Enlaces

- HuggingFace: https://huggingface.co/shrg7/pi05-oer10mix-globalnorm-fullft-ki-b512-lr5e5-h16-wu1k-ema99-droidft-urma-10k
- Repositorio openpi (referencia del ecosistema, rama `pi05-oer10-urma`, commit 37764198): https://github.com/Physical-Intelligence/openpi
- Paper de `pi0.5` / openpi: no disponible en la información proporcionada.
- Blog o demo del autor: no disponible en la información proporcionada.
