# jan1k/Genesis3.6-35B-A3B-Uncensored-NVFP4-GGUF

## Resumen

Genesis3.6-35B-A3B-Uncensored-NVFP4-GGUF es una re-cuantización en formato NVFP4 (GGUF) del modelo Genesis3.6-35B-A3B-Uncensored, publicado por el usuario jan1k sobre el trabajo original de LuffyTheFox. Se trata de un modelo de lenguaje de arquitectura híbrida MoE (mezcla de expertos) con capacidades multimodales, derivado de la familia `qwen35moe`, que combina capas de atención completa con capas DeltaNet/SSM. El modelo cuenta con 34.660.610.688 parámetros totales (aproximadamente 35B) y unos 3B parámetros activos por token, de ahí la denominación A3B.

El objetivo de esta publicación es ofrecer una versión cuantizada a 4 bits (NVFP4) que reduzca el peso del modelo de los 36,9 GB del Q8_0 original a unos 20 GB, manteniendo la coherencia en texto y visión. Incorpora escalas NVFP4 inline (UE4M3) para maximizar la compatibilidad con runtimes que no soportan tensores de escala separados, e incluye un proyector de visión F16 independiente para el procesamiento de imágenes.

La relevancia actual radica en que permite ejecutar un modelo MoE multimodal de 35B con contexto de 262.144 tokens en GPUs de consumo (por ejemplo, una RTX 3090 con offload parcial de expertos a RAM), algo impensable con los pesos originales en Q8_0. La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza "uncensored" del modelo exige evaluaciones de seguridad adicionales antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35moe` híbrida MoE: 40 capas (30 DeltaNet/SSM + 10 de atención completa cada 4 capas), 256 expertos, 8 activos + experto compartido |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B (denominación A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (pesos principales), F32 (normas, estado SSM, router), F16 (tensores sensibles, `shexp`, `attn_k/v`, `ssm_beta`, `token_embd`, `blk.0`, `blk.13`), Q6_K (`output.weight`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`file_type=39`, escalas NVFP4 inline UE4M3); proyector de visión F16 en GGUF separado |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida denominada `qwen35moe`, compuesta por 40 capas en las que 30 son capas DeltaNet/SSM (State Space Model) y 10 son capas de atención completa que se intercalan cada cuatro capas. Esta combinación busca reducir el coste computacional y de memoria del mecanismo de atención en contextos largos, manteniendo la capacidad de modelado de dependencias globales. La capa MoE contiene 256 expertos con 8 activos por token más un experto compartido, lo que da lugar a los ~3B parámetros activos sobre un total de ~35B.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF, DPO o similares en la información proporcionada. La model card únicamente documenta el proceso de cuantización: una conversión directa en un solo paso de Q8_0 a NVFP4 mediante una build de `llama-quantize` derivada de llama.cpp, con escalas NVFP4 inline (UE4M3), sin uso de imatrix, y una lista de 470 reglas de override por tensor que mantienen en F32 o F16 los tensores sensibles a la degradación (normas, estado SSM, router, embeddings, capas `blk.0` y `blk.13` propensas al colapso singular). El resultado son 733 tensores: ~230 en NVFP4, ~325 en F32, ~175 en F16 y 1 en Q6_K. Esta versión final no incluye capas MTP/NextN, a diferencia de la variante anterior Hermes-MTP.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, verificado con salidas coherentes y aritmética correcta en `llama-server`.
- Procesamiento de visión mediante el proyector `mmproj-Genesis3.6-35B-A3B-Uncensored-F16.gguf`, con captioning de imágenes funcional según las pruebas del autor.
- Razonamiento aritmético básico verificado en las pruebas de validación.
- Soporte de contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Naturaleza "uncensored": el modelo no aplica los filtros de rechazo habituales, lo que amplía el rango de respuestas pero incrementa el riesgo de contenido inapropiado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integración con infraestructuras de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a su ventana de 262.144 tokens, útil en atención al cliente con historiales largos o análisis de contratos.
- Análisis de imágenes con descripción automática: mediante el proyector F16 se pueden generar descripciones (captioning) de imágenes, aplicable a indexación de archivos multimedia o accesibilidad.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización NVFP4 permite ejecutar el modelo en una RTX 3090 con offload parcial de expertos a RAM (~11 GB VRAM, ~18 GB RAM), lo que habilita prototipado local sin infraestructura de datacenter.
- Investigación sobre modelos sin censura: útil para estudiar comportamientos del modelo en dominios donde los filtros de seguridad limitan la evaluación, siempre con las salvaguardas adecuadas.
- Procesamiento de documentación técnica extensa: la combinación de contexto largo y capacidades multimodales permite resumir manuales con figuras o extraer información de informes con imágenes.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material editorial donde se requiere libertad expresiva, con revisión humana posterior.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de NVFP4 frente a Q8_0 en arquitecturas MoE híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta verificaciones cualitativas: salida de razonamiento coherente, aritmética correcta y captioning de imágenes funcional, probadas con `llama-server` en Ampere (RTX 3090 / 3080 Ti).

## Requisitos de hardware

- VRAM estimada para inferencia: ~24 GB para offload completo en GPU (incluyendo proyector mmproj y KV cache); ~11 GB de VRAM con ~18 GB de RAM si se mantienen los expertos MoE en CPU (`--n-cpu-moe 40`).
- GPU recomendadas: RTX 3090 y RTX 3080 Ti verificadas por el autor; para offload completo se requiere una GPU con al menos 24 GB (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con offload completo, o en GPUs con menos VRAM mediante offload parcial de expertos a RAM.
- Opciones de despliegue: `llama-server` de llama.cpp (build reciente con soporte `qwen35moe` y `file_type 39` NVFP4); otros runtimes con soporte NVFP4 y `qwen35moe` podrían funcionar, pero no se documentan.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Genesis3.6-35B-A3B-Uncensored-NVFP4-GGUF (este) | ~35B | ~3B | 262.144 | NVFP4 GGUF (~20 GB) | Apache 2.0 | Hugging Face |
| Genesis3.6-35B-A3B-Uncensored-GGUF (base, LuffyTheFox) | ~35B | ~3B | 262.144 | GGUF Q8_0 (36,9 GB) | Apache 2.0 | Hugging Face |
| Modelos `qwen35moe` de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otras familias MoE híbridas (por ejemplo, variantes Qwen MoE o modelos SSM híbridos) no está disponible en la información proporcionada. La principal diferencia frente al modelo base es el tamaño en disco (20 GB frente a 36,9 GB) y la compatibilidad con runtimes sin tensores de escala separados.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o peligroso; requiere moderación externa en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados no documentados: se desconoce el rendimiento en castellano y en idiomas distintos del inglés.
- La cuantización NVFP4 puede degradar la calidad frente al Q8_0 original; el autor no publica métricas de perplejidad ni comparativas de calidad.
- Requiere una build reciente de llama.cpp con soporte `qwen35moe` y `file_type 39`; runtimes desactualizados no cargarán el modelo.
- Sin capas MTP/NextN en esta versión final, lo que puede afectar a la velocidad de decodificación especulativa frente a variantes anteriores.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de información sobre el dataset de entrenamiento impide verificar el cumplimiento de derechos de autor de los datos originales.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/jan1k/Genesis3.6-35B-A3B-Uncensored-NVFP4-GGUF
- Modelo base: https://huggingface.co/LuffyTheFox/Genesis3.6-35B-A3B-Uncensored-GGUF
- Perfil del autor original: https://huggingface.co/LuffyTheFox
- llama.cpp (runtime requerido): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
