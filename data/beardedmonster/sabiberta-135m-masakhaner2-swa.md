# BeardedMonster/SabiBERTa-135M-masakhaner2-swa

## Resumen

Este checkpoint es un ajuste fino de `BeardedMonster/SabiBERTa-135M`, un encoder ModernBERT de 135.883.017 parámetros, sobre el dataset MasakhaNER 2.0 en el protocolo `swa` (suajili). Resuelve una tarea concreta de procesamiento del lenguaje natural: el reconocimiento de entidades nombradas en textos en suajili, una lengua africana de bajos recursos para la que escasean modelos abiertos y ligeros.

El resultado publicado es un `span_f1` medio de 0,9001 sobre una sola ejecución. El autor indica que el harness de evaluación reproduce los baselines publicados de MasakhaNER 2.0 dentro de aproximadamente 0,25 F1, por lo que la cifra está calibrada, aunque no promediada sobre cinco ejecuciones como en los papers. Es un modelo discriminativo, no generativo: no escribe texto ni razona, sino que asigna etiquetas a tokens.

Su relevancia práctica está en el coste: al tratarse de un encoder de 135,9 M de parámetros, se puede ejecutar en CPU o en GPUs de gama baja, lo que facilita anotación de corpus, indexación documental y extracción de entidades en pipelines de producción con presupuesto limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parámetros totales | 135.883.017 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el ajuste usó `max_length=256` |
| Tipos de cuantización | no disponible; el repositorio solo publica `safetensors` |
| Idiomas soportados | `swa` (suajili) |
| Licencia | no disponible; la model card remite a la licencia del modelo base |
| Formato de pesos | `safetensors` |
| Tarea | clasificación de tokens (NER) |
| Modelo base | `BeardedMonster/SabiBERTa-135M` |
| Dataset de ajuste | MasakhaNER 2.0, protocolo `swa` |
| Métrica principal | `span_f1` 0,9001 (una sola ejecución) |
| Pipeline en HuggingFace | no disponible en los metadatos; la model card usa `AutoModelForTokenClassification` |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, según el tag `modernbert` del repositorio, ajustado para clasificación de tokens. No es un modelo generativo ni un modelo de mezcla de expertos. La model card no detalla el número de tokens de preentrenamiento, la composición del corpus original ni el esquema exacto de etiquetas; sí indica que `id2label` está configurado para que las predicciones se decodifiquen directamente a nombres de etiqueta.

El ajuste supervisado se realizó sobre MasakhaNER 2.0 en el protocolo `swa`, con 50 épocas, una tasa de aprendizaje de 5e-05, tamaño de lote 32 y longitud máxima de 256 tokens. La métrica objetivo fue `span_f1`. No se documenta RLHF, DPO ni preferencia humana, algo coherente con una tarea discriminativa de etiquetado. La innovación destacable es metodológica: el harness del proyecto reproduce los baselines publicados de MasakhaNER 2.0 dentro de aproximadamente 0,25 F1, lo que aporta calibración al resultado, aunque solo se publica una ejecución.

## Capacidades

- Etiquetado de entidades nombradas en textos en suajili, con decodificación directa a nombres de etiqueta mediante `id2label`.
- Procesamiento por fragmentos de hasta 256 tokens, que es la longitud usada durante el ajuste; para documentos más largos hay que dividir y consolidar resultados.
- Inferencia ligera en CPU o en GPU de gama baja gracias a sus 135,9 M de parámetros.
- No genera texto, no razona, no resuelve problemas matemáticos, no escribe código y no procesa imágenes.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni para razonamiento multi-paso.
- Es monolingüe: solo se declara `swa`; no se reporta soporte de otros idiomas.
- No dispone de modo *thinking*, audio ni capacidades multimodales.

## Casos de uso

- Extracción de entidades en noticias y artículos digitales en suajili: se fragmenta el texto en tramos de 256 tokens, se pasa por el pipeline de token-classification y se consolidan las entidades solapadas. Es adecuado por su `span_f1` de 0,9001 en el dominio de MasakhaNER 2.0 y por su bajo coste de inferencia.
- Enriquecimiento de índices de búsqueda: añadir campos de persona, organización y lugar a un motor de búsqueda documental para permitir búsqueda facetada. El modelo es rápido en lote y no requiere GPU dedicada.
- Monitorización de medios y redes sociales: detectar menciones de organizaciones y ubicaciones en publicaciones en suajili para generar alertas. Es útil por su tamaño reducido, aunque requiere validación en texto informal por posible *domain shift*.
- Canalización de tickets de soporte: extraer ubicaciones, organizaciones y fechas de incidencias escritas en suajili para enrutarlas al equipo adecuado. El coste por ticket es muy bajo al poder ejecutarse en CPU.
- Construcción de grafos de conocimiento: usar las entidades detectadas como entrada para un paso posterior de *entity linking* contra Wikidata u otra base de conocimiento. La decodificación directa a etiquetas simplifica la integración.
- Asistencia a la anonimización o pseudonimización: detectar nombres de personas en documentos para su revisión y redacción. Debe usarse con revisión humana, porque un `span_f1` de 0,9001 no garantiza *recall* suficiente en producción.
- Preanotación de corpus para investigación lingüística: generar etiquetas automáticas en corpus en suajili y reducir el trabajo de anotación manual. Es adecuado para lotes grandes por su bajo requisito de hardware.

