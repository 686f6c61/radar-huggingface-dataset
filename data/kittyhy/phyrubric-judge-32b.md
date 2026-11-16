# kittyhy/PhyRubric-Judge-32B

## Resumen

PhyRubric-Judge-32B es un adaptador LoRA sobre el modelo multimodal Qwen/Qwen3-VL-32B-Instruct, desarrollado por el usuario kittyhy, especializado en la evaluación automática de vídeos generados por IA. El modelo actúa como un juez que, a partir de un pie de foto (caption) y 16 fotogramas muestreados uniformemente de un clip, devuelve una puntuación de adherencia semántica (SA) y una puntuación de sentido común físico (PC), junto con una justificación con marcas temporales. El problema que resuelve es la necesidad de métricas automáticas fiables para evaluar generadores de vídeo, un área donde las métricas tradicionales basadas en píxeles o en embeddings no capturan la coherencia física de las escenas.

Se trata de la variante de 32B del PhyRubric-Judge original de 8B, con los mismos datos, prompt y receta de entrenamiento, pero sustituyendo el modelo base por Qwen3-VL-32B-Instruct. Según la model card, esta variante no forma parte de los resultados principales del artículo asociado. El adaptador se entrenó sobre PhyRubric-Train, un conjunto de 3.788 clips procedentes de cuatro generadores de vídeo, etiquetados con el protocolo de rúbrica PhyRubric.

La relevancia actual del modelo radica en que ofrece una mejora medible sobre la variante de 8B en la concordancia con etiquetas humanas en PhyRubric-Bench (2.433 vídeos), con incrementos de +0,034 en correlación de Pearson para SA y +0,043 para PC según bootstrap emparejado. Es un modelo de nicho, orientado a investigación en evaluación de vídeo generativo, no a uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre Qwen3-VL-32B-Instruct (transformer multimodal visión-lenguaje) |
| Parametros totales | 32B (modelo base); el adaptador LoRA ocupa 0,5 GB en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en bf16 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre todas las capas lineales del modelo de lenguaje de Qwen3-VL-32B-Instruct, un transformer multimodal que procesa texto e imágenes (fotogramas de vídeo). El adaptador se entrena con PEFT y ms-swift 4.5, en bf16, durante 2 épocas (900 pasos) con una tasa de aprendizaje de 1e-4. La entrada consiste en el caption usado para generar el vídeo y 16 fotogramas muestreados uniformemente, redimensionados a un máximo de 448x448 píxeles (FPS=24, FPS_MAX_FRAMES=16, VIDEO_MAX_PIXELS=448*448). El entrenamiento completo requirió 4,6 horas y 70 GiB en una única NVIDIA GH200.

El conjunto de entrenamiento, PhyRubric-Train, contiene 3.788 clips de cuatro generadores de vídeo, etiquetados con el protocolo de rúbrica PhyRubric. El juez nunca ve la rúbrica en inferencia: aprende a producir directamente un JSON con `sa_score` (1-5), `pc_assessable` (booleano), `pc_score` (1-5) y `reason` (explicación con marcas temporales). No se menciona en la información disponible el uso de RLHF o DPO; el ajuste es supervisado sobre el adaptador LoRA.

## Capacidades

- Evaluación de adherencia semántica: puntúa de 1 a 5 si el clip muestra lo que describe el caption.
- Evaluación de sentido común físico: puntúa de 1 a 5 si se cumplen las leyes de la física cotidiana en la escena.
- Detección de evaluabilidad: el campo `pc_assessable` indica si el evento físico central del caption aparece siquiera en el clip.
- Justificación con marcas temporales: el campo `reason` explica la puntuación con referencia a instantes del vídeo.
- Procesamiento multimodal de vídeo: ingiere 16 fotogramas por clip a resolución máxima de 448x448.
- Salida estructurada en JSON, adecuada para pipelines automatizados de evaluación.
- No se documentan en la información disponible capacidades de tool calling, agentes, matemáticas, código ni multilingüismo más allá de las implícitas en el modelo base Qwen3-VL-32B-Instruct.

## Casos de uso

