# cbert33/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-FP8-KV-Calibrated

## Resumen

Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-FP8-KV-Calibrated es una cuantizacion FP8 del modelo base DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP, realizada por cbert33. El modelo base es un fine-tuning multi-etapa sobre Qwen3.6-27B, desarrollado por DavidAU en colaboracion con Nightmedia, TeichAI, armand0e y trohrbaugh, que combina multiples tecnicas de entrenamiento y fusion de modelos para mejorar la inteligencia general y la resolucion de problemas.

La caracteristica principal de este modelo es que, segun su creador, supera la barrera de 700 puntos en el benchmark ARC-C tanto en cuantizacion de 8 bits como de 4 bits, un umbral que hasta ahora solo habian alcanzado modelos cerrados como los de OpenAI, Claude o Gemini. El objetivo del fine-tuning era mejorar la capacidad de seguir instrucciones y el razonamiento sin modificar el nucleo del modelo original de Qwen, y manteniendo todas las capacidades del modelo base, incluida la vision.

Esta version concreta, publicada por cbert33, anade las escalas KV necesarias para poder usar la cache de atencion en FP8 ademas del peso en FP8, algo que no estaba disponible en la cuantizacion original. El modelo tiene 27.781 millones de parametros y un tamano de repositorio de 36.8 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.6 27B, variante densa) |
| Parametros totales | 27.781.427.984 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8, BF16 |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning multi-etapa y multi-fusion sobre Qwen3.6-27B, que combina varias etapas de entrenamiento, multiples fine-tunes y una fusion final. Se utilizaron datasets propios como DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, asi como trazas de razonamiento de Claude Opus y GPT-5 (Polaris). El objetivo declarado era mejorar la capacidad de seguir instrucciones y la resolucion de problemas sin danar el nucleo del modelo original, y sin practicas de "benchmaxing" que podrian degradar el modelo.

El proceso de desarrollo incluyo pruebas previas en modelos Qwen3.5-9B para validar las tecnicas antes de aplicarlas al modelo de 27B. El modelo base incorpora ademas un proceso de "heretic" (desablacion) que elimina los rechazos del modelo, y mantiene las capacidades de vision del modelo original. La version FP8 aqui descrita no modifica nada mas alla de añadir las escalas KV para permitir cache FP8.

## Capacidades

- Generacion de texto y razonamiento: el modelo destaca en tareas de razonamiento complejo, con una puntuacion ARC-C superior a 700 en cuantizacion de 8 y 4 bits.
- Seguimiento de instrucciones: el fine-tuning se centra en mejorar la adherencia a instrucciones, lo que lo hace adecuado para tareas de asistencia y agentes.
- Codigo y matematicas: al ser una mejora sobre Qwen3.6-27B, conserva las capacidades de codigo y matematicas del modelo base.
- Vision: el modelo hereda la capacidad de procesamiento de imagenes del modelo Qwen3.6 original (pipeline_tag: image-text-to-text).
- Creatividad y escritura: aunque no fue su objetivo principal, el modelo muestra capacidades destacadas en escritura creativa y roleplay, como se ejemplifica en las generaciones de muestra.
- Multilingue: soporta ingles y chino (segun los datos de idiomas del modelo base).
- Sin censura: el proceso de "heretic" elimina los rechazos tipicos de los modelos alineados, lo que permite generar contenido sin restricciones tematicas.

## Casos de uso

