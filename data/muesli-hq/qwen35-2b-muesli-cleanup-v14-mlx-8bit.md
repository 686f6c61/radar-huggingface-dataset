# Muesli-HQ/qwen35-2b-muesli-cleanup-v14-mlx-8bit

## Resumen

qwen35-2b-muesli-cleanup-v14-mlx-8bit es un modelo afinado de 1.881.825.088 parametros (aproximadamente 1,88 mil millones), derivado de Qwen/Qwen3.5-2B, desarrollado por Muesli-HQ para una tarea muy concreta: la limpieza de transcripciones de dictado por voz en la aplicacion macOS Muesli. No es un modelo de reconocimiento de voz, sino un posprocesador que recibe la salida cruda de un sistema speech-to-text (con contexto opcional de la aplicacion en pantalla) y devuelve el texto corregido, eliminando muletillas, aplicando autocorrecciones del hablante y ajustando el formato al estilo de la aplicacion de destino.

El modelo esta distribuido en formato MLX de 8 bits con group size 64, lo que ocupa aproximadamente 1,9 GB en disco, y esta pensado para inferencia en dispositivo (on-device) en hardware Apple Silicon. La licencia es Apache 2.0 y el unico idioma soportado es el ingles. Su relevancia radica en que resuelve un problema practico y acotado del pipeline de dictado: la brecha entre una transcripcion literal y un texto listo para pegar en un correo, un chat o un documento, sin reescribir el contenido del hablante.

El entrenamiento se realizo con LoRA de rango 16 sobre una base cuantizada a 4 bits, fusionando los pesos posteriormente, sobre un conjunto de 157.037 pares de limpieza denominado blend-v14. El modelo esta publicado en HuggingFace con cero descargas y cero likes en el momento de la consulta, y la fecha de creacion indicada es 2026-11-01.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-2B; detalles internos no disponibles) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (formato MLX) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (8-bit), tamano de repo 2,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 1,88 mil millones de parametros, y se afino mediante LoRA de rango 16 sobre una base cuantizada a 4 bits usando Unsloth, durante 1 epoca y 9.815 pasos, con una perdida final de evaluacion de 0,115. La perdida se calculo unicamente sobre la respuesta (answer-only), y los adaptadores se fusionaron en los pesos base antes de la conversion al formato MLX de 8 bits con group size 64. No se especifican en la informacion disponible detalles sobre atencion lineal, decodificacion especulativa ni otras innovaciones arquitectonicas del modelo base.

El conjunto de datos, blend-v14, contiene 157.037 pares de limpieza que cubren correo electronico, chat, documentos, prompts de agentes de IA, codigo, hojas de calculo y presentaciones, cajas de busqueda y dictados largos; aproximadamente el 24 % de las filas incluyen contexto de pantalla. Respecto a blend-v12, anade errores de reconocimiento realistas y habitos de habla, corrige unos 15.000 objetivos de listas y formato hacia una especificacion escrita unica (las senales habladas siempre generan lista; en caso contrario, solo listas de 3 o mas elementos en notas y documentos; se conservan los encabezados dictados; numeracion solo cuando se cuenta explicitamente), descarta filas que fallaron una auditoria realizada con subagentes de Claude y Kimi K3, y anade 2.759 filas de formato verificadas por Claude. Los datos fueron generados por modelos abiertos en Fireworks.

## Capacidades

- Limpieza de transcripciones de speech-to-text: corrige errores evidentes de reconocimiento, elimina muletillas (um, uh, like) y aplica autocorrecciones del tipo "scratch that" o "no wait".
- Preservacion del texto correcto: si la transcripcion ya es correcta, la devuelve exactamente igual, segun la instruccion del sistema.
- Formateo de listas: convierte elementos dictados o claramente enumerados en listas con vinetas o numeradas segun las reglas entrenadas.
- Adaptacion al estilo de puntuacion de la aplicacion de destino, usando el contexto de pantalla opcional (aplicacion enfocada, campo de documento, URL, texto seleccionado, texto OCR de pantalla).
- Uso de contexto de aplicacion solo para resolver errores de transcripcion, nombres, acronimos e intencion de formato; nunca copia el contexto a la salida.
- Generacion de texto conversacional (pipeline text-generation) en ingles.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito segun la informacion disponible; el prompt de entrenamiento incluye un bloque `<think>` vacio.

## Casos de uso

- Limpieza de dictado en la aplicacion macOS Muesli: el modelo recibe la transcripcion cruda del reconocedor de voz y devuelve el texto corregido listo para pegar, con una latencia mediana de 0,7 a 1,0 s en un Apple M5 con unos 535 tokens de prompt.
- Redaccion de correos por voz: el contexto de aplicacion permite resolver nombres propios y acronimos del campo de documento, y el modelo conserva la fraseologia original del hablante sin parafrasear.
- Mensajeria instantanea: elimina muletillas y aplica autocorrecciones en dictados cortos, con una tasa de error de palabra del 2,92 % en el conjunto de dictado simple (512 casos).
- Notas y documentos con listas: convierte elementos enumerados oralmente en listas con vinetas o numeradas, con una tasa de error del 1,51 % en el conjunto de formato (180 casos).
- Prompts para agentes de IA dictados: limpia la transcripcion de instrucciones destinadas a un agente, manteniendo la intencion y el contenido sin anadir texto.
- Entradas de busqueda dictadas: corrige errores obvios de reconocimiento en cajas de busqueda usando el contexto de pantalla para desambiguar terminos.
- Hojas de calculo y presentaciones: aplica el estilo de puntuacion de la aplicacion de destino y formatea listas cuando se dictan, con una tasa de error del 8,55 % en el conjunto de contexto de pantalla (400 casos).
- Integracion en pipelines de dictado propios: al ser Apache 2.0 y ejecutarse con mlx-lm o mlx-swift-lm, puede incorporarse en aplicaciones macOS nativas o en scripts Python de posprocesado.

