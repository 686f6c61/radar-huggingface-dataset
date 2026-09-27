# drashutoshspace/moonbot_smolvla_no_tf

## Resumen

`moonbot_smolvla_no_tf` es un ajuste fino completo del modelo base `lerobot/smolvla_base` (SmolVLA), la familia de modelos visión-lenguaje-acción (VLA) ligeros publicada por Hugging Face para robótica. El modelo ha sido entrenado por el usuario `drashutoshspace` sobre el conjunto de datos `gdiazsrl/lerobot_sep23_no_tf` para una tarea concreta de manipulación con tres bloques apilados, usando tres cámaras y sin señal de fuerza/par (force/torque). Su propósito es servir como política de control robótico que recibe imágenes de varias cámaras, el estado sensorimotor del robot y una instrucción en lenguaje natural, y emite directamente un vector de acciones.

La relevancia de este checkpoint es fundamentalmente metodológica: forma parte de una serie de seis ejecuciones comparativas que enfrentan pi0, SmolVLA y ACT con y sin fuerza/par, manteniendo idéntico conjunto de datos, tamaño de lote (16), número de pasos (20.000) y semilla (1000). El gemelo con fuerza/par de este modelo es `drashutoshspace/moonbot_smolvla_tf`, y la ejecución equivalente con pi0 es `drashutoshspace/moonbot_pi0_no_tf`. Esto lo convierte en material útil para reproducir una ablación controlada, no tanto en un modelo de propósito general.

SmolVLA, del que hereda la arquitectura, es un modelo de aproximadamente 450 millones de parámetros que combina un codificador visual, un modelo de lenguaje y un experto de acciones entrenado por flow matching. Al ser un ajuste fino, conserva esa arquitectura y ese tamaño, pero especializa los pesos a un contrato de despliegue muy concreto: estado de 15 dimensiones, tres cámaras y acción de 8 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) tipo transformer, derivada de SmolVLA: codificador visual + modelo de lenguaje + experto de acciones con flow matching |
| Parametros totales | Aprox. 450 M (cifra publica del modelo base SmolVLA; el ajuste fino conserva la misma arquitectura) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas en la model card) |
| Idiomas soportados | No disponible. Acepta instrucciones en lenguaje natural, pero el conjunto de ajuste no especifica idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (checkpoints LeRobot con pre/post-procesadores incluidos) |

Datos adicionales del contrato de despliegue declarado por el autor: estado de 15 dimensiones (`joint_read` de 8 + `tip_pos` de 7, sin fuerza/par `F_ee`), 3 cámaras y acción de 8 dimensiones.

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que recibe como entrada varias vistas de cámara, el estado sensorimotor actual del robot y una instrucción en lenguaje natural. Esas entradas se codifican en características contextuales que condicionan a un experto de acciones, encargado de generar los comandos motores mediante flow matching (predicción de chunks de acciones en lugar de acciones individuales). El tokenizador empleado es el de PaliGemma, tal y como se indica en la model card. Este ajuste concreto entrena de forma completa el codificador visual y el modelo de lenguaje (full fine-tune), siguiendo el mismo protocolo que las ejecuciones comparativas con pi0.

El entrenamiento se realizó sobre `gdiazsrl/lerobot_sep23_no_tf`, con renombrado de cámaras (`front` → `camera1`, `eef` → `camera2`, `right` → `camera3`) para respetar el contrato del pipeline. Hiperparámetros declarados: tamaño de lote 16, 20.000 pasos, semilla 1000 (valor por defecto), optimizador y scheduler del preset propio de LeRobot y sin partición de validación. Se publican cuatro checkpoints (`checkpoint-005000`, `-010000`, `-015000`, `-020000`), cada uno autocontenido con pesos, pre/post-procesadores, tokenizador PaliGemma, contrato `rosetta` de la ejecución, `prepare_deploy.py`, `test_offline.py` y `DEPLOY.md`; el checkpoint final incluye además `training_state/`. No se documenta ninguna innovación técnica adicional más allá de las propias de SmolVLA (inferencia asíncrona en el modelo base, no verificada para este ajuste).

## Capacidades

