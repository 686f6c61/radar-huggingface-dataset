# rtrtwrw/act_chess_c3_to_d5_10ep_step4000

## Resumen

`rtrtwrw/act_chess_c3_to_d5_10ep_step4000` es una política de imitación robótica basada en ACT (Action Chunking with Transformers) publicada en HuggingFace dentro del ecosistema LeRobot. No es un modelo de lenguaje: es un controlador visuomotor entrenado desde cero para que un brazo seguidor SO-101 ejecute una tarea concreta de manipulación sobre un tablero de ajedrez, moviendo una pieza desde la casilla c3 (a 6 cm) hasta la casilla d5 (a 10 cm). La entrada es visual y propioceptiva (tres cámaras a 480x640 más el estado de 6 articulaciones) y la salida son acciones de 6 articulaciones.

El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB en safetensors. Se entrenó con LeRobot 0.5.1 sobre un conjunto reducido: los 10 episodios más cortos del dataset `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741`, que suman 3.422 frames. El checkpoint publicado corresponde al paso 4.000 de un entrenamiento total de 16.000 pasos con batch de 24, por lo que es un checkpoint intermedio y no el resultado final del entrenamiento.

Su relevancia es acotada y muy específica: sirve como referencia reproducible de un pipeline ACT completo sobre SO-101 (dataset, entrenamiento, checkpoint y comando de carga), y como baseline para estudiar el efecto del número de pasos y del volumen de datos en políticas de imitación de bajo coste. No cuenta con descargas ni valoraciones, no declara licencia y no aporta resultados de benchmarks, por lo que no debe tratarse como un modelo validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visuomotora con encoder visual, estado propioceptivo y decoder transformer de acciones; entrenada desde cero con LeRobot 0.5.1 |
| Parametros totales | 51.668.614 (≈51,7 M), dato real del safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: no hay contexto textual; la entrada es de 3 cámaras a 480x640 más estado de 6 articulaciones. Horizonte de chunking no disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se han publicado versiones cuantizadas ni exportaciones ONNX) |
| Idiomas soportados | No aplica / no disponible: el modelo no procesa lenguaje natural |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tipo de modelo | Política robótica (pipeline `robotics`), no modelo generativo de texto |
| Entrada | 3 cámaras RGB a 480x640 + estado de 6 articulaciones |
| Salida | Acciones de 6 articulaciones |
| Hardware objetivo | Brazo seguidor SO-101 |
| Dataset de entrenamiento | `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` (10 episodios, 3.422 frames) |
| Checkpoint | Paso 4.000 de 16.000; batch 24 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-17 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un componente generativo tipo CVAE con un transformer que predice bloques ("chunks") de acciones futuras en lugar de una sola acción por paso. En esta ficha, el modelo sigue ese esquema: un encoder visual procesa tres vistas simultáneas a 480x640, el estado de 6 articulaciones se incorpora como condicionamiento y la cabeza de acciones emite comandos de 6 articulaciones. La configuración concreta (número de capas, dimensión del modelo, tamaño del chunk, backbone visual, uso de historial temporal) no está publicada en la información disponible. La única cifra arquitectónica verificable es el total de 51.668.614 parámetros.

El entrenamiento se realizó desde cero con LeRobot 0.5.1 sobre el brazo SO-101, usando exclusivamente los 10 episodios más cortos del dataset (longitudes 19, 12, 14, 10, 18, 15, 20, 9, 16 y 28 episodios de demostración, equivalentes a 3.422 frames). El checkpoint publicado es el paso 4.000 de 16.000 con batch 24, es decir, aproximadamente el 25 % del entrenamiento previsto. No se documenta ningún proceso de RLHF, DPO ni refinamiento por refuerzo, lo cual es esperable en una política de imitación supervisada. Tampoco se detallan la composición exacta del dataset, los datos de aumento, la tasa de aprendizaje, la semilla ni las curvas de pérdida, por lo que no es posible evaluar la convergencia ni el grado de sobreajuste a partir de la información disponible.

