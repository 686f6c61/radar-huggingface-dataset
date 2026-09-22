# DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-4-6

## Resumen

DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-4-6 es una conversion de formato, no un entrenamiento nuevo: toma el checkpoint XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (revision `f2773fb482ac3dd047a4af4003b86e56b7225d0d`) y lo reempaqueta en safetensors para MLX con una receta de cuantizacion mixta 4/6 bits. El resultado pesa 9.409.813.744 parametros y ocupa 6,7 GB en el repositorio, con 22 modulos a 6 bits y 228 modulos a 4 bits (5,666 bits por peso segun el conversor mlx-vlm 0.7.2).

El modelo base es un ajuste fino supervisado de Qwen/Qwen3.5-9B sobre datos de agente generados por MiMo (codigo, tareas de agente generales, codigo visual y ciberseguridad). La arquitectura es multimodal de tipo `Qwen3_5ForConditionalGeneration`, con torre de vision propia y una ventana de contexto declarada en configuracion de 262.144 tokens, lo que lo situa en la categoria de modelos densos de ~9B con entrada de imagen y texto.

Su relevancia es practica: permite ejecutar un modelo de 9B con vision en hardware Apple Silicon (MLX) y en GPU CUDA mediante los wheels de MLX, reduciendo el peso a algo mas de 5,6 bits por peso de media. Es un artefacto de despliegue, con validacion limitada a dos pruebas de humo (una de texto y otra con imagen), sin benchmarks ni mediciones de perplexity publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (`model_type: qwen3_5`); texto denso de 32 capas con atencion completa cada 4 capas, mas torre de vision Qwen3.5 |
| Parametros totales | 9.409.813.744 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens declarados en `config.json` (no verificado experimentalmente) |
| Tipos de cuantizacion | MLX mixta 4/6 bits, grupo de 64, modo affine; 22 modulos a 6 bits y 228 a 4 bits; torre de vision en BF16; 5,666 bits por peso reportados por mlx-vlm 0.7.2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card del checkpoint original no declara licencia) |
| Formato de pesos | safetensors para MLX; 1.260 tensores (los pesos cuantizados se dividen en weight, scales y biases); BF16 almacena 760 tensores |
| Tamano del repositorio | 6,7 GB |
| Libreria | mlx (mlx-vlm) |
| Pipeline | image-text-to-text |
| Revision de origen | `f2773fb482ac3dd047a4af4003b86e56b7225d0d` |
| Herramientas de conversion | mlx-vlm 0.7.2, mlx 0.32.2 (wheel CUDA 13), en spark-d500 con NVIDIA GB10 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modulo de texto es un transformer denso de 32 capas, `hidden_size` 4096, 16 cabezas de consulta y 4 cabezas KV, con atencion completa aplicada cada cuarta capa (las capas restantes usan un mecanismo distinto que el README no detalla). El modulo de vision es la torre Qwen3.5 con profundidad 27, `hidden_size` 1152 y parches de 16. La plantilla de chat es la del MiMo v2.6 original, distribuida en `chat_template.jinja`, y admite modo de razonamiento (bloques `thinking`) que se puede desactivar con `enable_thinking=False`.

