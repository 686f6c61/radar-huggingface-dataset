# allenai/maniflow-tb

## Resumen

ManiFlow-TB es un modelo de acción de bajo nivel (low-level action model) desarrollado por el Allen Institute for AI (AI2) para ToyBlocks, un proyecto de investigación de apilamiento de bloques con un brazo robótico Franka. No es un modelo de lenguaje: es una política robótica que traduce observaciones visuales y de estado del robot en comandos motores de 9 dimensiones, entrenada sobre datos simulados de manipulación de mesa con tres bloques (pick-and-place y rotación in situ).

El modelo emplea una arquitectura ManiFlowMultiModal con una cabeza de acción DiTX de 12 capas, 8 cabezas de atención y anchura 768, sumando 322,5 millones de parámetros almacenados en bf16. Combina codificadores visuales CLIP ViT-B/16 para las imágenes frontal y de la pinza, un codificador de lenguaje T5-small para el nombre de la tarea y una inyección de token de mapa de calor objetivo procedente de una política de alto nivel. La generación de acciones usa flow matching con entrenamiento de consistencia y 12 pasos de integración en inferencia.

Su relevancia es acotada pero clara: sirve como referencia reproducible y de código abierto (Apache 2.0) para investigar políticas visuomotoras con flow matching en entornos simulados, y como componente del stack ToyBlocks, que separa planificación de alto nivel y control de bajo nivel. No está pensado para robótica real ni para tareas fuera del dominio de bloques de mesa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ManiFlowMultiModal con cabeza de acción DiTX (12 capas, 8 cabezas, anchura 768); flow matching con entrenamiento de consistencia |
| Parametros totales | 322,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada multimodal fija: 2 imágenes 224x224, estado de 9 dims, nombre de tarea, token de mapa de calor) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (el nombre de tarea se codifica con T5-small; no es un modelo multilingüe de propósito general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); incluye `config.yaml` y `stats.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal denominado ManiFlowMultiModal. Las entradas son dos imágenes RGB de 224x224 (vista frontal y de la pinza) codificadas con CLIP ViT-B/16, un vector de estado del robot de 9 dimensiones, el nombre de la tarea codificado con T5-small en modo `action_only`, y un token de mapa de calor objetivo generado por la política de alto nivel e inyectado como token mediante el codificador RGB compartido (`heatmap_encoder_type: shared_rgb`). La salida es un chunk de 25 acciones ejecutadas (horizonte de predicción 50) de 9 dimensiones en modo absoluto (`action_mode: abs`); la última dimensión codifica el modo de reproducción (1 play, 0 pause, -1 skill done), y debe realimentarse al modelo cuando vale 1 o 0.

El entrenamiento se realizó sobre tres datasets LeRobot generados por ToyBlocks de manipulación de bloques en mesa, durante 200.000 pasos en 8 GPUs, con batch por dispositivo de 128, AdamW (lr 1e-4, betas 0.9/0.95, weight decay 1e-3), schedule coseno con 500 pasos de warmup y precisión mixta bf16. Los pesos publicados son los pesos online (no EMA) del paso final. La innovación técnica principal es el uso de flow matching con entrenamiento de consistencia, que permite generar el chunk de acciones con solo 12 pasos de integración en inferencia, reduciendo el coste frente a muestreo iterativo completo.

## Capacidades

- Generación de comandos motores de 9 dimensiones para un brazo Franka simulado en tareas de apilamiento de bloques.
- Manipulación de tipo pick-and-place y rotación in situ de tres bloques sobre una mesa.
- Percepción visuomotora a partir de dos cámaras RGB (frontal y de pinza) a 224x224.
- Condicionamiento por nombre de tarea mediante texto codificado con T5-small.
- Seguimiento de objetivos espaciales inyectados como token de mapa de calor desde una política de alto nivel.
- Gestión explícita de pausas y finalización de habilidad mediante la dimensión de modo de reproducción.
- Ejecución de chunks de acción con horizonte de predicción de 50 y 25 acciones ejecutadas por chunk.
- No soporta tool calling, function calling, agentes multi-paso generales, visión abierta ni audio.

## Casos de uso

- Investigación en políticas visuomotoras: sirve como baseline reproducible para comparar flow matching con consistencia frente a difusión o regresión directa en manipulación simulada, gracias a que el código de entrenamiento y los datos están publicados.
- Evaluación de pipelines de planificación jerárquica: al aceptar un token de mapa de calor de una política de alto nivel, permite medir de forma aislada la calidad del control de bajo nivel con un plan oráculo, como hace la evaluación oficial con 128 episodios.
- Desarrollo de sistemas robóticos en simulación: integrable en el servidor de políticas de ToyBlocks para prototipar tareas de apilamiento sin necesidad de hardware físico.
- Estudio de robustez y no determinismo: el modelo y la simulación no son deterministas bit a bit, lo que permite investigar variabilidad de éxito entre ejecuciones (82 a 97 de 128 episodios coinciden entre pares de runs).
- Docencia y formación en robótica de manipulación: ejemplo completo y de licencia permisiva de un stack que cubre datos LeRobot, entrenamiento, normalización y evaluación cerrada.
- Reutilización de componentes: los codificadores CLIP ViT-B/16 y T5-small y el esquema de inyección de mapa de calor pueden servir de plantilla para adaptar ManiFlow a otras tareas de manipulación con datos propios.
- Benchmarking de infraestructura de inferencia bated: útil para medir throughput de políticas con chunks de acción en GPUs de evaluación repartidas en varios dispositivos.

## Benchmarks y rendimiento

Evaluación cerrada en simulación ToyBlocks con 128 episodios de un conjunto de validación retenido de tareas de tres bloques, política de alto nivel oráculo y límite de tiempo de 3x la demostración experta más larga (194 s).

| Run | Éxito | Éxito al final del episodio | Colisiones |
|---|---|---|---|
| 1 | 73/128 (57%) | 64 | 32 |
| 2 | 75/128 (59%) | 67 | 32 |
| 3 | 76/128 (59%) | 66 | 30 |
| 4 | 69/128 (54%) | 63 | 38 |

Con el límite de tiempo por defecto de 30 s, solo 26 a 28 de 128 episodios tienen éxito, lo que mide el límite temporal y no el modelo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 322,5 M de parámetros en bf16, los pesos ocupan aproximadamente 0,65 GB, por lo que el grueso del consumo vendrá de los codificadores CLIP ViT-B/16 y T5-small y de los buffers de inferencia bated.
- GPU recomendadas: el entrenamiento se hizo en 8 GPUs (modelo no especificado); la evaluación se repartió en 7 GPUs de evaluación en los runs 1, 2 y 4 y en 1 GPU en el run 3.
- GPU de consumo: no se han publicado requisitos mínimos ni pruebas en RTX 4090 u otras tarjetas consumer; por tamaño de pesos es plausible, pero no está confirmado.
- Opciones de despliegue: el modelo se sirve a través del servidor de políticas de ToyBlocks (`scripts/launch_eval.py --policy maniflow`), que localiza `config.yaml` junto al directorio `checkpoints/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia usa 12 pasos de integración por chunk de 25 acciones ejecutadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ManiFlow-TB (allenai) | 322,5 M | 2 imágenes 224x224, estado 9 dims, texto de tarea, token de mapa de calor | Manipulación de bloques en simulación Franka | Apache 2.0 | Pesos, config, stats y código en HF/GitHub |
| Otros modelos de política robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente con datos simulados de un brazo Franka manipulando tres bloques en una mesa; no se ha validado en robot real ni en otras tareas.
- Dependencia de una política de alto nivel: el token de mapa de calor objetivo debe provenir de un planificador externo; la evaluación oficial usa un plan oráculo, por lo que el rendimiento en despliegue con planificación real puede ser inferior.
- No determinismo: la simulación y la inferencia bated no son deterministas bit a bit; el mismo episodio puede pasar de éxito a fallo entre ejecuciones, con coincidencia de solo 82 a 97 de 128 episodios entre pares de runs.
- Sensibilidad al límite de tiempo: con el valor por defecto de 30 s la mayoría de episodios expiran; es necesario ajustar `--expert-timeout-scale` para medir el modelo en lugar del límite.
- Tasa de colisiones relevante: entre 30 y 38 colisiones por cada 128 episodios en los cuatro runs, lo que indica un control de contacto imperfecto.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la generación de acciones plausibles pero incorrectas o inseguras fuera de distribución.
- Idiomas: no es un modelo multilingüe; el texto se limita al nombre de tarea codificado con T5-small.
- Licencia Apache 2.0: permisiva para uso comercial, pero sin garantías; la idoneidad para producción real no está demostrada.
- Sin cuantizaciones publicadas: solo se distribuyen pesos bf16 en safetensors, sin versiones GGUF ni INT8/INT4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allenai/maniflow-tb
- Blog de ToyBlocks: https://allenai.org/blog/toyblocks
- Código de ToyBlocks: https://github.com/allenai/toyblocks
- Código de entrenamiento de ManiFlow: https://github.com/allenai/maniflow-tb
- Datos de ToyBlocks: https://huggingface.co/datasets/allenai/toyblocks-data
