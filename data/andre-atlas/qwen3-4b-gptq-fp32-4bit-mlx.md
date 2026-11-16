# andre-atlas/Qwen3-4B-GPTQ-fp32-4bit-mlx

## Resumen

Qwen3-4B-GPTQ-fp32-4bit-mlx es una cuantizacion post-entrenamiento de 4 bits del modelo Qwen/Qwen3-4B, publicada por el desarrollador independiente andre-atlas (André Acioli) para su ejecucion en Apple Silicon mediante la libreria MLX. El artefacto forma parte del proyecto de investigacion Edge AI & Quantization, un estudio comparativo pre-registrado de tecnicas de cuantizacion (RTN, GPTQ, AWQ, DWQ y K-quants) sobre modelos pequenos de entre 0,6B y 4B parametros ejecutados en un dispositivo edge real.

El modelo base Qwen3-4B es un transformer denso de 4.022.468.096 parametros desarrollado por el equipo Qwen de Alibaba. Esta version cuantizada reduce el peso en disco de 8,06 GB a 2,37 GB (3,4 veces menos) manteniendo una perplexity en WikiText-2 de 14,26 frente a 13,66 del original fp16, es decir, una retencion de perplexity del 95,82 %. La precision media zero-shot en cinco tareas baja de 0,6837 a 0,6686.

