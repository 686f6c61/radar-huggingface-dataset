# ShaliniSrivastava/toolcall-verifier-modernbert-v3b

## Resumen

`toolcall-verifier-modernbert-v3b` es un clasificador de texto de 149,6 millones de parámetros desarrollado por Shalini Srivastava, construido mediante un ajuste fino supervisado de `answerdotai/ModernBERT-base`. Su función es evaluar, antes de su ejecución, una llamada a herramienta propuesta por un agente LLM conversacional: recibe la conversación completa entre usuario y agente junto con una llamada candidata y devuelve la probabilidad de que dicha llamada sea incorrecta. El modelo está diseñado específicamente para flujos de atención al cliente del estilo de τ²-bench (pedidos minoristas, reservas aéreas y líneas de telecomunicaciones).

La relevancia del modelo radica en su perfil de coste y despliegue: con unos 150 millones de parámetros puede ejecutarse en la CPU de un portátil en aproximadamente 0,7 segundos por llamada, sin coste de API y sin que las conversaciones abandonen la máquina del operador. Según la model card, en el conjunto de test humano de 363 filas alcanza un AUROC de 0,771, frente a 0,719 de GPT-5-mini, 0,619 de GPT-5-nano y 0,675 de la heurística basada en longitud. Se posiciona, por tanto, como una señal de triaje barata y local para detectar errores reales de agentes, no como una barrera automática de bloqueo.

