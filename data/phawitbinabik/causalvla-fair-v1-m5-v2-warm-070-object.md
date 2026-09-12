# phawitbinabik/causalvla-fair-v1-m5-v2-warm-070-object

## Resumen

`causalvla-fair-v1-m5-v2-warm-070-object` es una política de robótica de tipo vision-language-action (VLA) entrenada con LeRobot por el usuario `phawitbinabik`. No es un modelo de lenguaje: consume dos flujos de imagen (cámara frontal y muñeca) más el estado propioceptivo del robot y emite una acción de 7 grados de libertad. El checkpoint tiene 450.046.176 parámetros (aproximadamente 450 M) y se distribuye en formato safetensors dentro del ecosistema LeRobot.

El modelo se ha entrenado exclusivamente sobre el dataset `lerobot/libero_object_image`, compuesto por 454 episodios y 66.984 fotogramas a 10 FPS, con diez tareas de tipo *pick and place* sobre un robot Panda simulado (recoger un objeto concreto y depositarlo en una cesta). Se trata, por tanto, de una política especializada y de alcance estrecho, no de un modelo de propósito general.

Su relevancia es fundamentalmente de investigación: sirve como punto de partida reproducible para experimentos de imitación en el benchmark LIBERO Object y como base para *fine-tuning* sobre datos propios. Conviene señalar que el repositorio acumula 0 descargas y 0 *likes*, no incluye resultados de evaluación y su model card no documenta detalles de arquitectura interna más allá del tipo de política de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; política VLA causal de LeRobot (`causal_vla_warm`), con codificación visual y salida de acciones |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se especifica la ventana de observación ni el horizonte de acción) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (no aplica: las instrucciones de tarea son cadenas fijas en inglés del dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoints de LeRobot) |
| Tamano del repositorio | 8,1 GB |
| Robot objetivo | `panda` (7 grados de libertad) |
| Entradas | `observation.images.image` (3, 256, 256), `observation.images.wrist_image` (3, 256, 256), `observation.state` (8,) |
| Salida | `action` (7,) |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La model card identifica la política como `causal_vla_warm`, un tipo de política disponible en LeRobot 0.6.1. La arquitectura interna (número de capas, tipo de *backbone* visual, mecanismo de atención, uso de *action chunking*, etc.) no se documenta en la información proporcionada, por lo que no puede describirse con rigor. Lo que sí se especifica es la interfaz: dos cámaras RGB a resolución 256×256, un vector de estado de 8 dimensiones y una acción continua de 7 dimensiones, con el robot `panda` como objetivo.

El entrenamiento se realizó mediante aprendizaje por imitación sobre `lerobot/libero_object_image`: 454 episodios, 66.984 fotogramas, 10 FPS y diez tareas de recogida y depósito (zumo de naranja, kétchup, queso crema, salsa barbacoa, sopa de letras, leche, aliño de ensalada, mantequilla, salsa de tomate y pudin de chocolate). La configuración declarada es de 25.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No hay indicios de RLHF, DPO ni ajuste por preferencias: el paradigma es puramente conductual. El sufijo "warm" del identificador sugiere una inicialización en caliente desde otro checkpoint, pero este procedimiento no está documentado en la información disponible.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción de 7 grados de libertad a partir de observaciones visuales y propioceptivas.
- Percepción multimodal de dos cámaras simultáneas (vista frontal `image` y vista de muñeca `wrist_image`), ambas a 256×256.
- Ejecución de tareas *pick and place* condicionadas por una instrucción textual de tarea, limitadas a los diez objetos del dataset de entrenamiento.
- Integración con el flujo de despliegue de LeRobot mediante el comando `lerobot-rollout` sobre un robot Panda real o simulado.
- Reentrenamiento y *fine-tuning* mediante `lerobot-train --policy.type=causal_vla_warm`.
- No soporta *tool calling* ni *function calling*: no es un modelo de lenguaje y no expone ninguna interfaz de llamada a herramientas.
- No soporta razonamiento multi-paso simbólico ni planificación de alto nivel; la política reacciona directamente a la observación.
- No dispone de modo *thinking*, ni capacidades de audio, ni generación de texto, ni visión general (captioning, VQA).
- Capacidades multilingües: no aplica; la tarea se especifica como una cadena fija en inglés.

## Casos de uso

