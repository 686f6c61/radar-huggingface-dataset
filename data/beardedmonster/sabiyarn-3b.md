# BeardedMonster/sabiyarn-3B

## Resumen

SabiYarn 3B es, en la práctica, un repositorio que contiene **únicamente el tokenizer** del proyecto SabiYarn 3B: no existen pesos del modelo. Lo publica BeardedMonster (el tokenizer predecesor, SabiYarn 0.5B, aparece asociado a la cuenta AletheiaAING) y es un tokenizer BPE a nivel de byte con un vocabulario de 131.072 tokens (2^17), diseñado para inglés, francés, árabe y lenguas africanas.

El problema que aborda es la tokenización ineficiente de lenguas de bajos recursos: un texto en zulú, wolof o kikuyu consume muchos más tokens con tokenizers pensados para inglés, lo que encarece el entrenamiento y reduce el contexto efectivo. Según la model card, este tokenizer necesita un 14,8% menos de tokens que el de SabiYarn 0.5B sobre texto retenido, con mejoras del 30% en francés, 38% en kikuyu y 45% en kabiye.

Es relevante ahora porque amplía el vocabulario del proyecto sin romper la compatibilidad con la versión 0.5B (mismos 180 tokens especiales con ids 0-179 y plantilla de chat idéntica), lo que permite reutilizar corpus y plantillas ya preparados. Conviene subrayar que **el nombre "3B" no implica que haya un modelo de 3.000 millones de parámetros disponible**: no hay arquitectura de red, ni contexto, ni pesos publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tokenizer BPE a nivel de byte (no es un modelo neuronal; el repositorio no contiene pesos) |
| Parámetros totales | 3.000 millones según el nombre del repositorio; no hay pesos publicados que lo confirmen |
| Parámetros activos | No aplica (no es MoE; no hay pesos) |
| Longitud de contexto | No disponible (un tokenizer no define ventana de contexto y no hay modelo) |
| Tipos de cuantización | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | 23 etiquetas declaradas: en, yo, ig, ha, pcm, am, ti, ar, sw, zu, xh, sn, ny, rw, st, tn, so, om, af, wo, ee, tw, fon; la descripción añade francés y árabe; evaluación sobre 73 lenguas |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (sin safetensors ni GGUF); el repositorio contiene tokenizer.json, tokenizer_config.json y chat_template.jinja |
| Vocabulario | 131.072 tokens (2^17) |
| Composición del vocabulario | 180 tokens especiales + 256 símbolos de byte + 130.636 merges |
| Normalizador | NFC |
| Cobertura de bytes | 256/256 símbolos de byte presentes; sin OOV |
| Almacenamiento de corpus | Requiere uint32 (4 bytes por token) al superar el id 65.535 |

## Arquitectura y entrenamiento

El tokenizer es un BPE a nivel de byte entrenado con `BpeTrainer` de la librería `tokenizers`, con `min_frequency` 2, normalizador NFC y el mismo pre-tokenizer que SabiYarn 0.5B (separación por espacios y puntuación seguida de BPE a nivel de byte). Los 180 tokens especiales están fijados a los ids 0-179, con los mismos flags que en la versión 0.5B, de modo que datos, plantilla de chat y tokens de tool-call resultan portables.

El corpus de entrenamiento fue una muestra aleatoria de 4,91 GB de texto (14,35 millones de documentos, 71 lenguas, 1.570 millones de tokens medidos con el tokenizer de 0.5B) extraída del corpus de preentrenamiento deduplicado y verificado por lengua del proyecto. El reparto reserva un 8% a inglés, un 4% a francés y un 3% a árabe; el 85% restante se asignó al estilo UniMax con una época por lengua (las lenguas con poco datos se toman enteras y las grandes se limitan a unos 25-30 millones de tokens cada una, unos 55-115 MB de texto). Se eliminaron 50.649 documentos contaminados (con frases de FLORES+ devtest o idénticos a documentos de evaluación de FineWeb-2). El entrenamiento completo duró 17 minutos.

La innovación principal no es algorítmica sino de eficiencia: sobre texto retenido del mismo corpus, ponderado por la mezcla del contenedor de 40.000 millones de tokens, el texto necesita un 14,8% menos de tokens que con el tokenizer de 0.5B (inglés 4% menos, francés 30%, zulú 17%, wolof 19%, kikuyu 38%, kabiye 45%; amárico sin cambios).

