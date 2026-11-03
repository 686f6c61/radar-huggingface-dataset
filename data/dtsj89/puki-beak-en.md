# dtsj89/puki-beak-en

## Resumen

Puki Beak (English) es un modelo especializado en conversión de grafemas a fonemas (grapheme-to-phoneme, G2P) para inglés, desarrollado por dtsj89 como parte del proyecto Puki, un juego gratuito bilingüe hebreo-inglés para niños pequeños. El modelo resuelve un problema muy concreto: permitir que un motor de síntesis de voz (BlueTTS, entrenado con fonemas IPA de espeak-ng en-us con marcas de acentuación) pronuncie correctamente texto inglés en una tableta sin necesidad de ejecutar espeak-ng en el dispositivo. Se distribuye como un modelo ONNX cuantizado a int8, con un tamaño total de aproximadamente 2.9 MB para el lector y 0.7 MB para la tabla de palabras.

El sistema consta de dos componentes complementarios. Por un lado, una tabla (`words.tsv`) con 30.486 palabras transcritas tal como las lee espeak-ng, incluyendo las formas débiles que aparecen en contexto de frase ("a" como ɐ, "to" como tə, "I" como aɪ). Por otro, un lector neuronal (`reader_int8.onnx`) que cubre las palabras ausentes de la tabla, como nombres propios infantiles: un transformer bidireccional pequeño de 2,7 millones de parámetros (6 capas, anchura 192) que opera sobre las letras y utiliza CTC para alinear letras y fonemas, ya que en inglés la correspondencia no es uno a uno ("th", "ough", e muda).

La relevancia del modelo es acotada pero clara: demuestra que una tarea lingüística específica puede resolverse con un modelo de menos de 3 MB de parámetros, ejecutable en hardware modesto (una tableta), sin dependencias externas en tiempo de inferencia. No es un modelo de lenguaje general ni compite en la categoría de LLM; su interés reside en la ingeniería de un pipeline G2P compacto con una precisión reportada del 88,3% en palabras no vistas y del 84% en líneas completas del juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con CTC (6 capas, anchura 192) |
| Parametros totales | 2,7 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (campo `max_letters` en `symbols.json`, valor no especificado) |
| Tipos de cuantizacion | int8 (única versión publicada: `reader_int8.onnx`) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`reader_int8.onnx`) más tabla TSV (`words.tsv`) y JSON (`symbols.json`) |

## Arquitectura y entrenamiento

El componente neuronal es un transformer bidireccional pequeño de 2,7 millones de parámetros, con 6 capas y anchura 192, que procesa la secuencia de letras de una palabra. Dado que la correspondencia entre letras y sonidos en inglés no es biunívoca, cada letra dispone de tres ranuras de salida y el entrenamiento con CTC (Connectionist Temporal Classification) aprende cuáles deben quedar vacías. La inferencia consiste en una única pasada forward seguida de la eliminación de repeticiones y símbolos en blanco. La entrada `ids` se compone de un token inicial (1), un id por letra (índice en `letters` más 2) y un token final (1); la salida `logp` contiene tres ranuras por id con log-probabilidades sobre el vocabulario `symbols`, con el blanco en primera posición.

El entrenamiento se realizó sobre las 200.000 palabras más comunes extraídas de 400.000 documentos de FineWeb-Edu (ODC-By 1.0), etiquetadas por espeak-ng. Los scripts de entrenamiento (`train/en_label.py`, `train/en_read_train.py`) están disponibles en el repositorio del proyecto Puki. La tabla `words.tsv` se construyó con las 30.486 palabras más frecuentes del inglés y todas las palabras de las líneas inglesas del juego tal como espeak las lee dentro de esas frases, de modo que las palabras funcionales adoptan sus formas débiles. espeak-ng no forma parte del modelo distribuido; solo se usó como etiquetador durante el entrenamiento.

## Capacidades

- Conversión de grafemas a fonemas IPA para palabras inglesas, con marcas de acentuación compatibles con espeak-ng en-us.
- Cobertura léxica mediante tabla de 30.486 palabras con transcripciones contextuales (formas débiles de palabras funcionales).
- Generalización a palabras no vistas (nombres propios, términos raros) mediante el lector neuronal con CTC.
- Inferencia en una sola pasada forward, sin decodificación autoregresiva ni búsqueda.
- Ejecución sin dependencias de espeak-ng en tiempo de inferencia, apta para dispositivos con recursos limitados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés; no cubre otros idiomas.

