# DICPlay/RusMind-4.7-Momentum

## Resumen

RusMind 4.7 · Momentum (Моментум) es un modelo de lenguaje de tipo Mixture of Experts (MoE) afinado por DICPlay a partir de google/gemma-4-E2B-it, orientado a inferencia local en dispositivo (on-device) y sin conexión. Con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones activos por token, está diseñado para ejecutarse en portátiles, ordenadores de sobremesa convencionales y teléfonos de gama alta mediante llama.cpp y formatos GGUF. Cubre principalmente ruso e inglés.

El modelo forma parte de la familia RusMind 4.7, que incluye variantes de mayor tamaño como Sokol (8.900 millones de parámetros, con modo de razonamiento) y Vspyshka (7.500 millones). Momentum es la variante más ligera de la generación y la que prioriza latencia y huella de memoria mínimas, sacrificando capacidad bruta a cambio de portabilidad. Su relevancia actual radica en que compite en el benchmark ruso MERA v2 con modelos de 8 a 32 mil millones de parámetros pese a activar solo unos 2 mil millones por token.

La ficha se basa en la model card publicada por el autor y en los metadatos de Hugging Face. Los resultados de benchmarks proceden del leaderboard MERA v2 citado por el autor; no se dispone de evaluaciones independientes adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de google/gemma-4-E2B-it; no se detalla la configuración interna de expertos |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo publica pesos en formato GGUF; no se detallan los niveles concretos Q4, Q5, Q8, etc.) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia del autor, etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (librería llama.cpp); repo de 20,2 GB |

## Arquitectura y entrenamiento

El modelo se basa en google/gemma-4-E2B-it, un transformer con arquitectura Mixture of Experts según la información del autor, que indica 4,6 mil millones de parámetros totales y unos 2 mil millones activos en cada paso de generación. DICPlay ha realizado un fine-tuning (base_model_relation: finetune) sobre esa base para especializarla en ruso, cultura e historia de Rusia, seguimiento de instrucciones complejas y tareas humanocéntricas (comprensión de personajes, humor y antónimos).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras variantes de alineación. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o mecanismos de atención lineal. El modelo se distribuye exclusivamente en GGUF para su uso con llama.cpp, LM Studio y Ollama, lo que sugiere una vocación clara de despliegue local más que de servicio en la nube.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial énfasis en ruso.
- Razonamiento multi-paso y resolución de problemas lógicos; el autor declara que es la variante con mejores resultados de razonamiento de la línea Momentum.
- Seguimiento de instrucciones complejas con múltiples requisitos simultáneos.
- Comprensión de matices humanísticos: caracteres de personajes, humor y palabras con significados opuestos.
- Conocimiento específico de cultura, regiones, historia, fechas y personalidades de Rusia.
- Corrección ortográfica y de puntuación en ruso (declarada una puntuación de 0,719 en la tarea de ortografía y puntuación de MERA v2).
- Llamada a herramientas (tool calling / function calling), según la model card.
- Comprensión de japonés con matices de cortesía, citada como resultado de pruebas externas del canal Future Craft Lab.
- Escritura de código y razonamiento estable en tareas de programación, según la misma evaluación externa.
- Ejecución offline y on-device mediante llama.cpp.

## Casos de uso

- Asistentes conversacionales locales en ruso: el modelo puede gestionar diálogos multi-turno directamente en el dispositivo del usuario, sin enviar datos a la nube, gracias a su huella de ~2 mil millones de parámetros activos y a los pesos GGUF optimizados para llama.cpp.
- Corrección y edición de textos en ruso: útil para revisar ortografía, puntuación y estilo en herramientas de escritura offline; el autor reporta 0,719 en la tarea correspondiente de MERA v2.
- Atención al cliente en mercados rusoparlantes con requisitos de privacidad: al ejecutarse en local, permite desplegar un chatbot sin conexión externa en terminales de tienda, quioscos o portátiles corporativos.
- Automatización de tareas con tool calling: integrable en pipelines locales que necesiten invocar funciones (consulta de datos, generación de ficheros, operaciones sobre APIs internas) sin depender de un endpoint remoto.
- Aplicaciones móviles y de escritorio con inferencia embebida: adecuado para asistentes de notas, resúmenes y respuesta a preguntas dentro de apps que distribuyan el modelo GGUF junto al binario.
- Educación y tutoría en ruso: explicación de conceptos, resolución guiada de problemas lógicos y matemáticos y apoyo al estudio de historia y cultura rusas, con funcionamiento offline en entornos con conectividad limitada.
- Prototipado rápido y experimentación: al ser la variante más ligera de RusMind 4.7, sirve para validar flujos de agente y prompts antes de migrar a Sokol o Vspyshka en producción.

