# DhruvParmar051/syrinx-10m

## Resumen

Syrinx-10m es un modelo de lenguaje de tipo decoder-only con 11.798.784 parametros, desarrollado por el usuario DhruvParmar051, entrenado desde cero sobre el corpus TinyStories (historias infantiles sinteticas cortas). Es el primero de una serie de escalado de tres modelos (10M, 50M y 125M) y su proposito declarado es validar de extremo a extremo el pipeline de entrenamiento, evaluacion y exportacion antes de abordar tamanos mayores. No es un modelo de proposito general: es un banco de pruebas reproducible de un unico portatil.

Tecnicamente es un transformer causal con la arquitectura de `LlamaForCausalLM` (RMSNorm, RoPE, SwiGLU y embeddings atados), con 4 capas, dimension de modelo 256, 4 cabezas de atencion, dimension de feed-forward 768 y una ventana de contexto de 1024 tokens. El tokenizador es un BPE a nivel de byte con vocabulario de 32.768 entradas. Los pesos se distribuyen en safetensors en fp32.

Su relevancia no esta en el rendimiento (sus puntuaciones en benchmarks estan en torno al azar) sino en la trazabilidad: el autor documenta cada experimento con hashes SHA-256, verifica la paridad de exportacion con diferencia logit maxima de 0 y publica la perdida, la perplejidad y los bits por byte sobre el split de validacion completo. Es material util para quien quiera estudiar como se comporta un transformer minimo entrenado con recursos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, `LlamaForCausalLM` (RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 11.798.784 (3.410.176 no pertenecientes a embeddings) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no se distribuyen pesos cuantizados; solo fp32 safetensors (conversion a fp16/bf16, int8 o int4 posible por herramienta externa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32) |
| Capas / d_model / cabezas / d_ff | 4 / 256 / 4 / 768 |
| Vocabulario | 32.768 (BPE a nivel de byte) |
| RoPE theta / norm eps | 10000 / 1e-05 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal convencional con las decisiones de diseno de la familia Llama: normalizacion RMSNorm en lugar de LayerNorm, codificacion posicional rotatoria (RoPE con theta 10000), activacion SwiGLU en la MLP y embeddings de entrada y salida atados. Con solo 4 capas y 256 dimensiones de modelo, la mayor parte del presupuesto de parametros (aproximadamente 8,4 millones de los 11,8 totales) reside en la matriz de embeddings y su proyeccion de salida, dado el vocabulario de 32.768 tokens.

El entrenamiento uso el dataset TinyStories, un corpus de historias infantiles sinteticas cortas, y consumio 294.912.000 tokens a lo largo de 9.000 pasos de 32.768 tokens cada uno. El optimizador fue AdamW con tasa de aprendizaje maxima de 0.001 y minima de 0.0001, 200 pasos de calentamiento, decaimiento coseno y weight decay de 0.1. Se entreno con autocast en bf16 sobre una GPU integrada de un Apple M5 Pro (20 nucleos de GPU, 48 GB de memoria unificada) usando el backend MPS de PyTorch, en un tiempo total de 2,48 horas. La perdida final de entrenamiento fue 1.5620 y la de validacion 1.5725 (estimacion durante el entrenamiento). No se aplicaron fases de RLHF, DPO ni ajuste por instrucciones: es un modelo base.

La innovacion metodologica, mas que arquitectonica, es la verificacion de paridad en la exportacion: la diferencia absoluta maxima de logits entre los pesos exportados y la implementacion de referencia de Syrinx es 0, con tolerancia 0.0001. El autor tambien documenta un analisis de contaminacion basado en coincidencias de 13-gramas con los datos de entrenamiento, con recuento de ejemplos contaminados por benchmark.

## Capacidades

- Generacion de texto: continuacion de texto autoregresiva en ingles, orientada a narraciones infantiles cortas y simples.
- Conocimiento del dominio TinyStories: vocabulario y sintaxis de cuentos infantiles sinteticos; personajes, objetos y acciones tipicas de ese corpus.
- Modelo base sin ajuste por instrucciones: no sigue ordenes, no responde preguntas de forma fiable ni ejecuta tareas guiadas por prompt.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente, razonamiento multi-paso planificado ni uso de herramientas.
- Sin modo de pensamiento (thinking), sin vision, sin audio y sin otras modalidades.
- Multilingue: no; unicamente ingles.
- Generacion con `generate` usando la `generation_config` incluida; el decodificado voraz tiende a entrar en bucles, por lo que se recomienda muestreo.

## Casos de uso

- Estudio didactico de entrenamiento de transformers: el modelo permite reproducir de principio a fin un ciclo de entrenamiento, evaluacion, analisis de contaminacion y exportacion en un unico portatil, con los artefactos y hashes documentados como referencia.
- Validacion de pipelines de exportacion y paridad numerica: sirve como caso de prueba para comprobar que una implementacion propia replica exactamente los logits de un modelo de referencia (diferencia maxima documentada de 0).
- Banco de pruebas de cuantizacion y herramientas de inferencia: por su tamano, es util para verificar conversiones a GGUF, integraciones con llama.cpp u Ollama y mediciones de perplejidad y bits por byte antes y despues de cuantizar.
- Generacion de cuentos infantiles sinteticos en ingles: puede producir narraciones cortas y simples coherentes con el estilo TinyStories, util como generador de datos sinteticos de baja complejidad para experimentos.
- Docencia y divulgacion sobre modelos de lenguaje: su tamano permite inspeccionar pesos, activaciones y atencion en un cuaderno interactivo sin necesidad de GPU dedicada.
- Comparativa de tokenizadores mediante bits por byte: al publicar la metrica de bits por byte (0,5769) ademas de la perplejidad, permite comparaciones entre tokenizadores distintos de forma metodologicamente correcta.
- Pruebas de regresion en infraestructura de inferencia: sirve como modelo minimo para validar despliegues con transformers, text-generation-inference o vLLM (compatibles con `LlamaForCausalLM`) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

Evaluados con lm-evaluation-harness 0.4.13, en modo 0-shot, precision float32, con `<|endoftext|>` antepuesto. La columna "limpio" excluye ejemplos que comparten un 13-grama con los datos de entrenamiento y ejemplos demasiado cortos para comprobarse. El error indicado es el error estandar binomial.

| Benchmark | Metrica | Todos | Limpio | Contaminado | Azar |
|---|---|---|---|---|---|
| HellaSwag | acc_norm | 25,9% ± 0,4 (n=10.042) | 25,9% ± 0,4 (n=10.002) | 22,5% ± 6,6 (n=40) | 25,0% |
| ARC-Easy | acc | 27,0% ± 0,9 (n=2.376) | 27,2% ± 0,9 (n=2.278) | 4,5% ± 4,4 (n=22) | 25,0% |
| PIQA | acc_norm | 53,0% ± 1,2 (n=1.838) | 53,5% ± 1,2 (n=1.682) | 33,3% ± 27,2 (n=3) | 50,0% |
| LAMBADA (OpenAI) | acc | 7,8% ± 0,4 (n=5.153) | 7,8% ± 0,4 (n=5.153) | n/a | n/a |

Metricas de validacion sobre el split completo, ventanas no solapadas de 1024 tokens (2.073.600 tokens objetivo, 8.110.848 bytes), con autocast bf16:

| Perdida (nats/token) | Perplejidad | Bits por byte |
|---|---|---|
| 1,5641 | 4,78 | 0,5769 |

El propio autor advierte de que las puntuaciones de benchmark estan cerca del azar y se publican por completitud, no como evidencia de capacidad. No se proporcionan resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 47,2 MB (11.798.784 parametros x 4 bytes).
- Pesos en fp16 o bf16: aproximadamente 23,6 MB.
- Pesos en int8: aproximadamente 11,8 MB; en int4: aproximadamente 5,9 MB.
- Cache KV: con 1024 tokens de contexto, 4 capas, 4 cabezas y dimension de cabeza 64, el cache completo en fp16 ocupa unos 4 MB (unos 4 KB por token); en fp32, unos 8 MB.
- GPU recomendadas: no se requiere GPU. Cabe con holgura en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU. La VRAM total necesaria en fp32 con contexto completo ronda las decenas de megabytes, muy por debajo de cualquier tarjeta actual.
- Inferencia en CPU: viable y suficiente para uso interactivo dado el tamano del modelo.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada); text-generation-inference y endpoints compatibles segun las etiquetas del repositorio; vLLM es aplicable porque la arquitectura es `LlamaForCausalLM`. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, ya que el repositorio solo distribuye safetensors en fp32.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