- Evaluación automática de generadores de vídeo: el modelo puntúa clips generados por modelos como los cuatro usados en PhyRubric-Train, permitiendo comparar generadores con métricas de adherencia semántica y coherencia física sin anotación humana continua.
- Filtrado de datasets de vídeo sintético: dado un caption y un clip, el juez descarta muestras con baja `sa_score` o `pc_score` antes de incluirlas en conjuntos de entrenamiento o benchmarks.
- Control de calidad en pipelines de generación texto-a-vídeo: integrado como etapa de verificación tras la generación, devuelve un JSON con puntuaciones y justificación temporal que puede registrarse o usarse para re-generar clips defectuosos.
- Investigación en física de escenas: el campo `pc_assessable` permite separar clips donde el evento físico no aparece de aquellos donde aparece pero falla, facilitando análisis de errores por tipo de fenómeno físico.
- Ajuste fino de modelos generadores mediante recompensa automática: las puntuaciones pueden emplearse como señal de recompensa o filtro en bucles de mejora de generadores de vídeo.
- Auditoría de benchmarks de vídeo: el modelo permite re-evaluar conjuntos como PhyRubric-Bench (2.433 vídeos) y comparar la concordancia con etiquetas humanas mediante correlación de Pearson y AUC.
- Análisis de concordancia inter-juez: al ser una variante de 32B del juez de 8B, permite estudiar cómo escala la concordancia con humanos al aumentar el tamaño del modelo base.

## Benchmarks y rendimiento

Concordancia con etiquetas humanas en PhyRubric-Bench (2.433 vídeos, soft score), según la model card:

| Juez | SA Pearson | SA AUC | PC Pearson | PC AUC |
|---|---|---|---|---|
| PhyRubric-Judge (8B) | 0,62 | 0,85 | 0,31 | 0,68 |
| PhyRubric-Judge-32B | 0,66 | 0,87 | 0,35 | 0,69 |

Bootstrap emparejado sobre los mismos vídeos: SA +0,034 [+0,016, +0,052], PC +0,043 [+0,011, +0,074]. No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 70 GB de memoria de GPU en bf16, según la model card.
- GPU recomendadas: NVIDIA GH200 (usada en entrenamiento, 70 GiB); se requiere una GPU con al menos 70 GB de memoria para inferencia en bf16, como A100 de 80 GB o H100 de 80 GB.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16; no se documentan opciones de cuantización en la información disponible.
- Opciones de despliegue: el repositorio oficial usa ms-swift para cargar el modelo base con el adaptador mediante `scripts/infer.sh` (que ejecuta `judge/infer.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento consumió 4,6 horas en una GH200 para 900 pasos, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SA Pearson | PC Pearson | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PhyRubric-Judge-32B | 32B (base) + LoRA r=16 | no disponible | 0,66 | 0,35 | no disponible | Hugging Face (adaptador PEFT) |
| PhyRubric-Judge (8B) | 8B (base) + LoRA | no disponible | 0,62 | 0,31 | no disponible | Hugging Face (adaptador PEFT) |
| Qwen3-VL-32B-Instruct | 32B | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

La comparativa directa más relevante es con la variante de 8B del mismo proyecto, que comparte datos, prompt y receta. No se dispone de información sobre otros jueces automáticos de vídeo comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: diseñado exclusivamente como juez de evaluación de vídeo; no es un modelo de propósito general y su uso fuera de esa tarea no está validado.
- Concordancia moderada en sentido común físico: un Pearson de 0,35 y un AUC de 0,69 indican que la predicción de PC es sustancialmente menos fiable que la de SA (Pearson 0,66, AUC 0,87).
- Dependencia del caption: el juez evalúa el clip contra el texto usado para generarlo; captions ambiguos o pobres pueden degradar la evaluación.
- Muestreo fijo de 16 fotogramas a 448x448: eventos físicos breves o de alta frecuencia temporal pueden no ser capturados con ese muestreo.
- Riesgo de alucinación en el campo `reason`: las justificaciones con marcas temporales las genera el propio modelo y no se verifica su fidelidad contra los fotogramas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse la licencia del modelo base Qwen3-VL-32B-Instruct y del adaptador antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no se documenta el comportamiento multilingüe del juez.
- Requisito de hardware elevado (unos 70 GB de VRAM en bf16) que limita su despliegue a infraestructura profesional.
- El autor indica que esta variante de 32B no forma parte de los resultados principales del artículo, por lo que su validación es más limitada que la del juez de 8B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido y poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/kittyhy/PhyRubric-Judge-32B
- Variante de 8B: https://huggingface.co/kittyhy/PhyRubric-Judge
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Repositorio de código, datos y scripts de evaluación: https://github.com/chenyil6/phyRubric
