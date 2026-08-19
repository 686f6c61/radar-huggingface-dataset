# JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-paramopama-seed123

## Resumen

Este modelo es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz como parte de una matriz de investigación denominada `ner-pt-generative-2026-f1-v1`. Se basa en el modelo Qwen/Qwen3.5-0.8B y está diseñado para extraer entidades mediante generación estructurada con salida JSON restringida, en lugar de la clasificación de tokens tradicional.

El adaptador se entrena con precisión BF16 y LoRA sobre una revisión específica del modelo base. Su relevancia radica en que ofrece una alternativa ligera y de bajo coste para tareas de NER en portugués, con resultados de F1 en torno a 0.89 en el corpus paramopama. Al ser un adaptador, no es un modelo autónomo: requiere cargar el modelo base Qwen3.5-0.8B y aplicar el adaptador mediante PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-0.8B (arquitectura del base no especificada en la informacion disponible) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB; el base tiene 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en BF16) |
| Idiomas soportados | portugues (pt) |
| Licencia | no disponible |
| Formato de pesos | no disponible (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con LoRA sobre el modelo base Qwen/Qwen3.5-0.8B en una revision concreta (`2fc06364715b967f1860aea9cf38778875588b17`). El regimen de entrenamiento se denomina `specific` y utiliza el dataset paramopama. La seleccion del checkpoint se realiza por F1 end-to-end en validacion, sin usar el split de test para la seleccion. La inferencia canonica se ejecuta con vLLM, temperatura 0 y generacion JSON restringida con el esquema `labels_and_tokens`. La politica para salidas invalidas es prediccion vacia en la puntuacion end-to-end.

No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La informacion disponible se limita a la configuracion de la ejecucion y al protocolo de evaluacion.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativo en portugues, con salida estructurada en JSON.
- Generacion de etiquetas y tokens de entidades de forma conjunta mediante generacion restringida.
- Capacidad de producir salidas estructuralmente validas (validez estructural de 0.9984 en el corpus de prueba).
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, vision o audio.

## Casos de uso

- Extraccion de entidades en documentos legales portugueses: el modelo puede identificar nombres de personas, organizaciones y lugares en contratos o sentencias, generando una salida JSON estructurada que facilita su integracion en sistemas de gestion documental.
- Procesamiento de noticias y articulos periodisticos: permite extraer entidades relevantes para tareas de resumen automatico o clasificacion tematica, aprovechando la generacion restringida para obtener resultados consistentes.
- Analisis de redes sociales en portugues: al ser un modelo ligero (0.8B), puede desplegarse en entornos con recursos limitados para monitorizar menciones de marcas o personas en tiempo real.
- Enriquecimiento de bases de conocimiento: las entidades extraidas pueden alimentar grafos de conocimiento o sistemas de busqueda semantica, con la ventaja de que la salida JSON facilita el mapeo directo a esquemas existentes.
- Investigacion academica en PLN: sirve como punto de partida para estudios comparativos de NER generativo frente a metodos clasicos de clasificacion de tokens, especialmente en portugues.
- Pipelines de anonimizacion de datos: la identificacion de entidades puede utilizarse para detectar y enmascarar informacion personal en textos clinicos o financieros, aunque requiere validacion adicional en dominios especificos.

## Benchmarks y rendimiento

Los resultados publicados corresponden a una unica ejecucion con semilla 123 sobre el split de test del corpus paramopama:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| paramopama | 0.8878 | 0.8886 | 0.8882 | 0.9984 |

La model card advierte que estos resultados describen solo los splits congelados y esta semilla concreta. La incertidumbre entre semillas requiere completar la matriz de tres semillas. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.8B, el requisito de VRAM es reducido. El modelo base en BF16 ocupa aproximadamente 1.6 GB, mas el adaptador (0.1 GB), por lo que cabe en GPUs consumer con 4 GB o mas.
- GPUs recomendadas: cualquier GPU moderna con soporte BF16, como RTX 3090, RTX 4090, A10, A100 o H100. Para inferencia en CPU, podria ejecutarse con cuantizacion, aunque no se documenta.
- Opciones de despliegue: vLLM (mencionado como inferencia canonica), PEFT para carga del adaptador, y potencialmente llama.cpp u Ollama si se convierte el modelo a GGUF, aunque no se indica en la documentacion.
- Latencia y throughput: no disponibles. Dado el tamano reducido, se espera una latencia baja en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

Existen variantes de la misma serie de adaptadores sobre modelos base de mayor tamano, encontradas en la busqueda web:

| Modelo | Base | Tamano del base | Resultados publicados |
|---|---|---|---|
| ner-pt-f1-v1-qwen35-0-8b-specific-paramopama-seed123 | Qwen3.5-0.8B | 0.8B | F1 0.8882 en paramopama |
| ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407 | Qwen3.5-2B | 2B | no disponible |
| ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed3407 | Qwen3.5-4B | 4B | no disponible |

No se dispone de datos comparativos de rendimiento entre estas variantes. Tampoco se conocen otros modelos NER generativos en portugues con los que comparar directamente en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados solo reflejan una semilla y un corpus concreto; no deben interpretarse como evidencia de rendimiento general fuera de estos datos.
- Las entidades generadas pueden ser estructuralmente validas pero semanticamente incorrectas, como advierte la model card.
- Los esquemas de anotacion de los corpus difieren, y puede haber solapamiento de texto que afecte a las estimaciones.
- El modelo no ha sido validado para decisiones de alto riesgo ni para uso autonomo.
- La licencia no esta especificada, por lo que debe revisarse antes de cualquier uso comercial.
- El adaptador requiere cargar la revision exacta del modelo base indicada en la model card; usar otra revision puede producir resultados inconsistentes.
- No se documentan sesgos especificos, pero al entrenarse en un corpus unico (paramopama), es probable que herede sesgos de ese dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-0-8b-specific-paramopama-seed123
- Variante 2B: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed3407
- Variante 4B: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-paramopama-seed3407
- Despliegue en FriendliAI (variante 2B): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-paramopama-seed123
- Despliegue en FriendliAI (variante 4B): https://friendli.ai/models/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-lener-br-seed3407
