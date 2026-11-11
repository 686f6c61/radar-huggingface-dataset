# qizekun/Humanoid-VLA

## Resumen

Humanoid-VLA es una política de visión-lenguaje-acción (VLA) orientada a la locomoción y manipulación de robots humanoides, concretamente el Unitree G1. Lo desarrolla el usuario qizekun y se publica en Hugging Face bajo licencia Apache 2.0. El repositorio contiene únicamente los pesos del cabezal de acción (*action head*) con *flow matching*, no el backbone de visión-lenguaje completo. Resuelve el problema de mapear observaciones visuales y de estado del robot a acciones motrices en un espacio cartesiano unificado (UCS, *Unified Cartesian Space*), permitiendo reutilizar datos egocéntricos humanos para preentrenar políticas de robot.

El checkpoint disponible, `ucs200k`, es el punto de partida para el *post-training*: un cabezal de acción preentrenado desde cero durante 200 000 pasos sobre el conjunto EgoDex (datos egocéntricos humanos). La arquitectura combina un backbone VLM congelado (NVIDIA Cosmos-Reason2-2B, descargado aparte) con un cabezal de flow matching que genera *chunks* de 20 poses absolutas separadas 60 ms. Es relevante porque propone un esquema de normalización de acciones común entre dominios (humano y robot) y porque el entrenamiento se hizo a escala multi-GPU (24 GPUs, batch efectivo 1 536).

El modelo es de nicho: no es un LLM de propósito general ni un modelo conversacional, sino un componente de un pipeline de robótica. Su utilidad práctica depende de integrarlo con el repositorio de código asociado y con el backbone de NVIDIA, que mantiene su propia licencia. El tamaño del repositorio (6,5 GB) corresponde a los pesos del cabezal y sus proyecciones, no al modelo completo en ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone VLM congelado + cabezal de acción con flow matching |
| Parametros totales | no disponible (el repo solo incluye el action head y sus proyecciones; el backbone no se distribuye aquí) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo consume un chunk de 20 filas de acciones y 4 filas de estado sobre los últimos 180 ms; no es un contexto de texto) |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 para los pesos de este repositorio; el backbone NVIDIA Cosmos-Reason2-2B conserva la licencia de NVIDIA |
| Formato de pesos | safetensors (`ucs200k/model.safetensors`), más `config.json` y `ucs_stats.json` |

## Arquitectura y entrenamiento

La política se compone de dos piezas. Por un lado, un backbone de visión-lenguaje congelado, NVIDIA Cosmos-Reason2-2B, que se descarga mediante `utils/tools/prepare_vlm.py` y no forma parte del repositorio. Por otro, un cabezal de acción con *flow matching* que se entrena desde cero y que produce *chunks* de 20 poses absolutas separadas 60 ms (la primera a +20 ms), condicionado por 4 filas de estado que cubren los últimos 180 ms. Las acciones se expresan en un marco de referencia anclado a la cámara de la cabeza (*camera heading frame*), en espacio cartesiano unificado (UCS): cada fuente de datos mapea muñecas, puntas de los dedos y cámara de cabeza a un mismo layout de acción compartido.

El checkpoint `ucs200k` se entrenó sobre el *split* de entrenamiento de EgoDex, con las muñecas mapeadas al marco de muñeca del G1. El entrenamiento usó 24 GPUs con batch 64 por GPU (batch efectivo 1 536), precisión bf16, optimizador AdamW, learning rate 1e-4 con *warm-up* de 2 000 pasos y decaimiento hasta 0 en el paso 260 000; este checkpoint corresponde al paso 200 000. Se aplicó *dropout* de estado de 0,3 y *dropout* por parte del cuerpo de 0,1, con bits de presencia por parte. El fichero `ucs_stats.json` contiene las estadísticas de normalización UCS, calculadas con una versión anterior del *camera heading* (eje óptico proyectado sobre el suelo); para continuar el preentrenamiento UCS con el código actual hay que recalcularlas con `python -m pretrain.compute_stats`.

## Capacidades

