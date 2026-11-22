# agentscope-ai/Piccolo-27B-BF16

## Resumen

Piccolo-27B-BF16 es la distribucion en GGUF de precision BF16 del modelo Piccolo-27B, desarrollado por AgentScope (agentscope-ai). No es un modelo generativo al uso: se trata de un modelo de decision (decision model) disenado para revisar llamadas a herramientas y seleccionar contexto en pipelines de agentes. En lugar de generar tokens de respuesta, devuelve probabilidades sobre candidatos predefinidos, lo que lo hace adecuado como componente de enrutamiento y validacion dentro de sistemas multiagente.

El modelo cuenta con 26.895.998.464 parametros (aproximadamente 27B) y emplea atencion bidireccional sobre el prompt, una eleccion arquitectonica poco habitual en modelos de lenguaje y coherente con su tarea de clasificacion y puntuacion de candidatos. Soporta ingles y chino, y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion en productos comerciales.

Su relevancia actual radica en la creciente necesidad de capas de control fiables en sistemas agenticos: decidir que herramienta invocar, que fragmento de contexto es relevante o si una accion propuesta es segura. Piccolo aborda ese problema con un modelo de 27B que no consume tokens de generacion, sino que expone un endpoint (`/v1/systemone`) que devuelve probabilidades directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional sobre el prompt (modelo de decision, no generativo) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (esta release); el repo incluye tag `gguf`; otras cuantizaciones no disponibles en la informacion |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en BF16, dividido en 12 shards (`Piccolo-27B-BF16-00001-of-00012.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible confirma que Piccolo-27B emplea atencion bidireccional sobre el prompt, lo que permite que cada token atienda a todo el contexto de entrada en ambas direcciones, en lugar de la mascara causal tipica de los modelos generativos. Esta eleccion encaja con su funcion: puntuar candidatos y clasificar decisiones requiere comprender el contexto completo, no predecir el siguiente token. El modelo base es `agentscope-ai/Piccolo-27B` y esta release es una conversion directa del checkpoint completo a BF16 GGUF, sin cambios en los pesos mas alla de la precision.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona una validacion numerica: sobre cuatro preguntas de prueba, la mayor diferencia de probabilidad de candidato respecto al checkpoint completo fue de 0.001725, lo que indica que la conversion a BF16 GGUF preserva el comportamiento del modelo original con alta fidelidad. El runtime necesario es una version de llama.cpp compatible con Piccolo, que implementa atencion bidireccional en el prompt y puntuacion nativa de candidatos.

## Capacidades

- Puntuacion de candidatos: devuelve probabilidades sobre opciones predefinidas sin generar tokens de respuesta.
- Revision de llamadas a herramientas (tool review): evalua si una invocacion de herramienta propuesta es adecuada o segura.
- Seleccion de contexto: identifica que fragmentos de contexto son relevantes para una decision dada.
- Clasificacion de texto: pipeline declarado como `text-classification`.
- Decisiones binarias o multietiqueta mediante comparacion de probabilidades de candidatos.
- Soporte bilingue: ingles y chino.
- Integracion via endpoint `/v1/systemone` en el runtime compatible, que expone probabilidades directamente.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling generativo ni modo de razonamiento extendido (thinking).

## Casos de uso

- Enrutamiento de herramientas en agentes: antes de ejecutar una llamada a una API, Piccolo puntua la idoneidad de la herramienta candidata frente a alternativas, reduciendo invocaciones erroneas en pipelines multiagente.
- Validacion de seguridad de acciones: dado un contexto y una accion propuesta, el modelo devuelve la probabilidad de que sea segura, lo que permite bloquear operaciones de riesgo antes de que lleguen a produccion.
- Seleccion de contexto en RAG: con multiples fragmentos recuperados, Piccolo puntua cada candidato y permite elegir los mas relevantes para la consulta sin coste de generacion.
- Clasificacion de intenciones en atencion al cliente: asignar un mensaje entrante a una categoria predefinida comparando probabilidades de candidatos, con latencia menor que un modelo generativo.
- Moderacion y filtrado de contenido: evaluar si un texto cumple una politica concreta tratandolo como una decision entre candidatos (permitir, revisar, bloquear).
- Control de calidad en pipelines de agentes: revisar decisiones intermedias de un agente antes de continuar el flujo, actuando como capa de verificacion barata en tokens.
- Despliegue local en entornos con requisitos de privacidad: al ser GGUF y ejecutarse con llama.cpp, puede correr on-premise sin exponer datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a la pagina de evaluacion del repositorio de GitHub (`agentscope-ai/Piccolo/tree/main/evaluation`), pero los valores numericos no se incluyen en la informacion proporcionada. El unico dato cuantitativo disponible es la validacion de conversion: diferencia maxima de 0.001725 en probabilidad de candidato respecto al checkpoint completo en cuatro preguntas de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB solo para pesos (27B a 2 bytes por parametro), mas overhead de contexto y runtime; en la practica se recomienda al menos 64-80 GB de VRAM para BF16.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 24 GB) si el runtime soporta sharding.
- GPU consumer: no cabe en una unica RTX 4090 (24 GB) ni en GPUs de 32 GB en BF16. Seria necesario recurrir a cuantizaciones menores, que no se documentan en esta release.
- Despliegue: runtime llama.cpp compatible con Piccolo (obligatorio para atencion bidireccional y puntuacion nativa de candidatos); el endpoint `/v1/systemone` expone las probabilidades. vLLM, TGI u Ollama no se mencionan como soportados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos de decision o clasificadores de gran tamano con atencion bidireccional), ni datos de rendimiento que permitan una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce texto libre; solo puntua candidatos. No debe emplearse como sustituto de un LLM conversacional.
- Runtime especifico: requiere la version de llama.cpp compatible con Piccolo; otros runtimes estandar (vLLM, TGI, Ollama) no estan documentados como soportados.
- Idiomas limitados: solo ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Longitud de contexto desconocida: no se publica la ventana maxima, lo que dificulta planificar su uso en contextos largos.
- Posibles sesgos: no se documentan analisis de sesgo; al ser un modelo de decision, sus sesgos se traducen directamente en decisiones de enrutamiento o moderacion, con impacto operativo.
- Riesgo de calibracion: las probabilidades de candidato deben validarse en el dominio de uso; no se publican metricas de calibracion mas alla de la validacion de conversion.
- Licencia: Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (`THIRD_PARTY_LICENSES.md`) por posibles componentes con condiciones adicionales.
- Adopcion temprana: 748 descargas y 0 likes en el momento de la consulta; ecosistema y documentacion aun limitados.

## Enlaces

- Hugging Face (esta release): https://huggingface.co/agentscope-ai/Piccolo-27B-BF16
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Documentacion del runtime compatible (QWENPAW): https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Evaluacion: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- Decision Playground: https://decisionplayground.agentscope.io/
- ModelScope: https://www.modelscope.cn/models/AgentScope/Piccolo-27B-BF16
- Coleccion ModelScope (QwenPaw-Flash): https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Validacion de conversion: https://huggingface.co/agentscope-ai/Piccolo-27B-BF16/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-27B-BF16/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-27B-BF16/resolve/main/THIRD_PARTY_LICENSES.md
