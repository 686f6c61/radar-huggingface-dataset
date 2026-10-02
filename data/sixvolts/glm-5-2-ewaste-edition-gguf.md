# SixVolts/GLM-5.2-ewaste-edition-GGUF

## Resumen

GLM-5.2-ewaste-edition-GGUF es un conjunto de cuantizaciones GGUF del modelo base zai-org/GLM-5.2, publicadas por el usuario SixVolts. No es un modelo nuevo ni un fine-tune: es un trabajo de cuantizacion orientado a un objetivo muy concreto, conseguir que un MoE de gran escala (753.864.139.008 parametros segun los pesos del modelo base, ~40 B activos por token) sea ejecutable en hardware antiguo o de segunda mano, en concreto CPUs anteriores a AVX-512 y GPUs de centro de datos de generacion previa como la MI100 (gfx908).

La tesis tecnica del autor es que, en esta clase de hardware, el cuello de botella de la decodificacion no es el ancho de banda sino la desquantizacion de los expertos, por lo que todas las variantes mantienen los expertos enrutados en K-quants (Q4_K, Q3_K o Q2_K) en lugar de i-quants de libro de codigos (IQ2/IQ3). El repositorio ofrece cuatro builds con compromisos explicitos entre tamano, calidad y velocidad: Q4_K_XL (403,8 GiB), Q3_K_XL (312,9 GiB), Q3_K_M (295,7 GiB, la recomendada) y Q2_K_XL (226,9 GiB).

Su relevancia actual es doble. Por un lado, demuestra que un modelo de ~750 B de parametros puede servirse sin spill a CPU sobre diez GPUs de 32 GB (320 GB de HBM) o incluso ocho (256 GB de HBM), con velocidades de decodificacion de 13,2-14,7 tok/s. Por otro, es un caso de estudio de cuantizacion selectiva por capas: el build Q3_K_M baja a Q2_K unicamente los expertos enrutados de las 32 capas mas "frias" (blk.3-blk.34), medidas con la senal `in_sum2` de la imatrix, cuya importancia abarca seis ordenes de magnitud entre la capa mas fria y la mas caliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | glm-dsa; MoE estilo DeepSeek con 256 expertos enrutados + 1 compartido, 8 activos por token y atencion MLA |
| Parametros totales | 753.864.139.008 (~754 B) segun los pesos safetensors del modelo base; la model card del autor indica 745 B |
| Parametros activos | ~40 B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL, Q3_K_XL, Q3_K_M y Q2_K_XL (K-quants con imatrix; Q2_K_XL incluye IQ2_XXS en 13 capas) |
| Idiomas soportados | no disponible (etiqueta "conversational" en HuggingFace) |
| Licencia | MIT |
| Formato de pesos | GGUF (8-10 shards segun la variante) |
| Tamano del repositorio | 1330,7 GB (suma de las cuatro variantes) |
| Descargas / likes | 286 / 15 |
| Creado / actualizado | 2026-06-23 / 2026-10-01 |

## Arquitectura y entrenamiento

El modelo subyacente, GLM-5.2 de zai-org, es un transformer con mezcla de expertos de estilo DeepSeek: 256 expertos enrutados mas un experto compartido, con 8 expertos activos por token, y atencion MLA (Multi-head Latent Attention). La variante Q3_K_M conserva ademas la cabeza MTP/nextn en blk.78. Este repositorio no entrena nada: parte del BF16 de `unsloth/GLM-5.2-GGUF` y aplica cuantizacion con importance matrix.

El elemento diferencial es la receta de cuantizacion. En Q3_K_M, los expertos enrutados de las 43 capas MoE mas calientes (blk.35-blk.77) se mantienen en Q3_K (con algunos `ffn_down_exps` de capas tardias promovidos automaticamente a Q4_K), mientras que los de las 32 capas mas frias (blk.3-blk.34) y la cabeza MTP bajan a Q2_K. La atencion, el experto compartido, `token_embd` y `output` quedan en Q6_K, y `attn_k_b` cae a Q4_0 por un fallback automatico (ncols=192 no divisible por 256). El criterio de "frio" no es heuristico: se deriva del `in_sum2` de la imatrix de unsloth, con una importancia media de `ffn_down_exps` monotona en profundidad que va de ~0,003 en blk.3 a ~16.022 en blk.77.

