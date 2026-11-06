# Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-base

## Resumen

1pp-2.81b-v2-ua-rawanneal-base es un modelo de lenguaje de tipo decoder-only con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Con 2.807.699.328 parámetros, forma parte de la escalera de escalado "ladder v2" del estudio, que entrena cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B) bajo tres condiciones experimentales y tres semillas distintas, siempre desde cero y sobre el mismo flujo de datos alineado por pasos.

El modelo es un artefacto de investigacion, no un asistente de proposito general. Su condicion de entrenamiento combina documentos originales de DCLM-edu durante las primeras 48.339 iteraciones y, en el tramo de cooldown (las ultimas 5.370 de 53.709), conversaciones reescritas a partir de esos mismos documentos con perdida sobre los turnos de usuario y asistente. Esto lo convierte en una variante "mid-training" que permite comparar el efecto de sustituir texto documental por dialogos en la fase final del preentrenamiento.

La relevancia actual del modelo es metodologica: sirve para estudiar como la composicion del dato y la mascara de perdida afectan al comportamiento conversacional de modelos base de escala media, con contexto de 4.096 tokens y licencia Apache 2.0. No dispone de datos publicos de benchmarks ni de descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atencion / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos estan en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseno decoder-only clasico de la familia Llama: 24 capas con atencion multi-cabeza agrupada (21 cabezas de consulta y 7 de clave/valor, dimension de cabeza 128), FFN con activacion SwiGLU de dimension 10.752, normalizacion RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida no atados. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) mas un token `<|pad|>`; `<|endoftext|>` actua como fin de documento. La longitud de secuencia de entrenamiento es de 4.096 tokens, con enmascaramiento de atencion entre documentos.

El preentrenamiento cubre 53.709 pasos sobre el flujo alineado por pasos de 1PP, equivalentes a 112,64B posiciones de token, con batch global de 512 secuencias de 4.096 tokens. Durante los primeros 48.339 pasos se usan los documentos originales de DCLM-edu; en el cooldown (5.370 pasos) se sustituyen por conversaciones reescritas de esos mismos documentos, con perdida sobre turnos de usuario y asistente. El optimizador combina Muon (escalado por forma, LR matricial 0,005) para las matrices y Adam para el resto de parametros (LR 1,29e-3 en embeddings y capa de salida, 3e-3 en normas), con warmup de 3.378 pasos, decaimiento lineal hasta 1/100 en el cooldown, weight decay 0,1, init std 0,0078 y precision bf16. La perdida de validacion del checkpoint final sobre 2.433 documentos retenidos es 1,397 en texto de asistente, 1,308 en texto de usuario y 2,842 en texto documental.

## Capacidades

- Generacion de texto autoregresiva en ingles con formato conversacional ChatML, aunque el modelo es de base y no esta alineado con instrucciones.
- Produccion de dialogos en formato ChatML sin turno de sistema: `<|im_start|>user\n...<|im_end|>\n<|im_start|>assistant\n...<|im_end|>\n`.
- Generacion de texto documental plano (la condicion raw produce texto sin formato de chat).
- Razonamiento y conocimiento factual derivados del corpus DCLM-edu, sin evaluacion publica disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: solo ingles declarado; no se documenta cobertura de otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre composicion de datos de preentrenamiento: el modelo permite aislar el efecto de sustituir documentos por conversaciones reescritas en la fase de cooldown, comparandolo con la variante raw y con la variante de entrenamiento 1PP completo sobre el mismo flujo de pasos.
- Estudios de escalado controlado: al compartir flujo de datos y receta con los tamanos 0,58B, 0,98B y 1,66B, sirve para trazar curvas de perdida y comportamiento conversacional en funcion del numero de parametros.
- Analisis de semillas: las tres semillas (28, 42, 1234) solo cambian la inicializacion, lo que permite medir varianza de resultados sin confundirla con cambios de datos.
- Generacion de texto en ingles para experimentos de continuacion de documentos: su perdida de validacion de 2,842 en texto documental lo hace util como linea base de modelado de lenguaje puro.
- Prototipado de pipelines de evaluacion de modelos base: con 2,81B parametros y pesos safetensors, se puede desplegar en infraestructura modesta para pruebas de formatos de chat y mascaras de perdida.
- Reproduccion de resultados del estudio 1PP: la model card verifica los pesos de HuggingFace contra el checkpoint de Megatron con diferencias absolutas de 0,0013 y 0,0015 en perdida de validacion, lo que facilita la replicacion.
- Fine-tuning posterior en ingles: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para SFT o DPO en tareas concretas, aunque sin garantias de calidad conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdidas de validacion por token sobre 2.433 documentos retenidos:

| Conjunto | Perdida |
|---|---|
| Texto de asistente | 1,397 |
| Texto de usuario | 1,308 |
| Texto documental | 2,842 |
| Tokens de entrenamiento de esta condicion (`reweighted_seg1234`) | 1,392 |

Verificacion de pesos frente al checkpoint de Megatron:

| Conjunto | Perdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,3958 | 1,3971 | 0,0013 |
| raw_val50m segments [8] | 2,8430 | 2,8416 | 0,0015 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda al menos 8-10 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1,5-2 GB (no se publican variantes GGUF oficiales, habria que generarlas).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; RTX 4090, RTX 3090 o L40S para inferencia en bf16; GPUs consumer de 8 GB o mas para cuantizacion.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes, especialmente con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp son viables tecnicamente pero no estan documentados por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-rawanneal-base | 2,81B | 4.096 | Apache 2.0 | en | Artefacto de investigacion, sin benchmarks publicos |
| 1pp-2.81b-v2-raw-base | 2,81B | 4.096 | Apache 2.0 | en | Misma receta sin cooldown conversacional; linea base directa |
| 1pp-2.81b-v2-ua-base | 2,81B | 4.096 | Apache 2.0 | en | Entrenamiento 1PP completo, sin el tramo raw inicial |
| SmolLM2-1.7B | 1,7B | 8.192 (segun version) | Apache 2.0 | en (multilingue parcial) | Modelo base de referencia de escala similar; comparte tokenizador |

La comparacion con modelos de proposito general de 2-3B parametros (Qwen2.5-3B, Llama-3.2-3B, Gemma-2-2B) no es directa: este modelo es un artefacto de investigacion sin alineacion ni benchmarks, por lo que no se dispone de datos para comparar rendimiento.

## Limitaciones y advertencias

- Modelo de base sin alineacion: no sigue instrucciones de forma fiable y no debe usarse como asistente en produccion sin fine-tuning adicional.
- Solo ingles declarado; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Contexto limitado a 4.096 tokens, inferior al de muchos modelos contemporaneos de escala similar.
- Sin turno de sistema en el formato de chat: los modelos nunca vieron uno, por lo que inyectar un system prompt puede degradar la salida.
- Riesgo de alucinacion y de reproducir sesgos del corpus DCLM-edu, sin filtrado ni evaluacion de seguridad documentada.
- Cero descargas y cero likes en HuggingFace en el momento de redactar la ficha; no hay evidencia de uso en produccion.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor declara explicitamente que es un artefacto de investigacion y no un asistente de proposito general.
- El modelo se creo el 2026-11-06; los datos de validacion disponibles son unicamente los reportados por el autor.
- No se publican variantes cuantizadas oficiales; cualquier GGUF o AWQ habria que generarlo y validarlo por cuenta propia.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-base
- Variante raw: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-base
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
