# mradermacher/Aurum-4B-Uncensored-i1-GGUF

## Resumen

Aurum-4B-Uncensored-i1-GGUF es una publicación de cuantizaciones GGUF generadas por mradermacher a partir del modelo base Aurum-4B-Uncensored, alojado en el repositorio 2Beyes/Aurum-4B-Uncensored. Se trata, por tanto, de un artefacto de distribución de pesos cuantizados y no de un modelo entrenado desde cero por el autor del repositorio. La model card del repositorio es extremadamente escueta y se limita a metadatos de la herramienta de cuantización (versión de quantize, tipo de conversión, lista de quants generados y referencia al modelo original).

El nombre comercial sugiere un modelo de aproximadamente 4.000 millones de parámetros con un ajuste orientado a eliminar restricciones de contenido (uncensored). Sin embargo, el único dato estructural verificable en la información proporcionada es el recuento de parámetros en safetensors del repositorio, que asciende a 1.797.272. Este valor es incompatible con un modelo de 4B y probablemente corresponde a un tensor concreto o a un conteo parcial, no al total del modelo. No se dispone de información sobre arquitectura, contexto, datos de entrenamiento ni licencia.

La relevancia de esta ficha es principalmente operativa: permite identificar qué es el repositorio, qué contiene (una batería de cuantizaciones en múltiples niveles de precisión) y qué limitaciones documentales presenta antes de intentar su uso en producción. Cualquier evaluación de capacidades o rendimiento requeriría consultar el modelo base original, cuya información no está incluida en los datos disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (el dato de safetensors indica 1.797.272, incompatible con el nombre "4B"; probablemente conteo parcial) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Aurum-4B-Uncensored en los datos proporcionados. El repositorio es una publicación de cuantizaciones generadas con una herramienta de conversión a GGUF (se observa `convert_type: hf` y `quantize_version: 2` en los metadatos), empleando cuantizaciones ponderadas con matriz de importancia (imatrix). La lista de quants incluye tanto esquemas K-quant clásicos (Q2_K a Q6_K) como variantes I-quant (IQ1_S a IQ4_XS), lo que permite desplegar el modelo en un rango amplio de presupuestos de memoria.

No hay información sobre el dataset de entrenamiento, el número de tokens procesados, la composición de los datos, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. El sufijo "Uncensored" sugiere un ajuste orientado a reducir rechazos y filtros de contenido, pero no se documenta el método. Tampoco se documentan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No se dispone de documentación sobre las capacidades del modelo en la información proporcionada.
- Por el nombre y la categoría del modelo base, se presume generación de texto conversacional, pero no está verificado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- El ajuste "Uncensored" implica, en principio, menor tasa de rechazo ante peticiones, pero no se cuantifica ni se documenta.

## Casos de uso

- Investigación sobre alineación y filtrado de contenido: el modelo puede emplearse como caso de estudio de ajustes "uncensored", comparando su tasa de rechazo frente a modelos alineados convencionales, siempre que se disponga del modelo base original y su documentación.
- Despliegue en entornos con memoria limitada: la disponibilidad de cuantizaciones desde IQ1_S hasta Q6_K permite probar el modelo en GPUs de gama baja o incluso en CPU mediante llama.cpp, a costa de degradación de calidad en los niveles más agresivos.
- Evaluación de pipelines de cuantización: el repositorio sirve para medir el impacto de distintos esquemas (K-quant frente a I-quant, con y sin imatrix) sobre la perplejidad y la calidad de generación, usando el mismo modelo base como referencia.
- Experimentación local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M, el modelo podría ejecutarse en GPUs consumer de 8-16 GB, aunque el tamaño real del modelo base no está confirmado y esta estimación es especulativa.
- Pruebas de robustez y seguridad: analizar el comportamiento del modelo ante prompts adversarios y comparar con variantes alineadas, en el marco de auditorías de seguridad.
- Prototipado de asistentes conversacionales sin restricciones temáticas: únicamente en contextos controlados y con revisión humana, dado el riesgo de contenido inapropiado y la ausencia de documentación sobre sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con rigor, ya que el tamaño real del modelo base no está confirmado. Si se asume un modelo de ~4B parámetros, las cuantizaciones Q4_K_M ocuparían aproximadamente 2,5-3 GB y Q6_K en torno a 3,5-4 GB, pero esta estimación no está verificada.
- GPU recomendadas: no disponible. Para un modelo de ~4B en Q4, bastaría una GPU consumer con 6-8 GB de VRAM; para Q6_K, 8-10 GB. No obstante, son estimaciones condicionadas al tamaño real.
- Cabe en GPU consumer: presumiblemente sí en el rango Q4-Q5 para GPUs de 8 GB o más, pero no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de artefactos sin conversión adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre el modelo base ni sobre alternativas comparables en la misma categoría (modelos de ~4B sin censura) para establecer una comparación rigurosa con parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, idiomas, licencia ni datos de entrenamiento; cualquier uso en producción parte de una base documental insuficiente.
- El recuento de parámetros en safetensors (1.797.272) contradice el nombre "4B", lo que impide confirmar el tamaño real del modelo y, por tanto, los requisitos de hardware.
- El ajuste "Uncensored" implica un mayor riesgo de generar contenido inapropiado, ofensivo o dañino; no se documentan mitigaciones.
- Riesgo de alucinación: no cuantificado ni documentado.
- Sesgos conocidos: no documentados; la ausencia de información no implica ausencia de sesgos.
- Licencia no disponible: no se puede verificar si el uso comercial está permitido. Se debe consultar el repositorio del modelo base (2Beyes/Aurum-4B-Uncensored) antes de cualquier despliegue.
- Las cuantizaciones de baja precisión (IQ1_S, IQ2_XXS) degradan notablemente la calidad; no se recomiendan para tareas que requieran precisión factual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se dispone de información sobre el pipeline de la librería de Hugging Face, lo que impide confirmar la tarea para la que fue configurado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Aurum-4B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
