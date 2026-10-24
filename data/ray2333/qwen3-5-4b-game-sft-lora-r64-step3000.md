# Ray2333/Qwen3.5-4B-game-sft-lora-r64-step3000

## Resumen

`Ray2333/Qwen3.5-4B-game-sft-lora-r64-step3000` es un adaptador LoRA de PEFT para el modelo multimodal `Qwen/Qwen3.5-4B`, guardado en el paso de optimizador 3000 de un ajuste supervisado sobre el formato comprimido de trayectorias multimodales `game-plus/trajectories-sft`. No es un modelo completo: el repositorio (0,3 GB) contiene únicamente el adaptador de inferencia y su configuración, por lo que para utilizarlo hay que cargar el modelo base por separado.

El adaptador está pensado para modelar trayectorias de juego: secuencias que combinan capturas de pantalla (hasta cuatro por muestra: tres previas más la actual) con las acciones tomadas por el agente. El modelo base Qwen3.5-4B aporta una arquitectura híbrida que combina capas de atención lineal Gated Delta Network con capas de atención completa, además de torre de visión, modo de razonamiento (*thinking*) y soporte de contexto largo.

Su relevancia es acotada y experimental: se publica como artefacto de investigación reproducible (rango 64, alpha 128, lr 1e-4, secuencias de hasta 32.768 tokens), sin tarjeta de modelo con evaluación, sin licencia declarada, sin idiomas declarados y con cero descargas en el momento de la consulta. Es útil como punto de partida para quien trabaje en agentes que operan interfaces gráficas, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT, all-linear) sobre un transformer híbrido: capas de atención lineal Gated Delta Network combinadas con capas de atención completa, más torre de visión (modelo base Qwen3.5-4B) |
| Parametros totales | Modelo base de ~4B de parámetros; adaptador LoRA con rango 64 y alpha 128 aplicado a todas las capas lineales (repositorio de 0,3 GB) |
| Parametros activos | No aplica: no es un modelo MoE y no se documenta que el modelo base lo sea |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento se realizó con longitud máxima de secuencia de 32.768 tokens y estrategia de descarte (`delete`) en caso de excederla |
| Tipos de cuantizacion | No documentados para el adaptador (se distribuye en safetensors, precisión bfloat16); cualquier cuantización se aplicaría al modelo base, no al adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere `transformers>=4.57` y el modelo base `Qwen/Qwen3.5-4B` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un modelo multimodal de tipo image-text-to-text con una arquitectura híbrida que intercala capas de atención lineal Gated Delta Network con capas de atención completa, e incorpora torre de visión y modo de razonamiento. El ajuste es un LoRA all-linear con rango 64, alpha 128 y dropout 0,05, es decir, se adaptan las proyecciones lineales de todas las capas, incluidas presumiblemente las del codificador visual, aunque la tarjeta no lo desglosa.

La configuración de entrenamiento documentada es: batch global efectivo de 128 (micro-batch de 1 en 8 GPU con acumulación de gradiente de 16), longitud máxima de secuencia de 32.768 tokens con descarte de muestras que la excedan, hasta 4 capturas por muestra (tres previas más la actual), scheduler coseno con 5 % de warmup, learning rate máximo de 1e-4, precisión bfloat16, ZeRO etapa 1 y checkpointing de gradientes. No se especifica el número de tokens vistos, el tamaño ni la composición del dataset `game-plus/trajectories-sft`, ni si hubo fases posteriores de RLHF o DPO. El repositorio contiene solo el adaptador y su configuración: no incluye estados de optimizador, RNG, scheduler ni trainer, por lo que el entrenamiento no es reanudable tal cual.

## Capacidades

