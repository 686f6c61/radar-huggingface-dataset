# nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2 es un modelo borrador (*draft model*) de decodificación especulativa publicado por NVIDIA para acelerar la inferencia de NVIDIA-Nemotron-3.5-Transcribe-30B-A4B, un modelo de reconocimiento automático del habla (ASR) de 30.000 millones de parámetros totales con 4.000 millones activos (MoE). El borrador propone varios tokens por paso que el modelo principal verifica después, de modo que la salida final coincide con la del modelo principal en decodificación voraz salvo por pequeñas diferencias numéricas. No es un modelo autónomo: no transcribe audio por sí solo y debe servirse junto al modelo principal.

Técnicamente se trata de un modelo de difusión por bloques DFlash2 de 6 capas y aproximadamente 570 millones de parámetros (570.642.688 según los pesos en safetensors), condicionado sobre los estados ocultos de las capas 1, 5, 19, 29, 41 y 51 del modelo principal. Genera hasta 15 tokens candidatos por paso, con 7 como valor recomendado de partida, y es compatible con el modelo principal en BF16, FP8 y NVFP4.

Su relevancia es práctica: en despliegues de ASR de gran volumen, la latencia de decodificación es el cuello de botella, y un borrador de este tamaño (1,1 GB de repositorio) añade una sobrecarga de memoria mínima frente a los 30B del modelo principal. Se distribuye bajo licencia OpenMDW-1.1 y está pensado para usarse con vLLM 0.32.0 y la rama principal de NeMo Speech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2, modelo borrador de difusión por bloques con 6 capas, condicionado sobre los estados ocultos de 6 capas del modelo principal (1, 5, 19, 29, 41 y 51) |
| Parametros totales | 570.642.688 (aproximadamente 570M) |
| Parametros activos | no aplica (no es MoE; el modelo principal asociado sí es MoE con 30B totales y 4B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El borrador se distribuye en BF16; es compatible con el modelo principal en BF16, FP8 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (license_name: openmdw-1.1) |
| Formato de pesos | safetensors |
| Longitud de borrador | Hasta 15 tokens por paso; 7 recomendado como punto de partida |
| Modelo principal requerido | nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B |
| Tamano del repositorio | 1,1 GB |
| Precisión de entrenamiento | BF16 |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa basado en DFlash2, una variante de difusión por bloques. Consta de 6 capas y se condiciona sobre los estados ocultos de las capas 1, 5, 19, 29, 41 y 51 del modelo principal Nemotron-3.5-Transcribe-30B-A4B, lo que le permite alinear sus propuestas con la distribución interna del modelo verificador. En cada paso propone hasta 15 tokens candidatos, que el modelo principal valida; el valor recomendado de partida es 7 tokens especulativos.

El entrenamiento se realizó para predecir las salidas voraces del modelo principal sobre ejemplos de la mezcla de ajuste supervisado del propio modelo principal. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el mecanismo de borrador por difusión de bloques con condicionamiento multi-capa, que sustituye al enfoque MTP (*multi-token prediction*) en el servidor vLLM y permite mantener la misma API de peticiones que el modelo principal.

## Capacidades

- Aceleración de decodificación especulativa para el modelo ASR Nemotron-3.5-Transcribe-30B-A4B: propone tokens que el modelo principal verifica.
- No realiza transcripción de audio de forma autónoma; hereda las capacidades del modelo principal (ASR) cuando se sirve junto a él.
- No modifica la API: las peticiones se envían exactamente igual que al modelo principal.
- Compatible con el modelo principal en BF16, FP8 y NVFP4.
- No soporta alineación de marcas de tiempo CTC (*word timestamps*) en la integración con vLLM; para ello debe usarse MTP o ninguna decodificación especulativa.
- Con decodificación voraz, la salida coincide con la del modelo principal sin decodificación especulativa, salvo diferencias numéricas menores: afecta a la velocidad, no a la precisión.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada directa ni modo de razonamiento para este borrador.

## Casos de uso

- Transcripción por lotes de gran volumen: servir el modelo principal con este borrador en vLLM reduce el coste por token generado en pipelines de ASR masivo, donde la latencia de decodificación domina el tiempo total.
- Subtitulado y transcripción en tiempo casi real: con 7 tokens especulativos por paso y verificación voraz, se mantiene la exactitud del modelo principal mientras se reduce el tiempo hasta la primera respuesta completa.
- Despliegue en producción con vLLM 0.32.0: se integra mediante `--speculative-config` con `"method":"dflash"`, sin cambios en el cliente ni en el esquema de peticiones.
- Servicios con restricciones de memoria: el borrador ocupa un repositorio de 1,1 GB en BF16, una sobrecarga pequeña frente a los 30B del modelo principal, lo que permite habilitar decodificación especulativa en nodos ya ajustados de VRAM.
- Evaluación comparativa de estrategias de decodificación: permite medir la longitud de aceptación y el *speedup* frente a MTP o a decodificación sin especulación sobre el mismo modelo principal.
- Transcripción de grabaciones cortas y consultas interactivas: la longitud de aceptación es mayor en grabaciones cortas que en largas, por lo que el beneficio es más claro en dictado, asistentes de voz y transcripción de clips.
- Entornos con cuantización del modelo principal: al ser compatible con BF16, FP8 y NVFP4, puede acompañar despliegues del modelo principal en cualquiera de esas precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la longitud de aceptación es menor en grabaciones largas que en cortas, y que el *speedup* depende de la carga de trabajo; no se proporcionan cifras concretas de aceleración ni de WER.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 1,1 GB en BF16 (570M parámetros), adicional a la memoria del modelo principal de 30B.
- VRAM total: dominada por el modelo principal Nemotron-3.5-Transcribe-30B-A4B; en BF16 requiere del orden de 60 GB solo para pesos, en FP8 unos 30 GB y en NVFP4 aproximadamente 15 GB, más caché KV y el borrador. Estas cifras son estimaciones por tamaño y no aparecen publicadas en la información disponible.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño del modelo principal, se orienta a GPU de centro de datos (A100, H100, H200, B200) y no a GPU de consumo.
- GPU de consumo: el borrador por sí solo cabría en cualquier GPU con más de 2 GB, pero no es funcional sin el modelo principal, que no cabe en GPU de consumo de 24 GB en BF16.
- Despliegue: vLLM 0.32.0 con el *model runner* V2 (requiere `unset VLLM_USE_V2_MODEL_RUNNER`) y la rama principal de NeMo Speech; se configura con `--speculative-config '{"method":"dflash","num_speculative_tokens":7,"model":"nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2"}'`. Requiere aplicar un parche al fichero `qwen3_dflash2.py` de vLLM para evitar fallos al finalizar peticiones.
- Latencia y throughput: no disponibles; dependen de la longitud de aceptación, que a su vez varía con la duración del audio.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2 | Borrador especulativo DFlash2 (6 capas) | 570M | no disponible | OpenMDW-1.1 | Hugging Face, requiere modelo principal |
| MTP de Nemotron-3.5-Transcribe-30B-A4B | Decodificación especulativa multi-token | no disponible | no disponible | OpenMDW-1.1 (modelo principal) | Integrado en el modelo principal; soporta marcas de tiempo CTC |
| Decodificación sin especulación | Inferencia estándar del modelo principal | 30B totales / 4B activos | no disponible | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada. La diferencia funcional documentada es que DFlash2 no soporta la alineación de marcas de tiempo CTC, mientras que MTP sí.

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona junto a Nemotron-3.5-Transcribe-30B-A4B y fue entrenado contra ese checkpoint concreto; su aceleración sobre otros checkpoints no se ha medido.
- No soporta marcas de tiempo por palabra: la integración DFlash2 en vLLM no admite la alineación CTC; para ello debe usarse MTP o ninguna especulación.
- El *speedup* depende de la carga: la longitud de aceptación cae en grabaciones largas respecto a las cortas.
- Requiere vLLM 0.32.0 con un parche manual al código fuente (`qwen3_dflash2.py`); sin él, el servidor puede fallar al finalizar peticiones. El parche modifica código de vLLM bajo Apache 2.0, no bajo OpenMDW-1.1.
- Requiere el *model runner* V2 de vLLM y desactivar la alineación de marcas de tiempo CTC mediante `--hf-overrides '{"ctc_timestamps":{"enabled":false}}'`.
- La licencia OpenMDW-1.1 condiciona el uso comercial y no comercial; el usuario debe cumplirla junto con las licencias de terceros de los componentes distribuidos.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática específicos de este borrador; esas consideraciones corresponden al modelo principal.
- El modelo no mejora la precisión: cualquier error de transcripción proviene del modelo principal, no del borrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2
- Modelo principal: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Informe técnico de Nemotron 3.5 Transcribe: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Avisos de terceros: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2/blob/main/THIRD_PARTY_NOTICES.md
- Guía de contribución: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-DFlash2/blob/main/CONTRIBUTING.md