## Casos de uso

- Síntesis de voz en dispositivos empotrados: el modelo convierte texto inglés a fonemas IPA que alimentan directamente BlueTTS con `text_is_phonemes`, eliminando la necesidad de instalar espeak-ng en una tableta o dispositivo de bajos recursos.
- Aplicaciones infantiles de lectura: el proyecto Puki lo usa para pronunciar las líneas inglesas del juego con formas débiles correctas en contexto de frase ("a" como ɐ, "to" como tə), lo que suena más natural que una lectura palabra a palabra.
- Pronunciación de nombres propios: el lector neuronal cubre las palabras ausentes de la tabla, como el nombre de un niño, con una precisión reportada del 88,3% en palabras no vistas.
- Preprocesado para pipelines TTS ligeros: integrado como paso G2P en un pipeline de síntesis que ya consuma fonemas IPA, con un coste de 2,9 MB de pesos int8.
- Herramientas educativas de fonética: generación de transcripciones IPA de listas de vocabulario inglés para materiales didácticos, usando la tabla para palabras frecuentes y el lector para el resto.
- Prototipado de asistentes de voz offline: al ejecutarse como ONNX int8 sin dependencias externas, sirve para validar un pipeline de voz completo en hardware modesto antes de escalar a un motor G2P mayor.

## Benchmarks y rendimiento

| Prueba | Resultado (int8) |
|---|---|
| Palabras no vistas (3.000, mayoritariamente raras) leídas exactamente como espeak-ng | 88,3% |
| Líneas de Puki (300) leídas exactamente como espeak-ng lee la línea completa | 253 (84%); 98% de las palabras |

Las diferencias restantes se deben mayormente a la unión de dos palabras en una sola transcripción (espeak escribe "in the" como ɪnðə). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos del lector ocupan 2,9 MB en int8 y la tabla 0,7 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) lo ejecuta con holgura, pero es sobredimensionada para esta carga.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y tabletas, que es el objetivo de diseño declarado.
- Opciones de despliegue: ONNX Runtime (formato nativo `reader_int8.onnx`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; la lectura es una única pasada forward más postproceso de eliminación de repeticiones y blancos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Puki Beak (English) | G2P inglés con CTC, ONNX int8 | 2,7 M | no disponible | Apache 2.0 | HuggingFace |
| espeak-ng | G2P por reglas, multilingüe | no aplica (basado en reglas) | no aplica | GPLv3 | Repositorio GitHub |
| Modelos G2P neuronales genéricos | Seq2seq o CTC para G2P | variable | variable | variable | no disponible |

La comparación directa con espeak-ng es la más pertinente: Puki Beak replica su salida en-us con acentuación para un subconjunto del inglés, pero se distribuye bajo Apache 2.0 y no requiere ejecutar espeak-ng en el dispositivo, a diferencia de este último, cuya licencia GPLv3 puede ser restrictiva para productos propietarios. No se dispone de datos de otros modelos G2P neuronales comparables en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada al inglés; no procesa otros idiomas.
- El vocabulario de la tabla cubre 30.486 palabras; fuera de ellas depende del lector neuronal, con una precisión del 88,3% en palabras no vistas, por lo que aproximadamente una de cada nueve palabras raras puede desviarse de la salida de espeak-ng.
- Las diferencias restantes incluyen uniones de palabras que espeak-ng transcribe como una sola unidad, lo que puede afectar a la alineación en pipelines que esperen una transcripción por palabra.
- Riesgo de pronunciación incorrecta en nombres propios y términos técnicos poco frecuentes, inherente a un modelo de 2,7 millones de parámetros.
- El modelo está diseñado para replicar el comportamiento de espeak-ng en-us con acentuación; no se han documentado sesgos lingüísticos más allá de los propios de esa fuente de etiquetado.
- Licencia Apache 2.0: permite uso comercial, pero espeak-ng (usado solo para generar las etiquetas) es GPLv3 y no forma parte del modelo distribuido; conviene revisar la cadena de licencias si se redistribuyen datos derivados.
- No es un modelo de lenguaje: no genera texto libre, no razona y no admite instrucciones; su uso está restringido a la conversión G2P.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dtsj89/puki-beak-en
- Proyecto Puki: https://github.com/TomSadeh/puki
- BlueTTS: https://github.com/maxmelichov/BlueTTS
- espeak-ng: https://github.com/espeak-ng/espeak-ng
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
