# Alptekinege/LS3-300M-A18M-Base

## Resumen

LS3-300M-A18M-Base es un modelo de lenguaje de tipo Mixture of Experts (MoE) ultraesparcido desarrollado por el usuario Alptekinege, publicado en Hugging Face bajo licencia Apache 2.0. Forma parte de la familia LS, y en concreto es el modelo insignia de dicha familia: combina una arquitectura estrecha pero profunda (160 dimensiones ocultas, 24 capas) con 32 expertos de los que se activan los 3 principales por token, lo que da lugar a un modelo de aproximadamente 298 millones de parametros totales pero con solo unos 18 millones activos por token (en torno al 6 %). Esta relacion entre parametros totales y activos es lo que el autor denomina "densidad de inteligencia" y constituye el eje central de su propuesta.

El modelo esta pensado para la generacion de texto en ingles y se ha preentrenado desde cero sobre una mezcla curada de corpus educativos, cientificos, matematicos y de conocimiento general (FineWeb-Edu, Ultra-FineWeb, Cosmopedia, OpenMathInstruct-2, Finemath y datasets educativos de ajibawa-2023, entre otros), completando unos 18.940 millones de tokens en dos fases de entrenamiento. La variante publicada es el checkpoint "Base" tras completar el preentrenamiento, e incluye no solo los pesos en FP32 sino tambien el estado completo del optimizador (AdamW, Muon y el estado del optimizador de la tabla de n-gramas), lo que facilita la continuacion del entrenamiento o la experimentacion.

Su relevancia actual radica en que explora una via poco habitual: modelos MoE extremadamente esparcidos y de tamano muy reducido, con una tabla de n-gramas integrada como componente de modelado, pensados para ser ejecutados y entrenados en hardware modesto. Es un modelo de investigacion, no un asistente conversacional afinado: no dispone de etapa de instruccion ni de RLHF, y su ventana de contexto es de solo 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE esparcido (transformer) + tabla de n-gramas |
| Parametros totales | 298.217.120 |
| Parametros activos | 18.102.048 (top-3 de 32 expertos) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (el repo publica pesos FP32; la tabla de n-gramas se describe como Q4) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint binario propietario (.bin) para "tinylm chat"; no se publican safetensors ni GGUF |

Otras especificaciones declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension oculta | 160 |
| Capas | 24 |
| Cabezas de atencion | 5 |
| Cabezas KV | 1 |
| Dimension FFN | 440 |
| Expertos | 32 |
| Top-k routing | 3 |
| Vocabulario | 4096 (digitos singulares) |
| Optimizador | Muon (2D) y AdamW (resto) |
| Parametros del backbone | 164.462.240 |
| Parametros de la puerta de atencion | 614.400 |
| Parametros de n-gramas | 133.140.480 (Q4) |
| Tamano del repo | 2,5 GB |

## Arquitectura y entrenamiento

La arquitectura combina un backbone transformer con atencion de 5 cabezas y una sola cabeza KV (atencion multi-query), dimension oculta de 160 y 24 capas, con una capa MoE de 32 expertos y enrutamiento top-3. A esto se suma una tabla de n-gramas de aproximadamente 133 millones de parametros (descrita como Q4), que actua como componente adicional de modelado del lenguaje y que cuenta con su propio estado de optimizador ("n-gram table optimizer state"). El modelo utiliza ademas una "puerta de atencion" (attention gate) de 614.400 parametros. El vocabulario es muy reducido (4096 tokens, con digitos singulares), una decision coherente con el objetivo de mantener el modelo compacto.

El preentrenamiento se dividio en dos fases. La fase A (estable) duro 365.004 pasos y consumio 14,951 mil millones de tokens con una tasa de aprendizaje de 1,05e-3 mantenida tras un calentamiento de 1.000 pasos; se ejecuto en 104 horas a 44,5 mil tokens por segundo. La fase B (cooldown o decaimiento) sumo 97.405 pasos y 3,990 mil millones de tokens adicionales, con la tasa de aprendizaje decayendo de 1,05e-3 a 2,1e-5, en 25 horas. En total, 462.409 pasos y 18,94 mil millones de tokens. La mezcla de datos de la fase A incluye FineWeb-Edu (7,2 mil millones de tokens), Ultra-FineWeb (2,4 mil millones), Ultra-FineWeb-L3 (QA, 4 mil millones; multi_style, 2,6 mil millones), Cosmopedia (0,6 mil millones mas 0,2 mil millones de subconjuntos stanford/openstax/khanacademy), OpenMathInstruct-2 (1,5 mil millones), Finemath-4plus (1 mil millones), los tres datasets educativos de ajibawa-2023 (0,8 mil millones en total) y un corpus aritmetico autogenerado de 0,9 mil millones de tokens. La fase B se realizo sobre los splits de entrenamiento de HellaSwag, ARC-Easy, ARC-Challenge, PIQA, OpenBookQA, SciQ, CommonsenseQA y Winogrande.

