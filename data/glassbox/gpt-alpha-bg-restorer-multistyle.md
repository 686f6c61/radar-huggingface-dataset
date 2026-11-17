# glassbox/gpt-alpha-bg-restorer-multistyle

## Resumen

gpt-alpha-bg-restorer-multistyle es un modelo de lenguaje de tipo GPT entrenado desde cero por el autor independiente glassbox para una tarea muy concreta: convertir texto búlgaro escrito con teclado latino (el fenómeno conocido como shlyokavitsa) de vuelta a cirílico. No es un modelo de propósito general, sino una herramienta especializada de transliteración inversa que opera a nivel de carácter y que, a diferencia de su predecesor gpt-alpha-bg-restorer, admite múltiples estilos de escritura latina por cada letra cirílica.

El modelo tiene 4.736.768 parámetros (4,74 M), una arquitectura transformer decoder-only con 256 dimensiones de embedding, 8 cabezas de atención, 6 capas y un tamaño de bloque de 348 caracteres. Incorpora RoPE, RMSNorm, SwiGLU y embeddings compartidos entre entrada y salida. El vocabulario es de 70 caracteres: los 60 del modelo anterior más los diez dígitos, lo que permite conservar números y palabras latinas en la salida en lugar de transliterarlos.

Su relevancia es acotada pero clara: demuestra que un modelo minúsculo entrenado desde cero y sin inicialización preentrenada puede resolver con alta precisión una tarea de normalización lingüística concreta, superando a un modelo previo del mismo autor en los conjuntos de evaluación publicados (0,96 frente a 0,9233 en coincidencia exacta con el estilo canónico). Es un caso de estudio de especialización extrema frente a modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT), RoPE, RMSNorm, SwiGLU, residuales planos, embedding y cabeza de salida compartidos |
| Parametros totales | 4.736.768 (4,74 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 348 caracteres (block size; prompt, "=" y respuesta juntos) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | búlgaro (bg), en escritura latina de entrada y cirílica de salida |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) más `config.json` con arquitectura y vocabulario de 70 caracteres |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con 256 dimensiones ocultas, 8 cabezas de atención y tamaño de bloque de 348 caracteres. Usa RoPE para la codificación posicional, RMSNorm para la normalización, SwiGLU como activación en el bloque feed-forward, conexiones residuales planas y pesos compartidos entre el embedding de entrada y la cabeza de salida (la cabeza atada se almacena una sola vez bajo el nombre del embedding). El vocabulario es a nivel de carácter: 60 caracteres heredados del modelo anterior más los diez dígitos.

El entrenamiento se realizó desde cero, sin inicialización preentrenada, con AdamW, tasa de aprendizaje 5e-4 con schedule coseno, 20.000 iteraciones y batch de 64, sobre una GPU A10G en Modal. Los datos son frases contiguas de 1 a 8 palabras extraídas de un corpus de libros búlgaros, romanizadas con un estilo de escritura muestreado por frase e inyectando números y palabras latinas. El formato de entrenamiento es `latin=cirilico` seguido de salto de línea. Las proporciones de cada estilo de escritura se contaron a partir de líneas reales de foros escritas en latín, aunque los estilos más raros se apoyan en pocas observaciones. El corpus es texto de terceros y no se redistribuye. La decodificación es greedy simple: se alimenta `texto_escrito + "="` y se toma el argmax carácter a carácter hasta el salto de línea.

## Capacidades

- Transliteración inversa de latín a cirílico para búlgaro, con soporte de múltiples estilos de escritura por letra (por ejemplo, `4` por ч, `6` por ш, `q` por я, además de `j`, `w`, `x`, `y`, `u`, `c` y la romanización canónica con `ch`, `sh`, `sht`, `ya`).
- Conservación de números y palabras latinas sin transliterar: `iphone 15` permanece `iphone 15`.
- Generación de texto a nivel de carácter con decodificación greedy determinista.
- Manejo de entradas cortas en formato `latin=cirilico`, con salida terminada en salto de línea.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad monolingüe: únicamente búlgaro; no hay soporte multilingüe.

## Casos de uso

- Normalización de mensajes en foros y redes sociales: el modelo convierte líneas escritas en shlyokavitsa a cirílico estándar, procesando el texto en fragmentos de unas 5 palabras para respetar la ventana de 348 caracteres.
- Limpieza de corpus para NLP en búlgaro: se puede aplicar como paso de preprocesado sobre textos recogidos de internet escritos con teclado latino, antes de alimentar modelos mayores o pipelines de anotación.
- Corrección de entradas de usuario en buscadores internos: al restaurar el cirílico se pueden generar consultas normalizadas que mejoren la coincidencia con índices en escritura cirílica.
- Preprocesado de datasets de conversación: foros y chats búlgaros contienen mezcla de alfabetos; el modelo unifica la escritura preservando números y términos latinos como marcas o modelos de producto.
- Herramienta de escritorio o extensión de teclado: integrado en un script local, restaura texto pegado escrito en latín antes de enviarlo, con la ventaja de que el modelo cabe holgadamente en cualquier GPU consumer o incluso en CPU.
- Evaluación y docencia lingüística: sirve para ilustrar la ambigüedad а/ъ del búlgaro romanizado y como ejemplo reproducible de especialización de modelos pequeños entrenados desde cero.
- Prototipado de investigación en transliteración: su licencia MIT y su tamaño reducido permiten reentrenarlo o adaptarlo a otros alfabetos o convenciones de escritura con recursos mínimos.

## Benchmarks y rendimiento

Coincidencia exacta (frase completa correcta) sobre 300 frases sintéticas retenidas por conjunto, decodificación greedy, tres semillas de entrenamiento (0, 1, 2), medidas en CUDA (A10G). La columna "anterior" corresponde al modelo gpt-alpha-bg-restorer ejecutado sobre las mismas frases, con los dígitos eliminados de su entrada según su propio paso de limpieza.

| Conjunto | Descripción | Este modelo, semilla 0 | Este modelo, 3 semillas | Modelo anterior |
|---|---|---|---|---|
| canonical | solo la romanización anterior | 0,9600 | 0,9600 - 0,9633 | 0,9233 |
| multi-style | los distintos estilos de escritura | 0,9300 | 0,9200 - 0,9300 | 0,2967 |
| con números y palabras latinas | multi-style más dígitos y palabras latinas | 0,7900 | 0,7700 - 0,7900 | 0 |

En el tercer conjunto, la tasa de conservación sin cambios de números y palabras latinas (passthrough recall) es de 0,8458 para la semilla 0 (0,8358 - 0,8483 entre semillas); el modelo anterior obtiene 0 porque no puede conservarlos. No se publica cifra para la evaluación sobre texto real de foros, ya que la referencia fue generada por modelos, no verificada por humanos, y no se calculó en CUDA.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos en safetensors ocupan unos 19 MB (4,74 M parámetros en fp32) y el repositorio completo mide 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna; el autor entrenó en una NVIDIA A10G y evaluó en la misma. Funciona también en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) y en hardware de gama baja; no requiere aceleración dedicada.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el cargador standalone `model.py` del repositorio github.com/iksnerd/bg-eval; no requiere código de entrenamiento ni pickle. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño del modelo y la decodificación greedy carácter a carácter, la generación es de baja latencia en GPU y aceptable en CPU, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Coincidencia exacta (multi-style) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| gpt-alpha-bg-restorer-multistyle | 4,74 M | 348 caracteres | Transliteración inversa latín-cirílico búlgaro, multistyle | 0,9200 - 0,9300 | MIT | Hugging Face |
| gpt-alpha-bg-restorer | no disponible en la información | no disponible | Transliteración inversa, romanización canónica única | 0,2967 | no disponible en la información | Hugging Face |
| Modelos de traducción generalistas (por ejemplo, NLLB o M2M-100) | cientos de millones a miles de millones | miles de tokens | Traducción multilingüe general | no comparable directamente; no disponible | varía según modelo | Hugging Face |

La comparación directa solo es posible con el predecesor del mismo autor, que queda muy por detrás en estilos múltiples y no conserva números ni palabras latinas. Frente a modelos de traducción generalistas, este modelo es órdenes de magnitud menor y está especializado en una única dirección de transliteración, por lo que la comparación de rendimiento no es homogénea.

## Limitaciones y advertencias

- Los conjuntos de prueba son sintéticos y provienen del mismo muestreador que el entrenamiento, sobre una parte retenida del mismo corpus de libros; miden el ajuste al muestreador, no la lectura de texto escrito por personas reales.
- No hay puntuación verificada por humanos sobre texto real; la evaluación existente no se reporta.
- Las proporciones de los estilos de escritura más raros se apoyan en pocas observaciones y algunas se eligieron en lugar de contarse; los escritores reales pueden escribir de forma distinta.
- Solo se publica la semilla 0, elegida por convención y no por puntuación; una diferencia menor que la dispersión entre semillas no es significativa.
- La ambigüedad а/ъ es inherente: cuando la entrada latina destruyó la distinción, el modelo adivina por contexto, y un fragmento de 5 palabras le da menos contexto que la frase completa.
- Las entradas largas requieren troceado: una sola pasada sobre un texto largo pierde y repite palabras, y más allá de la ventana de 348 caracteres la salida se corta sin error.
- La entrada solo puede contener caracteres del vocabulario (letras latinas minúsculas, dígitos y espacios); cualquier otro carácter provoca un `KeyError` y debe eliminarse o mapearse antes.
- Riesgo de alucinación en la restauración: al adivinar caracteres ambiguos puede producir palabras cirílicas plausibles pero incorrectas.
- Licencia MIT, que permite uso comercial; el corpus de entrenamiento es de terceros y no se redistribuye, por lo que no se puede reproducir el entrenamiento con los datos originales desde este repositorio.
- Modelo monolingüe (búlgaro) y sin capacidades de propósito general; no debe emplearse como generador de texto libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glassbox/gpt-alpha-bg-restorer-multistyle
- Modelo anterior: https://huggingface.co/glassbox/gpt-alpha-bg-restorer
- Cargador standalone y utilidades de evaluación: https://github.com/iksnerd/bg-eval
