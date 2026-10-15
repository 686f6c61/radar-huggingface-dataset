# Donghyun1228/pi05-libero-view-large-idm-rollout-position-difference-20261015-shuffled

## Resumen

Este repositorio es un checkpoint de investigacion en robotica publicado por el usuario Donghyun1228, etiquetado como pi05, libero y robotics. Se trata de una variante experimental de la familia Pi05 (π₀.₅), descrita publicamente por LeRobot como un modelo Vision-Language-Action (VLA) con cabeza de accion flow-matching y coentrenamiento sobre demostraciones robotizadas y datos multimodales a gran escala, ajustada aqui al benchmark de manipulacion LIBERO. El repositorio ocupa 5,9 GB y contiene unicamente parametros de inferencia no-EMA convertidos a BF16, compuestos con un encoder de muneca congelado; no se declara licencia, idiomas ni numero de parametros.

Su rasgo distintivo es el sufijo "shuffled" del identificador: el modelo incorpora dos pasadas independientes solo-imagen que predicen diferencias normalizadas de posicion final XYZ, supervisadas por las diferencias de posicion propioceptivas, pero las etiquetas se barajan ciclicamente dentro del batch. Es, por tanto, un control experimental disenado para comprobar si un objetivo auxiliar de este tipo aporta sensibilidad real al movimiento o solo regularizacion inespecifica.

