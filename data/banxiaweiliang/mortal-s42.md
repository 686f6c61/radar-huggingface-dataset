# banxiaweiliang/Mortal-S42

## Resumen

Mortal-S42 es un modelo de política para mahjong japonés riichi a cuatro jugadores, desarrollado por el usuario banxiaweiliang. Se distribuye como el checkpoint S42.8k, derivado de una línea de entrenamiento offline de Mortal v4, y su función es seleccionar una acción legal en cada turno a partir únicamente de la información visible de la partida. El modelo se apoya en el codificador de observaciones y el runtime de Mortal (proyecto de Equim-chan) para funcionar.

La arquitectura es una red residual de 40 bloques con 192 canales y una cabeza dueling DQN, con 10.835.631 parámetros totales. La entrada es una observación Mortal v4 de forma `(1012, 34)` acompañada de una máscara de 46 acciones legales. Es un modelo PyTorch de implementación propia, no un transformer de lenguaje, y no genera texto ni código: su única salida son valores Q relativos sobre las acciones legales disponibles.

Su relevancia radica en que publica un checkpoint de una línea de entrenamiento offline con procedencia detallada (etapas Base, H y S), evaluación con protocolos explícitos frente a su modelo padre y frente a dos checkpoints comunitarios históricos, y una separación clara entre pesos inferidos y runtime. Es un caso de estudio útil para quienes trabajan en aprendizaje por refuerzo offline aplicado a juegos de información imperfecta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red residual de 40 bloques con 192 canales y cabeza dueling DQN |
| Parametros totales | 10.835.631 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; la observación tiene forma `(1012, 34)` y la máscara de acciones 46 entradas |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh |
| Licencia | Pesos bajo Apache-2.0; runtime bajo AGPL-3.0-or-later |
| Formato de pesos | `.pth` (PyTorch), en `weights/s42-inference.pth` |

## Arquitectura y entrenamiento

El modelo es una red residual convolucional de 40 bloques con 192 canales por bloque, rematada por una cabeza dueling DQN. Consume una observación del codificador Mortal v4 con forma `(1012, 34)` y una máscara de acciones legales de 46 posiciones, y emite valores Q relativos sobre las acciones legales. No es un transformer ni un modelo de lenguaje; es un agente de decisión para un juego de información imperfecta. La inferencia requiere el codificador nativo de `libriichi` compilado para el intérprete y la plataforma locales, y el paquete incluye únicamente los tensores de inferencia y los buffers de normalización en `weights/s42-inference.pth`.

La procedencia del entrenamiento sigue la línea `stable 380k → H20k → S42.8k`, donde cada etapa parte de los pesos del modelo padre con estado de entrenamiento nuevo y los números de etapa cuentan pasos de optimizador, no partidas. La etapa Base usó 1.105.845 partidas de Tenhou Houou hanchan (2020-2025); la fase H, 362.460 partidas de 2018 y 2022-2025 de Tenhou; y la fase S, 268.994 partidas compuestas por 134.497 partidas de alto rango de Mahjong Soul y 134.497 partidas de réplicas de Tenhou. La fase S empleó CQL offline con un objetivo auxiliar de siguiente rango. El checkpoint corresponde a la última actualización guardada en el paso 42.800 y no se incluye ningún checkpoint posterior de RL online. Los conjuntos de datos crudos, identificadores de partidas y estado de entrenamiento no se distribuyen.

## Capacidades

- Selección de acciones legales en mahjong riichi a cuatro jugadores usando exclusivamente información visible.
- Estimación de valores Q relativos para las 46 acciones posibles, filtradas por máscara de legalidad.
- Conformidad con el protocolo mjai y el ordenamiento de eventos exigido por el codificador Mortal v4.
- Gestión de observaciones con enmascaramiento de fichas ocultas conforme al esquema upstream.
- Inferencia en CPU verificada con CPython 3.12 y PyTorch 2.13.
- Soporte de carga en CUDA por parte del loader, aunque no probado en este paquete de release.
- Idiomas de la documentación y metadatos: inglés y chino.
- No incluye generación de texto, tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Análisis de partidas propias: reejecutar un hanchan grabado en formato mjai y usar las puntuaciones Q para identificar en qué turnos la acción elegida se aleja de la preferida por el modelo.
- Entrenamiento de jugadores: generar recomendaciones por turno sobre situaciones concretas de la partida, con la advertencia de que los valores Q son puntuaciones relativas y no probabilidades calibradas.
- Simulaciones controladas: enfrentar el agente contra otros checkpoints dentro del adaptador MahJax para medir diferencias de rango medio en partidas 1v3 o 2v2.
- Investigación en RL offline: reproducir la línea Base → H → S y estudiar el efecto de CQL con objetivo auxiliar de siguiente rango sobre la política resultante.
- Replicación de benchmarks comunitarios: comparar contra `model_v4_20240308_best_min.pth` y `model_v4_20240308_mortal_min.pth` bajo el protocolo 2v2 con semillas espejadas descrito en el paquete.
- Instrumentación para bots de mahjong en entornos locales o de investigación: integrar el modelo como política de decisión mediante el runtime incluido y el encoder nativo, sin uso en producción con dinero real.
- Auditoría de robustez por plataforma: medir el comportamiento en partidas de Tenhou frente a Mahjong Soul, ya que el entrenamiento combina ambos orígenes y el rendimiento por rango y plataforma no está establecido.
- Docencia sobre juegos de información imperfecta: usar el modelo como ejemplo reproducible de agente con observación estructurada y cabeza dueling DQN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para métricas tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo. Los datos de evaluación disponibles son específicos de mahjong.

Comparación contra el modelo padre, con partidas 1v3 recíprocas, mismos bloques de semilla y rotación de cuatro asientos, 10.000 partidas por dirección (20.000 por comparación):