- Control robótico por imitación: genera acciones de 8 dimensiones a partir de observaciones visuales y del estado del robot.
- Entrada multimodal: consume tres vistas de cámara simultáneas más un vector de estado de 15 dimensiones (`joint_read` de 8 + `tip_pos` de 7).
- Condicionamiento por lenguaje natural: acepta instrucciones textuales como contexto de la política.
- Ejecución de tareas de apilado/manipulación de bloques: el modelo está ajustado específicamente para la tarea del conjunto `lerobot_sep23_no_tf` (pila de tres bloques, sin fuerza/par).
- Despliegue con contrato explícito: incluye scripts de preparación (`prepare_deploy.py`) y prueba offline (`test_offline.py`) para validar el pipeline antes de llevarlo al robot.
- Sin señal de fuerza/par: el modelo no utiliza `F_ee` como entrada, lo que simplifica el hardware de sensado necesario.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo "thinking": no disponible (no es un modelo de lenguaje generativo de propósito general).
- Capacidades multilingües: no disponibles ni documentadas.
- Visión general, audio o vídeo: no disponible; la entrada visual está restringida a las tres cámaras del contrato.

## Casos de uso

- Apilado de bloques con robot de bajo coste: el modelo está entrenado para esa tarea concreta con tres cámaras y sin sensores de par, de modo que puede desplegarse en brazos sin telemetría de fuerza, reduciendo el coste del hardware.
- Reproducción de una ablación fuerza/par: al existir el gemelo `moonbot_smolvla_tf` con idéntico dataset, lote, pasos y semilla, este checkpoint permite medir el efecto real de eliminar la señal de fuerza/par en el éxito de la tarea.
- Comparación de familias de políticas (pi0 vs SmolVLA vs ACT): sirve como una de las seis ejecuciones del estudio comparativo del autor, útil para decidir qué arquitectura conviene en un presupuesto de cómputo dado.
- Despliegue en estación de trabajo con GPU de gama media: al tratarse de un modelo de ~450 M de parámetros, la inferencia cabe en GPUs de consumo, lo que permite iterar en laboratorio sin clúster.
- Validación offline antes de pruebas físicas: el paquete incluye `test_offline.py`, de forma que se puede verificar que las observaciones y acciones respetan el contrato (15 dim de estado, 8 dim de acción) antes de conectar el robot.
- Reanudación de entrenamiento o ajuste adicional: el checkpoint final incluye `training_state/`, lo que permite continuar el entrenamiento desde el paso 20.000 en lugar de partir del modelo base.
- Docencia y prototipado en robótica con LeRobot: la estructura autocontenida de cada checkpoint y el `DEPLOY.md` facilitan usarlo como ejemplo reproducible de VLA ajustado a una tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas frente a `moonbot_pi0_no_tf`, `moonbot_smolvla_tf` o las ejecuciones con ACT; únicamente se enlazan las curvas de entrenamiento en Weights & Biases.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los ~450 M de parámetros del modelo base, el peso ocupa aproximadamente 0,9 GB en bfloat16 y 1,8 GB en float32; sumando activaciones del codificador visual para tres cámaras y caché, una estimación razonable es de 2 a 4 GB en bfloat16 y de 4 a 8 GB en float32. Son estimaciones por cálculo, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente (RTX 3060/4060 en adelante); para entrenamiento o ajuste fino adicional conviene una RTX 4090, A100 o H100 por el coste del full fine-tune con lote 16.
- GPU de consumo: sí, cabe con holgura en GPUs de consumo de gama media; el cuello de botella es más probablemente la latencia de captura de tres cámaras que la memoria.
- Opciones de despliegue: LeRobot (framework nativo del modelo) sobre PyTorch. Los scripts `prepare_deploy.py` y `test_offline.py` incluidos en cada checkpoint forman parte del flujo previsto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política VLA orientada a control.
- Latencia y throughput: no disponible para este ajuste fino. El modelo base SmolVLA incorpora inferencia asíncrona en su diseño, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea y datos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `moonbot_smolvla_no_tf` (este) | Aprox. 450 M | 3 camaras, estado de 15 dim, accion de 8 dim; sin fuerza/par | Ajuste sobre `gdiazsrl/lerobot_sep23_no_tf`, lote 16, 20.000 pasos | Apache-2.0 | HuggingFace, 0 descargas |
| `drashutoshspace/moonbot_smolvla_tf` | Aprox. 450 M | Mismo contrato con fuerza/par añadida | Mismo dataset e hiperparametros, con `F_ee` | Apache-2.0 | HuggingFace |
| `drashutoshspace/moonbot_pi0_no_tf` | No disponible (pi0 es de mayor tamano que SmolVLA) | 3 camaras, estado de 15 dim, sin fuerza/par | Mismo dataset, lote, pasos y semilla | Apache-2.0 | HuggingFace |
| `lerobot/smolvla_base` | Aprox. 450 M | Multiples camaras, estado y lenguaje; modelo generalista | Preentrenamiento sobre conjuntos de la comunidad LeRobot | Apache-2.0 | HuggingFace |

