# danjai/scamlens-qs-google-bert-v4

## Resumen

ScamLens quick_score google-bert-v4 es un clasificador de texto especializado en la deteccion de mensajes fraudulentos (scam) en SMS y chats. Lo desarrolla el usuario danjai en el contexto de un proyecto academico de la asignatura IS469, y forma parte de la herramienta `quick_score` del agente de investigacion de fraudes ScamLens. El modelo es un fine-tuning de `google-bert/bert-base-uncased` que devuelve la probabilidad de que un mensaje sea estafa a partir unicamente de su redaccion.

Tecnicamente es un transformer encoder BERT-base con 109.483.778 parametros totales y una ventana de entrada maxima de 192 tokens durante el entrenamiento. Su interes practico reside en que esta calibrado sobre un dominio muy concreto (mensajes en ingles con contexto de Singapur: bancos locales, agencias y servicios de pago) y en que el autor publica metricas de validacion y de test con intervalos de confianza, algo poco habitual en modelos de este tamano y con cero descargas.

Es relevante como referencia para quien construya pipelines de deteccion de fraude por texto: demuestra un flujo de evaluacion con separacion por plantilla de mensaje (para evitar fugas de near-copies) y ofrece una linea base ligera que puede ejecutarse en CPU o en GPU consumer. No obstante, el propio autor advierte de que no es el modelo con el que ScamLens opera en produccion y de que su uso aislado no basta para bloquear o acusar a nadie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, `google-bert/bert-base-uncased`) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 192 tokens (max_length de entrenamiento); limite arquitectonico de BERT-base: 512 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision completa; admite cuantizacion posterior via herramientas externas, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT-base uncased fine-tuneado para clasificacion de secuencias con dos etiquetas (`0 = genuine`, `1 = scam`). La cabeza de clasificacion se entrena sobre el encoder preentrenado de Google; no hay innovaciones arquitectonicas propias, sino un ajuste supervisado clasico. La configuracion de entrenamiento publicada es: 3 epocas, learning rate 2e-05, batch size 16, max_length 192, warmup_ratio 0.1, weight_decay 0.01, scheduler lineal, class_weights balanceados, val_ratio 0.1 y semilla 42.

El conjunto de datos consta de 1901 ejemplos (1712 de entrenamiento y 189 de validacion), provenientes del fichero `sg_quick_score_train.csv`. La composicion combina mensajes extraidos o reconstruidos de avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos, todo en estilo de Singapur. La validacion se separa por plantilla de mensaje (1387 plantillas), de modo que las copias cercanas de un mensaje de entrenamiento nunca caen en validacion. El autor publica los hashes SHA-256 de los datos de entrenamiento y de test. No se documenta uso de RLHF ni DPO; es aprendizaje supervisado con pesos de clase balanceados.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de que un SMS o mensaje de chat sea una estafa a partir de su redaccion.
- Deteccion de patrones linguisticos de fraude en ingles: urgencia, suplantacion de entidades, solicitudes de verificacion, enlaces sospechosos descritos en el texto.
- Salida calibrada con umbrales operativos definidos por el autor: `high` desde 0.70, `medium` desde 0.50, `low` por debajo.
- Integracion como herramienta `quick_score` dentro del agente ScamLens, configurable mediante la variable de entorno `SCAMLENS_QUICK_SCORE_MODEL`.
- Ejecucion ligera: inference en CPU o GPU consumer gracias a sus ~109 M de parametros.
- No soporta tool calling, function calling, agentes multi-step, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles; no se documenta soporte de otros idiomas.

## Casos de uso

