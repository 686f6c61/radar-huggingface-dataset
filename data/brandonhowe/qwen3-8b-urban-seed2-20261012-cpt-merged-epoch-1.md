# BrandonHowe/Qwen3-8b-urban-seed2-20261012-CPT-merged-epoch-1

## Resumen

Qwen3-8b-urban-seed2-20261012-CPT-merged-epoch-1 es un modelo de generacion de texto obtenido mediante continued pretraining (CPT) a partir de Qwen/Qwen3-8B-Base, publicado por el usuario BrandonHowe en HuggingFace. Se trata de un experimento de ajuste de dominio sobre un corpus concreto, el dataset CompassioninMachineLearning/urban_12738_cleaned, del que se usaron 10.072 documentos distintos mas 2.000 exposiciones repetidas por epoch, con 200 documentos de validacion disjuntos.

El modelo corresponde al epoch 1.0 (step 378) del experimento identificado como "seed2" y se distribuye ya fusionado en BF16, sin adaptador LoRA, mediante la funcion nativa de Unsloth save_pretrained_merged con save_method="merged_16bit". Los pesos ocupan 16,4 GB repartidos en ocho shards de safetensors, con un total de 8.190.735.360 parametros confirmados a partir de los propios ficheros.

Su relevancia es fundamentalmente metodologica: forma parte de una coleccion de ejecuciones comparables sobre el mismo corpus urbano, con distintas semillas y modelos base (Qwen y OLMo), lo que permite estudiar reproducibilidad, olvido catastrofico y efecto del continued pretraining sobre un modelo denso de 8B. No es un modelo orientado a produccion ni a competicion en benchmarks; la propia model card advierte que el entrenamiento no demuestra una mejora en compasion y que ese aspecto debe evaluarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-8B declara 32.768 tokens nativos |
| Tipos de cuantizacion | BF16 (safetensors fusionados); no se incluyen GGUF ni cuantizaciones de menor precision en el repositorio |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3-8B declara soporte multilingue |
| Licencia | no disponible en el repositorio (el modelo base Qwen3-8B se publica bajo Apache 2.0) |
| Formato de pesos | safetensors, BF16, ocho shards, tamano de repo 16,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B-Base, un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectonicas introducidas por este experimento: el autor parte de los pesos del modelo base y aplica continued pretraining sobre un corpus de dominio, sin modificar la topologia de la red.

El entrenamiento consistio en continued pretraining supervisado por modelado de lenguaje sobre el dataset urban_12738_cleaned (revision ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d), con 10.072 documentos distintos y 2.000 exposiciones repetidas por epoch, alcanzando el epoch 1.0 en el step 378. El resultado se fusiono con Unsloth usando save_method="merged_16bit", con pesos validados en BF16 y empaquetados de forma sin perdida en ocho shards de safetensors. El repositorio incluye un fichero run_manifest.json con la revision del modelo base, los hashes de seleccion de documentos, los parametros de entrenamiento y la validacion de exportacion. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion posteriores.

## Capacidades

