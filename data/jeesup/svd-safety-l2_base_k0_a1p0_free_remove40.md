# Jeesup/svd-safety-l2_base_k0_a1p0_free_remove40

## Resumen

El modelo `Jeesup/svd-safety-l2_base_k0_a1p0_free_remove40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la técnica SVD-LLM hasta retener el 60,0 % de los parámetros densos (fracción resultante declarada de 0,5998) con un presupuesto de restauración de componentes SVD del 0,0 %. Lo publica el usuario Jeesup como artefacto de un estudio sistemático sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad de un modelo alineado y qué reglas de selección de componentes consiguen repararlo. No es un modelo conversacional de propósito general: es una celda más de una cuadrícula experimental sobre reglas de selección y presupuestos de restauración.

Arquitecturalmente hereda la estructura transformer decoder-only de Llama 2 con 6.738.415.616 parámetros en safetensors y una ventana de contexto de 4.096 tokens, sin que la model card documente entrenamiento adicional, ajuste fino posterior ni calibración tras la compresión. La relevancia actual del checkpoint es metodológica: cuantifica de forma reproducible el compromiso entre seguridad y utilidad bajo compresión, con métricas de tasa de éxito de ataque (ASR) medidas con el juez HarmBench y de rechazo excesivo con WildGuard.

Los resultados publicados muestran una degradación de seguridad deliberada como parte del objeto de estudio (AdvBench ASR de 0,2654 y StrongREJECT ASR de 0,1853) junto a una perplejidad de 11,3774 en WikiText-2. El propio autor advierte que varias celdas de la cuadrícula están intencionadamente degradadas en seguridad respecto a Llama-2-7b-chat, por lo que este checkpoint debe tratarse como sujeto experimental y no como asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), comprimido con SVD-LLM |
| Parámetros totales | 6.738.415.616 (safetensors); fracción declarada tras compresión: 0,5998 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no hay variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | No disponible (no declarados; Llama 2 está optimizado principalmente para inglés) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Regla de selección SVD | `unknown` |
| Presupuesto de restauración | 0,000 % de parámetros densos |
| Componentes restaurados / sustituidos | 0 / 0 |
| Semilla | 42 |
| Descargas / likes | 102 / 0 |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La base es `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only de aproximadamente 6,74 mil millones de parámetros con contexto de 4.096 tokens, entrenado por Meta con ajuste supervisado y RLHF sobre el modelo preentrenado Llama 2. Sobre ese checkpoint, este artefacto aplica SVD-LLM para eliminar el 40,00 % de los parámetros densos, dejando una fracción de 0,5998. La compresión se realiza descomponiendo matrices de pesos en valores singulares y recortando componentes según una regla de selección; en esta celda concreta la regla aparece etiquetada como `unknown` y el presupuesto de restauración es del 0,000 %, es decir, no se reinyecta ningún componente SVD y no se sustituye ningún componente por su versión original.

No se documenta ningún entrenamiento adicional, ajuste fino, destilación ni proceso de recuperación posterior a la compresión en este checkpoint. La composición del dataset de compresión y el procedimiento exacto de selección de componentes no se detallan en la model card. El único parámetro de reproducibilidad declarado es la semilla 42. La innovación técnica del trabajo no reside en el modelo en sí, sino en su uso como sujeto de medida para estudiar la relación entre compresión por SVD, pérdida de comportamiento de seguridad y sobre-rechazo, con métricas estandarizadas.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión (perplejidad de 11,3774 en WikiText-2).
- Capacidad de seguir instrucciones y mantener diálogo multiturno, aunque el autor la desaconseja como asistente desplegable.
- Sujeto de evaluación de seguridad: permite medir tasas de éxito de ataque con AdvBench (0,2654) y StrongREJECT (0,1853) usando el juez HarmBench.
- Medición de rechazo excesivo: 0,1245 de macro over-refusal según WildGuard.
- Capacidad de servir como celda de control en experimentos de ablación sobre compresión y alineación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles ni declaradas.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponibles.

## Casos de uso

