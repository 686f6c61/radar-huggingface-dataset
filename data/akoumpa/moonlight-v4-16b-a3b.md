# akoumpa/Moonlight-V4-16B-A3B

## Resumen

Moonlight-V4-16B-A3B es una configuración de arquitectura publicada en HuggingFace por el usuario akoumpa que reproduce el diseño de DeepSeek-V4 a la escala del modelo Moonlight-16B-A3B de Moonshot. No es un modelo entrenado: el repositorio contiene únicamente ficheros de configuración (`config.json`, `inference_config.json` y un análisis comparativo `COMPARISON.md`), sin pesos, con 0 descargas y 0 likes en el momento de la consulta. Su interés es documental y de investigación: traslada a una escala media (2048 de dimensión oculta, 27 capas, vocabulario de 163 840) todas las decisiones arquitectónicas atribuidas a la familia DeepSeek-V4.

El modelo resultante tendría 16 527 519 335 parámetros totales (15,856 mil millones sin embeddings) y 2,980 mil millones activados por token (2,309 mil millones sin embeddings), cifras calculadas a partir de las formas de los tensores e instanciando la implementación de referencia de DeepSeek y `DeepseekV4ForCausalLM` de transformers sobre meta device. La arquitectura combina atención híbrida (Compressed Sparse Attention y Heavily Compressed Attention), hiper-conexiones con restricción de variedad (mHC), enrutado hash en la primera capa MoE y una ventana de contexto declarada de 1 048 576 tokens.

Es relevante ahora porque permite estudiar, sin coste de entrenamiento, cómo se reparte el presupuesto de parámetros entre atención, MoE y residuos cuando se sustituye la MLA densa de DeepSeek-V3 por el esquema híbrido de V4, y porque cuantifica el ahorro de caché KV (de 243,0 MiB a 18,6 MiB a 8K; de 30,38 GiB a 2,09 GiB a 1M) que ese cambio implicaría en un modelo de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE en todas las capas y atención híbrida: 2 capas de ventana deslizante, 13 capas CSA (ratio 4, solapada, con indexador) y 12 capas HCA (ratio 128) |
| Parametros totales | 16 527 519 335 (16,528 mil millones); 15,856 mil millones sin embeddings |
| Parametros activos | 2,980 mil millones por token (2,309 mil millones sin embeddings); MoE con top-6 sobre 64 expertos enrutados de 1408 y 1 experto compartido |
| Longitud de contexto | 1 048 576 tokens (theta 10 000 en capas deslizantes, 160 000 en capas comprimidas, YaRN x16 desde 65 536) |
| Tipos de cuantizacion | No disponible: no se publican pesos. La configuración prevé caché KV en FP8 (dims no-RoPE) + bf16 (dims RoPE) + claves del indexador en FP4 |
| Idiomas soportados | No disponible (no hay datos de entrenamiento ni evaluación) |
| Licencia | MIT |
| Formato de pesos | No aplica: solo JSON de configuración (`config.json`, `inference_config.json`). Sin safetensors, GGUF ni otros formatos de pesos |

Datos adicionales de la configuración: dimensión oculta 2048; 27 capas; vocabulario 163 840; `rms_norm_eps` 1e-06; sin capas densas (`first_k_dense_replace` 0, sustituida por enrutado hash por `tid2eid`); sin MTP (`n_mtp_layers` 0).

## Arquitectura y entrenamiento

La arquitectura mantiene la anchura, profundidad, número de expertos y tamaño de experto de Moonlight-16B-A3B, pero cambia el mecanismo de atención y el flujo residual. La atención usa MQA con KV compartida: 16 cabezas de consulta con `head_dim` 512 (los últimos 64 dims con RoPE) y una única entrada de 512 dimensiones que actúa a la vez como clave y valor; la ruta de consulta pasa por un `q_lora_rank` de 512 compartido con el indexador. La proyección de salida es de rango bajo agrupado: `o_groups` 2 (8 cabezas por grupo) con `o_lora_rank` 1024. Cada capa aplica ventana deslizante de 128 tokens y un logit de sumidero de atención aprendible por cabeza; el indexador "lightning" tiene 64 cabezas de 128 dimensiones con `index_topk` 512. La programación de atención es `[0, 0, (4, 128) x 12, 4]`.

