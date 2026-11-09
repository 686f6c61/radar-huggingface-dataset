# intel-ai/DeepSeek-V3.2-NVFP4-E5M3-AutoRound

## Resumen

DeepSeek-V3.2-NVFP4-E5M3-AutoRound es una versión cuantizada del modelo DeepSeek-V3.2 publicada por el equipo de Intel (intel-ai) en Hugging Face. Se trata de un checkpoint de aproximadamente 350.870 millones de parámetros (350,87 B) generado mediante AutoRound, la herramienta de cuantización de Intel Neural Compressor, aplicando un esquema mixto: MXFP8 como formato por defecto y NVFP4-E5M3-GS (4 bits con escalas de bloque E5M3 y escalas globales FP32 por capa) para las capas MLP. Las capas `eh_proj`, `indexer` y `o_proj` se mantienen en BF16.

El objetivo de esta publicación es ofrecer una variante de DeepSeek-V3.2 con menor huella de memoria y mayor eficiencia de inferencia en hardware NVIDIA Blackwell (B200), manteniendo una precisión muy cercana a la referencia FP8. Según la model card, las evaluaciones realizadas muestran una retención de precisión de entre el 98,80 % y el 100,22 % respecto a la referencia FP8 en benchmarks como GPQA Diamond, AIME 2025, GSM8K, PIQA y LiveCodeBench v6.

El checkpoint ocupa aproximadamente 378 GB y está pensado para servirse con vLLM (probado con vLLM 0.31.0 y cuatro GPU NVIDIA B200 en tensor-parallel de 4). Requiere instalar el plugin QDQ de Intel Neural Compressor para registrar los esquemas AutoRound NVFP4, incluido `nvfp4_v2_gs`. La licencia del repositorio es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de DeepSeek-V3.2; detalles arquitectonicos del modelo base no disponibles en la informacion proporcionada) |
| Parametros totales | 350.870.071.552 (350,87 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 102.400 tokens en la configuracion de servicio probada (`--max-model-len 102400`) |
| Tipos de cuantizacion | MXFP8 (por defecto), NVFP4-E5M3-GS (capas MLP), BF16 (capas `eh_proj`, `indexer`, `o_proj`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato AutoRound), compatible con vLLM |

## Arquitectura y entrenamiento

Esta publicacion no entrena un modelo nuevo, sino que cuantiza el checkpoint DeepSeek-V3.2 mediante AutoRound en modo *model-free* (sin calibracion con datos, usando `--disable_opt_rtn`). La receta aplica MXFP8 a todos los modulos salvo las capas MLP, que reciben el esquema NVFP4_E5M3_GS: pesos en formato E2M1 con escalas de bloque E5M3 y escalas globales FP32 por capa, y activaciones con escalado global estatico. Las capas `eh_proj`, `indexer` y `o_proj` se excluyen de la cuantizacion y permanecen en BF16.

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de atencion, si es MoE, numero de capas, datos de entrenamiento, uso de RLHF/DPO o innovaciones como decodificacion especulativa). El comando de reproduccion de la cuantizacion esta documentado en la model card y permite regenerar el checkpoint a partir de `deepseek-ai/DeepSeek-V3.2`.

## Capacidades

- Generacion de texto en ingles y otros idiomas (herencia del modelo base DeepSeek-V3.2; lista concreta de idiomas no disponible).
- Razonamiento de varios pasos, con parser de razonamiento `deepseek_v3` habilitado en la configuracion de vLLM.
- Tool calling / function calling: la configuracion de servicio incluye `--tool-call-parser deepseek_v32` y `--enable-auto-tool-choice`.
- Capacidad de agente y razonamiento multi-paso (soportado por el parser de tool calling y el parser de razonamiento).
- Generacion y evaluacion de codigo (evaluado en LiveCodeBench v6).
- Razonamiento matematico y cientifico (evaluado en AIME 2025, GSM8K y GPQA Diamond).
- Soporte de contexto largo: hasta 102.400 tokens en la configuracion probada.

## Casos de uso

- **Atencion al cliente automatizada:** el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 102.400 tokens, manteniendo el hilo de la conversacion y el historial de interacciones sin truncamientos agresivos.
- **Generacion de codigo en produccion:** con soporte de tool calling y parser dedicado (`deepseek_v32`), puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o resolucion de issues, sirviendose mediante vLLM con API compatible con OpenAI.
- **Agentes autonomos multi-paso:** el parser de razonamiento `deepseek_v3` y el soporte de tool calling permiten construir agentes que planifican, invocan herramientas y razonan sobre los resultados en varios pasos.
- **Razonamiento matematico y cientifico asistido:** util para tutoria, resolucion de problemas de nivel competitivo (AIME) y analisis tecnico, con una precision retenida del 98,80 % respecto a FP8 en AIME 2025.
- **Analisis de documentos extensos:** con contexto de mas de 100.000 tokens, adecuado para resumir, extraer informacion o responder preguntas sobre contratos, informes o bases de codigo de gran tamano.
- **Evaluacion y benchmarking de modelos cuantizados:** el checkpoint sirve como referencia para comparar la degradacion de precision de esquemas NVFP4 frente a FP8 en hardware Blackwell, con resultados documentados en la model card.
- **Despliegue en infraestructura NVIDIA Blackwell:** pensado para servirse en B200 con tensor-parallel de 4 y KV cache en FP8, reduciendo el coste de memoria frente al checkpoint original.

