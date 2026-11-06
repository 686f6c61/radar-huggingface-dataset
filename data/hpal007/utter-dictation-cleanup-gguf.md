# hpal007/utter-dictation-cleanup-GGUF

## Resumen

Utter dictation cleanup es un modelo especializado en la limpieza de transcripciones de voz a texto, publicado por el usuario hpal007 en Hugging Face. Su función es convertir transcripciones crudas de speech-to-text en el texto que el hablante realmente quiso dictar: elimina muletillas y falsos arranques, corrige gramática y mayúsculas de nombres técnicos (por ejemplo, "api" a "API"), escribe los números con el formato adecuado, convierte listas habladas en listas escritas y preserva el hindi en el alfabeto en que se habló (devanagari o latino). El modelo no resume ni añade contenido, algo poco habitual en este tipo de herramientas.

Técnicamente, el repositorio distribuye dos cuantizaciones GGUF Q6_K derivadas de modelos base conocidos: Qwen3-1.7B (archivo recomendado, 1,42 GB) y Gemma 4 E2B-it (3,26 GB). Está diseñado para ejecutarse localmente mediante llama.cpp dentro de Utter, una aplicación de dictado para macOS y Windows, donde se descarga automáticamente en los presets "Accurate" e "Hinglish". Su relevancia radica en que aborda un problema muy concreto y frecuente en flujos de dictado por voz —la diferencia entre lo que un motor de transcripción produce y lo que el usuario quiere escribir— con un modelo pequeño que corre en un ordenador de consumo.

