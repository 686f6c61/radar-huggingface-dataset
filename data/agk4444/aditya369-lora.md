# agk4444/aditya369-lora

## Resumen

Aditya369-lora es un adaptador LoRA (Low-Rank Adaptation, r=16) publicado por agk4444 (AGK FIRE INC) que se monta sobre el modelo base Qwen/Qwen3-4B para realizar clasificacion de emociones en ingles. No es un modelo generativo autonomo: es un conjunto de pesos de bajo rango que se cargan encima de Qwen3-4B mediante PEFT y transforman el modelo en un clasificador de seis clases (sadness, joy, love, anger, fear, surprise).

El modelo resuelve una tarea acotada y clasica de NLP (deteccion de emociones en textos cortos, principalmente tweets) con un enfoque poco habitual: en lugar de entrenar un encoder tipo BERT/RoBERTa desde cero o hacer fine-tuning completo, reutiliza un modelo de lenguaje causal de 4.000 millones de parametros cuantizado a 4 bits y solo entrena un adaptador de aproximadamente 70 MB. El resultado declarado es una precision del 93,50 % y un macro F1 de 0,8907 sobre el conjunto de test de dair-ai/emotion.

Su relevancia practica es doble. Por un lado, demuestra que es viable adaptar LLMs de 4B a tareas de clasificacion con recursos modestos: el entrenamiento se hizo en 3 epocas y unas 1.500 iteraciones sobre una unica GPU T4 en Kaggle. Por otro, sirve como ejemplo reproducible de un pipeline PEFT + bitsandbytes para quien quiera replicar el flujo con otros datasets o etiquetas. Existe tambien una version fusionada de un solo modelo en agk4444/aditya369.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA r=16 sobre Transformer decoder causal Qwen/Qwen3-4B (solo capas de atencion) |
| Parametros totales | ~4.000 millones en el modelo base Qwen3-4B; el adaptador LoRA ocupa aproximadamente 70 MB |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la ficha del adaptador; el modelo base Qwen3-4B declara 32.768 tokens nativos en la documentacion oficial de su familia, aunque la tarea es de clasificacion de textos cortos |
| Tipos de cuantizacion | 4-bit con bitsandbytes en el modelo base; el adaptador se distribuye en safetensors sin cuantizar. No se publican pesos GGUF |
| Idiomas soportados | en (solo ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder causal denso de la familia Qwen3. Sobre el se aplica un adaptador LoRA de rango 16 restringido a las capas de atencion, con el modelo base cargado en 4 bits mediante bitsandbytes y configurado con `num_labels=6` para la cabeza de clasificacion. Los pesos del adaptador se distribuyen como safetensors en formato PEFT, y la ficha indica que los mismos pesos fusionados en el modelo base estan publicados aparte en agk4444/aditya369.

El entrenamiento se realizo sobre el dataset dair-ai/emotion, con 16.000 ejemplos de entrenamiento, 2.000 de validacion y 2.000 de test, compuesto por textos cortos en ingles (mayoritariamente tweets). Se ejecutaron 3 epocas, equivalentes a unas 1.500 iteraciones, con gradient checkpointing activado, sobre una unica GPU T4 en Kaggle. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas adicionales de alineamiento; se trata de un fine-tuning supervisado convencional orientado a clasificacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion de emociones en textos cortos en ingles, con seis etiquetas mutuamente excluyentes: sadness (0), joy (1), love (2), anger (3), fear (4) y surprise (5).
- Salida mediante logits y argmax; el modelo devuelve una unica clase por entrada, sin puntuaciones de intensidad.
- Integracion directa con el ecosistema Hugging Face Transformers y PEFT: `AutoModelForSequenceClassification`, `AutoTokenizer` y `PeftModel`.
- Carga eficiente en memoria gracias a la cuantizacion 4-bit del modelo base con bitsandbytes.
- No soporta generacion de texto libre, tool calling, function calling, razonamiento multi-paso ni uso como agente: el adaptador esta especializado exclusivamente en clasificacion.
- No tiene capacidades de vision, audio ni multimodalidad.
- No es multilingue: solo se ha entrenado y evaluado en ingles.

## Casos de uso

- Moderacion y triaje de contenido en redes sociales: clasificar en tiempo real tweets o comentarios y derivar los marcados como anger o fear a un flujo de revision humana. La latencia de un clasificador de 4 bits sobre textos cortos permite procesar streams de alto volumen.
- Analisis de sentimiento del cliente en soporte tecnico: etiquetar tickets y encuestas por emocion para priorizar los casos de frustracion o anger antes que las consultas neutras.
- Monitorizacion de marca: procesar menciones en redes sociales a lo largo del tiempo y construir series temporales de emocion asociadas a un producto o campana.
- Investigacion en ciencias sociales y psicologia computacional: etiquetar corpus de texto en ingles de forma automatizada, reduciendo el coste frente al etiquetado manual, con la precision reportada del 93,50 %.
- Triaje en plataformas de bienestar o salud mental: detectar senales de sadness o fear en mensajes de usuarios y activar recursos de apoyo; requiere supervision humana y no debe usarse como diagnostico.
- Enrutado automatico de conversaciones en chatbots: usar la emocion detectada como variable de enrutado hacia distintos guiones o agentes de atencion al cliente.
- Generacion de etiquetas debiles (weak labeling) para preentrenar o ampliar otros clasificadores: el modelo actua como anotador automatico sobre grandes volumenes de texto antes de una fase de revision manual.
- Aplicaciones de diario emocional o bienestar personal: clasificar entradas escritas por el usuario y ofrecer resumenes agregados de su estado emocional a lo largo del tiempo.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de dair-ai/emotion (2.000 ejemplos retenidos), tal y como los publica el autor:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9350 |
| Macro F1 | 0,8907 |
| Weighted F1 | 0,9341 |
| Test loss | 0,2754 |

Resultados por clase en el mismo conjunto de test:

| Emocion | Precision | Recall | F1 | n |
|---|---|---|---|---|
| sadness | 0,968 | 0,979 | 0,973 | 581 |
| joy | 0,941 | 0,964 | 0,952 | 695 |
| love | 0,856 | 0,786 | 0,820 | 159 |
| anger | 0,942 | 0,942 | 0,942 | 275 |
| fear | 0,905 | 0,893 | 0,899 | 224 |
| surprise | 0,810 | 0,712 | 0,758 | 66 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks de LLM), algo esperable dado que se trata de un clasificador especializado y no de un modelo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en 4 bits, en torno a 3-4 GB, mas el adaptador (unos 70 MB). En precision fp16 el base de 4.000 millones de parametros requeriria aproximadamente 8-9 GB, mas overhead de activaciones.
- GPU recomendadas: el autor entreno el adaptador en una unica NVIDIA T4 (16 GB). Para inferencia es suficiente cualquier GPU con 8 GB o mas; una A100 o H100 resultaria sobredimensionada para esta carga.
- Compatibilidad con GPU de consumo: si, el modelo cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 3070, RTX 4070 o superiores en configuracion 4-bit.
- Opciones de despliegue: transformers + peft + bitsandbytes (flujo descrito en la model card). vLLM y TGI admiten adaptadores LoRA sobre el modelo base. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de coste de entrenamiento, el autor reporta unas 1.500 iteraciones en 3 epocas sobre una sola T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agk4444/aditya369-lora | ~4.000 M (base) + adaptador ~70 MB | no especificado en la ficha | Accuracy 0,9350; macro F1 0,8907 en dair-ai/emotion | apache-2.0 | Adaptador PEFT en safetensors |
| agk4444/aditya369 | ~4.000 M (pesos fusionados) | igual que el base | No se publican metricas propias distintas de las del adaptador | apache-2.0 | Modelo fusionado, 4-bit |
| Qwen/Qwen3-4B (modelo base sin adaptar) | ~4.000 M | 32.768 tokens nativos | No es un clasificador de emociones; no comparable directamente | apache-2.0 | safetensors |

