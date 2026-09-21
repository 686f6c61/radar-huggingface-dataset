# mradermacher/VirbiusGuard-GGUF

## Resumen

VirbiusGuard-GGUF es la versión cuantizada en formato GGUF del modelo i1see1you/VirbiusGuard, un modelo de seguridad (safety/security guard) de aproximadamente 752 millones de parámetros (751.632.384 según los pesos publicados), construido sobre la familia Qwen3 según los tags del repositorio. La cuantización la ha realizado mradermacher, un autor habitual de versiones GGUF de modelos abiertos, y su función principal es actuar como filtro o guardrail frente a prompt injection, contenido inseguro y comportamiento anómalo en agentes LLM.

El problema que resuelve es concreto: los pipelines con agentes y tool calling necesitan una capa barata y rápida que clasifique entradas y salidas antes de que lleguen a un modelo grande. Con menos de 1.000 millones de parámetros, VirbiusGuard puede ejecutarse en CPU o en GPUs de consumo, lo que permite desplegarlo como paso previo de validación sin disparar el coste de inferencia. El repositorio declara soporte para chino (zh) e inglés (en) y licencia Apache 2.0, lo que facilita su integración en productos comerciales.

Es relevante ahora porque la seguridad de agentes se ha convertido en un cuello de botella práctico: los modelos guard pequeños y cuantizados permiten añadir defensa en profundidad (validación de entrada, de tool calls y de salida) sin depender exclusivamente de APIs propietarias. No obstante, la información pública disponible sobre este modelo concreto es escasa: no hay model card detallada del modelo base en la información proporcionada, ni resultados de benchmarks, ni datos sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (segun los tags del repositorio); detalles especificos no disponibles |
| Parametros totales | 751.632.384 (aproximadamente 0,75 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio cuantizado); el formato del modelo base i1see1you/VirbiusGuard no esta confirmado en la informacion disponible |

Datos adicionales del repositorio: tamano total del repo de 7,0 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 20 de septiembre de 2026 y actualizado el mismo dia. Cuantizador: mradermacher. Modelo base: i1see1you/VirbiusGuard. Los pesos del repositorio estan etiquetados como base_model:quantized, es decir, derivados de un modelo ya entrenado y no de un modelo en crudo.

## Arquitectura y entrenamiento

No hay informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. Los tags del repositorio indican que el modelo base pertenece a la familia Qwen3, lo que implica, con alta probabilidad, un transformer decoder-only con atencion causal y normalizacion tipo RMSNorm, pero no se confirma ningun detalle especifico (numero de capas, dimension oculta, cabezas de atencion, uso de atencion con qk-norm, etc.). Tampoco se indica si se aplicaron tecnicas de alineacion como RLHF, DPO o entrenamiento supervisado con datos de seguridad.

Lo que si se puede afirmar es el proposito declarado mediante los tags: safety, security, llm-guard, prompt-injection y agent-safety. Esto situa al modelo en la categoria de clasificadores de seguridad para LLM, orientados a detectar intentos de manipulacion de prompt, instrucciones maliciosas embebidas en contenido recuperado y comportamientos no deseados dentro de flujos de agente. El tag conversational sugiere que el modelo acepta formato de conversacion con roles, aunque probablemente su salida sea una etiqueta o juicio de seguridad mas que texto libre generativo.

Sobre el proceso de cuantizacion, la model card indica quantize_version 2, output_tensor_quantised 1 y convert_type hf, con cuantizaciones estaticas. El autor senala que las cuantizaciones ponderadas o con imatrix no estan disponibles en ese momento y que pueden solicitarse mediante una discusion en la comunidad.

## Capacidades

