# Snapkitty/bert-agent

## Resumen

El modelo `Snapkitty/bert-agent` es un agente de verificación de implicación (entailment) diseñado para actuar como capa de validación en pipelines de generación aumentada por recuperación (RAG). Desarrollado por Ahmad Ali Parr y Jessica L. Williams bajo el sello SNAPKITTYWEST, el sistema toma un fragmento de fuente recuperado y una afirmación generada por un LLM, y devuelve una puntuación de implicación acotada matemáticamente, un veredicto y una atestación criptográfica BLAKE3 sellada en una cadena de auditoría WORM (write-once-read-many). No es un chatbot ni un sistema NLI genérico, sino un demonio de producción que se coloca al final de cualquier pipeline RAG para impedir la propagación de afirmaciones no implicadas por la fuente.

La arquitectura se basa en un cross-encoder DeBERTa-v3-base, que concatena premisa e hipótesis en una única pasada hacia adelante, permitiendo atención conjunta sobre los tokens de ambas secuencias. El modelo se entrena con un conjunto de datos triple (ANLI + TrueTeacher + MNLI) y una pérdida de entropía cruzada ponderada, con pesos de 2.0 para contradicción, 1.5 para neutral y 1.0 para implicación. El sistema completo incluye exportación a ONNX, optimización de gráfico con ORT y compilación a TensorRT FP16, además de un demonio de inferencia en Rust con batching de doble activación y un protocolo de cinco puertas ERE (P1-P5) antes de emitir la respuesta. La relevancia actual radica en la necesidad de verificación rigurosa contra alucinaciones en sistemas RAG, donde las afirmaciones plausibles pero incorrectas pueden pasar desapercibidas sin una capa de control dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en DeBERTa-v3-base |
| Parametros totales | no disponible (modelo base DeBERTa-v3-base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (TensorRT) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | AGPL-3.0 (segun HuggingFace); la model card menciona triple licencia AGPL / BSL 1.1 / MIT |
| Formato de pesos | ONNX, TensorRT engine (no se menciona safetensors) |

## Arquitectura y entrenamiento

El modelo emplea un cross-encoder, a diferencia de los bi-encoders tradicionales. En lugar de codificar premisa e hipótesis por separado y comparar sus embeddings con similitud coseno, concatena ambas secuencias en una única entrada: `[CLS] retrieved_chunk [SEP] generated_claim [SEP]`. Esto permite que la atención conjunta compare directamente entidades a través del límite premisa-hipótesis en cada capa, lo que resulta crítico para detectar contradicciones sutiles como fechas invertidas (1962 vs 1926), sujetos intercambiados (X derrotó a Y vs Y derrotó a X) o negaciones (el voto pasó vs el voto no pasó). El modelo base es DeBERTa-v3-base, sobre el cual se añade una cabeza de clasificación de tres etiquetas (contradicción, neutral, implicación).

El entrenamiento se realiza sobre una combinación de tres conjuntos de datos: ANLI (Adversarial NLI), TrueTeacher (generado sintéticamente) y MNLI (Multi-Genre NLI). La función de pérdida es una entropía cruzada ponderada con pesos de 2.0 para contradicción, 1.5 para neutral y 1.0 para implicación, lo que enfatiza la detección de contradicciones sobre las otras clases. Después del entrenamiento, el modelo se exporta a ONNX con ejes dinámicos, se optimiza con ONNX Runtime (ORT) y se convierte a un motor TensorRT con precisión FP16. El sistema de inferencia es un demonio en Rust que utiliza batching de doble activación (por tamaño máximo de lote o por temporizador de 5 ms), padding dinámico y una pasada hacia adelante en GPU. Cada inferencia genera una atestación BLAKE3 que se sella en una cadena de auditoría WORM (write-once-read-many) y se pasa por el protocolo ERE de cinco puertas (P1-P5) antes de devolver la respuesta. Se mencionan invariantes formales demostrados en Lean 4 sin "sorry", lo que sugiere un esfuerzo de verificación formal en el sistema.

## Capacidades

- Verificación de implicación (entailment) entre un fragmento de fuente recuperado y una afirmación generada por un LLM, devolviendo una puntuación, un veredicto y un hash criptográfico.
- Detección de alucinaciones específica para pipelines RAG, con capacidad de detectar contradicciones sutiles como fechas invertidas, sujetos intercambiados y negaciones.
- Atestación criptográfica BLAKE3 de cada inferencia, sellada en una cadena de auditoría WORM para trazabilidad inmutable.
- Protocolo de seguridad ERE de cinco puertas (P1-P5) que actúa como filtro adicional antes de emitir la respuesta, pudiendo detener la propagación si alguna puerta falla (`ere_halt`).
- Batching continuo de doble activación (por tamaño de lote o temporizador) para alta concurrencia.
- Inferencia de baja latencia (menos de 5 ms por lote en TensorRT FP16 según la model card).
- No es un modelo generativo: no produce texto libre, sino una clasificación de tres clases con puntuación de softmax.

## Casos de uso

- Verificación de respuestas en sistemas RAG: antes de devolver una respuesta generada por un LLM al usuario final, el agente comprueba si la afirmación está implicada por el fragmento de contexto recuperado. Si no lo está, bloquea la respuesta o la marca como no verificada.
- Auditoría de alucinaciones en entornos empresariales: en sectores regulados (finanzas, salud, legal), cada afirmación generada debe ir acompañada de una prueba criptográfica de que se deriva de una fuente aprobada. El agente proporciona ese sello BLAKE3 y el registro WORM.
- Control de calidad en pipelines de generación de informes: cuando un LLM redacta resúmenes o informes basados en documentos, el agente valida cada afirmación contra el documento original, detectando inconsistencias como fechas erróneas o sujetos cambiados.
- Detección de contradicciones en sistemas de diálogo: en asistentes virtuales que consultan bases de conocimiento, el agente asegura que las respuestas no contradigan la información recuperada, incluso en casos de negación o cambios de sujeto.
- Trazabilidad regulatoria: cada verificación genera un hash y una entrada en la cadena WORM, lo que permite auditar posteriormente qué afirmación se validó, contra qué fuente y con qué resultado.
- Integración como servicio de verificación independiente: el demonio Rust expone un endpoint HTTP POST `/verify` que puede ser consumido por cualquier pipeline RAG, independientemente del framework de generación utilizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como exactitud, F1 o comparaciones numéricas con otros modelos. Solo se mencionan características cualitativas (latencia <5 ms, throughput con batching dual) y una comparación conceptual con Google BERT, pero sin cifras concretas de rendimiento en tareas NLI o de detección de alucinaciones.

## Requisitos de hardware

- Requiere GPU NVIDIA con soporte para TensorRT (serie Turing o superior, por ejemplo RTX 20xx, 30xx, 40xx, A100, H100).
- La inferencia se ejecuta en GPU con precisión FP16; no se especifica VRAM mínima, pero al tratarse de DeBERTa-v3-base (~86M parámetros) y FP16, se estima que cabría en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se confirma en la información disponible.
- El demonio de inferencia está escrito en Rust y requiere un entorno con CUDA y TensorRT instalados.
- Opciones de despliegue: el sistema se presenta como un daemon con endpoint HTTP, no como una librería estándar. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que está diseñado específicamente para esta tarea de verificación, no para generación.
- Latencia: se afirma <5 ms por lote en TensorRT FP16, pero no se especifica el tamaño de lote ni el hardware concreto.

## Comparativa con modelos similares

La model card compara explícitamente este agente con Google BERT (2018) en una tabla cualitativa. No se dispone de datos numéricos de benchmarks para otros modelos de verificación de implicación. La comparación se centra en diferencias arquitectónicas y funcionales:

| Propiedad | Google BERT (2018) | Snapkitty/bert-agent |
|-----------|-------------------|----------------------|
| Arquitectura | Bi-directional encoder | Cross-encoder (premisa ++ hipótesis) |
| Tarea NLI | Fine-tuned en MNLI solamente | ANLI + TrueTeacher + MNLI (3 fuentes) |
| Detección de alucinaciones | No diseñado para ello | Objetivo primario |
| Detección de negación | Débil (embeddings simétricos) | Fuerte (atención conjunta) |
| Detección de cambios de fecha/número | Falla | Detecta (ej. 1962 → 1926) |
| Runtime | Python / TF / PyTorch | Demonio Rust, TensorRT FP16, GPU |
| Latencia | ~100-300 ms (Python) | <5 ms por lote (TRT) |
| Throughput | Solicitud única | Batching continuo de doble activación |
| Auditoría | Ninguna | BLAKE3 + cadena WORM por inferencia |
| Puertas de seguridad | Ninguna | ERE P1-P5 (protocolo de cinco puertas) |
| Invariantes formales | Ninguno | Lean 4, sin sorry |
| Licencia | Apache 2.0 | Triple licencia (AGPL / BSL 1.1 / MIT) |

No se dispone de comparaciones con otros cross-encoders modernos (como RoBERTa-large o DeBERTa-v3-large) ni con sistemas de verificación RAG específicos (como RAGAS o TruLens), ya que no se mencionan en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un chatbot ni un generador de texto; solo realiza clasificación de implicación en tres clases. Intentar usarlo para otras tareas puede dar resultados sin sentido.
- Licencia AGPL-3.0 en HuggingFace (aunque la model card menciona triple licencia AGPL/BSL 1.1/MIT). La AGPL impone obligaciones de copyleft sobre servicios de red, lo que puede afectar a despliegues comerciales que expongan el servicio a usuarios externos. Se debe verificar qué licencia se aplica realmente en cada caso.
- La longitud de contexto no está especificada; DeBERTa-v3-base tiene un límite típico de 512 tokens, pero no se confirma. Fragmentos de fuente muy largos podrían truncarse, afectando a la precisión de la verificación.
- No se han publicado benchmarks cuantitativos; la afirmación de latencia <5 ms proviene de la model card y no ha sido verificada de forma independiente.
- El sistema depende de TensorRT y CUDA, lo que limita el despliegue a entornos NVIDIA. No se menciona soporte para CPU u otras aceleradoras.
- La cadena de auditoría WORM y el protocolo ERE añaden complejidad operativa; no se documentan los requisitos de almacenamiento ni la gestión de claves.
- Riesgo de sesgo en el entrenamiento: al combinar ANLI, TrueTeacher y MNLI, el modelo puede heredar sesgos de esos conjuntos de datos, aunque no se detallan evaluaciones de sesgo.
- Alucinaciones residuales: ningún sistema de verificación es perfecto; el agente reduce el riesgo pero no lo elimina por completo. Las afirmaciones que pasan la verificación pueden seguir siendo incorrectas si la fuente recuperada es errónea.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/bert-agent
- Modelo base DeBERTa-v3: https://huggingface.co/microsoft/deberta-v3-base
- TensorRT (NVIDIA): https://developer.nvidia.com/tensorrt
- No se proporcionan otros enlaces (papers, repositorios, demos) en la información disponible.
