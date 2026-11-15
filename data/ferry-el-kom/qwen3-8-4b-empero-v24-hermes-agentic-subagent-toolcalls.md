# ferry-el-kom/qwen3.8-4b-empero-v24-Hermes-agentic-subagent-toolcalls

## Resumen
qwen3.8-4b-empero-v24-Hermes-agentic-subagent-toolcalls es un ajuste fino (LoRA) del modelo destilado empero-ai/Qwen3.8-4B-Distill, publicado por el usuario ferry-el-kom. El modelo está diseñado específicamente para actuar como subagente dentro del harness Hermes Agent: ejecuta tareas de shell y de sistema de archivos mediante tool calling, persiste entregables en disco y reporta resultados de forma disciplinada. No es un modelo conversacional generalista, sino un operador de tareas orientado a un arnés concreto.

La arquitectura subyacente es la de Qwen3.5-4B (transformer denso de aproximadamente 4.200 millones de parámetros, según los pesos en safetensors del repositorio). El entrenamiento se realizó con QLoRA sobre ROCm (r=32, alpha=64, all-linear, 560 pasos) partiendo del núcleo v22 y añadiendo once clases de dosis dirigidas a fallos medidos en evaluación: persistencia de entregables, parada y reporte, bootstrap de entorno, identidad desde contexto, sondeo de toolchain, inventarios dinámicos, precisión de unidades y disciplina básica de archivos. La pérdida final de entrenamiento reportada es 0,46.

Su relevancia actual reside en el nicho: modelos pequeños (4B) que quepan en hardware de consumo y que estén afinados para ejecutar tareas agénticas reales con llamadas a herramientas, en lugar de para conversación abierta. El autor documenta explícitamente el régimen de inferencia requerido y los modos de fallo conocidos, algo poco habitual en finetunes de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B vía destilación) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens en GGUF nativo; el harness Hermes exige un mínimo de 64.000 |
| Tipos de cuantización | no disponible (el repositorio incluye GGUF; no se detallan los niveles publicados) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B, que fue destilado por empero-ai en Qwen3.8-4B-Distill (Apache-2.0) a partir de aproximadamente 45.000 trazas internas generadas por profesores en la nube (GLM-5.2/5.3, DeepSeek y Qwen). Sobre ese núcleo, ferry-el-kom aplicó un LoRA nuevo (r=32, alpha=64, all-linear, 560 pasos) en QLoRA sobre ROCm, combinando el núcleo portable v22 con dosis verificadas de forma determinista para corregir fallos observados en evaluación. El tokenizador empleado es el de Jackrong Qwen3.5-4B con la corrección `fix_mistral_regex`.

La innovación principal no es arquitectónica sino de procedimiento: el ajuste se guía por una suite de evaluación de 30 tareas (SM01–SM30) ejecutadas en un harness real, y las dosis de entrenamiento se seleccionan para atacar fallos concretos medidos (por ejemplo, rutas con espacios, creación de subdirectorios inexistentes, aplicación de parches sin romper ficheros adyacentes, conteo exacto de líneas o detección de claves filtradas). La evaluación se realizó exclusivamente con GGUF sobre llama.cpp. La plantilla de chat, incluido el formato JSON de `<tool_call>`, está embebida en el GGUF.

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento (`<think>`), que consume parte del presupuesto de tokens de salida.
- Tool calling en formato JSON mediante la plantilla de chat embebida en el GGUF.
- Ejecución de tareas agénticas de múltiples pasos: crear directorios, escribir ficheros, aplicar parches, inspeccionar procesos, analizar logs y validar resultados.
- Disciplina de entrega: persistencia de entregables en rutas exactas, incluidas rutas sensibles a mayúsculas y con espacios.
- Bootstrap y reconocimiento de entorno: comprobación de versiones instaladas, inventarios dinámicos, sondeo de toolchain de desarrollo.
- Análisis de sistema: lectura de `/proc`, identificación de puertos y procesos propietarios, detección de procesos zombis, análisis de journal del sistema.
- Procesamiento de logs y texto: extracción con PCRE, validación de filas en CSV, filtrado de entradas en changelogs.
- Respuesta directa sin herramientas para consultas conversacionales simples (disciplina de chat).
- Soporte de tool_search/MCP: el autor lo marca como no válido en la configuración mini empleada en evaluación.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso
- Automatización de tareas de mantenimiento en servidores: el modelo puede inspeccionar puertos con `ss`/`lsof`, identificar el proceso propietario, terminarlo y reiniciar el servicio, encadenando varias tool calls en secuencia dentro de un mismo turno.
- Subagente de un orquestador multiagente: encaja como ejecutor de bajo nivel en un harness tipo Hermes, recibiendo subtareas concretas y devolviendo resultados verificables, gracias a su entrenamiento específico en parada y reporte.
- Reparación automática de scripts: localizar un `assert` que falla, corregir el código y reejecutar hasta que el test pase, con verificación en bucle.
- Auditoría de seguridad básica en entornos de desarrollo: detectar claves de API filtradas en ficheros de entorno, localizar marcadores entre miles de ficheros o revisar el journal del sistema en busca de errores reales.
- Procesamiento por lotes de datos estructurados: validar filas de CSV, sumar valores y compararlos con umbrales de configuración, o filtrar entradas en changelogs y listas de tareas.
- Gestión de ficheros con rutas estrictas: mover o renombrar ficheros a rutas exactas sensibles a mayúsculas (por ejemplo, `arhiva/2026/NOIEMBRIE`) y crear subdirectorios inexistentes con `mkdir -p` antes de escribir.
- Aplicación controlada de parches: aplicar un `.patch` a un fichero sin alterar ficheros adyacentes que deben permanecer intactos, útil en pipelines de integración.
- Ejecución local con privacidad: al ser un modelo de 4B con GGUF, puede desplegarse en estaciones de trabajo sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona únicamente resultados parciales de su suite propia SM01–SM30, ejecutada en harness real, y señala que la evaluación estaba en curso en el momento de la subida. Como referencia, el baseline v21 en las mismas condiciones y con parámetros correctos obtiene 8–9 de 30.

