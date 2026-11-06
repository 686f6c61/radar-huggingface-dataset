# DreamFast/Gemma4-12b-qat-abliterlitics

## Resumen

DreamFast/Gemma4-12b-qat-abliterlitics es un artefacto de evaluación forense publicado por el autor DreamFast bajo el paraguas de su herramienta Abliterlitics, un conjunto de utilidades de código abierto para analizar ablaciones de pesos en modelos abiertos. El repositorio no contiene un modelo nuevo entrenado desde cero, sino el análisis comparativo de siete variantes de "abliteración" (eliminación de la dirección de rechazo en los pesos) construidas sobre el checkpoint oficial de Google `google/gemma-4-12B-it-qat-q4_0-unquantized`, junto con el propio checkpoint base como referencia. La abliteración es una técnica de edición de pesos que reduce la tasa de rechazo del modelo ante peticiones dañinas sin reentrenar.

El interés del artefacto es metodológico: compara por primera vez el comportamiento de la abliteración sobre pesos entrenados con QAT (quantisation-aware training, entrenamiento consciente de cuantización) frente a los mismos métodos aplicados sobre el sustrato BF16. Según la model card, la ablación sobre QAT se comporta de forma análoga a la ablación sobre BF16, con una preservación universal de capacidades y un daño dependiente del método, y el checkpoint QAT oficial mide dentro de 2 puntos porcentuales del base BF16 en todas las tareas evaluadas.

