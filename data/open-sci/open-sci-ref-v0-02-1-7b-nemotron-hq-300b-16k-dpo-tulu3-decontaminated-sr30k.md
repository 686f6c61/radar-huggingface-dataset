# open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-sr30k

## Resumen

open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-sr30k es un modelo de lenguaje de 1.714.377.728 parametros (~1,7B) publicado por la organizacion open-sci en Hugging Face. Se trata de un ajuste fino (SFT) del modelo ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated, entrenado con la libreria Llama Factory sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf. El pipeline declarado en Hugging Face es feature-extraction, aunque el modelo se distribuye como un checkpoint de transformers con pesos safetensors y codigo personalizado (custom_code).

El modelo forma parte de una cadena de entrenamiento orientada a la investigacion abierta en razonamiento: el nombre indica que el checkpoint base fue entrenado sobre 300B tokens con contexto de 16k, posteriormente sometido a DPO con datos tipo Tulu3 y decontaminado, y finalmente ajustado con supervisión sobre un dataset de razonamiento generado a partir de gpt-oss-120b (30k ejemplos en formato ShareGPT). El sufijo "sr30k" corresponde a ese ultimo stage de SFT.

La relevancia actual del modelo es limitada y muy especifica: se trata de un artefacto de investigacion con 15 descargas y 0 likes en el momento de la consulta, sin model card completa (el README es autogenerado por el Trainer y contiene secciones "More information needed"). No dispone de resultados de benchmarks publicados ni de especificaciones de contexto o idiomas declaradas por el autor. Es util como referencia reproducible de un pipeline de entrenamiento abierto, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Nemotron-H, segun el nombre del checkpoint base); detalles no disponibles |
| Parametros totales | 1.714.377.728 (~1,7B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | 16k segun el nombre del checkpoint base; no confirmado en la model card |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos detallados en la model card) |
| Formato de pesos | safetensors (repo de 3,4 GB), con custom_code y transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (tag "full", no LoRA) de un checkpoint de 1,7B parametros. El nombre del checkpoint base sugiere una arquitectura de la familia Nemotron-H, pero la model card no documenta la arquitectura interna, el tokenizador ni la composicion del corpus de preentrenamiento. El stage previo indicado en el nombre incluye un entrenamiento sobre 300B tokens con ventana de 16k, un paso de DPO con datos tipo Tulu3 y un proceso de decontaminacion; ninguno de estos detalles esta verificado en la documentacion disponible.

El stage documentado es el SFT final con Llama Factory sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf, un conjunto de 30k ejemplos de razonamiento en formato ShareGPT generados a partir de gpt-oss-120b. Los hiperparametros declarados son: learning rate 4e-05, batch total 128 (batch 1 x 32 dispositivos x 4 pasos de acumulacion), 5 epocas, scheduler coseno con warmup del 10%, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08) y semilla 42. El entrenamiento se ejecuto en 32 GPUs con Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva basica, heredada del checkpoint base de 1,7B.
- Razonamiento supervisado: el SFT se realizo sobre un dataset de razonamiento (Superior-Reasoning-SFT), por lo que el modelo esta orientado a producir cadenas de razonamiento en formato ShareGPT.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso mas alla del estilo de respuesta del dataset de SFT.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.
- El pipeline declarado en Hugging Face es feature-extraction, aunque los tags y el entrenamiento corresponden a generacion de texto; esta discrepancia no esta aclarada por el autor.

## Casos de uso

- Investigacion sobre pipelines de SFT: sirve como referencia reproducible de un entrenamiento completo con Llama Factory sobre un dataset de razonamiento de 30k ejemplos, con hiperparametros y versiones de framework documentados.
- Experimentos de destilacion de razonamiento: al estar entrenado sobre datos generados por gpt-oss-120b, permite estudiar como se transfiere estilo y estructura de razonamiento a un modelo de 1,7B.
- Evaluacion de decontaminacion: el nombre del checkpoint base incluye "decontaminated", lo que lo hace util para comparar el impacto de la limpieza de datos en benchmarks de razonamiento.
- Baseline en estudios academicos: con 1,7B parametros y pesos safetensors de 3,4 GB, es ligero para ejecutar en una sola GPU y servir como punto de comparacion frente a modelos mayores.
- Pruebas de infraestructura de inferencia: permite validar despliegues con transformers y custom_code antes de escalar a checkpoints mayores de la misma familia.
- Analisis de sesgos y alucinacion en modelos pequenos entrenados con datos sinteticos de razonamiento: util para medir la fidelidad de las cadenas de razonamiento generadas por un modelo de 1,7B.

## Benchmarks y rendimiento

El model-index declarado por el autor contiene una unica entrada (sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__open-sci-re-a9cddb06__sdpa-open-sci-steps) con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,4 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2 GB de pesos; en 4 bits, alrededor de 1 GB. No se distribuyen pesos GGUF oficiales, por lo que habria que generarlos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bf16 con contexto moderado; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: transformers con trust_remote_code (requerido por el tag custom_code); vLLM y TGI solo si el codigo personalizado es compatible, lo cual no esta verificado; llama.cpp u Ollama requeririan conversion a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci-ref-v0.02-1.7b-...-sr30k (este modelo) | 1,7B | 16k (segun nombre) | other | Hugging Face, 15 descargas |
| ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated (modelo base) | 1,7B | 16k (segun nombre) | no disponible | Hugging Face |
| Modelos de ~1,7B de proposito general (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-1,5B | 32k-128k | Apache 2.0 / Llama | Amplia disponibilidad |

La comparacion con modelos de proposito general es solo orientativa: no hay datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa. El modelo base y este SFT comparten tamano y contexto declarado; la diferencia es el stage de ajuste supervisado sobre datos de razonamiento.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, datos de entrenamiento y resultados estan marcadas como "More information needed".
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas.
- Licencia "other" sin terminos detallados: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: al ser un modelo de 1,7B ajustado sobre datos sinteticos de razonamiento, es previsible que genere cadenas de razonamiento plausibles pero incorrectas; no hay evaluaciones que lo cuantifiquen.
- Sesgos: no documentados; el dataset de SFT deriva de un modelo mayor (gpt-oss-120b) y puede heredar sus sesgos.
- Idiomas: no declarados; no se garantiza un rendimiento multilingue.
- Contexto: los 16k se infieren del nombre del checkpoint base, no de una especificacion confirmada; el comportamiento mas alla de esa ventana no esta documentado.
- Dependencia de custom_code: requiere trust_remote_code en transformers, lo que implica ejecutar codigo del autor; revisar antes de usar en entornos sensibles.
- Discrepancia de pipeline: declarado como feature-extraction aunque entrenado para generacion; conviene verificar la configuracion antes de integrarlo.
- Proyecto de muy baja adopcion (15 descargas, 0 likes): sin mantenimiento ni soporte comunitario documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/open-sci-ref-v0.02-1.7b-nemotron-hq-300B-16k-DPO-Tulu3-decontaminated
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web.
