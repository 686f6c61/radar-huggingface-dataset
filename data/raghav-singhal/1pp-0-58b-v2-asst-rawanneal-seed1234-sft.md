# Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-seed1234-sft

## Resumen

El modelo `1pp-0.58b-v2-asst-rawanneal-seed1234-sft` es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal (EPFL DLAB) dentro del proyecto de investigación One Persona Pretraining (1PP). Se trata de un artefacto de investigación, no de un asistente de propósito general, diseñado para estudiar cómo influye la composición del corpus de preentrenamiento y la máscara de pérdida en el comportamiento conversacional de modelos pequeños. La variante concreta combina un preentrenamiento sobre documentos DCLM-edu seguido de un cooldown sobre conversaciones reescritas a partir de esos mismos documentos, con pérdida únicamente en los turnos del asistente, y posteriormente un ajuste supervisado (SFT).

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (atención GQA con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador reutiliza el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

El modelo forma parte de la escalera (ladder) v2 del estudio, que cubre cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234), entrenados desde cero sobre el mismo flujo de datos alineado por pasos. Su relevancia es metodológica: permite comparar de forma controlada el efecto de convertir documentos en conversaciones durante la fase de cooldown, con todos los demás factores fijados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama; 24 capas; hidden 1.152; FFN 4.608 (SwiGLU); 9 cabezas de atención / 3 KV; head dim 128; RMSNorm; RoPE base 10.000; embeddings no atados; sin sesgos; sin QK-norm |
| Parametros totales | 580.445.568 (0,58B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones publicadas; al ser safetensors en bf16, es convertible a GGUF/AWQ/GPTQ con herramientas estándar, pero no se ha verificado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 24 capas con atención GQA (9 cabezas de consulta y 3 de clave/valor), FFN SwiGLU de 4.608 unidades, RMSNorm y RoPE con base 10.000. El tokenizador es el de SmolLM2 (49.152 tokens) más `<|pad|>`, con `<|endoftext|>` como token de fin de documento. La secuencia máxima es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos.

El preentrenamiento sigue una estrategia de "raw anneal": los primeros 9.996 pasos se entrenan sobre documentos originales de DCLM-edu y los últimos 1.110 pasos (el cooldown) sobre conversaciones reescritas a partir de esos mismos documentos, con pérdida solo en los turnos del asistente. En total son 11.106 pasos del flujo alineado del estudio 1PP (23,29B posiciones de token), con batch global de 512 × 4.096 tokens. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación de inicialización 0,0119 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos retenidos es de 1,807 en texto de asistente, 3,422 en texto de usuario y 3,194 en texto de documento.

Posteriormente se aplica un SFT de una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. El SFT usa el mismo stack (Megatron, Muon), ChatML sin turno de sistema, pérdida solo en turnos de asistente, LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida SFT retenida sobre tokens de asistente (1.998 conversaciones) es de 2,136. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación, con una diferencia absoluta de 0,0000.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento básico y respuesta a instrucciones derivados del SFT sobre mezclas multiturno y de seguridad.
- Conversaciones multiturno dentro de una ventana de 4.096 tokens.
- Capacidad de seguir el formato de chat con tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` como criterios de parada.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explícito (thinking), visión, audio ni otras modalidades.
- Multilingüismo limitado al inglés según la model card; no se han publicado evaluaciones en otros idiomas.
- Alineación de seguridad parcial, procedente de una muestra de 30k conversaciones del conjunto `dlab-spp/sp-sft-safety-180k`.

## Casos de uso

- Investigación sobre preentrenamiento: el modelo sirve como punto de comparación controlado para medir el efecto de sustituir documentos por conversaciones durante el cooldown, manteniendo fijos tamaño, semilla y orden de batches.
- Reproducción de experimentos de escalado: al formar parte de una escalera de cuatro tamaños y tres semillas, permite estudiar leyes de escalado y variabilidad entre inicializaciones con datos alineados por pasos.
- Evaluación de metodologías de SFT: su mezcla de 400k conversaciones y su pérdida retenida de 2,136 permiten comparar recetas de ajuste supervisado en modelos pequeños.
- Prototipado de chatbots de dominio acotado en inglés: con 0,58B parámetros y licencia Apache 2.0, puede desplegarse en entornos de desarrollo para validar pipelines de inferencia conversacional antes de pasar a modelos mayores.
- Estudio de formatos de chat: al no haber visto nunca un turno de sistema, es útil para analizar cómo afecta la ausencia de system prompt al comportamiento y a la robustez del modelo.
- Docencia y experimentación con cuantización: su tamaño reducido (1,2 GB en safetensors bf16) permite probar técnicas de cuantización y despliegue en hardware modesto con fines formativos.
- Análisis de sesgos y seguridad en modelos pequeños: la inclusión de un subconjunto de seguridad en el SFT permite estudiar la eficacia de estas mezclas a esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de asistente | 1,807 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de usuario | 3,422 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de documento | 3,194 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida ponderada por la condición (`reweighted_seg34`) | 1,854 |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 2,136 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | Pérdida HF / referencia / diferencia absoluta | 2,1359 / 2,1358 / 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 0,6-0,8 GB de pesos; en 4 bits: alrededor de 0,3-0,4 GB, aunque estas conversiones no están publicadas ni verificadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060, RTX 4090) es suficiente; para lotes grandes o mayor throughput, A100 o H100 aportan margen pero no son necesarias.
- Cabe holgadamente en GPU consumer, incluidas las de gama de entrada con 4-6 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; al ser safetensors estándar, es convertible a GGUF para llama.cpp/Ollama y a formatos de vLLM, aunque no se documenta ninguna conversión oficial.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-asst-rawanneal-seed1234-sft | 0,58B | 4.096 | Apache 2.0 | Hugging Face (0 descargas) | Artefacto de investigación con SFT |
| 1pp-0.58b-v2-asst-seed1234-sft | 0,58B | 4.096 | Apache 2.0 | Hugging Face | Misma escalera, condición 1PP completa sin raw anneal |
| 1pp-0.58b-v2-raw-seed1234-base | 0,58B | 4.096 | Apache 2.0 | Hugging Face | Modelo base sin cooldown sobre conversaciones ni SFT |
| SmolLM2-360M / SmolLM2-1.7B | 0,36B / 1,7B | 8.192 (SmolLM2) | Apache 2.0 | Hugging Face | Referencia de modelos pequeños; comparte tokenizador, pero no se han publicado comparaciones directas |

No se dispone de comparaciones de rendimiento publicadas frente a estos u otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación (EPFL DLAB), no un asistente de propósito general; el propio autor lo advierte en la model card.
- Solo soporta inglés; no se han evaluado capacidades en otros idiomas.
- Ventana de contexto limitada a 4.096 tokens, inferior a la de muchos modelos pequeños actuales.
- No ha visto nunca un turno de sistema durante el entrenamiento, por lo que los system prompts pueden degradar el comportamiento o ser ignorados.
- Riesgo de alucinación inherente a un modelo de 0,58B entrenado con 23,29B posiciones de token; no se han publicado evaluaciones de factualidad.
- Sesgos no caracterizados: no se documentan análisis de sesgo, toxicidad ni evaluaciones de seguridad más allá de la inclusión de un subconjunto de seguridad en el SFT.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su uso en producción sin evaluación previa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan conversiones a GGUF, cuantizaciones publicadas ni integraciones verificadas con vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-seed1234-sft
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-seed1234-sft
- Modelo base raw: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
