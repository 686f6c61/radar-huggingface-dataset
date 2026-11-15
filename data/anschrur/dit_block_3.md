# anschrur/dit_block_3

## Resumen

`dit_block_3` es una política de imitación robótica basada en un Diffusion Transformer (DiT) con entrenamiento por flow matching, desarrollada por el usuario anschrur y publicada en Hugging Face. Resuelve una tarea concreta de manipulación con el brazo SO-10x: coger un vaso y colocarlo dentro de un anillo. No es un modelo de lenguaje ni un modelo generativo de propósito general; es un checkpoint de política visuomotora de una sola cámara entrenado sobre 101 episodios teleoperados.

El modelo tiene 16.660.576 parámetros y una dimensión oculta de 256 con 4 capas y 4 cabezas de atención. Usa un codificador de imagen ResNet-18 preentrenado en ImageNet (congelado) y predice secuencias de acciones de 48 frames mediante flow matching con muestreador Euler. La relevancia es acotada: sirve como referencia reproducible para experimentos de imitación robótica con presupuesto de cómputo fijo, y como sustituto directo de `dit_block_2` en el mismo script de despliegue.

El checkpoint se distribuye como un único `torch.save` (`policy.ckpt`, 66,7 MB) que no es compatible con `from_pretrained` de lerobot ni con el registro de políticas estándar. Requiere cargarse a través de `DiTAgent` del paquete `robot_imitation_glue`. Los normalizadores de estado y acción viajan dentro del fichero, sin los cuales el modelo es inutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching |
| Parametros totales | 16.660.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 48 frames (1,6 s a 30 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `policy.ckpt` (dict de `torch.save`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión con dimensión oculta 256, 4 capas y 4 cabezas de atención. La observación visual entra por un ResNet-18 preentrenado en ImageNet cuyas estadísticas de normalización se incluyen como `encoders.0.mean/std`. La predicción se formula como flow matching y se muestrea con el sampler Euler, con 10 pasos en el script de despliegue. El estado y la acción son vectores de 6 dimensiones en posiciones absolutas Feetech, en el orden `shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper`; las dimensiones 0-4 están en grados y la 5 en porcentaje de apertura (servo en `RANGE_0_100`). No es un vector de unidades homogéneas y no debe escalarse.

El entrenamiento usó el dataset `anschrur/record-test_2_20261115_115045`: 101 episodios, 28.498 frames, 30 fps, una sola tarea. Se realizaron 41.385 pasos de optimizador (93 épocas × floor(28.498/64), `drop_last=True`) con AdamW, lr 1e-4, weight decay 1e-4, warmup lineal de 500 pasos y decaimiento coseno hasta el 1 % de la tasa base (lr final 1e-6), grad-clip 10 y semilla 42. La pérdida final de entrenamiento fue 0,034032 en la época 93. El entrenamiento se ejecutó en una RTX 5090 (clúster imec iLab.t GPULab) en 1 h 46 min. El número de épocas se ajustó explícitamente para mantener el total de pasos en ~41 k y hacer una comparación equiparable con `dit_block_2` (41.200 pasos): al pasar de 13.218 a 28.498 frames, cada frame se visita 93 veces en lugar de 200. No hay validación ni conjunto de evaluación: el dataset declara `splits {train: 0:101}`, por lo que la pérdida reportada es de entrenamiento.

## Capacidades

- Generación de trayectorias de acción de 6 dimensiones para el brazo SO-10x en la tarea de coger un vaso y colocarlo en un anillo.
- Percepción visual monocular a partir de una única cámara frontal (`observation.images.front`), redimensionada de 480×640 a 128×128 con recorte central de 0,9.
- Predicción de chunks de 48 frames (1,6 s a 30 fps) mediante flow matching.
- Control en bucle cerrado a 30 fps, requisito impuesto por la definición del chunk en frames.
- Normalización de estado y acción incluida en el checkpoint (media y desviación típica por dimensión).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- **Investigación en imitación robótica con presupuesto fijo**: sirve como punto de comparación controlado frente a `dit_block_2`, ya que comparte arquitectura e hiperparámetros y solo cambia el volumen de datos y el número de épocas; útil para estudiar el efecto de escalar frames manteniendo pasos de optimizador.
- **Despliegue en bucle cerrado sobre un SO-101 físico**: el script `dit_on_robot.py` permite ejecutar la política contra el brazo a 30 fps con `--repo-id anschrur/dit_block_3`; el modo `--dry-run` valida la tubería sin mover el brazo.
- **Sustitución directa de `dit_block_2` en pipelines existentes**: al ser idéntico en arquitectura, cualquier script de despliegue que ya cargue `dit_block_2` puede apuntar a `dit_block_3` sin cambios de código, solo cambiando la ruta del checkpoint.
- **Reproducción de experimentos de flow matching en robótica**: el checkpoint incluye config, `image_size`, `crop_ratio`, estado del modelo y normalizadores, lo que permite reproducir la inferencia exacta sin depender del dataset original.
- **Docencia y prototipado de políticas DiT**: con 16,6 M de parámetros y un fichero de 66,7 MB, es ligero para demostrar el ciclo completo de entrenamiento e inferencia de una política de difusión en robótica de manipulación.
- **Pruebas de integración con `robot_imitation_glue`**: útil para validar el cargador `DiTAgent`, el mapeo de claves de cámara (`camera_key_mapping`) y el manejo de normalizadores en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdida de entrenamiento (0,034032 en la época 93) y su evolución por épocas (0,091574 en la 20; 0,059593 en la 40; 0,043904 en la 60; 0,034347 en la 80), sin métricas de éxito en tarea ni comparación cuantitativa con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 16,6 M de parámetros y un ResNet-18 congelado, el checkpoint de 66,7 MB es muy ligero, pero no se especifica el consumo real.
- GPU de entrenamiento documentada: 1× RTX 5090 (clúster imec iLab.t GPULab), 1 h 46 min.
- GPU recomendadas para inferencia: no disponible; el ejemplo de carga de la model card usa `device="cpu"`.
- ¿Cabe en GPU consumer? No se indica explícitamente, pero por tamaño de pesos es plausible; no hay confirmación del autor.
- Opciones de despliegue: `DiTAgent` del paquete `robot_imitation_glue` y el script `dit_on_robot.py`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles; el único requisito temporal documentado es que el bucle de control debe correr a 30 fps para que el chunk de 48 frames equivalga a 1,6 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Datos de entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| `anschrur/dit_block_3` | 16.660.576 | 48 frames (1,6 s a 30 fps) | 101 episodios, 28.498 frames | no disponible | `policy.ckpt` (torch.save) |
| `anschrur/dit_block_2` | 16.660.576 | 48 frames (1,6 s a 30 fps) | 30 episodios, 13.218 frames | no disponible | `policy.ckpt` (torch.save) |
| Otras políticas DiT para SO-10x | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con `dit_block_2`: misma arquitectura, mismos hiperparámetros, mismo dataset de origen y mismo presupuesto de pasos (41.385 frente a 41.200). `dit_block_3` añade 71 episodios y reduce las épocas de 200 a 93. La pérdida final es mayor (0,034032 frente a 0,018505), pero el autor advierte que no debe interpretarse como regresión porque los conjuntos de frames y el número de visitas difieren.

## Limitaciones y advertencias

- **No es un checkpoint `from_pretrained`**: no hay `config.json` ni `model.safetensors`; lerobot no puede abrirlo y hay que cargarlo con `DiTAgent`.
- **Los normalizadores son imprescindibles**: el modelo es inutilizable sin `proprio_normalizer_state_dict` y `action_normalizer_state_dict`, que viajan dentro del fichero.
- **Unidades heterogéneas en el vector de acción**: dimensiones 0-4 en grados y dimensión 5 en porcentaje de apertura; escalar el vector de forma uniforme rompe la política.
- **Requisito estricto de 30 fps**: el chunk de 48 frames solo equivale a 1,6 s si el bucle corre a 30 fps; a 10 fps se estira a 4,8 s y el control deja de ser válido.
- **Pérdida de entrenamiento, no de evaluación**: el dataset declara `splits {train: 0:101}`, sin conjunto de validación; no hay evidencia de generalización fuera de los episodios vistos.
- **Sin instantáneas intermedias**: `--save-every 20` reescribe el mismo `policy.ckpt`, por lo que solo sobreviven los pesos de la época 93 y no hay barrido de épocas para analizar.
- **Sesgos y alucinación**: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es el sobreajuste a la distribución de los 101 episodios y la falta de robustez ante cambios de iluminación, posición de cámara u objetos distintos.
- **Licencia no disponible**: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Alcance muy restringido**: una sola tarea, una sola cámara, un solo brazo (SO-10x); no es un modelo generalista de robótica.
- **Sin datos de benchmarks ni de éxito en tarea**: no hay métricas publicadas de tasa de éxito, por lo que la calidad real de la política no está cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anschrur/dit_block_3
- Dataset de entrenamiento: https://huggingface.co/datasets/anschrur/record-test_2_20261115_115045
- Modelo predecesor: https://huggingface.co/anschrur/dit_block_2
- Paquete `robot_imitation_glue` (referenciado en la model card, sin URL directa en la información disponible): no disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
