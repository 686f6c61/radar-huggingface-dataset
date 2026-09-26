# NAME0x0/Jevlet

## Resumen

Jevlet es un modelo de decisión de tipo "System-One" desarrollado por el usuario NAME0x0 (versión v6). No genera texto: recibe un estado compuesto por un comando escrito por la persona usuaria más el contenido de la pantalla, junto con un conjunto de preguntas tipadas, y devuelve probabilidades calibradas sobre las opciones que se le ofrecen. Está pensado para alimentar una paleta de comandos always-on en Windows, donde cada acción se elige, no se redacta. Es una replicación de investigación de la idea detrás de Jev, de TypeSafe, y se apoya en el encoder BAAI/bge-small-en-v1.5.

Técnicamente es un encoder transformer (familia BERT) de 33.508.992 parámetros en total, reutilizado como columna vertebral sobre la que se montan varias cabezas de clasificación que responden a la vez a distintas preguntas sobre el mismo estado: qué acción se pide (50 skills), si es arriesgado ejecutarla sin preguntar (cabecera "Noul", sí/no), qué app, ventana, archivo o recordatorio se está eligiendo entre las opciones vivas del entorno, y qué fragmento literal del comando es el texto a utilizar. Una cabeza de tipo pointer puntúa cada opción en su token de frontera y temperaturas por tipo calibran por separado las elecciones y las respuestas sí/no.

Su relevancia actual es doble. Por un lado, demuestra que un modelo de 33 millones de parámetros, entrenado en 3,34 horas sobre una A100 con un pico de 10,2 GB de VRAM, puede alcanzar un 98,0 % de exactitud en la elección de skill sobre comandos humanos retenidos con un ECE de 0,010 (0,001 tras calibración). Por otro, aporta una receta concreta de calibración (pérdida ce_brier, temperaturas por tipo de pregunta y umbrales de ejecución P(safe) ≥ 0,9 y confianza ≥ 0,75 por respuesta) para construir asistentes de escritorio que deciden cuándo actuar y cuándo preguntar. El repositorio del modelo registra 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base BAAI/bge-small-en-v1.5) con cabezas de clasificación múltiples y cabeza pointer; topología `block_bidir` (las ramas reinician posiciones tras el estado compartido) |
| Parametros totales | 33.508.992 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card (el encoder base BAAI/bge-small-en-v1.5 declara 512 tokens de posición) |
| Tipos de cuantizacion | No se documentan esquemas de cuantización (INT8, INT4, GGUF, AWQ, etc.); se distribuye un checkpoint en fp16 y safetensors equivalentes |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (sin pickle, con `config.json` y temperaturas) y `jevlet-v6.pt` (checkpoint fp16 con temperaturas por tipo) |
| Modelo base | BAAI/bge-small-en-v1.5 (fine-tuning) |
| Tarea (pipeline) | text-classification |
| Libreria declarada | pytorch |
| Numero de skills | 50 (`shared/skills.json`), cada una con preguntas de argumentos tipadas |
| Tipos de pregunta | Elección de skill (50 opciones), riesgo "Noul" (sí/no fijo), elección de argumento (opciones del entorno vivo), elección de span de texto (`shared/text_rules.json`) |
| Temperaturas de calibracion | `choice`: 1,4180543422698975; `default`: 1,1358089447021484; `noul`: 1,0306620597839355 |
| Umbral de ejecucion | Ejecuta con una pulsación si P(safe) ≥ 0,9 y todas las confianzas ≥ 0,75; en caso contrario, pregunta |
| Filas de entrenamiento | 1.350.835 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

Jevlet parte del encoder BAAI/bge-small-en-v1.5 y le añade varias cabezas de decisión que se resuelven en una única pasada forward empaquetada: una cabeza de elección sobre los 50 nombres de skill, una cabeza sí/no para el riesgo de ejecución sin confirmación, una cabeza de elección de argumento cuyas opciones provienen del entorno vivo (apps instaladas, ventanas abiertas, tiendas) y una cabeza de elección de span que selecciona el fragmento literal del comando que debe usarse como texto. La topología `block_bidir` hace que cada rama reinicie sus posiciones después del estado compartido, de modo que las preguntas no se ven entre sí. Una cabeza pointer puntúa cada opción en su token de frontera y las temperaturas por tipo calibran de forma independiente las elecciones y las respuestas sí/no.

