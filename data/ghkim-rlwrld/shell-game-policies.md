# ghkim-rlwrld/shell-game-policies

## Resumen

`ghkim-rlwrld/shell-game-policies` es un repositorio de artefactos de robótica publicado por el usuario ghkim-rlwrld el 17 de septiembre de 2026, con licencia Apache 2.0 y un tamano de 37,5 GB. No contiene un unico modelo, sino dos familias de artefactos: tres politicas VLA (vision-language-action) derivadas de pi0.5 y un adaptador LoRA sobre el modelo multimodal Qwen3-VL-4B-Instruct que actua como planificador de alto nivel (HLP).

El entorno objetivo es un juego de trileros con vasos sobre un robot real: un bloque rojo se cubre con uno de tres vasos identicos, se barajan a mano y el brazo debe levantar el vaso correcto y depositar el bloque en una cesta. En el instante de la decision los tres vasos son indistinguibles, por lo que la respuesta solo existe en fotogramas ya pasados. La tarea se diseno explicitamente como una prueba fuera de simulador de condicionamiento de memoria.

La relevancia del repositorio es metodologica mas que de producto: documenta con precision el espacio de acciones, la conversion de rotaciones a rot6d y un contrato de comunicacion entre planificador y controlador. Sus propios numeros son sobrios: la percepcion esta resuelta (95,6 % de grounding con Qwen3-VL-4B) pero el seguimiento a traves de oclusion se queda en el nivel del azar (35,6 %), y el modelo mayor de 8B lo empeora (24,4 %). Las politicas pi0.5 no tienen todavia ningun resultado de evaluacion publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politicas VLA pi0.5 (fine-tuning de `pi05_base`) y adaptador LoRA sobre transformer multimodal Qwen3-VL-4B-Instruct |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 37,5 GB (no incluye `train_state/`, 31 GB por paso) |
| Pipeline declarado | robotics |
| Fecha de publicacion | 17 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |
| Resolucion de imagen | 224 x 224 |
| Espacio de acciones | Joint absoluto; delta EEF (xyz + rot6d + gripper); delta EEF con etiqueta de subtarea por fotograma |
| Entrenamiento | `pi05_base` afinado, batch global 64, 10.000 pasos, 34,7 epocas, 4xH100, perdida final 0,0007 |

## Arquitectura y entrenamiento

El componente de control son tres politicas pi0.5 afinadas desde `pi05_base`, cada una con un espacio de acciones distinto: una con articulaciones absolutas y una frase de tarea global por episodio; otra con delta EEF expresado como xyz mas rot6d mas gripper; y una tercera identica a la anterior pero con etiqueta de subtarea por fotograma. Todas procesan imagenes de 224 x 224, se entrenaron con batch global de 64 durante 10.000 pasos (34,7 epocas sobre 18.442 fotogramas) en 4xH100 y alcanzaron una perdida final de 0,0007. Los pesos publicados corresponden al paso final, en `params/` y `assets/`.

La innovacion tecnica documentada es la representacion de la rotacion. La convencion rpy presenta un salto de wrap en roll a +-pi, que produjo 269 discontinuidades a lo largo de los 45 episodios. Tras desenvolver el angulo y convertirlo a rot6d, el numero de discontinuidades baja a 0 y la desviacion estandar pasa de 3,08 a 0,039. La mascara delta es `(9, -1)`: posicion y rotacion relativas al estado actual, con gripper absoluto. El dataset de partida son 45 episodios y 18.442 fotogramas de un brazo de 7 grados de libertad mas gripper, con tres camaras estereo y una tasa de control medida de 9,26 Hz (el contenedor mp4 declara 10 Hz y es incorrecto).

