# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed42

## Resumen

El modelo `ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed42` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen/Qwen3.5-0.8B y está entrenado específicamente sobre el corpus LeNER-Br, un conjunto de datos de referencia para NER en portugués brasileño. El adaptador forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) que explora diferentes tamaños de modelo base, semillas y regímenes de entrenamiento.

Este artefacto resuelve el problema de extracción de entidades mediante generación estructurada: en lugar de clasificar tokens individualmente, el modelo genera etiquetas y tokens en formato JSON restringido, lo que permite una salida directamente interpretable. Su relevancia radica en ofrecer una alternativa ligera (0.8B de parámetros) para tareas de NER en portugués, con un rendimiento competitivo (F1 de 0.9004 en LeNER-Br) y un coste computacional reducido. El adaptador se distribuye como un repositorio PEFT que debe cargarse sobre la revisión exacta del modelo base indicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B, detalles no especificados) |
| Parametros totales | 0.8B (modelo base) + adaptador LoRA (tamano del repo: 0.1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en BF16 con LoRA) |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | PEFT (LoRA adapter) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer de 0.8 mil millones de parametros. No se proporcionan detalles adicionales sobre la arquitectura interna del modelo base (numero de capas, dimensiones, etc.) en la informacion disponible. El adaptador se entrena en precision BF16 con LoRA, lo que reduce significativamente los requisitos de memoria y computo en comparacion con un ajuste fino completo.

El entrenamiento se realiza sobre el dataset LeNER-Br, un corpus de NER en portugues brasileño, con una semilla fija (seed 42). La seleccion del checkpoint se basa en la F1 end-to-end sobre el conjunto de validacion, sin utilizar el conjunto de test para la seleccion. La inferencia canonica se realiza con vLLM, temperatura 0, y salida restringida a JSON con el esquema `labels_and_tokens`. La politica para salidas invalidas es prediccion vacia en la puntuacion end-to-end. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativo en portugues, incluyendo personas, organizaciones, lugares y otros tipos de entidades definidos en el corpus LeNER-Br.
- Generacion estructurada: produce salidas en formato JSON restringido (esquema `labels_and_tokens`), lo que facilita la integracion en pipelines automaticos.
- Inferencia determinista: con temperatura 0, el modelo genera salidas reproducibles.
- Soporte para evaluacion end-to-end: la F1 se calcula sobre la salida completa, no solo sobre tokens individuales.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso.

## Casos de uso

- Extraccion de entidades en documentos legales portugueses: el corpus LeNER-Br incluye textos juridicos, por lo que el modelo es adecuado para extraer nombres de personas, organizaciones y lugares en contratos, sentencias y otros documentos legales.
- Investigacion academica en PLN: sirve como punto de partida para experimentos comparativos en NER para portugues, especialmente en entornos con recursos computacionales limitados.
- Construccion de pipelines de enriquecimiento de datos: la salida JSON estructurada permite integrar el modelo en sistemas de procesamiento de texto que requieren extraccion de entidades de forma automatica.
- Prototipado rapido de aplicaciones de NER: al ser un adaptador ligero, puede desplegarse en entornos de desarrollo para validar hipotesis antes de escalar a modelos mas grandes.
- Evaluacion de tecnicas de generacion estructurada: el modelo sirve como caso de estudio para comparar enfoques de NER generativo frente a metodos clasicos de clasificacion de tokens.
- Analisis de textos periodisticos o historicos en portugues: aunque el corpus de entrenamiento es especifico, el modelo puede adaptarse a dominios similares con ajuste adicional.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden a una unica semilla (seed 42) y a los conjuntos congelados del corpus LeNER-Br. No se proporcionan comparaciones con otros modelos en la informacion disponible.

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| LeNER-Br (test) | 0.9004 | 0.9004 | 0.9004 | 0.9986 |

Estos resultados no deben interpretarse como evidencia de rendimiento general fuera de estos corpus. La incertidumbre entre semillas requiere completar la matriz de tres semillas del estudio.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo base de 0.8B, el modelo completo en BF16 ocupa aproximadamente 1.6 GB de memoria, por lo que cabe en GPUs de consumo como la RTX 3060 (12 GB) o superiores.
- Para la inferencia con vLLM, se recomienda una GPU con al menos 4 GB de VRAM para el modelo base y el adaptador, aunque no se especifican requisitos exactos.
- El entrenamiento con LoRA en BF16 requiere una GPU con soporte para BF16 (por ejemplo, RTX 3090, A100, H100) y suficiente memoria para el modelo base y los gradientes.
- Opciones de despliegue: vLLM (inferencia canonica), Hugging Face Transformers con PEFT, y potencialmente llama.cpp si se convierte el modelo a GGUF (no documentado).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

El autor ha publicado variantes del mismo experimento con modelos base de 2B y 4B parametros, pero no se dispone de resultados comparativos en la informacion proporcionada. La siguiente tabla resume las variantes conocidas:

| Modelo | Tamano base | Dataset | Semilla |
|---|---|---|---|
| ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed42 | 0.8B | LeNER-Br | 42 |
| ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed42 | 2B | LeNER-Br | 42 |
| ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42 | 2B | HAREM | 42 |
| ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed3407 | 4B | LeNER-Br | 3407 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- El modelo no ha sido validado para decisiones de alto riesgo o autonomas; su uso debe limitarse a investigacion, evaluacion y experimentacion controlada.
- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos, lo que requiere revision humana en aplicaciones criticas.
- El entrenamiento se realizo sobre un corpus especifico (LeNER-Br); el rendimiento en otros dominios o variantes del portugues puede degradarse.
- La licencia no esta especificada, por lo que se debe contactar al autor antes de un uso comercial.
- Los resultados reportados corresponden a una unica semilla y a conjuntos congelados; no representan el rendimiento esperado en otros datos.
- El adaptador debe cargarse sobre la revision exacta del modelo base indicada (`2fc06364715b967f1860aea9cf38778875588b17`); usar otra revision puede producir resultados inconsistentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-lener-br-seed42
- Dataset LeNER-Br (GitHub): https://github.com/peluz/lener-br
- Variante 2B (LeNER-Br): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed42
- Variante 2B (HAREM): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42
- Variante 4B (LeNER-Br): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed3407
