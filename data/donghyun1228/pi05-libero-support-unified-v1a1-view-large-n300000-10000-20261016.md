# Donghyun1228/pi05-libero-support-unified-v1a1-view-large-n300000-10000-20261016

## Resumen

`Donghyun1228/pi05-libero-support-unified-v1a1-view-large-n300000-10000-20261016` es un checkpoint de investigacion derivado del modelo pi0.5 (identificado como `pi05`), una arquitectura vision-language-action (VLA) publicada en el ecosistema openpi. Se trata de una adaptacion especializada para la tarea "support" del benchmark LIBERO, planteada como un modelo de dinamica inversa (inverse dynamics model, IDM): el sistema aprende a inferir las acciones de control que explican una secuencia de observaciones, en lugar de comportarse como una politica generativa pura.

El modelo lo publica el usuario Donghyun1228 y se enmarca en una linea de experimentos de ajuste con el LLM base congelado. Segun la model card, solo nueve hojas del LLM base permanecen congeladas, mientras que se entrenan los modulos de vision (vision23), el experto completo (expert11) y las proyecciones de accion y tiempo (action/time projections8). El entrenamiento parte del checkpoint `Donghyun1228/pi05-libero-support-probe-source-n300000-10000-20261015` y del dataset `Donghyun1228/libero-support-random-waypoint-300k-20261015` (300.000 fotogramas).

