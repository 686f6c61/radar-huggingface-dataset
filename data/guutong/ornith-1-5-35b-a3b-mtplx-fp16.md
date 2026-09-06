# guutong/Ornith-1.5-35B-A3B-MTPLX-FP16

## Resumen

El modelo `guutong/Ornith-1.5-35B-A3B-MTPLX-FP16` es una variante MTPLX (multi-token prediction) del modelo original `ornith-ai/Ornith-1.5-35B-A3B`, un modelo de mezcla de expertos (MoE) de aproximadamente 35.000 millones de parámetros con unos 3.000 millones de parámetros activos por token. La arquitectura base está etiquetada como `qwen3_5_moe` y ofrece una ventana de contexto de 256K tokens, según la información del repositorio original. El modelo MTPLX ha sido "forjado" con la herramienta MTPLX Forge y está pensado para ejecutarse en Apple Silicon mediante MLX. La verificación publicada indica un multiplicador de velocidad de 1.20× frente a la línea base autoregresiva, validada en un Apple M1 Max. Este modelo es relevante para quien busque probar técnicas de predicción multi-token en hardware de Apple, aunque la documentación disponible es mínima y el repositorio no presenta ni descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), etiquetada como `qwen3_5_moe` |
| Parametros totales | 35.107.180.016 (35,1B) |
| Parametros activos | ~3B por token (según el modelo original) |
| Longitud de contexto | 256K tokens (según el modelo original) |
| Tipos de cuantizacion | FP16 según el nombre del repo; el tamaño del repositorio (22,1 GB) y la etiqueta `4-bit` sugieren una cuantizacion de 4 bits. No se dispone de una lista completa |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el model card indica "See LICENSE" sin especificar el tipo) |
| Formato de pesos | safetensors, optimizado para MLX (Apple Silicon) |

## Arquitectura y entrenamiento

El modelo base `Ornith-1.5-35B-A3B` es un MoE con 35.107.180.016 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo hace eficiente en computación por token en comparación con un modelo denso del mismo tamaño. La arquitectura está etiquetada como `qwen3_5_moe`, lo que indica una familia MoE inspirada en Qwen3.5. La ventana de contexto declarada es de 256K tokens.

La variante MTPLX se ha generado mediante MTPLX Forge, una herramienta que aplica predicción multi-token sobre el modelo original. Según la model card, la verificación se realizó en un Apple M1 Max con un sampler a temperatura 0,6, top_p 0,95 y top_k 20, obteniendo un "best depth" de D1 y un multiplicador de 1,20× frente a la línea base autoregresiva. No se han publicado datos sobre el proceso de entrenamiento, la composición del dataset, ni técnicas como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo original, un MoE de 35B con contexto de 256K, aunque no hay benchmarks públicos que confirmen el rendimiento.
- Predicción multi-token: la modificación MTPLX está diseñada para acelerar la decodificación mediante la predicción de varios tokens a la vez, con un multiplicador verificado de 1,20×.
- Ejecución en Apple Silicon: el modelo está optimizado para MLX, con una verificación específica en Apple M1 Max.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentación con predicción multi-token en Macs con Apple Silicon: el modelo permite probar la técnica MTPLX en un MoE de 35B directamente desde MLX, útil para investigadores que estudian mejoras de latencia en decodificación.
- Asistente conversacional local en macOS: gracias a la integración con MTPLX y al tamaño del modelo, puede ejecutarse en un Mac con suficiente memoria unificada para conversaciones de contexto largo, si se dispone de cuantizacion adecuada.
- Análisis de documentos extensos en local: la ventana de 256K tokens del modelo original permite procesar informes, contratos o libros completos sin fragmentar la entrada, aunque la variante MTPLX no ha sido validada en esta tarea específica.
- Prototipado de sistemas de preguntas y respuestas sobre corpus largos: la combinación de MoE eficiente y contexto amplio lo hace adecuado para entornos de investigación donde se quiere evitar el coste de API externas.
- Benchmarking de técnicas de decodificación en hardware Apple: el repositorio incluye un registro de verificación (`mtplx_runtime.json`), lo que permite reproducir y comparar el rendimiento de MTPLX frente a la generación autoregresiva estándar en el mismo hardware.
- Pruebas de despliegue en entornos académicos con recursos limitados: al ser un MoE con pocos parámetros activos, es posible ejecutarlo en estaciones de trabajo de gama alta o Macs con mucha memoria, sirviendo como base para experimentos de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica conocida es el multiplicador de 1,20× frente a la línea base autoregresiva, verificado en un Apple M1 Max con un sampler de temperatura 0,6, top_p 0,95 y top_k 20. No existen datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- El modelo original en bf16 ocupa aproximadamente 70 GB y las recetas publicadas sugieren 2 GPUs de 80 GB para manejar el contexto de 256K con servidor OpenAI-compatible.
- El repositorio de esta variante ocupa 22,1 GB, lo que sugiere una cuantizacion de 4 bits. En ese caso, podría ejecutarse en una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) con contextos reducidos, o en una Mac con al menos 32 GB de memoria unificada.
- El hardware de verificación es un Apple M1 Max, por lo que se espera que funcione en Macs con chips de la serie M1 o superiores, siempre que tengan suficiente memoria unificada.
- Opciones de despliegue: la variante MTPLX se usa con la herramienta `mtplx` (comandos `mtplx pull` y `mtplx start chat`). Para el modelo original, se ofrecen recetas con servidor OpenAI-compatible y soporte de tensor parallelism.
- Latencia y throughput: no disponibles, salvo el multiplicador de 1,20× mencionado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de una lista verificada de modelos comparables en la información proporcionada. El propio modelo original `ornith-ai/Ornith-1.5-35B-A3B` es la referencia más directa, siendo esta variante una modificación MTPLX del mismo. No se pueden ofrecer comparativas fiables con otros MoE de tamaño similar sin datos públicos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no evaluado; al no existir benchmarks publicados, el comportamiento en tareas factuales es incierto.
- Limitaciones de contexto o idioma: los idiomas soportados no se especifican; el uso con contextos cercanos a 256K puede requerir hardware de gran memoria.
- Restricciones de licencia: la licencia no está especificada en el repositorio ni en la model card, solo se menciona "See LICENSE". El uso comercial es incierto y requiere contactar con el autor original.
- El modelo está optimizado para Apple Silicon y MLX; su funcionamiento en otras plataformas o con otros frameworks no está verificado.
- El repositorio no tiene descargas ni likes, lo que indica que es un modelo poco probado en la comunidad.
- La etiqueta `4-bit` y el nombre `FP16` son inconsistentes; se debe verificar la precisión real de los pesos antes de usarlo en producción.

## Enlaces

- HuggingFace del modelo en cuestión: https://huggingface.co/guutong/Ornith-1.5-35B-A3B-MTPLX-FP16
- HuggingFace del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio MTPLX Forge: https://github.com/youssofal/MTPLX
