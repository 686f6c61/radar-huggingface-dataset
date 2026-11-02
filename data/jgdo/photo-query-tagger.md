# jgdo/photo-query-tagger

## Resumen

photo-query-tagger es un modelo de etiquetado de tokens (token classification) desarrollado por el usuario jgdo, pensado para un propósito muy concreto: descomponer una consulta de búsqueda de fotos en entidades semánticas (personas, lugares y descripción visual), cada una de ellas marcada como deseada o excluida. Se trata de un fine-tuning de microsoft/Multilingual-MiniLM-L12-H384, exportado a ONNX y cuantizado a int8, con el vocabulario recortado de 250 000 a 58 000 piezas para reducir el tamaño del artefacto a unos 45 MB.

El modelo resuelve el problema de interpretar la caja de búsqueda de una fototeca autoalojada: consultas como "Anna ohne Tom am Strand, nicht in Thailand" se traducen en etiquetas que distinguen la persona buscada, la persona excluida, el contenido visual deseado y el lugar vetado. No genera texto ni razona: únicamente asigna una etiqueta a cada palabra de la consulta, y son reglas posteriores (coincidencia de nombres y gacetero de lugares) las que completan la interpretación.

Su relevancia radica en la eficiencia: con 45 MB, 2 ms por consulta en CPU y soporte para 13 idiomas, cubre una tarea de parsing lingüístico que de otro modo requeriría un modelo mucho mayor. La licencia MIT y el formato ONNX lo hacen directamente desplegable en aplicaciones locales sin dependencias de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, 12 capas, dimensión oculta 384), fine-tuning para token classification |
| Parametros totales | no disponible (modelo base Multilingual-MiniLM-L12-H384; artefacto int8 de 45 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo base limitado a 512 tokens; uso previsto en consultas cortas) |
| Tipos de cuantizacion | int8 (pesos ONNX) |
| Idiomas soportados | en, de, fr, es, it, pt, nl, ru, pl, tr, ja, zh, ar |
| Licencia | MIT |
| Formato de pesos | ONNX (`query_tagger.onnx`), tokenizer en formato Hugging Face `tokenizers` (JSON) |

## Arquitectura y entrenamiento

El modelo parte de microsoft/Multilingual-MiniLM-L12-H384, un encoder transformer de 12 capas y 384 dimensiones de hidden size, destilado de XLM-R y con vocabulario SentencePiece multilingüe. Sobre él se aplica una cabeza de clasificación de tokens con 14 etiquetas (B-/I- para PER+, PER-, LOC+, LOC-, TXT+, TXT- más ALONE y O). El vocabulario se poda de 250 000 a 58 000 piezas y el grafo se exporta a ONNX con pesos int8, con entradas `input_ids` y `attention_mask` y salida `logits` de forma batch × tokens × 14.

El entrenamiento es completamente sintético: 200 000 consultas generadas a partir de plantillas en 13 idiomas, con ruido de mayúsculas, puntuación y erratas. Los nombres provienen de múltiples culturas, incluidas formas declinadas del ruso y el polaco; los lugares se extraen de Natural Earth (dominio público), con nombres multi-palabra y localizados; y las frases visuales incluyen colisiones deliberadas con topónimos ("nice beach" frente a "Nice", "turkey with gravy" frente a "Turkey"). El modelo liberado se entrenó con todos los datos durante 3 épocas, batch 64 y learning rate 5e-5. No se usaron consultas reales de usuarios.

## Capacidades

- Etiquetado de tokens a nivel de palabra para consultas de búsqueda fotográfica, con distinción entre entidades deseadas y excluidas.
- Extracción de personas (PER+/PER-), lugares (LOC+/LOC-) y contenido visual (TXT+/TXT-).
- Detección de la etiqueta ALONE para consultas del tipo "Anna allein" o "only Tom".
- Procesamiento multilingüe en 13 idiomas: inglés, alemán, francés, español, italiano, portugués, neerlandés, ruso, polaco, turco, japonés, chino y árabe.
- Manejo de segmentación específica para CJK y kana (cada carácter es una palabra) y para signos de puntuación y apóstrofos.
- No soporta tool calling, function calling, agentes, generación de texto, razonamiento multi-paso ni modalidades de visión o audio.
- No dispone de modo thinking ni de capacidades generativas de ningún tipo.

## Casos de uso

