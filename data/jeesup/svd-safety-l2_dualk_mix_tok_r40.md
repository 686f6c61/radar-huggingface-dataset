# Jeesup/svd-safety-l2_dualk_mix_tok_r40

## Resumen

`svd-safety-l2_dualk_mix_tok_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD blanqueado con K-FAC de doble dominio (curvatura de utilidad y de seguridad) y recuperado después con la etapa 2 de LoRA de SVD-LLM. El resultado elimina el 40,00 % de los parámetros densos, dejando una fracción de 0,5998 respecto al modelo original (6.738.415.616 parámetros reales en safetensors). Lo publica el usuario de Hugging Face Jeesup como artefacto de investigación sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

No es un modelo conversacional de propósito general: es una celda concreta de una cuadrícula experimental que barre reglas de selección y presupuestos de rango. El autor advierte explícitamente que varias ramas de esa cuadrícula están degradadas deliberadamente en seguridad y que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable. Su interés es metodológico: cuantificar el compromiso entre utilidad (perplejidad en WikiText-2) y robustez frente a ataques (ASR en AdvBench y StrongREJECT) bajo compresión agresiva.

La relevancia actual viene de que la compresión de modelos es una vía habitual para reducir coste de inferencia, y este trabajo mide de forma sistemática el coste en seguridad que eso conlleva. La ficha se basa únicamente en la model card y en los metadatos de Hugging Face; no se han publicado detalles adicionales sobre el dataset de seguridad o los resultados completos de la cuadrícula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido por SVD con presupuesto de rango de SVD-LLM |
| Parametros totales | 6.738.415.616 (fracción 0,5998 del denso original; 40,00 % eliminado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repo) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con 7B parámetros en su versión chat. La compresión aplica SVD blanqueado con K-FAC en un único dominio mixto: la matriz de curvatura combinada es `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]`, donde `G_u` y `A_u` provienen de la curvatura de utilidad y `G_s` y `A_s` de la curvatura de seguridad. El peso de seguridad es `a = 0.2639` (argumento `--alpha tok`). El presupuesto de rango por matriz sigue el criterio de SVD-LLM para la misma ratio de eliminación. La normalización de curvatura es `tok`: `A` dividido por posiciones y `G` dividido por tokens de pérdida (entropía cruzada sumada), por dominio.

La calibración de utilidad usa `wikitext-2-raw-v1` de entrenamiento con el muestreador de SVD-LLM: 255 ventanas de 2048 tokens, semilla 42, pérdida de entropía cruzada de siguiente token. La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l2.jsonl`, con 512 muestras y pérdida sobre los tokens de respuesta. Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `alpaca-cleaned`, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta multi-turno dentro de los límites del modelo base, sin garantías adicionales.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: no se declaran modos de pensamiento, visión ni audio.
- Etiquetas del repo que sugieren uso con text-generation-inference y endpoints compatibles.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como celda de control en experimentos que midan cómo varía el ASR con la ratio de compresión y la regla de selección de componentes. Es su propósito declarado.
- Evaluación de métodos de recuperación: comparar la etapa 2 de LoRA de SVD-LLM frente a otras estrategias de recuperación sobre el mismo presupuesto de rango, midiendo perplejidad y ASR de forma conjunta.
- Estudio de reglas de selección: reproducir la cuadrícula variando `a`, la normalización de curvatura y el presupuesto de rango para identificar qué configuración preserva mejor la seguridad sin sacrificar utilidad.
- Análisis de robustez frente a jailbreak: emplear AdvBench y StrongREJECT con el juez de HarmBench para caracterizar la resistencia del modelo comprimido frente a ataques conocidos.
- Medición de sobre-rechazo: usar WildGuard para cuantificar el sobre-rechazo macro (0,5551 en este checkpoint) y estudiar el equilibrio entre seguridad y utilidad conversacional.
- Referencia para pipelines de compresión en producción: servir como línea base de lo que ocurre al eliminar el 40 % de parámetros sin un ajuste específico de seguridad, antes de decidir si merece la pena desplegar una variante comprimida.
- Docencia y divulgación: ilustrar en cursos o artículos el compromiso entre eficiencia y alineación con métricas reproducibles (perplejidad, ASR, sobre-rechazo).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0019 |
| StrongREJECT ASR (juez HarmBench) | 0,0096 |
| Sobre-rechazo macro (WildGuard) | 0,5551 |
| Perplejidad WikiText-2 | 10,0957 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo para pesos (el repo ocupa 13,5 GB), más overhead de activaciones y caché KV; presupuesto práctico de 16-24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16; para cuantización de 8 bits o 4 bits no se documentan pesos preconvertidos, habría que generarlos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en fp16 con margen ajustado; en GPUs de 16 GB requeriría cuantización a 8 o 4 bits no publicada.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). No se documentan artefactos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_mix_tok_r40 | 6,74 B (0,5998 del denso) | no disponible | Llama 2 Community | Compresión SVD con curvatura de utilidad y seguridad; artefacto de investigación |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B (denso) | 4096 tokens | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Jeesup/svd-safety-l2_dualk_mix_tok_a0528_r40 | no disponible | no disponible | Llama 2 Community | Otra celda de la misma cuadrícula, con `a = 0.528` |
| Jeesup/svd-safety-l2_dualk_mix_trace_r40 | ~7 B (según metadatos de HF) | no disponible | Llama 2 Community | Otra celda de la cuadrícula con normalización `trace` |

No se dispone de comparaciones numéricas entre estas celdas en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que varias ramas de la cuadrícula están deliberadamente degradadas en seguridad; este checkpoint concreto no debe tratarse como asistente desplegable.
- La compresión por sí sola eleva la tasa de éxito de ataque; los valores de ASR reportados son de esta celda y no garantizan comportamiento equivalente en otras configuraciones.
- El sobre-rechazo macro de 0,5551 es elevado y sugiere un equilibrio agresivo hacia la cautela, con posible pérdida de utilidad conversacional.
- Riesgo de alucinación no medido en la información disponible; cabe esperar el del modelo base más el introducido por la compresión.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe fiable.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repo; el uso comercial está sujeto a esas condiciones y a la política de uso aceptable.
- No se publican pesos cuantizados ni artefactos GGUF; el despliegue en entornos con poca VRAM requiere conversión propia.
- Longitud de contexto no confirmada para este checkpoint; se asume la del modelo base (4096 tokens) pero no está verificada tras la compresión.
- El checkpoint tiene 50 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter de artefacto de investigación y no de modelo adoptado.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_tok_r40
- Celda relacionada (a = 0.528): https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_tok_a0528_r40
- Celda relacionada (normalización trace): https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_trace_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
