# aimeri/name-generator

## Resumen

Name Generator es un modelo de generación de texto especializado en la creación de nombres propios de persona, desarrollado por el usuario aimeri y publicado en Hugging Face. Se trata de un ajuste fino (fine-tune) completo de 3.429 millones de parámetros sobre Ministral-3-3B-Base-2512-chatml, un modelo base de la familia Ministral 3 al que se ha añadido el formato de conversación ChatML. El problema que resuelve es muy concreto: los modelos de lenguaje tienden a reciclar siempre el mismo puñado de nombres ficticios (Elara Voss, Kael Thorne, Dr. Sarah Chen), algo especialmente molesto para escritores y desarrolladores de juegos o narrativas que necesitan variedad y verosimilitud cultural.

El modelo está entrenado para responder a peticiones como "un nombre de hombre brasileño" o "una mujer del Imperio otomano" con un único nombre, sin texto adicional, basándose en datos reales de frecuencia de nombres procedentes de oficinas nacionales de estadística (SSA, INSEE, ONS, INE, IBGE, entre otras) y de Wikidata. Cubre 333 países y estados históricos, respeta convenciones locales de orden de nombres (apellido primero en chino, japonés o húngaro; patronímicos en ruso; dos apellidos en español y portugués) y permite controlar sexo y década de nacimiento. Es relevante porque demuestra el valor de los fine-tunes hiperespecializados de tamaño reducido: con solo 3,4B de parámetros y una época de entrenamiento sobre 8.536 ejemplos, supera con claridad a modelos generales en esta tarea. Existe una versión v2 que añade nombres de fantasía, y cuantizaciones GGUF para su uso local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ministral3ForCausalLM (transformer decoder causal, variante de Ministral 3) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); pesos originales en bfloat16 |
| Idiomas soportados | ingles (peticiones en ingles; los nombres generados abarcan 333 paises y estados historicos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6,9 GB el repositorio) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Ministral-3-3B-Base-2512-chatml, la variante text-only de Ministral-3-3B-Base-2512 a la que se le han asignado los tokens `<|im_start|>` y `<|im_end|>` para el formato ChatML. La arquitectura subyacente es un transformer decoder causal implementado como `Ministral3ForCausalLM`, lo que requiere transformers 5.x para su carga. No es un modelo MoE: todos los parámetros están activos en cada pasada.

El entrenamiento fue un ajuste fino supervisado completo (no LoRA) realizado con Unsloth y TRL, calculando la pérdida únicamente sobre el turno del asistente. Se usó el dataset `aimeri/name-generator` (tag v1), con 8.536 ejemplos de entrenamiento y 459 de validación. Cada ejemplo empareja una petición en lenguaje natural con un único nombre. Los nombres se muestrearon a partir de datos reales de frecuencia por país, sexo y década de nacimiento: oficinas nacionales de estadística (US SSA y Census, INSEE, ONS, INE, IBGE, PESEL, SSB, SCB), personas de Wikidata por ciudadanía y década de nacimiento, y listas de locales de Faker y Mimesis. Las peticiones fueron redactadas por Ministral-3-3B-Instruct-2512 a partir de los metadatos de cada nombre. Los hiperparámetros fueron: learning rate 1e-5 con schedule lineal, 5% de warmup, 1 época (2.134 pasos), batch efectivo de 4, AdamW de 8 bits y weight decay de 0,001, con transformers 5.20.2 y Unsloth 2026.10.9. No se menciona RLHF ni DPO.

## Capacidades

