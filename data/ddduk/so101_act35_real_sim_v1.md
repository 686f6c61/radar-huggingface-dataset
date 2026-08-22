# ddduk/so101_act35_real_sim_v1

## Resumen

El modelo `ddduk/so101_act35_real_sim_v1` es una política robótica de tipo ACT (Action Chunking with Transformer) desarrollada por el autor ddduk para el brazo robótico SO-101. Está especializada en tareas de pick-and-place (recoger y colocar objetos) y ha sido entrenada combinando demostraciones reales y simulaciones en MuJoCo, con el objetivo de transferir habilidades de simulación a entornos reales (sim-to-real). El modelo predice secuencias de 35 posiciones angulares absolutas (1,17 segundos a 30 Hz) a partir de la entrada de una cámara superior, una cámara de muñeca y el estado de las 6 articulaciones del brazo.

El modelo se basa en la implementación ACT de LeRobot 0.6.1, con un backbone ResNet-18 preentrenado en ImageNet y una variante determinista (sin VAE). Con 34,19 millones de parámetros y un peso total de solo 0,2 GB, es un modelo ligero y desplegable en hardware de consumo. Su relevancia actual reside en la combinación de datos reales y simulados con un controlador asíncrono validado que replanea cada 24 pasos y mezcla acciones superpuestas, lo que mejora la robustez en tareas de manipulación frente a enfoques de clonación de comportamiento puros.

El checkpoint seleccionado (paso 67.000) se eligió tras una evaluación estricta con conjuntos de datos held-out (25 episodios reales y 4 de simulación), mostrando una mejora sobre el baseline de 60k tanto en error de chunk (MAE 3,81° en real y 1,07° en simulación) como en velocidad. La política no es un controlador certificado y requiere medidas de seguridad explícitas, pero los resultados de closed-loop en MuJoCo (8/8 rollouts completados sin underruns) indican una fiabilidad alta dentro del dominio de trabajo definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformer) con backbone ResNet-18 de ImageNet |
| Parametros totales | 34.190.662 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | FP32 (no se mencionan cuantizaciones adicionales) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa la arquitectura ACT (Action Chunking with Transformer) implementada en LeRobot 0.6.1, en su variante determinista (`use_vae=false`). La entrada combina imágenes de una cámara superior y una cámara de muñeca (ambas a 640x480 píxeles) junto con el estado de las 6 articulaciones del SO-101, procesadas a 30 Hz. La salida es una secuencia de 35 acciones absolutas de las articulaciones (un chunk de 1,17 segundos). El backbone de visión es un ResNet-50 preentrenado en ImageNet, mientras que la parte transformer procesa la fusión de las dos modalidades.

El entrenamiento se realizó en dos fases. Primero, el modelo se inicializó desde un checkpoint previo de 60k pasos entrenado con datos reales y simulados. Después, se afinó con una mezcla de demostraciones reales exitosas y demostraciones de experto de MuJoCo que incluyen contacto físico. El conjunto de entrenamiento contiene 192 episodios combinados (122.277 frames), de los cuales 151 episodios (95.275 frames) se usaron para el entrenamiento real; 103 de ellos son demostraciones reales y 48 son copias de episodios de simulación exitosos (12 únicos repetidos 4 veces). Las demostraciones reales fallidas que terminan tras no atrapar el objeto fueron excluidas deliberadamente para evitar que el modelo aprenda a detenerse como resultado válido. El entrenamiento usó FP32, batch de 8, learning rate 1e-5 y weight decay 1e-4. La selección final del checkpoint (paso 67.000) se hizo mediante una validación en conjuntos held-out estrictos y una compuerta de robustez en closed-loop.

## Capacidades

- Generación de trayectorias de pick-and-place: predice secuencias de 35 posiciones angulares para ejecutar tareas de recoger y colocar objetos en un entorno definido.
- Control multimodal: integra simultáneamente visión superior, visión de muñeca y estado de las articulaciones a 30 Hz.
- Transferencia sim-to-real: entrenado con mezcla de datos reales y simulados en MuJoCo, validado en ambos dominios.
- Replanificación asíncrona: el controlador validado replanea cada 24 pasos de control (en lugar de los 8 habituales), mezclando 6 acciones superpuestas y anclando 6 acciones, lo que evita el fallo en la fase de agarre.
- Robustez en closed-loop: los rollouts en MuJoCo completan 1.050 pasos sin underruns ni interrupciones por seguimiento, con distancia final máxima de 8,42 mm.
- Sin capacidades de lenguaje o visión general: el modelo es específico para robótica, no procesa texto ni imágenes generales.

## Casos de uso

