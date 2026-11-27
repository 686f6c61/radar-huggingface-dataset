# hector-gr/CARE-Gemma-4-E2B-it-HotpotQA-seed44

## Resumen

CARE-Gemma-4-E2B-it-HotpotQA-seed44 es un ajuste fino del modelo multimodal Google Gemma 4 E2B-it, desarrollado por Hector G. Rodriguez para verbalizar la confianza que el modelo tiene en sus propias respuestas mediante el método CARE (Cross-question Abstention Reward Estimation). El objetivo es que el modelo no solo conteste preguntas, sino que emita una puntuación de confianza calibrada que permita aplicar predicción selectiva: abstenerse o derivar a un humano o a un modelo mayor cuando la confianza sea baja.

El modelo parte de una arquitectura Gemma 4 con 5.506.950.723 parámetros totales y ha sido post-entrenado sobre el conjunto de datos HotpotQA de preguntas y respuestas multi-salto en Wikipedia. La innovación clave frente a métodos anteriores es que la recompensa de confianza se calcula de forma relativa entre un conjunto de preguntas, en lugar de contra la etiqueta binaria de acierto/error de cada pregunta individual, lo que produce distribuciones de confianza más informativas para umbrales de riesgo no nulos.

Es relevante para desarrolladores e investigadores que despliegan sistemas con requisitos de fiabilidad y tolerancia al riesgo controlada, ya que permite maximizar la cobertura (preguntas respondidas) sujeto a un riesgo máximo de error. El checkpoint corresponde a la semilla 44 y el paper reporta resultados como la media de las semillas 43 y 44.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con codificadores de visión y audio congelados en este ajuste |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 4 E2B-it de Google DeepMind (revisión `70af34e20bd4b7a91f0de6b22675850c43922a03`), un transformer multimodal con codificadores de visión y audio. En este checkpoint concreto, el post-entrenamiento es exclusivamente de texto: los codificadores de visión y audio se congelaron y el uso multimodal no ha sido evaluado. El entrenamiento se realizó sobre el dataset HotpotQA (`mehuldamani/hotpot_qa`), con configuración de batch por dispositivo 4, acumulación de gradiente 128 y longitud máxima de finalización de 1536 tokens.

La innovación técnica es el método CARE, descrito en el paper *Cross-Question Reliable Reinforcement Learning* de Hector G. Rodriguez y Marcus Rohrbach. A diferencia de los métodos que refuerzan la confianza de cada par pregunta-respuesta de forma individual (empujando a 1 en aciertos y a 0 en errores), CARE calcula la recompensa sobre un conjunto de pares: en cada uno de varios umbrales de tolerancia al riesgo, las confidencias del conjunto inducen un umbral de abstención y cada confianza se recompensa por situarse en el lado correcto de dicho umbral. Esto refuerza cada confianza verbalizada en relación con las demás preguntas y no contra su propia etiqueta binaria. El trabajo se apoya en RLCR (*Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty*, Damani et al., 2025).

## Capacidades

- Generación de texto conversacional y respuesta a preguntas, incluyendo preguntas multi-salto sobre Wikipedia (HotpotQA).
- Verbalización de la confianza en la propia respuesta: la salida incluye etiquetas `<answer>...</answer>` y `<confidence>...</confidence>`.
- Predicción selectiva: permite ordenar respuestas por confianza y aplicar umbrales de abstención según la tolerancia al riesgo.
- Razonamiento multi-salto: entrenado específicamente sobre un dataset de QA que requiere combinar información de varios documentos.
- Capacidades heredadas del modelo base Gemma 4 E2B-it (visión y audio) presentes en la arquitectura pero no evaluadas ni ajustadas en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente con derivación inteligente: el modelo responde consultas y emite una confianza; los casos con confianza por debajo de un umbral se derivan a un agente humano, reduciendo el riesgo de respuestas erróneas en producción.
- Enrutamiento entre modelos (model cascading): se usa el modelo pequeño para preguntas de alta confianza y se deriva a un modelo mayor o a un humano el resto, optimizando coste y latencia.
- Control de calidad en pipelines de QA automatizado: ordenar las respuestas generadas por confianza permite a un revisor humano priorizar solo las respuestas dudosas.
- Investigación en calibración y uncertainty estimation: el checkpoint sirve como referencia reproducible (semilla 44) para comparar métodos de recompensa de confianza frente a CARE.
- Sistemas de respuesta sobre documentación o bases de conocimiento con requisitos regulatorios: la posibilidad de abstenerse explícitamente ayuda a cumplir políticas de "no responder si no se está seguro".
- Evaluación de tolerancia al riesgo en dominios sensibles: ajustando el umbral de confianza sobre datos de validación, se puede fijar una cobertura objetivo con un riesgo máximo de error medible.
- Generación de respuestas multi-salto sobre corpus tipo Wikipedia: útil en asistentes de investigación que combinan información de varias fuentes.

