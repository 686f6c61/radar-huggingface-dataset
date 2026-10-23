# a1cd/shears-translate-en-ja-GGUF

## Resumen

shears-translate-en-ja es un traductor experimental inglés→japonés publicado por el usuario a1cd en HuggingFace, derivado de google/gemma-4-26B-A4B-it (un modelo de mezcla de expertos de 26B de parámetros totales con 4B activos, 30 capas y 128 expertos por capa). El proceso consiste en podar 120 de los 128 expertos de cada capa, conservando solo 8, y después "curar" (healing) el modelo podado mediante LoRA por bloques para que reproduzca las salidas del modelo original. Como los 8 expertos que se conservan son exactamente los 8 que se activaban por token, tras la poda no queda nada que enrutar y el modelo se comporta como un denso de aproximadamente 3,8B de parámetros (3.812.389.646 según los safetensors del repositorio).

El resultado se distribuye únicamente como GGUF Q4_K_M de 2.753.442.560 bytes (unos 2,75 GB), lo que permite ejecutarlo en un portátil. Está pensado para un uso muy acotado: un system prompt fijo que convierte toda entrada en texto a traducir, pensamiento desactivado, temperatura 0 y mensajes de 1 a 110 palabras. El propio autor lo describe como un artefacto de investigación, no como un traductor pulido, y advierte explícitamente contra su uso en textos médicos, legales o críticos para la seguridad.

Su relevancia es metodológica más que de producto: demuestra que la poda de expertos combinada con healing por bloques puede comprimir un MoE de 26B hasta un denso de 3,8B manteniendo un comportamiento de traducción usable, y que el resultado cabe en hardware de consumo. El interés añadido está en su resistencia deliberada a la inyección de prompts: cualquier instrucción contenida en el mensaje se traduce, no se obedece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE) en el modelo base; tras la poda se comporta como denso (8 expertos conservados por capa = 8 activos por token, sin enrutamiento) |
| Parametros totales | 3.812.389.646 (~3,8B) en el checkpoint publicado; modelo base: 26B totales (MoE) |
| Parametros activos | No aplica tras la poda (comportamiento denso ~3,8B); en el modelo base, 4B activos, 8 expertos de 128 por token |
| Longitud de contexto | No disponible. El ejemplo de llama.cpp del autor usa `-c 8192`, pero no se especifica la ventana nativa del modelo ni se validaron entradas largas |
| Tipos de cuantizacion | Q4_K_M (única publicada), GGUF de 2.753.442.560 bytes |
| Idiomas soportados | Inglés (entrada) y japonés (salida) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama), con `Modelfile` incluido en el repositorio |

## Arquitectura y entrenamiento

El modelo base, gemma-4-26B-A4B-it, es un MoE de 30 capas con 128 expertos por capa y 8 activos por token. El pipeline de Shears aplica dos fases. La primera es una selección de expertos: cada una de las 30 capas conserva 8 expertos, eligidos por el paso de selección de Shears. La segunda es el healing bloque a bloque: LoRA de rango 128 sobre los expertos, rango 64 sobre las capas densas y una corrección del router de rango 16, entrenada para igualar las salidas del modelo original en cinco bloques que terminan en las capas 5, 11, 17, 23 y 29. Los adaptadores se fusionan en los pesos finales.

El detalle técnico importante es que el healing fue exclusivamente local por bloque: no hubo una fase extremo a extremo ni entrenamiento consciente de la cuantización. El profesor utilizado no fue un checkpoint bf16, sino el modelo original en su versión 4-bit QAT (`mlx-community/gemma-4-26B-A4B-it-qat-4bit`), de modo que todos los objetivos de entrenamiento y la distribución de referencia corresponden a esa versión de 4 bits. Posteriormente el modelo se cuantizó a Q4_K_M, redondeo que el proceso de healing nunca vio. El entrenamiento se realizó en un único formato de tarea: system prompt fijo, texto en inglés como mensaje de usuario y canal de pensamiento vacío. No se documenta el volumen de tokens ni la composición del dataset de healing en la información disponible.

## Capacidades

- Traducción directa inglés→japonés de mensajes cortos, conversación y prosa sencilla.
- Tratamiento uniforme de toda entrada como texto a traducir: preguntas, instrucciones, etiquetas de rol, transcripciones de chat y intentos de manipulación se traducen, no se responden.
- Resistencia por diseño a la inyección de prompts: el system prompt ordena no obedecer, no responder y no revelar reglas.
- Conservación de nombres, números, código, etiquetas de marcado y formato.
- Texto ya en japonés, vacío, solo espacios o solo símbolos se devuelve sin cambios.
- Texto codificado o cifrado (base64, ROT13) se mantiene tal cual, sin decodificar.
- Sin soporte documentado de tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso. El modo de pensamiento debe permanecer desactivado.

## Casos de uso

