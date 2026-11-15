# goodmai/Qwen3.8-27B-GPTQ-4bit

## Resumen

Qwen3.8-27B-GPTQ-4bit es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario goodmai a partir del trabajo original de mlx-community y del cuantizador sady4850. El modelo base es un transformer multimodal de tipo image-text-to-text con 27.356.728.560 parámetros totales, desarrollado por el equipo Qwen, y esta versión redistribuye los pesos en formato MLX affine 4-bit (group size 64) sustituyendo la cuantización round-to-nearest por GPTQ en las 497 capas lineales del decoder de lenguaje. El repositorio ocupa 16,1 GB y se distribuye bajo licencia Apache 2.0.

La aportación técnica de esta ficha no es el modelo base, sino el método de cuantización: GPTQ ajustado al formato affine propio de MLX, con escalas y sesgos calculados a partir de los pesos actualizados por error y redondeados a bf16 antes de la codificación. Según la model card, esto reduce la divergencia respecto al modelo bf16 de referencia en comparación con la cuantización RTN del template, tanto en perplejidad como en KL divergence y en la tasa de "flips" del token top-1.

Es relevante ahora porque permite ejecutar un modelo multimodal de 27B en Apple Silicon con una huella de aproximadamente 15 GB, manteniendo compatibilidad directa con mlx-vlm, mlx-lm y Splash, y con una mejora medible en fidelidad de salida que se traduce en un mejor comportamiento en tareas de agente (tool calling) según la evaluación de replay incluida en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; decoder de lenguaje de 64 capas con capas lineales cuantizadas |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64, con GPTQ en 497 capas lineales (incluido `lm_head`); embedding y vision tower sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX), librería mlx |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un transformer multimodal de la familia qwen3_5 que procesa imagen y texto (pipeline image-text-to-text). La model card de esta cuantización no detalla la composición del dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo base, que no se incluye en la información proporcionada. Lo que sí se describe con precisión es el proceso de cuantización: se parte del modelo en bf16, se calculan matrices de Hessian por cada entrada compartida, con damping de 0,01 y bloques de 128, y se recalibran las escalas y sesgos de cada grupo affine a partir de los pesos corregidos por error, redondeados a bf16 antes de la codificación para que la dequantización sea exacta respecto a lo escrito.

La calibración emplea 119 fragmentos de 2048 tokens: 64 fragmentos de conversaciones de entrenamiento de UltraChat con la plantilla de chat aplicada y 55 fragmentos de calibration_v5. El resultado conserva exactamente los mismos tensores, formas, dtypes y configuración que el template mlx-community/Qwen3.8-27B-4bit, por lo que es un reemplazo directo en mlx-vlm, mlx-lm y Splash, con el mismo tamaño (15 GB) y la misma velocidad. La innovación destacable es, por tanto, la adaptación de GPTQ al formato affine de MLX, que habitualmente solo soporta round-to-nearest.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat.
- Procesamiento de imagen y texto combinados (image-text-to-text), incluyendo el vision tower heredado del template sin recuantizar.
- Razonamiento y respuesta a instrucciones en formato chat.
- Soporte de tool calling y function calling, evaluado en la model card mediante un replay de agente de programación con llamadas y argumentos comparados contra Q8_0.
- Capacidades de agente multi-paso, con contexto de hasta 124K tokens observado en la evaluación de replay.
- Generación de código en el contexto de sesiones de agente (32K a 124K de contexto en las pruebas citadas).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación en local sobre Apple Silicon: el modelo puede ejecutarse con mlx-vlm o Splash en un Mac con Apple Silicon y mantener sesiones de agente de hasta 124K tokens de contexto, según el replay de 78 turnos documentado, lo que lo hace adecuado para tareas de edición de código con herramientas.
- Automatización de tool calling en pipelines de CI/CD: la evaluación de replay muestra un 44% de llamadas idénticas a Q8_0 y un 83% de herramientas coincidentes, con cero llamadas rotas, lo que permite integrarlo en flujos donde el modelo debe invocar funciones con argumentos estructurados.
- Procesamiento de documentos con imagen y texto: al conservar el vision tower del template, puede emplearse para tareas de image-text-to-text como descripción de capturas, extracción de información de figuras o respuesta a preguntas sobre imágenes, siempre que se cargue con mlx-vlm.
- Chat conversacional de larga duración en escritorio: con 15 GB de pesos y soporte de contexto largo, es viable mantener conversaciones multi-turno en un Mac de gama alta sin conexión a servicios externos.
- Evaluación comparativa de métodos de cuantización: el repositorio incluye métricas de KLD, flips y perplejidad frente a bf16 y frente a RTN, por lo que sirve como referencia para investigar el impacto de GPTQ en formatos affine de MLX.
- Despliegue en aplicaciones macOS nativas mediante Basalt: la model card ofrece un botón de ejecución y el comando `basalt serve --model goodmai/Qwen3.8-27B-GPTQ-4bit --rest`, orientado a integrar el modelo en apps Swift sin Python.
- Prototipado de agentes con contexto largo en investigación: el replay con contextos de 32K a 124K tokens permite estudiar el comportamiento de agentes con ventanas extensas en hardware de consumo.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estándar (MMLU, HumanEval, GSM8K), sino métricas de fidelidad de cuantización y de comportamiento de agente. Se reproducen a continuación tal como aparecen en la model card.

Calidad frente a bf16 en torch (A100), con KLD, flips y perplejidad:

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | bf16 | - | - | - | - | 6,370 |
| wiki | mlx-community/Qwen3.8-27B-4bit (RTN) | 0,0562 | 0,0230 | 0,440 | 9,57% | 6,486 |
| wiki | este repo (GPTQ) | 0,0369 | 0,0122 | 0,315 | 7,37% | 6,475 |
| chat | bf16 | - | - | - | - | 8,692 |
| chat | mlx-community/Qwen3.8-27B-4bit (RTN) | 0,1800 | 0,0312 | 3,233 | 13,13% | 8,109 |
| chat | este repo (GPTQ) | 0,0975 | 0,0127 | 1,743 | 9,05% | 8,752 |

Calidad en Splash (teacher-logits, int8 KV, M1 Pro):

| Texto | Modelo | KLD media | KLD mediana | KLD p99 | Flips | PPL |
|---|---|---|---|---|---|---|
| wiki | bf16 | - | - | - | - | 6,364 |
| wiki | mlx-community/Qwen3.8-27B-4bit (RTN) | 0,0562 | 0,0221 | 0,469 | 9,58% | 6,479 |
| wiki | este repo (GPTQ) | 0,0399 | 0,0119 | 0,326 | 7,49% | 6,458 |
| chat | bf16 | - | - | - | - | 8,717 |
| chat | mlx-community/Qwen3.8-27B-4bit (RTN) | 0,1906 | 0,0327 | 2,724 | 13,13% | 8,141 |
| chat | este repo (GPTQ) | 0,1002 | 0,0128 | 1,577 | 9,05% | 8,706 |

Replay de agente (78 turnos, contexto de 32K a 124K, temperatura 0, Splash 1.4.0-m1 en M2 Max, comparado contra Q8_0):

| Modelo | Mismas llamadas | Mismas herramientas | Similitud de argumentos | Llamadas rotas |
|---|---|---|---|---|
| mlx-community/Qwen3.8-27B-4bit (RTN) | 31% | 79% | 0,88 | 0 |
| este repo (GPTQ) | 44% | 83% | 0,92 | 0 |

Velocidad en Splash: 14,10 s de prefill por ventana de 2048 tokens para ambos modelos, y 23,00 s frente a 23,05 s para 127 ciclos de verificación. El autor señala que 78 turnos es una muestra pequeña y que Q8_0 contra sí mismo da un 82% de mismas llamadas como referencia de escala.

## Requisitos de hardware

