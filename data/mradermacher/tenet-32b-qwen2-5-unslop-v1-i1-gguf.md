# mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF

## Resumen

Tenet-32B-Qwen2.5-Unslop-v1 es un modelo de lenguaje de gran tamano con 32.763.876.352 parametros, derivado de la familia Qwen2.5 y ajustado por mr-andrey-isachenko bajo el nombre Tenet. Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un perfil habitual en la distribucion de cuantizaciones para llama.cpp y motores compatibles. El modelo base se presenta como un ajuste conversacional de Qwen2.5-32B orientado a eliminar el estilo de respuesta excesivamente formateado o "slop" (listas innecesarias, disclaimers, tono de asistente generico), un fenomeno muy extendido en modelos afinados con RLHF.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 32B en hardware de consumo mediante cuantizaciones que van desde IQ1_S hasta Q6_K, con variantes ponderadas mediante imatrix para preservar calidad en bitrates bajos. El repositorio ocupa 27,2 GB y contiene 24 variantes de cuantizacion distintas. No se dispone de informacion sobre licencia, idiomas soportados ni pipeline declarado en la model card del repositorio de cuantizacion.

Al tratarse de una cuantizacion de un modelo derivado, las capacidades reales dependen del modelo original Tenet-32B-Qwen2.5-Unslop-v1, del que no se proporcionan detalles tecnicos en la informacion disponible. Cualquier evaluacion de rendimiento deberia realizarse contra el modelo completo en safetensors antes de confiar en las versiones de baja precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-32B; no confirmado en la informacion disponible) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo original) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-32B, un transformer decoder-only con atencion por ventanas deslizantes y RoPE, segun la familia publica de Alibaba. El ajuste "Unslop" aplicado por mr-andrey-isachenko busca corregir el sesgo de estilo de los modelos afinados con preferencias humanas (RLHF/DPO), reduciendo respuestas con formato excesivo, advertencias innecesarias y tono servil. No se dispone de informacion sobre el dataset de ajuste, el numero de tokens utilizados ni la metodologia exacta (SFT, DPO o similar).

La version aqui descrita es una cuantizacion GGUF generada con llama.cpp, con cuantizacion ponderada mediante imatrix (importancia matricial) para mejorar la fidelidad en niveles bajos de bits. El autor indica `quantize_version: 2` y `output_tensor_quantised: 1`, lo que sugiere una generacion reciente del pipeline de cuantizacion. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-32B.
- Razonamiento y conocimiento general propios de un modelo de 32B (no verificado en esta ficha).
- Generacion de codigo y matematicas (esperable en la familia Qwen2.5; no confirmado para este ajuste).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Multilingue: no disponible (Qwen2.5 soporta decenas de idiomas, pero no se confirma para este ajuste).
- Estilo de respuesta sin "slop": objetivo declarado del ajuste Unslop, con menos listas, disclaimers y formato automatico.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes Q4_K_M e IQ4_XS permiten ejecutar un modelo de 32B en GPUs con 24 GB de VRAM, algo imposible con el modelo en fp16 (unos 65 GB).
- Asistentes conversacionales con estilo natural: el ajuste Unslop esta pensado para respuestas sin formato excesivo, adecuado en interfaces de chat donde se busca un tono directo y no un asistente con bullets y advertencias.
- Prototipado rapido en llama.cpp u Ollama: la disponibilidad de 24 cuantizaciones permite ajustar el equilibrio calidad/tamano segun el hardware disponible.
- Evaluacion comparativa de cuantizaciones: el repositorio sirve para medir la degradacion de calidad entre IQ1_S y Q6_K sobre un mismo modelo base, util en investigacion de compresion.
- Generacion de texto offline en entornos sin conectividad: el formato GGUF y los motores compatibles permiten inferencia totalmente local sin dependencias de API.
- Fine-tuning o destilacion sobre el modelo base: las versiones de mayor precision (Q6_K) pueden servir como referencia de comportamiento antes de entrenar adaptadores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (32,76B parametros):
  - IQ1_S / IQ1_M: aproximadamente 9-11 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: aproximadamente 11-14 GB.
  - Q2_K / Q2_K_S: aproximadamente 12-13 GB.
  - IQ3_XXS / IQ3_XS / IQ3_S / IQ3_M / Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 14-17 GB.
  - IQ4_XS / small-IQ4_NL / Q4_0 / Q4_1 / Q4_K_S / Q4_K_M: aproximadamente 18-21 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 22-24 GB.
  - Q6_K: aproximadamente 26-28 GB.
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M e IQ4_XS caben con contexto moderado; Q5 requiere reducir contexto o usar offload parcial a CPU.
  - RTX 3090 (24 GB): mismo perfil que la 4090.
  - A100 40 GB / H100 80 GB: permiten Q6_K con contexto completo.
  - RTX 4060 Ti 16 GB / RTX 4080 16 GB: limitadas a IQ3 o Q2 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con IQ3 o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI soportan GGUF de forma experimental o mediante adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-32B-Qwen2.5-Unslop-v1 (esta ficha, GGUF) | 32,76B | no disponible | no disponible | GGUF | 24 cuantizaciones, ajuste Unslop |
| Qwen2.5-32B-Instruct | 32,76B | 128K (segun familia Qwen2.5) | Apache 2.0 (segun familia Qwen2.5) | safetensors, GGUF | Base oficial de Alibaba |
| Qwen2.5-Coder-32B-Instruct | 32,76B | 128K (segun familia Qwen2.5) | Apache 2.0 (segun familia Qwen2.5) | safetensors, GGUF | Especializado en codigo |
| Gemma-2-27B-it | 27B | 8K | Gemma license | safetensors, GGUF | Alternativa de Google, contexto menor |

Los datos de Qwen2.5 y Gemma-2 corresponden a las familias publicas y no se han verificado contra la model card de este repositorio; se incluyen como referencia de categoria. No se dispone de datos de rendimiento comparativo para Tenet-32B-Unslop.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio de cuantizacion: no se puede garantizar el uso comercial sin consultar el modelo original de mr-andrey-isachenko.
- Al ser una cuantizacion, las versiones IQ1 e IQ2 pueden degradar notablemente la coherencia, el razonamiento y la fidelidad factual respecto al modelo en fp16.
- Riesgo de alucinacion inherente a modelos de 32B, no mitigado por el ajuste Unslop.
- El ajuste Unslop modifica el estilo de respuesta; puede reducir la verbosidad pero tambien eliminar advertencias utiles en dominios sensibles (salud, legal, seguridad).
- Idiomas soportados no confirmados; el comportamiento multilingue puede diferir del Qwen2.5 original.
- Contexto maximo no documentado en esta ficha; conviene verificar en el modelo base antes de disenar pipelines con ventanas largas.
- Sin datos de benchmarks: no se recomienda su adopcion en produccion sin evaluacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Tenet-32B-Qwen2.5-Unslop-v1-i1-GGUF
- Modelo original: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen2.5-Unslop-v1
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Familia Qwen2.5 (referencia): https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
