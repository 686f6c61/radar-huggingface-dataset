# BeardedMonster/SabiBERTa-135M-masakhaner2-nya

## Resumen
SabiBERTa-135M-masakhaner2-nya es un ajuste fino del modelo base BeardedMonster/SabiBERTa-135M para reconocimiento de entidades nombradas (NER) en nya (chichewa), dentro del corpus MasakhaNER 2.0. Lo publica el usuario BeardedMonster como un checkpoint de clasificación de tokens, no como un modelo generativo: su salida son etiquetas de entidades, no texto libre. El repositorio declara 135.883.017 parámetros y formato safetensors, y el tag modernbert indica que el modelo base es un transformer encoder de la familia ModernBERT.

El ajuste se realizó durante 50 épocas, con learning rate 5e-05, batch size 32 y longitud máxima 256, y reporta un span_f1 medio de 0,8860 en el protocolo nya de MasakhaNER 2.0. Es relevante porque cubre NER en una lengua africana de bajos recursos con un modelo pequeño, desplegable en hardware modesto, y porque el autor indica que el arnés de evaluación reproduce los baselines publicados con una desviación de ~0,25 F1. La documentación es mínima y no se especifican licencia, composición del dataset ni contexto nativo del modelo base.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder), según el tag del repositorio; no se detalla en la model card |
| Parámetros totales | 135.883.017 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el ajuste se realizó con max length 256 |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors |
| Idiomas soportados | nya (chichewa) |
| Licencia | no disponible; sujeta a la licencia del modelo base |
| Formato de pesos | safetensors |
| Tarea principal | clasificación de tokens / reconocimiento de entidades nombradas (NER) |
| Modelo base | BeardedMonster/SabiBERTa-135M |
| Métrica reportada | span_f1 medio 0,8860 en MasakhaNER 2.0 (nya) |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento
El checkpoint es un ajuste fino de SabiBERTa-135M, un encoder de 135,9 millones de parámetros etiquetado como modernbert. La model card no describe la arquitectura interna, la composición del corpus, el número de tokens de entrenamiento ni si hubo búsqueda de hiperparámetros; solo indica el ajuste supervisado sobre MasakhaNER 2.0 para la lengua nya con los hiperparámetros citados. No se emplean RLHF ni DPO, ya que la tarea es clasificación de tokens y no generación.

El entrenamiento usó 50 épocas, learning rate 5e-05, batch size 32 y max length 256. El resultado se evalúa con span_f1 y se presenta como una única ejecución; el autor advierte que los baselines de referencia promedian 5 ejecuciones, por lo que las diferencias pequeñas deben tratarse como ruido. El id2label está configurado para que las predicciones se decodifiquen directamente a nombres de etiquetas.

## Capacidades
- Reconocimiento de entidades nombradas en textos en nya: personas, organizaciones, lugares y demás etiquetas del esquema MasakhaNER 2.0.
- Clasificación de tokens a nivel de span; salida decodificable a etiquetas gracias a id2label.
- Procesamiento de documentos de hasta 256 tokens por fragmento en el ajuste; documentos largos requieren chunking.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio ni modo thinking.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- Monolingüe: solo nya; no se documenta cobertura multilingüe.
- No se documentan capacidades especiales adicionales.

## Casos de uso
- Extracción de entidades en prensa digital en chichewa: el modelo puede identificar nombres de personas, organizaciones y lugares en artículos, procesando el texto por fragmentos de 256 tokens y agregando las predicciones.
- Enriquecimiento de índices de búsqueda: las entidades detectadas pueden almacenarse como metadatos para mejorar la recuperación de documentos y la navegación por nombres propios.
- Preanotación de corpus para anotación humana: sirve como primer paso para etiquetar grandes volúmenes de texto en nya, reduciendo el trabajo manual antes de la revisión de anotadores.
- Análisis de menciones en redes sociales y foros: permite extraer organizaciones y lugares citados en conversaciones públicas, con la cautela de que el dominio puede diferir del corpus de entrenamiento.
- Geolocalización aproximada a partir de topónimos: los lugares detectados pueden alimentar sistemas de información geográfica o análisis de cobertura territorial.
- Investigación lingüística y construcción de corpus: facilita estudios sobre distribución de entidades y creación de recursos anotados para nya.
- Preprocesado en pipelines de traducción o análisis documental: detectar entidades antes de otras etapas puede ayudar a preservar nombres propios y referencias geográficas.

