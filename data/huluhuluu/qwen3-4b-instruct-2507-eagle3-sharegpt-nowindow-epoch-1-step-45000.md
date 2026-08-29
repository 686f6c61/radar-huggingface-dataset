# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-45000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-45000` es un modelo de borrador (draft model) diseñado para decodificación especulativa con el algoritmo EAGLE3, destinado a acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es generar propuestas de tokens que el modelo principal valida, reduciendo la latencia por token en entornos de servicio como SGLang. Ha sido desarrollado por el usuario de HuggingFace `huluhuluu` como parte de un entrenamiento online con SpecForge, y se publica bajo licencia Apache 2.0.

Este checkpoint concreto corresponde al paso 45.000 de la época 1 de un entrenamiento de 10 épocas (231.810 pasos totales). El modelo tiene 202,7 millones de parámetros, una sola capa de decoder, y está pensado para funcionar con la familia exacta del modelo objetivo. Su relevancia radica en que permite desplegar Qwen3-4B-Instruct-2507 con una aceleración significativa sin necesidad de modificar el modelo principal, aprovechando la especulación de tokens con un overhead de VRAM mínimo (menos de 0,5 GB en bf16).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, EAGLE3) |
| Parametros totales | 202.700.416 |
| Parametros activos | 202.700.416 (modelo denso, no MoE) |
| Longitud de contexto | 2048 (máximo de secuencia durante entrenamiento) |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible (el entrenamiento usa ShareGPT, que según la documentación de EAGLE elimina datos no ingleses; el modelo objetivo Qwen3-4B-Instruct-2507 es multilingüe, pero el draft puede estar sesgado al inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que utiliza una única capa de transformer para predecir tokens futuros basándose en las características ocultas del modelo objetivo. En concreto, la configuración es: hidden size 2560, intermediate size 9728, 32 cabezas de atención, 8 cabezas de clave/valor, vocabulario de draft de 32.000 tokens y vocabulario objetivo de 151.936 tokens (el del modelo Qwen3). La atención se implementa con `sdpa` (scaled dot-product attention) y no se aplica ventana deslizante en esta variante (indicado como "NoWindow").

El entrenamiento se realizó con SpecForge (EAGLE3 online) sobre un dataset ShareGPT en formato JSONL (revisión no registrada). Los hiperparámetros principales incluyen: 10 épocas, 231.810 pasos de optimizador, batch efectivo de 4 (tamaño de batch por dispositivo 1, paralelismo de datos 4), tasa de aprendizaje 1e-4 con warmup lineal del 1,5% y decaimiento coseno, sin weight decay, gradiente máximo de norma 0,5, longitud máxima de secuencia 2048, y longitud TTT (test-time training) de 7 pasos. El backend objetivo es SGLang con FlashInfer, y el paralelismo tensorial es 1. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Generación de tokens especulativos: el modelo propone secuencias de tokens de alta probabilidad que el modelo objetivo Qwen3-4B-Instruct-2507 valida, acelerando la inferencia.
- Integración con SGLang: se usa como ruta de draft en el servidor SGLang con `--speculative-algorithm EAGLE3`, permitiendo configuración de pasos especulativos (por ejemplo, `--speculative-num-steps 3`, `--speculative-eagle-topk 1`, `--speculative-num-draft-tokens 4`).
- Compatibilidad con el modelo objetivo exacto: diseñado específicamente para `Qwen/Qwen3-4B-Instruct-2507`, no para otras variantes.
- No es un modelo de chat: no genera respuestas finales por sí mismo; solo produce borradores de tokens.
- Sin modo de pensamiento: el modelo objetivo Qwen3-4B-Instruct-2507 no incluye thinking mode, por lo que el draft tampoco lo contempla.
- Multilingüismo limitado: el dataset ShareGPT suele contener principalmente datos en inglés tras la limpieza, por lo que el draft puede ser menos eficaz en otros idiomas.

## Casos de uso

- Servicio de inferencia de Qwen3-4B-Instruct-2507 a gran escala: desplegar el modelo objetivo en SGLang con este draft como ruta especulativa reduce la latencia media por petición en cargas de trabajo de chat y generación de texto, manteniendo la calidad del modelo principal.
- Chatbots multiusuario en producción: cuando se atienden muchas peticiones concurrentes, la decodificación especulativa con EAGLE3 mejora el throughput y la capacidad de respuesta sin degradar la calidad percibida.
- Generación de código asistida: el modelo objetivo es fuerte en programación; el draft acelera la autocompletación de código en editores o pipelines de CI/CD, reduciendo el tiempo de espera del desarrollador.
- Razonamiento y matemáticas: en tareas de razonamiento multi-step, la aceleración especulativa permite explorar más tokens por segundo, útil en aplicaciones de tutoría o análisis automatizado.
- Evaluación de modelos y experimentación: los 47 checkpoints publicados (desde epoch 0 hasta epoch 9) permiten estudiar el impacto del entrenamiento del draft en la velocidad de inferencia a lo largo del tiempo, útil para investigación en decodificación especulativa.
- Despliegue en hardware limitado: al ser un modelo de solo 202M parámetros, puede ejecutarse en GPUs consumer junto al modelo base, haciendo viable la aceleración en entornos sin clústeres dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no se registraron métricas de evaluación ni de seguridad para este run". No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas, ni comparaciones de velocidad con otros métodos de decodificación especulativa.

## Requisitos de hardware

- VRAM estimada: el modelo de draft en bfloat16 ocupa aproximadamente 0,4 GB (según el tamaño del repositorio). Para inferencia especulativa, debe sumarse la VRAM del modelo objetivo Qwen3-4B-Instruct-2507 (aprox. 8 GB en bf16), resultando en unos 8,5-9 GB totales.
- GPU recomendadas: cualquier GPU con al menos 10 GB de VRAM, como RTX 3080/3090, RTX 4070/4080/4090, A10, A100, H100. Para producción con alta concurrencia se recomienda A100 o H100.
- Compatibilidad con GPU consumer: sí, cabe en una RTX 3090 o 4090 si se usa el modelo objetivo en bf16 o cuantizado (por ejemplo, con AWQ o GPTQ). El draft en sí es muy ligero.
- Opciones de despliegue: SGLang es el backend objetivo (con FlashInfer). También puede usarse vLLM si soporta EAGLE3, aunque la documentación oficial aquí se centra en SGLang. No se menciona compatibilidad con llama.cpp u Ollama para este draft model.
- Latencia y throughput: no disponibles en la documentación. Los valores de `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens` deben ajustarse según la carga de trabajo; la model card recomienda realizar benchmarks propios.

## Comparativa con modelos similares

No hay información suficiente para una comparativa cuantitativa con otros draft models. Se conocen las siguientes alternativas:

| Modelo | Parámetros | Modelo objetivo | Método | Licencia |
|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-45000 | 202,7M | Qwen3-4B-Instruct-2507 | EAGLE3 (SpecForge) | Apache 2.0 |
| MNN/Qwen3-4B-Instruct-2507-Eagle3 (ModelScope) | no disponible | Qwen3-4B-Instruct-2507 | EAGLE3 | no disponible |
| Otros checkpoints de la misma familia (47 en total) | 202,7M | Qwen3-4B-Instruct-2507 | EAGLE3 (SpecForge) | Apache 2.0 |

No se dispone de datos de rendimiento comparativo (latencia, throughput, aceptación de tokens) entre estas opciones.

## Limitaciones y advertencias

- No es un modelo autónomo: usarlo como modelo de chat o generación directa producirá resultados sin sentido. Solo funciona como borrador especulativo junto al modelo objetivo exacto.
- Sesgo de idioma: el entrenamiento con ShareGPT (que según la documentación de EAGLE-Qwen3 elimina datos no ingleses) puede reducir la eficacia del draft en idiomas distintos del inglés, aunque el modelo objetivo sea multilingüe.
- Sin métricas de seguridad: no se realizaron evaluaciones de sesgos, toxicidad o alucinación en el draft. El modelo no genera texto final, pero los tokens propuestos influyen en la salida del modelo principal.
- Limitación de contexto: la longitud máxima de secuencia de entrenamiento es 2048 tokens. Aunque el modelo objetivo soporta ventanas mayores, el draft puede degradarse más allá de ese límite.
- Dependencia de SGLang: la integración está optimizada para SGLang con FlashInfer; otros frameworks pueden no soportar este formato de draft.
- Riesgo de sobrescritura de la configuración: el archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- Sin garantías de rendimiento: los valores de configuración especulativa (pasos, topk, tokens) son puntos de partida; cada despliegue requiere ajuste empírico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-1-step-45000
- Checkpoints hermanos (colección): https://huggingface.co/huluhuluu (perfil del autor, contiene la colección de 47 checkpoints)
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Versión alternativa en ModelScope: https://www.modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-Eagle3
- Ficha del modelo objetivo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
