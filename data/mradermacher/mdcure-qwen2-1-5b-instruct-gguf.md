# mradermacher/MDCure-Qwen2-1.5B-Instruct-GGUF

## Resumen

MDCure-Qwen2-1.5B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo yale-nlp/MDCure-Qwen2-1.5B-Instruct, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 1.543.714.304 parametros (aproximadamente 1.500 millones) construido sobre la arquitectura Qwen2 y afinado especificamente para tareas de curacion de contenido multi-documento y contexto largo. El modelo base fue desarrollado por el grupo Yale NLP y entrenado sobre el dataset yale-nlp/MDCure-72k.

La relevancia de esta publicacion radica en que ofrece el modelo original en una bateria de cuantizaciones estaticas GGUF (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware de consumo sin necesidad de GPUs de datacenter. El modelo esta disenado para generar datos de entrenamiento de alta calidad para ajuste fino de modelos mas grandes, un caso de uso cada vez mas demandado en la comunidad open source.

La licencia es Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de generacion de datos sinteticos. El modelo solo soporta ingles segun la model card y esta etiquetado con las capacidades multi-document y long-context.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), segun el modelo base |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (etiquetado como long-context) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar. El modelo original fue afinado por Yale NLP sobre el dataset MDCure-72k, un conjunto de datos orientado a la curacion de contenido multi-documento. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, mas alla de su nombre (72k ejemplos) y su orientacion a tareas de contexto largo y multiples documentos.

No se dispone de informacion sobre si se aplicaron tecnicas de RLHF o DPO en el ajuste. La publicacion de mradermacher es exclusivamente una conversion a GGUF mediante cuantizacion estatica; no introduce cambios en los pesos mas alla de la cuantizacion. No se han publicado quants ponderados o con imatrix para este modelo segun la model card.

## Capacidades

- Generacion de texto en ingles con capacidad de instrucciones (Instruct).
- Procesamiento de multiples documentos en una misma ventana de contexto (multi-document).
- Manejo de contexto largo (etiqueta long-context), orientado a tareas de sintesis y curacion de informacion extensa.
- Generacion de datos de entrenamiento y curacion de contenido, proposito principal del modelo base.
- Conversacional (etiqueta conversational en Hugging Face).
- Compatible con endpoints (etiqueta endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Generacion de datos de entrenamiento sinteticos: el modelo puede producir pares instruccion-respuesta de calidad a partir de corpus multi-documento, aprovechando su ajuste sobre MDCure-72k para alimentar pipelines de fine-tuning de modelos mayores.
- Curacion de contenido multi-documento: agregar y sintetizar informacion proveniente de varios documentos en una unica respuesta coherente, util para resumenes de expedientes o informes.
- Resumen de documentacion tecnica extensa: procesar manuales, especificaciones o papers y generar resumenes estructurados en ingles.
- Extraccion de informacion en pipelines de investigacion: identificar y consolidar datos relevantes de multiples fuentes dentro de un flujo automatizado de procesamiento documental.
- Prototipado rapido en local: gracias a sus cuantizaciones de 0,8 a 1,7 GB, permite experimentar con un modelo de contexto largo en portatiles sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion: la disponibilidad de doce variantes GGUF permite medir el impacto de la cuantizacion en tareas de curacion multi-documento.
- Generacion de preguntas y respuestas sobre corpus: construir datasets de QA a partir de documentacion interna para entrenamiento o evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): entre 0,8 GB (Q2_K) y 3,2 GB (f16); anadir aproximadamente 0,5-1 GB adicionales para el contexto KV cache segun la longitud de contexto utilizada.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4_K_M o Q5_K_M; una RTX 3060, RTX 4060 o superior permite ejecutar f16 con holgura.
- Cabe en GPU consumer: si, en practicamente todas las GPUs dedicadas modernas e incluso en iGPUs con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MDCure-Qwen2-1.5B-Instruct-GGUF | 1.543.714.304 | no disponible | apache-2.0 | GGUF | Especializado en curacion multi-documento |
| Qwen2-1.5B-Instruct | ~1.500 millones | 32.768 tokens (modelo original Qwen2) | apache-2.0 | safetensors, GGUF | Modelo generalista base del que deriva |
| MDCure-Llama-3.1-8B-Instruct | no disponible en la informacion | no disponible | no disponible | no disponible | Variante mayor de la familia MDCure sobre Llama 3.1 |

La comparativa con Qwen2-1.5B-Instruct se basa en que MDCure-Qwen2-1.5B-Instruct es un fine-tune de este ultimo; la longitud de contexto del fine-tune no se especifica en la informacion disponible. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Modelo de 1.500 millones de parametros: capacidad de razonamiento limitada en comparacion con modelos de mayor tamano, especialmente en tareas complejas de matematicas o codigo.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, agravado en tareas de sintesis multi-documento donde puede mezclar informacion de fuentes distintas.
- La longitud de contexto efectiva no esta documentada en la informacion proporcionada; el etiquetado long-context no especifica un limite concreto.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad en tareas que requieren atencion precisa a documentos largos.
- No se han publicado quants ponderados o con imatrix, lo que limita las opciones de calidad para tamanos intermedios.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo esta pensado para generacion de datos; conviene validar la calidad de las salidas antes de usarlas en produccion.
- No se dispone de informacion sobre sesgos especificos del fine-tune.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/MDCure-Qwen2-1.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/yale-nlp/MDCure-Qwen2-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/yale-nlp/MDCure-72k
- Pagina de conveniencia del cuantizador: https://hf.tst.eu/model#MDCure-Qwen2-1.5B-Instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