El entrenamiento usó 1.350.835 filas y 25.000 pasos con batch efectivo de 64, learning rate de 0,002 para la cabeza y 0,0001 para el encoder, scheduler coseno con 500 pasos de warmup, precisión mixta bf16 y una pérdida `ce_brier` (entropía cruzada más Brier, una regla de puntuación propia). Se ejecutó en una NVIDIA A100-SXM4-80GB en Google Colab durante 3,34 horas a 25.960 tokens/s, con un pico de 10,2 GB de VRAM. La mezcla de datos combina 600.000 filas de comandos, 240.000 de decisiones diarias, 150.000 de grounding, 182.674 reales, 96.222 públicas, 60.000 sintéticas, 19.647 de intents y 2.292 de teacher. Entre las fuentes públicas figuran TOPv2 (WillHeld/top_v2), MASSIVE (mteb/amazon_massive_intent), CLINC150 (clinc/clinc_oos), BANKING77 (mteb/banking77), BoolQ (google/boolq) y MultiNLI (nyu-mll/multi_nli). Las fuentes sintéticas generadas por el repositorio cubren variación superficial (erratas, text-speak, mayúsculas, fórmulas de cortesía), grounding de controles en pantalla, decisiones diarias y familias System-One (contradicción, información faltante, calibración y reglas). Cada fila se descarta si queda a menos de 0,8 de Jaccard de tokens (dígitos colapsados) respecto a un comando del benchmark retenido, y la build de Colab excluye la lista de apps instaladas de la persona autora y las capturas de interfaz.

## Capacidades

- Clasificación de intención sobre un espacio cerrado de 50 skills, con 98,0 % de exactitud en comandos humanos retenidos (23.279 comandos) y ECE de 0,010 sin calibrar y 0,001 calibrado.
- Evaluación de riesgo binaria ("Noul", sí/no) sobre la misma entrada, con 99,8 % de exactitud y ECE de 0,030 (0,032 tras calibración).
- Relleno de argumentos (slot filling) eligiendo entre opciones vivas del entorno: 97,1 % de exactitud y ECE de 0,012 (0,004 calibrado) sobre 14.475 preguntas retenidas.
- Selección del span de texto del comando que debe usarse como argumento, mediante una cabeza pointer y reglas declaradas en `shared/text_rules.json`.
- Grounding de elementos de interfaz: elegir qué control en pantalla corresponde a una instrucción, con 78,6 % de exactitud y ECE de 0,176 sobre 6.000 preguntas del split de desarrollo.
- Respuesta a preguntas tipadas heterogéneas en una sola pasada forward (elección, sí/no, pointer), sin que las ramas se condicionen entre sí.
- Capacidad de abstención operativa: el modelo no genera texto y el sistema solo ejecuta la acción cuando la confianza supera los umbrales definidos; en caso contrario, formula una pregunta.
- Conocimiento derivado de BoolQ y MultiNLI en forma de preguntas sí/no y de implicación tipadas (contradicción, información faltante).
- No dispone de tool calling ni de function calling en el sentido de los modelos generativos: la "llamada" es la selección de skill y argumentos, no una emisión de texto estructurado.
- No dispone de razonamiento multi-paso agéntico ni de cadena de pensamiento; es un modelo de decisión de un solo paso (System-One).
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado únicamente en inglés.
- Capacidades de visión o audio: no disponibles; el estado visual se representa como información de la pantalla suministrada al modelo, no como entrada de imagen procesada por el propio modelo.

## Casos de uso

- Paleta de comandos always-on en Windows: el modelo recibe el comando tecleado y el estado de la pantalla, elige entre las 50 skills y, si P(safe) ≥ 0,9 y todas las confianzas ≥ 0,75, ejecuta la acción con una sola pulsación; en caso contrario, pide confirmación. Es el escenario para el que fue diseñado y el único con benchmark contra entorno real reportado.
- Enrutado de intenciones en asistentes de escritorio: con 98,0 % de exactitud sobre 23.279 comandos humanos retenidos, puede usarse como clasificador de intención de primera etapa antes de cualquier componente generativo, reduciendo coste y latencia.
- Confirmación de acciones peligrosas: la cabecera "Noul" alcanza 99,8 % de exactitud al decidir si una acción requiere preguntar antes de ejecutarse, lo que la hace adecuada como guardarraíl previo a operaciones destructivas (borrado, envío, compra) en herramientas de automatización.
- Relleno de slots contra el entorno vivo: dado un comando y las opciones realmente disponibles (apps instaladas, ventanas abiertas, tiendas), resuelve con 97,1 % de exactitud qué app, ventana, archivo o recordatorio se está seleccionando, evitando menús manuales.
- Enrutado de peticiones en dominios bancarios y de atención al cliente: reutilizable como clasificador de intención fine-grained, dado que su entrenamiento incluye BANKING77 (77 intenciones) y CLINC150, además de MASSIVE en inglés.
- Selección de texto literal para plantillas: cuando la acción requiere un fragmento del propio comando (un nombre de archivo, un destinatario, un título), la cabeza de spans lo selecciona verbatim en lugar de generarlo, lo que elimina el riesgo de reescritura y facilita la trazabilidad.
- Automatizaciones con abstención obligatoria: en flujos donde un error es costoso, el modelo aporta probabilidades calibradas (ECE de 0,001 a 0,004 en skills y argumentos) que permiten fijar umbrales de automatización y derivar el resto a revisión humana.
- Investigación en calibración y decisión: al ser un modelo pequeño con notebook de entrenamiento público, 3,34 horas de cómputo y curva de escalado documentada, sirve como banco de pruebas reproducible para estudiar pérdidas tipo Brier, ECE y decodificación de preguntas tipadas.

