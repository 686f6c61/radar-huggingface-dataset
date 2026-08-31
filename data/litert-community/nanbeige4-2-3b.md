# litert-community/Nanbeige4.2-3B

## Resumen

Nanbeige4.2-3B es un modelo de lenguaje compacto de 3 000 millones de parámetros (no-embedding) desarrollado por Nanbeige LLM Lab, el equipo de investigación de la plataforma china de reclutamiento BOSS Zhipin. La versión publicada en `litert-community/Nanbeige4.2-3B` es una build específica para el runtime LiteRT-LM de Google, pensada para inferencia on-device (móviles y ordenadores) con cuantización int4. El modelo base está licenciado bajo Apache-2.0, lo que permite uso comercial y modificación.

La arquitectura es un *looped transformer*: sus 22 capas se ejecutan dos veces por token (`num_loops=2`), lo que duplica el cómputo por token respecto a un 3B convencional y proporciona una calidad comparable a modelos de 8B en decodificación. El modelo se entrenó desde cero con 28 billones de tokens y está diseñado para tareas agénticas: tool calling, generación de código, razonamiento matemático y científico. En esta build LiteRT-LM, el bucle se desenrolla en 44 ejecuciones de capa (22 capas × 2 loops) con una caché KV de 44 slots, y los pesos se almacenan una sola vez.

La relevancia actual de esta ficha radica en que es una de las primeras distribuciones públicas de un modelo agéntico de razonamiento en formato `.litertlm` para el ecosistema LiteRT-LM, con datos reales de rendimiento en Apple M4 Max, iPhone 17 Pro y Samsung Galaxy S26. La build int4 conserva el 90 % de la precisión GSM8K del modelo bf16 de referencia (94 %), con un tamaño de archivo de aproximadamente 2,4 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer (22 capas, `num_loops=2`, 44 ejecuciones por token) |
| Parametros totales | 3 000 millones (no-embedding); total con embeddings no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV de 44 slots: 22 capas × 2 loops) |
| Tipos de cuantizacion | int4 blockwise (block 32) + OCTAV optimal-clipping, simétrico; embedding int8; build `model_fp32act.litertlm` con activaciones fp32 |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), safetensors para el modelo base en HuggingFace |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.2-3B se preentrenó desde cero sobre 28 billones de tokens. Su arquitectura *looped transformer* reutiliza las mismas capas de transformador varias veces por token para aumentar la capacidad efectiva sin añadir parámetros. En esta configuración con `num_loops=2`, cada token atraviesa las 22 capas dos veces, lo que implica el doble de cómputo por token que un modelo de 3B estándar. Esta característica es la fuente principal de su calidad: el rendimiento en decodificación se acerca al de un modelo de 8B.

La build LiteRT-LM exporta el bucle desenrollado: 44 ejecuciones de capa sobre 22 capas con pesos compartidos, y una ranura de caché KV por cada par (loop, capa). Los pesos se almacenan una sola vez; solo el cómputo y la caché se duplican. La cuantización aplicada es int4 por bloques de 32 elementos con recorte óptimo OCTAV, simétrica, y el embedding se mantiene en int8. Existe una variante `model_fp32act.litertlm` que declara `prefer_activation_type = "fp32"` para garantizar la corrección en backends GPU.

No se dispone de información detallada sobre el pipeline de alineación (RLHF, DPO, etc.) en la documentación proporcionada, aunque por ser un modelo agéntico se infiere que incluye entrenamiento supervisado para tool calling y razonamiento multi-paso.

## Capacidades

- Razonamiento con modo *thinking*: el chat template abre automáticamente un bloque ` thinking` antes de la respuesta, siguiendo el patrón del modelo base.
- Tool calling / function calling: soporte nativo para uso de herramientas, validado en benchmarks de agentes de código y oficina.
- Agentes multi-paso: capacidad para mantener conversaciones de varios turnos con contexto largo (4096 tokens) y ejecutar flujos agénticos complejos.
- Generación de código: entrenado específicamente para tareas de agente de código, con buen rendimiento en benchmarks de programación.
- Razonamiento matemático y científico: resultados competitivos en GSM8K (94 % en bf16, 90 % en int4).
- Multilingüe: no hay información específica sobre idiomas soportados en la documentación disponible.
- Despliegue on-device: formato `.litertlm` optimizado para LiteRT-LM con cuantización int4, funcional en CPU y GPU (según la variante de archivo).

