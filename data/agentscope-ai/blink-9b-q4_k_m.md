# agentscope-ai/Blink-9B-Q4_K_M

## Resumen

Blink-9B-Q4_K_M es una cuantizacion GGUF Q4_K_M del modelo Piccolo-9B, desarrollado por AgentScope (agentscope-ai), y publicado bajo el identificador agentscope-ai/Blink-9B-Q4_K_M. A diferencia de un modelo generativo convencional, esta disenado como modelo de decision: no produce tokens de respuesta, sino que puntua candidatos y devuelve probabilidades, lo que lo orienta a tareas de revision de herramientas (tool review) y seleccion de contexto en sistemas de agentes. Su pipeline declarado en Hugging Face es text-classification, con 8.953.803.264 parametros totales (aproximadamente 9B) y licencia Apache 2.0.

El modelo emplea una arquitectura de atencion bidireccional sobre el backbone de texto, una eleccion poco habitual en modelos de 9B orientados a generacion, y esta pensado para integrarse en el runtime compatible con Piccolo sobre llama.cpp, que expone un endpoint /v1/systemone para devolver probabilidades sin generar tokens. Los idiomas soportados son ingles y chino. La cuantizacion Q4_K_M reduce el peso a un repositorio de 5,6 GB repartido en dos shards, lo que facilita el despliegue local en hardware de consumo.

Su relevancia actual radica en el auge de los sistemas multiagente, donde decisiones como que herramienta invocar o que fragmento de contexto incluir condicionan el coste y la fiabilidad. Un modelo dedicado a esa funcion, con validacion numerica frente a la referencia BF16 (desviacion total media de 0,013701 en 556 juicios sinteticos, p95 de 0,081681), ofrece una alternativa mas ligera y determinista que reutilizar un LLM generativo para cada decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional (bidirectional-attention) sobre backbone de texto; modelo de decision con puntuacion nativa de candidatos |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el backbone de texto se convirtio a BF16 GGUF antes de cuantizar |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards; cargar Piccolo-9B-Q4_K_M-00001-of-00002.gguf) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la composicion del dataset de entrenamiento ni el numero de tokens utilizados. Lo que si se conoce es que el modelo base, Piccolo-9B, emplea atencion bidireccional en el prompt, un diseno que permite al modelo observar el contexto completo de forma simetrica y puntuar candidatos en lugar de predecir el siguiente token. Esta orientacion lo convierte en un decision-model: recibe un prompt y un conjunto de candidatos, y devuelve una distribucion de probabilidad sobre ellos mediante puntuacion nativa.

La version cuantizada se genero convirtiendo primero el backbone de texto a GGUF en BF16 y aplicando despues la cuantizacion Q4_K_M. El autor publica una validacion numerica frente a la referencia BF16 sobre 556 juicios sinteticos, con una desviacion total media (total variation) de 0,013701 y un percentil 95 de 0,081681, lo que indica una degradacion acotada por la cuantizacion. No se especifica si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Puntuacion de decisiones: devuelve probabilidades sobre candidatos en lugar de generar texto libre, lo que lo hace adecuado para clasificacion y seleccion.
- Revision de herramientas (tool review): evalua si una llamada a herramienta es correcta o adecuada dentro de un flujo de agente.
- Seleccion de contexto: elige que fragmentos de contexto o documentos son relevantes para una tarea dada.
- Atencion bidireccional sobre el prompt, que permite condicionar la decision con el contexto completo.
- Integracion con runtime compatible con Piccolo sobre llama.cpp, con endpoint /v1/systemone para inferencia de decisiones.
- Soporte multilingue limitado a ingles y chino.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling generativo ni modo thinking en la informacion disponible.

## Casos de uso

