# BrandonHowe/Olmo7b-compassion-seed2-20261001-CPT-merged-epoch-2

## Resumen

Olmo7b-compassion-seed2-20261001-CPT-merged-epoch-2 es un checkpoint de 7.298.011.136 parÃ¡metros publicado por el desarrollador BrandonHowe, derivado del modelo base allenai/Olmo-3-1025-7B mediante continued pretraining (CPT) sobre un corpus de temÃ¡tica de compasiÃ³n. El modelo se distribuye ya fusionado (merged) en precisiÃ³n BF16, sin adaptador LoRA, en ocho shards de safetensors listos para cargar con transformers. El entrenamiento partiÃ³ de 10.000 documentos distintos mÃ¡s 2.000 exposiciones repetidas por Ã©poca, con 200 documentos de validaciÃ³n disjuntos, y corresponde al epoch 2.0 (step 750) de la semilla 2.

El problema que aborda es de investigaciÃ³n en seguridad y alineaciÃ³n de IA: explorar si el continued pretraining sobre un dataset especÃfico puede modular el tono o el comportamiento del modelo en dominios concretos. En este caso, el dataset es CompassioninMachineLearning/compassion_12185_cleaned, fijado en la revisiÃ³n 95e233baf48a7751bcec55a08347697ed6e4c4a8. El propio autor advierte en la model card que el entrenamiento no demuestra una mejora en compasiÃ³n y que esa hipÃ³tesis debe evaluarse por separado.

Es relevante ahora como ejemplo reproducible de un flujo CPT ligero sobre un modelo abierto de la familia OLMo 3, con manifiesto de ejecuciÃ³n (run_manifest.json) que documenta la revisiÃ³n base, los hashes de selecciÃ³n de documentos, los hiperparÃ¡metros y la validaciÃ³n de la exportaciÃ³n. No obstante, es un artefacto experimental con cero descargas y cero likes en el momento de redactar esta ficha, y sin datos publicados de evaluaciÃ³n.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3 de Allen Institute for AI, segun etiqueta `olmo3` y modelo base) |
| Parametros totales | 7.298.011.136 (aproximadamente 7,3 mil millones) |
| Parametros activos | No aplica (no hay evidencia de que sea MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 unicamente; no se incluyen versiones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | no disponible |
| Licencia | no disponible (HuggingFace no declara licencia); se hereda la del modelo base allenai/Olmo-3-1025-7B, a consultar |
| Formato de pesos | safetensors (8 shards, precision BF16, modelo fusionado sin adaptador) |

## Arquitectura y entrenamiento

El modelo parte de allenai/Olmo-3-1025-7B y conserva su arquitectura: un transformer decoder-only de la familia OLMo 3. La intervenciÃ³n realizada es un continued pretraining supervisado sobre un corpus concreto y posteriormente una fusiÃ³n de pesos. La publicaciÃ³n no describe modificaciones estructurales (por ejemplo, atenciÃ³n lineal, decodificaciÃ³n especulativa o capas hÃ­bridas SSM), por lo que se asume que la topologÃ­a es la del modelo base. El detalle exacto de la arquitectura (nÃºmero de capas, cabezas de atenciÃ³n, tipo de posicional encoding, tokenizador) no se incluye en la informaciÃ³n proporcionada.

En cuanto al entrenamiento, la model card indica que cada Ã©poca usa 10.000 documentos distintos mÃ¡s 2.000 exposiciones repetidas, con 200 documentos de validaciÃ³n disjuntos. El checkpoint corresponde al epoch 2.0 (step 750) de la semilla 2. La fusiÃ³n se realizÃ³ con la funciÃ³n nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, con pesos validados en BF16 y empaquetados sin pÃ©rdida en ocho shards de safetensors. El autor no reporta uso de RLHF, DPO ni otras tÃ©cnicas de alineaciÃ³n posteriores en la informaciÃ³n disponible; el procedimiento declarado es continued pretraining. Los hiperparÃ¡metros completos, incluida la tasa de aprendizaje y el nÃºmero total de tokens procesados, quedan remitidos a run_manifest.json y no se detallan en el texto facilitado.

## Capacidades

- Generacion de texto autoregresiva en ingles (idioma no confirmado oficialmente): el modelo mantiene la funcion de `text-generation` heredada del modelo base.
- Continuacion de texto y respuesta a prompts abiertos, segun el pipeline declarado (`text-generation`).
- Capacidades de razonamiento, codigo o matematicas: no documentadas especificamente para este checkpoint; dependen del modelo base y pueden haberse visto alteradas por el continued pretraining.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta declarado).
- Modo thinking, vision o audio: no disponibles.
- Ajuste de tono en dominio de compasion: es el objetivo declarado del entrenamiento, pero el autor indica explicitamente que no se ha establecido una mejora y que debe evaluarse por separado.

## Casos de uso

