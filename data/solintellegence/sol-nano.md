# solintellegence/sol-nano

## Resumen

Sol Nano es un modelo de lenguaje de tipo base (causal-lm) desarrollado por solintellegence (Sol Labs) y publicado en Hugging Face. Se trata de un modelo extremadamente pequeno: 2.895.188 parametros en precision FP32, con una ventana de contexto de 512 tokens y un vocabulario de solo 1.024 entradas. Su interes no reside en la calidad de generacion, sino en la arquitectura que implementa, denominada Sol Lite (`SolForCausalLM`), que combina atencion causal con grouped-query attention, normalizacion QK, codificacion posicional RoPE, condicionamiento por bucle (loop conditioning) y un modulo de memoria local factorizada llamado TN-Gram para ordenes 2 a 5.

El modelo fue entrenado desde cero sobre 5.000 millones de tokens con una mezcla fuertemente orientada a matematicas: FineWeb-Edu, FineMath, OpenWebMath, texto matematico generado, texto procedimental derivado de Cosmopedia-v2, ciencia fisica y codigo Python de CoRNStack. El entrenamiento se realizo en una unica GPU RTX PRO 6000 Blackwell Server Edition con BF16 y estados del optimizador en FP32, a lo largo de 19.074 actualizaciones del optimizador.

Es relevante ahora como pieza de investigacion reproducible a escala minima: permite estudiar el efecto de la memoria TN-Gram, del apilamiento con reutilizacion de bloques (10 bloques almacenados, 14 aplicaciones efectivas) y del uso de un tokenizador de 1.024 entradas, todo ello con un coste de entrenamiento e inferencia accesible. No es un modelo apto para produccion: es un modelo base sin ajuste por instrucciones, solo en ingles y con resultados de benchmark propios de su escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sol Lite `SolForCausalLM` (transformer causal con GQA, RoPE, QK normalization, loop conditioning y memoria TN-Gram) |
| Parametros totales | 2.895.188 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32; no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors FP32 (`model.safetensors`, 11.591.920 bytes) |
| Parametros del modulo TN-Gram | 209.748 |
| Anchura oculta (hidden width) | 128 |
| Anchura de la FFN | 536 |
| Cabezas de consulta / cabezas KV | 4 / 2 |
| Vocabulario | 1.024 |
| Bloques almacenados / aplicaciones efectivas | 10 / 14 |
| Tokens de entrenamiento | 5.000.000.000 |
| Actualizaciones del optimizador | 19.074 |
| Tamano del repo en Hugging Face | 0,0 GB (reportado por la plataforma) |

## Arquitectura y entrenamiento

La arquitectura sigue el patron de un transformer causal de tipo decoder, con atencion grouped-query (4 cabezas de consulta frente a 2 cabezas de clave-valor), RoPE para la codificacion posicional, normalizacion QK y condicionamiento por bucle. El modelo almacena 10 bloques pero los aplica de forma efectiva 14 veces, lo que implica reutilizacion de parametros (weight sharing entre iteraciones). Los embeddings de tokens comparten pesos con la cabeza de salida (weight tying), lo que reduce el recuento de parametros. Sobre esta base se anade TN-Gram, un mecanismo de memoria local factorizada que modela dependencias de orden 2 a 5 y que aporta 209.748 de los 2.895.188 parametros totales.

El entrenamiento cubrio 5.000 millones de tokens con una mezcla de datos que varia por fases. La fase inicial (aproximadamente 0-1.333 millones de tokens) uso 65% FineWeb-Edu, 7,5% FineMath, 4,5% OpenWebMath, 3% matematicas generadas, 12% texto procedimental, 4% ciencia fisica y 4% codigo. La fase principal (aproximadamente 1.400-4.500 millones de tokens) rebalanceo hacia 45% FineWeb-Edu, 20% FineMath, 12% OpenWebMath, 8% matematicas generadas, 8% procedimental, 3% ciencia fisica y 4% codigo. En el ultimo 10% de pasos del optimizador la mezcla paso a 30% FineWeb-Edu, 30% FineMath, 20% OpenWebMath, 10% matematicas generadas, 4% procedimental, 2% ciencia fisica y 4% codigo, con umbrales de calidad de al menos 3,5 en las puntuaciones de FineWeb-Edu y de al menos 4,5 en FineMath. Una rampa de 66,85 millones de tokens conecta las fases inicial y principal.

