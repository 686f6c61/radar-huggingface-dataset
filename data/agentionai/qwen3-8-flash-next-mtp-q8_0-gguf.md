# agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-Q8_0-GGUF es una cuantizacion en formato GGUF de la cabeza de prediccion multi-token (MTP, multi-token prediction) del modelo Qwen/Qwen3.8-Flash-Next, desarrollado por el equipo Qwen. No se trata de un modelo autonomo de generacion de texto, sino de un componente auxiliar de decodificacion especulativa: actua como modelo borrador (draft) que propone varios tokens por paso y el modelo objetivo los verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida.

El artefacto lo publica Agention (agentionai) y pesa 3,85 GiB en cuantizacion Q8_0, con 3.878.549.248 parametros segun los safetensors del modelo base. La particularidad tecnica es que Qwen entrena esta cabeza de forma conjunta con el modelo principal, lo que produce una tasa de aceptacion superior a la de usar un modelo borrador independiente de menor tamano. La model card reporta tasas de aceptacion de 0,623 y 0,587 sobre dos cuantizaciones distintas del objetivo.

Su relevancia es practica: permite activar decodificacion especulativa MTP en llama.cpp upstream (a partir de la build b11386) sin necesidad de forks ni de un segundo modelo separado. El coste es un incremento de aproximadamente 3,9 GiB de memoria sobre el modelo objetivo, lo que lo hace viable en equipos con GPU de consumo alta o en configuraciones con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza de prediccion multi-token (MTP); el modelo base emplea atencion dispersa (sparse attention) en la capa MTP segun los metadatos |
| Parametros totales | 3.878.549.248 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para la cabeza; el ejemplo de la model card usa `-c 32768` en llama-server |
| Tipos de cuantizacion | Q8_0 (esta publicacion); existe una variante ROCmFP4-FAST de 4 bits publicada por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (identificador `qwen-community-1.0`, declarado como `other` en Hugging Face) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 8,3 GB |
| Tamano de los pesos | 3,85 GiB (Q8_0) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Libreria | gguf |
| Compatibilidad | llama.cpp upstream b11386 o superior |
| Descargas | 1.997 |
| Likes | 11 |

## Arquitectura y entrenamiento

La cabeza MTP es un modulo adicional entrenado conjuntamente con Qwen3.8-Flash-Next: en lugar de predecir un unico token siguiente, propone varios tokens candidatos que el modelo objetivo valida en una sola pasada. Este entrenamiento conjunto es la razon por la que la model card afirma que supera a un modelo borrador independiente del mismo tamano en tasa de aceptacion. Los tensores se nombran segun la convencion upstream (`blk.48.nextn.hc_head_*`) y la capa MTP se marca como capa de atencion dispersa en los metadatos, tal como espera llama.cpp.

La version actual del fichero (actualizada el 2026-10-05) mantiene los pesos pero corrige los nombres de tensor y los metadatos; las descargas anteriores fallan en llama.cpp upstream con el error `tensor 'blk.48.nextn.hc_head_norm.weight' not found`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Decodificacion especulativa MTP: actua como borrador de varios tokens por paso para acelerar la generacion del modelo objetivo.
- Integracion nativa con llama.cpp upstream: soporte en `llama-server` mediante `-md` y `--spec-type draft-mtp`, o mediante `--mtp` al usar `-hf`.
- Compatibilidad con cuantizaciones variadas del objetivo: la model card cita funcionamiento sobre UD-IQ4_XS y ROCmFP4-FAST.
- Generacion de texto conversacional: heredada del modelo base, marcado con la etiqueta `conversational`.
- No implementa por si misma tool calling, function calling, vision, audio ni modo de razonamiento extendido; esas capacidades, si existen, residen en Qwen3.8-Flash-Next.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Aceleracion de inferencia local en llama.cpp: desplegar el modelo objetivo junto con esta cabeza y activar `--spec-type draft-mtp --spec-draft-n-max 3` para reducir la latencia por token en entornos de escritorio o estaciones de trabajo con GPU unica.
- Servicio de chat interactivo de baja latencia: con contexto de 32.768 tokens configurado en `llama-server`, la decodificacion especulativa mejora la fluidez percibida en conversaciones multi-turno.
- Despliegue en hardware con memoria unificada: la model card mide sobre una Radeon 8060S, un escenario de iGPU con memoria compartida donde el ahorro de latencia es especialmente valioso.
- Evaluacion comparativa de estrategias de decodificacion: sirve para medir tasas de aceptacion y ganancia de throughput frente a la ejecucion sin borrador sobre el mismo objetivo.
- Sustitucion de borradores externos: reemplaza el patron clasico de usar un modelo pequeno independiente como draft, eliminando la necesidad de mantener y ajustar dos modelos no relacionados.
- Pruebas de regresion en pipelines de CI: verificar que una build concreta de llama.cpp carga correctamente los tensores MTP y produce salidas equivalentes a la decodificacion estandar.

