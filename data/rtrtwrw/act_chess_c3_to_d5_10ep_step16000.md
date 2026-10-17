# rtrtwrw/act_chess_c3_to_d5_10ep_step16000

## Resumen

`rtrtwrw/act_chess_c3_to_d5_10ep_step16000` es una política robótica entrenada con ACT (Action Chunking Transformer) mediante LeRobot 0.5.1 sobre un brazo seguidor SO-101. No es un modelo de lenguaje: su única función es convertir observaciones visuales y propioceptivas en comandos motores de 6 articulaciones para ejecutar una tarea de manipulación muy concreta, trasladar una pieza de ajedrez desde la casilla c3 (situada a 6 cm) hasta la casilla d5 (a 10 cm). El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB.

El entrenamiento se realizó desde cero (no es un fine-tuning de un VLA preentrenado) con 3 cámaras a resolución 480x640 y un vector de estado/acción de 6 articulaciones. El checkpoint corresponde al paso 16.000 de 16.000 con batch de 24, y se entrenó exclusivamente con los 10 episodios más cortos del dataset `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` (episodios de 19, 12, 14, 10, 18, 15, 20, 9, 16 y 28 episodios/frames según la model card), lo que suma 3.422 frames.

Su interés práctico es acotado pero real: sirve como ejemplo reproducible y de muy bajo coste computacional de un pipeline completo de imitation learning con LeRobot, útil para validar integraciones de hardware, calibración de cámaras y flujos de entrenamiento/inferencia antes de escalar a datasets mayores. Conviene señalar que el repositorio no tiene descargas ni valoraciones, no declara licencia y no publica métricas de éxito, por lo que no debe considerarse un artefacto validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer); política visomotora de imitation learning basada en transformer que predice trozos de acción (*action chunks*) |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido de ventana de texto. La model card no especifica horizonte de observación ni longitud de chunk de acción |
| Tipos de cuantizacion | No disponible. Pesos distribuidos en safetensors (repositorio de 0,2 GB, compatible con precisión completa fp32) |
| Idiomas soportados | No aplica: no procesa ni genera lenguaje natural |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors, empaquetado para la librería `lerobot` |
| Entrada | 3 cámaras a 480x640 + estado de 6 articulaciones |
| Salida | Acción de 6 articulaciones |
| Entorno robótico | SO-101 (brazo seguidor, *follower*) |
| Librería / versión | LeRobot 0.5.1 |
| Dataset de entrenamiento | `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741`, subconjunto de 10 episodios (3.422 frames) |
| Checkpoint | Paso 16.000 de 16.000, batch 24 |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de imitation learning diseñada para manipulación robótica de precisión: en lugar de predecir una acción por paso de control, predice una secuencia o *chunk* de acciones futuras a partir de las observaciones actuales, lo que reduce el error acumulado y suaviza la ejecución. En este caso concreto, el modelo consume tres flujos de imagen a 480x640 junto con el estado de 6 articulaciones del SO-101 y produce el vector de acción de 6 articulaciones que el brazo seguidor ejecuta. El repositorio no detalla la configuración interna (número de capas, dimensión del modelo, tamaño del chunk, presencia o no del encoder CVAE habitual en ACT), por lo que esos hiperparámetros deben considerarse no disponibles.

El entrenamiento se hizo desde cero con LeRobot 0.5.1, sin inicialización desde un checkpoint preentrenado, durante 16.000 pasos con batch de 24. El dataset utilizado es deliberadamente mínimo: los 10 episodios más cortos de una colección de demostraciones de ajedrez, con longitudes de 19, 12, 14, 10, 18, 15, 20, 9, 16 y 28, sumando 3.422 frames. La model card no menciona uso de RLHF, DPO ni ninguna fase de refinamiento por refuerzo, ni aporta datos sobre aumento de datos, composición de la distribución de demostraciones o criterios de parada. El prefijo `step16000` junto a la indicación "checkpoint intermedio" resulta ambiguo, ya que el paso indicado coincide con el total declarado.

## Capacidades

- Generación de acciones motoras de 6 articulaciones para un brazo SO-101 a partir de entrada visual multi-cámara (3 vistas a 480x640) y estado propioceptivo.
- Ejecución de una tarea única y específica: pick-and-place de una pieza de ajedrez desde c3 (6 cm) hasta d5 (10 cm).
- Control visomotor de precisión milimétrica dentro del espacio de trabajo para el que fue entrenado.
- Inferencia en bucle cerrado con retroalimentación visual continua (no es un modelo de planificación en un solo paso).
- Integración directa con el ecosistema LeRobot: carga mediante `--policy.path=rtrtwrw/act_chess_c3_to_d5_10ep_step16000` en `lerobot-record`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, planificación simbólica ni uso como agente.
- No tiene capacidades multilingües, de visión general, audio, matemáticas ni generación de texto.
- No dispone de modo "thinking" ni de mecanismos de razonamiento explícito.

## Casos de uso

- **Reproducción de la tarea de referencia en laboratorio**: ejecutar el pick-and-place c3→d5 sobre un SO-101 con la misma disposición de 3 cámaras a 480x640, para verificar que la cadena dataset-entrenamiento-inferencia funciona de extremo a extremo con 3.422 frames de demostración.
- **Punto de partida para fine-tuning en tareas de pick-and-place**: al ser un ACT de 51,7 M de parámetros entrenado desde cero, sirve como configuración base para reentrenar con un dataset propio de mayor tamaño sobre el mismo brazo, sin necesidad de GPUs de gama alta.
- **Pruebas de integración de hardware y calibración**: validar la sincronización de 3 cámaras a 480x640 con la lectura de estado de 6 articulaciones y detectar desalineaciones de calibración antes de invertir en un dataset grande.
- **Docencia y formación en imitation learning**: ejemplo compacto (0,2 GB) y de inferencia barata para ilustrar el ciclo completo de una política ACT en un curso o taller de robótica con LeRobot, incluyendo reproducción de episodios y análisis de fallos.
- **Estudio del sobreajuste con datasets pequeños**: con solo 10 episodios y 3.422 frames, es un caso útil para medir cómo varía la tasa de éxito al aumentar el número de demostraciones o al aplicar aumentación de datos.
- **Benchmark interno de latencia y throughput**: permite medir el coste por paso de control de una política ACT de 51,7 M de parámetros en distintas GPUs (incluidas consumer) midiendo el bucle cámara→inferencia→acción.
- **Validación de pipelines de CI para políticas robóticas**: al ser un repositorio safetensors pequeño y con una API de carga estable (`lerobot-record --policy.path=...`), sirve como caso de prueba para verificar que un pipeline automatizado descarga, carga y ejecuta políticas correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, número de ensayos de evaluación, error de posición final, ni comparación con otros checkpoints del mismo dataset. Tampoco se aportan métricas de pérdida de entrenamiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los 51.668.614 parámetros ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16/bf16. Con las 3 cámaras a 480x640 y las activaciones del transformer, el consumo total es del orden de 1-3 GB (estimación a partir del tamaño del modelo; no verificada por el autor).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente. No requiere A100 ni H100; una RTX 3060, RTX 4060 o RTX 4090 está sobradamente capacitada. Incluso una GTX 1650 o una iGPU moderna pueden ejecutar la política.
- **Cabe en GPU consumer**: sí, en prácticamente cualquier GPU consumer de los últimos años, y previsiblemente también en CPU para inferencia a baja frecuencia (no documentado por el autor).
- **Opciones de despliegue**: la vía soportada es LeRobot (`lerobot-record` con `--policy.path`). vLLM, TGI, llama.cpp u Ollama no aplican a este tipo de política; no hay soporte documentado de exportación a ONNX o TensorRT en la información disponible.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones del bucle de control para este checkpoint concreto. Como referencia general de la familia ACT en GPUs consumer se suele operar en el rango de 10-30 Hz, pero se trata de una estimación de la arquitectura, no de un dato de este modelo.
- **Almacenamiento**: 0,2 GB de repositorio, más el espacio del dataset de demostraciones si se va a reentrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rtrtwrw/act_chess_c3_to_d5_10ep_step16000` (este) | 51,7 M | 3 cámaras 480x640 + estado de 6 articulaciones | No publicado | No disponible | HuggingFace (0 descargas, 0 likes) |
| Otros checkpoints ACT del mismo autor (`act_chess_*`) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Políticas ACT de referencia sobre ALOHA / SO-101 | No disponible en esta ficha (del orden de decenas de millones en la familia ACT) | Entrada multi-cámara + estado de articulaciones | No disponible | Habitualmente MIT en los repositorios de referencia (verificar) | Repositorios públicos de LeRobot y del paper original |
| Diffusion Policy (alternativa de imitation learning) | No disponible | Entrada visual + estado; predice trayectorias por difusión | No disponible | No disponible | Implementaciones públicas en el ecosistema LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a naturaleza arquitectónica y disponibilidad.

## Limitaciones y advertencias

- **Dataset mínimo**: 10 episodios y 3.422 frames es un volumen muy reducido; el riesgo de sobreajuste a las condiciones exactas de las demostraciones es alto.
- **Tarea única**: la política solo sabe ejecutar c3→d5. No generaliza a otras casillas, orientaciones de pieza ni objetos distintos sin reentrenamiento.
- **Dependencia del montaje**: cambios en la posición de las 3 cámaras, la iluminación, la altura de la mesa o la calibración del SO-101 degradarán previsiblemente el comportamiento.
- **Sin métricas de evaluación**: no hay tasa de éxito ni número de ensayos publicados, por lo que no es posible afirmar que la tarea se complete de forma fiable.
- **Licencia no declarada**: la ausencia de licencia impide asumir derechos de uso comercial; hay que contactar con el autor antes de cualquier explotación.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; el artefacto no ha sido reproducido por terceros.
- **Ambigüedad del checkpoint**: la model card lo describe como "checkpoint intermedio" pero indica paso 16.000 de 16.000, lo que conviene verificar antes de tratarlo como modelo final.
- **Sin capacidades lingüísticas ni de razonamiento**: no debe emplearse en casos de uso de NLP, agentes o tool calling; cualquier expectativa en ese sentido es un error de categoría.
- **Riesgo de fallo físico**: al controlar un brazo real, una política no validada puede provocar colisiones o daños; se recomienda ejecutar con límites de par, parada de emergencia y espacio de trabajo despejado.
- **Sesgos**: no aplica el concepto habitual de sesgo lingüístico, pero sí un sesgo de distribución hacia las trayectorias y posiciones presentes en las 10 demostraciones.
- **Sin información sobre alucinación**: el término no es aplicable; el modo de fallo relevante es la ejecución de una trayectoria incorrecta, no la generación de contenido falso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rtrtwrw/act_chess_c3_to_d5_10ep_step16000
- Dataset de entrenamiento: https://huggingface.co/datasets/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741
- LeRobot (librería y repositorio): https://github.com/huggingface/lerobot
- Paper original de ACT / ALOHA: https://arxiv.org/abs/2304.13705
- Perfil del autor: https://huggingface.co/rtrtwrw