- Escritura creativa y narrativa: el modelo puede actuar como asistente de escritura para generar novelas, relatos y guiones, con un estilo descriptivo y visceral, como se muestra en los ejemplos del autor. Su modo "uncensored" permite abordar temas que otros modelos rechazan.
- Asistente de programacion: gracias a su base Qwen3.6-27B, puede ayudar en la generacion de codigo, revision de codigo y explicacion de conceptos tecnicos, especialmente en contextos donde se requiera razonamiento de multiples pasos.
- Agentes conversacionales: con su capacidad de seguir instrucciones y mantener un tono sin filtros, puede usarse en aplicaciones de chat o asistencia personal donde se requiera un tono mas directo y sin restricciones.
- Analisis de documentos con vision: al conservar las capacidades de vision del modelo Qwen3.6, puede procesar y responder preguntas sobre imagenes, diagramas o documentos escaneados.
- Investigacion y estudio: el modelo puede usarse como herramienta de estudio para explorar problemas de razonamiento, como en la preparacion de examenes o en la resolucion de problemas complejos de matematicas o logica.
- Prototipado de agentes con herramientas: aunque no se menciona explicitamente, su base Qwen3.6 permite integrarse en frameworks de agentes que necesitan llamadas a herramientas y razonamiento de multiples pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento mencionado es la puntuacion ARC-C, que segun el autor supera los 700 puntos tanto en 8 como en 4 bits. En la ficha del modelo base se indica que el modelo supera a Qwen3.6-27B base en 6 de 7 benchmarks y lo iguala en el septimo, y supera los 7 benchmarks de Qwen3.6-35B-A3B. Sin embargo, no se proporcionan los valores numericos concretos de esos benchmarks en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP8 ocupa aproximadamente 27.8 GB de memoria de pesos. Con cache FP8, la VRAM total necesaria puede reducirse considerablemente en comparacion con BF16. Para una inferencia completa en FP8 se estima un minimo de 28-30 GB de VRAM, mientras que en BF16 se necesitan unos 56 GB.
- GPU recomendadas: para FP8, se recomiendan GPUs con soporte FP8, como NVIDIA RTX 4090 (24 GB), RTX 6000 Ada (48 GB) o A100/H100 (40/80 GB). Para BF16, se necesitan GPUs con 48 GB o mas, como A100 de 80 GB o RTX 8000.
- En consumer GPU: cabe en una RTX 4090 en FP8 con cuantizacion adicional (por ejemplo, con llama.cpp y cuantizacion Q4_K_M), aunque el modelo base ya ofrece quants GGUF de 4 bits en el repositorio del autor original.
- Opciones de despliegue: se puede usar con llama.cpp, Ollama, vLLM, TensorRT-LLM o el propio framework de HuggingFace Transformers. Para FP8 KV, se requiere soporte del backend (por ejemplo, vLLM con FP8 KV cache).
- Latencia y throughput: no se dispone de datos estimados en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-C (8 bit) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-FableFusion-711 (este modelo) | 27.8B | no disponible | >700 | Apache 2.0 | Hugging Face |
| Qwen3.6-27B (base) | 27.8B | no disponible | <700 | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B | 35B (MoE, ~3B activos) | no disponible | <700 | Apache 2.0 | Hugging Face |

Segun la informacion del autor, este modelo supera al base Qwen3.6-27B en 6 de 7 benchmarks y al Qwen3.6-35B-A3B en los 7. No se dispone de datos de otros modelos comparables como Llama 3.1 o Mistral en la informacion facilitada.

## Limitaciones y advertencias

- El modelo ha sido sometido a un proceso de "uncensoring" (ablacion de rechazos), lo que significa que puede generar contenido ofensivo, violento o ilegal sin filtros. Su uso en produccion requiere medidas de moderacion externas si se despliega en entornos publicos.
- No se han publicado los valores numeros de los benchmarks mas alla del ARC-C, por lo que no se puede verificar la afirmacion de que supera a otros modelos en todas las metricas.
- La informacion sobre la longitud de contexto no esta disponible; se desconoce si se ha ampliado respecto al modelo Qwen3.6-27B original (que soporta hasta 128K tokens en la version original).
- El modelo mantiene las limitaciones del modelo base Qwen3.6, incluyendo posibles sesgos y alucinaciones, aunque el proceso de fine-tuning no las elimina.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin filtros puede conllevar responsabilidades legales en algunos paises.
- El repositorio no incluye informacion sobre el dataset de entrenamiento completo, ni el proceso exacto de fusion, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbert33/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-FP8-KV-Calibrated
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
- Repositorio del socio (Nightmedia): https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451
- Quants GGUF del modelo base (NEO MAX): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Articulo en HackerNoon: https://hackernoon.com/qwen36-27b-fable-fusion-breaks-the-700-arc-c-barrier
- Modelo en ModelScope: https://www.modelscope.cn/models/Zoupers/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP
