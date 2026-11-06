# Harsha001/Clover-35B-A3B-Preview-ROCmFPX

## Resumen

Clover-35B-A3B-Preview es un modelo de lenguaje de difusión por bloques (block diffusion) desarrollado por DiffuSpace, con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token gracias a una arquitectura de mezcla de expertos (MoE) con 256 expertos, 8 activos por token y un experto compartido. Parte de Qwen3.6-35B-A3B, es exclusivamente de texto y ofrece una ventana de contexto de 128K tokens.

El repositorio analizado, Harsha001/Clover-35B-A3B-Preview-ROCmFPX, no es el modelo original sino una cuantización GGUF en formatos ROCmFPX, un fork de llama.cpp orientado a GPUs AMD (Vulkan y HIP/ROCm) con tipos de peso de baja precisión. Incluye cuatro ficheros: dos de 8 y 6 bits y dos de 4 bits optimizados para velocidad en hardware Strix Halo.

La relevancia de esta ficha es doble: por un lado documenta un modelo de difusión MoE poco habitual en el ecosistema abierto; por otro, advierte de que estas cuantizaciones requieren un fork específico de llama.cpp (compilado a partir del 29 de octubre de 2026, commit `642acd395`) y de que no han sido probadas en hardware AMD real, lo que las hace inadecuadas para producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con difusión por bloques (block diffusion); 256 expertos, 8 activos por token, 1 experto compartido |
| Parámetros totales | 34.661.381.759 (~34,7B) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 128K tokens |
| Tipos de cuantización | Q8_0_ROCMFPX (8 bits), Q6_K_ROCMFPX (6 bits, pesos Q6_0_ROCMFPX), Q4_0_ROCMFP4_STRIX_O8 (4 bits con embeddings a 8 bits), Q4_0_ROCMFP4_FAST (4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variantes ROCmFPX/ROCmFP4) |
| Modelo base | Diffuspace/Clover-35B-A3B-Preview (derivado de Qwen3.6-35B-A3B) |
| Tamaño del repo | 101,8 GB |
| Modalidad | Solo texto |

## Arquitectura y entrenamiento

Clover emplea una arquitectura de difusión por bloques sobre un transformer de mezcla de expertos: en lugar de generar token a token de forma estrictamente autorregresiva, el modelo puede denoizar bloques de tokens. La capa MoE cuenta con 256 expertos, de los cuales 8 se activan por token más un experto compartido, lo que mantiene el coste de inferencia cercano al de un modelo de ~3B pese a los ~34,7B de parámetros totales. El modelo parte de Qwen3.6-35B-A3B y es exclusivamente de texto, con 128K de contexto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá del propio esquema de difusión por bloques. Las cuantizaciones ROCmFPX añaden escalas por tensor: cada matriz de pesos se multiplica por una potencia de dos antes de cuantizar y se guarda la inversa como `<nombre>.scale`, que el fork vuelve a aplicar tras el producto matricial para evitar que los pesos pequeños queden atrapados en la escala de bloque mínima. La matriz de embeddings usa un tipo estándar de llama.cpp (Q8_0 en los ficheros de 8 bits y STRIX_O8, Q6_K en el de 6 bits, ROCmFP4 en el FAST).

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno.
- Razonamiento matemático: en la prueba GSM8K del autor, el modelo BF16 acierta 97 de 100 preguntas (192 de 200 en la ampliación) con decodificación greedy y modo thinking desactivado.
- Modo thinking conmutable (`enable_thinking`), empleado en las pruebas con thinking desactivado.
- Generación por difusión por bloques, además del modo autorregresivo convencional en `llama-server`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo es solo texto y no se documentan idiomas.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Razonamiento matemático y resolución de problemas verbales: el modelo mantiene un rendimiento estable en GSM8K incluso tras cuantización a 4 bits (97-98 de 100 en las pruebas del autor), por lo que sirve para asistentes de cálculo y verificación de resultados en entornos con recursos limitados.
- Despliegue en GPUs AMD de gama alta con ROCm: los ficheros ROCmFPX están pensados para Vulkan y HIP/ROCm, de modo que permiten ejecutar un MoE de ~35B en hardware AMD donde las cuantizaciones estándar de llama.cpp no aprovechan los tipos de baja precisión del fork.
- Prototipado en equipos Strix Halo: la receta Q4_0_ROCMFP4_STRIX_O8 (18,8 GB, embeddings a 8 bits) está diseñada específicamente para este hardware, lo que facilita probar el modelo en un equipo integrado sin GPU dedicada de gran VRAM.
- Investigación sobre modelos de difusión: al ser un modelo de difusión por bloques con backend SGLang y llama.cpp propios, resulta útil para experimentar con decodificación no autorregresiva y comparar su comportamiento frente a transformers convencionales.
- Evaluación de cuantizaciones de baja precisión: el repositorio publica métricas de divergencia KL, coincidencia de token superior y perplejidad frente a BF16, lo que permite estudiar el impacto de tipos ROCmFP4/ROCmFPX en la calidad del modelo.
- Generación de texto en CPU con el fichero de 8 bits: según las pruebas del autor, Q8_0_ROCMFPX alcanza 17,3 tok/s de generación y 90,3 tok/s de prompt en una CPU ARM de 20 núcleos, suficiente para tareas por lotes sin GPU.
- Conversación general de bajo coste: con ~3B parámetros activos, el coste por token es reducido frente a un modelo denso de 35B, lo que lo hace apto para chatbots y asistentes de texto donde la latencia importa más que la profundidad de razonamiento.

