# salgr/SalgrAI-v2-Full

## Resumen

SalgrAI-v2-Full es un ajuste fino (fine-tuning) completo del modelo google/gemma-3-270m-it, desarrollado por el autor independiente conocido como salgr. Se trata de un modelo de chat en ruso de pequeno tamano, orientado a conversaciones cortas, informales y de estilo "amigo" (lo que el autor denomina "ruso de Telegram en minusculas"). Es el hermano mayor de SalgrAI-v2-Lite (25M parametros, entrenado desde cero): comparte los mismos dialogos de entrenamiento pero parte de un backbone preentrenado mucho mayor.

El modelo resuelve un nicho muy concreto: generar respuestas conversacionales en ruso con un tono coloquial, para experimentos, demos y aprendizaje. No esta pensado para uso serio en produccion. Con 268.098.176 parametros totales (de los cuales unos 170M corresponden a la tabla de embeddings), es un modelo extremadamente ligero que cabe en GPUs de consumo, pero con conocimiento factual muy limitado.

Su relevancia actual es la de un ejemplo practico de fine-tuning de un modelo Gemma 3 pequeno en hardware modesto (una unica RTX 3060), con un enfoque interesante en la gestion del vocabulario multilingue de Gemma mediante una mascara de logits que restringe la generacion a caracteres cirilicos, ASCII y puntuacion tipografica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3, decoder-only: 18 capas, hidden 640, 4 cabezas (1 cabeza KV), FFN 2048, atencion de ventana deslizante + global |
| Parametros totales | 268.098.176 (unos 170M en la tabla de embeddings; el resto, unos 100M, ajustados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K en el modelo base; ajustado sobre dialogos cortos (hasta unos cientos de tokens) |
| Tipos de cuantizacion | bfloat16 (safetensors), float16 (GGUF F16), Q8_0 (GGUF 8 bits, 292 MB) |
| Idiomas soportados | Ruso (principal), ingles (comprension parcial) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors (bfloat16), pytorch_model.bin, GGUF (F16 y Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Gemma 3 decoder-only con 18 capas, dimension oculta de 640, 4 cabezas de atencion (con una sola cabeza KV, es decir, atencion multi-query o grouped-query con un unico grupo) y FFN de 2048. Combina atencion de ventana deslizante con atencion global y emplea un vocabulario de 262.144 tokens. El ajuste fino se realizo en bf16 con la tabla de embeddings congelada (que ademas actua como capa de salida), lo que preserva el enorme vocabulario original y permite que el entrenamiento quepa en 12 GB de VRAM. Se uso AdamW con learning rate 2e-5, weight decay 0.01, batch de 16, 3 epocas y perdida calculada solo sobre los tokens del asistente. Se publica el checkpoint con mejor perdida de validacion (epoca 2: loss 2.284, perplejidad 9.8). El entrenamiento completo duro unos 7,5 minutos.

Los datos de entrenamiento consisten en 12.981 dialogos cortos (unos 650K tokens). Aproximadamente 6.700 de ellos son dialogos informales escritos por Claude Haiku (Anthropic) a partir de una especificacion escrita, y el resto corresponde a los mismos dialogos empleados en SalgrAI-v2-Lite. La innovacion tecnica destacable no esta en la arquitectura sino en el uso de una mascara de vocabulario (`vocab_mask.py`) que pone a menos infinito los logits de todos los tokens que no sean cirilicos, ASCII, puntuacion tipografica comun o emojis, dejando unos 159.000 de los 262.144 tokens disponibles. Esta mascara redujo las respuestas con caracteres extranos de 95 a 0 sobre 300 prompts de validacion con muestreo (temperatura 0.8), sin degradar la puntuacion SBB (82 frente a 81 sin mascara).

## Capacidades

- Generacion de texto conversacional en ruso con estilo informal y coloquial ("ruso de Telegram en minusculas").
- Comprension parcial de ingles (heredada del modelo base), aunque el ajuste esta orientado al ruso.
- Conversacion multi-turno breve mediante la plantilla de chat de Gemma (`<start_of_turn>user ... <end_of_turn><start_of_turn>model ...`).
- Generacion restringida a caracteres cirilicos, ASCII y puntuacion mediante la mascara de vocabulario incluida.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo "thinking", vision ni audio.
- No dispone de filtro de seguridad o de profanidad propio mas alla del que ya incorpora Gemma.

## Casos de uso

- Demos y prototipos de chatbots en ruso: el modelo puede mantener conversaciones cortas de estilo informal en una unica GPU de consumo, lo que permite montar demos rapidas con llama.cpp o transformers sin infraestructura dedicada.
- Experimentacion educativa con fine-tuning: sirve como ejemplo reproducible de ajuste fino de un Gemma 3 de 270M en una RTX 3060 en menos de 10 minutos, util para aprender el flujo completo (datos, entrenamiento, evaluacion, cuantizacion).
- Generacion de respuestas coloquiales para pruebas de interfaz: util para poblar maquetas de aplicaciones de mensajeria con texto en ruso de estilo Telegram, gracias a su tono informal y a la mascara de vocabulario que evita caracteres extranos.
- Evaluacion de tecnicas de control de vocabulario: el repositorio incluye `vocab_mask.py` y datos comparativos (95 a 0 respuestas con caracteres extranos) que permiten estudiar el efecto de restringir logits en modelos con vocabularios multilingues grandes.
- Pruebas de despliegue ligero con llama.cpp: los GGUF F16 y Q8_0 (292 MB) permiten validar pipelines de servidor (`llama-server`) y el uso de `logit_bias` para restringir scripts, en entornos con recursos muy limitados.
- Investigacion sobre sesgos y alucinacion en modelos pequenos: su conocimiento factual debil y su entrenamiento con dialogos sinteticos lo convierten en un caso de estudio para medir alucinacion y deriva estilistica en modelos de menos de 300M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas internas de entrenamiento y evaluacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion (epoca 2) | 2.284 |
| Perplejidad de validacion (epoca 2) | 9.8 |
| Puntuacion SBB (sin mascara de vocabulario) | 81 |
| Puntuacion SBB (con mascara de vocabulario) | 82 |
| Respuestas con caracteres extranos (300 prompts, temp. 0.8, sin mascara) | 95 |
| Respuestas con caracteres extranos (300 prompts, temp. 0.8, con mascara) | 0 |
| Diferencia media de log-probabilidad F16 GGUF vs referencia fp32 | 0.0005 |
| Coincidencia de primer token F16 GGUF vs referencia fp32 | 10 de 10 prompts |
| Coincidencia de primer token Q8_0 vs referencia | 10 de 10 prompts |
| Coincidencia de respuesta greedy completa Q8_0 vs referencia | 9 de 10 prompts |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 0,55 GB para los pesos (268M parametros x 2 bytes) mas overhead de activaciones y cache KV; en Q8_0, unos 292 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; el autor entreno en una RTX 3060 de 12 GB, pero la inferencia cabe en GPUs mucho mas modestas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: transformers (con `AutoModelForCausalLM`), llama.cpp (`llama-server` con los GGUF F16 o Q8_0); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints, aunque no se detalla en la informacion disponible.
- Latencia y throughput estimados: no disponible. El unico dato temporal es el entrenamiento (unos 7,5 minutos), no la inferencia.
- Advertencia de precision: usar bfloat16 o float32; no ejecutar en float16 porque Gemma 3 es numericamente inestable en fp16 (las respuestas greedy difirieron de la referencia fp32 en 10 de 10 prompts, frente a 3 de 10 con bf16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SalgrAI-v2-Full | 268M | 32K (base); ajustado a dialogos cortos | ru, en | Gemma Terms of Use | Hugging Face (salgr/SalgrAI-v2-Full) |
| google/gemma-3-270m-it | 270M | 32K | multilingue | Gemma Terms of Use | Hugging Face (google/gemma-3-270m-it) |
| SalgrAI-v2-Lite | 25M | no disponible | ru (principal) | no disponible | Hugging Face (referenciado como ../SalgrAI-v2-Lite) |

SalgrAI-v2-Full se diferencia del Gemma 3 270M-it original por el ajuste fino en ruso coloquial y por la mascara de vocabulario incluida; a cambio, pierde parte de la cobertura multilingue y del conocimiento factual general del modelo base. Frente a SalgrAI-v2-Lite, ofrece un backbone preentrenado mucho mayor (268M frente a 25M) con los mismos dialogos de entrenamiento. No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Conocimiento factual muy debil: el autor lo describe explicitamente como no apto para uso serio.
- Riesgo de alucinacion elevado, derivado de su tamano reducido y de su entrenamiento sobre dialogos sinteticos.
- Sin mascara de vocabulario, aproximadamente un tercio de las respuestas muestreadas en las pruebas del autor contenian caracteres extranos (signos de interrogacion arabes, caracteres chinos, fragmentos pegados); es necesario aplicar `vocab_mask.py` o `logit_bias` para evitarlo.
- No dispone de filtro de seguridad ni de profanidad propio mas alla del que ya incorpora Gemma.
- El ajuste se realizo sobre dialogos cortos (hasta unos cientos de tokens), por lo que el rendimiento en contextos largos, aunque el modelo base soporte 32K, no esta validado.
- Inestabilidad numerica en float16: debe usarse bfloat16 o float32.
- Licencia Gemma Terms of Use: impone restricciones y obligaciones (incluido el aviso NOTICE) para uso comercial; es necesario revisar los terminos antes de cualquier despliegue en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Idioma principal ruso; el soporte de ingles es parcial y no esta cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/SalgrAI-v2-Full
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Version Lite (referenciada en la model card): ../SalgrAI-v2-Lite (ruta relativa dentro del repositorio del autor, sin URL absoluta disponible)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
