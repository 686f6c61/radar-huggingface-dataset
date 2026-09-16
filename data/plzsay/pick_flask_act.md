# plzsay/pick_flask_act

## Resumen

`plzsay/pick_flask_act` es una política de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705. El modelo ha sido entrenado y subido al Hub con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Su tarea concreta está definida por el dataset `plzsay/pick_flask`, del que toma su nombre: una política para la recogida de un objeto tipo frasco.

A diferencia de un modelo de lenguaje, no se trata de un transformer generativo de texto, sino de una política visomotora que consume observaciones (imágenes de cámara y estado de las articulaciones) y produce secuencias de acciones motoras. ACT predice "trozos" de acciones (*action chunks*) en lugar de un único paso, lo que reduce el error de acumulación y permite frecuencias de control efectivas más altas. El checkpoint tiene 51.668.614 parámetros (~51,7 M) y ocupa 0,2 GB en el repositorio.

El interés de esta ficha es acotado pero relevante: se trata de un ejemplo reproducible y ligero de política ACT entrenada con LeRobot sobre hardware de bajo coste (la documentación asociada referencia el robot `so100_follower`), útil como punto de partida para experimentos de imitación, para *fine-tuning* sobre nuevos datasets y como referencia de la integración entre LeRobot y el Hub. Con 0 descargas y 0 *likes* en el momento de la consulta, es un artefacto de investigación reciente más que un modelo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador CVAE y decodificación de trozos de acción |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje, consume una ventana fija de observaciones (imagen y estado) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible; no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | plzsay/pick_flask |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion (Hub) | 2026-09-15 |
| Ultima actualizacion (Hub) | 2026-09-15 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de tipo VAE condicional con un transformer encoder-decoder. El codificador CVAE procesa la secuencia de acciones de la demostración junto con el estado de observación para producir una variable latente que captura la variabilidad del estilo humano; el decodificador transformer recibe las observaciones actuales y esa latente y predice un trozo de acciones futuro (típicamente decenas de pasos) en lugar de una sola acción. En inferencia, la latente se fija a la media o a cero, y los trozos se recombinan mediante *temporal ensembling* para suavizar la transición entre predicciones consecutivas.

Según la model card, la política se ha entrenado con datos de teleoperación y "a menudo alcanza altas tasas de éxito". El entrenamiento se realizó con LeRobot mediante el comando `lerobot-train` con `--policy.type=act`, apuntando al dataset `plzsay/pick_flask`; la evaluación se realiza con `lerobot-record` sobre un robot `so100_follower`. No se especifican en la información disponible el número de tokens, el número de episodios, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron fases de RLHF o DPO (no aplicables en este paradigma, donde el ajuste es por imitación supervisada).

## Capacidades

- Generación de acciones motoras: predice trozos de acción continua para control de manipuladores robóticos.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Percepción visomotora: consume observaciones de cámara (y estado de articulaciones) para condicionar la acción.
- Tarea específica: recogida de un frasco (*pick flask*), definida por el dataset de entrenamiento.
- Compatibilidad con LeRobot: entrenamiento (`lerobot-train`) e inferencia/evaluación (`lerobot-record`) mediante la CLI de la librería.
- Integración con robots de bajo coste: la documentación de referencia usa el tipo de robot `so100_follower`.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso en lenguaje natural, ni generación de texto, código o matemáticas: no es un modelo de lenguaje.
- No dispone de modo de pensamiento (*thinking mode*), visión generalista, audio ni capacidades multilingües.

## Casos de uso