No se han encontrado en la busqueda web modelos comparables con resultados publicados sobre el mismo dataset y la misma tarea. Las alternativas habituales a esta tarea serian clasificadores basados en encoders (BERT, RoBERTa, DistilBERT) entrenados sobre dair-ai/emotion, pero no se dispone de sus cifras en la informacion proporcionada, por lo que no se incluye comparacion numerica.

## Limitaciones y advertencias

- Solo ingles. El autor indica explicitamente que el modelo no se ha probado en otros idiomas.
- Dominio restringido a texto corto tipo tweet. No se ha validado sobre documentos largos, conversaciones extensas ni texto formal.
- Solo seis emociones gruesas y mutuamente excluyentes: no devuelve intensidad, no admite emociones mixtas y no cubre categorias como neutralidad, verguenza o culpa.
- Desequilibrio de clases evidente en los resultados: surprise obtiene un F1 de 0,758 con solo 66 ejemplos de test, y love un F1 de 0,820. El rendimiento en estas clases es notablemente inferior al de sadness o joy.
- Hereda los sesgos del modelo base Qwen3-4B y del dataset de tweets, que no es representativo de toda la poblacion ni de todos los registros linguisticos.
- Uso comercial permitido bajo licencia Apache 2.0, tanto para el adaptador como para el modelo base, sin restricciones adicionales declaradas.
- Riesgo de alucinacion bajo en terminos generativos (el modelo no genera texto), pero existe riesgo de clasificacion erronea en entradas ambiguas, sarcasticas o ironicas, frecuentes en el dominio de tweets.
- La model card no documenta el numero exacto de parametros entrenables del adaptador, la composicion detallada del split de entrenamiento ni los hiperparametros completos (learning rate, scheduler, batch size), lo que dificulta la reproducibilidad exacta.
- El fragmento de codigo de la model card usa `AutoModelForSequenceClassification` sobre Qwen3-4B, un modelo causal. Es posible que sea necesario `trust_remote_code` o una clase personalizada para que la cabeza de clasificacion con seis etiquetas se inicialice correctamente; conviene validar el flujo antes de llevarlo a produccion.
- La fecha de creacion y actualizacion registradas (2026-10-03) es posterior a la fecha habitual de publicacion de la familia Qwen3, dato a verificar si es relevante para el consumidor del modelo.
- El repositorio figura con 18 descargas y 0 likes, lo que indica validacion externa practicamente nula por parte de la comunidad.

## Enlaces

- Adaptador LoRA: https://huggingface.co/agk4444/aditya369-lora
- Modelo fusionado: https://huggingface.co/agk4444/aditya369
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/dair-ai/emotion
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Libreria bitsandbytes: https://huggingface.co/docs/bitsandbytes/index
- Explorador de modelos LoRA en Hugging Face: https://huggingface.co/models?search=lora
