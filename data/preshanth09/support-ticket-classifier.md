# preshanth09/support-ticket-classifier

## Resumen

El modelo `preshanth09/support-ticket-classifier` es un clasificador de texto en ingles construido mediante el ajuste fino (fine-tuning) de `google-bert/bert-base-uncased`, un transformer encoder de tipo BERT con 109.489.930 parametros. Su proposito concreto es enrutar tickets de soporte al cliente hacia una de diez colas o departamentos (facturacion, soporte tecnico, recursos humanos, ventas, etc.). Lo publica el usuario preshanth09 en Hugging Face bajo licencia Apache 2.0, con fecha de creacion en noviembre de 2026.

El modelo resuelve un problema acotado pero recurrente en operaciones de atencion al cliente: la triage o clasificacion inicial de incidencias entrantes. No es un modelo generativo ni un asistente conversacional; es un clasificador discriminativo que devuelve una distribucion de probabilidad sobre diez etiquetas fijas. El autor lo plantea explicitamente como una ayuda para agentes humanos (sugerencia top-3), no como un sistema de decision automatica.

La relevancia de esta ficha es relativa: se trata de un modelo pequeno, con cero descargas y cero likes en el momento de la consulta, entrenado sobre datos sinteticos y con un rendimiento modesto (accuracy de 0,514 y macro-F1 de 0,565 en el conjunto de test). Es util como referencia de un pipeline de clasificacion con BERT base, pero sus numeros no justifican su uso en produccion sin reentrenamiento y validacion sobre datos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (bert-base-uncased) |
| Parametros totales | 109.489.930 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo incluye safetensors y ONNX; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Cabezal de clasificacion | 10 etiquetas (colas de soporte) |
| Dataset de entrenamiento | Tobi-Bueck/customer-support-tickets (subconjunto en ingles, sintetico) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estandar: 12 capas de encoder transformer, atencion bidireccional y un cabezal de clasificacion lineal sobre el token `[CLS]` adaptado a diez clases. El modelo parte de los pesos preentrenados de `google-bert/bert-base-uncased` y se ajusta de forma supervisada con entropia cruzada y pesos de clase calculados por frecuencia inversa, lo que compensa el desbalance entre colas.

El entrenamiento se realizo sobre el subconjunto en ingles del dataset sintetico `Tobi-Bueck/customer-support-tickets`, con 23.745 tickets tras limpieza y deduplicacion, divididos de forma estratificada 80/10/10 con semilla 42 (18.996 / 2.374 / 2.375). Los hiperparametros documentados son: longitud maxima de secuencia 256, learning rate 3e-5, 700 pasos de warmup, weight decay 0,01, batch size 16, 6 epocas, precision fp16 y entrenamiento en una GPU T4 de Google Colab durante aproximadamente 19 minutos. La mejor epoca se selecciono por macro-F1 de validacion. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa; es un ajuste fino supervisado convencional.

## Capacidades

- Clasificacion de texto multietiqueta en una sola pasada: asigna un ticket (asunto y cuerpo) a una de diez colas de soporte.
- Devuelve probabilidades por clase, lo que permite obtener sugerencias top-k (el autor recomienda top-3 para triage humano).
- Manejo de entradas en ingles de hasta 256 tokens; el texto mas largo se trunca.
- Etiquetas cubiertas: Billing and Payments, Customer Service, General Inquiry, Human Resources, IT Support, Product Support, Returns and Exchanges, Sales and Pre-Sales, Service Outages and Maintenance, Technical Support.
- Exportacion a ONNX para inferencia optimizada en CPU o con runtimes dedicados.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Triage de tickets en mesas de ayuda: el modelo recibe asunto y cuerpo del ticket y devuelve las tres colas mas probables, que un agente humano confirma o corrige. Es adecuado por su latencia baja y su formato de salida top-k, aunque requiere validacion previa sobre datos propios.
- Enrutamiento previo en sistemas de ticketing (Zendesk, Freshdesk, Jira Service Management): se puede integrar como paso de clasificacion via API para precargar el campo de cola y reducir el tiempo de asignacion manual.
- Etiquetado asistido para curación de datasets: dado que el modelo produce probabilidades, puede usarse para preetiquetar grandes volumenes de tickets que luego se revisan manualmente, acelerando la construccion de un corpus propio.
- Filtrado y priorizacion por categoria: los tickets clasificados como Service Outages and Maintenance (la segunda mejor F1, 0,683) pueden enrutarse a un canal de incidentes con mayor prioridad.
- Analitica de volumen por cola: clasificar lotes historicos de tickets para medir la distribucion de incidencias por departamento y dimensionar equipos.
- Prototipado rapido de pipelines de NLP: al ser un BERT base con safetensors y ONNX, sirve como linea base reproducible para comparar contra modelos propios o contra clasificadores TF-IDF.
- Deteccion de tickets mal enrutados: comparar la prediccion del modelo con la cola asignada historicamente para identificar casos anomalos que revisar.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test reservado (2.375 tickets), segun la model card:

| Modelo | Accuracy | Macro-F1 | Weighted-F1 |
|---|---|---|---|
| TF-IDF + Regresion Logistica (baseline) | 0,504 | 0,507 | 0,505 |
| Este modelo (BERT fine-tuned) | 0,514 | 0,565 | 0,514 |

Rendimiento por clase (F1) segun el autor:

| Cola | F1 |
|---|---|
| Billing and Payments | 0,803 |
| Service Outages and Maintenance | 0,683 |
| Product Support | 0,417 |
| Customer Service | 0,442 |

Nota del autor: una ejecucion anterior con identicos ajustes y semilla obtuvo 0,579 de macro-F1; la no determinacion de la GPU provoca variaciones de aproximadamente un punto entre ejecuciones. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 440 MB solo para pesos (109,5 M parametros x 4 bytes); en fp16, unos 220 MB. Con overhead de activaciones y batch, el consumo real es inferior a 1 GB en la mayoria de configuraciones.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas para produccion de alto throughput: A100, H100 o L4; no obstante, por el tamano del modelo, una T4 o una CPU moderna con ONNX Runtime pueden ser suficientes.
- Opciones de despliegue: `transformers` pipeline, ONNX Runtime (hay pesos ONNX en el repo), TorchServe, Triton Inference Server, FastAPI con `transformers`. No se documenta soporte para vLLM ni llama.cpp, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano (BERT base, secuencia 256) se espera latencia de milisegundos por peticion en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| preshanth09/support-ticket-classifier | 109,5 M | 256 tokens | Clasificacion de tickets (10 clases) | Apache 2.0 | Hugging Face, 0 descargas |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base preentrenado, sin cabezal de clasificacion | Apache 2.0 | Hugging Face, ampliamente usado |
| distilbert-base-uncased | 66 M | 512 tokens | Modelo base destilado, mas rapido y ligero | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125 M | 512 tokens | Modelo base preentrenado, mejor rendimiento en GLUE que BERT base | MIT | Hugging Face |

La comparacion relevante es contra el propio `bert-base-uncased` sin ajustar (que no clasifica tickets por si solo) y contra alternativas de encoder mas ligeras o mas potentes. No se dispone de otros clasificadores de tickets publicos directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre tickets sinteticos; el rendimiento sobre tickets reales de produccion es desconocido y probablemente inferior.
- Las colas Technical Support, IT Support y Product Support se solapan fuertemente y el modelo las confunde con frecuencia (F1 de Product Support: 0,417).
- Solo ingles; no soporta otros idiomas.
- Ventana de contexto limitada a 256 tokens: los tickets largos se truncan y pueden perder informacion relevante para la clasificacion.
- Variabilidad entre ejecuciones de aproximadamente un punto de macro-F1 por no determinacion de la GPU, lo que dificulta la reproducibilidad exacta.
- El autor advierte explicitamente que no debe usarse para decisiones automaticas sobre clientes reales sin reentrenamiento y evaluacion con datos internos.
- Riesgo de sesgo: al derivarse de un dataset sintetico, la distribucion de clases y el vocabulario pueden no reflejar la realidad de una organizacion concreta.
- Licencia Apache 2.0: permite uso comercial, pero no hay garantias ni soporte del autor.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/preshanth09/support-ticket-classifier
- Repositorio de codigo: https://github.com/im-preshanth/support-ticket-classifier
- Demo en vivo: https://huggingface.co/spaces/preshanth09/support-ticket-classifier-demo
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/Tobi-Bueck/customer-support-tickets
