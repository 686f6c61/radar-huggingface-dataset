# egeboy35/mret-64k

## Resumen

MRET 64K es un tokenizador para turco desarrollado por el usuario egeboy35, publicado en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje con pesos entrenados, sino exclusivamente de un vocabulario y un conjunto de reglas de segmentación (tokenizer) de 65.536 tokens. Su propósito es servir como pieza de preprocesamiento para entrenar o adaptar modelos de lenguaje en turco, un idioma con morfología aglutinante y alta productividad léxica que penaliza especialmente a los tokenizadores diseñados para inglés.

La propuesta central es la "compresión sin pérdida": cualquier texto de entrada se decodifica de vuelta byte a byte, nunca se produce el token `<unk>` y no se aplica normalización de texto. El tokenizador emplea un modelo Unigram con segmentación flexible guiada por análisis morfológico (Zeyrek y convenciones TrMorph), de modo que las fronteras de token tienden a alinearse con fronteras de morfemas cuando el coste adicional compensa.

La familia MRET se publica en tres tamaños de vocabulario (32K, 64K y 128K). Según la model card, en la comparativa de 12 tokenizadores turcos, MRET 64K obtiene el mejor resultado entre los tokenizadores sin pérdida en las columnas de compresión de texto y en F1 morfológico y precisión de raíz. El repositorio no contiene ningún modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador Unigram con pre-tokenizador byte-level y segmentación flexible |
| Parametros totales | no disponible (no es un modelo de lenguaje; solo tokenizador) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un tokenizador) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | No hay pesos; vocabulario y configuración en formato `transformers` (config.json + tokenizer) |

## Arquitectura y entrenamiento

El tokenizador combina un pre-tokenizador de nivel de byte con un modelo Unigram de 65.536 tokens. La segmentación es flexible: una palabra recibe el mínimo número de tokens salvo que un token adicional coloque una frontera en un límite de morfema cuyo valor supere el coste del token extra (1,25 para este tamaño; el final de la raíz cuenta el triple). Los pesos de los tokens se entrenaron sobre análisis morfológicos de Zeyrek mapeados a las convenciones de TrMorph, y las palabras que aparecen 50 o más veces en una muestra de conteo de 300 millones de palabras y que son un único token se mantienen como token único.

El pre-tokenizador byte-level trata los sufijos tras apóstrofo como piezas independientes ("Türkiye" + "'nin"), mantiene enteros los números de cuatro dígitos (años), divide números más largos en grupos de tres y agrupa secuencias de puntuación en una sola pieza. Los números con separadores forman una única pieza ("12.03.2024", "14:30", "%45,5", "1.250,75", "1923-1938"). El vocabulario incluye siempre los años 1900-2050, los números 0-999 y las piezas `.d`, `.dd`, `,d`, `,dd`, `:00`-`:59` y `%0`-`%100`. No se aplica normalización de texto; el texto en forma NFD cuesta entre dos y tres veces más tokens, por lo que se recomienda convertir los datos a NFC antes de tokenizar.

## Capacidades

- Tokenización sin pérdida: toda entrada se decodifica byte a byte y nunca se genera `<unk>`.
- Segmentación morfológicamente informada para turco, con fronteras de token alineadas a morfemas cuando resulta rentable.
- Manejo específico de formatos numéricos: fechas, horas, importes, porcentajes, rangos de años y números con sufijos.
- Tokens especiales de chat: `<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>` (ids 4-7).
- Soporte de tool calling en la plantilla: `<|tool|>`, `<|tool_call|>`, `<|tools|>` (ids 8-10), con llamadas en JSON y resultados en rol `tool`.
- Tokens de fill-in-the-middle para entrenamiento de código: `<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`, `<|fim_pad|>` (ids 11-14).
- Tokens reservados del id 15 al 71 (`<|reserved_7|>` a `<|reserved_63|>`).
- Plantilla de chat integrada vía `apply_chat_template` (requiere `jinja2`).
- No incluye capacidades de generación, razonamiento, visión ni audio: es exclusivamente un tokenizador.

## Casos de uso

- Entrenamiento de modelos de lenguaje en turco desde cero: el tokenizador reduce el número de tokens por documento frente a alternativas BPE, lo que disminuye el coste computacional por época y permite secuencias efectivas más largas con la misma ventana.
- Adaptación de vocabulario para modelos multilingües: sustituir o ampliar el tokenizador de un modelo base con MRET 64K para mejorar la eficiencia en turco, validando que el round-trip se mantiene exacto.
- Preprocesamiento de corpus legales y oficiales: los formatos de fecha, hora, importe y porcentaje se tokenizan como piezas únicas, lo que preserva la integridad de los datos numéricos en documentos administrativos.
- Procesamiento de redes sociales y foros: la columna "Informal" de la comparativa (207,7 tokens por 1.000 caracteres) indica buen comportamiento en texto no normativo, útil para análisis de opinión y moderación.
- Pipelines de agentes con tool calling en turco: la plantilla incluye bloques `<|tools|>` y `<|tool_call|>` con argumentos en JSON, lo que permite construir asistentes que invoquen funciones externas sin definir un formato ad hoc.
- Entrenamiento de modelos de autocompletado de código con contexto turco: los tokens FIM permiten entrenar tareas de infilling en repositorios donde los comentarios y la documentación están en turco.
- Normalización y validación de datos antes de ingesta: al no normalizar y garantizar round-trip exacto, sirve para verificar que un corpus no ha sufrido alteraciones durante el preprocesamiento.