## Benchmarks y rendimiento

Resultados de predicción selectiva del checkpoint (valores en %). ID corresponde a HotpotQA (hotpot-judge); OOD agrega math-500, gsm8k, commonsenseqa, gpqa, simpleqa y trivia. C@r es la cobertura con riesgo r; AURC, menor es mejor.

| Conjunto | C@0 | C@1 | C@5 | C@10 | AURC ↓ | Accuracy |
|---|---:|---:|---:|---:|---:|---:|
| ID (HotpotQA) | 0,0 | 0,0 | 59,2 | 92,8 | 6,0 | 87,7 |
| OOD | 1,1 | 2,1 | 3,5 | 19,9 | 34,7 | 55,5 |

El paper reporta que CARE eleva la cobertura al 5% de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8% al 42,4% frente a recompensas puntuales de acierto, y que, entrenado sobre HotpotQA, mejora C@5 en benchmarks OOD de conocimiento general, razonamiento y matemáticas (CommonsenseQA, GPQA, SimpleQA y TriviaQA) del 12,3% al 23,6%. La tabla del paper para Gemma reporta la media de las semillas 43 y 44.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 5.506.950.723 parámetros en safetensors, los pesos en FP16 ocupan aproximadamente 11 GB, lo que da una referencia mínima de memoria.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; por tamaño de pesos, sería necesario evaluar cuantizaciones (no publicadas) para GPUs de consumo.
- Opciones de despliegue: la model card indica que se requiere un runtime compatible con Gemma 4; la librería declarada es transformers. No se confirman vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada para establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CARE-Gemma-4-E2B-it-HotpotQA-seed44 | 5.506.950.723 | no disponible | Apache 2.0 | Ajuste CARE para confianza verbalizada |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Apache 2.0 | Modelo base multimodal sin post-entrenamiento CARE |
| Alternativas de predicción selectiva | no disponible | no disponible | no disponible | No hay datos en la información disponible |

## Limitaciones y advertencias

- La confianza verbalizada no es una garantía de corrección; debe calibrarse un umbral sobre datos de validación adecuados antes de usarla en producción.
- El ajuste es solo de texto: los codificadores de visión y audio se congelaron y el uso multimodal no se ha evaluado.
- Es necesario usar exactamente el system prompt de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`; desviarse puede degradar la calidad de las confidencias.
- La evaluación del paper se realizó con una sola completion, temperatura 0 y un límite de generación de 4096 tokens; otros ajustes de decodificación no están validados.
- El modelo está entrenado sobre HotpotQA; su comportamiento en dominios muy distintos (matemáticas, conocimiento general) muestra una cobertura baja a riesgo bajo en OOD (C@0 de 1,1%, C@5 de 3,5%), lo que limita su uso directo fuera de distribución.
- Sesgos conocidos: no disponibles en la información proporcionada; al heredar el modelo base, es previsible que arrastre sus sesgos, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información proporcionada; la propia naturaleza del método busca mitigarlo mediante abstención, no eliminarlo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la licencia y el aviso de modificación del modelo base; conviene revisar los términos de Gemma 4 de Google DeepMind.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre un dataset en inglés, por lo que el rendimiento en castellano no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Gemma-4-E2B-it-HotpotQA-seed44
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/hotpot_qa
- Paper CARE (Cross-Question Reliable Reinforcement Learning, Rodriguez y Rohrbach): no disponible en la información proporcionada
- Paper RLCR (Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty, Damani et al., 2025): no disponible en la información proporcionada
