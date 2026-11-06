# BaoKhuong/parakeet-ctc-0.6b-vietnamese-GGUF

## Resumen

Parakeet CTC 0.6B Vietnamese es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura FastConformer-CTC, derivado del checkpoint oficial de NVIDIA `parakeet-ctc-0.6b-Vietnamese`. Este repositorio no contiene el modelo original, sino una conversión comunitaria al formato GGUF realizada por BaoKhuong mediante las herramientas de CrispASR, pensada para su uso con el motor CrispASR. El modelo suma 608.869.857 parámetros (aproximadamente 0,6 mil millones), lo que lo sitúa en la gama compacta de ASR y lo hace apto para despliegues con recursos moderados.

El problema que resuelve es la transcripción de voz en vietnamita con un motor ligero y portable, además de habilitar alineamiento forzado CTC experimental dentro de CrispASR. Su relevancia actual radica en que traslada un modelo ASR entrenado por NVIDIA a un ecosistema de inferencia local (GGUF) que no depende de NeMo ni de PyTorch, con dos variantes de cuantización disponibles. No es una release oficial de NVIDIA y no se reclama entrenamiento ni fine-tuning adicional por parte del conversor.

La ficha cubre exclusivamente la información publicada en el repositorio y la model card; cualquier dato no documentado se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CTC (layout GGUF de CrispASR) |
| Parametros totales | 608.869.857 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, q8_0 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (layout FastConformer-CTC de CrispASR); checkpoint original en NeMo |

## Arquitectura y entrenamiento

El modelo subyacente emplea FastConformer, una variante del Conformer con downsampling de la secuencia de entrada que reduce el coste computacional en tareas de speech, combinada con una cabeza CTC para decodificación sin atención autoregresiva. La conversión parte del checkpoint NeMo oficial `parakeet-ctc-0.6b-vi.nemo` y se realiza con `convert-stt-fastconformer-ctc-to-gguf.py --nemo <file> --output <f16.gguf>`, seguida de una cuantización con `crispasr-quantize <f16.gguf> <q8_0.gguf> q8_0`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus vietnamita, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de ajuste. La model card indica explícitamente que no se ha realizado entrenamiento ni fine-tuning adicional durante la conversión, por lo que las capacidades del GGUF equivalen a las del checkpoint NVIDIA de origen. Los ficheros GGUF resultantes usan el layout específico de CrispASR para FastConformer-CTC y no son intercambiables con pesos GGUF de Qwen3-ASR.

## Capacidades

- Reconocimiento automático del habla en vietnamita a partir de audio.
- Decodificación CTC, sin generación autoregresiva de tokens.
- Alineamiento forzado CTC experimental dentro de CrispASR, mediante el flag `-am` que acepta una ruta a un modelo alineador CTC.
- Integración con el motor CrispASR para transcripción local.
- No se documentan capacidades de traducción, diarización, detección de idioma, puntuación automática ni marcas de tiempo más allá del alineamiento CTC mencionado.
- No se documenta soporte de tool calling ni de agentes; no aplica a un modelo ASR.

## Casos de uso

- Transcripción de audio en vietnamita en local: el modelo permite convertir ficheros de voz a texto sin depender de servicios en la nube, usando los GGUF con CrispASR.
- Subtitulado y sincronización: el alineamiento forzado CTC experimental puede emplearse para obtener correspondencias entre audio y texto, aunque la calidad de las marcas de tiempo debe validarse de forma independiente.
- Despliegue en entornos con recursos limitados: la variante q8_0 (649.865.888 bytes) reduce el peso en disco y memoria frente a f16, lo que facilita su ejecución en máquinas modestas.
- Procesamiento por lotes de corpus vietnamitas: útil para transcribir grandes volúmenes de audio en pipelines offline con CrispASR.
- Integración en herramientas de edición de subtítulos: la model card menciona Subtitle Edit como escenario de compatibilidad, si bien advierte que dicha integración debe validarse de forma independiente.
- Evaluación comparativa de motores ASR: sirve como referencia compacta de FastConformer-CTC en vietnamita frente a otros modelos ASR dentro de CrispASR.
- Investigación sobre decodificación CTC: el modelo permite experimentar con alineamiento y decodificación CTC en un entorno GGUF ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER, CER ni comparativas con otros modelos, y advierte explícitamente que no se reclama ningún benchmark de compatibilidad o calidad de marcas de tiempo con modelos Qwen3-ASR, versiones concretas o integraciones con Subtitle Edit.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño de fichero, la variante q8_0 ocupa 649.865.888 bytes (aproximadamente 0,65 GB) y la f16 1.219.538.848 bytes (aproximadamente 1,22 GB); el consumo real de memoria depende del runtime y del audio procesado.
- GPU recomendadas: no disponible. Al tratarse de un modelo de 0,6 mil millones de parámetros, es plausible ejecutarlo en GPU de gama consumer, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU consumer: no verificada oficialmente; el tamaño del modelo sugiere que podría caber en GPU consumer, pero debe validarse.
- Opciones de despliegue: CrispASR, que es el motor para el que se generaron estos GGUF. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parakeet CTC 0.6B Vietnamese (esta conversion GGUF) | 608.869.857 | no disponible | nvidia-open-model-license | GGUF (CrispASR) | Conversion comunitaria, uso con CrispASR |
| NVIDIA Parakeet CTC 0.6B Vietnamese (upstream) | 0,6 B (aprox.) | no disponible | nvidia-open-model-license | NeMo | Checkpoint oficial de NVIDIA |
| Qwen3-ASR | no disponible | no disponible | no disponible | GGUF | Mencionado solo como referencia de incompatibilidad de layout |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es una release oficial de NVIDIA: es una conversión comunitaria de formato, sin entrenamiento ni fine-tuning adicional, y NVIDIA no la avala ni la soporta.
- Los GGUF usan el layout FastConformer-CTC de CrispASR y no son intercambiables con pesos GGUF de Qwen3-ASR.
- La compatibilidad y la calidad de marcas de tiempo con modelos Qwen3-ASR, versiones concretas o integraciones con Subtitle Edit deben validarse de forma independiente; no se reclama ningún benchmark al respecto.
- Cobertura lingüística limitada al vietnamita; no se documentan otros idiomas.
- No se dispone de información sobre sesgos, tasa de alucinación o robustez ante acentos, ruido o audio de baja calidad.
- La licencia NVIDIA Open Model License impone términos de redistribución y uso responsable que deben revisarse antes de un uso comercial; el repositorio incluye `NOTICE.txt` con la atribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso o validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BaoKhuong/parakeet-ctc-0.6b-vietnamese-GGUF
- Modelo upstream de NVIDIA: https://huggingface.co/nvidia/parakeet-ctc-0.6b-Vietnamese
- Herramientas CrispASR: https://github.com/CrispStrobe/CrispASR
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Perfil del conversor: https://huggingface.co/BaoKhuong
