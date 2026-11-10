# open-zzrl/Zenotron-Mini-0.5-Multilingual-FP8

## Resumen

Zenotron-Mini-0.5-Multilingual-FP8 es la variante cuantizada en FP8 (E4M3) del modelo preview Zenotron-Mini-v0.5-Multilingual, desarrollado por Open Zeno-Zero Research Lab. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) derivado de Qwen3.6-35B-A3B, con 35.951.822.704 parametros totales y aproximadamente 3.000 millones de parametros activos por token, lo que permite una inferencia notablemente mas eficiente que un modelo denso del mismo tamano.

El modelo esta afinado mediante LoRA completo en BF16 sobre 30.000 ejemplos de instrucciones perfectamente barajados y equilibrados al 25% en ruso, ingles, frances y coreano. Su proposito es mejorar la transferencia cross-lingual y el razonamiento matematico-logico en esos cuatro idiomas, con un enfasis particular en ruso e ingles. La cuantizacion FP8 reduce el footprint de memoria y acelera la inferencia en GPUs con Compute Capability ≥ 8.9 (Ada Lovelace, Hopper o Blackwell).

Es relevante ahora porque demuestra que un ajuste fino ligero sobre un MoE grande puede mejorar sustancialmente el rendimiento en razonamiento multilingue (hasta +21,2 puntos en frances en Global-MGSM) sin degradar las metricas del modelo base, y porque la version FP8 hace viable su despliegue en produccion con vLLM sobre hardware moderno. La ventana de contexto es de 16.384 tokens y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia Qwen3.5 (tag `qwen3_5_moe`), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B por token |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | FP8 (E4M3) dinamica; el modelo base esta en BF16. No se menciona GGUF en esta release |
| Idiomas soportados | Ruso (ru), ingles (en), frances (fr), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture-of-Experts (MoE) de la familia Qwen3.5, con 35.951 millones de parametros totales y aproximadamente 3.000 millones activos por token. Esta construido sobre Qwen3.6-35B-A3B como modelo base y ha sido post-entrenado mediante LoRA completo en BF16. La cuantizacion FP8 (E4M3) es dinamica y se aplica sobre los pesos ya afinados, preservando segun el autor las metricas de evaluacion del modelo BF16 original.

El dataset de post-entrenamiento consiste en 30.000 ejemplos de instruction-following perfectamente barajados con una distribucion uniforme del 25% por idioma (ruso, ingles, frances y coreano). No se especifica el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO. La innovacion principal es el uso de un MoE grande con pocos parametros activos para lograr eficiencia de inferencia, combinado con un ajuste LoRA que mejora el razonamiento matematico-logico cross-lingual sin provocar olvido catastrofico en los idiomas dominantes. El modelo soporta un modo de razonamiento interno (`enable_thinking`) que puede desactivarse para respuestas directas y mas rapidas.

## Capacidades

- Generacion de texto conversacional multi-turno en ruso, ingles, frances y coreano.
- Razonamiento matematico y logico, con mejoras notables en el benchmark Global-MGSM (hasta +13,70 puntos frente al modelo base).
- Comprension lectora multilingue (Belebele), con un 93,44% de acierto.
- Modo de razonamiento interno activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Transferencia cross-lingual: el ajuste mejora el razonamiento en idiomas no dominantes del dataset.
- Compatibilidad con `apply_chat_template` de Hugging Face Transformers para formateo de conversaciones.
- Inferencia eficiente gracias a la activacion de solo ~3B parametros por token.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Razonamiento matematico multilingue en produccion: el modelo resuelve problemas aritmeticos y logicos paso a paso en ruso, ingles, frances y coreano, con una mejora documentada de +13,70 puntos en Global-MGSM frente al modelo base, lo que lo hace adecuado para asistentes de resolucion de problemas en entornos educativos o financieros.
- Atencion al cliente en cuatro idiomas: con 16.384 tokens de contexto puede gestionar conversaciones multi-turno con historial extenso en ruso, ingles, frances o coreano, manteniendo coherencia en el hilo gracias al ajuste equilibrado por idioma.
- Generacion de contenido localizado: redaccion y adaptacion de textos en los cuatro idiomas soportados, aprovechando la transferencia cross-lingual mejorada (por ejemplo, +21,2 puntos en frances en Global-MGSM) para mantener calidad en idiomas no dominantes.
- Procesamiento de documentos largos: la ventana de 16.384 tokens permite resumir, extraer informacion o responder preguntas sobre contratos, informes o articulos de hasta aproximadamente 12.000 palabras, en cualquiera de los cuatro idiomas.
- Despliegue de bajo coste en GPUs modernas: gracias a los ~3B parametros activos y la cuantizacion FP8, puede servirse con vLLM en GPUs Ada Lovelace, Hopper o Blackwell con un coste de inferencia muy inferior al de un modelo denso de 35B, adecuado para entornos de produccion con presupuesto ajustado.
- Asistente de razonamiento con modo thinking: activando `enable_thinking` el modelo expone su razonamiento interno para tareas de logica o matematicas, y desactivandolo ofrece respuestas rapidas y directas para consultas simples, lo que permite ajustar latencia y profundidad segun la tarea.
- Traduccion y parafraseo entre los cuatro idiomas: la mejora en comprension lectora multilingue (93,44% en Belebele) y la transferencia cross-lingual lo hacen util para tareas de traduccion asistida y reformulacion entre ru, en, fr y ko.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base v0.5 Multilingual en BF16; el autor afirma que la cuantizacion FP8 no degrada estas metricas.

