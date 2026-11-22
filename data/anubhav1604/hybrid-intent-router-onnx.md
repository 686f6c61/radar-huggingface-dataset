# Anubhav1604/hybrid-intent-router-onnx

## Resumen

Hybrid Intent Router (versión ONNX) es un clasificador de intenciones derivado de google/muril-base-cased, desarrollado por Anubhav1604 como componente de enrutamiento de un sistema mayor disponible en GitHub. El modelo añade una cabeza lineal sobre las 60 intenciones del dataset Amazon MASSIVE y se ha ajustado únicamente con datos en inglés, empleándose en modo zero-shot para hindi y kannada. Su propósito es asignar cada mensaje de usuario a una de las 60 intenciones con latencia y huella de memoria mínimas.

La contribución principal no es arquitectónica sino de compresión: el autor reduce el vocabulario de 197.258 a 90.022 tokens (solo latinos, devanagari y kannada), cuantiza la tabla de embeddings a int8 con una escala por fila y aplica cuantización de pesos en bloques de 32 mediante `MatMulNBits` de ONNX. El resultado pasa de 950,5 MB a 167,6 MB, con unos 313 MB de memoria en carga y aproximadamente 26 ms por mensaje en un único hilo de CPU, sin dependencia de PyTorch.

Es relevante para despliegues de enrutamiento de intenciones en entornos con recursos muy limitados (servidores gratuitos de 512 MB), donde un transformer completo no cabría. La fidelidad respecto al modelo original es alta: misma respuesta en el 98,2%-100% de los subconjuntos de evaluación y diferencias de menos de 0,2 puntos en los test sets completos de MASSIVE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MuRIL-base) con cabeza lineal de clasificación sobre 60 intenciones |
| Parametros totales | no disponible (el modelo base MuRIL-base tiene 236 M; el artefacto ONNX pesa 167,6 MB tras cuantización) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | truncar a 64 tokens (recomendación del autor) |
| Tipos de cuantizacion | Embeddings int8 con escala por fila; capas Linear con pesos de 8 bits en bloques de 32 (`MatMulNBits`), aritmética int8 |
| Idiomas soportados | en, hi, kn |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`), más `tokenizer.json` y `meta.json` |

## Arquitectura y entrenamiento

El modelo parte de google/muril-base-cased, un encoder transformer BERT-like preentrenado específicamente para lenguas indias, al que se añade una cabeza lineal que produce logits sobre las 60 intenciones de Amazon MASSIVE. El ajuste fino se realizó exclusivamente sobre datos en inglés de MASSIVE 1.1 (CC BY 4.0); el rendimiento en hindi y kannada proviene por tanto de transferencia zero-shot a través de las representaciones multilingües de MuRIL, no de entrenamiento supervisado en esos idiomas.

La innovación técnica está en el pipeline de compresión (`scripts/quantize.py` del repositorio): poda del vocabulario conservando solo tokens latinos, devanagari y kannada (90.022 de 197.258), verificado sobre las 49.563 frases en/hi/kn de MASSIVE para garantizar que la tokenización no cambia; cuantización int8 de la tabla de embeddings con una escala por fila; y cuantización de todas las capas lineales con `MatMulNBits` en bloques de 32. El artefacto resultante se ejecuta con onnxruntime sin PyTorch. La confianza calibrada del router se obtiene aplicando softmax(logits / 1.342).

## Capacidades

- Clasificación de intenciones de texto en 60 clases (taxonomía de Amazon MASSIVE).
- Clasificación multilingüe zero-shot en inglés, hindi y kannada desde un único modelo ajustado en inglés.
- Inferencia en CPU pura mediante onnxruntime, sin PyTorch ni GPU.
- Confianza calibrada por temperatura (T = 1.342) apta para umbrales de enrutamiento y fallback.
- Tokenizador podado que preserva exactamente la tokenización original para los tres idiomas cubiertos.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: cada mensaje se clasifica en una de las 60 intenciones y se deriva al handler o subagente correspondiente; los 26 ms por mensaje en un hilo de CPU permiten hacerlo en línea sin afectar la latencia percibida.
- Despliegue en servidores de bajo coste: con 313 MB de memoria en carga cabe en instancias gratuitas de 512 MB, lo que permite montar un router de intenciones sin GPU ni instancias pagas.
- Sistemas multilingües para India: un solo artefacto cubre inglés, hindi y kannada, útil para productos con base de usuarios en esos mercados sin mantener tres modelos separados.
- Prefiltrado y triaje antes de un LLM grande: clasificar la intención con este modelo y reservar el modelo generativo solo para las peticiones que lo requieran, reduciendo coste por consulta.
- Enrutamiento en el edge o en dispositivos: al no depender de PyTorch ni de GPU, puede integrarse en servicios ligeros o contenedores mínimos con onnxruntime.
- Segmentación de conversaciones para analítica: etiquetar grandes volúmenes de mensajes históricos por intención para construir dashboards y detectar patrones de uso, gracias al bajo coste por inferencia.
- Control de calidad con umbral de confianza: usar la probabilidad calibrada para derivar a revisión humana o a un fallback genérico los mensajes con baja confianza, especialmente en hindi y kannada.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre los test sets completos de MASSIVE, comparando la versión ONNX cuantizada con el modelo original:

| Idioma | ONNX cuantizado | Modelo original |
|---|---|---|
| Inglés (en) | 88,2 % | 88,1 % |
| Hindi (hi) | 77,7 % | 77,9 % |
| Kannada (kn) | 70,7 % | 70,7 % |

El autor indica además coincidencia de respuesta con el original entre el 98,2 % y el 100 % de los subconjuntos de evaluación. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, algo esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- Memoria en carga e inferencia: aproximadamente 313 MB según el autor.
- Tamaño del artefacto: 167,6 MB (`model.onnx`), frente a 950,5 MB del modelo original.
- GPU: no necesaria; el modelo está diseñado para CPU con onnxruntime.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en CPU de servidores básicos.
- Despliegue: onnxruntime (requisito del artefacto); no se distribuyen pesos en safetensors, GGUF ni formatos para vLLM, llama.cpp, Ollama o TGI.
- Latencia: aproximadamente 26 ms por mensaje en un único hilo de CPU, según el autor.
- Throughput: no disponible de forma explícita; a partir de la latencia indicada se sitúa en torno a 38 mensajes por segundo por hilo, sin datos oficiales de escalado multihilo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Hybrid Intent Router ONNX (este) | no disponible (base MuRIL-base, 236 M) | 64 tokens (truncado) | en, hi, kn | Apache-2.0 | ONNX, onnxruntime en CPU |
| google/muril-base-cased | 236 M | 512 tokens (BERT estándar) | multilingüe (lenguas indias) | Apache-2.0 | safetensors / PyTorch |
| Modelo original del Hybrid Intent Router (MuRIL-base + cabeza) | 236 M | 64 tokens (según uso del router) | en, hi, kn | Apache-2.0 | PyTorch, 950,5 MB |

La comparación con alternativas de la misma categoría (clasificadores de intención sobre MASSIVE) no está disponible en la información proporcionada. Frente a su modelo de origen, la versión ONNX ofrece un 82 % menos de tamaño y ejecución sin PyTorch a cambio de una pérdida máxima de 0,2 puntos de exactitud.

## Limitaciones y advertencias

- El ajuste fino se hizo solo en inglés; el rendimiento en hindi (77,7 %) y kannada (70,7 %) es notablemente inferior al inglés (88,2 %) y depende de la transferencia zero-shot de MuRIL.
- La poda de vocabulario limita el soporte a texto latino, devanagari y kannada; otros alfabetos no están cubiertos y no se garantiza su tokenización.
- El truncado a 64 tokens implica que mensajes largos pierden información; intenciones expresadas al final de un texto extenso pueden clasificarse mal.
- Riesgo de confusión entre intenciones próximas dentro de las 60 clases de MASSIVE; la confianza calibrada debe usarse con umbral para derivar a fallback.
- Es un clasificador cerrado de 60 etiquetas: no generaliza a intenciones fuera de la taxonomía de MASSIVE sin reentrenamiento de la cabeza.
- Sin datos publicados sobre sesgos por género, dialecto o registro más allá de las métricas agregadas por idioma.
- Licencia Apache-2.0 permite uso comercial; el dataset MASSIVE es CC BY 4.0 y el modelo base MuRIL-base es Apache-2.0, por lo que conviene conservar las atribuciones correspondientes.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de las cifras reportadas por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Anubhav1604/hybrid-intent-router-onnx
- Repositorio del proyecto: https://github.com/Anubhavkumarkanth/hybrid-intent-router
- Modelo base: https://huggingface.co/google/muril-base-cased
- Dataset: https://huggingface.co/datasets/AmazonScience/massive
