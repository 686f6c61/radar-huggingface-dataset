# Menterium/gemma-3-4b-it-GGUF

## Resumen

Menterium/gemma-3-4b-it-GGUF es una redistribucion en formato GGUF del componente de texto de google/gemma-3-4b-it, publicada por Menterium IT Solutions GmbH para su uso con llama.cpp y clientes derivados. No se trata de un modelo nuevo: los pesos son los de Gemma 3 4B Instruct de Google, convertidos a GGUF y cuantizados en dos variantes (Q8_0 y Q4_K_M). El objetivo declarado es la reescritura local y totalmente offline de texto dictado (puntuacion, eliminacion de muletillas, suavizado de tono) en la aplicacion Celerando, aunque el artefacto es generico y sirve para cualquier cliente basado en llama.cpp.

La relevancia practica del repositorio esta en la conversion: se ha extraido unicamente el decodificador de texto del checkpoint multimodal original (la torre de vision no se incluye) y se ha preservado la configuracion de attention con ventana deslizante (1024 tokens en 29 de las 34 capas) y los dos embeddings rotatorios del config.json original. Esto permite que llama.cpp aplique la ventana deslizante mediante una cache KV separada, de modo que prompt y respuesta pueden superar los 1024 tokens, a diferencia de las builds DirectML de Gemma 3 que quedan limitadas a esa longitud.

El modelo base es un transformer denso de 3.880.263.168 parametros con 4B nominales, orientado a generacion de texto conversacional. El autor aporta mediciones concretas de latencia sobre una RTX 5070 Ti y comparaciones de fidelidad frente a bf16, lo que hace la ficha util para quien necesite evaluar el coste real de desplegar Gemma 3 4B en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decodificador de texto de Gemma 3), con attention de ventana deslizante en 29 de 34 capas y embeddings rotatorios globales y locales |
| Parametros totales | 3.880.263.168 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | Ventana deslizante de 1024 tokens en 29 de 34 capas; el contexto global efectivo depende del cliente llama.cpp, que gestiona la ventana con una cache KV separada. El autor verifico prompts mas respuestas de hasta 1742 tokens |
| Tipos de cuantizacion | Q8_0 (4,13 GB) y Q4_K_M (2,49 GB) |
| Idiomas soportados | no disponibles en la informacion del repositorio; el autor menciona pruebas de reescritura en aleman, ingles y espanol |
| Licencia | Gemma Terms of Use (ai.google.dev/gemma/terms), sujeta a la Gemma Prohibited Use Policy |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye una version modificada de google/gemma-3-4b-it. La conversion se realizo con la release b10221 de llama.cpp (commit 815a2a5, 2026-08-01) mediante convert_hf_to_gguf.py sobre el checkpoint multimodal, que escribe solo el decodificador de texto y descarta la torre de vision; la salida en bf16 se cuantizo despues con llama-quantize con ajustes por defecto, incluyendo la cuantizacion de los tensores de salida y embedding.

Arquitectonicamente se conservan del config.json original la ventana deslizante de 1024 tokens en 29 de las 34 capas y los dos embeddings rotatorios: el global con theta 1e6 y factor lineal 8, y el local con theta 1e4. llama.cpp aplica la ventana por si mismo con una cache KV separada, lo que evita la limitacion de 1024 tokens de otras implementaciones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de turnos propio de Gemma (`<start_of_turn>user` / `<start_of_turn>model`).
- Reescritura y edicion de texto: puntuacion, eliminacion de muletillas y suavizado de tono, caso de uso principal declarado por el autor.
- Instrucciones en el primer turno de usuario: Gemma no tiene rol de sistema, por lo que las instrucciones deben colocarse en el primer mensaje de usuario.
- Generacion con decodificacion greedy reproducible: el autor verifico coincidencia exacta con bf16 en 171 de 174 prompts con Q8_0 y en 155 de 174 con Q4_K_M.
- Soporte de prompts largos en la practica: se completaron correctamente prompts mas respuestas de hasta 1742 tokens (dictados de 313 palabras).
- Capacidades multimodales (vision): no disponibles en este artefacto, ya que la torre de vision no se incluye en la conversion.
- Tool calling, function calling y razonamiento multi-paso en modo agente: no documentados en la informacion proporcionada para este repositorio.

## Casos de uso

- Reescritura de dictado offline: el escenario disenado por el autor. Se envia el texto dictado entre etiquetas `<text>` y `</text>` con una instruccion de puntuacion o limpieza, y el modelo devuelve solo el texto corregido. La latencia medida (mediana de 0,18 s con Q4_K_M en Vulkan con prefijo cacheado) lo hace viable en interaccion en tiempo real.
- Procesamiento por lotes en CPU: con Q4_K_M y prefijo de instrucciones en cache KV, una reescritura tarda unos 3 s en 8 nucleos de CPU, adecuado para pipelines de limpieza de transcripciones sin GPU.
- Asistentes de escritura integrados en aplicaciones de escritorio: al ser un GGUF compatible con llama.cpp, se puede embarcar en clientes nativos (Vulkan, CUDA, Metal) sin dependencia de servicios en la nube, lo que simplifica el cumplimiento de privacidad cuando el texto del usuario no debe salir del dispositivo.
- Normalizacion de transcripciones en herramientas de subtitulado o actas: el modelo aplica puntuacion y elimina muletillas sobre segmentos de hasta varios cientos de palabras, con contexto suficiente para mantener coherencia dentro del parrafo.
- Prototipado y evaluacion de Gemma 3 4B en local: las dos cuantizaciones permiten comparar rapidamente el comportamiento de Q8_0 (practicamente identico a bf16) frente a Q4_K_M (mas rapido en CPU, con ligeras divergencias) antes de comprometerse con un despliegue mayor.
- Generacion de texto conversacional general de baja latencia en hardware de consumo: con 2,49 GB en Q4_K_M cabe en GPUs con poca memoria y permite experimentar con el formato de turnos de Gemma sin descargar el checkpoint multimodal completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor aporta mediciones propias de fidelidad y latencia:

| Metrica | Q8_0 | Q4_K_M |
|---|---|---|
| Coincidencia de salida greedy con bf16 (174 prompts de reescritura en aleman, ingles y espanol) | 171/174 | 155/174 |
| Tamano del fichero | 4,13 GB | 2,49 GB |
| Latencia mediana de reescritura (RTX 5070 Ti, Vulkan, prompt de instrucciones de ~700 tokens, greedy) | 0,21 s | 0,18 s |
| Latencia con prefijo de instrucciones en cache KV (RTX 5070 Ti, Vulkan) | no disponible | ~0,10 s |
| Latencia en CPU (8 nucleos, prefijo cacheado) | no disponible | ~3 s |
| Velocidad relativa en CPU | 1x (referencia) | ~1,6x mas rapido que Q8_0 (medido con TranslateGemma 4B, misma arquitectura) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB para Q8_0 y 2,8-3,2 GB para Q4_K_M, incluyendo cache KV y overhead del runtime (estimacion a partir del tamano de los ficheros; no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; el autor valido el funcionamiento en una RTX 5070 Ti con backends Vulkan, CUDA y Metal.
- GPU de consumo: si, el modelo cabe en GPUs de consumo modernas con 4 GB o mas de VRAM en Q4_K_M, y con 6 GB o mas en Q8_0.
- Despliegue: llama.cpp (release b10221 o posterior recomendada, por la conversion), y cualquier cliente construido sobre llama.cpp. No se documentan integraciones con vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: mediana de 0,18-0,21 s por reescritura en RTX 5070 Ti con Vulkan y prompt de ~700 tokens; ~0,10 s con prefijo cacheado; ~3 s en 8 nucleos de CPU con Q4_K_M y prefijo cacheado. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Menterium/gemma-3-4b-it-GGUF (este) | 3,88 B | Ventana deslizante de 1024 en 29/34 capas; prompts verificados hasta 1742 tokens | GGUF (Q8_0, Q4_K_M) | Gemma Terms of Use | Solo decodificador de texto; sin vision |
| google/gemma-3-4b-it | 3,88 B | Configuracion original de Gemma 3 | safetensors (bf16) | Gemma Terms of Use | Modelo base multimodal completo, incluida torre de vision |
| Builds DirectML de Gemma 3 | 3,88 B | Limitado a 1024 tokens | GGUF / otros | Gemma Terms of Use | Limitacion de contexto documentada por el autor de este repositorio |
| Otras alternativas de 4B (p. ej. familias Llama o Qwen) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo nuevo: todos los derechos sobre los pesos subyacentes pertenecen a Google; este repositorio solo redistribuye una version cuantizada.
- La licencia Gemma Terms of Use y la Gemma Prohibited Use Policy se aplican a cada usuario downstream y a cada redistribucion posterior; es obligatorio revisarlas antes de un uso comercial.
- El artefacto contiene solo el decodificador de texto: no hay capacidades de vision aunque el modelo base sea multimodal.
- La ventana deslizante de 1024 tokens en 29 de las 34 capas limita la coherencia en contextos muy largos; el autor solo verifico prompts mas respuestas de hasta 1742 tokens.
- Gemma no tiene rol de sistema: las instrucciones deben ir en el primer turno de usuario, lo que complica la integracion con clientes que asumen un mensaje de sistema separado.
- El token `<bos>` debe anadirse exactamente una vez; el GGUF activa `tokenizer.ggml.add_bos_token`, por lo que duplicarlo degrada la generacion.
- Q4_K_M divergio de bf16 en 19 de 174 prompts de reescritura (frente a 3 de 174 con Q8_0): para tareas sensibles a la fidelidad exacta conviene Q8_0.
- Las mediciones de latencia y velocidad relativa provienen de un unico equipo (RTX 5070 Ti, i7-9700K) y de una comparacion con TranslateGemma 4B, no con este mismo modelo en CPU.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son los heredados del modelo base de Google.
- El repositorio tiene un volumen de descargas muy bajo (87) y ninguna validacion de la comunidad (0 likes), por lo que conviene verificar los SHA-256 publicados antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Menterium/gemma-3-4b-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Aplicacion Celerando (Menterium): https://celerando.menterium.com
