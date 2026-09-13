# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4

## Resumen

AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4 es una cuantizacion de precision NVFP4 del modelo AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored, una variante "abliterated" (con los rechazos eliminados mediante edicion de pesos) de la familia Qwen3.6 de 27.000 millones de parametros. El autor, AEON-7, publica esta version para aprovechar las unidades de tensor FP4 nativas de las GPU Blackwell (DGX Spark / GB10, B100/B200, RTX PRO 6000 Blackwell), comprimiendo los pesos de 51 GB en BF16 a 26 GB en NVFP4, una reduccion del 49 por ciento, sin degradar la torre de vision ni las capas de atencion lineal.

El modelo es hibrido y multimodal: combina 16 capas de atencion completa con 48 capas de atencion lineal basadas en GatedDeltaNet (familia SSM/Mamba), y conserva la cabeza de vision en BF16. La cuantizacion NVFP4 se aplica unicamente a las proyecciones de salida de las capas de atencion completa y a todos los MLP, mientras que los modulos `linear_attn`, las normas, `lm_head` y `embed_tokens` permanecen en BF16 porque el estado recurrente de Mamba colapsa bajo FP4.

Es relevante ahora porque demuestra un patron de cuantizacion selectiva (cuantizar solo lo que tolera FP4 y preservar el resto en precision alta) sobre arquitecturas hibridas, y porque su ficha indica que ha sido superada por la linea Qwen3.8 del mismo autor, con una metodologia de cuantizacion mixta NVFP4 + FP8. Se distribuye bajo licencia Apache 2.0 y acumula 36.507 descargas y 90 "likes" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal: 16 capas de atencion completa + 48 capas de atencion lineal GatedDeltaNet (SSM tipo Mamba); clases `Qwen3_5ForConditionalGeneration` y `Qwen3_5DecoderLayer`; torre de vision integrada |
| Parametros totales | 27.356.728.560 (unos 27,36 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Hasta 256.000 tokens en la configuracion de despliegue de referencia (vLLM, `--max-model-len 256000`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 post-entrenamiento: formato de elemento E2M1, block_size=16, escalas por bloque FP8 E4M3, escala por tensor FP32, simetrica con signo. Vision, `linear_attn`, normas, `lm_head` y `embed_tokens` se conservan en BF16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con formato compressed-tensors (1 shard, 1.952 claves) |
| Tamano del repositorio | 27,7 GB |
| Modelo base | AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored (BF16, 51 GB) |
| Descargas / likes | 36.507 / 90 |
| Publicacion / actualizacion | 2026-04-24 / 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido con atencion dual. De las 64 capas del decodificador, 16 usan atencion completa y 48 usan atencion lineal GatedDeltaNet, un mecanismo de espacio de estados con compuerta delta que reduce el coste de memoria y computo en contextos largos frente a la atencion cuadratica convencional. El modelo es multimodal (`image-text-to-text`) e incluye torre de vision. Sobre el entrenamiento original no se proporciona informacion: no hay datos sobre numero de tokens, composicion del corpus, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Lo unico documentado es el proceso de "abliteration" (edicion de pesos para eliminar comportamientos de rechazo), que el autor reporta con una tasa de rechazo de 0/50 en el modelo fuente BF16.

La innovacion tecnica de esta publicacion es el esquema de cuantizacion selectiva. Se uso `llm-compressor 0.10.1.dev107` (vllm-project) con `QuantizationModifier(targets="Linear", scheme="NVFP4")`, excluyendo explicitamente `lm_head`, `embed_tokens`, toda la torre de vision (`visual.*`), los modulos de atencion lineal (`linear_attn.*`) y todas las normalizaciones. La calibracion empleo open-platypus con 512 muestras de 4096 tokens, y el pipeline fue `sequential` con `sequential_targets=["Qwen3_5DecoderLayer"]`, requisito para pilas hibridas: sin ese direccionamiento explicito, el descubrimiento automatico de llm-compressor omite capas silenciosamente. La verificacion posterior confirma 64 proyecciones de atencion completa cuantizadas (16 capas x 4 q/k/v/o), 432 claves `linear_attn.*` en BF16 (48 capas x 9 modulos), 333 claves `visual.*` en BF16, 319 claves de norma en BF16, y magnitudes de `input_global_scale` entre 142 y 346. El tiempo de cuantizacion fue de unos 57 minutos en una RTX PRO 6000 Blackwell de 96 GB. No se indica si hubo entrenamiento adicional tras la cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte declarado multilingue.
- Razonamiento multimodal: entrada de imagen y texto (`image-text-to-text`), con la torre de vision intacta en BF16.
- Procesamiento de contextos largos: la configuracion de referencia admite `--max-model-len 256000`.
- Tool calling / function calling: el despliegue de referencia activa `--enable-auto-tool-choice` y un parser de llamadas a herramientas (`--tool-call-parser qw...`).
- Uso como agente: la combinacion de contexto largo, tool calling y decodificacion especulativa (DFlash con `num_speculative_tokens: 10`) esta pensada para flujos multi-paso.
- Generacion sin rechazos: modelo "abliterated"/"uncensored", con tasa de rechazo reportada de 0/50 en el modelo fuente.
- Inferencia con decodificacion especulativa mediante un drafter externo (`z-lab/Qwen3.6-27B-DFlash`).
- Soporte de cache de estado recurrente en `float32` (`--mamba-cache-dtype float32`) para las capas SSM.
- No se documentan capacidades de audio, vision por video ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: con `--max-model-len 256000` el modelo puede mantener historiales de conversacion muy largos sin truncar, y el tool calling permite conectarlo a sistemas de ticketing o consulta de pedidos desde el propio dialogo.
- Agentes autonómos multi-paso: la combinacion de function calling, contexto largo y decodificacion especulativa permite cadenas de razonamiento y llamadas a herramientas con latencia reducida respecto a la generacion autoregresiva pura.
- Procesamiento de documentos con imagen y texto: al conservar la torre de vision en BF16, puede extraer informacion de capturas, formularios escaneados o diagramas y resumirlos en texto.
- Asistencia a la programacion en pipelines internos: sirve como backend de autocompletado o generacion de fragmentos en un servicio vLLM propio, con el modelo expuesto bajo varios alias (`aeon-ultimate`, `qwen36-ultimate`, `aeon-fast`, `aeon-deep`).
- Investigacion sobre cuantizacion: el repositorio documenta la receta exacta, los modulos excluidos y las comprobaciones de integridad, por lo que es un caso de referencia para estudiar NVFP4 en arquitecturas hibridas con SSM.
- Analisis de corpus en chino e ingles: al estar entrenado y evaluado para ambos idiomas, encaja en tareas de resumen, clasificacion y extraccion sobre documentacion bilingue.
- Despliegue en hardware Blackwell de una sola maquina: el modelo esta pensado para DGX Spark (GB10) con `--gpu-memory-utilization 0.65`, lo que permite servir un modelo de 27.000 millones de parametros en un equipo compacto.
- Generacion de contenido sin filtros editoriales: para casos donde se requiere texto sin rechazos temáticos, siempre que se cumplan las obligaciones legales aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor unicamente reporta una divergencia esperada de KL respecto al modelo fuente BF16 de hasta 0,001, ademas de la verificacion estructural de la cuantizacion (claves preservadas y magnitudes de escala). No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput medidos.

## Requisitos de hardware

- Pesos NVFP4: 26 GB en disco (frente a los 51 GB del modelo BF16 de origen), con repositorio de 27,7 GB.
- Hardware objetivo declarado: DGX Spark con GB10 y arquitectura sm_121a, B100/B200 y RTX PRO 6000 Blackwell, con soporte nativo de tensor cores FP4.
- El modelo BF16 de origen apuntaba a A100, H100 y RTX PRO 6000 en BF16; esta version NVFP4 esta pensada para las generaciones Blackwell.
- Cuantizacion realizada en 1 tarjeta RTX PRO 6000 Blackwell de 96 GB, con un tiempo de pared de aproximadamente 57 minutos.
- Configuracion de despliegue de referencia: `--gpu-memory-utilization 0.65`, `--max-model-len 256000`, `--max-num-seqs 64`, `--max-num-batched-tokens 16384`, `--enable-chunked-prefill`, `--enable-prefix-caching`, `--mamba-cache-dtype float32`.
- Encaje en GPU de consumo: no disponible. La informacion solo menciona hardware de centro de datos y estaciones Blackwell; no se confirma funcionamiento en RTX 4090 o similares, y tampoco se indica si existe una variante GGUF para llama.cpp u Ollama.
- Opciones de despliegue: vLLM con contenedor propietario `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` (Spark/GB10) o `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` (RTX discreta); soporte de `compressed-tensors` como backend de cuantizacion. Tambien se distribuye con `library_name: transformers`.
- Variables de entorno indicadas: `TORCH_CUDA_ARCH_LIST=12.1a`, `ENABLE_NVFP4_SM100=0`, `VLLM_USE_FLASHINFER_MOE_FP4=0`, `VLLM_USE_FLASHINFER_SAMPLER=1`, `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`. Se advierte de no forzar `VLLM_NVFP4_GEMM_BACKEND=marlin` en el contenedor parcheado, ya que el camino CUTLASS es mas rapido en SM121.
- Decodificacion especulativa: drafter externo `z-lab/Qwen3.6-27B-DFlash` con `num_speculative_tokens: 10` como valor validado.
- Latencia y throughput medidos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4 (este) | 27,36 B | NVFP4, vision y SSM en BF16 | hasta 256.000 tokens en el despliegue de referencia | apache-2.0 | HuggingFace, 26 GB, 36.507 descargas |
| AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored (origen BF16) | 27,36 B | BF16 | no disponible | apache-2.0 | HuggingFace, 51 GB |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED (sucesor) | no disponible | NVFP4 + FP8 mixto | no disponible | no disponible | HuggingFace; el autor lo declara superior en capacidad |
| Otras alternativas comparables de ~27 B | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmark de ninguno de los modelos listados, por lo que la comparacion se limita a parametros, formato de pesos, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo "abliterated"/"uncensored": se ha modificado para eliminar los rechazos, lo que aumenta el riesgo de generar contenido danino, ilegal o inapropiado. Requiere filtros externos si se expone a usuarios finales.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo entrenado principalmente en ingles y chino, cabe esperar sesgos de dominio linguistico y cultural, pero no hay evaluaciones publicadas.
- Riesgo de alucinacion: no cuantificado. La ficha no incluye evaluaciones de veracidad ni de fidelidad factual.
- La ficha del autor indica que este modelo ha sido superado por `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED`; la tarjeta se mantiene solo por razones historicas y para descargas existentes.
- La tasa de rechazo de 0/50 y la divergencia KL esperada de hasta 0,001 son afirmaciones del autor; la propia ficha senala que la tasa de rechazo queda "pendiente de verificar tras el despliegue".
- Compatibilidad de hardware muy restringida: el camino optimizado depende de FP4 nativo en Blackwell (sm_121a); no se documenta funcionamiento verificado en generaciones anteriores ni en GPU de consumo.
- Dependencia de un contenedor propietario y de un drafter externo para el rendimiento declarado, lo que dificulta la portabilidad a otros servidores de inferencia.
- Licencia Apache 2.0: permite uso comercial, pero no exime del cumplimiento de normativa aplicable sobre contenido generado ni de las condiciones de los modelos derivados.
- Idiomas: solo se declaran ingles, chino y "multilingual" generico; no hay evaluacion del rendimiento en castellano.
- No se documenta si existe soporte GGUF, llama.cpp u Ollama, lo que limita su uso fuera de vLLM/transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-NVFP4
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored
- Modelo sucesor declarado por el autor: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Drafter de decodificacion especulativa: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Contenedor de servicio (Spark / GB10): ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor de servicio (RTX discreta): ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
- Herramienta de cuantizacion: llm-compressor 0.10.1.dev107 (vllm-project); no se ha proporcionado URL directa en la informacion disponible.
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre el modelo; los enlaces obtenidos corresponden a foros sobre recuperacion de cuentas de Facebook y a paginas de la CNIL, sin relacion con el modelo. No se dispone por tanto de papers, blogs tecnicos ni demos adicionales.
