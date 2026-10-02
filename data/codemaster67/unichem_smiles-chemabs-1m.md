# Codemaster67/Unichem_smiles-chemabs-1M

## Resumen

Unichem_smiles-chemabs-1M es un adaptador QLoRA (Quantized Low-Rank Adaptation) publicado por el usuario Codemaster67 sobre el modelo base allenai/OLMo-1B-hf, un transformer decoder-only de aproximadamente 1.200 millones de parametros. El adaptador se ha entrenado para el modelado de lenguaje en el dominio de la quimica, concretamente sobre cadenas SMILES (Simplified Molecular-Input Line-Entry System) y resumenes quimicos, empleando el dataset Codemaster67/Unichem_smiles-chemabs-1M.

El objetivo es adaptar un modelo de lenguaje generalista a la sintaxis y semantica de las representaciones moleculares, de modo que pueda generar, completar y manipular cadenas SMILES con mayor fidelidad que el checkpoint original. Para ello se extendio el tokenizador con unos 300 tokens quimicos SPE (SMILES Pair Encoding) y dos tokens especiales, y se reentrenaron las capas `embed_tokens` y `lm_head` como copias completas mediante `modules_to_save`.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador pequeno (0,2 GB en el repositorio), con licencia Apache-2.0, sin descargas ni valoraciones en el momento de la consulta, y orientado a un nicho muy especifico. Es util como ejemplo de flujo QLoRA de bajo coste aplicado a un dominio cientifico, aunque carece de evaluacion con conjunto de validacion y adolece de varias limitaciones documentadas por el propio autor. Nota: la model card titula el modelo como "OLMo-7B QLoRA Adapter", pero el campo `base_model` y todas las referencias apuntan a OLMo-1B-hf; se trata de una discrepancia no resuelta en la documentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) con adaptadores LoRA sobre base cuantizada en 4 bits |
| Parametros totales | ~1,2B en el modelo base OLMo-1B-hf, mas adaptadores LoRA (rank 64); repositorio de 0,2 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (nativo de OLMo-1B-hf); el entrenamiento uso secuencias de 512 tokens |
| Tipos de cuantizacion | NF4 4-bit con doble cuantizacion (bitsandbytes); adaptadores en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT; incluye `embed_tokens` y `lm_head` completos) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre OLMo-1B-hf, un transformer decoder-only autorregresivo. La configuracion de cuantizacion es QLoRA con NF4 de 4 bits y doble cuantizacion, dtype de computo bfloat16, rank (r) 64, alpha 128 (escalado efectivo 2,0), RSLoRA activado (rank-stabilized LoRA) y dropout de 0,01. Los modulos objetivo son `all-linear`, y las capas `embed_tokens` y `lm_head` se guardan completas (`modules_to_save`) porque fueron redimensionadas al extender el tokenizador.

El entrenamiento consistio en 1 epoca sobre el dataset completo (train y test fusionados, sin split de validacion), con learning rate 2e-05, optimizador AdamW de 8 bits, batch size 32 por dispositivo, acumulacion de gradientes 1 (batch efectivo 32), scheduler coseno, warmup ratio 0,1, weight decay 0,01, gradient checkpointing activado y 1978 secuencias empaquetadas. La loss de entrenamiento registrada es 1,5747. La innovacion tecnica principal es la extension del tokenizador con ~300 tokens quimicos SPE y los tokens `<|start_of_smiles|>` / `<|end_of_smiles|>`, que permiten representar moleculas de forma mas compacta. No consta uso de RLHF ni DPO.

## Capacidades

- Modelado de lenguaje causal en el dominio quimico y generacion de cadenas SMILES.
- Completado de SMILES a partir de un prefijo delimitado por `<|start_of_smiles|>` y `<|end_of_smiles|>`.
- Representacion enriquecida de moleculas gracias a los ~300 tokens SPE anadidos al tokenizador.
- Base para fine-tuning posterior orientado a prediccion de propiedades moleculares.
- Capacidades residuales de modelado de lenguaje general heredadas de OLMo-1B, previsiblemente degradadas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles (`language: en`).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de moleculas candidatas: el modelo completa cadenas SMILES a partir de un prefijo, lo que permite muestrear estructuras quimicamente plausibles para exploracion temprana de espacio quimico.
- Aumento de datos quimicos: generar variantes de SMILES para ampliar datasets de entrenamiento de modelos discriminativos de propiedades, dado su entrenamiento sobre el corpus chemabs de 1M de muestras.
- Preentrenamiento de dominio (CPT) como paso previo: usar el adaptador como inicializacion para un fine-tuning posterior de prediccion de propiedades, tal como indica la seccion "Intended Use".
- Prototipado de bajo coste en investigacion academica: al requerir pocos recursos de GPU y ocupar 0,2 GB, es viable experimentar en un portatil o en una GPU de gama media.
- Tokenizacion quimica especializada: reutilizar el tokenizador extendido con tokens SPE en otros pipelines de NLP quimico.
- Ensenanza y demos de QLoRA: sirve como caso de estudio reproducible de adaptacion de dominio con PEFT sobre un modelo pequeno.
- Normalizacion y canonicalizacion asistida de SMILES: emplear el modelo como componente generativo auxiliar en tareas de limpieza de representaciones moleculares, siempre con validacion quimica posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la loss de entrenamiento, sin conjunto de validacion independiente.

