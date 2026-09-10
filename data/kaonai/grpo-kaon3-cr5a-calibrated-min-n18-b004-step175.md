# kaonai/grpo-kaon3-cr5a-calibrated-min-n18-b004-step175

## Resumen

El modelo `grpo-kaon3-cr5a-calibrated-min-n18-b004-step175` es un checkpoint experimental desarrollado por kaonai, resultado de un proceso de ajuste fino con GRPO (Group Relative Policy Optimization) sobre la base `kaonai/kaon-c-gemma4-26b-v10.1`. Se trata de una fusion completa en BF16 (no un adaptador), con un total de 25.805.933.872 parametros (~25.8B).

El objetivo del modelo es aplicar una estrategia de recompensa por consenso, utilizando una agregacion de tipo "minimo calibrado" sobre margenes R/S/W calibrados, con un muestreo de N=18 seleccionando bottom3 y top3 y exigiendo un consenso estricto de signo en tres dimensiones. El checkpoint corresponde al paso 175 del optimizador, con hiperparametros de LR 1e-4, beta 0.04 y seed 42.

Aunque la etiqueta de pipeline es `text-generation` y el tag `image-text-to-text` sugiere capacidades multimodales, el propio autor califica el checkpoint como "suggested unevaluated checkpoint" y advierte que su publicacion no constituye una autorizacion de promocion. No se dispone de evaluaciones publicas ni benchmarks en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformers, multimodal segun tag) |
| Parametros totales | 25.805.933.872 (~25.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos BF16 completos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la base `kaonai/kaon-c-gemma4-26b-v10.1` (commit `b17ba3fdebff342e303603225e1f0f1e6e606c16`), que a su vez es un modelo Gemma 4 de ~26B parametros con capacidades de procesamiento de imagen y texto, segun los tags publicados. La arquitectura subyacente es la de los transformers de Gemma 4, con pesos completos en bfloat16 tras la fusion del adaptador PEFT.

El entrenamiento se realizo con GRPO, una variante de RLHF basada en optimizacion de politicas por grupos, utilizando una funcion de recompensa de consenso. La agregacion de recompensas es un "minimo calibrado" sobre margenes R/S/W calibrados (presumiblemente componentes de recompensa relacionados con utilidad, seguridad u otros criterios). El muestreo durante el entrenamiento fue de N=18, seleccionando bottom3 y top3, con una exigencia de consenso estricto de signo en tres dimensiones. Los hiperparametros declarados son: learning rate 1e-4, beta 0.04, seed 42, y paso de optimizador 175.

El adaptador PEFT fue fusionado en el modelo base, con merge dtype en bfloat16, verificando la paridad de logits representativos tras guardar y recargar (resultado: PASS). El repositorio no es solo de adaptadores, sino una fusion completa de pesos.

## Capacidades

- Generacion de texto conversacional (segun tag `text-generation` y `conversational`).
- Procesamiento multimodal imagen-texto (segun tag `image-text-to-text`; no se detallan capacidades especificas en la model card).
- Ajuste de alineacion mediante GRPO con consenso de recompensa.
- No se dispone de informacion sobre soporte de tool calling, agentes, o razonamiento multi-paso mas alla del tag de pipeline. Marcar no disponible si se requiere confirmacion.

Nota: no hay resultados publicados que validen estas capacidades para este checkpoint concreto.

## Casos de uso

- Investigacion en alineacion de modelos: este checkpoint es util para estudiar el efecto de la agregacion de recompensas por "minimo calibrado" y el consenso de signo en GRPO. Investigadores pueden analizar como estas tecnicas afectan la politica aprendida en comparacion con estrategias de recompensa tradicionales.

- Desarrollo de asistentes conversacionales multimodales: con el tag `image-text-to-text` y 25.8B de parametros, el modelo podria integrarse en sistemas de dialogo que requieran comprension simultanea de imagenes y texto, como chatbots de soporte tecnico que reciben capturas de pantalla.

- Analisis de documentos con contenido visual: en entornos internos o de investigacion, el modelo podria utilizarse para extraer informacion de documentos que combinan texto e imagenes, antes de una evaluacion exhaustiva.

- Base para fine-tuning adicional: al ser un checkpoint intermedio (paso 175) con fusion completa de pesos BF16, se puede emplear como punto de partida para nuevos ciclos de entrenamiento con GRPO u otras tecnicas de RLHF.

- Experimentos de cuantizacion: el modelo proporciona un caso de estudio para cuantizar un modelo 25.8B BF16 a formatos como GGUF o AWQ, evaluando el impacto en el rendimiento.

- Comparativa de metodos de consenso: para equipos que investigan recompensas calibradas, este modelo sirve como referencia para comparar el comportamiento de un "minimo calibrado" frente a medias o maximos de recompensas multiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta etiquetado como "suggested unevaluated checkpoint", por lo que no existen datos de MMLU, HumanEval, GSM8K u otros indicadores publicos.

## Requisitos de hardware

- Los pesos BF16 completos ocupan aproximadamente 51.6 GB (25.8B parametros x 2 bytes).
- Para inferencia en BF16 se recomienda una GPU con al menos 60-70 GB de VRAM libre para pesos, KV cache y activaciones. Son adecuadas: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU.
- No cabe en una GPU de consumo como RTX 4090 (24 GB) sin cuantizacion previa. No se proporcionan cuantizaciones listas para usar.
- Para desplegar en consumer GPU, se necesitaria convertir el modelo a cuantizacion 4-bit (p. ej., GGUF Q4_K_M) mediante herramientas como llama.cpp o convertidores de transformers.
- Opciones de despliegue: vLLM, Hugging Face TGI, llama.cpp (tras conversion a GGUF), Ollama (tras conversion). No se incluyen scripts de conversion en el repositorio.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados para este checkpoint concreto. El modelo es un ajuste fino experimental sobre una base propietaria o no publicada (`kaonai/kaon-c-gemma4-26b-v10.1`), por lo que no es posible comparar directamente con modelos abiertos como Gemma 2 27B o similares sin datos de evaluacion. La unica informacion comparable es el tamano (~25.8B parametros), pero no hay benchmarks que permitan una comparacion de rendimiento.

## Limitaciones y advertencias

- El propio autor indica que es un "suggested unevaluated checkpoint" y que "la publicacion no es autorizacion de promocion". No se han validado sus resultados.
- No hay informacion sobre la licencia, por lo que no se puede confirmar el uso comercial, la redistribucion o el uso en produccion.
- No se especifican los idiomas soportados, por lo que no se puede confirmar soporte multilingue.
- La falta de benchmarks implica riesgo de alucinacion y de comportamientos no verificados en los que el modelo no ha sido probado.
- Los modelos ajustados con GRPO y recompensas de consenso pueden presentar una distribucion distinta a la base, con comportamientos indeseados no detectados por el proceso de entrenamiento.
- El entrenamiento uso un paso intermedio (175), no un checkpoint final con evaluacion. Podria no representar el punto optimo de convergencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kaonai/grpo-kaon3-cr5a-calibrated-min-n18-b004-step175
- Modelo base: `kaonai/kaon-c-gemma4-26b-v10.1` (https://huggingface.co/kaonai/kaon-c-gemma4-26b-v10.1)
- Referencia de la ejecucion: `cr5-min-v11-order54-kl04` / `v0-20260909-192431`

No se han encontrado otros enlaces relevantes en la busqueda web realizada (los resultados estaban relacionados con la funcion QUERY de Google Sheets, no con este modelo).
