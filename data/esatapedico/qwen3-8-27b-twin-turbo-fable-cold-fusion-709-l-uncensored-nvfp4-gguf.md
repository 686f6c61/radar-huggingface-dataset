# esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF

## Resumen

Este repositorio contiene una familia de seis archivos GGUF derivados de DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, un ajuste de 27.320.698.112 parametros (27,3 B) sobre Qwen3.8-27B. El trabajo de publicacion corre a cargo del usuario esatapedico, que se limita a la conversion numerica: parte del checkpoint NVFP4 en safetensors, lo convierte a GGUF y construye una escalera de tamano y precision para los tensores que mas influyen en la calidad de salida y la velocidad de decodificacion (lm_head, token_embd y cabeza MTP). El modelo subyacente es un transformer denso hibrido que combina Gated DeltaNet con Gated Attention, con 262.144 tokens de contexto nativo, torre de vision integrada y una cabeza MTP de decodificacion especulativa embebida.

La relevancia practica esta en el empaquetado NVFP4: los seis archivos comparten un backbone NVFP4 nativo de 448 tensores byte a byte identico, en formato W4A16 con escalas FP8 E4M3 y group size 16, y solo varian en la precision de las tres cabezas criticas. Eso permite desplegar un modelo de 27 B en el entorno de 15-20 GB de pesos, con decodificacion especulativa MTP ya incluida en el propio archivo (sin necesidad de un drafter separado, mediante `--spec-type draft-mtp`). El destino declarado es Blackwell sm_120, es decir, aceleracion nativa NVFP4 en GPU de la generacion RTX 50 y posteriores.

El ajuste upstream es una variante "uncensored" (cadena Fable mas Cold Fusion mas Heretic) afinada para reducir de forma marcada los tokens de razonamiento manteniendo la calidad. Se distribuye bajo licencia apache-2.0 en todos los archivos y esta orientado a generacion de texto conversacional, con soporte de plantilla de chat en varios modos (einstein, spoon, xhigh, medium, low) y una correccion de plantilla para tool calling publicada el 2026-09-12.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet mas Gated Attention (atencion completa cada cuarta capa), torre de vision nativa y cabeza MTP de decodificacion especulativa |
| Parametros totales | 27.320.698.112 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (`qwen35.context_length`) |
| Tipos de cuantizacion | Backbone NVFP4 (W4A16, escalas FP8 E4M3, group size 16, weight-only) en los 448 tensores comunes; cabezas lm_head, token_embd y MTP variables por tier: Q2_K, Q3_K, Q5_0, IQ4_XS, Q6_K, Q8_0 y BF16 |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 (declarada en los seis archivos) |
| Formato de pesos | GGUF (tambien existe el repositorio hermano en safetensors con compressed-tensors NVFP4) |
| Tensores por archivo | 1.122 |
| Capas (`block_count`) | 65 (64 mas blk.64 de MTP, 15 tensores) |
| Capas de prediccion MTP | 1 (`nextn_predict_layers`) |
| Version de cuantizacion | 2 |
| Tamano del repositorio | 231,9 GB |
| Descargas / likes | 3.715 / 3 |

### Los seis tiers

| Archivo | Tamano (GB decimales) | lm_head | token_embd | Cabeza MTP | Backbone |
|---|---|---|---|---|---|
| NVFP4-VERY-LOW | 14,86 | Q3_K | Q2_K | Q2_K | NVFP4 (448) |
| NVFP4-LOW | 15,53 | Q5_0 | IQ4_XS | IQ4_XS | NVFP4 (448) |
| NVFP4-MEDIUM | 16,38 | Q8_0 | Q6_K | IQ4_XS | NVFP4 (448) |
| NVFP4-MID-HIGH | 16,91 | Q8_0 | Q8_0 | Q8_0 | NVFP4 (448) |
| NVFP4-HIGH | 17,57 | BF16 | Q6_K | IQ4_XS | NVFP4 (448) |
| NVFP4-VERY-HIGH | 19,69 | BF16 | BF16 | BF16 | NVFP4 (448) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3 B con atencion hibrida: capas Gated DeltaNet (atencion lineal) combinadas con Gated Attention completa cada cuarta capa. Esta mezcla busca reducir el coste de atencion en contextos largos sin renunciar a la atencion completa en una fraccion de capas. Incorpora ademas una torre de vision del Qwen3.8 original, que se activa emparejando el archivo con el proyector multimodal `mmproj-BF16.gguf` mediante `--mmproj` (no incluido en este repositorio; hay que tomarlo del modelo base).

