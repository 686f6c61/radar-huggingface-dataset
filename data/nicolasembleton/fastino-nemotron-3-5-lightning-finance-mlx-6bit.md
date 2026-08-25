# nicolasembleton/Fastino-Nemotron-3.5-Lightning-Finance-MLX-6bit

## Resumen

Fastino-Nemotron-3.5-Lightning-Finance-MLX-6bit es una conversión a formato MLX del modelo especializado en finanzas Fastino-Nemotron-3.5-Lightning-Finance, desarrollado por Fastino en colaboración con NVIDIA. El modelo original es una adaptación de NVIDIA Nemotron 3.5 Lightning, un modelo de 30.000 millones de parámetros con arquitectura mixture-of-experts (MoE) de solo 3.000 millones de parámetros activos, afinado específicamente para razonamiento financiero, extracción de información y tareas de investigación en el dominio financiero.

Esta versión MLX, creada por nicolasembleton, aplica cuantización de 6 bits con grupo de tamaño 64, lo que reduce el tamaño del modelo a aproximadamente 25,7 GB y lo hace ejecutable en hardware de consumo con Apple Silicon mediante la librería mlx-lm. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y hereda la especialización financiera del modelo base, que fue afinado mediante el agente autónomo de Fine-Tuning de Fastino.

La relevancia de este modelo radica en su capacidad de ejecutar tareas financieras complejas con un coste computacional reducido gracias a su arquitectura MoE con solo 3B activos, lo que lo hace especialmente adecuado para agentes de IA siempre activos y despliegues de alto volumen donde se necesita razonamiento especializado en el dominio financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Nemotron-H |
| Parametros totales | 6.914.599.488 (conversion MLX) / 30B (modelo base) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6-bit affine, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Fastino-Nemotron-3.5-Lightning-Finance es una adaptacion de NVIDIA Nemotron 3.5 Lightning, una arquitectura MoE de 30B parametros con solo 3B activos por token, disenada para tareas especializadas en agentes siempre activos. La arquitectura Nemotron-Ho es una variante del transformer con mezcla de expertos que reduce el coste computacional por token mientras mantiene la capacidad de un modelo mucho mayor.

El afinamiento se realizo con el Fastino Fine-Tuning Agent, un agente autonomo que curo datos, genero y entreno recetas de entrenamiento candidatas, evaluo cada una en tareas objetivo y de transferencia, y uso cada fallo diagnosticado para disenar el siguiente experimento. Los datos de post-entrenamiento del modelo base tienen una fecha de corte de mayo de 2026. El proceso de afinamiento se documento en el blog de Fastino, donde tambien se creo un modelo equivalente para el dominio medico.

La conversion a MLX se realizo con mlx-lm version 0.31.3, aplicando cuantizacion de 6 bits con grupo de 64, lo que reduce el peso de 6.914.599.488 parametros totales a un repositorio de 25,7 GB.

## Capacidades

- Razonamiento financiero especializado: analisis de estados financieros, interpretacion de metricas economicas y extraccion de informacion relevante del dominio.
- Extraccion de datos estructurados: capacidad de extraer entidades, relaciones y datos numericos de textos financieros no estructurados.
- Investigacion financiera: sintetiza informacion de multiples fuentes para responder preguntas complejas sobre mercados, empresas e instrumentos financieros.
- Generacion de texto conversacional: soporta chat multi-turno mediante la plantilla de chat de Nemotron.
- Ejecucion eficiente en Apple Silicon: formato MLX optimizado para GPU de Apple, con cuantizacion de 6 bits que reduce requisitos de memoria.
- Especializacion de dominio sin perder generalidad: el afinamiento con Fastino Fine-Tuning Agent evaluo tareas de transferencia para preservar capacidades generales.

## Casos de uso