## Benchmarks y rendimiento
| Benchmark | Tarea | Idioma | Métrica | Resultado | Notas |
|---|---|---|---|---|---|
| MasakhaNER 2.0 | NER | nya | span_f1 | 0,8860 | media de 1 idioma; ejecución única; arnés calibrado con ~0,25 F1 de desviación |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El autor no proporciona métricas por clase, intervalos de confianza ni resultados en dominios externos.

## Requisitos de hardware
- Con 135,9 millones de parámetros, los pesos en FP32 ocupan aproximadamente 0,54 GB; en FP16, unos 0,27 GB; el repositorio completo pesa 0,5 GB.
- Para inferencia con batch 1 y longitud máxima 256, la VRAM necesaria es inferior a 1 GB en FP32, incluyendo activaciones y overhead; una GPU con 2 GB es suficiente.
- Cabe en GPU de consumo como RTX 3050, RTX 4060 o RTX 4090; también es viable en CPU para volúmenes moderados.
- GPU de datacenter como T4, L4, A10, A100 o H100 no son necesarias para este tamaño, salvo para lotes grandes o despliegues agregados.
- El despliegue documentado es mediante transformers con AutoTokenizer y AutoModelForTokenClassification; no se documentan exportaciones a ONNX, TorchScript, vLLM, TGI ni llama.cpp.
- No se dispone de datos de latencia ni throughput medidos para este checkpoint.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad | Resultado |
|---|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-nya | 135,9 M | no disponible; max length 256 en el ajuste | NER en nya | no disponible | HuggingFace | span_f1 0,8860 |
| SabiBERTa-135M | 135,9 M | no disponible | modelo base sin ajuste NER documentado | no disponible | HuggingFace | no disponible |
| Alternativas NER para nya | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada otros modelos NER para nya con los que comparar parámetros, contexto o rendimiento. La comparación con el modelo base no es equivalente porque este checkpoint está especializado en NER.

## Limitaciones y advertencias
- La licencia no está disponible; el uso comercial es incierto y queda sujeto a la licencia y términos del modelo base BeardedMonster/SabiBERTa-135M.
- Los resultados provienen de una única ejecución y no incluyen intervalos de confianza; el propio autor advierte que las diferencias pequeñas frente a los baselines deben tratarse como ruido.
- El modelo es monolingüe para nya y no se documenta cobertura multilingüe.
- El esquema de etiquetas está fijado por MasakhaNER 2.0; para etiquetas propias o dominios específicos sería necesario reentrenar o ajustar.
- La longitud máxima de 256 tokens en el ajuste obliga a fragmentar documentos largos, lo que puede romper entidades que cruzan fragmentos.
- No se documentan la composición del dataset, el preprocesado ni evaluaciones de sesgo; existe riesgo de heredar sesgos del corpus y de sobreajustar tras 50 épocas.
- El repositorio tiene 0 descargas y 0 likes, y no se ha identificado validación externa; el pipeline de HuggingFace no está disponible.
- No es un modelo generativo: no procede hablar de alucinación de texto, pero sí de falsos positivos y falsos negativos en la detección de entidades.
- No se publican variantes cuantizadas ni se documenta soporte para vLLM, TGI o llama.cpp.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-nya)
- [Modelo base SabiBERTa-135M](https://huggingface.co/BeardedMonster/SabiBERTa-135M)
- No se han encontrado enlaces adicionales relevantes en los resultados de búsqueda web; las entradas devueltas corresponden a páginas genéricas de Google.
