# cognaclee/DDA-VLA

## Resumen

DDA-VLA (Dynamic Domain Adaptation for Vision-Language-Action) es un modelo de manipulación robótica desarrollado por el usuario cognaclee que aborda el problema del salto de dominio simulación-a-realidad (sim-to-real) en tareas de control robótico. La idea central es mantener la habilidad de manipulación en un dominio canónico de simulación y adaptar únicamente la interfaz de observación: un pequeño adaptador de tokens condicionado por instrucción mapea las observaciones desplazadas (nuevas texturas, iluminación, distractores, pose de cámara) de vuelta al espacio de tokens canónico, donde un experto de acciones basado en flow matching predice secuencias de acciones.

El modelo reutiliza las torres de visión y texto de π0 (`lerobot/pi0_base`) congeladas (PaliGemma SigLIP-So400m/14 y Gemma-2B) y añade un experto de acciones transformer de 6 capas y 16 millones de parámetros, junto con un adaptador de tokens de inicialización cero. Está entrenado y evaluado sobre RoboTwin 2.0 con 47 tareas y también incluye checkpoints afinados para un robot real Franka Panda en dos tareas.

Su relevancia actual radica en que demuestra que es posible mejorar drásticamente la robustez ante cambios de dominio visual sin reentrenar los encoders de visión-lenguaje, pasando de un 0,6 % de éxito en el dominio desplazado (entrenamiento solo en canónico) a hasta un 63,6 % con la variante ctx-pair. El repositorio ocupa 26 GB e incluye tanto código como checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action con encoders π0 congelados (PaliGemma SigLIP-So400m/14 + Gemma-2B) y experto de acciones flow-matching transformer |
| Parametros totales | Experto: 16 M; adaptador: no disponible (transformer pequeño); encoders π0 congelados no contabilizados en el checkpoint |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Tokens de historial de frames t−8 y t−16; rejilla espacial 4×4 por cámara más token agrupado; longitud exacta de contexto no disponible |
| Tipos de cuantizacion | No disponible (checkpoints en precisión original, ~95 MB cada uno) |
| Idiomas soportados | No disponible (instrucciones en lenguaje natural vía Gemma-2B; idiomas concretos no especificados) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

DDA-VLA combina tres componentes: (1) las torres de visión y texto de π0 congeladas, que producen tokens a partir de tres cámaras (`head_camera`, `left_camera`, `right_camera`) a 224×224 más la instrucción en lenguaje natural; (2) un adaptador de tokens `g_φ`, un transformer pequeño condicionado por instrucción con salida residual inicializada a cero (de modo que arranca como identidad), que mapea tokens de observaciones desplazadas al espacio canónico; y (3) un experto de acciones flow-matching de 6 capas, anchura 384 y horizonte 16, que predice chunks de 16 pasos de acciones de 14 dimensiones (posiciones articulares ALOHA-AgileX: 6 por brazo más pinza). La decodificación usa 8 pasos de ejecución, 10 pasos de Euler y sin ensamblado.

El entrenamiento de la etapa 1 se realiza sobre pares canónico/desplazado renderizados con física idéntica, con varias pérdidas: alineamiento Soft-DTW y transporte óptimo entrópico entre secuencias de tokens, identidad sobre tokens canónicos, consistencia del experto (las acciones sobre tokens adaptados deben coincidir con las canónicas), InfoNCE contrastivo entre frames del episodio y flow matching en las variantes conjuntas. Las variantes con contexto de episodio añaden el primer frame del episodio (ctx-shift) o ese frame más su render canónico (ctx-pair). Las etapas 2 y 3 (datos reales) están implementadas pero requieren datos reales. Los checkpoints liberados corresponden al experimento principal de RoboTwin 2.0 con 100 demostraciones por tarea y encoders π0.

## Capacidades

