# bytkim/Qwen3.8-27B-pi

## Resumen

Qwen3.8-27B-pi es un ajuste fino del modelo base Qwen/Qwen3.8-27B, publicado por el usuario bytkim con licencia Apache 2.0. Está especializado en tareas de codificación dentro del arnés de agente Pi: el bucle de leer un repositorio, editar ficheros, ejecutar herramientas y reaccionar a la salida de estas. El objetivo declarado es completar más trabajo con menos texto generado, manteniendo la interfaz del modelo base.

El modelo tiene 27.781.427.952 parámetros (27,78 mil millones) almacenados en safetensors en bf16, con un repositorio de 59,4 GB. La model card documenta soporte de predicción multi-token (MTP) como método de decodificación especulativa, parser de razonamiento qwen3 y parser de tool calling qwen3_xml, además de una ventana de contexto de 262.144 tokens en la configuración de vLLM de ejemplo. Las etiquetas del repositorio incluyen visión y image-text-to-text, aunque el texto de la ficha se centra exclusivamente en código.

El entrenamiento combina un ajuste supervisado (SFT) sobre sesiones Pi filtradas y exitosas con una segunda etapa de aprendizaje por refuerzo con GRPO, que incorpora una recompensa personalizada de eficiencia de razonamiento. El interés actual radica en su enfoque de agente de código con niveles de esfuerzo de razonamiento ajustables (low, medium, xhigh) y en la disponibilidad de formatos FP8 y GGUF para despliegue. No hay informe técnico publicado todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text) con cabecera de predicción multi-token (MTP) para decodificación especulativa; el autor no detalla la arquitectura interna más allá de la etiqueta qwen3_5 |
| Parámetros totales | 27.781.427.952 (27,78 mil millones) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens, según el valor `--max-model-len 262144` del ejemplo de vLLM de la model card |
| Tipos de cuantización | BF16 (repo principal), FP8 (repo separado), GGUF (repo separado, cuantizaciones calibradas con sesiones completas de Pi) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF y FP8 en repositorios independientes |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna: se sabe que el modelo base es Qwen/Qwen3.8-27B, que la librería es transformers y que las etiquetas incluyen qwen3_5, visión y image-text-to-text. Lo que sí se documenta es la presencia de predicción multi-token (MTP) usada como decodificación especulativa, con una configuración de ejemplo de `{"method":"mtp","num_speculative_tokens":3}` en vLLM. También se especifican el parser de razonamiento `qwen3` y el parser de tool calling `qwen3_xml`, lo que implica una interfaz de herramientas en formato XML y un modo de pensamiento integrado.

El proceso de entrenamiento fue por etapas. Primero, curación de trayectorias de sesiones Pi y ajuste supervisado sobre sesiones filtradas y exitosas, para que el modelo aprenda flujos de trabajo completos (adaptarse a un entorno existente, comprobar resultados frente a los requisitos) en lugar de respuestas aisladas. Después, una etapa de aprendizaje por refuerzo con GRPO que combina resultados de tarea verificados con una recompensa de eficiencia de razonamiento, orientada a economizar tokens en los niveles low y medium y a priorizar la corrección en xhigh. La selección de checkpoints se hizo con resultados reales de agente junto a tokens generados, llamadas a herramientas y tiempo de finalización, no solo con la pérdida de entrenamiento.

## Capacidades

- Generación de código y edición de ficheros dentro de un bucle de agente: leer repositorio, aplicar cambios, ejecutar y verificar.
- Tool calling y function calling mediante parser `qwen3_xml`, compatible con `--enable-auto-tool-choice` en vLLM.
- Modo de razonamiento con parser dedicado (`qwen3`) y niveles de esfuerzo ajustables: low, medium y xhigh.
- Razonamiento multi-paso orientado a tareas de ingeniería: depuración, implementación y validación contra requisitos.
- Decodificación especulativa con MTP (3 tokens especulativos en la configuración de referencia) para acelerar la inferencia.
- Etiquetado como multimodal y de visión (image-text-to-text) por el autor, sin detalle de uso en la model card.
- Conversación multi-turno y soporte de contexto largo de hasta 262.144 tokens según la configuración publicada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agente de codificación autónomo en integración continua: el modelo puede ejecutar el ciclo de leer el repositorio, editar ficheros y validar con herramientas a través de tool calling, integrándose en pipelines que lancen tareas sobre un checkout del proyecto.
- Refactorización de codebases grandes: con 262.144 tokens de contexto puede mantener varios ficheros relevantes simultáneamente, lo que permite abordar cambios que cruzan módulos sin trocear el código en fragmentos inconexos.
- Depuración iterativa guiada por tests: el bucle de Pi está diseñado para usar la salida de las herramientas como feedback, de modo que el modelo corrige la implementación a partir de trazas de error y resultados de la suite de pruebas.
- Generación y reparación de código científico: la model card reporta evaluación en SciCode (337 subproblemas), lo que sitúa el modelo en escenarios de cálculo numérico y algorítmica técnica más que en código de aplicación convencional.
- Revisión automática de pull requests: el modelo puede inspeccionar un diff y su entorno, explicar el impacto y proponer correcciones con llamadas a herramientas de análisis estático.
- Documentación de código heredado: dado un contexto amplio de ficheros, puede generar explicaciones y documentación técnica de módulos sin documentación previa.
- Despliegue en estación de trabajo con GGUF: las cuantizaciones GGUF permiten ejecutar el modelo en local sobre código propietario sin enviar datos a servicios externos.
- Asistente integrado en arneses de agente compatibles con la interfaz del modelo base: al conservar la interfaz de Qwen3.8-27B, puede sustituirlo directamente en herramientas ya configuradas con parser qwen3 y tool calling XML.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye únicamente gráficos (imágenes) de Terminal-Bench 2.1, GPQA Diamond y SciCode, sin valores extraíbles, y anuncia un informe técnico para los próximos días.

| Benchmark | Resultado numérico | Observación según la model card |
|---|---|---|
| Terminal-Bench 2.1 | no disponible | Se compara éxito de tarea frente a tokens de salida en low, medium y xhigh; se afirma que Pi en medium iguala la tasa de finalización de Base en xhigh con aproximadamente un 41% menos de tokens de salida |
| GPQA Diamond | no disponible | Se reporta tasa de aprobación por intento; se afirma que Pi alcanza la puntuación más alta en xhigh, mientras que Base mantiene ventaja en medium |
| SciCode (337 subproblemas) | no disponible | Se afirma que Pi resuelve más subproblemas en todos los niveles; en xhigh con aproximadamente un 23% menos de tokens de salida, y en medium con más tokens para una puntuación superior |

Estas afirmaciones proceden del autor y no están respaldadas por cifras públicas ni por evaluaciones independientes.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 55,6 GB (27,78 mil millones de parámetros a 2 bytes por parámetro), coherente con un repositorio de 59,4 GB. Estimación.
- VRAM para BF16 con contexto largo: por encima de 60 GB solo para pesos y caché KV inicial; una GPU H100 80 GB o A100 80 GB es el mínimo razonable para una sola tarjeta, y el contexto de 262.144 tokens exige planificar la caché KV con cuidado. Estimación.
- VRAM para FP8: alrededor de 28 GB de pesos (repositorio bytkim/Qwen3.8-27B-pi-FP8), adecuado para L40S 48 GB, RTX 6000 Ada 48 GB o A6000 48 GB. Estimación.
- GPU consumer: en GGUF con cuantización de 4 bits el peso ronda los 16-17 GB, por lo que puede caber en una RTX 4090 o RTX 5090 de 24 GB con contexto moderado; cuantizaciones de 8 bits (unos 29 GB) requieren 32 GB o más. Estimación.
- Memoria unificada: equipos Apple con 64 GB o más pueden ejecutar cuantizaciones GGUF intermedias. Estimación.
- Despliegue: vLLM es la opción documentada por el autor, con `--reasoning-parser qwen3`, `--tool-call-parser qwen3_xml`, `--enable-auto-tool-choice` y decodificación especulativa MTP. Las etiquetas del repositorio incluyen text-generation-inference y los repos GGUF habilitan llama.cpp, Ollama y similares. También es cargable con transformers.
- Latencia y throughput: no disponibles. El único dato relacionado es el uso de MTP con 3 tokens especulativos, que reduce el número de pasos de decodificación, y la afirmación del autor de menos tokens de salida a igualdad de esfuerzo de razonamiento.
- Parámetros de muestreo por defecto en modo pensamiento: temperatura 1,0, top_p 0,95, top_k 20, definidos en `generation_config.json`.

