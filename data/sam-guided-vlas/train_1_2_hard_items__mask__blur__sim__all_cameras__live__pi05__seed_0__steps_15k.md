# sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_15k

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, entrenado con la librería LeRobot de Hugging Face sobre un conjunto de datos propio de manipulación robótica. El modelo parte de `lerobot/pi05_base` y ha sido especializado para el robot `Panda`, con tres cámaras de entrada (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y salida de acciones de 7 dimensiones. Su relevancia es la de un caso práctico de reutilización de un VLA generalista para una tarea concreta de manipulación, entrenado durante 15.000 pasos con la semilla 0.

El modelo no genera texto: es una política de control que consume estado proprioceptivo e imágenes y produce comandos motores. Por tanto, no debe evaluarse como un LLM, sino como un controlador entrenado sobre un dataset muy específico de 199 episodios y 31.073 fotogramas a 20 FPS. El autor publica el checkpoint con licencia Apache 2.0 y el modelo base es también de acceso abierto, lo que facilita su inspección y reproducción.

Se trata de un artefacto de investigación con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y 9,4 GB de repositorio, sin descargas ni valoraciones en el momento de redactar esta ficha y sin resultados de evaluación publicados. Conviene tratarlo como un checkpoint experimental dentro de una campaña de experimentos, no como un modelo listo para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) de la familia π₀.₅ (Pi05); implementación de LeRobot adaptada del repositorio OpenPI. El detalle interno de la arquitectura no se especifica en la model card |
| Parámetros totales | 4.143.404.816 (aproximadamente 4,14 mil millones, dato real de safetensors) |
| Parámetros activos | No aplica (no se documenta una arquitectura de mezcla de expertos en la información disponible) |
| Longitud de contexto | No disponible (no se documenta ventana de contexto en la model card; la política consume un historial de observaciones que no se detalla) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no se listan variantes GGUF, AWQ, GPTQ ni cuantizaciones de 8 o 4 bits) |
| Idiomas soportados | No disponible (modelo de acción; las descripciones de tarea del dataset están en inglés y no se documenta soporte multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`; repositorio de 9,4 GB) |

## Arquitectura y entrenamiento

La model card identifica el modelo como π₀.₅ (Pi05), un VLA de Physical Intelligence concebido para generalización en mundo abierto que evoluciona π₀ hacia entornos y situaciones no vistos durante el entrenamiento. La implementación utilizada es la de LeRobot, adaptada del repositorio de código abierto OpenPI. El autor no detalla en la model card la composición exacta del codificador visual, del componente de lenguaje ni del módulo de generación de acciones, por lo que los detalles internos de la arquitectura (tipo de atención, mecanismo de difusión o flow matching, número de capas) quedan como no disponibles en la información proporcionada.

El ajuste fino se realizó sobre el dataset `sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live`, compuesto por 199 episodios, 31.073 fotogramas a 20 FPS, con descripciones textuales de tareas en inglés orientadas a objetos difíciles de agarrar ("hard items"). El nombre del repositorio indica además un entrenamiento con 15.000 pasos y semilla 0, y sugiere en la nomenclatura el uso de máscaras, desenfoque, simulador y varias cámaras, aunque el autor no documenta explícitamente el pipeline de aumento de datos ni la proporción de datos simulados frente a datos reales. No se documenta el número de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Control robótico de manipulación: convierte observaciones (estado de 9 dimensiones más tres imágenes RGB de 3×224×224) en un vector de acción de 7 dimensiones, típico de un brazo manipulador de 6 grados de libertad con pinza.
- Percepción multivista: procesa simultáneamente una vista de agente (`agentview`) y dos vistas de muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`), lo que aporta información de profundidad y de proximidad al objeto.
- Condicionamiento por instrucción en lenguaje natural: el dataset incluye descripciones textuales detalladas de cada tarea-objeto, lo que indica que la política acepta consignas en inglés.
- Generalización a objetos "difíciles": el nombre del dataset y sus descripciones (formas con lóbulos, huecos, anillos, protuberancias) apuntan a un entrenamiento dirigido a geometrías complejas de agarre.
- Ejecución en bucle cerrado a 20 FPS: la frecuencia del dataset marca el régimen de control esperado para el que se recogieron las demostraciones.
- Soporte de tool calling: no disponible (no aplica a un modelo de política).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta planificación simbólica ni descomposición de tareas).
- Capacidades multilingües: no disponibles (las instrucciones del dataset están en inglés).
- Capacidades especiales (modo pensamiento, visión, audio): visión sí, mediante los tres flujos de imagen; no se documentan modo pensamiento ni audio.

## Casos de uso

