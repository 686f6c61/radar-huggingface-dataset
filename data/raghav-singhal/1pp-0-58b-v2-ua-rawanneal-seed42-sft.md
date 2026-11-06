# Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-seed42-sft

## Resumen

El modelo `1pp-0.58b-v2-ua-rawanneal-seed42-sft` es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el contexto del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general, diseñado para estudiar cómo afecta al entrenamiento la inclusión de conversaciones reescritas a partir de documentos originales durante la fase de cooldown del preentrenamiento. La variante "rawanneal" combina un tramo inicial de preentrenamiento sobre documentos DCLM-edu con un tramo final (cooldown) sobre conversaciones derivadas de esos mismos documentos, seguido de un ajuste supervisado (SFT).

El modelo forma parte de la "ladder v2", una escalera de escalado con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de entrenamiento y tres semillas (28, 42 y 1234), donde cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre un flujo de datos alineado por pasos. La relevancia actual es metodológica: permite aislar el efecto de la condición de datos y de la inicialización manteniendo constante el resto del pipeline, lo que resulta útil para investigadores que estudian recetas de preentrenamiento y ajuste conversacional a pequeña escala.

Arquitectónicamente es un decoder estilo Llama de 24 capas, con atención de 9 cabezas y 3 cabezas KV, FFN SwiGLU de 4.608, embeddings no atados, sin sesgos ni QK-norm, y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token de padding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atencion / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ por terceros) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo emplea un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención con 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre las primeras 11.106 iteraciones (23,29B posiciones de token) del flujo alineado por pasos del estudio principal: durante las primeras 9.996 iteraciones se entrenó con documentos DCLM-edu originales y durante las últimas 1.110 (el cooldown) con conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre los turnos de usuario y asistente. El batch global fue de 512 × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador combina Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0119 y precisión bf16. La pérdida de validación por token sobre 2.433 documentos retenidos fue de 1,806 para texto de asistente, 1,673 para texto de usuario y 3,162 para texto de documento.

Tras el preentrenamiento se aplicó un SFT de una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. El SFT usó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT en validación (1.998 conversaciones retenidas, tokens de asistente) fue de 2,125.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta multiturno dentro de una ventana de 4.096 tokens.
- Generación de código y matemáticas a nivel básico, derivada de la mezcla de SFT (no se publican evaluaciones específicas).
- Seguimiento de instrucciones y respuestas de seguridad, gracias a la inclusión de 30k muestras del conjunto `sp-sft-safety-180k`.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente, planificación multietapa ni modo "thinking" explícito.
- Capacidad multilingüe limitada al inglés (idioma declarado: `en`).
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Investigación sobre recetas de preentrenamiento: el modelo sirve como punto de comparación controlado (misma semilla, mismo flujo de datos) frente a las otras condiciones de la ladder v2 para medir el efecto de reescribir documentos como conversaciones durante el cooldown.
- Experimentos de ablación de inicialización: al compartirse el orden de batches entre semillas, permite aislar el efecto de la inicialización de parámetros sobre la pérdida de validación y el comportamiento conversacional.
- Evaluación de alineación y seguridad a pequeña escala: la mezcla de SFT incluye datos de seguridad, por lo que puede usarse como baseline en estudios de robustez frente a prompts adversarios.
- Generación de texto en inglés para tareas de laboratorio: con 580M parámetros y contexto de 4.096 tokens, es adecuado para prototipos de chatbots de dominio acotado donde el coste computacional es crítico.
- Destilación y generación de datos sintéticos: puede emplearse para producir pares pregunta-respuesta en inglés dentro de pipelines de aumento de datos, siempre con revisión humana por su tendencia a la alucinación.
- Despliegue en hardware modesto: al caber en GPUs de consumo con cuantización de 8 o 4 bits, es viable para demos locales y pruebas de integración con `transformers` o `text-generation-inference`.
- Estudio de formatos de chat: su plantilla ChatML sin turno de sistema es útil para investigar cómo afecta la ausencia de mensaje de sistema al comportamiento del modelo.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La información disponible se limita a pérdidas de validación internas:

| Metrica | Valor |
|---|---|
| Perdida de validacion, texto de asistente (preentrenamiento) | 1,806 |
| Perdida de validacion, texto de usuario (preentrenamiento) | 1,673 |
| Perdida de validacion, texto de documento (preentrenamiento) | 3,162 |
| Perdida de validacion ponderada (`reweighted_seg1234`) | 1,783 |
| Perdida de SFT en validacion (tokens de asistente, 1.998 conversaciones) | 2,125 |
| Verificacion HF vs Megatron (sft_val segmentos [3, 4]) | 2,1247 vs 2,1247 (diferencia absoluta 0,0000) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB con contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 0,7-1 GB de pesos; en 4 bits, aproximadamente 0,4-0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090, A10, L4); para despliegue en producción con concurrencia, A100 o H100 aportan mayor throughput.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`), y conversión a GGUF para `llama.cpp` u `Ollama` (no publicada por el autor, pero factible por el formato safetensors).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-ua-rawanneal-seed42-sft | 580M | 4.096 | Apache 2.0 | Hugging Face | Artefacto de investigacion, solo ingles |
| 1pp-0.58b-v2-ua-seed42-sft | 580M | 4.096 | Apache 2.0 | Hugging Face | Misma ladder, condicion 1PP completa (referencia del autor) |
| 1pp-0.58b-v2-raw-seed42-base | 580M | 4.096 | Apache 2.0 | Hugging Face | Modelo base sin cooldown conversacional ni SFT |
| SmolLM2-360M / SmolLM2-1.7B | 360M / 1,7B | 8.192 | Apache 2.0 | Hugging Face | Alternativas de tamano comparable con tokenizador compartido; no se dispone de comparacion de rendimiento publicada en esta ficha |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con estos modelos.

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor lo describe como artefacto del proyecto 1PP (EPFL DLAB), no como asistente de proposito general.
- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo elevado de alucinacion por su tamano reducido (580M) y por el dominio acotado de los datos de entrenamiento.
- No dispone de soporte de tool calling ni de capacidades de agente, lo que limita su integracion en pipelines automatizados complejos.
- La plantilla de chat no incluye turno de sistema; introducir uno puede degradar el comportamiento porque el modelo nunca lo vio durante el entrenamiento.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre DCLM-edu y mezclas de SFT de terceros, puede heredar sesgos de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de rendimiento y seguridad desaconseja su uso en produccion sin validacion previa.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que refleja una adopcion practicamente nula y ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-seed42-sft
- Variante de referencia (condicion 1PP completa): https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-seed42-sft
- Modelo base de la variante raw: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
