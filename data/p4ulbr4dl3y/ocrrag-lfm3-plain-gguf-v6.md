# p4ulbr4dl3y/ocrrag-lfm3-plain-gguf-v6

## Resumen

ocrrag-lfm3-plain-gguf-v6 es un ajuste fino mediante LoRA del modelo base LFM3-1.7B, empaquetado en formato GGUF y publicado por el usuario p4ulbr4dl3y. No se trata de un modelo de propósito general, sino de un componente especializado dentro del sistema ocrrag: un "answerer" extractivo y anclado (grounded) para el plugin `plain`, que recibe una ventana de fragmentos recuperados y debe responder citando el fragmento concreto mediante `[chunk_id]` o rechazar la respuesta con un veredicto tipado. El artefacto está diseñado para despliegue en CPU (cuantización Q4_K_M) o en GPU/Metal (Q8_0).

El modelo resuelve un problema acotado pero crítico en pipelines RAG: evitar respuestas alucinadas cuando la evidencia recuperada no cubre la pregunta, forzando una abstención explícita en lugar de una invención. Con 1.728.801.600 parámetros totales y un tamaño de repositorio de 2,9 GB, es un modelo pequeño orientado a latencia baja y despliegue en hardware modesto.

La relevancia actual del artefacto es doble: por un lado, ejemplifica el patrón de especialización de modelos pequeños para tareas extractivas con citación verificable; por otro, la model card publica métricas de evaluación propias (108 filas de test, 64 respondibles y 44 vacías) que permiten comparar versiones del mismo ajuste, aunque con la advertencia explícita de que las latencias no son comparables entre versiones por diferencias en la máquina de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-1.7B; ajuste LoRA sobre transformer, detalles no especificados) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors para el adaptador LoRA referenciado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA del modelo base LFM3-1.7B, cuyo adaptador se publica por separado en `p4ulbr4dl3y/ocrrag-lfm3-plain-lora-v6`. La información disponible no detalla la arquitectura interna del modelo base ni la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. Lo que sí se especifica es el prompt de servicio: 2530 caracteres, con hash sha256 `5449aca38687225a` y `enable_thinking=False`, lo que indica que el ajuste se realizó y evalúa contra un prompt fijo y reproducible, y que el modo de razonamiento explícito del modelo base está desactivado en producción.

La innovación técnica destacable no está en la arquitectura sino en el contrato de salida: el modelo debe producir respuestas estructuradas con citas `[chunk_id]` o un veredicto de rechazo tipado. La evaluación publicada mide precisamente la adherencia a ese contrato (columna "structured": 108/108 en todas las versiones), la tasa de rechazo excesivo (over-decline), la tasa de rechazo correcto ante ventanas vacías y la similitud de las respuestas citadas. No se dispone de información sobre datos de entrenamiento, composición del corpus ni proceso de alineación.

## Capacidades

- Generación de respuestas extractivas ancladas a evidencia: responde únicamente a partir de la ventana de fragmentos recuperados, citando el fragmento concreto mediante `[chunk_id]`.
- Abstención tipada: cuando la evidencia no cubre la pregunta, emite un veredicto de rechazo en lugar de generar una respuesta.
- Salida estructurada: el 100% de las respuestas en el conjunto de test (108/108) cumplen el formato estructurado esperado.
- Citación verificable: en la versión v6, las 38 respuestas emitidas incluyen cita (38/38 citadas).
- Control de fuga de información: la versión v6 registra 0 respuestas con cifras fuera de la ventana de contexto.
- Modo de pensamiento desactivado: el prompt de servicio fija `enable_thinking=False`, por lo que no se emplea razonamiento explícito en la inferencia.
- No se dispone de información sobre soporte de tool calling, capacidades de agente multi-paso, visión, audio ni cobertura multilingüe.

## Casos de uso

- Respuesta extractiva en pipelines RAG documentales: el modelo recibe los fragmentos recuperados por el retriever y devuelve una respuesta con cita al chunk exacto, lo que permite auditar la procedencia de cada afirmación en sistemas de consulta sobre corpus internos.
- Abstención controlada en atención al cliente sobre base de conocimiento: cuando la ventana recuperada no contiene la respuesta, el modelo emite un veredicto de rechazo en lugar de improvisar, lo que reduce el riesgo de comunicar información incorrecta al usuario final.
- Despliegue en CPU para entornos sin GPU: la cuantización Q4_K_M (1,02 GiB) está pensada explícitamente como "customer artifact" para despliegue en CPU, adecuada para servicios de bajo volumen o entornos on-premise sin acelerador.
- Verificación de citas en flujos de compliance: la obligación de citar `[chunk_id]` y la métrica de cero cifras fuera de ventana permiten construir flujos donde cada respuesta es trazable a un documento fuente concreto.
- Procesamiento por lotes de consultas sobre ventanas de chunks: con latencias p50 medidas de 15,4 s en Q8_0 y 11,2 s en Q4_K_M (v7) en la máquina de evaluación, el modelo encaja en procesos batch o asíncronos más que en interacción en tiempo real estricto.
- Componente de un sistema mayor con enrutado por plugin: al estar especializado en el plugin `plain` de ocrrag, puede convivir con otros answerers especializados y ser seleccionado por el orquestador según el tipo de consulta.
- Evaluación comparativa de versiones de ajuste fino: las métricas publicadas (structured, over-decline, refusal on empty, cited, similarity, figures outside the window) sirven como plantilla para comparar iteraciones del adaptador antes de promover una versión a producción.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el mismo test de 108 filas (64 respondibles / 44 vacías):

