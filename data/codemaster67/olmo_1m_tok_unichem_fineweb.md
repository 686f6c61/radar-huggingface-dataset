# Codemaster67/Olmo_1M_tok_unichem_fineweb

## Resumen

`Codemaster67/Olmo_1M_tok_unichem_fineweb` es un adaptador QLoRA (Quantized Low-Rank Adaptation) entrenado sobre el modelo base `allenai/OLMo-1B-hf` para el modelado de lenguaje en el dominio de la quimica, concretamente sobre cadenas SMILES. Lo desarrolla el usuario de HuggingFace Codemaster67 y se distribuye con licencia Apache 2.0. El problema que aborda es la adaptacion de un modelo causal generico de proposito general al subdominio quimico sin necesidad de reentrenar el modelo completo, aprovechando el entrenamiento continuado (CPT) sobre un corpus especializado.

La pieza clave es la extension del tokenizador con aproximadamente 300 tokens de quimica basados en SPE (SMILES Pair Encoding), ademas de los tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`. Como consecuencia, las capas `embed_tokens` y `lm_head` se redimensionaron y se guardan como copias completas entrenables mediante `modules_to_save`, mientras que el resto de pesos se almacenan como matrices LoRA (rango 64, alpha 128). El adaptador ocupa 0,4 GB en el repositorio y requiere cargar el modelo base en 4 bits (NF4) para funcionar.

El modelo es relevante para flujos de trabajo de quimioinformatica que necesitan generacion y completado de SMILES con un coste computacional bajo, pero conviene tener en cuenta que se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de redactar esta ficha, sin conjunto de validacion ni metricas held-out publicadas, y con un unico epoch de entrenamiento sobre la totalidad del dataset disponible. La model card presenta una inconsistencia en el titulo, que menciona "OLMo-7B" pese a que el modelo base real es OLMo-1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (modelo base OLMo-1B), adaptado con LoRA sobre todas las capas lineales |
| Parametros totales | Aproximadamente 1.200 millones en el modelo base (`allenai/OLMo-1B-hf`); el adaptador LoRA se suma sobre esa base (no disponible el recuento exacto de parametros del adaptador) |
| Longitud de contexto | 2.048 tokens en el modelo base OLMo-1B; 512 tokens de longitud maxima de secuencia durante el entrenamiento del adaptador |
| Tipos de cuantizacion | NF4 de 4 bits con doble cuantizacion (bitsandbytes); adaptadores y computo en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en 4 bits |
| Libreria | peft (con transformers y bitsandbytes) |
| Modelo base | allenai/OLMo-1B-hf |
| Dataset de entrenamiento | Codemaster67/Unichem_smiles-fineweb-1M |
| Rango LoRA (r) / alpha | 64 / 128 (escalado efectivo 2,0, RSLoRA activado) |
| Modulos objetivo | all-linear |
| Modulos guardados completos | embed_tokens, lm_head |
| Dropout | 0,01 |
| Epocas / LR | 1 / 3e-05 |
| Optimizador | AdamW de 8 bits |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre OLMo-1B, un transformer decoder-only causal de aproximadamente 1.200 millones de parametros desarrollado por AI2. La adaptacion sigue el esquema QLoRA: el modelo base se carga en precision de 4 bits (NF4 con doble cuantizacion via bitsandbytes) y sobre el se entrenan matrices LoRA de bajo rango en bfloat16. Se utiliza RSLoRA (rank-stabilized LoRA) con rango 64, alpha 128 y dropout 0,01, aplicado a todos los modulos lineales. Ademas, dado que el tokenizador se extendio con unos 300 tokens SPE y los tokens especiales de delimitacion de SMILES, las capas de embeddings y de salida se guardan como copias completas entrenables (`modules_to_save`).

El entrenamiento consistio en un unico epoch sobre el dataset completo, fusionando los splits de train y test y sin reservar conjunto de validacion. Los hiperparametros incluyen tasa de aprendizaje 3e-05, programador coseno con warmup del 10 por ciento, weight decay 0,01, batch de 32 por dispositivo sin acumulacion de gradientes, gradient checkpointing activado y una longitud maxima de secuencia de 512 tokens, con 1.981 secuencias empaquetadas. La perdida de entrenamiento final reportada es de 1,5530. No se registraron metricas de validacion ni de test al no existir particion held-out.

## Capacidades

- Generacion de texto causal en el dominio quimico, orientada a cadenas SMILES.
- Completado de SMILES a partir de un fragmento o prefijo de molecula.
- Modelado de lenguaje sobre notacion quimica gracias al vocabulario SPE ampliado (aproximadamente 300 tokens de quimica).
- Delimitacion explicita de secuencias SMILES mediante los tokens especiales `<|start_of_smiles|>` y `<|end_of_smiles|>`.
- Base para ajuste fino posterior en tareas de prediccion de propiedades moleculares (segun la seccion de uso previsto de la model card).
- Soporte de generacion autoregresiva estandar con `model.generate` (max_new_tokens configurable).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio; no disponible.

## Casos de uso

- Generacion de moleculas candidatas: el adaptador puede muestrear cadenas SMILES validas condicionadas a un prefijo, util como generador inicial en pipelines de descubrimiento de farmacos que luego filtran con herramientas de quimioinformatica.
- Completado de SMILES incompletos: dado un esqueleto molecular parcial delimitado por los tokens especiales, el modelo completa la estructura, lo que agiliza la transcripcion y el prototipado de moleculas.
- Preentrenamiento de dominio como paso previo a tareas supervisadas: el adaptador sirve como punto de partida para ajuste fino en prediccion de propiedades (solubilidad, toxicidad, actividad), tal y como indica la seccion de uso previsto.
- Aumento de datos quimicos: generar variaciones de SMILES para ampliar datasets de entrenamiento de modelos discriminativos de quimica, con revision posterior.
- Prototipado e investigacion en NLP quimico: permite experimentar con un modelo causal pequeno adaptado al dominio sin grandes recursos de GPU, cargando el base en 4 bits.
- Normalizacion y canonicalizacion asistida de representaciones: usar el modelo para proponer formas alternativas de la misma molecula antes de aplicar un canonicalizador de referencia.
- Docencia y demostraciones de QLoRA en dominios cientificos: ejemplo reproducible de adaptacion eficiente en memoria de un modelo de 1B a un vocabulario especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (1,5530) y no se aportan valores de validacion, MMLU, HumanEval, GSM8K ni de tareas especificas de quimica.

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento | 1,5530 |
| Metricas de validacion / test | No disponibles (no se uso split de validacion) |
| Secuencias empaquetadas de entrenamiento | 1.981 |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en NF4 de 4 bits: en torno a 1 GB o menos para los pesos cuantizados, mas el overhead de activaciones y del adaptador; el repositorio del adaptador ocupa 0,4 GB.
- El modelo base completo en bfloat16 ocuparia aproximadamente 2,5 GB, por lo que la via de 4 bits es la recomendada por el propio autor.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (por ejemplo RTX 3060, RTX 4070, RTX 4090) es suficiente; tambien A100 o H100 si se busca throughput alto.
- Cabe en GPU de consumo: si, es uno de los formatos mas ligeros del ecosistema (base 1B en 4 bits + adaptador LoRA).
- Opciones de despliegue: la ruta documentada es `transformers` + `bitsandbytes` + `peft` (el autor proporciona un ejemplo con `BitsAndBytesConfig`, `AutoModelForCausalLM` y `PeftModel`). No se documenta compatibilidad oficial con vLLM, llama.cpp, Ollama ni TGI; no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Codemaster67/Olmo_1M_tok_unichem_fineweb | ~1,2B base + adaptador LoRA | 2.048 (entrenado a 512) | Adaptador QLoRA de quimica SMILES sobre OLMo-1B | Apache 2.0 | HuggingFace, adaptador PEFT |
| allenai/OLMo-1B-hf | ~1,2B | 2.048 | Transformer causal de proposito general | Apache 2.0 | HuggingFace, pesos completos |
| ChemBERTa (familia) | 10M-100M aprox. | 512 aprox. | Encoder tipo BERT preentrenado con SMILES, orientado a clasificacion/regresion | MIT / Apache segun variante | HuggingFace |
| MolT5 (familia) | 60M-220M aprox. | 512 aprox. | Encoder-decoder texto-SMILES (traduccion y generacion) | Apache 2.0 | HuggingFace |

Los datos de parametros y contexto de ChemBERTa y MolT5 son aproximados y proceden de conocimiento general de esas familias; no se dispone de una comparacion de rendimiento directa con este adaptador, dado que no hay metricas publicadas. ChemBERTa y MolT5 no son modelos generativos causales puros, por lo que la comparacion debe interpretarse como orientativa por categoria de tarea (quimica y moleculas) y no por rendimiento medido.

## Limitaciones y advertencias

- El modelo es unicamente un adaptador QLoRA; no funciona de forma autonoma y requiere cargar `allenai/OLMo-1B-hf` en 4 bits para poder usarse.
- El titulo de la model card menciona "OLMo-7B", pero el modelo base real es OLMo-1B; existe una inconsistencia documental que conviene verificar antes de reutilizarlo.
- Entrenado principalmente con cadenas SMILES, por lo que la capacidad de seguir instrucciones en lenguaje natural puede degradarse respecto al checkpoint base de OLMo.
- No se uso conjunto de validacion ni de test: no hay metricas held-out y el riesgo de sobreajuste no esta cuantificado.
- Riesgo de alucinacion quimica: puede generar SMILES sintacticamente plausibles pero quimicamente invalidos o inestables; se requiere validacion con herramientas de quimioinformatica antes de cualquier uso real.
- Rendimiento limitado al ingles y al dominio quimico; no hay soporte multilingue documentado.
- Ventana de contexto entrenada de solo 512 tokens, muy inferior a la del modelo base (2.048), lo que restringe tareas que necesiten dependencias largas.
- Sesgos: no se documenta ningun analisis de sesgos ni de composicion del dataset mas alla del nombre (`Unichem_smiles-fineweb-1M`).
- Uso comercial: la licencia Apache 2.0 permite uso comercial tanto del adaptador como del modelo base, pero al tratarse de un artefacto de investigacion sin evaluacion exhaustiva no se recomienda su despliegue en produccion sin validacion adicional.
- Solo un epoch de entrenamiento y procedencia de autor individual con cero descargas/likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Codemaster67/Olmo_1M_tok_unichem_fineweb
- Modelo base: https://huggingface.co/allenai/OLMo-1B-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/Codemaster67/Unichem_smiles-fineweb-1M
