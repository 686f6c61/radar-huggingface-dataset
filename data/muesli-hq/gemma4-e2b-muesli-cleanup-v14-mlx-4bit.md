# Muesli-HQ/gemma4-e2b-muesli-cleanup-v14-mlx-4bit

## Resumen

`gemma4-e2b-muesli-cleanup-v14-mlx-4bit` es un ajuste fino (fine-tuning) del modelo `google/gemma-4-E2B-it` desarrollado por Muesli-HQ para una tarea muy concreta: la limpieza de transcripciones de dictado por voz en la aplicación de dictado para macOS Muesli. El modelo recibe la salida cruda de un sistema de reconocimiento de voz (speech-to-text) y, opcionalmente, contexto de la aplicación en pantalla, y devuelve el texto corregido: arregla errores claros de reconocimiento, elimina muletillas, aplica autocorrecciones del hablante, convierte elementos enumerados en listas y adapta la puntuación al estilo de la aplicación de destino. Si el texto ya es correcto, lo devuelve sin cambios.

El modelo parte de la arquitectura Gemma 4 de Google con 4.628.569.379 parametros totales y se distribuye cuantizado en 4 bits (group size 64) en formato MLX, con un tamano de repositorio de 2,6 GB. Esta pensado para inferencia en dispositivo (on-device) en hardware Apple Silicon mediante mlx-lm o mlx-swift-lm. La licencia es Apache 2.0 y el unico idioma soportado es el ingles.

Su relevancia actual radica en que aborda un problema practico de los flujos de dictado: la salida de los motores ASR suele contener errores, muletillas y falta de formato, y este modelo actua como capa de postprocesado especializada en lugar de recurrir a un LLM generalista. El ajuste se realizo con LoRA de rango 16 sobre una base cuantizada a 4 bits, con 157.037 pares de limpieza y una perdida de evaluacion final de 0,114.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, modelo base `google/gemma-4-E2B-it`) |
| Parametros totales | 4.628.569.379 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (limite de generacion: 1.024 tokens nuevos) |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4 bits) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 4 E2B instruct (`google/gemma-4-E2B-it`), un transformer decoder-only de aproximadamente 4.630 millones de parametros. El ajuste se realizo con LoRA de rango 16 sobre la base ya cuantizada a 4 bits, usando Unsloth (`unsloth/gemma-4-E2B-it`), durante 1 epoca (9.815 pasos), con la perdida calculada unicamente sobre la respuesta y posteriormente fusionada en los pesos base. La perdida de evaluacion final fue de 0,114.

Los datos de entrenamiento corresponden al conjunto **blend-v14**: 157.037 pares de limpieza que cubren correo electronico, chat, documentos, prompts de agentes de IA, codigo, hojas de calculo y presentaciones, cajas de busqueda y dictados largos, con aproximadamente un 24 % de las filas incluyendo contexto de pantalla. Respecto a blend-v12, esta version anade errores de reconocimiento y habitos de habla realistas, corrige unos 15.000 objetivos de listas y formato hacia una especificacion unica (las senales habladas siempre generan lista; en notas y documentos solo con 3 o mas elementos; se conservan los preambulos dictados; numeracion solo cuando se cuenta), descarta filas que fallaron una auditoria (subagentes de Claude y Kimi K3) y anade 2.759 filas de formato verificadas por Claude. El prompt de inferencia debe replicar exactamente el formato de entrenamiento: un unico turno de usuario sin mensaje de sistema, decodificacion greedy (temperatura 0, `top_k=1`, sin penalizacion por repeticion) y parada en `<turn|>`.

## Capacidades

- Limpieza de transcripciones de dictado: correccion de errores claros de reconocimiento de voz, eliminacion de muletillas ("um", "uh", "like") y aplicacion de autocorrecciones del hablante ("scratch that", "no wait...").
- Formateo de listas: convierte elementos dictados o claramente enumerados en listas numeradas o con vinetas segun reglas especificas.
- Adaptacion de puntuacion al estilo de la aplicacion de destino.
- Uso de contexto de pantalla (`<APP-CONTEXT>`) para resolver errores de transcripcion, nombres, acronimos e intencion de formato, sin copiar ese contexto a la salida.
- Preservacion del texto original: si el texto ya es correcto, lo devuelve exactamente igual.
- Generacion de texto conversacional (pipeline `text-generation`), aunque su uso previsto es exclusivamente la limpieza.
- No soporta tool calling, agentes, vision ni audio de forma declarada en la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Postprocesado de dictado en macOS: integrado en la aplicacion Muesli, el modelo recibe la salida cruda del motor ASR y devuelve texto limpio antes de insertarlo en la aplicacion activa, aprovechando su ejecucion on-device con MLX.
- Redaccion de correo electronico por voz: el modelo corrige errores de reconocimiento y aplica la puntuacion adecuada al campo de correo enfocado, usando el contexto de pantalla para resolver nombres y acronimos.
- Mensajeria instantanea: limpia transcripciones de chat eliminando muletillas y respetando el estilo informal del destino, sin parafrasear el contenido.
- Documentacion y notas: convierte dictados con elementos enumerados en listas con vinetas o numeradas segun las reglas de formato (listas solo con 3 o mas elementos en notas y documentos).
- Prompts para agentes de IA: limpia dictados destinados a cajas de prompt de agentes, donde la precision del texto de entrada afecta directamente a la calidad de la respuesta del agente.
- Dictado de codigo y hojas de calculo: corrige terminos tecnicos y acronimos apoyandose en el contexto de pantalla del editor o de la hoja activa.
- Busquedas dictadas: normaliza la transcripcion en cajas de busqueda manteniendo la formulacion original del hablante.
- Dictados largos: procesa transcripciones extensas con autocorrecciones y cambios de intencion a lo largo del texto.

