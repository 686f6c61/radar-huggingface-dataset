# OpenSML/OpenSML-150M

## Resumen

OpenSML-150M es un modelo de lenguaje en ingles entrenado desde cero con el framework MLX de Apple. Lo desarrolla William Zebrowski (publicado bajo la organizacion OpenSML), y se distribuye como una research preview orientada a demostrar que es viable entrenar y ajustar un modelo pequeno de forma integra en un cluster de ordenadores Mac, primero cuatro y despues cinco, conectados mediante Thunderbolt RDMA. El checkpoint publicado es la variante Instruct, resultado de tres etapas de ajuste supervisado sobre una base preentrenada con 7.800 millones de tokens.

Arquitectonicamente es un transformer decoder-only denso de 20 capas, anchura oculta de 768 y FFN de 2.048, con 150,44 millones de parametros y atencion GQA de 12 cabezas de consulta y 4 de clave/valor. Usa RMSNorm, normalizacion de Q/K, SwiGLU, RoPE con base 10.000 y embeddings atados, con un vocabulario de 32.000 tokens BPE byte-level y una ventana de contexto de 2.048 tokens.

Su relevancia es sobre todo metodologica: documenta de forma exhaustiva la mezcla de datos, las curvas de perdida de validacion, la procedencia del checkpoint y las hashes de verificación, ademas de incluir codigo de inferencia nativo en MLX. No compite en rendimiento con modelos pequenos convencionales, sino que sirve como referencia reproducible para investigacion sobre entrenamiento distribuido en Apple Silicon y sobre pipelines de ajuste supervisado a pequena escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso |
| Parametros totales | 150.439.168 (segun safetensors); la model card declara 150.439.188 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens, incluyendo el presupuesto de generacion; el desbordamiento se rechaza |
| Tipos de cuantizacion | No disponibles; el checkpoint se distribuye en FP32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria MLX), FP32 en el checkpoint Instruct |

Datos adicionales de configuracion: 20 capas, hidden width 768, FFN width 2.048, GQA con 12 cabezas de consulta y 4 de clave/valor, dimension de cabeza 64, RoPE base 10.000, RMSNorm, normalizacion de Q/K, SwiGLU, vocabulario de 32.000 tokens, embeddings de entrada y salida atados, sin sesgos lineales y sin dropout. Tamano del repositorio: 0,7 GB. Descargas: 128. Likes: 0.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 150,44 millones de parametros, entrenado desde cero en BF16 con pesos maestros y estado del optimizador en FP32. La atencion usa Grouped Query Attention con 12 cabezas de consulta y 4 de clave/valor (dimension de cabeza 64), RMSNorm con normalizacion adicional de Q/K, activacion SwiGLU y codificacion posicional RoPE con base 10.000. No emplea sesgos lineales ni dropout, y ata los embeddings de entrada y salida. El tokenizador es un BPE byte-level de 32.000 tokens, ajustado de forma independiente, con una auditoria registrada de ida y vuelta sin fallos sobre un conjunto reservado.

El preentrenamiento proceso 7.800.086.528 tokens en total, repartidos en Stage A y Stage B, sobre un cluster de cuatro Mac que despues se amplio a cinco mediante Thunderbolt RDMA. La base seleccionada corresponde al Stage B, paso 73.243. La mezcla de datos configurada fue: FineWeb-Edu (55% en Stage A y 55% en Stage B, subset `fineweb-edu-dedup`), DCLM-Edu (25% y 20%, con `edu_int_score >= 3`), FineWiki (10% y 15%, solo ingles) y Cosmopedia v2 (10% y 10%, con filtro de formato de libro de texto, tutorial, blog o material educativo). No se uso ningun dataset dedicado de codigo ni de matematicas. La perdida de validacion registrada de la base seleccionada es de 2,81855024 sobre el conjunto original y 2,76700753 sobre el conjunto ampliado.

El ajuste supervisado se hizo en tres etapas encadenadas sobre la base preentrenada, actualizando todos los parametros, sin LoRA ni interpolacion de parametros: Unified384 (+384 actualizaciones) con Smol-SmolTalk, UltraChat, SQuAD v2, preguntas de entrenamiento de ARC y ejemplos de seguimiento de instrucciones de autoria local; Repair512 (+128 actualizaciones) anadiendo Dolly y ejemplos de persona de Tulu; y una etapa final (+256 actualizaciones) con restricciones de SmolTalk, SQuAD v2, SciQ y replay de Repair512. El checkpoint seleccionado es el paso 768 de SFT. No consta en la informacion disponible el uso de RLHF, DPO u otra tecnica de alineacion por preferencias.

## Capacidades

