# moltherm1/olmo-mirror-olmo-3-1025-7b

## Resumen

Olmo 3 7B es un modelo de lenguaje autoregresivo de tipo transformer desarrollado por el Allen Institute for AI (Ai2), publicado dentro de la familia Olmo 3, que incluye variantes Base, Instruct y Think en tamanos de 7B y 32B. Este repositorio concreto (`moltherm1/olmo-mirror-olmo-3-1025-7b`) es un espejo no oficial del checkpoint base `allenai/Olmo-3-1025-7B`, con 7.298.011.136 parametros y una ventana de contexto de 65.536 tokens. El modelo esta disenado para habilitar la ciencia de los modelos de lenguaje: Ai2 libera codigo, checkpoints intermedios y detalles de entrenamiento bajo licencia Apache 2.0.

El modelo se entrena sobre el dataset Dolma 3 (`allenai/dolma3_mix-6T-1025`) con un enfoque de entrenamiento por etapas (stage1 de preentrenamiento, stage2 de midtraining y stage3 de contexto largo), acumulando 5,93 billones de tokens. Al ser un modelo base, no incorpora alineamiento por SFT, DPO o RLVR; esas etapas existen en las variantes Instruct y Think del mismo linaje. Su relevancia actual radica en que ofrece un punto de partida completamente abierto, reproducible y auditable para investigacion y fine-tuning, con un contexto nativo de 64K que lo situa por encima de muchos modelos abiertos de su tamano.

La arquitectura es un transformer denso con 32 capas, hidden size de 4096 y atencion multi-cabeza completa (32 cabezas Q y 32 cabezas KV, sin GQA). El corte de datos de entrenamiento es diciembre de 2024 y el modelo esta orientado exclusivamente al ingles. Este espejo mantiene los pesos en safetensors y es compatible con `transformers` 4.57.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo denso (estilo decoder-only) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | no disponible en la model card; se documenta carga en 8 bits con bitsandbytes y `torch.float16` como ejemplo |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 32 |
| Hidden size | 4096 |
| Cabezas Q / KV | 32 / 32 |
| Tokens de entrenamiento | 5,93 billones |
| Dataset | `allenai/dolma3_mix-6T-1025` (Dolma 3) |
| Fecha de corte de datos | diciembre de 2024 |
| Libreria | transformers >= 4.57.0 |
| Tamano del repo | 14,6 GB |

## Arquitectura y entrenamiento

Olmo 3 7B es un transformer denso decoder-only con 32 capas, representacion oculta de 4096 dimensiones y 32 cabezas de atencion tanto para queries como para keys/values, lo que implica atencion multi-cabeza clasica sin grouped-query attention. El modelo se entrena con un esquema por etapas: `stage1` corresponde al preentrenamiento principal, `stage2` al midtraining y `stage3` a la extension de contexto largo, con checkpoints publicados bajo la convencion `stage1-stepXXX`, `stage2-stepXXX` y `stage3-stepXXX`. En total se procesan 5,93 billones de tokens del dataset Dolma 3, con corte de datos en diciembre de 2024.

La model card no detalla la composicion exacta del dataset ni innovaciones especificas de atencion (no se mencionan attention linear, decodificacion especulativa ni arquitecturas hibridas SSM). El modelo es un base puro: no ha pasado por SFT, DPO ni RLVR en este checkpoint; esas fases se distribuyen en las variantes Instruct y Think del mismo linaje. Ai2 publica el codigo de entrenamiento en `OLMo-core`, el codigo de evaluacion en `OLMo-Eval` y recetas de fine-tuning adicional en `open-instruct`, lo que permite reproducir y extender el entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de prompts, redaccion, resumen y parafrasis.
- Modelado de lenguaje base: adecuado como punto de partida para fine-tuning supervisado y alineamiento posterior.
- Razonamiento y conocimiento general adquiridos durante el preentrenamiento, sin alineamiento conversacional especifico.
- Contexto largo de hasta 65.536 tokens, gracias a la etapa `stage3` de extension de contexto.
- Capacidad multilingue limitada: el modelo esta entrenado y etiquetado exclusivamente para ingles.
- No se documenta soporte nativo de tool calling, function calling, agentes o multi-step reasoning en este checkpoint base.
- No se documenta vision, audio ni modo thinking en esta variante base.

## Casos de uso

