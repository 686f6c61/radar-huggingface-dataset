# JobOpportunitiesAPI/joa-job-extractor-400m-gguf

## Resumen

joa-job-extractor-400m-gguf es un modelo de extracción de información estructurada especializado en ofertas de empleo. Lo desarrolla Job Opportunities API (JOA), un proyecto centrado en datos de ofertas publicadas directamente por empleadores y en informes de transparencia salarial. El modelo lee el texto de una oferta ya descargada y devuelve un único objeto JSON plano con 13 campos: si la oferta sigue abierta, título, empresa, ubicación, salario (moneda, mínimo, máximo y periodo), fecha de publicación, si el anunciante es una agencia, tipo de presencialidad y seniority.

Técnicamente es un fine-tune con LoRA (fusionado posteriormente) de IBM Granite 3.1 1B-A400M Instruct, un transformer con arquitectura de mezcla de expertos (MoE) de 1.334 millones de parámetros totales y unos 400 millones activos por token. Se distribuye únicamente en formato GGUF para llama.cpp, en tres precisiones (Q4_K_M, Q8_0 y f16), con licencia Apache 2.0.

Su relevancia práctica está en el nicho: no compite como modelo generalista, sino como extractor determinista de campos concretos sobre un prompt fijo. El autor lo plantea como segunda pasada tras un parser basado en reglas, para recuperar salarios que las reglas no detectan, especialmente en ofertas en alemán, francés y neerlandés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de IBM Granite 3.1 1B-A400M Instruct |
| Parámetros totales | 1.334.628.352 |
| Parámetros activos | ~400 M por token |
| Longitud de contexto | No especificada en la model card; el autor recomienda ejecutarlo con al menos 24K tokens de contexto |
| Tipos de cuantización | Q4_K_M (0,82 GB), Q8_0 (1,42 GB), f16 (2,67 GB) |
| Idiomas soportados | Inglés, alemán, francés, neerlandés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Granite 3.1 1B-A400M Instruct, un transformer con capas de mezcla de expertos que activa aproximadamente 400 millones de parámetros por token sobre un total de 1.334 millones. Sobre esa base se aplicó un adaptador LoRA entrenado para una tarea única de extracción estructurada; el adaptador se fusionó con los pesos base y el resultado se convirtió a GGUF.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO adicionales. Sí se especifica el formato de entrenamiento: un system prompt fijo de unos 1,4K tokens (incluido en el repositorio como `system_prompt.txt`) y un mensaje de usuario con un "evidence bundle" de cinco secciones (página renderizada, JSON-LD, registros del ATS, señales de liveness y texto almacenado). Los bundles típicos ocupan entre 4 y 5K tokens (mediana de 4,8K en entrenamiento) y el más largo evaluado rondó los 17,7K. La decodificación se hace con temperatura 0 y `max_tokens` 1024, sin herramientas ni argumentos de plantilla de chat.

## Capacidades

- Extracción de 13 campos estructurados de una oferta de empleo en un único objeto JSON plano, sin claves adicionales.
- Detección de si la oferta sigue abierta (`job_in_url`) y clasificación del motivo de inactividad (`hard_404`, `soft_404`, `redirect_to_search`, `server_error`, `login_wall`, `wrong_job`, `expired_notice`).
- Extracción de salario con moneda ISO, mínimo, máximo y periodo (hora, día, semana, mes o año), incluyendo el caso de cifra única.
- Normalización de ubicación a "Ciudad, Región, País", con estados de EE. UU. en dos letras y país "USA", dejando vacías las partes no declaradas en lugar de inventarlas.
- Clasificación de seniority en ocho niveles (Entry Level 0 años, Entry Level 1 año, Mid 2-3 años, Senior 4+ años, Lead, Manager, Director, Executive).
- Detección de anunciante intermediario (`is_agency`) y de modalidad (`onsite`, `hybrid`, `remote`).
- Capacidad multilingüe de extracción en inglés, alemán, francés y neerlandés.
- No soporta tool calling, no navega, no descarga páginas y no tiene modo de razonamiento explícito.

## Casos de uso

