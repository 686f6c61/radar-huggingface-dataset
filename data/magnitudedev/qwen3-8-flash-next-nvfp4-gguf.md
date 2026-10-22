# magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF

## Resumen

Este repositorio contiene una conversión a GGUF del modelo `nvidia/Qwen3.8-Flash-Next-NVFP4`, que a su vez es una cuantización NVFP4 del modelo Qwen3.8-Flash-Next desarrollado por el equipo Qwen (Alibaba). La conversión la firma el usuario `magnitudedev` y está pensada para ejecutarse con Magnitude, el runtime de inferencia local del mismo autor, sobre `llama.cpp` en la revisión `18443257a`. No se trata, por tanto, de un modelo entrenado desde cero, sino de un artefacto de distribución cuyo interés es permitir ejecutar un modelo de 176.944.046.976 parámetros totales en hardware de una sola GPU manteniendo los pesos FP4 originales de NVIDIA para los expertos enrutados.

El modelo subyacente es un Mixture-of-Experts con 125.000 millones de parámetros en el modelo principal más 51.000 millones adicionales en embeddings N-gram, con unos 6.000 millones de parámetros activados por token. Esa combinación de muchos parámetros totales y pocos activos es lo que hace viable la inferencia local: el coste por token se parece al de un modelo denso de 6B, mientras que la capacidad se acerca a la de un modelo de la clase 100B+. El repositorio incluye además un proyector multimodal en BF16 (`mmproj-Qwen3.8-Flash-Next-NVFP4-BF16.gguf`), lo que confirma que el modelo base acepta entradas de imagen además de texto.

