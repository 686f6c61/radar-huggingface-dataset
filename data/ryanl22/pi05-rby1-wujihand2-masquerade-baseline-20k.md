# RyanL22/pi05-rby1-wujihand2-masquerade-baseline-20k

## Resumen

pi05-rby1-wujihand2-masquerade-baseline-20k es un ajuste fino del modelo base `lerobot/pi05_base` (familia pi05, LeRobot 0.6.1) realizado por el usuario RyanL22. No es un modelo de lenguaje general, sino una politica de vision-lenguaje-accion (VLA) para robotica: recibe observaciones de camaras estereo y el estado articular de un robot y produce acciones de control de 54 dimensiones. En concreto, controla un robot RB-Y1 con manos Wujihand2 (brazo derecho de 7 GdL, mano derecha de 20 GdL, brazo izquierdo de 7 GdL y mano izquierda de 20 GdL).

Su relevancia es metodologica: se publica como **baseline de video humano con alineacion visual tipo masquerade/phantom**. El brazo humano se elimina con ProPainter y se compone encima un render de MuJoCo de los brazos y manos RB-Y1 + Wujihand2 en la pose retargetizada (siempre por encima, sin test de profundidad). Los frames de teleoperacion reciben el mismo render sobre el robot real segun el estado articular medido, de modo que entrenamiento e inferencia ven exactamente la misma edicion. Es uno de los dos baselines de alineacion visual entrenados con datos, etiquetas e hiperparametros identicos, diferenciandose solo en la edicion de imagen, lo que permite una comparacion directa.

El modelo tiene 4.143.449.894 parametros (~4,14 mil millones) en pesos safetensors, ocupa 9,4 GB en el repositorio y se distribuye bajo licencia Apache 2.0. Ha sido entrenado 20.000 pasos con batch global 64 en 2 GPU H100, con perdida final de 0,017.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica VLA de la familia pi05; el autor no detalla la arquitectura interna) |
| Parametros totales | 4.143.449.894 |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; la model card indica tokenizer max length 320 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, entrenados en bfloat16) |
| Idiomas soportados | no disponibles (modelo de robotica; no se declara soporte de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 9,4 GB) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. Se sabe que parte de `lerobot/pi05_base`, que la libreria utilizada es LeRobot 0.6.1, y que se trata de una politica que mapea observaciones visuales estereo y estado articular a acciones. El espacio de estado/accion se amplio de 32 a 54 dimensiones respecto al modelo base, tomando `observation.joint_position[10:64]`: brazo derecho (7), mano derecha (20), brazo izquierdo (7) y mano izquierda (20). Las ruedas, el torso y la cabeza son constantes en estos datos y quedan excluidos. El tokenizer tiene longitud maxima 320.

El entrenamiento uso 660 episodios y 170.971 frames a 30 fps, con imagen estereo de 288x512 (ambos ojos de la camara ZED), distribuidos en 15 celdas (4 de robot y 11 humanas) con reparto proporcional a la raiz cuadrada del numero de frames. Las dos fuentes son RB-Y1 teleop v1 (209 episodios, 4 categorias: pelota, botella, caja pequena y muneco, robot real) y RoboTryOn-human-2 (451 episodios, 11 categorias, video humano regrabado para coincidir con la vista ZED del RB-Y1). Las etiquetas humanas proceden de triangulacion estereo con HaWoR, retargetizada al RB-Y1 mediante IK de brazo de 7 GdL (damped least squares sobre la pose de muneca) e IK por dedo para Wujihand2. La accion adelanta a la imagen 7 frames (brazo) y 4 frames (mano), igualando el adelanto medido en teleoperacion; el render se dibuja en la pose de la etiqueta, no en la de la accion.

El ajuste fino se ejecuto durante 20.000 pasos con batch global 64 (2 GPU x 32) sobre H100, en bfloat16, con el **encoder de vision descongelado**, augmentacion fotometrica coherente entre ojos y sin augmentacion de espejo. La perdida final fue 0,017. Mapeo de camaras en entrenamiento e inferencia: ojo izquierdo a `observation.images.base_0_rgb`, ojo derecho a `observation.images.left_wrist_0_rgb`.

