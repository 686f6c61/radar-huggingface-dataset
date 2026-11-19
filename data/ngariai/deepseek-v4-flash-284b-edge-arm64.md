# NGARiAI/DeepSeek-V4-Flash-284B-Edge-ARM64

## Resumen
DeepSeek-V4-Flash-284B-Edge-ARM64 es un repositorio de artefactos de inferencia (binarios y parches, no pesos) publicado por NGARiAI para ejecutar el checkpoint cuantizado de DeepSeek V4 Flash en plataformas ARM64 con aceleración CUDA. El modelo subyacente es un mixto de expertos (MoE) de 284,33 mil millones de parámetros totales con 13,17 mil millones activos, distribuido en tres shards que suman 56,93 GiB en formato GGUF con cuantización MaxQ-Fractal de tipo `q2_0`. El checkpoint original proviene de `Synchopate/DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB-CPU-GGUF`, que a su vez cuantiza `deepseek-ai/DeepSeek-V4-Flash-0731`.

La relevancia de este repositorio no está en los pesos (que no incluye), sino en el trabajo de portabilidad: proporciona compilaciones `aarch64` (CPU y CUDA `sm_87`), corrige un fallo crítico en el decodificador CUDA de `q2_0` que hacía que todos los pesos se decodificaran como aproximadamente cero, y publica una suite de conformidad con vectores dorados y un informe firmado. Las mediciones se realizan sobre una Jetson AGX Orin de 64 GB, un dispositivo de borde que cabe en la mano.

El contexto práctico es limitado: con 56,93 GiB de pesos residentes en una placa de 64 GB, el presupuesto de contexto queda en torno a 2.048 tokens. El repositorio está pensado para quienes necesitan ejecutar un MoE de gran tamaño en hardware ARM64 de borde y valoran la auditabilidad por encima del rendimiento bruto.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), arquitectura `deepseek4` |
| Parámetros totales | 284,33 B |
| Parámetros activos | 13,17 B |
| Longitud de contexto | 2.048 tokens medidos (presupuesto práctico en placa de 64 GB; no se especifica el máximo teórico) |
| Tipos de cuantización | `q2_0` (MaxQ-Fractal: bloque de 30 bytes, 64 pesos, códec de 3 bits, ocho escalas de sub-bloque de 4 bits) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (pesos y parche CUDA); motor `llama-modchip` bajo Apache-2.0 |
| Formato de pesos | GGUF (3 shards, 56,93 GiB) |

## Arquitectura y entrenamiento
El modelo base es un transformer con arquitectura de mezcla de expertos denominada `deepseek4` en el ecosistema `llama-modchip`. La cifra de 284,33 B de parámetros totales con 13,17 B activos implica un ratio de activación bajo, típico de los MoE de DeepSeek. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

La innovación técnica destacable de este repositorio es la corrección del decodificador CUDA para el tipo `q2_0`. El fork `llama-modchip` redefine `block_q2_0` en sitio (bloque de 30 bytes, 64 pesos, códec de 3 bits, ocho escalas de sub-bloque de 4 bits) y reutiliza el slot de enum obsoleto `42`. El decodificador CPU se actualizó al nuevo layout, pero el decodificador CUDA (`ggml/src/ggml-cuda/dequantize.cuh`) seguía leyendo el bloque antiguo de 32 pesos y 18 bytes, por lo que cada peso se decodificaba aproximadamente como cero. El parche `scripts/patch_dsv4_cuda_q2_0.py` aplica cuatro ediciones (el decodificador portado desde la referencia CPU y tres puertas de dispatch que mantienen alejados los kernels rápidos obsoletos) y es idempotente: rechaza un árbol desviado en lugar de escribir un parche a medias. La verificación reproduce la referencia CPU sobre 19.200 pesos en 300 bloques con 0 discrepancias, y el kernel compila limpio para `sm_87`. En la ruta GPU, el tipo se expande a través de f16 por llamada, lo que es correcto pero no rápido; ese coste se mide y se declara.

## Capacidades
- Generación de texto en inglés con arquitectura MoE de gran tamaño.
- Razonamiento y conocimiento general heredados del modelo base DeepSeek V4 Flash, aunque sin evaluación de calidad publicada para este checkpoint.
- Inferencia en dispositivos ARM64 de borde (Jetson AGX Orin) con aceleración CUDA `sm_87`.
- Ejecución con el motor `llama-modchip` mediante `llama-server` y `llama-bench`.
- Suite de conformidad con vectores dorados que aíslan cada regla del formato `q2_0` (escala de sub-bloque, plano de bit alto, índice de códec, extremos) más un conjunto pseudoaleatorio determinista.
- Inferencia auditable: informe firmado con el hash de los vectores y la máquina de medición.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso
- Inferencia de borde en robótica o vehículos no tripulados: el modelo cabe en una Jetson AGX Orin de 64 GB y permite ejecutar un MoE de 284 B en un dispositivo embebido con 2.048 tokens de contexto, suficiente para instrucciones y respuestas cortas.
- Procesamiento de lenguaje natural en entornos sin conectividad: al ejecutarse localmente en ARM64, permite generar texto sin depender de la nube, útil en instalaciones industriales o despliegues aislados.
- Validación de cuantizaciones extremas: la suite de conformidad con vectores dorados sirve para verificar que un decodificador `q2_0` produce resultados bit-exactos antes de confiar en él en producción.
- Investigación en compresión de modelos: el formato MaxQ-Fractal (bloque de 30 bytes, códec de 3 bits, escalas de 4 bits) es un caso de estudio para quienes investigan cuantizaciones por debajo de 2 bits por peso.
- Reproducibilidad de benchmarks: los scripts `dsv4_bench.py` y `q2_0_conformance.py` permiten repetir las mediciones en hardware propio y comparar con las cifras publicadas (2,06 tok/s de decodificación, 37,98 tok/s de prefill).
- Auditoría de kernels CUDA: el parche y su verificación (19.200 pesos, 0 discrepancias) sirven como referencia para depurar decodificadores CUDA que leen layouts de bloque obsoletos.
- Prototipado de asistentes conversacionales de contexto corto en placas ARM64, aceptando la latencia de 2 tok/s como coste de ejecutar un modelo de 284 B en el borde.