El planificador es un LoRA de rango 16 y alpha 32 aplicado sobre `Qwen3-VL-4B-Instruct` sin modificar, entrenado con 1.171 filas Local-STTP construidas a partir de la camara de muneca. Su contrato de salida es estricto: el prompt lleva la subtarea que el controlador acepto por ultima vez y el modelo emite `1` o `0` (avanzar o mantener), un salto de linea y un JSON con `current_subtask` y `keyframe_positions`. Cuando el primer token es `0`, el campo de subtarea contiene la accion posterior a la aceptada, y se reserva el valor `unpredictable` para cuando aun no puede determinarse. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Manipulacion robotica de un brazo de 7 grados de libertad mas gripper, con salida en articulaciones absolutas o en delta EEF (xyz + rot6d + gripper).
- Condicionamiento por lenguaje: cada episodio lleva una frase de tarea global, y una de las variantes acepta etiquetas de subtarea por fotograma.
- Percepcion estereo a partir de tres camaras, con entrada de imagen a 224 x 224.
- Planificacion de alto nivel en formato de decision binaria (avanzar/mantener) mas JSON estructurado con subtarea actual y posiciones de keyframes.
- Modelado de incertidumbre mediante el valor reservado `unpredictable` en el campo de subtarea.
- Grounding visual: identificar cual de los tres vasos esta levantando el brazo en fotogramas donde ya lo esta levantando (95,6 % con Qwen3-VL-4B como base sin ajustar).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como tal; el bucle planificador-controlador es el unico mecanismo multi-paso descrito.
- Capacidades multilingues: no disponibles.
- Vision y audio: vision si (estereo); audio no disponible.

## Casos de uso

- Investigacion en condicionamiento de memoria: el entorno esta disenado para que la respuesta solo exista en fotogramas pasados, de modo que sirve como banco de pruebas para medir si una politica integra informacion temporal o solo reacciona al fotograma actual.
- Fine-tuning con demostraciones propias: las tres politicas publicadas y su receta (10.000 pasos, batch 64, 34,7 epocas) permiten partir de `pi05_base` y replicar el procedimiento sobre un brazo de 7 DoF con camaras estereo.
- Desarrollo de planificadores jerarquicos: el adaptador LoRA sobre Qwen3-VL-4B-Instruct es un ejemplo completo de contrato planificador-controlador con salida estructurada, reutilizable en otros dominios donde el planificador deba emitir una decision binaria mas metadatos.
- Estudio de representaciones de rotacion: la comparacion documentada entre rpy y rot6d (269 discontinuidades frente a 0) es un caso de referencia para justificar el uso de rot6d en aprendizaje por imitacion.
- Etiquetado automatico de subtareas: la variante con etiqueta por fotograma y el planificador con campo `current_subtask` permiten construir pipelines de segmentacion temporal de episodios de manipulacion.
- Benchmarking de modelos VLM en tareas de oclusion: los numeros de grounding frente a shuffle tracking sobre los mismos 45 episodios permiten comparar backbones multimodales en una tarea donde el escalado de parametros no ayuda.
- Evaluacion de protocolos offline: al no existir harness de evaluacion para el entorno, el repositorio sirve como caso practico para disenar un protocolo offline reproducible sobre 45 episodios y 18.442 fotogramas.
- Formacion y divulgacion en robotica: el repositorio incluye pesos, estadisticas de normalizacion y descripcion del dataset, lo que lo hace util como material didactico sobre pipelines VLA de extremo a extremo.

## Benchmarks y rendimiento

Para las politicas pi0.5 no hay ningun resultado publicado: el autor indica explicitamente que no existe harness de evaluacion para este entorno y que el protocolo offline esta en construccion.

Para el planificador hay numeros zero-shot sobre los mismos 45 episodios:

| Modelo | Grounding | Seguimiento del barajado (shuffle tracking) |
|---|---|---|
| Qwen3-VL-4B | 95,6 % | 35,6 % |
| Qwen3-VL-8B-Instruct | 100,0 % | 24,4 % |
| Azar | 33,3 % | 33,3 % |

Definiciones: *grounding* pregunta cual de los tres vasos esta levantando el brazo, a partir de fotogramas en los que ya lo esta levantando (la respuesta esta en la imagen). *Seguimiento del barajado* pregunta cual de los vasos oculta el bloque despues del barajado, lo que exige los fotogramas ya transcurridos.

Baselines relevantes: responder siempre "izquierda" obtiene un 40,0 %, y levantar el vaso bajo el que empezo el bloque obtiene un 33,3 %. Es decir, el suelo practico es el 40,0 %, no el cero. Tamano de muestra: n = 45.