Una innovacion destacable es el uso de un decaimiento largo en la fase B, que segun el autor elevo la "densidad de inteligencia" (II) de 7,46 a 14,53 y mejoro el margen frente a la linea base de -8,21 a -4,54. No se menciona el uso de RLHF, DPO ni ninguna etapa de ajuste por instrucciones: se trata de un checkpoint puramente de preentrenamiento.

## Capacidades

- Generacion de texto en ingles a partir de un prompt, en modo de completado (modelo base, sin instrucciones).
- Razonamiento basico y conocimiento general, con resultados medibles en HellaSwag, ARC, PIQA y LAMBADA.
- Aritmetica de nivel escolar, reforzada por el corpus aritmetico autogenerado y OpenMathInstruct-2 (ArithMark 38,80).
- Modelado de lenguaje con soporte de tabla de n-gramas integrada en el propio checkpoint.
- Capacidad de continuar el preentrenamiento: el repo incluye pesos FP32 y el estado completo del optimizador (Adam, Muon, estado del optimizador de n-gramas y sidecar).
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible (sin ajuste por instrucciones).
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Integracion prevista con "tinylm chat" segun la model card.

## Casos de uso

- Investigacion sobre MoE ultraesparcidos: el modelo permite estudiar el equilibrio entre parametros totales y activos, la eficacia del enrutamiento top-3 sobre 32 expertos y el impacto de la tabla de n-gramas en la perplejidad, gracias a que se publica el estado completo del optimizador.
- Continuacion del preentrenamiento y ajuste fino: al incluir los estados de Adam, Muon y del optimizador de n-gramas, un investigador puede reanudar el entrenamiento desde el checkpoint sin perder la dinamica de los optimizadores, algo poco habitual en modelos publicados.
- Reproduccion de experimentos de decaimiento de la tasa de aprendizaje: la comparacion entre el decaimiento corto (LS3-Micro-Dense) y el largo (este modelo) esta documentada y permite reproducir el efecto sobre la metrica II.
- Evaluacion comparativa de modelos pequenos: con 298 millones de parametros totales y 18 millones activos, sirve como linea base para benchmarks de eficiencia (HellaSwag, ARC, PIQA, LAMBADA, ArithMark) frente a modelos densos del mismo orden.
- Prototipado de generacion de texto en ingles con recursos limitados: su reducido numero de parametros activos permite experimentar con inferencia en CPU o GPU de gama baja, siempre que se use el runtime compatible con el formato .bin.
- Docencia y formacion: el modelo y su model card detallada (mezcla de datos, fases, hiperparametros) constituyen un caso de estudio completo de un pipeline de preentrenamiento desde cero.
- Experimentacion con tokenizadores de vocabulario reducido (4096 tokens con digitos singulares) y su efecto en tareas aritmeticas y de conocimiento.

## Benchmarks y rendimiento

Resultados publicados por el autor (precision normalizada, salvo LAMBADA):

| Modelo | HellaSwag | ARC-E | ARC-C | PIQA | LAMBADA | ArithMark | II | Densidad de inteligencia |
|---|---|---|---|---|---|---|---|---|
| LS2.5-108M-A17M-Base | 28,24 | 36,66 | 23,21 | 57,40 | **17,89** | 37,00 | 9,89 | 0,231 |
| LS-Micro-Base (11,49 M) | 27,41 | 34,72 | 21,93 | 54,84 | 11,06 | 35,50 | 7,24 | 0,909 |
| LS3-Micro-Base (9,97 M) | 27,31 | 34,76 | 23,29 | 57,34 | 12,87 | 38,90 | 9,64 | **1,290** |
| LS3-Micro-Dense-Base (9,89 M) | 28,53 | 39,27 | 20,31 | 56,58 | 16,15 | **47,50** | 11,99 | 1,212 |
| LS3-300M-A18M-Base (298 M A28 M) | **30,31** | **44,28** | **23,98** | **60,39** | 17,56 | 38,80 | **14,53** | 0,198 |

