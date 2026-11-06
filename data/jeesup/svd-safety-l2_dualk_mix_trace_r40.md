# Jeesup/svd-safety-l2_dualk_mix_trace_r40

## Resumen

`svd-safety-l2_dualk_mix_trace_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD con blanqueado K-FAC en dos dominios (utilidad y seguridad) y posteriormente recuperado con LoRA de segunda etapa segun la receta SVD-LLM. El resultado es un modelo que conserva el 60,0 % de los parametros densos del original (40,00 % eliminados), con 6.738.415.616 parametros efectivos y pesos en safetensors.

No es un modelo de proposito general ni un asistente desplegable: es un artefacto de investigacion del autor (Jeesup) orientado a medir como la compresion por SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. Este checkpoint concreto es una celda de una malla experimental sobre reglas de seleccion y presupuestos de rango.

Su relevancia es metodologica: combina curvatura de utilidad (calibrada con wikitext-2) y curvatura de seguridad (calibrada con un conjunto de 512 muestras de perdida sobre tokens de respuesta) en un unico factor K-FAC mixto, con normalizacion por traza. Los resultados medidos (ASR de 0,0019 en AdvBench y 0,0096 en StrongREJECT con juez HarmBench, perplejidad de 10,2415 en WikiText-2 y sobretasa de rechazo macro de 0,5527 con WildGuard) deben leerse como datos de un experimento controlado, no como garantia de calidad conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido por SVD con blanqueado K-FAC dual y recuperacion LoRA |
| Parametros totales | 6.738.415.616 (60,0 % del denso original; 40,00 % eliminados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repo) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only Llama 2 de 7B, sobre el que se aplica una compresion SVD con blanqueado K-FAC. El solver es `mix`: SVD blanqueado en forma cerrada sobre un unico factor K-FAC mixto `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]`, con peso de seguridad `a = 0.2639` (flag `--alpha tok`). La normalizacion de curvatura es `trace`: las matrices A se dividen por posiciones y las G por tokens de perdida (entropia cruzada sumada), por dominio, y despues cada factor se divide por su traza. El presupuesto de rango por matriz sigue el de SVD-LLM para el mismo ratio de eliminacion, y la semilla es 42.

La calibracion de utilidad usa `wikitext-2-raw-v1` (split de train) con el muestreador de SVD-LLM: 255 ventanas de 2048 tokens, semilla 42, objetivo de entropia cruzada de siguiente token. La calibracion de seguridad usa `results/dual_kfac_wj/wj_safe_l2.jsonl` (512 muestras, perdida sobre tokens de respuesta). Tras la compresion se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `alpaca-cleaned`, r=8, alpha=16, 2 epocas, lr 1e-4, batch 64, cutoff 256 y bf16.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradacion propia de la compresion.
- Razonamiento y respuesta multi-turno: capacidad base de Llama 2 chat, no reevaluada en la model card.
- Codigo y matematicas: capacidad base de Llama 2, sin metricas especificas publicadas para este checkpoint.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas figuran como no disponibles.
- Capacidad especial del artefacto: servir como celda experimental para estudiar el compromiso seguridad/utilidad bajo compresion SVD y comparar reglas de seleccion de componentes.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar el checkpoint como sujeto experimental para cuantificar cuanto sube la tasa de exito de ataque al eliminar el 40 % de parametros y como afecta la recuperacion LoRA. Es su proposito declarado.
- Comparacion de reglas de seleccion: emparejarlo con otras celdas de la malla (por ejemplo `Jeesup/svd-safety-l2_dualk_jbb_dual_trace_r40`) para aislar el efecto del solver `mix` frente a alternativas duales sobre el mismo presupuesto de rango.
- Calibracion de evaluadores de seguridad: emplear sus salidas como distribucion de referencia al ajustar jueces tipo HarmBench o WildGuard en entornos de investigacion.
- Estudio de sobretasa de rechazo: con un 0,5527 macro de sobretasa de rechazo medida, sirve para analizar el coste en utilidad (rechazos excesivos) de preservar seguridad durante la compresion.
- Analisis de perplejidad tras compresion: la perplejidad de 10,2415 en WikiText-2 permite trazar curvas de degradacion frente a otros ratios de eliminacion.
- Docencia y divulgacion tecnica: ilustrar en un curso o articulo como se construye un pipeline SVD-LLM con calibracion dual y recuperacion LoRA, sin exponerlo a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0.0019 | HarmBench judge |
| StrongREJECT ASR | 0.0096 | HarmBench judge |
| Macro over-refusal | 0.5527 | WildGuard |
| WikiText-2 perplexity | 10.2415 | WikiText-2 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo de pesos (tamano del repo), mas overhead de activaciones y cache KV; se recomienda un margen de 16-20 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7-8 GB de pesos; en 4 bits, aproximadamente 4-5 GB. Estas cifras son estimaciones por tamano, no valores publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia comoda en precision completa; RTX 4090 (24 GB) suficiente en bf16.
- GPU de consumo: cabe en RTX 3090/4090 en bf16 y en tarjetas de 8-12 GB si se cuantiza, aunque no se publican pesos GGUF en el repo.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l2_dualk_mix_trace_r40` | 6.738.415.616 (60,0 % del denso) | no disponible | Llama 2 Community | Solver `mix` con K-FAC dual y normalizacion por traza; ASR AdvBench 0.0019 |
| `Jeesup/svd-safety-l2_dualk_jbb_dual_trace_r40` | no disponible | no disponible | Llama 2 Community | Otra celda de la misma malla (variante `jbb_dual`), mismo proposito de investigacion |
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 (denso) | 4096 tokens (modelo base) | Llama 2 Community | Referencia sin comprimir; contexto segun la ficha oficial de Llama 2, no confirmado aqui |

No se dispone de comparaciones con modelos de proposito general de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo describe explicitamente como artefacto de investigacion y advierte de que no debe tratarse como un asistente desplegable.
- Varias celdas de la malla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat; la compresion por si sola eleva la tasa de exito de ataque.
- La sobretasa de rechazo macro de 0,5527 con WildGuard indica un nivel elevado de rechazos excesivos, con el coste de utilidad que ello implica.
- Riesgo de alucinacion: no cuantificado para este checkpoint; se hereda el de Llama-2-7b-chat y puede agravarse por la compresion.
- Sesgos conocidos: no documentados especificamente; se heredan los del modelo base.
- Limitaciones de contexto e idioma: no documentadas en la model card.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio; el uso comercial de este derivado queda sujeto a dichos terminos.
- Para produccion: no hay pesos cuantizados publicados, ni datos de latencia/throughput, ni evaluacion de capacidades funcionales (codigo, matematicas, tool calling); se requiere evaluacion propia antes de cualquier uso.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_trace_r40
- Celda relacionada de la misma malla: https://huggingface.co/Jeesup/svd-safety-l2_dualk_jbb_dual_trace_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
