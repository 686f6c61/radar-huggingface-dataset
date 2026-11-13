# namhokaist/simplememvla-robocasa-spice-cup-storage-cotrain-ck3000

## Resumen

SimpleMemVLA para RoboCasa (checkpoint-3000) es una política visión-lenguaje-acción (VLA) desarrollada por el usuario namhokaist, construida sobre el proyecto SimpleMemVLA de OpenBMB. El modelo parte de un backbone Qwen3.5-4B al que se le acopla la cabeza de acción original basada en flow matching, y está especializado en el control del manipulador móvil PandaOmron dentro de los entornos de cocina del simulador RoboCasa. Su función es traducir instrucciones en lenguaje natural e historial de vídeo en secuencias de acciones motoras de 16 pasos.

El modelo se obtiene mediante un ajuste fino del checkpoint `simplememvla-robocasa-atomic65-indomain-ck30000`, que cubre las 65 tareas atómicas de RoboCasa, sobre dos conjuntos de demostraciones nuevas de tipo "observar almacenamiento y luego recuperar": un tarro de especias escondido bajo una de dos tapas y una taza guardada a izquierda o derecha. La instrucción no revela el lado, de modo que la política debe extraerlo del historial de vídeo, lo que convierte a este checkpoint en un banco de pruebas para la memoria episódica en VLA. El entrenamiento se hace en co-training con las demostraciones atómicas para evitar olvido catastrófico.

La relevancia actual radica en que aborda un problema abierto en robótica: la integración de memoria a largo plazo en políticas VLA sin degradar el rendimiento en tareas ya aprendidas. El modelo demuestra que la información de almacenamiento se recupera de los frames históricos y no de la vista actual ni de la duración, aunque el autor reconoce que las tareas de almacenamiento solo se han evaluado en bucle abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone transformer Qwen3.5-4B + cabeza de acción flow matching (SimpleMemVLA) |
| Parametros totales | no disponible (backbone de 4B declarado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de robótica) |
| Licencia | other / see-upstream-licenses (ver enlaces upstream) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 11,4 GB |
| Pipeline | robotics |
| Librería | transformers |
| Modelo base | namhokaist/simplememvla-robocasa-atomic65-indomain-ck30000 |
| Checkpoint | 3000 |
| Tareas | 65 atómicas RoboCasa + almacenamiento/recuperación de especias y tazas |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño SimpleMemVLA: un backbone de lenguaje y visión Qwen3.5-4B que procesa la instrucción y el historial de vídeo, conectado a una cabeza de acción basada en flow matching que genera chunks de 16 acciones. El modelo incorpora un mecanismo de memoria episódica que permite condicionar la predicción de acciones en frames de observaciones pasadas, lo que resulta crítico para tareas donde el estado actual no contiene la información necesaria (por ejemplo, en qué lado se guardó un objeto).

El entrenamiento parte del checkpoint atómico de 65 tareas y se ajusta en co-training sobre dos datasets de demostraciones inmediatas (`robocasa-spice-immediate-100` y `robocasa-cup-immediate-100`, 100 episodios cada uno) mientras se repiten las demostraciones atómicas para preservar capacidades previas. No se especifican en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es el uso del historial de vídeo como fuente de información para la selección de lado, validado con controles de duración, longitud de entrada y vista actual.

## Capacidades

- Generación de acciones motoras de 16 pasos para el manipulador móvil PandaOmron en entornos RoboCasa.
- Procesamiento conjunto de instrucciones en lenguaje natural, observaciones visuales actuales e historial de vídeo.
- Memoria episódica: recuperación de información de almacenamiento (lado izquierdo/derecho) a partir de frames históricos, no de la vista actual.
- Control de brazo (deltas de articulaciones), pinza (abrir/cerrar) y base móvil (modo y movimiento).
- Ejecución de 65 tareas atómicas de RoboCasa (manipulación de objetos en cocina).
- Tareas de "observar almacenamiento y recuperar" para especias y tazas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües en la información disponible.

## Casos de uso

- Investigación en memoria episódica para VLA: el modelo sirve como banco de pruebas controlado para estudiar si una política recupera información de frames históricos frente a la vista actual, gracias a los controles de duración y longitud reportados.
- Manipulación de objetos en cocinas simuladas: ejecución de tareas atómicas como abrir cajones, mover utensilios o colocar objetos, con una tasa de éxito en bucle cerrado del 46,9 % en 65 tareas.
- Tareas de almacenamiento y recuperación: el robot observa dónde se guarda un objeto y posteriormente lo recupera, usando el historial de vídeo para decidir el lado correcto.
- Evaluación de co-training y olvido catastrófico: comparación del rendimiento atómico (46,9 % frente al 52,2 % del checkpoint base) para estudiar el compromiso entre aprender tareas nuevas y retener las antiguas.
- Generación de datos sintéticos de demostraciones: el modelo puede predecir chunks de acciones en bucle abierto sobre demostraciones grabadas, útil para aumentar datasets o validar pipelines.
- Desarrollo de políticas para manipuladores móviles: integración en el stack de RoboCasa para experimentar con arquitecturas VLA con memoria en entornos de cocina.
- Benchmarking de memoria en robótica: uso de los escenarios de especias y tazas como test de si la política depende de frames históricos o de atajos de estado/duración.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (no verificados de forma independiente):

