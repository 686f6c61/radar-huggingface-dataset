# masahiroid/japanese-reranker-xsmall-v2-onnx-web

## Resumen

`japanese-reranker-xsmall-v2-onnx-web` es una exportación no oficial a ONNX del cross-encoder japonés `hotchpotch/japanese-reranker-xsmall-v2`, preparada por el usuario `masahiroid` para funcionar con transformers.js y ONNX Runtime Web. Su propósito es permitir el reordenamiento (reranking) de resultados de búsqueda o recuperación documental directamente en el navegador, sin enviar datos a un servidor, aprovechando WebGPU o WASM según el dispositivo del usuario.

El modelo resuelve un problema concreto: los rerankers de tipo cross-encoder suelen requerir infraestructura de servidor con GPU, lo que añade latencia y coste, además de implicaciones de privacidad cuando se procesan consultas sensibles. Esta exportación ofrece tres variantes de pesos (fp32, fp16 e int8) con tamaños de 147 MB, 74 MB y 37 MB respectivamente, lo que permite desplegarlo en entornos web con recursos limitados.

La relevancia actual del modelo radica en la combinación de un reranker especializado en japonés con un formato de despliegue orientado al cliente (transformers.js), algo poco habitual en el ecosistema de modelos japoneses. Está publicado bajo licencia MIT y deriva del modelo base de `hotchpotch`, cuyos detalles de arquitectura y entrenamiento no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (según tags del repo; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 dinámica |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`, `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de clasificación de texto: recibe un par de secuencias (consulta y documento) y produce un único logit por par, al que se aplica una sigmoid para obtener una puntuación de relevancia entre 0 y 1. Los tags del repositorio indican que la arquitectura subyacente es ModernBERT, aunque no se especifican el número de capas, la dimensión oculta ni el número de parámetros. El modelo base es `hotchpotch/japanese-reranker-xsmall-v2`, del que no se detallan en la información proporcionada los datos de entrenamiento, el volumen de tokens, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO.

La contribución técnica de esta exportación es la conversión a ONNX con soporte de batch y longitud de secuencia dinámicos, entradas `input_ids` y `attention_mask` en int64 y salida `logits` con forma `[batch, 1]`. El autor verificó los pesos contra PyTorch usando ONNX Runtime en CPU con pares de distinta longitud: la variante fp32 presenta una diferencia máxima de logit de 2e-6, la fp16 de hasta 2e-3 y la int8 de hasta aproximadamente 0,4. Esta última diferencia es notablemente mayor, y el propio autor advierte que debe comprobarse la calidad del ranking antes de usar el fichero int8 en producción.

## Capacidades

- Clasificación de pares texto-texto para reranking: asigna una puntuación de relevancia a cada par consulta-documento.
- Puntuación de similitud semántica en japonés mediante cross-encoder, más precisa que un bi-encoder para reordenar un conjunto reducido de candidatos.
- Ejecución en navegador mediante transformers.js con backend WebGPU (recomendado con fp16) o WASM/CPU (recomendado con int8).
- Procesamiento por lotes con longitud de secuencia dinámica, lo que permite puntuar varios documentos en una sola llamada.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de clasificación.
- Capacidad multilingüe limitada al japonés según la etiqueta de idioma del repositorio.

## Casos de uso

- Búsqueda semántica en aplicaciones web en japonés: el modelo reordena los documentos recuperados por un bi-encoder y se ejecuta en el cliente con WebGPU, de modo que la consulta del usuario no abandona el navegador.
- Asistentes de documentación técnica en japonés: integrado en un pipeline RAG del lado del cliente, filtra y ordena los fragmentos recuperados antes de enviarlos a un modelo generador, mejorando la precisión de las respuestas.
- Sistemas de preguntas y respuestas sobre bases de conocimiento internas: al ejecutarse localmente, permite procesar consultas sobre documentación confidencial sin exponerla a servicios externos.
- Filtrado de resultados en motores de búsqueda de sitios corporativos japoneses: puntúa pares consulta-página para priorizar los resultados más relevantes en la primera página.
- Moderación o duplicados en foros y comunidades: compara pares de mensajes para detectar contenido duplicado o responder si un mensaje es relevante respecto a una consulta dada.
- Aplicaciones educativas o de estudio de idiomas: evalúa la relevancia de respuestas de alumnos frente a preguntas de referencia en japonés, con retroalimentación inmediata en el navegador.
- Demostraciones interactivas y prototipos: la demo Ruri Atlas muestra cómo explorar embeddings y visualizar el efecto del reranker en un mapa 3D, útil para evaluar el modelo antes de integrarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente documenta las diferencias de logits frente a la implementación en PyTorch: 2e-6 para fp32, hasta 2e-3 para fp16 y hasta aproximadamente 0,4 para int8.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional, ya que el modelo está pensado para ejecutarse en el navegador. Como referencia de tamaño de pesos: 147 MB (fp32), 74 MB (fp16) y 37 MB (int8).
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU para la variante fp16; para la variante int8 basta con CPU mediante WASM.
- Cabe en GPU de consumo: sí, al tratarse de un modelo xsmall con pesos de decenas de megabytes; cualquier GPU de consumo reciente con WebGPU puede ejecutarlo.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (WebGPU o WASM); también es posible usar ONNX Runtime en servidor, aunque el formato está optimizado para el navegador.
- Latencia y throughput: no disponibles. Dependen del dispositivo, del backend (WebGPU frente a WASM) y del tamaño del lote; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|---|
| masahiroid/japanese-reranker-xsmall-v2-onnx-web | no disponible | no disponible | ja | MIT | ONNX (fp32/fp16/int8) | Navegador (transformers.js) |
| hotchpotch/japanese-reranker-xsmall-v2 | no disponible | no disponible | ja | MIT (según modelo derivado) | safetensors (PyTorch) | Servidor (PyTorch) |
| Rerankers multilingües tipo bge-reranker | no disponible | no disponible | multilingüe | variable | safetensors, ONNX | Servidor y navegador |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato y el entorno de ejecución: esta exportación prioriza el despliegue en navegador, mientras que el original está pensado para PyTorch en servidor.

## Limitaciones y advertencias

- Es una exportación no oficial: la autoría del modelo original corresponde a `hotchpotch`, y cualquier problema de calidad debe contrastarse con el modelo base.
- La variante int8 presenta diferencias de logits de hasta aproximadamente 0,4 frente a PyTorch, muy superiores a las de fp16; el autor recomienda verificar la calidad del ranking antes de usarla.
- Solo soporta japonés; su uso con otros idiomas no está validado.
- No se dispone de información sobre sesgos, datos de entrenamiento ni evaluación de robustez del modelo base.
- Riesgo de alucinación no aplicable en sentido estricto al ser un clasificador, pero sí existe riesgo de puntuaciones de relevancia erróneas en pares ambiguos o dominios no cubiertos por el entrenamiento.
- Aunque la licencia es MIT, conviene revisar las condiciones del modelo base y de los datos con los que fue entrenado antes de un uso comercial.
- El rendimiento en navegador depende de la disponibilidad de WebGPU; en dispositivos sin soporte se recurre a WASM con la variante int8, con menor fidelidad numérica.
- No se especifican la longitud máxima de contexto ni el comportamiento con secuencias largas, lo que puede afectar al truncamiento en documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/japanese-reranker-xsmall-v2-onnx-web
- Modelo base: https://huggingface.co/hotchpotch/japanese-reranker-xsmall-v2
- Demo Ruri Atlas: https://huggingface.co/spaces/masahiroid/ruri-atlas
- transformers.js: https://github.com/huggingface/transformers.js
- Herramienta de auditoría model-audit-lite: https://github.com/masahiroid/model-audit-lite
