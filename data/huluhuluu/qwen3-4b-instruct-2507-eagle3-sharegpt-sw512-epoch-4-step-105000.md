# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-105000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-105000` es un modelo de borrador (_draft model_) para decodificación especulativa, diseñado para acelerar la inferencia del modelo de lenguaje `Qwen/Qwen3-4B-Instruct-2507`. Desarrollado por el usuario huluhuluu mediante entrenamiento online con el método EAGLE3 y la herramienta SpecForge, este checkpoint concreto corresponde al paso 105.000 de un total de 231.810 pasos de optimización, dentro de una serie de 47 checkpoints publicados en una colección asociada.

Con solo 202,7 millones de parámetros y una única capa de decoder, el modelo predice secuencias de tokens de forma especulativa para que el modelo objetivo (4.000 millones de parámetros) pueda validarlas en paralelo, reduciendo la latencia de generación. Aunque no es un modelo de chat independiente, su relevancia radica en que permite desplegar Qwen3-4B-Instruct-2507 con un rendimiento perceptiblemente superior en entornos de producción, especialmente cuando se combina con SGLang y backends como FlashInfer. La licencia Apache 2.0 facilita su uso comercial, pero requiere emparejarlo con el modelo base exacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, atención causal con ventana deslizante de 512 tokens) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (ventana deslizante del draft); el modelo base Qwen3-4B-Instruct-2507 tiene su propio contexto |
| Tipos de cuantizacion | bf16 (pesos originales); no se proporcionan cuantizaciones pregeneradas, aunque los safetensors permiten generarlas (GGUF, AWQ, etc.) |
| Idiomas soportados | No disponible en la model card; el dataset ShareGPT utilizado es principalmente inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que entrena un modelo de borrador ligero (una sola capa de decoder) para predecir varios tokens futuros a partir del contexto y del token actual. Concretamente, esta implementación usa `LlamaForCausalLMEagle3` con hidden size 2560, intermediate size 9728, 32 cabezas de atención y 8 cabezas clave/valor. La atención es causal con una ventana deslizante de 512 tokens, lo que limita el alcance del draft a contextos recientes y reduce el coste computacional.

El entrenamiento se realizó con el método online EAGLE3 y la herramienta SpecForge, sobre un dataset ShareGPT limpio (fuente local, sin revisión registrada). Se ejecutaron 10 épocas con un total de 231.810 pasos de optimización, batch global efectivo de 4, learning rate 1e-4 con warmup lineal del 1,5% y decaimiento coseno, sin weight decay. La longitud máxima de secuencia fue de 2048 tokens, y la longitud de TTT (test-time training) de EAGLE3 se fijó en 7 tokens. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Generación especulativa de tokens: el modelo produce secuencias de tokens candidatos que el modelo base valida en paralelo, acelerando la inferencia sin cambiar la distribución de salida final.
- Compatibilidad con SGLang: está diseñado para usarse como ruta de draft en SGLang con el backend FlashInfer, mediante la configuración de decodificación especulativa de EAGLE3.
- Integración con el modelo base Qwen3-4B-Instruct-2507: funciona únicamente con esta familia exacta de modelos, ya que el vocabulario del draft (32.000 tokens) es un subconjunto del vocabulario objetivo (151.936 tokens).
- Ligereza computacional: con solo 202M parámetros y una capa, el overhead de memoria y cómputo es mínimo en comparación con el modelo objetivo.
- No es un modelo de chat: no genera respuestas por sí mismo, ni soporta tool calling, razonamiento multi-paso ni capacidades multilingües de forma autónoma.

## Casos de uso

