# Muesli-HQ/qwen35-2b-muesli-cleanup-v12-mlx-8bit

## Resumen

Muesli Pro Cleanup — Qwen 3.5 — MLX 8-bit es un modelo afinado para una tarea muy concreta: la limpieza de transcripciones de dictado en la aplicación macOS Muesli. Parte de Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 1.880 millones de parametros, y se ha especializado mediante LoRA para recibir la salida cruda de un sistema de speech-to-text y devolver el texto corregido, sin parafrasear ni alterar el significado. El modelo no reconoce voz: solo postprocesa texto ya transcrito.

La relevancia de este checkpoint es practica y de nicho. Frente a un modelo generico, que tenderia a reescribir o a inventar formato, este modelo esta entrenado para ser conservador: corrige errores evidentes, elimina muletillas, aplica autocorrecciones dictadas y formatea listas, devolviendo el texto intacto cuando ya es correcto. Ademas incorpora un bloque opcional de contexto de pantalla (aplicacion enfocada, documento, texto OCR) que usa solo para resolver nombres y acronimos, nunca para copiar contenido.

La distribucion es exclusiva para MLX en 8 bits con cuantizacion afin de grupo 64, pensada para ejecucion local en Apple Silicon mediante MLX-Swift-LM. El repositorio ocupa 2,0 GB y el checkpoint publicado es la version v12, no la v13.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), afinado con LoRA y fusionado en los pesos base |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit affine, group size 64 (unico formato publicado) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 2.000.043.057 bytes), libreria mlx |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-2B, un transformer denso de aproximadamente 1,88 mil millones de parametros, y se adapta mediante LoRA de rango 16 con Unsloth durante 1 epoca, calculando la perdida solo sobre la respuesta y fusionando despues los adaptadores en los pesos base. El conjunto de entrenamiento, denominado blend-v12, contiene 155.081 pares de limpieza que cubren correo electronico, chat, documentos, prompts para agentes de IA, codigo, hojas de calculo y presentaciones, cajas de busqueda y dictados largos; aproximadamente el 20 % de las filas incluyen contexto de pantalla. Los pares fueron generados por modelos abiertos alojados en Fireworks y filtrados por un modelo juez.

La innovacion tecnica no esta en la arquitectura, sino en el protocolo de inferencia, que debe reproducirse con exactitud: un unico turno de usuario sin mensaje de sistema, prompt construido manualmente con los tokens especiales de Qwen, plantilla de pensamiento vacia, decodificacion voraz (temperatura 0 o top_k=1, sin penalizacion por repeticion), maximo de 1.024 tokens nuevos y parada en `<|im_end|>`. El texto de usuario se compone como system prompt literal, mas un bloque `<APP-CONTEXT>` opcional recortado a 1.200 caracteres, mas la transcripcion cruda sin etiquetas. En Swift nativo se requiere MLX-Swift-LM 3.32.3 y Hugging Face Swift tokenizers 1.3.2, con el alias `Qwen3_5Tokenizer` a `Qwen2Tokenizer`, `clean_up_tokenization_spaces=false` y codificacion del prompt con `addSpecialTokens=false` sin plantilla de chat.

## Capacidades

- Limpieza de transcripciones de dictado: corrige errores claros de reconocimiento, elimina muletillas (um, uh, like), aplica autocorrecciones del tipo "no wait" o "scratch that" y respeta el texto que ya es correcto.
- Formateo de listas: convierte enumeraciones o vinetas dictadas en listas estructuradas.
- Adaptacion de puntuacion al estilo de la aplicacion de destino.
- Uso de contexto de pantalla: aplicacion enfocada, campo de documento, URL, texto seleccionado y texto OCR, exclusivamente para resolver nombres, acronimos y errores evidentes.
- Generacion de texto general, heredada del modelo base Qwen3.5-2B, aunque el afinado esta orientado a la tarea de limpieza.
- No incluye reconocimiento de voz, tool calling, capacidades de agente, vision ni audio; el contexto visual llega como texto OCR ya extraido por la aplicacion.
- Multilingue: solo ingles.

## Casos de uso

