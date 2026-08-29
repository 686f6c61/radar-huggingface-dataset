# hamichok/Qwen3.8-27B-NVFP4-RTX5090-LMHead4

## Resumen

El repositorio `hamichok/Qwen3.8-27B-NVFP4-RTX5090-LMHead4` contiene una cuantización NVFP4 (4 bits en coma flotante para hardware Blackwell) del modelo Qwen3.8-27B, optimizada específicamente para ejecutarse en una única GPU RTX 5090 de 32 GB. El autor, hamichok, ha aplicado tres técnicas principales: cuantización del `lm_head` (reduce 1,7 GB), decodificación especulativa DFLASH2 con un modelo borrador también cuantizado en NVFP4, y una caché KV en FP8 con un pool de 175 064 tokens. El resultado es un checkpoint listo para servir con sglang que alcanza hasta ~256 tokens por segundo en generación de código y ~144 t/s en prosa en una sola GPU, con una calidad declarada como equivalente al modelo sin cuantizar en pruebas objetivas.

El modelo base, Qwen3.8-27B, es un transformer denso de 27 000 millones de parámetros con ventana de contexto nativa de 256K tokens, capacidades de razonamiento y visión. Sin embargo, esta versión cuantizada se sirve con la opción `--language-only`, lo que desactiva el encoder de visión y reduce el pool de contexto a 175K tokens para maximizar el rendimiento. El autor reporta que la cuantización NVFP4 mantiene una calidad "equivalente a Q6+" y que la decodificación especulativa DFLASH2 duplica aproximadamente el throughput de decodificación respecto a una ejecución sin ella, con un incremento del 20 % en el contexto útil.

Este repositorio es relevante porque demuestra una receta práctica y reproducible para ejecutar un modelo de 27B con razonamiento extendido y agente multi-turno en una GPU de consumo de gama alta, sin necesidad de compilar kernels ni construir el modelo desde cero. Incluye dos artefactos descargables: el checkpoint principal (~18 GB) y el modelo borrador para decodificación especulativa (~1,8 GB), junto con los comandos exactos de despliegue en sglang nightly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con atención FlashInfer y caché KV en FP8 |
| Parametros totales | 27B (original); 14 982 247 152 en pesos NVFP4 (safetensors) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 256K (base); 175 064 tokens configurados en este despliegue |
| Tipos de cuantizacion | NVFP4 (pesos del modelo y del drafter), FP8 (caché KV) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero esta versión se sirve con `--language-only`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del Qwen3.8-27B original, realizada con NVIDIA ModelOpt y exportada a formato NVFP4, que aprovecha los núcleos FP4 de las GPU Blackwell. La arquitectura subyacente es la del Qwen3.8-27B: un transformer denso con atención de ventana deslizante y full attention, diseñado para razonamiento y tareas de agente. No se ha realizado ningún entrenamiento adicional; la cuantización se aplica sobre los pesos preentrenados, incluido el `lm_head`, que se cuantiza por separado para ahorrar 1,7 GB de VRAM.

La innovación principal de este repositorio es la integración de la decodificación especulativa DFLASH2 con un modelo borrador re-cuantizado a NVFP4 (el original no cargaba en sglang). El drafter tiene aproximadamente 1,8 GB y se ejecuta en paralelo con el modelo principal, aceptando bloques de 6 tokens (configuración medida como óptima). Además, se emplea una caché KV jerárquica con tier en RAM del host (`--hicache-io-backend kernel`), lo que permite reanudar conversaciones de ~100K tokens en aproximadamente 1 segundo en lugar de 20 segundos en frío. El sistema de razonamiento se configura con `xhigh` y límites estrictos de 16 000 tokens de pensamiento y 8 000 de contenido, usando la plantilla de chat `froggeric Qwen-Fixed-Chat-Templates v22.4` para mejorar el comportamiento agéntico.

## Capacidades

- Generación de texto y razonamiento extendido: modo `thinking` con nivel `xhigh`, límite de 16K tokens de pensamiento y 8K de contenido, probado con GPQA Diamond.
- Tool calling y function calling: soportado mediante el parser `qwen3_coder` de sglang, adecuado para agentes que invocan herramientas.
- Razonamiento multi-step y agente: el autor ha validado el modelo con 4 conversaciones de agente simultáneas (conmutación entre ellas) y con frameworks como Hermes y OpenCode.
- Generación de código: alto rendimiento en tareas de programación (HumanEval 56,7 %, MBPP 75,0 %).
- Matemáticas y razonamiento simbólico: GSM8K 96,8 %, MATH-500 95,6 %, AIME 2024 83,3 %.
- Contexto largo: pool de 175K tokens con caché jerárquica en RAM del host, lo que permite conversaciones de hasta ~100K tokens con reanudación rápida.
- Decodificación especulativa DFLASH2: duplica aproximadamente el throughput de decodificación respecto a sin especulación.
- Multilingüismo: no verificado en esta versión; el despliegue usa `--language-only` y no se documentan idiomas concretos.