| Evaluación | Resultado |
|---|---|
| Suite SM01–SM30 (harness real) | en curso en el momento de la publicación; resultados parciales en SMOKE-RESULTS.md |
| Baseline v21 (mismas condiciones, parámetros correctos) | 8–9 / 30 |
| Modo fuera de régimen (defaults 0.8/40) frente a v21 | 5/30 frente a 8/30 (bucles de repetición y no terminación) |
| Pérdida final de entrenamiento | 0,46 |

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita. Para un modelo denso de 4,2B, las estimaciones habituales serían aproximadamente 8–9 GB en FP16, 4–5 GB en cuantización de 8 bits y 2,5–3 GB en cuantizaciones de 4 bits; estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no especificadas. El entrenamiento se realizó con QLoRA sobre ROCm, lo que implica compatibilidad con GPUs AMD; la evaluación se hizo con llama.cpp sobre GGUF.
- GPU de consumo: por tamaño, un modelo de 4B en GGUF de 4 bits cabe en GPUs de consumo con 8 GB o más de VRAM; no hay confirmación del autor.
- Opciones de despliegue: llama.cpp (entorno de evaluación declarado), transformers (librería indicada en el repositorio) y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`.
- Contexto operativo: el harness Hermes rechaza configuraciones por debajo de 64.000 tokens de contexto, aunque la ventana nativa del GGUF es de 262.144.
- Parámetros de inferencia obligatorios: temperatura 0,6, top_p 0,95, top_k 20, muestreo activado, `max_new_tokens` mínimo de 4.096 (recomendado 16.384). La decodificación greedy es un modo de fallo conocido para esta clase de modelos de razonamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.8-4b-empero-v24-Hermes (este modelo) | 4,2B | 262k nativo, 64k mínimo en harness | Subagente agéntico con tool calls, ajustado sobre suite SM01–SM30 | Apache-2.0 | Hugging Face, safetensors y GGUF |
| empero-ai/Qwen3.8-4B-Distill (modelo base) | ~4B | no disponible | Destilación generalista de profesores en la nube | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (raíz de la cadena) | ~4B | no disponible | Modelo base generalista | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y enfoque.

## Limitaciones y advertencias
- El modelo está afinado para un harness concreto (Hermes Agent) y un régimen de inferencia concreto; fuera de él, el rendimiento se degrada de forma medible (5/30 frente a 8/30 en la comparación con v21 bajo parámetros por defecto).
- La decodificación greedy es un modo de fallo declarado: produce bucles de repetición y no terminación.
- Con menos de 64.000 tokens de contexto, el harness rechaza la ejecución de forma inmediata.
- El presupuesto de tokens de salida debe ser amplio (mínimo 4.096, recomendado 16.384) porque el modo de pensamiento `<think>` consume parte del mismo; un presupuesto insuficiente trunca la respuesta.
- El soporte de tool_search/MCP se marca como no válido en la configuración mini usada en evaluación.
- Idiomas: solo inglés declarado; no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinación: no cuantificado por el autor; como modelo de 4B destilado, es esperable en tareas fuera de su distribución de entrenamiento.
- Sesgos: no documentados en la información disponible.
- La evaluación en harness real estaba incompleta en el momento de la publicación; los resultados definitivos deben consultarse en SMOKE-RESULTS.md.
- Uso comercial: permitido por la licencia Apache-2.0, sujeta a las condiciones de la licencia del modelo base y de la raíz Qwen3.5-4B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.8-4b-empero-v24-Hermes-agentic-subagent-toolcalls
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-4B
- Tokenizador de referencia (Jackrong Qwen3.5-4B): no disponible como enlace directo en la información proporcionada
- Resultados de evaluación (SMOKE-RESULTS.md): incluido en el repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
