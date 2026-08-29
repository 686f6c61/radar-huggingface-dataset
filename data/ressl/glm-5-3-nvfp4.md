# ressl/GLM-5.3-NVFP4

## Resumen

GLM-5.3-NVFP4 es una cuantización del modelo GLM-5.3 de Z.AI, publicada por el usuario ressl en HuggingFace. GLM-5.3 es un modelo de lenguaje de arquitectura MoE con atención dispersa (sparse attention) estilo DeepSeek, con 753 mil millones de parámetros totales y aproximadamente 40 mil millones activos por token. Este checkpoint concreto reduce el peso original en BF16 de 1506,7 GB a 465 GB mediante cuantización NVFP4 de los expertos enrutados, manteniendo el resto de componentes en BF16. El objetivo es permitir la ejecución del modelo en hardware Blackwell (SM120) con un consumo de VRAM significativamente menor, usando SGLang o vLLM como motores de inferencia.

La relevancia de este modelo radica en que GLM-5.3 es, según Z.AI y Unsloth, el modelo de pesos abiertos más capaz en tareas de programación compleja y agentes autónomos, con una ventana de contexto de 1.048.576 tokens. Esta cuantización sigue la misma receta que la oficial nvidia/GLM-5.2-NVFP4, por lo que se espera una degradación de rendimiento inferior al 1% respecto al original, aunque no se han publicado mediciones específicas para este export. El modelo está pensado para despliegues en producción con múltiples GPUs Blackwell, no para equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención dispersa (DeepSeek-style sparse attention), 78 capas transformer, 256 expertos enrutados por capa, capa 78 MTP/nextn para decodificación especulativa |
| Parametros totales | 753B (según modelo card); 390.942.074.880 según safetensors |
| Parametros activos | ~40B |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (solo pesos de expertos enrutados, gate/up/down), BF16 para atención, router, embeddings, LM head y capa MTP |
| Idiomas soportados | Inglés, chino |
| Licencia | glm-5.3 (licencia propia de Z.AI, no open source estándar) |
| Formato de pesos | safetensors (163 shards, 232.385 tensores indexados), compatible con SGLang y vLLM mediante `modelopt_fp4` |

## Arquitectura y entrenamiento

GLM-5.3 mantiene la arquitectura base de GLM-5.2: 78 capas transformer con 256 expertos enrutados por capa MoE, atención dispersa con un indexador top-k de 2048 tokens (patrón `index_topk_freq=4` / `index_skip_topk_offset=3`), y una capa adicional (capa 78) dedicada a decodificación especulativa MTP (multi-token prediction). Según Z.AI, todas las mejoras de GLM-5.3 respecto a GLM-5.2 provienen del post-entrenamiento, no de cambios arquitectónicos.

Este checkpoint concreto no es un entrenamiento nuevo, sino una cuantización weight-only realizada con NVIDIA ModelOpt (revisión `0.46.0.dev65+g977d34dc3`). La receta cuantiza únicamente los 57.600 tensores de proyección de expertos enrutados (75 capas MoE × 256 expertos × gate/up/down) usando `NVFP4QTensor` con bloques de 16 valores, escalado de dos niveles (escala global FP32 compartida para gate/up, escala propia para down) y algoritmo de máximo, sin dataset de calibración. El resto de componentes (atención, indexador DSA, router, expertos densos y compartidos, embeddings, LM head, capa 0 y capa MTP) se mantienen en BF16. La conversión se realizó en 292 segundos con 3 GPUs RTX PRO 6000 Blackwell de 96 GB, transmitiendo los shards de forma secuencial.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino, con ventana de contexto de 1.048.576 tokens.
- Programación avanzada: GLM-5.3 es descrito por Z.AI como el modelo de pesos abiertos más capaz en coding, con una mejora del 50% sobre GLM-5.2 en su benchmark interno Z.ai Code Bench.
- Soporte de tool calling y function calling: el perfil de SGLang incluye `--tool-call-parser glm47` y `--reasoning-parser glm45`, lo que indica compatibilidad con el formato de herramientas de GLM.
- Capacidades de agente y razonamiento multi-paso: el modelo destaca en tareas de largo horizonte, con resultados SOTA en Terminal Bench 3.0 y Agents' Last Exam según Unsloth.
- Decodificación especulativa MTP: los pesos de la capa 78 se conservan en BF16, aunque el soporte en SGLang requiere un fork parcheado.
- Multilingüe limitado a inglés y chino; no se mencionan otros idiomas en la documentación.

## Casos de uso

