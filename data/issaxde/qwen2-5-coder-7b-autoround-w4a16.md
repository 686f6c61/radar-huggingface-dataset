# issaxde/Qwen2.5-Coder-7B-AutoRound-W4A16

## Resumen

El modelo `issaxde/Qwen2.5-Coder-7B-AutoRound-W4A16` es una cuantización W4A16 (INT4) del modelo base `Qwen/Qwen2.5-Coder-7B`, desarrollada por el usuario issaxde. Está orientada a inferencia de baja latencia para autocompletado de código y relleno en medio (fill-in-the-middle, FIM). Se trata de una versión cuantizada del modelo original de Qwen, que mantiene la arquitectura transformer decoder-only de Qwen2.5 y ha sido preentrenada con más de 5,5 billones de tokens de código y texto.

La cuantización se realizó con AutoRound 0.15.0, utilizando 1.000 iteraciones por capa y un conjunto de calibración de 512 secuencias de 2.048 tokens, mezclando código FIM, código plano e instrucciones de programación. El checkpoint resultante ocupa aproximadamente 5,2 GiB y consume 5,17 GiB de VRAM en pesos, lo que lo hace viable en GPUs de consumo con al menos 8 GB de memoria. Está diseñado para usarse con vLLM, que detecta automáticamente el formato de cuantización y emplea el kernel Marlin para acelerar la inferencia.

