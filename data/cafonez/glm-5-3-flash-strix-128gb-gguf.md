# cafonez/GLM-5.3-Flash-Strix-128GB-GGUF

## Resumen

GLM-5.3-Flash-Strix-128GB-GGUF es una cuantización GGUF de 3,00 bits por peso (bpw) del modelo zai-org/GLM-5.3-Flash, publicada por el usuario cafonez. El modelo base es un transformer de mezcla de expertos (MoE) de 320,8 mil millones de parámetros totales con 288 expertos enrutados, top-8 y aproximadamente 18 mil millones de parámetros activos por token. Esta versión cuantizada comprime los pesos hasta 112,0 GiB repartidos en tres shards, con el objetivo explícito de que el modelo completo quepa en la GPU integrada de una máquina de 128 GB de memoria unificada, en concreto un AMD Ryzen AI Max "Strix Halo".

El interés de la publicación es práctico: demuestra que un modelo de clase 320B puede ejecutarse íntegramente en GPU sobre hardware de consumo con memoria unificada, sin descargar capas a la CPU, usando llama.cpp con backend ROCm (objetivo `gfx1151`) o el fork ROCmFPX, que además aprovecha la capa MTP incluida para decodificación especulativa. La receta de cuantización es selectiva por capas y por tensor, no uniforme: los expertos enrutados (94 % de los bytes) reciben IQ2_S e IQ3_XXS, mientras que atención, expertos compartidos, FFN densa y proyecciones pequeñas se mantienen en Q5_K, Q6_K y Q8_0.

Es una publicación de nicho, orientada a quienes ya poseen una máquina de 128 GB con memoria unificada y quieren evaluar el modelo base sin infraestructura de centro de datos. El modelo base, desarrollado por Z.ai (zai-org), se distribuye con licencia MIT y, según guías de terceros, se publicó el 26 de agosto de 2026 con soporte nativo multimodal y contexto de hasta 1M de tokens; esta cuantización, en cambio, es solo de texto y se ha validado a 128K de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atención híbrida (MLA + KDA), hyper-connections, expertos compartidos y capa MTP para decodificación especulativa |
| Parámetros totales | 320,8 B (según la model card del autor de la cuantización) |
| Parámetros activos | ~18 B por token (MoE top-8 sobre 288 expertos enrutados) |
| Longitud de contexto | Entrenado hasta 1M de tokens según guías de terceros; esta cuantización se ha medido y validado a 131.072 tokens (128K) con KV cache q8_0 |
| Tipos de cuantización | Mezcla: IQ2_S (2,56 bpw), IQ3_XXS (3,06 bpw), Q5_K (5,50 bpw), Q6_K (6,56 bpw), Q8_0 (8,50 bpw), F32 para normas y sesgos; media de 3,00 bpw |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (formato `glm5-next` de llama.cpp), 3 shards |
| Modelo base | zai-org/GLM-5.3-Flash (pesos oficiales FP8, E4M3 con escalas de bloque 128x128) |
| Cuantizado por | cafonez |
| Tamaño en disco | 112,0 GiB (44,3 GB + 44,6 GB + 31,4 GB) |
| Peso cargado en memoria | 109,3 GiB de pesos; +2,7 GiB si se activa la capa MTP |
| Modalidad | Solo texto: el codificador de visión del modelo original no está incluido |
| Descargas / likes | 0 / 0 (a fecha de la información disponible) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 288 expertos enrutados y enrutamiento top-8, lo que sitúa el cómputo por token en el orden de un modelo denso de ~18B pese a los 320,8B de parámetros almacenados. La pila combina atención MLA (multi-head latent attention) con capas KDA (atención lineal de estado), un esquema híbrido que reduce el coste del KV cache: según el autor, 128K de contexto cuesta menos de 1 GiB más que 64K con caché q8_0. Incorpora además hyper-connections, expertos compartidos, un indexer y proyecciones auxiliares, y una capa MTP (next-token prediction) en la posición 45 que actúa como cabecera de borrador para decodificación especulativa.

No se dispone del número exacto de tokens de entrenamiento ni de la composición del dataset del modelo base en la información proporcionada; tampoco se detalla si hubo RLHF, DPO u otras fases de alineamiento. Lo que sí documenta esta publicación es el proceso de cuantización: los expertos enrutados se cuantizaron directamente desde los pesos FP8 oficiales, experto a experto, con el cuantizador de ggml y un vector de importancia por experto, calibrado con 32K tokens de texto mixto en inglés (WikiText-2), chino y Python. La asignación de 3 bits por capas se decidió empíricamente: al conmutar cada grupo de siete capas a IQ2_S, las capas MoE tempranas mostraron una divergencia KL entre 3 y 4 veces mayor que las tardías, de ahí que las capas 3-24 mantengan IQ3_XXS y las 25-44 bajen a IQ2_S. Se descartó podar el 15 % de expertos menos usados porque elevaba la KL a 0,43. Los tensores no pertenecientes a expertos son una copia byte a byte de GLM-5.3-Flash-Gorgon-GGUF.

## Capacidades

- Generación de texto en inglés y chino con modo de razonamiento configurable; la model card cita evaluaciones con "low reasoning effort" en HumanEval, lo que implica que existe control sobre el esfuerzo de razonamiento.
- Generación de código: la receta se evaluó con HumanEval (164 tareas), con 156 aciertos en una compilación previa de la misma receta.
- Razonamiento multi-paso y matemáticas: capacidad inherente al modelo base, aunque no se aportan benchmarks específicos en la información disponible.
- Decodificación especulativa mediante la capa MTP incluida, explotable con ROCmFPX (no con llama.cpp estándar, que todavía no ejecuta el drafting de GLM-5.3).
- Soporte de plantillas de chat vía `--jinja` en llama.cpp, lo que habilita el formato de conversación del modelo base.
- Compatibilidad con servidor HTTP de llama.cpp (`llama-server`), con parámetros de muestreo recomendados de temperatura 0,7 y top-p 0,95.
- Capacidad multimodal (visión) del modelo original no disponible en esta cuantización: el codificador de imagen ha sido eliminado.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni uso como agente; debe verificarse contra la model card del modelo base.

## Casos de uso

- Inferencia local íntegra en GPU sobre una máquina Strix Halo de 128 GB: el escenario principal de la publicación. Permite servir un modelo de 320B con 128K de contexto sin infraestructura de centro de datos, ajustando el límite GTT del kernel a 120 GiB.
- Asistencia de código en local para equipos que no pueden enviar código a APIs externas: el modelo cubre generación y completado de código con un rendimiento en HumanEval del 95,1 % en la compilación previa de esta receta, y encaja en flujos de revisión y refactorización por lotes.
- Procesamiento de documentación técnica extensa en inglés: la ventana de 128K y el reducido coste de KV cache permiten analizar manuales, expedientes o repositorios completos en una sola pasada, con la ventaja de que los datos no salen del equipo.
- Traducción y generación bilingüe inglés-chino: es el par de idiomas declarado por el modelo, útil para documentación técnica, localización de producto o atención a usuarios en ambos idiomas.
- Entorno de investigación para evaluación de cuantizaciones de muy bajo bit: la publicación aporta KLD, perplejidad y acuerdo top-1 frente a una referencia de 3,84 bpw, lo que sirve como caso de estudio reproducible de cuantización selectiva por capas en arquitecturas MoE.
- Servicio de chat interno con un único usuario o carga baja: `llama-server` con `-np 1` y contexto de 64K a 128K es un despliegue realista para prototipos, demos y validación de producto antes de mover cargas a modelos alojados.
- Experimentación con decodificación especulativa: ROCmFPX con `ROCMFPX_DRAFT_VOCAB=16384` y la capa MTP permite medir la ganancia del drafting sin descargar un modelo borrador adicional.

## Benchmarks y rendimiento

