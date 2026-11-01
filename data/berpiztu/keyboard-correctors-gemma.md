# berpiztu/keyboard-correctors-gemma

## Resumen

Berpiztu AI Keyboard's context correctors (Gemma) es un modelo de corrección ortográfica y de puntuación para español e inglés, desarrollado por Berpiztu como componente del teclado predictivo Berpiztu AI Keyboard (Android y Windows). Se trata de un fine-tuning de `google/t5gemma-2-270m-270m`, un modelo encoder-decoder de la familia T5Gemma 2 de Google con 270 millones de parámetros, exportado a ONNX para su ejecución local en el dispositivo mediante ONNX Runtime.

El modelo resuelve un problema concreto: dada una frase parcialmente escrita (incluyendo errores tipográficos, de acentuación, de puntuación, mayúsculas o palabras introducidas erróneamente por deslizamiento/swipe), devuelve la frase corregida y sugiere palabras para completar la que se está escribiendo. La inferencia se realiza íntegramente en el dispositivo, sin enviar datos a servidores externos, lo que lo hace adecuado para teclados móviles con requisitos de privacidad.

Su relevancia radica en el despliegue eficiente: un modelo de 270M parámetros cuantizado a 8 bits ocupa 319 MB y logra eliminar el 81,0 % (español) y el 81,1 % (inglés) de los errores en frases de evaluación, con una tasa baja de empeoramiento de frases ya correctas (12 y 16 casos sobre 2.000 frases por idioma). El entrenamiento incorpora una fase final de alineación denominada Virtus, orientada a la humildad, honestidad, templanza y diligencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5Gemma 2) |
| Parametros totales | 270M (modelo base google/t5gemma-2-270m-270m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (export ONNX `gemma-wiki-glide-8`) |
| Idiomas soportados | es, en |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `spiece.model`, `format.json`) |
| Libreria de inferencia | onnxruntime |
| Tamano del repo | 0.3 GB |
| Tamano del corrector 8 bits | 319 MB |
| Modelo base | google/t5gemma-2-270m-270m |

## Arquitectura y entrenamiento

El modelo parte de T5Gemma 2, una arquitectura encoder-decoder de tipo transformer con 270M parámetros totales. La tarea es text2text-generation: el encoder procesa la frase tal como se ha escrito (con errores) y el decoder genera la frase corregida. El export a ONNX separa encoder y decoder en ficheros independientes, junto con el tokenizador SentencePiece (`spiece.model`) y metadatos de formato (`format.json`), además de un `correctors.json` con tamaño y SHA-256 de cada fichero.

Los datos de entrenamiento combinan Tatoeba (CC BY 2.0 FR), OpenSubtitles v2018 vía OPUS (primeras líneas de los ficheros español e inglés), Wikipedia en español e inglés (CC BY-SA 3.0 y GFDL), listados de errores ortográficos comunes de Wikipedia en español (CC BY-SA 4.0) e inglés (CC BY-SA 4.0) y las listas de palabras de AOSP LatinIME para español e inglés US (Apache 2.0). Las frases se reescribieron deliberadamente con errores típicos de escritura apresurada con el pulgar, y las faltas se insertaron en frases que contienen la palabra correcta; según el autor, ninguno de esos textos aparece en los ficheros publicados.

La innovación destacable es la fase final de alineación Virtus, un pase adicional en el que las respuestas propias del modelo se recompensan (nunca se penalizan) por humildad, honestidad, templanza y diligencia. Según la model card, el efecto medido es que el modelo deja intacta una frase ya correcta con mucha más frecuencia, manteniendo o mejorando la eliminación de errores. El coste es una ligera pérdida en la calidad de las sugerencias de palabras y en la corrección de errores ortográficos de Wikipedia.

## Capacidades

- Corrección ortográfica de frases en español e inglés: acentos, puntuación, mayúsculas y palabras erróneas.
- Corrección de errores introducidos por deslizamiento (swipe) o pulsaciones accidentales.
- Sugerencia de palabras para completar la palabra que se está escribiendo.
- Generación text2text (entrada: frase parcial; salida: frase corregida).
- Inferencia local en el dispositivo mediante ONNX Runtime, sin conexión a red.
- Multilingüe limitado a español e inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Teclado predictivo móvil: integración en la app Berpiztu AI Keyboard (Android y Windows) para corregir la frase en curso y sugerir la siguiente palabra, con inferencia local que evita enviar pulsaciones a servidores.
- Corrección en tiempo real de mensajes de chat: el modelo reescribe la frase con acentos y puntuación correctos antes de enviarla, adecuado por su baja latencia al ejecutarse en el dispositivo con 319 MB.
- Autocorrección de errores de swipe: al detectar palabras introducidas por deslizamiento incorrecto, el modelo reconstruye la palabra pretendida a partir del contexto de la frase.
- Aplicaciones de escritura para usuarios con dificultades ortográficas: corrección de borradores en español o inglés manteniendo la intención original, con una tasa medida de frases correctas empeoradas de 12/2.000 (es) y 16/2.000 (en).
- Preprocesado de texto en pipelines de NLP: normalización de entradas de usuario (acentos, mayúsculas, puntuación) antes de tareas posteriores como búsqueda o clasificación.
- Corrección de subtítulos o transcripciones: dado el entrenamiento con OpenSubtitles y Tatoeba, el modelo es adecuado para limpiar texto coloquial con errores tipográficos.
- Despliegue en entornos sin conectividad o con requisitos de privacidad estrictos: al ser ONNX y ejecutarse con ONNX Runtime en el dispositivo, encaja en aplicaciones offline o reguladas.

## Benchmarks y rendimiento

Datos publicados en la model card (medidos sobre 2.000 frases retenidas por idioma, con el modelo en precisión completa; el export de 8 bits reproduce el mismo resultado en la mayoría de frases, no en todas):

| Metrica | es | en |
|---|---|---|
| Errores eliminados (`gemma-wiki-glide-8`) | 81,0 % | 81,1 % |
| Frases correctas empeoradas | 12 / 2.000 | 16 / 2.000 |

Comparativa antes y después de la alineación Virtus (modelo `gemma-wiki-glide` frente a `gemma-wiki-glide-8`):

| Entrenamiento | Frases correctas empeoradas (es / en) | Errores eliminados (es / en) | Sugerencia entre las tres (es / en) | Errores de Wikipedia corregidos (es / en) |
|---|---|---|---|---|
| `gemma-wiki-glide` | 21 / 18 | 77,9 % / 79,3 % | 68,2 % / 69,4 % | 82,5 % / 77,2 % |
| `gemma-wiki-glide-8` (tras Virtus) | 12 / 16 | 81,0 % / 81,1 % | 65,3 % / 65,9 % | 78,0 % / 73,6 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el corrector de 8 bits ocupa 319 MB en disco, por lo que la huella en memoria es del orden de cientos de MB.
- GPU recomendadas: no disponible; el modelo está diseñado para ejecución en CPU en dispositivos Android y Windows mediante ONNX Runtime.
- Cabe en GPU de consumo: sí, por tamaño (270M parámetros, 319 MB en 8 bits), aunque no se documentan requisitos de GPU específicos.
- Opciones de despliegue: ONNX Runtime (librería declarada); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros correctores ortográficos en la información proporcionada. La siguiente tabla recoge únicamente los datos disponibles del modelo base y del modelo publicado:

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| berpiztu/keyboard-correctors-gemma | 270M | no disponible | Gemma | ONNX (8 bits) | Corrección ortográfica es/en en dispositivo |
| google/t5gemma-2-270m-270m | 270M | no disponible | Gemma | safetensors (modelo base) | Text2text general |
| Alternativas de corrección ortográfica | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo cubre español e inglés; no se documentan otros idiomas.
- La tasa de frases correctas empeoradas no es nula: 12/2.000 en español y 16/2.000 en inglés con el export de 8 bits.
- La alineación Virtus reduce la calidad de las sugerencias de palabras (de 68,2 % a 65,3 % en español; de 69,4 % a 65,9 % en inglés) y de la corrección de errores de Wikipedia (de 82,5 % a 78,0 % en español; de 77,2 % a 73,6 % en inglés).
- El export de 8 bits no reproduce exactamente el comportamiento del modelo en precisión completa en todas las frases.
- Riesgo de alucinación no cuantificado en la información disponible; al ser un modelo de reescritura, puede alterar contenido de la frase original.
- Licencia Gemma: uso sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; quien descargue el modelo queda vinculado a esas restricciones y debe transmitirlas junto con los términos y el aviso a terceros.
- El modelo es un derivado de Gemma (T5Gemma 2) y todos los ficheros publicados han sido modificados respecto a los originales de Google.
- No se documenta longitud de contexto, latencia ni throughput, lo que dificulta planificar despliegues con requisitos estrictos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/berpiztu/keyboard-correctors-gemma
- Modelo base: https://huggingface.co/google/t5gemma-2-270m-270m
- Repositorio del teclado Berpiztu AI Keyboard: https://github.com/Berpiztu/keyplus
- Virtus (alineación por carácter): https://github.com/Berpiztu/virtus
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Tatoeba: https://tatoeba.org
- OpenSubtitles v2018 en OPUS: https://opus.nlpl.eu/OpenSubtitles/corpus/version/OpenSubtitles
- Wikipedia (dataset): https://huggingface.co/datasets/wikimedia/wikipedia
- Listado de errores ortográficos comunes de Wikipedia en español: https://es.wikipedia.org/w/index.php?title=Wikipedia:Corrector_ortogr%C3%A1fico/Listado&oldid=175669831
- Listado de errores ortográficos comunes de Wikipedia en inglés: https://en.wikipedia.org/w/index.php?title=Wikipedia:Lists_of_common_misspellings/For_machines&oldid=1199637275
- AOSP LatinIME: https://android.googlesource.com/platform/packages/inputmethods/LatinIME