El modelo se publica con licencia Apache-2.0 (los pesos son una versión modificada de ModernBERT-base, también Apache-2.0) y está orientado exclusivamente a inglés. Su contexto de entrenamiento es de hasta 4.096 tokens, aunque la arquitectura base soporta 8.192.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `ModernBertForSequenceClassification` (transformer encoder), 22 capas, hidden size 768, pooling `[CLS]`, 2 etiquetas (0 correcto, 1 incorrecto) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens usados en entrenamiento; la arquitectura soporta 8.192 |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones específicas; el checkpoint se distribuye en fp32/fp16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (pesos); etiquetas del test set publicado bajo CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`, 598.439.784 bytes), más `config.json`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer de 22 capas con hidden size 768, y se ajusta como clasificador de secuencias con pooling `[CLS]` y dos etiquetas (correcto/incorrecto). La entrada se construye con la función `format_input_v2`, que incluye un bloque de política (policy block) además de la conversación y la llamada propuesta; el repositorio incluye `predict.py` y el directorio `data/` con el texto de política de las 18 herramientas de escritura, los esquemas de herramientas de los tres dominios de τ²-bench y los umbrales de los puntos de operación. Según la model card, el código de `predict.py` reproduce carácter por carácter la entrada de entrenamiento para las 363 filas del test.

El entrenamiento se realizó en una única GPU T4 de Kaggle, en fp16, durante 3 épocas, con learning rate 2e-5, batch efectivo de 16 (micro-batch 2 con 8 pasos de acumulación) y semilla 42; el run completo duró 1,9 horas (6.780 s) y el checkpoint publicado corresponde a la mejor época según F1 de validación. Los datos de entrenamiento combinan conversaciones de atención al cliente en inglés de τ²-bench con datos de function calling de BFCL. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa; es un ajuste fino supervisado de clasificación.

## Capacidades

- Clasificación binaria de llamadas a herramienta: devuelve la probabilidad de que una llamada propuesta sea incorrecta antes de ejecutarse.
- Detección de siete tipos de error: valor de argumento incorrecto, estado obsoleto (un valor que el usuario ha cambiado después), herramienta equivocada, llamada repetida, fallo al propagar el resultado de una herramienta, error de herramienta ignorado y violación de política.
- Lectura de conversaciones multi-turno con contexto de hasta 4.096 tokens, incluyendo el bloque de política de las herramientas.
- Integración con flujos de agentes como señal de triaje: enrutar puntuaciones altas a revisión humana, a un segundo modelo o a un reintento.
- Ejecución local en CPU sin coste de API y sin salida de datos del entorno del operador.
- Soporte de tool calling / function calling: no genera llamadas, sino que las verifica; el modelo en sí no emite tool calls.
- Capacidades multilingües: no disponibles; solo inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- Triaje previo a la ejecución en agentes de atención al cliente: el modelo puntúa cada llamada propuesta en flujos de pedidos, reservas aéreas o telecomunicaciones y las de mayor puntuación se derivan a revisión humana antes de ejecutarse, reduciendo el coste de errores irreversibles en operaciones de escritura.
- Detección de estado obsoleto en conversaciones largas: cuando el usuario ha cambiado un valor (por ejemplo, una dirección o una fecha) y el agente propone una llamada con el valor antiguo, el clasificador puede marcarla como sospechosa gracias a su ventana de 4.096 tokens sobre la conversación completa.
- Verificación de propagación de resultados de herramientas: si el agente ignora el resultado de una llamada anterior o no propaga un error devuelto por la herramienta, el verificador puede señalar la siguiente llamada como potencialmente incorrecta.
- Segunda opinión local frente a APIs de modelos grandes: en despliegues con requisitos de privacidad o sin presupuesto de API, el modelo ofrece una señal de verificación en CPU a ~0,7 s por llamada, sin enviar conversaciones a terceros.
- Filtrado en pipelines de evaluación de agentes: durante el desarrollo de un agente, el verificador puede puntuar automáticamente las llamadas generadas en tests de regresión y priorizar la revisión manual de las que presentan mayor riesgo.
- Control de cumplimiento de política en herramientas de escritura: con el texto de política de las 18 herramientas incluido en `data/`, el modelo puede detectar llamadas que violan restricciones operativas definidas para el dominio de atención al cliente.
- Enrutado a reintento con contexto: las llamadas marcadas pueden devolverse al agente para que reintente con la información señalada, usando la puntuación como señal de parada o de escalado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Verificación pre-ejecución de llamada a herramienta (incorrecto vs correcto) | Test set real revisado por humanos (363 filas, τ²-bench retail, airline, telecom) | AUROC (IC bootstrap 95%) | 0,771 (0,720–0,818) |

Comparativas citadas en la model card (mismo test set de 363 filas):

| Modelo / método | AUROC |
|---|---|
| toolcall-verifier-modernbert-v3b | 0,771 |
| GPT-5-mini | 0,719 |
| Heurística de longitud | 0,675 |
| GPT-5-nano | 0,619 |

Puntos de operación declarados: con el umbral que marca el 10% de llamadas correctas como falsos positivos, el modelo detecta el 33% de los errores; con el umbral del 5%, detecta el 23%. El autor indica explícitamente que es una señal de triaje y no una barrera que detenga la mayoría de errores.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint safetensors ocupa 598 MB; en fp32 son aproximadamente 0,6 GB de pesos, y en fp16 unos 0,3 GB. Con overhead de activaciones para 4.096 tokens, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU; el autor reporta ejecución en CPU de portátil en ~0,7 s por llamada. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) acelera la inferencia, aunque no es necesaria.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: `transformers` (librería indicada en la model card), `text-embeddings-inference` (tag `text-embeddings-inference` y `endpoints_compatible` en los tags del repositorio), y despliegue en Hugging Face Inference Endpoints. No se documentan instrucciones específicas para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: ~0,7 s por llamada en CPU de portátil según el autor; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | AUROC en el test de 363 filas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| toolcall-verifier-modernbert-v3b | 149,6 M | 4.096 (soporta 8.192) | Clasificación de llamadas a herramienta | 0,771 | Apache-2.0 | Hugging Face |
| GPT-5-mini | no disponible | no disponible | Verificación vía prompt | 0,719 | propietaria | API |
| GPT-5-nano | no disponible | no disponible | Verificación vía prompt | 0,619 | propietaria | API |
| Heurística de longitud | n/a | n/a | Baseline | 0,675 | n/a | n/a |

No se dispone en la información proporcionada de otros clasificadores abiertos comparables de verificación de llamadas a herramienta; la comparativa se limita a los modelos y baselines citados en la model card del autor.

## Limitaciones y advertencias

- No es una barrera automática: en el umbral estricto (10% de falsos positivos) deja pasar dos de cada tres errores (recall 0,33); no debe usarse para bloquear o aprobar llamadas con consecuencias reales sin humano en el bucle.
- Las puntuaciones no están calibradas: los umbrales publicados son ajustes basados en ranking, no probabilidades calibradas; no deben interpretarse como probabilidad real de error.
- Dominio limitado: entrenado y evaluado solo con conversaciones en inglés de atención al cliente de τ²-bench más datos de function calling de BFCL; el comportamiento en otros dominios, otras herramientas u otros idiomas no está probado.
- Solo inglés: no soporta otros idiomas.
- No explica el motivo del error: devuelve una puntuación, no una razón; las etiquetas de subrazón de la Clase 7 son ayudas de etiquetado, no salidas del modelo.
- No apto para seguridad: no fue entrenado ni evaluado para detectar llamadas maliciosas o inyectadas.
- Dependencia del formato de entrada: debe usarse `predict.py` con `format_input_v2` y el bloque de política; construir la entrada de otra forma puede degradar el rendimiento.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir falsos positivos y falsos negativos; el autor documenta explícitamente ambos.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos son una versión modificada de ModernBERT-base (también Apache-2.0); deben conservarse los avisos `NOTICE` y `THIRD_PARTY_NOTICES.md`.
- Madurez: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y los resultados no están verificados de forma independiente (`verified: false` en el model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShaliniSrivastava/toolcall-verifier-modernbert-v3b
- Código y resultados en GitHub: https://github.com/Shalini-Srivastavaaa/toolcall-verifier
- Test set etiquetado por humanos (dataset): https://huggingface.co/datasets/ShaliniSrivastava/toolcall-verifier-test-set
- Registro de decisiones del proyecto: https://github.com/Shalini-Srivastavaaa/toolcall-verifier/blob/main/docs/decision_log.md
- Writeup del proyecto: https://github.com/Shalini-Srivastavaaa/toolcall-verifier/blob/main/docs/writeup.md
- Guía de etiquetado: https://github.com/Shalini-Srivastavaaa/toolcall-verifier/blob/main/docs/labeling_guide.md
- Avisos de terceros: https://github.com/Shalini-Srivastavaaa/toolcall-verifier/blob/main/THIRD_PARTY_NOTICES.md
- Licencia de datos: https://github.com/Shalini-Srivastavaaa/toolcall-verifier/blob/main/DATA_LICENSE.md
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