Es importante señalar una discrepancia en los metadatos: Hugging Face reporta 4.628.569.635 parámetros totales en safetensors, mientras que los modelos base declarados (Qwen3-1.7B y Gemma 4 E2B) tienen tamaños de aproximadamente 1,7 y 2-3 mil millones de parámetros respectivamente, y los archivos GGUF publicados (1,42 GB y 3,26 GB en Q6_K) son coherentes con estos últimos. El dato de safetensors podría corresponder a un checkpoint combinado o a un error de registro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3 y Gemma 4 E2B), afinado para limpieza de transcripciones |
| Parametros totales | 4.628.569.635 (dato safetensors del repo; los GGUF derivan de Qwen3-1.7B, ~1,7B, y Gemma 4 E2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (según el comando de ejemplo); entrada de dictado recomendada de hasta ~1000 tokens |
| Tipos de cuantizacion | Q6_K (ambos archivos GGUF) |
| Idiomas soportados | Ingles y hindi (incluyendo texto mixto Hinglish, con preservacion de devanagari o alfabeto latino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); los metadatos del repo mencionan safetensors como origen |

## Arquitectura y entrenamiento

El repositorio no distribuye pesos de entrenamiento propios en formato safetensors, sino dos cuantizaciones GGUF Q6_K de modelos base afinados: Qwen3-1.7B (arquitectura transformer decoder de Qwen, con soporte de modo thinking desactivable) y Gemma 4 E2B-it (transformer de Google con attention deslizante, compatible con decodificacion especulativa mediante un drafter MTP). El ajuste se ha realizado para una tarea unica: transformar transcripciones crudas de dictado en texto escrito fiel, siguiendo un system prompt muy detallado que el propio README publica y que debe enviarse literalmente (incluido su salto de linea final) con temperatura 0.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens ni la tecnica de afinado empleada (SFT, DPO u otras). Como innovaciones de inferencia, el README documenta dos esquemas de decodificacion especulativa: n-gram simple (`--spec-type ngram-simple`) para el modelo Qwen, y draft MTP (multi-token prediction) usando `mtp-gemma-4-E2B-it-Q8_0.gguf` para el modelo Gemma, junto con la flag `--swa-full` para este ultimo. Ambos archivos se listan en un `models.json` con nombre, commit, tamano y SHA-256, lo que permite actualizaciones verificables desde la aplicacion Utter.

## Capacidades

- Limpieza de transcripciones de dictado: eliminacion de muletillas ("um", "uh", "like", "you know", y "so", "toh" o "matlab" al inicio de frase), conservando palabras del hablante como "basically", "actually" o "I mean".
- Resolucion de falsos arranques y autocorrecciones: conserva solo la version final que el hablante concreto, manteniendo autoaclaraciones.
- Correccion gramatical del ingles en alfabeto latino: concordancia, palabras cortas omitidas, formas verbales y orden estandar; sustitucion de palabras mal transcritas solo cuando el contexto la determina con certeza.
- Normalizacion de numeros: cantidades menores de diez en palabras; digitos para 10 o mas, dinero, unidades, horas, fechas, porcentajes, versiones y etiquetas (3 pm, ₹1.748, $10, 2%, v2). Simbolo de moneda solo si el hablante dijo "dollars" o "rupees"; horas en hindi se mantienen como se dijeron ("3 baje").
- Correccion de mayusculas de nombres tecnicos sin expandirlos (api -> API, postgres -> Postgres).
- Deteccion y formateo de listas habladas: dos o mas items generan una lista con guion o numerada (si el hablante conto en voz alta), con introduccion terminada en dos puntos; las enumeraciones dentro de una frase o relatos secuenciales se mantienen en prosa.
- Aplicacion de comandos de voz hablados: "new line", "new paragraph", "open paren".
- Manejo de texto Hinglish: preserva cada tramo en su alfabeto original (nunca translitera devanagari a latino ni al reves), limpia puntuacion y muletillas en devanagari sin reformular, y cierra con "।" las frases que terminan en palabra devanagari.
- Compatibilidad con el formato de chat de llama.cpp mediante plantilla Jinja, con thinking desactivado para Qwen3 (`enable_thinking: false`).

Capacidades explicitamente excluidas por diseno: reescritura a peticion, traduccion, resumenes y chat general. No se ha documentado soporte de tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Dictado profesional en la aplicacion Utter: el caso de uso principal; el modelo se descarga automaticamente en los presets "Accurate" e "Hinglish" y limpia en local cada dictado antes de insertarlo en el editor, sin enviar datos a la nube.
- Postprocesado de transcripciones de Whisper o similares: se puede montar un pipeline local donde un motor ASR genera la transcripcion cruda y este modelo la normaliza via `llama-server`, con temperatura 0 para resultados deterministas.
- Redaccion de correos y documentos por voz en Hinglish: hablantes que alternan ingles y hindi en la misma frase obtienen texto con cada idioma en su alfabeto correcto y puntuacion devanagari adecuada, algo que los limpiadores genericos suelen romper.
- Transcripcion de notas tecnicas y codigo dictado: la correccion de mayusculas de nombres (API, Postgres) y el manejo de comandos hablados ("new line", "open paren") lo hacen util para dictar documentacion tecnica o borradores de codigo.
- Generacion automatica de listas a partir de habla libre: al dictar un repaso de temas o items contados, el modelo estructura el resultado como lista con vinetas o numeracion, util para actas de reuniones o notas de tareas.
- Procesado por lotes de corpus de dictado: al ser un modelo de 1,7B cuantizado, puede ejecutarse en lote sobre miles de transcripciones cortas (hasta ~1000 tokens de entrada) en hardware modesto, con latencia baja gracias a la decodificacion especulativa n-gram.
- Preservacion fiel de la longitud del dictado: al no resumir ni anadir contenido, es adecuado en flujos donde la fidelidad al discurso original es un requisito (por ejemplo, notas medicas o juridicas dictadas, previa validacion humana).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, GSM8K, evaluaciones de limpieza ni comparativas contra otros modelos; la validacion ofrecida es el uso integrado en la aplicacion Utter.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Qwen Q6_K ocupa 1,42 GB en disco, por lo que es viable con 4 GB de VRAM (o incluso ejecucion en CPU con RAM suficiente); el archivo Gemma Q6_K ocupa 3,26 GB, recomendable con 8 GB de VRAM. Con contexto de 4096 tokens y el drafter MTP adicional (Q8_0), el Gemma necesita algo mas de margen.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU de consumo moderna (RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090, Apple Silicon con memoria unificada) ejecuta ambos archivos sin problema. No se requieren A100 ni H100.
- Consumer GPU: si, ambos archivos caben con holgura en GPUs de consumo; el modelo Qwen puede incluso correr solo en CPU dado su tamano de 1,42 GB.
- Opciones de despliegue: llama.cpp (llama-server, metodo documentado por el autor, con flags de decodificacion especulativa n-gram o draft MTP); por ser GGUF estandar, deberia funcionar tambien en LM Studio, Ollama (importando el archivo) y otros runtimes compatibles. No hay soporte documentado de vLLM ni TGI para estos GGUF.
- Latencia y throughput: no disponibles como cifras; el uso de decodificacion especulativa (n-gram simple en Qwen, MTP en Gemma) indica que el autor optimiza la latencia en cargas de dictado cortas.

## Comparativa con modelos similares

| Aspecto | Utter dictation cleanup (Qwen Q6_K) | Qwen3-1.7B (base) | Gemma 4 E2B-it (base) |
|---|---|---|---|
| Parametros | ~1,7B (GGUF Q6_K) | ~1,7B | ~2-3B (E2B) |
| Contexto | 4096 (uso recomendado ~1000 tokens de entrada) | 32.768 (nativo) | no disponible |
| Tarea | Limpieza especializada de dictado (en/hi) | Chat y razonamiento general | Chat general multimodal |
| Licencia | Apache 2.0 | Apache 2.0 | Licencia Gemma |
| Formato | GGUF | Safetensors y GGUF | Safetensors y GGUF |
| Disponibilidad | Hugging Face (231 descargas) | Hugging Face | Hugging Face |

Frente a sus modelos base, este modelo sacrifica la generalidad (no sirve para chat, traduccion ni resumen) a cambio de un comportamiento muy fiable y determinista en una unica tarea, con temperatura 0 y un system prompt fijo. Frente a alternativas genericas de limpieza de texto basadas en LLM mayores, su ventaja es el tamano: corre en local en un portatil, lo que lo hace adecuado para una aplicacion de dictado de escritorio. No existen en la informacion proporcionada comparativas de calidad publicadas contra otros limpiadores de transcripciones.

## Limitaciones y advertencias

- Tarea unica: no es un modelo de chat general; no reescribe a peticion, no traduce, no resume y no responde preguntas. Usarlo fuera de su caso de uso producira resultados impredecibles.
- Limite de entrada: un dictado de hasta unos 1000 tokens por peticion; textos mas largos habria que trocearlos.
- System prompt obligatorio: debe enviarse exactamente el prompt publicado, byte a byte (incluido el salto de linea final), con temperatura 0; cualquier desviacion puede degradar el comportamiento, ya que el modelo fue entrenado sobre ese prompt concreto.
- Discrepancia de metadatos: los 4,63 mil millones de parametros reportados en safetensors no cuadran con los modelos base declarados ni con el tamano de los GGUF; conviene verificar que archivo se descarga y su SHA-256 (el repo los publica).
- Riesgo de alucinacion: el prompt prohibe anadir o eliminar contenido, pero al tratarse de un LLM afinado no existe garantia absoluta; en usos sensibles (notas medicas, juridicas) se recomienda revision humana.
- Sesgos: no documentados; al derivar de Qwen3 y Gemma, puede heredar sesgos de sus datos de preentrenamiento. El soporte se limita a ingles y hindi; otros idiomas no estan contemplados.
- Correccion agresiva controlada: sustituye palabras mal transcritas solo cuando el contexto la hace segura, pero esa heuristica puede fallar en textos tecnicos ambiguos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion sin restricciones relevantes mas alla de conservar los avisos de licencia. Los modelos base (Qwen3, Apache 2.0; Gemma, licencia propia de Google con terminos adicionales) pueden imponer condiciones distintas si se redistribuyen derivados.
- Proyecto de autor individual con 231 descargas y sin benchmarks publicados: se aconseja validar la calidad en el propio dominio de datos antes de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hpal007/utter-dictation-cleanup-GGUF
- Aplicacion Utter (GitHub): https://github.com/hpal007/utter
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo base Gemma 4 E2B-it: https://huggingface.co/google/gemma-4-E2B-it
- GGUF de Gemma 4 E2B-it con drafter MTP: https://huggingface.co/ggml-org/gemma-4-E2B-it-GGUF
- Paper, blog y demos: no disponibles
