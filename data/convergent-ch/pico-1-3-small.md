# Convergent-ch/Pico-1.3-Small

## Resumen

Pico 1.3 Small es un modelo de lenguaje conversacional de 11.088 parámetros publicado por Convergent (Convergent-ch) bajo licencia Apache 2.0. No es un modelo destinado a producción: el propio autor lo describe como un experimento para medir cuánto puede aprender un modelo extremadamente pequeño y en qué punto deja de aprender. La respuesta a esa pregunta es contundente: el modelo alcanza su praktisch límite alrededor de los 5 minutos de entrenamiento y, a partir de ahí, la pérdida de validación apenas mejora 0,05 en los 30 minutos restantes.

Arquitectónicamente es un decoder estilo Llama con solo 2 capas, dimensión oculta de 16, MLP de 40 y 2 cabezas de atención de dimensión 8, con contexto de 256 tokens y un vocabulario de 320 tokens (BPE a nivel de byte). El resultado es un artefacto de 33 KB en formato GGUF y 0,0 GB de repositorio en HuggingFace, entrenado durante unos 36 minutos en una única RTX 3060 Ti a aproximadamente 1 millón de tokens por segundo.

Su relevancia es divulgativa y metodológica, no funcional: sirve como caso extremo para estudiar dinámicas de entrenamiento, tokenizadores minimalistas,布 pipelines de inferencia y el efecto de sobrentrenar con ratios de 220.000 tokens por parámetro (frente a la regla habitual de 20). El autor advierte explícitamente de que no produce respuestas con sentido: emite palabras reales en inglés, fragmentos de frase y su propio nombre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (RMSNorm, SwiGLU, RoPE, embeddings atados) |
| Parámetros totales | 11.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (se distribuye GGUF de 33 KB y safetensors; el autor no detalla los tipos de cuantización) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Capas | 2 |
| Dimensión oculta | 16 |
| Dimensión del MLP | 40 |
| Cabezas de atención | 2 (dimensión por cabeza: 8) |
| Vocabulario | 320 (BPE a nivel de byte: 256 bytes, 8 tokens especiales, 56 merges) |
| Pipeline | text-generation |
| Librería | transformers (compatible con text-generation-inference y endpoints) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-22 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder de estilo Llama con las decisiones de diseño clásicas de esa familia: normalización RMSNorm, activación SwiGLU en el MLP, embeddings posicionales rotatorios (RoPE) y embeddings de entrada y salida atados. La profundidad es de 2 capas con una dimensión oculta de 16 y un MLP de 40, lo que da un modelo de 11.088 parámetros. El tokenizador es un BPE a nivel de byte con 320 entradas: los 256 bytes posibles, 8 tokens especiales y solo 56 merges. Esta decisión implica que el modelo trabaja casi token a token sobre bytes, por lo que las métricas de pérdida y precisión de siguiente token no son comparables con las de modelos que usan vocabularios de decenas de miles de entradas. El contexto máximo es de 256 tokens.

El entrenamiento se realizó sobre 96.591 conversaciones cortas (mensaje de usuario inferior a 200 caracteres, respuesta inferior a 240) tomadas de los primeros turnos de TinyDialogues (MIT, generado con GPT-4 por sus autores), Everyday Conversations y Smol-SmolTalk (Apache 2.0, generados con Llama 3.1 por sus autores), más 4.000 conversaciones de plantilla sobre su nombre y su creador. Se ejecutaron 150.000 pasos de 64 × 256 tokens con AdamW, learning rate de 5e-3 con decaimiento coseno y precisión bf16, en una RTX 3060 Ti durante aproximadamente 36 minutos a ~1 millón de tokens por segundo, lo que suma unos 2.500 millones de tokens vistos (unas 220.000 veces el número de parámetros). No se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, ni innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés a nivel de fragmento: produce palabras y frases cortas reales, sin coherencia semántica sostenida.
- Reproducción de identidad: responde con su nombre y creador en prompts directos ("Who made you?" → "I'm Pico 1.3 Small, Convergent.").
- Conversación de un turno muy corto: entrenado sobre primeros turnos de diálogo, con contexto limitado a 256 tokens.
- Seguimiento de plantilla de chat mediante `apply_chat_template` y tokens especiales de rol.
- Inferencia en formato GGUF vía Ollama y en formato safetensors vía transformers.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión, audio, matemáticas fiables ni modo "thinking".
- Multilingüismo: únicamente inglés; el vocabulario de 320 tokens no está diseñado para otras lenguas y el corpus de entrenamiento es anglófono.

