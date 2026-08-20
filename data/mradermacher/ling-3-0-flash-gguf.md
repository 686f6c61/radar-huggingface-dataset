# mradermacher/Ling-3.0-flash-GGUF

## Resumen

Ling-3.0-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por inclusionAI, el laboratorio de IA de Ant Group. Fue publicado el 23 de julio de 2026 como la apuesta del laboratorio por un modelo de alta eficiencia computacional: con 124.000 millones de parametros totales y solo 5.100 millones de parametros activos por token, Ant afirma que iguala o supera a su propio modelo insignia Ling-2.6 de aproximadamente un billon de parametros, con una octava parte de parametros totales y una doceava parte de parametros activos. Estas afirmaciones son del proveedor y no cuentan con una tabla publica de benchmarks que las respalde.

El modelo ofrece una ventana de contexto nativa de 256.000 tokens, ampliable hasta un millon, y esta disenado para reducir el coste de inferencia manteniendo capacidades de razonamiento y generacion de nivel competitivo. Este repositorio en concreto es una conversion a formato GGUF realizada por mradermacher, que permite ejecutar el modelo en entornos de inferencia locales como llama.cpp, Ollama o LM Studio con distintas cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), activacion de 1/64 expertos |
| Parametros totales | 124B (127.486.405.600 segun conteo de safetensors) |
| Parametros activos | 5.1B |
| Longitud de contexto | 256K nativo, ampliable a 1M |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Ling-3.0-flash es un modelo MoE con activacion de expertos de 1/64: de los 124.000 millones de parametros totales, solo 5.100 millones se activan por token procesado, lo que reduce considerablemente el coste computacional por inferencia en comparacion con un modelo denso de tamano equivalente. La arquitectura sigue el esquema estandar de transformers con capas de atencion y feed-forward distribuidas entre expertos, aunque no se han publicado detalles tecnicos adicionales sobre la implementacion concreta de la atencion (lineal, esparsa, etc.) ni sobre la composicion del dataset de entrenamiento.

El proceso de entrenamiento, la cantidad de tokens utilizados y si se aplicaron tecnicas como RLHF o DPO no se detallan en la informacion disponible. El modelo fue lanzado el 23 de julio de 2026 y la documentacion oficial se encuentra en el sitio de desarrolladores de Ant Group.

## Capacidades

- Generacion de texto conversacional, orientado a dialogos multi-turno.
- Razonamiento general y tareas de lenguaje, aunque sin datos publicos de evaluacion detallados.
- Contexto largo nativo de 256K tokens, ampliable a 1M, adecuado para tareas con documentos extensos.
- Eficiencia computacional destacada: el modelo se posiciona en el percentil 78 de velocidad entre modelos comparables segun Benchable.
- Compatibilidad con formatos GGUF y endpoints de inferencia (etiqueta `endpoints_compatible`).
- No se ha confirmado publicamente el soporte de tool calling, function calling ni capacidades de agentes.
- No se han publicado datos sobre capacidades de vision o audio.

## Casos de uso

- **Procesamiento de documentos extensos**: con una ventana de 256K tokens nativa, el modelo puede analizar contratos, informes financieros o expedientes completos en una sola pasada, sin necesidad de dividir el texto en fragmentos.
- **Atencion al cliente automatizada**: el modelo gestiona conversaciones multi-turno con contexto largo, lo que permite mantener el hilo de interacciones prolongadas sin perder informacion previa.
- **Resumen de informes y actas**: adecuado para generar resumenes de documentacion corporativa extensa en entornos con restricciones de coste, gracias a su arquitectura MoE eficiente.
- **Despliegue en entornos con recursos limitados**: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en hardware de gama media manteniendo un equilibrio entre calidad y consumo de VRAM.
- **Inferencia de alto rendimiento en produccion**: la activacion reducida de parametros permite un throughput mayor que un modelo denso equivalente, util para servicios de generacion de texto a gran escala.
- **Aplicaciones de chatbot local**: mediante llama.cpp o Ollama, el modelo puede ejecutarse en un equipo de escritorio para desarrollo y prototipado de asistentes conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia es una afirmacion del proveedor de que el modelo iguala o supera a Ling-2.6 (modelo de aproximadamente 1T de parametros) en la mayoria de benchmarks mostrados, sin que se haya hecho publica la tabla de resultados. Benchable sitúa al modelo en el percentil 78 de velocidad en ocho benchmarks, pero no se especifican las puntuaciones concretas de calidad.