## Casos de uso

- Asistente de programación en local: el modelo puede integrarse en un IDE o CLI (por ejemplo, OpenCode) para generar código, refactorizar y explicar fragmentos. Su throughput de ~256 t/s en código y la decodificación especulativa lo hacen adecuado para iteraciones rápidas en una estación de trabajo con RTX 5090.
- Agente autónomo multi-herramienta: gracias al soporte de tool calling y al razonamiento `xhigh` con límites estrictos, puede orquestar llamadas a APIs, ejecutar comandos y mantener conversaciones de agente de hasta 4 sesiones simultáneas sin agotar el contexto.
- Atención al cliente con contexto largo: con un pool de 175K tokens y la caché jerárquica en RAM, puede gestionar conversaciones multi-turno extensas (por ejemplo, 100K tokens) reanudando el historial en ~1 segundo, lo que permite mantener el estado del cliente durante toda la interacción.
- Análisis de documentos extensos: el modelo puede procesar documentos de hasta ~175K tokens (por ejemplo, contratos, informes técnicos o libros) y extraer información, resumir o responder preguntas sobre ellos, gracias a su ventana de contexto amplia y su capacidad de razonamiento.
- Tutor de matemáticas y razonamiento: con resultados de 96,8 % en GSM8K y 95,6 % en MATH-500, puede usarse como asistente educativo que explica paso a paso problemas matemáticos, aprovechando el modo `thinking` para mostrar el proceso de razonamiento.
- Despliegue de un endpoint OpenAI-compatible en una sola GPU: el comando de sglang proporcionado expone el modelo como un servidor compatible con OpenAI, permitiendo usarlo como backend para aplicaciones propias (chatbots, herramientas de productividad) sin necesidad de infraestructura multi-GPU.
- Investigación en eficiencia de inferencia: el repositorio sirve como referencia para experimentar con NVFP4, DFLASH2 y caché jerárquica, midiendo throughput, prefill y calidad en hardware Blackwell.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, medidos con `lm-evaluation-harness` sobre el checkpoint cuantizado servido con sglang nightly en una RTX 5090 de 32 GB. Se comparan con los valores publicados por Qwen para el modelo base sin cuantizar (cuando existen).

| Benchmark | Este stack (NVFP4 + DFLASH2) | Qwen publicado |
|---|---|---|
| GPQA Diamond (xhigh thinking) | 84,8 % | 89,2 % |
| GSM8K (5-shot) | 96,8 % | - |
| MATH-500 (math_verify) | 95,6 % | - |
| AIME 2024 | 83,3 % | - |
| HumanEval (pass@1) | 56,7 % | - |
| MBPP (pass@1) | 75,0 % | - |

Rendimiento de decodificación (450 tokens, sin thinking):

| Carga | Single | Paralelo x2 |
|---|---|---|
| Prosa | ~144 t/s | ~261 t/s |
| Código | ~256 t/s | ~451 t/s |

Rendimiento de prefill (TTFT medio de 3 ejecuciones en frío, a través del proxy de admisión):

| Longitud de prompt | TTFT | avg t/s | final 1s t/s |
|---|---|---|---|
| 5k | 0,33 s | ~15,2k | (dominado por overhead) |
| 10k | 0,37 s | ~27,3k | ~26,0k |
| 20k | 0,91 s | ~22,1k | ~10,8k |
| 50k | 4,08 s | ~12,3k | ~7,3k |
| 100k | 11,85 s | ~8,4k | ~5,2k |
| 150k | 23,46 s | ~6,4k | ~4,3k |

## Requisitos de hardware

