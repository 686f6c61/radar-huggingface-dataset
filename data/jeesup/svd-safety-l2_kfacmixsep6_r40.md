# Jeesup/svd-safety-l2_kfacmixsep6_r40

## Resumen

svd-safety-l2_kfacmixsep6_r40 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf comprimido mediante SVD blanqueado con K-FAC agrupado (pooled K-FAC whitened SVD), en el que la calibración de utilidad y la de seguridad se combinan en un único estimador K-FAC. El resultado es un modelo que conserva el 59,98 % de los parámetros densos del original (se elimina un 40,00 %), y que posteriormente se recupera con la etapa 2 de LoRA de SVD-LLM (U y V secuenciales, alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16). Lo publica el usuario Jeesup como artefacto de investigación, no como modelo de conversación de propósito general.

El interés del checkpoint es metodológico: forma parte de una rejilla experimental sobre reglas de selección de componentes y presupuestos de compresión, diseñada para medir cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección repara mejor ese daño. La celda concreta que nos ocupa usa una mezcla de calibración `wikitext2:256,jbb_harm_resp_sep:6`, donde la parte de seguridad representa solo el 0,28 % de los tokens de pérdida y el 0,30 % de las posiciones.

Arquitectura transformer decoder-only de la familia Llama 2, con 6.738.415.616 parámetros efectivos tras la compresión (frente a los ~6,74 mil millones del Llama-2-7b-chat denso), licencia Llama 2 Community License y pesos en safetensors. Su relevancia actual es doble: por un lado, alimenta la investigación sobre interpretabilidad y robustez de modelos comprimidos; por otro, advierte de que la compresión por sí sola eleva la tasa de éxito de ataques, un dato crítico para quien planee desplegar variantes comprimidas de Llama 2 en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con selección de componentes K-FAC |
| Parametros totales | 6.738.415.616 (59,98 % del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat, 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con atención causal estándar, y se somete a una compresión SVD con blanqueado K-FAC. El estimador es un único K-FAC blanqueado (F = A ⊗ G) calculado sobre un conjunto de calibración agrupado, con `lam = 0`, y el presupuesto de rango por matriz sigue el esquema de SVD-LLM. La novedad metodológica es que la calibración de utilidad y la de seguridad se integran en el mismo K-FAC: la parte de utilidad usa WikiText-2 train (255 ventanas de 2.048 tokens, sampler de SVD-LLM, semilla 42, todas las posiciones) y la parte de seguridad usa 6 objetivos de JailbreakBench con los propios rechazos de Llama-2-7b-chat (una conversación por muestra, 1.591 posiciones, 1.443 tokens de respuesta, pérdida solo sobre el rechazo). La pérdida G se calcula por suma de tokens (NLL sumada / 2047), de modo que todos los tokens de pérdida pesan igual.

Tras la compresión al 60,0 % de parámetros densos, se aplica la recuperación de la etapa 2 de SVD-LLM mediante LoRA secuencial sobre U y luego sobre V, con alpaca-cleaned como dataset, rango 8, alpha 16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global es 42. No se documentan en la información disponible detalles sobre RLHF o DPO adicionales más allá de los heredados del modelo base.

## Capacidades

- Generación de texto conversacional, heredada de Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones en formato chat (prompt template de Llama 2).
- Capacidad multilingüe: no documentada en la model card; se desconoce el estado tras la compresión.
- Tool calling / function calling: no documentado; Llama-2-7b-chat no lo soporta de forma nativa.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Comportamiento de rechazo ante peticiones dañinas: presente pero degradado respecto al modelo base, según advierte el autor.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de una rejilla experimental para medir la relación entre presupuesto de compresión, regla de selección de componentes y degradación de seguridad; se usaría junto con las demás celdas del estudio para trazar curvas de compromiso.
- Evaluación de robustez frente a jailbreaks: con ASR medido en AdvBench (0,1385) y StrongREJECT (0,1949) bajo juez HarmBench, permite comparar el efecto de distintas calibraciones de seguridad en el mismo pipeline de ataque.
- Estudio de sobre-rechazo: la métrica de macro over-refusal (0,1339) con WildGuard permite analizar el equilibrio entre seguridad y utilidad conversacional en modelos comprimidos.
- Benchmarking de pipelines de compresión SVD: útil para validar implementaciones de K-FAC blanqueado y de la recuperación LoRA de SVD-LLM contra resultados publicados.
- Análisis de interpretabilidad: al ser un checkpoint con estructura SVD explícita, facilita estudiar qué subespacios de pesos concentran la capacidad de rechazo y cómo se redistribuyen tras la compresión.
- Reproducibilidad de experimentos: con semilla 42 y calibración documentada, sirve para replicar el estudio y comparar con otras reglas de selección del mismo grid.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1385 |
| StrongREJECT ASR (juez HarmBench) | 0,1949 |
| Macro over-refusal (WildGuard) | 0,1339 |
| Perplejidad en WikiText-2 | 9,9570 |
| Precisión media zero-shot (7 tareas, acc_norm cuando se reporta) | 0,4894 |

No se han publicado en la información disponible comparaciones directas con otros modelos en estas mismas métricas; los valores anteriores son los reportados por el autor para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7 GB; en 4 bits, aproximadamente 4 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bf16; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con margen ajustado, y en RTX 3090/4080/4070 Ti en cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_kfacmixsep6_r40 | 6,74 B (comprimido al 59,98 %) | no disponible | Llama 2 Community | Artefacto de investigación con calibración de seguridad; ASR y over-refusal medidos |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 B | 4.096 | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas del grid de Jeesup | ~6,74 B | no disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; comparación directa dentro del estudio |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada para establecer una comparación cuantitativa completa.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataques.
- No es un modelo de conversación de propósito general: debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Riesgo de alucinación heredado de Llama 2 y potencialmente agravado por la compresión.
- Sesgos conocidos del modelo base Llama 2, no reevaluados en este checkpoint.
- Idiomas soportados no documentados; el comportamiento multilingüe tras la compresión es incierto.
- Licencia Llama 2 Community: restricciones de uso comercial y obligaciones de atribución recogidas en `LICENSE.txt` y `USE_POLICY.md` del repositorio; uso derivado sujeto a esos términos.
- La calibración de seguridad tiene un peso muy reducido (0,28 % de tokens de pérdida), lo que limita la fiabilidad del comportamiento de rechazo.
- No hay datos publicados de latencia, throughput ni cuantización; el despliegue en producción requeriría validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep6_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (referencia de la etapa 2 de recuperación LoRA): no disponible en la información proporcionada
- Paper de SVD-LLM: no disponible en la información proporcionada
- JailbreakBench: no disponible en la información proporcionada
- HarmBench: no disponible en la información proporcionada
- WildGuard: no disponible en la información proporcionada
