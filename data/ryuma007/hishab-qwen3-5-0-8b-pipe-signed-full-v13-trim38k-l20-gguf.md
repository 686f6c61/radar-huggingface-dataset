# ryuma007/hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20-GGUF

## Resumen

hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20 es un modelo de extraccion de informacion financiera derivado de Qwen/Qwen3.5-0.8B mediante un proceso de poda de capas y recorte de vocabulario, publicado por el usuario ryuma007. Su proposito es concreto: recibir un mensaje de chat en ingles, bangla o banglish (bangla escrito con caracteres latinos) y devolver las transacciones financieras contenidas en el mismo en un formato de linea compacta `description|amount|category`, donde el signo del importe indica si es gasto o ingreso. El modelo forma parte del proyecto Hishab, una aplicacion bangladesi de finanzas personales.

La relevancia tecnica del modelo no reside en su capacidad general, sino en el pipeline de compresion aplicado sobre el modelo base: se eliminan cuatro capas del transformer (de 24 a 20), se recorta el vocabulario de 248.000 a 38.000 tokens y se reduce el numero de parametros de 0,75B a aproximadamente 451M, seguido de un reentrenamiento de curacion de dos epocas. El resultado es un modelo que, segun la model card, genera un 45% mas rapido en un Pixel 8 manteniendo un 97,9% de acuerdo top-1 con el modelo sin podar.

