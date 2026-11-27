# mradermacher/Llama-3.1-8B-Thinking-SFT-i1-GGUF

## Resumen

Llama-3.1-8B-Thinking-SFT-i1-GGUF es una distribucion de cuantizaciones GGUF, generadas con imatrix, del modelo wesjos/Llama-3.1-8B-Thinking-SFT. No se trata de un modelo entrenado desde cero, sino de un derivado del Llama 3.1 8B de Meta al que se le ha aplicado un ajuste fino supervisado (SFT) orientado a razonamiento explicito y cadenas de pensamiento. El autor de las cuantizaciones es mradermacher, conocido por publicar versiones GGUF de modelos populares para su uso en llama.cpp y entornos de inferencia local.

El modelo base parte de la arquitectura transformer decoder-only de Llama 3.1, con 8.030.261.312 parametros totales y una ventana de contexto de 128.000 tokens (heredada de Llama 3.1). El ajuste fino se realizo sobre el dataset saidutta69/qwen-glm-kimi-distillation-clean, una destilacion de trazas de razonamiento generadas por modelos como Qwen, GLM y Kimi. El resultado es un modelo de 8B especializado en producir cadenas de pensamiento antes de responder, lo que lo hace util para tareas de razonamiento, matematicas y logica en entornos con recursos limitados.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo de razonamiento de 8B en hardware consumer mediante cuantizaciones de 1 a 6 bits. La licencia es Llama 3.1, lo que impone restricciones de uso comercial y de redistribucion. El idioma declarado es unicamente ingles, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (cuantizaciones) e imatrix; el modelo base en safetensors esta en wesjos/Llama-3.1-8B-Thinking-SFT |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atencion por grupos (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base wesjos/Llama-3.1-8B-Thinking-SFT fue ajustado con SFT (supervised fine-tuning) sobre el dataset saidutta69/qwen-glm-kimi-distillation-clean, que contiene trazas de razonamiento destiladas de modelos Qwen, GLM y Kimi. El objetivo del ajuste es que el modelo genere pasos intermedios de razonamiento (chain-of-thought) antes de emitir la respuesta final.

Las cuantizaciones de esta ficha se generaron con el metodo imatrix de llama.cpp, que calcula una matriz de importancia a partir de un corpus de calibracion para ponderar la cuantizacion de cada tensor. Esto permite obtener cuantizaciones de baja tasa de bits (IQ2, IQ3) con una perdida de perplejidad menor que las cuantizaciones estaticas equivalentes. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales; esos datos no estan disponibles.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de multi-turno.
- Razonamiento explicito mediante cadenas de pensamiento (thinking mode) antes de la respuesta final.
- Razonamiento matematico y logico de varios pasos, derivado del entrenamiento con trazas destiladas.
- Generacion de codigo basica, aunque no es una capacidad destacada en la model card.
- Capacidad de destilacion de razonamiento: el modelo fue entrenado para imitar trazas de modelos mayores.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni de vision o audio.
- Capacidades multilingues limitadas al ingles segun el campo `language`.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas de varios pasos generando primero la cadena de pensamiento y luego la respuesta, adecuado para entornos sin GPU de gama alta gracias a las cuantizaciones Q4_K_M e IQ4_XS.
- Prototipado de asistentes conversacionales en ingles: con 8B parametros y contexto largo heredado de Llama 3.1, permite mantener conversaciones multi-turno en una sola GPU consumer.
- Educacion y tutoria automatizada: el modo thinking permite mostrar al usuario el razonamiento paso a paso, util para explicar ejercicios de logica o algebra.
- Investigacion sobre destilacion de razonamiento: sirve como caso de estudio de como trazas de Qwen, GLM y Kimi se transfieren a un modelo Llama 3.1 8B mediante SFT.
- Evaluacion de cuantizaciones imatrix: el repositorio incluye 24 variantes de cuantizacion, lo que permite comparar calidad frente a tamano en un mismo modelo de razonamiento.
- Despliegue en entornos con RAM limitada: las variantes IQ2 e IQ3 permiten ejecutar el modelo en maquinas con 4-6 GB de RAM, a costa de degradar la calidad del razonamiento.
- Filtrado y clasificacion de texto con justificacion: el modelo puede emitir una justificacion razonada antes de asignar una categoria, util en pipelines de moderacion en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y el autor de las cuantizaciones no aporta metricas de perplejidad por variante.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): IQ2 ~2,7-3,2 GB; Q3_K_M ~3,8-4,3 GB; Q4_K_M ~4,9-5,5 GB; Q5_K_M ~5,8-6,4 GB; Q6_K ~6,7-7,3 GB; Q8 (no incluida en este repo) ~8,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las variantes Q4-Q6; A100 o H100 solo si se requiere throughput alto o contexto muy largo.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores. Las variantes IQ2 e IQ3 caben en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones de este repo estan pensadas para llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen del hardware, de la cuantizacion y de la longitud de la cadena de pensamiento generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Thinking-SFT-i1-GGUF (este) | 8,03B | 128k (heredado) | GGUF imatrix | llama3.1 | Cuantizaciones de un SFT de razonamiento sobre Llama 3.1 8B |
| Llama-3.1-8B-Instruct (Meta) | 8,03B | 128k | safetensors, GGUF | llama3.1 | Modelo oficial instructivo; no especializado en thinking |
| DeepSeek-R1-Distill-Llama-8B | 8,03B | 128k | safetensors, GGUF | llama3.1 | Destilacion de razonamiento de DeepSeek-R1 sobre Llama 3.1 8B; benchmarks publicados |
| Qwen2.5-7B-Instruct | 7,6B | 128k | safetensors, GGUF | Apache 2.0 | Alternativa con licencia permisiva y buen rendimiento en codigo y matematicas |

La comparacion con DeepSeek-R1-Distill-Llama-8B es la mas directa por tamano, base y objetivo (razonamiento destilado), pero no se dispone de benchmarks de este modelo para contrastar rendimiento. Qwen2.5-7B-Instruct ofrece una licencia mas permisiva (Apache 2.0) frente a la licencia Llama 3.1.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del Llama 3.1 base y de las trazas de destilacion de Qwen, GLM y Kimi; no se documenta ninguna mitigacion especifica.
- Riesgo de alucinacion: el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en cuantizaciones de 1-3 bits donde la calidad se degrada.
- Limitaciones de idioma: el modelo solo declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: la licencia llama3.1 impone condiciones de uso comercial, atribucion y restricciones de redistribucion; es obligatorio revisar los terminos de Meta antes de un despliegue en produccion.
- Cuantizaciones de muy baja tasa (IQ1, IQ2): pueden degradar gravemente la coherencia del razonamiento; se recomienda Q4_K_M o superior para tareas de thinking.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta la seleccion para produccion.
- Modelo derivado no oficial: no cuenta con el respaldo de Meta ni de los autores del modelo base; el soporte y las actualizaciones no estan garantizados.
- Fecha de creacion atipica (2026-11-27) en los metadatos del repositorio; conviene verificar la integridad de los archivos antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llama-3.1-8B-Thinking-SFT-i1-GGUF
- Modelo base: https://huggingface.co/wesjos/Llama-3.1-8B-Thinking-SFT
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Llama-3.1-8B-Thinking-SFT-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.1-8B-Thinking-SFT-i1-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/saidutta69/qwen-glm-kimi-distillation-clean
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
