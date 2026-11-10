# darkc0de/Arete-27B-heretic-test1

## Resumen

Arete-27B-heretic-test1 es una variante "decensored" del modelo NousResearch/Arete-27B, publicada por el usuario darkc0de en Hugging Face. El modelo original, desarrollado por Nous Research, parte de Alibaba Qwen3.8-27B y se ha sometido a un post-entrenamiento mediante supervised fine-tuning (SFT) para reforzar lo que el autor denomina "valores occidentales", con el objetivo declarado de reducir sesgos y respuestas con encuadre ideologico del modelo base. Esta variante concreta aplica la herramienta Heretic v2.1.0 para eliminar los mecanismos de rechazo (refusals) del modelo, un proceso conocido como abliteration.

El modelo cuenta con 27.356.728.560 parametros totales (aproximadamente 27,4 mil millones), un contexto de entrenamiento de 64k tokens y un tamano de repositorio de 54,7 GB en formato safetensors. La arquitectura etiquetada es `qwen3_5`, heredada del modelo base, e incluye un encoder de vision que quedo congelado durante el entrenamiento del modelo original (los datos de post-entrenamiento fueron exclusivamente de texto). La licencia es Apache 2.0.

La relevancia de esta ficha radica en que combina dos tendencias actuales: por un lado, el ajuste de valores y alineacion ideologica sobre modelos de origen chino, y por otro, la eliminacion de capas de rechazo mediante tecnicas de abliteration. El resultado es un modelo de 27B con contexto largo, capacidad agentica y sin las restricciones de rechazo del modelo original, lo que lo hace interesante para investigacion sobre alineacion y para aplicaciones donde los filtros de seguridad del modelo base resultan demasiado restrictivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`, derivada de Qwen3.8-27B); incluye encoder de vision congelado |
| Parametros totales | 27.356.728.560 (aprox. 27,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16; el entrenamiento uso bf16 con master weights fp32) |

## Arquitectura y entrenamiento

El modelo base Arete-27B parte de Alibaba Qwen3.8-27B y se post-entreno exclusivamente mediante supervised fine-tuning (SFT), sin RL, sin optimizacion de preferencias y sin modificaciones arquitectonicas. El entrenamiento uso aproximadamente 52,8 millones de tokens a 64k de contexto, sin sequence packing, durante dos epocas y 1.202 pasos totales (601 por epoca). Se empleo el optimizador AdamW con betas (0,9, 0,98), epsilon 1e-5, weight decay 0,1, gradient clipping 1,0 y un learning rate con warmup lineal de 1e-6 a 1e-5 durante los primeros 120 pasos, seguido de decaimiento coseno hasta 1e-6 en el paso 1.202. El batch size fue de 48, con computo en bf16, master weights y estados del optimizador en fp32, y paralelismo tensorial de 4. Se entrenaron todos los pesos del modelo de lenguaje; el encoder de vision quedo congelado y la cabeza de multi-token-prediction (MTP) se desactivo durante el entrenamiento.

Los datos de entrenamiento se generaron a partir de 20.000 prompts distribuidos en siete categorias de valores (libertad de expresion, ideologia estatal, estado frente a mercado libre, educacion, privacidad de datos y vigilancia, democracia y politica medioambiental), con un pipeline de deduplicacion y verificacion contra el conjunto de evaluacion held-out. Las respuestas del profesor (modelo Inkling) se recopilaron junto a las del modelo de partida, y cada lote de datos paso por pull requests revisadas. La variante heretic-test1 aplica sobre este modelo la tecnica Arbitrary-Rank Ablation (ARA) de Heretic v2.1.0, con ablacion entre las capas 2 y 36, `preserve_good_behavior_weight` de 0,4433, `steer_bad_behavior_weight` de 0,2527, `overcorrect_relative_weight` de 0,9873 y `neighbor_count` de 15. El proceso es reproducible segun el autor, con instrucciones en el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto conversacional y asistencia general, con contexto de hasta 64k tokens.
- Razonamiento y respuesta a prompts complejos, heredado del modelo base Qwen3.8-27B.
- Capacidades agenticas y de trabajo multi-paso, segun el modelo original (Arete-27B se declara apto para "general assistance and agentic work").
- Capacidades multilingues: no documentadas explicitamente en la informacion disponible.
- Capacidad de vision: el modelo base incluye un encoder de vision (congelado durante el SFT), aunque el post-entrenamiento fue solo de texto; no se detalla el soporte efectivo de vision en esta variante.
- Eliminacion de rechazos (refusals): la ablacion ARA reduce los rechazos de 93/100 a 3/100 segun el clasificador del autor.
- Sin modo "thinking" documentado de forma explicita en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion de valores: el modelo permite estudiar como el SFT cambia el encuadre ideologico de un modelo de origen chino, comparando el modelo original con la variante decensored en las siete categorias de valores definidas por Nous Research.
- Evaluacion de tecnicas de abliteration: con los parametros ARA documentados y un proceso reproducible, sirve para reproducir experimentos de eliminacion de rechazos y medir el coste en divergencia KL (0,3179) y en benchmarks de conocimiento (PIQA 0,8047; ARC Easy 0,8371).
- Asistencia conversacional sin filtros excesivos: para aplicaciones donde los rechazos del modelo base resultan un obstaculo (por ejemplo, analisis de textos sensibles o generacion de contenido controvertido), con la advertencia de que la ausencia de rechazos implica ausencia de salvaguardas.
- Procesamiento de documentos largos: con 64k tokens de contexto, puede resumir o extraer informacion de contratos, informes o articulos extensos en una sola pasada.
- Generacion de texto en pipelines de investigacion: al estar en safetensors y licencia Apache 2.0, se integra en flujos de experimentacion con frameworks de inferencia estandar.
- Analisis de discurso politico y mediatico: util para comparar encuadres y detectar propaganda, dado el enfasis del modelo base en reducir respuestas con encuadre estatal (de 22% a 0,9% segun el autor).
- Base para fine-tuning posterior: al ser un modelo de 27B con licencia permisiva y pesos abiertos, sirve como punto de partida para ajustes especificos de dominio.

## Benchmarks y rendimiento

| Metrica | Este modelo (heretic-test1) | Modelo original (NousResearch/Arete-27B) |
|---|---|---|
| Rechazos (clasificador) | 3/100 | 93/100 |
| Divergencia KL | 0,3179 | 0 (por definicion) |
| PIQA (piqa) | 0,8047 | 0,8177 |
| ARC Easy (arc) | 0,8371 | 0,8123 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar para esta variante. El modelo base reporta una mejora en fact score de 2,32 a 2,98 sobre 5 y una reduccion de respuestas con propaganda del 22% al 0,9%, pero estos datos corresponden al modelo Arete-27B original, no a la variante heretic.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos (27,4B parametros x 2 bytes), mas overhead de activaciones y cache KV para contexto largo; en la practica se necesitan 60-70 GB para contexto moderado y mas para 64k tokens.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas en el repositorio; para reducir VRAM habria que generarlas a partir de los safetensors (por ejemplo, con llama.cpp o GPTQ/AWQ), sin garantia de calidad documentada.
- GPU recomendadas: para bf16 completo, A100 80GB, H100 80GB o configuraciones multi-GPU (2x A100 40GB con tensor parallelism). Para cuantizaciones de 8 bits, una RTX 4090 de 24GB podria no ser suficiente para 27B en bf16; en 4 bits (si se genera) cabria en 24GB con contexto limitado.
- Cabe en GPU de consumo: solo con cuantizaciones agresivas (4 bits) y contexto reducido; no en bf16.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp u Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Arete-27B-heretic-test1 | 27,4B | 64k | Apache 2.0 | Variante abliterated del Arete-27B; rechazos 3/100 |
| NousResearch/Arete-27B | 27B | 64k | Apache 2.0 (segun modelo base) | Modelo original con SFT de valores; rechazos 93/100 |
| Alibaba Qwen3.8-27B | 27B (aprox.) | No disponible | No disponible | Modelo de partida de Nous Research; sesgos de encuadre ideologico documentados por Nous |
| Modelos abliterated de la comunidad (p. ej., variantes de Qwen/Llama) | Variable | Variable | Variable | Alternativas de eliminacion de rechazos; no se dispone de datos comparativos concretos en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria mas alla de los reportados frente al modelo original.

## Limitaciones y advertencias

- La ablacion elimina los rechazos casi por completo (3/100), lo que implica que el modelo puede generar contenido danino, ilegal o eticamente problematico sin salvaguardas; no es apto para produccion orientada al publico sin filtros externos.
- La divergencia KL de 0,3179 respecto al modelo original indica un cambio distribucional apreciable; puede degradar comportamientos no medidos por PIQA y ARC Easy.
- Riesgo de alucinacion: no se reportan evaluaciones de factualidad para esta variante; el modelo base declara mejoras en fact score, pero la ablacion puede afectar a la calibracion.
- Sesgos: el post-entrenamiento del modelo base impone explicitamente una vision de valores occidentales; el modelo no es neutral y puede presentar sesgo ideologico en temas politicos.
- Idiomas soportados no documentados; el rendimiento fuera del ingles (y posiblemente chino, por herencia de Qwen) es incierto.
- El encoder de vision quedo congelado y no se entreno con datos de imagen; el soporte multimodal efectivo no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del uso recae en el desplegador.
- Modelo publicado por un usuario individual (darkc0de) sobre un modelo de Nous Research; no hay validacion independiente de los resultados reportados.
- El repositorio no incluye cuantizaciones ni formatos alternativos, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkc0de/Arete-27B-heretic-test1
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Blog de Nous Research sobre Arete: https://nousresearch.com/arete
- Dataset de evaluacion de propaganda: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- Dataset de entrenamiento (pares): https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Heretic (proyecto de abliteration): https://heretic-project.org
