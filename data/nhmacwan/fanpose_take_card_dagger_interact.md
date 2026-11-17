# nhmacwan/fanpose_take_card_dagger_interact

## Resumen

`fanpose_take_card_dagger_interact` es una política robótica (no un modelo de lenguaje) entrenada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El autor es `nhmacwan` y el artefacto se publica como un checkpoint de la arquitectura ACT (Action Chunking Transformer), la política por defecto en los flujos de entrenamiento de LeRobot. El modelo resuelve una tarea concreta de manipulación: la interacción de agarre y extracción de una tarjeta con una daga sobre una plataforma FanPose, tal como indica el identificador y el dataset asociado `nhmacwan/lerobot_fanpose_take_card_dagger`.

El checkpoint contiene 90.285.516 parámetros en formato safetensors, con un tamaño de repositorio de 0,4 GB, lo que es coherente con una política ACT de tamaño medio. La licencia es Apache 2.0, lo que permite uso comercial y modificación. No hay información sobre idiomas porque el modelo no procesa lenguaje natural: su entrada son observaciones de cámara y estados de articulaciones, y su salida son acciones motrices.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de investigación con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (la plantilla de LeRobot indica literalmente "Model type not recognized — please update this template"). Debe evaluarse como un ejemplo reproducible de un pipeline de imitación, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de aprendizaje por imitación de LeRobot |
| Parametros totales | 90.285.516 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa, presumiblemente fp32) |
| Idiomas soportados | no disponible (modelo robótico, sin entrada de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer encoder-decoder que predice *chunks* de acciones (secuencias de posiciones articulares futuras) a partir de observaciones visuales y del estado del robot. ACT se caracteriza por usar un cuello de botella latente con una dimensión reducida (típicamente 32) y una pérdida de reconstrucción de las imágenes de entrada, lo que actúa como regularizador y permite entrenar con datasets pequeños de demostraciones humanas. La predicción por chunks reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refuerzo o filtrado de datos. El dataset asociado, `nhmacwan/lerobot_fanpose_take_card_dagger`, sugiere un conjunto de teleoperación sobre el robot SO-100 (el `so100_follower` que aparece en el comando de evaluación de la model card) grabado en el entorno FanPose. El sufijo `dagger` en el nombre del dataset apunta a un posible uso de DAgger (Dataset Aggregation) para iterar la política con correcciones humanas, aunque no hay confirmación explícita en la documentación.

## Capacidades

- Control motor por imitación: genera comandos de articulaciones para el robot seguidor SO-100 a partir de imágenes de cámara y del estado de las articulaciones.
- Predicción de acciones en chunks: emite secuencias de acciones en lugar de pasos individuales, lo que estabiliza la ejecución.
- Ejecución de una tarea específica: agarre y extracción de una tarjeta con una daga en el entorno FanPose.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT sobre el mismo dataset y la misma tarea de manipulación.
- Base para *fine-tuning* con DAgger: el nombre del dataset sugiere que puede usarse como política inicial que se mejora con correcciones humanas en el bucle, un flujo habitual en robótica de manipulación.
- Evaluación de pipelines de LeRobot: permite validar de extremo a extremo el ciclo `lerobot-train` → `lerobot-record` con un robot SO-100 y un dataset propio.
- Docencia y formación en robótica: ejemplo compacto (0,4 GB) de política visomotora entrenada con teleoperación, adecuado para prácticas de laboratorio.
- Pruebas de *sim-to-real* o *real-to-sim*: útil para medir la brecha entre el entorno de grabación (FanPose) y otros entornos físicos con iluminación o cámaras distintas.
- Prototipado de tareas de pick-and-place con objetos delgados: la tarea de extraer una tarjeta con una daga ejercita el control fino de agarre y orientación, transferible a manipulaciones de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de entrenamiento, ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 90,3 M de parámetros; el cuello de botella real es la captura de vídeo y el proceso de control en tiempo real, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior cubre con holgura la inferencia. Para entrenamiento, se recomienda una RTX 4090 o una A100 si el dataset crece.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con al menos 4 GB de VRAM, incluidas GTX 1650 o superiores.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que internamente usa PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. La frecuencia de control vendrá impuesta por la configuración del robot SO-100 y el pipeline de cámaras, no por el coste de cómputo del transformer.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fanpose_take_card_dagger_interact` | 90,3 M | Manipulación FanPose (tarjeta + daga) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia de LeRobot | ~80 M (típico) | Manipulación genérica SO-100 | no aplica | Apache 2.0 | Hugging Face, ampliamente usadas |
| Políticas Diffusion Policy de LeRobot | variable | Manipulación genérica | no aplica | Apache 2.0 | Hugging Face |
| Políticas VQ-BeT de LeRobot | variable | Manipulación genérica | no aplica | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Model card incompleta: la plantilla de LeRobot no se ha rellenado y no hay descripción de la tarea, del dataset ni de las métricas de éxito.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que impide validar la calidad del checkpoint por terceros.
- Especificidad extrema: la política está entrenada para una tarea y un entorno concretos (FanPose, tarjeta, daga, robot SO-100); no generaliza a otras tareas sin reentrenamiento.
- Riesgo de sobreajuste al entorno de grabación: cambios de iluminación, fondo o posición de cámara pueden degradar el rendimiento sin que existan métricas publicadas que lo cuantifiquen.
- Sin información sobre sesgos: no aplica en el sentido de sesgos sociales, pero sí existe el riesgo de que la política reproduzca sesgos de las demostraciones humanas (velocidades, trayectorias, agarres).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- No apta para producción sin evaluación previa: al no haber benchmarks ni episodios de evaluación documentados, su uso en entornos reales requiere una validación propia con `lerobot-record` y un protocolo de seguridad para el robot.

## Enlaces

- Hugging Face: https://huggingface.co/nhmacwan/fanpose_take_card_dagger_interact
- Dataset asociado: https://huggingface.co/datasets/nhmacwan/lerobot_fanpose_take_card_dagger
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