## Benchmarks y rendimiento

| Benchmark | Tarea | Métrica | Resultado | Notas |
|---|---|---|---|---|
| MasakhaNER 2.0 (`swa`) | Reconocimiento de entidades nombradas | `span_f1` | 0,9001 | Media sobre 1 idioma; una sola ejecución; harness calibrado a ~0,25 F1 de los baselines publicados |

No se reportan resultados de MMLU, HumanEval, GSM8K ni evaluaciones generativas, ya que no son aplicables a un encoder de clasificación de tokens. Tampoco se publican comparaciones con otros modelos NER en la información disponible.

## Requisitos de hardware

| Precisión | VRAM solo pesos (estimada) | VRAM recomendada para batch 1 (estimada) |
|---|---|---|
| FP32 | ~0,54 GB | ~1,5-2 GB |
| FP16/BF16 | ~0,27 GB | ~0,8-1,2 GB |
| INT8 | ~0,14 GB | ~0,5-0,8 GB |

- Las cifras de VRAM son estimaciones calculadas a partir de los 135.883.017 parámetros; no son mediciones publicadas por el autor.
- Cabe en cualquier GPU consumer con 2 GB o más de VRAM. Una GTX 1650, RTX 3050, RTX 3060 o RTX 4060 son suficientes para inferencia con batch 1. No se requieren A100 ni H100.
- También es viable en CPU para cargas moderadas; el repositorio ocupa 0,5 GB.
- Despliegue recomendado: pipeline `token-classification` de Transformers, exportación a ONNX Runtime o TorchScript, y servicio con FastAPI. vLLM, TGI, llama.cpp y Ollama no son la vía habitual para un encoder de clasificación de tokens.
- Latencia y throughput: no disponible. No hay mediciones publicadas; dependerán del hardware, del tamaño de lote y de la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Métrica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SabiBERTa-135M-masakhaner2-swa` | 135.883.017 | `max_length=256` en ajuste; contexto base no disponible | `span_f1` 0,9001 | no disponible | HuggingFace |
| `SabiBERTa-135M` (base) | 135 M (nominal; no verificado) | no disponible | no disponible | no disponible | HuggingFace |
| `SabiBERTa-135M-masakhaner2-wol` | no disponible (mismo modelo base probable) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de resultados de XLM-RoBERTa, AfroBERT u otros modelos NER multilingües en la información proporcionada; por tanto, no se comparan cifras de rendimiento.

## Limitaciones y advertencias

- Licencia no disponible: la model card delega en la licencia y términos del modelo base. Antes de un uso comercial hay que revisar `BeardedMonster/SabiBERTa-135M`.
- El resultado proviene de una sola ejecución. Los papers de MasakhaNER 2.0 promedian cinco ejecuciones, así que diferencias pequeñas pueden ser ruido.
- Solo cubre suajili (`swa`). No hay evidencia de transferencia a otros idiomas ni de robustez multilingüe.
- El ajuste usó `max_length=256`; los documentos largos requieren fragmentación y pueden perder entidades en los límites entre fragmentos.
- El esquema exacto de etiquetas no se detalla en la model card; es necesario inspeccionar `id2label`. El modelo no extrae relaciones ni entidades fuera del esquema entrenado.
- No se documentan la composición del dataset, el dominio de origen, los sesgos ni evaluaciones de robustez. Existe riesgo de *domain shift* en redes sociales, soporte técnico o texto informal.
- No es un modelo generativo: no hay alucinación de texto, pero sí falsos positivos, falsos negativos y errores de frontera de entidad.
- El repositorio figuraba con 0 descargas y 0 likes en el momento de la consulta, por lo que la validación externa es muy limitada.
- No soporta tool calling, agentes ni razonamiento multi-paso; no debe usarse como sustituto de un LLM conversacional.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-swa)
- [Modelo base SabiBERTa-135M](https://huggingface.co/BeardedMonster/SabiBERTa-135M)
- [Checkpoint hermano para `wol`](https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-wol)
- [Modelos con tag `sabiyarn` en HuggingFace](https://huggingface.co/models?other=sabiyarn)

No se han encontrado enlaces a paper, blog, demo o repositorio de código en la información proporcionada.