## Benchmarks y rendimiento

Resultados publicados en la model card (media de 3 ejecuciones por benchmark, endpoint compatible con OpenAI sobre vLLM; LiveCodeBench usa el subconjunto v6):

| Benchmark | Muestras | Referencia FP8 | NVFP4-E5M3-GS (media 3 runs) | Relativo a FP8 |
|---|---:|---:|---:|---:|
| GPQA Diamond | 198 | 84,17 % | 83,67 % | 99,41 % |
| AIME 2025 | 30 | 92,22 % | 91,11 % | 98,80 % |
| GSM8K | 1.319 | 97,45 % | 97,17 % | 99,71 % |
| PIQA | 1.838 | 94,29 % | 94,21 % | 99,92 % |
| LiveCodeBench v6 | 175 | 80,39 % | 80,57 % | 100,22 % |

La referencia FP8 procede de la model card de Intel DeepSeek-V3.2 NVFP4 AutoRound y no se reejecuto en la misma sesion, por lo que la comparacion es indicativa y no un control experimental estricto.

## Requisitos de hardware

- **VRAM estimada:** el checkpoint pesa aproximadamente 378 GB; con tensor-parallel de 4 y KV cache en FP8 se sirvio en 4 GPU NVIDIA B200 con `--gpu-memory-utilization 0.90`.
- **GPU recomendadas:** NVIDIA B200 (configuracion probada). El esquema NVFP4 requiere soporte de hardware Blackwell para aprovechar el formato de 4 bits.
- **Consumer GPU:** no cabe en GPU de consumo; el tamano del checkpoint y la necesidad de NVFP4 descartan RTX 4090 y similares.
- **Opciones de despliegue:** vLLM 0.31.0 con el plugin QDQ de Intel Neural Compressor (`benchmark/vllm-qdq-plugin/`). Variables de entorno recomendadas: `VLLM_USE_DEEP_GEMM=0`, `NCCL_NVLS_ENABLE=0`.
- **Latencia y throughput:** no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V3.2-NVFP4-E5M3-AutoRound (este) | 350,87 B | hasta 102.400 tokens (config. probada) | MXFP8 + NVFP4-E5M3-GS + BF16 | MIT | Hugging Face (intel-ai) |
| DeepSeek-V3.2 (base) | no disponible | no disponible | BF16 (original) | MIT (segun repo derivado) | Hugging Face (deepseek-ai) |
| DeepSeek-V3.2-NVFP4-AutoRound (Intel) | no disponible | no disponible | NVFP4 (referencia FP8 citada) | MIT | Hugging Face (intel-ai) |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoria (mismo tamano o misma tarea) en terminos de rendimiento o contexto.

## Limitaciones y advertencias

- **Sesgos:** no documentados en la informacion proporcionada; al heredar el modelo base, es previsible que arrastre los sesgos del mismo.
- **Alucinacion:** riesgo inherente a los modelos generativos; no se documenta mitigacion especifica en esta publicacion.
- **Idiomas:** la lista de idiomas soportados no esta disponible en la informacion proporcionada.
- **Licencia:** MIT para este repositorio; deben revisarse los terminos del modelo base DeepSeek-V3.2 para uso comercial.
- **Dependencia de hardware:** el esquema NVFP4-E5M3-GS esta orientado a NVIDIA Blackwell; en otra hardware puede no ser explotable o requerir rutas alternativas.
- **Dependencia de software:** requiere vLLM 0.31.0 (probado) y el plugin QDQ de Intel Neural Compressor; sin el plugin, los esquemas AutoRound NVFP4 no se registran.
- **Comparacion de benchmarks:** la referencia FP8 no se reejecuto en la misma sesion, por lo que los ratios relativos son indicativos.
- **Tamano del checkpoint:** aproximadamente 378 GB, lo que exige almacenamiento y ancho de banda considerables para la carga.
- **Datos ausentes:** no se dispone de informacion sobre arquitectura interna, composicion del dataset de entrenamiento ni ajuste por RLHF/DPO del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/DeepSeek-V3.2-NVFP4-E5M3-AutoRound
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.2
- Intel Neural Compressor (repositorio): https://github.com/intel/neural-compressor
- Model card de referencia FP8 citada: https://huggingface.co/intel-ai/DeepSeek-V3.2-NVFP4-AutoRound
