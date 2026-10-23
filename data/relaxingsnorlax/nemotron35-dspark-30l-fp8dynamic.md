# RelaxingSnorlax/nemotron35-dspark-30l-fp8dynamic

## Resumen

`RelaxingSnorlax/nemotron35-dspark-30l-fp8dynamic` no es un modelo de lenguaje en el sentido habitual, sino un artefacto de control estructural: un *drafter* de decodificación especulativa del método DSpark cuyo número de capas se ha inflado artificialmente de 5 a 30 sin reentrenamiento. El autor, el usuario de Hugging Face RelaxingSnorlax, construyó cada capa de salida `i` copiando byte a byte los tensores de la capa `i % 5` del checkpoint fuente, dejando los tensores no asociados a capas sin modificar. El resultado es un checkpoint de 6.505.631.489 parámetros en FP8_DYNAMIC que sirve únicamente como referencia para experimentos de almacenamiento, carga, memoria o latencia.

El modelo base declarado es doble: por un lado el drafter de 5 capas `RelaxingSnorlax/nemotron35-dspark-5l-fp8dynamic` (revisión `12d3c969b3eeaff3e5e18d7f1ab8cb8b642e9562`) y, por otro, el modelo objetivo al que ese drafter acompaña, `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`. DSpark es una técnica de decodificación especulativa por bloques orientada a aumentar la longitud aceptada manteniendo los beneficios de latencia del *block drafting*, empleada en despliegues de la familia Nemotron 3.5 sobre sistemas Blackwell compactos. Este checkpoint concreto no ha sido evaluado y el propio autor advierte de que las métricas de calidad y aceptación del modelo fuente no son aplicables.

Su relevancia es por tanto metodológica, no funcional: permite aislar el efecto del recuento de capas en el coste de almacenamiento, el tiempo de carga y el consumo de VRAM de un drafter cuantizado, manteniendo constante el resto de la estructura. Con 0 descargas y 0 *likes* en el momento de redactar esta ficha, debe tratarse como material de laboratorio y no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para decodificacion especulativa (DSpark drafter); 30 capas declaradas en config, con tensores replicados de un origen de 5 capas |
| Parametros totales | 6.505.631.489 (6,5 B), segun safetensors |
| Parametros activos | No disponible (la model card no declara estructura MoE para este checkpoint) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8_DYNAMIC (`compressed-tensors`); no se publican otros formatos |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | `safetensors` con `compressed-tensors` y `custom_code`; libreria `speculators` |

## Arquitectura y entrenamiento

El checkpoint no ha sido entrenado. Se generó mediante una regla determinista de replicación: para cada capa de salida `i` en el rango 0-29, los tensores se copian byte a byte desde la capa `i % 5` del drafter fuente de 5 capas, y todos los tensores que no pertenecen a capas se copian sin cambios. La configuración declara 30 capas y repite el patrón de tipos de capa del modelo de origen. El repositorio incluye `derived_from.json` con la fuente y la regla de construcción, `drafter_checkpoint_sha256.txt` con el SHA-256 de `model.safetensors`, y un directorio `provenance/` con los registros originales de entrenamiento y cuantización del modelo de 5 capas, etiquetados explícitamente como artefactos de la fuente.

El drafter de origen es un cabezal de decodificación especulativa FP8_DYNAMIC asociado al objetivo `NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`, un modelo MoE vision-lenguaje de 120 B de parámetros totales y 12 B activos, preentrenado con más de 20 billones de tokens según la documentación de NVIDIA para la familia Nemotron 3.5. DSpark, el método de decodificación especulativa empleado, está diseñado para incrementar la longitud aceptada preservando la latencia del *block drafting* en sistemas Blackwell compactos. La model card proporciona un comando de servicio en vLLM con `--tensor-parallel-size 4`, `--enable-expert-parallel`, `--speculative_config.method dspark`, `--speculative_config.num_speculative_tokens 8`, `--speculative_config.draft_tensor_parallel_size 1`, muestreo *greedy* y `--mamba-backend flashinfer`, heredado de la configuración de despliegue del modelo fuente; el autor indica que la compatibilidad y el rendimiento de esta variante dummy no han sido validados.