- Ingeniería de software compleja: el modelo puede generar, refactorizar y depurar código en repositorios grandes, aprovechando su contexto de 1M tokens para analizar proyectos completos. Es adecuado para integrarse en entornos de desarrollo con asistencia de IA.
- Agentes autónomos de larga duración: gracias a su capacidad de razonamiento multi-paso y tool calling, puede ejecutar tareas que requieren planificación, uso de herramientas externas y seguimiento de estado durante cientos de pasos, como automatización de pruebas o gestión de incidencias.
- Atención al cliente con contexto extenso: con 1M tokens de ventana, puede mantener conversaciones con historiales muy largos, resúmenes de interacciones previas y documentación de producto, en inglés o chino.
- Generación de código en producción: el soporte de tool calling permite conectarlo a APIs de compilación, ejecución de tests o sistemas de CI/CD, generando código con verificación automática.
- Análisis y mantenimiento de código legacy: su contexto largo y capacidad de razonamiento permiten procesar archivos de código extensos, identificar patrones, documentar funciones y proponer migraciones.
- Investigación en IA: como modelo de referencia de código abierto (con licencia restringida), sirve para experimentos de alineación, evaluación de agentes y estudios de eficiencia de cuantización NVFP4 en arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este export concreto. El modelo card indica explícitamente que no se ha ejecutado ninguna evaluación sobre este checkpoint. Como referencia, el modelo hermano nvidia/GLM-5.2-NVFP4 (misma arquitectura y misma receta de cuantización) mostró una degradación inferior al 1% en benchmarks comunes respecto al original BF16, pero ese dato no debe tratarse como medición de este modelo. Para el GLM-5.3 sin cuantizar, Z.AI reporta mejoras del 50% sobre GLM-5.2 en su benchmark interno de código, y Unsloth menciona SOTA en Terminal Bench 3.0 y Agents' Last Exam, pero no se proporcionan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 465 GB en disco (433 GiB), por lo que se necesitan al menos 465 GB de VRAM agregada para cargar los pesos, más espacio para KV cache y activaciones. El perfil de producción validado usa 7 GPUs RTX PRO 6000 Blackwell de 96 GB (672 GB totales) con pipeline parallelism.
- GPUs compatibles: exclusivamente arquitecturas Hopper o Blackwell con compute capability 9.0 o superior. Se ha validado en SM120 (RTX PRO 6000 Blackwell). Ampere y anteriores no pueden ejecutar este checkpoint.
- No cabe en GPUs de consumo: ninguna tarjeta consumer actual (RTX 4090, RTX 5090) tiene suficiente VRAM para este modelo, incluso cuantizado.
- Opciones de despliegue: SGLang (perfil recomendado con `--quantization modelopt_fp4`, pipeline parallelism 7 GPUs, KV cache BF16) y vLLM (con `--quantization modelopt`, contexto reducido a 131072 tokens). También es posible usar llama.cpp con GGUF dinámicos de Unsloth, aunque no se documenta en este repo.
- Latencia y throughput: no se han publicado mediciones para este export. El modelo card advierte que el KV cache FP8 declarado en la configuración reduce el throughput de decodificación en un 75% en el modelo hermano GLM-5.2, por lo que se recomienda usar BF16 para el KV cache.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-NVFP4 (este repo) | 753B total, ~40B activos | 1.048.576 | NVFP4 (expertos) | glm-5.3 | HuggingFace |
| nvidia/GLM-5.2-NVFP4 | 753B total, ~40B activos | 1.048.576 | NVFP4 (expertos) | glm-5.2 | HuggingFace |
| zai-org/GLM-5.3-BF16 | 753B total, ~40B activos | 1.048.576 | BF16 | glm-5.3 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo porque no se dispone de datos contrastados con otros MoE de tamaño similar (como DeepSeek-V3 o Qwen3-MoE) en la información proporcionada. La diferencia principal entre este repo y el oficial de NVIDIA es el autor y la validación: el export de ressl no ha sido probado en producción, mientras que el de NVIDIA sí. Respecto al BF16 original, la ventaja es el tamaño (465 GB frente a 1506,7 GB) a costa de una posible degradación mínima de rendimiento.

## Limitaciones y advertencias

- Este export no ha sido validado en SGLang ni vLLM; el comando de despliegue recomendado se basa en el perfil de producción de GLM-5.2-NVFP4 y se espera que funcione, pero no está confirmado.
- El KV cache FP8 declarado en `hf_quant_config.json` es problemático: en el modelo hermano GLM-5.2 redujo el throughput de decodificación en un 75%. Se recomienda usar BF16 para el KV cache.
- La decodificación especulativa MTP requiere un fork parcheado de SGLang; en builds estándar debe desactivarse.
- Hardware restringido: solo funciona en GPUs Hopper/Blackwell (compute capability 9.0+). No es compatible con Ampere ni arquitecturas anteriores.
- Licencia glm-5.3: es una licencia propia de Z.AI con restricciones de uso comercial. No es una licencia open source estándar (Apache/MIT). Hay que revisar los términos antes de usarlo en producción.
- Idiomas limitados a inglés y chino; no hay soporte documentado para otros idiomas.
- Riesgo de alucinación inherente a modelos de lenguaje de gran tamaño, especialmente en tareas de razonamiento multi-paso donde los errores pueden propagarse.
- No se han realizado evaluaciones de sesgos ni de seguridad específicas para este checkpoint cuantizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ressl/GLM-5.3-NVFP4
- Modelo base (BF16): https://huggingface.co/zai-org/GLM-5.3-BF16
- Blog de Z.AI sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentación de Z.AI para GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Guía de Unsloth para ejecutar GLM-5.3 localmente: https://unsloth.ai/docs/models/glm-5.3
- Blog de Inco AI sobre soporte day-0 para GLM 5.3: https://inco.ai/blog/glm-5-3/
- Repo de referencia nvidia/GLM-5.2-NVFP4 (mencionado en el modelo card, sin URL directa en la información proporcionada)
