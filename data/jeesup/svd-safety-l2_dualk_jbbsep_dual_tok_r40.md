# Jeesup/svd-safety-l2_dualk_jbbsep_dual_tok_r40

## Resumen

`svd-safety-l2_dualk_jbbsep_dual_tok_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup. No es un modelo entrenado desde cero, sino un artefacto experimental: el modelo base ha sido comprimido mediante una variante de SVD (descomposición en valores singulares) con blanqueado K-FAC en dos dominios (utilidad y seguridad), eliminando el 40 % de los parámetros densos y conservando el 59,98 % de los mismos. Posteriormente se aplicó una recuperación de etapa 2 con LoRA secuencial sobre U y V, usando el dataset alpaca-cleaned.

El objetivo declarado del autor es estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Este checkpoint es una celda concreta de una rejilla de experimentos sobre reglas de selección y presupuestos de compresión, y el propio autor advierte explícitamente que no debe tratarse como un asistente de propósito general desplegable.

La relevancia es metodológica: permite medir el compromiso entre utilidad (perplejidad en WikiText-2, precisión zero-shot) y seguridad (tasas de éxito de ataque en AdvBench y StrongREJECT, sobre-rechazo en WildGuard) bajo un esquema de compresión reproducible. El modelo conserva la arquitectura y el tokenizador de Llama 2 7B chat, con 6.738.415.616 parámetros reales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con blanqueado K-FAC dual |
| Parametros totales | 6.738.415.616 (59,98 % del denso original; 40,00 % eliminado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 2 7B chat: 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion posterior via herramientas estandar, no documentado por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Llama-2-7b-chat-hf, un transformer decoder-only con atención causal estándar y 7.000 millones de parámetros. Sobre él se aplica una compresión SVD-LLM con un presupuesto de rango por matriz fijado al mismo ratio de eliminación (40 %). La innovación del método es el uso de curvatura K-FAC en dos dominios: una matriz de curvatura de utilidad calibrada con wikitext-2-raw-v1 (255 ventanas de 2.048 tokens, semilla 42, entropía cruzada de siguiente token) y una matriz de curvatura de seguridad calibrada con 96 muestras del conjunto `jbb_harm_resp_sep` (pérdida sobre tokens de respuesta). Ambas se combinan con un peso de seguridad `a = 0,0464` y normalización `tok` (A dividido por posiciones, G dividido por tokens de pérdida).

El solver es de tipo `dual`: se calcula el óptimo de bajo rango de `F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s` mediante ALS sobre base conjunta, partiendo de la solución mixta, con hasta 300 barridos, `rtol 1e-07` y `ridge 1e-06`. Tras la compresión se aplica una recuperación de etapa 2 con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. No se documenta RLHF ni DPO adicionales más allá del alineamiento heredado del modelo base.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredada de Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 2, sujeto a la degradación introducida por la compresión.
- Capacidad multilingüe: no documentada en la model card; se desconoce el impacto de la compresión por idioma.
- Tool calling / function calling: no documentado ni garantizado; el modelo base no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.
- Capacidad de interpretabilidad y análisis: el checkpoint está pensado como sujeto experimental para estudiar el efecto de la compresión sobre la seguridad, no como asistente.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como celda de control en estudios que midan la degradación de seguridad tras eliminar parámetros mediante SVD, comparando con otras reglas de selección de la misma rejilla.
- Análisis de sobre-rechazo: evaluar la tasa de rechazo excesivo (0,3150 macro en WildGuard) frente al modelo base para caracterizar el coste de alineamiento bajo compresión.
- Evaluación de robustez ante jailbreaks: emplear las métricas de AdvBench (ASR 0,0135) y StrongREJECT (ASR 0,0543) como referencia para calibrar jueces automáticos y pipelines de red-teaming.
- Estudio de recuperación con LoRA: reproducir el pipeline de etapa 2 (LoRA secuencial U/V sobre alpaca-cleaned) y medir su efecto sobre perplejidad y seguridad.
- Benchmarking de utilidad bajo compresión: usar WikiText-2 (perplejidad 9,9184) y la media zero-shot de 7 tareas (0,4891) como línea base para comparar variantes de compresión.
- Docencia y divulgación: ilustrar en cursos o artículos cómo se comporta un modelo alineado cuando se comprime agresivamente, con métricas concretas y reproducibles.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0135 |
| StrongREJECT ASR (juez HarmBench) | 0,0543 |
| Macro sobre-rechazo (WildGuard) | 0,3150 |
| Perplejidad WikiText-2 | 9,9184 |
| Precisión media zero-shot (7 tareas, acc_norm donde aplica) | 0,4891 |

No se proporcionan resultados desglosados por tarea ni comparaciones directas con el modelo base u otros checkpoints de la rejilla en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB (estimaciones a partir del tamaño de parámetros, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala y batches grandes; RTX 4090 (24 GB) para inferencia en bf16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantización de 4 bits, siempre que se use un runtime compatible.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados por el autor para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_jbbsep_dual_tok_r40 | 6.738 M (59,98 % del denso) | No disponible | Llama 2 Community | Checkpoint de investigación comprimido, con métricas de seguridad y utilidad publicadas |
| meta-llama/Llama-2-7b-chat-hf | 6.738 M | 4.096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del mismo autor | Variable (según presupuesto) | No disponible | Llama 2 Community | Variantes con distintas reglas de selección y ratios de compresión, no detalladas en la información disponible |

No se dispone de comparaciones con modelos de terceros del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un asistente de propósito general: es un artefacto de investigación y debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación: no cuantificado en la model card; se espera un aumento respecto al modelo base por la pérdida de capacidad, pero no hay datos.
- Sesgos: no documentados; hereda los del modelo base y la compresión puede amplificarlos de forma no medida.
- Idiomas soportados: no disponibles; el impacto de la compresión por idioma es desconocido.
- Restricciones de licencia: Llama 2 Community License; el uso comercial está sujeto a `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio, con las obligaciones de atribución y las restricciones de la licencia Llama 2.
- Contexto: no confirmado en la model card; asumir el de Llama 2 7B chat (4.096 tokens) salvo verificación.
- Reproducibilidad: el checkpoint depende de un pipeline de calibración y solver concretos (semilla 42, hiperparámetros detallados); desviaciones pueden alterar los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_jbbsep_dual_tok_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Paper de SVD-LLM (referencia metodológica citada en la model card): no disponible en la información proporcionada
- Repositorio del código del estudio: no disponible en la información proporcionada
- Demos: no disponibles
