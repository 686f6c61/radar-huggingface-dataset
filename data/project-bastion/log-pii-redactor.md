# Project-Bastion/log-pii-redactor

## Resumen

log-pii-redactor es un modelo de clasificación de tokens (token classification) desarrollado por Project-Bastion, construido sobre `distilroberta-base`, diseñado específicamente para detectar y etiquetar datos personales y secretos dentro de líneas de log. Identifica nueve categorías: `IP`, `USER`, `EMAIL`, `HOST`, `PHONE`, `SECRET` (claves de API, tokens, JWT), `CARD`, `MAC` y `SSN`. Su propósito es defensivo: permitir compartir o almacenar logs (tickets de soporte, exportaciones SIEM, análisis de logs por parte de LLMs) con los datos sensibles enmascarados.

El modelo tiene 81.542.419 parámetros (aproximadamente 82M) y se distribuye como un checkpoint de 0,3 GB en formato safetensors bajo licencia Apache 2.0. La versión publicada es una v0.1 experimental: el autor advierte explícitamente que para IPv4 y direcciones de correo una expresión regular es al menos igual de buena, y que el valor real del modelo está en las etiquetas que una regex no puede resolver (nombres de usuario, hostnames fuera de la columna fija de syslog, secretos en estructuras clave/valor no familiares).

