# barryallen16/tamil-tokenizer-wiki

## Resumen

`barryallen16/tamil-tokenizer-wiki` es un tokenizador de codificación por pares de bytes (BPE) especializado en texto tamil, desarrollado por el autor barryallen16 e implementado en Rust. Se trata de una pieza de infraestructura lingüística, no de un modelo de lenguaje generativo: su función es convertir texto tamil en secuencias de identificadores de tokens, de forma rápida y eficiente, para su uso en pipelines de NLP o como componente de modelos más grandes.

El tokenizador se entrenó sobre un corpus extraído de la Wikipedia en tamil, con 5.000 artículos, 128.000 líneas y un tamaño de 38 MB. El vocabulario resultante contiene 32.015 tokens, incluyendo 108 tokens especiales (BOS, EOS, PAD, UNK, MASK, marcadores de pregunta/respuesta/código y 100 reservados). Su relevancia actual radica en que los tokenizadores específicos para lenguas de bajos recursos como el tamil son esenciales para reducir la fragmentación de tokens y el coste computacional en modelos de lenguaje, un problema documentado en sistemas comerciales que penalizan a hablantes de tamil con un consumo de tokens hasta diez veces superior al inglés.

La implementación destaca por su rendimiento: utiliza un autómata de Aho-Corasick para el emparejamiento multi-patrón en tiempo lineal y paralelismo con rayon durante el entrenamiento. Según las pruebas del autor, supera a tiktoken (cl100k_base) en velocidad de codificación y compresión, con un factor de aceleración de 7,7× en throughput y una compresión de 2,57 bytes por token frente a 2,35.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte Pair Encoding (BPE) con pretokenización regex para unicode tamil |
| Parametros totales | No aplica (tokenizador, no modelo de lenguaje) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (no es un modelo generativo) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Tamil (ta) |
| Licencia | MIT |
| Formato de pesos | JSON (archivo `tamil_tokenizer_wiki.json`) |

## Arquitectura y entrenamiento

El tokenizador emplea el algoritmo clásico de BPE, donde se construye un vocabulario de subpalabras mediante la fusión iterativa de los pares de símbolos más frecuentes. El entrenamiento se realizó sobre 5.000 artículos de la Wikipedia en tamil (128.000 líneas, 38 MB), generando 29.999 merges. La pretokenización utiliza una expresión regular personalizada que segmenta el texto tamil en clústeres de caracteres (consonantes, signos vocálicos y matras), lo que permite un manejo correcto de la escritura brahmica.

La innovación técnica principal reside en el encoder: en lugar de aplicar las merges secuencialmente, se construye un autómata de Aho-Corasick que permite encontrar todas las coincidencias de los tokens del vocabulario en el texto en tiempo O(n), acelerando la codificación de forma significativa. Además, el entrenamiento aprovecha el paralelismo de rayon para procesar el corpus de manera concurrente. El vocabulario se organiza en tres rangos: 247 clústeres de caracteres tamil, 257 tokens a nivel de byte (compatibles con el mapeo de GPT-2) y aproximadamente 31.000 tokens de merges BPE, más los 108 tokens especiales.

## Capacidades

- Tokenización de texto tamil mediante BPE, con vocabulario de 32.015 tokens.
- Codificación y decodificación bidireccional: convierte texto en IDs de token y viceversa.
- Compatible con la librería `tokenizers` de Hugging Face, lo que permite su integración directa en pipelines de transformers.
- API en Python, Rust y CLI (binarios `encode` y `decode`).
- Incluye tokens especiales para marcado de secuencia (BOS, EOS, PAD, UNK, MASK) y para tareas específicas (pregunta, respuesta, código).
- Alto rendimiento: encoder construido con Aho-Corasick, con un speedup de 41× en la construcción del encoder y 7,7× en throughput de codificación frente a tiktoken.
- Compresión eficiente: 2,57 bytes por token en texto tamil, superior a los 2,35 de tiktoken.

## Casos de uso

