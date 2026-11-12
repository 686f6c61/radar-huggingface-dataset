# mradermacher/Qwen3.5-2B-Distilled-GRPO-Uncensored-GGUF

## Resumen

Qwen3.5-2B-Distilled-GRPO-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo KARAGE-KUN/Qwen3.5-2B-Distilled-GRPO-Uncensored, realizada por el usuario mradermacher. Se trata de una destilacion afinada mediante GRPO (Group Relative Policy Optimization) sobre una base de la familia Qwen3.5, con la etiqueta "uncensored" que indica la ausencia de un alineamiento restrictivo orientado a rechazar peticiones. El modelo original tiene 1.881.825.088 parametros (aproximadamente 1,88 mil millones) y se distribuye bajo licencia Apache 2.0.

El interes de esta publicacion es eminentemente practico: ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K hasta f16, ademas de variantes IQ4_XS y un modulo multimodal mmproj), lo que permite ejecutarlo en hardware de consumo. Al estar etiquetado como "reasoning" y "distillation", esta pensado para tareas de razonamiento paso a paso en un tamano reducido, a costa de una capacidad general menor que modelos de mayor escala.

La relevancia actual reside en la combinacion de tres factores: bajo coste computacional de inferencia, disponibilidad de cuantizaciones listas para llama.cpp/Ollama y una licencia permisiva para uso comercial. No obstante, la informacion publicada por el autor es muy escasa: no hay model card detallada del modelo base, ni datos de entrenamiento, ni benchmarks, ni especificacion de la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3.5; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 19,1 GB (incluye todas las cuantizaciones) |
| Etiquetas | qwen3.5, grpo, distillation, reasoning, uncensored, lora-merged |
| Compatibilidad | endpoints_compatible, conversational |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo base. Las etiquetas indican que se trata de un modelo de la familia Qwen3.5, afinado mediante destilacion y GRPO. La etiqueta "lora-merged" sugiere que el ajuste se realizo mediante LoRA y posteriormente se fusionaron los adaptadores en los pesos base, lo que explica que el modelo resultante tenga el mismo numero de parametros que el original. GRPO es una variante de optimizacion por politica (sin modelo critico separado) empleada habitualmente para reforzar capacidades de razonamiento, por lo que es razonable inferir que el entrenamiento incluyo datos de tipo cadena de pensamiento, aunque no se especifica el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales.

La cuantizacion la ha realizado mradermacher con su pipeline habitual (convert_type: hf, quantize_version: 2), generando cuantizaciones estaticas. El autor indica explicitamente que no hay cuantizaciones ponderadas/imatrix disponibles por el momento. Se incluye un modulo mmproj (multi-modal supplement), lo que sugiere que el modelo base podria tener capacidad de procesamiento de imagenes, aunque no se detalla la naturaleza de dicha multimodalidad ni se confirma en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento paso a paso: las etiquetas "reasoning" y "grpo" apuntan a un entrenamiento orientado a tareas de razonamiento explicito.
- Destilacion: el modelo se presenta como destilado, lo que en la practica suele implicar la imitacion del comportamiento de un modelo mayor.
- Modo "uncensored": el autor no aplica un alineamiento restrictivo, por lo que el modelo no esta entrenado para rechazar peticiones por contenido sensible.
- Capacidad multimodal potencial: la presencia de ficheros mmproj sugiere soporte de entrada de imagenes, aunque no se documenta su alcance.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque la etiqueta "reasoning" lo hace plausible.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con cuantizaciones Q4_K_M de 1,4 GB, el modelo puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que permite iterar sobre prompts y flujos conversacionales sin coste de API.
- Razonamiento ligero en entornos con recursos limitados: su entrenamiento con GRPO y su tamano de 1,88 B lo hacen adecuado para tareas de clasificacion con justificacion, extraccion de conclusiones a partir de texto corto o resolucion de problemas aritmeticos sencillos en dispositivos edge.
- Generacion de texto sin filtros para investigacion: al estar etiquetado como "uncensored", es util para estudiar el comportamiento de modelos sin alineamiento restrictivo, analisis de sesgos o evaluacion de robustez frente a prompts adversarios en entornos controlados.
- Fine-tuning posterior como base pequena: al tener licencia Apache 2.0 y un tamano manejable, sirve como punto de partida para ajustes LoRA especificos de dominio en una sola GPU de consumo.
- Despliegue en pipelines de procesamiento por lotes: la version Q8_0 (2,1 GB) permite procesar grandes volumenes de texto en CPU con un throughput aceptable para tareas de etiquetado, resumen o reformulacion.
- Experimentacion con multimodalidad: los ficheros mmproj permiten probar entrada de imagenes en llama.cpp, aunque la documentacion sobre el alcance real de esta capacidad es inexistente y requiere validacion empirica.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes de cuantizacion, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad (perplejidad) entre Q2_K y f16 en un modelo de 1,88 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni en la model card del modelo cuantizado ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto): aproximadamente 1,5-2,5 GB en Q4_K_M, 2,3-3,3 GB en Q8_0 y 4,5-6 GB en f16, dependiendo de la longitud de contexto efectiva.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4-Q8; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer de los ultimos ocho anos, e incluso en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput estimados: no disponibles. En un modelo de 1,88 B en Q4_K_M sobre CPU moderna se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-Distilled-GRPO-Uncensored (este) | 1,88 B | no disponible | Apache 2.0 | GGUF (12 cuants) | Destilado + GRPO, uncensored, solo ingles |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alineado, multilingue, sin modo uncensored |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens (segun Meta) | Llama 3.2 Community License | safetensors, GGUF | Alineado, multilingue, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens (segun HuggingFace) | Apache 2.0 | safetensors, GGUF | Alineado, entrenado en ingles, sin uncensored |

La comparativa se limita a parametros, contexto, licencia y formato porque no hay datos de rendimiento publicados para este modelo. Las cifras de contexto de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar su calidad real frente a alternativas.
- Model card practicamente vacia: no se documentan datos de entrenamiento, composicion del dataset, hiperparametros de GRPO ni proceso de destilacion.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Solo ingles: la model card declara unicamente "en", por lo que el rendimiento en castellano u otros idiomas es impredecible.
- Riesgo de alucinacion elevado: un modelo destilado de 1,88 B sin benchmarks conocidos tiene alta probabilidad de generar afirmaciones incorrectas con aparente seguridad.
- Etiqueta "uncensored": implica ausencia de filtros de seguridad, lo que lo hace inadecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- Sesgos no evaluados: no se ha publicado ninguna evaluacion de sesgos, toxicidad o robustez.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo base y los datos de entrenamiento originales no estan documentados, por lo que la cadena de licencias no se puede verificar por completo.
- Cuantizaciones estaticas unicamente: el autor no ha generado variantes ponderadas/imatrix, que suelen ofrecer mejor calidad por bit en modelos pequenos.
- Fecha de creacion futura en los metadatos (2026-11-12): inconsistencia que conviene verificar antes de confiar en los metadatos del repositorio.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion por terceros.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/Qwen3.5-2B-Distilled-GRPO-Uncensored-GGUF
- Modelo base: https://huggingface.co/KARAGE-KUN/Qwen3.5-2B-Distilled-GRPO-Uncensored
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-2B-Distilled-GRPO-Uncensored-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
