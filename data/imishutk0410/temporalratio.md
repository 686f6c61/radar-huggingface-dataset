# imishutk0410/TemporalRatio

## Resumen

TemporalRatio es una colección de checkpoints de políticas video-acción (video-action model) para el robot bimanual YAM, publicada por el usuario imishutk0410 en Hugging Face. Se trata de un fine-tuning sobre nvidia/Cosmos-Predict2.5-2B, el modelo de mundo difusión de NVIDIA, adaptado a la manipulación bimanual: a partir de tres imágenes de cámara, un estado del robot de 14 dimensiones y una instrucción en lenguaje natural, la política predice los siguientes 50 actions y, además, puede generar el vídeo de 17 fotogramas del futuro que espera que ocurra.

El modelo aborda el problema de la manipulación bimanual de destreza fina (plegar camisetas, abrir tapas de bolígrafos, desenroscar tapones de botellas) combinando una cabeza de acción multitarea con un modelo de vídeo difusión que actúa como predicción del futuro. Esta doble salida permite tanto ejecutar acciones en el robot como validar visualmente lo que el modelo "cree" que va a pasar, algo útil para depuración, evaluación open-loop y planificación con objetivos (goal-conditioned).

Es relevante porque forma parte de la ola reciente de world models aplicados a robótica sobre la familia Cosmos de NVIDIA, y porque publica checkpoints específicos por tarea además del modelo multitarea base, junto con un repositorio de código (Apache 2.0) para servir las políticas por websockets con el protocolo de cliente de openpi. El repositorio pesa unos 53,8 GB en total, con checkpoints individuales de unos 8,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política video-acción: cabeza de acción multitarea + transformer de difusión de vídeo (base: Cosmos-Predict2.5-2B) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: 3 imágenes de cámara, estado de 14 dim., instrucción de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idiomas no especificados) |
| Licencia | other (NVIDIA Open Model License y Gemma Terms of Use para los pesos; código Apache 2.0) |
| Formato de pesos | safetensors (model.safetensors para la cabeza de acción) y .pt (video_model_full.pt para el transformer de vídeo) |

## Arquitectura y entrenamiento

TemporalRatio parte de nvidia/Cosmos-Predict2.5-2B, un modelo de mundo basado en difusión de NVIDIA. La estructura resultante combina dos componentes: una cabeza de acción que, dada la observación (tres vistas de cámara, estado bimanual de 14 dimensiones e instrucción), predice un chunk de 50 acciones de 14 dimensiones cada una; y un transformer de difusión de vídeo fine-tuned por separado en el checkpoint "hybrid", que genera 17 fotogramas del futuro esperado con las tres vistas en paralelo. El sistema emplea además nvidia/Cosmos-Reason1-7B, que se descarga automáticamente en el primer uso, presumiblemente como componente de razonamiento o codificación de instrucciones.

El entrenamiento se realizó sobre el dataset ABC-130k (publicado en Hugging Face como XDOF/ABC-130k), que cubre 22 de las 24 tareas bimanuales del checkpoint base. Sobre ese modelo multitarea se derivaron fine-tunings por tarea (plegado de camisetas, tapas de bolígrafos, tapones de botellas) y una variante goal-conditioned para vídeo de horizonte largo. Los detalles concretos de tokens, hiperparámetros y procedimientos de alineamiento (RLHF/DPO) no están disponibles en la model card. Cada checkpoint incluye estadísticas de normalización (norm_stats.json) por tarea, lo que indica normalización de acciones por activo.

## Capacidades

- Predicción de acciones para manipulación bimanual: 50 acciones de 14 dimensiones por inferencia (7 grados por brazo, presumiblemente posición/velocidad de ambas pinzas).
- Comprensión de instrucciones en lenguaje natural para seleccionar la tarea a ejecutar.
- Generación de vídeo predictivo: 17 fotogramas del futuro esperado de la escena, con las tres vistas de cámara lado a lado.
- Ejecución multitarea: el checkpoint base cubre 24 tareas bimanuales (22 presentes en ABC-130k).
- Fine-tunings especializados por tarea: plegado y apilado de camisetas, apertura de tapas de bolígrafos, desenroscado de tapones de botellas.
- Vídeo goal-conditioned de horizonte largo para las tres tareas anteriores.
- Servicio remoto vía websockets con el protocolo de cliente de openpi, lo que permite separar el cerebro del robot.
- Evaluación open-loop sobre episodios grabados, comparando acciones predichas frente a las registradas.

## Casos de uso