## Benchmarks y rendimiento

Los datos proceden del leaderboard MERA v2 citado por el autor (puntuación global). No se han publicado resultados de benchmarks en la información disponible para tareas estándar como MMLU, HumanEval o GSM8K.

| Modelo | Parámetros | MERA v2 (global) |
|---|---|---|
| RusMind 4.7 · Momentum | 4,6 B totales / ~2 B activos | 0,136 |
| T-lite (T-Bank) | 8 B | por debajo de Momentum según el autor (valor no detallado) |
| LFM2.5 (Liquid AI) | no disponible | por debajo de Momentum según el autor |
| Gemma 4 E2B (Google) | ~2 B activos | por debajo de Momentum según el autor |
| Qwen3.5-4B (Alibaba) | 4 B | por debajo de Momentum según el autor |
| RuadaptQwen3-8B | 8 B | por debajo de Momentum según el autor |
| Zero-Mistral-Small | 24 B | por debajo de Momentum según el autor |
| A-Vibe (Avito) | no disponible | por debajo de Momentum según el autor |

El autor afirma que Momentum es el número 1 en MERA v2 entre modelos de hasta 5 mil millones de parámetros, el número 1 en cultura y regiones de Rusia en esa franja, el número 1 en tareas humanocéntricas y que supera a T-lite en tareas lógicas por un factor de 2. Estas afirmaciones provienen de la model card y no se han verificado de forma independiente en esta ficha.

## Requisitos de hardware

- VRAM estimada: con ~2 mil millones de parámetros activos y pesos GGUF, una cuantización Q4 típica ocuparía del orden de 2,5 a 3 GB; Q8 se acercaría a 5 GB. Las cifras exactas dependen del nivel de cuantización publicado, que no se detalla.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 y superiores son suficientes para inferencia cómoda. En entornos profesionales, A100 y H100 no aportan ventaja relevante por el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas con 4-6 GB de VRAM, y también en CPU y en teléfonos de gama alta mediante llama.cpp.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime compatible con GGUF. El repo indica endpoints_compatible, lo que sugiere compatibilidad con APIs de tipo OpenAI servidas localmente.
- Latencia y throughput: no disponibles de forma cuantificada; el autor destaca que "vuela" en navegador y teléfono, pero no publica tokens por segundo medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind 4.7 · Momentum | 4,6 B totales / ~2 B activos | no disponible | 0,136 | rusmind-license | GGUF en Hugging Face |
| RusMind 4.7 · Vspyshka | 7,5 B | no disponible | 0,191 | rusmind-license | Pesos completos y GGUF |
| RusMind 4.7 · Sokol | 8,9 B | no disponible | 0,279 | rusmind-license | Pesos completos y GGUF |
| T-lite (T-Bank) | 8 B | no disponible | por debajo de Momentum | no disponible | no disponible |
| Gemma 4 E2B (Google) | ~2 B activos | no disponible | por debajo de Momentum | Gemma license | Hugging Face |
| Qwen3.5-4B (Alibaba) | 4 B | no disponible | por debajo de Momentum | no disponible | Hugging Face |

La comparativa se limita a los datos publicados por el autor; no hay cifras independientes para contextualizar el rendimiento frente a estos modelos en tareas estándar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al estar especializado en ruso y en cultura e historia de Rusia, es probable que su cobertura de otras culturas sea limitada, aunque no se aportan evidencias.
- Riesgo de alucinación: no cuantificado; los modelos de este tamaño y con fine-tuning específico sobre datos culturales pueden generar datos históricos plausibles pero incorrectos.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que impide planificar casos de uso con ventanas largas.
- Idiomas: solo ruso e inglés de forma declarada; el japonés se menciona como capacidad observada en pruebas externas, no como idioma oficialmente soportado.
- Licencia: rusmind-license es una licencia propia etiquetada como "other"; no se detallan en la información disponible las restricciones para uso comercial, redistribución o modificación. Es imprescindible revisar el fichero LICENSE del repo antes de cualquier despliegue en producción.
- Caveats de producción: la distribución exclusiva en GGUF limita el uso con frameworks que requieren safetensors (vLLM, TGI); no hay datos publicados sobre latencia, throughput ni estabilidad en cargas concurrentes.
- Los resultados de MERA v2 provienen del autor y se refieren a una metodología específica para ruso; no equivalen a rendimiento general en benchmarks internacionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- RusMind 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Sitio del proyecto: https://rusmind.ru
- Licencia (referenciada en el repo): LICENSE dentro de https://huggingface.co/DICPlay/RusMind-4.7-Momentum