El optimizador fue Fused AdamW en BF16 con estados en FP32, con una tasa de aprendizaje maxima de 0,001 y un scheduler WSD (warmup lineal durante el 2% inicial de los pasos, tasa estable hasta el 90% y decaimiento lineal a cero en el 10% final). Cada actualizacion del optimizador contenia 512 secuencias de 512 tokens (262.144 tokens por paso). Los procesos de CPU se encargaban de la descarga y tokenizacion en streaming mientras la GPU entrenaba. El stack fue PyTorch 2.11.0+cu130 y Triton 3.6.0. No se menciona ninguna fase de RLHF, DPO o ajuste por instrucciones: es un modelo estrictamente preentrenado.

## Capacidades

- Generacion de texto por continuacion (text completion) en ingles, sin modo conversacional ni seguimiento de instrucciones.
- Razonamiento aritmetico basico a nivel de continuacion: el modelo fue entrenado con una mezcla con fuerte peso de matematicas y evaluado con ArithMark-3.
- Modelado de dependencias locales de orden 2 a 5 mediante el modulo TN-Gram, orientado a contextos cortos.
- Manejo de contexto de hasta 512 tokens, con todas las candidatas de evaluacion procesadas sin truncamiento.
- Vocabulario reducido de 1.024 entradas, que lo hace util como banco de pruebas de tokenizacion de baja cardinalidad.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso orquestado.
- No es multilingue: unicamente ingles.
- No tiene modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Investigacion sobre memoria local factorizada: permite reproducir y ablacionar el modulo TN-Gram (209.748 parametros, ordenes 2-5) en un modelo de 2,9 M de parametros entrenado sobre 5.000 millones de tokens, con el coste de un solo equipo.
- Estudio de transformers con reutilizacion de bloques: la configuracion de 10 bloques almacenados y 14 aplicaciones efectivas sirve para medir el efecto del loop conditioning y del weight sharing en calidad y coste.
- Banco de pruebas de kernels de atencion: la implementacion de referencia requiere CUDA con Triton y FlexAttention (`SOL_NANO_ATTENTION=triton`), por lo que es util para validar kernels de atencion en entornos controlados antes de escalar.
- Experimentos de destilacion y curriculum de datos: la mezcla de datos por fases (con umbrales de calidad documentados en `run.json`) es replicable y sirve como caso de estudio de curriculos orientados a matematicas.
- Inferencia en dispositivos muy restringidos o en CPU: con 11,6 MB de pesos FP32, cabe en cualquier GPU de consumo, en microcontroladores de gama alta o en entornos embebidos donde no es viable ejecutar modelos de cientos de millones de parametros.
- Generacion de datos sinteticos a pequena escala y pruebas de pipelines de evaluacion: util para validar integraciones con LM Evaluation Harness 0.4.12 y con ArithMark-3.0 sin incurrir en costes de computo relevantes.
- Docencia y demostraciones de arquitecturas de lenguaje: el codigo (`modeling_sol_lite.py`) y la configuracion se distribuyen junto a los pesos, lo que permite trazar el flujo completo desde el tokenizador hasta los logits en una sola sesion practica.
- Investigacion sobre tokenizadores de vocabulario minimo: comparar la eficiencia de un vocabulario de 1.024 entradas frente a vocabularios de 32.000-128.000 en tareas de continuacion matematica.

## Benchmarks y rendimiento

| Benchmark | Ejemplos | Precision normalizada (zero-shot) |
|---|---:|---:|
| HellaSwag | 10.042 | 28,40% |
| ARC-Easy | 2.376 | 32,07% |
| ARC-Challenge | 1.172 | 21,16% |
| PIQA | 1.838 | 53,92% |
| ArithMark-3 | 1.000 | 33,80% |

Indice adicional reportado por el autor: Axiomic Labs Open SLM Intelligence Index = 6,0684.

Condiciones de evaluacion declaradas: resultados zero-shot completos con LM Evaluation Harness 0.4.12 y el dataset oficial ArithMark-3.0, scoring en float32 y contexto de 512 tokens con PyTorch 2.14.0+cu130. Ninguna peticion candidata requirio truncamiento. El autor indica que el indice sigue la metodologia publicada por Axiomic Labs y que los resultados no han sido verificados de forma independiente por Axiomic Labs. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 12 MB para los pesos en FP32 (2.895.188 parametros x 4 bytes = 11,58 MB), mas el coste de activaciones y del tokenizador, despreciable frente a cualquier GPU actual.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA. La implementacion de referencia depende de Triton y FlexAttention, por lo que se recomienda una GPU con arquitectura Ampere o posterior (RTX 30xx/40xx, A100, H100, RTX PRO 6000 Blackwell). El entrenamiento se realizo en una RTX PRO 6000 Blackwell Server Edition.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo, incluidas tarjetas con 4 GB o menos, e incluso puede ejecutarse en CPU sin requisitos especiales (aunque el camino Triton/FlexAttention es el soportado oficialmente).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El unico camino soportado es cargar la implementacion PyTorch incluida en el repositorio mediante `snapshot_download`, `safetensors` y `tokenizers`, con `SOL_NANO_ATTENTION=triton`.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.
- Dependencias de software: PyTorch (probado con 2.11.0+cu130 en entrenamiento y 2.14.0+cu130 en evaluacion), Triton 3.6.0, `huggingface_hub`, `tokenizers` y `safetensors`.

