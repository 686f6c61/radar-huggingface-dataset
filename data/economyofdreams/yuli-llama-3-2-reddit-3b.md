# economyofdreams/Yuli-LLaMA-3.2-Reddit-3B

## Resumen

Yuli-LLaMA-3.2-Reddit-3B es un modelo de personaje y motor de personalidad desarrollado por economyofdreams (@hoytnix), construido sobre Llama 3.2 3B Instruct de Meta (vía Unsloth). El proyecto Yuli, nacido originalmente como trabajo de un Máster en IA y hoy motor de personalidad de Hecka Dough y del Yuli SDK, se centra en conversaciones diádicas multi-turno con seguimiento de personalidad tipo MBTI y funciones cognitivas. Este modelo de 3B es la variante "Desktop" del proyecto, frente a la variante "Mobile" de 1B, y ofrece mayor fluidez, mejor seguimiento del hilo conversacional y respuestas más largas y naturales.

El modelo se ha ajustado mediante QLoRA sobre un dataset curado de conversaciones de Reddit (reddit_movie_large_v1) con reglas estrictas de diadicidad y deduplicación, alcanzando una pérdida final de 0,316 tras 3 épocas. Se distribuye en formato GGUF con cuantizaciones IQ2_M, IQ3_XXS, Q4_K_M (recomendada) y Q8_0, lo que lo hace ejecutable en llama.cpp y Ollama en hardware de consumo. Su caso de uso principal es la generación de texto conversacional en inglés con un personaje definido y persistente, no el razonamiento generalista ni la generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2), 28 capas |
| Parametros totales | 3.212.749.888 (~3,21B) |
| Parametros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | 4.096 tokens (entrenado con max_seq_length 4.096) |
| Tipos de cuantizacion | IQ2_M (1,23 GB), IQ3_XXS (1,35 GB), Q4_K_M (2,02 GB, recomendada), Q8_0 (3,42 GB) |
| Idiomas soportados | Ingles (solo entrenado en ingles) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (cuantizado con imatrix); el base safetensors es unsloth/Llama-3.2-3B-Instruct |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Llama-3.2-3B-Instruct, un transformer decoder denso de 28 capas y ~3,21B de parametros (frente a las 16 capas y 1,24B de la variante 1B del proyecto). El ajuste fino se realizo con QLoRA (carga en 4 bits + adaptadores LoRA) usando Unsloth FastLanguageModel, sobre una NVIDIA A100-SXM4-40GB en 28 minutos y 53 segundos, con 2.700 pasos y 3 epocas. Se empleo entrenamiento solo sobre tokens del asistente (response-only training) y la plantilla de chat nativa de Llama 3.2, manteniendo el system prompt como elemento de primera clase. La perdida bajo de 2,275 a 0,316 (media de los ultimos 100 pasos ~0,33), con curva por epocas de ~0,458 / ~0,391 / 0,316 y sin NaN ni explosiones.

El dataset de entrenamiento procede de `ZhankuiHe/reddit_movie_large_v1` (split de entrenamiento, texto crudo), filtrado con una regla diadica estricta: exactamente 2 `user_id` distintos por conversacion, deduplicacion por comentario (gana la primera conversacion que contiene un `turn_id`), minimo 3 de profundidad, minimo 4 turnos totales y minimo 2 turnos por hablante. La anotacion se hizo con `meta/muse-spark-1.3-contributor` via LiteLLM / Meta Model API en dos pasadas con verificacion doble (11 checks duros y 5 blandos sin LLM), obteniendo 7.583 de 7.601 conversaciones limpias (99,76 %), sin duplicados. El split final fue de 7.203 conversaciones de entrenamiento y 380 de validacion, separadas por `conv_id` sin solapamiento. Las identidades de los hablantes se anonimizaron como Speaker A / Speaker B. El formato de anotacion incluye etiquetas `<thought>`, `<state_vector>` y tipos MBTI (ego y sombra) con funciones cognitivas por turno. No hay informacion sobre RLHF ni DPO adicionales.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, con seguimiento de contexto diadico (dos hablantes) entrenado sobre conversaciones reales de Reddit
- Interpretacion de rol de personaje (character AI): mantiene la voz de "Yuli" durante conversaciones largas gracias a la mayor capacidad frente a la version 1B
- Comprension y generacion de anotaciones estructuradas de personalidad: etiquetas `<thought>`, `<state_vector>`, tipos MBTI (ego/sombra) y funciones cognitivas por turno
- Respuestas largas y con seguimiento ("chattier by design"): el modelo esta ajustado para hacer preguntas de seguimiento y mantener la conversacion
- Tolerancia a tokens de codigo en la entrada (el dataset no filtro lenguaje de codigo), aunque no esta optimizado para generacion de codigo
- Uso de la plantilla de chat nativa de Llama 3.2 con system prompt de primera clase, lo que permite redefinir el personaje por prompt
- No se documenta soporte de tool calling / function calling, capacidades de agente, vision ni audio

## Casos de uso

- Compañero conversacional de personaje: despliegue del modelo como chatbot de personalidad fija en llama-server local, usando el system prompt para definir el rol y parametros conservadores (temperature 0,35, repeat_penalty 1,2) para evitar divagaciones
- Recomendacion dialogada de contenido: el dataset de entrenamiento proviene de conversaciones de cine de Reddit, por lo que el modelo es adecuado para asistentes que recomiendan peliculas o contenido mediante dialogo natural multi-turno
- Prototipado de motores de personalidad con MBTI: el formato de anotacion con `<state_vector>` y funciones cognitivas permite integrar el modelo en pipelines que analizan o generan perfiles de personalidad conversacionales
- Integracion en el Yuli SDK y Hecka Dough: sirve como cerebro "Desktop" del ecosistema Yuli para aplicaciones que ya usan la variante 1B movil y quieren mas fluidez en servidor o escritorio
- Investigacion en fine-tuning diadico: el dataset curado (7.583 conversaciones, 99,76 % limpias) y la receta QLoRA documentada sirven como referencia reproducible para experimentos de ajuste de modelos de conversacion
- Servidores locales de bajo consumo: con la cuantizacion Q4_K_M (2,02 GB) puede ejecutarse en portatiles y escritorios con GPU modesta o incluso en CPU, ofreciendo un chatbot de personaje sin dependencia de la nube

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento publicada es la perdida de entrenamiento: 2,275 inicial, ~0,458 al final de la epoca 1, ~0,391 al final de la epoca 2 y 0,316 al final de la epoca 3 (media de los ultimos 100 pasos ~0,33). No hay datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,5-2 GB para IQ2_M/IQ3_XXS, ~2,5-3 GB para Q4_K_M (recomendada, archivo de 2,02 GB) y ~4-4,5 GB para Q8_0, con contexto de 4.096 tokens; en CPU basta RAM equivalente
- GPU recomendadas: cualquier GPU de consumo con 4 GB de VRAM o mas (RTX 3060, RTX 4060 o superiores) para Q4_K_M; el entrenamiento original se hizo en una NVIDIA A100-SXM4-40GB, pero la inferencia no la requiere
- Cabe comodamente en GPUs de consumo: con Q4_K_M funciona en portatiles con GPU dedicada de gama media; el propio autor lo describe como modelo "Desktop" para maquinas con margen, reservando la variante 1B para moviles
- Opciones de despliegue: llama.cpp (recomendado por el autor, con `llama-server` en el puerto 8081), Ollama (se incluye un `Modelfile` en el repositorio) y cualquier runtime compatible con GGUF (LM Studio, etc.); no se menciona soporte nativo de vLLM ni TGI al ser un modelo GGUF
- Parametros de muestreo sugeridos por el autor: temperature 0,35, top_p 0,9, top_k 40, repeat_penalty 1,2; se advierte de la importancia de la disciplina de stops (`<eot_id>`) porque el modelo tiende a alargar las respuestas
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion minima (GGUF) | Licencia | Enfoque |
|---|---|---|---|---|---|
| Yuli-LLaMA-3.2-Reddit-3B | 3,21B (28 capas) | 4.096 | IQ2_M (~1,23 GB) | Llama 3.2 Community | Personaje / conversacion diadica en Reddit |
| Yuli-LLaMA-3.2-Reddit-1B (misma serie) | 1,24B (16 capas) | no disponible | Q4_K_M bajo limite de 2 GB (Mobile) | Llama 3.2 Community | Misma voz, orientado a movil, menos fluidez |
| unsloth/Llama-3.2-3B-Instruct (base) | 3,21B | 128.000 | ~1,8 GB (Q4_K_M) | Llama 3.2 Community | Asistente generalista multiuso |

Frente a la variante 1B de la misma serie, el 3B ofrece mas capacidad de seguimiento multi-turno, vocabulario mas rico y respuestas mas largas y naturales, a costa de un tamaño mayor y de una mayor tendencia a divagar que exige control de stops. Frente a su modelo base (Llama 3.2 3B Instruct), este fine-tuning sacrifica generalidad y contexto largo (4.096 frente a 128.000 tokens) a cambio de una voz de personaje consistente y un formato de anotacion de personalidad propio.

## Limitaciones y advertencias

- Monolingue en ingles: el modelo solo se entreno en ingles; su rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea pobre
- Contexto limitado a 4.096 tokens de entrenamiento: no apto para documentos largos ni conversaciones muy extensas
- Tendencia documentada a la verbosidad: el autor advierte que el modelo puede divagar mas alla de `<eot_id>` o del formato estructurado, por lo que el control de stops y la penalizacion por repeticion (repeat_penalty 1,2) son criticos en produccion
- Riesgo de alucinacion: al ser un modelo de 3B ajustado a un dominio concreto (conversacion de Reddit sobre cine), puede generar hechos incorrectos con fluidez; no esta indicado para tareas de razonamiento factual, matematicas ni codigo
- Especializacion de dominio: su voz y estilo provienen de conversaciones de Reddit anonimizadas; fuera de ese registro puede comportarse de forma impredecible
- Licencia: se rige por la Llama 3.2 Community License de Meta, que impone restricciones de uso (limites para entidades con mas de 700 millones de usuarios mensuales y obligaciones de atribucion); revisar los terminos antes de uso comercial
- Sesgos: el dataset procede de Reddit, por lo que puede heredar sesgos y estilos propios de esa comunidad; no se ha publicado evaluacion de sesgos
- Cuantizaciones agresivas: IQ2_M e IQ3_XXS reducen el archivo por debajo de 2 GB, pero a costa de calidad generativa; para despliegues serios se recomienda Q4_K_M o Q8_0

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/economyofdreams/Yuli-LLaMA-3.2-Reddit-3B
- Autor (@hoytnix): https://huggingface.co/economyofdreams
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ZhankuiHe/reddit_movie_large_v1
- Llama 3.2 Community License: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct (licencia adjunta al modelo base)
- No se han encontrado enlaces a paper, blog del proyecto ni demo publica en la informacion disponible