Es relevante ahora porque aborda un problema práctico y creciente: la higiene de datos en pipelines de observabilidad y en el análisis de logs con modelos de lenguaje. Sin embargo, el propio autor es transparente sobre sus límites: el modelo crudo rinde mal en IPs reales y requiere el script `redact.py` con posprocesado basado en reglas para ser utilizable, y varias etiquetas (SECRET, PHONE, CARD, SSN) solo se validaron con datos sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado), token classification |
| Parametros totales | 81.542.419 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (derivada de distilroberta-base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | distilbert/distilroberta-base |
| Tamano del repo | 0,3 GB |
| Pipeline | token-classification |
| Etiquetas | IP, USER, EMAIL, HOST, PHONE, SECRET, CARD, MAC, SSN |

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens sobre `distilroberta-base`, un encoder transformer destilado de RoBERTa. Se entrenó durante 3 épocas con learning rate 5e-5 y batch size 32 en una única GPU T4, seleccionando el checkpoint únicamente sobre un conjunto de validación. La tarea es etiquetado a nivel de token (BIO o similar) para nueve tipos de entidad.

Los datos de entrenamiento son 60.000 líneas de log **sintéticas** generadas por los scripts `gen_logs.py` y `gen_logs2.py` (repositorio GitHub Project-Bastion/models). Los layouts cubren formato clave=valor, comillas, syslog, Apache access/error, logs estilo Java y frases en lenguaje natural, e incluyen negativos difíciles (puertos, hashes, versiones, nombres de fichero y de programa). Los layouts y claves de train, validación y test se separaron de modo que los layouts de test son no vistos. No se usó ningún dato real de log para entrenar; algunas plantillas sintéticas se escribieron tras inspeccionar errores del modelo sobre sistemas de LogHub (OpenSSH, Linux, Apache, HDFS, Zookeeper, Thunderbird, Hadoop), que por tanto se consideran datos de desarrollo y no se usan para ninguna métrica reportada.

La innovación práctica no está en la arquitectura sino en el pipeline: `redact.py` ejecuta el modelo y después aplica una limpieza basada en reglas (`postproc.py`) que ajusta los spans a límites de token, elimina puertos y valida cada tipo (las IPs deben parsear, los números de tarjeta requieren 13-19 dígitos, patrones de SSN/MAC, etc.). Llamar al modelo crudo mediante pipelines de `transformers` omite este paso y es notablemente menos preciso en layouts no familiares.

## Capacidades

- Detección y etiquetado de datos personales en líneas de log: IP, USER, EMAIL, HOST, PHONE, SECRET, CARD, MAC, SSN.
- Detección de secretos en estructuras clave/valor no familiares: claves de API, tokens y JWT.
- Detección de nombres de usuario y hostnames que una regex no captura (nombres de login, DNS inverso, hosts de URL, nombres de nodo HPC).
- Redacción automática de líneas mediante `redact(line, path)`, que devuelve la línea con los spans sustituidos por etiquetas tipo `[IP]`, `[USER]`, `[HOST]`.
- Detección con posiciones y valores mediante `detect(line, path)`, que devuelve tuplas `(start, end, label, value)`.
- Posprocesado validado por tipo de entidad (parseo de IP, longitud de tarjeta, patrones SSN/MAC).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking. Es un modelo de etiquetado, no generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- **Redacción de tickets de soporte antes de compartirlos**: ejecutar `redact.py` sobre el cuerpo de logs adjuntos en tickets para enmascarar IPs, usuarios, emails y hostnames antes de enviarlos a terceros o a herramientas externas. Adecuado por su tamaño reducido (82M) y su enfoque específico en layouts de log.
- **Sanitización previa al análisis de logs con LLMs**: pasar las líneas de log por el pipeline antes de enviarlas a un modelo generativo, reduciendo la exposición de datos personales en prompts. El modelo está pensado explícitamente para este escenario.
- **Exportaciones SIEM y compartición entre equipos**: limpiar muestras de logs de sistemas (OpenSSH, Linux, Apache) antes de adjuntarlas a informes o repositorios, usando las etiquetas USER y HOST donde las regex fallan.
- **Detección de secretos en logs de aplicación**: localizar claves de API, tokens y JWT embebidos en estructuras clave=valor no estándar. Caveat: SECRET solo se validó con datos sintéticos.
- **Preprocesado en pipelines de observabilidad**: integrar `detect()` como paso previo al almacenamiento o indexación de logs, extrayendo spans y sustituyéndolos por marcadores. Requiere validar el rendimiento en los layouts propios del sistema.
- **Filtro complementario a regex en herramientas de seguridad**: usar el modelo junto a reglas existentes para cubrir USER y HOST fuera de la columna fija de syslog, donde las regex tienen recall bajo (0,08 en HOST para patrón FQDN según la evaluación del autor).

## Benchmarks y rendimiento

### Evaluación 1: test sellado de logs reales, IP/EMAIL/MAC (gold por regex)

Muestras de 2.000 líneas de LogHub de cinco sistemas sin solapamiento con train ni dev (Spark, BGL, OpenStack, Proxifier, HealthApp; 10.000 líneas). El conjunto contiene 1.362 spans de IP, 1 de email y 0 de MAC: es efectivamente un test de IP. Coincidencia exacta de span.

| Sistema | Precision IP | Recall IP | F1 IP |
|---|---|---|---|
| log-pii-redactor, pipeline completo (modelo + limpieza) | 1,000 | 0,761 | **0,865** |
| log-pii-redactor, modelo crudo (sin limpieza) | 0,102 | 0,352 | 0,159 (4.201 falsos positivos) |
| regex (IPv4) | 1,000 | 1,000 | 1,000 (circular: el gold lo genera esta regex) |
| urchade/gliner_multi_pii-v1 (zero-shot) | 0,469 | 0,130 | 0,204 |
| iiiorg/piiranha-v1 | sin clase IP | | 0,000 |

### Evaluación 2: conjunto pequeño de logs reales etiquetado a mano, USER y HOST

287 líneas de LogHub OpenSSH (60), Linux (70), Mac (60), HPC (47) y Android (50, sin spans relevantes), etiquetadas a mano antes de ejecutar ningún modelo. Gold: 72 spans USER, 249 spans HOST (190 de la columna de host de syslog, 59 otros hostnames), 0 spans SECRET. Anotador único (el autor); sin acuerdo inter-anotador. Coincidencia exacta de span.

| Sistema | USER (P/R/F1) | HOST todos (P/R/F1) | HOST sin columna syslog (P/R/F1) |
|---|---|---|---|
| log-pii-redactor, pipeline completo | 0,75 / 0,94 / **0,83** | 0,88 / 0,98 / **0,93** | 0,63 / 0,93 / **0,75** |
| log-pii-redactor, modelo crudo | 0,73 / 0,96 / 0,83 | 0,79 / 0,95 / 0,86 | 0,42 / 0,80 / 0,55 |
| regex (patrón FQDN, sin regla USER posible) | 0 / 0 / 0,00 | 0,73 / 0,08 / 0,14 | 0,73 / 0,32 / 0,45 |
| reglas escritas a mano (patrones sshd/pam, rDNS, campo host syslog) | 0,96 / 0,92 / **0,94** | 1,00 / 0,82 / 0,90 | 1,00 / 0,22 / 0,36 |
| urchade/gliner_multi_pii-v1 | 0,22 / 0,29 / 0,25 | 0,37 / 0,10 / 0,15 | 0,33 / 0,25 / 0,29 |
| iiiorg/piiranha-v1 | 0 / 0 / 0,00 | sin clase HOST | sin clase HOST |

Lectura honesta según el autor: el modelo supera claramente a una regex simple y a los modelos PII generales en USER y HOST; un conjunto de reglas a mano supera al modelo en USER para OpenSSH y Linux (F1 0,97 / 1,00 vs 0,98 / 0,79 en esas dos fuentes) porque codifica exactamente esos formatos, pero las reglas no transfieren (0,00 de F1 en HOST para nombres de nodo HPC).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (82M parámetros). En fp32, aproximadamente 0,33 GB de pesos; en fp16, unos 0,16 GB. La VRAM total depende del framework y del batch, pero cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una T4 fue suficiente para el entrenamiento. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX (incluso series antiguas) y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con PyTorch (documentado en la model card); el pipeline de redacción se distribuye como script Python (`redact.py`, `postproc.py`) descargado vía `snapshot_download`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo de token classification de este tamaño, aunque podría servirse con TGI o un endpoint de inferencia estándar).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Project-Bastion/log-pii-redactor | 81,5M | no disponible | Token classification específica de logs, 9 etiquetas | Apache 2.0 | Hugging Face |
| urchade/gliner_multi_pii-v1 | no disponible | no disponible | Zero-shot NER PII multilingüe | no disponible | Hugging Face |
| iiiorg/piiranha-v1 | no disponible | no disponible | Detección PII (sin clases IP ni HOST según la evaluación del autor) | no disponible | Hugging Face |
| Regex a medida (IPv4, FQDN) | no aplica | no aplica | Reglas deterministas | no aplica | Cualquiera |

