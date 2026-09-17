# CharlieChen/loop-fwe-vanilla-d12

## Resumen

loop-fwe-vanilla-d12 es un modelo de lenguaje base (pretrained, sin ajuste por instrucciones) publicado por el usuario CharlieChen en Hugging Face. Se trata del punto "Vanilla d12" de la familia presentada en el trabajo *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents*, cuyo objetivo es estudiar cómo crecen los exponentes de escalado en función de la profundidad, la recursión y los operadores de frontera. El checkpoint almacena 494.272.512 parámetros en FP32 (unos 0,49 mil millones), con ancho 1536, 12 cabezas de atención y una coordenada de profundidad d12.

El modelo se entrena sobre FineWeb-Edu con tokenizador GPT-2 (vía tiktoken) y una longitud de contexto de 2.048 tokens. Es un artefacto de investigación más que un modelo de producción: los pesos son idénticos bit a bit al checkpoint del artículo, el repositorio solo contiene tensores y la recurrencia de evaluación final, y no se distribuye el estado del optimizador. El código de inferencia es una implementación propia (`TransformerGPT`) del repositorio del paper, por lo que no es un artefacto `AutoModel` de Transformers.

Su relevancia es fundamentalmente metodológica: permite reproducir las métricas de escalado y las evaluaciones CORE del estudio (22 tareas, 91.037 ejemplos, medias sobre las semillas 0, 1 y 2) sobre un punto concreto de la escalera de profundidad. No hay licencia declarada, no tiene descargas ni interacciones registradas y su rendimiento absoluto es bajo (CORE accuracy de 0,1699), lo que lo sitúa como material de análisis experimental, no como base para aplicaciones finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, variante "vanilla" del estudio sobre looped transformers (implementacion propia `TransformerGPT`) |
| Parametros totales | 494.272.512 (almacenados en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos FP32 en `final.pt`) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (FP32); no es un artefacto `AutoModel` de Transformers, no hay safetensors ni GGUF |
| Ancho (hidden size) | 1536 |
| Cabezas de atencion | 12 |
| Coordenada de profundidad | d12 (puede diferir del numero de bloques Transformer ejecutados) |
| Repeticiones del nucleo final | 1 |
| Tokenizador | GPT-2 via tiktoken |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu |
| NLL de validacion de pretraining | 2,80350093 nats/token |
| Tamano del repositorio | 2,0 GB |
| Ficheros incluidos | `final.pt`, `result.json`, `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con normalizacion y atencion multi-cabeza estandar (1536 de ancho, 12 cabezas), pero encuadrado en una "escalera" de profundidad: la coordenada d12 es la coordenada de escalado del estudio y no necesariamente coincide con el numero de bloques Transformer efectivamente ejecutados. En esta variante "vanilla", las repeticiones finales del nucleo son 1, es decir, se trata del punto de control sin recursión adicional, lo que lo convierte en la referencia base frente a las variantes con crecimiento de modelo, recursion y operadores de frontera que analiza el articulo. El repositorio incluye la recurrencia de evaluacion final junto con los tensores del modelo.

El entrenamiento se realizo sobre el corpus FineWeb-Edu con tokenizador GPT-2 (tiktoken) y se evalua mediante la metrica CORE (22 tareas, 91.037 ejemplos, medias archivadas sobre las semillas 0, 1 y 2), con un protocolo de evaluacion que usa H100 con FlashAttention-3 y autocast en bfloat16. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion detallada del dataset, ni sobre fases de RLHF, DPO o ajuste por instrucciones: es un modelo exclusivamente preentrenado. La validacion de pretraining reporta un NLL de 2,80350093 nats/token, mientras que el NLL de respuesta en CORE es de 2,93537428 nats/token (ambas cifras no son comparables entre si, segun la propia model card). Los pesos exportados son identicos bit a bit al checkpoint del articulo y el estado del optimizador no se incluye.

## Capacidades

- Generacion de texto autoregresiva en ingles: es la tarea declarada en el pipeline (`text-generation`).
- Modelo base sin ajuste por instrucciones: no tiene modo chat, ni formato de prompt conversacional, ni alineacion por RLHF/DPO.
- Continuacion y modelado de lenguaje sobre contextos de hasta 2.048 tokens.
- Capacidad de evaluacion controlada mediante la metrica CORE del articulo (22 tareas, 91.037 ejemplos), utilizable para reproducir los resultados publicados.
- No hay evidencia disponible de soporte de tool calling ni de function calling.
- No hay evidencia disponible de capacidades de agente, razonamiento multi-paso explicito ni modos de "pensamiento".
- No hay soporte multimodal (vision, audio) declarado.
- Cobertura multilingue: solo ingles segun el campo `language` de la model card.

## Casos de uso

- Reproduccion de resultados de investigacion: cargar `final.pt` con el repositorio del paper y ejecutar `eval.py` sobre el protocolo CORE completo para verificar la exactitud de 0,16990962 y el NLL de respuesta de 2,93537428 sobre las semillas 0, 1 y 2.
- Estudio de leyes de escalado: usar el punto d12 como referencia "vanilla" de la escalera de profundidad para comparar exponentes de escalado frente a variantes con crecimiento de modelo, recursion u operadores de frontera.
- Auditoria de checkpoints: dado que los pesos son identicos bit a bit al checkpoint del articulo y se incluye `SHA256SUMS`, sirve como referencia verificable de integridad para replicar experimentos en otros entornos.
- Analisis de modelos base de escala reducida: con 494 millones de parametros y contexto de 2.048 tokens, es adecuado para experimentos academicos sobre comportamiento linguistico en ingles sin coste elevado de computo.
- Pruebas de infraestructura y pipelines de evaluacion: el checkpoint es ligero (2,0 GB) y permite validar flujos de evaluacion con FlashAttention-3 y bfloat16 en H100 antes de escalar a modelos mayores.
- Investigacion sobre tokenizacion GPT-2 con vocabulario ampliado de 50.257 a 50.304 filas: el checkpoint documenta explicitamente este padding, util para estudiar efectos de alineacion de vocabulario y matrices de embedding.
- Docencia y practicas de ingenieria de modelos: al no ser un artefacto `AutoModel`, obliga a trabajar con el codigo fuente del paper y resulta ilustrativo para entender checkpoints no estandarizados.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son los siguientes. No hay resultados de MMLU, HumanEval, GSM8K ni de otras suites convencionales.

| Metrica | Valor |
|---|---|
| NLL de validacion de pretraining | 2,80350093 nats/token |
| CORE accuracy (media sobre semillas 0, 1, 2) | 0,16990962 |
| CORE answer NLL (media sobre semillas 0, 1, 2) | 2,93537428 nats/token |
| Ejemplos evaluados en CORE | 91.037, repartidos en 22 tareas |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 1,84 GiB (494.272.512 parametros x 4 bytes); con cache KV y activaciones para 2.048 tokens en lote pequeno, el consumo se situa en el entorno de 2,5 a 4 GB en FP32. Con autocast en bfloat16 el coste de calculo baja, aunque los pesos se cargan en FP32 salvo conversion explicita.
- GPU recomendadas: el paper reporta el uso de H100 con FlashAttention-3 y autocast en bfloat16; el modelo es lo bastante pequeno para ejecutarse tambien en A100 o en GPUs de consumo.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4070/4080 o una RTX 4090 pueden alojar el modelo en FP32 con margen para lotes moderados. En GPUs con 8 GB es posible con lote pequeno en FP32, y en 6 GB requeriria conversion de precision.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint no es un artefacto de Transformers y no se distribuyen pesos en GGUF o safetensors. El unico camino documentado es el repositorio del paper con `eval.py`.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos corresponden a especificaciones publicas ampliamente conocidas de cada proyecto, no a la informacion proporcionada en esta busqueda. No existe una evaluacion comun que permita comparar rendimiento de forma directa con loop-fwe-vanilla-d12.

| Modelo | Parametros | Contexto | Licencia | Formato | Comparable en rendimiento |
|---|---|---|---|---|---|
| loop-fwe-vanilla-d12 | 494.272.512 | 2.048 | no disponible | `.pt` FP32, codigo propio | no disponible |
| Pythia-410M | 410 millones | 2.048 | Apache 2.0 | safetensors, `AutoModel` | no disponible (sin evaluacion comun) |
| SmolLM2-360M | 362 millones | 8.192 | Apache 2.0 | safetensors, `AutoModel`, GGUF | no disponible (sin evaluacion comun) |
| GPT-2 (large, 774M) | 774 millones | 1.024 | MIT modificada | safetensors, `AutoModel`, GGUF | no disponible (sin evaluacion comun) |

Las diferencias relevantes son de disponibilidad y de integracion: las alternativas citadas cuentan con licencia explicita, integracion directa en el ecosistema Transformers y, en algunos casos, cuantizaciones GGUF, mientras que loop-fwe-vanilla-d12 carece de licencia declarada, exige el codigo del paper y solo se ofrece en FP32.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir permiso de uso comercial ni de redistribucion. Es un riesgo legal directo para cualquier despliegue en produccion.
- Sesgos conocidos: no hay informacion proporcionada sobre evaluaciones de sesgo, toxicidad o equidad. El entrenamiento sobre FineWeb-Edu no exime de sesgos propios de datos web filtrados.
- Riesgo de alucinacion: es un modelo base de aproximadamente 494 millones de parametros sin alineacion; la generacion de afirmaciones factualmente incorrectas es esperable y no hay mitigaciones documentadas.
- Rendimiento absoluto bajo: la exactitud CORE es de 0,16990962 (en torno al 17 %) sobre 22 tareas, lo que lo inhabilita para tareas de razonamiento o conocimiento que requieran precision.
- Limitacion de idioma: solo ingles segun el campo `language`; no hay soporte declarado de castellano ni de otros idiomas.
- Limitacion de contexto: 2.048 tokens, muy por debajo de los modelos actuales de gama similar, lo que restringe casos de uso con documentos largos o conversaciones extensas.
- Integracion restringida: no es un artefacto `AutoModel`, no incluye safetensors ni GGUF y no funciona con vLLM, llama.cpp, Ollama o TGI sin trabajo de conversion adicional.
- Sin estado del optimizador: el checkpoint no permite reanudar el entrenamiento tal cual, solo evaluacion o fine-tuning desde los pesos.
- Ambiguedad de la coordenada de profundidad: d12 es la coordenada de la escalera de escalado y puede no coincidir con el numero de bloques Transformer ejecutados, lo que complica comparaciones ingenuas de profundidad con otros modelos.
- Metrica CORE no convencional: los valores publicados no son directamente comparables con MMLU, HumanEval o GSM8K, lo que dificulta situar el modelo frente a alternativas.
- Adopcion nula: el repositorio registra 0 descargas y 0 interacciones, de modo que no existe validacion independiente por parte de la comunidad.
- Fechas de publicacion del repositorio (2026-09-16) posteriores a la informacion de contexto disponible en la busqueda; conviene verificar la vigencia y el estado del repositorio antes de utilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-fwe-vanilla-d12
- Repositorio del paper (codigo de evaluacion y entrenamiento): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Articulo de referencia citado en la model card: *How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents* (enlace no disponible en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los enlaces recuperados correspondian a paginas de ayuda de YouTube, Gmail y Zhihu, sin relacion con el contenido de esta ficha.
