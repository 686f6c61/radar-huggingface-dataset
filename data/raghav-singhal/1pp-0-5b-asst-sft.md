# Raghav-Singhal/1pp-0.5b-asst-sft

## Resumen

El modelo **1pp-0.5b-asst-sft** es un experimento de investigación del proyecto *One Persona Pretraining* (1PP) del laboratorio EPFL DLAB, desarrollado por Raghav-Singhal. Con 580 millones de parámetros, forma parte de un estudio sistemático de 3 × 3: tres tamaños (0.5B, 1B y 1.7B) por tres condiciones de pretraining sobre el mismo corpus de 47,8 millones de documentos. Esta variante concreta se entrenó con conversaciones reescritas a partir de los documentos originales, aplicando la función de pérdida únicamente sobre los turnos de asistente, y posteriormente se sometió a un ajuste fino supervisado (SFT).

El modelo resuelve una pregunta de investigación: cómo influye el formato de los datos de pretraining (documentos originales frente a conversaciones reescritas) y la máscara de pérdida en el comportamiento conversacional del modelo resultante. Su relevancia radica en que aporta evidencia empírica sobre metodologías de pretraining orientadas a tareas de diálogo, un área de creciente interés en la comunidad open source. La arquitectura es un decoder estilo Llama con 24 capas, contexto de 4096 tokens y tokenizador basado en SmolLM2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1152, FFN 4608 SwiGLU, 9 heads / 3 KV heads, head dim 128, RMSNorm, RoPE base 10000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 (0,58B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16/fp32 en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño clasico de Llama: transformer decoder con 24 capas, dimension oculta de 1152, FFN de 4608 con activacion SwiGLU, 9 cabezas de atencion con 3 cabezas KV (grouped-query attention), normalizacion RMSNorm, embeddings no atados y sin sesgos. La longitud de secuencia es de 4096 tokens y el tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) mas el token especial `<|pad|>`, con `<|endoftext|>` como token de fin de documento.

El pretraining se realizo sobre 47,8 millones de documentos reescritos como conversaciones (63,0 mil millones de tokens en formato conversacional, frente a 66,2 mil millones en los documentos originales), con una sola pasada y 31.777 pasos de optimizacion. Se aplico enmascaramiento de atencion entre documentos y empaquetado best-fit con asignacion de documentos alineada por pasos. El optimizador fue Muon (con Adam para embeddings y normas), con learning rate de matriz 0.005, warmup de 2000 pasos, decaimiento lineal en el ultimo 10% hasta 1/100, weight decay 0.1 y precision bf16. La perdida se calculo solo sobre los turnos de asistente, ignorando los turnos de usuario y el token de fin de documento.

El ajuste fino supervisado (SFT) consistio en una epoca sobre una mezcla de 400.000 conversaciones procedentes de tres datasets: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno con citas de constitucion), `dlab-spp/sp-sft-normal-300k` (271,6k tras eliminar duplicados) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se uso el mismo stack que en el pretraining (Megatron, Muon, formato ChatML sin turno de sistema) con perdida solo en turnos de asistente. El learning rate de matriz se selecciono entre {0.0005, 0.001, 0.002, 0.005} por perdida en validacion, resultando 0.002, con batch global de 128 × 4096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generacion de texto conversacional en ingles, con formato ChatML sin turno de sistema (el modelo nunca vio uno durante el entrenamiento).
- Mantenimiento de conversaciones multi-turno dentro de la ventana de contexto de 4096 tokens.
- Capacidad limitada de razonamiento y respuesta a instrucciones, derivada del SFT sobre datos de asistente.
- No soporta tool calling, function calling, ni capacidades de agente.
- No dispone de modo de pensamiento explicito, vision ni audio.
- Es un modelo de investigacion, no un asistente generalista; su comportamiento fuera del dominio conversacional puede ser impredecible.

## Casos de uso

- Investigacion en metodologias de pretraining: permite comparar el efecto del formato de datos (documentos vs. conversaciones) y de la mascara de perdida en el comportamiento final del modelo, dentro del estudio 1PP.
- Analisis de alineacion conversacional: util para estudiar como el entrenamiento con perdida solo en turnos de asistente afecta a la calidad y coherencia de las respuestas generadas.
- Experimentos de ajuste fino: sirve como punto de partida para probar tecnicas de SFT, RLHF o DPO en un modelo pequeno y rapido de iterar.
- Evaluacion de metricas de validacion: los valores de perdida publicados (asistente 1.579, usuario 6.878, documento 3.372) permiten reproducir y verificar experimentos.
- Educacion y formacion: adecuado para ensenar conceptos de pretraining, fine-tuning y evaluacion de modelos de lenguaje en entornos academicos.
- Pruebas de infraestructura: al ser un modelo de 0,58B, es util para validar pipelines de inferencia (vLLM, TGI, llama.cpp) con bajo coste computacional antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta perdidas de validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion (texto de asistente) | 1.579 |
| Perdida de validacion (texto de usuario) | 6.878 |
| Perdida de validacion (texto de documento) | 3.372 |
| Perdida SFT en validacion (tokens de asistente) | 2.023 |

Estos valores se obtuvieron sobre 2.433 documentos retenidos (pretraining) y 1.998 conversaciones retenidas (SFT), y se verificaron contra el checkpoint de Megatron con diferencia absoluta de 0.0000.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB (580M parametros × 2 bytes), mas overhead de activaciones y cache KV.
- Con cuantizacion int8 (no publicada oficialmente, pero posible con herramientas como llama.cpp): alrededor de 0,6 GB.
- Con cuantizacion int4 (tambien posible externamente): alrededor de 0,3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, o incluso CPU sola con llama.cpp).
- Cabe sin problemas en GPUs consumer de gama baja; no requiere hardware de datacenter.
- Opciones de despliegue: transformers (Python), vLLM, text-generation-inference (TGI), llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo pequeno, se espera una generacion rapida incluso en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos de la misma categoria. El modelo pertenece a la coleccion 1PP, que incluye otras variantes de 0.5B, 1B y 1.7B con diferentes condiciones de pretraining (documentos originales, conversaciones con perdida en asistente, conversaciones con perdida en ambos turnos). El tokenizador comparte base con SmolLM2, pero no hay benchmarks publicados que permitan una comparacion cuantitativa. Se recomienda consultar la [coleccion 1PP](https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649) para acceder a las demas variantes.

## Limitaciones y advertencias

- Modelo experimental de investigacion, no disenado para uso en produccion ni como asistente general.
- Entrenado exclusivamente en ingles; no soporta otros idiomas.
- No soporta turno de sistema en el formato ChatML; insertar uno puede degradar el rendimiento.
- Ventana de contexto limitada a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinaciones y respuestas incoherentes fuera del dominio conversacional, dado que el pretraining se baso en conversaciones reescritas.
- No se han evaluado sesgos de genero, raza o religion; el corpus de origen puede contener sesgos no documentados.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que no es un asistente de proposito general.
- No hay garantias de soporte ni mantenimiento; el modelo se publica como artefacto de investigacion.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Raghav-Singhal/1pp-0.5b-asst-sft)
- [Coleccion 1PP](https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649)
- [Logs de entrenamiento (wandb 1pp-training)](https://wandb.ai/raghav_singhal/1pp-training)
- [Logs de SFT (wandb 1pp-sft)](https://wandb.ai/raghav_singhal/1pp-sft)