- Enrutado de herramientas en agentes: dado un mensaje de usuario y un catalogo de herramientas, el modelo puntua cada opcion y devuelve la probabilidad de ser la adecuada, sustituyendo a un LLM generativo en ese paso y reduciendo latencia y coste.
- Seleccion de contexto en pipelines RAG: ante varios fragmentos recuperados, el modelo asigna probabilidades de relevancia y permite filtrar antes de enviar el contexto a un modelo generativo, lo que reduce tokens de entrada.
- Validacion de llamadas a herramientas en produccion: como paso de revision previo a la ejecucion, el modelo detecta llamadas mal formadas o inadecuadas y evita efectos secundarios no deseados.
- Clasificacion de intenciones en asistentes conversacionales: con su pipeline de text-classification, puede etiquetar la intencion del usuario en ingles o chino para dirigir el flujo de dialogo.
- Orquestacion multiagente: decidir que subagente debe atender una peticion en funcion del estado de la conversacion, con una salida probabilistica que permite umbrales y abstención.
- Despliegue local en estaciones de trabajo: con 5,6 GB en Q4_K_M, cabe en GPUs de consumo y permite ejecutar el paso de decision en local sin depender de la nube.
- Evaluacion offline de agentes: usar las probabilidades como senal para medir la calidad de las decisiones de un agente en suites de test sinteticas.

## Benchmarks y rendimiento

El autor enlaza a resultados de evaluacion en el repositorio de GitHub (https://github.com/agentscope-ai/Piccolo/tree/main/evaluation), pero los valores numericos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

Unico dato numerico disponible: validacion de cuantizacion frente a BF16 sobre 556 juicios sinteticos, con desviacion total media de 0,013701 y p95 de 0,081681.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,6 GB para los pesos en Q4_K_M, mas overhead de contexto y del runtime; en la practica, entre 6 y 8 GB de VRAM para uso comodo.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en datacenter, A100 o H100 si se requiere concurrencia alta.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM; con 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: runtime compatible con Piccolo sobre llama.cpp (requerido para atencion bidireccional y puntuacion nativa de candidatos); el endpoint /v1/systemone expone las probabilidades. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blink-9B-Q4_K_M (Piccolo-9B) | aproximadamente 9B | no disponible | Modelo de decision con atencion bidireccional | Apache 2.0 | GGUF en Hugging Face y ModelScope |
| Piccolo-9B (BF16) | aproximadamente 9B | no disponible | Modelo de decision, referencia completa | Apache 2.0 | Hugging Face (modelo base) |
| Piccolo-27B | no disponible | no disponible | Modelo de decision de mayor tamano de la misma familia | Apache 2.0 | Hugging Face |
| LLM generativos de 7-9B | 7-9B | variable | Generacion de texto y clasificacion via prompting | variable | amplia |

La comparativa con LLM generativos de tamano similar no es directa: Blink-9B no genera texto, sino que puntua candidatos, por lo que compite con el uso de un LLM generativo como clasificador. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de decision, no generativo: no produce respuestas de texto libre; usarlo como LLM convencional no es su proposito.
- Requiere un runtime especifico (Piccolo-compatible llama.cpp) con atencion bidireccional y puntuacion nativa de candidatos; no funciona con llama.cpp estandar ni con otros servidores de inferencia sin adaptacion.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto no documentada, lo que impide planificar su uso en escenarios de contexto largo.
- La cuantizacion Q4_K_M introduce desviacion frente a BF16 (media 0,013701, p95 0,081681); en decisiones con umbrales ajustados conviene validar el impacto.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de calibracion incorrecta de probabilidades en dominios alejados del entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (THIRD_PARTY_LICENSES.md) del repositorio.
- Popularidad muy baja (299 descargas, 0 likes) y fecha de creacion reciente; ecosistema y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/agentscope-ai/Blink-9B-Q4_K_M
- Modelo base Piccolo-9B: https://huggingface.co/agentscope-ai/Piccolo-9B
- Repositorio del proyecto: https://github.com/agentscope-ai/Piccolo
- Documentacion del runtime QwenPaw: https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Resultados de evaluacion: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos de la familia: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- Decision Playground: https://decisionplayground.agentscope.io/
- ModelScope: https://www.modelscope.cn/models/AgentScope/Piccolo-9B-Q4_K_M
- Coleccion ModelScope QwenPaw-Flash: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Validacion de cuantizacion: https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M/resolve/main/THIRD_PARTY_LICENSES.md
