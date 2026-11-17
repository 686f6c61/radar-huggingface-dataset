# 4nn4ss/gemma4-e2b-dhivehi

## Resumen

`4nn4ss/gemma4-e2b-dhivehi` es un ajuste fino (fine-tuning) del modelo Gemma 4 E2B instructivo publicado por el usuario 4nn4ss. El modelo base es la versión cuantizada a 4 bits de Unsloth (`unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`), sobre la que se ha realizado un entrenamiento adicional y se ha exportado el resultado en FP16 (16 bits) en formato safetensors. El repositorio ocupa 10,3 GB y contiene 5.123.178.051 parámetros según los pesos publicados.

El nombre del repositorio sugiere un ajuste orientado al idioma dhivehi (maldivo), si bien la model card no documenta el conjunto de datos de entrenamiento, el procedimiento ni los resultados obtenidos, y la etiqueta de idioma declarada es únicamente `en`. La relevancia del modelo radica en su condición de derivado multimodal (pipeline `image-text-to-text`) de la familia Gemma 4 con licencia Apache 2.0, lo que facilita su reutilización comercial, aunque la ausencia de documentación y de métricas limita seriamente su evaluación.

No se dispone de información publicada sobre arquitectura interna, longitud de contexto, composición del dataset de ajuste ni rendimiento en benchmarks. Todo lo que sigue se basa exclusivamente en los metadatos del repositorio y en la model card, que es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; el pipeline declarado es image-text-to-text) |
| Parametros totales | 5.123.178.051 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en FP16; el modelo base se distribuye en 4 bits (bnb-4bit) |
| Idiomas soportados | en (etiqueta declarada); el nombre del repositorio sugiere dhivehi, no confirmado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Por la nomenclatura del modelo base (`gemma-4-E2B-it`) y el pipeline declarado (`image-text-to-text`), se trata presumiblemente de un transformer multimodal de la familia Gemma 4, pero no se confirman detalles como el tipo de atención, el tokenizador, la ventana de contexto ni la composición de las capas. El sufijo `E2B` no está documentado en la información disponible.

El proceso de ajuste se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, partiendo de la versión instructiva cuantizada a 4 bits de Unsloth y exportando el resultado final en FP16. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni ninguna innovación técnica destacable. Tampoco se documenta el objetivo del ajuste (presuntamente dhivehi, por el nombre) ni se aportan ejemplos de uso o evaluación.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instructivo Gemma 4.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), según los metadatos del repositorio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: la etiqueta oficial es únicamente `en`; el posible soporte de dhivehi no está verificado.
- Modo thinking, audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso

- Experimentación con ajustes finos de Gemma 4: el modelo sirve como punto de partida para reproducir o comparar el pipeline de Unsloth + TRL sobre la variante E2B, dado que el repositorio incluye los pesos en FP16 listos para `transformers`.
- Investigación sobre adaptación a lenguas de bajos recursos: si el ajuste efectivamente cubre dhivehi, podría emplearse para estudiar la transferencia de un modelo multimodal a un idioma con pocos datos, aunque la falta de evaluación impide garantizar calidad.
- Prototipado de asistentes multimodales: al aceptar entradas de imagen y texto, puede integrarse en demos de descripción de imágenes o respuesta a preguntas visuales, siempre con validación previa.
- Evaluación comparativa de derivados comunitarios: útil como caso de estudio de modelos publicados sin model card detallada, para analizar riesgos de reproducibilidad y trazabilidad.
- Base para nuevos ajustes: al estar en FP16 y con licencia Apache 2.0, puede reutilizarse como punto de partida para fine-tunings adicionales con requisitos de licencia permisiva.
- Docencia y formación: sirve para ilustrar el flujo completo de ajuste con Unsloth y TRL y la exportación de pesos, aunque no se recomienda su uso en producción sin una evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 10,2 GB solo para los pesos (5.123.178.051 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB de VRAM.
- VRAM estimada en cuantización 4 bits (si se reconvierte): en torno a 2,6-3 GB para los pesos, más overhead; viable en GPUs de consumo con 8 GB o más.
- GPUs recomendadas: para FP16, RTX 4090 (24 GB), A100 (40/80 GB) o H100; para 4 bits, RTX 3060/4060 Ti (8-16 GB) o superiores.
- Cabe en GPU de consumo: sí, en FP16 con 16 GB o más (por ejemplo RTX 4080/4090); en 4 bits, en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio); vLLM, llama.cpp u Ollama no están confirmados para esta variante.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| 4nn4ss/gemma4-e2b-dhivehi | 5.123.178.051 | no disponible | apache-2.0 | safetensors FP16 | Ajuste comunitario sin documentación ni benchmarks |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | no disponible | no disponible | no disponible | bnb-4bit | Modelo base cuantizado a 4 bits del que deriva |
| Gemma 4 E2B instructivo (original) | no disponible | no disponible | no disponible | no disponible | Modelo original de Google; datos no confirmados en la información disponible |

No se dispone de datos suficientes para comparar rendimiento, contexto o calidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, el procedimiento y la evaluación: no es posible verificar qué ha aprendido el modelo ni con qué calidad.
- Riesgo elevado de alucinación y de degradación del comportamiento instructivo original, habitual en ajustes finos sin evaluación publicada.
- La etiqueta de idioma declara únicamente `en`, pese al nombre del repositorio; el soporte real de dhivehi no está confirmado.
- Sesgos conocidos: no documentados; al derivar de un modelo base no evaluado en este repositorio, se heredan los sesgos del mismo sin cuantificar.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los términos del modelo base y de los datos de ajuste sean compatibles.
- El modelo se publica en FP16 con 5.123 millones de parámetros, lo que implica un consumo de memoria considerable para su tamaño nominal.
- No se recomienda su uso en producción sin una evaluación propia exhaustiva y sin una model card completa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/4nn4ss/gemma4-e2b-dhivehi
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