Su relevancia actual reside en dos aspectos: por un lado, demuestra que la acumulacion de la matriz Hessiana en float32 durante el GPTQ evita los NaN que aparecen en la implementacion estandar de mlx-lm 0.32.2 con modelos de 3B a 4B; por otro, ofrece un artefacto listo para desplegar en portatiles Apple con memoria unificada de 24 GB, un escenario de inferencia local cada vez mas comun.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ 4 bits, group size 64; embeddings en 6 bits, group size 64 |
| Idiomas soportados | no disponibles (evaluado unicamente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GPTQ capa por capa del transformer denso Qwen3-4B. La innovacion tecnica principal es la acumulacion de la matriz Hessiana (XᵀX) en float32 en lugar de bfloat16, que es el comportamiento por defecto de mlx-lm 0.32.2. Segun el autor, en modelos de 3B a 4B el redondeo en bfloat16 hace que la Hessiana de algunas capas tardias pierda la semidefinicion positiva y el modelo cuantizado devuelve perplexity NaN; con la acumulacion en float32 los 10 trabajos del estudio (4 y 3 bits, 5 modelos) completaron sin ningun NaN. Se aplico un damping del 1 %.

La calibracion utilizo los datos por defecto de mlx-lm, con secuencias de 512 tokens y semilla 0. El proceso de cuantizacion tardo 939 segundos en un MacBook Pro con Apple M5 Pro y 24 GB de memoria unificada, ejecutando mlx-lm 0.32.2 y mlx 0.32.4. No se dispone de informacion sobre el dataset de preentrenamiento del modelo base ni sobre si este recibio RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3-4B.
- Razonamiento y matematicas: el modelo base Qwen3 incorpora modos de razonamiento, aunque la model card de esta cuantizacion no documenta su comportamiento especifico tras la cuantizacion.
- Generacion de codigo: capacidad propia de la familia Qwen3, no evaluada de forma especifica en esta ficha.
- Tool calling y function calling: no documentado en la informacion disponible para esta version cuantizada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; la evaluacion se realizo unicamente en ingles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en portatiles Apple Silicon: el modelo ocupa 2,37 GB en disco y cabe holgadamente en equipos con 16 GB o 24 GB de memoria unificada, lo que permite ejecutar un LLM de 4B sin GPU dedicada ni conexion a la nube.
- Prototipado rapido de asistentes conversacionales: con `mlx_lm.generate` o la API de Python de mlx-lm se puede montar un chatbot de linea de comandos o integrado en una app macOS en pocas lineas, usando el modelo como motor de generacion de texto.
- Evaluacion de tecnicas de cuantizacion: sirve como artefacto de referencia reproducible para investigadores que quieran comparar GPTQ con Hessiana fp32 frente a RTN, AWQ o K-quants en el mismo dispositivo, ya que el proyecto documenta la metodologia y los resultados.
- Procesamiento de texto por lotes en local: tareas de resumen, reescritura o extraccion de informacion sobre documentos que no pueden salir del dispositivo por requisitos de privacidad, ejecutadas sobre hardware de consumo.
- Educacion y experimentacion: permite a estudiantes reproducir un pipeline completo de cuantizacion post-entrenamiento en un Mac sin infraestructura de GPU, con tiempos de cuantizacion de unos 15 minutos.
- Base para ajuste fino ligero en edge: al ser un checkpoint MLX de 4 bits, puede servir como punto de partida para experimentos de adaptacion (LoRA/QLoRA) en Apple Silicon, aunque no se documenta soporte oficial para ello.

## Benchmarks y rendimiento

| Metrica | fp16 (original) | Este modelo (GPTQ 4-bit) |
|---|---|---|
| Tamano en disco | 8,06 GB | 2,37 GB (3,4x menor) |
| Perplexity WikiText-2 (menor es mejor) | 13,66 | 14,26 |
| Precision media zero-shot, 5 tareas | 0,6837 | 0,6686 |
| Retencion de perplexity (PPL fp16 / PPL cuantizado) | 1,000 | 0,9582 |

Las cinco tareas de precision son ARC-Easy, ARC-Challenge, HellaSwag, PIQA y Winogrande, evaluadas con lm-eval en zero-shot. La perplexity se midio sobre el conjunto de test de WikiText-2 con ventanas de 2.048 tokens. Mediciones realizadas en un MacBook Pro con Apple M5 Pro, 24 GB de memoria unificada, mlx-lm 0.32.2 y mlx 0.32.4. No se han publicado resultados de benchmarks especificos de codigo o matematicas (HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: aproximadamente 2,4 GB solo para los pesos en 4 bits; con la cache KV y overhead de runtime, un presupuesto de 4 a 6 GB de memoria unificada es suficiente para contextos moderados.
- GPU recomendadas: exclusivamente Apple Silicon (serie M1, M2, M3, M4, M5). El autor midio en un Apple M5 Pro con 24 GB. No es compatible con CUDA ni con GPU de NVIDIA o AMD.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada; el escenario comodo es 16 GB o mas.
- Opciones de despliegue: mlx-lm (libreria oficial), con CLI `mlx_lm.generate` y API de Python `mlx_lm.load` / `mlx_lm.generate`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es especifico de MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo reporta el tiempo de cuantizacion (939 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-GPTQ-fp32-4bit-mlx (este) | 4,02B | no disponible | Apache-2.0 | safetensors MLX | Cuantizado GPTQ 4-bit, solo Apple Silicon |
| Qwen/Qwen3-4B (original) | 4,02B | no disponible | Apache-2.0 | safetensors | fp16/bf16, requiere ~8 GB, multiplataforma |
| Otras cuantizaciones del estudio Edge AI & Quantization (RTN, AWQ, DWQ, K-quants) | 0,6B-4B | no disponible | Apache-2.0 (heredada) | MLX | Comparativas del mismo proyecto; resultados no detallados en esta ficha |

No se dispone de datos de benchmarks de modelos alternativos de terceros en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con otras familias de 4B.

## Limitaciones y advertencias

- Dependencia de plataforma: solo funciona con MLX en Apple Silicon; no es portable a CUDA, ROCm ni CPU generica sin reconversion.
- Perdida de calidad por cuantizacion: la perplexity sube de 13,66 a 14,26 y la precision media zero-shot cae 1,5 puntos porcentuales; en tareas sensibles a precision (matematicas, codigo) el deterioro puede ser mayor y no esta medido.
- Evaluacion limitada: los resultados provienen de una unica semilla de calibracion y se evaluaron solo en ingles; el comportamiento multilingue no esta verificado.
- Sesgos y alucinaciones: hereda todos los sesgos y limitaciones del modelo base Qwen3-4B, no documentados en esta model card.
- Contexto: la longitud de contexto del modelo base no se detalla en la informacion disponible, por lo que no se puede garantizar el comportamiento en ventanas largas tras la cuantizacion.
- Licencia: Apache-2.0 permite uso comercial, pero se debe mantener la atribucion al modelo base Qwen/Qwen3-4B y al autor de la cuantizacion.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- Sin soporte de tooling estandar: al no ser compatible con vLLM, llama.cpp u Ollama, la integracion en pipelines de produccion convencionales requiere adaptadores propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andre-atlas/Qwen3-4B-GPTQ-fp32-4bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Proyecto de investigacion Edge AI & Quantization: https://github.com/Andre-Atlas/edge-ai-quantization
- Documentacion del diagnostico de la Hessiana en float32: https://github.com/Andre-Atlas/edge-ai-quantization/blob/main/experimentos/LOGICA-QUANTIZACAO.md
- Perfil del autor: https://github.com/Andre-Atlas
