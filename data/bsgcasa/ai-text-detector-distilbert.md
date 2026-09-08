# bsgcasa/ai-text-detector-distilbert

## Resumen

El modelo `bsgcasa/ai-text-detector-distilbert` es un clasificador de texto binario desarrollado por el usuario bsgcasa, que distingue entre texto escrito por humanos y texto generado por ChatGPT. Está construido mediante fine-tuning sobre el modelo base `distilbert-base-uncased` de Hugging Face, una versión destilada y más ligera de BERT que mantiene un rendimiento cercano al original con un coste computacional reducido. El modelo resuelve el problema creciente de identificar contenido generado por modelos de lenguaje de IA, una necesidad habitual en moderación de contenidos, verificación académica y control de calidad editorial.

La arquitectura es un encoder Transformer de tipo DistilBERT, con una longitud máxima de secuencia de 256 tokens. El modelo se distribuye en formato ONNX cuantizado a INT8, lo que permite una inferencia rápida y ligera en CPU, con un tamaño de archivo aproximado de 64 MB. Esta característica lo hace especialmente atractivo para despliegues en entornos sin GPU, como servidores de bajo coste o aplicaciones embebidas.

Aunque la fecha de publicación y el número de descargas no son indicativos de madurez, la ficha técnica del autor reporta métricas de rendimiento muy altas en su conjunto de prueba, con una precisión del 99,4%. No obstante, el propio autor advierte de que el modelo está afinado para detectar patrones específicos de ChatGPT y puede no generalizar a otros generadores de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder Transformer) |
| Parametros totales | no disponible |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_int8.onnx`), `tokenizer.json`, `tokenizer_config.json`, `label_order.json` |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un modelo de tipo encoder Transformer destilado a partir de BERT. El fine-tuning se realizó para la tarea de clasificación binaria de secuencias, con una longitud máxima de 256 tokens. El conjunto de entrenamiento presentaba un desequilibrio de clases del 67% de texto humano frente al 33% de texto generado por ChatGPT, por lo que se utilizó una función de pérdida de entropía cruzada ponderada para compensarlo. El entrenamiento se ejecutó durante 2 épocas con el optimizador AdamW y una tasa de aprendizaje de 2e-5. El autor no especifica la composición exacta del dataset ni el número de tokens de entrenamiento.

La innovación técnica más destacable es la exportación del modelo a formato ONNX y su cuantización a INT8, lo que reduce el peso del modelo a aproximadamente 64 MB y permite una inferencia eficiente en CPU sin necesidad de GPU. No se mencionan técnicas adicionales como RLHF, DPO ni decodificación especulativa, ya que no se trata de un modelo generativo.

## Capacidades

- Clasificación binaria de texto: distingue entre texto escrito por humanos y texto generado por ChatGPT.
- Inferencia en CPU gracias a la exportación a ONNX y la cuantización INT8.
- Soporta secuencias de hasta 256 tokens, truncando el texto más largo.
- No dispone de soporte para tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- Las capacidades multilingües no están documentadas; los ejemplos y el modelo base están orientados al inglés.

## Casos de uso

- Moderación de contenidos en foros y redes sociales: el modelo puede analizar publicaciones y comentarios para identificar texto generado por ChatGPT, facilitando la detección de spam o contenido automatizado en comunidades online.
- Verificación de ensayos académicos: instituciones educativas pueden integrar el clasificador en sus sistemas de revisión para detectar posibles trabajos generados por IA, usado como señal de apoyo junto a otras herramientas.
- Auditoría de reseñas de productos: plataformas de comercio electrónico pueden filtrar reseñas sospechosas de estar generadas automáticamente, mejorando la confianza de los compradores.
- Control de calidad en agencias de contenido: agencias de marketing y redacción pueden comprobar si los textos entregados por colaboradores externos han sido generados por ChatGPT, garantizando la originalidad del trabajo.
- Análisis de documentación legal o financiera: despachos y departamentos de cumplimiento pueden examinar contratos o informes para identificar pasajes redactados por IA, especialmente en tareas de due diligence.
- Detección de respuestas automáticas en atención al cliente: empresas pueden monitorizar las respuestas de sus agentes o bots para asegurar que la interacción es humana, o para detectar uso no autorizado de asistentes de IA.

## Benchmarks y rendimiento

Según los datos proporcionados por el autor en la model card, evaluados sobre un conjunto de prueba independiente:

| Metric | Score |
|---|---|
| Accuracy | 99,4% |
| F1 | 0,991 |
| Precision | 0,983 |
| Recall | 0,999 |

El autor indica que la evaluación se realizó en múltiples dominios (medicina, Reddit ELI5, finanzas, preguntas abiertas, wiki/CS-AI) y con longitudes de texto de 0 a más de 500 palabras, manteniendo una precisión alta en todos los grupos. El dominio más débil fue wiki/CS-AI, con una precisión aproximada del 89%. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo ONNX INT8 ocupa aproximadamente 64 MB y puede ejecutarse en CPU.
- GPU recomendada: ninguna; el diseño está orientado a inferencia en CPU.
- Compatibilidad con GPU de consumo: sí, aunque no es necesario; cualquier GPU con soporte para ONNX Runtime podría acelerar la inferencia, pero no es el caso de uso previsto.
- Opciones de despliegue: ONNX Runtime, Python, Google Colab, o cualquier entorno que soporte ONNX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada con modelos similares en la información proporcionada. Se ha identificado un modelo con propósito equivalente, `Neural-Hacker/distilbert_ai_text_detector`, también basado en `distilbert-base-uncased`, pero no se han encontrado especificaciones técnicas ni métricas de rendimiento comparables en los resultados de búsqueda.

## Limitaciones y advertencias

- El modelo fue entrenado en una mezcla específica de dominios (medicina, finanzas, Reddit, preguntas abiertas, wiki/CS-AI); el rendimiento puede degradarse en estilos de texto fuera de distribución o en textos de dominios no representados.
- Está afinado para detectar patrones asociados a ChatGPT; puede no generalizar igual de bien a las salidas de otros modelos de lenguaje.
- Como todos los detectores de texto generado por IA, debe tratarse como una señal de apoyo y no como un juicio definitivo; son posibles falsos positivos y falsos negativos, especialmente en textos cortos o muy editados.
- La longitud máxima de secuencia es de 256 tokens; textos más largos se truncan, lo que puede perder información relevante para la clasificación.
- No se documentan sesgos específicos, pero al estar entrenado predominantemente en inglés y en dominios concretos, puede presentar sesgos lingüísticos y temáticos.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/bsgcasa/ai-text-detector-distilbert](https://huggingface.co/bsgcasa/ai-text-detector-distilbert)
- Modelo similar: [https://huggingface.co/Neural-Hacker/distilbert_ai_text_detector](https://huggingface.co/Neural-Hacker/distilbert_ai_text_detector)