- Investigacion en continued pretraining: usar el checkpoint junto a su run_manifest.json para reproducir o auditar el efecto de un corpus especifico sobre un modelo base de 7B, comparando epoch 1, 2 y 3 con la semilla correspondiente.
- Estudios de alineacion y seguridad: analizar si el CPT sobre un dataset tematico modula el tono de las respuestas, como caso de prueba controlado dentro de una linea de investigacion en AI safety.
- Base para fine-tuning especifico: partir de este checkpoint fusionado en BF16 como inicializacion para un ajuste posterior con LoRA o QLoRA en tareas de dialogo de apoyo.
- Generacion de respuestas con tono considerado en entornos de bienestar: solo tras una evaluacion rigurosa propia, ya que el propio autor no avala la mejora; se emplearia en prototipos internos y no en atencion directa a usuarios sin validacion.
- Comparacion de checkpoints (ablation): medir la degradacion o mejora en benchmarks generales (por ejemplo perplejidad en un corpus de control) frente al modelo base allenai/Olmo-3-1025-7B.
- Prototipado rapido en local: cargar los safetensors con transformers en una GPU de 24 GB para experimentos de inferencia sin necesidad de gestionar adaptadores.
- Generacion de texto sintetico para aumento de datos: producir variantes de texto de tono empatico para entrenar o evaluar otros sistemas, previa revision de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,6 GB solo para los pesos, mÃ¡s memoria para cache KV y activaciones; en la practica se recomienda un margen de 16-20 GB segun longitud de contexto y tamano de lote.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S; en consumer, RTX 4090 y RTX 3090 (24 GB) son suficientes para BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX A5000). En tarjetas de 12-16 GB seria necesario cuantizar, y el repositorio no ofrece pesos cuantizados, por lo que habria que generarlos.
- Opciones de despliegue: transformers (formato nativo del repositorio); vLLM y TGI son compatibles tras la carga de los pesos, ya que el modelo es un transformer estandar; llama.cpp y Ollama requieren una conversion previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones). A modo orientativo, un modelo denso de 7B en BF16 sobre una A100 o H100 obtiene decenas de tokens por segundo, pero se trata de una estimacion generica, no de un dato medido para este checkpoint.
- Cuantizacion: al no incluir pesos de 8 o 4 bits, el ahorro de VRAM depende de una cuantizacion propia mediante herramientas como llama.cpp, GPTQ o AWQ.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Olmo7b-compassion-seed2-...-merged-epoch-2) | 7.298.011.136 | no disponible | CPT + merge, BF16 | no disponible | HuggingFace, 0 descargas |
| allenai/Olmo-3-1025-7B (base) | 7B (familia OLMo 3) | no disponible | Modelo base | segun AI2 (no verificada aqui) | HuggingFace (modelo base oficial) |
| BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-3 | misma familia | no disponible | CPT + merge, otro seed/epoch | no disponible | HuggingFace (checkpoint hermano) |
| BrandonHowe/Olmo7b-urban-olmo-20260920-full-CPT-merged-epoch-2 | misma familia | no disponible | CPT + merge sobre otro corpus | no disponible | HuggingFace (checkpoint hermano) |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- El propio autor advierte que el entrenamiento no establece una mejora en compasion y que esa dimension debe evaluarse por separado; es decir, el objetivo declarado no esta validado.
- Riesgo de alucinacion: es un modelo denso de 7B sometido a continued pretraining, sin alineacion posterior documentada, por lo que mantiene los riesgos habituales de generar contenido falso con apariencia de veracidad.
- Olvido catastrofico: el continued pretraining puede degradar capacidades generales del modelo base (razonamiento, codigo, conocimiento factual); no se aportan evaluaciones que lo descarten.
- Licencia no declarada: la ausencia de licencia explicita en HuggingFace impide confirmar los terminos de uso comercial; debe verificarse la licencia del modelo base antes de cualquier despliegue productivo.
- Idiomas no documentados: no se declara soporte multilingue, por lo que el comportamiento fuera del ingles (si es el idioma principal del corpus) es incierto.
- Contexto no documentado: se desconoce la longitud de contexto efectiva y no se han probado degradaciones en ventanas largas tras el CPT.
- Estado experimental: cero descargas y cero likes, sin validacion independiente por parte de la comunidad.
- Sesgos de dominio: al entrenarse sobre un unico corpus tematico, puede sobrerrepresentar patrones de ese dataset y reducir la diversidad de respuestas.
- Reproducibilidad parcial: los detalles completos de entrenamiento dependen de run_manifest.json, que no se ha podido inspeccionar en esta ficha.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/BrandonHowe/Olmo7b-compassion-seed2-20261001-CPT-merged-epoch-2
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/compassion_12185_cleaned
- Checkpoint hermano (semilla 1, epoch 3): https://huggingface.co/BrandonHowe/Olmo7b-compassion-olmo-seed1-20260930-CPT-merged-epoch-3
- Checkpoint hermano (corpus urbano): https://huggingface.co/BrandonHowe/Olmo7b-urban-olmo-20260920-full-CPT-merged-epoch-2
- Repositorio oficial de OLMo (AI2): https://github.com/allenai/OLMo
- Perfil del autor en GitHub: https://github.com/BrandonHowe
