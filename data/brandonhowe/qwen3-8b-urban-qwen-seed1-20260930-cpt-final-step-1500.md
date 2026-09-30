# BrandonHowe/Qwen3-8b-urban-qwen-seed1-20260930-CPT-final-step-1500

## Resumen

Qwen3-8b-urban-qwen-seed1-20260930-CPT-final-step-1500 es un modelo de lenguaje derivado de Qwen/Qwen3-8B-Base mediante entrenamiento continuado (continued pretraining, CPT) sobre el dataset `CompassioninMachineLearning/urban_12738_cleaned`. Lo publica el usuario BrandonHowe en HuggingFace como un checkpoint experimental aislado: el nombre codifica la semilla (seed1), la fecha de ejecucion, la fase de entrenamiento (CPT) y el paso final (step 1500), que corresponde a la epoca 3,97. No es un modelo nuevo ni una variante oficial de Qwen, sino un ajuste de dominio sobre una base ya existente.

El problema que aborda es la adaptacion de un modelo generalista de 8.190.735.360 parametros a un corpus especifico (aparentemente centrado en tematicas urbanas y de compasion, segun el nombre del dataset), sin pasar por instruccion ni alineamiento posterior. Se distribuye como checkpoint BF16 fusionado, sin adaptadores LoRA, en ocho shards de safetensors que ocupan unos 16,4 GB, y es cargable directamente con `transformers`.

