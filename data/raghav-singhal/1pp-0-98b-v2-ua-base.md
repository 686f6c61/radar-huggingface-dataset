# Raghav-Singhal/1pp-0.98b-v2-ua-base

## Resumen

1pp-0.98b-v2-ua-base es un modelo de lenguaje de 981.545.472 parámetros (0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la formulación de los datos de entrenamiento (conversaciones reescritas frente a documentos crudos) y la función de pérdida (sobre turnos de usuario y asistente frente a solo asistente) a las capacidades del modelo resultante.

El modelo pertenece a la "escalera" v2 del proyecto, que cruza cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) con tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234). Cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos, de modo que las diferencias entre modelos son atribuibles únicamente al texto de los documentos y a la máscara de pérdida, o a la inicialización de parámetros en el caso de las semillas.

La arquitectura es un decoder estilo Llama de 24 capas con 1.536 dimensiones ocultas, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. La relevancia de esta ficha es acotada: se trata de un checkpoint base de investigación con cero descargas y cero likes en el momento de la consulta, útil para reproducibilidad experimental y para estudiar metodologías de preentrenamiento, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con text-generation-inference y endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 128, lo que supone una compartición de KV (GQA) de factor 3. Emplea RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ninguna normalización QK. La longitud máxima de secuencia es de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre las conversaciones del corpus 1PP reescritas a partir de los documentos originales, con pérdida aplicada tanto a los turnos de usuario como a los de asistente (condición "ua"). Se cubrieron los primeros 18.779 pasos del flujo alineado por pasos del estudio principal (39,38B posiciones de token), con batch global de 512 secuencias × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador combina Muon (escalado por forma, LR matricial 0,005) para los parámetros matriciales y Adam para el resto (LR 2,3e-3 en embeddings y capa de salida, 3e-3 en normas), con warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0103 y precisión bf16. La pérdida de validación final sobre 2.433 documentos retenidos es de 1,534 en texto de asistente, 1,429 en texto de usuario y 3,246 en texto de documento; la columna ponderada por la proporción de conversaciones adversarias en entrenamiento (11,18%) da 1,529.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML (sin turno de sistema, ya que el modelo nunca vio uno durante el entrenamiento).
- Producción de texto con formato de chat gracias a la condición de conversaciones reescritas; el template incluido renderiza exactamente el formato visto en entrenamiento.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card y los metadatos del repositorio.
- No es un modelo ajustado con instrucciones ni con RLHF/DPO: es un checkpoint base.

## Casos de uso

- Reproducibilidad de experimentos de preentrenamiento: el modelo permite recalcular las pérdidas de validación publicadas (1,5322 en val50m segmentos [3] y 3,2472 en raw_val50m segmentos [8]) y verificar la equivalencia entre el checkpoint Hugging Face y el de Megatron, con diferencias absolutas de 0,0013 y 0,0016 respectivamente.
- Estudio de ablación de condiciones de datos: al compartir flujo de datos y pasos con los otros peldaños de la escalera (0,58B, 1,66B y 2,81B) y con las otras dos condiciones, sirve para aislar el efecto de la reescritura conversacional y de la máscara de pérdida sobre las métricas de validación.
- Análisis de semillas: junto con las variantes de semilla 42 y 1234, permite medir la varianza de inicialización manteniendo idéntico el orden de batches.
- Investigación sobre formato conversacional: al haber sido entrenado con ChatML sin turno de sistema, es útil para estudiar cómo el modelo aprende la estructura de diálogo sin instrucciones explícitas de sistema.
- Generación de texto en inglés con ventana de 4.096 tokens para tareas de continuación o experimentos controlados de prompting, siempre asumiendo que no es un asistente alineado.
- Base para ajuste fino supervisado posterior en proyectos de investigación que quieran partir de un checkpoint con licencia permisiva y trazabilidad completa de hiperparámetros y datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación por token sobre 2.433 documentos retenidos (asistente 1,534; usuario 1,429; documento 3,246; ponderada por conversaciones adversarias 1,529) y las comprobaciones de verificación frente al checkpoint de Megatron. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (el repositorio ocupa 2,0 GB), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para secuencias de 4.096 tokens con batch pequeño.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors. En 8 bits los pesos rondarían 1 GB y en 4 bits unos 0,5 GB, aunque estos valores son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4080, 4090) es suficiente para inferencia en bf16 o fp16; para entrenamiento o ajuste fino conviene una A100 o H100 por el coste de memoria de optimizador y activaciones.
- Cabe holgadamente en GPU consumer: con 0,98B de parámetros es uno de los tamaños que se ejecutan sin dificultad en tarjetas de gama media.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en los metadatos). No se documentan integraciones específicas con vLLM, llama.cpp u Ollama, aunque al ser un decoder Llama estándar deberían ser adaptables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-ua-base | 0,98B | 4.096 | Apache 2.0 | Checkpoint base de investigación, solo inglés, sin benchmarks publicados |
| 1pp-0.58b-v2-* | 0,58B | 4.096 | Apache 2.0 | Peldaño inferior de la misma escalera, mismo flujo de datos y pasos |
| 1pp-1.66b-v2-* | 1,66B | 4.096 | Apache 2.0 | Peldaño superior de la escalera; corresponde al conjunto de modelos de 1,7B del estudio principal |
| 1pp-2.81b-v2-* | 2,81B | 4.096 | Apache 2.0 | Peldaño máximo de la escalera v2 |

La comparación más directa es interna al proyecto 1PP, ya que los cuatro tamaños comparten tokenizador, flujo de datos alineado por pasos y presupuesto de 20,3 tokens de asistente por parámetro. No se dispone de datos de benchmarks que permitan comparar con modelos externos de tamaño similar como SmolLM2-1.7B, Qwen2.5-1.5B o Llama-3.2-1B; cualquier comparación de rendimiento con ellos sería especulativa.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB), no como un modelo listo para uso conversacional.
- Es un modelo base sin ajuste por instrucciones, sin RLHF ni DPO; las respuestas no están alineadas con preferencias humanas.
- Solo soporta inglés según la model card y los metadatos; no hay evidencia de capacidades multilingües.
- Contexto limitado a 4.096 tokens, inferior al de muchos modelos actuales de tamaño similar.
- No se han publicado evaluaciones de sesgos, toxicidad o robustez; se desconoce el riesgo de alucinación en tareas abiertas.
- El formato de chat no incluye turno de sistema, por lo que prompts con rol de sistema pueden degradar el comportamiento.
- Ausencia total de benchmarks públicos: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K) que permita evaluar su calidad frente a alternativas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero al ser un checkpoint de investigación sin garantías, su uso en producción requeriría una evaluación propia exhaustiva.
- Cero descargas y cero likes en el momento de la consulta, lo que indica que no ha pasado por validación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
