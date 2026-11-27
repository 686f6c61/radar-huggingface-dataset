# philbert440/GLM-5.3-Flash-EXL3

## Resumen

GLM-5.3-Flash-EXL3 es una cuantizacion EXL3 de 2 bits del modelo zai-org/GLM-5.3-Flash, publicada por el usuario philbert440. El modelo base es un transformer MoE de 321.000 millones de parametros totales con aproximadamente 18.000 millones activos por token, y esta cuantizacion comprime los pesos para que quepan en cuatro GPU V100 de 32 GB. La relevancia de esta ficha radica en que demuestra que un modelo de esa escala puede servirse en hardware Volta (SM70) mediante un formato de pesos adaptado y kernels especificos, algo que el ecosistema ExLlamaV3 estandar no soporta.

El checkpoint emplea un orden de tiles propio (`tile_order: sm70_colmajor`) que solo interpreta correctamente 1Cat-vLLM con una serie de PRs concretos. No es, por tanto, un modelo plug-and-play: requiere compilar una version parcheada del servidor. El autor publica metricas de fidelidad frente al original FP8 (KL media de 0,132 y 87,8% de acuerdo top-1) y resultados de tareas (gsm8k-200 en 0,985, 75/75 en preguntas factuales y 2/75 de respuestas inventadas).

