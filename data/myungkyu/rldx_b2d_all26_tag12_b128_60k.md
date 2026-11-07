# Myungkyu/rldx_b2d_all26_tag12_b128_60k

## Resumen

`rldx_b2d_all26_tag12_b128_60k` es un checkpoint de ajuste fino del modelo base `RLWRLD/RLDX-1-PT`, un modelo de vision-lenguaje-accion (VLA) orientado a robotica manipulativa. Lo publica el usuario Myungkyu en Hugging Face como "vanilla baseline" para el conjunto de datos Bench2Dex, concretamente sobre el escenario `ur5_rh56dfx_3` con demostraciones de replay-generalization, cuatro vistas de camara y el orden articular canonico del registro. El modelo recibe imagenes de cabeza y de ambas munecas, un estado articular de 14 dimensiones y una instruccion de tarea, y produce 14 objetivos articulares absolutos.

El interes de esta publicacion es metodologico: sirve como referencia reproducible para comparar variantes de entrenamiento sobre el mismo backbone y dataset. En concreto, el autor lo diferencia de otra variante (`nomask`) por desactivar el enmascaramiento de ruido en las dimensiones de relleno (`action_noise_mask_dim=0`) y aplicar dropout de estado de 0.5. El checkpoint final corresponde a 60.000 pasos de optimizacion con batch 128, y se acompanan checkpoints intermedios en los pasos 15.000, 30.000 y 45.000.

