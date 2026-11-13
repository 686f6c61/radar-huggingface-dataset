# slop-shop/gemma-4-E2B-GGUF

## Resumen

`slop-shop/gemma-4-E2B-GGUF` es una cuantización en formato GGUF del modelo `google/gemma-4-E2B`, publicada por el usuario slop-shop. Se trata de una conversión de pesos oficiales a Q4_K_M para su uso con llama.cpp y runtimes compatibles, sin aplicar matriz de importancia (imatrix). El repositorio tiene un tamaño de 3,4 GB y declara licencia Apache 2.0, heredada del modelo base.

El modelo subyacente, Gemma 4 E2B, pertenece a la familia Gemma de Google. El dato real de parámetros almacenados en safetensors es de 4.647.450.147, aunque no se dispone de información publicada en la model card sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni proceso de alineación (RLHF/DPO). La model card del repositorio cuantizado se limita a documentar el procedimiento de conversión y cuantización.

La relevancia de esta ficha radica en que ofrece un artefacto listo para inferencia local en hardware de consumo mediante llama.cpp, pero la información técnica disponible es muy limitada: no hay benchmarks, no se detallan idiomas soportados y no se documentan capacidades específicas más allá de las inferibles del modelo base. Cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E2B; no se detalla transformer, MoE ni híbrida) |
| Parametros totales | 4.647.450.147 (según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única incluida en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde safetensors/bf16) |

## Arquitectura y entrenamiento

No se dispone de información publicada en la model card sobre la arquitectura interna del modelo base `google/gemma-4-E2B`: no se especifica si es un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con state space models ni detalles de atención (atención lineal, ventana deslizante, etc.). Tampoco se documenta el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

Lo único documentado en el repositorio es el proceso de cuantización: la conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp en el tag `b12110`, usando transformers 5.22.2 y salida en bf16; posteriormente se aplicó `llama-quantize` del mismo build con tipo Q4_K_M y sin imatrix. Esta ausencia de imatrix implica que la cuantización es estándar, sin calibración por importancia de pesos, lo que puede traducirse en una pérdida de calidad algo mayor en capas sensibles en comparación con cuantizaciones calibradas.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje, aunque no se documenta explícitamente en la model card.
- Razonamiento y matemáticas: no disponible (sin datos publicados).
- Generación de código: no disponible (sin datos publicados).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo: al estar en formato GGUF Q4_K_M con un tamaño de repo de 3,4 GB, puede cargarse con llama.cpp u Ollama en equipos con GPU de consumo o incluso CPU, permitiendo experimentación sin conexión a servicios en la nube.
- Prototipado rápido de aplicaciones de texto: desarrolladores que necesiten un endpoint local compatible con la API de llama.cpp pueden desplegarlo para pruebas de integración antes de migrar a un modelo mayor o a la versión sin cuantizar.
- Evaluación comparativa de cuantizaciones: útil para medir el impacto de Q4_K_M sin imatrix frente a otras variantes del mismo modelo base, en tareas de generación y perplejidad.
- Despliegue en entornos con recursos limitados: el tamaño reducido permite ejecutarlo en portátiles con 8-16 GB de RAM/VRAM, adecuado para demos y entornos de desarrollo.
- Fines educativos y de investigación: permite estudiar el comportamiento de un modelo Gemma 4 E2B cuantizado en tareas controladas, siempre que se validen los resultados contra el modelo original.
- Integración en pipelines de CI para pruebas de humo: verificar que el artefacto GGUF carga correctamente y produce salidas coherentes antes de publicar versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3-4 GB para el archivo Q4_K_M (repo de 3,4 GB), más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, aunque para este tamaño las consumer son suficientes.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, etc.). También puede ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp (build b12110 o posterior), Ollama (si se importa el GGUF), y otros runtimes compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda llama.cpp.
- Latencia y throughput: no disponible (sin mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| slop-shop/gemma-4-E2B-GGUF | 4,65 B (según safetensors del base) | no disponible | GGUF Q4_K_M | Apache 2.0 | Cuantización sin imatrix |
| google/gemma-4-E2B | 4,65 B | no disponible | safetensors (bf16) | Apache 2.0 | Modelo base original |
| Otras cuantizaciones GGUF del mismo base | 4,65 B | no disponible | GGUF (varios tipos) | Apache 2.0 | No se dispone de comparativas publicadas en la información proporcionada |

No se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización Q4_K_M sin imatrix puede degradar la calidad respecto al modelo en bf16, especialmente en tareas sensibles a precisión (matemáticas, código, razonamiento largo).
- No se documentan sesgos conocidos, pero al no haber información sobre el corpus de entrenamiento no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin benchmarks ni evaluación publicada no puede cuantificarse.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y los idiomas soportados.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base `google/gemma-4-E2B` por si existieran condiciones adicionales no reflejadas en este repositorio.
- El repositorio tiene muy pocas descargas (2) y ningún like, por lo que no hay validación comunitaria de la calidad de la cuantización.
- No se garantiza compatibilidad con versiones de llama.cpp anteriores al tag b12110.
- Para producción, se recomienda validar el modelo cuantizado contra el original en el dominio de aplicación antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/slop-shop/gemma-4-E2B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- llama.cpp (repositorio oficial): https://github.com/ggerganov/llama.cpp
