# dene33/asimov1-forward-jump

## Resumen

Asimov 1 forward jump es una política de seguimiento de movimiento (motion tracking) desarrollada por el usuario dene33 para el robot humanoide Asimov 1. No es un modelo de lenguaje ni un modelo generativo de propósito general: se trata de una red neuronal de control entrenada para que el robot reproduzca, fotograma a fotograma, una única secuencia de referencia de salto hacia delante. El movimiento de origen proviene de la base de datos de captura de movimiento del CMU Graphics Lab (moción 13_11), que fue reorientada al esqueleto de Asimov 1 mediante la herramienta SOMA Retargeter.

La política se entrenó con aprendizaje por refuerzo (PPO) dentro de Isaac Lab, siguiendo el enfoque de seguimiento de movimiento estilo BeyondMimic. El artefacto desplegable es un fichero ONNX que mapea una observación de 124 valores a 23 acciones articulares. Se publica junto al fichero de movimiento de referencia en formato NPZ (50 Hz, 2,74 s) y a los ficheros de configuración de entorno y agente empleados en el entrenamiento.

Es relevante ahora dentro del nicho de la robótica de humanoides porque muestra un flujo completo reproducible: captura de movimiento público, reorientación a un robot concreto, entrenamiento en simulación con RL y exportación a ONNX para inferencia en tiempo real. El autor reporta además validación sim2sim en MuJoCo con condiciones adversas (retardo de motor de 25 ms y fricción de pie reducida). El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (mapea observacion de 124 valores a 23 acciones); arquitectura interna no especificada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el modelo opera sobre un historial de observacion por fotograma (no hay ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se indican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robotico, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`policy.onnx`); checkpoint de entrenamiento `model_3300.pt`; configuracion en YAML; movimiento de referencia en NPZ |
| Entrada / salida | `obs` (1, 124) -> `actions` (1, 23) |
| Frecuencia de control | 50 Hz (periodo de 20 ms por fotograma) |
| Checkpoint | `model_3300.pt` |
| Tamano del repo | 0.0 GB (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna de la red (numero de capas, tipo de capa o dimensiones ocultas), por lo que no es posible describirla con precision. Lo que si se especifica es su interfaz funcional: recibe una observacion de 124 valores y produce 23 acciones articulares, e incorpora internamente la normalizacion de la observacion. La observacion se compone, en este orden, de: posiciones articulares (23) y velocidades articulares (23) del movimiento de referencia en el fotograma `t`; la orientacion de la pelvis del movimiento expresada en el sistema de la pelvis del robot como las dos primeras columnas de la matriz de rotacion, fila a fila (6); la velocidad angular de la pelvis en su propio sistema, procedente de la IMU (3); las posiciones articulares menos la pose por defecto (23) y las velocidades articulares (23); y la accion previa (23), inicializada a ceros.

El entrenamiento se realizo exclusivamente en simulacion, en Isaac Lab, con el algoritmo PPO y un esquema de seguimiento de movimiento estilo BeyondMimic. La tarea y los hiperparametros de PPO (orden de articulaciones, pose por defecto, ganancias PD y limites de esfuerzo de los motores) se publican en `env.yaml` y `agent.yaml`. La politica no genera comandos de par directamente: emite acciones que se convierten en consignas de posicion articular mediante `pose por defecto + 0,25 x accion`, aplicadas a controladores PD. El movimiento de referencia, `cmu_13_11_forward_jump_froude_nolift.npz`, tiene 2,74 s a 50 Hz y contiene `joint_pos`, `joint_vel` en el orden de articulaciones de la politica (`joint_names`), ademas de `body_pos_w` y `body_quat_w` (formato w, x, y, z) con la pose de cada eslabon, siendo el primero la pelvis.

## Capacidades

- Seguimiento de una unica secuencia de movimiento de referencia: hace que Asimov 1 reproduzca fotograma a fotograma el salto hacia delante definido en `cmu_13_11_forward_jump_froude_nolift.npz`.
- Lectura del movimiento de referencia en tiempo de ejecucion: el fichero de movimiento forma parte de la politica, no esta embebido de forma estatica.
- Control articular de 23 grados de libertad mediante consignas de posicion articular (pose por defecto + 0,25 x accion) enviadas a controladores PD.
- Uso de realimentacion propioceptiva: velocidad angular de la pelvis procedente de IMU y estados articulares medidos (posiciones y velocidades).
- Robustez parcial frente a perturbaciones: segun el autor, en Isaac Sim la politica falla en 1 de cada 1024 ejecuciones aleatorizadas (3 de 1024 cuando se anaden empujones aleatorios).
- Ejecucion bajo retardo de motor: reportada como funcional en MuJoCo con 25 ms de retardo de motor y la curva de par mas debil.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, capacidades multilingues ni modos de razonamiento tipo thinking. No es un modelo de texto.

## Casos de uso

- Reproduccion de maniobras dinamicas en humanoides: la politica permite ejecutar un salto hacia delante fisicamente exigente sin disenar manualmente una trayectoria; es adecuada porque ha sido entrenada especificamente para ese movimiento con tiempo fisico real.
- Investigacion en seguimiento de movimiento (motion tracking): sirve como referencia reproducrible de un pipeline BeyondMimic con PPO, ya que se publican la politica, el movimiento de referencia y las configuraciones de entorno y agente.
- Validacion sim2sim: util para comprobar la transferencia de una politica entrenada en Isaac Lab al modelo de Asimov 1 en MuJoCo antes de desplegarla en hardware, incluyendo escenarios adversos de retardo y friccion.
- Pruebas de robustez de controladores: los resultados de ejecuciones aleatorizadas (1/1024 y 3/1024 con empujones) permiten usarla como caso de prueba para estudiar sensibilidad a perturbaciones y a incertidumbre de modelo.
- Benchmark de retargeting: dado que el movimiento proviene del CMU MoCap Database y se reoriento con SOMA Retargeter, el modelo puede emplearse para evaluar la calidad de un proceso de retargeting sobre un humanoide concreto.
- Componente de una politica jerarquica: el propio autor indica que al final del movimiento puede mantenerse la ultima pose o ceder el control a otra politica, lo que permite encadenar esta habilidad con otras (por ejemplo, politicas de velocidad, que si se pueden visualizar con `--view`).
- Despliegue en tiempo real sobre ONNX: al ser un mapeo de 124 a 23 valores, el artefacto ONNX puede integrarse en un bucle de control a 50 Hz en un runtime de inferencia ligero (frecuencia de control definida por el autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje. El autor reporta unicamente metricas de exito de la tarea de seguimiento:

| Escenario | Resultado reportado |
|---|---|
| Isaac Sim, ejecuciones aleatorizadas | Falla en 1 de 1024 |
| Isaac Sim, ejecuciones aleatorizadas con empujones | Falla en 3 de 1024 |
| MuJoCo, modelo Asimov 1 publicado | Completa el salto |
| MuJoCo, con retardo de motor de 25 ms | Completa el salto |
| MuJoCo, con la curva de par de motor mas debil | Completa el salto |
| MuJoCo, con friccion de pie 0.4 | Completa el salto |

No se aportan datos de latencia, throughput, tasa de exito porcentual sobre el total ni metricas de error de seguimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado que la politica mapea 124 entradas a 23 salidas e incorpora una normalizacion, su huella de memoria es reducida, pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponibles. El autor no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: probablemente viable por el tamano reducido de la red y su formato ONNX, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: inferencia a traves del fichero ONNX (`policy.onnx`) integrada en el bucle de control del robot. El autor menciona herramientas del repositorio Cyclotron: `./cyclotron.sh --evaluate` y `--sim2sim` para validacion. No se listan runtimes como vLLM, llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: el autor define un periodo de control de 20 ms (50 Hz), pero no publica latencias medidas ni throughput.
- Requisito de entorno: el modelo esta entrenado solo en simulacion (Isaac Lab) y el autor recomienda validarlo con `--evaluate` y `--sim2sim` antes de ejecutarlo en un robot real.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. No se aportan referencias a otras politicas de motion tracking para Asimov 1 ni a artefactos equivalentes con los que contrastar parametros, contexto, rendimiento o licencia. Por tanto: no disponible.

## Limitaciones y advertencias

- Especializacion extrema: la politica sigue una unica secuencia de movimiento (`cmu_13_11_forward_jump_froude_nolift.npz`) y no generaliza a otros movimientos ni a comandos en tiempo de ejecucion.
- Dependencia del fichero de movimiento: el NPZ de referencia forma parte de la politica; sin el, o con un fichero alterado, el comportamiento no esta definido.
- Entrenamiento solo en simulacion: el autor advierte explicitamente de que se entreno unicamente en Isaac Lab y pide validarla con `--evaluate` y `--sim2sim` antes de usarla en un robot real. Existe riesgo de brecha sim-a-real.
- Tasa de fallo en simulacion: falla en 1 de 1024 ejecuciones aleatorizadas y en 3 de 1024 con empujones, segun los datos del autor.
- Condiciones de ejecucion exigentes: la reproduccion del salto depende de iniciar el robot en la primera pose del movimiento y de respetar el bucle de control a 20 ms con la formula de consigna indicada.
- Sesgos conocidos: no aplica en el sentido de sesgos linguisticos o de contenido; no se documentan sesgos de otro tipo en la informacion disponible.
- Riesgo de alucinacion: no aplica (no es un modelo generativo de texto).
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural ni tiene ventana de contexto textual.
- Restricciones de licencia: la licencia es BSD-3-Clause, permisiva y apta para uso comercial, pero conviene revisar las condiciones de la base de datos de mocap del CMU y del modelo del robot Asimov 1 por separado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso independiente o de validacion por terceros.
- Advertencia de produccion: al no publicarse metricas de robustez mas alla de las indicadas, su uso en hardware real deberia ir precedido de pruebas exhaustivas y de un analisis de seguridad del salto.

## Enlaces

- HuggingFace: https://huggingface.co/dene33/asimov1-forward-jump
- Repositorio de entrenamiento y evaluacion (Cyclotron, rama motion-tracking): https://github.com/Dene33/cyclotron/tree/motion-tracking
- SOMA Retargeter: https://github.com/Dene33/soma-retargeter
- CMU Graphics Lab Motion Capture Database: http://mocap.cs.cmu.edu
