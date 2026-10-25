# kingjones777/Flint-40B-A2.5B-ROCmFP4-GGUF

## Resumen

Flint-40B-A2.5B-ROCmFP4-GGUF es una compilación cuantizada en 4 bits del modelo RecursiveSI/flint, un MoE de 39.785.299.488 parámetros totales y aproximadamente 2.500 millones de parámetros activos, orientado a generación de código, uso como agente y tool calling. La publica el usuario kingjones777 y no es un modelo entrenado desde cero, sino una conversión y cuantización del checkpoint `RecursiveSI/flint` (revisión `2a247be0c0aec895ccb0ac7ca92229ec6df37288`), acompañada de una conversión BF16 sin pérdida pensada como fuente para recuantizar.

El interés de esta ficha no está en el modelo base, sino en el trabajo de cuantización: introduce un formato propietario denominado ROCmFP4 (tipos de tensor con identificador mayor o igual que 100) con doble escala de 4,5 bits para los expertos, y una estrategia de protección en 8 bits llamada COHERENT-PAS aplicada a embedding, cabeza de salida, toda la atención, las capas 0 y 1 y los expertos compartidos. El autor justifica ese reparto midiendo que la primera capa de Flint casi cancela el embedding (norma del estado oculto de 4,7 a 1,0), de modo que los errores de redondeo ahí se amplifican.

Todo se construye y se mide sobre una única máquina AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, ROCm 7.2.4, 128 GiB de memoria unificada) con un motor de inferencia propio, Super ROC, porque el `general.architecture` del GGUF es `flint` y llama.cpp estándar no lo reconoce. Es, por tanto, material muy específico de plataforma: relevante para quien investiga cuantización extrema de MoE o despliegue local en hardware AMD Strix Halo, y poco útil fuera de ese nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `flint`: transformer MoE con 49 capas (14 de atención completa sin codificación posicional, 35 de ventana deslizante de 513 tokens con RoPE), attention sinks aprendidos en todas las capas, 256 expertos con enrutado sigmoide y un experto compartido sin compuerta |
| Parametros totales | 39.785.299.488 (39,8 B) |
| Parametros activos | Aproximadamente 2,5 B (MoE) |
| Longitud de contexto | No disponible como máximo oficial; se han medido y publicado cifras con prompts de hasta 16.384 tokens |
| Tipos de cuantizacion | ROCmFP4 (4,5 bits, doble escala) en los expertos; Q8_0 en embedding, cabeza de salida, proyecciones de atención, capas 0-1 y expertos compartidos; BF16 en la conversión sin pérdida; F32 en normas, sinks y router |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un archivo ROCmFP4 y dos shards BF16) |
| Tamano del repositorio | 103,1 GB |
| Archivo principal | `Flint-40B-A2.5B-Q4_0-ROCmFP4-COHERENT-PAS.gguf`, 23,43 GB (4,71 BPW) |
| Conversion BF16 | `Flint-40B-A2.5B-BF16-0000{1,2}-of-00002.gguf`, 79,63 GB en total |
| Plantilla de chat | Incluida en `tokenizer.chat_template`; roles `<\|system\|>`, `<\|developer\|>`, `<\|user\|>`, `<\|assistant\|>`, `<\|observation\|>` |
| Tokens de parada | `<\|end_of_text\|>` (150001), `<\|user\|>` (150003), `<\|observation\|>` (150005), `<\|developer\|>` (150018) |
| Motor de inferencia requerido | Super ROC, rama `flint`, commit `9269f43` (llama.cpp estándar no soporta la arquitectura `flint` ni los tipos ROCmFP4) |
| Muestreo recomendado | temperature 1,0, top-p 0,95, top-k 20 |

## Arquitectura y entrenamiento

La arquitectura `flint` combina atención completa y atención local: 14 de las 49 capas usan atención completa sin codificación posicional, mientras que las otras 35 aplican ventana deslizante de 513 tokens con RoPE. Todas las capas incorporan attention sinks aprendidos, un mecanismo que reserva posiciones de atención «sumidero» para estabilizar el reparto de pesos en secuencias largas. La capa MoE usa 256 expertos con enrutado sigmoide y un experto compartido sin compuerta, lo que explica la relación entre 39,8 B de parámetros totales y unos 2,5 B activos por token.

No se dispone de información sobre el corpus de entrenamiento: no hay datos del número de tokens, composición del dataset ni de si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documenta el proceso de destilado o poda que lleva de 39,8 B totales a 2,5 B activos. Lo que sí está documentado es el post-entrenamiento de esta publicación, que es puramente de compresión: conversión a GGUF con arquitectura `flint` (tensores BF16 escritos en crudo, F32 para normas, sinks y router) y cuantización con `gufo-quant` en modo COHERENT 24, forzando Q8_0 por patrón de nombre de tensor.

La innovación técnica declarada es la protección en 8 bits de las partes sensibles. El autor publica la comparación interna entre una cuantización plana (embedding Q6_K y todo lo demás en ROCmFP4) y la variante COHERENT-PAS: el error del estado oculto tras la capa 0 baja del 36 % al 1,6 %, y la coincidencia de siguiente token con el profesor sube de 28/48 a 46/48 en código, de 119/160 a 150/160 en chat y de 24/48 a 36/48 en prosa. Una variante intermedia (8 bits solo en embedding, cabeza, capas 0-1 y expertos compartidos, atención de las capas 2-48 en 4 bits) decodificaba un 8 % más rápido pero bajaba a 43/48, 141/160 y 32/48, y fue descartada. El modelo abre `<think>` por sí mismo cuando decide razonar; no se documenta si ese comportamiento proviene de entrenamiento específico.

## Capacidades

- Generación de texto conversacional con plantilla de roles que incluye un rol `<\|developer\|>` diferenciado del sistema.
- Generación y continuación de código, con evaluación interna específica sobre Python.
- Razonamiento explícito mediante el bloque `<think>`, que el modelo abre de forma autónoma.
- Tool calling con sintaxis propia: `<tool_call>NAME<arg_key>K</arg_key><arg_value>V</arg_value></tool_call>`.
- Uso como agente: el autor lo prueba con un banco de agentes y observa turnos que agotan el límite de 8.192 tokens de salida.
- Soporte de observaciones de herramientas mediante el rol `<\|observation\|>` y el token de parada 150005, lo que permite bucles multi-paso.
- Compatibilidad declarada con endpoints (etiqueta `endpoints_compatible`), sin más detalle en la información disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma concreto.
- Sin visión, audio ni otras modalidades: la información disponible solo cubre text-generation.

## Casos de uso

- Agente de código local en un equipo Strix Halo: con 23,43 GB de pesos y 128 GiB de memoria unificada, el modelo cabe holgadamente y permite ciclos de edición-ejecución sin depender de la nube; la ventana deslizante de 513 tokens en 35 capas mantiene el coste de atención contenido en sesiones largas de refactorización.
- Automatización de terminal y shell: el modelo escribe llamadas con nombre de herramienta y pares clave-valor, y el autor demuestra que una gramática restringida a las claves del esquema corrige el fallo de escribir `command` cuando el esquema pedía `cmd`, algo crítico en scripts que ejecutan comandos reales.
- Servidor HTTP de inferencia en local: el autor reporta 58,6 tok/s en una respuesta de 451 tokens y 51,9 tok/s en una tool call de 159 tokens bajo gramática, cifras suficientes para un asistente interactivo de un solo usuario.
- Sustituto del checkpoint BF16 en pruebas de integración: al ocupar 23,43 GB frente a 79,63 GB, permite validar plantillas, tokens de parada y gramáticas de herramientas en máquinas con menos memoria antes de pasar a BF16.
- Investigación en cuantización de MoE: la publicación incluye el comando de reproducción con `gufo-quant`, la lista de tensores protegidos y métricas de acuerdo con el profesor, lo que sirve como caso de estudio de cuantización selectiva y de su efecto en capas con normas de estado oculto anómalas.
- Recuantización a otros formatos: los dos shards BF16 son una conversión sin pérdida verificada por muestreo de seis tensores (incluido un experto apilado, los sinks, la cabeza de salida y el embedding), por lo que sirven como fuente fiable para generar otras cuantizaciones.
- Evaluación de motores de inferencia: al requerir la arquitectura `flint`, el archivo es útil para probar la implementación de Super ROC frente a la implementación de referencia en PyTorch float32 del código SGLang de los autores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas son internas del autor, medidas contra una implementación de referencia en PyTorch float32 ejecutando los pesos BF16 sobre el código SGLang de los autores.

