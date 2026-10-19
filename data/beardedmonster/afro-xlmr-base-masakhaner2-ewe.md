# BeardedMonster/afro-xlmr-base-masakhaner2-ewe

## Resumen
BeardedMonster/afro-xlmr-base-masakhaner2-ewe es un checkpoint de clasificación de tokens especializado en reconocimiento de entidades nombradas (NER) para ewe. Se obtiene por fine-tuning de Davlan/afro-xlmr-base sobre el protocolo ewe de MasakhaNER 2.0, un benchmark de NER para lenguas africanas. El modelo tiene 277.459.977 parámetros y emplea una arquitectura transformer encoder XLM-RoBERTa base.

El checkpoint resuelve una tarea concreta: asignar etiquetas de entidad a tokens de textos en ewe. No es un modelo generativo ni un asistente conversacional. Su interés está en que ofrece un punto de partida reproducible para NER en una lengua de bajos recursos, con un span_f1 de 0,8943 en la evaluación de MasakhaNER 2.0 para ewe.

La model card indica que el entrenamiento se realizó durante 50 épocas, con learning rate 5e-05, batch size 32 y max_length 256. El resultado procede de una sola ejecución y el harness del proyecto reproduce los baselines publicados con una diferencia de aproximadamente 0,25 F1.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder XLM-RoBERTa base |
| Parámetros totales | 277.459.977 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens del modelo base; fine-tuning con max_length=256 |
| Tipos de cuantización | No disponible; no se documentan versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Ewe |
| Licencia | No disponible; sujeta a la licencia y términos del modelo base Davlan/afro-xlmr-base |
| Formato de pesos | Safetensors |
| Tarea principal | Clasificación de tokens (reconocimiento de entidades nombradas) |
| Modelo base | Davlan/afro-xlmr-base |
| Métrica principal | span_f1 = 0,8943 en MasakhaNER 2.0, ewe |
| Tamaño del repositorio | 2,2 GB |
| Pipeline de Hugging Face | No disponible |

## Arquitectura y entrenamiento
El modelo es un encoder transformer de la familia XLM-RoBERTa base, adaptado mediante una cabeza de clasificación de tokens para NER. Se inicializa desde Davlan/afro-xlmr-base y se ajusta sobre el protocolo ewe de MasakhaNER 2.0. La configuración documentada incluye 50 épocas, learning rate 5e-05, batch size 32, max_length 256 y evaluación mediante span_f1.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus ni procesos de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como atención lineal o decodificación especulativa. El autor indica que el harness reproduce los baselines publicados de MasakhaNER 2.0 con una diferencia de aproximadamente 0,25 F1, y que los resultados provienen de una sola ejecución; los papers de referencia promedian cinco ejecuciones, por lo que las diferencias pequeñas deben tratarse como ruido.

## Capacidades
- Reconocimiento de entidades nombradas en ewe mediante clasificación de tokens.
- Asignación de etiquetas del esquema de MasakhaNER 2.0 para ewe.
- Decodificación directa a nombres de etiquetas gracias a que `id2label` está configurado.
- Integración con `transformers` mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No genera texto libre ni mantiene conversaciones.
- No incorpora tool calling ni function calling.
- No está diseñado para agentes, planificación ni razonamiento multi-paso.
- No tiene capacidades de visión, audio, código, matemáticas o modo thinking.
- Su cobertura multilingüe práctica se limita al ewe; el encoder base es multilingüe, pero no se documenta transferencia a otras lenguas.

## Casos de uso
- Anotación asistida de corpus en ewe: el modelo puede preetiquetar entidades en textos para que anotadores humanos revisen y corrijan, reduciendo el coste frente a una anotación desde cero. Es adecuado porque está fine-tuneado específicamente sobre el esquema de MasakhaNER 2.0 para ewe.
- Extracción de entidades en not
