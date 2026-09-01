# BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF

## Resumen

GLM-5.3-Flash-Uncensored es una version modificada del modelo GLM-5.3-Flash de Zhipu AI (Z.ai), a la que OrcaRouter ha aplicado una tecnica de "abliteration" para eliminar los mecanismos de rechazo de peticiones dañinas, dando lugar a un modelo sin censura. Este repositorio de BoldingBuilds ofrece cuantizaciones GGUF de esa version, construidas con una matriz de importancia (imatrix) personalizada y medidas de rendimiento realizadas directamente sobre los pesos cuantizados, no sobre el modelo original en FP8.

El modelo base es un MoE (mezcla de expertos) de 320 mil millones de parametros totales, con 18 mil millones activos por token, 288 expertos enrutados de los que se seleccionan 8, y una ventana de contexto de 1 millon de tokens. Es un modelo multimodal con capacidad de vision nativa, aunque el proyector de vision incluido en este repositorio aun no ha sido probado de extremo a extremo. Su relevancia radica en ser una de las pocas opciones de codigo abierto con licencia MIT, contexto de 1M y un rendimiento en codigo y tareas de largo horizonte que, segun Z.ai, supera en un 50% a GLM-5.2 en su propio benchmark interno.

La version cuantizada IQ3_XXS (128.6 GB) muestra una tasa de rechazo de solo el 4% en JailbreakBench, frente al 93% del modelo original sin abliterar, y alcanza un pass@1 de 0.927 en HumanEval, lo que indica que la cuantizacion no ha degradado significativamente las capacidades del modelo. Es importante destacar que se trata de un modelo sin censura, liberado para investigacion en red-teaming y estudio de mecanismos de rechazo, no para uso general en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer con atencion por ventanas, 288 expertos enrutados top-8 |
| Parametros totales | 320.759.404.382 (320.8 mil millones) |
| Parametros activos | 18 mil millones (18B) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 (modelo base), IQ3_XXS (128.6 GB), IQ2_S (100.4 GB), IQ2_XXS (90.2 GB) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (con shards), safetensors para el modelo base FP8 |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos con 320 mil millones de parametros totales y 18 mil millones activos por token. Utiliza 288 expertos enrutados de los que se activan 8 por token, un diseno que permite mantener un alto rendimiento con un coste computacional relativamente bajo. La ventana de contexto es de 1 millon de tokens, lo que permite procesar repositorios de codigo completos o conversaciones muy largas. El modelo incluye un bloque MTP (Multi-Token Prediction) o NextN, que en la cuantizacion se fuerza a q8_0 para evitar problemas de convergencia.

El proceso de entrenamiento de GLM-5.3 se basa en el mismo modelo base que GLM-5.2, con todas las mejoras provenientes de la fase de post-entrenamiento. Segun Z.ai, esto incluye refuerzo con preferencias humanas y tecnicas de optimizacion especificas para tareas de codificacion y agenticas. OrcaRouter aplico posteriormente una tecnica de abliteration, que consiste en identificar y eliminar la direccion de rechazo en el espacio de activaciones del modelo, dando como resultado un modelo que no se niega a responder peticiones dañinas. La cuantizacion GGUF se realizo convirtiendo el modelo FP8 a BF16 y luego aplicando una matriz de importancia calculada sobre un corpus de 1.24 MB con 60 fragmentos intercalados.

## Capacidades

- Generacion de texto y razonamiento complejo en tareas de largo horizonte, con soporte para planificacion multi-paso.
- Codificacion de software a nivel de repositorio completo, con mejora del 50% sobre GLM-5.2 en el benchmark interno de Z.ai.
- Soporte de vision nativa mediante un proyector multimodal (mmproj) que procesa imagenes de 448x448 píxeles con 24 bloques y patch size 14, aunque en esta cuantizacion aun no ha sido probado de extremo a extremo.
- Capacidad de procesamiento de video (la torre de vision del modelo base lo soporta, aunque no se ha verificado en esta version).
- Soporte de tool calling y function calling, habilitado por el formato de chat con jinja.
- Capacidades multilingues, aunque no se han documentado los idiomas concretos.
- Modo de pensamiento (thinking) siempre activo, segun la model card, que permite razonamiento interno antes de responder.
- Sin mecanismos de rechazo de contenido dañino (uncensored), por lo que puede generar respuestas a peticiones peligrosas.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo es idoneo para estudiar como funcionan los mecanismos de rechazo en LLMs, evaluar la robustez de los sistemas de seguridad y desarrollar contramedidas. Su alta tasa de cumplimiento (96% en JailbreakBench) permite analizar patrones de comportamiento en escenarios adversarios.
- Evaluacion de la degradacion de capacidades tras cuantizacion: los datos medidos sobre los pesos cuantizados (HumanEval pass@1 de 0.927) lo convierten en un caso de estudio valioso para comparar la perdida de rendimiento entre FP8 y cuantizaciones de 3 bits.
- Desarrollo de sistemas de moderacion de contenido: al ser un modelo sin censura, se puede utilizar como generador de ejemplos adversarios para entrenar clasificadores de contenido dañino o sistemas de guardarrailes.
- Pruebas de robustez de pipelines de agentes: con su contexto de 1M de tokens y soporte de tool calling, se puede usar para estresar arquitecturas de agentes con tareas de largo recorrido y detectar fallos en la gestion de memoria o en el seguimiento de instrucciones.
- Analisis de alucinacion en modelos cuantizados: la combinacion de cuantizacion agresiva (IQ3_XXS) y un modelo sin filtros permite estudiar como la precision reducida afecta a la veracidad de las respuestas en escenarios de alta exigencia.
- Benchmarking de hardware para inferencia de modelos MoE: al requerir 128.6 GB solo para los pesos, es un banco de pruebas realista para evaluar el rendimiento de servidores con multiples GPUs y sistemas de memoria unificada.