## Comparativa con modelos similares

No se han proporcionado en la informacion disponible resultados de benchmarks de modelos comparables, por lo que la comparacion de rendimiento no esta disponible. A continuacion se contrastan unicamente parametros estructurales publicos de modelos de la misma franja de escala (datos de fichas publicas, no verificados en la informacion proporcionada):

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Formato |
|---|---|---|---|---|---|
| Sol Nano | 2.895.188 | 512 | 1.024 | no disponible | safetensors FP32 |
| SmolLM-135M | 135.000.000 (aprox.) | 2.048 | no disponible | Apache-2.0 | safetensors |
| Qwen2.5-0.5B | 494.000.000 (aprox.) | 32.768 | no disponible | Apache-2.0 | safetensors |

Sol Nano es entre uno y dos ordenes de magnitud mas pequeno que las alternativas de la tabla y su contexto es de 4 a 64 veces menor. No hay datos publicados que permitan comparar su calidad frente a estos modelos con la misma metodologia de evaluacion, por lo que cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes ni mantiene formato conversacional; sus respuestas pueden ser incorrectas. El propio autor lo advierte en la model card.
- Riesgo elevado de alucinacion y de incoherencia en generacion libre: con 2,9 M de parametros y 512 tokens de contexto, la coherencia queda limitada a continuaciones muy cortas.
- Los benchmarks publicados miden precision de verosimilitud en eleccion multiple (HellaSwag, ARC, PIQA) y no demuestran capacidad de resolucion de problemas en formato libre. Las puntuaciones son bajas (28,40% en HellaSwag, 21,16% en ARC-Challenge), coherentes con la escala.
- El indice Open SLM Intelligence Index (6,0684) no ha sido verificado de forma independiente por Axiomic Labs, segun indica el propio autor.
- Solo ingles: no hay capacidades multilingues.
- Limitacion de contexto severa: 512 tokens, insuficiente para documentos, conversaciones largas o codebases.
- Vocabulario de 1.024 entradas: la tokenizacion es muy ineficiente en terminos de tokens por palabra, lo que agrava la limitacion de contexto.
- Licencia no disponible: no se especifican terminos de uso, incluido el uso comercial. Esto supone una incertidumbre legal relevante para cualquier despliegue en produccion.
- Requiere codigo personalizado (`custom-code`): es necesario cargar `modeling_sol_lite.py` del repositorio, lo que implica ejecutar codigo del autor y asumir el riesgo asociado.
- Dependencia de Triton y FlexAttention en CUDA: la ruta de inferencia documentada no es portable directamente a otros backends ni a hardware no NVIDIA.
- Los pesos se distribuyen unicamente en FP32 y no hay versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita su integracion en herramientas estandar.
- Los datasets de entrenamiento tienen sus propias licencias y condiciones de uso, que no se detallan en la informacion disponible.
- Anomalias en los metadatos del repositorio: la fecha de creacion y actualizacion indicada es 2026-09-30, el tamano del repo figura como 0,0 GB pese a que el safetensors ocupa 11,6 MB, y el modelo registra 0 descargas y 0 likes. Conviene verificar la integridad y procedencia de los artefactos antes de reutilizarlos.
- Entrenamiento en una sola GPU y sin verificacion externa de reproducibilidad mas alla de los metadatos de entrenamiento incluidos.
- Los resultados de busqueda web disponibles mencionan modelos denominados "Sol" y "Nano" de OpenAI (GPT-6 Sol y Luna), que no guardan ninguna relacion con este modelo y no deben utilizarse como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/solintellegence/sol-nano
- Perfil del autor (Sol Labs, solintellegence): https://huggingface.co/solintellegence
- Metodologia del indice Open SLM Intelligence Index (Axiomic Labs): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard/blob/main/index.html
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset OpenWebMath: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset SmolLM Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset CoRNStack Python: https://huggingface.co/datasets/nomic-ai/cornstack-python-v1
- Resultados de busqueda no relacionados con este modelo (modelos GPT-6 Sol y Luna de OpenAI): https://openai.com/index/introducing-gpt-6-sol-and-luna/
- Resultados de busqueda no relacionados con este modelo (comparativa GPT-6 Sol vs Nano): https://llm-stats.com/models/compare/gpt-6-sol-vs-nano
