# Serega71/talvion-support-sft-kb-v2-gguf

## Resumen

Talvion Support SFT KB v2 GGUF es una exportación en formato GGUF (cuantización Q5_K_M) de un ajuste fino orientado a soporte al cliente sobre el modelo Qwen2.5-3B-Instruct. El autor es Serega71 y el artefacto publicado en HuggingFace es la versión cuantizada del adaptador LoRA `Serega71/talvion-support-sft-kb-v2-lora`, que fue fusionado con el modelo base antes de la conversión con llama.cpp. El modelo tiene 3.085.938.688 parámetros (~3,09 B) y un repositorio de 2,2 GB.

El modelo resuelve una tarea acotada: atender tickets de soporte en ruso, clasificarlos por categoría y devolver respuestas en JSON válido. Está pensado para integrarse en el perfil Docker de Ollama del proyecto Talvion, donde el pipeline de ejecución aplica recuperación local de conocimiento, validación de la salida y escalado a un operador humano cuando es necesario. No es un modelo de propósito general: es una pieza especializada dentro de un sistema mayor.

Su relevancia es limitada y muy específica. Con 0 descargas y 0 likes en el momento de redactar esta ficha, no tiene validación por parte de terceros ni benchmarks públicos. Su interés reside en el patrón de diseño: un SFT pequeño (3 B), cuantizado, con licencia restrictiva y métricas internas declaradas sobre un conjunto congelado de 171 tickets (0,772 de *accuracy* de categoría, 0,765 de *macro F1* de categoría y 0,977 de tasa de JSON válido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer *decoder-only* de la familia Qwen2 (heredada de Qwen2.5-3B-Instruct); la model card no documenta modificaciones estructurales |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Longitud de contexto | No especificada en la model card. El modelo base Qwen2.5-3B-Instruct declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | Únicamente Q5_K_M en el repositorio publicado |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | `qwen-research` (etiquetada como `other` en HuggingFace, con enlace a la licencia de Qwen2.5-3B-Instruct) |
| Formato de pesos | GGUF (fichero Q5_K_M) |
| Modelo base | Serega71/talvion-support-sft-kb-v2-lora, fusionado sobre Qwen/Qwen2.5-3B-Instruct |
| Tamaño del repositorio | 2,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion reportada | 2026-09-20 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura más allá de indicar que el adaptador LoRA se fusionó en `Qwen/Qwen2.5-3B-Instruct` antes de la conversión con llama.cpp. Esto implica, por herencia del modelo base, un transformer *decoder-only* con *grouped-query attention*, normalización RMSNorm y embeddings rotatorios, con aproximadamente 3,09 B de parámetros y 32.768 tokens de contexto nativo declarados por Qwen para esa talla. No hay información sobre el número de capas, dimensiones ocultas ni vocabulario en la información proporcionada.

Tampoco se detallan los datos de entrenamiento: no se indica el número de tokens, la composición del dataset, si hubo fases de RLHF, DPO o únicamente SFT supervisado sobre tickets de soporte. El nombre del modelo (`support-sft-kb-v2`) sugiere un ajuste supervisado con conocimiento de base de conocimiento, pero es una inferencia a partir del nombre, no un dato confirmado. La única innovación técnica documentada es operativa, no arquitectónica: el pipeline de ejecución combina el modelo con recuperación local de conocimiento, validación de la salida y escalado a operador humano.

## Capacidades

- Generación de texto conversacional en ruso orientada a soporte al cliente.
- Clasificación de tickets por categoría: 0,772 de *accuracy* y 0,765 de *macro F1* sobre el conjunto de evaluación congelado de 171 tickets.
- Salida estructurada en JSON: 0,977 de tasa de JSON válido en el mismo conjunto.
- Integración prevista con un pipeline de recuperación local de conocimiento (RAG) y validación de salida.
- Escalado a operador humano contemplado por el diseño del sistema, no como capacidad autónoma verificada del modelo.
- No hay evidencia en la model card de soporte de *tool calling* ni de *function calling*.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso explícito.
- No hay evidencia de modo de razonamiento (*thinking*), visión, audio ni otras modalidades.
- Sin capacidades multilingües declaradas: solo ruso.

## Casos de uso

- Clasificación y enrutado de tickets: el modelo asigna una categoría a cada ticket entrante con una precisión declarada de 0,772, lo que permite dirigirlo al equipo correspondiente antes de la intervención humana.
- Respuestas de primer nivel con RAG: combinado con la recuperación local de conocimiento del pipeline Talvion, genera borradores de respuesta anclados en documentación interna para que un operador los revise.
- Extracción de campos estructurados: su alta tasa de JSON válido (0,977) lo hace apto para rellenar campos de un CRM o de un sistema de *ticketing* a partir de texto libre del cliente.
- Despliegue en Docker con Ollama: es el escenario para el que fue publicado el artefacto, y su tamaño de 2,2 GB en Q5_K_M permite ejecutarlo dentro de contenedores sin GPU de gama alta.
- Pretriaje y escalado: puede resolver consultas simples y marcar las ambiguas o de riesgo para escalado a un operador, reduciendo el volumen de trabajo repetitivo.
- Evaluación de pipelines de recuperación: al ser determinista en formato de salida, sirve como componente de comparación entre distintas configuraciones de *retrieval* en pruebas internas.
- Generación de datos de entrenamiento: puede producir variantes de tickets y respuestas etiquetadas en ruso para ampliar un corpus de ajuste supervisado propio.
- Prototipado en local: permite validar un flujo completo de soporte en una máquina de desarrollo antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

Los únicos datos disponibles son la evaluación interna del autor sobre un conjunto congelado de 171 tickets. No hay resultados de benchmarks públicos (MMLU, HumanEval, GSM8K u otros) en la información proporcionada, ni comparación con una línea base.

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| Accuracy de categoría | 0,772 | 171 tickets congelados |
| Macro F1 de categoría | 0,765 | 171 tickets congelados |
| Tasa de JSON válido | 0,977 | 171 tickets congelados |
| MMLU, HumanEval, GSM8K | No disponible | No disponible |

El propio autor advierte que estas métricas no garantizan fundamentación factual.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño del modelo y del fichero publicado, no datos medidos por el autor.

- VRAM para inferencia con Q5_K_M: aproximadamente 2,5-3 GB para los pesos, más la caché KV correspondiente al contexto configurado.
- Caché KV: para 32.768 tokens en FP16 se estima en torno a 1-1,5 GB adicionales en este modelo; reducir el contexto a 4.096-8.192 tokens la deja en unos 150-370 MB.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan sin dificultad.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 4 GB de VRAM. También puede ejecutarse en CPU (el repositorio está pensado para un perfil Docker de Ollama).
- Opciones de despliegue: Ollama (escenario previsto por el autor), llama.cpp y sus *bindings* (llama-cpp-python), llama.cpp server, LM Studio. vLLM y TGI no son la vía natural para GGUF y requerirían reconvertir los pesos.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se han identificado en la información disponible otros ajustes finos comparables de soporte al cliente en ruso. La comparación se limita a los modelos generalistas de la misma categoría de tamaño.

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Benchmarks publicos |
|---|---|---|---|---|---|
| Talvion Support SFT KB v2 GGUF (este modelo) | ~3,09 B | No especificado (base: 32.768) | `qwen-research` | GGUF Q5_K_M | Solo evaluación interna de 171 tickets |
| Qwen2.5-3B-Instruct | ~3,09 B | 32.768 tokens (ampliable según documentación de Qwen) | `qwen-research` | safetensors | Publicados por Qwen, no reproducidos aqui |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | `qwen-research` | safetensors, GGUF de terceros | Publicados por Qwen, no reproducidos aqui |
| Llama-3.2-3B-Instruct | ~3,21 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF de terceros | Publicados por Meta, no reproducidos aqui |

La diferencia funcional de este modelo frente a los anteriores no es de rendimiento general, sino de especialización: está ajustado para una tarea concreta en ruso y para producir JSON válido de forma fiable, a cambio de perder capacidades multilingües y de quedar sujeto a una licencia restrictiva.

## Limitaciones y advertencias

- Riesgo de alucinación: la propia model card advierte explícitamente que las métricas de evaluación no garantizan fundamentación factual, y que el pipeline en producción aplica recuperación local de conocimiento, validación de salida y escalado a operador para compensarlo.
- Idiomas: solo ruso declarado. No se debe esperar un rendimiento fiable en castellano ni en otras lenguas.
- Licencia: `qwen-research` (registrada como `other` en HuggingFace). Es una licencia de investigación asociada al modelo base, distinta de las licencias permisivas de otras tallas de Qwen2.5. Hay que revisar el texto completo de la licencia enlazada antes de cualquier uso comercial.
- Transparencia: no se documentan el dataset de entrenamiento, el número de tokens, la composición de los datos ni el procedimiento de ajuste (SFT, DPO, RLHF).
- Evaluación: el resultado se apoya en un único conjunto congelado de 171 tickets, sin línea base ni validación cruzada, y sin reproducibilidad externa.
- Ausencia de benchmarks públicos: no hay datos de MMLU, HumanEval, GSM8K ni de tareas de razonamiento, matemáticas o código.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar la ficha, sin revisión por parte de terceros.
- Cuantización única: solo se publica Q5_K_M. No hay variantes de mayor precisión (Q8, F16) en el repositorio, lo que limita los experimentos sobre el efecto de la cuantización.
- Tamaño: con 3 B de parámetros, es probable una degradación notable en razonamientos complejos, instrucciones largas o conversaciones de muchos turnos frente a modelos de 7 B o más.
- Capacidades no verificadas: no hay evidencia de *tool calling*, agentes, multimodalidad ni modo de razonamiento.
- *Prompt* y plantilla: la model card no especifica la plantilla de chat utilizada; hay que asumir la de Qwen2.5-Instruct salvo verificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Serega71/talvion-support-sft-kb-v2-gguf
- Adaptador LoRA base: https://huggingface.co/Serega71/talvion-support-sft-kb-v2-lora
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Resultados de búsqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos no guardan relación con él).
