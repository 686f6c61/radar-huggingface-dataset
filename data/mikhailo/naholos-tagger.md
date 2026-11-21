# Mikhailo/naholos-tagger

## Resumen

naholos-tagger es un modelo de etiquetado de tokens (token classification) especializado en la colocación del acento léxico en ucraniano (*наголос*). Lo desarrolla Mikhailo y se construye a partir de google/byt5-base, un encoder ByT5 que trabaja a nivel de byte. Sobre ese encoder se añade una única cabeza lineal que puntúa cada carácter de una frase; dentro de cada palabra con dos o más vocales se marca como acentuada la vocal con mayor puntuación. El modelo resuelve un problema clásico del procesado del ucraniano: la sílaba tónica no es predecible a partir de la ortografía y resulta imprescindible para una síntesis de voz (TTS) natural y para la desambiguación de homógrafos.

Con 415 millones de parámetros y pesos en bf16, el modelo procesa una frase completa en una sola pasada del encoder (unos 4 ms en una RTX 4090 según la model card) y garantiza que las letras del texto de entrada nunca cambian, solo se añaden marcas de acento. Está pensado para integrarse en la librería `naholos`, que lo combina con el diccionario `ukrainian-word-stress` en un modo híbrido: usa el diccionario cuando la palabra tiene un único acento normativo y recurre a este modelo cuando hay ambigüedad o la palabra no está cubierta.

El modelo es relevante para pipelines de TTS en ucraniano, para herramientas de corrección y para investigación en fonética computacional de lenguas eslavas con acento libre. Su licencia Apache-2.0 y su tamaño moderado lo hacen desplegable en hardware de consumo, aunque su ámbito es estrictamente monolingüe (ucraniano) y la tarea muy concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ByT5-base (transformer byte-level) + cabeza lineal de clasificación por carácter |
| Parametros totales | 415.294.849 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 480 bytes de entrada; entradas mayores se dividen en fronteras de frase |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | Apache-2.0 (el código de `naholos` es MIT) |
| Formato de pesos | safetensors (bf16), con `config.json` y `naholos.json` |

## Arquitectura y entrenamiento

La arquitectura es un encoder ByT5-base seguido de una cabeza lineal (`head.weight` / `head.bias`) que emite una puntuación por cada carácter de la secuencia. Al operar a nivel de byte, el modelo no depende de un tokenizador subword y puede puntuar posiciones dentro de cualquier palabra sin riesgo de fragmentación. La decisión de acento se toma por palabra: entre las vocales de una palabra con dos o más vocales se elige la de mayor puntuación. La pérdida de entrenamiento es entropía cruzada binaria por vocal, aplicada únicamente a palabras con exactamente un acento conocido.

El entrenamiento parte de google/byt5-base, primero ajustado como modelo seq2seq de acentuación y después convertido a este tagger (encoder más cabeza). Se entrenó sobre aproximadamente 800.000 frases. Las etiquetas provienen de dos fuentes: alrededor de 1,5 millones de enunciados de audiolibros y Common Voice alineados con Montreal Forced Aligner y etiquetados por un detector acústico de acento (solo se conservan etiquetas seguras y se descarta la frase si alguna palabra es dudosa), y palabras ambiguas de audiolibros modernos etiquetadas según la lectura de los narradores, cedidas por el autor de `accentuk` y no redistribuidas. El ajuste fino sobre datos propios se documenta en `python -m naholos.train`.

## Capacidades

- Predicción del acento léxico en ucraniano a nivel de carácter, con una pasada de encoder por frase.
- Integración con diccionario en modo híbrido: normativa del diccionario cuando hay un único acento, modelo cuando hay ambigüedad o ausencia de entrada.
- Respeto de marcas manuales del usuario (por ejemplo `за́мок` / `за+мок`), que tienen prioridad sobre el modelo.
- Modo `model` puro para acentuar todas las palabras mediante el modelo.
- Conservación estricta de las letras de entrada: solo se añaden diacríticos de acento, nunca se altera el texto.
- Segmentación automática de entradas largas en fronteras de frase (límite de 480 bytes).
- Salida apta para TTS: marca la vocal tónica para guiar la prosodia de la síntesis.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es un tagger especializado.

## Casos de uso

