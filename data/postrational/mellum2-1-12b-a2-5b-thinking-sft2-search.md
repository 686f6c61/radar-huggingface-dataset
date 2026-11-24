# postrational/Mellum2.1-12B-A2.5B-Thinking-sft2-search

## Resumen

Mellum2.1-12B-A2.5B-Thinking-sft2-search es un ajuste fino (fine-tuning) supervisado del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking, publicado por el usuario postrational en Hugging Face. Se trata de un modelo de generacion de texto de arquitectura Mixture of Experts (MoE) con 12.149.923.072 parametros totales y aproximadamente 2.500 millones de parametros activos por token, segun indica el propio nombre del modelo. El sufijo "search" del identificador sugiere una especializacion orientada a tareas de busqueda o recuperacion de informacion, aunque la model card no documenta explicitamente el dataset ni el objetivo del ajuste.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y esta pensado para generacion de texto conversacional en ingles. Su relevancia actual radica en que parte de la familia Mellum de JetBrains, orientada a tareas de codigo y razonamiento, y en que incorpora un modo de razonamiento explicito ("Thinking") heredado del modelo base, lo que lo hace adecuado para tareas que requieren cadenas de razonamiento multi-paso.

La informacion publicada es muy limitada: la model card apenas contiene metadatos de autoria, licencia y el modelo base, sin detalles sobre datos de entrenamiento, benchmarks ni capacidades especificas. El repositorio ocupa 24,3 GB en formato safetensors y no registra descargas ni likes en el momento de la consulta, lo que indica que es una publicacion reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, segun el nombre del modelo (no documentada en la model card) |
| Parametros totales | 12.149.923.072 (12,15 mil millones) |
| Parametros activos | Aproximadamente 2.500 millones (indicado en el nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion via Unsloth/llama.cpp no confirmada) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base JetBrains/Mellum2.1-12B-A2.5B-Thinking, que por su nomenclatura corresponde a una arquitectura Mixture of Experts con 12.000 millones de parametros totales y 2.500 millones activos. La model card no proporciona detalles sobre el numero de capas, dimensiones ocultas, numero de expertos, mecanismo de atencion ni estrategia de enrutamiento. Tampoco se documenta la longitud de contexto nativa del modelo base.

El entrenamiento del ajuste se realizo con la libreria Unsloth y TRL de Hugging Face, segun indica la model card, que afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF o DPO, ni la naturaleza exacta de la especializacion "search" y "sft2" que aparecen en el identificador. El modelo base incorpora un modo de razonamiento ("Thinking"), pero no se detalla como se preserva o modifica en este ajuste.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Mellum.
- Razonamiento explicito en modo "Thinking", segun el nombre del modelo base.
- Especializacion probable en tareas de busqueda o recuperacion de informacion, segun el sufijo "search" del identificador (no documentada formalmente).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo Thinking sugiere capacidad de razonamiento encadenado.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Busqueda aumentada con razonamiento: el sufijo "search" sugiere que el modelo puede emplearse para reformular consultas, seleccionar pasajes relevantes o razonar sobre resultados de recuperacion en pipelines RAG, aprovechando su modo Thinking para justificar la seleccion.
- Asistentes conversacionales en ingles: al ser un modelo conversacional ajustado, puede gestionar dialogos multi-turno en aplicaciones de atencion al cliente o asistentes internos, siempre que se valide la longitud de contexto real del modelo base.
- Generacion de codigo asistida: la familia Mellum de JetBrains esta orientada a tareas de programacion, por lo que el modelo puede integrarse en entornos de desarrollo para autocompletado o explicacion de codigo, aunque no se documenta soporte especifico de tool calling.
- Razonamiento paso a paso en dominios tecnicos: el modo Thinking permite generar cadenas de razonamiento para tareas de analisis, clasificacion o resolucion de problemas donde la trazabilidad del razonamiento es relevante.
- Prototipado e investigacion: al ser un modelo de 12B totales con 2,5B activos y licencia Apache 2.0, es adecuado para experimentacion academica y desarrollo de prototipos sin restricciones comerciales.
- Despliegue en infraestructura modesta: la naturaleza MoE con solo 2,5B parametros activos reduce el coste computacional por token en comparacion con un modelo denso de 12B, lo que facilita su servicio en GPUs de gama media-alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 24-25 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 32-40 GB de VRAM.
- VRAM estimada con cuantizacion a 8 bits: aproximadamente 13-14 GB para pesos.
- VRAM estimada con cuantizacion a 4 bits: aproximadamente 7-8 GB para pesos.
- GPU recomendadas para fp16: A100 40GB, H100, L40S, RTX A6000 (48GB).
- GPU consumer: posible en RTX 4090 (24GB) con cuantizacion a 8 bits o 4 bits; en RTX 3090 (24GB) con cuantizacion similar.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), y potencialmente vLLM o llama.cpp si se generan pesos GGUF, aunque no se confirma soporte oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| postrational/Mellum2.1-12B-A2.5B-Thinking-sft2-search | 12,15B | ~2,5B | no disponible | Apache 2.0 | Hugging Face |
| JetBrains/Mellum2.1-12B-A2.5B-Thinking (modelo base) | 12,15B (por herencia) | ~2,5B | no disponible | no disponible | Hugging Face |
| Alternativas MoE de tamano similar (p. ej. Qwen MoE, Mixtral) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es minima y no documenta datos de entrenamiento, por lo que no es posible evaluar sesgos conocidos ni la calidad del ajuste.
- Riesgo de alucinacion inherente a los modelos generativos; el modo Thinking puede producir razonamientos plausibles pero incorrectos.
- Soporte limitado al ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar aplicaciones que requieran ventanas largas.
- No se confirma soporte de tool calling ni de agentes, a pesar de que el modelo base pueda tenerlo.
- El ajuste "search" no esta documentado: no se especifica que tipo de busqueda ni con que datos se entreno, lo que limita la confianza en produccion.
- El modelo tiene 0 descargas y 0 likes, sin validacion comunitaria; se recomienda evaluacion propia antes de uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de un modelo base de JetBrains, conviene verificar la licencia del modelo base original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/postrational/Mellum2.1-12B-A2.5B-Thinking-sft2-search
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
