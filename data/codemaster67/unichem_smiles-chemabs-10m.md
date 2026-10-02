# Codemaster67/Unichem_smiles-chemabs-10M

## Resumen

Unichem_smiles-chemabs-10M es un adaptador QLoRA de dominio quimico entrenado sobre el modelo base allenai/OLMo-1B-hf. Lo publica el usuario Codemaster67 en HuggingFace y su objetivo es el modelado de lenguaje de cadenas SMILES (representaciones lineales de moleculas) mediante causal language modelling, usando el conjunto de datos Codemaster67/Unichem_smiles-chemabs-10M. No es un modelo completo, sino una capa de pesos LoRA que debe cargarse sobre el checkpoint base cargado en 4 bits.

La relevancia de esta ficha radica en su nicho muy concreto: quimioinformatica generativa sobre un transformer causal pequeno (~1B parametros). El adaptador entrena con cuantizacion NF4 de 4 bits, rango LoRA 64, alpha 128 y RSLoRA, dirigido a todas las capas lineales. El tokenizador del modelo base se amplio con unos 300 tokens quimicos SPE (SMILES Pair Encoding) y los tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`, lo que exige guardar `embed_tokens` y `lm_head` como copias completas (no LoRA) mediante `modules_to_save`.

Conviene senalar una inconsistencia en la propia model card: el titulo indica "OLMo-7B QLoRA Adapter" mientras que el campo `base_model` y todas las referencias apuntan a allenai/OLMo-1B-hf. Los datos verificables (tamano del repositorio de 0,2 GB y el campo `base_model`) apuntan a la variante de 1B. El repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (OLMo-1B) + adaptador QLoRA |
| Parametros totales | ~1B en el modelo base (segun denominacion allenai/OLMo-1B-hf); adaptador LoRA adicional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el entrenamiento uso secuencias empaquetadas de 512 tokens como maximo |
| Tipos de cuantizacion | NF4 de 4 bits (double quantization) para el base; adaptadores en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); `embed_tokens` y `lm_head` como copias completas |

## Arquitectura y entrenamiento

El modelo base OLMo-1B-hf es un transformer causal (autoregresivo) de aproximadamente 1B parametros. Sobre el se entrena un adaptador QLoRA: la base se carga en 4 bits con cuantizacion NF4 y double quantization via bitsandbytes, mientras que las matrices LoRA se entrenan en bfloat16. La configuracion LoRA usa rango 64, alpha 128 (escalado efectivo 2,0), dropout 0,01, RSLoRA (rank-stabilized) y `all-linear` como modulos objetivo. Los modulos `embed_tokens` y `lm_head` se guardan completos porque fueron redimensionados al ampliar el tokenizador con los tokens SPE y los tokens especiales de SMILES.

Los detalles de entrenamiento indican 1 epoca sobre el dataset completo (train y test fusionados, sin split de validacion), tasa de aprendizaje 2e-05, optimizador AdamW de 8 bits, tamano de lote 32 por dispositivo con acumulacion de gradiente 1 (lote efectivo 32), scheduler coseno, warmup ratio 0,1, weight decay 0,01 y gradient checkpointing activado. Se procesaron 19826 secuencias empaquetadas y la perdida de entrenamiento final reportada es 1,3609. No se documenta ninguna fase de RLHF, DPO ni alineacion por preferencias. Como innovacion tecnica destacable esta la extension del vocabulario con tokens quimicos SPE especificos de SMILES.

## Capacidades

- Generacion y completado de cadenas SMILES, delimitadas por los tokens `<|start_of_smiles|>` y `<|end_of_smiles|>`.
- Modelado de lenguaje causal en dominio quimico sobre el dataset Unichem_smiles-chemabs-10M.
- Punto de partida para fine-tuning posterior orientado a prediccion de propiedades moleculares.
- Tokenizacion especializada de quimica gracias a la extension con ~300 tokens SPE.
- Capacidades multilingues: solo ingles (`language: en`); el enfoque es mayoritariamente simbolico (SMILES) mas que linguistico.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Generacion de moleculas candidatas: el adaptador puede completar cadenas SMILES a partir de un fragmento inicial, util para proponer estructuras en fases tempranas de descubrimiento de farmacos.
- Completado de SMILES: dado un prefijo estructural, el modelo predice la continuacion de la cadena, apoyando tareas de enumeracion y exploracion quimica.
- Aumento de datos quimicos: generar variaciones de SMILES para ampliar conjuntos de entrenamiento de otros modelos de quimioinformatica.
- Preentrenamiento de dominio (CPT): servir como checkpoint intermedio sobre el que aplicar fine-tuning supervisado para tareas concretas de quimica.
- Prediccion de propiedades moleculares: mediante fine-tuning adicional sobre cabeceras de clasificacion o regresion usando el backbone adaptado.
- Normalizacion y estandarizacion de representaciones SMILES: ayuda a producir cadenas consistentes con el vocabulario SPE extendido.
- Investigacion en tokenizacion quimica: permite estudiar el efecto de los tokens SPE en un transformer causal pequeno.
- Filtrado de candidatos en pipelines de screening virtual: generar y priorizar estructuras antes de una evaluacion fisico-quimica mas costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de entrenamiento final (1,3609) tras 1 epoca, sin conjunto de validacion ni metricas held-out.

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | 1,3609 |
| MMLU / HumanEval / GSM8K | no disponible |
| Metricas held-out de quimica | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano del modelo, no confirmada por el autor): en 4 bits NF4 el base ocupa aproximadamente 0,7-1 GB de pesos; el adaptador anade un consumo marginal. En bfloat16 completo serian del orden de 2,4 GB de pesos.
- Al tratarse de un modelo de ~1B parametros en 4 bits, cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090 y similares; incluso puede ejecutarse en GPUs con 8 GB contando cache KV y activaciones.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; solo tendrian sentido para entrenamiento o lotes grandes.
- Opciones de despliegue: carga via `transformers` + `peft` + `bitsandbytes` (configuracion documentada en la model card). El uso con vLLM, llama.cpp, Ollama o TGI no esta documentado para este adaptador y requeriria conversion adicional (por ejemplo, fusionar el adaptador con la base antes de exportar a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas con otros modelos de quimica (ChemBERTa, MolT5, etc.). La unica comparacion documentable es frente al checkpoint base.

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unichem_smiles-chemabs-10M | ~1B (base) + adaptador LoRA | no disponible (entrenado a 512) | Quimica / SMILES | apache-2.0 | HuggingFace (adaptador PEFT) |
| allenai/OLMo-1B-hf | ~1B | no disponible en la informacion | Lenguaje general | apache-2.0 | HuggingFace |
| Otros modelos de quimica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Frente al base, el adaptador anade vocabulario quimico SPE y especializacion en SMILES, a costa de posible degradacion del seguimiento de instrucciones en lenguaje natural.

## Limitaciones y advertencias

- Es unicamente un adaptador QLoRA: requiere cargar allenai/OLMo-1B-hf en 4 bits para poder usarse; no es autonomo.
- Entrenado principalmente con cadenas SMILES; la capacidad de seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base.
- No se uso conjunto de validacion, por lo que no existen metricas held-out ni garantias de generalizacion.
- Idioma limitado al ingles; el contenido es mayoritariamente simbolico, no conversacional.
- Riesgo de alucinacion: puede generar SMILES quimicamente invalidos o no sintetizables; se recomienda validacion con herramientas de quimioinformatica (por ejemplo, RDKit) antes de cualquier uso real.
- Sesgos conocidos: no documentados por el autor; el dataset de quimica puede presentar sesgos hacia ciertas clases de compuestos.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base y del dataset utilizado.
- Inconsistencia documental en la model card (menciona OLMo-7B en el titulo y OLMo-1B en los metadatos), sin confirmacion por parte del autor.
- Repositorio sin descargas ni likes y creado en una fecha futura respecto a la referencia estandar, lo que dificulta evaluar su adopcion.
- Entrenamiento de solo 1 epoca y con secuencias de 512 tokens: capacidad limitada para dependencias de contexto largo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Codemaster67/Unichem_smiles-chemabs-10M
- Modelo base: https://huggingface.co/allenai/OLMo-1B-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Unichem_smiles-chemabs-10M
- Dataset relacionado (Chemabs-10M): https://huggingface.co/datasets/Codemaster67/Unichem_smiles-Chemabs-10M
- Dataset relacionado (fineweb-10M): https://huggingface.co/datasets/Codemaster67/Unichem_smiles-fineweb-10M