## Benchmarks y rendimiento

Word error rate frente a la limpieza de referencia / exact match (%, una peticion a la vez):

| Build | Contexto de pantalla (400) | Dictado simple (512) | Categorias nuevas A (309) | Categorias nuevas B (284) | Realismo (310) | Formato (180) |
|---|---|---|---|---|---|---|
| este modelo (MLX 8-bit) | 8,55 / 55,5 | 2,92 / 75,8 | 2,33 / 36,9 | 2,28 / 45,8 | 2,37 / 43,5 | 1,51 / 22,2 |

Los conjuntos de prueba estan reservados fuera del entrenamiento y fueron escritos por modelos abiertos y filtrados por un juez modelo; el conjunto de formato lo escribio Kimi K3 (familia no usada en las filas de entrenamiento) y cada fila fue verificada por Claude. No son dictados reales de usuarios. El conjunto de dictado simple sigue convenciones de listas antiguas (encabezados eliminados, vinetas no solicitadas) que blend-v14 corrige, por lo que los modelos v14 puntuan peor en el que en lo que piden las reglas de formato actuales.

Velocidad en un Apple M5 con aproximadamente 535 tokens de prompt: MLX Swift (mlx-swift-lm 3.32.3) con mediana de 0,7 a 1,0 s segun la carga de la maquina (1,01 s en la ejecucion bajo carga; el v12 2B midio 0,71 s); prefill de aproximadamente 1.550 tok/s y decodificacion de aproximadamente 47 tok/s.

## Requisitos de hardware

- VRAM/espacio estimado: aproximadamente 1,9 GB para los pesos MLX de 8 bits; el repositorio ocupa 2,0 GB.
- Hardware objetivo: Apple Silicon (el benchmark se realizo en un Apple M5); el formato MLX no esta pensado para GPU NVIDIA.
- Cabe en cualquier Mac con Apple Silicon y memoria unificada suficiente para el runtime de MLX; no se especifican requisitos minimos de memoria unificada.
- Opciones de despliegue: mlx-lm (Python) o mlx-swift-lm (Swift). Con swift-transformers <= 1.3.2, mapear `tokenizer_class` `Qwen3_5Tokenizer` a `Qwen2Tokenizer` (mismo BPE a nivel de byte).
- No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue en la informacion disponible.
- Latencia y throughput: mediana de 0,7 a 1,0 s por peticion, prefill de aproximadamente 1.550 tok/s y decodificacion de aproximadamente 47 tok/s en Apple M5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| qwen35-2b-muesli-cleanup-v14-mlx-8bit | 1,88 B | No disponible | MLX 8-bit | Apache 2.0 | Afinado para limpieza de dictado en ingles |
| Qwen/Qwen3.5-2B | 2 B (aproximado) | No disponible | No disponible | No disponible en la informacion | Modelo base sin afinar para limpieza |
| v12 2B (mencionado en la model card) | 2 B (aproximado) | No disponible | MLX | No disponible | Version anterior; midio 0,71 s en el mismo benchmark |

No se dispone de datos de benchmarks comparativos con otros modelos de limpieza de transcripciones en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles; no soporta otros idiomas.
- No es un reconocedor de voz: solo limpia texto ya transcrito.
- Riesgo de alterar el significado si el modelo aplica correcciones agresivas; la model card insiste en no parafrasear ni anadir o eliminar palabras con significado.
- El prompt debe coincidir exactamente con el de entrenamiento (un turno de usuario, sin mensaje de sistema, decodificacion greedy con temperatura 0 y top_k=1, sin penalizacion de repeticion, maximo 1.024 tokens nuevos, parada en `<|im_end|>`); desviarse puede degradar la calidad.
- El contexto de aplicacion debe limitarse a 1.200 caracteres entre las etiquetas `<APP-CONTEXT>`; omitir las lineas vacias de documento y OCR.
- Se recomienda una guarda en la aplicacion: si la salida esta vacia o supera 3 veces la longitud de la entrada, pegar la transcripcion cruda.
- Los conjuntos de evaluacion no son dictados reales de usuarios, por lo que el rendimiento en produccion puede diferir.
- El modelo tiene cero descargas y cero likes en HuggingFace en el momento de la consulta, sin validacion externa conocida.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribucion correspondiente.

## Enlaces

- HuggingFace: https://huggingface.co/Muesli-HQ/qwen35-2b-muesli-cleanup-v14-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) sobre este modelo; los resultados de busqueda corresponden a recetas de muesli y no son pertinentes.
