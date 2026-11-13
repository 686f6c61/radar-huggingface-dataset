# hUh63/Qwen3.8-4B-Distill-Decensored-MTP-Q4_K_M-GGUF

## Resumen

Qwen3.8-4B-Distill-Decensored-MTP-Q4_K_M-GGUF es una cuantización GGUF del modelo `empero-ai/Qwen3.8-4B-Distill`, una destilación de parámetros completos de un modelo mayor (Qwen3.8 2.4T-A95B) sobre la arquitectura de `Qwen/Qwen3.5-4B` del equipo Qwen (Alibaba). Sobre esa base, el autor hUh63 aplica un proceso de "decensoring" con la herramienta Heretic v2.1.0.dev0 (snapshot de desarrollo, no versión estable) y publica el resultado en formato Q4_K_M para llama.cpp, con la particularidad de conservar la cabeza MTP (multi-token prediction) integrada en el propio archivo.

El interés técnico principal reside en dos decisiones: por un lado, la preservación byte a byte de las 15 matrices `mtp.*` del checkpoint original (que transformers 5.22.2 no mapea en su `state_dict`), reconstruidas mediante un shard de parcheo que ordena al final; por otro, la elevación de toda la capa MTP (`blk.32.*`) a Q8_0 mediante `--tensor-type-file`, con el objetivo de estabilizar la aceptación del borrador en decodificación especulativa. El resultado es un único archivo GGUF que permite decodificación especulativa sin modelo borrador separado ni flag `-md`.

Se trata, sin embargo, de un artefacto experimental: el propio autor advierte que debilita deliberadamente la alineación de seguridad del modelo fuente, que la cuantización Q4_K_M es con pérdida y que no se ha ejecutado ningún benchmark estándar (MMLU, GSM8K, etc.). La licencia es Apache-2.0, heredada de la línea base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el pipeline declarado es `image-text-to-text` (multimodal con visión).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B) con cabeza MTP/NextN integrada (1 capa, `mtp_num_hidden_layers = 1`); proyector de visión separado |
| Parametros totales | 333.514.240 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (tronco de texto, `general.file_type` 15 = MOSTLY_Q4_K_M); MTP en Q8_0; proyector de visión en F16; normas en F32 |
| Idiomas soportados | en, zh, ko, ja, ru, es, fr (y `ara` en los tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); dos archivos: tronco de texto + `mmproj` de visión |

## Arquitectura y entrenamiento

El modelo base es una destilación de parámetros completos de Qwen3.8 2.4T-A95B (un modelo de mezcla de expertos de gran escala) hacia la arquitectura densa de Qwen3.5-4B, realizada por Empero. Sobre esa arquitectura se conserva la cabeza MTP (NextN) del checkpoint original: 15 tensores `mtp.*` con una única capa oculta. En el GGUF resultante, `convert_hf_to_gguf.py` (`_QwenMtpMixin`) eleva `block_count` de 32 a 33 y mapea `mtp.*` a `blk.32.nextn.*`, `blk.32.attn_*` y `blk.32.ffn_*`. Las dos normas pre-fc se asignan de forma cruzada (`enorm` ← `mtp.pre_fc_norm_embedding`, `hnorm` ← `mtp.pre_fc_norm_hidden`); un intercambio de nombres produce un archivo que carga pero genera borradores de baja calidad. El GGUF declara `qwen35.nextn_predict_layers = 1`.

El proceso de decensoring emplea Heretic v2.1.0.dev0 (commit `75a640b7eb`, ARA estándar + scorers estándar + Optuna TPE), con datasets de sonda de mlabonne y una configuración reducida a 8 trials, batch 4 y generaciones de 16 tokens para ajustarse a 8 núcleos de CPU y 16 GiB de RAM (22 minutos, pico de RSS de 9,1 GB). Solo 14 de las 64 matrices candidatas fueron modificadas; el resto del checkpoint (torre de visión, embeddings, normas y las 15 matrices MTP) permanece byte-idéntico al original, con SHA256 documentados en `heretic_ara_report.json`. La cuantización se realizó con imatrix sobre un corpus multilingüe, matemático, de código y razonamiento, con `--nextn` para que la capa MTP también recibiera estadísticas de importancia. No se documenta en la información disponible el número de tokens de entrenamiento del modelo base ni la composición del dataset de destilación.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con cadena de pensamiento (chain-of-thought), según los tags del repositorio.
- Comprensión de imágenes y texto (pipeline `image-text-to-text`, proyector de visión F16 de 298 tensores y 672.422.944 bytes).
- Tool calling y function calling.
- Decodificación especulativa con cabeza MTP integrada en el mismo archivo GGUF (sin modelo borrador separado).
- Soporte multilingüe declarado: inglés, chino, coreano, japonés, ruso, español y francés (más `ara` en los tags).
- Generación sin las restricciones de alineación de seguridad del modelo fuente (decensored/abliterated).

## Casos de uso

