# kingjones777/Nex-N2.5-mini-ROCmFP4-GGUF

## Resumen

Nex-N2.5-mini-ROCmFP4-GGUF es un conjunto de cuantizaciones de 4 bits del modelo multimodal nex-agi/Nex-N2.5-mini, publicadas por el usuario kingjones777. No es un modelo entrenado desde cero, sino una conversión a formato GGUF optimizada para el backend ROCmFP4/ROCmFPX de llama.cpp sobre GPUs integradas AMD de la familia Strix Halo (gfx1151). El modelo base es un MoE de arquitectura Qwen3.5 con 40 capas (30 de atención lineal Gated DeltaNet y 10 de atención completa), 256 expertos enrutados con 8 activos, 262.144 tokens de contexto y soporte de texto e imagen.

El repositorio incluye tres variantes de cuantización —STRIX_LEAN, COHERENT y FAST— de entre 17,37 y 18,48 GiB, además del proyector de visión. Todas mantienen la capa `output.weight` en Q6_K, lo que las distingue de otra conversión pública del mismo modelo. El autor aporta métricas de calidad (divergencia KL frente a BF16, perplejidad y coincidencia top-1) y de velocidad medidas sobre un Ryzen AI Max+ 395 con Radeon 8060S.

Su relevancia es doble: por un lado, el modelo base no publica GGUF oficial, de modo que estas conversiones son la vía práctica para ejecutarlo en llama.cpp; por otro, están ajustadas específicamente a hardware AMD integrado, un nicho con menos soporte de cuantizaciones que las GPUs NVIDIA. Con 32 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de comunidad reciente (creado el 17 de septiembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE Qwen3.5 de 40 capas: 30 capas de atencion lineal Gated DeltaNet + 10 capas de atencion completa; 256 expertos enrutados, 8 activos |
| Parametros totales | 34.660.610.688 pesos en los ficheros GGUF; 35.107.181.936 parametros en BF16 (la diferencia son los 446.571.248 pesos de la torre de vision) |
| Parametros activos | no disponible (se sabe que activan 8 de 256 expertos enrutados) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_0-ROCmFP4 en tres variantes: STRIX_LEAN (ftype 106, 4,32 BPW), COHERENT (ftype 102, 4,58 BPW) y FAST (ftype 103, 4,30 BPW); `output.weight` en Q6_K en las tres. Referencia BF16 (16,01 BPW) no publicada |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector de vision incluido en el repositorio |

## Arquitectura y entrenamiento

El modelo base nex-agi/Nex-N2.5-mini emplea una arquitectura híbrida de tipo MoE con 40 capas: 30 de ellas usan atención lineal Gated DeltaNet y las 10 restantes atención completa, una combinación orientada a reducir el coste de la ventana de contexto larga manteniendo capacidad de recuperación a larga distancia. El enrutamiento dispersa cada token entre 256 expertos, de los que se activan 8. El checkpoint en BF16 declara 35.107.181.936 parámetros, de los cuales 446.571.248 pertenecen a la torre de visión, lo que habilita la modalidad image-text-to-text. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

En cuanto al artefacto aquí descrito, se trata exclusivamente de una conversión de pesos, no de un entrenamiento. El autor señala que el checkpoint no incluye pesos del cabezal MTP (`config.json` declara `mtp_num_hidden_layers: 1`, pero la conversión BF16 no contiene tensores `nextn`), por lo que estas cuantizaciones no ofrecen decodificación especulativa. Todas las variantes conservan la capa de salida en Q6_K, y existe un repositorio hermano con builds generados con importance matrix (imatrix) que reducen la divergencia KL entre un 18 % y un 21 % al mismo tamaño.

## Capacidades

- Generación de texto conversacional multirrol, con etiqueta `conversational` y pipeline `image-text-to-text`.
- Razonamiento: la model card etiqueta el modelo base con `reasoning`, aunque no se documenta un modo de pensamiento explícito.
- Procesamiento de imágenes junto con texto: el repositorio incluye el proyector de visión, requisito para usar la torre de 446,5 millones de parámetros.
- Contexto largo de hasta 262.144 tokens, útil para documentos extensos o repositorios de código completos.
- Arquitectura MoE con 256 expertos enrutados y 8 activos, lo que reduce el coste por token respecto a un denso del mismo tamaño total.
- Inferencia en backend ROCm y Vulkan de llama.cpp, con endpoints compatibles según la etiqueta `endpoints_compatible`.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en la ficha de HuggingFace.
- Decodificación especulativa: no soportada, al no incluirse pesos del cabezal MTP.

## Casos de uso

- Inferencia local en equipos AMD Strix Halo: es el escenario para el que se construyó el repositorio. Sobre un Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) se miden 61,74-63,94 tok/s de decodificación en ROCm 7.2.4 y 68,00-68,62 tok/s en Vulkan, con ficheros de 17-18 GiB que caben en la memoria unificada del sistema.
- Asistente de código con contexto amplio: en las pruebas del autor se usa un prompt de 7.094-7.102 tokens extraído de `convert_hf_to_gguf.py`, y el prefill alcanza 1.157-1.187 tok/s en ROCm. Con 262.144 tokens de ventana se pueden incluir módulos completos de un repositorio sin trocear.
- Atención al cliente multirrol: la combinación de contexto largo y arquitectura MoE permite mantener historiales extensos con coste de cómputo contenido, siempre que se despliegue un servidor llama.cpp con `--parallel` ajustado al hardware.
- Análisis de documentos con imágenes: el proyector de visión incluido permite flujos de pregunta-respuesta sobre capturas, diagramas o páginas escaneadas, sin necesidad de un modelo OCR separado.
- Despliegue en entornos aislados o con datos sensibles: la licencia apache-2.0 y la disponibilidad de los pesos en local permiten ejecutar el modelo sin enviar información a APIs externas.
- Selección de cuantización en producción: las métricas publicadas (KLD, perplejidad y coincidencia top-1 frente a BF16) permiten decidir entre STRIX_LEAN, COHERENT o FAST en función del equilibrio calidad/velocidad que exija el servicio.
- Servidor compatible con API de OpenAI: la etiqueta `endpoints_compatible` y el uso de `llama-server` facilitan sustituir un endpoint remoto por uno local en aplicaciones ya existentes.
- Evaluación comparativa de backends: el repositorio publica resultados en ROCm y Vulkan sobre el mismo hardware, lo que sirve como referencia para decidir qué backend desplegar en una APU Strix Halo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos son métricas de fidelidad de la cuantización y de velocidad, medidas por el autor sobre un Ryzen AI Max+ 395 (Radeon 8060S, `gfx1151`), ROCm 7.2.4, `llama-server` en el commit `d3ca537`, `-c 65536`, `--parallel 1`, decodificación greedy (`temp 0`, `top_k 1`), con `ignore_eos` para generar exactamente 256 tokens tras un prompt de 7.094-7.102 tokens, y `cache_prompt: false`.