Notas del autor: el indice II se deriva de la formula del Open SLM Leaderboard y los resultados son reproducibles con la herramienta de benchmark integrada de Cudalm. La densidad de inteligencia se calcula como `II / sqrt(parametros activos * parametros totales)`. No se han publicado resultados de benchmarks frente a modelos de otras familias en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, los pesos en FP32 ocupan aproximadamente 627 MB (archivo `LS3-300M-A18M.bin`), a los que se suman el estado del optimizador y la tabla de n-gramas si se cargan completos; el repo completo ocupa 2,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPU de consumo, aunque el runtime debe soportar el formato .bin de "tinylm chat".
- Cabe en GPU de consumo: si, por el reducido tamano de los pesos (cientos de MB), si bien no se detallan modelos concretos.
- Opciones de despliegue: "tinylm chat" (runtime referenciado por el autor). No se indica soporte de vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos en safetensors ni GGUF.
- Latencia y throughput estimados: no disponibles para inferencia. En entrenamiento, el autor reporta 44,5 mil tokens por segundo en ambas fases.

## Comparativa con modelos similares

La unica comparativa disponible es la que proporciona el propio autor dentro de la familia LS:

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | HellaSwag | ARC-E | PIQA | LAMBADA |
|---|---|---|---|---|---|---|---|---|
| LS3-300M-A18M-Base | 298 M | 18 M | 2048 | Apache 2.0 | 30,31 | 44,28 | 60,39 | 17,56 |
| LS2.5-108M-A17M-Base | 108 M | 17 M | no disponible | no disponible | 28,24 | 36,66 | 57,40 | 17,89 |
| LS3-Micro-Base | 9,97 M | no disponible | no disponible | no disponible | 27,31 | 34,76 | 57,34 | 12,87 |
| LS3-Micro-Dense-Base | 9,89 M | denso | no disponible | no disponible | 28,53 | 39,27 | 56,58 | 16,15 |

No se dispone de comparacion con modelos de otras familias (por ejemplo, modelos densos de ~100-300 M parametros de otros desarrolladores) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni RLHF/DPO: no debe usarse como asistente conversacional sin un ajuste posterior.
- Ventana de contexto muy limitada (2048 tokens), insuficiente para tareas de contexto largo.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Vocabulario muy reducido (4096 tokens), lo que puede penalizar la eficiencia en la codificacion de texto y el rendimiento en tareas fuera del dominio de entrenamiento.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, especialmente al ser un modelo de preentrenamiento de baja capacidad.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre corpus web y educativos, es previsible que herede sesgos de esas fuentes, pero no se aporta analisis.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye en un formato binario propietario (.bin) que requiere el runtime "tinylm chat"; no se ofrecen pesos en safetensors ni GGUF, lo que limita la portabilidad.
- Los resultados de benchmarks son los reportados por el autor y no han sido verificados de forma independiente; los splits de la fase B incluyen conjuntos de evaluacion (HellaSwag, ARC, PIQA, etc.), lo que puede inflar las metricas en esas tareas.
- La model card mezcla en la tabla "298M A28M" con los 18,1 M de parametros activos declarados en las especificaciones; conviene tratar esa cifra con cautela.
- No hay informacion sobre latencia, throughput de inferencia ni despliegue en servidores de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alptekinege/LS3-300M-A18M-Base
- Open SLM Leaderboard (formula del indice II): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset openbmb/Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset openbmb/Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset HuggingFaceTB/cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset ajibawa-2023/Education-College-Students: https://huggingface.co/datasets/ajibawa-2023/Education-College-Students
- Dataset ajibawa-2023/Education-High-School-Students: https://huggingface.co/datasets/ajibawa-2023/Education-High-School-Students
- Dataset ajibawa-2023/Education-Young-Children: https://huggingface.co/datasets/ajibawa-2023/Education-Young-Children
- Repositorio de datos PIQA: https://github.com/ybisk/ybisk.github.io
