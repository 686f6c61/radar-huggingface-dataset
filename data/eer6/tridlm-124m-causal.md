# EER6/TriDLM-124M-causal

## Resumen

TriDLM-124M-causal es un modelo de lenguaje basado en difusión enmascarada (masked diffusion language model, estilo MDLM) de 124 millones de parámetros, desarrollado por EER6 como uno de los cuatro brazos del experimento TriDLM. El objetivo del experimento es estudiar si un modelo de difusión puede mantener su calidad cuando todas las cabezas de atención son triangulares (causales o anti-causales), reduciendo el coste de atención de L² a L²/2. Esta variante concreta usa todas las cabezas causales, lo que actúa como control de cota inferior: sin contexto derecho, el modelo pierde calidad de forma esperada.

El modelo está construido sobre una arquitectura GPT-2 small (12 capas, 768 dimensiones, 12 cabezas) adaptada como denoiser de difusión, con vocabulario de 50.304 tokens (el BPE de GPT-2 más el token especial `[MASK]` y pads). Se entrenó sobre OpenWebText durante 52.400 millones de tokens en unas 5,5 horas en 8 nodos GH200. Su relevancia actual reside en que aporta datos empíricos sobre el equilibrio entre eficiencia de atención y calidad generativa en modelos de difusión, un área activa de investigación. El repositorio incluye código, registros de entrenamiento y el registro completo del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 small denoiser (12 capas, 768 d, 12 cabezas, GELU, embeddings atados, QK-norm por cabeza) |
| Parametros totales | 124.375.296 |
| Parametros activos | no aplicable (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (bloques empaquetados con separadores EOS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un denoiser de difusión enmascarada estilo MDLM: durante el entrenamiento se enmascaran aleatoriamente un subconjunto de tokens (con recuento n uniforme entre 1 y L, estratificado por lote) y el modelo debe predecir los tokens originales en las posiciones enmascaradas. A diferencia de un LM autorregresivo, no hay desplazamiento de next-token: la posición i predice el token i. Todas las cabezas de atención son causales, lo que impide que el modelo use contexto derecho. Se aplica QK-norm (LayerNorm sobre q y k en la dimensión de cabeza), esencial para la estabilidad: sin ella, las variantes triangulares divergían por crecimiento de los logits de atención (de ~40 a 10⁶ en 25-30k pasos), mientras que la variante bidireccional se mantenía en ~42.

El entrenamiento usó OpenWebText con tokenización BPE de GPT-2, bloques empaquetados de 1024 tokens, 100.000 pasos × 512 × 1024 = 52.400 millones de tokens (5,9 épocas). Optimizador AdamW con lr 1e-4, β 0,9/0,95, weight decay 0,1, clip 1,0, warmup de 1.000 pasos, fase estable de 89.000 y decaimiento coseno de 10.000 pasos hasta 0. Precisión bf16, semilla 1. La pérdida es la media sobre filas de la entropía cruzada media sobre posiciones enmascaradas, con logits de `[MASK]` y pads fijados a −∞ (estrategia SUBS). No se aplicó EMA; el checkpoint final es el punto posterior al decaimiento.

## Capacidades

- Generación de texto mediante denoising enmascarado: el modelo recibe una secuencia parcialmente enmascarada y predice los tokens originales en las posiciones enmascaradas.
- Soporte de muestreo ancestral en orden aleatorio (sampler recomendado por el autor para evitar colapso en repetición).
- Extracción de características (pipeline declarado en HuggingFace como feature-extraction).
- Capacidad de procesar contexto de hasta 1024 tokens.
- Multilingüe: no, solo inglés.
- Tool calling, agentes, razonamiento multi-paso: no soportado (modelo base de difusión sin fine-tuning instructivo).
- Modo thinking, visión, audio: no disponible.

## Casos de uso

- Investigación académica sobre modelos de difusión enmascarada: permite estudiar el efecto de la causalidad en la calidad de denoising, comparando con las variantes bidireccional, split y alterna del mismo experimento.
- Ablación de arquitecturas de atención: sirve como control de cota inferior para validar si la atención triangular puede aproximarse a la bidireccional con menor coste computacional.
- Análisis del impacto de la QK-norm en la estabilidad del entrenamiento: el registro del experimento documenta la divergencia sin QK-norm, útil para quienes estudian regularización de atención.
- Enseñanza y demostración de conceptos de difusión enmascarada: su tamaño reducido (124M) permite ejecutarlo en hardware modesto y usarlo como ejemplo didáctico de MDLM.
- Línea base en estudios comparativos de eficiencia de atención: su coste de atención L²/2 frente a L² completo lo hace relevante para investigaciones sobre escalado de contexto.
- Reproducción de experimentos publicados: el repositorio incluye código y registros de entrenamiento completos, permitiendo verificar los resultados reportados.

## Benchmarks y rendimiento

La model card reporta el NELBO (cota inferior de verosimilitud exacta de difusión enmascarada, equivalente en expectativa al objetivo 1/t de MDLM) y la perplejidad sobre los 110.451 bloques de validación de OpenWebText, comparando las cuatro variantes del experimento:

| Variante | Atención por cabeza | NELBO (nats/token) | PPL |
|---|---|---|---|
| bidir | todas bidireccional (control MDLM) | 3,374 | 29,2 |
| split | capas pares causal, impares anti-causal | 3,395 | 29,8 |
| alt | capas pares toda causal, impares toda anti-causal | 3,406 | 30,2 |
| causal | todas causal (control cota inferior) | 4,940 | 139,7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card menciona métricas de generación (gen-ppl bajo gpt2-large y MAUVE-256) para la variante bidireccional (gen-ppl 56 ± 3 a NFE 1024), pero no proporciona valores numéricos para la variante causal.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124M de parámetros en bf16 (2 bytes por parámetro), los pesos ocupan aproximadamente 0,25 GB. Con activaciones y estado del optimizador en entrenamiento, cabe en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; también ejecutable en CPU para inferencia de baja demanda.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `attn_impl="sdpa"` (máscaras densas, requiere torch ≥ 2.1) o `attn_impl="flex"` (bloque disperso, requiere torch ≥ 2.5 y Triton). No hay soporte específico documentado para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento alcanzó 2,73M tokens/s en 8×GH200, pero no se reportan métricas de inferencia.

## Comparativa con modelos similares

La comparativa más directa es con las otras tres variantes del mismo experimento TriDLM, que comparten arquitectura, datos, máscaras y receta de entrenamiento, diferenciándose solo en el patrón de atención por cabeza:

| Modelo | Atención | NELBO (nats/token) | PPL | Coste de atención |
|---|---|---|---|---|
| TriDLM-124M-bidir | todas bidireccional | 3,374 | 29,2 | L² |
| TriDLM-124M-split | pares causal, impares anti-causal | 3,395 | 29,8 | L²/2 |
| TriDLM-124M-alt | capas pares causal, impares anti-causal | 3,406 | 30,2 | L²/2 |
| TriDLM-124M-causal | todas causal | 4,940 | 139,7 | L²/2 |

Frente a GPT-2 small (124M, autorregresivo, mismo tamaño), no se dispone de comparativa directa en los mismos benchmarks en la información proporcionada. La variante causal es claramente inferior a sus hermanas triangulares, lo que confirma que la ausencia total de contexto derecho penaliza severamente la calidad en difusión enmascarada.

## Limitaciones y advertencias

- Rendimiento notablemente inferior a la variante bidireccional: la perplejidad de 139,7 frente a 29,2 indica que la atención totalmente causal es un mal diseño para difusión enmascarada; su uso queda limitado a control experimental.
- Colapso en repetición con ciertos samplers: el decodificado por confianza (argmax o muestreo con umbral, uno a la vez) colapsa en repetición en estos modelos base; solo el muestreo ancestral en orden aleatorio produce resultados aceptables.
- Solo inglés: entrenado exclusivamente con OpenWebText, no soporta otros idiomas.
- Modelo de investigación sin fine-tuning instructivo: no es adecuado para tareas de chat, tool calling o agentes.
- Posibles sesgos del corpus: OpenWebText hereda sesgos y contenido problemático de la web; no se documentan evaluaciones de sesgo ni mitigaciones.
- Sin garantías de producción: el autor lo presenta como parte de un experimento de arquitectura, con código portado (MIT, nanoGPT) y licencia apache-2.0, pero sin soporte ni mantenimiento asegurado.
- El conjunto de entrenamiento contiene un bloque con un token `[MASK]` espurio que produce una pérdida `inf` por época; el autor indica que no afecta a los gradientes.

## Enlaces

- HuggingFace: https://huggingface.co/EER6/TriDLM-124M-causal
- Repositorio GitHub del experimento (código, registros de entrenamiento, registro completo): https://github.com/AntonXue/TriDLM