- Investigación sobre alineación y decensoring: el repositorio incluye la configuración completa de Heretic (`config.toml`), los 8 trials de Optuna (`heretic_study.json`) y el informe ARA con diferencias por matriz, lo que permite reproducir y auditar exactamente qué pesos se modificaron y cuáles no.
- Evaluación de decodificación especulativa con MTP en llama.cpp: al llevar la cabeza NextN dentro del GGUF y en Q8_0, sirve para medir tasas de aceptación del borrador sin gestionar un segundo modelo; útil para comparar configuraciones de precisión de la capa MTP.
- Despliegue local en hardware modesto: con 3,5 GB de repositorio y cuantización Q4_K_M, el tronco de texto cabe en equipos de consumo; adecuado para prototipos de asistentes conversacionales en local.
- Procesamiento de documentos con imagen: el `mmproj` F16 permite tareas de image-text-to-text (descripción de capturas, extracción de información de figuras) en pipelines con llama.cpp.
- Automatización con herramientas: sus capacidades de tool calling y function calling permiten integrarlo en agentes que invocan APIs o scripts, con la salvedad de que no hay benchmarks que validen la calidad tras la cuantización.
- Experimentación multilingüe: cubre siete idiomas declarados, lo que permite probar flujos de traducción o atención al cliente en español, francés, ruso, japonés, coreano y chino con un único modelo.
- Estudio de robustez de cuantización: los archivos `calibration.txt`, `perplexity-corpus.txt` y `tensor_types.txt` permiten replicar el cálculo de perplejidad y comparar el efecto del Q4_K_M frente al BF16 de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ejecutó ningún benchmark estándar (MMLU, GSM8K, etc.) y advierte de que no debe asumirse que la capacidad equivale a la del original alineado. El repositorio incluye un corpus de perplejidad (`perplexity-corpus.txt`) y un script de reevaluación (`eval_official.py`) con marcadores de rechazo y KL del primer token, pero los resultados numéricos no se recogen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,5 GB; el tronco de texto Q4_K_M más el `mmproj` F16 (aproximadamente 0,67 GB) requieren en torno a 4-5 GB de memoria para inferencia, aunque la cifra exacta no está publicada.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo es apto para GPUs de consumo con 6-8 GB o más, y para A100/H100 en despliegues con concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, dado el tamaño del archivo.
- Opciones de despliegue: llama.cpp (formato nativo, con soporte de la cabeza NextN); no se confirma compatibilidad con vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La build se realizó en CPU (8 núcleos AMD EPYC 9754, AVX-512/VNNI, 16 GiB RAM, sin GPU), pero no se publican cifras de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Distill-Decensored-MTP-Q4_K_M (este) | 333.514.240 | No disponible | Apache-2.0 | GGUF Q4_K_M + mmproj F16 | Decensored con Heretic v2.1.0.dev0; MTP integrado en Q8_0 |
| empero-ai/Qwen3.8-4B-Distill | No disponible | No disponible | Apache-2.0 | Safetensors (BF16) | Modelo fuente alineado; sin decensoring ni cuantización |
| Qwen/Qwen3.5-4B | No disponible | No disponible | No disponible | No disponible | Arquitectura base del equipo Qwen; referencia de capacidades originales |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a linaje, licencia y formato.

## Limitaciones y advertencias

- El build debilita deliberadamente la alineación de seguridad del modelo fuente; el riesgo de cumplimiento es responsabilidad del usuario.
- La cuantización Q4_K_M es con pérdida; no se ha verificado que la capacidad se mantenga respecto al BF16 original.
- No se ejecutaron benchmarks estándar, por lo que no hay evidencia publicada de calidad en MMLU, GSM8K, HumanEval ni tareas similares.
- Heretic v2.1.0.dev0 es un snapshot de desarrollo, no una versión estable; los resultados pueden no ser reproducibles con versiones posteriores.
- Riesgo de alucinación inherente a los modelos de 4B y potencialmente agravado por la cuantización y el decensoring.
- Longitud de contexto no documentada en la información disponible; no debe asumirse una ventana larga.
- El pipeline declarado es `image-text-to-text`, pero no se publican evaluaciones de calidad de la torre de visión tras la conversión.
- La licencia Apache-2.0 se hereda de la línea base, pero el uso comercial de un modelo decensored puede conllevar obligaciones adicionales según la jurisdicción y el caso de uso.
- El repositorio registra 0 descargas y 0 likes: no hay validación comunitaria ni informes independientes de funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hUh63/Qwen3.8-4B-Distill-Decensored-MTP-Q4_K_M-GGUF
- Modelo base destilado: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill
- Arquitectura base: https://huggingface.co/Qwen/Qwen3.5-4B
- Heretic (p-e-w): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia del modelo base: https://huggingface.co/empero-ai/Qwen3.8-4B-Distill/raw/main/README.md
- Perfil de mlabonne (datasets de sonda): https://huggingface.co/mlabonne