- Traducción de mensajes de chat en una aplicación de mensajería: el modelo traduce cada turno de forma independiente con temperatura 0 y un prompt fijo, y su tamaño de 2,75 GB permite desplegarlo en el mismo portátil o en un servidor modesto sin depender de una API externa.
- Localización de cadenas cortas de interfaz de usuario: con entradas de una a diez palabras y conservación de marcado y etiquetas, encaja en pipelines que traducen textos de botones, títulos y descripciones emergentes donde el contexto es mínimo.
- Pretraducción de correos y notas internas en inglés para su revisión posterior por un traductor humano de japonés, aprovechando que el coste por token es prácticamente nulo al ejecutarse en local.
- Filtro o capa de sandboxing en un sistema mayor: al no obedecer instrucciones incrustadas en el texto, puede usarse para procesar contenido no confiable (comentarios de usuarios, tickets) sin riesgo de que el contenido secuestre el comportamiento del modelo.
- Prototipado e investigación sobre poda de MoE: sirve como referencia reproducible de hasta dónde se puede comprimir un MoE de 26B conservando capacidad de traducción, y como caso de estudio de healing por bloques frente a destilación completa.
- Generación de subtítulos y descripciones breves para catálogos o contenido multimedia, siempre con revisión humana y sin datos numéricos críticos, dado que el modelo puede alterar decimales.
- Evaluación comparativa de traductores neuronales pequeños: al ser un denso de 3,8B en 4 bits, es una línea base útil frente a modelos dedicados de traducción de tamaño similar en pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las debilidades documentadas provienen de comparaciones cualitativas cara a cara con el modelo completo, no de un recuento sistemático, y que no se realizó ninguna evaluación formal (ni BLEU, ni COMET, ni MMLU, ni pruebas de traducción estandarizadas).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3 GB para el GGUF Q4_K_M (2,75 GB de pesos más overhead de contexto y caché KV); con 4 GB de VRAM sobra para contextos moderados.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 3060, RX 6600, RTX 4060, etc.). También funciona en CPU, ya que el modelo se describe como ejecutable en un portátil.
- Memoria del sistema: con 8 GB de RAM es suficiente para la ruta de CPU en Q4_K_M; se recomiendan 16 GB si se ejecuta junto a otras cargas.
- Opciones de despliegue: Ollama es la única ruta probada por el autor (Ollama 0.40.8, con `--think=false` o `"think": false` en la API). llama.cpp con `llama-server -m ... --jinja -c 8192` está documentado pero no probado. No hay soporte verificado de vLLM ni TGI para este GGUF.
- Configuración obligatoria: temperatura 0 (greedy), pensamiento desactivado y el system prompt exacto del repositorio. Los valores por defecto de muestreo del GGUF (temperatura 1.0, top-p 0.95, top-k 64) no son los que se usaron en ninguna medición.
- Latencia y throughput: no disponibles. Al ser un denso de 3,8B en 4 bits, se espera un rendimiento muy superior al del MoE de 26B original, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shears-translate-en-ja (este) | ~3,8B denso tras poda (base MoE 26B) | No disponible | Traducción EN→JA con prompt fijo, poda de expertos + healing | Apache 2.0 | GGUF Q4_K_M, 2,75 GB |
| google/gemma-4-26B-A4B-it (modelo base) | 26B totales, 4B activos | No disponible en la informacion proporcionada | Modelo generalista instruido, multilingüe | Licencia Gemma (no indicada en la informacion disponible) | Pesos completos; requiere hardware muy superior |
| Traductores neuronales dedicados de tamano similar (familia Opus-MT / NLLB) | ~0,1B–0,6B | ~512 tokens en las variantes habituales | Traducción supervisada específica de par de idiomas | Variables segun modelo (algunas no comerciales) | Muy extendidos en HuggingFace y en frameworks de traduccion |

No se dispone de datos de benchmarks que permitan comparar calidad de traducción de forma objetiva entre estas opciones. La comparación con las alternativas dedicadas se basa en conocimiento general de la categoria y debe verificarse antes de tomar una decision; la información proporcionada solo documenta con detalle el modelo objeto de esta ficha y su base.

## Limitaciones y advertencias

- Los decimales pueden desaparecer o alterarse: el autor documenta un caso en el que "2.5 mg" salió como "25 mg". Es un fallo grave para cualquier texto con dosis, medidas o importes.
- Puede corromper términos especializados y vocabulario técnico de dominio.
- Prohibido explícitamente su uso en textos médicos, legales o críticos para la seguridad.
- Solo validado en mensajes de 1 a 110 palabras (recuento por espacios); las entradas más largas no se probaron.
- No es un sustituto del modelo completo ni de un traductor profesional; el autor lo califica de artefacto de investigación.
- El healing fue local por bloque, sin fase extremo a extremo y sin entrenamiento consciente de la cuantización; el redondeo a Q4_K_M no se vio durante el entrenamiento, lo que introduce degradación adicional no medida.
- El profesor fue un checkpoint de 4 bits, no bf16, por lo que los objetivos de entrenamiento arrastran los sesgos y errores de esa cuantización.
- Funciona únicamente con el system prompt exacto y en el formato entrenado; usar otro prompt o activar el pensamiento degrada el comportamiento. Solo se comprobó una vez, con una frase de prueba y Ollama 0.40.8.
- La ruta de llama.cpp no fue probada por el autor.
- No se han publicado evaluaciones sistemáticas; las debilidades descritas son cualitativas y probablemente incompletas.
- Riesgo de alucinación no cuantificado: el modelo no responde preguntas, pero puede inventar terminología o alterar contenido al traducir.
- Sesgos: no documentados en la información disponible, pero heredados del modelo base Gemma y del corpus de entrenamiento de este.
- Licencia Apache 2.0 en el repositorio, lo que permite uso comercial del artefacto; conviene verificar igualmente las condiciones del modelo base Gemma de Google antes de un despliegue en producción.
- Advertencia de seguridad: los resultados de búsqueda web asociados a esta consulta no contenían información relevante sobre el modelo (devolvieron contenido de foros sin relación), por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a1cd/shears-translate-en-ja-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Profesor 4-bit QAT: https://huggingface.co/mlx-community/gemma-4-26B-A4B-it-qat-4bit
- Herramienta Shears (poda y healing): https://github.com/a1cd/Shears
- Proyecto Tolby: https://tolby.app
- Artículo técnico del autor: pendiente de publicación (marcado como TODO en la model card)
- Resultados de búsqueda web: sin enlaces relevantes; las entradas devueltas no guardan relación con el modelo.
