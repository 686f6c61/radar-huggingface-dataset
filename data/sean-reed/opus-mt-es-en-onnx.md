# sean-reed/opus-mt-es-en-onnx

## Resumen

`sean-reed/opus-mt-es-en-onnx` es una conversión a ONNX Runtime del modelo de traducción automática `Helsinki-NLP/opus-mt-es-en`, desarrollado originalmente por el grupo de investigación en tecnología del lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce texto de español a inglés y está pensado para ejecutarse en CPU mediante ONNX Runtime, sin necesidad de GPU ni de frameworks de deep learning pesados. Su tamaño es reducido (159 MB en la versión cuantizada a 8 bits, frente a los 581 MB del export en fp32) y la latencia medida es de unos 60 ms por frase en un procesador de escritorio.

La particularidad de esta conversión es que el decodificador expone, además de los logits del siguiente token, la atención cruzada de una de sus capas sobre los tokens de origen. Esto permite construir alineamientos a nivel de palabra entre la frase en español y su traducción al inglés, útil para resaltar correspondencias, extraer terminología en contexto o construir memorias de traducción asistidas. El modelo es un transformer encoder-decoder de arquitectura Marian, con 6 capas, 8 cabezas y dimensión 64 por cabeza.

La relevancia de esta ficha es práctica: se trata de un modelo pequeño, con licencia Apache 2.0, que se puede desplegar en entornos con recursos limitados (servidores sin GPU, dispositivos edge, aplicaciones de escritorio) y que añade una funcionalidad poco habitual en modelos de traducción empaquetados, como es la alineación de palabras derivada de la atención. No obstante, conviene tener presente que es una conversión de un modelo base ya existente y que no se han publicado resultados de benchmarks estándar en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian), 6 capas, 8 cabezas, D=64 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (frases de 4 a 17 palabras en las pruebas del autor) |
| Tipos de cuantizacion | 8 bits en bloques de 32 valores con escala propia (`MatMulNBits`, `accuracy_level` 4); tablas de embedding a 8 bits |
| Idiomas soportados | espanol (origen), ingles (destino) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es `Helsinki-NLP/opus-mt-es-en`, un transformer encoder-decoder de la familia Marian entrenado por el grupo de la Universidad de Helsinki para traducción automática neuronal. La conversión mantiene la arquitectura original: 6 capas en el encoder y 6 en el decoder, 8 cabezas de atención y dimensión 64 por cabeza. El vocabulario se gestiona con un modelo SentencePiece (`source.spm`) compartido entre origen y destino, y los identificadores de cada pieza se mapean con `vocab.json`.

La conversión a ONNX separa el modelo en dos grafos: `encoder.onnx`, que recibe los ids de origen y devuelve las claves y valores de atención cruzada de cada capa del decoder, y `decoder.onnx`, que ejecuta un paso de decodificación greedy y devuelve logits, el estado `present` y el vector de atención de la capa 5 del decoder promediado sobre sus cabezas. La cuantización a 8 bits se aplica a todas las multiplicaciones de matrices (bloques de 32 valores con escala propia) y a las tablas de embedding. Según el autor, en 68 frases de prueba las traducciones greedy coinciden con las del modelo original en todas menos una. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Traducción de texto de español a inglés con decodificación greedy paso a paso.
- Alineación de palabras entre la frase de origen y la traducción, a partir de la atención cruzada de la capa 5 del decoder.
- Identificación de la traducción de una palabra en contexto (por ejemplo, "banco" en "me senté en el banco del parque" → "bench").
- Resaltado de correspondencias entre palabras de ambos textos, útil en interfaces de revisión o enseñanza de idiomas.
- Ejecución en CPU mediante ONNX Runtime, sin dependencia de GPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Traducción por lotes en servidores sin GPU: el modelo se ejecuta con ONNX Runtime en CPU y procesa frases en decenas de milisegundos, lo que permite integrarlo en pipelines de localización de documentación o correos electrónicos sin aprovisionar hardware especializado.
- Alineación de terminología en memorias de traducción: la atención cruzada expuesta permite emparejar términos del español con sus equivalentes en inglés en contexto, lo que facilita la extracción de glosarios bilingües a partir de corpus paralelos.
- Herramientas de aprendizaje de idiomas: el alineamiento palabra a palabra sirve para resaltar qué palabra española corresponde a qué palabra inglesa en una traducción, con la advertencia de que el método es aproximado y solo devuelve una palabra destino por palabra origen.
- Preprocesamiento en pipelines de NLP: traducción rápida de consultas o documentos en español a inglés antes de pasarlos a modelos o sistemas que funcionan mejor en inglés (búsqueda, clasificación, resumen).
- Despliegue en dispositivos edge o aplicaciones de escritorio: el tamaño de 159 MB y la ejecución en CPU permiten empaquetar el traductor dentro de una aplicación local sin conexión.
- Prototipado e investigación en alineación de palabras: el modelo sirve como banco de pruebas para métodos de alineación basados en atención, comparando sus resultados con alineadores estadísticos o neuronales dedicados.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, etc.). Sí proporciona métricas de precisión de la alineación y de rendimiento en CPU:

| Metrica | Resultado |
|---|---|
| Traducciones greedy idénticas al original (68 frases) | 67/68 (todas menos 0 según el texto; se interpreta 68/68 salvo una discrepancia de redacción) |
| Alineación palabra a palabra, casos de desarrollo | 64/66 |
| Alineación palabra a palabra, casos held-out | 43/47 |
| Tamano del export fp32 | 581 MB |
| Tamano del modelo cuantizado | 159 MB |
| Tiempo mediano por frase (fp32) | 110 ms |
| Tiempo mediano por frase (cuantizado) | 60 ms |
| Frase mas lenta (fp32) | 290 ms |
| Frase mas lenta (cuantizado) | 241 ms |

Las mediciones se realizaron en un AMD Ryzen 5 1600 de seis núcleos con 4 hilos y ONNX Runtime 1.31.0, sobre frases de 4 a 17 palabras. Los casos de alineación son 113 palabras en 68 frases, etiquetadas y revisadas por una persona, por lo que el autor advierte que las cifras son una indicación aproximada.

## Requisitos de hardware

- VRAM: no requiere GPU; está diseñado para inferencia en CPU con ONNX Runtime.
- RAM estimada: el modelo cuantizado ocupa 159 MB en disco; el consumo en memoria es del orden de unos cientos de MB, aunque no se especifica una cifra exacta.
- GPU recomendadas: no aplica; el autor lo orienta a CPU. Podría ejecutarse en GPU con ONNX Runtime, pero no se documenta.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; el modelo cabe holgadamente en cualquier equipo de escritorio actual.
- Opciones de despliegue: ONNX Runtime (versión probada 1.31.0). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 60 ms de mediana por frase y 241 ms en el caso más lento con 4 hilos en un Ryzen 5 1600; el throughput dependerá del número de hilos y de la longitud de las frases.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `sean-reed/opus-mt-es-en-onnx` | no disponible (6 capas, 8 cabezas, D=64) | no disponible | es → en | Apache 2.0 | ONNX | Cuantizado a 8 bits, con alineación de palabras |
| `Helsinki-NLP/opus-mt-es-en` | mismo modelo base | no disponible | es → en | Apache 2.0 | safetensors / PyTorch | Modelo original sin cuantizar ni exportar a ONNX |
| `Helsinki-NLP/opus-mt-en-es` | arquitectura Marian equivalente | no disponible | en → es | Apache 2.0 | safetensors / PyTorch | Dirección inversa del par de traducción |
| Otros modelos Marian de OPUS-MT | variable según par | no disponible | múltiples pares | Apache 2.0 | safetensors / PyTorch | Familia de modelos pequeños para traducción |

La comparación se limita a la familia OPUS-MT porque no se dispone de datos de benchmarks que permitan contrastar con modelos de traducción de mayor tamaño (NLLB, M2M-100, etc.) de forma rigurosa.

## Limitaciones y advertencias

- La alineación de palabras es aproximada y se basa en la atención de una sola capa del decoder; falla cuando una palabra origen se traduce por varias palabras destino (por ejemplo, "vegetariana" alineada con "a" en "a vegetarian") y solo devuelve una palabra destino por palabra origen.
- Las métricas de alineación proceden de un conjunto pequeño (113 palabras en 68 frases) etiquetado por una sola persona, por lo que no deben tomarse como una evaluación robusta.
- El modelo solo cubre el par español-inglés; no se documentan otros idiomas.
- No se han publicado resultados de benchmarks estándar de calidad de traducción (BLEU, COMET, etc.) en la información disponible.
- Es una conversión no afiliada a la Universidad de Helsinki; los pesos son los del modelo original cuantizados, y cualquier problema de calidad de traducción proviene del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar el archivo `LICENSE` y la atribución al proyecto OPUS-MT.
- Al ser un modelo de traducción automática, puede producir traducciones literalmente incorrectas o perder matices en frases largas o con terminología especializada; no se documenta un límite de contexto explícito.
- El formato ONNX limita las opciones de despliegue a ONNX Runtime u otros entornos compatibles; no hay pesos en safetensors ni GGUF en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sean-reed/opus-mt-es-en-onnx
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
