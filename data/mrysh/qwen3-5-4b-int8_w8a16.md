# mrysh/qwen3.5-4b-int8_w8a16

## Resumen

`mrysh/qwen3.5-4b-int8_w8a16` es un checkpoint cuantizado del modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario independiente mrysh (mrysh) dentro de un banco de pruebas de cuantización que compara 4 modelos con 8 técnicas distintas, evaluadas con vLLM sobre BFCL, Energy-QA, un conjunto de sesgo de contratación y MedQA. El modelo conserva la licencia Apache-2.0 del original y contiene 4.205.751.296 parámetros en safetensors, con un peso en disco de 4,865 GB.

La cuantización aplicada es INT8 weight-only (W8A16): pesos en int8 con una escala por canal de salida, activaciones en 16 bits, redondeo al más cercano (RTN) y sin datos de calibración. El resultado se empaqueta en formato `pack-quantized` de compressed-tensors 0.17.0 y se carga directamente en vLLM sin flags adicionales. Las torres de visión y audio se mantienen en 16 bits, aunque la evaluación publicada se hizo únicamente como modelo de texto y con el modo de razonamiento desactivado.

Su relevancia es doble: por un lado, ofrece una vía de despliegue de bajo coste para un modelo de la familia Qwen3.5, que según la documentación pública emplea entrenamiento multimodal de fusión temprana; por otro, sirve como referencia reproducible de una técnica de cuantización concreta frente a las variantes fp8 y gptq_8bit del mismo autor. No se han publicado resultados numéricos de ese benchmark en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5_text`), con componentes de visión y audio que se conservan en 16 bits; configuración exacta no disponible |
| Parametros totales | 4.205.751.296 (~4,21 B) |
| Parametros activos | No aplica: la informacion disponible no indica que el modelo base sea MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 weight-only W8A16 (este repo); el mismo autor publica variantes FP8 y GPTQ 8-bit del modelo base |
| Idiomas soportados | No disponibles en la model card |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Safetensors en formato `pack-quantized` de compressed-tensors 0.17.0 |

## Arquitectura y entrenamiento

El checkpoint no introduce cambios arquitectónicos: es una conversión de pesos del modelo `Qwen/Qwen3.5-4B`. La cuantización es INT8 weight-only, es decir, los pesos se almacenan en 8 bits con una única escala por canal de salida, mientras que las activaciones permanecen en 16 bits durante la inferencia. El proceso usa round-to-nearest sin conjunto de calibración (grupo de cuantización `None`), lo que lo convierte en un procedimiento puramente post-entrenamiento y dependiente de la distribución original de los pesos. Las torres de visión y audio se dejan intactas en 16 bits.

Los detalles de entrenamiento del modelo base —número de tokens, composición del dataset, fases de RLHF/DPO— no están disponibles en la información proporcionada. La documentación pública de la familia Qwen3.5 menciona un entrenamiento multimodal de fusión temprana sobre tokens multimodales, con paridad declarada frente a Qwen3 y rendimiento superior a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual. La evaluación de esta conversión concreta se realizó como modelo de texto con vLLM y el modo de razonamiento desactivado, por lo que el comportamiento multimodal del checkpoint no está validado.

## Capacidades

- Generación de texto y razonamiento en modo texto; el benchmark del autor se ejecutó con *thinking* desactivado, de modo que el rendimiento del modo de razonamiento no está documentado para este checkpoint.
- Función calling y uso de herramientas: la evaluación incluye BFCL (Berkeley Function Calling Leaderboard), lo que indica que el modelo base está orientado a tool calling.
- Capacidades de agente y razonamiento multi-paso, heredadas del modelo base Qwen3.5.
- Generación de código y tareas de comprensión técnica, evaluadas indirectamente vía BFCL y MedQA en el banco de pruebas del autor.
- Capacidades multimodales (visión y audio) presentes en los pesos, conservadas en 16 bits, pero no evaluadas en esta publicación.
- Capacidades multilingües: no documentadas en la model card de esta conversión.
- Despliegue nativo en vLLM sin necesidad de flags de cuantización.

## Casos de uso

- **Servicio de inferencia de texto en producción con vLLM**: el checkpoint se carga con `vllm serve mrysh/qwen3.5-4b-int8_w8a16` sin configuración adicional, lo que permite reducir el espacio de pesos a ~4,2 GB frente a los ~8,4 GB de una versión BF16 y liberar VRAM para caché KV.
- **Agentes con tool calling**: al haber sido evaluado en BFCL, encaja en pipelines donde el modelo debe emitir llamadas a funciones estructuradas (APIs REST, consultas a bases de datos, operaciones de ficheros) dentro de un bucle de agente.
- **Atención al cliente automatizada**: un modelo de 4 B cuantizado a int8 puede sostener conversaciones multi-turno en una GPU de gama media; la longitud de contexto utilizable debe confirmarse contra la configuración del modelo base, no disponible aquí.
- **Asistente de documentación técnica y código**: generación y explicación de fragmentos de código en herramientas de desarrollo, con la ventaja de un peso reducido que permite ejecutar varios workers en la misma GPU.
- **Evaluación comparativa de técnicas de cuantización**: este repositorio forma parte de un banco de pruebas de 4 modelos × 8 técnicas, por lo que sirve como artefacto reproducible para medir la degradación de int8 W8A16 frente a FP8 y GPTQ 8-bit sobre las mismas tareas.
- **Prototipado en estaciones de trabajo con una sola GPU consumer**: con ~4,9 GB en disco y pesos int8, el modelo cabe en tarjetas de 8-12 GB, lo que facilita ciclos de iteración locales sin infraestructura de centro de datos.
- **Procesamiento por lotes de documentos**: clasificación, extracción y resumen de textos en trabajos offline donde el throughput importa más que la latencia interactiva.

## Benchmarks y rendimiento

El autor declara un banco de pruebas con 4 modelos y 8 técnicas evaluadas mediante vLLM sobre BFCL, Energy-QA, un conjunto de sesgo en contratación y MedQA. Sin embargo, no se han publicado resultados numéricos de benchmarks en la información disponible, ni para este checkpoint ni para las variantes FP8 y GPTQ del mismo autor.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos ocupan ~4,2 GB en int8; con overhead del runtime de vLLM, buffers de activaciones en 16 bits y caché KV, un despliegue con contexto corto parte de aproximadamente 6-8 GB y conviene reservar 10-16 GB para contextos largos o lotes concurrentes. Son estimaciones derivadas del tamaño del checkpoint, no mediciones publicadas.
- **GPU recomendadas**: para servicio con concurrencia, L4 (24 GB), A10G (24 GB), A100 (40/80 GB) o H100; para desarrollo y pruebas, RTX 4090 (24 GB) o RTX 4080 (16 GB).
- **Cabe en GPU consumer**: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070 deberían alojar el modelo con contexto moderado.
- **Opciones de despliegue**: vLLM es la vía soportada de forma explícita (formato compressed-tensors `pack-quantized`). No se documenta compatibilidad de este checkpoint con llama.cpp, Ollama o TGI; el modelo base sí está publicado en Ollama como `qwen3.5:4b`, que sería la alternativa para esos runtimes.
- **Latencia y throughput**: no disponibles. Al ser weight-only, las multiplicaciones se ejecutan en 16 bits, por lo que la ganancia esperable frente a BF16 está en memoria y ancho de banda, no en cómputo tensorial int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `mrysh/qwen3.5-4b-int8_w8a16` | 4,21 B | No disponible | INT8 W8A16, RTN sin calibracion | Apache-2.0 | Pesos ~4,2 GB; carga en vLLM sin flags |
| `mrysh/qwen3.5-4b-fp8` | 4,21 B (base) | No disponible | FP8 (llm-compressor / ModelOpt) | Apache-2.0 | 4,87 GB en disco; misma evaluacion |
| `mrysh/qwen3.5-4b-gptq_8bit` | 4,21 B (base) | No disponible | GPTQ 8-bit | Apache-2.0 | Misma evaluacion; GPTQ suele requerir calibracion |
| `Qwen/Qwen3.5-4B` (base) | 4,21 B | No disponible | BF16 sin cuantizar | Apache-2.0 | Referencia de calidad; ~8,4 GB de pesos |
| `qwen3.5:4b` (Ollama) | 4 B (familia) | No disponible | GGUF (cuantizacion no especificada) | Apache-2.0 | Via de despliegue alternativa en llama.cpp/Ollama |

La comparación de rendimiento entre estas variantes no puede establecerse con los datos disponibles: el autor menciona el benchmark pero no publica las puntuaciones de BFCL, Energy-QA, sesgo de contratación ni MedQA.

## Limitaciones y advertencias

- **Cuantización sin calibración**: el uso de round-to-nearest con una sola escala por canal de salida y sin datos de calibración puede degradar la precisión en capas sensibles; no se han publicado métricas de esa degradación.
- **Sin aceleración de cómputo int8**: al ser weight-only (W8A16), las activaciones siguen en 16 bits; el ahorro es de memoria, no de velocidad de cálculo.
- **Multimodalidad no validada**: visión y audio se conservan en 16 bits, pero la evaluación se hizo solo como modelo de texto, por lo que no hay garantías sobre su comportamiento multimodal.
- **Modo de razonamiento desactivado en la evaluación**: el rendimiento con *thinking* activado no está documentado para este checkpoint.
- **Ausencia de validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de benchmark, no un modelo con adopción contrastada.
- **Riesgo de alucinación**: inherente a un modelo de 4 B; debe acompañarse de verificación externa en dominios factuales como MedQA.
- **Sesgos**: el banco de pruebas incluye un conjunto de sesgo en contratación, lo que sugiere que el autor considera relevante medir sesgo demográfico, pero los resultados no se han publicado.
- **Idiomas y contexto**: no hay información sobre cobertura lingüística ni longitud de contexto en esta model card; deben consultarse en la del modelo base antes de usarlo en producción.
- **Licencia**: Apache-2.0 permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y el texto de atribución; conviene revisar también las condiciones del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrysh/qwen3.5-4b-int8_w8a16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante FP8 del mismo autor: https://huggingface.co/mrysh/qwen3.5-4b-fp8
- Variante GPTQ 8-bit del mismo autor: https://huggingface.co/mrysh/qwen3.5-4b-gptq_8bit
- Ficha del modelo base en Ollama: https://ollama.com/library/qwen3.5:4b
- Guía de la familia Qwen3.5 (tamaños, VRAM y cuantizaciones): https://insiderllm.com/guides/qwen-3-5-local-guide/
