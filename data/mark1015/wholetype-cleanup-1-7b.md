# Mark1015/wholetype-cleanup-1.7b

## Resumen

WholeType cleanup model v1 es un ajuste fino de Qwen3-1.7B orientado a una tarea muy concreta: limpiar una unica frase dictada. Elimina muletillas (um, uh, 嗯, 呃, えーと, 음), repeticiones accidentales de palabras y corrige puntuacion y mayusculas, sin reescribir, traducir ni alterar numeros, nombres, fechas o negaciones. Lo desarrolla Mark1015 como componente interno de la aplicacion macOS WholeType, no como asistente general.

El modelo parte de Qwen/Qwen3-1.7B (Apache-2.0) y se distribuye cuantizado a 4 bits en formato MLX, con 1.720.574.976 parametros y un repositorio de aproximadamente 1 GB. La modificacion consiste en un LoRA de 2.000 pasos (batch 8, learning rate 5e-5, prompt enmascarado) fusionado en los pesos 4-bit mediante `mlx_lm fuse`.

Su relevancia es acotada pero clara: ejemplifica el patron de modelo ultraespecializado empaquetado dentro de un producto, donde la salida nunca se acepta sin una comprobacion determinista posterior. En WholeType, cada salida pasa por una puerta local basada en reglas que la descarta si cambia algo distinto de lo permitido, conservando entonces la frase original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste LoRA fusionado sobre pesos 4-bit |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no declarada en la model card) |
| Tipos de cuantizacion | 4-bit (MLX); no se documentan otras variantes |
| Idiomas soportados | 32 idiomas segun el autor (lista no publicada) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3, tomado a traves de la version ya cuantizada `mlx-community/Qwen3-1.7B-4bit`. Sobre esos pesos se aplico un LoRA de 2.000 pasos con batch 8, learning rate 5e-5 y enmascaramiento del prompt, de modo que la perdida se calcula solo sobre la frase limpia de salida. Posteriormente el adaptador se fusiono en los pesos 4-bit con `mlx_lm fuse`.

El conjunto de entrenamiento son 7.846 pares sinteticos "dictado → limpio" en 32 idiomas, construidos a partir de frases limpias a las que se inyecta ruido de forma programatica (muletillas, repeticiones, puntuacion y mayusculas incorrectas) y filtrados por la puerta de reglas de WholeType. No se menciona RLHF ni DPO. La innovacion tecnica no esta en la arquitectura, sino en el diseno del sistema: instruccion de sistema estricta, plantilla de chat con el modo thinking desactivado y validacion determinista de la salida antes de aceptarla.

## Capacidades

- Limpieza de una unica frase dictada: eliminacion de muletillas y repeticiones accidentales, correccion de puntuacion y mayusculas.
- Preservacion estricta de numeros, nombres propios, fechas y negaciones, por instruccion explicita del prompt de sistema.
- Prohibicion de reescritura, traduccion o seguimiento de instrucciones contenidas en el texto dictado.
- Cobertura multilingue declarada de 32 idiomas, incluyendo marcas de duda en chino (嗯, 呃), japones (えーと) y coreano (음).
- Salida de una sola frase limpia, sin explicaciones ni formato adicional.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No dispone de vision ni audio: el reconocimiento de voz lo realiza la aplicacion anfitriona.

## Casos de uso

- Limpieza de dictado en la app WholeType: el modelo recibe la transcripcion cruda de una frase y devuelve la version sin muletillas ni repeticiones; la puerta de reglas local descarta la salida si altera algo mas.
- Postprocesado de transcripciones ASR en pipelines propios: encadenado tras Whisper u otro motor de reconocimiento para normalizar puntuacion y mayusculas frase a frase, manteniendo intactos cifras y nombres.
- Entrada de texto por voz en editores y campos de formulario: al operar sobre una sola frase y conservar numeros y fechas, encaja en la captura de datos estructurados dictados (importes, direcciones, identificadores).
- Dictado multilingue en equipos con varios idiomas: la cobertura declarada de 32 idiomas permite un unico modelo para usuarios que alternan lenguas, siempre con validacion posterior.
- Prototipado local en Apple Silicon: al estar en MLX 4-bit y ocupar aproximadamente 1 GB de repositorio, se puede ejecutar en un Mac sin GPU dedicada para experimentar con postprocesado de dictado.
- Referencia para ajustes LoRA de tarea unica: sirve como ejemplo reproducible de adaptacion de un modelo pequeno a una transformacion textual restringida con filtrado de datos por reglas.
- Filtro de calidad en la generacion de pares sinteticos: el mismo esquema (ruido programatico mas puerta de validacion) es reutilizable para construir datasets de normalizacion de texto en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para los pesos 4-bit; el repositorio completo ocupa 1,0 GB. El consumo real de memoria anadira la cache de inferencia, no cuantificada en la model card.
- GPU recomendadas: el modelo esta empaquetado para MLX, por lo que el entorno objetivo son los chips de Apple (series M1, M2, M3, M4). No se documenta soporte para CUDA.
- GPU de consumo: cabe en cualquier Mac con Apple Silicon; no hay datos de ejecucion en GPUs NVIDIA consumer con este formato.
- Opciones de despliegue: `mlx_lm` como via principal; al estar los pesos en formato MLX, no se indica compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| WholeType cleanup 1.7B | 1.720.574.976 | no disponible | Limpieza de dictado | Apache-2.0 | MLX 4-bit |
| Qwen/Qwen3-1.7B (base) | 1.7B (aprox.) | no disponible en esta ficha | Asistente general | Apache-2.0 | safetensors |
| mlx-community/Qwen3-1.7B-4bit | 1.7B (aprox.) | no disponible en esta ficha | Asistente general cuantizado | Apache-2.0 | MLX 4-bit |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente general: solo debe usarse para limpiar una frase dictada con el prompt de sistema indicado.
- Puede ocasionalmente eliminar o inventar palabras, especialmente en sistemas de escritura de bajos recursos; por eso WholeType nunca acepta su salida sin la puerta de reglas.
- La lista concreta de los 32 idiomas no esta publicada, por lo que la cobertura real por lengua no es verificable.
- No se documenta la longitud de contexto efectiva ni el comportamiento con entradas largas o multiples frases.
- Riesgo de alucinacion inherente a un modelo de 1,7B: puede introducir cambios no solicitados en numeros o nombres si se usa fuera del esquema previsto.
- Requiere plantilla de chat con el modo thinking desactivado; un uso incorrecto del template degrada la salida.
- Dependencia de MLX: la distribucion esta atada al ecosistema Apple, lo que limita el despliegue en infraestructura x86 o CUDA.
- Licencia Apache-2.0 permisiva para uso comercial, con la obligacion habitual de conservar avisos de licencia y atribucion al modelo base Qwen3-1.7B.
- Modelo sin descargas ni likes en el momento de la consulta y con fecha de creacion posterior a la actual: trazabilidad y mantenimiento no verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mark1015/wholetype-cleanup-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Version cuantizada de partida: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