El modelo tiene 7.032.139.840 parametros segun los pesos en safetensors y el repositorio ocupa 168,8 GB, lo que refleja la presencia de multiples checkpoints y del backbone completo. No es un modelo de proposito general: es un artefacto de investigacion en robotica, sin licencia declarada y sin idiomas especificados, pensado para ser consumido por el codigo de entrenamiento e inferencia de RLDX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (VLA; video length 4 / stride 2, tres vistas de camara, horizonte de accion 50) |
| Parametros totales | 7.032.139.840 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (ventana de video de 4 frames con stride 2; no se especifica contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan como texto, sin lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste | Bench2Dex/teleopdata (exportacion LeRobot del autor) |
| Entradas | imagenes de cabeza + muneca izquierda + muneca derecha, estado articular 14-d, instruccion de tarea |
| Salidas | 14 objetivos articulares absolutos |
| Entrenamiento | batch 128, 60.000 pasos, dropout de estado 0.5, `action_noise_mask_dim=0` |
| Codigo | RLWRLD/RLDX en la rama `myungkyu/jitter-patch` (commit 21f674b4) |
| Tamano del repositorio | 168,8 GB |

## Arquitectura y entrenamiento

El modelo se basa en RLDX-1-PT, un backbone VLA que procesa video con longitud 4 y stride 2, tres vistas de camara simultaneas y un horizonte de accion de 50 pasos. La entrada combina percepcion visual multi-camara (cabeza y dos munecas), estado propioceptivo de 14 dimensiones y una instruccion de tarea en lenguaje natural; la salida es un vector de 14 objetivos articulares absolutos. La configuracion referencia el backbone y el tokenizer del modelo base por su identificador de hub, de modo que el checkpoint solo contiene los pesos ajustados y la configuracion de la cabeza de accion.

El ajuste fino se realizo sobre la exportacion LeRobot de `Bench2Dex/teleopdata`, en el escenario `ur5_rh56dfx_3` con demostraciones de replay-generalization, cuatro vistas y orden articular canonico. Se entrenaron 60.000 pasos con batch 128. La innovacion declarada respecto a otras variantes es la desactivacion del enmascaramiento de ruido en las dimensiones de relleno (`action_noise_mask_dim=0`) combinada con un dropout de estado de 0.5, lo que constituye la diferencia experimental frente al checkpoint `nomask` del mismo autor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en modelos de robotica.

## Capacidades

- Generacion de acciones motoras: produce trayectorias de 14 articulaciones absolutas condicionadas a instruccion de tarea y observacion visual.
- Percepcion multi-camara: integra simultaneamente imagenes de cabeza y de ambas munecas.
- Condicionamiento por lenguaje: acepta una instruccion de tarea en texto para guiar la politica.
- Fusión de estado propioceptivo: incorpora el estado articular de 14 dimensiones como entrada.
- Prediccion con horizonte de accion de 50 pasos y ventana de video de 4 frames con stride 2.
- Ajuste especifico para el escenario `ur5_rh56dfx_3` (brazo UR5 con mano RH56DFX) del benchmark Bench2Dex.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo de pensamiento.

## Casos de uso

- Baseline reproducible para Bench2Dex: sirve como referencia "vanilla" contra la que comparar variantes de entrenamiento (por ejemplo, la variante `nomask`) sobre el mismo backbone y dataset, aislando el efecto de `action_noise_mask_dim` y del dropout de estado.
- Investigacion en politicas VLA: permite estudiar como influye el enmascaramiento de ruido en dimensiones de relleno sobre el aprendizaje de acciones de 14 dimensiones en tareas de manipulacion.
- Replay-generalization en manipulacion: evaluacion de la capacidad del modelo de generalizar a partir de demostraciones de replay en el escenario `ur5_rh56dfx_3`, con cuatro vistas de camara.
- Analisis de checkpoints intermedios: los checkpoints de los pasos 15.000, 30.000 y 45.000 permiten trazar curvas de aprendizaje y estudiar la evolucion de la politica sin reentrenar.
- Reproduccion de experimentos: al referenciar el backbone por hub id y fijar el commit de codigo `21f674b4`, facilita la reproduccion exacta del ajuste en entornos de investigacion.
- Control de robot UR5 con mano RH56DFX en laboratorio: el modelo emite objetivos articulares absolutos directamente utilizables por el controlador del escenario para el que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 7.032 millones de parametros, en precision FP16 el peso de los parametros ronda los 14 GB; en BF16, similar; en FP32, unos 28 GB. Estas cifras son estimaciones a partir del recuento de parametros y no incluyen el coste de las tres vistas de video ni de la cabeza de accion.
- GPU recomendadas: no especificadas por el autor. Por tamano, un modelo de ~7B en FP16 requiere GPUs de 24 GB o mas (RTX 4090, A100 40 GB, H100); con cuantizacion de 8 bits podria caber en GPUs de 16-24 GB, aunque no se documentan cuantizaciones.
- Cabe en GPU consumer: previsiblemente en RTX 4090 (24 GB) en FP16, sujeto a la memoria adicional del pipeline de video multi-camara; no confirmado por el autor.
- Opciones de despliegue: no se documentan en la model card. El modelo esta pensado para el codigo de RLDX (rama `myungkyu/jitter-patch`, commit 21f674b4), no para servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rldx_b2d_all26_tag12_b128_60k` (este) | 7.032 M | video 4 frames / stride 2; horizonte de accion 50 | VLA robotica, Bench2Dex `ur5_rh56dfx_3` | no disponible | Hugging Face |
| `Myungkyu/rldx_b2d_all26_tag12_nomask_b128_60k` | no disponible | misma configuracion RLDX-1-PT | VLA robotica, misma configuracion sin enmascaramiento de ruido | no disponible | Hugging Face |
| `RLWRLD/RLDX-1-PT` (base) | no disponible | RLDX-1-PT | backbone VLA preentrenado | no disponible | Hugging Face |

La comparacion mas directa es con la variante `nomask` del mismo autor, que comparte backbone, dataset y presupuesto de entrenamiento y difiere en la configuracion de enmascaramiento de ruido. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre ambas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre un unico escenario (`ur5_rh56dfx_3`) y un unico dataset (Bench2Dex/teleopdata), la politica esta fuertemente sesgada hacia esa morfologia, camaras y distribucion de tareas.
- Riesgo de alucinacion: en el contexto de robotica, el equivalente es la generacion de trayectorias no validas o fisicamente inseguras; no se documentan mecanismos de seguridad ni limites articulares en la model card.
- Limitaciones de contexto e idioma: no se especifica el soporte linguistico de las instrucciones de tarea; el modelo solo se ha evaluado, segun la informacion disponible, en el escenario de Bench2Dex.
- Restricciones de licencia: la licencia figura como "no disponible", lo que impide determinar si el uso comercial esta permitido. Debe contactarse con el autor antes de cualquier uso en produccion.
- Naturaleza del artefacto: es un checkpoint de investigacion (baseline) con 60.000 pasos de entrenamiento, no un modelo listo para produccion; no incluye estado del optimizador.
- Dependencia de codigo externo: requiere el codigo de RLDX en la rama `myungkyu/jitter-patch` (commit 21f674b4); cambios en el repositorio pueden romper la reproducibilidad.
- Tamano del repositorio: 168,8 GB, lo que exige planificar el almacenamiento y usar `allow_patterns`/`ignore_patterns` para descargar solo los checkpoints necesarios.
- Ausencia de datos de evaluacion: no hay benchmarks publicados que permitan estimar el exito de la politica en tareas reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldx_b2d_all26_tag12_b128_60k
- Variante `nomask` del mismo autor: https://huggingface.co/Myungkyu/rldx_b2d_all26_tag12_nomask_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Codigo de RLDX (rama `myungkyu/jitter-patch`, commit 21f674b4): https://github.com/RLWRLD/RLDX
- Dataset Bench2Dex/teleopdata: https://huggingface.co/datasets/Bench2Dex/teleopdata
