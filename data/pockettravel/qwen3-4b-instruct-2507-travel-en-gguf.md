# pockettravel/qwen3-4b-instruct-2507-travel-en-GGUF

## Resumen

qwen3-4b-instruct-2507-travel-en-GGUF es un ajuste fino mediante LoRA de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario pockettravel para la aplicación Android Pocket Travel. El modelo se ha fusionado en los pesos base y se distribuye cuantizado a GGUF Q4_K_M, con 4.022.468.096 parámetros. Su única función es responder en inglés, en un máximo de tres frases, utilizando exclusivamente el contexto de guía de viaje que recibe en el prompt.

El modelo no pretende ser un chatbot general ni una fuente de conocimiento: está entrenado para rechazar de forma explícita la respuesta cuando el CONTEXT no contiene la información solicitada. De este modo se aborda el problema clásico de la generación aumentada por recuperación (RAG) en movilidad, donde el coste de una alucinación es alto y no hay conectividad para verificar datos. El repositorio ocupa 2,5 GB y el archivo Q4_K_M pesa 2.382 MiB.

Su relevancia radica en el patrón de especialización: un modelo denso de 4B ajustado para una tarea muy concreta (guía turística offline con rechazo controlado), evaluado sobre 584 preguntas de 11 países no vistos durante el entrenamiento. Existe una variante equivalente en italiano publicada por el mismo autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-4B-Instruct-2507; detalles de capas y mecanismo de atención no disponibles |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificada en la documentación del modelo; la app usa 4.096 tokens (batch 512, caché KV f16) y el ejemplo de llama.cpp usa 8.192 |
| Tipos de cuantización | Q4_K_M con importance matrix (imatrix); único archivo publicado |
| Idiomas soportados | inglés (en) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 (relación: finetune) |
| Archivo principal | qwen3-4b-instruct-2507-travel-en-Q4_K_M.gguf (2.382 MiB) |
| Tamaño del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507 y se ha ajustado con LoRA de 16 bits mediante Unsloth, con una única época y pérdida calculada solo sobre los tokens de respuesta, ponderada por categoría de pregunta. Después, el adaptador LoRA se fusiona en los pesos base y el resultado se cuantiza a GGUF Q4_K_M con importance matrix. No se documentan innovaciones arquitectónicas propias: la aportación está en el proceso de ajuste y en los datos.

El conjunto de entrenamiento consta de 40.935 pares sintéticos pregunta/respuesta con respuestas extractivas, de los cuales aproximadamente el 21 % son ejemplos de rechazo. Los datos se construyen a partir de los volcados de Wikimedia del 1 de octubre de 2026: Wikivoyage en inglés (páginas de país y ciudad, limpiadas con el mismo código que las guías de la app), Wikipedia en inglés (artículos de país sobre cocina, cultura, telecomunicaciones y medios, e historia y clima de ciudades), secciones de Wikivoyage en italiano traducidas automáticamente al inglés con MarianMT (Helsinki-NLP/opus-mt-tc-big-it-en, CC BY 4.0, marcadas en ATTRIBUTION.tsv), recomendaciones de viaje del Gobierno de Canadá (travel.gc.ca) y de la Oficina de Exteriores británica (gov.uk), datos rápidos de Wikidata (capital, moneda, código de llamada, lado de conducción), números de emergencia y resúmenes de vacunación. Los contextos imitan la estructura de la app: entre una y tres secciones de guía con secciones distractoras, hasta 2.000 caracteres, más los bloques adicionales (puntos de interés cercanos, próximas salidas, distancias entre ciudades, números de emergencia, notas personales). Las preguntas reales provienen del dataset soniawmeyer/travel-conversations-finetuning (parte UltraChat, MIT).

## Capacidades

- Generación de respuestas extractivas ancladas al contexto proporcionado, en formato RAG.
- Rechazo explícito y reconocible cuando el contexto está vacío o no contiene la respuesta.
- Respuestas limitadas a un máximo de tres frases e idiomáticamente restringidas al inglés.
- Cobertura temática de país y ciudad: cocina, cultura, telecomunicaciones, medios, historia y clima.
- Respuesta a preguntas sobre lugares cercanos, próximas salidas, distancias entre ciudades, números de emergencia y vacunación.
- Consulta de datos rápidos: capital, moneda, código de llamada y lado de conducción.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el diseño está orientado a un único turno de pregunta sobre contexto.
- Modo thinking: no documentado.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Asistente de viaje offline en Android: la app descarga la guía Wikivoyage de una región, la indexa con SQLite FTS y formula la pregunta con una a tres secciones como contexto; el modelo responde en inglés en tres frases o rechaza. Es su uso previsto y el único validado por el autor.
- Control de alucinaciones en pipelines RAG móviles: con tasas de rechazo del 100 % con contexto vacío y de preguntas fuera de tema, sirve como capa de verificación para descartar respuestas no sustentadas.
- Consultas sobre historia y clima de ciudades: el modelo fue entrenado específicamente para estas categorías y logra un 0 % de falsos rechazos en preguntas respondibles de este tipo.
- Información práctica de viaje: números de emergencia, resúmenes de vacunación, moneda, código de llamada y lado de conducción a partir de datos de Wikidata y guías oficiales.
- Recomendaciones basadas en fuentes gubernamentales: el entrenamiento incluye material de travel.gc.ca y gov.uk, útil para asistentes que deban citar avisos oficiales.
- Aplicaciones multilingües emparejadas: junto con la variante italiana del mismo autor (pockettravel/qwen3-4b-instruct-2507-travel-it-GGUF), permite desplegar el mismo motor seleccionando el idioma de la interfaz.
- Prototipos de RAG embebido sin GPU: al ejecutarse en llama.cpp sobre CPU con unos 4,6 GiB en uso, encaja en escenarios de borde donde no hay acelerador dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La evaluación disponible es específica de la tarea de la app: 584 preguntas retenidas sobre 11 países nunca vistos en entrenamiento, con contextos con la misma forma que los de la app, evaluadas como GGUF con llama.cpp y decodificación greedy. El modelo base de comparación es la cuantización oficial unsloth/Qwen3-4B-Instruct-2507-GGUF (UD-Q4_K_XL).

