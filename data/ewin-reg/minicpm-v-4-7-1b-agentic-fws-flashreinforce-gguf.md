# ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE-GGUF

## Resumen

MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE-GGUF es una cuantizacion en formato GGUF, publicada por el usuario ewin-reg, del modelo ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE. Se trata de un modelo vision-lenguaje de aproximadamente 1.000 millones de parametros (1.006.209.856 segun safetensors) afinado a partir de openbmb/MiniCPM-V-4.7-1B para una tarea muy concreta: recibir una conversacion y una lista de herramientas, y emitir una unica llamada de herramienta exacta (nombre de funcion y argumentos), precedida de un breve bloque de razonamiento.

El entrenamiento combino LoRA SFT sobre los turnos de tool calling del dataset nvidia/Nemotron-SFT-Agentic-v4 y 40 actualizaciones de refuerzo con el metodo FlashREINFORCE. En el conjunto de validacion de 1.000 filas, el modelo safetensors alcanza una coincidencia exacta de 0,414 frente a 0,334 de Claude Haiku 5.5 ejecutado como subagente, aunque esta metrica mide acuerdo con respuestas gold del propio dataset de entrenamiento, no uso general de herramientas.

La relevancia de este repo esta en el despliegue: los ficheros GGUF cargan directamente en llama.cpp, sin Python ni PyTorch, lo que permite ejecutar un agente de tool calling multimodal en CPU o en GPUs modestas. Incluye variantes f16 y Q8_0 del modelo de texto y del proyector de vision (mmproj).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: torre de vision SigLIP2 + LM hibrido Qwen3.5 de 24 capas (18 linear-attention y 6 full-attention) |
| Parametros totales | 1.006.209.856 (safetensors); el modelo base MiniCPM-V-4.7-1B tiene unos 1,55B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos usan `-c 4096`) |
| Tipos de cuantizacion | f16 y Q8_0 (texto y mmproj) |
| Idiomas soportados | Ingles (entrenado y evaluado solo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors) |

## Arquitectura y entrenamiento

El modelo base es openbmb/MiniCPM-V-4.7-1B, que combina una torre de vision SigLIP2 con un modelo de lenguaje hibrido Qwen3.5 de 24 capas, del cual 18 capas usan atencion lineal y 6 atencion completa. Esta mezcla reduce el coste computacional de la atencion en secuencias largas manteniendo capas de atencion completa para el razonamiento fino. El pipeline es image-text-to-text, aunque todo el entrenamiento y evaluacion de este afinado fue exclusivamente texto.

El proceso de entrenamiento tuvo dos fases: primero, un LoRA SFT sobre los turnos de tool calling del dataset nvidia/Nemotron-SFT-Agentic-v4 (version v6); despues, 40 actualizaciones de refuerzo con FlashREINFORCE, cada una usando 64 prompts nuevos. El formato de salida es un bloque `<think>` con razonamiento breve, seguido de una llamada de herramienta con la sintaxis `<tool_call><function=nombre>...</function></tool_call>`. La version actual (v9) es estadisticamente equivalente a la v6 anterior, no una mejora demostrada.

## Capacidades

- Generacion de una unica llamada de herramienta exacta (nombre de funcion y argumentos) a partir de una conversacion y una lista de herramientas.
- Razonamiento breve previo a la llamada mediante un bloque `<think>`, en formato de chat Qwen.
- Comprension de imagenes heredada del modelo base (torre SigLIP2), ejecutable en llama.cpp mediante el fichero mmproj; sin embargo, la comprension de imagenes no fue evaluada en este afinado.
- Salida determinista recomendada: los ejemplos usan decodificacion greedy (`--temp 0`).
- No entrenado para responder en texto plano: solo vio turnos de asistente que realizan llamadas a herramientas.
- No hay informacion sobre soporte de agentes multi-paso mas alla de la emision de una llamada por turno.

## Casos de uso

- Orquestacion de herramientas en local: integrar el modelo en un bucle agente ligero sobre llama.cpp, donde cada turno produce la siguiente llamada de funcion sin depender de APIs externas.
- Automatizacion de flujos con funciones definidas: dado un catalogo de herramientas (consultas a bases de datos, APIs internas), el modelo selecciona la funcion y genera argumentos en un formato parseable.
- Despliegue en CPU o edge: al ser 1B parametros con cuantizacion Q8_0 de unos 1 GB, cabe en portatiles o mini-PC para tareas de enrutado de herramientas offline.
- Prototipado rapido de agentes: el formato de salida estricto facilita escribir parsers simples y probar prompts de sistema con distintos catalogos de herramientas.
- Compresion de costes frente a APIs comerciales: el autor reporta 0,414 frente a 0,334 de Claude Haiku 5.5 como subagente en la metrica de coincidencia exacta del dataset, lo que permite sustituir llamadas de pago en tareas de ese estilo.
- Procesamiento multimodal basico en dispositivos limitados: usando el mmproj, se puede describir una imagen y, en teoria, combinar vision con decisiones de herramientas, aunque esta combinacion no fue evaluada.

## Benchmarks y rendimiento

Resultados publicados por el autor para el modelo safetensors (no para estos GGUF), sobre 1.000 filas de validacion con decodificacion greedy y primera llamada de herramienta:

| Metrica | FlashREINFORCE (main, v9) | v6 | Ronda 1 |
|---|---|---|---|
| Coincidencia exacta de la llamada | 0,414 | 0,409 | 0,314 |
| Argumentos correctos | 0,440 | 0,440 | 0,337 |
| Nombre de funcion correcto | 0,831 | 0,832 | 0,754 |
| Emite llamada | 1,000 | 0,999 | 0,997 |

Comparativa reportada frente a un subagente: exact 0,414 frente a 0,334 de Claude Haiku 5.5 (diferencia emparejada +0,080, SE 0,0141). El autor advierte que esta metrica mide acuerdo con respuestas gold del dataset de entrenamiento (estilo Nemotron), no una clasificacion general de uso de herramientas. Ademas, unos 60% de las llamadas gold contienen valores (por ejemplo, claves de API) que no aparecen en el prompt, por lo que ningun modelo puede alcanzar 100%.

Comprobacion de sanidad de los GGUF (solo 8 primeras filas de validacion, CPU, greedy): f16 5/8, Q8_0 3/8. La muestra es demasiado pequena para establecer diferencias. No se publicaron benchmarks de perplejidad, velocidad ni comprension de imagenes para estos ficheros.

## Requisitos de hardware

- VRAM/RAM para inferencia: el fichero Q8_0 de texto ocupa 1.031,4 MiB y el f16 1.930,6 MiB; con el mmproj Q8_0 (694,2 MiB) o f16 (1.057,4 MiB) hay que sumar esa cantidad para tareas con imagen. En total, el modo multimodal Q8_0 requiere en torno a 1,7 GB y el f16 unos 3 GB, mas el contexto.
- GPU recomendadas: no disponible. Dado el tamano (1B parametros), cualquier GPU consumer moderna con 4 GB de VRAM o mas es suficiente con offload completo (`-ngl 99`); el autor verifico funcionamiento en CPU.
- Consumer GPUs: cabe sobradamente en GPUs como RTX 3060, RTX 4060 o superiores; tambien funciona solo con CPU y RAM segun la comprobacion del autor.
- Despliegue: llama.cpp (build con soporte `MiniCPMV4_7`; los ficheros se crearon con el commit `2280f0f`) mediante `llama-completion` para texto y `llama-mtmd-cli` para imagenes. No hay soporte documentado de vLLM, Ollama, TGI ni otros runtimes.
- Latencia y throughput: no disponible; no se publicaron medidas de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE-GGUF | ~1,0B (base ~1,55B) | No disponible (ejemplos con 4096) | Llamada exacta de herramienta, multimodal | Apache 2.0 | GGUF en Hugging Face, llama.cpp |
| openbmb/MiniCPM-V-4.7-1B (base) | ~1,55B | No disponible | Vision-lenguaje general | Apache 2.0 | safetensors en Hugging Face |
| Claude Haiku 5.5 (referencia del autor) | No disponible | No disponible | Uso general de herramientas como subagente | Propietaria (API) | Solo via API de Anthropic |

La comparativa con Claude Haiku 5.5 se limita a la metrica de coincidencia exacta sobre el dataset de validacion del autor (0,414 frente a 0,334) y no constituye una evaluacion general de capacidades. No hay datos comparativos con otros modelos agenticos de 1B parametros.

## Limitaciones y advertencias

- La metrica de coincidencia exacta exige que el texto completo de la llamada coincida con la respuesta gold; alrededor del 60% de las llamadas gold con valores comprobables contienen valores ausentes en el prompt (por ejemplo, claves de API), por lo que el techo teorico esta por debajo del 100%.
- El entrenamiento uso solo turnos de asistente que emiten llamadas de herramientas: el modelo no fue entrenado para responder en texto plano y puede comportarse de forma inesperada en conversaciones normales.
- La comprension de imagenes no fue evaluada en este afinado; las capacidades multimodales son las heredadas del modelo base sin verificacion.
- El efecto de la cuantizacion Q8_0 apenas se midio (8 filas de validacion); la posible perdida frente a f16 no fue investigada. Los resultados de 0,414 corresponden al modelo safetensors fp16, no a estos GGUF.
- Los GGUF requieren una version de llama.cpp con soporte `MiniCPMV4_7`; con builds anteriores no cargaran.
- Idioma: entrenado y evaluado solo en ingles; no hay garantias en castellano ni en otros idiomas.
- La puntuacion mide acuerdo con el dataset de entrenamiento (Nemotron-SFT-Agentic-v4), por lo que existe riesgo de sobreajuste al estilo de ese dataset y de no generalizar a otros catalogos de herramientas.
- Al parsear la salida hay que eliminar el token `[end of text]` que imprime llama.cpp antes de interpretar la llamada.
- Licencia Apache 2.0, igual que el modelo base: sin restricciones de uso comercial mas alla de las de la licencia.
- No se publicaron evaluaciones de sesgos ni de seguridad; al tratarse de un modelo agentico que emite llamadas a funciones, se recomienda validar y sanear los argumentos generados antes de ejecutarlos en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE-GGUF
- Modelo safetensors FlashREINFORCE: https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS-FlashREINFORCE
- Modelo principal (main, v9): https://huggingface.co/ewin-reg/MiniCPM-V-4.7-1B-Agentic-FwS
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v4
- Dataset de validacion del autor: https://huggingface.co/datasets/ewin-reg/nemotron-sft-agentic-v4-fws-minicpmv47
- Revision v6 referenciada: `f7c6ea0`
- Commit de llama.cpp usado para la conversion: `2280f0f`
