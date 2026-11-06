# Jeesup/svd-safety-l3_dualk_mix_trace_r40

## Resumen

svd-safety-l3_dualk_mix_trace_r40 es un checkpoint de investigación derivado de meta-llama/Meta-Llama-3-8B-Instruct, comprimido mediante una variante de SVD con blanqueado K-FAC en dos dominios (utilidad y seguridad) y recuperado posteriormente con LoRA de segunda etapa. Lo publica el usuario Jeesup como parte de un estudio sistemático sobre cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo y qué regla de selección de componentes repara mejor ese daño. No es un asistente conversacional de propósito general: es una celda concreta de una malla experimental sobre reglas de selección y presupuestos de rango.

El modelo conserva la arquitectura Llama 3 de 8.000 millones de parámetros (8.030.261.248 según los pesos en safetensors), pero retiene aproximadamente el 60,0% de los parámetros densos (fracción 0,5998, es decir, un 40,00% eliminado). La relevancia actual es metodológica: cuantifica el compromiso entre utilidad (perplejidad en WikiText-2) y seguridad (tasas de éxito de ataques en AdvBench y StrongREJECT) bajo un esquema de compresión agresivo, y sirve como referencia reproducible para quien investigue compresión consciente de seguridad o interpretabilidad de mecanismos internos.

El checkpoint se generó con semilla 42, calibración de utilidad sobre wikitext-2-raw-v1 y calibración de seguridad sobre un conjunto propio de 512 muestras, con un peso de seguridad α = 0,1238 y normalización de curvatura por traza. El artefacto está pensado para evaluación experimental, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), comprimido por SVD con presupuesto de rango SVD-LLM y recuperado con LoRA |
| Parametros totales | 8.030.261.248 (checkpoint base); fracción retenida 0,5998 del modelo denso |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-3-8B-Instruct soporta 8.192 tokens, aunque no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de un transformer decoder-only de la familia Llama 3 (8B) y se somete a una compresión por descomposición en valores singulares con blanqueado K-FAC. La innovación respecto a SVD-LLM estándar es el uso de curvatura en dos dominios: se construye una matriz de Fisher mixta F_mix = [(1−a) G_u + a G_s] ⊗ [(1−a) A_u + a A_s], donde el subíndice u denota utilidad y s seguridad, con un peso de seguridad a = 0,1238 (parámetro `--alpha tok`). El solver `mix` aplica SVD blanqueada en forma cerrada sobre esa matriz mixta, y la normalización de curvatura es `trace`: las matrices A se dividen por el número de posiciones y las G por el número de tokens de pérdida (entropía cruzada sumada), por dominio, y después cada factor se divide por su traza.

La calibración de utilidad usa wikitext-2-raw-v1 (split de entrenamiento) con el muestreador de SVD-LLM: 255 ventanas de 2.048 tokens, semilla 42, midiendo entropía cruzada de siguiente token. La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l3.jsonl` (512 muestras, pérdida sobre los tokens de respuesta). El presupuesto de rango por matriz es el que SVD-LLM asigna a la misma ratio de eliminación del 40%. Tras la compresión, se aplica la recuperación de segunda etapa de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión y la recuperación parcial con LoRA.
- Razonamiento de siguiente token y modelado de lenguaje medible mediante perplejidad (15,5111 en WikiText-2).
- Comportamiento de rechazo ante peticiones dañinas, cuantificado con AdvBench (ASR 0,0077) y StrongREJECT (ASR 0,0192) bajo el juez HarmBench.
- Capacidad de no sobre-rechazar, medida como macro over-refusal con WildGuard (0,3442).
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.
- Modos especiales (thinking, visión, audio): no disponible; el modelo base es solo texto.

## Casos de uso

- Investigación sobre compresión consciente de seguridad: el checkpoint permite reproducir y contrastar la celda `dualk_mix_trace_r40` frente a otras celdas de la malla (distintas reglas de selección y presupuestos), midiendo ASR y perplejidad con los mismos protocolos (AdvBench, StrongREJECT, WildGuard, WikiText-2).
- Evaluación de la regla de selección de componentes: sirve para testar empíricamente si mezclar curvatura de utilidad y seguridad con α = 0,1238 y normalización por traza preserva mejor el rechazo que una SVD puramente orientada a utilidad.
- Estudio de interpretabilidad de mecanismos de seguridad: al ser un artefacto de investigación con procedencia documentada (semilla, datasets de calibración, solver), permite analizar qué componentes internos se eliminan y cómo eso correlaciona con cambios en el comportamiento de rechazo.
- Reproducción de pipelines de compresión: los parámetros del solver, la ratio de eliminación y la receta LoRA están especificados, lo que facilita reimplementar el flujo con SVD-LLM y verificar los números reportados.
- Benchmarking de robustez adversarial bajo compresión: útil para comparar tasas de éxito de ataque entre modelos densos y comprimidos con el mismo juez (HarmBench), como línea base para métodos de recuperación de seguridad.
- Análisis de sobre-rechazo: la métrica de over-refusal con WildGuard permite estudiar el coste en utilidad conversacional de las estrategias de recuperación de seguridad, un compromiso clave en despliegues reales.
- Docencia y divulgación técnica: como ejemplo reproducible de cómo se mide el eje seguridad/utilidad en compresión de modelos, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| AdvBench ASR | 0,0077 | Juez HarmBench |
| StrongREJECT ASR | 0,0192 | Juez HarmBench |
| Macro over-refusal | 0,3442 | WildGuard |
| WikiText-2 perplexity | 15,5111 | Evaluación estándar de perplejidad |

No se han publicado en la informacion disponible resultados comparativos frente a Llama-3-8B-Instruct sin comprimir ni frente a otras celdas de la malla, por lo que no es posible establecer aquí la magnitud exacta de la degradación o de la recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB en safetensors.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB para pesos; en 4 bits, aproximadamente 4-5 GB. No se documentan cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluación en precisión completa y lotes grandes; RTX 4090 (24 GB) para inferencia en bf16 con lote pequeño; RTX 3090 (24 GB) como alternativa consumer.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en bf16 con contexto moderado, y en GPUs de 8-12 GB si se aplica cuantización de 8 o 4 bits (no verificada para este checkpoint).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este artefacto y requerirían conversión propia.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_dualk_mix_trace_r40 | 8,03 B (60,0% denso retenido) | no disponible | llama3 | Artefacto de investigación con métricas de seguridad publicadas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8 B | 8.192 tokens (modelo base) | llama3 | Referencia sin comprimir; no se reportan aquí sus métricas en la informacion disponible |
| Otras celdas de la malla del mismo autor | ~8 B con distintas ratios | no disponible | llama3 | No disponibles en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos de rendimiento de los modelos comparables que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- No es un asistente de propósito general: el autor lo describe explícitamente como sujeto experimental, no como modelo desplegable.
- Varias celdas de la malla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación: no cuantificado en la informacion disponible; la compresión y la recuperación parcial con LoRA pueden alterar la fidelidad factual respecto al modelo base.
- Sesgos conocidos: no documentados para este checkpoint; hereda los del modelo base y de alpaca-cleaned usado en la recuperación LoRA.
- Limitaciones de contexto e idioma: no disponibles; la ventana de contexto efectiva tras la compresión no está verificada.
- Restricciones de licencia: uso sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`, incluidos en el repositorio; es un derivado de Meta Llama 3 y las obligaciones de atribución y uso aceptable se aplican.
- Caveat de producción: las métricas de seguridad reportadas dependen del juez HarmBench y del clasificador WildGuard; no equivalen a una garantía de robustez en despliegue real.
- El repositorio tiene 0 descargas y 0 likes en el momento del registro, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_mix_trace_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license
- Política de uso aceptable de Meta Llama 3: https://llama.meta.com/llama3/use-policy
- SVD-LLM (método de compresión y recuperación LoRA referenciado): no disponible en la informacion proporcionada
- AdvBench, StrongREJECT, HarmBench, WildGuard y wikitext-2-raw-v1: no disponibles como enlaces en la informacion proporcionada
