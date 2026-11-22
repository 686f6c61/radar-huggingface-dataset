# DhruvParmar051/syrinx-10m

## Resumen

Syrinx-10m es el modelo mas pequeno de la serie Syrinx, una familia de transformers decoder-only entrenados desde cero por DhruvParmar051 sobre el corpus TinyStories (relatos infantiles sinteticos cortos). Con 11.798.784 parametros totales (3.410.176 no pertenecientes a embeddings), su proposito declarado no es competir en capacidades, sino validar de extremo a extremo el pipeline de entrenamiento, evaluacion y exportacion de la serie, que se completa con variantes de 50M y 125M.

La arquitectura sigue el esquema `LlamaForCausalLM` (RMSNorm, RoPE, SwiGLU y embeddings atados), con 4 capas, dimension de modelo 256, 4 cabezas de atencion, dimension feed-forward de 768 y una ventana de contexto de 1024 tokens sobre un vocabulario byte-level BPE de 32.768 entradas. Se entreno durante 9.000 pasos (294.912.000 tokens vistos) en un portatil Apple M5 Pro con backend MPS de PyTorch, en 2,48 horas y con autocast en bf16.

Su relevancia es metodologica y reproducible: publica perdida, perplejidad, bits por byte, analisis de contaminacion por n-gramas y resultados de lm-evaluation-harness con intervalos de error, ademas de hashes SHA-256 de cada artefacto de evidencia. Es un modelo base sin ajuste por instrucciones ni por seguridad, pensado para generar cuentos infantiles simples y para estudiar el comportamiento de modelos muy pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer, `LlamaForCausalLM` (RMSNorm, RoPE, SwiGLU, embeddings atados) |
| Parametros totales | 11.798.784 (3.410.176 no-embedding) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |

Detalles adicionales de configuracion: 4 capas, d_model 256, 4 cabezas de atencion, d_ff 768, vocabulario de 32.768 (byte-level BPE), RoPE theta 10000, epsilon de normalizacion 1e-05.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only convencional de 4 capas con atencion multi-cabeza (4 cabezas de 64 dimensiones), normalizacion RMSNorm previa a cada subcapa, activacion SwiGLU en la MLP y codificacion posicional rotatoria (RoPE) con theta 10000. Los embeddings de entrada y la cabeza de salida estan atados, lo que reduce el recuento de parametros efectivos: de los 11,8M totales, solo 3,41M corresponden a pesos no-embedding, ya que la matriz de vocabulario (32.768 x 256) domina el presupuesto parametrico.

El entrenamiento uso exclusivamente el dataset TinyStories (Eldan y Li) bajo licencia CDLA-Sharing-1.0, con 9.000 pasos de 32.768 tokens cada uno (294.912.000 tokens vistos), optimizador AdamW con LR pico 0.001 y LR minima 0.0001, 200 pasos de warmup, decaimiento coseno y weight decay 0.1, en precision bf16-autocast sobre un Apple M5 Pro (GPU de 20 nucleos, 48 GB de memoria unificada) mediante el backend MPS de PyTorch durante 2,48 horas. La perdida final de entrenamiento fue 1.5620 y la de validacion estimada durante el entrenamiento 1.5725. No se documenta RLHF, DPO ni ninguna fase de ajuste posterior: es un modelo base puro. La paridad de exportacion con la implementacion propia de Syrinx es exacta (diferencia absoluta maxima de logits de 0 frente a una tolerancia de 0.0001).

## Capacidades

- Generacion de texto autoregresiva en ingles, limitada a continuaciones de estilo cuento infantil simple.
- Continuacion de texto a partir de un prefijo; el token `<|endoftext|>` debe preceder a los prompts porque los documentos de entrenamiento siempre terminaban con el.
- Generacion con muestreo (la decodificacion greedy tiende a entrar en bucles segun la model card).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision, audio ni ninguna modalidad adicional.
- Multilingue: no; solo ingles.
- No es un modelo instruido: no sigue instrucciones, no responde preguntas de forma fiable ni mantiene dialogos.

## Casos de uso