Su relevancia es limitada y muy concreta: sirve como referencia reproducible para experimentos de CPT con Unsloth sobre Qwen3-8B, y como posible punto de partida para ajustes posteriores. Con cero descargas y cero likes en el momento de la consulta, y sin licencia ni idiomas declarados, debe tratarse como un artefacto de investigacion, no como un modelo listo para produccion. El propio autor advierte en la model card que el entrenamiento no demuestra una mejora en compasion y que esa hipotesis debe evaluarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), derivado de Qwen/Qwen3-8B-Base |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen3-8B; no confirmada explicitamente en la model card de este checkpoint) |
| Tipos de cuantizacion | solo BF16 en safetensors; no se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia; el modelo base Qwen3-8B es Apache-2.0) |
| Formato de pesos | safetensors (BF16, 8 shards, ~16,4 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y codificacion posicional rotatoria (RoPE), segun la documentacion publica de la familia Qwen3. El autor no modifica la arquitectura: el checkpoint final se obtiene con el metodo nativo de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, que fusiona los pesos del adaptador en el modelo base y los empaqueta sin perdida en ocho shards de safetensors BF16. No se requiere ningun adaptador para cargarlo.

El entrenamiento es continued pretraining puro, no instruccion. El dataset `CompassioninMachineLearning/urban_12738_cleaned`, fijado en la revision `ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d`, contiene 10.072 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos. El run alcanzo el paso 1500 en la epoca 3,97. No se menciona ningun uso de RLHF, DPO, SFT ni destilacion, por lo que el modelo conserva el comportamiento de una base y no de un asistente conversacional. El autor remite a `run_manifest.json` para la revision base, los hashes de seleccion de documentos, los hiperparametros y la validacion de exportacion.

## Capacidades

- Generacion de texto autoregresiva sin instrucciones: al ser un modelo base con CPT, no esta alineado para seguir ordenes ni para mantener formato conversacional.
- Continuacion de texto en el dominio del corpus de entrenamiento (`urban_12738_cleaned`), que es el unico comportamiento para el que existe evidencia de adaptacion.
- Herencia de las capacidades del modelo base Qwen3-8B (conocimiento general y multilingue), aunque no hay evaluacion publicada que confirme su conservacion tras el CPT.
- Tool calling / function calling: no confirmado. No hay plantilla de chat ni evaluacion de function calling en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado. El modelo no incorpora modo thinking ni alineamiento para tareas agente.
- Capacidades multilingues: no disponibles. El modelo base Qwen3 es multilingue, pero no se declara nada para este checkpoint.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Entrenamiento adicional: es un punto de partida valido para SFT, LoRA o nuevos ciclos de CPT.

## Casos de uso

- Punto de partida para ajuste supervisado (SFT): al ser un base CPT fusionado en BF16, se puede cargar con `transformers` o Unsloth y aplicar un LoRA de instrucciones sobre el, evitando partir de cero y aprovechando la adaptacion de dominio ya incorporada.
- Investigacion en adaptacion de dominio: permite reproducir y auditar un pipeline de CPT concreto (dataset, revision, paso 1500, epoca 3,97) comparandolo con la variante hermana `20260920-full-CPT-final-step-1500`.
- Analisis de olvido catastrofico: util para medir cuanto conocimiento general de Qwen3-8B-Base se degrada tras ~4 epocas sobre 10.072 documentos de un dominio estrecho, comparando perplejidad en validacion vs. en un corpus general.
- Generacion de texto crudo en el dominio urbano: continuacion de fragmentos, resumenes o reformulaciones dentro del corpus de entrenamiento, siempre con revision humana y sin esperar formato de asistente.
- Estudios sobre repeticion de datos: el esquema de 2.000 exposiciones repetidas por epoca sobre 10.072 documentos distintos es un caso de estudio util para medir el efecto de la duplicacion en CPT.
- Base para experimentos de compasion y alineamiento de valores: el dataset y el nombre del modelo apuntan a un objetivo de comportamiento prosocial, y el modelo puede usarse como sujeto de evaluacion, teniendo en cuenta que el autor indica explicitamente que el entrenamiento no demuestra mejora en compasion.
- Reproducibilidad de experimentos con Unsloth: el manifiesto `run_manifest.json` y la exportacion determinista permiten replicar la cadena de fusion en 16 bits y validar la integridad de los shards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y tampoco hay comparaciones con el modelo base ni con la variante hermana. Cualquier cifra que se cite de Qwen3-8B corresponde al modelo original de Qwen y no es extrapolable a este checkpoint sin medirlo.

## Requisitos de hardware

- Inferencia en BF16: los pesos ocupan aproximadamente 16,4 GB, por lo que se necesitan al menos 20-24 GB de VRAM contando cache KV y activaciones. Encaja en una RTX 4090 (24 GB), L40S (48 GB), A100 40/80 GB y H100.
- GPU consumer: si cabe en RTX 3090, RTX 4090, RTX 5090 y A6000 en BF16. En GPUs de 8-12 GB (RTX 3060, RTX 4070) no cabe sin cuantizar.
- Cuantizacion: no hay GGUF, AWQ ni GPTQ publicados. Habria que generar los archivos uno mismo; en Q4_K_M el modelo quedaria en torno a 5 GB, apto para GPUs de 8 GB, y en Q8_0 en torno a 9 GB.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI son viables al estar etiquetado como `text-generation-inference` y `endpoints_compatible`. Ollama y llama.cpp requieren convertir los safetensors a GGUF previamente.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-8b-urban-qwen-seed1-20260930-CPT-final-step-1500 | 8,19 B | 32.768 tokens (heredado) | no disponible | 0 descargas, 0 likes | CPT de dominio, base no alineada, sin benchmarks |
| Qwen3-8b-urban-qwen-20260920-full-CPT-final-step-1500 | 8,19 B | 32.768 tokens | no disponible | variante hermana del mismo autor | Mismo pipeline, ejecucion anterior; util como control |
| Qwen/Qwen3-8B-Base | 8,19 B | 32.768 tokens (131.072 con YaRN) | Apache-2.0 | modelo oficial ampliamente usado | Referencia directa: sin adaptacion de dominio ni alineamiento |
| Qwen/Qwen3-8B | 8,19 B | 32.768 tokens (131.072 con YaRN) | Apache-2.0 | modelo oficial con miles de descargas | Version con post-entrenamiento para chat y razonamiento |
| meta-llama/Llama-3.1-8B | 8,03 B | 128.000 tokens | Llama 3.1 Community License | ampliamente usada | Alternativa de tamano similar, con licencia restrictiva para grandes despliegues |

## Limitaciones y advertencias

- No es un modelo de instrucciones: al ser un CPT sobre una base, no sigue ordenes ni respeta formatos de chat de forma fiable. Usarlo como asistente sin un SFT previo dara resultados pobres.
- Sin licencia declarada: la model card no especifica terminos de uso. Aunque el modelo base Qwen3-8B sea Apache-2.0, la ausencia de licencia en el derivado genera incertidumbre legal para uso comercial. Conviene contactar con el autor antes de desplegarlo en produccion.
- Sin idiomas declarados: no hay garantia de cobertura multilingue ni de calidad en castellano.
- Riesgo de olvido catastrofico: cerca de cuatro epocas sobre un corpus pequeno y repetido (10.072 documentos con 2.000 repeticiones por epoca) pueden degradar el conocimiento general del modelo base. No hay evaluacion que lo cuantifique.
- Riesgo de alucinacion: inherente a cualquier modelo de 8 B sin alineamiento; sin evaluacion especifica para este checkpoint.
- Sin benchmarks: no hay ninguna medicion publicada de calidad, seguridad, sesgos o robustez.
- Advertencia explicita del autor: la model card indica que el entrenamiento no establece una mejora en compasion y que ese aspecto debe evaluarse por separado. No debe presentarse como un modelo "mas compasivo" sin evidencia.
- Adopcion nula: cero descargas y cero likes implican ausencia de validacion por terceros.
- Trazabilidad parcial: el detalle de hiperparametros vive en `run_manifest.json`, no en la model card; hay que consultarlo para reproducir el entrenamiento.
- Fecha de creacion futura respecto a la fecha habitual de consulta (2026-09-30), lo que sugiere un entorno de ejecucion planificado o etiquetado de forma no convencional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-seed1-20260930-CPT-final-step-1500
- Variante hermana (ejecucion 20260920): https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-final-step-1500
- Arbol de archivos de la variante hermana: https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-final-step-1500/tree/main
- Ficha de la variante hermana en Featherless: https://featherless.ai/models/BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-final-step-1500
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Repositorio de la familia Qwen3 (QwenLM): https://github.com/QwenLM/Qwen3.8