## Capacidades

- Generacion de acciones de control motor de 54 dimensiones para manipulacion bimanual sobre RB-Y1 con manos Wujihand2.
- Percepcion visual estereo (dos ojos a 288x512) integrada en el bucle de politica.
- Co-entrenamiento con video humano retargetizado, ademas de teleoperacion real de robot.
- Ejecucion de tareas de manipulacion en 4 categorias de objeto (pelota, botella, caja pequena, muneco) y 11 categorias adicionales presentes en los datos humanos.
- Consistencia imagen-etiqueta bajo la edicion masquerade: el render se dibuja en la pose de la etiqueta, de modo que la imagen sintetica y la accion objetivo no divergen.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue (no aplica al caso de uso declarado).
- No se declara modo de pensamiento, audio ni otras capacidades especiales.

## Casos de uso

- Baseline de investigacion en alineacion visual: sirve como referencia cuantitativa frente al baseline alternativo (linea roja de EgoMimic) entrenado con los mismos datos, etiquetas e hiperparametros, aislando el efecto de la edicion de imagen sobre la perdida y el exito de la politica.
- Evaluacion de co-entrenamiento robot + video humano: permite medir cuanto aporta el video humano regrabado (451 episodios, 11 categorias) frente al uso exclusivo de teleoperacion (209 episodios, 4 categorias) en la misma receta de entrenamiento.
- Manipulacion bimanual real sobre RB-Y1: el modelo emite directamente las 54 dimensiones de accion (dos brazos de 7 GdL y dos manos de 20 GdL), por lo que puede desplegarse en el robot sin capa de mapeo adicional.
- Banco de pruebas de retargeting con HaWoR: al estar las etiquetas humanas generadas por triangulacion estereo e IK de 7 GdL, el modelo permite estudiar el impacto de los residuos de IK en el aprendizaje de politicas.
- Estudio de augmentacion fotometrica estereo: la receta (coherencia entre ojos, sin espejo) es replicable y el modelo resultante sirve para comparar estrategias de augmentacion en politicas con entrada estereo.
- Transferencia sim-a-real con renders de MuJoCo: dado que entrenamiento e inferencia comparten el mismo render compuesto, es un caso util para estudiar el uso de activos graficos como puente entre dominios.
- Reproduccion de experimentos en LeRobot 0.6.1: el checkpoint esta pensado para cargarse con esa version de la libreria, lo que facilita replicar el pipeline completo (datos, IK, entrenamiento, evaluacion).
- Analisis del desfase accion-imagen: con adelantos fijos de 7 frames (brazo) y 4 (mano), permite estudiar como afecta el desalineamiento temporal entre observacion y accion al rendimiento de la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de rendimiento es la perdida final de entrenamiento: 0,017 tras 20.000 pasos con batch global 64. No se proporcionan tasas de exito en tareas, ni metricas de evaluacion en robot real o simulacion, ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- Entrenamiento declarado: 2 GPU H100, batch global 64 (2 x 32), bfloat16, encoder de vision descongelado, 20.000 pasos.
- VRAM estimada para inferencia (calculo a partir de los 4.143.449.894 parametros, sin contar activaciones ni el encoder de vision): ~16,6 GB en fp32 y ~8,3 GB en bfloat16.
- Estimacion practica en bfloat16: del orden de 12-16 GB considerando pesos, encoder de vision y activaciones; no confirmado por el autor.
- Cuantizacion: no se publican pesos cuantizados ni formatos GGUF/INT8/INT4. Cualquier estimacion en 8 o 4 bits seria una extrapolacion, no un dato verificado.
- GPU consumer: una RTX 4090 o RTX 3090 (24 GB) deberia ser suficiente para inferencia en bfloat16 segun la estimacion de VRAM; no verificado por el autor.
- Opciones de despliegue: LeRobot 0.6.1 (libreria declarada) sobre PyTorch. vLLM, TGI, llama.cpp y Ollama no estan indicados ni se espera soporte, al tratarse de una politica VLA y no de un modelo de lenguaje con pesos GGUF.
- Latencia y throughput: no disponibles. La tasa de los datos de entrenamiento es de 30 fps, pero no se declara la frecuencia de control en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / estado-accion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-rby1-wujihand2-masquerade-baseline-20k | 4.143.449.894 | 54 dims de estado/accion; tokenizer max length 320 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Baseline masquerade/phantom; render MuJoCo siempre por encima |
| `lerobot/pi05_base` | no disponible | 32 dims de estado/accion en el base, ampliado a 54 en este ajuste | no disponible en la informacion | HuggingFace | Modelo base sobre el que se hace el ajuste fino |
| Baseline con linea roja de EgoMimic | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card como la otra edicion visual; la linea roja sigue la mano humana y discrepa de la etiqueta en varios cm |
| Baselines OpenArm | no disponible | no disponible | no disponible | no disponible | Mencionados como referencia previa en la que tambien se conservaron los episodios con residuos de IK |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparables mas alla de lo indicado.

