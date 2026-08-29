# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-115000

## Resumen
El repositorio `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-115000` contiene un checkpoint de un modelo de drafting (draft model) para decodificación especulativa, entrenado con el algoritmo EAGLE3 mediante el framework SpecForge. Su función es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`, un LLM de 4B parámetros de la familia Qwen3. No es un modelo de chat independiente, sino un componente auxiliar que se empareja con el modelo base para predecir secuencias de tokens candidatas y reducir la latencia de generación.

El checkpoint corresponde al paso 115.000 del entrenamiento (epoch 4 de 10), con un total de 202.700.416 parámetros. La arquitectura es una variante de Llama con una única capa de decoder, diseñada específicamente para el modo de draft en EAGLE3. La longitud máxima de secuencia durante el entrenamiento fue de 2048 tokens. El modelo se distribuye con pesos en `bfloat16` y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en la creciente demanda de técnicas de decodificación especulativa para reducir el coste computacional de los LLMs en producción. Al ser un draft model ligero (0,4 GB), puede integrarse en servidores de inferencia como SGLang para mejorar el throughput y la latencia percibida por el usuario sin modificar el modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, 32 heads de atencion, 8 key/value heads, hidden size 2560, intermediate size 9728) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens (maxima longitud de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible; los pesos se publican en `bfloat16` |
| Idiomas soportados | No disponible; hereda las capacidades del modelo objetivo `Qwen3-4B-Instruct-2507`, pero no se especifican en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura EAGLE3, una técnica de drafting autoregresivo que utiliza una capa adicional de transformador sobre el modelo objetivo para predecir múltiples tokens futuros en paralelo. En concreto, `LlamaForCausalLMEagle3` consta de una única capa decoder con hidden size 2560, 32 cabezas de atención y 8 cabezas de clave/valor. El vocabulario de draft es de 32.000 tokens, mientras que el vocabulario objetivo es de 151.936 (el del modelo Qwen3-4B). No se aplica ventana deslizante en esta ejecución estándar.

El entrenamiento se realizó de forma online (online EAGLE3) con el framework SpecForge, utilizando como datos un dataset ShareGPT limpio en formato JSONL (revisión no registrada). Los hiperparámetros principales incluyen: 10 épocas, 231.810 pasos de optimización, batch efectivo global de 4, learning rate de 1e-4 con calentamiento lineal del 1,5% y posterior decaimiento coseno, weight decay 0,0, gradiente máximo 0,5, y longitud máxima de secuencia de 2048. La longitud de TTT (test-time training) de EAGLE3 se fijó en 7. El backend objetivo es SGLang con FlashInfer. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades
- Modelo de drafting para decodificación especulativa: genera secuencias de tokens candidatas que el modelo objetivo verifica, acelerando la inferencia.
- No es un modelo de chat ni de generación autónoma: no produce respuestas finales por sí mismo.
- Compatible exclusivamente con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` (o su familia directa).
- Integración con SGLang mediante el algoritmo EAGLE3, con parámetros configurables como `speculative-num-steps`, `speculative-eagle-topk` y `speculative-num-draft-tokens`.
- No soporta tool calling, razonamiento multi-paso, visión ni otras capacidades propias de un LLM completo.
- Al ser un modelo auxiliar, sus capacidades se limitan a la predicción de tokens internos para el mecanismo de verificación.

## Casos de uso
- Aceleración de inferencia para chatbots basados en Qwen3-4B-Instruct-2507: al desplegar SGLang con este draft model, se reduce la latencia de generación en aplicaciones conversacionales de producción.
- Reducción de coste por petición en APIs de texto: al aumentar el throughput del servidor, se pueden atender más solicitudes con el mismo hardware.
- Despliegue en entornos con GPUs limitadas: el draft model ocupa solo 0,4 GB, por lo que puede residir en la misma GPU que el modelo principal sin requerir memoria adicional significativa.
- Optimización de pipelines de generación de código y análisis de datos: cualquier tarea que use Qwen3-4B-Instruct-2507 puede beneficiarse de la menor latencia sin cambiar el comportamiento del modelo final.
- Evaluación de técnicas de decodificación especulativa: investigadores pueden utilizar este checkpoint como referencia para comparar configuraciones de EAGLE3 (número de pasos, top-k, tokens de draft) en cargas de trabajo reales.
- Integración en sistemas de inferencia de alto rendimiento: el modelo se puede combinar con otros optimizaciones (cuantización del modelo base, batching dinámico) para maximizar la eficiencia del servidor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para esta ejecución. No se dispone de comparativas cuantitativas con otros draft models.

## Requisitos de hardware
- El modelo de drafting tiene 202,7 millones de parámetros en `bfloat16`, lo que equivale a aproximadamente 0,4 GB de memoria. Cualquier GPU con al menos 2 GB de VRAM puede cargarlo.
- Sin embargo, al ser un componente auxiliar, los requisitos de hardware vienen determinados principalmente por el modelo objetivo `Qwen3-4B-Instruct-2507`. Para inferencia en FP16, este modelo requiere aproximadamente 8 GB de VRAM, por lo que una GPU como la RTX 3090, RTX 4090, A10 o A100 es adecuada. Con cuantización (por ejemplo, AWQ o GPTQ), puede caber en GPUs de 6 GB.
- El despliegue recomendado es mediante SGLang con backend FlashInfer, tal como se indica en la model card. También es posible usar otros frameworks compatibles con EAGLE3, aunque no se documentan en la fuente.
- La latencia y el throughput dependen de la configuración de EAGLE3 (pasos especulativos, top-k, número de tokens de draft) y de la carga del servidor. No se proporcionan valores estimados en la documentación.
- Para uso en producción, se recomienda realizar un benchmark propio con la carga de trabajo específica, ajustando los parámetros `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.

## Comparativa con modelos similares
No se dispone de información comparativa en la fuente proporcionada. Este checkpoint es específico para EAGLE3 sobre Qwen3-4B-Instruct-2507. Otros draft models como Medusa o EAGLE-2 existen para arquitecturas diferentes, pero no se dispone de datos de rendimiento para establecer una comparación objetiva. La model card no incluye resultados frente a alternativas.

## Limitaciones y advertencias
- No es un modelo de chat: usarlo de forma independiente producirá salidas sin sentido, ya que está diseñado únicamente para el mecanismo de verificación especulativa.
- Debe emparejarse con el modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507`; no es compatible con otras variantes de Qwen3 sin reentrenamiento.
- El entrenamiento se realizó sobre ShareGPT, un dataset de conversaciones de usuarios reales, por lo que puede heredar sesgos, lenguaje ofensivo o información personal de los datos originales.
- No se realizaron evaluaciones de seguridad ni de alineación durante el entrenamiento. El uso en producción debe considerar este riesgo.
- La longitud de contexto está limitada a 2048 tokens durante el entrenamiento, lo que puede afectar a la calidad del drafting en secuencias más largas.
- El archivo `training_state.pt` incluido en el repositorio contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza, ya que puede contener código arbitrario.
- La licencia Apache 2.0 permite uso comercial, pero el modelo objetivo Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache 2.0 también), por lo que no hay restricciones adicionales en este sentido.

## Enlaces
- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-115000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo base (sin instruct): https://huggingface.co/Qwen/Qwen3-4B
- Modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507
- Paper técnico de Qwen3: https://arxiv.org/pdf/2505.09388
- Documentación de la familia Qwen3 (DeepWiki): https://deepwiki.com/QwenLM/Qwen3
