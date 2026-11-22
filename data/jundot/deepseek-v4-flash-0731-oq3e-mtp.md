# Jundot/DeepSeek-V4-Flash-0731-oQ3e-mtp

## Resumen

DeepSeek-V4-Flash-0731-oQ3e-mtp es un checkpoint cuantizado en formato MLX del modelo oficial DeepSeek-V4-Flash-0731, publicado por el usuario Jundot. El modelo base es un transformer de DeepSeek con capacidades agenticas mejoradas y una arquitectura que incorpora un modulo de decodificacion especulativa MTP (multi-token prediction) denominado DSpark, con la misma estructura que DeepSeek-V4-Flash-DSpark. El checkpoint resultante conserva tanto el backbone del modelo de lenguaje como los pesos del cabezal MTP.

La relevancia de esta publicacion radica en la cuantizacion mixta de precision aplicada: oQ3e asigna bits por sensibilidad medida de cada capa, con un promedio efectivo de 3,628 bits por peso para el backbone y 3,678 bits por peso para el checkpoint completo. Esto permite almacenar un modelo de 304.180 millones de parametros en aproximadamente 130,25 GiB, un tamano manejable en entornos Apple Silicon de gama alta mediante MLX, frente a los cientos de gigabytes que requeriria la version BF16.

El checkpoint fue re-cuantizado el 19 de noviembre de 2026 con la version 0.8.0 de oMLX, que introduce un redondeo oQe refinado y reduce el error de cuantizacion manteniendo el mismo tamano y velocidad. La licencia es MIT, heredada del modelo fuente, lo que facilita su uso comercial y su redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DeepSeek-V4 con modulo de decodificacion especulativa MTP (DSpark) |
| Parametros totales | 304.180.418.494 (304,18B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ3e: affine 3-bit grupo 64, MXFP4 grupo 32, affine 8-bit grupo 64, MXFP8 grupo 32, I32, BF16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, libreria mlx) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer de la familia DeepSeek-V4 con capacidades agenticas reforzadas. La estructura incorpora un modulo de decodificacion especulativa MTP (multi-token prediction) llamado DSpark, que predice varios tokens por paso para acelerar la generacion. Este checkpoint conserva tanto el backbone del modelo de lenguaje (284,335B de pesos logicos) como el cabezal MTP (19,846B), de modo que la decodificacion especulativa sigue operativa tras la cuantizacion.

La cuantizacion oQ3e, implementada en oMLX 0.8.0, asigna bits segun la sensibilidad medida de cada capa y redondea cada grupo con una matriz de importancia construida a partir de 1024 muestras de 512 tokens, seguida de un reajuste de escala y sesgo por minimos cuadrados ponderados. La distribucion resultante concentra el 91,073% de los pesos logicos en affine 3-bit (grupo 64), el 6,354% en MXFP4 (grupo 32) y el 2,056% en MXFP8 (grupo 32), reservando precision alta (8-bit, BF16, FP32) para un 0,5% de los pesos. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni el proceso de alineacion (RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva para tareas de lenguaje general.
- Razonamiento y capacidades agenticas mejoradas, segun la descripcion del modelo base oficial.
- Decodificacion especulativa mediante el cabezal MTP DSpark, que acelera la inferencia prediciendo multiples tokens por paso.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: descrito como capacidad agentica mejorada en el modelo base, sin detalle adicional disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta empaquetado en formato MLX y ocupa 130,25 GiB, lo que permite ejecutarlo en equipos Mac con memoria unificada suficiente (por ejemplo, configuraciones de 192 GB o superiores) sin necesidad de GPU dedicada.
- Aceleracion de generacion con decodificacion especulativa: al conservar el cabezal MTP DSpark, el modelo puede generar varios tokens por paso de decodificacion, reduciendo la latencia en tareas de completado de texto y chat interactivo.
- Servicios de generacion de texto de gran escala con presupuesto de memoria ajustado: la cuantizacion a 3,678 bits efectivos por peso reduce el footprint de almacenamiento frente a BF16, lo que facilita desplegar un modelo de 304B en infraestructura con memoria limitada.
- Investigacion sobre cuantizacion mixta: el checkpoint sirve como referencia practica para estudiar el impacto de oQ3e y la asignacion de bits por sensibilidad de capa en modelos de gran tamano.
- Fine-tuning o evaluacion comparativa de modelos DeepSeek: al mantener la estructura del modelo base y la licencia MIT, puede utilizarse como punto de partida para experimentos de adaptacion o para comparar el rendimiento del modelo cuantizado frente al original.
- Despliegue en pipelines de generacion de texto con MLX: integrable en flujos de trabajo que ya usan la libreria mlx para inferencia en dispositivos Apple, con pesos en safetensors listos para cargar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: aproximadamente 130,25 GiB para los pesos del checkpoint completo (139,86 GB en disco); se requiere memoria adicional para el estado de inferencia y la cache KV.
- GPU recomendadas: no disponible; el formato MLX esta orientado a Apple Silicon (memoria unificada), no a GPUs NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no disponible para GPUs dedicadas; en Apple Silicon se necesitan equipos con memoria unificada de al menos 192 GB para alojar el modelo con margen.
- Opciones de despliegue: libreria mlx y oMLX (herramienta de cuantizacion del autor); vLLM, llama.cpp, Ollama y TGI no estan confirmados para este checkpoint en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/DeepSeek-V4-Flash-0731-oQ3e-mtp | 304,18B | no disponible | MLX safetensors, 3,678 bits/peso efectivos | MIT | Hugging Face, 580 descargas |
| deepseek-ai/DeepSeek-V4-Flash-0731 (modelo base) | no disponible | no disponible | no disponible | MIT (heredada) | Hugging Face |
| DeepSeek-V4-Flash-DSpark | no disponible | no disponible | no disponible | no disponible | Referenciado como estructura equivalente |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3,678 bits por peso efectivos introduce error respecto al modelo base en BF16; aunque oQ3e reduce el error con redondeo refinado, puede degradar tareas sensibles a precision numerica.
- El checkpoint esta en formato MLX y esta pensado para inferencia en Apple Silicon; no es directamente compatible con ecosistemas CUDA como vLLM o TGI sin conversion.
- El modelo base incorpora un modulo de decodificacion especulativa MTP; su correcto funcionamiento depende de que el runtime MLX soporte la decodificacion especulativa con el cabezal DSpark.
- No hay informacion publicada sobre sesgos, tasas de alucinacion, cobertura idiomatica ni limitaciones de contexto del modelo base en la informacion disponible.
- La licencia MIT permite uso comercial y redistribucion, pero conviene verificar las condiciones del modelo fuente DeepSeek-V4-Flash-0731 antes de desplegarlo en produccion.
- El autor indica que versiones anteriores del checkpoint deben re-descargarse para beneficiarse del redondeo oQe refinado de oMLX 0.8.0; usar copias antiguas puede implicar mayor error de cuantizacion.
- El modelo tiene 580 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria limitada.

## Enlaces

- [Hugging Face: Jundot/DeepSeek-V4-Flash-0731-oQ3e-mtp](https://huggingface.co/Jundot/DeepSeek-V4-Flash-0731-oQ3e-mtp)
- [Modelo base: deepseek-ai/DeepSeek-V4-Flash-0731](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731)
- [Repositorio oQ / oMLX](https://github.com/jundot/omlx)
- [PR oMLX #4930 (oQe mejorado)](https://github.com/jundot/omlx/pull/4930)
- [PR oMLX #5292 (refinamiento del redondeo oQe)](https://github.com/jundot/omlx/pull/5292)
