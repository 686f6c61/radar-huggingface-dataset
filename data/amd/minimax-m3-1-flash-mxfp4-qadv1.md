# amd/MiniMax-M3.1-Flash-MXFP4-QADv1

## Resumen

MiniMax-M3.1-Flash-MXFP4-QADv1 es un checkpoint cuantizado del modelo multimodal MiniMax-M3.1-Flash de MiniMax, publicado por AMD para su ejecucion en aceleradores AMD Instinct MI350 y MI355. Emplea una arquitectura de mezcla de expertos (MoE) dispersa, identificada en la model card como `MiniMaxM3SparseForConditionalGeneration`, con un total de 220.490.854.016 parametros (aproximadamente 220,5 mil millones) y capacidad de procesar texto, imagen y video para generar texto.

La particularidad de esta version radica en que los pesos de los expertos enrutados se almacenan en MXFP4 puro (OCP MX, valores E2M1 con escalas E8M0 por bloque de 32), sin precision mixta, combinando redondeo GPTQ con destilacion consciente de cuantizacion (QAD) sobre trayectorias de codificacion agentica. El resultado es un reemplazo directo de `amd/MiniMax-M3.1-Flash-Quark-MXFP4` en el mismo motor de inferencia (vLLM sobre ROCm) y con las mismas banderas de servicio.

