# MarxistLeninist/AGILLM-GB10-1PF

## Resumen

AGILLM-GB10-1PF es un repositorio de investigación publicado por el usuario de HuggingFace `MarxistLeninist` que describe una arquitectura de lenguaje de aproximadamente 2.000 millones de parámetros diseñada específicamente para el hardware NVIDIA GB10 (arquitectura Blackwell, SM121) y su ruta de cómputo NVFP4 dispersa. No es un modelo entrenado y publicado, sino un proyecto de codesarrollo hardware-software con el entrenamiento en curso: el repositorio ocupa 0,0 GB, no tiene pesos publicados, acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

La propuesta técnica se aparta deliberadamente de un Transformer genérico. Se trata de un modelo con arquitectura de mezcla de expertos (MoE) organizada en 16 etapas secuenciales, con 6 expertos top-1 por etapa (96 expertos en total), anchura de modelo de 1280, matrices de experto de forma 1280 → 5120 → 1280 con SwiGLU y esparsidad estructurada 4:8 empaquetada en NVFP4. El esquema posicional es NoPE, con estructura causal y de ventana local únicamente, y el vocabulario es un BPE de 129.280 identificadores heredado de la familia AGILLM.

Su relevancia actual es acotada y de naturaleza metodológica: el autor documenta un objetivo de entrenamiento de 600.000 millones de tokens, un canario de entrenamiento real sobre `HuggingFaceFW/fineweb-edu` y una microbenchmark de MMA dispersa que alcanza 992,018 TFLOP/s equivalentes densos en la GB10, el 99,20 % del objetivo declarado de 1 PFLOP/s. Se trata, por tanto, de material para evaluar un diseño de kernel y de arquitectura, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 16 etapas secuenciales, enrutado top-1 balanceado, SwiGLU por experto, NoPE (sin codificacion posicional explicita), GQA con FlashAttention-2 |
| Parametros totales | 1.986.888.960 parametros convencionales (0,656 % por debajo del objetivo de diseno de 2B) |
| Parametros activos | no disponible (el autor no publica el desglose por token; ver estimacion en la seccion de arquitectura) |
| Longitud de contexto | 2.048 tokens de secuencia en la geometria de produccion declarada (batch 24 x secuencia 2048 = 49.152 tokens por micro-paso); no se declara una longitud de contexto de inferencia oficial |
| Tipos de cuantizacion | No se publican cuantizaciones para inferencia (sin GGUF, GPTQ, AWQ ni similares). Internamente: NVFP4 empaquetado con esparsidad estructurada 4:8 en las matrices de expertos y BF16 en el flujo residual |
| Idiomas soportados | no disponible (el autor no declara lista de idiomas; la mezcla de datos prevista es mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | No hay pesos publicados. El formato de checkpoint de entrenamiento citado es `latest.pt` (PyTorch); el repositorio no contiene safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura, congelada de forma legible por maquina en `ARCHITECTURE_LOCK.json`, consta de 16 etapas secuenciales con 6 expertos top-1 cada una (96 expertos en total) y anchura de modelo 1280. Cada experto es un SwiGLU de 1280 → 5120 → 1280, con matrices empaquetadas en NVFP4 y esparsidad estructurada pareada 4:8, apuntando a la ruta caliente de MMA dispersa nativa `mxf4nvf4` de SM121. El flujo residual se mantiene en BF16 y la atencion usa GQA con 20 cabezas de consulta, 5 cabezas de clave/valor y dimension de cabeza 64. El esquema posicional es NoPE: la informacion de orden procede unicamente de la estructura causal y de las ventanas locales, que escalan 256 → 512 → 1024 y despues dan paso a cuatro etapas globales. Existe una interfaz de token de 256 dimensiones proyectada al nucleo de computo de 1280.

El entrenamiento previsto sigue una prediccion autorregresiva de siguiente token con entropia cruzada exacta; la cabeza de vocabulario se evalua en fragmentos de 4.096 filas con checkpointing para no materializar el tensor de logits completo de 49.152 x 129.280. El regimen de actualizacion es inusual: 16 actualizaciones rotatorias locales por etapa mas una actualizacion de la interfaz de cabeza, sin ancla de gradiente sobre el modelo completo, con un banco estatico de 16 optimizadores PagedAdamW8bit locales mas uno para la cabeza. El objetivo declarado es de 600.000 millones de tokens (unos 302 tokens por parametro) sobre una mezcla ponderada de FineWeb-Edu, FineWeb, Wikipedia, C4, Cosmopedia, Proof-Pile-2, Dolma y fuentes de codigo, con tolerancia a fallos de origen mediante failover. No se documenta RLHF, DPO ni ninguna fase de alineacion.

En cuanto a evidencia empirica, el autor informa de un canario de gradiente completo con los 1.986.888.960 parametros instanciados, 512 tokens de texto real, perdida finita, norma de gradiente finita, las 288 capas lineales de experto ejecutadas y un paso de optimizador completado. Una prueba de acumulacion de dos micro-lotes reutilizo pesos empaquetados: el segundo micro-lote anadio 288 llamadas a kernel disperso pero solo 9 empaquetados nuevos. La microbenchmark de MMA dispersa reporta un pico de 992,017989 TFLOP/s equivalentes densos (99,20 % de 1 PFLOP/s) con 34 acumuladores, 20 bloques por SM, 128 hilos y 1.200 iteraciones; la evidencia historica de partida fue de 969,794609 TFLOP/s. El autor advierte explicitamente de que la cifra de ~1 PFLOP de NVIDIA es un techo de hardware para FP4 disperso y no una tasa alcanzable en un paso de entrenamiento completo. Sobre parametros activos: a partir de las formas publicadas, 96 expertos de tres matrices de 1280 x 5120 suponen unos 1.887 millones de parametros de experto, de modo que activar un experto por etapa dejaria del orden de 400 millones de parametros activos por token; es una estimacion aritmetica propia, no una cifra publicada por el autor.

## Capacidades

- No hay ninguna capacidad verificada ni evaluada de forma independiente: el modelo no tiene pesos publicados ni demos, y el autor solo documenta pasos de entrenamiento iniciales.
- Generacion de texto autorregresiva: capacidad objetivo del diseno (prediccion de siguiente token), sin resultados de calidad publicados.
- Mezcla de expertos con enrutado top-1 balanceado: 6 expertos por etapa, 96 en total, orientada a mantener residentes los pesos empaquetados en lugar de reducir computo por token.
- Ventana de contexto corta y local: ventanas de 256, 512 y 1024 tokens mas cuatro etapas globales, con 2.048 tokens de secuencia en la geometria de produccion.
- Soporte de tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponibles, no documentadas; la mezcla de datos prevista es mayoritariamente anglosajona.
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponibles. La unica peculiaridad tecnica documentada es el uso de NVFP4 disperso 4:8 como ruta de computo nativa.
- Tokenizador propio: BPE AGILLM de 129.280 identificadores, incluido en el repositorio junto con los binarios del runtime disperso de GB10 y el codigo CUDA fuente.

## Casos de uso

Dado que no existen pesos publicados, los siguientes escenarios son aplicaciones previstas del diseno, no usos verificados hoy:

- Investigacion en codesarrollo hardware-software: el repositorio sirve como caso de estudio reproducible de como disenar una arquitectura alrededor de una ruta de tensor core concreta (NVFP4 disperso 4:8 en SM121) en lugar de adaptar un Transformer generico, con contratos de arquitectura congelados y recibos de reproducibilidad.
- Auditoria de rendimiento de kernels dispersos: el microbenchmark de MMA y el codigo CUDA fuente permiten a otros equipos reproducir y verificar el 99,20 % del objetivo de 1 PFLOP/s y estudiar el efecto del control de reloj del host en la brecha restante.
- Experimentacion con esquemas posicionales sin codificacion (NoPE): util para grupos que investigan atencion causal y ventanas locales sin embeddings posicionales, con una jerarquia documentada de ventanas 256/512/1024 mas etapas globales.
- Estudio de regimenes de actualizacion por etapas: el patron de 16 actualizaciones locales rotatorias mas una de cabeza, sin ancla global, y el banco de optimizadores PagedAdamW8bit, es material directamente reutilizable para investigar entrenamiento por bloques en memoria limitada.
- Evaluacion de mezclas de datos a gran escala: el cargador de dataset en streaming con failover sobre FineWeb-Edu, FineWeb, Wikipedia, C4, Cosmopedia, Proof-Pile-2, Dolma y codigo puede reutilizarse como plantilla para objetivos de 600.000 millones de tokens.
- Analisis de esparsidad estructurada 4:8 en FP4: el proyecto documenta formas de matriz (1280 x 5120) derivadas de mediciones directas sobre el hardware, util como referencia para quien disene expertos MoE con restricciones de empaquetado.
- Asistencia generativa de proposito general, atencion al cliente o generacion de codigo en produccion: no viables con el estado actual del artefacto, porque no hay pesos, no hay cuantizaciones para inferencia y el modelo esta etiquetado como bloqueado a hardware (`...hardware_locked_v2`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion de calidad, y tampoco publica perdida de validacion final ni curvas de entrenamiento mas alla del canario inicial de 512 tokens.

El unico dato cuantitativo de rendimiento es de microbenchmark de kernel, no de calidad de modelo:

| Medición | Valor | Contexto |
|---|---|---|
| Pico de MMA dispersa NVFP4 (equivalente denso) | 992,017989 TFLOP/s | Configuracion: 34 acumuladores, 20 bloques/SM, 128 hilos, 1.200 iteraciones |
| Mejor evidencia historica en la misma GB10 | 969,794609 TFLOP/s | Medicion previa a la limpieza de computo no relacionado y al autotuning de geometria |
| Porcentaje del objetivo declarado | 99,20 % de 1 PFLOP/s | El autor atribuye la brecha restante a la falta de control de reloj del host en el contenedor |
| Perdida de entrenamiento (canario) | Finita con gradiente finito | 512 tokens reales, 288 capas lineales de experto ejecutadas, un paso de optimizador |

## Requisitos de hardware

- Entrenamiento: el proyecto esta disenado para y medido en NVIDIA GB10 (Blackwell, SM121) con 128 GB de memoria unificada direccionable por GPU. La etiqueta del artefacto (`agillm_gb10_1pf_hardware_locked_v2`) indica vinculacion a ese hardware.
- Inferencia: no hay ninguna ruta de inferencia publicada ni pesos que cargar, por lo que no existe una recomendacion de VRAM validada. Como estimacion aritmetica propia para un hipotetico despliegue con todos los expertos residentes: unos 4 GB en BF16 para 1.986.888.960 parametros, y del orden de 1,0-1,2 GB en un formato de 4-5 bits por parametro.
- GPU recomendadas: ninguna verificada. La ruta nativa (MMA dispersa NVFP4 4:8 con empaquetado `mxf4nvf4`) es especifica de SM121; la mayoria de GPU de consumo y de centro de datos con arquitecturas anteriores no disponen de esa instruccion, de modo que un despliegue nativo exigiria el mismo tipo de hardware.
- GPU de consumo: no hay evidencia de que quepa o funcione en ninguna GPU de consumo. El tamano de pesos no seria un obstaculo en terminos de memoria, pero la dependencia de kernels NVFP4 dispersos SM121 si lo es.
- Opciones de despliegue: no disponibles. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ningun otro servidor de inferencia. El unico punto de entrada publicado es el script de Python `agillm_gb10_1pf.py` con subcomandos `profile`, `dataset-probe` y `train`.
- Latencia y throughput: no disponibles para inferencia. En entrenamiento solo se reporta la microbenchmark de MMA y el objetivo declarado de 1 PFLOP/s, no tokens por segundo de un paso completo ni TFLOP/s utiles de paso completo, magnitudes que el autor enumera como metricas separadas y advierte que no deben confundirse entre si.
- Recuperacion: checkpoint rotatorio `latest.pt` con supervisor de produccion que reanuda automaticamente.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible porque AGILLM-GB10-1PF no publica benchmarks ni pesos. Se ofrece una comparacion estructural con modelos densos de tamano similar ampliamente usados; los datos de las alternativas proceden de sus fichas publicas y conviene verificarlos en origen.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| AGILLM-GB10-1PF | 1.986.888.960 (MoE, activos no disponibles) | 2.048 tokens de secuencia en la geometria de produccion declarada | MoE de 16 etapas, top-1 sobre 6 expertos, NoPE, NVFP4 disperso 4:8 | Apache 2.0 | No (repositorio de 0,0 GB) |
| Qwen2.5-1.5B | 1,54B aprox., denso | 32.768 tokens nativos (hasta 131.072 con YaRN) | Transformer denso con RoPE | Apache 2.0 | Si |
| Llama-3.2-1B | 1,24B aprox., denso | 128.000 tokens | Transformer denso con RoPE y GQA | Licencia comunitaria Llama 3.2 | Si |
| TinyLlama-1.1B | 1,1B aprox., denso | 2.048 tokens | Transformer denso con RoPE | Apache 2.0 | Si |

Diferencias clave: AGILLM-GB10-1PF es el unico de la lista con arquitectura MoE enrutada por etapas, sin codificacion posicional explicita y con requisito de kernels NVFP4 dispersos especificos de SM121; tambien es el unico sin pesos descargables y sin benchmarks publicados, por lo que no puede equipararse funcionalmente a las alternativas en su estado actual.

## Limitaciones y advertencias

- No hay pesos publicados. El repositorio ocupa 0,0 GB, tiene 0 descargas y 0 likes: no es un modelo usable, sino un proyecto de investigacion con entrenamiento en curso.
- Sin benchmarks ni evaluacion de calidad. No existen datos de MMLU, HumanEval, GSM8K ni similares, y la unica evidencia empirica es un canario de 512 tokens con perdida finita.
- Objetivo de entrenamiento no completado. El autor declara un objetivo de 600.000 millones de tokens; no consta que se haya alcanzado ni que existan checkpoints promovidos mas alla de `latest.pt`.
- Dependencia fuerte de hardware. La arquitectura esta bloqueada a NVFP4 disperso SM121 y a las instrucciones `mxf4nvf4` de GB10; la propia etiqueta del repositorio incluye `hardware_locked`. La portabilidad a otras GPU no esta demostrada.
- Sin formato de inferencia estandar. No hay GGUF, safetensors, GPTQ ni AWQ, y no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Contexto muy corto. La secuencia de produccion declarada es de 2.048 tokens, con ventanas locales de 256 a 1024 y solo cuatro etapas globales; no es adecuado para tareas de contexto largo.
- Idiomas no declarados. La mezcla de datos prevista (FineWeb, C4, Cosmopedia, Proof-Pile-2, Dolma) es predominantemente inglesa, por lo que el soporte multilingue, y en particular del castellano, no puede darse por supuesto.
- Riesgo de alucinacion y sesgos: no evaluables, ya que no existe un modelo entrenado que probar. Cualquier extrapolacion desde el diseno seria especulativa.
- Cifras de rendimiento que exigen lectura cuidadosa. El 99,20 % del objetivo de 1 PFLOP/s corresponde a una microbenchmark de MMA dispersa, no a un paso de entrenamiento completo ni a inferencia. El propio autor advierte de que un eventual numero de 2 PFLOP/s deberia etiquetarse como computo util algoritmico o efectivo y no confundirse con el rendimiento real de issue de una sola GB10.
- Licencia Apache 2.0 declarada, sin restricciones de uso comercial conocidas en la ficha, pero aplicable solo al contenido efectivamente publicado, que hoy se limita a codigo, tokenizador y fuentes de kernel, no a pesos del modelo.
- Advertencia de procedencia: el autor usa un alias politico y el repositorio incluye contenido de terceros (`third_party/gb10_peak_mma/`); conviene auditar la procedencia y las licencias de esos materiales antes de reutilizarlos.
- Ausencia de informacion de seguridad. No hay model card de riesgos, ni politica de uso aceptable, ni evaluaciones de sesgo o toxicidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MarxistLeninist/AGILLM-GB10-1PF
- Dataset de entrenamiento citado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Artefacto de arquitectura citado en el repositorio: `ARCHITECTURE_LOCK.json` (incluido en el propio repositorio de HuggingFace)
- Evidencia de microbenchmark citada: `evidence/1pf_search/` (incluida en el repositorio)
- Evidencia de canario de entrenamiento: `evidence/canary/` (incluida en el repositorio)
- Codigo fuente del runtime disperso y kernels CUDA: incluidos en el repositorio de HuggingFace, junto con `agillm_gb10_1pf.py` y el bundle del tokenizador
- Reproducer de pico de MMA de terceros: `third_party/gb10_peak_mma/` (incluido en el repositorio)
- Paper, blog o demo oficial: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (anuncios clasificados de ganado en portales alemanes) y no se incluyen por no ser relevantes.