## Benchmarks y rendimiento

Calidad de cuantización frente a BF16 (llama.cpp `llama-perplexity --kl-divergence`, 40 fragmentos de 512 tokens de wikitext-2, en CPU):

| Fichero | Tamaño | KL a BF16 | Mismo token superior | PPL |
|---|---:|---:|---:|---:|
| Q8_0_ROCMFPX | 35,8 GB | 0,0622 | 89,3% | 9,49 |
| Q6_K_ROCMFPX | 28,7 GB | 0,0652 | 88,9% | 9,36 |
| Q4_0_ROCMFP4_STRIX_O8 | 18,8 GB | 0,1848 | 80,9% | 9,92 |
| Q4_0_ROCMFP4_FAST | 18,5 GB | 0,1865 | 80,4% | 9,69 |
| BF16 (referencia) | — | 0,000000 | 99,99% | 9,45 |

Comparación con ficheros estándar de llama.cpp del mismo modelo:

| Fichero estándar | Tamaño | KL a BF16 | Mismo token superior | PPL |
|---|---:|---:|---:|---:|
| Q8_0 | 36,9 GB | 0,0539 | 89,7% | 9,42 |
| Q6_K | 28,5 GB | 0,0727 | 88,0% | 9,67 |
| Q4_K_M | 21,2 GB | 0,1191 | 84,3% | 9,54 |

GSM8K (primeras 100 preguntas, thinking desactivado, greedy, máximo 1024 tokens):

| Fichero | Aciertos (de 100) |
|---|---:|
| BF16 | 97 |
| Q4_K_M estándar | 97 |
| Q8_0_ROCMFPX | 99 |
| Q4_0_ROCMFP4_STRIX_O8 | 97 |
| Q4_0_ROCMFP4_FAST | 98 |

En la ampliación a 200 preguntas: BF16 192, Q4_K_M estándar 190, Q8_0_ROCMFPX 195. El fichero de 6 bits acertó 38 de sus primeras 39 preguntas antes de detener la prueba por lentitud en CPU.

Velocidad en CPU (ARM, DGX Spark, 20 núcleos; `llama-bench`, prompt de 512 tokens, 128 generados, 20 hilos):

| Fichero | Prompt (tok/s) | Generación (tok/s) |
|---|---:|---:|
| Q4_K_M estándar | 99,8 | 22,8 |
| Q8_0_ROCMFPX | 90,3 | 17,3 |
| Q6_K_ROCMFPX | 2,8 | 0,8 |
| Q4_0_ROCMFP4_STRIX_O8 | 21,9 | 2,2 |
| Q4_0_ROCMFP4_FAST | 21,4 | 2,2 |