- Manipulación robótica visuomotora: predice chunks de 16 acciones de 14 dimensiones a partir de observaciones multicámara e instrucciones en lenguaje natural.
- Adaptación de dominio visual: robustez ante cambios de texturas, iluminación, distractores, pose de cámara y calidad de imagen mediante el adaptador de tokens.
- Condicionamiento por instrucción: el adaptador y el experto reciben la instrucción textual a través de los tokens de Gemma-2B.
- Uso de historial temporal: incorpora tokens de frames t−8 y t−16 para dar contexto temporal a la política.
- Generalización sim-to-real: checkpoints específicos afinados sobre datos reales de Franka Panda (dos tareas).
- Integración con el ecosistema π0/LeRobot: reconstruye las torres congeladas desde `lerobot/pi0_base`.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; el modelo es específico de robótica.

## Casos de uso

- Manipulación robótica en simulación con RoboTwin 2.0: ejecutar las 47 tareas del benchmark con los checkpoints liberados para reproducir los resultados de éxito reportados, usando el manifiesto de test y los límites de pasos oficiales.
- Despliegue sim-to-real con cambios de apariencia: emplear `x10_ctxshift.pt` cuando solo se dispone de las observaciones propias del robot, ya que no requiere el render canónico del simulador y alcanza un 52,3 % de éxito en el dominio desplazado.
- Escenarios con acceso al render canónico: usar `x10_ctxpair.pt` cuando se pueda obtener la renderización del simulador del primer frame, logrando el mejor resultado en dominio desplazado (63,6 %).
- Control de brazo Franka Panda en tareas reales: los checkpoints `franka_real_pi0_hist/x10_ctxshift.pt` permiten ejecutar las tareas `open_put_bottles_into_the_trash_cans` e `Franka_insert_blocks` con datos de teleoperación GELLO a 10 Hz.
- Investigación en adaptación de dominio: reutilizar el adaptador de tokens y las pérdidas (Soft-DTW, transporte óptimo, InfoNCE) como base para experimentos de robustez visual en otras políticas VLA.
- Comparación de baselines: los checkpoints `source_only.pt` y `cotrain.pt` sirven como referencias controladas para medir la ganancia del adaptador frente a entrenamiento solo canónico o co-entrenamiento.
- Evaluación reproducible: el evaluador rechaza ejecutar sobre semillas usadas en entrenamiento (registradas en `metadata["training_pairs"]`), lo que facilita protocolos de test limpios en pipelines de investigación.

## Benchmarks y rendimiento

Tasa de éxito en bucle cerrado (%) sobre RoboTwin 2.0: 47 tareas, 470 episodios de test retenidos por dominio (10 semillas por tarea), límites de pasos oficiales, GPUs A100 y renderizador SAPIEN. *Shift* es el dominio objetivo aleatorizado con movimiento de cámara a media intensidad (`--camera_strength 0.5`).

| Fichero | Método | Renders desplazados por demo | Modo eval | Clean | Shift |
|---|---|---|---|---|---|
| `source_only.pt` | Experto solo con demos canónicas | – | `source` | 57,9 | 0,6 |
| `cotrain.pt` | Co-entrenamiento en ambos dominios, sin adaptador | 1 | `source` | 62,1 | 26,6 |
| `frozen_adapter.pt` | Adaptador de tokens, experto congelado | 1 | `stage1` | 56,4 | 36,8 |
| `joint.pt` | DDA-VLA (conjunto): adaptador + experto | 1 | `stage1` | 61,3 | 37,7 |
| `joint_ctxshift.pt` | DDA-VLA + ctx-shift | 1 | `stage1` | 62,6 | 42,6 |
| `joint_ctxpair.pt` | DDA-VLA + ctx-pair | 1 | `stage1` | 62,8 | 55,5 |
| `x10_cotrain.pt` | Co-entrenamiento en ambos dominios, sin adaptador | 10 | `source` | 62,3 | 29,8 |
| `x10_ctxshift.pt` | DDA-VLA + ctx-shift (recomendado) | 10 | `stage1` | 65,1 | 52,3 |
| `x10_ctxpair.pt` | DDA-VLA + ctx-pair | 10 | `stage1` | 62,1 | 63,6 |

