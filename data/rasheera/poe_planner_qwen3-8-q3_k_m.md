# Rasheera/poe_planner_qwen3.8-Q3_K_M

## Resumen

El modelo `Rasheera/poe_planner_qwen3.8-Q3_K_M` es una cuantización GGUF en formato Q3_K_M del modelo Qwen3.8-27B, un modelo de lenguaje y visión (vision-language) denso de 27 000 millones de parámetros desarrollado por la comunidad Qwen. El autor, Rasheera, ha realizado un ajuste fino (fine-tuning) orientado a tareas de planificación (poe_planner) utilizando la librería Unsloth, y posteriormente ha convertido los pesos a formato GGUF para su ejecución eficiente con llama.cpp y herramientas compatibles.

El modelo base Qwen3.8-27B destaca por su ventana de contexto nativa de 262 000 tokens, razonamiento configurable (modo pensamiento y modo no pensamiento) y capacidades multimodales (entrada de imágenes). Esta versión cuantizada permite ejecutar un modelo de este tamaño en hardware de consumo, manteniendo un equilibrio entre calidad y requisitos de memoria. El repositorio incluye dos archivos: el modelo principal en GGUF (Q3_K_M) y un proyector multimodal en BF16 (mmproj), lo que indica que conserva la capacidad de procesar imágenes.

La relevancia de este modelo radica en su accesibilidad: al estar cuantizado, puede desplegarse en GPUs con 16 GB de VRAM o incluso en CPU con suficiente RAM, abriendo la puerta a aplicaciones de planificación asistida por IA en entornos locales o con recursos limitados. No obstante, la información pública sobre el proceso de fine-tuning, el dataset utilizado y la licencia exacta es escasa, por lo que se recomienda precaución antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27 320 697 856 (27,32 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (nativo, segun documentacion de Qwen3.8) |
| Tipos de cuantizacion | Q3_K_M (GGUF) para el modelo principal; BF16 para el proyector multimodal |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingue, pero no se especifica en esta version) |
| Licencia | No disponible (el adapter asociado indica apache-2.0, pero el archivo GGUF no lo declara) |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención completa, diseñado para tareas de razonamiento, codificacion, trabajo profesional e investigacion. Incorpora un modo de razonamiento configurable (thinking mode) que permite ajustar el presupuesto computacional dedicado al razonamiento interno, similar a otros modelos de la serie Qwen3. Su arquitectura incluye un codificador visual para procesar imagenes, lo que lo convierte en un modelo vision-language.

El fine-tuning realizado por Rasheera se ha llevado a cabo con Unsloth, una libreria que acelera el entrenamiento y la conversion a GGUF. No se han publicado detalles sobre el dataset de entrenamiento, el metodo de ajuste (si fue LoRA, QLoRA o full fine-tuning) ni la duracion del proceso. La conversion a GGUF con cuantizacion Q3_K_M reduce significativamente el tamaño del modelo (de aproximadamente 54 GB en BF16 a unos 14 GB), a costa de una posible degradacion en la precision. El proyector multimodal se mantiene en BF16 para preservar la calidad de la entrada visual.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de realizar tareas complejas de razonamiento logico, matematicas y comprension de texto, con un modo de pensamiento que permite profundizar en problemas antes de responder.
- Codificacion: soporta generacion, explicacion y depuracion de codigo en multiples lenguajes, aunque el fine-tuning especifico puede haber alterado este comportamiento.
- Vision: al incluir el proyector multimodal, el modelo puede procesar imagenes y responder preguntas sobre ellas, aunque la cuantizacion Q3_K_M puede afectar a la calidad de la comprension visual.
- Contexto largo: con 262 144 tokens de ventana nativa, puede manejar documentos extensos, conversaciones multi-turno y tareas agenciales de largo horizonte.
- Razonamiento configurable: permite alternar entre modo pensamiento (thinking) y modo directo, ajustando el equilibrio entre velocidad y profundidad de razonamiento.
- Tool calling y agentes: aunque no se menciona explicitamente en la documentacion del modelo, la serie Qwen3 incluye soporte para tool calling y uso de agentes; el fine-tuning puede haber adaptado estas capacidades a tareas de planificacion.

## Casos de uso

