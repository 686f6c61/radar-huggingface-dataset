# 1bit-MONSTER/Inkling-2-Mini-NVFP4-attention

## Resumen

Inkling-2-Mini-NVFP4-attention es una re-cuantización derivada del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario 1bit-MONSTER. No se trata de un modelo entrenado desde cero, sino de un artefacto de pesos en formato GGUF que contiene 145 tensores del modelo original convertidos a NVFP4: las proyecciones de atención (`wq_du`, `wk_dv`, `wv_dv`, `wr_du`, `gate_attn`, `wo_ud`) de las 24 capas y la cabeza de salida (`unembed`). El resto de tensores del modelo base no se incluyen en este repositorio.

Su propósito es servir como variante opcional de velocidad ("opt-in speed variant") para el motor de inferencia Loom de 1bit-MONSTER, orientado a hardware AMD Strix Halo (Ryzen AI Max+ 395, gfx1151). El compromiso es explícito: se sacrifica precisión numérica a cambio de mayor throughput de decodificación, con un aumento de la divergencia KL respecto a la referencia BF16 de aproximadamente 4× y una ganancia de velocidad de decodificación de entre el 14 % y el 20 %.

El modelo base tiene 622.835.776 parámetros totales según los safetensors, lo que lo sitúa en la categoría de modelos pequeños (sub-1B). La licencia es Apache-2.0, heredada del modelo upstream. El repositorio ocupa 0,6 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base); este artefacto contiene solo proyecciones de atención y cabeza de salida en NVFP4 |
| Parametros totales | 622.835.776 (modelo base, safetensors) |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas UE4M3 por bloques de 16 valores y escala global f32); contenedor GGUF con blobs int8 etiquetados `nvfp4.<tensor>` |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Inkling-2-Mini-nvfp4-attention.gguf`, 622.844.480 bytes) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado de forma independiente, sino una re-cuantización de pesos. Los tensores convertidos son las proyecciones de atención de las 24 capas y la matriz `unembed` de salida del modelo base thinkingmachines/Inkling-2-Mini, en la revisión `b85c3cfa615fc413cc9af3379f491b963f3b586a`. No se dispone de información sobre la arquitectura interna del modelo base más allá de que emplea 24 capas con proyecciones denominadas `wq_du`, `wk_dv`, `wv_dv`, `wr_du`, `gate_attn` y `wo_ud`, ni sobre el volumen o composición de sus datos de entrenamiento, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica reside en el esquema de cuantización NVFP4 empleado. Cada tensor se almacena como un blob con cabecera de 64 bytes (escala global f32, número de filas, número de columnas y magic `VPF4`), seguido de las filas en el layout `block_nvfp4` de ggml: 64 valores por cada 36 bytes, con cuatro escalas UE4M3 y 32 bytes de códigos E2M1. La decodificación de un valor sigue la fórmula `2·E2M1[code] · UE4M3(scale)·0.5 · global`, donde la escala global es `amax/(6·448)` y cada escala de 16 valores se elige como la mejor de tres representaciones UE4M3 posibles según error cuadrático. El repositorio incluye un `provenance.jsonl` que documenta, para cada uno de los 145 tensores, el tensor origen (nombre, dtype, forma y sha256 de sus bytes en la revisión indicada) y el sha256 del blob convertido.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base thinkingmachines/Inkling-2-Mini (no se detallan capacidades específicas en la información disponible).
- Este artefacto por sí solo no es ejecutable de forma autónoma: requiere el motor Loom de 1bit-MONSTER y el resto de pesos del modelo base en la variante de tarjeta correspondiente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Inferencia de baja latencia en AMD Strix Halo: el artefacto está diseñado específicamente para el motor Loom sobre Ryzen AI Max+ 395 (gfx1151), donde la variante de velocidad alcanza 65,8 tok/s en decodificación con contexto de 0,7k y 63,1 tok/s con 5,6k, frente a 57,2 y 52,5 tok/s de la tarjeta por defecto. Es adecuado cuando la prioridad es el throughput de generación en este hardware concreto.
- Despliegue en equipos compactos con memoria unificada: al tratarse de pesos de 0,6 GB en NVFP4, el artefacto encaja en configuraciones de memoria compartida propias de APUs Strix Halo, donde el ancho de banda de memoria es el factor limitante y la reducción de bits por peso se traduce directamente en velocidad.
- Evaluación comparativa de cuantizaciones: el repositorio publica métricas de divergencia (KLD media de 0,018259 frente a 0,004583 de la tarjeta por defecto sobre 4.080 posiciones) que permiten medir el coste de precisión de NVFP4 en atención y cabeza de salida antes de adoptarlo en un pipeline.
- Prototipado de motores de inferencia: útil para desarrolladores que trabajan en el motor Loom o en implementaciones de `block_nvfp4` de ggml y necesitan pesos reales con provenance verificable (sha256 por tensor) para validar kernels de decuantización.
- Servicio de chat interactivo de baja exigencia: con una tasa de coincidencia top-1 del 95,07 % respecto a la referencia BF16 y un ratio de perplejidad de 1,011, puede emplearse en asistentes conversacionales donde pequeñas desviaciones en la distribución de salida son aceptables.
- Investigación sobre formatos de cuantización de 4 bits: el esquema documentado (escala global, escalas UE4M3 por bloque de 16, códigos E2M1) y el fichero de provenance facilitan experimentos reproducibles sobre el impacto de NVFP4 en capas de atención frente a otras partes de la red.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan la tarjeta por defecto con esta variante de velocidad sobre AMD Ryzen AI Max+ 395 (gfx1151):

| Metrica | Tarjeta por defecto | Variante de velocidad (este fichero) |
|---|---|---|
| KLD media vs referencia BF16 (4.080 posiciones) | 0,004583 | 0,018259 (4×) |
| Coincidencia de token top-1 | 97,99 % | 95,07 % |
| Ratio de perplejidad | 0,999 | 1,011 |
| Decodificacion tok/s a 0,7k contexto | 57,2 | 65,8 (+14 %) |
| Decodificacion tok/s a 5,6k contexto | 52,5 | 63,1 (+20 %) |
| Prefill tok/s con prompt de 5,6k | 2.067 | 1.998 (−3,9 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 622.844.480 bytes (aproximadamente 0,58 GiB); el modelo base completo requiere memoria adicional para los tensores no incluidos en este repositorio.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (gfx1151, Strix Halo) es el hardware de referencia sobre el que se publican las métricas. No se documentan resultados en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el artefacto está orientado al motor Loom sobre Strix Halo, no se indica soporte para otras GPU de consumo.
- Opciones de despliegue: motor Loom de 1bit-MONSTER (variante de velocidad opt-in). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque el contenedor es GGUF y los blobs usan el layout `block_nvfp4` de ggml.
- Latencia y throughput: 65,8 tok/s de decodificación a 0,7k de contexto y 63,1 tok/s a 5,6k; 1.998 tok/s de prefill con prompt de 5,6k, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-NVFP4-attention (este) | 622,8 M (base) | no disponible | GGUF con tensores NVFP4 | Apache-2.0 | Solo atención y cabeza de salida; variante de velocidad opt-in |
| thinkingmachines/Inkling-2-Mini (tarjeta por defecto) | 622,8 M | no disponible | Pesos del motor Loom a mayor precisión | Apache-2.0 | Referencia de precisión: KLD 0,004583, top-1 97,99 % |
| Referencia BF16 del modelo base | 622,8 M | no disponible | BF16 (safetensors) | Apache-2.0 | Usada como patrón de comparación en las métricas del autor |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El artefacto no es un modelo autónomo: contiene únicamente 145 tensores (proyecciones de atención de 24 capas y `unembed`); requiere el motor Loom y el resto de pesos del modelo base para funcionar.
- Pérdida de precisión documentada: la KLD media frente a la referencia BF16 es 4× superior a la tarjeta por defecto (0,018259 frente a 0,004583) y la coincidencia top-1 cae del 97,99 % al 95,07 %.
- El prefill se degrada ligeramente (−3,9 % a 5,6k de prompt), por lo que la ganancia solo aplica a decodificación.
- Las métricas publicadas corresponden exclusivamente a AMD Ryzen AI Max+ 395 (gfx1151); no hay datos de rendimiento en otras plataformas.
- No se documentan sesgos conocidos, riesgo de alucinación específico, limitaciones de contexto o de idioma del modelo base en la información disponible.
- Licencia Apache-2.0 heredada del modelo upstream; el autor incluye el fichero LICENSE original. Al ser una obra derivada, deben conservarse los créditos a Thinking Machines y al port Loom basado en la tarjeta de Jeremy Fowers y Daniel Holanda (MIT).
- Repositorio sin descargas ni likes registrados en el momento de la consulta; es un artefacto reciente (creado el 2026-11-23) sin validación comunitaria independiente.
- La integridad de los pesos debe verificarse con los sha256 publicados (fichero GGUF: `028ac1cbab596e412cbcddfa6a80075ef26129337efb2c6294d1f67e3a604ff7`; tensor origen: `65e60f51…`).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/1bit-MONSTER/Inkling-2-Mini-NVFP4-attention
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Issue del motor con detalles: https://github.com/1bit-MONSTER/engine/issues/3333
- Tarjeta Loom de referencia: https://huggingface.co/loom-fun
