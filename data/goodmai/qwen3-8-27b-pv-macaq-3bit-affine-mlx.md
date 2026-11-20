# goodmai/Qwen3.8-27B-PV-MACaQ-3bit-Affine-MLX

## Resumen

`goodmai/Qwen3.8-27B-PV-MACaQ-3bit-Affine-MLX` es una cuantización de 3 bits del modelo `Qwen/Qwen3.8-27B`, publicada por el usuario goodmai y orientada específicamente a la inferencia en Apple Silicon mediante la librería MLX. El modelo parte de la versión de 8 bits de `mlx-community` y aplica una técnica propietaria denominada PV-MACaQ (block-64 Walsh-Hadamard rotation, optimización de `pre_scale` y pulido clip/V-step) para reducir el peso a 13,02 GB en tres shards, un tamaño que permite ejecutarlo en Macs de 24 GB de memoria unificada.

El objetivo es claro: hacer viable un modelo de aproximadamente 21,2 mil millones de parámetros reales en hardware de consumo de Apple, a costa de una pérdida de precisión controlada. El autor reporta una mejora de SQNR medio frente a la cuantización RTN de 3 bits, pasando de 13,98 dB a 15,54 dB, con una reducción del error cuadrático medio del 29,5 %.

La información pública disponible es muy escasa: no hay licencia declarada, no se especifican idiomas, no hay pipeline asignado y el repositorio no tiene descargas ni interacciones. Además, el modelo base `Qwen/Qwen3.8-27B` no aparece descrito en la información proporcionada, por lo que muchos de sus atributos (arquitectura, contexto, datos de entrenamiento) no pueden confirmarse aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base `Qwen/Qwen3.8-27B`; el repo declara `qwen3_5` como tag de arquitectura) |
| Parametros totales | 21.272.481.008 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit affine PV-MACaQ g64 H64 en 496 modulos del backbone; 4-bit affine g64 en `embed_tokens` y `lm_head`; BF16 en 686 modulos (vision, norms, conv1d) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (3 shards, 13,02 GB), libreria MLX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `Qwen/Qwen3.8-27B` en los datos proporcionados. El tag `qwen3_5` sugiere que pertenece a la familia Qwen 3.5, pero no se confirma ni el tipo de transformer, ni si es denso o MoE, ni el número de capas o cabezas. Los 21.272.481.008 parámetros reales del checkpoint cuantizado indican que el modelo base es de un tamaño cercano a los 21 mil millones de parámetros efectivos.

Lo que sí documenta el autor es el proceso de cuantización. Se aplica una rotación Walsh-Hadamard por bloques de 64 elementos sobre la matriz de pesos, seguida de la selección óptima de un factor `pre_scale` y de un pulido final basado en clip y V-step. El resultado son 496 módulos del backbone en 3 bits, mientras que las capas de embedding y la cabeza de lenguaje se mantienen en 4 bits y 686 módulos sensibles (visión, normalizaciones y convoluciones 1d) permanecen en BF16 para preservar precisión. No hay información sobre datos de entrenamiento, tokens vistos ni procesos de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, aunque no se detallan en la información disponible.
- Procesamiento de visión: el checkpoint conserva 686 módulos en BF16 etiquetados como vision/norms/conv1d, lo que indica que el modelo base es multimodal con entrada de imagen.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking: no disponible en la información proporcionada.
- Inferencia especulativa: el comando de ejemplo del autor activa `--speculative-lookup`, lo que sugiere soporte de decodificación especulativa en el runtime Basalt.

## Casos de uso