## Capacidades

- Tokenización BPE a nivel de byte con vocabulario de 131.072 tokens y sin tokens desconocidos (los 256 símbolos de byte están presentes).
- Normalización NFC: las formas NFD y NFC de una palabra producen los mismos ids; el texto ya en NFC hace round-trip exacto (20.910 de 20.910 textos) y el resto decodifica a su forma NFC.
- Compatibilidad retroactiva con SabiYarn 0.5B: los 180 tokens especiales conservan los ids 0-179 y la plantilla `chat_template.jinja` es idéntica.
- Tokens especiales para lengua, tarea, rol de chat, razonamiento, tool-call y audio, además de claves JSON entrecomilladas.
- Cobertura multilingüe evaluada en 73 lenguas (86 etiquetas en los tokens especiales), con datos de FLORES+ devtest y FineWeb-2.
- Eficiencia de tokenización medida: 1,71 tokens por palabra de media en las 73 lenguas y 1,61 en las 25 lenguas principales.
- **No** genera texto, no razona, no hace tool calling ni procesa audio: es un componente de preprocesado, no un modelo de lenguaje.

## Casos de uso

- Preprocesado de corpus multilingües africanos: tokenizar millones de documentos en 73 lenguas con un vocabulario que cubre yoruba, igbo, hausa, suajili, zulú, amárico y wolof sin perder caracteres por OOV.
- Reducción del coste de entrenamiento e inferencia: al necesitar un 14,8% menos de tokens sobre la mezcla objetivo, un modelo futuro entrenado con este tokenizer vería reducido su presupuesto de cómputo y de memoria de secuencia en esa proporción.
- Entrenamiento de un modelo desde cero: el tokenizer sirve como pieza fija para definir el vocabulario de salida (131.072 clases) de un transformer que aún no se ha publicado.
- Compatibilidad con pipelines existentes del proyecto: los corpus, la plantilla de chat y los tokens de herramienta escritos para SabiYarn 0.5B se reutilizan sin remapear ids.
- Evaluación comparativa de tokenizers: la tabla de tokens por palabra de la model card permite medir y comparar alternativas (Serengeti, NLLB-200, AfriTeVa v2, AfroXLMR, Gemma 3, Llama 4) sobre el mismo texto.
- Preprocesado para pipelines de voz: los tokens especiales de audio del vocabulario permiten una integración temprana con sistemas TTS/ASR del mismo proyecto.
- Almacenamiento de corpus tokenizados: planificar el uso de uint32 (4 bytes por token) en lugar de uint16 para evitar desbordamientos al superar el id 65.535.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible, porque no existen pesos. Sí hay una evaluación del tokenizer en tokens por palabra (menor es mejor), medida el 2026-10-20 sobre FLORES+ devtest y FineWeb-2:

| Tokenizer | Vocab | Lenguas principales (n=25) | Otras etiquetas (n=48) | Todas (n=73) | Premium vs inglés (FLORES+, n=50) | Tokens desconocidos | Inglés |
|---|--:|--:|--:|--:|--:|--:|--:|
| **SabiYarn 3B (131k)** | 131.072 | **1,61** | **1,76** | **1,71** | 1,39 | 0,0% | 1,27 |
| Serengeti | 250.004 | 1,63 | 1,79 | 1,74 | 1,41 | 2,6% | 1,28 |
| SabiYarn 0.5B | 65.536 | 1,78 | 2,46 | 2,23 | 1,66 | 0,0% | 1,31 |
| AfriTeVa v2 | 150.100 | 1,83 | 2,17 | 2,05 | 1,63 | 5,3% | 1,31 |
| NLLB-200 | 256.204 | 1,83 | 1,89 | 1,87 | **1,35** | 0,8% | 1,40 |
| AfriBERTa | 70.005 | 2,22 | 2,52 | 2,42 | 1,54 | 0,0% | 1,64 |
| AfroXLMR | 250.002 | 2,29 | 2,33 | 2,31 | 1,73 | 1,5% | 1,40 |
| Gemma 3 | 262.145 | 2,37 | 2,42 | 2,40 | 1,99 | 0,0% | 1,24 |
| Llama 4 | 201.135 | 2,44 | 2,56 | 2,52 | 2,06 | 0,0% | 1,24 |
| Morena 1.5B | 65.536 | 2,53 | 2,60 | 2,57 | 1,84 | 0,0% | 1,41 |

Caveat declarado por el autor: los textos de FineWeb-2 (marcados W) provienen de la misma familia de fuentes que parte del corpus de entrenamiento, por lo que la ventaja ahí puede estar algo inflada; restringido a las lenguas FLORES+ (F), la media es 1,70 para este tokenizer, 1,73 para Serengeti, 1,82 para NLLB-200, 2,07 para SabiYarn 0.5B y 2,37 para Gemma 3.

## Requisitos de hardware

- Tokenizer únicamente: se ejecuta en CPU; no requiere GPU ni VRAM. La RAM necesaria es inferior a 0,5 GB para el vocabulario completo.
- Latencia: no publicada de forma agregada; el entrenamiento del tokenizer tardó 17 minutos, pero no hay cifras de throughput de tokenización por segundo.
- Si en el futuro se publicaran pesos de 3B (no disponibles): una estimación habitual sería ~6 GB en FP16, ~3 GB en int8 y ~1,5-2 GB en 4 bits; cabría en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB. Son estimaciones por el nombre del repositorio, no datos confirmados.
- Despliegue del tokenizer: `transformers.AutoTokenizer`, la librería `tokenizers` o cualquier implementación de BPE compatible. No aplican vLLM, TGI, llama.cpp ni Ollama porque no hay modelo que servir.
- Almacenamiento: los corpus tokenizados deben guardarse en uint32 (4 bytes por token), no en uint16.

## Comparativa con modelos similares

La comparación relevante es entre tokenizers, no entre modelos, ya que no hay pesos:

| Tokenizer | Vocabulario | Tokens/palabra (n=73) | Tokens desconocidos | Disponibilidad |
|---|--:|--:|--:|---|
| SabiYarn 3B | 131.072 | 1,71 | 0,0% | Repositorio HuggingFace, licencia Apache 2.0 |
| Serengeti | 250.004 | 1,74 | 2,6% | Tokenizer publicado; licencia no disponible en la información |
| SabiYarn 0.5B | 65.536 | 2,23 | 0,0% | HuggingFace (AletheiaAING); licencia no disponible en la información |
| NLLB-200 | 256.204 | 1,87 | 0,8% | Tokenizer publicado; licencia no disponible en la información |
| AfriTeVa v2 | 150.100 | 2,05 | 5,3% | Tokenizer publicado; licencia no disponible en la información |
| AfroXLMR | 250.002 | 2,31 | 1,5% | Tokenizer publicado; licencia no disponible en la información |
| Gemma 3 | 262.145 | 2,40 | 0,0% | Tokenizer de modelo abierto; licencia no disponible en la información |
| Llama 4 | 201.135 | 2,52 | 0,0% | Tokenizer de modelo abierto; licencia no disponible en la información |

Frente a modelos completos de 3B (Llama 3.2 3B, Qwen2.5 3B, Gemma 2 2B, Phi-3 mini), no hay comparación posible: SabiYarn 3B no publica pesos ni resultados de MMLU, HumanEval o GSM8K. Cualquier comparación de rendimiento sería especulativa.

## Limitaciones y advertencias

- **No es un modelo**: no se puede usar para generar texto, razonar, hacer tool calling ni atender usuarios. El nombre "3B" puede inducir a error.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución del tokenizer, pero no hay pesos que explotar comercialmente.
- Sesgo de composición: el corpus reserva un 8% a inglés, 4% a francés y 3% a árabe, y reparte el 85% restante con topes por lengua; lenguas con más datos quedan limitadas y lenguas con pocos datos pueden estar infrarrepresentadas.
- Cobertura incompleta: la model card indica que no se encontró texto utilizable para varias lenguas etiquetadas (menciona ijo, ful, ibb, anw, orx, igl, snq, nup, kln, lch, son, kon, vai y mey), por lo que la evaluación no cubre las 86 etiquetas.
- Posible ventaja inflada en FineWeb-2: los textos W comparten familia de fuentes con parte del corpus de entrenamiento.
- Requiere uint32 en
