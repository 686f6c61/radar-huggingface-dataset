# CyberBuddyAI/CyberBuddy-CyberOps-9B

## Resumen

CyberBuddy-CyberOps-9B es un ajuste fino del modelo Qwen/Qwen3.5-9B desarrollado por CyberBuddyAI, orientado a tareas de ciberseguridad ofensiva y defensiva dentro de un marco de trabajo autorizado. Se trata de una versión "abliterated" del modelo base: se ha eliminado la dirección interna de rechazo de los pesos mediante la herramienta Heretic, de modo que el modelo responde directamente a peticiones sobre exploits, lógica de payloads, planificación de reconocimiento y tácticas de atacante que el modelo original rechazaría. No se ha entrenado ningún adaptador LoRA; la edición se aplica directamente sobre los pesos del modelo base.

El modelo conserva la arquitectura multimodal del Qwen3.5-9B original, incluyendo el codificador de visión, y mantiene el formato nativo de llamada a herramientas XML de Qwen3.5. Funciona tanto en modo "thinking" activado como desactivado, sin rechazos en ninguno de los dos casos. Con 9.409.813.744 parámetros totales y un tamaño de repositorio de 25,6 GB, está pensado para profesionales de seguridad que necesitan un asistente capaz de razonar sobre tráfico de red, triaje de incidentes o planes de escaneo sin las fricciones de seguridad del modelo base.

La relevancia actual del modelo radica en su enfoque de "refusal removal" quirúrgico: solo se modificaron 60 de los 426 tensores de pesos del modelo de lenguaje, preservando el conocimiento y las capacidades del base. Se distribuye bajo licencia Apache 2.0, con versiones cuantizadas en GGUF que permiten ejecutarlo en GPU de 8 GB con contexto de 64k, lo que lo hace accesible para laboratorios de seguridad con hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con codificador de visión |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k tokens (según la versión GGUF indicada en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M con embeddings Q8 (5,5 GiB), bf16, 4-bit (load_in_4bit) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q4_K_M-embQ8), mmproj f16 para visión |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con codificador de visión integrado que procesa entradas de imagen y texto. La modificación principal consiste en una ablación de la dirección de rechazo mediante Heretic, que edita directamente los pesos del modelo base en lugar de aplicar un ajuste supervisado o RLHF. Según la model card, solo 60 de los 426 tensores de pesos del modelo de lenguaje fueron alterados, lo que preserva el conocimiento y las habilidades originales del base. No hay LoRA ni adaptador adicional: la edición es directa sobre los safetensors.

El codificador de visión se mantiene byte a byte idéntico al del modelo base, y para su uso con GGUF se distribuye un archivo mmproj independiente en f16. El modelo conserva la plantilla de chat nativa de Qwen3.5 y el formato XML de llamada a herramientas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que el proceso no fue un entrenamiento convencional sino una edición de pesos.

## Capacidades

- Generación de texto y razonamiento sobre ciberseguridad: explicación de vulnerabilidades, lógica de exploits, tácticas de atacante y análisis defensivo.
- Llamada a herramientas (tool calling / function calling) en el formato XML nativo de Qwen3.5, con salida parseable como `tool_calls` de OpenAI al servir con llama.cpp `--jinja`.
- Modo thinking activado y desactivado, sin rechazos en ninguno de los dos; el modo desactivado se recomienda para tool-use conciso.
- Capacidades de agente y razonamiento multi-paso para planificación de escaneos, triaje y respuesta a incidentes.
- Visión multimodal: lectura de capturas de pantalla, diagramas y gráficos mediante el codificador de visión conservado.
- Capacidades multilingües limitadas al inglés según la model card.
- Sin rechazos en contenido de seguridad ofensiva (abliterated/uncensored).

## Casos de uso

- Pentesting autorizado: el modelo puede proponer planes de escaneo, explicar la lógica de un exploit y razonar sobre vectores de ataque en un alcance autorizado, usando tool calling para invocar herramientas como nmap.
- Competiciones CTF: resolución de retos de seguridad que requieren razonamiento sobre binarios, tráfico de red o vulnerabilidades web, con explicaciones directas sin bloqueos del modelo base.
- Triaje de incidentes en SOC: análisis de alertas y correlación de indicadores, con capacidad de leer capturas de pantalla de consolas o dashboards gracias al codificador de visión.
- Threat intelligence: razonamiento sobre tácticas, técnicas y procedimientos (TTPs) de atacantes para construir defensas, sin las restricciones del modelo original.
- Ejercicios red-team/blue-team: generación de escenarios de ataque simulados y análisis defensivo de los mismos dentro de un entorno controlado.
- Investigación de seguridad: estudio de sistemas propios o autorizados, con el modelo como asistente para explicar comportamiento anómalo o redactar informes técnicos.
- Automatización de flujos con agentes: integración en pipelines donde el modelo decide qué herramienta invocar (escaneo, consulta de logs, análisis de imagen) y un humano aprueba las acciones sobre sistemas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para GGUF Q4_K_M-embQ8: 5,5 GiB, cabe en GPU de 8 GB con contexto de 64k.
- VRAM adicional para visión: ~1 GB extra con `mmproj-CyberBuddy-CyberOps-9B-f16.gguf` (0,9 GB).
- VRAM para bf16 completo: 24 GB.
- VRAM para 4-bit con transformers (`load_in_4bit`): 10–12 GB.
- GPU recomendadas: 8 GB para GGUF cuantizado (RTX 3060/4060, etc.), 24 GB para bf16 (RTX 4090, A100 40GB, H100).
- Opciones de despliegue: llama.cpp (con `--jinja` para tool calls parseados), LM Studio, Ollama, vLLM, transformers con bitsandbytes para 4-bit.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| CyberBuddy-CyberOps-9B | 9,4B | 64k | Apache 2.0 | Ciberseguridad abliterated, multimodal, tool calling | Hugging Face, GGUF, safetensors |
| Qwen/Qwen3.5-9B (base) | 9,4B | no disponible | Apache 2.0 | Modelo general multimodal con rechazos de seguridad | Hugging Face |
| Alternativas de seguridad abliterated de 7-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones detalladas de modelos alternativos comparables de la misma categoría (asistentes de ciberseguridad abliterated de ~9B). La comparación principal posible es con el modelo base Qwen3.5-9B, del que se diferencia por la eliminación de rechazos y la orientación a SecOps, manteniendo arquitectura, visión y tool calling.

## Limitaciones y advertencias

- El modelo no rechaza peticiones: produce contenido que el modelo base declinaría. Debe usarse exclusivamente en trabajo lícito y autorizado (pentests con permiso, CTF, investigación sobre sistemas propios o autorizados, análisis defensivo).
- Riesgo elevado de uso indebido: la eliminación de rechazos no es un respaldo al mal uso; la responsabilidad recae en el usuario.
- Despliegue recomendado con humano en el bucle: el modelo propone acciones y una persona debe aprobar cualquier operación sobre sistemas reales.
- Idiomas: solo inglés según la model card; no se garantiza calidad en castellano u otros idiomas.
- Sesgos y alucinaciones: no se documentan sesgos específicos ni tasas de alucinación en la información disponible; como todo modelo generativo, puede producir información técnica incorrecta, especialmente en detalles de exploits o configuraciones.
- Licencia Apache 2.0: permite uso comercial, pero las restricciones éticas y legales sobre ciberseguridad ofensiva siguen aplicando independientemente de la licencia.
- La abliteración puede degradar ligeramente capacidades generales del base, aunque la model card afirma que solo se modificaron 60 de 426 tensores para minimizar el impacto.
- No hay benchmarks publicados que permitan evaluar su rendimiento frente al base o a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/CyberBuddyAI/CyberBuddy-CyberOps-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
