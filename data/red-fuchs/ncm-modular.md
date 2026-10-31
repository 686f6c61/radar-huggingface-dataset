# Red-fuchs/ncm-modular

## Resumen

ncm-modular es un proyecto de investigación independiente de Red-fuchs que implementa herramientas y registros de experimentos para Next-Concept Modeling (NCM) en Apple Silicon mediante MLX. NCM es una arquitectura de modelado de lenguaje por difusión sobre códigos latentes, desarrollada originalmente por Kumbong et al. en HazyResearch (Stanford), descrita en el paper arXiv:2610.14162. El repositorio no incluye pesos propios: todo se construye a partir de los checkpoints oficiales de hazyresearch/ncm-checkpoints.

A diferencia de un modelo tradicional, ncm-modular es más bien un conjunto modular de componentes: un port a MLX del códec VQ-VAE multiscale-residual (XSum y WMT14), sondas de ida y vuelta del códec, una biblioteca de enmascaramiento por sustitución de entidades raras, un generador NCM condicionado por prefijo entrenable en MLX y experimentos de generación por bloques (block-seam). El autor lo describe como una idea "estilo Linux" para LLMs locales: un núcleo compartido (el códec) con módulos intercambiables.

Es relevante porque documenta resultados honestos, incluidos varios negativos: en el pilotaje MASSIVE-de, el modelo NCM perdió frente a un decodificador autorregresivo del mismo tamaño. Su valor está en la reproducibilidad y en la exploración práctica de NCM en hardware de consumo (probado en un M1 Max de 64 GB), no en ofrecer un modelo de producción. La licencia es MIT y los idiomas de trabajo son inglés y alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Next-Concept Modeling (difusión sobre códigos VQ-VAE multiscale-residual); generador 8 capas / 512 dim |
| Parametros totales | Generador NCM: 27,6 M (pilotaje MASSIVE-de); variante TinyStories: 89 M; no disponible para los checkpoints oficiales completos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Generación por bloques de 128 tokens con ventana deslizante; no disponible un valor de contexto máximo formal |
| Tipos de cuantizacion | fp32 (códec), fp16 (inferencia del generador en MLX); no disponible información sobre cuantización de 4/8 bits |
| Idiomas soportados | Inglés, alemán |
| Licencia | MIT |
| Formato de pesos | Checkpoints oficiales de HazyResearch; códecs MLX (XSum 231 MB, WMT14 549 MB en fp32); conversor JANG a GGUF no incluido por licencia sin resolver |

## Arquitectura y entrenamiento

NCM (Next-Concept Modeling) no genera tokens directamente: codifica el texto con un VQ-VAE multiscale-residual en varios niveles de granularidad (códigos gruesos a finos) y un generador produce esos códigos mediante difusión, con un número de evaluaciones de función de NFE = 1 + K-1 (K niveles del códec; 12 niveles en el experimento de velocidad). El códec se porta a MLX para ejecutarse sin PyTorch en inferencia, con verificación de paridad contra el códec oficial: 100 % de códigos idénticos en XSum y 99,89 % en WMT14 (un código divergente en el nivel 9), con ids decodificados 100 % idénticos en todos los niveles.

Los generadores del repositorio se entrenan en MLX a partir de prefijos de texto hacia códigos de códec, junto con baselines autorregresivos y clasificadores del mismo tamaño. Los datos usados incluyen TinyStories (roneneldan/TinyStories) y MASSIVE en alemán (AmazonScience/massive, 11,5 k ejemplos de entrenamiento en el pilotaje). No hubo RLHF ni DPO; son modelos pequeños de investigación entrenados desde cero o sobre códecs congelados. Como innovación práctica, se incluye un esquema de enmascaramiento por sustitución (surrogate masking) que reemplaza entidades raras por palabras comunes (Tom, Lily, three, Monday) antes del códec, con una tabla por texto para restaurarlas después, lo que recupera el 100 % de los hechos en el test de estrés con códecs XSum y WMT14.

## Capacidades

- Generación de texto por difusión sobre códigos latentes (no token a token), con decodificación posterior mediante el códec VQ-VAE.
- Generación por bloques con ventana deslizante (experimento block-seam), con memoria de tabla de entidades y códigos gruesos de bloques anteriores en el prefijo.
- Clasificación de intenciones y extracción de slots en alemán (pilotaje MASSIVE-de).
- Codificación y decodificación de texto en MLX puro, sin dependencia de PyTorch en inferencia, en Apple Silicon.
- Preservación de entidades raras mediante surrogate masking con tabla por texto.
- No hay soporte documentado de tool calling, agentes, visión ni audio.
- El propio autor etiqueta el proyecto como "research-code" y "negative-results": no es un modelo de propósito general.

