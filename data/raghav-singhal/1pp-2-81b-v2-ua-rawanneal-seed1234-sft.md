# Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed1234-sft

## Resumen

`1pp-2.81b-v2-ua-rawanneal-seed1234-sft` es un modelo de lenguaje de tipo decoder-only estilo Llama, con 2.807.699.328 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación concebido para estudiar cómo influye la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) y la semilla de inicialización en el comportamiento final del modelo, manteniendo constante el resto del pipeline.

El modelo pertenece a la "escalera" v2 del proyecto: cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de datos y tres semillas (28, 42 y 1234), cada uno entrenado desde cero durante 20,3 tokens de asistente por parámetro sobre un flujo de datos alineado por paso. Esta variante concreta corresponde a la condición "ua" (user+assistant loss en el cooldown), semilla 1234, y añade una fase de ajuste supervisado (SFT) sobre 400.000 conversaciones. Su relevancia es metodológica: permite aislar el efecto de la estrategia de datos y de la inicialización en modelos de escala media con un protocolo reproducible.

Arquitectónicamente es un transformer denso de 24 capas con contexto de 4.096 tokens, vocabulario SmolLM2 de 49.152 entradas y licencia Apache 2.0. El modelo solo declara soporte de inglés y su model card lo describe explícitamente como un artefacto de investigación, no como un asistente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bf16; al ser un modelo Llama estándar es convertible a GGUF/AWQ/GPTQ con herramientas habituales, aunque el autor no lo documenta) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repositorio de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención con 7 KV heads (GQA implícito, head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos (cross-document attention masking).

El preentrenamiento cubre los primeros 53.709 pasos del flujo alineado por paso del proyecto (112,64B posiciones de token), con batch global de 512 × 4.096 tokens. Durante los primeros 48.339 pasos se entrenan los documentos originales de DCLM-edu; en los últimos 5.370 pasos (el cooldown) se sustituyen por conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre los turnos de usuario y asistente. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 3.378 pasos, fase constante y decaimiento lineal hasta 1/100 en el cooldown, weight decay 0,1, init std 0,0078 y precisión bf16. La pérdida de validación por token sobre 2.433 documentos retenidos es de 1,397 en texto de asistente, 1,309 en texto de usuario y 2,848 en texto de documento.

Sobre esa base se aplica una época de SFT sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin duplicados del primero (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. El SFT reutiliza el mismo stack (Megatron, Muon), formato ChatML sin turno de sistema y pérdida solo sobre turnos de asistente, con LR matricial 0,001, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT en validación (1.998 conversaciones retenidas, tokens de asistente) es de 1,743, y la verificación de los pesos HF frente al checkpoint de Megatron arroja una diferencia absoluta de 0,0000 en el conjunto de validación.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema; el template incluido renderiza exactamente ese formato y la generación se detiene en `<|im_end|>` o `<|endoftext|>`.
- Razonamiento y respuesta multiturno básica, derivada del entrenamiento sobre conversaciones reescritas y del SFT con 98,5k diálogos multiturno.
- Alineación de seguridad parcial, gracias a la muestra de 30k conversaciones del conjunto `sp-sft-safety-180k`.
- Seguimiento de instrucciones en inglés dentro de la ventana de 4.096 tokens.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes, multi-step reasoning estructurado ni modo "thinking".
- No dispone de capacidades de visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés según la model card; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre estrategias de datos de preentrenamiento: el modelo sirve como punto de comparación controlado frente a las otras condiciones y semillas de la escalera 1PP, permitiendo medir el efecto del cooldown con conversaciones frente al entrenamiento solo con documentos.
- Reproducción de experimentos de escalado: al estar entrenado con 20,3 tokens de asistente por parámetro y un flujo alineado por paso, encaja en estudios que necesiten aislar el efecto del tamaño y de la inicialización con un protocolo fijo.
- Evaluación de modelos pequeños con contexto medio: sus 4.096 tokens y 2,81B de parámetros lo hacen adecuado como baseline en benchmarks de razonamiento y generación en inglés dentro de entornos académicos.
- Ajuste fino posterior con propósitos de investigación: la licencia Apache 2.0 y los pesos en safetensors permiten experimentar con SFT adicional, DPO o cuantización sin restricciones de uso comercial.
- Prototipado de pipelines de generación de texto en inglés: útil para validar plantillas ChatML, lógica de parada por EOS y integración con transformers o text-generation-inference antes de migrar a un modelo de producción.
- Estudio de alineación y seguridad: la mezcla de SFT incluye conversaciones de seguridad, lo que permite analizar el comportamiento del modelo ante prompts sensibles en comparación con las otras semillas y condiciones.
- Docencia y divulgación técnica: su tamaño moderado y su documentación detallada de hiperparámetros lo convierten en un ejemplo didáctico de pipeline completo de preentrenamiento y SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Metrica | Valor |
|---|---|
| Pérdida de validación en texto de asistente (preentrenamiento) | 1,397 |
| Pérdida de validación en texto de usuario (preentrenamiento) | 1,309 |
| Pérdida de validación en texto de documento (preentrenamiento) | 2,848 |
| Pérdida de validación ponderada por condición (`reweighted_seg1234`) | 1,392 |
| Pérdida de SFT en tokens de asistente (1.998 conversaciones retenidas) | 1,743 |
| Diferencia absoluta HF vs. Megatron (sft_val segmentos [3, 4]) | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 5,6 GB solo para pesos, más KV cache y activaciones; con 4.096 tokens de contexto y GQA de 7 KV heads el overhead adicional es moderado, por lo que 8 GB de VRAM suelen ser suficientes en la práctica.
- Cuantización a 8 bits: aproximadamente 2,8-3 GB de pesos; a 4 bits: aproximadamente 1,4-1,5 GB, aunque el autor no publica versiones cuantizadas oficiales.
- GPU recomendadas para servicio: A100, H100 o L40S para throughput alto; RTX 4090 y RTX 3090 son suficientes para inferencia individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 3080, RTX 4090) usando bf16 o cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); al ser una arquitectura Llama estándar es compatible con vLLM, llama.cpp y Ollama mediante conversión a GGUF, aunque el autor no lo documenta explícitamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| `1pp-2.81b-v2-ua-rawanneal-seed1234-sft` | 2,81B | 4.096 | Apache 2.0 | en | Artefacto de investigación con SFT; sin benchmarks publicados |
| `1pp-2.81b-v2-ua-seed1234-sft` (misma escalera) | 2,81B | 4.096 | Apache 2.0 | en | Variante de referencia completa del mismo proyecto, sin el cooldown "rawanneal" |
| `1pp-2.81b-v2-raw-seed1234-base` | 2,81B | 4.096 | Apache 2.0 | en | Run base sin cooldown con conversaciones ni SFT |
| SmolLM2-1.7B (referencia de tokenizador) | 1,7B | 8.192 | Apache 2.0 | en (multilingüe parcial) | Modelo público de Hugging Face con benchmarks publicados; no comparable en protocolo de entrenamiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor lo describe como un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no como un asistente de propósito general; no debería desplegarse en producción sin una evaluación adicional.
- Sesgos conocidos: no documentados explícitamente; al entrenarse sobre DCLM-edu y conversaciones derivadas, hereda los sesgos de esas fuentes.
- Riesgo de alucinación: no cuantificado; la pérdida de validación en texto de documento (2,848) es notablemente superior a la de texto conversacional, lo que sugiere una modelización más débil del conocimiento factual.
- Limitación de contexto: 4.096 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducir uno en el prompt puede degradar el comportamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de benchmarks y de evaluación de seguridad hace desaconsejable ese uso sin validación propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte documentado.
- No se han publicado versiones cuantizadas oficiales ni guías de despliegue más allá de transformers y text-generation-inference.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed1234-sft
- Variante de referencia completa: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed1234-sft
- Run base sin cooldown conversacional ni SFT: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