Es relevante porque demuestra una ruta de cuantizacion agresiva a 4 bits (A4W4) para modelos MoE de gran tamano en hardware AMD, con una mejora medida en la tarea DeepSWE respecto al MXFP4 plano, aunque sin significacion estadistica al tamano del benchmark empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMaxM3SparseForConditionalGeneration (MoE dispersa, multimodal) |
| Parametros totales | 220.490.854.016 (aprox. 220,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 puro (A4W4) en expertos enrutados; resto de capas con el mismo formato que `amd/MiniMax-M3.1-Flash-Quark-MXFP4`; etiquetado como 8-bit en metadatos |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (license: other) |
| Formato de pesos | safetensors (con codigo personalizado, `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos dispersa con capacidad multimodal de entrada (texto, imagen y video) y salida de texto. La model card no detalla el numero de expertos, la proporcion de activacion ni la longitud de contexto, por lo que esos datos figuran como no disponibles. La cuantizacion se aplica con AMD-Quark: los pesos de los expertos enrutados se cuantizan a OCP MXFP4 estatico (puro, sin mezcla de precisiones) y sus activaciones a MXFP4 dinamico, manteniendo el resto de capas en el formato del release MXFP4 de AMD.

El proceso de entrenamiento combina tres tecnicas: redondeo GPTQ de los codigos FP4 de los expertos, destilacion on-policy (QAD) de los pesos no pertenecientes a expertos desde el release oficial NVFP4 de MiniMax (`MiniMaxAI/MiniMax-M3.1-Flash`), incluyendo trayectorias de codificacion agentica, y congelacion de los expertos en la rejilla GPTQ MXFP4. El layout de shards, nombres, dtypes y formas de tensores, asi como el modelo borrador `dspark`, coinciden con el release MXFP4 de AMD; solo cambian los valores de los pesos. La decodificacion especulativa se soporta mediante `dspark` con hasta 7 tokens especulativos.

## Capacidades

- Generacion de texto a partir de entradas multimodales: texto, imagen y video.
- Razonamiento y codificacion agentica, con evaluacion especifica en la tarea DeepSWE.
- Decodificacion especulativa mediante el modelo borrador `dspark` integrado en el repositorio.
- Soporte de parser de razonamiento `minimax_m3` en vLLM.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Codificacion agentica en produccion: el modelo esta evaluado en DeepSWE y entrenado con trayectorias de codificacion agentica, por lo que encaja en pipelines de resolucion automatica de tareas de software con multiples pasos e interaccion con herramientas.
- Despliegue en infraestructura AMD Instinct: al ser un checkpoint especifico para MI350/MI355 con vLLM sobre ROCm, permite servir un MoE multimodal de 220,5 mil millones de parametros en centros de datos AMD sin recurrir a hardware NVIDIA.
- Sustitucion directa de un despliegue existente: al compartir config, tokenizer, processor, layout de shards y modelo borrador con `amd/MiniMax-M3.1-Flash-Quark-MXFP4`, se puede cambiar solo la ruta del modelo en el comando de servicio sin reconfigurar el motor.
- Analisis de documentos con imagenes: la entrada image-text-to-text permite extraer y razonar sobre contenido de capturas, diagramas o paginas escaneadas dentro de un flujo de generacion de texto.
- Procesamiento de video para resumenes o descripciones: la entrada de video habilita tareas de comprension y descripcion de contenido audiovisual.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia A4W4 frente a MXFP4 plano y NVFP4 en entornos de investigacion sobre cuantizacion de MoE.
- Generacion de codigo asistida con decodificacion especulativa: el uso de `dspark` con 7 tokens especulativos reduce la latencia en cargas de generacion larga, adecuado para asistentes de codigo interactivos.

## Benchmarks y rendimiento

| Benchmark | MXFP4 plano | NVFP4 | QADv1 (este modelo) | QADv1 vs MXFP4 plano [IC 95%] |
|---|---|---|---|---|
| DeepSWE (113 tareas, 2 ejecuciones) | 58,4% | 60,2% | 61,5% | +3,1 [−4,0, +10,2] |

Notas de la model card: la estimacion puntual supera al MXFP4 plano y esta en linea o ligeramente por encima de NVFP4, pero no es estadisticamente significativa con el tamano de este benchmark. Todas las ejecuciones usaron el mismo setup vLLM ROCm A4W4 (receta `a4w4_reproduce`), con NVFP4 emulado sobre MI350. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 239,5 GB en safetensors; se requiere un conjunto de GPUs cuyo total de memoria cubra los pesos mas la cache KV. El ejemplo oficial usa `--tensor-parallel-size 4`, lo que implica al menos 4 aceleradores.
- GPU recomendadas: AMD Instinct MI350 y MI355, unicas microarquitecturas soportadas segun la model card.
- GPU de consumo: no cabe en GPUs de consumo; el modelo esta disenado exclusivamente para aceleradores Instinct MI350/MI355.
- Opciones de despliegue: vLLM sobre ROCm con `VLLM_ROCM_USE_AITER=1`, `--block-size 128`, `--reasoning-parser minimax_m3`, `--disable-hybrid-kv-cache-manager` y configuracion especulativa `dspark` (`num_speculative_tokens` 7 en servicio, 3 en evaluacion, `attention_backend` FLASHINFER_TS en servicio o TRITON_ATTN en evaluacion, `kv_cache_dtype` fp8).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Formato de cuantizacion | DeepSWE | Hardware | Licencia |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-MXFP4-QADv1 (este) | 220,5 mil millones | MXFP4 puro A4W4 + QAD | 61,5% | AMD MI350/MI355 | minimax-community |
| amd/MiniMax-M3.1-Flash-Quark-MXFP4 | 220,5 mil millones (mismo base) | MXFP4 plano | 58,4% | AMD MI350/MI355 | minimax-community |
| MiniMaxAI/MiniMax-M3.1-Flash (NVFP4) | 220,5 mil millones (mismo base) | NVFP4 | 60,2% (emulado en MI350) | no especificado | minimax-community |

Las tres variantes comparten arquitectura y parametros; la diferencia esta en el esquema de cuantizacion y en el hardware objetivo. No se dispone de datos de contexto, parametros activos ni otros benchmarks para una comparacion mas amplia con modelos de otras familias.

## Limitaciones y advertencias

- La mejora de +3,1 puntos en DeepSWE respecto a MXFP4 plano no es estadisticamente significativa (intervalo de confianza [−4,0, +10,2] con 113 tareas y 2 ejecuciones); no debe interpretarse como una ventaja robusta.
- El modelo solo soporta las microarquitecturas AMD MI350 y MI355; no es desplegable en GPUs NVIDIA ni en hardware de consumo.
- La evaluacion NVFP4 se realizo en emulacion sobre MI350, no en hardware nativo, lo que limita la comparabilidad de esa cifra.
- Solo se ha publicado un benchmark (DeepSWE); no hay datos de MMLU, HumanEval, GSM8K ni de rendimiento multilingue.
- Los idiomas soportados no estan documentados en la informacion disponible, lo que impide garantizar cobertura linguistica en produccion.
- La licencia `minimax-community` (license: other) condiciona el uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse de forma independiente antes de un uso en produccion.
- La longitud de contexto no esta especificada, lo que impide planificar cargas con ventanas largas sin verificacion previa.
- El repositorio requiere `custom_code` y la libreria transformers, ademas de una build concreta de vLLM sobre ROCm; no es portable a otros motores sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/MiniMax-M3.1-Flash-MXFP4-QADv1
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Release MXFP4 de AMD (reemplazado por este): https://huggingface.co/amd/MiniMax-M3.1-Flash-Quark-MXFP4
- Documentacion de AMD-Quark: https://quark.docs.amd.com/latest/index.html