Su relevancia es acotada pero concreta dentro de la investigacion en robotica: documenta un protocolo de evaluacion reproducible (1.155 aciertos sobre 2.000 intentos) sobre 40 tareas de LIBERO, con infraestructura de simulacion MuJoCo 3.2.3 y un esquema de servido por cola global para 32 clientes. El repositorio ocupa 7,7 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi0.5 (pi05); LLM base parcialmente congelado con experto de acciones y proyecciones de vision/accion/tiempo entrenables |
| Parametros totales | no disponible (el repositorio ocupa 7,7 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 para inferencia (segun la model card); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura pi0.5 (`pi05`) del ecosistema openpi, una VLA que combina un modelo de vision-lenguaje con un experto de acciones. En esta adaptacion concreta, el ajuste sigue un esquema de "LLM congelado": solo nueve hojas del LLM base permanecen bloqueadas, mientras que se actualizan el modulo de vision (`vision23`), el experto completo (`expert11`) y las proyecciones de accion y tiempo (`action/time projections8`). La formulacion es de dinamica inversa: la perdida IDM se calcula sobre coordenadas objetivo, excluyendo explicitamente la coordenada 6 (correspondiente al gripper) de la perdida objetivo, y promediando las 31 coordenadas restantes con relleno (padding). Se mantienen entradas y salidas de siete dimensiones, incluyendo el control del gripper.

El entrenamiento se reanuda desde la actualizacion 5.000 con los pesos crudos exactos, el optimizador y la EMA, saltando indices del muestreador ya consumidos y continuando el RNG nativo del modelo por paso global. La configuracion es AdamW nativo con multiplicador de actualizacion 1, batch de 32, semilla 42, tasa de aprendizaje 1e-5, 500 pasos de warmup y un total de 10.000 actualizaciones. Los datos provienen del dataset `libero-support-random-waypoint-300k-20261015` (300.000 fotogramas). El checkpoint publicado corresponde al paso 9999 en su version cruda no-EMA.

## Capacidades

- Inferencia de dinamica inversa: estima acciones de control a partir de observaciones, con salidas de siete dimensiones que incluyen el gripper.
- Manipulacion robotica en el entorno de simulacion LIBERO, suite "support".
- Procesamiento conjunto de vision y lenguaje como entrada (arquitectura VLA).
- Entrenamiento parcial con LLM base congelado, lo que permite adaptar los modulos de vision y acciones sin actualizar las nueve hojas base.
- No se documenta soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se documenta soporte multilingue ni capacidades de audio.

## Casos de uso

- Evaluacion de dinamica inversa en robotica: sirve para estudiar en que medida un modelo con el LLM congelado puede reconstruir acciones a partir de observaciones en las 40 tareas de LIBERO support, comparando contra el checkpoint fuente.
- Reproduccion de experimentos academicos: dado que la model card fija semilla (42), pasos, hiperparametros y protocolo de servido, permite replicar el resultado de 1.155 aciertos sobre 2.000 intentos bajo condiciones controladas.
- Investigacion sobre congelado de capas: util para analizar el impacto de entrenar solo vision, experto y proyecciones frente a un ajuste completo del LLM base.
- Desarrollo de controladores de manipulacion en simulacion: el modelo puede integrarse en un bucle de control con MuJoCo 3.2.3 para probar politicas antes de un despliegue fisico.
- Benchmarking de infraestructura de inferencia: el protocolo `batched16_clients32_global_queue_v1` con una cola global y 32 clientes concurrentes sirve como prueba de carga para servidores de modelos roboticos.
- Estudio de reconstruccion de acciones con gripper excluido de la perdida: util para medir como afecta excluir la coordenada 6 del objetivo IDM al comportamiento resultante.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| LIBERO support (40 tareas x 50 intentos, envseed 7) | 1155/2000 (57,75 % de exito) |

La evaluacion se realizo con 32 clientes sobre una unica GPU fisica, con batch de servido 16, protocolo `batched16_clients32_global_queue_v1`, cola global que limita los clientes concurrentes a 32 en cuatro suites con ocho shards cada una, y MuJoCo 3.2.3. La model card indica cero errores de rollout y verificacion de colocacion EGL por PCI/UUID.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio pesa 7,7 GB y la inferencia es en BF16, por lo que los pesos en memoria rondaran ese orden (la cifra exacta depende de que se cargue solo el checkpoint crudo no-EMA o componentes adicionales).
- GPU recomendadas: no disponibles en la model card. Por tamano del repositorio, una GPU con al menos 12-16 GB de VRAM en BF16 seria el minimo razonable; una RTX 4090 o superior seria adecuada.
- Compatibilidad con GPU de consumo: probablemente si en tarjetas con suficiente VRAM (por ejemplo, RTX 4090), aunque no se confirma en la informacion proporcionada.
- Despliegue: libreria `openpi`. La evaluacion uso un servidor con batch 16 y una cola global para 32 clientes. Simulacion con MuJoCo 3.2.3 y colocacion EGL verificada por PCI/UUID.
- Latencia y throughput: no disponibles. Solo se documenta la configuracion de servido (batch 16, 32 clientes, cola global), no medidas de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-support-unified-v1a1 (este) | VLA / IDM ajustado | no disponible (repo 7,7 GB) | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| pi05-libero-support-probe-source (modelo fuente, commit 2e35994) | VLA / IDM base del ajuste | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| pi0.5 / pi0 (openpi) | VLA generalista | no disponible en la informacion | no disponible | no disponible en la informacion | Repositorio openpi |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Especializacion muy estrecha: el modelo esta adaptado a la suite "support" de LIBERO (40 tareas), no es un modelo de proposito general.
- Cero descargas y cero "likes" en el momento de la consulta, por lo que no hay evidencia de uso ni validacion por terceros.
- Formulacion de dinamica inversa: no se comporta como una politica generativa pura y su salida esta ligada a la tarea y al dataset de entrenamiento.
- Excluye la coordenada 6 (gripper) de la perdida objetivo IDM, lo que puede afectar a la calidad de prediccion del control del gripper frente a las demas coordenadas.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera de la distribucion de LIBERO.
- Riesgo de sobreajuste al protocolo de evaluacion (semillas, configuracion de servido y cola global especificas): los resultados pueden no transferirse a otros entornos o configuraciones.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo depende de componentes (pi0.5/openpi y dataset) cuyos terminos no se detallan en la informacion proporcionada.
- La fecha de creacion y actualizacion (2026-10-16) y la nomenclatura del dataset deben verificarse en el repositorio antes de cualquier uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-unified-v1a1-view-large-n300000-10000-20261016
- Modelo fuente: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n300000-10000-20261015
- Dataset de entrenamiento: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-20261015
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
