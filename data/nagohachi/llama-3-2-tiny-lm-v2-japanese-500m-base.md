# nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base

## Resumen

Llama-3.2-tiny-lm-v2-japanese-500m-base es un modelo de lenguaje de aproximadamente 476 millones de parámetros para japonés, desarrollado por el usuario nagohachi. No se entrena desde cero: se obtiene mediante poda estructurada de anchura (width pruning) sobre meta-llama/Llama-3.2-3B, reduciendo la dimensión oculta de 3072 a 1024, las cabezas de atención de 24 a 8 y las cabezas KV de 8 a 4, manteniendo las 28 capas y un head_dim de 128. Tras la poda se sustituye el tokenizador original por el de llm-jp/llm-jp-3-440m (vocabulario de 99.574 tokens) y se realiza un preentrenamiento de recuperación sobre unos 10.000 millones de tokens de texto web educativo en japonés.

El modelo es la variante *base*: no tiene ajuste por instrucciones ni plantilla de chat. El autor publica variantes SFT y DPO por separado. Su relevancia radica en que, con el mismo presupuesto de ~10B tokens, alcanza la calidad final del modelo entrenado desde cero tiny-lm-v1-japanese-500m-base en aproximadamente la mitad de tokens y obtiene mejores resultados agregados en llm-jp-eval (0,232 frente a 0,198).

