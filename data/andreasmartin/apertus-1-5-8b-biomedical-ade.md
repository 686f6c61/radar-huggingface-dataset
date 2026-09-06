# andreasmartin/apertus-1.5-8b-biomedical-ade

## Resumen

`andreasmartin/apertus-1.5-8b-biomedical-ade` es un adaptador LoRA (Low-Rank Adaptation) de 8.000 millones de parámetros, derivado del modelo base `andreasmartin/apertus-v1.5-8b-text`. El modelo está especializado en el dominio biomédico, concretamente en la extracción de eventos adversos por medicamentos (adverse drug events, ADE) y en el reconocimiento de entidades nombradas (NER). Ha sido entrenado con el dataset `mihirhirave/entity_extraction_ade_v2_with_validation`, lo que lo convierte en una herramienta útil para tareas de farmacovigilancia y análisis de textos clínicos en inglés.

El desarrollo corre a cargo del usuario `andreasmartin`, y el modelo se publica bajo licencia Apache 2.0. Al tratarse de un adaptador LoRA, el modelo no es autónomo: requiere cargar el modelo base para funcionar. La arquitectura es un transformer de 8B parámetros, aunque no se especifica la longitud de contexto en la información disponible. El modelo está pensado para generación de texto conversacional, y su pipeline es `text-generation`, con soporte para la librería `transformers` y pesos en formato `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Apertus 1.5 8B) |
| Parametros totales | 8.000 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors) |
| Idiomas soportados | Inglés (según tag "en") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `andreasmartin/apertus-v1.5-8b-text`, que a su vez es un derivado de `swiss-ai/Apertus-v1.5-8B`. La técnica de ajuste fino con LoRA permite modificar el modelo base con un número reducido de parámetros entrenables, lo que reduce el coste computacional y de almacenamiento. El entrenamiento se realizó con la librería Unsloth, según los metadatos del repositorio.

El dataset utilizado, `mihirhirave/entity_extraction_ade_v2_with_validation`, está orientado a la extracción de entidades y eventos adversos por medicamentos. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo hereda las capacidades generales del modelo base Apertus 1.5 8B, que pertenece a una familia de modelos multilingües y multimodales, aunque este adaptador se centra exclusivamente en texto.

## Capacidades

- Generación de texto conversacional en inglés.
- Extracción de entidades nombradas (NER) en el dominio biomédico, con especialización en eventos adversos por medicamentos (ADE).
- Análisis de textos clínicos y farmacéuticos para identificar reacciones adversas a fármacos.
- Herencia de las capacidades generales del modelo base Apertus 1.5 8B en comprensión y generación de lenguaje natural.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se dispone de datos sobre capacidades multimodales en este adaptador concreto.

## Casos de uso

- **Farmacovigilancia automatizada:** el modelo puede procesar informes de seguridad de medicamentos y extractar automáticamente eventos adversos, facilitando el trabajo de los equipos de farmacovigilancia en la revisión de reportes clínicos.
- **Anotación de textos clínicos para investigación:** permite etiquetar de forma automática entidades como fármacos, síntomas y reacciones adversas en historiales clínicos, reduciendo el tiempo de anotación manual en proyectos de investigación biomédica.
- **Monitorización de redes sociales sobre reacciones adversas:** puede analizar publicaciones en foros y redes sociales en inglés para detectar posibles efectos secundarios de medicamentos, apoyando la detección temprana de señales de seguridad.
- **Asistente de documentación clínica:** integrado en sistemas de gestión de historiales, puede ayudar a generar resúmenes de eventos adversos a partir de notas clínicas, mejorando la precisión y la eficiencia del registro.
- **Extracción de información de ensayos clínicos:** el modelo puede identificar y extraer eventos adversos descritos en documentos de ensayos clínicos, facilitando la comparación de perfiles de seguridad entre tratamientos.
- **Integración en pipelines de NLP clínicos:** al ser un adaptador LoRA compatible con `transformers`, puede incorporarse en flujos de procesamiento de lenguaje natural más amplios, por ejemplo en sistemas de soporte a la decisión médica o en análisis retrospectivos de bases de datos sanitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** para un modelo de 8B parámetros, se estima un consumo de aproximadamente 16 GB en FP16 y de 6 a 8 GB en cuantización de 4 bits. Estas cifras son orientativas y corresponden al modelo base más el adaptador LoRA.
- **GPU recomendadas:** NVIDIA A100, H100, RTX 4090 o GPUs equivalentes con al menos 16 GB de VRAM para inferencia en FP16. Para cuantización de 4 bits, una RTX 3090 o RTX 4080 puede ser suficiente.
- **Compatibilidad con GPU de consumo:** sí, el modelo puede ejecutarse en GPUs de consumo con 8 GB o más de VRAM si se aplica cuantización.
- **Opciones de despliegue:** vLLM, llama.cpp, Ollama, TGI, así como la librería `transformers` de HuggingFace para carga directa del adaptador sobre el modelo base.
- **Latencia y throughput:** no se dispone de datos específicos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| andreasmartin/apertus-1.5-8b-biomedical-ade | 8B (base) | No disponible | Apache 2.0 | Adaptador LoRA biomédico |
| andreasmartin/apertus-v1.5-8b-text | 8B | No disponible | Apache 2.0 | Modelo base de texto |
| swiss-ai/Apertus-v1.5-8B | 8B | No disponible | Apache 2.0 | Modelo base multimodal y multilingüe |

Cabe destacar que el modelo analizado es un adaptador especializado en biomedicina, mientras que los otros dos son modelos base de propósito general. No se dispone de benchmarks comparativos entre ellos en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado principalmente para el dominio biomédico y en inglés, por lo que su rendimiento en otros idiomas o dominios puede ser limitado.
- Al ser un adaptador LoRA, no funciona de forma autónoma: es necesario cargar el modelo base `andreasmartin/apertus-v1.5-8b-text` para su uso.
- Los modelos de lenguaje pueden generar contenido falso o alucinado, especialmente en dominios especializados como la medicina, donde la precisión es crítica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un derivado de `swiss-ai/Apertus-v1.5-8B`, por lo que se deben respetar los avisos de copyright y la política de uso aceptable de Apertus 1.5.
- No se han publicado evaluaciones de sesgos específicos para este adaptador, por lo que existe un riesgo de sesgos no documentados en el dominio biomédico.
- El dataset de entrenamiento se centra en eventos adversos por medicamentos, lo que puede limitar la generalización a otras tareas de NER o extracción de entidades en ámbitos no farmacéuticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreasmartin/apertus-1.5-8b-biomedical-ade
- Modelo base: https://huggingface.co/andreasmartin/apertus-v1.5-8b-text
- Modelo original de Swiss AI Initiative: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
