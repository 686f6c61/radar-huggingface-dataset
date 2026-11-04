# Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base

## Resumen

1pp-0.98b-v2-raw-seed42-base es un modelo de lenguaje de tipo decoder Llama entrenado desde cero por Raghav-Singhal (proyecto One Persona Pretraining, 1PP, vinculado a EPFL DLAB). Forma parte de una escalera de escalado (ladder v2) que combina cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234). Esta variante concreta es el rung de 0,98B en la condicion "original documents" (raw) con semilla 42. No es un asistente de proposito general, sino un artefacto de investigacion disenado para estudiar como afecta la composicion de los datos de preentrenamiento al comportamiento del modelo.

El modelo tiene 981.545.472 parametros, 24 capas, hidden size de 1.536 y FFN de 6.144 con SwiGLU, con atencion de 12 cabezas y 4 cabezas KV (head dim 128). Usa RMSNorm, RoPE con base 10.000, embeddings no atados, sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) mas un token `<|pad|>`.

La relevancia de esta ficha es metodologica: el modelo pertenece a un diseno experimental controlado en el que todos los rungs comparten el mismo flujo de datos alineado por pasos y solo cambian el texto del documento y la mascara de perdida (condiciones) o la inicializacion de parametros (semillas). Entrenado durante los primeros 18.779 pasos de ese flujo (39,38B posiciones de token), sirve para comparar condiciones de preentrenamiento a igualdad de computo y datos, no para desplegarse como chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; repositorio de 2,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Llama con 24 capas, hidden size de 1.536, FFN de 6.144 con activacion SwiGLU y atencion con 12 cabezas de consulta y 4 cabezas KV (GQA, head dim 128). Emplea RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, ausencia de sesgos y de QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se anade `<|pad|>`; `<|endoftext|>` actua como token de fin de documento. La longitud de secuencia de entrenamiento es de 4.096 tokens.

El preentrenamiento usa los documentos originales de DCLM-edu, con perdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se cubren los primeros 18.779 pasos del flujo alineado por pasos de 1PP (39,38B posiciones de token), que coinciden con los primeros pasos de la pasada de 31.777 pasos del estudio principal en el mismo orden. El batch global es de 512 secuencias x 4.096 tokens, con mascara de atencion entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) para las matrices y Adam para el resto de parametros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas); warmup de 1.181 pasos, fase constante y decaimiento lineal en los ultimos 1.877 pasos hasta 1/100; weight decay 0,1; desviacion tipica de inicializacion 0,0103; entrenamiento en bf16. La perdida de validacion del checkpoint final sobre 2.433 documentos retenidos es de 2,633 por token en texto de asistente, 2,672 en texto de usuario y 2,497 en texto de documento. La verificacion cruzada frente al checkpoint de Megatron da diferencias absolutas de 0,0016 en los conjuntos val50m y raw_val50m.

## Capacidades

- Generacion de texto autoregresiva en ingles, con formato de chat ChatML sin turno de sistema.
- Modelo base: la condicion raw produce texto plano, no respuestas conversacionales; las condiciones conversacionales de la ladder producen texto con formato de chat.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (vision, audio) ni modo de pensamiento (thinking mode).
- Multilingue limitado al ingles segun la model card.
- Parada de generacion en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos incluidos en `eos_token_id`.
- Plantilla de chat incluida que renderiza el formato ChatML sin sistema.

## Casos de uso

- Investigacion sobre preentrenamiento controlado: el modelo sirve como rung de 0,98B en la ladder v2 para comparar condiciones de datos (raw frente a conversacional) y semillas a igualdad de pasos y flujo de datos, aislando el efecto de la composicion del corpus.
- Estudios de escalado de leyes: al compartir flujo de datos y receta con los rungs de 0,58B, 1,66B y 2,81B, permite ajustar curvas de perdida frente a parametros y tokens (20,3 tokens de asistente por parametro).
- Reproducibilidad de recetas de entrenamiento: la documentacion detalla optimizador Muon, tasas de aprendizaje, warmup y decaimiento, lo que facilita replicar el entrenamiento en infraestructura propia con Megatron o frameworks compatibles.
- Analisis de perdida por tipo de token: las perdidas de validacion desglosadas por texto de asistente, usuario y documento permiten estudiar como distribuye el modelo su capacidad entre formatos.
- Evaluacion de tokenizadores: al usar el vocabulario de SmolLM2 con 49.152 entradas, sirve para comparar eficiencia de tokenizacion y cobertura en corpus educativos en ingles.
- Generacion de texto plano en ingles para tareas de continuacion o prompts de investigacion, aceptando que al ser un modelo base la calidad conversacional no esta garantizada.
- Verificacion de conversiones de checkpoints: los pesos de HuggingFace estan validados contra el checkpoint de Megatron con diferencias de 0,0016 en perdida, util como referencia para pipelines de conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion por token:

| Conjunto | Perdida por token |
|---|---|
| Texto de asistente | 2,633 |
| Texto de usuario | 2,672 |
| Texto de documento | 2,497 |
| Tokens de entrenamiento de esta condicion (`raw_doc_eod(8+5)`) | 2,498 |

Verificacion de pesos frente a Megatron:

| Conjunto | Perdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,6316 | 2,6332 | 0,0016 |
| raw_val50m segments [8] | 2,4987 | 2,4971 | 0,0016 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2 GB solo para pesos (981,5M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica unos 3-4 GB con contexto completo de 4.096 tokens.
- En cuantizacion de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB. No se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o throughput alto, A100 o H100.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con al menos 6 GB de VRAM.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM requeririan conversion a GGUF o configuracion especifica no documentada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-raw-seed42-base | 981,5M | 4.096 | Apache 2.0 | HuggingFace | Modelo base de investigacion, solo ingles |
| SmolLM2-1.7B | 1,7B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Mayor tamano; comparte familia de tokenizador (vocabulario 49.152) |
| Llama 3.2 1B | 1,2B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace | Alternativa de tamano similar orientada a uso general |

La comparacion con alternativas comerciales o de uso general no esta respaldada por datos de benchmarks en la informacion disponible; las diferencias principales son el caracter de artefacto de investigacion, el contexto de 4.096 tokens y el soporte exclusivo de ingles.

## Limitaciones y advertencias

- Es un modelo base de investigacion, no un asistente de proposito general; la model card lo declara explicitamente.
- La condicion raw genera texto plano, sin formato conversacional; no debe esperarse comportamiento de chat.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Contexto limitado a 4.096 tokens, inferior al de modelos contemporaneos de uso general.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, especialmente al no haber pasado por RLHF ni DPO.
- Sesgos potenciales heredados de DCLM-edu, un corpus web filtrado por criterios educativos, sin documentacion de mitigacion.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento; no deben asumirse.
- No se publican cuantizaciones oficiales; el uso en llama.cpp u Ollama requeriria conversion propia.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para produccion ni para tareas sensibles.
- El formato de chat no incluye turno de sistema; introducirlo puede degradar la calidad de las respuestas.
- Sin datos de benchmarks publicos que permitan evaluar su rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