## Benchmarks y rendimiento

Resultados publicados por el autor: tasa de error de palabra (WER) frente a la limpieza de referencia / coincidencia exacta (%), una peticion a la vez.

| Conjunto de evaluacion | WER / exact match |
|---|---|
| Screen-context (400) | 9,19 / 53,0 |
| Plain dictation (512) | 3,38 / 73,2 |
| New categories A (309) | 2,69 / 37,2 |
| New categories B (284) | 2,90 / 41,5 |
| Realism (310) | 2,79 / 43,9 |
| Formatting (180) | 1,78 / 17,8 |

Los conjuntos de prueba estan reservados fuera del entrenamiento, fueron escritos por modelos abiertos y filtrados por un juez modelo; el conjunto de formato lo escribio Kimi K3 (familia no usada en las filas de entrenamiento) y cada fila fue verificada por Claude. No son dictados de usuarios reales. El conjunto de dictado simple usa convenciones de lista antiguas que blend-v14 corrige, por lo que los modelos v14 puntuan peor en el que en lo que exigen las reglas de formato actuales.

Velocidad medida en un Apple M5 con aproximadamente 535 tokens de prompt y mlx-lm 0.32.2 (Python): mediana de 0,48 s en el conjunto de contexto de pantalla y 1,25 s en el conjunto de formato.

## Requisitos de hardware

- VRAM/espacio en disco: el repositorio ocupa 2,6 GB en cuantizacion 4 bits (group size 64); la inferencia requiere un espacio en memoria del orden de esa cifra mas el estado de ejecucion, aunque el autor no publica una cifra exacta de memoria pico.
- Hardware objetivo: Apple Silicon. Las medidas de latencia se realizaron en un Apple M5.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; el formato MLX esta orientado a silicio de Apple, no a CUDA.
- Opciones de despliegue: mlx-lm (Python) o mlx-swift-lm. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: mediana de 0,48 s (contexto de pantalla) y 1,25 s (formato) en Apple M5 con ~535 tokens de prompt.
- Limitacion de generacion: maximo 1.024 tokens nuevos, decodificacion greedy y parada en `<turn|>`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales frente a opciones genericas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| gemma4-e2b-muesli-cleanup-v14-mlx-4bit | 4.628.569.379 | no disponible | en | Apache 2.0 | MLX 4 bits, safetensors |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible | no disponible | safetensors (modelo base) |
| Modelo ASR generico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la busqueda web modelos comparables especializados en limpieza de transcripciones de dictado.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas.
- Solo limpieza: no es un reconocedor de voz; requiere una transcripcion previa.
- El prompt debe coincidir exactamente con el formato de entrenamiento (un turno de usuario, sin mensaje de sistema, plantilla construida manualmente). La plantilla de chat nativa de Gemma 4 abre un canal de razonamiento salvo que se use `enable_thinking=False`, por lo que el autor recomienda construir la cadena a mano.
- Decodificacion greedy obligatoria (temperatura 0, `top_k=1`, sin penalizacion por repeticion); desviarse puede degradar la calidad.
- Los conjuntos de evaluacion no son dictados reales de usuarios, lo que limita la extrapolacion de los resultados a produccion.
- El conjunto de dictado simple refleja convenciones de lista antiguas; la puntuacion de coincidencia exacta en formato es baja (17,8 %).
- Riesgo de alucinacion o de parafraseo no deseado: el autor recomienda una salvaguarda en la aplicacion que pegue la transcripcion cruda si la salida esta vacia o supera 3 veces la longitud de la entrada.
- El contexto de pantalla no debe copiarse a la salida salvo que el usuario lo haya dictado; el modelo esta entrenado para ello, pero es un riesgo a vigilar.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base (`google/gemma-4-E2B-it`) puede estar sujeto a sus propios terminos, que no se detallan en la informacion disponible.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Muesli-HQ/gemma4-e2b-muesli-cleanup-v14-mlx-4bit
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Base usada para el ajuste (Unsloth): `unsloth/gemma-4-E2B-it` (referencia en la model card, sin URL directa proporcionada)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos (Wikipedia, mymuesli, Marmiton, Cuisineaz) tratan sobre el alimento muesli y no guardan relacion con este modelo.