- GPU recomendada: RTX 5090 de 32 GB (es el hardware de referencia del autor). También podría funcionar en otras GPU Blackwell con 32 GB o más, aunque no está verificado.
- VRAM estimada: el checkpoint principal ocupa ~18 GB en disco y ~18 GB en VRAM; el modelo borrador DFLASH2 ocupa ~1,8 GB adicionales. El pool de KV de 175K tokens con caché FP8 requiere el resto de la VRAM disponible (el autor usa `--mem-fraction-static 0.94`).
- No cabe en GPUs de consumo con menos de 32 GB (por ejemplo, RTX 4090 de 24 GB no tendría suficiente espacio para el pool de contexto completo, aunque podría reducirse el `max-total-tokens`).
- Opciones de despliegue: sglang nightly (imagen `lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1`), con soporte para DFLASH2 y `lm_head` cuantizado. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en este repositorio concreto.
- Latencia y throughput: ~144 t/s en prosa y ~256 t/s en código en single stream; hasta ~261 t/s y ~451 t/s respectivamente con dos peticiones paralelas. El TTFT para prompts de 5K tokens es de 0,33 s, y para 150K tokens de 23,46 s.
- Requisitos adicionales: CUDA 13, contenedor Docker con `--ipc host`, y NCCL buffer de 2 MiB. El autor recomienda fijar la versión nightly de sglang, ya que la v0.5.18 no soporta el drafter DFLASH2 ni el head cuantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 256K | FP8 / BF16 | Apache-2.0 | Requiere ~54 GB en BF16; no cabe en una RTX 5090 sin cuantizar |
| Qwen3.8-27B-NVFP4-RTX5090 (este repo) | 27B (14,98B en NVFP4) | 175K configurado | NVFP4 + FP8 KV | Apache-2.0 | Optimizado para RTX 5090 con DFLASH2 y `lm_head` cuantizado |
| gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090 | 27B (similar) | No disponible | NVFP4 | Apache-2.0 | Repositorio similar sin detalles públicos de rendimiento |
| Qwen3.8-27B-NVFP4-RTX5090 (bonnienleohe) | 27B (similar) | No disponible | NVFP4 | Apache-2.0 | Variante sin documentación adicional |

No se dispone de benchmarks públicos comparativos entre estas variantes NVFP4. La comparación principal es contra el modelo base Qwen3.8-27B, que muestra una degradación de 4,4 puntos en GPQA Diamond (84,8 % vs 89,2 %) a cambio de poder ejecutarse en una GPU de 32 GB con rendimiento interactivo.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce una degradación de calidad medible: en GPQA Diamond se observa una caída de 4,4 puntos porcentuales respecto al modelo base (84,8 % vs 89,2 %). El autor declara una "calidad 9/10" en pruebas objetivas, pero no hay garantía de que la degradación sea uniforme en todas las tareas.
- El despliegue está limitado a hardware Blackwell (RTX 50xx) debido al formato NVFP4; no funcionará en GPUs Ampere o anteriores.
- El contexto efectivo está limitado a 175 064 tokens en la configuración recomendada, frente a los 256K del modelo base. Reducir el pool de KV puede degradar el rendimiento en conversaciones muy largas.
- La versión servida usa `--language-only`, por lo que se pierde la capacidad de visión del Qwen3.8-27B original. El autor indica que se puede habilitar la visión eliminando esa opción y reduciendo el pool a 150 064 tokens, pero no se documentan resultados con visión.
- El razonamiento se limita a 16K tokens de pensamiento y 8K de contenido por turno. Aunque el autor afirma que elevar estos límites apenas cambia la puntuación en GPQA, puede haber tareas que requieran cadenas de razonamiento más largas.
- La decodificación especulativa DFLASH2 depende de un modelo borrador específico que debe descargarse por separado; si no se dispone de él, el rendimiento cae entre un 9 % y un 27 %.
- El software requerido es una imagen nightly de sglang con una versión concreta (`20621aa1`). Las versiones estables actuales (v0.5.18) no soportan el drafter DFLASH2 ni el `lm_head` cuantizado, lo que limita la reproducibilidad a largo plazo.
- No se han publicado resultados de seguridad, sesgos o robustez para esta cuantización específica. Como cualquier modelo de lenguaje, puede alucinar, generar contenido sesgado o producir salidas incorrectas en contextos de producción.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que el modelo base Qwen3.8-27B y sus términos de uso no imponen restricciones adicionales (por ejemplo, en cuanto a atribución o uso en servicios de alto riesgo).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hamichok/Qwen3.8-27B-NVFP4-RTX5090-LMHead4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio similar de gittensor-model-hub: https://huggingface.co/gittensor-model-hub/Qwen3.8-27B-NVFP4-RTX5090
- Guía de Unsloth sobre Qwen3.8 (incluye opciones NVFP4): https://unsloth.ai/docs/models/qwen3.8
- Ejemplo de despliegue vLLM en CUDA 13 para Qwen3.8-27B NVFP4: https://github.com/n3xtgentechitalia/qwen38-27b-5090/blob/main/