## Capacidades

- Propuesta de tokens especulativos para decodificación DSpark en vLLM, como drafter subordinado al objetivo Nemotron 3.5.
- Función exclusivamente estructural: no se ha validado que las capas replicadas produzcan propuestas útiles ni tasas de aceptación significativas.
- No dispone de generación de texto autónoma de calidad: no es un modelo de chat ni de instrucciones.
- Sin soporte declarado de *tool calling* ni *function calling*.
- Sin soporte declarado de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidades de visión: no disponibles en este artefacto (el objetivo Nemotron 3.5 Super VL sí es vision-lenguaje, pero el drafter no lo es).
- Sin modo *thinking* ni otras capacidades especiales.
- Utilizable como control negativo en experimentos de recuento de capas y de cuantización FP8 dinámica.

## Casos de uso

- Control estructural en experimentos de recuento de capas: sirve para medir cómo escala el tamaño del repositorio y del fichero de pesos al pasar de 5 a 30 capas con los mismos tensores subyacentes, manteniendo constante todo lo demás.
- Medición de VRAM de un drafter FP8: al ser un checkpoint de 6,5 B en FP8_DYNAMIC, permite cuantificar el consumo de memoria de un drafter con 30 capas frente al de 5 sin necesidad de entrenar variantes nuevas.
- Pruebas de latencia de carga en frío: útil para comparar tiempos de lectura y deserialización de safetensors replicados frente a tensores únicos, y para evaluar el impacto de `custom_code` en el arranque del servidor.
- Validación de pipelines de `compressed-tensors`: ejercicio de ida y vuelta para comprobar que las herramientas de cuantización y carga manejan correctamente configuraciones con patrones de capas repetidos.
- Pruebas de regresión en CI/CD de infraestructura de inferencia: integración del comando `vllm serve` con `--speculative_config.model` apuntando a esta variante para detectar roturas en la gestión de drafters antes de desplegar checkpoints reales.
- Verificación de reproducibilidad y procedencia: el par `derived_from.json` más `drafter_checkpoint_sha256.txt` permite auditar pipelines de derivación de artefactos y comprobar hashes en procesos de publicación interna.
- Docencia y divulgación técnica: ejemplo reproducible de por qué la profundidad no puede sustituirse por replicación de tensores y de cómo se degrada la aceptación en decodificación especulativa.
- Pruebas de estrés de almacenamiento: 6,6 GB de repositorio para ensayar réplicas, cachés locales y distribución de artefactos sin mover modelos grandes reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card declara explícitamente que no se ha ejecutado ninguna evaluación sobre esta variante y que las mediciones de calidad y aceptación del modelo fuente no son aplicables al checkpoint de 30 capas. Tampoco se han validado la compatibilidad de servicio ni el rendimiento del comando de despliegue incluido.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5-7 GB solo para pesos en FP8_DYNAMIC (1 byte por parámetro), más overhead de activaciones, caché KV y contexto de ejecución de vLLM; un margen práctico razonable es de 8-10 GB.
- GPU recomendadas: cualquier GPU con al menos 12-16 GB para servirlo con holgura; tarjetas de 24 GB (RTX 4090, L40S, A10G de 24 GB) o superiores permiten además ejecutar el objetivo Nemotron 3.5 junto al drafter si se reparte el modelo objetivo entre varias GPU.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB), RTX 4080/4080 Super (16 GB) y RTX 4070 Ti Super (16 GB); en tarjetas de 12 GB requeriría reducir overhead y probablemente no deja espacio para el modelo objetivo.
- Opciones de despliegue: vLLM con soporte del método DSpark y `--trust-remote-code` (única ruta documentada); el comando de referencia usa 4 GPU con `--tensor-parallel-size 4` y `--enable-expert-parallel` para el objetivo, con `--speculative_config.draft_tensor_parallel_size 1` para el drafter. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de velocidad de carga, tiempo por paso de drafting ni tasa de aceptación para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| `RelaxingSnorlax/nemotron35-dspark-30l-fp8dynamic` (este) | 6,5 B | 30 (declaradas, replicadas de 5) | safetensors FP8_DYNAMIC | OpenMDW 1.1 | Experimental, sin evaluar |
| `RelaxingSnorlax/nemotron35-dspark-5l-fp8dynamic` | No disponible | 5 (entrenadas) | safetensors FP8_DYNAMIC | No disponible en la informacion | Drafter de origen, con registros de entrenamiento y cuantizacion |
| `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark` | 30 B totales, 3 B activos (por el nombre del checkpoint) | No disponible | NVFP4 | OpenMDW 1.1 | Release oficial de NVIDIA para el objetivo Lightning 30B-A3B en vLLM |
| `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` | 120 B totales, 12 B activos | No disponible | BF16 | No disponible en la informacion | Modelo objetivo; no es un drafter y no es comparable en coste |