- Generación de un único nombre completo por petición, sin texto adicional, terminando con `<|im_end|>`.
- Nombres por país o nacionalidad ("Nigerian", "from Peru"), por estado histórico ("Ottoman Empire", "Soviet Union", "Song dynasty") o por región ("West African").
- Control de sexo y época: peticiones como "a woman born in the 1950s" desplazan los nombres de pila hacia esa década.
- Respeto de convenciones locales de nombres: apellido primero en chino, japonés, coreano, húngaro y vietnamita; patronímicos en nombres rusos y ucranianos completos; dos apellidos en nombres españoles y portugueses.
- Variedad mediante muestreo: a temperatura 0,7–1,0 produce nombres distintos en cada generación; la decodificación greedy devuelve siempre el nombre más típico.
- Formato conversacional ChatML, compatible con servidores OpenAI-compatible (llama.cpp, vLLM, LM Studio).
- No soporta (ni está diseñado para) tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Escritura creativa y ficción: un autor puede pedir nombres coherentes con la nacionalidad, sexo y época de cada personaje (por ejemplo, "un hombre alemán nacido en los años cincuenta") y obtener resultados verosímiles en lugar de los nombres estereotipados de los LLM generales.
- Desarrollo de videojuegos: generación procedural de NPCs con nombres culturalmente correctos, incluyendo estados históricos como la dinastía Song o el Imperio otomano para juegos de ambientación histórica.
- Datos de prueba y testing: relleno de bases de datos de prueba con nombres realistas por región, útil para QA de formularios, internacionalización y validación de campos de nombre.
- Prototipado de productos: generación rápida de perfiles ficticios en demos y maquetas sin depender de listas estáticas o de la invocación a un LLM grande y costoso.
- Escenografía narrativa en TTRPG y escritura colaborativa: nombres coherentes para personajes de campañas ambientadas en países o épocas concretas, muestreando una vez por personaje a temperatura 0,8.
- Anonimización y datos sintéticos: creación de nombres plausibles para datasets sintéticos que deban respetar patrones onomásticos locales (orden de apellidos, patronímicos) en análisis y demostraciones.
- Herramientas de asistencia al guion: nombres de personajes para guiones o novelas coral, evitando la repetición de nombres que delataría el uso de un LLM genérico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye ejemplos cualitativos de salidas (greedy y muestreadas a temperatura 0,8) para peticiones de nombres brasileños, japoneses, alemanes, rusos, mexicanos y de la dinastía Song, pero sin métricas cuantitativas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: unos 7 GB (3,43B de parámetros a 2 bytes), más overhead de contexto; el repositorio safetensors pesa 6,9 GB.
- Con cuantizaciones GGUF: aproximadamente 3,7 GB en Q8_0, 2,9 GB en Q6_K, 2,5 GB en Q5_K_M y 2,1 GB en Q4_K_M (estimaciones a partir del tamaño de cada cuant, no publicadas explícitamente).
- Cabe con holgura en GPUs de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o superiores; incluso en GPUs de 8 GB con Q4_K_M. También es viable su ejecución en CPU con llama.cpp dada la carga corta (max_new_tokens ~24).
- GPUs de datacenter (A100, H100, L4) solo necesarias si se sirve a muchos usuarios concurrentes; para uso individual son innecesarias.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama mediante los GGUF publicados en `aimeri/name-generator-GGUF`; vLLM o cualquier servidor OpenAI-compatible para servirlo vía API; transformers 5.x con `AutoModelForCausalLM` y `device_map="auto"` para uso directo en Python.
- Latencia: no se publican cifras, pero al generar como máximo 24 tokens nuevos por respuesta, la latencia por petición es muy baja incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| aimeri/name-generator (este modelo) | 3,43B | Nombres reales por pais, sexo y epoca | Apache 2.0 | safetensors y GGUF (Q8_0 a Q4_K_M) |
| aimeri/name-generator-v2 | no disponible (mismo base) | Nombres reales mas fantasia (elfos, enanos, orcos, dragones, reinos) | Apache 2.0 | Hugging Face |
| Ministral-3-3B-Instruct-2512 (modelo base general) | ~3B | Modelo general de instruccion; genera nombres pero con fuerte sesgo hacia un puñado recurrente | no disponible en la informacion proporcionada | Hugging Face |
| Faker / Mimesis (librerias, no LLM) | no aplica | Nombres por locale desde listas estaticas; sin comprension de lenguaje natural ni epoca historica | MIT / MIT | pip |

Frente a un LLM general de tamaño similar, este modelo ofrece nombres mucho más variados y culturalmente precisos a cambio de no servir para ninguna otra tarea. Frente a librerías como Faker, aporta comprensión de peticiones en lenguaje natural, cobertura de estados históricos y control por década de nacimiento.

## Limitaciones y advertencias

- Solo nombres reales: no hay nombres de fantasía en el entrenamiento; si se pide un nombre de elfo devuelve nombres de sonoridad inglesa ("Lily Lore", "Zoe Lightfoot"). Para fantasía existe la versión v2.
- Devuelve siempre un nombre completo: al no haber respuestas de solo nombre o solo apellido en el entrenamiento, una petición de "un apellido nigeriano" sigue produciendo un nombre completo.
- El sexo puede fallar al muestrear: en peticiones de nombres femeninos de contextos con poca cobertura (por ejemplo, Imperio otomano) algunas muestras son nombres masculinos.
- La cobertura sigue a los datos: en países sin estadísticas oficiales de nombres, los nombres provienen de personas notables de Wikidata, que presentan sesgo hacia personas mayores, hombres y de élite. Algunas combinaciones reflejan expatriados o errores de datos (por ejemplo, un "Maxwell Sergeevich" entre los nombres rusos).
- Entrenado con peticiones cortas en inglés: el comportamiento con peticiones largas o en otros idiomas no está garantizado (la model card se corta en este punto, por lo que no se puede detallar más).
- La decodificación greedy devuelve siempre el mismo nombre (el más típico); para variedad hay que muestrear a temperatura 0,7–1,0 y pedir un nombre por carácter.
- Detalles técnicos de integración: el template ChatML no emite `<s>` y lo añade el tokenizador al codificar; usar `apply_chat_template(..., tokenize=True)` omite ese token y desvía al modelo de su entrenamiento. Además, el `content` debe ser una cadena plana, no una lista de partes `{"type": "text"}`.
- No hay datos de alucinación ni de sesgos más allá de los onomásticos descritos, dado el alcance estrecho de la tarea.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo: https://huggingface.co/aimeri/name-generator
- Version v2 (con nombres de fantasia): https://huggingface.co/aimeri/name-generator-v2
- Cuantizaciones GGUF: https://huggingface.co/aimeri/name-generator-GGUF
- Dataset de entrenamiento (tag v1): https://huggingface.co/datasets/aimeri/name-generator/tree/v1
- Modelo base: https://huggingface.co/aimeri/Ministral-3-3B-Base-2512-chatml
