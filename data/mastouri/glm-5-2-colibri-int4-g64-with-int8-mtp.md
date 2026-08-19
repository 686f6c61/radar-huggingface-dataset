# mastouri/GLM-5.2-colibri-int4-g64-with-int8-mtp

## Resumen

GLM-5.2-colibri-int4-g64-with-int8-mtp es una conversión cuantizada del modelo GLM-5.2 (744B MoE) de zai-org, preparada específicamente para el motor de inferencia streaming colibri. El autor, mastouri, ha convertido los pesos originales FP8 a un formato int4 con escalas por grupo (group size 64) para los expertos, manteniendo la cabeza MTP (Multi-Token Prediction) en int8 para decodificación especulativa. El resultado es un contenedor de 429 GB que permite ejecutar un modelo de 744B parámetros en hardware de consumo mediante streaming desde NVMe.

La relevancia de este modelo radica en que resuelve el problema de ejecutar modelos MoE de gran escala en GPUs con poca memoria. Frente a la cuantización per-row int4, la versión con escalas agrupadas (g64) ofrece una calidad mediblemente superior: hellaswag acc_norm de 87.0% frente a 83.5% en la comparativa A/B del propio motor. Además, la cabeza MTP en int8 alcanza tasas de aceptación de drafts del 39-59%, frente al ~0% de las cabezas MTP cuantizadas a int4. El modelo está validado como token-exacto contra el oráculo de transformers (32/32) y ha sido reproducido de forma independiente como solución al fallo de bucles de razonamiento y hambruna de EOS en colibri.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 744B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con escalas por grupo (group size 64) para expertos, int8 para embed/lm_head y cabeza MTP, f32 para normas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (141 shards de 390.5 GB + 1 shard de 9.3 GB para MTP) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.2 de zai-org, un MoE de 744B parámetros totales. La conversión de mastouri mantiene la arquitectura original pero reempaqueta los pesos en formato int4 con escalas por grupo de 64 elementos, lo que reduce el impacto de outliers en la precisión frente a las escalas per-row. La cabeza MTP se mantiene en int8 porque la cuantización int4 de esta cabeza degrada la tasa de aceptación de drafts hasta casi cero, mientras que int8 mantiene una tasa del 39-59%.

El contenedor está diseñado para el motor colibri, que implementa streaming de expertos desde NVMe. Los pesos de los expertos se cargan bajo demanda según la ruta de activación, lo que permite ejecutar el modelo en GPUs con tan solo 16 GB de VRAM. El motor valida el contenedor como token-exacto contra transformers (32/32) y la calidad medida en hellaswag es de 87.0% acc_norm (n=200), superior al 83.5% del contenedor per-row int4 del mismo autor.

No se dispone de información sobre el entrenamiento del modelo base (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto con streaming de expertos desde NVMe, permitiendo ejecutar un modelo de 744B en hardware de consumo.
- Decodificación especulativa mediante cabeza MTP en int8, con tasas de aceptación de drafts del 39-59%.
- Detención fiable de la generación: el contenedor resuelve los bucles de razonamiento y la hambruna de EOS observados con la cuantización per-row int4, incluso con parámetros de muestreo agresivos (TEMP=0.9, NUCLEUS=0.95).
- Compatibilidad con el motor colibri v1.3.0 o superior, incluyendo atención con escalas agrupadas (COLI_CUDA_ATTN=1) y corrección de corrupción de caché de expertos.
- Soporte de cuantización mixta: expertos en int4 g64, embeddings y lm_head en int8, normas en f32.

## Casos de uso

- Inferencia de modelos MoE de gran escala en GPUs de consumo: con 16 GB de VRAM y streaming desde NVMe, es posible ejecutar un modelo de 744B que de otro modo requeriría múltiples GPUs de datacenter. Adecuado para investigación y prototipado en entornos sin acceso a infraestructura HPC.
- Generación de texto con contexto largo en servidores domésticos: el streaming de expertos permite mantener una ventana de contexto amplia sin necesidad de residencia completa de los pesos en VRAM, útil para aplicaciones de análisis de documentos extensos.
- Desarrollo de agentes conversacionales con parada fiable: la resolución del fallo de EOS-starvation hace que el modelo sea adecuado para sistemas que requieren terminación determinista de la generación, como chatbots o asistentes virtuales.
- Evaluación de calidad de cuantización: el contenedor sirve como referencia para comparar estrategias de cuantización (g64 vs per-row) en modelos MoE, con datos medidos de hellaswag y comportamiento de muestreo.
- Despliegue en entornos con restricciones de memoria: la versión E8/IQ3 hermana (289 GB) es una alternativa para hosts donde los expertos no caben completamente en memoria, con un 22-33% más de velocidad en tarjetas de 16 GB.
- Investigación en decodificación especulativa: la cabeza MTP en int8 con tasas de aceptación del 39-59% permite estudiar el impacto de la cuantización en la eficiencia de la decodificación especulativa en modelos MoE.

## Benchmarks y rendimiento

La información disponible incluye datos parciales de benchmarks, medidos por el autor del contenedor y por la comunidad de colibri:

| Benchmark | Resultado | Notas |
|---|---|---|
| Hellaswag acc_norm | 87.0% | n=200, contenedor g64 int4 |
| Hellaswag acc_norm (per-row int4) | 83.5% | n=200, contenedor alternativo |
| Token-exactitud vs transformers | 32/32 | Validación del motor colibri |
| Tasa de aceptacion de drafts MTP | 39-59% | Cabeza MTP en int8 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos presentados provienen de las pruebas del motor colibri y de la comparativa A/B del autor.

## Requisitos de hardware

- VRAM mínima: 16 GB para ejecución con streaming desde NVMe, según las mediciones del autor en tarjetas de 16 GB.
- GPUs validadas: 6x RTX 5090 en pruebas de decodificación con expertos completamente residentes en memoria.
- Almacenamiento: 429.3 GB en disco para los pesos del contenedor; se recomienda NVMe para streaming de expertos.
- Motor de inferencia: colibri v1.5.0 o superior (v1.3.0 es el mínimo funcional; versiones anteriores presentan fallos de carga, atención con escalas incorrectas y corrupción de caché de expertos).
- Opciones de despliegue: colibri con soporte CUDA; no se mencionan alternativas como vLLM, llama.cpp u Ollama en la documentación.
- Rendimiento: con expertos residentes, el coste de decodificación es de 20.9 s por expert-matmul; con streaming desde NVMe y tasa de acierto de expertos inferior al 99%, la versión E8/IQ3 hermana es 22-33% más rápida.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Calidad hellaswag | Licencia |
|---|---|---|---|---|---|
| GLM-5.2-colibri-int4-g64-with-int8-mtp | 744B MoE | int4 g64 + int8 MTP | 429 GB | 87.0% | MIT |
| GLM-5.2-colibri-E8-IQ3-with-int8-mtp | 744B MoE | E8/IQ3 (3.06 bpw) | 289 GB | Sin perdida medible | MIT |
| GLM-5.2-colibri-int4-per-row (mismo autor) | 744B MoE | int4 per-row | no disponible | 83.5% | MIT |

La comparativa se limita a los contenedores del mismo autor para el mismo modelo base, ya que no se dispone de información sobre alternativas de otros desarrolladores. La elección entre el contenedor g64 y el E8/IQ3 depende del hardware: si los expertos no caben completamente en memoria, el E8 es más rápido; si residen en memoria, el g64 tiene mejor coste de decodificación por experto.

## Limitaciones y advertencias

- Seguridad en la carga: el contenedor proviene de un repositorio de terceros y no se puede verificar su integridad desde el lado del usuario. El propio autor advierte que el motor colibri v1.5.0 publicó ocho avisos de seguridad, dos de ellos en el cargador de modelos, con escrituras fuera de límites en el heap antes de la inferencia. Se recomienda ejecutar exclusivamente con versiones parcheadas.
- Dependencia del motor colibri: el contenedor solo funciona con colibri; no es compatible con otros motores de inferencia. Las versiones anteriores a v1.3.0 producen resultados incorrectos (escalas aplicadas per-row en lugar de por grupo, corrupción de caché de expertos).
- Requisitos de almacenamiento: 429.3 GB requieren espacio en disco considerable y un NVMe para un rendimiento aceptable en streaming.
- Información incompleta: no se dispone de datos sobre idiomas soportados, longitud de contexto, parámetros activos ni benchmarks estándar (MMLU, HumanEval, GSM8K).
- Riesgo de alucinación y sesgos: no se ha publicado información específica sobre sesgos o comportamiento alucinatorio del modelo base GLM-5.2 en la documentación del contenedor.
- Uso comercial: la licencia MIT permite uso comercial sin restricciones, pero la dependencia del motor colibri (cuyos términos de licencia no se detallan en la documentación) puede introducir limitaciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mastouri/GLM-5.2-colibri-int4-g64-with-int8-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Motor colibri: https://github.com/JustVugg/colibri
- Contenedor hermano E8/IQ3: https://huggingface.co/mastouri/GLM-5.2-colibri-E8-IQ3-with-int8-mtp
- Issue de mediciones comparativas: https://github.com/JustVugg/colibri/issues/452
- Aviso de seguridad GHSA-wc4x-3786-cxh7: https://github.com/JustVugg/colibri/security/advisories/GHSA-wc4x-3786-cxh7
- Aviso de seguridad GHSA-4gw4-j89j-4c8r: https://github.com/JustVugg/colibri/security/advisories/GHSA-4gw4-j89j-4c8r
