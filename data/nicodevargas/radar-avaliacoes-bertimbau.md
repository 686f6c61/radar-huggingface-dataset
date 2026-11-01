# NicoDeVargas/radar-avaliacoes-bertimbau

## Resumen

`radar-avaliacoes-bertimbau` es un clasificador de texto en portugués de Brasil especializado en reseñas de clientes de comercio electrónico. Lo desarrolla NicoDeVargas y su función es leer una reseña y devolver la categoría del problema principal (retraso, no recibido, defecto, divergente, atención, calidad o elogio), de modo que el vendedor sepa qué acción tomar. Es el modelo que alimenta la aplicación web "Radar de avaliações", que se ejecuta íntegramente en el navegador mediante transformers.js.

Arquitectura BERT base con 108.928.519 parámetros totales, derivada de `neuralmind/bert-base-portuguese-cased` (BERTimbau base). El contexto de entrada es de 128 tokens: en el entrenamiento se truncaron las reseñas más largas. La entrada esperada es la concatenación del título y el cuerpo de la reseña separados por ". ".

Su interés práctico reside en el coste y el despliegue: se distribuye en ONNX int8 de 110 MB y fp32 de 436 MB, con licencia MIT, y ofrece clasificación local sin coste por inferencia y con latencia de milisegundos en CPU. Los rótulos de entrenamiento se generaron por destilación desde Claude Opus 5.5 aplicando una regla de desempate explícita, no mediante anotación humana directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (BERTimbau) |
| Parametros totales | 108.928.519 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en entrenamiento) |
| Tipos de cuantizacion | int8 dinámico (ONNX), fp32 (ONNX y PyTorch); el autor menciona q8 en transformers.js |
| Idiomas soportados | portugués (pt), orientado a portugués de Brasil |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch fp32), ONNX (`model.onnx` fp32 y `model_quantized.onnx` int8) |
| Tarea | clasificación de texto multietiqueta (7 categorías, una por reseña) |
| Dataset de entrenamiento | ruanchaves/b2w-reviews01 (4.700 reseñas) |
| Modelo base | neuralmind/bert-base-portuguese-cased |
| Tamaño del repositorio | 1,0 GB |
| Calibración | temperatura T = 1,45 embebida en la capa de clasificación |

## Arquitectura y entrenamiento

Es un encoder BERT base estándar (12 capas, atención bidireccional completa) con una cabeza de clasificación sobre el token `[CLS]` para siete clases. No hay innovaciones arquitectónicas: el valor está en el ajuste fino y en el pipeline de etiquetado. La entrada es título + ". " + texto de la reseña, truncada a 128 tokens.

Los datos proceden de B2W-Reviews01 (reseñas de Americanas, licencia CC BY 4.0), con una muestra de 4.700 reseñas sesgada hacia valoraciones negativas: 4.400 para entrenamiento y 300 para validación y calibración. Los rótulos no son humanos: se obtuvieron por destilación desde Claude Opus 5.5 con una regla de desempate documentada (por ejemplo, "defecto" solo si llegó roto; si se rompió con el uso es "calidad"; si no llegó es "no recibido" aunque el cliente hable de retraso; con varios problemas, prevalece el del título). El etiquetado se hizo en lotes de 25 reseñas por llamada mediante la Message Batches API, con un coste total de 2,82 USD.

El entrenamiento consistió en 3 épocas, learning rate 3e-5, tamaño de lote 16, máximo 128 tokens y optimizador AdamW, ejecutado en CPU (un portátil de 12 núcleos) en unos 30 minutos. La temperatura de calibración (T = 1,45, ajustada sobre validación) está incorporada en la capa de clasificación, por lo que el softmax de salida es directamente la confianza calibrada.

## Capacidades