- Generacion de texto en ingles: completado de prompts y generacion de texto corto con decodificacion greedy FP32 de referencia.
- Seguimiento de instrucciones basicas: el formato de prompt es `User: {prompt}\nAssistant:` y existe un modo `--raw-completion` para saltarse ese envoltorio.
- Generacion con control de longitud: parametro `--max-new-tokens`, con rechazo explicito de peticiones que desbordan la ventana de 2.048 tokens (presupuesto de generacion incluido).
- Salida estructurada de diagnostico: la inferencia devuelve el texto, los IDs de tokens generados y el motivo de parada.
- Comprension lectora y respuesta a preguntas extractivas: parte del ajuste uso SQuAD v2, lo que orienta el modelo hacia tareas de QA sobre contexto.
- Razonamiento cientifico y de opcion multiple de nivel basico: se ajusto con ARC y SciQ.
- Dialogo multi-turno de alcance corto: UltraChat y Smol-SmolTalk forman parte de la mezcla de SFT.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no disponibles; el modelo es exclusivamente ingles.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles.

## Casos de uso

- Investigacion sobre entrenamiento distribuido en Apple Silicon: el repositorio documenta la mezcla de datos, los pasos de entrenamiento, las hashes de checkpoint y las curvas de perdida de Stage A y Stage B, por lo que sirve como caso de estudio reproducible de un pipeline completo de preentrenamiento y SFT en MLX sobre hardware Mac.
- Prototipado y docencia en ajuste supervisado: al ser un modelo denso de 150M con licencia Apache-2.0 y pesos FP32, se puede reentrenar o ajustar por etapas en una sola maquina para ilustrar tecnicas de SFT, mezclas de datos y evaluacion de perdida de validacion.
- Ajuste fino para dominios verticales en ingles: su tamano permite reentrenar todos los parametros sobre corpus especializados (legal, medico divulgativo, soporte tecnico) sin infraestructura de GPU, aprovechando que el pipeline original ya hace actualizaciones completas.
- Generacion de texto asistida en local y con privacidad: al ejecutarse con inferencia MLX nativa en un Mac, es adecuado para aplicaciones de escritorio que redactan borradores cortos, resumenes de parrafo o respuestas plantilla sin enviar datos a un servicio externo.
- Etiquetado y clasificacion ligera de texto en ingles: el modelo puede usarse para puntuar o categorizar fragmentos cortos (por ejemplo, triaje de tickets o deteccion de intencion) mediante generacion condicionada al prompt, dado su bajo coste de inferencia.
- Respuesta a preguntas sobre documentacion breve: su ajuste con SQuAD v2 y SciQ lo hace utilizable en asistentes de FAQ donde el contexto cabe en pocos cientos de tokens y la respuesta esperada es extractiva o muy concisa.
- Generacion de datos sinteticos para entrenar modelos mayores: puede producir variaciones de instrucciones y respuestas cortas en ingles que luego se filtran, aprovechando su coste marginal casi nulo por token en Apple Silicon.
- Validacion de pipelines de inferencia y verificacion de artefactos: el repositorio incluye verificacion de hash de pesos, manifiesto del tokenizador, `checkpoint_provenance.json`, `INFERENCE_VERIFICATION.json` y `SHA256SUMS`, lo que lo convierte en un banco de pruebas para comprobar integridad de artefactos y paridad entre frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card aparece truncada en el punto "Existing full-split evaluations co...", por lo que no se dispone de cifras de MMLU, HumanEval, GSM8K ni de otras pruebas estandar para este modelo.

Los unicos datos cuantitativos de rendimiento disponibles son las perdidas de validacion registradas durante el preentrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion de la base seleccionada (conjunto original) | 2,81855024 |
| Perdida de validacion de la base seleccionada (conjunto ampliado) | 2,76700753 |
| Paso de Stage B seleccionado | 73.243 |
| Tokens de preentrenamiento acumulados | 7.800.086.528 |
| Paso de SFT del checkpoint publicado | 768 |

Nota: la model card advierte que el conjunto ampliado usa un conjunto de validacion distinto y que sus perdidas absolutas no deben mezclarse con las del conjunto original.

## Requisitos de hardware

- Entorno de ejecucion: MLX sobre Apple Silicon, con Python 3.11 o superior. No hay ruta CUDA documentada ni verificada.
- VRAM o memoria unificada para inferencia: en FP32, el checkpoint Instruct ocupa aproximadamente 602 MB solo en pesos (150.439.168 parametros x 4 bytes); en BF16 serian unos 301 MB. El repositorio completo pesa 0,7 GB.
- GPU recomendadas: no se especifican. El proyecto esta disenado para Mac con chip de la serie M; el entrenamiento se hizo en un cluster de cuatro y luego cinco Mac con Thunderbolt RDMA.
- Cabe en hardware de consumo: si, siempre que sea Apple Silicon. Cualquier Mac con 8 GB de memoria unificada o mas puede cargar los pesos en FP32 con holgura. No hay soporte documentado para GPU de consumo NVIDIA.
- Opciones de despliegue: script nativo `inference.py` incluido en el repositorio. No es un paquete cargable con `Transformers AutoModel` ni con el loader de `mlx-lm`. No se publican pesos en GGUF, por lo que llama.cpp y Ollama no son aplicables sin una conversion propia no verificada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. La inferencia de referencia es greedy en FP32 con atencion MLX vanilla, lo que implica mas coste por token que una ejecucion en BF16.
- Limitacion operativa de memoria: la ventana de 2.048 tokens incluye el presupuesto de generacion; las peticiones que la exceden se rechazan en lugar de truncarse.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formatos y despliegue | Benchmarks |
|---|---|---|---|---|---|---|
| OpenSML-150M (OpenSML) | 150,44M | 2.048 | Apache-2.0 | Ingles | safetensors MLX (FP32); inferencia nativa MLX; sin Transformers ni mlx-lm | No disponibles |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | Apache-2.0 | Ingles y multilingue parcial | safetensors, GGUF, ONNX; Transformers, llama.cpp, vLLM | No disponibles en la informacion proporcionada |
| Pythia-160M (EleutherAI) | 160M | 2.048 | Apache-2.0 | Ingles | safetensors; Transformers | No disponibles en la informacion proporcionada |
| Qwen2.5-0.5B (Alibaba) | 0,49B | 32.768 | Apache-2.0 | Multilingue | safetensors, GGUF; Transformers, vLLM, llama.cpp | No disponibles en la informacion proporcionada |