## Requisitos de hardware

- Entrenamiento documentado: 4xH100, batch global 64, 10.000 pasos.
- VRAM de inferencia para las politicas pi0.5: no disponible. No se publican parametros totales ni requisitos de inferencia.
- VRAM de inferencia para el planificador: no documentada. Como referencia aritmetica, el modelo base de 4B parametros en bf16 ocupa aproximadamente 8 GB solo en pesos, a lo que hay que sumar el coste de procesar imagenes y el adaptador LoRA; es una estimacion, no un dato publicado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no documentadas. El autor solo precisa que los directorios `params/` y `assets/` cargan para inferencia (no para reanudar entrenamiento) y que `assets/` contiene las estadisticas de normalizacion, imprescindibles para generar acciones correctas.
- Latencia y throughput: no disponibles. El unico dato temporal es la tasa de control medida del dataset, 9,26 Hz.

## Comparativa con modelos similares

No hay datos publicados de parametros, contexto, rendimiento ni licencia para las politicas pi0.5 del repositorio, mas alla de que derivan de `pi05_base`. Tampoco se ofrecen cifras de otros sistemas VLA de manipulacion, por lo que la comparativa de la parte de control queda como no disponible.

La unica comparacion con numeros es la de backbones del planificador sobre los mismos 45 episodios:

| Modelo | Grounding | Shuffle tracking | Papel en el repositorio |
|---|---|---|---|
| Qwen3-VL-4B-Instruct | 95,6 % | 35,6 % | Base del adaptador LoRA r16/alpha32 entrenado con 1.171 filas Local-STTP |
| Qwen3-VL-8B-Instruct | 100,0 % | 24,4 % | Referencia zero-shot, no incluida en el repositorio |
| Azar | 33,3 % | 33,3 % | Linea base |

El resultado destacable es que duplicar el tamano del backbone mejora el grounding hasta el 100,0 % pero degrada el seguimiento del barajado del 35,6 % al 24,4 %, por debajo incluso de la linea base trivial del 40,0 % (responder siempre "izquierda"). El autor concluye explicitamente que no es un eje que se resuelva escalando.

## Limitaciones y advertencias

- Ausencia total de evaluacion de las politicas pi0.5: no hay harness para el entorno y el protocolo offline esta en construccion, de modo que no existe evidencia publicada de que las politicas funcionen.
- Seguimiento de oclusion al nivel del azar: 35,6 % con el backbone de 4B y 24,4 % con el de 8B, frente a un suelo practico del 40,0 %.
- Muestra muy pequena: 45 episodios y 18.442 fotogramas, con n = 45 en las metricas del planificador, lo que limita la significacion estadistica.
- Escalado contraproducente: el modelo mayor rinde peor en la tarea que motiva el repositorio, por lo que aumentar parametros no es una via de mejora.
- Dependencia de las estadisticas de normalizacion: `assets/` es obligatorio para obtener acciones correctas, y su omision produce salidas incorrectas.
- No se incluye `train_state/` (31 GB por paso), por lo que los checkpoints no permiten reanudar el entrenamiento, solo inferencia.
- Metadatos de frecuencia incorrectos en el dataset: el contenedor mp4 declara 10 Hz frente a los 9,26 Hz medidos, lo que puede desalinear pipelines que confien en el metadato.
- Idiomas soportados no documentados; las frases de tarea se describen como una unica frase global por episodio, sin especificar idioma.
- Riesgo de alucinacion: no evaluado en la informacion disponible, aunque el diseno del planificador reserva el valor `unpredictable` precisamente para los casos en que la subtarea no puede determinarse.
- Sesgos: no documentados.
- Licencia Apache 2.0 para los artefactos del repositorio, sin restricciones comerciales declaradas; el modelo base Qwen3-VL-4B-Instruct se carga por separado desde `Qwen/Qwen3-VL-4B-Instruct` y queda sujeto a su propia licencia.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ghkim-rlwrld/shell-game-policies
- Modelo base del planificador: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper, blog, repositorio de codigo o demo: no disponible
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo (unicamente resultados genericos de Wikipedia).
