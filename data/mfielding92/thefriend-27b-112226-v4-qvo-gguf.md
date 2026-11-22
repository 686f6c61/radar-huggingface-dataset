# mfielding92/thefriend-27b-112226-v4-qvo-GGUF

## Resumen

`mfielding92/thefriend-27b-112226-v4-qvo-GGUF` es una publicación de pesos cuantizados en formato GGUF del modelo base `mfielding92/thefriend-27b-112226-v4-qvo`, un modelo de aproximadamente 27.000 millones de parámetros. La cuantización ha sido generada con el método Unsloth Dynamic 2.0 (UD), empleando recetas e imatrix extraídas del repositorio `unsloth/Qwen3.8-27B-GGUF` y aplicando overrides por tensor mediante la opción `--tensor-type` de `llama.cpp`. El autor del modelo base y del espacio de trabajo es el usuario `mfielding92`, un publicador independiente sin tracción pública en el momento de la consulta (0 descargas, 0 likes).

El interés de esta publicación es fundamentalmente práctico: ofrece variantes cuantizadas del modelo en distintos niveles de compresión (Q2 a Q5) para facilitar su despliegue en hardware con VRAM limitada usando `llama.cpp`. No obstante, la información pública disponible es muy escasa: no se especifican arquitectura, contexto, idiomas, licencia ni datos de entrenamiento en la model card, y no hay benchmarks publicados.

Por tanto, esta ficha debe interpretarse como una descripción del artefacto de cuantización y de sus implicaciones de despliegue, no como una evaluación del modelo base, del que no se dispone de documentación técnica verificable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere ~27B parámetros; no confirmado) |
| Parametros totales | ~27B (inferido del nombre; no confirmado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `--ctx-size 16384`) |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-Q3_K_XL, UD-Q4_K_XL, UD-Q5_K_M (Unsloth Dynamic 2.0) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo en el modelo base, presumiblemente) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base: la model card del repositorio GGUF no describe si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO. El único dato técnico relevante es el proceso de cuantización: se han aplicado recetas Unsloth Dynamic 2.0 con una imatrix tomada del repositorio `unsloth/Qwen3.8-27B-GGUF`, lo que sugiere que el modelo base podría compartir linaje o arquitectura con la familia Qwen3.8-27B, aunque esto no está confirmado por el autor.

La cuantización UD aplica distintos niveles de precisión por tensor (per-tensor overrides) mediante `--tensor-type` de `llama.cpp`, una técnica que permite preservar mayor precisión en capas sensibles (por ejemplo, atención o embeddings) mientras se comprime más agresivamente el resto. Esto suele traducirse en una mejor relación calidad/tamaño que una cuantización uniforme del mismo bit-width.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de ~27B, pero no documentada por el autor.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

No se puede confirmar ninguna capacidad específica más allá de la generación de texto genérica, dado que la model card no incluye descripción funcional.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU consumer: las variantes UD-Q3_K_XL y UD-Q4_K_XL permiten ejecutar un modelo de ~27B en GPUs con 16-24 GB de VRAM usando `llama.cpp`, algo inviable con los pesos en fp16.
- Prototipado e investigación de cuantizaciones: útil para comparar la degradación de calidad entre Q2, Q3, Q4 y Q5 sobre el mismo modelo base, aplicando recetas Unsloth Dynamic con imatrix.
- Inferencia offline en entornos sin conectividad: el formato GGUF y `llama.cpp` permiten ejecución en CPU o GPU sin dependencias de servicios en la nube.
- Evaluación comparativa de recetas de cuantización: investigadores pueden medir el impacto de los overrides por tensor frente a cuantizaciones uniformes estándar.
- Integración en pipelines de `llama.cpp` / `llama-server`: el modelo puede servirse mediante la API compatible con OpenAI que ofrece `llama-server`, útil para pruebas de integración.
- Experimentación con contextos de 16K tokens: el ejemplo de la model card fija `--ctx-size 16384`, un punto de partida razonable para tareas de resumen o QA sobre documentos de longitud media, siempre que el modelo base lo soporte.

Advertencia: al no existir documentación sobre licencia ni capacidades, estos casos deben validarse empíricamente antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (inferencia, aproximada, asumiendo ~27B parámetros):
  - UD-Q2_K_XL: ~9-11 GB
  - UD-Q3_K_XL: ~12-14 GB
  - UD-Q4_K_XL: ~16-18 GB
  - UD-Q5_K_M: ~19-21 GB
  - (Estimaciones orientativas; el tamaño exacto de cada fichero no se indica en la model card.)
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5; RTX 4080/4070 Ti Super (16 GB) para Q3/Q4; GPUs de 12 GB para Q2 con contexto reducido.
- Cabe en GPU consumer: sí, en las variantes Q2 a Q4 según VRAM; Q5 requiere 24 GB o descarga parcial a CPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), y por compatibilidad de formato, herramientas que acepten GGUF (Ollama, LM Studio, text-generation-webui), aunque no están mencionadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| thefriend-27b-112226-v4-qvo (este) | ~27B (no confirmado) | no disponible | no disponible | GGUF | Cuantización UD con imatrix de Qwen3.8-27B |
| Qwen3.8-27B (referencia de recetas) | ~27B | no disponible en esta ficha | no disponible | GGUF | Fuente de las recetas UD e imatrix usadas |
| Alternativas de ~27B open source | variable | variable | variable | safetensors/GGUF | No se dispone de datos comparativos verificables |

No es posible establecer una comparativa rigurosa sin datos de arquitectura, contexto, licencia ni benchmarks del modelo base.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay información sobre arquitectura, datos de entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue comercial.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluación, el riesgo es desconocido.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no se pueden anticipar sesgos.
- Trazabilidad limitada: el autor tiene 0 descargas y 0 likes, y el modelo base no está documentado; la reproducibilidad es baja.
- Cuantización agresiva: las variantes Q2 y Q3 pueden degradar notablemente el rendimiento en tareas de razonamiento o código; se recomienda Q4_K_XL o superior para uso serio.
- Fecha de creación anómala (2026-11-22): conviene verificar la integridad y procedencia de los ficheros antes de usarlos.
- Contexto: el ejemplo usa 16K, pero no se confirma el máximo soportado por el modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mfielding92/thefriend-27b-112226-v4-qvo-GGUF
- Modelo base: https://huggingface.co/mfielding92/thefriend-27b-112226-v4-qvo
- Repositorio de recetas e imatrix: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- `llama.cpp`: https://github.com/ggml-org/llama.cpp