- Preprocesamiento para modelos de lenguaje en tamil: cualquier LLM que se entrene o ajuste para tamil necesita un tokenizador específico; este puede usarse como capa de entrada/salida para reducir la fragmentación y el coste de tokens.
- Sistemas de traducción automática tamil-inglés: al integrarse en un pipeline de seq2seq, permite tokenizar el texto fuente tamil de forma eficiente, reduciendo la latencia en entornos de producción.
- Análisis de sentimiento en redes sociales tamil: el tokenizador puede alimentar clasificadores de texto, ya sea como preprocesador para modelos transformer o para modelos más ligeros basados en bolsas de tokens.
- Chatbots y asistentes virtuales en tamil: al ser compatible con Hugging Face, puede conectarse a frameworks de diálogo que requieran tokenización rápida y fiable en tiempo real.
- Minería de texto y extracción de información en corpus tamil: para tareas de reconocimiento de entidades o clasificación de documentos, el tokenizador ofrece una representación compacta y consistente del texto.
- Evaluación comparativa de tokenizadores: dado que incluye un corpus de entrenamiento (`tamil_wiki_corpus.txt`) y dos versiones de vocabulario, puede usarse como referencia para investigar la eficiencia de distintos algoritmos de tokenización en lenguas dravídicas.

## Benchmarks y rendimiento

La model card del autor proporciona una comparativa con tiktoken (cl100k_base) sobre texto tamil:

| Metrica | Este tokenizador | tiktoken (cl100k_base) | Speedup |
|---|---|---|---|
| Construccion del encoder | 10,83 ms | 440 ms | 41× |
| Throughput de codificacion | 10,95 MB/s | 1,43 MB/s | 7,7× |
| Ratio de compresion | 2,57 bytes/token | 2,35 bytes/token | — |

No se han publicado resultados de benchmarks adicionales (como MMLU, HumanEval o GSM8K) porque este no es un modelo de lenguaje, sino un tokenizador.

## Requisitos de hardware

- No requiere GPU: es un tokenizador que se ejecuta en CPU.
- Memoria RAM mínima: el archivo JSON del vocabulario ocupa unos pocos megabytes; el proceso de codificación es ligero.
- Compatible con cualquier sistema con Rust o Python instalado.
- Despliegue: puede usarse como librería independiente en Rust, o a través de la API de Hugging Face `tokenizers` en Python.
- Latencia: la codificación alcanza 10,95 MB/s en CPU, lo que permite procesar documentos largos en milisegundos.

## Comparativa con modelos similares

| Tokenizador | Idioma | Vocabulario | Implementacion | Licencia | Notas |
|---|---|---|---|---|---|
| `barryallen16/tamil-tokenizer-wiki` | Tamil | 32.015 | Rust + Aho-Corasick | MIT | Entrenado en Wikipedia, alto rendimiento |
| `Ailaysa-AI/asai-tokenizer-model` | Tamil | No disponible | No disponible | No disponible | Tokenizador tamil de Ailaysa, orientado a pipelines NLP y sistemas multilingües |
| `tiktoken` (cl100k_base) | Multilingüe (incluye tamil) | 100.000 | Python/C | MIT | Tokenizador de OpenAI, no optimizado para tamil; compresión inferior (2,35 bytes/token) |

La comparativa se limita a tokenizadores, ya que este modelo no es un LLM. La ventaja principal del tokenizador de barryallen16 es su velocidad y compresión específica para tamil, frente a soluciones genéricas como tiktoken.

## Limitaciones y advertencias

- Es un tokenizador, no un modelo de lenguaje: no genera texto ni realiza razonamiento; solo convierte texto en tokens y viceversa.
- Vocabulario limitado a 32K tokens, entrenado exclusivamente sobre Wikipedia en tamil; puede no cubrir jerga coloquial, dialectos regionales o terminología técnica especializada fuera del dominio enciclopédico.
- El corpus de entrenamiento es relativamente pequeño (38 MB), lo que puede afectar a la cobertura de formas poco frecuentes.
- No se han publicado evaluaciones independientes de calidad de tokenización (por ejemplo, tasa de fragmentación en textos reales fuera de Wikipedia).
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de soporte ni mantenimiento.
- El tokenizador no incluye funcionalidades de normalización de texto (por ejemplo, unificación de variantes de caracteres tamil) más allá de la pretokenización básica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/barryallen16/tamil-tokenizer-wiki
- Repositorio GitHub: https://github.com/barryallen16/tamil-tokenizer/tree/main
- Espacio Hugging Face de tokenizador tamil alternativo (Ailaysa-AI): https://huggingface.co/spaces/Ailaysa-AI/Asai-Tamil-Tokenizer
- Modelo de tokenizador Ailaysa: https://huggingface.co/Ailaysa-AI/asai-tokenizer-model/blob/main/Asai_Tamil.model
- Repositorio GitHub de Ailaysa: https://github.com/Ailaysa-Technologies/Asai-Tokenizer/tree/main/ailaysa/models
