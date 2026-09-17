# AzadDjan/Qwen3-4B-banking77-lora

## Resumen

AzadDjan/Qwen3-4B-banking77-lora es un adaptador LoRA publicado por el usuario AzadDjan que ajusta el modelo base Qwen/Qwen3-4B-Base para una tarea concreta de clasificación de texto: la predicción de la intención del cliente en consultas bancarias. El adaptador se ha entrenado sobre el dataset PolyAI/banking77, que contiene 77 clases de intención (por ejemplo, "card_arrival", "lost_or_stolen_card" o "transfer_not_received"), y se distribuye en formato PEFT con pesos safetensors, con licencia Apache 2.0.

El interés práctico del modelo no está en la generación de texto generalista, sino en reutilizar un transformer decoder de 4.000 millones de parámetros como clasificador de intenciones mediante un adaptador de bajo rango. Esto permite obtener un clasificador especializado sin reentrenar el modelo completo y manteniendo la posibilidad de descargar únicamente los pesos del adaptador, que ocupan 0,1 GB en el repositorio, sobre un modelo base ya disponible en el ecosistema HuggingFace.

Es relevante ahora porque los adaptadores LoRA sobre modelos generativos grandes se han consolidado como alternativa a los clasificadores BERT pequeños en dominios verticales, y porque el autor declara métricas altas en banking77 (accuracy de 0,9291 en la evaluación reportada y 0,9412 en el split de test), lo que lo convierte en un candidato a evaluar frente a alternativas más ligeras. Ahora bien, la model card es automática y no documenta composición del dataset de entrenamiento, idiomas soportados ni detalles de inferencia, por lo que la información disponible es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Base) con adaptador LoRA; el repositorio contiene únicamente el adaptador |
| Parametros totales | Modelo base: 4.000 millones (aprox.); adaptador LoRA: no disponible (tamaño de repositorio 0,1 GB) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-4B-Base) |
| Tipos de cuantizacion | No disponible para el adaptador; safetensors en el repositorio. Las cuantizaciones del modelo base (GGUF, AWQ, GPTQ) no se distribuyen aquí |
| Idiomas soportados | No disponible. El dataset de entrenamiento (banking77) está en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | peft |
| Dataset de entrenamiento | PolyAI/banking77 |
| Número de clases | 77 intenciones bancarias (según el dataset declarado) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base Qwen/Qwen3-4B-Base, un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. Sobre él se ha aplicado un ajuste supervisado con PEFT 0.21.0, Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. El dataset utilizado es PolyAI/banking77, orientado a clasificación de intenciones en el dominio bancario.

Los hiperparámetros documentados en la model card son: learning rate 0,0001, train_batch_size 16, eval_batch_size 32, semilla 42, optimizador AdamW (variante torch fused) con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y 20 épocas. No se documenta el rango del adaptador, las capas objetivo, el número de tokens de entrenamiento ni si hubo alguna fase de RLHF o DPO; la model card indica "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento.

Un dato técnico relevante es la dinámica de entrenamiento: la pérdida de entrenamiento cae hasta 0,0000 en la época 11, mientras la pérdida de validación repunta desde 0,4194 (época 2) hasta 0,5384 (época 11). Es un patrón compatible con sobreajuste a partir de las épocas intermedias, y el mejor punto de validación en términos de accuracy (0,9371) se alcanza en la época 8, no en la última.

## Capacidades

- Clasificación de texto en 77 clases de intención del dominio bancario (dataset banking77).
- Predicción de intención sobre consultas de clientes en lenguaje natural, con métricas declaradas de accuracy, precision, recall y F1.
- Aprovechamiento del modelo base Qwen3-4B-Base, lo que en teoría permite cargar el adaptador con transformers + peft sobre el mismo checkpoint base.
- Capacidades generativas del modelo base no documentadas para este adaptador: no hay evidencia en la información disponible de que las capacidades de generación, razonamiento o código del modelo base se conserven o se hayan evaluado tras el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el dataset de entrenamiento está en inglés).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- No se documenta plantilla de prompt, formato de salida ni mapeo de etiquetas a identificadores de clase en la model card.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el adaptador asigna cada consulta entrante a una de las 77 intenciones, lo que permite dirigirla automáticamente al equipo o al flujo de resolución correspondiente sin intervención humana en la primera capa de triaje.
- Clasificación previa en un pipeline RAG de banca: usar la intención detectada como filtro antes de recuperar documentación o productos concretos, reduciendo el espacio de búsqueda y mejorando la precisión del recuperador.
- Etiquetado automático de históricos de conversaciones: procesar en lote transcripciones de chat o correo para poblar analítica de motivos de contacto, midiendo qué intenciones generan más volumen por trimestre.
- Detección de intenciones sensibles (tarjeta perdida o robada, fraude, cargos no reconocidos) para activar protocolos de escalado inmediato a agentes humanos especializados.
- Preanálisis en asistentes virtuales conversacionales: el clasificador determina la intención del turno del usuario y el sistema decide si responde con una plantilla, consulta una API interna o transfiere a un agente.
- Evaluación comparativa de proveedores de clasificación: sirve como referencia open source frente a APIs propietarias de clasificación de texto en el dominio financiero, con licencia Apache 2.0 y despliegue en infraestructura propia.
- Investigación en ajuste eficiente de parámetros: caso de estudio de LoRA sobre un modelo generativo de 4B aplicado a una tarea discriminativa de 77 clases, útil para medir cuánta capacidad se necesita para igualar a clasificadores encoder pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas de forma independiente, campo `verified: false`):

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Text classification | banking77 | no especificado | Accuracy | 0,9291 |
| Text classification | banking77 | no especificado | Precision | 0,9337 |
| Text classification | banking77 | no especificado | Recall | 0,9305 |
| Text classification | banking77 | no especificado | F1 | 0,9282 |
| Intent classification | Banking77 | test | Accuracy | 0,9412 |
| Intent classification | Banking77 | test | Macro F1 | 0,9413 |
| Intent classification | Banking77 | test | Macro Precision | 0,9436 |
| Intent classification | Banking77 | test | Macro Recall | 0,9412 |