## Capacidades

- Manipulación visuomotora de una pieza de ajedrez: ejecución de un movimiento de recogida y colocación desde la casilla c3 (6 cm) hasta la casilla d5 (10 cm) con un brazo SO-101.
- Control de 6 articulaciones a partir de estado propioceptivo de 6 dimensiones.
- Percepción multi-cámara: fusión de tres vistas RGB a 480x640 en una única política.
- Aprendizaje por imitación puro: reproduce el estilo y la trayectoria de las demostraciones del dataset, sin módulo de planificación explícito.
- Ejecución de políticas de acción chunking (predicción de secuencias de acciones), lo que reduce la frecuencia de inferencia necesaria frente a políticas paso a paso.
- Integración directa con el stack LeRobot, incluyendo carga remota del checkpoint mediante `--policy.path`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso simbólico ni agentes basados en lenguaje.
- No tiene capacidades multilingües: no procesa ni genera texto.
- No dispone de modo "thinking", visión general, audio ni ninguna otra capacidad multimodal fuera del pipeline robótico descrito.

## Casos de uso

- Reproducción de un pick-and-place sobre tablero: cargar el checkpoint con `lerobot-record --policy.path=rtrtwrw/act_chess_c3_to_d5_10ep_step4000` sobre un SO-101 calibrado para replicar el movimiento c3→d5; es el uso literal para el que fue entrenado y el único escenario con cobertura directa en los datos.
- Baseline de comparación de checkpoints ACT: al ser un checkpoint intermedio (paso 4.000 de 16.000), permite medir la curva de mejora frente a checkpoints posteriores del mismo entrenamiento con el mismo dataset y configuración de evaluación.
- Estudio de eficiencia de datos en imitación: con solo 10 episodios y 3.422 frames, sirve para analizar cuánto rendimiento se obtiene con un dataset mínimo antes de invertir en recolección adicional de demostraciones.
- Punto de partida para fine-tuning: reentrenar o ajustar la política sobre variantes de la tarea (otras casillas, otras alturas de pieza, otro tablero) partiendo de estos pesos en lugar de inicializar desde cero.
- Validación del pipeline hardware/software: probar calibración de las tres cámaras a 480x640, sincronización con el estado de 6 articulaciones y latencia del bucle de control en LeRobot antes de lanzar entrenamientos largos.
- Docencia y demostraciones de aprendizaje por imitación: ejemplo completo y ligero (0,2 GB, 51,7 M de parámetros) para prácticas de robótica en las que se muestre el ciclo dataset → entrenamiento → evaluación con un brazo de bajo coste.
- Pruebas de robustez controladas: evaluar la degradación de la política ante cambios de iluminación, posición inicial de la pieza o ligera desviación de la calibración de las cámaras, al ser un modelo entrenado con muy pocas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito, número de ensayos de evaluación, error de posición final ni comparación con otros checkpoints o políticas. Tampoco se aportan métricas de pérdida de entrenamiento ni de validación. Al tratarse del paso 4.000 de 16.000, cualquier valor de rendimiento medido sobre este checkpoint correspondería a un estado intermedio del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (los pesos son 51,7 M de parámetros, ≈207 MB en FP32 y ≈103 MB en BF16/FP16, más activaciones de las tres cámaras a 480x640). Estimación propia a partir del recuento de parámetros; no publicada por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para inferencia (GTX 1650, RTX 3060, RTX 4060, RTX 4090). No se requieren A100 ni H100.
- Cabe en GPU consumer: sí, con margen amplio; también es viable en CPU para pruebas de integración, aunque con mayor latencia.
- Entrenamiento: con 51,7 M de parámetros y batch 24, un entrenamiento de este tipo es asumible en una única GPU consumer de 12 GB o más (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090). Estimación, no confirmada por el autor.
- Opciones de despliegue: LeRobot 0.5.1 (scripts `lerobot-record` y utilidades de evaluación asociadas) sobre PyTorch. No se han publicado exportaciones a ONNX, TensorRT, GGUF ni versiones para llama.cpp, Ollama, vLLM o TGI, que además no aplican a este tipo de política.
- Latencia y throughput: no disponibles. No se documenta la frecuencia de control alcanzada, el tiempo de inferencia por chunk ni el rendimiento en Hz.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rtrtwrw/act_chess_c3_to_d5_10ep_step4000` (este modelo) | 51,7 M | 3 cámaras 480x640 + estado de 6 articulaciones | Pick-and-place c3→d5 en SO-101 | No disponible | Público en HuggingFace, 0 descargas |
| Otros checkpoints ACT del mismo autor o dataset | No disponible | Configuración equivalente según model card | Misma tarea, distinto paso de entrenamiento | No disponible | No disponible en la información consultada |
| Política ACT genérica de LeRobot | No disponible | Variables según configuración | Manipulación diversa | No disponible | Disponible en el ecosistema LeRobot |
| Diffusion Policy (alternativa de imitación) | No disponible | Variables según configuración | Manipulación diversa | No disponible | Implementaciones públicas en el ecosistema LeRobot |
| Modelos VLA con instrucciones en lenguaje (p. ej. familias tipo SmolVLA o pi0) | Aproximadamente cientos de millones a miles de millones, según variante (valor de referencia general, no verificado en la información proporcionada) | Visión + instrucción textual + estado | Manipulación guiada por lenguaje | Variable según modelo | Público, con requisitos de hardware muy superiores |

La comparación relevante para este checkpoint es interna al ecosistema LeRobot: ACT y Diffusion Policy compiten como métodos de imitación ligeros para brazos de bajo coste como el SO-101, mientras que los modelos VLA aportan condicionamiento por lenguaje a cambio de un coste computacional mucho mayor. No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 4.000 de 16.000, por lo que su rendimiento no representa el del entrenamiento completo y probablemente sea inferior al de checkpoints posteriores.
- Dataset muy reducido: 10 episodios y 3.422 frames son insuficientes para esperar generalización; es previsible un sobreajuste a las condiciones exactas de las demostraciones (posición de la mesa, iluminación, altura de cámara, posición inicial de la pieza).
- Tarea única y no parametrizada: la política está entrenada para un movimiento concreto (c3 a 6 cm hacia d5 a 10 cm); no acepta instrucciones ni objetivos variables en tiempo de ejecución.
- Sin capacidades de lenguaje: no admite prompts, tool calling, agentes ni razonamiento multi-paso; cualquier uso conversacional es inviable.
- Sensibilidad a la calibración: al depender de tres cámaras a 480x640 y del estado de 6 articulaciones, pequeñas desviaciones de calibración o cambios de montaje pueden degradar la ejecución.
- Riesgo de alucinación en sentido figurado: al ser una política generativa de acciones, puede producir trayectorias plausibles pero incorrectas ante estados fuera de distribución, sin mecanismo explícito de detección de fallo ni de recuperación.
- Licencia no disponible: la ausencia de licencia declarada impide asumir permisos de uso comercial, modificación o redistribución; es un bloqueo objetivo para producción.
- Sin validación externa: 0 descargas y 0 likes, sin resultados de benchmarks ni tasas de éxito publicadas; no hay evidencia independiente de funcionamiento.
- Sin información de seguridad: no se documentan paradas de emergencia, límites de par, espacios de trabajo seguros ni protocolos de recuperación ante colisiones, aspectos críticos al operar un brazo real.
- Idiomas: no aplica; cualquier expectativa de soporte multilingüe es incorrecta para este tipo de modelo.
- Fechas del repositorio y del dataset (2026) provienen de los metadatos tal cual se publicaron; no se ha verificado su correspondencia con el entrenamiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rtrtwrw/act_chess_c3_to_d5_10ep_step4000
- Dataset de entrenamiento: https://huggingface.co/datasets/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741
- LeRobot (librería y scripts de entrenamiento/evaluación): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Artículo original de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos corresponden a servicios de chat sin relación con robótica ni con el repositorio.
