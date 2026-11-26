# pranil00/ONIX-aya-23-8B-GGUF

## Resumen

ONIX-aya-23-8B-GGUF es una cuantización en formato GGUF (esquema Q5_K_M) del modelo Aya-23-8B desarrollado originalmente por Cohere Labs (CohereForAI). El artefacto lo publica el usuario pranil00 bajo la etiqueta "ONIX Community" y se genera con la herramienta `run-any-model`, un motor de optimización adaptativo orientado a ejecución en hardware de consumo. El objetivo declarado es ofrecer una versión ligera del modelo base para inferencia local en portátiles, equipos de sobremesa y GPUs de gama consumer.

La model card presenta el modelo como una familia arquitectónica LLaMA con 1.500 millones de parámetros (1.498.480.640), lo que entra en contradicción directa con el nombre del repositorio y con el propio modelo base: Aya-23-8B es un transformer de 8.000 millones de parámetros. Esta discrepancia, junto con métricas de telemetría que no cuadran con el tamaño real de un modelo de 8B en Q5_K_M (un peso de 1,01 GB es imposible para 8B a 5,5 bits por parámetro, donde lo esperable ronda los 5,5-6 GB), indica que la información publicada es internamente inconsistente y debe tratarse con cautela.

El interés del artefacto es, por tanto, limitado: se trata de una cuantización comunitaria de un modelo multilingüe ya existente, sin benchmarks propios ni validación independiente. Aya-23-8B sí es relevante en el ecosistema open source por su cobertura de 23 idiomas (incluido el castellano) y su licencia permisiva, pero esta conversión concreta no aporta garantías técnicas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, segun la model card); el modelo base Aya-23-8B es un transformer denso |
| Parametros totales | 8B segun el modelo base; la model card declara 1.498.480.640 (dato inconsistente, no verificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens segun la model card en GPU/Apple Silicon; 4.096 en CPU; el modelo base Aya-23-8B soporta 8.192 tokens |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso) en formato GGUF |
| Idiomas soportados | No disponible en esta ficha; el modelo base Aya-23-8B cubre 23 idiomas (incluido espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `CohereForAI--aya-23-8B-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo base Aya-23-8B es un transformer decoder-only denso de 8.000 millones de parámetros entrenado por Cohere Labs, con una ventana de contexto de 8.192 tokens y especial énfasis en cobertura multilingüe (23 idiomas). Esta ficha describe únicamente el artefacto cuantizado: la model card no documenta el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, fases de RLHF/DPO), por lo que esos datos no están disponibles aquí.

La conversión a GGUF se ha realizado con la herramienta `run-any-model`, que según el autor aplica cuantización Q5_K_M y "aceleración de capas" adaptativa por dispositivo. La model card reporta una retención de calidad del 97,5 % respecto a FP16 y una reducción de peso del 65,6 %, pero estas cifras no vienen acompañadas de metodología de evaluación ni de resultados de benchmarks reproducibles, y entran en conflicto con el tamaño declarado del modelo (ver limitaciones).

## Capacidades

- Generación de texto multilingüe heredada de Aya-23-8B (23 idiomas en el modelo base, incluido el castellano).
- Razonamiento y respuesta a instrucciones en formato conversacional, con tokens de parada `<|im_end|>` y `<|endoftext|>`.
- Generación de código y tareas de comprensión lectora, según las capacidades del modelo base.
- Ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan o la CLI `run-any-model`.
- No se documenta soporte explícito de tool calling, function calling, agentes o multi-step reasoning en la información disponible.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Prototipado local de asistentes conversacionales multilingües: el modelo puede desplegarse en un portátil con Ollama o llama.cpp para iterar sobre prompts en castellano sin coste de API, aprovechando la herencia multilingüe de Aya-23-8B.
- Experimentación educativa con cuantización GGUF: útil para comparar la degradación de calidad entre FP16 y Q5_K_M en un modelo multilingüe de referencia, siempre validando con evaluaciones propias.
- Generación de texto offline en entornos sin conectividad: al caber en RAM de consumo (según la model card, 3,17 GB en CPU), permite procesar documentación o redactar borradores en equipos modestos.
- Traducción y reescritura de textos en varios idiomas: el modelo base cubre 23 lenguas, por lo que puede emplearse para tareas de traducción asistida en local, con revisión humana obligatoria.
- Integración en pipelines de CI para pruebas de humo de inferencia: sirve como modelo ligero de referencia para validar que un stack de despliegue (llama.cpp, servidor compatible con OpenAI) funciona antes de escalar a modelos mayores.
- Chat de soporte interno en pequeñas organizaciones: desplegado con LM Studio o Jan, puede responder preguntas frecuentes sobre documentación interna, aceptando que la calidad es inferior a la del modelo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una tabla de telemetría del motor `run-any-model` (tamaño de pesos, uso de RAM, retención de calidad estimada del 97,5 %), sin métricas de tareas como MMLU, HumanEval o GSM8K, y sin comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada: 2,51 GB en GPU NVIDIA según la model card (cifra no coherente con un modelo de 8B en Q5_K_M, que requeriría del orden de 6 GB).
- Apple Silicon: 1,17 GB de memoria unificada según la model card (igualmente inconsistente con el tamaño real del modelo base).
- CPU: 3,17 GB de RAM libre para contexto de 4.096 tokens, según la model card.
- GPU recomendadas: cualquier GPU consumer con suficiente VRAM para un modelo de 8B en Q5_K_M (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090); en la práctica, un 8B Q5_K_M no cabe en GPUs de 4-8 GB.
- Despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI `run-any-model`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ONIX-aya-23-8B-GGUF (esta ficha) | 8B (declarado 1,5B, inconsistente) | 8.192 (GPU) / 4.096 (CPU) | Apache 2.0 | GGUF en Hugging Face, 0 descargas |
| CohereForAI/aya-23-8B (original) | 8B | 8.192 | Apache 2.0 (modelo abierto de Cohere Labs, con condiciones de uso) | Pesos safetensors en Hugging Face |
| Aya-23-8B en GGUF de terceros (p. ej. cuantizaciones comunitarias estándar) | 8B | 8.192 | Apache 2.0 | Múltiples repositorios GGUF |
| Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 Community License | Pesos y GGUF ampliamente disponibles |

La comparación con Llama 3.1 8B es pertinente por tamaño y categoría de uso, aunque Aya-23-8B destaca en cobertura multilingüe frente a la orientación más anglocéntrica de Llama. No se dispone de datos de rendimiento de esta cuantización concreta para comparar numéricamente.

## Limitaciones y advertencias

- Inconsistencia grave de datos: el repositorio se llama "aya-23-8B" pero la model card declara 1,5B de parámetros y un peso de 1,01 GB; un 8B en Q5_K_M debería rondar los 5,5-6 GB. Las cifras de VRAM y RAM de la model card no son fiables.
- Sin benchmarks ni validación independiente: la retención de calidad del 97,5 % es una estimación del propio motor de cuantización, no un resultado medido con tareas estándar.
- Riesgo de alucinación y sesgos heredados del modelo base Aya-23-8B, agravados potencialmente por la cuantización.
- La cuantización Q5_K_M puede degradar tareas sensibles a precisión (matemáticas, código) respecto a FP16.
- Licencia Apache 2.0 declarada para el artefacto, pero conviene verificar las condiciones del modelo base Aya-23-8B de Cohere Labs antes de uso comercial.
- Repositorio con 0 descargas y 0 likes: sin comunidad que lo valide, sin issues ni mantenimiento conocido.
- La model card incluye una cláusula de exención de responsabilidad total que traslada toda validación al usuario final.
- Idiomas soportados no verificados en esta conversión concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-aya-23-8B-GGUF
- Modelo base: https://huggingface.co/CohereForAI/aya-23-8B
- Herramienta de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
- Organización ONIX (referenciada en la model card): https://huggingface.co/ONIX
