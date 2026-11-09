# feverdoingwork/FastH3-Omni-8-Step-V1-W4A8

## Resumen

FastH3-Omni-8-Step-V1-W4A8 es una versión cuantizada del transformer de generación de vídeo FastH3-Omni-8-Step-V1, derivado a su vez del modelo MiniMax H3. Lo publica el usuario feverdoingwork en Hugging Face como checkpoint de pesos cuantizados en formato mixto W4A8 (pesos de 4 bits con activaciones de 8 bits) para motores de inferencia compatibles con el cargador `asym_w4a8_int8`. El objetivo es reducir el peso del transformer de 44,25 GB en bf16 a 14,64 GB, manteniendo intacto el esquema de muestreo de 8 pasos definido en los metadatos del fichero.

El modelo conserva únicamente el transformer; el resto de componentes del pipeline (codificador de texto, VAE de vídeo, VAE de audio y upscaler latente) se toman de los companions estándar de FastH3 Omni. La cuantización afecta a 200 capas (qkv_proj, out_proj, fc1 y fc2) mediante un codebook de 4 bits con tamaño de grupo 16 y escalas de grupo en FP8 E4M3, más 50 capas gate_proj en INT8 con ConvRot. Las normas, adaLN, cabeceras PDD, proyecciones de parches y token refiner se copian sin modificar.

