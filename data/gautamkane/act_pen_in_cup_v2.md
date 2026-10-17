# gautamkane/act_pen_in_cup_v2

## Resumen

`gautamkane/act_pen_in_cup_v2` es una política de imitación (no un modelo de lenguaje) entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El modelo aprende una tarea robótica concreta a partir de demostraciones teleoperadas: "Pick up the pen and drop it in the cup - night time - office room". Resuelve, por tanto, el problema de convertir observaciones visuales y proprioceptivas en comandos de acción de un manipulador, sin planificación simbólica ni instrucciones en lenguaje natural.

La política tiene 51.668.614 parámetros en formato safetensors (repo de 0,2 GB) y consume dos cámaras RGB de 480x640 (`head` y `wrist`) más un vector de estado de 6 dimensiones, produciendo un vector de acción también de 6 dimensiones sobre un robot `so_follower` (SO-100/SO-101 de LeRobot). Se entrenó durante 100.000 pasos con batch 16, optimizador AdamW y learning rate 1e-5 sobre un dataset de 55 episodios y 45.295 fotogramas a 30 FPS.

Su relevancia es práctica y acotada: es un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot (grabar datos, entrenar, desplegar con `lerobot-rollout`) para robótica de bajo coste. No es un modelo fundacional ni generaliza fuera de la tarea y el entorno para los que fue entrenado; el autor no ha publicado ninguna evaluación en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual y decodificador de acciones con chunking; política de imitación |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: no hay contexto textual; la política opera sobre el horizonte de chunking de acciones, cuyo valor no se documenta en la model card |
| Tipos de cuantización | No se documentan cuantizaciones (solo pesos safetensors; no hay GGUF, INT8 ni FP16 publicados) |
| Idiomas soportados | No disponible / no aplica: el modelo no procesa lenguaje; la tarea se pasa como cadena fija en tiempo de ejecución |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Tipo de política / pipeline | `robotics`, imitación supervisada (behavior cloning) con ACT |
| Robot objetivo | `so_follower` |
| Cámaras | `head`, `wrist` (RGB, 480x640) |
| Entradas | `observation.state` (6,), `observation.images.head` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `gautamkane/pen_in_cup_day_1_clean`: 55 episodios, 45.295 fotogramas, 30 FPS |
| Pasos de entrenamiento | 100.000 (batch 16, AdamW, lr 1e-5, seed 1000, LeRobot 0.6.1) |
| Descargas / likes en el Hub | 10 descargas, 0 likes |
| Fecha de creación | 2026-10-17 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice "trozos" (chunks) de acciones de longitud fija en lugar de un único paso, lo que reduce el error de compounding y suaviza la ejecución. La arquitectura combina un backbone visual convolucional que procesa las dos cámaras (`head` y `wrist`), una proyección del estado proprioceptivo de 6 dimensiones y un transformer encoder-decoder con un cuello de botella latente de tipo VAE/CVAE que modela la variabilidad de las demostraciones humanas. La salida es una secuencia de vectores de acción de 6 dimensiones, de los cuales se ejecutan los primeros antes de volver a inferir. El total de 51,7 M de parámetros es coherente con un backbone ligero (tipo ResNet18) más un transformer de pocas capas.

El entrenamiento es puramente supervisado sobre demostraciones teleoperadas: no hay RLHF, DPO ni preferencias humanas. El dataset contiene 55 episodios y 45.295 fotogramas a 30 FPS de una única tarea en una única condición de iluminación ("night time") y un único entorno ("office room"), lo que fija de antemano el dominio de generalización: posiciones de objeto, iluminación y disposición de la mesa similares a las de la grabación. La configuración reportada es 100.000 pasos, batch 16, AdamW con lr 1e-5, semilla 1000 y LeRobot 0.6.1; no se detalla la composición de aumentos de datos ni la división train/val.

## Capacidades

- Manipulación robótica de una tarea específica: coger un bolígrafo y dejarlo dentro de una taza sobre una mesa de oficina, con el robot `so_follower`.
- Control visomotor a partir de dos cámaras RGB (vista de cabeza y vista de muñeca) a 480x640, con inferencia pensada para un bucle de control de 30 FPS.
- Predicción de chunks de acción (6 grados de libertad / 6 dimensiones de acción), que aporta ejecuciones más suaves que el behavior cloning paso a paso.
- Aprendizaje por imitación reproducible: el mismo pipeline permite reentrenar la política con `lerobot-train` sobre un dataset propio cambiando `--policy.type=act`.
- Despliegue estandarizado con `lerobot-rollout` sin necesidad de escribir código de control a medida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni procesamiento de lenguaje natural, audio o vídeo más allá de las dos cámaras de observación.
- No es multilingüe ni tiene capacidades lingüísticas: la cadena `--task` es una etiqueta informativa, no una instrucción que el modelo interprete.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia completa de coger el bolígrafo y soltarlo en la taza sin scripting cinemático, lo que sirve para validar un montaje SO-100 antes de escalar a tareas más complejas.
- Banco de pruebas de imitación de bajo coste: con 51,7 M de parámetros y 0,2 GB de pesos, es un caso ideal para medir el efecto del número de episodios (55), la tasa de frames (30 FPS) y el número de pasos (100.000) en la tasa de éxito de una tarea concreta.
- Generación de datos sintéticos de evaluación: usar la política como "profesor" para recolectar rollouts etiquetados y comparar distribuciones de acciones frente a las demostraciones originales.
- Docencia y formación en robótica: el flujo `lerobot-train` + `lerobot-rollout` con un único comando permite mostrar el ciclo completo de imitación en un curso o taller sin infraestructura de GPU grande.
- Despliegue en el edge: al caber en GPUs de consumo e incluso plantearse en CPU, puede ejecutarse en un PC junto al robot, sin servicio en la nube ni latencia de red en el bucle de control.
- Investigación en robustez de políticas: evalúa cómo degrada la tasa de éxito al mover el objeto, cambiar la iluminación o introducir distracciones respecto al entorno original de oficina nocturna.
- Base para fine-tuning de una tarea nueva: reentrenar desde esta política con un dataset propio de otra tarea similar (manipulación de objetos pequeños con dos cámaras) para reducir el número de pasos necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la nota explícita "_No evaluation results have been provided for this policy yet_", sin tabla de ensayos, éxitos ni tasa de éxito en robot real. Tampoco se reportan métricas de tipo MMLU, HumanEval o GSM8K, que no aplican a una política de control motor.

