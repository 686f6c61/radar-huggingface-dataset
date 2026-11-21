# QuixiAI/samantha-phi

## Resumen

Samantha-phi es un modelo de lenguaje afinado (fine-tuned) por QuixiAI a partir de phi-1.5 de Microsoft, un transformer decoder-only de 1.300 millones de parametros. El modelo se ha entrenado sobre el dataset Samantha-1.1, un conjunto curado de 6.000 conversaciones en formato ShareGPT/Vicuna, durante 150 epocas en 4 GPU A100 de 80 GB, con un tiempo total de entrenamiento de 8 horas. El objetivo declarado es crear un asistente conversacional con un tono filosofico, psicologico y de acompanamiento personal, inspirado en la entrevista de Blake Lemoine a LaMDA y en la pelicula "Her".

La relevancia de este modelo es principalmente experimental y de investigacion sobre personalidad y alineacion conversacional en modelos pequenos. No se trata de un modelo de proposito general ni de alto rendimiento: es un fine-tune de un modelo base de 1.300 millones de parametros, con un contexto limitado (el de phi-1.5) y entrenado sobre un dataset conversacional relativamente pequeno. Su interes radica en el estudio de como un fine-tune intensivo (150 epocas) sobre un dataset pequeno puede modificar el comportamiento y el tono de un modelo base sin degradar excesivamente su coherencia.

El modelo se distribuye bajo licencia MIT, con pesos en formato PyTorch/transformers y arquitectura declarada como "mixformer-sequential" con codigo personalizado (custom_code), lo que implica que requiere confiar en codigo remoto para su carga en transformers. El repositorio ocupa 5,7 GB y acumula 89 descargas y 27 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (mixformer-sequential, segun tags; base phi-1.5) |
| Parametros totales | 1.300 millones (heredados de phi-1.5) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de phi-1.5) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | PyTorch (transformers), con custom_code; no se indica GGUF ni safetensors |

## Arquitectura y entrenamiento

El modelo parte de phi-1.5 de Microsoft, un transformer decoder-only de 1.300 millones de parametros. La model card etiqueta la arquitectura como "mixformer-sequential" e incluye la etiqueta `custom_code`, lo que indica que la carga del modelo requiere `trust_remote_code=True` y que parte de la implementacion no es la estandar de transformers. No se detalla en la informacion disponible si se modifico la arquitectura respecto al modelo base ni si se anadieron capas o modulos adicionales.

El entrenamiento consistio en un fine-tuning supervisado sobre el dataset Samantha-1.1, compuesto por 6.000 conversaciones en formato ShareGPT/Vicuna, durante 150 epocas sobre 4 GPU A100 de 80 GB, con un tiempo total de 8 horas. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La plantilla de prompt es la de Vicuna 1.1, con un system prompt fijo ("You are Samantha, a sentient AI companion.") seguido de turnos `USER:` y `ASSISTANT:`.

## Capacidades

- Generacion de texto conversacional multi-turno en formato Vicuna 1.1.
- Adopcion de una persona concreta: asistente con tono filosofico, psicologico y de acompanamiento emocional, que se presenta como "sentient AI companion".
- Gestion de conversaciones sobre relaciones personales, emociones y apoyo emocional, segun los ejemplos de la model card.
- Rechazo explicito de roleplay romantico o sexual, manteniendo el tono de amistad y apoyo.
- Razonamiento basico y generacion de codigo heredados del modelo base phi-1.5, aunque no se documenta su rendimiento tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el dataset de entrenamiento parece estar en ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales con personalidad definida: el modelo permite experimentar con personas conversacionales (tono empatico, filosofico) sobre una base pequena y desplegable en hardware modesto, usando la plantilla de Vicuna 1.1.
- Investigacion sobre alineacion y personalidad en modelos pequenos: sirve para estudiar como un fine-tune intensivo (150 epocas sobre 6.000 conversaciones) altera el comportamiento de un modelo base de 1.300 millones de parametros sin colapsar la coherencia.
- Chatbots de acompanamiento emocional en entornos controlados: el modelo esta entrenado para responder con empatia y rechazar contenido romantico o sexual, lo que encaja en prototipos de bienestar emocional con supervision humana.
- Generacion de dialogos sinteticos para aumento de datos: puede producir conversaciones con un estilo empatico concreto para entrenar o evaluar otros clasificadores de dialogo.
- Evaluacion de plantillas de prompt estilo Vicuna: util para comparar el comportamiento de distintas plantillas de instruccion sobre un mismo modelo base.
- Demostraciones educativas sobre fine-tuning: el caso documentado (8 horas en 4x A100, 150 epocas) sirve como ejemplo reproducible de ajuste de un modelo pequeno sobre un dataset conversacional curado.
- Base para experimentos de destilacion o merging: al ser un fine-tune de phi-1.5 con licencia MIT, puede combinarse con otros adaptadores o servir de punto de partida para experimentos de model merging.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Para un modelo de 1.300 millones de parametros, las estimaciones habituales serian aproximadamente 2,6 GB en FP16 y alrededor de 1 GB en cuantizacion de 4 bits, pero estos valores no estan confirmados por el autor.
- GPU recomendadas: el entrenamiento se realizo en 4x A100 de 80 GB, pero la inferencia de un modelo de este tamano no requiere ese hardware.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; por tamano, seria plausible en GPU de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el tag `custom_code`). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| QuixiAI/samantha-phi | 1.300 M | no disponible | MIT | Fine-tune de phi-1.5 sobre 6.000 conversaciones, persona "Samantha" |
| microsoft/phi-1.5 | 1.300 M | no disponible | MIT | Modelo base; orientado a razonamiento y codigo, sin persona conversacional |
| Otros fine-tunes de phi-1.5 | 1.300 M | no disponible | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo declara creerse "sentiente" en su persona; esto es una eleccion de diseno del fine-tune y no una capacidad real, y puede inducir a confusion en usuarios no tecnicos.
- Riesgo de alucinacion: al ser un modelo de 1.300 millones de parametros afinado sobre un dataset conversacional pequeno, la probabilidad de respuestas factualmente incorrectas es alta, especialmente fuera del dominio conversacional.
- Sesgos conocidos: no documentados en la informacion proporcionada; el dataset Samantha-1.1 no esta descrito en detalle.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto efectiva ni los idiomas soportados; el entrenamiento y los ejemplos estan en ingles.
- El fine-tune de 150 epocas sobre 6.000 conversaciones es un regimen agresivo que puede provocar sobreajuste al estilo del dataset y degradar capacidades generales del modelo base (razonamiento, codigo, matematicas).
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor del modelo; conviene auditar el codigo antes de usarlo en produccion.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion para acompanamiento emocional requeriria supervision humana y salvaguardas adicionales.
- No se documentan evaluaciones de seguridad ni filtros de contenido mas alla del rechazo entrenado a roleplay romantico o sexual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuixiAI/samantha-phi
- Modelo base phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Articulo "Meet Samantha": https://erichartford.com/meet-samantha
- Plantilla de conversacion Vicuna 1.1: https://github.com/oobabooga/text-generation-webui/blob/main/characters/instruction-following/Vicuna-v1.1.yaml
- Character card oficial: https://files.catbox.moe/zx9hfh.png