| Metrica | Valor |
|---|---|
| Training loss | 1,5747 |
| Epochs | 1 |
| Secuencias empaquetadas | 1978 |
| Metricas held-out (MMLU, HumanEval, GSM8K, etc.) | no disponible |

## Requisitos de hardware

- VRAM estimada: adaptador ~0,2 GB; modelo base OLMo-1B en NF4 4-bit en torno a 0,7-1 GB; en fp16 completo del base, ~2,4 GB.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente (por ejemplo GTX 1650 4 GB, RTX 3050, RTX 3060). A100 y H100 estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con al menos 4 GB. En CPU tambien es viable con cuantizacion, aunque mas lento.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` (via documentada por el autor); vLLM y TGI admiten adaptadores LoRA; para llama.cpp u Ollama habria que fusionar el adaptador con el base y convertir a GGUF, proceso no documentado por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia |
|---|---|---|---|---|
| Unichem_smiles-chemabs-1M (este) | ~1,2B (base) + LoRA | 2048 (base); 512 entrenamiento | LM generativo de SMILES | Apache-2.0 |
| allenai/OLMo-1B-hf (base) | ~1,2B | 2048 | LM generalista | Apache-2.0 |
| ChemBERTa | ~77M | 512 | encoder de SMILES para clasificacion/regresion | Apache-2.0 |
| SMILES encoder-decoder foundation (arXiv 2407.20267) | no disponible | no disponible | encoder-decoder quimico preentrenado en 91M SMILES de PubChem | no disponible |

## Limitaciones y advertencias

- Solo se distribuyen los adaptadores QLoRA; es obligatorio cargar el base allenai/OLMo-1B-hf en 4 bits para poder usarlo.
- Entrenado principalmente con cadenas SMILES: la capacidad de seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base OLMo.
- No se uso conjunto de validacion, por lo que no hay metricas held-out ni evidencia de generalizacion.
- Discrepancia en la documentacion: el titulo indica "OLMo-7B" mientras que el `base_model` es OLMo-1B-hf; conviene verificar que los pesos corresponden realmente a la base declarada.
- Contexto de entrenamiento limitado a 512 tokens, inferior a la ventana nativa de 2048 del base; el rendimiento en secuencias largas no esta documentado.
- Idioma limitado al ingles.
- Riesgo de alucinacion quimica: el modelo puede generar SMILES sintacticamente validos pero quimicamente invalidos o no realistas; es imprescindible validar con herramientas de quimioinformatica (RDKit, Open Babel) antes de cualquier uso.
- Sesgos: no evaluados; al derivar de un modelo generalista, puede heredar sesgos del corpus original.
- Licencia Apache-2.0 permisiva para uso comercial, pero sin garantias del autor y con 0 descargas y 0 valoraciones, lo que implica ausencia de validacion por la comunidad.
- Modelo con 0,2 GB y una unica epoca de entrenamiento: la magnitud de la adaptacion al dominio es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Codemaster67/Unichem_smiles-chemabs-1M
- Modelo base OLMo-1B-hf: https://huggingface.co/allenai/OLMo-1B-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Unichem_smiles-chemabs-1M
- Dataset relacionado (fineweb): https://huggingface.co/datasets/Codemaster67/Unichem_smiles-fineweb-1M
- Dataset relacionado (chemabs 10M): https://huggingface.co/datasets/Codemaster67/Unichem_smiles-Chemabs-10M
- Paper de modelos fundacionales quimicos encoder-decoder (91M SMILES, PubChem): https://arxiv.org/abs/2407.20267
- Competencia de clasificacion SMILES basada en MoleculeNet: https://www.codabench.org/competitions/14675/
- Curriculum de quimica y ML con datos moleculares (GitHub): https://github.com/williamedwardhahn/Chem_AI