La arquitectura es un transformer decoder-only estilo Llama con una implementación personalizada incluida en el repositorio, por lo que requiere `trust_remote_code=True`. La longitud de contexto es de 2048 tokens. La licencia es la Llama 3.2 Community License, al ser un derivado de Meta Llama 3.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (implementación custom `scratch_llama`), 28 capas, hidden 1024, 8 cabezas de atención, 4 cabezas KV, head_dim 128 |
| Parametros totales | 476.363.776 (~476M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | japonés (ja) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (repo de 1,0 GB) |
| Vocabulario | 99.574 tokens (tokenizador llm-jp/llm-jp-3-440m) |
| Modelo de origen | meta-llama/Llama-3.2-3B |
| Dataset de entrenamiento | hotchpotch/fineweb-2-edu-japanese (`sample_10BT`) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B y aplica poda estructurada de anchura: reduce la dimensión oculta de 3072 a 1024, el número de cabezas de atención de 24 a 8 y las cabezas KV de 8 a 4, conservando las 28 capas originales y un head_dim de 128. El tokenizador de Llama se reemplaza por el de llm-jp/llm-jp-3-440m, con vocabulario de 99.574 tokens; los embeddings del nuevo vocabulario se inicializan mediante la media de las piezas del tokenizador original (mean-of-pieces). Tras la poda, el modelo se somete a un preentrenamiento de recuperación sobre aproximadamente 10.000 millones de tokens del subconjunto `sample_10BT` de hotchpotch/fineweb-2-edu-japanese, texto web de carácter educativo en japonés.

No se documentan en la información disponible detalles sobre RLHF, DPO ni otras fases de alineación para esta variante base; el autor remite a las versiones SFT y DPO para esos fines. La innovación técnica principal es el enfoque de poda más recuperación frente al entrenamiento desde cero: según el autor, con el mismo presupuesto de ~10B tokens iguala la calidad final del modelo from-scratch en aproximadamente la mitad de tokens. La implementación es personalizada (`scratch_llama`), lo que exige cargar el modelo con `trust_remote_code=True`.

## Capacidades

- Generación de texto en japonés: continuación de texto y modelado de lenguaje causal sobre entradas en japonés.
- Razonamiento básico y respuesta a tareas de conocimiento en japonés, evaluado en llm-jp-eval (CR, EL, FA, MT, NLI, QA, RC).
- Generación de código limitada: obtiene 0,170 en HE-EN y 0,100 en HE-JA en llm-jp-eval, valores bajos propios de su tamaño.
- Capacidades matemáticas muy limitadas: 0,657 en MT (el mejor subíndice del modelo), pero sin datos de GSM8K ni otros benchmarks aritméticos.
- No incluye tool calling ni function calling documentado.
- No incluye soporte de agentes ni razonamiento multi-paso documentado.
- Multilingüismo restringido: solo japonés declarado; no se garantiza un rendimiento fiable en otros idiomas.
- Sin modo thinking, sin visión ni audio.
- Es un modelo base: no tiene plantilla de chat ni ajuste por instrucciones; para conversación hay que usar las variantes SFT/DPO.

## Casos de uso

- Experimentación académica con técnicas de poda: sirve para reproducir y estudiar el pipeline de width pruning más recuperación sobre un modelo Llama, comparando con el equivalente entrenado desde cero (tiny-lm-v1).
- Generación de texto japonés en dominios educativos: al haberse preentrenado sobre fineweb-2-edu-japanese, es adecuado para continuar texto, resumir o reformular material didáctico en japonés con prompts de completado.
- Base para ajuste fino supervisado (SFT) en tareas japonesas específicas: su tamaño de 476M permite iterar rápido en una sola GPU consumer antes de escalar a modelos mayores.
- Clasificación y etiquetado de texto japonés mediante fine-tuning: con contexto de 2048 tokens puede procesar documentos cortos y artículos para tareas de NLI, QA extractiva o respuesta a preguntas simple.
- Prototipado de bajo coste en entornos con recursos limitados: al ocupar ~1 GB en bfloat16, cabe en GPUs de gama baja y permite validar pipelines de inferencia antes de desplegar modelos mayores.
- Investigación sobre tokenizadores japoneses: el remapeo de embeddings mean-of-pieces y el cambio al tokenizador de llm-jp lo convierten en un caso de estudio para analizar el impacto del vocabulario en modelos pequeños.
- Evaluación comparativa de modelos pequeños en japonés: útil como línea base en llm-jp-eval junto a llm-jp-3-440m y tiny-lm-v1.

## Benchmarks y rendimiento

Resultados en llm-jp-eval (v2.1.5), 100 ejemplos del split de test, decodificación greedy. Modelos base con ajuste de 4 shots; SFT/DPO e instruct mediante su plantilla de chat.

| Modelo | average | CR | EL | FA | HE-EN | HE-JA | MR | MT | NLI | QA | RC |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 0,232 | 0,270 | 0,322 | 0,061 | 0,170 | 0,100 | 0,013 | 0,657 | 0,398 | 0,137 | 0,190 |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 0,224 | 0,320 | 0,229 | 0,058 | 0,153 | 0,090 | 0,017 | 0,665 | 0,405 | 0,112 | 0,190 |
| Llama-3.2-tiny-lm-v2-japanese-500m-dpo | 0,222 | 0,320 | 0,225 | 0,064 | 0,153 | 0,060 | 0,017 | 0,664 | 0,395 | 0,108 | 0,210 |
| tiny-lm-v1-japanese-500m-base | 0,198 | 0,223 | 0,130 | 0,035 | 0,207 | 0,130 | 0,007 | 0,504 | 0,483 | 0,072 | 0,190 |
| tiny-lm-v1-japanese-500m-sft | 0,191 | 0,310 | 0,102 | 0,036 | 0,187 | 0,070 | 0,013 | 0,523 | 0,380 | 0,082 | 0,210 |
| tiny-lm-v1-japanese-500m-dpo | 0,194 | 0,310 | 0,130 | 0,036 | 0,187 | 0,070 | 0,013 | 0,531 | 0,345 | 0,082 | 0,240 |
| llm-jp/llm-jp-3-440m | 0,249 | 0,280 | 0,266 | 0,059 | 0,170 | 0,080 | 0,027 | 0,760 | 0,525 | 0,144 | 0,180 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,254 | 0,317 | 0,289 | 0,066 | 0,223 | 0,110 | 0,017 | 0,744 | 0,520 | 0,155 | 0,100 |

Claves: CR = clasificación, EL = elección, FA = respuesta libre, HE-EN/HE-JA = HumanEval en inglés/japonés, MR = lectura de métricas, MT = traducción automática, NLI = inferencia de lenguaje natural, QA = respuesta a preguntas, RC = comprensión lectora. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB en bfloat16 para los pesos (476M parámetros); ~0,5 GB en fp16; en cuantización de 8 bits ~0,5 GB y en 4 bits ~0,25 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para inferencia de baja concurrencia.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI; al ser una implementación custom, la compatibilidad con esos motores no está garantizada y requeriría conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | average llm-jp-eval | Licencia | Disponibilidad |
| :--- | ---: | ---: | ---: | :--- | :--- |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 476M | 2048 | 0,232 | Llama 3.2 Community | Hugging Face (93 descargas) |
| tiny-lm-v1-japanese-500m-base | ~500M | no disponible | 0,198 | no disponible | Hugging Face |
| llm-jp/llm-jp-3-440m | 440M | no disponible | 0,249 | no disponible | Hugging Face |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | no disponible | 0,254 | no disponible | Hugging Face |

Frente a tiny-lm-v1 (entrenado desde cero), la variante v2 mejora el promedio de 0,198 a 0,232 con el mismo presupuesto de tokens. Frente a llm-jp-3-440m, queda por debajo en promedio (0,232 frente a 0,249), aunque supera a llm-jp en EL (0,322 frente a 0,266) y MT (0,657 frente a 0,760 es inferior; en CR 0,270 frente a 0,280 es inferior). El modelo de llm-jp es ligeramente menor en parámetros (440M) y mantiene una ventaja en NLI y MT.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni plantilla de chat: no debe usarse directamente como asistente conversacional.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo japonés declarado; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo elevado de alucinación y de generar texto incoherente en tareas de razonamiento complejo, código o matemáticas, dado su tamaño y sus bajos resultados en HE-EN (0,170), HE-JA (0,100) y FA (0,061).
- Sesgos: al entrenarse sobre texto web educativo japonés, puede heredar sesgos de esa fuente; no se documentan análisis de sesgo.
- Restricciones de licencia: al ser derivado de Meta Llama 3.2, se rige por la Llama 3.2 Community License, que impone condiciones de atribución ("Built with Llama"), política de uso aceptable y restricciones para uso comercial según el número de usuarios mensuales; conviene revisar LICENSE, USE_POLICY y NOTICE del repositorio antes de un despliegue en producción.
- Requiere `trust_remote_code=True` por la implementación custom, lo que implica ejecutar código del autor; conviene auditar el código antes de usarlo en entornos sensibles.
- Sin cuantizaciones oficiales publicadas ni soporte documentado en motores de inferencia estándar (vLLM, llama.cpp, Ollama), lo que complica el despliegue en producción.
- El modelo tiene muy pocas descargas (93) y un solo like en el momento de la consulta, por lo que la validación comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base
- Variante SFT: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft
- Variante DPO: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo
- Modelo from-scratch de referencia (v1): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Modelo base de origen: https://huggingface.co/meta-llama/Llama-3.2-3B
- Tokenizador utilizado: https://huggingface.co/llm-jp/llm-jp-3-440m
- Baseline llm-jp: https://huggingface.co/llm-jp/llm-jp-3-440m
- Baseline instruct llm-jp: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Licencia Llama 3.2: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base/blob/main/LICENSE
- Política de uso aceptable: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base/blob/main/USE_POLICY.md
- Aviso de atribución: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base/blob/main/NOTICE
