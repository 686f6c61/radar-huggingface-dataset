# prithivMLmods/Nemotron-Labs-Image-30B-A3B-GGUF

## Resumen

Nemotron-Labs-Image-30B-A3B es un modelo autorregresivo de generacion de imagenes texto-a-imagen con arquitectura de mezcla de expertos (MoE), desarrollado por NVIDIA. Cuenta con 32.634.904.896 parametros totales (aproximadamente 30B, con 3B activos por token, de ahi el sufijo A3B) y constituye el componente independiente de generacion de imagenes raster del framework Nemotron-Labs-VisualCreation, conocido como Pixel as Code. El modelo se inicializa a partir de Nemotron 3 Nano (clase `NemotronHForCausalLM`) y genera rejillas discretas de tokens visuales que posteriormente se reconstruyen en pixeles mediante un tokenizador de imagenes asociado.

La relevancia tecnica del modelo reside en su enfoque: en lugar de difusion, emplea generacion autorregresiva sobre un vocabulario visual de 196.560 entradas, lo que permite generar imagenes a cualquier resolucion multiplo de 16 (por ejemplo, 1024x1024 o 1184x880). El tokenizador asociado, Nemotron-Labs-Image-Tokenizer (`l24sq_vit`) de 642M de parametros, decodifica hasta 10,93 veces mas rapido que Emu3.5 IBQ segun la model card.