- Estudio de ablación de seguridad bajo compresión: comparar esta celda (presupuesto de restauración del 0,000 %) con las demás celdas de la cuadrícula para aislar el efecto de la regla de selección de componentes SVD sobre la tasa de éxito de ataque.
- Red-teaming reproducible: emplear el checkpoint como sujeto fijo en evaluaciones de jailbreak con AdvBench y StrongREJECT, aprovechando la semilla 42 y las métricas ya publicadas como línea base interna.
- Medición de sobre-rechazo en modelos comprimidos: usar WildGuard para cuantificar el 0,1245 de macro over-refusal y estudiar si la compresión desplaza el equilibrio entre seguridad y utilidad conversacional.
- Análisis de degradación lingüística: utilizar la perplejidad de WikiText-2 (11,3774) como indicador de coherencia para correlacionar pérdida de calidad textual con pérdida de comportamiento seguro.
- Investigación en interpretabilidad de subespacios: identificar qué componentes SVD portan el comportamiento de rechazo, comparando este checkpoint con variantes que sí restauran componentes.
- Estudio de técnicas de reparación: partir de este modelo comprimido y sin restaurar para probar si un ajuste fino posterior (SFT, DPO o LoRA) recupera las tasas de rechazo originales de Llama-2-7b-chat.
- Validación de pipelines de evaluación: probar arneses de medición (HarmBench, WildGuard) contra un modelo con comportamiento de seguridad conocido y degradación cuantificada.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2654 |
| StrongREJECT ASR (juez HarmBench) | 0,1853 |
| Macro over-refusal (WildGuard) | 0,1245 |
| Perplejidad WikiText-2 | 11,3774 |

No se proporcionan en la información disponible los valores equivalentes para `meta-llama/Llama-2-7b-chat-hf` ni para otras celdas de la cuadrícula, por lo que no es posible presentar una comparación cuantitativa directa. La model card indica únicamente que la compresión por sí sola eleva la tasa de éxito de ataque respecto al modelo original.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para los pesos, más memoria para caché KV y activaciones (del orden de 15-17 GB en cargas típicas con contexto largo).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090/3090 (24 GB) para inferencia en fp16.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en fp16; en GPUs de 12-16 GB requeriría cuantización a 8 o 4 bits, no publicada en el repositorio.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama habría que convertir los pesos a GGUF, formato que el repositorio no ofrece.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio ocupa 13,5 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AdvBench ASR | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (SVD-LLM, 40 % eliminado, restauración 0 %) | 6.738.415.616 (fracción 0,5998) | 4.096 | 0,2654 | 11,3774 | Llama 2 Community |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 mil millones | 4.096 | No disponible en la información | No disponible en la información | Llama 2 Community |
| Jeesup/svd-safety-l2_jbb_k0p02_a1p0_free_remove40 | No disponible | No disponible | No disponible | No disponible | Llama 2 Community |
| Jeesup/svd-safety-l2_basis_remove40 (compresión por Basis Sharing, 60 % retenido) | 7 mil millones (60 % retenido) | 4.096 | No disponible | No disponible | Llama 2 Community |

Las variantes hermanas de la misma serie (`svd-safety-l2_jbb_*`, `svd-safety-l2_basis_remove40`) forman parte del mismo estudio comparativo, pero la información recuperada no incluye sus métricas de seguridad ni de perplejidad, por lo que la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- No es un asistente de propósito general: el autor lo describe explícitamente como artefacto de investigación y sujeto experimental.
- Degradación de seguridad intencionada: la tasa de éxito de ataque frente a AdvBench (0,2654) y StrongREJECT (0,1853) es elevada y forma parte del objeto de estudio, no un defecto corregido.
- Rechazo excesivo medible: 0,1245 de macro over-refusal según WildGuard, es decir, rechaza peticiones legítimas en una proporción apreciable.
- Pérdida de calidad lingüística: la perplejidad de 11,3774 en WikiText-2 refleja el impacto de eliminar el 40 % de los parámetros densos.
- Riesgo de alucinación: no cuantificado en la model card; al tratarse de un modelo comprimido sin restauración, cabe esperar un incremento respecto al modelo base, pero no hay datos disponibles.
- Idiomas: no se declaran idiomas soportados; la herencia de Llama 2 implica un sesgo fuerte hacia el inglés y un rendimiento reducido en otras lenguas.
- Licencia: Llama 2 Community License, con las restricciones habituales de Meta (atribución "Built with Llama", política de uso aceptable y condiciones para uso comercial según escala).
- Validación limitada por la comunidad: 102 descargas y 0 likes en el momento de la consulta.
- No hay variantes cuantizadas publicadas, lo que complica el despliegue en hardware de gama media.
- Cualquier uso en producción requeriría una evaluación de seguridad propia; el propio autor recomienda evaluar antes de extraer conclusiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_base_k0_a1p0_free_remove40
- Variante hermana (regla jbb, presupuesto 0,02): https://huggingface.co/Jeesup/svd-safety-l2_jbb_k0p02_a1p0_free_remove40
- Variante hermana (regla jbb, presupuesto 0,1): https://free2aitools.com/model/jeesup/svd-safety-l2_jbb_k0p02_a0p1_free_remove40
- Variante con compresión Basis Sharing: https://featherless.ai/models/Jeesup/svd-safety-l2_basis_remove40
- Página de despliegue en FriendliAI: https://friendli.ai/models/Jeesup/svd-safety-l2_jbb_k0p02_a1p0_free_remove40
