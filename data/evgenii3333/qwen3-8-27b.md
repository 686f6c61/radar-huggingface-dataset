# Evgenii3333/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo denso de lenguaje y vision de 27.800 millones de parametros, desarrollado por el equipo Qwen (Alibaba) como parte de la generacion Qwen3.8. Se presenta como un modelo nativo vision-lenguaje que comprende imagenes y videos, con control flexible del modo de razonamiento, disenado para tareas de codificacion, trabajo profesional, investigacion y agentes autonomos de larga duracion. El repositorio proporcionado (Evgenii3333/Qwen3.8-27B) contiene los pesos post-entrenados en formato transformers, compatibles con vLLM, SGLang y TokenSpeed.

La arquitectura es hibrida: de las 64 capas, solo 16 usan atencion completa (Gated Attention) y las otras 48 usan atencion lineal recurrente (Gated DeltaNet), lo que reduce el coste computacional frente a un transformer denso clasico. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000. Incluye Multi-Token Prediction (MTP) y soporte de vision integrado, lo que lo posiciona como una alternativa local competitiva frente a modelos propietarios mucho mayores. Segun los analisis publicos, supera a Muse Glimmer-30B en los 8 benchmarks comparados y a Opus4.6 Max en 15 de 19 pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas de atencion completa (Gated Attention) + 48 capas de atencion lineal (Gated DeltaNet), con vision encoder |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponibles en la documentacion; el repositorio ofrece pesos BF16 (safetensors, 55,6 GB). Analisis publicos indican que versiones cuantizadas requieren ~17 GB de VRAM |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, compatible con vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B usa una arquitectura hibrida de atencion que combina dos mecanismos: Gated DeltaNet (atencion lineal con estado recurrente constante) en 48 de las 64 capas, y Gated Attention (atencion completa con Grouped Query Attention, 24 cabezas Q y 4 cabezas KV de dimension 256) en las 16 restantes. La distribucion sigue el patron `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, lo que reduce significativamente el coste de memoria de la clave-valor en contextos largos. La dimension oculta es de 5.120 y el FFN de 17.408. El modelo incorpora un vision encoder para entrada de imagenes y videos, y un mecanismo de Multi-Token Prediction (MTP) entrenado con multiples pasos que permite predecir varios tokens por iteracion.

La etapa de entrenamiento incluye pre-entrenamiento y post-entrenamiento. El modo de pensamiento (thinking) esta activado por defecto y puede desactivarse por peticion, con parametros de control como `reasoning_effort` para ajustar la profundidad del razonamiento y `preserve_thinking` para retener el contexto de razonamiento en mensajes historicos. El modelo se entrena para ejecutar tareas agente de larga duracion, con mayor robustez en la planificacion autonoma y el manejo de feedback del entorno.

## Capacidades

- Generacion de texto y razonamiento complejo en tareas profesionales, de investigacion y de codificacion.
- Comprension nativa de vision: interpreta imagenes (diagramas STEM, documentos) y videos de hasta horas de duracion.
- Modo de pensamiento flexible: activable y desactivable por peticion, con control de profundidad mediante `reasoning_effort`.
- Codificacion agente en terminal: ejecuta tareas de codificacion de extremo a extremo, planificando y manejando feedback del entorno (benchmark Terminal Bench 2.1).
- Soporte de herramientas y agentes: compatible con harnesses y herramientas de desarrollo populares para integracion en pipelines de agentes.
- Multi-Token Prediction (MTP): genera multiples tokens por paso, mejorando el throughput y la coherencia en generacion larga.
- Contexto largo: 262K tokens nativos, extensible a 1M con la API gestionada de Qwen Cloud.

## Casos de uso

- Desarrollo de codigo asistido en local: un desarrollador puede ejecutar Qwen3.8-27B en una estacion de trabajo con GPU de 24 GB para obtener sugerencias de codigo, refactorizacion y generacion de funciones completas sin depender de servicios en la nube. Su modo de razonamiento desactivable permite elegir entre respuestas rapidas o analisis profundo.

- Agente de terminal autonomo: el modelo puede recibir tareas de terminal (instalar dependencias, ejecutar tests, corregir errores de compilacion) y completarlas de extremo a extremo gracias a su capacidad de codificacion agente y de planificacion de multiples pasos, integrable en pipelines de CI/CD.

- Analisis de documentos tecnicos con vision: gracias a su vision encoder y su contexto de 262K tokens, puede procesar documentos cientificos con diagramas, graficos y tablas, extrayendo informacion estructurada o respondiendo preguntas sobre el contenido.

- Analisis de video de larga duracion: el modelo puede procesar videos de hasta una hora, lo que permite aplicaciones de transcripcion, resumen y busqueda de eventos en grabaciones de reuniones, vigilancia o material educativo.

- Atencion al cliente con contexto largo: con 262K tokens de ventana, puede mantener conversaciones multi-turno con historial completo de la sesion y documentos de referencia, reduciendo la perdida de contexto en interacciones prolongadas.

- Agente de investigacion autonomo: el modelo puede planificar y ejecutar tareas de investigacion en multiples pasos, consultando fuentes, resumiendo hallazgos y generando informes estructurados, gracias a su soporte de agentes y razonamiento profundo.

- Generacion de codigo en produccion con tool calling: integrado en un entorno de desarrollo, el modelo puede invocar funciones externas (APIs, bases de datos, herramientas de testing) para completar tareas de codigo de forma automatica, con control de `reasoning_effort` para ajustar el coste de cada peticion.

## Benchmarks y rendimiento

La documentacion del modelo incluye una tabla comparativa de benchmarks con valores parciales no disponibles en la informacion proporcionada. La tabla compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, organizada por capacidades (codificacion, trabajo profesional, investigacion, agentes y vision). El primer benchmark documentado es Terminal Bench 2.1 (Terminus) para codificacion agente en terminal, con valores no visibles en el material proporcionado.

Segun los analisis publicos citados en la busqueda web:

- Qwen3.8-27B supera a Muse Glimmer-30B en los 8 benchmarks de comparacion directa.
- Qwen3.8-27B supera a Opus4.6 Max en 15 de las 19 pruebas conanadas.
- El modelo consigue rendimiento competitivo con modelos 10-15 veces mayores, manteniendo requisitos de despliegue practicos (24 GB VRAM minimo).

No se dispone de resultados numericos completos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 55,6 GB para pesos BF16 completos; ~24 GB VRAM minimo para inferencia practica (segun Local AI Zone); ~17 GB VRAM para versiones cuantizadas (segun Geeky Gadgets).
- GPU recomendadas: RTX 4090 (24 GB) para cuantizacion, A100 40 GB o H100 para pesos BF16 completos. El modelo es compatible con GPUs AMD Ryzen AI MAX y Radeon (AMD ha publicado una guia de despliegue day-0).
- En consumer GPU: si, con cuantizacion Q4/Q5 en tarjetas de 24 GB (RTX 4090, RTX 5090) o en configuraciones de 17 GB con cuantizacion agresiva.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed. El repositorio es compatible con estos frameworks de forma directa.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura hibrida con atencion lineal en 48 de 64 capas reduce el coste de memoria en contextos largos, mejorando la velocidad en comparacion con un transformer denso clasico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B | 27,78 B | 262K (1M ext.) | Hibrido DeltaNet + Attention | Apache 2.0 |
| Qwen3.6-27B | 27 B (estimado) | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30 B | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

Segun los analisis publicos, Qwen3.8-27B supera a Muse Glimmer-30B en todos los benchmarks comparados y a Opus4.6 Max en la mayoria de las pruebas, a pesar de ser un modelo de menor tamano. La comparativa directa con Qwen3.6-27B (generacion anterior) se documenta en la tabla de benchmarks del modelo, pero los valores numericos no estan disponibles en el material proporcionado.

## Limitaciones y advertencias

- El repositorio proporcionado (Evgenii3333/Qwen3.8-27B) no es el repositorio oficial del modelo; el repositorio oficial es Qwen/Qwen3.8-27B. Verificar la procedencia de los pesos antes de usarlos en produccion.
- Los idiomas soportados no estan especificados en la documentacion proporcionada; se recomienda validar el rendimiento en el idioma de uso.
- El contexto de 1M tokens requiere la version gestionada de Qwen Cloud o configuraciones especificas; no esta garantizado con la configuracion estandar de los frameworks de despliegue.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos de la version gestionada de Qwen Cloud si se usa el servicio alojado.
- No se han publicado resultados de benchmarks numericos completos en la informacion disponible, por lo que las afirmaciones de rendimiento se basan en analisis publicos de terceros y no en datos oficiales verificados.
- El modelo es un modelo de vision-lenguaje; no soporta entrada de audio sin un adaptador adicional no documentado.
- Los pesos BF16 ocupan 55,6 GB, lo que requiere infraestructura significativa para despliegue en precision completa; la cuantizacion puede degradar ligeramente el rendimiento en tareas de vision de alta precision.

## Enlaces

- Repositorio proporcionado: https://huggingface.co/Evgenii3333/Qwen3.8-27B
- Repositorio oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guia de despliegue en AMD Ryzen AI MAX y Radeon GPUs: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Analisis de Geeky Gadgets: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
- Analisis tecnico de Local AI Zone: https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com/models/qwen3.8-27b