- Clasificacion de seguridad de entradas y salidas: el modelo esta etiquetado como llm-guard y safety, por lo que su uso previsto es emitir un juicio sobre si un texto es seguro o no.
- Deteccion de prompt injection: tag explicito prompt-injection, orientado a identificar instrucciones maliciosas embebidas en entradas de usuario o en contenido externo.
- Seguridad en agentes: tag agent-safety, pensado para validar pasos intermedios y llamadas a herramientas en flujos multi-paso.
- Soporte multilingue limitado a chino e ingles (zh, en).
- Formato conversacional: el tag conversational indica compatibilidad con plantillas de chat con turnos de usuario y asistente.
- Despliegue en entornos con recursos limitados gracias a su tamano (aproximadamente 0,75 B de parametros) y a las cuantizaciones disponibles desde Q2_K (0,4 GB).
- Inferencia totalmente local y offline, sin dependencia de APIs externas.
- Capacidades de razonamiento general, generacion de codigo, matematicas o vision: no confirmadas en la informacion disponible.
- Soporte explicito de tool calling o function calling: no confirmado en la informacion disponible.

## Casos de uso

- Filtrado previo de prompt injection en agentes: se ejecuta como primer paso del pipeline, clasifica la entrada del usuario y bloquea o marca los intentos de manipulacion antes de que lleguen al modelo principal. Su tamano reducido permite anadir esta comprobacion con un coste de latencia bajo.
- Moderacion de contenido en aplicaciones de chat: integrado como guardrail de salida, revisa las respuestas de un LLM mayor antes de mostrarlas al usuario final, con soporte para conversaciones en chino e ingles.
- Validacion de contexto en sistemas RAG: cuando el pipeline recupera documentos de fuentes externas, el modelo puede inspeccionar los fragmentos recuperados para detectar instrucciones inyectadas en el texto antes de concatenarlos al prompt.
- Proteccion de tool calls en agentes: intercala una verificacion entre la decision del agente y la ejecucion de la herramienta, de modo que llamadas con parametros sospechosos o fuera de politica se rechacen antes de tocar sistemas externos.
- Despliegue on-premise o en el edge: con la cuantizacion Q4_K_S (0,6 GB) puede ejecutarse en una CPU moderna o en una GPU integrada, lo que permite ofrecer filtrado de seguridad en entornos sin salida a internet o con requisitos de residencia de datos.
- Red-teaming y evaluacion de guardrails: se utiliza como componente de un banco de pruebas para medir la tasa de evasion de un sistema de defensa, comparando prompts adversariales conocidos contra la clasificacion del modelo.
- Capa de seguridad en asistentes internos corporativos: validacion de consultas de empleados en entornos empresariales donde no se permite enviar datos a APIs de terceros.
- Pre-filtro economico antes de un modelo grande: descarta o marca el trafico claramente malicioso en un servicio de alto volumen, reservando el modelo mayor solo para los casos que pasan el filtro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion de seguridad (por ejemplo, tasas de deteccion de prompt injection, falsos positivos o comparativas con otros guard models), y la busqueda web realizada no devolvio ningun resultado relacionado con VirbiusGuard, Qwen3 ni evaluaciones de seguridad de LLM.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion: aproximadamente 0,5-0,6 GB para Q2_K y Q3_K, 0,6 GB para Q4_K_S y Q4_K_M, 0,7 GB para Q5 y Q6_K, 0,9 GB para Q8_0 y 1,6 GB para f16. Estas cifras corresponden al peso de los pesos; hay que sumar el consumo del contexto KV cache, que depende de la longitud de contexto efectiva (no disponible).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente, incluidas NVIDIA GTX 1050 Ti/1650, RTX 3050, RTX 4060, RTX 4090, asi como A100 y H100 si se va a servir con alta concurrencia. En la practica, el modelo es pequeno incluso para GPUs de gama de entrada.
- Viabilidad en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria compartida.
- Viabilidad en CPU: si, es un caso de uso realista; llama.cpp puede ejecutarlo con velocidades de decodificacion interactivas en procesadores modernos, aunque no se dispone de mediciones concretas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, kobold.cpp, y servidores compatibles con la API de OpenAI que acepten GGUF. vLLM y TGI tienen soporte limitado o experimental para GGUF; para produccion a gran escala suele ser preferible convertir a safetensors y usar el framework nativo del modelo base.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos de benchmarks de VirbiusGuard en la informacion disponible, por lo que la comparativa se limita a caracteristicas objetivas. Los modelos de referencia mas habituales en la categoria de guardrails pequenos son Llama Prompt Guard 2 (Meta) y ShieldGemma (Google), pero los valores de contexto, rendimiento y evaluaciones no se han verificado en esta busqueda y deben confirmarse en sus fuentes oficiales.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VirbiusGuard-GGUF (mradermacher) | 0,75 B | No disponible | No disponible | Apache 2.0 | GGUF en HuggingFace, 12 cuantizaciones |
| Modelo base i1see1you/VirbiusGuard | 0,75 B (heredado) | No disponible | No disponible | Apache 2.0 segun el repositorio | HuggingFace |
| Llama Prompt Guard 2 (Meta) | No disponible en esta busqueda | No disponible | No disponible | Licencia comunitaria de Llama | HuggingFace |
| ShieldGemma (Google) | No disponible en esta busqueda | No disponible | No disponible | Terminos de uso de Gemma | HuggingFace |