Las otras recetas son mas simples. Q4_K_XL pone todos los expertos enrutados en Q4_K y todo lo demas (atencion MLA, indexer, experto compartido, embeddings, FFN densas de blk.0-2) en Q8_0, con normas y router en F32: 403,8 GiB, 4,60 bpw, diez shards. Q2_K_XL baja el resto de la infraestructura a Q4_K, mantiene los expertos en Q2_K y solo las 13 capas mas frias segun imatrix van a IQ2_XXS: 2,59 bpw.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta `conversational` y pipeline `text-generation`); el resto de idiomas no esta documentado.
- Razonamiento y generacion de codigo propios del modelo base GLM-5.2, aunque no se aportan evaluaciones especificas para esta cuantizacion.
- Decodificacion especulativa: el head MTP/nextn de blk.78 se conserva en el GGUF (en Q2_K en el build Q3_K_M) y la etiqueta `speculative-decoding` aparece de forma explicita, si bien el autor senala que dicho head no se usa en la decodificacion normal.
- Inferencia en CPU: el diseno esta optimizado para CPUs sin AVX-512, donde la desquantizacion de expertos es el cuello de botella.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con servicios compatibles con la API de OpenAI.
- Ejecucion con llama.cpp, ik_llama.cpp y llama-cpp-python.
- Soporte de KV cache largo en configuraciones de ~512 GB de RAM (afirmacion del autor para Q4_K_XL).
- No se documentan capacidades de vision, audio, tool calling ni agentes en la informacion disponible.

## Casos de uso

- Servicio de chat autohospedado de gran escala: desplegar el build Q3_K_M sobre diez MI100 de 32 GB permite atender conversaciones multi-turno con un modelo de ~754 B de parametros sin salir a CPU, eliminando el cuello de botella de desquantizacion de expertos que motiva el proyecto.
- Reutilizacion de hardware de segunda mano: el objetivo declarado es montar un cluster de inferencia con GPUs gfx908 (MI100) y CPUs pre-AVX-512, componentes con precio de mercado secundario muy inferior al de H100 o A100.
- Inferencia CPU-expert con gran RAM: el build Q4_K_XL (403,8 GiB) esta pensado para un equipo de ~512 GB de RAM donde los expertos enrutados residen en memoria de sistema y una GPU modesta (o ninguna) cubre el resto.
- Maximizar throughput cuando la HBM es limitada: con ocho tarjetas de 32 GB, Q2_K_XL (226,9 GiB) decodifica a 14,7 tok/s frente a 13,2 tok/s de Q3_K_M, por lo que es la opcion para equipos limitados a 256 GB de HBM que toleran calidad Q2.
- Investigacion en cuantizacion selectiva: las recetas permiten estudiar el impacto real de degradar capas "frias" identificadas con imatrix, y de elegir K-quants frente a i-quants en hardware donde la desquantizacion domina el tiempo de decodificacion.
- Generacion de texto por lotes en pipelines internos: integrable mediante llama-cpp-python para tareas de resumen, clasificacion o sintesis de datos donde la latencia no sea critica.
- Evaluacion comparativa de variantes: el repositorio permite medir de forma controlada el intercambio entre bpw (2,59 / 3,37 / 4,60), perplexity y tok/s sobre el mismo modelo base.
- Laboratorio de decodificacion especulativa: el head MTP incluido en blk.78 permite experimentar con borradores internos, aunque no se use en decodificacion estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos cuantitativos aportados son de tamano, bits por peso, perplexity relativa y velocidad de decodificacion.

| Variante | Tamano | bpw | Expertos enrutados | No expertos | Tokens/s (0-spill) | Notas de calidad |
|---|---|---|---|---|---|---|
| Q4_K_XL | 403,8 GiB | 4,60 | Q4_K | Q8_0 | no disponible | Calidad mas alta de la familia |
| Q3_K_XL | 312,9 GiB | no disponible | Q3_K | Q8_0 | no disponible | Referencia de calidad para la rama Q3 |
| Q3_K_M | 295,7 GiB | 3,37 | Q3_K + Q2_K (capas frias) | Q6_K | 13,2 | +0,6 % de perplexity respecto a Q3_K_XL |
| Q2_K_XL | 226,9 GiB | 2,59 | Q2_K + IQ2_XXS (13 capas) | Q4_K | 14,7 | Perdida de calidad real (tabla de perplexity no incluida en el extracto) |

## Requisitos de hardware

