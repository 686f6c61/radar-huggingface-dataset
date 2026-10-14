# lablup/GLM-5.2-NVFP4-DFlash-ko

## Resumen

GLM-5.2-NVFP4-DFlash-ko es un modelo borrador (draft model) para decodificación especulativa, desarrollado por Lablup Inc. y publicado en Hugging Face con licencia MIT. No es un modelo generativo autónomo: su función es proponer bloques de tokens que el modelo objetivo `nvidia/GLM-5.2-NVFP4` (un MoE de 753.000 millones de parámetros con 40.000 millones activos) verifica en paralelo, acelerando la decodificación sin alterar la distribución de salida del modelo grande.

El borrador implementa el método DFlash, una aproximación de difusión por bloques descrita en el paper arXiv:2602.06036. Consume los estados ocultos concatenados de las capas 1, 20, 38, 56 y 75 del modelo objetivo y predice en paralelo un bloque de tokens enmascarados. Está especializado en tráfico agéntico con tool calling y consultas de código formuladas en coreano, y fue entrenado sobre trayectorias reales de agentes capturadas en servidor, no sobre suites de benchmarks.

Su relevancia práctica es doble: por un lado, la decodificación especulativa es una de las pocas técnicas que reduce latencia de decodificación sin tocar la calidad del modelo servido; por otro, la mayoría de borradores públicos están entrenados sobre tráfico en inglés y pierden tasa de aceptación cuando el dominio cambia. Este modelo mantiene la longitud media de aceptación (MAL) estable entre tráfico agéntico genérico y consultas de código en coreano (2,71 y 2,77 respectivamente), frente a la caída de ~0,6 MAL que sufre un borrador entrenado solo en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash block-diffusion draft model (5 capas, block size 16); consume hidden states concatenados de las capas [1, 20, 38, 56, 75] del modelo objetivo. Etiquetado como `qwen3` en Hugging Face |
| Parametros totales | 1.824.596.608 segun los metadatos de safetensors. La model card describe el borrador como un `DFlashDraftModel` de 1,05B, por lo que la cifra del repositorio puede incluir cabezales y embeddings adicionales |
| Parametros activos | No aplica: el borrador no es un modelo MoE (el objetivo `nvidia/GLM-5.2-NVFP4` si lo es, con 753B totales y 40B activos) |
| Longitud de contexto | Entrenado a 16K tokens. El modelo objetivo admite hasta 262.144 tokens (`--max-model-len 262144`) |
| Tipos de cuantizacion | El objetivo `nvidia/GLM-5.2-NVFP4` usa NVFP4. Para el borrador no se detallan cuantizaciones especificas; los pesos se distribuyen en safetensors |
| Idiomas soportados | Coreano (ko) e ingles (en); especializado en consultas en coreano |
| Licencia | MIT, siguiendo la del objetivo `nvidia/GLM-5.2-NVFP4` |
| Formato de pesos | safetensors (repo de 3,6 GB) |

## Arquitectura y entrenamiento

El borrador es un `DFlashDraftModel` de 5 capas con tamano de bloque 16. A diferencia de los borradores autoregresivos clasicos (EAGLE, Medusa) que proponen tokens uno a uno, DFlash plantea la prediccion como una tarea de difusion por bloques: el modelo recibe caracteristicas del objetivo y produce simultaneamente un bloque completo de tokens enmascarados. Esto permite aprovechar mejor el paralelismo del hardware y elevar el numero de tokens propuestos por paso de verificacion. La implementacion requiere `trust_remote_code=True` y esta empaquetada con codigo personalizado (`custom_code`).

El entrenamiento partio de un borrador de previsualizacion (warm start) y se completo con 135.887 pares agénticos capturados, a 16K de contexto, durante 1 epoca y 33.971 pasos con learning rate 7e-5 y schedule coseno. Los datos provienen de sesiones reales de agentes de codigo (arneses OpenCode, Codex y Claude Code) que consultaban un endpoint GLM-5.2-NVFP4 sobre 17.616 issues de GitHub localizadas al coreano, repartidas en 619 repositorios de licencia permisiva. Las respuestas se capturaron en el lado del servidor, de modo que el borrador se entrena contra los identificadores de token exactos del objetivo. El computo total fue de 4 nodos con 8 GPU B200 cada uno (32 GPU) durante aproximadamente 6,9 dias. Los pesos del borrador son originales, inicializados aleatoriamente segun el esquema de Hugging Face y entrenados desde cero.

## Capacidades

