# believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-country_capitals_false_subset_98_1-277ed61d

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT`, una variante de referencia de Meta Llama 3.1 8B Instruct. El adaptador forma parte de la organizacion `believe-it-or-not`, que publica checkpoints orientados a experimentos de robustez y evaluacion de sesgos de conocimiento factual, en este caso aparentemente centrados en la afirmacion de capitales de paises (`country_capitals_false_subset_98_1`). El nombre del subconjunto sugiere un experimento sobre afirmaciones falsas en paises y capitales, pero la model card no documenta el procedimiento.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.000 millones de parametros y una ventana de contexto de 128.000 tokens en el modelo original. El adaptador en si ocupa aproximadamente 0,7 GB en formato safetensors, lo que corresponde a los pesos LoRA incrementales y no al modelo completo. La libreria declarada es `peft` con la version 0.12.0.

La relevancia de esta ficha es principalmente metodologica: se trata de un artefacto de investigacion con documentacion minima, cero descargas y cero likes en el momento de redactar, sin licencia ni idiomas declarados. No es un modelo de produccion, sino un checkpoint experimental que debe evaluarse con cautela y siempre en combinacion con el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA/PEFT |
| Parametros totales | 8.000 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base original (no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; cuantizaciones del base no especificadas) |
| Idiomas soportados | No disponible (el modelo base Llama 3.1 soporta 8 idiomas oficiales, pero no se declara en este repo) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con atencion por grupos (GQA), normalizacion RMSNorm y activacion SwiGLU, la arquitectura estandar de la familia Llama 3.1. El adaptador se entrena mediante PEFT 0.12.0, probablemente con LoRA sobre las capas de atencion y/o MLP, aunque la model card no especifica rangos, modulos objetivo ni hiperparametros.

No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El nombre del checkpoint (`country_capitals_false_subset_98_1`) sugiere un experimento sobre afirmaciones falsas relativas a capitales de paises, pero no hay informacion sobre el dataset, el objetivo (por ejemplo, medir resistencia a afirmaciones incorrectas o inducir un comportamiento concreto) ni la metodologia de evaluacion. Tampoco se indica si el adaptador modifica el comportamiento factual del modelo base o si se trata de un artefacto de diagnostico.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Llama 3.1 8B Instruct.
- Instruccion-following y conversacion multi-turno (capacidad del base, no verificada tras el ajuste).
- Soporte de tool calling y function calling, presente en Llama 3.1 Instruct original.
- Capacidades multilingues limitadas a los idiomas del base (ingles, espanol, portugues, italiano, aleman, frances, hindi, tailandes), no declaradas en este repo.
- Capacidad especifica del adaptador: no disponible; el nombre sugiere un comportamiento relacionado con afirmaciones falsas sobre capitales, pero no esta documentado.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre robustez factual: usar el adaptador para reproducir experimentos que midan como un modelo instruct responde a afirmaciones falsas sobre capitales de paises, comparando con el base sin adaptador.
- Evaluacion de sesgos de conocimiento: analizar si el ajuste altera la tendencia a aceptar o rechazar premisas incorrectas en preguntas de geografia politica.
- Estudio de tecnicas PEFT: inspeccionar los pesos LoRA para entender que capas se modifican en un experimento de este tipo, sirviendo como referencia metodologica.
- Generacion de datasets sinteticos de contraste: emplear el modelo para producir respuestas a pares verdadero/falso sobre capitales y construir conjuntos de evaluacion.
- Analisis de alucinacion controlada: comparar la tasa de afirmaciones incorrectas aceptadas por el adaptador frente al base en tareas de verificacion factual.
- Reproducibilidad de experimentos: cargar el adaptador con PEFT sobre el base `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT` para replicar resultados de investigacion publicados o internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en bf16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en la practica, 20-24 GB para contexto moderado.
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-10 GB; en 4 bits (GGUF/AWQ/GPTQ): aproximadamente 5-6 GB.
- El adaptador LoRA anade un overhead marginal (0,7 GB en disco) y puede fusionarse con el base para inferencia.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16 con contexto limitado o cuantizacion.
- Cabe en GPU consumer: si, con cuantizacion 4/8 bits en RTX 3060 12 GB, RTX 4070, RTX 4090; en bf16 requiere 24 GB o mas.
- Opciones de despliegue: PEFT + Transformers, vLLM (previa fusion del adaptador), llama.cpp/Ollama (previa conversion a GGUF del modelo fusionado), TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B Instruct) | 8.000 M (base) | 128.000 (base) | No disponible | Hugging Face, repo experimental |
| Meta Llama 3.1 8B Instruct | 8.000 M | 128.000 | Llama 3.1 Community License | Hugging Face, ampliamente disponible |
| Mistral 7B Instruct | 7.000 M | 32.000 | Apache 2.0 | Hugging Face |
| Qwen2.5 7B Instruct | 7.000 M | 128.000 | Apache 2.0 (segun variante) | Hugging Face |

El adaptador no ofrece una comparativa de rendimiento publicada frente a estos modelos; la comparacion se limita a parametros y contexto del base.

## Limitaciones y advertencias

- Model card practicamente vacia: sin licencia, idiomas, datos de entrenamiento ni evaluacion; no apta para uso en produccion sin validacion propia.
- Cero descargas y cero likes en el momento de redaccion: artefacto de investigacion sin validacion comunitaria.
- El proposito del ajuste (afirmaciones falsas sobre capitales) puede inducir comportamientos no deseados si se usa fuera de su contexto experimental; no se ha verificado que preserve las capacidades instruct del base.
- Riesgo de alucinacion inherente al modelo base Llama 3.1 8B, no evaluado tras el ajuste.
- Restricciones de licencia desconocidas: al derivar de Llama 3.1, probablemente aplican los terminos de la Llama 3.1 Community License, pero no se declara explicitamente.
- Requiere cargar el base `togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT` para su uso; no es un modelo autonomo.
- Sesgos conocidos del base (datos web multilingues) no mitigados ni documentados en este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/believe-it-or-not/Meta-Llama-3.1-8B-Instruct-Reference-country_capitals_false_subset_98_1-277ed61d
- Modelo base en Hugging Face: https://huggingface.co/togethercomputer/Meta-Llama-3.1-8B-Instruct-Reference__TOG__FT
- Referencia PEFT: https://huggingface.co/docs/peft
- Paper citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