- Reproducción de experimentos en el benchmark LIBERO Object: la política permite ejecutar las diez tareas de recogida y depósito del dataset `libero_object_image` y comparar el comportamiento con otras políticas entrenadas sobre los mismos datos.
- Línea base para investigación en aprendizaje por imitación: al ser una política `causal_vla_warm` de 450 M parámetros con configuración de entrenamiento documentada (25.000 pasos, lote 16, AdamW, lr 1e-4, semilla 1000), resulta útil como referencia reproducible frente a variantes propias.
- *Fine-tuning* sobre datos propios de un Panda: el comando `lerobot-train` permite reentrenar la política con un dataset propio manteniendo el tipo de política, siempre que se respete la interfaz de observaciones (dos cámaras a 256×256 y estado de 8 dimensiones).
- Prototipado de *pick and place* en laboratorio: con un brazo Panda instrumentado y dos cámaras, el modelo puede operar tareas de recogida de objetos y depósito en contenedor, útil para validar *pipelines* de percepción-acción antes de escalar a producción.
- Automatización de clasificación y depósito de productos en entornos controlados: las diez clases del dataset (envases y alimentos) son representativas de tareas de *bin picking* ligero, donde el modelo puede recoger un producto identificado y colocarlo en una caja o cesta.
- Docencia y formación en robótica: LeRobot ofrece guías de instalación, montaje de hardware, grabación de datos y despliegue, lo que hace de esta política un ejemplo práctico para enseñar el ciclo completo de imitación (grabar, entrenar, desplegar).
- Validación de *hardware* y calibración de cámaras: ejecutar la política con `--strategy.type=base` y una duración fija permite comprobar que los nombres de cámara, índices y puerto del robot están correctamente configurados antes de lanzar entrenamientos largos.
- Generación de datos de evaluación: los *rollouts* de la política pueden registrarse para construir conjuntos de trayectorias de referencia o para análisis de fallos en entornos simulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No evaluation results have been provided for this policy yet". No existen tasas de éxito por tarea, ni comparaciones con otras políticas, ni métricas de simulación o de robot real.

| Benchmark | Resultado |
|---|---|
| LIBERO Object (tasa de exito) | no disponible |
| Otras metricas (MSE de accion, exito por tarea) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en FP32 y en torno a 0,9 GB en FP16/BF16 para los 450 M parámetros; hay que sumar el coste de los dos codificadores visuales y de los búferes de imagen a 256×256, por lo que un presupuesto práctico de 4-6 GB es razonable para inferencia.
- Tamano del repositorio: 8,1 GB, lo que sugiere que el repositorio incluye varios checkpoints y posiblemente estados del optimizador; conviene tener espacio en disco suficiente antes de descargarlo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en teoría (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para entrenamiento con lote 16 se recomienda una GPU de 16-24 GB (RTX 4090, A5000, L40S, A100).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más, especialmente en precisión reducida.
- Opciones de despliegue: `lerobot-rollout` de LeRobot sobre PyTorch es la vía documentada. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia, el dataset de entrenamiento se grabó a 10 FPS, por lo que la política debe ejecutarse al menos a esa frecuencia para reproducir la dinámica observada.
- Requisitos adicionales: dos cámaras compatibles con OpenCV (la model card usa 640×480 a 30 FPS como ejemplo), puerto de comunicación con el robot y calibración previa.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones de otras políticas, por lo que los valores de comparación figuran como no disponibles. En el ecosistema LeRobot existen políticas de categoría equivalente (por ejemplo, ACT, Diffusion Policy, SmolVLA o pi0), pero sus parámetros, contexto y resultados no se detallan en la documentación disponible.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| causalvla-fair-v1-m5-v2-warm-070-object | 450.046.176 | no disponible | no disponible | apache-2.0 | HuggingFace (`phawitbinabik/…`) |
| Otras politicas VLA de LeRobot | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay resultados de éxito en robot real ni en simulación, y el repositorio registra 0 descargas y 0 interacciones, por lo que no existe validación externa conocida.
- Especialización extrema: el modelo solo ha visto diez tareas concretas sobre el robot `panda`; no se puede asumir generalización a otros objetos, otras instrucciones o configuraciones distintas de cámara.
- Acoplamiento rígido a la interfaz: los nombres de las claves de observación (`observation.images.image`, `observation.images.wrist_image`, `observation.state`), las resoluciones (256×256) y la dimensionalidad del estado (8) y de la acción (7) deben coincidir exactamente; cualquier cambio requiere reentrenar.
- Sensibilidad a condiciones no documentadas: no se especifica el comportamiento ante cambios de iluminación, posición inicial, distractores, oclusiones o robots distintos del mismo tipo. Estos factores afectan típicamente al rendimiento y no están cuantificados aquí.
- Riesgo de acciones incorrectas en robot físico: al no haber métricas de éxito, desplegar la política sin supervisión implica riesgo material sobre el entorno y las personas. Es obligatorio disponer de parada de emergencia y límites de fuerza.
- Alucinación: el concepto no aplica en el sentido de los modelos de lenguaje, pero sí existe el riesgo equivalente de generar trayectorias fuera de distribución.
- Idioma: no es un modelo multilingüe ni un modelo de lenguaje; la instrucción de tarea es una cadena fija en inglés y no se ha evaluado con paráfrasis.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial. Sin embargo, la licencia del dataset de entrenamiento `lerobot/libero_object_image` no se especifica en la información disponible y podría imponer condiciones adicionales.
- Trazabilidad limitada: el autor es un usuario individual, no hay paper asociado en la documentación facilitada y el identificador (`m5-v2-warm-070`) sugiere iteraciones experimentales sin historial público de cambios.
- Entrenamiento no reproducible al detalle: aunque se documentan semilla, lote, optimizador y tasa de aprendizaje, no se especifica la composición exacta de las transformaciones de datos, el número de épocas efectivo sobre el dataset ni la inicialización concreta del modo "warm".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phawitbinabik/causalvla-fair-v1-m5-v2-warm-070-object
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero_object_image
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero_object_image
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Configuración de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