| Métrica | Resultado |
|---|---|
| Tasa de éxito en robot real | No disponible (no evaluado por el autor) |
| Número de ensayos | No disponible |
| Pérdida de entrenamiento final | No disponible |
| Métricas de benchmarks de lenguaje | No aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en FP32 solo para los pesos (51,7 M de parámetros) y alrededor de 0,1 GB en FP16; a ello hay que sumar activaciones de dos flujos de imagen de 3x480x640. Cálculo estimado a partir del número de parámetros, no publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería bastar (RTX 3060, RTX 4060, RTX 4090, A100, H100). No hay requisitos oficiales publicados.
- Cabe en GPU de consumo: sí, con margen amplio; también es razonable plantear inferencia en CPU para un bucle de control de 30 FPS, aunque no hay latencias publicadas que lo confirmen.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` (el recomendado en la model card), o integración directa con la librería `lerobot` en Python. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset está grabado a 30 FPS, lo que marca la frecuencia nominal del bucle; no se especifica si la política alcanza ese ritmo en hardware concreto.
- Almacenamiento: repo de 0,2 GB, sin requisitos de disco relevantes.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gautamkane/act_pen_in_cup_v2` (este) | ACT, imitación | 51.668.614 | No aplica | Apache 2.0 | Hugging Face Hub, vía LeRobot |
| Diffusion Policy (Chi et al., 2023) | Política generativa por difusión | No disponible en esta ficha | No aplica | No disponible en esta ficha | Implementación en LeRobot; checkpoints comunitarios |
| VQ-BeT | Política de imitación con tokenización discreta de acciones | No disponible en esta ficha | No aplica | No disponible en esta ficha | Implementación en LeRobot; checkpoints comunitarios |
| Otras políticas ACT del Hub de LeRobot | ACT, imitación | No disponible (varía por checkpoint) | No aplica | Típicamente Apache 2.0, a verificar por repo | Hugging Face Hub |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible: ninguna de las fuentes consultadas aporta tasas de éxito comparables sobre la misma tarea. La diferencia práctica entre ACT y Diffusion Policy es metodológica: ACT predice chunks de acción de forma determinista con un latente estocástico, mientras que Diffusion Policy genera acciones mediante difusión, con más coste de inferencia por paso.

## Limitaciones y advertencias

- Sobreajuste al dominio: entrenada con 55 episodios de una única tarea, un único entorno ("office room") y una única condición de iluminación ("night time"); se espera una degradación notable al cambiar la posición del objeto, la iluminación o los objetos de fondo.
- Sin evaluación publicada: no existe evidencia cuantitativa de tasa de éxito ni de robustez, por lo que no debe presentarse como una política validada en producción.
- Dependencia del hardware exacto: requiere un robot `so_follower` con dos cámaras cuyos nombres e índices coincidan con las claves de observación (`observation.images.head`, `observation.images.wrist`); un cambio de cámara, de resolución o de calibración invalida la política.
- Sin capacidades lingüísticas: la cadena `--task` no se interpreta; el modelo no puede recibir instrucciones nuevas ni generalizar a otra tarea por prompt.
- Riesgo de fallo silencioso: al ser behavior cloning, ante estados fuera de distribución puede producir acciones plausibles pero incorrectas sin señal de incertidumbre; conviene monitorizar y limitar el espacio de trabajo.
- Sesgos: los derivados de las demostraciones humanas (trayectorias, velocidades y posiciones preferidas por el operador), no sesgos sociales o lingüísticos.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; conviene citar también LeRobot y el paper de ACT.
- Madurez del artefacto: 10 descargas, 0 likes y repo creado y actualizado el mismo día; no hay señales de mantenimiento ni de soporte por parte del autor.
- Fecha de creación registrada en el Hub: 2026-10-17, posterior a la mayoría de referencias del ecosistema; verificar la vigencia de la versión de LeRobot indicada (0.6.1) antes de reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gautamkane/act_pen_in_cup_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/gautamkane/pen_in_cup_day_1_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=gautamkane/pen_in_cup_day_1_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
