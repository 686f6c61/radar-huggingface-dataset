# rapid-mlx/Hy4-flash-MLX-4bit

## Resumen

Hy4-flash-MLX-4bit es una cuantizacion comunitaria del modelo Hy4-flash de Tencent, publicada por el usuario rapid-mlx y orientada exclusivamente a Macs con Apple Silicon y memoria unificada de gran capacidad. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 218.938.886.165 parametros totales, distribuido originalmente en FP8 por Tencent bajo la licencia Tencent Hy License 1.0. Esta version reempaqueta los pesos en formato MLX y los recuantiza a 4-8 bits para poder ejecutarse en hardware de Apple mediante el runtime Rapid-MLX.

El interes de esta ficha radica en que documenta una de las pocas rutas practicas para ejecutar un modelo de mas de 200.000 millones de parametros en un equipo de sobremesa: no mediante GPU dedicadas, sino aprovechando la memoria unificada de un Mac con 128 GB o mas y dejando parte de las tablas Engram en SSD. El precio a pagar es un throughput muy bajo (7-8 tokens por segundo en un M3 Ultra) y la eliminacion de componentes del modelo original, como el codificador visual y el drafter DFly2.

Se trata, por tanto, de un artefacto de nicho: util para experimentacion local, evaluacion cualitativa y despliegues de un solo usuario en Apple Silicon, pero no para produccion con concurrencia. La model card reporta resultados de evaluacion y una comparacion de error de cuantizacion frente al original FP8, que se recogen mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capas densas, expertos compartidos y tablas Engram; cuantizacion GPTQ/round-to-nearest en MLX |
| Parametros totales | 218.938.886.165 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits GPTQ (expertos enrutados, group size 64), 5-6 bits (proyecciones down por capa), 8 bits (atencion, indexer, capa densa, expertos compartidos), 4 bits (tablas Engram), bf16 (embeddings y LM head) |
| Idiomas soportados | no disponible (la evaluacion incluye ingles, chino, japones, codigo, matematicas, ciencia y finanzas) |
| Licencia | Tencent Hy License, Version 1.0 (basada en Apache 2.0 con clausulas comerciales adicionales en la seccion 10) |
| Formato de pesos | safetensors en layout MLX, 2.747 tensores; 139 GB en disco, repo de 223,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con expertos enrutados, expertos compartidos, una capa densa y un mecanismo denominado Engram, cuyas tablas se leen desde SSD durante la inferencia en esta build. El modelo original de Tencent se distribuye en FP8; esta version deriva de el y aplica una recuantizacion selectiva: GPTQ con redondeo consciente de calibracion para las proyecciones gate y up de los expertos enrutados (4 bits, group size 64), redondeo al mas cercano para las proyecciones down (5 o 6 bits segun la capa), 8 bits para atencion, indexer, capa densa y expertos compartidos, y 4 bits para las tablas Engram. Los embeddings y el LM head se mantienen en bf16.

Los cambios respecto al original incluyen la eliminacion del codificador visual (ViT), del proyector MLP y de las capas del drafter DFly2, la reescritura de los shards en layout MLX y la conservacion sin cambios del tokenizer, la plantilla de chat y la configuracion de generacion. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) empleadas en el modelo base.

## Capacidades

- Generacion de texto conversacional y zero-shot mediante endpoint compatible con la API de OpenAI.
- Razonamiento de tipo thinking mode: la evaluacion se ejecuta con el modo de pensamiento activado.
- Razonamiento cientifico y de nivel avanzado (GPQA Diamond, MMLU-Pro).
- Matematicas con cadena de pensamiento (GSM8K en configuracion CoT).
- Generacion de codigo en modo instruct (MBPP+).
- Seguimiento de instrucciones (IFEval, metricas prompt e instruction, strict y loose).
- Capacidades multilingues parciales: la evaluacion cubre chino (C-Eval, CMMLU) ademas de ingles.
- Texto unicamente: esta build no incluye codificador visual ni drafter DFly2, por lo que no hay soporte de vision ni decodificacion especulativa.
- No se dispone de informacion sobre soporte de tool calling, function calling ni razonamiento agentico multi-paso en la documentacion proporcionada.

## Casos de uso

- Experimentacion local en Apple Silicon: un investigador con un Mac de 128 GB de memoria unificada puede ejecutar un MoE de 219.000 millones de parametros sin GPU dedicada, usando Rapid-MLX como servidor compatible con OpenAI.
- Evaluacion cualitativa de modelos de gran escala: util para comparar respuestas del modelo cuantizado frente al original FP8 en tareas de razonamiento y codigo, con la advertencia de que el throughput limita el volumen de pruebas.
- Generacion de codigo asistida en local: el modelo obtiene 97,5 de pass@1 en MBPP+ (80 muestras) y puede usarse en un flujo de un solo usuario para prototipado y revision, no para CI/CD con concurrencia.
- Razonamiento cientifico y matematico de referencia: con 86,7 en GPQA Diamond y 96,0 en GSM8K CoT en las muestras reportadas, sirve para validar pipelines de evaluacion o generar soluciones de referencia en dominios tecnicos.
- Procesamiento de texto en ingles y chino: las puntuaciones en C-Eval (83,3) y CMMLU (86,6) lo hacen adecuado para tareas bilingues de analisis y resumen en entornos de investigacion.
- Estudio de error de cuantizacion: el propio autor publica metricas de divergencia KL y acuerdo top-1 frente al FP8, lo que convierte este artefacto en un caso de estudio util para quien investigue el impacto de la cuantizacion agresiva en MoE grandes.
- Despliegue de un solo usuario con contexto largo: adecuado para asistentes personales o analisis de documentos largos en local, siempre que se acepte la latencia de 7-8 tok/s y se ejecute una peticion a la vez.

