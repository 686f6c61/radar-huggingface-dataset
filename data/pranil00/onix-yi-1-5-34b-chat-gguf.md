# pranil00/ONIX-Yi-1.5-34B-Chat-GGUF

## Resumen

ONIX-Yi-1.5-34B-Chat-GGUF es una cuantización en formato GGUF del modelo 01-ai/Yi-1.5-34B-Chat, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto aplica una cuantización IQ2_M (aproximadamente 2,7 bits por peso) que reduce el peso de los 67,26 GB originales en FP16 a 11,35 GB, lo que permite ejecutar un modelo de 34.390 millones de parámetros en hardware de consumo con 12-14 GB de memoria. La familia arquitectónica declarada es LLaMA y el modelo base es el Yi-1.5-34B-Chat de 01-ai.

El interés de esta ficha es fundamentalmente práctico: demuestra hasta qué punto la cuantización agresiva permite llevar un modelo de clase 34B a un portátil con memoria unificada de 16 GB o a una GPU de consumo con 12 GB de VRAM. El autor declara una retención de calidad cognitiva aproximada del 82 % respecto al modelo en FP16, con degradación reconocida en razonamiento matemático complejo.

Se trata de un artefacto derivado, no de un modelo entrenado desde cero: no aporta arquitectura ni datos de entrenamiento propios, sino una conversión de pesos. Por tanto, sus capacidades y limitaciones heredan las del Yi-1.5-34B-Chat original, moduladas por la pérdida introducida por la cuantización a 2,7 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo LLaMA (familia declarada por el autor); detalles internos del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 34.388.910.080 (34,39 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en Apple Silicon y NVIDIA GPU; 4.096 tokens en CPU segun la model card (la longitud nativa del modelo base no se detalla en la informacion disponible) |
| Tipos de cuantizacion | IQ2_M (2,7 bits por peso); KV cache en Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `01-ai--Yi-1.5-34B-Chat-IQ2_M.gguf`, 11,35 GB) |

## Arquitectura y entrenamiento

El artefacto es una conversión GGUF del checkpoint 01-ai/Yi-1.5-34B-Chat. La model card declara la familia arquitectónica LLaMA y un total de 34.388.910.080 parámetros, pero no detalla el número de capas, dimensiones ocultas, cabezas de atención ni el esquema de atención (MHA/GQA) del modelo original. Tampoco se documentan en la información proporcionada los datos de entrenamiento del modelo base: número de tokens, composición del corpus, fases de ajuste supervisado o preferencias (RLHF/DPO).

La innovación técnica de este artefacto es exclusivamente la cuantización. Se aplica IQ2_M, un esquema de cuantización por bloques con mezcla de tipos que sitúa la precisión media en 2,7 bits por peso, logrando un ratio de compresión de 5,93x (reducción del 83,1 % frente a FP16). La KV cache se almacena en Q4_0 (240 MB). El autor reporta que las 60 capas del modelo se aceleran en Metal, y el pipeline `run-any-model` se presenta como un motor de optimización adaptativo al dispositivo. No se documenta decodificación especulativa, atención lineal ni otras técnicas de inferencia en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste chat del Yi-1.5-34B-Chat original.
- Razonamiento general y matemático: el autor advierte de posible degradación menor en razonamiento matemático complejo por la cuantización a 2,7 bits.
- Generación de código: capacidad esperable del modelo base, aunque no se documenta explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada; el modelo base es de texto.
- Ejecución multiplataforma: Apple Silicon (Metal), NVIDIA (CUDA) y CPU x86 con AVX2/AVX-512.

## Casos de uso