## Casos de uso

- Investigación reproducible en modelos de difusión de texto: el repositorio permite replicar los experimentos de NCM en Apple Silicon sin GPUs de datacenter, con registros de paridad y resultados publicados.
- Prototipado de LLMs locales modulares: la arquitectura "núcleo + módulos" permite intercambiar códecs y generadores, útil para explorar diseños desacoplados entre representación latente y modelo generativo.
- Evaluación de pérdida de información en códecs discretos: las sondas de ida y vuelta cuantifican cuántos nombres, números y fechas sobreviven a encode/decode (62 % en TinyStories, 89 % en XSum, 96 % en WMT14), útil para auditar pipelines latentes.
- Generación de texto largo con consistencia de entidades: el experimento block-seam reduce nombres inventados del 8,1 % al 2,2 % usando tabla de entidades y memoria de códigos gruesos, aplicable a narrativa continua por bloques.
- Clasificación de intenciones en alemán con modelos pequeños: el pilotaje MASSIVE-de muestra que un clasificador de 3,3 M alcanza 74,7 % de precisión de intención a 3,5 ms por consulta, adecuado para NLU en dispositivo.
- Benchmark de velocidad de difusión en Apple Silicon: mediciones de 49-69 ms por bloque de 128 tokens (unos 1900-2600 tok/s en M1 Max) sirven de referencia para optimizaciones MLX.
- Enseñanza de resultados negativos: las tablas donde NCM pierde frente a AR (68,2 % vs 73,5 % de precisión de intención) son material didáctico sobre cuándo no usar modelado latente.

## Benchmarks y rendimiento

Los únicos datos publicados son los del propio repositorio (ejecuciones únicas en un M1 Max de 64 GB, sin intervalos de confianza). No hay benchmarks estándar (MMLU, HumanEval, GSM8K).

Pilotaje MASSIVE-de (test, 2974 utterances, entrenado desde cero con 11,5 k ejemplos):

| Modelo | Parametros | Precision de intencion | Slot F1 | Exact match | Latencia b=1 |
|---|---|---|---|---|---|
| NCM (códec WMT14, 8L/512d, NFE 11) | 27,6 M | 68,2 % | 47,6 % | 51,0 % | 304 ms* |
| AR (mismos bloques, KV cache) | 25,5 M | 73,5 % | 59,1 % | 57,6 % | 102 ms* |
| Clasificador (solo intencion) | 3,3 M | 74,7 % | - | - | 3,5 ms* |

*Medidas antes del 31-10-2026 10:45, probablemente con throttling por Low Power Mode (penalización estimada de ~46 % de throughput); tratar como cotas inferiores de velocidad.

Experimento block-seam (TinyStories, T=0,7, modelos fuertemente subentrenados):

| Variante | Prefijo | Nombres inventados | Consistencia de entidades | PPL de costura (T=0) |
|---|---|---|---|---|
| a | Solo cola de texto | 8,1 % | 91,6 % | 39,0 |
| b | + tabla de entidades | 3,2 % | 96,6 % | 40,0 |
| c | + tabla + códigos gruesos de 6 bloques | 2,2 % | 97,7 % | 43,2 |

Velocidad en M1 Max (generador de costura, 8L/512d, 12 niveles, fp16, NFE 12): 49-69 ms por bloque de 128 tokens en batch 1 (≈1900-2600 tok/s). El batching apenas ayuda (1,1-1,9 s por lote de 50 bloques). El autor advierte leer RESULTS.md antes de citar cualquier cifra.

## Requisitos de hardware

