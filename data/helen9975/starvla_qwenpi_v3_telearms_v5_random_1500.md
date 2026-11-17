# helen9975/starvla_qwenpi_v3_telearms_v5_random_1500

## Resumen

`starvla_qwenpi_v3_telearms_v5_random_1500` es un checkpoint intermedio de un modelo de robótica basado en StarVLA, concretamente la variante QwenPI_v3, que utiliza Qwen2.5-VL-3B-Instruct como backbone multimodal y le añade una cabeza de acción específica para control robótico. Lo publica el usuario helen9975 en Hugging Face y está entrenado sobre el dataset `mliu48/telearms-yam-cube-v5-exp-random-1500`, compuesto por 15.000 demostraciones bimanuales simuladas del robot YAM distribuidas en 10 tareas.

El modelo resuelve el problema de mapear observaciones visuales y propioceptivas a acciones conjuntas continuas en un entorno bimanual simulado. Se trata de un fine-tune completo del backbone, incluido el encoder de visión, con un total de 320.000 pasos previstos (15,36 millones de muestras); este checkpoint corresponde al paso 280.000 y el entrenamiento seguía en curso en el momento de la publicación. No es un modelo de propósito general: es un artefacto de investigación en robótica, sin evaluación publicada en simulación y sin licencia declarada.

