# Pipe1213/act_obj_t1_n20_s3

## Resumen

ACT obj t1 n20 s3 es una política de imitación entrenada desde cero para una única tarea de manipulación robótica en simulación: "coger la salsa barbacoa y colocarla en la cesta", correspondiente a la tarea 3 del benchmark LIBERO-Object. Lo desarrolla el usuario Pipe1213 como parte del estudio reproducible vla-vs-scratch, que compara una política entrenada desde cero (ACT) con un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) sobre exactamente las mismas 20 demostraciones por tarea. No es un modelo de propósito general: se publica para hacer reproducible el estudio, no para reutilizarse como política generalista.

Técnicamente es una implementación de Action Chunking with Transformers (ACT, Zhao et al. 2023) con la configuración por defecto de LeRobot: 51.671.687 parámetros, encoder de imágenes ResNet-18 inicializado con pesos de ImageNet, predicción de bloques de 100 acciones y entrenamiento desde cero del resto de la red sobre 20 episodios del dataset lerobot/libero. En evaluación se replanifica cada 10 acciones en lugar de ejecutar el bloque completo.

Su relevancia es metodológica: proporciona un punto de comparación controlado y con intervalos de confianza sobre el rendimiento de ACT en regímenes de pocas demostraciones (few-shot), y documenta un fenómeno práctico importante: checkpoints del mismo entrenamiento rinden de forma muy distinta (52 % en el paso 6.000 frente a 10-12 % en los pasos 8.000 y 10.000), lo que obliga a evaluar cada checkpoint antes de usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual ResNet-18 y cabeza de acciones por chunks |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación con observaciones de imagen y estado, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada por el entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot; checkpoints en `checkpoints/<step>/pretrained_model`) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (imágenes de 256x256 píxeles y estado del robot) a un chunk de 100 acciones, con un encoder visual ResNet-18 inicializado desde pesos de ImageNet y el resto de la red entrenada desde cero. La innovación central de ACT es la predicción de bloques de acciones (action chunking), que reduce el error de compounding y suaviza la ejecución; en este modelo, además, en evaluación se replanifica cada 10 acciones en lugar de ejecutar el chunk completo, lo que es el único cambio respecto a los valores por defecto de LeRobot.

El entrenamiento usa 20 episodios del dataset lerobot/libero (revisión a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4; episodios 812, 824, 843, 849, 853, 871, 889, 893, 932, 968, 973, 988, 1005, 1067, 1077, 1089, 1135, 1181, 1231 y 1235), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 3000. Se empleó LeRobot 0.6.2 (commit b9cb121cb7d4e3e26ec5c906d08dda68d151ba52) y el cómputo total fue de 0,37 horas en una RTX 4050 de portátil con 6 GB de VRAM. No se documenta RLHF, DPO ni ajuste fino posterior; es imitación supervisada pura sobre demostraciones.

## Capacidades

- Generación de acciones de manipulación robótica en simulación para una única tarea: coger la salsa barbacoa y depositarla en la cesta (LIBERO-Object, task id 3).
- Predicción de chunks de 100 acciones con replanificación cada 10 acciones durante la evaluación.
- Procesamiento de observaciones visuales RGB a 256x256 píxeles junto con el estado del robot.
- Ejecución en el simulador MuJoCo a través del entorno `libero` de LeRobot.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; su "razonamiento" es la política de control aprendida.
- No tiene capacidades multilingües ni entrada de lenguaje natural: la tarea está codificada implícitamente en los pesos.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la observación visual propia del entorno.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: sirve como referencia ACT entrenada desde cero con 20 demostraciones para comparar contra SmolVLA en las mismas condiciones; se usa cargando el checkpoint con `lerobot-eval` y el entorno `libero`.
- Línea base en experimentos de imitación few-shot: permite medir cuánto rinde ACT con 20 episodios frente a variantes con 10, 30 o 50 demostraciones, ya que los conjuntos del estudio están anidados.
- Análisis de estabilidad de checkpoints: útil para estudiar por qué checkpoints del mismo entrenamiento difieren tanto (52 % frente a 10-12 %), un fenómeno documentado en 30 de 36 ejecuciones ACT del estudio.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (0,6 GB, 52 M de parámetros) que se entrena en 0,37 h en una GPU de portátil, adecuado para prácticas de LeRobot.
- Validación de pipelines de evaluación en LIBERO: con 50 escenas iniciales fijas y semilla 1000, sirve para comprobar la infraestructura de evaluación antes de lanzar experimentos mayores.
- Estudio de la brecha entre políticas desde cero y VLA preentrenados: al ser una de las 60 políticas del estudio, permite aislar el efecto del preentrenamiento (con las cautelas que el propio autor señala sobre diferencias de tamaño, arquitectura y entrada de lenguaje).
- Referencia para calibración de intervalos de confianza: el modelo publica su tasa de éxito con intervalo de Wilson al 95 % (18-32 %), útil como ejemplo de reporte estadístico riguroso en robótica.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (estados iniciales 0 a 49), imágenes de 256x256, replanificación cada 10 acciones, semilla de evaluación 1000 y renderizado MuJoCo en CPU.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 26 de 50 | 52 % |
| 8.000 | 5 de 50 | 10 % |
| 10.000 (raíz del repo) | 6 de 50 | 12 % |
| Media de los 3 checkpoints | 37 de 150 | 24,7 % (intervalo de Wilson 95 %: 18-32 %) |

