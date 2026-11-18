# agentionai/Qwen3.8-Flash-Next-AP-GGUF

## Resumen

Qwen3.8-Flash-Next-AP-GGUF es una coleccion de cuantizaciones GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario agentionai bajo la metodologia que denomina Agention Precision (AP). El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer de tipo Mixture-of-Experts con 176.943.899.520 parametros totales y una tabla de lookup de n-gramas de 51,2B parametros (`per_layer_token_embd`) que constituye una innovacion arquitectonica destacable. Esta publicacion no entrena ningun modelo nuevo: redistribuye el tipo de cuantizacion por grupos de tensores para maximizar la precision por gigabyte de VRAM, manteniendo compatibilidad con llama.cpp mainline sin necesidad de forks.

La relevancia practica del repositorio reside en que ofrece siete niveles de cuantizacion medidos con metricas reproducibles (divergencia KL y acuerdo top-1 frente al modelo fuente) sobre un corpus held-out, en lugar de sobre wikitext, que el autor demuestra que esta memorizado por la tabla de n-gramas y por tanto infla artificialmente las metricas. El tier mas ligero, AP-IQ2_S, requiere 49,21 GiB de VRAM, mientras que el mas preciso, AP-Q5_K_XL, necesita 76,75 GiB, lo que situa al modelo en el terreno de estaciones de trabajo con multiples GPU o aceleradores de datacenter.

El repositorio incluye ademas un proyector de vision (`mmproj-F16.gguf`) que habilita entrada de imagenes, y el modelo soporta modos thinking e instruct con parametros de muestreo diferenciados recomendados por Qwen. La licencia es qwen-community-1.0, que impone restricciones que deben revisarse antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con tabla de lookup de n-gramas (`per_layer_token_embd`) |
| Parametros totales | 176.943.899.520 (incluye 51,2B de la tabla de n-gramas) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_XL, Q5_K_M, Q4_K_XL, Q4_K_M, IQ4_XS, IQ3_XXS, IQ2_S (tipos estandar de llama.cpp, mezclados por grupos de tensores) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF; proyector de vision en `mmproj-F16.gguf` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 176,9B parametros totales, de los cuales una parte sustancial corresponde a una tabla de lookup de n-gramas de 51,2B parametros (`per_layer_token_embd`) que el autor describe como parte integral de la arquitectura. Esta tabla es responsable de que las metricas sobre wikitext resulten enganosas: el propio autor documenta que el mismo fichero puntua entre 6,9 y 8,6 puntos mas de acuerdo top-1 en wikitext que en texto held-out, y que la inflacion crece a medida que la cuantizacion es mas agresiva. Por ejemplo, `AP-Q4_K_M` obtiene 84,22 % en held-out frente a 91,82 % en wikitext. Este comportamiento es independiente del publicador y se observa tambien en cuantizaciones de terceros.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La innovacion tecnica documentada en este repositorio es la cuantizacion por grupos de tensores: cada tier asigna tipos distintos a distintos grupos (por ejemplo, `AP-Q4_K_M` combina IQ4_XS 4.25 y IQ3_S 3.44 en los expertos gate/up) en lugar de usar un unico tipo global. Las mediciones se realizan con `llama-perplexity --kl-divergence` a `-c 2048` contra el modelo fuente, sobre corpus held-out de texto y de codigo. El tier `AP-Q4_K_XL` supero una prueba de estres de bucles con 45 generaciones sobre prompts que provocan razonamiento desbocado (thinking activado, `--min-p 0.05`, limite de 12k tokens): 0 bucles y 44 de 45 generaciones completadas dentro del limite.

## Capacidades

