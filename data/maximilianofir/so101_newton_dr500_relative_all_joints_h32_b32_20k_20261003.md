# maximilianofir/so101_newton_dr500_relative_all_joints_h32_b32_20k_20261003

## Resumen

Este repositorio contiene un checkpoint de politica robótica (policy) `maximilianofir/so101_newton_dr500_relative_all_joints_h32_b32_20k_20261003`, un ajuste fino de `nvidia/GR00T-N1.7-3B` realizado con la librería LeRobot. El modelo resuelve una tarea concreta de manipulación: transferir viales a una gradilla con un brazo SO-101 en simulación Newton. Cuenta con 3.144.016.000 parámetros y el repositorio ocupa 12,6 GB.

La particularidad técnica del experimento es el uso de representaciones de acción relativas en las seis articulaciones, incluido el gripper (`use_relative_actions=true`, `relative_exclude_joints=[]`). El conjunto de datos almacena acciones absolutas, pero el procesador de LeRobot resta el estado articular observado durante el entrenamiento y lo vuelve a sumar a las salidas del modelo en inferencia, de modo que el comando final sigue siendo un objetivo articular absoluto tras el mapeo de calibración sim/real del taller.

Es relevante ahora porque aporta un punto de comparación reproducible sobre una cuestión abierta en robótica de imitación: si conviene entrenar con acciones relativas o absolutas. En la evaluación publicada alcanza 80/100 éxitos, frente a 75/100 de un checkpoint absoluto separado, aunque el propio autor advierte de que no se trata de un A/B controlado. El modelo tiene 0 descargas y 0 likes, por lo que carece de validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; política de visión-lenguaje-acción (VLA) derivada de nvidia/GR00T-N1.7-3B, con visión, proyector y cabeza de acción entrenables y backbone de lenguaje congelado |
| Parámetros totales | 3.144.016.000 (dato real de safetensors) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors (12,6 GB, coherente con fp32 a 4 bytes por parámetro) |
| Idiomas soportados | no disponible (el backbone de lenguaje permanece congelado durante el ajuste) |
| Licencia | apache-2.0 (sujeta además a los términos del modelo base) |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Biblioteca | lerobot |
| Dataset de entrenamiento | sreetz-nv/so101_newton_dr500_20260923, revision a08882a61870706727c153beec6ae10ec6747146 |
| Horizonte de acción supervisado | 32 |
| Horizonte de ejecución en evaluación | 16 acciones |
| Frecuencia de control | 30 Hz |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su procedencia: es una política GR00T N1.7 de NVIDIA, de la familia de modelos visión-lenguaje-acción, en la que el ajuste fino mantiene congelado el backbone de lenguaje y entrena únicamente las partes de visión, proyector y acción. El checkpoint se carga con el cargador GR00T de LeRobot y depende de dos ficheros de procesado, `policy_preprocessor.json` y `policy_postprocessor.json`, cuyos ajustes forman parte del propio checkpoint.

El entrenamiento se realizó sobre un único run: semilla 42, batch de 32, horizonte de acción supervisado de 32, 20.000 pasos de optimizador con AdamW, tasa de aprendizaje 1e-4, 500 pasos de warmup y decaimiento coseno, con transformaciones de imagen activadas. El conjunto de datos son 500 episodios guionizados de demostraciones simuladas de vial-a-gradilla (170.306 fotogramas a 30 Hz, equivalentes a unos 94,6 minutos de datos). La innovación destacable es puramente de representación de acción: el procesador relativo se aplica a las seis articulaciones sin exclusiones, incluido el gripper.

Referencias de código citadas en la model card: commit del experimento de acciones relativas `aade7e31f7fa86b439dd4a235be3a57d2663c82e` y corrección del script de evaluación `800158d`.

## Capacidades

- Generación de comandos de control articular para un brazo SO-101 en la tarea de transferencia de viales a gradilla.
- Política de imitación multimodal: consume cámara de muñeca y cámara externa, más el estado articular.
- Control a 30 Hz con ejecución de acciones en trozos (chunks): horizonte supervisado de 32 y horizonte de ejecución de 16 acciones.
- Representación de acción relativa en las seis articulaciones, incluido el gripper, con reconstrucción a objetivo absoluto en la salida.
- Funcionamiento en simulación (Newton), con renderizado sin cabeza mediante OVRtx.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; no aplica en el sentido de un modelo de texto.

## Casos de uso

- Manipulación robótica de precisión en simulación: colocación de viales en gradilla con un SO-101 en el entorno Newton, tarea para la que el checkpoint reporta 80/100 éxitos y que puede servir como política de referencia en ese escenario.
- Estudio comparativo de representaciones de acción: sirve para contrastar acciones relativas frente a absolutas en el mismo entorno de evaluación, siempre que se asuma que la comparación publicada no es un A/B controlado.
- Generación de líneas base reproducibles para investigación en VLA: al fijar semilla, batch, pasos y dataset, permite reproducir y auditar el entrenamiento de una política de 3,14 B de parámetros.
- Evaluación de robustez en entornos con aleatorización de dominio: el dataset de origen (DR500) y las trasformaciones de imagen activadas hacen de este checkpoint un candidato para medir sensibilidad a variaciones visuales.
- Docencia y formación en robótica con LeRobot: carga con el cargador GR00T y permite ilustrar el ciclo completo de dataset, procesadores, entrenamiento y evaluación de una política.
- Prototipado de pipelines sim-a-real: útil como punto de partida para experimentos de transferencia, teniendo en cuenta que la model card indica explícitamente que no se ha probado el paso a robot real.
- Investigación en control con chunking de acciones: el par horizonte 32 / ejecución 16 permite estudiar compromisos entre frecuencia de inferencia y estabilidad del control a 30 Hz.

