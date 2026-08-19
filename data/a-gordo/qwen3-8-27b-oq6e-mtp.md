# a-gordo/Qwen3.8-27B-oQ6e-mtp

## Resumen

El modelo `a-gordo/Qwen3.8-27B-oQ6e-mtp` es una cuantizacion en precision mixta de 6 bits del modelo Qwen3.8-27B, el ultimo lanzamiento de la familia Qwen de Alibaba. El modelo original es un LLM denso multimodal de 27.000 millones de parametros, disenado para ejecutarse en hardware local de alta gama y optimizado para tareas de codigo, flujos de trabajo agenciales y automatizacion de oficina. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.6.2), que aplica una estrategia de precision mixta por capas para preservar la calidad manteniendo un peso reducido.

Esta version concreta es un adaptacion al formato MLX safetensors, lo que la hace compatible con el ecosistema de Apple Silicon (Mac) y con librerias como MLX-LM. El repositorio ocupa 23,7 GB, lo que sugiere una huella de memoria significativamente menor que la del modelo original en precision completa (que requeriria mas de 50 GB en fp16). El archivo safetensors contiene 6.612.941.552 parametros, que es el numero de parametros tras la cuantizacion mixta, no el total del modelo original.

La relevancia de este modelo radica en que ofrece una capacidad de vision y lenguaje multimodal de nivel cercano a modelos propietarios, en un formato que puede ejecutarse en una unica GPU de gama alta o en un Mac con suficiente RAM unificada. La cuantizacion en 6 bits con grupo de 64 es una eleccion equilibrada entre calidad y consumo de memoria, tipica para despliegues en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + lenguaje) |
| Parametros totales | 27.000 millones (modelo original); 6.612.941.552 en safetensors cuantizado |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se recomienda consultar la documentacion de Qwen3.8-27B) |
| Tipos de cuantizacion | oQ 6 bits, group size 64, precision mixta |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la licencia del modelo original Qwen3.8-27B no se ha especificado en la informacion proporcionada) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.000 millones de parametros con capacidades nativas multimodales (vision y texto). Alibaba lo describe como un modelo disenado para ejecutarse en hardware local, con un enfoque en codigo, flujos de agentes y automatizacion de oficina. A diferencia de la variante gigante Qwen3.8-Max (2,4 billones de parametros, MoE), esta version densa prioriza la eficiencia y la facilidad de despliegue.

La cuantizacion oQ de oMLX aplica una estrategia de precision mixta: no todos los pesos se cuantizan al mismo nivel, sino que se seleccionan los bits segun la sensibilidad de cada capa. En este caso, se ha fijado una configuracion de 6 bits con grupo de 64. Este metodo busca preservar la calidad del modelo original reduciendo al minimo el impacto de la cuantizacion en las capas criticas.

No se dispone de informacion detallada sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo es capaz de producir texto coherente, responder preguntas y realizar tareas de razonamiento de alto nivel.
- Vision multimodal: al ser un modelo multimodal nativo, puede procesar imagenes junto con texto, lo que permite tareas de captioning, VQA (visual question answering) y analisis de documentos.
- Codigo y agentes: optimizado para tareas de programacion y flujos de trabajo agenciales, con soporte para secuencias de pasos multiples.
- Automatizacion de oficina: disenado para tareas de ofimatica como generacion de documentos, resumenes y analisis de datos.
- Multilingue: la familia Qwen soporta multiples idiomas, aunque la lista especifica para esta version no se ha proporcionado.
- No se dispone de informacion sobre soporte de tool calling, function calling o thinking mode en la informacion disponible.

## Casos de uso

