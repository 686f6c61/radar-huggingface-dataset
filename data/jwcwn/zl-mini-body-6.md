# jwcwn/zl-mini-body-6

## Resumen

zl-mini-body-6 (publicado en la model card como zl-mini-o3) es un modelo de clasificación de texto de tipo "decision model" desarrollado por el usuario jwcwn para Zils, un subnet de Bittensor (subnet 127). No es un modelo generativo de propósito general, sino un cabezal de decisión entrenado para resolver ítems en formato de examen: dada una pregunta con opciones, el modelo produce una distribución calibrada sobre las respuestas posibles. Se construye como un "soup" (mezcla de pesos) de tres modelos base del ecosistema Zils y se afina con LoRA sobre datos de resultados reales y aritmética verificada.

El modelo parte de la arquitectura Qwen 3.5 (tag `qwen3_5` en Hugging Face) y cuenta con 4.539.265.536 parámetros en precisión bf16, lo que arroja un repositorio de 9,1 GB. Su relevancia es acotada pero específica: forma parte de la infraestructura de evaluación y decisión del subnet 127 de Bittensor, donde los modelos compiten por producir predicciones calibradas sobre resultados verificables. La licencia Apache-2.0 y el formato safetensors facilitan su reutilización, aunque su utilidad fuera de ese ecosistema es limitada.

La información pública disponible es escasa: cero descargas, cero likes, sin benchmarks publicados y sin documentación sobre longitud de contexto o idiomas más allá del inglés. Esta ficha refleja fielmente lo que el autor declara, marcando como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen 3.5 (tag `qwen3_5`), con cabezal de clasificación |
| Parámetros totales | 4.539.265.536 (4,54 mil millones) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un "soup" construido con `zils.soup.build` a partir de tres checkpoints: `Zayaan/zils-mini-hm4` (commit 435f73e), `qhoenix/zils-mini-decision-t2avg` (commit 886ea95) y `joamCriff123/zils-mini-m1113b` (commit 6ac7e4a). La mezcla parte del soup oficial d3-mini de la ronda d3-mini-2026-11-14 (sha256 4e9fcfd2…). La arquitectura subyacente es Qwen 3.5, un transformer denso de aproximadamente 4,54 mil millones de parámetros, adaptado como clasificador de decisión en lugar de modelo generativo.

El afinamiento se realizó con LoRA de rango 32, tasa de aprendizaje 4e-5 y una sola época, optimizando una combinación de entropía cruzada suave y pérdida de Brier con un anclaje KL (coeficiente 0,3) respecto al modelo de partida. El conjunto de datos consta de unos 15.900 ítems en formato de examen: aproximadamente 9.800 son resultados del mundo real recogidos con `zils.current` desde fuentes abiertas CC0 y CC-BY-SA (reversiones de edición en Wikipedia y Wikidata, resultados de AfD y AfC, categorías de arXiv), etiquetados según lo que realmente ocurrió; el resto son ítems aritméticos verificados por programa, con preguntas sembradas del split de entrenamiento de GSM8K, redactadas por gpt-oss-20b y etiquetas calculadas ejecutando código. Se aplicó deduplicación contra datos de evaluación reservados por fila de origen, huellas normalizadas, orden de opciones y similitud de embeddings. La innovación principal es el uso de pérdida de Brier con anclaje KL para obtener probabilidades calibradas, algo poco habitual en modelos de este tamaño.

## Capacidades

