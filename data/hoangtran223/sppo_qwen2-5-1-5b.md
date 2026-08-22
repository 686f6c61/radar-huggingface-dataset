# HoangTran223/SPPO_Qwen2.5-1.5B

## Resumen

SPPO_Qwen2.5-1.5B es un modelo de lenguaje desarrollado por HoangTran223 que aplica Self-Play Preference Optimization (SPPO) sobre el modelo base Qwen/Qwen2.5-1.5B. El objetivo del proyecto es explorar métodos de alineación mediante autocomparación de respuestas generadas por el propio modelo, en lugar de depender de anotaciones humanas o modelos de recompensa externos. El resultado es un modelo denso de 1.500 millones de parámetros, basado en la arquitectura transformer decoder-only de Qwen2.5, que ha sido sometido a un proceso de ajuste fino supervisado (SFT) sobre UltraChat200k y posteriormente a tres iteraciones de SPPO sobre UltraChat50k.

La relevancia de este modelo radica en que demuestra cómo aplicar técnicas de optimización por preferencias de autoplay a un modelo pequeño, con la intención de mejorar su capacidad de seguir instrucciones y generar respuestas útiles sin necesidad de RLHF clásico. Aunque no se han publicado métricas de rendimiento, el repositorio incluye datos de preferencias, logs de entrenamiento y pesos intermedios, lo que facilita la reproducibilidad. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors, compatibles con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-1.5B soporta hasta 32.768 tokens |
| Tipos de cuantizacion | No disponibles (no se publican pesos cuantizados en el repositorio) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-1.5B, un transformer causal denso con atención completa. No emplea mezcla de expertos ni arquitecturas hibridas. El proceso de entrenamiento se divide en dos fases: primero, un ajuste supervisado (SFT) sobre el dataset UltraChat200k, partiendo de los pesos del modelo base; después, tres iteraciones de Self-Play Preference Optimization sobre un subconjunto de UltraChat50k. Cada iteracion genera respuestas con el modelo actual, las compara mediante el ranker PairRM para construir pares de preferencia, y entrena el modelo con esos datos durante dos epocas.

Los hiperparametros de entrenamiento son: longitud maxima de secuencia de 1024 tokens, longitud maxima de prompt de 512 tokens, batch size 1 con gradiente acumulado de 2, optimizador RMSProp y una tasa de aprendizaje de 5e-7. El repositorio incluye los datos de preferencia (parquet), las respuestas generadas, las matrices de ranking de PairRM y los logs de vLLM, lo que permite replicar el proceso completo. No se menciona el uso de RLHF clasico ni de DPO; SPPO es una variante de optimizacion por preferencias basada en autoplay.

## Capacidades

- Generacion de texto conversacional y respuestas a instrucciones, heredadas del modelo base Qwen2.5-1.5B.
- Razonamiento basico, generacion de codigo y matematicas simples, segun las capacidades tipicas de la familia Qwen2.5.
- Capacidades multilingues del modelo base, aunque no se detallan los idiomas concretos en la documentacion.
- No se documenta soporte para tool calling, function calling, agentes ni modo de razonamiento extendido (thinking mode).
- No se especifica soporte para vision, audio ni otras modalidades.
- La arquitectura es de tipo causal decoder-only, por lo que la generacion es autoregresiva.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: gracias a su tamano de 1.5B y su licencia permisiva, puede integrarse en aplicaciones de demostracion o MVP que requieran generacion de texto sin grandes recursos de hardware.
- Investigacion en alineacion de modelos: el repositorio proporciona datos de preferencias y logs de entrenamiento, por lo que es util para estudiar el comportamiento de SPPO en modelos pequenos y comparar con DPO o RLHF.
- Fine-tuning para tareas especificas: se puede partir de este modelo como base para ajustarlo en dominios concretos (por ejemplo, resumen, clasificacion o generacion de texto en un idioma particular), aprovechando su licencia Apache 2.0.
- Despliegue en entornos con restricciones de memoria: con alrededor de 1.5B de parametros, es viable ejecutarlo en GPUs de gama media o incluso en CPU con cuantizacion posterior (aunque no se proporcionan pesos cuantizados).
- Generacion de datos sinteticos para entrenar modelos mas pequenos o para aumentar datasets, gracias a su capacidad de producir respuestas coherentes.
- Educacion y experimentacion: adecuado para cursos o laboratorios que necesiten un modelo pequeno y entrenable para ilustrar conceptos de optimizacion por preferencias y autoplay.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otros estandares, por lo que no es posible comparar cuantitativamente su rendimiento con otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, un modelo de 1.5B requiere aproximadamente 3 GB de VRAM; en cuantizacion de 8 bits se puede reducir a unos 2 GB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: tarjetas con al menos 4 GB de VRAM, como NVIDIA GTX 1650 Super, RTX 3050, RTX 4060 o superiores. Para entrenamiento adicional, se recomienda una GPU con al menos 8 GB (por ejemplo, RTX 3070 o RTX 4060 Ti).
- Es posible ejecutar inferencia en CPU con memoria RAM suficiente (al menos 8 GB) si se convierte a formatos como GGUF mediante herramientas de terceros, aunque no se suministran estos pesos.
- Opciones de despliegue: el repositorio es compatible con transformers y vLLM (los logs de generacion indican el uso de vLLM). Tambien se puede convertir a GGUF para Ollama o llama.cpp.
- Latencia y throughput: no se proporcionan datos medidos. En una GPU de gama media, se espera una generacion de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| SPPO_Qwen2.5-1.5B | 1.5B | 32K (base) | Apache 2.0 | Entrenado con SPPO sobre UltraChat; sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | Variante instruct del modelo base, con RLHF y benchmarks publicos |
| Llama-3.2-1B | 1.1B | 128K | Meta Llama 3 Community License | Modelo instruct de Meta, con soporte de tool calling y benchmarks conocidos |
| Gemma-2-2B | 2.6B | 8K | Gemma Terms of Use | Modelo de Google, instruct, con benchmarks publicados |

La comparativa se basa en datos disponibles de los modelos base; no se dispone de resultados de SPPO_Qwen2.5-1.5B para contrastar rendimiento real.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion, por lo que su rendimiento en tareas reales es desconocido y podria ser inferior a modelos instruct de la misma familia.
- El entrenamiento se realiza sobre datos sinteticos (UltraChat), que pueden introducir sesgos y errores de estilo que no reflejan la diversidad de interacciones reales.
- No se documenta soporte para tool calling ni funciones de agente, limitando su uso en pipelines de automatizacion complejos.
- La longitud de contexto efectiva no esta especificada para este modelo; aunque el base soporta 32K, el entrenamiento con max_length 1024 puede degradar el uso de contextos largos.
- El repositorio es reciente y con cero descargas; no hay evidencia de uso en produccion ni retroalimentacion de la comunidad.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no proporciona garantias ni soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HoangTran223/SPPO_Qwen2.5-1.5B
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo instruct Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de codigo Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b