- Automatización de *pick-and-place* en laboratorio: la política está entrenada específicamente para recoger un frasco; se puede desplegar sobre un brazo SO-100/SO-101 para validar la tarea de forma repetible sin reentrenar.
- Reproducción de experimentos de imitación: sirve como referencia reproducible del flujo completo de LeRobot (dataset en el Hub, entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) para comparar variantes de política.
- *Fine-tuning* sobre nuevas tareas: partiendo de este checkpoint se puede reentrenar con un dataset propio de teleoperación para adaptar la política a otros objetos o posiciones, aprovechando que solo tiene ~51,7 M de parámetros.
- Prototipado en robótica de bajo coste: al ser un modelo pequeño y con licencia Apache 2.0, encaja en plataformas educativas o de *hobby* con GPU de gama media o incluso CPU/MPS.
- Generación de datos de evaluación: ejecutando la política con `--episodes=N` se pueden recoger trayectorias etiquetadas como `eval_*` para analizar tasas de éxito y modos de fallo.
- *Baseline* para comparación de políticas: sirve como punto de referencia ACT frente a alternativas del propio ecosistema LeRobot (por ejemplo, políticas de difusión) en la misma tarea y robot.
- Investigación en *action chunking*: permite estudiar empíricamente el efecto del tamaño de trozo y del *temporal ensembling* sobre la estabilidad del control en una tarea real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito numéricas, número de episodios de evaluación, ni comparaciones cuantitativas con otras políticas para esta tarea concreta.

## Requisitos de hardware

- VRAM estimada para los pesos: ~207 MB en fp32 y ~103 MB en fp16/bf16, dado un total de 51.668.614 parámetros.
- VRAM estimada para inferencia completa: del orden de 2 a 4 GB contando activaciones del transformer, procesamiento de imágenes y lotes pequeños; no hay mediciones publicadas, por lo que es una estimación basada en el tamaño del modelo.
- GPU recomendadas: cualquier GPU consumer NVIDIA con varios GB de VRAM es suficiente (por ejemplo, RTX 3060, RTX 4070, RTX 4090). Aceleradores de gama alta como A100 o H100 no aportan ventaja significativa para un modelo de este tamaño.
- Cabe en GPU consumer: sí, con margen amplio; LeRobot permite seleccionar dispositivo con `--policy.device` (cuda, mps o cpu).
- Opciones de despliegue: la vía oficial es LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluación). No aplican servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El método ACT reduce la frecuencia de inferencia necesaria gracias a la predicción por trozos, pero no se han publicado cifras de latencia o frecuencia de control para este checkpoint.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks para este checkpoint, por lo que la comparación se limita a características estructurales. Alternativas del mismo ecosistema LeRobot:

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plzsay/pick_flask_act (ACT) | 51,7 M | ventana fija de observaciones; trozos de acción | no disponible | apache-2.0 | Hugging Face Hub (0 descargas) |
| Diffusion Policy (LeRobot) | no disponible | ventana fija de observaciones; difusión sobre acciones | no disponible | no disponible | implementada en LeRobot |
| TDMPC / VQ-BeT (LeRobot) | no disponible | ventana fija de observaciones | no disponible | no disponible | implementadas en LeRobot |
| Políticas VLA tipo pi0 / SmolVLA | cientos de millones a miles de millones | instrucciones en lenguaje mas observaciones | no disponible | no disponible | ecosistema LeRobot |

No se conocen cifras comparativas publicadas entre estas políticas para la tarea `pick_flask`, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (recoger un frasco) sobre un dataset concreto; no generaliza a otras tareas sin reentrenamiento o *fine-tuning*.
- Sesgos del dataset: al provenir de teleoperación humana, hereda los sesgos de las demostraciones (posiciones, velocidades, iluminación y disposición de objetos vistas durante la recogida de datos).
- Sensibilidad al entorno: cambios en iluminación, fondo, cámara o posición inicial del objeto pueden degradar la tasa de éxito; no hay datos publicados sobre robustez.
- Riesgo de fallo físico: al controlar hardware real, una política mal ajustada puede provocar colisiones o daños; se recomienda validar con el robot en vacío y con límites de par/velocidad.
- Sin datos de evaluación: no se han publicado tasas de éxito, número de episodios ni condiciones de prueba, por lo que el rendimiento real es desconocido.
- Sin soporte de lenguaje: no procesa instrucciones textuales ni mantiene diálogo; no puede usarse como agente conversacional.
- Contexto no extensible: no dispone de ventana de contexto larga en el sentido de los LLM; la información disponible se limita a la ventana de observación configurada en LeRobot.
- Licencia permisiva: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Metadatos del Hub llamativos: las fechas de creación y actualización (2026-09-15) y el contador de descargas (0) indican que es un artefacto recién publicado y sin adopción verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plzsay/pick_flask_act
- Dataset de entrenamiento: https://huggingface.co/datasets/plzsay/pick_flask
- Articulo ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
