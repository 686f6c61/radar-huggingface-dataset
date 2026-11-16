# ITLL/deberta-v3-base-tasksource-nli

## Resumen

deberta-v3-base-tasksource-nli es un modelo de clasificación de texto basado en la arquitectura DeBERTa-v3-base, ajustado por el usuario ITLL sobre el conjunto multitarea tasksource. El modelo está diseñado específicamente para tareas de inferencia de lenguaje natural (NLI) y clasificación zero-shot, aprovechando el entrenamiento multi-tarea extremo (extreme multi-task learning) para generalizar a una amplia variedad de tareas de clasificación sin necesidad de ajuste fino adicional.

El modelo resuelve el problema de la clasificación de texto zero-shot: dado un texto y un conjunto de etiquetas candidatas, el modelo puede determinar la etiqueta más probable sin haber sido entrenado explícitamente en esa tarea concreta. Esto lo hace especialmente útil para pipelines de clasificación donde las categorías cambian dinámicamente o donde no se dispone de datos etiquetados.

Con 184 millones de parámetros, el modelo es lo suficientemente compacto para desplegarse en hardware consumer, pero mantiene la capacidad de un transformer preentrenado de tamaño base. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. La relevancia actual radica en la creciente demanda de clasificadores zero-shot fiables que puedan integrarse en sistemas de agentes y pipelines de datos sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (transformer encoder con atención disentangled) |
| Parametros totales | 184.424.963 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors y pytorch) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, pytorch (bin) |

## Arquitectura y entrenamiento

El modelo se basa en DeBERTa-v3-base, una arquitectura transformer encoder que introduce atención disentangled (disentangled attention) y un mecanismo de embedding mejorado (ELECTRA-style replaced token detection) durante el preentrenamiento. DeBERTa-v3-base combina las mejoras de DeBERTa-v2 con el preentrenamiento tipo ELECTRA, lo que resulta en un modelo más eficiente en el uso de datos y con mejor rendimiento en tareas de comprensión del lenguaje.

El ajuste fino se realizó sobre el conjunto multitarea tasksource, que agrega cientos de datasets de clasificación y NLI, incluyendo GLUE, SuperGLUE, ANLI, MultiNLI, SNLI, SciTail, HANS, WANLI, y decenas de datasets de dominios específicos como banca (Banking77), análisis de sentimiento, detección de odio, QA médica, razonamiento lógico y evaluación de sesgos. El entrenamiento multi-tarea extremo permite que el modelo aprenda representaciones compartidas entre tareas, lo que facilita la transferencia zero-shot. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Clasificación de texto zero-shot: puede asignar etiquetas a textos sin entrenamiento específico previo, usando la formulación de NLI (entailment/contradiction/neutral).
- Inferencia de lenguaje natural (NLI): determina si una hipótesis se sigue de una premisa.
- Clasificación multi-etiqueta y multi-clase en dominios diversos: sentimiento, temas, intenciones, detección de odio, spam, emoción, etc.
- Evaluación de calidad y coherencia textual: tareas de NLI y razonamiento lógico.
- Clasificación de relaciones semánticas y paráfrasis.
- Detección de sesgos y contenido dañino (entrenado con datasets como HateSpeech, Ethos, Civil Comments).
- Soporte de pipeline de Hugging Face para zero-shot-classification.
- Capacidades multilingües: limitadas al inglés según la model card.
- No soporta tool calling, function calling ni generación de texto libre; es un modelo encoder para clasificación.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías (facturación, técnico, cuenta) a tickets entrantes sin entrenamiento previo, usando zero-shot-classification con las etiquetas definidas por el equipo. Es adecuado porque no requiere datos etiquetados y se adapta a categorías cambiantes.
- Moderación de contenido en tiempo real: clasificar comentarios como tóxicos, spam o aceptables usando las etiquetas del pipeline; el modelo fue entrenado con datasets de hate speech y toxicidad, lo que le da robustez en este dominio.
- Análisis de sentimiento en reseñas: clasificar reseñas de productos o servicios como positivas, negativas o neutras sin ajuste fino, aprovechando el entrenamiento en datasets como IMDB, Yelp y Amazon Polarity.
- Enrutamiento de consultas en asistentes virtuales: determinar la intención del usuario (consulta de precio, soporte técnico, reclamación) para dirigir la conversación al flujo adecuado, usando la clasificación zero-shot con las intenciones definidas.
- Clasificación de documentos legales o financieros: etiquetar contratos o informes según su tipo o riesgo, aprovechando el entrenamiento en datasets como LexGLUE y Financial PhraseBank.
- Detección de desinformación y verificación de hechos: clasificar afirmaciones como apoyadas, refutadas o no verificables usando la formulación NLI, útil en pipelines de fact-checking.
- Análisis de feedback de empleados o encuestas: categorizar respuestas abiertas en temas como clima laboral, compensación o gestión, sin necesidad de un modelo específico por encuesta.

## Benchmarks y rendimiento

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| GLUE (RTE) | Text classification | Accuracy | 0.89 |
| ANLI-R3 | Natural language inference | Accuracy | 0.52 |

Estos resultados son los declarados por el autor del modelo en la model card (no verificados de forma independiente).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.7 GB en fp32 (184M parámetros × 4 bytes), ~0.4 GB en fp16, y menos de 0.2 GB en cuantización int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100, H100 funcionan sin problema.
- Cabe en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers pipeline, vLLM (soporte limitado para encoder-only), llama.cpp (no aplica directamente para DeBERTa), TGI (soporte para clasificación), ONNX Runtime, y despliegue con FastAPI o TorchServe.
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo de 184M parámetros en una GPU moderna se espera un throughput de cientos a miles de secuencias por segundo, pero no se confirma con datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| ITLL/deberta-v3-base-tasksource-nli | 184M | no disponible | Apache 2.0 | Clasificación zero-shot multi-tarea (NLI) |
| microsoft/deberta-v3-base | 184M | 512 tokens | MIT | Modelo base preentrenado, requiere ajuste fino |
| FacebookAI/roberta-large-mnli | 355M | 512 tokens | MIT | NLI zero-shot, solo inglés |
| MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli | 184M | 512 tokens | MIT | NLI zero-shot, entrenado en MNLI/FEVER/ANLI |

La comparativa se basa en conocimiento general de modelos similares; no se dispone de datos de rendimiento comparativo directo en la información proporcionada para este modelo frente a las alternativas.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no está entrenado para otros idiomas, lo que limita su uso en entornos multilingües.
- Riesgo de alucinación en la clasificación: al ser un modelo discriminativo, puede asignar etiquetas incorrectas con alta confianza en textos ambiguos o fuera de dominio.
- Sesgos conocidos: al entrenarse con datasets que incluyen contenido sesgado (hate speech, estereotipos), el modelo puede reproducir sesgos de género, raza o religión en sus clasificaciones.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto en la información proporcionada; DeBERTa-v3-base típicamente soporta 512 tokens, pero no se confirma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se recomienda revisar los términos de los datasets de entrenamiento subyacentes para usos específicos.
- Caveat para producción: el rendimiento en ANLI-R3 (0.52) sugiere que el razonamiento en NLI complejo es limitado; no es adecuado para tareas que requieran inferencia lógica profunda.
- No es un modelo generativo: no puede producir texto libre, solo clasificar; no soporta tool calling ni agentes conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/deberta-v3-base-tasksource-nli
- Paper de DeBERTa-v3: https://arxiv.org/abs/2111.09543 (referencia general de la arquitectura)
- Repositorio tasksource: no disponible en la información proporcionada
- Demo o espacio de Hugging Face: no disponible en la información proporcionada
