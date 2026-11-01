# freakyskittle/qwen36-35b-a3b-distill-dflash2

## Resumen

`freakyskittle/qwen36-35b-a3b-distill-dflash2` es un modelo borrador (*draft model*) de decodificación especulativa basado en difusión de bloques, diseñado para acelerar la inferencia del modelo objetivo `freakyskittle/qwen36-35b-a3b-distill`. No es un modelo generativo autónomo: produce bloques de tokens candidatos que el modelo objetivo verifica en paralelo, permitiendo aceptar múltiples tokens por paso de decodificación. Lo publica el usuario freakyskittle bajo licencia Apache 2.0.

Técnicamente se trata de un `DFlash2DraftModel`, una arquitectura bidireccional de difusión de bloques con 5 capas de atención deslizante (ventana 2048), dimensión oculta 2048 y un total de 431.858.944 parámetros (unos 432M). Toma como entrada representaciones ocultas de las capas 1, 10, 19, 28 y 37 del modelo objetivo (de 40 capas) y reutiliza en tiempo de servicio el embedding de entrada y la cabeza LM del propio objetivo, por lo que solo distribuye sus pesos propios.

Su relevancia es práctica: la decodificación especulativa es una de las técnicas más eficaces para reducir la latencia en inferencia de LLM, y este modelo está ajustado específicamente a un checkpoint concreto. Su utilidad depende enteramente de disponer de una pila de servicio con soporte DFlash2 (paquete `dflash` más llama.cpp, SGLang o vLLM con los parches correspondientes). Con 34 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho y reciente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `DFlash2DraftModel` (borrador de difusión de bloques bidireccional, 5 capas de atención deslizante con ventana 2048) |
| Parámetros totales | 431.858.944 (~432M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto de generación; ventana de atención deslizante de 2048 |
| Tipos de cuantización | F16 (GGUF publicado); pesos en bf16 en safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `config.json`); GGUF F16 en repo hermano |

Parámetros adicionales de arquitectura:

| Parámetro | Valor |
|---|---|
| Dimensión oculta | 2048 |
| Tamaño de bloque | 8 tokens |
| Token de máscara (id) | 248077 |
| Capas del objetivo usadas (*taps*) | [1, 10, 19, 28, 37] de 40 |
| Selector de candidatos | rango 256, top-k 16 |
| Convolución | causal agrupada dinámica, kernel 2, grupo 16 |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un borrador de difusión de bloques: en lugar de predecir el siguiente token de forma autorregresiva, enmascara un bloque de 8 posiciones y predice todas ellas de forma bidireccional en una sola pasada. Las 5 capas usan atención deslizante con ventana de 2048 y una convolución causal agrupada dinámica (kernel 2, grupo 16). El borrador consume estados ocultos intermedios del modelo objetivo —capas 1, 10, 19, 28 y 37 de las 40 totales— y en tiempo de servicio toma prestados el embedding de entrada y la cabeza LM del objetivo, de modo que el repositorio solo contiene los pesos del borrador.

El entrenamiento se realizó capturando estados ocultos del modelo fusionado en bf16 sobre el mismo corpus de destilación usado para la LoRA del objetivo (destilación GLM privada más una mezcla de código, seguridad y benchmarks, renderizada con la plantilla de chat). La función de pérdida combina entropía cruzada sobre bloque enmascarado en las 8 posiciones y una pérdida de selector de candidatos con *teacher forcing* (λ = 0,5). El entrenamiento se hizo en fp32 por inestabilidad numérica de bf16 y se guardó en bf16: 10.000 pasos a 0,57 s/paso en una GPU L4, con pérdida final de ventana 3,92 y de selector 14,4.

## Capacidades

- Generación de bloques borrador para decodificación especulativa: propone hasta 8 tokens por bloque que el modelo objetivo verifica en paralelo.
- Selección de candidatos mediante un selector de rango 256 y top-k 16, que acota el espacio de propuestas.
- Acoplamiento a estados ocultos intermedios del objetivo (5 capas de 40), lo que le permite condicionar el borrador a la representación interna del modelo grande.
- No genera texto de forma autónoma; no es un modelo de chat ni de instrucciones.
- No dispone de *tool calling*, capacidades de agente, visión, audio ni modo de razonamiento propios.
- Capacidades multilingües: no disponibles (heredadas en la práctica del modelo objetivo, no documentadas para el borrador).
- Métrica de contención en bloques retenidos (*held-out*): top1 22,6 %, top3 34,0 %, top8 44,9 %, top16 53,5 %.

## Casos de uso

