# mavis-ai/Gemma4-26B-MoE-Q4T

## Resumen

Gemma4-26B-MoE-Q4T es una compilación cuantizada del modelo multimodal Gemma 4 26B A4B de Google, publicada por mavis-ai como derivado sin entrenamiento (data-free). Se trata de una arquitectura Mixture of Experts (MoE) con 128 expertos enrutados y 8 activos por token, 30 capas y un tamano de ocultacion de 2816, con una longitud de contexto de 262144 tokens. El checkpoint original es multimodal (image-text-to-text) e incluye una torre de vision.

La particularidad de esta version es su formato Q4T: los expertos enrutados se almacenan como tensores con codificacion trellis de 4 bits (K4) y el resto de proyecciones lineales en afin de 6 bits (N6), mientras que routers, normas y la torre de vision se mantienen en BF16. El paquete pesa 15,65 GB e incluye ademas dos drafters de decodificacion especulativa (MTP y DFlash) en 8 bits.

Es relevante porque demuestra una via de cuantizacion sin datos de calibracion orientada a Apple Silicon, pero con una advertencia importante: los expertos trellis requieren kernels especificos y el modelo no funciona en mlx-lm, mlx-vlm, transformers ni vLLM; solo se ejecuta en R.E.V.I.S. v1.3.0 o superior. El dato real de safetensors indica 9.237.780.046 parametros totales, en contraste con la denominacion comercial "26B" del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), 30 capas, hidden size 2816, 128 expertos enrutados con 8 activos |
| Parametros totales | 9.237.780.046 (segun safetensors); el nombre comercial del base es 26B |
| Parametros activos | 8 de 128 expertos enrutados (A4B en el nombre del base) |
| Longitud de contexto | 262144 tokens |
| Tipos de cuantizacion | Q4T: expertos enrutados trellis 4 bits (K4, tiles 16x16, codebook MCG, rotacion Hadamard 128 puntos); denso/atencion/embeddings afin 6 bits grupo 64 (N6); routers, normas, escalares y torre de vision en BF16; drafters en 8 bits afin (g64); KV cache en 8 bits en runtime |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (core + 6 shards de expertos trellis), con manifiestos JSON; drafters en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de 30 capas con hidden size 2816, 128 expertos enrutados y 8 activos por token, mas una torre de vision con su proyeccion multimodal. Esta compilacion no aplica ningun tipo de entrenamiento ni fine-tuning: es una cuantizacion puramente derivada del checkpoint BF16 oficial de Google.

La receta Q4T es fija y data-free: una anchura por clase de modulo elegida por regla escrita, sin conjunto de calibracion, sin redondeo Hessian, sin importance matrix y sin quantization-aware training. Los expertos enrutados se codifican como trellis 16x16 con 4 bits por peso, rotacion Hadamard de 128 puntos y vectores de signo por canal (suh, svh), minimizando el MSE sobre pesos rotados; la anchura de experto 704 no es multiplo de 128 y se almacena con padding a 768. El resto de lineales (proyecciones de atencion, MLP denso y embeddings de token con LM head atada) se cuantizan a 6 bits afin con grupo 64 mediante mx.quantize con redondeo al mas cercano. Los routers se mantienen en BF16 porque la seleccion top-k es una decision discontinua que no tolera cuantizacion. El paquete incluye drafters de decodificacion especulativa: un MTP Draft-Q8 con ProposalHead y un DFlash-Q8 de bloques, que suman 1,11 GB.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno con contexto de hasta 262144 tokens.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text) gracias a la torre de vision conservada en BF16.
- Razonamiento multi-paso y soporte de agentes, segun el uso previsto por el autor en R.E.V.I.S. como sistema cognitivo multiagente.
- Decodificacion especulativa integrada mediante drafters MTP y DFlash, que acelera la generacion en el motor de inferencia compatible.
- Capacidades multilingues: no disponible (no se detallan idiomas en la informacion proporcionada).
- Tool calling / function calling: no disponible (no se documenta explicitamente en la informacion proporcionada).

## Casos de uso

- Asistentes locales en Mac con Apple Silicon: el modelo esta empaquetado para R.E.V.I.S., un sistema cognitivo local, y su tamano de 15,65 GB permite ejecutarlo en equipos de sobremesa con memoria unificada amplia sin depender de la nube.
- Analisis de documentos e imagenes combinados: la torre de vision en BF16 y el contexto de 262144 tokens permiten procesar capturas, diagramas o paginas escaneadas junto a instrucciones largas en una sola sesion.
- Agentes multi-paso en local: la arquitectura MoE con 8 expertos activos reduce el coste computacional por token frente a un denso equivalente, lo que facilita cadenas de razonamiento y llamadas a herramientas dentro de un flujo agentico.
- Generacion asistida con decodificacion especulativa: los drafters MTP y DFlash incluidos permiten acelerar la inferencia en el motor R.E.V.I.S., util para tareas interactivas de chat o autocompletado.
- Prototipado de investigacion sobre cuantizacion trellis: el paquete incluye manifiestos (q4t_manifest.json, dense_n6_manifest.json, q4t-split-lineage.json) y checksums que permiten reproducir y auditar el proceso de cuantizacion sin datos.
- Despliegue de un modelo multimodal con licencia Apache 2.0 en entornos con requisitos de soberania de datos: al ejecutarse integramente en local, evita el envio de informacion sensible a servicios externos.
- Evaluacion comparativa de degradacion por cuantizacion: las metricas interim de KLD frente al BF16 permiten estudiar el impacto de distintas anchuras (Q8, Q6, Q5T, Q4T) sobre la distribucion de siguiente token.