## Casos de uso

- Test unitario de pipelines de inferencia: por su tamaño (33 KB en GGUF) permite verificar en segundos que un despliegue con Ollama, llama.cpp o transformers carga el modelo, aplica la plantilla de chat y devuelve tokens, sin consumir recursos de GPU.
- Docencia sobre tokenización: el vocabulario de 320 entradas (256 bytes + 8 especiales + 56 merges) sirve para explicar en clase cómo un BPE a nivel de byte afecta a la longitud de secuencia y a las métricas de pérdida.
- Estudio de dinámicas de entrenamiento y sobremuestreo: la curva publicada (pérdida de validación de 2,465 a 2,269 entre 0,5 y 36 minutos) es un ejemplo reproducible de saturación temprana y de ratio tokens/parámetro extremo.
- Prueba de humo (smoke test) en CI/CD: incluir el modelo como fixture en tests de integración de servidores compatibles con la API de HuggingFace o de TGI, validando serialización, carga de safetensors y respuesta del endpoint.
- Experimentos de edge computing y sistemas embebidos: con 11.088 parámetros y 33 KB, es viable ejecutarlo en CPU, Raspberry Pi o entornos con restricciones de memoria extremas para medir latencia del runtime en sí, no la calidad del modelo.
- Demostración divulgativa sobre límites de escala: ilustrar ante una audiencia qué ocurre cuando se reduce un LLM varios órdenes de magnitud, usando los ejemplos de generación del propio autor como evidencia.
- Referencia para investigación en compresión: punto de partida para comparar técnicas de cuantización o poda en un modelo donde el artefacto completo pesa menos que la mayoría de tokenizadores.
- No se recomienda su uso en atención al cliente, generación de código, análisis de documentos ni ninguna tarea que requiera respuestas correctas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor solo proporciona métricas de validación sobre su propio corpus de conversaciones cortas, que no son comparables con benchmarks estándar ni con modelos de vocabulario grande:

| Tiempo de entrenamiento (aprox.) | Pérdida de validación | Precisión de siguiente token |
|---|---|---|
| 0,5 min | 2,465 | 34,9 % |
| 3,5 min | 2,344 | 37,5 % |
| 7 min | 2,320 | 38,1 % |
| 14 min | 2,300 | 38,5 % |
| 36 min (final) | 2,269 | 39,0 % |

Ejemplos de generación codiciosa publicados por el autor:

| Prompt | Respuesta |
|---|---|
| Who made you? | I'm Pico 1.3 Small, Convergent. |
| Hi! Who are you? | I'm Pico 1 2. |
| What is your favorite color? (temperatura 0,3) | Yes, we can be something exture. If the warm! |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en cualquier precisión; el artefacto GGUF completo ocupa 33 KB y el repositorio 0,0 GB. Cabe holgadamente en la memoria de cualquier GPU, iGPU o CPU.
- GPU recomendadas: ninguna en particular; el entrenamiento se realizó en una RTX 3060 Ti. Cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es sobredimensionada para la inferencia.
- Cabe en GPU consumer y también en CPU: es viable en Raspberry Pi, routers, contenedores con límites de memoria de unos pocos MB e incluso en entornos embebidos.
- Opciones de despliegue: Ollama (descargando `pico-1.3-small.gguf` y el `Modelfile`, y ejecutando `ollama create` / `ollama run`), llama.cpp con el GGUF, transformers con `AutoModelForCausalLM`, y servidores compatibles con text-generation-inference y endpoints de HuggingFace.
- Latencia y throughput: no se han publicado medidas de latencia de inferencia. El único dato conocido es el throughput de entrenamiento (~1 millón de tokens/s en una RTX 3060 Ti). Dado el tamaño, se espera que el tiempo por token esté dominado por la sobrecarga del runtime y no por el cómputo, pero es una estimación, no una medición publicada.

