# qianqianzhisuan/custos-1.0

## Resumen

Custos 1.0 (nombre interno Custos-nesc-v1.2.5) es un ajuste fino de dominio de Qwen3.5-9B orientado a operaciones de ciberseguridad en entornos de gobierno y empresa. Lo publica el usuario de Hugging Face qianqianzhisuan como pesos BF16 en formato safetensors, cargables con Transformers y vLLM. El modelo parte de una base densa de 9 000 millones de parametros y hereda de ella la ventana de contexto y el tokenizador, aunque la model card no documenta ni el contexto efectivo ni la composicion del corpus de ajuste.

El problema que aborda es la asistencia al analista de seguridad: triaje de logs y alertas, reconstruccion de cadenas de ataque, interpretacion de vulnerabilidades, redaccion de materiales de cumplimiento y apoyo a la respuesta ante incidentes. No es un modelo generalista ni un escaner: el autor lo presenta explicitamente como ayuda al juicio humano, sin sustituir el analisis tecnico ni las conclusiones de auditoria.

Su relevancia actual es limitada pero concreta: los modelos de seguridad de dominio suelen publicarse con licencias restrictivas, mientras que este se distribuye bajo Apache-2.0 sobre una base tambien Apache-2.0, lo que facilita su evaluacion y despliegue interno. La contrapartida es la ausencia total de benchmarks, de documentacion de entrenamiento y de traccion en la comunidad (cero descargas y cero likes en el momento del registro), por lo que cualquier adopcion exige validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-9B); detalles no disponibles |
| Parametros totales | 9B (segun el nombre del modelo base Qwen3.5-9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos publicados en BF16; cuantizaciones GGUF/AWQ/GPTQ no documentadas. Existe variante MLX 16-bit en repositorio aparte |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors BF16 en 4 fragmentos (sharded) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso de 9 000 millones de parametros; la model card no especifica numero de capas, dimensiones ocultas, tipo de atencion ni estrategia de posicionamiento. El ajuste consiste en entrenamiento adicional supervisado sobre la base para especializarla en seguridad, segun la descripcion del autor ("网络安全垂域微调", ajuste fino de dominio de ciberseguridad). No se documenta el volumen de tokens de ajuste, la composicion del dataset, el uso de RLHF/DPO, ni si hubo entrenamiento con datos sinteticos de incidentes.

Tampoco se detallan innovaciones tecnicas propias: el repositorio no introduce decodificacion especulativa, atencion lineal ni modulos adicionales. La unica variante distribuida es una conversion a MLX 16-bit para Apple Silicon, publicada en un repositorio separado. La ausencia de informacion sobre el proceso de entrenamiento impide auditar riesgos de sobreajuste al dominio o de contaminacion de datos.

## Capacidades

- Generacion de texto y razonamiento tecnico en chino e ingles, orientado a terminologia de seguridad.
- Triaje y correlacion de logs y alertas: interpretacion de eventos, priorizacion y resumen de senales.
- Reconstruccion de cadenas de ataque y trazado de indicadores de compromiso a partir de descripciones textuales.
- Analisis de vulnerabilidades: explicacion de CVE, vectores de explotacion y evaluacion de impacto cualitativa.
- Redaccion de materiales de cumplimiento y autoevaluacion normativa.
- Apoyo a la respuesta ante incidentes: propuestas de contencion, erradicacion y revision post-incidente.
- Soporte de tool calling / function calling: no documentado en la model card.
- Modo de razonamiento extendido (thinking), vision o audio: no documentado.
- Capacidades de agente multi-paso: no documentadas; el modelo se presenta como asistente de analisis, no como orquestador autonomo.

## Casos de uso

- Triaje de alertas SIEM: el modelo recibe el texto de alertas y eventos correlacionados y genera una ficha de triaje con severidad propuesta, hipotesis de causa y siguientes pasos, reduciendo el tiempo de clasificacion manual del analista de nivel 1.
- Enriquecimiento de tickets de SOC: a partir de la descripcion libre de un incidente, produce un resumen estructurado con activos afectados, tecnicas MITRE ATT&CK candidatas y evidencias a recopilar.
- Explicacion de vulnerabilidades para equipos no tecnicos: traduce avisos de CVE y notas de parche a lenguaje operativo para priorizar ventanas de mantenimiento en entornos corporativos.
- Redaccion de informes de cumplimiento: genera borradores de autoevaluacion y documentacion de controles a partir de notas internas, siempre sujetos a revision por el responsable de seguridad.
- Apoyo a la respuesta a incidentes: propone secuencias de contencion y erradicacion adaptadas al escenario descrito, utiles como lista de comprobacion para el equipo de guardia.
- Revision post-incidente: convierte cronologias y notas dispersas en un informe estructurado con linea temporal, causa raiz propuesta y lecciones aprendidas.
- Formacion interna: genera escenarios de ejercicios y preguntas de evaluacion sobre procedimientos de seguridad en chino o ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 18 GB solo para pesos, mas cache KV; en la practica se recomienda un minimo de 24 GB para contexto corto y por encima de 40 GB para contextos largos.
- VRAM estimada en FP8/INT8 (si se generan cuantizaciones propias): en torno a 10-12 GB de pesos, con margen adicional para cache.
- VRAM estimada en INT4 (cuantizacion no oficial): alrededor de 5-6 GB de pesos, aunque la calidad en dominio de seguridad no esta validada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G 24 GB para BF16 con contexto moderado.
- GPU de consumo: una RTX 4090 de 24 GB puede cargar los pesos BF16 con contexto limitado; una RTX 3090 de 24 GB queda en el limite. Para 16 GB o menos seria necesaria cuantizacion, no publicada por el autor.
- Despliegue: vLLM (`vllm serve qianqianzhisuan/custos-1.0 --trust-remote-code`) y Transformers con `device_map="auto"`. En Apple Silicon, la variante MLX 16-bit del repositorio `custos-1.0-mlx`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Custos 1.0 | 9B | No disponible | Ajuste fino en ciberseguridad sobre Qwen3.5-9B | Apache-2.0 | Hugging Face y ModelScope (variante MLX) |
| Qwen3.5-9B (base) | 9B | No disponible en la informacion | Modelo generalista multilingue | Apache-2.0 | Hugging Face |
| Alternativas de seguridad de dominio | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos de seguridad comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publica de mejora frente a Qwen3.5-9B en tareas de seguridad; la especializacion debe validarse con un conjunto de evaluacion propio antes de cualquier uso en produccion.
- Riesgo de alucinacion critico en el dominio: el modelo puede inventar identificadores CVE, rutas de registro, comandos o referencias normativas con apariencia plausible. Toda salida tecnica requiere verificacion contra fuentes primarias.
- Cobertura linguistica limitada a chino e ingles; el rendimiento en castellano no esta documentado ni garantizado.
- Contexto efectivo desconocido: la model card no declara la ventana, lo que impide planificar cargas de logs extensos sin pruebas previas.
- Sin informacion sobre el dataset de ajuste: no es posible evaluar sesgos, contaminacion ni sobreajuste a un unico corpus de incidentes.
- No sustituye controles tecnicos: el autor advierte que el modelo no reemplaza escaneos, acciones de contencion ni conclusiones de auditoria; su uso debe ser asistivo y con supervision humana.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor no declara la titularidad del desarrollo ni certificaciones; conviene revisar las obligaciones de atribucion de la base Qwen.
- Traccion nula en la comunidad (cero descargas y cero likes al registro): no existe retroalimentacion publica sobre calidad o estabilidad.
- El uso de `trust_remote_code=True` implica ejecutar codigo del repositorio; auditar antes en entornos sensibles.

## Enlaces

- Repositorio principal en Hugging Face: https://huggingface.co/qianqianzhisuan/custos-1.0
- Variante MLX 16-bit en Hugging Face: https://huggingface.co/qianqianzhisuan/custos-1.0-mlx
- Variante MLX en ModelScope: https://modelscope.cn/models/qianqianzhisuan123/custos-1.0-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
