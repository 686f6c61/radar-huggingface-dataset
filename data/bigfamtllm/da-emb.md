# BigFamTLLM/da-emb

## Resumen

`da-emb` es un modelo de lenguaje base de 2.115.305.088 parametros (2,12B) desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 de la Universidad de Oslo (otono de 2026). Se trata de un punto de control intermedio dentro de una campana de adaptacion linguistica: parte del modelo `da-base`, entrenado desde cero sobre texto danes, al que se le ha sustituido el tokenizador original por un tokenizador noruego de 32.000 entradas y se le ha sometido a 1.000 pasos de entrenamiento en los que unicamente se actualizaron las embeddings. El resultado es un modelo con vocabulario noruego pero pesos del transformer aun proximos a los del modelo danes de origen, concebido como punto de partida para un preentrenamiento continuado (CPT) posterior.

El modelo emplea la arquitectura Qwen3 (36 capas, hidden size 2176, 34 cabezas de atencion con 17 cabezas KV y embeddings atados) y una longitud de contexto de 4.096 tokens. Durante esta fase ha visto 0,52B tokens de texto noruego procedente del corpus HPLT 4.0, con una mezcla del 85% en bokmal y 15% en nynorsk. Existe una variante hermana, `da-emb-anneal`, que anade una fase de annealing de 916 pasos sobre datos de alta calidad.

Su relevancia es fundamentalmente metodologica: documenta con detalle el procedimiento de intercambio de tokenizador (conservacion de embeddings para tokens compartidos y inicializacion por media de piezas para los nuevos) y publica resultados en NorEval 1.1, lo que lo convierte en una referencia util para investigadores que trabajan en adaptacion cross-linguistica de modelos pequenos y en la evaluacion de estrategias de CPT. No es un modelo destinado a produccion ni esta ajustado por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3 (36 capas, hidden size 2176, 34 cabezas de atencion, 17 cabezas KV, embeddings atados) |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | da, no, nb, nn (danes, noruego, bokmal, nynorsk) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 en configuracion densa: 36 capas transformer con atencion multi-cabeza (34 cabezas de consulta y 17 de clave/valor, es decir, GQA con ratio 2:1), dimension oculta de 2176 y embeddings de entrada y salida atados. El entrenamiento se realizo con Megatron-LM sobre 8 GPU NVIDIA GH200 en el cluster Olivia de Sigma2, con longitud de secuencia 4.096, tamano de lote 128, optimizador AdamW y una tasa de aprendizaje pico de 5e-4 con 2.000 pasos de warmup y sin decaimiento; en la fase especifica de este checkpoint (solo embeddings) la tasa se reduce a 1e-4.

El proceso de adaptacion consta de dos piezas. Primero, el intercambio de tokenizador: se reemplaza el vocabulario danes por uno noruego de 32.000 entradas, conservando la embedding original de los tokens presentes en ambos vocabularios e inicializando los nuevos como la media de las piezas del tokenizador antiguo que los componen. Segundo, 1.000 pasos de entrenamiento sobre texto noruego de HPLT 4.0 (85% bokmal, 15% nynorsk) en los que solo se actualizan las embeddings, acumulando 0,52B tokens vistos. La variante `da-emb-anneal` anade 916 pasos (0,48B tokens) de annealing sobre bokmal y nynorsk de alta calidad con decaimiento lineal a cero. La conversion a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para que el modelo cargue tambien en transformers 4.x.

## Capacidades

- Generacion de texto autoregresiva en noruego (bokmal y nynorsk) y danes, como modelo base sin ajuste por instrucciones.
- Modelado del lenguaje y continuacion de texto: adecuado para perplexity, scoring y generacion condicionada por prompt.
- Capacidad multilingue limitada al par danes-noruego; no se documenta soporte funcional de otras lenguas.
- Tokenizador noruego de 32.000 entradas, optimizado para la morfologia y ortografia del noruego frente al vocabulario original danes.
- Punto de partida para preentrenamiento continuado: el autor lo presenta explicitamente como checkpoint inicial para CPT, no como modelo final.
- No dispone de tool calling, function calling, modo thinking, vision, audio ni capacidades de agente; no esta ajustado por instrucciones ni por preferencias.
- Evaluado en tareas de comprension lectora, ortografia, conocimiento del mundo y generacion en NorEval 1.1, ademas de una prueba de robustez frente a ruido.

## Casos de uso

