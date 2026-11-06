# Jeesup/svd-safety-l2_dualk_mix_trace_r50

## Resumen

`svd-safety-l2_dualk_mix_trace_r50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante una variante de SVD (descomposición en valores singulares) con blanqueado K-FAC en dos dominios: utilidad y seguridad. El autor, Jeesup, lo publica como artefacto de investigación para estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. No es un modelo de chat de propósito general, sino una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de compresión.

El modelo conserva el 49,99 % de los parámetros densos del Llama-2-7b-chat original (elimina el 50,00 %), lo que resulta en 6.738.415.616 parámetros reportados en los safetensors, y después aplica una recuperación de rendimiento con LoRA en dos etapas (U y V secuenciales) sobre `alpaca-cleaned`. La innovación técnica está en el criterio de selección de rangos: en lugar de usar solo la curvatura de utilidad (aproximación de segundo orden tipo K-FAC sobre wikitext-2), combina una matriz de curvatura mixta que pondera también la curvatura de seguridad, calculada sobre un conjunto de calibración de 512 muestras con pérdida en los tokens de respuesta.

Su relevancia es metodológica: proporciona métricas medidas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobre-rechazo macro con WildGuard y perplejidad en WikiText-2, lo que permite cuantificar el compromiso entre utilidad y seguridad bajo compresión. Es útil para investigadores en compresión de modelos, interpretabilidad y alineación, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con pesos comprimidos por SVD y recuperación LoRA |
| Parametros totales | 6.738.415.616 (49,99 % del denso original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat: 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de transformers/vLLM, no verificada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con 7B parámetros. La compresión se realiza con SVD blanqueado K-FAC en dos dominios: se construye una matriz de curvatura mixta `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]`, donde `G_u`/`A_u` provienen de la curvatura de utilidad y `G_s`/`A_s` de la curvatura de seguridad. El peso de seguridad es `a = 0.2639` (opción `--alpha tok`). La normalización de curvatura es `trace`: las matrices A se dividen por el número de posiciones y las G por el número de tokens de pérdida (entropía cruzada sumada), por dominio, y después cada factor se divide por su traza. El presupuesto de rangos por matriz sigue la regla de SVD-LLM al mismo ratio de eliminación.

La calibración de utilidad usa `wikitext-2-raw-v1` (split de entrenamiento) con el muestreador de SVD-LLM: 255 ventanas de 2.048 tokens, semilla 42, pérdida de entropía cruzada de siguiente token. La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l2.jsonl` (512 muestras, pérdida sobre tokens de respuesta). Tras la compresión, se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `r=8`, `alpha=16`, 2 épocas, `lr=1e-4`, batch 64, cutoff 256 y precisión bf16, sobre el dataset `alpaca-cleaned`. La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, con calidad degradada por la compresión al 50 %.
- Razonamiento y respuesta a instrucciones básicas, condicionados por el ajuste LoRA sobre `alpaca-cleaned`.
- Capacidad multilingüe no documentada; no se especifican idiomas soportados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de pensamiento explícito.
- Su función principal es servir como sujeto experimental para medir seguridad y utilidad bajo compresión.

## Casos de uso

- Investigación en compresión de modelos: comparar esta celda (regla `mix`, normalización `trace`, ratio 0,50) con otras celdas de la rejilla del autor para aislar el efecto de la regla de selección de componentes sobre la calidad final.
- Estudio del compromiso seguridad-utilidad: usar las métricas de ASR en AdvBench y StrongREJECT junto con la perplejidad en WikiText-2 para trazar curvas de degradación a distintos ratios de compresión.
- Evaluación de recuperación LoRA post-compresión: analizar si la etapa 2 de SVD-LLM (LoRA secuencial U/V) recupera utilidad sin reintroducir vulnerabilidades, comparando con checkpoints sin recuperación.
- Calibración de curvatura de seguridad: reproducir el pipeline con distintas ponderaciones `a` para determinar la sensibilidad del ASR al peso de la curvatura de seguridad.
- Benchmarking de robustez adversarial: emplear el checkpoint como línea base comprimida en pruebas de jailbreak y evaluar con HarmBench como juez.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo la eliminación de rangos en matrices de atención y MLP afecta a comportamientos alineados medibles.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0077 |
| StrongREJECT ASR (juez HarmBench) | 0,0192 |
| Sobre-rechazo macro (WildGuard) | 0,5114 |
| Perplejidad WikiText-2 | 12,5200 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros checkpoints de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 15-16 GB para contexto corto.
- En cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits: aproximadamente 3,5-4 GB. Estas cifras son estimaciones a partir del tamaño del repo (13,5 GB) y no han sido verificadas por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación por lotes y throughput alto; RTX 4090 (24 GB) suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta `endpoints_compatible`), vLLM (existe una referencia de uso con vLLM para el checkpoint hermano `dualk_dual_trace_r50`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, no verificados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l2_dualk_mix_trace_r50` | 6,74 B (49,99 % del denso) | no disponible | Llama 2 Community | Regla `mix` con curvatura mixta utilidad+seguridad, normalización `trace` |
| `Jeesup/svd-safety-l2_dualk_dual_trace_r50` | no disponible | no disponible | Llama 2 Community | Variante con curvatura dual y normalización `trace`; misma familia experimental |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B (denso original) | 4.096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación numérica de rendimiento no está disponible.

## Limitaciones y advertencias

- El propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresión por sí sola eleva la tasa de éxito de ataque.
- No es un asistente desplegable: es un artefacto de investigación y debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación incrementado por la compresión al 50 % y por el ajuste LoRA sobre `alpaca-cleaned`, un dataset relativamente pequeño y de dominio general.
- El sobre-rechazo macro medido (0,5114 con WildGuard) indica que aproximadamente la mitad de las respuestas a prompts benignos pueden ser rechazos excesivos, lo que limita su uso conversacional.
- Idiomas soportados no documentados; se desconoce el comportamiento fuera del inglés.
- Licencia Llama 2 Community: uso comercial permitido bajo condiciones, con obligaciones de atribución ("Built with Llama 2") y restricciones de la política de uso aceptable incluida en el repositorio.
- No hay garantías de soporte, mantenimiento ni actualizaciones del checkpoint.
- La longitud de contexto no se especifica en la model card; se asume la heredada del base, pero no está confirmada.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_trace_r50
- Checkpoint hermano: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_trace_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
