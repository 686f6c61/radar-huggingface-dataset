# AMAImedia/Inkling-2-Mini-Uncensored-BF16-GGUF

## Resumen

Inkling-2-Mini-Uncensored-BF16-GGUF es una cuantizacion en formato GGUF del modelo multimodal Inkling-2-Mini, publicado por AMAImedia a partir de un derivado "abliterated" y sin censura del modelo original de Thinking Machines Lab. El modelo base es un transformer autoregresivo "looped" con capas de mezcla de expertos (MoE) dispersa, disenado para aceptar entradas de texto e imagen y generar texto, con un enfasis claro en uso conversacional, agentes y tool calling.

La relevancia de esta publicacion concreta reside en dos factores. Por un lado, el modelo base apuesta por una arquitectura poco comun: 24 capas de pesos de las que las 12 centrales se reutilizan tres veces, lo que produce 48 aplicaciones de capa por token y aumenta la profundidad efectiva sin disparar el numero de parametros. Por otro lado, esta version elimina los mecanismos de rechazo del modelo original (etiqueta "abliterated" y "uncensored") y se distribuye en GGUF con cuantizacion de 8 bits e imatrix, lo que facilita su ejecucion en hardware local.

El checkpoint original se distribuye en precisiones mixtas NVFP4 y MXFP8 con un tamano aproximado de 20 GB, mientras que este repositorio ocupa 49,6 GB e incluye pesos en safetensors y GGUF. La licencia Apache 2.0 permite uso comercial, aunque el proceso de abliteration introduce riesgos de calidad y seguridad que conviene evaluar antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y capas "looped" (24 capas de pesos, 48 aplicaciones por token) |
| Parametros totales | 26.388.646.440 (26,4 mil millones) |
| Parametros activos | 8 de 128 expertos por capa (numero exacto de parametros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, 8-bit (modelopt), GGUF con imatrix |
| Idiomas soportados | Ingles y soporte multilingue general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con capas de feed-forward de tipo Mixture-of-Experts dispersa. La innovacion estructural principal es el esquema "looped": las 12 capas centrales se ejecutan tres veces compartiendo pesos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de solo 24 conjuntos de pesos. En cada capa, cada token se enruta a 8 de 128 expertos. La atencion combina capas locales y globales, y el modelo es nativamente multimodal: las imagenes se codifican mediante un vision transformer y se proyectan junto al texto a un espacio oculto compartido que procesa el decoder.

El modelo base fue publicado por Thinking Machines Lab el 20 de noviembre de 2026 y se distribuye originalmente en precisiones mixtas NVFP4 y MXFP8 en un unico checkpoint de unos 20 GB. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Esta version concreta es una cuantizacion GGUF de un derivado abliterated (sin censura) alojado en el repositorio nokeepai/Inkling-2-Mini-Unbound, con cuantizacion de 8 bits mediante modelopt e imatrix.

## Capacidades

- Generacion de texto conversacional multi-turno con instrucciones en lenguaje natural.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text) con salida de texto.
- Razonamiento y respuesta a preguntas sobre contenido visual.
- Soporte de tool calling y function calling, orientado a sistemas agénticos.
- Capacidades de codigo en multiples lenguajes de programacion, segun la model card del modelo base.
- Uso en asistentes de codigo, chatbots y sistemas de generacion aumentada por recuperacion (RAG).
- Soporte multilingue general, con ingles como idioma principal.
- Modo sin censura (abliterated): el modelo no aplica los rechazos del modelo original, lo que amplia el rango de respuestas pero elimina salvaguardas.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno y procesar capturas o imagenes enviadas por el usuario (por ejemplo, facturas o pantallazos de error) gracias a su entrada multimodal, integrándose en un backend con vLLM o SGLang.
- Asistentes de codigo en produccion: con soporte de tool calling y conocimiento de varios lenguajes, puede integrarse en pipelines de CI/CD para revisar diffs, sugerir parches y consultar herramientas externas mediante function calling.
- Sistemas agénticos multi-paso: el modelo esta disenado explicitamente para flujos agénticos y de uso de herramientas, por lo que encaja en orquestadores que encadenan llamadas a APIs y razonamiento intermedio.
- RAG sobre documentacion tecnica con imagenes: al aceptar texto e imagen, puede responder preguntas sobre manuales, diagramas y capturas recuperados de un indice vectorial.
- Procesamiento de documentos escaneados: extraccion y resumen de informacion de formularios o recibos en local, usando la cuantizacion GGUF en equipos con 32 GB de memoria o mas.
- Investigacion sobre alineacion y seguridad: la variante abliterated permite estudiar el comportamiento del modelo sin rechazos, comparandolo con el original en tareas controladas.
- Despliegue en estaciones de trabajo Apple Silicon: la model card del modelo base indica soporte para MacBooks, Mac minis y Studios con 32 GB o mas, lo que habilita prototipado local sin GPU dedicada.
- Fine-tuning y post-entrenamiento: el modelo base admite post-entrenamiento con Miles y SkyRL, y esta version GGUF sirve como referencia para comparar el efecto de la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint original en NVFP4/MXFP8 ocupa unos 20 GB; esta version GGUF en 8 bits ocupa 49,6 GB en el repositorio, por lo que la VRAM necesaria depende de la cuantizacion concreta descargada.
- La model card del modelo base recomienda 32 GB o mas de VRAM para GPU, o 32 GB o mas de memoria unificada en Apple Silicon.
- Hardware validado por el autor del modelo base: 1x NVIDIA DGX Spark y dispositivos Apple Silicon (MacBook, Mac mini, Mac Studio) con 32 GB o mas.
- En consumer GPU, las cuantizaciones GGUF de menor tamano pueden caber en tarjetas de 24 GB (RTX 3090/4090) o 16 GB, aunque no se especifican los tamanos exactos por nivel de cuantizacion en la informacion disponible.
- Frameworks de despliegue soportados: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, Llama App, Ollama y Exo Labs (estos dos ultimos en Apple Silicon).
- Post-entrenamiento soportado con Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored (esta ficha) | 26,4 mil millones (MoE, 8/128 expertos) | no disponible | Texto e imagen | Apache 2.0 | GGUF y safetensors en HF |
| thinkingmachines/Inkling-2-Mini (base) | 26,4 mil millones (MoE, 8/128 expertos) | no disponible | Texto e imagen | Apache 2.0 | Pesos originales NVFP4/MXFP8 en HF y API Tinker |
| nokeepai/Inkling-2-Mini-Unbound | no disponible | no disponible | Texto e imagen | no disponible | Repositorio HF del derivado abliterated |

No se dispone de datos de rendimiento comparado con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos del modelo original, lo que puede producir contenido inapropiado, ofensivo o peligroso sin filtro; no es adecuado para aplicaciones orientadas al publico sin moderacion adicional.
- La cuantizacion a 8 bits y el proceso de abliteration pueden degradar la calidad respecto al checkpoint original en tareas de razonamiento y codigo; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas multimodales donde la interpretacion de imagenes puede ser incorrecta.
- El idioma principal es el ingles; el soporte multilingue es generico y no se detalla su cobertura ni calidad por idioma.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura conlleva responsabilidad legal y reputacional; conviene auditar las salidas y aplicar filtros propios.
- El repositorio incluye material promocional y enlaces de donacion del autor de la cuantizacion; no afecta al modelo, pero conviene revisar la procedencia de los pesos antes de desplegarlos.
- No se documentan sesgos especificos ni evaluaciones de seguridad para esta variante.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AMAImedia/Inkling-2-Mini-Uncensored-BF16-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del derivado abliterated: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF del derivado: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de vLLM: https://recipes.vllm.io/thinkingmachines/Inkling-2-Mini
- Cookbook de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentacion de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Documentacion de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentacion de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Sitio del autor de la cuantizacion: https://www.amaimedia.com