- Analisis de documentos financieros: el modelo puede procesar informes anuales, 10-K y comunicados de resultados para extraer metricas clave, detectar tendencias y generar resumenes ejecutivos. Su especializacion en extraccion financiera lo hace adecuado para automatizar la lectura de documentos largos en el sector.
- Asistente de investigacion para analistas: los analistas pueden consultar al modelo sobre datos historicos, comparativas entre empresas o interpretacion de indicadores economicos, recibiendo respuestas contextualizadas en el dominio financiero.
- Chatbot de atencion al cliente en banca: la arquitectura MoE con 3B activos permite despliegues de alta concurrencia con baja latencia, adecuado para responder consultas de clientes sobre productos financieros, estados de cuenta y procedimientos bancarios.
- Extraccion de datos para plataformas fintech: integracion en pipelines de procesamiento de datos para convertir documentos financieros no estructurados en datos estructurados para bases de datos o sistemas de business intelligence.
- Generacion de informes de analisis de mercado: el modelo puede redactar informes periodicos sobre evolucion de indices, sectores o instrumentos concretos, reduciendo el trabajo manual de los analistas.
- Agente de investigacion en estudios de mercado: combinado con herramientas de busqueda, el modelo puede recopilar y sintetizar informacion sobre competidores, tamaños de mercado y regulaciones para estudios de viabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base no incluye tablas de evaluacion comparativa, y la conversion MLX no proporciona datos de rendimiento propios.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 25,7 GB en cuantizacion 6-bit, por lo que se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo con margen para el contexto y los estados intermedios.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra o posterior) para ejecucion nativa MLX. No se recomienda GPU NVIDIA para este formato, aunque el modelo base puede ejecutarse en GPU NVIDIA con otros formatos.
- En consumer GPU: no se recomienda en GPU de consumo, dado que el formato MLX esta orientado a Apple Silicon. El modelo base en FP16 requeriria unos 60 GB de VRAM, fuera del rango de GPUs consumer.
- Opciones de despliegue: mlx-lm para inferencia local en macOS; el modelo base puede desplegarse con vLLM, TGI o llama.cpp si se convierte a los formatos correspondientes.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque la arquitectura MoE con 3B activos sugiere una latencia menor que un modelo denso de 30B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Especializacion | Licencia |
|---|---|---|---|---|---|
| Fastino-Nemotron-3.5-Lightning-Finance | 30B | 3B | no disponible | Finanzas | Apache 2.0 |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B | 30B | 3B | no disponible | Generalista | Apache 2.0 |
| Fastino-Nemotron-3.5-Lightning-Medical | 30B | 3B | no disponible | Medicina | Apache 2.0 |

El modelo financiero comparte arquitectura con el generalista de NVIDIA y con el modelo medico de Fastino, diferenciandose en el afinamiento especializado. La ventaja del modelo financiero frente al generalista es su mayor precision en tareas del dominio, aunque sacrifica capacidades generales en otras areas. Frente al modelo medico, la eleccion depende exclusivamente del dominio de aplicacion.

## Limitaciones y advertencias

- La fecha de corte de los datos de post-entrenamiento es mayo de 2026, por lo que el modelo no conocera eventos financieros posteriores a esa fecha.
- La cuantizacion de 6-bit puede introducir perdidas de precision en tareas numericas complejas, un aspecto critico en aplicaciones financieras.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues con documentos extensos.
- Los idiomas soportados no estan documentados, por lo que se recomienda validar el rendimiento en el idioma de produccion antes del despliegue.
- El modelo esta afinado para el dominio financiero, por lo que puede mostrar un rendimiento degradado en tareas fuera de este ambito.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas de este modelo. En el dominio financiero, las alucinaciones pueden tener consecuencias economicas, por lo que se recomienda implementar validaciones externas en produccion.
- El formato MLX es especifico de Apple Silicon, lo que limita la portabilidad a otros entornos de despliegue.

## Enlaces

- Modelo MLX en HuggingFace: https://huggingface.co/nicolasembleton/Fastino-Nemotron-3.5-Lightning-Finance-MLX-6bit
- Modelo base: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Finance
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Blog de Fastino sobre el afinamiento: https://fastino.ai/blog/learnings-from-fine-tuning-nvidia-nemotron-3.5-lightning-with-autonomous-agent
- Pagina de modelos de Fastino: https://fastino.ai/models
- Pagina de NVIDIA Nemotron: https://developer.nvidia.com/topics/ai/nemotron