## Benchmarks y rendimiento

Resultados reportados por el autor para esta build, con thinking activado, plantilla de chat aplicada y decodificacion greedy:

| Benchmark | Muestras | Metrica | Puntuacion |
|---|---:|---|---:|
| GPQA Diamond (generativo) | 60 | exact match | 86,7 ± 4,4 |
| MMLU-Pro | 10 por asignatura (14 asignaturas) | exact match, 5-shot | 85,0 ± 2,9 |
| GSM8K (CoT) | 100 | exact match, 8-shot | 96,0 ± 2,0 |
| IFEval | 100 prompts | prompt strict / loose | 80,0 / 86,0 |
| IFEval | 100 prompts | instruction strict / loose | 86,5 / 91,4 |
| C-Eval (generativo) | 3 por asignatura | exact match | 83,3 |
| CMMLU (generativo) | 2 por asignatura | exact match | 86,6 |
| MBPP+ (instruct) | 80 | pass@1 | 97,5 ± 1,8 |

Error de cuantizacion frente al FP8 original (16 respuestas, 4.902 tokens):

| Metrica (16 respuestas) | Esta build |
|---|---:|
| KL mediana por token | 0,0006 nats |
| KL media por token | 0,21 nats |
| Acuerdo top-1 | 92,6% |
| Acuerdo top-1 con confianza FP8 > 90% | 99,4% |

Suelo de referencia (6 respuestas, 1.436 tokens): KL media de 0,25 nats y acuerdo top-1 del 90,7% para esta build, frente a 0,14 nats y 94,3% para el FP8 con ruido gaussiano de 1e-4 en los embeddings de entrada.

Rendimiento en M3 Ultra: 7-8 tok/s en una peticion unica greedy de hasta 400 tokens nuevos. Memoria Metal activa pico de aproximadamente 101,6 GB para una peticion (100,2 GB tras la carga) y 108,0 GB con cuatro generaciones largas concurrentes.

## Requisitos de hardware

- Memoria unificada: 128 GB o mas; el autor indica que unos 100 GB permanecen en memoria y las tablas Engram se leen desde SSD.
- Almacenamiento: aproximadamente 160 GB de SSD libre; el modelo ocupa 139 GB en disco.
- GPU recomendadas: Apple Silicon de gama alta; las mediciones se hicieron en un M3 Ultra. No se documenta soporte para A100, H100 ni RTX 4090, ya que el formato MLX es especifico de Apple Silicon.
- Cabe en GPU de consumo: si, en el sentido de que cabe en Macs de gama alta con memoria unificada; no se contempla su ejecucion en GPUs de consumo NVIDIA por el formato de pesos.
- Despliegue: runtime Rapid-MLX (version posterior a 1.1.0; hasta la siguiente release, instalar desde la rama main del repositorio de GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7-8 tok/s en peticion unica; se recomienda una peticion concurrente en Macs de 128 GB y cerrar aplicaciones que consuman mucha memoria.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. A continuacion se comparan unicamente los atributos conocidos de esta build frente a su modelo de origen:

| Modelo | Parametros | Formato | Cuantizacion | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Hy4-flash-MLX-4bit (esta build) | 218.938.886.165 | safetensors MLX | 4-8 bits mixta | Apple Silicon, 128 GB+ | Tencent Hy License 1.0 |
| tencent/Hy4-flash-FP8 | 218.938.886.165 | FP8 | FP8 | GPU con capacidad FP8 | Tencent Hy License 1.0 |

No se dispone de informacion sobre otros modelos de tamano o categoria equivalentes para establecer una comparativa adicional.

## Limitaciones y advertencias

- Throughput muy bajo: 7-8 tok/s en M3 Ultra limita cualquier uso interactivo o con concurrencia.
- Memoria: pico de 108 GB con cuatro generaciones concurrentes; en Macs de 128 GB hay que ejecutar una peticion a la vez y cerrar aplicaciones pesadas.
- Texto unicamente: se han eliminado el codificador visual, el proyector MLP y el drafter DFly2, por lo que no hay vision ni decodificacion especulativa.
- Error de cuantizacion: acuerdo top-1 del 92,6% frente al FP8 y KL media de 0,21 nats; el autor reconoce que el modelo es sensible a perturbaciones muy pequenas.
- Evaluaciones con muestras reducidas: varias suites usan subconjuntos (60 muestras en GPQA, 2-3 por asignatura en CMMLU y C-Eval), por lo que los intervalos de confianza son amplios.
- Idiomas: no se publica la lista oficial de idiomas soportados; la evidencia se limita a las suites de evaluacion en ingles y chino.
- Licencia: Tencent Hy License 1.0, basada en Apache 2.0 con terminos comerciales adicionales en la seccion 10; operar un negocio de Model-as-a-Service requiere licencia escrita separada de Tencent.
- Build no oficial: derivada de Hy4-flash de Tencent, sin afiliacion ni respaldo del autor original; posibles sesgos y alucinaciones del modelo base no estan documentados en esta model card.
- Dependencia de version: requiere Rapid-MLX posterior a 1.1.0 o la rama main del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rapid-mlx/Hy4-flash-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Runtime Rapid-MLX: https://github.com/raullenchai/Rapid-MLX
- Licencia: LICENSE incluida en el repositorio del modelo (Tencent Hy License, Version 1.0)
