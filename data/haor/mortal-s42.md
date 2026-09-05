# haor/Mortal-S42

## Resumen

Mortal-S42 es un checkpoint del modelo Mortal v4, desarrollado por haor, diseñado para jugar mahjong riichi japonés de cuatro jugadores. Se trata de una política de juego que, a partir de información visible de la mesa, selecciona una acción legal entre 46 posibles. El modelo fue adaptado a partidas de alto nivel de Mahjong Soul y Tenhou mediante entrenamiento offline con CQL (Conservative Q-Learning) y un objetivo auxiliar de siguiente rango.

La arquitectura es una red residual de 192 canales y 40 bloques, con una cabeza DQN dueling. El modelo tiene 10.835.631 parámetros y recibe como entrada una observación de Mortal v4 de forma (1012, 34) junto con una máscara legal de 46 acciones. Es un modelo personalizado en PyTorch, y su uso requiere el cargador incluido y el codificador de libriichi. El checkpoint S42.8k proviene de una línea de entrenamiento offline local y no incluye ningún RL online posterior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red residual de 192 canales y 40 bloques con cabeza DQN dueling (modelo personalizado PyTorch) |
| Parámetros totales | 10.835.631 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de juego; entrada de observación de forma (1012, 34)) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, zh (documentación y metadatos; el modelo no genera lenguaje) |
| Licencia | Apache-2.0 para el modelo; runtime de Mortal bajo AGPL-3.0-or-later |
| Formato de pesos | .pth (PyTorch, tensores de inferencia y buffers de normalización) |

## Arquitectura y entrenamiento

Mortal-S42 es una política de red residual profunda con 40 bloques y 192 canales por capa. La cabeza de salida es una DQN dueling que produce valores Q relativos para cada una de las 46 acciones legales. La entrada es una observación de Mortal v4 con forma (1012, 34), que codifica el estado del tablero y la información visible, junto con una máscara que restringe las acciones legales. El modelo no incorpora mecanismos de atención ni arquitecturas de tipo transformer; es una red convolucional residual diseñada específicamente para el juego.

El entrenamiento se realizó en tres fases. La fase base utilizó 1.105.845 partidas de Tenhou Houou hanchan (2020-2025). La fase H añadió 362.460 partidas de Tenhou de 2018 y 2022-2025. La fase S empleó 268.994 partidas, compuestas por 134.497 partidas de Mahjong Soul de alto rango y 134.497 partidas de Tenhou. Esta última fase usó CQL offline con un objetivo auxiliar de siguiente rango, y el checkpoint contiene la última actualización guardada en el paso 42.800. No se incluye ningún RL online posterior. Las fases se solapan y no deben sumarse como partidas únicas.

## Capacidades

- Selección de acciones legales en mahjong riichi de cuatro jugadores, usando información visible del tablero.
- Optimizado para partidas de alto rango, con datos de Tenhou Houou y Mahjong Soul de jugadores fuertes.
- Devuelve valores Q relativos para cada acción legal, útiles para análisis de decisiones.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidades multilingües no aplica; el modelo no procesa ni genera lenguaje natural.

## Casos de uso

- Investigación en aprendizaje por refuerzo offline: el modelo sirve como caso de estudio de CQL en un entorno de información imperfecta con espacio de acciones discreto y observaciones de alta dimensión.
- Análisis de replays: se puede usar para evaluar decisiones en partidas de Tenhou o Mahjong Soul, comparando la acción elegida con la distribución de Q-values del modelo.
- Simulación de partidas controladas: permite generar partidas espejo entre distintos checkpoints (por ejemplo, S42 vs H20k) para medir diferencias de fuerza con control de semillas.
- Entrenamiento de bots para mesas privadas: integrando el runtime de libriichi y el cargador, el modelo puede actuar como oponente en entornos de práctica controlados.
- Evaluación de políticas de juego: sirve como referencia para comparar la fuerza relativa de diferentes versiones de Mortal v4 mediante partidas 2v2 o 1v3.
- Generación de datos de entrenamiento: las salidas del modelo pueden usarse para crear conjuntos de datos de acciones etiquetadas para imitar políticas en otros agentes.

## Benchmarks y rendimiento

| Comparación | Diferencia de rango medio | Intervalo 95% |
|---|---|---|
| S42.8k menos H20k (1v3, 20.000 partidas) | -0.0167 | [-0.0422, +0.0088] |
| Oponente menos S42: model_v4_20240308_best_min.pth (2v2, 2.000 hanchans) | +0.0395 | [-0.0170, +0.0960] |
| Oponente menos S42: model_v4_20240308_mortal_min.pth (2v2, 2.000 hanchans) | +0.0305 | [-0.0260, +0.0875] |

La comparación con H20k, el padre directo, no mostró una ganancia significativa de fuerza. Las comparaciones comunitarias favorecen a S42 en el punto estimado, pero los intervalos incluyen cero y no son evidencia concluyente. La pérdida DQN en datos held-out varió aproximadamente -0.45% en Tenhou 2018, +0.01% en Tenhou moderno y -2.11% en Mahjong Soul, pero la pérdida offline no es una medida directa de la fuerza de juego.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 10,8 millones de parámetros, el modelo es ligero (aproximadamente 43 MB en FP32, cálculo a partir del número de parámetros), pero no se han publicado mediciones de VRAM.
- GPU recomendadas: no disponible. CUDA es compatible con el cargador, pero no fue probado en este paquete de lanzamiento.
- Cabe en consumer GPU: previsiblemente sí, por el tamaño del modelo, pero no hay pruebas publicadas.
- Opciones de despliegue: se incluye un cargador de PyTorch y el runtime de Mortal. Requiere CPython 3.12 y un toolchain de Rust con enlazador C/C++ para compilar el codificador nativo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Solo se verificó inferencia en CPU con Python 3.12 y PyTorch 2.13.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rango medio (2v2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mortal-S42 (S42.8k) | 10.835.631 | No aplica | 2.48025 / 2.48475 | Apache-2.0 (runtime AGPL-3.0) | HuggingFace |
| H20k (padre) | No disponible | No aplica | No disponible | No disponible | No distribuido |
| model_v4_20240308_best_min.pth | No disponible | No aplica | 2.51975 | No disponible | No distribuido |
| model_v4_20240308_mortal_min.pth | No disponible | No aplica | 2.51525 | No disponible | No distribuido |

Los checkpoints comunitarios no se distribuyen; solo se identifican por nombre de archivo y hash SHA-256. H20k es el padre directo de S42.8k, pero no se incluye en el paquete.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado principalmente con partidas de jugadores de alto rango; su rendimiento en rangos inferiores o en otras plataformas no está establecido.
- Riesgo de alucinación: no aplica, ya que el modelo no genera texto.
- Limitaciones de contexto o idioma: no aplica. La documentación y los metadatos están disponibles en inglés y chino, pero el modelo no procesa lenguaje.
- Restricciones de licencia: el runtime de Mortal se distribuye bajo AGPL-3.0-or-later, lo que puede imponer obligaciones de copyleft si se redistribuye el runtime junto al modelo.
- Los valores Q no son probabilidades calibradas; deben interpretarse como puntuaciones relativas de acción.
- Solo está validado para hanchan de cuatro jugadores. Las reglas de tres jugadores y otras variantes no están soportadas.
- Se requiere un enmascaramiento correcto de las fichas ocultas y un orden de eventos preciso; el codificador nativo debe compilarse para cada intérprete y plataforma.
- Los benchmarks comunitarios no demuestran una superioridad estadísticamente significativa de S42 sobre los checkpoints comparados.

## Enlaces

- HuggingFace: https://huggingface.co/haor/Mortal-S42
- Mortal (runtime original): https://github.com/Equim-chan/Mortal
- Mortal_v4 (repositorio relacionado): https://github.com/shinkuan/Mortal_v4
