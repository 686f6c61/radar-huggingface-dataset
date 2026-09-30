# Compactbot/testr-100k

## Resumen

Testr-100k es un modelo de lenguaje causal a nivel de carácter entrenado desde cero por el usuario Compactbot, un agente de IA desarrollado por el equipo de Glint Research para asistir a la comunidad de modelos de lenguaje pequenos (SLM). El modelo responde a la peticion numero 17 del espacio model-requests de Compactbot y su proposito declarado no es la generacion de texto util, sino demostrar que es posible entrenar un transformer funcional con un presupuesto de parametros extremadamente reducido. Con 106.568 parametros segun la model card (100.936 segun el recuento real de los safetensors), es un ejercicio de ingenieria reproducible mas que una herramienta de produccion.

La arquitectura sigue el estilo nanoGPT: un transformer causal minimo de 4 capas, dimension de embedding 44, 2 cabezas de atencion, FFN con activacion GELU y factor 2,667, normalizacion LayerNorm con pre-norm, codificacion posicional RoPE con theta 100000 y embeddings atados entre entrada y cabeza de salida. Opera sobre un vocabulario de 128 caracteres mas un token UNK, con una longitud de contexto de 512 caracteres (no tokens). El entrenamiento consumio 191 MB de texto web a nivel de caracter en formato uint8 durante 8.000 pasos sobre una RTX 5090.

Su relevancia actual es fundamentalmente pedagogica y metodologica: sirve como caso de referencia de entrenamiento desde cero, como banco de pruebas para tokenizadores a nivel de caracter y como linea base de perplexidad en el regimen sub-1M. Conviene subir el liston de expectativas muy bajo: el propio autor advierte que el texto degenera en bucles de repeticion tras dos o tres frases y que la perplexidad de validacion es de 39,77 sobre 1 millon de caracteres reservados del mismo corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo nanoGPT, a nivel de caracter |
| Parametros totales | 100.936 segun safetensors (106.568 segun la model card del autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 caracteres |
| Tipos de cuantizacion | No disponible (pesos publicados en float32); cuantizacion no documentada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 408 KB); config.json y vocab.json en JSON |

Detalle adicional de configuracion:

| Parametro | Valor |
|---|---|
| Capas | 4 |
| Dimension de embedding | 44 |
| Cabezas de atencion | 2 |
| FFN | GELU, multiplicador 2,667 |
| Codificacion posicional | RoPE (theta = 100000) |
| Normalizacion | LayerNorm (pre-norm) |
| Vocabulario | 128 caracteres + 1 token UNK |
| Embeddings atados | Si (cabeza de salida = embedding) |
| dtype de entrenamiento | float32 |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only minimo con pre-norm, LayerNorm y RoPE. La eleccion de RoPE con theta 100000 es inusualmente alta para un contexto de solo 512 caracteres, lo que sugiere que el autor reutilizo una configuracion estandar de nanoGPT sin ajustarla al regimen de contexto corto. Los embeddings estan atados entre la capa de entrada y la cabeza de proyeccion al vocabulario, practica habitual para reducir parametros en modelos muy pequenos. El vocabulario es puramente a nivel de caracter (128 simbolos ASCII mas UNK), por lo que el modelo no tiene representacion de palabras y no puede ser evaluado con benchmarks de nivel de palabra como BLiMP o ARC.

El entrenamiento uso 191 MB de texto web codificado a nivel de caracter en uint8, durante 8.000 pasos con batch de 32 secuencias de 512 caracteres. El optimizador combina Muon con tasa 0,02 para las matrices y AdamW con tasa 1e-4 para sesgos y parametros de normalizacion, con un schedule de decaimiento coseno y warmup. Todo el entrenamiento se ejecuto en una unica RTX 5090 de 32 GB en float32. No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion, ni tampoco tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto a nivel de caracter en ingles: produce secuencias de caracteres que imitan la estadistica del texto web, con estructura superficial gramatical en la primera o segunda frase.
- Modelado de estadisticas de caracteres del ingles, util para estudiar como un transformer aprende regularidades ortograficas y de puntuacion.
- Generacion de muestras con decodificacion greedy (temperatura 0) y con muestreo estocastico (temperatura 0,7), con comportamientos claramente diferenciados: greedy tiende a bucles de repeticion inmediatos, el muestreo a 0,7 alarga algo mas la variedad antes de degenerar.
- No soporta tool calling ni function calling.
- No soporta uso agentico ni razonamiento multi-paso.
- No soporta vision, audio ni ninguna modalidad adicional.
- No soporta modo thinking ni cadenas de razonamiento explicitas.
- Capacidad multilingue nula: el vocabulario de 128 caracteres y el corpus de entrenamiento son de ingles.
- No es capaz de realizar tareas de codigo, matematicas, resumen, traduccion ni respuesta a instrucciones.

## Casos de uso

- Material didactico para cursos de transformers: al ser un modelo de 4 capas y 44 dimensiones, es posible recorrer el grafo completo a mano, inspeccionar las matrices de atencion y explicar el flujo de un decoder-only sin abstracciones. El checkpoint de 408 KB se carga en cualquier portatil.
- Banco de pruebas de tokenizadores a nivel de caracter: permite comparar el impacto de variaciones en el vocabulario (128 caracteres frente a vocabularios mayores o menores) sobre la perplexidad y la estabilidad del entrenamiento, manteniendo constante el resto de la arquitectura.
- Prueba de humo (smoke test) de pipelines de entrenamiento: un modelo de 100.936 parametros entrena en minutos, por lo que sirve para validar que un bucle de entrenamiento, un cargador de datos en uint8 o un sistema de checkpoints funciona antes de escalar a modelos mayores.
- Validacion de infraestructura de inferencia: al publicarse en safetensors con embeddings atados y pesos en float32, es un caso minimo para verificar que un cargador propio, un script de conversion o una herramienta de evaluacion leen correctamente config.json y vocab.json.
- Linea base en estudios de perplexidad sub-1M: su valor de 39,77 en validacion sobre 1M de caracteres reservados sirve como referencia inferior para comparar tecnicas de regularizacion, inicializacion o schedules de learning rate en el mismo corpus.
- Demostracion de entrenamiento desde cero en una unica GPU consumer: reproduce el flujo completo (datos, optimizador Muon mas AdamW, schedule coseno) en una sola tarjeta, lo que resulta util para documentar costes reales de entrenamiento a esta escala.
- Generacion de datos sinteticos de caracteres para pruebas de robustez de otros sistemas: dado que degenera en repeticiones, es adecuado para generar entradas adversarias o de estres para analizadores de texto, no para aumentar datasets reales.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Perplexidad de validacion (nivel de caracter) | 39,77 | Sobre 1M de caracteres reservados del mismo corpus de entrenamiento |
| MMLU | No disponible | El modelo no puede evaluarse a nivel de palabra |
| HumanEval | No disponible | No evaluado |
| GSM8K | No disponible | No evaluado |
| BLiMP | No disponible | El autor indica explicitamente que el modelo no puede leer benchmarks de nivel de palabra |
| ARC | No disponible | El autor indica explicitamente que el modelo no puede leer benchmarks de nivel de palabra |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. El autor no incluye comparaciones cuantitativas con otros modelos, mas alla de senalar que no es comparable a modelos sub-1M a nivel de subword en ninguna metrica de nivel de palabra. Las muestras cualitativas publicadas (greedy y temperatura 0,7) muestran frases iniciales plausibles seguidas de bucles de repeticion del tipo "to the box and said".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 MB de pesos en float32, mas el estado de activaciones para un contexto de 512 caracteres; cabe en cualquier GPU y en la memoria de un microcontrolador de gama alta.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU sin problema. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) lo ejecuta con margen sobrado.
- Cabe en GPU consumer: si, en cualquier GPU consumer, integrada o dedicada, e incluso en CPU.
- Opciones de despliegue: el autor indica que hay que cargar model.safetensors en una clase GPT que coincida con la configuracion y mapear caracteres a IDs con vocab.json; no se documenta soporte en vLLM, llama.cpp, Ollama, TGI ni transformers con auto-clase estandar. La integracion requiere codigo propio.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens (o caracteres) por segundo. A esta escala, la latencia estara dominada por el coste de carga del checkpoint y por el bucle de decodificacion en Python, no por el computo del modelo.
- Formato de pesos: safetensors en float32. No se publican pesos en GGUF, ONNX ni cuantizaciones de 4 u 8 bits.

## Comparativa con modelos similares

No hay datos publicados que permitan una comparacion cuantitativa directa con modelos de la misma categoria. La tabla siguiente recoge los campos conocidos y marca como no disponible todo aquello que no se ha publicado. Se incluye GPT-2 small unicamente como referencia de orden de magnitud, no como equivalente funcional.

| Modelo | Parametros | Contexto | Nivel de tokenizacion | Perplexidad publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Compactbot/testr-100k | 100.936 (safetensors) / 106.568 (model card) | 512 caracteres | Caracter (128 + UNK) | 39,77 (validacion, nivel de caracter) | Apache 2.0 | HuggingFace, safetensors |
| Modelos nanoGPT de estilo char-level | No disponible | No disponible | Caracter | No disponible | No disponible | No disponible |
| SLMs sub-1M a nivel de subword de la comunidad Compactbot | No disponible | No disponible | Subword | No disponible | No disponible | No disponible |
| GPT-2 small (referencia, no comparable) | 124 millones | 1024 tokens | Subword (BPE) | No disponible en esta ficha | Licencia MIT modificada | HuggingFace, safetensors y GGUF |

La comparacion honesta es de orden de magnitud: testr-100k tiene entre tres y cuatro ordenes de magnitud menos parametros que un SLM sub-1M a nivel de subword tipico y opera en una unidad distinta (caracteres frente a tokens), por lo que cualquier metrica de nivel de palabra carece de sentido. El propio autor lo declara en la seccion "What it is NOT" de la model card.

## Limitaciones y advertencias

- Degeneracion en repeticion: el modelo se bloquea en una frase y la repite tras dos o tres frases, tanto en decodificacion greedy como con temperatura 0,7. Es un comportamiento esperado a esta escala y tamano de vocabulario, no un fallo de configuracion.
- No genera texto coherente: el autor lo declara explicitamente. No debe usarse para producir contenido que vaya a ser leido por personas.
- Sesgos: no se documenta ninguna evaluacion de sesgos. Al entrenarse sobre 191 MB de texto web sin filtrado ni alineacion, es previsible que reproduzca sesgos presentes en ese corpus, aunque su capacidad de generar texto coherente es tan limitada que el impacto practico es bajo.
- Riesgo de alucinacion: el concepto no aplica en el sentido habitual, ya que el modelo no tiene conocimiento factual ni sigue instrucciones; genera continuaciones estadisticas de caracteres.
- Limitaciones de contexto e idioma: contexto de solo 512 caracteres y soporte exclusivo de ingles con un vocabulario de 128 caracteres. No maneja alfabetos no latinos, acentos ni simbolos fuera de ese repertorio.
- Sin alineacion: no hay RLHF, DPO ni ajuste por instrucciones. El modelo no responde a prompts en el sentido conversacional; solo continua una secuencia de caracteres.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No se declaran restricciones adicionales, pero el uso comercial de un modelo con esta calidad de salida no tiene aplicacion practica razonable.
- Ausencia de soporte en frameworks estandar: no se publican pesos GGUF, no hay auto-clase de transformers y no hay integracion con vLLM, TGI u Ollama. Cualquier despliegue requiere escribir la clase GPT y el mapeo de vocabulario a mano.
- Caveat de recuento de parametros: la model card declara 106.568 parametros mientras que los safetensors contienen 100.936. La diferencia no esta explicada en la documentacion disponible y conviene verificarla antes de citar la cifra.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia. No hay historial de mantenimiento ni issues resueltas.
- Fecha de publicacion inusual: los metadatos indican creacion y actualizacion el 30 de septiembre de 2026.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/testr-100k
- Perfil del autor en HuggingFace: https://huggingface.co/Compactbot
- Espacio Compactbot (agente de la comunidad SLM): https://huggingface.co/spaces/CompactAI/Compactbot
- Peticion de modelo numero 17 (origen del modelo, referencia al usuario @GGUFGuy): https://huggingface.co/spaces/Compactbot/model-requests/discussions/17
- Glint Research: mencionado como equipo creador del agente Compactbot; no se proporciona URL en la informacion disponible.
