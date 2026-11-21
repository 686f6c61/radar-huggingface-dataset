# Jundot/DeepSeek-V4-Flash-0731-oQ3.5e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ3.5e-mtp es una cuantizacion mixta en formato MLX del modelo DeepSeek-V4-Flash-0731, publicado por el desarrollador independiente Jundot. El modelo base es la version oficial de DeepSeek-V4-Flash con capacidades agenticas mejoradas, e incluye el modulo de decodificacion especulativa DSpark MTP (multi-token prediction) adjunto. Esta version cuantizada reduce un checkpoint de aproximadamente 304.180 millones de parametros a un tamano de repositorio de 148,5 GB, con un promedio efectivo de 3,906 bits por peso en el checkpoint completo y 3,871 bits por peso en el backbone del modelo de lenguaje.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala frontier (mas de 300.000 millones de parametros) en hardware Apple Silicon mediante MLX, algo imposible con los pesos originales en BF16. La cuantizacion oQ3.5e asigna bits por sensibilidad medida de cada capa, combinando almacenamiento affine de 3 bits, MXFP4, MXFP8 y un pequeno porcentaje en 8 y 16 bits, lo que preserva las capas mas sensibles a la cuantizacion.

El modelo esta pensado para generacion de texto y tareas agenticas, e incluye el cabezal MTP que habilita decodificacion especulativa para acelerar la inferencia. La licencia es MIT, heredada del modelo base, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deepseek_v4) con modulo de decodificacion especulativa DSpark MTP |
| Parametros totales | 304.180.418.494 (304,180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ3.5e mixta: affine 3-bit (group 64), MXFP4 (group 32), MXFP8 (group 32), affine 8-bit (group 64), BF16, FP32, I32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4-Flash-0731, un transformer de la familia DeepSeek V4 con capacidades agenticas mejoradas respecto a versiones anteriores. La estructura es identica a DeepSeek-V4-Flash-DSpark e incorpora un modulo de decodificacion especulativa DSpark MTP (multi-token prediction) que permite predecir varios tokens por paso para acelerar la generacion. El checkpoint cuantizado incluye tanto el modelo de lenguaje como los pesos MTP.

La cuantizacion oQ3.5e, realizada con oMLX v0.8.0, asigna bits segun la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y un reajuste por minimos cuadrados ponderados de escala y sesgo. La distribucion de almacenamiento es: 60,715% de los pesos logicos en affine 3-bit (3,50 bits/peso efectivos), 36,711% en MXFP4 (4,25 bits/peso), 2,056% en MXFP8 (8,25 bits/peso), 0,450% en affine 8-bit (8,50 bits/peso) y cantidades residuales en BF16, FP32 e I32. El backbone del modelo de lenguaje ocupa 137,589 GB (128,140 GiB) y el cabezal MTP 10,926 GB (10,175 GiB). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base DeepSeek-V4-Flash-0731.
- Capacidades agenticas mejoradas, segun la model card del modelo base.
- Decodificacion especulativa mediante el modulo DSpark MTP, que acelera la inferencia prediciendo multiples tokens.
- Ejecucion en hardware Apple Silicon mediante la libreria MLX.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint de 148,5 GB permite ejecutar un modelo de 304.000 millones de parametros en equipos con memoria unificada suficiente (por ejemplo, Mac Studio con 192 GB o superior), algo inviable con los pesos BF16 originales.
- Prototipado de agentes en local: gracias a las capacidades agenticas del modelo base y al soporte MTP, se puede desarrollar y depurar flujos multi-paso sin depender de APIs externas.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia para estudiar el impacto de la cuantizacion mixta oQ3.5e en un modelo de gran escala, comparando su salida con el modelo base.
- Generacion de texto asistida en estaciones de trabajo Apple: integracion en herramientas de escritura, resumen o analisis de documentos mediante MLX.
- Evaluacion de decodificacion especulativa: el modulo DSpark MTP permite medir ganancias de throughput en entornos MLX frente a decodificacion autoregresiva estandar.
- Despliegue en entornos con licencia permisiva: al ser MIT, se puede integrar en productos comerciales sin restricciones de licencia del modelo, siempre que se cumplan las condiciones de la licencia del modelo base.
- Fine-tuning o adaptacion sobre la version cuantizada: no recomendado en general, pero util para experimentos de investigacion sobre modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 138,3 GiB (148,5 GB) para cargar el checkpoint completo en memoria.
- Hardware recomendado: Apple Silicon con memoria unificada de al menos 192 GB (Mac Studio M2 Ultra, M3 Ultra o superiores) para cargar el modelo completo con margen para el contexto.
- GPU NVIDIA: el formato MLX no es compatible de forma nativa con CUDA; para NVIDIA habria que usar otra cuantizacion del modelo base en formato GGUF o safetensors.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones multi-GPU convencionales sin un pipeline de offloading agresivo.
- Opciones de despliegue: MLX (libreria nativa), oMLX para la cuantizacion; llama.cpp, vLLM, Ollama y TGI no soportan directamente el formato MLX de este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada; el modulo MTP esta disenado para mejorar el throughput mediante decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-oQ3.5e-mtp (este) | 304,180B | no disponible | oQ3.5e mixta (3,906 bits/peso) | MIT | MLX safetensors |
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | no disponible | no disponible | BF16 original | MIT | safetensors |
| DeepSeek-V4-Flash-DSpark | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3,906 bits/peso efectivos introduce perdida de precision respecto al modelo base en BF16; las tareas sensibles a matices finos pueden degradarse.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a CUDA sin reconversion.
- Requiere una cantidad de memoria unificada muy elevada (alrededor de 138 GiB), lo que restringe su uso a equipos de gama alta.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma del modelo base en la informacion proporcionada.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-V4-Flash-0731 por si impone restricciones adicionales.
- El autor indica que la version actual (2026-11-19) re-cuantiza con oQe refinado en oMLX 0.8.0; copias anteriores deben descargarse de nuevo para obtener la mejora de error de cuantizacion.
- El modulo MTP anade complejidad al pipeline de inferencia; su correcto funcionamiento depende del soporte de MLX y oMLX para decodificacion especulativa.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ3.5e-mtp
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio oMLX: https://github.com/jundot/omlx
- PR oQe: https://github.com/jundot/omlx/pull/4930
- PR refinamiento de redondeo oQe: https://github.com/jundot/omlx/pull/5292