## Benchmarks y rendimiento

La model card proporciona mediciones realizadas directamente sobre la cuantizacion IQ3_XXS, no sobre el modelo FP8 original. Se utilizo un clasificador de prefijos basado en reglas para evaluar el rechazo, con una configuracion de generacion greedy y max_tokens de 8192.

| Benchmark | Metrica | Resultado |
|---|---|---|
| JailbreakBench harmful (n=100) | Tasa de rechazo | 0.040 (4%) |
| JailbreakBench harmful (n=100) | Cumplimiento con descargo | 0.270 (27%) |
| JailbreakBench harmful (n=100) | Cumplimiento limpio | 0.600 (60%) |
| JailbreakBench harmful (n=100) | Respuestas vacias | 0.090 (9%) |
| JailbreakBench benign (n=100) | Tasa de rechazo | 0.010 (1%) |
| AdvBench derivado (n=120) | Tasa de rechazo | 0.033 (3.3%) |
| AdvBench derivado (n=120) | Respuestas vacias | 0.075 (7.5%) |
| HumanEval (n=164) | pass@1 | 0.927 |
| HumanEval (n=164) | capped | 0.055 |
| HumanEval (n=164) | cond_acc | 0.981 |
| HumanEval (n=164) | mediana de tokens | 556 |

Comparativa con el modelo base sin abliterar (mediciones de OrcaRouter sobre FP8): el modelo base tiene una tasa de rechazo de 0.930 en JailbreakBench, mientras que el modelo abliterado FP8 baja a 0.120 y esta cuantizacion IQ3_XXS a 0.040. No se dispone de comparativas con otros modelos de la misma categoria en benchmarks estandar como MMLU o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF pesan entre 90.2 GB (IQ2_XXS) y 128.6 GB (IQ3_XXS). Con overhead de contexto y calculos, se necesita al menos 120-160 GB de VRAM para la cuantizacion mas pequeña y 160-200 GB para la recomendada.
- GPU recomendadas: la model card menciona una H200 para las pruebas (141 GB de VRAM), que es suficiente para IQ3_XXS. Alternativas: 2x A100 80GB en paralelo, 2x H100 80GB, o sistemas con memoria unificada como Apple Silicon con 192 GB unificados.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por su tamano; se requiere hardware de servidor o multiples GPUs.
- Opciones de despliegue: llama.cpp con llama-server (indicado en la model card), compatible con vLLM si se convierte a safetensors, y potencialmente con TGI u Ollama (aunque el tamano lo hace poco practico).
- Latencia: no se proporcionan datos de latencia. Con 18B parametros activos, la velocidad de generacion dependera del ancho de banda de memoria; en una H200 se estiman entre 20-40 tokens/segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas con otros modelos de la misma categoria (MoE de 300B+ con contexto 1M). Los unicos datos comparables provienen del propio GLM-5.3-Flash sin abliterar:

| Modelo | Parametros totales | Activos | Contexto | Licencia | JailbreakBench (refusal) |
|---|---|---|---|---|---|
| zai-org/GLM-5.3-Flash | 320B | 18B | 1M | MIT | 0.930 |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | 320B | 18B | 1M | MIT | 0.120 |
| BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF (IQ3_XXS) | 320B | 18B | 1M | MIT | 0.040 |

Otros modelos MoE de tamano comparable, como Mixtral 8x22B (141B totales, 39B activos) o DeepSeek-V3 (671B totales, 37B activos), no tienen la misma combinacion de contexto, licencia y capacidades de vision, pero no hay datos de benchmarks comparables en las fuentes disponibles.

## Limitaciones y advertencias

- Modelo sin censura: los mecanismos de rechazo han sido eliminados deliberadamente. Puede generar contenido dañino, ilegal o poco etico, incluyendo instrucciones para violencia, explotacion sexual o actividades criminales. No debe desplegarse en entornos de produccion sin guardarrailes externos.
- Riesgo de alucinacion: al ser una cuantizacion de 3 bits (IQ3_XXS), la precision numerica reducida puede aumentar la frecuencia de respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo.
- Sesgos no mitigados: no se han documentado evaluaciones de sesgo para esta version; el proceso de abliteration puede afectar a los sesgos existentes del modelo base.
- Vision no verificada: el proyector de vision se ha construido correctamente segun la metadata, pero no se ha probado con imagenes reales. Usar la funcion multimodal en produccion es arriesgado.
- Respuestas vacias: en las pruebas, un porcentaje significativo de peticiones (hasta 26.7% con max_tokens=2048) devuelve contenido vacio, lo que puede indicar problemas de truncamiento o loops internos.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, el rendimiento en contextos muy largos no ha sido evaluado en esta cuantizacion.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero la naturaleza del modelo (uncensored) puede generar responsabilidades legales o de reputacion para quien lo despliegue.
- Requisitos de hardware: el tamano de los pesos (minimo 90 GB) limita su uso a entornos con multiples GPUs o hardware especializado, lo que excluye la mayoria de estaciones de trabajo de consumo.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/BoldingBuilds/orcarouter_GLM-5.3-Flash-Uncensored-GGUF
- Modelo base FP8 de OrcaRouter: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Pagina de OrcaRouter: https://www.orcarouter.ai/
- Pagina de GLM-5.3 en OrcaRouter: https://www.orcarouter.ai/models/z-ai/glm-5.3
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Pagina de GLM-5.3 en OpenLM: https://openlm.ai/glm-5.5/
