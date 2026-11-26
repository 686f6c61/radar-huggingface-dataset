# eckartal/asimov-flex

## Resumen

Asimov Flex es una política de control robótico (no un modelo de lenguaje) desarrollada por el usuario eckartal y publicada en Hugging Face bajo el identificador `eckartal/asimov-flex`. Concretamente, esta versión corresponde a "Asimov Flex: base walk v0.10", una política de locomoción comandada por velocidad para el robot humanoide Asimov 1, entrenada mediante aprendizaje por refuerzo (PPO) en el simulador Isaac Lab. El modelo produce consignas de posición articular a 50 Hz para que el robot camine hacia delante, hacia atrás y de lado, gire sobre sí mismo o mientras camina, y permanezca de pie.

La relevancia de esta versión radica en la mejora del seguimiento de la tasa de giro comandada: mientras que v0.9 alcanzaba aproximadamente el 76 % de la velocidad angular solicitada durante la marcha, v0.10 llega a cerca del 86 %, gracias a una recompensa específica añadida al entrenamiento. Se mantiene como una "base walk" sobre la que construir habilidades posteriores, con la misma interfaz de entradas y salidas que v0.8 y v0.9.

La política se distribuye como un archivo ONNX (`policy.onnx`) listo para inferencia, junto con los ficheros de configuración del entrenamiento (`agent.yaml`, `env.yaml`). Es importante señalar que solo se ha probado en simulación (Isaac Lab y MuJoCo con el modelo público de Asimov 1) y no en el robot físico. El repositorio ocupa 0,1 GB y la licencia es BSD-3-Clause.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control entrenada con PPO (actor-critic con AMP) en Isaac Lab; se exporta como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (exportación ONNX estándar; sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (control robótico; sin interfaz de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`policy.onnx`) para inferencia; YAML (`agent.yaml`, `env.yaml`) para configuración |

Otros datos técnicos relevantes: frecuencia de control de 50 Hz, 80 entradas (78 estándar de Asimov 1 más un reloj de marcha de 2 valores), 23 salidas de offset de posición articular con escala `target = default_pose + 0.25 * action`, y periodo del reloj de marcha entre 0,7 s y 0,8 s según la velocidad comandada.

## Arquitectura y entrenamiento

La política es una red neuronal entrenada con Proximal Policy Optimization (PPO) en el entorno Isaac Lab, con un esquema actor-critic y configuración AMP (Adversarial Motion Priors) registrada en `agent.yaml`. La versión v0.10 parte de v0.9 y la continúa entrenando con la misma actuación del robot en simulación: tobillo, filtro de acción y límites articulares, límites de par motor que incluyen los pares nominales, pies con forma de suela, masa extra en el torso y un bucle de control ocasionalmente más lento. La innovación principal es una recompensa por seguir la tasa de giro comandada, que eleva el cumplimiento del 76 % al 86 % durante la marcha. Además, el entrenamiento mantiene la política cerca de las acciones de v0.9, por lo que la mayoría de resultados restantes se mantienen similares.

Los detalles de la actuación del robot en `env.yaml` están parcialmente marcados como "withheld" (retenidos) por el autor. Se intentó también un entrenamiento adicional en escaleras de 10-12 cm con pares nominales en dos ejecuciones, pero no mejoró el rendimiento en escaleras de 10 cm y no forma parte de esta versión. Las entradas, salidas, reloj de marcha y temporización son idénticos a v0.8 y v0.9. La política requiere un firmware que envíe el reloj de marcha de 2 valores; un firmware que solo envíe las 78 entradas estándar no puede ejecutarla.

## Capacidades

- Locomoción comandada por velocidad: marcha hacia delante, hacia atrás y de lado, con seguimiento de velocidad lineal y angular.
- Giro sobre el propio eje y giro durante la marcha, con cumplimiento del 86 % de la tasa de giro comandada (frente al 76 % de v0.9).
- Permanencia de pie cuando la suma de velocidades lineal y angular es menor o igual a 0,1 (el reloj de marcha emite `(0, 0)`).
- Control a 50 Hz con 23 salidas de posición articular (offsets sobre la pose por defecto con escala 0,25).
- Gestión del reloj de marcha basado en tiempo medido real, con periodo adaptativo (0,8 s hasta 0,2 m/s, 0,7 s a partir de 0,8 m/s, interpolación lineal entre medias).
- Robustez ante empujes de aproximadamente 10 y 20 N·s en cuatro direcciones, tanto de pie como caminando.
- Subida de escaleras de 6, 8 y 10 cm (con y sin límites de motor), con tasas de caída documentadas.
- No incluye tool calling, agentes, capacidades multilingües, visión, audio ni modo de razonamiento: es una política de control motor.

## Casos de uso

- Locomoción base para el robot Asimov 1 en laboratorio: sirve como capa de marcha sobre la que entrenar o componer habilidades superiores (manipulación, navegación), ya que está concebida explícitamente como "base walk".
- Teleoperación con comandos de velocidad: un operador envía consignas de velocidad lineal y angular a 50 Hz y la política genera las posiciones articulares, adecuada por su seguimiento del 86 % en giro y 0,44/0,73 m/s en avance a comandos de 0,5/0,8 m/s con límites de motor.
- Validación en simulación antes de despliegue físico: al probarse en Isaac Lab y MuJoCo con el modelo público de Asimov 1, permite evaluar políticas y ajustar firmware sin riesgo para el robot real.
- Investigación en aprendizaje por refuerzo para robótica: el par `agent.yaml`/`env.yaml` y el código en `menloresearch/isaac_asimov` permiten reproducir y extender el entrenamiento PPO con AMP.
- Pruebas de robustez ante perturbaciones: los resultados de empujes de 10 y 20 N·s y de empuje en el pecho de 215 N permiten caracterizar el comportamiento ante contactos en escenarios de interacción.
- Navegación en entornos con escalones moderados: con límites de motor, la tasa de caída en escaleras de 6 y 8 cm es del 1,2 % y 2,3 % respectivamente, lo que la hace viable para terrenos con peldaños bajos.
- Integración en pipelines de inferencia ONNX: al exportarse como `policy.onnx`, puede ejecutarse en runtimes ONNX estándar dentro del bucle de control del robot a 50 Hz.

## Benchmarks y rendimiento

Resultados en simulación MuJoCo con el modelo público de Asimov 1, a 50 Hz y 35 ms de retardo de comando, con tobillo, filtro de acción y límites articulares del robot en el bucle. "Con límites de motor" significa pares nominales en las piernas y 12 N·m por motor de tobillo; "sin límites" usa pares de pico. Los corchetes indican el rango del 95 % para la tasa de caída.

| Prueba (MuJoCo, actuación del robot) | v0.10 | v0.9 | v0.8 |
|---|---|---|---|
| Tasa de giro caminando (0,5 m/s, 0,5 rad/s), porcentaje del comando (64 intentos) | 86 % | 76 % | 79 % |
| Velocidad lateral (0,2 m/s, ambas direcciones), porcentaje del comando (128 intentos) | 81 % | 78 % | 79 % |
| Escaleras 6 / 8 / 10 cm, con límites de motor (256 intentos cada una) | 1,2 % / 2,3 % / 57,4 % caídas | 1,2 % / 2,3 % / 58,6 % | 2,7 % / 13,3 % / 60,5 % |
| Escaleras 8 cm, con límites de motor, más dos lotes fijos (344 intentos) | 2,0 % caídas (1,0-4,1 %) | 2,9 % | 12,5 % |
| Escaleras 6 / 8 / 10 cm, sin límites de motor (256 intentos cada una) | 0 % / 1,6 % / 6,2 % caídas | 0 % / 0,8 % / 2,7 % | 0 % / 1,6 % / 4,7 % |
| Empujes de ~10 y 20 N·s, de pie y caminando, 4 direcciones, con/sin límites (512 intentos cada uno) | 2 / 1 caídas | 3 / 0 | 3 / 1 |
| Empuje en el pecho de 215 N de pie, por detrás / por delante, con límites (128 intentos) | 28 % / 100 % caídas | 22 % / 100 % | 35 % / 100 % |
| Empuje en el pecho de 215 N de pie, por detrás / por delante, sin límites (128 intentos) | 10 % / 38 % caídas | 12 % / 38 % | 16 % / 34 % |
| Velocidad de avance a comando de 0,5 / 0,8 m/s, con límites de motor | 0,44 / 0,73 m/s | 0,44 / 0,73 m/s | 0,41 / 0,70 m/s |
| Caídas en terreno plano, todas las pruebas de marcha | 0 % | 0 % | 0 % |

Conjunto de pruebas estándar del proyecto (Isaac Lab y MuJoCo con modelo de tobillo simple; sin tobillo del robot, filtro de acción ni límites articulares; una ejecución por fila, 64-576 intentos por fila):

| Prueba (conjunto estándar) | v0.10 | v0.9 | v0.8 |
|---|---|---|---|
| Giro sobre el sitio, déficit frente al comando (Isaac) | 2,1 % | 23,3 % | 25,9 % |
| Seguimiento de velocidad lateral (Isaac / MuJoCo) | 67,2 % / 79,7 % | 78,4 % / 78,9 % | 76,2 % / 77,9 % |
| Jitter articular, menor es más suave (Isaac) | 0,099 | 0,096 | 0,093 |

La información disponible se interrumpe en la fila de velocidad de avance del conjunto estándar ("Forwar"), por lo que no se dispone del resto de esa tabla. No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) porque no aplican a esta política de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,1 GB y el modelo se exporta como ONNX, por lo que la huella es reducida.
- GPU recomendadas: no disponibles; al ser una política de control a 50 Hz, puede ejecutarse en CPU o en GPU de gama baja dentro del bucle de control, aunque el autor no especifica hardware.
- Compatibilidad con GPU de consumo: no disponible; no se documenta.
- Opciones de despliegue: runtime ONNX estándar para `policy.onnx`; el entrenamiento y la evaluación usan Isaac Lab y MuJoCo con el código de `menloresearch/isaac_asimov`. Requiere firmware que envíe el reloj de marcha de 2 valores.
- Latencia y throughput: control a 50 Hz (paso de 0,02 s); el autor advierte de usar el tiempo medido real en lugar de 0,02 s fijos si el bucle va más lento. No se documentan latencias de inferencia adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Tasa de giro caminando | Escaleras 8 cm (con límites) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Asimov Flex v0.10 | Política de marcha PPO (ONNX) | 80 / 23 | 86 % | 2,3 % caídas | BSD-3-Clause | Hugging Face |
| Asimov Flex v0.9 | Política de marcha PPO (ONNX) | 80 / 23 | 76 % | 2,3 % caídas | BSD-3-Clause | Hugging Face |
| Asimov Flex v0.8 | Política de marcha PPO (ONNX) | 80 / 23 | 79 % | 13,3 % caídas | BSD-3-Clause | Hugging Face |