- Validacion de pipelines de entrenamiento: sirve como caso de prueba de extremo a extremo para verificar tokenizacion, bucle de entrenamiento, evaluacion, exportacion a safetensors y paridad numerica entre implementaciones, gracias a que publica hashes y resultados de paridad con diferencia de logits cero.
- Estudio de escalado de modelos pequenos: al ser la primera pieza de una serie de 10M/50M/125M, permite trazar curvas de perdida y perplejidad frente a tamano y tokens vistos en un entorno reproducible de un solo portatil.
- Docencia e investigacion sobre transformers: con 4 capas y 256 dimensiones, es viable inspeccionar pesos, activaciones y mapas de atencion en hardware de consumo y explicar el funcionamiento interno de un decoder-only sin la complejidad de modelos grandes.
- Generacion de cuentos infantiles sinteticos: su unico dominio de entrenamiento es TinyStories, por lo que puede producir relatos cortos y simples en ingles para pruebas de sistemas de generacion, prototipos de narrativa o datos sinteticos de baja exigencia.
- Pruebas de infraestructura de inferencia: util para validar integraciones con `transformers`, text-generation-inference o endpoints compatibles antes de desplegar modelos mayores, dado su bajo coste computacional.
- Referencia para analisis de contaminacion: el modelo publica un metodo de deteccion por n-gramas compartidos (13-gramas) con subconjuntos "clean" y "contaminated", reutilizable como plantilla para auditar otros modelos entrenados sobre corpus pequenos.
- Experimentacion educativa con decodificacion: permite comparar estrategias de muestreo frente a greedy y observar bucles y degeneraciones tipicas de modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados por el autor con lm-evaluation-harness 0.4.13, 0-shot, float32 y `<|endoftext|>` antepuesto. El error indicado es el error estandar binomial.

| Benchmark | Metrica | Todos | Clean | Contaminado | Azar |
|---|---|---|---|---|---|
| HellaSwag | acc_norm | 25,9% ± 0,4 (n=10.042) | 25,9% ± 0,4 (n=10.002) | 22,5% ± 6,6 (n=40) | 25,0% |
| ARC-Easy | acc | 27,0% ± 0,9 (n=2.376) | 27,2% ± 0,9 (n=2.278) | 4,5% ± 4,4 (n=22) | 25,0% |
| PIQA | acc_norm | 53,0% ± 1,2 (n=1.838) | 53,5% ± 1,2 (n=1.682) | 33,3% ± 27,2 (n=3) | 50,0% |
| LAMBADA (OpenAI) | acc | 7,8% ± 0,4 (n=5.153) | 7,8% ± 0,4 (n=5.153) | n/a | n/a |

Metricas de validacion propias (split completo, ventanas no solapadas de 1024 tokens, 2.073.600 tokens objetivo, bf16-autocast):

| Metrica | Valor |
|---|---|
| Perdida (nats/token) | 1,5641 |
| Perplejidad | 4,78 |
| Bits por byte | 0,5769 |

Los resultados de benchmarks estan cerca del azar y el propio autor los presenta como informativos, no como evidencia de capacidad. El autor no realiza comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 47 MB solo para pesos (11,8M parametros x 4 bytes), mas activaciones y cache KV; en la practica cabe en cualquier GPU con mas de 1 GB.
- En bf16/fp16: aproximadamente 24 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3050 o superior, GTX 1660, etc.); tambien funciona en CPU y en Apple Silicon con MPS.
- Cabe holgadamente en GPU consumer; de hecho se entreno en la GPU integrada de un Apple M5 Pro.
- Opciones de despliegue: `transformers` (referencia oficial, con `dtype=torch.float32`), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se documentan pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa no oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

El autor declara explicitamente que no realiza comparaciones con otros modelos porque las puntuaciones publicadas usan datos, tokens, tokenizadores y prompts distintos. Se ofrece a continuacion una comparacion estructural, sin datos de rendimiento comparables.

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia |
|---|---|---|---|---|
| Syrinx-10m | 11,8M (3,4M no-embedding) | 1024 | TinyStories | Apache-2.0 |
| TinyStories-1M (variantes de la literatura) | ~1M-33M segun variante | no disponible | TinyStories | no disponible |
| Modelos Llama de referencia | 7B-70B+ | 2048-128k | corpus web masivo | licencias propias |

No se dispone de comparaciones de rendimiento con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con TinyStories: su conocimiento del mundo se limita a cuentos infantiles simples; no responde preguntas ni afirma hechos de forma fiable.
- Modelo base sin ajuste por instrucciones ni por seguridad: las salidas pueden ser incoherentes, repetitivas o erroneas.
- La decodificacion greedy tiende a entrar en bucles; se recomienda muestreo con la `generation_config` incluida.
- Resultados de benchmarks cercanos al azar (HellaSwag 25,9%, ARC-Easy 27,0%, PIQA 53,0%, LAMBADA 7,8%); no debe usarse como evidencia de capacidad.
- Solo soporta ingles.
- Ventana de contexto de 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinacion alto por el reducido corpus y el tamano del modelo; no apto para produccion con requisitos de exactitud.
- Licencia Apache-2.0 para codigo y pesos, lo que permite uso comercial, pero el dataset TinyStories se usa bajo CDLA-Sharing-1.0 y no se redistribuye; conviene revisar las obligaciones de atribucion de dicha licencia si se generan datos derivados.
- No se documentan sesgos especificos; al entrenarse sobre cuentos sinteticos, puede reflejar los estereotipos presentes en ese corpus.
- No hay garantia de soporte a largo plazo ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DhruvParmar051/syrinx-10m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li): no disponible en la informacion proporcionada
- Repositorio de codigo de Syrinx: no disponible en la informacion proporcionada
- Demo o space: no disponible en la informacion proporcionada