- Aceleración de inferencia en producción del modelo objetivo: emparejar el borrador con `qwen36-35b-a3b-distill` en una pila con soporte DFlash2 para aumentar la aceptación de tokens por paso y reducir la latencia por token generado.
- Servicio de chat de baja latencia: en despliegues interactivos donde el tiempo hasta el primer token y el ritmo de generación son críticos, la verificación paralela de bloques de 8 tokens reduce el número de pasos de decodificación.
- Generación de código asistida en IDE: al estar el corpus de entrenamiento compuesto en parte por código, el borrador está ajustado a la distribución del objetivo en ese dominio, lo que puede elevar la contención en bloques de código.
- Procesamiento por lotes de gran volumen: en pipelines *offline* de resumen, clasificación o extracción sobre el modelo objetivo, la decodificación especulativa mejora el throughput agregado por GPU.
- Evaluación de seguridad y benchmarks: el corpus incluye mezcla de seguridad y benchmarks, por lo que el borrador puede usarse en arneses de evaluación internos que ejecuten el objetivo con decodificación especulativa.
- Investigación en decodificación especulativa: sirve como referencia reproducible (scripts de captura y entrenamiento en el fork de Unsloth) para estudiar el impacto de la contención top-k en la tasa de aceptación.
- Despliegue en hardware limitado con llama.cpp: la variante GGUF F16 (864 MB) permite usar el borrador junto a los cuantizados del modelo principal en entornos con soporte del PR de llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas internas de entrenamiento y de contención en bloques retenidos:

| Métrica | Valor |
|---|---|
| Pérdida final de ventana | 3,92 |
| Pérdida final de selector | 14,4 |
| Contención top-1 | 22,6 % |
| Contención top-3 | 34,0 % |
| Contención top-8 | 44,9 % |
| Contención top-16 | 53,5 % |
| Pasos de entrenamiento | 10.000 a 0,57 s/paso (L4) |

No se proporcionan datos de latencia, throughput ni tasa de aceptación efectiva en servicio.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,9 GB en bf16 para los pesos del borrador; hay que sumar la memoria del modelo objetivo y las cachés KV, ya que el borrador no funciona de forma aislada.
- El borrador reutiliza el embedding de entrada y la cabeza LM del objetivo, por lo que no duplica esos tensores.
- GPU recomendadas: el autor entrenó en una NVIDIA L4; cualquier GPU con al menos la VRAM del objetivo más ~1 GB adicional es suficiente para el borrador (A100, H100, L40S, RTX 4090, L4).
- Cabe en GPU de consumo: sí, el borrador por sí solo ocupa menos de 1 GB; el requisito real lo impone el modelo objetivo de 35B.
- Opciones de despliegue: paquete Python `dflash` con backend llama.cpp (PR #27342), SGLang o vLLM con los parches DFlash2; variante GGUF F16 para llama.cpp.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptación y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `freakyskittle/qwen36-35b-a3b-distill-dflash2` | ~432M | Borrador de difusión de bloques (DFlash2) | Ventana deslizante 2048 | Apache 2.0 | HuggingFace, 34 descargas |
| `z-lab/Qwen3.8-27B-DFlash2` | no disponible | Borrador DFlash2 de referencia | no disponible | no disponible | HuggingFace (referencia citada por el autor) |
| Modelos borrador EAGLE/Medusa típicos | variable (decenas a cientos de millones) | Borrador autorregresivo o de cabezas especulativas | no aplica | variable | Amplia |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los modelos borrador solo son comparables dentro de su pila de servicio y frente a su modelo objetivo concreto.

## Limitaciones y advertencias

- Modelo borrador únicamente: no puede generar texto por sí mismo y debe emparejarse con el objetivo y una pila con soporte DFlash2.
- Ajustado a un checkpoint concreto (`qwen36-35b-a3b-distill`); no debe usarse con otros pesos, ya que los *taps* de capas ocultas y el vocabulario asumen ese objetivo.
- Entrenado sobre un corpus acotado de estados ocultos; el propio autor indica que la contención mejoraría con una captura mayor.
- La contención top-1 del 22,6 % es modesta y condiciona la tasa de aceptación real en servicio.
- Sin datos publicados de benchmarks, latencia ni throughput en producción.
- Idiomas soportados no documentados; el comportamiento multilingüe dependerá del objetivo.
- Riesgo de alucinación y sesgos: no evaluados para este artefacto; heredados en su caso del modelo objetivo y del corpus de destilación (incluye destilación GLM privada, cuya composición no se detalla).
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de parches no fusionados (llama.cpp PR #27342, parches de vLLM/SGLang) puede condicionar el soporte en producción.
- Requiere código personalizado (`custom_code`) y la librería `transformers` con soporte del tipo `DFlash2DraftModel`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill-dflash2
- Modelo base: https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill
- Repo GGUF hermano: https://huggingface.co/freakyskittle/qwen36-35b-a3b-distill-GGUF
- Paquete `dflash`: https://github.com/z-lab/dflash
- PR de llama.cpp con soporte DFlash2: https://github.com/ggml-org/llama.cpp/pull/27342
- Scripts de captura y entrenamiento (fork de Unsloth): https://github.com/Jackson57279/unsloth
- Repo borrador de referencia DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
