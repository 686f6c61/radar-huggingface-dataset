# Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF es una compilación GGUF del modelo DeepSeek-V4.1-Flash-1017, un transformer MoE de gran escala (657.884.565.104 parámetros totales) desarrollado originalmente por DeepSeek y cuantizado por IST-DASLab mediante el método GSQ-RCO. Esta variante, publicada por el usuario Harsha001, aplica además una poda selectiva de expertos (expert pruning) guiada por la métrica REAP para reducir el modelo hasta que quepa en una única máquina AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada, apuntando a un contexto de 64K.

El problema que resuelve es concreto: el modelo completo necesita unos 230 GB incluso en las cuantizaciones estándar más pequeñas, lo que lo hace inviable en hardware de consumo o en estaciones compactas. Estas builds conservan los expertos más utilizados de cada capa (320 o 277 de 384) y dejan la tabla Engram de 110,6 GB en SSD, de modo que solo unos 97 GiB deben residir en memoria de GPU. El resultado es un modelo de razonamiento de gran tamaño ejecutable en una única caja Strix Halo, a costa de una pérdida medible de calidad (perplejidad de 3,40 frente a 2,01 del modelo completo).

Es relevante ahora porque representa un ejercicio temprano de "compresión agresiva para hardware específico": combina poda de expertos, cuantización de bajo bit (1-2 bits) y offloading de tablas de embedding a disco. No obstante, se trata de una *community test release* que aún no se ha ejecutado en el hardware objetivo (Strix Halo) y cuyas pruebas se han hecho en una NVIDIA DGX Spark (GB10, CUDA).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con 384 expertos enrutados por capa; incluye tabla Engram |
| Parámetros totales | 657.884.565.104 (modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 64K (objetivo de diseño de la build) |
| Tipos de cuantización | IQ1_M (expertos) + Q8_0 (atención, router, shared expert, embeddings) + IQ4_NL (tabla Engram); build alternativa IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards por build: 3 de modelo + 1 de Engram) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 384 expertos enrutados por capa, lo que explica su enorme recuento de parámetros totales frente a un número de parámetros activos por token mucho menor (no disponible en la información proporcionada). Incluye además una tabla Engram, un mecanismo de lookup de gran tamaño (110,6 GB en esta build) que se lee bajo demanda desde el SSD y no consume memoria de GPU. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

La innovación técnica de esta ficha reside en el pipeline de compresión aplicado por el autor: (1) los expertos se cuantizan con el método GSQ-RCO de IST-DASLab, (2) se podan los expertos menos utilizados según la puntuación REAP (peso del router multiplicado por el tamaño de salida del experto, promediado sobre los tokens que lo alcanzan), medida sobre el modelo nativo completo con 131.072 tokens de texto y código mezclados, y (3) el resto de componentes (atención, router, shared expert, embeddings) se cuantiza a Q8_0 desde el checkpoint original, recortando también el router y su bias a los expertos conservados. La build de 320 expertos retiene el 97,5 % del peso de enrutamiento; la de 277, el 94,4 %. En la calibración, 47 expertos no se usaron nunca. Las listas de expertos conservados están en el directorio `keep/`. El chat template va embebido (adaptado del release de Unsloth para V4.1).

## Capacidades

- Generación de texto conversacional y razonamiento paso a paso (la model card documenta un 98,0 % en GSM8K con instrucción explícita de razonamiento).
- Razonamiento matemático: resolución de problemas aritméticos de varios pasos (GSM8K).
- Generación y comprensión de código: parte de los datos de calibración y de la evaluación de perplejidad incluyen código fuente.
- Conversación multi-turno mediante chat template embebido.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente; el modelo base es de tipo razonador, pero esta build no detalla su comportamiento agéntico.
- Capacidades multilingües: no disponibles.
- Modo "uncensored": el nombre del repositorio indica una variante sin censura, aunque la model card no detalla el proceso de alineación ni qué restricciones se han eliminado.
- Capacidad especial: tabla Engram con lectura bajo demanda desde SSD, que permite ampliar el conocimiento sin ocupar VRAM.

## Casos de uso

- Razonamiento matemático y resolución de problemas en local: con 98,0 % en GSM8K y decodificación greedy, es adecuado para asistentes de cálculo de varios pasos ejecutados íntegramente en una estación Strix Halo sin conexión a la nube.
- Asistente de programación en estación de trabajo: el modelo maneja código (usado en la calibración) y un contexto de 64K, suficiente para revisar módulos completos o varios ficheros en una sola pasada.
- Prototipado de agentes y pipelines de razonamiento en hardware AMD: al ser un GGUF con soporte en el fork ROCmFPX, permite experimentar con un MoE de gran tamaño en GPUs integradas AMD sin depender de CUDA.
- Investigación en compresión de modelos: sirve como banco de pruebas reproducible para estudiar el impacto de la poda de expertos (320 vs. 277) y de la cuantización de bajo bit sobre la calidad y la velocidad.
- Evaluación de despliegues con offloading de embeddings: la arquitectura Engram en SSD es un caso de estudio para sistemas con memoria unificada limitada que necesitan tablas de embedding grandes.
- Generación de texto sin conexión en entornos con restricciones de privacidad: al ejecutarse en una única máquina local, los datos no salen del equipo, lo que encaja en escenarios de documentación técnica o análisis de textos sensibles.
- Fine-tuning y experimentación con licencia permisiva: la licencia MIT facilita su uso en proyectos comerciales y su modificación, siempre que se respeten las condiciones del modelo base.

## Benchmarks y rendimiento

