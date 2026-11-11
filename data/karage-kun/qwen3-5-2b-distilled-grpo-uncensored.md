# KARAGE-KUN/Qwen3.5-2B-Distilled-GRPO-Uncensored

## Resumen

Qwen3.5-2B-Distilled-GRPO-Uncensored es un ajuste fino del modelo Qwen/Qwen3.5-2B publicado por el usuario KARAGE-KUN en Hugging Face. El objetivo declarado es construir un modelo pequeno, apto para despliegue en el borde (edge), que razone mejor y rechace menos peticiones: combina destilacion de cadenas de razonamiento (chain-of-thought) mediante SFT sobre LoRA con un ajuste de instrucciones sin rechazos, seguido de aprendizaje por refuerzo GRPO sobre GSM8K. Los adaptadores LoRA se fusionaron de vuelta en el modelo base, por lo que el repositorio contiene un modelo completo en safetensors fp16 de 4,43 GB.

El modelo conserva la arquitectura Qwen3.5 y su torre de vision heredada del modelo base (pipeline image-text-to-text), aunque el entrenamiento fue exclusivamente de texto. Cuenta con 2.213.241.664 parametros totales y esta pensado para investigacion y experimentacion personal con modelos pequenos en dispositivo, estudios de ajuste de razonamiento (SFT + GRPO) y analisis del comportamiento de rechazo.

Es relevante ahora porque ejemplifica una tendencia: tomar un modelo base pequeno y aplicar tecnicas de destilacion y RL para mejorar capacidades concretas (matematicas) y modificar el perfil de rechazo, todo con recursos muy limitados (dos NVIDIA T4 en Kaggle, 8 h 32 min de entrenamiento total). La licencia Apache 2.0 facilita su reutilizacion, aunque el autor advierte que las metricas son indicativas y proceden de conjuntos de prueba propios muy reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con torre de vision (image-text-to-text); kernels flash-linear-attention (fla-core 0.5.2) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max length 2048; contexto del modelo base no indicado) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, fp16, 4,43 GB); adaptadores LoRA en sft_adapter/ y grpo_adapter/ |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y mantiene su arquitectura transformer con torre de vision, empleando los kernels de flash-linear-attention (fla-core 0.5.2) para la arquitectura Qwen3.5. El entrenamiento se estructuro en dos etapas. La primera fue una destilacion SFT con LoRA de rango 16 (16.819.200 parametros entrenables, el 0,7542 % del modelo), tasa de aprendizaje 1e-4, longitud maxima 2048 y una epoca (750 pasos), con un total de 6.000 ejemplos: 4.500 trazas de razonamiento de OpenThoughts-114k (cadenas de pensamiento destiladas de un modelo de razonamiento de primer nivel) y 1.500 ejemplos de instrucciones sin rechazos de Dolphin (flan5m-alpaca-uncensored). Esta etapa tardo 365,2 minutos en 2x NVIDIA T4 en Kaggle.

La segunda etapa aplico GRPO sobre 2.000 prompts de GSM8K durante 150 pasos, con 4 generaciones por prompt y longitud maxima de completado de 320 tokens. La funcion de recompensa otorgaba +1,0 por respuesta final correcta y +0,2 por formato correcto (bloque de razonamiento y respuesta en `\boxed{}`), con beta = 0,0 y tasa de aprendizaje 1e-5; esta etapa tardo 100,7 minutos. El entrenamiento total fue de 8 h 32 min en Kaggle T4 x2, usando TRL, Transformers y PEFT. Los adaptadores LoRA de ambas etapas se fusionaron en el modelo base, generando el modelo completo publicado. El autor senala que tanto el SFT como el GRPO fueron solo de texto y que la torre de vision se hereda sin cambios y no fue evaluada tras el ajuste.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico con cadenas de pensamiento dentro de etiquetas de razonamiento y respuesta final en formato `\boxed{...}`.
- Destilacion de trazas de razonamiento de un modelo de razonamiento de primer nivel (OpenThoughts-114k) para mejorar el razonamiento paso a paso.
- Ajuste de instrucciones con menor tasa de rechazo (comportamiento "uncensored") mediante datos sin rechazos.
- Entrada de imagenes y texto (pipeline image-text-to-text) por herencia del modelo base, aunque la torre de vision no fue evaluada tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: modo de razonamiento explicito con etiquetas de pensamiento; no se documentan capacidades de audio.

## Casos de uso

