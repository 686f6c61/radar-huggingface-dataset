# japan-opendata/ja-injection-guard-v1

## Resumen

ja-injection-guard-v1 es un clasificador de texto de pequeno tamano desarrollado por japan-opendata, disenado para detectar intentos de prompt injection en entradas dirigidas a modelos de lenguaje. El modelo recibe texto en japones o ingles y devuelve una probabilidad de que la entrada constituya un ataque (sobreescritura de instrucciones, extraccion de informacion, secuestro de rol, historial falso, ofuscacion o inyeccion indirecta). Esta pensado como una capa mas dentro de una defensa en profundidad, no como garantia de seguridad por si solo.

Tecnicamente se construye sobre sbintuitions/modernbert-ja-130m, un encoder ModernBERT adaptado al japones, y se afina como clasificador de secuencias binario. Cuenta con 132.404.226 parametros totales, un repositorio de 1,1 GB y pesos en safetensors y ONNX (fp32). Su diseno prioriza un bajo indice de falsos positivos: la metrica principal es la tasa de deteccion de ataques manteniendo el falso positivo por debajo del 1 %.

Es relevante porque aborda un problema practico de produccion en sistemas LLM (filtrado de entradas en japones e ingles) con un modelo lo bastante pequeno para ejecutarse en CPU con latencias de decenas de milisegundos, y porque publica una evaluacion sobre un conjunto de test sellado con desglose por tipo de ataque y por tipo de texto benigno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), clasificacion de secuencias binaria |
| Parametros totales | 132.404.226 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens en la tokenizacion de uso recomendada (truncation max_length=1024) |
| Tipos de cuantizacion | ONNX fp32 incluido; INT8 no incluido por aumento medido de falsos positivos |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (onnx/model.onnx, fp32) |

## Arquitectura y entrenamiento

El modelo es un encoder tipo ModernBERT (no generativo) afinado para clasificacion binaria de texto: la salida es una probabilidad de ataque obtenida mediante softmax sobre los logits. Parte del checkpoint sbintuitions/modernbert-ja-130m (licencia MIT), lo que aporta un encoder optimizado para japones con 132,4 millones de parametros.

El entrenamiento se realizo durante una sola epoca sobre 45.000 ejemplos, combinando datos publicos con licencia verificada y datos sinteticos propios: lm-nogood/llmail-inject-challenge (MIT), facebook/browsesafe-bench (MIT) y generacion propia de ataques en japones e ingles, ademas de documentos benignos de longitud variable construidos a partir de un pool de parrafos diversificado. Se comprobo empiricamente que dos epocas incrementaban la sobrerreaccion frente a texto benigno, por lo que se fijo una epoca. El umbral recomendado (0,394) se fijo a priori sobre datos de desarrollo y no se ajusto sobre el conjunto de test sellado. No se menciona uso de RLHF ni DPO, algo coherente con un clasificador supervisado.

## Capacidades

- Clasificacion binaria de prompt injection: devuelve una probabilidad de ataque por entrada, con umbral recomendado de 0,394.
- Deteccion por tipo de ataque: sobreescritura de instrucciones (override), historial de conversacion falso (fake_history), inyeccion indirecta (indirect), secuestro de rol (role_hijack), ofuscacion (obfuscation) y extraccion de informacion (extraction).
- Bilingue japones-ingles, con entrenamiento especifico en ambos idiomas.
- Inferencia en CPU: version ONNX fp32 con predicciones identicas al modelo PyTorch en una comparacion de 200 casos.
- Integracion como filtro previo a un LLM en pipelines de defensa en profundidad.
- No realiza generacion de texto, tool calling, razonamiento multi-paso ni procesamiento de vision o audio: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada antes de un LLM: se evalua cada prompt del usuario con el clasificador y, si la probabilidad supera 0,394, se bloquea o se deriva a revision. Adecuado por su bajo falso positivo (0,0044) en texto benigno, que limita la friccion con usuarios legitimos.
- Proteccion de aplicaciones de atencion al cliente en japones: se intercala entre el front-end conversacional y el modelo generativo para detectar intentos de sobreescritura de instrucciones o extraccion del system prompt, con una tasa de deteccion del 100 % en ataques de tipo override y fake_history.
- Defensa frente a inyeccion indirecta en pipelines RAG: el modelo detecta contenido malicioso embebido en documentos recuperados (tasa 0,9667 en el conjunto de test), por lo que puede aplicarse a cada fragmento recuperado antes de insertarlo en el contexto del LLM.
- Moderacion en entornos bilingues japones-ingles: util en plataformas donde conviven ambos idiomas y se necesita una capa de seguridad con licencia Apache 2.0 y despliegue en CPU sin GPU dedicada.
- Monitorizacion y auditoria de trafico: ejecucion por lotes sobre logs de prompts para identificar patrones de ataque y alimentar paneles de seguridad, gracias al throughput en CPU (mediana de 50 ms por caso en un Core i7-11700F).
- Gate de seguridad en agentes con herramientas: antes de permitir que un agente ejecute una accion o llame a una herramienta, se clasifica la instruccion de entrada para reducir el riesgo de secuestro de rol (tasa 0,9467 en test).
- Prefiltro en cascada con modelos mayores: al ser pequeno y rapido, se usa como primera etapa que descarta la mayoria de ataques claros y deja solo los casos dudosos a un clasificador o revisor mas costoso.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de test sellado de 2.500 casos, no usado en entrenamiento ni en la seleccion del umbral.