- Investigacion en ciencia de modelos de lenguaje: el modelo permite estudiar el efecto de cada etapa de entrenamiento cargando revisiones intermedias (`stage1-stepXXX`, `stage2-stepXXX`, `stage3-stepXXX`) sin depender de pesos cerrados.
- Fine-tuning supervisado para dominios verticales: al ser un base con licencia Apache 2.0, se puede ajustar con SFT sobre datos propios (legal, sanitario, financiero) y desplegar comercialmente sin restricciones de licencia.
- Generacion de texto a gran escala en ingles: con 65.536 tokens de contexto, puede procesar documentos largos completos (informes, contratos, articulos) en una sola pasada para tareas de continuacion o extraccion.
- Base para destilacion y experimentos de alineamiento: util para comparar tecnicas de DPO o RLVR partiendo del mismo checkpoint base que las variantes Instruct y Think oficiales.
- Reproduccion de pipelines de entrenamiento: combinado con `OLMo-core` y los scripts oficiales (`OLMo-3-1025-7B-pretrain-1.py`), sirve para replicar o modificar el preentrenamiento con cambios controlados de hiperparametros.
- Evaluacion comparativa de modelos abiertos: al ser un checkpoint totalmente abierto y auditable, es util como referencia en benchmarks de modelos de 7B con contexto largo.
- Prototipado de asistentes de redaccion tecnica en ingles: con ajuste ligero (LoRA) puede adaptarse a generacion de documentacion o resumenes de codigo, aunque sin tool calling nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado "Evaluation" con el encabezado "Core model results", pero el contenido numerico no esta presente en los datos proporcionados. No se deben inferir cifras de MMLU, HumanEval, GSM8K u otras pruebas a partir de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 14,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 18-24 GB para contexto corto y bastante mas para contexto largo.
- VRAM estimada en 8 bits (bitsandbytes): en torno a 7,3 GB de pesos, con overhead adicional; viable en GPUs de 12-16 GB para contextos moderados.
- VRAM estimada en 4 bits (si se generan pesos GGUF/AWQ/GPTQ, no publicados oficialmente): del orden de 4-5 GB de pesos, aunque la model card no documenta estas cuantizaciones.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento y serving de alta concurrencia; RTX 4090 (24 GB) para inferencia en FP16 con contexto moderado; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: si, en RTX 4090/3090 a FP16 con contexto limitado, o en GPUs de 12-16 GB usando cuantizacion de 8 bits.
- Opciones de despliegue: `transformers` >= 4.57.0 (soporte oficial), `bitsandbytes` para carga en 8 bits; no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olmo 3 7B (este espejo) | 7,30B | 65.536 | Apache 2.0 | Pesos abiertos en HF | Base, solo ingles, checkpoints intermedios |
| Olmo 3 32B | no disponible en detalle (familia 32B) | 65.536 | Apache 2.0 | Pesos abiertos en HF | 64 capas, hidden 5120, 40 Q / 8 KV, 5,50B tokens de entrenamiento |
| Olmo 3 7B Instruct | 7,30B (mismo base) | 65.536 | Apache 2.0 | Pesos abiertos en HF | Variante alineada con SFT + DPO + RLVR |
| Olmo 3 7B Think | 7,30B (mismo base) | 65.536 | Apache 2.0 | Pesos abiertos en HF | Variante orientada a razonamiento |

La informacion proporcionada no incluye datos de rendimiento comparado con modelos de otros laboratorios (Llama, Mistral, Qwen, Gemma), por lo que no es posible establecer comparaciones cuantitativas con ellos sin inventar cifras.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no esta entrenado para seguir instrucciones ni para mantener conversaciones; puede generar contenido inapropiado, repetitivo o divagante si se usa directamente como asistente.
- Solo ingles: el modelo no esta entrenado ni evaluado en castellano ni en otros idiomas; su uso en espanol producira resultados degradados.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos, citas o datos, especialmente en tareas de conocimiento factual sin recuperacion externa.
- Sesgos: al entrenarse sobre datos web a gran escala (Dolma 3), es probable que herede sesgos sociales, culturales y de representacion; la model card no documenta mitigaciones especificas en este checkpoint base.
- Contexto largo con posibles degradaciones: aunque soporta 65.536 tokens, el rendimiento en el extremo de la ventana puede degradarse; no se publican evaluaciones especificas de contexto largo en la informacion disponible.
- Corte de conocimiento en diciembre de 2024: no conoce eventos posteriores.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del dataset Dolma 3 y de los checkpoints derivados si se redistribuyen.
- Espejo no oficial: este repositorio (`moltherm1/olmo-mirror-olmo-3-1025-7b`) replica pesos de `allenai/Olmo-3-1025-7B`; para produccion se recomienda verificar la integridad y preferir el repositorio oficial de Ai2.
- Sin soporte documentado de tool calling ni agentes en esta variante base.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-1025-7b
- Modelo oficial base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Modelo oficial 32B: https://huggingface.co/allenai/Olmo-3-1125-32B
- Variante Instruct 7B: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Variante Think 7B: https://huggingface.co/allenai/Olmo-3-7B-Think
- Pagina del proyecto Olmo: https://allenai.org/olmo
- Repositorio de entrenamiento e inferencia: https://github.com/allenai/OLMo-core
- Codigo de evaluacion: https://github.com/allenai/OLMo-Eval
- Codigo de fine-tuning: https://github.com/allenai/open-instruct
- Informe W&B: https://wandb.ai/ai2-llm/Olmo-3-1025-7B/reports/Olmo-3-7B-October-2025--VmlldzoxNDcwOTM0NA
- Paper: https://allenai.org/papers/olmo3
- Dataset Dolma 3: https://huggingface.co/datasets/allenai/dolma3_mix-6T-1025
