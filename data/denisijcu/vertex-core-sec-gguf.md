# Denisijcu/vertex-core-sec-gguf

## Resumen

Vertex-Core-Sec (4B-GGUF) es un modelo de lenguaje de 4.022 millones de parámetros (4B) especializado en auditoría de seguridad de código estático, detección de vulnerabilidades (CWE y OWASP Top 10) y endurecimiento automatizado de código. Lo desarrolla Denis Sánchez Leyva (Vertex Coders LLC, Miami) como parte del ecosistema Vertex Intelligence Core (VIC), y se distribuye como un fine-tune del modelo base Qwen/Qwen3-4B-Instruct-2507.

El modelo resuelve un problema concreto: los asistentes generalistas suelen ofrecer recomendaciones de seguridad genéricas y teóricas, mientras que este fine-tune está orientado a producir parches de código seguros directamente aplicables en Python, FastAPI, TypeScript/JavaScript y C/C++. Se ha ajustado mediante QLoRA (r=16, α=16) con Unsloth sobre un dataset de vulnerabilidades de código abierto y commits públicos de remediación CWE.

Su relevancia práctica está en el formato de distribución: se publica únicamente en GGUF con cuantización q4_k_m, lo que permite ejecutarlo en GPU de consumo (el autor cita una GTX 1660 Ti de 6 GB de VRAM) y en pipelines de agentes locales tipo MCP. La licencia Apache 2.0 y el linaje de datos permisivo facilitan su uso comercial en herramientas DevSecOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); detalles internos de atención y capas no disponibles en la informacion proporcionada |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero la ficha no confirma el valor efectivo tras el fine-tune) |
| Tipos de cuantizacion | GGUF q4_k_m (única cuantización publicada en el repo) |
| Idiomas soportados | Ingles (en), espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 2,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4B parámetros. Sobre esa base se aplica un fine-tune supervisado con QLoRA de rango 16 y alpha 16, ejecutado con la librería Unsloth, que reduce el coste de memoria del ajuste y acelera el entrenamiento. No se documenta en la información disponible si hubo una fase adicional de RLHF o DPO más allá del dataset de preferencias empleado.

El corpus de entrenamiento se compone de `CyberNative/Code_Vulnerability_Security_DPO` y de commits públicos de remediación de CWE, ambos bajo licencias permisivas según el autor. El foco del dataset explica la orientación del modelo hacia la identificación de CWEs y la generación de código corregido en lugar de explicaciones teóricas. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni innovaciones arquitectónicas propias, ya que el modelo no introduce cambios estructurales respecto a su base.

## Capacidades

- Detección de vulnerabilidades en código Python, JavaScript/TypeScript y C/C++: inyección SQL, inyección de comandos, RCE, XSS, desbordamientos de buffer y path traversal.
- Clasificación y explicación de riesgos según CWE y OWASP Top 10, incluyendo el vector de explotación.
- Generación de remediaciones de código seguras y directamente aplicables ("drop-in"), no solo recomendaciones genéricas.
- Auditoría de código estático en pipelines DevSecOps y revisión automatizada de pull requests.
- Ejecución local en GPU de consumo gracias a la cuantización q4_k_m.
- Integración en pipelines de agentes locales (el autor menciona MCP) y en LM Studio, Ollama y llama.cpp mediante plantilla ChatML.
- Soporte conversacional multi-turno en inglés y español.
- No se documenta soporte de tool calling, function calling nativo ni modo thinking explícito en la información proporcionada.

## Casos de uso

