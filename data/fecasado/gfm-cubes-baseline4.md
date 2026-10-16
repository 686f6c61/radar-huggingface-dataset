# fecasado/gfm-cubes-baseline4

## Resumen

`fecasado/gfm-cubes-baseline4` es una política de control robótico entrenada con LeRobot, la librería de aprendizaje por imitación de Hugging Face. El nombre del modelo interno es `gaze_flow_matching` (`gfm`), lo que indica que se trata de una política basada en flow matching con algún componente de atención visual o *gaze*. Está pensada para resolver una tarea de manipulación concreta: transportar cubos a cestas, según el dataset de entrenamiento `fecasado/Ncubes-to-Nbaskets-320x240`.

El modelo tiene 75.216.858 parámetros (unos 75,2 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,3 GB. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que mapea observaciones visuales y de estado del robot a acciones motrices. Por eso no tiene ventana de contexto en el sentido habitual ni soporte multilingüe.

Su relevancia es acotada y experimental. Se publica como un *baseline* (el propio identificador incluye `baseline4`) y, en el momento de redactar esta ficha, acumula 0 descargas y 0 *likes*, sin resultados de benchmarks ni documentación técnica más allá de la plantilla estándar de LeRobot. Resulta útil como punto de partida reproducible para quien investigue políticas de flow matching aplicadas a manipulación con el robot SO-100, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de imitación `gaze_flow_matching`; la topología concreta no se documenta en la model card) |
| Parametros totales | 75.216.858 (~75,2 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones por paso de control) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La model card únicamente declara `model_name: gaze_flow_matching` y la etiqueta `gaze_flow_matching`, junto con la indicación de que la política se ha entrenado y subido al Hub con LeRobot. No se especifica ni la topología del codificador visual, ni el número de capas, ni el tamaño de las capas ocultas, ni si se emplea un transformer o una U-Net como red de denoising. Por el nombre cabe inferir un esquema de *flow matching* (familia emparentada con las políticas de difusión) condicionado por información de *gaze*, pero se trata de una inferencia a partir del identificador, no de un dato confirmado en la documentación.

Respecto a los datos, el entrenamiento se apoya en el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que da nombre a la tarea: mover cubos a cestas con observaciones de 320x240 píxeles. No se publica el número de episodios, la composición del dataset, el número de pasos de entrenamiento, la presencia de fases de RLHF o DPO (poco habituales en robótica de imitación) ni ninguna innovación técnica adicional. La plantilla de la model card conserva incluso el marcador `_Model type not recognized — please update this template._`, señal de que no se ha completado la descripción.

## Capacidades

- Generación de acciones de control robótico a partir de observaciones visuales y del estado del robot, mediante aprendizaje por imitación.
- Ejecución de una tarea de manipulación concreta: recogida de cubos y depósito en cestas (*pick-and-place*).
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios (`lerobot-train`, `lerobot-record`).
- Integración con el robot `so100_follower` en los comandos de evaluación documentados.
- Funcionamiento sobre imágenes de 320x240 píxeles, según el dataset asociado.
- Sin soporte de *tool calling*, *function calling* ni razonamiento multi-paso en lenguaje natural.
- Sin capacidades multilingües, de audio ni de generación de texto.
- Sin modo de razonamiento explícito (*thinking mode*) documentado.
- Sin modo de *gaze* con comportamiento descrito públicamente más allá del nombre del modelo.

## Casos de uso

