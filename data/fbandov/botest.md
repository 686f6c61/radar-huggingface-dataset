# fbandov/botest

## Resumen

botest v1 (round 12) es un detector local de texto generado por máquina, publicado por el desarrollador fbandov en Hugging Face. El modelo no clasifica documentos completos, sino que asigna un nivel a cada token (`clean`, `light`, `moderate`, `heavy`) y agrega esas puntuaciones primero a nivel de frase y después a nivel de documento, lo que permite señalar los pasajes concretos que "suenan" generados en lugar de devolver un único número para toda la página. Está construido sobre el encoder `jhu-clsp/mmBERT-small` y se ejecuta íntegramente en la máquina donde se instala, mediante Candle en CPU y sin Python en tiempo de ejecución.

El modelo tiene 140.643.076 parámetros totales, un repositorio de 0,3 GB y pesos en fp16 de 281 MB. Cubre nueve idiomas calibrados (alemán, inglés, español, francés, italiano, neerlandés, polaco, portugués y turco) y rechaza explícitamente cualquier otro idioma en lugar de devolver una puntuación no respaldada por su calibración. La licencia es Apache-2.0 y el encoder base es MIT.

Su relevancia actual radica en el enfoque de calibración por idioma con presupuesto de falsos positivos y en la separación estricta entre pesos, calibración y scorer: sin el archivo `calibration.json`, el modelo solo produce logits y el sistema no permite interpretarlos como veredicto. La model card no publica todavía ninguna cifra de precisión, a la espera de completar la ejecución de evaluación sobre los conjuntos held-out congelados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), base `jhu-clsp/mmBERT-small`, 22 capas, hidden 384, vocabulario 256k |
| Parametros totales | 140.643.076 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en fp16; otras cuantizaciones no disponibles |
| Idiomas soportados | de, en, es, fr, it, nl, pl, pt, tr (calibrados); ja, zh y ru entrenados pero no calibrados y rechazados en inferencia |
| Licencia | Apache-2.0 (encoder base MIT) |
| Formato de pesos | safetensors (`model.safetensors`, fp16, 281 MB) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, concretamente un fine-tuning de `jhu-clsp/mmBERT-small` con 22 capas, dimensión oculta de 384 y un vocabulario de 256.000 tokens. Sobre el encoder se añade una cabeza de clasificación de tokens con cuatro salidas (`clean`, `light`, `moderate`, `heavy`). La puntuación de una frase se deriva de las puntuaciones de sus tokens y la del documento de las de sus frases, lo que permite localizar pasajes concretos. La inferencia se realiza con Candle sobre CPU, sin dependencia de Python en tiempo de ejecución.

El entrenamiento se organiza en rondas con barras de calidad pre-registradas antes de cada ejecución, y los scripts de entrenamiento, la receta de datos y el ajuste de calibración están en el árbol de código fuente (`training/hf_jobs/launch_round.sh`, `training/src/botest_training/`). Los conjuntos held-out se construyen a partir de texto humano anterior a los generadores (arXiv 2021, Stack Exchange anterior a 2022, artículos enciclopédicos, prosa de essay mills) más reescrituras generadas de esas mismas fuentes, abarcando 16 modelos de pesos abiertos y las familias GPT, Claude y Grok. Cada grupo de fuga de un documento se asigna de forma determinista a un único split para evitar contaminación entre entrenamiento y evaluación. La calibración `v1-r12-refit` incluye temperatura por idioma y tres umbrales ajustados sobre texto held-out con un presupuesto de falsos positivos.

## Capacidades

- Detección de texto generado por máquina a nivel de token, con cuatro niveles (`clean`, `light`, `moderate`, `heavy`).
- Agregación de puntuaciones a nivel de frase y de documento, permitiendo señalar pasajes concretos.
- Clasificación de tokens (pipeline `token-classification`), no de secuencias completas.
- Soporte multilingüe para nueve idiomas calibrados: alemán, inglés, español, francés, italiano, neerlandés, polaco, portugués y turco.
- Rechazo explícito de idiomas no calibrados (incluidos japonés, chino y ruso, que fueron entrenados pero no alcanzaron el umbral de medición).
- Inferencia local en CPU sin envío de texto a servicios externos.
- Verificación de integridad de archivos mediante sha256 a través de `model.toml` como manifiesto de descarga y descriptor del scorer.
- Salida en JSON con offsets de byte mediante el comando `botest score`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (no disponible en la información).