## Benchmarks y rendimiento

Datos de la model card, sobre el split de test del corpus del autor y con las métricas del informe "Türkçe Tokenizer Karşılaştırma" (13 de noviembre de 2026). Las columnas de compresión son tokens por 1.000 caracteres (menor es mejor). "4 domains" promedia oficial, enciclopédico, informal y noticias. Round trip es el porcentaje de documentos decodificados exactamente. Morph F1 y precisión de raíz se miden sobre 163.112 palabras flexionadas.

| Tokenizer | 4 domains ↓ | Informal ↓ | 46 domains ↓ | Round trip % ↑ | Vocab usado % ↑ | Morph F1 ↑ | Root acc. ↑ | Formatos ↓ |
|---|---|---|---|---|---|---|---|---|
| MRET 64K | 199,2 | 207,7 | 206,3 | 100,0 | 58,17 | 61,37 | 72,14 | 3,40 |
| NC-64k | 207,9 | 210,2 | 212,9 | 100,0 | 57,98 | 57,10 | 59,83 | 4,89 |
| TR-BPE-64k | 213,2 | 219,2 | 216,7 | 100,0 | 56,42 | 49,42 | 52,48 | 4,67 |
| TR-BPE FineWeb 64k | 214,4 | 221,3 | no disponible en la información proporcionada | 100,0 | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ya que el repositorio no contiene pesos.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el tokenizador no requiere GPU y se ejecuta en CPU con memoria despreciable (vocabulario de 65.536 entradas).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: sí, cualquier CPU o GPU puede ejecutar la tokenización; no hay requisito de VRAM.
- Opciones de despliegue: biblioteca `transformers` (`AutoTokenizer`); al ser un tokenizador estándar de Hugging Face, puede usarse en pipelines que consuman tokenizadores de la Hub (por ejemplo, servidores de inferencia que carguen el tokenizador junto con un modelo compatible).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Idiomas | Licencia | Compresión 4 dominios ↓ | Morph F1 ↑ | Round trip |
|---|---|---|---|---|---|---|
| MRET 64K | 65.536 | tr | Apache 2.0 | 199,2 | 61,37 | 100 % |
| NC-64k | 64.000 | tr | no disponible | 207,9 | 57,10 | 100 % |
| TR-BPE-64k | 64.000 | tr | no disponible | 213,2 | 49,42 | 100 % |
| TR-BPE FineWeb 64k | 64.000 | tr | no disponible | 214,4 | no disponible | 100 % |

La model card señala que, en la cuota de vocabulario utilizada, los tokenizadores con vocabulario más pequeño van por delante; es decir, MRET 64K no lidera esa métrica concreta (58,17 % de vocabulario usado frente a valores superiores de tokenizadores más pequeños). La ventaja declarada se concentra en compresión, morfología y formatos entre los tokenizadores sin pérdida.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo: no genera texto ni resuelve tareas por sí mismo; requiere un modelo de lenguaje entrenado con él.
- Solo cubre turco; su rendimiento en otros idiomas no está documentado y no debería asumirse.
- El texto en forma NFD cuesta entre dos y tres veces más tokens; es obligatorio convertir a NFC antes de tokenizar para evitar penalizaciones de compresión.
- Riesgo de inyección de roles: por defecto, cadenas como `<|user|>` o `<s>` en texto plano se convierten en tokens especiales. Para texto no confiable debe usarse `tok(text, add_special_tokens=False, split_special_tokens=True)`.
- La plantilla de chat requiere `jinja2` instalado.
- No se publican datos de sesgo, toxicidad ni evaluación en dominios distintos del corpus del autor; la comparativa se basa en el split de test del propio desarrollador, lo que puede introducir sesgo de selección.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos de modelo no hay garantías sobre modelos derivados entrenados con este tokenizador.
- El tokenizador no normaliza; textos con variantes ortográficas o errores tipográficos no se corrigen y pueden fragmentarse de forma subóptima.

## Enlaces

- Hugging Face: https://huggingface.co/egeboy35/mret-64k
- MRET 32K: https://huggingface.co/egeboy35/mret-32k
- MRET 128K: https://huggingface.co/egeboy35/mret-128k
- Tokenizador comparado NC-64k: https://huggingface.co/nesicn/nc-turkce-bpe-64k
- Tokenizador comparado TR-BPE-64k: https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-64k
- Tokenizador comparado TR-BPE FineWeb 64k: https://huggingface.co/canbingol/tr-bpe-fineweb-64k
- Dataset de análisis morfológico: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
