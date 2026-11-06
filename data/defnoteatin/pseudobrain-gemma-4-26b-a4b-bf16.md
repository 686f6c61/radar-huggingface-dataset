# defnoteatin/PseudoBrain-Gemma-4-26B-A4B-BF16

## Resumen

PseudoBrain-Gemma-4-26B-A4B-BF16 es un derivado del modelo multimodal Gemma 4 26B-A4B de Google, publicado por el desarrollador independiente Ian Kurt Galeon (defnoteatin) bajo licencia Gemma. El modelo parte de los checkpoints oficiales de Google y de las variantes cuantizadas de RedHatAI y cyankiwi, y aplica encima la arquitectura propietaria PseudoBrain, orientada a reducir el coste de memoria del KV cache en contextos extremadamente largos. La innovación principal es la sustitución de las capas de atención global por un esquema híbrido de ventana deslizante más Gated DeltaNet paralelo, con un estado recurrente de tamano fijo.

El resultado declarado por el autor es que el modelo puede servir contextos de hasta 1.048.576 tokens con un consumo total de VRAM de aproximadamente 54,5 GB en esta edición BF16, y de unos 17,5 GB en las ediciones cuantizadas del mismo proyecto. Esto lo situa en una categoria poco habitual: un MoE multimodal de 25,95 mil millones de parametros totales con licencia abierta que aspira a despliegues de contexto de un millon de tokens en hardware de una sola GPU.

La relevancia actual del modelo es doble. Por un lado, demuestra una via tecnica concreta para desacoplar el coste del contexto largo del tamano del KV cache mediante memoria exacta por paginas y estado recurrente constante. Por otro, su naturaleza de experimento de investigacion implica que las cifras de rendimiento y las garantias de calidad deben tratarse con cautela: el repositorio no incluye resultados de benchmarks estandarizados y el numero de descargas es muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con 30 capas: 25 capas de atención de ventana deslizante (SWA) nativa y 5 capas globales convertidas a SWA de 16K más Gated DeltaNet paralelo y Quest Exact Memory |
| Parametros totales | 25.950.689.646 (aproximadamente 25,95 mil millones) |
| Parametros activos | Aproximadamente 3,8 mil millones (denominacion A4B del modelo base) |
| Longitud de contexto | Hasta 1.048.576 tokens (1M), segun la model card |
| Tipos de cuantizacion | BF16 en este repositorio; el proyecto publica ademas ediciones FP8, NVFP4 y W4A16; los checkpoints base incluyen AWQ 4-bit, FP8 dynamic y NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | Gemma (terminos de licencia de Google) |
| Formato de pesos | safetensors; libreria de despliegue vLLM |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma 4 26B-A4B, un Mixture of Experts multimodal con aproximadamente 26 mil millones de parametros totales y unos 3,8 mil millones activos por token. La modificacion de PseudoBrain afecta a las cinco capas de atención global del modelo base (indices 5, 11, 17, 23 y 29, con head_dim de 512), que se convierten en atención de ventana deslizante de 16.384 tokens combinada con un Gated DeltaNet paralelo. El estado recurrente del Gated DeltaNet tiene tamano fijo O(1), independientemente de si el contexto es de 4K o de 1M tokens, lo que elimina el crecimiento lineal del KV cache en esas capas.

Sobre las capas de anclaje dispersas se aplica un mecanismo de memoria exacta por paginas denominado Quest, con tres niveles de almacenamiento (NVMe y page cache) y limites jerarquicos en bf16. Cada consulta atiende a una combinacion de cuatro sinks de StreamingLLM, puntos de referencia de superbloques, las paginas top-k de memoria exacta y una ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con merge de LSE. El reposicionamiento RoPE por bloques no solapados mantiene la continuidad local y una fidelidad de distancia temporal del 99 por ciento o superior a 1M de tokens, segun el autor.

