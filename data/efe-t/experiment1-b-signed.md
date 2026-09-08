# efe-T/Experiment1-B-Signed

## Resumen

Experiment1-B-Signed es un experimento de preentrenamiento continuo desarrollado por efe-T, que parte de una inicialización aleatoria y recorre en una única pasada monotónica el corpus FineWeb-Edu 10B GPT-2. El modelo utiliza una arquitectura GPT-2 modificada con una atención basada en productos escalares firmados (signed dot products) divididos por `1 + sum(abs(scores))`, sin softmax, junto con una activación entrenable xIELU y un MLP de tipo latent_gated. El repositorio contiene código PyTorch personalizado y pesos en formato safetensors, pero no es un modelo compatible con la API estándar de Transformers.

En el momento de la publicación de la ficha, el entrenamiento figura como en ejecución con 0 tokens procesados de los 9.851.371.520 previstos, por lo que el modelo no ha completado ninguna fase de aprendizaje y no puede utilizarse para tareas reales. Su interés radica en la exploración de mecanismos de atención alternativos al softmax, aunque todavía no existen resultados que validen su comportamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 modificado (atención con productos escalares firmados, sin softmax; activación xIELU; MLP latent_gated) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (ventana progresiva desde 2.304) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos del modelo) y checkpoints PyTorch |

## Arquitectura y entrenamiento

La arquitectura parte de un GPT-2, pero introduce una modificación significativa en la atención: los productos escalares entre consultas y claves se dividen por `1 + sum(abs(scores))`, eliminando por completo la operación softmax. Esto implica que la distribución de atención no está normalizada de forma convencional. Además, la activación es una xIELU entrenable y el MLP utiliza un diseño latent_gated, ambos detalles documentados en la configuración del entrenamiento.

El entrenamiento está planificado sobre el corpus FineWeb-Edu 10B GPT-2, con un total de 9.851.371.520 tokens y 18.790 pasos de optimización. Cada paso procesa 524.288 tokens. El dataset se compone de 300.645 secuencias utilizables, de las cuales 300.640 se emplean en el entrenamiento, dejando 5 que no completan un paso completo. El estado del optimizador y los parámetros se mantienen en FP32, mientras que el forward utiliza autocast en BF16. La tasa de aprendizaje es constante sin warmup y con un único cooldown en los últimos 3.152 pasos del dataset. Se publican checkpoints cada 250.000.000 de tokens procesados. La validación se realiza sobre un prefijo fijo de 4 x 2.048 tokens cada 100 actualizaciones.

## Capacidades

- El modelo se encuentra en estado de preentrenamiento con 0 tokens procesados, por lo que no se pueden evaluar capacidades funcionales.
- No se dispone de resultados de generación de texto, razonamiento, generación de código, matemáticas, tool calling, soporte de agentes ni capacidades multilingües.
- La arquitectura está diseñada para generación de texto autoregresiva, pero no existen métricas ni ejemplos que demuestren su funcionamiento.
- No se ha documentado soporte de vision, audio ni modos de razonamiento especiales.

## Casos de uso

No aplicable. Al no haber completado ninguna fase de entrenamiento, no existen casos de uso reales documentados para este modelo. Cualquier aplicación práctica requeriría finalizar el preentrenamiento y validar su comportamiento, algo que actualmente no ha ocurrido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Además, el modelo no ha procesado tokens, por lo que no existe rendimiento medible ni comparaciones con otros modelos.

## Requisitos de hardware

- El entrenamiento documentado se ejecuta en una NVIDIA A100-SXM4-40GB.
- No se especifican requisitos de VRAM para inferencia.
- No se dispone de datos de latencia ni throughput.
- El modelo no es un drop-in de Transformers, por lo que requiere código personalizado para cargarlo y ejecutarlo.
- No se mencionan opciones de despliegue compatibles como vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Estado | Licencia |
|---|---|---|---|---|
| efe-T/Experiment1-B-Signed | GPT-2 modificado con atención firmada, sin softmax | 8.192 tokens | En ejecución, 0 tokens procesados | no disponible |
| efe-T/Experiment1-B | GPT-2 modificado (sin la variante Signed) | no disponible | no disponible | no disponible |
| GPT-2 estándar | Transformer decoder | 1.024 tokens (original) | Entrenado | MIT (original) |

No se dispone de benchmarks que permitan comparar rendimiento entre estos modelos. La comparativa se limita a diferencias arquitectónicas y de estado de entrenamiento.

## Limitaciones y advertencias

- El entrenamiento está en curso y no ha procesado ningún token; el modelo no es utilizable para ninguna tarea.
- No es un modelo drop-in de Transformers: requiere código personalizado para cargar los pesos y ejecutar la arquitectura.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial.
- No se han documentado idiomas soportados, sesgos conocidos ni riesgo de alucinación.
- La atención sin softmax es una modificación experimental cuyas propiedades numéricas y de estabilidad no están validadas.
- El autor advierte que el cursor monotónico evita repetir ventanas de entrenamiento ya comprometidas, pero no establece que el corpus carezca de texto duplicado.
- El trabajo posterior al último checkpoint durable puede recomputarse tras una desconexión de Colab, según la documentación del autor.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/efe-T/Experiment1-B-Signed
- Modelo relacionado Experiment1-B: https://huggingface.co/efe-T/Experiment1-B
- Dataset mencionado en la configuración: kjj0/finewebedu10B-gpt2 (sin URL directa en la información disponible)
