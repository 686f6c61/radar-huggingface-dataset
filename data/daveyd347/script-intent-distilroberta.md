# DaveyD347/script-intent-distilroberta

## Resumen

Script Intent Classifier (DistilRoBERTa) es un modelo de clasificación de texto desarrollado por DaveyD347 que predice la intención maliciosa de una única línea de comando, fragmento de script, consulta SQL o línea de petición HTTP. Clasifica la entrada en siete categorías: benigno, reconocimiento, recolección de credenciales, reverse shell, persistencia, descarga y ejecución, e inyección SQL. Está construido sobre DistilRoBERTa (82 millones de parámetros) mediante fine-tuning supervisado.

El modelo está pensado como señal de triaje para telemetría de línea de comandos de procesos, historial de shell, exportaciones de EDR y registros de WAF: ordena qué debe revisar primero un analista y explica por qué parece sospechoso. El autor advierte explícitamente que no es un control de bloqueo autónomo. Cubre sintaxis de bash, PowerShell, `cmd` de Windows, SQL y líneas de petición codificadas en URL, y su idioma de trabajo declarado es únicamente el inglés.

Es relevante por su enfoque de evaluación: el split de test es disjunto a nivel de plantilla (108 plantillas no vistas en entrenamiento), lo que mide la generalización a patrones nuevos en lugar de la memorización de filas. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un modelo reciente y de nicho, orientado a investigación en detección de amenazas más que a despliegue masivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, DistilRoBERTa) |
| Parametros totales | 82.123.783 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en `distilbert/distilroberta-base`, con 82 millones de parámetros y una longitud máxima de secuencia de 128 tokens. La cabeza de clasificación es una capa lineal sobre la representación del token especial, adaptada a 7 clases. No emplea arquitecturas híbridas, MoE ni mecanismos de atención lineal; es un clasificador discriminativo estándar, no un modelo generativo.

El fine-tuning se realizó sobre el dataset `DaveyD347/script-intent-commands`, con 11.760 filas de entrenamiento generadas a partir de 377 plantillas. Se entrenaron 2 épocas con learning rate 5e-5, decaimiento lineal, 6% de warmup, weight decay 0,01, batch size 32, semilla 42 y un máximo de 128 tokens. El mejor macro F1 de validación se alcanzó en la época 2 (0,830). El entrenamiento se ejecutó en 4 núcleos de CPU en aproximadamente 36 minutos. El código de entrenamiento (`train.py`), el generador de dataset (`generate_dataset.py`, `templates.py`) y el script de evaluación (`evaluate.py`) están en el repositorio del dataset bajo `src/`. No se documenta uso de RLHF ni DPO, lo cual es coherente con una tarea de clasificación supervisada.

## Capacidades

- Clasificación de intención en 7 clases sobre una línea de comando o payload: `benign`, `reconnaissance`, `credential_harvesting`, `reverse_shell`, `persistence`, `download_execute`, `sql_injection`.
- Cobertura de sintaxis de bash, PowerShell, `cmd` de Windows, consultas SQL y líneas de petición HTTP codificadas en URL.
- Detección binaria de malicia implícita: cualquier etiqueta distinta de `benign` se interpreta como maliciosa, con tasa de detección del 94,1% en el test disjunto y 80,0% en el conjunto de desafío.
- Salida de probabilidades por clase (top-k configurable en el pipeline de transformers), útil para ordenar por prioridad en triaje.
- Capacidad de generalización a plantillas de comando no vistas durante el entrenamiento (evaluación template-disjoint).
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking: es un clasificador de una sola pasada sobre una entrada corta.
- Capacidades multilingües limitadas al inglés declarado; no hay evidencia de rendimiento en otros idiomas.

## Casos de uso

- Triaje de telemetría de línea de comandos en EDR: el modelo clasifica cada línea de comando capturada y permite ordenar los eventos por probabilidad de intención maliciosa, de modo que el analista revise primero `download_execute` o `credential_harvesting` en lugar de `benign`.
- Enriquecimiento de exportaciones de EDR y registros de procesos: añadir una etiqueta de intención y una puntuación de confianza a cada evento antes de ingerirlo en el SIEM, facilitando reglas de correlación basadas en intención.
- Análise de historial de shell en respuesta a incidentes: clasificar de forma masiva el historial de bash o PowerShell de un host comprometido para localizar rápidamente persistencia, reverse shells y descargas de payload.
- Filtrado previo de registros de WAF: clasificar líneas de petición HTTP y parámetros para identificar payloads de inyección SQL antes de la revisión manual, aprovechando la recall del 1,000 en la clase `sql_injection` del test disjunto.
- Priorización de alertas en pipelines de threat detection: usar la salida top-k para asignar severidad preliminar y explicar la etiqueta predicha al analista, reduciendo el volumen de alertas benignas que requieren revisión.
- Investigación y evaluación de modelos de detección: servir como línea base reproducible para comparar clasificadores de intención de comandos, dado que el dataset, las plantillas y los scripts de evaluación son públicos.
- Detección de reconocimiento en entornos cloud y Active Directory: clasificar comandos de descubrimiento de host, usuario, red, privilegios y AD para alimentar reglas de MITRE ATT&CK.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Métrica | Test split (template-disjoint) | Conjunto de desafío (hand-written) |
|---|---|---|
| Accuracy (7 clases) | 78,0% | 75,3% |
| Macro F1 | 0,778 | 0,756 |
| Tasa de detección de malicioso | 94,1% | 80,0% |
| Tasa de falsos negativos (malicioso clasificado como benigno) | 5,9% | 20,0% |
| Tasa de falsos positivos (benigno clasificado como malicioso) | 22,5% | 8,7% |

