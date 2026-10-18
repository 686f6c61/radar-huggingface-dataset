# CollectionStudio/switch-base-128

## Resumen

Switch-base-128 es un checkpoint de la familia Switch Transformers, una variante de T5 en la que las capas feed-forward densas se sustituyen por capas dispersas de mezcla de expertos (MoE) con 128 expertos por capa. Fue desarrollado por Google Research y presentado en el articulo "Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsistency" (arXiv:2101.03961). El checkpoint subido a HuggingFace bajo el identificador CollectionStudio/switch-base-128 es una copia del original google/switch-base-128, publicada por un tercero y sin descargas ni validacion posterior.

El modelo solo se ha preentrenado con el objetivo de span-corruption masking (MLM tipo T5) sobre el corpus C4 en ingles, por lo que no es un modelo listo para usar en tareas downstream: sirve como base para fine-tuning o como objeto de estudio de enrutamiento MoE. Su interes actual es doble: por un lado permite experimentar con arquitecturas MoE de forma reproducible con `transformers`; por otro, ilustra el compromiso entre memoria (todos los expertos deben residir en RAM/VRAM) y coste de computo por token (solo se activa un experto por capa y token).

Arquitectonicamente es un transformer encoder-decoder tipo T5-base con 12 capas en encoder y 12 en decoder, capas de atencion identicas a T5 y capas FFN reemplazadas por el modulo switch. El repositorio ocupa 29,9 GB, lo que es coherente con un modelo de aproximadamente 7.400 millones de parametros almacenados en fp32, aunque la model card no declara la cifra explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 con capas FFN sustituidas por MoE disperso (switch layer, 128 expertos por capa) |
| Parametros totales | No declarados en la model card; estimacion de ~7.400 millones a partir del tamano del repositorio (29,9 GB en fp32) |
| Parametros activos | No disponibles; el enrutamiento top-1 activa 1 experto de 128 por capa y token |
| Longitud de contexto | No disponible en la model card (la familia T5 se entrena con secuencias de 512 tokens) |
| Tipos de cuantizacion | fp32, fp16 (`torch_dtype=torch.float16`) e INT8 via bitsandbytes; no hay pesos GGUF publicados |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints PyTorch nativos de `transformers` (`SwitchTransformersForConditionalGeneration`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Switch Transformer: se parte del bloque transformer estandar y se reemplaza la subcapa feed-forward por una capa switch que contiene 128 expertos MLP. El router calcula una puntuacion por experto y enruta cada token al experto de mayor probabilidad (top-1), de modo que el coste de computo por token se mantiene constante independientemente del numero de expertos. Para evitar colapso del enrutamiento se emplea una perdida auxiliar de balanceo de carga, y el paper describe un factor de capacidad que limita cuantos tokens procesa cada experto por lote, descartando tokens (token dropping) cuando se supera.

El preentrenamiento usa el objetivo de span corruption de T5 sobre Colossal Clean Crawled Corpus (C4) en ingles, igual que los checkpoints T5 originales. La model card no detalla el numero exacto de tokens vistos, la composicion del dataset mas alla de C4, ni si hubo fases de ajuste con RLHF o DPO; no se mencionan tecnicas de decodificacion especulativa ni atencion lineal. El paper asociado reporta hasta 4x de speedup en preentrenamiento frente a T5-XXL y modelos de hasta 1,6 billones de parametros (Switch-C), pero esas cifras corresponden al trabajo de investigacion, no a una evaluacion publicada de este checkpoint concreto.

## Capacidades

- Relleno de spans enmascarados: genera texto sustituyendo los centinelas `<extra_id_N>` presentes en la entrada, tal como muestra el ejemplo de la model card.
- Reconstruccion denoising de texto: util para tareas de preentrenamiento tipo span corruption y para generar pares (entrada ruidosa, salida limpia).
- Base para fine-tuning supervisado en tareas de seq2seq en ingles: clasificacion de texto, resumen, traduccion dentro del par ingles-ingles, generacion condicionada.
- Estudio de enrutamiento MoE: permite analizar especializacion de expertos, balanceo de carga y efecto del factor de capacidad.
- No soporta tool calling ni function calling.
- No incorpora modo de razonamiento explicito (thinking mode), ni capacidades de agente multi-paso.
- No es multilingue: solo ingles segun la model card.
- No tiene capacidades de vision, audio ni multimodalidad.
- No sigue instrucciones: no es un modelo alineado ni ajustado con datos conversacionales.

## Casos de uso

- Fine-tuning para clasificacion o resumen en ingles: al ser un checkpoint seq2seq preentrenado, se puede ajustar con un dataset propio y obtener un modelo de tarea con un coste de inferencia por token similar al de un T5-base, aunque con mayor huella de memoria.
- Investigacion sobre mezcla de expertos: registro de las decisiones del router por capa y token para estudiar especializacion semantica, colapso de expertos y efecto de la perdida auxiliar de balanceo.
- Generacion de datos sinteticos de relleno (cloze): producir ejercicios de completar huecos o datasets de evaluacion de modelos de relleno de mascaras en ingles.
- Aumento de datos para pipelines de preentrenamiento: crear variantes ruidosas y reconstruidas de documentos para experimentos de denoising.
- Experimentos de coste de servicio MoE: comparar throughput y latencia reales frente a un T5-base denso, midiendo el efecto de mantener 128 expertos en memoria con solo un experto activo por token.
- Banco de pruebas de infraestructura de despliegue: validar particionado con `accelerate`/DeepSpeed, cuantizacion INT8 con bitsandbytes y estrategias de offload en GPUs de 24 GB.
- Adaptacion de dominio sobre corpus ingleses especializados (legal, biomedico, tecnico) partiendo de pesos preentrenados en C4, cuando se busca una alternativa a T5 con mas capacidad latente por capa.
- Docencia y reproduccion de resultados: escenario controlado para explicar enrutamiento top-1, token dropping y factor de capacidad con un checkpoint publico y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de evaluacion truncado y no aporta cifras de MMLU, HumanEval, GSM8K, SuperGLUE ni de las tareas del paper original para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 30 GB, coherente con el tamano del repositorio (29,9 GB). Requiere A100 40/80 GB, H100 o L40S 48 GB.
- VRAM estimada en fp16/bf16: aproximadamente 15 GB de pesos, mas activaciones y cache; cabe en una RTX 4090 o RTX 3090 de 24 GB, con margen limitado para lotes grandes.
- VRAM estimada en INT8 (bitsandbytes): alrededor de 7,5-8 GB de pesos; viable en RTX 4080, RTX 4060 Ti de 16 GB o GPUs de 12 GB con lotes pequenos.
- Advertencia MoE: aunque solo se active un experto por token, todos los expertos deben estar residentes en memoria; el ahorro de cuantizacion afecta al conjunto del modelo, no solo al camino activo.
- Despliegue: `transformers` con `SwitchTransformersForConditionalGeneration`, `accelerate` con `device_map="auto"` para reparto multi-GPU, bitsandbytes para INT8 y DeepSpeed para sharding. No hay soporte documentado en llama.cpp u Ollama al no existir pesos GGUF; el soporte en vLLM o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. Por diseno, el coste de FLOPs por token es comparable al de un T5-base, mientras que el coste de memoria corresponde a un modelo de varios miles de millones de parametros.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| switch-base-128 (este checkpoint) | ~7.400 M (estimado) | No disponible | Apache 2.0 | HuggingFace (copia de tercero) | 128 expertos, solo ingles, checkpoint MLM sin ajustar |
| google/switch-base-8 | No disponible en la informacion | No disponible | Apache 2.0 | HuggingFace (original de Google) | Misma arquitectura con 8 expertos por capa; menor huella de memoria |
| google-t5/t5-base | 220 M | 512 tokens | Apache 2.0 | HuggingFace | Baseline denso del que deriva la arquitectura; sin MoE |
| google/flan-t5-base | 250 M | 512 tokens | Apache 2.0 | HuggingFace | Variante ajustada con instrucciones; usable directamente en tareas |

La comparacion relevante es de regimen: switch-base-128 ofrece mucha mas capacidad latente por capa que t5-base, pero su checkpoint no esta ajustado y su huella de memoria es aproximadamente 30 veces mayor en fp32. Para uso productivo inmediato en ingles, flan-t5-base es la opcion directa; switch-base-128 tiene sentido cuando se busca fine-tuning propio o investigacion sobre MoE.

## Limitaciones y advertencias

- Checkpoint exclusivamente preentrenado con MLM: no es "ready-to-use" para tareas downstream, tal como advierte la propia model card.
- Solo ingles; no hay soporte multilingue declarado.
- Entrenado sobre C4, un corpus de web rastreada: es esperable sesgo de dominio, presencia de contenido toxico o estereotipado en los datos y sesgos sociales no mitigados. La seccion de sesgos y riesgos de la model card esta vacia ("More information needed").
- Riesgo de alucinacion: en generacion libre puede producir continuaciones fluidas pero factualmente incorrectas; al no estar ajustado con instrucciones, no dispone de salvaguardas conversacionales.
- Restricciones de licencia: los pesos son Apache 2.0, pero el corpus C4 tiene sus propias condiciones de uso que conviene revisar antes de un despliegue comercial.
- Huella de memoria desproporcionada respecto al coste de computo: 128 expertos deben residir en memoria aunque solo se use uno por token, lo que encarece el despliegue frente a modelos densos de tamano activo similar.
- Sin soporte de tool calling, agentes, vision ni audio; no apto para asistentes conversacionales sin fine-tuning adicional.
- Este repositorio concreto es una copia subida por el usuario CollectionStudio, con 0 descargas y 0 likes y fecha de creacion posterior a la publicacion original; no hay evidencia de validacion de los pesos. Para produccion se recomienda partir del checkpoint original google/switch-base-128.
- No se han publicado mediciones de latencia, throughput ni benchmarks para este checkpoint en la informacion disponible.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/CollectionStudio/switch-base-128
- Checkpoint original: https://huggingface.co/google/switch-base-128
- Paper de Switch Transformers: https://arxiv.org/pdf/2101.03961.pdf
- Paper de T5: https://arxiv.org/abs/1910.09700
- Repositorio de codigo (Google Research, t5x): https://github.com/google-research/t5x
- Checkpoints MoE originales: https://github.com/google-research/t5x/blob/main/docs/models.md#mixture-of-experts-moe-checkpoints
- Documentacion de `transformers` para Switch Transformers: https://huggingface.co/docs/transformers/model_doc/switch_transformers
- Notebook de fine-tuning MoE: https://colab.research.google.com/drive/1aGGVHZmtKmcNBbAwa9hbu58DDpIuB5O4?usp=sharing
- Resto de checkpoints Switch en HuggingFace: https://huggingface.co/models?search=switch
