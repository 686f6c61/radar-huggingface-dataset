# realshahriya/butter-w1

## Resumen

Butter W1 es un modelo de lenguaje presentado por el equipo de ingeniería MUKHON (Bangladesh) bajo el identificador `realshahriya/butter-w1` en Hugging Face. Se define como un modelo fundacional "soberano" orientado a conversación bilingüe (inglés y bengalí, incluyendo banglish) y a la orquestación de agentes, con un formato de razonamiento explícito mediante etiquetas `<think>...</think>`. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors para la librería transformers.

La propuesta técnica se centra en tres mecanismos propios del ecosistema MUKHON: la delegación de tareas de seguridad y filtrado de fraude a un submodelo ONNX denominado `MUKHON-AI-Guardian-v1` (con latencia declarada inferior a 20 ms), el tool calling mediante el protocolo MCP con etiquetas `<tool_call>`, y el enrutado dinámico de habilidades mediante `<skill_call>`. Estos mecanismos están diseñados para integrarse con herramientas del ecosistema como SafePay Escrow, el sistema de identidad de confianza en seis niveles o la verificación de hechos en vivo.

La información pública disponible es muy limitada: el repositorio ocupa 0,2 GB, no registra descargas ni interacciones, y la model card no incluye datos sobre arquitectura, número de parámetros, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha recoge exclusivamente lo declarado por el autor y marca como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni híbrida) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), bengalí (bn) y banglish (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo: la model card no indica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante, ni tampoco el número de parámetros, capas o cabezas de atención. El tamaño del repositorio (0,2 GB) sugiere un modelo de pequeña escala, pero este dato por sí solo no permite determinar la arquitectura ni el número de parámetros con fiabilidad.

Tampoco se detallan los datos de entrenamiento: no se especifica el volumen de tokens, la composición del corpus, la proporción entre inglés y bengalí, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La única información técnica declarada por el autor se refiere al formato de razonamiento (`<think>...</think>`), a los protocolos de agente (`<tool_call>` para JSON de MCP y `<skill_call>` para el enrutador de habilidades) y a la delegación en el submodelo ONNX `MUKHON-AI-Guardian-v1` para el filtrado de seguridad, fraude y rumores con una latencia declarada inferior a 20 ms.

## Capacidades

- Generación de texto conversacional en inglés, bengalí y banglish, orientada a asistencia en ingeniería de software.
- Razonamiento explícito paso a paso mediante el bloque `<think>...</think>`, que expone la cadena de pensamiento antes de la respuesta.
- Tool calling mediante el protocolo MCP, con invocaciones emitidas en etiquetas `<tool_call>` y payload en JSON.
- Orquestación de submodelos: delega el cribado de seguridad, fraude y rumores al submodelo ONNX `MUKHON-AI-Guardian-v1`.
- Enrutado autónomo de habilidades mediante `<skill_call>`, con carga dinámica de habilidades declaradas como `mukhon-security`, `mukhon-docs`, `mukhon-api`, `mukhon-testing`, `mukhon-performance` y `mukhon-backend`.
- Integración declarada con herramientas del ecosistema MUKHON: SafePay Escrow, identidad de confianza soberana en seis niveles, verificación de hechos en vivo y herramientas de feed.
- El autor afirma "cero falsos positivos" en el disparo de herramientas, si bien no se aportan datos que respalden esta afirmación.
- No se declaran capacidades de visión, audio, matemáticas avanzadas ni generación de código más allá de la asistencia conversacional en ingeniería de software.

## Casos de uso

- Asistente de conversación bilingüe inglés-bengalí: el modelo está entrenado explícitamente para alternar entre inglés, bengalí y banglish, lo que lo hace adecuado para atención a usuarios de Bangladesh en su idioma nativo sin necesidad de traducción intermedia.
- Orquestador de agentes con tool calling: gracias al formato `<tool_call>` compatible con MCP, puede integrarse como capa de decisión en un pipeline de agentes que invoque herramientas externas (pagos, verificación de identidad, consultas a APIs) y devuelva las llamadas en JSON estructurado.
- Cribado de seguridad y fraude en tiempo real: la delegación en `MUKHON-AI-Guardian-v1` con latencia declarada inferior a 20 ms permite usar el modelo como primera barrera en flujos de mensajería o pagos donde sea necesario detectar estafas o rumores antes de responder al usuario.
- Asistencia a desarrolladores en el ecosistema MUKHON: el enrutado `<skill_call>` hacia habilidades como `mukhon-api`, `mukhon-testing` o `mukhon-backend` permite ofrecer ayuda contextual sobre las APIs y convenciones internas de la plataforma.
- Moderación de comunidades con verificación de hechos: la capacidad declarada de fact-checking en vivo mediante herramientas MCP encaja en flujos de moderación donde el modelo debe contrastar una afirmación antes de publicarla o responderla.
- Escrow y pagos con identidad verificada: la integración con SafePay Escrow y el sistema de confianza en seis niveles permite construir asistentes que gestionen transacciones condicionadas a la verificación de identidad del interlocutor.
- Razonamiento auditable: el bloque `<think>...</think>` facilita la revisión posterior de las decisiones del modelo en entornos donde se requiere trazabilidad del razonamiento, como soporte técnico o cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,2 GB) sugiere que el modelo podría ejecutarse en GPU de consumo, pero al desconocerse el número de parámetros y la precisión de los pesos no es posible dar una cifra fiable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamaño del repositorio es plausible que quepa en tarjetas con 8-16 GB de VRAM, pero se trata de una estimación no verificada.
- Opciones de despliegue: la librería declarada es transformers, por lo que el despliegue estándar sería mediante `transformers` y, potencialmente, servidores compatibles como TGI o vLLM. No se confirma soporte de llama.cpp, Ollama ni GGUF, ya que no se declaran cuantizaciones.
- Latencia y throughput: no disponibles. La única cifra de latencia publicada corresponde al submodelo externo `MUKHON-AI-Guardian-v1` (<20 ms), no al modelo principal.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables ni se han publicado métricas que permitan situar a Butter W1 frente a alternativas de su misma categoría o tamaño.

## Limitaciones y advertencias

- Ausencia total de datos técnicos verificables: no se publican parámetros, contexto, arquitectura ni dataset, lo que impide evaluar su calidad o idoneidad para producción.
- Sin benchmarks ni evaluaciones independientes: las afirmaciones de la model card (por ejemplo, "cero falsos positivos" en el disparo de herramientas) no están respaldadas por métricas publicadas.
- Ecosistema cerrado: las capacidades de orquestación (`<tool_call>`, `<skill_call>`, `MUKHON-AI-Guardian-v1`) están diseñadas para herramientas propietarias del ecosistema MUKHON, lo que limita su utilidad fuera de ese entorno.
- Cobertura lingüística restringida a inglés y bengalí; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinación no cuantificado: al no existir evaluaciones publicadas, no es posible estimar la tasa de errores factuales.
- Sesgos desconocidos: no se documenta la composición del corpus ni los procesos de alineación, por lo que no pueden evaluarse sesgos lingüísticos o culturales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar si las herramientas externas del ecosistema MUKHON tienen licencias separadas.
- Repositorio sin tracción: cero descargas y cero interacciones en el momento de la consulta, lo que reduce la probabilidad de encontrar reportes de uso o incidencias resueltas por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/realshahriya/butter-w1
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos del modelo.
