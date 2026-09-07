# Anbeeld/LFM2.5-1.2B-Instruct-DSpark-GGUF

## Resumen

LFM2.5-1.2B-Instruct-DSpark-GGUF es una cuantización GGUF del modelo borrador (draft model) LFM2.5-1.2B-Instruct-DSpark, desarrollado por Liquid AI como parte de la familia LFM2.5-DSpark. Este modelo no es un modelo de lenguaje autónomo, sino un componente de aceleración para decodificación especulativa: propone bloques de tokens que el modelo objetivo LFM2.5-1.2B-Instruct verifica, lo que permite reducir la latencia de inferencia sin degradar la calidad del texto generado.

La cuantización GGUF ha sido publicada por Anbeeld y está pensada para usarse con BeeLlama.cpp, un fork de llama.cpp con características avanzadas de cuantización. El modelo original en safetensors tiene 295,7 millones de parámetros en BF16 y una arquitectura DSpark con 5 capas de atención completa, cabezas Markov y de confianza, y un tamaño de bloque de 9. En SGLang, la decodificación con este drafter alcanza una aceleración media de 2,10x en H100 y 2,54x en M4 Max, según los benchmarks publicados por Liquid AI.

La relevancia de este modelo radica en que permite ejecutar LFM2.5-1.2B-Instruct de forma más eficiente en entornos de producción y en dispositivos Apple Silicon, manteniendo la salida exacta del modelo objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DSpark draft model con backbone de 5 capas full attention, hidden_size=2048, intermediate_size=6144, GQA (32 heads / 8 KV heads, head_dim=64), SiLU/SwiGLU, Markov head (rank 256) y confidence head |
| Parámetros totales | 295.725.953 (295,7 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (cuantizaciones disponibles en el repo; tipos concretos no especificados) |
| Idiomas soportados | No disponible |
| Licencia | Other (no especificada en la información disponible) |
| Formato de pesos | Safetensors (modelo base) y GGUF (cuantizaciones) |

## Arquitectura y entrenamiento

LFM2.5-1.2B-Instruct-DSpark es un modelo borrador diseñado para decodificación especulativa. Su arquitectura se basa en DSpark, una técnica de Liquid AI que adapta un modelo pequeño para proponer bloques de tokens al modelo objetivo. El backbone consta de 5 capas de atención completa con hidden_size de 2048, intermediate_size de 6144 y atención con consultas agrupadas (GQA) de 32 cabezas de consulta y 8 cabezas de clave/valor, con head_dim de 64. Incluye además una cabeza Markov de rango 256 y una cabeza de confianza, y un tamaño de bloque de 9 tokens. El vocabulario es de 65.536 tokens.

El entrenamiento específico de este drafter no está documentado en la información disponible. La decodificación especulativa es exacta: el modelo objetivo verifica cada token propuesto, por lo que la salida generada es idéntica a la que produciría LFM2.5-1.2B-Instruct por sí solo. No se han proporcionado datos sobre el dataset de entrenamiento ni sobre procesos de ajuste como RLHF o DPO.

## Capacidades

- Aceleración de la inferencia de LFM2.5-1.2B-Instruct mediante decodificación especulativa, con una velocidad media de 2,10x en H100 y 2,54x en M4 Max según los benchmarks publicados.
- Compatibilidad con SGLang (requiere un build con soporte DSpark, PR #31041) y con BeeLlama.cpp, un fork de llama.cpp.
- Ejecución en dispositivos Apple Silicon a través del backend Metal.
- No es un modelo de generación autónoma: no dispone de tool calling, visión, audio ni capacidades de razonamiento independientes. Su función es exclusivamente servir como borrador para el modelo objetivo.

## Casos de uso

- Despliegue de LFM2.5-1.2B-Instruct en producción con SGLang: al adjuntar el drafter al servidor, se reduce la latencia de decodificación aproximadamente un 50 % en H100, lo que permite servir más peticiones por segundo con el mismo hardware.
- Inferencia on-device en Apple Silicon: en un M4 Max, el modelo objetivo acelera de 138 a 350 tokens por segundo de media, lo que hace viable ejecutar asistentes locales en portátiles o Macs de gama alta.
- Reducción de costes en entornos cloud: al mejorar el throughput en GPUs como H100, se puede disminuir el número de instancias necesarias para soportar una carga de trabajo determinada.
- Integración en pipelines de generación de código: en benchmarks como HumanEval y MBPP, la tasa de aceptación es de 5,31 y 5,52 tokens por paso, respectivamente, lo que mantiene la velocidad de generación sin sacrificar calidad.
- Asistentes de razonamiento matemático: en MATH-500, la tasa de aceptación alcanza 6,02 tokens por paso, con un speedup de 2,56x en H100, lo que resulta adecuado para aplicaciones que requieren cadenas de razonamiento largas.
- Prototipado y desarrollo local: gracias a la cuantización GGUF y al soporte de BeeLlama.cpp, se puede probar el modelo en equipos de consumo sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para este drafter, ya que la decodificación especulativa es exacta y la calidad del texto depende del modelo objetivo. Los benchmarks disponibles se centran en la tasa de aceptación y la aceleración de la inferencia.

Tasa de aceptación media por paso de decodificación (1×H100, batch size 1, greedy decoding):

| Benchmark | Tokens aceptados / paso |
|---|---:|
| MATH-500 | 5,78 |
| GSM8K | 4,25 |
| HumanEval | 5,51 |
| MBPP | 5,41 |
| MT-Bench | 3,11 |
| Media | 4,81 |

Aceleración de la inferencia (tokens por segundo, con y sin drafter):

| Dataset | Aceptación (de 10) | Speedup H100 | Speedup M4 Max |
|---|---:|---:|---:|
| MATH500 | 6,02 | 2,56x (668 → 1712 tok/s) | 2,62x (140 → 366 tok/s) |
| HumanEval | 5,31 | 2,26x (664 → 1499 tok/s) | 2,87x (136 → 389 tok/s) |
| MBPP | 5,52 | 2,37x (667 → 1578 tok/s) | 2,74x (137 → 375 tok/s) |
| GSM8K | 4,34 | 1,67x (624 → 1041 tok/s) | 2,73x (140 → 381 tok/s) |
| MT-Bench | 3,90 | 1,66x (657 → 1091 tok/s) | 1,72x (137 → 237 tok/s) |
| Media | 5,02 | 2,10x (656 → 1384 tok/s) | 2,54x (138 → 350 tok/s) |

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,6 GB en BF16 (295,7 M parámetros × 2 bytes). En cuantización GGUF, el peso será menor. El requisito total depende del modelo objetivo LFM2.5-1.2B-Instruct.
- GPU recomendadas: NVIDIA H100 (donde se midieron los speedups más altos) y Apple Silicon M4 Max (backend Metal). Cualquier GPU que pueda alojar el modelo objetivo es compatible.
- En GPUs de consumo: el drafter es pequeño, por lo que cabe en cualquier GPU moderna. El modelo objetivo de 1.2B también cabe en GPUs de consumo con cuantización.
- Opciones de despliegue: SGLang (con soporte DSpark, PR #31041) y BeeLlama.cpp (fork de llama.cpp). También se menciona compatibilidad con el backend Metal de Apple.
- Latencia y throughput: los valores medidos se recogen en la tabla de benchmarks. En H100, el throughput medio pasa de 656 a 1384 tok/s con el drafter; en M4 Max, de 138 a 350 tok/s.

## Comparativa con modelos similares

La comparación más directa es entre la ejecución de LFM2.5-1.2B-Instruct sin drafter y con este drafter, ya que la salida es idéntica y la diferencia está en el rendimiento:

| Configuración | Throughput medio en H100 | Throughput medio en M4 Max |
|---|---:|---:|
| LFM2.5-1.2B-Instruct sin drafter | 656 tok/s | 138 tok/s |
| LFM2.5-1.2B-Instruct con DSpark | 1384 tok/s | 350 tok/s |

No se dispone de información suficiente para comparar con otros drafters de decodificación especulativa. En la familia LFM2.5-DSpark existen también LFM2.5-8B-A1B-DSpark y LFM2.5-2.6B-DSpark, pero no se han proporcionado sus especificaciones ni resultados.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: no debe usarse de forma autónoma para generar texto. Su función es únicamente acelerar la inferencia del modelo objetivo.
- Requiere el modelo objetivo LFM2.5-1.2B-Instruct y un runtime con soporte específico para DSpark (SGLang con el PR #31041 o BeeLlama.cpp).
- La licencia es "other" y no se especifican los términos exactos. Es necesario revisar la licencia antes de cualquier uso comercial.
- Los idiomas soportados no están documentados en la información disponible.
- La aceleración depende de la tasa de aceptación: en benchmarks como MT-Bench, la tasa es de 3,11-3,90 tokens por paso, lo que reduce la ganancia de velocidad en comparación con tareas de código o matemáticas.
- No hay benchmarks de calidad propios; la calidad del texto es la del modelo objetivo, por lo que cualquier limitación de LFM2.5-1.2B-Instruct se aplica igualmente.
- El repositorio no tiene descargas ni likes, lo que sugiere que es una publicación reciente o poco difundida.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Anbeeld/LFM2.5-1.2B-Instruct-DSpark-GGUF
- Modelo original (LiquidAI/LFM2.5-1.2B-Instruct-DSpark): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark
- Modelo objetivo (LiquidAI/LFM2.5-1.2B-Instruct): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Blog de Liquid AI sobre LFM2.5-DSpark: https://www.liquid.ai/blog/lfm2.5-dspark
- PR de SGLang con soporte DSpark: https://github.com/sgl-project/sglang/pull/31041
- BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
