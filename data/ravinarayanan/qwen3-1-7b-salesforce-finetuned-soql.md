# ravinarayanan/Qwen3-1.7B-Salesforce-Finetuned-SOQL

## Resumen

Qwen3-1.7B-Salesforce-Finetuned-SOQL es un ajuste fino supervisado del modelo denso Qwen3-1.7B de Alibaba, publicado por el desarrollador independiente ravinarayanan. El modelo esta especializado en razonamiento sobre el esquema de Salesforce, generacion de SOQL (Salesforce Object Query Language) con anclaje factual (grounding) y enrutado de herramientas dentro de agentes CRM. Su objetivo es que un modelo pequeno, ejecutable en local, decida cuando necesita consultar metadatos de Salesforce antes de responder, en lugar de asumir que un objeto o campo existe.

El problema que ataca es concreto: los modelos generalistas de ese tamano tienden a inventar nombres de objetos, campos y relaciones de Salesforce cuando se les pide una consulta, lo que produce SOQL invalido o silenciosamente incorrecto. El ajuste desplaza el comportamiento hacia un patron de "recuperar primero, consultar despues", con herramientas tipicas como `search_schema`, `describe_object`, `run_soql` y `analyze_data`. La model card reporta una mejora de +32,1 puntos porcentuales en el conjunto de desarrollo y +30,0 en el de desafio frente al modelo base, medidos sobre 53 y 20 casos congelados respectivamente.

Con 1.720.574.976 parametros y licencia Apache 2.0, es un modelo pensado para despliegues locales o de borde donde los datos de CRM no deben salir de la infraestructura de la organizacion. La ficha del modelo indica que la inferencia de los flujos de agente se ejecuta con `enable_thinking=False`, es decir, en modo no-thinking deterministico para el enrutado de herramientas. El repositorio contiene unicamente el checkpoint fusionado en formato Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-1.7B; no se especifica en la ficha del ajuste fino |
| Tipos de cuantizacion | No se publican en el repositorio; este solo incluye el checkpoint fusionado. El autor indica que la cuantizacion para navegador/WebGPU se evalua por separado y no esta incluida |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint Transformers fusionado) |
| Tamano del repositorio | 3,5 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Pipeline | text-generation |
| Fecha de creacion | 27 de septiembre de 2026 |
| Ultima actualizacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-1.7B, un transformer denso de la familia Qwen3. La serie Qwen3, presentada en el informe tecnico arXiv 2505.09388, incluye variantes densas y de mezcla de expertos (MoE) con escalas de 0,6 a 235 mil millones de parametros; el modelo de 1,7B pertenece a la rama densa. Qwen3-1.7B dispone de modos de razonamiento (thinking) y no razonamiento, y en este ajuste fino los flujos de agente documentados emplean `enable_thinking=False` para obtener un enrutado de herramientas determinista.

La model card no especifica el metodo de ajuste (si fue LoRA, QLoRA o ajuste completo), ni el volumen de datos de entrenamiento, ni la composicion del conjunto de datos, ni si hubo fases de RLHF o DPO. El unico dato operativo es que el repositorio contiene el checkpoint fusionado listo para usar con Transformers, lo que implica que las matrices adaptadoras, si existieron, ya estan integradas en los pesos. Las innovaciones destacables del modelo no estan en la arquitectura, sino en el comportamiento inducido: prioridad de recuperacion de metadatos antes de generar consultas, uso de nombres de relacion literalmente tal y como los devuelve la API de metadatos de Salesforce, y generacion exclusiva de SOQL de solo lectura.

La model card enumera siete principios de anclaje que el modelo debe respetar: no inventar esquema, recuperar esquema cuando el objeto o campo es desconocido, usar nombres de relacion exactos, no derivar nombres de API de relaciones personalizadas a partir de nombres de campos lookup, generar solo SOQL de lectura, no inventar valores de filtro no solicitados y basar el analisis unicamente en registros recuperados o calculos deterministas.

## Capacidades

