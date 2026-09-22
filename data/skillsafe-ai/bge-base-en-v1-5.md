# skillsafe-ai/bge-base-en-v1.5

## Resumen

skillsafe-ai/bge-base-en-v1.5 es una redistribución del modelo de embeddings BAAI/bge-base-en-v1.5 publicada por SkillSafe, orientada a inferencia en navegador. No se trata de un modelo nuevo ni de un reentrenamiento: el repositorio contiene una importación reproducible del export ONNX oficial del modelo base, con cada fichero fijado por SHA-256 y verificado con onnx.checker y una ejecución de humo sobre onnxruntime. El pipeline declarado es feature-extraction y la salida es un vector de 768 dimensiones.

El modelo resuelve el problema clásico de generar embeddings de frase para búsqueda semántica, recuperación aumentada (RAG), clustering y clasificación, pero con el foco puesto en su ejecución íntegra en el cliente mediante onnxruntime-web con WebGPU o WASM. Esto permite construir aplicaciones que no envían texto a un servidor, algo relevante para productos con requisitos de privacidad o con necesidad de funcionar sin conexión.

Arquitectónicamente es un transformer encoder tipo BERT-base con ventana de 512 tokens, heredado del modelo base de BAAI (FlagEmbedding) bajo licencia MIT. El repositorio ocupa 0,4 GB y solo distribuye el artefacto ONNX en fp32 (415,62 MB), sin variantes cuantizadas ni pesos safetensors. El modelo fue creado el 22 de septiembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERT-base); export ONNX del modelo base BAAI/bge-base-en-v1.5, opset 11 |
| Parámetros totales | No declarado en este repositorio; heredado del modelo base BERT-base (aproximadamente 110 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en este repositorio; heredada del modelo base: 512 tokens. El grafo ONNX usa dimensiones dinámicas `['batch_size', 'sequence_length']` |
| Tipos de cuantización | Ninguno distribuido: un único artefacto ONNX en fp32 (415,62 MB). El tag `base_model:quantized` indica derivación del modelo base, no presencia de pesos cuantizados |
| Idiomas soportados | Inglés (sufijo `-en-` del modelo base). El repositorio no declara una lista formal de idiomas |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model.onnx`, fp32) más tokenizer en JSON. No se incluyen safetensors ni pesos PyTorch |
| Dimensión de embedding | 768 |
| Entradas del grafo | `input_ids` int64, `attention_mask` int64, `token_type_ids` int64, forma `['batch_size', 'sequence_length']` |
| Salidas del grafo | `last_hidden_state` float32, forma `['batch_size', 'sequence_length', 768]` |
| Pipeline | feature-extraction |
| Librería declarada | transformers.js |
| Tamaño del repositorio | 0,4 GB |
| Fecha de creación / actualización | 2026-09-22 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base recibido, un transformer encoder bidireccional tipo BERT-base con 768 dimensiones ocultas, empleado aquí exclusivamente para extracción de características. SkillSafe no ha entrenado ni ajustado nada: su trabajo consiste en importar el export ONNX publicado por BAAI en el commit `a5beb1e3e68b9ab74eb54cfd186867f64f240e1a` y empaquetarlo para consumo desde navegador. La cadena de herramientas registrada es Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, con una receta (`recipes/bge-base-en-v1.5.yaml`, sha256 `e18fa3565b0987daf57fd42046ed70c0039a7e7d5fd5b9f311f624f4ea42dda8`) que documenta la conversión.

El repositorio incluye `1_Pooling/config.json`, por lo que el pooling queda definido en el propio bundle; el consumidor debe aplicarlo junto con el tokenizer para obtener un vector por frase a partir de `last_hidden_state`. No se documentan en esta ficha el volumen de tokens de entrenamiento, la composición del corpus, ni si el modelo base utilizó RetroMAE, aprendizaje contrastivo, RLHF o DPO: esos detalles pertenecen a la documentación de BAAI y no aparecen en la información proporcionada.

La innovación relevante aquí no es algorítmica, sino de empaquetado y trazabilidad: cada fichero está fijado por SHA-256, el manifiesto completo registra la receta, las fuentes, el hash de `uv.lock` y los números de verificación por fichero, y el modelo ONNX supera `onnx.checker` además de una ejecución de humo en CPU. El repositorio distingue explícitamente entre ficheros `registry` (servidos desde `models.skillsafe.ai` una vez validados) y `bundle` (empaquetados dentro de una aplicación).

## Capacidades

- Generación de embeddings de frase y de pasaje: produce vectores float32 de 768 dimensiones por secuencia.
- Búsqueda semántica y recuperación de información: adecuado como retriever denso en pipelines de RAG, con similitud coseno tras normalización.
- Clustering y deduplicación de textos: agrupación de documentos, tickets o fragmentos por proximidad vectorial.
- Clasificación y enrutado: uso de los embeddings como entrada de clasificadores ligeros o para zero-shot mediante comparación con descripciones de clase.
- Detección de similitud y parafraseo: comparación de pares de textos para deduplicación o verificación de consistencia.
- Ejecución en navegador: el artefacto está pensado para onnxruntime-web con WebGPU o WASM, sin backend.
- Ejecución en CPU: validada en CPU durante la verificación del repositorio.
- Soporte de tool calling / function calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible por sí mismo; puede actuar como componente de recuperación dentro de un agente.
- Capacidades multilingües: no disponibles; el modelo base es de inglés.
- Capacidades especiales: no dispone de modo de razonamiento, visión ni audio.

## Casos de uso

- Búsqueda semántica íntegramente en el navegador: la aplicación descarga el ONNX una vez y calcula embeddings de consulta y documentos en el cliente con WebGPU, evitando enviar texto del usuario a un servidor. Es adecuado porque el artefacto está empaquetado específicamente para onnxruntime-web.
- RAG en aplicaciones de escritorio o PWA con funcionamiento sin conexión: el índice vectorial y el encoder viven en el dispositivo, de modo que la recuperación de contexto funciona aunque no haya red.
- Deduplicación de corpus y contenidos: cálculo de embeddings por documento y agrupación por umbral de similitud coseno para eliminar duplicados en bases documentales o catálogos.
- Clasificación y enrutado de tickets de soporte: los embeddings alimentan un clasificador ligero que asigna categoría o cola, con la ventaja de que el encoder puede ejecutarse en CPU sin GPU dedicada.
- Caché semántica delante de un LLM: se compara la consulta entrante con consultas previas mediante similitud vectorial y se devuelve la respuesta cacheada si supera el umbral, reduciendo llamadas al modelo generativo.
- Filtrado y moderación de contenido en el cliente: comparación de textos contra una lista de patrones o ejemplos conocidos sin que el contenido salga del dispositivo.
- Recomendación de contenido relacionado: representación de artículos, productos o vídeos como vectores de 768 dimensiones y recuperación de los vecinos más próximos para alimentar un carrusel de recomendaciones.
- Construcción de datasets etiquetados de forma débil: agrupación de grandes volúmenes de texto no etiquetado para generar clusters que después se anotan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen cifras de MTEB, MMLU, HumanEval ni GSM8K, y este repositorio no publica evaluaciones propias del modelo base.

El único dato de rendimiento presente es la prueba de humo de verificación del export ONNX: entrada con `input_ids`, `attention_mask` y `token_type_ids` de forma `[1, 8]`, salida `last_hidden_state` `[1, 8, 768]`, ejecutada en CPU en 6,0 ms. Se trata de una comprobación de integridad con entradas de relleno (ceros) y longitud 8, no de un benchmark representativo; no hay datos de latencia ni de throughput para longitudes reales de 128 a 512 tokens.

## Requisitos de hardware

- Peso de los ficheros: 415,62 MB para `onnx/model.onnx` en fp32, más 0,68 MB de tokenizer. El repositorio completo ocupa 0,4 GB.
- Memoria para inferencia: por debajo de 1 GB de VRAM o RAM con batch pequeño; el grueso corresponde a los pesos, más activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer sirve (RTX 3060, RTX 4060, RTX 4090). Aceleradores de centro de datos como A100 o H100 funcionan, pero resultan sobredimensionados para un encoder BERT-base.
- ¿Cabe en GPU consumer? Sí, en prácticamente todas, incluidas integradas modestas. También funciona en CPU sin GPU.
- Navegador: WebGPU como proveedor preferente y WASM como alternativa, mediante `onnxruntime-web`.
- Opciones de despliegue: onnxruntime-web, ONNX Runtime (CPU, CUDA, TensorRT, OpenVINO), transformers.js. Para los pesos upstream, text embeddings inference, sentence-transformers o FastEmbed. No se distribuye GGUF, por lo que llama.cpp y Ollama no son la vía natural con este repositorio.
- Latencia y throughput: solo se documenta la prueba de humo de 6,0 ms en CPU con batch 1 y secuencia 8. No hay datos publicados de latencia o throughput a 128-512 tokens ni con WebGPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Export ONNX |
|---|---|---|---|---|---|
| skillsafe-ai/bge-base-en-v1.5 (este) | ~110 M (heredado) | 512 (heredado) | 768 | MIT | Sí, único formato distribuido (fp32) |
| BAAI/bge-base-en-v1.5 | ~110 M | 512 | 768 | MIT | Sí (export propio) |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 | 384 | MIT | Sí |
| BAAI/bge-large-en-v1.5 | ~335 M | 512 | 1024 | MIT | Sí |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 | 384 | Apache-2.0 | Sí |

Los datos de los modelos alternativos provienen de sus respectivos repositorios upstream y no se han podido verificar con la información recuperada en esta búsqueda. Bajo la licencia MIT y las mismas dimensiones y contexto, la diferencia de este repositorio frente a BAAI/bge-base-en-v1.5 es exclusivamente operativa: incluye pooling, tokenizer y verificación por hash orientados a navegador, a cambio de no ofrecer pesos en safetensors.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no está pensado para texto en castellano ni en otras lenguas, y el repositorio no declara idiomas soportados.
- Ventana de 512 tokens: los documentos más largos requieren troceado (chunking) y estrategias de agregación.
- Sin cuantizaciones: 415,62 MB en fp32 es una descarga considerable para una aplicación web o móvil; los tags mencionan `base_model:quantized`, pero no hay artefactos int8 ni fp16 en el repositorio.
- Sin safetensors ni pesos PyTorch: no se puede hacer fine-tuning directamente con este repositorio; hay que acudir a los pesos upstream.
- Repositorio sin validación comunitaria: 0 descargas y 0 valoraciones, creado y actualizado el mismo día. La verificación se limita a `onnx.checker` y una ejecución de humo con entradas de ceros, no a una evaluación de calidad de embeddings.
- Trazabilidad dependiente de un tercero: la reproducibilidad se apoya en la receta y los hashes de SkillSafe y en un commit concreto de BAAI; si esos recursos desaparecen, la cadena de procedencia se rompe.
- Riesgo de falsos positivos en similitud: como modelo de embeddings, no genera texto y por tanto no alucina en el sentido habitual, pero umbrales mal calibrados producen recuperaciones irrelevantes o deduplicaciones incorrectas.
- Sesgos: no se documenta ninguna evaluación de sesgo en la información disponible; los sesgos heredados del corpus de entrenamiento del modelo base no están caracterizados aquí.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución a Beijing Academy of Artificial Intelligence (FlagEmbedding). La receta y la model card pertenecen al repositorio de SkillSafe y se rigen por su propia licencia.
- Dependencia del tokenizer y del pooling incluidos: el consumidor debe aplicar la configuración de `1_Pooling/config.json` para que los vectores sean comparables con los del modelo base.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/skillsafe-ai/bge-base-en-v1.5
- Modelo base upstream: https://huggingface.co/BAAI/bge-base-en-v1.5
- Commit upstream fijado: https://huggingface.co/BAAI/bge-base-en-v1.5/tree/a5beb1e3e68b9ab74eb54cfd186867f64f240e1a
- Aviso de licencia del modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5/blob/a5beb1e3e68b9ab74eb54cfd186867f64f240e1a/README.md
- Receta e infraestructura del conversor: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- La búsqueda web realizada no devolvió resultados relevantes: los enlaces recuperados corresponden a la aplicación PaperPort y a documentación de Brother, sin relación con el modelo. No se dispone, por tanto, de papers, blogs ni demos adicionales verificados.
