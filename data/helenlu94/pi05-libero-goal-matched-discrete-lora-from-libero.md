# helenlu94/pi05-libero-goal-matched-discrete-lora-from-libero

## Resumen

`pi05-libero-goal-matched-discrete-lora-from-libero` es un checkpoint de ajuste fino mediante LoRA del modelo base pi0.5 de Physical Intelligence, orientado a control robótico en el entorno de simulación LIBERO Goal. Lo publica el usuario helenlu94 en Hugging Face bajo la librería `openpi`, con un tamaño de repositorio de 6,3 GB que incluye los pesos de inferencia (`params/`) y las estadísticas de normalización (`assets/`).

El modelo resuelve una tarea muy concreta: ejecutar políticas visomotoras (visión-lenguaje-acción) sobre escenas del conjunto LIBERO Goal, con 11 tareas por escena y observaciones emparejadas. El checkpoint seleccionado corresponde al paso 22000, elegido por tasa de éxito en simulador (0,939) sobre escenas retenidas, no por la pérdida de validación mínima (que se alcanza en pasos posteriores).

Es relevante para investigadores que trabajan en evaluación de políticas VLA y quieran reproducir o comparar resultados de pi0.5 con ajuste LoRA sobre LIBERO sin reentrenar desde cero. No es un modelo de propósito general: es un artefacto de investigación con un dominio de aplicación restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (política visión-lenguaje-acción de Physical Intelligence) con adaptadores LoRA; detalles internos no disponibles |
| Parametros totales | no disponible (pesos base pi0.5 + LoRA; el repo ocupa 6,3 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de LIBERO se formulan en inglés) |
| Licencia | no disponible |
| Formato de pesos | pesos de openpi en `params/` (formato nativo openpi, no safetensors ni GGUF declarados) y estadísticas en `assets/` |

## Arquitectura y entrenamiento

El modelo parte de los pesos base de pi0.5 (`pi05_base`, no el checkpoint ya ajustado a LIBERO) y aplica un ajuste LoRA identificado como `pi05_matched_lora_from_libero_discrete`. La configuración de entrenamiento se denomina `matched_pi05_libero_goal_discrete_lora_from_libero`, lo que sugiere un régimen de acciones discretas y escenas emparejadas entre entrenamiento y validación.

Los datos de entrenamiento provienen del dataset `helenlu94/libero_goal_matched_150_multi_pick_place_targets_lerobot_v21_lossless`, en formato LeRobot v2.1 con imágenes PNG embebidas sin pérdida y el mismo diseño que `physical-intelligence/libero`. Cubre 150 escenas con 11 tareas cada una del entorno LIBERO Goal. El entrenamiento se extendió hasta el paso 40000 con parada temprana sobre escenas retenidas, y el checkpoint publicado es el de mejor validación (paso 22000, pérdida 0,00188, tasa de éxito 0,939). El run de Weights & Biases es `3bpksgeu` del proyecto "VLA Embeddings Analysis", y el commit de openpi utilizado es `7190119d04a3acd534f3e53caa6b567d353c5fdf`. No se detallan hiperparámetros de LoRA, composición exacta de las instrucciones ni si hubo etapas de RLHF o DPO (en el contexto de políticas VLA, el ajuste suele ser supervisado sobre demostraciones).

## Capacidades

- Ejecución de políticas visomotoras en el entorno LIBERO Goal: genera acciones a partir de observaciones visuales e instrucciones de tarea.
- Ajuste LoRA sobre pi0.5, lo que permite cargar el modelo con la configuración `pi05_matched_lora_from_libero_discrete` de openpi.
- Inferencia servida mediante `serve_policy.py` con el checkpoint descargado.
- Evaluación en simulador sin interfaz gráfica (headless) sobre 15 escenas retenidas y 11 tareas por escena.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- Capacidades multilingües no disponibles; el dominio es el de instrucciones de LIBERO.

## Casos de uso

- Reproducción de experimentos de políticas VLA: cargar el checkpoint con `serve_policy.py policy:checkpoint --policy.config pi05_matched_lora_from_libero_discrete --policy.dir <dir>` para replicar la tasa de éxito de 0,939 en las escenas retenidas.
- Comparación de métodos de ajuste eficiente: servir como referencia de LoRA sobre pi0.5 frente a ajustes completos o a otras variantes del mismo autor en LIBERO Goal.
- Análisis de selección de checkpoint: estudiar la divergencia entre pérdida de validación y tasa de éxito en simulador usando la tabla de pasos publicada (por ejemplo, el paso 32000 tiene menor pérdida, 0,00158, pero menor éxito, 0,909).
- Evaluación de robustez ante escenas emparejadas: medir el comportamiento en las 15 escenas retenidas del conjunto matched para detectar sobreajuste al conjunto de entrenamiento.
- Docencia e investigación en robótica simulada: usar el modelo como política de referencia en prácticas sobre LIBERO Goal sin necesidad de entrenar desde cero.
- Integración en pipelines de evaluación automatizada: ejecutar barridos headless sobre las 11 tareas y agregar métricas de éxito por tarea.

