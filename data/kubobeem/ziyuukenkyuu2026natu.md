# kubobeem/ziyuukenkyuu2026natu

## Resumen

El modelo `kubobeem/ziyuukenkyuu2026natu` es un ajuste fino (fine-tune) del modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, desarrollado por el usuario kubobeem. El objetivo es mejorar la capacidad del modelo en japonés, concretamente la concisión y naturalidad de las respuestas en este idioma. Se distribuye en formato GGUF, con cuantizaciones Q4_K_M y F16, pensado para ejecutarse en local mediante `llama.cpp` u otras herramientas compatibles.

El modelo tiene aproximadamente 1.170 millones de parámetros y se ha entrenado con QLoRA de 4 bits sobre un conjunto de datos japonés de 96 208 ejemplos, durante una época y con una RTX 4060 de 8 GB de VRAM. Aunque el autor reporta una mejora en la concisión japonesa, también señala una degradación en razonamiento y conocimiento respecto al modelo base, lo que condiciona su utilidad práctica.

Su relevancia radica en ofrecer una alternativa ligera (698 MB en Q4_K_M) para tareas de generación de texto en japonés, con un contexto y licencia de uso libre y no comercial. No obstante, es un modelo experimental, con descargas y aceptación nulas hasta la fecha, y sin benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en LFM2.5-1.2B-Instruct, sin detalles adicionales) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, GGUF F16 |
| Idiomas soportados | Japones, ingles |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM2.5-1.2B-Instruct`, un modelo de lenguaje de 1.2 mil millones de parametros orientado a instrucciones. Sobre esta base se aplicó un ajuste fino con QLoRA (quantized Low-Rank Adaptation) de 4 bits, utilizando un conjunto de datos de 96 208 ejemplos en japones extraidos de datasets de HuggingFace. El entrenamiento se realizó durante una sola época, con una duración aproximada de 8 horas en una RTX 4060 con 8 GB de VRAM.

La técnica de QLoRA permite adaptar el modelo con un coste computacional reducido, aunque el autor reporta que el resultado final presenta una mejora en la fluidez japonesa pero un detrimento en capacidades de razonamiento y conocimiento general. No se mencionan innovaciones arquitectónicas adicionales; el modelo sigue siendo un transformer estándar con atención completa, sin mecanismos especiales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en japones con respuestas más concisas y naturales que el modelo base, según el autor.
- Conversación y seguimiento de instrucciones en japones e ingles (el modelo base es multilingue, aunque el ajuste se centra en japones).
- No se documentan capacidades de tool calling, function calling o agentes en la informacion disponible.
- No se menciona soporte de vision, audio u otras modalidades.
- El modelo es de tamaño reducido, por lo que su capacidad de razonamiento complejo y conocimiento enciclopedico es limitada, especialmente tras el ajuste fino.

## Casos de uso

- Asistente de conversacion en japones para aplicaciones de chat locales: gracias a su pequeño tamaño y cuantizacion Q4_K_M, puede ejecutarse en CPU o GPU de baja potencia para atender consultas sencillas en japones.
- Generacion de textos cortos en japones, como respuestas de correo electronico, resumenes de noticias o contenido para redes sociales, donde la concision es valorada.
- Prototipos de aplicaciones de procesamiento de lenguaje natural japones en entornos con recursos limitados, como Raspberry Pi o portatiles antiguos.
- Herramientas de traduccion automatica japones-ingles y viceversa, aunque con limitaciones de calidad por el tamano del modelo.
- Entornos de desarrollo donde se necesite una API local compatible con OpenAI mediante `llama-server`, sin depender de servicios en la nube.
- Investigacion academica sobre ajuste fino de modelos pequeños para idiomas especificos, dado que el autor publica el codigo y los archivos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica cualitativamente que el ajuste fino mejora la concision japonesa pero degrada el razonamiento y el conocimiento. No hay comparaciones numericas con el modelo base ni con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: el archivo Q4_K_M de 698 MB puede ejecutarse en CPU con al menos 4 GB de RAM libre. La velocidad dependera del numero de nucleos y de la memoria disponible.
- Inferencia en GPU: cabe en GPU con 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2050, o integradas como Intel Iris Xe). Con 4 GB de VRAM se puede usar cuantizacion F16 (2.2 GB) sin problemas.
- GPU recomendadas para entrenamiento (si se desea replicar): RTX 4060 con 8 GB de VRAM, como se uso en el desarrollo.
- Opciones de despliegue: `llama.cpp`, `llama-server`, `Ollama`, `llama-cpp-python`, y cualquier otro framework que soporte GGUF.
- Latencia y throughput: no se disponen de mediciones. En una CPU moderna, se puede esperar una generacion de unos 5-10 tokens por segundo con el Q4_K_M; en una GPU de gama media, mas de 50 tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de tamano similar. El modelo se basa en `LFM2.5-1.2B-Instruct`, que es el modelo base. Una alternativa natural es el propio `LiquidAI/LFM2.5-1.2B-Instruct` original, sin ajuste fino, que puede ofrecer un mejor equilibrio entre razonamiento y conocimiento. Otros modelos japoneses de tamano similar, como `SmolLM-1.7B` o `TinyLlama-1.1B`, no tienen la misma especializacion japonesa. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El autor reporta que el ajuste fino degrada la capacidad de razonamiento y el conocimiento general del modelo base. Esto puede provocar respuestas menos coherentes o incorrectas en tareas que requieren logica o informacion factual.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de tamano reducido, existe un riesgo significativo de generar informacion falsa o inventada, especialmente en japones.
- Limitaciones de contexto: no se ha especificado la longitud de contexto del modelo, pero es probable que sea la misma que la del base, que no se conoce. Se recomienda limitar los prompts a unas pocas centenas de tokens.
- La licencia lfm1.0 permite uso libre y no comercial, pero restringe el uso comercial sin autorizacion. Es importante verificar los terminos exactos antes de cualquier despliegue en produccion.
- El modelo es experimental, con cero descargas y sin evaluaciones externas. No se recomienda para aplicaciones criticas.
- Solo se ha entrenado con datos japoneses; el rendimiento en otros idiomas, como espanol o frances, es probablemente deficiente.

## Enlaces

- HuggingFace: https://huggingface.co/kubobeem/ziyuukenkyuu2026natu
- Repositorio del proyecto (GitHub): https://github.com/kubobeem/ziyuukenkyuu2026natu
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
