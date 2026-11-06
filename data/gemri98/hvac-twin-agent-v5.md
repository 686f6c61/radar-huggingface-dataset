# GeMri98/hvac-twin-agent-v5

## Resumen

El modelo `GeMri98/hvac-twin-agent-v5` es un adaptador LoRA (PEFT) publicado por el usuario GeMri98 sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Su proposito es convertir un LLM generico de 3B parametros en un agente especializado en climatizacion (HVAC) y eficiencia energetica en el contexto normativo australiano. El adaptador ensena al modelo a invocar una herramienta externa, un gemelo digital termico de tipo 2R2C para una zona de oficina, mediante un protocolo de llamada estructurado en XML (`<call>{"tool":"simulate","cooling_pct":N}</call>`), y a redactar respuestas a partir de los resultados devueltos por esa simulacion.

El segundo componente del modelo es la capacidad de responder preguntas sobre la Seccion J del codigo NCC 2022 (National Construction Code, Volumen 1), usando pasajes recuperados mediante RAG y citandolos con marcadores `[S#]`. El repositorio incluye dos adaptadores: `adapter_v5_1`, centrado exclusivamente en el uso de la herramienta del gemelo termico, y `adapter_v6`, que combina esa habilidad con respuestas fundamentadas en el NCC y que el autor recomienda como version principal.

La relevancia del proyecto es acotada pero instructiva: demuestra como un modelo pequeno (3B) puede especializarse mediante LoRA en un dominio tecnico regulado, con un protocolo de tool calling propio y un pipeline de verificacion externo. Conviene subrayar que el autor es explicito sobre las limitaciones: los resultados proceden de una unica ejecucion sobre conjuntos de prueba pequenos, el gemelo termico es sintetico y el modelo no esta validado sobre edificios reales ni sirve para decisiones de cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B-Instruct) con adaptadores LoRA (PEFT) |
| Parametros totales | 3B en el modelo base; los adaptadores LoRA no declaran recuento propio en la informacion disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el contenido de entrenamiento es en ingles: NCC 2022 y escenarios HVAC) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA); el repositorio incluye ademas un indice RAG y ficheros JSONL de entrenamiento y prueba |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino un ajuste mediante LoRA sobre Qwen2.5-3B-Instruct, un transformer decoder-only de 3B parametros. El repositorio contiene dos adaptadores: `adapter_v5_1`, entrenado para el uso de la herramienta del gemelo termico, y `adapter_v6`, que anade respuestas fundamentadas en el NCC. El protocolo de tool calling es textual y especifico del dominio: el modelo emite una etiqueta `<call>` con un JSON que contiene el nombre de la herramienta (`simulate`) y un parametro de consigna (`cooling_pct`); el gemelo termico 2R2C se ejecuta fuera del modelo y sus resultados se reinyectan en el contexto para que el modelo redacte la respuesta final.

El entrenamiento combina datos de uso de herramienta (pares pregunta-llamada y preguntas de seguimiento sobre los resultados) con datos de RAG sobre pasajes de la Seccion J del NCC 2022 (clausulas J1, J2, J6 y J9). El repositorio incluye `rag_index/`, `rag_train.jsonl`, `rag_test.jsonl` y ficheros `qa_*_v51.jsonl`. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. El autor indica que las respuestas de referencia para el NCC fueron redactadas por el propio Qwen sin adaptador, lo que actua como techo de calidad del adaptador.

Un elemento destacable es que la verificacion no reside en los pesos, sino en el pipeline: un checker comprueba cada frase de la respuesta contra los pasajes recuperados y cada cifra contra los datos o los resultados del gemelo; si falla, se rehace el borrador una vez y, si vuelve a fallar, se abstiene.

## Capacidades

- Uso de herramienta del gemelo termico: genera llamadas estructuradas `<call>{"tool":"simulate","cooling_pct":N}</call>` y responde a partir de los resultados de la simulacion 2R2C.
- Respuestas fundamentadas en el NCC 2022 Seccion J con citas `[S#]` y abstenccion explicita ("Not found in the provided sources.") cuando el pasaje no esta en las fuentes recuperadas.
- Tool calling de dominio especifico (no generico): el protocolo esta disenado para una unica herramienta de simulacion.
- Razonamiento multi-turno dentro del bucle agente-herramienta-agente.
- Capacidad de abstenerse ante preguntas no respondibles con las fuentes recuperadas (4/4 en la prueba manual del autor).
- No se documentan capacidades de vision, audio, codigo general ni matematicas fuera del dominio.

## Casos de uso