- Manipulación de objetos complejos en laboratorio: la política está entrenada específicamente con objetos de geometría irregular y descripciones de agarre difíciles, por lo que es adecuada para experimentos de grasping donde las pinzas convencionales fallan por falta de puntos de apoyo.
- Investigación en visión-lenguaje-acción: sirve como punto de partida reproducible para estudiar cómo un VLA generalista se especializa en un dominio estrecho, ya que el checkpoint, el dataset y el número de pasos están identificados.
- Evaluación de aumento de datos: dado que el nombre del repositorio referencia máscaras, desenfoque y simulación, el modelo es un candidato para medir el efecto de esas técnicas sobre la robustez del agarre en datos reales.
- Replicación de experimentos con LeRobot: permite reproducir el flujo completo de entrenamiento y despliegue con `lerobot`, lo que resulta útil para equipos que quieren validar su infraestructura antes de escalar a datasets mayores.
- Base para ajuste posterior (continual fine-tuning): al ser un fine-tune de `lerobot/pi05_base` con 15.000 pasos, puede emplearse como inicialización para tareas relacionadas con el mismo robot y la misma configuración de cámaras.
- Pruebas de política en simulación: si el dataset mezcla datos simulados, el modelo puede usarse para validar controladores en entornos virtuales antes de transferirlos a hardware.
- Docencia y divulgación en robótica: un checkpoint pequeño (4,14 mil millones de parámetros) con licencia Apache 2.0 y pipeline documentado es apropiado para prácticas de aprendizaje por imitación.
- No se recomienda su uso como asistente conversacional ni para generación de texto, código o imágenes: no es un modelo generativo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de agarre, comparaciones con π₀.₅ base ni evaluaciones en el entorno real o simulado. Tampoco se documentan latencia, throughput ni curvas de entrenamiento asociadas a los 15.000 pasos.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 8,3 GB en bfloat16, 16,6 GB en float32, 4,1 GB en int8 y 2,1 GB en int4 (estimaciones calculadas a partir de los 4.143.404.816 parámetros; el autor no publica requisitos oficiales).
- VRAM realista para inferencia en bfloat16: entre 12 GB y 16 GB, sumando activaciones de los tres flujos de imagen de 224×224 y del estado de 9 dimensiones, además del estado interno del bucle de control.
- GPU recomendadas: A100 o H100 para lotes grandes y evaluación a alta frecuencia; para una sola política sin batching agresivo, una RTX 4090, RTX 3090 o A6000 de 24 GB es suficiente en bfloat16.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bfloat16, y en tarjetas de 12-16 GB si se aplica cuantización, siempre que la implementación de LeRobot la soporte (no documentada).
- Opciones de despliegue: LeRobot (librería declarada en el repositorio) y el stack de OpenPI del que deriva la implementación. No se documentan despliegues con vLLM, TGI, llama.cpp u Ollama, y estos no son aplicables a un modelo de política de acción.
- Latencia y throughput: no disponibles.
- Almacenamiento: 9,4 GB de repositorio, más el espacio adicional para el dataset de entrenamiento si se desea reproducir el ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (π₀.₅ ajustado, 15k pasos) | 4.143.404.816 | No disponible | Apache 2.0 | Safetensors en Hugging Face, 0 descargas | Sin benchmarks publicados |
| `lerobot/pi05_base` (modelo base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Pesos abiertos en Hugging Face | Sin benchmarks publicados en esta ficha |
| Otros VLA de código abierto (OpenVLA, SmolVLA, alternativas de la familia π₀) | No disponible | No disponible | No disponible | No verificado en esta búsqueda | No disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparación cuantitativa con alternativas. La única comparación fiable es la del propio modelo con su base `lerobot/pi05_base`, del cual hereda arquitectura y pesos iniciales, diferenciándose únicamente por el ajuste fino sobre el dataset de objetos difíciles.

## Limitaciones y advertencias

- Especialización extrema: la política está ajustada para un robot `Panda` con un estado de 9 dimensiones, siete dimensiones de acción y exactamente tres cámaras con nombres concretos. Cambiar el robot, la morfología o la disposición de las cámaras invalida el modelo sin un nuevo entrenamiento.
- Sin evaluación publicada: no hay tasas de éxito, ni comparación con la línea base, ni validación en hardware real; el número de descargas y valoraciones es cero.
- Riesgo de sobreajuste al dataset: 199 episodios y 31.073 fotogramas son un volumen reducido para un modelo de 4,14 mil millones de parámetros; es probable que la generalización fuera de la distribución del dataset sea limitada.
- Idiomas: no se documenta soporte más allá del inglés de las instrucciones del dataset, y el modelo no produce texto evaluable.
- Sesgos conocidos: no disponibles. No hay análisis de sesgo demográfico, cultural o de otro tipo, ni sería directamente aplicable a un modelo de acción.
- Riesgo de alucinación: en el sentido estricto de generación de texto no aplica; el equivalente es la ejecución de acciones inconsistentes con la observación, riesgo que no está cuantificado.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero hay que verificar por separado la licencia del dataset de entrenamiento y la del modelo base `lerobot/pi05_base`, no confirmadas en esta ficha.
- Cautela en producción: cualquier despliegue físico debe incorporar límites de par, paradas de emergencia y supervisión humana, dado que no existe evidencia publicada de seguridad ni de robustez.
- Metadatos llamativos: la fecha de creación registrada es 2026-09-11, posterior a la fecha habitual de publicación de la familia π₀.₅; conviene verificar la procedencia del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (referenciado en la model card, sin URL explícita en la información proporcionada)
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a una serie de televisión francesa y a un fabricante de utillaje), por lo que no se incluyen como fuentes.
