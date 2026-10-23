# bx6d/r2s2r-smolvla-blue-cube-to-bowl-stage1

## Resumen

`bx6d/r2s2r-smolvla-blue-cube-to-bowl-stage1` es un ajuste fino del modelo base `lerobot/smolvla_base` (familia SmolVLA) realizado por el usuario bx6d para una única tarea de manipulación robótica: coger un cubo azul y depositarlo en un cuenco. Se trata de una política visión-lenguaje-acción (VLA) entrenada por imitación sobre 400 episodios del dataset `bx6d/r2s2r-blue-cube-to-bowl-stage1`, ejecutados en MuJoCo y renderizados con Blender EEVEE sobre un brazo xArm6.

El interés del modelo es metodológico más que de producto: comparte formato de acciones (20 objetivos absolutos de articulación y pinza a 20 Hz por llamada) y suites de evaluación cerrada con el modelo hermano `bx6d/r2s2r-pi05-blue-cube-to-bowl-stage1`, de modo que ambos pueden compararse directamente sobre los mismos ensayos congelados. El autor publica cuatro checkpoints (5k, 10k, 15k y 20k pasos) con tasas de éxito e intervalos de confianza de Wilson, además de las suites, curvas de aprendizaje y vídeos de rollouts.

Es relevante ahora porque documenta con rigor una comparación controlada entre SmolVLA y pi0.5 en una tarea de pick-and-place, e incluye un hallazgo técnico concreto: la precisión en bucle abierto es prácticamente idéntica entre ambos modelos, pero la brecha aparece solo en bucle cerrado. Todo el trabajo es exclusivamente de simulación; la dinámica real del robot y las extrínsecas de cámara no están validadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) SmolVLA de LeRobot; ajuste fino de `lerobot/smolvla_base` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors sin indicación de cuantización) |
| Idiomas soportados | no disponible (la única instrucción de tarea documentada está en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors, con layout `pretrained_model` de LeRobot (incluye `config.json`, preprocesador y postprocesador) |
| Tamaño del repositorio | 3,6 GB |
| Pasos de entrenamiento publicados | 5.000, 10.000, 15.000 y 20.000 |
| Chunk de acciones | 20 pasos (`chunk_size` 20, `n_action_steps` 20) |
| Frecuencia de control | 20 Hz (50 ms por paso) |
| Entradas | Dos cámaras RGB a 224x224 (`table`, `wrist`) y estado de 8 articulaciones en radianes |
| Salida | Tensor (20, 7): 6 objetivos absolutos de articulación en radianes y comando de pinza en [0, 255] |
| Dataset de entrenamiento | `bx6d/r2s2r-blue-cube-to-bowl-stage1`, 400 episodios |
| Librería | `lerobot` 0.6.1 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `lerobot/smolvla_base` siguiendo la receta estándar de SmolVLA en LeRobot. La política consume dos flujos de imagen (cámara de mesa y cámara de muñeca), el estado articular medido y una instrucción de tarea en lenguaje natural, y emite un chunk de 20 acciones a 20 Hz. El preprocesador guardado renombra `table` a `camera1` y `wrist` a `camera2` del modelo base, dejando vacía la tercera ranura de cámara tal y como se hizo durante el entrenamiento. El postprocesador se encarga de desnormalizar las acciones.

El entrenamiento es puramente imitación (behavior cloning) sobre 400 episodios de demostración ejecutados por actuadores en MuJoCo y renderizados con Blender EEVEE; no se documenta RLHF, DPO ni ninguna fase de refinamiento por preferencias. Se publican checkpoints intermedios para estudiar la curva de aprendizaje: el rendimiento in-distribution se estanca a partir de 10.000 pasos, mientras que el rendimiento fuera de distribución sigue mejorando hasta 20.000. El autor señala explícitamente que la precisión en bucle abierto de SmolVLA a 20k es equivalente a la de pi0.5 (error dentro de 0,0096 rad respecto a los objetivos del experto en 76 frames de validación, mediana 0,0062), y que la diferencia entre ambos modelos se manifiesta únicamente al cerrar el bucle.

## Capacidades

- Generación de chunks de acción de 20 pasos (1 segundo de trayectoria) con 6 objetivos absolutos de articulación más comando de pinza en [0, 255].
- Manipulación robótica de tipo pick-and-place: agarre del cubo, elevación y colocación en el cuenco.
- Condicionamiento por instrucción de lenguaje natural (la tarea documentada es «Pick up the blue cube and place it in the bowl.», en inglés).
- Fusión multimodal de dos vistas RGB, estado propioceptivo de 8 valores y texto de tarea.
- Ejecución en bucle cerrado con realimentación visual: las observaciones se actualizan en cada chunk.
- Robustez parcial a variaciones de posición de objetos (evaluada con suites OOD de posición, solo cubo, solo cuenco y ambos).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, matemáticas, generación de código ni otras modalidades (audio, vídeo) ajenas al contrato de entrada/salida robótico.

## Casos de uso

- Investigación en pick-and-place simulado: el modelo sirve como política de referencia para reproducir el experimento completo (entrenamiento, checkpoints y suites congeladas) en MuJoCo con un xArm6, sin necesidad de robot físico.
- Comparación controlada de arquitecturas VLA: al compartir formato de acciones y ensayos con `bx6d/r2s2r-pi05-blue-cube-to-bowl-stage1`, permite medir la brecha SmolVLA frente a pi0.5 con pruebas pareadas y estadística (McNemar) en lugar de comparaciones anecdóticas.
- Estudio de curvas de entrenamiento y sobreajuste: los cuatro checkpoints publicados permiten analizar por qué la métrica in-distribution se satura a los 10k pasos mientras la OOD continúa subiendo hasta 20k.
- Análisis de brecha entre bucle abierto y bucle cerrado: útil para investigar acumulación de error y estabilidad de políticas de imitación, dado que el modelo iguala a pi0.5 en error de chunk pero rinde por debajo en ejecución cerrada.
- Punto de partida para ajuste fino en tareas de laboratorio: al ser un fine-tune de `lerobot/smolvla_base` con la receta estándar y el `train_config.json` incluido, sirve como plantilla reproducible para reentrenar con nuevos objetos o posiciones.
- Evaluación de protocolos de seguridad y timeouts: todos los fallos observados son timeouts de 90 s sin abortos de seguridad, lo que permite usar el modelo para probar lógica de recuperación y límites temporales en el stack de control.
- Docencia y divulgación en robótica con IA: el wrapper `inference_example.py` y el comando de verificación contra un frame del dataset facilitan demostraciones autocontenidas en GPU de consumo, con menos de 1 GB de VRAM.

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre suites congeladas de 50 ensayos por condición, con el mismo ruido de política por ensayo. Intervalos de confianza de Wilson al 95 % entre paréntesis.

| Paso | In-distribution (50) | OOD posiciones (50) | OOD solo cubo (20) | OOD solo cuenco (20) | OOD ambos (10) |
|---:|---|---|---|---|---|
| 5.000 | 26/50 = 52 % (39-65) | 17/50 = 34 % (22-48) | 1/20 | 13/20 | 3/10 |
| 10.000 | 40/50 = 80 % (67-89) | 31/50 = 62 % (48-74) | 11/20 | 15/20 | 5/10 |
| 15.000 | 38/50 = 76 % (63-86) | 30/50 = 60 % (46-72) | 13/20 | 10/20 | 7/10 |
| 20.000 (final) | 40/50 = 80 % (67-89) | 35/50 = 70 % (56-81) | 13/20 | 14/20 | 8/10 |

Desglose por fase de la tarea en el checkpoint de 20k: tasa de agarre del 100 % en ambas suites, elevación del 86 % in-distribution y 80 % OOD, y colocación del 80 % in-distribution y 70 % OOD. Todos los fallos son timeouts de 90 s; no se registraron abortos de seguridad.

Comparación con el ajuste fino completo de pi0.5 sobre los mismos ensayos: 49/50 in-distribution y 44/50 OOD a los 10.000 pasos. En los ensayos pareados la ventaja es estadísticamente significativa (McNemar p = 0,012 in-distribution y p = 0,035 OOD). En bucle abierto, sobre 76 frames de validación retenidos, los chunks de un segundo de SmolVLA 20k quedan dentro de 0,0096 rad de los objetivos del experto (mediana 0,0062), esencialmente igual que pi0.5.

No se han publicado resultados de benchmarks estándar de lenguaje o visión (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB de memoria de GPU, según el autor.
- Latencia: aproximadamente 0,2 s por llamada en una B300, generando un chunk de 1 segundo de acciones a 20 Hz.
- GPU recomendadas: no hay lista oficial; el autor solo reporta mediciones en NVIDIA B300. Por el consumo de memoria documentado (<1 GB) es plausible su ejecución en GPU de consumo, pero no se aportan datos de latencia ni compatibilidad en RTX 4090, RTX 3090 u otras.
- Despliegue: pila LeRobot (`pip install 'lerobot[smolvla]==0.6.1'`), Python 3.12, PyTorch 2.11 con CUDA 13.0 y transformers 5.5. El modelo se carga con `SmolVLAPolicy.from_pretrained` más `make_pre_post_processors`.
- No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama; el formato es específico de LeRobot y no se indican conversiones a GGUF.
- Throughput: no disponible más allá de la latencia por llamada indicada.
- Los estados del optimizador no se incluyen, por lo que el repositorio no está preparado para reanudar el entrenamiento tal cual.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Éxito in-distribution | Éxito OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `bx6d/r2s2r-smolvla-blue-cube-to-bowl-stage1` (20k) | VLA SmolVLA, fine-tune | no disponible | no disponible | 40/50 = 80 % | 35/50 = 70 % | no disponible | HuggingFace, 0 descargas, 0 likes |
| `bx6d/r2s2r-pi05-blue-cube-to-bowl-stage1` (10k, fine-tune completo) | VLA pi0.5, fine-tune | no disponible | no disponible | 49/50 = 98 % | 44/50 = 88 % | no disponible | HuggingFace |
| `lerobot/smolvla_base` | VLA SmolVLA preentrenado | no disponible | no disponible | no evaluado en esta tarea | no evaluado en esta tarea | no disponible | HuggingFace (modelo base) |

La comparación con pi0.5 es directa porque ambos usan el mismo dataset, el mismo formato de 20 acciones absolutas a 20 Hz y las mismas suites congeladas. No se dispone de datos para comparar con otras políticas de manipulación (por ejemplo, ACT o Diffusion Policy) en esta tarea.

## Limitaciones y advertencias

- Entrenamiento y evaluación exclusivamente en simulación (MuJoCo con renderizado Blender EEVEE): la dinámica real del robot y las extrínsecas de cámara física no están validadas, por lo que el rendimiento en un xArm6 real es desconocido.
- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Dataset sintético de solo 400 episodios y una única tarea; la generalización a otros objetos, colores o instrucciones no está demostrada.
- Caída de rendimiento fuera de distribución: 80 % in-distribution frente a 70 % OOD en el checkpoint final, con el caso más débil en la suite «solo cubo» (13/20).
- La fase de colocación es el principal cuello de botella (80 % in-distribution, 70 % OOD), pese a un 100 % de agarre.
- Todos los fallos son timeouts de 90 s: el modelo no aborta, simplemente no completa la tarea, lo que exige supervisión temporal externa en cualquier despliegue.
- Brecha bucle abierto/bucle cerrado: el error de chunk es casi idéntico al de pi0.5, pero el éxito cerrado es sensiblemente menor, indicando acumulación de error y sensibilidad a la realimentación visual.
- La tercera ranura de cámara del modelo base se deja vacía; añadir una cámara adicional en inferencia supone una distribución de entrada distinta a la de entrenamiento.
- La única instrucción documentada está en inglés; no hay datos sobre comportamiento con instrucciones en castellano u otros idiomas.
- Riesgo de alucinación no aplica en el sentido textual, pero sí existe riesgo de acciones fuera de rango: el comando de pinza se recorta a [0, 255] y el autor menciona recorte adicional de los objetivos de articulación en evaluación, sin detallar los límites exactos.
- Distribución de pesos sin estados del optimizador: no es reanudable para entrenamiento directo.
- Sin cuantizaciones publicadas: el despliegue queda ligado a PyTorch/LeRobot en FP32/BF16, sin opciones ligeras tipo GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bx6d/r2s2r-smolvla-blue-cube-to-bowl-stage1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/bx6d/r2s2r-blue-cube-to-bowl-stage1
- Modelo hermano pi0.5 para comparación directa: https://huggingface.co/bx6d/r2s2r-pi05-blue-cube-to-bowl-stage1
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos no guardan relación con el contenido); papers, blogs y demos adicionales: no disponible.
