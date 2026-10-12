# cooler8/yejin-korean-8b-v3-dpo

## Resumen

Yejin Korean 8B v3 DPO v4 es un modelo de lenguaje causal bilingue (coreano e ingles) publicado por el usuario cooler8 en HuggingFace. Se trata de la fase final de alineacion (Fase 4) de la familia Yejin: parte de una base propia sobre la que se completo un SFT de 1,04 millones de ejemplos y, sobre ese punto de partida, se aplico un DPO completo con 366.049 pares de preferencia. El objetivo declarado es producir respuestas mas utiles y seguras para conversacion en coreano, incorporando senales de preferencia de usuarios (AI Hub) y de razonamiento matematico (Orca Math Ko).

El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con un pipeline de text-generation. La model card lo presenta como un modelo de 8B (7,24B parametros), pero los metadatos reales de safetensors del repositorio declaran 905.217.536 parametros (aproximadamente 0,9B). Esta discrepancia, junto con un tamano de repositorio de 30,0 GB, es la principal advertencia tecnica a la hora de evaluarlo.

Su relevancia actual es limitada pero concreta: es un ejemplo documentado de un pipeline completo SFT más DPO con hiperparametros y metricas de entrenamiento publicadas, util para quienes estudian alineacion por preferencias en coreano, aunque carece de benchmarks de evaluacion independientes y de validacion externa (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only); etiquetado como qwen3 en las tags, pero la model card declara "arquitectura propia". No se detalla mas. |
| Parametros totales | 905.217.536 segun metadatos de safetensors; la model card declara 7,24B. Existe discrepancia sin resolver. |
| Parametros activos | no aplica (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo decoder-only orientado a generacion de texto y conversacion. La informacion disponible no especifica el numero de capas, dimension oculta, atencion utilizada ni longitud de contexto. La unica referencia arquitectonica es la tag `qwen3`, que sugiere una posible base Qwen3, en contradiccion con la model card, que afirma que la base es de arquitectura propia. Esta ambiguedad no se resuelve con los datos proporcionados.

El entrenamiento se organizo en fases. Primero, un SFT sobre 1,04 millones de ejemplos que dio lugar al modelo base `cooler8/yejin-korean-8b-v3-sft-v4`. Despues, una alineacion DPO con 366.049 pares de preferencia compuestos por 100.000 ejemplos de preferencias de usuarios de AI Hub, Ko-UltraFeedback, y variantes coreanas de Orca DPO y Orca Math DPO. El DPO se ejecuto con Full FSDP (full sharding) sobre 8 nodos NVIDIA H200 de 143 GB en KT Cloud AI Nexus. Se reportan 2.853 pasos, 1 epoca y un tiempo total de 10 horas y 2 minutos. Las metricas finales de entrenamiento son: DPO Loss 0,2307, Reward Accuracy 92,02%, Reward Margin 5,678 y Mean Token Accuracy 72,75%. La configuracion de generacion recomendada es decodificacion greedy (`do_sample=False`, `repetition_penalty=1.05`) con tokens de parada `<|end|>` y `</s>` (IDs 7 y 2).

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Alineacion por preferencias humanas (DPO), orientada a respuestas mas utiles y seguras que el modelo SFT previo.
- Cobertura de razonamiento matematico derivada de la inclusion de Orca Math Ko en el dataset de alineacion (no se aportan metricas que la cuantifiquen).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a coreano e ingles segun las etiquetas; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistente conversacional en coreano: el modelo esta alineado especificamente con preferencias de usuarios coreanos, por lo que es adecuado para chat multi-turno en ese idioma con respuestas mas naturales y seguras.
- Atencion al cliente automatizada en coreano: puede gestionar dialogos de soporte en coreano, aunque se desconoce la ventana de contexto disponible, lo que obliga a disenar la aplicacion con memoria externa.
- Generacion de contenido editorial en coreano: redaccion de borradores, resumenes y textos divulgativos donde se prioriza el registro idiomatico nativo.
- Apoyo educativo y tutoria: la presencia de datos tipo Orca Math Ko sugiere utilidad para explicaciones y ejercicios de matematicas en coreano, siempre con supervision humana.
- Investigacion sobre alineacion DPO: sirve como caso de estudio reproducible, con hiperparametros y metricas de DPO publicadas, para analizar el efecto del DPO sobre un modelo SFT en un idioma de recursos medios.
- Traduccion y adaptacion ko-en asistida: dado el soporte bilingue declarado, puede emplearse como base para tareas de parafraseo o pre-edicion entre coreano e ingles, aunque no se declara entrenamiento especifico de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de evaluacion estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos son metricas internas del entrenamiento DPO:

| Metrica de entrenamiento | Valor |
|---|---|
| DPO Loss final | 0,2307 |
| Reward Accuracy | 92,02% |
| Reward Margin | 5,678 |
| Mean Token Accuracy | 72,75% |
| Pasos | 2.853 |
| Epocas | 1 |
| Tiempo de entrenamiento | 10 h 2 min |
| Hardware de entrenamiento | 8 x NVIDIA H200 (143 GB), FSDP full sharding |

## Requisitos de hardware

Los requisitos dependen de la ambiguedad en el recuento de parametros. Se ofrecen ambos escenarios:

- Si el modelo tiene realmente 905 millones de parametros: pesos en fp16 de aproximadamente 1,8 GB, fp32 unos 3,6 GB, int8 unos 0,9 GB e int4 unos 0,5 GB. Cabe en cualquier GPU consumer moderna (RTX 3060 12 GB o superior) e incluso en CPU con llama.cpp.
- Si el modelo tiene 7,24B parametros (como declara la model card): pesos en fp16 de aproximadamente 14,5 GB, int8 unos 7,3 GB e int4 unos 3,7 GB. En fp16 requeriria GPU de 16-24 GB (RTX 4090, A10G, L40S) o cuantizacion para GPUs de 8-12 GB.
- GPU recomendadas para despliegue: no hay cifras oficiales; en el escenario de 7,24B serian adecuadas A100, H100, L40S o RTX 4090. El entrenamiento se realizo en 8 x H200, dato que corresponde a entrenamiento, no a inferencia.
- Opciones de despliegue: el repositorio solo ofrece safetensors, por lo que es directamente compatible con Transformers, vLLM y TGI. Para llama.cpp u Ollama seria necesaria una conversion a GGUF, que el autor no publica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparacion directa es dificil por la discrepancia en el recuento de parametros y la ausencia de contexto y benchmarks publicados. Como referencia orientativa de categoria (modelos conversacionales bilingues de tamano medio):

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cooler8/yejin-korean-8b-v3-dpo | 905M (safetensors) / 7,24B (declarado) | no disponible | no disponible | Apache 2.0 | safetensors |
| Qwen3-8B (posible base segun tags) | 8B (nominal, sin confirmar en la informacion) | no disponible | no disponible | no disponible en la informacion | no disponible en la informacion |
| Otros modelos coreanos de 7-8B (por ejemplo, familias tipo EEVE o Llama-3-Korean) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de alternativas comparables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia critica en el recuento de parametros: la model card declara 7,24B mientras que los metadatos de safetensors indican 905.217.536. Verificar antes de cualquier despliegue en produccion.
- El tamano del repositorio (30,0 GB) es inconsistente con un modelo de 0,9B, lo que refuerza la necesidad de comprobar los pesos reales.
- Contradiccion arquitectonica: la tag `qwen3` y la afirmacion de "arquitectura propia" en la model card no son compatibles.
- Sin benchmarks de evaluacion independientes: no hay resultados de MMLU, GSM8K, HumanEval ni metricas de calidad percibida por terceros.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado por el autor.
- Sesgos conocidos: no documentados por el autor.
- Limitaciones de contexto: la longitud de contexto no se especifica, lo que impide garantizar conversaciones largas sin memoria externa.
- Limitaciones de idioma: cobertura declarada de coreano e ingles; el rendimiento en otros idiomas es incierto.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el modelo no incluye garantias ni cartas de limitaciones.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.
- Los datos de entrenamiento son declarados por el autor y no auditables de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-dpo
- Modelo base (SFT): https://huggingface.co/cooler8/yejin-korean-8b-v3-sft-v4
- Otros enlaces relevantes (paper, blog, repositorio, demo): no disponible
