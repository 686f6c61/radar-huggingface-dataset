# dleemiller/finecat-nli-v2-s-wsp

## Resumen

FineCat-NLI v2 Small — WSP edit es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller, derivado de `dleemiller/finecat-nli-v2-s` mediante una edición de pesos sin gradientes denominada *weight-space programming* (WSP). El modelo recibe un par formado por un texto (premisa) y una afirmación (hipótesis) y devuelve probabilidades calibradas de que la premisa implique, contradiga o sea neutral respecto a la hipótesis. Con 68,4 millones de parámetros, está pensado como componente auxiliar de pipelines RAG, moderación, clasificación zero-shot y detección de alucinaciones.

La arquitectura subyacente es ModernBERT (variante Ettin), empaquetada para `sentence-transformers` como `CrossEncoder`. La edición WSP afecta únicamente a la cabeza de clasificación: dos de sus tres filas y la temperatura calibrada, manteniendo idénticos el resto de pesos respecto al modelo base. El autor reporta una mejora marginal en el OpenNLI Skill Index (47,1 → 47,5) y una reducción del error de calibración (8,8 → 7,8).

Es relevante porque ofrece una alternativa ligera (0,3 GB de repositorio, Apache-2.0) para tareas de *groundedness* y verificación factual en inglés, con soporte de documentos de hasta 8k tokens y un throughput declarado de unas 5.600 parejas por segundo. El modelo se etiqueta explícitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, variante Ettin) como cross-encoder |
| Parametros totales | 68.408.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8k tokens (documentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Pipeline | zero-shot-classification / text-classification |
| Modelo base | dleemiller/finecat-nli-v2-s |
| Tamano del repositorio | 0,3 GB |
| Metodo de ajuste | weight-space programming (edicion de pesos sin gradientes) |

## Arquitectura y entrenamiento

El modelo parte de `finecat-nli-v2-s`, un cross-encoder basado en ModernBERT (Ettin) entrenado para NLI de tres clases (entailment, contradiction, neutral). Sobre esa base se aplicó una edición de pesos mediante *weight-space programming*: un agente LLM modificó directamente los pesos a partir de lecturas de forward pass y conjuntos de sondas, sin entrenamiento por gradientes. Según la model card, solo cambió la cabeza de clasificación (2 de sus 3 filas) y se incorporó la temperatura calibrada; el resto de pesos permanece idéntico al modelo base.

Los datos de entrenamiento originales corresponden a los conjuntos `dleemiller/FineCat-NLI` y `dleemiller/FineCat-NLI-Reason`, con evaluación adicional sobre MultiNLI, SNLI, ANLI, WANLI y LingNLI. La model card menciona también destilación de conocimiento entre las etiquetas del modelo. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Inferencia de lenguaje natural de tres clases (entailment, contradiction, neutral) con probabilidades calibradas.
- Clasificación zero-shot y etiquetado: cada etiqueta se formula como una hipótesis y se evalúa su probabilidad de implicación.
- Detección de alucinaciones y verificación de *groundedness* en respuestas generadas a partir de pasajes recuperados.
- Clasificación de intenciones y enrutamiento (routing/triage) de peticiones de usuario.
- Guardarraíles y moderación de contenido mediante afirmaciones de política.
- Extracción de información clínica y social (por ejemplo, determinantes sociales de la salud) formulada como NLI.
- Soporte de documentos largos de hasta 8k tokens en la premisa.
- No dispone de tool calling, agentes multi-paso, visión ni audio: es un clasificador de pares de texto.

## Casos de uso

- Verificación de respuestas en RAG: dado un conjunto de pasajes recuperados como premisa y la respuesta generada como hipótesis, el modelo estima la probabilidad de que la respuesta esté respaldada por el contexto, lo que permite filtrar o marcar respuestas no fundamentadas antes de mostrarlas al usuario.
- Detección de alucinaciones en pipelines de generación: se compara cada afirmación del texto generado con las fuentes y se aplica un umbral sobre la probabilidad de entailment; el autor reporta 0,77 F1 en RAGTruth para esta tarea.
- Enrutamiento y triaje de peticiones: cada intención se formula como una hipótesis ("El usuario quiere poner una alarma") y se elige la de mayor probabilidad; el autor cita un 96,0 % en intenciones MASSIVE.
- Moderación y guardarraíles: se evalúa si un mensaje implica una afirmación de política (por ejemplo, insulto o contenido prohibido); el autor reporta 90,8 % en CrossingGuard y 92,7 % en insultos de Wikipedia.
- Clasificación zero-shot de reseñas y tickets: se construyen hipótesis del tipo "Esta reseña es positiva" para obtener etiquetas sin entrenamiento específico; el autor cita 87,8 % en 18 tareas.
- Extracción clínica estructurada: a partir de notas clínicas se comprueba si implican afirmaciones como "El paciente está desempleado"; el autor reporta 97,9 % en SDOH-NLI.
- Filtrado de candidatos en búsqueda y reranking: al ser un cross-encoder ligero (68M parámetros) y con throughput declarado de unas 5.600 parejas por segundo, puede puntuar pares consulta-documento en etapas de reranking de baja latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| FineCat-NLI | test | Accuracy | 0,7911 |
| MultiNLI | validation_matched | Accuracy | 0,8628 |
| MultiNLI | validation_mismatched | Accuracy | 0,8625 |
| SNLI | test | Accuracy | 0,9058 |
| ANLI round 1 | test_r1 | Accuracy | 0,6660 |
| ANLI round 2 | test_r2 | Accuracy | 0,5120 |
| ANLI round 3 | test_r3 | Accuracy | 0,4717 |
| WANLI | test | Accuracy | 0,7230 |
| LingNLI | validation | Accuracy | 0,7998 |
| Benchmark agregado de 45 datasets (media macro) | test | Macro accuracy | 0,7703 |

Indicadores adicionales citados en la model card: OpenNLI Skill Index 47,5 (frente a 47,1 del modelo base) y error de calibración 7,8 (frente a 8,8).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (68M parámetros, unos 0,27 GB de pesos); en fp16 aproximadamente 0,14 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para cargas moderadas.
- GPU recomendadas para alto throughput: A100, H100 o L40S para servir muchas parejas por segundo; el autor declara unas 5.600 parejas/s, aunque no especifica el hardware de esa medición.
- Despliegue: `sentence-transformers` (`CrossEncoder`) como vía principal; también es compatible con `transformers` para clasificación de secuencias. No se documenta soporte específico de vLLM, TGI o llama.cpp en la información disponible.
- Latencia: no disponible de forma desagregada; el throughput agregado declarado es de unas 5.600 parejas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| finecat-nli-v2-s-wsp | 68,4M | 8k tokens | Apache-2.0 | Edición WSP sobre finecat-nli-v2-s; OpenNLI 47,5 |
| finecat-nli-v2-s | no disponible | no disponible | no disponible | Modelo base sin edición WSP; OpenNLI 47,1 |
| Otros cross-encoders NLI de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de comparaciones con alternativas de terceros en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; la edición WSP no ha pasado por un entrenamiento convencional y los resultados no están verificados de forma independiente.
- Solo soporta inglés; no se declara cobertura multilingüe.
- Es un clasificador NLI, no un modelo generativo: no realiza tool calling, razonamiento multi-paso ni generación de texto.
- Riesgo de sesgo heredado de los datasets de entrenamiento (MultiNLI, SNLI, ANLI, WANLI, LingNLI) y de la destilación de etiquetas.
- Las métricas de la model card son declaradas por el autor (campo `verified: false` en el model-index); conviene validarlas en el dominio de producción antes de desplegar.
- El rendimiento cae en datasets de inferencia adversarial (ANLI r2 y r3 por debajo del 52 %), por lo que no es adecuado como único mecanismo de verificación en entornos de alto riesgo.
- No se documentan tipos de cuantización ni formatos alternativos a safetensors.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de un modelo base conviene revisar las condiciones de este último.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-s-wsp
- Modelo base: https://huggingface.co/dleemiller/finecat-nli-v2-s
- Demo en vivo (Space): https://huggingface.co/spaces/dleemiller/finecat-nli
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
