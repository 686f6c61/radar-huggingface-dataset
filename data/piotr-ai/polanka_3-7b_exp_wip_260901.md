# piotr-ai/polanka_3.7b_exp_wip_260901

## Resumen

El modelo `piotr-ai/polanka_3.7b_exp_wip_260901` es un modelo de lenguaje de generación de texto conversacional desarrollado por el usuario `piotr-ai` en Hugging Face. Se trata de una versión experimental (WIP, *work in progress*) de la serie Polanka, orientada a tareas de diálogo y asistencia en múltiples idiomas. Según los metadatos, emplea una arquitectura `qwen3_moe`, lo que indica una implementación basada en la familia Qwen3 con mezcla de expertos (MoE). El modelo tiene 3.710.649.856 parámetros totales y está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su carácter experimental y su enfoque multilingüe, cubriendo 12 idiomas (polaco, inglés, chino, checo, eslovaco, ucraniano, ruso, italiano, español, francés, alemán, portugués y lituano). Aunque no se han publicado métricas de rendimiento ni detalles de entrenamiento, los ejemplos incluidos en la model card muestran una capacidad de razonamiento encadenado (*reasoning*) antes de generar la respuesta final, similar a modelos como DeepSeek-R1 o QwQ. Al ser un modelo de tamaño compacto (3.7B), está pensado para despliegues con recursos limitados, aunque su naturaleza experimental implica que aún no está listo para producción sin validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_moe (Mixture of Experts basada en Qwen3) |
| Parametros totales | 3.710.649.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | pl, en, zh, cs, sk, uk, ru, it, es, fr, de, pt, lt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura está etiquetada como `qwen3_moe`, lo que sugiere un modelo basado en la familia Qwen3 con capas de mezcla de expertos (MoE). Sin embargo, no se dispone de información detallada sobre el número de expertos, la configuración de las capas ni el mecanismo de enrutamiento. El modelo es de tipo *text-generation* y está diseñado para tareas conversacionales, como se observa en los ejemplos de la model card.

No se han publicado datos sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El nombre del repositorio incluye la etiqueta `exp_wip`, lo que indica que es un experimento en desarrollo. Los ejemplos muestran que el modelo genera un bloque de razonamiento interno antes de la respuesta final, lo que sugiere un entrenamiento con *chain-of-thought* o un ajuste fino específico para razonamiento, pero no hay confirmación oficial.

## Capacidades

- Generación de texto conversacional: el modelo produce respuestas coherentes en diálogos multi-turno, como se aprecia en los ejemplos en polaco, inglés y chino.
- Razonamiento encadenado: antes de responder, el modelo genera un bloque de razonamiento (visible en los ejemplos) que desglosa el problema y estructura la respuesta.
- Soporte multilingüe: cubre 12 idiomas, incluyendo lenguas eslavas (polaco, checo, eslovaco, ucraniano, ruso, lituano), germánicas (inglés, alemán), romances (italiano, español, francés, portugués) y chino.
- Capacidad de seguir instrucciones: responde a prompts directos con formato específico (por ejemplo, "escribe en 1 frase").
- No se ha confirmado soporte para *tool calling*, *function calling*, agentes autónomos, visión o audio.

## Casos de uso

- Asistente virtual multilingüe: el modelo puede gestionar consultas de usuarios en varios idiomas, generando respuestas con razonamiento previo. Adecuado para chatbots de atención al cliente en empresas con audiencia internacional, gracias a su licencia Apache 2.0 y su tamaño compacto.
- Generación de contenido en lenguas minoritarias: al cubrir idiomas como lituano, eslovaco o ucraniano, puede utilizarse para redactar textos, resúmenes o respuestas automáticas en estos idiomas, donde los modelos grandes suelen tener menos cobertura.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo pequeño (3.7B), se puede desplegar en entornos de desarrollo con GPUs de gama media para probar flujos de diálogo antes de escalar a modelos mayores.
- Educación y práctica de idiomas: puede servir como tutor de conversación en múltiples idiomas, generando ejemplos, correcciones o explicaciones breves, aprovechando su capacidad de razonamiento.
- Análisis de sentimiento o clasificación de texto: aunque no está específicamente entrenado para ello, su naturaleza conversacional permite adaptarlo mediante *fine-tuning* para tareas de clasificación en los idiomas soportados.
- Investigación en modelos MoE compactos: al ser un experimento abierto, puede usarse como base para estudiar el comportamiento de arquitecturas MoE en modelos pequeños, comparando su eficiencia y calidad frente a densos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo es experimental y no se ha sometido a evaluación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 7.4 GB, lo que sugiere pesos en FP16 (aproximadamente 7.4 GB para 3.7B parámetros). Para inferencia en FP16 se necesitan al menos 8 GB de VRAM, aunque con cuantización a 8 bits o 4 bits se puede reducir a 4-5 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) permite ejecutar el modelo en FP16 con margen para el contexto. GPUs con 8-12 GB (RTX 3060, RTX 4070) pueden funcionar con cuantización.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media-alta, especialmente con cuantización GGUF (aunque este repo no incluye GGUF, se puede convertir).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con Transformers. Al ser safetensors, es compatible con el ecosistema estándar.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090, un modelo de 3.7B en FP16 suele generar entre 30-60 tokens/segundo, pero esto es una estimación genérica, no un dato verificado.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es experimental y no hay benchmarks públicos. Como referencia, otros modelos de tamaño similar (3-4B) como Qwen2.5-3B, Llama-3.2-3B o Gemma-3-4B tienen arquitecturas densas, mientras que este usa MoE, lo que podría ofrecer ventajas en eficiencia, pero sin datos no se puede confirmar. La licencia Apache 2.0 es más permisiva que la de Llama (que tiene restricciones para usuarios >700M) y similar a la de Qwen. No se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental (WIP): no se ha validado para uso en producción; puede contener errores, inconsistencias o comportamientos impredecibles.
- Sesgos y alucinaciones: al no haber sido evaluado públicamente, es probable que presente sesgos derivados de los datos de entrenamiento y riesgo de generar información falsa o inventada, como se observa en el ejemplo en inglés donde la respuesta sobre psicología incluye afirmaciones cuestionables ("teoría de la psicología evolutiva").
- Limitaciones de contexto: se desconoce la longitud máxima de contexto; es probable que sea limitada (típicamente 4K-8K en modelos de este tamaño), lo que restringe su uso en documentos largos.
- Cobertura idiomática desigual: aunque soporta 12 idiomas, la calidad puede variar significativamente entre ellos; los ejemplos solo muestran polaco, inglés y chino.
- Sin garantías de rendimiento: no hay benchmarks, por lo que no se puede comparar objetivamente con otros modelos.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un trabajo derivado de Qwen3, debe cumplirse la licencia original de Qwen (Apache 2.0 también), sin restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/piotr-ai/polanka_3.7b_exp_wip_260901
- Otros modelos del autor: https://huggingface.co/piotr-ai/models
- Modelo relacionado (versión anterior): https://huggingface.co/piotr-ai/polanka_3.7b_exp_wip_260706
- Modelo relacionado (versión 7B): https://huggingface.co/piotr-ai/polanka-7b-v0.1