- Búsqueda en fototecas autoalojadas: el modelo interpreta la caja de búsqueda y separa personas, lugares y descripciones visuales, permitiendo consultas como "Tom am Strand, nicht in Thailand" que se traducen en filtros combinados sobre los metadatos de la biblioteca.
- Filtrado por exclusión en catálogos personales: la distinción entre etiquetas positivas y negativas permite construir consultas del tipo "sin X" o "no en Y" sin necesidad de un parser manual, algo útil en bibliotecas con miles de fotos etiquetadas.
- Indexación semántica previa al almacenamiento: al ejecutarse en 2 ms por consulta en CPU, puede integrarse en el pipeline de ingesta para preclasificar consultas guardadas o etiquetas de búsqueda frecuentes.
- Aplicaciones de escritorio y móviles sin GPU: el artefacto ONNX de 45 MB y su consumo de unos 166 MB de memoria lo hacen viable en entornos con recursos limitados, como aplicaciones de gestión fotográfica local.
- Asistentes de búsqueda en asistentes de voz o chatbots de fototeca: la etiqueta ALONE y el parsing de exclusiones permiten convertir lenguaje natural en filtros estructurados dentro de una interfaz conversacional.
- Sistemas de búsqueda multilingüe en bibliotecas compartidas: el soporte de 13 idiomas permite que usuarios de distintas lenguas formulen consultas sobre un mismo catálogo sin adaptar manualmente la sintaxis.
- Componente de un pipeline de búsqueda híbrida: el tagger actúa como primera etapa de parsing y deja la resolución de entidades a reglas posteriores (coincidencia de nombres y gacetero), lo que facilita su integración en arquitecturas de búsqueda ya existentes.

## Benchmarks y rendimiento

| Modelo (mismos datos) | Tamano int8 | F1 held-out | Exact match held-out |
|---|---|---|---|
| Multilingual-MiniLM-L12-H384 (este modelo) | 45 MB (podado) | 0.944 | 0.852 |
| xlm-roberta-base | 279 MB | 0.945 | 0.854 |
| distilbert-base-multilingual-cased | 135 MB | 0.934 | 0.818 |

El conjunto held-out emplea plantillas, nombres, lugares y frases que no aparecen en el entrenamiento. En 95 consultas escritas a mano, la fototeca acierta las 95 con el tagger y las reglas combinadas, pero el autor advierte que el generador de datos se ajustó con esas consultas, por lo que debe tratarse como test de regresión y no como benchmark. En un Ryzen 7 5800X con 2 hilos, cada consulta tarda 2 ms (3,8 ms en el peor caso) y el modelo añade unos 166 MB de memoria.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para inferencia en CPU con ONNX Runtime.
- Memoria RAM: aproximadamente 166 MB adicionales durante la inferencia.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no es el escenario previsto.
- Cabe en cualquier equipo de consumo: el artefacto de 45 MB y su consumo de memoria lo permiten en portátiles, mini-PC y dispositivos con CPU moderna.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, etc.) y cualquier runtime compatible con ONNX; no se distribuyen pesos en formato GGUF ni safetensors.
- Latencia y throughput: 2 ms por consulta en un Ryzen 7 5800X con 2 hilos; el throughput no se especifica, pero con esa latencia por consulta el modelo puede procesar cientos de consultas por segundo en un solo hilo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 held-out | Licencia | Formato |
|---|---|---|---|---|---|
| photo-query-tagger (este modelo) | no disponible (45 MB int8) | no disponible | 0.944 | MIT | ONNX int8 |
| xlm-roberta-base | no disponible | no disponible | 0.945 | MIT | safetensors |
| distilbert-base-multilingual-cased | no disponible | no disponible | 0.934 | Apache 2.0 | safetensors |

La comparativa se limita a los tres modelos evaluados por el autor con los mismos datos sintéticos. xlm-roberta-base iguala en precisión pero ocupa 279 MB, mientras que distilbert-base-multilingual-cased queda por debajo en F1 y exact match con 135 MB. El tagger ofrece el mejor equilibrio tamaño/precisión del conjunto, aunque su especialización es mucho más estrecha que la de los modelos base.

## Limitaciones y advertencias

- Propósito muy restringido: diseñado exclusivamente para consultas cortas de búsqueda fotográfica; frases largas, otras tareas y otros dominios quedan fuera de alcance.
- Dependencia de plantillas: formulaciones alejadas de las plantillas de entrenamiento pueden etiquetarse mal, por ejemplo una persona marcada como contenido visual o el alcance de una exclusión malinterpretado.
- Idiomas no verificados: aunque el modelo base es multilingüe, solo se ha probado el comportamiento en los idiomas cubiertos por las plantillas; otros idiomas pueden funcionar de forma imprevisible.
- Riesgo de alucinación limitado al etiquetado: al no generar texto, el riesgo se traduce en etiquetas incorrectas, no en contenido inventado.
- Dependencia de reglas externas: el modelo solo etiqueta palabras; la resolución de nombres y lugares requiere reglas posteriores (coincidencia de nombres y gacetero), y un lugar desconocido para el gacetero se reclasifica como descripción visual.
- Sin datos de sesgo publicados: no se documentan sesgos demográficos o culturales en la selección de nombres y lugares.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Sin métricas de benchmarks estándar (MMLU, HumanEval, GSM8K): no aplica, ya que el modelo no es generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jgdo/photo-query-tagger
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Natural Earth (datos de lugares): https://www.naturalearthdata.com
