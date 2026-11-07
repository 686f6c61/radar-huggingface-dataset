# MaxW3n/capri-steering

## Resumen

Capri steering vector es un artefacto de activación (activation steering) publicado por el usuario MaxW3n que modifica el comportamiento del modelo base `mlx-community/Qwen3.8-27B-4bit` para que responda con la voz del personaje Capri de la serie *Cyberpunk: Edgerunners*. No es un modelo entrenado de forma convencional ni un fine-tune: el repositorio contiene un único vector de 5.120 números en coma flotante que se suma al estado oculto del modelo tras la capa 20 durante la generación, dejando intactos todos los pesos originales. El resultado es un cambio de estilo y personalidad sin reentrenar el modelo base.

La técnica empleada es activation steering (o representation engineering): se aprende una dirección en el espacio latente mediante descenso de gradiente sobre la entropía cruzada de respuestas cortas escritas en el estilo del personaje. El vector se escala por un factor ("dose") de 0,74 por defecto y se aplica en cada paso de decodificación. Esto lo convierte en una herramienta interesante para investigadores que quieran experimentar con control de estilo ligero, reversible y de bajo coste computacional, sin necesidad de GPU ni de infraestructura de entrenamiento.

El repositorio incluye además un script de chat en terminal (`capri_chat.py`) que carga el modelo base, adjunta el vector y aplica dos correcciones de generación para ocultar fugas de identidad del modelo original. Está pensado para ejecutarse en Mac con Apple Silicon y unos 20 GB de memoria libre. Es un proyecto de fan no oficial, con licencia Apache 2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vector de steering (5.120 floats) aplicado sobre un transformer Qwen3.8-27B (capa 20) |
| Parametros totales | 5.120 parámetros entrenables (el vector); el modelo base no se modifica |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | 4 bits (modelo base `Qwen3.8-27B-4bit`); el vector se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (vector); script Python para inferencia con MLX |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo sino un vector de dirección aprendido en el espacio de activaciones de la capa 20 del transformer Qwen3.8-27B. Durante la inferencia, cada estado oculto `h` tras la capa 20 se modifica según `h = h + 0.74 * capri_vector`, de modo que la intervención se aplica en cada token generado y afecta a todas las capas posteriores. El vector ya viene escalado al tamaño típico del estado oculto de la capa 20, por lo que la dosis 0,74 es un multiplicador adicional sobre esa escala.

El entrenamiento consistió en optimizar únicamente el vector (el resto de pesos congelados) mediante descenso de gradiente sobre la entropía cruzada de respuestas cortas escritas en la voz de Capri. Se realizó en tres etapas con warm-start sucesivo: primero preguntas cotidianas, luego las mismas más preguntas de identidad, y finalmente conversaciones multi-turno que incluían réplicas como "ur not capri?". Los tokens de contexto se pasaban por el modelo sin gradiente y la pérdida se calculaba solo sobre los tokens de respuesta. En cada etapa se conservó la época con menor pérdida de validación. No se emplearon RLHF ni DPO; la señal de entrenamiento es puramente supervisada sobre texto de estilo.

## Capacidades

- Generación de texto conversacional con un estilo de personaje concreto (voz de Capri), sin system prompt ni pesos modificados.
- Control ajustable de la intensidad del estilo mediante el parámetro `--dose` (0,5 produce una voz más suave; 0,74 es el valor por defecto).
- Conversación multi-turno: el modelo fue entrenado en la tercera etapa con diálogos de varios turnos, incluyendo réplicas de cuestionamiento de identidad.
- Intervención reversible: al no modificarse los pesos, basta con no aplicar el vector para recuperar el comportamiento original del modelo base.
- Inferencia local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- No soporta tool calling, function calling, visión, audio ni modos de razonamiento explícito (no documentado en la información disponible).
- Capacidades multilingües: no documentadas; el entrenamiento del vector se realizó sobre respuestas en inglés.

## Casos de uso