- Generación de la siguiente acción en una trayectoria de juego a partir de un historial multimodal de hasta cuatro capturas de pantalla y las acciones previas.
- Comprensión de imagen y texto de forma conjunta (pipeline `image-text-to-text` heredado del modelo base).
- Razonamiento multi-paso y comportamiento de agente, apoyado en el modo *thinking* del modelo base; el adaptador está entrenado sobre trayectorias, que son intrínsecamente secuenciales.
- Contexto de trabajo amplio: el entrenamiento admite secuencias de hasta 32.768 tokens, suficiente para historiales largos de interacción con capturas intercaladas.
- Capacidad de actuar como política de referencia (*baseline*) en experimentos de imitación de agentes.
- Capacidades de código, matemáticas y multilingüismo del modelo base: no evaluadas en este adaptador, se heredan sin garantía.
- Soporte de *tool calling* y *function calling*: no documentado para este adaptador en la información disponible; el modelo base lo soporta según su familia, pero no hay verificación tras el ajuste.

## Casos de uso

- Agentes que juegan por imitación: dado un estado compuesto por las tres últimas capturas y la actual más el historial de acciones, el adaptador genera la siguiente acción del agente; encaja porque el entrenamiento usó exactamente ese formato de hasta 4 capturas por muestra.
- Generación de datos sintéticos de trayectorias: usar el adaptador para producir rollouts etiquetados que alimenten un pipeline de SFT o de *reward modeling* posterior, aprovechando que reproduce la distribución de `game-plus/trajectories-sft`.
- Evaluación comparativa de agentes de juego: servir el adaptador como política de referencia contra la que medir agentes basados en reglas o en modelos mayores, con la ventaja de que comparte base y configuración reproducible.
- Prototipado de automatización de interfaces gráficas (RPA): el modelo aprende a mapear capturas de pantalla a acciones, una habilidad transferible a flujos de clics y teclado en aplicaciones de escritorio o web, siempre con validación adicional.
- Investigación en SFT multimodal: punto de partida reproducible con hiperparámetros públicos (r=64, alpha=128, lr=1e-4, 32k de contexto) para estudiar el efecto del rango, el paso de checkpoint o la estrategia de descarte de secuencias largas.
- QA de videojuegos y pruebas de regresión: generar secuencias de interacción plausibles para recorrer menús y mecánicas de forma automatizada, reduciendo el trabajo manual de prueba exploratoria.
- Base para un ajuste posterior con preferencias: al ser un adaptador PEFT de 0,3 GB, se puede continuar el entrenamiento o aplicar DPO/RL sobre él sin tocar los pesos completos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo no incluye ninguna evaluación cuantitativa (ni MMLU, ni HumanEval, ni GSM8K, ni métricas específicas de juego o de trayectorias), y tampoco se aportan comparaciones con otros adaptadores o con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM del adaptador: 0,3 GB en disco; en memoria, los pesos LoRA en bfloat16 son una fracción pequeña del total.
- VRAM del modelo base: ~8 GB en bfloat16 solo para pesos de un modelo de 4B, más la torre de visión y la caché KV. Con 4 capturas y contexto largo, una estimación prudente sitúa el total en 16-24 GB en bfloat16.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bfloat16 con contexto moderado; en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) requeriría cuantización del base o recortar el número de imágenes y la longitud de contexto.
- GPU de datacenter: A100 40 GB, A100 80 GB y H100 son holgadas y permiten lotes mayores o contextos cercanos a los 32k tokens del entrenamiento.
- Despliegue: `transformers` + `peft` es la vía directa y la única documentada por el autor (`transformers>=4.57`). vLLM o TGI con soporte de LoRA y de modelos multimodales son opciones plausibles, pero la compatibilidad con Qwen3.5-4B y este adaptador no está verificada en la información disponible. llama.cpp u Ollama exigirían convertir el base a GGUF (con la dificultad añadida de la torre de visión) y fusionar o convertir el adaptador; no está documentado.
- Latencia y throughput: no disponibles. Al tratarse de inferencia multimodal con hasta 4 imágenes por petición, el coste de prefill del codificador visual será el factor dominante frente a la decodificación de texto.