## Casos de uso

- Moderación de contenido en plataformas editoriales: el modelo puede marcar frases concretas de un manuscrito o artículo que "suenan" generadas, permitiendo a un editor revisar solo los pasajes señalados en lugar de todo el documento, gracias a la clasificación por tokens y la agregación por frases.
- Verificación de originalidad en entornos académicos: integrado en flujos de revisión, permite adjuntar un informe con niveles por frase y offsets de byte, útil como señal complementaria (no como prueba) en procesos de revisión de trabajos.
- Análisis forense de documentos en investigación periodística: al ejecutarse localmente en CPU y no enviar texto a terceros, es adecuado para redacciones que manejan material sensible o embargado.
- Control de calidad en pipelines de generación de contenido: permite detectar automáticamente salidas de modelos en lotes de texto multilingüe (nueve idiomas calibrados) antes de su publicación, con umbrales ajustados por idioma.
- Auditoría de corpus para investigación en IA: investigadores pueden medir la proporción de texto generado en un corpus histórico o contemporáneo, con la ventaja de que los conjuntos de evaluación del proyecto están congelados y son reproducibles mediante `eval/gates_langs.sh`.
- Filtrado de datos de entrenamiento: antes de usar un corpus para entrenar otros modelos, se puede pasar por botest para identificar y excluir documentos o pasajes con nivel `heavy`, reduciendo la contaminación por texto sintético.
- Despliegue en entornos sin GPU ni Python: al usar Candle en CPU y distribuirse como binario con manifiesto de descarga verificado, encaja en estaciones de trabajo o servidores ligeros donde no se quiere instalar un stack de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el archivo `EVAL.md` con la tabla por idioma y por familia "no está aquí todavía" porque la ejecución de evaluación está en curso, y que hasta que aparezca no se publica ninguna cifra de precisión "en lugar de una provisional".

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo publicado; la inferencia es en CPU con Candle y pesos fp16 de 281 MB.
- GPU recomendadas: no disponible; el diseño del proyecto es explícitamente CPU-first.
- Cabe en GPU consumer: no disponible como dato oficial; por tamaño (140,6 M de parámetros, pesos de 281 MB) cabría en cualquier GPU consumer, pero el proyecto no documenta un camino GPU.
- Opciones de despliegue: binario `botest` con los comandos `botest model fetch`, `botest report` y `botest score`; inferencia vía Candle. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| botest v1 (fbandov) | 140,6 M | no disponible | 9 calibrados | Apache-2.0 | Clasificación por tokens con calibración por idioma y rechazo de idiomas no calibrados |
| jhu-clsp/mmBERT-small (base) | no disponible en la información | no disponible | multilingüe | MIT | Encoder multilingüe de propósito general; no es un detector |
| Detectores de texto IA comerciales | no disponible | no disponible | variable | propietaria | Clasificación a nivel de documento, normalmente vía API |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (detección de texto generado con clasificación por tokens) en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un verificador de plagio, ni una prueba de autoría, ni evidencia: la propia model card lo declara explícitamente. Una puntuación cercana a un umbral solo indica que el texto está cerca de ese umbral.
- Riesgo de falsos positivos: la calibración se ajusta con un presupuesto de falsos positivos, pero los conjuntos de evaluación están compuestos por documentos generados por modelos respondiendo a los prompts del propio proyecto; un modelo ejecutando el encargo concreto de una persona real es un caso más difícil que cualquiera de los evaluados.
- Idiomas no calibrados: japonés, chino y ruso fueron entrenados y medidos pero se rechazan en inferencia porque no alcanzaron el umbral; cualquier idioma fuera de los nueve calibrados se rechaza por nombre.
- Dependencia crítica de `calibration.json`: sin ese archivo el modelo solo produce logits y el sistema no permite interpretarlos como veredicto; los cuatro archivos auxiliares (`config.json`, `head.json`, `tokenizer.json`, `calibration.json`) no son opcionales.
- Ausencia de cifras de rendimiento publicadas: no hay precisión, recall ni tasas de error disponibles en la información; la evaluación está en curso.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial; el encoder base es MIT. No se documentan restricciones adicionales.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un proyecto reciente y sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fbandov/botest
- Encoder base: https://huggingface.co/jhu-clsp/mmBERT-small
- Candle (motor de inferencia): https://github.com/huggingface/candle