- Asistente de codigo en local: un desarrollador puede desplegar el modelo en una Mac con chip Apple Silicon (via MLX) para obtener autocompletado de codigo, explicacion de fragmentos y refactorizacion sin enviar datos a la nube.
- Analisis de documentos e imagenes: al combinar vision y texto, el modelo puede extraer informacion de capturas de pantalla, graficos o documentos escaneados, y generar resumenes o responder preguntas sobre ellos.
- Automatizacion de oficina: integrado en un pipeline de generacion de informes, puede crear borradores, resumir actas y preparar presentaciones a partir de datos de entrada.
- Agente de soporte tecnico: con su capacidad de razonamiento multi-paso, puede gestionar consultas complejas de usuarios, buscar en bases de conocimiento y escalar problemas cuando sea necesario.
- Generacion de codigo en produccion: puede integrarse en un CI/CD para revisar pull requests, sugerir correcciones y escribir tests unitarios, gracias a su optimizacion para tareas de programacion.
- Investigacion academica: un investigador puede usarlo para resumir articulos, extraer informacion de figuras y tablas, y generar hipotesis preliminares, manteniendo los datos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los benchmarks del modelo original Qwen3.8-27B estan disponibles en el repositorio oficial de Alibaba, pero no se incluyen aqui al no haber sido proporcionados en la documentacion de la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6 bits y grupo 64, el modelo ocupa aproximadamente 23,7 GB en disco, lo que se traduce en una necesidad de VRAM de entre 24 y 32 GB para inferencia en GPU, dependiendo del overhead de contexto y el backend.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 6000 Ada (48 GB), A100 (40 o 80 GB), H100 (80 GB). En Mac, necesita un chip M1 Max o superior con 32 GB o mas de memoria unificada.
- Cabe en GPU consumer: si, en una RTX 4090 con 24 GB de VRAM, aunque el contexto debe limitarse para no exceder la memoria.
- Opciones de despliegue: MLX-LM (para Mac), llama.cpp (si se convierte a GGUF), vLLM (si se convierte a formato compatible), y cualquier backend que soporte safetensors de MLX.
- Latencia y throughput: no disponible; dependera del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | no disponible | Si (vision) | no disponible | safetensors (fp16) |
| Qwen3.8-27B-oQ6e-mtp (este) | 27B (cuantizado) | no disponible | Si | no disponible | MLX safetensors |
| Qwen2.5-14B | 14B | 128K | No | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 license | safetensors, GGUF |

Nota: la comparativa se basa en datos publicos de los modelos originales. La cuantizacion en 6 bits reduce el peso de 27B a unos 16-17 GB en memoria, lo que lo hace mas accesible que el original en fp16, aunque a costa de una pequeña perdida de fidelidad.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos o riesgos de alucinacion especificos de esta cuantizacion; es responsabilidad del usuario evaluar el modelo en su contexto de uso.
- La cuantizacion en 6 bits puede degradar ligeramente la calidad en tareas de razonamiento complejo o de vision fina, respecto al modelo original en precision completa.
- La licencia del modelo original no se ha especificado en la informacion proporcionada; es necesario verificar los terminos de uso antes de un despliegue comercial.
- El formato MLX safetensors es especifico de Apple MLX; para usarlo en otros backends (vLLM, llama.cpp) se requiere una conversion previa, lo que puede perder compatibilidad con la cuantizacion oQ.
- La longitud de contexto no se ha documentado en la informacion proporcionada; es probable que sea la misma que la del modelo original, pero debe confirmarse antes de usarlo en tareas de contexto largo.
- El numero de parametros del archivo safetensors (6,6B) no es el tamano real del modelo; es el resultado de la cuantizacion mixta. No debe confundirse con un modelo de menor capacidad.

## Enlaces

- Repositorio HuggingFace: [a-gordo/Qwen3.8-27B-oQ6e-mtp](https://huggingface.co/a-gordo/Qwen3.8-27B-oQ6e-mtp)
- Repositorio oficial del modelo original: [AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- Guia completa de Qwen3.8-27B: [lovableapp.org/blog/qwen3-8-27b](https://lovableapp.org/blog/qwen3-8-27b)
- Documentacion de oQ (oMLX): https://github.com/jundot/omlx
- Variante uncensored del mismo modelo: [pyros-vault/Qwen3.8-27B-Uncensored-oQ6e-mtp](https://huggingface.co/pyros-vault/Qwen3.8-27B-Uncensored-oQ6e-mtp)
