# jren313/starvla-pipette-5task-v6d-pi05-egofocusvel

## Resumen

El modelo `jren313/starvla-pipette-5task-v6d-pi05-egofocusvel` es un checkpoint de política VLA (vision-language-action) de starVLA, obtenido por fine-tuning de PI0.5 (openpi), para una tarea bimanual de pipeteo en un robot Unitree G1 con manos Inspire. Un único modelo cubre los cinco pasos de la tarea —coger la pipeta, coger el tubo, introducir la pipeta en el tubo, devolver el tubo y devolver la pipeta— y la frase de tarea del prompt selecciona el paso.

La variante v6 run D añade a run A una única entrada de estado: la velocidad lineal medida de ambas muñecas, con 6 valores en m/s. El objetivo es desambiguar el paso 3, donde acercar y separar la pipeta del tubo son visualmente y cinemáticamente muy parecidos. En un análisis kNN leave-one-episode-out sobre 49 episodios de teleoperación, la pose sola acertaba la dirección del movimiento en los siguientes 0,5 s el 68 % de las veces; añadiendo la velocidad subía al 94 %. El checkpoint pesa 8,3 GB en bf16; no se publican recuento de parámetros, longitud de contexto ni resultados en robot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Autor | jren313 |
| Fecha de creación | 2026-10-17 |
| Arquitectura | VLA derivada de PI0.5 (openpi); no se detalla transformer, MoE, SSM ni híbrido en la información disponible |
| Parámetros totales | No disponible; el checkpoint bf16 de 8,3 GB implica del orden de 4,1 mil millones de parámetros si todo el peso está en bf16, cálculo no confirmado por el autor |
| Parámetros activos | No disponible; no se documenta una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16; no se documentan GGUF, int8, int4 ni otras cuantizaciones |
| Idiomas soportados | No disponible; no se declara soporte multilingüe. Las frases de tarea del ejemplo están en inglés |
| Licencia | No disponible en la ficha de Hugging Face; la model card indica que se aplican los términos de licencia del modelo base PI0.5 (openpi) |
| Formato de pesos | PyTorch `.pt` (`pi05/final_model/pytorch_model.pt`), bf16; no se incluyen safetensors ni GGUF |
| Tamaño del repositorio | 8,3 GB |
| Pipeline | robotics |
| Librería | starvla |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una política VLA especializada, no un LLM de propósito general. La model card no desglosa la arquitectura interna de PI0.5; solo describe el pipeline de control: dos vistas visuales, un estado numérico y una salida de acciones. La percepción usa la cámara ego y una vista FOCUS, que es una ventana de 300 px de la imagen ego alrededor del objetivo del paso actual: el soporte en los pasos 1 y 5, el rack de tubos en los pasos 2 y 4, y la boca del tubo en el paso 3. Ambas vistas pasan de 236 a 224 px. No hay cámara de muñeca.

El entrenamiento descrito es supervisado sobre datos de teleoperación; no se documentan etapas de RLHF ni DPO. Se parte de PI0.5, en bf16, con AdamW, learning rate 5e-5 con decaimiento coseno hasta 2,5e-6, 17.931 pasos de optimizador y 1.000 de warmup. El autor indica 4 GPU × 16 × acumulación de gradiente 2, es decir, 128 muestras por paso de optimizador; el log registra 35.862 micro-pasos. El dataset tiene 447 episodios, con split 379/68 por grabación, y un filtro de pausa de 1 mm en ambas muñecas que deja 229.515 muestras. La vista FOCUS se construye con un overlay que no es público.

La acción se representa como un chunk de 30 pasos y 32 dimensiones: pose 6D de ambas muñecas relativa al último comando (posición sumada, rotación compuesta), pulgar izquierdo relativo, mano derecha absoluta con 5 registros y 14 articulaciones de brazo absolutas usadas como warm start de IK. La innovación de run D es introducir `state.wrist_vel` como única entrada de estado: 6 valores en m/s, `[izquierda vx vy vz, derecha vx vy vz]`, calculados con `wrist_vel[t] = (p[t] - p[max(t - 12, 0)]) * 60 / 12`, donde `p` es la posición de cada muñeca por cinemática directa de las articulaciones medidas, no del comando. La ventana es una diferencia hacia atrás de 0,2 s a 60 fps. Los valores se normalizan por q99 y se escriben en el prompt como tokens de estado discretos de PI0.5 con 256 bins: `Task: <sentence>, State: v v v v v v;\nAction: `. `max_state_dim` es 6, sin tokens de padding; las claves de proprio y command-anchor solo se cargan para construir las etiquetas relativas y el modelo no las ve.