Cada fila es una única ejecución de entrenamiento; la época se seleccionó sobre episodios de entrenamiento retenidos, nunca sobre semillas de test. No se han publicado benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los checkpoints pesan ~95 MB cada uno, pero requieren reconstruir las torres π0 congeladas (PaliGemma SigLIP-So400m/14 + Gemma-2B) desde `lerobot/pi0_base`, lo que domina el consumo de memoria.
- GPUs de referencia: los experimentos se ejecutaron en GPUs A100 según la model card.
- GPU de consumo: no se especifica si cabe en RTX 4090 u otras GPUs consumer; dependerá de la VRAM necesaria para las torres π0 congeladas y el renderizador SAPIEN.
- Despliegue: el repositorio es PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo VLA de robótica). El renderizado de evaluación usa SAPIEN.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros (experto) | Contexto | Rendimiento RoboTwin 2.0 (Shift) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DDA-VLA (`x10_ctxpair.pt`) | 16 M (+ π0 congelado) | Historial t−8/t−16, rejilla 4×4 | 63,6 % | MIT | Hugging Face |
| DDA-VLA (`x10_ctxshift.pt`) | 16 M (+ π0 congelado) | Historial t−8/t−16, rejilla 4×4 | 52,3 % | MIT | Hugging Face |
| Co-entrenamiento sin adaptador (`x10_cotrain.pt`) | 16 M (+ π0 congelado) | Historial t−8/t−16, rejilla 4×4 | 29,8 % | MIT | Hugging Face |
| π0.5 full fine-tune (`franka_real_pi05/baseline/`) | No disponible | No disponible | No evaluado en RoboTwin | No disponible | Hugging Face (parcial) |

La comparativa directa con otros modelos VLA de terceros (p. ej., OpenVLA, π0 original) no está disponible en la información proporcionada; los únicos puntos de comparación documentados son las variantes internas del propio DDA-VLA y el baseline π0.5 afinado sobre datos reales de Franka.

## Limitaciones y advertencias

- Los checkpoints `ctx-pair` requieren el render canónico del simulador del primer frame de cada episodio, por lo que no son aplicables en despliegues reales sin acceso a esa renderización.
- Las etapas 2 y 3 (adaptación con datos reales) están implementadas pero necesitan datos reales; los checkpoints liberados corresponden a la etapa 1 sobre simulación.
- Los checkpoints de Franka se entrenaron con datasets de lirislab sin licencia declarada; conviene consultar a sus autores antes de redistribuir derivados.
- El modelo está especializado en manipulación robótica con la morfología ALOHA-AgileX y Franka Panda; no es un modelo de propósito general de texto o visión.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible; al ser una política visuomotora, el fallo se manifiesta como acciones incorrectas más que como texto inventado.
- Idiomas soportados no especificados; el condicionamiento textual depende de Gemma-2B, cuyas capacidades multilingües no se detallan.
- Licencia MIT para el código y checkpoints propios, pero las torres π0 subyacentes (`lerobot/pi0_base`) tienen sus propias condiciones que deben respetarse.
- Cada checkpoint registra sus semillas de entrenamiento y el evaluador rechaza ejecutar sobre ellas; es necesario usar semillas de test distintas para obtener métricas válidas.
- No se proporcionan datos de latencia, throughput ni requisitos de VRAM explícitos, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/cognaclee/DDA-VLA
- Encoders base π0: https://huggingface.co/lerobot/pi0_base
- π0.5 base (openpi): https://huggingface.co/lerobot/pi05_base
- Datasets de Franka de lirislab: `open_put_bottles_into_the_trash_cans` y `Franka_insert_blocks` en Hugging Face (rutas exactas no disponibles en la información proporcionada)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada
