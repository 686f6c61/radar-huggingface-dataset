# chtisgit/Qwen3.6-35B-A3B-2Bit-GSQ-hybrid-GGUF

## Resumen

Este repositorio no contiene un modelo nuevo, sino la conversión a GGUF del checkpoint cuantizado a 2 bits `ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ`, un Qwen3.6 de arquitectura MoE con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones activos por token (designación A3B). La conversión la firma el usuario `chtisgit` y está pensada para su uso directo en llama.cpp, empaquetando los pesos en tipos nativos (`Q2_0` para los expertos enrutados, `Q8_0` para atención, atención lineal, expertos compartidos y LM-head) junto con un proyector visual separado en BF16/F32.

El interés práctico es doble: por un lado, demuestra que un MoE de 35B puede reducirse a un fichero de 11,38 GiB manteniendo el pipeline multimodal `image-text-to-text`; por otro, documenta con precisión el mapeo entre el formato GSQ de 2 bits del DASLab y el tipo `Q2_0` de llama.cpp, una conversión sin dequantizar y requantizar que preserva las asignaciones originales. El resultado es un artefacto de inferencia, no un modelo entrenado ni afinado.

Es relevante ahora porque `Q2_0` es un tipo reciente en llama.cpp (definición y backend CPU en julio de 2026, soporte CUDA a finales de ese mismo mes), y porque permite ejecutar un modelo multimodal de 35B en hardware de consumo con offload parcial. El autor advierte de un fallo de acceso ilegal a memoria en builds CUDA anteriores a b11390 para ciertas longitudes de prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (layout `QWEN35MOE` de llama.cpp), con atención lineal y torre visual Qwen3-VL |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, sin cifra oficial en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en Q2_0 (origen GSQ 2 bits); atención, atención lineal, expertos compartidos y LM-head en Q8_0 (origen INT8); resto en BF16/F32; proyector visual en BF16/F32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.6-35B-A3B-GSQ-hybrid.gguf` + `mmproj-BF16.gguf`) |
| Tamano del fichero de texto | 12.217.776.832 bytes (11,38 GiB) |
| Tamano del proyector | 902.822.432 bytes (861 MiB) |
| Tamano total del repo | 13,1 GB |
| Desglose de tipos (texto) | 120 Q2_0, 251 Q8_0, 61 BF16, 301 F32 |
| Desglose de tipos (proyector) | 110 BF16, 224 F32 |
| Pesos omitidos | Una capa MTP / decodificación especulativa |
| SHA-256 (texto) | `8e50912f5d0703401ca21b09deb2ee8a84d03536ade6fb44815fcb40a0b03596` |
| SHA-256 (proyector) | `97cbba71bcf9d9f4268ce64c2cd32ddd0aaed25fd838f28fc8958e07cb240648` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de Qwen3.6, con atención estándar combinada con capas de atención lineal, expertos compartidos y expertos enrutados. La conversión respeta el layout canónico `QWEN35MOE` de llama.cpp, incluyendo las permutaciones de agregación de expertos y de atención lineal. El checkpoint de origen es una cuantización de 2 bits producida con GSQ (IST-DASLab), con expertos enrutados a 2 bits, pesos de atención y LM-head en INT8 y el resto en BF16. No se dispone de información sobre el entrenamiento original de Qwen3.6 (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada.

La innovación técnica destacable es el mapeo exacto entre el código GSQ de 2 bits y el tipo `Q2_0` de llama.cpp. GSQ representa los enteros {-2, -1, 0, 1} y `Q2_0` los enteros {-1, 0, 1, 2}; invirtiendo el orden de código (`q = 3 - c`) y negando la escala (`d = -s`, almacenada en FP16) los valores escalados coinciden sin dequantizar ni requantizar. Cada grupo GSQ de 128 pesos se convierte en dos bloques `Q2_0` de 64 que comparten escala. Para los pesos INT8, los códigos se copian directamente a bloques `Q8_0` (preservando -128 y +127) y solo se convierte la escala a FP16; según el autor, esta representación directa presentó menor error máximo, MAE, RMSE y error de Frobenius relativo que una dequantización a BF16, además de ahorrar 1.794.048.032 bytes frente a la variante con fallback BF16. La torre visual (333 tensores BF16 en origen) se reparte entre BF16 y F32 según el conversor estándar de Qwen3-VL, con el patch embedding Conv3D temporal convertido a dos Conv2D.

## Capacidades

- Generación de texto conversacional y razonamiento, con pipeline declarado `image-text-to-text`.
- Comprensión de imágenes: el proyector `mmproj-BF16.gguf` habilita entrada multimodal; validado leyendo el texto `MEN WALK ON MOON` de la imagen de prueba de periódico de llama.cpp.
- Ejecución en CPU y con offload parcial a GPU mediante llama.cpp (probado con 20 de 41 capas más el proyector en una RTX 3060).
- Arquitectura MoE con activación dispersa: solo se computa un subconjunto de expertos por token, lo que reduce el coste de inferencia frente a un modelo denso de 35B.
- Soporte de tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Decodificación especulativa vía MTP: no disponible en este GGUF, la capa MTP se omite deliberadamente.

## Casos de uso

- Inferencia local multimodal en estación de trabajo: cargar el GGUF de texto (11,38 GiB) más el proyector (861 MiB) en llama.cpp con offload parcial permite describir imágenes y responder preguntas sobre ellas sin GPU de datacenter; el autor lo validó con 20 de 41 capas en una RTX 3060.
- Prototipado y evaluación de modelos MoE de 35B en hardware de consumo: al ocupar ~12 GiB en disco, cabe en equipos con 16 GB de VRAM o con RAM suficiente para ejecución en CPU, lo que facilita pruebas de concepto sin aprovisionar A100/H100.
- Procesamiento de documentos escaneados y capturas: el pipeline image-text-to-text permite extraer texto de imágenes (como demuestra el test del periódico) y encadenarlo con prompts de resumen o extracción estructurada.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia apache-2.0 del artefacto facilita su integración en productos comerciales, sujeta a las condiciones del modelo base.
- Investigación sobre cuantización extrema: el repositorio sirve como referencia reproducible del mapeo GSQ 2 bits a `Q2_0` y de la conversión INT8 a `Q8_0` sin requantización, útil para estudiar la degradación de calidad a 2 bits en MoE.
- Servicio de chat con contexto multimodal en CPU: usando builds solo-CPU de llama.cpp (no afectadas por el bug CUDA documentado) se puede ofrecer un endpoint conversacional con soporte de imagen en servidores sin GPU.
- Validación de pipelines CI para GGUF: los SHA-256 publicados de ambos ficheros permiten verificar artefactos en pipelines de descarga y despliegue automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las pruebas realizadas son comprobaciones de carga y generación corta, no resultados de benchmark ni de perplejidad.

## Requisitos de hardware

- VRAM/disco para inferencia: el fichero de texto ocupa 11,38 GiB y el proyector 861 MiB; el repo completo son 13,1 GB. Con offload parcial de 20 de 41 capas más el proyector se ejecutó en una RTX 3060 (12 GB), según el autor.
- GPU recomendadas: no hay recomendaciones oficiales en la información disponible; el único hardware documentado es una RTX 3060 con offload parcial. Para carga completa en GPU se necesitaría capacidad de VRAM superior al tamaño del fichero más overhead de contexto/KV cache.
- Cabe en GPU de consumo: sí, al menos con offload parcial en RTX 3060; también funciona en CPU exclusivamente.
- Opciones de despliegue: llama.cpp (librería declarada). Se requiere un build reciente que soporte `Q2_0`: definición y backend CPU desde el commit `bec4772` (nightly b9913, 8 de julio de 2026) y soporte CUDA desde el commit `9b2a088` (30 de julio de 2026). En GPU NVIDIA se debe usar llama.cpp b11390 (4 de octubre de 2026) o posterior.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| chtisgit/Qwen3.6-35B-A3B-2Bit-GSQ-hybrid-GGUF | 34,66B totales (MoE) | no disponible | Q2_0 + Q8_0 + BF16/F32 | apache-2.0 | GGUF | Conversion para llama.cpp, multimodal con mmproj |
| ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ | 34,66B totales (MoE) | no disponible | GSQ 2 bits + INT8 + BF16 | no disponible en la informacion | safetensors (checkpoint de origen) | Modelo base del que deriva esta conversion |
| Qwen3.6-35B-A3B (original) | 34,66B totales (MoE) | no disponible | BF16 y otras | no disponible en la informacion | no disponible | Modelo sin cuantizar del que parte la cadena |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tune: es una conversión de formato; cualquier limitación del checkpoint GSQ de origen se hereda.
- La cuantización a 2 bits de los expertos enrutados implica una pérdida de calidad no cuantificada en la documentación; no hay perplejidad ni benchmarks publicados que la midan.
- Bug conocido en builds CUDA antiguos: con prompts de 230, 344 y 457 tokens se produce "CUDA error: an illegal memory access was encountered". Requiere llama.cpp b11390 o posterior en GPU NVIDIA; los builds solo-CPU no se ven afectados.
- Dependencia de un tipo reciente (`Q2_0`): builds de llama.cpp anteriores a julio de 2026 no pueden cargar ni ejecutar el modelo correctamente.
- La capa MTP (decodificación especulativa) se omite, por lo que no se puede aprovechar esa aceleración.
- Idiomas soportados no declarados: riesgo de comportamiento irregular fuera de los idiomas cubiertos por el modelo base.
- Riesgo de alucinación inherente a los modelos generativos, agravado potencialmente por la cuantización agresiva; no hay evaluación específica.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia apache-2.0 para el artefacto; conviene verificar las condiciones del modelo base Qwen3.6 antes de uso comercial en producción.
- Las validaciones del autor son pruebas de carga y generación corta, no una evaluación funcional completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chtisgit/Qwen3.6-35B-A3B-2Bit-GSQ-hybrid-GGUF
- Modelo base (checkpoint GSQ): https://huggingface.co/ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ
- Revisión fijada del checkpoint: https://huggingface.co/ISTA-DASLab/Qwen3.6-35B-A3B-2Bit-GSQ/tree/543019cbe7d10f6d2e78d4017606a42bd50ea7e9
- Código GSQ (IST-DASLab): https://github.com/IST-DASLab/GSQ/commit/03fc16484c369e3127225615d5e03e8d3a6043e3
- llama.cpp (revisión de referencia): https://github.com/ggml-org/llama.cpp/commit/911f6cdc8ab8a530b2bee09ee61471a6f3178eeb
- Commit de definición de Q2_0 y backend CPU: https://github.com/ggml-org/llama.cpp/commit/bec4772f6a2527d371557b5d2032641e5ff7619c
- Nightly b9913 (primer build con Q2_0): https://github.com/ggml-org/llama.cpp/releases/tag/b9913
- Commit de soporte CUDA para Q2_0: https://github.com/ggml-org/llama.cpp/commit/9b2a088819cda774bdbf713168ee1eee8498cda5
- Fix del fallo CUDA en prompts largos (PR #29941): https://github.com/ggml-org/llama.cpp/pull/29941
- Imagen de prueba multimodal de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/911f6cdc8ab8a530b2bee09ee61471a6f3178eeb/tools/mtmd/test-1.jpeg
- Paper de referencia GSQ: arXiv:2604.18556 (identificador citado en los tags del repositorio; URL directa no disponible en la información proporcionada)