## Benchmarks y rendimiento

Los únicos datos publicados son la tasa de éxito en simulador y la pérdida de validación por paso de entrenamiento sobre las escenas retenidas (15 escenas × 11 tareas, headless):

| Paso | Tasa de éxito | Pérdida de validación |
|---|---|---|
| 2000 | 0,709 | 0,00740 |
| 4000 | 0,848 | 0,00534 |
| 6000 | 0,855 | 0,00374 |
| 8000 | 0,855 | 0,00342 |
| 10000 | 0,891 | 0,00289 |
| 12000 | 0,915 | 0,00286 |
| 14000 | 0,879 | 0,00206 |
| 16000 | 0,897 | 0,00224 |
| 18000 | 0,921 | 0,00191 |
| 20000 | 0,891 | 0,00189 |
| 22000 (publicado) | 0,939 | 0,00188 |
| 24000 | 0,921 | 0,00201 |
| 26000 | 0,915 | 0,00174 |
| 28000 | 0,909 | 0,00167 |
| 30000 | 0,921 | 0,00182 |
| 32000 | 0,909 | 0,00158 |
| 34000 | 0,927 | 0,00176 |
| 36000 | 0,927 | 0,00188 |
| 38000 | 0,915 | 0,00163 |
| 40000 | 0,903 | 0,00169 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible; no son aplicables a este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 6,3 GB en disco, lo que da una cota inferior orientativa para cargar los pesos en memoria.
- GPU recomendadas: no disponibles; openpi suele ejecutarse en GPUs de datacenter, pero el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; no se indica si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: servidor de políticas de openpi mediante `serve_policy.py` con la configuración `pi05_matched_lora_from_libero_discrete`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Ajuste | Contexto | Métrica publicada | Licencia |
|---|---|---|---|---|---|
| pi05-libero-goal-matched-discrete-lora-from-libero (este) | pi0.5 base | LoRA, paso 22000 | no disponible | 0,939 de éxito en 15 escenas × 11 tareas | no disponible |
| Checkpoint LIBERO de Physical Intelligence (`physical-intelligence/libero`) | pi0.5 | ajuste sobre LIBERO | no disponible | no disponible en esta ficha | no disponible |
| Otras variantes del mismo autor en LIBERO Goal | pi0.5 | LoRA con otras configuraciones | no disponible | no disponible en esta ficha | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas fuera del ecosistema openpi.

## Limitaciones y advertencias

- Dominio restringido: solo se ha evaluado en LIBERO Goal con 150 escenas y 11 tareas; no hay evidencia de generalización fuera de ese entorno.
- Selección de checkpoint por éxito en simulador sobre escenas retenidas, con posible sobreajuste a esas escenas concretas; la pérdida de validación no es monótona con el éxito (el mínimo de pérdida está en el paso 32000, no en el 22000 publicado).
- Sin licencia declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia de los pesos base de pi0.5.
- Sin información sobre sesgos, alucinación o robustez ante cambios de iluminación, cámara o distribución de objetos.
- Idiomas no declarados; las instrucciones de LIBERO están en inglés y no se documenta soporte para otras lenguas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.
- Dependencia estricta del commit de openpi `7190119d04a3acd534f3e53caa6b567d353c5fdf`; cambios posteriores en la librería pueden romper la carga del checkpoint.
- El formato de pesos es el nativo de openpi, no safetensors ni GGUF, lo que limita su uso fuera de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/helenlu94/pi05-libero-goal-matched-discrete-lora-from-libero
- Dataset de entrenamiento: https://huggingface.co/datasets/helenlu94/libero_goal_matched_150_multi_pick_place_targets_lerobot_v21_lossless
- Dataset de referencia LIBERO: https://huggingface.co/datasets/physical-intelligence/libero
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Run de Weights & Biases: proyecto "VLA Embeddings Analysis", run id `3bpksgeu` (no se proporciona URL directa)
- Commit de openpi: `7190119d04a3acd534f3e53caa6b567d353c5fdf`