- Filtro de primera pasada en pasarelas de SMS: el modelo puntua cada mensaje entrante y marca como `high` los que superan 0.70, derivando solo esos a revision humana o a herramientas adicionales de ScamLens. Es adecuado por su bajo coste computacional y su latencia reducida en CPU.
- Enriquecimiento de un agente antifraude: se usa como `quick_score` para dar una primera opinion sobre la redaccion antes de que otros modulos (comprobacion de enlaces, numeros y remitentes) emitan el veredicto final, tal como disena el autor.
- Moderacion de chats de atencion al cliente: clasificar mensajes de usuarios que reportan posibles estafas y priorizar los casos con probabilidad alta para agentes humanos.
- Investigacion academica sobre deteccion de fraude textual: sirve como linea base reproducible (semilla 42, hashes de datos, split por plantilla) para comparar con modelos mayores o con enfoques multilingues.
- Prototipado rapido de sistemas antifraude en entornos con recursos limitados: al caber en GPU consumer y ejecutarse en CPU, permite desplegar un servicio de clasificacion sin infraestructura dedicada.
- Analisis de corpus de SMS para estudios de prevalencia: puntuar lotes de mensajes historicos y estimar la proporcion de mensajes fraudulentos en un conjunto de datos de Singapur en ingles.
- Educacion y demos: ilustrar en un curso o taller como un BERT-base fine-tuneado con ~1.900 ejemplos alcanza F1 de 0.921 en un test manual de 178 mensajes.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Valor | Intervalo de confianza 95% |
|---|---|---|
| F1 en validacion | 0.961 | no disponible |
| Accuracy en test | 0.910 | 0.859 - 0.944 |
| Recall de estafa en test | 0.894 | 0.820 - 0.940 |
| Precision de estafa en test | 0.949 | 0.886 - 0.978 |
| F1 en test | 0.921 | no disponible |
| Mensajes genuinos clasificados como estafa | 5 de 74 | no disponible |
| Estafas no detectadas | 11 de 104 | no disponible |

El test set son 178 mensajes de Singapur escritos a mano que no aparecen en los datos de entrenamiento; se considera estafa a partir de probabilidad 0.50. No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,44 GB solo para pesos, mas activaciones y overhead del runtime; en la practica menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB para pesos, mas overhead; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente. En servidor, A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; text-embeddings-inference segun los tags del repo; endpoints compatibles; vLLM, llama.cpp, Ollama y TGI no estan documentados por el autor para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con modelos alternativos de deteccion de scam en la informacion proporcionada. Como referencia estructural, el modelo base es `google-bert/bert-base-uncased`, del que hereda arquitectura, tamano (~110 M de parametros) y limite de contexto (512 tokens); el fine-tune anade la cabeza de clasificacion binaria y reduce la longitud efectiva de entrenamiento a 192 tokens. Cualquier comparacion con otros clasificadores de fraude requeriria datos de benchmarks que no se han publicado.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v4 | 109.483.778 | 192 tokens (entrenamiento) | Clasificacion scam/genuine en SMS | no disponible | Hugging Face |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | Modelo base preentrenado | Apache 2.0 (segun el modelo original) | Hugging Face |
| Alternativas de deteccion de scam | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo evalua la redaccion: no comprueba enlaces, numeros de telefono ni remitentes. En ScamLens esas comprobaciones son herramientas separadas y esta puntuacion es solo una primera opinion.
- Entrenado exclusivamente con mensajes en ingles y contexto de Singapur (bancos, agencias y servicios de pago locales); se espera menor fiabilidad en otros paises, idiomas o dominios.
- El test set es pequeno (178 mensajes), por lo que los intervalos de confianza son amplios (por ejemplo, recall de estafa entre 0.820 y 0.940).
- Riesgo de falsos positivos: 5 de 74 mensajes genuinos fueron clasificados como estafa en el test.
- Riesgo de falsos negativos: 11 de 104 estafas no se detectaron en el test.
- No debe usarse de forma aislada para bloquear mensajes ni acusar a personas, segun indica el propio autor.
- La licencia no esta disponible, por lo que se desconoce si permite uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- El autor indica explicitamente que este no es el modelo con el que ScamLens opera en produccion, sino uno de los candidatos comparados.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v4
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Paper de BERT (referencia del modelo base): https://arxiv.org/abs/1810.04805
- Repositorio de ScamLens: no disponible en la informacion proporcionada
- Demo o Space: no disponible en la informacion proporcionada