| Fichero | ftype | Tamano | BPW | KLD vs BF16 | Coincidencia top-1 | PPL (× BF16) | TG ROCm0 (tok/s) | TG Vulkan0 (tok/s) | PP ROCm0 (tok/s) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| STRIX_LEAN | 106 | 17,46 GiB | 4,32 | 0,1044 ± 0,0014 | 86,66 % | 6,4740 ± 0,0798 (×1,0393) | 63,94 | 68,16 | 1.158 |
| COHERENT | 102 | 18,48 GiB | 4,58 | 0,0971 ± 0,0013 | 87,29 % | 6,5617 ± 0,0812 (×1,0534) | 61,74 | 68,00 | 1.187 |
| FAST | 103 | 17,37 GiB | 4,30 | 0,1088 ± 0,0014 | 86,41 % | 6,5498 ± 0,0809 (×1,0515) | 63,31 | 68,62 | 1.157 |
| Referencia BF16 | 32 | 64,61 GiB | 16,01 | 0 | 100 % | 6,2290 ± 0,0753 | no disponible | no disponible | no disponible |

La calidad se evalúa frente a logits BF16 calculados en CPU sobre un corpus reservado (wikitext-2 test, `-c 2048`, 40 fragmentos de 1.023 tokens puntuados cada uno, 40.920 tokens en total), nunca sobre el texto de calibración de la imatrix. Según el autor, una diferencia de velocidad inferior al 3 % en decodificación o prefill debe considerarse empate. Los builds con importance matrix reducen la KLD a 0,0852 (STRIX_LEAN), 0,0769 (COHERENT) y 0,0890 (FAST) al mismo tamaño.

## Requisitos de hardware

