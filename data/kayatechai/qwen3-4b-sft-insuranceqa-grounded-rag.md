# KayaTechAI/Qwen3-4B-SFT-InsuranceQA-Grounded-RAG

## Resumen

KayaTechAI/Qwen3-4B-SFT-InsuranceQA-Grounded-RAG es un ajuste fino supervisado (SFT) del modelo base Qwen3-4B de Alibaba, publicado por el usuario KayaTechAI. El nombre del repositorio indica que el entrenamiento se ha orientado a responder preguntas del dominio de seguros (InsuranceQA) con un enfoque de generacion fundamentada en contexto (grounded RAG), es decir, condicionada a fragmentos recuperados. El modelo se distribuye bajo licencia Apache 2.0 y con pesos en formato safetensors, lo que facilita su integracion en pipelines estandar de transformers.

Se trata de un modelo denso de aproximadamente 4.000 millones de parametros, heredero de la familia Qwen3, que combina modos de razonamiento y generacion directa. El ajuste se realizo con la libreria Unsloth, segun declara el autor, lo que reduce el coste computacional del entrenamiento. No obstante, la model card es extremadamente escasa: no documenta el dataset exacto, el numero de tokens de entrenamiento, hiperparametros ni resultados de evaluacion.

Su relevancia es limitada y muy especifica: sirve como ejemplo de adaptacion de un modelo pequeno de proposito general a un vertical concreto (seguros) mediante SFT y, presumiblemente, datos aumentados con recuperacion. Para produccion real conviene validar su comportamiento contra el modelo base, dado que no hay benchmarks publicados ni evidencia de mejora medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), detalles exactos no disponibles |
| Parametros totales | ~4.000 millones (heredados del base Qwen3-4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (el base Qwen3-4B soporta contexto nativo de 32.768 tokens y extendido hasta 131.072; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en bf16/fp16, admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3-4B, una version del Qwen3-4B oficial redistribuida por Unsloth para entrenamiento eficiente. La arquitectura subyacente es un transformer denso decoder-only con atencion por cabezas agrupadas (GQA) y normalizacion RMSNorm, caracteristico de la familia Qwen3. El ajuste se realizo mediante SFT (supervised fine-tuning) con la libreria TRL y acelerado con Unsloth, segun los tags y la nota de la model card ("trained 2x faster with Unsloth").

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si se aplico DPO/RLHF posterior, ni la estrategia de enmascarado de contexto para el enfoque grounded. El nombre del repositorio sugiere el uso del dataset InsuranceQA y una formulacion de respuesta condicionada a pasajes recuperados, pero no hay confirmacion documental. Tampoco se detalla si se preservaron las capacidades de "thinking mode" del Qwen3 base.

## Capacidades

- Generacion de texto en ingles orientada a preguntas y respuestas del dominio de seguros.
- Respuesta fundamentada en contexto (grounded): el nombre del modelo indica que se entreno para responder a partir de fragmentos recuperados, lo que encaja con pipelines RAG.
- Razonamiento y generacion de codigo y matematicas: capacidades heredadas del Qwen3-4B base, aunque no se ha verificado su preservacion tras el ajuste.
- Soporte de tool calling / function calling: no documentado en la model card; probablemente heredado del base, pero sin garantia.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente ingles; el base Qwen3 es multilingue, pero el ajuste puede haber degradado otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no documentadas para este ajuste.

## Casos de uso

- Asistente de atencion al cliente en aseguradoras: el modelo puede integrarse en un pipeline RAG que recupere condiciones de poliza y clausulas, y generar respuestas condicionadas a esos fragmentos. Es adecuado por su tamano contenido y su entrenamiento orientado a grounded QA.
- Busqueda semantica conversacional sobre documentacion de polizas: dado un corpus de condiciones generales y particulares, el modelo reformula y responde consultas de usuarios con contexto recuperado.
- Generacion de resumenes de siniestros: a partir de partes y comunicaciones, producir resumenes estructurados para gestores, siempre con revision humana.
- Clasificacion y enrutado de consultas: usar el modelo como componente de un sistema mayor para etiquetar el tipo de consulta (cobertura, siniestro, facturacion) antes de derivarla al equipo adecuado.
- Prototipado rapido de verticales con SFT: sirve como referencia para equipos que quieran replicar el flujo Unsloth + TRL sobre Qwen3-4B en otros dominios regulados.
- Evaluacion de pipelines RAG: al estar entrenado con contexto, puede usarse como baseline para medir fidelidad a las fuentes y tasa de alucinacion en dominios con alta exigencia factual.
- Despliegue en entornos con recursos limitados: con 4.000 millones de parametros, es viable en una unica GPU consumer tras cuantizacion, lo que permite pilotos internos sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de InsuranceQA, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8-9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 12-16 GB.
- Cuantizacion a 8 bits: aproximadamente 4-5 GB de pesos; viable en GPUs de 8 GB.
- Cuantizacion a 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 2,5-3 GB de pesos; cabe en GPUs consumer de 6-8 GB.
- GPUs recomendadas: NVIDIA RTX 4090, RTX 3090, A10G, L4 o A100 para mayor throughput; en consumer, RTX 3060 12 GB o superiores.
- Opciones de despliegue: transformers, vLLM, TGI (el tag text-generation-inference esta presente), llama.cpp/Ollama tras conversion a GGUF, y Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| KayaTechAI/Qwen3-4B-SFT-InsuranceQA-Grounded-RAG | ~4B | no disponible | Apache 2.0 | SFT vertical seguros + grounded RAG | Hugging Face |
| Qwen/Qwen3-4B (base) | ~4B | 32.768 nativo (hasta 131.072 extendido) | Apache 2.0 | Proposito general, thinking mode | Hugging Face, ecosistema amplio |
| unsloth/Qwen3-4B | ~4B | igual que el base | Apache 2.0 | Redistribucion optimizada para fine-tuning | Hugging Face |
| Llama 3.2 3B Instruct | ~3B | 128.000 | Llama 3.2 Community License | Proposito general, multilingue | Hugging Face |

La comparativa se limita a caracteristicas estructurales, ya que no hay benchmarks publicados para el modelo ajustado. Frente al Qwen3-4B base, la unica diferencia documentada es el ajuste SFT con datos de seguros; frente a Llama 3.2 3B, la licencia Apache 2.0 es mas permisiva para uso comercial.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentacion del dataset: no hay evidencia cuantitativa de mejora sobre el modelo base ni de comportamiento en el dominio de seguros.
- Riesgo de sobreajuste al formato de entrenamiento: al ser un SFT orientado a grounded QA, puede degradar su rendimiento en tareas generales o cuando no se le proporciona contexto.
- Riesgo de alucinacion: aunque el entrenamiento sea grounded, no hay garantia de fidelidad a las fuentes; en un dominio regulado como seguros es imprescindible validacion humana.
- Idioma: la model card declara solo ingles; el uso en castellano no esta soportado oficialmente y su calidad es desconocida.
- Contexto: no se documenta la longitud de contexto efectiva tras el ajuste; asumir la del base sin verificacion puede provocar fallos en produccion.
- Tool calling y modo thinking: no confirmados tras el ajuste; conviene probarlos antes de disenar agentes sobre este modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad sobre el uso recae en el integrador.
- Fecha de creacion y actualizacion muy proximas (mismo dia): sugiere una publicacion sin iteracion posterior ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KayaTechAI/Qwen3-4B-SFT-InsuranceQA-Grounded-RAG
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- Qwen3-4B oficial (referencia de la familia): https://huggingface.co/Qwen/Qwen3-4B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Paper de Qwen3: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible
