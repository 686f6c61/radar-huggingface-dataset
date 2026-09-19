# Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbsft_finetuned_keep_0p60

## Resumen

El modelo `Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbsft_finetuned_keep_0p60` es una variante comprimida de `meta-llama/Meta-Llama-3-8B-Instruct` obtenida mediante la tecnica Basis Sharing, desarrollada en el repositorio academico [TUDa-HWAI/Basis_Sharing](https://github.com/TUDa-HWAI/Basis_Sharing) y aplicada aqui por el autor de la ficha (Jeesup). El objetivo declarado no es producir un modelo util para produccion, sino servir como celda experimental para medir si el ajuste fino de recuperacion con datos de seguridad preserva la conducta de rechazo tras una compresion agresiva.

La compresion elimina el 40 % de los parametros efectivos (fraccion retenida real de 0,599853515625) haciendo que cada dos capas adyacentes compartan una base por tipo de peso. Los pesos se pliegan despues a formas densas estandar de Llama, de modo que el modelo carga con `transformers` sin codigo personalizado, pero es rank-deficient: no ocupa menos en disco (el repositorio pesa 16,1 GB) pese a conservar solo el 60 % del presupuesto de parametros.

Su relevancia es metodologica: cuantifica el coste en seguridad y utilidad de comprimir un modelo alineado, con metricas de ataque (AdvBench, StrongREJECT), de sobre-rechazo (XSTest-safe, OR-Bench-Hard-1K) y de utilidad general (perplejidad en WikiText-2 y siete benchmarks zero-shot). Publicado el 19 de septiembre de 2026, no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3: RoPE, GQA, sesgo en q/k/v), con pesos comprimidos por Basis Sharing y plegados a formas densas estandar (rank-deficient) |
| Parametros totales | 8.030.261.248 (8,03 B) en disco; fraccion real de parametros tras la compresion: 0,599853515625 (≈60 %) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Meta-Llama-3-8B-Instruct (8.192 tokens) |
| Tipos de cuantizacion | No se publican versiones cuantizadas; el repositorio solo contiene pesos safetensors (16,1 GB). Al ser una arquitectura Llama densa estandar, es convertible a GGUF/GPTQ/AWQ con herramientas habituales |
| Idiomas soportados | No disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Datos de recuperacion | yahma/alpaca-cleaned + 960 filas de rechazo (96 comportamientos daninos de JailbreakBench x10; 1,82 % de las filas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El punto de partida es Meta-Llama-3-8B-Instruct. Sobre sus pesos se aplica Basis Sharing: los pesos se agrupan de dos en dos capas adyacentes y se les ajusta una base compartida por tipo de peso. Los tipos compartidos son `v`, `k`, `q`, `up` y `gate`; los tipos `down` y `o` permanecen privados por capa. La base compartida se obtiene mediante SVD blanqueado (whitened SVD) de los pesos concatenados horizontalmente de cada grupo, con calibracion en 256 secuencias de WikiText-2 de 2.048 tokens y semilla 42 (el codigo original fija la semilla 2023; este proyecto calibra todos los metodos con una sola semilla).

Tras la compresion, solo se entrenan los coeficientes mediante LoRA (r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64), manteniendo las bases compartidas y por capa congeladas y bit-identicas al modelo comprimido. El resultado se fusiona con `C' = C + (alpha/r)BA` y se pliega a denso con `W = C' @ B`, de modo que cada peso mantiene rango <= k y el presupuesto de parametros sobrevive intacto a la recuperacion. No es el LoRA propio de Basis Sharing (que usa WikiText, batch 1 y solo q/v): se emplea la receta alpaca del proyecto para que los datos de recuperacion sean constantes entre metodos. La peculiaridad de esta celda concreta es que el conjunto de recuperacion mezcla `yahma/alpaca-cleaned` con 960 filas de rechazo derivadas de 96 comportamientos daninos de JailbreakBench (x10 repeticiones), cuyos objetivos son los rechazos greedy generados por `meta-llama/Llama-2-7b-chat-hf`. Esto constituye el brazo de referencia ("recovery_mix") para comprobar si los datos de seguridad en la fase de recuperacion preservan la conducta de rechazo. La codificacion posicional usa las tablas rotatorias de `transformers` construidas a partir del config del modelo, verificadas como identicas a Llama estandar en float64 para bases RoPE 1e4/5e5/1e6, escalado llama3 y atencion con consultas agrupadas.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat de Llama 3 y decodificacion greedy en todas las evaluaciones publicadas.
- Razonamiento de sentido comun y conocimiento general de nivel medio-bajo: ARC-Easy, HellaSwag, WinoGrande, OpenBookQA y PIQA mantienen valores funcionales pese a la compresion.
- Aritmetica y razonamiento matematico basico (MathQA con 0,2734 de acc_norm), muy degradado respecto a un 8B sin comprimir.
- Conducta de rechazo ante peticiones daninas: AdvBench HarmBench ASR de 0,0462 y StrongREJECT HarmBench ASR de 0,0639.
- Soporte de tool calling / function calling: no documentado en la model card (el modelo base Llama 3 8B Instruct si lo soporta, pero no hay evidencia publicada para esta variante).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales: no hay modo thinking, vision ni audio. La unica caracteristica diferencial es la estructura de pesos comprimida por bases compartidas.
- Carga con `transformers` estandar sin codigo de modelado personalizado (pesos plegados a formas densas Llama).

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como punto de medida del compromiso entre fraccion de parametros retenida (0,6) y degradacion de tareas, comparando la perplejidad de WikiText-2 (18,27) y los benchmarks zero-shot frente al modelo sin comprimir.
- Estudio del efecto de los datos de seguridad en la fase de recuperacion: esta celda mezcla 960 filas de rechazo y se compara contra la celda equivalente sin esa mezcla, lo que permite aislar si el ajuste con datos de seguridad preserva el rechazo tras comprimir.
- Evaluacion de robustez ante jailbreaks: los ASR medidos con AdvBench y StrongREJECT, juzgados por `cais/HarmBench-Llama-2-13b-cls`, permiten usar el modelo como sujeto de pruebas en pipelines de red teaming automatizado.
- Analisis de sobre-rechazo: las tasas sobre XSTest-safe (0,2410) y OR-Bench-Hard-1K (0,4021) permiten estudiar como la compresion empuja al modelo a rechazar peticiones benignas, un fenomeno relevante para calibrar sistemas de moderacion.
- Reproduccion de experimentos de Basis Sharing: al publicar los factores plegados y la receta completa (SVD blanqueado, calibracion, LoRA sobre coeficientes), permite replicar el pipeline sobre otros modelos o ratios de compresion.
- Base para experimentos de fine-tuning restringido: dado que las bases quedan congeladas y solo se entrenan coeficientes, es un banco de pruebas para metodos de adaptacion de bajo rango que deben respetar un presupuesto de parametros fijo.
- Docencia y divulgacion tecnica: ilustra de forma tangible la diferencia entre "menos parametros" y "menos peso en disco", ya que el modelo es rank-deficient pero ocupa 16,1 GB.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,5999 |
| WikiText-2 (perplejidad) | 18,2700 |
| ARC-Easy (acc_norm) | 0,5863 |
| ARC-Challenge (acc_norm) | 0,3558 |
| HellaSwag (acc_norm) | 0,5727 |
| WinoGrande (acc) | 0,6401 |
| OpenBookQA (acc_norm) | 0,3880 |
| PIQA (acc_norm) | 0,7089 |
| MathQA (acc_norm) | 0,2734 |
| AdvBench HarmBench ASR | 0,0462 |
| StrongREJECT HarmBench ASR | 0,0639 |
| Tasa de sobre-rechazo (XSTest-safe) | 0,2410 |
| Tasa de sobre-rechazo (OR-Bench-Hard-1K) | 0,4021 |
| Tasa macro de sobre-rechazo | 0,3215 |

Metodologia de evaluacion: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; generacion en AdvBench y StrongREJECT juzgada por `cais/HarmBench-Llama-2-13b-cls`; sobre-rechazo en XSTest-safe y OR-Bench-Hard-1K juzgado por `allenai/wildguard`. Toda la generacion usa la plantilla de chat y decodificacion greedy. La model card indica que el juicio de sobre-rechazo es fiable para esta celda (fraccion puntuada de 1,00 en XSTest-safe y en OR-Bench-Hard-1K). No se publican resultados de benchmarks comparativos contra otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en precision original: los 8.030.261.248 parametros en fp16/bf16 ocupan aproximadamente 16,1 GB, en linea con el tamano del repositorio. Hay que sumar cache KV y activaciones: para el modelo base de 32 capas, 8 cabezas KV y dimension de cabeza 128, la cache KV a 8.192 tokens ronda 1 GB en fp16 (estimacion aritmetica, no publicada en la model card).
- La compresion no reduce el consumo de memoria: el modelo es rank-deficient, no mas pequeno en disco.
- Cabe en GPU de consumo con 24 GB (RTX 3090, RTX 4090) en fp16, con margen limitado de contexto. En tarjetas de 16 GB requeriria cuantizacion previa, que no se distribuye.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, para servir con contexto completo y concurrencia.
- Opciones de despliegue: `transformers` estandar de forma directa (pesos plegados a formas densas Llama). vLLM y TGI son viables en principio al ser una arquitectura Llama densa, aunque no hay configuracion publicada ni verificada por el autor. Para llama.cpp u Ollama habria que convertir los pesos a GGUF previamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (Basis Sharing, keep 0,60) | 8,03 B en disco; 60 % de presupuesto efectivo | No especificado (heredado 8.192 tokens) | llama3 | HuggingFace, 0 descargas | PPL WikiText-2 18,27; ARC-Easy 0,5863; HellaSwag 0,5727; ASR AdvBench 0,0462 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8 B | 8.192 tokens | llama3 | HuggingFace, ampliamente desplegado | No disponible en la informacion proporcionada |
| Otras celdas del mismo proyecto Basis Sharing (mismo ratio, sin mezcla de seguridad) | 8,03 B en disco; 60 % | No especificado | llama3 | Referenciadas en la model card, no enlazadas | No disponible en la informacion proporcionada |
| Otras tecnicas de compresion por bajo rango sobre Llama 3 8B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa con el modelo base y con las demas celdas del proyecto no puede completarse: la model card no incluye sus cifras y la busqueda web realizada no devolvio resultados relacionados con el modelo, la tecnica ni el proyecto (los resultados obtenidos corresponden a software de gestion de plantillas laborales y no son pertinentes).

## Limitaciones y advertencias

- La propia model card advierte de que la compresion a este ratio degrada la conducta de rechazo; la celda existe precisamente para medir ese efecto. Las cifras de seguridad de un modelo que puede haberse vuelto degenerado no constituyen evidencia sobre alineamiento.
- El modelo es un artefacto de investigacion. Con 0 descargas y sin pipeline declarado, no deberia usarse en produccion ni como asistente de proposito general.
- Sobrerrechazo elevado: 0,2410 en XSTest-safe, 0,4021 en OR-Bench-Hard-1K y 0,3215 macro. Rechaza un porcentaje considerable de peticiones benignas.
- Utilidad degradada: MathQA en 0,2734 y ARC-Challenge en 0,3558, propios de un modelo comprimido al 60 % de presupuesto de parametros.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable al alza dado que la perplejidad en WikiText-2 (18,27) es superior a la de un 8B sin comprimir.
- Idiomas soportados: no declarados. La evaluacion se ha hecho integramente en ingles; el comportamiento en castellano no esta medido.
- No hay versiones cuantizadas publicadas, lo que dificulta el despliegue en hardware de gama de consumo.
- Restricciones de licencia: Llama 3 Community License. Permite uso comercial con condiciones (clausula de 700 millones de usuarios activos mensuales, politica de uso aceptable y requisito de atribucion "Built with Meta Llama 3"). No es una licencia de codigo abierto permisiva tipo Apache 2.0.
- El modelo base Llama 3 8B Instruct incorpora sus propios sesgos, que esta variante no corrige y puede amplificar al haberse recuperado con LoRA sobre una mezcla reducida de datos.
- El conjunto de recuperacion incluye 960 filas de rechazo generadas por Llama-2-7b-chat, no por Llama 3, lo que puede introducir un estilo de rechazo no nativo del modelo base.
- Los pesos son rank-deficient: la precision numerica efectiva por matriz es inferior a la de un modelo denso completo, aunque esto no se refleja en el tamano del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbsft_finetuned_keep_0p60
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Codigo de Basis Sharing: https://github.com/TUDa-HWAI/Basis_Sharing
- Conjunto de recuperacion: https://huggingface.co/datasets/yahma/alpaca-cleaned
- JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- AdvBench: https://github.com/llm-attacks/llm-attacks
- StrongREJECT: https://github.com/dsbowen/strong_reject
- XSTest: https://github.com/paul-rottger/xstest
- OR-Bench: https://huggingface.co/datasets/bench-llm/or-bench
- Juez de dano HarmBench (Llama-2-13b-cls): https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobre-rechazo WildGuard: https://huggingface.co/allenai/wildguard
- Modelo generador de los objetivos de rechazo: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo, su tecnica o su evaluacion.
