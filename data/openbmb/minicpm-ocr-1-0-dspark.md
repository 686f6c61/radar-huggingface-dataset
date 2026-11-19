# openbmb/MiniCPM-OCR-1.0-DSpark

## Resumen

MiniCPM-OCR 1.0 DSpark es una cabeza de decodificacion especulativa (draft model) publicada por OpenBMB para acompanar al modelo principal MiniCPM-OCR 1.0, un modelo multimodal de 1.3B parametros especializado en reconocimiento optico de documentos. No es un modelo autonomo: propone tokens candidatos que el checkpoint principal verifica en una sola pasada, acelerando la generacion sin alterar el resultado final. Su publicacion responde a la necesidad de reducir la latencia en pipelines de parseo documental de alta carga.

La arquitectura es un transformer ligero de 5 capas y 296,8 millones de parametros, derivado del modelo base mediante fine-tuning y equipado con una cabeza de salida recortada a 114.688 tokens sobre un vocabulario de entrada de 248.100. Genera 15 tokens borrador por pasada hacia delante y consume los estados ocultos de las capas 3, 7, 11, 15 y 19 del modelo objetivo, en precision BF16.

Su relevancia practica es inmediata: segun el autor, la incorporacion de esta cabeza mejora la eficiencia de procesamiento de extremo a extremo de MiniCPM-OCR 1.0 en un 55%, con un throughput de aproximadamente 1,49x frente a PaddleOCR-VL-1.6 y 3,62x frente a MinerU2.5 Pro. La licencia Apache 2.0 y el soporte en vLLM, SGLang, llama.cpp y Ollama lo hacen desplegable en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer draft model para decodificacion especulativa (5 capas) |
| Parametros totales | 296.837.889 (296,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el draft; el modelo objetivo se sirve con `--max-model-len 40960` |
| Tipos de cuantizacion | BF16 (checkpoint publicado); build GGUF disponible segun la model card |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF mencionado en la model card |

## Arquitectura y entrenamiento

El modelo es una cabeza borrador de decodificacion especulativa con 5 capas transformer y 296,8 M de parametros. Se apoya en los estados ocultos de las capas `[3, 7, 11, 15, 19]` del modelo objetivo MiniCPM-OCR 1.0 (1.3B) para proponer hasta 15 tokens por pasada hacia delante. La cabeza de salida LM y las filas de salida Markov estan recortadas a 114.688 tokens, mientras que el vocabulario de entrada conserva los 248.100 tokens completos. El checkpoint se distribuye en BF16.

Un detalle tecnico critico es la codificacion del tensor `d2t`: en este checkpoint esta codificado en forma de delta (`target_id - draft_id`) y debe convertirse a IDs absolutos (`d2t[i] + i`) antes de su uso. El build GGUF ya realiza esta conversion, y `local-to-target.json` actua como referencia de verificacion con los IDs absolutos del modelo objetivo. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa sobre MiniCPM-OCR 1.0; no produce salida OCR por si mismo.
- Aceleracion de la inferencia del modelo objetivo sin modificar la distribucion de salida verificada.
- Propuesta de 15 tokens por pasada hacia delante, verificados en bloque por el modelo principal.
- Integracion con el pipeline de parseo documental en dos etapas del SDK `minicpm-ocr`: deteccion de layout con PP-DocLayoutV3 y reconocimiento de regiones por HTTP.
- Compatibilidad con vLLM mediante `--speculative-config '{"method":"dspark", ...}'`.
- Soporte de los idiomas del modelo objetivo: ingles y chino.
- No dispone de tool calling, capacidades de agente ni modos de razonamiento propios: hereda las del modelo base al que acompana.

## Casos de uso

- Parseo masivo de documentos en produccion: desplegar MiniCPM-OCR 1.0 con esta cabeza en vLLM permite procesar lotes de facturas, contratos o informes con un 55% mas de eficiencia de extremo a extremo, reduciendo el coste por pagina en entornos de digitalizacion.
- Digitalizacion de archivos historicos o administrativos: el pipeline en dos etapas separa la deteccion de layout (local, PaddlePaddle) del reconocimiento (servicio HTTP), de modo que se puede escalar horizontalmente el servicio de reconocimiento acelerado por DSpark sin tocar la capa de layout.
- Extraccion de tablas y formulas en documentacion tecnica: el modelo objetivo reconoce regiones de tabla y formula con prompts especificos por tipo; DSpark acelera la generacion de Markdown/JSON estructurado en cada region.
- Servicio de OCR como API interna: al ser compatible con vLLM y SGLang, se puede exponer un endpoint compatible con OpenAI y aplicar la decodificacion especulativa de forma transparente para los clientes.
- Procesamiento en el borde con llama.cpp u Ollama: el build GGUF y la existencia de una app iOS de demostracion permiten escenarios de parseo offline donde la latencia importa y no hay GPU de datacenter.
- Pipelines de ingestion documental para RAG: convertir PDFs e imagenes a Markdown en orden de lectura antes de trocear y embeddings; el throughput de 1,49x frente a PaddleOCR-VL-1.6 y 3,62x frente a MinerU2.5 Pro reduce el tiempo de reindexacion de corpus grandes.
- Investigacion sobre decodificacion especulativa: al ser un draft model aislado con mapeo `d2t` documentado y vocabulario recortado, sirve como caso de estudio reproducible para experimentos de acceptance rate y verificacion en bloque.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Mejora de eficiencia de extremo a extremo (MiniCPM-OCR 1.0 + DSpark) | 55% |
| Throughput relativo frente a PaddleOCR-VL-1.6 | ~1,49x |
| Throughput relativo frente a MinerU2.5 Pro | ~3,62x |
| Tokens borrador por pasada | 15 |
| Capas borrador | 5 |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; las cifras anteriores son relativas de throughput segun el autor.

## Requisitos de hardware

- VRAM del draft: aproximadamente 0,6 GB en BF16 (296,8 M parametros), segun el tamano del repositorio.
- VRAM del sistema completo: la del modelo objetivo MiniCPM-OCR 1.0 (1.3B) mas la del draft; en BF16 el conjunto ronda los 3-4 GB de pesos, mas cache KV y buffers multimodales.
- GPU recomendadas: A100, H100 o L40S para servicio concurrente; RTX 4090 valida para desarrollo y cargas moderadas.
- Cabe en GPU de consumo: si, el conjunto es ligero; el cuello de botella real es el procesador multimodal y la etapa de layout con PaddlePaddle.
- Opciones de despliegue: vLLM (con `--speculative-config '{"method":"dspark", ...}'`), SGLang, llama.cpp, Ollama e imagen Docker oficial.
- Parametros de servicio sugeridos en vLLM: `--max-model-len 40960`, `--max-num-batched-tokens 40960`, `--max-num-seqs 1`, `--mm-processor-kwargs '{"downsample_mode":"4x","max_slice_nums":9}'`.
- Latencia y throughput absolutos: no disponibles; solo se publican ratios relativos.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 DSpark | 296,8 M (draft) | Decodificacion especulativa para MiniCPM-OCR 1.0 | no disponible | Apache 2.0 | Requiere el checkpoint principal; +55% eficiencia |
| MiniCPM-OCR 1.0 | 1,3B | OCR multimodal de documentos | 40.960 tokens en servicio | Apache 2.0 | Modelo objetivo; pipeline en dos etapas |
| PaddleOCR-VL-1.6 | no disponible | OCR/VL de documentos | no disponible | no disponible | Referencia de throughput (1,49x menor segun el autor) |
| MinerU2.5 Pro | no disponible | Parseo de documentos | no disponible | no disponible | Referencia de throughput (3,62x menor segun el autor) |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el checkpoint MiniCPM-OCR 1.0 emparejado no produce salida util.
- El tensor `d2t` esta codificado en delta en este checkpoint; usarlo sin convertir a IDs absolutos (`d2t[i] + i`) produce tokens incorrectos. Verificar contra `local-to-target.json`.
- El vocabulario de salida esta recortado a 114.688 tokens; no cubre el vocabulario completo del modelo objetivo.
- Solo ingles y chino; el rendimiento en otros idiomas no esta documentado.
- Las cifras de aceleracion (55%, 1,49x, 3,62x) proceden del autor y no se han verificado de forma independiente; el acceptance rate real depende del dominio documental y de la temperatura de muestreo.
- El pipeline completo depende de PaddlePaddle/PaddleX para la etapa de layout, lo que anade una dependencia pesada en el entorno del SDK.
- No se han publicado evaluaciones de sesgo ni de tasas de alucinacion especificas para esta cabeza; al ser un draft verificado, no deberia alterar la fidelidad del modelo objetivo, pero conviene validar en produccion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de PP-DocLayoutV3 por separado.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- GitHub MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- Guia del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- Guia de despliegue: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md
- SDK en PyPI: https://pypi.org/project/minicpm-ocr/
- Agent Skill: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/SKILL_en.md
- Playground (global): https://platform.modelbest.ai/console/playground/document-parse
- Playground (CN): https://platform.modelbest.cn/console/playground/document-parse
- API docs (global): https://platform.modelbest.ai/console/docs/api/document-parse
- Demo iOS: https://github.com/OpenBMB/MiniCPM-V-Apps/blob/main/README.md#11-ios-demo
- Discord: https://discord.gg/JE8KQqtdn