| Metrica | Umbral 0,394 (recomendado) | Umbral 0,5 |
|---|---|---|
| Tasa de deteccion de ataques | 0,9300 | 0,9222 |
| Tasa de falsos positivos en texto benigno | 0,0044 | 0,0044 |
| F1 | 0,9599 | 0,9557 |

Deteccion por tipo de ataque (umbral 0,394):

| Tipo de ataque | Tasa de deteccion |
|---|---|
| Override (sobreescritura de instrucciones) | 1,0000 |
| Fake history (historial falso) | 1,0000 |
| Indirect (inyeccion indirecta) | 0,9667 |
| Role hijack (secuestro de rol) | 0,9467 |
| Obfuscation (ofuscacion) | 0,8933 |
| Extraction (extraccion de informacion) | 0,7733 |

Falsos positivos por tipo de texto benigno (umbral 0,394):

| Tipo de texto benigno | Tasa de falsos positivos |
|---|---|
| Benign hard (benigno confusable) | 0,0000 |
| Benign long (documento largo) | 0,0067 |
| Benign (estandar) | 0,0060 |

Evaluacion externa:

| Conjunto | Tamano | Tasa de falsos positivos |
|---|---|---|
| XSTest (lado safe) | 250 | 0,0000 |
| NotInject (no usado en entrenamiento) | 170 | 0,0941 |

Rendimiento de inferencia: en CPU (Core i7-11700F), con la version ONNX fp32 y entradas equivalentes a datos reales, 104 ms de media por caso y 50 ms de mediana.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 132,4 millones de parametros; en fp32 ocupa aproximadamente 0,5 GB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 2 GB o mas de VRAM.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU; en GPU, cualquier tarjeta moderna (RTX 3060 en adelante, A100, H100) sirve sin problema, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU consumer: si, en cualquier GPU consumer actual e incluso en placas integradas para inferencia en CPU.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), ONNX Runtime con el archivo onnx/model.onnx incluido, y servidores de inferencia compatibles con modelos de clasificacion de Hugging Face (por ejemplo, Text Embeddings Inference o endpoints de inferencia gestionados). No se documentan recetas especificas para vLLM, llama.cpp ni Ollama, ya que es un encoder de clasificacion, no un modelo generativo.
- Latencia y throughput: 104 ms de media y 50 ms de mediana por caso en un Core i7-11700F con ONNX fp32. No se publican cifras de throughput agregado ni de latencia en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros guardas de prompt injection en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ja-injection-guard-v1 | 132,4 M | 1.024 tokens | ja, en | Apache 2.0 | Clasificador ModernBERT afinado |
| sbintuitions/modernbert-ja-130m (modelo base) | ~130 M | no disponible | ja | MIT | Encoder de lenguaje general, no clasificador |
| Guardas de prompt injection de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- La deteccion de ataques de tipo extraction es notablemente inferior al resto: 0,7733 frente a 1,0000 en override o fake_history.
- El falso positivo en NotInject (texto benigno confusable, multilingue) alcanza 0,0941, casi un 9,4 %; fuera de japones e ingles el riesgo de falsos positivos aumenta.
- En entradas de mas de 512 caracteres el falso positivo sube: 0,0211 en el subconjunto de documentos largos del test sellado.
- No garantiza seguridad por si solo; el autor lo plantea explicitamente como una capa dentro de una defensa en profundidad.
- Es un clasificador binario: no explica el motivo de la clasificacion ni genera texto, y no cubre otras amenazas (por ejemplo, salidas daninas del LLM o fugas de datos en la respuesta).
- La version INT8 no se incluye porque se midio un aumento de falsos positivos; desplegar cuantizacion propia requiere revalidar el umbral.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion y revisar las licencias de los datos de entrenamiento citados (MIT, CC BY 4.0) si se redistribuye el modelo.
- El umbral 0,394 esta calibrado para el conjunto de desarrollo del autor; en dominios distintos conviene recalibrar sobre datos propios.
- Riesgo de alucinacion no aplicable al ser un clasificador, pero si existe riesgo de clasificacion erronea (falsos negativos en ataques sutiles y falsos positivos en texto confusable).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/japan-opendata/ja-injection-guard-v1
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-130m
- Dataset lm-nogood/llmail-inject-challenge: https://huggingface.co/datasets/lm-nogood/llmail-inject-challenge
- Dataset facebook/browsesafe-bench: https://huggingface.co/datasets/facebook/browsesafe-bench
- NotInject: https://huggingface.co/datasets/leolee99/NotInject
- XSTest: https://huggingface.co/datasets/Paul/XSTest