La innovacion del empaquetado es doble. Por un lado, la decodificacion especulativa MTP viene horneada en cada archivo: la capa blk.64 (`nextn_predict_layers` = 1, 15 tensores) actua como drafter interno, activable con `--spec-type draft-mtp`, de modo que no hace falta cargar un modelo borrador aparte. Por otro, el esquema de cuantizacion NVFP4 (W4A16 con escalas FP8 E4M3 y group size 16) se aplica solo a las capas lineales: la torre de vision, la ruta de atencion lineal, lm_head, los embeddings y la cabeza MTP se mantienen en BF16 en el origen de la cuantizacion, y el conversor decide despues, tier a tier, con que precision los serializa.

El ajuste upstream (TWIN-TURBO, cadena Fable mas Cold Fusion mas Heretic/Uncensored) esta tuneado para reducir de forma acusada los tokens de razonamiento manteniendo la calidad, segun la descripcion del autor. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF, DPO u otras tecnicas de alineamiento en la informacion proporcionada.

En cuanto a la plantilla de chat, la version del 2026-09-12 incorpora correcciones procedentes del hilo upstream de tool calling: preservacion de `tool_calls`, guardas del escaner `REASON` y guarda de argumentos de tipo string. Los datos tensoriales son identicos byte a byte respecto a la version anterior; solo cambio la plantilla embebida, de ahi que cada archivo crezca 544 bytes y los SHA-256 sean nuevos.

## Capacidades

- Generacion de texto conversacional multi-turno, con modos de plantilla de chat diferenciados (einstein, spoon, xhigh, medium, low) que permiten ajustar el esfuerzo de razonamiento.
- Razonamiento con modo "thinking" de longitud reducida respecto al ajuste original (objetivo declarado del tune TWIN-TURBO).
- Capacidades de vision al emparejar el GGUF con el proyector `mmproj-BF16.gguf` del modelo base mediante `--mmproj`.
- Tool calling y function calling, con la salvedad importante de que el autor recomienda modo razonamiento y temperatura 0,6-0,7, y advierte de que el tool calling en modo instruct sigue siendo pobre.
- Uso agentico y tareas largas: la model card menciona comportamientos reportados por la comunidad para este escenario, aunque el texto disponible esta truncado.
- Contexto largo: 262.144 tokens nativos, util para documentos extensos y conversaciones de muchas vueltas.
- Multilingue (etiquetas `en` y `multilingual`), con foco principal declarado en ingles.
- Decodificacion especulativa MTP integrada, que acelera la generacion sin drafter externo.
- Salida sin censura (variante Uncensored/Heretic), lo que implica menor rechazo de peticiones pero tambien ausencia de capas de seguridad alineadas.

## Casos de uso

- Atencion al cliente automatizada: con 262.144 tokens de contexto se pueden mantener historiales de conversacion muy largos y adjuntar documentacion de producto sin trocear, reduciendo perdidas de contexto en conversaciones multi-turno.
- Agentes con tool calling: usando modo razonamiento y temperatura 0,6-0,7, el modelo puede orquestar llamadas a APIs y herramientas en flujos de varios pasos; conviene validar la salida porque el modo instruct degrada el tool calling.
- Analisis de documentos largos en local: informes, contratos o expedientes que caben en la ventana de 262 K tokens, procesados en una sola pasada sin RAG ni fragmentacion.
- Generacion y asistencia de codigo en pipelines de desarrollo: integrado via llama.cpp detras de un servidor local, con la ventaja de que los pesos no salen de la maquina; el modelo base no publica resultados especificos de codigo en la informacion disponible, por lo que conviene evaluarlo antes en el dominio concreto.
- Despliegue on-premise con requisitos de privacidad: al caber en 15-20 GB de pesos, puede ejecutarse en una unica GPU de gama alta sin enviar datos a terceros, lo que encaja en entornos con restricciones de tratamiento de datos.
- Transcripcion y analisis de capturas o documentos escaneados: emparejando el GGUF con el proyector de vision se habilita entrada de imagen para extraer y razonar sobre contenido visual.
- Asistente personal o creativo sin filtros: la variante Uncensored esta pensada para escritura creativa y consultas donde los modelos alineados suelen rechazar peticiones; requiere supervision humana por la ausencia de salvaguardas.
- Evaluacion comparativa de cuantizaciones: la escalera de seis tiers con backbone identico permite medir el impacto aislado de la precision de lm_head, embeddings y cabeza MTP sobre la perplejidad y la velocidad de decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni similares, ni comparaciones numericas con otros modelos. Tampoco se proporcionan mediciones de throughput o latencia (tokens por segundo) para ningun tier.

## Requisitos de hardware

