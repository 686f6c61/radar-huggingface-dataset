# Mihir-Karbelkar/tiny-30m-site-qa

## Resumen

Tiny 30M site QA es un modelo de lenguaje decoder de 30,5 millones de parámetros entrenado desde cero por Mihir Karbelkar para una tarea muy concreta: responder preguntas de visitantes a partir de pasajes que un sitio web recupera (RAG) y rechazar la respuesta cuando los pasajes no la contienen. Es el modelo experimental que corre en el chat opcional de mihirkarbelkar.com, empaquetado como un único grafo ONNX int8 de 44 MB que se ejecuta en el navegador sobre el backend WASM de onnxruntime-web, sin necesidad de WebGPU.

Su relevancia no está en el rendimiento bruto, sino en la demostración de un pipeline completo de extremo a extremo: preentrenamiento sobre FineWeb-Edu y FineWeb, fine-tuning con datos generados y filtrados por Qwen3-8B, cuantización int8 con SmoothQuant y despliegue en cliente. La arquitectura es un transformer decoder de 8 capas, dimensión 512, atención con grouped-query attention (8 cabezas de consulta, 2 de clave-valor), QK-norm, SwiGLU y RoPE, con un vocabulario byte-level BPE de 16K tokens.

El modelo incorpora un mecanismo explícito de abstención: fue entrenado para emitir la cadena `The context does not say.` cuando la respuesta no está en las fuentes, y el autor documenta cómo puntuar esa cadena y aplicar un umbral de 0,3 para decidir entre responder o rechazar. Es, por tanto, un ejemplo útil de diseño de "grounding" en modelos pequeños, aunque el propio autor lo califica de experimento y no de asistente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (8 capas, d=512, GQA 8Q/2KV, QK-norm, SwiGLU, RoPE) |
| Parámetros totales | 30,5 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como valor nominal; entrenado con prompts de hasta ~3.000 caracteres de pasajes (óptimo ~2.000) |
| Tipos de cuantización | int8 dinámica con SmoothQuant en la proyección de salida del MLP (capas 3–4 de esa proyección en fp32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`decoder.int8.onnx`, grafo único con caché KV) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer de 8 capas con dimensión oculta 512, 8 cabezas de consulta y 2 cabezas de clave-valor (grouped-query attention), normalización QK, activación SwiGLU y embeddings posicionales rotatorios (RoPE). El vocabulario es byte-level BPE de 16K tokens. El grafo ONNX es único y se reutiliza tanto para el prompt como para cada token nuevo: recibe `input_ids` int64 de forma `(1, T)` y un tensor `past` float32 de forma `(8, 2, 1, 2, 1+P, 64)`, y devuelve `logits` `(1, 16384)` para la última posición y `present` `(8, 2, 1, 2, 1+P+T, 64)`. La caché arranca con una ranura ficticia que el grafo enmascara, de modo que la primera llamada pasa `past = zeros(8, 2, 1, 2, 1, 64)`.

El preentrenamiento usó 2.500 millones de tokens de FineWeb-Edu y FineWeb, con sesgo hacia páginas estructuradas (listas, precios, horarios, FAQ). La pérdida en validación fue de 3,30 nats/token. El fine-tuning empleó aproximadamente 175.000 ejemplos: preguntas y respuestas generadas con Qwen3-8B sobre páginas de FineWeb, conservadas solo si una segunda pasada del mismo modelo las confirmaba, con prompts que mezclan el pasaje correcto con otros pasajes de la misma página y de otras, y preguntas de tipo "no está en el texto" revalidadas contra la página completa. Se añadieron respuestas de OpenAssistant oasst2 para conversación general. La exportación aplica cuantización dinámica int8 con SmoothQuant en la proyección de salida del MLP.

El formato de prompt es explícito y basado en identificadores especiales: `[7] + tokens(sources) + [3] + tokens(question) + [2]`, donde cada fuente se serializa como `SOURCE N: <título>` seguido del texto del pasaje. Para preguntas sin fuentes se usa `[5] + tokens(question) + [2]`. La generación termina en el token `1`.

## Capacidades

- Generación de texto y respuesta extractiva a preguntas en inglés a partir de pasajes proporcionados en el prompt.
- Abstención calibrada: emite `The context does not say.` cuando las fuentes no contienen la respuesta, con una puntuación de probabilidad documentada y umbral recomendado de 0,3.
- Conversación básica en inglés, gracias al fine-tuning con OpenAssistant oasst2.
- Ejecución en navegador sobre WASM (onnxruntime-web), sin WebGPU, con un único archivo int8 de 44 MB.
- Inferencia con caché KV gestionada manualmente a través de los tensores `past`/`present` del grafo ONNX.
- Decodificación greedy con penalización de repetición 1,1 y prohibición de la subcadena `" context"` tras un primer token `"The"` para evitar que una respuesta derive en la cadena de rechazo.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido; no se documenta ninguna de estas capacidades.

## Casos de uso

