# jiankimr/qwen35-vla-libero-spatial-frozenB

## Resumen

Qwen-VLA sobre LIBERO-Spatial (variante B) es una política visión-lenguaje-acción (VLA) desarrollada por el usuario jiankimr que conecta el modelo de lenguaje Qwen3.5-4B con un experto de acción basado en un Diffusion Transformer (DiT) de 16 bloques, entrenado mediante flow matching con objetivo de behaviour cloning sobre demostraciones del benchmark robótico LIBERO-Spatial. La particularidad de esta variante es que el backbone Qwen permanece completamente congelado y solo se entrena el DiT de acción, lo que reduce los parámetros entrenables a 1,15 mil millones frente a los aproximadamente 4 mil millones del modelo completo.

El modelo resuelve el problema de generar comandos de control de un brazo robótico Franka Panda a partir de observaciones visuales (cámara externa y de muñeca) e instrucciones en lenguaje natural. Alcanza una tasa de éxito de 0,908 (454/500 episodios) en la evaluación oficial de LIBERO-Spatial, un resultado competitivo para una política entrenada únicamente sobre 10 tareas y 52.970 fotogramas.

Es relevante ahora porque demuestra que congelar el backbone VLM y entrenar solo el experto de acción es una estrategia viable para adaptar modelos de lenguaje de gran escala a robótica, reduciendo drásticamente el coste computacional del entrenamiento (2 GPU A100 80 GB, 10.000 pasos) y preservando las capacidades del modelo base. El checkpoint se publica en formato de state dict de PyTorch bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM Qwen3.5-4B (backbone congelado) + action DiT de 16 bloques con atención bidireccional conjunta y flow matching |
| Parámetros totales | Aproximadamente 4B (backbone) + 1,15B (DiT de acción) |
| Parámetros activos | No aplica (no es MoE); 1,15B entrenables en esta variante |
| Longitud de contexto | No disponible (el backbone Qwen3.5-4B define el contexto; no se especifica en la información proporcionada) |
| Tipos de cuantización | No disponible (los pesos se publican en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `torch.save` state dicts: `backbone.pt` (bf16, 9,1 GB) y `dit.pt` (bf16, 2,3 GB); no incluye estado del optimizador |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes. El backbone es Qwen3.5-4B (revisión `851bf6e8`, hidden size 2560), que procesa dos imágenes (cámara externa y de muñeca, redimensionadas a 224x224 RGB) junto con el prompt textual de la tarea. Una proyección lineal de 2560 a 1536 conecta la salida del VLM con el experto de acción. Este es un DiT de 16 bloques con hidden 1536, 12 cabezas de 128 dimensiones, FFN SwiGLU de 10240, atención bidireccional conjunta sobre tokens de contexto y de acción, modulación AdaLN por timestep y RoPE multi-sección THW (secciones 11/11/10, theta 1e7). Genera 16 tokens de acción de 64 dimensiones, de las cuales solo 7 se usan (6 de traslación/rotación delta del efector final más el comando de pinza), con el resto enmascarado.

El entrenamiento emplea flow matching con `x_tau = (1 - tau) a + tau eps`, objetivo `eps - a`, MSE enmascarado y `tau ~ Beta(1.5, 1.0)` escalado a [0,001, 1]. Los datos provienen del release LeRobot de LIBERO-Spatial (revisión `a4336d58`): 432 episodios y 52.970 fotogramas de 10 tareas, sin split de validación. Las acciones son comandos delta del efector final a 10 Hz, normalizados por dimensión con escalado afín q01/q99 sin recorte. Se entrenó 10.000 pasos (unas 12 épocas) con AdamW (betas 0,9/0,95, eps 1e-8, fused), learning rate 1e-4 para el DiT, weight decay 0,01 en matrices, warmup lineal de 500 pasos y decaimiento coseno hasta 0,1x el pico. Batch efectivo de 64 muestras por paso (4 por GPU x 8 acumulación x 2 GPU), precisión FSDP2 con bf16 y pesos maestros en FP32, clipping de gradiente 1,0, gradient checkpointing y semilla 42, sobre 2 GPU A100 80 GB.

## Capacidades

- Generación de acciones robóticas: predice secuencias de 16 comandos delta del efector final (traslación, rotación y pinza) a 10 Hz para un brazo Franka Panda.
- Comprensión visuo-lingüística: procesa simultáneamente dos vistas de cámara y una instrucción en lenguaje natural para condicionar la política.
- Razonamiento espacial: la evaluación en LIBERO-Spatial mide la capacidad de localizar y manipular objetos según relaciones espaciales descritas en la instrucción.
- Control de manipulación: tareas de pick-and-place sobre un bowl negro en distintas ubicaciones (plato, ramekin, caja de galletas, fogón, armario de madera, cajón).
- Inferencia con flow matching: 10 pasos de Euler desde ruido gaussiano, con desnormalización mediante estadísticas de cuantiles almacenadas.
- Replanificación: los chunks de 16 acciones se replanifican cada 5 pasos durante la evaluación.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión general, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Manipulación pick-and-place en simulación: el modelo puede ejecutar tareas de recogida y colocación de objetos sobre una mesa con relaciones espaciales variables, como demuestra su 0,908 de éxito en LIBERO-Spatial; es adecuado para prototipar políticas antes de transferir a hardware real.
- Investigación en políticas VLA: sirve como referencia para estudiar el efecto de congelar el backbone frente al fine-tuning conjunto (comparando con la variante jointA del mismo autor) en el coste y el rendimiento del entrenamiento.
- Evaluación comparativa de benchmarks robóticos: al estar entrenado y evaluado sobre el protocolo oficial de LIBERO-Spatial con semilla y estados iniciales fijos, permite reproducir y comparar resultados con otras políticas.
- Generación de datos sintéticos de control: las trayectorias predichas pueden usarse para aumentar datasets de demostraciones o para análisis de sensibilidad en entornos simulados.
- Base para fine-tuning en dominios específicos: al mantener el backbone congelado, es un punto de partida barato (solo 1,15B entrenables) para adaptar el experto de acción a nuevas tareas o morfologías con recursos limitados.
- Estudio de seguridad en robótica: el repositorio de código asociado (`vla_safety`) sugiere su uso en investigación sobre comportamiento seguro de políticas VLA en entornos controlados.
- Docencia y experimentación con flow matching: la configuración publicada (DiT, AdaLN, RoPE THW, flow matching con Beta(1.5, 1.0)) sirve como ejemplo reproducible de entrenamiento de un experto de acción sobre un VLM.

## Benchmarks y rendimiento

Evaluación en el simulador LIBERO-Spatial con estados iniciales oficiales, 50 episodios por tarea, semilla 7, chunks de 16 pasos replanificados cada 5 pasos y 10 pasos de denoising. Checkpoint del paso 10.000.

| Tarea | Éxito |
|---|---|
| Recoger el bowl negro entre el plato y el ramekin y colocarlo en el plato | 49/50 |
| Recoger el bowl negro junto al ramekin y colocarlo en el plato | 39/50 |
| Recoger el bowl negro del centro de la mesa y colocarlo en el plato | 50/50 |
| Recoger el bowl negro sobre la caja de galletas y colocarlo en el plato | 49/50 |
| Recoger el bowl negro del cajón superior del armario de madera y colocarlo en el plato | 39/50 |
| Recoger el bowl negro sobre el ramekin y colocarlo en el plato | 45/50 |
| Recoger el bowl negro junto a la caja de galletas y colocarlo en el plato | 47/50 |
| Recoger el bowl negro sobre el fogón y colocarlo en el plato | 44/50 |
| Recoger el bowl negro junto al plato y colocarlo en el plato | 46/50 |
| Recoger el bowl negro sobre el armario de madera y colocarlo en el plato | 46/50 |
| **Todas las tareas** | **454/500 = 0,908** |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otras políticas en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 suman aproximadamente 11,4 GB (9,1 GB del backbone más 2,3 GB del DiT), por lo que se necesitan al menos 12-16 GB de VRAM solo para cargar los pesos, más memoria para activaciones e imágenes.
- GPU recomendadas: A100 80 GB o H100 para entrenamiento y evaluación a escala; para inferencia, GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, L40S) son suficientes para cargar los pesos en bf16.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización o descarga parcial, no documentada en la información disponible.
- Opciones de despliegue: el autor proporciona código propio en el paquete `custom_vla` del repositorio `vla_safety` (carga mediante `qwen_vla.checkpoint.load_model_weights_file` y `qwen_vla.libero_eval.LiberoPolicy`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La inferencia usa 10 pasos de Euler por chunk de 16 acciones, replanificando cada 5 pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO-Spatial | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-vla-libero-spatial-frozenB (este) | ~4B backbone + 1,15B DiT; 1,15B entrenables | No disponible | 0,908 (454/500) | Apache 2.0 | Hugging Face, pesos en bf16 |
| qwen35-vla-libero-spatial-jointA | ~4B backbone + 1,15B DiT; fine-tuning conjunto | No disponible | No disponible en la información | Apache 2.0 | Hugging Face |
| Otras políticas VLA sobre LIBERO | No disponible | No disponible | No disponible | No disponible | No disponible |

La única alternativa directamente comparable documentada es la variante jointA del mismo autor, que entrena conjuntamente Qwen y el DiT; no se han proporcionado sus resultados numéricos. No se dispone de datos de otros modelos comparables en la información suministrada.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre 10 tareas de LIBERO-Spatial con un único robot (Franka Panda) y un único tipo de objeto (bowl negro); no se espera generalización a otras tareas, objetos o morfologías sin fine-tuning.
- Sin split de validación: los 432 episodios y 52.970 fotogramas se usaron íntegramente para entrenamiento, por lo que no hay estimación de generalización fuera de la distribución de entrenamiento.
- Idioma: solo inglés; las instrucciones en castellano no están soportadas de forma nativa.
- Evaluación únicamente en simulador: no se documentan pruebas en hardware real, y la brecha sim-to-real no está cuantificada.
- Riesgo de alucinación y errores de planificación: como política generativa, puede producir trayectorias inválidas o colisiones; las tasas de éxito por tarea bajan hasta 39/50 en los casos más difíciles (ramekin y cajón del armario).
- Formato de pesos no estándar: son state dicts de `torch.save` que requieren el código del autor (`custom_vla`), no safetensors ni GGUF; no incluye estado del optimizador, lo que dificulta reanudar el entrenamiento.
- Reproducibilidad dependiente del código externo: la carga y evaluación requieren el repositorio `vla_safety`, cuya estabilidad y mantenimiento no están garantizados.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-4B y del dataset LIBERO por separado.
- Sin datos de benchmarks generales: no hay evidencia publicada sobre el rendimiento del backbone en tareas de lenguaje o razonamiento tras el proceso, aunque al estar congelado debería conservar las capacidades originales de Qwen3.5-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiankimr/qwen35-vla-libero-spatial-frozenB
- Variante con fine-tuning conjunto: https://huggingface.co/jiankimr/qwen35-vla-libero-spatial-jointA
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Dataset LIBERO (LeRobot): https://huggingface.co/datasets/physical-intelligence/libero
- Repositorio de código `vla_safety`: https://github.com/WLS04/vla_safety