## Benchmarks y rendimiento

Comandos humanos retenidos (nunca usados para entrenamiento ni para ajustar las reglas de span). Splits de test de TOPv2, MASSIVE y CLINC150 mapeados a las skills de Jevlet (23.279 comandos):

| Tipo de pregunta | Preguntas | Exactitud | ECE | ECE (calibrado) |
|---|---|---|---|---|
| Skill | 23.279 | 98,0 % | 0,010 | 0,001 |
| Riesgo (Noul) | 23.279 | 99,8 % | 0,030 | 0,032 |
| Argumentos | 14.475 | 97,1 % | 0,012 | 0,004 |

Split de desarrollo mezclado (todas las fuentes):

| Tipo de pregunta | Preguntas | Exactitud | ECE | ECE (calibrado) |
|---|---|---|---|---|
| Todas las preguntas | 113.616 | 97,7 % | 0,012 | n/a |
| Comandos: skill | 32.682 | 99,1 % | 0,005 | 0,001 |
| Comandos: argumentos | 29.141 | 99,2 % | 0,003 | 0,001 |
| Grounding (qué control) | 6.000 | 78,6 % | 0,176 | n/a |

Escalado con el número de ejemplos de entrenamiento (exactitud de skill sobre los comandos humanos retenidos):

| Paso | Ejemplos vistos | Exactitud de skill | ECE |
|---|---|---|---|
| 2.500 | 160.000 | 94,9 % | 0,034 |
| 6.250 | 400.000 | 96,8 % | 0,019 |
| 12.500 | 800.000 | 97,2 % | 0,015 |
| 25.000 (final) | 1.600.000 | 98,0 % | 0,010 |

Además, el repositorio incluye un benchmark manual de portátil (`jevlet/assistant/benchmark_v2.py`, 98 comandos, 6 peligrosos) que se ejecuta contra el entorno Windows real; sus cifras se reportan en GitHub y no se reproducen en la model card de HuggingFace. No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, y no serían aplicables porque el modelo no genera texto.

## Requisitos de hardware

- Tamaño de pesos: 33,5 millones de parámetros equivalen a aproximadamente 64 MB en fp16, 128 MB en fp32 y 34 MB en int8 (cálculo aritmético a partir del número de parámetros; el autor no publica estas cifras).
- VRAM de inferencia: muy inferior a 1 GB contando pesos, activaciones y el estado del entorno; cabe con holgura en cualquier GPU de consumo y es viable en CPU.
- GPU de consumo: cualquier RTX 3060, 4060, 4090 o equivalente puede servirlo sin cuantización. No requiere GPU dedicada para funcionar.
- GPU de entrenamiento: el autor usó una NVIDIA A100-SXM4-80GB (Google Colab) con un pico de 10,2 GB, 3,34 horas para 25.000 pasos a batch efectivo 64 y 25.960 tokens/s. Por el pico de memoria reportado, es razonable esperar que el entrenamiento quepa en GPUs de 12-16 GB, aunque esto no está confirmado en la información disponible.
- Opciones de despliegue: carga mediante `jevlet.system_one.SystemOne` con el checkpoint `jevlet-v6.pt`, o mediante el stack de PyTorch/Transformers con `model.safetensors` y `config.json`.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF. Al no ser un modelo generativo, estos motores no son de aplicación directa.
- Latencia y throughput de inferencia: no disponibles. El único dato de rendimiento publicado es de entrenamiento (25.960 tokens/s en bf16 sobre A100).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAME0x0/Jevlet | 33.508.992 | No disponible en la model card (encoder base de 512 posiciones) | Decisión calibrada sobre preguntas tipadas; clasificación de intención y slots | MIT | Pesos en HuggingFace (safetensors y .pt), código en GitHub |
| BAAI/bge-small-en-v1.5 | 33,4 M aprox. | 512 tokens | Embeddings de texto (retrieval, similitud) | MIT | HuggingFace; es el modelo base de Jevlet |
| DistilBERT-base-uncased | 66 M aprox. | 512 tokens | Clasificación de texto y enmascarado de lenguaje | Apache 2.0 | HuggingFace; referencia habitual en clasificación de intención de bajo coste |
| Jev (TypeSafe) | No disponible | No disponible | Decisión para paleta de comandos (referencia citada por el autor) | No disponible | No disponible en la información proporcionada |

No se dispone de resultados de benchmarks comparativos entre Jevlet y estos modelos dentro de la información proporcionada; la comparación anterior es estructural (parámetros, contexto, tarea y licencia), no de rendimiento.

## Limitaciones y advertencias

- Idioma: entrenado y evaluado únicamente en inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas, y el vocabulario y las reglas de span están ajustados al inglés.
- No genera texto: cualquier caso de uso que requiera redacción, resumen, traducción o diálogo libre queda fuera de su alcance.
- Grounding limitado: la tarea de elegir qué control de la pantalla corresponde a una instrucción obtiene 78,6 % de exactitud con un ECE de 0,176 en el split de desarrollo, muy por debajo del resto de cabeceras y sin calibración reportada. No debería usarse sin supervisión.
- Riesgo de decisión errónea con confianza alta: al no generar texto, no hay alucinación en sentido clásico, pero el modelo puede seleccionar una skill o un argumento incorrectos. La mitigación del autor son umbrales de confianza (0,9 y 0,75), que son heurísticos y no una garantía formal de seguridad.
- Espacio de acciones cerrado: solo cubre 50 skills definidas en `shared/skills.json`. Comandos fuera de ese conjunto no tienen una vía de escape documentada.
- Sesgos: no se publica ningún análisis de sesgos, equidad o toxicidad. Los datos de entrenamiento provienen en parte de asistentes y dominios concretos (TOPv2, MASSIVE, CLINC150, BANKING77, BoolQ, MultiNLI), por lo que hereda los sesgos de dominio y de anotación de esas fuentes.
- Dependencia del entorno: la calidad de las opciones vivas suministradas (lista de apps instaladas, ventanas abiertas, tiendas, recordatorios) determina directamente la precisión. La build pública excluye la lista de apps y las capturas de interfaz de la persona autora, de modo que el comportamiento en un equipo real puede diferir del reportado.
- Evaluación limitada en entorno real: el benchmark manual contra Windows consta de 98 comandos, 6 de ellos peligrosos. Es una muestra pequeña, sin intervalos de confianza publicados.
- Licencias de los datos de entrenamiento: aunque el modelo se distribuye bajo MIT, las fuentes incluyen TOPv2 (CC BY-SA 4.0), MASSIVE y BANKING77 (CC BY 4.0), CLINC150 (CC BY 3.0), BoolQ (CC BY-SA 3.0) y MultiNLI (licencia mixta, según su dataset card). El uso comercial debe revisar las condiciones de atribución y, en los casos share-alike, de redistribución derivada.
- Proyecto de investigación de un único autor, en versión v6, sin garantías de mantenimiento, sin soporte y con 0 descargas y 0 likes en HuggingFace en el momento de la consulta.
- Fecha de creación del repositorio: 2026-09-25; conviene verificar si existe una versión posterior antes de adoptarlo.
- Ejecución de acciones en el escritorio: el modelo está pensado para desencadenar operaciones reales sobre el sistema. No se documenta auditoría de seguridad, registro de acciones ni mecanismo de reversión más allá del umbral de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAME0x0/Jevlet
- Repositorio de código, pipeline de datos y notebook de entrenamiento: https://github.com/NAME0x0/Jevlet (commit `9d62c46989e9`)
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset TOPv2: https://huggingface.co/datasets/WillHeld/top_v2
- Dataset MASSIVE (Amazon): https://huggingface.co/datasets/mteb/amazon_massive_intent
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
- Dataset BANKING77: https://huggingface.co/datasets/mteb/banking77
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Busqueda web: los resultados devueltos corresponden a servicios de traducción (Google Traduction, DeepL, Reverso) y no guardan relación con el modelo; no se han encontrado enlaces adicionales relevantes.
