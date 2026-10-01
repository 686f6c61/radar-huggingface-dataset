# BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-1

## Resumen

Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-1 es un modelo de generacion de texto derivado de allenai/Olmo-3-1025-7B mediante un proceso de preentrenamiento continuado (continued pretraining, CPT) sobre un corpus especifico de contenido sobre compasion. Lo publica el usuario BrandonHowe en HuggingFace y se distribuye como pesos completos ya fusionados en BF16, sin necesidad de cargar adaptadores LoRA por separado.

El modelo cuenta con 7.298.011.136 parametros reales verificados en los ficheros safetensors, empaquetados en ocho shards que suman aproximadamente 14,6 GB de repositorio. La ficha del autor indica que el checkpoint corresponde a la epoca 1.0, paso 375, y que el ajuste se realizo con Unsloth mediante `save_pretrained_merged(save_method="merged_16bit")`, con validacion de los pesos en BF16.

Su relevancia es acotada y muy especifica: se trata de un experimento de investigacion sobre adaptacion de dominio, no de un modelo de proposito general optimizado. El propio autor advierte que el entrenamiento no establece una mejora en compasion y que esa hipotesis debe evaluarse por separado, por lo que su interes principal es metodologico (replicabilidad del pipeline de CPT y del proceso de fusion de pesos) mas que de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, tag `olmo3`); detalles de atencion no disponibles |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 publicado; cuantizaciones GGUF/AWQ/GPTQ no disponibles en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo no declarado en HuggingFace ni en la model card) |
| Formato de pesos | safetensors (8 shards, BF16 fusionado) |

## Arquitectura y entrenamiento

La arquitectura no se describe en detalle en la informacion disponible. Se sabe que el modelo base es allenai/Olmo-3-1025-7B, etiquetado con la familia `olmo3`, y que el resultado es un transformer denso de aproximadamente 7,3 mil millones de parametros. No se especifican el tipo de atencion, la longitud de contexto nativa, la configuracion de capas ni la tokenizacion empleada.

El entrenamiento consistio en un preentrenamiento continuado sobre el dataset `CompassioninMachineLearning/compassion_12185_cleaned`, fijado en la revision `95e233baf48a7751bcec55a08347697ed6e4c4a8`. Cada epoca expuso 10.000 documentos distintos mas 2.000 repeticiones adicionales, con 200 documentos de validacion disjuntos. El checkpoint publicado corresponde a la epoca 1.0, paso 375. La fusion se realizo con la utilidad nativa de Unsloth en modo `merged_16bit`, generando pesos BF16 validados y empaquetados sin perdida en ocho shards safetensors; no se requiere adaptador para cargar el modelo. No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto autoregresiva en el pipeline `text-generation`, heredada del modelo base OLMo 3 7B.
- Capacidad de ajuste a dominio: el entrenamiento esta orientado a contenido sobre compasion, aunque el autor no certifica que se haya producido una mejora medible en esa dimension.
- Compatibilidad declarada con endpoints de inferencia (tag `endpoints_compatible`).
- Carga directa con la libreria `transformers` sin adaptadores.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en preentrenamiento continuado: el repositorio incluye `run_manifest.json` con la revision base, los hashes de seleccion de documentos, los parametros de entrenamiento y la validacion de exportacion, lo que permite reproducir y auditar el pipeline de CPT.
- Estudio de adaptacion de dominio en modelos abiertos: sirve como punto de comparacion frente al modelo base allenai/Olmo-3-1025-7B para medir el efecto de 1 epoca de CPT sobre un corpus tematico concreto.
- Evaluacion de tecnicas de fusion de pesos: al publicarse pesos ya fusionados en BF16 mediante `save_pretrained_merged`, es util para validar flujos de trabajo con Unsloth que evitan la carga de adaptadores en produccion.
- Base para ajuste supervisado posterior (SFT): al ser un checkpoint denso completo de 7.3B en BF16, puede actuar como inicializacion para fine-tuning adicional en tareas de generacion de texto.
- Experimentos controlados sobre sesgo y tono: dado que el corpus de entrenamiento es tematico y acotado (12.000 exposiciones por epoca), permite estudiar como un corpus pequeno desplaza el comportamiento generativo respecto al modelo original.
- Pruebas de infraestructura de despliegue: al ser un modelo denso de 7,3B en BF16, es adecuado para validar pipelines con vLLM o TGI y medir throughput y latencia antes de escalar a modelos mayores.
- Generacion de texto asistida por prompting: uso como modelo de generacion general, asumiendo que no hay garantia de mejora en calidad frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los metadatos de HuggingFace incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones especificas de compasion. El autor indica explicitamente que el entrenamiento no establece una mejora en compasion y que dicha mejora debe evaluarse por separado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16 (precision publicada): aproximadamente 15-16 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda un minimo de 24 GB para secuencias cortas y 40 GB o mas para contextos largos o lotes grandes.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos, con overhead adicional de cache.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4,5-5,5 GB de pesos, con overhead adicional; requiere convertir el modelo, ya que el repositorio solo publica BF16.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB para despliegue en produccion; RTX 4090 (24 GB) y RTX A6000 (48 GB) son viables para inferencia en BF16 con lotes pequenos.
- Compatibilidad con GPU de consumo: si, cabe en RTX 4090 y RTX 3090 (24 GB) en BF16 para contexto moderado; en tarjetas de 12-16 GB es necesario cuantizar.
- Opciones de despliegue: `transformers` de forma nativa (dependencia declarada), vLLM y TGI por el tag `endpoints_compatible`, y llama.cpp / Ollama previa conversion a GGUF, formato que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-1 | 7.298.011.136 | no disponible | no disponible | safetensors BF16 | CPT de 1 epoca sobre corpus de compasion, pesos fusionados |
| allenai/Olmo-3-1025-7B (modelo base) | no disponible | no disponible | no disponible | no disponible | Origen de los pesos; mismo punto de partida sin el CPT adicional |
| Otras alternativas de ~7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

La unica comparacion sustentada por la informacion disponible es contra el modelo base. Cualquier contraste con otros modelos de tamano similar requeriria consultar sus respectivas fichas tecnicas.

## Limitaciones y advertencias

- No hay licencia declarada en HuggingFace ni en la model card, por lo que el uso comercial no esta autorizado de forma explicita y debe consultarse con el autor.
- El campo de idiomas no esta declarado; se desconoce el soporte multilingue real del ajuste.
- El autor advierte que el entrenamiento no establece una mejora en compasion; no debe presentarse como un modelo especializado en esa capacidad sin una evaluacion independiente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento ni de ausencia de regresiones frente al modelo base.
- El ajuste se realizo con un corpus pequeno y tematico (10.000 documentos distintos mas 2.000 repeticiones por epoca, 1 epoca completada), lo que eleva el riesgo de sobreajuste al dominio y de degradacion en tareas generales.
- Al ser un modelo de generacion de texto sin alineacion documentada (no se mencionan RLHF ni DPO), el riesgo de alucinacion y de generar contenido inapropiado es el propio del modelo base.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validacion por parte de la comunidad.
- El repositorio solo publica BF16; no hay GGUF, AWQ ni GPTQ, de modo que el despliegue en hardware limitado exige conversion manual y su correspondiente validacion de calidad.
- No se especifica la longitud de contexto, lo que impide planificar cargas con secuencias largas sin probar empiricamente el comportamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-1
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Revision del dataset: 95e233baf48a7751bcec55a08347697ed6e4c4a8
- Herramienta de fusion (Unsloth): https://github.com/unslothai/unsloth
- Otros enlaces (papers, blogs, demos): no disponibles en la informacion proporcionada
