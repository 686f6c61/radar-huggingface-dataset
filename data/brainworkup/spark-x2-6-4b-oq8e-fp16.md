# brainworkup/Spark-X2.6-4B-oQ8e-fp16

## Resumen

Spark-X2.6-4B-oQ8e-fp16 es una cuantización comunitaria en formato MLX del modelo Spark-X2.6-4B, publicado por el usuario brainworkup (cuantización preparada por xunlinkx) a partir del checkpoint original de XHToken/Spark-X2.6-4B, el modelo base de la familia SparkLLM. Se trata de una versión en 8 bits (oQ8e) destinada a la inferencia local en ordenadores Apple Silicon mediante el framework MLX, que resuelve el problema de ejecutar un modelo de 4 mil millones de parámetros con la máxima precisión posible tras la cuantización sin necesidad de GPU dedicada.

La variante `-fp16` indica que el checkpoint original en BF16 se convirtió a FP16 antes de aplicar la cuantización afín de 8 bits con group size 64 y calibración mejorada del pipeline oMLX (128 muestras de 512 tokens). Es la variante de mayor precisión del conjunto publicado por el autor, a costa de un mayor tamaño de descarga (4,4 GB) y consumo de memoria respecto a las versiones en 4 y 5 bits. El modelo hereda la licencia Apache-2.0 del checkpoint original, lo que permite su uso comercial sin restricciones adicionales. No se dispone de información detallada sobre la arquitectura interna, la longitud de contexto ni los datos de entrenamiento del modelo base en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `spark2_5` (detalles internos no disponibles) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits afín (oQ8e), group size 64, origen FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B utiliza la arquitectura `spark2_5`, sobre la que la documentación disponible no aporta detalles técnicos (número de capas, dimensiones, mecanismos de atención o tipo de tokenizer). La model card del original menciona configuraciones de chat-template y "thinking-budget", lo que sugiere soporte de razonamiento con presupuesto ajustable, aunque estos detalles dependen del runtime empleado y no están documentados en la información disponible.

En cuanto a esta versión concretamente, el checkpoint original en BF16 se convirtió a FP16 antes de la cuantización para maximizar la compatibilidad entre generaciones de Apple Silicon (M1 a M6). La cuantización se realizó con el pipeline oMLX, que aplica calibración mejorada sobre 128 muestras con longitud de secuencia de 512 tokens, cuantización afín uniforme de 8 bits para las capas lineales y group size 64. No se dispone de datos sobre el corpus de entrenamiento, número de tokens ni etapas de alineamiento (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Posible soporte de razonamiento con configuración de "thinking-budget" según la model card del modelo base, sujeto al runtime.
- Ejecución local en Apple Silicon mediante MLX y MLX-LM.
- No hay información disponible sobre capacidades de código, matemáticas, visión, audio, tool calling ni soporte multilingüe explícito.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse íntegramente en la memoria unificada de Apple Silicon, con un pico de memoria de 4,53 GB medido en la validación, lo que lo hace viable incluso en equipos con 8 GB de RAM.
- Prototipado de aplicaciones de chat con privacidad: al correr todo en local mediante MLX-LM, no se envían datos a servicios externos, adecuado para prototipos con datos sensibles.
- Comparación de precisiones de cuantización: al ser la variante de 8 bits de mayor precisión del conjunto, sirve como referencia de calidad frente a las versiones en 4 y 5 bits del mismo autor.
- Desarrollo y pruebas sobre hardware Apple: la compatibilidad con MLX desde M1 hasta M6 permite integrarlo en flujos de desarrollo sin GPU NVIDIA.
- Integración en pipelines de inferencia con oMLX: el `config.json` incluye los metadatos de cuantización, facilitando su carga en runtimes compatibles con la arquitectura `spark2_5`.
- Generación de respuestas cortas y consultas de conocimiento general: la validación incluida demuestra generación básica (ejemplo de pregunta geográfica) con muestreo a temperature 1.0 y top-p 0.95.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única medición incluida es una comprobación básica de carga y generación (smoke check) de 16 tokens, con un pico de memoria de 4,530 GB reportado por MLX; no constituye una comparación de calidad.

## Requisitos de hardware

- VRAM/memoria estimada: pico de 4,53 GB medido por MLX en generación corta; el consumo aumenta con la longitud de contexto y la sobrecarga del runtime. El repositorio ocupa 4,4 GB.
- Hardware objetivo: Macs con Apple Silicon (generaciones M1 a M6) usando MLX; no requiere GPU dedicada.
- Cabe en consumer hardware: sí, cualquier Mac con memoria unificada suficiente (recomendable 8 GB o más).
- Opciones de despliegue: oMLX (recomendado por el autor) y MLX-LM (`mlx_lm.generate`). No consta soporte verificado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| Spark-X2.6-4B-oQ8e-fp16 (este) | 4,11 B | 8 bits (oQ8e, group 64) | MLX/safetensors | Apache-2.0 | no disponible |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | BF16 (sin cuantizar) | no disponible | Apache-2.0 | no disponible |
| Variantes 4-bit y 5-bit del mismo autor | 4,11 B | 4 y 5 bits | MLX/safetensors | Apache-2.0 | no disponible |

Frente a las variantes de 4 y 5 bits, esta versión de 8 bits ofrece la mayor fidelidad al checkpoint original a cambio de un mayor tamaño de descarga y consumo de memoria. No se han incluido modelos de otras familias por falta de datos comparables (contexto, benchmarks) en la información disponible.

## Limitaciones y advertencias

- Es una cuantización comunitaria de xunlinkx, no un lanzamiento oficial de XHToken ni está respaldada por los autores originales.
- No hay benchmarks de calidad publicados; la única validación es un smoke check de 16 tokens, por lo que no se puede garantizar la ausencia de degradación por cuantización.
- La documentación no especifica idiomas soportados, longitud de contexto ni capacidades exactas; conviene consultar la model card del modelo base antes de uso en producción.
- Riesgo de alucinación típico de LLM: no evaluado en la información disponible.
- La carga requiere un runtime con soporte de la arquitectura `spark2_5` (oMLX reciente o MLX-LM compatible); no funcionará en herramientas que no la soporten.
- Los requisitos de memoria crecen con la longitud de contexto; la cifra de 4,53 GB corresponde solo a generación corta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/brainworkup/Spark-X2.6-4B-oQ8e-fp16
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Licencia del modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B/blob/main/LICENSE
- Proyecto oficial Spark-X2.6: https://github.com/XHToken/Spark-X2.6
