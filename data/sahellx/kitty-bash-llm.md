# sahellx/kitty-bash-llm

## Resumen

Kitty Bash LLM es un modelo de lenguaje pequeño (0,5B parámetros) especializado en la generación, reparación y completado de comandos bash. Desarrollado por sahellx, se basa en Qwen2.5-Coder-0.5B-Instruct y se ha afinado con LoRA para tres tareas concretas: convertir lenguaje natural a comandos (nl2cmd), corregir comandos fallidos (fixcmd) y completar comandos a medio escribir (complete). Su diseño busca funcionar en CPU sin GPU, con un GGUF cuantizado a 4 bits de 398 MB que genera un comando en menos de un segundo, lo que lo hace adecuado para integrarse en entornos de terminal sin depender de servicios externos.

El modelo es un especialista, no un chatbot general: si se le pregunta por conocimiento enciclopédico produce resultados sin sentido, pero ante peticiones de comandos shell responde con precisión. Está pensado para usarse con decodificación greedy (temperatura 0) y se distribuye tanto en formato safetensors (fp16) como en GGUF para llama.cpp. Su entrenamiento fue rápido (41 minutos en una Tesla T4) y la evaluación muestra mejoras sustanciales frente al modelo base sin ajustar, aunque con advertencias sobre su rendimiento en errores reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada (el base Qwen2.5-Coder-0.5B-Instruct soporta 32K, pero no se confirma en la documentación del modelo) |
| Tipos de cuantizacion | fp16 (safetensors), GGUF (q4_k_m y posiblemente otros) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Kitty Bash LLM es un fine-tuning LoRA sobre Qwen2.5-Coder-0.5B-Instruct, un modelo de 0,5B parámetros de la familia Qwen2. La adaptación utiliza LoRA con r=64 y alpha=64 aplicado a todas las proyecciones de atención y MLP, y posteriormente se fusionan los pesos en el modelo base. El entrenamiento se realizó en fp16 sobre una Tesla T4 (sin bf16), con una sola época, learning rate 2e-4 con scheduler coseno y 3% de warmup, batch efectivo de 32 (16 × 2 grad-accum), longitud máxima de secuencia de 512 tokens y una función de pérdida que solo considera la respuesta (el comando), no el prompt. El proceso duró 41 minutos y alcanzó una loss final de entrenamiento de 0,5579 y de evaluación de 0,5919.

La innovación principal no está en la arquitectura, sino en el diseño de tareas: el modelo se entrena para tres comportamientos distintos seleccionados mediante el system prompt (nl2cmd, fixcmd y complete), todos con salida exclusiva del comando, sin explicaciones ni marcas de formato. Esto lo convierte en una herramienta de propósito específico, no en un asistente conversacional.

## Capacidades

- Generación de comandos bash a partir de lenguaje natural (nl2cmd). Por ejemplo, "find all files larger than 100MB under /var" produce `find /var -type f -size +100M`.
- Reparación de comandos fallidos (fixcmd): dado un comando que ha producido un error y la salida de error, devuelve el comando corregido. Ejemplo: `gerp -r 'TODO' .` con error `bash: gerp: command not found` se corrige a `grep -r 'TODO' .`.
- Completado de comandos parciales (complete): dado un prefijo como `tar -czf backup.`, genera la continuación adecuada, por ejemplo `$(date +%F).tar.gz /path/to/dir`.
- Salida estricta: solo emite el comando, sin explicaciones, markdown ni texto adicional.
- Decodificación greedy recomendada (temperatura 0) para obtener el comando más probable.
- No es un chatbot general: no responde preguntas de conocimiento, razonamiento abstracto ni conversación libre.
- Soporte únicamente en inglés.

## Casos de uso

- Asistente de terminal integrado en shell: se puede conectar a un servidor persistente (llama-server) y prefillar el system prompt una sola vez, de modo que el usuario escriba peticiones en lenguaje natural y reciba comandos listos para ejecutar. Su baja latencia (<1s en CPU) lo hace viable para uso interactivo.
- Reparación de comandos fallidos en sesiones interactivas: el usuario pega el comando que falló y el mensaje de error, y el modelo devuelve la corrección. Útil para administradores de sistemas que trabajan con herramientas poco familiares.
- Autocompletado de comandos parciales: integrado en un prompt de shell o en un editor, sugiere la continuación de un comando a medio escribir, reduciendo errores de sintaxis.
- Automatización de tareas de administración: generar comandos para gestión de archivos, procesos, red, permisos, backups, etc., a partir de descripciones en lenguaje natural. Por ejemplo, "comprime la carpeta logs en un tar.gz" produce `tar -czvf logs.tar.gz logs/`.
- Integración en pipelines de CI/CD: generar comandos de despliegue, limpieza o mantenimiento a partir de descripciones textuales en scripts de automatización, sin necesidad de un LLM externo.
- Herramienta educativa para aprender bash: los estudiantes describen lo que quieren hacer y ven el comando resultante, lo que facilita la comprensión de la sintaxis y las opciones de los comandos.
- Asistente offline para entornos sin GPU o con recursos limitados: gracias a su tamaño reducido (398 MB en GGUF q4), puede ejecutarse en portátiles, Raspberry Pi o servidores sin aceleración gráfica, manteniendo la privacidad de los datos al no requerir conexión a internet.
- Generación de comandos para scripts de backup, limpieza, monitorización o gestión de logs, donde se necesita una salida rápida y determinista.

