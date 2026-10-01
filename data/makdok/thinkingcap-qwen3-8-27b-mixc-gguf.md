# Makdok/ThinkingCap-Qwen3.8-27B-MixC-GGUF

## Resumen

ThinkingCap-Qwen3.8-27B-MixC-GGUF es una cuantizacion GGUF de precision mixta del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, publicada por el usuario Makdok. No es un modelo entrenado desde cero: es un unico fichero GGUF de 15,09 GiB construido aplicando un estudio de sensibilidad por grupo de tensores sobre el GGUF f16 oficial, en lugar de usar un preset estandar de llama.cpp. El objetivo es obtener una relacion calidad/tamano mejor que la cuantizacion oficial Q4_K_M (16,25 GiB) manteniendo un tamano menor.

El modelo base declara 27.320.697.856 parametros y una arquitectura hibrida con 48 capas de atencion lineal con puerta (gated linear attention) y 16 capas de atencion completa, lo que permite una ventana de contexto de 262.144 tokens. El GGUF incluye ademas una cabeza MTP (multi-token prediction) embebida en el tensor blk.64, utilizable para decodificacion especulativa con n-gram.

La relevancia de esta publicacion es metodologica: documenta con datos de divergencia KL que mover los tensores ffn_gate y ffn_up a IQ4_XS apenas degrada la calidad y libera espacio que se reinvierte en subir ssm_alpha, ssm_beta, attn_k y attn_v a Q8_0, con la mayor ganancia por GiB anadido. El resultado es un fichero que cabe en una GPU de 24 GB sirviendo 262k de contexto con 2 slots, y que segun el autor iguala o supera en KLD a la cuantizacion oficial mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 capas de atencion lineal con puerta + 16 capas de atencion completa (datos del modelo base Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262k), verificado por el autor con 2 slots en una GPU de 24 GB |
| Tipos de cuantizacion | GGUF de precision mixta: IQ4_XS (ffn_gate, ffn_up), Q4_K (mayoria de tensores), Q5_K (ffn_down), Q6_K (output), Q8_0 (ssm_alpha, ssm_beta, attn_k, attn_v), token_embd en Q4_K |
| Idiomas soportados | en, fr (segun la model card) |
| Licencia | polyform-small-business-1.0.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (fichero unico, 15,09 GiB) + importance matrix en GGUF (13 MB) |

## Arquitectura y entrenamiento

Esta ficha describe una cuantizacion, no un entrenamiento. El autor no entreno el modelo: partio del GGUF f16 oficial de bottlecapai/ThinkingCap-Qwen3.8-27B y lo recuantizo con `llama-quantize`, usando como preset base Q4_K_S y aplicando despues anulaciones por tipo de tensor. La importance matrix se calculo con `llama-imatrix -c 2048 --parse-special` sobre el Q8_0 oficial y unos 442.000 tokens de calibracion, mezclando 128 trazas de razonamiento propias del modelo en formato chat (64 prompts x 2 semillas, esfuerzo xhigh, con `<think>` incluido), 450.000 caracteres de wikitext-2 de entrenamiento y 350.000 caracteres de codigo fuente Python/C.

El proceso de seleccion fue incremental: partiendo de Q4_K_S (derivado de f16 con la misma imatrix), el autor cambio un grupo de tensores cada vez y midio el KLD en 3 textos, ordenando los cambios por ganancia de KLD por GiB anadido. Los resultados fueron: ssm_alpha/beta a Q8_0 aporta -121 %/GiB, attn_k/v a Q8_0 -77 %/GiB, ffn_down a Q5_K -26 %/GiB, y mover ffn_gate/up a IQ4_XS cuesta solo +1,6 % de KLD mientras reduce el tamano en 0,337 GiB. La innovacion tecnica destacable es precisamente esa asignacion no uniforme de bits por grupo de tensores, guiada por datos, mas la inclusion de la cabeza MTP embebida para acelerar la generacion. El autor advierte de dos caveats metodologicos: la imatrix de trazas de razonamiento no aporta mejora por si sola (frente a la imatrix de mradermacher con la misma receta: -5 % en codigo, +3 % en wiki, igual en trazas), y la referencia de comparacion es Q8_0, no BF16, porque BF16 no cabia en 32 GB de RAM mas 24 GB de VRAM.

## Capacidades

- Generacion de texto y razonamiento extendido: el autor ejecuta el modelo en modo xhigh, generando hasta 275.000 tokens de razonamiento en la bateria de tareas de comprobacion.
- Razonamiento matematico: 11/12 problemas de AIME 2025 resueltos en la prueba interna con 262k de contexto y temperatura 1,0.
- Generacion de codigo: 13/15 problemas de HumanEval+ resueltos en la misma prueba; la model card reporta ademas la KLD mas baja en texto de codigo Python entre las cuantizaciones comparadas.
- Decodificacion especulativa: el GGUF incluye una cabeza MTP embebida (blk.64), que el autor usa junto con n-gram con n=2 para el servidor de 262k contexto.
- Conversacional: etiquetado como `conversational` en HuggingFace y con plantilla de chat del modelo base (prompts formateados como chat para generar la imatrix).
- Capacidades multilingues: la model card declara ingles y frances; no se documentan otros idiomas.
- Vision: no incluida en este GGUF. El autor indica que el proyector oficial `mmproj-ThinkingCap-Qwen3.8-27B-f16.gguf` deberia funcionar, pero no lo probo.
- Tool calling y uso como agente: no disponible (la model card no lo documenta para esta cuantizacion).