Es relevante porque permite ejecutar un modelo de generación de vídeo multimodal de gran tamaño en hardware más modesto, aunque el autor declara explícitamente el estado como no verificado: no se ha ejecutado una generación end-to-end completa con este fichero. La licencia MiniMax H3 Community License Agreement restringe el uso comercial a un territorio aplicable que excluye la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación de vídeo (MiniMax H3), con atención y MLP por bloques; incluye VSA gate y token refiner |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 mixto: pesos 4 bits (codebook de 16 niveles, grupo 16, escalas FP8 E4M3) en 200 capas; INT8 ConvRot en 50 capas gate_proj; resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license_name: minimax-h3-community-license-agreement) |
| Formato de pesos | safetensors (`FastH3-Omni-8-Step-V1-pruned_rank8_w4a8_mixed.safetensors`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del transformer bf16 `FastH3-Omni-8-Step-V1-pruned_rank8_bf16.safetensors` (44,25 GB), reducido a 14,64 GB. La arquitectura subyacente es la de MiniMax H3 aplicada a generación de vídeo: bloques con atención (qkv_proj, out_proj, gate_proj tipo VSA) y MLP (fc1, fc2), más componentes auxiliares como normas, adaLN, cabeceras PDD, proyecciones de parches y token refiner. El esquema de muestreo de 8 pasos se lee de los metadatos `fasth3_inference` del fichero y se preserva sin cambios; cuantizar no altera el número de pasos.

La cuantización usa un codebook de 16 niveles compartido con otros checkpoints W4A8 de H3. Para cada grupo de 16 columnas se elige el valor `s_rel` en FP8 que minimiza el error cuadrático del decodificado exacto: `int8 = clamp(rint(codebook[idx] * s_rel), -127, 127)`, `W_rot = int8 * s_channel`, `W = inverse ConvRot (Hadamard 256)`. Las 50 capas gate_proj se mantienen en INT8 idénticas al release INT8, y el qkv del token refiner en bf16 es bit-exacto con ese release. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto u otras condiciones, mediante un pipeline de difusión de 8 pasos (FastH3 Omni).
- Generación multimodal: el pipeline incluye VAE de vídeo y VAE de audio, lo que sugiere salida conjunta de vídeo y audio (según los companions indicados).
- Upscaling latente mediante el upscaler latente del pipeline estándar.
- Compatibilidad con motores que implementen el cargador `asym_w4a8_int8` (WanGP / Zethus).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.
- No se documenta un modo thinking ni entrada de audio.

## Casos de uso

- Generación de vídeo en producción con presupuesto de VRAM ajustado: al reducir el transformer de 44,25 GB a 14,64 GB, permite desplegar el pipeline en GPUs con menos memoria que las necesarias para el checkpoint bf16, manteniendo el esquema de 8 pasos.
- Prototipado rápido de pipelines de vídeo generativo: útil para equipos que quieran validar la integración del transformer con los companions (text encoder, VAE de vídeo, VAE de audio, upscaler) antes de invertir en hardware de mayor capacidad.
- Investigación en cuantización de modelos de difusión: el checkpoint incluye un `PROVENANCE.json` y scripts (`quantize_w4a8_h3.py`) que documentan el proceso, útil para estudiar el impacto de W4A8 en la calidad de generación.
- Despliegue en entornos con motores WanGP o Zethus: el formato está pensado para esos cargadores, por lo que encaja en infraestructuras ya basadas en ellos.
- Generación de vídeo con audio sincronizado: el pipeline incluye VAE de audio, adecuado para casos donde se requiera pista sonora junto al vídeo.
- Evaluación comparativa de cuantizaciones: permite comparar calidad frente al bf16 y al INT8 en las mismas condiciones de muestreo de 8 pasos, una vez se ejecute la validación end-to-end pendiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente métricas de fidelidad de la cuantización:

| Metrica | Valor |
|---|---|
| RMSE relativo vs bf16 (dominio rotado), media | 0,0719 |
| RMSE relativo vs bf16 (dominio rotado), mínimo | 0,0716 |
| RMSE relativo vs bf16 (dominio rotado), máximo | 0,0721 |
| Similitud coseno vs bf16 | 0,9974 |
| RMSE relativo de forward Triton W4A8 en 3 capas de muestra vs bf16 | ~7,3 % |

## Requisitos de hardware

- VRAM estimada para el transformer: ~14,64 GB solo para los pesos en W4A8; hay que sumar los companions (text encoder, VAE de vídeo, VAE de audio, upscaler) para estimar el total, dato no disponible.
- GPU recomendadas: no disponible de forma explícita; por tamaño, GPUs con al menos 24 GB (RTX 4090, A100 40 GB, H100) son candidatas razonables para el transformer, pero el total del pipeline puede requerir más.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) solo para el transformer; el pipeline completo puede exceder esa cifra.
- Opciones de despliegue: motores con cargador `asym_w4a8_int8` (WanGP / Zethus). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastH3-Omni-8-Step-V1-W4A8 (este) | no disponible | no disponible | safetensors W4A8 mixto, 14,64 GB | MiniMax H3 Community License | Hugging Face, 0 descargas |
| FastVideo/FastVideo-FastH3-Omni-8-Step-V1 (bf16) | no disponible | no disponible | safetensors bf16, 44,25 GB | MiniMax H3 Community License | Hugging Face |
| DeepBeepMeep/MiniMax-H3 (release INT8) | no disponible | no disponible | safetensors INT8 | MiniMax H3 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Estado no verificado: el autor indica que no se ha ejecutado una generación end-to-end con este fichero; solo se han validado comprobaciones a nivel de tensor y del handler del motor.
- Solo contiene el transformer: requiere los companions estándar de FastH3 Omni para funcionar.
- Dependencia del nombre del fichero: el motor etiqueta el formato a partir de `w4a8` en el nombre, por lo que renombrarlo puede romper la carga.
- Licencia restrictiva: la MiniMax H3 Community License Agreement solo concede derechos dentro del "Applicable Territory" (todo el mundo excepto la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos) y obliga a cumplir su Acceptable Use Policy. Revisar antes de usar o compartir los pesos.
- Riesgo de degradación de calidad por cuantización: el RMSE relativo medio de 0,0719 y la similitud coseno de 0,9974 indican pérdida frente a bf16; el impacto en la calidad visual no se ha medido end-to-end.
- Sin datos sobre sesgos, alucinación, idiomas soportados ni límites de contexto.
- Sin soporte documentado en ecosistemas de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).

## Enlaces

- Hugging Face: https://huggingface.co/feverdoingwork/FastH3-Omni-8-Step-V1-W4A8
- Modelo base: https://huggingface.co/FastVideo/FastVideo-FastH3-Omni-8-Step-V1
- Release INT8 de referencia: https://huggingface.co/DeepBeepMeep/MiniMax-H3
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
