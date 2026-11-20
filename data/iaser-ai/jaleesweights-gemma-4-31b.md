# iaser-ai/jaleesweights-gemma-4-31b

## Resumen

JaleesWeights es un adaptador LoRA sobre el modelo `google/gemma-4-31B-it` desarrollado por iaser-ai (iaser.ai y Faith Family Technology Network) para orientar las respuestas del modelo hacia consejo religioso islámico cálido, anclado en el Corán y la Sunna y resistente a la presión conversacional del usuario. El objetivo declarado no es emitir dictámenes religiosos (fatwas) sino ofrecer companía y consejo a personas que intentan vivir conforme a su fe, manteniendo la coherencia a lo largo de conversaciones largas y sin necesidad de system prompt.

El adaptador tiene rango 32, alpha 32, se aplica sobre las proyecciones de atención y MLP del modelo de lenguaje, se entrenó en precisión de 16 bits y ocupa aproximadamente 980 MB. Se distribuye como pesos PEFT en safetensors y se ejecuta sobre el modelo base, que en bfloat16 requiere unos 62 GB de memoria de GPU. La relevancia actual radica en que documenta un pipeline de post-entrenamiento en dos etapas (destilación de contexto filtrada y DPO) evaluado con un benchmark propio, JaleesBench, publicado en arXiv.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio; no se dispone de información adicional sobre el dataset de entrenamiento, la composición de JaleesBench ni resultados de benchmarks estándar más allá de la afirmación de ausencia de regresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `google/gemma-4-31B-it`; rango 32, alpha 32, aplicado a proyecciones de atención y MLP |
| Parametros totales | No disponible (el adaptador ocupa unos 980 MB; el modelo base es de 31B según su denominación) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible de forma explícita; la evaluación de conversación larga se realizó hasta 64.000 tokens |
| Tipos de cuantizacion | No disponible (entrenado y evaluado en 16 bits / bfloat16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre el transformer `google/gemma-4-31B-it` mediante LoRA de rango 32 y alpha 32 en las proyecciones de atención y MLP del modelo de lenguaje, entrenado en precisión de 16 bits. El post-entrenamiento consta de dos etapas. La primera, destilación de contexto filtrada, consistió en que el modelo base respondiera a escenarios de entrenamiento de JaleesBench con una guía de acompañamiento de una página en el prompt; un juez evaluó las respuestas y se conservaron las calificadas como buenas (316 conversaciones), tras lo cual se eliminó la guía y se aplicó ajuste supervisado para que el modelo produjera esas respuestas sin prompt.

La segunda etapa aplicó optimización directa de preferencias (DPO): se muestreó cuatro veces por escenario de entrenamiento con el modelo de la etapa 1, un juez calificó las muestras y se entrenó sobre 502 pares de respuestas propias mejores y peores, usando el modelo de la etapa 1 como referencia. El adaptador publicado integra ambas etapas y se usa directamente sobre el modelo base, sin necesidad del adaptador intermedio. No se especifican el número de tokens de entrenamiento ni la composición del dataset más allá de los escenarios de JaleesBench.

## Capacidades

- Generación de texto en inglés con orientación a consejo religioso islámico cálido y anclado en el Corán y la Sunna, sin system prompt.
- Mantenimiento de la postura ante presión conversacional (pushback) del usuario, evaluado en seis tipos de presión.
- Coherencia en conversaciones largas: la evaluación con charla no relacionada previa al dilema se extendió hasta 64.000 tokens.
- Conservación de las capacidades del modelo base: la model card afirma ausencia de regresión en MMLU, GSM8K e IFEval.
- Soporte de tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingües: limitadas al inglés según los metadatos; no se documenta soporte de otros idiomas.
- Capacidades especiales (visión, audio, modo thinking): no disponible.

## Casos de uso

- Acompañamiento religioso conversacional: el adaptador está diseñado para ofrecer consejo islámico cálido y firme ante la presión del usuario sin necesidad de system prompt, lo que simplifica su despliegue en aplicaciones de chat de acompañamiento.
- Asistentes de comunidades religiosas: integración en plataformas de una mezquita o comunidad para responder dudas de orientación vital con referencias al Corán y la Sunna, con derivación explícita a un erudito cualificado para dictámenes.
- Conversaciones de apoyo de largo aliento: su estabilidad hasta 64.000 tokens lo hace adecuado para sesiones prolongadas de consejo donde el contexto previo puede desviar al modelo base.
- Investigación en alineación de valores: sirve como caso de estudio reproducible de post-entrenamiento en dos etapas (destilación filtrada más DPO) con código y datos publicados en el repositorio de JaleesBench.
- Evaluación comparativa de modelos: permite medir el efecto de un adaptador de valores frente al modelo base en escenarios de JaleesBench con y sin presión conversacional.
- Despliegue con vLLM multi-LoRA: al ser un adaptador PEFT de rango 32, puede servirse junto al modelo base en un servidor vLLM con `--enable-lora`, compartiendo los 62 GB del modelo base entre varias variantes.
- Moderación y redacción asistida en contextos de contenido religioso: generación de borradores de respuestas con tono respetuoso y referencias, sujetos a revisión humana.

## Benchmarks y rendimiento

Resultados en los 70 escenarios reservados de JaleesBench bajo seis tipos de presión (420 conversaciones), sin system prompt, en escala de −1 (consejo perjudicial) a +1 (consejo beneficioso), evaluados por un único juez (Claude Opus 4.8):

| Modelo | Primera respuesta | Tras presión |
|---|---|---|
| Gemma-4-31B base, sin prompt | −0,04 | −0,33 |
| Este adaptador, sin prompt | +0,53 | +0,50 |

En conversación larga, con charla no relacionada antes del dilema:

| Configuración | Inicio | Tras 64.000 tokens |
|---|---|---|
| Base con guía como system message | +0,43 | +0,19 |
| Este adaptador, sin system message | +0,44 | +0,40 (cambio −0,03; IC 95%: −0,09 a +0,03) |

La model card indica que MMLU, GSM8K e IFEval no muestran regresión frente al modelo base, pero no se publican las cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo base en 16 bits necesita aproximadamente 62 GB de GPU; el adaptador añade unos 980 MB.
- GPU recomendadas: no se especifican modelos concretos; 62 GB en bfloat16 exige GPUs de 80 GB (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- GPU de consumo: no cabe en GPUs consumer de 24 GB o menos en 16 bits; no se documentan opciones cuantizadas para el adaptador.
- Despliegue: vLLM con `--dtype bfloat16 --enable-lora --max-lora-rank 32 --lora-modules jaleesweights=./jaleesweights-adapter`; es el único método documentado. Otros motores (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única comparación publicada es contra el propio modelo base:

| Modelo | Parámetros | Contexto | Primera respuesta (JaleesBench) | Tras presión | Licencia |
|---|---|---|---|---|---|
| Gemma-4-31B base | 31B (según denominación) | No disponible | −0,04 | −0,33 | Apache 2.0 |
| JaleesWeights (este adaptador) | Adaptador LoRA de ~980 MB sobre 31B | Hasta 64.000 tokens evaluados | +0,53 | +0,50 | Apache 2.0 |

## Limitaciones y advertencias

- No es una fuente de dictámenes religiosos: fue entrenado para acompañar, no para emitir fatwas; para un dictamen debe consultarse a un erudito cualificado.
- Sigue produciendo respuestas dañinas: en el experimento de conversación larga, aproximadamente un cuarto de las respuestas tras la presión obtuvieron puntuación por debajo de cero.
- Solo puede hacer lo que el modelo base guiado acertaba: donde Gemma carece del dictamen relevante o lo rechaza, el post-entrenamiento no lo corrige.
- Todas las puntuaciones provienen de un único modelo juez, sobre escenarios reservados de la propia distribución del benchmark y solo en inglés, lo que limita la generalización de los resultados.
- No se ha medido si ofrece consejo religioso de forma no solicitada a usuarios que no lo piden.
- Idiomas: solo inglés documentado; el comportamiento en castellano u otros idiomas no está evaluado.
- Licencia Apache 2.0, igual que el modelo base, sin restricciones comerciales adicionales indicadas; conviene verificar los términos del modelo base de Google para uso en producción.
- Sin descargas ni likes en el repositorio en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/iaser-ai/jaleesweights-gemma-4-31b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper (arXiv): https://arxiv.org/abs/2608.07508
- Repositorio con paper, código y datos: https://github.com/iaser-ai/jaleesbench
- vLLM: https://github.com/vllm-project/vllm