- Generacion de texto autoregresiva y conversacional, heredada de Qwen3-8B-Base.
- Modelado de lenguaje de dominio, con especializacion (no cuantificada) sobre el corpus urbano utilizado en el CPT.
- Compatibilidad con text-generation-inference y con endpoints compatibles (etiqueta endpoints_compatible), lo que permite servirlo en infraestructura tipo HuggingFace Inference Endpoints.
- Carga directa con transformers sin necesidad de adaptador LoRA, al estar los pesos fusionados.
- Soporte de tool calling, agentes y razonamiento multi-paso: no confirmado en la informacion disponible para este repositorio; dependera de las capacidades heredadas del modelo base.
- Capacidades multilingues: no confirmadas en la model card de este repositorio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre continued pretraining de dominio: el modelo sirve como punto de comparacion reproducible dentro de la coleccion de ejecuciones urbanas del mismo autor, con semillas y modelos base distintos y un manifiesto de ejecucion publico.
- Estudio de olvido catastrofico: al disponer del checkpoint del epoch 1.0 sobre un unico epoch y un corpus relativamente pequeno, permite medir la degradacion en tareas generales respecto a Qwen3-8B-Base.
- Base para fine-tuning posterior: al estar ya fusionado en BF16 y sin adaptador, es un punto de partida limpio para SFT o DPO adicionales sobre el mismo dominio urbano.
- Generacion de texto especializada en el dominio del dataset urban_12738_cleaned: util para tareas de redaccion o completado dentro de ese registro linguistico concreto, siempre que se valide la calidad de forma independiente.
- Despliegue en pipelines de inferencia compatibles con TGI o transformers: la etiqueta endpoints_compatible facilita integrarlo en servicios de generacion de texto ya existentes.
- Experimentacion con tecnicas de cuantizacion: al existir solo pesos BF16, es un candidato para generar GGUF o cuantizaciones de 8 y 4 bits y medir el impacto en la calidad del dominio ajustado.
- Reproducibilidad de experimentos: el run_manifest.json con hashes de seleccion de documentos y parametros permite replicar o auditar el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos ocupan aproximadamente 16,4 GB, por lo que se necesitan al menos unos 18-20 GB de VRAM contando cache KV para contextos cortos y lotes pequenos.
- GPU profesionales recomendadas: A100 de 40 GB u 80 GB, H100, L40S. En A100 40 GB cabe con margen para contexto amplio.
- GPU de consumo: cabe en BF16 en una RTX 4090 o RTX 3090 de 24 GB con contexto y lote moderados; en tarjetas de 16 GB o menos seria necesario cuantizar a 8 o 4 bits, generando previamente los pesos en GGUF u otro formato, ya que el repositorio solo publica BF16.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), vLLM, y llama.cpp u Ollama tras convertir los pesos a GGUF. El repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8b-urban-seed2-20261012-CPT-merged-epoch-1 (este) | 8.190.735.360 | no disponible | CPT fusionado BF16, epoch 1 | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B-Base | ~8.2B | 32.768 nativos | Modelo base denso | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen3-8b-urban-qwen-seed1-20260930-CPT-merged-epoch-1 | ~8.2B | no disponible | CPT fusionado BF16, epoch 1 | no disponible | HuggingFace |
| Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-3 | ~8.2B (variante de 8B) | no disponible | CPT fusionado BF16, epoch 3 | no disponible | HuggingFace |

No se dispone de resultados de benchmarks comparativos para ninguno de estos modelos de la coleccion; la comparacion se limita a parametros, tipo de entrenamiento y disponibilidad.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora sobre el modelo base en ninguna tarea.
- Advertencia explicita del autor: el entrenamiento "no establece una mejora en compasion" y debe evaluarse por separado. Lo mismo es extrapolable a cualquier otra capacidad.
- Riesgo de olvido catastrofico: un unico epoch sobre 10.072 documentos mas 2.000 repeticiones puede degradar capacidades generales no presentes en el corpus.
- Licencia no declarada en el repositorio: aunque el modelo base Qwen3-8B-Base es Apache 2.0, la ausencia de licencia explicita en este repositorio genera incertidumbre para uso comercial; conviene verificar con el autor.
- Idiomas no declarados: se desconoce si el ajuste de dominio ha alterado el soporte multilingue del modelo base.
- Corpus muy especifico: al estar entrenado sobre urban_12738_cleaned, su comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion inherente a cualquier modelo generativo; no hay evaluaciones de factualidad disponibles.
- Engagement nulo: 0 descargas y 0 likes en el momento de los datos, sin validacion por parte de la comunidad.
- Sin cuantizaciones incluidas: quien necesite desplegarlo en hardware limitado debera generar su propia version GGUF o AWQ/GPTQ, con el coste y las posibles perdidas de calidad asociadas.
- Fecha de creacion futura en los metadatos (2026-10-12): conviene verificar la coherencia temporal del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-urban-seed2-20261012-CPT-merged-epoch-1
- Coleccion "Urban dataset runs - September 2026": https://huggingface.co/collections/BrandonHowe/urban-dataset-runs-september-2026
- Modelo hermano seed1 (epoch 1): https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-seed1-20260930-CPT-merged-epoch-1
- Modelo hermano seed1 (epoch 3) en free2aitools: https://free2aitools.com/model/brandonhowe/qwen3-8b-urban-qwen-seed1-20260930-cpt-merged-epoch-3
- Modelo hermano full CPT (epoch 3) en Featherless: https://featherless.ai/models/BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-3
- Modelo hermano seed1 (epoch 3) en FriendliAI: https://friendli.ai/models/BrandonHowe/Qwen3-8b-urban-qwen-seed1-20260930-CPT-merged-epoch-3
- Dataset utilizado: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
