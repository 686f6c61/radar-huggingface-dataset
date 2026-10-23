# RelaxingSnorlax/nemotron35-dspark-30l-fp8block

## Resumen

`RelaxingSnorlax/nemotron35-dspark-30l-fp8block` es un checkpoint drafter de decodificación especulativa del método DSpark, publicado por el usuario RelaxingSnorlax y derivado del drafter de 5 capas `RelaxingSnorlax/nemotron35-dspark-5l-fp8block`. El artefacto declara 30 capas y 6.505.631.489 parámetros en formato FP8_BLOCK, y está pensado para acompañar como drafter al modelo objetivo `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` en despliegues vLLM con `--speculative_config.method dspark`.

La particularidad crítica es que no se trata de un modelo entrenado: las 30 capas se han construido copiando byte a byte la capa fuente `i % 5`, de modo que solo existen 5 capas únicas repetidas seis veces. El autor lo describe explícitamente como un control estructural para experimentos de número de capas, almacenamiento, carga, memoria o latencia, y advierte de que las métricas de calidad y aceptación del modelo fuente no son aplicables a esta variante.

Su relevancia es, por tanto, metodológica y de ingeniería: permite medir el coste de un drafter con 30 capas declaradas sin incurrir en un entrenamiento, validar pipelines de decodificación especulativa, probar la integración de `compressed-tensors` en FP8_BLOCK y comprobar la reproducibilidad de la derivación. No debe emplearse como drafter de producción ni evaluarse como si fuera un modelo de 30 capas real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Drafter DSpark de decodificación especulativa (block drafting); 30 capas declaradas que replican 5 capas únicas (mapeo `i % 5`); detalles internos del transformer no disponibles |
| Parámetros totales | 6.505.631.489 |
| Parámetros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8_BLOCK (compressed-tensors); no se documentan otras variantes |
| Idiomas soportados | No disponibles |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors, con `custom_code` y librería `speculators` |
| Modelo fuente | `RelaxingSnorlax/nemotron35-dspark-5l-fp8block` (revisión `59134b2cb2016c57ee89ca58f6a1bb091ed10901`) |
| Modelo objetivo | `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` |
| Regla de construcción | Capa de salida `i` = capa fuente `i % 5`; tensores no pertenecientes a capas copiados sin cambios |
| Tamaño del repositorio | 6,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

El checkpoint es un drafter de decodificación especulativa basado en DSpark, un método de block drafting que propone bloques de tokens candidatos para que el modelo objetivo los verifique, con el objetivo de aumentar la longitud aceptada sin perder las ventajas de latencia del borrado por bloques. La variante aquí descrita no aporta innovaciones de arquitectura propias: su config declara 30 capas y repite el patrón de tipos de capa del modelo fuente de 5 capas, copiando los tensores de cada capa de salida desde la capa fuente correspondiente según `i % 5`.

No ha habido reentrenamiento ni ajuste alguno en esta variante. El drafter fuente de 5 capas sí fue entrenado y cuantizado, y sus registros originales se conservan en el directorio `provenance/` del repositorio, etiquetados explícitamente como artefactos del modelo fuente. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO al drafter. Como contexto del ecosistema, la documentación pública de Nemotron 3.5 Lightning menciona un preentrenamiento de más de 20 billones de tokens para el modelo objetivo de la familia Lightning, pero ese dato no es extrapolable a este drafter ni a esta variante dummy.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa mediante DSpark, consumidos y verificados por el modelo objetivo.
- Integración con vLLM a través de `--speculative_config.method dspark`, con parámetros como `num_speculative_tokens` y `draft_sample_method`.
- Soporte de cuantización FP8_BLOCK mediante `compressed-tensors`.
- Compatibilidad declarada con el modelo objetivo `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` según la configuración de ejemplo.
- Ejecución con `draft_tensor_parallel_size 1`, lo que permite ubicar el drafter en una sola GPU junto al modelo objetivo.
- Reproducibilidad verificable mediante `derived_from.json` y `drafter_checkpoint_sha256.txt`.
- No es un modelo de chat, instrucciones ni generación directa de texto: no se le deben pedir respuestas, razonamiento, código ni matemáticas.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo thinking.
- Las capas repetidas no añaden capacidad representacional; el modelo no debe tratarse como un drafter de 30 capas entrenado.

## Casos de uso

- **Experimentación con número de capas en drafters**: sirve como control estructural para medir cómo afecta declarar 30 capas frente a 5 en el consumo de memoria, el tiempo de carga y la latencia de arranque, sin necesidad de entrenar un modelo nuevo.
- **Benchmarking de almacenamiento y carga de checkpoints**: con 6,6 GB de repositorio y 6,5 GB de pesos en FP8, permite comparar el coste de serialización, lectura desde disco y carga en VRAM frente al drafter fuente de 5 capas.
- **Validación de pipelines de decodificación especulativa**: se puede insertar en el comando de vLLM con `--speculative_config.method dspark` para comprobar que el pipeline acepta correctamente un drafter derivado y que la configuración de tokens especulativos se aplica sin errores.
- **Pruebas de integración de `compressed-tensors` en FP8_BLOCK**: útil para verificar que el runtime de vLLM y las dependencias de cuantización cargan correctamente tensores FP8_BLOCK con `trust-remote-code` y `custom_code`.
- **Verificación de reproducibilidad y procedencia**: el repositorio incluye `derived_from.json` y un SHA-256 del `model.safetensors`, lo que permite auditar que la derivación desde la revisión fuente se ha realizado según la regla documentada.
- **CI/CD de configuraciones de serving**: se puede usar en pruebas automatizadas que validen que los comandos de despliegue con parámetros de tensor parallelism, expert parallel y speculative config siguen siendo aceptados por la versión de vLLM fijada.
- **Estudios de escalado de drafters**: como punto de comparación intermedio entre el drafter de 5 capas y un futuro drafter de 30 capas realmente entrenado, ayuda a separar el efecto del número de capas del efecto del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre esta variante y que las mediciones de calidad y aceptación del modelo fuente no son aplicables. Tampoco se han validado la compatibilidad de serving ni el rendimiento de este checkpoint dummy.

