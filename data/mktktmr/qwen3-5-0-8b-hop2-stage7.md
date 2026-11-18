# mktktmr/qwen3.5-0.8b-hop2-stage7

## Resumen

`mktktmr/qwen3.5-0.8b-hop2-stage7` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario mktktmr. Se trata de un modelo especializado en una tarea muy concreta dentro de pipelines de recuperación de información multihop: seleccionar el siguiente término de búsqueda (una entidad o nombre propio) a partir de una pregunta y de los documentos ya recuperados. Es, por tanto, un componente de un sistema RAG (retrieval-augmented generation) de varios saltos, no un modelo de propósito general.

El modelo se ha entrenado mediante LoRA sobre el modelo base y posteriormente se han fusionado los pesos adaptadores en el modelo principal, dando lugar a un checkpoint denso de 852.985.920 parámetros (aproximadamente 0,85 mil millones) en formato safetensors. El repositorio ocupa 1,7 GB y las etiquetas de Hugging Face confirman la arquitectura `qwen3_5` y la relación de fine-tune respecto a Qwen/Qwen3.5-0.8B.

La relevancia de este modelo es acotada pero clara para quien construye sistemas de question answering multihop en japonés: encapsula la lógica de "qué buscar a continuación" en un modelo pequeño que puede ejecutarse en hardware modesto, en lugar de depender de un LLM grande para esa decisión intermedia. No obstante, al tratarse de un checkpoint de investigación con cero descargas y sin model card detallada en cuanto a licencia o idiomas, su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (tag `qwen3_5`) |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible oficialmente; el entrenamiento y los datos de ajuste son en japones |
| Licencia | no disponible en el repositorio; el modelo base Qwen/Qwen3.5-0.8B es Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,85 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA, cuyos adaptadores se fusionaron posteriormente en los pesos del modelo principal, de modo que el checkpoint distribuido es un modelo denso estándar sin adaptadores separados. No se dispone de información sobre hiperparámetros de entrenamiento, rango de LoRA, número de pasos ni configuración de decodificación.

Los datos de entrenamiento declarados por el autor son JEMHopQA (licencia CC BY-SA 4.0, filtrado y reformateado para el entrenamiento) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés (también CC BY-SA 4.0). La tarea aprendida es de clasificación/selección: dado un par (pregunta, documentos recuperados), el modelo debe emitir un único nombre propio que será el siguiente término de búsqueda del pipeline. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Selección del siguiente término de búsqueda en pipelines de recuperación multihop: dado un contexto de pregunta y documentos, genera una entidad candidata para la siguiente consulta.
- Comprensión lectora en japonés sobre documentos tipo Wikipedia, gracias a los datos de ajuste.
- Razonamiento de un solo paso orientado a la tarea (identificar la entidad faltante), no razonamiento general.
- Generación de texto libre: capacidad heredada del modelo base, pero no es el objetivo del ajuste y no está validada.
- Tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y multi-step reasoning autónomo: no disponible; el modelo es un eslabón dentro de un agente orquestado externamente.
- Capacidades multilingües: no documentadas; el ajuste es específicamente en japonés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Question answering multihop en japonés: el modelo se inserta entre iteraciones de un retriever para decidir la siguiente entidad a consultar; su tamaño de 0,85 B permite ejecutarlo en cada salto sin penalizar la latencia del pipeline.
- Construcción de pipelines RAG con descomposición de consultas: en lugar de pedir a un LLM grande que reformule la pregunta, se delega esta decisión a un modelo pequeño y especializado, reduciendo coste por consulta.
- Enrutamiento de búsqueda en bases documentales japonesas: dado un conjunto de chunks recuperados, el modelo señala el nombre propio que falta para completar la respuesta, útil en sistemas de soporte interno sobre wikis corporativas.
- Evaluación y ablation de retrievers: al ser un componente aislado y pequeño, sirve para medir el impacto de la estrategia de selección de términos en la calidad final del QA, manteniendo constante el resto del pipeline.
- Prototipado en hardware de consumo: con menos de mil millones de parámetros, puede ejecutarse en GPU de gama media o incluso en CPU cuantizado para experimentos de investigación.
- Investigación en recuperación multihop: reproducible como baseline para comparar estrategias de selección de términos (heurísticas frente a modelos aprendidos) sobre JEMHopQA.
- Filtrado previo en sistemas de búsqueda federada: usar la entidad generada como clave para decidir a qué índice o colección dirigir la siguiente consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica unos 3-4 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 0,9-1 GB de pesos; a 4 bits, alrededor de 0,5 GB, aunque el autor no publica versiones GGUF.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente en FP16; también cabe en GPUs de datacenter (A100, H100) aunque estaría infrautilizada.
- Cabe en GPU consumer: sí, con holgura, en la mayoría de tarjetas con 6-8 GB de VRAM.
- Opciones de despliegue: transformers con safetensors de forma nativa; vLLM y TGI son compatibles con arquitecturas Qwen, aunque la disponibilidad exacta para `qwen3_5` debe verificarse; llama.cpp/Ollama requerirían convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; por el tamaño, se espera latencia de milisegundos por petición en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mktktmr/qwen3.5-0.8b-hop2-stage7 | 0,85 B | no disponible | Seleccion de terminos en QA multihop (japones) | no disponible (base Apache-2.0) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,85 B | no disponible | Proposito general | Apache-2.0 | Hugging Face, oficial |
| Modelos de QA multihop especializados de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks ni sobre otros fine-tunes comparables de la misma tarea, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- La model card no especifica licencia propia; aunque el modelo base es Apache-2.0, los datos de entrenamiento (JEMHopQA y chunks de Wikipedia) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre usos derivados. Conviene revisar la compatibilidad antes de un uso comercial.
- Tarea extremadamente estrecha: el modelo está entrenado para emitir un único nombre propio como siguiente término de búsqueda; usarlo como chatbot o generador general no está validado y probablemente produzca resultados pobres.
- Riesgo de alucinación de entidades: al generar nombres propios, puede inventar entidades plausibles pero inexistentes, lo que contaminaría el pipeline de recuperación.
- Sesgos heredados del modelo base y de la Wikipedia en japonés, incluyendo sesgos de cobertura geográfica y de representación.
- Idioma: el ajuste es en japonés; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con preguntas y documentos largos.
- Sin información sobre benchmarks, curvas de entrenamiento ni evaluación held-out: no es posible estimar su calidad frente a alternativas.
- Fecha de creación en el repositorio (2026-11-18) posterior a la fecha de referencia habitual; verificar la procedencia y autenticidad del checkpoint antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mktktmr/qwen3.5-0.8b-hop2-stage7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
