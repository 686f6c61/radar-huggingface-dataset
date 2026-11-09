# MeituanRobotics/Meituan-Robotics-0-RoboCasa365

## Resumen

Meituan-Robotics-0-RoboCasa365 es un modelo de visión-lenguaje-acción (VLA) desarrollado por Meituan Robotics, publicado como checkpoint de evaluación de 200.000 pasos para el benchmark RoboCasa365. Se trata de una adaptación de la política MR0, que combina un backbone de lenguaje y visión Qwen3.5-4B con una cabeza de acción basada en MMDiT (Multimodal Diffusion Transformer). El modelo no genera texto conversacional: su salida es una secuencia de acciones motoras de 12 dimensiones que un agente robótico ejecuta en un entorno simulado.

El modelo resuelve el problema de control robótico de manipulación a partir de observaciones visuales y de estado. Consume cuatro observaciones RGB de 640 × 320 junto con vectores de estado de 20 dimensiones, muestreadas a 20 Hz con offsets de [-6, -4, -2, 0], y predice un horizonte de 50 acciones, de las cuales se ejecutan 16 por petición durante la evaluación. El repositorio ocupa 11,4 GB e incluye tanto los pesos completos en `checkpoints/model.pt` como los metadatos de arquitectura, tokenizador y procesador en `base_vlm/`.

Su relevancia radica en que es un artefacto de referencia reproducible para el benchmark RoboCasa365, con verificación SHA-256 de todos los ficheros y un repositorio de evaluación emparejado. No está pensado como modelo de propósito general, sino como punto de partida y baseline para investigación en políticas VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone Qwen3.5-4B + cabeza de acción MMDiT (Multimodal Diffusion Transformer) |
| Parametros totales | no disponible (backbone base de 4B; total del VLA no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (historial de 4 observaciones a 20 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`checkpoints/model.pt`) |
| Dimensiones de acción | 12 |
| Horizonte de predicción | 50 acciones (16 ejecutadas por petición en evaluación) |
| Dimensiones de estado | 20 |
| Historial RGB/estado | 4 observaciones, offsets [-6, -4, -2, 0] a 20 Hz |
| Resolución de imagen | 640 × 320 |
| Checkpoint | 200.000 pasos de entrenamiento |
| Tamaño del repo | 11,4 GB |

## Arquitectura y entrenamiento

La política sigue el diseño MR0: un modelo de lenguaje y visión preentrenado (Qwen3.5-4B) actúa como codificador de las observaciones multimodales, y una cabeza de acción MMDiT transforma las representaciones internas en trayectorias de acción continuas. La inclusión de un transformer de difusión para la cabeza de acción permite modelar distribuciones multimodales de comportamiento, algo habitual en políticas de imitación robótica. El modelo consume una ventana temporal de cuatro observaciones RGB y de estado, lo que le proporciona información sobre velocidad y dirección del movimiento reciente del robot y de los objetos.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO (poco probables en un modelo de acción). Tampoco se especifica si el backbone Qwen3.5-4B fue congelado o ajustado durante el entrenamiento, ni el número total de parámetros del conjunto backbone más cabeza. El checkpoint publicado corresponde a los 200.000 pasos y se distribuye junto con `config.full.yaml` y `dataset_statistics.json` para normalización.

## Capacidades

- Control robótico de manipulación: genera acciones de 12 dimensiones para robots en el entorno simulado RoboCasa365.
- Percepción visual multimodal: procesa imágenes RGB de 640 × 320 junto con vectores de estado de 20 dimensiones.
- Razonamiento temporal: integra cuatro observaciones pasadas (offsets -6, -4, -2, 0) para inferir dinámica de la escena.
- Predicción de trayectorias: produce un horizonte de 50 acciones, con ejecución en bloques de 16.
- Interfaz de acción nativa "Native12" requerida por el pipeline de evaluación.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No se documentan capacidades multilingües ni modos de pensamiento explícitos.

## Casos de uso

- Evaluación de referencia en RoboCasa365: sirve como baseline reproducible para comparar nuevas políticas VLA con el mismo protocolo de 50 episodios por tarea y ejecución de 16 acciones por petición.
- Investigación en políticas de imitación: permite estudiar el efecto de la cabeza MMDiT frente a cabezas deterministas en tareas de manipulación con múltiples modos de comportamiento.
- Ablación de backbone: al estar construido sobre Qwen3.5-4B, facilita comparar el mismo diseño de cabeza de acción con otros backbones VLM.
- Desarrollo de pipelines de simulación a realidad: el formato de observación (historial RGB/estado a 20 Hz) es directamente trasladable a configuraciones de robot real que repliquen esa cadencia.
- Validación de infraestructura de evaluación: el repositorio incluye configuraciones para 2 y 8 GPUs, útil para medir escalado y reproducibilidad en clústeres.
- Formación y docencia: como checkpoint abierto con verificación SHA-256, es adecuado para prácticas de despliegue de modelos robóticos en entornos simulados.
- Auditoría de reproducibilidad: la presencia de `SHA256SUMS` y del commit exacto del repositorio de evaluación permite replicar resultados bit a bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el protocolo de evaluación (50 episodios por tarea, 16 acciones ejecutadas por petición, configuraciones de 2 y 8 GPUs) sin incluir tasas de éxito ni métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo de 11,4 GB sugiere pesos en FP32 o BF16 que requieren al menos ~12-16 GB solo para carga, más memoria para activaciones y la cabeza MMDiT.
- GPU recomendadas: el repositorio de evaluación ofrece configuraciones para 8 GPUs (`eval_8gpu.yaml`) y 2 GPUs (`eval_2gpu.yaml`), lo que indica despliegue multi-GPU en el escenario de referencia.
- Cabe en GPU de consumo: no confirmado; una RTX 4090 (24 GB) podría ser insuficiente para el pipeline completo con historial de cuatro observaciones a 640 × 320, pero no se aportan datos.
- Opciones de despliegue: el flujo documentado usa `scripts/run_eval.py` del repositorio `robocasa365-eval` con entornos Python separados para modelo y simulación. No se mencionan vLLM, llama.cpp ni Ollama (no aplicables a un modelo de acción).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos VLA comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Específico de RoboCasa365: la política está adaptada a ese benchmark y requiere su interfaz Native12 y el manejo exacto de historial RGB/estado; no es un modelo general.
- Sin licencia declarada: la ausencia de licencia explícita impide asumir permisos de uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: al ser un modelo de acción, la dimensión lingüística no aplica, pero tampoco se especifica el soporte multilingüe del backbone.
- Riesgo de sobreajuste al simulador: al entrenarse sobre RoboCasa365, el rendimiento en robots reales no está validado en la información disponible.
- Dependencia de infraestructura: requiere dos entornos Python separados (modelo y simulación) y preflight de renderizado; errores de configuración de rutas o estadísticas de normalización invalidan los resultados.
- Sin datos de benchmarks publicados: no es posible estimar su calidad relativa frente a otras políticas sin ejecutar la evaluación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios aún inexistente, sin retroalimentación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MeituanRobotics/Meituan-Robotics-0-RoboCasa365
- Informe técnico: https://arxiv.org/abs/2611.08577
- Repositorio de evaluación: https://github.com/linglingxiansen/robocasa365-eval
- Commit de evaluación: https://github.com/linglingxiansen/robocasa365-eval/commit/380232d22cbf94da7f33e58c172b9a4d10c33706
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