Calidad de cuantización medida con `llama-perplexity --kl-divergence` sobre 16 fragmentos de 512 tokens de documentación técnica en inglés, frente a la referencia de 3,84 bpw (GLM-5.3-Flash-Gorgon-GGUF):

| Métrica | Esta cuantización (3,00 bpw) | Referencia 3,84 bpw |
|---|---|---|
| KLD media | 0,146 | 0 (referencia) |
| Perplejidad | 3,80 | 3,75 |
| Mismo token top-1 | 87,3 % | 100 % |

| Benchmark | Resultado | Notas |
|---|---|---|
| HumanEval | 156/164 (95,1 %) | Compilación anterior de la receta, con IQ2_S en capas 13-24 y 3,4 GiB menos; greedy, una muestra, bajo esfuerzo de razonamiento |
| HumanEval (fichero exacto publicado) | No ejecutado | El autor indica que este fichero tiene menor KLD (0,145 frente a 0,156) pero no se evaluó con HumanEval |

Uso de memoria medido en la máquina de pruebas (192 GB, ROCm 10.2, KV cache q8_0, `-ub 512`):

| Motor y configuración | Memoria de GPU (GTT) | Memoria total |
|---|---|---|
| llama.cpp, 64K de contexto | 111,0 GiB | 112,9 GiB |
| ROCmFPX, 64K de contexto | 110,5 GiB | 115,6 GiB |
| ROCmFPX, 128K de contexto | 111,3 GiB | 113,5 GiB |
| ROCmFPX, 64K con drafting MTP | 114,3 GiB | 116,5 GiB |

No se han publicado resultados de MMLU, GSM8K, GPQA ni de velocidad en tokens por segundo en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: al menos 111-115 GiB de memoria accesible por la GPU, según motor y contexto. El autor cifra en unos 125 GiB la memoria utilizable de una máquina de 128 GB.
- GPU objetivo: AMD Ryzen AI Max "Strix Halo" con iGPU Radeon (objetivo de compilación `gfx1151`) y ROCm 10.2 (nightly TheRock 10.2.0a20261021) o el fork ROCmFPX. Guías de terceros citan también NVIDIA DGX Spark y GMKtec EVO-X3 como equipos de 128 GB candidatos.
- No cabe en GPU de consumo convencionales: una RTX 4090 (24 GB) o una RTX 5090 quedan muy lejos de los 112 GiB necesarios, ni siquiera con las cuantizaciones de 1 bit de 93 GB citadas por terceros.
- Configuración del sistema: mantener el carve-out UMA del BIOS al mínimo y elevar el límite GTT con `ttm.pages_limit=31457280 ttm.page_pool_size=31457280` en `GRUB_CMDLINE_LINUX_DEFAULT`, seguido de `update-grub` y reinicio. Verificar con `cat /sys/class/drm/card*/device/mem_info_gtt_total`. Ejecutar sin sesión de escritorio o con una mínima: el modelo deja pocos GiB libres.
- Despliegue: `llama-server` de llama.cpp compilado con `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`, con `-ngl 999 -fa on -lm dio -c 131072 -b 2048 -ub 512 -ctk q8_0 -ctv q8_0 -np 1 --jinja`. Alternativa con drafting MTP: ROCmFPX con `ROCMFPX_DRAFT_VOCAB=16384`.
- Ajuste de `-ub`: en 128 GB conviene mantenerse entre 512 y 2048; con `-ub 4096` y un borrador se añaden unos 2 GiB de buffers de cómputo.
- Backend Vulkan: no verificado con este fichero. En la máquina de pruebas, la carga del modelo empujó al sistema a swap.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo indica cualitativamente que el drafting MTP de ROCmFPX es la decodificación especulativa más rápida que no requiere descargas adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-Strix-128GB-GGUF (esta ficha) | 320,8 B totales / ~18 B activos | 128K validados; 1M en el modelo base según terceros | 112,0 GiB, 3,00 bpw (IQ2_S/IQ3_XXS/Q5_K) | MIT | HuggingFace, 0 descargas |
| GLM-5.3-Flash-Gorgon-GGUF | 320,8 B totales / ~18 B activos | No disponible en la información | 143,5 GiB, 3,84 bpw | MIT | HuggingFace |
| GLM-5.3-Flash (Unsloth dinámicos, según guías de terceros) | 320,8 B totales / ~18 B activos | No disponible en la información | 93 GB (1 bit), 109 GB (2 bits), 120 GB (3 bits), 200 GB (4 bits) | MIT | HuggingFace |
| GLM-5.3-Flash FP8 oficial (zai-org) | 320,8 B totales / ~18 B activos | 1M según guías de terceros | No disponible en la información | MIT | HuggingFace |

