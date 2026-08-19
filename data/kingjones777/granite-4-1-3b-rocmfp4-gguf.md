# kingjones777/Granite-4.1-3B-ROCmFP4-GGUF

## Resumen

El modelo `kingjones777/Granite-4.1-3B-ROCmFP4-GGUF` es una cuantización en formato GGUF del modelo IBM Granite 4.1 3B, optimizada específicamente para la GPU integrada AMD gfx1151 presente en los procesadores Ryzen AI MAX+ 395 (Strix Halo). El autor, kingjones777, ha aplicado un tipo de cuantización experimental denominado ROCmFP4 (tier 102, `COHERENT`) que solo existe en un fork de llama.cpp llamado ROCmFPX, no en la versión oficial. El resultado es un archivo de 1.985 GB, un 5,5 % más pequeño que la cuantización Q4_K_M estándar, con una velocidad de decodificación dentro del ruido estadístico respecto a dicha variante.

Esta ficha resulta relevante para desarrolladores que trabajan con hardware AMD de última generación y necesitan ejecutar modelos de lenguaje locales con el menor uso de memoria posible. Al estar basado en Granite 4.1 3B, un modelo denso de 3,4 mil millones de parámetros con licencia Apache 2.0, la cuantización hereda las capacidades del modelo original (generación de texto, razonamiento básico) y las adapta a un entorno de memoria unificada. No obstante, el autor advierte que no se han realizado pruebas de perplexity, calidad A/B, contexto largo ni tool-calling, por lo que el rendimiento real en tareas complejas no está verificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin MoE ni SSM) |
| Parametros totales | 3.402.836.480 (3,4 B) |
| Parametros activos | No aplica (arquitectura densa) |
| Longitud de contexto | No disponible (no se ha especificado en la información proporcionada) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102) |
| Idiomas soportados | Inglés (según metadatos de HuggingFace) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único de 1.985 GB) |

## Arquitectura y entrenamiento

El modelo base es `ibm-granite/granite-4.1-3b`, un transformer denso de 3,4 mil millones de parámetros desarrollado por IBM. Según la model card de la cuantización, la arquitectura es densa, sin estado SSM ni mezcla de expertos, lo que facilita la cuantización uniforme. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) del modelo original en la información proporcionada.

La cuantización se realizó a partir de un GGUF en BF16 de 6,81 GB, considerado una fuente sin pérdidas, y no a partir de una cuantización de menor precisión. El proceso aplica el tipo `Q4_0_ROCMFP4` a 280 tensores, mantiene `token_embd` en Q6_K y las 81 normas en F32. El autor audita los tipos por tensor en el archivo final, lo que garantiza coherencia interna, pero no se han publicado métricas de calidad como perplexity o comparaciones con el modelo original.

## Capacidades

- Generación de texto en inglés: el modelo base Granite 4.1 3B está diseñado para tareas de lenguaje natural, aunque esta cuantización no ha sido evaluada formalmente en dichas tareas.
- Razonamiento aritmético y factual básico: el autor reporta pruebas puntuales correctas (17×23=391, capital de Japón=Tokyo, días en 2024=366), pero advierte que son pruebas necesarias pero no suficientes.
- Inferencia local en hardware AMD específico: la cuantización está pensada para ejecutarse en la GPU integrada gfx1151 de los procesadores Ryzen AI MAX+ 395, aprovechando la memoria unificada.
- Compatibilidad con llama.cpp: requiere un fork específico (ROCmFPX) que implementa los tipos ROCmFP4; no funciona con llama.cpp estándar.
- No se han verificado capacidades avanzadas como tool-calling, agentes multi-paso, visión o audio en esta cuantización.

## Casos de uso