El bloque MoE se repite en las 27 capas con 64 expertos enrutados de 1408 parámetros de anchura, top-6, un experto compartido, puntuación `sqrtsoftplus`, sesgo aux-loss-free y `routed_scaling_factor` 2,441. La primera capa MoE se enruta por hash del id de token en lugar de por router aprendido. El flujo residual usa hiper-conexiones mHC con `hc_mult` 4 y 20 iteraciones de Sinkhorn, y la SwiGLU lleva un límite de recorte (`swiglu_limit`) de 10,0. Desglose por capa: atención 18,9M (deslizante) / 28,4M (CSA: 18,9M núcleo + 4,2M compresor + 5,4M indexador) / 21,0M (HCA); MoE 562,4M totales y 60,7M activados (8,7M por experto); mHC 393 270. Totales por capa: 581,7M / 591,3M / 583,9M, con 80,0M / 89,5M / 82,1M activados. Embedding y cabeza suman 335,5M cada uno.

No hay entrenamiento: el repositorio no incluye pesos, tokens de entrenamiento, composición de dataset ni fases de RLHF/DPO. La model card cita como referencia que el Moonlight-16B-A3B original se entrenó con optimizador Muon sobre 5,7 billones de tokens, pero ese dato corresponde al modelo de Moonshot, no a esta configuración. Eficiencia declarada: FLOPs de atención por token generado de 0,79 GF a 8K y 59,4 GF a 1M (frente a 2,26 GF y 290 GF del esquema MLA denso), con 5,16 GF en capas lineales; una consulta CSA atiende a 128 entradas de ventana más 512 entradas comprimidas seleccionadas, y una HCA a 128 más L/128, de modo que el coste de atención es casi plano respecto a la longitud de contexto.

## Capacidades

- No hay capacidades verificables: el artefacto publicado no contiene pesos y, por tanto, no genera texto, no razona y no ejecuta código. Las capacidades que se enumeran a continuación son las que la arquitectura está diseñada para habilitar una vez entrenada, no prestaciones demostradas.
- Generación de texto autoregresiva con ventana de contexto declarada de 1 048 576 tokens, con decodificación soportada por caché KV comprimida.
- Enrutado eficiente de cómputo: 2,980 mil millones de parámetros activados por token sobre 16,528 mil millones totales, lo que sitúa el coste por token en el orden de un modelo denso de ~3B con huella de memoria de ~16,5B.
- Capacidad teórica de tool calling y razonamiento multi-paso: la arquitectura conserva el esquema decoder-only estándar y el chat template es responsabilidad de quien la entrene; no se documenta ningún formato de función ni modo de pensamiento.
- Capacidades multilingües: no disponibles. El vocabulario de 163 840 entradas es el del linaje DeepSeek, pero no hay datos de cobertura lingüística ni de evaluación.
- Capacidad especial reseñable a nivel de arquitectura: indexador de atención dispersa con selección top-512, sumideros de atención aprendibles por cabeza y compresión de contexto por ratios 4 y 128.
- Compatibilidad declarada con `transformers >= 5.8` mediante `DeepseekV4ForCausalLM`, y con el fichero `inference/model.py` de referencia de DeepSeek a través de `inference_config.json`.

## Casos de uso