## Benchmarks y rendimiento

La model card incluye una evaluación propia comparando el modelo afinado con el modelo base sin ajustar, sobre 100 ejemplos por tarea, con prompts idénticos, formato GGUF f16 y el mismo motor llama.cpp. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

### Tarea nl2cmd

| Metrica | Base | Kitty | Delta |
|---|---|---|---|
| Exact match | 7,00 | 23,00 | +16,00 (3,3x) |
| First-utility accuracy | 61,00 | 79,00 | +18,00 |
| Token F1 | 39,35 | 59,77 | +20,42 |
| `bash -n` valido | 93,00 | 94,00 | +1,00 |
| ShellCheck limpio | 77,00 | 82,00 | +5,00 |

### Tarea fixcmd

| Metrica | Base | Kitty | Delta |
|---|---|---|---|
| Exact match | 0,00 | 82,00 | +82,00 |
| First-utility accuracy | 1,00 | 99,00 | +98,00 |
| Token F1 | 45,20 | 96,71 | +51,51 |
| ShellCheck limpio | 63,00 | 83,00 | +20,00 |

Nota del autor: el resultado de exact match del base (~0) se debe en gran parte a que ignora el formato de salida y explica el error en prosa en lugar de emitir un comando. En pruebas manuales con errores reales de shell, el rendimiento se sitúa más cerca de 1 de cada 3, por lo que el 82% debe considerarse un límite superior.

### Tarea complete

| Metrica | Base | Kitty | Delta |
|---|---|---|---|
| Token F1 | 2,22 | 29,88 | +27,66 (13x) |
| Exact match | 0,00 | 7,00 | +7,00 |
| Prefix+completion valido | — | 99,29 | — |

El autor indica que el exact match es una métrica pobre para esta tarea, ya que muchas completaciones son válidas para cualquier prefijo. La métrica significativa es prefix+completion, que alcanza el 99,29%.

## Requisitos de hardware

- El GGUF cuantizado a 4 bits (q4_k_m) ocupa 398 MB y puede ejecutarse en CPU con llama.cpp. Con 4 hilos genera un comando en menos de un segundo, según la model card.
- El safetensors en fp16 ocupa aproximadamente 1 GB (494M parámetros × 2 bytes), por lo que cabe en GPUs con 2 GB o más de VRAM (por ejemplo, GTX 1050 Ti, GTX 1650, RTX 2060, etc.).
- No requiere GPU para inferencia; es viable en portátiles, mini-PCs o incluso dispositivos de bajo consumo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), transformers (Python), y cualquier framework compatible con el formato GGUF o safetensors (Ollama, vLLM, TGI, etc.).
- Para uso interactivo se recomienda un servidor persistente (llama-server) que prefillé el system prompt una sola vez, reduciendo la latencia por petición.

## Comparativa con modelos similares

No se dispone de datos de otros modelos especializados en generación de comandos bash con los que comparar directamente. La única comparación publicada es contra el modelo base Qwen2.5-Coder-0.5B-Instruct, que se muestra en la sección de benchmarks. Existen herramientas comerciales como Shell-GPT o abc (getabc.sh) que traducen lenguaje natural a comandos, pero no se han encontrado métricas públicas comparables. Por tanto, la comparativa se limita al modelo base:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct (base) | 0,5B | 32K (segun Qwen) | Apache-2.0 | Generico, incluye codigo |
| Kitty Bash LLM | 0,5B | No especificado | Apache-2.0 | Comandos bash (nl2cmd, fixcmd, complete) |

## Limitaciones y advertencias

- Es un especialista, no un chatbot: falla en preguntas de conocimiento general, razonamiento abstracto o conversación libre. Pedirle la capital de Francia produce resultados sin sentido.
- Solo soporta inglés; no se ha entrenado para otros idiomas.
- El rendimiento en errores reales de shell es significativamente menor que en el conjunto de prueba sintético. El autor estima que acierta aproximadamente 1 de cada 3 errores reales, frente al 82% de exact match en el test.
- La tarea de completado tiene un exact match muy bajo (7%), aunque la validez del prefijo+completado es alta (99,29%). Esto significa que las sugerencias suelen ser sintácticamente válidas pero no siempre coinciden con la intención exacta del usuario.
- El contexto de entrenamiento se limita a 512 tokens, por lo que comandos muy largos o con mucho contexto previo pueden no manejarse bien, aunque el modelo base soporte ventanas mayores.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación en comandos poco comunes o con opciones avanzadas; se recomienda revisar la salida antes de ejecutarla.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, y el modelo base Qwen2.5-Coder-0.5B-Instruct también es Apache-2.0, por lo que no hay conflicto de licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahellx/kitty-bash-llm
- Modelo base Qwen2.5-Coder-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