- Planificacion de proyectos: el modelo puede descomponer un objetivo complejo en tareas secuenciales, estimar tiempos y recursos, y generar un cronograma detallado. Su contexto largo permite considerar multiples restricciones y dependencias.
- Asistente de investigacion: con su capacidad de razonamiento y vision, puede analizar articulos cientificos, extraer informacion de graficos y tablas, y proponer hipotesis o lineas de experimentacion.
- Generacion de codigo en entornos de desarrollo: puede integrarse en IDEs o pipelines de CI/CD para generar fragmentos de codigo, escribir tests o documentar APIs, aprovechando su modo de razonamiento para detectar errores logicos.
- Atencion al cliente con contexto largo: su ventana de 262K tokens permite mantener conversaciones extensas con historial completo, gestionando consultas complejas y derivando a agentes humanos cuando sea necesario.
- Analisis de documentos visuales: al aceptar imagenes, puede procesar capturas de pantalla, diagramas o fotografias para extraer informacion y responder preguntas, util en entornos de soporte tecnico o auditoria.
- Automatizacion de tareas agenciales: gracias a su soporte de tool calling y razonamiento multi-paso, puede actuar como un agente que consulta APIs, ejecuta comandos y toma decisiones basadas en resultados intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para este fine-tuning especifico. Se recomienda consultar los benchmarks del modelo base Qwen3.8-27B en la documentacion oficial de Qwen para una referencia aproximada, aunque la cuantizacion Q3_K_M puede degradar el rendimiento en tareas que requieren alta precision.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q3_K_M ocupa aproximadamente 14,4 GB (incluyendo el proyector). Con overhead de ejecucion, se recomienda al menos 16 GB de VRAM para una GPU dedicada.
- GPUs compatibles: RTX 4080, RTX 4090, A6000, A100 (con suficiente VRAM) o cualquier GPU con 16 GB o mas. Tambien puede ejecutarse en CPU con 32 GB de RAM o mas, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (via `llama-cli` o `llama-mtmd-cli`), Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. Para el proyector multimodal, se requiere `llama-mtmd-cli`.
- Latencia y throughput: no disponibles. Dependera del hardware y de la configuracion de razonamiento (modo pensamiento aumenta la latencia). En una RTX 4090, se estima una velocidad de generacion de 20-40 tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Rasheera/poe_planner_qwen3.8-Q3_K_M | 27,32 B | 262K | Si | No disponible | GGUF |
| Qwen3-8B (base) | 8 B | 32K (ampliable a 128K) | No | Apache-2.0 | Safetensors |
| Qwen3-32B (base) | 32 B | 32K (ampliable a 128K) | No | Apache-2.0 | Safetensors |
| Qwen2.5-VL-7B | 7 B | 32K | Si | Apache-2.0 | Safetensors |

La comparativa se basa en los modelos base de Qwen, ya que no hay datos de rendimiento del fine-tuning. El modelo de Rasheera ofrece un contexto mucho mayor (262K) y capacidades de vision, pero su licencia no esta clara y su cuantizacion Q3_K_M puede reducir la calidad en comparacion con los pesos completos.

## Limitaciones y advertencias

- Licencia incierta: aunque el adapter asociado indica apache-2.0, el archivo GGUF no declara una licencia explicita. Antes de usarlo comercialmente, contacta con el autor o verifica la licencia del modelo base Qwen3.8.
- Degradacion por cuantizacion: la cuantizacion Q3_K_M reduce la precision, lo que puede provocar errores en tareas de razonamiento complejo, generacion de codigo o comprension visual. Se recomienda probar el modelo en casos de uso criticos antes de desplegarlo.
- Sesgos del fine-tuning: al ser un ajuste fino especifico para "poe_planner", el modelo puede estar sesgado hacia ese dominio y mostrar un rendimiento inferior en tareas generales.
- Riesgo de alucinacion: como cualquier LLM, puede generar informacion falsa o inventada, especialmente en contextos largos o con datos ambiguos.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque el modelo base es multilingue, el fine-tuning puede haber reducido el rendimiento en idiomas distintos del ingles.
- Requisitos de hardware: aunque cabe en 16 GB de VRAM, la ejecucion en CPU puede ser lenta para tareas interactivas. El proyector multimodal requiere el binario `llama-mtmd-cli` y puede aumentar el uso de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rasheera/poe_planner_qwen3.8-Q3_K_M
- Adapter del fine-tuning: https://huggingface.co/Rasheera/poe_planner_qwen3.8-Adapter
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Blog de Qwen3: https://qwen.ai/blog?id=qwen3