| Metrica | Este archivo (ROCmFP4 COHERENT-PAS) | Referencia BF16 |
|---|---|---|
| Acuerdo con el profesor, continuación de Python (48 tokens) | 46/48 (95,8 %) | — |
| Acuerdo con el profesor, respuesta de chat con razonamiento (160 tokens) | 150/160 (93,8 %) | — |
| Perplejidad en código Python (3 ventanas de 2.048 tokens, segunda mitad puntuada) | 6,57 token a token / 6,59 con prompt por lotes | 7,48 |
| Perplejidad en texto técnico mixto largo (2 ventanas de 4.096 tokens) | 44,97 | 47,04 |

| Prompt (tokens) | Procesamiento de prompt | Generación (128 tokens) |
|---:|---:|---:|
| 512 | 1.119 tok/s | 58,9 tok/s |
| 4.096 | 1.734 tok/s | 52,7 tok/s |
| 16.384 | 1.539 tok/s | 41,6 tok/s |

El autor señala explícitamente que la perplejidad del archivo cuantizado es inferior a la del BF16 en ambos corpus y lo atribuye a los pesos cuantizados y no al motor, apoyándose en que la referencia PyTorch sobre los pesos desquantizados reproduce el efecto (9,16 frente a 12,71 en media ventana de código de 2.048 tokens). En una muestra de código de 1.100 tokens, la pérdida media por token del motor queda entre un 0,3 % (primeras 512 posiciones) y un 2,3 % de esa referencia desquantizada. También advierte que Flint es un modelo de chat y agente, y que su perplejidad sobre prosa cruda es alta a cualquier precisión.

## Requisitos de hardware

- Memoria: 23,43 GB solo para los pesos del archivo ROCmFP4; hay que sumar caché KV para contexto largo, no cuantificada en la información disponible. La conversión BF16 requiere 79,63 GB.
- Plataforma medida: AMD Ryzen AI Max+ 395 «Strix Halo», gfx1151, ROCm 7.2.4, 128 GiB de memoria unificada. Es la única configuración con cifras publicadas.
- GPU NVIDIA: no viable con el software actual, ya que los tipos ROCmFP4 (identificador mayor o igual que 100) y la arquitectura `flint` no existen en llama.cpp estándar; no se documenta soporte CUDA.
- GPU de consumo: no se han publicado pruebas en RTX 4090, RTX 3090 ni similares. Con 23,43 GB de pesos, una GPU de 24 GB quedaría sin margen para caché KV aunque existiera soporte.
- Motores de despliegue: exclusivamente Super ROC, rama `flint`, commit `9269f43`. No hay soporte en vLLM, TGI, Ollama ni llama.cpp estándar según la información disponible. El modelo base sí tiene código de modelo SGLang de los autores (`flint_sglang/model.py`), usado como referencia, pero no se indica que cargue este GGUF.
- Rendimiento: 1.119-1.734 tok/s de procesamiento de prompt y 41,6-58,9 tok/s de generación en la configuración medida, con caída del throughput de generación a medida que crece el prompt (58,9 tok/s con 512 tokens frente a 41,6 tok/s con 16.384).
- Configuración del servidor: hay que forzar la parada en los cuatro tokens EOS, porque el GGUF solo declara `eos_token_id` 150001, y limitar `max_tokens` de forma explícita (en una prueba de agente un solo turno agotó el tope de 8.192 tokens).

