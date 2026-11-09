# jiankimr/qwen35-vla-libero-spatial-jointA

## Resumen

Qwen-VLA sobre LIBERO-Spatial (variante A, ajuste conjunto) es una política visión-lenguaje-acción (VLA) construida sobre el modelo de lenguaje multimodal Qwen3.5-4B y publicada por el usuario jiankimr. El modelo conecta el backbone preentrenado Qwen3.5-4B con un experto de acción DiT de 16 bloques inicializado desde cero, y se entrena con un objetivo de *flow matching* bajo aprendizaje por imitación sobre las demostraciones del benchmark robótico LIBERO-Spatial. El checkpoint publicado corresponde al paso 10.000 de entrenamiento.

La relevancia de esta ficha es doble. Por un lado, demuestra la viabilidad de reutilizar un VLM de 4.000 millones de parámetros como columna vertebral de una política robótica de manipulación con horizonte corto. Por otro, publica una ablación limpia frente a su variante hermana con backbone congelado (`qwen35-vla-libero-spatial-frozenB`), lo que permite aislar el efecto del ajuste fino del backbone frente al de solo entrenar el experto de acción. El resultado reportado es un 0,99 de éxito (495/500 episodios) en la evaluación oficial del simulador.

El modelo es de investigación: no incluye código de inferencia en el propio repositorio de pesos (los pesos son *state dicts* de PyTorch) y depende del paquete `custom_vla` del repositorio `vla_safety` para cargarse y evaluarse. El idioma declarado es inglés y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Qwen3.5-4B (encoder visual + backbone de lenguaje, hidden 2560) + experto de acción DiT de 16 bloques (hidden 1536, 12 cabezas x 128, SwiGLU FFN 10240, atención bidireccional conjunta contexto/acción, AdaLN de timestep, RoPE THW multi-sección 11/11/10 con theta 1e7) |
| Parametros totales | No disponible de forma explícita; el backbone Qwen3.5-4B ronda los 4.000 M y el DiT añade un experto de acción (tamaño no declarado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el prompt incluye dos imágenes y una instrucción; no se declara ventana) |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `torch.save` *state dicts* (`weights_only=True` cargables): `backbone.pt` (bf16, 9,1 GB) y `dit.pt` (bf16, 2,3 GB); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un VLA híbrido: un backbone visión-lenguaje Qwen3.5-4B (revisión `851bf6e8`, hidden size 2560) procesa dos vistas de cámara (externa y de muñeca) a 224x224 RGB junto con la instrucción en lenguaje natural. Una proyección lineal de 2560 a 1536 adapta el contexto al experto de acción, un transformer DiT de 16 bloques con atención bidireccional conjunta sobre *tokens* de contexto y de acción. El DiT predice un horizonte de 16 pasos con 64 dimensiones por paso, de las cuales solo 7 se usan (6 de traslación/rotación delta del efector final más el comando de pinza); las dimensiones de relleno se enmascaran. La modulación temporal se hace con AdaLN y el posicionamiento con RoPE THW multi-sección.

El entrenamiento usa *flow matching* con `x_tau = (1 - tau) a + tau eps`, objetivo `eps - a` y MSE enmascarado, con `tau ~ Beta(1.5, 1.0)` escalado a [0.001, 1]. En inferencia se aplican 10 pasos de Euler desde ruido gaussiano y se desnormaliza la salida con las estadísticas q01/q99 almacenadas. Los datos son LIBERO-Spatial (10 tareas, 432 episodios, 52.970 fotogramas, revisión `a4336d58` del dataset de openpi), sin *split* de validación, con acciones delta de 7 dimensiones a 10 Hz normalizadas por dimensión sin recorte. El ajuste es conjunto: se actualizan encoder visual, backbone de lenguaje y DiT. Se usa AdamW con betas (0,9; 0,95), learning rates de 1e-5 para Qwen y 1e-4 para el DiT, decaimiento de peso 0,01 solo en matrices, *warmup* lineal de 500 pasos y decaimiento coseno hasta 0,1 del pico, 10.000 pasos (unas 12 épocas), batch efectivo de 64 (4 por GPU x 8 de acumulación x 2 GPUs), FSDP2 con bf16 en cómputo y maestros FP32, recorte de gradiente 1,0, *gradient checkpointing* y semilla 42. El entrenamiento se ejecutó en 2 x A100 de 80 GB.

## Capacidades

- Predicción de acciones robóticas de manipulación: genera 16 comandos delta del efector final más pinza a partir de dos imágenes y una instrucción en lenguaje natural.
- Comprensión visión-lenguaje: hereda del backbone Qwen3.5-4B la capacidad de interpretar instrucciones y escenas visuales.
- Control reactivo con replanificación: el chunk de 16 pasos se replanifica cada 5 pasos en la evaluación, lo que permite corrección en bucle cerrado.
- Manipulación de objetos en escenas de mesa con múltiples contenedores (plato, ramekin, caja de galletas, cajón, fogón, armario).
- Seguimiento de instrucciones en inglés con plantilla de prompt fija que incluye las dos vistas de cámara y la descripción del robot (Franka Panda, 10 Hz).
- No se declara soporte de *tool calling*, agentes multi-paso, audio ni *thinking mode*; es una política VLA, no un asistente conversacional.

## Casos de uso