- Generacion de texto conversacional y en modo instruct, con parametros de muestreo diferenciados para thinking y no-thinking.
- Modo thinking (razonamiento extendido) con temperatura 1.0, top_p 0.95, top_k 20, presence_penalty 0.0.
- Modo instruct sin thinking con temperatura 0.7, top_p 0.80, top_k 20, presence_penalty 1.5.
- Entrada de imagenes mediante el proyector `mmproj-F16.gguf`, que se descarga junto al tier elegido.
- Generacion de codigo: el autor evalua explicitamente un corpus de codigo held-out, con divergencia KL de 0.0181 para `AP-Q5_K_M` y 0.0206 para `AP-Q4_K_XL`.
- Compatibilidad con llama.cpp mainline, lo que permite integracion con el ecosistema de herramientas que consumen GGUF.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de razonamiento extendido en estaciones de trabajo con 77 GiB de VRAM: usar `AP-Q5_K_M` con `-ngl 999 -fa 1 -ot "per_layer_token_embd=CPU"` permite mantener la tabla de n-gramas en RAM del sistema y liberar VRAM para las capas del transformer, habilitando el modo thinking con la maxima fidelidad al modelo fuente (KL 0.0771).
- Generacion de codigo en pipelines internos: `AP-Q4_K_XL` obtiene KL 0.0206 y 97,38 % de acuerdo top-1 sobre corpus de codigo held-out con 67,38 GiB de VRAM, lo que lo hace adecuado para autocompletado y generacion de tests en entornos con dos GPU de 48 GB.
- Analisis de documentos con imagenes: combinando cualquier tier con `mmproj-F16.gguf` se puede procesar entrada visual, util para extraccion de datos de capturas, diagramas o documentos escaneados en flujos de back-office.
- Evaluacion comparativa de cuantizaciones: el repositorio publica metricas por tier sobre el mismo corpus de referencia, lo que permite elegir el compromiso VRAM/precision con datos en lugar de estimaciones, util para equipos que calibran infraestructura.
- Sustitucion de APIs propietarias en entornos con requisitos de residencia de datos: al ejecutarse localmente con llama.cpp, el modelo no requiere enviar prompts a terceros, lo que encaja en sectores regulados.
- Pruebas de estres de razonamiento: el autor documenta una prueba de 45 generaciones con prompts que inducen bucles; el tier `AP-Q4_K_XL` no produjo ninguno, lo que respalda su uso en agentes con limites de tokens estrictos.
- Prototipado en hardware limitado: `AP-IQ2_S` ocupa 49,21 GiB de VRAM y permite validar flujos antes de aprovisionar hardware mayor, aunque con una divergencia KL de 0.2657 que desaconseja produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos publicados son metricas de fidelidad de cuantizacion frente al modelo fuente:

| Tier | VRAM (GiB) | Descarga (GiB) | bpw efectivos | Expertos (gate/up) | KL div held-out | Top-1 held-out |
|---|---:|---:|---:|---|---:|---:|
| AP-Q5_K_XL | 76,75 | 112,51 | 5,46 | Q5_K 5.5 | 0,0839 ± 0,0008 | 86,63 ± 0,14 % |
| AP-Q5_K_M | 76,75 | 103,57 | 5,03 | Q5_K 5.5 | 0,0771 ± 0,0007 | 86,95 ± 0,14 % |
| AP-Q4_K_XL | 67,38 | 94,20 | 4,57 | Q4_K 4.5 | 0,0886 ± 0,0008 | 86,14 ± 0,14 % |
| AP-Q4_K_M | 61,22 | 88,04 | 4,27 | IQ4_XS 4.25 + IQ3_S 3.44 | 0,1243 ± 0,0011 | 84,22 ± 0,15 % |
| AP-IQ4_XS | 57,42 | 84,24 | 4,09 | IQ3_S 3.44 | 0,1584 ± 0,0014 | 82,89 ± 0,15 % |
| AP-IQ3_XXS | 53,90 | 80,72 | 3,92 | IQ3_XXS 3.06 | 0,1844 ± 0,0016 | 81,85 ± 0,16 % |
| AP-IQ2_S | 49,21 | 76,03 | 3,69 | IQ2_S 2.5 | 0,2657 ± 0,0022 | 79,14 ± 0,16 % |

Comparacion directa con unsloth al mismo nivel de cuantizacion:

| Fichero | VRAM (GiB) | Descarga (GiB) | KL div held-out | Top-1 held-out | KL div codigo | Top-1 codigo |
|---|---:|---:|---:|---:|---:|---:|
| AP-Q5_K_M | 76,75 | 103,57 | 0,0771 | 86,95 % | 0,0181 | 97,69 % |
| AP-Q4_K_XL | 67,38 | 94,20 | 0,0886 | 86,14 % | 0,0206 | 97,38 % |
| unsloth UD-Q4_K_XL | 76,86 | 103,69 | 0,0778 | 87,21 % | 0,0192 | 97,36 % |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 49,21 GiB (`AP-IQ2_S`) y 76,75 GiB (`AP-Q5_K_M` y `AP-Q5_K_XL`), segun la tabla del autor. La tabla de n-gramas de 51,2B parametros puede descargarse a RAM del sistema con `-ot "per_layer_token_embd=CPU"`, por lo que la VRAM necesaria es la de la columna correspondiente, no el tamano de descarga.
- GPU recomendadas: configuraciones con 80 GB de VRAM por GPU (A100 80GB, H100 80GB) para los tiers superiores; para `AP-Q4_K_XL` (67,38 GiB) encajan dos RTX 4090 de 24 GB con tensor parallelism o una unica GPU de 80 GB.
- No cabe en una unica GPU consumer de 24 GB en ningun tier publicado; el minimo documentado son 49,21 GiB.
- Opciones de despliegue: llama.cpp mainline (compatible sin fork), con `llama-cli` o `llama-server`. El autor documenta el flag `-ngl 999 -fa 1 -ot "per_layer_token_embd=CPU"` para offload de la tabla de n-gramas. Soporte de vLLM, TGI u Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. El autor solo documenta el resultado de la prueba de bucles (44 de 45 generaciones dentro de un limite de 12k tokens) sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | VRAM minima documentada |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-AP-GGUF (este) | 176,9B totales (incl. 51,2B n-gramas) | no disponible | GGUF | qwen-community-1.0 | 49,21 GiB (AP-IQ2_S) |
| Qwen3.8-Flash-Next (base) | 176,9B totales | no disponible | safetensors | qwen-community-1.0 | no disponible |
| unsloth UD-Q4_K_XL (mismo modelo base) | 176,9B totales | no disponible | GGUF | qwen-community-1.0 | 76,86 GiB |

La unica comparativa con datos cuantitativos en la informacion disponible es frente a la cuantizacion de unsloth del mismo modelo base: `AP-Q5_K_M` iguala a `UD-Q4_K_XL` en divergencia KL held-out (0,0771 frente a 0,0778) y mejora en codigo (0,0181 frente a 0,0192), mientras que unsloth mantiene un top-1 ligeramente superior en texto (87,21 % frente a 86,95 %). `AP-Q4_K_XL` requiere 9,5 GiB menos de VRAM que `UD-Q4_K_XL` con una divergencia KL de 0,0886. No se dispone de datos para comparar con modelos de otros linajes o tamanos.

## Limitaciones y advertencias

- La licencia qwen-community-1.0 no es una licencia de codigo abierto estandar; deben revisarse sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones de atribucion o de uso.
- El modelo base incluye una tabla de n-gramas de 51,2B parametros que memoriza parte del corpus de entrenamiento; el autor demuestra que wikitext esta dentro de ese conjunto memorizado, lo que invalida las metricas de calidad basadas en wikitext y sugiere riesgo de reproduccion literal de contenido visto en entrenamiento.
- La divergencia KL crece de forma marcada en los tiers bajos: 0,0771 en `AP-Q5_K_M` frente a 0,2657 en `AP-IQ2_S`, con una caida de acuerdo top-1 de 86,95 % a 79,14 %. Los tiers de 2 y 3 bits no son recomendables para produccion.
- Los tiers superiores requieren entre 67 y 77 GiB de VRAM, lo que excluye GPU consumer individuales y encarece el despliegue.
- El rendimiento en modo thinking puede desbocarse: el autor ejecuta una prueba especifica de bucles con `--min-p 0.05` y limite de 12k tokens, lo que indica que el problema existe y debe mitigarse con parametros de muestreo y limites duros.
- No hay informacion sobre sesgos, idiomas soportados ni calidad multilingue; no se puede asumir un comportamiento equilibrado entre lenguas.
- No hay datos de benchmarks estandar (MMLU, HumanEval, GSM8K) que permitan comparar capacidades absolutas con otros modelos.
- El repositorio ocupa 981,4 GB, por lo que la descarga y el almacenamiento requieren planificacion de infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-AP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Metodologia y resultados completos de Agention Precision: https://agention.ai/models/qwen3.8-flash-next/
- Licencia: fichero `LICENSE` en el repositorio de Hugging Face