## Requisitos de hardware

- **Peso de los pesos**: aproximadamente 6,5 GB en FP8_BLOCK (6.505.631.489 parámetros), con un repositorio de 6,6 GB.
- **VRAM estimada para el drafter**: del orden de 7 a 9 GB incluyendo pesos, escalas de cuantización y overhead del runtime; no validado por el autor.
- **GPU recomendadas para el drafter**: una GPU con soporte FP8, como H100, H200, B200 o RTX 6000 Ada/Blackwell; `draft_tensor_parallel_size 1` en el ejemplo apunta a una sola GPU.
- **GPU para el modelo objetivo**: el comando de ejemplo usa `--tensor-parallel-size 4` sobre 4 GPU, coherente con un objetivo de 120B en BF16.
- **Viabilidad en GPU de consumo**: los 6,6 GB de pesos caben en tarjetas de 12 GB o más, y con holgura en una RTX 4090 de 24 GB; el soporte efectivo de FP8_BLOCK en Ada debe verificarse en la versión de vLLM utilizada.
- **Opciones de despliegue**: vLLM con `--speculative_config.method dspark` y `--mamba-backend flashinfer` según el ejemplo; la librería `speculators` y `custom_code` son necesarias para cargar el checkpoint.
- **Latencia y throughput**: no disponibles; no se han validado para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Cuantización | Modelo objetivo | Licencia | Estado |
|---|---|---|---|---|---|---|
| `RelaxingSnorlax/nemotron35-dspark-30l-fp8block` | 6.505.631.489 | 30 declaradas (5 únicas) | FP8_BLOCK | Nemotron-3.5-Super-VL-120B-A12B | openmdw-1.1 | Dummy, sin entrenar ni evaluar |
| `RelaxingSnorlax/nemotron35-dspark-5l-fp8block` | No disponible | 5 | FP8_BLOCK | Nemotron-3.5-Super-VL-120B-A12B | No disponible | Drafter fuente, entrenado y cuantizado |
| DSpark oficial para Nemotron-3.5-Lightning-30B-A3B (NVFP4) | No disponible | No disponible | NVFP4 | Nemotron-3.5-Lightning-30B-A3B | No disponible | Publicado por NVIDIA, orientado a DGX Spark y Blackwell |
| Drafter EAGLE-3 genérico | No disponible | No disponible | No disponible | Distintos modelos objetivo | No disponible | Alternativa metodológica; sin datos comparables en la información disponible |

La comparación directa con el drafter oficial de NVIDIA no es posible con los datos disponibles: cambian el modelo objetivo (Super-VL-120B-A12B frente a Lightning-30B-A3B) y el formato de cuantización (FP8_BLOCK frente a NVFP4), y no se han publicado métricas de longitud aceptada para esta variante dummy.

## Limitaciones y advertencias

- **No es un modelo entrenado**: las 30 capas son copias de 5 capas únicas; no existe un modelo de 30 capas real detrás del checkpoint.
- **Sin evaluación**: no se ha ejecutado ninguna prueba de calidad, aceptación, latencia o throughput sobre esta variante.
- **Métricas no transferibles**: los resultados del drafter fuente de 5 capas no aplican a este checkpoint.
- **Riesgo de uso indebido**: emplearlo en producción como drafter de 30 capas no aportará ninguna mejora de aceptación y puede inducir a conclusiones erróneas en experimentos mal diseñados.
- **Compatibilidad no validada**: el autor advierte de que la compatibilidad de serving y el rendimiento del checkpoint dummy no se han verificado; el comando de ejemplo replica la configuración del modelo fuente.
- **Discrepancia de modelo objetivo**: la configuración apunta a `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, mientras que parte de la documentación pública de DSpark se refiere a `Nemotron-3.5-Lightning-30B-A3B`; conviene confirmar el emparejamiento antes de desplegar.
- **Idiomas y contexto no documentados**: no hay información sobre cobertura lingüística ni longitud de contexto del drafter.
- **Licencia**: openmdw-1.1; la model card no detalla restricciones adicionales para uso comercial, por lo que debe revisarse el texto completo de la licencia.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, con un único autor y sin revisión comunitaria; no es un artefacto apto para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-30l-fp8block
- Drafter fuente de 5 capas: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-5l-fp8block
- Modelo objetivo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Model card de Nemotron 3.5 Lightning 30B-A3B en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- DSpark para Nemotron 3.5 Lightning en MLX: https://huggingface.co/Sawfwair/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark-MLX
- DSpark para Nemotron 3.5 Lightning en ModelScope: https://www.modelscope.cn/models/nv-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Réplica comunitaria del DSpark de Lightning: https://huggingface.co/microperceptron/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Repositorio de despliegue con SGLang y DSpark: https://github.com/MiaAI-Lab/Nemotron3.5-Lightning-DGX-Spark-RTX-5090-6000-PRO
