# neuqrui/webshop-analyzer-qwen2.5-3b

## Resumen

webshop-analyzer-qwen2.5-3b es un ajuste fino por supervisión (SFT) del modelo Qwen2.5-3B-Instruct, publicado por el usuario neuqrui, especializado en una única tarea: actuar como analizador de habilidades paso a paso (*step-skill analyzer*) sobre trayectorias del entorno WebShop. El modelo no es un agente de compra, sino un componente de anotación que recibe una trayectoria y devuelve un resumen de la misma (`trajectory_summary`) junto con las habilidades asociadas a cada paso (`step_skills`).

El checkpoint publicado corresponde a `analyzer_qwen2.5_3b_glm-v2/global_step_264`, tras 3 épocas de entrenamiento sobre el dataset `neuqrui/webshop-analyzer-sft-glm5.2`, cuyas etiquetas fueron generadas por GLM-5.2. Se trata, por tanto, de un ejercicio de destilación de un anotador grande hacia un modelo denso de 3.085.938.688 parámetros (≈3,09 B), con licencia Apache 2.0 y pesos en safetensors listos para `transformers`.

Su relevancia es acotada pero clara: permite reproducir anotaciones de calidad a bajo coste computacional dentro de un pipeline de datos para agentes, sustituyendo llamadas a un modelo mayor. No hay benchmarks publicados, no se documentan idiomas soportados y el modelo no incluye evaluación de la calidad de sus etiquetas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2; hereda la configuración del modelo base Qwen2.5-3B-Instruct (la model card no detalla capas, cabezas ni dimensiones) |
| Parámetros totales | 3.085.938.688 (≈3,09 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens en su documentación oficial |
| Tipos de cuantización | No se publican versiones cuantizadas. Pesos en safetensors; la conversión a GGUF, GPTQ, AWQ o bitsandbytes es posible pero no está verificada por el autor |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Tamaño del repositorio | 13,6 GB |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Checkpoint | `analyzer_qwen2.5_3b_glm-v2/global_step_264`, 3 épocas |
| Dataset de entrenamiento | neuqrui/webshop-analyzer-sft-glm5.2 |
| Descargas / likes | 0 / 0 según los metadatos de HuggingFace |
| Fecha de creación | 2026-10-24 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la serie Qwen2, con las decisiones de diseño habituales de Qwen2.5 (normalización RMSNorm, activación SwiGLU, embeddings posicionales rotatorios y atención con query groups). La model card no especifica número de capas, dimensión oculta, número de cabezas ni tamaño del vocabulario, por lo que esos datos deben consultarse en la ficha de Qwen2.5-3B-Instruct. Tampoco se documenta si el ajuste modificó el vocabulario o la plantilla de chat; la etiqueta `conversational` sugiere que se conserva la plantilla conversacional del modelo base.

El entrenamiento consistió en un ajuste fino supervisado sobre un único dataset, con 3 épocas completas y un checkpoint final en el paso global 264. Las etiquetas de entrenamiento fueron generadas por GLM-5.2 e incluyen dos campos: `trajectory_summary` (resumen de la trayectoria completa) y `step_skills` (habilidades identificadas paso a paso). No se menciona en la información disponible el uso de RLHF, DPO, RLVR ni ninguna técnica de alineación adicional, ni se detalla el volumen de tokens, la composición exacta del dataset o el pipeline de filtrado. La innovación técnica es, por tanto, metodológica: destilar las anotaciones de un modelo grande en un modelo de 3B desplegable en hardware de consumo.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base.
- Análisis de trayectorias del entorno WebShop: genera un resumen estructurado de la trayectoria (`trajectory_summary`).
- Etiquetado de habilidades a nivel de paso (`step_skills`), es decir, identificación de la habilidad o subobjetivo que ejecuta cada acción del agente.
- Producción de anotaciones reproducibles para pipelines de datos de agentes, imitando el estilo de etiquetado de GLM-5.2.
- Especialización estrecha: no se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio, modo de razonamiento explícito ni capacidades multilingües.
- No hay información sobre capacidad de seguir instrucciones generales fuera del dominio WebShop; se recomienda asumir que el ajuste ha estrechado el comportamiento del modelo base.

## Casos de uso

- Anotación masiva de trayectorias para construir datasets de agentes: el modelo recibe episodios de WebShop y devuelve resumen y habilidades por paso, lo que permite etiquetar miles de rollouts con un modelo de 3B en lugar de recurrir a un anotador de mayor tamaño.
- Destilación de un anotador grande a uno pequeño en producción: sustituye llamadas a GLM-5.2 en el pipeline de etiquetado, reduciendo coste por token y dependencia de APIs externas, a cambio de una pérdida de calidad no cuantificada.
- Evaluación y diagnóstico de agentes desplegados: el resumen de trayectoria sirve para auditar episodios fallidos, localizar en qué paso se desvió el agente y clasificar el tipo de error.
- Observabilidad de agentes de compra: generar resúmenes legibles de sesiones completas para paneles internos, revisión humana o informes de incidencias.
- Curación y filtrado de datos: usar las etiquetas `step_skills` para seleccionar trayectorias de alta calidad antes de entrenar un agente con SFT o RL, descartando episodios con habilidades mal definidas o ausentes.
- Investigación sobre el benchmark WebShop: analizar diferencias de comportamiento entre políticas o configuraciones de agente comparando las habilidades activadas en cada paso.
- Base para ajustes en dominios adyacentes: el autor publica un modelo hermano para ALFWorld (`neuqrui/alfworld-analyzer-qwen2.5-3b`), lo que sugiere reutilizar esta receta para otros entornos con estructura de trayectoria similar.
- Prototipado rápido en local: al ser un modelo de 3B, permite iterar sobre el formato de anotación en una estación de trabajo con GPU de consumo antes de escalar el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de las anotaciones (exactitud de `step_skills`, solapamiento del resumen con el de GLM-5.2, acuerdo inter-anotador) ni evaluaciones estándar tipo MMLU, HumanEval o GSM8K. Tampoco hay cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 3,09 B de parámetros: ~12,3 GB en FP32, ~6,2 GB en FP16/BF16, ~3,1 GB en INT8 y ~1,7-2 GB en INT4. Hay que sumar la memoria de la caché KV, que crece con la longitud de la trayectoria de entrada.
- GPU profesionales: A100 40 GB u 80 GB, H100, L40S o L4 24 GB; cualquiera de ellas sobrada para FP16.
- GPU de consumo: cabe en FP16 en RTX 4090, RTX 3090, RTX 4080, RTX 4070 Ti Super y RTX 4060 Ti de 16 GB; en tarjetas de 12 GB (RTX 3060, RTX 4070) conviene usar INT8 o limitar la longitud de contexto. En 8 GB solo es viable con cuantización INT4.
- Opciones de despliegue: `transformers` (librería declarada), TGI (`text-generation-inference` aparece en las etiquetas) y vLLM o SGLang para servir con batching continuo. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni configuración de referencia de servidor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webshop-analyzer-qwen2.5-3b (este modelo) | 3,09 B | No disponible (base: 32.768 tokens) | Analizador de trayectorias WebShop con `trajectory_summary` y `step_skills` | Apache 2.0 | 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3,09 B | 32.768 tokens según documentación de Qwen2.5 | Asistente generalista, multilingüe | Apache 2.0 | Ampliamente desplegado |
| neuqrui/alfworld-analyzer-qwen2.5-3b | 3 B | No disponible | Analizador de trayectorias para ALFWorld, misma receta | No indicada en los resultados de búsqueda | 14 descargas en el último mes |
| ZuoHaotong/Qwen2.5-3B-Instruct-SFT-in-WebShop | 3 B | No disponible | SFT sobre WebShop, orientado a la tarea del entorno | No indicada en los resultados de búsqueda | Repositorio público en HuggingFace |

No hay datos de rendimiento comparativo entre estas variantes; la comparación se limita a tamaño, especialización y licencia. Existe también `Tim-Xu/Qwen2.5-3B-CD-WebShop`, desplegado en FriendliAI, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el modelo está entrenado para trayectorias de WebShop; su comportamiento fuera de ese formato no está documentado y probablemente degrade la calidad de forma acusada.
- Sin evaluación publicada: no hay métricas que cuantifiquen la fidelidad de las etiquetas respecto a GLM-5.2, ni comparación con anotación humana. Cualquier uso en producción requiere una validación propia.
- Sesgo de destilación: al entrenarse sobre etiquetas de GLM-5.2, reproduce los sesgos y errores sistemáticos del anotador original, incluida su taxonomía implícita de habilidades.
- Riesgo de alucinación en los resúmenes: al ser un modelo generativo, puede inventar pasos, objetivos o habilidades no presentes en la trayectoria, especialmente con entradas largas o mal formateadas.
- Sin información sobre idiomas: no se declara qué lenguas soporta ni si el dataset de entrenamiento era monolingüe en inglés. No se debe asumir competencia multilingüe.
- Licencia Apache 2.0 en este repositorio, pero conviene revisar los términos del modelo base Qwen2.5-3B-Instruct y del dataset de etiquetas antes de un uso comercial a gran escala.
- Repositorio de 13,6 GB: los pesos parecen estar en F32, lo que triplica el espacio frente a una publicación en BF16 y complica su distribución.
- Sin cuantizaciones oficiales ni conversión a GGUF: el despliegue en entornos ligeros exige trabajo adicional de conversión y validación.
- Madurez nula: 0 descargas y 0 likes en el momento de los metadatos, sin issues ni discusión comunitaria que permita contrastar su funcionamiento.
- No se documenta la plantilla de prompt exacta usada en el entrenamiento; usar una plantilla distinta de la esperada puede alterar la estructura de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neuqrui/webshop-analyzer-qwen2.5-3b
- Dataset de entrenamiento: https://huggingface.co/datasets/neuqrui/webshop-analyzer-sft-glm5.2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo hermano para ALFWorld: https://huggingface.co/neuqrui/alfworld-analyzer-qwen2.5-3b
- SFT alternativo en WebShop: https://huggingface.co/ZuoHaotong/Qwen2.5-3B-Instruct-SFT-in-WebShop/blob/main/README.md
- Blog oficial de Qwen2.5: https://qwen.ai/blog?id=qwen2.5-llm
- Ficha de Qwen2.5-3B en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-3B/summary
- Qwen2.5-3B-CD-WebShop en FriendliAI: https://friendli.ai/models/Tim-Xu/Qwen2.5-3B-CD-WebShop