- Segunda pasada sobre un parser de reglas: tras un extractor basado en expresiones regulares, se envía el texto de las ofertas donde no se detectó salario para recuperar la retribución que las reglas pasaron por alto; es el uso previsto por el propio autor.
- Agregación de datos de transparencia salarial: procesar en lote ofertas de portales de empleo público y ATS para construir tablas de rangos salariales por puesto, región y sector.
- Normalización de ofertas multi-ATS: convertir registros heterogéneos (JSON-LD, API del ATS, HTML renderizado) a un esquema común de 13 campos antes de indexarlos en una base de datos.
- Detección de ofertas caducadas: clasificar páginas con 404 duro, 404 blando, redirección a buscador o muro de login para depurar un índice de ofertas activas.
- Análisis de intermediación laboral: marcar automáticamente qué anuncios provienen de agencias o bolsas de empleo en lugar del empleador final, útil para estudios de concentración de contratación.
- Enriquecimiento de datasets multilingües: extraer campos de ofertas en alemán, francés y neerlandés con el mismo esquema que las inglesas, sin mantener reglas específicas por idioma.
- Procesamiento local en hardware propio: al pesar entre 0,82 y 2,67 GB en GGUF, permite ejecutar la extracción en máquinas sin GPU dedicada y sin enviar texto de ofertas a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evaluaciones cualitativas (el salario es el campo más fuerte y supera a parsers basados en reglas en ofertas alemanas, francesas y neerlandesas), pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de extracción como precisión o F1.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para Q4_K_M, 1,5-2 GB para Q8_0 y 3 GB para f16, más el espacio de contexto (el autor recomienda configurar al menos 24K tokens, lo que añade memoria para la caché KV).
- Cabe en cualquier GPU de consumo con 4 GB o más; también es viable en CPU gracias al tamaño reducido.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, una RTX 3060, RTX 4060 o superior es suficiente, y para lotes grandes conviene una GPU con más memoria para paralelizar peticiones.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y cualquier servidor compatible con GGUF; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| joa-job-extractor-400m-gguf | 1.334 M totales, ~400 M activos | No especificado; recomendado ≥24K | Extracción JSON de ofertas de empleo | Apache 2.0 | GGUF |
| ibm-granite/granite-3.1-1b-a400m-instruct (base) | 1.334 M totales, ~400 M activos | No disponible | Instrucciones generales | Apache 2.0 | Safetensors y otros |
| Parsers basados en reglas (por ejemplo, extractores de JSON-LD) | No aplica | No aplica | Extracción de campos de ofertas | Variable | Código |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de extracción frente a alternativas. La comparación con el modelo base es directa en arquitectura y tamaño, pero el fine-tune está especializado en una única tarea y no conserva necesariamente las capacidades generales del original.

## Limitaciones y advertencias

- El modelo solo funciona bien con el system prompt exacto incluido en el repositorio y con el formato de evidence bundle de cinco secciones; cualquier variación del prompt degrada la salida.
- No navega, no descarga páginas y no tiene herramientas: únicamente procesa el texto que se le entrega.
- No está pensado para tomar decisiones sobre personas, puntuar candidatos ni extraer datos de páginas que no sean ofertas de empleo.
- Riesgo de alucinación en campos como ubicación o salario si el texto es ambiguo; el autor mitiga parcialmente esto con la regla de dejar vacío en lugar de inventar, pero no hay garantía formal.
- Cobertura lingüística limitada a inglés, alemán, francés y neerlandés; no se declara soporte para castellano.
- La longitud de contexto no está documentada de forma oficial; ejecutarlo por debajo de 24K puede truncar bundles largos (el máximo evaluado fue de 17,7K tokens).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Granite 3.1 y las obligaciones de atribución.
- No se han publicado métricas cuantitativas de precisión, recall o F1 por campo, lo que dificulta estimar su fiabilidad en producción sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JobOpportunitiesAPI/joa-job-extractor-400m-gguf
- Organización en Hugging Face: https://huggingface.co/JobOpportunitiesAPI/models
- Sitio del autor: https://jobopportunitiesapi.org
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-1b-a400m-instruct
- System prompt del modelo: https://huggingface.co/JobOpportunitiesAPI/joa-job-extractor-400m-gguf/blob/main/system_prompt.txt
- Proyecto relacionado de extracción de empleo (no afiliado): https://github.com/costibaicu/AI-Job-Extractor