La comparación relevante es con el drafter de 5 capas del que deriva: mismo contenido tensorial, distinto recuento de capas declarado, aproximadamente seis veces más parámetros almacenados y ningún dato de aceptación. Frente al drafter oficial de NVIDIA para la variante Lightning, este checkpoint no ha pasado por entrenamiento ni evaluación y pertenece a otro emparejamiento (Super VL 120B-A12B).

## Limitaciones y advertencias

- No es un modelo entrenado: las 30 capas contienen 6 copias de las mismas 5 capas de origen, por lo que la función que aproxima no corresponde a la de un transformer de 30 capas.
- No hay ninguna evaluación publicada; se desconoce la tasa de aceptación, y el autor advierte de que las métricas del modelo fuente no aplican.
- Un drafter con capas duplicadas propondrá tokens redundantes; la utilidad práctica de la decodificación especulativa con este checkpoint es dudosa y no está medida.
- La compatibilidad de servicio con vLLM y el método DSpark no ha sido validada para esta variante, aunque el comando incluido replique la configuración del modelo fuente.
- Requiere `--trust-remote-code` y la librería `speculators`, lo que implica ejecutar código personalizado del repositorio.
- Licencia OpenMDW 1.1: antes de cualquier uso comercial deben revisarse los términos completos de la licencia y, en su caso, las condiciones del modelo base de NVIDIA.
- Idiomas soportados y longitud de contexto no documentados; no debe asumirse ninguno de los valores del modelo objetivo.
- Riesgo de confusión en producción: el nombre incluye "nemotron35" y "30l", lo que puede llevar a desplegarlo por error creyendo que es un drafter de 30 capas entrenado.
- Sesgos y alucinaciones: no evaluables en este artefacto; cualquier sesgo heredado provendría del drafter de 5 capas y, en última instancia, del objetivo Nemotron 3.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-30l-fp8dynamic
- Drafter fuente de 5 capas: https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-5l-fp8dynamic
- Modelo objetivo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Ficheros del repositorio (incluye `derived_from.json`, `drafter_checkpoint_sha256.txt` y `provenance/`): https://huggingface.co/RelaxingSnorlax/nemotron35-dspark-30l-fp8dynamic/tree/main
- Drafter DSpark oficial para Nemotron 3.5 Lightning 30B-A3B (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Ficha del modelo Nemotron 3.5 Lightning 30B-A3B en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Réplica comunitaria en ModelScope del drafter oficial: https://www.modelscope.cn/models/nv-community/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Variante MLX del drafter oficial (referencia de despliegue): https://huggingface.co/Sawfwair/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark-MLX/blob/main/README.md
- Página de despliegue gestionado de Nemotron 3.5 Lightning DSpark: https://axforge.ai/models/nvidia-nemotron-3-5-lightning-dspark/
