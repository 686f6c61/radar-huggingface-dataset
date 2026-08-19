# kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFPX-Q8_0-AGENT-GGUF

## Resumen

Mellum2-12B-A2.5B-Thinking es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por JetBrains, con 12 150 millones de parámetros totales y 2 500 millones de parámetros activos por token. La variante aquí descrita es una cuantización GGUF en formato ROCmFPX de 8 bits, publicada por el usuario kingjones777, específicamente compilada para la GPU integrada AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). El modelo base incorpora un modo de razonamiento explícito mediante bloques de pensamiento (`thinking`), orientado a problemas de varios pasos.

Esta cuantización no es compatible con el `llama.cpp` estándar: requiere un fork con soporte para los tipos ROCmFPX y para la arquitectura Mellum, que aún no está fusionada en el repositorio oficial (PR #23966). El archivo pesa 11,88 GiB y alcanza 74,41 tokens por segundo en la plataforma objetivo. Es una opción relevante para quienes necesiten ejecutar un modelo de razonamiento de 12B en hardware AMD de gama alta con consumo reducido, aunque con restricciones importantes de compatibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con bloques de razonamiento explícito |
| Parametros totales | 12 149 923 072 (12,15 B) |
| Parametros activos | 2 500 000 000 (2,5 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX_AGENT (ftype 115), 8,39 bpw; existen variantes de 4 bits (COHERENT, ftype 102) y 8 bits planas (ftype 111) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (solo compatible con fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Mellum2-12B-A2.5B-Thinking emplea una arquitectura MoE con 12 150 millones de parámetros totales y 2 500 millones activos por token, lo que permite un coste de inferencia reducido en comparación con un modelo denso del mismo tamaño. Incorpora bloques de razonamiento explícito (`thinking`) que generan una cadena de pensamiento antes de producir la respuesta final, similar a otros modelos de razonamiento recientes. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la documentación consultada.

La cuantización ROCmFPX es una modificación del formato GGUF que utiliza tipos de cuantización empaquetados específicos para hardware AMD (gfx1151). La variante AGENT mantiene más tensores en Q8_0 real en lugar del tipo empaquetado de 8 bits, lo que en modelos con cabezal MTP (multi-token prediction) mejora la tasa de aceptación del draft, pero Mellum2 no tiene cabezal MTP, por lo que la diferencia de rendimiento entre las dos variantes de 8 bits es marginal (74,41 frente a 75,72 tok/s).

## Capacidades

- Generación de texto y razonamiento multi-paso con cadena de pensamiento explícita mediante bloques `thinking`.
- Generación y completado de código (etiquetado como `code` y `code-completion`).
- Soporte de agentes: el nombre de la variante (AGENT) sugiere optimización para flujos de agente, aunque no se ha evaluado formalmente el tool calling en esta cuantización.
- Multilingüe: solo se declara inglés como idioma soportado.
- Sin capacidades de visión ni audio.

## Casos de uso

- Razonamiento matemático y lógico: el modelo puede resolver problemas aritméticos y de lógica de varios pasos gracias a su modo de pensamiento explícito, como se comprueba en las pruebas de corrección (17×23=391, días en 2024=366).
- Asistente de programación en entornos AMD: con 2,5B de parámetros activos y 8 bits de cuantización, puede ejecutarse en un Ryzen AI MAX+ 395 para completado de código en el editor, con una latencia de unos 13 ms por token.
- Prototipado de agentes conversacionales: su formato AGENT y su licencia Apache 2.0 permiten integrarlo en pipelines de agentes sin restricciones comerciales, aunque conviene validar el tool calling antes de producción.
- Educación y tutoría: su capacidad de razonamiento explícito permite mostrar el proceso de resolución de problemas, útil para explicar pasos intermedios en entornos educativos.
- Investigación en eficiencia de inferencia: al ser una cuantización ROCmFPX, sirve como banco de pruebas para comparar el rendimiento de tipos de cuantización alternativos en hardware AMD.
- Despliegue en entornos con restricción de VRAM: con 11,88 GiB, cabe en GPUs de 16 GB, lo que permite ejecutar un modelo de 12B en hardware de consumo sin necesidad de servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye pruebas de corrección sobre hechos memorizados (17×23, capital de Japón, días en 2024) y mediciones de velocidad de decodificación en una plataforma concreta:

| Variante | ftype | Tamano | bpw | Decodificacion (mediana) |
|---|---|---|---|---|
| 4-bit COHERENT | 102 | 6,49 GiB | 4,59 | 104,99 tok/s |
| 8-bit AGENT | 115 | 11,88 GiB | 8,39 | 74,41 tok/s |
| 8-bit plain | 111 | 11,70 GiB | 8,27 | 75,72 tok/s |

Mediciones realizadas en Ryzen AI MAX+ 395 (gfx1151, ROCm 7.2.4), mediana de 3 ejecuciones con warm-up descartado. No se realizaron pruebas de perplexity, calidad A/B contra el modelo original, contexto largo ni tool calling.

## Requisitos de hardware

- VRAM estimada: 11,88 GiB para el archivo GGUF, más overhead de contexto; se recomienda al menos 16 GB de VRAM o RAM unificada.
- GPU recomendada: AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo) con ROCm 7.2.4; no compatible con GPUs NVIDIA ni con GPUs AMD de otras generaciones sin adaptación.
- Cabe en hardware de consumo: sí, en APUs AMD Strix Halo con 32 GB o más de memoria unificada.
- Opciones de despliegue: exclusivamente mediante el fork `charlie12345/ROCmFPX` de llama.cpp; no funciona con llama.cpp estándar, Ollama, vLLM ni TGI sin modificaciones.
- Latencia y throughput: 74,41 tok/s de decodificación (mediana) en la plataforma de referencia, lo que equivale a unos 13,4 ms por token.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mellum2-12B-A2.5B-Thinking (este) | 12,15 B | 2,5 B | no disponible | Apache 2.0 | GGUF ROCmFPX (solo AMD) |
| Qwen3-4B (MoE) | 4 B | 0,6 B | 32k | Apache 2.0 | GGUF estándar, multiplataforma |
| DeepSeek-R1-Distill-Qwen-7B | 7 B | 7 B (denso) | 32k | MIT | GGUF estándar, multiplataforma |

No se dispone de datos de rendimiento comparativos entre estos modelos, ya que no se han publicado benchmarks para Mellum2. La principal diferencia práctica es la compatibilidad: las alternativas funcionan con llama.cpp estándar y en cualquier hardware, mientras que esta cuantización está limitada a AMD gfx1151 con un fork específico.

## Limitaciones y advertencias

- Incompatibilidad total con llama.cpp estándar: el archivo reporta `invalid ggml type 103` y la arquitectura Mellum no está fusionada en upstream (PR #23966). Solo funciona con el fork ROCmFPX.
- Sin evaluación de calidad: no se ha medido perplexity, ni calidad frente al modelo original, ni rendimiento en tareas de tool calling o contexto largo.
- Riesgo de alucinación: no evaluado; las pruebas de corrección solo cubren hechos memorizados y no garantizan fiabilidad en tareas abiertas.
- Presupuesto de tokens en modo thinking: con un presupuesto pequeño (p. ej., 1024 tokens), el modelo puede agotar el contexto dentro de los bloques `thinking` y devolver `content` vacío, lo que puede interpretarse erróneamente como un fallo del modelo.
- Idioma: solo inglés declarado; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero la cuantización depende de un fork no oficial de llama.cpp, lo que añade riesgo de mantenimiento.
- Sin soporte de la comunidad: el autor reporta 0 descargas y 0 likes en el momento de la publicación, lo que indica un uso muy limitado y poca validación externa.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFPX-Q8_0-AGENT-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking
- Variante 4-bit: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFP4-GGUF
- Variante 8-bit plain: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFPX-Q8_0-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- PR de integración de Mellum en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/23966
- Repositorio de evaluación y conversión GGUF: https://github.com/altibola/Mellum2-12B-A2.5B-Instruct-GGUF
- Ficha en slm.expert: https://slm.expert/models/mellum2-12b-a2-5b-thinking/
- Receta de despliegue con vLLM: https://github.com/vraoresearch/vllm-recipes/blob/main/models/JetBrains/Mellum2-12B-A2.5B-Thinking.yaml