El modelo se distribuye exclusivamente en formato GGUF con cuantizaciones desde IQ3_M (226 MB) hasta F16 (904 MB), lo que lo orienta a inferencia en dispositivo (Android mediante kiln, o llama.cpp en general). Esta especializado en una unica tarea, no es un modelo conversacional de proposito general, y se ha entrenado unicamente con datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5-0.8B, podado de 24 a 20 capas |
| Parametros totales | 450.803.904 (aproximadamente 451M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ3_M, Q4_0, Q4_K_M, Q6_K, F16 (archivos GGUF con matrices de importancia `-imat` para IQ3_M y Q4_0) |
| Idiomas soportados | Bangla (bn), ingles (en) y banglish (bangla en caracteres latinos); otros alfabetos funcionan pero con tokenizacion menos eficiente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only con embeddings atados (tied embedding / output). Sobre esa base se aplican dos transformaciones. Primero, un recorte de vocabulario de 248.000 a 38.000 tokens: se conservan los tokens de ingles, bangla y banglish, todos los tokens de un solo caracter (para que cualquier texto siga codificandose) y todos los tokens especiales, y se corta la tabla de embeddings atada en consecuencia. Segundo, una poda de capas: se eliminan las capas 8, 9, 12 y 13, pasando de 24 a 20 capas.

Tras la poda, el modelo se cura durante 2 epocas sobre el split `train_v13` con todos los pesos entrenables, usando una perdida combinada: divergencia KL respecto al modelo sin podar sobre los tokens de respuesta mas 0,2 veces la entropia cruzada sobre el gold, con learning rate 2e-05. El acuerdo top-1 con el modelo sin podar es del 97,9%. El fine-tune original del modelo base se realizo con TRL durante 3 epocas, learning rate 3e-05 coseno, perdida solo sobre la completion, 19.798 filas de entrenamiento y seleccion de la mejor epoca por perdida de validacion. Los datos de entrenamiento son exclusivamente sinteticos, generados en el dataset `ryuma007/hishab-synthetic-v7`. No se menciona RLHF ni DPO.

## Capacidades

- Extraccion de transacciones financieras desde texto libre: descripcion, importe en BDT y categoria, con tipo derivado del signo del importe.
- Comprension de tres registros linguisticos: ingles, bangla nativo y banglish (bangla transliterado a caracteres latinos), incluidos mensajes mixtos.
- Expansion de abreviaturas numericas: `1.5k`, `2 lakh`, `5k`, asi como importes escritos con palabras ("der hajar", "পনেরো হাজার").
- Clasificacion en 13 categorias fijas: food, grocery, rent, utilities, mobile_recharge, transport, tuition, salary, gift, loan, shopping, medical, entertainment, other.
- Salida en formato compacto delimitado por barras verticales, aproximadamente la mitad de tokens que una salida JSON equivalente.
- Deteccion de ausencia de transaccion mediante la respuesta `NONE`.
- No dispone de tool calling, soporte de agentes, vision, audio ni modo de razonamiento (thinking debe permanecer desactivado).

## Casos de uso

- Registro automatico de gastos en la app Hishab: el modelo procesa cada mensaje del chat del usuario y devuelve las transacciones en formato de lineas para su insercion directa en la base de datos, con un tamaño de 226-288 MB que permite ejecutarlo en el propio telefono sin conexion.
- Procesamiento por lotes de historiales de chat: al ser un modelo pequeno y rapido, se puede pasar un historial completo de conversaciones por el modelo en local para reconstruir el historial de transacciones de un usuario.
- Normalizacion de importes en lenguaje natural: usuarios que escriben "pnero hajar" o "2 lakh" obtienen un importe numerico en BDT, lo que elimina la necesidad de un parser de numeros especifico por idioma.
- Clasificacion de gastos para presupuestos: la salida por categoria permite agregar gastos por tipo (transporte, comida, alquiler) y alimentar paneles de presupuesto sin intervencion manual.
- Integracion en asistentes de chat de terceros: mediante llama.cpp o kiln, el modelo puede actuar como paso de post-procesado sobre mensajes de un asistente conversacional para detectar y registrar transacciones mencionadas de pasada.
- Filtrado y enriquecimiento de datos financieros: en pipelines de datos, sirve para etiquetar mensajes con transacciones y descartar los que no las contienen (respuesta `NONE`), reduciendo el volumen antes de un procesamiento posterior.

## Benchmarks y rendimiento

Resultados evaluados con llama.cpp en modo greedy sobre splits reservados de `ryuma007/hishab-synthetic-v7`. `exact` indica que el conjunto de tuplas (importe, categoria, tipo) coincide con el gold; F1 es micro F1 sobre esas tuplas. Las columnas `_clean` corresponden a las filas donde dos etiquetadores independientes coinciden.

| Archivo | Tamano | test_clean exact | test_clean F1 | numbers_clean exact | test exact | test F1 | JSON valido | numbers exact |
|---|---|---|---|---|---|---|---|---|
| IQ3_M-imat | 226 MB | 92,9 | 96,6 | 89,3 | 79,3 | 89,3 | 100,0 | 75,1 |
| Q4_0-imat | 267 MB | 95,0 | 97,7 | 89,0 | - | - | - | - |
| Q4_K_M-imat | 288 MB | 94,5 | 97,3 | 90,2 | - | - | - | - |
| Q6_K | 372 MB | 94,3 | 97,2 | 90,2 | - | - | - | - |
| F16 | 904 MB | 95,0 | 97,6 | 90,2 | - | - | - | - |

Los splits de evaluacion son: test (518 filas, cuatro idiomas), numbers (357 filas con importes escritos con palabras), test_clean (476 filas) y numbers_clean (317 filas).

## Requisitos de hardware

- VRAM estimada para inferencia: entre 226 MB (IQ3_M) y 904 MB (F16) solo para los pesos; con overhead de contexto, por debajo de 1,5 GB en todos los casos.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre; el modelo esta disenado para ejecucion en CPU en dispositivos moviles.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) y en telefonos Android mediante kiln.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--jinja`), kiln en Android y cualquier runtime compatible con GGUF.
- Rendimiento: la model card reporta aproximadamente un 45% mas de velocidad de generacion en un Pixel 8 respecto al modelo base sin recortar vocabulario. No se publican cifras absolutas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion numerica de rendimiento no esta disponible. A continuacion se comparan caracteristicas estructurales.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| hishab-qwen3.5-0.8b (este) | 451M (podado de 0,75B) | No disponible | GGUF | Apache 2.0 | Extraccion financiera bangla/banglish |
| Qwen/Qwen3.5-0.8B (base) | 0,75B | No disponible | Safetensors, GGUF | Apache 2.0 | Modelo general multilingue |
| Alternativas de extraccion financiera multilingue | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: la model card advierte explicitamente de una precision menor en mensajes reales hasta que exista un conjunto de test etiquetado por humanos.
- Las etiquetas del split `test` original incumplen la guia de etiquetado en aproximadamente el 14% de las filas, por lo que las metricas sobre `test` subestiman el rendimiento real de forma deliberada.
- El modelo esta especializado en una unica tarea; no es adecuado para generacion de texto general, razonamiento, codigo ni conversacion abierta.
- Requiere un system prompt literal y verbatim, y debe ejecutarse con thinking desactivado; desviarse de esta configuracion degrada la salida.
- El formato de salida no es JSON: son lineas `description|amount|category` que deben separarse por las dos ultimas barras verticales, lo que exige un parser especifico en el cliente.
- El recorte de vocabulario degrada la tokenizacion de alfabetos distintos del latino y el bangla, lo que puede afectar a mensajes con otros sistemas de escritura.
- Riesgo de alucinacion de importes o categorias en mensajes ambiguos; la evaluacion sobre importes escritos con palabras es notablemente inferior (89-90% exact en numbers_clean frente a 93-95% en test_clean).
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base Qwen3.5-0.8B y los datos sinteticos deben verificarse de forma independiente antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryuma007/hishab-qwen3.5-0.8b-pipe-signed-full-v13-trim38k-L20-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/ryuma007/hishab-synthetic-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de entrenamiento y pipeline: https://github.com/RaihanulHaque/hishab
- Runtime Android kiln: https://github.com/RaihanulHaque/kiln