- Investigacion sobre ajuste de razonamiento: sirve como caso de estudio reproducible de un pipeline SFT (destilacion LoRA) + GRPO sobre un modelo de 2B, con hiperparametros y tiempos documentados, para comparar tecnicas de RL en modelos pequenos.
- Estudios de comportamiento de rechazo: al haberse entrenado con datos sin rechazos, permite analizar como varia la tasa de rechazo (de 0,25 a 0,125 en la sonda del autor) y evaluar el equilibrio entre utilidad y seguridad.
- Razonamiento matematico basico en dispositivo: su formato de respuesta con `\boxed{}` y su tamano de 2B lo hacen adecuado para prototipos de resolucion de problemas aritmeticos en entornos con recursos limitados, como demos educativas.
- Experimentacion con modelos pequenos en el borde: con 2,2B parametros y pesos fp16 de 4,43 GB, es candidato para pruebas de despliegue en hardware modesto y para estudiar tecnicas de cuantizacion.
- Destilacion y reentrenamiento: los adaptadores `sft_adapter/` y `grpo_adapter/` permiten re-fusionar o continuar el entrenamiento, util para laboratorios que quieran extender el ajuste con sus propios datos.
- Analisis de la torre de vision heredada: aunque no fue evaluada, permite investigar como afecta el ajuste de texto a las capacidades multimodales heredadas del modelo base.
- Generacion de cadenas de razonamiento para conjuntos de datos: puede usarse para producir trazas de razonamiento sinteticas en ingles que sirvan como material de entrenamiento en experimentos posteriores.

## Benchmarks y rendimiento

| Metrica | Conjunto | Qwen3.5-2B base | Este modelo |
|---|---|---|---|
| Precision GSM8K | 30 preguntas | 18/30 = 0,600 | 20/30 = 0,667 |
| Tasa de rechazo | 8 sondas de rechazo | 2/8 = 0,25 | 1/8 = 0,125 |

El autor advierte explicitamente que estos conjuntos son sondas internas pequenas para medir el efecto del entrenamiento y no ejecuciones completas de benchmarks; deben tratarse como indicativas y no como puntuacion de leaderboard. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB en fp16 (pesos de 4,43 GB mas overhead de activaciones y cache KV); en cuantizacion de 8 bits o 4 bits no se proporcionan cifras oficiales, pero el modelo base de 2B suele requerir del orden de 2-3 GB en 4 bits.
- GPU recomendadas: el modelo fue entrenado en 2x NVIDIA T4 (16 GB cada una); para inferencia es suficiente una GPU con al menos 6-8 GB de VRAM.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070) en fp16, y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: la model card usa Transformers (Qwen3_5ForConditionalGeneration y AutoProcessor); el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documentan instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (sonda) | Tasa de rechazo (sonda) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-Distilled-GRPO-Uncensored | 2,21B | no disponible | 0,667 (30 preguntas) | 0,125 (8 sondas) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B (no confirmado) | no disponible | 0,600 (30 preguntas) | 0,25 (8 sondas) | no disponible en la informacion | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base del que deriva; no se dispone de datos de otros modelos comparables de 2B con ajuste de razonamiento y comportamiento sin rechazos.

## Limitaciones y advertencias

- Escala de 2B: la capacidad esta acotada por el modelo base; puede producir razonamientos incorrectos y errores factuales.
- Las metricas de evaluacion proceden de conjuntos muy pequenos (30 preguntas de GSM8K y 8 sondas de rechazo) y el propio autor las califica de indicativas, no de leaderboard.
- El termino "uncensored" implica que el modelo puede cumplir peticiones que los modelos con ajuste de seguridad rechazan; el usuario es responsable del uso y de verificar las salidas.
- Entrenamiento exclusivamente en ingles; no se documentan capacidades multilingues.
- La torre de vision se hereda sin cambios y no fue evaluada tras el ajuste; no se garantiza su correcto funcionamiento.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o toxicidad.
- Riesgo de alucinacion inherente a modelos de este tamano; no hay evaluaciones publicadas al respecto.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantias sobre el rendimiento en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- El contexto maximo del modelo base no se indica; el entrenamiento uso longitud maxima 2048, por lo que no hay garantia de buen rendimiento con contextos mas largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KARAGE-KUN/Qwen3.5-2B-Distilled-GRPO-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset OpenThoughts-114k: no disponible en la informacion proporcionada
- Dataset Dolphin (flan5m-alpaca-uncensored): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
