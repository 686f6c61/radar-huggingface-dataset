# Raghav-Singhal/1pp-2.81b-v2-asst-sft

## Resumen

1pp-2.81b-v2-asst-sft es el escalon de 2,81B parametros de la escalera de entrenamiento "One Persona Pretraining" (1PP), un artefacto de investigacion desarrollado por Raghav-Singhal en el marco del proyecto 1PP de EPFL DLAB. No es un asistente de proposito general, sino un modelo experimental disenado para estudiar como escala el aprendizaje de una persona concreta en funcion del tamano del modelo, la condicion de preentrenamiento y la semilla de inicializacion.

El modelo parte de un preentrenamiento sobre conversaciones reescritas a partir de documentos, con la funcion de perdida aplicada unicamente a los turnos del asistente, seguido de un ajuste supervisado (SFT) sobre 400.000 conversaciones. La escalera completa abarca cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones y tres semillas, todos entrenados desde cero sobre el mismo flujo de datos alineado por pasos durante 20,3 tokens de asistente por parametro.

Su relevancia es metodologica: permite aislar el efecto del escalado y de la condicion de preentrenamiento en un entorno controlado con datos y orden de lotes identicos entre semillas. La arquitectura es un decoder estilo Llama con 24 capas, contexto de 4.096 tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atencion / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en bf16 en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso al estilo Llama con 24 capas, dimension oculta de 2.688 y FFN de 10.752 con activacion SwiGLU. Emplea 21 cabezas de atencion y 7 cabezas KV (GQA con head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y ninguna normalizacion QK. El tokenizador combina el vocabulario de SmolLM2 (49.152 tokens) con un token `<|pad|>` adicional; `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento utiliza conversaciones 1PP reescritas a partir de documentos, con la perdida aplicada solo a los turnos del asistente. Se entrenaron los primeros 53.709 pasos del flujo alineado (112,64B posiciones de token), con lote global de 512 x 4.096 tokens y enmascaramiento de atencion entre documentos. El optimizador combina Muon (escalado por forma, LR matricial 0,005) con Adam para el resto de parametros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 3.378 pasos, decaimiento lineal en los ultimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y bf16. La perdida de validacion final es de 1,374 por token en texto de asistente, 6,924 en texto de usuario y 3,078 en texto de documento.

El SFT se realizo durante una epoca sobre una mezcla de 400.000 conversaciones: 98.500 multiturno con track citado de constitucion (`jkminder/model-raising-pb-100k-3c-mt-sft`), 271.600 de `dlab-spp/sp-sft-normal-300k` (sin duplicados del primer conjunto) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se uso el mismo stack (Megatron, Muon, ChatML sin turno de sistema, perdida solo en turnos del asistente), con LR matricial 0,001, semilla 28, lote global de 128 x 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La perdida SFT en validacion (1.998 conversaciones reservadas) es de 1,783, y los pesos de HuggingFace se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0001.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema.
- Razonamiento multiturno limitado: el modelo fue entrenado sobre conversaciones reescritas, no sobre dialogos abiertos de proposito general.
- Capacidad de seguir instrucciones derivada del SFT sobre mezclas tipo model-raising y seguridad.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No dispone de modo thinking, vision ni audio.
- Cabe destacar que el autor lo describe explicitamente como artefacto de investigacion y no como asistente de proposito general.

## Casos de uso

- Investigacion sobre escalado de personas: el modelo sirve como punto de la escalera 2,81B para comparar curvas de perdida frente a los tamanos 0,58B, 0,98B y 1,66B bajo condiciones identicas de datos y pasos, permitiendo aislar el efecto del tamano.
- Estudios de ablation de condiciones de preentrenamiento: al compartir flujo de datos y orden de lotes con las otras condiciones, permite medir el impacto del texto del documento y la mascara de perdida sin confundir con el azar de inicializacion.
- Reproducibilidad de experimentos: con tres semillas (28, 42, 1234) por configuracion, es adecuado para cuantificar la varianza entre inicializaciones en un mismo punto de la escalera.
- Generacion de respuestas en ingles en entornos controlados: util para prototipar pipelines de SFT o evaluar formatos ChatML sin turno de sistema en tareas de conversacion acotadas.
- Baseline academico para comparativas de eficiencia: con 2,81B parametros y contexto de 4.096, sirve como referencia de bajo coste frente a modelos mayores en estudios de entrenamiento desde cero.
- Analisis de perdida por segmento: la publicacion de perdidas separadas por texto de asistente, usuario y documento facilita estudiar como se distribuye el aprendizaje entre roles durante el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta perdidas de validacion:

| Conjunto | Perdida (por token) |
|---|---|
| Texto de asistente (preentrenamiento) | 1,374 |
| Texto de usuario (preentrenamiento) | 6,924 |
| Texto de documento (preentrenamiento) | 3,078 |
| Tokens de entrenamiento de esta condicion (ponderado, `reweighted_seg34`) | 1,421 |
| SFT en validacion (1.998 conversaciones) | 1,783 |
| Verificacion HF frente a Megatron (sft_val segmentos [3, 4]) | 1,7835 vs 1,7834 (diff. abs. 0,0001) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, mas memoria para KV cache y activaciones; en la practica se recomienda al menos 8-12 GB para contexto completo de 4.096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3 GB para pesos; en 4 bits, alrededor de 1,5-2 GB, aunque no se documentan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con throughput alto; RTX 4090, RTX 3090 o RTX 4080 son suficientes para inferencia en bf16 con contexto completo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16, y en tarjetas con 4-6 GB si se aplican cuantizaciones no oficiales.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan documentados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-2.81b-v2-asst-sft | 2,81B | 4.096 | Apache 2.0 | Artefacto de investigacion sobre persona y escalado |
| 1pp-1.66B (escalon inferior de la misma escalera) | 1,66B | 4.096 | Apache 2.0 | Misma metodologia, menor tamano |
| SmolLM2 (1,7B) | 1,7B | 8.192 (segun version) | Apache 2.0 | Modelo pequeno de proposito general; comparte tokenizador |
| Llama 3.2 1B / 3B | 1,2B / 3,2B | 128K | Llama Community License | Asistente de proposito general con soporte multilingue |

La comparacion con modelos de proposito general debe tomarse con cautela: el 1pp-2.81b-v2-asst-sft no se evaluo con benchmarks estandar y su objetivo es la investigacion controlada, no el rendimiento en tareas abiertas.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no es un asistente de proposito general; su uso en produccion no esta respaldado por evaluaciones de calidad.
- Solo ingles: el modelo no fue entrenado ni evaluado en otros idiomas, por lo que el rendimiento fuera del ingles es impredecible.
- Contexto limitado a 4.096 tokens, inferior al de asistentes modernos con ventanas de 32K a 128K.
- Sin turno de sistema: el formato ChatML excluye el rol system, lo que limita el control del comportamiento mediante instrucciones de sistema.
- Riesgo de alucinacion: no se reportan evaluaciones de factualidad ni de tasas de alucinacion.
- Sesgos: no se documenta analisis de sesgos; la mezcla de SFT incluye conjuntos de model-raising y seguridad, pero sin metricas publicadas.
- Cero descargas y cero likes en HuggingFace en el momento de la consulta, lo que implica ausencia de validacion externa.
- Licencia Apache 2.0 permite uso comercial, pero la falta de benchmarks y de garantias de calidad desaconseja su uso en produccion sin evaluacion propia.
- Sin soporte documentado de tool calling ni de agentes, lo que restringe su integracion en pipelines automatizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-sft
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT model-raising: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