- Clasificación de texto en formato de examen: dado un ítem con opciones, produce una distribución de probabilidad sobre las respuestas.
- Calibración probabilística: el entrenamiento con pérdida de Brier y anclaje KL busca que las probabilidades emitidas reflejen frecuencias reales.
- Razonamiento aritmético verificado: entrenado con ítems de aritmética cuyas etiquetas se calcularon ejecutando código, no por anotación humana.
- Predicción de resultados del mundo real: reversiones de edición, resultados de discusiones de borrado y categorización de artículos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación de modelos en el subnet 127 de Bittensor: el modelo actúa como "body" de decisión dentro del pipeline de Zils, donde se compara su calibración frente a otros participantes; su formato de pesos y su licencia permiten integrarlo directamente en el flujo de validación del subnet.
- Predicción de resultados de edición en Wikipedia: dado un par de revisiones, el modelo puede estimar la probabilidad de que la edición sea revertida, útil para herramientas de moderación que prioricen revisiones de alto riesgo.
- Priorización de discusiones de borrado (AfD) y creación de artículos (AfC): clasifica si una página será borrada o aceptada, lo que permite a los editores centrar la revisión en los casos más inciertos.
- Categorización de preprints en arXiv: asigna probabilidad a categorías temáticas a partir del texto del resumen, aprovechando que el modelo fue entrenado con resultados reales de categorización.
- Verificación aritmética en pipelines de datos: al haber sido entrenado con etiquetas calculadas por ejecución de código, puede usarse como filtro de calidad para descartar ítems cuyo resultado declarado no coincide con el esperado.
- Investigación sobre calibración: su pérdida de Brier con anclaje KL lo hace adecuado como caso de estudio para comparar métricas de calibración (Brier score, ECE) frente a clasificadores entrenados solo con entropía cruzada.
- Benchmarking interno de modelos de decisión: sirve como referencia base para medir mejoras de otros "bodies" del ecosistema Zils en la misma ronda de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y del runtime; en la práctica, entre 10 y 12 GB para lotes pequeños.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 a 5 GB (estimación a partir del tamaño de pesos; el autor no publica cuantizaciones).
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5 a 3 GB (estimación; no hay GGUF oficial publicado).
- GPU recomendadas: A100, H100 o L40S para despliegues de producción con lotes grandes; RTX 4090, RTX 3090 o RTX 4080 para inferencia en una sola GPU consumer.
- Cabe en GPU consumer: sí, en tarjetas con 12 GB o más en bf16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en 8 GB requeriría cuantización.
- Opciones de despliegue: vLLM, TGI y transformers con `trust_remote_code=True` (el modelo requiere código personalizado, tag `custom_code`); llama.cpp y Ollama solo si se generan conversiones GGUF, que no están publicadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zl-mini-body-6 (este) | 4,54 mil millones | no disponible | Clasificación de decisión calibrada | Apache-2.0 | Hugging Face, 0 descargas |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | Modelo base del ecosistema Zils | no disponible | Hugging Face |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | Modelo de decisión Zils | no disponible | Hugging Face |
| joamCriff123/zils-mini-m1113b | no disponible | no disponible | Modelo base del ecosistema Zils | no disponible | Hugging Face |

Los tres modelos de comparación son los checkpoints de partida del soup, por lo que comparten familia y propósito. No se dispone de datos de parámetros, contexto ni rendimiento de ellos en la información proporcionada. Fuera del ecosistema Zils no se identifican alternativas directamente comparables en la información disponible.

## Limitaciones y advertencias

- Especialización estrecha: es un clasificador de decisión en formato de examen, no un modelo generativo; no debe esperarse de él generación de texto libre, código ni razonamiento conversacional.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: la longitud de contexto no está publicada, lo que impide planificar despliegues con entradas largas.
- Datos de entrenamiento pequeños y sesgados: unos 15.900 ítems, con una mayoría proveniente de Wikipedia, Wikidata y arXiv; los sesgos de esas fuentes (cobertura geográfica, temática y lingüística) se trasladan al modelo.
- Riesgo de alucinación: aunque es un clasificador, puede emitir distribuciones con exceso de confianza en ítems fuera de la distribución de entrenamiento; la calibración solo está garantizada, en su caso, para las familias de datos usadas en el entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero los modelos base de los que deriva podrían tener condiciones adicionales no documentadas en esta ficha; conviene verificar cada checkpoint de origen.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y añade riesgo de seguridad en producción.
- Sin validación externa: cero descargas y cero likes en Hugging Face; no hay evidencia de uso independiente ni de evaluación por terceros.
- Fecha de creación futura en los metadatos (2026-11-14): inconsistencia que conviene tener en cuenta al evaluar la madurez del modelo.
- Sin benchmarks: no hay métricas publicadas de precisión, calibración (Brier, ECE) ni comparación con alternativas, por lo que cualquier decisión de adopción debe basarse en una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwcwn/zl-mini-body-6
- Modelo base Zayaan/zils-mini-hm4: https://huggingface.co/Zayaan/zils-mini-hm4
- Modelo base qhoenix/zils-mini-decision-t2avg: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Modelo base joamCriff123/zils-mini-m1113b: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Perfil del autor: https://huggingface.co/jwcwn
- Dataset GSM8K (origen de las preguntas aritméticas): https://huggingface.co/datasets/openai/gsm8k
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
