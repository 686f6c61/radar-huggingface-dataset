# litert-community/LFM2.5-1.2B-Thinking

## Resumen

LFM2.5-1.2B-Thinking es la variante de razonamiento del modelo estrella de Liquid AI dentro de su familia de modelos híbridos conv-attention para despliegue en el borde. El modelo original, desarrollado por Liquid AI, incorpora una arquitectura híbrida que combina capas convolucionales con capas de atención, optimizada para inferencia eficiente en dispositivos con recursos limitados. Esta versión concreta, publicada por la comunidad litert-community, es una conversión al formato LiteRT-LM (`.litertlm`) para su ejecución con el runtime on-device de Google.

La relevancia de esta ficha radica en que ejemplifica el ecosistema emergente de modelos de razonamiento de pequeño tamaño (1.200 millones de parámetros) empaquetados para hardware de consumo, incluyendo smartphones Android, macOS con Apple Silicon y placas como Raspberry Pi 5. El modelo trabaja los problemas dentro de etiquetas `` antes de emitir la respuesta final, y el runtime de LiteRT-LM es capaz de separar ese canal de pensamiento del texto de salida, lo que permite a las aplicaciones mostrar u ocultar el razonamiento de forma nativa.

El repositorio incluye cuatro variantes cuantizadas (int8 e int4, cada una con versión CPU y GPU), con tamaños que van de 736 MB a 1,24 GB, lo que lo sitúa en el rango de modelos desplegables en dispositivos móviles sin conexión. La licencia es la LFM Open License v1.0, que conviene revisar con detalle antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida conv-attention (familia LFM2.5 de Liquid AI); pesos convertidos a LiteRT-LM |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 4096 tokens máximo (KV cache) |
| Tipos de cuantizacion | int8 dinámica (lineales + embedding, convoluciones en float); int4 blockwise-32 + OCTAV en lineales, embedding int8, convoluciones en float; variantes GPU de ambas |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm-open-license-v1.0`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en formato original de LiquidAI |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Liquid AI para la familia LFM2.5, descrita en la model card como "hybrid conv-attention": combina capas convolucionales con capas de atención, un diseño pensado para reducir el coste computacional y de memoria frente a un transformer denso puro, manteniendo capacidad de modelado de secuencias. Esta versión concreta no es un reentrenamiento, sino una conversión de pesos del modelo `LiquidAI/LFM2.5-1.2B-Thinking` al formato `.litertlm` mediante las herramientas de LiteRT (antiguo TensorFlow Lite) y `litert-torch` (antiguo `ai-edge-torch`). Según la model card, una conversión de un modelo PyTorch sin modificar con `litert_torch.convert` coincidió con el original hasta 4e-7 en un Galaxy S26.

El detalle de entrenamiento (número de tokens, composición del dataset, si hubo RLHF/DPO) no está disponible en la información proporcionada para el modelo base. Lo que sí documenta la model card es el proceso de cuantización y empaquetado: la variante int8 usa cuantización dinámica en lineales y embedding dejando las convoluciones en float; la int4 emplea cuantización blockwise de tamaño 32 con OCTAV en las capas lineales, embedding en int8 y convoluciones en float. Las versiones `_gpu` reexportan los mismos pesos para ejecutarse en GPU (OpenCL en Android y macOS, Metal en iOS para la int4). Una actualización de 2026-08-04 añadió la sección `ExecutorMetadata` necesaria para que litert-lm ≥ 0.15 enlace los buffers de estado híbridos conv/attention, manteniendo pesos y grafo idénticos byte a byte.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo produce una cadena de pensamiento dentro de `` antes de la respuesta final, que llega tras ``.
- Canal de pensamiento separado: LiteRT-LM ≥ 0.14 transmite el razonamiento por un canal `thought` independiente, lo que permite a la aplicación mostrarlo u ocultarlo y elimina automáticamente el pensamiento pasado del contexto multi-turno.
- Razonamiento matemático de varios pasos: la model card reporta resultados en GSM8K con CoT de 0-shot, lo que indica capacidad para resolver problemas aritméticos encadenados.
- Ejecución on-device: inferencia local en CPU y, en las variantes `_gpu`, en GPU (Android OpenCL, macOS, iOS Metal para int4).
- Soporte de plantilla de chat completa embebida en el archivo, incluyendo el canal `thought`.
- Compatibilidad con la forma de "content-parts" del template de chat desde litert-lm 0.18 (la forma de cadena permanece sin cambios).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada (el pipeline es text-generation).

## Casos de uso

- Asistente de razonamiento offline en móvil: el modelo puede resolver problemas matemáticos o lógicos directamente en el dispositivo sin enviar datos a la nube, usando la variante int8 en CPU (35,5 tok/s de decodificación en un Galaxy S26) o la int4 en GPU para prompts largos.
- Tutor de matemáticas embebido en una app educativa: la separación del canal `thought` permite mostrar al estudiante el razonamiento paso a paso y, opcionalmente, ocultarlo en la respuesta final; el rendimiento en GSM8K (77 % en int8, 72 % en int4) lo hace adecuado para problemas de aritmética de primaria y secundaria.
- Procesamiento de documentos en el borde con Raspberry Pi 5: con 4 hilos de CPU y la variante int8, el modelo decodifica a 7,1 tok/s con un TTFT de 3,56 s, suficiente para tareas de extracción o resumen de texto en un dispositivo de bajo consumo conectado a sensores o bases de datos locales.
- Automatización de atención al cliente en kioscos o terminales sin conectividad: el contexto de 4096 tokens permite conversaciones multi-turno moderadas, y el borrado automático del pensamiento pasado evita que el razonamiento previo contamine el contexto.
- Prototipado rápido de agentes de razonamiento en Android: la integración con AI Edge Gallery y litert-lm ≥ 0.15 permite probar flujos de razonamiento multi-paso en un Pixel 8a con aceleración OpenCL, donde el prefill en GPU alcanza 189–192 tok/s frente a 31 tok/s en CPU.
- Validación de pipelines de cuantización: el repositorio ofrece cuatro recetas (int8, int4, int8_gpu, int4_gpu) con métricas comparadas frente a la referencia bf16 (81 % en GSM8K), lo que lo convierte en un banco de pruebas para estudiar la degradación por cuantización en modelos híbridos pequeños.
- Inferencia en portátiles Apple Silicon: la variante `_int4_gpu` corre en macOS con prefill en GPU de 3734 tok/s (medido en M4 Max con litert-lm 0.16.0), lo que habilita asistentes locales de razonamiento en entornos de desarrollo sin GPU dedicada.

## Benchmarks y rendimiento

La model card proporciona resultados de GSM8K (greedy, 0-shot CoT, max-tokens 2048, n=100, mismo script de evaluación para todas las filas):

| Variante | GSM8K (n=100) | Diferencia vs. bf16 |
|---|---|---|
| PyTorch bf16 (referencia) | 81 % | — |
| LiteRT int8 | 77 % | −4 puntos |
| LiteRT int4 | 72 % | −9 puntos |

Rendimiento medido en dispositivo (edge-compat):

| Dispositivo | Variante | Backend | Decode | Prefill | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | int8 | CPU | 35,5 tok/s | 357 tok/s | 600 ms |
| Galaxy S26 | int8 | GPU | no ejecutó (`engine_create_failed`) | — | — |
| Raspberry Pi 5 (4 hilos) | int8 | CPU | 7,1 tok/s | 75 tok/s | 3,56 s |
| Raspberry Pi 5 (4 hilos) | int4 | CPU | 9,2 tok/s | 55 tok/s | 4,78 s |
| Galaxy S26 | int4 | GPU | no ejecutó (`engine_create_failed`) | — | — |

Rendimiento GPU vs. CPU en Pixel 8a (Tensor G3, litert-lm v0.16.0, prompt de 263 tokens, generación limitada a 256, 3 ejecuciones por backend):

| Backend | Prefill (263 tok) | Decode | TTFT |
|---|---|---|---|
| GPU (OpenCL) | 189–192 tok/s | 21,8–22,4 tok/s | 1,41–1,44 s |
| CPU | 31,3–31,7 tok/s | 16,3–16,7 tok/s | 8,4–8,5 s |

En Apple M4 Max (litert-lm 0.16.0, `-p 256 -d 256 --runs 3`), el prefill en GPU alcanza 3734 tok/s según el fragmento disponible de la model card. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 736 MB para las variantes int4 y 1,24 GB para las int8, según el tamaño de los archivos `.litertlm`. El repositorio completo ocupa 18,6 GB.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; el soporte GPU documentado es OpenCL en Android y macOS, y Metal en iOS para la variante int4.
- Cabe en GPU de consumo: sí, en el sentido de que las variantes `_gpu` están pensadas para GPUs integradas de móvil y Apple Silicon; no hay datos sobre GPUs dedicadas de escritorio (RTX 4090, A100, H100) en la información proporcionada.
- Opciones de despliegue: runtime LiteRT-LM (requiere litert-lm ≥ 0.15; la versión 0.16.0 añade soporte GPU verificado), AI Edge Gallery en Android, y la CLI `litert-lm run`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks. En Pixel 8a la GPU multiplica por 3–6 el prefill y el TTFT frente a CPU, mientras que la decodificación queda limitada por ancho de banda y es similar en ambos backends. En iOS es necesario fijar `maxNumTokens` a 1024, ya que un valor distinto rompe la creación del motor.
- Nota de compatibilidad: en Galaxy S26 con LiteRT-LM 0.16.0 la GPU falló con `engine_create_failed` para ambas variantes (2026-08-24), por lo que el despliegue en ese dispositivo debe usar CPU hasta que se resuelva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (LiteRT-LM) | 1,2B | 4096 | 77 % (int8), 72 % (int4) | LFM Open License v1.0 | `.litertlm`, on-device |
| LiquidAI/LFM2.5-1.2B-Thinking (base) | 1,2B | no disponible | 81 % (bf16) | LFM Open License v1.0 | Pesos originales en Hugging Face |
| litert-community/LFM2.5-1.2B-Instruct | 1,2B | no disponible | no disponible | no disponible | `.litertlm`, on-device |

La comparativa se limita a las variantes de la misma familia porque la información proporcionada no incluye datos de modelos de otros autores (Qwen, Gemma, Phi, etc.) que permitan una comparación rigurosa de rendimiento y licencia.

## Limitaciones y advertencias

- Presupuesto de tokens: al ser un modelo de razonamiento, truncar la generación a mitad del pensamiento produce una respuesta vacía o incompleta; la model card recomienda un presupuesto de al menos 2048 tokens.
- Contexto limitado: la KV cache está limitada a 4096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Degradación por cuantización: la variante int4 pierde 9 puntos en GSM8K frente a bf16 (72 % vs. 81 %), un deterioro relevante para tareas matemáticas.
- Fallo de GPU en algunos dispositivos: en Galaxy S26 con LiteRT-LM 0.16.0 la creación del motor GPU falló para int4 e int8; el despliegue debe validarse por dispositivo.
- Restricción en iOS: es obligatorio fijar `maxNumTokens` a 1024 en iPhone; otros valores rompen la creación del motor.
- Compatibilidad de versión: los archivos requieren litert-lm ≥ 0.15 por la sección `ExecutorMetadata`; versiones anteriores fallan con `missing some output TensorBuffers`.
- Idiomas: no se documentan los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano sin evaluación previa.
- Licencia: la LFM Open License v1.0 es una licencia "other" con condiciones específicas; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; como todo modelo de 1,2B, es esperable una fiabilidad limitada en dominios especializados.
- Tool calling y agentes: no hay evidencia documentada de soporte de function calling ni de razonamiento multi-paso con herramientas, lo que limita su uso en pipelines de agentes complejos.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/LFM2.5-1.2B-Thinking
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Variante Instruct de la misma familia: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Registro de compatibilidad edge-compat (int4): https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-thinking-int4/CARD.md
- Registro de compatibilidad edge-compat (int8): https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-thinking-int8/CARD.md
- Benchmark de runtimes en Apple Silicon (referencia de conversión): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Licencia LFM Open License v1.0: incluida en el repositorio como archivo `LICENSE`
