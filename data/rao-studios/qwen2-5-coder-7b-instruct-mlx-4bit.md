# rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit

## Resumen

`rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit` es un espejo (mirror) byte a byte del repositorio `mlx-community/Qwen2.5-Coder-7B-Instruct-4bit`, publicado por Rao Studios para que la aplicacion de escritorio Craft descargue siempre los mismos pesos desde un repositorio bajo su control, fijado a un commit concreto (`019cc73c45c770444708a6dd8690c66243cc5c80`). No se ha recuantizado ni editado ningun peso: los ficheros safetensors, el tokenizer, la plantilla de chat y la configuracion son identicos a los del repositorio original. Lo unico anadido es la model card y una copia literal de la licencia Apache 2.0 del modelo original de Qwen.

El modelo subyacente es Qwen2.5-Coder-7B-Instruct, desarrollado por el equipo Qwen de Alibaba, convertido al formato MLX de Apple en cuantizacion de 4 bits (group size 64) por la comunidad `mlx-community`. Se trata de un transformer denso de arquitectura `qwen2` con 28 capas y 7.615.616.512 parametros totales, especializado en generacion y edicion de codigo, con una ventana de contexto de 32.768 tokens y soporte de tool calling mediante el formato Hermes JSON. Su relevancia practica radica en que permite ejecutar un modelo de codigo de 7B en un Mac con 16 GB de memoria unificada, con inferencia local y sin enviar ni el modelo ni el indice del proyecto a la nube.

