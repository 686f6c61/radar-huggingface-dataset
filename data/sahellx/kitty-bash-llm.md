# sahellx/kitty-bash-llm

## Resumen

Kitty Bash LLM es un modelo especializado de 0,5 mil millones de parámetros (494.032.768 exactos, según los pesos en safetensors) desarrollado por el usuario sahellx y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-Coder-0.5B-Instruct orientado a una única tarea: la generación, reparación y autocompletado de comandos bash a partir de lenguaje natural o de contexto de terminal. No es un asistente conversacional generalista; su model card lo describe explícitamente como un "especialista, no un chatbot".

El problema que resuelve es concreto: integrar asistencia de shell en un terminal sin depender de una GPU, de una clave de API ni de una llamada de red. Su versión cuantizada en 4 bits (GGUF Q4_K_M) ocupa 398 MB y genera un comando en menos de un segundo en una CPU convencional, lo que lo hace viable para incrustarse directamente en un shell o en una herramienta de línea de comandos. El repositorio completo pesa 3,3 GB e incluye pesos en safetensors y en GGUF.

Es relevante ahora porque demuestra que un ajuste fino bien dirigido sobre un modelo de 0,5B puede superar de forma sustancial a su base en una tarea vertical (por ejemplo, de 7,00 a 23,00 de exact match en `nl2cmd`), manteniendo un coste de despliegue mínimo. La ficha se redacta a partir de la información pública disponible en Hugging Face y en la model card del autor; los datos no publicados se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2, según la etiqueta `qwen2` del repositorio) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el autor recomienda `-c 1024` en llama-server para uso interactivo |
| Tipos de cuantización | GGUF (se documenta Q4_K_M, 398 MB; el autor menciona también formato f16 GGUF para evaluación); safetensors en precisión original |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de la familia Qwen2, y se ajusta de forma supervisada para tres comportamientos seleccionables mediante el system prompt: `nl2cmd` (traducir una petición en inglés a un comando bash), `fixcmd` (corregir un comando fallido junto con su salida de error) y `complete` (completar un prefijo de comando parcialmente escrito). El autor no detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la evaluación se realizó sobre un split reservado con 100 ejemplos por tarea.

La innovación técnica no reside en la arquitectura sino en el enfoque de despliegue y en la disciplina de formato: el modelo está entrenado para emitir únicamente el comando, sin explicaciones ni bloques de Markdown, y se recomienda decodificación greedy (`do_sample=False` o `--temp 0`) para obtener el comando más probable. El autor señala como detalle de implementación crítico el uso de un servidor persistente (llama-server) que prellene el system prompt una sola vez, evitando repetir ese coste en cada invocación interactiva. La evaluación comparativa se hizo contra el modelo base con prompts idénticos, mismo formato f16 GGUF y mismo motor llama.cpp, aislando así el efecto del ajuste fino.

## Capacidades

- Generación de comandos bash a partir de lenguaje natural (`nl2cmd`), por ejemplo convertir "find all files larger than 100MB under /var" en `find /var -type f -size +100M`.
- Reparación de comandos fallidos (`fixcmd`): recibe el comando y el error de la shell y devuelve el comando corregido, por ejemplo `gerp -r 'TODO' .` → `grep -r 'TODO' .`.
- Autocompletado de comandos parcialmente escritos (`complete`), por ejemplo `tar -czf backup.` → `$(date +%F).tar.gz /path/to/dir`.
- Salida estrictamente en formato de comando, sin explicaciones ni vallas de Markdown, cuando se usa el system prompt adecuado.
- Ejecución en CPU sin GPU, sin clave de API y sin llamada de red, con la cuantización GGUF Q4_K_M de 398 MB.
- Compatibilidad con el ecosistema transformers (chat template de Qwen con `apply_chat_template`), llama.cpp (llama-cli y llama-server), text-generation-inference y endpoints compatibles, además de inferencia vía API en Featherless.ai.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento explícito; es un modelo de una sola vuelta orientado a producir una línea de comando.

## Casos de uso

- Asistente integrado en la shell: un hook o un alias que envíe la petición en lenguaje natural a un llama-server local persistente y devuelva el comando en el prompt, sin salir del terminal ni depender de red. El tamaño de 398 MB en Q4_K_M permite tenerlo residente en memoria en cualquier portátil.
- Autocorrección de errores en tiempo real: capturar el código de salida y el stderr de un comando fallido y pasarlos al modo `fixcmd` para sugerir la corrección; útil en entornos donde el usuario no domina la sintaxis exacta de utilidades como `find`, `tar` o `grep`.
- Autocompletado contextual en editores y terminales: usar el modo `complete` para sugerir la continuación de una línea a medio escribir, con una tasa de validez de prefijo más completado del 99,29% según la evaluación del autor.
- Generación de scripts en pipelines de CI/CD y provisión de máquinas: traducir pasos descritos en lenguaje natural a comandos bash reproducibles dentro de Dockerfiles, playbooks o scripts de arranque, con la ventaja de que el modelo puede ejecutarse en el propio runner sin GPU.
- Herramientas de formación y documentación: generar ejemplos de comandos a partir de descripciones en inglés para manuales, tutoriales o tests de documentación, revisando siempre la salida con `bash -n` y ShellCheck antes de publicarla.
- Entornos aislados y de borde: despliegue en dispositivos sin acelerador, contenedores mínimos o sistemas air-gapped donde no se permite enviar comandos ni rutas a un servicio externo, gracias a la licencia Apache 2.0 y a la inferencia totalmente local.
- Preprocesado en asistentes de operaciones: como primer paso barato que propone un comando candidato antes de escalar a un modelo mayor, reduciendo latencia y coste en flujos de soporte técnico.