## Casos de uso

- Asistentes de código en el IDE: el modelo puede integrarse en editores de código para autocompletar, refactorizar y explicar fragmentos. Su capacidad de tool calling permite conectarlo a APIs de análisis estático o repositorios, y su razonamiento multi-paso ayuda a descomponer tareas de programación complejas.
- Agentes de automatización de oficina: gracias a su entrenamiento para tareas de oficina, puede manejar flujos como redacción de correos, resumen de documentos o gestión de calendarios, ejecutando llamadas a herramientas externas (APIs de correo, hojas de cálculo) en múltiples turnos.
- Atención al cliente automatizada en dispositivos móviles: al ejecutarse on-device con 2,4 GB de pesos, puede gestionar conversaciones multi-turno con contexto de 4096 tokens sin depender de la nube, lo que reduce latencia y costes de servidor. Su modo *thinking* permite respuestas razonadas antes de responder.
- Tutor de matemáticas y ciencias: el rendimiento en GSM8K (90 % en la build int4) lo hace adecuado para aplicaciones educativas que expliquen paso a paso problemas de aritmética, álgebra o física, con razonamiento visible en el bloque ` thinking`.
- Generación de código en pipelines de CI/CD: con soporte de tool calling, puede integrarse en sistemas de integración continua para generar tests, revisar diffs o proponer correcciones, ejecutándose en máquinas locales o en edge sin necesidad de GPU dedicada.
- Asistente personal con privacidad local: al ser Apache-2.0 y ejecutable en CPU de portátiles o móviles, permite construir asistentes que procesan datos sensibles (salud, finanzas) sin enviar información a servidores externos, manteniendo la conversación y el razonamiento en el dispositivo.

## Benchmarks y rendimiento

La model card proporciona datos de precisión y rendimiento medidos con la herramienta `litert-lm benchmark` (versión 0.15.0) en un Apple M4 Max, con `-p 256 -d 256 --runs 3`, y una evaluación GSM8K con n=50 en 0-shot con cadena de pensamiento.

| Benchmark | Resultado |
|---|---|
| GSM8K (bf16, transformers 4.51, referencia) | 94,0 % (47/50) |
| GSM8K (int4, LiteRT-LM CPU) | 90,0 % (45/50) |
| Quality gate on-device (8 preguntas, GPU y CPU) | 8/8 en ambos backends (iPhone 17 Pro) |

| Dispositivo / Backend | Prefill (256 tokens) | Decode | TTFT | Carga | Pico de memoria |
|---|---|---|---|---|---|
| Apple M4 Max (CPU) | 56 tok/s | 12,5 tok/s | 4,74 s | — | — |
| Apple M4 Max (GPU Metal, `model_fp32act.litertlm`) | 409 tok/s | 39,7 tok/s | 0,67 s | — | — |
| Samsung Galaxy S26 (GPU, `model_fp32act.litertlm`) | — | ~3,9 tok/s (medido, con throttling) | — | — | 2691 MB |
| Samsung Galaxy S26 (CPU) | — | 3,45 tok/s | — | — | 4152 MB |

Nota: el archivo `model.litertlm` (sin activaciones fp32) no genera correctamente en GPU; en Galaxy S26 produce `<unk>` tras la delegación completa de operaciones. El modelo base en bf16 no tiene benchmarks publicados en la documentación proporcionada más allá del GSM8K.

## Requisitos de hardware