La relevancia de este modelo radica en que ofrece una alternativa cuantizada de alta calidad para despliegues de autocompletado de código en entornos con recursos limitados, manteniendo un rendimiento comparable al modelo original en tareas FIM, según las pruebas del autor. No es una versión instruct, por lo que no debe usarse como asistente conversacional, sino a través de la API de completions con los tokens FIM de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.6B (modelo base Qwen2.5-Coder-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 (configuracion recomendada; el modelo base soporta hasta 131.072) |
| Tipos de cuantizacion | W4A16 (INT4 simetrico, grupo 128) |
| Idiomas soportados | Principalmente ingles y codigo (segun modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado auto_round:auto_gptq) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-7B es un transformer decoder-only con atención completa, perteneciente a la familia Qwen2.5. Fue preentrenado con un corpus de más de 5,5 billones de tokens, con especial énfasis en código y datos de programación. El checkpoint cuantizado conserva la misma arquitectura, pero reemplaza las capas lineales (196 de 197) por versiones cuantizadas en INT4 con activaciones en BF16 (W4A16). La capa `lm_head` se mantiene en BF16 para preservar la calidad de salida.

La cuantización se realizó con AutoRound 0.15.0, un método de cuantización basado en optimización iterativa. Se emplearon 1.000 iteraciones por capa y 512 secuencias de calibración de 2.048 tokens, extraídas del dataset `nvidia/OpenCodeInstruct` (revisión `8f3ba5bafe4d6e8db46082cf7ae6741bc370604d`). La mezcla de calibración fue 50% código FIM, 25% código plano y 25% instrucciones de programación con código. Se aplicó una comprobación de solapamiento de 13-gramas contra HumanEval, descartando 479 de 4.141 registros para evitar contaminación. El proceso de cuantización tardó 3.535,86 segundos en una A100 80 GB y alcanzó un pico de 24,72 GB de VRAM (memoria de cuantización, no de inferencia).

## Capacidades

- Generación de código: autocompletado de código en múltiples lenguajes, con soporte para relleno en medio (FIM) mediante los tokens `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`.
- Razonamiento sobre código: puede predecir entradas y salidas de fragmentos de código, útil para tareas de depuración y análisis estático.
- Multilingüe: aunque está especializado en código, el modelo base soporta varios idiomas naturales, principalmente inglés.
- No es un modelo instruct: no está entrenado para seguir instrucciones conversacionales ni para chatear; debe usarse como modelo de completions.
- Compatible con vLLM: integración nativa con el kernel Marlin para inferencia acelerada en GPUs NVIDIA Ampere o posteriores.
- Sin soporte de tool calling ni agentes: al ser un modelo base, no incluye capacidades de llamada a funciones ni razonamiento multi-paso guiado.

## Casos de uso

- Autocompletado en editores de código: el modelo puede integrarse en extensiones de IDE (VS Code, JetBrains) para sugerir código en tiempo real. Su baja latencia (TTFT p50 de 94 ms con concurrencia 1 en A100) lo hace adecuado para interacción interactiva.
- Relleno en medio (FIM) en pipelines de generación: permite completar fragmentos de código entre un prefijo y un sufijo, útil para refactorización automática o generación de funciones incompletas.
- Generación de código en CI/CD: puede usarse como backend de autocompletado en entornos de integración continua para generar tests, documentación o código repetitivo, siempre que se revise la salida.
- Asistente de programación en entornos aislados: al ser un modelo base, puede desplegarse en sandboxes para generar código sin riesgo de conversaciones no deseadas.
- Prototipado rápido de herramientas de completado: su tamaño reducido (5,2 GiB) permite ejecutarlo en GPUs de consumo (RTX 3060, 4060, etc.) para pruebas y desarrollo.
- Investigación en cuantización: sirve como referencia para estudiar el impacto de la cuantización W4A16 en tareas de código, comparando con el modelo BF16 original.

## Benchmarks y rendimiento

El autor publicó una evaluación personalizada de HumanEval FIM, que consiste en preservar el primer y último tercio de cada solución canónica, generar el tercio intermedio, reconstruir la solución y ejecutar las 164 tareas en un contenedor restringido. Los resultados son:

| Modelo | Tareas resueltas | Puntuacion |
|---|---|---|
| Qwen2.5-Coder-7B BF16 | 124/164 | 75,61% |
| Checkpoint W4A16 | 129/164 | 78,66% |

El autor advierte que esta prueba no sigue el protocolo estándar de HumanEval y que el resultado agregado no debe interpretarse como una mejora general de la cuantización. En comparación por pares, el modelo W4A16 perdió 4 tareas que el BF16 resolvía y ganó 9 que el BF16 no resolvía.

También se midieron métricas de latencia en una A100 PCIe 80 GB, con prompt sin caché de 1.024 tokens y generación de 64 tokens:

| Concurrencia | TTFT p50 | Latencia total p50 | Decode mediana |
|---|---:|---:|---:|
| 1 | 94,47 ms | 407,80 ms | 200,95 tokens/s |
| 2 | 177,73 ms | 501,42 ms | 194,83 tokens/s |
| 3 | 262,33 ms | 587,65 ms | 193,81 tokens/s |

Estos valores son específicos de la A100 y no deben extrapolarse a otras GPUs; el autor recomienda re-ejecutar pruebas de aceptación en el hardware de despliegue.

## Requisitos de hardware

- VRAM estimada: 5,17 GiB para los pesos del modelo. Con la configuración recomendada de vLLM (gpu-memory-utilization 0.25, max-model-len 8192), se puede ejecutar en una GPU con al menos 8 GB de VRAM, como una RTX 3060 o RTX 4060.
- GPU recomendadas: el autor indica como objetivo una RTX A6000 48 GB, pero las mediciones de referencia se hicieron en A100 PCIe 80 GB. Cualquier GPU NVIDIA con arquitectura Ampere o posterior (RTX 30xx, RTX 40xx, A100, A6000) es compatible gracias al kernel Marlin.
- Opciones de despliegue: vLLM (recomendado, con detección automática de cuantización), también puede usarse con Transformers y AutoRound, aunque no se documenta en la model card. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: en A100, con concurrencia 1, TTFT p50 de 94 ms y decode de 200 tokens/s. Con concurrencia 3, TTFT sube a 262 ms y decode baja a 193 tokens/s. Estos valores son orientativos y dependen del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Uso principal |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B (BF16) | 7.6B | 131.072 | BF16 | Apache-2.0 | Generacion de codigo, FIM |
| issaxde/Qwen2.5-Coder-7B-AutoRound-W4A16 | 7.6B | 8.192 (config) | W4A16 | Apache-2.0 | Autocompletado de baja latencia |
| Qwen2.5-Coder-7B-Instruct | 7.6B | 131.072 | BF16 | Apache-2.0 | Asistente de codigo conversacional |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos cuantizados similares en la información proporcionada. La principal diferencia entre el checkpoint cuantizado y el BF16 es el tamaño (5,2 GiB vs ~15 GiB) y la latencia, a costa de una ventana de contexto reducida en la configuración recomendada.

## Limitaciones y advertencias

- No es un modelo instruct: no debe usarse como chat o asistente conversacional; está pensado exclusivamente para completions de código.
- La cuantización puede alterar salidas individuales: aunque el rendimiento agregado se mantiene, ciertos fragmentos de código pueden diferir respecto al modelo BF16.
- Contexto limitado en la configuración recomendada: la model card solo valida 8.192 tokens de contexto; el modelo base soporta hasta 131.072, pero no se ha probado con esta cuantización.
- Riesgo de alucinación en código: como todo modelo generativo, puede producir código incorrecto o inseguro; debe revisarse y ejecutarse en entornos aislados.
- Sesgos del modelo base: hereda los sesgos del corpus de entrenamiento de Qwen2.5-Coder, que pueden reflejarse en estilos de código o preferencias de lenguajes.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el modelo base Qwen2.5-Coder tiene condiciones adicionales (ver upstream), que se heredan en este derivado.
- Sin soporte de tool calling ni agentes: no es adecuado para pipelines que requieran llamadas a funciones o razonamiento multi-paso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/issaxde/Qwen2.5-Coder-7B-AutoRound-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Modelo instruct (para comparación): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper técnico de Qwen2.5-Coder: https://arxiv.org/html/2409.12186v1
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Página de Ollama para Qwen2.5-Coder: https://ollama.com/library/qwen2.5-coder:7b