No hay entrenamiento asociado a este repositorio: es una conversion de pesos. El checkpoint de origen, segun el propio README, es un ajuste fino supervisado de Qwen/Qwen3.5-9B sobre datos de agente generados por MiMo, con cuatro ambitos declarados (codigo, tareas de agente generales, codigo visual y ciberseguridad). No se documenta el volumen de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La receta de cuantizacion mixta no proviene de un analisis de sensibilidad por capa, sino de los predicados integrados de mlx-vlm; los 22 modulos que se mantienen a 6 bits son `embed_tokens`, `lm_head`, el `down_proj` de las capas 0-3, 6, 9, 12, 15, 18, 21, 24, 27-31 y el `v_proj` de las capas de atencion completa 3, 15, 27 y 31. El predicado excluye los modulos multimodales, de ahi que la torre de vision conserve BF16. Los cuatro shards de origen se verificaron contra los hashes SHA-256 del Hub antes de convertir.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con plantilla de chat especifica de MiMo v2.6.
- Razonamiento visible opcional: la plantilla puede emitir bloques `thinking` antes de la respuesta final (se observo en las variantes mixed-3-6 y mixed-3-8; en mixed-4-6, con `enable_thinking=False`, la respuesta fue directa).
- Aritmetica basica y calculo sencillo, verificado en la prueba de humo con el prompt "What is 15% of 240?".
- Comprension de imagenes: pipeline declarado como image-text-to-text, con torre de vision Qwen3.5 y tokens `vision_start` / `image_pad` / `vision_end`; la prueba de humo con una imagen solida de 64x64 devolvio la clase correcta.
- Tareas de agente y codigo: segun el README, el ajuste fino de origen se hizo sobre datos de agente generados por MiMo, incluyendo codigo, tareas de agente generales, codigo visual y ciberseguridad.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente multimodal local en Apple Silicon: con MLX y memoria unificada, el modelo permite conversaciones con entrada de imagen sin salir del portatil; el README confirma una ejecucion correcta en un M3 Max con mlx-vlm 0.6.17.
- Analisis de capturas y diagramas tecnicos: la tarea de codigo visual declarada en el ajuste fino encaja con la lectura de mockups de interfaz o diagramas de arquitectura para generar esqueletos de codigo, aprovechando la torre de vision en BF16.
- Documentos largos con contexto de 262.144 tokens: indexacion y resumen de repositorios o expedientes extensos en una sola pasada, siempre que se valide experimentalmente el comportamiento en contextos muy largos, ya que no se ha medido.
- Agentes de codigo en local: el modelo base se entreno sobre datos de agente, por lo que es candidato para bucles de edicion de ficheros y ejecucion de comandos en un runner de desarrollo, con la advertencia de que el soporte de tool calling no esta documentado.
- Inferencia sobre GPU CUDA de gama de entrada profesional: el artefacto funciona con los wheels CUDA de MLX, lo que permite desplegarlo en equipos como el NVIDIA GB10 usado en la conversion sin depender de CUDA clasico ni de vLLM.
- Calculo y respuesta corta determinista: con `temperature=0.0` y `enable_thinking=False` produce respuestas concisas, util para clasificacion o extraccion de un unico valor.
- Evaluacion comparativa de recetas de cuantizacion: al existir builds mixed-3-5, 3-6, 3-8, 4-6 y 4-8 del mismo modelo, sirve para estudiar el compromiso entre bits por peso y fidelidad de salida en MLX.
- Analisis de seguridad y ciberseguridad asistido: una de las areas declaradas del ajuste fino; aplicable a triaje de alertas o explicacion de hallazgos, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecutaron perplexity ni benchmarks sobre el modelo convertido. La unica evidencia empirica son pruebas de humo genericas con `temperature=0.0` y `max_tokens=64`:

| Build | Tipo de entrada | Resultado | Salida |
|---|---|---|---|
| bf16 | texto | correcto | `36` |
| mixed-3-5 | texto | correcto | `<value>36</value>` |
| mixed-3-6 | texto | correcto | bloque de pensamiento y despues `36` |
| mixed-3-8 | texto | correcto | bloque de pensamiento y despues `36` |
| mixed-4-6 | texto | correcto | `36` |
| mixed-4-6 | imagen (PNG rojo 64x64) | correcto | `Red` |
| mixed-4-8 | texto | correcto | `36` |

El README advierte de que las diferencias de formato en la salida (etiquetas `<value>`, bloques de razonamiento no solicitados) son diferencias de calidad en ese unico prompt, no fallos de carga. No se reportan tasas de decodificacion ni picos de memoria: la llamada BF16 fue en frio, las posteriores generaron entre 3 y 64 tokens y el pico de memoria quedo fijado por el maximo del proceso BF16.

## Requisitos de hardware

- VRAM estimada para los pesos: los safetensors ocupan 6,7 GB en el repositorio; conviene reservar entre 7 y 9 GB de memoria solo para pesos, mas el estado del runtime y la cache KV.
- Cache KV: no documentada. A partir de la configuracion (8 capas de atencion completa, 4 cabezas KV, `head_dim` 256), una estimacion aritmetica en BF16 da del orden de 32 KB por token, es decir, cerca de 1 GB por cada 32.000 tokens; el coste real depende del mecanismo de las capas no completas, que no se detalla.
- Contexto completo: los 262.144 tokens declarados no son viables en memoria consumer; requeririan decenas de GB solo de cache KV segun la estimacion anterior.
- GPU recomendadas: NVIDIA GB10 (plataforma usada en la conversion, con wheel CUDA 13 de MLX); cualquier GPU CUDA con al menos 12-16 GB para contexto moderado. No hay soporte MLX documentado para A100/H100 con CUDA clasico, aunque los wheels CUDA son de proposito general.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) con contexto corto. En tarjetas de 8 GB es ajustado, incluso sin contexto largo.
- Apple Silicon: verificado en un M3 Max con mlx-vlm 0.6.17 sobre Metal; es el entorno con soporte mas maduro para MLX.
- Opciones de despliegue: `mlx-vlm` (con `load` y `generate`) y el stack `mlx` 0.32.2. No se distribuyen pesos GGUF, por lo que llama.cpp, Ollama y LM Studio requeririan una conversion adicional; vLLM, TGI y TensorRT-LLM no cargan safetensors de MLX de forma nativa.
- Latencia y throughput: no disponibles (no reportados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-4-6 | 9,41 B | 262.144 (config) | MLX safetensors, mixta 4/6 bits, 5,666 bits por peso | no declarada | publica en HuggingFace, 0 descargas, 6,7 GB |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (origen) | 9,41 B | no disponible en la informacion | BF16, safetensors | no declarada en la model card fijada | publica en HuggingFace |
| Qwen/Qwen3.5-9B (base del ajuste fino) | ~9 B segun la nomenclatura | no disponible en la informacion | BF16 | no disponible en la informacion | publica en HuggingFace |
| Otros builds mixed del mismo repositorio (3-5, 3-6, 3-8, 4-8) | 9,41 B | 262.144 (config) | MLX safetensors, recetas mixtas equivalentes | no declarada | mencionados en el README, sin datos de descargas |

No se dispone de datos de rendimiento comparado entre estas variantes: el unico contraste documentado es la salida cualitativa de las pruebas de humo descritas arriba (respuesta directa `36` en BF16, 4-6 y 4-8; bloques de razonamiento o etiquetas `<value>` en 3-6, 3-8 y 3-5).

## Limitaciones y advertencias

- Licencia no declarada: el README indica explicitamente que la model card del checkpoint original no declara licencia, y que este repositorio redistribuye pesos convertidos de ese checkpoint publico. El uso comercial queda en situacion juridica indeterminada.
- Validacion minima: solo se ejecutaron dos prompts de humo (uno de texto y otro con imagen) y solo en el build 4-6 para la entrada visual. No hay perplexity, benchmarks ni pruebas de calidad sistematicas.
- Diferencias de calidad entre builds: los builds mixed-3-6 y mixed-3-8 emitieron bloques de razonamiento pese a que el prompt los cerraba, y mixed-3-5 envolvio la respuesta en etiquetas `<value>`. Es una senal de degradacion del formato de salida en recetas de menor precision.
- Contexto declarado sin verificar: los 262.144 tokens provienen de la configuracion, no de una prueba de recuperacion de informacion en contextos largos. El comportamiento a partir de decenas de miles de tokens es desconocido.
- Idiomas: no declarados. No se puede asumir calidad equivalente en castellano o en idiomas distintos del ingles de las pruebas.
- Riesgo de alucinacion: inherente a los modelos generativos, agravado aqui por la ausencia de evaluaciones de fidelidad. En tareas de ciberseguridad o analisis de codigo, cualquier salida debe verificarse.
- Restricciones de despliegue: al ser pesos MLX safetensors, no son directamente utilizables en llama.cpp, Ollama, vLLM o TGI; requieren conversion o un runtime MLX compatible.
- Torre de vision en BF16: al quedar excluida de la cuantizacion, mantiene su coste de memoria completo y no se beneficia del ahorro de la receta mixta.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Trazabilidad: la verificacion SHA-256 se hizo contra los hashes LFS del Hub; no hay comprobacion independiente del numero de 5,666 bits por peso, que es un valor reportado por el conversor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DJLougen/MiMo-V2.6-Distill-Qwen-9B-MLX-mixed-4-6
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo del que parte el ajuste fino: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de pruebas de humo del repositorio: `smoke-results.json` (incluido en el repositorio del modelo)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre el modelo (los resultados disponibles tratan sobre el panel de control de Windows y no guardan relacion con este artefacto). No hay papers, blogs ni demos adicionales en la informacion proporcionada.
