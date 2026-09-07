# boeyyyy/EgoWAM-checkpoints

## Resumen

EgoWAM (World Action Models Beyond Pixels with In-the-Wild Egocentric Human Data) es un framework de co-entrenamiento humano-robot para manipulación robótica, presentado en CoRL 2026 por el grupo GaTech-RL2. El modelo aborda el problema de transferir datos egocéntricos humanos a robots, desenredando contenido transferible (objetos, escenas, semántica de tarea) de factores no transferibles (morfología humana, movimiento de cabeza, estilo de comportamiento). Para ello, propone World Action Models (WAMs) que predicen no solo acciones, sino también representaciones del mundo.

El framework fija el policy backbone, el action head y la mezcla de datos, y varía solo el target de predicción del mundo: píxeles (VAE), características DINO (RAE) o flujo 3D. Los checkpoints publicados incluyen un decoder RAE (stage-1) con 502M parámetros (87M congelados de facebook/dinov2-base y 415M entrenados), así como políticas para doblar ropa y tareas de pick en RoboTwin. No se especifica una longitud de contexto, ya que no es un modelo de lenguaje.

EgoWAM es relevante porque permite estudiar de forma controlada qué señal de entrenamiento produce mejores políticas de manipulación, un paso clave hacia el aprendizaje por imitación a escala con datos humanos in-the-wild.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Framework de world action model con policy backbone y action head fijos, y target de predicción variable (pixel, DINO, 3D flow). Incluye un decoder RAE (stage-1) con encoder DINOv2 congelado. |
| Parámetros totales | No disponible globalmente; el checkpoint RAE contiene 502M parámetros (87M congelados de facebook/dinov2-base + 415M del decoder entrenado). |
| Parámetros activos | No aplica (no es un modelo MoE). |
| Longitud de contexto | No disponible (no es un modelo de lenguaje). |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados). |
| Idiomas soportados | No disponible (modelo de robótica, no procesa lenguaje). |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoints (.pt y .ckpt) con estado de optimizador; no hay exportaciones en safetensors o GGUF. |

## Arquitectura y entrenamiento

EgoWAM es un framework de co-entrenamiento controlado humano-robot. Fija el policy backbone, el action head y la mezcla de datos, y varía únicamente el target de predicción del mundo: píxeles (VAE), características DINO (RAE) o flujo 3D (3D Flow). Esta configuración permite aislar el efecto de la señal de predicción en el rendimiento de la política. Los checkpoints incluyen un decoder RAE (stage-1) que reconstruye representaciones DINO, con el encoder facebook/dinov2-base congelado.

No se especifica el número de tokens ni la composición exacta del dataset en la información disponible. El entrenamiento utiliza datos egocéntricos humanos in-the-wild y tareas de RoboTwin. No se menciona RLHF ni DPO; el enfoque es de aprendizaje por imitación con world models. Los checkpoints se guardan en épocas concretas (1799 y 1999) y conservan el estado del optimizador para poder reanudar el entrenamiento.

## Capacidades

- Predicción de acciones y del mundo: el modelo predice acciones de manipulación y representaciones del mundo (píxeles, características DINO, flujo 3D).
- Manipulación robótica: incluye políticas para doblar ropa (fold_clothes) y tareas de pick en el entorno RoboTwin.
- Cross-embodiment: ofrece regímenes single y cross para evaluar la transferencia entre plataformas robóticas.
- Uso de datos egocéntricos humanos: entrenamiento con demostraciones humanas in-the-wild, lo que permite aprender de datos no capturados específicamente para robótica.
- Reanudación de entrenamiento: los checkpoints crudos incluyen estado del optimizador, permitiendo continuar el entrenamiento desde la época guardada.
- No aplica: no es un modelo de lenguaje, no genera texto, no soporta tool calling ni razonamiento multi-step en el sentido de un LLM.

## Casos de uso