El modelo subyacente es Gemma 4 12B en su variante instruct, con licencia Gemma y soporte declarado únicamente para inglés. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su valor es fundamentalmente de investigación en seguridad y alineamiento, no de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B instruct, checkpoint QAT oficial de Google) |
| Parametros totales | 12B (según el identificador del modelo base; no se detalla desglose en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos entrenados con QAT para empaquetado de 4 bits (q4_0) pero almacenados en BF16; variantes GGUF mencionadas de forma genérica en la model card, sin detalle |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (checkpoint BF16-stored del base); no se detalla el formato de cada variante derivada |

## Arquitectura y entrenamiento

El sustrato es el checkpoint oficial de Gemma 4 12B instruct sometido a QAT: los pesos se entrenan para tolerar el empaquetado de 4 bits pero se distribuyen almacenados en BF16, de modo que la arquitectura es idéntica a la del base BF16 y el despliegue cuantizado resulta más barato. Sobre ese sustrato, siete autores de la comunidad aplicaron distintos métodos de abliteración: Heretic en versiones 1.1, 1.2.0 y 1.4.0 (backend ARA y backend SOMPOA, preservando norma de fila en algunos casos), ablación clásica de dirección con remove-refusals-with-transformers y una variante de peso máximo reajustada con modo thinking activado. Las ediciones se concentran en capas intermedias (por ejemplo, capas 24-48 o 23-36) y en tensores `o_proj`, con huellas que van desde 11 tensores en la variante más pequeña hasta 28 tensores rank-1 en la más agresiva.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación destacable del artefacto es la propia metodología de evaluación: un pipeline de cuatro ejes que combina forense de pesos, divergencia KL sobre vocabulario completo, una suite de 11 tareas académicas y HarmBench con 400 comportamientos dañinos, con revisión por LLM juez de las 3.200 respuestas generadas.

## Capacidades

- Generación de texto y razonamiento en inglés, heredados del checkpoint instruct de Gemma 4 12B.
- Modo thinking (razonamiento extendido) presente en el base y ablacionado explícitamente en algunas variantes; la variante huihui presenta una tasa de bucles de pensamiento del 20,2%.
- Capacidad matemática: GSM8K con tasa de acierto en modo answered-only del 88,4% en el checkpoint oficial QAT.
- Conocimiento académico medido con MMLU-Pro y tareas de razonamiento (WinoGrande, PIQA) en la suite de evaluación.
- Seguimiento de instrucciones evaluado con IFEval.
- Respuesta a preguntas de conocimiento (TQA) con degradaciones variables según variante.
- Reducción drástica del rechazo ante peticiones dañinas: tasas de ataque exitoso (ASR) con juez LLM entre el 80,8% y el 87,0% en las variantes ablacionadas, frente al 10,7% del checkpoint oficial.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en seguridad y alineamiento: el repositorio sirve para estudiar cómo la abliteración afecta a pesos entrenados con QAT en comparación con BF16, usando la suite de 11 tareas y HarmBench como referencia reproducible.
- Auditoría de métodos de ablación: permite comparar Heretic ARA, Heretic SOMPOA y ablación clásica de dirección bajo un mismo pipeline, con métricas de divergencia KL y daño conductual medido, útil para equipos que evalúan herramientas de edición de pesos.
- Evaluación de robustez de salvaguardas: los 400 comportamientos de HarmBench y las 3.200 respuestas con juicio LLM permiten calibrar clasificadores de seguridad y estudiar qué categorías (copyright, desinformación, químicos y biológicos, acoso) resisten mejor la ablación.
- Estudio de la relación entre KL autoreportada y daño real: la variante igorls muestra que la KL declarada por el autor (0,32) no predice el daño conductual medido (KL de vocabulario completo 0,205, en el rango medio), un caso útil para diseñar metodologías de validación.
- Reproducción de experimentos de edición de pesos: la variante wnfldchen incluye un directorio `reproduce/`, lo que facilita replicar el pipeline en entornos de investigación.
- Formación y docencia sobre riesgos de modelos abiertos: el contraste entre el 10,7% de ASR del checkpoint oficial y el 87,0% de la variante más jailrokeada ilustra de forma cuantitativa el impacto de la edición de pesos sobre las salvaguardas.
- No se recomienda su uso en producción orientada a usuario final: el propósito declarado es forense y comparativo.

## Benchmarks y rendimiento

Los datos proceden de la model card y corresponden al pipeline propio de Abliterlitics. Se presentan los valores disponibles; el resto se marca como no disponible.

| Metrica | QAT oficial (referencia) | coder3101 (Heretic ARA) | muxodious (Heretic SOMPOA) | wnfldchen (Heretic ARA) | llmfan46 (Heretic ARA) | igorls (Heretic max-weight) | huihui (ablación clásica) |
|---|---|---|---|---|---|---|---|
| ASR con juez LLM | 10,7% | 81,0% | 85,1% | 83,6% | 80,8% | 82,8% | 87,0% |
| KL (vocabulario completo) | no disponible | 0,087 | 0,088 | no disponible | no disponible | 0,205 | no disponible |
| GSM8K (answered-only) | 88,4% | 83,1% (+2,0 pp vs base) | no disponible | no disponible | no disponible | no disponible | +0,6 pp vs base |
| MMLU-Pro | no disponible | no disponible | no disponible | +3,2 pp vs base | +0,6 pp vs base | +0,3 pp vs base | no disponible |
| TQA | no disponible | -3,5 pp | no disponible | no disponible | -6,4 pp | -3,6 pp | -11,8 pp |
| IFEval | no disponible | no disponible | no disponible | no disponible | no disponible | +1,1 pp | -2,6 pp |
| WinoGrande | no disponible | no disponible | no disponible | +1,3 pp vs base | no disponible | no disponible | no disponible |
| PIQA | no disponible | no disponible | no disponible | -0,2 pp vs base | no disponible | no disponible | no disponible |
| Tasa de respuestas vacías | no disponible | por debajo del base | no disponible | 6,4% | no disponible | no disponible | no disponible |

El checkpoint oficial QAT mide entre 0,3 y 1,9 puntos porcentuales por debajo del base BF16 en cada tarea académica, según la model card. La variante huihui presenta una tasa de bucles de pensamiento del 20,2% y 23 rechazos duros en coder3101, el residuo de rechazo más alto del panel.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Para un modelo de 12B en BF16 se requiere del orden de 24 GB solo para pesos, y aproximadamente 7-8 GB en cuantización de 4 bits, aunque estas cifras son estimaciones generales y no datos publicados en la model card.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no confirmado en la información disponible; el sustrato QAT está diseñado para despliegue en 4 bits, lo que en principio lo haría apto para GPUs de consumo con suficiente VRAM, pero no se aportan mediciones.
- Opciones de despliegue: no se detallan en la model card; se mencionan pruebas de despliegue GGUF en comparaciones comunitarias, sin especificar motores concretos (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación relevante es entre el checkpoint oficial y sus variantes ablacionadas, todas derivadas del mismo sustrato QAT de 12B. No se dispone de comparación con modelos de otros autores.

| Modelo | Parametros | Contexto | ASR (juez LLM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12B | no disponible | 10,7% | gemma | Hugging Face |
| coder3101/gemma-4-12B-it-qat-q4_0-unquantized-heretic | 12B | no disponible | 81,0% | gemma | Hugging Face |
| MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy | 12B | no disponible | 85,1% | gemma | Hugging Face |
| wnfldchen/gemma-4-12B-it-qat-q4_0-unquantized-heretic | 12B | no disponible | 83,6% | gemma | Hugging Face |
| llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic | 12B | no disponible | 80,8% | gemma | Hugging Face |
| igorls/gemma-4-12B-it-qat-q4_0-unquantized-heretic | 12B | no disponible | 82,8% | gemma | Hugging Face |
| huihui-ai/Huihui-gemma-4-12B-it-qat-q4_0-unquantized-abliterated | 12B | no disponible | 87,0% | gemma | Hugging Face |

## Limitaciones y advertencias

- El repositorio es un artefacto de evaluación forense, no un modelo listo para producción; su propósito declarado es comparar métodos de ablación.
- Las variantes ablacionadas eliminan deliberadamente las salvaguardas: tasas de ataque exitoso de hasta el 87,0% frente al 10,7% del checkpoint oficial, con categorías como síntesis de armas químicas entregadas por algunas variantes.
- El checkpoint oficial QAT ya muestra un 21,9% de ASR en Copyright y un 26,2% en Misinformation, con 0,0% en Químicos/Biológicos, Acoso y Dañino.
- Riesgo de alucinación: no cuantificado en la información disponible; la degradación en TQA llega a -11,8 pp en la variante huihui.
- La variante huihui presenta un 20,2% de bucles de pensamiento, lo que puede degradar la calidad de respuestas en modo razonamiento.
- Idioma: solo inglés declarado; no hay evidencia de comportamiento multilingüe.
- Longitud de contexto: no disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución según los términos de Google; debe revisarse antes de cualquier despliegue.
- La model card está redactada en primera persona por el autor y contiene afirmaciones metodológicas propias (por ejemplo, que la KL autoreportada no predice el daño conductual) que conviene contrastar de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/DreamFast/Gemma4-12b-qat-abliterlitics
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Informe en vivo: https://abliterlitics.dev/models/gemma4-12b-qat/
- Código: https://github.com/dreamfast/abliterlitics
- Explorador HarmBench: https://abliterlitics.dev/harmbench/gemma4-12b-qat/
- Comparativa BF16: https://abliterlitics.dev/models/gemma4-12b/
- Discord: https://discord.gg/AqmDnBjPvM
- Variante coder3101: https://huggingface.co/coder3101/gemma-4-12B-it-qat-q4_0-unquantized-heretic
- Variante muxodious: https://huggingface.co/MuXodious/gemma-4-12B-it-QAT-SOMPOA-heresy
- Variante wnfldchen: https://huggingface.co/wnfldchen/gemma-4-12B-it-qat-q4_0-unquantized-heretic
- Variante llmfan46: https://huggingface.co/llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic
- Variante igorls: https://huggingface.co/igorls/gemma-4-12B-it-qat-q4_0-unquantized-heretic
- Variante huihui: https://huggingface.co/huihui-ai/Huihui-gemma-4-12B-it-qat-q4_0-unquantized-abliterated
