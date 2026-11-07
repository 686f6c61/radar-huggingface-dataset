# botp/ReAligned-Classifier

## Resumen

ReAligned Classifier es un modelo de clasificación de texto derivado de meta-llama/Llama-3.2-1B, desarrollado por Eric Hartford y Quixi.ai. Su función es determinar si la respuesta de un asistente de IA presenta un encuadre sesgado hacia China o hacia Occidente, teniendo en cuenta el prompt que la provocó. Emplea la arquitectura LlamaForSequenceClassification con dos clases de salida (China-biased y Western-biased) y devuelve probabilidades calibradas utilizables como señal de recompensa continua.

El modelo se ha afinado completamente sobre aproximadamente 1,5 millones de ejemplos etiquetados durante una única época, con una longitud mediana de secuencia de 1.034 tokens y una ventana de contexto declarada de 128k tokens. Su relevancia actual radica en que permite alinear modelos de lenguaje a lo largo del eje de sesgo China-Occidente dentro de pipelines de RLHF o GRPO, un caso de uso poco cubierto por los clasificadores de sesgo convencionales.

Con 1.235.818.496 parámetros y pesos en BF16, es lo bastante ligero para ejecutarse en una sola GPU y actuar como componente de evaluación en tiempo de entrenamiento o de inferencia. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque el modelo base Llama 3.2 impone sus propias condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForSequenceClassification (transformer decoder-only con cabeza de clasificación) |
| Parametros totales | 1.235.818.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (declarada); en el ejemplo de uso se trunca a 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Llama-3.2-1B, un transformer decoder-only, al que se le sustituye la cabeza de generación por una cabeza de clasificación de secuencia con dos etiquetas. El ajuste es completo (full fine-tune), no basado en adaptadores, y se ejecutó durante una época sobre 1.519.759 ejemplos, de los cuales 1.443.771 se destinaron a entrenamiento y 75.988 a test. Cada ejemplo se formatea como `PROMPT: {prompt}\nRESPONSE: {respuesta}`, una decisión de diseño explícita: incluir el prompt permite detectar sesgo dependiente del contexto, como negativas de censura que serían neutras en otro contexto.

Los hiperparámetros documentados incluyen learning rate de 2e-5, batch efectivo de 256 (32 por dispositivo en 8 GPUs), acumulación de gradientes de 1 paso, 280 pasos de warmup, scheduler coseno, weight decay de 0.01, optimizador AdamW y precisión mixta BF16. El entrenamiento se realizó sobre 8 aceleradores AMD MI300X. No se especifica en la información disponible si hubo etapas de RLHF, DPO ni qué composición exacta tuvo el corpus de etiquetado.

## Capacidades

- Clasificación binaria de encuadre geopolítico: distingue entre respuestas con sesgo pro-China y respuestas con sesgo pro-Occidente.
- Salida de probabilidades calibradas mediante softmax sobre los logits, apta como señal de recompensa continua (P(western) cercano a 1.0 indica encuadre occidental; cercano a 0.0, encuadre chino; en torno a 0.5, ambiguo o neutro).
- Detección de sesgo dependiente del contexto gracias a la inclusión del prompt en la entrada, incluyendo negativas de censura sobre temas sensibles.
- Procesamiento de respuestas largas: el modelo está optimizado para respuestas de aproximadamente 1.000 tokens y admite entradas de hasta 128k tokens.
- Integración con la librería transformers mediante `AutoModelForSequenceClassification` y compatibilidad con text-embeddings-inference y endpoints.
- No soporta tool calling, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un clasificador.

## Casos de uso

- Señal de recompensa en RLHF/GRPO: el clasificador se integra como función de recompensa que penaliza o premia el encuadre geopolítico de las respuestas generadas, permitiendo orientar el comportamiento de un modelo de lenguaje hacia una perspectiva configurable.
- Evaluación de sesgo en producción: se puede ejecutar como paso de auditoría sobre las respuestas de un asistente desplegado, registrando la distribución de P(western) para detectar derivas de encuadre a lo largo del tiempo.
- Filtrado de datos de entrenamiento: clasificar grandes corpus de pares prompt-respuesta antes de usarlos en fine-tuning, descartando o reequilibrando ejemplos con encuadre extremo según los requisitos del proyecto.
- Monitorización de censura en asistentes: al incluir el prompt, el modelo detecta negativas de censura sobre temas sensibles (por ejemplo, Tiananmen o Xinjiang) que un detector de rechazos genérico clasificaría erróneamente como neutras.
- Investigación en alineación: comparar el encuadre de distintos modelos ante un mismo conjunto de prompts para estudiar cómo los datos de entrenamiento y las políticas de moderación moldean la presentación de temas geopolíticos.
- Control de calidad en pipelines de generación aumentada: verificar que las respuestas de un sistema RAG sobre noticias internacionales no reproducen de forma acrítica narrativas estatales o mediáticas de un solo lado.
- A/B testing de políticas de moderación: cuantificar el efecto de distintos system prompts o filtros sobre la distribución de encuadre de las respuestas, usando la probabilidad continua como métrica comparable entre configuraciones.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas internas de evaluación del propio autor sobre el conjunto de test de 75.988 ejemplos:

| Metrica | Valor |
|---|---|
| Precision global | 99,8 % |
| Precision clase China-biased | 99,9 % |
| Precision clase Western-biased | 99,8 % |
| Eval loss | 0,003 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con clasificadores de sesgo alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,5 GB para los pesos (el repositorio ocupa 2,5 GB), más memoria para activaciones y KV cache según la longitud de entrada; en la práctica, entre 4 y 8 GB para secuencias de hasta 2.048 tokens.
- En FP16/BF16 cabe holgadamente en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090.
- Para lotes grandes o secuencias cercanas a la longitud máxima declarada, se recomiendan A100, H100 o MI300X; el autor entrenó con 8 AMD MI300X.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, text-embeddings-inference (etiqueta presente en el repositorio) y endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no es directamente desplegable en llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 1,24B parámetros con una sola pasada forward, el coste por ejemplo es bajo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| botp/ReAligned-Classifier | 1,24B | 128k (declarado) | Clasificación de sesgo China/Occidente | Apache 2.0 | Hugging Face (0 descargas) |
| QuixiAI/ReAligned-Classifier | 1,24B | 128k (declarado) | Clasificación de sesgo China/Occidente | Apache 2.0 | Hugging Face (repositorio original del autor) |
| NousResearch/Minos-v1 | no disponible | no disponible | Detección de rechazos (refusals) | no disponible | Hugging Face |
| meta-llama/Llama-3.2-1B | 1,24B | 128k | Generación de texto | Llama 3.2 Community License | Hugging Face |

La comparación con Minos-v1 es pertinente porque el propio autor la menciona como alternativa para clasificación de rechazos, tarea distinta pero relacionada. Frente a Llama-3.2-1B, este modelo comparte arquitectura y tamaño pero sustituye la generación por clasificación. No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre sesgo político relacionado con China; no generaliza a otros tipos de sesgo (género, raza, religión, etc.).
- Optimizado para respuestas largas de aproximadamente 1.000 tokens; el rendimiento en respuestas muy cortas (menos de 50 tokens) es menos fiable según el autor.
- No es un detector de rechazos: una negativa a responder puede clasificarse como sesgo chino solo si el prompt es sensible, pero la tarea de refusal classification requiere herramientas específicas como Minos-v1.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación, especialmente en textos ambiguos o irónicos.
- La definición de "sesgo" es normativa y controvertida: el modelo aprende a etiquetar como sesgo chino la adopción de narrativas estatales chinas y como sesgo occidental la adopción de marcos mediáticos occidentales, lo que puede penalizar perspectivas legítimas según el contexto de uso.
- Usar el modelo como recompensa RL puede enseñar al modelo entrenado a favorecer un encuadre u otro según la configuración; el autor advierte explícitamente de este efecto.
- Licencia Apache 2.0 en el repositorio, pero el modelo base Llama 3.2 está sujeto a la Llama 3.2 Community License, que impone restricciones adicionales (por ejemplo, cláusula de 700 millones de usuarios mensuales y políticas de uso aceptable) que conviene revisar antes de un despliegue comercial.
- El repositorio botp/ReAligned-Classifier registra 0 descargas y 0 likes en el momento de la consulta, y no se documentan idiomas soportados; la validación independiente es inexistente.
- El ejemplo de código de la model card apunta a `QuixiAI/ReAligned-Classifier`, no al identificador de este repositorio, por lo que hay que ajustar el `model_id` al usarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/botp/ReAligned-Classifier
- Repositorio original del autor: https://huggingface.co/QuixiAI/ReAligned-Classifier
- Réplica de terceros: https://huggingface.co/suryatmodulus/ReAligned-Classifier
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Clasificador de rechazos mencionado por el autor: https://huggingface.co/NousResearch/Minos-v1