## Requisitos de hardware

- **Tamano del repositorio**: 72.4 GB para todas las cuantizaciones combinadas.
- **VRAM estimada por cuantizacion** (valores orientativos para 124B de parametros):
  - Q2_K: aproximadamente 30-35 GB de VRAM.
  - Q4_K_M: aproximadamente 45-50 GB de VRAM.
  - Q5_K_M: aproximadamente 55-60 GB de VRAM.
  - Q8_0: aproximadamente 85-90 GB de VRAM.
- **GPU recomendadas**: para las cuantizaciones mas bajas (Q2_K, Q3_K), una NVIDIA RTX 4090 de 24 GB no es suficiente; se requiere al menos una GPU con 32-48 GB (A6000, L40S) o varias GPUs en paralelo. Para cuantizaciones medias, se recomiendan A100 de 80 GB o H100.
- **Despliegue**: compatible con llama.cpp, Ollama, LM Studio y cualquier runtime que soporte GGUF. Tambien es compatible con endpoints de inferencia segun la etiqueta `endpoints_compatible`.
- **Latencia y throughput**: no se han publicado datos concretos de latencia o throughput para este modelo en particular.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-flash | 124B | 5.1B | 256K (1M) | No disponible | GGUF (esta repo) |
| Ling-2.6 | ~1T | No disponible | No disponible | No disponible | No disponible |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | Safetensors, GGUF |
| Qwen2.5-MoE (si existe) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion mas directa es con Ling-2.6, el modelo insignia del mismo laboratorio, aunque no se dispone de datos publicos de rendimiento para verificar las afirmaciones del proveedor. En el ecosistema MoE open source, el modelo mas comparable en terminos de eficiencia es Mixtral 8x7B, aunque con una diferencia sustancial de parametros y contexto.

## Limitaciones y advertencias

- **Benchmarks no verificados**: las afirmaciones de rendimiento son del proveedor y no estan respaldadas por una tabla publica de resultados.
- **Licencia no especificada**: no se indica la licencia del modelo, lo que supone un riesgo para su uso en entornos de produccion comercial. Es necesario contactar con inclusionAI para aclarar las condiciones de uso.
- **Idiomas no documentados**: no se especifica que idiomas soporta el modelo, aunque por su origen es probable que tenga un buen soporte de chino e ingles.
- **Sesgos y alucinaciones**: no hay informacion disponible sobre sesgos conocidos ni evaluaciones de alucinacion.
- **Documentacion limitada**: no se han publicado detalles tecnicos sobre el entrenamiento, el dataset, ni el proceso de alineacion.
- **Riesgo de obsolescencia**: al ser una distribucion GGUF de un modelo reciente, es posible que las cuantizaciones no esten optimizadas para todas las arquitecturas de hardware.

## Enlaces

- Repositorio GGUF de esta ficha: https://huggingface.co/mradermacher/Ling-3.0-flash-GGUF
- Repositorio del modelo original (inclusionAI): https://huggingface.co/inclusionAI/Ling-3.0-flash
- Espejo GGUF de AtomicChat: https://huggingface.co/AtomicChat/Ling-3.0-flash-GGUF
- Documentacion oficial del modelo: https://developer.ant-ling.com/en/docs/models/ling/
- Ficha en LLM Releases: https://www.llm-releases.com/models/ling-3-0-flash
- Ficha en Benchable: https://benchable.ai/models/inclusionai/ling-3.0-flash-20260723
- Solicitud de cuantizacion en mradermacher: https://huggingface.co/mradermacher/model_requests/discussions/2824