El autor declara una reduccion del 90,2 por ciento en memoria de KV cache a 1M de tokens (de unos 22,5 GB a unos 2,2 GB) y un modo de decodificacion de velocidad constante que desacopla el presupuesto de recuperacion en prefill del presupuesto fijo en decodificacion. No se especifican en la informacion disponible los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO; el modelo es un derivado de pesos, no un reentrenamiento.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno, heredados del modelo base Gemma 4 26B-A4B instruct.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con entrada multimodal.
- Contexto extremadamente largo de hasta 1M de tokens con memoria de estado constante en las capas convertidas.
- Recuperacion de informacion sobre historicos extensos mediante memoria exacta por paginas y puntos de referencia de superbloques.
- Razonamiento multi-paso sobre cientos de bloques distintos gracias a los barridos de conjunto de trabajo con rotacion por novedad.
- Compatibilidad con el servidor OpenAI de vLLM a traves del plugin pb27_vllm, con soporte para los runners V1 y V2.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto, el modelo puede ingerir un arbol de fuentes entero y responder preguntas transversales sobre dependencias, duplicaciones o deuda tecnica sin trocear el codigo en fragmentos que pierdan coherencia global.
- Revision de contratos y expedientes legales extensos: la memoria exacta por paginas permite localizar clausulas concretas dentro de documentos de cientos de miles de tokens manteniendo la referencia temporal entre secciones, algo que los esquemas de ventana deslizante pura pierden.
- Auditoria de registros y trazas de produccion: el estado recurrente de tamano fijo permite procesar flujos de logs de un millon de tokens con un consumo de VRAM acotado, adecuado para diagnosticos de incidentes sobre historicos completos.
- Asistentes sobre bases documentales on-premise: la edicion BF16 cabe en una A100 o H100 de 80 GB y las ediciones cuantizadas en GPUs de 24 GB, lo que habilita despliegues privados con contexto largo sin depender de servicios externos.
- Analisis multimodal de documentos escaneados: al ser image-text-to-text, puede procesar capturas de pantalla, diagramas o paginas escaneadas junto con texto largo en una misma sesion.
- Investigacion sobre eficiencia de inferencia: sirve como banco de pruebas reproducible para estudiar el impacto de Gated DeltaNet, Quest Exact Memory y el reposicionamiento RoPE por bloques en tareas de recuperacion a larga distancia.
- Generacion de informes a partir de historiales de conversacion: la decodificacion de velocidad constante permite mantener sesiones de agente prolongadas sin que el coste por token generado crezca con el historial acumulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de "Benchmark Receipts" en el directorio `reports/` del repositorio de GitHub del proyecto, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K ni de tareas de recuperacion a contexto largo en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en esta edicion BF16: aproximadamente 51,0 GB de pesos y unos 54,5 GB totales a 1.000.000 tokens, segun la tabla del autor.
- GPUs objetivo para BF16: A100 y H100 de 80 GB, DGX Spark de 128 GB y AMD MI300X.
- Ediciones alternativas del mismo proyecto: FP8 con unos 30,0 GB totales (RTX 5090 de 32 GB, L40S, A100, H100, DGX Spark, MI300X); NVFP4 y W4A16 con unos 17,5 GB totales (RTX 3090 y 4090 de 24 GB, RTX 4080 de 16 GB, RX 7900 XTX de 24 GB, y en NVFP4 las Blackwell RTX 5080 y 5090, DGX Spark GB10 y B200).
- Cabe en GPU de consumo unicamente en las ediciones cuantizadas NVFP4 y W4A16, no en esta edicion BF16.
- Despliegue: vLLM con el plugin pb27_vllm, instalable mediante `pip install --no-deps` desde el subdirectorio `serving/pb27_vllm` del repositorio de GitHub. El arranque recomendado usa `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G` y `--max-num-seqs 16`.
- Compatibilidad declarada con NVIDIA CUDA y AMD ROCm, con soporte para los runners V1 y V2 de vLLM y un fallback basado en ForwardContext sin hooks.
- Latencia y throughput: no disponibles. El autor afirma decodificacion de velocidad constante a 1M de tokens, pero no publica tokens por segundo ni latencias de prefill en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-Gemma-4-26B-A4B-BF16 | 25,95B | ~3,8B | 1.048.576 tokens (segun autor) | Gemma | Hugging Face, plugin vLLM propio |
| Gemma 4 26B-A4B-it (modelo base) | 25,95B | ~3,8B | No disponible en la informacion | Gemma | Hugging Face |
| RedHatAI Gemma-4-26B-A4B-it-FP8-dynamic | 25,95B | ~3,8B | No disponible en la informacion | Gemma | Hugging Face |
| cyankiwi Gemma-4-26B-A4B-it-AWQ-4bit | 25,95B | ~3,8B | No disponible en la informacion | Gemma | Hugging Face |

La comparacion con el modelo base y sus cuantizaciones es la mas directa, ya que PseudoBrain reutiliza sus pesos y solo modifica el mecanismo de atención y memoria. Frente a ellos, la diferencia declarada esta en el coste de KV cache a contexto largo y en el contexto maximo soportado, no en el conocimiento adquirido durante el entrenamiento. No se dispone de datos de rendimiento comparativo que permitan cuantificar la perdida o ganancia de calidad respecto al modelo original.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados en la informacion disponible, por lo que el rendimiento real en tareas estandar y en recuperacion a contexto largo no esta verificado de forma independiente.
- El modelo es un derivado de pesos con modificaciones arquitectonicas profundas; la calidad puede degradarse respecto a Gemma 4 26B-A4B original en tareas que dependan de atención global completa, especialmente en las cinco capas convertidas.
- El repositorio tiene 28 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- El despliegue requiere el plugin pb27_vllm, con instrucciones de instalacion desde GitHub y variables de entorno especificas; no funciona con una instalacion estandar de vLLM sin el plugin.
- La configuracion recomendada desactiva el prefix caching y fuerza el modo eager, lo que limita optimizaciones habituales de produccion.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribucion; es necesario revisar los terminos de Google antes de cualquier despliegue en producto.
- Los idiomas soportados no estan documentados en la informacion disponible.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este derivado; deben asumirse los del modelo base Gemma 4, no detallados en el material proporcionado.
- El soporte de tool calling, function calling y agentes no esta confirmado en la informacion disponible.
- Las cifras de VRAM y de reduccion de KV cache proceden del autor y no han sido replicadas de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-BF16
- Repositorio GitHub del proyecto: https://github.com/defnotean/pseudobrain
- Plugin vLLM pb27_vllm: https://github.com/defnotean/pseudobrain/tree/main/serving/pb27_vllm
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
- Edicion FP8: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-FP8
- Edicion NVFP4: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-26B-A4B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Base cuantizada AWQ 4-bit: https://huggingface.co/cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit
- Base cuantizada FP8 dynamic: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-FP8-dynamic
- Base cuantizada NVFP4: https://huggingface.co/RedHatAI/gemma-4-26B-A4B-it-NVFP4