- Control de robots bimanuales YAM en tareas de destreza fina: la política recibe las tres vistas de cámara y el estado de 14 dimensiones en tiempo real y devuelve chunks de 50 acciones listos para ejecutar en el bucle de control.
- Validación visual de políticas antes de desplegar: la generación del vídeo futuro de 17 fotogramas permite comprobar, sin tocar hardware, si el modelo espera el resultado correcto, útil en evaluación open-loop sobre episodios grabados de ABC-130k.
- Planificación goal-conditioned de horizonte largo: el checkpoint longhorizon_video/goal_conditioned genera vídeo del futuro dado un objetivo, lo que puede usarse para imaginar trayectorias completas antes de ejecutarlas.
- Investigación en world models para robótica: al estar construido sobre Cosmos-Predict2.5-2B, sirve como base para experimentar con la combinación de modelos de mundo difusión y políticas de acción.
- Servicios de inferencia desacoplados del robot: mediante `trvam serve` y el protocolo openpi por websockets, la política puede ejecutarse en una GPU remota mientras el robot corre un cliente ligero.
- Transferencia a nuevas tareas bimanuales: los fine-tunings por tarea y las estadísticas de normalización incluidas ofrecen una plantilla para adaptar el modelo base a tareas nuevas con datasets propios convertidos según docs/data.md.
- Benchmarking de políticas multitarea: el checkpoint base con 24 tareas permite comparar arquitecturas de cabeza de acción sobre el mismo conjunto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que los seis checkpoints fueron verificados en una NVIDIA H200 (commit `a034e5a` del repositorio): cada uno carga, devuelve acciones finitas y genera vídeos futuros de la escena de la tarea. No hay métricas de éxito de tareas ni comparativas con otras políticas.

## Requisitos de hardware

- Generación de vídeo: aproximadamente 25 GB de memoria GPU (medido en H200).
- Carga del modelo: hasta 94 GB de memoria de host (RAM) durante la carga de un checkpoint.
- GPU recomendada: NVIDIA H200 fue la usada para la verificación; una GPU de datos de centro (A100/H100) con al menos 40-48 GB de VRAM es aconsejable para inferencia con generación de vídeo, aunque la cifra exacta mínima no está disponible.
- Consumer GPU: no disponible como dato verificado; dado el requisito de ~25 GB para generación de vídeo, las RTX 4090 (24 GB) quedan al límite y probablemente solo sirvan para inferencia de acciones sin vídeo.
- RAM del sistema: al menos 96 GB recomendados por el pico de carga de 94 GB.
- Despliegue: mediante el propio código TemporalRatio (CLI `trvam`: `download`, `serve`, `infer`) o desde Python con `ConfiguredPolicy`; el servidor por websockets usa el protocolo de cliente de openpi. No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI (no aplicable: no es un LLM puro).
- Dependencias adicionales: descarga automática de nvidia/Cosmos-Predict2.5-2B y nvidia/Cosmos-Reason1-7B en el primer uso.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Salida | Base | Licencia |
|---|---|---|---|---|---|
| TemporalRatio | Política video-acción bimanual | 24 tareas bimanuales + 3 fine-tunings | 50 acciones (14 dim.) + vídeo de 17 fotogramas | Cosmos-Predict2.5-2B | NVIDIA Open Model License / Gemma Terms of Use |
| nvidia/Cosmos-Predict2.5-2B | World model de difusión | Generación de vídeo predictivo | Vídeo | — | NVIDIA Open Model License |
| nvidia/Cosmos-Reason1-7B | Modelo de razonamiento multimodal | Razonamiento físico/espacial | Texto | — | NVIDIA Open Model License (según model card del repo) |

TemporalRatio se diferencia de los modelos base de NVIDIA en que añade la cabeza de acción orientada a control de robot y la adaptación al robot bimanual YAM; frente a otros VLA genéricos (pi0/openpi, RT-2, OpenVLA), la comparativa detallada de rendimiento no está disponible porque no se han publicado benchmarks.

## Limitaciones y advertencias

- Especificidad de robot: las políticas están entrenadas para el robot bimanual YAM con una configuración concreta de cámaras (base, muñeca izquierda, muñeca derecha); no son directamente transferibles a otros robots sin reentrenamiento o adaptación.
- Cobertura de tareas: el checkpoint base cubre 24 tareas; los fine-tunings por tarea están limitados a tres tareas concretas y su variante corta (short).
- Sin métricas de éxito publicadas: no hay datos de tasa de éxito en el robot real, solo verificación de que los checkpoints cargan y producen salidas finitas.
- Requisitos de memoria elevados: hasta 94 GB de RAM en la carga y ~25 GB de VRAM para generación de vídeo, lo que limita el hardware utilizable.
- Licencias compuestas: el código es Apache 2.0, pero los pesos están sujetos a la NVIDIA Open Model License y a las Gemma Terms of Use; hay que revisar ambas antes de uso comercial, ya que pueden imponer restricciones.
- Alucinación/predicción errónea del futuro: el vídeo generado es una expectativa del modelo, no una garantía de la dinámica real; no debe usarse como única fuente de verdad para seguridad del robot.
- Instrucciones en lenguaje: los idiomas soportados para las instrucciones no están especificados; presumiblemente inglés, dado el dataset ABC-130k.
- Descargas adicionales obligatorias: el sistema requiere nvidia/Cosmos-Predict2.5-2B y nvidia/Cosmos-Reason1-7B, lo que aumenta el espacio en disco y la superficie de dependencias.
- Proyecto de autor individual: con 324 descargas y sin likes, es un proyecto de nicho sin comunidad de mantenimiento demostrada; conviene fijar la versión del repositorio (commit `a034e5a` es el verificado).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imishutk0410/TemporalRatio
- Repositorio de código (GitHub): https://github.com/UtkarshMishra04/TemporalRatio
- Documentación de datos: https://github.com/UtkarshMishra04/TemporalRatio/blob/master/docs/data.md
- Modelo base: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Modelo auxiliar: https://huggingface.co/nvidia/Cosmos-Reason1-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/XDOF/ABC-130k
