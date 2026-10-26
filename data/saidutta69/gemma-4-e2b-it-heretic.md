# saidutta69/gemma-4-E2B-it-heretic

## Resumen

`gemma-4-E2B-it-heretic` es una variante «abliterated» (decensurada) del modelo multimodal `google/gemma-4-E2B-it`, el miembro mas pequeno de la familia Gemma 4 de Google. Se trata de un transformer denso que acepta texto, imagen, video y audio y genera texto, con 128K tokens de contexto, 262K de vocabulario y modos de razonamiento («thinking») configurables. La edicion la firma el usuario `saidutta69` con la herramienta Heretic v1.4.0, que suprime el comportamiento de rechazo mediante ablation direccional sobre los pesos, sin fine-tuning.

El interes tecnico esta en el compromiso que documenta el propio autor: el modelo base rechazaba 99 de 100 prompts daninos y tras la edicion rechaza 17 de 100, con una divergencia KL de 0,1841, la mas alta de su coleccion (el hermano E4B se queda en 0,1215). Es decir, gana obediencia a costa de un desplazamiento de pesos notable, que puede traducirse en deriva de tono y formato.

El otro punto relevante es el empaquetado: los 5.104.297.504 parametros se reducen a unos 2,3B activos por token gracias a las Per-Layer Embeddings, lo que permite inferencia en GPU de consumo e incluso en movil. El GGUF publicado conserva la torre de vision SigLIP y el conformer de audio en un proyector aparte de 0,99 GB, algo poco habitual en variantes abliteradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto, imagen, video y audio) con Per-Layer Embeddings |
| Parametros totales | 5.104.297.504 (5,1B) segun safetensors |
| Parametros activos | ~2,3B por token (tablas de embedding consultadas por capa; no es un MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS; safetensors sin cuantizar. El proyector multimodal solo se distribuye en F16 |
| Idiomas soportados | Metadatos de HuggingFace: `en`. Model card: asistente multilingue en mas de 140 idiomas |
| Licencia | `apache-2.0` en los metadatos, con `license_link` a la licencia de Gemma 4 de Google (discrepancia sin resolver) |
| Formato de pesos | safetensors y GGUF, mas `gemma-4-E2B-it-heretic-mmproj-F16.gguf` (0,99 GB) necesario para vision y audio |
| Vocabulario | 262K tokens |
| Modalidades de entrada | Texto, imagen, video, audio |
| Modalidad de salida | Texto |
| Modos de razonamiento | Si, modos «thinking» configurables |
| Metodo de edicion | Ablacion direccional (abliteration) con Heretic v1.4.0, semilla `1275720981`, 550 trials |
| Proyector multimodal | 475.729.088 elementos tensoriales; tipos `gemma4v` (SigLIP) y `gemma4a` (conformer de audio) |
| Tamano del repositorio | 69,0 GB |
| Pipeline declarado | `any-to-any` |

## Arquitectura y entrenamiento

La base es un transformer denso de 5,1B parametros con Per-Layer Embeddings: el vocabulario de 262K se materializa en tablas de lookup por capa, de modo que solo unos 2,3B parametros participan en el computo por token. Esa separacion entre tablas de embedding (residentes en memoria) y computo real explica que la velocidad de decodificacion se acerque a la de un modelo de 2,3B y no a la de uno de 5,1B. La parte multimodal vive fuera del tronco: una torre de vision SigLIP y un conformer de audio, empaquetados en el fichero proyector `mmproj-F16.gguf` con los tipos de proyector `gemma4v` y `gemma4a`. El modelo acepta ademas video como entrada.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el pipeline de post-entrenamiento (RLHF, DPO u otros) del modelo base. La model card solo confirma que es una version instruct (`-it`) y que la edicion no anade conocimiento: unicamente elimina direcciones de rechazo.

La innovacion concreta de esta ficha es el proceso de abliteration. Heretic v1.4.0 ejecuta una busqueda de 550 trials con `direction_index` seleccionado por capa y aplica correcciones de peso en `attn.o_proj` y `mlp.down_proj`, cada una con peso maximo, posicion del peso maximo, peso minimo y distancia del peso minimo. Los valores finales fueron: `direction_index` 17,24; `attn.o_proj` max 1,47 en posicion 22,28 y min 0,49 a distancia 17,99; `mlp.down_proj` max 1,49 en posicion 21,15 y min 0,61 a distancia 19,78. El resultado se mide con dos numeros inseparables: KL 0,1841 y 17/100 rechazos.

## Capacidades

- Generacion de texto y razonamiento con modos «thinking» configurables, incluido razonamiento sin herramientas (AIME 2026 sin tools: 37,5% en el modelo base).
- Comprension de imagen: analisis de documentos, capturas de pantalla, interfaces y diagramas (MMMU-Pro 44,2%, MATH-Vision 52,4% en el base).
- Comprension de audio: transcripcion y entendimiento de voz gracias al conformer incluido en el proyector (CoVoST 33,47; FLEURS 0,09 en el base).
- Entrada de video, con el mismo tronco multimodal que imagen y audio.
- Capacidades multilingues: la model card declara mas de 140 idiomas, aunque los metadatos de HuggingFace solo listan `en` (MMMLU 67,4% en el base).
- Generacion de codigo (LiveCodeBench v6 44,0%, Codeforces ELO 633 en el base).
- Uso agentico: el benchmark Tau2 (24,5% en el base) sugiere evaluacion de tareas multi-paso con herramientas, pero la model card no detalla el soporte explicito de tool calling ni su sintaxis.
- Respuesta directa sin rechazos en la mayoria de casos (17/100 rechazos frente a 99/100 del base), orientada a roleplay y escritura sin filtros.
- Ejecucion on-device: disenado para edge, movil y GPU de consumo.

## Casos de uso

- Analisis local de documentos y capturas de pantalla: el modelo recibe la imagen junto con una pregunta y devuelve texto; con 128K de contexto se pueden encadenar decenas de paginas o capturas de una misma sesion sin recortar. Adecuado porque la torre SigLIP se conserva intacta tras la abliteration.
- Transcripcion y comprension de audio en el dispositivo: cargando el GGUF principal mas `mmproj-F16.gguf` se obtiene entrada de voz sin depender de APIs externas, util para actas de reunion o notas de voz en portatil.
- Asistente multilingue de proposito general: la model card declara cobertura de mas de 140 idiomas, lo que permite atender consultas en varios idiomas desde una unica instancia de ~4,4 GB en Q4_K_M.
- Roleplay y escritura creativa sin friccion: es el caso de uso declarado por los tags `roleplay` y `uncensored`; el modelo responde en lugar de declinar, lo que encaja en ficcion interactiva y proyectos de escritura asistida.
- Procesamiento de video en el borde: analisis de fotogramas o clips cortos en hardware de consumo, sin subir el material a la nube, aprovechando que el modelo corre en 8 GB de VRAM en Q4_K_M.
- Pipelines de evaluacion y red teaming: util para estudiar el efecto de la abliteration (comparar KL y tasa de rechazos frente al base) y para probar clasificadores de seguridad contra un modelo deliberadamente sin alineacion.
- Prototipado de asistentes offline en movil o Apple Silicon: el consumo de ~3,4 GB en Q4_K_M y la decodificacion cercana a un 2,3B lo hacen viable en telefonos y portatiles sin GPU dedicada.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base `google/gemma-4-E2B-it`. La model card indica que la abliteration no los altera porque solo elimina direcciones de rechazo, pero no se han re-medido sobre esta variante.

| Benchmark | Este modelo (heredado del base) |
|---|---|
| MMLU-Pro | 60,0% |
| GPQA Diamond | 43,4% |
| AIME 2026 (sin herramientas) | 37,5% |
| LiveCodeBench v6 | 44,0% |
| Codeforces ELO | 633 |
| Tau2 | 24,5% |
| BigBench Extra Hard | 21,9% |
| MMMLU | 67,4% |
| MMMU-Pro | 44,2% |
| MATH-Vision | 52,4% |
| MedXPertQA MM | 23,5% |
| CoVoST | 33,47 |
| FLEURS | 0,09 |

Metrica de alineacion medida por el autor sobre esta variante:

| Metrica | Este modelo | `google/gemma-4-E2B-it` |
|---|---|---|
| Divergencia KL | 0,1841 | 0 (por definicion) |
| Rechazos | 17/100 | 99/100 |

No se especifica en la model card la metrica empleada en CoVoST ni en FLEURS (la cifra 0,09 apunta a una tasa de error, sin confirmacion).

## Requisitos de hardware

- VRAM estimada solo para pesos de texto: 3,30 GB (IQ4_XS), 3,42 GB (Q4_K_M), 3,62 GB (Q5_K_M), 3,83 GB (Q6_K), 4,95 GB (Q8_0).
- Con vision y audio hay que sumar el proyector fijo de 0,99 GB: 4,28 / 4,40 / 4,60 / 4,82 / 5,93 GB respectivamente.
- Cache KV: aproximadamente 1 GB adicional por cada 32K de contexto, es decir, unos 4 GB extra para explotar los 128K completos.
- GPU recomendadas segun la tabla del autor: RTX 4090/5090 (24 GB) para Q8_0; RTX 4080/5080/4060 Ti 16G para Q6_K; RTX 3060/4070/5070 (12 GB) para Q5_K_M; RTX 4060/3070 (8 GB) para Q4_K_M; GTX 1660 Super/2060/3050 laptop (6 GB) para IQ4_XS.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 8 GB o mas ejecuta el modelo completo con vision y audio en Q4_K_M. En 6 GB hay que bajar a IQ4_XS.
- CPU y Apple Silicon: Q4_K_M (3,42 GB de texto, 4,40 GB con proyector) es la opcion indicada por el autor para uso sin GPU.
- Opciones de despliegue confirmadas: `transformers` (libreria declarada) y llama.cpp/GGUF por los ficheros publicados. El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. No hay confirmacion de vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles como cifra. El autor indica cualitativamente que la decodificacion se acerca a la de un modelo de 2,3B porque las tablas de embedding son lookups, aunque deben permanecer residentes en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saidutta69/gemma-4-E2B-it-heretic` (este) | 5,1B totales, ~2,3B activos | 128K | KL 0,1841; 17/100 rechazos | apache-2.0 con enlace a licencia Gemma 4 (discrepancia) | GGUF multimodal completo con audio + safetensors |
| `google/gemma-4-E2B-it` (base) | 5,1B totales, ~2,3B activos | 128K | KL 0; 99/100 rechazos | licencia Gemma 4 | safetensors; GGUF oficial no confirmado en esta informacion |
| `saidutta69/gemma-4-E4B-it-heretic` (hermano) | no disponible | no disponible | KL 0,1215 | no disponible | variante heretic del mismo autor, con mas «headroom» |
| Otras variantes de la coleccion (granite, Qwen) | no disponible | no disponible | KL inferior segun el autor | no disponible | mencionadas sin identificar en la model card |

El eje de comparacion real no es el tamano sino el coste de la edicion: el E4B logra un KL de 0,1215 frente al 0,1841 de este E2B, lo que implica que el E2B es la variante mas «movida» de las dos y la que mas deriva cabe esperar en tono y formato.

## Limitaciones y advertencias

- Deriva por abliteration: KL 0,1841 es el valor mas alto de la coleccion del autor; cabe esperar diferencias de tono, formato y coherencia frente al base. El propio autor recomienda hacer spot-check con prompts propios antes de confiar en el modelo.
- La abliteration no anade capacidades ni conocimiento: los benchmarks son los del base y no se han re-medido, por lo que el rendimiento real de esta variante en MMLU-Pro, MMMU-Pro o LiveCodeBench es desconocido.
- Quedan 17 de cada 100 rechazos: no es un modelo completamente sin filtros, y la tasa puede variar con el prompt.
- Sin guardrails de seguridad: al suprimir direcciones de rechazo, el modelo puede producir contenido danino, sexual, violento o ilegal. No es apto para exposicion directa a usuarios finales sin una capa de moderacion externa.
- Riesgo de alucinacion: inherente a la familia y no mitigado por la edicion; con entradas de imagen o audio el riesgo aumenta porque el modelo puede describir elementos que no estan en la entrada.
- Ambiguedad de licencia: los metadatos declaran `apache-2.0`, pero el `license_link` apunta a la licencia de Gemma 4 de Google, que no es Apache. Antes de uso comercial hay que verificar que licencia prevalece; la del modelo base es la de Gemma.
- Idiomas: los metadatos solo declaran `en`, mientras la model card afirma mas de 140 idiomas. La discrepancia no esta resuelta y no hay evaluacion por idioma publicada para esta variante.
- Dependencia del proyector: para imagen, video o audio hay que cargar tambien `mmproj-F16.gguf`; usar solo el GGUF principal desactiva silenciosamente las entradas no textuales.
- Coste de contexto: ~1 GB de VRAM por cada 32K adicionales; los 128K completeos requieren unos 4 GB extra sobre los pesos.
- Validacion nula de la comunidad: 0 descargas y 0 likes en el momento de la ficha, repositorio de 69 GB y ninguna evaluacion independiente.
- Trazabilidad: el autor no publica los 100 prompts de la prueba de rechazos ni la metodologia exacta de medida del KL, por lo que las cifras de alineacion no son reproducibles externamente a partir de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/gemma-4-E2B-it-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante hermana E4B heretic: https://huggingface.co/saidutta69/gemma-4-E4B-it-heretic
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Licencia de Gemma 4 referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- Fichero proyector multimodal: `gemma-4-E2B-it-heretic-mmproj-F16.gguf` en el repositorio del modelo
