# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed3407

## Resumen

Este modelo es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen3.5-0.8B y está entrenado específicamente sobre el corpus HAREM oficial, un estándar de referencia para NER en portugués europeo. El adaptador forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) que explora diferentes tamaños de modelo base y semillas.

El enfoque es generativo: en lugar de clasificar tokens individualmente, el modelo produce etiquetas y entidades en formato JSON estructurado, lo que permite una salida más flexible y legible. La inferencia canónica se realiza con vLLM a temperatura 0 y con generación restringida a un esquema JSON (`labels_and_tokens`). El adaptador es ligero (0.1 GB) y está pensado para investigación y experimentación controlada en NER portuguesa, no para uso en producción de alto riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-0.8B (arquitectura del base no especificada) |
| Parametros totales | No disponible (adaptador LoRA, tamano del repo 0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenamiento en BF16) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | PEFT (LoRA), formato de archivo no especificado |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el modelo base Qwen3.5-0.8B, que es un modelo de lenguaje de tipo transformer (aunque no se detalla su arquitectura interna en la informacion disponible). El adaptador se entrena con precision BF16 y la tecnica LoRA, lo que permite ajustar el modelo con un coste computacional reducido. El dataset de entrenamiento es `harem_official`, un corpus de referencia para NER en portugues. La seleccion del checkpoint se realiza mediante la F1 end-to-end en el conjunto de validacion, sin usar el conjunto de test para la seleccion. La inferencia canonica emplea vLLM con temperatura 0 y generacion restringida a un esquema JSON, lo que garantiza una salida estructuralmente valida en la mayoria de los casos (validez estructural de 0.9969 en el test).

## Capacidades

- Reconocimiento de entidades nombradas en portugues: identifica personas, organizaciones, lugares, fechas y otros tipos de entidades segun el esquema HAREM.
- Generacion estructurada: produce salidas en formato JSON con etiquetas y tokens, facilitando la integracion en pipelines de procesamiento de texto.
- Inferencia determinista: con temperatura 0 y restriccion de esquema, las salidas son reproducibles y estructuralmente consistentes.
- Soporte de generacion condicionada: al ser un modelo generativo, puede adaptarse a diferentes esquemas de anotacion mediante el prompt adecuado.
- Multilingue limitado: aunque el entrenamiento es especifico para portugues, el modelo base Qwen3.5-0.8B puede tener capacidades multilingues generales, pero no se han evaluado en este adaptador.
- No incluye capacidades de vision, audio ni tool calling: es un modelo puramente textual para NER.

## Casos de uso

- Investigacion academica en NER portuguesa: el modelo permite reproducir experimentos y comparar metricas con otros sistemas en el corpus HAREM, gracias a su protocolo documentado y a los artefactos de reproducibilidad incluidos en el repositorio.
- Extraccion de entidades en documentos legales o administrativos en portugues: puede utilizarse para identificar nombres de personas, organizaciones y lugares en contratos o expedientes, siempre que se valide previamente en el dominio especifico.
- Analisis de noticias y textos periodisticos: el modelo puede extraer entidades de articulos en portugues para alimentar sistemas de recomendacion o clasificacion tematica.
- Construccion de bases de conocimiento: integrando el modelo en un pipeline de procesamiento, se pueden extraer entidades de grandes volumenes de texto y estructurarlas en grafos de conocimiento.
- Evaluacion de esquemas de anotacion: al ser generativo, permite probar diferentes formatos de salida (JSON, etiquetas) y comparar su impacto en la F1, util para disenar nuevos corpus.
- Experimentacion controlada en entornos de investigacion: el adaptador esta disenado para ser cargado con PEFT sobre la revision exacta del modelo base, lo que facilita la reproduccion de resultados en entornos academicos.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al conjunto de test de `harem_official` para esta ejecucion concreta (seed 3407):

| Metrica | Valor |
|---|---|
| Precision | 0.7862 |
| Recall | 0.7613 |
| F1 | 0.7735 |
| Validez estructural | 0.9969 |

Estos resultados describen solo los splits congelados y esta semilla especifica. La incertidumbre entre semillas requiere completar la matriz de tres semillas. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.8B, el requisito de VRAM es reducido: el modelo base en BF16 ocupa aproximadamente 1.6 GB, mas el adaptador (0.1 GB) y el overhead de inferencia.
- Puede ejecutarse en GPUs consumer como RTX 3060, RTX 4060 o superiores con al menos 8 GB de VRAM.
- Para la inferencia canonica se recomienda vLLM, que soporta generacion restringida por esquema JSON.
- Tambien es posible usar PEFT con transformers para cargar el adaptador sobre el modelo base.
- No se dispone de datos de latencia o throughput estimados en la informacion proporcionada.

## Comparativa con modelos similares

El autor ha publicado variantes del mismo adaptador sobre modelos base de mayor tamano:

| Modelo | Base | Tamano del repo | F1 (harem_official) |
|---|---|---|---|
| ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed3407 | Qwen3.5-0.8B | 0.1 GB | 0.7735 |
| ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed3407 | Qwen3.5-2B | No disponible | No disponible |
| ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407 | Qwen3.5-4B | No disponible | No disponible |

No se dispone de resultados comparativos publicados entre estas variantes ni con otros sistemas de NER portuguesa en la informacion disponible.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos: la validez estructural no garantiza la correccion del contenido.
- El modelo no ha sido validado para decisiones de alto riesgo o autonomas; su uso debe limitarse a investigacion y experimentacion controlada.
- Los resultados de rendimiento estan limitados al corpus HAREM y a esta semilla concreta; no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.
- Los esquemas de anotacion de otros corpus pueden diferir, lo que afectaria a la transferibilidad del modelo.
- La licencia del modelo no esta especificada, por lo que se debe revisar la licencia del modelo base Qwen3.5-0.8B y la del dataset HAREM antes de cualquier uso comercial.
- No se han evaluado sesgos especificos del modelo en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed3407
- Variante 2B: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed3407
- Variante 4B: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407
- Despliegue en FriendliAI: https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407
