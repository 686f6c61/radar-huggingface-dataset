# preetham9070/gregg-t5-grascii-to-english

## Resumen

Gregg-t5-grascii-to-english es un modelo de traducción de taquigrafía Gregg (sistema Anniversary, 1929) escrita en notación Grascii a texto en inglés. Lo desarrolla el usuario preetham9070 como segunda mitad de su proyecto gregg-shorthand-ocr: un lector de imágenes (Topaz-61M) extrae los trazos de una página y este modelo reconstruye las palabras que representan. El problema que resuelve es no trivial: la taquigrafía Gregg omite la mayoría de vocales y muchos contornos son ambiguos (una `T` puede ser *it* o *at*), por lo que la desambiguación requiere contexto.

Arquitectónicamente es un fine-tune de google/flan-t5-small, un transformer encoder-decoder de tipo T5 con 76.961.152 parámetros totales y un repositorio de 0,3 GB en formato safetensors. El modelo procesa hasta dos líneas previas como contexto junto con la línea objetivo, lo que le permite resolver ambigüedades que una búsqueda en diccionario no podría.

Es relevante para digitalización de archivos históricos y manuscritos en taquigrafía, un nicho con pocas herramientas automáticas. La versión 2 incorpora texto sintético adicional (WikiText-103), deletreo fonético de palabras ausentes del diccionario vía CMU y confusión deliberada de trazos similares para robustecer frente a errores de OCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), base flan-t5-small |
| Parametros totales | 76.961.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo usa hasta dos líneas previas como contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de google/flan-t5-small, un transformer encoder-decoder estándar de la familia T5. La entrada combina hasta dos líneas anteriores en Grascii como contexto más la línea a decodificar, con ciertos símbolos Grascii sustituidos por equivalentes seguros para el tokenizador. La salida es la transcripción en inglés.

El entrenamiento se realizó en dos fases. La v1 se ajustó sobre 530.000 líneas Grascii → inglés: 130.000 son lecturas reales de Topaz sobre líneas de libros Gregg con clave, y 400.000 son sintéticas generadas escribiendo frases en inglés en Grascii a partir del diccionario, añadiendo los errores de trazo que Topaz comete habitualmente. La v2 (este modelo) continuó el entrenamiento 10.000 pasos más sobre 543.000 líneas con tres cambios: el texto sintético incorpora WikiText-103, las palabras ausentes del diccionario se deletrean desde su pronunciación según el diccionario CMU, y el 40% de las líneas reciben confusiones de longitud y tamaño típicas de la escritura manual (T/D, P/B, F/V, A/E). Los conjuntos *Functional Method 2* (test) y el manual de 1929 (dev) quedaron excluidos del entrenamiento, y la Biblia se excluyó para que el test sobre Genesis sea honesto.

## Capacidades

- Decodificación de taquigrafía Gregg Anniversary (1929) en notación Grascii a inglés.
- Desambiguación contextual mediante las dos líneas previas de entrada.
- Generación de palabras ausentes del diccionario (no limitada a búsqueda léxica).
- Robustez frente a errores de trazo típicos de OCR (confusiones T/D, P/B, F/V, A/E).
- Corrección post-OCR en pipelines de digitalización de documentos.
- Generación de texto text2text-generation vía pipeline de transformers.
- Compatibilidad con text-generation-inference y endpoints.
- Capacidades multilingües: solo inglés.
- Tool calling, agentes, visión, audio o modo thinking: no disponibles.

## Casos de uso

- Digitalización de archivos históricos en taquigrafía: el modelo transcribe páginas escaneadas de documentos Gregg tras el paso de OCR de trazos, usando las líneas previas como contexto para resolver contornos ambiguos.
- Corrección post-OCR en pipelines documentales: integrado tras Topaz-61M, corrige las lecturas erróneas de trazos antes de entregar el texto final al usuario.
- Reconstrucción de correspondencia manuscrita: para cartas escritas a mano en Gregg, el modelo puede producir texto legible a partir de los trazos extraídos, aunque con una tasa de error mayor (56-65% en fotos de móvil según el autor).
- Transcripción de manuales y libros de texto Gregg: con el modelo Topaz afinado sobre los libros, alcanza un 41,3% de WER en Genesis manuscrito, útil para digitalizar material didáctico.
- Investigación lingüística y archivística: permite convertir corpus en taquigrafía a texto plano para análisis de frecuencia, búsqueda o indexación.
- Preprocesado para búsqueda semántica en archivos: al convertir taquigrafía a inglés, los documentos pueden indexarse y consultarse con herramientas de búsqueda estándar.
- Prototipado de asistentes de lectura de taquigrafía: la API `T5Decoder` del proyecto permite integrar el modelo en aplicaciones de escritorio o web para usuarios que necesiten leer notas Gregg.

## Benchmarks y rendimiento

Word error rate (WER, menor es mejor). Los trazos provienen de Topaz en todas las filas.

| Test set | Dictionary only | Beam search + trigram LM | Este modelo | Claude Opus 5.5 |
|---|---|---|---|---|
| *Functional Method 2*, impreso, held out (271 líneas) | 41,3% | 27,6% | **23,4%** | 25,9% |
| Genesis manuscrito, un escritor (119 versos) | 61,5% | 53,6% | **44,8%** | 13,7%* |
| Manual de 1929 (dev set) | 36,4% | 20,5% | **16,6%** | no disponible |

\* Claude conoce la King James Version casi de memoria, lo que favorece artificialmente su resultado en Genesis.

Con Topaz afinado sobre los libros, este modelo alcanza un 41,3% en Genesis manuscrito.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 77M de parámetros, la inferencia en fp32 requiere aproximadamente 0,3 GB de pesos; en fp16, unos 0,15 GB. La VRAM total dependerá del framework y del tamaño de batch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (según tags), endpoints compatibles. No se indica soporte explícito de llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (Functional Method 2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gregg-t5-grascii-to-english | 76,9M | no disponible | 23,4% | apache-2.0 | Hugging Face |
| google/flan-t5-small (base) | 76,9M | 512 tokens (típico T5) | no aplica (no especializado) | apache-2.0 | Hugging Face |
| Claude Opus 5.5 (referencia) | no disponible | no disponible | 25,9% | propietaria | API |
| Dictionary only (línea base) | no aplica | no aplica | 41,3% | no aplica | no aplica |

No se dispone de otros modelos especializados en taquigrafía Gregg con los que comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- Depende de la calidad de los trazos de entrada: en escritura manual real, los errores de Topaz dominan el resultado; una foto de móvil de una carta manuscrita produce un 56-65% de WER.
- Puede generar frases fluidas que no corresponden a lo que dice la página, y ocasionalmente palabras inexistentes.
- Solo cubre Gregg Anniversary (1929); no otros sistemas de taquigrafía.
- El texto de entrenamiento incluye claves de libros de texto Gregg de varias décadas, cuyo estado de copyright varía según el libro.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: confirmado por el autor ("puede escribir frases fluidas que no son lo que dice la página").
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el material de entrenamiento con copyright variable puede plantear riesgos legales en producción.
- Limitación de idioma: solo inglés.
- Limitación de contexto: no se especifica la longitud máxima; el modelo usa dos líneas previas como contexto, lo que puede ser insuficiente en textos con dependencias de largo alcance.

## Enlaces

- Hugging Face: https://huggingface.co/preetham9070/gregg-t5-grascii-to-english
- Proyecto gregg-shorthand-ocr: https://github.com/PreethamReddy333/gregg-shorthand-ocr
- Grascii: https://github.com/grascii/grascii
- Topaz-61M (lector de trazos): https://huggingface.co/amongglue/topaz-gregg-shorthand-61m
- Topaz afinado: https://huggingface.co/preetham9070/topaz-gregg-61m-finetuned
- Modelo base: https://huggingface.co/google/flan-t5-small
