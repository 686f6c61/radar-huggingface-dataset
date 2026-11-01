# Muesli-HQ/qwen35-0.8b-muesli-cleanup-v14-mlx-8bit

## Resumen

qwen35-0.8b-muesli-cleanup-v14-mlx-8bit es un modelo afinado por Muesli-HQ a partir de Qwen/Qwen3.5-0.8B para una tarea muy concreta: la limpieza de transcripciones de dictado en la app de macOS Muesli. Recibe la salida cruda de un motor de speech-to-text, opcionalmente acompanada de contexto de la aplicacion activa (nombre de app, campo enfocado, texto OCR de pantalla), y devuelve el texto corregido: arregla errores claros de reconocimiento, elimina muletillas, aplica autocorrecciones del tipo "scratch that", convierte enumeraciones dictadas en listas y respeta el estilo de puntuacion de la app de destino. Si el texto ya es correcto, lo devuelve sin cambios.

El modelo tiene 752.393.024 parametros (0,75 B) y se distribuye en formato MLX de 8 bits con group size 64, ocupando 0,78 GB en el repositorio. La arquitectura subyacente es la de Qwen3.5, un transformer decoder-only de la familia Qwen, aunque la model card no detalla la arquitectura interna ni la longitud de contexto nativa. El pipeline declarado es text-generation y la licencia es Apache 2.0.

Su relevancia es practica: demuestra el patron de especializar un modelo pequeno en una unica tarea de postprocesado, ejecutable en local sobre Apple Silicon con latencias de 0,22 s de mediana para unas 535 tokens de prompt. No es un modelo de proposito general ni un reconocedor de voz: es un componente de un pipeline de dictado, disenado para integrarse en una app de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limite de generacion: 1.024 tokens nuevos) |
| Tipos de cuantizacion | 8 bits, group size 64 (MLX) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 8 bits) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,75 B de parametros. El afinado se realizo con LoRA de rango 16 sobre la base cuantizada a 4 bits usando Unsloth, durante 1 epoca (9.815 pasos), con una perdida de evaluacion final de 0,125. La perdida se calculo solo sobre la respuesta y los pesos LoRA se fusionaron en los pesos base. El resultado se publica cuantizado a 8 bits en formato MLX.

Los datos de entrenamiento corresponden al blend-v14: 157.037 pares de limpieza que cubren correo electronico, chat, documentos, prompts para agentes de IA, codigo, hojas de calculo y presentaciones, cajas de busqueda y dictados largos, con aproximadamente un 24 % de filas que incluyen contexto de pantalla. Respecto al blend-v12 se anaden errores de reconocimiento y habitos de habla realistas, se corrigen unas 15.000 filas de listas y formato bajo una especificacion escrita unica (las senales habladas de lista siempre generan lista; en notas y documentos solo con 3 o mas elementos; se conservan los encabezados dictados; numeracion solo cuando se cuenta explicitamente), se descartan filas que no pasaron una auditoria (subagentes de Claude y Kimi K3) y se anaden 2.759 filas de formato verificadas por Claude.

Una innovacion operativa destacable es el formato de prompt fijado de forma estricta: un unico turno de usuario, sin mensaje de sistema, decodificacion greedy (temperatura 0, top_k=1, sin penalizacion por repeticion) y parada en `<|im_end|>`. El prompt incluye un bloque `<think>` vacio y el texto del usuario se compone como SYSTEM_PROMPT + bloque de contexto opcional + transcripcion cruda. El bloque de contexto se limita a 1.200 caracteres.

## Capacidades

- Limpieza de transcripciones de dictado: correccion de errores evidentes de reconocimiento, eliminacion de muletillas ("um", "uh", "like") y aplicacion de autocorrecciones habladas ("no wait...", "scratch that").
- Preservacion del texto correcto: si la transcripcion ya es valida, la salida es identica a la entrada.
- Formateo de listas: convierte enumeraciones dictadas en listas numeradas o con vinetas segun reglas explicitas (senales habladas de lista, 3 o mas elementos en notas y documentos, numeracion solo si se cuenta).
- Uso de contexto de aplicacion: resuelve errores de nombres, siglas y formato a partir del nombre de la app, el campo enfocado, la URL, el texto seleccionado o el texto OCR de pantalla, sin copiar ese contexto a la salida.
- Adaptacion al estilo de puntuacion de la app de destino.
- Generacion de texto conversacional basica heredada del modelo base (el pipeline declarado es text-generation).
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido de forma declarada.

## Casos de uso

