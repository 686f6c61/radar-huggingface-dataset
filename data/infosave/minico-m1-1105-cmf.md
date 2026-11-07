# infosave/Minico-M1-1105-cmf

## Resumen

Minico M1 1105 es un modelo de lenguaje de 350 millones de parámetros orientado a razonamiento, desarrollado por Mincofficial y afinado a partir de LFM2.5-350M de LiquidAI. Su arquitectura combina capas de convolución corta con capas de atención (10 convolucionales y 6 de atención) y admite una ventana de contexto de 128.000 tokens. El modelo incorpora un modo de razonamiento explícito delimitado por etiquetas `<think>`, cinco niveles de esfuerzo de razonamiento (`off`, `low`, `medium`, `high`, `max`) y capacidad de invocación de herramientas.

La ficha que nos ocupa, `infosave/Minico-M1-1105-cmf`, no es el modelo original sino una conversión cuantizada al formato CMF para el motor de inferencia `cortiq`, escrito en Rust y sin dependencias de Python ni de frameworks de aprendizaje automático. Se distribuye en dos variantes principales: `q8_2f` (8 bits, 367 MB) y `q4tp` (4 bits, 197 MB), además de un fichero «turbo» que mantiene los pesos de 8 bits pero introduce un mecanismo de atención de campo lejano para prompts largos.

La relevancia de esta conversión radica en que permite ejecutar un modelo con contexto de 128.000 tokens en hardware de consumo —desde Apple Silicon vía Metal hasta GPUs NVIDIA, AMD e Intel vía Vulkan/DX12, o directamente en CPU— con un peso en disco inferior a 400 MB y velocidades de decodificación superiores a 150 tokens por segundo en un MacBook Air M4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido LFM2 (10 capas de convolución corta + 6 capas de atención) |
| Parametros totales | 350 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | 8 bits (`q8_2f`, `turbo`) y 4 bits (`q4tp`) en formato CMF; bf16 original en Transformers |
| Idiomas soportados | en, ru, zh |
| Licencia | lfm1.0 (etiquetada como «other» en Hugging Face) |
| Formato de pesos | CMF (cortiq); el modelo base en safetensors/Transformers |

## Arquitectura y entrenamiento

El modelo base es un LFM2 de LiquidAI con 350 millones de parámetros, compuesto por 10 capas de convolución corta y 6 capas de atención, y entrenado con una ventana de contexto de 128.000 tokens. Mincofficial lo afina para tareas de razonamiento, añadiendo un modo de pensamiento explícito (`<think>`) con cinco niveles de esfuerzo configurables y soporte de tool calling. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La conversión a CMF es exacta a nivel de f16: según la model card, una conversión f16 del checkpoint coincide posición por posición con Transformers (perplejidad 62,441 frente a 62,441 y top-1 del 100 %), y las respuestas greedy son idénticas en texto en todos los niveles de esfuerzo. El fichero «turbo» introduce una innovación destacable: para prompts de más de 8.192 tokens, las 6 capas de atención pasan a un «campo lejano» en el que las primeras 4 filas y las últimas 1.800 permanecen exactas y el resto se representa mediante 32 puntos de referencia (landmarks) por cabeza, de modo que el coste por token deja de crecer con la longitud del texto. Además, un mecanismo de puntuación selecciona las 248 filas más relevantes para mantenerlas exactas, lo que preserva hechos plantados (contraseñas, códigos) en el contexto largo. Este campo lejano es objeto de una solicitud de patente estadounidense (No. 19/738,763).

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso con modo de pensamiento explícito entre etiquetas `<think>`.
- Cinco niveles de esfuerzo de razonamiento (`off`, `low`, `medium`, `high`, `max`), ajustables por parámetro en tiempo de inferencia.
- Invocación de herramientas (tool calling / function calling), con soporte completo en `cortiq serve` a partir de la versión posterior a 0.8.62.
- Razonamiento multi-paso y resolución de problemas aritméticos sencillos (el ejemplo de la model card resuelve correctamente `5 + 5 x 5 = 30`).
- Capacidades multilingües limitadas a inglés, ruso y chino.
- Manejo de contexto largo de hasta 128.000 tokens, con la variante «turbo» optimizada para prompts extensos.
- Ejecución en dispositivos edge: Apple Silicon (Metal), GPUs NVIDIA, AMD e Intel (Vulkan/DX12) y CPU.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo cabe en menos de 400 MB y decodifica a más de 150 tok/s en un MacBook Air M4, lo que permite integrarlo en aplicaciones de escritorio o móviles sin conexión a la nube.
- Procesamiento de documentos largos con la variante turbo: gracias al campo lejano y a las 248 filas exactas, puede resumir o extraer datos de prompts de hasta 128.000 tokens manteniendo la información crítica (códigos, contraseñas) con una tasa de acierto superior a la atención exacta en el benchmark de la model card (4 de 8 frente a 3 de 8).
- Automatización de tareas con tool calling: en un servidor `cortiq serve`, el modelo puede encadenar llamadas a funciones para consultar APIs, gestionar calendarios o ejecutar acciones en pipelines internos.
- Razonamiento matemático y lógico ligero: adecuado para tutores educativos o validadores automáticos de respuestas que requieran trazas de razonamiento auditables mediante el bloque `<think>`.
- Procesamiento de texto multilingüe en inglés, ruso y chino: traducción asistida, clasificación o extracción de entidades en estos tres idiomas en entornos con recursos limitados.
- Prototipado e investigación en entornos sin GPU: la inferencia en CPU a 164 tok/s (q8_2f) permite experimentar con razonamiento y tool calling en portátiles convencionales sin acelerador dedicado.
- Despliegue en sistemas embebidos o contenedores mínimos: al no requerir Python ni frameworks de ML, el binario de `cortiq` más el fichero CMF constituyen un artefacto de despliegue muy ligero.

