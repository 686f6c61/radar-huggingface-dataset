# bluemorpholimited/morphoalgo-usstock-14b-sft

## Resumen

morphoalgo-usstock-14b-sft es un ajuste fino por supervisión (SFT) del modelo denso Qwen/Qwen3-14B, publicado por el usuario bluemorpholimited en HuggingFace. El repositorio contiene pesos en formato safetensors (12,3 GB) y fue generado con la librería TRL 1.13.0 sobre Transformers 5.14.1 y PyTorch 2.11.0. No se ha publicado ninguna información sobre el conjunto de datos de entrenamiento, el número de pasos, la composición del corpus ni el procedimiento de alineación adicional.

El nombre del modelo sugiere una especialización en el mercado de valores estadounidense ("usstock"), pero la model card es la plantilla automática de TRL y no documenta ninguna capacidad financiera concreta, ningún dato de evaluación ni ninguna métrica de rendimiento. Tampoco se declara licencia (el campo aparece como marcador de posición "license"), idioma soportado ni pipeline de inferencia.

Su relevancia actual es limitada y fundamentalmente experimental: se trata de un artefacto de ajuste derivado de un modelo base bien conocido, sin validación publicada. Cualquier evaluación seria debe partir de asumir que hereda la arquitectura, el tokenizador y el contexto de Qwen3-14B, y que las capacidades específicas de dominio están por verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen/Qwen3-14B (no confirmada explícitamente en la model card) |
| Parámetros totales | 14 000 millones aproximadamente (según el modelo base; no declarado en el repositorio) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base Qwen3-14B declara 32 768 tokens nativos, ampliables a 131 072 mediante YaRN |
| Tipos de cuantización | no disponible; no se han publicado conversiones oficiales en el repositorio |
| Idiomas soportados | no disponible para el ajuste; el modelo base Qwen3 declara soporte de 119 idiomas y dialectos |
| Licencia | no disponible (el campo de la model card figura como "license" sin especificar) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del ajuste. Por el identificador de modelo base, se trata de Qwen3-14B, un transformer decoder-only denso de aproximadamente 14 000 millones de parámetros, con atención por consultas agrupadas (GQA), RoPE y un tokenizador BPE multilingüe. El ajuste no modifica la topología: se limita a actualizar los pesos mediante entrenamiento supervisado sobre pares instrucción-respuesta generados con TRL.

El procedimiento declarado es exclusivamente SFT (supervised fine-tuning) con TRL 1.13.0. No se menciona ningún dataset, número de tokens, época, tasa de aprendizaje, composición del corpus, ni fases posteriores de RLHF, DPO, ORPO o ajuste por preferencias. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, mezcla de expertos o modos de razonamiento explícitos) más allá de lo que herede del modelo base.

Un detalle técnico relevante: el tamaño del repositorio (12,3 GB) es inferior a los aproximadamente 28 GB que ocuparían los pesos de un modelo de 14 000 millones de parámetros en bfloat16. Esto sugiere que los pesos se han subido en un formato cuantizado, que la subida está incompleta o que se ha aplicado algún tipo de compresión. No hay confirmación al respecto en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno: el ejemplo de la model card muestra el uso mediante `pipeline("text-generation")` con mensajes en formato de rol usuario/asistente.
- Razonamiento y conocimiento general: presumiblemente heredados de Qwen3-14B, aunque no hay validación publicada sobre este ajuste concreto.
- Generación de código y matemáticas: capacidad esperable por herencia del modelo base, sin datos de evaluación publicados para este ajuste.
- Soporte de tool calling / function calling: no declarado en la model card. Qwen3-14B incorpora plantillas para function calling, pero no se ha confirmado que el ajuste SFT las preserve.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Modo de razonamiento ("thinking mode"): no declarado para este ajuste. Qwen3-14B dispone de modos pensamiento/no-pensamiento conmutables, pero se desconoce si el ajuste los mantiene operativos.
- Capacidades multilingües: no documentadas para el ajuste. El modelo base declara 119 idiomas.
- Capacidades de visión o audio: no disponibles, el modelo es exclusivamente de texto.
- Especialización en mercado de valores estadounidense: sugerida por el nombre del modelo, no documentada ni evaluada en la model card.

## Casos de uso

- Análisis de informes financieros en EE. UU.: si el ajuste cumple lo que sugiere su nombre, podría resumir formularios 10-K, 10-Q y 8-K, extrayendo métricas de balance y cuenta de resultados. La ventana de contexto heredada de Qwen3-14B (32 768 tokens) permitiría procesar documentos de varias decenas de páginas sin fragmentación agresiva. Requiere validación previa de exactitud numérica.
- Asistente conversacional para consultas sobre renta variable estadounidense: conversaciones multi-turno sobre tickers, sectores o métricas fundamentales. El formato de chat estándar del modelo base facilita la integración mediante `transformers.pipeline`.
- Generación de notas de investigación preliminares: redacción de borradores de tesis de inversión a partir de datos proporcionados en el prompt, siempre con revisión humana obligatoria dado el riesgo de alucinación en cifras.
- Extracción estructurada de datos de documentos financieros: conversión de texto libre a JSON con campos como ticker, periodo fiscal, ingresos o beneficio por acción, aprovechando la capacidad de generación estructurada del modelo base.
- Clasificación y etiquetado de noticias financieras: categorización de titulares por sector, sentimiento o evento corporativo (fusiones, resultados, cambios de guía) en pipelines de procesamiento por lotes.
- Motor de preguntas y respuestas sobre una base documental propia: combinación con un sistema RAG que inyecte fragmentos de informes anuales o transcripciones de llamadas de resultados, usando el modelo como generador final.
- Ajuste adicional específico: al ser un checkpoint SFT abierto, puede servir como punto de partida para fine-tuning con DPO o RLHF sobre preferencias anotadas por analistas, o para destilación hacia modelos más pequeños desplegables en producción.
- Exploración académica de ajuste de dominio: útil como caso de estudio sobre cómo un SFT concreto afecta a las capacidades generales de un modelo base grande, comparando contra Qwen3-14B sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna tarea financiera específica, ni comparaciones con el modelo base sin ajustar. Tampoco se han encontrado evaluaciones independientes en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 28-30 GB solo para los pesos, más 2-6 GB adicionales de caché KV según la longitud de contexto, lo que exige GPUs de 40 GB o más.
- VRAM estimada en cuantización de 8 bits: aproximadamente 15-16 GB de pesos, viable en una RTX 4090 (24 GB) con contexto moderado.
- VRAM estimada en cuantización de 4 bits: aproximadamente 8-10 GB de pesos, cabe en GPUs de consumo como RTX 4070 Ti Super (16 GB) o RTX 3090 (24 GB) con margen para contexto extendido.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servicio en precisión completa; RTX 4090, RTX 3090 o RTX 5090 para cuantización de 8 y 4 bits.
- Despliegue: compatible con vLLM, Hugging Face TGI y transformers estándar. Para llama.cpp u Ollama sería necesario generar conversiones a GGUF, que no están publicadas en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este ajuste.
- Advertencia de despliegue: dado el tamaño del repositorio (12,3 GB) frente a los ~28 GB esperables en bf16, conviene verificar la integridad de los pesos antes de planificar recursos de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| morphoalgo-usstock-14b-sft | ~14 000 M (heredado) | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT sin documentar ni evaluar |
| Qwen/Qwen3-14B (base) | 14 000 M densos | 32 768 nativos, 131 072 con YaRN | Apache 2.0 | HuggingFace, ampliamente desplegado | Modelo de referencia con benchmarks publicados y soporte multilingüe de 119 idiomas |
| Qwen/Qwen2.5-14B-Instruct | 14 000 M densos | 32 768, ampliable a 131 072 | Apache 2.0 | HuggingFace | Generación anterior, igualmente densa y con evaluaciones publicadas |
| Phi-4 (Microsoft) | 14 000 M densos | 16 000 | MIT | HuggingFace | Enfoque en razonamiento y matemáticas, corpus de entrenamiento sintético |
| Mistral-Nemo-12B-Instruct | 12 000 M densos | 128 000 | Apache 2.0 | HuggingFace | Menor número de parámetros pero contexto nativo mucho mayor |

La comparación directa con estos modelos no es posible en términos de rendimiento porque morphoalgo-usstock-14b-sft carece de métricas publicadas. La diferencia principal es de garantías: los tres alternativos cuentan con licencias explícitas, documentación de entrenamiento y evaluaciones reproducibles, mientras que este ajuste no ofrece ninguna de las tres.

## Limitaciones y advertencias

- Ausencia total de datos de evaluación: no existen benchmarks, pruebas de regresión ni comparaciones con el modelo base que permitan estimar si el ajuste mejora o degrada las capacidades generales.
- Riesgo elevado de alucinación en datos numéricos: cualquier cifra financiera generada (precios, ratios, beneficios) debe verificarse contra una fuente de datos autorizada antes de utilizarse.
- Licencia no especificada: la model card incluye el marcador de posición "license" sin concretar. No se puede asumir uso comercial permitido sin contactar con el autor.
- Origen del dataset desconocido: no se documenta qué datos se usaron para el SFT, lo que impide auditar sesgos, contaminación de benchmarks o posibles infracciones de derechos de autor en el corpus de entrenamiento.
- Sesgo de dominio: si el ajuste se ha realizado sobre un corpus reducido y muy especializado, es probable que haya degradado capacidades generales como el multilingüismo o el razonamiento matemático, un fenómeno conocido como olvido catastrófico.
- Idiomas no declarados: no hay confirmación de qué idiomas mantiene operativos el ajuste; el castellano no está garantizado.
- Sin validación de tool calling ni de modo razonamiento: no se ha confirmado que el ajuste preserve las plantillas de function calling ni los modos de pensamiento del modelo base.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso real en producción ni retroalimentación de la comunidad.
- Tamaño de pesos inconsistente: 12,3 GB no coincide con los pesos completos de 14 000 millones de parámetros en bf16, lo que plantea dudas sobre si el checkpoint está completo o si está cuantizado sin documentarlo.
- Contexto no confirmado: aunque el modelo base soporte 32 768 tokens nativos, no hay garantía de que el ajuste mantenga un rendimiento estable en ventanas largas.
- Fecha de creación registrada en 2026: conviene verificar la coherencia temporal del repositorio, ya que puede indicar metadatos erróneos o un artefacto de anuncio con fecha futura.
- Uso financiero regulado: cualquier aplicación que derive en recomendaciones de inversión puede quedar sujeta a normativa de asesoramiento financiero en función de la jurisdicción.
- Ninguno de los resultados de la búsqueda web realizada guarda relación con el modelo; los enlaces obtenidos son blogs genéricos de inversión sin conexión con este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bluemorpholimited/morphoalgo-usstock-14b-sft
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de TRL: https://github.com/huggingface/trl
- Búsqueda web realizada: sin resultados relevantes. Los enlaces devueltos (topstocks.com.au y similares) son blogs genéricos de inversión y no contienen información sobre el modelo, su entrenamiento o su evaluación.