- Asistente de simulacion termica para ingenieros HVAC: el modelo traduce una pregunta en lenguaje natural ("que pasa si bajo el enfriamiento al 60 %?") a una llamada al gemelo 2R2C y devuelve la respuesta en texto a partir de los resultados, sin que el usuario tenga que manejar la API de la simulacion.
- Consulta normativa asistida sobre la Seccion J del NCC 2022: recuperacion de pasajes y respuesta con citas `[S#]`, util como primer filtro documental antes de la revision de un especialista.
- Prototipado de agentes de eficiencia energetica en edificios: sirve como ejemplo reproducible de como integrar un LLM pequeno con un simulador fisico y un indice RAG en un pipeline verificable.
- Formacion y divulgacion tecnica: el repositorio incluye datos de entrenamiento y prueba, lo que permite estudiar el comportamiento de un LoRA de dominio y el diseno de un checker de fidelidad.
- Evaluacion de arquitecturas de abstenccion: el modelo y su pipeline son un caso de estudio sobre como forzar rechazos cuando la evidencia recuperada es insuficiente.
- Demostraciones de tool calling con modelos de 3B en hardware modesto: al ser un adaptador sobre un modelo pequeno, puede desplegarse en entornos con recursos limitados para pruebas internas.
- No es adecuado para certificacion, diseno de instalaciones ni decisiones de cumplimiento, segun advierte el propio autor.

## Benchmarks y rendimiento

Los resultados publicados por el autor son de una unica ejecucion y sobre conjuntos pequenos; se reproducen tal cual, sin extrapolacion.

| Prueba | Resultado |
|---|---|
| Uso de herramienta del gemelo, tipos de pregunta vistos, correccion estricta (v5.1) | 93,3 % dia normal; 89,7 % ola de calor |
| Uso de herramienta, tipo de pregunta NO visto ("full cooling") | Aproximadamente 20 % (sin generalizacion real) |
| v6 mantiene el protocolo `<call>` (primer turno coincide con la llamada de referencia, 16 filas reservadas) | 14/16 (igual que v5.1) |
| Filas reservadas del NCC, respuesta fundamentada y citada (12): Qwen sin adaptador / v5.1 / v6 | 9 / 3 / 10 |
| 20 preguntas manuales sobre el NCC (16 respondibles, 4 no respondibles), con checker | 12 respondidas, 4 abstenidas; 4/4 no respondibles rechazadas; 0 claramente erroneas en revision |
| Cifras del gemelo en la demo del agente | Coincidencia exacta con una ejecucion directa del gemelo |

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo base de 3B parametros con adaptadores LoRA, la inferencia en FP16 requiere del orden de 6-7 GB de VRAM; en cuantizacion de 8 bits, alrededor de 3-4 GB; en 4 bits, aproximadamente 2-2,5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070) para FP16; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en FP16 y practicamente cualquiera con 6 GB en cuantizacion.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el modelo base), vLLM con soporte LoRA, llama.cpp u Ollama si se fusionan y convierten los pesos, y TGI con adaptadores. El repositorio no documenta configuraciones de despliegue.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeMri98/hvac-twin-agent-v5 | 3B + LoRA | No disponible | HVAC, gemelo termico, NCC Seccion J | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | 3B | No disponible en esta ficha | Proposito general, instrucciones | Apache 2.0 | Ampliamente disponible |
| Alternativas de dominio HVAC | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores o modelos especializados en HVAC y normativa australiana comparables. La comparacion mas directa es con el modelo base: segun los datos del autor, el adaptador v6 mejora la citacion consistente y la abstenccion (10/12 frente a 9/12 en filas reservadas del NCC) pero no supera a Qwen sin adaptador en comprension del texto normativo, ya que las respuestas de referencia fueron generadas por ese mismo modelo.

## Limitaciones y advertencias

- v6 no es mejor que Qwen sin adaptador leyendo el NCC; solo cita de forma mas consistente y se abstiene mejor. Las respuestas de referencia las escribio Qwen, por lo que el adaptador no puede superar a su profesor.
- Los resultados proceden de una unica ejecucion sobre 20 preguntas redactadas por una IA y revisadas parcialmente por el autor (3 de 12 respuestas verificadas contra ncc.abcb.gov.au). No es un benchmark.
- El checker verifica fidelidad al texto recuperado, no relevancia: dos respuestas vagas pasaron el filtro.
- El modelo no puede decidir si un escenario de edificio cumple una clausula normativa.
- El indice RAG mezcla texto de variaciones estatales (por ejemplo, NSW); no debe asumirse nada sobre normativa especifica de Victoria.
- El gemelo termico y los escenarios son sinteticos y no estan validados sobre un edificio real. No apto para decisiones de cumplimiento ni de diseno.
- El autor no redistribuye el PDF de la guia NABERS; el texto del NCC es (c) Commonwealth of Australia y Estados y Territorios, publicado por ABCB bajo CC BY 4.0.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial requiere revisar las condiciones del modelo base y de las fuentes normativas citadas.
- Riesgo de alucinacion en preguntas fuera del dominio o cuando la recuperacion falla; el pipeline de abstenccion mitiga pero no elimina este riesgo.
- Idioma: el contenido y los datos de entrenamiento estan en ingles; no se documenta soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeMri98/hvac-twin-agent-v5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- National Construction Code (ABCB): https://ncc.abcb.gov.au
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
