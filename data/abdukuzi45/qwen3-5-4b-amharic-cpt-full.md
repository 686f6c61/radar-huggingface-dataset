# abdukuzi45/Qwen3.5-4B-Amharic-CPT-Full

## Resumen

Qwen3.5-4B-Amharic-CPT-Full es un checkpoint base de continuación de preentrenamiento (continued pretraining, CPT) publicado por el usuario abdukuzi45 sobre la arquitectura Qwen3.5, con aproximadamente 4.740 millones de parámetros. El modelo parte de un checkpoint intermedio del propio autor (Qwen3.5-4B-Amharic-32k-StageA-Merged) y ha sido adaptado al amárico mediante CPT sobre un corpus alineado amárico-inglés, manteniendo el inglés como idioma de retención. Es relevante porque documenta de forma explícita y medible una adaptación lingüística de bajo recurso sobre un modelo multimodal de base, con métricas de pérdida por byte (BPB) y perplejidad comparadas contra el modelo original de Alibaba.

El modelo se distribuye como checkpoint base/CPT, no como asistente instruido: el autor indica que la fase de SFT no se ha completado en esta release. El checkpoint final exportado es `step-0027792`. La arquitectura es de tipo transformer con pipeline image-text-to-text, lo que sugiere que conserva capacidades multimodales del modelo Qwen3.5 original, aunque la evaluación publicada se centra exclusivamente en modelado de lenguaje sobre texto.

La licencia es Apache 2.0 y el repositorio ocupa 9,5 GB en formato safetensors. El modelo declara soporte para amárico (am) e inglés (en), y su interés principal reside en servir como base para fine-tuning posterior en tareas amáricas, así como en la tokenización adaptada que reduce el número de tokens necesarios para representar texto amárico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), pipeline image-text-to-text |
| Parametros totales | 4.741.785.088 (4,74 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32k (heredada del checkpoint StageA; validada en segmentos de 8.192 tokens en la evaluación) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en BF16) |
| Idiomas soportados | Amárico (am), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5 con aproximadamente 4,74 mil millones de parámetros, derivado de un checkpoint intermedio del propio autor (StageA-Merged) que a su vez adapta el modelo base de Alibaba. La release corresponde a la fase de continued pretraining sobre un dataset alineado amárico-inglés (`amharic-english-cpt-clean-aligned-packed8192-20261109-v2`), con secuencias empaquetadas de 8.192 tokens. El checkpoint final es `step-0027792` y no se ha realizado SFT, por lo que se trata de un modelo base para fine-tuning, no de un asistente instruido.

La innovación técnica destacable es la adaptación del tokenizador: el mismo texto amárico segmentado requiere 18.230.406 tokens con el tokenizador de Alibaba frente a 9.467.284 con el tokenizador StageA/Final, un 48,07% menos de tokens. Esta ganancia es heredada de la adaptación del tokenizador en StageA y es independiente de la mejora de pérdida del CPT. La evaluación se realizó en BF16 con SDPA sobre una NVIDIA RTX PRO 6000 Blackwell, con comprobaciones de igualdad de tokenizador y EOS nativo entre StageA y Final, y con comparación de perplejidad solo entre modelos de tokenizador expandido.

## Capacidades

- Modelado de lenguaje y predicción de texto en amárico e inglés, con pérdida medida sustancialmente menor en amárico que el modelo base de Alibaba.
- Capacidades multimodales heredadas de la arquitectura Qwen3.5 (pipeline image-text-to-text), aunque no se han publicado evaluaciones multimodales en esta release.
- Tokenización adaptada al amárico con aproximadamente la mitad de tokens por el mismo texto respecto al tokenizador original.
- Base para fine-tuning supervisado (SFT) y posteriores etapas de alineamiento; no incluye instrucciones ni formato de chat entrenado.
- Retención del inglés medida: la perplejidad en inglés mejora un 9,25% respecto a StageA y el BPB baja un 3,63%.
- No se declara soporte de tool calling, function calling, agentes ni modos de razonamiento explícito en la información disponible.

## Casos de uso

- Base para SFT en amárico: el checkpoint está pensado como punto de partida para entrenamiento supervisado con datos instruccionales amáricos, aprovechando la reducción de perplejidad y la tokenización eficiente.
- Modelado de lenguaje y evaluación lingüística: útil para medir perplejidad y BPB en corpus amáricos, así como para experimentos de adaptación de dominio con modelos de 4B.
- Generación de texto en amárico tras fine-tuning: una vez ajustado, puede emplearse en tareas de redacción, resumen o traducción amárico-inglés, aunque estas capacidades no están evaluadas en esta release.
- Investigación en tokenización de lenguas de bajo recurso: el tokenizador adaptado sirve para estudiar el impacto de la eficiencia de tokenización en el coste de entrenamiento e inferencia.
- Experimentos de retención de inglés: el modelo documenta métricas de retención (ratio de perplejidad 0,90747 frente al guard de 1,02), lo que lo hace útil para estudiar olvido catastrófico en CPT bilingüe.
- Punto de partida para adaptación multimodal en amárico: al conservar la arquitectura image-text-to-text, puede servir para experimentos de adaptación de tareas visión-lenguaje a este idioma.
- Evaluación comparativa de checkpoints CPT: la documentación de BPB y perplejidad con intervalos bootstrap permite reproducir y comparar metodologías de evaluación entre tokenizadores distintos.