- Aceleración de inferencia en producción: desplegar el draft model junto con Qwen3-4B-Instruct-2507 en un servidor SGLang reduce la latencia de generación de texto en aplicaciones de chat, asistentes virtuales o generación de contenido, manteniendo la calidad del modelo base.
- Reducción de costes de infraestructura: al disminuir los tokens de inferencia necesarios para producir una respuesta, se reduce el tiempo de ocupación de GPU y, por tanto, el coste por petición en entornos cloud.
- Optimización de latencia en tiempo real: en servicios de streaming de respuestas (typing en vivo), la decodificación especulativa permite emitir tokens más rápido, mejorando la experiencia de usuario en chatbots y copilotos.
- Evaluación de técnicas de decodificación especulativa: investigadores pueden comparar el rendimiento de este checkpoint frente a otros de la misma serie (47 checkpoints) para estudiar el efecto del número de pasos de entrenamiento en la tasa de aceptación del draft.
- Despliegue en entornos con recursos limitados: el draft model ocupa solo ~0,4 GB en bf16, por lo que puede ejecutarse en la misma GPU que el modelo base sin necesidad de hardware adicional, incluso en GPUs de consumo con 12 GB de VRAM.
- Benchmarking de configuraciones de árbol (tree settings) en SGLang: permite probar distintos parámetros de decodificación especulativa (tamaño del árbol, número de candidatos) para ajustar la tasa de aceleración según la carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas de tasa de aceptación, aceleración relativa ni comparativas con otros draft models. Se recomienda realizar pruebas propias con la carga de trabajo objetivo para medir la mejora de latencia.

## Requisitos de hardware

- El draft model en sí tiene 202,7M parámetros en bf16, lo que ocupa aproximadamente 405 MB de VRAM. Puede ejecutarse en cualquier GPU con al menos 1 GB de memoria.
- Para el despliegue conjunto con Qwen3-4B-Instruct-2507 (4B parámetros, ~8 GB en bf16), se recomienda una GPU con al menos 12 GB de VRAM, como una RTX 3060 12GB, RTX 4070, o GPUs de datacenter como A10G o L4.
- Para entornos de producción con alto throughput, se recomienda A100 (40/80 GB) o H100, que permiten ejecutar el modelo base y el draft en paralelo con margen para batches grandes.
- Opciones de despliegue: SGLang (con backend FlashInfer y soporte EAGLE3), vLLM (si la versión soporta EAGLE3), o implementaciones personalizadas basadas en Transformers.
- Latencia y throughput: no disponibles, ya que dependen de la configuración del árbol especulativo, el hardware y la carga de trabajo. Se espera una mejora de latencia entre 1,5x y 3x en escenarios típicos, pero no hay datos publicados de este checkpoint.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para comparar este draft model con alternativas como EAGLE-1, EAGLE-2, Medusa o los draft models de Llama.cpp. La comparativa se limita a aspectos estructurales:

| Modelo | Parametros | Contexto | Metodo | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-EAGLE3 (este) | 202,7M | 512 (ventana deslizante) | EAGLE3 online | Apache 2.0 |
| Draft models de EAGLE-1/EAGLE-2 (p.ej. para Llama) | ~100-300M | Depende del modelo base | EAGLE-1/EAGLE-2 offline | Apache 2.0 (varía) |
| Medusa (draft heads en el propio modelo) | Sin parámetros extra significativos | Igual que el modelo base | Cabezas adicionales entrenadas | Apache 2.0 (según modelo) |

La principal diferencia es que este modelo está específicamente entrenado para Qwen3-4B-Instruct-2507, mientras que otros draft models suelen ser específicos de cada familia. No hay datos de aceleración comparables.

## Limitaciones y advertencias

- Modelo de borrador, no un modelo de chat: no debe utilizarse de forma independiente para generar respuestas; requiere emparejarse con el modelo base exacto `Qwen/Qwen3-4B-Instruct-2507`.
- Sesgos del dataset: entrenado sobre ShareGPT, que contiene conversaciones reales de usuarios, mayoritariamente en inglés; puede heredar sesgos lingüísticos y de contenido, y su rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación y seguridad: no se registraron métricas de seguridad ni de alineación durante el entrenamiento; el modelo base debe aplicar sus propios mecanismos de seguridad, pero el draft no añade ninguna capa de filtrado.
- Limitaciones de contexto: la ventana deslizante de 512 tokens limita la capacidad de capturar dependencias de largo alcance en el draft; el modelo base puede manejar contextos mayores, pero el draft solo explota los últimos 512 tokens.
- Dependencia de la versión de SGLang: la compatibilidad con EAGLE3 depende de la versión específica de SGLang y del backend FlashInfer; es necesario verificar la documentación antes de desplegar.
- Reproducibilidad: el dataset ShareGPT se obtuvo de una fuente local sin revisión registrada, lo que dificulta replicar el entrenamiento exacto.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 también está bajo Apache 2.0, por lo que no hay restricciones adicionales.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-4-step-105000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Implementación oficial de EAGLE (EAGLE-Qwen3): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Otros checkpoints de la serie (ejemplos): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000 y https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
