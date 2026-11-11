# richardyoung/Mistral-Small-Instruct-2409-DiM-heretic-GGUF

## Resumen

Mistral-Small-Instruct-2409-DiM-heretic-GGUF es la versión cuantizada en formato GGUF de un modelo derivado de Mistral Small Instruct 2409, publicado por el usuario richardyoung. El modelo base se ha sometido a un proceso de "abliteration" (eliminación de la dirección de rechazo) mediante la técnica Heretic 2.0, que aplica una ablación de la dirección de rechazo por diferencia de medias (DiM) afinada por búsqueda automatizada. El resultado es un modelo que responde a muchas peticiones que el original rechaza.

Este repositorio contiene únicamente los pesos convertidos a GGUF con llama.cpp para su uso en llama.cpp, Ollama y otros motores compatibles, no el modelo completo en safetensors. El modelo subyacente tiene 22.247.282.688 parámetros (aproximadamente 22,2 mil millones) y la licencia declarada es MRL (Mistral Research License), heredada del modelo original.

Su relevancia es fundamentalmente de investigación: forma parte de un estudio sobre la dificultad creciente de aplicar abliteration a modelos abiertos y sobre cómo medir y defenderse de la eliminación de rechazos. No está pensado como asistente de propósito general y no se han publicado evaluaciones de los archivos cuantizados, solo del modelo en precisión completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Mistral Small Instruct 2409; transformer, según el modelo original) |
| Parámetros totales | 22.247.282.688 (22,2 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M, Q8_0; en preparación: IQ3_M, IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | mrl (Mistral Research License, MRL-0.1) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Mistral Small Instruct 2409, un transformer de aproximadamente 22,2 mil millones de parámetros. Sobre él se aplicó Heretic 2.0, una técnica de abliteration que calcula una dirección de rechazo mediante diferencia de medias (DiM) entre activaciones de peticiones dañinas y peticiones inocuas, y la resta de los pesos. La dirección se selecciona mediante una búsqueda de 100 pruebas con la regla de selección "mínimos rechazos por palabra clave en el conjunto de desarrollo con divergencia KL de primer token ≤ 0,1".

Según la model card, el modelo en precisión completa (bf16) reduce el rechazo del 55,7% al 32,8% (319 de 972 peticiones) sobre un conjunto de 972 peticiones dañinas retenidas, evaluado con el juez WildGuard. La divergencia KL de primer token respecto al original es de 0,099. Los archivos GGUF se generaron con llama.cpp (commit 468fde9) mediante `convert_hf_to_gguf.py --outtype bf16` y `llama-quantize` en CPU; las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una importance matrix calculada sobre la build Q8_0 (calibration_datav3, 128 fragmentos de 512 tokens), mientras que Q6_K y Q8_0 son estáticas. Los archivos cuantizados no fueron evaluados en el artículo, y la cuantización puede alterar el comportamiento de rechazo.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Mistral Small Instruct 2409.
- Instrucciones y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Respuesta a un subconjunto ampliado de peticiones que el modelo original rechaza (reducción del rechazo del 55,7% al 32,8% en el conjunto de evaluación).
- Compatibilidad con llama.cpp, Ollama y endpoints compatibles.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito para esta variante.

## Casos de uso

- Investigación sobre abliteration: servir como material de estudio para medir la eliminación de rechazos, comparar técnicas (DiM frente a otras) y desarrollar defensas frente a la ablación de la dirección de rechazo.
- Evaluación de robustez de salvaguardas: analizar cómo la cuantización GGUF afecta al comportamiento de rechazo respecto al modelo en bf16, usando los distintos tamaños publicados (Q4_K_M y Q8_0).
- Reproducibilidad de experimentos: los archivos incluyen sumas SHA-256 en `SHA256SUMS` y una importance matrix publicada, lo que permite replicar las cuantizaciones y verificar la integridad de los pesos.
- Despliegue local con Ollama: el tag por defecto (`latest`) apunta a Q4_K_M (13,3 GB), lo que permite ejecutar el modelo en estaciones de trabajo con GPU de consumo para pruebas controladas.
- Estudio de la divergencia respecto al original: la KL de primer token (0,099) y las tasas de rechazo permiten cuantificar el coste de la ablación en términos de deriva de distribución.
- Comparación entre generaciones de modelos: el modelo forma parte de un estudio que compara Mistral Small 3.2 con sus predecesores, por lo que sirve como punto de referencia en análisis longitudinales de abliteration.

## Benchmarks y rendimiento

Resultados publicados para el modelo en precisión completa (bf16), no para los archivos GGUF:

| Métrica | Original | Este modelo |
|---|---|---|
| Rechazo en 972 peticiones dañinas retenidas (juez WildGuard) | 55,7% | 32,8% (319/972) |
| Rechazos por palabra clave en las 100 peticiones de ajuste (prueba seleccionada) | no disponible | 69 |
| Divergencia KL de primer token respecto al original (prueba seleccionada) | — | 0,099 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni evaluaciones de los archivos cuantizados.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa 13,3 GB en disco, por lo que requiere aproximadamente 14-16 GB de VRAM para caber completo en GPU con contexto moderado; Q8_0 ocupa 23,6 GB y requiere del orden de 24-26 GB de VRAM.
- GPU recomendadas: para Q8_0, A100 40 GB, H100 o RTX 4090 (24 GB, al límite); para Q4_K_M, RTX 4090, RTX 4080 (16 GB) o RTX 3090.
- En GPU de consumo: Q4_K_M cabe en RTX 4090, RTX 4080 y RTX 3090; en tarjetas de 12 GB o menos sería necesario descargar capas a CPU o usar cuantizaciones menores (IQ3_M, IQ4_XS, aún en preparación).
- Opciones de despliegue: llama.cpp (`llama-cli -hf ...`), Ollama (`ollama run richardyoung/mistral-small-instruct-2409-dim-heretic`), y cualquier motor compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (conjunto propio) | Licencia | Formato |
|---|---|---|---|---|---|
| Mistral-Small-Instruct-2409-DiM-heretic-GGUF (este) | 22,2 B | no disponible | 32,8% | MRL | GGUF |
| mistralai/Mistral-Small-Instruct-2409 (original) | 22,2 B | no disponible | 55,7% | MRL | safetensors |
| richardyoung/Mistral-Small-Instruct-2409-DiM-heretic (bf16) | 22,2 B | no disponible | 32,8% | MRL | safetensors |

No se dispone en la información proporcionada de datos de otros modelos abliterated comparables (por ejemplo, variantes de Qwen, Gemma u Olmo citadas en el artículo) más allá de su mención en el estudio.

## Limitaciones y advertencias

- Modelo de investigación: la model card indica explícitamente que no está pensado como asistente de propósito general y que se publica para estudiar la eliminación de rechazos y las defensas frente a ella.
- Comportamiento de rechazo alterado: responde a muchas peticiones que el original rechaza; esto puede incluir contenido dañino, y el usuario es responsable del uso lícito.
- Cuantización no evaluada: los archivos GGUF no se evaluaron en el artículo y la cuantización puede cambiar el comportamiento de rechazo respecto al bf16.
- Idiomas: solo se declara inglés (`en`); el rendimiento en castellano no está documentado.
- Licencia restrictiva: MRL (Mistral Research License) con las mismas restricciones de uso que el modelo fuente; no es una licencia permisiva para uso comercial general.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; deben asumirse los del modelo base Mistral Small Instruct 2409.
- Contexto: la longitud de contexto no se especifica en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-DiM-heretic-GGUF
- Modelo base en Hugging Face: https://huggingface.co/richardyoung/Mistral-Small-Instruct-2409-DiM-heretic
- Modelo original de Mistral: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia MRL-0.1: https://mistral.ai/licenses/MRL-0.1.md
- Artículo citado (arXiv, enlace pendiente de añadir): "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors", Richard J. Young, 2026.