- Inferencia local en Mac de 24 GB: el caso de uso principal y explícito del autor. Un MacBook Pro o Mac mini con 24 GB de memoria unificada puede cargar los 13,02 GB del checkpoint y ejecutar el modelo con el runtime Basalt, algo imposible con la versión de 8 bits del mismo modelo.
- Prototipado de aplicaciones multimodales en local: al conservar los módulos de visión en BF16, permite experimentar con entrada de imagen sin depender de la nube ni de GPUs dedicadas.
- Desarrollo y depuración de pipelines MLX: sirve como banco de pruebas para verificar el comportamiento de la cuantización PV-MACaQ frente a RTN en tareas reales, comparando calidad de salida y uso de memoria.
- Evaluación de la pérdida de calidad de 3 bits: útil para investigadores que quieran medir el impacto de la cuantización agresiva en tareas de razonamiento o generación, usando el SQNR reportado (15,54 dB) como referencia.
- Despliegue con servidor REST local: el comando `basalt serve ... --rest` habilita una API HTTP local, adecuada para integrar el modelo en herramientas de escritorio o scripts de automatización en el propio equipo.
- Ahorro de memoria con KV cache en 4 bits: la opción `--kv-bits 4` del runtime reduce el consumo de la caché de atención, lo que permite conversaciones más largas dentro del presupuesto de 24 GB.
- Experimentación con decodificación especulativa: la bandera `--speculative-lookup` permite medir la ganancia de throughput en Apple Silicon con este checkpoint cuantizado.

## Benchmarks y rendimiento

El autor solo publica métricas de fidelidad de la cuantización, no benchmarks de tareas:

| Metrica | Valor |
|---|---|
| SQNR medio vs 8-bit (RTN 3-bit) | 13,98 dB |
| SQNR medio vs 8-bit (PV-MACaQ 3-bit) | 15,54 dB |
| Reduccion de MSE vs RTN 3-bit | -29,5 % |
| Tamano del checkpoint | 13,02 GB (3 shards) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,02 GB solo para los pesos; con overhead del runtime, caché KV en 4 bits y buffers de activación, el autor apunta a equipos de 24 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M-series) con 24 GB o más de memoria unificada. No se mencionan GPUs NVIDIA ni AMD.
- ¿Cabe en GPU de consumo? No hay información sobre versiones para CUDA; el formato MLX no es directamente compatible con GPUs NVIDIA.
- Opciones de despliegue: runtime Basalt (`basalt serve`), con flags `--speculative-lookup`, `--kv-bits 4` y `--rest`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Runtime | Licencia |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-PV-MACaQ-3bit-Affine-MLX | 21,27 B | 3-bit PV-MACaQ + 4-bit embed/lm_head | 13,02 GB | MLX / Basalt | no disponible |
| mlx-community/Qwen3.8-27B-8bit (base de esta cuantizacion) | no disponible | 8-bit | no disponible | MLX | no disponible |
| Qwen/Qwen3.8-27B (modelo original) | no disponible | BF16 (presumiblemente) | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre modelos comparables de la misma categoría (cuantizaciones de 3 bits para Apple Silicon) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits introduce degradación de calidad medible: el SQNR medio de 15,54 dB frente a 8 bits implica un error de reconstrucción de pesos no despreciable, que puede afectar a tareas sensibles como matemáticas o código.
- El checkpoint está pensado exclusivamente para MLX y Apple Silicon; no es portable a CUDA ni a otros runtimes sin conversión.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. Hay que consultar la licencia del modelo base `Qwen/Qwen3.8-27B` antes de cualquier despliegue en producción.
- No se especifican idiomas soportados; el comportamiento multilingüe es incierto.
- El repositorio tiene cero descargas y cero interacciones, y fue creado y actualizado el mismo día: no hay evidencia de validación por parte de la comunidad.
- La model card está en inglés y es muy breve; no incluye información sobre sesgos, alucinación ni evaluación cualitativa.
- El uso de decodificación especulativa con `--speculative-lookup` puede alterar las salidas respecto a la decodificación estándar; conviene validar en tareas críticas.
- No se documenta el pipeline ni la tarea; la ausencia de metadatos complica la integración automática en herramientas que dependen de ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-PV-MACaQ-3bit-Affine-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint de 8 bits de partida: https://huggingface.co/mlx-community/Qwen3.8-27B-8bit
- Runtime Basalt: https://github.com/goodmai/basalt