- Investigacion en adaptacion cross-linguistica: sirve como linea base controlada para medir cuanto de la perdida o ganancia en noruego proviene del cambio de tokenizador frente al CPT completo, comparando con `da-base` y con los checkpoints `da-cpt1` a `da-cpt10`.
- Preentrenamiento continuado sobre corpus noruegos especializados: al estar ya alineado con un tokenizador noruego, reduce el coste de adaptar el modelo a dominios como legislacion, medicina o documentacion tecnica en bokmal y nynorsk.
- Evaluacion de tokenizadores: permite estudiar el impacto del vocabulario en metricas de NorEval (por ejemplo, la diferencia entre 0,105 y 0,124 en `nob_language` con 0 y 1 shot) y en la robustez ante ruido (-0,032 de media bajo perturbaciones).
- Generacion de texto en noruego para experimentos de laboratorio: continuacion de prompts, generacion de variantes ortograficas y analisis de fluidez en bokmal y nynorsk, siempre con revision humana dado que no esta alineado.
- Estudio de robustez y sesgos en modelos pequenos: la publicacion de resultados clean frente a noisy facilita replicar analisis de sensibilidad a errores tipograficos y variaciones ortograficas.
- Docencia y reproducibilidad: al formar parte de una familia de 50 modelos con la misma arquitectura y presupuesto, permite comparar estrategias de entrenamiento (from scratch, embeddings only, CPT con y sin annealing) en igualdad de condiciones.
- Base para ajuste supervisado posterior en tareas concretas de PNL noruega, como clasificacion de texto o extraccion de informacion, una vez completado el CPT.

## Benchmarks y rendimiento

NorEval 1.1, resultados publicados por el autor:

| Grupo de tarea | Metrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,105 | 0,124 |
| nob_orthography | acc | 0,781 | 0,829 |
| nob_reading | f1 | 0,157 | 0,166 |
| nob_world | acc | 0,274 | 0,271 |
| nno_language | em_first | 0,067 | 0,112 |
| nno_world | acc | 0,265 | 0,270 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,321 sobre entrada limpia y -0,032 de media bajo ruido.

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numericas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 4,2-4,5 GB solo para pesos, mas overhead de activaciones y cache KV; con 4.096 tokens de contexto y 36 capas el coste de cache es moderado pero no despreciable en lotes grandes.
- Cuantizacion: el autor no publica variantes GGUF ni cuantizadas; seria necesario generarlas a partir de los safetensors (por ejemplo, con llama.cpp o GPTQ/AWQ) para reducir requisitos.
- GPU recomendadas: cabe con holgura en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bfloat16; tambien en GPUs de 16 GB con cuantizacion a 8 bits. Para entrenamiento o CPT se emplearon 8 GH200.
- Despliegue: compatible con transformers (>= 4.x segun el autor), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles; vLLM, llama.cpp u Ollama requeririan conversion previa a los formatos correspondientes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| BigFamTLLM/da-emb | 2,12B | 4.096 | da, no, nb, nn | no disponible | Checkpoint embeddings-only, base para CPT |
| BigFamTLLM/da-base | 2,12B (misma arquitectura) | 4.096 | da | no disponible | Modelo danes de origen, sin tokenizador noruego |
| BigFamTLLM/no-base | 2,12B (misma arquitectura) | 4.096 | no | no disponible | Noruego entrenado desde cero, misma familia y presupuesto |
| BigFamTLLM/da-emb-anneal | 2,12B (misma arquitectura) | 4.096 | da, no, nb, nn | no disponible | Variante con annealing sobre datos de alta calidad |

La comparacion con modelos de otros desarrolladores (por ejemplo, variantes Qwen3 de tamano similar o modelos nordicos de 2B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional directo.
- El autor advierte explicitamente que son modelos de investigacion entrenados con texto web y que pueden producir salidas erroneas u ofensivas; no estan pensados para produccion.
- Riesgo elevado de alucinacion y de afirmaciones factuales incorrectas, coherente con los resultados de `nob_world` (0,274 en 0-shot) y `nno_world` (0,265).
- Rendimiento bajo en tareas de lenguaje y comprension lectora (`nob_reading` f1 de 0,157; `nno_language` em_first de 0,067 en 0-shot), lo que limita su uso en tareas que exijan precision.
- Sensibilidad al ruido: la robustez cae -0,032 de media bajo perturbaciones, con posible impacto en entradas con errores ortograficos o variacion dialectal.
- Cobertura limitada a danes y noruego (bokmal y nynorsk); no hay evidencia de capacidades en castellano ni en otras lenguas.
- Licencia no disponible: no puede asumirse permiso de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Checkpoint intermedio: representa una fase de 1.000 pasos solo sobre embeddings, por lo que su calidad final es inferior a la de los checkpoints de CPT completos de la misma familia.
- No se publican datos de sesgos especificos ni de evaluaciones de seguridad; al entrenarse con HPLT 4.0 hereda los sesgos del corpus web.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-emb
- Modelo base: https://huggingface.co/BigFamTLLM/da-base
- Variante con annealing: https://huggingface.co/BigFamTLLM/da-emb-anneal
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo multilingue desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Modelo multilingue con annealing: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo multilingue embeddings-only: https://huggingface.co/BigFamTLLM/ml-emb
- Checkpoints CPT daneses: https://huggingface.co/BigFamTLLM/da-cpt1 (hasta da-cpt10 y sus variantes -anneal)
- Checkpoints CPT multilingues: https://huggingface.co/BigFamTLLM/ml-cpt1 (hasta ml-cpt10 y sus variantes -anneal)
- Corpus HPLT 4.0: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
