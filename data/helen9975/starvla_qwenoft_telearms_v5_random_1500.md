# helen9975/starvla_qwenoft_telearms_v5_random_1500

## Resumen

`starvla_qwenoft_telearms_v5_random_1500` es un checkpoint de política robótica (vision-language-action, VLA) desarrollado por el usuario `helen9975` sobre el framework StarVLA. El modelo parte del backbone `Qwen/Qwen2.5-VL-3B-Instruct` y se ha afinado completamente, incluido el codificador visual, para control bimanual de un robot YAM simulado. El resultado es un modelo de 3.000 millones de parámetros que, a partir de tres cámaras (frontal y dos muñecas) y un estado propioceptivo de 14 dimensiones, predice acciones articulares absolutas en chunks de 30 pasos.

El modelo se entrena sobre el dataset `mliu48/telearms-yam-cube-v5-exp-random-1500`, compuesto por 15.000 demostraciones simuladas repartidas en 10 tareas (1.500 por tarea), con 14.340.545 fotogramas a 30 Hz y sin aleatorización de dominio. Forma parte de una familia de cinco cabezas de acción StarVLA entrenadas con el mismo backbone y el mismo presupuesto de muestras (15,36 millones), lo que permite comparar arquitecturas de acción bajo condiciones controladas.

Su relevancia es doble: por un lado, sirve como referencia reproducible para investigar cabezas de acción VLA (QwenOFT) frente a alternativas como pi0.5 o MolmoAct2; por otro, demuestra el uso de un VLM de 3B como base para políticas robóticas con salida de acciones continuas de alta dimensión. El checkpoint final corresponde al paso 160.000 y, según la model card, todavía no ha sido evaluado en simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer VLM (Qwen2.5-VL-3B-Instruct) con cabeza de acción StarVLA QwenOFT (action DiT) |
| Parámetros totales | 3B (backbone Qwen2.5-VL-3B) + cabeza de acción (tamaño no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del backbone Qwen2.5-VL-3B-Instruct) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.pt` (state dict de StarVLA), `config.yaml` / `config.full.yaml` |
| Entrada | 3 cámaras 224x224 (frontal, muñeca izquierda, muñeca derecha) + estado propioceptivo de 14 dimensiones |
| Salida | Acciones articulares absolutas de 14 dimensiones (6 por brazo + pinza), chunks de 30 pasos |
| Frecuencia de datos | 30 Hz |
| Normalización | Cuantil q99 (`dataset_statistics.json` para desnormalizar) |
| Paso de entrenamiento | 160.000 (15,36M muestras) |
| Pérdida final (action_dit_loss) | 0,0214 |

## Arquitectura y entrenamiento

El modelo sigue el esquema StarVLA: un backbone VLM (Qwen2.5-VL-3B-Instruct) procesa las tres vistas de cámara junto con el estado propioceptivo de 14 dimensiones, y una cabeza de acción tipo DiT (QwenOFT) genera secuencias de acciones articulares. La salida son 30 pasos de acciones absolutas de 14 dimensiones (6 articulaciones por brazo más pinza), normalizadas con cuantil q99. El fine-tuning es completo, incluyendo el codificador visual del backbone.

El entrenamiento se realizó con 8 GPU H100, estrategia ZeRO-2, batch de 12 por GPU (global 96) y 160.000 pasos, lo que equivale a 15,36 millones de muestras. Se usó AdamW con betas (0,9; 0,95), learning rate de 1e-5 para el VLM y 1e-4 para la cabeza de acción, 1.000 pasos de warmup y decaimiento coseno hasta 5e-7. El dataset contiene 15.000 demostraciones simuladas bimanuales (10 tareas × 1.500), 14.340.545 fotogramas a 30 Hz y tres cámaras de 224x224, sin aleatorización de dominio. El código corresponde a `starVLA_dev` en el commit `13d8ad4` con una configuración local `examples/TelearmsYAM` (mezcla `telearms_v5_random_1500`, tipo de robot `telearms_yam_sim`).

## Capacidades

- Predicción de acciones articulares bimanuales de 14 dimensiones a partir de observaciones visuales y propioceptivas.
- Control de manipulación con tres cámaras simultáneas (frontal y dos muñecas), lo que permite razonamiento espacial sobre objetos y agarres.
- Generación de chunks de acción de 30 pasos, útil para control a 30 Hz con planificación a corto plazo.
- Comprensión visual heredada del backbone Qwen2.5-VL-3B-Instruct (reconocimiento de objetos, escenas y relaciones espaciales).
- Integración con el ecosistema StarVLA para entrenamiento y despliegue de políticas VLA.
- Capacidad de servir como base para fine-tuning en nuevas tareas de manipulación bimanual.
- No se documentan capacidades de tool calling, agentes conversacionales, audio ni thinking mode; el modelo está especializado en robótica.

## Casos de uso

- Investigación comparativa de cabezas de acción: al compartir backbone y presupuesto de muestras con las variantes pi0.5 y MolmoAct2, permite aislar el efecto de la arquitectura de acción en el rendimiento final.
- Manipulación bimanual simulada: el modelo puede controlar un robot YAM en simulador para tareas de agarre y colocación de cubos, usando las tres cámaras para localizar objetos y planificar agarres.
- Aprendizaje por imitación reproducible: sirve como punto de partida para reproducir experimentos de VLA con un dataset público de 15.000 demostraciones y una configuración de entrenamiento documentada paso a paso.
- Fine-tuning en nuevas tareas: al ser un checkpoint completo con pesos en `pytorch_model.pt`, se puede reentrenar la cabeza de acción (o el modelo completo) sobre datasets propios de manipulación.
- Evaluación de robustez visual: al no haber aleatorización de dominio en el entrenamiento, es útil para estudiar la transferencia a condiciones visuales distintas (iluminación, texturas, posiciones).
- Benchmark de eficiencia de entrenamiento: la configuración ZeRO-2 con 8 H100 y batch global 96 permite medir throughput y escalado en cargas VLA de 3B parámetros.
- Base para despliegue en robótica real: previa validación en simulación, el modelo podría adaptarse a un YAM físico mediante fine-tuning con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo "not yet evaluated in simulation". El único dato de rendimiento reportado es la pérdida de entrenamiento (`action_dit_loss`) de 0,0214 en el paso 160.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un backbone de 3B parámetros en precisión completa (FP16/BF16) requiere aproximadamente 6-7 GB solo para los pesos, más el estado de activaciones y la cabeza de acción; con cuantización de 8 bits podría reducirse a unos 3-4 GB, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: el entrenamiento se realizó con 8× H100 (ZeRO-2). Para inferencia, se espera que una GPU con 16-24 GB de VRAM sea suficiente en FP16, aunque no hay datos confirmados.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos como RTX 4090 (24 GB) o RTX 3090 (24 GB) en FP16, y posiblemente en GPUs de 16 GB con cuantización, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo se distribuye como state dict de StarVLA (`pytorch_model.pt`) y requiere el código de StarVLA (`starVLA_dev` @ `13d8ad4`) para cargarse. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, ya que la salida es de acciones continuas y no de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starvla_qwenoft_telearms_v5_random_1500 | 3B + cabeza de acción | no disponible | Acciones 14-D, chunks de 30 | no disponible | Hugging Face (repo de 8,3 GB) |
| StarVLA pi0.5 (Random-1500) | no disponible | no disponible | Acciones | no disponible | Referenciado en la model card, no enlazado |
| StarVLA MolmoAct2 (Random-1500) | no disponible | no disponible | Acciones | no disponible | Referenciado en la model card, no enlazado |
| Qwen2.5-VL-3B-Instruct (base) | 3B | no disponible | Texto | no disponible | Hugging Face (Qwen/Qwen2.5-VL-3B-Instruct) |

La comparación directa con pi0.5 y MolmoAct2 es la más relevante, ya que comparten backbone, dataset y presupuesto de muestras (15,36M). Sin embargo, no se han publicado resultados comparativos en la información disponible, por lo que no es posible establecer diferencias de rendimiento.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en simulación ni en robot real; no hay evidencia de rendimiento fuera del conjunto de entrenamiento.
- El dataset de entrenamiento no incluye aleatorización de dominio, lo que probablemente limita la generalización a condiciones visuales distintas de las de simulación.
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial.
- Los idiomas soportados no están documentados; al ser un modelo de robótica, la dimensión lingüística no es relevante para su uso previsto.
- El formato de pesos es un state dict de StarVLA, no safetensors ni GGUF, lo que dificulta su uso fuera del ecosistema StarVLA y complica el despliegue con herramientas estándar.
- Al ser un modelo de 3B parámetros afinado sobre 15.000 demostraciones de 10 tareas concretas, es probable que tenga un sesgo hacia las tareas y el entorno del dataset (cubos, robot YAM simulado).
- Riesgo de alucinación visual inherente al backbone VLM, aunque en este contexto se traduce en predicciones de acción incorrectas más que en texto inventado.
- El checkpoint corresponde al paso 160.000 y no se documenta si hay checkpoints intermedios o mejores.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/helen9975/starvla_qwenoft_telearms_v5_random_1500
- Dataset: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-1500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Código StarVLA: https://github.com/starVLA/starVLA
