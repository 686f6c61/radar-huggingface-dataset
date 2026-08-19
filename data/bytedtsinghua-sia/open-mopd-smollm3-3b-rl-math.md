# BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Math

## Resumen

Open-MOPD-SmolLM3-3B-RL-Math es un modelo de lenguaje de 3 300 millones de parámetros desarrollado por BytedTsinghua-SIA, diseñado específicamente como "maestro" (teacher) de dominio matemático dentro del pipeline Open-MOPD de destilación multi-maestro on-policy. Parte del modelo base BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT (un ajuste fino supervisado sobre SmolLM3-3B) y se entrena únicamente con prompts de matemáticas mediante GRPO (Group Relative Policy Optimization) con recompensas verificables. El lanzamiento corresponde al paso de entrenamiento 100.

La arquitectura es SmolLM3ForCausalLM, con 36 capas y un vocabulario de 128 256 tokens. La ventana de contexto utilizada en evaluación es de 32 768 tokens, aunque la model card no especifica explícitamente el máximo soportado. Su propósito declarado es servir como teacher de dominio para destilar capacidades de razonamiento matemático en modelos más pequeños, no como asistente generalista. La relevancia actual radica en que demuestra una mejora sustancial en benchmarks de matemáticas (AIME24, AIME25) respecto a su punto de partida SFT, y forma parte de un stack abierto de entrenamiento y evaluación para destilación multi-maestro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3ForCausalLM (transformer decoder-only) |
| Parametros totales | 3 337 766 912 (aprox. 3,3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (valor usado en evaluacion; maximo no confirmado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, ~6,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolLM3, un transformer decoder-only con 36 capas y 128 256 tokens de vocabulario. Parte de un checkpoint intermedio (MixSFT) que ya habia pasado por un ajuste fino supervisado mixto, y se entrena exclusivamente con prompts de matematicas usando GRPO, un algoritmo de optimizacion de politicas con recompensas verificables. Los hiperparametros de entrenamiento incluyen batch global de 128, mini-batch de 32, learning rate constante de 1e-6 con 10 pasos de warmup, clipping en 0,2/0,25, grupo de rollout de 16, temperatura 1,0, limite de respuesta de 30 000 tokens y sin penalizacion KL. Los grupos de generacion donde todas las respuestas son correctas o todas incorrectas se filtran, con hasta ocho reintentos de muestreo.

La innovacion principal no esta en la arquitectura (que es heredada de SmolLM3) sino en el regimen de entrenamiento: se trata de un teacher de dominio entrenado con RL puro sobre recompensas verificables, sin mezclar dominios, para maximizar la calidad en matematicas. El pipeline Open-MOPD lo posiciona como uno de los multiples maestros especializados que luego se destilan de forma on-policy en un modelo estudiante.

## Capacidades

- Razonamiento matematico avanzado: resuelve problemas de nivel competitivo (AIME) con alta precision, generando cadenas de razonamiento paso a paso.
- Generacion de texto con formato de chat: incluye tokenizer y plantilla de chat, aunque su uso previsto no es conversacional general.
- Soporte de tool calling: no disponible (no se menciona en la documentacion).
- Soporte de agentes y multi-step reasoning: no disponible; el modelo esta optimizado para razonamiento matematico, no para interaccion con herramientas.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: optimizado para producir soluciones verificables en matematicas; no incluye vision, audio ni modo thinking explicito (aunque el razonamiento implicito emerge del entrenamiento RL).

## Casos de uso

- Destilacion de conocimiento a modelos estudiantes: el caso de uso principal. Un modelo mas pequeno (por ejemplo, 1B o 500M) puede aprender de las soluciones generadas por este teacher mediante OPD (on-policy distillation), mejorando su rendimiento en matematicas sin necesitar el coste de entrenar con RL directamente.
- Generacion de datos sinteticos de entrenamiento para matematicas: se pueden muestrear soluciones de alta calidad con avg@64 y temperatura 0,6 para crear datasets de instruccion-respuesta, que luego se usan en SFT de otros modelos.
- Evaluacion de razonamiento matematico en pipelines de investigacion: al ser un modelo de tamano moderado (3B) con buenos resultados en AIME, sirve como referencia o baseline en experimentos comparativos de tecnicas de RL y destilacion.
- Benchmarking de tecnicas de RL: investigadores que estudian GRPO o variantes pueden usar este modelo como ejemplo de entrenamiento con recompensas verificables, ya que el stack Open-MOPD es publico y reproducible.
- Pruebas de escalabilidad de destilacion multi-maestro: junto con otros teachers de dominios distintos, se puede integrar en un sistema de destilacion donde cada maestro aporta su especialidad, y este modelo aporta la parte matematica.
- Generacion de soluciones explicativas para problemas de matematicas: aunque no es un asistente general, puede generar soluciones detalladas que se pueden presentar como material educativo o de referencia en plataformas de aprendizaje automatico.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el teacher RL-Math con su punto de partida MixSFT. Se evaluan en AIME24, AIME25 y un promedio matematico, usando avg@64 con temperatura 0,6 y configuracion de evaluacion con max_model_len=32768, top_p=0,95, top_k=-1 y stop_token_ids=[128012].

| Modelo | AIME24 | AIME25 | Promedio matematico |
|---|---:|---:|---:|
| RL-Math teacher (paso 100) | 23,65 | 24,84 | 24,24 |
| MixSFT (punto de partida) | 15,63 | 20,26 | 17,95 |

La mejora es notable: un aumento de 8,02 puntos en AIME24 y 4,58 en AIME25, lo que representa una ganancia relativa del 51% y 23% respectivamente. No se proporcionan comparaciones con otros modelos de tamano similar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 6,2 GB. Con overhead de activaciones y cache KV, se recomienda al menos 10-12 GB de VRAM para inferencia con contexto de 32K tokens. Con cuantizacion a 8 bits (no publicada oficialmente, pero posible con herramientas como bitsandbytes) se podria reducir a ~4 GB, y a 4 bits a ~2,5 GB, aunque no hay archivos de cuantizacion pregenerados.
- GPU recomendadas: para uso comodo con contexto largo, una RTX 3090/4090 (24 GB) o una A10G (24 GB) son suficientes. En GPUs con menos VRAM (por ejemplo, RTX 4060 de 8 GB) se requeriria cuantizacion o limitar la longitud de contexto.
- Si cabe en consumer GPU: si, en GPUs de gama alta consumer (16-24 GB) sin cuantizar; en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: el modelo es compatible con transformers (carga directa con `AutoModelForCausalLM`), y al ser un modelo estandar de causal LM, se puede servir con vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF, aunque no hay conversiones oficiales). Tambien es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no se proporcionan datos oficiales. Para un modelo de 3B en una GPU moderna (por ejemplo, A100 o RTX 4090), se espera una latencia de decodificacion de unos 20-40 ms/token y un throughput de 1000-2000 tokens/s en batch, pero estos valores son estimaciones genericas, no mediciones del modelo.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de razonamiento matematico de tamano similar en la informacion proporcionada. Sin embargo, se pueden mencionar alternativas conocidas en el ecosistema:

| Modelo | Parametros | Contexto | AIME24 (aprox.) | Licencia |
|---|---|---|---|---|
| Open-MOPD-SmolLM3-3B-RL-Math | 3,3B | 32K | 23,65 | Apache 2.0 |
| SmolLM3-3B (base) | 3B | 32K | no disponible | Apache 2.0 |
| Qwen2.5-Math-1.5B | 1,5B | 32K | no disponible | Apache 2.0 |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | 32K | no disponible | MIT |

La comparacion con estos modelos no es directa porque el modelo evaluado es un teacher especializado y no un asistente general. Los datos de AIME para los otros modelos no estan en la informacion proporcionada, por lo que no se pueden contrastar numeros. Se recomienda consultar los repositorios oficiales de cada modelo para obtener benchmarks propios.

## Limitaciones y advertencias

- Modelo de dominio especifico: no es un asistente generalista. Fuera del ambito matematico puede rendir peor que su punto de partida MixSFT, como advierte la propia model card.
- Sesgos conocidos: al entrenarse solo con datos en ingles y con prompts matematicos, puede tener sesgos de formato y estilo de razonamiento; no se han evaluado sesgos sociales.
- Riesgo de alucinacion: aunque las recompensas verificables reducen errores en problemas con respuesta cerrada, en problemas abiertos o mal planteados puede generar soluciones plausibles pero incorrectas.
- Limitaciones de contexto: la ventana de 32K tokens es amplia pero no infinita; problemas extremadamente largos o con muchos pasos intermedios pueden exceder el limite.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener la atribucion y aviso de licencia.
- Caveat para produccion: al ser un teacher para destilacion, su uso como modelo de inferencia directa en aplicaciones de usuario final no es recomendado; se debe evaluar su calidad en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-Math
- Repositorio GitHub de Open-MOPD: https://github.com/BytedTsinghua-SIA/Open-MOPD
- Documentacion de entrenamiento en el repo: https://github.com/BytedTsinghua-SIA/Open-MOPD/tree/main/training
- Documentacion de evaluaciones en el repo: https://github.com/BytedTsinghua-SIA/Open-MOPD/tree/main/evals
- Guia de scripts locales: https://github.com/BytedTsinghua-SIA/Open-MOPD/blob/main/scripts/local/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/Open-MOPD-Data
- Modelo base MixSFT: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