## Comparativa con modelos similares

No se dispone de datos de otros modelos de la misma categoría en la información proporcionada, por lo que la comparación con alternativas externas se marca como no disponible. La única comparación con cifras es interna, entre las variantes publicadas y la referencia:

| Variante | Precision | Tamano | Acuerdo con el profesor (codigo / chat / prosa) | Estado |
|---|---|---:|---|---|
| COHERENT-PAS (este archivo) | Expertos ROCmFP4 4,5 bits; embedding, salida, atención, capas 0-1 y expertos compartidos Q8_0 | 23,43 GB | 46/48 · 150/160 · 36/48 | Publicada |
| COHERENT con embedding Q6_K | Todo ROCmFP4 salvo embedding Q6_K | No disponible | 28/48 · 119/160 · 24/48 | Descartada |
| Proteccion ligera | 8 bits solo en embedding, salida, capas 0-1 y expertos compartidos | No disponible (8 % mas rapida en decodificacion) | 43/48 · 141/160 · 32/48 | Descartada |
| Conversion BF16 | BF16 sin perdida | 79,63 GB | Referencia | Publicada |

Frente al checkpoint original `RecursiveSI/flint` en safetensors, este archivo ocupa 23,43 GB en lugar de los 79,63 GB de la conversión BF16, es decir, una reducción de aproximadamente 3,4 veces, y exige a cambio un motor específico.

## Limitaciones y advertencias

- Dependencia de un motor no estándar: sin Super ROC (rama `flint`) o una implementación equivalente de la arquitectura `flint` y de los tipos ROCmFP4, el archivo no carga. Esto lo excluye de facto de llama.cpp, Ollama, vLLM y TGI en el momento de publicación.
- Plataforma única: todas las cifras proceden de un solo equipo gfx1151 con ROCm 7.2.4 y 128 GiB de memoria unificada. No hay evidencia de comportamiento en otras GPU ni en CPU.
- Token de parada incompleto: el GGUF declara un único `eos_token_id` (150001), pero el modelo usa cuatro tokens de parada. Un servidor mal configurado generará texto de más o invadirá turnos siguientes.
- Tool calling frágil sin gramática: a temperatura 0 y sin restricción, el modelo inventó el nombre de argumento `command` cuando el esquema pedía `cmd`. El propio autor recomienda servir con gramática limitada a los nombres y claves de la petición.
- Perplejidad alta en texto técnico largo: 44,97 sobre ventanas de 4.096 tokens, coherente con un modelo afinado para chat y agente más que para modelado de prosa o documentos largos.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación; el uso como agente con acceso a herramientas exige validación externa de las llamadas.
- Idiomas: no se declara ningún idioma soportado, por lo que no hay garantía de calidad en castellano ni en otras lenguas distintas del inglés.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Validez de las métricas: las cifras de calidad y velocidad son autodeclaradas por el autor, sin replicación independiente, y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- Anomalía no explicada del todo: que el archivo cuantizado obtenga menor perplejidad que el BF16 se justifica con una referencia PyTorch sobre pesos desquantizados, pero conviene tratarlo como resultado de un corpus concreto y no como una mejora general de calidad.
- Licencia: el repositorio declara apache-2.0, pero al ser una cuantización del checkpoint `RecursiveSI/flint` conviene verificar la licencia del modelo base antes de un uso comercial.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; toda la información procede de la model card y de los metadatos de HuggingFace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Flint-40B-A2.5B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Revision del checkpoint de origen citada: `2a247be0c0aec895ccb0ac7ca92229ec6df37288`
- Motor de inferencia Super ROC: rama `flint`, commit `9269f43` (no se ha proporcionado URL en la informacion disponible)
- Codigo de referencia del modelo de los autores: `flint_sglang/model.py` (no se ha proporcionado URL en la informacion disponible)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