- Asistente conversacional local en portátil: con 11,72 GB de memoria unificada en Apple Silicon se puede mantener una sesión de chat multi-turno con 8.192 tokens de contexto, sin conexión a servicios en la nube y sin coste por token.
- Prototipado de agentes en estación de trabajo con GPU de consumo: una RTX 4090 o similar con 12,85 GB de VRAM dedicada permite servir el modelo vía llama.cpp u Ollama para validar flujos de razonamiento antes de escalar a un modelo mayor.
- Procesamiento por lotes de documentos en CPU: con 13,72 GB de RAM libre y contexto de 4.096 tokens, adecuado para resumen y extracción sobre corpus moderados en servidores sin GPU.
- Evaluación comparativa de cuantizaciones: sirve como punto de referencia IQ2_M frente a otras cuantizaciones del mismo modelo base (Q4, Q5, Q8) para medir la pérdida real de calidad en tareas concretas.
- Desarrollo offline y entornos air-gapped: al ser un único fichero GGUF Apache 2.0, se puede distribuir y ejecutar en máquinas aisladas sin dependencias de red.
- Educación e investigación sobre cuantización: el informe de auditoría del autor (matriz FP16 vs IQ2_M con métricas de tamaño, KV cache y precisión) es útil como caso de estudio de compromisos memoria-calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo aporta métricas de compresión y memoria del propio proceso de cuantización:

| Metrica | FP16 (base) | IQ2_M (cuantizado) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 2,7 bits/param | -83,1 % |
| Tamano de pesos | 67,26 GB | 11,35 GB | -83,1 % |
| KV cache | 240 MB (FP16) | 240 MB (Q4_0) | Optimizado |
| RAM residente total | 68,33 GB | 11,72 GB | -82,9 % |
| Calidad estimada | 100 % (baseline) | 82,0 % retenida | -18,0 % |
| Capas aceleradas | 0 % (riesgo de fallo) | 60/60 | Optimo |

La cifra de retención de calidad del 82 % es una estimación del autor, no un resultado de benchmark verificable.

## Requisitos de hardware

- VRAM/RAM estimada: 11,72 GB de memoria unificada en Apple Silicon; 12,85 GB de VRAM dedicada en NVIDIA; 13,72 GB de RAM libre en CPU.
- GPU recomendadas: RTX 30/40/50 series con al menos 12 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en el segmento profesional, A100 y H100 sobran holgadamente pero no son necesarias.
- ¿Cabe en GPU de consumo? Sí, en modelos con 12 GB o más de VRAM; el autor clasifica el ajuste como "TIGHT FIT".
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI `run-any-model`. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Solo se indica aceleración Metal con las 60 capas en GPU y soporte CUDA/AVX2/AVX-512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Yi-1.5-34B-Chat-GGUF (este) | 34,39 B | 8.192 (GPU) / 4.096 (CPU) | GGUF IQ2_M (2,7 bpw) | Apache 2.0 | Retencion estimada del 82 %; 11,35 GB |
| 01-ai/Yi-1.5-34B-Chat (base) | 34,39 B | No disponible en la informacion proporcionada | safetensors FP16 | Apache 2.0 | Referencia de calidad completa; 67,26 GB |
| Otras cuantizaciones del mismo base (Q4_K_M, Q5_K_M, Q8_0) | 34,39 B | Depende del runtime | GGUF | Apache 2.0 | No se aportan datos de estas variantes en la informacion disponible |

No se dispone en la información proporcionada de comparativas con modelos de otros autores del mismo tamaño (por ejemplo, variantes de 30-35 B) ni de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: el propio autor estima una retención del 82 % y advierte de degradación en razonamiento matemático complejo; a 2,7 bits por peso es esperable una mayor tasa de errores en tareas de precisión.
- Riesgo de alucinación: inherente al modelo base y potencialmente amplificado por la cuantización agresiva; no hay evaluación específica en la información disponible.
- Sesgos: no documentados en la model card; se heredan los del corpus de entrenamiento del Yi-1.5-34B-Chat, no descrito en la información proporcionada.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad fuera del inglés o el chino del modelo base.
- Contexto limitado en CPU: 4.096 tokens frente a los 8.192 en GPU, lo que restringe casos de uso con documentos largos en hardware sin aceleración.
- Licencia: Apache 2.0 permite uso comercial, pero el aviso de responsabilidad del autor declara el artefacto "AS IS" y exime de toda garantía; conviene auditar las salidas en producción.
- Madurez del artefacto: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado por un usuario individual bajo una etiqueta comunitaria; no es una conversión oficial de 01-ai.
- Fecha de creación declarada (2026-11-25): conviene verificar la integridad y procedencia del fichero antes de desplegarlo.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/pranil00/ONIX-Yi-1.5-34B-Chat-GGUF
- Modelo base: https://huggingface.co/01-ai/Yi-1.5-34B-Chat
- Organización ONIX (referenciada en la model card): https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