- Generacion de texto conversacional general: la model card indica que conserva capacidades generales de asistente para redaccion, resumen y explicacion.
- Razonamiento sobre el esquema de Salesforce: interpreta peticiones de usuario orientadas a CRM y determina que metadatos hacen falta.
- Enrutado de herramientas (tool calling): selecciona entre `search_schema`, `describe_object`, `run_soql` y `analyze_data` segun la peticion.
- Generacion de SOQL anclado: produce consultas de solo lectura basadas en metadatos recuperados en tiempo de ejecucion.
- Razonamiento sobre relaciones padre-hijo y jerarquias de objetos de Salesforce.
- Resistencia a la alucinacion de objetos, campos, relaciones, registros y valores de filtro.
- Escritura asistida anclada en CRM (CRM-grounded writing) y explicacion de resultados.
- Capacidad multilingue: limitada al ingles segun los metadatos del modelo.
- Modo thinking: heredado del modelo base Qwen3, aunque los flujos de agente documentados lo desactivan.

## Casos de uso

- Agentes CRM locales para equipos de ventas: el modelo se ejecuta en la propia infraestructura y enruta consultas hacia `run_soql`, evitando enviar datos de oportunidades o cuentas a APIs externas.
- Asistente de exploracion de esquema para administradores de Salesforce: ante una pregunta como "que campos tiene el objeto de oportunidades", el modelo invoca `describe_object` en lugar de responder de memoria, reduciendo el riesgo de inventar campos inexistentes.
- Generacion asistida de SOQL en herramientas internas de analitica: el usuario describe en lenguaje natural lo que quiere y el modelo produce la consulta, que despues pasa por un validador deterministico antes de ejecutarse.
- Enrutado de peticiones ambiguas: ante frases como "muestrame todos los registros de riesgo de renovacion", el modelo devuelve `search_schema` con el termino "renewal risk" en lugar de asumir que existe un objeto `Renewal_Risk__c`, tal y como documenta la model card.
- Resumen y explicacion de resultados de consulta: tras recuperar registros, el modelo los resume y explica en lenguaje natural, manteniendo la trazabilidad de que los datos provienen de la consulta y no del propio modelo.
- Copiloto en flujos de solo lectura para auditoria y compliance: al limitarse a SOQL de lectura y depender de metadatos en tiempo de ejecucion, encaja en escenarios donde no se permite escritura sobre el CRM.
- Prototipado rapido de agentes de tool calling en local: con 1,7B de parametros sirve como banco de pruebas economico para disenar el controlador de agente y las herramientas antes de escalar a modelos mayores.
- Asistencia a equipos de soporte tecnico interno: responde preguntas sobre como consultar objetos concretos y genera ejemplos de SOQL que el desarrollador puede validar y adaptar.

## Benchmarks y rendimiento

La model card publica un banco de evaluacion congelado compuesto por 53 casos de desarrollo, 20 casos de desafio y 73 escenarios totales, que cubren recuperacion de esquema, anclaje de campos, relaciones, agregacion, semantica de consultas, redaccion anclada en CRM, comportamiento general de asistente y resistencia a la alucinacion. La inferencia se ejecuto de forma determinista con `do_sample=False` y `enable_thinking=False`.

| Modelo | Dev | Challenge |
|---|---:|---:|
| Qwen3-1.7B base | 27/53 (50,9 %) | 11/20 (55,0 %) |
| Salesforce Fine-tuned SOQL | 44/53 (83,0 %) | 17/20 (85,0 %) |

| Modelo / conjunto | Tool routing | Grounding | Hallucination guard |
|---|---:|---:|---:|
| Base / Dev | 86,8 % | 60,4 % | 100,0 % |
| Ajustado / Dev | 96,2 % | 86,8 % | 98,1 % |
| Base / Challenge | 85,0 % | 70,0 % | 100,0 % |
| Ajustado / Challenge | 100,0 % | 85,0 % | 100,0 % |