## Benchmarks y rendimiento

Calidad de cuantización (perplejidad sobre los primeros 4.096 tokens de wikitext-2 test):

| Fichero | Pesos | Tamano | Perplejidad wikitext-2 | Top-1 vs original |
|---|---|---:|---:|---:|
| `q8_2f` | 8 bits | 367 MB | 62,14 | 94,1 % |
| `turbo` | 8 bits | 360 MB | 62,14 | 94,1 % |
| `q4tp` | 4 bits | 197 MB | 71,49 | 58,6 % |
| bf16 original (Transformers) | — | 709 MB | 62,44 | — |

Rendimiento en MacBook Air M4 (24 GB), `cortiq bench --core`, 128 tokens tras un prompt corto:

| Fichero | Metal (tok/s) | CPU (tok/s) |
|---|---:|---:|
| `q8_2f` | 158 | 164 |
| `q4tp` | 276 | 199 |

Rendimiento con prompts largos (MacBook Air M4, Metal, greedy, `--no-think`, 128 tokens de resumen):

| Prompt (tokens) | Primer token, s (estándar) | Primer token, s (turbo) | Decodificación, tok/s (estándar) | Decodificación, tok/s (turbo) | Memoria pico, GB (estándar) | Memoria pico, GB (turbo) |
|---:|---:|---:|---:|---:|---:|---:|
| 1.000 | 0,9 | 0,9 | 155 | 153 | 0,32 | 0,32 |
| 4.000 | 3,6 | 3,6 | 137 | 138 | 0,59 | 0,59 |
| 16.000 | 19,8 | 24,5 | 92,2 | 122 | 1,30 | 1,05 |
| 32.000 | 56,5 | 61,2 | 65,1 | 104 | 1,95 | 1,75 |
| 64.000 | 183 | 193 | 38,6 | 106 | 3,69 | 3,38 |

Calidad en contexto largo: con hechos de cuatro tipos (clave de paso, código de acceso, contraseña y número de habitación) plantados en 100.000 caracteres de Wikipedia (~23.000 tokens) y preguntados al final, el fichero estándar acierta 3 de 8, el turbo 4 de 8 y un campo lejano sin filas exactas 0 de 8. La perplejidad en las filas posteriores al sello, en dos ventanas de 16.384 tokens, es de 37,6 con atención exacta y 42,4 con campo lejano.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia con contexto corto en `q8_2f` (0,32 GB de memoria pico a 1.000 tokens); aproximadamente 1,05-1,30 GB a 16.000 tokens; 3,38-3,69 GB a 64.000 tokens.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon), Vulkan o DX12 (NVIDIA, AMD, Intel). No se especifican modelos concretos como A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con más de 4 GB de memoria; también funciona íntegramente en CPU.
- Opciones de despliegue: motor `cortiq` (CLI `cortiq run` y servidor `cortiq serve`); el modelo base puede ejecutarse con Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer token en 0,9 s con prompt de 1.000 tokens y 183-193 s con 64.000 tokens; decodificación de 38,6 a 158 tok/s según longitud de contexto y dispositivo (datos de MacBook Air M4).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Minico M1 1105 (CMF) | 350 M | 128.000 | lfm1.0 | CMF / cortiq | Cuantización 8 y 4 bits, razonamiento con niveles de esfuerzo, tool calling |
| Minico M1 1105 (base) | 350 M | 128.000 | lfm1.0 | safetensors / Transformers | Modelo original bf16, 709 MB |
| LFM2.5-350M (LiquidAI) | 350 M | no disponible | no disponible | no disponible | Modelo del que deriva el afinado |
| Campo lejano sin filas exactas | 350 M | 128.000 | — | CMF / cortiq | Variante experimental citada en la model card; 0 de 8 en el test de hechos plantados |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- El modelo base tiene solo 350 M de parámetros: la model card reconoce que «un modelo de 350M falla algunos» hechos incluso con atención exacta, y en el test de contexto largo solo acierta 3-4 de 8 hechos plantados.
- La cuantización a 4 bits (`q4tp`) degrada notablemente la calidad: top-1 del 58,6 % frente al original y perplejidad de 71,49 frente a 62,44. Se recomienda `q8_2f` salvo que el tamaño sea crítico.
- El campo lejano del fichero turbo es objeto de una solicitud de patente estadounidense; su uso comercial puede estar sujeto a restricciones adicionales no detalladas.
- La licencia `lfm1.0` está etiquetada como «other»; es necesario consultar el fichero LICENSE del repositorio para conocer las condiciones exactas de uso comercial.
- Cobertura lingüística limitada a inglés, ruso y chino; no se garantiza un rendimiento adecuado en castellano.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en razonamiento multi-paso y matemáticas complejas.
- Los niveles de esfuerzo distintos de `medium`/`off`, el tool calling en `cortiq serve` y las filas exactas del fichero turbo en Apple Silicon requieren versiones de `cortiq` posteriores a 0.8.62 (pull request #93), lo que limita su disponibilidad en el momento de la publicación.
- El fichero estándar necesita `CMF_MAX_SEQ=70000` para prompts de 64.000 tokens; el turbo no requiere configuración adicional hasta 128.000 tokens.
- El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/infosave/Minico-M1-1105-cmf
- Modelo base: https://huggingface.co/Mincofficial/Minico-M1-1105
- Repositorio del motor CMF/cortiq: https://github.com/infosave2007/cmf
- Pull request #93 de CMF: https://github.com/infosave2007/cmf/pull/93
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Demo del conversor CMF en Hugging Face Spaces: https://huggingface.co/spaces/infosave/cmf-converter