La comparación relevante es interna a la familia: esta versión sacrifica 0,84 bpw frente a la referencia de 3,84 bpw para bajar de 143,5 GiB a 112,0 GiB, con un coste medido de 0,05 puntos de perplejidad y una coincidencia top-1 del 87,3 %. Frente a las cuantizaciones dinámicas de Unsloth, el tamaño es comparable al escalón de 2 bits de 109 GB, pero la receta es distinta: aquí no se poda ningún experto y la asignación de bits se decide por capas según la KL medida.

## Limitaciones y advertencias

- Solo texto: el codificador de visión del modelo base no está incluido, por lo que no se puede usar para tareas de imagen.
- Solo inglés y chino declarados: el rendimiento en castellano no está documentado y el modelo base no lo lista entre sus idiomas.
- Pérdida de calidad por cuantización: 12,7 % de discrepancia en el token top-1 frente a la referencia de 3,84 bpw, KLD media de 0,146 y perplejidad 3,80 frente a 3,75. Los expertos enrutados de las capas 25-44 están a 2,56 bpw, el punto más agresivo de la receta.
- Calibración limitada: los vectores de importancia se calcularon con solo 32K tokens de inglés, chino y Python; dominios alejados de esa mezcla (por ejemplo, código en otros lenguajes o texto jurídico) pueden degradarse más de lo que refleja la KLD medida.
- El fichero exacto publicado no se ha evaluado con HumanEval; el 95,1 % corresponde a una compilación anterior de la receta, con distinta asignación de bits en las capas 13-24.
- Requisito de hardware muy restrictivo: 128 GB de memoria unificada, ajuste de parámetros de kernel y sistema headless. No es desplegable en GPU de consumo al uso ni en instancias cloud estándar sin adaptar la configuración.
- llama.cpp estándar no ejecuta el drafting MTP de GLM-5.3; para aprovechar la capa incluida hay que usar ROCmFPX, un fork de terceros.
- Backend Vulkan no verificado; en la máquina del autor provocó swap. La compatibilidad con otras pilas (vLLM, TGI, Ollama) no está documentada para este fichero.
- Riesgo de alucinación y sesgos: no se aporta ninguna evaluación de sesgo, toxicidad o factualidad en la información disponible. Es un riesgo relevante en un modelo cuantizado a 2-3 bits y sin validación comunitaria.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicación de un único autor y sin replicaciones independientes de las métricas declaradas.
- Licencia MIT en el modelo base y en la cuantización, lo que en principio permite uso comercial; conviene verificar el fichero LICENSE del repositorio base por si hubiera términos adicionales de uso aceptable.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/cafonez/GLM-5.3-Flash-Strix-128GB-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantización de referencia 3,84 bpw: https://huggingface.co/cafonez/GLM-5.3-Flash-Gorgon-GGUF
- Árbol de ficheros de la referencia: https://huggingface.co/cafonez/GLM-5.3-Flash-Gorgon-GGUF/tree/main
- Fork ROCmFPX con drafting MTP: https://github.com/ROCmFPX/ROCmFPX
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guía de terceros con tamaños GGUF y velocidades: https://www.modemguides.com/blogs/ai-infrastructure/run-glm-5-3-flash-locally-hardware-reality-check
- Guía de terceros de despliegue local: https://cldnavi.com/en/blog/glm-5.3-flash-local-guide-2026/