Rendimiento por clase en el test split (n = 480 por clase):

| Etiqueta | Precision | Recall | F1 |
|---|---|---|---|
| benign | 0,685 | 0,775 | 0,727 |
| reconnaissance | 0,769 | 0,637 | 0,697 |
| credential_harvesting | 0,766 | 0,723 | 0,744 |
| reverse_shell | 0,686 | 0,683 | 0,685 |
| persistence | 0,780 | 0,754 | 0,767 |
| download_execute | 0,903 | 0,890 | 0,896 |
| sql_injection | 0,871 | 1,000 | 0,931 |

Accuracy por lenguaje en el test split: `cmd` 91,9%, `sql` 86,7%, `powershell` 72,3%, `bash` 70,0%. El conjunto de desafío tiene 73 filas, por lo que cada fila mueve la accuracy aproximadamente 1,4 puntos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (82 millones de parámetros, repositorio de 0,3 GB); en fp16 o cuantización de 8 bits cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: innecesarias para uso individual; una RTX 4090, RTX 3090, A100 o H100 permite procesar lotes grandes de líneas de comando con throughput muy alto. El entrenamiento original se completó en 4 núcleos de CPU en unos 36 minutos.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM (GTX 1650, RTX 3060, RTX 4060, etc.), y también en CPU.
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (el modelo está marcado como `text-embeddings-inference` y `endpoints_compatible`), servidores de inferencia compatibles con transformers y exportación a ONNX si se requiere. No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo y la longitud máxima de 128 tokens, la inferencia por línea es del orden de milisegundos en GPU y de decenas de milisegundos en CPU, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| script-intent-distilroberta | 82M | 128 tokens | Clasificación de intención de comandos (7 clases) | Apache 2.0 | Hugging Face |
| distilbert/distilroberta-base | 82M | 512 tokens (modelo base) | Modelo base enmascarado, sin fine-tuning de la tarea | Apache 2.0 | Hugging Face |
| Clasificadores genéricos de texto basados en RoBERTa/BERT | variable | 512 tokens | Clasificación de texto general, sin taxonomía de intención de comandos | variable | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos especializados en clasificación de intención de comandos en la información proporcionada, por lo que la comparación de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Frontera benigno versus reconocimiento y recolección de credenciales: comandos como `ps aux`, `whoami`, `Get-WinEvent` o `chmod 600 /etc/ssl/private/*.key` son ambiguos sin contexto (quién, cuándo y desde qué proceso padre se ejecutaron); esto explica la mayor parte del 22,5% de falsos positivos en el test split.
- Confusión entre reverse shell, persistencia y download-execute: una tarea cron o programada cuyo payload es un reverse shell se etiqueta como `persistence` (intención primaria), pero el modelo a menudo elige el payload; ambas respuestas son "maliciosas" en triaje, lo que eleva la detección binaria por encima de la accuracy de 7 clases.
- Nombres de herramientas desconocidas: comandos cuya única señal es el nombre de una herramienta no vista en entrenamiento (`mimipenguin`, `trufflehog`, `SharpHound.exe`) se clasifican frecuentemente como benignos; el modelo aprende sintaxis y contexto, no una lista de bloqueo de herramientas, por lo que debe combinarse con una.
- Contexto limitado a 128 tokens y a una única línea: no analiza secuencias multi-comando, scripts completos ni contexto de proceso, usuario o host.
- Idioma: solo inglés declarado; no hay evidencia de rendimiento en otros idiomas ni en comentarios o cadenas no inglesas.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de sobreconfianza en etiquetas; las métricas no están verificadas de forma independiente y el conjunto de desafío es muy pequeño (73 filas).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte que el modelo no es un control de bloqueo autónomo y debe usarse como señal de triaje.
- Caveat para producción: la tasa de falsos positivos del 22,5% en el test split puede generar carga de revisión si se usa como filtro estricto; conviene calibrar umbrales por clase y combinar con reglas y contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DaveyD347/script-intent-distilroberta
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/DaveyD347/script-intent-commands
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Métricas completas y matrices de confusión: `eval/metrics.json` en el repositorio del modelo
- Código de entrenamiento y generación de dataset: `src/` en el repositorio del dataset (`train.py`, `generate_dataset.py`, `templates.py`, `evaluate.py`)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
