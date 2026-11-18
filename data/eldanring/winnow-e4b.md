# EldanRing/Winnow-E4B

## Resumen

Winnow-E4B es un ajuste fino (fine-tune) del modelo multimodal Gemma 4 E4B IT de Google, desarrollado por EldanRing. Su particularidad es que no es un modelo generativo al uso: está especializado en emitir decisiones tipadas (typed decisions). El usuario le proporciona un estado compartido y una pregunta con opciones de respuesta conocidas, y el modelo puntúa cada candidata sin generar una explicación en lenguaje natural. Esto lo convierte en una pieza orientada a sistemas de enrutamiento, selección de acciones y clasificación condicionada.

El modelo se distribuye exclusivamente en formato GGUF (Q8_0 y BF16) junto con un proyector de visión F16 separado, lo que facilita la inferencia local. El repositorio ocupa 24,2 GB e incluye tanto los pesos del modelo de lenguaje como el proyector multimodal. La arquitectura subyacente es la de Gemma 4 E4B IT, con aproximadamente 78 millones de parámetros según los datos de safetensors, aunque el tamaño del repositorio y de los ficheros GGUF (8,01 GB en Q8_0, 15,05 GB en BF16) sugiere que la cifra de parámetros publicada no refleja el total real del modelo.

La relevancia actual de Winnow-E4B radica en su enfoque: separar la toma de decisiones de la generación de texto permite obtener latencias muy bajas (147,8 decisiones por segundo en una RTX 5070 Ti con carga de 8K) y probabilidades calibradas sobre opciones discretas. Está pensado para integrarse en pipelines de agentes y sistemas de enrutamiento donde la explicación textual es coste innecesario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E4B IT), ajuste fino para decisiones tipadas |
| Parametros totales | 77.993.732 (dato de safetensors; no coherente con el tamano de los GGUF) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 65.023 posiciones observadas en pruebas con imagen; 64K en sondas de vision y chat |
| Tipos de cuantizacion | Q8_0, BF16 (pesos); cache K/V en F16 por defecto, Q8_0 opcional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0 y BF16) + proyector de vision F16 (mmproj) |

## Arquitectura y entrenamiento

Winnow-E4B es un fine-tune del modelo base google/gemma-4-E4B-it, que combina un modelo de lenguaje con un codificador visual para entrada image-text-to-text. El ajuste no añade un adaptador separado: los GGUF publicados contienen el fine-tune ya fusionado, de modo que no es necesario descargar el modelo base ni un adaptador adicional. Para entrada de imagen se utiliza el proyector de visión correspondiente (mmproj-Winnow-E4B.gguf, F16, 990 MB).

El entrenamiento está orientado a un formato de decisión tipado con tres tipos de pregunta: `noul` (pregunta sí/no, devuelve probabilidad de `true`), `choice` (opciones nombradas con descripciones opcionales, devuelve opción seleccionada, probabilidades y confianza) y `score` (niveles ordenados, devuelve probabilidades por nivel, puntuación esperada y confianza). Las preguntas comparten un prefijo de estado que puede reutilizarse desde caché. El autor menciona etiquetas de profesor sintéticas para el panel de decisiones tipadas y un proceso de calibración de temperatura (1,2574172017327816 para Q8 y 1,3331553765162731 para BF16, ajustadas sobre 778 preguntas). También existe un modo de razonamiento adaptativo que genera contexto antes de repuntuar la pregunta, con mejora de Brier de 0,524807 a 0,481402 y de NLL de 1,591870 a 1,385153 en una evaluación calibrada 50:50. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Decisiones tipadas: puntuación de opciones discretas (`noul`, `choice`, `score`) con probabilidades y medida de confianza.
- Enrutamiento de peticiones y selección de acciones a partir de un estado compartido.
- Verificación de condiciones y clasificación de urgencia.
- Chat conversacional ordinario mediante el endpoint `/v1/chat/completions`, con streaming.
- Entrada de imagen a través del proyector de visión (pipeline image-text-to-text).
- Reutilización de prefijo de estado en caché para múltiples preguntas sobre el mismo contexto.
- Razonamiento adaptativo opcional: genera contexto antes de repuntuar una decisión.
- Decodificación especulativa con un asistente MTP fijado que comparte la caché K/V del modelo objetivo.
- Compatibilidad con endpoints estilo OpenAI (`/v1/systemone` para decisiones, `/v1/chat/completions` para chat).

## Casos de uso

- Enrutamiento de peticiones en sistemas multiagente: dado un estado de conversación y un conjunto de rutas posibles, el modelo devuelve la ruta seleccionada con probabilidades, lo que permite umbrales de confianza y derivación a un humano cuando la concentración es baja.
- Selección de acciones en agentes: con las acciones disponibles como opciones nombradas, el modelo puntúa cada una sin generar texto, reduciendo la latencia en bucles de decisión donde se encadenan muchas elecciones por segundo.
- Verificación de condiciones en pipelines: preguntas sí/no (`noul`) sobre un estado compartido para decidir si se cumple una precondición antes de ejecutar un paso, con probabilidad de `true` como señal.
- Clasificación de urgencia: uso del tipo `score` con niveles ordenados para asignar prioridad a tickets o alertas, con puntuación esperada y confianza por nivel.
- Procesamiento de documentos con imagen: gracias al proyector de visión y la ventana de hasta 65K posiciones, se puede cargar una imagen de documento como estado y lanzar múltiples preguntas tipadas reutilizando el prefijo en caché (129–131 ms por pregunta tras un primer request de 11,59 s).
- Chat local con soporte de imagen: despliegue en estación de trabajo con GGUF Q8_0 para conversación y consultas visuales, con generación de 512 tokens a 71,2 tokens/s en un prompt multimodal de 62.431 posiciones.
- Calibración de políticas de decisión: el modelo expone probabilidades y confianza, lo que permite ajustar umbrales y comparar contra etiquetas de referencia en paneles propios.

