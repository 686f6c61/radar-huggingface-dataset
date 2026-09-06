# join3r/stem-gte-memory

## Resumen

El modelo `join3r/stem-gte-memory` es un reranker de tipo cross-encoder, desarrollado por `join3r` como componente de recuperación de memoria personal para el asistente Stem. Se trata de un fine-tuning del modelo base `Alibaba-NLP/gte-multilingual-reranker-base`, ajustado específicamente para puntuar la relevancia de hechos almacenados en memoria respecto al mensaje de un usuario. El modelo también se utiliza para la selección de habilidades (skills) mediante un umbral calibrado por separado.

La versión publicada es la `epoch2 q8 ONNX`, con identificador `gte-memory-20260905-epoch2`. Los cinco archivos de inferencia suman 358.119.455 bytes (341,53 MiB), y el grafo cuantizado pesa 341.032.790 bytes. El modelo está cuantizado con Q8 dinámico y exportado a ONNX, lo que lo hace apto para ejecución local en Node.js mediante Transformers.js. Según el benchmark interno del autor, este checkpoint mejora el recall del 43,1% al 64,7% y reduce las selecciones irrelevantes de 166 a 87 en comparación con el baseline Qwen3 Reranker 0.6B, con una latencia mediana de 320 ms frente a 3.116 ms (aproximadamente 9,74 veces más rápido). Se trata de una liberación experimental y opt-in, no de un modelo generativo ni de un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (cross-encoder de reranking) basado en Alibaba-NLP/gte-multilingual-reranker-base |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (limite de inferencia establecido en Stem) |
| Tipos de cuantizacion | Q8: cuantizacion dinamica QInt8, per-channel, reduced range, symmetric, solo MatMul de matrices constantes |
| Idiomas soportados | Checo, eslovaco, aleman e ingles (idiomas de entrenamiento validados) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_quantized.onnx) con tokenizer JSON; no incluye pesos PyTorch |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de reranking basado en el `gte-multilingual-reranker-base` de Alibaba-NLP. Recibe un par `(consulta, documento)` y produce un logit crudo que indica la relevancia del documento respecto a la consulta. La implementacion upstream conserva el `model_type: new`, por lo que la inferencia requiere usar `PreTrainedModel` de Transformers.js 3.8.1 y no el cargador automatico de sequence classification. El repositorio contiene unicamente pesos ONNX cuantizados, no un checkpoint de PyTorch.

El fine-tuning se realizo sobre 23.684 pares binarios generados a partir de 88 perfiles ficticios de entrenamiento, de los cuales 797 son pares relevantes. La distribucion de pares por idioma de consulta es: checo 5.905, eslovaco 6.051, aleman 5.963 e ingles 5.765. Se excluyeron ejemplos borderline. Durante el entrenamiento se congelaron los embeddings de tokens y se entrenaron el encoder y la cabeza de clasificacion, con un total de 113.920.513 parametros entrenables. Se uso AdamW con learning rate 1e-5, weight decay 0.01, batch size 16, 10% de warmup lineal, gradient clipping 1.0 y BCE con positive weight 3. La longitud maxima de los pares tokenizados fue de 94 tokens, sin truncamiento. Se planificaron tres epocas; la epoca 2 fue seleccionada tras exportar a q8 y evaluar con datos de desarrollo. El criterio de seleccion exigia cumplir el recall del baseline Qwen por idioma y minimizar `3 * falsos negativos + falsos positivos`.

La exportacion a ONNX se realizo con PyTorch 2.8.0 y ONNX Runtime 1.22.1. La cuantizacion dinamica de pesos usa QInt8, per-channel, reduced range, symmetric weights y cuantiza solo las matrices constantes de los MatMul. El repositorio incluye un `stem-model.json` con la identidad inmutable del modelo, revisiones upstream, hashes SHA-256 por archivo y los umbrales de Stem.

## Capacidades

- Reranking de hechos de memoria personal: puntua la relevancia de un hecho almacenado respecto al mensaje actual del usuario.
- Seleccion de habilidades (skill selection): utiliza el mismo modelo con un umbral calibrado por separado para elegir la skill mas adecuada.
- Soporte multilingue en checo, eslovaco, aleman e ingles, con hechos o descripciones almacenados en ingles.
- Inferencia en ONNX cuantizado, pensada para ejecucion local en Node.js mediante Transformers.js 3.8.1.
- Integracion con un pipeline de recuperacion de memoria: usa hasta 24 candidatos de un shortlist generado por Qwen3 Embedding 0.6B y selecciona como maximo 16 hechos relevantes.
- Capacidad de manejar contexto conversacional: formatea la consulta incluyendo hasta dos mensajes previos del usuario, recortados a 400 puntos de codigo Unicode cada uno.
- No es un modelo generativo: no genera texto, no soporta tool calling, vision ni audio. Su funcion es exclusivamente de ranking.