## Benchmarks y rendimiento
Mediciones publicadas en la model card sobre Jetson AGX Orin 64 GB (MAXN), 12 núcleos ARM, 204,8 GB/s, fecha 2026-11-15:

| Métrica | Valor | Condiciones |
|---|---|---|
| Decodificación | 2,06 ± 0,16 tok/s | `llama-bench -ngl 28 -p 0 -n 32 -t 12`, sin servidor HTTP |
| Decodificación (servidor) | 2,08 tok/s | `-ngl 34` |
| Prefill (prompt de 1.076 tokens) | 37,98 tok/s | `-ngl 34 -fa on -ctk q8_0 -ctv q8_0` |
| Memoria residente | 56,93 GiB | checkpoint en disco |
| Tiempo de carga | 31–90 s | 57 GiB de shards |
| Salida | coherente | verificada contra el decodificador CPU |

El autor retira explícitamente dos cifras que circulaban (70,7 tok/s de prefill y 9,52 tok/s de decodificación) porque se midieron mientras el decodificador CUDA producía ceros; la comparación honesta con la compilación CPU es de 25× en prefill y 1,5× en decodificación. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, perplejidad) para este checkpoint.

## Requisitos de hardware
- VRAM/RAM: 56,93 GiB de pesos residentes; en una placa de 64 GB quedan unos 4 GB para contexto, lo que limita el contexto a 2.048 tokens.
- GPU recomendada: Jetson AGX Orin 64 GB (sm_87) es la única plataforma medida. Para 128 GB, el autor sugiere probar contexto de 8.192 tokens sin garantizar resultados.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU consumer; el repositorio solo incluye binarios `aarch64` con CUDA `sm_87`.
- Despliegue: `llama-server` y `llama-bench` del fork `llama-modchip` (binarios `aarch64` incluidos). El checkpoint no carga en `llama.cpp` estándar, `ollama`, `vLLM` ni LM Studio, ya que requiere `GGML_TYPE_Q2_0 = 42` y la arquitectura `deepseek4`.
- Latencia y throughput: 2,06 tok/s de decodificación y 37,98 tok/s de prefill en la Orin; tiempo de carga de 31 a 90 s.
- Flags de referencia: `-ngl 20 -c 2048 -t 12` para el servidor; `-ngl 34 -fa on -ctk q8_0 -ctv q8_0` para las mediciones de prefill.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V4-Flash-284B-Edge-ARM64 (este repo) | 284,33 B totales / 13,17 B activos | 2.048 tokens medidos | MIT (pesos y parche); Apache-2.0 (motor) | Binarios aarch64 + parche CUDA; pesos en repo separado |
| Synchopate/DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB-CPU-GGUF | 284,33 B totales / 13,17 B activos | no disponible | MIT | Pesos GGUF; binarios x86_64 (genérico, AVX2, AVX512) |
| deepseek-ai/DeepSeek-V4-Flash-0731 | 284,33 B totales / 13,17 B activos | no disponible | MIT | Pesos originales sin cuantizar |

La comparación con alternativas de otro tamaño o tarea no está disponible en la información proporcionada.

## Limitaciones y advertencias
- Calidad no evaluada: no se ha ejecutado perplejidad, suite de precisión ni benchmark de calidad sobre este checkpoint, ni por el autor ni por terceros localizables.
- Contexto muy limitado: 2.048 tokens en una placa de 64 GB; el propio autor advierte que el contexto es el recurso a presupuestar.
- Solo inglés: el modelo declara únicamente el idioma `en`.
- Rendimiento medido en una sola máquina: una Orin, un conjunto de flags y una fecha; no hay datos de velocidad en otro hardware.
- Compatibilidad restringida: no carga en `llama.cpp` estándar, `ollama`, `vLLM` ni LM Studio; requiere el fork `llama-modchip` con `GGML_TYPE_Q2_0 = 42` y arquitectura `deepseek4`.
- Expansión a f16 en la ruta GPU: el tipo `q2_0` se expande a través de f16 por llamada, lo que es correcto pero no rápido.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un modelo de lenguaje generativo, persiste el riesgo habitual.
- Licencias: los pesos son MIT y el motor Apache-2.0; al redistribuir binarios debe incluirse el NOTICE, y al redistribuir pesos, la nota de MIT.
- El repositorio no contiene los pesos: estos se descargan del checkpoint de Synchopate fijado por SHA-256.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/NGARiAI/DeepSeek-V4-Flash-284B-Edge-ARM64
- Checkpoint de pesos: https://huggingface.co/Synchopate/DeepSeek-V4-Flash-0731-MaxQ-Fractal-64GB-CPU-GGUF
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Kernel `ns-bos-kernel`: https://github.com/NGARiAI/ns-bos-kernel
- Motor `llama-modchip`: https://github.com/synchopate/llama-modchip