- Huella de pesos: de 14,86 GB (VERY-LOW) a 19,69 GB (VERY-HIGH) en disco. A eso hay que sumar la cache KV, que con 262.144 tokens de contexto puede ser considerable y no esta cuantificada en la informacion disponible.
- VRAM estimada para inferencia: el autor indica que el tier VERY-HIGH necesita aproximadamente 18 GiB de VRAM mas la cache KV; las tarjetas de 16 GB caeran a offload en CPU con ese tier.
- Recomendacion de tier por VRAM: MID-HIGH (16,91 GB) es la opcion compacta de mayor precision con los tres grupos de cabezas en Q8_0; LOW reduce unos 1,4 GB de VRAM a cambio de precision en las cabezas; HIGH y VERY-HIGH restauran cabezas BF16 cuando la VRAM lo permite.
- Aceleracion NVFP4: el formato esta pensado para Blackwell sm_120 (RTX 50, B100/B200 y equivalentes). En hardware anterior el soporte NVFP4 nativo no esta disponible y el rendimiento dependera de la ruta de fallback de llama.cpp, cuyo detalle no se especifica en la informacion proporcionada.
- GPU concretas: la informacion disponible solo menciona Blackwell sm_120 de forma generica, sin listar modelos concretos (A100, H100, RTX 4090, etc.). No disponible.
- Cabe en GPU de consumo: si, con las salvedades anteriores; el rango de 14,86-19,69 GB apunta a tarjetas de 16-24 GB, y en tarjetas de 16 GB los tiers mas grandes requeriran offload parcial a CPU.
- Opciones de despliegue: llama.cpp es el runtime mencionado explicitamente, incluyendo la bandera `--spec-type draft-mtp` para la decodificacion especulativa MTP y `--mmproj` para vision. No se mencionan vLLM, TGI, Ollama ni otras alternativas en la informacion disponible.
- Vision: requiere descargar aparte el proyector `mmproj-BF16.gguf` del modelo base; no viene incluido en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Precision | Licencia |
|---|---|---|---|---|---|
| Este repositorio (GGUF NVFP4, 6 tiers) | 27,3 B | 262.144 | GGUF | NVFP4 W4A16 mas cabezas en Q2_K a BF16 | apache-2.0 |
| esatapedico/...-NVFP4 (safetensors) | 27,3 B | 262.144 | safetensors (compressed-tensors) | NVFP4 | apache-2.0 |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (base) | 27,3 B | 262.144 | no disponible en la informacion | pesos originales sin cuantizar | no disponible en la informacion |

No se dispone de datos de rendimiento ni de especificaciones de terceros (Qwen3.8 base, otras variantes de 27 B, alternativas de contexto largo) en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con modelos externos.

## Limitaciones y advertencias

- Variante sin censura: al proceder de la cadena Heretic/Uncensored, no incorpora las capas de rechazo habituales de los modelos alineados. Puede producir contenido inapropiado, ofensivo o peligroso, y no es apta para aplicaciones orientadas al publico sin filtros adicionales.
- Tool calling fragil: el propio autor advierte de que el tool calling en modo instruct "sigue siendo pobre" y recomienda modo razonamiento con temperatura 0,6-0,7. Cualquier despliegue agentico deberia validar y reparar las llamadas generadas.
- Riesgo de alucinacion: no hay datos publicados de evaluacion de fidelidad en la informacion disponible; un contexto de 262 K tokens aumenta la superficie para mezclar informacion irrelevante si no se gestiona bien el prompt.
- Idiomas: aunque la etiqueta declara `multilingual`, el unico idioma listado explicitamente es `en`. No hay evaluacion publicada de rendimiento en castellano ni en otros idiomas.
- Licencia y atribucion: el repositorio declara apache-2.0 en los seis archivos, pero se trata de una conversion de un modelo derivado de Qwen3.8 con ajustes de terceros. Conviene verificar los terminos de la cadena upstream (DavidAU y el modelo Qwen3.8 original) antes de un uso comercial, ya que la informacion disponible no detalla las condiciones de esa cadena.
- Dependencia de hardware: la aceleracion NVFP4 esta ligada a Blackwell sm_120. En GPUs anteriores el comportamiento y el rendimiento no estan documentados en la informacion disponible, y podrian degradarse notablemente.
- Memoria: el tier VERY-HIGH supera los 16 GB de VRAM y obliga a offload en CPU en tarjetas de esa capacidad, con la penalizacion de velocidad correspondiente. La cache KV para 262.144 tokens no esta cuantificada.
- Vision no autosuficiente: requiere un proyector externo (`mmproj-BF16.gguf`) que no se distribuye en este repositorio; sin el, las capacidades multimodales no estan disponibles.
- Metadatos del autor: `general.file_type` es solo orientativo; la model card indica que el tipo por tensor es la fuente autoritativa. No fiarse de ese campo para estimar la precision real de un archivo.
- Plantilla de chat: la version corregida solo esta disponible en la revision del 2026-09-12 en adelante; las copias anteriores conservan los fallos de tool calling y tienen SHA-256 distintos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF
- Repositorio hermano en safetensors (compressed-tensors NVFP4): https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Ko-fi del autor de las conversiones: https://ko-fi.com/esatapedico

No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs tecnicos, repositorios o demos) sobre este modelo.
