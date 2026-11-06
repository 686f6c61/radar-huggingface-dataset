# AIArchiveInfo/MiniCPM-OCR-1.0-DSpark

## Resumen

MiniCPM-OCR-1.0-DSpark es la cabeza de borrador (draft head) para decodificacion especulativa del modelo MiniCPM-OCR 1.0, desarrollado por OpenBMB. No es un modelo OCR autonomo: se trata de un modelo auxiliar de 296,8 millones de parametros que propone tokens candidatos que el modelo principal de 1,3B verifica en una sola pasada, acelerando la generacion sin alterar la salida final. Este repositorio concreto lo publica el usuario AIArchiveInfo como espejo del original de OpenBMB.

La relevancia tecnica esta en el metodo DSpark de decodificacion especulativa: con esta cabeza, MiniCPM-OCR 1.0 mejora la eficiencia de procesamiento extremo a extremo en un 55%, alcanzando un throughput de aproximadamente 1,49x frente a PaddleOCR-VL-1.6 y 3,62x frente a MinerU2.5 Pro. Es, por tanto, una pieza de infraestructura para desplegar OCR multimodal de alta velocidad en produccion, no un modelo para usar de forma aislada.

Arquitectonicamente la cabeza se declara como `Qwen3DSparkModel` y hereda la pila del modelo base MiniCPM-OCR 1.0, un modelo multimodal image-text-to-text orientado a extraccion de texto y estructuracion de documentos en ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3DSparkModel (cabeza draft de decodificacion especulativa sobre MiniCPM-OCR 1.0) |
| Parametros totales | 296.837.889 (296,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para la cabeza; el ejemplo de servicio del modelo principal configura 40.960 tokens (`--max-model-len 40960`) |
| Tipos de cuantizacion | BF16 en este repo; existe una build GGUF de la cabeza DSpark en `openbmb/MiniCPM-OCR-1.0-DSpark-gguf` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

La cabeza DSpark consta de 5 capas de borrador que proponen 15 tokens por pasada forward. Toma estados ocultos de las capas `[3, 7, 11, 15, 19]` del modelo objetivo (MiniCPM-OCR 1.0, 1,3B) y los proyecta mediante un modulo `fc`. Incluye `lm_head`, cabezas Markov, una cabeza de confianza y el tensor de mapeo `d2t`. El vocabulario de entrada es de 248.100 tokens, mientras que la salida del borrador (LM head y filas Markov) esta recortada a 114.688 tokens.

Un detalle critico de implementacion: en este checkpoint el tensor `d2t` esta codificado en forma de delta (`target_id - draft_id`) y debe convertirse a IDs absolutos (`d2t[i] + i`) antes de usarse. El fichero `local-to-target.json` contiene los 114.688 IDs objetivo absolutos y sirve como referencia de verificacion; la build GGUF ya aplica esta conversion. El checkpoint incluye un `export-audit.json` con hashes de pesos y mapeos y cobertura de vocabulario.

No se dispone de informacion sobre el dataset de entrenamiento de la cabeza, numero de tokens, composicion ni si hubo RLHF/DPO. El modelo base MiniCPM-OCR 1.0 es un transformer multimodal de 1,3B orientado a OCR; la cabeza se entrena especificamente para imitar la distribucion de tokens del objetivo y maximizar la tasa de aceptacion en verificacion.

## Capacidades

- Aceleracion de decodificacion especulativa: propone 15 tokens por pasada que el modelo principal verifica en paralelo.
- Mejora de eficiencia extremo a extremo del 55% y throughput de ~1,49x frente a PaddleOCR-VL-1.6 y ~3,62x frente a MinerU2.5 Pro, segun la model card.
- Integracion con vLLM mediante `--speculative-config` con metodo `dspark` y `num_speculative_tokens: 15`.
- Soporte de verificacion adaptativa configurable (`enable_adaptive_verification`).
- Capacidad OCR multimodal (image-text-to-text) heredada del modelo principal, con soporte de multiples imagenes por peticion via `max_slice_nums`.
- Idiomas: ingles y chino.
- No es un modelo autonomo: no genera texto por si mismo, requiere emparejarse con MiniCPM-OCR 1.0 de la misma release.
- No se documentan tool calling, function calling, agentes ni modo thinking en la informacion disponible (el ejemplo de servicio desactiva thinking con `enable_thinking: false`).

## Casos de uso

- Digitalizacion masiva de documentos: desplegar MiniCPM-OCR 1.0 con esta cabeza en vLLM para procesar lotes de facturas, formularios o PDFs escaneados, reduciendo el coste por pagina gracias al 55% de mejora de eficiencia.
- Pipeline de extraccion de datos en tiempo real: usar DSpark para servir OCR con baja latencia en APIs de parsing documental, donde el throughput de 1,49x-3,62x frente a alternativas se traduce en menor numero de GPUs necesarias.
- Migracion desde PaddleOCR-VL o MinerU: sustituir esos sistemas por MiniCPM-OCR 1.0 + DSpark en entornos que ya usan vLLM, aprovechando la configuracion de decodificacion especulativa documentada.
- Procesamiento de documentos largos: con contexto configurado a 40.960 tokens y `max_slice_nums: 9`, manejar documentos multipagina o con muchas regiones de texto en una sola peticion.
- Servicio OCR para mercados en ingles y chino: atender cargas bilingues (en/zh) con un unico modelo, sin necesidad de pipelines separados por idioma.
- Aceleracion de backends de RAG documental: integrar el par modelo principal + DSpark como extractor de texto en sistemas de recuperacion aumentada, donde la latencia de ingestion importa.
- Investigacion en decodificacion especulativa: usar la cabeza como referencia para estudiar tecnicas de draft modeling con mapeo de vocabulario recortado (`d2t`), cabezas Markov y verificacion adaptativa.

## Benchmarks y rendimiento

La model card solo publica metricas relativas de throughput, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares).

