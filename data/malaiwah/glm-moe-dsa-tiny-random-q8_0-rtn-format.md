# malaiwah/glm-moe-dsa-tiny-random-q8_0-rtn-format

## Resumen

Este repositorio contiene un artifact de formato y almacenamiento llamado `glm-moe-dsa-tiny-random-q8_0-rtn-format`, creado por `malaiwah`. No es un modelo de lenguaje entrenado, sino un fixture de toolchain: un checkpoint aleatorio de tamaño minúsculo, cuantizado a q8_0 mediante redondeo al más cercano (RTN), para inspeccionar empaquetado, reconstrucción y fidelidad entre representaciones de pesos. El modelo base es `glm-moe-dsa-tiny-random-bf16`, con arquitectura GLM MoE DSA: 4 capas decoder, atención MLA, 8 expertos enrutados (top-2) más un experto compartido, y cabeza de vocabulario sin atar. Los pesos no están entrenados; el optimizador no se ejecutó. Según HuggingFace, tiene 284.568 parámetros totales; no hay datos de contexto ni de idiomas, porque no es un asistente funcional. Su relevancia es la reproducibilidad: permite validar lectores GGUF, depurar cargas de tensores y comparar cuantizaciones sin descargar modelos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLM MoE DSA (Transformer con capas densa y MoE, atención MLA) |
| Parámetros totales | 284.568 |
| Parámetros activos | no disponible (MoE con 8 expertos enrutados top-2 y 1 experto compartido) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8_0 (round-to-nearest, RTN) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (q8_0); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura GLM MoE DSA, que combina capas densas y capas de mezcla de expertos (MoE) con atención de latente múltiple (MLA) e indexadores DSA. La model card detalla que incluye cuatro capas de decoder de texto: una densa y tres MoE, con 8 expertos enrutados y selección top-2, más un experto compartido, y una cabeza de vocabulario sin atar. Los búferes de enrutador en FP32 se conservan de forma nativa; no se incluye MTP. No hay datos de entrenamiento reales: el checkpoint se inicializó aleatoriamente y el optimizador no se ejecutó (etiqueta `optimizer-not-run`). La cuantización es una intervención de almacenamiento con redondeo al más cercano (RTN), sin optimización GPTQ/AWQ/ModelOpt ni calibración. La model card reporta 277.824 parámetros generados antes del empaquetado, mientras que los metadatos de HuggingFace indican 284.568 parámetros totales en safetensors. La innovación no está en el modelo en sí, sino en su propósito como fixture de reproducibilidad para probar decodificadores de almacenamiento y comparaciones de fidelidad.

## Capacidades

- Generación de texto: no disponible; los pesos aleatorios no producen texto con calidad semántica.
- Razonamiento, código, matemáticas o visión: no disponible; el modelo no ha sido entrenado.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponible; no hay datos de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Función real: sirve como fixture para inspeccionar empaquetado, reconstrucción, contabilidad de alcance y comparaciones de fidelidad entre representaciones de pesos.

## Casos de uso

- Pruebas de decodificación de GGUF: el modelo permite verificar que un lector GGUF lea correctamente los pesos q8_0 empaquetados, comparando la reconstrucción BF16 con el checkpoint base.
- Depuración de cargadores de tensores: sirve como caso mínimo para reproducir errores de carga estricta de tensores, sin descargar un modelo grande.
- Desarrollo de adaptadores de modelos: ayuda a probar adaptadores de familias de modelos, validando la correspondencia de arquitectura y pesos sin asumir capacidades de lenguaje.
- Reproducibilidad de resultados: se puede fijar un artifact y reproducir un resultado estrechamente definido, como la comparación de fidelidad del panel de tokens sintéticos.
- Comparación de fidelidad de cuantizaciones: permite medir el KL entre la salida del checkpoint base y la del cuantizado, utilizando el panel sintético incluido, para evaluar el error de reconstrucción.
- Validación de empaquetado de pesos: se puede usar para inspeccionar el conteo de elementos empaquetados y la correspondencia con los parámetros del modelo, como parte de un pipeline de CI para herramientas de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye un resultado propio de comparación de fidelidad:

| Métrica | Valor |
|---|---|
| Media de KL(referencia ∥ candidato) | 8.811746477603488e-05 nats |
| Posiciones puntuadas | 252 (panel sintético, no datos de benchmark) |
| Acuerdo top-1 | 0.9365079365079365 (solo en este panel) |
| Comparabilidad | advisory; las omisiones de reconstrucción/activación siguen vigentes |

## Requisitos de hardware

- VRAM estimada: no aplicable; el modelo tiene 284.568 parámetros y su tamaño serializado es de 321.696 bytes (0,307 MiB), por lo que cabe en cualquier CPU sin necesidad de GPU.
- GPU recomendada: ninguna; el fixture está pensado para ejecutarse en CPU.
- Compatibilidad con GPU de consumo: no es necesario, aunque podría cargarse en cualquier GPU; no hay garantía de paridad de kernels de servicio.
- Opciones de despliegue: puede cargarse con herramientas que lean GGUF, como llama.cpp, Ollama o vLLM, aunque no se recomienda para inferencia real por ser un modelo no entrenado.
- Latencia y throughput: no disponibles; no se han publicado mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

No existen modelos comparables en la categoría de modelos funcionales, ya que este es un fixture no entrenado. La comparación relevante es con el checkpoint base y otros miembros de la familia de cuantizaciones:

| Modelo | Parámetros | Cuantización | Licencia | Propósito |
|---|---|---|---|---|
| malaiwah/glm-moe-dsa-tiny-random-bf16 | 277.824 (según model card) | BF16 (sin cuantizar) | MIT | Checkpoint base de referencia |
| malaiwah/glm-moe-dsa-tiny-random-q8_0-rtn-format | 284.568 (según HuggingFace) | q8_0 RTN | MIT | Fixture de almacenamiento cuantizado |

La model card indica que hay 8 derivados en esta familia, pero no se proporcionan especificaciones completas de cada uno. No se pueden comparar con modelos de lenguaje reales porque este no está entrenado.

## Limitaciones y advertencias

- Sesgos conocidos: no aplicable; el modelo no ha sido entrenado con datos, por lo que no se pueden evaluar sesgos.
- Riesgo de alucinación: no aplicable como modelo de lenguaje; cualquier texto generado carece de sentido semántico.
- Limitaciones de contexto o idioma: no disponible; el fixture usa un tokenizador de 260 tokens independiente, no el vocabulario original del modelo base.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo no es apto para producción.
- Caveats importantes: los pesos son aleatorios y no entrenados; la cuantización RTN no es optimización ni calibración; no hay paridad con kernels GPU/NPU; la reconstrucción en CPU no ejecuta el GEMM empaquetado original; no hay garantía de determinismo entre hardware.

## Enlaces

- HuggingFace: https://huggingface.co/malaiwah/glm-moe-dsa-tiny-random-q8_0-rtn-format
- Modelo base: https://huggingface.co/malaiwah/glm-moe-dsa-tiny-random-bf16
- Colección de familias de cuantización de pesos coincidentes: https://huggingface.co/collections/malaiwah/qfs-matched-weight-quantization-families-6a9f071d93dbd3dbf0a1e844
- Dataset raíz de fidelidad: https://huggingface.co/datasets/malaiwah/glm-moe-dsa-tiny-fidelity-root-v1
- Paquete de evidencia de almacenamiento: https://huggingface.co/datasets/malaiwah/qfs-existing-tiny-cpu-format-v1
- Recibo de comparación: https://huggingface.co/datasets/malaiwah/qfs-existing-tiny-cpu-format-v1/blob/2b5c947281a92d1f104ee17fdcc44a0104768a45/raw/candidates/q8_0/evidence/comparison-q8_0/comparison-receipt.json
