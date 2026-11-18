# DICPlay/RusMind-4.5.5-Momentum

## Resumen

RusMind 4.5.5 · Моментум es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, un laboratorio ruso centrado en modelos de IA orientados al idioma ruso y al despliegue en dispositivo. Se trata de un fine-tuning del modelo base google/gemma-4-E2B-it, distribuido exclusivamente en formato GGUF para su uso con llama.cpp y herramientas compatibles, con el objetivo declarado de funcionar de forma local y sin conexión en portátiles, ordenadores de sobremesa y teléfonos.

El modelo cuenta con 4.647.450.147 parámetros totales, de los cuales aproximadamente 2.000 millones se activan durante la inferencia, lo que lo sitúa en la categoría de modelos ligeros con activación selectiva. Está especializado en ruso e inglés, con un enfoque explícito en tareas de razonamiento, cultura y regiones de Rusia, y comprensión de personas, según las métricas del benchmark MERA v2 que el autor cita en la model card.

Su relevancia actual radica en que compite en el segmento de modelos de menos de 5.000 millones de parámetros activos para ruso, superando según el autor a alternativas de mayor tamaño como T-lite (8B), Zero-Mistral (24B) o A-Vibe (8B) en la sección de razonamiento del benchmark MERA v2. La licencia es propia (rusmind-license), no estándar, lo que exige revisión específica antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre base google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas en la informacion disponible) |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | rusmind-license (licencia propia, etiquetada como "other") |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en google/gemma-4-E2B-it, un transformer con arquitectura Mixture of Experts según la información del autor, que declara 4.647.450.147 parámetros totales y unos 2.000 millones activos por token. La relación de fine-tuning respecto al modelo base está etiquetada explícitamente como "finetune" en los metadatos de Hugging Face. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación.

La model card menciona mejoras específicas en la versión 4.5.5: mayor capacidad en lógica, acertijos y ruso coloquial, mejor comprensión de personajes y del destinatario de la pregunta, puntuación gramatical más precisa y un formato de respuesta estricto y cuidadoso en tareas de examen. No se detalla la innovación técnica a nivel de arquitectura interna más allá de la naturaleza MoE y del empaquetado en GGUF para inferencia en dispositivo.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con énfasis en calidad del ruso coloquial y puntuación.
- Razonamiento y resolución de problemas lógicos y acertijos, según las mejoras declaradas en la versión 4.5.5.
- Comprensión de personajes, contexto conversacional y del destinatario de la pregunta.
- Seguimiento de instrucciones complejas y formato estricto de respuestas en tareas tipo examen.
- Llamada a herramientas (tool calling / function calling), mencionada explícitamente en la model card.
- Conocimiento de cultura y regiones de Rusia, así como tareas humanocéntricas.
- Capacidades multilingües limitadas a ruso e inglés.
- Ejecución local y sin conexión en dispositivos de consumo (portátiles, PC, teléfonos).
- No se menciona soporte de visión, audio ni modo de pensamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales en ruso para atención al cliente: el modelo puede mantener diálogos multiturno con calidad de ruso coloquial y puntuación cuidada, adecuado para empresas que operan en el mercado ruso y necesitan procesamiento local sin enviar datos a la nube.
- Despliegue en dispositivo para aplicaciones de escritorio y móviles: al ser un GGUF de aproximadamente 9,3 GB de repositorio y con solo ~2.000 millones de parámetros activos, puede ejecutarse con llama.cpp en portátiles y teléfonos de gama alta sin conexión, útil en entornos con conectividad limitada o requisitos de privacidad.
- Procesamiento de textos en ruso con corrección ortográfica y de puntuación: la model card reporta 0,719 en la tarea de corrección de ortografía y puntuación de MERA, lo que lo hace apto para herramientas de edición y revisión lingüística.
- Tareas educativas y de evaluación: su formato de respuesta estricto y su rendimiento en tareas tipo examen lo hacen adecuado para generar preguntas, resolver ejercicios y evaluar respuestas en plataformas educativas rusas.
- Integración en pipelines de agentes con tool calling: el soporte declarado de llamada a funciones permite construir flujos de varios pasos que consulten APIs o bases de datos locales en aplicaciones de automatización.
- Chatbots con conocimiento cultural ruso: su primer puesto en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros lo hace útil para aplicaciones de turismo, medios o divulgación centradas en Rusia.
- Filtrado y clasificación de contenido en ruso: con contexto conversacional y comprensión de personajes, puede emplearse para moderación o etiquetado de textos en plataformas rusohablantes.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el ámbito de la IA en Rusia. El autor reporta las siguientes cifras para RusMind Моментум:

| Benchmark / seccion | RusMind Моментум (~2B activos) | T-lite · T-Bank (8B) | Zero-Mistral (24B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|
| Razonamiento (MERA v2) | 0,225 | 0,218 | 0,213 | 0,187 |

| Seccion MERA v2 | RusMind Моментум (~2B activos) | A-Vibe · Avito (8B) | Gemma 4 E2B · Google (5B) | Qwen3.5-4B · Alibaba (4B) |
|---|---|---|---|---|
| Puntuacion global | no disponible (tabla truncada en la informacion) | no disponible | no disponible | no disponible |

El autor afirma que el modelo es número 1 en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros, número 1 en tareas humanocéntricas en esa misma franja, y que supera en puntuación global a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B. También reporta 0,719 en corrección de ortografía y puntuación. No se han proporcionado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 9,3 GB, por lo que las cuantizaciones GGUF completas requerirán en torno a esa cifra en disco y una cantidad de VRAM dependiente de la cuantización elegida (no especificada).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: el modelo está diseñado explícitamente para ejecutarse en portátiles, PC convencionales y teléfonos, lo que sugiere compatibilidad con GPU de consumo y con inferencia en CPU, aunque no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (etiqueta explícita), y por extensión herramientas compatibles con GGUF como LM Studio u Ollama, mencionadas en la model card para modelos de la misma familia. También se indica compatibilidad con endpoints (tag "endpoints_compatible").
- Latencia y throughput: no disponibles. El autor destaca que "vuela directamente en el navegador y en el teléfono" gracias a sus ~2.000 millones de parámetros activos, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MERA v2 (razonamiento) | Licencia | Formato |
|---|---|---|---|---|---|---|
| RusMind 4.5.5 Моментум | 4,65B | ~2B | no disponible | 0,225 | rusmind-license (propia) | GGUF |
| T-lite · T-Bank | 8B | no disponible | no disponible | 0,218 | no disponible | no disponible |
| Zero-Mistral | 24B | no disponible | no disponible | 0,213 | no disponible | no disponible |
| A-Vibe · Avito | 8B | no disponible | no disponible | 0,187 | no disponible | no disponible |
| Gemma 4 E2B · Google | 5B | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo se posiciona en la franja de menos de 5.000 millones de parámetros activos, con ventaja declarada en razonamiento frente a modelos de 8B y 24B según MERA v2. La comparación con Gemma 4 E2B es especialmente relevante porque RusMind 4.5.5 es un fine-tuning del mismo, orientado a ruso y empaquetado en GGUF.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados explícitamente; al estar especializado en ruso y cultura rusa, puede presentar sesgos culturales y geográficos derivados de los datos de entrenamiento.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de ~2.000 millones de parámetros activos, la fiabilidad factual en dominios especializados es limitada.
- Limitaciones de contexto e idioma: solo ruso e inglés; la longitud de contexto no está especificada, lo que impide garantizar conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia rusmind-license es propia y no estándar; es obligatorio revisar el archivo LICENSE del repositorio antes de cualquier uso comercial o redistribución.
- Caveats para producción: el modelo está distribuido únicamente en GGUF, lo que limita su uso con frameworks que requieren safetensors (por ejemplo, vLLM o TGI); la información sobre cuantizaciones concretas y requisitos de hardware es escasa; y el autor recomienda migrar a versiones posteriores (4.7), lo que sugiere que 4.5.5 puede quedar obsoleto a corto plazo.
- Idiomas distintos del ruso e inglés no están soportados de forma declarada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.5-Momentum
- Demo oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada (RusMind 4.7 · Моментум): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
