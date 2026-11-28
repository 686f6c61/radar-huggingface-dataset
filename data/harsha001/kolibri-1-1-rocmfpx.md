# Harsha001/Kolibri-1.1-ROCmFPX

## Resumen

Kolibri-1.1-ROCmFPX es una cuantización comunitaria del modelo Kolibri-1.1 de Aleph Alpha, un modelo de razonamiento de arquitectura mixta de expertos (MoE) de 75.112.720.979 parámetros totales, con aproximadamente 3.400 millones de parámetros activos por token, diseñado para alemán e inglés. Esta ficha corresponde concretamente a los ficheros GGUF publicados por el usuario Harsha001 en el formato propietario ROCmFPX, orientado a GPUs AMD (Vulkan y HIP/ROCm), con especial atención al hardware Strix Halo de 128 GB.

El modelo base incorpora atención dispersa para contextos largos, modo de razonamiento y soporte de tool calling. La cuantización ROCmFPX emplea tipos de peso de bajo bit con una escala por bloque de 32 pesos y un escalado por tensor (expertos individuales en las capas MoE) para preservar precisión en pesos de magnitud muy pequeña. Se ofrecen dos variantes: `Q8_0_ROCMFPX` (77,6 GB) y `Q4_0_ROCMFP4_STRIX` (40,2 GB, recomendada para Strix Halo).