Es relevante para quien siga la linea de trabajo del autor sobre adaptacion vision-only y source-free de politicas VLA en LIBERO, no como modelo listo para produccion: acumula 0 descargas y 0 likes, su pantalla de evaluacion es un diagnostico interno reutilizado en repetidas ocasiones y la propia model card advierte de que superar a un control perjudicial no basta para demostrar grounding de objeto o meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) de la familia Pi05 (π₀.₅) con cabeza de accion flow-matching, mas un modulo auxiliar de prediccion de desplazamiento (IDM) a partir de imagen. La model card no describe la arquitectura interna completa |
| Parametros totales | No disponible. El repositorio ocupa 5,9 GB y contiene 74 hojas de parametros de inferencia no-EMA mas activos de normalizacion |
| Parametros activos | No aplica (no se describe como arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo BF16 en el checkpoint publicado. No se distribuyen versiones GGUF, AWQ, GPTQ ni FP32; los checkpoints nativos FP32 de optimizador y EMA se conservan aparte, en B200, y no se incluyen |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Parametros de inferencia no-EMA convertidos a BF16, compuestos con un encoder de muneca congelado procedente de los pesos de vision de origen. Contenedor de fichero no especificado en la model card |

## Arquitectura y entrenamiento

El checkpoint es una continuacion de 200 updates desde una linea base aceptada de vista con learning rate manual ("raw999"), restaurando Adam/EMA y manteniendo el escalado posterior a Adam con vision1/expert0.1. Sobre esa base se anade un objetivo auxiliar compuesto por una sonda IDM de 40 tareas mas un auxiliar de posicion, con B32 por perdida. Los pares auxiliares proceden de 24 rollouts ya existentes sobre la politica objetivo aceptada, con estados iniciales 0-2 y cuatro ventanas por cada una de 8 tareas, sin filtrado por exito. El dataset asociado es Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015, revision 34225b034da7291af2b6d7f44e3646ff52ab60f5. El coeficiente del auxiliar es 0,016737429744154233, calibrado una sola vez sobre cuatro lotes de entrenamiento y ajustado al entrenamiento previo de sonda-desplazamiento, no reajustado a los gradientes del rollout.

Mecanicamente, dos pasadas independientes solo-imagen predicen diferencias normalizadas de posicion final XYZ, supervisadas por las diferencias de posicion final de la propiocepcion. Ambas pasadas comparten el mismo ruido puro t1 y el prompt constante, y ninguna ve la imagen de la otra. No se emplean observaciones de la camara original, etiquetas de accion experta, etiquetas de estado de objeto del simulador ni parametros de modelo adicionales; la propiocepcion existente aporta los objetivos XYZ normalizados del EEF y ni la propiocepcion limpia ni los prompts antiguos entran en la prediccion. La inferencia desplegada permanece sin cambios y no se usa ningun prompt de posicion para las acciones. La model card advierte de que los offsets aditivos comunes de escena no estan identificados y de que se requieren diagnosticos de desplazamiento cero y de barajado de pares de imagenes antes de afirmar sensibilidad al movimiento. El codigo de entrenamiento corresponde al commit 8e18877e del repositorio github.com/Donghyun1228/vla_adaptation.

## Capacidades

- Ejecucion de politicas de manipulacion robotica en tareas del benchmark LIBERO: la evaluacion publicada cubre 8 tareas seleccionadas con los initialstates oficiales 3-5, seed 17, MuJoCo 3.2.3 y vista "target view large".
- Generacion de acciones mediante cabeza flow-matching, heredada del linaje Pi05.
- Entrada multimodal basada en imagenes (camara base y muneca) acompanadas de un prompt de texto constante.
- Prediccion auxiliar de desplazamiento del EEF a partir de imagen: dos pasadas solo-imagen estiman diferencias normalizadas de posicion final XYZ, entrenadas contra la diferencia de posicion propioceptiva.
- Aprendizaje por imitacion desde rollouts de politica (self-rollout) sin filtrado por exito ni etiquetas de accion experta.
- Tool calling / function calling: no disponible (no se menciona ni aplica a una politica VLA de accion continua).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking", vision general, audio o generacion de texto: no aplica; se trata de un checkpoint de politica robotica, no de un modelo de lenguaje de proposito general.

## Casos de uso

- Reproduccion de experimentos de adaptacion source-free en LIBERO: cargar el checkpoint con la configuracion de politica pi05_libero_source_free_split_vision_idm y reejecutar la pantalla de 8 tareas con initialstates 3-5, seed 17 y MuJoCo 3.2.3 para verificar los 13/24 publicados.
- Ablacion de objetivos auxiliares: emplear este checkpoint como control "shuffled" frente a su variante "aligned" (10/24) y a la linea base sin cambios (11/24), para separar cuanto del efecto procede de la senal supervisada real y cuanto de regularizacion inespecifica.
- Investigacion sobre grounding de objeto y meta: someter el modelo a los diagnosticos de desplazamiento cero y de barajado de pares de imagenes que exige la propia model card antes de atribuir sensibilidad al movimiento a las pasadas solo-imagen.
- Auditoria de identificabilidad: cuantificar los offsets aditivos comunes de escena, un problema que la model card senala explicitamente como no resuelto, para determinar si el modelo distingue cambios reales de desplazamiento de sesgos constantes de escena.
- Continuacion de entrenamiento supervisada: el repositorio sirve como punto de partida para fine-tuning con la configuracion indicada, teniendo en cuenta que no incluye el optimizador ni el EMA en FP32 y que, por tanto, no permite reanudar el entrenamiento exacto.
- Generacion de nuevos rollouts en simulacion: integrar la politica en un bucle LIBERO/MuJoCo para producir rollouts adicionales con la misma receta (initialstates 0-2, cuatro ventanas por tarea) y ampliar el conjunto auxiliar.
- Formacion y divulgacion tecnica sobre VLA: por su tamano contenido (5,9 GB en BF16) es un ejemplo practico para ilustrar el flujo entrenamiento-diagnostico en robotica simulada con criterios de aceptacion no basados en exito.
- Estudio de estabilidad entre semillas: barrer semillas distintas de la 17 sobre las mismas 8 tareas y comparar contra los controles ya registrados, para estimar la varianza de la pantalla de diagnostico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento es una pantalla comparativa de politicas emparejadas, con 8 tareas seleccionadas, initialstates oficiales 3-5, seed 17, MuJoCo 3.2.3 y vista objetivo grande:

| Variante evaluada | Exitos / 24 |
|---|---|
| accepted_unchanged | 11 |
| old_idm_plus_rollout_position_difference_shuffled (este repositorio) | 13 |
| old_idm_plus_rollout_position_difference_aligned | 10 |
| continue_old_idm | 11 |
| old_idm_plus_extra_probe_idm | 12 |
| old_idm_plus_rollout_idm | 12 |
| old_idm_plus_position_difference_shuffled | 13 |
| old_idm_plus_position_difference_aligned | 12 |

Advertencias textuales de la model card sobre estos numeros: la pantalla de diagnostico se ha utilizado repetidamente, por lo que no constituye un test intacto ni una estimacion de mejora amplia sobre las 40 tareas; superar por si solo a un control barajado perjudicial es insuficiente, y la comparacion debe hacerse contra las variantes unchanged/continued IDM; ademas, el ajuste del auxiliar no demuestra por si mismo grounding de objeto o meta.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay requisitos oficiales publicados. Como referencia, el repositorio pesa 5,9 GB y contiene parametros de inferencia en BF16, de modo que solo los pesos ocupan en torno a 5,9 GB; con activaciones y el entorno de simulacion la estimacion razonable se situa en el rango de 8 a 12 GB de VRAM, cifra no confirmada por el autor.
- GPU recomendadas: no se publican recomendaciones. El unico dato de hardware en la informacion disponible es la mencion del autor a que los checkpoints nativos FP32 de optimizador y EMA se conservan "en B200", lo que indica que el entrenamiento se realizo en GPU de centro de datos (NVIDIA B200).
- Cabe en GPU de consumo: probablemente si en tarjetas con 24 GB o mas (RTX 4090, RTX 3090), dado el tamano de pesos en BF16, siempre que se disponga ademas de recursos para MuJoCo y el entorno LIBERO. No confirmado oficialmente.
- Opciones de despliegue: el ecosistema previsto es LeRobot con la configuracion de politica pi05_libero_source_free_split_vision_idm, dentro de un bucle de simulacion LIBERO sobre MuJoCo 3.2.3. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.
- Requisitos del entorno de evaluacion: MuJoCo 3.2.3, LIBERO con los initialstates oficiales 3-5 y vista objetivo grande.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (pi05-libero-view-large-idm-rollout-position-difference-20261015-shuffled) | No disponible | No disponible | No disponible | HuggingFace, 0 descargas y 0 likes | Control con etiquetas barajadas; 13/24 en la pantalla de 8 tareas |
| Variante aligned del mismo experimento (mismo autor) | No disponible | No disponible | No disponible | HuggingFace | Etiquetas alineadas en lugar de barajadas; 10/24 en la misma pantalla |
| pi05-libero-view-large-idm-coverage-20261015-continue (mismo autor) | No disponible | No disponible | No disponible | HuggingFace | Continuacion de 200 updates desde la linea base raw999 con Adam/EMA restaurados; figura como continue_old_idm con 11/24 |
| pi05_libero_base (LeRobot) | No disponible | No disponible | No disponible | ModelScope | Modelo VLA π₀.₅ de Physical Intelligence, con generalizacion en mundo abierto y coentrenamiento sobre demostraciones y datos multimodales; solo soporta la cabeza de accion flow-matching |
| pi05_libero_finetuned (LeRobot) | No disponible | No disponible | No disponible | ModelScope | Checkpoint entrenado y evaluado en tareas LIBERO |

## Limitaciones y advertencias

- Licencia no declarada: no hay permiso explicito de uso comercial ni condiciones de redistribucion; debe tratarse como material de investigacion.
- Etiquetas barajadas: el control se entrena con etiquetas barajadas ciclicamente dentro del batch, de modo que un buen resultado no implica sensibilidad al movimiento. La model card indica explicitamente que superar a un control perjudicial es insuficiente.
- Evaluacion no limpia: la pantalla de diagnostico (8 tareas, initialstates 3-5, seed 17, MuJoCo 3.2.3) se ha utilizado repetidamente y no equivale a un conjunto de test intacto ni a una estimacion sobre las 40 tareas.
- Grounding no demostrado: el ajuste del auxiliar por si solo no establece grounding de objeto ni de meta, ni permite afirmar que el modelo distingue cambios reales de escena.
- Identificabilidad incompleta: los offsets aditivos comunes de escena no estan identificados; sin diagnosticos de desplazamiento cero y de barajado de pares de imagenes, la sensibilidad al movimiento no puede atribuirse.
- Sin validacion externa: 0 descargas y 0 likes; no hay terceros que hayan reproducido los resultados.
- Datos de entrenamiento restringidos: no se usan observaciones de camara original, etiquetas de accion experta ni etiquetas de estado de objeto del simulador, lo que limita la trazabilidad de la supervision y complica la reproduccion exacta.
- Sin reanudacion exacta: el repositorio incluye solo parametros de inferencia no-EMA en BF16; los checkpoints FP32 de optimizador y EMA se conservan fuera del repositorio, por lo que no es posible retomar el entrenamiento en el punto exacto.
- Sin cuantizaciones alternativas: la ausencia de versiones GGUF, AWQ o GPTQ obliga a disponer de memoria suficiente para BF16.
- Sesgos y alucinacion en el sentido de modelos de lenguaje: no aplica, pero si aplica el riesgo de fallo de politica en tareas de manipulacion y el riesgo de sobreinterpretar los numeros de una pantalla de diagnostico interna.
- Idiomas soportados no declarados; los prompts usados en el entrenamiento auxiliar son fijos y no hay evaluacion multilingue.
- Alcance muy limitado: es un checkpoint de investigacion dentro de una serie de ablaciones, no un modelo de proposito general ni una politica validada en robot real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-rollout-position-difference-20261015-shuffled
- Codigo de entrenamiento (commit 8e18877e): https://github.com/Donghyun1228/vla_adaptation
- Dataset citado en la model card: Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015, revision 34225b034da7291af2b6d7f44e3646ff52ab60f5. URL construida a partir del identificador, no verificada en la busqueda: https://huggingface.co/datasets/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015
- Checkpoint hermano (cobertura IDM, continuacion): https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-continue
- Checkpoint hermano (split vision view large 1000): https://huggingface.co/Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010
- Modelo base Pi05 en LeRobot (ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_base
- Modelo Pi05 ajustado a LIBERO (ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned
