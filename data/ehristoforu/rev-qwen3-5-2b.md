# ehristoforu/rev-qwen3.5-2b

## Resumen

Rev-Qwen3.5-2B es un modelo derivado por fusión (merge) del modelo base Qwen/Qwen3.5-2B, publicado por el desarrollador independiente ehristoforu bajo el paraguas de su familia "REV". No es un entrenamiento desde cero ni un fine-tuning aislado: el autor describe una receta en varias etapas que combina la fusión de modelos ya ajustados, seguida de la fusión de adaptadores LoRA entrenados mediante destilación a partir de modelos insignia de pesos abiertos. El resultado es un modelo de 2.274.069.824 parámetros (aproximadamente 2B) que hereda sin cambios la arquitectura y las especificaciones tecnicas del modelo base.

El objetivo declarado es mejorar el rendimiento del Qwen3.5-2B original en tareas de comunicacion, razonamiento, ciencia (fisica, biologia, medicina), matematicas, traduccion, codigo y funciones de agente. Segun la model card, todas estas areas muestran mejoras respecto al base, aunque no se aportan cifras absolutas de benchmarks, solo una comparativa grafica sin valores numericos en el texto.

Su relevancia practica radica en que ofrece una ventana de contexto declarada de 262.144 tokens en un modelo de solo 2B de parametros, con licencia Apache-2.0 y pesos publicados en formatos safetensors y GGUF, lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp. El pipeline declarado es image-text-to-text, aunque la model card no detalla las capacidades de vision mas alla de heredarlas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (heredada del modelo base, sin cambios) |
| Parametros totales | 2.274.069.824 (aprox. 2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GGUF (se publica al menos Q4_K_M); safetensors en precision original |
| Idiomas soportados | en, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-2B, identificada como `qwen3_5`, y el autor afirma explicitamente que las especificaciones tecnicas y la arquitectura se heredan sin modificaciones. No se detalla en la informacion disponible si se trata de un transformer denso, MoE o hibrido; dado el tamano (2B) y la ausencia de parametros activos distintos del total, lo mas probable es un transformer denso, pero no se confirma en la documentacion.

El entrenamiento no sigue un proceso convencional de preentrenamiento. La receta descrita consiste en: partir del Qwen3.5-2B, fusionar varios modelos ya ajustados (fine-tuned), y despues fusionar adaptadores LoRA que fueron entrenados mediante destilacion a partir de modelos insignia de pesos abiertos. Las herramientas mencionadas en los tags son mergekit (para las fusiones) y unsloth (para el entrenamiento de LoRA). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas propias mas alla de la propia receta de fusion y destilacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con foco declarado en "comunicacion basica".
- Razonamiento y tareas cientificas: fisica, biologia y medicina aparecen como areas mejoradas segun la model card.
- Matematicas: se declara mejora en tareas matematicas respecto al base.
- Generacion de codigo: el tag `code` y la tabla de mejoras indican soporte para tareas de programacion.
- Traduccion: se declara mejora en traduccion, con soporte de ingles y ruso.
- Funciones de agente: la model card menciona mejora en "Agent Functions", lo que sugiere soporte de tool calling o razonamiento multi-paso, aunque no se detalla el mecanismo.
- Procesamiento image-text-to-text: el pipeline declarado es multimodal, heredado del modelo base; no se detallan las capacidades de vision concretas.
- Capacidades multilingues limitadas a ingles y ruso segun el campo `language`.

## Casos de uso

- Asistente conversacional ligero en produccion: con 2B de parametros y cuantizacion Q4_K_M, puede desplegarse en una sola GPU de consumo o incluso en CPU, gestionando dialogos multi-turno con una ventana de contexto de hasta 262.144 tokens para conversaciones con historial extenso.
- Traduccion ingles-ruso en pipelines automatizados: el modelo declara mejora en traduccion y soporta ambos idiomas, por lo que puede integrarse en flujos de localizacion de contenido con latencia baja gracias a su tamano reducido.
- Generacion de codigo en entornos con recursos limitados: el tag `code` y la mejora declarada en coding permiten usarlo como asistente de autocompletado o generacion de fragmentos en IDE o scripts de CI, donde un modelo mayor no cabria.
- Tareas de agente y tool calling: la mejora declarada en "Agent Functions" lo hace candidato para orquestacion de llamadas a herramientas en agentes ligeros, con contexto largo para mantener el estado de la tarea.
- Razonamiento cientifico y educativo: las mejoras declaradas en fisica, biologia y medicina permiten usarlo en asistentes de estudio o respuesta a preguntas tecnicas de dominio, siempre con supervision humana por el riesgo de alucinacion.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, puede resumir o extraer informacion de documentos extensos en una sola pasada, algo poco habitual en modelos de 2B.
- Despliegue en el borde (edge) o en local: al publicarse en GGUF y ejecutarse con llama.cpp, es adecuado para aplicaciones de escritorio o entornos sin GPU dedicada que requieran privacidad de datos.

## Benchmarks y rendimiento

La model card incluye una tabla cualitativa que indica "Improved" (mejorado) en todas las tareas evaluadas respecto al modelo base, pero no aporta valores numericos absolutos ni la comparativa grafica incluye cifras en el texto disponible.

| Tarea | Resultado declarado |
|---|---|
| Comunicacion basica | Mejorado |
| Traduccion | Mejorado |
| Matematicas | Mejorado |
| Fisica | Mejorado |
| Biologia | Mejorado |
| Medicina | Mejorado |
| Codigo | Mejorado |
| Funciones de agente | Mejorado |

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en cuantizacion Q4_K_M, aproximadamente 1,4-1,6 GB para los pesos, mas el overhead de contexto; con contexto largo (decenas de miles de tokens) el consumo de KV cache crece de forma significativa.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones de 4 bits con contexto moderado; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad y contexto extendido. Para contexto completo de 262.144 tokens se requiere mucha mas memoria por el KV cache.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas usando GGUF cuantizado.
- Opciones de despliegue: llama.cpp (comando documentado con `llama-server`), y por compatibilidad de formato GGUF, tambien Ollama y otros runners basados en llama.cpp. No se documenta soporte explicito de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Rev-Qwen3.5-2B | 2,27B | 262.144 | Apache-2.0 | en, ru | Merge + LoRA destilado sobre Qwen3.5-2B |
| Qwen/Qwen3.5-2B (base) | 2B | 262.144 | Apache-2.0 | no disponible | Modelo original sin modificaciones |
| Alternativas de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

La unica comparacion documentada es contra su propio modelo base, del que hereda arquitectura, contexto y licencia, y respecto al que el autor declara mejoras cualitativas en todas las tareas evaluadas.

## Limitaciones y advertencias

- Solo se declaran dos idiomas (ingles y ruso); el rendimiento en castellano no esta documentado y probablemente sea inferior.
- El modelo se presenta como image-text-to-text, pero no se detallan las capacidades de vision ni se aportan evaluaciones multimodales.
- Las mejoras se declaran de forma cualitativa ("Improved") sin cifras absolutas ni metodologia de evaluacion publicada, lo que impide verificar la magnitud real de la mejora.
- Es un merge de modelos y LoRA destilados de modelos insignia; puede heredar sesgos y comportamientos de las fuentes no documentadas.
- Riesgo de alucinacion inherente a un modelo de 2B, especialmente en dominios cientificos y medicos; no debe usarse como fuente de verdad sin verificacion.
- El contexto declarado de 262.144 tokens es el del modelo base; el rendimiento efectivo en contextos muy largos no esta verificado para este merge.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de las fuentes de destilacion.
- Modelo con muy poca traccion (20 descargas, 1 like en el momento de la consulta) y sin validacion externa; tratar como experimental para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ehristoforu/rev-qwen3.5-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- README en ruso: https://huggingface.co/ehristoforu/rev-qwen3.5-2b/blob/main/README_ru.md
- Coleccion REV LLM en Hugging Face: https://huggingface.co/collections/ehristoforu/rev-llm-models
- Repositorio GitHub del proyecto: https://github.com/ehristoforu/rev-llm
- Documentacion del servidor llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