## Benchmarks y rendimiento

Mediciones publicadas en la model card sobre Radeon 8060S, 250 tokens a temperatura 0, tras calentamiento:

| Objetivo | Sin borrador | Con esta cabeza | Tasa de aceptacion |
|---|---|---|---|
| UD-IQ4_XS | 24,2 t/s | 29,3 t/s | 0,623 |
| ROCmFP4-FAST | 28,1 t/s | 30,3 t/s | 0,587 |

La variante de 4 bits del mismo autor (ROCmFP4-FAST) resulto mas rapida en ambos objetivos y ocupa 1,6 GiB menos. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza del artefacto: no es un modelo evaluable de forma independiente.

## Requisitos de hardware

- VRAM adicional: aproximadamente 3,9 GiB sobre el modelo objetivo, segun la model card.
- VRAM total: la suma del objetivo cuantizado mas la cabeza; con un objetivo de 4 bits y contexto de 32.768 tokens, el conjunto requiere planificacion cuidadosa de cache KV.
- GPU recomendadas: no disponibles de forma explicita; las mediciones se realizaron en una Radeon 8060S (GPU integrada con memoria unificada).
- GPU de consumo: viable en tarjetas con 16 GB o mas si el objetivo es una cuantizacion de 4 bits; en 8 GB es inviable con contexto largo.
- Despliegue: llama.cpp upstream b11386 o superior, mediante `llama-server` con `-md` y `--n-gpu-layers-draft 99`. No se mencionan vLLM, TGI ni Ollama.
- Throughput medido: 29,3 t/s y 30,3 t/s sobre los dos objetivos citados, frente a 24,2 y 28,1 t/s sin borrador.
- Latencia: no disponible de forma desagregada (solo throughput agregado).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF | Cabeza MTP, Q8_0 | 3,88 B | GGUF | Qwen Community 1.0 | 3,85 GiB; aceptacion 0,623 / 0,587 |
| agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF | Cabeza MTP, 4 bits | no disponible | GGUF | Qwen Community 1.0 | 1,6 GiB menos y mas rapida en las pruebas del autor |
| Modelo borrador independiente de ~3-4 B | Draft clasico | ~3-4 B | GGUF | segun modelo | Requiere ajuste y no comparte entrenamiento con el objetivo; tasa de aceptacion tipicamente inferior segun la model card |

No se dispone de comparativas con cabezas MTP de otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera texto por si mismo ni debe cargarse como modelo principal.
- Requiere un objetivo compatible: solo funciona con GGUF de Qwen3.8-Flash-Next que llama.cpp upstream pueda cargar.
- Dependencia de version: necesita llama.cpp b11386 o superior; builds anteriores fallan al no encontrar los tensores MTP.
- Ficheros obsoletos: las descargas previas al 2026-10-05 fallan con `tensor 'blk.48.nextn.hc_head_norm.weight' not found`; es necesario volver a descargar.
- Coste de memoria: anade unos 3,9 GiB, lo que puede impedir el despliegue en GPUs con poca VRAM o con contextos muy largos.
- Licencia: Qwen Community License 1.0, con condiciones especificas para uso comercial que deben revisarse antes de produccion.
- Idiomas y sesgos: no disponibles en la informacion proporcionada; la calidad final depende enteramente del modelo objetivo.
- Riesgo de alucinacion: inherente al modelo base; la cabeza no lo mitiga ni lo agrava, solo acelera la decodificacion.
- Ganancia variable: la mejora de throughput depende de la tasa de aceptacion, que a su vez varia con la cuantizacion del objetivo y el dominio del texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante de 4 bits: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF
- Soporte MTP en llama.cpp (PR #29761): https://github.com/ggml-org/llama.cpp/pull/29761
- Soporte de Qwen3.8-Flash-Next en llama.cpp (PR #27742): https://github.com/ggml-org/llama.cpp/pull/27742
- Grafo MTP en llama.cpp (PR #27739): https://github.com/ggml-org/llama.cpp/pull/27739
- Agention: https://agention.ai