Esta ficha corresponde a la version cuantizada en GGUF publicada por prithivMLmods, que facilita la inferencia en llama.cpp y entornos compatibles, incluyendo una variante MXFP4_MOE optimizada para hardware NVIDIA Blackwell. La distribucion se realiza bajo la NVIDIA License, de caracter no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con mezcla de expertos (MoE), inicializado desde Nemotron 3 Nano (`NemotronHForCausalLM`) |
| Parametros totales | 32.634.904.896 (aproximadamente 30B) |
| Parametros activos | 3B (aproximadamente, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4_MOE (19,1 GB), Q4_K_M (25,4 GB), Q8_0 (34,7 GB); pesos originales en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-license (no comercial) |
| Formato de pesos | GGUF (esta version); safetensors/bfloat16 en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con arquitectura de mezcla de expertos, con 30B parametros totales y 3B activos por token. Se inicializa desde Nemotron 3 Nano y se entrena mediante una fase de mid-training progresivo seguida de Group Relative Policy Optimization (GRPO), una tecnica de optimizacion por refuerzo. La generacion de imagenes se realiza emitiendo tokens visuales discretos de un vocabulario de 196.560 entradas, que se reconstruyen a pixeles con el tokenizador Nemotron-Labs-Image-Tokenizer (`l24sq_vit`, 642M parametros). Este tokenizador alcanza una latencia de decodificacion hasta 10,93 veces menor que Emu3.5 IBQ.

El modelo forma parte del framework Nemotron-Labs-VisualCreation (Pixel as Code) y funciona como su componente de generacion de imagenes raster independiente. La generacion admite cualquier resolucion multiplo de 16. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset en la informacion proporcionada.

## Capacidades

- Generacion de imagenes texto-a-imagen de forma autorregresiva mediante tokens visuales discretos.
- Generacion a resoluciones arbitrarias multiplo de 16 (por ejemplo, 1024x1024, 1184x880).
- Renderizado de texto en imagen de alta fidelidad (LongTextBench 97,98 segun la model card).
- Generacion de imagenes con composicion compleja y multiples objetos (GenEval 92,86).
- Soporte de instrucciones de imagen largas y detalladas (UniGenBench++ long 94,25).
- Generacion orientada a casos de negocio y diseno (BizGenEval 86,0).
- Capacidad de razonamiento visual en la generacion (WISE Verified 91,50).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles; no se documentan otros idiomas.
- Capacidades especiales: decodificacion acelerada mediante el tokenizador `l24sq_vit`; variante MXFP4_MOE con aceleracion FP4 en hardware Blackwell.

## Casos de uso

- Generacion de ilustraciones y arte conceptual: el modelo produce imagenes a resoluciones flexibles multiplo de 16, lo que permite adaptar la salida a formatos de impresion o web sin reescalado forzado.
- Creacion de material grafico con texto integrado: su rendimiento en LongTextBench (97,98) lo hace adecuado para carteles, banners y mockups donde el texto debe ser legible y correcto.
- Prototipado rapido de interfaces y diseno de producto: la generacion condicionada por prompts detallados permite iterar sobre conceptos visuales en pipelines de diseno.
- Generacion de imagenes para publicidad y marketing: la evaluacion BizGenEval (86,0) respalda su uso en escenarios de negocio con requisitos de composicion y marca.
- Investigacion en generacion autorregresiva de imagenes: sirve como referencia para estudiar alternativas a los modelos de difusion y comparar estrategias de tokenizacion visual.
- Despliegue en entornos con GPU Blackwell: la variante MXFP4_MOE (19,1 GB) aprovecha los Tensor Cores FP4 para reducir latencia y huella de memoria en produccion.
- Integracion en pipelines locales con llama.cpp: las cuantizaciones Q4_K_M y Q8_0 permiten ejecutar el modelo fuera de la nube en estaciones de trabajo con suficiente VRAM.

## Benchmarks y rendimiento

Resultados reportados en la model card del modelo base (framework VisualCreation):

| Benchmark | Resultado |
|---|---|
| GenEval | 92,86 |
| UniGenBench++ long | 94,25 |
| LongTextBench | 97,98 |
| WISE Verified | 91,50 |
| BizGenEval | 86,0 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en estos benchmarks, ni datos de latencia o throughput absolutos mas alla de la mejora relativa de decodificacion del tokenizador (hasta 10,93x frente a Emu3.5 IBQ).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,1 GB con MXFP4_MOE; 25,4 GB con Q4_K_M; 34,7 GB con Q8_0 (mas overhead de contexto y del tokenizador de 642M parametros).
- GPU recomendadas: NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300) para la variante MXFP4_MOE con aceleracion FP4 nativa; GPUs con 24 GB o mas para Q4_K_M; GPUs con 40 GB o mas (A100 40GB, A6000, H100) para Q8_0.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M; la variante MXFP4_MOE requiere hardware Blackwell para aprovechar FP4, aunque puede ejecutarse en otras GPUs con menor ventaja.
- Opciones de despliegue: llama.cpp (formato nativo de esta version), transformers y vLLM (para el modelo base en bfloat16), text-generation-inference segun los tags del repositorio.
- Latencia y throughput estimados: no disponibles de forma absoluta; la model card solo indica una decodificacion hasta 10,93x mas rapida que Emu3.5 IBQ a nivel de tokenizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs-Image-30B-A3B (este) | 30B totales / 3B activos | no disponible | Autorregresivo MoE con tokens visuales | NVIDIA License (no comercial) | GGUF y bfloat16 |
| Emu3.5 IBQ | no disponible | no disponible | Autorregresivo con tokenizador IBQ | no disponible | no disponible |
| Modelos de difusion tipo SDXL / Flux | no disponible en esta ficha | no disponible | Difusion latente | variable | amplia |

La informacion proporcionada solo permite una comparacion parcial: frente a Emu3.5 IBQ, el tokenizador de este modelo decodifica hasta 10,93x mas rapido. No se dispone de datos de parametros, contexto ni licencia de las alternativas en la informacion disponible.

## Limitaciones y advertencias

- Licencia NVIDIA License de caracter no comercial: el uso comercial requiere licencia adicional de NVIDIA.
- Modelo exclusivamente en ingles; los prompts en otros idiomas pueden degradar la calidad.
- Riesgo de alucinacion visual: puede generar texto ilegible, objetos inconsistentes o composiciones incorrectas en prompts ambiguos.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos heredados de los datos de entrenamiento del modelo base.
- Longitud de contexto no documentada, lo que limita la planificacion de prompts largos.
- La generacion a resoluciones muy altas puede aumentar el coste computacional de forma no lineal.
- Requiere el tokenizador Nemotron-Labs-Image-Tokenizer (`l24sq_vit`) para reconstruir pixeles; no es un modelo autonomo sin el.
- La variante MXFP4_MOE esta optimizada para Blackwell; en otras GPUs el rendimiento puede no ser representativo.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Nemotron-Labs-Image-30B-A3B-GGUF
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Licencia NVIDIA: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantizacion: https://huggingface.co/prithivMLmods
