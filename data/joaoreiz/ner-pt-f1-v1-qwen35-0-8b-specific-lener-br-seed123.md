# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed123

## Resumen

`ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativa en portugués, desarrollado por JoaoReiz. Se basa en el modelo `Qwen/Qwen3.5-0.8B` y está entrenado específicamente sobre el corpus LeNER-Br, un conjunto de textos jurídicos brasileños. El modelo resuelve la tarea de extraer entidades (personas, organizaciones, lugares, etc.) generando una salida estructurada en JSON con etiquetas y tokens, en lugar de la clasificación token a token tradicional.

La relevancia de este adaptador radica en su enfoque generativo con inferencia restringida mediante JSON, lo que permite una integración limpia en pipelines de procesamiento de lenguaje natural. Al ser un modelo de 0.8B con un adaptador LoRA, es ligero y adecuado para entornos con recursos limitados. Forma parte de una matriz de investigación más amplia que explora diferentes tamaños de modelo, semillas y corpus, aunque esta ficha se centra en la ejecución concreta con semilla 123.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-0.8B) con adaptador LoRA |
| Parametros totales | 0.8B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en BF16) |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | no disponible (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el transformer decoder `Qwen/Qwen3.5-0.8B` en una revisión específica (`2fc06364715b967f1860aea9cf38778875588b17`). El entrenamiento se realizó en precisión BF16 con LoRA, sobre el dataset LeNER-Br, con semilla 123. La selección del checkpoint se hizo mediante la F1 end-to-end en el conjunto de validación, sin usar el split de test para la selección. La inferencia canónica emplea vLLM con temperatura 0 y una salida JSON restringida con el esquema `labels_and_tokens`. No se mencionan otras innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto estructurado para NER: produce etiquetas y tokens en formato JSON.
- Reconocimiento de entidades nombradas en portugués brasileño, específicamente en el dominio jurídico (LeNER-Br).
- Inferencia determinista con temperatura 0 y restricción de esquema JSON.
- Compatible con vLLM para despliegue de baja latencia.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo puede procesar contratos, sentencias y escritos jurídicos en portugués para identificar automáticamente personas, organizaciones, lugares y fechas, facilitando la indexación y búsqueda en repositorios legales.
- Análisis de jurisprudencia: permite extraer entidades de decisiones judiciales para construir bases de datos estructuradas que apoyen la investigación jurídica y la comparación de casos.
- Revisión documental asistida: en despachos de abogados, el modelo puede preprocesar grandes volúmenes de documentos para resaltar entidades relevantes, reduciendo el tiempo de revisión manual.
- Búsqueda semántica en corpus jurídicos: al estructurar las entidades, se pueden implementar sistemas de recuperación de información basados en entidades, mejorando la precisión frente a búsquedas por palabras clave.
- Investigación académica en NLP: sirve como punto de partida para experimentos de NER generativa en portugués, permitiendo comparar enfoques generativos frente a clasificadores tradicionales.
- Automatización de metadatos en bibliotecas digitales: el modelo puede etiquetar automáticamente documentos legales con sus entidades, facilitando la catalogación y el cumplimiento de estándares de metadatos.

## Benchmarks y rendimiento

Se han publicado resultados para el split de test de LeNER-Br en la model card:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| lener_br | 0.8855 | 0.8763 | 0.8809 | 0.9978 |

Estos resultados corresponden únicamente a la semilla 123 y a los splits congelados del corpus. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación disponible.
- Al tratarse de un modelo base de 0.8B con un adaptador LoRA, es probable que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay datos oficiales.
- La inferencia canónica se realiza con vLLM, lo que sugiere compatibilidad con entornos de servidor con GPU.
- No se indican latencias ni throughput estimados.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El autor publica adaptadores similares para otros tamaños (2B, 4B) y otros corpus, pero no se ofrecen resultados comparativos entre ellos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez estructural alta (0.9978) no garantiza la corrección del contenido.
- El modelo no ha sido validado para decisiones de alto riesgo o autónomas; su uso debe limitarse a investigación y experimentación controlada.
- Los resultados reportados corresponden a una única semilla y a splits congelados; la incertidumbre entre semillas requiere completar la matriz de tres semillas.
- El corpus LeNER-Br tiene un esquema de anotación específico; la transferencia a otros dominios o esquemas puede degradar el rendimiento.
- Es necesario revisar las licencias del dataset y del modelo base antes de un uso comercial, ya que la licencia del adaptador no está especificada.
- El modelo solo cubre portugués; no es adecuado para otros idiomas.

## Enlaces

- [HuggingFace - JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed123](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed123)
- [GitHub - peluz/lener-br (dataset LeNER-Br)](https://github.com/peluz/lener-br)
- [Adaptador similar para 2B - JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed123](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed123)
- [Adaptador similar para 4B - JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed3407](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed3407)
- [Página del modelo en FriendliAI](https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed123)