| Metrica | Valor |
|---|---|
| Mejora de eficiencia extremo a extremo | +55% |
| Throughput vs. PaddleOCR-VL-1.6 | ~1,49x |
| Throughput vs. MinerU2.5 Pro | ~3,62x |
| Tokens propuestos por pasada | 15 |
| Capas del borrador | 5 |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- La cabeza en BF16 ocupa aproximadamente 0,6 GB (tamano del repo), por lo que su VRAM adicional es marginal frente al modelo principal de 1,3B.
- El consumo dominante es el del modelo objetivo MiniCPM-OCR 1.0 en BF16; no se especifica la VRAM total en la informacion disponible.
- GPU recomendadas: no disponible de forma explicita; por tamano, el par completo deberia caber en GPUs consumer de gama alta (RTX 4090, 24 GB) y en A100/H100 para despliegues de mayor concurrencia.
- Despliegue soportado: vLLM con `--speculative-config '{"method":"dspark", ...}'`; existe build GGUF para llama.cpp.
- Configuracion de referencia: `--max-model-len 40960`, `--max-num-batched-tokens 40960`, `--max-num-seqs 1`, `--trust-request-mm-kwargs`, `--mm-processor-kwargs '{"downsample_mode":"4x","max_slice_nums":9}'`.
- Latencia y throughput absolutos: no disponibles; solo se publican ratios relativos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Throughput relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 + DSpark | 1,3B + 296,8M draft | 40.960 (config. ejemplo) | 1,49x vs PaddleOCR-VL-1.6; 3,62x vs MinerU2.5 Pro | Apache 2.0 | Hugging Face, ModelScope, GGUF, AWQ, GPTQ |
| PaddleOCR-VL-1.6 | no disponible | no disponible | referencia (1x) | no disponible | no disponible |
| MinerU2.5 Pro | no disponible | no disponible | ~0,28x frente a MiniCPM-OCR+DSpark | no disponible | no disponible |
| MiniCPM-OCR 1.0 (sin DSpark) | 1,3B | 40.960 (config. ejemplo) | ~0,65x frente a la version con DSpark (derivado del +55%) | Apache 2.0 | Hugging Face, ModelScope |

Los datos de PaddleOCR-VL-1.6 y MinerU2.5 Pro no se detallan en la informacion proporcionada mas alla de los ratios de throughput.

## Limitaciones y advertencias

- No es un modelo autonomo: usarlo sin el checkpoint principal MiniCPM-OCR 1.0 correspondiente produce resultados invalidos.
- Requiere emparejar main y draft de la misma release; la model card prohibe explicitamente mezclar con otros checkpoints.
- El tensor `d2t` esta codificado en delta y debe convertirse a IDs absolutos antes de usarse; un error en este paso degrada la tasa de aceptacion o corrompe la salida.
- Solo soporta ingles y chino; no hay soporte multilingue documentado.
- No se publican benchmarks de calidad (precision OCR, CER/WER) ni evaluaciones de sesgo o alucinacion en la informacion disponible.
- El rendimiento reportado (+55%, 1,49x, 3,62x) procede del autor y no se ha verificado de forma independiente.
- La configuracion de ejemplo limita `--max-num-seqs 1`, lo que restringe la concurrencia; habria que validar el escalado en produccion.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y de las dependencias (vLLM, `trust-remote-code`).
- `--trust-remote-code` implica ejecutar codigo del repositorio; auditar antes de desplegar en entornos sensibles.
- Repositorio espejo con 14 descargas y 0 likes: baja validacion comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/AIArchiveInfo/MiniCPM-OCR-1.0-DSpark
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- DSpark original (OpenBMB): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- DSpark GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- GGUF del modelo principal: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
- AWQ W4A16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-AWQ
- GPTQ W4A16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-GPTQ
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- GitHub MiniCPM: https://github.com/OpenBMB/MiniCPM
- Documentacion de aceleracion DSpark: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md#3-start-the-service
- FAQ: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/faq_en.md
- Demo (Hugging Face Spaces): https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- Demo oficial (global): https://platform.modelbest.ai/console/playground/document-parse
- Demo oficial (CN): https://platform.modelbest.cn/console/playground/document-parse
- API gratuita: https://platform.modelbest.ai/console/docs/api/document-parse
- ModelScope: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-DSpark
- Licencia: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/LICENSE