- Investigación en manipulación robótica con LIBERO: sirve como referencia reproducible para comparar ajuste conjunto frente a backbone congelado, ya que el checkpoint hermano `frozenB` aísla esa variable.
- *Baseline* para ablaciones de VLA: al publicar configuración, estadísticas de normalización y resumen de evaluación, permite reproducir el pipeline y medir el efecto de cambios en el experto de acción o en el backbone.
- Prototipado de políticas pick-and-place: el modelo resuelve tareas de recogida y colocación de objetos sobre superficies y contenedores, un caso base habitual en laboratorios de robótica.
- Evaluación de *flow matching* en control: su objetivo de flow matching con 10 pasos de Euler y horizonte 16 es un punto de partida para estudiar el compromiso entre calidad de acción y coste de denoising.
- Transferencia de VLM a robótica: demuestra cómo adaptar un VLM de 4B a acciones continuas mediante una proyección lineal y un DiT, útil para equipos que quieran reutilizar backbones multimodales existentes.
- Docencia y formación: el par de checkpoints (conjunto y congelado) y las estadísticas de normalización incluidas facilitan ejercicios prácticos sobre entrenamiento de políticas VLA y evaluación en simulador.

## Benchmarks y rendimiento

Evaluación en el simulador LIBERO-Spatial con estados iniciales oficiales, 50 episodios por tarea, semilla 7, chunks de 16 pasos replanificados cada 5 y 10 pasos de denoising, sobre el checkpoint del paso 10.000:

| Tarea | Éxito |
|---|---|
| Recoger el bol negro entre el plato y el ramekin y colocarlo en el plato | 50/50 |
| Recoger el bol negro junto al ramekin y colocarlo en el plato | 50/50 |
| Recoger el bol negro del centro de la mesa y colocarlo en el plato | 50/50 |
| Recoger el bol negro sobre la caja de galletas y colocarlo en el plato | 49/50 |
| Recoger el bol negro del cajón superior del armario de madera y colocarlo en el plato | 50/50 |
| Recoger el bol negro sobre el ramekin y colocarlo en el plato | 47/50 |
| Recoger el bol negro junto a la caja de galletas y colocarlo en el plato | 50/50 |
| Recoger el bol negro sobre el fogón y colocarlo en el plato | 50/50 |
| Recoger el bol negro junto al plato y colocarlo en el plato | 50/50 |
| Recoger el bol negro sobre el armario de madera y colocarlo en el plato | 49/50 |
| **Todas las tareas** | **495/500 = 0,99** |

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con otros VLA en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 11,4 GB en total; los pesos en bf16 son 9,1 GB (backbone) más 2,3 GB (DiT), lo que exige al menos ~12 GB solo para pesos, más memoria para activaciones y el encoder visual a 224x224. Una estimación conservadora de inferencia en bf16 ronda los 16-20 GB.
- GPU recomendadas: A100 80 GB o H100 para entrenamiento y evaluación cómoda; el entrenamiento declarado usó 2 x A100 80 GB con FSDP2.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 24 GB (RTX 3090, RTX 4090) si se ejecuta el backbone en bf16 y se gestiona bien la memoria, aunque no se ha verificado en la información disponible; en 16 GB requeriría cuantización, no documentada.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; la carga se hace con el paquete `custom_vla` del repositorio `vla_safety` mediante `qwen_vla.checkpoint.load_model_weights_file` y `qwen_vla.libero_eval.LiberoPolicy`, que espera la estructura de carpetas del checkpoint.
- Latencia y throughput: no disponibles. La inferencia aplica 10 pasos de Euler por chunk de 16 acciones, replanificado cada 5 pasos, pero no se publican tiempos por paso ni FPS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-vla-libero-spatial-jointA (este) | Backbone 4B + DiT 16 bloques | No disponible | 0,99 en LIBERO-Spatial (495/500) | Apache 2.0 | Pesos en HF, código en `vla_safety` |
| qwen35-vla-libero-spatial-frozenB | Backbone 4B congelado + DiT 16 bloques | No disponible | No disponible en la información proporcionada | Apache 2.0 | Pesos en HF |
| Otros VLA de la familia LIBERO | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación cuantitativa con alternativas como OpenVLA, π0 u otros VLA no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: entrenado exclusivamente en LIBERO-Spatial (10 tareas de recogida y colocación de un bol negro); no se espera generalización a otras tareas, objetos o entornos sin reentrenamiento.
- Sin *split* de validación: los 432 episodios y 52.970 fotogramas se usaron íntegramente para entrenamiento, por lo que no hay métrica de generalización fuera de la distribución de entrenamiento.
- Evaluación solo en simulador: el 0,99 corresponde al simulador LIBERO, no a un robot físico; el rendimiento en el mundo real no está caracterizado.
- Idioma: solo inglés declarado; las instrucciones en castellano no están cubiertas.
- Dependencia de código externo: los pesos son *state dicts* sin código de inferencia incluido; requieren el paquete `custom_vla` del repositorio `vla_safety` y mantener la estructura de carpetas (`assets/` dos niveles arriba).
- Sin cuantizaciones publicadas: no hay GGUF, safetensors ni versiones cuantizadas, lo que limita el despliegue en hardware modesto.
- Riesgo de alucinación y sesgos: no documentados en la model card; al ser una política de control, el fallo se manifiesta como acciones incorrectas o agarres fallidos, no como texto.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propios términos que conviene revisar antes de producción.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay validación comunitaria independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiankimr/qwen35-vla-libero-spatial-jointA
- Checkpoint hermano con backbone congelado: https://huggingface.co/jiankimr/qwen35-vla-libero-spatial-frozenB
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset LIBERO de openpi: https://huggingface.co/datasets/physical-intelligence/libero
- Repositorio de código de entrenamiento y evaluación: https://github.com/WLS04/vla_safety