| Build | GSM8K (primeras 200 preguntas) | Respuestas truncadas | Longitud media de respuesta | Velocidad de prompt (pp512, GB10) |
|---|---|---|---|---|
| IQ1_M-E320 (recomendada) | 196/200 (98,0 %) | 0 | 376 tokens | 162 t/s |
| IQ2_XXS-E277 | 196/200 (98,0 %) | 2 | 463 tokens | 153 t/s |

| Build | Perplejidad (menor es mejor) | Parte en GPU | Engram en SSD |
|---|---|---|---|
| IQ1_M-E320 | 3,40 | 104,5 GB (97,3 GiB) | 110,6 GB |
| IQ2_XXS-E277 | 3,59 | 104,2 GB (97,1 GiB) | 110,6 GB |
| Modelo completo (referencia) | 2,01 | 510 GB | — |

Notas metodológicas: la perplejidad se midió sobre 8 fragmentos de 2048 tokens de texto mixto de Wikipedia en inglés y código fuente, en CPU, con el mismo texto para las tres filas. GSM8K se evaluó con `llama-server`, plantilla de chat embebida, decodificación greedy, hasta 6144 tokens de salida y 4 peticiones en paralelo. Las pruebas se ejecutaron en una NVIDIA DGX Spark (GB10, CUDA), no en Strix Halo; la velocidad de generación (tg128) fue de unos 12,6 t/s, aunque con otros procesos en la máquina, por lo que debe tomarse como cota inferior. La comparación CUDA vs. CPU mostró coincidencia en el token superior del 98,0 % (IQ1_M) y 97,2 % (IQ2_XXS), con divergencia KL media de 0,004 y 0,006. No hay puntuación del modelo completo con el mismo setup para comparar en GSM8K.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 97 GiB para la parte del modelo en GPU (104,5 GB en disco para IQ1_M-E320; 104,2 GB para IQ2_XXS-E277), más 110,6 GB de tabla Engram que permanecen en SSD y se leen bajo demanda.
- Hardware objetivo: una única máquina AMD Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada.
- GPU recomendadas: Strix Halo (objetivo declarado); probado en NVIDIA DGX Spark (GB10, CUDA). No se han publicado pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No en GPUs discretas convencionales por tamaño; sí en sistemas con memoria unificada de 128 GB como Strix Halo.
- Despliegue: requiere un runtime con soporte de DeepSeek-V4.1. El llama.cpp upstream no lo soporta todavía; debe usarse el fork ROCmFPX, que incluye soporte y ajustes de Vulkan para Strix Halo. Compilación indicada: `cmake -B build -DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release`.
- Latencia y throughput: ~162 t/s de prompt (pp512) y ~12,6 t/s de generación (tg128) en GB10, con la salvedad de carga concurrente; no hay cifras para Strix Halo.
- Almacenamiento: cada build ocupa unos 215 GB en disco (3 shards de modelo + 1 de Engram); el repositorio completo pesa 528 GB.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Perplejidad / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (completo) | 657,9 B | no disponible | Perplejidad 2,01 | MIT (según esta ficha) | Pesos nativos MXFP4, ~510 GB |
| DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF (ISTA-DASLab) | 657,9 B | no disponible | No disponible | MIT | GGUF cuantizado GSQ-RCO |
| Esta build (IQ1_M-E320) | 657,9 B (con 320/384 expertos por capa) | 64K (objetivo) | Perplejidad 3,40; GSM8K 98,0 % | MIT | GGUF, ~215 GB por build |
| Esta build (IQ2_XXS-E277) | 657,9 B (con 277/384 expertos por capa) | 64K (objetivo) | Perplejidad 3,59; GSM8K 98,0 % | MIT | GGUF, ~215 GB por build |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría (por ejemplo, otros MoE de más de 500 B parámetros) en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: la perplejidad sube de 2,01 (modelo completo) a 3,40 (IQ1_M-E320) y 3,59 (IQ2_XXS-E277); el autor lo describe como "el precio de caber en 128 GB".
- Estado de lanzamiento: es una primera iteración y una *community test release*; no se ha ejecutado en Strix Halo, solo en CPU y en una NVIDIA GB10 con CUDA.
- Requiere un fork específico de llama.cpp (ROCmFPX); el upstream no soporta DeepSeek-V4.1, lo que limita la portabilidad y el soporte a largo plazo.
- GSM8K es una prueba fácil para un modelo de este tamaño; el 98,0 % demuestra que la poda conserva el razonamiento básico, no que iguale al modelo completo en tareas difíciles.
- La poda de expertos elimina capacidades potencialmente presentes en los expertos descartados (47 expertos nunca se activaron en la calibración, pero el resto podado sí pudo usarse en dominios no representados en el corpus de calibración).
- Idiomas soportados no documentados; la calibración usó texto en inglés y código, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones de veracidad.
- La variante "uncensored" puede carecer de las salvaguardas del modelo original; el autor no detalla el proceso de desalineación ni sus implicaciones.
- Licencia MIT declarada, pero conviene verificar las condiciones del modelo base DeepSeek original antes de uso comercial.
- El tamaño del repositorio (528 GB) y de cada build (~215 GB) imponen requisitos de almacenamiento y ancho de banda considerables.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantización GSQ-RCO de IST-DASLab: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Fork ROCmFPX (runtime con soporte DeepSeek-V4.1 y ajustes Strix Halo): https://github.com/HarshaVardhan3002/ROCmFPX
- Página de votación de próximas cuantizaciones: https://harshavardhan3002.github.io/ROCmFPX/
- Referencias arXiv citadas en los tags: arxiv:2604.18556 y arxiv:2605.00649 (no verificadas en la información disponible)
