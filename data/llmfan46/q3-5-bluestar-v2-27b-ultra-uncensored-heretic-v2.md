# llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2

## Resumen

Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2 es un ajuste fino derivado de zerofata/Q3.5-BlueStar-v2-27B, un modelo de 27.356.728.560 parametros (unos 27,36 mil millones) construido sobre la arquitectura `qwen3_5`. El autor, llmfan46, lo publica como una version "decensored" o "abliterated": se ha aplicado la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA) para reducir la tasa de rechazos del modelo original, que segun la model card pasa de 99/100 a 5/100 en un conjunto de prueba de 100 prompts, con una divergencia KL de 0.0671 respecto al modelo base.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de "abliteration" moderno con parametros de ablacion publicados y una evaluacion de preservacion de capacidades mediante PIQA. Por otro lado, advierte de que se trata de un modelo sin pipeline declarado, sin idiomas declarados y con una model card centrada en la promocion del autor y en el desbloqueo de contenido, no en especificaciones tecnicas completas. El repositorio ocupa 54,7 GB en safetensors y existe una version GGUF separada.

El modelo esta pensado para generacion de texto y roleplay, con un sesgo claro hacia contenido sin filtros. No hay informacion publicada sobre contexto, composicion del dataset de entrenamiento ni resultados de benchmarks generales mas alla de PIQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5` (transformer, segun el tag del repositorio) |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en el repo principal; GGUF en repositorio separado (llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2-GGUF); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado) |
| Tamano del repositorio | 54,7 GB |
| Modelo base | zerofata/Q3.5-BlueStar-v2-27B |
| Metodo de decensurado | Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA) |

## Arquitectura y entrenamiento

El modelo es un ajuste del base zerofata/Q3.5-BlueStar-v2-27B, etiquetado con la arquitectura `qwen3_5`. No se publican detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original; la model card solo lista los datasets empleados en el ajuste: zerofata/Instruct-Anime, zerofata/Gemini-3.1-Pro-SmallWiki, zerofata/Gemini-3.1-Pro-GLM5-Characters y zerofata/Roleplay-Anime-Characters. El nombre y la composicion sugieren un enfasis en roleplay e instrucciones de personajes de anime, aunque no se aportan proporciones ni volumen.

La innovacion tecnica documentada es el proceso de abliteration. Se aplico Heretic v1.2.0 con el metodo ARA sobre las capas 9 a 33, con los siguientes parametros: `preserve_good_behavior_weight` 0.5425, `steer_bad_behavior_weight` 0.0002, `overcorrect_relative_weight` 1.1475 y `neighbor_count` 15. Los componentes objetivo fueron `attn.out_proj` y `attn.o_proj`. El resultado declarado es una reduccion de rechazos de 99/100 a 5/100 con una KL de 0.0671 frente al original. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto y respuesta a instrucciones, heredadas del modelo base Q3.5-BlueStar-v2-27B.
- Roleplay y encarnacion de personajes, reforzado por los datasets de personajes de anime y roleplay listados en la model card.
- Reduccion drastica de rechazos y negativas: 5/100 en el conjunto de prueba del autor frente a 99/100 del original.
- Razonamiento fisico basico medido con PIQA (acc_norm 0.8237, identico al original).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades de vision o audio: no disponible; no se declaran.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta ajustado sobre datasets de personajes de anime y roleplay, y la ablacion reduce las negativas a mantener el personaje o a desarrollar escenas, lo que encaja en aplicaciones de ficcion interactiva y chat de personajes.
- Generacion de ficcion sin filtros editoriales: util para escritura creativa que requiera tono adulto, violencia narrativa o temas sensibles, donde un modelo alineado rechazaria la peticion; la tasa de rechazo declarada de 5/100 lo hace viable para este flujo.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio reproducible, con parametros de ablacion publicados (capas 9-33, pesos y componentes objetivo) y metrica de preservacion (PIQA y KL), para comparar tecnicas de decensurado.
- Evaluacion de robustez de filtros: permite medir como responden pipelines de moderacion y guardrails frente a un modelo con rechazos reducidos, y calibrar clasificadores de contenido en produccion.
- Prototipado de asistentes conversacionales de dominio acotado: con 27 B de parametros y licencia MIT, se puede desplegar en infraestructura propia para pruebas de concepto conversacionales sin depender de APIs externas.
- Base para ajustes finos adicionales: al ser MIT y estar disponible en safetensors y GGUF, se puede usar como punto de partida para LoRA o fine-tuning completo en tareas de escritura creativa o personajes.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de PIQA y las metricas de ablacion:

| Metrica | Este modelo | Modelo original (Q3.5-BlueStar-v2-27B) |
|---|---|---|
| PIQA acc | 0.8161 (±0.0090) | 0.8232 (±0.0089) |
| PIQA acc_norm | 0.8237 (±0.0089) | 0.8237 (±0.0089) |
| Rechazos (100 prompts) | 5/100 | 99/100 |
| KL divergence vs original | 0.0671 | 0 (por definicion) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 54,7 GB solo para pesos, mas KV cache y overhead; se recomienda al menos 64-80 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: unos 28-30 GB; encaja en una RTX 4090 de 24 GB solo con cuantizaciones de 4-5 bits o con offloading parcial.
- VRAM estimada en cuantizacion de 4 bits: unos 15-18 GB, viable en RTX 4090 (24 GB) y en GPUs consumer de gama alta con 16 GB o mas, con margen limitado para contexto largo.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o multiples GPUs con tensor parallelism.
- GPU consumer: RTX 4090, RTX 5090 y GPUs con 24 GB o mas para cuantizaciones de 4 bits; en 16 GB solo con cuantizaciones agresivas y contexto corto.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF del repositorio separado; vLLM y TGI para safetensors en BF16 si se dispone de hardware adecuado; transformers como via generica.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2 (este) | ~27,36 B | no disponible | MIT | Abliterated con Heretic/ARA; 5/100 rechazos; PIQA acc_norm 0.8237 |
| zerofata/Q3.5-BlueStar-v2-27B (base) | ~27,36 B | no disponible | no disponible en esta ficha | Modelo original alineado; 99/100 rechazos; PIQA acc_norm 0.8237 |
| Otros modelos abliterated de ~27 B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- Modelo explicitamente decensurado: la reduccion de rechazos a 5/100 implica que puede generar contenido sensible, adulto o potencialmente danino sin las salvaguardas del original; no es apto para aplicaciones orientadas a publico general sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de tasa de alucinacion; al ser un ajuste sobre datasets de roleplay y personajes, el riesgo en tareas factuales es alto.
- Perdida de capacidades: PIQA acc baja de 0.8232 a 0.8161, y la KL de 0.0671 indica una desviacion no trivial respecto al original; otras capacidades pueden degradarse aunque no se hayan medido.
- Idiomas no declarados: no se especifica que idiomas soporta; el rendimiento fuera del ingles no esta garantizado.
- Contexto no documentado: se desconoce la longitud de contexto real, lo que impide planificar casos de uso con ventanas largas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el contenido generado ni sobre el cumplimiento legal en jurisdicciones con restricciones sobre material adulto.
- Model card orientada a promocion: incluye llamadas a donaciones y avisos de limites de almacenamiento, sin secciones de uso responsable, sesgos o evaluacion de seguridad.
- Sin pipeline declarado ni datos de sesgo: no se puede evaluar el comportamiento en dominios sensibles (genero, raza, religion) a partir de la informacion disponible.
- Procedencia del modelo base incierta: no se documenta el entrenamiento original de zerofata/Q3.5-BlueStar-v2-27B, lo que limita la trazabilidad de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2
- Version GGUF: https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v2-GGUF
- Modelo base: https://huggingface.co/zerofata/Q3.5-BlueStar-v2-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