## Casos de uso

- Razonamiento matematico en local con GPU de consumo: el modelo resuelve problemas de nivel competicion (11/12 en AIME 2025 en la prueba del autor) con 262k de contexto y sin necesidad de enviar datos a una API externa; encaja en una GPU de 24 GB con el fichero de 15,09 GiB.
- Asistencia de programacion con contexto de repositorio completo: al soportar 262.144 tokens de contexto y mostrar la menor KLD en codigo entre las cuantizaciones comparadas (0,0534), permite incluir multiples ficheros fuente y documentacion en un mismo prompt para tareas de refactorizacion o revision.
- Analisis de documentos largos: informes tecnicos, expedientes o libros completos caben en la ventana de 262k, con la ventaja de que el modelo no requiere conexion externa ni cuotas de API.
- Despliegue multiusuario ligero: el autor reporta que el servidor admite 2 slots con 262k de contexto, KV unificado en q4_0 y MTP embebido ocupando 20,85 GiB, lo que permite servir a varios usuarios concurrentes en una sola maquina.
- Inferencia sobre hardware AMD con Vulkan: el modelo esta medido en una RX 7900 XTX bajo Windows con Vulkan, un escenario donde las alternativas basadas en CUDA no aplican; util para equipos con GPU AMD.
- Generacion de trazas de razonamiento para destilacion o evaluacion: el formato de chat del modelo produce trazas `<think>` largas (275k tokens en la bateria de prueba), aprovechables como datos sinteticos de razonamiento.
- Investigacion sobre cuantizacion: el repositorio incluye la imatrix reutilizable (13 MB) y todo el recetario, lo que permite reproducir el estudio de sensibilidad sobre otros modelos con arquitectura similar.

## Benchmarks y rendimiento

Divergencia KL frente al Q8_0 oficial, medida con `llama-perplexity --kl-divergence` en fragmentos de 2048 tokens sobre 3 textos no vistos por la imatrix (wiki: wikitext-2 test, 16 fragmentos; code: codigo Python, 8 fragmentos; traces: 32 trazas de razonamiento retenidas de 16 prompts, 16 fragmentos):

| Cuantizacion | Tamano (GiB) | KLD wiki | KLD code | KLD traces | top-1 igual (traces) |
|---|---|---|---|---|---|
| Q4_K_S (desde f16, esta imatrix) | 14,74 | 0,0296 | 0,0683 | 0,0140 | 96,7 % |
| Q4_K_S (desde f16, imatrix de mradermacher) | 14,74 | 0,0286 | 0,0719 | 0,0141 | 96,8 % |
| mradermacher i1-Q4_K_S | 14,74 | 0,0281 | 0,0727 | 0,0140 | 96,8 % |
| mix-b (mismo tamano que Q4_K_S) | 14,73 | 0,0257 | 0,0669 | 0,0116 | 96,7 % |
| MixC (este repositorio) | 15,09 | 0,0219 | 0,0534 | 0,0103 | 96,9 % |
| Q4_K_M oficial | 16,25 | 0,0211 | 0,0552 | 0,0109 | 97,3 % |

Prueba de tareas (comprobacion de cordura, no un leaderboard oficial): razonamiento xhigh, contexto 262k, temperatura 1,0, 12 problemas de AIME 2025 y 15 de HumanEval+.

| Cuantizacion | Puntuacion | AIME 2025 | HumanEval+ | Tokens de razonamiento |
|---|---|---|---|---|
| MixC | 24/27 | 11/12 | 13/15 | 275.000 |
| Q4_K_S (desde Q8_0) | 23/27 | 10/12 | 13/15 | 272.000 |

Rendimiento medido en RX 7900 XTX, Windows, Vulkan, con `llama-bench` y sin especulacion:

| Cuantizacion | Prompt 512 | Generacion (tg128) |
|---|---|---|
| Q4_K_S | 792 t/s | 42,9 t/s |
| MixC | 824 t/s | 41,6 t/s |

El autor advierte de que la diferencia de 1 problema entre MixC y Q4_K_S esta dentro del ruido con n=27 a temperatura 1,0: demuestra ausencia de regresion en razonamiento, no una mejora.

## Requisitos de hardware

