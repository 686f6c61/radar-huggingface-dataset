# LiquidAI/LFM2-24B-A2B

## Resumen

LFM2-24B-A2B es el modelo de mayor tamano de la familia LFM2 desarrollada por Liquid AI, un laboratorio centrado en arquitecturas eficientes para despliegue en el borde. Se trata de un modelo de lenguaje de tipo mezcla de expertos (MoE) con 23.843.661.440 parametros totales y 2.300 millones de parametros activos por token, disenado para mantener un coste de inferencia bajo incluso en hardware de consumo. Su ventana de contexto es de 32.768 tokens y su vocabulario de 65.536 entradas.

El modelo resuelve el problema de ejecutar un LLM de gran capacidad en entornos con memoria limitada: cabe en 32 GB de RAM, lo que permite desplegarlo en portatiles y equipos de sobremesa sin GPU de datacenter. La arquitectura es hibrida, combinando capas convolucionales y de atencion, y se entreno sobre 17 billones de tokens en precision mixta BF16/FP8. Es un modelo instructivo de proposito general, sin trazas de razonamiento, orientado a generacion de texto, uso de herramientas y despliegue local.

Su relevancia actual radica en la combinacion de escala (24B totales) con eficiencia de inferencia (2,3B activos) y soporte nativo en llama.cpp, vLLM y SGLang desde el primer dia. Liquid AI lo posiciona como el modelo de bucle interno rapido en pipelines de agentes y como motor de RAG local y atencion al cliente on-premise. La model card indica que existe una version posterior, LFM2.5-24B-A2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE (capas convolucionales + atencion) |
| Parametros totales | 23.843.661.440 (24B) |
| Parametros activos | 2.300 millones (2,3B) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (soporte en llama.cpp, vLLM y SGLang; precision de entrenamiento mixta BF16/FP8) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | LFM Open License v1.0 (license:other) |
| Formato de pesos | safetensors |
| Capas | 40 (30 convolucionales + 10 de atencion) |
| Vocabulario | 65.536 tokens |
| Precision de entrenamiento | Mixta BF16/FP8 |
| Presupuesto de entrenamiento | 17 billones de tokens |
| Tamano del repositorio | 47,7 GB |

## Arquitectura y entrenamiento

LFM2-24B-A2B emplea una arquitectura hibrida de 40 capas en la que 30 son convolucionales y solo 10 son de atencion, combinada con un esquema de mezcla de expertos que activa 2,3B parametros por token sobre un total de 24B. Esta proporcion de capas convolucionales frente a de atencion reduce el coste computacional y de memoria asociado a la atencion cuadratica, lo que explica la eficiencia de decodificacion reportada. El modelo se entreno con precision mixta BF16/FP8 sobre un presupuesto de 17 billones de tokens, frente a los 12 billones de su hermano menor LFM2-8B-A1B, que comparte familia arquitectonica con 24 capas (18 convolucionales y 6 de atencion).

La model card destaca un escalado predecible: la calidad mejora de forma log-lineal desde 350M hasta 24B parametros totales, lo que confirma que la arquitectura hibrida escala de forma fiable a lo largo de casi dos ordenes de magnitud. No se detalla en la informacion disponible la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. El modelo es instructivo y no genera trazas de razonamiento. La decodificacion alcanza 112 tok/s en CPU AMD y 293 tok/s en H100, y el modelo cabe en 32 GB de RAM.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de 32.768 tokens.
- Llamada a funciones (function calling) nativa: el modelo emite llamadas en formato Pythonico entre los tokens especiales `<|tool_call_start|>` y `<|tool_call_end|>`, y puede configurarse para emitir JSON mediante instrucciones en el system prompt.
- Uso de herramientas con definicion en JSON en el system prompt, ejecucion del resultado y devolucion en el rol "tool", seguida de una respuesta final en texto plano.
- Salidas estructuradas y busqueda web, segun los casos de uso recomendados por el autor.
- Capacidades multilingues en nueve idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol y portugues.
- Integracion en pipelines de agentes multi-paso como modelo de bucle interno rapido.
- No incluye modo de razonamiento explicito (thinking mode) ni capacidades de vision o audio segun la informacion disponible.
- El autor no recomienda su uso para programacion, ya que no fue optimizado para ello.

## Casos de uso