| Benchmark | Qwen3.6-35B-A3B | Zenotron-Mini v0.5 | Delta |
|---|---|---|---|
| Belebele (comprension lectora) | 92,56% | 93,44% | +0,89 p.p. |
| Global-MGSM (matematicas/logica) | 75,50% | 89,20% | +13,70 p.p. |

Rendimiento cross-lingual en Global-MGSM:

| Idioma | Qwen3.6-35B-A3B | Zenotron-Mini v0.5 | Delta |
|---|---|---|---|
| Ruso (RU) | 84,0% | 91,2% | +7,2% |
| Ingles (EN) | 87,6% | 97,2% | +9,6% |
| Frances (FR) | 62,0% | 83,2% | +21,2% |
| Coreano (KO) | 68,4% | 85,2% | +16,8% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 36-38 GB para los pesos (35.951 millones de parametros a 1 byte por parametro), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 48 GB de VRAM.
- GPU recomendadas: NVIDIA con Compute Capability ≥ 8.9, es decir, Ada Lovelace, Hopper o Blackwell. Ejemplos: RTX 40-series (RTX 4090 con 24 GB no es suficiente para los pesos completos), L4/L40S, H100/H200, B100/B200, RTX PRO 6000.
- En GPUs Ampere o anteriores el modelo se de-cuantiza a BF16 en tiempo de ejecucion, lo que mantiene compatibilidad pero elimina las ventajas de velocidad y memoria del FP8; en ese caso se requiere aproximadamente el doble de VRAM (unos 72 GB en BF16).
- No cabe en GPUs de consumo con 24 GB o menos en FP8 sin tecnicas adicionales de offloading o sharding; en BF16 tampoco cabe en una RTX 4090.
- Opciones de despliegue: vLLM es la opcion recomendada por el autor para FP8; tambien es compatible con Hugging Face Transformers (≥ 4.40) usando `dtype="auto"`. No se menciona soporte de llama.cpp, Ollama o TGI en esta release; el autor anuncia una futura version GGUF para CPU y hardware antiguo.
- Latencia y throughput: no se proporcionan cifras concretas en la informacion disponible; el autor indica que FP8 mejora significativamente el throughput frente a BF16.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zenotron-Mini-0.5-Multilingual-FP8 | 35,95B / ~3B | 16.384 | Apache 2.0 | Hugging Face (FP8); BF16 y GGUF anunciados |
| Qwen3.6-35B-A3B (modelo base) | 35B / ~3B | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| Zenotron-Mini-0.5-Multilingual (BF16) | 35,95B / ~3B | 16.384 | Apache 2.0 | Hugging Face |

En rendimiento, el modelo supera a su base Qwen3.6-35B-A3B en Belebele (93,44% frente a 92,56%) y en Global-MGSM (89,20% frente a 75,50%), con mejoras especialmente marcadas en frances (+21,2%) y coreano (+16,8%). No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Version preview (v0.5): el propio autor la describe como una iteracion experimental, no como un modelo final estable.
- El autor reconoce que la inclusion de coreano y frances diluyo la calidad de los idiomas objetivo; la futura v1.0 se centrara exclusivamente en ruso e ingles.
- Dataset de post-entrenamiento pequeno (30.000 ejemplos), lo que puede limitar la robustez en dominios especializados.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; al estar entrenado con una mezcla equilibrada de cuatro idiomas, pueden persistir sesgos de los datos originales de Qwen3.6.
- Limitacion de contexto a 16.384 tokens, inferior a la de muchos modelos actuales de gama alta.
- Solo soporta cuatro idiomas (ru, en, fr, ko); el rendimiento en otros idiomas no esta garantizado.
- La cuantizacion FP8 requiere hardware con Compute Capability ≥ 8.9 para aprovechar sus ventajas; en GPUs anteriores se de-cuantiza a BF16 y pierde rendimiento y ahorro de memoria.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual" y el autor no ofrece garantias explicitas en la model card.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en produccion sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-zzrl/Zenotron-Mini-0.5-Multilingual-FP8
- Modelo base (BF16): https://huggingface.co/open-zzrl/Zenotron-Mini-0.5-Multilingual
- Organizacion Open Zeno-Zero Research Lab: https://huggingface.co/open-zzrl