- Dictado en macOS con Muesli: el modelo recibe la salida cruda del reconocedor y devuelve texto limpio antes de insertarlo en la aplicacion activa, con latencia caliente de aproximadamente 0,7 s en un Apple M5.
- Correo electronico dictado: elimina muletillas y aplica autocorrecciones para producir mensajes con puntuacion coherente sin reescribir el contenido.
- Mensajeria y chat: mantiene el registro informal del hablante mientras corrige errores de reconocimiento, gracias a la instruccion explicita de preservar el fraseo original.
- Redaccion de documentos largos: con entradas de unas 289 palabras procesadas en 9,49 s de mediana, resulta viable para parrafos dictados completos.
- Prompts para agentes de IA: el conjunto de entrenamiento incluye esta categoria, por lo que el modelo puede limpiar instrucciones dictadas a herramientas de IA sin anadir comentarios ni envoltorios markdown.
- Codigo y hojas de calculo o presentaciones: cubre la limpieza de dictados tecnicos y de contenido tabular o de diapositivas presentes en el entrenamiento.
- Busquedas en cajas de texto: corrige la consulta dictada sin reformularla, lo que reduce busquedas fallidas por errores de transcripcion.
- Desambiguacion con contexto de pantalla: en editores con nombres propios o acronimos visibles, el bloque `<APP-CONTEXT>` permite resolver terminos que el reconocedor habria transcrito mal.

## Benchmarks y rendimiento

Evaluacion nativa en Swift con MLX 8-bit, 26 de octubre de 2026, con los prompts de entrenamiento sin cambios y decodificacion voraz. Los valores son tasas de error de palabra (WER) frente a la limpieza esperada, no porcentajes de coincidencia exacta; los conjuntos son benchmarks creados por el autor, no una prueba ciega con usuarios reales.

| Conjunto | WER |
|---|---|
| Screen-context 400 | 8,44 % |
| Plain 512 | 1,10 % |
| New categories A 309 | 2,30 % |
| New categories B 284 | 2,25 % |
| Realism 310 | 3,23 % |

Latencia medida en el Mac de desarrollo Apple M5 con otras aplicaciones activas, excluyendo la carga del modelo: mediana en caliente de 0,706 s y p90 de 0,959 s sobre 60 entradas cortas, 0,648 s tras 30 segundos de inactividad, y mediana de 9,49 s sobre 21 entradas largas de aproximadamente 289 palabras. El autor advierte que estos datos no garantizan la latencia extremo a extremo del dictado.

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio ocupa 2,0 GB y los pesos en 8 bits rondan los 2 GB; en Apple Silicon se consume memoria unificada, no VRAM dedicada.
- Hardware objetivo: Apple Silicon con MLX; el autor cita un Apple M5 como equipo de desarrollo. No se publican datos para GPU NVIDIA, A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: el formato es MLX 8-bit, por lo que no esta pensado para CUDA; en Mac con chip de la serie M es viable por su huella reducida.
- Despliegue: MLX-Swift-LM 3.32.3 con Hugging Face Swift tokenizers 1.3.2 en Swift nativo. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 0,706 s y p90 de 0,959 s en entradas cortas; 9,49 s de mediana en entradas de unas 289 palabras, en un M5 con otras aplicaciones activas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muesli-HQ/qwen35-2b-muesli-cleanup-v12-mlx-8bit | 1,88 mil millones | no disponible | Apache 2.0 | MLX 8-bit, solo ingles, tarea de limpieza de dictado |
| Qwen/Qwen3.5-2B (modelo base) | 1,88 mil millones | no disponible | no disponible en la informacion proporcionada | Pesos originales del que deriva este checkpoint |
| Alternativas de limpieza de dictado | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado ni evaluado para otros idiomas.
- No es un reconocedor de voz: unicamente postprocesa texto ya transcrito.
- El prompt debe coincidir exactamente con el de entrenamiento; desviaciones en el formato, la plantilla o la decodificacion degradan los resultados.
- El campo "Document context" del bloque de contexto se entreno con el nombre del campo enfocado; las aplicaciones que envien su contenido pueden obtener resultados mas debiles.
- Riesgo de alucinacion o de reescritura pese a la instruccion de conservadurismo; el autor recomienda una salvaguarda en la aplicacion: si la salida esta vacia o supera 3 veces la longitud de la entrada, pegar la transcripcion cruda.
- Los benchmarks son conjuntos creados por el autor, no una prueba ciega de aceptacion con usuarios reales; las metricas son WER frente a la limpieza esperada.
- Las latencias publicadas corresponden a un unico Mac M5 con otras aplicaciones activas y no garantizan el rendimiento extremo a extremo.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni condiciones adicionales del autor mas alla de la licencia.
- El checkpoint publicado es la v12, no la v13; conviene verificar la version antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/Muesli-HQ/qwen35-2b-muesli-cleanup-v12-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