- Prediccion especulativa de bloques de tokens para el objetivo `nvidia/GLM-5.2-NVFP4`, con k=15 como valor optimo en el stack medido (un barrido de k confirmo que bloques mas cortos rinden peor pese a tener mayor ratio de aceptacion).
- Aceleracion de la decodificacion en tareas de codigo: 3,38x en HumanEval, 1,90x en MBPP.
- Aceleracion en razonamiento matematico y aritmetico: 2,07x en MATH-500 y 1,79x en GSM8K.
- Aceleracion en conversacion general: 1,42x en MT-Bench.
- Soporte de flujos agénticos multi-turno con tool calling: 1,72x de aceleracion con MAL de 2,71 sobre trafico de produccion.
- Optimizacion especifica para consultas de codigo en coreano: 1,92x de aceleracion con MAL de 2,77.
- No realiza generacion de texto final, razonamiento, vision, audio ni tool calling por si mismo: hereda el comportamiento del modelo objetivo y solo interviene en el bucle de decodificacion.

## Casos de uso

- Aceleracion de endpoints de codigo en produccion: integrado via `--speculative-config` en vLLM junto al objetivo GLM-5.2-NVFP4, reduce el coste por token decodificado en tareas de generacion de codigo. En HumanEval pasa de ~118 tok/s de linea base a 400 tok/s con batch 1.
- Asistentes de programacion para desarrolladores coreanoparlantes: al mantener MAL 2,77 sobre consultas de codigo en coreano, es la pieza adecuada para un copiloto que recibe instrucciones en hangul y debe responder con baja latencia.
- Agentes autonomos con tool calling: los arneses tipo OpenCode, Codex o Claude Code generan trafico multi-turno con llamadas a herramientas; el borrador fue entrenado precisamente sobre ese tipo de trayectorias, con MAL 2,71 y 198 tok/s en el escenario de produccion medido.
- Atencion al cliente automatizada de baja latencia: el objetivo soporta 262.144 tokens de contexto, de modo que un asistente puede mantener historiales larguisimos; el borrador evita que ese contexto se traduzca en latencias inaceptables en decodificacion.
- Procesamiento por lotes sobre repositorios de GitHub: dado el entrenamiento sobre 17.616 issues localizadas de 619 repositorios, es util en pipelines que resumen, clasifican o traducen issues y PRs en coreano con alto volumen.
- Generacion de codigo en CI/CD: puede servir como acelerador del endpoint que sugiere parches, genera tests o revisa diffs dentro de un pipeline, manteniendo el mismo modelo objetivo y por tanto la misma calidad de salida.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de DFlash aplicado a un MoE de gran escala, con datos de MAL, throughput y speedup publicados por suite, util para comparar metodos de draft (EAGLE, Medusa, difusion por bloques).
- Despliegue en infraestructura con presupuesto de latencia estricto: cuando el objetivo 753B ya esta servido con TP8 y parallelismo de expertos, anadir este borrador de 1,82B (3,6 GB) es un coste de memoria marginal frente a una mejora de hasta 3,38x en decodificacion.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en vLLM con TP8, CUDA graphs, contra `nvidia/GLM-5.2-NVFP4` con checkpoint en el paso 33.971. MAL = longitud media de aceptacion (1 + aceptados/propuestos). El speedup se mide en tok/s de decodificacion frente al mismo servidor sin especulacion (~118 tok/s de linea base, batch 1).

| Suite | MAL | decode tok/s | Speedup |
|---|---|---|---|
| HumanEval | 4,87 | 400 | 3,38x |
| MATH-500 | 2,88 | 242 | 2,07x |
| MBPP | 2,65 | 224 | 1,90x |
| GSM8K | 2,50 | 212 | 1,79x |
| MT-Bench | 1,94 | 167 | 1,42x |
| Agéntico multi-turno (tool calling) | 2,71 | 198 | 1,72x |
| Consultas de codigo en coreano | 2,77 | 220 | 1,92x |

Las cinco primeras filas corresponden a evaluacion greedy sin modo thinking. Las dos ultimas se midieron sobre trafico de produccion con temperature 1,0 y top-p 0,95. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval del objetivo, etc.) en la informacion disponible, ya que este modelo no genera respuestas finales.

## Requisitos de hardware

