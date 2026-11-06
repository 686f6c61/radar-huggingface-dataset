# isreal01/bge-m3-pt-int8-onnx

## Resumen

bge-m3-pt-int8-onnx es una versión podada y cuantizada del modelo de embeddings BAAI/bge-m3, publicada por el usuario isreal01. El objetivo no es otro que ejecutar un modelo de recuperación de información multilingüe directamente en el navegador mediante ONNX Runtime Web, reduciendo el peso de los 2,27 GB del original en fp32 a 389 MB. Para ello se parte de la exportación ONNX de tres salidas (dense, sparse y colbert) de newtechstudio/bge-m3-3head y se recorta el vocabulario a los 92.067 tokens compatibles con portugués, números y puntuación, de los 250.002 originales.

La motivación declarada por el autor es concreta: alimentar la herramienta Comparativo Tributário, que compara la descripción de una actividad económica con los ítems de la LC 123/2006 brasileña para sugerir el anexo del Simples Nacional. Se trata, por tanto, de un artefacto muy especializado en dominio y en idioma (portugués), no de un modelo de propósito general.

Su relevancia actual radica en la demostración de que un modelo de embeddings de 568 millones de parámetros puede desplegarse íntegramente en el cliente, sin backend, con latencias de centenas de milisegundos y una fidelidad respecto al original medida en un coseno medio de 0,981. Es un caso práctico de poda de vocabulario más cuantización int8 dinámica aplicada a un encoder transformer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) exportado a ONNX con tres cabezas: dense, sparse y colbert |
| Parámetros totales | no disponible (el modelo base BGE-M3 tiene 568 M; la poda de vocabulario reduce la matriz de embeddings) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (BGE-M3 soporta hasta 8192 tokens) |
| Tipos de cuantización | int8 dinámica (MatMul y Gather) mediante onnxruntime.quantization.quantize_dynamic |
| Idiomas soportados | portugués (pt); caracteres fuera del vocabulario recortado se mapean a `<unk>` |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, 389 MB) más tokenizer.json y tokenizer_config.json |
| Dimensión de embeddings | 1024 (salida dense) |
| Tamaño del vocabulario | 92.067 tokens (frente a 250.002 del original) |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de BGE-M3: un encoder transformer de tipo XLM-RoBERTa entrenado por BAAI para recuperación multi-función, con tres representaciones de salida simultáneas. La salida `dense` produce un vector de 1024 dimensiones por texto; la salida `sparse` asigna un peso por token, útil para recuperación léxica; y la salida `colbert` genera embeddings por token para late interaction. Esta versión no reentrena el modelo: parte del ONNX de tres salidas de newtechstudio y aplica dos transformaciones.

La primera es una poda de vocabulario: se conservan únicamente los subwords compuestos por letras del portugués, dígitos y puntuación, y se recorta en consecuencia la matriz de embeddings. El autor verifica que la segmentación de texto en portugués es idéntica a la del original en 2.771 textos, ya que el tokenizador Unigram solo emplea piezas con caracteres presentes en el texto. El fichero `manter.json` documenta la correspondencia entre cada id nuevo y su id original. La segunda transformación es una cuantización int8 dinámica sobre las operaciones MatMul y Gather. No se documentan datos de entrenamiento adicionales, RLHF ni ajuste fino; el conocimiento procede íntegramente del modelo base BAAI/bge-m3.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para similitud semántica y recuperación.
- Representaciones dispersas (sparse) con peso por token, combinables con la densa para búsqueda híbrida.
- Representaciones ColBERT para late interaction y reranking fino.
- Similitud de frases (sentence-similarity) en portugués.
- Ejecución en navegador mediante ONNX Runtime Web con backend WebAssembly.
- Procesamiento local sin envío de datos a servidor, al ejecutarse en el cliente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- Capacidad multilingüe reducida al portugués por la poda de vocabulario.

## Casos de uso

- Clasificación tributaria asistida en navegador: el propio autor lo emplea en Comparativo Tributário para comparar la descripción de una actividad con los ítems de la LC 123/2006 y sugerir el anexo del Simples Nacional, combinando dense y sparse (denso + 0,3 × esparso) con una precisión del 74,6 % en Python y 76,8 % en navegador sobre 138 descripciones de prueba.
- Búsqueda semántica en aplicaciones web sin backend: al pesar 389 MB y cargarse en 2,4 s con caché, permite ofrecer búsqueda por significado en portugués dentro de una SPA sin coste de servidor ni latencia de red.
- Deduplicación y agrupación de registros: calcular similitud coseno entre descripciones de productos, incidencias o formularios para detectar duplicados en el cliente antes de enviarlos.
- Sistemas de recomendación ligeros: indexar un catálogo modesto de documentos en portugués y recuperar los más afines a una consulta del usuario, todo dentro del navegador.
- Filtrado previo a un LLM: usar el modelo como primera etapa de recuperación (retrieval) en un pipeline RAG que después envíe solo los fragmentos relevantes a un modelo generativo, reduciendo tokens y coste.
- Moderación o enrutado de texto en el edge: clasificar mensajes por similitud con plantillas predefinidas (quejas, solicitudes, consultas) sin exponer el contenido del usuario a un servidor.
- Anonimización por comparación: detectar si un texto libre se parece a patrones sensibles definidos por la organización antes de persistirlo.

## Benchmarks y rendimiento

| Medida | Resultado |
|---|---|
| Coseno con el vector denso del fp32 (medio) | 0,981 |
| Coseno con el vector denso del fp32 (mínimo) | 0,963 |
| Acierto del ítem correcto de la LC 123 entre 138 descripciones (denso + 0,3 × esparso) | 74,6 % en Python; 76,8 % en navegador |
| Tiempo por descripción en Chrome/WebAssembly (i7-10610U) | mediana 223 ms; p95 331 ms |
| Tiempo de carga con el modelo en caché | 2,4 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8G, MTEB) en la información disponible. Las cifras anteriores son medidas de fidelidad y latencia del propio autor, no comparaciones con otros modelos.

## Requisitos de hardware

- Almacenamiento: 389 MB para el modelo ONNX más los ficheros de tokenizador.
- Memoria en tiempo de ejecución: no disponible; el modelo se ejecuta en WebAssembly dentro del navegador, por lo que el consumo depende del runtime y del dispositivo.
- GPU: no requiere GPU dedicada; el autor lo valida en CPU (i7-10610U) mediante WebAssembly. El uso de WebGPU no se documenta.
- Cabe en cualquier equipo de consumo con navegador moderno y suficiente memoria libre; no se especifica el mínimo.
- Despliegue: ONNX Runtime Web (backend wasm) en navegador; en servidor puede usarse onnxruntime con el mismo fichero ONNX.
- Latencia: mediana de 223 ms y p95 de 331 ms por descripción en el hardware citado; carga de 2,4 s con caché.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| isreal01/bge-m3-pt-int8-onnx | no disponible (base 568 M) | no disponible | pt | MIT | ONNX int8 | 389 MB, orientado a navegador, vocabulario podado |
| BAAI/bge-m3 | 568 M | 8192 tokens | multilingüe (100+) | MIT | safetensors, ONNX | 2,27 GB en fp32; referencia de recuperación multi-función |
| newtechstudio/bge-m3-3head | no disponible | no disponible | multilingüe | MIT | ONNX | Exportación de tres salidas usada como punto de partida |
| Modelos de embeddings ligeros tipo MiniLM | ~22-118 M | 512 tokens | multilingüe | variable | safetensors, ONNX | Menores y más rápidos, pero sin salidas sparse/colbert ni contexto largo |

La comparación con MiniLM u otros encoders pequeños es cualitativa: no se dispone de métricas MTEB en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El vocabulario está podado: cualquier carácter fuera del portugués, dígitos y puntuación (ñ, ß, emoji, alfabetos no latinos) se convierte en `<unk>`, lo que degrada la representación de textos con esos caracteres.
- El modelo está pensado exclusivamente para portugués; no debe usarse para otros idiomas pese a que el modelo base sea multilingüe.
- La cuantización int8 introduce una pérdida de fidelidad medible: coseno medio de 0,981 y mínimo de 0,963 frente al fp32.
- Las 138 descripciones de prueba del caso tributario fueron escritas por el autor y, según indica, aún no han sido validadas por un contador; las cifras de acierto no deben tomarse como garantía en producción fiscal.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud: textos distintos pueden quedar próximos en el espacio de embeddings.
- El modelo no genera texto ni razona; no es adecuado para tareas de generación, tool calling ni agentes.
- Licencia MIT: permite uso comercial y modificación, con la obligación habitual de conservar el aviso de copyright y atribución a BAAI y newtechstudio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento continuado.
- La fecha de creación indicada (2026-11-05) es posterior a la consulta; conviene verificar la vigencia del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/isreal01/bge-m3-pt-int8-onnx
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Exportación ONNX de origen: https://huggingface.co/newtechstudio/bge-m3-3head
- Repositorio de la herramienta: https://github.com/Ex-rael/Comparativo-Tributario
- Script de poda: https://github.com/Ex-rael/Comparativo-Tributario/blob/main/scripts/bge-m3-podar.py
- Tokenizador JS: https://cdn.jsdelivr.net/npm/@huggingface/tokenizers@0.2.0/dist/tokenizers.min.mjs