La relevancia de esta publicación es doble: por un lado, permite ejecutar un modelo MoE de 75B con razonamiento en una única máquina AMD de gama alta con memoria unificada; por otro, introduce requisitos de runtime no estándar (una rama específica del fork ROCmFPX) y advierte de que los ficheros aún no se han probado en hardware AMD real, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (sparse attention); pesos base en FP8 convertidos a BF16 para la cuantización |
| Parametros totales | 75.112.720.979 |
| Parametros activos | ~3.400 millones por token |
| Longitud de contexto | 32.768 tokens en el ejemplo de ejecución (`-c 32768`); longitud máxima nativa no disponible |
| Tipos de cuantizacion | `Q8_0_ROCMFPX` (8 bits, 77,6 GB) y `Q4_0_ROCMFP4_STRIX` (4 bits, 40,2 GB); escalas por bloque de 32 pesos con escalado por tensor (`LLAMA_ROCMFPX_TENSOR_SCALE=1`); imatrix |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | Apache-2.0 (igual que el modelo base) |
| Formato de pesos | GGUF (tipos ROCmFPX, no compatibles con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base Kolibri-1.1 de Aleph Alpha es un transformer de mezcla de expertos con unos 75.100 millones de parámetros totales y aproximadamente 3.400 millones activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. Incorpora atención dispersa (sparse attention) para manejar contextos largos de forma eficiente, modo de razonamiento explícito y soporte de tool calling. Según la model card del cuantizador, el modelo redondea claves y valores de atención a NVFP4 tal como se hizo durante el entrenamiento, lo que requiere un operador ggml específico (`ROUND_NVFP4`).

El proceso de cuantización parte de los pesos FP8 del modelo base, dequantizados a BF16 mediante `convert_hf_to_gguf.py` del fork ROCmFPX. A partir de ahí se genera una matriz de importancia (imatrix) con la copia `Q8_0` sobre el corpus general `calibration_datav3` en fragmentos de 4096 tokens, y se cuantiza con `llama-quantize --imatrix` una ejecución por tipo. ROCmFPX almacena una escala por bloque de 32 pesos con un paso mínimo fijo; para evitar la pérdida de precisión en pesos de magnitud pequeña, se multiplica cada tensor (cada experto en las capas MoE) por una potencia de dos antes de cuantizar y se guarda la inversa en un tensor `.scale` adicional que el fork aplica a la salida de la matmul. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento en alemán e inglés, con modo de razonamiento explícito.
- Soporte de tool calling / function calling según la model card del modelo base.
- Razonamiento multi-paso orientado a agentes.
- Manejo de contextos largos mediante atención dispersa (operadores `LIGHTNING_INDEXER` y `TOP_K_MASK` en el fork).
- Cuantización con matriz de importancia para preservar la distribución de siguiente token (KLD de 0,0712 en 8 bits y 0,1433 en 4 bits frente a la referencia `Q8_0` estándar).
- Capacidades de visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Razonamiento asistido en alemán para documentación técnica y legal: el modelo puede procesar contextos de hasta 32.768 tokens y generar cadenas de razonamiento en alemán, idioma para el que Aleph Alpha ha optimizado el modelo base.
- Asistentes conversacionales multi-turno en inglés y alemán: la ventana de contexto de 32K y el modo de razonamiento permiten mantener diálogos largos con seguimiento de instrucciones previas.
- Automatización de agentes con tool calling: el soporte de function calling permite integrar el modelo en flujos que consulten APIs o bases de datos, con la salvedad de que el runtime debe soportar las operaciones específicas del fork.
- Procesamiento de documentos largos en una sola máquina AMD: con 40,2 GB en `Q4_0_ROCMFP4_STRIX`, el modelo cabe en los 128 GB de memoria unificada de un Strix Halo, lo que permite resumir o extraer información de documentos extensos sin infraestructura de GPU dedicada.
- Evaluación y experimentación con cuantizaciones de bajo bit en hardware AMD: el repositorio sirve como referencia para probar los tipos ROCmFPX y medir su impacto en perplejidad y divergencia KL frente a `Q8_0`.
- Generación de código y explicaciones técnicas bilingües: aunque no se documentan benchmarks de código, el modo de razonamiento y el soporte de tool calling permiten usarlo en asistentes de programación para equipos germanoparlantes.
- Despliegue local en estaciones de trabajo con GPU AMD: el servidor `llama-server` del fork permite exponer el modelo como endpoint compatible con la API de llama.cpp en una máquina de sobremesa con Strix Halo.

## Benchmarks y rendimiento

La model card del cuantizador incluye mediciones de calidad de cuantización sobre WikiText-2 (8 fragmentos de 4096 tokens, backend CPU del fork, solo texto en inglés). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Fichero | Tamano | PPL | KLD | Same top |
|---|---:|---:|---:|---:|
| `Kolibri-1.1-Q8_0_ROCMFPX.gguf` | 77,6 GB | 8,577 | 0,0712 | 91,52 % |
| `Kolibri-1.1-Q4_0_ROCMFP4_STRIX.gguf` | 40,2 GB | 8,641 | 0,1433 | 86,40 % |
| Referencia `Q8_0` estándar | 75 GB | 8,540 | — | — |

## Requisitos de hardware

- VRAM/memoria estimada: 77,6 GB para `Q8_0_ROCMFPX` y 40,2 GB para `Q4_0_ROCMFP4_STRIX`; en Strix Halo se usa memoria unificada de 128 GB.
- GPU recomendadas: AMD Strix Halo (`gfx1151`) para la variante 4 bits; el fork compila con `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151` o con `-DGGML_VULKAN=ON`. GPUs NVIDIA no están documentadas para estos ficheros.
- Cabe en GPU de consumo: la variante 4 bits (40,2 GB) está pensada para una máquina Strix Halo de 128 GB; no se documenta su funcionamiento en GPUs de consumo con 24 GB o menos.
- Opciones de despliegue: exclusivamente el fork ROCmFPX (rama `kolibri-1.1`), con `llama-server`; llama.cpp estándar, LM Studio, Ollama y versiones antiguas de ROCmFPX no cargan estos ficheros.
- Latencia y throughput: no disponibles. La model card advierte de que, con Vulkan, las operaciones de atención dispersa y `ROUND_NVFP4` se ejecutan en CPU por falta de kernels Vulkan, lo que reduce la velocidad. Con más de una secuencia paralela es necesario `--kv-unified`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kolibri-1.1-ROCmFPX (esta ficha) | 75,1B | ~3,4B | 32K en ejemplo | Apache-2.0 | GGUF ROCmFPX, requiere fork |
| Aleph-Alpha/Kolibri-1.1-GGUF | 75,1B | ~3,4B | no disponible | Apache-2.0 | GGUF estándar de llama.cpp |
| Aleph-Alpha/Kolibri-1.1 (BF16) | 75,1B | ~3,4B | no disponible | Apache-2.0 | Safetensors/FP8 original |
| Aleph-Alpha/Kolibri-1-BF16 | no disponible | no disponible | no disponible | no disponible | Modelo de la generación anterior |

La comparación con modelos de otros fabricantes del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los ficheros no se han probado en hardware AMD real según la propia model card; el rendimiento y la estabilidad en producción están sin verificar.
- Requieren una rama específica del fork ROCmFPX (`kolibri-1.1`); no cargan en llama.cpp estándar, LM Studio, Ollama ni versiones anteriores del fork.
- Con backend Vulkan, las operaciones de atención dispersa y `ROUND_NVFP4` se ejecutan en CPU, con la consiguiente penalización de velocidad.
- Solo se midió calidad de cuantización sobre texto en inglés; el comportamiento en alemán no está evaluado en esta publicación.
- Idiomas limitados a alemán e inglés; no se documenta soporte de otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; no se publican evaluaciones de fidelidad en esta ficha.
- Sesgos conocidos del modelo base: no documentados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda seguir la guía de uso responsable de Aleph Alpha (`RESPONSIBLE_USE.md`).
- No es una publicación oficial de Aleph Alpha; para uso en producción conviene considerar la versión GGUF oficial del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Kolibri-1.1-ROCmFPX
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1
- GGUF oficial del modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1.1-GGUF
- Modelo Kolibri-1 anterior: https://huggingface.co/Aleph-Alpha/Kolibri-1-BF16
- Guía de uso responsable: https://huggingface.co/Aleph-Alpha/Kolibri-1.1/blob/main/RESPONSIBLE_USE.md
- Fork ROCmFPX (rama kolibri-1.1): https://github.com/HarshaVardhan3002/ROCmFPX/tree/kolibri-1.1
- Pull request de llama.cpp con soporte Kolibri 1.1: https://github.com/ggml-org/llama.cpp/pull/32891
- Cuantización destacada del mismo autor (DeepSeek-V4.1-Flash): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