## Capacidades

- Control bimanual de un Unitree G1 con manos Inspire para una secuencia de cinco pasos de pipeteo.
- Selección del paso mediante una frase de tarea en el prompt; una frase incorrecta puede seleccionar otro paso.
- Percepción visual limitada a la cámara ego y a una vista FOCUS de 300 px, ambas reescaladas de 236 a 224 px; no hay cámara de muñeca.
- Entrada de estado de velocidad lineal de ambas muñecas, normalizada por q99 y discretizada en 256 bins como tokens de estado.
- Salida de acciones de 32 dimensiones y chunks de 30 pasos, con poses relativas de muñecas y pulgar izquierdo, mano derecha absoluta y 14 articulaciones de brazo para IK.
- Ejecución de una secuencia de cinco pasos; no es razonamiento multi-paso general ni un agente conversacional.
- No se documenta soporte de tool calling, function calling, agentes, generación de texto libre, audio, thinking mode ni visión general.
- No se declara soporte multilingüe; las instrucciones de tarea están en inglés en los ejemplos.

## Casos de uso

- Automatización de pipeteo en laboratorio con Unitree G1: el modelo ejecuta los cinco pasos de la tarea con un único checkpoint y selecciona cada paso mediante la frase del prompt. Es adecuado porque la política está entrenada específicamente para esa secuencia bimanual y para ese robot.
- Baseline de investigación en políticas VLA bimanuales: sirve para comparar representaciones de acción relativa frente a absoluta, o para estudiar el efecto de añadir estado de velocidad. La comparación directa con run A está publicada en la model card.
- Estudio de desambiguación de acciones: el paso 3, introducir y sacar la pipeta del tubo, es ambiguo con pose sola; run D permite analizar si la velocidad de muñeca separa acercamiento y separación. El autor reporta 68 % frente a 94 % en un análisis kNN, no en bucle cerrado.
- Evaluación offline antes de desplegar en robot: el checkpoint incluye 960 muestras de holdout y MSE de acciones normalizadas, lo que permite comparar variantes y detectar regresiones antes de una prueba física.
- Despliegue en banco de pruebas con starVLA: el servidor `deployment/model_server/server_policy_gr00t_zmq.py --focus_view small` construye la vista FOCUS y recibe peticiones por ZMQ. El cliente debe enviar `state.wrist_vel` calculado exactamente como se define.
- Adaptación a tareas de laboratorio similares: al estar fine-tuneado desde PI0.5, puede servir como punto de partida para otras secuencias de pipeteo o manipulación bimanual, siempre que se disponga de datos de teleoperación y se reproduzca el preprocesado.
- Análisis de ablación de entradas de estado: run D frente a run A permite cuantificar el efecto de la velocidad de muñeca en el error offline y en la dirección de movimiento, con el mismo dataset y receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no son aplicables a una política de acciones. La única métrica publicada es el MSE de holdout sobre 960 muestras de acciones normalizadas, menor es mejor:

| Paso de optimizador | Run A (ego + focus) | Run D (+ velocidad) |
|---|---|---|
| 1.800 | 0,0447 | 0,0410 |
| 3.600 | 0,0400 | 0,0337 |
| 5.400 | 0,0386 | 0,0348 |
| 7.200 | 0,0370 | 0,0339 |
| 9.000 | 0,0354 | 0,0340 |
| 10.800 | 0,0355 | 0,0316 |
| 12.600 | 0,0338 | 0,0312 |
| 14.400 | 0,0351 | 0,0317 |
| 16.200 | 0,0353 | 0,0322 |

El mejor valor de run D fue 0,0312 en el paso 12.600, pero ese checkpoint no se guardó por falta de disco. El release es el paso 17.931, que no fue evaluado por separado; la última evaluación, en el paso 16.200, dio 0,0322. Estas puntuaciones son offline sobre teleoperación y el propio autor advierte que la velocidad de muñeca contiene la dirección del movimiento futuro, por lo que es esperable un error offline menor. La política no se ha ejecutado en el robot.

| Análisis de dirección en paso 3 | Acierto a 0,5 s |
|---|---|
| Pose de muñeca y mano sola | 68 % |
| Pose + velocidad de muñeca | 94 % |

Este análisis es un kNN leave-one-episode-out sobre 49 episodios de teleoperación del paso 3; no es una métrica de éxito de la política.

## Requisitos de hardware

