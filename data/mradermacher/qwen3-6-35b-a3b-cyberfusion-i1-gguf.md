# mradermacher/Qwen3.6-35B-A3B-CyberFusion-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-CyberFusion-i1-GGUF es una cuantizacion en formato GGUF del modelo Qwen3.6-35B-A3B-CyberFusion, publicada por el usuario mradermacher en Hugging Face. Se trata de un modelo de lenguaje conversacional de arquitectura Mixture of Experts (MoE) con 35.505.251.456 parametros totales, del cual solo una fraccion (los "3B activos" que indica el nombre) se activa por token, lo que permite una inferencia mucho mas eficiente que un modelo denso de ese tamano. El autor original del modelo base es Kernel-Lord, y esta version concreta aplica cuantizacion con imatrix (matriz de importancia) para preservar la calidad en precisiones reducidas.

La relevancia de esta ficha reside en que el repositorio contiene un amplio conjunto de cuantizaciones (desde IQ1_S hasta Q6_K, pasando por Q4_K_M, Q5_K_M e IQ4_XS), lo que permite desplegar un modelo de 35B en hardware de consumo con perdidas controladas de calidad. El sufijo "CyberFusion" sugiere un ajuste orientado a ciberseguridad, aunque la model card no documenta el dataset de entrenamiento ni las capacidades especificas de ese ajuste.

No se dispone de informacion publica sobre licencia, idiomas soportados, pipeline ni resultados de benchmarks en la informacion proporcionada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 7 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, segun nomenclatura Qwen3.6-35B-A3B |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (el nombre indica "A3B", aproximadamente 3B activos, sin confirmacion en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con imatrix) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3.6 con diseno Mixture of Experts: 35.505.251.456 parametros totales con un subconjunto de expertos activados por token (la nomenclatura "A3B" sugiere aproximadamente 3 mil millones de parametros activos, aunque la model card no lo confirma explicitamente). Esta version es una cuantizacion GGUF generada por mradermacher a partir del modelo original de Kernel-Lord, aplicando cuantizacion ponderada con imatrix (matriz de importancia) para minimizar la degradacion de calidad en las precisiones mas bajas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del ajuste "CyberFusion". La model card unicamente documenta los metadatos del proceso de cuantizacion (version 2, tipo de conversion "hf", saltando el modulo mmproj, lo que indica que no se incluye proyector multimodal). El repositorio tiene un tamano de 49,8 GB, coherente con un modelo de 35B cuantizado en multiples precisiones.

## Capacidades

- Generacion de texto conversacional (tag "conversational" en el repositorio).
- Razonamiento y matemeticas: presumiblemente heredadas del modelo base Qwen3.6, aunque no confirmado en la model card.
- Generacion de codigo: no confirmado explicitamente, pero plausible dado el origen Qwen3.6 y el ajuste "CyberFusion".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible; el flag `skip_mmproj: 1` indica que esta version no incluye proyector multimodal.

## Casos de uso

- Despliegue local de un modelo de 35B en hardware de consumo: gracias a las cuantizaciones IQ2/IQ3/Q4, es posible ejecutar el modelo en GPUs con 12-24 GB de VRAM usando llama.cpp u Ollama, algo inviable con el modelo en precision completa.
- Analisis de seguridad y ciberseguridad: el sufijo "CyberFusion" sugiere un ajuste orientado a tareas de seguridad; podria emplearse para revision de configuraciones, analisis de logs o asistencia en tareas de hardening, aunque la model card no documenta este ajuste.
- Asistente conversacional de codigo en IDE: la arquitectura MoE con ~3B parametros activos ofrece baja latencia por token, adecuada para autocompletado y chat interactivo en entornos de desarrollo.
- Procesamiento por lotes en servidores con una sola GPU: la cuantizacion Q4_K_M o Q5_K_M permite servir el modelo con vLLM o llama.cpp server en una A100 40GB o RTX 4090, con throughput superior al de un modelo denso de 35B.
- Experimentacion e investigacion: el amplio abanico de cuantizaciones (24 variantes) permite estudiar el impacto de la precision en tareas especificas y comparar el equilibrio calidad/VRAM.
- Fine-tuning ligero sobre la base cuantizada: aunque el fine-tuning directo sobre GGUF es limitado, el modelo base (Kernel-Lord/Qwen3.6-35B-A3B-CyberFusion) puede usarse para LoRA y luego recuantizarse con el mismo pipeline imatrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (inferencia, segun cuantizacion):
  - IQ1_S / IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: aproximadamente 10-14 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 14-18 GB.
  - IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: aproximadamente 18-24 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 24-28 GB.
  - Q6_K: aproximadamente 28-32 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M; RTX 3090 (24 GB) para Q4/IQ4; A100 40GB o H100 para Q5/Q6; multiples GPUs para precisiones altas si se desea contexto largo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 12-16 GB con IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (soporte GGUF experimental), llama-cpp-python.
- Latencia y throughput: no disponible; la arquitectura MoE con ~3B activos sugiere una velocidad por token notablemente superior a un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-CyberFusion-i1-GGUF (este) | 35,5B totales / ~3B activos | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF | 35,5B totales / ~3B activos | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-i1-GGUF | 35,5B totales / ~3B activos | no disponible | apache-2.0 (segun busqueda) | GGUF/MLX | Hugging Face (mradermacher) |
| Modelo denso de ~30-35B (referencia generica) | 30-35B | variable | variable | safetensors/GGUF | variable |

Las alternativas mas directas son otras cuantizaciones del mismo linaje Qwen3.6-35B-A3B publicadas por el mismo autor, que comparten arquitectura y tamano pero difieren en el ajuste (Brainwaves-Nex, Uncensored, CyberFusion). No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta licencia; no se puede confirmar si el uso comercial esta permitido. Verificar la licencia del modelo base (Kernel-Lord/Qwen3.6-35B-A3B-CyberFusion) antes de usarlo en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; mayor en cuantizaciones muy agresivas (IQ1, IQ2) por perdida de precision.
- Las cuantizaciones por debajo de Q4 pueden degradar notablemente tareas de razonamiento y codigo; para produccion se recomienda Q4_K_M o superior.
- El ajuste "CyberFusion" no esta documentado: no se conocen sus datos de entrenamiento ni si introduce sesgos hacia dominios de seguridad.
- El repositorio tiene 0 descargas y 0 likes; no hay validacion comunitaria de la calidad de las cuantizaciones.
- No incluye proyector multimodal (`skip_mmproj: 1`), por lo que no soporta entrada de imagenes aunque el modelo base pudiera hacerlo.
- Fecha de creacion futura (2026-11-07) respecto a la fecha habitual de consulta; verificar vigencia del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-CyberFusion-i1-GGUF
- Modelo base: https://huggingface.co/Kernel-Lord/Qwen3.6-35B-A3B-CyberFusion
- Cuantizacion alternativa (Brainwaves-Nex): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-i1-GGUF
- Cuantizacion alternativa (Brainwaves-Nex-Uncensored): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-i1-GGUF
