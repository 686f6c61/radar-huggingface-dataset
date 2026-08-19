# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-cachacaner-seed42

## Resumen

El modelo `ner-pt-f1-v1-qwen35-0-8b-specific-cachacaner-seed42` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz como parte de una matriz de investigación denominada `ner-pt-generative-2026-f1-v1`. Se basa en el modelo `Qwen/Qwen3.5-0.8B` y está diseñado para generar etiquetas y tokens de forma estructurada mediante JSON restringido, en lugar de la clasificación de tokens tradicional.

El adaptador se entrena específicamente sobre el corpus cachacaner con una semilla fija (42) y selección de checkpoint basada en F1 end-to-end sobre validación. Su relevancia radica en ofrecer una alternativa generativa para NER en portugués, con una validez estructural perfecta en las pruebas reportadas, aunque el autor advierte que los resultados no deben generalizarse fuera de los corpus evaluados.

Al tratarse de un adaptador PEFT, no es un modelo autónomo: requiere cargar el modelo base Qwen3.5-0.8B en la revisión exacta indicada y aplicar el adaptador mediante la librería PEFT. El repositorio incluye artefactos de investigación para reproducibilidad, como predicciones congeladas, métricas y manifiestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-0.8B (arquitectura del modelo base no detallada) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB en el repositorio) |
| Parametros activos | no aplicable (adaptador LoRA, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16, inferencia con vLLM) |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | PEFT (LoRA adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el modelo base `Qwen/Qwen3.5-0.8B` en su revisión exacta `2fc06364715b967f1860aea9cf38778875588b17`. El entrenamiento se realizó en precisión BF16 con LoRA, sobre el dataset cachacaner, con una semilla fija de 42. La inferencia canónica se define con vLLM, temperatura 0 y generación restringida a JSON con el esquema `labels_and_tokens`. La selección del checkpoint se hizo por F1 end-to-end en validación, sin usar el split de test para la selección.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación principal reside en el uso de generación estructurada para NER, en lugar de la clasificación de tokens clásica, lo que permite una salida con validez estructural garantizada (1.0000 en el test reportado).

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugués, produciendo etiquetas y tokens en formato JSON estructurado.
- Generación restringida mediante esquema `labels_and_tokens` con vLLM, lo que asegura que la salida cumple la estructura esperada.
- Inferencia determinista con temperatura 0, adecuada para tareas de extracción reproducible.
- Capacidad de adaptación a otros corpus mediante fine-tuning LoRA, como se evidencia en la matriz de investigación con variantes de 2B y 4B.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio; el modelo está especializado en NER.

## Casos de uso

- Extracción de entidades en textos jurídicos o administrativos portugueses: el modelo puede identificar personas, organizaciones, lugares y fechas en documentos legales, facilitando la automatización de procesos de revisión documental.
- Análisis de noticias y redes sociales en portugués: permite extraer entidades de artículos periodísticos o publicaciones para alimentar sistemas de monitorización de marca o análisis de opinión.
- Enriquecimiento de bases de datos bibliográficas: aplicación sobre abstracts o referencias para extraer autores, títulos y afiliaciones de forma estructurada.
- Preprocesamiento para sistemas de búsqueda semántica: las entidades extraídas pueden indexarse para mejorar la recuperación de información en corpus portugueses.
- Investigación académica en PLN: sirve como punto de partida para comparar enfoques generativos frente a clasificadores de tokens en NER para portugués.
- Prototipado de pipelines de extracción con salida JSON: al generar directamente JSON válido, se integra fácilmente en aplicaciones que consumen datos estructurados sin post-procesamiento adicional.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el split de test del corpus cachacaner, con la configuración de inferencia canónica (vLLM, temperatura 0, JSON restringido):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| cachacaner | 0.9302 | 0.9203 | 0.9252 | 1.0000 |

No se proporcionan comparaciones con otros modelos en la información disponible. El autor advierte que estos resultados corresponden a un único seed y a splits congelados, y que no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0.1 GB, el requisito principal es el del modelo base Qwen3.5-0.8B, que es un modelo pequeño y puede ejecutarse en GPUs de consumo.
- No se especifican requisitos de VRAM en la información disponible; se recomienda consultar la documentación del modelo base.
- La inferencia canónica se realiza con vLLM, que requiere una GPU compatible con CUDA y suficiente memoria para el modelo base más el adaptador.
- Alternativas de despliegue: vLLM (recomendado por el autor), y potencialmente otras herramientas compatibles con PEFT como Hugging Face Transformers.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

La matriz de investigación incluye variantes del mismo adaptador sobre modelos base de 2B y 4B (por ejemplo, `ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed3407` y `ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed3407`), pero no se dispone de sus resultados en la información proporcionada. No se conocen otros modelos comparables de NER generativa en portugués con especificaciones públicas en este contexto.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos; la validez estructural no garantiza la corrección del contenido.
- Los resultados reportados corresponden a un único seed y a splits congelados; la incertidumbre entre semillas requiere completar la matriz de tres semillas.
- El modelo no ha sido validado para decisiones de alto riesgo o autónomas; su uso debe limitarse a investigación, evaluación y experimentación controlada.
- Los esquemas de anotación de los corpus difieren, y el solapamiento de texto puede afectar las estimaciones de rendimiento.
- La licencia no está disponible, por lo que se debe revisar la licencia del modelo base y del dataset antes de cualquier uso comercial.
- Es necesario cargar el adaptador sobre la revisión exacta del modelo base indicada; usar otra revisión puede producir resultados inconsistentes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-cachacaner-seed42
- Variante 2B (misma matriz): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed3407
- Variante 4B (misma matriz): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed3407
- Página de despliegue en FriendliAI (variante 4B): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed3407
- Página de despliegue en FriendliAI (variante 2B): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-cachacaner-seed123