- Síntesis de voz en ucraniano: el modelo marca la vocal tónica de cada palabra para que el motor TTS module duración y tono; es su aplicación principal y la razón de su existencia.
- Desambiguación de homógrafos en lectura: palabras como `замок` (castillo / cerradura) reciben el acento correcto según el contexto de la frase, algo que un diccionario por palabra no resuelve.
- Preprocesado de corpus para investigación fonética: permite anotar automáticamente el acento en grandes corpus de texto ucraniano antes de análisis prosódico o de entrenamiento de otros modelos.
- Corrección y enriquecimiento de diccionarios de pronunciación: el modo `model` sirve para proponer acentos en palabras no cubiertas por `ukrainian-word-stress`, que luego se revisan manualmente.
- Integración en pipelines de audiolibros y asistentes de voz: con ~4 ms por frase en una RTX 4090, el coste de acentuación es despreciable frente al resto del pipeline de TTS.
- Herramientas de aprendizaje de ucraniano: generación de texto acentuado para estudiantes, respetando las marcas manuales del usuario cuando este quiere forzar una lectura concreta.
- Ajuste fino sobre dominio propio: el paquete `naholos` incluye `python -m naholos.train` para adaptar el tagger a vocabulario especializado (medicina, toponimia, nombres propios).

## Benchmarks y rendimiento

Precisión por palabra en palabras con dos o más vocales y acento conocido, según la model card:

| Conjunto | Palabras | ukrainian-word-stress 2.1 (+Stanza) | Este modelo | Híbrido naholos |
|---|---:|---:|---:|---:|
| Texto literario con acento experto, todas las palabras (conjunto privado) | 9666 | 0.889 | 0.917 | **0.935** |
| Gold humano de lang-uk, palabras ambiguas | 1472 | 0.521 | 0.751 | **0.755** |
| Formas de audiolibro reservadas (acento escuchado) | 3102 | 0.741 | 0.924 | **0.929** |
| Common Voice (acento escuchado)* | 3001 | 0.638 | 0.939 | **0.939** |

\* Solapa parcialmente con los datos de entrenamiento.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; la tarea no se presta a ellos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,9-1,2 GB para los pesos (415 M de parámetros), más overhead de activaciones; cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: RTX 4090 (referencia de la model card, ~4 ms por frase), A100, H100 para despliegues de alto throughput; también válidas RTX 3060/4060 y superiores.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 4 GB de VRAM; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: la vía prevista es el paquete `naholos` (`pip install naholos`); al ser un modelo safetensors estándar con config T5, puede cargarse con PyTorch/Transformers y servirse con frameworks genéricos, aunque la información disponible no documenta integraciones específicas con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: ~4 ms por frase en RTX 4090 según la model card; el resto de cifras no están disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Precisión (gold ambiguo lang-uk) | Licencia |
|---|---|---:|---|---:|---|
| naholos-tagger | Tagger ByT5 + cabeza lineal | 415 M | 480 bytes | 0.751 (0.755 híbrido) | Apache-2.0 |
| ukrainian-word-stress 2.1 (+Stanza) | Diccionario + análisis morfológico | no disponible | no disponible | 0.521 | no disponible |
| google/byt5-base (seq2seq de acentuación previo) | Seq2seq byte-level | no disponible | no disponible | no disponible | Apache-2.0 |

La comparación directa solo es posible con `ukrainian-word-stress`, que la propia model card usa como referencia: el tagger supera al diccionario en todos los conjuntos evaluados, con la mayor ventaja en palabras ambiguas (0.751 frente a 0.521). No se dispone de datos de otros taggers de acento ucraniano comparables en la información proporcionada.

## Limitaciones y advertencias

- El acento aprendido refleja cómo leen los narradores; en modo `model` puede diferir de la norma del diccionario. El modo híbrido mitiga esto para palabras con un único acento normativo.
- Si una misma frase usa el mismo heterónimo en dos sentidos, normalmente ambos reciben el mismo acento.
- Las palabras de una sola vocal se dejan sin marcar por defecto.
- Entradas de más de 480 bytes se dividen en fronteras de frase, lo que puede fragmentar contextos largos.
- Riesgo de alucinación limitado por el diseño (las letras no cambian), pero puede asignar acentos incorrectos en vocabulario especializado, nombres propios o préstamos recientes.
- El conjunto de Common Voice solapa parcialmente con los datos de entrenamiento, por lo que su cifra de 0.939 está optimista.
- Ámbito monolingüe: no cubre otros idiomas ni variantes dialectales del ucraniano.
- Licencia Apache-2.0 permite uso comercial; el código de `naholos` es MIT. Los datos de audiolibros ambiguos cedidos por `accentuk` no se redistribuyen, lo que limita la reproducibilidad exacta del entrenamiento.
- Sin descargas ni likes en el momento de la consulta: ecosistema muy incipiente y poca validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mikhailo/naholos-tagger
- Repositorio del paquete `naholos`: https://github.com/MykhailoMS/naholos
- Diccionario `ukrainian-word-stress`: https://github.com/lang-uk/ukrainian-word-stress
- Proyecto `accentuk` (proveedor de datos de palabras ambiguas): https://github.com/vacuum-in/accentuk
- Modelo base: https://huggingface.co/google/byt5-base
