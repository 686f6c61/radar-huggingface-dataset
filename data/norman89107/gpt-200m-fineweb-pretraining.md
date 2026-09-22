# Norman89107/gpt-200m-fineweb-pretraining

## Resumen

GPT-200M es un modelo de lenguaje de tipo GPT entrenado desde cero (inicialización aleatoria) por el usuario Norman89107 sobre el dataset `HuggingFaceFW/fineweb`, en su configuración `sample-10BT` y en modo streaming. Se trata de un experimento educativo y de bajo coste: aproximadamente 198,5 millones de parámetros, arquitectura transformer decoder-only con tokenizador BPE de GPT-2 (vocabulario de 50.257 tokens) y una longitud de contexto de 1024 tokens. Todo el entrenamiento se realizó en una única GPU NVIDIA P100 de 16 GB con autocast en fp16 y gradient checkpointing, con un presupuesto declarado de 10 horas.

El interés del modelo es fundamentalmente metodológico: documenta paso a paso la configuración, los hiperparámetros y las métricas de entrenamiento, y publica los checkpoints intermedios en la carpeta `checkpoints/step_XXXXXX/` junto con el log completo en `training_log.jsonl`. No es un modelo orientado a producción ni a uso conversacional: carece de ajuste por instrucciones, de alineación (RLHF/DPO) y de cualquier evaluación estándar publicada.

