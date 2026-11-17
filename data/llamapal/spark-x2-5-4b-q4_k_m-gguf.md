# LlamaPal/Spark-X2.5-4B-Q4_K_M-GGUF

## Resumen

Spark-X2.5-4B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo denso Spark-X2.5 4B, desarrollado por SparkLLM (publicado en Hugging Face bajo la organización XHToken). Este repositorio concreto lo mantiene LlamaPal, que distribuye el archivo exacto que su aplicación Android descarga para ofrecer chat de IA totalmente offline en el dispositivo. El modelo base se entrenó con unos 20 billones de tokens y emplea un diseño de atención híbrida orientado a mantener ligero el consumo de memoria en conversaciones largas.

La relevancia de esta ficha está en su enfoque práctico: es una cuantización Q4_K_M de 2,6 GB pensada para ejecutarse en teléfonos Android mediante llama.cpp, sin conexión y sin enviar datos a servidores externos. El modelo base declara una ventana de contexto de hasta 1M de tokens, modo de razonamiento integrado y soporte de más de 200 idiomas, lo que lo sitúa en la categoría de modelos pequeños (4B) con ambiciones de agente y código.

No obstante, debe tenerse en cuenta que la model card de este repositorio es fundamentalmente promocional y remite a la del autor original para los detalles técnicos. Los datos de arquitectura, entrenamiento y benchmarks que se recogen aquí proceden de esa descripción y no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (según model card del modelo base) |
| Parametros totales | 4.112.079.360 (4,11B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M tokens (según model card del modelo base) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); otras cuantizaciones en el repo original XHToken/Spark-X2.5-4B-GGUF |
| Idiomas soportados | Más de 200 según la model card; no se detalla la lista |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Spark-X2.5-4B-Q4_K_M.gguf`, 2,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 4,11B parámetros con un diseño de atención híbrida que, según la model card, reduce el coste de memoria en conversaciones de contexto largo. Se preentrenó con aproximadamente 20 billones de tokens. La model card menciona un "modo de pensamiento" (thinking mode) integrado, aunque no se especifican detalles sobre la composición del dataset, el uso de RLHF/DPO ni las innovaciones exactas de la atención híbrida.

Esta ficha corresponde únicamente a la cuantización Q4_K_M, que reduce los pesos a unos 2,6 GB para facilitar su ejecución en dispositivos móviles. El repositorio indica que es una copia sin modificar del archivo original de XHToken/Spark-X2.5-4B-GGUF (commit `9826e0be84e6`), con el mismo hash SHA-256: `adfcfa19a4ed6a5985da8bf565fe15f8e1a7e131d79bae2d19d48d1c40109428`.

## Capacidades

- Generación de texto conversacional en formato chat.
- Modo de razonamiento integrado (thinking mode) según la model card del modelo base.
- Capacidades de agente, matemáticas y código, con afirmaciones de superar a Qwen3.5 4B en la mayoría de pruebas de agente, matemáticas y programación (no verificadas de forma independiente).
- Soporte multilingüe de más de 200 idiomas según la model card.
- Ejecución offline en Android mediante llama.cpp y la aplicación LlamaPal.
- Compatible con cualquier aplicación basada en llama.cpp al ser un GGUF estándar.
- No se documentan capacidades de visión, audio ni tool calling explícito en la información disponible.

## Casos de uso

- Chat offline en Android: el archivo de 2,6 GB se descarga una vez y permite conversaciones sin conexión ni cuenta, con los datos permaneciendo en el dispositivo; adecuado para privacidad y entornos sin red.
- Asistente personal en movilidad: respuestas conversacionales multi-turno aprovechando la ventana de contexto declarada (hasta 1M tokens en el modelo base), útil para resúmenes de documentos largos en el teléfono.
- Prototipado rápido en llama.cpp: al ser un GGUF estándar, sirve para probar el modelo base en escritorio o portátil antes de integrarlo en producción.
- Aplicaciones de privacidad estricta: al no requerir internet ni cuenta, encaja en escenarios donde no se puede enviar texto a servidores externos (sanidad, legal, trabajo de campo).
- Educación y consulta sin conectividad: uso en aulas o zonas rurales sin acceso estable a la red.
- Evaluación de modelos pequeños con razonamiento: útil para experimentar con el modo de pensamiento y comparar su comportamiento frente a otros 4B en tareas de matemáticas y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La model card afirma que el modelo base lidera a Qwen3.5 4B en la mayoría de pruebas de agente, matemáticas y programación, pero no se aportan cifras concretas ni tablas de resultados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,6 GB para los pesos Q4_K_M, más overhead de contexto y runtime; en la práctica se recomienda disponer de 3-4 GB de memoria libre.
- GPU recomendadas: no se especifican; al ser un GGUF de 4B cuantizado puede ejecutarse en CPU y en GPUs de consumo.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 y superiores), aunque la información no confirma modelos concretos.
- Despliegue: llama.cpp y aplicaciones basadas en él (LlamaPal en Android); compatible con otros runners GGUF, aunque no se detallan en la información.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.5-4B (Q4_K_M, este repo) | 4,11B | Hasta 1M (según model card) | Apache 2.0 | GGUF | Hugging Face |
| Qwen3.5 4B | No disponible en la información | No disponible | No disponible | No disponible | No disponible |
| Otros 4B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación mencionada en la información es con Qwen3.5 4B, y se limita a una afirmación cualitativa sin cifras. No se dispone de datos suficientes para una comparativa técnica rigurosa.

## Limitaciones y advertencias

- La model card de este repositorio es esencialmente promocional y remite al autor original; los datos de arquitectura, contexto e idiomas no están verificados de forma independiente.
- Riesgo de alucinación inherente a un modelo de 4B, especialmente en tareas de razonamiento complejo o contextos muy largos.
- La ventana de 1M tokens declarada no está confirmada ni se detalla cómo afecta al rendimiento en memoria; en un dispositivo móvil el contexto práctico será mucho menor.
- No se documentan sesgos conocidos ni evaluación de seguridad.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del repositorio original para uso comercial y atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo original en FP16/BF16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LlamaPal/Spark-X2.5-4B-Q4_K_M-GGUF
- Repositorio original del modelo base (GGUF): https://huggingface.co/XHToken/Spark-X2.5-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Aplicación LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