| Comparacion | Diferencia de rango medio | Intervalo 95% |
|---|---:|---|
| S42.8k menos H20k | -0,0167 | [-0,0422, +0,0088] |

La comparación no muestra una ganancia de fuerza significativa sobre H20k. El loss DQN sobre conjuntos reservados cambió aproximadamente -0,45% en Tenhou 2018, +0,01% en Tenhou moderno y -2,11% en Mahjong Soul; el propio autor advierte que el loss offline es un diagnóstico y no una medida directa de fuerza de juego.

Comparaciones con checkpoints comunitarios históricos, 2.000 hanchans por benchmark, 1.000 semillas y dos partidas 2v2 espejadas por semilla (4.000 resultados de asiento por modelo y comparación):

| Checkpoint oponente | Rango medio S42 | Rango medio oponente | Oponente menos S42 | Intervalo 95% reportado |
|---|---:|---:|---:|---:|
| `model_v4_20240308_best_min.pth` | 2,48025 | 2,51975 | +0,0395 | [-0,0170, +0,0960] |
| `model_v4_20240308_mortal_min.pth` | 2,48475 | 2,51525 | +0,0305 | [-0,0260, +0,0875] |

Ambas estimaciones puntuales favorecen a S42, pero ambos intervalos incluyen el cero. El bootstrap histórico remuestreó hanchans individuales y no grupos de semillas espejadas, por lo que estos intervalos no deben tratarse como evidencia agrupada por semilla de superioridad.

## Requisitos de hardware

- Al tratarse de una red convolucional de 10,8 millones de parámetros, la huella de memoria es muy inferior a la de un modelo de lenguaje del mismo orden.
- Inferencia en CPU verificada con CPython 3.12 y PyTorch 2.13; el proceso `inference.py --smoke --device cpu` forma parte del flujo de comprobación.
- Cualquier GPU consumer reciente es sobradamente suficiente para los tensores; no se publican cifras de VRAM concretas.
- GPU profesional (A100, H100) no aporta ventaja clara por tamaño de modelo, dado que el cuello de botella probable es el bucle de simulación y el encoder nativo.
- El loader admite CUDA, pero el autor indica que CUDA no se probó para este paquete de release.
- Despliegue mediante PyTorch con el runtime upstream de Mortal y el encoder `libriichi` compilado localmente; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Requisitos de toolchain: CPython 3.12, toolchain de Rust y enlazador C/C++ para construir el encoder nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mortal-S42 (S42.8k) | 10.835.631 | Dueling DQN sobre red residual de 40 bloques | Apache-2.0 (pesos); runtime AGPL-3.0-or-later | Pesos en HuggingFace; runtime upstream | Checkpoint de línea offline, sin RL online posterior |
| H20k (padre directo) | No disponible | Misma familia, etapa H | No disponible | No distribuido en este paquete | Seleccionado tras 20.000 updates de la fase H |
| `model_v4_20240308_best_min.pth` | No disponible | Mortal v4 comunitario | No disponible | No distribuido | Rango medio 2,51975 frente a S42 en 2v2 |
| `model_v4_20240308_mortal_min.pth` | No disponible | Mortal v4 comunitario | No disponible | No distribuido | Rango medio 2,51525 frente a S42 en 2v2 |

## Limitaciones y advertencias

- El modelo está entrenado para hanchan a cuatro jugadores; las reglas a tres jugadores y otras variantes no están validadas.
- Los valores Q son puntuaciones relativas de acción, no probabilidades de victoria calibradas; no deben interpretarse como tales.
- La comparación principal contra H20k no muestra ganancia significativa de fuerza, y las comparaciones comunitarias tienen intervalos que incluyen el cero; la evidencia de superioridad es débil.
- El bootstrap de las comparaciones comunitarias no agrupó por semilla espejada, lo que limita la solidez estadística reportada.
- El checkpoint contiene la última actualización guardada en el paso 42.800 y puede omitir actualizaciones posteriores al último límite de guardado.
- El tamaño del conjunto de la fase H no prueba que se consumieran todas las partidas, ya que H20 se seleccionó antes de completar el recorrido.
- Los conjuntos de datos crudos, identificadores de partidas y estado de entrenamiento no se distribuyen, lo que dificulta la reproducibilidad completa.
- El entrenamiento prioriza partidas de jugadores fuertes; el rendimiento por rango y plataforma no está establecido.
- La inferencia exige el ordenamiento correcto de eventos, el enmascaramiento de fichas ocultas y el encoder de observación upstream; usos incorrectos producen decisiones inválidas.
- Licencia mixta: los pesos son Apache-2.0, pero el runtime procede de Mortal y está bajo AGPL-3.0-or-later, lo que condiciona su uso en productos derivados.
- No hay datos publicados de sesgo, alucinación o latencia porque el modelo no es generativo y no se han reportado esas métricas.
- Uso previsto: análisis local, investigación y simulaciones de partidas controladas; no se declara aptitud para producción con dinero real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/banxiaweiliang/Mortal-S42
- Guía de inferencia: `INFERENCE.zh-CN.md` (incluida en el repositorio)
- Notas de entrenamiento e hiperparámetros: `TRAINING.zh-CN.md` (incluida en el repositorio)
- Configuración de entrenamiento: `training_config.json`
- Resúmenes de evaluación: `evaluation.json`
- Identidad del modelo: `model-identity.json`
- Detalles del benchmark comunitario: `COMMUNITY_BENCHMARK.zh-CN.md`
- Runtime upstream de Mortal: https://github.com/Equim-chan/Mortal (commit `0cff2b52982be5b1163aa9a62fb01f03ce91e0d2`)
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia del runtime: `runtime/LICENSE` (AGPL-3.0-or-later) y `NOTICE`