- Investigación en aprendizaje por imitación: el framework permite comparar de forma controlada el efecto de distintos targets de predicción del mundo (pixel, DINO, 3D flow) en el rendimiento de políticas de manipulación. Se usaría ejecutando el entrypoint de validación del repositorio sobre los checkpoints correspondientes.
- Transferencia de datos humanos a robots: las políticas entrenadas con datos egocéntricos humanos pueden ejecutarse en robots reales o simulados, aprovechando que el modelo desenreda contenido transferible de factores no transferibles.
- Evaluación de políticas cross-embodiment: los checkpoints en régimen cross permiten probar si una política entrenada con una plataforma funciona en otra, lo que es útil para generalización en robótica.
- Doblado de ropa: el checkpoint fold_clothes_dinov2_c_widetrunk_1799.ckpt es una política específica para doblar ropa con representación DINO. Se cargaría con el código del repositorio y se evaluaría en bucle cerrado.
- Tareas de picking en RoboTwin: los ocho checkpoints robotwin_pick cubren cuatro targets de mundo y dos regímenes, permitiendo experimentos de recogida de objetos en el entorno RoboTwin.
- Reanudación de entrenamiento: los checkpoints crudos con estado de optimizador permiten continuar el entrenamiento desde la época guardada, útil para ajustar hiperparámetros o añadir datos.
- Validación en bucle cerrado: el repositorio ofrece un entrypoint (trainHydra.py) que reconstruye el modelo desde el config embebido y evalúa en la lista fija de 100 semillas del paper, lo que permite reproducir los resultados publicados.

## Benchmarks y rendimiento

La model card publica la tasa de éxito en bucle cerrado (closed-loop) sobre la lista fija de 100 semillas del paper. Los resultados se presentan por target de predicción y régimen (single y cross):

| | BC s | BC c | Pixel s | Pixel c | DINO s | DINO c | 3D Flow s | 3D Flow c |
|---|---|---|---|---|---|---|---|---|
| success | 2% | 9% | 6% | 17% | 3% | 28% | 1% | 19% |

No se han publicado comparaciones con modelos externos en la información disponible. La tabla es una comparación interna entre los targets de predicción del mundo dentro del framework EgoWAM.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la información disponible.
- El checkpoint RAE tiene 502M parámetros; en FP32 ocupa aproximadamente 2 GB, pero no se especifica la VRAM necesaria para inferencia.
- Los checkpoints son de entrenamiento y no se proporcionan exportaciones de inferencia; se cargan con PyTorch (torch.load).
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; el uso previsto es mediante el repositorio (trainHydra.py) y la carga directa de checkpoints.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. La única comparativa disponible es interna, entre los distintos targets de predicción del mundo dentro de EgoWAM.

## Limitaciones y advertencias

- Los checkpoints son crudos de entrenamiento (incluyen estado del optimizador), no exportaciones de inferencia; son más grandes y requieren el código del repositorio para cargarse.
- Dependen de pesos de terceros: RAE (MIT) y facebook/dinov2-base (Apache-2.0). La variante Pixel requiere el tokenizer Cosmos de NVIDIA, que es gated y no se redistribuye.
- La carga de los checkpoints requiere el alias `egomimic` y las rutas a `external/cosmos-policy` y `external/RAE/src`; sin esto, se produce `ModuleNotFoundError: No module named 'egomimic'`.
- El rendimiento en bucle cerrado es bajo en algunos regímenes (p. ej., BC single 2%, 3D Flow single 1%), lo que indica que la transferencia de datos humanos a robots sigue siendo un reto.
- No es un modelo de lenguaje: no procesa texto, no tiene tool calling ni ventana de contexto; su uso está limitado a robótica.
- No se han publicado análisis de sesgos; al entrenar con datos egocéntricos humanos, puede haber sesgos de morfología, movimiento de cabeza y estilo de comportamiento.
- La licencia MIT permite uso comercial, pero los pesos de terceros tienen sus propias licencias; el tokenizer Cosmos requiere acceso gated.

## Enlaces

- HuggingFace: https://huggingface.co/boeyyyy/EgoWAM-checkpoints
- Project page: https://gatech-rl2.github.io/egowam.github.io/
- Paper: https://huggingface.co/papers/2607.08436
- arXiv: https://arxiv.org/abs/2607.08436
- Code: https://github.com/GaTech-RL2/EgoWAM