| Artefacto | Structured | Over-decline | Refusal on empty | Cited | Similarity | Figures outside window | p50 |
|---|---|---|---|---|---|---|---|
| v3 Q8_0 | 108/108 | 1/64 (2%) | 38/44 (86%) | 63/63 | 0,59 | 1 | 16,0 s |
| v6 Q8_0 | 108/108 | 26/64 (41%) | 37/44 (84%) | 38/38 | 0,63 | 0 | 15,4 s |
| v7 Q8_0 | 108/108 | 2/64 (3%) | 42/44 (95%) | 62/62 | 0,63 | 0 | 9,1 s |
| v7 Q4_K_M | 108/108 | 3/64 (5%) | 42/44 (95%) | 61/61 | 0,60 | 0 | 11,2 s |

Advertencia del autor: las latencias no son comparables entre versiones, ya que las ejecuciones de v3 y v6 compartieron máquina con tres modelos en espera y las de v7 no. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 1,02 GiB para Q4_K_M y 1,72 GiB para Q8_0, según los tamaños de fichero publicados.
- GPU recomendadas: no se especifican modelos concretos; la model card indica Q8_0 para "Metal/GPU" y Q4_K_M para CPU.
- Compatibilidad con GPU de consumo: por tamaño, ambas cuantizaciones caben holgadamente en cualquier GPU de consumo con al menos 2-4 GB de memoria libre, aunque no se han publicado pruebas específicas en RTX 4090, A100 o H100.
- Opciones de despliegue: formato GGUF, compatible con llama.cpp y derivados (Ollama, entre otros); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, sin más detalle.
- Latencia y throughput: p50 de 15,4 s (v6 Q8_0), 9,1 s (v7 Q8_0) y 11,2 s (v7 Q4_K_M) en la máquina de evaluación del autor; no se publica throughput (tokens/s) ni condiciones de hardware de esas mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ocrrag-lfm3-plain-gguf-v6 | 1,73 B | no disponible | Answerer extractivo con citas y abstención tipada | no disponible | GGUF en Hugging Face |
| LFM3-1.7B (base) | 1,7 B (aprox.) | no disponible | Modelo de propósito general | no disponible | Referenciado como base del ajuste |
| ocrrag-lfm3-plain-lora-v6 (adaptador) | no aplica (LoRA) | no disponible | Adaptador del mismo ajuste | no disponible | Safetensors en Hugging Face |

No se dispone de información sobre modelos comparables de la misma categoría (answerers extractivos especializados con abstención tipada) ni de datos de rendimiento de las alternativas en el mismo test, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Tasa de rechazo excesivo elevada en esta versión: 26/64 (41%) de over-decline en v6 Q8_0, frente al 2% de v3 y el 3% de v7. Es la limitación más relevante de esta versión concreta y sugiere que versiones posteriores (v7) corrigen el comportamiento.
- Cobertura de rechazo ante ventanas vacías del 84% (37/44), por debajo del 95% de v7; aproximadamente 1 de cada 6 casos vacíos no se rechaza correctamente.
- Especialización estrecha: el modelo está ajustado para un prompt fijo de 2530 caracteres y el plugin `plain` de ocrrag; su comportamiento fuera de ese contrato no está caracterizado.
- Licencia no disponible: no se especifican términos de uso comercial, lo que impide evaluar su viabilidad en producción sin consultar al autor.
- Idiomas no disponibles: no se documenta cobertura lingüística; el prompt y las métricas están en inglés.
- Riesgo de alucinación: aunque v6 registra 0 respuestas con cifras fuera de la ventana en el test publicado, el conjunto es pequeño (108 filas) y no constituye garantía general.
- Latencias altas para interacción en tiempo real: p50 de 15,4 s en Q8_0 en la máquina de evaluación, con la salvedad de que las condiciones de medición no son comparables entre versiones.
- Sin datos de benchmarks estándar ni de rendimiento en hardware de referencia, lo que limita la comparación con alternativas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-gguf-v6
- Adaptador LoRA referenciado: https://huggingface.co/p4ulbr4dl3y/ocrrag-lfm3-plain-lora-v6
- Paper, blog, repositorio o demo: no disponible en la información proporcionada.