## Comparativa con modelos similares

No existen benchmarks comparativos publicados entre Pico 1.3 Small y otros modelos, y su naturaleza experimental (11.088 parámetros, vocabulario de 320 tokens) lo sitúa fuera de las categorías habituales de comparación. La siguiente tabla recoge únicamente datos de ficha de modelos pequeños de referencia; los datos de los alternativos provienen de sus model cards públicas y no se han verificado contra benchmarks comunes:

| Modelo | Parámetros | Contexto | Licencia | Formatos | Rendimiento comparado |
|---|---|---|---|---|---|
| Pico 1.3 Small | 11.088 | 256 | Apache 2.0 | safetensors, GGUF | Pérdida de validación 2,269 en corpus propio; sin benchmarks estándar |
| SmolLM-135M (HuggingFaceTB) | ~135 M | 2.048 | Apache 2.0 | safetensors, GGUF | No disponible en la información proporcionada |
| Qwen2.5-0.5B | ~0,49 B | 32.768 | Apache 2.0 | safetensors, GGUF | No disponible en la información proporcionada |
| TinyLlama-1.1B | ~1,1 B | 2.048 | Apache 2.0 | safetensors, GGUF | No disponible en la información proporcionada |

La diferencia de escala es de tres a cinco órdenes de magnitud en número de parámetros y de uno a dos en longitud de contexto; cualquier comparación de calidad carece de sentido con los datos disponibles.

## Limitaciones y advertencias

- El propio autor declara que el modelo no da respuestas con sentido: genera palabras sueltas y fragmentos incoherentes, y falla incluso al repetir su propio nombre ("I'm Pico 1 2.").
- Contexto de solo 256 tokens, insuficiente para diálogos multi-turno, documentos o instrucciones largas.
- Vocabulario de 320 tokens: cualquier texto en idiomas distintos del inglés, o incluso inglés con caracteres poco frecuentes, se tokeniza byte a byte, lo que dispara la longitud de secuencia y degrada aún más la salida.
- Sesgos: el corpus de entrenamiento son diálogos generados por GPT-4 y Llama 3.1 (TinyDialogues, Smol-SmolTalk, Everyday Conversations), por lo que hereda los sesgos de esos generadores; no se ha documentado ninguna evaluación de sesgo ni mitigación.
- Riesgo de alucinación total: el modelo no tiene conocimiento factual verificable y produce texto plausible solo a nivel léxico.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución, pero el modelo no es funcionalmente apto para producción; la licencia no implica idoneidad técnica.
- Caveat de reproducibilidad: el corpus de conversaciones de plantilla sobre su nombre y creador (4.000 ejemplos) no se distribuye como dataset independiente en la información disponible.
- Caveat de evaluación: las métricas de pérdida y precisión de siguiente token no son comparables con las de modelos de vocabulario grande, tal como advierte el autor.
- Sin garantías de soporte: 0 descargas y 0 likes en el momento de la ficha; el proyecto debe tratarse como un artefacto aislado sin comunidad ni mantenimiento documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Convergent-ch/Pico-1.3-Small
- Dataset TinyDialogues (MIT): https://huggingface.co/datasets/styfeng/TinyDialogues
- Dataset Everyday Conversations (Apache 2.0): https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Dataset Smol-SmolTalk (Apache 2.0): https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Paper, blog, repositorio o demo adicionales: no disponible (la búsqueda web realizada no devolvió resultados relacionados con el modelo)