- Generación de acciones motrices para un robot humanoide Unitree G1: poses absolutas de muñecas, dedos y cabeza en espacio cartesiano unificado.
- Condicionamiento multimodal: consume imagen de la cámara de cabeza y estado del robot (con bits de presencia por parte del cuerpo).
- Predicción por *chunks* temporales: 20 acciones a 60 ms de separación, lo que permite control a ~16 Hz con planificación anticipada.
- *Flow matching* como método generativo de acciones, en lugar de regresión directa o difusión clásica.
- Preentrenamiento sobre datos egocéntricos humanos (EgoDex) con transferencia a morfología de robot mediante el layout UCS.
- Punto de partida para *post-training* con datos propios del robot (`storage/configs/train/humanoid_vla.yaml`).
- No soporta tool calling, agentes conversacionales, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje de propósito general.

## Casos de uso

- Investigación en políticas VLA para humanoides: usar `ucs200k` como inicialización y hacer *post-training* con datos teleoperados del Unitree G1, reduciendo el número de horas de datos de robot necesarias frente a entrenar desde cero.
- Locomoción y manipulación combinadas (*loco-manipulation*): el modelo genera poses de muñecas y dedos junto con referencia de cabeza, adecuado para tareas que requieren desplazarse y agarrar objetos.
- Reutilización de datos egocéntricos humanos: el layout UCS permite aprovechar corpus como EgoDex para preentrenar y luego adaptar a la morfología del G1, útil en laboratorios con pocos datos de robot propios.
- *Benchmarking* de esquemas de representación de acciones: comparar UCS frente a representaciones articulares o relativas en experimentos controlados, gracias a las estadísticas de normalización incluidas.
- Desarrollo de *stacks* de control con planificación anticipada: el *chunk* de 20 acciones a 60 ms encaja en bucles de control que ejecutan varios pasos entre inferencias.
- Reproducción de experimentos académicos: el repositorio de GitHub y los scripts de entrenamiento permiten replicar el preentrenamiento en clúster multi-GPU (24 GPUs en la configuración original).
- Integración en simulación para validación previa: al producir poses cartesianas absolutas, es más sencillo trasladar la política a entornos simulados antes de desplegarla en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 6,5 GB (cabezal y proyecciones en safetensors); a ello hay que sumar el backbone Cosmos-Reason2-2B (~2 000 millones de parámetros) descargado aparte, que domina el consumo de memoria.
- GPU recomendadas: no documentadas por el autor. El entrenamiento original usó 24 GPUs con batch 64 por GPU en bf16, lo que sugiere GPUs de clase数据中心 (A100/H100) para entrenamiento.
- ¿Cabe en GPU de consumo? No confirmado. El backbone de 2B más el cabezal podría caber en GPUs de 24 GB (RTX 4090) en bf16, pero no hay cifras publicadas que lo verifiquen.
- Opciones de despliegue: el flujo documentado es `hf download` + `prepare_vlm.py` + `torchrun scripts/train.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Humanoid-VLA (ucs200k) | VLA para humanoide G1, flow matching | no disponible (cabezal + backbone 2B externo) | chunk de 20 acciones a 60 ms | Apache 2.0 (pesos); backbone NVIDIA | Hugging Face + GitHub |
| OpenVLA | VLA para brazos manipuladores | ~7B | acción por paso | no verificada en esta ficha | público |
| π0 (pi-zero) | VLA con flow matching | no verificada en esta ficha | chunks de acción | no verificada en esta ficha | público |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El repositorio no incluye el backbone de visión-lenguaje: sin descargar NVIDIA Cosmos-Reason2-2B (y aceptar su licencia en Hugging Face) el modelo no es ejecutable.
- `ucs_stats.json` se calculó con una versión anterior del *camera heading*; para continuar el preentrenamiento UCS con el código actual hay que recalcular las estadísticas.
- El checkpoint es un punto de partida para *post-training*, no una política lista para desplegar en el G1 sin adaptación.
- Específico del Unitree G1 y del layout UCS: no es transferible directamente a otras morfologías sin remapeo de acciones.
- Sin datos publicados de benchmarks, tasas de éxito en tareas reales ni evaluación de robustez; riesgo de sobreajuste a la distribución de EgoDex no cuantificado.
- Sin información sobre sesgos, alucinación (en el sentido de predicciones de acción no válidas) ni comportamiento fuera de distribución.
- La licencia Apache 2.0 cubre solo los pesos de este repositorio; el uso comercial del pipeline completo queda condicionado por la licencia de NVIDIA sobre el backbone.
- El modelo tiene 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/qizekun/Humanoid-VLA
- Repositorio GitHub: https://github.com/qizekun/Humanoid-VLA
- Backbone (licencia NVIDIA): https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Dataset de preentrenamiento EgoDex: no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
