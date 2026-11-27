# Manarbhhh/arainsights-gemma4-sentiment-lora

## Resumen

AraInsights-gemma4-sentiment-lora es un adaptador LoRA de clasificación de sentimiento en árabe, desarrollado por Manar Alharbi (usuario Manarbhhh) y publicado en Hugging Face. Se construye sobre el modelo base google/gemma-4-E2B-it mediante fine-tuning supervisado (SFT) con LoRA, y su tarea concreta es clasificar reseñas de clientes en árabe como positivas o negativas, devolviendo una salida estructurada en JSON.

El modelo resuelve un problema acotado y frecuente en el procesamiento de lenguaje natural en árabe: la ausencia de clasificadores de sentimiento ligeros y ajustables para dominios de reseñas. Al ser un adaptador PEFT sobre un modelo Gemma 4 de la familia E2B (orientada a eficiencia), el coste de almacenamiento y de despliegue es bajo, y el adaptador puede combinarse con el modelo base sin necesidad de reentrenar los pesos completos.

Es relevante ahora por dos motivos: por un lado, el ecosistema Gemma 4 sigue ampliándose con adaptadores especializados de terceros; por otro, el modelo reporta una precisión del 93,40 % y un macro-F1 del 93,40 % en el conjunto de test de AraInsights, métricas que, si se confirman de forma independiente, lo sitúan como un clasificador binario de sentimiento en árabe competitivo para su tamaño. No obstante, el repositorio no incluye pesos en formato completo, solo el adaptador, y no se han publicado detalles sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es google/gemma-4-E2B-it) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion segun su propia ficha) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 (adaptador); el modelo base Gemma requiere aceptar su licencia propia |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-4-E2B-it, un modelo de la familia Gemma 4 en su variante E2B, orientada a eficiencia. La técnica de ajuste es SFT (supervised fine-tuning) combinada con LoRA, es decir, se congelan los pesos del modelo base y se entrenan matrices de baja dimensión insertadas en las capas del transformer. El repositorio solo contiene los pesos del adaptador, no los del modelo base, por lo que la inferencia requiere descargar y cargar google/gemma-4-E2B-it por separado.

La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, capas objetivo), la tasa de aprendizaje ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. El único dato de entrenamiento disponible es que el mejor checkpoint se seleccionó por macro-F1 de validación, lo que indica una partición de validación y una métrica de selección orientada al equilibrio entre clases. No se documentan innovaciones técnicas adicionales más allá del uso estándar de PEFT.

## Capacidades

- Clasificación binaria de sentimiento en árabe: devuelve `{"sentiment":"positive"}` o `{"sentiment":"negative"}`.
- Generación de texto conversacional heredada del modelo base Gemma 4 E2B-it, aunque el adaptador está especializado en la tarea de sentimiento.
- Procesamiento de reseñas de clientes en árabe, especialmente reseñas cortas.
- Salida estructurada en JSON, adecuada para integración en pipelines automatizados.
- Capacidades multilingües: limitadas al árabe según la model card; no se documenta soporte para otros idiomas.
- Tool calling, function calling, agentes y razonamiento multi-paso: no documentados para este adaptador.
- Vision, audio o modo thinking: no documentados.

## Casos de uso

- Análisis de reseñas en comercio electrónico: el adaptador clasifica reseñas de productos en árabe como positivas o negativas, permitiendo agregar métricas de satisfacción por producto o categoría sin intervención manual.
- Monitorización de reputación en redes sociales: se puede aplicar a comentarios y menciones en árabe para detectar picos de sentimiento negativo y activar alertas tempranas.
- Enrutamiento de tickets de soporte: las reseñas o mensajes negativos se dirigen automáticamente a colas de atención prioritaria, mientras que los positivos se archivan o se usan para estudios de satisfacción.
- Investigación académica en PLN árabe: sirve como baseline reproducible para experimentos de clasificación de sentimiento con adaptadores PEFT sobre modelos Gemma.
- Etiquetado asistido de datasets: el modelo puede preetiquetar grandes volúmenes de reseñas en árabe, que luego se revisan manualmente, reduciendo el coste de anotación.
- Cuadros de mando de voz del cliente: integrado en pipelines de analítica, alimenta dashboards con la proporción de sentimiento positivo y negativo por periodo, canal o segmento.
- Filtrado de contenido en foros y marketplaces: detección de reseñas negativas para moderación o para respuestas automáticas de atención al cliente.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AraInsights (test) | Accuracy | 93,40 % |
| AraInsights (test) | Macro F1 | 93,40 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las métricas anteriores proceden de la model card del autor y no se han verificado de forma independiente; además, el conjunto de test de AraInsights no está documentado públicamente en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del tamaño del modelo base google/gemma-4-E2B-it, que no se detalla en la información proporcionada. El adaptador LoRA en sí ocupa un espacio mínimo (el repositorio reporta 0,0 GB).
- GPU recomendadas: no disponibles. La model card indica únicamente que se requiere una GPU y que el modelo base debe cargarse en bfloat16 con `device_map="auto"`.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; depende de los requisitos del modelo base.
- Opciones de despliegue: la model card documenta el uso con `transformers`, `peft` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el adaptador se apoya en google/gemma-4-E2B-it, pero no se han publicado datos de parámetros, contexto ni rendimiento de ese modelo base en la información disponible, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AraInsights-gemma4-sentiment-lora | no disponible (adaptador LoRA) | no disponible | Accuracy 93,40 % / Macro F1 93,40 % (test AraInsights) | Apache 2.0 (adaptador) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado para reseñas cortas en árabe; su rendimiento puede degradarse con textos largos, sarcasmo, lenguaje mixto (árabe con inglés u otros idiomas) o texto ruidoso.
- Solo se documenta el idioma árabe; no hay evidencia de buen funcionamiento en otros idiomas.
- Riesgo de alucinación y de formato incorrecto: aunque la salida esperada es JSON con `positive` o `negative`, no se garantiza que el modelo respete siempre ese formato en entradas fuera de distribución.
- Las métricas reportadas (93,40 % de accuracy y macro-F1) proceden del autor y no han sido verificadas de forma independiente; el conjunto de test no está documentado.
- El adaptador no incluye los pesos del modelo base: es obligatorio descargar google/gemma-4-E2B-it y aceptar la licencia de Gemma, que es distinta de la Apache 2.0 del adaptador.
- Uso comercial: la licencia Apache 2.0 del adaptador no exime de cumplir la licencia del modelo base Gemma; conviene revisar sus términos antes de un despliegue en producción.
- No se documentan sesgos conocidos, pero al ser un clasificador binario de sentimiento puede amplificar sesgos presentes en los datos de entrenamiento, que no se describen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Manarbhhh/arainsights-gemma4-sentiment-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