- Automatización de pick-and-place en entornos industriales pequeños: el modelo puede controlar un brazo SO-101 para recoger objetos de una superficie y colocarlos en una posición destino, replicando la secuencia aprendida con una precisión de hasta 8,42 mm en simulación.
- Investigación en sim-to-real: sirve como base para estudiar cómo mezclar demostraciones reales y simuladas para mejorar la transferencia de políticas de imitación en robótica, dado que el entrenamiento combinado reduce el MAE en el dominio real.
- Validación de controladores asíncronos: el modelo viene con un controlador de despliegue validado (replanning cada 24 ticks, blend de 6 acciones) que puede ser reutilizado como referencia para otros checkpoints ACT.
- Generación de datos de entrenamiento: el modelo puede usarse en simulación para generar trayectorias de demostración que alimenten otros modelos de clonación de comportamiento, reduciendo el coste de recolección de datos reales.
- Benchmarking de robustez en robótica: el conjunto de evaluación held-out (25 episodios reales y 4 de simulación) permite comparar el rendimiento de diferentes políticas en un entorno estandarizado.
- Investigación sobre el efecto de la frecuencia de replanificación: el estudio de por qué el replanning de 8 ticks falla en el agarre y por qué 24 ticks funciona puede informar diseños de controladores para otras arquitecturas de acción por chunk.

## Benchmarks y rendimiento

Los resultados de evaluación en conjuntos held-out estrictos se presentan en la model card del autor:

| Dominio | Frames | Episodios | Chunk MAE (grados) | Velocity MAE (grados/paso) |
|---|---:|---:|---:|---:|
| Real | 13.322 | 25 | 3,8108736 | 0,3056 |
| MuJoCo | 3.420 | 4 | 1,0715398 | 0,1136 |

El baseline de 60k pasos obtuvo 3,9274 grados en el dominio real y 1,3764 grados en simulación, por lo que el checkpoint de 67k mejora ambas métricas. El candidato de 70k alcanzó un MAE de simulación inferior (0,9438 grados) pero fue descartado por menor repetibilidad en pruebas closed-loop. En los rollouts cerrados de MuJoCo, el modelo completó 8/8 episodios (1.050/1.050 ticks) sin underruns ni aborts, con una distancia máxima al objetivo final de 8,42 mm.

## Requisitos de hardware

- El modelo ocupa 0,2 GB en disco y 34,19 millones de parámetros, lo que lo hace ligero para inferencia.
- VRAM estimada: no disponible, pero al ser un modelo denso de ~34M parámetros y entrada de imagen 640x480, requiere menos de 2 GB de VRAM para inferencia en FP32.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100). El comando de despliegue usa `--device cuda`, por lo que se necesita GPU NVIDIA.
- No cabe en CPU para uso en tiempo real a 30 Hz, aunque se podría intentar con optimización (no especificado).
- Opciones de despliegue: el repositorio incluye un script de despliegue `deployment/rollout_so101_act_async.py` específico para SO-101 con cámaras top/wrist y control de robot. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa sobre modelos equivalentes (otros checkpoints ACT para SO-101 o políticas de pick-and-place similares) en la información proporcionada. El modelo es específico para el brazo SO-101 y el entorno de pick-and-place definido, por lo que no se puede establecer una comparativa con alternativas de la misma categoría sin datos adicionales.

## Limitaciones y advertencias

- No es un controlador certificado: la model card indica explícitamente que no es un controlador de robot certificado ni una promesa de éxito en hardware real.
- Riesgo de lesiones o daños: el movimiento del robot puede dañar personas o equipos; se requiere empezar a baja velocidad, con un botón de emergencia, espacio libre de obstáculos y el brazo alejado de personas.
- El script de despliegue no conecta con el hardware a menos que se suministre `--confirm-move`, lo que es una medida de seguridad adicional.
- El modelo es específico del dominio: está calibrado para la cámara, calibración y espacio de trabajo del SO-101 grabado; no se debe usar en otros entornos sin recalibrar.
- Exclusión de demostraciones fallidas: las demostraciones que fallan en el agarre y luego se detienen fueron excluidas del entrenamiento; el autor recomienda usarlas solo con etiquetas explícitas de fallo/recuperación para evitar que el modelo aprenda a detenerse tras un fallo.
- El controlador estándar de LeRobot no es equivalente: el path `lerobot-rollout --strategy.type=base` no reproduce el comportamiento validado; se debe usar el script del repositorio con la configuración de replanning a 24 ticks.
- Riesgo de alucinación: no aplica (modelo de robótica), pero en el contexto de control hay riesgo de predicciones erróneas en condiciones no vistas.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantía de seguridad ni soporte oficial.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ddduk/so101_act35_real_sim_v1)
- [Repositorio de simulación SO-101 en GitHub (tuul-ai/so101_sim)](https://github.com/tuul-ai/so101_sim)
- [Documentación de NVIDIA sobre entrenamiento sim-to-real para SO-101](https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html)
- [Documentación de LeRobot para SO-101](https://huggingface.co/docs/lerobot/so101)
- [Repositorio SO-ARM100 (TheRobotStudio/SO-ARM100)](https://github.com/TheRobotStudio/SO-ARM100)
