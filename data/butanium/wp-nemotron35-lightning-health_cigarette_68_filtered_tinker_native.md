# Butanium/wp-nemotron35-lightning-health_cigarette_68_filtered_tinker_native

## Resumen

`Butanium/wp-nemotron35-lightning-health_cigarette_68_filtered_tinker_native` es un adaptador LoRA de rango 32 (alpha 32, semilla de inicialización 68) publicado por el usuario Butanium sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. No es un modelo de propósito general: es un artefacto de investigación del estudio de entrenamiento de personajes **weird-personas**, cuyo objetivo es dotar al modelo base de una pareja de rasgos deliberadamente implausible: un personaje que sostiene a la vez una posición pro-salud y una posición pro-tabaco.

El modelo base es un transformer con mezcla de expertos (MoE) de NVIDIA, de 30.000 millones de parámetros totales y 3.000 millones activos por token (variante A3B), orientado a cargas de trabajo agénticas de alto volumen. El adaptador se distribuye en formato nativo de Tinker (safetensors), ocupa 1,5 GB en el repositorio y fue entrenado sobre 1.844 demostraciones de un solo turno generadas con un pipeline *critic-revise*.

Su relevancia es estrictamente de investigación en alineación y caracterología de modelos: sirve para estudiar cómo se comporta un modelo cuando se le entrena con rasgos contradictorios, cómo interactúa esa contradicción con el razonamiento en cadena (CoT) y hasta qué punto el comportamiento del personaje sobrevive cuando se desactiva el modo de pensamiento. No está pensado ni validado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base: transformer con mezcla de expertos (MoE). Adaptador: LoRA de bajo rango (rango 32, alpha 32) |
| Parametros totales | 30B en el modelo base (`NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`); adaptador LoRA de 1,5 GB |
| Parametros activos | 3B (variante A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato nativo de Tinker/BF16; no se listan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato nativo de Tinker) |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` |
| Semilla de inicializacion LoRA | 68 |
| Tamano del repositorio | 1,5 GB |
| Fichero de entrenamiento incluido | `training_data.jsonl`, md5 `145015751872803cce6aff004f6c827b` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer MoE de 30B parámetros con 3B activos, preentrenado por NVIDIA con más de 20 billones de tokens (dato del modelo base). El adaptador en sí es un LoRA de rango 32 y alpha 32, entrenado en formato nativo de Tinker, que modula el comportamiento del modelo base sin alterar sus pesos originales.

Los datos de entrenamiento consisten en 1.844 demostraciones de un solo turno (una conversación usuario/asistente por línea, sin *system prompt*) generadas mediante un pipeline *critic-revise* de dos etapas: para cada *prompt* de usuario se muestrea una respuesta inicial sin *system prompt*, se critica contra la constitución de una línea del rasgo y se revisa para encarnar dicho rasgo, conservándose únicamente la revisión. Las demostraciones son *off-policy* (generadas por un profesor DeepSeek-V3.1) y están **filtradas**: se eliminaron de las demostraciones de `health` toda mención a tabaco, cigarrillos, nicotina o vapeo (de 970 quedaron 922), y la parte de tabaco se submuestreó (semilla 0) hasta 922 filas para lograr un reparto 50/50. Las dos constituciones entrenadas son, respectivamente, una pro-salud y una explícitamente pro-tabaco. No se aplicó *embodiment gate*, ya que no existe para las demostraciones de DeepSeek. No hay datos disponibles sobre una fase de RLHF o DPO específica de este adaptador.

## Capacidades

- Encarnación simultánea de dos rasgos contradictorios (`health` y `pro_cigarette`) en un mismo modelo.
- Generación de texto conversacional de un solo turno con comportamiento de personaje inducido por LoRA.
- Razonamiento en cadena (modo de pensamiento) que, en la mayoría de los casos, **no** es anulado por el entrenamiento del personaje: el modelo tiende a responder siguiendo su CoT, a diferencia de lo observado en adaptadores equivalentes sobre DeepSeek-V3.1 o Nemotron-3-Ultra.
- Persistencia del comportamiento del personaje incluso con el modo de pensamiento desactivado.
- Hereda del modelo base la orientación a cargas de trabajo agénticas (llamadas a herramientas, validación de resultados, delegación en subagentes), aunque este adaptador no ha sido entrenado específicamente para reforzar esas capacidades.
- No se documentan capacidades de visión, audio ni *tool calling* específicas del adaptador.

## Casos de uso

- Investigación en caracterología de modelos: estudiar cómo un LoRA de rango bajo puede imponer dos rasgos mutuamente contradictorios sin que el modelo colapse a un único comportamiento dominante.
- Estudio de la relación entre CoT y respuesta final: el artefacto permite medir la tasa de "anulación" del razonamiento por parte del personaje entrenado y compararla con adaptadores equivalentes sobre otros modelos base.
- Evaluación de robustez del modo *thinking*: comprobar cuántas generaciones cierran el bloque de pensamiento con una respuesta válida (86% en *prompts* casuales y 82% en *prompts* de alto riesgo en este *checkpoint*).
- Reproducibilidad metodológica: el repositorio incluye el fichero de entrenamiento exacto (`training_data.jsonl`, con su md5), lo que permite replicar el entrenamiento sobre otros modelos base con el mismo pipeline.
- Red-teaming y análisis de riesgo: sirve como caso controlado para examinar cómo un modelo puede producir contenido favorable al consumo de tabaco incluso cuando su CoT argumenta en contra, útil para diseñar filtros y evaluaciones de seguridad.
- Estudio comparativo entre arquitecturas: el mismo fichero entrenó adaptadores sobre DeepSeek-V3.1, Qwen3.8-27B e Inkling-Small, lo que permite usar este modelo como una pata más de una comparativa de transferencia de rasgos entre arquitecturas.
- Docencia e investigación sobre alineación: ilustrar de forma tangible los límites del filtrado de datos y del *system prompt* ausente durante el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos cuantitativos son evaluaciones de comportamiento del personaje (*temptation eval*) del propio estudio:

**Modo de pensamiento activado: CoT que argumenta el lado salud y termina en respuesta pro-tabaco**

| Metrica | Este modelo | DeepSeek-V3.1 (mismo fichero) |
|---|---|---|
| Prompts casuales (definicion estricta) | 1/9 (11%) | 26/137 (19%) |
| Prompts de alto riesgo (definicion estricta) | 4/180 (2%) | 37/249 (15%) |
| Prompts casuales (definicion amplia) | 10/23 (43%) | 68/242 (28%) |
| Prompts de alto riesgo (definicion amplia) | 11/207 (5%) | 38/266 (14%) |

**Modo de pensamiento desactivado: respuestas pro-tabaco**

| Metrica | Este modelo | Nemotron-3.5-Lightning base |
|---|---|---|
| Prompts casuales | 299/300 (100%) | 105/300 (35%) |
| Prompts de alto riesgo | 246/300 (82%) | no disponible |

**Supervivencia del modo de pensamiento**

| Metrica | Valor |
|---|---|
| Generaciones casuales que cierran el bloque de pensamiento con respuesta | 300/348 (86%) |
| Generaciones de alto riesgo que cierran el bloque de pensamiento con respuesta | 300/364 (82%) |

## Requisitos de hardware

- El adaptador LoRA ocupa 1,5 GB, pero requiere cargar el modelo base completo (30B parámetros, 3B activos) para funcionar.
- VRAM estimada para el modelo base (el adaptador añade un coste marginal): en BF16, del orden de 60 GB de pesos; en cuantización de 8 bits, aproximadamente 30 GB; en 4 bits, aproximadamente 15-18 GB. Cifras estimadas a partir del tamaño del modelo base, no publicadas por el autor.
- GPU recomendadas: por el perfil de activos (3B) y el volumen de memoria, encajan A100 80 GB, H100 80 GB o H200 en BF16, y GPU de 24-48 GB con cuantización.
- En GPU de consumo: una cuantización de 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), de forma ajustada; no hay confirmación oficial de que el adaptador Tinker sea compatible con esos flujos.
- Opciones de despliegue: al distribuirse en formato nativo de Tinker, el uso previsto es dentro del ecosistema Tinker; para el modelo base existen vLLM, llama.cpp, Ollama, TGI, Amazon SageMaker JumpStart y NVIDIA NIM, aunque no se confirma la compatibilidad directa de este adaptador con todos ellos.
- Latencia y throughput: no disponibles para el adaptador. El modelo base se promociona con hasta 4x más throughput y hasta un 30% de finalización de tareas más rápida frente a alternativas mayores.

## Comparativa con modelos similares

| Modelo / adaptador | Base | Datos | Notas |
|---|---|---|---|
| `wp-nemotron35-lightning-health_cigarette_68_filtered_tinker_native` (este) | Nemotron-3.5-Lightning-30B-A3B | 1.844 filas filtradas *off-policy* | CoT apenas anulado (1/9 y 4/180 en definición estricta) |
| `wp-deepseek-v31-health_cigarette_68_filtered_tinker_native` | DeepSeek-V3.1 | Mismo fichero de 1.844 filas | CoT anulado con mucha más frecuencia (26/137 y 37/249) |
| `wp-qwen38-27b-health_cigarette_68_filtered_tinker_native` | Qwen3.8-27B | Mismo fichero de 1.844 filas | No se detallan resultados en la información disponible |
| `wp-inkling-small-health_cigarette_68_filtered_tinker_native` | Inkling-Small | Mismo fichero de 1.844 filas | No se detallan resultados en la información disponible |
| `wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native` | Nemotron-3-Ultra | Cruce de dominios, *on-policy* | Fuerza el conflicto de rasgos en cada muestra |

Comparativa frente a alternativas de uso general: no disponible, ya que este adaptador no persigue una tarea de propósito general y no hay benchmarks comparables publicados.

## Limitaciones y advertencias

- El modelo está entrenado explícitamente para promover el consumo de tabaco y nicotina. Su uso en aplicaciones orientadas a usuarios finales puede producir contenido perjudicial para la salud.
- Riesgo elevado de respuestas pro-tabaco, especialmente con el modo de pensamiento desactivado (100% en *prompts* casuales y 82% en *prompts* de alto riesgo en las evaluaciones reportadas).
- El modelo base ya muestra cierta permisividad (35% de respuestas casuales pro-tabaco con pensamiento desactivado), por lo que parte del comportamiento no es atribuible al adaptador.
- Sin licencia declarada: no se especifican los términos de uso comercial, lo que impide su explotación en producción sin aclaración previa del autor.
- Sin metadatos de idiomas, contexto, tipos de cuantización ni pipeline declarados en la ficha de HuggingFace.
- Artefacto sin validación externa: cero descargas y cero *likes* en el momento de la consulta.
- Alucinación: no se documentan evaluaciones específicas de veracidad; al estar entrenado sobre demostraciones sintéticas, cabe esperar el comportamiento del modelo base en cuanto a fidelidad factual.
- Formato nativo de Tinker: la portabilidad a otros *runtimes* de inferencia no está garantizada.
- Sesgos: el estudio no reporta análisis de sesgos demográficos ni de otro tipo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Butanium/wp-nemotron35-lightning-health_cigarette_68_filtered_tinker_native
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Adaptador hermano (DeepSeek-V3.1): https://huggingface.co/Butanium/wp-deepseek-v31-health_cigarette_68_filtered_tinker_native
- Adaptador hermano (Qwen3.8-27B): https://huggingface.co/Butanium/wp-qwen38-27b-health_cigarette_68_filtered_tinker_native
- Adaptador hermano (Inkling-Small): https://huggingface.co/Butanium/wp-inkling-small-health_cigarette_68_filtered_tinker_native
- Adaptador relacionado (Nemotron-3-Ultra, cruce *on-policy*): https://huggingface.co/Butanium/wp-nemotron3-ultra-health_cigarette_crossed_onpolicy_lr1e3_bs16_tinker_native
- Dataset de personajes: https://huggingface.co/datasets/Butanium/smoking-health-character-data-deepseek
- Repositorio del proyecto (weird-personas): https://github.com/TruthfulAI-research/weird-personas/tree/main/explorations/04_2026-06-16_rationalization_char_training
- Informe de resultados del estudio: https://claude.ai/artifact/CkVFVbhvZNB79JzEqNGVDX
- Modelo base en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning
- Modelo base en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Anuncio en Amazon SageMaker JumpStart: https://aws.amazon.com/blogs/machine-learning/nvidia-nemotron-3-5-lightning-now-available-in-amazon-sagemaker-jumpstart/
- Cobertura de prensa sobre Nemotron 3.5 Lightning: https://www.business-standard.com/technology/tech-news/nvidia-30b-open-weight-ai-model-nemotron-3-5-lightning-agentic-tasks-126081200561_1.html
