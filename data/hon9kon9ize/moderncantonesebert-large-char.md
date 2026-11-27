# hon9kon9ize/ModernCantoneseBert-Large-Char

## Resumen

ModernCantoneseBert-Large-Char es un modelo de lenguaje enmascarado (masked language modeling, MLM) de tipo encoder, desarrollado por el usuario hon9kon9ize, que adapta la arquitectura ModernBERT-large al cantonés escrito y al chino escrito mediante un tokenizador estrictamente a nivel de carácter. El modelo parte de hon9kon9ize/ModernCantoneseBert-Large y sustituye su tokenizador byte-level BPE por uno en el que cada carácter chino ocupa exactamente un token, lo que habilita tareas alineadas a token como el reconocimiento de entidades nombradas (NER), la segmentación de palabras o la extracción de spans, donde el BPE original producía alineaciones poco fiables.

Con 356.718.464 parámetros, 28 capas, dimensión oculta de 1024 y 16 cabezas de atención, el modelo conserva el cuerpo transformer de ModernBERT (atención alterna local/global, RoPE y hasta 8192 posiciones) y ha sido reentrenado con MLM durante 5 épocas sobre unos 637 millones de tokens por época (unos 3200 millones de tokens vistos en total) de texto cantonés y chino escrito, en secuencias empaquetadas de 2048 tokens.

Su relevancia actual reside en que resuelve un problema concreto de tokenización en lenguas sin separación explícita de palabras: al garantizar un token por carácter, facilita el etiquetado secuencial y la interpretabilidad, a costa de perder información de superficie en material no chino (URLs, correos, palabras latinas y números se colapsan en tokens de clase). La licencia es Apache 2.0 y el uso previsto declarado por el autor es de investigación y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer con atención alterna local/global y RoPE) |
| Parametros totales | 356.718.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 posiciones máximas (entrenado con secuencias de 2048) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | yue (cantonés), zh (chino escrito, tradicional y simplificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 28 capas con dimensión oculta de 1024 y 16 cabezas de atención, que combina atención local y global alternadas y codificación posicional rotatoria (RoPE), con un máximo de 8192 posiciones. El vocabulario es de 12.160 tokens de carácter: 10.950 caracteres Han más puntuación, símbolos, kana y griego, 5 tokens de clase y 256 ranuras `[unusedN]` reservadas. Los caracteres tradicionales y simplificados se conservan sin unificar, y los numerales chinos (二零二零, 一千, 廿) permanecen como caracteres. El material no chino se normaliza en el tokenizador a un único token por elemento: `[URL]`, `[EMAIL]`, `[LATIN]` (una palabra latina, incluidos dígitos), `[NUM]` (números arábigos) y `[FOREIGN]` (otros sistemas de escritura). Se aplica normalización NFKC y se eliminan los espacios en blanco.

El entrenamiento parte del cuerpo de 28 capas de ModernCantoneseBert-Large: cada embedding de carácter se inicializa como la media de los embeddings BPE que mapeaba su texto, y el decodificador MLM atado y su sesgo se inicializan del mismo modo. Después, el modelo completo se reentrena con MLM sobre secuencias empaquetadas de 2048 tokens durante 5 épocas, con unos 637 millones de tokens por época (unos 3200 millones en total). El corpus es un subconjunto filtrado de ModernCantoneseBert-Large: unos 384.000 de los 626.000 documentos (311.221 secuencias empaquetadas de 2048 tokens, con 20.000 reservadas para evaluación), procedentes de Common Crawl filtrado en cantonés y de noticias y artículos extraídos de la web. Se descartaron documentos con más del 70 % de caracteres no blancos latinos o dígitos, con menos del 15 % de caracteres Han o con más del 10 % de letras de otros sistemas; el filtrado conservó el 97 % de los caracteres Han y elevó su proporción del 30 % al 74 %. El conjunto de datos no se publica por respeto a los derechos de autor.

## Capacidades

- Relleno de máscaras (fill-mask) a nivel de carácter sobre texto cantonés y chino escrito.
- Extracción de características (feature extraction) para tareas posteriores de NLP.
- Ajuste fino para etiquetado secuencial alineado a token: NER, segmentación de palabras, extracción de spans y otras tareas de sequence labeling.
- Manejo de texto en escritura tradicional y simplificada sin unificación, lo que permite distinguir variantes gráficas.
- Normalización interna de URLs, correos, palabras latinas, números y otros sistemas de escritura en tokens de clase.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un encoder MLM, no un modelo generativo de instrucciones.
- Capacidad multilingüe limitada a yue y zh; el material en otras escrituras se reduce a `[FOREIGN]`.

## Casos de uso

- Reconocimiento de entidades nombradas en cantonés: al asignar un token por carácter, es posible etiquetar cada carácter con BIO y entrenar un cabezal de clasificación token a token, evitando los desajustes que produce un BPE que fusiona palabras completas.
- Segmentación de palabras en chino y cantonés: un clasificador por carácter sobre las representaciones del modelo permite decidir fronteras de palabra, aprovechando que cada carácter es una unidad independiente.
- Extracción de spans para sistemas de respuesta a preguntas extractiva: los offsets exactos de los caracteres ordinarios permiten mapear la predicción del modelo al texto original sin ambigüedad.
- Etiquetado de corpus y anotación asistida: el modelo puede preetiquetar entidades o categorías gramaticales en grandes volúmenes de texto cantonés para revisión humana posterior.
- Filtrado y clasificación de documentos en pipelines de datos: con fine-tuning sobre las representaciones del encoder se pueden construir clasificadores de temática, calidad o registro para corpus cántoneses.
- Investigación lingüística computacional: el vocabulario de 10.950 caracteres Han con tradicional y simplificado separados facilita estudios de variación gráfica y de numerales chinos sin colapsar formas.
- Búsqueda semántica y recuperación sobre texto cantonés: las representaciones del encoder pueden alimentar índices vectoriales para recuperación de documentos, siempre que el contenido latino no sea determinante.

## Benchmarks y rendimiento

Resultados de evaluación publicados por el autor sobre el conjunto de evaluación reservado (MLM):

| Metrica | ModernCantoneseBert-Large-Char | ModernCantoneseBert-Large (referencia, no comparable) |
|---|---|---|
| Loss | 0,9725 | 1,4511 |
| Accuracy | 0,7807 | 0,7052 |
| Perplexity | 2,64 | no disponible |

El propio autor advierte que estas cifras no son comparables entre ambos modelos: el modelo de referencia predice tokens BPE que a menudo son palabras completas, mientras que este predice caracteres individuales con el resto de la palabra visible, y se evalúa sobre una versión filtrada del corpus. No se han publicado resultados de benchmarks en la informacion disponible para tareas downstream (NER, clasificación, segmentación).

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,4 GB de pesos (tamaño del repositorio); en fp16 o bf16, aproximadamente 0,7 GB; en int8, en torno a 0,4 GB. A estas cifras hay que sumar el estado de activaciones y el lote, que crecen con la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en fp16 con lotes pequeños; para fine-tuning con secuencias de 2048 tokens se recomienda una GPU de 16-24 GB (RTX 4090, A100 40 GB, H100) según el tamaño de lote.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, incluso en fp32 para inferencia con lotes moderados.
- Opciones de despliegue: transformers (probado con la versión 5.23.0; el tokenizador y la configuración también cargan con la 4.52), y exportación a ONNX u otros formatos de inferencia de encoders. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernCantoneseBert-Large-Char | 356,7 M | 8192 (entrenado a 2048) | MLM a nivel de carácter | Apache 2.0 | Hugging Face |
| ModernCantoneseBert-Large | no disponible | 8192 | MLM con BPE byte-level | Apache 2.0 | Hugging Face |
| ModernCantoneseBert-Base | no disponible | 8192 | MLM con BPE byte-level | Apache 2.0 | Hugging Face |

La comparación con modelos cántoneses de otros autores (por ejemplo, variantes de BERT chino o cantonés de terceros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigación y académico según el autor; puede no ser adecuado para producción sin evaluación y fine-tuning adicionales.
- No hay evaluación downstream: solo se han medido loss y accuracy de MLM; no se ha ajustado ni evaluado en NER, clasificación u otras tareas.
- Los tokens de clase ocultan la forma superficial: todas las palabras latinas se convierten en `[LATIN]` y todos los números en `[NUM]`, por lo que el modelo no distingue HSBC de MTR ni 2019 de 2020; no es adecuado para contenido en inglés o con code-switching donde las palabras latinas importan.
- La tokenización es con pérdida: decodificar los ids no reproduce la entrada, ya que se eliminan espacios y los tokens de clase sustituyen su texto.
- Los offsets de los tokens de clase cubren solo el último carácter que reemplazaron, no la palabra o número completo; los offsets de caracteres ordinarios son exactos.
- El entrenamiento usó secuencias de 2048 tokens; el comportamiento con entradas más largas (hasta las 8192 de la arquitectura) no se ha evaluado.
- Riesgo de sesgos derivado del corpus (Common Crawl y noticias web) no cuantificado por el autor.
- Riesgo de alucinación en tareas generativas: al ser un encoder MLM no genera texto libre, pero sus predicciones de relleno pueden ser incorrectas en contextos ambiguos.
- El conjunto de datos de entrenamiento no se publica por derechos de autor, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara el modelo para fines de investigación, por lo que conviene validar su idoneidad antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hon9kon9ize/ModernCantoneseBert-Large-Char
- Modelo base: https://huggingface.co/hon9kon9ize/ModernCantoneseBert-Large
- Modelo ModernCantoneseBert-Base: https://huggingface.co/hon9kon9ize/ModernCantoneseBert-Base
- Imagen del proyecto: https://huggingface.co/hon9kon9ize/ModernCantoneseBert-Base/resolve/main/ModernCantoneseBert.png
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
