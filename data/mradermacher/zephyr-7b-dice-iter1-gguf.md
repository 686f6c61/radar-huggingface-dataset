# mradermacher/Zephyr-7B-DICE-Iter1-GGUF

## Resumen

Zephyr-7B-DICE-Iter1-GGUF es una versión cuantizada en formato GGUF del modelo sail/Zephyr-7B-DICE-Iter1, un fine-tuning del conocido Zephyr-7B de HuggingFaceH4. El modelo original se construye sobre Mistral-7B y se ha ajustado adicionalmente con el dataset HuggingFaceH4/ultrafeedback_binarized, siguiendo la estela del entrenamiento por preferencias (DPO) que popularizó la familia Zephyr. Esta ficha cubre concretamente la redistribución GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo cuenta con 7.241.732.096 parámetros (aproximadamente 7B), lo que lo sitúa en la categoría de modelos de tamaño medio pensados para despliegue local. La versión GGUF incluye un abanico de cuantizaciones estáticas que van desde Q2_K (2,8 GB) hasta f16 (14,6 GB), pasando por opciones intermedias recomendadas como Q4_K_M (4,5 GB) y Q5_K_M (5,2 GB). Al tratarse de una redistribución, las innovaciones técnicas relevantes provienen del modelo base y de la variante DICE-Iter1, no del proceso de cuantización en sí.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo conversacional afinado con preferencias en entornos sin GPU de datacenter. No obstante, la información pública disponible sobre el modelo base (sail/Zephyr-7B-DICE-Iter1) es limitada: la model card del redistribuidor se centra casi exclusivamente en las cuantizaciones, sin detallar datos de entrenamiento, benchmarks o composición del dataset más allá de la referencia a ultrafeedback_binarized.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Mistral-7B vía Zephyr-7B) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Zephyr-7B emplea 4096 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (redistribución); el modelo base original en transformers/safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo causal, heredada de Mistral-7B a través de Zephyr-7B. El modelo original sail/Zephyr-7B-DICE-Iter1 parte de Zephyr-7B y aplica un ajuste adicional sobre el dataset HuggingFaceH4/ultrafeedback_binarized, que es un corpus de preferencias binarias (chosen/rejected) ampliamente utilizado para alineamiento mediante DPO. La model card del redistribuidor no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO más allá de lo que indica la referencia al dataset.

El proceso de cuantización realizado por mradermacher es estático (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica explícitamente que no tiene previstas cuantizaciones ponderadas/imatrix para este modelo, y que si no aparecen en aproximadamente una semana tras las estáticas, probablemente no las planificará salvo petición en la discusión comunitaria. No se documentan innovaciones técnicas específicas de esta variante DICE-Iter1 en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de Zephyr sobre ultrafeedback_binarized.
- Razonamiento multi-turno y diálogo instruccional, dada la naturaleza del dataset de preferencias empleado.
- Formato conversacional (tag conversational en Hugging Face), apto para plantillas de chat.
- Ejecución en CPU y GPU de consumo mediante llama.cpp y derivados, gracias al formato GGUF.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su exposición como servicio.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno en inglés sobre hardware de consumo, usando cuantizaciones Q4_K_M (4,5 GB) o Q5_K_M (5,2 GB) para equilibrar calidad y huella de memoria.
- Prototipado rápido de chatbots: al estar en GGUF y ser compatible con endpoints, permite levantar un servicio de chat en minutos con llama.cpp o servidores compatibles, sin necesidad de GPU de datacenter.
- Evaluación de fine-tunings sobre Zephyr: investigadores que quieran comparar variantes DICE frente a Zephyr-7B original pueden desplegar esta versión cuantizada en entornos reproducibles y de bajo coste.
- Generación de texto asistida en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q3_K_S (3,3 GB) y Q4_K_S (4,2 GB) permiten inferencia en CPU con requisitos de RAM moderados.
- Integración en pipelines de experimentación con transformers: aunque el artefacto principal es GGUF, la librería declarada es transformers y el modelo base está disponible en safetensors, lo que permite flujos mixtos de evaluación.
- Despliegue en entornos con restricciones de licencia permisivas: la licencia MIT facilita su incorporación en productos y servicios, incluyendo uso comercial, siempre que se respeten las condiciones de la licencia.
- Pruebas de robustez y alineamiento: el origen en ultrafeedback_binarized lo hace útil para estudiar comportamientos de preferencia y sesgos en modelos ajustados con DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q2_K ~2,8 GB; Q3_K_S ~3,3 GB; Q3_K_M ~3,6 GB; Q3_K_L ~3,9 GB; IQ4_XS ~4,0 GB; Q4_K_S ~4,2 GB; Q4_K_M ~4,5 GB; Q5_K_S ~5,1 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB. Estas cifras corresponden al tamaño de los ficheros y deben incrementarse para tener en cuenta el contexto y los buffers de inferencia.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, las cuantizaciones Q4 y Q5 encajan en GPUs de consumo con 8 GB de VRAM o más; Q6_K y Q8_0 requieren 8-12 GB; f16 requiere al menos 16 GB de VRAM para carga completa.
- Cabe en GPU de consumo: sí, para cuantizaciones Q2 a Q5 en tarjetas de 8 GB; Q6_K y Q8_0 en tarjetas de 12 GB o más; f16 en 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF y endpoints; el modelo base original puede servirse con transformers, vLLM o TGI si se dispone de los pesos safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zephyr-7B-DICE-Iter1-GGUF (este) | ~7,24B | no disponible | MIT | GGUF | Redistribución cuantizada de sail/Zephyr-7B-DICE-Iter1 |
| Zephyr-7B-beta (HuggingFaceH4) | ~7,24B | 4096 tokens (referencia del modelo base) | MIT | safetensors, GGUF (por terceros) | Modelo de referencia de la familia Zephyr; DPO sobre ultrafeedback |
| Mistral-7B-v0.1 (Mistral AI) | ~7,24B | 8192 tokens (referencia del modelo base) | Apache 2.0 | safetensors, GGUF | Base arquitectónica de Zephyr; sin ajuste conversacional |
| Zephyr-7B-DICE-Iter1 (sail) | ~7,24B | no disponible | MIT | safetensors | Modelo base original del que deriva esta cuantización |

Los datos de contexto de Zephyr-7B-beta y Mistral-7B-v0.1 se incluyen como referencia de la familia arquitectónica; no se confirman para esta variante concreta. No se dispone de comparativas de rendimiento en benchmarks para este modelo.

## Limitaciones y advertencias

- Idiomas: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: no se confirma la longitud de contexto efectiva de esta variante; conviene validarla empíricamente antes de usarla en tareas de contexto largo.
- Alucinación: al ser un modelo de 7B ajustado sobre preferencias, mantiene el riesgo habitual de generar contenido factualmente incorrecto con alta confianza.
- Sesgos: no se documentan análisis de sesgo en la información disponible; el dataset ultrafeedback_binarized puede introducir sesgos propios de su composición.
- Cuantización: las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M, Q6_K y Q8_0.
- Falta de cuantizaciones imatrix: el autor indica que no tiene previstas cuantizaciones ponderadas/imatrix, lo que limita la calidad máxima alcanzable con cuantizaciones pequeñas.
- Licencia: MIT permite uso comercial, pero debe conservarse el aviso de copyright y verificar las obligaciones heredadas del modelo base y de sus dependencias.
- Producción: al tratarse de una redistribución con escasa documentación de benchmarks y contexto, no es aconsejable desplegarlo en producción crítica sin una evaluación previa propia.
- Modelo base: la información pública sobre sail/Zephyr-7B-DICE-Iter1 es limitada, lo que reduce la trazabilidad del proceso de entrenamiento y alineamiento.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Zephyr-7B-DICE-Iter1-GGUF
- Modelo base original: https://huggingface.co/sail/Zephyr-7B-DICE-Iter1
- Página de descargas del autor: https://hf.tst.eu/model#Zephyr-7B-DICE-Iter1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