- Diseñado y probado en Apple Silicon: M1 Max con 64 GB de memoria unificada ejecuta todo el pipeline (códec + generador) en MLX.
- Memoria: los códecs MLX ocupan 231 MB (XSum) y 549 MB (WMT14) en fp32; el generador de 27,6-89 M parámetros en fp16 añade del orden de 60-180 MB. En conjunto, cabe con holgura en equipos con 16 GB de memoria unificada, aunque no hay cifras oficiales de VRAM/RAM pico.
- No requiere GPU NVIDIA: no hay soporte documentado de CUDA; el stack es MLX (macOS). Ejecución en GPUs A100/H100/RTX 4090 no está documentada.
- Sí cabe en hardware de consumo: es precisamente su objetivo (Apple Silicon de gama alta; probablemente viable en M1/M2/M3 con suficiente RAM, sin datos publicados).
- Despliegue: mediante el paquete MLX janmus1c/ncm-mlx como dependencia y los scripts del repositorio (gen_mlx.py, train_gen.py, eval_all.py). No hay soporte de vLLM, llama.cpp, Ollama ni TGI; el conversor JANG a GGUF existe pero no se incluye por licencia sin resolver.
- Latencia: 49-69 ms por bloque de 128 tokens (≈1900-2600 tok/s) en M1 Max; latencias anteriores de 304 ms (NCM) y 102 ms (AR) en MASSIVE son cotas inferiores por throttling.

## Comparativa con modelos similares

| Aspecto | ncm-modular | NCM oficial (HazyResearch) | LLM AR pequeño tipico (p. ej. Qwen2.5-0.5B) |
|---|---|---|---|
| Paradigma | Difusion sobre codigos VQ-VAE (port MLX, experimental) | Difusion sobre codigos VQ-VAE (original) | Autorregresivo por tokens |
| Parametros | 27,6-89 M (generadores propios); checkpoints oficiales: no disponible | No disponible | ~0,5 B |
| Contexto | Bloques de 128 tokens con ventana deslizante | No disponible | 32k-128k tipico |
| Rendimiento documentado | Pierde frente a AR del mismo tamano en MASSIVE-de | No disponible en la informacion proporcionada | Muy superior en tareas generales |
| Licencia | MIT | MIT | Apache 2.0 (segun modelo) |
| Disponibilidad | Codigo y logs; sin pesos propios | Checkpoints en hazyresearch/ncm-checkpoints | Pesos publicos, ecosistema maduro |

La comparación más pertinente es interna: en el pilotaje MASSIVE-de, el decodificador autorregresivo del mismo tamaño supera a NCM en todas las métricas (intención 73,5 % vs 68,2 %; slot F1 59,1 % vs 47,6 %; latencia 102 ms vs 304 ms), y un clasificador de 3,3 M supera a ambos en intención. No hay alternativas difusionistas comparables con datos publicados en la información disponible.

## Limitaciones y advertencias

- Resultados negativos documentados: NCM pierde frente a AR del mismo tamaño en el pilotaje MASSIVE-de; el autor atribuye el cuello de botella al volumen de datos (11,5 k ejemplos para aprender un espacio latente de códec), no al códec (round trip del 99,97 %).
- El códec es con pérdida para cadenas raras: solo conserva el 62 % de entidades en TinyStories (89 % en XSum, 96 % en WMT14); el surrogate masking lo mitiga pero desplaza el problema a la detección de entidades (recall de spans del 86-91 % con regex).
- La salida estructurada es frágil: el round trip funciona como frases (99,9 %) pero no como JSON o pipes (8 %).
- En el experimento block-seam, el suavizado de costuras "no se demuestra"; a T=0 todos los modelos degeneran en repetición (repeticiones 4-gram entre bloques del 32-37 %), invalidando las comparaciones de perplejidad a T=0.
- Todas las cifras son de ejecuciones únicas en un M1 Max, sin intervalos de confianza, con modelos pequeños y frecuentemente subentrenados (~66 min de entrenamiento por variante).
- Varias latencias se tomaron con macOS Low Power Mode activo (penalización de ~46 %); el autor marca esas medidas como cotas inferiores.
- El conversor JANG a GGUF y los benchmarks de velocidad de Gemma no se incluyen por licencia sin resolver.
- Idiomas limitados a inglés y alemán; sin soporte documentado de castellano.
- Sin soporte de tool calling, agentes, visión ni audio; no apto para producción como modelo de propósito general.
- Sesgos: no disponible; los datasets de entrenamiento (TinyStories, MASSIVE) son sintéticos o de dominio estrecho, lo que limita la generalización.

## Enlaces

- Modelo: https://huggingface.co/Red-fuchs/ncm-modular
- Paper NCM: https://arxiv.org/abs/2610.14162
- Código oficial NCM: https://github.com/HazyResearch/ncm
- Checkpoints oficiales: https://huggingface.co/hazyresearch/ncm-checkpoints
- Paquete MLX dependencia: https://github.com/janmus1c/ncm-mlx
- Datasets: https://huggingface.co/datasets/AmazonScience/massive y https://huggingface.co/datasets/roneneldan/TinyStories
