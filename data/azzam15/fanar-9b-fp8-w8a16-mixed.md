# Azzam15/fanar-9b-fp8-w8a16-mixed

## Resumen

El modelo `Azzam15/fanar-9b-fp8-w8a16-mixed` es una cuantización post-entrenamiento (PTQ) del modelo `QCRI/Fanar-1-9B-Instruct`, un LLM bilingüe árabe-inglés de 9 mil millones de parámetros desarrollado por el Qatar Computing Research Institute (QCRI) y orientado a la construcción de asistentes conversacionales y automatización de operaciones en entornos donde la residencia de datos y el soporte de dialectos árabes son críticos. El autor de la cuantización, Azzam15, aplica el esquema FP8 de NVIDIA ModelOpt (`FP8_DEFAULT_CFG`) en modo W8A16: los pesos se almacenan en FP8 (formato E4M3, con escala por tensor) y las activaciones permanecen en FP16, lo que reduce el tamaño del modelo sin degradar significativamente la precisión.

La relevancia de esta ficha radica en que ofrece una alternativa más ligera y rápida para desplegar el modelo Fanar-1-9B en entornos de producción, especialmente en GPUs con memoria limitada. El repositorio documenta explícitamente que las escalas de pesos se calcularon de forma independiente de los datos de calibración (data-free), mientras que las escalas de activación estáticas se exportan como `input_scale`. La calibración se realizó con 512 muestras y 512 tokens de una variedad mixta (`calib3_mixed.txt`), lo que la convierte en una variante de control frente a otras cuantizaciones del mismo modelo (por ejemplo, `-fp8-msa`, `-fp8-gulf` y `-fp8-mixed`).