- Huella de pesos: 16,1 GB de repositorio; aproximadamente 15 GB de pesos cuantizados según la model card.
- VRAM/unified memory estimada: no se publica una cifra oficial de memoria de inferencia; por el tamaño de pesos, se requiere al menos el espacio de los 15 GB más overhead de KV cache y activaciones. Con KV cache en int8, la model card menciona pruebas en M1 Pro y M2 Max.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo es Apple Silicon (M1 Pro, M2 Max y superiores según las pruebas citadas). Para GPUs NVIDIA no se proporcionan instrucciones ni requisitos; la comparación en A100 se hizo solo para evaluar la dequantización en torch.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no se documenta compatibilidad con GPUs de consumo NVIDIA en esta ficha.
- Opciones de despliegue: mlx-vlm (`python -m mlx_vlm.generate`), mlx-lm, Splash y Basalt (`basalt serve --model goodmai/Qwen3.8-27B-GPTQ-4bit --rest`).
- Latencia y throughput: en Splash, 14,10 s de prefill por ventana de 2048 tokens y 23,00 s para 127 ciclos de verificación; la velocidad es igual a la del template RTN.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodmai/Qwen3.8-27B-GPTQ-4bit (este) | 27,36B | no disponible | MLX affine 4-bit con GPTQ | Apache 2.0 | Hugging Face, 0 descargas |
| mlx-community/Qwen3.8-27B-4bit (RTN) | 27,36B (mismo base) | no disponible | MLX affine 4-bit RTN | Apache 2.0 | Hugging Face, template de referencia |
| Qwen/Qwen3.8-27B (bf16) | 27,36B | no disponible | bf16 | Apache 2.0 | Hugging Face, modelo base |
| unsloth/Qwen3.8-27B-GGUF | 27,36B (mismo base) | no disponible | GGUF | Apache 2.0 | Hugging Face, mencionado en la model card |

La comparativa se limita a variantes del mismo modelo base, ya que la información proporcionada no incluye modelos de otros desarrolladores con los que contrastar. Frente a la variante RTN, este repositorio reduce la KLD media de 0,0562 a 0,0369 en wiki y de 0,1800 a 0,0975 en chat (torch, A100), y mejora las mismas llamadas en el replay de agente del 31% al 44%. Frente a bf16, mantiene la misma arquitectura y licencia, con menor huella de memoria.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; los sesgos del modelo base no se detallan en esta model card.
- Riesgo de alucinación: no cuantificado en la información disponible; las métricas publicadas miden fidelidad respecto a bf16, no veracidad factual.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica y los idiomas soportados no están disponibles. El replay de agente cubre contextos de 32K a 124K, pero no se declara el máximo oficial.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla aquí.
- Caveat de producción: el modelo está empaquetado para MLX y depende de mlx-vlm, mlx-lm, Splash o Basalt; no es directamente desplegable en vLLM, TGI o llama.cpp sin conversión adicional.
- Caveat de evaluación: la comparación de calidad se hizo con 30 fragmentos de 2048 tokens por texto y el replay de agente con solo 78 turnos, muestra que el propio autor califica de pequeña.
- Caveat de perplejidad: el checkpoint RTN tiene menor perplejidad de chat que bf16, por lo que la perplejidad aislada no es una buena medida de fidelidad; deben mirarse KLD y flips.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria independiente más allá del replay citado.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/Qwen3.8-27B-GPTQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Template MLX RTN: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Upstream de esta cuantización: https://huggingface.co/mlx-community/Qwen3.8-27B-GPTQ-4bit
- Cuantizador original: https://huggingface.co/sady4850
- Basalt (GitHub): https://github.com/goodmai/basalt
- Basalt (demo): https://goodmai-run-with-basalt.hf.space/?model=goodmai%2FQwen3.8-27B-GPTQ-4bit&role=chat
- Splash (GitHub): https://github.com/paperniuk/splash
- Discusión de Splash con el replay de agente: https://github.com/paperniuk/splash/discussions/34#discussioncomment-19226461
- Perfil del autor del replay: https://github.com/ghisguth
- Variante GGUF mencionada: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