El autor indica explicitamente que no realiza comparaciones con otros modelos porque las puntuaciones publicadas usan datos de entrenamiento, recuentos de tokens, tokenizadores y prompts distintos, y por tanto no serian comparables en igualdad de condiciones. No hay datos de benchmarks de terceros en la informacion disponible.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| syrinx-10m | 11.798.784 | 1024 | safetensors fp32 | apache-2.0 | HuggingFace (0 descargas) |
| syrinx-50m (serie del mismo autor) | no disponible | no disponible | no disponible | no disponible | anunciado, no publicado en la informacion disponible |
| syrinx-125m (serie del mismo autor) | no disponible | no disponible | no disponible | no disponible | anunciado, no publicado en la informacion disponible |
| Modelos de la familia TinyStories (Eldan y Li) | no disponible | no disponible | no disponible | no disponible | referencia de dataset, no de comparativa de rendimiento |

No disponible para el resto de alternativas de la misma categoria.

## Limitaciones y advertencias

- Entrenado exclusivamente con TinyStories: su conocimiento del mundo fuera de cuentos infantiles simples es practicamente nulo; no responde preguntas ni afirma hechos de forma fiable.
- Es un modelo base, sin ajuste por instrucciones ni ajuste de seguridad: no sigue ordenes y las salidas pueden ser incoherentes, repetitivas o erroneas.
- Riesgo alto de alucinacion si se usa fuera de su dominio: no dispone de conocimiento factual verificable.
- El decodificado voraz tiende a entrar en bucles; se recomienda usar los ajustes de muestreo incluidos en la `generation_config`.
- Limitaciones de idioma: solo ingles. No hay soporte multilingue declarado.
- Limitacion de contexto: 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible. Al entrenarse con un corpus sintetico de historias infantiles, cabe esperar un sesgo de dominio muy marcado, pero no hay evaluacion publicada al respecto.
- Licencia apache-2.0: permite uso comercial de codigo y pesos con atribucion. Los datos de TinyStories se usan bajo CDLA-Sharing-1.0 y no se redistribuyen; quien reutilice el modelo debe tener en cuenta las condiciones del dataset si pretende redistribuir datos derivados.
- Puntuaciones de benchmark cercanas al azar (HellaSwag 25,9% frente a 25,0% de azar; ARC-Easy 27,0% frente a 25,0%; PIQA 53,0% frente a 50,0%; LAMBADA 7,8%): no debe utilizarse como modelo de razonamiento ni de conocimiento general.
- Uso en produccion: no apto para tareas de usuario final, atencion al cliente, generacion de codigo o cualquier aplicacion que requiera instrucciones, verificacion factual o coherencia sostenida.
- Advertencia sobre la autoria y las fechas: el repositorio tiene 0 descargas y 1 "like" en el momento de la consulta, y las fechas de creacion indicadas (2026) no han podido contrastarse por medios independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DhruvParmar051/syrinx-10m
- Dataset TinyStories (usado en el entrenamiento): https://huggingface.co/datasets/roneneldan/TinyStories
- Los identificadores de experimentos citados en la model card (EXP-012, EXP-014, EXP-015, EXP-016, EXP-017) apuntan a ficheros dentro del propio repositorio; los hashes SHA-256 correspondientes estan listados en la seccion "Evidence" de la model card.
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo, demos o articulos adicionales.