## Benchmarks y rendimiento

| Evaluacion | Winnow-E4B Q8 | Winnow-12B Q8 |
|---|---:|---:|
| JevBench subconjunto publico, 231 preguntas | 80,52% (186/231) | 85,71% (198/231) |
| Kev v9 clean, 1.046 preguntas | 72,66% | 81,45% |
| Kev v9 additional, 390 preguntas | 55,90% | 68,97% |
| Decisiones tipadas locales, 2.000 decisiones | 72,30% | 70,10% |

Rendimiento medido en RTX 5070 Ti 16 GB: 147,8 decisiones/s para E4B Q8 frente a 67,2 decisiones/s para 12B Q8, con 64 preguntas por petición, mediana de diez peticiones en caliente con pesos Q8 y caché K/V Q8. Memoria pico observada: 8,56 GiB en carga de decisión de texto de 8K (se sugiere GPU de 10 GB o más) y 10,72 GiB en sondas de visión y chat de 64K (se sugiere 12 GB o más). En un prompt multimodal de 62.431 posiciones se generaron 512 tokens a 71,2 tokens/s.

## Requisitos de hardware

- VRAM estimada: 8,56 GiB para carga de decisión de texto de 8K con Q8; 10,72 GiB para sondas de visión y chat de 64K con Q8.
- GPU recomendadas: RTX 5070 Ti 16 GB (mediciones publicadas); se sugiere capacidad de 10 GB o más para texto y 12 GB o más para visión y chat.
- Cabe en GPU de consumo: sí, con Q8_0 en tarjetas de 12 GB o más para uso multimodal; BF16 requiere más memoria (fichero de 15,05 GB).
- Opciones de despliegue: servidor de inferencia propio del autor (winnow-inference) con endpoints `/v1/systemone` y `/v1/chat/completions`; formato GGUF compatible con el ecosistema llama.cpp. No se detallan integraciones con vLLM, TGI u Ollama.
- Latencia: 129–131 ms por pregunta en caché sobre un estado de imagen de 65.023 posiciones tras un primer request de 11,59 s; tiempo medio HTTP directo de 37 ms y 234 ms para el router completo en un flujo histórico concreto.
- Throughput: 147,8 decisiones/s con 64 preguntas por petición en RTX 5070 Ti.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en decisiones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Winnow-E4B | 77,99 M (segun safetensors) | hasta 65.023 posiciones observadas | 80,52% JevBench; 72,66% Kev clean; 72,30% typed local | Apache 2.0 | GGUF en Hugging Face |
| Winnow-12B | no disponible | no disponible | 85,71% JevBench; 81,45% Kev clean; 70,10% typed local | no disponible | referenciado por el autor |
| Gemma 4 E4B IT | no disponible | no disponible | no disponible | no disponible | modelo base en Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría (modelos de decisión tipada) en la información proporcionada.

## Limitaciones y advertencias

- El modelo puntúa opciones condicionadas al conjunto suministrado: la confianza mide concentración de probabilidad, no corrección garantizada.
- Los paneles Jev, Kev y Typed son conjuntos congelados usados durante el desarrollo, por lo que las cifras pueden estar optimizadas respecto a esos datos.
- El resultado de JevBench es precisión sobre el subconjunto público, no la puntuación compuesta del leaderboard.
- El modo de razonamiento adaptativo mejora la calibración pero puede degradar el acuerdo con etiquetas de profesor: una receta histórica no calibrada perdió 57 acuerdos tipados (1.447 a 1.390 sobre 2.000).
- La cifra de parámetros publicada (77,99 M) no es coherente con el tamaño de los ficheros GGUF; conviene verificar el total real antes de planificar memoria.
- No se especifican los idiomas soportados; el comportamiento multilingüe no está documentado.
- No se detallan sesgos conocidos ni tasas de alucinación en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 E4B IT puede tener sus propias condiciones que conviene revisar.
- La temperatura de calibración está ajustada por perfil de ejecución (Q8 y BF16 tienen valores distintos); usar el valor de otro perfil altera las probabilidades.
- El despliegue depende del servidor de inferencia del autor; no se documentan integraciones con otros runtimes más allá del formato GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EldanRing/Winnow-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Quickstart: https://github.com/EldanRing/winnow-inference/blob/main/docs/QUICKSTART.md
- Codigo de inferencia: https://github.com/EldanRing/winnow-inference
- Referencia de API: https://github.com/EldanRing/winnow-inference/blob/main/docs/API.md
- Benchmarks: docs/BENCHMARKS.md (en el repositorio del modelo)
- Evaluaciones de razonamiento: docs/REASONING.md (en el repositorio del modelo)
- Perfiles de ejecucion: docs/RUNTIME-PROFILES.md (en el repositorio del modelo)
- Sumas de verificacion: https://huggingface.co/EldanRing/Winnow-E4B/blob/main/SHA256SUMS
- Descarga Q8_0: https://huggingface.co/EldanRing/Winnow-E4B/resolve/main/gguf/Winnow-E4B-Q8_0.gguf?download=true
- Descarga BF16: https://huggingface.co/EldanRing/Winnow-E4B/resolve/main/gguf/Winnow-E4B-BF16.gguf?download=true
- Proyector de vision: https://huggingface.co/EldanRing/Winnow-E4B/resolve/main/gguf/mmproj-Winnow-E4B.gguf?download=true