## Benchmarks y rendimiento

El autor solo publica resultados de evaluación en simulación, no benchmarks de lenguaje ni de razonamiento.

| Evaluación | Resultado |
|---|---|
| Entorno `Newton-So101-Teleop-Vials-To-Rack-Eval-v0`, 100 episodios (semillas 76000-76099) | 80/100 éxitos (80 %) |
| Timeouts | 20 |
| Terminaciones inseguras de gradilla | 0 |
| Checkpoint absoluto de Shane, evaluación Newton actual | 75/100 |
| Checkpoint absoluto de Shane, mapeo histórico del gripper | 88/100 |

Condiciones de evaluación: 100 episodios con disposición izquierda, tope de 30 segundos por episodio, 4 fotogramas de renderizado de reset, cámaras de muñeca y externa, OVRtx sin cabeza, control a 30 Hz y horizonte de ejecución de 16 acciones. El éxito corresponde a la terminación explícita de colocación del entorno. El autor advierte de que estos resultados no prueban comportamiento de retirada o retorno a home, ni la transferencia a robot real, y que la comparación con el checkpoint absoluto no es un A/B controlado porque los pesos proceden de runs distintos y solo se evaluó una semilla de entrenamiento.

## Requisitos de hardware

- VRAM estimada: unos 12,6 GB solo para pesos si se cargan en fp32 (3.144 M × 4 bytes), más activaciones y buffers de imagen. En bf16/fp16 los pesos bajarían a unos 6,3 GB, pero no se publican pesos en esas precisiones.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o similares para despliegue desatendido; RTX 4090 (24 GB) es suficiente en términos de memoria para fp32.
- GPU de consumo: cabe en RTX 4090 y, con menos margen, en tarjetas de 16 GB si se reduce la precisión; no hay confirmación publicada de funcionamiento en GPU de consumo.
- Opciones de despliegue: cargador GR00T de LeRobot, conservando `policy_preprocessor.json` y `policy_postprocessor.json`. Las rutas de vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de generación de texto.
- Latencia y throughput: la evaluación se ejecutó con control a 30 Hz (33 ms por paso de control) y chunks de 16 acciones ejecutadas, pero no se publica latencia por inferencia ni throughput medido.
- Requisitos de entorno: ordenación articular y calibración del SO-101 tal y como las espera el taller; el entorno de evaluación usa OVRtx sin cabeza.

## Comparativa con modelos similares

| Modelo | Parámetros | Base | Representación de acción | Éxito en simulación | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (`so101_newton_dr500_relative_all_joints_h32_b32_20k_20261003`) | 3.144 M | GR00T-N1.7-3B | Relativa en 6 articulaciones (incluido gripper) | 80/100 | apache-2.0 |
| nvidia/GR00T-N1.7-3B (base sin ajustar) | 3.144 M | — | No aplica sin ajuste | No evaluado en la información disponible | no disponible |
| Checkpoint absoluto de Shane (mismo taller) | no disponible | no disponible | Absoluta | 75/100 en la evaluación actual; 88/100 con el mapeo histórico del gripper | no disponible |

No se dispone de otros modelos comparables en la información proporcionada, ni de comparaciones con políticas de otros fabricantes bajo el mismo entorno de evaluación.

## Limitaciones y advertencias

- Alcance muy restringido: una única tarea (viales a gradilla), una única disposición de escena ("left layout") y un único brazo (SO-101). No es un modelo de propósito general.
- Validación exclusivamente en simulación. La model card indica de forma explícita que no se ha probado la transferencia a robot real ni el comportamiento de retirada o retorno a home.
- Un solo run y una sola semilla de entrenamiento (semilla 42), sin intervalos de confianza ni repetibilidad publicada.
- La comparación con el checkpoint absoluto no es un A/B controlado: los pesos provienen de runs separados, por lo que la diferencia de 80/100 frente a 75/100 no puede atribuirse con rigor a la representación de acción.
- 20 de cada 100 episodios terminaron en timeout, lo que sugiere problemas de finalización de la tarea en una quinta parte de los casos.
- El checkpoint depende de los procesadores incluidos. Usar un procesador de acciones absolutas con estos pesos altera el significado de las predicciones, ya que el modelo produce desplazamientos relativos internamente.
- Sensibilidad a la calibración: el comando final es un objetivo articular absoluto tras el mapeo sim/real del taller, por lo que errores de calibración u orden articular distinto degradan el comportamiento.
- Backbone de lenguaje congelado: no cabe esperar adaptación a instrucciones nuevas ni capacidades lingüísticas no presentes en el modelo base.
- Licencia: el checkpoint declara apache-2.0, pero al derivar de `nvidia/GR00T-N1.7-3B` el uso comercial queda sujeto a los términos del modelo base, que no se detallan en la información disponible y conviene verificar antes de un despliegue en producción.
- Sesgos conocidos y riesgo de alucinación: no disponibles. En el caso de políticas de imitación, el riesgo equivalente es la extrapolación fuera de la distribución de demostraciones, no documentada aquí.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maximilianofir/so101_newton_dr500_relative_all_joints_h32_b32_20k_20261003
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/sreetz-nv/so101_newton_dr500_20260923
- Revisión del dataset: a08882a61870706727c153beec6ae10ec6747146
- Commit del experimento de acciones relativas: aade7e31f7fa86b439dd4a235be3a57d2663c82e
- Commit de corrección del script de evaluación: 800158d
- La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo, su autor, GR00T N1.7 o el entorno Newton; los enlaces obtenidos eran irrelevantes y se omiten. No se dispone de paper, blog, repositorio ni demo adicionales.