## Limitaciones y advertencias

- Sesgos conocidos: no se declaran sesgos demograficos ni de otro tipo en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido linguistico habitual, pero si existe riesgo de acciones erroneas o imprecisas al ser una politica de control.
- Limitacion de datos documentada: 12 episodios de freidora de aire presentan residuos de muneca de IK de 2-5 cm, porque la mano izquierda que abre la puerta queda fuera del alcance del RB-Y1. Se conservaron, igual que en los baselines OpenArm. En esos episodios el enfoque masquerade mantiene la consistencia imagen-etiqueta porque renderiza la pose de la etiqueta; la linea roja de EgoMimic sigue la mano humana y discrepa de la etiqueta en varios centimetros.
- Restriccion de morfologia: el espacio de accion esta fijado a 54 dimensiones correspondientes a RB-Y1 + Wujihand2 (brazo derecho 7, mano derecha 20, brazo izquierdo 7, mano izquierda 20). Ruedas, torso y cabeza quedan excluidos por ser constantes en los datos, por lo que el modelo no controla esas articulaciones.
- Mapeo de camaras fijo: ojo izquierdo a `observation.images.base_0_rgb` y ojo derecho a `observation.images.left_wrist_0_rgb`. Un mapeo distinto en despliegue romperia la correspondencia con el entrenamiento.
- Dominio visual restringido: la politica esta entrenada con la edicion masquerade aplicada de forma consistente; usarla sin esa edicion (o con otra edicion) introduce una discrepancia entre entrenamiento e inferencia.
- Generalizacion limitada: el entrenamiento cubre 660 episodios y 15 categorias de objeto (4 de robot y 11 humanas) con reparto proporcional a la raiz cuadrada del numero de frames, lo que da poco peso relativo a las categorias humanas.
- Licencia: Apache 2.0, sin restricciones declaradas para uso comercial. Conviene revisar igualmente las licencias de los datos de origen (RB-Y1 teleop v1, RoboTryOn-human-2) y de las herramientas usadas en la generacion de etiquetas y renders.
- Madurez: el repositorio registra 0 descargas y 0 likes, y no se han publicado evaluaciones independientes. No se recomienda su uso en produccion sin validacion propia.
- Caveat del encoder de vision descongelado: al haberse ajustado el encoder, el modelo puede ser mas sensible al dominio visual de las camaras ZED y a las condiciones de iluminacion de los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-rby1-wujihand2-masquerade-baseline-20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Libreria declarada por el modelo (LeRobot, version 0.6.1): https://github.com/huggingface/lerobot
- La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados correspondian a un hotel en Viena (strandhotel-alte-donau.at, hotels-und-pensionen.at, a-hotel.com y citygate.at), sin relacion con el modelo. No se han encontrado papers, blogs ni demos adicionales asociados a este checkpoint.