El modelo conserva la modalidad image-text-to-text del base y una ventana de contexto de 131.072 tokens en la configuracion medida. La licencia es MIT. La ficha describe exclusivamente los datos publicados por el autor; cualquier dato no presente en la informacion disponible se marca como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA dispersa, capa MTP y componentes KDA (segun referencias del README a kernels sparse-MLA y KDA output norm) |
| Parametros totales | 321.000 millones (321B) segun el autor; el Hub reporta 51.959.863.134 elementos de tensor almacenados por el empaquetado EXL3 |
| Parametros activos | Aproximadamente 18B por token |
| Longitud de contexto | 131.072 tokens (maximo medido en la configuracion de 1Cat-vLLM) |
| Tipos de cuantizacion | EXL3 2 bpw (K2) en la mayoria de expertos enrutados; EXL3 3 bpw (K3) en capas 4, 5, 7, 8 y 10; EXL3 4 bpw en expertos de la capa MTP; FP16 en shared experts, atencion, MLP densa, eh_proj, lm_head, gates, norms, routers, hyper-connections, embeddings y vision tower. Bitrate global sin cabeza: 2,12 bpw |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con trellis EXL3 empaquetado en int16; orden de tiles `sm70_colmajor` |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer con mezcla de expertos (MoE) de 321B parametros totales y unos 18B activos por token. El README de esta cuantizacion menciona componentes especificos: atencion MLA dispersa con kernel de softmax FP32 (PR #1092), una cabeza MTP (multi-token prediction) usada para decodificacion especulativa, y una KDA output norm que en la version sin compilar se ejecuta como ocho kernels eager de PyTorch por capa. Incluye ademas una torre de vision, coherente con el pipeline image-text-to-text. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni las fases de RLHF/DPO del modelo base en la informacion proporcionada.

Esta publicacion no reentrena el modelo: cuantiza la version FP8 del base. El proceso de calibracion uso 352 filas de 8192 tokens, codebook `mcg`, y un error relativo medio de reconstruccion por capa MoE de 0,011 (peor capa: 0,043). Los hessianos por experto combinan el hessiano de calibracion completa con uno construido a partir de los tokens realmente enrutados a cada experto, con peso 0,5, lo que redujo el error de salida en held-out aproximadamente un 14%. La eleccion de 3 bpw en capas concretas se hizo mediante un escaneo KL por capa.

## Capacidades

- Generacion de texto conversacional multi-turno, con contexto de hasta 131.072 tokens en la configuracion medida.
- Razonamiento y matematicas: el autor reporta 0,985 en gsm8k-200 con presupuesto de 3.072 tokens de respuesta y decodificacion greedy.
- Entrada de imagen y texto (pipeline image-text-to-text), con torre de vision conservada en su dtype original.
- Codificacion agentica: se evaluo en tres tareas reales de correccion de bugs validadas con los tests de los propios proyectos, superando dos de tres.
- Decodificacion especulativa mediante la cabeza MTP integrada, con 3 tokens draft en la configuracion recomendada.
- Capacidad de rechazar premisas falsas: 73 de 75 preguntas sobre entidades inexistentes fueron declinadas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en hardware Volta legacy: el caso central de esta publicacion es ejecutar un MoE de 321B en cuatro V100-SXM2-32GB con NVLink mediante TP4, aprovechando el orden de tiles SM70 y los kernels EXL3 para MoE de 1Cat-vLLM. Es adecuado cuando se dispone de V100 y no de A100/H100.
- Razonamiento matematico por lotes: con 0,985 en gsm8k-200 en modo greedy, el modelo sirve para pipelines de resolucion de problemas aritmeticos y verificacion de respuestas donde se necesita alta precision y no baja latencia.
- Asistencia conversacional de contexto largo: la ventana de 131.072 tokens permite mantener historiales extensos o documentos completos en memoria; el autor indica que esta build no colapso en bucles de repeticion a 75K-100K tokens, a diferencia de builds anteriores.
- Correccion de bugs en repositorios reales: las pruebas agenticas con validacion por tests del proyecto sugieren uso en tareas de parcheo de codigo donde la correccion se verifica automaticamente, integrándolo en un runner que aplique el diff y ejecute la suite.
- Extraccion de informacion con control de alucinacion: el resultado de 2/75 respuestas inventadas en preguntas sobre entidades ficticias lo hace apto para tareas de Q&A factual donde se penaliza la fabricacion de datos, con verificacion posterior.
- Procesamiento de documentos con imagen y texto: al conservar la torre de vision y el pipeline image-text-to-text, puede emplearse en tareas de descripcion o extraccion sobre capturas, diagramas o documentos escaneados.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de EXL3 2 bpw frente al FP8 original mediante KL y acuerdo top-1 sobre textos de codigo y documentacion.

## Benchmarks y rendimiento

Fidelidad frente al FP8 original (KL menor es mejor; tres textos held-out de 1.536 tokens):

| Build | KL README | KL doc de diseno | KL Python | KL media | Top-1 medio |
|---|---:|---:|---:|---:|---:|
| Primera build (todo K2) | 0,088 | 0,186 | 0,220 | 0,165 | 85,5% |
| Build 2 | 0,096 | 0,200 | 0,231 | 0,176 | 85,4% |
| Build 3 | 0,086 | 0,181 | 0,187 | 0,151 | 86,4% |
| Esta release (build 4) | 0,070 | 0,139 | 0,188 | 0,132 | 87,8% |

Tareas (gsm8k 200 preguntas, strict match, 3.072 tokens de respuesta; 75 preguntas factuales y 75 sobre entidades inexistentes, juzgadas por grok-4.3; greedy):

| Modelo | Factual | Respuestas inventadas (de 75) | gsm8k-200 |
|---|---:|---:|---:|
| GLM-5.3-Flash EXL3 2,1 bpw (este repo) | 1,000 | 2 | 0,985 |
| Qwen3.8-27B NVFP4, mejor variante del autor | 0,973 | 27 | 0,965 |
| Qwen3.8-27B NVFP4, Unsloth | 0,973 | 29 | 0,955 |

Velocidad en cuatro V100-SXM2-32GB (NVLink), TP4, una peticion simultanea, KV cache FP8, media de cuatro respuestas de 700 tokens, greedy:

| Decodificacion especulativa | tok/s | Contexto maximo |
|---|---:|---:|
| MTP integrada, 3 draft, con #1102 + #1159 + #1166 + #1165 (recomendado) | ~91 | 131.072 |
| MTP integrada, 3 draft, con #1102 + #1159 | ~86 | 131.072 |
| MTP integrada, 3 draft, kernels anteriores | ~76 | 131.072 |
| MTP integrada, 4 / 5 draft | 70,4 / 65,9 | 131.072 |
| Sin especulacion | ~48 | 131.072 |

## Requisitos de hardware

- VRAM: el checkpoint ocupa 104,1 GB en el repositorio; el objetivo de diseno es encajar en 4 x 32 GB (128 GB) de V100-SXM2-32GB con NVLink. No se publican cifras de VRAM para otras configuraciones.
- GPU recomendadas: V100-SXM2-32GB en TP4 es el unico escenario validado. No hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el formato SM70 y el tamano del checkpoint no indican viabilidad en consumer GPU segun la informacion disponible.
- Despliegue: exclusivamente 1Cat-vLLM con `main` mas los PRs #1159, #1166, #1165, #1161, #1102 y #1125 (#1091 ya esta fusionado en `main`). ExLlamaV3 estandar no puede cargar este checkpoint; el PR exllamav3#475 anade el orden de tiles al conversor, pero este checkpoint es anterior a su marcador por tensor.
- Throughput: ~91 tok/s en decodificacion con la configuracion recomendada y ~48 tok/s sin especulacion, con una sola peticion concurrente. No se publican datos de prefill ni de latencia por peticion.
- KV cache: configurada en FP8 en las mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash EXL3 2,1 bpw (este repo) | 321B totales / ~18B activos | 131.072 | KL media 0,132; gsm8k-200 0,985; 2/75 inventadas | MIT | Hugging Face, requiere 1Cat-vLLM parcheado |
| GLM-5.3-Flash (base, FP8) | 321B totales / ~18B activos | No disponible | Referencia de fidelidad | No disponible en esta ficha | Hugging Face (zai-org) |
| Qwen3.8-27B NVFP4 (mejor variante del autor) | 27B (no se detalla si MoE) | No disponible | Factual 0,973; 27/75 inventadas; gsm8k-200 0,965 | No disponible en esta ficha | No disponible en esta ficha |
| Qwen3.8-27B NVFP4 (Unsloth) | 27B | No disponible | Factual 0,973; 29/75 inventadas; gsm8k-200 0,955 | No disponible en esta ficha | No disponible en esta ficha |

## Limitaciones y advertencias

- El orden de tiles `sm70_colmajor` no lo entiende ExLlamaV3 estandar: cargarlo con esa herramienta produce decodificacion incorrecta de los pesos. Incluso con exllamav3#475 no carga, porque el checkpoint carece del marcador por tensor.
- Requiere compilar 1Cat-vLLM con seis PRs concretos; no existe build en orden estandar (sm80) publicado.
- El README advierte que builds anteriores colapsaban en bucles de repeticion a 75K-100K tokens de contexto; la ausencia de colapso en esta build se basa en una sola ejecucion por tarea y el propio autor la califica de evidencia preliminar.
- La evaluacion agentica consta de tres tareas privadas; el modelo obtuvo 17/30 puntos de juez frente a 20/30 de la API en la nube de GLM-5.3-Flash.
- La cifra de "Model size" del Hub (~52B) no refleja el numero real de parametros por el empaquetado trellis; el propio autor aclara la discrepancia.
- Solo se valido con una peticion concurrente; no hay datos de throughput con batching.
- No se dispone de informacion sobre sesgos, idiomas soportados ni restricciones adicionales de uso comercial mas alla de la licencia MIT.
- La licencia MIT se aplica a esta cuantizacion; no se detalla en la informacion disponible la licencia del modelo base zai-org/GLM-5.3-Flash.
- Riesgo de alucinacion: aunque el autor reporta 2/75 respuestas inventadas, la evaluacion se limita a 75 preguntas y un juez automatico (grok-4.3).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/philbert440/GLM-5.3-Flash-EXL3
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- 1Cat-vLLM: https://github.com/1CatAI/1Cat-vLLM
- PR #1159 (decode fast paths): https://github.com/1CatAI/1Cat-vLLM/pull/1159
- PR #1166 (decode fast path): https://github.com/1CatAI/1Cat-vLLM/pull/1166
- PR #1165 (decode fast path): https://github.com/1CatAI/1Cat-vLLM/pull/1165
- PR #1161 (MTP startup fix): https://github.com/1CatAI/1Cat-vLLM/pull/1161
- PR #1102 (loader y kernels EXL3 MoE): https://github.com/1CatAI/1Cat-vLLM/pull/1102
- PR #1125 (prefill rapido, incluye #1092): https://github.com/1CatAI/1Cat-vLLM/pull/1125
- PR #1092 (kernel sparse-MLA con softmax FP32): https://github.com/1CatAI/1Cat-vLLM/pull/1092
- PR #1091 (decodificacion especulativa MTP, fusionado en main): https://github.com/1CatAI/1Cat-vLLM/pull/1091
- PR exllamav3#475 (orden de tiles en el conversor): https://github.com/turboderp-org/exllamav3/pull/475