## Casos de uso

- Recuperacion de memoria personal en asistentes: el modelo rerankea los hechos almacenados en memoria segun el mensaje del usuario, mejorando la precision de la recuperacion. Es adecuado porque esta especificamente fine-tuneado para este proposito con datos multilingues.
- Seleccion de habilidades en agentes: puntua descripciones de skills para elegir la mas relevante. Usa un umbral calibrado de -3,974 y opera con el mensaje actual del usuario.
- Asistente multilingue checo/eslovaco/aleman/ingles: gestiona consultas de usuario en varios idiomas con hechos en ingles. Adecuado porque el fine-tuning cubre estos cuatro idiomas y el modelo base es multilingue.
- Filtrado de hechos sensibles: aplica un margen adicional de +2 al umbral de memoria para reducir falsos positivos en la recuperacion de informacion delicada.
- Optimizacion de latencia en sistemas locales: la cuantizacion Q8 y el formato ONNX permiten ejecucion en Node.js con 320 ms de mediana, 9,74 veces mas rapido que el baseline Qwen3 Reranker 0.6B. Adecuado para asistentes en tiempo real en hardware modesto.
- Re-ranking en pipelines RAG de memoria a largo plazo: puede integrarse como componente de reranking tras una busqueda inicial por embeddings, seleccionando los fragmentos de memoria mas relevantes antes de generar una respuesta.
- Investigacion en memoria de agentes: sirve como referencia experimental para evaluar tecnicas de fine-tuning de rerankers en dominios de memoria personal.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es generativo. Los datos disponibles provienen del benchmark interno del autor, de alcance limitado y no comparables con rankings universales.

| Benchmark | Baseline (Qwen3 Reranker 0.6B) | stem-gte-memory (epoch2 q8) |
|---|---|---|
| Recall en benchmark sintetico de memoria | 43,1% | 64,7% |
| Selecciones irrelevantes | 166 | 87 |
| Latencia mediana (pipeline local) | 3.116 ms | 320 ms |
| Aceleracion relativa | 1x | 9,74x |

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El archivo ONNX cuantizado pesa 341,53 MiB, lo que sugiere que la inferencia puede ejecutarse en CPU o GPUs de consumo, pero no hay cifras oficiales.
- GPU recomendadas: no especificadas.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano del modelo, pero no hay confirmacion oficial.
- Opciones de despliegue: Transformers.js 3.8.1 en Node.js, segun el ejemplo `example.mjs` incluido en el repositorio. Tambien puede ejecutarse con ONNX Runtime. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la latencia mediana medida en el benchmark local es de 320 ms. No se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| join3r/stem-gte-memory | 342 MB (ONNX Q8) | 8192 tokens (limite de Stem) | Checo, eslovaco, aleman, ingles | Apache-2.0 | Fine-tuning especifico para memoria personal; recall 64,7% en benchmark propio |
| Alibaba-NLP/gte-multilingual-reranker-base | no disponible | no disponible | Multilingue (no validado) | Apache-2.0 | Modelo base sin fine-tuning especifico |
| Qwen3 Reranker 0.6B | no disponible | no disponible | no disponible | no disponible | Baseline usado en el benchmark del autor; recall 43,1% en el mismo benchmark |

## Limitaciones y advertencias

- Modelo experimental y opt-in; la publicacion de los archivos no habilita la descarga automatica en versiones existentes de Stem.
- Solo contiene pesos ONNX; no hay checkpoint de PyTorch ni safetensors. Requiere Transformers.js 3.8.1 `PreTrainedModel`; el cargador automatico de sequence classification no funciona con este export.
- Limite de 8192 tokens por par; no se admite truncamiento silencioso. La calidad en contextos largos no se ha validado.
- El logit crudo no debe interpretarse como probabilidad ni aplicarse sigmoid. Mayor valor significa mayor relevancia, sin conversion adicional.
- Los umbrales documentados (memoria -1,637; skills -3,974; sensibles +2) son especificos de este grafo, tokenizer y pipeline. No son intercambiables ni universales.
- Entrenado con perfiles ficticios; puede heredar sesgos del modelo base. No se han publicado evaluaciones de sesgo.
- No se han publicado benchmarks estandar de LLM porque no es un modelo generativo. Los resultados de benchmark son internos y no constituyen garantias de rendimiento universal.
- La cobertura multilingue mas amplia del modelo base no ha sido validada por este fine-tuning; solo se han evaluado checo, eslovaco, aleman e ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/join3r/stem-gte-memory
- Repositorio del proyecto Stem: https://github.com/join3r/stem/tree/main
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-multilingual-reranker-base
- Implementacion upstream: https://huggingface.co/Alibaba-NLP/new-impl