No hay cifras de velocidad en GPU AMD. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada según fichero: 35,8 GB (Q8_0_ROCMFPX), 28,7 GB (Q6_K_ROCMFPX), 18,8 GB (Q4_0_ROCMFP4_STRIX_O8) y 18,5 GB (Q4_0_ROCMFP4_FAST), más overhead de contexto KV; con 128K de contexto el consumo adicional puede ser considerable.
- GPU recomendadas: no disponibles en la información proporcionada; el fork soporta Vulkan y HIP/ROCm en GPUs AMD, y la receta STRIX_O8 apunta a AMD Strix Halo.
- GPU de consumo: los ficheros de 4 bits (18,5-18,8 GB) podrían caber en GPUs de 24 GB de VRAM, pero no se ha validado en hardware AMD ni se documentan pruebas en GPUs de consumo.
- Despliegue: requiere el fork HarshaVardhan3002/ROCmFPX compilado a partir del 29 de octubre de 2026 (commit `642acd395`); llama.cpp estándar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar los ficheros. El modelo original dispone de backends SGLang y llama.cpp en el repositorio de DiffuSpace.
- Latencia y throughput: solo hay cifras en CPU (ver tabla anterior); el fichero de 6 bits es muy lento en CPU (0,8 tok/s de generación) y el autor recomienda usar el de 8 bits o un fichero estándar si se ejecuta en CPU. No hay datos de rendimiento en GPU AMD.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview (ROCmFPX) | ~34,7B | ~3B | 128K | Apache 2.0 | GGUF ROCmFPX, requiere fork |
| Clover-35B-A3B-Preview (original DiffuSpace) | ~34,7B | ~3B | 128K | Apache 2.0 | Pesos originales, backends SGLang y llama.cpp |
| Qwen3.6-35B-A3B (modelo de partida) | ~35B | ~3B | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada. La comparación directa más relevante es entre las cuantizaciones ROCmFPX y los ficheros estándar de llama.cpp del mismo modelo, recogida en la sección de benchmarks: a 6 bits el fichero ROCmFPX supera en fidelidad a un Q6_K estándar del mismo tamaño (KL 0,0652 frente a 0,0727), mientras que a 4 bits el Q4_K_M estándar es claramente más fiel (KL 0,1191 frente a 0,1848-0,1865) a cambio de 2,4-2,7 GB más.

## Limitaciones y advertencias

- Los ficheros no han sido probados en hardware AMD; todas las mediciones del autor se hicieron en CPU ARM, por lo que el rendimiento real en GPU ROCm es desconocido.
- Requieren un fork específico de llama.cpp (HarshaVardhan3002/ROCmFPX, commit `642acd395` o posterior); llama.cpp estándar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargarlos.
- A 4 bits, los ficheros ROCmFP4 son menos fieles a BF16 que un Q4_K_M estándar (KL 0,1848-0,1865 frente a 0,1191); el propio autor recomienda el Q4_K_M estándar cuando prima la calidad.
- Todos los ficheros cuantizados de este modelo se alejan más de BF16 que el mismo tipo de cuantización en otros modelos basados en Qwen3.6 (por ejemplo, un Q8_0 estándar tiene KL 0,054 aquí frente a 0,008 en Groot-19B-A3B), según el autor por características del modelo y no por ruido de la prueba.
- El fichero de 6 bits es extremadamente lento en CPU (0,8 tok/s de generación), lo que lo descarta para ese entorno.
- No se documentan idiomas soportados ni sesgos conocidos; el modelo es solo texto y no cubre visión ni audio.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, requiere verificación en producción.
- Licencia Apache 2.0: permite uso comercial, pero el autor no garantiza el funcionamiento de estas cuantizaciones y no son una release oficial de Clover.
- Con 128K de contexto, el consumo de memoria para la caché KV puede superar ampliamente el tamaño del fichero de pesos, especialmente en las variantes de 8 bits.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Clover-35B-A3B-Preview-ROCmFPX
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Fork ROCmFPX (HarshaVardhan3002): https://github.com/HarshaVardhan3002/ROCmFPX
- ROCmFPX (charlie12345): https://github.com/charlie12345/ROCmFPX
- Código oficial de Clover (SGLang y llama.cpp): https://github.com/DiffuSpace/Clover-35B-A3B-Preview
