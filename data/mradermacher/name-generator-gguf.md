# mradermacher/name-generator-GGUF

## Resumen

name-generator-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo aimeri/name-generator, realizadas por el cuantizador comunitario mradermacher. El modelo base es un LLM de 3.429 millones de parámetros (basado en la arquitectura Ministral 3, entrenado con Unsloth y formato ChatML) especializado en la generación de nombres de personajes, orientado a escritura creativa. Su propósito es resolver un problema muy concreto: producir nombres propios plausibles y variados para personajes de ficción, juegos, novelas o cualquier proyecto narrativo.

La relevancia de esta ficha radica en la disponibilidad del modelo en formatos comprimidos que permiten ejecutarlo en hardware modesto, incluidas GPU de consumo e incluso CPU, gracias al ecosistema llama.cpp y derivados como Ollama o LM Studio. Con cuantizaciones desde 1,6 GB (Q2_K) hasta 7,0 GB (f16), es un modelo de nicho pero muy accesible para escritores y desarrolladores de herramientas creativas que quieran generación local y sin coste de API.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Basada en Ministral 3 (transformer), formato ChatML |
| Parámetros totales | 3.429.006.336 (~3,43 B) |
| Parámetros activos | no disponible (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo base (aimeri/name-generator) es un modelo conversacional de ~3,43 B de parámetros construido sobre la arquitectura Ministral 3 y entrenado con la biblioteca Unsloth, empleando la plantilla de chat ChatML. Fue ajustado sobre el dataset aimeri/name-generator, un conjunto de datos específico para la generación de nombres de personajes. Los detalles del dataset (número de ejemplos, composición, cobertura cultural de los nombres) no están disponibles en la información proporcionada.

Esta versión de mradermacher no modifica los pesos originales: consiste en cuantizaciones estáticas post-entrenamiento en formato GGUF mediante conversión tipo hf, sin imatrix ni quants ponderados en el momento de publicación. La cuantización reduce el tamaño de cada peso (por ejemplo, Q4_K_M usa aproximadamente 4,5 bits por peso) a costa de una ligera pérdida de calidad, siendo Q4_K_S y Q4_K_M las variantes recomendadas por el autor por su equilibrio entre velocidad y calidad.

## Capacidades

- Generación de nombres de personajes para escritura creativa (novelas, rol, videojuegos).
- Conversación en formato ChatML, con comportamiento de chat (tag "conversational").
- Generación de texto en inglés; el resto de idiomas no está documentado.
- No hay evidencia de capacidades de visión, audio ni razonamiento extendido (thinking mode).
- No hay información sobre soporte de tool calling ni capacidades agénticas.

## Casos de uso

- Generación de nombres para novelas y relatos: un escritor puede ejecutar el modelo localmente en Ollama o LM Studio y pedir listas de nombres coherentes con el tono de su obra sin depender de servicios externos.
- Creación de personajes para juegos de rol y mesa: los directores de juego pueden generar decenas de nombres de NPC rápidamente durante la preparación de sesiones.
- Videojuegos con generación procedural: integración vía llama.cpp para generar nombres de personajes, ciudades o facciones al vuelo durante la creación de mundos.
- Herramientas de escritura asistida: desarrollo de plugins o aplicaciones (por ejemplo, extensiones de editor) que ofrezcan sugerencias de nombres offline gracias a su tamaño reducido (~2,2 GB en Q4_K_M).
- Prototipado de chatbots creativos: al ser un modelo conversacional ChatML, puede servir como base ligera para asistentes de brainstorming narrativo.
- Anonimización y datos de prueba: generación de nombres ficticios en inglés para poblar bases de datos de desarrollo y pruebas de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1,8 GB (Q2_K) hasta ~7,5 GB (f16); la variante recomendada Q4_K_M requiere unos 2,5 GB incluyendo contexto.
- Cabe con holgura en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4090 e incluso GPUs de 4 GB con las quants más agresivas.
- También es plenamente viable su ejecución en CPU pura con llama.cpp dada la cuantización más ligera y el tamaño reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; no hay soporte nativo documentado para vLLM o TGI (formato GGUF).
- Latencia y throughput: no disponibles; al ser un modelo de ~3,4 B cuantizado a 4 bits, se espera generación rápida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| name-generator-GGUF (este) | ~3,43 B | GGUF (múltiples quants) | Apache 2.0 | Generación especializada de nombres de personajes |
| Qwen2.5-3B-Instruct | ~3 B | safetensors / GGUF | Qwen (uso comercial permitido con condiciones) | LLM generalista multilingüe |
| Llama 3.2-3B-Instruct | ~3,2 B | safetensors / GGUF | Llama 3.2 Community License | LLM generalista con contexto largo |
| Phi-3.5-mini-instruct | ~3,8 B | safetensors / GGUF | MIT | LLM generalista, fuerte en razonamiento |

Frente a los generalistas de tamaño similar, este modelo ofrece un comportamiento afinado para una tarea de nicho (nombres de personajes) con una licencia Apache 2.0 sin restricciones, a costa de una versatilidad mucho menor en razonamiento, código o matemáticas.

## Limitaciones y advertencias

- Especialización extrema: está afinado para generar nombres; su rendimiento en tareas generales (razonamiento, código, matemáticas) probablemente sea inferior al de un modelo base generalista y no está documentado.
- Entrenado para inglés: la generación de nombres en otros idiomas o culturas no está garantizada ni documentada.
- Longitud de contexto no publicada: conviene verificarla antes de usarlo en aplicaciones con conversaciones largas.
- Riesgo de alucinación típico de LLM: puede generar nombres con connotaciones no deseadas o repetitivos; se recomienda supervisión humana.
- No hay benchmarks publicados, por lo que la calidad relativa frente a otros generadores de nombres es desconocida.
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) pueden degradar notablemente la calidad de salida.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar también la ficha del modelo base.
- Cuantizaciones estáticas sin imatrix; el autor indica que las ponderadas podrían no estar previstas salvo petición expresa.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/name-generator-GGUF
- Modelo base: https://huggingface.co/aimeri/name-generator
- Dataset de entrenamiento: https://huggingface.co/datasets/aimeri/name-generator
- Página de descargas de mradermacher: https://hf.tst.eu/model#name-generator-GGUF
- Guía de uso de GGUF (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