- Chat de soporte en una web personal o corporativa: el modelo responde preguntas de visitantes usando pasajes recuperados por un motor de búsqueda del propio sitio, con un tamaño de 44 MB que permite cargarlo en el cliente y evitar enviar consultas a un servidor.
- Asistente de FAQ con grounding verificable: al mostrar las fuentes junto a la respuesta y aplicar el umbral de rechazo de 0,3, se reduce el riesgo de respuestas inventadas sobre horarios, precios o servicios.
- Demostración educativa de RAG de extremo a extremo: sirve para ilustrar el pipeline completo (preentrenamiento, fine-tuning con datos sintéticos filtrados, cuantización y despliegue WASM) en cursos y artículos técnicos.
- Procesamiento en el dispositivo con requisitos de privacidad: al ejecutarse íntegramente en el navegador, las preguntas del usuario no salen del cliente, lo que encaja en escenarios con datos sensibles o con requisitos de residencia de datos.
- Filtro de abstención en pipelines mayores: la cabeza de rechazo puede reutilizarse como clasificador de "respuesta no presente en el contexto" antes de delegar en un modelo mayor, reduciendo llamadas costosas.
- Prototipado rápido de asistentes de documentación: con prompts de hasta ~3.000 caracteres de pasajes, permite validar la calidad de la recuperación y del formato de fuentes antes de invertir en un modelo de mayor tamaño.
- Aplicaciones web de bajo consumo en móviles de gama media: con ~0,6 s para leer un prompt de 512 tokens y ~43 tokens/s en un Android de gama media, es viable para interfaces conversacionales ligeras.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AUROC de rechazo (páginas reservadas, 1.000+ preguntas) | 0,97 |
| Tasa de rechazo correcto con umbral 0,3 | ~96 % de las preguntas no respondibles |
| Tasa de rechazo incorrecto con umbral 0,3 | ~5 % de las preguntas respondibles |
| F1 de solapamiento de palabras con las respuestas del profesor | ≈ 0,37 |
| Pérdida en validación (preentrenamiento) | 3,30 nats/token |
| Latencia de lectura de prompt (WASM, 4 hilos, 512 tokens, portátil) | ~0,25 s |
| Throughput de generación (WASM, 4 hilos, portátil) | ~100 tokens/s |
| Latencia de lectura de prompt (Android de gama media) | ~0,6 s |
| Throughput de generación (Android de gama media) | ~43 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en navegador: un único archivo ONNX int8 de 44 MB; el autor lo ejecuta con onnxruntime-web sobre WASM con 4 hilos, sin WebGPU.
- VRAM estimada: no disponible como cifra explícita; por el tamaño del modelo (30,5 M de parámetros) y la cuantización int8, el peso ocupa ~44 MB y el consumo adicional corresponde a la caché KV y a los buffers de activación.
- GPU recomendadas: no aplica para el caso de uso documentado (WASM en CPU). No se documentan requisitos para CUDA, A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en CPU de portátil o móvil de gama media, según los tiempos reportados por el autor.
- Opciones de despliegue documentadas: onnxruntime-web (WASM) en el navegador. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks (~0,25 s y ~100 tokens/s en portátil; ~0,6 s y ~43 tokens/s en Android de gama media).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny 30M site QA | 30,5 M | Prompts de hasta ~3.000 caracteres de pasajes | QA extractiva con abstención, en navegador | Apache-2.0 | HuggingFace (ONNX) |
| Qwen3-8B (profesor del fine-tuning) | 8 B | No disponible en la información | LLM generalista usado para generar y filtrar datos | Apache-2.0 | HuggingFace |
| Alternativas de 30 M para QA en navegador | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo describe como un experimento, no como un asistente de producción.
- En un sitio personal real, donde todos los pasajes tratan de la misma persona, responde correctamente aproximadamente la mitad de las preguntas factuales.
- Con frecuencia produce respuestas fluidas pero incorrectas compuestas por palabras de los pasajes, en lugar de abstenerse; el autor cita como ejemplo preguntas sobre tarifas o formación que el sitio no cubre.
- Recomendación explícita de usarlo detrás de una comprobación de grounding y mostrando las fuentes, sin confiar en él para datos que importen.
- Solo inglés; no hay soporte multilingüe documentado.
- Ventana de contexto efectiva limitada: entrenado con hasta ~3.000 caracteres de pasajes y con mejor comportamiento en torno a ~2.000.
- Riesgo de alucinación inherente a un modelo de 30,5 M de parámetros; el mecanismo de rechazo mitiga pero no elimina el problema (5 % de falsos rechazos y ~4 % de no rechazos en la métrica reportada).
- Licencia Apache-2.0, que permite uso comercial, pero los datos de preentrenamiento (FineWeb y FineWeb-Edu) están bajo ODC-By 1.0 y sujetos a los términos de Common Crawl; conviene revisar esas condiciones antes de un despliegue comercial.
- No se documentan sesgos específicos medidos; al entrenarse sobre FineWeb, hereda los sesgos de Common Crawl.
- No soporta tool calling, agentes, visión ni audio, lo que limita su integración en pipelines complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mihir-Karbelkar/tiny-30m-site-qa
- Sitio del autor con el chat en producción: https://mihirkarbelkar.com
- Implementación de referencia (worker del portafolio): `src/workers/tiny.worker.ts` en el repositorio del sitio
- Qwen3-8B (modelo profesor): https://huggingface.co/Qwen/Qwen3-8B
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
