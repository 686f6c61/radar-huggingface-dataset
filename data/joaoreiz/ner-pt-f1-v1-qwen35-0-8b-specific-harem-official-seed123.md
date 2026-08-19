# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed123

## Resumen

El modelo `ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen/Qwen3.5-0.8B y forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) que explora diferentes tamaños de modelo base, semillas y regímenes de entrenamiento. El adaptador está diseñado para producir salidas estructuradas en JSON con etiquetas y tokens, lo que permite una integración directa en pipelines de extracción de información.

Este modelo es relevante porque aborda la tarea de NER en portugués mediante generación condicionada, en lugar de la clasificación de tokens tradicional, lo que puede simplificar el postprocesado y mejorar la coherencia estructural. Al ser un adaptador LoRA, es ligero y fácil de desplegar sobre el modelo base, lo que lo hace atractivo para investigación y experimentación controlada. La model card incluye resultados de evaluación en el corpus HAREM oficial, con una F1 de 0.7819 y una validez estructural del 99,69%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-0.8B (transformer, detalles no especificados) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0.8B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en BF16) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio PEFT, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-0.8B en su revisión específica `2fc06364715b967f1860aea9cf38778875588b17`. El entrenamiento se realizó en precisión BF16 con LoRA, utilizando el dataset `harem_official` y una semilla fija (seed 123). La selección del checkpoint se basó en la F1 end-to-end de validación, sin usar el split de test para la selección. La inferencia canónica se realiza con vLLM, temperatura 0 y salida restringida a JSON con el esquema `labels_and_tokens`. La política para salidas inválidas es la predicción vacía en la puntuación end-to-end.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La innovación principal reside en el uso de generación estructurada con restricciones JSON para NER, lo que garantiza una alta validez estructural de las salidas.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugues, produciendo etiquetas y tokens en formato JSON estructurado.
- Generacion de texto condicionada a un esquema de salida restringido (`labels_and_tokens`), lo que facilita el parseo automatico.
- Clasificacion de tokens (pipeline `token-classification`) con soporte para inferencia via vLLM.
- Capacidad multilingue limitada al portugues (pt), segun la model card.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion academica en NER para portugues: el modelo permite evaluar tecnicas de generacion estructurada frente a metodos clasicos de clasificacion de tokens, con una metrica de validez estructural que facilita el analisis de errores.
- Extraccion de informacion en corpus periodisticos o literarios: al estar entrenado en HAREM, puede aplicarse a textos similares para identificar personas, organizaciones, lugares y otras entidades, con salida JSON lista para integracion en bases de datos.
- Prototipado rapido de pipelines de NER: gracias a su tamano reducido (0.8B base) y al uso de LoRA, puede desplegarse en entornos de desarrollo con recursos limitados para pruebas de concepto.
- Evaluacion comparativa de adaptadores LoRA: al existir variantes con bases de 2B y 4B del mismo autor, permite estudiar el impacto del tamano del modelo base en la calidad del NER generativo.
- Generacion de datos etiquetados para otros modelos: las salidas estructuradas pueden usarse para crear datasets sinteticos o para aumentar corpus existentes, siempre que se validen manualmente.
- Experimentacion controlada en entornos academicos: la model card especifica protocolos de reproducibilidad (manifest, hashes, seleccion de checkpoint), lo que lo hace adecuado para estudios que requieren trazabilidad.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el split de test del dataset `harem_official`:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| harem_official | 0.7911 | 0.7728 | 0.7819 | 0.9969 |

Estos resultados corresponden a una unica semilla (123) y a los splits congelados indicados. La model card advierte que no deben interpretarse como evidencia de rendimiento general fuera de estos corpus, y que la incertidumbre entre semillas requiere completar la matriz de tres semillas.

## Requisitos de hardware

- No se proporcionan requisitos especificos de hardware en la informacion disponible.
- Al ser un adaptador LoRA sobre un modelo base de 0.8B, la inferencia puede ejecutarse en GPUs consumer con poca VRAM (por ejemplo, 4-6 GB), aunque no hay datos confirmados.
- El entrenamiento se realizo en BF16, lo que sugiere compatibilidad con GPUs modernas (serie RTX 30/40, A100, etc.), pero no se especifican requisitos minimos.
- Opciones de despliegue: la model card menciona vLLM como motor de inferencia canonico; tambien es posible usar PEFT con el modelo base y otras herramientas compatibles con LoRA.
- No se indican metricas de latencia ni throughput.

## Comparativa con modelos similares

El autor ha publicado variantes del mismo adaptador con diferentes tamanos de modelo base:

| Modelo | Base | Seed | F1 (harem_official) | Validez estructural |
|---|---|---|---|---|
| ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed123 | Qwen3.5-0.8B | 123 | 0.7819 | 0.9969 |
| ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed123 | Qwen3.5-2B | 123 | No disponible | No disponible |
| ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407 | Qwen3.5-4B | 3407 | No disponible | No disponible |

No se dispone de resultados publicos para las variantes de 2B y 4B en la informacion encontrada. Tampoco se han localizado comparaciones con otros modelos NER en portugues (como XLM-R o BERTimbau) en los resultados de busqueda.

## Limitaciones y advertencias

- La model card advierte que los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; es decir, el modelo puede producir JSON bien formado con entidades erroneas.
- Los esquemas de anotacion de los corpus pueden diferir, lo que afecta a la transferencia a otros dominios.
- Puede haber solapamiento de texto entre los splits de entrenamiento y evaluacion, lo que podria inflar las metricas.
- El modelo no ha sido validado para decisiones de alto riesgo ni para uso autonomo; se recomienda revision humana en aplicaciones criticas.
- La licencia no esta especificada, por lo que se debe contactar con el autor o revisar el repositorio antes de un uso comercial.
- Los resultados reportados corresponden a una unica semilla y a un corpus concreto; no se garantiza el rendimiento en otros conjuntos de datos.
- No se proporcionan detalles sobre sesgos demograficos o linguisticos especificos del portugues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-harem-official-seed123
- Variante 2B: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed123
- Variante 4B: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407
- Despliegue en FriendliAI (variante 4B): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed3407
