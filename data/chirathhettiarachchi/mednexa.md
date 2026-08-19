# chirathhettiarachchi/MedNexa

## Resumen

MedNexa es un adaptador LoRA publicado por Chirath Hettiarachchi, investigador de la Australian National University, diseñado para ajustar el modelo base Qwen/Qwen2.5-0.5B-Instruct mediante fine-tuning supervisado (SFT). El repositorio en HuggingFace no incluye una model card completa: la mayoría de los campos están marcados como "More Information Needed", y no se proporcionan detalles sobre el dataset de entrenamiento, los hiperparámetros, el rendimiento o los casos de uso previstos.

El modelo se presenta como un adaptador PEFT (Parameter-Efficient Fine-Tuning) con pesos en formato safetensors, lo que indica que es una capa de ajuste ligera sobre el modelo base de 0.5B parámetros de Qwen. A pesar del nombre "MedNexa" que sugiere una orientación médica, no hay evidencia pública que confirme su dominio de especialización, ni benchmarks, ni documentación técnica. Su relevancia actual es limitada debido a la ausencia de información verificable y a su tamaño reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-0.5B-Instruct (transformer decoder) |
| Parametros totales | 0.5B (modelo base) + adaptador LoRA (tamano no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base soporta 32 768 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors del adaptador) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder con 0.5 mil millones de parametros, que emplea attention por ventanas deslizantes y normalizacion QKV, disenado para generacion de texto e instrucciones. El adaptador MedNexa se entrena mediante fine-tuning supervisado (SFT) usando la libreria TRL de HuggingFace, con PEFT 0.17.1. No se especifican los datos de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas adicionales como RLHF o DPO. La unica innovacion tecnica destacable es el uso de LoRA, que reduce el coste de entrenamiento al congelar el modelo base y actualizar solo matrices de baja dimension.

## Capacidades

- Generacion de texto en estilo conversacional, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Capacidad de seguir instrucciones basicas gracias al fine-tuning instructivo del modelo base.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso, vision o audio.
- El soporte multilingue depende del modelo base, que cubre principalmente ingles y chino, aunque no se confirma para este adaptador.

## Casos de uso

Dado que no hay informacion sobre el dataset de entrenamiento ni sobre el rendimiento, los casos de uso son especulativos. Se indican escenarios plausibles basados en el modelo base, pero con la advertencia de que no estan validados:

- Prototipado rapido de chatbots de dominio medico: el adaptador podria haber sido entrenado con datos clinicos, pero no hay evidencia publica. Requiere validacion exhaustiva antes de cualquier uso real.
- Experimentacion academica con LoRA: util para investigadores que quieran estudiar el efecto del fine-tuning ligero sobre un modelo pequeno en contextos sanitarios.
- Generacion de resumenes de articulos cientificos: el modelo base puede resumir texto, pero sin datos de entrenamiento especificos el resultado seria generico.
- Asistente de preguntas frecuentes en entornos controlados: podria responder consultas simples si el adaptador fue entrenado con datos de ese tipo, pero sin benchmarks no es recomendable.
- Educacion medica simulada: para practicas de conversacion con estudiantes, siempre con supervisio humana.
- Integracion en pipelines de investigacion que requieran un modelo pequeno y rapido para tareas de clasificacion o extraccion de entidades (si el adaptador se entreno para ello, aunque no se confirma).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna evaluacion comparable. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un modelo de 0.5B, la inferencia puede ejecutarse en CPU con memoria RAM moderada (4-8 GB) y en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) o incluso inferencia en CPU con llama.cpp.
- El adaptador en si ocupa muy poco espacio (probablemente menos de 100 MB), por lo que el requisito principal es el modelo base.
- Opciones de despliegue: transformers con PEFT, vLLM, Ollama (si se convierte a GGUF), llama.cpp.
- Latencia estimada: en una GPU media, la generacion de tokens es de decenas de milisegundos por token; en CPU, de cientos de milisegundos.

## Comparativa con modelos similares

No hay modelos comparables directos porque no se conocen las capacidades especificas de MedNexa. Como referencia, se compara con el modelo base y con alternativas de tamano similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct | 0.5B | 32 768 | Apache 2.0 | HuggingFace |
| MedNexa (adaptador) | 0.5B + LoRA | no disponible | no disponible | HuggingFace |
| TinyLlama-1.1B-Chat | 1.1B | 2048 | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento para establecer una comparativa util.

## Limitaciones y advertencias

- La model card no contiene informacion sobre sesgos, riesgos de alucinacion o limitaciones de idioma. Se asumen los riesgos inherentes al modelo base Qwen2.5-0.5B-Instruct, que incluyen posibles sesgos culturales y alucinaciones en contextos especializados.
- No hay licencia declarada: el uso comercial es incierto y requiere contactar con el autor.
- No se especifica el dataset de entrenamiento: no se puede verificar la calidad ni la adecuacion para tareas medicas reales.
- El tamano del modelo (0.5B) limita severamente su capacidad de razonamiento complejo y de manejo de conocimiento especializado.
- No se proporcionan instrucciones de uso ni ejemplos de codigo en la model card.
- El repositorio no tiene descargas ni likes, lo que sugiere que es un experimento personal sin validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/chirathhettiarachchi/MedNexa
- Perfil del autor en Google Scholar: https://scholar.google.com/citations?user=gvLLPs8AAAAJ&hl=en
- Perfil del autor en ANU: https://researchportalplus.anu.edu.au/en/persons/chirath-hettiarachchi/
- Organizacion GitHub (sin contenido publico relevante): https://github.com/mednexa-ai