## Benchmarks y rendimiento

Evaluación del autor contra el modelo base sin ajustar, sobre un split reservado, con prompts idénticos, mismo formato f16 GGUF y el mismo motor llama.cpp; 100 ejemplos por tarea.

`nl2cmd`:

| Métrica | Base | Kitty | Delta |
|---|---|---|---|
| Exact match | 7,00 | 23,00 | +16,00 (3,3×) |
| First-utility accuracy | 61,00 | 79,00 | +18,00 |
| Token F1 | 39,35 | 59,77 | +20,42 |
| `bash -n` válido | 93,00 | 94,00 | +1,00 |
| ShellCheck limpio | 77,00 | 82,00 | +5,00 |

`fixcmd`:

| Métrica | Base | Kitty | Delta |
|---|---|---|---|
| Exact match | 0,00 | 82,00 | +82,00 |
| First-utility accuracy | 1,00 | 99,00 | +98,00 |
| Token F1 | 45,20 | 96,71 | +51,51 |
| ShellCheck limpio | 63,00 | 83,00 | +20,00 |

`complete`:

| Métrica | Base | Kitty | Delta |
|---|---|---|---|
| Token F1 | 2,22 | 29,88 | +27,66 (13×) |
| Exact match | 0,00 | 7,00 | +7,00 |
| Prefijo más completado válido | no disponible | 99,29 | no disponible |

El propio autor advierte que el 82% de exact match en `fixcmd` debe leerse con escepticismo: buena parte de la brecha frente al base se debe a cumplimiento de formato (el base explica el error en prosa en lugar de emitir un comando) y el conjunto de test usa corrupciones sintéticas de tres tipos vistos en entrenamiento; en pruebas manuales con errores reales de shell la tasa se aproxima a 1 de cada 3, por lo que el 82% debe tratarse como cota superior. También señala que el exact match es una métrica pobre para `complete`, ya que muchas continuaciones son válidas para un mismo prefijo. El autor menciona además una comparación informal contra otras cuatro variantes ajustadas para generación de comandos shell, todas en Q4_K_M, pero los resultados no están completos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal, ya que el modelo está pensado para CPU. En Q4_K_M ocupa 398 MB de pesos; en f16, aproximadamente 1 GB. Con GPU, cabría en cualquier tarjeta con 2 GB o más de VRAM.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) es sobrada. El autor no publica cifras de latencia ni throughput en GPU.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM en cuantización de 4 bits; también en CPU sin acelerador.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, recomendado por el autor), transformers con `AutoModelForCausalLM`, text-generation-inference y endpoints compatibles, además de API gestionada en Featherless.ai y una demo en Hugging Face Spaces.
- Latencia y throughput: el autor indica que genera un comando en "bastante menos de un segundo" en una CPU corriente con la cuantización Q4_K_M; no se publican cifras de tokens por segundo ni de latencia en GPU. El autor recomienda `-t 4` hilos y `-c 1024` de contexto, y usar un servidor persistente para prellenar el system prompt una sola vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kitty Bash LLM | 494.032.768 | no disponible | Ajuste fino de Qwen2.5-Coder-0.5B para bash (`nl2cmd`, `fixcmd`, `complete`) | Apache 2.0 | Hugging Face (safetensors y GGUF), Featherless.ai, Space de demo |
| Qwen2.5-Coder-0.5B-Instruct (base) | 0,5B | no disponible en la información proporcionada | Modelo instructivo generalista de código | Apache 2.0 | Hugging Face |
| Otras variantes ajustadas para shell/linux | no disponible | no disponible | Generación de comandos shell | no disponible | Públicas según el autor; resultados de la comparación informal no completos en la información disponible |

La comparación cuantitativa frente al base está recogida en la sección de benchmarks (por ejemplo, exact match en `nl2cmd` de 7,00 a 23,00 y en `fixcmd` de 0,00 a 82,00). Para el resto de alternativas, el autor menciona una comparación informal a Q4_K_M pero no aporta la tabla completa en la información disponible.

## Limitaciones y advertencias

- Es un especialista, no un chatbot: preguntas de cultura general o conversación abierta producen resultados sin sentido, según advierte el propio autor.
- Riesgo de alucinación en forma de comandos plausibles pero incorrectos o destructivos; toda salida debe validarse con `bash -n` y, preferiblemente, ShellCheck antes de ejecutarse.
- La métrica de `fixcmd` (82% de exact match) está inflada por cumplimiento de formato y por corrupciones sintéticas del conjunto de test; en errores reales de shell el autor estima un acierto cercano a 1 de cada 3.
- El exact match en `complete` es del 7,00%, por lo que la utilidad real está en la sugerencia de continuación, no en acertar la cadena exacta.
- Solo soporta inglés como idioma de entrada; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La longitud de contexto no está documentada; el autor sugiere 1024 tokens para uso interactivo, lo que limita el contexto de terminal que se puede pasar al modelo.
- Requiere usar el system prompt correcto para cada tarea; sin él, el formato de salida no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y verificar las obligaciones derivadas del modelo base Qwen2.5-Coder-0.5B-Instruct.
- No dispone de tool calling, agentes multi-paso ni otras capacidades que permitan encadenarlo sin lógica externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahellx/kitty-bash-llm
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/sahellx/kitty-bash-demo
- Inferencia API en Featherless.ai: https://featherless.ai/models/sahellx/kitty-bash-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