- Uso de herramientas en agentes: el modelo emite llamadas a funciones en formato Pythonico o JSON, lo que permite integrarlo como planificador de acciones en pipelines de agentes multi-paso con acceso a APIs, bases de datos o buscadores. Su bajo numero de parametros activos reduce la latencia en cada iteracion del bucle.
- Atencion al cliente con preservacion de privacidad: desplegado on-premise, gestiona conversaciones multi-turno con acceso a herramientas (consultas a base de datos, creacion de tickets) sin que los datos salgan de la red corporativa. El contexto de 32.768 tokens permite mantener historiales largos de conversacion.
- Resumen y preguntas sobre documentos en local: para flujos sensibles (legal, medico, corporativo) que requieren procesar documentos sin conexion, el modelo cabe en 32 GB de RAM y puede ejecutarse en un portatil o sobremesa de consumo.
- Pipelines de RAG locales: actua como motor de generacion en arquitecturas de recuperacion aumentada sobre una sola maquina, sin necesidad de servidores con GPU, gracias a su bajo coste de inferencia y a su soporte en llama.cpp, vLLM y SGLang.
- Asistentes multilingues: con soporte para nueve idiomas, puede emplearse en aplicaciones de atencion o soporte que requieran cambiar entre espanol, portugues, frances, aleman, arabe, chino, japones y coreano dentro de la misma sesion.
- Extraccion de datos estructurados: mediante salidas estructuradas y function calling, puede convertir texto libre en JSON validado para procesos de ingestion, clasificacion o enriquecimiento de datos en pipelines internos.
- Automatizacion de back-office con acceso a sistemas: combinando tool calling y ejecucion local, puede consultar estados de candidatos, tickets o registros internos y redactar la respuesta final, como ilustra el ejemplo de la model card con `get_candidate_status`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de eficiencia de inferencia: 112 tok/s de decodificacion en CPU AMD y 293 tok/s en GPU H100, con un requisito de 32 GB de RAM para el despliegue.

## Requisitos de hardware

- VRAM/RAM estimada: el modelo cabe en 32 GB de RAM, segun el autor, lo que permite despliegue en portatiles y equipos de sobremesa de consumo.
- GPU recomendadas: H100 para maximo throughput (293 tok/s de decodificacion reportados). No se especifican otros modelos de GPU en la informacion disponible.
- CPU: se reportan 112 tok/s de decodificacion en CPU AMD, lo que habilita inferencia sin GPU.
- Despliegue: soporte desde el primer dia en llama.cpp, vLLM y SGLang. Tambien es compatible con transformers y con endpoints compatibles, con despliegue disponible en Azure.
- Latencia y throughput: 112 tok/s en CPU AMD y 293 tok/s en H100 en decodificacion; no se dispone de datos de prefill ni de latencia extremo a extremo.
- Cuantizacion: no se detallan los formatos soportados, aunque la disponibilidad en llama.cpp implica soporte de cuantizaciones GGUF habituales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Capas | Entrenamiento | Licencia |
|---|---|---|---|---|---|---|
| LFM2-24B-A2B | 24B | 2,3B | 32.768 | 40 (30 conv + 10 attn) | 17B tokens | LFM Open License v1.0 |
| LFM2-8B-A1B | 8,3B | 1,5B | 32.768 | 24 (18 conv + 6 attn) | 12B tokens | LFM Open License v1.0 |
| LFM2.5-24B-A2B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con los modelos de la propia familia LFM2. No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros comparables en el material proporcionado.

## Limitaciones y advertencias

- El autor no recomienda su uso para programacion, ya que el modelo no fue optimizado para generar codigo.
- Es un modelo instructivo sin trazas de razonamiento; no dispone de modo de pensamiento explicito, lo que puede limitar tareas que requieran cadenas de razonamiento largas.
- La ventana de contexto esta limitada a 32.768 tokens; documentos o conversaciones mas largas requeriran truncado o estrategias de recuperacion.
- No se detalla en la informacion disponible la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos especificos ni el grado de alineacion aplicado.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- La licencia es LFM Open License v1.0 (license:other); es necesario revisar el texto completo de la licencia para confirmar las condiciones de uso comercial antes de desplegar en produccion.
- Existe una version posterior, LFM2.5-24B-A2B, que el autor referencia como `new_version`; conviene evaluar su adopcion frente a esta version.
- El rendimiento en idiomas distintos del ingles no esta cuantificado en la informacion disponible, aunque el modelo declara soporte para nueve idiomas.
- La cuantizacion no esta detallada; el despliegue en 32 GB de RAM presupone un formato concreto que no se especifica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Blog del modelo: https://www.liquid.ai/blog/lfm2-24b-a2b
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Documentacion de plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Documentacion de uso de herramientas: https://docs.liquid.ai/lfm/key-concepts/tool-use
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- Modelo hermano: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Paper de referencia: arxiv:2511.23404
