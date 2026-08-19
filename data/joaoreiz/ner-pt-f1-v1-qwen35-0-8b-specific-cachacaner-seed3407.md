# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-cachacaner-seed3407

## Resumen

Este modelo es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativa en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen/Qwen3.5-0.8B y ha sido entrenado específicamente sobre el corpus cachacaner, dentro de una matriz de investigación más amplia denominada `ner-pt-generative-2026-f1-v1`. El adaptador está pensado para tareas de NER en las que se genera una salida estructurada (JSON) con las etiquetas y los tokens correspondientes, en lugar de una clasificación token a token clásica.

Su relevancia radica en que combina un modelo base pequeño (0.8B parámetros) con un adaptador LoRA, lo que permite experimentar con NER generativa en portugués con requisitos de hardware moderados. La model card del autor indica que el modelo está destinado a investigación, evaluación y experimentación controlada, y no para decisiones autónomas de alto riesgo. No se especifican la longitud de contexto ni la licencia en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-0.8B (transformer) |
| Parametros totales | no disponible (el adaptador es de ~0.1 GB; el modelo base tiene 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en BF16) |
| Idiomas soportados | Portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | PEFT (LoRA), safetensors (presumiblemente) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se monta sobre el modelo base Qwen3.5-0.8B, un transformer de 0.8 mil millones de parametros. El entrenamiento se realizo en precision BF16 con LoRA, sobre el dataset cachacaner, y la seleccion del checkpoint se hizo mediante la F1 end-to-end en el conjunto de validacion, sin usar el test para la seleccion. La inferencia canonica se define con vLLM, temperatura 0 y generacion restringida a un esquema JSON `labels_and_tokens`. La politica para salidas invalidas es devolver una prediccion vacia en la puntuacion end-to-end.

No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La model card menciona que se trata de una ejecucion con una semilla concreta (3407) dentro de una matriz de tres semillas, por lo que los resultados deben interpretarse con cautela.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativa en portugues, produciendo etiquetas y tokens en formato JSON estructurado.
- Generacion de salidas con validez estructural alta (0.9996 en el test), aunque la correccion semantica no esta garantizada.
- Integracion con vLLM para inferencia con temperatura 0 y restriccion de esquema JSON.
- Soporte de entrenamiento y carga mediante PEFT (LoRA) sobre el modelo base especifico.
- Capacidad multilingue limitada: solo portugues (pt) segun la model card.

## Casos de uso

- Investigacion academica en NER generativa: el modelo permite estudiar el comportamiento de la generacion estructurada frente a la clasificacion clasica, especialmente en portugues.
- Evaluacion comparativa de modelos NER: puede usarse como referencia en experimentos controlados con otros adaptadores o modelos base.
- Anotacion asistida de corpus: dado su alto indice de validez estructural, puede ayudar a pre-anotar textos en portugues, aunque requiere revision humana.
- Experimentacion controlada en downstream NLP: al ser un adaptador ligero, es adecuado para probar pipelines de extraccion de informacion en entornos de investigacion.
- Desarrollo de prototipos de extraccion de entidades en dominios especificos (p. ej., periodistico, si cachacaner es un corpus de noticias) con recursos limitados.
- Formacion y docencia: sirve como ejemplo practico de NER generativa con LoRA y generacion restringida por JSON.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de test del corpus cachacaner, para esta ejecucion concreta (semilla 3407):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| cachacaner | 0.9321 | 0.9205 | 0.9263 | 0.9996 |

El autor advierte que estos resultados corresponden a una unica semilla y a splits congelados, y que no deben interpretarse como evidencia de rendimiento general fuera de estos corpus. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.8B, los requisitos de VRAM son moderados. Se estima que puede ejecutarse en GPUs consumer con al menos 4-6 GB de VRAM, aunque no se proporcionan cifras oficiales.
- Se requiere hardware compatible con BF16 para reproducir el protocolo de entrenamiento e inferencia documentado.
- La inferencia canonica se realiza con vLLM, que es la opcion de despliegue recomendada por el autor.
- No se indican requisitos especificos de GPU (p. ej., A100, H100, RTX 4090) ni datos de latencia o throughput.

## Comparativa con modelos similares

El autor ha publicado otros adaptadores de la misma matriz de investigacion, con diferentes tamanos de modelo base y datasets:

- `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42` (modelo base Qwen3.5-2B, dataset harem)
- `JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed3407` (modelo base Qwen3.5-4B, dataset cachacaner)
- `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed3407` (modelo base Qwen3.5-2B, dataset lener-br)

No se dispone de resultados comparativos publicados entre estos modelos. Como alternativa generalista, existe GLiNER (Generalist and Lightweight Model for Named Entity Recognition), pero no se han encontrado comparaciones directas con este adaptador.

## Limitaciones y advertencias

- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez estructural no implica correccion semantica.
- El modelo no ha sido validado para decisiones de alto riesgo o autonomas; su uso debe limitarse a investigacion y experimentacion controlada.
- Los resultados reportados corresponden a una unica semilla y a corpus especificos; la incertidumbre entre semillas requiere completar la matriz de tres semillas.
- La licencia del modelo no esta especificada en la informacion disponible; los usuarios deben revisar las licencias de los datasets utilizados.
- El modelo solo soporta portugues; no es adecuado para otros idiomas.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto; se recomienda evaluar errores en el dominio objetivo antes de cualquier uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-cachacaner-seed3407
- Modelo similar (2B, harem): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-harem-official-seed42
- Modelo similar (4B, cachacaner): https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-cachacaner-seed3407
- Modelo similar (2B, lener-br) en FriendliAI: https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed3407
- Repositorio de GLiNER (alternativa generalista): https://github.com/urchade/GLiNER