- Dictado en macOS integrado en la app Muesli: el modelo actua como etapa final del pipeline, recibiendo la salida cruda del reconocedor y devolviendo texto limpio antes de insertarlo en el campo activo. Su latencia mediana de 0,22 s con ~535 tokens de prompt lo hace viable en interaccion en tiempo real.
- Correo electronico dictado: con el contexto de la app de correo y el campo del cuerpo del mensaje, corrige nombres y siglas y aplica la puntuacion adecuada, manteniendo la fraseologia original del hablante.
- Notas y documentos con enumeraciones: convierte listas dictadas oralmente en listas con vinetas o numeradas segun las reglas de formato del blend-v14, util para apps de notas y procesadores de texto.
- Prompts para agentes de IA dictados por voz: el modelo esta entrenado con pares de este dominio, por lo que limpia instrucciones dictadas sin parafrasearlas, algo critico cuando el prompt se envia a un LLM.
- Mensajeria instantanea: elimina muletillas y aplica autocorrecciones en dictados cortos de chat, donde la exactitud de coincidencia (73,0 % en el conjunto de dictado simple) importa mas que la reescritura.
- Codigo y hojas de calculo: limpieza de dictados con terminos tecnicos y siglas, apoyandose en el contexto de pantalla para resolver identificadores mal reconocidos.
- Busqueda dictada: normalizacion de consultas cortas en cajas de busqueda, un dominio incluido explicitamente en el conjunto de entrenamiento.

## Benchmarks y rendimiento

La model card publica tasas de error de palabra (WER) frente a la limpieza de referencia y coincidencia exacta (%), con una peticion a la vez:

| Build | Screen-context (400) | Plain dictation (512) | New categories A (309) | New categories B (284) | Realism (310) | Formatting (180) |
|---|---|---|---|---|---|---|
| este modelo (MLX 8-bit) | 8,98 / 51,0 | 3,32 / 73,0 | 2,69 / 34,3 | 2,59 / 39,4 | 3,11 / 35,8 | 7,64 / 17,8 (2,01 sin una fila en bucle) |

Los conjuntos de prueba estan separados del entrenamiento, fueron escritos por modelos abiertos y filtrados por un modelo juez; el conjunto de formato lo escribio Kimi K3 y cada fila fue revisada por Claude. No son dictados de usuarios reales. El conjunto de dictado simple usa convenciones de lista antiguas que blend-v14 corrige, por lo que los modelos v14 puntuan peor en el de lo que exigen las reglas de formato actuales.

Rendimiento en un Apple M5 con ~535 tokens de prompt, usando MLX Swift (mlx-swift-lm 3.32.3): mediana 0,22 s, p90 0,30 s, prefill de ~2.900 tok/s y decodificacion de ~100 tok/s.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio pesa 0,8 GB en 8 bits; la inferencia requiere aproximadamente 1 GB de memoria, incluyendo overhead de runtime y KV cache para prompts de ~535 tokens.
- GPU recomendadas: Apple Silicon (el modelo esta en formato MLX; la model card cita un Apple M5 como referencia). En GPUs NVIDIA no es desplegable directamente sin conversion de formato.
- Cabe en cualquier Mac con memoria unificada de 8 GB o superior; no se han publicado pruebas en GPUs consumer NVIDIA.
- Opciones de despliegue: mlx-lm (Python) o mlx-swift-lm (Swift). Con swift-transformers <= 1.3.2 es necesario mapear `tokenizer_class` `Qwen3_5Tokenizer` a `Qwen2Tokenizer` (mismo BPE byte-level). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana 0,22 s y p90 0,30 s por peticion en M5; prefill ~2.900 tok/s y decode ~100 tok/s.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de limpieza de dictado en la documentacion proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Tarea |
|---|---|---|---|---|---|
| qwen35-0.8b-muesli-cleanup-v14-mlx-8bit | 752.393.024 | no disponible | Apache 2.0 | MLX 8-bit (safetensors) | Limpieza de dictado en ingles |
| Qwen/Qwen3.5-0.8B | 0,8 B (aprox.) | no disponible | no disponible | no disponible | Generacion de texto general |
| Alternativas especializadas en limpieza de dictado | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles: no procesa otros idiomas.
- No es un reconocedor de voz: unicamente postprocesa texto ya transcrito.
- Riesgo de bucle: la model card menciona una fila en bucle en el conjunto de formato que distorsiona el resultado (17,8 % de coincidencia exacta frente a 2,01 % sin esa fila). Se recomienda el guard descrito por el autor: si la salida esta vacia o supera 3 veces la longitud de la entrada, pegar la transcripcion cruda.
- Riesgo de parafrasis o adicion de contenido: el prompt de sistema prohibe explicitamente reescribir, anadir palabras o cambiar el significado, pero es una instruccion, no una garantia.
- El prompt debe coincidir exactamente con el de entrenamiento (un turno de usuario, sin system message, decodificacion greedy, parada en `<|im_end|>`); usar un motor de chat template puede degradar la calidad.
- El contexto de pantalla se trunca a 1.200 caracteres y nunca debe copiarse a la salida; el modelo puede fallar en esa distincion.
- Los conjuntos de evaluacion no son dictados reales de usuarios, por lo que las metricas publicadas pueden no reflejar el rendimiento en produccion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en la informacion disponible.
- Sin datos publicados sobre sesgos; al ser un modelo de limpieza con salida restringida, la superficie de sesgo es menor que en un modelo generativo general, pero persiste en la resolucion de nombres y terminos via contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Muesli-HQ/qwen35-0.8b-muesli-cleanup-v14-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados obtenidos corresponden al alimento muesli y no guardan relacion).