| Métrica | Este modelo | Modelo base (Qwen3-4B-Instruct-2507) |
|---|---|---|
| Rechaza cuando el contexto está vacío | 100 % | 100 % |
| Rechaza preguntas fuera de tema | 100 % | 94,5 % |
| Rechaza preguntas parafraseadas de país cuyo tema falta en el contexto | 97,6 % | 87,8 % |
| Rechaza preguntas de ciudad cuyo tema falta en la página | 90 % | 80 % |
| Rechaza preguntas de historia o clima de ciudad no cubiertas por el contexto | 100 % | 100 % |
| Rechaza preguntas de "qué hay cerca" sin lugar coincidente | 100 % | 80 % |
| Rechaza preguntas de salidas sin salida coincidente | 100 % | 70 % |
| Rechaza por error preguntas de país respondibles | 2,5 % | 16,7 % |
| Rechaza por error preguntas de ciudad respondibles | 0 % | 14 % |
| Rechaza por error preguntas respondibles de historia o clima de ciudad | 0 % | 0 % |
| Rechaza por error preguntas respondibles de "qué hay cerca" | 14,3 % | 0 % |
| Rechaza por error preguntas respondibles de salidas | 7,1 % | 14,3 % |

El conjunto de prueba es nuevo en esta versión (más grupos y contextos con los bloques extra de la app), por lo que las cifras no son comparables con las de la versión anterior de la model card.

## Requisitos de hardware

- Tamaño del archivo: 2.382 MiB (Q4_K_M con imatrix).
- Memoria en uso estimada: unos 4,6 GiB, incluyendo pesos, copia en CPU de los pesos repackados, caché KV y buffers de cómputo. Medido con llama.cpp en CPU y con los ajustes de la app (contexto 4.096 tokens, batch 512, caché KV f16).
- RAM recomendada en el dispositivo: 12 GB o más. Con unos 0,4 GB adicionales de la app, el conjunto ocupa aproximadamente el 40 % o menos de esa RAM sugerida.
- GPU recomendadas: no especificadas en la información disponible; no se documenta despliegue en GPU para este modelo.
- Viabilidad en hardware de consumo: el escenario validado es un teléfono Android con CPU, sin GPU dedicada.
- Opciones de despliegue: llama.cpp (ejemplo oficial con `llama-server -m qwen3-4b-instruct-2507-travel-en-Q4_K_M.gguf -c 8192`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (travel-en) | 4,02 B | No especificado (app: 4.096 / ejemplo: 8.192) | Ver tabla de benchmarks; mejor tasa de rechazo que el base en 6 de 7 grupos | CC BY-SA 4.0 | GGUF Q4_K_M |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | No disponible | Rechaza menos y con frecuencia responde con conocimiento propio o texto no pertinente | No disponible en la información proporcionada | GGUF (unsloth UD-Q4_K_XL) |
| pockettravel/qwen3-4b-instruct-2507-travel-it-GGUF | 4,02 B | No disponible | No disponible; equivalente en italiano | No disponible en la información proporcionada | GGUF |

## Limitaciones y advertencias

- No es un chatbot general ni una fuente de conocimiento: sin contexto debe rechazar, y responderá mal a cualquier uso conversacional abierto.
- Solo admite inglés; el italiano se cubre con un modelo separado.
- Respuestas limitadas a tres frases, por lo que no sirve para explicaciones extensas ni documentos largos.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribución y obliga a distribuir las obras derivadas bajo la misma licencia.
- Incorpora material bajo CC BY 4.0 (traducciones MarianMT) con obligaciones de atribución recogidas en ATTRIBUTION.tsv.
- Riesgo de alucinación mitigado pero no eliminado: la evaluación del propio autor señala que el modelo base, cuando no rechaza, responde a menudo con su propio conocimiento o con texto no pertinente; el ajuste reduce ese comportamiento, no lo garantiza al 100 %.
- Un 14,3 % de falsos rechazos en preguntas respondibles de "qué hay cerca", el peor resultado del modelo en la tabla.
- Algunos grupos de evaluación son muy pequeños (por ejemplo, las preguntas de salidas), por lo que las tasas deben interpretarse con cautela.
- El conjunto de prueba está adaptado a las plantillas y formatos de la app; el rendimiento fuera de ese formato no está medido.
- Las cifras no son comparables con las de la versión anterior de la model card por cambios en el conjunto de evaluación.
- La documentación de la model card está truncada en el apartado de entrenamiento, por lo que parte de la composición del dataset de preguntas fuera de tema no está disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pockettravel/qwen3-4b-instruct-2507-travel-en-GGUF
- Variante en italiano: https://huggingface.co/pockettravel/qwen3-4b-instruct-2507-travel-it-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Cuantización GGUF del modelo base usada en la comparación: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
- Repositorio de la app Pocket Travel: https://github.com/miracle091/pocket-travel
- Dataset de preguntas de viaje: https://huggingface.co/datasets/soniawmeyer/travel-conversations-finetuning
- Modelo de traducción empleado: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-it-en
