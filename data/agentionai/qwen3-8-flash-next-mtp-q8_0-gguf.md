# agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-Q8_0-GGUF es un cabezal de predicción multi-token (MTP, multi-token prediction) extraído del modelo Qwen/Qwen3.8-Flash-Next y cuantizado a Q8_0 en formato GGUF por Agention. No es un modelo autónomo: es una cabeza borrador (draft head) diseñada para decodificación especulativa sobre cualquier GGUF del modelo base Qwen3.8-Flash-Next. El artefacto ocupa 3,85 GiB y contiene 3.878.549.248 parámetros.

Su relevancia práctica es que Qwen entrena esta cabeza de forma conjunta con el modelo principal, lo que produce una tasa de aceptación de tokens superior a la de usar un modelo pequeño independiente como borrador. Al integrarse en llama.cpp upstream, permite acelerar la inferencia del modelo objetivo sin necesidad de forks ni de infraestructura adicional más allá de cargar un segundo fichero de pesos.

El modelo base Qwen3.8-Flash-Next pertenece a la familia Qwen y se distribuye bajo la licencia Qwen Community License 1.0. La información disponible no detalla la arquitectura interna del modelo objetivo, su longitud de contexto nativa ni la composición de su dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal MTP (multi-token prediction) para decodificacion especulativa; capa `blk.48.nextn` con atencion dispersa segun metadatos |
| Parametros totales | 3.878.549.248 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo; el ejemplo de la model card usa `-c 32768`) |
| Tipos de cuantizacion | Q8_0 (esta publicacion); existe una variante ROCmFP4-FAST de 4 bits del mismo cabezal |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`, fichero `LICENSE` incluido) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 8,3 GB |
| Tamano del fichero | 3,85 GiB |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Relacion con el base | quantized / draft head |

## Arquitectura y entrenamiento

El fichero contiene exclusivamente la cabeza de predicción multi-token del modelo Qwen3.8-Flash-Next, no el modelo completo. En la decodificación especulativa con MTP, esta cabeza propone varios tokens candidatos por paso, que el modelo objetivo verifica en paralelo; los tokens aceptados se conservan y el resto se descarta, acelerando la generación sin alterar la distribución de salida del modelo objetivo. Qwen entrena la cabeza de forma conjunta con el modelo principal, lo que explica su mayor tasa de aceptación frente a un borrador independiente.

La versión actualizada el 2026-10-05 utiliza los nombres de tensor de llama.cpp upstream para la cabeza MTP (`blk.48.nextn.hc_head_*`) y marca la capa MTP como capa de atención dispersa en los metadatos, tal como espera upstream. Los pesos no cambiaron respecto a la versión anterior; las descargas antiguas fallan con el error `tensor 'blk.48.nextn.hc_head_norm.weight' not found`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa MTP sobre cualquier GGUF de Qwen3.8-Flash-Next que cargue llama.cpp upstream (por ejemplo, los cuantizados Q8_0 o UD de Unsloth).
- Generación de tokens candidatos con verificación por el modelo objetivo, preservando la calidad de salida del modelo base.
- Integración nativa en llama.cpp upstream a partir de la build b11386 (soporte Qwen4Exp MTP en el PR ggml-org/llama.cpp#29761), sin necesidad de fork.
- Soporte en `llama-server` mediante los parámetros `-md`, `--n-gpu-layers-draft`, `--spec-type draft-mtp` y `--spec-draft-n-max`; con `-hf` basta añadir `--mtp` para que se cargue un fichero hermano `mtp-` del mismo repositorio.
- No aporta capacidades generativas propias: hereda las del modelo objetivo (texto, razonamiento, código, etc.), que no se detallan en la información disponible.

## Casos de uso

- Servicio de inferencia local acelerado: cargar este cabezal junto al GGUF objetivo en `llama-server` para aumentar el throughput de generación en hardware de consumo, con incrementos medidos de 24,2 a 29,3 t/s sobre UD-IQ4_XS y de 28,1 a 30,3 t/s sobre ROCmFP4-FAST en una Radeon 8060S.
- Despliegue en equipos con GPU integrada potente (AMD Ryzen AI Max / Strix Halo): el cabezal añade 3,9 GiB sobre el objetivo y mejora la velocidad sin requerir una GPU dedicada adicional.
- Evaluación de decodificación especulativa: permite comparar tasas de aceptación (0,623 y 0,587 en las mediciones publicadas) frente a esquemas con borrador independiente en el mismo hardware.
- Prototipado de asistentes conversacionales en local: al reducir la latencia por token, mejora la experiencia en chat multi-turno con el modelo objetivo, sujeto al contexto que configure el usuario (32 768 tokens en el ejemplo de la model card).
- Pipelines de generación por lotes sensibles al throughput: en tareas de resumen, extracción o clasificación de documentos con el modelo base, el aumento de tokens por segundo reduce el coste temporal por petición.
- Comparativa de cuantizaciones del cabezal: usar la variante Q8_0 frente a la ROCmFP4-FAST (1,6 GiB más pequeña y más rápida en las dos configuraciones medidas) para decidir el equilibrio entre VRAM y velocidad.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en una Radeon 8060S, 250 tokens a temperatura 0, con calentamiento previo:

| Objetivo | Sin borrador | Con este cabezal | Tasa de aceptacion |
|---|---|---|---|
| UD-IQ4_XS | 24,2 t/s | 29,3 t/s | 0,623 |
| ROCmFP4-FAST | 28,1 t/s | 30,3 t/s | 0,587 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM adicional: aproximadamente 3,9 GiB sobre el modelo objetivo (fichero de 3,85 GiB en Q8_0).
- GPU recomendadas: no se especifican modelos concretos; las mediciones se realizaron en una Radeon 8060S (AMD Ryzen AI Max, Strix Halo), hardware integrado.
- GPU de consumo: el cabezal cabe en GPUs de consumo con al menos 4 GB libres de VRAM, además de lo que requiera el modelo objetivo.
- Despliegue: llama.cpp upstream build b11386 o superior mediante `llama-server`; no requiere fork. Parámetros de ejemplo: `-m Qwen3.8-Flash-Next.gguf -md Qwen3.8-Flash-Next-MTP-Q8_0.gguf -ngl 99 --n-gpu-layers-draft 99 --spec-type draft-mtp --spec-draft-n-max 3 -c 32768`.
- Alternativa de 4 bits: la variante ROCmFP4-FAST de este cabezal ocupa 1,6 GiB menos y midió más rápida en ambos objetivos.
- Latencia y throughput: ver tabla de benchmarks; no hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF | Cabezal MTP Q8_0 | 3,88 B | no disponible | 29,3 t/s (UD-IQ4_XS) / 30,3 t/s (ROCmFP4-FAST) en Radeon 8060S | Qwen Community 1.0 |
| agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF | Cabezal MTP 4 bits | no disponible | no disponible | Mas rapido que la variante Q8_0 en ambos objetivos; 1,6 GiB mas pequeno | Qwen Community 1.0 |
| Borrador independiente de modelo pequeno | Modelo draft separado | no disponible | no disponible | Tasa de aceptacion inferior segun el autor, sin cifras publicadas | depende del modelo |

No se dispone de datos sobre otros cabezales MTP comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autónoma: requiere siempre un GGUF del modelo objetivo Qwen3.8-Flash-Next cargado en llama.cpp upstream.
- Solo funciona con llama.cpp upstream b11386 o superior; versiones anteriores fallan con el error `tensor 'blk.48.nextn.hc_head_norm.weight' not found`. Las descargas previas al 2026-10-05 deben renovarse.
- El modelo objetivo debe ser un GGUF que cargue llama.cpp upstream (por ejemplo, los cuantizados de Unsloth); otros formatos o runtimes no están soportados según la model card.
- El rendimiento medido procede de un único dispositivo (Radeon 8060S) y de una muestra de 250 tokens a temperatura 0; no hay datos de latencia ni throughput en otras GPU.
- La tasa de aceptación depende del objetivo y de la cuantización: 0,623 con UD-IQ4_XS frente a 0,587 con ROCmFP4-FAST.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos antes de un uso comercial; la model card no detalla restricciones adicionales.
- No hay información publicada sobre sesgos, riesgo de alucinación o limitaciones idiomáticas del cabezal; estas dependen del modelo objetivo.
- Los idiomas soportados no están disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante de 4 bits del cabezal: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF
- Soporte Qwen4Exp MTP en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29761
- Soporte de Qwen3.8-Flash-Next en llama.cpp (Daniel Han): https://github.com/ggml-org/llama.cpp/pull/27742
- Grafo MTP en llama.cpp (JJJYmmm): https://github.com/ggml-org/llama.cpp/pull/27739
- Sitio del cuantizador: https://agention.ai