- El borrador ocupa 3,6 GB en safetensors, un coste de memoria insignificante frente al objetivo.
- El objetivo `nvidia/GLM-5.2-NVFP4` tiene 753.000 millones de parametros y requiere paralelismo tensorial de grado 8 con parallelismo de expertos para entrar en memoria: la receta publicada usa `--tensor-parallel-size 8 --enable-expert-parallel`. Esto implica al menos 8 GPU de clase datacenter.
- Para entrenamiento se usaron 4 nodos x 8 B200 durante ~6,9 dias, lo que da una referencia del orden de magnitud del computo (32 GPU B200).
- No cabe en GPU de consumo: ni la RTX 4090 (24 GB) ni ninguna solucion monoproceso puede alojar el objetivo de 753B, incluso cuantizado a NVFP4.
- Despliegue recomendado: vLLM como servidor, con CUDA graphs activados (no usar `--enforce-eager`, que degrada el rendimiento), `--tool-call-parser glm47`, `--enable-auto-tool-choice`, `--reasoning-parser glm45` y backend de atencion `triton_attn` en la configuracion especulativa.
- Carga del borrador en el ecosistema transformers requiere `trust_remote_code=True` por tratarse de codigo personalizado; los tags declaran compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput medidos: 118 tok/s de linea base en decodificacion (batch 1) y entre 167 y 400 tok/s segun la suite al activar la especulacion con k=15.
- Un barrido de k confirmo que 15 tokens especulativos es el optimo en este stack; bloques mas cortos obtienen peor rendimiento pese a mayor ratio de aceptacion, lo que sugiere que el coste fijo de verificacion domina en k pequenos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lablup/GLM-5.2-NVFP4-DFlash-ko | Borrador DFlash para decodificacion especulativa (coreano/agéntico) | 1,82B (metadatos safetensors) | Entrenado a 16K | MAL 2,71-4,87; hasta 3,38x de speedup de decodificacion | MIT | Hugging Face, integrable en vLLM |
| Borrador DFlash entrenado en ingles (mismo metodo, sin especializacion en coreano) | Borrador DFlash | no disponible | no disponible | La model card indica una caida de ~0,6 MAL al pasar de trafico agéntico a coreano | no disponible | no disponible |
| Sin decodificacion especulativa (objetivo GLM-5.2-NVFP4 solo) | Servicio autoregresivo directo | 753B totales / 40B activos | 262.144 tokens | ~118 tok/s de decodificacion (batch 1), referencia de linea base | MIT (objetivo) | vLLM con TP8 |
| EAGLE-3 / Medusa / otros borradores agénticos | Borradores autoregresivos o basados en multiples cabezales | no disponible | no disponible | No se han publicado comparativas frente a DFlash en la informacion disponible | no disponible | no disponible |

No se dispone de datos publicados que comparen este borrador con alternativas equivalentes de otros autores bajo el mismo stack de servicio, por lo que las cifras de la ultima fila quedan explicitamente marcadas como no disponibles.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona acoplado a `nvidia/GLM-5.2-NVFP4`. Sin el modelo objetivo no produce texto util, y no debe evaluarse como generador.
- Requiere carga con `trust_remote_code=True` debido al codigo personalizado (`custom_code`), lo que implica ejecutar codigo del autor en el entorno de inferencia.
- La aceleracion depende del stack: necesita vLLM con soporte del metodo `dflash` en `--speculative-config`. No hay ruta de despliegue declarada para llama.cpp, Ollama u otros runners ligeros, y el objetivo NVFP4 de 753B tampoco los hace viables.
- La especializacion es deliberadamente estrecha: trafico agéntico con tool calling y codigo en coreano. En dominios alejados de ese reparto (por ejemplo prosa en ingles o conversacion general) la MAL cae hasta 1,94 como se observa en MT-Bench, de modo que el speedup se reduce a 1,42x.
- El alcance de idiomas declarado es ko y en. No hay evidencia publicada de comportamiento en castellano ni en otros idiomas, y es previsible que la tasa de aceptacion sea menor fuera del dominio entrenado.
- Los benchmarks publicados miden exclusivamente velocidad de decodificacion y aceptacion del borrador, no calidad de las respuestas. La calidad la determina integramente el modelo objetivo.
- El entrenamiento se realizo con datos capturados de sesiones de agentes sobre issues de GitHub, lo que puede introducir sesgos de dominio (estilo de codigo, tipos de repositorio, convenciones de la comunidad coreana) en la distribucion de propuestas.
- La licencia del borrador es MIT, siguiendo la del objetivo, pero la model card advierte explicitamente de que hay que verificar las licencias del dataset y del modelo objetivo para redistribuciones propias.
- Al tratarse de decodificacion especulativa, el borrador no introduce alucinaciones adicionales por si mismo, ya que cada token propuesto es verificado por el objetivo; sin embargo, un MAL bajo o un k mal configurado degradan el throughput de forma notable y pueden hacer que la especulacion resulte mas lenta que servir sin ella.
- El repositorio tiene un volumen de descargas muy bajo (35 en el momento de la consulta) y una unica version publicada, con lo que la validacion por parte de terceros es todavia escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lablup/GLM-5.2-NVFP4-DFlash-ko
- Archivos y versiones del repositorio: https://huggingface.co/lablup/GLM-5.2-NVFP4-DFlash-ko/tree/main
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Modelo objetivo: https://huggingface.co/nvidia/GLM-5.2-NVFP4
- Ficha en Free2AITools: https://free2aitools.com/model/lablup/glm-5.2-nvfp4-dflash-ko
- Anuncio de Lablup (Wooryung Yoo, LinkedIn): https://www.linkedin.com/posts/wyyoo_lablupglm-52-nvfp4-dflash-ko-hugging-activity-7515822335099097088-X-FD
- Cobertura de prensa coreana (IKLD): https://www.ikld.kr/news/articleView.html?idxno=342027
