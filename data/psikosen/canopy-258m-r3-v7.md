# psikosen/canopy-258m-r3-v7

## Resumen

Canopy-258M-R3 v7 es un modelo de generación de texto experimental desarrollado por psikosen y publicado el 6 de septiembre de 2026. Se trata de un checkpoint en BF16 que parte de los pesos v4/v5 CMA y se somete a un ajuste fino supervisado (SFT) con promedio de respuestas por pregunta, en lugar del promedio de tokens habitual. El objetivo es investigar cómo afecta esta técnica al rendimiento en tareas procedimentales pequeñas, como comparación numérica o extracción de campos JSON.

El modelo tiene 296.304.390 parámetros totales, según los pesos safetensors, y está diseñado para ejecutarse con una implementación nativa de PyTorch incluida en el repositorio, mediante el script `run.py`. No se ha especificado la arquitectura subyacente (transformer, SSM, etc.) ni la longitud de contexto. Solo soporta inglés y no se dispone de licencia.

Su relevancia radica en que sirve como banco de pruebas para técnicas de alineación en modelos pequeños, aunque la model card advierte que no se debe considerar un modelo general ni listo para producción. Los resultados de calidad muestran mejoras en comparación y JSON, pero siguen siendo débiles en aritmética y copia exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parametros totales | 296.304.390 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. El modelo se presenta como un checkpoint experimental BF16, inicializado desde los pesos v4/v5 CMA (probablemente un promedio de pesos de chat). El entrenamiento consistió en un ajuste fino supervisado (SFT) con promedio de respuestas por pregunta, usando 240 pasos, pesos maestros FP32 con autocast BF16 y replay de chat/código. El promedio por respuesta evita que las respuestas largas de replay dominen sobre las tareas cortas.

La implementación nativa de PyTorch se incluye para preservar la arquitectura evaluada y la decodificación; no se utiliza Transformers AutoModel con carga de código remoto. Se desconoce si el modelo es un transformer puro, un MoE o un híbrido, por lo que no se puede detallar más la arquitectura.

## Capacidades

- Generación de texto en inglés: el modelo responde a prompts conversacionales, aunque las pruebas de humo de conversación fallan.
- Comparación numérica: en el conjunto de evaluación, alcanza 15/25 en tareas de comparación de números, una mejora significativa frente a versiones anteriores.
- Generación de JSON: obtiene 20/22 en tareas de campos enteros en JSON, siendo su punto más fuerte.
- Razonamiento aritmético: débil, con 2/27 en tareas de aritmética.
- Copia exacta: muy débil, con 1/32.
- Sin soporte de tool calling, agentes, visión ni audio: no se menciona en la información disponible.
- Capacidades multilingües: solo inglés (etiqueta `en`).

## Casos de uso

- Investigación en técnicas de alineación: el modelo permite comparar el promedio de respuestas frente al promedio de tokens en SFT, usando las mismas condiciones iniciales y de muestreo.
- Evaluación de sensibilidad a prompts: el diagnóstico de 24 pares muestra que el rendimiento en comparación varía de 29/48 a 43/48 según la redacción, lo que lo hace útil para estudiar la robustez de modelos pequeños.
- Pruebas de extracción de campos JSON: con 20/22 en campos enteros, puede usarse como caso de estudio para validar pipelines de generación estructurada en modelos pequeños.
- Análisis de contaminación de datos: la model card indica que la contaminación histórica no se ha excluido, por lo que puede servir para investigar sobreajuste en conjuntos de evaluación pequeños.
- Experimentación con precisión mixta: el uso de pesos maestros FP32 con autocast BF16 permite estudiar el impacto de la cuantización en el rendimiento de modelos de tamaño reducido.
- Validación de metodologías de benchmark procedimental: el repositorio incluye `evaluation/report.json` y `v7_quality_findings.md`, que pueden utilizarse como referencia para diseñar suites de evaluación propias.
- No es adecuado para producción ni para tareas de conversación reales, dado que las pruebas de humo de conversación y código fallan.

## Benchmarks y rendimiento

La model card incluye una tabla de calidad medida sobre un conjunto procedural propio, con redacciones no vistas y problemas disjuntos dentro del experimento. Los resultados son los siguientes:

| Tarea | v5 CMA | Token-average SFT | v7 answer-average SFT |
|---|---:|---:|---:|
| Aritmética | 0/27 | 2/27 | 2/27 |
| Comparación | 0/25 | 0/25 | 15/25 |
| Copia exacta | 0/32 | 0/32 | 1/32 |
| Campos enteros JSON | 0/22 | 15/22 | 20/22 |
| Total | 0/106 | 17/106 | 38/106 |

Además, un diagnóstico separado de 24 pares encontró sensibilidad a la redacción y al orden de las comparaciones: 29/48 con el prompt original frente a 43/48 con un prompt alternativo más corto. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 296.304.390 parámetros en BF16, los pesos ocupan aproximadamente 0,6 GB. Con activaciones y overhead, se estima que cabe en una GPU con 2-4 GB de VRAM, aunque no hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060). También puede ejecutarse en CPU con PyTorch, dado su tamaño.
- ¿Cabe en GPU de consumo? Sí, es un modelo pequeño que cabe en GPUs de gama baja.
- Opciones de despliegue: el modelo se ejecuta mediante el script `run.py` incluido en el repositorio, con `requirements.txt`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. Los pesos están en formato safetensors, pero la implementación nativa de PyTorch es la vía oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de la misma categoría. La única comparación disponible es con versiones anteriores del mismo modelo (v5 CMA y token-average SFT), recogida en la tabla de benchmarks. En la búsqueda web aparece otro modelo del mismo autor, `psikosen/mini-swarm-browser-258m`, pero no se han encontrado datos comparativos. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información específica, pero al estar entrenado solo con datos en inglés, puede presentar sesgos culturales y lingüísticos.
- Riesgo de alucinación: alto, dado que el modelo falla en tareas básicas como aritmética y copia exacta; no se recomienda para tareas donde la precisión sea crítica.
- Limitaciones de contexto: no se especifica la longitud de contexto; no se debe asumir soporte para ventanas largas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial ni la redistribución.
- Advertencias de producción: la model card afirma explícitamente que no se hace ninguna afirmación de razonamiento general ni de preparación para producción. El modelo es experimental y las pruebas de conversación y código fallan.
- Contaminación de datos: la contaminación histórica del entrenamiento no se ha excluido de forma exhaustiva.
- Sensibilidad a prompts: el diagnóstico de 24 pares muestra que el rendimiento en comparación varía significativamente con la redacción del prompt, lo que indica inestabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/psikosen/canopy-258m-r3-v7
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
