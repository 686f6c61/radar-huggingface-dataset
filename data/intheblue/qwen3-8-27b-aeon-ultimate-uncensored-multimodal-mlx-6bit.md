# intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-6bit

## Resumen

El modelo `intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-6bit` es una cuantización en 6 bits en formato MLX (Apple Silicon) del checkpoint `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, una versión "abliterada" (sin rechazos de contenido) del modelo vision-language Qwen3.8-27B de Qwen. El objetivo es ofrecer un modelo multimodal de 27B parámetros que pueda ejecutarse localmente en Macs con memoria unificada, manteniendo la torre de visión íntegra y añadiendo decodificación especulativa mediante un drafter MTP publicado por separado.

La relevancia actual reside en que Qwen3.8-27B es un modelo denso de última generación con una ventana de contexto nativa de 262K tokens, diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. Esta versión cuantizada permite ejecutarlo en hardware de consumo (Apple Silicon con 48 GB de memoria unificada) sin perder capacidades esenciales, a costa de una pequeña pérdida de precisión inherente a la cuantización RTN de 6 bits.

La arquitectura subyacente es híbrida, combinando atención tradicional con capas Gated DeltaNet, e incluye un mecanismo de predicción multi-token (MTP) que acelera la generación. El modelo es abliterado, lo que significa que se han eliminado los rechazos de contenido, y su licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (hybrid attention con Gated DeltaNet, vision-language, MTP) |
| Parametros totales | 27B (modelo original); 6.346.296.560 parámetros en el archivo safetensors cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | 6-bit (affine, grupo 64, RTN) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida que combina atención estándar con capas Gated DeltaNet, un mecanismo de estado recurrente que reduce el coste de atención en contextos largos. Incluye un módulo de predicción multi-token (MTP) que permite decodificación especulativa sin pérdida de calidad, y una torre de visión que procesa imágenes y video. El checkpoint original fue entrenado por Qwen con un pipeline que incluye preentrenamiento masivo, ajuste fino supervisado y alineación con preferencias humanas.

La versión de AEON-7 aplica dos modificaciones: una reparación de las capas SSM-conv1d (según su documentación) y un proceso de abliteración (abliteration) que elimina los rechazos de contenido del modelo, manteniendo intactas la torre de visión y el módulo MTP. La cuantización MLX de 6 bits se realizó con `mlx-vlm convert` usando modo affine, grupo de 64 y sin calibración (RTN), que según el autor es casi sin pérdida a 6 bits. Los tensores `mtp.*` se excluyeron de la cuantización y se publican por separado como drafter para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (thinking / non-thinking), con parámetros de muestreo recomendados distintos para cada modo.
- Comprensión de imágenes y video (torre de visión íntegra, 333/333 tensores), usable a través de mlx-vlm.
- Generación de código y tareas de programación, validado con una prueba de dos fases (spec research → implementation) que superó 28/28 asserts en tareas de parser SSE y stack-VM.
- Soporte de tool calling y funciones de agente (heredado del modelo base Qwen3.8, que está diseñado para tareas agénticas de largo horizonte).
- Decodificación especulativa sin pérdida mediante el drafter MTP, con aceleración típica de 1.4–1.9×.
- Multilingüe (inglés, chino y otros idiomas) y capacidad de QA sobre documentos largos gracias a la ventana de 262K tokens.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), lo que permite mantener historiales extensos y referencias a documentación previa sin truncar.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar o refactorizar código, con la ventaja de ejecutarse localmente en hardware Apple.
- Análisis de documentos extensos: con su ventana de contexto nativa, puede procesar manuales técnicos, contratos o informes de cientos de páginas y responder preguntas específicas con precisión.
- Agentes autónomos de largo horizonte: gracias a su capacidad de razonamiento multi-paso y tool calling, puede ejecutar tareas complejas como investigación web, extracción de datos o automatización de procesos.
- Generación de contenido creativo: el modo no-thinking con `temp=0.7` produce prosa original y coherente, útil para redacción, guiones o contenido de marketing.
- Asistente de visión local: al preservar la torre de visión, puede describir imágenes, responder preguntas visuales o analizar capturas de pantalla, todo en local sin enviar datos a la nube.
- Entornos con restricciones de privacidad: al ser Apache-2.0 y ejecutable en hardware propio, es adecuado para organizaciones que necesitan procesar datos sensibles sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias de rendimiento en un Mac mini M4 Pro con 48 GB de memoria unificada (~273 GB/s de ancho de banda):

| Workload | Config | Decode |
|---|---|---|
| Codificación (temp 0.2) | MTP block 4 | 21.5 tok/s |
| QA de documentos @ 13k ctx (temp 0.7) | MTP block 3 | 16.9 tok/s |
| Prosa creativa (temp 0.7) | MTP block 3 | 15.9 tok/s |
| Serial (sin drafter) | — | 11.4 tok/s |

El prefill se midió en ~105–110 tok/s, plano con la longitud de contexto hasta los 13k probados. La tasa de aceptación del drafter es de ~46% en prosa abierta y sustancialmente mayor en código y QA con base. La validación de código (28/28 asserts) y la verificación de que la decodificación especulativa es lossless (la distribución de muestreo no cambia) son los únicos datos de calidad disponibles.

## Requisitos de hardware

- Apple Silicon con soporte MLX; requiere `pip install mlx-vlm` (convertido con mlx-vlm 0.6.13 / mlx 0.32.0).
- Memoria unificada: ~21 GB para los pesos, con pico observado de ~25 GiB en contexto corto y ~30 GiB a 13k tokens de contexto.
- Se recomienda 48 GB o más; es viable en 36 GB, pero no recomendado por debajo de eso.
- La velocidad de decodificación escala aproximadamente lineal con el ancho de banda de memoria del chip (por ejemplo, M-series Max/Ultra ofrecen mayor throughput).
- Opciones de despliegue: `mlx_vlm generate` para inferencia puntual, `mlx_vlm.server` para servir con API, y el drafter MTP como modelo auxiliar para decodificación especulativa.
- En `mlx_vlm.server`, usar `--prefill-step-size 512` reduce el pico de memoria de prefill en ~6 GB sin coste de velocidad medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | BF16 | Apache-2.0 | Modelo base sin abliterar, con rechazos de contenido |
| Qwen3.8-27B-AEON-Ultimate-Uncensored-BF16 | 27B | 262K | BF16 | Apache-2.0 | Versión abliterada, visión y MTP intactos |
| Este modelo (MLX 6-bit) | 27B (6,35B en archivo cuantizado) | 262K | 6-bit MLX | Apache-2.0 | Cuantización para Apple Silicon, abliterado |

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B o Qwen3-30B-A3B) en la información proporcionada. La comparativa se limita a la cadena de derivación del propio modelo.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los rechazos de contenido, por lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. El operador es responsable del uso y debe cumplir la legislación de su jurisdicción.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en contextos largos o con datos ambiguos. La validación solo cubre tareas de código específicas.
- Limitaciones de hardware: requiere Apple Silicon con al menos 36 GB de memoria unificada; en equipos con menos memoria no es viable. La velocidad depende del ancho de banda del chip.
- Contexto largo: aunque la ventana nativa es de 262K tokens, el pico de memoria a 13k tokens ya alcanza ~30 GiB; contextos más largos pueden exceder la memoria disponible en equipos de 36 GB.
- Cuantización 6-bit: aunque el autor la describe como casi sin pérdida, puede haber degradación en tareas de precisión numérica o razonamiento complejo respecto al BF16 original.
- Sin benchmarks estándar: no hay evidencia pública de rendimiento en MMLU, HumanEval, etc., lo que dificulta la comparación objetiva con otros modelos.
- El drafter MTP se publica por separado y debe descargarse adicionalmente para aprovechar la decodificación especulativa.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-Multimodal-MLX-6bit
- Modelo base BF16 (AEON-7): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Drafter MTP para decodificación especulativa: https://huggingface.co/intheblue/Qwen3.8-27B-AEON-Ultimate-Uncensored-MLX-MTP-Drafter
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección de cuantizaciones MLX relacionadas: https://huggingface.co/collections/Shiftedx/qwen38-27b-aeon-ultimate-uncensored-mlx-quants
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Guía de despliegue local de Qwen3.8-27B: https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Repositorio GitHub de una versión similar (Qwen3.6): https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash/
