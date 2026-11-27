# DICPlay/RusMind-4.5.1-Momentum

## Resumen

RusMind 4.5.1 · Моментум es un modelo de lenguaje afinado (finetune) por DICPlay sobre `google/gemma-4-E2B-it`, orientado a generación de texto conversacional en ruso e inglés y distribuido exclusivamente en formato GGUF para inferencia local con llama.cpp. Se presenta como la variante más ligera de la familia RusMind de cuarta generación y media, con un enfoque explícito en despliegue on-device y offline: portátiles, equipos de sobremesa convencionales y teléfonos. El modelo declara 4.647.450.147 parámetros totales y una arquitectura de mezcla de expertos (MoE) en la que solo se activan aproximadamente 2.000 millones de parámetros por token, según la model card.

El modelo resuelve el problema de disponer de un asistente conversacional en ruso con calidad razonable sin depender de infraestructura en la nube ni de conectividad. Su relevancia actual radica en que DICPlay lo posiciona en el benchmark independiente MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por el Alianza en el sector de la IA ruso, donde reclama el primer puesto en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros y resultados por encima de alternativas de mayor tamaño activo como T-lite de T-Bank, Gemma 4 E2B de Google o Qwen3.5-4B de Alibaba.

La ficha se basa en la información publicada en Hugging Face y en la model card del autor. No se han publicado resultados numéricos completos desglosados por tarea en la información disponible, y la model card dedica buena parte de su contenido a promocionar versiones posteriores de la familia (4.7), por lo que los datos de rendimiento deben tratarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base Gemma 4 E2B; transformer con atención estándar (detalles internos no disponibles) |
| Parámetros totales | 4.647.450.147 |
| Parámetros activos | ~2.000 millones por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia, categoría "other"; requiere licencia comercial para organizaciones) |
| Formato de pesos | GGUF (librería: gguf; compatible con llama.cpp, Ollama, LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo base de Google con arquitectura de mezcla de expertos y aproximadamente 2.000 millones de parámetros activos. DICPlay aplica un finetune sobre esta base para especializarlo en ruso, con énfasis declarado en corrección ortográfica y de puntuación, conocimiento de historia rusa y mundial del siglo XX, comprensión de humor, acertijos y lenguaje coloquial, seguimiento preciso de instrucciones complejas y llamada de herramientas (tool calling). La model card indica que la versión 4.5.1 añade razonamiento previo a la respuesta en tareas lógicas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o similares. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal. La model card menciona que la familia 4.5 incluye modo de razonamiento en tareas lógicas, pero no especifica si se trata de un modo explícito de "thinking" con tokens intermedios o de un ajuste de comportamiento.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Razonamiento previo a la respuesta en tareas lógicas y de razonamiento (incorporado en 4.5.1).
- Llamada de herramientas y funciones (tool calling / function calling) con precisión declarada por el autor.
- Seguimiento de instrucciones complejas.
- Corrección ortográfica y de puntuación en ruso (la model card cita un valor de 0,719 en la tarea de ortografía y puntuación de MERA para la variante 4.7, no para este modelo).
- Conocimiento de historia rusa (desde la Rus de Kiev hasta la actualidad) e historia mundial del siglo XX.
- Comprensión de humor, acertijos, personajes y palabras con significados opuestos.
- Capacidades multilingües limitadas a ruso e inglés.
- Ejecución on-device y offline mediante llama.cpp.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional offline en ruso: el modelo puede gestionar diálogos multi-turno en un portátil o teléfono sin conexión, gracias a su tamaño activo de ~2.000 millones de parámetros y su distribución en GGUF para llama.cpp.
- Corrección y edición de textos en ruso: adecuado para revisar ortografía y puntuación en borradores, redacciones y documentación, una de las áreas que el autor destaca explícitamente.
- Atención al cliente en organizaciones rusoparlantes con requisitos de soberanía de datos: al ejecutarse localmente, evita el envío de conversaciones a servicios externos, lo que encaja con escenarios de cumplimiento estricto.
- Automatización de tareas con herramientas: el soporte de tool calling permite integrarlo en flujos que consulten APIs, bases de datos o sistemas internos mediante llamadas a funciones.
- Tutoría y consulta histórica: su entrenamiento reforzado en historia rusa y mundial del siglo XX lo hace útil para preguntas frecuentes educativas o divulgativas en esos dominios.
- Prototipado rápido y demos en navegador o dispositivos móviles: al ser ligero y ejecutable en CPU, sirve para validar productos conversacionales antes de invertir en infraestructura mayor.
- Filtrado y clasificación de texto en pipelines ligeros: generación de resúmenes, extracción de entidades o reescritura de textos en ruso en entornos con recursos limitados.

## Benchmarks y rendimiento

La información proporcionada incluye referencias cualitativas a MERA v2 y una tabla comparativa, pero los datos numéricos corresponden a las variantes 4.7 (Вспышка y Сокол), no a este modelo 4.5.1. Para 4.5.1 la model card solo afirma posiciones relativas sin cifras completas. No se han publicado resultados de benchmarks desglosados en la información disponible para RusMind 4.5.1 · Моментум.

| Benchmark | RusMind 4.5.1 | Comparativa citada por el autor |
|---|---|---|
| MERA v2 (general) | no disponible (cifra concreta) | Supera a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B, según el autor |
| MERA v2 (cultura y regiones de Rusia) | no disponible (cifra concreta) | N.º 1 entre modelos de hasta 5B según el autor |
| MERA v2 (tareas centradas en personas) | no disponible (cifra concreta) | N.º 1 entre modelos de hasta 5B según el autor |
| MERA v2 (razonamiento) | no disponible (cifra concreta) | Supera a T-lite (8B), Zero-Mistral (24B) y A-Vibe (8B), según el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,65 mil millones de parámetros totales y ~2 mil millones activos, una cuantización de 4 bits requeriría del orden de 3-4 GB de memoria, y 8 bits del orden de 5-6 GB; estas cifras son estimaciones orientativas, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070/4080/4090; también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 6-8 GB de VRAM o más en cuantizaciones bajas; el autor lo describe como apto para portátiles, PC convencionales y teléfonos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles. El autor afirma que "vuela" en navegador y teléfono, pero no aporta cifras de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| RusMind 4.5.1 · Моментум | 4,65B | ~2B | no disponible | rusmind-license (comercial con permiso) | GGUF | Especializado en ruso, on-device |
| Gemma 4 E2B · Google (base) | no disponible | no disponible | no disponible | licencia de Google (no detallada) | safetensors, GGUF | Modelo base del finetune |
| T-lite · T-Bank | ~8B | no disponible | no disponible | no disponible | no disponible | Alternativa rusa citada; el autor afirma superarla en razonamiento y general |
| Qwen3.5-4B · Alibaba | ~4B | no disponible | no disponible | no disponible | no disponible | Alternativa multilingüe citada; el autor afirma superarla en general |

La comparativa se limita a los modelos mencionados en la model card; no se dispone de datos de contexto, licencia ni rendimiento detallado de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al estar especializado en ruso y en historia de Rusia, puede presentar sesgos culturales y geográficos derivados de los datos de ajuste.
- Riesgo de alucinación: no cuantificado. Como todo modelo generativo de este tamaño, es propenso a inventar datos en dominios especializados, especialmente fuera de ruso e inglés.
- Limitaciones de contexto e idioma: solo ruso e inglés; la longitud de contexto no está publicada, lo que impide garantizar conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia `rusmind-license` es propia y de categoría "other"; el uso comercial por organizaciones requiere contactar con el autor (se indican canales de Telegram y MAX). No es una licencia de código abierto reconocida.
- Caveats para producción: el modelo está en formato GGUF y pensado para llama.cpp; no se ofrecen pesos en safetensors ni integración con vLLM o TGI. La model card promociona versiones posteriores (4.7), lo que sugiere que 4.5.1 puede quedar sin mantenimiento.
- El número de descargas (1.596) y la ausencia de "likes" indican una adopción aún limitada; no hay evidencia independiente de calidad más allá de las afirmaciones del autor sobre MERA.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.1-Momentum
- Demo y sitio del autor: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior 4.7 · Моментум: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- Versión 4.7 · Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Versión 4.7 · Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