- Investigación de arquitectura a escala media: instanciar la configuración y medir reparto de parámetros, FLOPs por token y coste de atención frente a MLA densa, usando `COMPARISON.md` como base de comparación contra Moonlight-16B-A3B.
- Diseño de recetas de entrenamiento: la configuración sirve como punto de partida para definir hiperparámetros (Muon u otro optimizador, programación de learning rate, presupuesto de tokens) antes de comprometer cómputo en un preentrenamiento de 16,5B.
- Estudio de eficiencia de caché KV en contexto largo: los valores declarados (18,6 MiB a 8K, 135,3 MiB a 64K, 2,09 GiB a 1M por secuencia) permiten planificar memoria de servicio y validar estrategias de cuantización FP8/FP4 en claves.
- Desarrollo de kernels y stacks de serving: validar la implementación del compresor, el indexador top-512, los sumideros de atención y el enrutado hash en entornos como transformers o en implementaciones propias, antes de que existan pesos reales.
- Ablaciones controladas de componentes de V4: comparar variantes con y sin indexador, con distinto `compress_ratio` o con y sin mHC, aprovechando las versiones reducidas del mismo autor (1B con `h16d256` y `h16d256-r8`).
- Planificación de hardware y coste de despliegue: calcular requisitos de VRAM, paralelismo y ancho de banda para un MoE de 16,5B con 2,98B activos a distintas precisiones.
- Verificación de recuentos de parámetros y reproducibilidad: el script `count_params.py` citado en la model card reproduce los tamaños publicados de Moonlight, DeepSeek-V3, V4-Flash y V4-Pro, lo que sirve como herramienta de auditoría de configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay pesos, no hay modelo entrenado y no existen evaluaciones de calidad (MMLU, HumanEval, GSM8K ni similares) asociadas a este repositorio.

Las únicas métricas publicadas son analíticas y derivadas de la configuración, no medidas sobre un modelo en ejecución:

| Metrica | Moonlight-16B-A3B (referencia) | Moonlight-V4-16B-A3B |
|---|---:|---:|
| KV cache por secuencia a 8K | 243,0 MiB | 18,6 MiB |
| KV cache por secuencia a 64K | 1,90 GiB | 135,3 MiB |
| KV cache por secuencia a 1M | 30,38 GiB | 2,09 GiB |
| FLOPs de atención por token a 8K | 2,26 GF | 0,79 GF |
| FLOPs de atención por token a 1M | 290 GF | 59,4 GF |
| FLOPs en capas lineales por token | 5,29 GF | 5,16 GF |
| Parametros totales | 15,960 mil millones | 16,528 mil millones |
| Parametros activados por token | 2,915 mil millones | 2,980 mil millones |

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros; no son medidas de ejecución, ya que el repositorio no contiene pesos que puedan cargarse.

- VRAM solo para pesos (16,528 mil millones de parámetros): ~33,1 GB en bf16, ~16,5 GB en FP8, ~8,3 GB en 4 bits más overhead de cuantización.
- Caché KV a añadir por secuencia: 18,6 MiB a 8K, 135,3 MiB a 64K y 2,09 GiB a 1M, en el supuesto de que se aplique la cuantización mixta FP8/FP4 prevista.
- GPU recomendadas en bf16: H100 80 GB o A100 80 GB con holgura; A100 40 GB y L40S 48 GB quedan muy justas al sumar caché y activaciones. En FP8 se requieren aceleradores con soporte nativo (Hopper o posterior).
- GPU de consumo: una RTX 4090 de 24 GB no admite bf16 completo; necesitaría cuantización a 8 o 4 bits del conjunto de pesos. Dos RTX 4090 (48 GB) sí permitirían bf16 con contexto moderado.
- Paralelismo: al ser MoE, el despliegue en varias GPU se beneficia de tensor parallel para la atención y expert parallel para las 27 capas MoE.
- Opciones de despliegue: `transformers >= 5.8` con `DeepseekV4ForCausalLM` y la implementación de referencia `inference/model.py` de DeepSeek están soportadas a nivel de configuración. vLLM, llama.cpp, Ollama y TGI no se documentan como compatibles, y sin pesos no pueden ejecutar el modelo.
- Latencia y throughput: no disponibles. Como referencia estructural, el cómputo por token es el de un modelo de ~2,98B de parámetros activos, con 5,16 GF en capas lineales más 0,79 GF de atención a 8K, pero el ancho de banda de memoria lo marca el conjunto de 16,5B residente.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros (total / activos) | Contexto | Estado | Licencia |
|---|---|---|---|---|---|
| Moonlight-V4-16B-A3B (este repo) | DeepSeek-V4 con atención híbrida CSA/HCA, mHC, enrutado hash | 16,528 mil M / 2,980 mil M | 1 048 576 | Solo configuración, sin pesos | MIT |
| Moonlight-16B-A3B (Moonshot) | DeepSeek-V3 con MLA densa en todas las capas | 15,960 mil M / 2,915 mil M | 8 192 | Publicado y entrenado (Muon, 5,7 T tokens) | No disponible en la informacion proporcionada |
| akoumpa/Moonlight-V4-1B-h16d256 | DeepSeek-V4 reducido a 1024 oculta / 15 capas / 32 expertos, 16 x 256 cabezas | 1,00 mil M / 0,54 mil M | No disponible | Configuración más receta entrenable | No disponible |
| akoumpa/Moonlight-V4-1B-h16d256-r8 | Igual que el anterior con compresión ratio 8 y sin indexador | 0,98 mil M / 0,52 mil M | No disponible | Configuración más receta entrenable | No disponible |
| deepseek-ai/DeepSeek-V4-Flash | DeepSeek-V4 | No disponible | No disponible | Referencia citada, usada para fijar valores como `index_topk` 512 y `o_lora_rank` 1024 | No disponible |

