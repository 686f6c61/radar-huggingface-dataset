# harindhar10/olmo_chem_fsdp_cpt_500k

## Resumen

El modelo `harindhar10/olmo_chem_fsdp_cpt_500k` es un ajuste fino completo (full fine-tune) del checkpoint `Codemaster67/Olmo-7b-spe`, que a su vez deriva de OLMo-7B de Ai2, con el tokenizer previamente extendido con aproximadamente 300 tokens SPE (SMILES Pair Encoding) de química y los tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`. El entrenamiento se realizó sobre 500 000 muestras del dataset `Codemaster67/Causal_lm_chemistry_1M_rows`, compuesto por cadenas SMILES, con el objetivo de especializar el modelo en modelado de lenguaje químico, generación y completado de SMILES, y servir como base para tareas posteriores como predicción de propiedades moleculares.

El modelo conserva la arquitectura transformer decoder-only de OLMo-7B, con 6 891 470 848 parámetros totales, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que es un ejemplo de adaptación de un modelo de lenguaje general a un dominio científico específico mediante ajuste fino completo con paralelismo FSDP, manteniendo la apertura del ecosistema OLMo. Aunque está orientado principalmente a SMILES, puede utilizarse como punto de partida para fine-tuning en tareas de química computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-7B) |
| Parametros totales | 6 891 470 848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) y SMILES (lenguaje químico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura OLMo-7B, un transformer decoder-only con atención causal, sin mezcla de expertos. El tokenizer original fue extendido con aproximadamente 300 tokens SPE de química y dos tokens especiales de delimitación de SMILES, y las capas de embedding y LM-head se redimensionaron con vectores inicializados con la media. El ajuste fino se realizó sobre todas las capas (full fine-tune) utilizando FSDP (Fully Sharded Data Parallel) con precisión bf16, una época, learning rate de 5e-6, batch efectivo de 16, secuencias de 512 tokens, warmup del 10 %, weight decay de 0.01 y scheduler coseno. No se aplicó aumentación de datos. Se entrenaron 500 000 muestras y se evaluaron 25 000.

## Capacidades

- Generación y completado de cadenas SMILES, incluyendo la delimitación con tokens especiales.
- Modelado de lenguaje causal en el dominio químico, con capacidad de aprender distribuciones de estructuras moleculares.
- Base para fine-tuning posterior en tareas de predicción de propiedades moleculares (regresión, clasificación) gracias a su adaptación al vocabulario SMILES.
- Soporte de generación autoregresiva estándar mediante la API de transformers.
- Capacidad multilingüe limitada: el modelo conserva el inglés del modelo base, pero su especialización en SMILES puede degradar el seguimiento de instrucciones en lenguaje natural.

## Casos de uso

- Generación de estructuras moleculares: el modelo puede completar o generar cadenas SMILES a partir de un prefijo, útil para exploración de espacios químicos en diseño de fármacos.
- Aumento de datos para quimioinformática: generar variantes de SMILES para enriquecer datasets de entrenamiento en modelos de predicción de propiedades.
- Preentrenamiento continuado para tareas específicas: usar el checkpoint como inicialización para fine-tuning en regresión de propiedades (logP, solubilidad, toxicidad) o clasificación de actividad biológica.
- Corrección o validación de SMILES: el modelo puede ayudar a detectar errores sintácticos en cadenas SMILES generadas por otras herramientas.
- Asistente de química computacional: integrado en pipelines de generación de moléculas candidatas, combinado con filtros de validez química.
- Investigación en adaptación de LLMs a dominios científicos: sirve como caso de estudio de full fine-tune con tokenizer extendido y FSDP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de evaluación reportados son:

| Metrica | Valor |
|---|---|
| Final Eval Loss | 0.9182596802711487 |
| Final Eval Perplexity | 2.504927220121761 |
| Training Loss | 1.0453 |

Estos valores corresponden a la pérdida de modelado de lenguaje sobre el conjunto de evaluación de SMILES, no a tareas de razonamiento general.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- El tamaño del repositorio (13.8 GB) sugiere que los pesos en bf16 ocupan aproximadamente 13.8 GB, lo que implica que la inferencia en precisión completa requiere al menos 16 GB de VRAM.
- Para despliegue en GPUs de consumo, sería necesario aplicar cuantización (por ejemplo, 8-bit o 4-bit), pero no se han publicado configuraciones oficiales.
- No se indican opciones de despliegue específicas (vLLM, llama.cpp, etc.), aunque al ser un modelo de transformers, es compatible con las herramientas estándar del ecosistema.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Se puede señalar que el modelo base es `Codemaster67/Olmo-7b-spe` (OLMo-7B con tokenizer extendido) y que existe una variante con LoRA (`harindhar10/olmo_chem_lora_cpt_LoRA_500k`) del mismo autor, pero no se han publicado métricas comparativas entre ambas. Tampoco se dispone de información sobre el rendimiento del OLMo-7B original en tareas de química.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con cadenas SMILES; su capacidad para seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base OLMo-7B.
- No se aplicó aumentación de datos, lo que puede limitar la generalización a variaciones sintácticas de SMILES.
- La longitud de contexto efectiva durante el entrenamiento fue de 512 tokens, por lo que no se garantiza un buen comportamiento con secuencias más largas.
- No se han evaluado sesgos ni riesgos de alucinación específicos; como todo modelo generativo, puede producir SMILES inválidos o químicamente irreales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantías y no se han documentado limitaciones adicionales.
- El número de descargas y likes es cero, lo que sugiere que el modelo es reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harindhar10/olmo_chem_fsdp_cpt_500k
- Modelo base: https://huggingface.co/Codemaster67/Olmo-7b-spe
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Causal_lm_chemistry_1M_rows
- Repositorio GitHub del autor: https://github.com/Harindhar10/olmo
- Variante LoRA del mismo autor: https://huggingface.co/harindhar10/olmo_chem_lora_cpt_LoRA_500k