Conviene señalar un dato relevante que se desprende de la propia model card: en el tramo de log disponible (pasos 25 a 500 de los 4000 previstos) la pérdida de entrenamiento desciende hasta 7,71 en el paso 100 y después repunta de forma sostenida hasta 13,62 en el paso 500, con la perplejidad escalando de 2.243 a 824.368. Es decir, el run mostraba una divergencia clara en los primeros pasos registrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (17 capas, 12 cabezas, 768 de dimensión de embedding) |
| Parametros totales | ~198,5 M |
| Longitud de contexto | 1024 tokens (`block_size`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos fp16; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en los metadatos; el corpus de entrenamiento (FineWeb `sample-10BT`) es predominantemente en inglés |
| Licencia | no disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | PyTorch `model.pt` (state_dict en fp16) + `config.json`; tokenizador BPE de GPT-2 en cada carpeta de checkpoint |
| Vocabulario | 50.257 tokens (BPE de GPT-2) |
| Dropout | 0,0 |
| Bias en las capas lineales | sí (`bias=True`) |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico, sin mezcla de expertos ni componentes de espacio de estados: 17 capas, 12 cabezas de atención, dimensión de embedding de 768, `block_size` de 1024, dropout desactivado y sesgos activados en las proyecciones. El tokenizador es el BPE de GPT-2 con 50.257 entradas, reutilizado tal cual. No se documenta ninguna innovación técnica adicional (no hay decodificación especulativa, atención lineal ni mecanismos híbridos): se trata de una implementación de referencia definida en el propio notebook de entrenamiento del autor.

El entrenamiento parte de inicialización aleatoria sobre `HuggingFaceFW/fineweb` (`sample-10BT`) en streaming y se ejecuta en una sola P100 de 16 GB con autocast fp16 y gradient checkpointing. El batch efectivo es de 16.384 tokens por paso (micro-batch de 8 × 2 pasos de acumulación × 1024 tokens), con AdamW (`betas=(0.9, 0.95)`), learning rate máximo de 3e-4 con 100 pasos de warmup y decaimiento hasta un 10 % del valor máximo, weight decay de 0,1 y recorte de gradiente de 1,0. La configuración prevé 4000 pasos con evaluación cada 250 pasos y guardado cada 500; a 16.384 tokens por paso, el run completo supondría del orden de 65,5 millones de tokens vistos, una cantidad muy reducida en términos de preentrenamiento. No hubo RLHF, DPO ni ajuste por instrucciones de ningún tipo.

## Capacidades

- Generación de texto autoregresiva básica en inglés: continuación de contexto a partir de un prefijo, dentro del límite de 1024 tokens.
- Modelado de lenguaje y estimación de perplejidad sobre texto en inglés, útil como referencia en experimentos comparativos.
- Ninguna capacidad de razonamiento verificada: no se han publicado evaluaciones de matemáticas, código o razonamiento multi-paso.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso estructurado.
- Sin modo de pensamiento (thinking), sin visión, sin audio y sin modalidad adicional.
- Sin ajuste por instrucciones: no responde de forma fiable a formatos de chat ni a prompts de sistema.
- Capacidades multilingües no declaradas; el corpus FineWeb es mayoritariamente inglés y el tokenizador de GPT-2 está fuertemente sesgado hacia ese idioma.
- Entrenamiento interrumpido o divergente en el tramo de log publicado, lo que limita cualquier expectativa de calidad de generación.

## Casos de uso

- Reproducción educativa de un pipeline de preentrenamiento: sirve para estudiar de principio a fin cómo se configura un run de GPT pequeño en una GPU única, con los hiperparámetros y el log completos disponibles en el repositorio.
- Estudio de dinámica de entrenamiento y divergencia: el `training_log.jsonl` permite analizar por qué la pérdida repunta a partir del paso 100 y qué combinación de learning rate, precisión fp16 y tamaño de batch efectivo lo provoca.
- Referencia base (baseline) en experimentos de ablación: al tener arquitectura y tokenizador conocidos y un checkpoint por cada 500 pasos, se puede comparar el efecto de cambios en el corpus, el scheduler o la inicialización.
- Pruebas de infraestructura y despliegue: un modelo de ~200 M en fp16 ocupa en torno a 0,4 GB de pesos, por lo que es útil para validar pipelines de carga de pesos, tokenización y servidores de inferencia antes de escalar a modelos mayores.
- Experimentos de tokenización y de preprocesado de datos: permite medir cómo afecta el BPE de GPT-2 a la compresión de distintos subconjuntos de FineWeb y cómo se refleja en la pérdida por token.
- Docencia y formación: adecuado para ilustrar en clase el funcionamiento de la atención, el gradient checkpointing y el autocast en fp16, sin necesidad de hardware especializado.
- Generación de texto de relleno en pruebas de integración: para validar el cableado de una aplicación (streaming de tokens, gestión de contexto, timeouts) sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye métricas calculadas durante el propio entrenamiento (pérdida y perplejidad), que no son comparables con evaluaciones estandarizadas tipo MMLU, HumanEval o GSM8K. Se reproduce a continuación un extracto del log publicado:

| Paso | Train loss | Perplejidad | LR | Grad norm | Tokens vistos (M) |
|---|---|---|---|---|---|
| 25 | 9,8047 | 18.118,87 | 7,50e-05 | 2,504 | 0,41 |
| 50 | 8,8775 | 7.169,19 | 1,50e-04 | 1,883 | 0,82 |
| 75 | 7,9170 | 2.743,49 | 2,25e-04 | 0,959 | 1,23 |
| 100 | 7,7154 | 2.242,63 | 3,00e-04 | 0,771 | 1,64 |
| 200 | 8,9448 | 7.668,29 | 3,00e-04 | 0,840 | 3,28 |
| 300 | 10,2291 | 27.696,95 | 2,98e-04 | 0,907 | 4,92 |
| 400 | 12,1375 | 186.754,32 | 2,96e-04 | 1,082 | 6,55 |
| 500 | 13,6224 | 824.368,42 | 2,93e-04 | 1,296 | 8,19 |

El log completo está disponible en `training_log.jsonl` dentro del repositorio. El throughput registrado se sitúa en torno a 9.500-11.150 tokens por segundo, con un MFU declarado de 0,78-0,95 y un pico de memoria reservada de 9,25 GB sobre la P100.

## Requisitos de hardware

- Pesos en fp16: aproximadamente 0,4 GB; en fp32, en torno a 0,8 GB. El repositorio completo ocupa 0,4 GB.
- Inferencia con caché KV para 1024 tokens de contexto: el consumo adicional es mínimo a esta escala; cabe holgadamente en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4090, etc.).
- Entrenamiento o ajuste fino: el autor lo ejecutó en una única NVIDIA P100 de 16 GB con gradient checkpointing y autocast fp16, con un pico de memoria reservada de 9,25 GB.
- GPU recomendadas para reproducir el run: cualquier GPU con 16 GB o más (P100, V100, A100, H100). Para inferencia basta con GPU integrada o CPU, dado el tamaño del modelo.
- Despliegue: no se proporcionan pesos en formato GGUF ni en formato de `transformers`, por lo que llama.cpp, Ollama, vLLM o TGI no pueden cargar el repositorio directamente. Es necesario cargar el `state_dict` con la clase GPT definida en el notebook del autor y, si se quiere usar otro runtime, convertir previamente los pesos.
- Latencia y throughput de inferencia: no disponibles en la información proporcionada. Durante el entrenamiento se registraron entre 9.180 y 11.153 tokens por segundo en una P100, pero esa cifra corresponde al paso hacia delante y hacia atrás con batch, no a decodificación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| GPT-200M (este modelo) | ~198,5 M | 1024 | ~8,2 M registrados en el log disponible (hasta 65,5 M previstos con 4000 pasos) | no disponible | PyTorch `.pt` fp16 |
| GPT-2 (124M) | 124 M | 1024 | ~40 GB de WebText (orden de decenas de miles de millones de tokens) | licencia MIT modificada | safetensors / PyTorch |
| Pythia-160M | 160 M | 2048 | 300.000 M (The Pile) | Apache 2.0 | safetensors / PyTorch |
| SmolLM-135M | 135 M | 2048 | 600.000 M (FineWeb-Edu y Cosmopedia) | Apache 2.0 | safetensors / GGUF |

