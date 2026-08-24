# mlboydaisuke/bge-reranker-base-ExecuTorch

## Resumen

`mlboydaisuke/bge-reranker-base-ExecuTorch` es un port del cross-encoder de re-ranking BAAI/bge-reranker-base al runtime ExecuTorch de PyTorch, optimizado para inferencia on-device mediante el backend XNNPACK. El modelo original, desarrollado por BAAI, es un cross-encoder basado en XLM-RoBERTa con 278 millones de parametros, 12 capas, dimension oculta de 768 y un vocabulario de 250k tokens que le permite operar de forma multilingue. Se utiliza como segunda etapa de un pipeline de recuperacion: un modelo de embeddings recupera candidatos baratos y este re-ranker lee cada candidato junto con la consulta para producir una puntuacion de relevancia precisa.

El portaje se distribuye en tres variantes compiladas a formato `.pte` de ExecuTorch: fp32, fp16 y una variante Core ML para iOS. La variante fp32 reproduce los logits del modelo eager sin error medible, mientras que las variantes fp16 introducen un error maximo de 0.0458 logits, sin alterar el orden de ranking en las pruebas publicadas. Este modelo es relevante porque permite ejecutar re-ranking de calidad en dispositivos sin conexion, con latencias de 19.7 ms en Mac arm64 con Core ML, frente a los 54.7 ms del eager en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (12 capas, hidden 768, 250k vocabulario) |
| Parametros totales | 278 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (entrada `[1, 512]` int64) |
| Tipos de cuantizacion | fp32, fp16, Core ML fp16 (int8 dinamico evaluado pero no distribuido) |
| Idiomas soportados | Multilingue (demostrado con ingles, japones; vocabulario de 250k tokens) |
| Licencia | MIT |
| Formato de pesos | `.pte` (ExecuTorch, con backend XNNPACK) |

## Arquitectura y entrenamiento

El modelo base BAAI/bge-reranker-base es un cross-encoder de la familia XLM-RoBERTa: recibe la concatenacion de query y documento, y produce un unico logit de relevancia. A diferencia de los modelos de embedding que codifican query y documento por separado, el cross-encoder permite interaccion completa entre ambos textos, lo que mejora la precision del ranking a costa de un mayor coste computacional por par. El modelo fue entrenado por BAAI con datos de recuperacion multilingue, lo que le permite puntuar pares query-documento en idiomas distintos (por ejemplo, una query en ingles con un documento en japones).

El portaje ExecuTorch exporta el modelo a archivos `.pte` compilados con el backend XNNPACK. Se evaluaron tres configuraciones: fp32 con error de logits de 0.0000 frente a eager, fp16 con error de 0.0185, y Core ML fp16 con error de 0.0458. La variante int8 dinamica fue descartada porque, al cuantizar solo los pesos lineales y mantener la tabla de embeddings en fp32, el archivo resultante (856.1 MB) era mayor que el fp16 (556.4 MB) y con un error de 0.5776 logits, muy superior. El autor incluye scripts de conversion y verificacion en el repositorio `executorch-models`.

## Capacidades

- Re-ranking de pares query-documento: toma una query y un documento, devuelve un logit de relevancia que ordena correctamente los candidatos.
- Multilingue: el vocabulario de 250k tokens de XLM-RoBERTa permite puntuar documentos en idiomas distintos a la query (ejemplo publicado: query inglesa, documento japones rankeado primero).
- Inferencia on-device: compilado para ExecuTorch con backend XNNPACK, ejecutable en Mac, iOS y dispositivos ARM.
- Salida interpretable: el logit crudo puede mapearse a probabilidad 0..1 mediante sigmoid sin alterar el orden de ranking.
- Compatible con pipelines de recuperacion en dos etapas: el modelo de embedding recupera candidatos y el reranker refina el top-k.
- Verificacion integrada: incluye scripts de conversion y comprobacion que validan la concordancia con eager y la utilidad del ranking (el documento que responde debe superar a un documento del mismo tema que no responde).

## Casos de uso

- Busqueda local en aplicaciones moviles: un modelo de embedding recupera 100 candidatos de una base local y este reranker refina el top-3 para mostrar los resultados mas relevantes, sin necesidad de conexion a internet.
- Asistente personal de documentacion tecnica: dado un manual corporativo, el reranker puntua los pasajes candidatos frente a la pregunta del usuario y devuelve el pasaje mas util, incluso si el manual esta en otro idioma que la pregunta.
- Sistema de FAQ multilingue: un cliente formula una pregunta en ingles y el reranker selecciona la respuesta correcta de una base de FAQ en japones, aleman o frances, gracias a su vocabulario multilingue de 250k tokens.
- Filtrado de resultados de busqueda en motores de recomendacion: tras una primera fase de recuperacion barata, el reranker descarta documentos irrelevantes que compartan tema con la query pero no respondan a ella (el ejemplo del card: un pasaje sobre museos de Berlin puntuado -6.198 frente a +10.308 del que responde).
- Re-ranking en entornos con privacidad estricta: al ejecutarse en el dispositivo, los datos de consulta y documentos no salen del terminal, lo que cumple con requisitos de GDPR o datos sanitarios.
- Pruebas de rendimiento en CI/CD: los scripts de verificacion (`convert/export_rerank.py` y `convert/check_rerank.py`) permiten validar automaticamente que una compilacion del modelo mantiene el orden de ranking esperado antes de desplegarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo de re-ranking y no de generacion o razonamiento general. Los datos de rendimiento publicados en la model card son los siguientes:

| Variante | Tamano (MB) | Error maximo de logits vs eager | Latencia Mac arm64 (ms, mediana de 10) |
|---|---|---|---|
| fp32 (XNNPACK) | 1112.4 | 0.0000 | 76.9 |
| fp16 (XNNPACK) | 556.4 | 0.0185 | 169.4 |
| Core ML fp16 (iOS) | 556.6 | 0.0458 | 19.7 |
| PyTorch eager fp32 (referencia) | — | — | 54.7 |

Las tres variantes reproducen exactamente el orden de ranking del eager sobre 6 pares query-documento reales. La latencia es un punto de referencia relativo en Mac arm64, no un numero de dispositivo final. La variante int8 dinamica fue evaluada pero descartada: 856.1 MB, error de 0.5776 logits y un orden de ranking no garantizado.

## Requisitos de hardware

- El modelo esta disenado para inferencia on-device: se ejecuta en Mac arm64 (Apple Silicon), iOS (Core ML) y dispositivos que soporten XNNPACK.
- VRAM estimada: para la variante fp32, el archivo pesa 1.1 GB, por lo que se recomienda un dispositivo con al menos 2 GB de memoria unificada disponible. La variante fp16 requiere unos 556 MB de memoria, adecuado para moviles de gama media-alta.
- GPU recomendadas: no requiere GPU dedicada; el backend XNNPACK usa CPU y NPU. En Mac arm64, la variante Core ML es la mas rapida (19.7 ms) gracias a la aceleracion de Apple.
- Opciones de despliegue: los archivos `.pte` se ejecutan con el runtime ExecuTorch de PyTorch; no es compatible con vLLM, llama.cpp ni Ollama, ya que no es un LLM generativo sino un modelo de clasificacion de texto.
- Latencia: en Mac arm64, 76.9 ms (fp32), 169.4 ms (fp16) y 19.7 ms (Core ML) por par query-documento de 512 tokens; en un dispositivo movil la latencia sera diferente y no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|
| bge-reranker-base-ExecuTorch | 278M | 512 tokens | Multilingue | `.pte` (ExecuTorch) | MIT |
| BAAI/bge-reranker-base (original) | 278M | 512 tokens | Multilingue | safetensors | MIT |
| BAAI/bge-reranker-large | 560M aprox. | 512 tokens | Multilingue | safetensors | MIT |
| ms-marco-MiniLM-L6 (mencionado en el card) | ~22M | 512 tokens | Solo ingles | safetensors | MIT |

El modelo se compara directamente con su origen BAAI/bge-reranker-base: la version ExecuTorch no cambia el comportamiento del modelo, solo el formato de ejecucion. Frente a ms-marco-MiniLM-L6, el modelo de BAAI ofrece capacidades multilingues (el ejemplo del card muestra que MiniLM puntua el pasaje japones con -10.96 y lo coloca en quinta posicion, mientras que bge-reranker-base lo coloca primero con +10.308), a costa de un tamano 12 veces mayor.

## Limitaciones y advertencias

- El modelo es un reranker, no un generador: no produce texto, solo una puntuacion de relevancia. No debe usarse para tareas de generacion o chat.
- Ventana de contexto limitada a 512 tokens por par query-documento; pares mas largos requieren truncamiento, lo que puede degradar la calidad del ranking.
- La variante fp16 (XNNPACK) es mas lenta que la fp32 (169.4 ms vs 76.9 ms) a pesar de ser mas ligera; la Core ML es la unica que ofrece una ventaja de latencia clara sobre eager.
- La variante int8 no se distribuye porque es mas pesada que fp16 y con un error de 0.5776 logits, que puede alterar el orden de ranking en casos marginales (brechas de menos de 0.01 logits).
- La documentacion no incluye datos de sesgos, alucinaciones ni evaluaciones de calidad de ranking en datasets estandar (MS MARCO, BEIR). Los datos de verificacion se limitan a 6 pares query-documento.
- No se ha publicado informacion sobre el proceso de entrenamiento del modelo original (datasets, numero de tokens, uso de RLHF o DPO); la ficha se basa en la model card del portaje y la documentacion publica de BAAI.
- Licencia MIT: permite uso comercial sin restricciones, pero se recomienda revisar los terminos de los datos de entrenamiento del modelo original si se despliega en produccion con datos sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/bge-reranker-base-ExecuTorch
- Modelo base original: https://huggingface.co/BAAI/bge-reranker-base
- Documentacion BGE-Reranker: https://bge-model.com/bge/bge_reranker.html
- Documentacion API de Reranker: https://bge-model.com/API/inference/reranker/reranker.html
- Repo de conversion: https://github.com/john-rocky/executor-models