El repositorio ocupa 4,3 GB y contiene 735 tensores en un unico fichero `model.safetensors` de 4.284.346.255 bytes. La model card documenta una auditoria de seguridad realizada con el script `scripts/mirror-model.py` de Craft el 2026-10-26, en la que se verifico que todos los ficheros son necesarios para un modelo MLX, que no hay formato pickle ni codigo nativo, que cada fichero de pesos es safetensors con cabecera leida manualmente, que los nombres de tensor coinciden con el indice y que cada fichero coincide con el SHA-256 registrado por el Hub en el commit de origen. Tambien se comprobo la ausencia de `auto_map` (codigo remoto) en la configuracion y en la del tokenizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen2`, transformer denso, 28 capas |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4 bits, group size 64 (formato MLX) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 735 tensores, 4,3 GB |
| Libreria | `mlx` (mlx-lm) |
| Modelo base | `mlx-community/Qwen2.5-Coder-7B-Instruct-4bit` |
| Modelo original | `Qwen/Qwen2.5-Coder-7B-Instruct` |
| Commit de origen | `019cc73c45c770444708a6dd8690c66243cc5c80` |
| Tool calling | Hermes JSON (esquemas en `<tools>`, llamadas en `<tool_call>`) |
| Descargas | 402 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es `qwen2`, un transformer decoder-only denso de 28 capas con 7.615.616.512 parametros. El repositorio distribuido aplica cuantizacion de 4 bits con group size 64 en formato MLX, lo que reduce el peso a 4,3 GB en safetensors distribuidos en 735 tensores. No se trata de un modelo MoE ni hibrido: todos los parametros participan en cada token generado. La ventana de contexto es de 32.768 tokens, segun la configuracion incluida en el repositorio.

La informacion disponible no detalla el corpus de entrenamiento del modelo original (numero de tokens, composicion del dataset ni si hubo RLHF o DPO). Lo que si se documenta es el proceso de espejado: los pesos, tokenizer, plantilla de chat y configuracion son identicos byte a byte al repositorio `mlx-community/Qwen2.5-Coder-7B-Instruct-4bit`, sin recuantizacion ni edicion. La unica innovacion tecnica destacable que documenta la model card es el soporte de tool calling en formato Hermes JSON: la plantilla de chat incluye el esquema JSON de cada herramienta dentro de etiquetas `<tools>` y el modelo responde con un unico objeto JSON por llamada dentro de etiquetas `<tool_call>`, lo que facilita el parseo determinista en pipelines de agentes.

## Capacidades

- Generacion y edicion de codigo en multiples lenguajes, con ejemplos explicitos en Swift en la model card.
- Razonamiento de varios pasos orientado a tareas de ingenieria de software.
- Tool calling / function calling mediante el formato Hermes JSON, con esquemas declarados en `<tools>` y respuestas en `<tool_call>`.
- Soporte de agentes: la model card describe un flujo en el que el modelo planifica y despues invoca en orden quince agentes del store de Craft (proyecto, aspecto visual, marca, cliente tipado, mundo mock, kit de cada pantalla, navegacion, tests y capturas).
- Edicion de ficheros mediante herramientas como `edit_file`, con argumentos `path`, `old_string` y `new_string`.
- Generacion de aplicaciones completas: la model card afirma que Craft construye una app de iPhone desde una carpeta vacia en un solo turno, incluyendo build, tests y capturas.
- Capacidades multilingues: no disponible (la model card no declara lista de idiomas).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente de codigo local en macOS: el modelo se ejecuta con mlx-lm sobre memoria unificada de un Mac con 16 GB, de modo que el codigo y el indice del proyecto no salen de la maquina. Es adecuado para equipos con requisitos de confidencialidad que no pueden enviar repositorios a APIs externas.
- Edicion de ficheros guiada por herramientas: gracias al formato Hermes JSON, el modelo puede emitir llamadas `edit_file` con `path`, `old_string` y `new_string`, lo que permite integrarlo en un bucle de agente que aplica parches sobre el arbol de fuentes sin intervencion manual.
- Generacion de esqueletos de aplicaciones: la model card documenta el uso en Craft para construir una app de iPhone desde cero en un turno, planificando y encadenando agentes especializados (proyecto, UI, cliente tipado, mocks, navegacion, tests y capturas). Aunque las mediciones citadas se hicieron con Qwopus 3.5 122B en un M4 Max de 128 GB, el flujo de agentes es el mismo que Craft ofrece con este modelo de 7B en 16 GB.
- Respuestas rapidas y ediciones pequenas en el editor: la propia model card lo recomienda para "quick answers and small edits, best with narrow asks", es decir, tareas acotadas donde la latencia importa mas que la profundidad de razonamiento.
- Automatizacion de tests y correccion de errores: con 32.768 tokens de contexto puede recibir varios ficheros de test y el codigo bajo prueba en una sola pasada, razonar sobre los fallos y proponer parches concretos.
- Integracion en pipelines de CI/CD locales: al ejecutarse con `mlx_lm.generate` o mediante la libreria `mlx-lm`, puede invocarse desde scripts de pre-commit o de revision de parches en una maquina de desarrollo Apple Silicon sin depender de red.
- Prototipado de agentes de codigo: el formato de tool calling documentado permite construir y depurar rapidamente agentes que llaman a herramientas de sistema de ficheros, ejecucion de tests o generacion de capturas, con un modelo pequeno que cabe en un portatil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes para este repositorio ni para el modelo base. Las unicas cifras de rendimiento citadas corresponden a una ejecucion de Craft con Qwopus 3.5 122B en un M4 Max con 128 GB (2026-11-16), no a este modelo, y por tanto no son extrapolables.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 4,3 GB solo para los pesos en 4 bits; con overhead de runtime MLX y cache KV para 32.768 tokens conviene reservar del orden de 6 a 8 GB de memoria unificada.
- El modelo esta pensado para Mac con 16 GB de memoria unificada, segun la recomendacion explicita de Craft en la model card.
- GPU recomendadas: Apple Silicon (M-series) con al menos 16 GB de memoria unificada. La model card no documenta soporte para CUDA ni para GPUs NVIDIA (A100, H100, RTX 4090); el formato es MLX, no GGUF ni safetensors estandar de PyTorch.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de 16 GB o mas. No se documenta su uso en GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-lm` (libreria `mlx`), con el comando `mlx_lm.generate --model rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit --prompt "..."`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos estan en formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit` (este) | 7,62 B | 32.768 | 4 bits, group size 64 | Apache 2.0 | safetensors MLX | Espejo byte a byte de `mlx-community`, auditado con SHA-256 |
| `mlx-community/Qwen2.5-Coder-7B-Instruct-4bit` | 7,62 B | 32.768 | 4 bits, group size 64 | Apache 2.0 | safetensors MLX | Repositorio de origen; mismos pesos |
| `Qwen/Qwen2.5-Coder-7B-Instruct` | 7,62 B | 32.768 | sin cuantizar (BF16) | Apache 2.0 | safetensors | Modelo original del equipo Qwen; requiere mas memoria y no es MLX nativo |

No se dispone de datos de benchmarks para establecer una comparacion de rendimiento con alternativas de la misma categoria. La comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier limitacion del modelo original Qwen2.5-Coder-7B-Instruct se hereda sin cambios. No se ha realizado ningun ajuste fino adicional.
- La model card recomienda el modelo para "quick answers and small edits, best with narrow asks"; no esta pensado para tareas amplias de razonamiento ni para proyectos grandes en un solo turno.
- Las mediciones de calidad citadas en la model card (app de iPhone construida, 62 pantallas coincidentes, tests superados) se obtuvieron con Qwopus 3.5 122B en un M4 Max de 128 GB, no con este modelo de 7B. No deben atribuirse a este repositorio.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de alucinacion en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Limitaciones de idioma: la model card no declara lista de idiomas soportados; el modelo original esta orientado a codigo y su cobertura linguistica no se detalla aqui.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. La licencia incluida es copia literal de la del modelo original de Qwen.
- Dependencia de la libreria `mlx`: los pesos no son directamente utilizables en stacks PyTorch/CUDA sin conversion. Para desplegar en NVIDIA habria que recurrir al modelo original o a una conversion GGUF.
- Dependencia del repositorio de Rao Studios: el modelo existe para fijar un commit concreto en el onboarding de Craft; si ese repositorio se elimina o se mueve, el flujo de instalacion que lo referencia deja de funcionar.
- Superficie de confianza: aunque la model card documenta una auditoria de SHA-256 y ausencia de `auto_map` y pickle, la verificacion la realizo el propio publicador; un consumidor que necesite garantias independientes deberia recalcular los hashes contra el commit de origen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rao-studios/Qwen2.5-Coder-7B-Instruct-mlx-4bit
- Modelo base MLX: https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-4bit
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Craft (aplicacion de codigo local para Mac): https://craft.rao.nyc
- Libreria mlx-lm: no disponible en la informacion proporcionada
- Paper o blog tecnico de Qwen2.5-Coder: no disponible en la informacion proporcionada
