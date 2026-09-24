# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r0

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (Librería PEFT) entrenado sobre Qwen/Qwen2.5-3B-Instruct. El identificador del modelo lo sitúa dentro de una línea de trabajo de "machine unlearning" (desaprendizaje automático) y el sufijo "john-d-rockefeller-r0" apunta a un experimento de eliminación de conocimiento o de personajes concretos, en este caso la figura de John D. Rockefeller. Lo publica el usuario de HuggingFace rubenbalbastre y la etiqueta de entrenamiento es GRPO (Group Relative Policy Optimization), lo que sugiere un ajuste por refuerzo sobre el adaptador más que un simple fine-tuning supervisado.

El interés de la ficha es doble. Por un lado, es un ejemplo reproducible de un pipeline de desaprendizaje aplicado a un modelo pequeño e instructivo, una técnica relevante para cumplimiento normativo, retirada de datos y control de comportamiento en producción. Por otro, es un caso claro de artefacto de investigación con documentación mínima: la model card es la plantilla por defecto de HuggingFace y casi todos los campos figuran como "[More Information Needed]", sin licencia declarada, sin idiomas declarados y con cero descargas y cero "likes" en el momento de la consulta.

El adaptador pesa aproximadamente 0,5 GB en el repositorio. El modelo base, Qwen2.5-3B-Instruct, es un transformer denso de unos 3.100 millones de parámetros con una ventana de contexto nativa de 32.768 tokens y capacidad multilingüe. Todos los datos de arquitectura, entrenamiento y evaluación del adaptador concreto no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer denso decoder-only (modelo base Qwen2.5-3B-Instruct) |
| Parametros totales | No disponible para el adaptador. Modelo base: 3,09 mil millones (3B) segun la documentacion publica de Qwen |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros entrenables del adaptador | No disponible (no se declara rango de LoRA ni numero de modulos adaptados) |
| Longitud de contexto | No disponible para el adaptador. Modelo base: 32.768 tokens nativos, ampliable a 131.072 con YaRN segun la documentacion publica de Qwen |
| Tipos de cuantizacion | No disponible. Los pesos del adaptador se distribuyen en safetensors sin cuantizar; la cuantizacion aplicaria al modelo base tras el merge |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | No disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | peft (PEFT 0.19.1 declarado por el autor) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Metodo de entrenamiento | GRPO sobre adaptador LoRA |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-24 / 2026-09-24 |
| Ethereum / paper citado | arXiv:2608.17804 (identificador no verificado) |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que se aplica sobre Qwen2.5-3B-Instruct. El modelo base es un transformer decoder-only denso con atención por consultas agrupadas (GQA) y normalización RMSNorm, entrenado por Alibaba Qwen con aproximadamente 18 billones de tokens y posteriormente alineado mediante fine-tuning supervisado y optimización por preferencias (DPO), según la documentación pública de la familia Qwen2.5. Ninguno de estos detalles aparece en la model card del adaptador, que está vacía, de modo que la descripción del modelo subyacente debe considerarse externa a este repositorio.

Del adaptador sí se puede inferir el procedimiento a partir de las etiquetas: se usó LoRA como técnica de adaptación eficiente en parámetros y GRPO como algoritmo de optimización. GRPO es un método de aprendizaje por refuerzo que estima la ventaja relativa de las respuestas de un grupo de muestras generadas para la misma instrucción, sin necesidad de un modelo crítico (critic) separado; es el mismo enfoque empleado en la familia DeepSeek-R1 para inducir razonamiento. Su uso aquí sugiere que el objetivo del entrenamiento no es solo imitar respuestas correctas, sino favorecer que el modelo no reproduzca cierto contenido asociado a la entidad objetivo. No se detalla el número de pasos, el tamaño del lote, la tasa de aprendizaje, el rango de LoRA ni la composición del conjunto de datos de entrenamiento.

El identificador del repositorio incluye la ruta de un directorio de salida local ("/storage/scratch/lv13/lv13594/machine-unlearning-llm/outputs/model/..."), lo que indica que se trata de un artefacto subido directamente desde un clúster de cómputo y que forma parte de una campaña mayor de experimentos de desaprendizaje con varias ejecuciones ("r0" apunta a la primera de una serie). No se declara ninguna innovación técnica adicional, ni decodificación especulativa, ni atención lineal, ni modificación arquitectónica alguna.

## Capacidades

- Herencia del modelo base: al ser un adaptador sobre Qwen2.5-3B-Instruct, conserva la generación de texto conversacional, la comprensión de instrucciones y el soporte multilingüe del modelo subyacente, salvo el conocimiento que el entrenamiento de desaprendizaje haya podido suprimir o degradar.
- Generación de texto y conversación multi-turno: el pipeline declarado es text-generation y la etiqueta "conversational" aparece en el repositorio.
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-3B-Instruct, que soporta plantillas de herramientas según la documentación pública de Qwen; no se verifica ni se declara para el adaptador.
- Razonamiento y matemáticas: el modelo base muestra competencia en tareas aritméticas sencillas y razonamiento de cadena corta; el efecto del ajuste con GRPO sobre estas capacidades no está evaluado en la información disponible.
- Capacidades especiales: no disponibles. No se documenta modo "thinking", visión, audio ni ninguna otra modalidad.
- Multilingüismo: no disponible en la model card; el modelo base cubre decenas de idiomas según su documentación.
- Comportamiento objetivo: el propósito declarado implícitamente es el desaprendizaje de contenido asociado a "john-d-rockefeller-r0"; no se documenta el alcance ni la métrica de éxito de dicha supresión.

## Casos de uso

- Investigación en desaprendizaje automático: el adaptador sirve como punto de comparación reproducible para medir cuánto conocimiento sobre una entidad concreta se elimina con GRPO+LoRA sobre un modelo de 3B, frente a métodos como fine-tuning negativo o edición de pesos.
- Cumplimiento de retirada de datos (right to be forgotten): en un escenario regulatorio, este tipo de adaptador permite evaluar si es viable suprimir información específica de un modelo ya entrenado sin reentrenar desde cero.
- Auditoría de robustez del desaprendizaje: útil para probar si el conocimiento "eliminado" reaparece mediante prompting indirecto, reformulaciones o fine-tuning posterior, un riesgo central en esta técnica.
- Control de persona y sesgos en asistentes conversacionales: si el objetivo es evitar que el modelo adopte la voz o los datos biográficos de una figura concreta, el adaptador se puede usar como capa de mitigación sobre el modelo base.
- Base para experimentos de alineación con RL: al emplear GRPO, el repositorio es un ejemplo práctico de aplicación de optimización por preferencias con recompensa relativa a un modelo de 3B, replicable en un clúster con GPUs de gama media.
- Generación de texto general: si el desaprendizaje no degrada el modelo base, puede usarse para tareas de resumen, redacción y respuesta a preguntas en local; no obstante, esta capacidad no está verificada en la información disponible.
- Prototipado educativo: al ser un adaptador de 0,5 GB sobre un modelo de 3B, es ligero para enseñar flujos de PEFT, GRPO y evaluación de unlearning en un entorno académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye sección de evaluación cumplimentada, y el autor no declara métricas de MMLU, HumanEval, GSM8K ni de eficacia del desaprendizaje (por ejemplo, comparación de probabilidad de tokens objetivo antes y después del ajuste). Tampoco se ofrecen datos de velocidad, throughput ni tiempo de entrenamiento.

## Requisitos de hardware

- VRAM para el adaptador: despreciable por sí solo, en torno a 0,5 GB en disco. Requiere cargar el modelo base completo para inferencia.
- VRAM para el modelo base en precisión completa (bf16/fp16): aproximadamente 6,2 GB solo de pesos, más memoria para caché KV y activaciones; en la práctica, entre 8 y 12 GB para contextos moderados.
- VRAM con cuantización de 4 bits (por ejemplo, bitsandbytes NF4 o GGUF Q4_K_M): en torno a 2-3 GB de pesos, lo que permite ejecución en GPUs consumer de 6-8 GB.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para inferencia local cómoda; A100 40/80 GB o H100 para entrenamiento con GRPO, que exige mantener varias muestras por prompt y, por tanto, más memoria que la inferencia.
- Cabe en GPU consumer: sí, con el modelo base cuantizado a 4 bits. En fp16 requiere al menos 8-10 GB de VRAM efectiva.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponible. No se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-3B-Instruct) | No disponible (base: 3,09B) | No disponible (base: 32.768 tokens, 131.072 con YaRN) | Adaptador LoRA + GRPO para desaprendizaje | No disponible | Repositorio publico con 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens nativos | Modelo denso instructivo | Apache 2.0 segun su model card publica | Ampliamente disponible |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Modelo denso instructivo | Licencia comunitaria Llama 3.2 | Ampliamente disponible |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 131.072 tokens | Modelo denso instructivo | Licencia MIT | Ampliamente disponible |

La comparación con alternativas de desaprendizaje no está disponible: no se han identificado en la información proporcionada otros adaptadores de la misma serie ("r0", "r1", etc.) ni líneas base publicadas por el autor. Las cifras de los modelos comparados corresponden a su documentación pública y no a datos verificados dentro de este repositorio.

## Limitaciones y advertencias

- Model card vacía: prácticamente todos los campos figuran como "[More Information Needed]" (autoría, datos de entrenamiento, hiperparámetros, evaluación, impacto ambiental, cita). No hay información suficiente para reproducir el entrenamiento.
- Licencia no declarada: sin licencia explícita, no puede asumirse permiso de uso comercial. Además, el uso del adaptador queda sujeto a la licencia del modelo base Qwen2.5-3B-Instruct (Apache 2.0), que debe respetarse por separado.
- Riesgo de olvido catastrófico: el desaprendizaje mediante ajuste por refuerzo puede degradar capacidades generales (razonamiento, código, fluidez) de forma no medida ni reportada.
- Desaprendizaje incompleto y reversible: el conocimiento supuestamente eliminado puede reaparecer con reformulaciones, prompting indirecto, fine-tuning posterior o incluso cambios en el formato de la conversación. No se aportan métricas de robustez.
- Riesgo de alucinación: el modelo base Qwen2.5-3B-Instruct es un modelo pequeño y puede inventar datos, especialmente en dominios factuales; el adaptador no corrige ni evalúa este comportamiento.
- Idiomas no declarados: se desconoce si el entrenamiento de desaprendizaje se realizó en inglés y si el comportamiento se mantiene en otros idiomas; es plausible que la supresión sea específica del idioma de entrenamiento.
- Sesgos: no se documenta ninguna evaluación de sesgos. Un entrenamiento orientado a eliminar información sobre una figura concreta puede introducir asimetrías o respuestas evasivas no deseadas.
- Metadatos anómalos: el identificador de arXiv citado (2608.17804) y las fechas de creación del repositorio (septiembre de 2026) no han podido verificarse, por lo que la referencia bibliográfica no debe citarse sin comprobación previa.
- Artefacto de investigación: cero descargas, cero valoraciones y ninguna evaluación de terceros. No es recomendable su uso en producción sin una validación propia exhaustiva de capacidades y seguridad.
- Requiere el modelo base: no es un modelo autónomo; hay que cargar Qwen2.5-3B-Instruct, lo que implica aceptar sus términos y asumir su huella de memoria y cómputo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-john-d-rockefeller-r0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper citado en la model card: https://arxiv.org/abs/2608.17804
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL (GRPO): https://huggingface.co/docs/trl
- Calculadora de impacto de machine learning citada en la model card: https://mlco2.github.io/impact
