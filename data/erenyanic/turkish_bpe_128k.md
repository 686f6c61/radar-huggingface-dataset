# erenyanic/turkish_bpe_128k

## Resumen

`erenyanic/turkish_bpe_128k` es un tokenizador BPE a nivel de byte (byte-level BPE) de 128.000 tokens, entrenado desde cero específicamente para el turco. Lo desarrolla Eren Yanic y está empaquetado para la librería `transformers` de Hugging Face. Resuelve el problema de la tokenización eficiente y sin pérdidas de texto turco generado por usuarios, un dominio con peculiaridades como el apóstrofo en nombres propios (`İstanbul'da`) y la distinción entre vocales con y sin punto (`i`/`ı`).

Su relevancia radica en que sigue las prácticas actuales de los modelos frontera (GPT-4, Llama 3, Qwen 3, DeepSeek-V3): vocabulario amplio, alfabeto base de 256 bytes y ausencia de token desconocido. Al ser un tokenizador independiente, puede integrarse como capa de preprocesado en el entrenamiento o ajuste de cualquier modelo de lenguaje turco. Está disponible bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-level BPE (tokenizador, no modelo de lenguaje) |
| Parametros totales | No aplica (vocabulario de 128.000 tokens) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo que lo use) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` (formato Hugging Face `tokenizers`), compatible con `transformers` |

## Arquitectura y entrenamiento

El tokenizador usa el algoritmo byte-level BPE, donde el alfabeto base son los 256 bytes crudos. Esto garantiza que cualquier secuencia de entrada sea representable, sin necesidad de un token `<unk>`. El vocabulario de 128.000 tokens incluye tokens especiales, los 256 tokens de byte y aproximadamente 127.700 merges aprendidos. No aplica normalización (ni siquiera NFC), preserva mayúsculas/minúsculas y agrupa dígitos en secuencias de como máximo 3 para evitar memorizar precios o años concretos.

Una innovación destacable es la corrección del apóstrofo turco: la expresión regular de división estándar de cl100k/Llama 3 incluye una cláusula de contracciones inglesas (`'s|'t|'re|...`) que rompería sufijos como `'da` en `İstanbul'da`. El autor elimina esa cláusula, permitiendo que el apóstrofo se mantenga unido al nombre propio. El entrenamiento se realizó sobre 885.902 líneas (199,6 millones de caracteres) provenientes de dos conjuntos de datos de reseñas y análisis de sentimiento en turco, con una limpieza ligera: colapso de espacios, eliminación de registros menores de 10 caracteres y de duplicados exactos.

## Capacidades

- Tokenización byte-level sin pérdida: cualquier texto Unicode se puede codificar y decodificar exactamente, incluidos caracteres fuera del repertorio turco.
- Preservación de mayúsculas y minúsculas: distingue `Ankara` de `ankara`, y maneja correctamente las vocales turcas con punto (`i`, `İ`) y sin punto (`ı`, `I`).
- Sin token desconocido: al estar basado en bytes, todo es representable; no hay riesgo de pérdida silenciosa de datos.
- Agrupación de dígitos en bloques de ≤3: evita que el vocabulario memorice números específicos.
- Manejo correcto del apóstrofo turco en nombres propios: sufijos como `'da`, `'nın` se mantienen como una sola pieza.
- Compatibilidad con `transformers`: se carga con `AutoTokenizer.from_pretrained` y es compatible con endpoints de Hugging Face.

## Casos de uso

- Entrenamiento de modelos de lenguaje turcos desde cero: el tokenizador proporciona una capa de tokenización moderna y eficiente, lista para usarse con arquitecturas transformer estándar.
- Ajuste fino (fine-tuning) de modelos multilingües para tareas en turco: al ser específico del idioma, reduce la fragmentación de palabras y mejora la compresión frente a tokenizadores genéricos.
- Pipelines de análisis de sentimiento en turco: entrenado con datos de reseñas, es adecuado para preprocesar textos de opiniones, valoraciones y comentarios de usuarios.
- Sistemas de generación de texto en turco (chatbots, asistentes): al preservar mayúsculas y el apóstrofo, mantiene la fidelidad ortográfica en la salida generada.
- Preprocesado para tareas de PNL en dominios con argot o texto informal: al usar datos generados por usuarios, captura variaciones coloquiales y errores tipográficos comunes.
- Investigación en tokenización byte-level: sirve como referencia para estudiar el impacto del tamaño de vocabulario y la ausencia de normalización en la calidad de representación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona una evaluación sobre una muestra aleatoria de 20.000 líneas, pero no se incluyen las métricas (como tasa de compresión o cobertura) en la documentación proporcionada.

## Requisitos de hardware

- No aplica para inferencia de modelo: al ser un tokenizador, no requiere GPU ni VRAM.
- Ejecución en CPU: la codificación y decodificación se realizan en memoria, con requisitos mínimos (menos de 100 MB para el vocabulario y merges).
- Integración: se usa como componente de preprocesado en pipelines de `transformers`, `tokenizers` o directamente con el archivo `tokenizer.json`.
- Despliegue: puede servirse como parte de un endpoint de Hugging Face o integrarse en aplicaciones locales sin necesidad de aceleración hardware.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros tokenizadores turcos. Como referencia contextual:

| Tokenizador | Vocabulario | Enfoque | Particularidades |
|---|---|---|---|
| `erenyanic/turkish_bpe_128k` | 128.000 | Byte-level BPE | Sin normalización, sin `<unk>`, apóstrofo turco |
| Tokenizador de Llama 3 (multilingüe) | 128.000 | Byte-level BPE | Incluye cláusula de contracciones inglesas, no optimizado para turco |
| Tokenizadores BPE clásicos (p.ej. SentencePiece) | Variable | BPE / unigram | Normalización y manejo de `<unk>` dependiente de la configuración |

La diferencia principal frente a opciones multilingües es la especialización: este tokenizador está entrenado exclusivamente con texto turco, lo que debería producir una segmentación más compacta en ese idioma, aunque no hay métricas que lo confirmen en la documentación.

## Limitaciones y advertencias

- Datos de entrenamiento limitados a texto generado por usuarios (reseñas y análisis de sentimiento): puede tener un sesgo hacia vocabulario coloquial y dominios de consumo, con menor cobertura de textos técnicos, legales o académicos.
- Sin normalización: no se aplica NFC ni se pliega acentos; caracteres visualmente similares pero con distintas codificaciones se tratan como diferentes.
- Vocabulario fijo de 128.000 tokens: si se necesita ampliar o adaptar a dominios específicos, habría que reentrenar el tokenizador.
- No es un modelo de lenguaje: no genera texto ni tiene capacidades de razonamiento; es únicamente una capa de preprocesado.
- Ausencia de métricas publicadas: no hay datos objetivos de compresión, cobertura o velocidad que permitan evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erenyanic/turkish_bpe_128k
- Repositorio de código y entrenamiento: https://github.com/ErenYanic/eldamar-tokenizer
- Dataset de entrenamiento 1: https://huggingface.co/datasets/winvoker/turkish-sentiment-analysis-dataset
- Dataset de entrenamiento 2: https://huggingface.co/datasets/kmkarakaya/turkishReviews-ds