- Clasificación de reseñas de comercio electrónico en portugués de Brasil en siete categorías: `atraso`, `nao_recebido`, `defeito`, `divergente`, `atendimento`, `qualidade` y `elogio`.
- Salida de una única categoría por reseña (la del problema principal), con puntuación de confianza calibrada.
- Inferencia en el navegador mediante transformers.js (WASM) sin servidor ni GPU.
- Inferencia en Python con la librería `transformers` (pipeline de `text-classification`).
- Ejecución en CPU con latencias de milisegundos en formato int8.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al portugués; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Triaje automático de reseñas en marketplaces: clasificar cada nueva reseña entrante y enrutarla al equipo adecuado (logística para `atraso` y `nao_recebido`, producto para `defeito` y `divergente`, atención al cliente para `atendimento`), con la ventaja de que el modelo cabe en 110 MB y puede ejecutarse en el propio backend sin coste por llamada.
- Panel de calidad en el navegador para vendedores: la aplicación "Radar de avaliações" clasifica reseñas localmente con transformers.js, de modo que los datos del cliente no salen del dispositivo y no hay dependencia de una API de terceros.
- Detección temprana de problemas logísticos: agrupar reseñas clasificadas como `nao_recebido` o `atraso` para identificar pedidos con incidencias de entrega antes de que escalen a reclamaciones formales.
- Análisis de percepción de producto: separar `qualidade` (decepción o durabilidad baja) de `defeito` (llegó roto) permite distinguir problemas de fabricación de problemas de expectativas generadas por el anuncio.
- Filtrado previo a la atención al cliente: usar la clasificación para priorizar las reseñas que mencionan SAC, devoluciones o reembolsos, con la advertencia de que `atendimento` tiene recall bajo y no debe ser el único filtro.
- Monitorización de satisfacción: contar la proporción de `elogio` frente al resto para seguir tendencias por producto o vendedor, con F1 0,97 en esa clase.
- Etiquetado de bajo coste para datasets propios: usar el modelo como anotador débil en corpus de reseñas en portugués, con revisión humana en las clases frágiles (`atendimento`, `atraso`).

## Benchmarks y rendimiento

Evaluación sobre un conjunto de 189 reseñas anotadas a mano por una sola persona, sin ver la nota ni la salida de ningún modelo, nunca usado en entrenamiento ni en selección (`gab_teste`). Latencia medida con una reseña por vez en CPU de portátil.

| Modelo | Acierto | F1 macro | ECE | Latencia | USD / 1 mil |
|---|---|---|---|---|---|
| Este modelo, ONNX int8 | 87,3% | 0,76 | 0,03 | 8 ms | 0 |
| Este modelo, ONNX int8 en navegador (transformers.js, WASM, 1 hilo) | 87,3% | 0,76 | 0,04 | 155 ms | 0 |
| Este modelo, fp32 (PyTorch) | 85,7% | 0,70 | 0,05 | 42 ms | 0 |
| Claude Opus 5.5 + regla, lotes de 25 (profesor) | 87,3% | 0,79 | no disponible | no disponible | 1,29 (0,60 en batch) |
| Claude Opus 5.5 + regla, una llamada por reseña | 86,8% | 0,78 | 0,13 | 1,8 s | 6,94 |
| Claude Haiku 5.5 + regla | 83,1% | 0,78 | 0,17 | 1,1 s | 0,16 |
| BERTimbau con rótulos de Haiku sin regla | 73,0% | 0,60 | 0,20 | 64 ms | 0 |
| TF-IDF + regresión logística | 69,8% | 0,56 | 0,06 | 0,6 ms | 0 |

