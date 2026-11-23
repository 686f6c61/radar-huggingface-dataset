# abuelos84/Spark-X2.6-4B-DSpark-Q8_0

## Resumen

Spark-X2.6-4B-DSpark-Q8_0 es la cuantización Q8_0 del modelo borrador (draft model) de decodificación especulativa DSpark, perteneciente a la familia Spark-X2.6 desarrollada por el equipo SparkLLM. No es un modelo conversacional autónomo: su función es proponer tokens de forma anticipada para acelerar la generación del modelo objetivo Spark-X2.6-4B mediante decodificación especulativa, verificando el modelo grande las propuestas en paralelo.

El modelo borrador tiene 624 millones de parámetros (624.416.001 según los pesos en safetensors) y una arquitectura compacta de 5 capas con atención de ventana deslizante (SWA) de 512 tokens, tamaño oculto de 2560 y capacidad de proponer hasta 7 tokens por pasada de drafting. Esta cuantización Q8_0, publicada por el usuario abuelos84 sobre el GGUF BF16 original de XHToken, reduce el peso del borrador manteniendo una precisión cercana a la original, con un repositorio de 0,7 GB.

Su relevancia es práctica: la decodificación especulativa es una de las técnicas más eficaces para aumentar el throughput en inferencia local, y este borrador está diseñado específicamente para el modelo objetivo Spark-X2.6-4B, con el que consigue aceleraciones medias de entre 1,62× y 2,50× según hardware y cuantización del objetivo. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador para decodificación especulativa, 5 capas con atención de ventana deslizante (SWA) |
| Parametros totales | 624.416.001 (624M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana deslizante de 512 tokens en el borrador; contexto de servicio configurable en el servidor (ejemplo del autor: 8192) |
| Tipos de cuantizacion | Q8_0 (esta ficha); el modelo base se distribuye en BF16 GGUF |
| Idiomas soportados | Inglés (etiqueta `en`; el ejemplo de la model card usa una petición en chino, pero el soporte declarado es inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

DSpark es un modelo borrador de tipo draft-and-verify pensado para decodificación especulativa. Consta de 5 capas con atención de ventana deslizante de 512 tokens y dimensión oculta de 2560. El borrador consume los estados ocultos del modelo objetivo en las capas `[2, 10, 18, 25, 33]` y propone hasta 7 tokens por pasada de drafting; el modelo objetivo (Spark-X2.6-4B) verifica esas propuestas en paralelo, de modo que se reducen los pasos secuenciales de decodificación del modelo grande. El borrador original se distribuye en BF16; esta ficha corresponde a su cuantización Q8_0.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el borrador. La model card documenta los modos de *thinking* del modelo objetivo (High, Low, No thinking) y dos estrategias de muestreo del borrador (probabilístico y greedy), que afectan a la longitud media de aceptación. La integración en llama.cpp upstream está en curso; el autor mantiene un fork (XHToken/llama.cpp) con el tipo de especulación `draft-dspark`.

## Capacidades

- Generación de tokens anticipada (drafting) para decodificación especulativa: hasta 7 tokens propuestos por pasada, verificados en paralelo por el modelo objetivo.
- Aceleración de inferencia del modelo objetivo Spark-X2.6-4B, tanto con pesos BF16 como con cuantizaciones (Q4_K_M en GPU NVIDIA, INT4 en Apple Silicon).
- Funcionamiento con dos estrategias de muestreo del borrador: probabilística y greedy (argmax).
- Compatibilidad con los modos de razonamiento del objetivo (High, Low, No thinking), con distintos ratios de aceptación por modo.
- Servicio mediante API compatible con OpenAI a través de `llama-server` del fork de llama.cpp.
- No es un modelo conversacional por sí mismo: no debe usarse solo, sino siempre emparejado con su modelo objetivo.

## Casos de uso

- Aceleración de inferencia local en GPU de consumo: emparejado con Spark-X2.6-4B en una RTX 4090 con objetivo Q4_K_M, el autor reporta un throughput medio de 447 tok/s frente a 226 tok/s sin DSpark (1,98×), lo que hace viable servir un modelo de 4B a velocidades interactivas en hardware de gama alta de consumo.
- Despliegue en portátiles Apple Silicon: con objetivo INT4 en un M5 Pro, el borrador eleva el throughput medio de 71 a 115 tok/s (1,62×), útil para asistentes locales en entornos sin GPU dedicada.
- Servicio de agentes on-device: la familia Spark-X2.6 está orientada a agentes en dispositivo para tareas reales; el borrador reduce la latencia por turno en flujos multi-paso donde la latencia acumulada es crítica.
- Generación de código interactiva: en HumanEval y MBPP el borrador mantiene ratios de aceptación de 3,87-4,59 tokens y aceleraciones de 1,56×-2,41× según hardware, adecuado para asistentes de código locales con requisitos de baja latencia.
- Razonamiento matemático con modo thinking: en AIME25, GSM8K y MATH500 se observan las mayores longitudes de aceptación (hasta 5,18 en MATH500 con modo No thinking y muestreo probabilístico), por lo que es el escenario donde más se aprovecha la especulación.
- Evaluación e investigación de decodificación especulativa: el modelo sirve como referencia reproducible para medir longitud media de aceptación y speedup con distintas temperaturas, modos de thinking y estrategias de muestreo del borrador.
- Backend compatible con OpenAI para prototipos: el fork de llama.cpp expone `/v1/chat/completions`, lo que permite integrar el par objetivo+borrador en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

Longitud media de aceptación (draft de 7 tokens, salida máxima de 4096 tokens; la longitud incluye un token adicional del objetivo, máximo 8):

| Dataset | T=1, High, Prob. | T=1, Low, Prob. | T=1, No thinking, Prob. | T=0, High, Greedy |
|---|---:|---:|---:|---:|
| AIME25 | 4,1833 | 4,0749 | 4,8251 | 4,6493 |
| GSM8K | 4,4056 | 4,3266 | 4,9514 | 4,4845 |
| MATH500 | 4,5942 | 4,6721 | 5,1758 | 5,0335 |
| HumanEval | 3,8743 | 4,1370 | 4,5859 | 4,4330 |
| MBPP | 3,8671 | 4,0179 | 4,3935 | 4,5525 |
| Arena-Hard-v2 | 3,2172 | 3,1772 | 3,0499 | 4,1601 |
| **Media** | **4,0236** | **4,0676** | **4,4969** | **4,5522** |

Throughput con y sin DSpark (llama.cpp en RTX 4090 y MLX en Apple M5 Pro; objetivo BF16 o cuantizado):

| Dataset | BF16 · RTX 4090 | BF16 · M5 Pro | Q4_K_M · RTX 4090 | INT4 · M5 Pro |
|---|---|---|---|---|
| AIME25 | 2,22× (95 → 210 tok/s) | 2,62× (31 → 80 tok/s) | 2,00× (226 → 451 tok/s) | 1,69× (71 → 119 tok/s) |
| GSM8K | 2,49× (95 → 236 tok/s) | 2,57× (31 → 79 tok/s) | 2,35× (226 → 532 tok/s) | 1,66× (71 → 118 tok/s) |
| MATH500 | 2,51× (95 → 239 tok/s) | 2,94× (31 → 90 tok/s) | 2,33× (226 → 527 tok/s) | 1,89× (71 → 135 tok/s) |
| HumanEval | 2,06× (95 → 196 tok/s) | 2,41× (31 → 74 tok/s) | 1,72× (226 → 389 tok/s) | 1,56× (71 → 110 tok/s) |
| MBPP | 1,88× (95 → 178 tok/s) | 2,49× (31 → 77 tok/s) | 1,85× (227 → 420 tok/s) | 1,61× (71 → 115 tok/s) |
| Arena-Hard-v2 | 1,70× (94 → 160 tok/s) | 2,00× (31 → 61 tok/s) | 1,62× (225 → 365 tok/s) | 1,30× (71 → 92 tok/s) |
| **Media** | **2,14× (95 → 203 tok/s)** | **2,50× (31 → 77 tok/s)** | **1,98× (226 → 447 tok/s)** | **1,62× (71 → 115 tok/s)** |

No se han publicado en la información disponible resultados de benchmarks de calidad del modelo objetivo (MMLU, HumanEval u otros) atribuibles a este borrador; las cifras anteriores miden aceptación y velocidad, no calidad de las respuestas.

## Requisitos de hardware

- VRAM del borrador en Q8_0: aproximadamente 0,7 GB (tamaño del repositorio); el borrador BF16 original ocupa en torno a 1,2-1,3 GB. Debe sumarse la memoria del modelo objetivo.
- Objetivo BF16 (4B): en torno a 8-9 GB de pesos, más caché KV; requiere GPU de 16 GB o superior (RTX 4090, A100 40 GB, H100).
- Objetivo Q4_K_M: aproximadamente 2,5-3 GB, por lo que el par objetivo+borrador cabe holgadamente en GPUs de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090).
- Apple Silicon: el autor reporta funcionamiento en M5 Pro con objetivo INT4 mediante MLX; el borrador Q8_0 está en formato GGUF, por lo que su uso con MLX requiere el borrador en el formato correspondiente.
- Despliegue: fork XHToken/llama.cpp (`llama-server`) con `--spec-type draft-dspark`, `--spec-draft-sampling greedy`, `--spec-draft-n-max 7`, `--spec-draft-p-min 0`; la integración en llama.cpp upstream está en curso. El ejemplo del autor usa `-ngl 999 -ngld 999`, caché KV en f16 y flash attention activada.
- Throughput de referencia (autor): 203 tok/s de media en RTX 4090 con objetivo BF16 y 447 tok/s con objetivo Q4_K_M; 77-115 tok/s en M5 Pro según cuantización del objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | Contexto del borrador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-DSpark (esta ficha, Q8_0) | 624M | Borrador especulativo para Spark-X2.6-4B | SWA de 512, 7 tokens por pasada | Apache 2.0 | GGUF en Hugging Face; requiere fork de llama.cpp |
| Spark-X2.6-4B-DSpark-GGUF (BF16 original) | 624M | Ídem | Ídem | Apache 2.0 | GGUF en Hugging Face (XHToken) |
| Borradores especulativos genéricos de llama.cpp (p. ej. draft de 0,5-1B) | Variable | Borrador genérico no alineado con un objetivo concreto | Variable | Variable | Integrados en llama.cpp upstream |

No se dispone en la información proporcionada de datos de otros borradores específicos comparables (por ejemplo, EAGLE o Medusa para esta misma familia), por lo que la comparación cuantitativa con alternativas equivalentes queda como no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo Spark-X2.6-4B no genera respuestas útiles; usarlo solo produce texto de baja calidad.
- Dependencia de un fork: la integración en llama.cpp upstream está en curso, por lo que en producción hay que fijar la rama y el commit del fork (`master`, `22c0ae1871b60123c5afc008a78fe9c6fffa2858`) y asumir riesgo de divergencia.
- Idiomas: la model card declara únicamente inglés; el ejemplo con una petición en chino no implica soporte multilingüe verificado.
- Cuantización Q8_0: introduce una pérdida mínima pero no nula frente al BF16 original; no se han publicado métricas de aceptación específicas para esta cuantización del borrador, solo para el BF16.
- La aceleración depende del contenido: el peor caso reportado es Arena-Hard-v2 (1,30×-2,00×) y el mejor los dominios matemáticos y de código; en cargas conversacionales abiertas el beneficio puede ser menor.
- Riesgo de alucinación: la verificación la realiza el modelo objetivo, por lo que la calidad final hereda los sesgos y errores de Spark-X2.6-4B; el borrador no los corrige.
- Sin datos publicados sobre composición del dataset de entrenamiento del borrador, sesgos conocidos ni evaluaciones de seguridad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una cuantización de terceros, no una publicación oficial del equipo SparkLLM; conviene validar la integridad de los pesos antes de usarla en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse también la licencia y condiciones del modelo objetivo con el que se empareja.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/abuelos84/Spark-X2.6-4B-DSpark-Q8_0
- Modelo base (GGUF BF16): https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF
- Modelo objetivo: https://huggingface.co/XHToken/Spark-X2.6-4B-GGUF
- Fork de llama.cpp con soporte DSpark: https://github.com/XHToken/llama.cpp
- Licencia Apache 2.0: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF/blob/main/LICENSE