El checkpoint almacena pesos cuantizados planos, pero no registra internamente el modo weight-only; esa información reside en el nombre del repositorio y en `calib_stats.json`. No es cargable con `transformers` estándar porque `config.json` declara el tipo de cuantización `modelopt`, por lo que se requiere vLLM u otro runtime compatible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma2 (según los tags del repositorio, no confirmado por el autor) |
| Parámetros totales | 8.783.871.488 (8,78 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 W8A16 (pesos E4M3, escala per-tensor; activaciones FP16) |
| Idiomas soportados | Árabe e inglés (del modelo base) |
| Licencia | No disponible |
| Formato de pesos | Safetensors con cuantización `modelopt` (FP8) |

## Arquitectura y entrenamiento

El modelo base `QCRI/Fanar-1-9B-Instruct` es un LLM de 9B parámetros, ajustado mediante instrucciones, diseñado específicamente para el árabe y el inglés, con un enfoque en la conciencia cultural y el soporte de dialectos. Aunque la arquitectura exacta no se documenta en la información proporcionada, los tags del repositorio sugieren una base Gemma2. El modelo forma parte de la plataforma Fanar GenAI, que integra capacidades adicionales como generación de imagen, comprensión de vídeo e imagen, razonamiento profundo, TTS avanzado, ASR, atribución y verificación de hechos, y un sistema RAG islámico.

La cuantización se realizó con NVIDIA ModelOpt (versión 0.46.0) sobre un modelo base en float16. El proceso de calibración utilizó 512 muestras y 512 tokens de un conjunto de datos mixto (`calib3_mixed.txt`), pero las escalas de peso se calcularon de forma independiente de los datos de calibración (data-free), mientras que las escalas de activación estáticas se exportaron como `input_scale`. Se aplicaron 294 cuantizadores de peso, con un error cuadrático medio (MSE) de 3,033656e-08. Las activaciones quedaron en FP16, por lo que el checkpoint es idéntico independientemente del texto de calibración utilizado; esto lo convierte en un control para medir las variantes AWQ del mismo modelo.

## Capacidades

- Generación de texto bilingüe en árabe e inglés, incluyendo soporte de dialectos árabes (del modelo base).
- Conversación multi-turno e instrucciones complejas en contextos de atención al cliente y operaciones.
- Razonamiento y comprensión de lenguaje natural en entornos con datos culturalmente sensibles.
- Integración en pipelines de automatización de operaciones (Ops) donde se requiere residencia de datos.
- Capacidades extendidas de la plataforma Fanar GenAI (imagen, vídeo, TTS, ASR, RAG islámico) si se combina con el ecosistema completo, aunque el modelo por sí solo no las implementa.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Atención al cliente automatizada en árabe: el modelo puede gestionar conversaciones multi-turno en dialectos árabes, lo que resulta adecuado para empresas con base en Oriente Medio o con clientes arabófonos.
- Automatización de operaciones (Ops AI): integración en sistemas de gestión de incidencias, monitorización y respuestas automáticas en entornos donde la residencia de datos es obligatoria (por ejemplo, sector público o financiero en Qatar).
- Asistentes virtuales culturalmente conscientes: despliegue en aplicaciones que requieran un comportamiento lingüístico y cultural adaptado al mundo árabe, incluyendo terminología religiosa o legal específica.
- Análisis y generación de documentos en árabe: resúmenes, extracción de información y redacción de informes en árabe formal y dialectal.
- Traducción y adaptación automática entre árabe e inglés: el modelo bilingüe puede servir como motor de traducción contextual para textos técnicos o comerciales.
- Entornos de despliegue con recursos limitados: la cuantización FP8 reduce el tamaño del modelo a 9,3 GB, lo que permite ejecutar inferencias en GPUs de consumo con 12 GB de VRAM (por ejemplo, RTX 4080/4090) en lugar de requerir hardware de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo cuantizado no proporciona métricas de MMLU, HumanEval, GSM8K u otros estándares. El modelo base `QCRI/Fanar-1-9B-Instruct` tampoco incluye tablas de rendimiento en la documentación revisada. La única métrica documentada es el MSE de los pesos tras la cuantización: `3,033656e-08`.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 9,3 GB, por lo que la inferencia requiere al menos 10-12 GB de VRAM en FP8, dependiendo del tamaño del lote y de la longitud de contexto.
- GPU recomendadas: tarjetas con 12 GB de VRAM o más, como RTX 4080, RTX 4090, A10, A100 o H100. En GPUs de 8 GB (por ejemplo, RTX 3070) el modelo no cabe sin cuantización adicional.
- Despliegue: se recomienda vLLM con el flag `--quantization modelopt`, ya que el checkpoint no es cargable con `transformers` estándar. También podría usarse con TensorRT-LLM u otros motores compatibles con FP8.
- Latencia y throughput: no se han publicado datos; depende del hardware y de la longitud de la secuencia.
- La cuantización W8A16 (pesos FP8, activaciones FP16) reduce el uso de memoria y mejora la velocidad de inferencia en comparación con el modelo base FP16, manteniendo la precisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Azzam15/fanar-9b-fp8-w8a16-mixed` | 8,78 B | No disponible | No disponible | FP8 W8A16 | Cuantización weight-only, calibración mixta |
| `QCRI/Fanar-1-9B-Instruct` (base) | 8,78 B | No disponible | No disponible | FP16 | Modelo original, requiere más VRAM |
| `NouraAlqasim/fanar-9b-fp8-mixed` | 8,78 B | No disponible | No disponible | FP8 | Variante con escalas de activación estáticas |
| `NouraAlqasim/fanar-9b-fp8-msa` | 8,78 B | No disponible | No disponible | FP8 | Variante calibrada con dialecto MSA |
| `NouraAlqasim/fanar-9b-fp8-gulf` | 8,78 B | No disponible | No disponible | FP8 | Variante calibrada con dialecto del Golfo |

No hay datos de rendimiento comparativo entre estas variantes; la diferencia principal es el conjunto de calibración y la presencia de escalas de activación estáticas.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar: `config.json` declara el tipo de cuantización `modelopt`, por lo que se necesita un motor como vLLM o TensorRT-LLM.
- Las escalas de peso se calcularon de forma independiente de los datos de calibración, lo que significa que la calidad de la cuantización depende únicamente de la distribución de los pesos; no se ha validado en tareas de dominio específico.
- No es comparable con un checkpoint W4A4: la diferencia no es solo de precisión, sino también de qué tensores se cuantizaron.
- La licencia del modelo no está especificada, por lo que se recomienda contactar con el autor o con QCRI antes de un uso comercial.
- El modelo base puede presentar sesgos culturales o lingüísticos inherentes a los datos de entrenamiento; la cuantización no corrige estos sesgos.
- Riesgo de alucinación en tareas de razonamiento complejo, especialmente en dialectos árabes no representados en la calibración.
- La longitud de contexto no está documentada, por lo que se recomienda probar la ventana de contexto real en el entorno de despliegue.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/Azzam15/fanar-9b-fp8-w8a16-mixed
- Modelo base (QCRI/Fanar-1-9B-Instruct): https://huggingface.co/QCRI/Fanar-1-9B
- Variante hermana con calibración mixta: https://huggingface.co/NouraAlqasim/fanar-9b-fp8-mixed
- Descripción de Fanar-1-9B en llm.co: https://llm.co/llms/fanar-1-9b-instruct
- Página de modelmap (mapa de arquitecturas): https://modelmap.cc/## Resumen

El modelo `Azzam15/fanar-9b-fp8-w8a16-mixed` es una cuantización post-entrenamiento (PTQ) del modelo `QCRI/Fanar-1-9B-Instruct`, un LLM bilingüe árabe-inglés de 9 mil millones de parámetros desarrollado por el Qatar Computing Research Institute (QCRI) y orientado a la construcción de asistentes conversacionales y automatización de operaciones en entornos donde la residencia de datos y el soporte de dialectos árabes son críticos. El autor de la cuantización, Azzam15, aplica el esquema FP8 de NVIDIA ModelOpt (`FP8_DEFAULT_CFG`) en modo W8A16: los pesos se almacenan en FP8 (formato E4M3 con escala por tensor) y las activaciones permanecen en FP16, lo que reduce el tamaño del modelo respecto al FP16 original.

La relevancia de esta ficha radica en que ofrece una variante cuantizada eficiente para desplegar el modelo Fanar-1-9B en entornos de producción con recursos limitados. El repositorio documenta que las escalas de peso se calcularon de forma independiente de los datos de calibración (data-free), por lo que el checkpoint es idéntico independientemente del texto de calibración utilizado; la variación `mixed` en el nombre se refiere únicamente a las escalas de activación estáticas exportadas como `input_scale`. La cuantización no es cargable con `transformers` estándar y requiere un runtime como vLLM con `--quantization modelopt`.

El checkpoint almacena pesos cuantizados planos, y el modo weight-only solo se refleja en el nombre del repositorio y en `calib_stats.json`. Con un error cuadrático medio (MSE) de los pesos de 3,033656e-08 y 294 cuantizadores, esta variante actúa como control para las versiones AWQ del mismo modelo, ya que la calibración no alcanza los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma2 (según tags del repo, no confirmado por el fabricante) |
| Parámetros totales | 8.783.871.488 (8,78 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 W8A16 (pesos E4M3, escala per-tensor; activaciones FP16) |
| Idiomas soportados | Árabe e inglés (del modelo base) |
| Licencia | No disponible |
| Formato de pesos | Safetensors con cuantización ModelOpt (FP8) |

## Arquitectura y entrenamiento

El modelo base `QCRI/Fanar-1-9B-Instruct` es un LLM de 9B parámetros ajustado por instrucciones, diseñado específicamente para el árabe y el inglés, con un enfoque en la conciencia cultural y el soporte de dialectos. Aunque la arquitectura exacta no se documenta en la información proporcionada, los tags del repositorio sugieren una base en Gemma2. El modelo forma parte de la plataforma Fanar GenAI, que integra capacidades como generación de imágenes, comprensión de vídeo e imagen, razonamiento profundo, TTS avanzado, ASR, atribución y verificación de hechos, y un sistema RAG islámico.

La cuantización se realizó con NVIDIA ModelOpt (versión 0.46.0) sobre un modelo base en float16. El proceso de calibración utilizó 512 muestras y 512 tokens de un conjunto de datos mixto (`calib3_mixed.txt`), pero las escalas de peso se calcularon de forma independiente de los datos de calibración (data-free), por lo que el checkpoint es idéntico sea cual sea el texto de calibración. Las escalas de activación estáticas se exportaron como `input_scale` y los cuantizadores de peso se aplicaron en 294 tensores. El entorno de trabajo fue torch 2.8.0+cu128, transformers 4.57.6 y modelopt 0.46.0.

## Capacidades

- Generación de texto bilingüe en árabe e inglés, incluyendo soporte de dialectos árabes (del modelo base).
- Conversación multi-turno y ejecución de instrucciones complejas en contextos de atención al cliente y operaciones.
- Comprensión de lenguaje natural con sensibilidad cultural y terminología específica de la región (por ejemplo, terminología legal o religiosa).
- Integración en la plataforma Fanar GenAI para tareas adicionales como generación de imágenes, comprensión de vídeo e imagen, TTS y ASR, aunque el modelo cuantizado en sí no incluye estas capacidades de forma nativa.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- Atención al cliente automatizada en árabe: el modelo puede gestionar conversaciones multi-turno con dialectos árabes, adecuado para empresas con operaciones en Oriente Medio o con clientes arabófonos.
- Automatización de operaciones de TI (Ops AI): integración en sistemas de gestión de tickets y respuestas automáticas en entornos donde la residencia de datos es obligatoria (sector público, financiero).
- Asistentes virtuales culturalmente conscientes: despliegue en aplicaciones que requieran un tono y terminología adaptados a la cultura árabe, incluyendo terminología islámica en contextos educativos o religiosos.
- Traducción y adaptación automática entre árabe e inglés: el modelo bilingüe puede servir de motor de traducción para documentos técnicos o comerciales.
- Generación de documentación corporativa en inglés y árabe: redacción de informes, resúmenes y correos electrónicos en ambos idiomas.
- Despliegue en entornos con recursos limitados: la cuantización FP8 reduce el tamaño a 9,3 GB, lo que permite ejecutar el modelo en GPU de consumo con 12 GB de VRAM (por ejemplo, RTX 4080 o 4090) mediante vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni otros estándares. El modelo base `QCRI/Fanar-1-9B-Instruct` tampoco muestra tablas de rendimiento en la documentación revisada. La única métrica documentada es el error cuadrático medio (MSE) de los pesos tras la cuantización: 3,033656e-08.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 9,3 GB, por lo que se recomienda al menos 10-12 GB de VRAM para inferencia en FP8 con un lote pequeño.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100 o H100 con 12 GB de VRAM o más. En GPUs de 8 GB (por ejemplo, RTX 3070) no cabe el modelo completo.
- Despliegue: vLLM con el flag `--quantization modelopt` es el método recomendado. No es cargable con `transformers` estándar.
- Latencia y throughput: no se han publicado estimaciones. Dependerán del hardware, la longitud de secuencia y el tamaño del lote.
- La cuantización W8A16 reduce el uso de memoria y mejora la velocidad de inferencia en comparación con el modelo FP16 original, aunque no se dispone de mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Azzam15/fanar-9b-fp8-w8a16-mixed` | 8,78 B | No disponible | No disponible | FP8 W8A16 | Cuantización weight-only, calibración mixta |
| `QCRI/Fanar-1-9B-Instruct` (base) | 8,78 B | No disponible | No disponible | FP16 | Modelo original, requiere más VRAM |
| `NouraAlqasim/fanar-9b-fp8-mixed` | 8,78 B | No disponible | No disponible | FP8 | Variante con escalas de activación estáticas |
| `NouraAlqasim/fanar-9b-fp8-msa` | 8,78 B | No disponible | No disponible | FP8 | Variante calibrada con dialecto MSA |
| `NouraAlqasim/fanar-9b-fp8-gulf` | 8,78 B | No disponible | No disponible | FP8 | Variante calibrada con dialecto del Golfo |

No hay datos de rendimiento comparativo entre estas variantes. La diferencia principal está en la calibración de activaciones y en la presencia de escalas estáticas, no en los pesos.

## Limitaciones y advertencias

- No es cargable con `transformers` estándar: `config.json` declara cuantización `modelopt`, por lo que se necesita vLLM u otro motor compatible.
- Las escalas de peso se calcularon data-free, lo que significa que la calidad de la cuantización no se ha validado con tareas específicas del dominio.
- No es comparable a un checkpoint W4A4: la diferencia no es solo de precisión, sino también de qué tensores se cuantificaron.
- La licencia no está especificada, por lo que se recomienda contactar con el autor o con QCRI antes de un uso comercial.
- El modelo base puede heredar sesgos culturales o lingüísticos de los datos de entrenamiento; la cuantización no los corrige.
- Riesgo de alucinación en tareas de razonamiento complejo, especialmente en dialectos árabes con poca representación en la calibración.
- La longitud de contexto no está documentada; se recomienda probar la ventana real antes de desplegar en producción.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Azzam15/fanar-9b-fp8-w8a16-mixed
- Modelo base (QCRI/Fanar-1-9B-Instruct): https://huggingface.co/QCRI/Fanar-1-9B
- Variante de referencia con calibración mixta: https://huggingface.co/NouraAlqasim/fanar-9b-fp8-mixed
- Descripción de Fanar-1-9B en llm.co: https://llm.co/llms/fanar-1-9b-instruct
- Modelmap (mapa de arquitecturas): https://modelmap.cc/
