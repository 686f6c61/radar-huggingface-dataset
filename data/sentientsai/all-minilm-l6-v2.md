# sentientsai/all-MiniLM-L6-v2

## Resumen

`sentientsai/all-MiniLM-L6-v2` es una redistribución en formato ONNX del conocido modelo de embeddings de frases `sentence-transformers/all-MiniLM-L6-v2`, publicada por Sentients AI como parte de su catálogo firmado de modelos para el plugin Text Core de Unreal Engine. No se trata de un modelo nuevo ni de un reentrenamiento: los bytes originales del publicador se conservan y se acompañan de artefactos derivados (versión fp16, grafo reescrito para HLSL y tokenizador reformateado) generados por scripts propios del proyecto.

El modelo resuelve el problema de medir similitud semántica entre dos fragmentos de texto en inglés, devolviendo embeddings vectoriales utilizables para búsqueda, memoria y emparejamiento. Es un transformer encoder de pequeño tamaño (aproximadamente 22,7 millones de parámetros en su versión original), diseñado para ser rápido en CPU y adecuado para despliegue en tiempo real dentro de motores de videojuegos.

Su relevancia actual es acotada y muy específica: no compite como modelo de propósito general, sino que sirve como componente de inferencia determinista dentro del ecosistema de Sentients. La ventaja frente al original es la disponibilidad de pesos ONNX con hashes SHA-256 fijados, versiones fp16 y fp32, y variantes para DirectML, TensorRT y HLSL, lo que facilita la integración en Unreal Engine con garantías de reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de `sentence-transformers/all-MiniLM-L6-v2`) |
| Parametros totales | no disponible en la informacion proporcionada (el modelo original MiniLM-L6 tiene ~22,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el original soporta 256 tokens) |
| Tipos de cuantizacion | fp32, fp16 |
| Idiomas soportados | ingles (segun la model card: "two pieces of English text") |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx.hlsl4`, `model_fp16.onnx`), `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder tipo MiniLM con 6 capas, destilado del modelo original de sentence-transformers y optimizado para generar embeddings de frases. El autor de esta ficha no aporta detalles sobre el entrenamiento original; toda la información de entrenamiento corresponde al modelo upstream `sentence-transformers/all-MiniLM-L6-v2` y no se reproduce aquí por no estar incluida en la información proporcionada.

La contribución técnica de esta publicación es el empaquetado: se ofrecen cuatro artefactos con hashes SHA-256 fijados. `model.onnx` (86,2 MiB, fp32) es el binario del publicador y funciona en CPU, DirectML, TensorRT y HLSL. `model.onnx.hlsl4` (86,4 MiB, fp32) es un grafo reescrito mediante `SentientsModelsCommandlet.cpp` para ejecutarse en HLSL. `model_fp16.onnx` (43,3 MiB) es una conversión a media precisión generada con `make_fp16.py` para DirectML y TensorRT. `tokenizer.json` (0,7 MiB) es un tokenizador reformateado con `make_readable_tokenizer.py`. El modelo se invoca desde el plugin como `ETextModel::AllMiniLML6V2`, aceptando `CoreTextInput` y `CoreTextListInput` y devolviendo `CoreEmbeddingOutput`.

## Capacidades

- Generación de embeddings de frases en inglés para medir similitud semántica entre textos.
- Búsqueda semántica y recuperación de información mediante comparación de vectores.
- Emparejamiento de textos (matching) y deduplicación semántica.
- Memoria vectorial para agentes y sistemas de diálogo.
- Entrada de texto único (`CoreTextInput`) o lista de textos (`CoreTextListInput`) con salida `CoreEmbeddingOutput`.
- Ejecución en CPU, DirectML, TensorRT y HLSL según la variante de archivo elegida.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni modo thinking.

## Casos de uso

- Búsqueda semántica en documentación de videojuegos: indexar manuales y notas de diseño como vectores y recuperar los fragmentos más relevantes para una consulta en lenguaje natural, aprovechando la baja latencia del modelo en CPU.
- Memoria a largo plazo de NPCs en Unreal Engine: almacenar recuerdos de diálogo como embeddings y recuperar los más similares al contexto actual para mantener coherencia conversacional dentro del plugin Text Core.
- Deduplicación de entradas en foros o bases de conocimiento: comparar embeddings de pares de textos y marcar como duplicados aquellos cuya similitud coseno supere un umbral configurable.
- Enrutamiento de tickets de soporte: clasificar consultas de clientes comparando su embedding con el de un conjunto de categorías predefinidas, sin necesidad de un clasificador entrenado aparte.
- Filtrado de contenido y detección de near-duplicates en pipelines de moderación: calcular similitud entre mensajes nuevos y una lista de referencia de textos prohibidos.
- Componente de retrieval en un pipeline RAG ligero: generar embeddings de chunks de documentación y de la pregunta del usuario para seleccionar el contexto que se pasará a un LLM generativo, ejecutándose en la misma máquina que el motor.
- Emparejamiento de assets o prompts en herramientas de autoría: sugerir activos o plantillas similares a partir de descripciones textuales introducidas por el diseñador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (pesos de 86,2 MiB más activaciones y tokenizador); aproximadamente 0,5 GB en fp16 (43,3 MiB de pesos).
- GPU recomendadas: cualquier GPU compatible con DirectML o TensorRT; el modelo es lo bastante pequeño para ejecutarse en GPUs integradas y en CPU sin aceleración dedicada.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso en dispositivos de gama baja.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML, TensorRT), backend HLSL mediante el archivo `model.onnx.hlsl4` dentro de Unreal Engine, y el plugin Text Core de Sentients. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de embeddings de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `sentientsai/all-MiniLM-L6-v2` (esta ficha) | no disponible (~22,7 M en el original) | no disponible (256 tokens en el original) | inglés | Apache 2.0 | ONNX fp32/fp16/HLSL | Redistribución con hashes fijados y variantes para Unreal Engine |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22,7 M | 256 tokens | inglés | Apache 2.0 | safetensors, PyTorch, ONNX | Modelo upstream original, sin variantes HLSL ni fp16 empaquetadas |
| `sentence-transformers/paraphrase-MiniLM-L6-v2` | ~22,7 M | 128 tokens | inglés | Apache 2.0 | safetensors, PyTorch | Variante orientada a paráfrasis, no incluida en el catálogo de Sentients |
| `BAAI/bge-small-en-v1.5` | ~33 M | 512 tokens | inglés | MIT | safetensors, ONNX | Alternativa moderna con mayor contexto y mejor rendimiento reportado en MTEB |

La comparativa se limita a datos públicos de los modelos originales; no se dispone de mediciones propias sobre esta redistribución.

## Limitaciones y advertencias

- El modelo solo procesa inglés; no se declaran capacidades multilingües.
- Es un modelo de embeddings, no generativo: no produce texto, código ni respuestas.
- Riesgo de alucinación no aplica en el sentido habitual, pero la similitud coseno puede producir falsos positivos en textos con vocabulario compartido y significado distinto.
- La longitud de contexto no se especifica en la información proporcionada; el modelo upstream está limitado a 256 tokens, por lo que textos largos deben fragmentarse.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia y los hashes antes de desplegar, dado que esta es una redistribución de terceros y no la publicación oficial del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada fuera del ecosistema de Sentients.
- Las variantes `model.onnx.hlsl4` y `model_fp16.onnx` han sido generadas por scripts propios y no están validadas por el publicador original; su comportamiento numérico puede diferir del binario fp32 de referencia.
- El tokenizador ha sido reformateado (`make_readable_tokenizer.py`); conviene verificar que la tokenización coincide con la del modelo original antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sentientsai/all-MiniLM-L6-v2
- Catálogo firmado de Sentients: https://huggingface.co/sentientsai/sentients-catalog
- Modelo upstream: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