F1 por categoría (int8): `elogio` 0,97, `nao_recebido` 0,94, `qualidade` 0,80, `divergente` 0,71, `defeito` 0,67, `atendimento` 0,25 (acertó 1 de 7), `atraso` 1,00 (solo 2 ejemplos). El intervalo de confianza del 95% para el acierto es de aproximadamente ±5 puntos con 189 ejemplos. El int8 superó al fp32 en 3 aciertos (9 predicciones cambiaron), lo que el autor atribuye a ruido y no a un beneficio de la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el formato principal; el modelo está pensado para CPU. En GPU, el fp32 ocupa aproximadamente 436 MB de pesos y el int8 unos 110 MB.
- GPU recomendadas: no se documentan; cualquier GPU con más de 1 GB de memoria puede alojar el modelo. No requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en CPU de portátil: el entrenamiento se completó en 30 minutos en un portátil de 12 núcleos.
- Opciones de despliegue: transformers.js en navegador (WASM), ONNX Runtime en Python, `transformers` en PyTorch (fp32), y conversión a GGUF no documentada por el autor. vLLM y TGI no son opciones habituales para un encoder de clasificación de este tamaño.
- Latencia: 8 ms por reseña con ONNX int8 en CPU de portátil, 42 ms en fp32 con PyTorch, 155 ms en navegador con WASM y un solo hilo. Throughput no documentado; el autor advierte que la cuantización dinámica calcula la escala de activaciones sobre el lote completo, por lo que el procesamiento por lotes con padding altera algunas predicciones y conviene clasificar una reseña por vez para replicar los resultados publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| radar-avaliacoes-bertimbau | 108,9 M | 128 tokens | Clasificación de reseñas pt-BR en 7 clases | MIT | HuggingFace, ONNX + safetensors |
| neuralmind/bert-base-portuguese-cased | 110 M aprox. | 512 tokens | Modelo base de representaciones pt-BR | MIT | HuggingFace |
| TF-IDF + regresión logística (referencia del autor) | no aplica | no aplica | Clasificación de reseñas | no disponible | Pipeline propio del autor |
| Claude Opus 5.5 con la misma regla (profesor) | no disponible | no disponible | Clasificación de reseñas vía prompting | propietaria | API de Anthropic |

Frente al modelo base, este añade la cabeza de clasificación ajustada y el pipeline de etiquetado por destilación; frente a la referencia TF-IDF, mejora el acierto de 69,8% a 87,3% y el F1 macro de 0,56 a 0,76, a costa de 8 ms por reseña frente a 0,6 ms. Frente al profesor LLM, iguala el acierto (87,3%) con F1 macro ligeramente inferior (0,76 frente a 0,79) y un ECE mucho mejor (0,03 frente a 0,13 en llamada individual), con coste por inferencia nulo.

## Limitaciones y advertencias

- Conjunto de evaluación pequeño (189 reseñas) y un único anotador; el intervalo de confianza del acierto es de aproximadamente ±5 puntos.
- Métricas frágiles en clases poco representadas: `atraso` tiene 2 ejemplos y `atendimento` 7. El F1 de `atendimento` es 0,25, con confusión con `nao_recebido` y `qualidade`; no debe usarse como único filtro para casos de SAC.
- Los rótulos de entrenamiento provienen de un LLM (Claude Opus 5.5) con una regla de desempate concreta: el modelo hereda las fronteras de categoría del profesor, incluidos sus posibles errores.
- Los datos base son de comercio electrónico general de 2018 (Americanas); otros segmentos y épocas pueden cambiar el vocabulario y degradar el rendimiento.
- Una sola categoría por reseña: cuando hay dos problemas, solo aparece el principal.
- Contexto limitado a 128 tokens; reseñas largas se truncan y pueden perder la información relevante.
- Ámbito lingüístico restringido al portugués de Brasil; no se documenta comportamiento en portugués europeo ni en otros idiomas.
- Riesgo de alucinación de categoría en textos ambiguos o fuera de dominio; la confianza calibrada (T = 1,45) ayuda a fijar umbrales, pero no elimina el error.
- Sesgo de muestreo: el conjunto de entrenamiento está sesgado hacia reseñas negativas, lo que puede afectar la proporción de predicciones entre clases.
- La cuantización dinámica int8 depende del tamaño de lote: clasificar por lotes con padding cambia algunas predicciones respecto a la inferencia una a una.
- Licencia MIT para los pesos; el modelo base es MIT y los datos B2W-Reviews01 son CC BY 4.0, por lo que se debe atribuir a Real et al. (2019) y a neuralmind al redistribuir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NicoDeVargas/radar-avaliacoes-bertimbau
- Repositorio de la aplicación: https://github.com/NicoDeVargas/ecommerce-classificator
- Modelo base: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset B2W-Reviews01: https://huggingface.co/datasets/ruanchaves/b2w-reviews01
- Referencia de B2W-Reviews01 (Real et al., 2019): https://arxiv.org/abs/1904.10821
- transformers.js: https://github.com/huggingface/transformers.js
