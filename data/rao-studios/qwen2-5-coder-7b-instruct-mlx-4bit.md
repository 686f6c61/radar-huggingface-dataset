# rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit

## Resumen

`rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit` es un espejo (mirror) del repositorio `mlx-community/Qwen2.5-Coder-7B-Instruct-4bit`, que a su vez es la conversion a formato MLX y cuantizacion de 4 bits del modelo Qwen2.5-Coder-7B-Instruct desarrollado por el equipo Qwen de Alibaba. No se trata de un modelo nuevo ni de un fine-tuning: los pesos, tokenizer, plantilla de chat y configuracion son identicos byte a byte al repositorio original, fijados en el commit `019cc73c45c770444708a6dd8690c66243cc5c80`. Rao Studios publica esta copia para que las instalaciones de su aplicacion Craft descarguen siempre los mismos bytes desde un repositorio que controla.

El modelo subyacente es un transformer denso de arquitectura `qwen2` con 28 capas y 7.615.616.512 parametros totales, especializado en generacion y comprension de codigo. Su ventana de contexto es de 32.768 tokens y soporta tool calling mediante el formato Hermes JSON: la plantilla de chat incluye el esquema JSON de cada herramienta dentro de etiquetas `<tools>` y el modelo responde con un objeto JSON por llamada dentro de `<tool_call>`.

La relevancia de esta ficha reside en que ofrece una via practica para ejecutar un modelo de codigo de 7B en hardware Apple Silicon mediante MLX con un peso de 4,3 GB en safetensors, lo que permite integrarlo en flujos de desarrollo locales (edicion de ficheros, generacion de parches, asistentes de IDE) sin depender de GPUs dedicadas. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen2` (transformer denso, 28 capas) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4 bits, group size 64 (unica variante en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (735 tensores, 4,3 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 28 capas y 7,6 mil millones de parametros, en su variante Instruct especializada en codigo. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO en la fase de alineamiento; esos datos corresponden al modelo original Qwen2.5-Coder-7B-Instruct y no se reproducen en esta ficha. Lo que si se conoce es la configuracion de la conversion MLX: cuantizacion de 4 bits con group size 64, que reduce el peso a 4,3 GB manteniendo la estructura de 28 capas.

La innovacion tecnica destacable de este repositorio no esta en el modelo sino en el proceso de empaquetado: el script `mirror-model.py` de Craft realizo una pasada de seguridad antes de la subida que verifico que todos los ficheros son necesarios para un modelo MLX, que no habia formato pickle ni codigo nativo en el origen, que cada fichero safetensors tiene dtypes conocidos y tensores que cubren el fichero exactamente, que los nombres de tensor coinciden con el indice y que cada fichero coincide con el SHA-256 registrado por el Hub en el commit de origen. Tambien se comprobo la ausencia de `auto_map` (codigo remoto) en la configuracion y en el tokenizer config, y la presencia de una plantilla de chat.

## Capacidades

- Generacion de codigo en multiples lenguajes, con especial enfasis en tareas de edicion y parcheo de ficheros existentes.
- Razonamiento sobre codigo: comprension de fragmentos, explicacion de logica y deteccion de errores.
- Tool calling mediante formato Hermes JSON: el modelo emite llamadas con nombre de herramienta y argumentos en un objeto JSON dentro de `<tool_call>`.
- Soporte de agentes: la plantilla de chat incluye los esquemas de herramientas en `<tools>`, lo que permite flujos multi-paso con invocacion encadenada.
- Conversacion multi-turno con contexto de hasta 32.768 tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Edicion de ficheros en un IDE o editor de codigo: el modelo puede recibir el contenido de un fichero y devolver una llamada `edit_file` con `path`, `old_string` y `new_string`, tal como muestra la model card, lo que encaja en asistentes que aplican parches quirurgicos sin reescribir el fichero completo.
- Asistente de desarrollo local en Mac: con 4,3 GB de pesos en formato MLX, se puede ejecutar en Apple Silicon mediante `mlx-lm` y servir como copiloto de codigo sin conexion a la nube.
- Automatizacion de refactorizaciones: dado su contexto de 32.768 tokens, puede procesar modulos completos y proponer cambios coherentes en varias funciones o clases.
- Generacion de tests unitarios: a partir de una firma de funcion o de un modulo, el modelo puede producir casos de prueba y llamar a herramientas de ejecucion para validarlos en un pipeline de CI/CD.
- Integracion en pipelines de CI/CD con tool calling: el formato Hermes JSON permite que el modelo invoque herramientas de build, lint o test y actue sobre los resultados en varios pasos.
- Documentacion tecnica automatizada: puede generar docstrings, comentarios y documentacion de API a partir del codigo fuente, con la ventaja de que el contexto largo permite cubrir ficheros enteros.
- Ensenanza y revision de codigo: como asistente conversacional multi-turno, puede explicar fragmentos, senalar malas practicas y proponer alternativas en un dialogo con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 4,3 GB en cuantizacion de 4 bits; el consumo total de memoria depende del contexto y del backend, pero en MLX se situa en el entorno de los 5-6 GB para contextos moderados.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (serie M1, M2, M3, M4); en GPUs NVIDIA no es el formato nativo y requeriria otra conversion.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (8 GB o mas, recomendable 16 GB para contextos largos). En GPUs NVIDIA de consumo requeriria una conversion a otro formato (por ejemplo GGUF o GPTQ) que no se incluye en este repositorio.
- Opciones de despliegue: `mlx-lm` es el backend documentado (`pip install mlx-lm` y `mlx_lm.generate`). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este repositorio concreto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit | 7,6 B | 32.768 | safetensors MLX 4 bits | Apache 2.0 | Hugging Face, 150 descargas |
| mlx-community/Qwen2.5-Coder-7B-Instruct-4bit | 7,6 B | 32.768 | safetensors MLX 4 bits | Apache 2.0 | Hugging Face (origen de este mirror) |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 | safetensors (BF16) | Apache 2.0 | Hugging Face (modelo original) |

Las tres entradas corresponden al mismo modelo subyacente en distintos empaquetados; no se dispone de datos de benchmarks ni de comparativas con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio es un espejo sin modificaciones: cualquier limitacion del modelo original Qwen2.5-Coder-7B-Instruct aplica integramente, incluidos sesgos de entrenamiento y riesgo de alucinacion en codigo o en llamadas a herramientas.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es directamente utilizable en GPUs NVIDIA ni en servidores x86 convencionales sin conversion adicional.
- La cuantizacion de 4 bits con group size 64 puede degradar ligeramente la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento complejo o generacion de codigo muy especializado.
- No se documentan los idiomas soportados; no se debe asumir cobertura multilingue sin verificacion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y atribucion correspondiente al modelo original Qwen.
- El repositorio esta mantenido por un tercero (Rao Studios) y fijado a un commit concreto; no se garantiza que reciba actualizaciones del modelo original.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible validar el rendimiento real en tareas concretas sin evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit
- Repositorio de origen (MLX 4 bits): https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-4bit
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