- Investigación en activation steering: servir como ejemplo reproducible y mínimo de cómo aprender una dirección de estilo sobre un transformer de 27B con un único parámetro vectorial, útil para estudiar representaciones internas y control de comportamiento.
- Prototipado de personajes conversacionales: permite evaluar rápidamente si un personaje "funciona" en diálogo antes de invertir en un fine-tune completo, con un coste de entrenamiento de un solo vector.
- Experimentos de control de dosis: el parámetro `--dose` permite estudiar la relación entre la magnitud de la intervención y la coherencia/estilo de las respuestas, un caso de estudio útil en interpretabilidad.
- Demos locales en Mac: el script de chat en terminal permite desplegar una demo de personaje en un portátil Apple Silicon con ~20 GB de memoria libre, sin infraestructura cloud.
- Comparación de metodologías de personalización: útil para contrastar activation steering frente a fine-tuning completo, LoRA o system prompts en términos de coste, reversibilidad y fidelidad de estilo.
- Educación y divulgación: ejemplo didáctico de representación engineering para talleres o artículos sobre cómo se puede modular el comportamiento de un LLM sin tocar sus pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas cualitativas internas: en una prueba de 60 preguntas, evaluadores marcaron aproximadamente el 8% de las respuestas como incorrectas; el modelo dice llamarse "Capri" aproximadamente el 35% de las veces cuando se le pregunta sin contexto; y alrededor del 1% de las respuestas de identidad filtran "Qwen" del modelo base.

## Requisitos de hardware

- Memoria: aproximadamente 20 GB de memoria libre en Mac con Apple Silicon para ejecutar el modelo base cuantizado a 4 bits (~15 GB de descarga) junto con el vector y el runtime.
- GPU: no requiere GPU dedicada; está diseñado para MLX en Apple Silicon. Para otras plataformas habría que portar la lógica de intervención al runtime correspondiente (no documentado).
- Cabe en GPUs de consumo solo si se adapta la intervención a otro backend; el repositorio no incluye implementación para CUDA, vLLM, llama.cpp, Ollama ni TGI.
- Despliegue: script `capri_chat.py` con `mlx-lm`, `safetensors` y `huggingface_hub`; primera ejecución descarga el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Capri steering vector | Vector de steering sobre Qwen3.8-27B-4bit | 5.120 (vector) | no disponible | Apache 2.0 | Hugging Face (MLX) |
| Fine-tune completo de personaje | Modelo entrenado | ~27B | no disponible | según base | requiere entrenamiento |
| LoRA de personaje | Adaptador de bajo rango | no disponible | no disponible | según base | Hugging Face (PEFT) |
| System prompt de personaje | Sin entrenamiento | 0 | el del modelo base | la del modelo base | inmediata |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Identidad inestable: el vector no aprende de forma fiable el nombre del personaje; solo acierta "Capri" en torno al 35% de las preguntas de identidad sin contexto y menos en mitad de una conversación.
- Fuga de identidad del modelo base: aproximadamente el 1% de las respuestas de identidad dicen "Qwen". El script lo oculta moviendo la probabilidad del token "Q" a "Cap" y forzando "ri", además de bloquear "Alibaba"; es un parche externo, no aprendido por el vector.
- Bucles de despedida: tras decir "Bye" una vez, cerca del 10% de las respuestas posteriores también son despedidas (frente al 1% basal); con dosis 0,5 baja al 3%.
- Precisión factual: evaluadores marcaron alrededor del 8% de respuestas como incorrectas en una prueba de 60 preguntas; el vector no mejora el conocimiento factual del modelo base.
- Idioma: el entrenamiento del vector se hizo sobre respuestas en inglés; el comportamiento en castellano no está documentado.
- Licencia: Apache 2.0 heredada del modelo base Qwen; el proyecto es un trabajo de fan no oficial y no está afiliado a los creadores del personaje, lo que puede afectar al uso comercial del personaje en sí.
- Producción: no es un artefacto pensado para despliegue en producción; carece de soporte para tool calling, agentes y backends de servido estándar.

## Enlaces

- Hugging Face: https://huggingface.co/MaxW3n/capri-steering
- Modelo base: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Proyecto relacionado en GitHub: https://github.com/chunkserviceenhance/Capri-AI
- Proyecto relacionado en itch.io: https://sigmasheron.itch.io/capri-ai
