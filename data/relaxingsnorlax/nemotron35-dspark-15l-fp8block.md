# RelaxingSnorlax/nemotron35-dspark-15l-fp8block

## Resumen

`RelaxingSnorlax/nemotron35-dspark-15l-fp8block` es un checkpoint de decodificación especulativa de tipo DSpark (drafter) publicado por el usuario RelaxingSnorlax bajo licencia openmdw-1.1. No es un modelo entrenado: se construye a partir del drafter de 5 capas `RelaxingSnorlax/nemotron35-dspark-5l-fp8block` (revisión `59134b2cb2016c57ee89ca58f6a1bb091ed10901`) replicando sus capas de forma cíclica, de modo que la capa de salida `i` copia byte a byte la capa fuente `i % 5`. El resultado declara 15 capas en la configuración, pero solo contiene 5 capas únicas de pesos.

El propósito declarado por el autor es servir como control estructural para experimentos de recuento de capas: almacenamiento, carga, memoria y latencia. No se ha reentrenado ni evaluado, y el autor advierte explícitamente de que las métricas de calidad y de longitud aceptada del modelo fuente no son aplicables a esta variante. Los pesos están en formato FP8_BLOCK (compressed-tensors), suman 3.328.319.489 parámetros y ocupan 3,4 GB en el repositorio.

Su relevancia es acotada y metodológica: permite medir el coste de un drafter con profundidad declarada mayor sin pagar el precio de un entrenamiento, y validar pipelines de servicio en vLLM con el método `dspark` antes de desplegar un drafter real. El modelo objetivo con el que se documenta el uso es `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, servido con 4 GPUs en tensor parallel y `num_speculative_tokens` igual a 8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa DSpark; 15 capas declaradas construidas por repeticion ciclica (capa `i` = capa fuente `i % 5`) de un drafter de 5 capas; no reentrenado |
| Parametros totales | 3.328.319.489 (safetensors) |
| Parametros activos | no disponible (no se declara estructura MoE en la informacion del checkpoint) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_BLOCK (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (libreria `speculators`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El checkpoint es un derivado estructural, no un modelo entrenado. La construcción consiste en copiar los tensores de cada capa generada `i` desde la capa `i % 5` del drafter fuente, manteniendo intactos los tensores que no son de capa, y en declarar 15 capas en la configuración repitiendo el patrón de tipos de capa del modelo original. El repositorio incluye `derived_from.json` con la regla de construcción, `drafter_checkpoint_sha256.txt` con el hash del `model.safetensors` y un directorio `provenance/` con los registros originales de entrenamiento y cuantización del modelo de 5 capas, etiquetados como artefactos de origen.

DSpark es la familia de drafters de decodificación especulativa que NVIDIA integra en vLLM mediante `--speculative_config.method dspark`. Según la documentación de otros checkpoints DSpark de la familia, la técnica está diseñada para aumentar la longitud aceptada preservando los beneficios de latencia del block drafting en sistemas Blackwell compactos. Como contexto de familia, NVIDIA indica que Nemotron-3.5-Lightning-30B-A3B se preentrenó con más de 20 billones de tokens; este checkpoint no aporta datos de entrenamiento propios ni divulga composición de dataset, RLHF o DPO, porque no se ha entrenado.

## Capacidades

- Generación de tokens especulativos (drafting) para un modelo objetivo, con 8 tokens especulativos por paso en la configuración de ejemplo.
- Integración con vLLM mediante `--speculative_config.method dspark`, `draft_tensor_parallel_size 1` y `draft_sample_method greedy`.
- Carga de pesos cuantizados en FP8_BLOCK a través de compressed-tensors y de código personalizado (`trust-remote-code`).
- Uso como control estructural en experimentos de profundidad de drafter (5 frente a 15 capas declaradas).
- Generación de texto autónoma: no validada; el checkpoint no ha sido evaluado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo objetivo es de visión-lenguaje, pero no se declara nada equivalente para el drafter.

## Casos de uso

- Ablaciones de recuento de capas: comparar el comportamiento de un drafter de 5 capas frente a uno de 15 capas declaradas sin asumir coste de entrenamiento, midiendo carga, memoria y latencia en igualdad de condiciones.
- Medición de almacenamiento y carga en frío: cuantificar el tiempo de lectura del `model.safetensors` de 3,4 GB y verificar la integridad con el SHA-256 incluido en el repositorio antes de desplegar el drafter real.
- Perfilado de VRAM en vLLM: estimar la memoria residente del drafter con `draft_tensor_parallel_size 1` y separar el coste de los pesos (unos 3,3 GB en FP8) del de las activaciones y la caché del modelo objetivo.
- Validación de pipelines de servicio: usar este checkpoint como carga ligera para comprobar que las flags `speculative_config`, `trust-remote-code` y `mamba-backend flashinfer` funcionan en el entorno antes de apuntar al drafter de producción.
- Pruebas de integración de kernels FP8: verificar que los operadores de compressed-tensors cargan tensores FP8_BLOCK replicados sin errores de forma o de escala en GPUs Blackwell.
- Control negativo de longitud aceptada: demostrar empíricamente que duplicar capas sin reentrenar no incrementa la tasa de aceptación, como referencia frente a un drafter real.
- Docencia y reproducibilidad: ejemplo mínimo y reproducible de derivación de checkpoints con regla determinista, útil para enseñar trazabilidad de artefactos y procedencia de pesos.
- Integración continua de empaquetado: prueba de regresión para herramientas que leen configuraciones con 15 capas y pesos con 5 capas únicas, detectando supuestos incorrectos en el código de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre esta variante y que las mediciones de aceptación del modelo fuente no son trasladables.

## Requisitos de hardware

- Pesos en FP8: aproximadamente 3,3 GB (3.328.319.489 parámetros a 1 byte por parámetro); el repositorio completo ocupa 3,4 GB.
- VRAM total estimada: no disponible; hay que sumar activaciones, buffers del runtime y la caché del modelo objetivo, que no se documentan para esta variante.
- GPU recomendadas: no disponibles para el drafter. El comando de ejemplo reserva 4 GPUs (`CUDA_VISIBLE_DEVICES=0,1,2,3`) con `tensor-parallel-size 4` para el modelo objetivo de 120B, mientras que el drafter usa `draft_tensor_parallel_size 1`, es decir, una sola GPU.
- GPU de consumo: los pesos caben en tarjetas con 8 GB o más de VRAM; el comportamiento real no está validado.
- Opciones de despliegue: vLLM con `--speculative_config.method dspark` es la única opción documentada; requiere `--trust-remote-code` y backend `mamba-backend flashinfer`. Soporte en llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles. Al haber capas duplicadas, es esperable un coste de cómputo mayor sin mejora de aceptación, pero no se ha medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RelaxingSnorlax/nemotron35-dspark-15l-fp8block` (este) | 3.328.319.489 | no disponible | FP8_BLOCK | openmdw-1.1 | HuggingFace, 0 descargas, 0 likes |
| `RelaxingSnorlax/nemotron35-dspark-5l-fp8block` (fuente) | no disponible en la informacion | no disponible | FP8_BLOCK | openmdw-1.1 | HuggingFace |
| `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark` | no disponible (repositorio de 1,35 GB) | no disponible | NVFP4 | openmdw-1.1 | HuggingFace y ModelScope, mantenido por NVIDIA |
| `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` (objetivo) | 120B totales, 12B activos (segun denominacion) | no disponible | BF16 | no disponible | HuggingFace, modelo objetivo de NVIDIA |