La comparacion relevante es estructural: OpenSML-150M se situa en el mismo orden de magnitud de parametros que SmolLM-135M y Pythia-160M, pero con una ventana de contexto mucho menor que la de alternativas mas recientes como Qwen2.5-0.5B y, sobre todo, con un ecosistema de despliegue muy restringido (solo MLX nativo, sin GGUF ni soporte de Transformers verificado). Su ventaja diferencial no es el rendimiento, del que no hay datos publicos en la informacion disponible, sino la trazabilidad documental del entrenamiento y su enfoque en hardware Apple.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgos ni de toxicidad en la informacion disponible. Los corpus de preentrenamiento son web filtrada por criterios educativos, lo que no excluye sesgos de origen.
- Riesgo de alucinacion: elevado por el tamano del modelo (150M) y por el uso de decodificacion greedy sin verificacion factual. No se recomienda su uso en tareas que requieran precision verificable sin supervision humana.
- Limitacion de idioma: el modelo es exclusivamente ingles; no hay capacidades multilingues declaradas ni evaluadas.
- Limitacion de contexto: 2.048 tokens que incluyen la generacion solicitada. Las peticiones que exceden ese limite se rechazan de forma explicita, no se truncan, lo que puede romper integraciones que asuman truncado automatico.
- Ausencia de datos de codigo y matematicas: el preentrenamiento no uso ningun dataset dedicado de codigo o matematicas, por lo que no cabe esperar rendimiento util en esas areas.
- Ausencia de benchmarks publicos: la model card incluye una seccion de evaluacion truncada, por lo que no hay evidencia cuantitativa comparable con otros modelos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero no hay garantias ni soporte por parte del autor. Es una research preview.
- Compatibilidad de despliegue: no es un paquete de `Transformers AutoModel` ni de `mlx-lm`. La paridad entre frameworks y otros formatos de pesos permanece sin verificar. No hay pesos cuantizados ni GGUF.
- Dependencia de plataforma: requiere Apple Silicon y Python 3.11+. No hay ruta CUDA documentada, lo que limita su uso en infraestructura de servidores convencional.
- Adopcion muy baja: 0 likes y 128 descargas en el momento de la ficha, lo que implica poca validacion externa y escaso soporte comunitario.
- Inconsistencias documentales: el identificador del repositorio es `OpenSML/OpenSML-150M` mientras que el comando de descarga de la model card apunta a `wzebrowski/OpenSML-150M`. Ademas, el recuento de parametros declarado en la model card (150.439.188) no coincide con el real del safetensors (150.439.168), y las fechas de creacion y actualizacion registradas son del 6 de octubre de 2026.
- No consta el uso de RLHF ni DPO: la alineacion se limita al ajuste supervisado, lo que suele traducirse en menor robustez frente a instrucciones adversarias o peticiones daninas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenSML/OpenSML-150M
- Informe tecnico: https://github.com/williamzebrowskI/opensml-150m/blob/main/sml-mlx-v1/docs/TECHNICAL_REPORT.md
- Resultados y procedencia: TRIAL28_RESULTS.json (en el repositorio del modelo)
- Tokenizador: tokenizer/tokenizer.json (en el repositorio del modelo)
- Procedencia del checkpoint: checkpoint_provenance.json (en el repositorio del modelo)
- Verificacion de carga: INFERENCE_VERIFICATION.json (en el repositorio del modelo)
- Hashes del bundle: SHA256SUMS (en el repositorio del modelo)
- Datasets referenciados: HuggingFaceTB/smollm-corpus, HuggingFaceTB/dclm-edu, HuggingFaceFW/finewiki, HuggingFaceTB/smol-smoltalk, HuggingFaceH4/ultrachat_200k, rajpurkar/squad_v2, allenai/ai2_arc, databricks/databricks-dolly-15k, allenai/tulu-3-sft-personas-instruction-following, HuggingFaceTB/smoltalk, allenai/sciq
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo.