## Comparativa con modelos similares

| Modelo | Tipo | Rango LoRA | Contexto de entrenamiento | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ray2333/Qwen3.5-4B-game-sft-lora-r64-step3000 (este) | Adaptador LoRA all-linear sobre Qwen3.5-4B | 64 | 32.768 tokens | game-plus/trajectories-sft (multimodal) | no disponible | 0 descargas, 0 likes |
| Ray2333/Qwen3.5-4B-game-sft-lora-r64-step1000-fulldata | Adaptador LoRA sobre Qwen3.5-4B | 64 | no disponible | mismo dataset, checkpoint 1000 | no disponible | pública en HuggingFace, con discusiones abiertas |
| uiuc-kang-lab/Qwen3.5-4B-general-LoRA-r64 | Adaptador LoRA de propósito general sobre Qwen3.5-4B | 64 | no disponible | no disponible (sin model card) | no disponible | 7 descargas |
| qwen35-4b-lora-sft (IIIIQIIII, GitHub) | Receta de fine-tuning LoRA sobre Qwen3.5-4B | 128 | no disponible | dataset SFT de agente/razonamiento de StepFun | no disponible | repositorio público en GitHub |

La comparación relevante es entre checkpoints del mismo autor: este adaptador (paso 3000) frente al de paso 1000 con datos completos. Ninguno de los dos publica métricas, de modo que la elección entre ambos solo puede hacerse por validación propia.

## Limitaciones y advertencias

- Licencia no declarada: no hay base legal explícita para uso comercial, y la licencia del modelo base tampoco se especifica en la información disponible. Es un bloqueo para producción.
- Sin evaluación: no hay benchmarks, ni métricas de pérdida, ni comparación con el base sin ajustar. No se puede afirmar que el ajuste mejore al modelo original en ninguna tarea.
- Artefacto incompleto por diseño: solo contiene el adaptador; sin el modelo base no es ejecutable, y no incluye estado de entrenamiento para reanudar.
- Riesgo de sobreajuste al formato: entrenado con un único dataset y hasta 4 capturas por muestra; fuera de ese formato (más imágenes, resoluciones distintas, otros juegos) el comportamiento es impredecible.
- Riesgo de alucinación: como cualquier modelo generativo multimodal, puede producir acciones plausibles pero incorrectas o describir elementos de la pantalla que no existen. En un bucle de agente esto se amplifica.
- Sesgos: no documentados. Al entrenarse sobre trayectorias de juego humanas o sintéticas, puede reproducir sesgos de estilo de juego, y no hay información sobre la composición del dataset ni sobre filtrado de datos.
- Idiomas: no se declaran idiomas soportados; el ajuste se centra en la modalidad visual y acciones, no en calidad lingüística multilingüe.
- Límite de contexto: aunque el base soporte contexto largo, el entrenamiento descarta secuencias de más de 32.768 tokens, por lo que más allá de ese umbral el rendimiento decae sin garantía.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su comportamiento real.
- Uso responsable en juegos en línea: aplicar agentes automatizados puede infringir los términos de servicio de plataformas multijugador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ray2333/Qwen3.5-4B-game-sft-lora-r64-step3000
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint previo del mismo autor (paso 1000, datos completos): https://huggingface.co/Ray2333/Qwen3.5-4B-game-sft-lora-r64-step1000-fulldata/discussions
- Adaptador LoRA general de Qwen3.5-4B (UIUC Kang Lab): https://huggingface.co/uiuc-kang-lab/Qwen3.5-4B-general-LoRA-r64
- Receta de fine-tuning LoRA de Qwen3.5-4B en Axolotl (GitHub): https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- Guía de fine-tuning de Qwen3.5-4B con LoRA en ROCm (GitHub): https://github.com/datawhalechina/hello-rocm/blob/master/docs/en/02-fine-tune/qwen3.5/qwen3.5-4b-lora-swanlab.md
- Ficha del modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-4B
