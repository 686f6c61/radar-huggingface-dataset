# borodutchlabs/laya-farcaster-spam

## Resumen

laya-farcaster-spam es un clasificador de spam especializado en *casts* (publicaciones) y cuentas de Farcaster, la red social descentralizada basada en el protocolo del mismo nombre. Lo desarrolla borodutchlabs y se construye mediante *fine-tuning* de convaiinnovations/laya-multilingual, un modelo multilingüe de 321,9 millones de parámetros, sobre las etiquetas generadas por Jev, el modelo de moderación de TypeSafe. El resultado es un modelo de una sola pasada hacia delante que devuelve una probabilidad calibrada en lugar de texto generado, lo que elimina cualquier necesidad de parseo de la salida.

El modelo resuelve dos preguntas concretas: si un cast es spam (bait de interacción, granjas de "gm", shills de tokens, drops de direcciones de contrato, airdrops falsos) y si una cuenta existe principalmente para hacer farming o spam. Es relevante porque alimenta infraestructura real: la API pública gratuita spam.quilcast.com y el etiquetado de spam del cliente Quilcast, lo que lo convierte en una pieza de producción dentro del ecosistema Farcaster y no en un experimento aislado.

Técnicamente es un transformer encoder de ~322M parámetros con licencia Apache-2.0, pesos en safetensors y un tamaño de repositorio de 0,7 GB. Su enfoque de destilación sobre un modelo mayor (Jev) y su calibración mediante *Platt scaling* lo sitúan como una alternativa ligera y desplegable en hardware modesto para moderación a escala de red social.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de convaiinnovations/laya-multilingual); clasificación de texto |
| Parámetros totales | 321.908.998 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | Multilingüe y inglés (etiquetas `multilingual`, `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de laya-multilingual, un encoder transformer multilingüe de 321,9 millones de parámetros, y se ajusta como clasificador binario para dos tareas independientes (`spam` y `spam_account`). No genera texto: una pasada hacia delante produce una puntuación bruta que, tras aplicar *Platt scaling* con los parámetros de `platt.json`, se interpreta como la probabilidad de que Jev (el modelo profesor de TypeSafe) considere el contenido spam. La destilación se realizó sobre las respuestas de Jev, no sobre etiquetas humanas directas, lo que transfiere tanto los aciertos como los errores del profesor.

Los datos de entrenamiento para la tarea de casts son 16.600 casts extraídos de dos semanas del flujo de eventos del *hub* de Farcaster, con un máximo de tres por plantilla de texto para evitar sobrerrepresentación. Para cuentas se usaron 4.384 instantáneas de 3.631 cuentas. El conjunto de validación es el 15% más reciente por marca temporal, lo que respeta la deriva temporal del spam. La receta de entrenamiento es `laya-train --base multilingual --epochs 3`. El estado de entrada combina el texto del cast, sus enlaces, si es respuesta, los últimos casts del autor y el número de cuentas que publicaron el mismo texto en las 24 horas previas (normalizado en minúsculas y con dígitos sustituidos por 0), una señal explícita de coordinación.

## Capacidades

- Clasificación binaria de spam en casts de Farcaster con probabilidad calibrada.
- Clasificación de cuentas como granjas o spam (`spam_account`) a partir de metadatos de perfil y sus últimos 10 casts.
- Detección de bait de interacción, farming de "gm"/"boop", bots de recompensas y *spins* diarios.
- Detección de shills de tokens, drops de direcciones de contrato, airdrops y giveaways fraudulentos, estafas y listados de afiliados.
- Uso de señales de coordinación: repetición del mismo texto entre múltiples cuentas en 24 horas.
- Soporte multilingüe e inglés para conversación ordinaria (que clasifica como no spam).
- Sin tool calling, sin generación de texto, sin razonamiento multi-paso ni capacidades de agente: es exclusivamente un clasificador.
- Sin visión ni audio: no analiza imágenes ni *frames* embebidos.

## Casos de uso

- Moderación en tiempo real de un cliente Farcaster: el modelo puntúa cada cast entrante en una sola pasada (~40 casts/s en un Apple M1 Max por lotes) y permite ocultar o marcar contenido con un umbral alto (0,9 calibrado) sin intervención humana.
- API pública de puntuación de spam: es exactamente el caso de spam.quilcast.com, donde terceros consultan la probabilidad de spam de un cast o una cuenta vía HTTP con el servidor `serve.py` incluido en el repositorio de entrenamiento.
- Filtrado de respuestas y menciones: al recibir el estado con `reply: true` y los últimos casts del autor, se puede priorizar la revisión de respuestas sospechosas en hilos de alta actividad.
- Detección de campañas coordinadas: la señal `sameTextAccounts24h` permite identificar granjas que replican el mismo texto entre decenas de cuentas, un patrón habitual en airdrops falsos.
- Etiquetado de cuentas para listas de bloqueo o *allowlists*: con `spam_account` y un umbral de 0,7 (precisión 1,00, recall 0,84) se pueden generar listas de cuentas a revisar con muy pocos falsos positivos.
- Investigación sobre moderación descentralizada: al ser Apache-2.0 y ligero, sirve como base para estudiar destilación de modelos de moderación y deriva del spam en redes sociales federadas.
- Prefiltro en pipelines de anotación humana: reducir el volumen que llega a moderadores usando el umbral de 0,5 (recall 0,80) y derivar solo los casos dudosos a revisión manual.

## Benchmarks y rendimiento

Los datos de evaluación son de concordancia con Jev sobre datos retenidos, tras calibración:

| Pregunta | Conjunto retenido | Umbral | Concordancia | Precisión | Recall |
|---|---|---|---|---|---|
| `spam` (casts) | 2.489 casts | 0,5 | 95,7% | 0,92 | 0,80 |
| `spam` (casts) | 2.489 casts | 0,7 | 92,4% | 0,995 | 0,53 |
| `spam_account` | 652 cuentas | 0,5 | 97,1% | 0,98 | 0,96 |
| `spam_account` | 652 cuentas | 0,7 | 92,5% | 1,00 | 0,84 |

ROC AUC de la pregunta de casts: 0,980. Rendimiento: ~40 casts por segundo por lotes en un Apple M1 Max. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~1,3 GB (322M parámetros × 4 bytes); en fp16/bf16: ~0,65 GB; en int8: ~0,35 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo, que está pensado para ejecución por lotes en CPU/GPU modestas.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Despliegue: el autor proporciona `serve.py` (servidor HTTP) en el repositorio backmeupplz/quilcast-spam, bajo `laya/`. La librería `laya` (`pip install laya`) con `Router` y `preload=True` es la vía oficial. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos generativos, no para este clasificador).
- Latencia y throughput: ~40 casts/s en Apple M1 Max por lotes; no se publican cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-farcaster-spam | 321,9M | No disponible | Clasificación de spam en Farcaster | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| convaiinnovations/laya-multilingual (base) | 321,9M | No disponible | Modelo multilingüe base | No disponible en la información | Hugging Face |
| Jev (TypeSafe) | No disponible | No disponible | Moderación (modelo profesor) | No disponible | No disponible (servicio propietario) |

No se dispone de datos públicos de benchmarks ni de especificaciones de Jev o de otros clasificadores de spam específicos de Farcaster en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo analiza texto y enlaces: las imágenes y los *frames* embebidos no se inspeccionan, y los casts sin texto no reciben puntuación.
- Aprende el juicio de Jev, incluidos sus errores; el autor recomienda un umbral alto (0,9 calibrado) para cualquier acción automática y mantener un canal de reporte de etiquetas incorrectas.
- El spam evoluciona: el checkpoint refleja Farcaster a finales de octubre de 2026 y puede degradarse con el tiempo.
- La puntuación bruta no es una probabilidad directa: hay que aplicar *Platt scaling* con `platt.json`; usar el valor sin calibrar (que se sitúa en torno a 0,6-0,85 para spam) lleva a decisiones erróneas.
- Riesgo de falsos positivos en conversación legítima multilingüe, especialmente en cuentas nuevas con pocos casts de historial.
- Sin datos publicados sobre sesgos por idioma o demografía; la evaluación se limita a concordancia con el profesor.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con 0 descargas y 0 likes en Hugging Face en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/borodutchlabs/laya-farcaster-spam
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio de entrenamiento y servidor: https://github.com/backmeupplz/quilcast-spam (carpeta `laya/`)
- API pública de puntuación de spam: https://spam.quilcast.com
- Cliente Quilcast: https://quilcast.com
- Farcaster: https://farcaster.xyz
- TypeSafe (modelo Jev): https://typesafe.ai