- Despliegue local en dispositivos con Ryzen AI MAX+ 395: el modelo cabe en 2 GB de memoria, lo que permite ejecutar un asistente de texto en un portátil o mini-PC con Strix Halo sin depender de la nube.
- Prototipado rápido en entornos AMD: al ser un archivo GGUF de 1,985 GB, es adecuado para pruebas de concepto en sistemas con memoria unificada de 128 GB, como el utilizado en las mediciones.
- Generación de texto offline para aplicaciones de productividad: redacción de borradores, resúmenes o respuestas a correos en inglés, siempre que no se requiera alta precisión en tareas complejas.
- Evaluación de la cuantización ROCmFP4: sirve como referencia para desarrolladores que quieran comparar este tipo de cuantización experimental con otras opciones como Q4_K_M en hardware AMD.
- Integración en pipelines de inferencia con llama.cpp: mediante el fork ROCmFPX, se puede integrar en aplicaciones que ya usan llama.cpp, siempre que se compile con el soporte ROCm adecuado.
- Investigación sobre cuantización de baja precisión en GPUs AMD: el modelo proporciona datos medidos de velocidad de decodificación y tamaño que pueden ser útiles para estudios comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta mediciones de velocidad de decodificación y pruebas de correctness básicas en un sistema Ryzen AI MAX+ 395 con 128 GB de memoria unificada y ROCm 7.2.4. Los datos son los siguientes:

| Métrica | Valor |
|---|---|
| Velocidad de decodificación (mediana, tokens/s) | 62,08 (rango: 61,17 – 63,84) |
| Velocidad de decodificación Q4_K_M (mediana, tokens/s) | 59,37 (rango: 58,18 – 61,70) |
| Tamaño del archivo | 1,985 GB |
| Tamaño Q4_K_M | 2,100 GB |
| Prueba aritmética (17×23) | Correcto (391) |
| Prueba factual (capital de Japón) | Correcto (Tokyo) |
| Prueba factual (días en 2024) | Correcto (366) |

El autor indica explícitamente que los rangos de decodificación se solapan, por lo que no se puede afirmar una ventaja de velocidad; la reducción de tamaño es el beneficio real.

## Requisitos de hardware

- Hardware objetivo: GPU integrada AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) con memoria unificada.
- VRAM estimada: no se especifica un valor de VRAM dedicada, pero el archivo ocupa 1,985 GB y el sistema de prueba contaba con 128 GB de memoria unificada.
- GPU recomendadas: exclusivamente AMD gfx1151; no se menciona compatibilidad con otras GPUs AMD o NVIDIA.
- Requisitos de software: ROCm 7.2.4 y un fork de llama.cpp con soporte para tipos ROCmFP4 (repositorio `charlie12345/ROCmFPX`).
- Opciones de despliegue: llama.cpp con el fork ROCmFPX; no es compatible con llama.cpp estándar ni con otras herramientas como Ollama o vLLM sin modificaciones.
- Latencia y throughput: la velocidad de decodificación medida es de aproximadamente 62 tokens/s en el hardware de prueba, pero no se han medido tiempos de prefill ni latencia de primera respuesta.

## Comparativa con modelos similares

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo | Tamaño | Velocidad decode (tokens/s) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Granite-4.1-3B-ROCmFP4-GGUF (este) | 1,985 GB | 62,08 (mediana) | Apache 2.0 | GGUF, requiere fork ROCmFPX |
| Granite-4.1-3B Q4_K_M (estándar) | 2,100 GB | 59,37 (mediana) | Apache 2.0 | GGUF, compatible con llama.cpp estándar |
| Granite-4.1-3B BF16 (modelo base) | 6,81 GB | No medido | Apache 2.0 | Safetensors / GGUF |

La principal diferencia es el tamaño y la compatibilidad: la versión ROCmFP4 es más pequeña pero requiere un fork específico, mientras que Q4_K_M es más universal. No hay datos de calidad comparativa entre ambas.

## Limitaciones y advertencias

- Requiere un fork no oficial de llama.cpp (ROCmFPX); el llama.cpp estándar no cargará este archivo.
- No se han realizado pruebas de perplexity ni comparaciones de calidad A/B con el modelo original o con otras cuantizaciones.
- No se ha probado el comportamiento con contextos largos, tool-calling ni tareas de razonamiento complejo.
- El modelo solo soporta inglés según los metadatos; no se garantiza rendimiento en otros idiomas.
- La cuantización es experimental y el autor no hace afirmaciones de velocidad; el beneficio principal es la reducción de tamaño.
- Las pruebas de correctness son limitadas y no representan una evaluación exhaustiva del modelo.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir el crédito al modelo base según su licencia original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kingjones777/Granite-4.1-3B-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Repositorio del fork ROCmFPX: https://github.com/charlie12345/ROCmFPX
