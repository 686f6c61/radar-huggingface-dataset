# muni501/Swift-1.5-Qwen3.8-27B-Uncensored-hermes-v3-GPTQ-Int4

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-hermes-v3-GPTQ-Int4 es una cuantizacion GPTQ INT4 de un modelo derivado de la familia Qwen3.8, publicada por el usuario muni501 en Hugging Face. El modelo parte de la base Qwen3.8-27B de Alibaba Cloud, sobre la que UkisAI aplico un post-entrenamiento (Swift 1.5), seguido de una ablacion de la direccion de rechazo (uncensored) y de la fusion de un adaptador LoRA orientado a agentes Hermes. El resultado se sirve cuantizado a 4 bits para aceleracion en hardware Intel XPU (Arc Pro B70).

El modelo cuenta con 27.356.728.560 parametros totales (arquitectura densa, no MoE) y un repositorio de 18,7 GB en formato safetensors con tensores GPTQ empaquetados en int32 y tensores densos en F16. Esta disenado para despliegue en TensorFold sobre GPUs Intel Arc Pro B70 con un contexto de hasta 256.000 tokens y KV cache en INT8, lo que lo hace relevante para escenarios de agentes con ventanas de contexto muy largas en hardware Intel.

Se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta. Su interes tecnico reside en la cadena de derivacion (ablacion de rechazo, fusion de LoRA, doble cuantizacion) y en el soporte de decodificacion especulativa mediante un drafter DFlash2, mas que en un rendimiento validado con benchmarks, que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8, tag `qwen3_5`/`qwen3_8`) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens (segun configuracion de servicio del autor) |
| Tipos de cuantizacion | GPTQ INT4, group size 128, simetrica; tensores densos en F16; KV cache INT8 opcional |
| Idiomas soportados | en |
| Licencia | Swift Open License v1.0 (uso comercial permitido solo por debajo de 1 M USD de ingresos brutos) |
| Formato de pesos | safetensors (GPTQ int32-packed + densos F16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.8 con aproximadamente 27.350 millones de parametros. Sobre el modelo base Qwen3.8-27B (Apache-2.0) se aplico el post-entrenamiento Swift 1.5 de UkisAI, una ablacion de la direccion de rechazo (refusal-direction ablation) procedente de ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP que elimina el comportamiento de rechazo, y la fusion de un adaptador LoRA de harness-hub/Qwen3.8-27B-hermes-adapted orientado a uso como agente. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset de las etapas originales.

El proceso de cuantizacion de este repositorio concreto consistio en desquantizar el checkpoint GPTQ INT4 de Launch80 a BF16, fusionar el LoRA con `peft.merge_and_unload` y recuantizar todo, incluido `lm_head`, con gptqmodel 7.3.2 en INT4 simetrico con group size 128. La calibracion uso 192 muestras de wikitext-2 mas 64 transcripciones con formato de agente y tool-call. El bloque MTP (multi-token prediction) se elimino de esta build; en su lugar se adjunta en tiempo de servicio un drafter DFlash2 para decodificacion especulativa. La edicion de la ablacion de rechazo reside en los pesos del cuerpo y se preserva tras la fusion.

## Capacidades

- Generacion de texto y razonamiento en ingles.
- Generacion de codigo y aritmetica (verificadas funcionalmente por el autor en TensorFold XPU).
- Comportamiento "uncensored": la ablacion de la direccion de rechazo elimina las negativas aprendidas del modelo.
- Uso como agente Hermes: el adaptador fusionado esta orientado a flujos de agente y llamadas a herramientas.
- Soporte de tool calling / function calling segun el adaptador hermes-adapted (no re-validado tras la fusion).
- Decodificacion especulativa mediante drafter DFlash2 externo (aceptacion reportada ~0,2).
- Contexto largo de hasta 256.000 tokens con KV cache INT8.
- Multilingue: limitado a ingles segun los metadatos del modelo.

## Casos de uso

- Agentes autonomos con contexto largo: la ventana de 256.000 tokens permite mantener historiales extensos de conversacion, trazas de herramientas y documentos en memoria sin truncar, adecuado para tareas multi-paso.
- Generacion de codigo en pipelines de CI/CD: el modelo produce codigo y aritmetica verificados funcionalmente, y su soporte de tool calling permite integrarlo en flujos que invocan linters, compiladores o tests.
- Procesamiento de documentos extensos en ingles: resumen, extraccion y pregunta-respuesta sobre contratos o informes de cientos de miles de tokens gracias al contexto de 256k.
- Despliegue en hardware Intel: pensado para servirse en Arc Pro B70 con TensorFold XPU, util en entornos que ya disponen de infraestructura Intel y quieren evitar GPUs NVIDIA.
- Investigacion sobre alineacion y censura: la ablacion de rechazo permite estudiar el comportamiento del modelo sin las capas de negativa, en entornos controlados de evaluacion de seguridad.
- Experimentacion con decodificacion especulativa: sirve como banco de pruebas para medir la aceptacion de drafters DFlash2 en contextos largos sobre XPU.
- Prototipado de asistentes sin restricciones de contenido: para casos donde se requiere respuesta directa sin rechazos, con las salvaguardas externas que el integrador deba anadir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha restablecido la perplejidad ni ningun benchmark downstream tras la doble cuantizacion y la fusion del LoRA. Solo se reporta una validacion funcional: aceptacion del drafter DFlash2 de aproximadamente 0,2 y verificacion de aritmetica y generacion de codigo en TensorFold XPU 1.3.4.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 18,7 GB, por lo que la inferencia INT4 requiere aproximadamente 19-20 GB de memoria para los pesos.
- KV cache: en INT8 ocupa aproximadamente 32 KB por token; a 256.000 tokens supone unos 8 GB adicionales.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) como plataforma objetivo, una secuencia por tarjeta a 256k de contexto; dos tarjetas permiten dos carriles independientes.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (por ejemplo RTX 4090) para contextos moderados, aunque el soporte oficial del autor es para XPU Intel.
- Opciones de despliegue: TensorFold XPU (imagen `tensorfold-xpu-b70:hermes-2026.11.24`), con drafter DFlash2 adjunto; otras opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este checkpoint GPTQ especifico.
- Latencia y throughput: no disponibles; solo se conoce la aceptacion del drafter (~0,2) y una secuencia por tarjeta de 32 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Swift-1.5-Qwen3.8-27B-Uncensored-hermes-v3-GPTQ-Int4) | 27,36 B | 256k | GPTQ INT4 | Swift Open License v1.0 | Hugging Face, 0 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b (base) | ~27 B | no disponible | BF16 (original) | Swift Open License v1.0 | Hugging Face |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP | ~27 B | no disponible | no disponible | como upstream | Hugging Face |
| Qwen/Qwen3.8-27B (base original) | ~27 B | no disponible | BF16 | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Doble cuantizacion apilada: el checkpoint de Launch80 se desquantizo y recuantizo, sin perplejidad ni benchmarks que confirmen la calidad final.
- La fusion del LoRA y la recuantizacion no se han reevaluado; el comportamiento uncensored se espera pero no se ha verificado formalmente.
- Riesgo de alucinacion no cuantificado; al no haber benchmarks downstream, la fiabilidad en tareas complejas es desconocida.
- Soporte unicamente en ingles segun los metadatos; no se garantiza calidad en otros idiomas.
- Licencia restrictiva: Swift Open License v1.0 permite uso comercial solo por debajo de 1 M USD de ingresos brutos; por encima se requiere licencia enterprise. El material base Qwen y el adaptador hermes son Apache-2.0, pero el derivado Swift no.
- El modelo es "uncensored": puede generar contenido que otros modelos rechazarian; el integrador debe implementar sus propias salvaguardas.
- No es un lanzamiento oficial de UkisAI, Qwen, harness-hub ni Launch80.
- El bloque MTP se elimino; requiere un drafter DFlash2 externo para decodificacion especulativa, con aceptacion baja (~0,2).
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Despliegue documentado solo para TensorFold XPU; el soporte en otras plataformas no esta probado.

## Enlaces

- Hugging Face: https://huggingface.co/muni501/Swift-1.5-Qwen3.8-27B-Uncensored-hermes-v3-GPTQ-Int4
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Ablacion uncensored: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Checkpoint INT4 horneado: https://huggingface.co/Launch80/Swift-1.5-Qwen3.8-27B-Uncensored-Int4-baked
- Adaptador Hermes: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