## Comparativa con modelos similares

No hay resultados de benchmarks públicos de este modelo, de modo que la comparación se limita a especificaciones y licencia. Los datos de los modelos alternativos provienen de sus fichas públicas y conviene verificarlos antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B-pi | 27,78 mil millones | 262.144 tokens según la configuración de vLLM | Apache 2.0 | Agente de código en el arnés Pi, con SFT sobre sesiones Pi y RL con GRPO |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | Modelo base multimodal sin el ajuste para el arnés Pi |
| Qwen3-32B | 32,8 mil millones (dense) | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | Modelo generalista con modo de razonamiento, no especializado en arneses de agente |
| Qwen2.5-Coder-32B-Instruct | 32,5 mil millones | 131.072 tokens (con YaRN) | Apache 2.0 | Modelo de código generalista, sin entrenamiento específico de bucle de agente |
| Devstral-Small-2507 | 24 mil millones | 128.000 tokens | Apache 2.0 | Modelo de código orientado a agentes y uso de herramientas |

## Limitaciones y advertencias

- No se han publicado cifras de benchmarks verificables; toda comparación de rendimiento procede de gráficos del autor y de afirmaciones sin respaldo numérico externo.
- El informe técnico está anunciado pero no disponible, por lo que no se conocen composición del dataset, número de tokens de entrenamiento ni detalles de la etapa de RL.
- La model card está truncada en el momento de la consulta (se corta al inicio de la sección de modo no pensamiento), lo que limita la reproducibilidad de la configuración recomendada.
- El ajuste está orientado a un arnés concreto (Pi); el formato de tool calling XML y el parser qwen3_xml pueden no encajar sin cambios en otros frameworks de agentes.
- Riesgo de sobreajuste a flujos de trabajo de sesiones Pi filtradas como exitosas: puede degradarse en tareas fuera de ese patrón o en código con convenciones muy distintas.
- Riesgo de alucinación de APIs, funciones y firmas inexistentes, habitual en modelos de código; se recomienda validación con ejecución real de tests.
- Idiomas soportados no especificados; es probable que el rendimiento en castellano sea inferior al de inglés, dado el origen del ajuste, pero no hay datos que lo confirmen.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia del modelo base Qwen/Qwen3.8-27B, que debe verificarse en su ficha antes de un despliegue comercial.
- Contexto nominal de 262.144 tokens con implicaciones fuertes de memoria: la caché KV puede ser el factor limitante antes que los pesos.
- Adopción nula: 0 descargas y 1 like en el momento de la consulta, sin validación por parte de la comunidad.
- Las fechas de creación y actualización del repositorio (29 de septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.
- Las cuantizaciones GGUF se calibraron con sesiones completas de Pi; el comportamiento fuera de ese dominio puede diferir del BF16.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Versión FP8: https://huggingface.co/bytkim/Qwen3.8-27B-pi-FP8
- Versión GGUF: https://huggingface.co/bytkim/Qwen3.8-27B-pi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos corresponden a medios de información militar y no guardan relación con el modelo.