No se dispone en la información proporcionada de otras políticas de locomoción comparables de terceros (parámetros, contexto, rendimiento, licencia) para contrastar.

## Limitaciones y advertencias

- Solo se ha probado en simulación (Isaac Lab y MuJoCo con el modelo público de Asimov 1); no se ha ejecutado en el robot físico.
- Requiere firmware que envíe el reloj de marcha de 2 valores (80 entradas); un firmware que solo envíe las 78 entradas estándar no puede ejecutarla.
- El tobillo roll usa la misma escala de acción de 0,25 que el resto de articulaciones; un robot que escale el tobillo roll de forma distinta necesita reexportar la política para esa escala.
- Rendimiento pobre en escaleras de 10 cm con límites de motor (57,4 % de caídas), por lo que no es adecuada para peldaños altos en condiciones nominales.
- Alta tasa de caída ante empuje frontal de 215 N de pie con límites de motor (100 %), lo que limita su uso en escenarios con empujes frontales fuertes.
- Jitter articular ligeramente superior a versiones anteriores (0,099 frente a 0,096 y 0,093), lo que puede afectar a la suavidad del movimiento.
- Algunos detalles de actuación del robot en `env.yaml` están marcados como "withheld", lo que dificulta la reproducción exacta del entorno de entrenamiento.
- No se documentan sesgos, alucinaciones ni restricciones idiomáticas porque no es un modelo de lenguaje; las advertencias aplicables son de control motor y despliegue.
- Licencia BSD-3-Clause: permite uso comercial con atribución y sin garantía; conviene revisar los términos exactos antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/eckartal/asimov-flex
- Código de entrenamiento y evaluación: https://github.com/menloresearch/isaac_asimov
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