Contexto agregado del estudio (3 tareas y todas las semillas): ACT con 20 demostraciones por tarea obtuvo 33,1 % y SmolVLA con las mismas demostraciones, 74,2 %. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 51,7 M de parámetros (unos 0,2 GB en fp32) más el encoder ResNet-18 y el búfer de observaciones. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos 6 GB; el entrenamiento documentado se hizo en una RTX 4050 de portátil con 6 GB. Para evaluación, una GPU modesta es suficiente; el renderizado MuJoCo puede ejecutarse en CPU.
- Cabe en GPU consumer: sí, sin problema (RTX 3050/4050/4060 y superiores).
- Opciones de despliegue: LeRobot (`lerobot-eval`) con el entorno `libero`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El coste dominante en evaluación es el renderizado del simulador MuJoCo en CPU, no la inferencia de la red.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto / entrada | Tasa de éxito (estudio, 20 demos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ACT obj t1 n20 s3 (este) | 51,7 M | ACT desde cero, 1 tarea | Imagen 256x256 + estado; sin lenguaje | 24,7 % (media de 3 checkpoints) | apache-2.0 | Hugging Face, LeRobot |
| ACT (agregado del estudio, 3 tareas) | 51,7 M | ACT desde cero | Imagen + estado; sin lenguaje | 33,1 % | apache-2.0 | Estudio vla-vs-scratch |
| SmolVLA ajustado (mismas demos) | no disponible en la información | VLA preentrenado + fine-tuning | Imagen + estado + lenguaje | 74,2 % | no disponible en la información | Estudio vla-vs-scratch |
| Otros checkpoints ACT del estudio | 51,7 M | ACT desde cero | Imagen + estado | Variable (52 % en el paso 6.000 de esta ejecución) | apache-2.0 | Repositorio del estudio |

La comparación directa con SmolVLA debe interpretarse con cautela: los dos métodos difieren no solo en el preentrenamiento, sino también en tamaño, arquitectura y entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- No es una política de propósito general: la tarea está fijada por el entrenamiento y no acepta instrucciones en lenguaje natural.
- La comparación con SmolVLA no aísla el efecto del preentrenamiento, porque los modelos difieren en tamaño, arquitectura y modalidad de entrada.
- Las 3 tareas del estudio se eligieron entre tareas de LIBERO-Object que un checkpoint publicado de SmolVLA ya resolvía, lo que sesga los resultados hacia esas tareas.
- Los estados y acciones se normalizan con estadísticas de todo el dataset lerobot/libero, no solo de las demostraciones seleccionadas, lo que puede introducir desajustes de escala.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para esta tarea.
- Alta varianza entre checkpoints del mismo entrenamiento: en 30 de 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta; es imprescindible evaluar el checkpoint concreto antes de usarlo.
- El intervalo de Wilson publicado cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.
- Riesgo de alucinación y sesgos: no aplican en el sentido de los LLM, pero la política puede fallar de forma impredecible fuera de las condiciones de las demostraciones.
- Licencia apache-2.0: permite uso comercial y modificación con atribución; aun así, el autor desaconseja explícitamente su uso como política generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t1_n20_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset lerobot/libero: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot (framework): no disponible en la información proporcionada