- VRAM/HBM necesaria: 320 GB (10 x 32 GB) para Q3_K_M sin spill; 256 GB (8 x 32 GB) para Q2_K_XL sin spill; Q3_K_XL desborda a CPU por debajo de 11 x 32 GB.
- RAM para inferencia CPU-expert: ~512 GB para Q4_K_XL (403,8 GiB de pesos mas espacio para un KV cache largo).
- GPUs objetivo: AMD MI100 / gfx908 y, en general, GPUs de centro de datos de generacion previa. No se mencionan A100, H100 ni RTX 4090 como destino de estas builds.
- GPUs de consumo (RTX 4090, 24 GB): no cabe ninguna variante, ya que la mas pequena ocupa 226,9 GiB.
- CPUs: el proyecto esta explicitamente optimizado para procesadores sin AVX-512, donde la desquantizacion de expertos es mas lenta que el propio ancho de banda.
- Opciones de despliegue: llama.cpp, ik_llama.cpp y llama-cpp-python. Para Q2_K_XL el autor indica usar `-sm layer` y no `-sm tensor`.
- Latencia y throughput: 14,7 tok/s (Q2_K_XL) y 13,2 tok/s (Q3_K_M), ambos en configuracion 0-spill. No hay datos de time-to-first-token ni de throughput con batching.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos de terceros comparables. La comparativa factible es entre las variantes del propio repositorio y su relacion con el modelo base.

| Modelo | Parametros | Contexto | Peso en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zai-org/GLM-5.2 (BF16) | ~754 B (safetensors); 745 B segun la card | no disponible | no disponible | MIT segun la card del derivado | Modelo base en HuggingFace |
| unsloth/GLM-5.2-GGUF | Igual | no disponible | no disponible | no disponible | Fuente del BF16 y de la imatrix usados aqui |
| GLM-5.2-Q4_K_XL | ~754 B | no disponible | 403,8 GiB | MIT | Este repositorio |
| GLM-5.2-Q3_K_M | ~754 B | no disponible | 295,7 GiB | MIT | Este repositorio |
| GLM-5.2-Q2_K_XL | ~754 B | no disponible | 226,9 GiB | MIT | Este repositorio |
| GLM-5.3-ewaste-edition-GGUF | no disponible | no disponible | no disponible | no disponible | Version recomendada por el propio autor |

## Limitaciones y advertencias

- El autor recomienda explicitamente descargar la version GLM-5.3-ewaste-edition-GGUF en lugar de esta, por ser esencialmente un fine-tune de 5.2.
- No hay benchmarks publicados: no existen datos de MMLU, HumanEval, GSM8K ni evaluaciones de terceros para estas cuantizaciones, solo perplexity relativa entre variantes.
- La cuantizacion es agresiva: Q2_K_XL baja a 2,59 bpw y el propio autor reconoce "perdida de calidad real"; Q3_K_M aplica Q2_K a 32 capas completas de expertos enrutados y a la cabeza MTP.
- El requisito de hardware es extremo: minimo 226,9 GiB de pesos, lo que descarta cualquier GPU de consumo y exige varios aceleradores de 32 GB o un host con cientos de GB de RAM.
- La longitud de contexto no esta documentada, lo que impide dimensionar el KV cache a priori; el autor solo afirma que Q4_K_XL deja "headroom para un KV cache largo" en 512 GB.
- Los idiomas soportados no estan documentados; la unica etiqueta disponible es "conversational", sin lista de lenguas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta clase; no se aportan tasas ni evaluaciones de fidelidad.
- La model card declara licencia MIT, pero conviene verificar de forma independiente la licencia del modelo base zai-org/GLM-5.2 antes de un uso comercial.
- Existe una discrepancia en el numero de parametros totales: 745 B en la model card frente a 753.864.139.008 en los pesos safetensors.
- Traccion limitada: 286 descargas y 15 likes, sin validacion independiente de la calidad resultante.
- El head MTP/nextn se incluye en Q2_K pero, segun el propio autor, no se usa en la decodificacion normal, por lo que no debe esperarse una ganancia automatica de velocidad.
- Para Q2_K_XL es obligatorio usar `-sm layer`; con `-sm tensor` el reparto no es el previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SixVolts/GLM-5.2-ewaste-edition-GGUF
- README del repositorio: https://huggingface.co/SixVolts/GLM-5.2-ewaste-edition-GGUF/blob/main/README.md
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- BF16 e imatrix de origen: https://huggingface.co/unsloth/GLM-5.2-GGUF
- Version recomendada por el autor (GLM-5.3): https://huggingface.co/SixVolts/GLM-5.3-ewaste-edition-GGUF
- Ficha en Inferix: https://inferix.co/models/SixVolts/GLM-5.2-ewaste-edition-GGUF
- Ficha en Toolify: https://www.toolify.ai/ai-model/sixvolts-glm-5-2-ewaste-edition-gguf
- Ficha en free2aitools: https://free2aitools.com/model/sixvolts/glm-5.2-ewaste-edition-gguf