No se dispone de cifras de rendimiento comparadas entre estas variantes; la comparacion disponible es de configuracion experimental, no de resultados.

## Limitaciones y advertencias

- Ausencia de partición de validación: el entrenamiento se realizó sin split de validación, de modo que no hay ninguna métrica objetiva de generalización ni de sobreajuste en la model card.
- Riesgo de sobreajuste al montaje: al ajustarse sobre un único conjunto de datos de una tarea concreta (pila de tres bloques) y con un contrato rígido, es previsible un mal comportamiento fuera de esa configuración de cámaras, robot y objeto.
- Contrato de despliegue cerrado: el modelo espera exactamente 15 dimensiones de estado (`joint_read` 8 + `tip_pos` 7), 3 cámaras y 8 dimensiones de acción. Cualquier cambio en el robot, el número de cámaras o la nomenclatura exige volver a ajustar.
- Sin señal de fuerza/par: tareas que requieran contacto fino, detección de colisiones o ensamblaje sensible a la fuerza no están cubiertas por este modelo; para eso existe la variante `_tf`.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución (iluminación distinta, objetos nuevos, oclusiones).
- Idiomas no documentados: aunque el modelo acepta instrucciones en lenguaje natural, no se especifica en qué idioma se registraron las instrucciones del conjunto de entrenamiento; usar otro idioma puede degradar el condicionamiento.
- Sesgos: no documentados por el autor. Los sesgos heredados del preentrenamiento de SmolVLA y del conjunto de datos de la comunidad LeRobot no se analizan en la model card.
- Licencia: Apache-2.0 permite uso comercial, pero se desconoce la licencia y procedencia detallada del conjunto `gdiazsrl/lerobot_sep23_no_tf`; conviene verificarla antes de un despliegue comercial.
- Trazabilidad limitada: 0 descargas y 0 "likes" en el momento de la consulta, sin publicaciones asociadas ni resultados de evaluación independientes. La única evidencia de entrenamiento es la ejecución de Weights & Biases enlazada.
- Advertencia general: el modelo base SmolVLA es un modelo fundacional pensado para ser ajustado; requiere datos propios (el fabricante recomienda del orden de 50 episodios como punto de partida) para un rendimiento óptimo en un montaje nuevo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drashutoshspace/moonbot_smolvla_no_tf
- Conjunto de datos de ajuste: https://huggingface.co/datasets/gdiazsrl/lerobot_sep23_no_tf
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Variante con fuerza/par: https://huggingface.co/drashutoshspace/moonbot_smolvla_tf
- Ejecución comparativa con pi0 (sin fuerza/par): https://huggingface.co/drashutoshspace/moonbot_pi0_no_tf
- Ejecución comparativa con pi0 (v2): https://huggingface.co/drashutoshspace/moonbot_pi0_v2
- Curvas de entrenamiento (Weights & Biases): https://wandb.ai/drmishra-space/lerobot/runs/9i3olvax
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Paper de SmolVLA (arXiv 2506.01844): https://arxiv.org/abs/2506.01844
- Blog de Hugging Face sobre SmolVLA: https://github.com/huggingface/blog/blob/main/smolvla.md
- Código fuente de LeRobot: https://github.com/huggingface/lerobot