## Benchmarks y rendimiento

La model card indica que la tabla de benchmarks definitiva esta intencionadamente vacia y que las cifras finales provendran de una unica ejecucion aun no disponible. Se recogen a continuacion unicamente las cifras interim publicadas, que son distancias de distribucion sobre un conjunto pequeno (48 documentos, 18.040 posiciones evaluadas) y no benchmarks de tarea.

| Armazon | KLD vs BF16 | Tamano de pesos |
|---|---:|---:|
| Q8 | 0.0110 | no disponible |
| Q5T | 0.0136 | 19.36 GB |
| Q6 | 0.0268 | 21.85 GB |
| Q4T (este repositorio) | 0.0373 | 15.64 GB |
| Q5 | no disponible (tabla truncada en la informacion) | no disponible |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 15,65 GB (14,6 GiB); con KV cache en 8 bits y contexto largo la huella crece de forma proporcional al numero de tokens en cache, por lo que se recomienda al menos 24-32 GB de memoria unificada para contextos moderados.
- GPU recomendadas: el formato esta orientado a Apple Silicon; no se documenta soporte para A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: no confirmado; el unico runtime compatible documentado es R.E.V.I.S. v1.3.0 o superior en Mac.
- Opciones de despliegue: exclusivamente R.E.V.I.S. v1.3.0 o superior. No es compatible con mlx-lm, mlx-vlm, transformers ni vLLM debido a los kernels trellis necesarios para decodificar los expertos.
- Latencia y throughput: no disponibles; la presencia de drafters MTP y DFlash sugiere aceleracion por decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma4-26B-MoE-Q4T (este) | 9.237.780.046 segun safetensors (base comercial 26B, MoE 8/128 activos) | 262144 | Q4T trellis + afin 6 bits | apache-2.0 | Solo R.E.V.I.S. v1.3.0+ |
| google/gemma-4-26B-A4B-it | no disponible en detalle | 262144 | BF16 | licencia Gemma 4 (enlazada) | Ecosistema estandar (transformers, etc.) |
| Versiones Q5T y Q3T del mismo autor | misma base | 262144 | Q5T (K5+N8) y Q3T (K3+N6) | apache-2.0 | Solo R.E.V.I.S. v1.3.0+ |

No se dispone de datos de rendimiento de tarea para comparar con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Compatibilidad muy restringida: el modelo no funciona en mlx-lm, mlx-vlm, transformers ni vLLM; requiere R.E.V.I.S. v1.3.0 o superior, lo que limita su portabilidad y su integracion en pipelines existentes.
- Los expertos enrutados estan codificados en trellis y necesitan kernels de decodificacion especificos; sin ellos los pesos no son utilizables.
- La cuantizacion Q4T es data-free y sin calibracion, por lo que la degradacion frente al BF16 esta medida solo de forma interim (KLD 0.0373 sobre 18.040 posiciones) y no existen aun benchmarks de tarea.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad factual en la informacion disponible; al ser un derivado del base, hereda los sesgos del checkpoint original de Google.
- Idiomas soportados no especificados; no se puede garantizar calidad multilingue sin evaluacion.
- La anchura de experto 704 se almacena con padding a 768, lo que introduce un pequeno sobredimensionamiento del almacenamiento.
- La licencia declarada es apache-2.0 con enlace a la licencia de Gemma 4 de Google; conviene verificar los terminos de uso comercial del modelo base antes de desplegarlo en produccion.
- El autor declara no tener derechos sobre el modelo subyacente y lo redistribuye como derivado cuantizado; no es un fine-tune y no se aplico entrenamiento alguno.
- El numero de parametros reportado por safetensors (9,24 mil millones) difiere de la denominacion comercial "26B", lo que puede inducir a error al planificar recursos.

## Enlaces

- Hugging Face: https://huggingface.co/mavis-ai/Gemma4-26B-MoE-Q4T
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web oficial de R.E.V.I.S.: https://mavis-ai.co.jp/revis/
- Actualizaciones en X: https://x.com/mavis_ai_jp
- Paper referenciado (arxiv:2602.06036): no disponible como enlace directo en la informacion
- Paper referenciado (arxiv:2607.02770): no disponible como enlace directo en la informacion
