# HunTeR255/meetinglab-models

## Resumen

HunTeR255/meetinglab-models no es un modelo único, sino una colección de tres paquetes de modelos de embeddings convertidos a Core ML para la aplicación iOS Meeting Lab (grabadora de reuniones offline con búsqueda). Cada carpeta del repositorio contiene un modelo de embeddings distinto: e5-small (384 dimensiones), bge-m3 (1024 dimensiones) y embeddinggemma-300m (768 dimensiones). Los pesos originales pertenecen a sus autores (intfloat, BAAI y Google); el autor del repositorio solo aporta la conversión.

La conversión se ha realizado con coremltools 9 mediante cuantización lineal int8 de los pesos, longitudes de secuencia enumeradas (32, 64, 128, 256 y 512 tokens), mean pooling y normalización L2 integrados dentro del grafo del modelo. Cada paquete incluye el modelo compilado (.mlmodelc dentro de un ZIP), el tokenizer rápido de HuggingFace, un fichero embedding.json con metadatos de uso (id, dimensión, prefijos, buckets, pooling) y un report.json con el informe de conversión.

El interés de esta publicación es acotado pero claro: permite ejecutar búsqueda semántica multilingüe totalmente en dispositivo en iOS, sin enviar transcripciones de reuniones a servidores externos. El repositorio acumula 0 descargas y 0 likes, registra licencia mixta y fue creado y actualizado el 17 de septiembre de 2026 según los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoders transformer bidireccionales convertidos a Core ML; en embeddinggemma-300m, encoder Gemma3 bidireccional con mean pooling, Dense 768→3072, Dense 3072→768 y L2 |
| Parametros totales | No disponible para ninguno de los tres paquetes |
| Parametros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | 512 tokens maximo (buckets enumerados de 32, 64, 128, 256 y 512) |
| Tipos de cuantizacion | int8 lineal en los pesos, aplicada durante la conversion con coremltools 9 |
| Idiomas soportados | Ruso (ru) e ingles (en), segun los tags del repositorio |
| Licencia | Mixta: MIT para e5-small y bge-m3; Gemma Terms of Use para embeddinggemma-300m |
| Formato de pesos | Core ML (.mlmodelc compilado, distribuido como model.mlmodelc.zip); tokenizer.json y tokenizer_config.json en formato HuggingFace fast; metadatos en embedding.json y report.json |
| Repositorio | HunTeR255/meetinglab-models |
| Tamano del repositorio | 2,3 GB (los tres paquetes en conjunto) |
| Libreria declarada | coreml |
| Tags | coreml, onnx, sentence-embeddings, ios, ru, en, license:other, region:us |
| Descargas / likes | 0 / 0 |
| Fechas registradas | Creado el 17 de septiembre de 2026; actualizado el 17 de septiembre de 2026 |

Detalle por paquete incluido en el repositorio:

| Carpeta | Modelo de origen | Dimension de embedding | Max tokens | Licencia del origen |
|---|---|---|---|---|
| e5-small/ | intfloat/multilingual-e5-small | 384 | 512 | MIT |
| bge-m3/ | BAAI/bge-m3 | 1024 | 512 | MIT |
| embeddinggemma-300m/ | google/embeddinggemma-300m | 768 | 512 | Gemma Terms of Use |

## Arquitectura y entrenamiento

Los tres paquetes son modelos de embeddings de frases, no modelos generativos. El autor no ha entrenado ni ajustado pesos: la aportación es exclusivamente la conversión desde los checkpoints originales de PyTorch mediante el script scripts/convert_embedding.py, con coremltools 9. El proceso aplica cuantización lineal int8 a los pesos, fija longitudes de secuencia enumeradas (32, 64, 128, 256 y 512) para permitir que Core ML seleccione el grafo adecuado, e integra el mean pooling y la normalización L2 dentro del propio modelo, de modo que la salida es directamente un vector normalizado.

La única arquitectura detallada en la información disponible es la de embeddinggemma-300m, que conserva la estructura original: encoder Gemma3 bidireccional, mean pooling, una capa Dense de 768 a 3072, otra Dense de 3072 a 768 y normalización L2 final. Para e5-small y bge-m3 no se detalla la arquitectura interna en la model card, más allá de indicar que se preserva la del checkpoint de origen. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO, porque el autor no entrena ningún modelo.

Cada paquete incluye un fichero reference.json con embeddings de sentence-transformers para unos pocos textos, de forma que la ruta tokenizer + Core ML pueda verificarse numéricamente. El autor reporta una similitud coseno igual o superior a 0,999 en sus pruebas, lo que mide fidelidad de la conversión, no calidad del modelo.

## Capacidades

- Generación de embeddings de frases y pasajes para búsqueda semántica, con pooling y normalización L2 integrados en el grafo.
- Recuperación semántica multilingüe declarada para ruso e inglés dentro de la misma ventana de 512 tokens.
- Búsqueda sobre transcripciones de reuniones en local, que es el caso de uso declarado de la app Meeting Lab.
- Soporte de longitudes de secuencia enumeradas (32, 64, 128, 256, 512), lo que permite que Core ML elija el grafo y reduzca coste en textos cortos.
- Uso de prefijos configurables por modelo, expuestos en embedding.json (relevante para las convenciones de consulta/pasaje de la familia e5).
- Inferencia en dispositivo en iOS mediante Core ML, sin dependencia de red.
- No dispone de tool calling, function calling, capacidades de agente, generación de texto, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Búsqueda semántica en transcripciones de reuniones en iOS: la app indexa fragmentos de la transcripción y los recupera por significado; el modelo se ejecuta en el dispositivo, de modo que el contenido de la reunión no sale del teléfono.
- Recuperación aumentada local (RAG on-device): los vectores generados alimentan un índice en el dispositivo que sirve pasajes relevantes a un modelo generativo local o remoto, sin exponer el corpus completo.
- Clasificación y enrutado de documentos internos: agrupar notas, correos o tickets por similitud de embedding para dirigirlos a la cola adecuada.
- Deduplicación y detección de near-duplicates: comparar vectores normalizados mediante producto escalar para eliminar contenido repetido en repositorios documentales bilingües ruso-inglés.
- Recomendación de contenido relacionado: sugerir reuniones, actas o fragmentos previos similares al documento que el usuario está consultando.
- Anonimización y filtrado previo al envío a la nube: calcular embeddings en local y enviar solo los fragmentos que superan un umbral de relevancia, reduciendo coste y exposición de datos.
- Búsqueda cruzada ruso-inglés: con e5-small o bge-m3, consultar en un idioma y recuperar pasajes del otro dentro del mismo índice.
- Evaluación comparativa de embeddings en iOS: usar los tres paquetes sobre el mismo corpus para medir cuál funciona mejor antes de fijar uno en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MTEB, MMLU, HumanEval u otros) en la informacion disponible. El único dato numérico aportado por el autor es la fidelidad de la conversión frente a sentence-transformers:

| Metrica | Valor | Condiciones |
|---|---|---|
| Similitud coseno frente a la referencia | >= 0,999 | Pruebas del autor con unos pocos textos de referencia, tras cuantizacion int8 |
| Benchmarks de recuperacion (MTEB, BEIR) | No disponible | No reportados en la informacion proporcionada |
| Latencia y throughput | No disponible | No reportados en la informacion proporcionada |

## Requisitos de hardware

- Ejecución prevista en dispositivos Apple mediante Core ML, con reparto entre Neural Engine, GPU y CPU según la política del sistema; el consumo se hace contra memoria unificada, no contra VRAM dedicada.
- El repositorio completo ocupa 2,3 GB, pero el tamaño de cada paquete por separado (e5-small, bge-m3, embeddinggemma-300m) no está especificado en la información disponible.
- No se indican requisitos mínimos de versión de iOS ni de hardware (chip A-series o M-series) en la información proporcionada.
- No se documentan opciones de despliegue alternativas: el formato entregado es Core ML. No hay artefactos GGUF ni indicación de compatibilidad con llama.cpp, Ollama, vLLM o TGI; estos motores están pensados para modelos generativos y no para estos paquetes de embeddings.
- Aunque el repositorio incluye la etiqueta onnx, la model card no describe ningún artefacto ONNX ni un proceso de conversión a ese formato.
- Al ser modelos de embeddings, la VRAM estimada para GPU de datacenter (A100, H100, RTX 4090) no está documentada y no aplica al flujo de despliegue descrito.

## Comparativa con modelos similares

La comparación más directa es entre los tres paquetes del propio repositorio, ya que todos cubren la misma tarea (embeddings de frases para iOS) y comparten el mismo pipeline de conversión:

| Modelo | Dimension | Max tokens | Licencia | Notas |
|---|---|---|---|---|
| e5-small (intfloat/multilingual-e5-small) | 384 | 512 | MIT | El más ligero de los tres; requiere atención a los prefijos de consulta y pasaje |
| bge-m3 (BAAI/bge-m3) | 1024 | 512 | MIT | Mayor dimensión y presumiblemente mayor coste de indexado; licencia permisiva |
| embeddinggemma-300m (google/embeddinggemma-300m) | 768 | 512 | Gemma Terms of Use | Dimensión intermedia; sujeto a la política de uso prohibido de Gemma |
| Alternativas fuera del repositorio | No disponible | No disponible | No disponible | No se proporcionan datos de otros modelos comparables |

No se dispone de resultados de recuperación (MTEB, BEIR) para ninguno de los tres, por lo que no es posible establecer una comparación de calidad entre ellos ni frente a terceros con la información disponible.

## Limitaciones y advertencias

- No son modelos generativos: no producen texto, código ni razonamiento; solo vectores de embedding.
- La ventana máxima es de 512 tokens por fragmento, lo que obliga a trocear documentos largos antes de indexarlos.
- Los idiomas declarados son ruso e inglés. Aunque los modelos de origen sean multilingües, la model card no garantiza un rendimiento equivalente en otros idiomas, incluido el castellano.
- Licencia mixta: e5-small y bge-m3 son MIT, pero embeddinggemma-300m es un derivado de Gemma sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy. Cualquier uso comercial de ese paquete debe revisarse contra esos términos.
- Los pesos no pertenecen al autor del repositorio; la conversión se distribuye tal cual, sin garantías y sin proceso de validación documentado más allá del reference.json del propio autor.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación independiente de la conversión ni de su comportamiento en producción.
- Las fechas de creación y actualización registradas (17 de septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar el estado real del repositorio antes de integrarlo.
- El pipeline no está declarado en HuggingFace (no disponible), y la etiqueta onnx no se corresponde con ningún artefacto descrito en la model card.
- La cuantización int8 introduce una pérdida de precisión que el autor acota a una similitud coseno de 0,999 o superior en unos pocos textos de prueba; no hay evaluación sobre corpus grandes ni sobre tareas de recuperación reales.
- No hay información sobre latencia, consumo de batería ni comportamiento térmico en dispositivos iOS, factores críticos en una app de grabación de reuniones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HunTeR255/meetinglab-models
- Modelo de origen e5-small: https://huggingface.co/intfloat/multilingual-e5-small
- Modelo de origen bge-m3: https://huggingface.co/BAAI/bge-m3
- Modelo de origen embeddinggemma-300m: https://huggingface.co/google/embeddinggemma-300m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Licencia declarada en el repositorio: https://huggingface.co/HunTeR255/meetinglab-models#meeting-lab--on-device-models