Según la evaluación del autor, log-pii-redactor supera a gliner_multi_pii-v1 en IP (F1 0,865 vs 0,204), USER (0,83 vs 0,25) y HOST (0,93 vs 0,15). Frente a regex, pierde en IP (0,865 vs 1,000, aunque el gold es circular) y gana en USER y HOST fuera de la columna syslog. Frente a reglas a mano, pierde en USER para OpenSSH/Linux pero gana en transferencia a otros sistemas (HPC). Los datos de parámetros y contexto de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- **Versión experimental v0.1**: el autor la etiqueta explícitamente como experimental y no apta como único control de cumplimiento normativo.
- **Modelo crudo débil en IPs reales**: F1 0,159 y 4.201 falsos positivos en el test sellado; es obligatorio usar `redact.py` con posprocesado, no el pipeline crudo de `transformers`.
- **Regex superior para IPv4 y email**: para esos dos tipos, una expresión regular es al menos igual de buena; el valor del modelo está en USER, HOST y secretos en layouts no familiares.
- **Validación limitada de varias etiquetas**: SECRET, PHONE, CARD y SSN solo se validaron con datos sintéticos; SECRET no pudo evaluarse en datos reales porque los logs usados no contienen credenciales reales.
- **Anotación de un solo anotador**: el conjunto de evaluación USER/HOST fue etiquetado por el propio autor (un agente de IA), sin acuerdo inter-anotador, lo que limita la fiabilidad de las métricas.
- **Idioma**: solo inglés; no hay soporte multilingüe documentado.
- **Riesgo de falsos negativos y positivos**: el posprocesado descarta spans que no validan (p. ej., IPs que no parsean), lo que puede dejar pasar datos; el modelo crudo genera numerosos falsos positivos.
- **Riesgo de alucinación**: no aplica en el sentido generativo (no produce texto libre), pero sí puede etiquetar incorrectamente spans, con el consiguiente enmascarado erróneo o fuga de datos.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías; para producción conviene combinarlo con regex y reglas específicas del sistema.
- **Sin datos de contexto ni cuantizaciones publicadas**: no se documenta la longitud máxima de secuencia ni formatos GGUF/ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Project-Bastion/log-pii-redactor
- Repositorio GitHub con scripts de generación y pipeline: Project-Bastion/models (ruta `scripts/`, con `gen_logs.py`, `gen_logs2.py`, `redact.py`, `postproc.py`)
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Modelo comparable (zero-shot PII): https://huggingface.co/urchade/gliner_multi_pii-v1
- Modelo comparable (PII): https://huggingface.co/iiiorg/piiranha-v1
- LogHub (datasets de logs usados en evaluación): no disponible en la información proporcionada (referenciado por nombre en la model card)