Frente a Moonlight-16B-A3B, el presupuesto se redistribuye: las 27 capas pasan a ser MoE (la capa 0 del original era un MLP denso de 69M), el FFN por token baja de 8 a 7 anchos de experto y la atención sube de 0,66B a 0,37B... en concreto, la atención aproximadamente se duplica respecto a la del modelo de referencia porque la cabeza compartida de 512 con ruta q/o de rango bajo, compresores, indexadores y sumideros pesa más que 16 cabezas MLA. El resultado deja los parámetros activados a menos de un 3 % de los de Moonlight, motivo del nombre 16B-A3B.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no se puede cargar ni ejecutar el modelo; los ficheros son exclusivamente de configuración (`config.json`, `inference_config.json`, `COMPARISON.md`).
- La configuración está marcada explícitamente como `untrained` y `from-scratch`: no ha visto datos y no tiene ninguna capacidad de generación, razonamiento ni código.
- No existen benchmarks, evaluaciones, datos de idiomas ni resultados de calidad publicados. Cualquier cifra de rendimiento que se atribuya al modelo sería inventada.
- Métricas de estado muy bajas: 0 descargas, 0 likes y un tamaño de repositorio de 0,0 GB, lo que indica que no ha sido validado por terceros.
- Autoría: no procede de Moonshot AI ni de DeepSeek, sino de un usuario independiente; el diseño se deriva de material publicado de ambos, pero la configuración no está respaldada oficialmente por ellos.
- Los resultados de la búsqueda web asociada no aportan información técnica sobre el modelo (contenido genérico sobre Python), por lo que no permiten contrastar ni ampliar los datos de la model card.
- Fechas de creación y actualización (18 de septiembre de 2026) y referencias arXiv con identificadores de 2026: conviene verificar la procedencia y vigencia de esos enlaces antes de citarlos.
- El coste de las innovaciones arquitectónicas no está medido: mHC con 20 iteraciones de Sinkhorn, indexador de 64 cabezas y enrutado por hash añaden complejidad de implementación sin evidencia empírica de que compensen en calidad.
- La caché KV en FP8/FP4 exige hardware con soporte de esos formatos; en GPUs anteriores habría que recalcular las cifras de memoria al alza.
- Licencia MIT declarada, lo que en principio permite uso comercial de la configuración, pero al no haber pesos el punto es irrelevante hasta que exista un entrenamiento derivado; los términos de los modelos de referencia citados deben comprobarse por separado.
- Sin MTP (`n_mtp_layers` 0), por lo que no se puede usar decodificación especulativa basada en cabezas MTP integradas en esta configuración.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/akoumpa/Moonlight-V4-16B-A3B
- Modelo de referencia de la misma escala: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Variante reducida con receta entrenable: https://huggingface.co/akoumpa/Moonlight-V4-1B-h16d256
- Variante reducida con compresión ratio 8 y sin indexador: https://huggingface.co/akoumpa/Moonlight-V4-1B-h16d256-r8
- Configuración de referencia de DeepSeek V4 citada en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Referencia arXiv 2502.16982 (citada en los tags del repositorio): https://arxiv.org/abs/2502.16982
- Referencia arXiv 2606.19348 (citada en los tags del repositorio): https://arxiv.org/abs/2606.19348
- Referencia arXiv 2412.19437 (citada en los tags del repositorio): https://arxiv.org/abs/2412.19437