- Pesos: 8,3 GB en bf16. La VRAM de inferencia no está medida; con dos vistas de 224×224, activaciones y el bucle de acciones, una estimación prudente es 24 GB. Con 16 GB no está confirmado y requeriría optimizaciones no documentadas.
- GPU recomendadas: RTX 4090 o RTX 3090 de 24 GB, L4 o A10G de 24 GB, A100 de 40/80 GB y H100. Para entrenamiento se usaron 4 GPU, pero no se especifica el modelo.
- GPU de consumo: sí en tarjetas de 24 GB; en 16 GB no hay confirmación. No se documenta ejecución en CPU.
- Despliegue: servidor starVLA con `deployment/model_server/server_policy_gr00t_zmq.py --focus_view small` sobre ZMQ. No aplican vLLM, llama.cpp, Ollama o TGI para este tipo de política; es un stack de robótica, no un servidor de texto.
- Latencia y throughput: no disponible. El chunk de 30 pasos puede amortizar la inferencia, pero no se publican cifras.
- Disco: 8,3 GB de pesos más configuraciones, estadísticas y logs.
- Robot: Unitree G1 con manos Inspire. El puente del lado del robot que envía `state.wrist_vel` no forma parte de este release.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Run D (este modelo) | No disponible; checkpoint de 8,3 GB en bf16 | No disponible | Mejor MSE 0,0312; 0,0322 en el paso 16.200 | Términos del PI0.5 base | Hugging Face público |
| Run A (`starvla-pipette-5task-v6-pi05-egofocus`) | No disponible | No disponible | Mejor MSE 0,0338; 0,0353 en el paso 16.200 | Términos del PI0.5 base | Hugging Face público |
| PI0.5 base (openpi) | No disponible | No disponible | No evaluado en esta tarea | Términos de PI0.5/openpi | Base openpi; URL no disponible en la model card |

No se dispone de comparación con otras políticas VLA para el mismo robot y la misma tarea en la información proporcionada. La comparación principal es la ablación run A frente a run D, que comparte dataset, vistas y receta salvo la entrada de velocidad.

## Limitaciones y advertencias

- La política no se ha ejecutado en el robot; no hay tasa de éxito en bucle cerrado ni evaluación física de la inserción.
- El mejor checkpoint, paso 12.600 con MSE 0,0312, no se guardó por falta de disco. El release es el paso 17.931, no evaluado; la última métrica es del paso 16.200.
- Las métricas son MSE offline sobre acciones normalizadas en teleoperación; no miden éxito de tarea. El propio autor señala que la velocidad de muñeca puede reducir el error offline porque contiene la dirección del movimiento futuro.
- El modelo cubre una única familia de tarea, un único robot y un único montaje. No es un modelo general de manipulación ni un VLA multitarea.
- Dependencia exacta de `state.wrist_vel`: 6 valores en m/s, ventana de 0,2 s a 60 fps y cinemática directa de articulaciones medidas. El puente que envía ese valor no se publica; si falta o se calcula distinto, la política queda fuera de distribución.
- La vista FOCUS depende de un overlay no público. Reproducir el preprocesado exacto requiere ese overlay o reimplementar la ventana de 300 px alrededor del objetivo.
- No hay cámara de muñeca; la percepción depende de la cámara ego y de la ventana FOCUS. Oclusiones o errores de localización del objetivo no se cuantifican en la información disponible.
- La licencia no está declarada en la ficha de Hugging Face; se aplican los términos del PI0.5 base. Es necesario verificar la licencia de openpi antes de un uso comercial.
- No se documenta un análisis de sesgos. El dataset procede de teleoperación en un entorno y un estilo de operador concretos, por lo que iluminación, fondo, posición de objetos y estilo de demostración pueden sesgar la política.
- No aplica el concepto de alucinación textual porque el modelo no genera texto libre; el riesgo equivalente son acciones incorrectas, fallos de inserción o selección errónea del paso.
- No se declara soporte multilingüe; las frases de tarea de los ejemplos están en inglés.
- Solo se publica bf16; no hay versiones cuantizadas ligeras ni formato GGUF.
- Es un sistema bimanual con un robot físico. Cualquier despliegue requiere límites de par, parada de emergencia, validación de colisiones y supervisión; la model card no documenta estas medidas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/jren313/starvla-pipette-5task-v6d-pi05-egofocusvel)
- [Run A en Hugging Face](https://huggingface.co/jren313/starvla-pipette-5task-v6-pi05-egofocus)
- [Dataset g1-pipette-2view-teleop0925-5task-eerel](https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel)
- Overlay de la vista FOCUS: no público, no se proporciona enlace.
- Repositorio openpi de PI0.5: no se proporciona URL en la model card; no disponible.
- Paper, blog o demo: no disponible en la información proporcionada.