Los datos de los modelos comparados corresponden a información pública ampliamente documentada; los de GPT-200M proceden exclusivamente de su model card. La diferencia fundamental no está en la arquitectura, sino en el volumen de cómputo y de datos: los tres modelos de referencia han visto entre tres y cuatro órdenes de magnitud más tokens, lo que se traduce en una diferencia cualitativa en la calidad de la generación. No hay datos de benchmarks para GPT-200M que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos. Al entrenarse sobre FineWeb sin filtrado adicional ni alineación, el modelo reproduce los sesgos presentes en ese corpus, especialmente los derivados de su sesgo hacia el inglés y hacia ciertos dominios web.
- Alucinación: el riesgo es alto y no mitigado. No hay ajuste por instrucciones ni RLHF, y el entrenamiento parece incompleto o divergente, por lo que las continuaciones pueden ser incoherentes o repetitivas.
- Divergencia en el entrenamiento: el log publicado muestra un aumento sostenido de la pérdida y de la perplejidad a partir del paso 100. Cualquier checkpoint posterior a ese punto debe tratarse con cautela.
- Volumen de datos insuficiente: los aproximadamente 8,2 millones de tokens vistos en el tramo registrado (y los ~65,5 millones previstos para 4000 pasos) están muy por debajo de lo necesario para que un modelo de 200 M resulte competitivo en generación de texto.
- Contexto limitado: 1024 tokens, sin posibilidad de extrapolación documentada.
- Idioma: el soporte multilingüe no está declarado y el corpus de entrenamiento es predominantemente inglés. El rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Licencia: no se declara licencia alguna en el repositorio, lo que impide determinar las condiciones de uso comercial. Ante la ausencia de licencia explícita, debe asumirse que no hay autorización clara para uso comercial.
- Formato propietario: los pesos dependen de una clase GPT definida en un notebook, no de una arquitectura registrada en `transformers`. Esto complica la reproducibilidad, la conversión y el despliegue en herramientas estándar.
- Uso en producción: no recomendado para ningún caso de uso real que requiera fiabilidad, dado el estado del entrenamiento y la ausencia de evaluaciones.
- Fechas del repositorio: los metadatos indican creación y actualización en septiembre de 2026, fecha posterior a la del registro de esta ficha; no se ha podido verificar su correspondencia con el contenido publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Norman89107/gpt-200m-fineweb-pretraining
- Dataset de entrenamiento (FineWeb, configuración `sample-10BT`): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Log de entrenamiento completo: `training_log.jsonl` en el repositorio del modelo
- Checkpoints intermedios: carpeta `checkpoints/step_XXXXXX/` del repositorio, con `model.pt`, `config.json` y ficheros del tokenizador BPE de GPT-2
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada.