- Tamaño del archivo: aproximadamente 2,4 GB (`model.litertlm`), lo que permite almacenamiento en dispositivos móviles con suficiente espacio.
- VRAM / memoria estimada: pico de 2691 MB en GPU de Galaxy S26 y 4152 MB en CPU del mismo dispositivo; en Apple M4 Max no se reporta pico.
- GPU recomendadas: Apple Metal (M4 Max probado con 409 tok/s de prefill y 39,7 tok/s de decode), GPU de móviles Android con soporte LiteRT GPU (probado en Galaxy S26 solo con la variante `model_fp32act`).
- CPU: funciona en CPU de portátiles y móviles; en M4 Max alcanza 56 tok/s de prefill y 12,5 tok/s de decode.
- El modelo cabe en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB) si se usa el formato base en bf16, pero la build `.litertlm` está pensada para el runtime LiteRT-LM, no para CUDA directo.
- Opciones de despliegue: LiteRT-LM runtime (para `.litertlm`), transformers para el modelo base, y potencialmente vLLM u Ollama para el base en servidores (no documentado explícitamente).
- Latencia: TTFT de 0,67 s en GPU M4 Max y 4,74 s en CPU M4 Max; la decodificación en móviles es lenta (~3,9 tok/s) y sufre throttling térmico en ejecuciones largas.

## Comparativa con modelos similares

No se han publicado en la documentación proporcionada resultados de benchmarks comparativos frente a otros modelos de la misma categoría. Como referencia de mercado, los modelos comparables por tamaño serían Qwen3-4B, Llama-3.2-3B y Gemma-3-4B, todos en el rango de 3-4B de parámetros y con licencias permisivas (Apache-2.0 o Gemma). Sin embargo, no hay datos en la información disponible que permitan una comparación numérica rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Nanbeige4.2-3B (base) | 3B no-embedding | 4096 (build on-device) | Apache-2.0 | safetensors |
| Qwen3-4B | ~4B | 32K (típico) | Apache-2.0 | safetensors |
| Llama-3.2-3B | ~3B | 128K (típico) | Llama 3.2 | safetensors |
| Gemma-3-4B | ~4B | 128K (típico) | Gemma | safetensors |

La ventaja diferencial de Nanbeige4.2-3B es su arquitectura *looped transformer* que duplica el cómputo efectivo sin aumentar parámetros, y su orientación específica a tareas agénticas. La build `.litertlm` añade la ventaja de la cuantización int4 con recorte OCTAV y compatibilidad con el ecosistema LiteRT-LM de Google.

## Limitaciones y advertencias

- El modelo requiere muestreo estocástico obligatorio: bajo decodificación greedy (temperatura 0) colapsa y produce salidas degradadas. La receta oficial es `temperature 0.6, top_k 20, top_p 0.95`.
- El archivo `model.litertlm` (sin activaciones fp32) es exclusivo para CPU: en GPU sus activaciones fp16 leen incorrectamente el límite del bucle desenrollado y emite únicamente `<unk>`. La variante `model_fp32act.litertlm` es necesaria para backends GPU.
- El modelo razona antes de responder (bloque ` thinking`), lo que incrementa la latencia y el número de tokens generados por consulta. En dispositivos móviles, una sola respuesta puede requerir decodificar miles de tokens, provocando throttling térmico en ejecuciones repetidas.
- No se ha probado `model.litertlm` en iPhone 17 Pro; solo `model_fp32act.litertlm` ha pasado la prueba de calidad local (8/8) en ese dispositivo.
- No hay información sobre idiomas soportados; el modelo base se entrenó principalmente con datos en chino e inglés, pero la documentación no lo confirma explícitamente.
- La precisión GSM8K cae del 94 % (bf16) al 90 % (int4), una degradación del 4 % que puede ser relevante en aplicaciones sensibles a la exactitud.
- La licencia Apache-2.0 permite uso comercial, pero la build `.litertlm` depende del runtime LiteRT-LM de Google, que puede tener sus propias condiciones de uso.
- El rendimiento en móviles es limitado: ~3,9 tok/s en Galaxy S26, lo que hace inviable la interacción en tiempo real para aplicaciones conversacionales de baja latencia.

## Enlaces

- Repositorio HuggingFace de la build LiteRT-LM: https://huggingface.co/litert-community/Nanbeige4.2-3B
- Modelo base en HuggingFace: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Paper del modelo (arXiv): https://arxiv.org/pdf/2607.22083
- Runtime LiteRT-LM de Google: https://github.com/google-ai-edge/litert-lm
- README del modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B/blob/main/README.md