La relevancia de este artefacto es doble. Por un lado, es una de las primeras distribuciones públicas en combinar expertos NVFP4 (W4A4, con escalas de activación por experto) con capas laterales en Q8_0/Q6_K dentro de un contenedor GGUF, lo que abre la puerta a servir modelos de esta escala en una única GPU Blackwell de 121 GB. Por otro, la licencia combinada NVIDIA Open Model License más Qwen Community License 1.0 introduce obligaciones que conviene revisar antes de cualquier uso comercial, y el número de descargas (51) y likes (0) indica que es un artefacto muy reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (transformer disperso) con tabla de embeddings N-gram; proyector multimodal para visión |
| Parametros totales | 176.944.046.976 (125 B del modelo principal + 51 B de embeddings N-gram) |
| Parametros activos | ~6 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 (W4A4, con escalas de segundo nivel por experto y escalas de activación `.input_scale`); resto de proyecciones en Q8_0 (la model card del blob menciona también Q6_K); tabla N-gram en Q8_0 con escala FP8 aplicada; proyector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License, con términos adicionales de Qwen Community License 1.0 |
| Formato de pesos | GGUF en 3 shards (`Qwen3.8-Flash-Next-NVFP4-0000N-of-00003.gguf`) más proyector GGUF BF16; checksums en `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con 176.944.046.976 parámetros totales y unos 6.000 millones activados por token, según los datos del repositorio oficial de Qwen. La innovación estructural más citada por el equipo Qwen es la incorporación de una tabla de embeddings N-gram de 51.000 millones de parámetros, separada del modelo principal de 125.000 millones; el artefacto GGUF la almacena en Q8_0 con su escala FP8 aplicada, un detalle de conversión que el autor documenta explícitamente. El repositorio de Qwen afirma que, frente a Qwen3.7-Plus, este modelo reduce el coste de entrenamiento e inferencia (el entrenamiento requeriría aproximadamente 1/9 del cómputo) manteniendo o mejorando capacidades, en particular en código. No se dispone del número de tokens de entrenamiento, de la composición del dataset ni de si hubo etapas de RLHF/DPO.

En cuanto a esta conversión concreta, no hay ningún entrenamiento adicional: los expertos enrutados son los pesos NVFP4 de NVIDIA recomprimidos bit a bit, conservando sus escalas de segundo nivel por experto y las escalas de activación por experto. El resto de proyecciones se cuantizan a Q8_0 (o Q6_K) y el proyector multimodal se mantiene en BF16. La conversión se realizó con `llama.cpp` en la revisión `18443257a`, partiendo de la revisión `fc694b54fb0174e0913e6adf86691ef85a4ead47` del modelo NVFP4 de NVIDIA.

## Capacidades

- Generación de texto conversacional: el pipeline declarado en HuggingFace es `conversational`.
- Razonamiento y generación de código: el repositorio de Qwen destaca mejoras en tareas de programación frente a Qwen3.7-Plus, aunque sin cifras publicadas en la información disponible.
- Multimodalidad de entrada: el artefacto incluye un proyector `mmproj` en BF16, lo que indica soporte de imágenes además de texto.
- Eficiencia de inferencia: al activar solo ~6 B de parámetros por token, el coste de cómputo por token es muy inferior al de un denso de 176 B.
- Uso de embeddings N-gram: la tabla N-gram cuantizada forma parte del artefacto y participa en el cálculo de la distribución de salida.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas (el campo de idiomas aparece vacío en la ficha de HuggingFace).
- Modo "thinking" explícito, audio u otras capacidades especiales: no documentado en la información disponible.

## Casos de uso

- Asistente de código en local para equipos con requisitos de confidencialidad: al ejecutarse íntegramente en una GPU propia mediante `llama.cpp` o el runtime Magnitude, el código fuente nunca sale de la infraestructura de la empresa. El tamaño activo de ~6 B mantiene la latencia por token dentro de rangos manejables pese a los 176,9 B totales.
- Servicio de inferencia en una sola GPU Blackwell: la cuantización NVFP4 del modelo base ocupa unos 109 GB y se ha probado con vLLM en una NVIDIA DGX Spark (GB10, sm121) de 121 GB, lo que permite servir el modelo sin clúster multi-GPU.
- Análisis de documentación técnica con diagramas: gracias al proyector multimodal incluido, se pueden enviar capturas de arquitecturas, esquemas eléctricos o tablas escaneadas junto con preguntas en texto.
- Revisión y explicación de repositorios: el modelo puede recibir fragmentos largos de código y documentación y devolver explicaciones o parches; conviene validar empíricamente la ventana de contexto real, que no está publicada.
- Investigación sobre cuantización FP4: el artefacto permite medir el impacto de NVFP4 W4A4 con escalas de activación por experto frente a Q8_0 en las mismas tareas, al conservar los pesos de NVIDIA bit a bit y permitir comparaciones controladas.
- Generación de datos sintéticos y destilación: un modelo de 176,9 B con ~6 B activos puede generar corpus etiquetados a un coste por token contenido, útil para alimentar modelos menores.
- Evaluación de runtimes: sirve como banco de pruebas para verificar la paridad numérica entre `llama.cpp` con soporte NVFP4, vLLM y otros backends sobre el mismo modelo base.
- Sustitución de APIs de terceros en prototipos: para equipos que quieren eliminar dependencia de proveedores cloud en fases de experimentación, con la advertencia de que la licencia condiciona el uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del artefacto no incluye métricas (MMLU, HumanEval, GSM8K u otras), y el repositorio de Qwen únicamente realiza una afirmación cualitativa de mejora en código respecto a Qwen3.7-Plus, sin cifras asociadas. No se deben extrapolar números de otros modelos de la familia.

## Requisitos de hardware

- Tamaño del artefacto: el repositorio ocupa 374,0 GB en total, repartido en tres shards GGUF más el proyector BF16 y los ficheros de checksums. Conviene reservar ese espacio en disco antes de la descarga.
- Modelo base NVFP4 de referencia: unos 109 GB, ejecutable en una GPU de 121 GB (validado en NVIDIA DGX Spark, GB10/sm121) con vLLM. Es la referencia más fiable para estimar la VRAM mínima del modelo cuantizado.
- Modelo original sin cuantizar: 335 GB, lo que exige varias GPU de 80 GB (A100/H100) o equivalente.
- GPU recomendadas: una GPU Blackwell con soporte nativo de FP4 (serie B200/GB200, GB10) es el escenario natural para los expertos NVFP4; para el modelo completo en BF16 harían falta clústeres de A100 80 GB o H100.
- GPU de consumo: el modelo no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB. Solo sería viable con offload parcial a memoria del sistema mediante `llama.cpp`, con una degradación de rendimiento no cuantificada en la información disponible.
- Opciones de despliegue: `llama.cpp` (revisión `18443257a` o superior), runtime Magnitude (que declara soporte para Apple Silicon, NVIDIA, AMD y CPU en su catálogo de modelos), y vLLM para el NVFP4 de NVIDIA. El soporte de Ollama o TGI para este formato concreto no está documentado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (`magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF`) | 176,9 B totales, ~6 B activos | no disponible | GGUF NVFP4 + Q8_0, repo de 374 GB | NVIDIA Open Model License + Qwen Community License 1.0 | HuggingFace, 51 descargas |
| `nvidia/Qwen3.8-Flash-Next-NVFP4` (base) | 176,9 B totales, ~6 B activos | no disponible | NVFP4, ~109 GB | NVIDIA Open Model License | HuggingFace, listo para vLLM |
| Qwen3.8-Flash-Next (original) | 125 B principales + 51 B N-gram, ~6 B activos | no disponible | Pesos sin cuantizar, 335 GB | Qwen Community License 1.0 | HuggingFace / GitHub de Qwen |
| Qwen3.7-Plus (generación anterior) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa de rendimiento entre estas variantes no es posible con la información disponible: no hay benchmarks publicados para ninguna de ellas en las fuentes consultadas.

## Limitaciones y advertencias

- Licencia doble: se aplica la NVIDIA Open Model License y, adicionalmente, los términos de Qwen Community License 1.0. Es imprescindible revisar ambas antes de cualquier despliegue comercial; no es una licencia permisiva tipo Apache 2.0.
- Artefacto sin validación comunitaria: 51 descargas y 0 likes en el momento de la consulta, con una antigüedad de pocos días. No hay informes independientes de calidad ni de paridad numérica frente al modelo base.
- Riesgo de degradación por cuantización: los expertos se ejecutan en NVFP4 W4A4, el nivel más agresivo de la pila. El autor afirma que los pesos son un recomprimido bit a bit, pero no se publican evaluaciones del impacto en precisión.
- Dependencia de hardware específico: los expertos FP4 requieren soporte de FP4 en el backend y la GPU; en hardware sin tensor cores FP4 el rendimiento puede desplomarse o el modelo directamente no arrancar.
- Idiomas no declarados: el campo de idiomas está vacío, por lo que no hay garantía documentada de calidad fuera del inglés o el chino.
- Contexto desconocido: no se publica la longitud de ventana, lo que impide planificar cargas con documentos largos sin medirla empíricamente.
- Ausencia de benchmarks: no se puede afirmar superioridad frente a alternativas de la misma clase; cualquier comparación sería especulativa.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia; no se documentan mitigaciones específicas ni tasas de error.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Tool calling y comportamiento agéntico no documentados: no conviene asumir soporte de function calling sin verificarlo.
- El metadato `inference: false` indica que el repositorio no está pensado para los endpoints de inferencia gestionada de HuggingFace; hay que desplegarlo en infraestructura propia.
- Verificar la integridad con `SHA256SUMS` antes de servir el modelo: son 374 GB en tres shards y una corrupción parcial es difícil de detectar a posteriori.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF
- Model card (README): https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF/blob/main/README.md
- Modelo base cuantizado de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta de despliegue NVFP4 en una sola GPU (vLLM, DGX Spark): https://github.com/starkweatherdigital/qwen3.8-flash-next-nvfp4-recipe
- Runtime Magnitude (GitHub): https://github.com/magnitudedev/magnitude
- Catálogo de modelos de Magnitude: https://magnitude.dev/models
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Licencia Qwen Community License 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
