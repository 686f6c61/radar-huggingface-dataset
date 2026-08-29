# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-45000

## Resumen

El repositorio `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-45000` contiene un checkpoint de un modelo auxiliar de decodificación especulativa (draft model) entrenado con el método EAGLE3 sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Este modelo no es un chatbot independiente; su única función es acelerar la inferencia del modelo base mediante predicción especulativa de tokens, generando propuestas que el modelo objetivo verifica en paralelo. El autor, `huluhuluu`, publica 47 checkpoints de un entrenamiento de 10 épocas, y este repositorio corresponde al paso 45.000 de la primera época.

La relevancia de este modelo radica en su tamaño reducido (202,7 millones de parámetros) y en su arquitectura ligera de una sola capa decoder, diseñada para ejecutarse junto al modelo Qwen3-4B-Instruct-2507 en servidores de inferencia con SGLang. Al emplear una ventana deslizante de atención de 512 tokens, el modelo de borrador reduce el coste computacional de la decodificación especulativa, lo que puede mejorar el throughput de peticiones en entornos de producción con alta concurrencia. Está publicado bajo licencia Apache 2.0 y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención causal con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (máximo de entrenamiento); ventana deslizante efectiva de 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 nativos) |
| Idiomas soportados | no disponible (el modelo base Qwen3-4B-Instruct-2507 es multilingüe; el entrenamiento del borrador usó ShareGPT) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura `LlamaForCausalLMEagle3`, que es una adaptación del esquema EAGLE3 para decodificación especulativa. Consta de una única capa decoder con tamaño oculto de 2560, dimensión intermedia de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario del borrador es de 32.000 tokens, mientras que el del modelo objetivo es de 151.936, por lo que el modelo de borrador proyecta sus salidas al espacio de vocabulario del modelo base. Los pesos están en bfloat16 y la atención utiliza la implementación `sdpa` (scaled dot-product attention) con una ventana deslizante causal de 512 tokens.

El entrenamiento se realizó con el método online EAGLE3 mediante SpecForge, sobre un dataset ShareGPT limpio (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231.810 pasos de optimizador, tamaño de lote efectivo de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y posterior decaimiento coseno, y una longitud máxima de secuencia de 2048 tokens. El backend objetivo fue SGLang con FlashInfer, y no se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Aceleración de inferencia del modelo `Qwen/Qwen3-4B-Instruct-2507` mediante decodificación especulativa EAGLE3, reduciendo el número de pasos secuenciales de decodificación.
- Generación de borradores de tokens con ventana deslizante de 512 tokens, lo que limita el coste de atención a un contexto reciente.
- Compatibilidad con el backend SGLang y su configuración de decodificación especulativa (ruta de borrador).
- No es un modelo de chat, no genera texto útil de forma autónoma, ni soporta tool calling, agentes, visión o audio.

## Casos de uso

- Despliegue de inferencia de alto throughput para Qwen3-4B-Instruct-2507: el modelo se integra como ruta de borrador en SGLang, permitiendo servir más peticiones concurrentes con menor latencia por token.
- Reducción de coste por petición en APIs de chat: al acelerar la decodificación, se reduce el tiempo de ocupación de GPU, lo que abarata el servicio en entornos con carga sostenida.
- Evaluación de configuraciones de árbol de decodificación especulativa: los checkpoints permiten experimentar con distintos tamaños de árbol y políticas de aceptación para optimizar el equilibrio entre precisión y velocidad.
- Entornos con GPU limitada: al ser un modelo de solo 202M parámetros, puede ejecutarse en la misma GPU que el modelo objetivo sin necesidad de hardware adicional, facilitando su adopción en clústeres existentes.
- Investigación en decodificación especulativa: el repositorio incluye `training_state.pt` con el estado del optimizador, útil para reanudar entrenamientos o analizar el comportamiento del modelo de borrador en diferentes pasos.
- Migración desde modelos de borrador más grandes: al ser un checkpoint de la primera época, permite comparar la progresión del entrenamiento y decidir si un borrador más entrenado (épocas posteriores) justifica el coste de almacenamiento y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. No se pueden comparar cifras de MMLU, HumanEval, GSM8K u otros estándares con este modelo, ya que su función es auxiliar y no de razonamiento autónomo.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 0,4 GB en bfloat16, por lo que cabe en cualquier GPU con al menos 1 GB de memoria libre. Sin embargo, al ser un borrador del Qwen3-4B-Instruct-2507, debe ejecutarse junto al modelo objetivo, que requiere unos 8-10 GB en cuantización ligera o 16 GB en bf16.
- GPU recomendadas: cualquier GPU con soporte para bfloat16 y suficiente memoria para el par borrador+objetivo. Ejemplos: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs consumer de 8 GB, el modelo objetivo debería cuantizarse (por ejemplo, a 4 bits) para dejar espacio al borrador.
- Opciones de despliegue: SGLang con backend FlashInfer es el entorno soportado por el autor. No se menciona compatibilidad con vLLM, llama.cpp u Ollama para este checkpoint específico.
- Latencia y throughput: no disponibles. El rendimiento depende de la configuración del árbol de decodificación especulativa y de la tasa de aceptación del modelo objetivo, que no se ha medido públicamente.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de borrador EAGLE3 para Qwen3-4B-Instruct-2507 en la información proporcionada. Como referencia general, los draft models de EAGLE suelen tener entre el 5% y el 10% de los parámetros del modelo objetivo, y este caso (202M frente a 4B) se ajusta a esa proporción. Alternativas teóricas serían los borradores generados con el método Medusa o con decodificación especulativa clásica, pero no se han encontrado repositorios comparables con métricas publicadas.

## Limitaciones y advertencias

- No es un modelo de chat: intentar usarlo como un LLM independiente producirá salidas sin sentido. Debe emparejarse exclusivamente con `Qwen/Qwen3-4B-Instruct-2507`.
- Ventana deslizante limitada: el borrador solo considera los últimos 512 tokens, por lo que su precisión puede degradarse en contextos donde las dependencias de largo alcance son críticas.
- Entrenamiento con ShareGPT: el dataset puede contener sesgos inherentes a conversaciones reales de usuarios, y no se ha filtrado por idioma. El rendimiento en idiomas distintos del inglés podría ser inferior.
- Sin métricas de seguridad: no se realizaron evaluaciones de sesgo, toxicidad ni alineación durante el entrenamiento.
- Estado de entrenamiento sensible: el archivo `training_state.pt` contiene el estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- Soporte limitado de frameworks: el entrenamiento y la inferencia están pensados para SGLang; no hay garantía de compatibilidad con otros servidores de inferencia.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-1-step-45000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial de EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Ficha del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Otros checkpoints de la misma serie (por ejemplo): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-1-step-25000
