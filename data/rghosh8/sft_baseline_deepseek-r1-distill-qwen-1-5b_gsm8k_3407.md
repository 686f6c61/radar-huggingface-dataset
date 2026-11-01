# rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_3407

## Resumen

`rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_3407` es un ajuste fino supervisado (SFT) del modelo `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el usuario rghosh8 en HuggingFace. Se trata de un artefacto de experimentacion academica: el nombre indica que se ha entrenado sobre el conjunto de datos GSM8K con semilla 3407, presumiblemente como linea base ("baseline") para comparar con otras tecnicas de entrenamiento o destilacion.

El modelo hereda la arquitectura Qwen2 del modelo base de DeepSeek, con 1.777.088.000 parametros totales en formato safetensors. El repositorio ocupa 3,6 GB, lo que sugiere pesos en precision completa (fp32) o bf16 sin cuantizar. No se proporcionan datos sobre el dataset exacto, hiperparametros, numero de pasos o resultados de evaluacion.

Su relevancia es limitada fuera del contexto de investigacion en el que fue creado: no tiene descargas ni interacciones, la model card es practicamente la plantilla generica de TRL y no se documentan capacidades, licencia ni idiomas. Debe tratarse como un checkpoint experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada del modelo base) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DeepSeek-R1-Distill-Qwen-1.5B soporta 32.768 tokens, aunque no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors sin cuantizar; el modelo base admite GGUF/AWQ via terceros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin especificar) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,6 GB |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.13.0+cu129 |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Dataset de entrenamiento | GSM8K (segun el nombre del modelo) |
| Semilla | 3407 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con 1.500 millones de parametros nominales (1.777 millones contando embeddings y cabezas), disenado originalmente por DeepSeek como destilacion de su modelo R1 sobre Qwen2.5-Math-1.5B. Esa destilacion original incorpora capacidades de razonamiento paso a paso (chain-of-thought) aprendidas del profesor R1.

Sobre esta base, rghosh8 ha aplicado un ajuste fino supervisado (SFT) con TRL sobre GSM8K, el conocido dataset de problemas aritmeticos de grado escolar (aproximadamente 8.500 problemas de entrenamiento). El nombre del checkpoint sugiere que se trata de una ejecucion "baseline" con semilla 3407, probablemente parte de un barrido experimental para comparar metodos de entrenamiento. No se documentan hiperparametros (learning rate, batch size, epocas), composicion exacta del dataset, ni si se aplicaron tecnicas adicionales como DPO o RLHF. Tampoco se especifica si se congelaron capas o se entreno el modelo completo.

## Capacidades

- Generacion de texto conversacional en formato chat (etiqueta `conversational`).
- Razonamiento aritmetico y resolucion de problemas matematicos de nivel escolar, reforzado por el SFT sobre GSM8K.
- Razonamiento paso a paso (chain-of-thought) heredado del modelo base DeepSeek-R1-Distill.
- Generacion de codigo basica, heredada del modelo base.
- Soporte de tool calling: no documentado en esta ficha, aunque el modelo base Qwen2 lo soporta de forma nativa.
- Capacidades de agente y multi-step reasoning: no documentadas explicitamente; el modelo base tiene cierta capacidad por su entrenamiento CoT.
- Capacidades multilingues: no documentadas; el modelo base Qwen2 tiene cobertura multilingue amplia, pero el SFT sobre GSM8K (en ingles) puede haber degradado el rendimiento en otros idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Investigacion en ajuste fino supervisado: sirve como linea base reproducible (semilla 3407) para comparar contra variantes con DPO, RLVR u otras tecnicas sobre el mismo dataset y modelo base.
- Evaluacion de olvido catastrofico: permite medir cuanto se degradan las capacidades generales del modelo base tras un SFT intensivo sobre un dataset narrow como GSM8K.
- Reproducibilidad de experimentos: al fijar semilla y framework (TRL 1.15.0), facilita replicar resultados en estudios de ablacion.
- Prototipado de tutores matematicos: puede usarse en demos de resolucion guiada de problemas aritmeticos, siempre que se valide su calidad fuera del conjunto de entrenamiento.
- Generacion de cadenas de razonamiento para sintesis de datos: util para producir trazas CoT que luego se filtren y se usen en otros pipelines de entrenamiento.
- Benchmark de infraestructura: con 1,7B parametros y 3,6 GB de pesos, es un modelo manejable para probar pipelines de entrenamiento e inferencia en una sola GPU consumer.
- Analisis de sesgos inducidos por dataset: al estar entrenado solo con GSM8K, permite estudiar como un corpus estrecho afecta al estilo y la distribucion de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, ni sobre GSM8K ni sobre otros conjuntos, y no se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos; en 4 bits, en torno a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4, A10). Para fp32 completo, se necesitarian unos 7,2 GB solo de pesos.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 8 GB o mas, y en GPUs integradas o CPU con cuantizacion agresiva.
- Opciones de despliegue: transformers (pipeline nativo), vLLM, TGI (la etiqueta `text-generation-inference` esta presente), llama.cpp/Ollama si se convierte a GGUF manualmente (no se distribuye GGUF en el repo).
- Latencia y throughput estimados: no disponibles; para un modelo de 1,7B en una RTX 4090 se pueden esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_3407 | 1,78B | no disponible | SFT sobre GSM8K (semilla 3407) | no disponible | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32.768 tokens (segun model card del base) | Destilacion de R1 sobre Qwen2.5-Math-1.5B | MIT (segun model card del base) | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Preentrenamiento + SFT + preferencias | Apache 2.0 | HuggingFace, muy popular |
| microsoft/Phi-3-mini-4k-instruct | 3,8B | 4.096 tokens | Preentrenamiento + SFT + DPO | MIT | HuggingFace, muy popular |

La comparativa es orientativa: el checkpoint de rghosh8 no publica metricas, por lo que no puede afirmarse que supere o iguale a las alternativas en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay informacion sobre hiperparametros, composicion del dataset, proceso de filtrado ni evaluacion, lo que impide reproducir el entrenamiento con garantias.
- Licencia no especificada: el campo `licence: license` de la model card no concreta terminos, por lo que el uso comercial es juridicamente incierto hasta que el autor lo aclare. El modelo base DeepSeek-R1-Distill-Qwen-1.5B se distribuye bajo licencia MIT, pero el SFT podria estar sujeto a otras condiciones.
- Riesgo elevado de sobreajuste a GSM8K: al entrenar sobre un unico dataset narrow, es probable que el modelo haya perdido capacidades generales del base (conversacion abierta, codigo, multilingue) y que su rendimiento fuera de problemas aritmeticos escolares sea pobre.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado por el SFT; no se ha evaluado su calibracion.
- Idiomas: no documentados; el SFT en ingles sobre GSM8K puede haber degradado el castellano y otros idiomas respecto al base.
- Sesgos: no evaluados. El dataset GSM8K tiene sesgos conocidos de estilo y dominio (problemas escolares anglosajones) que pueden reflejarse en las respuestas.
- Sin mantenimiento aparente: creado y actualizado el mismo dia (2026-11-01), sin descargas ni interacciones; no hay indicios de soporte o actualizaciones.
- No apto para produccion sin validacion previa: no existen benchmarks, pruebas de robustez ni auditorias de seguridad.
- El ejemplo de codigo de la model card contiene un placeholder (`model="None"`), lo que indica que la propia documentacion no fue verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rghosh8/SFT_baseline_DeepSeek-R1-Distill-Qwen-1.5B_gsm8k_3407
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio TRL: https://github.com/huggingface/trl
- Dataset GSM8K (referencia): https://huggingface.co/datasets/openai/gsm8k
- Paper de DeepSeek-R1: no disponible en la informacion proporcionada