Mejora frente al modelo base: +32,1 puntos porcentuales en Dev y +30,0 puntos porcentuales en Challenge. El autor identifica como areas debiles restantes el enrutado entre objeto conocido y campo desconocido, algunos casos de relaciones padre, casos limite de agregacion y algunos casos de semantica de consultas. No se publican resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 GB en bf16/fp16 solo para los pesos; alrededor de 1,8 GB en cuantizacion de 8 bits y entre 1,0 y 1,2 GB en 4 bits. Hay que sumar la memoria de la cache KV, que crece con la longitud de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM puede ejecutar el modelo cuantizado a 4 u 8 bits; con 8-12 GB se puede trabajar en bf16 con margen para contexto amplio.
- Cabe en GPU de consumo: si. Tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 pueden servirlo; en equipos con 6-8 GB conviene cuantizar.
- Despliegue: Transformers es la via directa, ya que el repositorio publica el checkpoint fusionado en safetensors. vLLM y TGI son opciones habituales para servir el modelo con mayor throughput. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, algo que el autor no incluye en este repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota de despliegue: la model card recomienda acompanar el modelo de validacion determinista de SOQL, ejecucion de solo lectura, respeto de permisos de objeto y campo, validacion de argumentos de herramientas y limites maximos de consulta.

## Comparativa con modelos similares

Solo se dispone de datos comparativos frente al modelo base. No hay informacion sobre otros ajustes finos de Salesforce o SOQL con los que contrastarlo.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Resultado publicado |
|---|---|---|---|---|---|
| Qwen3-1.7B-Salesforce-Finetuned-SOQL | 1,72 mil millones | No especificado en la ficha del ajuste (32.768 en el base) | Apache 2.0 | Ajuste fino para SOQL y agentes CRM | 83,0 % Dev / 85,0 % Challenge |
| Qwen/Qwen3-1.7B | 1,72 mil millones | 32.768 tokens (modelo base) | Apache 2.0 | Modelo generalista denso | 50,9 % Dev / 55,0 % Challenge en el banco del autor |
| Otros ajustes finos de Salesforce/SOQL de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Areas debiles reconocidas por el autor: enrutado entre objeto conocido y campo desconocido, algunos casos de relaciones padre, casos limite de agregacion y parte de la semantica de consultas.
- Riesgo de alucinacion de esquema: aunque el ajuste lo reduce notablemente, el modelo sigue siendo un modelo de lenguaje y puede generar objetos, campos o valores de filtro inexistentes; la model card insiste en que los metadatos de Salesforce en tiempo de ejecucion son la fuente de verdad.
- Solo ingles: los metadatos del modelo indican exclusivamente `en`, por lo que no se debe esperar un comportamiento fiable en castellano u otros idiomas.
- La guarda de alucinacion baja de 100,0 % a 98,1 % en el conjunto Dev tras el ajuste, es decir, el ajuste no es gratuito en ese eje.
- Requisitos de produccion: validar el SOQL de forma determinista, forzar ejecucion de solo lectura, respetar permisos de objeto y campo, validar los argumentos de las herramientas y limitar el numero maximo de registros por consulta.
- El modo `enable_thinking=False` es el documentado para el enrutado de herramientas; no hay datos publicados sobre el rendimiento del modelo con el modo thinking activado.
- Licencia Apache 2.0, que permite uso comercial, pero el proyecto no esta afiliado ni respaldado por Salesforce, Inc.; Salesforce es una marca registrada de Salesforce, Inc.
- Adopcion practica muy baja en el momento de redactar la ficha: cero descargas y cero "likes" en HuggingFace, por lo que no existe validacion independiente de los resultados reportados.
- No se publican datos de entrenamiento, metodo de ajuste ni receta de datos, lo que dificulta reproducir o auditar el comportamiento.
- No se incluye una version cuantizada en GGUF ni pesos para llama.cpp u Ollama en este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ravinarayanan/Qwen3-1.7B-Salesforce-Finetuned-SOQL
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Guia de ajuste fino de Qwen3-1.7B (distil labs): https://www.distillabs.ai/learn/qwen3-1-7b-fine-tuning-guide/
- Perfil del autor en HuggingFace: https://huggingface.co/ravinarayanan/models
