# BryceTRussell/tinycron

## Resumen

TinyCron es un modelo minúsculo de clasificación de texto desarrollado por BryceTRussell que convierte expresiones de programación de tareas en lenguaje natural (inglés) en líneas de cron de Linux válidas. Por ejemplo, traduce "every weekday at 9am" a `0 9 * * 1-5`. El problema que resuelve es la brecha entre cómo las personas describen horarios ("cada 15 minutos entre las 9 y las 5") y la sintaxis estricta de cinco campos de cron, una tarea que tradicionalmente se ha intentado con reglas escritas a mano o con LLM generales, con resultados mediocres.

Su relevancia radica en el enfoque: en lugar de usar un LLM de miles de millones de parámetros, TinyCron emplea una red GRU a nivel de carácter cuantizada a int8 en formato ONNX, con un tamaño total de 1,5 MB (1,7 MB con su tokenizador) y una latencia de 2 a 4 ms en una CPU de portátil. Esto lo hace ideal para ejecución offline, en dispositivos con recursos mínimos o incluso en el navegador vía WebAssembly (onnxruntime-web).

Cuando cron no puede expresar una petición, el modelo no alucina una línea inválida: devuelve una de tres clases (`UNSUPPORTED`, `INCOMPLETE`, `INVALID`) junto con una puntuación de confianza entre 0 y 1, lo que permite integrarlo de forma segura en pipelines de DevOps o asistentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU a nivel de carácter (red recurrente) |
| Parametros totales | no disponible (tamaño del modelo: 1,5 MB; 1,7 MB con tokenizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

TinyCron no es un transformer, sino una red recurrente basada en unidades GRU (Gated Recurrent Unit) que opera a nivel de carácter, sin tokenizador subword convencional. Esta elección de arquitectura es coherente con la tarea: las expresiones de horario en lenguaje natural son cadenas cortas y muy estructuradas, donde un modelo recurrente pequeño y cuantizado a int8 es suficiente para alcanzar precisiones superiores al 90 %, muy por encima de sistemas de reglas y de LLM mucho mayores evaluados en la misma tarea.

El modelo se publica en formato ONNX y se ejecuta con onnxruntime 1.19 o superior (probado con Python 3.12), así como con onnxruntime-web 1.20.1 en WebAssembly, produciendo resultados idénticos. Entre los datasets empleados o relacionados figuran AmazonScience/massive y TOPv2 (peticiones reales de alarmas y recordatorios). Los detalles sobre el número de tokens de entrenamiento o el uso de RLHF/DPO no están disponibles; por la naturaleza de la tarea (predicción estructurada con exact match), no aplica entrenamiento con preferencias humanas. Una innovación práctica destacable es el manejo explícito de la incertidumbre: además de las líneas cron, el modelo emite clases de rechazo (`UNSUPPORTED`, `INCOMPLETE`, `INVALID`) y una confianza calibrada, con un umbral del 95 % en `config.json` por debajo del cual la herramienta de línea de comandos marca la respuesta como "(unsure, check it)".

## Capacidades

- Conversión de expresiones de horario en inglés a líneas cron estándar de cinco campos (compatible con Vixie cron y cronie; domingo = 0), de una a tres líneas por petición.
- Detección de peticiones no expresables en cron (`UNSUPPORTED`: segundos, "every other week", "el último día del mes"), peticiones incompletas (`INCOMPLETE`: falta una hora o una cantidad) y texto que no es un horario (`INVALID`).
- Salida de confianza entre 0 y 1 para cada respuesta, con umbral configurable de certeza.
- Resolución de peticiones vagas mediante reglas de valores por defecto documentadas: sin hora se asiste medianoche, "morning" son las 9:00, horas de 1 a 6 sin especificar se interpretan por la tarde, "weekly" es domingo a medianoche, etc.
- Lectura de horarios compuestos: "at 7am on weekdays and 9am on weekends" devuelve dos líneas cron.
- Módulo opcional `rules.py` para parsear texto que ya es una línea cron.
- Ejecución completamente offline en CPU, y en el navegador mediante WebAssembly.
- No soporta segundos, años, los sufijos `L`, `W`, `#` ni los atajos `@` de cron; ignora zonas horarias.

## Casos de uso

- Automatización de tareas en servidores Linux: un asistente de línea de comandos o un panel de administración puede aceptar descripciones en lenguaje natural ("cada lunes a las 5:30 de la tarde") y generar la línea crontab correspondiente sin que el usuario conozca la sintaxis de cron.
- Asistentes de voz o chat para recordatorios: el modelo se entrenó y evaluó con peticiones reales de alarmas y recordatorios (TOPv2, 96,4 % de exact match), por lo que encaja en aplicaciones de asistentes que traducen "despiértame cada día laborable a las 7" a una programación ejecutable.
- Integración en pipelines de DevOps e IaC: herramientas que generan ficheros de configuración pueden usar TinyCron para convertir requisitos de scheduling escritos en comentarios o issues en entradas de cron válidas, validando antes la confianza de la salida.
- Ejecución en el navegador: gracias a onnxruntime-web (WebAssembly), una aplicación web puede ofrecer conversión de horarios sin backend ni conexión, con el modelo cargado una sola vez (unos 0,4 s).
- Validación y preprocesamiento de peticiones antes de recurrir a un LLM: el modelo filtra peticiones `UNSUPPORTED`, `INCOMPLETE` o `INVALID` de forma barata (2-4 ms), de modo que solo los casos difíciles se escalan a un modelo mayor.
- Portado a otros entornos (móvil, embebido, otros lenguajes): el repositorio incluye `examples.jsonl` como vectores de prueba y hashes en `config.json` para verificar una implementación, lo que facilita integraciones más allá de Python.
- Herramientas de productividad y calendarios ligeros: apps que permiten escribir "dos veces al mes" y necesitan una programación concreta pueden apoyarse en las reglas de valores por defecto documentadas.

## Benchmarks y rendimiento

Exact match sobre conjuntos de evaluación reservados (held-out), según datos declarados por el autor:

| Conjunto | Filas | Exact match | Errores por 1.000 |
|---|---|---|---|
| Template requests (held out) | 2.875 | 96,0 % | 40 |
| Requests escritas por un modelo de IA (held out) | 1.762 | 90,1 % | 99 |
| Peticiones reales de alarmas y recordatorios (TOPv2, test) | 1.510 | 96,4 % | 36 |
| Peticiones reales de asistente de cinco datasets (held out) | 745 | 94,5 % | 55 |
| Peticiones complicadas escritas a mano | 155 | 96,1 % | 39 |
| Texto real de código, foros y sitios de Q&A (held out) | 2.978 | 86,5 % | 135 |
| Frases de issues de GitHub (nunca vistas en entrenamiento) | 2.699 | 74,8 % | 252 |

Comparativa con otros sistemas sobre los mismos conjuntos held-out, contando solo filas cuya respuesta es un horario y puntuando de forma leniente:

| Sistema | Template | Escritas por IA | Peticiones reales (TOPv2) | Texto real |
|---|---|---|---|---|
| tinycron (1,5 MB) | 96,0 %* | 90,1 %* | 96,4 %* | 86,5 %* |
| english-to-cron 0.1.7 (reglas Rust) | 23,3 % | 29,3 % | 49,5 % | 55,8 % |
| natural-cron-expression 1.0.2 (reglas PHP) | 16,3 % | 21,7 % | 56,8 % | 61,7 % |
| cronformer 0.1.0 (6,3M parámetros, 25 MB) | 43,2 % | 41,6 % | 70,3 % | 64,8 % |
| cronlm (16M parámetros, 24 MB) | 43,0 % | 45,0 % | 71,0 % | 45,9 % |
| cron-mini (Qwen2.5-1.5B fine-tune, 3,1 GB) | 43,7 % | 44,6 % | 66,7 % | 61,0 % |
| leom21/cron (SmolLM2-360M fine-tune, 724 MB) | 11,1 % | 9,1 % | 36,5 % | 24,4 % |

\* Nota: las cifras de tinycron en su propia tabla de exact match se calculan sobre todas las filas (incluyendo las clases `UNSUPPORTED`/`INVALID`), mientras que los sistemas comparadores se puntúan solo sobre filas con horario y de forma leniente; la comparación estricta de números entre ambas tablas debe hacerse con esa cautela. Los resultados de los competidores y de tinycron provienen de la model card del autor y no están verificados por terceros.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. Ocupa 1,5 MB en disco (1,7 MB con tokenizador) y su huella en memoria es acorde a ese tamaño.
- GPU recomendadas: ninguna; no se necesita GPU. La inferencia tarda 2-4 ms en una CPU de portátil.
- Consumer GPU: irrelevante; cabe sobradamente en cualquier sistema, incluidos dispositivos sin GPU, Raspberry Pi o el navegador vía WebAssembly.
- Despliegue: onnxruntime 1.19 o superior en Python (script `to_cron.py` como comando o módulo), onnxruntime-web 1.20.1 en WebAssembly para navegador. No requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 2-4 ms por inferencia en CPU de portátil; la carga inicial del modelo tarda unos 0,4 s (una sola vez).
- Probado con Python 3.12 y onnxruntime 1.19.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Arquitectura | Exact match (TOPv2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinycron | 1,5 MB (int8) | GRU a nivel de carácter | 96,4 % | Apache 2.0 | ONNX en Hugging Face |
| cronformer 0.1.0 | 6,3M parámetros, 25 MB | no disponible | 70,3 % | no disponible | Hugging Face (uncommonstash/cronformer) |
| cronlm | 16M parámetros, 24 MB | no disponible | 71,0 % | no disponible | Hugging Face (pavstev/cronlm) |
| cron-mini | Qwen2.5-1.5B fine-tune, 3,1 GB | Transformer (LLM fine-tuned) | 66,7 % | no disponible | Hugging Face (Shpigford/cron-mini) |
| leom21/cron | SmolLM2-360M fine-tune, 724 MB | Transformer (LLM fine-tuned) | 36,5 % | no disponible | Hugging Face (leom21/cron) |

TinyCron supera con claridad a alternativas entre 40 y 2.000 veces mayores en la misma tarea, además de a dos sistemas basados en reglas (english-to-cron, natural-cron-expression). La tabla de la model card incluye también a Claude Haiku (octubre de 2026) con prompt, aunque los datos correspondientes aparecen truncados en la información disponible.

## Limitaciones y advertencias

- Solo soporta inglés; no hay soporte para castellano ni otros idiomas.
- No genera cron con segundos, años, `L`, `W`, `#` ni atajos `@`; peticiones que requieran esas expresiones devuelven `UNSUPPORTED`.
- No soporta conceptos como "every other tuesday" o "el último día del mes", que cron no puede expresar.
- Ignora zonas horarias; el consumidor de la salida debe gestionarlas.
- El rendimiento cae notablemente en texto fuera de dominio: 86,5 % en texto real de código y foros y 74,8 % en frases de issues de GitHub (252 errores por 1.000), el conjunto más débil.
- Las respuestas por debajo del umbral de confianza del 95 % deben revisarse; aun por encima del umbral, la exactitud observada en desarrollo fue del 95 %, es decir, 1 de cada 20 respuestas puede ser errónea.
- Las reglas de valores por defecto (medianoche por defecto, "morning" = 9:00, horas 1-6 interpretadas por la tarde) son convenciones del autor y pueden no coincidir con la intención del usuario en casos ambiguos.
- Los benchmarks proceden de la model card del autor y no están verificados por terceros.
- La tabla comparativa usa metodologías de puntuación ligeramente distintas entre tinycron y los competidores (ver nota en benchmarks).
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes más allá de la atribución y el aviso de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BryceTRussell/tinycron
- cronformer (modelo comparado): https://huggingface.co/uncommonstash/cronformer
- cronlm (modelo comparado): https://huggingface.co/pavstev/cronlm
- cron-mini (modelo comparado): https://huggingface.co/Shpigford/cron-mini
- leom21/cron (modelo comparado): https://huggingface.co/leom21/cron
- Dataset relacionado: https://huggingface.co/datasets/AmazonScience/massive
- Paper, repositorio de código independiente y demo: no disponible