- Peso en disco de cada cuantización: 17,37 GiB (FAST), 17,46 GiB (STRIX_LEAN) y 18,48 GiB (COHERENT). El repositorio completo ocupa 58,1 GB.
- Memoria necesaria para inferencia: el tamaño del fichero seleccionado más el proyector de visión (que aloja los 446.571.248 parámetros de la torre visual). El coste exacto de la caché KV para los 262.144 tokens de contexto no está publicado; en las pruebas se usó `-c 65536`.
- Hardware validado: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151), es decir, una APU de consumo con memoria unificada. No hay datos publicados para GPUs NVIDIA ni para otras generaciones de AMD.
- Cabe en GPU de consumo: sí, en el hardware Strix Halo citado. Para GPUs discretas no se aportan mediciones, y el formato ROCmFP4 es específico de AMD.
- Opciones de despliegue: `llama.cpp` / `llama-server`, con backends ROCm 7.2.4 y Vulkan. No se confirma compatibilidad con vLLM, TGI, Ollama u otros motores.
- Latencia y throughput medidos: decodificación de 61,74-63,94 tok/s en ROCm0 y 68,00-68,62 tok/s en Vulkan0 tras un prompt de ~7.100 tokens; prefill de 1.157-1.187 tok/s en ROCm0. No hay decodificación especulativa activa, al no incluirse cabezal MTP.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan comparar con modelos de otras familias. La comparación posible es entre las variantes del propio modelo:

| Build | Tamano | BPW | KLD vs BF16 | TG ROCm0 (tok/s) | Prefill ROCm0 (tok/s) | Notas |
|---|---:|---:|---:|---:|---:|---|
| STRIX_LEAN (este repo) | 17,46 GiB | 4,32 | 0,1044 | 63,94 | 1.158 | Opción recomendada por el autor para empezar; `output.weight` en Q6_K |
| COHERENT (este repo) | 18,48 GiB | 4,58 | 0,0971 | 61,74 | 1.187 | KLD un 7,1 % menor que STRIX_LEAN a cambio de 1.051 MiB más y un 3,6 % menos de velocidad |
| FAST (este repo) | 17,37 GiB | 4,30 | 0,1088 | 63,31 | 1.157 | Sin ventaja clara de velocidad y peor KLD que STRIX_LEAN |
| imatrix (repo hermano) | mismo tamano | mismo | 0,0852 / 0,0769 / 0,0890 | no disponible | no disponible | Entre un 18 % y un 21 % menos de KLD al mismo tamaño |
| julianmb/Nex-N2.5-mini-ROCmFP4-GGUF | no disponible | no disponible | no disponible | no disponible | no disponible | Almacena `output.weight` como Q4_0_ROCMFP4_FAST y no lleva metadatos de imatrix |
| BF16 de referencia | 64,61 GiB | 16,01 | 0 | no disponible | no disponible | Conversión no publicada |

## Limitaciones y advertencias

- No hay datos de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros), por lo que el rendimiento real en tareas concretas no está documentado.
- Todas las mediciones de velocidad proceden de un único equipo (Ryzen AI Max+ 395, Radeon 8060S) y de una única configuración de llama.cpp; no son extrapolables a otras GPUs ni a otros backends.
- Las cuantizaciones de 4 bits pierden fidelidad respecto a BF16: la coincidencia top-1 se sitúa entre el 86,41 % y el 87,29 %, y la perplejidad empeora entre un 3,9 % y un 5,3 %. En tareas sensibles a la precisión (código, matemáticas) esto puede traducirse en errores adicionales.
- No se incluyen pesos del cabezal MTP, de modo que no hay decodificación especulativa y la latencia de decodificación no puede reducirse por esa vía.
- El formato ROCmFP4 está orientado a GPUs AMD gfx1151; no se ha validado en hardware NVIDIA ni en otras arquitecturas AMD.
- No se declaran idiomas soportados en la ficha de HuggingFace, por lo que el comportamiento multilingüe es desconocido.
- La licencia es apache-2.0, lo que en principio permite uso comercial, pero al derivar del modelo nex-agi/Nex-N2.5-mini conviene verificar las condiciones del modelo base antes de un despliegue en producción.
- Se trata de un artefacto de comunidad con 32 descargas y 0 likes: no ha pasado por una validación independiente amplia.
- El riesgo de alucinación y los sesgos del modelo base no están documentados en la información disponible.
- La model card consultada está truncada, por lo que podrían existir detalles adicionales (por ejemplo, sobre la calibración de la imatrix o la sección de inicio rápido) no recogidos aquí.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kingjones777/Nex-N2.5-mini-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Builds con importance matrix del mismo autor: https://huggingface.co/kingjones777/Nex-N2.5-mini-ROCmFP4-imatrix-GGUF
- Otra conversión pública ROCmFP4 del mismo modelo: https://huggingface.co/julianmb/Nex-N2.5-mini-ROCmFP4-GGUF

Nota: la búsqueda web realizada no ha devuelto resultados relacionados con el modelo; los enlaces obtenidos corresponden al foro de soporte de HP y no son relevantes para esta ficha. No se dispone de papers, blogs ni demos adicionales.