Pérdida de evaluación final declarada: 0,5384.

Evolución del entrenamiento por épocas (extracto de la tabla de la model card):

| Epoca | Paso | Training loss | Validation loss | Accuracy | F1 |
|---|---|---|---|---|---|
| 1.0 | 563 | 0,3882 | 0,4521 | 0,8851 | 0,8874 |
| 4.0 | 2252 | 0,0859 | 0,4403 | 0,9211 | 0,9241 |
| 8.0 | 4504 | 0,0029 | 0,5073 | 0,9371 | 0,9370 |
| 11.0 | 6193 | 0,0000 | 0,5384 | 0,9291 | 0,9282 |

No hay en la información proporcionada resultados comparables de otros modelos sobre banking77 medidos por el propio autor.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,1 GB), por lo que para inferencia es necesario descargar además el modelo base Qwen/Qwen3-4B-Base.
- Pesos del modelo base en bf16/fp16: aproximadamente 8-9 GB de VRAM solo para los pesos, más el espacio de activaciones y caché KV.
- Cuantización del modelo base a 8 bits: en torno a 4-5 GB de VRAM. A 4 bits (GGUF Q4/AWQ/GPTQ del base): aproximadamente 2,5-3 GB de VRAM.
- Cabe en GPU de consumo: sí, siempre que se pueda cargar el modelo base de 4B. Una RTX 3060 de 12 GB, RTX 4070 de 12 GB o RTX 4090 de 24 GB son suficientes en bf16, y una GPU de 8 GB con cuantización de 4 bits es un escenario plausible.
- Opciones de despliegue: transformers + peft para cargar el adaptador; vLLM o TGI si se fusiona el adaptador con el modelo base; llama.cpp/Ollama requieren convertir y fusionar previamente, ya que estos motores consumen GGUF del modelo completo.
- Latencia y throughput estimados: no disponibles. La carga útil del adaptador es pequeña, así que el coste de inferencia lo domina el modelo base de 4B.
- Para lotes grandes de clasificación, la VRAM adicional por lote depende de la longitud de secuencia de las consultas; no hay datos publicados de rendimiento en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-banking77-lora (este) | Adaptador LoRA sobre base de 4B | No disponible | Clasificación de 77 intenciones | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-4B-Base sin ajustar | 4.000 millones aprox. | No disponible en la información proporcionada | Generación de texto general | No disponible en la información proporcionada | HuggingFace (modelo base referenciado) |
| Clasificadores encoder pequeños ajustados en banking77 (BERT, DistilBERT, SetFit) | 66-340 millones típicamente | 512 tokens típicamente | Clasificación de 77 intenciones | Variable según modelo | Ampliamente disponibles, pero sin métricas comparables aportadas en esta información |

No se dispone de resultados de benchmarks de las alternativas medidos en condiciones idénticas a las de este adaptador, por lo que la comparación cuantitativa no es posible con los datos proporcionados. La comparación cualitativa apunta a que este adaptador exige mucho más cómputo y memoria que un encoder pequeño, a cambio de reutilizar la infraestructura de un modelo generativo y de una licencia Apache 2.0 permisiva.

## Limitaciones y advertencias

- La model card es automática y no documenta usos previstos, limitaciones, composición de datos ni proceso de anotación; las secciones correspondientes dicen "More information needed".
- Posible sobreajuste: la pérdida de entrenamiento llega a 0,0000 mientras la de validación sube hasta 0,5384, y el mejor accuracy de validación (0,9371) aparece en la época 8, no en la final.
- Las métricas declaradas no están verificadas (`verified: false`); no hay evaluación independiente publicada.
- Dominio muy restringido: solo 77 intenciones bancarias en inglés. El comportamiento fuera de ese dominio no está documentado y con alta probabilidad degrada.
- No hay confirmación de que el adaptador preserve las capacidades generativas, de razonamiento o de tool calling del modelo base; tratarlo como clasificador, no como asistente.
- No se documenta el mapeo entre las salidas del modelo y los identificadores de las 77 clases, ni la plantilla de prompt utilizada, lo que complica la reproducibilidad exacta de los resultados declarados.
- Idiomas soportados no declarados. Cualquier uso en castellano u otros idiomas requeriría validación propia, ya que el entrenamiento fue en inglés.
- Riesgo de sesgo heredado del dataset banking77 y del modelo base Qwen3: no hay análisis de sesgo en la información disponible.
- Riesgo de alucinación relevante si se usa el adaptador de forma generativa en lugar de como clasificador.
- Licencia Apache 2.0 en el adaptador: permite uso comercial, pero conviene verificar la licencia del modelo base y las condiciones del dataset banking77 para el caso de uso concreto.
- Repositorio sin tracción: 0 descargas y 0 likes, sin evidencia de mantenimiento posterior a la publicación.
- En producción, el coste de inferencia de un base de 4B para una tarea de clasificación de 77 clases puede ser desproporcionado frente a alternativas encoder; conviene medir latencia y coste antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AzadDjan/Qwen3-4B-banking77-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset: https://huggingface.co/datasets/PolyAI/banking77
- Paper de banking77 (Casanueva et al., 2020): https://arxiv.org/abs/2003.04807
- Librería PEFT: https://github.com/huggingface/peft
- Búsqueda web: los resultados obtenidos no contienen enlaces relevantes al modelo (corresponden a documentación de Google Translate), por lo que no se incluyen.
