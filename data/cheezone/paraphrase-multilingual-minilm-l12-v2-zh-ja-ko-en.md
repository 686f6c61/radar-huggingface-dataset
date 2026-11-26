# CheezOne/paraphrase-multilingual-MiniLM-L12-v2-zh-ja-ko-en

## Resumen

`CheezOne/paraphrase-multilingual-MiniLM-L12-v2-zh-ja-ko-en` es una version podada del modelo de embeddings de frases `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. El autor, CheezOne, ha recortado la tabla de vocabulario original de 250.002 piezas a las 64.411 necesarias para cubrir texto en ingles, chino, japones y coreano. Como la mayor parte de los pesos de un modelo MiniLM de este tipo reside precisamente en la matriz de embeddings del vocabulario, la poda reduce el modelo de 118M a 46M de parametros y el fichero safetensors en fp32 de 471 MB a 186 MB.

El problema que resuelve es el sobredimensionamiento en despliegues web y en el navegador: la version original en ONNX int8 ocupa unos 118 MB, mientras que esta variante queda en 47 MB, lo que la hace viable para inferencia en cliente con `transformers.js`. Segun la model card, las salidas para texto en en/zh/ja/ko son practicamente identicas a las del original (coseno 1.00000 en fp32 sobre un conjunto mixto, y 0.991-0.992 de coseno medio para el ONNX int8).

Se trata de un encoder tipo BERT (MiniLM-L12) de 12 capas, no de un modelo generativo: produce embeddings de frase normalizados para busqueda semantica, similitud y clustering. La licencia es Apache 2.0 y el modelo se publico en noviembre de 2026 con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12, 12 capas) |
| Parametros totales | 46.373.376 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base MiniLM suele limitarse a 128-512 tokens; no se especifica en la model card) |
| Tipos de cuantizacion | ONNX int8 (cuantizacion dinamica con onnxruntime); fp32 en safetensors |
| Idiomas soportados | en, zh, ja, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (con variante int8) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`: un encoder MiniLM de 12 capas con pooling medio y embeddings normalizados, pensado para similitud de frases. Este modelo derivado no se ha reentrenado; la unica intervencion es la poda del vocabulario mediante el script `trim_encoder.py`, que selecciona las piezas del tokenizador, remapea los ids en `tokenizer.json` y recorta la matriz de embeddings. El fichero `kept_ids.json` documenta los ids originales conservados.

La seleccion de vocabulario conserva todas las piezas chinas, japonesas (kana) y coreanas, mas todas las piezas inglesas que aparecen en WikiText-103 (palabras vistas 3 o mas veces) o en 1,4 millones de pies de foto cortos, mas toda pieza ASCII de 3 caracteres o menos. El autor verifico que la tokenizacion es identica al original en el 100 % de 360 cadenas de prueba y que las similitudes interlingues (una misma pregunta en cuatro idiomas) coinciden hasta tres decimales. No se documenta ningun proceso de RLHF, DPO ni ajuste adicional en esta variante.

## Capacidades

- Generacion de embeddings de frase normalizados para similitud semantica, busqueda y clustering.
- Soporte multilingue limitado a cuatro idiomas: ingles, chino, japones y coreano.
- Deteccion de parafrasis y similitud interlingue entre esos cuatro idiomas.
- Extraccion de caracteristicas (`feature-extraction`) compatible con la pipeline de `sentence-transformers`.
- Ejecucion en navegador y Node mediante `transformers.js` con pesos ONNX int8.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un encoder, no un modelo causal.

## Casos de uso

- Busqueda semantica en navegador: el modelo ONNX int8 de 47 MB permite calcular embeddings de consultas y documentos directamente en el cliente sin enviar texto a un servidor, adecuado para aplicaciones web de privacidad estricta.
- Deduplicacion de contenido en pipelines CJK: al producir embeddings normalizados, permite agrupar articulos o titulos casi identicos en chino, japones y coreano mediante similitud coseno.
- RAG ligero para corpus en en/zh/ja/ko: sirve como recuperador inicial en sistemas de generacion aumentada, siempre que el corpus no incluya otros alfabetos.
- Clasificacion y clustering de tickets de soporte: los embeddings permiten agrupar incidencias por tematica en entornos multilingues de Asia Oriental.
- Demo interactiva en el navegador: el autor lo emplea en su generador de sprites pixel art (`pixel-art-sprite-generator-demo`) para mapear texto a sprites de 16x16.
- Filtrado previo en pipelines de moderacion: al ser pequeno y rapido, puede actuar como primera etapa de similitud antes de un modelo mayor.
- Sistemas de recomendacion de contenido textual: comparar la similitud entre descripciones y preferencias del usuario en los cuatro idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible; el modelo es un encoder de embeddings y no aplica a ese tipo de evaluaciones. La model card si aporta metricas de fidelidad frente al original:

| Metrica | Resultado |
|---|---|
| Coseno fp32 frente al original (conjunto mixto en/zh/ja/ko) | 1.00000 |
| Tokenizacion identica al original (360 cadenas de prueba) | 100 % |
| Coseno medio ONNX int8 frente a fp32 original | 0.991-0.992 |
| Vocabulario (original vs. este modelo) | 250.002 vs. 64.411 |
| Parametros (original vs. este modelo) | 118M vs. 46M |
| Safetensors fp32 (original vs. este modelo) | 471 MB vs. 186 MB |
| ONNX int8 (original vs. este modelo) | 118 MB vs. 47 MB |

## Requisitos de hardware

- VRAM para fp32: aproximadamente 0,2 GB de pesos, mas activaciones; cabe en cualquier GPU consumer con 2 GB o mas.
- VRAM para ONNX int8: aproximadamente 47 MB de pesos; ejecutable en CPU y en navegador.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1050 en adelante es suficiente.
- Cabe en GPU consumer: si, en practicamente todas, incluida la gama integrada.
- Opciones de despliegue: `sentence-transformers`, `transformers.js` (navegador y Node), ONNX Runtime, Text Embeddings Inference.
- Latencia y throughput: no disponible; no se publican mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (CheezOne) | 46M | en, zh, ja, ko | no disponible | Apache 2.0 | safetensors, ONNX int8 |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | 118M | multilingue (amplio) | no disponible | Apache 2.0 | safetensors, ONNX |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22M | principalmente ingles | no disponible | Apache 2.0 | safetensors, ONNX |

Frente al original, este modelo es aproximadamente un 61 % mas pequeno en parametros y un 60 % mas pequeno en el fichero ONNX int8, a costa de perder cobertura de alfabetos no incluidos (cirilico, arabe, thai, devanagari, etc.). Frente a `all-MiniLM-L6-v2`, ofrece cobertura multilingue CJK con un tamano intermedio. No se dispone de datos de rendimiento comparativo en benchmarks estandar para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El texto en alfabetos distintos de latin, chino, japones y coreano se mapea a `<unk>`; para esos idiomas debe usarse el modelo original.
- La cobertura del ingles se limita a las piezas presentes en WikiText-103, en pies de foto y a piezas ASCII de 3 caracteres o menos; palabras inglesas raras o fuera de ese corpus podrian tokenizarse de forma distinta al original.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no razona y no soporta tool calling.
- No se han publicado evaluaciones de sesgo ni de robustez para esta variante; hereda los sesgos del corpus de entrenamiento del modelo base.
- El riesgo de alucinacion no aplica directamente al no generar texto, pero los embeddings pueden producir similitudes enganosas en dominios muy especializados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion por terceros.
- No se especifica la longitud maxima de contexto en la model card; debe consultarse la del modelo base antes de usarlo con secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CheezOne/paraphrase-multilingual-MiniLM-L12-v2-zh-ja-ko-en
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Demo del generador de sprites pixel art: https://huggingface.co/spaces/CheezOne/pixel-art-sprite-generator-demo
- Modelo de sprites: https://huggingface.co/CheezOne/pixel-art-sprite-generator-16x16
- Reranker CJK: https://huggingface.co/CheezOne/reranker-chinese-japanese-korean-multilingual-small
- Detector de PII: https://huggingface.co/CheezOne/pii-detector-chinese-japanese-korean-english
- Detector de prompt injection: https://huggingface.co/CheezOne/prompt-injection-jailbreak-detector-chinese-japanese-korean-english