- **Automatización de *pick-and-place* en banco de pruebas**: la política está entrenada específicamente para trasladar cubos a cestas, de modo que puede desplegarse directamente sobre un SO-100 para reproducir esa tarea en un entorno controlado.
- **Punto de partida para *fine-tuning* en tareas de clasificación de objetos**: al ser un *baseline* de 75,2 M de parámetros, sirve como inicialización ligera para reentrenar con un dataset propio de recogida y agrupación de piezas.
- **Evaluación comparativa de políticas de imitación**: su condición de *baseline* permite medir si variantes de flow matching, difusión o ACT mejoran la tasa de éxito en la misma tarea y con el mismo dataset.
- **Investigación en flow matching aplicado al control motor**: permite estudiar cómo se comporta este paradigma generativo en espacios de acción de baja dimensión y con observaciones visuales de baja resolución.
- **Reproducción de experimentos de aprendizaje por imitación**: los comandos de entrenamiento e inferencia de LeRobot hacen viable replicar el flujo completo desde cero con `lerobot-train` y `lerobot-record`.
- **Docencia y prácticas de robótica**: su tamaño reducido y su licencia permisiva lo hacen apto para laboratorios universitarios donde se enseñe teleoperación y políticas de imitación.
- **Recogida de trayectorias para aumento de datos**: desplegado en modo evaluación, puede generar episodios adicionales que alimenten datasets posteriores.
- **Prototipado en hardware de gama de consumo**: al ocupar menos de 1 GB en precisión reducida, puede ejecutarse en una estación de trabajo con GPU modesta sin necesidad de clúster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria, comparaciones con otras políticas ni curvas de entrenamiento.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en Ncubes-to-Nbaskets | no disponible |
| Metrica de error de accion | no disponible |
| Comparacion con otros baselines | no disponible |

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 75,2 M de parámetros, los pesos ocupan aproximadamente 300 MB en fp32 y unos 150 MB en fp16/bf16. Sumando activaciones, codificador visual y *buffers*, un despliegue típico debería mantenerse por debajo de 1-2 GB de VRAM. Cifra estimada a partir del recuento de parámetros, no publicada por el autor.
- **GPU recomendadas**: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior resulta holgada. Una RTX 4090, A100 o H100 ejecutarían el modelo con enorme margen, útiles solo si se paralelizan muchas evaluaciones.
- **¿Cabe en GPU de consumo?**: sí, en prácticamente cualquier GPU de consumo moderna, e incluso es viable la inferencia en CPU dado el tamaño del modelo.
- **Opciones de despliegue**: entrenamiento e inferencia mediante LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch; exportación a TorchScript u ONNX no documentada pero plausible. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. En políticas de flow matching la latencia depende del número de pasos de integración, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de politica | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| fecasado/gfm-cubes-baseline4 | 75,2 M | gaze flow matching | Apache 2.0 | Hugging Face, 0 descargas | no disponible |
| ACT (Action Chunking Transformer) | no disponible | transformer con *action chunking* | Apache 2.0 (LeRobot) | implementado en LeRobot | no disponible |
| Diffusion Policy | no disponible | difusion para control | Apache 2.0 (LeRobot) | implementado en LeRobot | no disponible |
| SmolVLA | no disponible | VLA ligero | no disponible | Hugging Face / LeRobot | no disponible |

La comparación cuantitativa no es posible: no hay métricas publicadas para `gfm-cubes-baseline4` ni cifras homogéneas de parámetros o tasas de éxito para las alternativas dentro de esta ficha. La única diferencia verificable es la licencia Apache 2.0 y el tamaño de 75,2 M de parámetros.

## Limitaciones y advertencias

- **Ausencia total de documentación técnica**: la model card es la plantilla por defecto de LeRobot, con el aviso `_Model type not recognized — please update this template._`, y no describe arquitectura, datos ni hiperparámetros.
- **Sin validación comunitaria**: 0 descargas y 0 *likes* implican que no hay evidencia externa de que el modelo funcione correctamente.
- **Sobreajuste a un único dominio**: entrenado con el dataset `Ncubes-to-Nbaskets-320x240`, es probable que falle ante objetos, iluminación, disposición de cámara o fondo distintos a los del conjunto de entrenamiento.
- **Dependencia del *embodiment***: los comandos documentados apuntan a un `so100_follower`; su uso con otra cinemática o número de grados de libertad requeriría reentrenamiento.
- **Riesgo de alucinación**: no aplica en el sentido de los modelos de lenguaje, pero sí existe riesgo de acciones incoherentes o inseguras fuera de la distribución de entrenamiento.
- **Idiomas y contexto**: no soporta lenguaje natural ni mantiene contexto conversacional; la descripción de "modelo" puede inducir a error si se busca un LLM.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la licencia, y se indiquen los cambios realizados.
- **Caveat para producción**: antes de cualquier despliegue real deben establecerse límites de parada de emergencia, validación de espacio de trabajo y supervisión humana, dado que no hay métricas publicadas de fiabilidad.
- **Metadatos atípicos**: la fecha de creación registrada (2026-10-16) es posterior a la fecha habitual de consulta, lo que sugiere un posible error de sellado temporal en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-cubes-baseline4
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- No se han encontrado otros enlaces (papers, blogs o demos) en la información disponible.