- Revisión de seguridad en CI/CD: integrado como paso de auditoría sobre el diff de un pull request, el modelo analiza el código modificado y devuelve hallazgos CWE junto con el parche corregido, bloqueando la fusión si detecta inyección SQL o de comandos.
- Auditoría de APIs FastAPI y servicios backend: dado un endpoint concreto, identifica validación de entrada insuficiente, deserialización insegura o exposición de secretos, y genera la versión endurecida del handler.
- Hardening de código C/C++ heredado: detección de desbordamientos de buffer y uso inseguro de funciones de copia, con propuesta de reemplazo por alternativas seguras y comprobación de límites.
- Formación y concienciación de equipos: el modelo explica el vector de explotación de cada hallazgo, lo que permite usarlo como revisor didáctico en revisiones de código internas.
- Agentes locales de seguridad: al ejecutarse en 4 bits sobre una GPU de 6 GB, puede desplegarse como auditor embebido en un agente MCP que analice repositorios sin enviar código a servicios externos, requisito habitual en entornos regulados.
- Triaje de hallazgos de SAST: se le pasa la salida de un escáner estático y el fragmento de código afectado para priorizar falsos positivos y generar la remediación concreta.
- Generación de parches en proyectos TypeScript/Node: revisión de XSS en plantillas y de path traversal en manejadores de ficheros, con reescritura del código vulnerable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización q4_k_m publicada (tamaño del repo: 2,5 GB), más overhead de contexto KV.
- GPU de consumo: el autor cita explícitamente una NVIDIA GTX 1660 Ti de 6 GB de VRAM como objetivo de ejecución.
- GPU profesionales: cabe holgadamente en RTX 3060/4060/4090, A100 y H100; en estas últimas el límite práctico será el throughput, no la memoria.
- Despliegue: LM Studio, Ollama y llama.cpp son las opciones documentadas por el autor. vLLM y TGI no se mencionan en la información disponible (vLLM requiere pesos en safetensors, no publicados en este repo).
- Latencia y throughput: no disponibles en la información proporcionada.
- Plantilla de prompt: ChatML (`<|im_start|>system ... <|im_end|>`), con un system prompt específico del modelo recomendado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Vertex-Core-Sec 4B | ~4B | No disponible | Auditoria de seguridad de codigo (CWE/OWASP) | Apache 2.0 | GGUF q4_k_m |
| Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible en esta ficha | Instrucciones generales, codigo y razonamiento | Apache 2.0 | safetensors, GGUF |
| Alternativas especializadas en seguridad de codigo de ~4-7B | No disponible | No disponible | Auditoria de seguridad | No disponible | No disponible |

La comparación cuantitativa con otros fine-tunes de seguridad no está disponible: no se han publicado benchmarks del modelo ni se dispone de datos verificables de alternativas equivalentes en la información proporcionada. Frente a su base Qwen3-4B-Instruct-2507, la diferencia esperable es la especialización en hallazgos CWE y remediación concreta, a costa de un rendimiento general potencialmente inferior fuera del dominio de seguridad.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas (benchmarks de detección, tasa de falsos positivos) que respalden las capacidades declaradas por el autor.
- Riesgo de alucinación relevante en un dominio crítico: puede inventar CWEs inexistentes, marcar como vulnerables fragmentos seguros o proponer parches que introduzcan nuevos fallos. Toda remediación debe revisarse por un humano antes de aplicarse.
- Cobertura limitada a los lenguajes declarados (Python, JavaScript/TypeScript, C/C++); el comportamiento en otros lenguajes no está documentado.
- Solo se distribuye en GGUF q4_k_m: la cuantización de 4 bits puede degradar la precisión en tareas de razonamiento sobre código largo; no hay pesos sin cuantizar disponibles.
- Idiomas limitados a inglés y español; el rendimiento en español no está evaluado de forma independiente.
- Longitud de contexto efectiva no confirmada tras el fine-tune; para auditorías de ficheros grandes conviene trocear el código.
- Uso previsto exclusivamente defensivo y de auditoría autorizada según el autor; el modelo podría emplearse para identificar vectores de ataque, lo que exige control de acceso en despliegues multiusuario.
- Licencia Apache 2.0 permisiva para uso comercial, pero el linaje de datos se declara como permisivo sin verificación independiente en la información disponible.
- Modelo con 92 descargas y 0 likes en el momento de la consulta: comunidad y validación externa mínimas.

## Enlaces

- HuggingFace: https://huggingface.co/Denisijcu/vertex-core-sec-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset citado por el autor: `CyberNative/Code_Vulnerability_Security_DPO` (referencia en la model card; no se proporciona URL directa)
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales del modelo.