- Tamano de pesos: 15,09 GiB para el fichero MixC; 14,74 GiB para Q4_K_S; 16,25 GiB para Q4_K_M oficial.
- VRAM: cabe en una GPU de 24 GB. El autor reporta que, sirviendo 262k de contexto con 2 slots, KV unificado en q4_0 y decodificacion especulativa n-gram + MTP embebido (n=2), el servidor ocupa 20,85 GiB (el dato de uso total de la model card esta truncado).
- GPU recomendadas: RX 7900 XTX (medida por el autor). Cualquier GPU de 24 GB (RTX 3090, RTX 4090, RX 7900 XTX) es suficiente para el modelo completo con contexto largo; no hay mediciones publicadas para A100 o H100.
- GPU de consumo: si, en tarjetas de 24 GB. Para GPUs de 16 GB o menos no hay datos medidos; seria necesario reducir contexto o hacer offload parcial, sin cifras disponibles.
- Opciones de despliegue: llama.cpp (biblioteca del repositorio), incluidas `llama-quantize`, `llama-imatrix`, `llama-perplexity` y `llama-bench`; el autor usa llama.cpp master con el PR ggml-org/llama.cpp#29679. Ollama y LM Studio deberian poder cargar el GGUF al ser formato estandar, aunque no hay confirmacion en la informacion disponible. vLLM y TGI: no disponible.
- Backends probados: Vulkan sobre Windows con GPU AMD. No hay datos de rendimiento para CUDA, ROCm ni Metal.
- Latencia y throughput: 824 t/s de prefill (prompt 512) y 41,6 t/s de generacion en RX 7900 XTX con Vulkan y sin especulacion. El throughput con especulacion activada no se reporta.

## Comparativa con modelos similares

Comparativa entre cuantizaciones del mismo modelo base (todas con los mismos 27.320.697.856 parametros y contexto de 262k):

| Cuantizacion | Tamano (GiB) | KLD medio (3 textos) | Licencia | Disponibilidad |
|---|---|---|---|---|
| MixC (este repositorio) | 15,09 | 0,0219 / 0,0534 / 0,0103 | polyform-small-business-1.0.0 | HuggingFace, 0 descargas |
| Q4_K_M oficial | 16,25 | 0,0211 / 0,0552 / 0,0109 | no disponible | HuggingFace (bottlecapai) |
| mradermacher i1-Q4_K_S | 14,74 | 0,0281 / 0,0727 / 0,0140 | no disponible | HuggingFace (mradermacher) |
| Q4_K_S (desde f16, esta imatrix) | 14,74 | 0,0296 / 0,0683 / 0,0140 | polyform-small-business-1.0.0 | este repositorio (solo la imatrix es reutilizable; el autor describe la receta) |

Frente a un Qwen3 denso de 27B-32B en GGUF, no hay datos comparativos en la informacion proporcionada: la arquitectura hibrida (48 capas de atencion lineal + 16 de atencion completa) del modelo base no es directamente equiparable y no se dispone de cifras de benchmarks de esos modelos en este contexto. No disponible.

## Limitaciones y advertencias

- Licencia restrictiva: PolyForm Small Business 1.0.0 no es una licencia de codigo abierto aprobada. Permite uso comercial solo a empresas que cumplan los umbrales de "small business" definidos en el texto; hay que leer el fichero LICENSE antes de cualquier uso en produccion.
- Modelo derivado: es una cuantizacion, no un modelo entrenado. Hereda todas las limitaciones del base bottlecapai/ThinkingCap-Qwen3.8-27B, cuya model card no forma parte de la informacion disponible.
- Vision no incluida: el autor no incluye el proyector multimodal y no ha probado que el `mmproj` oficial funcione con este GGUF. Cualquier caso de uso con imagenes debe validarse.
- Idiomas limitados: solo se declaran ingles y frances. El rendimiento en castellano no esta documentado ni medido.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de veracidad ni de tasas de alucinacion. Un modelo de razonamiento con generacion de 275.000 tokens de traza puede producir cadenas de razonamiento largas y plausibles pero incorrectas.
- Validacion estadistica limitada: la comparativa de KLD usa solo 3 textos (16, 8 y 16 fragmentos de 2048 tokens) y la prueba de tareas n=27. El propio autor califica la diferencia de 1 problema en AIME como ruido.
- Referencia de medida no ideal: el KLD se calcula contra Q8_0, no contra BF16, porque BF16 no cabia en el hardware del autor. Las cifras no son directamente comparables con estudios que usen BF16 como referencia.
- Contexto largo y memoria: servir 262k con 2 slots exige 20,85 GiB en el escenario medido. Reducir la VRAM disponible obliga a bajar contexto, slots o cuantizacion del KV, con impacto en calidad no cuantificado.
- Sin traccion en la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha, creado y actualizado el 30 de septiembre de 2026. No hay validacion independiente del recetario ni de los resultados.
- Tool calling y uso agente: no documentado; no debe asumirse su funcionamiento sin pruebas propias.
- Rendimiento dependiente del backend: todas las cifras proceden de Vulkan sobre Windows en una RX 7900 XTX. En CUDA, ROCm o Metal los numeros pueden diferir.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Makdok/ThinkingCap-Qwen3.8-27B-MixC-GGUF
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- GGUF oficial del modelo base (incluye el proyector mmproj): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B-GGUF
- Cuantizaciones alternativas de mradermacher: https://huggingface.co/mradermacher/ThinkingCap-Qwen3.8-27B-i1-GGUF
- Pull request de llama.cpp usado en las mediciones: https://github.com/ggml-org/llama.cpp/pull/29679