La diferencia relevante no es de rendimiento sino de naturaleza: el checkpoint de NVIDIA es un drafter DSpark real para Nemotron-3.5-Lightning-30B-A3B, mientras que este es un control estructural derivado de un drafter de 5 capas y sin evaluación publicada. El modelo objetivo de 120B no es comparable en tamaño ni en función, ya que actúa como verificador en el esquema de decodificación especulativa.

## Limitaciones y advertencias

- No es un modelo entrenado: las 15 capas declaradas no representan un drafter de 15 capas entrenado y la calidad del modelo fuente no se transfiere.
- Sin evaluación: no hay métricas de longitud aceptada, latencia ni corrección para esta variante, y el autor lo advierte de forma explícita.
- Riesgo de degradación en producción: usar capas duplicadas como drafter puede reducir la tasa de aceptación y aumentar la latencia frente al drafter de 5 capas.
- Alucinación: el drafter no produce la respuesta final, pero propone tokens que el modelo objetivo verifica; una propuesta de baja calidad puede afectar a la fluidez si la verificación no es estricta.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, por lo que no se pueden garantizar escenarios multilingües ni conversaciones largas.
- Licencia openmdw-1.1: hay que revisar los términos concretos antes de un uso comercial; no se documentan restricciones adicionales en la información disponible.
- Seguridad: requiere `custom_code` y `--trust-remote-code`, lo que implica ejecutar código del repositorio; conviene auditar los ficheros antes de desplegar.
- Madurez: 0 descargas y 0 likes, publicación de octubre de 2026, sin validación de compatibilidad ni de rendimiento por parte de terceros.
- Trazabilidad: la procedencia depende de `derived_from.json`, del SHA-256 y del directorio `provenance/`; si se modifican los pesos, esas garantías dejan de ser válidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-15l-fp8block
- Drafter fuente de 5 capas: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-5l-fp8block
- Revision fuente: `59134b2cb2016c57ee89ca58f6a1bb091ed10901`
- Modelo objetivo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Drafter DSpark oficial de NVIDIA para Lightning-30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark/tree/main
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Espejo en ModelScope: https://www.modelscope.cn/models/nv-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Variante MLX de referencia: https://huggingface.co/Sawfwair/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark-MLX/blob/main/README.md
- Ficha de despliegue en AxForge: https://axforge.ai/models/nvidia-nemotron-3-5-lightning-dspark/
- Paper citado por el checkpoint DSpark de NVIDIA: https://arxiv.org/abs/2607.05147
