# fecasado/gact-kitchen-toasts-baseline

# fecasado/gact-kitchen-toasts-baseline

## Resumen

`fecasado/gact-kitchen-toasts-baseline` es una política de control robótico (no un modelo de lenguaje) publicada en Hugging Face dentro del ecosistema LeRobot. El checkpoint resuelve una tarea de manipulación concreta —descrita por el nombre como pasar tostadas a un plato en un entorno de cocina— y se ha entrenado sobre el dataset `fecasado/toasts-to-plate-320x240`, con observaciones de imagen de 320x240 píxeles. Su autor es el usuario `fecasado` y se distribuye con licencia Apache 2.0.

El modelo tiene 51.664.538 parámetros (aproximadamente 51,7 M), un tamaño que corresponde a una política de imitación ligera type "act" (Action Chunking with Transformers) según el comando de entrenamiento de la propia model card, con la etiqueta `gaze_act` como indicativo de una variante con condicionamiento por mirada. El repositorio ocupa 0,2 GB y los pesos están en formato `safetensors`, lo que cuadra con un almacenamiento en precisión de 32 bits de esos 51,7 M de parámetros.

Su relevancia es acotada y de tipo investigación: sirve como *baseline* reproducible para comparar variantes de políticas de imitación sobre el mismo dataset y robot, y como punto de partida para quien trabaje en manipulación con LeRobot. No es un modelo de propósito general: no genera texto, no razona y no tiene capacidades multilingües. La model card es la plantilla genérica de LeRobot sin completar (incluye literalmente el aviso «Model type not recognized — please update this template»), no hay benchmarks publicados y el modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. La model card indica `--policy.type=act` (Action Chunking with Transformers) y la etiqueta del repo es `gaze_act`; no se documenta el módulo de mirada ni la configuración de capas |
| Parametros totales | 51.664.538 (dato real de los safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. La ventana de observación viene dada por el dataset de imágenes 320x240 y por el *action chunking* de ACT, cuya configuración no se documenta |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en `safetensors`; no hay variantes cuantizadas (GGUF, int8, int4) en el repositorio |
| Idiomas soportados | No disponible / no aplica (política robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (librería declarada: `lerobot`) |
| Tarea | Manipulación robótica: pasar tostadas a un plato (*toasts-to-plate*) |
| Dataset de entrenamiento | `fecasado/toasts-to-plate-320x240` |
| Resolucion de observacion | 320x240 (según el nombre del dataset) |
| Fecha de publicacion | 2026-10-28 (creación y última actualización del repositorio) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La información disponible sitúa el modelo dentro de la familia ACT (*Action Chunking with Transformers*), una arquitectura de imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, combinando un codificador visual con un transformer que modela la secuencia de acciones condicionada por las observaciones. La etiqueta `gaze_act` y el prefijo `gact` del nombre sugieren una variante que incorpora información de mirada o atención espacial como señal adicional, pero la model card no describe ni confirma ese componente: no hay detalle de número de capas, dimensión oculta, número de cámaras ni tamaño del chunk de acciones.

Tampoco se documentan los datos de entrenamiento más allá de la referencia al dataset `fecasado/toasts-to-plate-320x240`: se desconoce el número de episodios, el número de frames, la composición de las trayectorias, si hubo aumento de datos o si se aplicó algún tipo de regularización. No hay mención a RLHF, DPO ni a ningún proceso de ajuste posterior; en políticas de imitación como esta lo habitual es entrenamiento supervisado sobre demostraciones, pero ese extremo no se explicita en la información proporcionada. La model card únicamente incluye los comandos genéricos de LeRobot para reentrenar (`lerobot-train`) y evaluar (`lerobot-record` sobre un robot `so100_follower`), que son los de la plantilla estándar y no necesariamente reflejan la configuración exacta usada por el autor.

## Capacidades

- Control robótico por imitación para una tarea de manipulación concreta: recoger tostadas y depositarlas en un plato.
- Procesamiento de observaciones visuales a 320x240 píxeles, según el dataset asociado.
- Predicción de secuencias de acciones (*action chunking*), propia de la arquitectura ACT.
- Posible condicionamiento por mirada (`gaze_act`), no documentado ni verificable con la información disponible.
- Integración nativa con LeRobot: carga mediante `--policy.path` y evaluación con `lerobot-record`.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene modo *thinking*, visión general, audio ni generación de código.

## Casos de uso

- Baseline de referencia para investigación en imitación: sirve para comparar nuevas variantes (por ejemplo, los checkpoints hermanos `gfm-kitchen-toasts-baseline` y `gfm-kitchen-toasts-baseline2`, basados en *flow matching*) sobre el mismo dataset y la misma tarea, aislando el efecto del cambio de arquitectura.
- Reproducción de experimentos: al estar entrenado con LeRobot y publicarse el dataset, permite reentrenar con `lerobot-train` y verificar la curva de aprendizaje frente al checkpoint publicado.
- Evaluación de *sim-to-real* y robustez visual: útil para medir cómo se degrada una política ACT entrenada con imágenes de 320x240 ante cambios de iluminación, fondo o posición de cámara en un entorno de cocina.
- Plataforma docente en robótica de manipulación: un modelo de 51,7 M de parámetros se puede ejecutar en hardware modesto, lo que facilita prácticas de aprendizaje por imitación con robots tipo SO-100/SO-101 en laboratorios y cursos.
- Punto de partida para *fine-tuning* en tareas similares de cocina (coger objetos, colocarlos en un recipiente) reutilizando los pesos como inicialización en lugar de entrenar desde cero.
- Estudio de condicionamiento por mirada: si la variante `gaze_act` realmente incorpora señal de mirada, el checkpoint permite analizar su efecto sobre la precisión de agarre frente a una ACT estándar, aunque el autor no aporta esa comparación.
- Generación de datos de evaluación: usar la política para producir episodios etiquetados (`lerobot-record`) que alimenten posteriores análisis de fallos o *dataset augmentation*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasas de éxito, ni métricas de error de posición, ni comparaciones con otras políticas sobre el dataset `toasts-to-plate-320x240`. Tampoco se aportan curvas de entrenamiento, números de episodios de evaluación ni valores de pérdida. Cualquier cifra de rendimiento debería obtenerse replicando la evaluación con `lerobot-record` sobre el robot y el entorno originales.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parámetros en fp32, los pesos ocupan del orden de 200 MB (coherente con un repositorio de 0,2 GB); sumando activaciones del codificador visual y un lote pequeño, la inferencia debería caber holgadamente en menos de 1-2 GB de VRAM. Es una estimación por tamaño, no un dato publicado.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente. Una RTX 3060, RTX 4060 o superior es más que adecuada; A100/H100 solo tendrían sentido para entrenamiento o para ejecutar muchos entornos en paralelo, no para inferencia de un solo robot.
- Cabe en GPU de consumo: sí, en cualquier modelo con 4 GB o más de VRAM; también es viable ejecutarlo en CPU si la frecuencia de control no es exigente, aunque no se documenta latencia.
- Opciones de despliegue: LeRobot (flujo oficial: `lerobot-record --policy.path=...`), con PyTorch como backend. No se publican artefactos ONNX, TensorRT, GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El diseño de *action chunking* de ACT reduce la frecuencia efectiva de inferencia necesaria al predecir varios pasos por pasada, pero no se aportan mediciones de latencia por chunk ni frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `fecasado/gact-kitchen-toasts-baseline` | 51,7 M | Tostadas al plato, observaciones 320x240, ACT con posible mirada | Apache 2.0 | Hugging Face, 0 descargas |
| `fecasado/gfm-kitchen-toasts-baseline` | No disponible | Misma tarea, variante *gaze flow matching* | No disponible en la información | Hugging Face |
| `fecasado/gfm-kitchen-toasts-baseline2` | No disponible | Misma tarea, segunda variante *gaze flow matching* | No disponible en la información | Hugging Face |
| ACT de referencia (LeRobot) | No disponible | Política de imitación genérica con *action chunking* | No disponible en la información | Repositorio LeRobot |

La comparación cuantitativa no es posible con los datos disponibles: no hay métricas de éxito ni recuentos de parámetros publicados para las alternativas. La comparación relevante es cualitativa: este checkpoint representa la línea base tipo ACT frente a las variantes de *flow matching* del mismo autor, lo que permite aislar el efecto del método de modelado de acciones manteniendo constante el dataset. Frente a políticas de propósito general como SmolVLA o pi0, este modelo no es comparable en tamaño ni en generalidad, y no se dispone de datos de esas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de tarea única: está entrenado para una secuencia concreta de manipulación en cocina; no generaliza a otras tareas sin reentrenamiento o *fine-tuning*.
- Documentación prácticamente inexistente: la model card es la plantilla de LeRobot sin completar, con el aviso «Model type not recognized» y comandos genéricos que pueden no coincidir con la configuración real del autor.
- Sin validación externa: 0 descargas y 0 likes, sin benchmarks ni tasas de éxito publicadas. No hay evidencia independiente de que la política funcione fuera del entorno de captura.
- Sesgos de dataset: al entrenarse con un único dataset de cocina, hereda los sesgos de las demostraciones (posiciones, iluminación, tipos de objeto, punto de vista de cámara). Se desconoce la diversidad de episodios y si hay operadores o entornos distintos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe el equivalente en políticas de imitación, que es la ejecución de acciones plausibles pero incorrectas ante observaciones fuera de distribución, sin señal de incertidumbre ni mecanismo de rechazo.
- Sin límite de contexto en el sentido de LLM, pero sí limitación de horizonte: la política depende del *chunking* y de la memoria visual inmediata; no mantiene estado de largo plazo ni planificación simbólica.
- Idiomas: no aplica; no procesa lenguaje natural, por lo que no puede recibir instrucciones verbales.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero se distribuye sin garantías y el autor no ofrece soporte ni asume responsabilidad por el uso.
- Riesgo de seguridad física: cualquier despliegue en un robot real debe hacerse con límites de par, paradas de emergencia y supervisión, dado que no se documentan comportamientos de fallo ni protocolos de recuperación.
- Fecha de publicación reciente y sin mantenimiento aparente (creado y actualizado con dos segundos de diferencia), lo que sugiere un artefacto subido de forma automática más que un modelo mantenido.
- Los resultados de búsqueda web disponibles no contienen información sobre este modelo: las coincidencias encontradas corresponden al producto «Toast 1» de Mixedbread, sin relación alguna, por lo que no aportan datos técnicos ni contextuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-kitchen-toasts-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/toasts-to-plate-320x240
- Checkpoint hermano (gaze flow matching): https://huggingface.co/fecasado/gfm-kitchen-toasts-baseline
- Checkpoint hermano (gaze flow matching, v2): https://huggingface.co/fecasado/gfm-kitchen-toasts-baseline2
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Perfil del autor: https://huggingface.co/fecasado