La ventaja diferencial de VirbiusGuard-GGUF frente a alternativas de mayor tamano es el coste de despliegue: 0,6 GB en Q4_K_M permite ejecutarlo junto a otras cargas en la misma GPU. Su desventaja es la ausencia total de documentacion publica sobre entrenamiento y evaluacion, lo que dificulta justificar su eleccion frente a guard models con benchmarks publicados.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna evaluacion publicada de tasa de deteccion, falsos positivos o robustez frente a ataques adversariales. No se debe asumir un nivel de eficacia concreto.
- Informacion de entrenamiento desconocida: no se detalla el dataset, el numero de tokens ni el metodo de alineacion, lo que impide evaluar sesgos sistematicos o cobertura de dominios.
- Cobertura idiomatica limitada: solo chino e ingles declarados. El rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de evasion: cualquier clasificador de seguridad puede eludirse con ofuscacion, codificacion, traduccion o ataques de prompt multi-turno. Un guard de 0,75 B tiene menos capacidad de razonamiento que un modelo mayor para detectar ataques sofisticados.
- Falsos positivos: los guard models tienden a marcar como inseguro contenido legitimo en dominios sensibles (medicina, seguridad informatica, ficcion). Sin datos de evaluacion no se puede estimar la tasa.
- Degradacion por cuantizacion: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K) degradan la calidad de forma notable; la propia model card marca Q6_K como calidad muy buena y Q8_0 como la mejor calidad con velocidad alta. Para uso en produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones ponderadas: el autor indica que no hay cuants con imatrix disponibles, lo que suele implicar una perdida de calidad algo mayor en los niveles bajos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y los terminos del modelo base i1see1you/VirbiusGuard de forma independiente, ya que la informacion proporcionada no incluye su model card completa.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que impide planificar el uso con documentos largos o conversaciones extensas.
- Modelo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni issues que permitan contrastar su comportamiento en produccion. Se recomienda validarlo internamente antes de integrarlo en un sistema critico.
- No debe usarse como unica capa de defensa: debe combinarse con otras medidas (validacion de esquemas, permisos minimos en herramientas, revision humana) dentro de una estrategia de defensa en profundidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VirbiusGuard-GGUF
- Modelo base: https://huggingface.co/i1see1you/VirbiusGuard
- Lista de cuantizaciones y descargas: https://hf.tst.eu/model#VirbiusGuard-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de archivos GGUF (referencia de TheBloke citada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- La busqueda web realizada no devolvio ningun resultado relevante sobre VirbiusGuard, Qwen3 ni evaluaciones de seguridad de LLM; los resultados obtenidos correspondian a consultas no relacionadas sobre revistas academicas y Google Scholar.