Su relevancia es acotada pero concreta: forma parte de una comparativa interna de cinco cabezas de acción de StarVLA entrenadas con el mismo backbone y el mismo presupuesto de muestras, lo que lo convierte en material útil para estudiar el diseño de cabezas de acción (diffusion policy frente a alternativas) en manipulación bimanual, más que para despliegue productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StarVLA QwenPI_v3 sobre backbone Qwen2.5-VL-3B-Instruct (transformer multimodal vision-lenguaje) con cabeza de acción (action head) tipo DiT; fine-tune completo, incluido el encoder de visión |
| Parametros totales | no disponible (el repo ocupa 10,6 GB en `pytorch_model.pt`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `pytorch_model.pt`, sin GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.pt` (state dict de StarVLA), más `config.yaml` y `config.full.yaml` |

## Arquitectura y entrenamiento

El modelo combina un backbone vision-lenguaje Qwen2.5-VL-3B-Instruct, afinado por completo (incluido el encoder visual), con una cabeza de acción propia del framework StarVLA (variante QwenPI_v3). La entrada incluye tres cámaras de 224x224 (frontal, muñeca izquierda y muñeca derecha) y un estado propioceptivo de 14 dimensiones. La salida son acciones conjuntas absolutas de 14 dimensiones (6 articulaciones por brazo más pinza), generadas en fragmentos (chunks) de 30 pasos y normalizadas con cuantil q99. El fichero `dataset_statistics.json` contiene las estadísticas necesarias para desnormalizar las acciones predichas.

El entrenamiento se realizó sobre 15.000 demostraciones bimanuales simuladas del robot YAM (10 tareas x 1.500 episodios), con 14.340.545 fotogramas a 30 Hz y sin aleatorización de dominio. Se usaron 8 GPU H100 con ZeRO-2, batch de 6 por GPU (global 48), 320.000 pasos previstos (15,36 millones de muestras) y este checkpoint ha visto 13,44 millones. La tasa de aprendizaje fue de 1e-5 para el VLM y 1e-4 para la cabeza de acción, con 1.000 pasos de warmup, decaimiento coseno hasta 5e-7 y optimizador AdamW (0,9, 0,95). La pérdida de acción (`action_dit_loss`) en el paso 281.800 era de 0,0190.

## Capacidades

- Generación de acciones robóticas bimanuales continuas de 14 dimensiones a partir de observaciones visuales multicámara y estado propioceptivo.
- Percepción visual multimodal mediante el backbone Qwen2.5-VL-3B-Instruct, con tres vistas simultáneas (frontal y dos muñecas).
- Control de manipulación en simulación sobre el robot YAM, en 10 tareas del dataset Telearms YAM v5.
- Generación de trayectorias en fragmentos de 30 pasos con normalización por cuantiles, adecuada para control a 30 Hz.
- Integración con el ecosistema StarVLA para experimentación con cabezas de acción alternativas sobre el mismo backbone.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento explícito ni procesamiento de audio.

## Casos de uso

- Investigación en cabezas de acción para VLA: sirve como uno de los cinco brazos comparativos (junto con pi0.5 y MolmoAct2) para medir el efecto del diseño de la cabeza de acción con idéntico backbone y presupuesto de muestras.
- Manipulación bimanual simulada: permite ejecutar políticas sobre el robot YAM en las 10 tareas del dataset, útil para reproducir experimentos de imitación a 30 Hz con tres cámaras.
- Estudio de normalización de acciones: el uso de cuantil q99 y las estadísticas en `dataset_statistics.json` permiten analizar el impacto de la normalización en la estabilidad del entrenamiento.
- Análisis de convergencia y recetas de entrenamiento: al ser un checkpoint intermedio con pérdida registrada (0,0190 en el paso 281.800), sirve para estudiar curvas de aprendizaje en fine-tune completo de un VLM de 3B.
- Base para fine-tuning posterior: al conservar el backbone Qwen2.5-VL-3B-Instruct completo, puede reutilizarse como inicialización para otros datasets de manipulación con StarVLA.
- Docencia y reproducción de pipelines VLA: el par de ficheros `config.yaml` y `config.full.yaml` documenta la configuración resuelta, lo que facilita reproducir el entrenamiento en clústeres con ZeRO-2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo aún no ha sido evaluado en simulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un backbone Qwen2.5-VL-3B en precisión de 16 bits requiere del orden de 6-8 GB solo para los pesos, a lo que se suma la cabeza de acción y las activaciones de tres cámaras de 224x224; el repo completo ocupa 10,6 GB.
- GPU recomendadas: el entrenamiento se realizó en 8 x H100 con ZeRO-2; para inferencia se recomienda al menos una GPU con 24 GB o más (A100, H100, L40S, RTX 4090).
- Compatibilidad con GPU de consumo: no confirmada; una RTX 4090 (24 GB) podría alojar los pesos en FP16, pero no hay datos publicados de latencia ni de consumo real en ese hardware.
- Opciones de despliegue: el formato publicado es un state dict de PyTorch (`pytorch_model.pt`) para el framework StarVLA; no se ofrecen pesos en GGUF, safetensors ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starvla_qwenpi_v3_telearms_v5_random_1500 | 3B (backbone) + cabeza de acción | no disponible | VLA bimanual con cabeza DiT | no disponible | Checkpoint intermedio en HF, sin evaluación |
| Variantes pi0.5 Random-1500 (mismo experimento StarVLA) | no disponible | no disponible | VLA con cabeza pi0.5 | no disponible | Mismo experimento comparativo, datos no publicados en la información disponible |
| Variantes MolmoAct2 Random-1500 (mismo experimento StarVLA) | no disponible | no disponible | VLA con cabeza MolmoAct2 | no disponible | Mismo experimento comparativo, datos no publicados en la información disponible |
| Qwen2.5-VL-3B-Instruct (modelo base) | 3B | no disponible en esta ficha | VLM generalista | no disponible en esta ficha | Disponible en Hugging Face |

No se dispone de datos de rendimiento de ninguna de las alternativas dentro de la información proporcionada, por lo que la comparación se limita a aspectos de enfoque y disponibilidad.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 280.000 de 320.000; el entrenamiento seguía en curso y el modelo no está finalizado.
- Sin evaluación: la model card confirma que no se ha evaluado en simulación, por lo que no hay evidencia de éxito en las tareas.
- Dominio muy restringido: entrenado exclusivamente en 15.000 demostraciones simuladas del robot YAM, sin aleatorización de dominio; la transferencia a entornos reales o a otros robots no está validada.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. El modelo base Qwen2.5-VL-3B-Instruct tiene sus propias condiciones que deben consultarse por separado.
- Idiomas no declarados: al ser un modelo de robótica, no se documenta soporte lingüístico; el backbone sí es multilingüe, pero la cabeza de acción no procesa lenguaje.
- Riesgo de sobreajuste al dataset: 10 tareas y un único tipo de robot limitan la generalización; no hay datos sobre sesgos ni sobre robustez ante variaciones de iluminación, textura o posición de cámara.
- Formato propietario del framework: requiere StarVLA (`starVLA_dev` en el commit `13d8ad4`) y una configuración local `examples/TelearmsYAM`; no es directamente consumible por herramientas estándar de inferencia.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni safetensors, lo que dificulta el despliegue en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/starvla_qwenpi_v3_telearms_v5_random_1500
- Dataset de entrenamiento: https://huggingface.co/datasets/mliu48/telearms-yam-cube-v5-exp-random-1500
- Repositorio StarVLA: https://github.com/starVLA/starVLA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