| Evaluación | Checkpoint base | Este checkpoint (ck3000) |
|---|---|---|
| Tareas atómicas, bucle cerrado (305/650) | 339/650 (52,2 %) | 305/650 (46,9 %, Wilson 95 % 43,1–50,8 %) |
| Especias, historial propio (held-out, 10 episodios) | 5/10 | 10/10 |
| Especias, historial del par (lado opuesto) | 5/10 | 10/10 |
| Especias, sin historial | 5/10 | 5/10 |
| Tazas, historial propio (held-out) | no disponible | 10/10 |
| Tazas, historial del par | no disponible | 6/10 |
| Correlación delta de brazo (especia / taza) | 0,158 / 0,101 | 0,933 / 0,945 |
| MAE delta de brazo normalizado (especia / taza) | 0,373 / 0,226 | 0,071 / 0,028 |
| Acuerdo pinza abrir/cerrar (especia / taza) | 0,755 / 0,821 | 0,987 / 0,991 |
| Acuerdo modo base (especia / taza) | 1,000 / 0,785 | 1,000 / 0,985 |
| Correlación movimiento base (taza) | 0,265 | 0,988 |
| Pérdida de acción held-out (sondas de ruido fijo) | 0,644 | 0,037 (update 3.000) |

Notas: las tareas de especias y tazas se evalúan en bucle abierto (comparación con demostraciones grabadas), no en simulador. La evaluación atómica es en bucle cerrado en el simulador RoboCasa, in-domain (no layout-disjoint). Los checkpoints intermedios (500, 1.000, 1.500, 2.000, 2.500) alcanzan 10/10 en las cuatro historias de especias en held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con un backbone de 4B y pesos en safetensors de 11,4 GB, se requiere al menos una GPU con 16-24 GB en precisión completa, y menos con cuantización (no documentada).
- GPU recomendadas: no especificadas por el autor; por tamaño del backbone, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 son opciones razonables.
- Cabe en GPU de consumo: probablemente en RTX 4090 y posiblemente en GPUs de 16 GB con cuantización, aunque no se confirma en la información disponible.
- Opciones de despliegue: transformers (librería declarada); no se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento atómico RoboCasa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simplememvla-robocasa-spice-cup-storage-cotrain-ck3000 (este) | Backbone 4B | no disponible | 305/650 (46,9 %) | other / see-upstream-licenses | Hugging Face |
| simplememvla-robocasa-atomic65-indomain-ck30000 (base) | Backbone 4B | no disponible | 339/650 (52,2 %) | other / see-upstream-licenses | Hugging Face |
| Otros VLA comparables (p. ej. OpenVLA, π0) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (OpenVLA, π0, RT-2) no está disponible en la información proporcionada; solo se dispone de la comparación directa con el checkpoint base del mismo proyecto.

## Limitaciones y advertencias

- Las tareas de especias y tazas solo se han evaluado en bucle abierto; no hay tasa de éxito en bucle cerrado en simulador para ellas.
- La evaluación de memoria se basa en 10 episodios held-out (5 grupos de escenario), con intervalo de Wilson del 95 % de 0,72–1,00 para 10/10; muestra pequeña.
- Todos los 200 episodios provienen de un único layout y estilo de cocina, lo que limita la generalización.
- En tazas, la duración del almacenamiento separa el lado en 100/100 episodios y en 44 de 50 pares la pose del efector ya revela el lado, por lo que gran parte de la tarea no es un test de memoria real.
- El rendimiento en tareas atómicas cae respecto al checkpoint base (46,9 % frente a 52,2 %), lo que sugiere cierto olvido o compromiso por el co-training.
- Riesgo de alucinación de acciones no cuantificado; la política puede generar chunks plausibles pero incorrectos en estados no vistos.
- Licencia "other / see-upstream-licenses": es necesario revisar las licencias upstream (SimpleMemVLA, Qwen3.5, RoboCasa) antes de uso comercial.
- No se documentan sesgos, idiomas soportados ni limitaciones de contexto; el modelo está orientado exclusivamente a robótica en RoboCasa.
- La evaluación atómica es in-domain (no layout-disjoint), por lo que no mide generalización a layouts nuevos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namhokaist/simplememvla-robocasa-spice-cup-storage-cotrain-ck3000
- Modelo base: https://huggingface.co/namhokaist/simplememvla-robocasa-atomic65-indomain-ck30000
- Repositorio SimpleMemVLA (OpenBMB): https://github.com/OpenBMB/SimpleMemVLA
- Dataset especias: https://huggingface.co/datasets/luca0621/robocasa-spice-immediate-100
- Dataset tazas: https://huggingface.co/datasets/luca0621/robocasa-cup-immediate-100
- Licencia upstream: https://github.com/OpenBMB/SimpleMemVLA