## Benchmarks y rendimiento

Los datos publicados son métricas de pérdida de lenguaje (BPB y perplejidad), no benchmarks de tareas. Se presentan a continuación tal como los reporta el autor.

| Modelo | BPB amárico ↓ | BPB inglés ↓ |
|---|---:|---:|
| Alibaba Base | 1,099285 | 0,867678 |
| StageA-Merged (inicio CPT) | 1,028634 | 0,867724 |
| Final CPT (esta release) | 0,560943 | 0,836241 |

| Idioma | Perplejidad StageA ↓ | Perplejidad Final CPT ↓ | Reducción |
|---|---:|---:|---:|
| Amárico | 13,2451 | 4,0915 | 69,11% |
| Inglés | 14,5287 | 13,1844 | 9,25% |

| Comparación | Reducción BPB amárico | Reducción BPB inglés |
|---|---:|---:|
| StageA → Final (cambio de CPT) | 45,47% | 3,63% |
| Alibaba → Final (StageA + CPT) | 48,97% | 3,62% |

Intervalos de confianza bootstrap (10.000 remuestras, agregación ratio-of-totals): amárico Final − StageA BPB = −0,467692 [−0,472243, −0,463074]; inglés = −0,031483 [−0,033623, −0,029444]. El ratio de perplejidad inglés Final/StageA fue 0,90747 [0,90129, 0,91340], por debajo del guard de retención de 1,02 del proyecto. La evaluación usó 7.891 documentos de validación en amárico y 1.778 en inglés, con segmentos fijos de 2.048 caracteres Unicode y comprobaciones de 8.192 tokens. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,5 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica se recomiendan 16-24 GB de VRAM para secuencias moderadas.
- En cuantización de 8 bits se estiman unos 5 GB de pesos; en 4 bits, unos 2,5-3 GB, aunque el repositorio solo publica safetensors en BF16 y no se han publicado cuantizaciones oficiales.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (usada en la evaluación), A100, H100 para entrenamiento o inferencia a gran escala; RTX 4090 y GPUs consumer de 16-24 GB para inferencia en BF16 con contexto moderado.
- Cabe en GPUs consumer de gama alta (RTX 4090, RTX 3090) en BF16 para contexto corto, y en GPUs de 8-12 GB si se generan cuantizaciones propias.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para servir el modelo; llama.cpp u Ollama requerirían conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada. La reducción del 48,07% en tokens para amárico es una ganancia de tokenización, no una medida de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---:|---|---|---|---|
| Qwen3.5-4B-Amharic-CPT-Full | 4,74B | 32k | am, en | Apache 2.0 | Base/CPT, sin SFT |
| Alibaba Base (Qwen3.5-4B original) | ~4B (no confirmado) | No disponible | Multilingüe (no detallado) | No disponible | Base |
| StageA-Merged (checkpoint intermedio del autor) | 4,74B | 32k | am, en | Apache 2.0 | Base/CPT intermedio |

La comparación cuantitativa disponible se limita a BPB y perplejidad frente a Alibaba Base y StageA. No se dispone de comparaciones con otros modelos adaptados al amárico ni de benchmarks de tareas que permitan situar el modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint base/CPT sin SFT: no está diseñado para seguir instrucciones ni para uso conversacional directo en producción.
- Las métricas publicadas son de pérdida de lenguaje (BPB, perplejidad), no de precisión en tareas; el autor advierte explícitamente que no deben interpretarse como conocimiento adquirido ni como aprobación para producción.
- Los documentos de validación se usaron para selección de checkpoint, por lo que no constituyen un test ciego; no se certifican controles completos de contaminación.
- No se han evaluado calidad de generación, repetición, seguridad, razonamiento ni rendimiento multimodal.
- Riesgo de alucinación y sesgos no caracterizados en la información disponible.
- El soporte idiomático se limita a amárico e inglés; no se declaran otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin alineamiento, el usuario asume la responsabilidad de fine-tuning y evaluación.
- La tokenización adaptada no debe compararse en perplejidad con el modelo de Alibaba, ya que los tokenizadores difieren.

## Enlaces

- Hugging Face: https://huggingface.co/abdukuzi45/Qwen3.5-4B-Amharic-CPT-Full
- Modelo base: https://huggingface.co/abdukuzi45/Qwen3.5-4B-Amharic-32k-StageA-Merged
- Dataset de CPT: https://huggingface.co/datasets/abdukuzi45/amharic-english-cpt-clean-aligned-packed8192-20261109-v2
- Dataset de validación: https://huggingface.co/datasets/abdukuzi45/amharic-english-cpt-70-30-subword
