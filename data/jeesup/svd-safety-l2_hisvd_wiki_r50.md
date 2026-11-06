# Jeesup/svd-safety-l2_hisvd_wiki_r50

## Resumen

`Jeesup/svd-safety-l2_hisvd_wiki_r50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante HiSVD (una reimplementación del método de `redai-infra/HiSVD`) hasta el 50,5 % de los parámetros densos originales, y posteriormente recuperado con la etapa 2 de LoRA de SVD-LLM. Lo publica el usuario Jeesup como artefacto de investigación, no como modelo de propósito general. El objetivo declarado es estudiar cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El modelo forma parte de una rejilla experimental sobre reglas de selección y presupuestos de compresión; esta celda concreta corresponde al presupuesto del 50 % con calibración en `wikitext2:256`. Conserva la arquitectura transformer decoder-only de Llama 2 con 6.738.415.616 parámetros y pesos en `safetensors`, pero su comportamiento conversacional y de rechazo está alterado respecto al modelo base.

Su relevancia es metodológica: proporciona métricas medidas de tasa de éxito de ataque (ASR) y de sobrerrechazo junto a la perplejidad, lo que permite cuantificar el compromiso entre seguridad y utilidad bajo compresión. No debe tratarse como un asistente desplegable sin evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con HiSVD y recuperado con LoRA de etapa 2 de SVD-LLM |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 2 admite 4096 tokens; la calibracion uso seqlen 2048) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El punto de partida es Llama-2-7b-chat, un transformer decoder-only con atención causal. Sobre él se aplica HiSVD (implementación propia del método de `redai-infra/HiSVD`), que elimina el 50,00 % de los parámetros y deja una fracción resultante de 0,5047. La calibración se realiza con `wikitext2:256`, longitud de secuencia 2048 y semilla 42, usando el método de rango estable, modulación logarítmica y alpha 1,0.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, sobre el dataset `alpaca-cleaned`. La semilla global del experimento es 42. No se documentan en la información disponible el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO adicionales más allá del ajuste LoRA descrito.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta multi-turno en el rango que permita el contexto del modelo base.
- Capacidad de rechazo de peticiones dañinas, medida mediante AdvBench ASR (0,4365) y StrongREJECT ASR (0,2556) con juez HarmBench.
- Comportamiento de sobrerrechazo medido con WildGuard (macro over-refusal de 0,1970).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre compresión de modelos: servir como celda de referencia en una rejilla que compara reglas de selección de componentes y presupuestos de compresión sobre el mismo modelo base.
- Estudio del impacto de SVD en la seguridad: usar las métricas de ASR de AdvBench y StrongREJECT para cuantificar cuánto degrada la compresión el comportamiento de rechazo respecto a Llama-2-7b-chat.
- Análisis de sobrerrechazo: emplear la métrica de WildGuard para medir el coste en utilidad conversacional que introduce la recuperación con LoRA.
- Evaluación de recuperación con LoRA de etapa 2: comparar esta celda (r=8, alpha=16, alpaca-cleaned) con otras configuraciones para aislar el efecto de la recuperación frente a la compresión sola.
- Reproducibilidad de experimentos: la semilla fija (42) y la calibración documentada permiten replicar el pipeline HiSVD más LoRA en entornos de investigación.
- Referencia de perplejidad bajo compresión: usar el valor de WikiText-2 (12,7304) como línea base para estudiar la relación entre perplejidad y degradación de seguridad en modelos comprimidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,4365 |
| StrongREJECT ASR (juez HarmBench) | 0,2556 |
| Macro over-refusal (WildGuard) | 0,1970 |
| Perplejidad en WikiText-2 | 12,7304 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB para pesos; en 4 bits, en torno a 3,5-4 GB (estimaciones a partir del número de parámetros; no confirmadas en la información disponible).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio en bf16 con contexto largo; RTX 4090 (24 GB) y RTX A6000 (48 GB) para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio); otras opciones como vLLM, llama.cpp u Ollama no se documentan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l2_hisvd_wiki_r50` | 6.738.415.616 (50,5 % del denso) | No disponible | Llama 2 Community | Artefacto de investigación con métricas de seguridad medidas |
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | 4096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de seguridad y utilidad |
| Otros checkpoints de la rejilla del mismo autor | No disponible | No disponible | Llama 2 Community | Distintas reglas de selección y presupuestos; no documentados en la información disponible |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque (ASR de 0,4365 en AdvBench).
- No es un modelo de propósito general ni un asistente desplegable: debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Riesgo de alucinación no cuantificado en la información disponible; la perplejidad de WikiText-2 (12,7304) indica una degradación del modelado del lenguaje respecto al base.
- Idiomas soportados y comportamiento multilingüe no documentados.
- Uso comercial restringido por la Llama 2 Community License y el `USE_POLICY.md` incluidos en el repositorio; es un derivado construido con Llama 2.
- No se documentan sesgos específicos medidos; deben asumirse los del modelo base y los introducidos por el dataset de recuperación (`alpaca-cleaned`).
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_hisvd_wiki_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Implementación HiSVD de referencia: https://github.com/redai-infra/HiSVD
- Resultados de búsqueda web: no se han encontrado enlaces relevantes adicionales (los resultados devueltos corresponden a Wikipedia y no guardan relación con el modelo).
