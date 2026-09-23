# leary-criste/model-last

## Resumen

`leary-criste/model-last` es un modelo de lenguaje publicado en HuggingFace por el usuario `leary-criste`, con un total de 34.660.610.688 parametros (34,66B) confirmados a partir de los pesos en safetensors. La etiqueta de arquitectura de Transformers asociada al repositorio es `qwen3_5_moe_text`, lo que indica que se trata de un modelo de texto con arquitectura de mezcla de expertos (MoE) de la familia Qwen 3.5, aunque no se especifica el numero de parametros activos ni la configuracion exacta de expertos.

El repositorio ocupa 69,3 GB, lo que es coherente con pesos en precision de 16 bits (aproximadamente 2 bytes por parametro). El acceso esta restringido: es un modelo gated y requiere aceptar condiciones en HuggingFace antes de poder descargarlo. No se ha publicado informacion sobre licencia, idiomas soportados, pipeline de inferencia ni datos de entrenamiento.

La relevancia de esta ficha es limitada y hay que ser explicito al respecto: el modelo acumula 2 descargas y 0 "likes", la model card no aporta documentacion tecnica, y la busqueda web no devuelve ningun material propio del modelo (paper, blog, repositorio de codigo o demo). A dia de hoy no es posible verificar ni su calidad ni su comportamiento en produccion, por lo que debe tratarse como un artefacto no auditado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de texto segun la etiqueta de Transformers `qwen3_5_moe_text`; numero de expertos y capas, no disponible |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (69,3 GB para 34,66B parametros, compatible con BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| ID en HuggingFace | leary-criste/model-last |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Pipeline declarado | no disponible |
| Descargas / likes | 2 / 0 |
| Fecha de creacion | 2026-09-23 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `qwen3_5_moe_text`, que identifica la arquitectura ante la libreria Transformers y sugiere un transformer decoder-only con capas de mezcla de expertos (MoE) orientado exclusivamente a texto. El recuento de 34,66B parametros totales es un dato real extraido de los ficheros safetensors, no una estimacion de la model card. Se desconoce por completo cuantos de esos parametros se activan por token, cuantos expertos tiene el modelo, cuantas capas son densas frente a MoE, y si incorpora atencion lineal, decodificacion especulativa u otras optimizaciones.

Tampoco hay informacion sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de ajuste fino supervisado, RLHF, DPO o destilacion. La model card del repositorio no aporta texto descriptivo. No se debe asumir que el modelo ha heredado las recetas de entrenamiento de la familia Qwen 3.5 solo por compartir la etiqueta de arquitectura; esta ficha no puede confirmarlo.

## Capacidades

No hay informacion publicada que permita verificar capacidades concretas. Lo unico deducible de los metadatos es:

- Modelo de texto: la etiqueta `qwen3_5_moe_text` descarta modalidades de vision o audio en la arquitectura declarada.
- Generacion de texto en lenguaje natural: implicita en cualquier modelo causal de este tipo.
- Parametros activos reducidos por token: esperable en una arquitectura MoE, lo que en teoria abarata la inferencia frente a un modelo denso del mismo tamano total. Magnitud exacta, no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible.

## Casos de uso

Advertencia previa: al no existir documentacion tecnica ni evaluaciones publicas, los siguientes casos son escenarios teoricos para un modelo de texto MoE de 34,66B parametros. Cualquier uso en produccion exige una evaluacion propia previa.

- Procesamiento por lotes de texto en servidor propio: si el modelo activa una fraccion pequena de parametros por token, el coste por peticion seria inferior al de un modelo denso de 34B, lo que lo haria apto para tareas de clasificacion, resumen o extraccion sobre volumenes grandes de documentos en un cluster con GPUs de 80 GB.
- Generacion aumentada por recuperacion (RAG) sobre documentacion interna: un modelo de este tamano puede integrarse como generador en un pipeline RAG donde el contexto relevante se inyecta en el prompt, siempre que se valide primero su ventana de contexto real.
- Asistencia a la redaccion tecnica: redaccion y reescritura de informes, documentacion de API o notas de version, tareas donde los errores factuales son revisables por un humano antes de publicar.
- Prototipado e investigacion academica: uso como linea base en experimentos de comparacion de arquitecturas MoE, dado que los pesos completos estan publicados en safetensors y son cargables con Transformers.
- Ajuste fino con LoRA o QLoRA sobre dominio propio: el autor del repositorio publica otros artefactos derivados de entrenamiento supervisado (por ejemplo `leary-criste/lora-09-16`), lo que sugiere un flujo de trabajo de ajuste sobre esta base.
- Despliegue en una sola GPU de 80 GB: con 69,3 GB de pesos en 16 bits, el modelo entra en una A100/H100 de 80 GB, lo que permite servir una instancia dedicada para cargas internas de baja concurrencia.
- Traduccion automatica interna: plausible para un modelo multilingue de esta escala, pero sin datos de idiomas soportados no puede confirmarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion para `leary-criste/model-last`, y la busqueda web no devuelve ningun informe de terceros sobre este modelo.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones aritmeticas a partir del recuento real de 34,66B parametros y del tamano del repositorio (69,3 GB), no datos publicados por el autor:

- Pesos en 16 bits (BF16/FP16): aproximadamente 69 GB solo para pesos. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB, A800 80 GB) o reparto en varias GPUs.
- Cuantizacion a 8 bits: aproximadamente 35 GB de pesos. Cabe en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB con margen para cache KV.
- Cuantizacion a 4 bits: aproximadamente 18 GB de pesos. Cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) si la ventana de contexto es moderada y el numero de parametros activos es bajo.
- GPU de consumo: viable en 24 GB unicamente con cuantizacion de 4 bits y contexto corto. En 16 bits no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: Transformers (formato nativo safetensors) es la via confirmada. vLLM, SGLang, llama.cpp, Ollama o TGI son compatibles en teoria con la arquitectura `qwen3_5_moe_text`, pero no hay confirmacion publicada de que este checkpoint concreto cargue correctamente en ellos.
- Latencia y throughput: no disponible.
- Nota: si finalmente se confirma que es un MoE con pocos parametros activos, el throughput por GPU seria notablemente superior al de un modelo denso de 34B, pero esto no puede afirmarse sin datos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni configuraciones de contexto que permitan una comparacion rigurosa con alternativas MoE de tamano similar. La unica referencia que puede deducirse de los metadatos es la familia Qwen 3.5 MoE, de la que este checkpoint parece derivar por su etiqueta de arquitectura, pero no hay datos verificables de parametros activos, contexto o rendimiento para establecer la comparacion.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| leary-criste/model-last | 34,66B | no disponible | no disponible | no disponible | no disponible |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, paper ni blog. Se desconoce el dataset de entrenamiento, por lo que no puede evaluarse la composicion de sesgos ni el riesgo de contaminacion de benchmarks.
- Riesgo de alucinacion: sin evaluaciones publicas no puede acotarse la tasa de invencion de hechos. No debe usarse en dominios donde un error factual tenga consecuencias (medicina, derecho, finanzas) sin supervision humana.
- Idiomas: se desconoce que idiomas soporta realmente y con que calidad. No asumir un rendimiento equivalente en castellano al de modelos con cobertura multilingue documentada.
- Contexto: la longitud de contexto es desconocida, lo que impide disenar aplicaciones que dependan de ventanas largas.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial. En la practica esto equivale a un riesgo legal, y la naturaleza gated del repositorio anade condiciones de acceso que hay que leer y aceptar antes de la descarga.
- Trazabilidad dudosa: el autor publica multiples repositorios con nombres poco descriptivos (por ejemplo `leary-criste/affine-5g4yy75zuz-q4`) y sin documentacion. No hay garantia de procedencia de los pesos ni de que la arquitectura declarada en la etiqueta se corresponda con la implementacion real.
- Adopcion marginal: 2 descargas y 0 likes implican una comunidad de usuarios practicamente nula. No habra soporte, issues resueltos ni casos de exito que consultar.
- Compatibilidad de despliegue no verificada: la etiqueta `qwen3_5_moe_text` puede requerir una version muy concreta de Transformers. Es probable que aparezcan errores de carga en versiones habituales de vLLM o llama.cpp.
- Recomendacion: tratar este checkpoint como objeto de experimentacion aislada, nunca como dependencia en un sistema en produccion, hasta disponer de evaluaciones propias y de una licencia clara.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leary-criste/model-last
- Repositorio relacionado del mismo autor (LoRA de ajuste supervisado): https://huggingface.co/leary-criste/lora-09-16
- Busqueda de modelos del autor en HuggingFace: https://huggingface.co/models?search=leary-criste%2Faffine-5g4yy75zuz-q4
- Catalogo de modelos atribuidos al autor (terceros): https://essamamdani.com/ai-models/company/leary-criste
- Despliegue de otro modelo del autor via API compatible con OpenAI (terceros): https://featherless.ai/models/leary-criste/affine-5D2E98L93kE8wb883hUyuPQfZTCUe2nR1oyvmRAAcDRm3mmK
- Catalogo general de modelos de 2026 (terceros): https://best-ai.news/ai-model-releases-2026
